import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/database/supabase/server';

/**
 * Get Fitness Goals API
 * GET /api/users/goals
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
      .from('user_fitness_goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get fitness goals error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to get fitness goals' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || []
    });

  } catch (error) {
    console.error('Get fitness goals error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Create Fitness Goal API
 * POST /api/users/goals
 * 
 * Body:
 * {
 *   goal_type: 'training_frequency' | 'weight' | 'skill' | 'custom',
 *   title: string,
 *   description?: string,
 *   target_value?: number,
 *   unit?: string,
 *   target_date?: string (ISO date)
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
    const { goal_type, title, description, target_value, unit, target_date } = body;

    if (!goal_type || !title) {
      return NextResponse.json(
        { success: false, error: 'goal_type and title are required' },
        { status: 400 }
      );
    }

    const validGoalTypes = ['training_frequency', 'weight', 'skill', 'custom'];
    if (!validGoalTypes.includes(goal_type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid goal_type' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('user_fitness_goals')
      .insert({
        user_id: user.id,
        goal_type,
        title,
        description,
        target_value,
        unit,
        target_date: target_date || null,
        current_value: 0,
        is_completed: false
      })
      .select()
      .single();

    if (error) {
      console.error('Create fitness goal error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create fitness goal' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data,
      message: 'Fitness goal created successfully'
    });

  } catch (error) {
    console.error('Create fitness goal error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

