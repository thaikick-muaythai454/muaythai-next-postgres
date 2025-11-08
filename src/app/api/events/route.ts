import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/database/supabase/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Event as EventType, EventTicket } from '@/types/app.types';
import { withAdminAuth } from '@/lib/api/withAdminAuth';

/**
 * GET /api/events
 * ดูอีเวนต์ทั้งหมด
 * Query params:
 * - category: category_id (UUID)
 * - status: upcoming, ongoing, completed, cancelled
 * - published: true/false (default: true for public, false for all if admin)
 * - featured: true/false
 * - search: ค้นหาข้อความ
 * - limit: จำนวนที่ต้องการ
 * - offset: offset สำหรับ pagination
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check if user is authenticated and is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    const isAdmin = !authError && user ? await checkIsAdmin(supabase, user.id) : false;

    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('category');
    const status = searchParams.get('status');
    const publishedParam = searchParams.get('published');
    const featuredParam = searchParams.get('featured');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Default: show only published events for non-admin users
    const published = publishedParam === null 
      ? (!isAdmin ? true : undefined) 
      : publishedParam === 'true';

    let query = supabase
      .from('events')
      .select(`
        *,
        event_categories (
          id,
          name_thai,
          name_english,
          slug
        )
      `)
      .order('event_date', { ascending: true })
      .order('created_at', { ascending: false });

    // Apply published filter
    if (published !== undefined) {
      query = query.eq('is_published', published);
    }

    // Apply category filter
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    // Apply status filter
    if (status) {
      query = query.eq('status', status);
    }

    // Apply featured filter
    if (featuredParam === 'true') {
      query = query.eq('is_featured', true);
    }

    // Apply search filter
    if (search) {
      query = query.or(
        `name.ilike.%${search}%,name_english.ilike.%${search}%,description.ilike.%${search}%,location.ilike.%${search}%`
      );
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) {
      console.error('Get events error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch events' },
        { status: 500 }
      );
    }

    // Get tickets for each event
    if (data && data.length > 0) {
      const eventIds = data.map(e => e.id);
      const { data: tickets } = await supabase
        .from('event_tickets')
        .select('*')
        .in('event_id', eventIds)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      const typedTickets = (tickets ?? []) as EventTicket[];

      // Group tickets by event_id
      const ticketsByEvent = typedTickets.reduce<Record<string, EventTicket[]>>((acc, ticket) => {
        if (!acc[ticket.event_id]) {
          acc[ticket.event_id] = [];
        }
        acc[ticket.event_id].push(ticket);
        return acc;
      }, {});

      // Add tickets to events
      (data as EventType[]).forEach((event) => {
        event.tickets = ticketsByEvent[event.id] || [];
      });
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      count: data?.length || 0,
    });

  } catch (error) {
    console.error('Get events error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/events
 * สร้างอีเวนต์ใหม่ (Admin only)
 * Body: {
 *   slug: string (unique)
 *   name: string
 *   name_english?: string
 *   description?: string
 *   details?: string
 *   event_date: string (ISO timestamp)
 *   end_date?: string (ISO timestamp)
 *   location: string
 *   address?: string
 *   latitude?: number
 *   longitude?: number
 *   category_id?: UUID
 *   image?: string
 *   images?: string[]
 *   price_start?: number
 *   max_attendees?: number
 *   status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled' (default: 'upcoming')
 *   is_featured?: boolean (default: false)
 *   is_published?: boolean (default: false)
 * }
 */
const postEventHandler = withAdminAuth(async (
  request,
  _context,
  user
) => {
  try {
    const supabase = await createClient();
    const body = await request.json();
    
    const {
      slug,
      name,
      name_english,
      description,
      details,
      event_date,
      end_date,
      location,
      address,
      latitude,
      longitude,
      category_id,
      image,
      images = [],
      price_start,
      max_attendees,
      status = 'upcoming',
      is_featured = false,
      is_published = false,
    } = body;

    // Validation
    if (!slug || !name || !event_date || !location) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: slug, name, event_date, location' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['upcoming', 'ongoing', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate dates
    const eventDate = new Date(event_date);
    if (isNaN(eventDate.getTime())) {
      return NextResponse.json(
        { success: false, error: 'Invalid event_date format' },
        { status: 400 }
      );
    }

    if (end_date) {
      const endDate = new Date(end_date);
      if (isNaN(endDate.getTime())) {
        return NextResponse.json(
          { success: false, error: 'Invalid end_date format' },
          { status: 400 }
        );
      }
      if (endDate < eventDate) {
        return NextResponse.json(
          { success: false, error: 'end_date must be after or equal to event_date' },
          { status: 400 }
        );
      }
    }

    // Check if slug already exists
    const { data: existing } = await supabase
      .from('events')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Slug already exists' },
        { status: 400 }
      );
    }

    // Validate category_id if provided
    if (category_id) {
      const { data: category } = await supabase
        .from('event_categories')
        .select('id')
        .eq('id', category_id)
        .maybeSingle();

      if (!category) {
        return NextResponse.json(
          { success: false, error: 'Invalid category_id' },
          { status: 400 }
        );
      }
    }

    // Insert event
    const { data, error } = await supabase
      .from('events')
      .insert({
        slug,
        name,
        name_english: name_english || null,
        description: description || null,
        details: details || null,
        event_date: event_date,
        end_date: end_date || null,
        location,
        address: address || null,
        latitude: latitude || null,
        longitude: longitude || null,
        category_id: category_id || null,
        image: image || null,
        images: images || [],
        price_start: price_start || null,
        max_attendees: max_attendees || null,
        status,
        is_featured: is_featured || false,
        is_published: is_published || false,
        published_at: is_published ? new Date().toISOString() : null,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Create event error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create event', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data,
      message: 'สร้างอีเวนต์สำเร็จ',
    }, { status: 201 });

  } catch (error) {
    console.error('Create event error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
});

export { postEventHandler as POST };

// Helper function to check if user is admin
async function checkIsAdmin(supabase: SupabaseClient, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .maybeSingle();
  
  return data?.role === 'admin';
}