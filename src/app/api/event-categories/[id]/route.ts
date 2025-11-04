import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/database/supabase/server';
import { withAdminAuth } from '@/lib/api/withAdminAuth';

/**
 * GET /api/event-categories/[id]
 * ดึงหมวดหมู่อีเวนต์เดียว
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const { data: category, error } = await supabase
      .from('event_categories')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Get event category error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch event category' },
        { status: 500 }
      );
    }

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Event category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: category,
    });

  } catch (error) {
    console.error('Get event category error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/event-categories/[id]
 * แก้ไขหมวดหมู่อีเวนต์ (Admin only)
 */
const updateCategoryHandler = withAdminAuth<{ id: string }>(async (
  request,
  context,
  user
) => {
  try {
    const supabase = await createClient();
    const { id } = await context.params;
    const body = await request.json();

    const {
      name_thai,
      name_english,
      slug,
      description,
      description_en,
      icon,
      color,
      display_order,
      is_active,
    } = body;

    // Get existing category
    const { data: existingCategory, error: fetchError } = await supabase
      .from('event_categories')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (fetchError || !existingCategory) {
      return NextResponse.json(
        { success: false, error: 'Event category not found' },
        { status: 404 }
      );
    }

    // Check if slug is being changed and if it's unique
    if (slug && slug !== existingCategory.slug) {
      const { data: slugExists } = await supabase
        .from('event_categories')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();

      if (slugExists) {
        return NextResponse.json(
          { success: false, error: 'Slug already exists' },
          { status: 400 }
        );
      }
    }

    // Build update object
    const updateData: Record<string, unknown> = {};
    if (name_thai !== undefined) updateData.name_thai = name_thai;
    if (name_english !== undefined) updateData.name_english = name_english;
    if (slug !== undefined) updateData.slug = slug;
    if (description !== undefined) updateData.description = description;
    if (description_en !== undefined) updateData.description_en = description_en;
    if (icon !== undefined) updateData.icon = icon;
    if (color !== undefined) updateData.color = color;
    if (display_order !== undefined) updateData.display_order = display_order;
    if (is_active !== undefined) updateData.is_active = is_active;

    // Update category
    const { data: category, error } = await supabase
      .from('event_categories')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update event category error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update event category', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: category,
      message: 'แก้ไขหมวดหมู่อีเวนต์สำเร็จ',
    });

  } catch (error) {
    console.error('Update event category error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
});

/**
 * DELETE /api/event-categories/[id]
 * ลบหมวดหมู่อีเวนต์ (Admin only)
 */
const deleteCategoryHandler = withAdminAuth<{ id: string }>(async (
  request,
  context,
  user
) => {
  try {
    const supabase = await createClient();
    const { id } = await context.params;

    // Check if category exists
    const { data: existingCategory, error: fetchError } = await supabase
      .from('event_categories')
      .select('id, name_thai')
      .eq('id', id)
      .maybeSingle();

    if (fetchError || !existingCategory) {
      return NextResponse.json(
        { success: false, error: 'Event category not found' },
        { status: 404 }
      );
    }

    // Check if category is used by any events
    const { data: eventsUsingCategory } = await supabase
      .from('events')
      .select('id')
      .eq('category_id', id)
      .limit(1);

    if (eventsUsingCategory && eventsUsingCategory.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete category that is being used by events' },
        { status: 400 }
      );
    }

    // Delete category
    const { error } = await supabase
      .from('event_categories')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete event category error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to delete event category', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'ลบหมวดหมู่อีเวนต์สำเร็จ',
    });

  } catch (error) {
    console.error('Delete event category error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
});

export { updateCategoryHandler as PUT };
export { deleteCategoryHandler as DELETE };

