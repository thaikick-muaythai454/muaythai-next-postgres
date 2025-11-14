import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/database/supabase/server';

/**
 * POST /api/partner/reviews/google/connect
 * Initiate Google Business Profile OAuth flow
 * Body: { gym_id, google_place_id? }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { gym_id, google_place_id } = body;

    if (!gym_id) {
      return NextResponse.json(
        { success: false, error: 'gym_id is required' },
        { status: 400 }
      );
    }

    // Verify gym ownership
    const { data: gym } = await supabase
      .from('gyms')
      .select('id, user_id')
      .eq('id', gym_id)
      .single();

    if (!gym || gym.user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Gym not found or access denied' },
        { status: 403 }
      );
    }

    // Check if Google OAuth credentials are configured
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;

    if (!clientId || !redirectUri) {
      return NextResponse.json(
        {
          success: false,
          error: 'Google OAuth is not configured. Please contact administrator.',
          details: 'Missing GOOGLE_CLIENT_ID or GOOGLE_REDIRECT_URI environment variables',
        },
        { status: 503 }
      );
    }

    // Create or update sync record
    const { data: syncRecord } = await supabase
      .from('google_reviews_sync')
      .upsert(
        {
          gym_id,
          google_place_id: google_place_id || null,
          sync_status: 'pending',
        },
        { onConflict: 'gym_id' }
      )
      .select()
      .single();

    // Generate OAuth URL
    const scopes = [
      'https://www.googleapis.com/auth/business.manage',
    ];

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: scopes.join(' '),
      access_type: 'offline',
      prompt: 'consent',
      state: JSON.stringify({ gym_id, user_id: user.id }),
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

    return NextResponse.json({
      success: true,
      data: {
        auth_url: authUrl,
        sync_record: syncRecord,
      },
      message: 'Please authorize access to your Google Business Profile',
    });
  } catch (error) {
    console.error('Google connect error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

