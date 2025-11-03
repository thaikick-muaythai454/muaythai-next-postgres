import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/database/supabase/server';

/**
 * Get Connected Accounts API
 * GET /api/users/connected-accounts
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

    const { data, error } = await supabase
      .from('user_connected_accounts')
      .select('*')
      .eq('user_id', user.id)
      .order('connected_at', { ascending: false });

    if (error) {
      console.error('Get connected accounts error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to get connected accounts' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || []
    });

  } catch (error) {
    console.error('Get connected accounts error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Disconnect Account API
 * DELETE /api/users/connected-accounts?provider=google
 */
export async function DELETE(request: NextRequest) {
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
    const provider = searchParams.get('provider');

    if (!provider) {
      return NextResponse.json(
        { success: false, error: 'Provider parameter is required' },
        { status: 400 }
      );
    }

    const validProviders = ['google', 'facebook', 'apple'];
    if (!validProviders.includes(provider)) {
      return NextResponse.json(
        { success: false, error: 'Invalid provider' },
        { status: 400 }
      );
    }

    // Check if account is primary
    const { data: accountData } = await supabase
      .from('user_connected_accounts')
      .select('is_primary')
      .eq('user_id', user.id)
      .eq('provider', provider)
      .single();

    if (accountData?.is_primary) {
      return NextResponse.json(
        { success: false, error: 'Cannot disconnect primary account' },
        { status: 400 }
      );
    }

    const { error: deleteError } = await supabase
      .from('user_connected_accounts')
      .delete()
      .eq('user_id', user.id)
      .eq('provider', provider);

    if (deleteError) {
      console.error('Disconnect account error:', deleteError);
      return NextResponse.json(
        { success: false, error: 'Failed to disconnect account' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Account disconnected successfully'
    });

  } catch (error) {
    console.error('Disconnect account error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

