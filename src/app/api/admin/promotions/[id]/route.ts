/**
 * Admin Promotions API - Single Promotion
 * PUT /api/admin/promotions/[id] - แก้ไขโปรโมชั่น
 * DELETE /api/admin/promotions/[id] - ลบโปรโมชั่น
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/database/supabase/server';
import { withAdminAuth } from '@/lib/api/withAdminAuth';

/**
 * PUT /api/admin/promotions/[id]
 * แก้ไขโปรโมชั่น (Admin only)
 * Body (all optional):
 * - title?: string
 * - titleEnglish?: string
 * - description?: string
 * - isActive?: boolean
 * - priority?: number
 * - showInMarquee?: boolean
 * - startDate?: ISO string
 * - endDate?: ISO string
 * - linkUrl?: string
 * - linkText?: string
 */
const updatePromotionHandler = withAdminAuth(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
  _user
) => {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const body = await request.json();
    
    // Check if promotion exists
    const { data: existingPromotion, error: checkError } = await supabase
      .from('promotions')
      .select('id')
      .eq('id', id)
      .maybeSingle();
    
    if (checkError || !existingPromotion) {
      return NextResponse.json(
        { success: false, error: 'Promotion not found' },
        { status: 404 }
      );
    }
    
    const {
      title,
      titleEnglish,
      description,
      isActive,
      priority,
      showInMarquee,
      startDate,
      endDate,
      linkUrl,
      linkText,
    } = body;
    
    // Build update object
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    
    // Validate and set fields
    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim().length === 0) {
        return NextResponse.json(
          { success: false, error: 'Title cannot be empty' },
          { status: 400 }
        );
      }
      updateData.title = title.trim();
    }
    
    if (titleEnglish !== undefined) {
      updateData.title_english = titleEnglish?.trim() || null;
    }
    
    if (description !== undefined) {
      updateData.description = description?.trim() || null;
    }
    
    if (isActive !== undefined) {
      updateData.is_active = Boolean(isActive);
    }
    
    if (priority !== undefined) {
      if (typeof priority !== 'number' || priority < 0) {
        return NextResponse.json(
          { success: false, error: 'Priority must be a non-negative number' },
          { status: 400 }
        );
      }
      updateData.priority = parseInt(priority.toString()) || 0;
    }
    
    if (showInMarquee !== undefined) {
      updateData.show_in_marquee = Boolean(showInMarquee);
    }
    
    if (startDate !== undefined) {
      if (startDate === null) {
        updateData.start_date = null;
      } else {
        const start = new Date(startDate);
        if (isNaN(start.getTime())) {
          return NextResponse.json(
            { success: false, error: 'Invalid start date format' },
            { status: 400 }
          );
        }
        updateData.start_date = start.toISOString();
      }
    }
    
    if (endDate !== undefined) {
      if (endDate === null) {
        updateData.end_date = null;
      } else {
        const end = new Date(endDate);
        if (isNaN(end.getTime())) {
          return NextResponse.json(
            { success: false, error: 'Invalid end date format' },
            { status: 400 }
          );
        }
        updateData.end_date = end.toISOString();
      }
    }
    
    // Validate date range if both dates are provided
    const finalStartDate = updateData.start_date !== undefined 
      ? (updateData.start_date ? new Date(updateData.start_date as string) : null)
      : (startDate ? new Date(startDate) : null);
    
    const finalEndDate = updateData.end_date !== undefined
      ? (updateData.end_date ? new Date(updateData.end_date as string) : null)
      : (endDate ? new Date(endDate) : null);
    
    if (finalStartDate && finalEndDate && finalStartDate >= finalEndDate) {
      return NextResponse.json(
        { success: false, error: 'End date must be after start date' },
        { status: 400 }
      );
    }
    
    if (linkUrl !== undefined) {
      updateData.link_url = linkUrl?.trim() || null;
    }
    
    if (linkText !== undefined) {
      updateData.link_text = linkText?.trim() || null;
    }
    
    // Update promotion
    const { data: updatedPromotion, error } = await supabase
      .from('promotions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating promotion:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update promotion', details: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: updatedPromotion,
      message: 'Promotion updated successfully',
    });
    
  } catch (error) {
    console.error('Update promotion error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
});

/**
 * DELETE /api/admin/promotions/[id]
 * ลบโปรโมชั่น (Admin only)
 */
const deletePromotionHandler = withAdminAuth(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
  _user
) => {
  try {
    const supabase = await createClient();
    const { id } = await params;
    
    // Check if promotion exists
    const { data: promotion, error: checkError } = await supabase
      .from('promotions')
      .select('id, title')
      .eq('id', id)
      .maybeSingle();
    
    if (checkError || !promotion) {
      return NextResponse.json(
        { success: false, error: 'Promotion not found' },
        { status: 404 }
      );
    }
    
    // Delete promotion
    const { error } = await supabase
      .from('promotions')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting promotion:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to delete promotion', details: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Promotion deleted successfully',
    });
    
  } catch (error) {
    console.error('Delete promotion error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
});

export { updatePromotionHandler as PUT, deletePromotionHandler as DELETE };

