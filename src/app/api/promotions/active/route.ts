/**
 * Active Promotions API
 * GET /api/promotions/active?gym_id=xxx - Get active promotions for a gym
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/database/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const gymId = searchParams.get('gym_id');

    if (!gymId) {
      return NextResponse.json(
        { success: false, error: 'gym_id is required' },
        { status: 400 }
      );
    }

    // Verify gym exists and is approved
    const { data: gym, error: gymError } = await supabase
      .from('gyms')
      .select('id, gym_name, status')
      .eq('id', gymId)
      .eq('status', 'approved')
      .maybeSingle();

    if (gymError || !gym) {
      return NextResponse.json(
        { success: false, error: 'Gym not found or not approved' },
        { status: 404 }
      );
    }

    const now = new Date().toISOString();

    // Fetch active promotions for this gym
    // Promotions must be:
    // - is_active = true
    // - Have discount_type set (not null)
    // - Within date range (if dates are set)
    // - Not exceeded max_uses (if max_uses is set)
    const { data: promotions, error } = await supabase
      .from('promotions')
      .select('*')
      .eq('gym_id', gymId)
      .eq('is_active', true)
      .not('discount_type', 'is', null)
      .or(`start_date.is.null,start_date.lte.${now}`)
      .or(`end_date.is.null,end_date.gte.${now}`)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching active promotions:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch promotions' },
        { status: 500 }
      );
    }

    // Filter out promotions that have exceeded max_uses
    const validPromotions = (promotions || []).filter((promo) => {
      if (promo.max_uses !== null && promo.current_uses !== null) {
        return promo.current_uses < promo.max_uses;
      }
      return true;
    });

    return NextResponse.json({
      success: true,
      data: validPromotions,
      count: validPromotions.length,
    });

  } catch (error) {
    console.error('Get active promotions error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

