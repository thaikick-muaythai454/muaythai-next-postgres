/**
 * Event Waitlist API
 *
 * POST /api/events/[slug]/waitlist - Join waitlist
 * GET /api/events/[slug]/waitlist - Get user's waitlist status
 * DELETE /api/events/[slug]/waitlist - Leave waitlist
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/database/supabase/server";
import { SupabaseClient } from "@supabase/supabase-js";

// === Utility ===
const isUUID = (str: string): boolean =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

// === Helpers ===

async function getUser(supabase: SupabaseClient) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  return { user, error };
}

async function getEvent(supabase: SupabaseClient, slug: string) {
  const isId = isUUID(slug);
  let query = supabase
    .from("events")
    .select("id, name, event_date, status, is_published")
    .eq("is_published", true);

  query = isId ? query.eq("id", slug) : query.eq("slug", slug);
  return query.maybeSingle();
}

function getAvailableTickets(ticket: {
  quantity_available?: number | null;
  quantity_sold?: number | null;
}): number {
  return (ticket.quantity_available || 0) - (ticket.quantity_sold || 0);
}

async function getTicket(
  supabase: SupabaseClient,
  ticket_id: string,
  event_id: string
) {
  return await supabase
    .from("event_tickets")
    .select(
      "id, event_id, name, quantity_available, quantity_sold, max_per_person, is_active"
    )
    .eq("id", ticket_id)
    .eq("event_id", event_id)
    .eq("is_active", true)
    .maybeSingle();
}

async function getExistingWaitlist(
  supabase: SupabaseClient,
  user_id: string,
  ticket_id: string
) {
  return await supabase
    .from("event_waitlist")
    .select("id, status")
    .eq("user_id", user_id)
    .eq("ticket_id", ticket_id)
    .eq("status", "waiting")
    .maybeSingle();
}

async function getWaitlistPosition(
  supabase: SupabaseClient,
  ticket_id: string,
  created_at: string
) {
  const { count } = await supabase
    .from("event_waitlist")
    .select("*", { count: "exact", head: true })
    .eq("ticket_id", ticket_id)
    .eq("status", "waiting")
    .lt("created_at", created_at);
  return (count || 0) + 1;
}

// === Main Handlers ===

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const supabase = await createClient();
    const { slug } = await params;
    const { user, error: authError } = await getUser(supabase);
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "กรุณาเข้าสู่ระบบ" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { ticket_id, ticket_count = 1 } = body;

    if (!ticket_id || !ticket_count || ticket_count < 1) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required fields: ticket_id, ticket_count (must be >= 1)",
        },
        { status: 400 }
      );
    }

    // Get and validate event
    const { data: event, error: eventError } = await getEvent(supabase, slug);
    if (eventError || !event) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }
    if (["cancelled", "completed"].includes(event.status)) {
      return NextResponse.json(
        { success: false, error: `Event is ${event.status}` },
        { status: 400 }
      );
    }
    if (new Date(event.event_date) < new Date()) {
      return NextResponse.json(
        { success: false, error: "Event date has passed" },
        { status: 400 }
      );
    }

    // Get and validate ticket
    const { data: ticket, error: ticketError } = await getTicket(
      supabase,
      ticket_id,
      event.id
    );
    if (ticketError || !ticket) {
      return NextResponse.json(
        { success: false, error: "Ticket not found or not available" },
        { status: 404 }
      );
    }
    const availableTickets = getAvailableTickets(ticket);
    if (availableTickets >= ticket_count) {
      return NextResponse.json(
        {
          success: false,
          error: "Tickets are still available. Please purchase directly.",
          available_tickets: availableTickets,
        },
        { status: 400 }
      );
    }
    if (ticket.max_per_person && ticket_count > ticket.max_per_person) {
      return NextResponse.json(
        {
          success: false,
          error: `Maximum ${ticket.max_per_person} tickets per person. Requested: ${ticket_count}`,
        },
        { status: 400 }
      );
    }

    // Ensure no existing waitlist entry
    const { data: existingWaitlist } = await getExistingWaitlist(
      supabase,
      user.id,
      ticket_id
    );
    if (existingWaitlist) {
      return NextResponse.json(
        {
          success: false,
          error: "You are already on the waitlist for this ticket",
          waitlist_id: existingWaitlist.id,
        },
        { status: 400 }
      );
    }

    // Insert waitlist entry
    const { data: waitlistEntry, error: waitlistError } = await supabase
      .from("event_waitlist")
      .insert({
        event_id: event.id,
        ticket_id,
        user_id: user.id,
        ticket_count,
        status: "waiting",
      })
      .select()
      .single();

    if (waitlistError) {
      console.error("Waitlist creation error:", waitlistError);
      return NextResponse.json(
        { success: false, error: "Failed to join waitlist" },
        { status: 500 }
      );
    }

    // Get waitlist position
    const position = await getWaitlistPosition(
      supabase,
      ticket_id,
      waitlistEntry.created_at
    );

    return NextResponse.json({
      success: true,
      data: {
        waitlist_id: waitlistEntry.id,
        position,
        ticket_count,
        event_name: event.name,
        ticket_name: ticket.name,
      },
    });
  } catch (error) {
    console.error("Waitlist API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const supabase = await createClient();
    const { slug } = await params;
    const { user, error: authError } = await getUser(supabase);
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const ticket_id = searchParams.get("ticket_id");
    if (!ticket_id) {
      return NextResponse.json(
        { success: false, error: "Missing ticket_id parameter" },
        { status: 400 }
      );
    }

    // Get the event using slug (ensures event exists and is published)
    const { data: event, error: eventError } = await getEvent(supabase, slug);
    if (eventError || !event) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    // Get waitlist entry for this event, ticket, and user
    const { data: waitlistEntry, error: waitlistError } = await supabase
      .from("event_waitlist")
      .select(
        `
        id,
        ticket_id,
        ticket_count,
        status,
        notified_at,
        expires_at,
        created_at,
        event:events(id, name),
        ticket:event_tickets(id, name, price)
      `
      )
      .eq("user_id", user.id)
      .eq("event_id", event.id)
      .eq("ticket_id", ticket_id)
      .eq("status", "waiting")
      .maybeSingle();

    if (waitlistError) {
      console.error("Waitlist query error:", waitlistError);
      return NextResponse.json(
        { success: false, error: "Failed to get waitlist status" },
        { status: 500 }
      );
    }

    if (!waitlistEntry) {
      return NextResponse.json({ success: true, data: null });
    }

    const position = await getWaitlistPosition(
      supabase,
      ticket_id,
      waitlistEntry.created_at
    );

    return NextResponse.json({
      success: true,
      data: {
        ...waitlistEntry,
        position,
      },
    });
  } catch (error) {
    console.error("Waitlist GET error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const supabase = await createClient();
    await params; // slug not used in DELETE, but required by route signature
    const { user, error: authError } = await getUser(supabase);
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const sug = searchParams.get("sug");
    const ticket_id = searchParams.get("ticket_id");
    const waitlist_id = searchParams.get("waitlist_id");

    let actualWaitlistId = waitlist_id;
    if (!actualWaitlistId && sug) {
      actualWaitlistId = sug;
    }

    if (!ticket_id && !actualWaitlistId) {
      return NextResponse.json(
        { success: false, error: "Missing ticket_id or waitlist_id parameter" },
        { status: 400 }
      );
    }

    let query = supabase
      .from("event_waitlist")
      .delete()
      .eq("user_id", user.id)
      .eq("status", "waiting");

    if (actualWaitlistId) {
      query = query.eq("id", actualWaitlistId);
    } else if (ticket_id) {
      query = query.eq("ticket_id", ticket_id);
    }

    const { error: deleteError } = await query;

    if (deleteError) {
      return NextResponse.json(
        { success: false, error: "Failed to leave waitlist" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Left waitlist successfully",
    });
  } catch (error) {
    console.error("Waitlist DELETE error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
