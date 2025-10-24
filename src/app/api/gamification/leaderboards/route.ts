import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/database/supabase/server';
import { getLeaderboardData, getAllLeaderboards } from '@/services/gamification.service';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const leaderboardId = searchParams.get('id');

    let data;

    if (leaderboardId) {
      // Get specific leaderboard data
      data = await getLeaderboardData(leaderboardId, user.id);
    } else {
      // Get all leaderboards
      data = await getAllLeaderboards();
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Failed to get leaderboard data' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data,
      error: null,
      success: true,
    });
  } catch (error) {
    console.error('Error getting leaderboards:', error);
    return NextResponse.json(
      { error: 'Internal server error', success: false },
      { status: 500 }
    );
  }
}
