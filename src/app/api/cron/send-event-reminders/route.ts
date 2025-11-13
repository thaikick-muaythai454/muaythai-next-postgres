/**
 * Cron Job: Send Event Reminder Emails
 * 
 * GET/POST /api/cron/send-event-reminders
 * 
 * Sends reminder emails to customers whose events start in 1 day.
 * 
 * Authentication: Requires CRON_SECRET header or query parameter
 * 
 * Usage:
 * - Cron job (Vercel Cron, external scheduler, etc.)
 * - Manual trigger (for testing)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/database/supabase/server';
import { EmailService } from '@/lib/email/service';

/**
 * Verify cron secret for authentication
 */
function verifyCronSecret(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  
  if (process.env.NODE_ENV === 'development' && !cronSecret) {
    console.warn('⚠️ Development mode: CRON_SECRET not configured. Allowing request.');
    return true;
  }

  const userAgent = request.headers.get('user-agent') || '';
  const isVercelCron = userAgent.toLowerCase().includes('vercel');
  
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

  if (process.env.NODE_ENV === 'production' && cronSecret) {
    console.error('CRON_SECRET required but not provided');
    return false;
  }

  if (isVercelCron && !cronSecret) {
    console.warn('⚠️ Vercel Cron detected but CRON_SECRET not configured');
    return true;
  }

  return false;
}

/**
 * GET /api/cron/send-event-reminders
 * POST /api/cron/send-event-reminders
 * 
 * Send event reminder emails for events starting in 1 day
 */
export async function GET(request: NextRequest) {
  return handleEventReminders(request);
}

export async function POST(request: NextRequest) {
  return handleEventReminders(request);
}

async function handleEventReminders(request: NextRequest) {
  try {
    if (!verifyCronSecret(request)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Invalid or missing CRON_SECRET' },
        { status: 401 }
      );
    }

    const supabase = await createClient();

    // Calculate tomorrow's date: events starting in 1 day
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDate = tomorrow.toISOString().split('T')[0];

    console.log(`[Cron] Sending event reminders for events starting on ${tomorrowDate}`);

    // Query ticket_bookings where event_date is tomorrow
    // Join with events to get event details
    const { data: ticketBookings, error: bookingsError } = await supabase
      .from('ticket_bookings')
      .select(`
        id,
        user_id,
        event_id,
        event_name,
        event_name_en,
        event_date,
        ticket_count,
        ticket_type,
        booking_reference,
        orders!inner(
          id,
          user_id,
          status,
          user_email
        )
      `)
      .eq('orders.status', 'completed')
      .gte('event_date', `${tomorrowDate}T00:00:00`)
      .lt('event_date', `${tomorrowDate}T23:59:59`);

    if (bookingsError) {
      throw bookingsError;
    }

    if (!ticketBookings || ticketBookings.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No events found for tomorrow',
        data: {
          date: tomorrowDate,
          remindersSent: 0,
          bookingsProcessed: 0,
        },
      });
    }

    // Get unique event IDs
    const eventIds = [...new Set(ticketBookings.map(tb => tb.event_id).filter(Boolean))];

    // Fetch event details
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('id, name, name_english, event_date, location, address')
      .in('id', eventIds);

    if (eventsError) {
      console.error('Error fetching events:', eventsError);
    }

    const eventMap = new Map();
    if (events) {
      for (const event of events) {
        eventMap.set(event.id, event);
      }
    }

    // Get user details for personalized emails
    const userIds = [...new Set(ticketBookings.map(tb => tb.user_id).filter(Boolean))];
    const { data: users } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .in('id', userIds);

    const userMap = new Map();
    if (users) {
      for (const user of users) {
        userMap.set(user.id, user);
      }
    }

    let sent = 0;
    let failed = 0;
    let skipped = 0;

    for (const ticketBooking of ticketBookings) {
      try {
        interface OrderData {
          id: string;
          user_id: string;
          status: string;
          user_email: string;
        }
        // orders is returned as an array from Supabase join, get first element
        const ordersArray = ticketBooking.orders as unknown as OrderData[] | null;
        const order = Array.isArray(ordersArray) && ordersArray.length > 0 ? ordersArray[0] : null;
        const userEmail = order?.user_email;
        const userId = ticketBooking.user_id || order?.user_id;

        if (!userEmail || !userId) {
          skipped++;
          continue;
        }

        const event = eventMap.get(ticketBooking.event_id);
        if (!event) {
          skipped++;
          continue;
        }

        const user = userMap.get(userId);
        const customerName = user?.full_name || userEmail.split('@')[0];

        // Format event date and time
        const eventDate = new Date(ticketBooking.event_date);
        const eventTime = eventDate.toLocaleTimeString('th-TH', { 
          hour: '2-digit', 
          minute: '2-digit',
          timeZone: 'Asia/Bangkok'
        });
        const eventDateStr = eventDate.toISOString().split('T')[0];

        // Generate event URL
        const locale = 'th'; // Default locale, can be enhanced to detect from user preferences
        const eventUrl = `/${locale}/events/${event.id}`;

        // Send reminder email
        await EmailService.sendEventReminder({
          to: userEmail,
          userId: userId,
          ticketBookingId: ticketBooking.id,
          customerName,
          eventName: ticketBooking.event_name || event.name,
          eventNameEnglish: ticketBooking.event_name_en || event.name_english,
          eventDate: eventDateStr,
          eventTime,
          location: event.location,
          address: event.address || undefined,
          ticketCount: ticketBooking.ticket_count || 1,
          ticketType: ticketBooking.ticket_type || undefined,
          bookingReference: ticketBooking.booking_reference || undefined,
          eventUrl,
        }, { priority: 'high' });

        // Create notification
        if (userId) {
          await supabase.from('notifications').insert({
            user_id: userId,
            type: 'event_reminder',
            title: 'เตือนความจำ: อีเวนต์ของคุณจะเริ่มในอีก 1 วัน 🎫',
            message: `อีเวนต์ ${ticketBooking.event_name || event.name} จะเริ่มในวันที่ ${tomorrowDate} ที่ ${event.location}`,
            link_url: eventUrl,
            metadata: {
              ticket_booking_id: ticketBooking.id,
              event_id: ticketBooking.event_id,
              event_name: ticketBooking.event_name || event.name,
              event_date: eventDateStr,
            },
          });
        }

        sent++;
      } catch (error) {
        console.error(`Failed to send reminder for ticket booking ${ticketBooking.id}:`, error);
        failed++;
      }
    }

    const results = {
      success: true,
      data: {
        date: tomorrowDate,
        remindersSent: sent,
        remindersFailed: failed,
        remindersSkipped: skipped,
        bookingsProcessed: ticketBookings.length,
      },
    };

    console.log(`[Cron] Event reminders completed:`, results.data);

    return NextResponse.json(results);
  } catch (error) {
    console.error('[Cron] Error sending event reminders:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

