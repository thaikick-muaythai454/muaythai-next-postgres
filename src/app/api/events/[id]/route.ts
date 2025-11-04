import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/database/supabase/server';

/**
 * GET /api/events/[id]
 * ดูอีเวนต์เดียวพร้อม tickets
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser();
    const isAdmin = user ? await checkIsAdmin(await supabase, user.id) : false;

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
      .eq('id', id);

    // Non-admin users can only see published events
    if (!isAdmin) {
      query = query.eq('is_published', true);
    }

    const { data: event, error } = await query.maybeSingle();

    if (error) {
      console.error('Get event error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch event' },
        { status: 500 }
      );
    }

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    // Get tickets for this event
    const { data: tickets } = await supabase
      .from('event_tickets')
      .select('*')
      .eq('event_id', id)
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    // Increment view count
    await supabase
      .from('events')
      .update({ views_count: (event.views_count || 0) + 1 })
      .eq('id', id);

    return NextResponse.json({
      success: true,
      data: {
        ...event,
        tickets: tickets || [],
      },
    });

  } catch (error) {
    console.error('Get event error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/events/[id]
 * แก้ไขอีเวนต์ (Admin only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const isAdmin = await checkIsAdmin(await supabase, user.id);

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Get existing event
    const { data: existingEvent, error: fetchError } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (fetchError || !existingEvent) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

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
      images,
      price_start,
      max_attendees,
      status,
      is_featured,
      is_published,
    } = body;

    // Build update object
    const updateData: Record<string, unknown> = {};

    if (slug !== undefined) {
      // Check if new slug is unique (if different from current)
      if (slug !== existingEvent.slug) {
        const { data: slugExists } = await supabase
          .from('events')
          .select('id')
          .eq('slug', slug)
          .maybeSingle();

        if (slugExists) {
          return NextResponse.json(
            { success: false, error: 'Slug already exists' },
            { status: 400 }
          );
        }
        updateData.slug = slug;
      }
    }

    if (name !== undefined) updateData.name = name;
    if (name_english !== undefined) updateData.name_english = name_english;
    if (description !== undefined) updateData.description = description;
    if (details !== undefined) updateData.details = details;
    if (image !== undefined) updateData.image = image;
    if (images !== undefined) updateData.images = images;
    if (address !== undefined) updateData.address = address;
    if (latitude !== undefined) updateData.latitude = latitude;
    if (longitude !== undefined) updateData.longitude = longitude;
    if (price_start !== undefined) updateData.price_start = price_start;
    if (max_attendees !== undefined) updateData.max_attendees = max_attendees;
    if (is_featured !== undefined) updateData.is_featured = is_featured;
    if (location !== undefined) updateData.location = location;

    // Validate and update dates
    if (event_date !== undefined) {
      const eventDate = new Date(event_date);
      if (isNaN(eventDate.getTime())) {
        return NextResponse.json(
          { success: false, error: 'Invalid event_date format' },
          { status: 400 }
        );
      }
      updateData.event_date = event_date;
    }

    if (end_date !== undefined) {
      if (end_date === null) {
        updateData.end_date = null;
      } else {
        const endDate = new Date(end_date);
        if (isNaN(endDate.getTime())) {
          return NextResponse.json(
            { success: false, error: 'Invalid end_date format' },
            { status: 400 }
          );
        }
        const eventDate = updateData.event_date ? new Date(updateData.event_date as string) : new Date(existingEvent.event_date);
        if (endDate < eventDate) {
          return NextResponse.json(
            { success: false, error: 'end_date must be after or equal to event_date' },
            { status: 400 }
          );
        }
        updateData.end_date = end_date;
      }
    }

    // Validate category_id if provided
    if (category_id !== undefined) {
      if (category_id === null) {
        updateData.category_id = null;
      } else {
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
        updateData.category_id = category_id;
      }
    }

    // Validate status if provided
    if (status !== undefined) {
      const validStatuses = ['upcoming', 'ongoing', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { success: false, error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
          { status: 400 }
        );
      }
      updateData.status = status;
    }

    // Handle is_published
    if (is_published !== undefined) {
      updateData.is_published = is_published;
      // Set published_at if publishing for the first time
      if (is_published && !existingEvent.is_published) {
        updateData.published_at = new Date().toISOString();
      } else if (!is_published) {
        updateData.published_at = null;
      }
    }

    // Update event
    const { data, error } = await supabase
      .from('events')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update event error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update event', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data,
      message: 'แก้ไขอีเวนต์สำเร็จ',
    });

  } catch (error) {
    console.error('Update event error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/events/[id]
 * ลบอีเวนต์ (Admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const isAdmin = await checkIsAdmin(await supabase, user.id);

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Check if event exists
    const { data: existingEvent, error: fetchError } = await supabase
      .from('events')
      .select('id, name')
      .eq('id', id)
      .maybeSingle();

    if (fetchError || !existingEvent) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    // Delete event (cascade will delete tickets and related data)
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete event error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to delete event', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'ลบอีเวนต์สำเร็จ',
    });

  } catch (error) {
    console.error('Delete event error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to check if user is admin
async function checkIsAdmin(supabase: Awaited<ReturnType<typeof createClient>>, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .maybeSingle();
  
  return data?.role === 'admin';
}

