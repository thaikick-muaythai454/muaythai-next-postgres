/**
 * Payment Service
 * Business logic for payment operations
 */

import { createClient } from '@/lib/database/supabase/server';
import { stripe, formatAmountForStripe, CURRENCY, isStripeConfigured } from '@/lib/payments';

export interface CreatePaymentIntentInput {
  user_id: string;
  user_email: string;
  amount: number;
  payment_type: 'gym_booking' | 'product' | 'ticket';
  metadata: Record<string, string>;
}

export interface PaymentIntentResult {
  clientSecret: string;
  paymentIntentId: string;
  orderId: string;
  orderNumber: string;
}

// Validation constants
const MIN_AMOUNT = 1;
const MAX_AMOUNT = 999999;
const VALID_PAYMENT_TYPES = ['gym_booking', 'product', 'ticket'] as const;

/**
 * Validate payment data with enhanced validation
 */
export function validatePaymentData(data: CreatePaymentIntentInput): string[] {
  const errors: string[] = [];

  // Amount validation
  if (!data.amount || typeof data.amount !== 'number') {
    errors.push('Invalid amount format');
  } else if (data.amount < MIN_AMOUNT) {
    errors.push(`Amount must be at least ${MIN_AMOUNT}`);
  } else if (data.amount > MAX_AMOUNT) {
    errors.push(`Amount cannot exceed ${MAX_AMOUNT}`);
  }

  // Payment type validation
  if (!data.payment_type) {
    errors.push('Missing payment type');
  } else if (!VALID_PAYMENT_TYPES.includes(data.payment_type as any)) {
    errors.push('Invalid payment type');
  }

  // User data validation
  if (!data.user_id?.trim()) {
    errors.push('Missing user ID');
  }

  if (!data.user_email?.trim()) {
    errors.push('Missing user email');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.user_email.trim())) {
      errors.push('Invalid email format');
    }
  }

  // Metadata validation
  if (!data.metadata || typeof data.metadata !== 'object') {
    errors.push('Missing or invalid metadata');
  }

  return errors;
}

/**
 * Get or create Stripe customer
 */
export async function getOrCreateStripeCustomer(
  userId: string,
  userEmail: string
): Promise<string> {
  if (!stripe) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.');
  }

  const supabase = await createClient();

  // Check if user already has a Stripe customer ID
  const { data: existingPayment } = await supabase
    .from('payments')
    .select('stripe_customer_id')
    .eq('user_id', userId)
    .not('stripe_customer_id', 'is', null)
    .limit(1)
    .single();

  if (existingPayment?.stripe_customer_id) {
    return existingPayment.stripe_customer_id;
  }

  // Create new Stripe customer
  const customer = await stripe.customers.create({
    email: userEmail,
    metadata: {
      supabase_user_id: userId,
    },
  });

  return customer.id;
}

/**
 * Generate order number with better uniqueness
 */
export async function generateOrderNumber(): Promise<string> {
  const supabase = await createClient();

  // Try to use database function if available
  const { data: orderNumberData } = await supabase.rpc('generate_order_number');
  
  if (orderNumberData) {
    return orderNumberData;
  }

  // Enhanced fallback with date and random component
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const timestamp = now.getTime().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  return `ORD-${year}${month}${day}-${timestamp}${random}`;
}

/**
 * Prepare payment metadata for Stripe
 */
function preparePaymentMetadata(data: CreatePaymentIntentInput): Record<string, string> {
  const paymentMetadata: Record<string, string> = {
    type: data.payment_type,
    userId: data.user_id,
    userEmail: data.user_email.trim().toLowerCase(),
  };

  // Convert all metadata values to strings
  if (data.metadata) {
    Object.entries(data.metadata).forEach(([key, value]) => {
      paymentMetadata[key] = String(value);
    });
  }

  return paymentMetadata;
}

/**
 * Create payment intent with optimized flow
 */
export async function createPaymentIntent(
  data: CreatePaymentIntentInput
): Promise<PaymentIntentResult> {
  // Check if Stripe is configured
  if (!stripe || !isStripeConfigured()) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.');
  }

  // Validate data
  const validationErrors = validatePaymentData(data);
  if (validationErrors.length > 0) {
    const error = new Error('Invalid payment data') as Error & { errors: string[] };
    error.errors = validationErrors;
    throw error;
  }

  const supabase = await createClient();

  // Prepare metadata and get customer in parallel
  const [paymentMetadata, stripeCustomerId, orderNumber] = await Promise.all([
    Promise.resolve(preparePaymentMetadata(data)),
    getOrCreateStripeCustomer(data.user_id, data.user_email),
    generateOrderNumber(),
  ]);

  // Create payment intent with Stripe
  const paymentIntent = await stripe.paymentIntents.create({
    amount: formatAmountForStripe(data.amount),
    currency: CURRENCY,
    customer: stripeCustomerId,
    metadata: paymentMetadata,
    automatic_payment_methods: {
      enabled: true,
      allow_redirects: 'always',
    },
  });

  // Create payment and order records in parallel
  const [paymentResult, orderResult] = await Promise.all([
    supabase
      .from('payments')
      .insert({
        user_id: data.user_id,
        stripe_payment_intent_id: paymentIntent.id,
        stripe_customer_id: stripeCustomerId,
        amount: data.amount,
        currency: CURRENCY,
        status: 'pending',
        payment_type: data.payment_type,
        metadata: paymentMetadata,
      })
      .select()
      .single(),
    
    // We'll create the order after payment is created to get payment.id
    Promise.resolve(null)
  ]);

  if (paymentResult.error) {
    throw new Error(`Failed to create payment record: ${paymentResult.error.message}`);
  }

  // Create order record with payment ID
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: data.user_id,
      payment_id: paymentResult.data.id,
      order_number: orderNumber,
      total_amount: data.amount,
      currency: CURRENCY,
      status: 'pending',
      customer_name: data.metadata.userName || '',
      customer_email: data.user_email.trim().toLowerCase(),
      metadata: paymentMetadata,
    })
    .select()
    .single();

  if (orderError) {
    throw new Error(`Failed to create order record: ${orderError.message}`);
  }

  return {
    clientSecret: paymentIntent.client_secret!,
    paymentIntentId: paymentIntent.id,
    orderId: order.id,
    orderNumber: order.order_number,
  };
}

/**
 * Get payment by ID
 */
export async function getPaymentById(id: string) {
  const supabase = await createClient();

  const { data: payment, error } = await supabase
    .from('payments')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch payment: ${error.message}`);
  }

  return payment;
}

/**
 * Get payment by Stripe payment intent ID
 */
export async function getPaymentByIntentId(intentId: string) {
  const supabase = await createClient();

  const { data: payment, error } = await supabase
    .from('payments')
    .select('*')
    .eq('stripe_payment_intent_id', intentId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch payment: ${error.message}`);
  }

  return payment;
}

/**
 * Update payment status
 */
export async function updatePaymentStatus(
  id: string,
  status: 'pending' | 'succeeded' | 'failed' | 'cancelled'
) {
  const supabase = await createClient();

  const { data: payment, error } = await supabase
    .from('payments')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update payment status: ${error.message}`);
  }

  return payment;
}

/**
 * Update order status
 */
export async function updateOrderStatus(
  id: string,
  status: 'pending' | 'processing' | 'completed' | 'cancelled'
) {
  const supabase = await createClient();

  const { data: order, error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update order status: ${error.message}`);
  }

  return order;
}

/**
 * Get user payments with optional pagination
 */
export async function getUserPayments(userId: string, limit: number = 50, offset: number = 0) {
  const supabase = await createClient();

  const { data: payments, error } = await supabase
    .from('payments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new Error(`Failed to fetch user payments: ${error.message}`);
  }

  return payments || [];
}

/**
 * Get order by ID
 */
export async function getOrderById(id: string) {
  const supabase = await createClient();

  const { data: order, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch order: ${error.message}`);
  }

  return order;
}
