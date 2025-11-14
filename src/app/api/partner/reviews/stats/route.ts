import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/database/supabase/server';

/**
 * GET /api/partner/reviews/stats
 * Get review statistics for partner's gym
 * Query params: gym_id (optional - will use partner's gym if not provided)
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

    // Check if user is a partner or admin
    const { data: role } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    const isAdmin = role?.role === 'admin';
    const isPartner = role?.role === 'partner';

    if (!isPartner && !isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Partner access required' },
        { status: 403 }
      );
    }

    // Get gym_id from query or from partner's gym
    const searchParams = request.nextUrl.searchParams;
    let gymId = searchParams.get('gym_id');

    if (!gymId) {
      const { data: gym } = await supabase
        .from('gyms')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!gym) {
        return NextResponse.json(
          { success: false, error: 'No gym found for this partner' },
          { status: 404 }
        );
      }

      gymId = gym.id;
    }

    // Verify gym ownership (unless admin)
    if (!isAdmin) {
      const { data: gym } = await supabase
        .from('gyms')
        .select('user_id')
        .eq('id', gymId)
        .single();

      if (!gym || gym.user_id !== user.id) {
        return NextResponse.json(
          { success: false, error: 'Forbidden - Not your gym' },
          { status: 403 }
        );
      }
    }

    // Get review counts by status
    const { data: reviews } = await supabase
      .from('gym_reviews')
      .select('status, rating, has_response')
      .eq('gym_id', gymId);

    // Calculate statistics
    const stats = {
      total: reviews?.length || 0,
      pending: reviews?.filter((r) => r.status === 'pending').length || 0,
      approved: reviews?.filter((r) => r.status === 'approved').length || 0,
      rejected: reviews?.filter((r) => r.status === 'rejected').length || 0,
      hidden: reviews?.filter((r) => r.status === 'hidden').length || 0,
      flagged: reviews?.filter((r) => r.status === 'flagged').length || 0,
      with_response: reviews?.filter((r) => r.has_response).length || 0,
      without_response: reviews?.filter((r) => !r.has_response).length || 0,
      average_rating: 0,
    };

    // Calculate average rating (approved reviews only)
    const approvedReviews = reviews?.filter((r) => r.status === 'approved') || [];
    if (approvedReviews.length > 0) {
      const totalRating = approvedReviews.reduce((sum, r) => sum + r.rating, 0);
      stats.average_rating = parseFloat((totalRating / approvedReviews.length).toFixed(2));
    }

    // Get pending reviews that need attention
    const { data: pendingReviews, count: pendingCount } = await supabase
      .from('gym_reviews')
      .select('id, rating, created_at', { count: 'exact' })
      .eq('gym_id', gymId)
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    // Get reviews without responses
    const { data: unansweredReviews, count: unansweredCount } = await supabase
      .from('gym_reviews')
      .select('id, rating, created_at', { count: 'exact' })
      .eq('gym_id', gymId)
      .eq('status', 'approved')
      .eq('has_response', false)
      .order('created_at', { ascending: true })
      .limit(10);

    // Get flagged reviews
    const { data: flaggedReviews, count: flaggedCount } = await supabase
      .from('gym_reviews')
      .select('id, rating, flag_count, created_at', { count: 'exact' })
      .eq('gym_id', gymId)
      .gt('flag_count', 0)
      .order('flag_count', { ascending: false })
      .limit(10);

    return NextResponse.json({
      success: true,
      data: {
        stats,
        needs_attention: {
          pending: {
            count: pendingCount || 0,
            reviews: pendingReviews || [],
          },
          unanswered: {
            count: unansweredCount || 0,
            reviews: unansweredReviews || [],
          },
          flagged: {
            count: flaggedCount || 0,
            reviews: flaggedReviews || [],
          },
        },
      },
    });
  } catch (error) {
    console.error('Review stats error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

