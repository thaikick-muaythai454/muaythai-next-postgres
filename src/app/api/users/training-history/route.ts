import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/database/supabase/server';

/**
 * Get Training History API
 * GET /api/users/training-history
 * 
 * Query params:
 * - startDate?: string (ISO date)
 * - endDate?: string (ISO date)
 * - gymId?: string
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const gymId = searchParams.get('gymId');

    // Build query
    let query = supabase
      .from('bookings')
      .select(`
        *,
        gyms (
          id,
          gym_name,
          location,
          images
        ),
        packages (
          id,
          package_name,
          package_type,
          price
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'confirmed')
      .order('booking_date', { ascending: false });

    if (startDate) {
      query = query.gte('booking_date', startDate);
    }

    if (endDate) {
      query = query.lte('booking_date', endDate);
    }

    if (gymId) {
      query = query.eq('gym_id', gymId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Get training history error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to get training history' },
        { status: 500 }
      );
    }

    // Calculate statistics
    const stats = {
      total_bookings: data?.length || 0,
      unique_gyms: new Set(data?.map((b: any) => b.gym_id)).size,
      total_spent: data?.reduce((sum: number, b: any) => sum + (b.packages?.price || 0), 0) || 0,
      by_month: {} as Record<string, number>
    };

    // Group by month
    data?.forEach((booking: any) => {
      if (booking.booking_date) {
        const month = booking.booking_date.substring(0, 7); // YYYY-MM
        stats.by_month[month] = (stats.by_month[month] || 0) + 1;
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        bookings: data || [],
        statistics: stats
      }
    });

  } catch (error) {
    console.error('Get training history error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

