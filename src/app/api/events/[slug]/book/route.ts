import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/database/supabase/server';
import { generateQRCodeString } from '@/lib/utils/qrcode';

/**
 * Helper function to check if a string is a UUID
 */
function isUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

/**
 * POST /api/events/[slug]/book
 * จองตั๋วอีเวนต์
 * รองรับทั้ง slug และ id (UUID)
 * Body: {
 *   ticket_id: UUID (event_tickets.id)
 *   ticket_count: number (จำนวนตั๋ว)
 *   customer_name?: string
 *   customer_email?: string
 *   customer_phone?: string
 *   create_payment?: boolean (default: true - สร้าง payment intent)
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const supabase = await createClient();
    const { slug } = await params;
    
    // Determine if parameter is UUID (id) or slug
    const isId = isUUID(slug);

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'กรุณาเข้าสู่ระบบ' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      ticket_id,
      ticket_count = 1,
      customer_name,
      customer_email,
      customer_phone,
      create_payment = true,
    } = body;

    // Validation
    if (!ticket_id || !ticket_count || ticket_count < 1) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: ticket_id, ticket_count (must be >= 1)' },
        { status: 400 }
      );
    }

    // Get event - support both slug and id
    let eventQuery = supabase
      .from('events')
      .select('*')
      .eq('is_published', true);
    
    if (isId) {
      eventQuery = eventQuery.eq('id', slug);
    } else {
      eventQuery = eventQuery.eq('slug', slug);
    }
    
    const { data: event, error: eventError } = await eventQuery.maybeSingle();

    if (eventError || !event) {
      return NextResponse.json(
        { success: false, error: 'Event not found or not published' },
        { status: 404 }
      );
    }

    // Check if event is still available
    if (event.status === 'cancelled' || event.status === 'completed') {
      return NextResponse.json(
        { success: false, error: `Event is ${event.status}` },
        { status: 400 }
      );
    }

    // Check if event date hasn't passed
    const eventDate = new Date(event.event_date);
    if (eventDate < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Event date has passed' },
        { status: 400 }
      );
    }

    // Get ticket
    const { data: ticket, error: ticketError } = await supabase
      .from('event_tickets')
      .select('*')
      .eq('id', ticket_id)
      .eq('event_id', event.id)
      .eq('is_active', true)
      .maybeSingle();

    if (ticketError || !ticket) {
      return NextResponse.json(
        { success: false, error: 'Ticket not found or not available' },
        { status: 404 }
      );
    }

    // Check if tickets are still available
    const availableTickets = (ticket.quantity_available || 0) - (ticket.quantity_sold || 0);
    if (availableTickets < ticket_count) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Only ${availableTickets} tickets available. Requested: ${ticket_count}` 
        },
        { status: 400 }
      );
    }

    // Check max_per_person limit
    if (ticket.max_per_person && ticket_count > ticket.max_per_person) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Maximum ${ticket.max_per_person} tickets per person. Requested: ${ticket_count}` 
        },
        { status: 400 }
      );
    }

    // Check sale dates
    const now = new Date();
    if (ticket.sale_start_date && new Date(ticket.sale_start_date) > now) {
      return NextResponse.json(
        { success: false, error: 'Ticket sales have not started yet' },
        { status: 400 }
      );
    }

    if (ticket.sale_end_date && new Date(ticket.sale_end_date) < now) {
      return NextResponse.json(
        { success: false, error: 'Ticket sales have ended' },
        { status: 400 }
      );
    }

    // Get user profile for customer info
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('user_id', user.id)
      .maybeSingle();

    const { data: authUser } = await supabase.auth.getUser();
    const defaultName = profile?.full_name || authUser?.user?.email?.split('@')[0] || 'User';
    const defaultEmail = authUser?.user?.email || '';

    // Calculate total price
    const totalPrice = ticket.price * ticket_count;

    // Get user info
    const finalCustomerName = customer_name || defaultName;
    const finalCustomerEmail = customer_email || defaultEmail;
    const finalCustomerPhone = customer_phone || '';

    if (create_payment) {
      // Create order first (will be linked to payment later)
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          order_number: await generateOrderNumber(supabase),
          total_amount: totalPrice,
          currency: 'thb',
          status: 'pending',
          items: [
            {
              type: 'event_ticket',
              event_id: event.id,
              event_name: event.name,
              event_name_en: event.name_english,
              event_date: event.event_date,
              ticket_id: ticket_id,
              ticket_type: ticket.ticket_type,
              ticket_name: ticket.name,
              quantity: ticket_count,
              unit_price: ticket.price,
              total_price: totalPrice,
            }
          ],
          customer_name: finalCustomerName,
          customer_email: finalCustomerEmail,
          customer_phone: finalCustomerPhone,
          metadata: {
              event_id: event.id,
            ticket_id: ticket_id,
            ticket_count: ticket_count,
          },
        })
        .select()
        .single();

      if (orderError || !order) {
        console.error('Create order error:', orderError);
        return NextResponse.json(
          { success: false, error: 'Failed to create order' },
          { status: 500 }
        );
      }

      // Generate booking reference first
      const bookingReference = await generateBookingReference(supabase);

      // Create ticket booking
      const { data: ticketBooking, error: bookingError } = await supabase
        .from('ticket_bookings')
        .insert({
          order_id: order.id,
          user_id: user.id,
          event_id: event.id,
          event_name: event.name,
          event_name_en: event.name_english,
          event_date: event.event_date,
          ticket_type: ticket.ticket_type,
          ticket_count: ticket_count,
          unit_price: ticket.price,
          total_price: totalPrice,
          booking_reference: bookingReference,
          qr_code: generateQRCodeString('temp', bookingReference),
        })
        .select()
        .single();

      if (bookingError || !ticketBooking) {
        console.error('Create ticket booking error:', bookingError);
        // Rollback order
        await supabase.from('orders').delete().eq('id', order.id);
        return NextResponse.json(
          { success: false, error: 'Failed to create ticket booking' },
          { status: 500 }
        );
      }

      // Update QR code with actual ticket ID
      const finalQrCode = generateQRCodeString(ticketBooking.id, bookingReference);
      await supabase
        .from('ticket_bookings')
        .update({
          qr_code: finalQrCode,
        })
        .eq('id', ticketBooking.id);

      // Create payment intent
      const { createPaymentIntent } = await import('@/services');
      const paymentResult = await createPaymentIntent({
        user_id: user.id,
        user_email: finalCustomerEmail,
        amount: totalPrice,
        payment_type: 'ticket',
        metadata: {
          order_id: order.id,
              event_id: event.id,
          ticket_booking_id: ticketBooking.id,
          ticket_id: ticket_id,
          ticket_count: ticket_count,
        },
      });

      // Update order with payment_id
      const { data: payment } = await supabase
        .from('payments')
        .select('id')
        .eq('stripe_payment_intent_id', paymentResult.paymentIntentId)
        .maybeSingle();

      if (payment) {
        await supabase
          .from('orders')
          .update({ payment_id: payment.id })
          .eq('id', order.id);
      }

      return NextResponse.json({
        success: true,
        data: {
          order_id: order.id,
          ticket_booking_id: ticketBooking.id,
          booking_reference: ticketBooking.booking_reference,
          total_amount: totalPrice,
          ticket_count: ticket_count,
          payment_intent: paymentResult.paymentIntentId,
          client_secret: paymentResult.clientSecret,
        },
        message: 'จองตั๋วสำเร็จ กรุณาชำระเงิน',
      }, { status: 201 });

    } else {
      // Without payment (for future use or onsite payment)
      // Create order with status 'confirmed'
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          order_number: await generateOrderNumber(supabase),
          total_amount: totalPrice,
          currency: 'thb',
          status: 'confirmed',
          items: [
            {
              type: 'event_ticket',
              event_id: event.id,
              event_name: event.name,
              event_name_en: event.name_english,
              event_date: event.event_date,
              ticket_id: ticket_id,
              ticket_type: ticket.ticket_type,
              ticket_name: ticket.name,
              quantity: ticket_count,
              unit_price: ticket.price,
              total_price: totalPrice,
            }
          ],
          customer_name: finalCustomerName,
          customer_email: finalCustomerEmail,
          customer_phone: finalCustomerPhone,
          metadata: {
              event_id: event.id,
            ticket_id: ticket_id,
            ticket_count: ticket_count,
          },
        })
        .select()
        .single();

      if (orderError || !order) {
        console.error('Create order error:', orderError);
        return NextResponse.json(
          { success: false, error: 'Failed to create order' },
          { status: 500 }
        );
      }

      // Generate booking reference
      const bookingReferenceNoPayment = await generateBookingReference(supabase);

      // Create ticket booking
      const { data: ticketBooking, error: bookingError } = await supabase
        .from('ticket_bookings')
        .insert({
          order_id: order.id,
          user_id: user.id,
          event_id: event.id,
          event_name: event.name,
          event_name_en: event.name_english,
          event_date: event.event_date,
          ticket_type: ticket.ticket_type,
          ticket_count: ticket_count,
          unit_price: ticket.price,
          total_price: totalPrice,
          booking_reference: bookingReferenceNoPayment,
          qr_code: generateQRCodeString('temp', bookingReferenceNoPayment),
        })
        .select()
        .single();

      if (bookingError || !ticketBooking) {
        console.error('Create ticket booking error:', bookingError);
        await supabase.from('orders').delete().eq('id', order.id);
        return NextResponse.json(
          { success: false, error: 'Failed to create ticket booking' },
          { status: 500 }
        );
      }

      // Update QR code with actual ticket ID
      const finalQrCodeNoPayment = generateQRCodeString(ticketBooking.id, bookingReferenceNoPayment);
      await supabase
        .from('ticket_bookings')
        .update({
          qr_code: finalQrCodeNoPayment,
        })
        .eq('id', ticketBooking.id);

      // Update ticket quantity_sold (but don't commit yet - wait for payment)
      // This will be updated when payment is confirmed via webhook

      return NextResponse.json({
        success: true,
        data: {
          order_id: order.id,
          ticket_booking_id: ticketBooking.id,
          booking_reference: ticketBooking.booking_reference,
          total_amount: totalPrice,
          ticket_count: ticket_count,
        },
        message: 'จองตั๋วสำเร็จ',
      }, { status: 201 });
    }

  } catch (error) {
    console.error('Book event ticket error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Helper function to generate order number
async function generateOrderNumber(supabase: any): Promise<string> {
  const { data } = await supabase
    .rpc('generate_order_number');
  
  if (data) {
    return data;
  }

  // Fallback if function doesn't exist
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `ORD-${timestamp}-${random}`;
}

// Helper function to generate booking reference
async function generateBookingReference(supabase: any): Promise<string> {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let reference = '';
  
  for (let i = 0; i < 8; i++) {
    reference += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  // Check if reference exists
  const { data } = await supabase
    .from('ticket_bookings')
    .select('booking_reference')
    .eq('booking_reference', reference)
    .maybeSingle();

  if (data) {
    // Regenerate if exists
    return generateBookingReference(supabase);
  }

  return reference;
}

