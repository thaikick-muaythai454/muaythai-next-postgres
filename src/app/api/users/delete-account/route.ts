import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/database/supabase/server';

/**
 * Request Account Deletion API
 * POST /api/users/delete-account
 * 
 * Body:
 * {
 *   password?: string (for verification),
 *   deletion_reason?: string
 * }
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
    const { password, deletion_reason } = body;

    // Verify password if provided
    if (password) {
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: password
      });

      if (verifyError) {
        return NextResponse.json(
          { success: false, error: 'Invalid password' },
          { status: 401 }
        );
      }
    }

    // Calculate grace period (30 days)
    const gracePeriodEnds = new Date();
    gracePeriodEnds.setDate(gracePeriodEnds.getDate() + 30);

    // Record deletion request
    const { error: deleteError } = await supabase
      .from('deleted_accounts')
      .upsert({
        user_id: user.id,
        deletion_reason: deletion_reason || null,
        grace_period_ends_at: gracePeriodEnds.toISOString()
      });

    if (deleteError) {
      console.error('Record deletion error:', deleteError);
      return NextResponse.json(
        { success: false, error: 'Failed to process deletion request' },
        { status: 500 }
      );
    }

    // Soft delete: Update user metadata to mark as deleted
    // Note: Actual user deletion should be done through Supabase Admin API
    // This is just a soft delete marker
    await supabase.auth.updateUser({
      data: {
        deleted: true,
        deleted_at: new Date().toISOString()
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        grace_period_ends_at: gracePeriodEnds.toISOString(),
        message: 'Account deletion requested. You have 30 days to restore your account.'
      }
    });

  } catch (error) {
    console.error('Delete account error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Restore Account API
 * POST /api/users/restore-account
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if account is in grace period
    const { data: deletedAccount } = await supabase
      .from('deleted_accounts')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!deletedAccount) {
      return NextResponse.json(
        { success: false, error: 'Account is not marked for deletion' },
        { status: 400 }
      );
    }

    if (deletedAccount.restored_at) {
      return NextResponse.json(
        { success: false, error: 'Account is already restored' },
        { status: 400 }
      );
    }

    const now = new Date();
    const gracePeriodEnds = new Date(deletedAccount.grace_period_ends_at);

    if (now > gracePeriodEnds) {
      return NextResponse.json(
        { success: false, error: 'Grace period has expired. Account cannot be restored.' },
        { status: 400 }
      );
    }

    // Restore account
    const { error: restoreError } = await supabase
      .from('deleted_accounts')
      .update({ restored_at: now.toISOString() })
      .eq('user_id', user.id);

    if (restoreError) {
      console.error('Restore account error:', restoreError);
      return NextResponse.json(
        { success: false, error: 'Failed to restore account' },
        { status: 500 }
      );
    }

    // Remove deleted flag from user metadata
    await supabase.auth.updateUser({
      data: {
        deleted: false,
        deleted_at: null
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Account restored successfully'
    });

  } catch (error) {
    console.error('Restore account error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

