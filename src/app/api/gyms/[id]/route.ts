/**
 * Gym Management API Endpoint (Admin Only)
 * 
 * GET /api/gyms/[id] - Get single gym details
 * PATCH /api/gyms/[id] - Update gym information
 * DELETE /api/gyms/[id] - Delete gym
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/gyms/[id]
 * ดึงข้อมูลยิมเดี่ยว
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const supabase = await createClient();
    const { id } = await context.params;

    // ตรวจสอบ authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - กรุณาเข้าสู่ระบบ' },
        { status: 401 }
      );
    }

    // ตรวจสอบว่าเป็น admin หรือไม่
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle();

    if (roleError || roleData?.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Forbidden - คุณไม่มีสิทธิ์เข้าถึง' },
        { status: 403 }
      );
    }

    // ดึงข้อมูล gym
    const { data: gym, error: gymError } = await supabase
      .from('gyms')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (gymError || !gym) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบยิมที่ต้องการ' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: gym,
    });

  } catch (error) {
    console.error('Error fetching gym:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'เกิดข้อผิดพลาดในการดึงข้อมูลยิม',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/gyms/[id]
 * แก้ไขข้อมูลยิม
 */
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const supabase = await createClient();
    const { id } = await context.params;

    // ตรวจสอบ authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - กรุณาเข้าสู่ระบบ' },
        { status: 401 }
      );
    }

    // ตรวจสอบว่าเป็น admin หรือไม่
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle();

    if (roleError || roleData?.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Forbidden - คุณไม่มีสิทธิ์เข้าถึง' },
        { status: 403 }
      );
    }

    // อ่าน request body
    const body = await request.json();
    const {
      gym_name,
      contact_name,
      phone,
      email,
      website,
      location,
      gym_details,
      services,
      status,
    } = body;

    // Validation
    const errors: Record<string, string> = {};

    if (gym_name !== undefined) {
      if (!gym_name || gym_name.trim().length < 3 || gym_name.trim().length > 100) {
        errors.gym_name = 'ชื่อยิมต้องมีความยาว 3-100 ตัวอักษร';
      }
    }

    if (contact_name !== undefined) {
      if (!contact_name || contact_name.trim().length < 2 || contact_name.trim().length > 100) {
        errors.contact_name = 'ชื่อผู้ติดต่อต้องมีความยาว 2-100 ตัวอักษร';
      }
    }

    if (phone !== undefined) {
      if (!phone) {
        errors.phone = 'กรุณากรอกเบอร์โทรศัพท์';
      } else {
        // Thai phone format: 0X-XXXX-XXXX or 0XXXXXXXXX
        const phoneRegex = /^0\d{1,2}-?\d{3,4}-?\d{4}$/;
        if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
          errors.phone = 'รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง (ตัวอย่าง: 02-123-4567 หรือ 0812345678)';
        }
      }
    }

    if (email !== undefined) {
      if (!email) {
        errors.email = 'กรุณากรอกอีเมล';
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          errors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
        }
      }
    }

    if (website !== undefined && website) {
      try {
        new URL(website);
      } catch {
        errors.website = 'รูปแบบ URL ไม่ถูกต้อง';
      }
    }

    if (location !== undefined) {
      if (!location || location.trim().length < 10) {
        errors.location = 'ที่อยู่ต้องมีความยาวอย่างน้อย 10 ตัวอักษร';
      }
    }

    if (status !== undefined) {
      if (!['pending', 'approved', 'rejected'].includes(status)) {
        errors.status = 'สถานะไม่ถูกต้อง';
      }
    }

    // ถ้ามี validation errors
    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'ข้อมูลไม่ถูกต้อง',
          errors,
        },
        { status: 400 }
      );
    }

    // ตรวจสอบว่ายิมมีอยู่จริง
    const { data: existingGym, error: gymError } = await supabase
      .from('gyms')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (gymError || !existingGym) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบยิมที่ต้องการ' },
        { status: 404 }
      );
    }

    // สร้าง update object (เฉพาะ fields ที่ส่งมา)
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (gym_name !== undefined) updateData.gym_name = gym_name.trim();
    if (contact_name !== undefined) updateData.contact_name = contact_name.trim();
    if (phone !== undefined) updateData.phone = phone.trim();
    if (email !== undefined) updateData.email = email.trim();
    if (website !== undefined) updateData.website = website.trim() || null;
    if (location !== undefined) updateData.location = location.trim();
    if (gym_details !== undefined) updateData.gym_details = gym_details?.trim() || null;
    if (services !== undefined) updateData.services = services;
    if (status !== undefined) updateData.status = status;

    // อัพเดทข้อมูล
    const { data: updatedGym, error: updateError } = await supabase
      .from('gyms')
      .update(updateData)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (updateError) {
      throw updateError;
    }

    if (!updatedGym) {
      throw new Error('ไม่สามารถอัพเดทข้อมูลได้');
    }

    return NextResponse.json({
      success: true,
      message: 'อัพเดทข้อมูลยิมสำเร็จ',
      data: updatedGym,
    });

  } catch (error) {
    console.error('Error updating gym:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'เกิดข้อผิดพลาดในการอัพเดทข้อมูลยิม',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/gyms/[id]
 * ลบยิม
 */
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const supabase = await createClient();
    const { id } = await context.params;

    // ตรวจสอบ authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - กรุณาเข้าสู่ระบบ' },
        { status: 401 }
      );
    }

    // ตรวจสอบว่าเป็น admin หรือไม่
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle();

    if (roleError || roleData?.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Forbidden - คุณไม่มีสิทธิ์เข้าถึง' },
        { status: 403 }
      );
    }

    // ตรวจสอบว่ายิมมีอยู่จริง
    const { data: existingGym, error: gymError } = await supabase
      .from('gyms')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (gymError || !existingGym) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบยิมที่ต้องการ' },
        { status: 404 }
      );
    }

    // ลบยิม
    const { error: deleteError } = await supabase
      .from('gyms')
      .delete()
      .eq('id', id);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({
      success: true,
      message: 'ลบยิมสำเร็จ',
    });

  } catch (error) {
    console.error('Error deleting gym:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'เกิดข้อผิดพลาดในการลบยิม',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
