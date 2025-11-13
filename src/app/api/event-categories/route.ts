import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/database/supabase/server';
import { withAdminAuth } from '@/lib/api/withAdminAuth';

/**
 * GET /api/event-categories
 * ดึงหมวดหมู่อีเวนต์ทั้งหมด
 * Query params:
 * - active: true/false (filter by is_active)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const activeParam = searchParams.get('active');

    let query = supabase
      .from('event_categories')
      .select('*')
      .order('display_order', { ascending: true })
      .order('name_thai', { ascending: true });

    // Filter by active status if provided
    if (activeParam !== null) {
      const isActive = activeParam === 'true';
      query = query.eq('is_active', isActive);
    }

    const { data: categories, error } = await query;

    if (error) {
      console.error('Get event categories error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch event categories' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: categories || [],
    });

  } catch (error) {
    console.error('Get event categories error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/event-categories
 * สร้างหมวดหมู่อีเวนต์ใหม่ (Admin only)
 * Body: {
 *   name_thai: string
 *   name_english: string
 *   slug: string
 *   description?: string
 *   description_en?: string
 *   icon?: string
 *   color?: string
 *   display_order?: number
 *   is_active?: boolean
 * }
 */
const createCategoryHandler = withAdminAuth(async (
  request,
  _context,
  _user
) => {
  try {
    const supabase = await createClient();
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
      is_active = true,
    } = body;

    // Validation
    if (!name_thai || !name_english || !slug) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name_thai, name_english, slug' },
        { status: 400 }
      );
    }

    // Check if slug exists
    const { data: existingCategory } = await supabase
      .from('event_categories')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (existingCategory) {
      return NextResponse.json(
        { success: false, error: 'Slug already exists' },
        { status: 400 }
      );
    }

    // Create category
    const { data: category, error } = await supabase
      .from('event_categories')
      .insert({
        name_thai,
        name_english,
        slug,
        description,
        description_en,
        icon,
        color,
        display_order: display_order || 0,
        is_active,
      })
      .select()
      .single();

    if (error) {
      console.error('Create event category error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create event category', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: category,
      message: 'สร้างหมวดหมู่อีเวนต์สำเร็จ',
    }, { status: 201 });

  } catch (error) {
    console.error('Create event category error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
});

export { createCategoryHandler as POST };

