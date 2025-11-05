/**
 * Unified Cron Job Endpoint
 * 
 * GET/POST /api/cron/unified
 * 
 * This endpoint handles multiple cron tasks based on schedule:
 * - Email Queue Processing (every 5 minutes)
 * - Booking Reminders (daily at 9 AM)
 * - Scheduled Reports (hourly)
 * 
 * This solves Vercel Hobby Plan limit (2 cron jobs max, daily frequency)
 * by using a single endpoint that routes to appropriate tasks.
 * 
 * Authentication: Requires CRON_SECRET header or query parameter
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * Verify cron secret for authentication
 */
function verifyCronSecret(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  
  // In development, allow without secret if not configured
  if (process.env.NODE_ENV === 'development' && !cronSecret) {
    console.warn('⚠️ Development mode: CRON_SECRET not configured. Allowing request.');
    return true;
  }

  // Check if request is from Vercel Cron
  const userAgent = request.headers.get('user-agent') || '';
  const isVercelCron = userAgent.toLowerCase().includes('vercel');
  
  // If secret is configured, require it
  if (cronSecret) {
    const headerSecret = request.headers.get('x-cron-secret') || 
                         request.headers.get('authorization')?.replace('Bearer ', '');
    if (headerSecret === cronSecret) {
      return true;
    }

    const querySecret = request.nextUrl.searchParams.get('secret');
    if (querySecret === cronSecret) {
      return true;
    }
  }

  // In production, if CRON_SECRET is set, require it
  if (process.env.NODE_ENV === 'production' && cronSecret) {
    console.error('CRON_SECRET required but not provided');
    return false;
  }

  // Allow Vercel Cron requests if no secret is configured (development/testing)
  if (isVercelCron && !cronSecret) {
    console.warn('⚠️ Vercel Cron detected but CRON_SECRET not configured');
    return true;
  }

  return false;
}

/**
 * Process Email Queue
 * Should run every 5 minutes (but for Vercel Hobby Plan, we'll run it once per day)
 * Calls the existing process-email-queue endpoint
 */
async function processEmailQueue(): Promise<{ success: boolean; processed: number; error?: string }> {
  try {
    // Call the existing email queue processor
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000';
    
    const response = await fetch(`${baseUrl}/api/cron/process-email-queue`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CRON_SECRET || ''}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return {
      success: data.success || false,
      processed: data.processed || 0,
      error: data.error,
    };
  } catch (error) {
    console.error('Email queue processing error:', error);
    return { 
      success: false, 
      processed: 0, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Send Booking Reminders
 * Should run daily at 9 AM
 * Calls the existing send-booking-reminders endpoint
 */
async function sendBookingReminders(): Promise<{ success: boolean; sent: number; error?: string }> {
  try {
    // Call the existing booking reminders endpoint
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000';
    
    const response = await fetch(`${baseUrl}/api/cron/send-booking-reminders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CRON_SECRET || ''}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return {
      success: data.success || false,
      sent: data.data?.remindersSent || 0,
      error: data.error || data.details,
    };
  } catch (error) {
    console.error('Booking reminders error:', error);
    return { 
      success: false, 
      sent: 0, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Generate Scheduled Reports
 * Should run hourly
 * Calls the existing generate-scheduled-reports endpoint
 */
async function generateScheduledReports(): Promise<{ success: boolean; generated: number; error?: string }> {
  try {
    // Call the existing scheduled reports endpoint
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000';
    
    const response = await fetch(`${baseUrl}/api/cron/generate-scheduled-reports`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CRON_SECRET || ''}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return {
      success: data.success || false,
      generated: data.data?.reportsGenerated || 0,
      error: data.error || data.details,
    };
  } catch (error) {
    console.error('Scheduled reports error:', error);
    return { 
      success: false, 
      generated: 0, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * GET /api/cron/unified
 * POST /api/cron/unified
 */
export async function GET(request: NextRequest) {
  return handleUnifiedCron(request);
}

export async function POST(request: NextRequest) {
  return handleUnifiedCron(request);
}

async function handleUnifiedCron(request: NextRequest) {
  try {
    // Verify authentication
    if (!verifyCronSecret(request)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const dayOfWeek = now.getDay();

    const results: Record<string, unknown> = {
      timestamp: now.toISOString(),
      tasks: {},
    };

    // Always process email queue (runs every 5 minutes, but for Vercel Hobby Plan we run it once per day)
    // Note: For Vercel Hobby Plan, cron jobs can only run once per day
    // So we process email queue every time this endpoint is called
    const emailQueueResult = await processEmailQueue();
    results.tasks = {
      ...results.tasks,
      emailQueue: emailQueueResult,
    };

    // Send booking reminders at 9 AM daily (when this cron runs at 9 AM)
    if (currentHour === 9 && currentMinute === 0) {
      const remindersResult = await sendBookingReminders();
      results.tasks = {
        ...results.tasks,
        bookingReminders: remindersResult,
      };
    }

    // Generate scheduled reports at the start of each hour (when this cron runs hourly)
    // Note: For Vercel Hobby Plan, we can only run once per day, so this will only run once
    // But we check if there are reports due and generate them
    if (currentMinute === 0 || currentMinute < 5) {
      const reportsResult = await generateScheduledReports();
      results.tasks = {
        ...results.tasks,
        scheduledReports: reportsResult,
      };
    }

    // Check if any task was run
    const taskCount = Object.keys(results.tasks).length;
    
    return NextResponse.json({
      success: true,
      message: `Processed ${taskCount} task(s)`,
      ...results,
    });

  } catch (error) {
    console.error('Unified cron error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

