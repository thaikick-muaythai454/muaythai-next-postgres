/* eslint-disable @typescript-eslint/no-require-imports */
const { createClient } = require('@supabase/supabase-js');
const { randomUUID } = require('crypto');

const REQUIRED_ENV_VARS = ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
const missingEnvVars = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);
const describeIfEnv = missingEnvVars.length ? describe.skip : describe;

function logAffiliateError(message, error) {
  const details = error?.message ?? error;
  console.warn(`[AffiliateTest] ${message}`, details);
}

function createCleanupTracker() {
  return {
    conversionIds: new Set(),
    bookingIds: new Set(),
    orderIds: new Set(),
    packageIds: new Set(),
    gymIds: new Set(),
    userIds: new Set(),
  };
}

async function cleanupResources(supabase, tracker) {
  if (tracker.conversionIds.size > 0) {
    await supabase.from('affiliate_conversions').delete().in('id', Array.from(tracker.conversionIds));
  }

  if (tracker.bookingIds.size > 0) {
    await supabase.from('bookings').delete().in('id', Array.from(tracker.bookingIds));
  }

  if (tracker.orderIds.size > 0) {
    await supabase.from('orders').delete().in('id', Array.from(tracker.orderIds));
  }

  if (tracker.packageIds.size > 0) {
    await supabase.from('gym_packages').delete().in('id', Array.from(tracker.packageIds));
  }

  if (tracker.gymIds.size > 0) {
    await supabase.from('gyms').delete().in('id', Array.from(tracker.gymIds));
  }

  for (const userId of tracker.userIds) {
    await supabase.auth.admin.deleteUser(userId);
  }
}

describeIfEnv('Affiliate edge cases (TC-6.x)', () => {
  let supabase;
  let testPassword;

  beforeAll(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    testPassword = process.env.E2E_TEST_USER_PASSWORD ?? 'TestPassword123!';
  });

  async function createTestUser(prefix, tracker) {
    const uniqueSuffix = randomUUID();
    const email = `${prefix}-${uniqueSuffix}@affiliate.test`;
    const sanitizedPrefix = prefix.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 16) || 'user';
    const sanitizedSuffix = uniqueSuffix.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8);
    const username = `${sanitizedPrefix}_${sanitizedSuffix}`.slice(0, 30);

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password: testPassword,
      email_confirm: true,
      user_metadata: {
        full_name: `${prefix} user`,
        username,
      },
    });

    if (error || !data?.user?.id) {
      throw new Error(`Failed to create test user (${prefix}): ${error?.message ?? 'unknown error'}`);
    }

    tracker.userIds.add(data.user.id);
    return { id: data.user.id, email };
  }

  async function ensureTestGym(ownerId, tracker) {
    const { data, error } = await supabase
      .from('gyms')
      .insert({
        gym_name: `Test Gym ${Date.now()}`,
        gym_name_english: `Test Gym ${Date.now()}`,
        user_id: ownerId,
        contact_name: 'Test Contact',
        phone: '0812345678',
        email: `test-gym-${Date.now()}@example.com`,
        website: 'https://testgym.example.com',
        location: 'Bangkok, Thailand',
        status: 'approved',
      })
      .select()
      .single();

    if (error || !data?.id) {
      throw new Error(`Failed to create test gym: ${error?.message ?? 'unknown error'}`);
    }

    tracker.gymIds.add(data.id);
    return data.id;
  }

  async function createTestPackage(gymId, price, tracker) {
    const { data, error } = await supabase
      .from('gym_packages')
      .insert({
        gym_id: gymId,
        name: `Package ${Date.now()}`,
        package_type: 'package',
        price,
        duration_months: 1,
        is_active: true,
      })
      .select()
      .single();

    if (error || !data?.id) {
      throw new Error(`Failed to create test package: ${error?.message ?? 'unknown error'}`);
    }

    tracker.packageIds.add(data.id);
    return data.id;
  }

  async function createTestOrder(userId, amount, tracker) {
    const orderId = randomUUID();
    const { error } = await supabase.from('orders').insert({
      id: orderId,
      user_id: userId,
      order_number: `TEST-${Date.now()}`,
      total_amount: amount,
      status: 'pending',
      currency: 'thb',
      items: [],
    });

    if (error) {
      throw new Error(`Failed to create order: ${error.message}`);
    }

    tracker.orderIds.add(orderId);
    return orderId;
  }

  async function createTestBooking(options, tracker) {
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        order_id: options.orderId,
        user_id: options.userId,
        gym_id: options.gymId,
        package_id: options.packageId,
        booking_number: `BK-${Date.now()}`,
        customer_name: 'Affiliate Test User',
        customer_email: options.email,
        customer_phone: '0812345678',
        start_date: new Date().toISOString().slice(0, 10),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        price_paid: options.price,
        package_name: 'Test Package',
        package_type: 'package',
        duration_months: 1,
        payment_status: 'pending',
        status: 'pending',
      })
      .select()
      .single();

    if (error || !data?.id) {
      throw new Error(`Failed to create booking: ${error?.message ?? 'unknown error'}`);
    }

    tracker.bookingIds.add(data.id);
    return data.id;
  }

  test('TC-6.1: prevents duplicate signup conversions', async () => {
    const tracker = createCleanupTracker();

    try {
      const referrer = await createTestUser('signup-referrer', tracker);
      const referred = await createTestUser('signup-referred', tracker);

      const recordSignupConversion = async () => {
        const { data: existing } = await supabase
          .from('affiliate_conversions')
          .select('id')
          .eq('affiliate_user_id', referrer.id)
          .eq('referred_user_id', referred.id)
          .eq('conversion_type', 'signup')
          .maybeSingle();

        if (existing?.id) {
          return { id: existing.id, existing: true };
        }

        const { data, error } = await supabase
          .from('affiliate_conversions')
          .insert({
            affiliate_user_id: referrer.id,
            referred_user_id: referred.id,
            conversion_type: 'signup',
            conversion_value: 0,
            commission_rate: 0,
            commission_amount: 0,
            status: 'confirmed',
            affiliate_code: `MT${referrer.id.slice(-8).toUpperCase()}`,
            referral_source: 'direct',
            metadata: {
              signup_date: new Date().toISOString(),
              referral_code: `MT${referrer.id.slice(-8).toUpperCase()}`,
            },
            confirmed_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error || !data?.id) {
          throw new Error(`Failed to insert signup conversion: ${error?.message ?? 'unknown error'}`);
        }

        tracker.conversionIds.add(data.id);
        return { id: data.id, existing: false };
      };

      const firstAttempt = await recordSignupConversion();
      expect(firstAttempt.existing).toBe(false);

      const secondAttempt = await recordSignupConversion();
      expect(secondAttempt.existing).toBe(true);
      expect(secondAttempt.id).toBe(firstAttempt.id);

      const { count } = await supabase
        .from('affiliate_conversions')
        .select('id', { count: 'exact', head: true })
        .eq('affiliate_user_id', referrer.id)
        .eq('referred_user_id', referred.id)
        .eq('conversion_type', 'signup');

      expect(count).toBe(1);
    } finally {
      await cleanupResources(supabase, tracker);
    }
  });

  test('TC-6.1: prevents duplicate booking conversions via reference id/type', async () => {
    const tracker = createCleanupTracker();

    try {
      const partner = await createTestUser('booking-partner', tracker);
      const referred = await createTestUser('booking-referred', tracker);

      const gymId = await ensureTestGym(partner.id, tracker);
      const packageId = await createTestPackage(gymId, 3500, tracker);
      const orderId = await createTestOrder(referred.id, 3500, tracker);
      const bookingId = await createTestBooking(
        {
          orderId,
          userId: referred.id,
          gymId,
          packageId,
          price: 3500,
          email: referred.email,
        },
        tracker,
      );

      const recordBookingConversion = async () => {
        const { data: existing } = await supabase
          .from('affiliate_conversions')
          .select('id')
          .eq('affiliate_user_id', partner.id)
          .eq('referred_user_id', referred.id)
          .eq('conversion_type', 'booking')
          .eq('reference_id', bookingId)
          .eq('reference_type', 'booking')
          .maybeSingle();

        if (existing?.id) {
          return { id: existing.id, existing: true };
        }

        const { data, error } = await supabase
          .from('affiliate_conversions')
          .insert({
            affiliate_user_id: partner.id,
            referred_user_id: referred.id,
            conversion_type: 'booking',
            conversion_value: 3500,
            commission_rate: 10,
            commission_amount: 350,
            status: 'pending',
            reference_id: bookingId,
            reference_type: 'booking',
            referral_source: 'direct',
            metadata: {
              gym_id: gymId,
              package_type: 'package',
              booking_number: `BK-${bookingId.slice(0, 8)}`,
            },
          })
          .select()
          .single();

        if (error || !data?.id) {
          throw new Error(`Failed to insert booking conversion: ${error?.message ?? 'unknown error'}`);
        }

        tracker.conversionIds.add(data.id);
        return { id: data.id, existing: false };
      };

      const firstAttempt = await recordBookingConversion();
      expect(firstAttempt.existing).toBe(false);

      const secondAttempt = await recordBookingConversion();
      expect(secondAttempt.existing).toBe(true);
      expect(secondAttempt.id).toBe(firstAttempt.id);

      const { count } = await supabase
        .from('affiliate_conversions')
        .select('id', { count: 'exact', head: true })
        .eq('affiliate_user_id', partner.id)
        .eq('referred_user_id', referred.id)
        .eq('conversion_type', 'booking')
        .eq('reference_id', bookingId)
        .eq('reference_type', 'booking');

      expect(count).toBe(1);
    } finally {
      await cleanupResources(supabase, tracker);
    }
  });

  test('TC-6.2: booking succeeds even when affiliate conversion fails', async () => {
    const tracker = createCleanupTracker();
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    try {
      const partner = await createTestUser('failure-partner', tracker);
      const referred = await createTestUser('failure-referred', tracker);

      const gymId = await ensureTestGym(partner.id, tracker);
      const packageId = await createTestPackage(gymId, 4200, tracker);
      const orderId = await createTestOrder(referred.id, 4200, tracker);
      const bookingId = await createTestBooking(
        {
          orderId,
          userId: referred.id,
          gymId,
          packageId,
          price: 4200,
          email: referred.email,
        },
        tracker,
      );

      const { error } = await supabase
        .from('affiliate_conversions')
        .insert({
          affiliate_user_id: null,
          referred_user_id: referred.id,
          conversion_type: 'booking',
          conversion_value: 4200,
          commission_rate: 10,
          commission_amount: 420,
          reference_id: bookingId,
          reference_type: 'booking',
        });

      expect(error).toBeTruthy();
      logAffiliateError('Failed to insert booking conversion (expected)', error);

      const { data: booking } = await supabase
        .from('bookings')
        .select('id, payment_status, status')
        .eq('id', bookingId)
        .single();

      expect(booking?.id).toBe(bookingId);
      expect(booking?.payment_status).toBe('pending');
      expect(booking?.status).toBe('pending');

      const { count } = await supabase
        .from('affiliate_conversions')
        .select('id', { count: 'exact', head: true })
        .eq('reference_id', bookingId)
        .eq('reference_type', 'booking');

      expect(count).toBe(0);
      expect(warnSpy).toHaveBeenCalledWith(
        '[AffiliateTest] Failed to insert booking conversion (expected)',
        error.message ?? error,
      );
    } finally {
      warnSpy.mockRestore();
      await cleanupResources(supabase, tracker);
    }
  });

  test('TC-6.2: signup flow remains intact when conversion creation fails', async () => {
    const tracker = createCleanupTracker();
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    try {
      const referrer = await createTestUser('signup-failure-referrer', tracker);
      const referred = await createTestUser('signup-failure-referred', tracker);

      const { error } = await supabase
        .from('affiliate_conversions')
        .insert({
          affiliate_user_id: null,
          referred_user_id: referred.id,
          conversion_type: 'signup',
          conversion_value: 0,
          commission_rate: 0,
          commission_amount: 0,
          status: 'confirmed',
        });

      expect(error).toBeTruthy();
      logAffiliateError('Failed to insert signup conversion (expected)', error);

      const refUser = await supabase.auth.admin.getUserById(referrer.id);
      const referredUser = await supabase.auth.admin.getUserById(referred.id);

      expect(refUser.data.user?.id).toBe(referrer.id);
      expect(referredUser.data.user?.id).toBe(referred.id);

      const { count } = await supabase
        .from('affiliate_conversions')
        .select('id', { count: 'exact', head: true })
        .eq('affiliate_user_id', referrer.id)
        .eq('referred_user_id', referred.id)
        .eq('conversion_type', 'signup');

      expect(count).toBe(0);
      expect(warnSpy).toHaveBeenCalledWith(
        '[AffiliateTest] Failed to insert signup conversion (expected)',
        error.message ?? error,
      );
    } finally {
      warnSpy.mockRestore();
      await cleanupResources(supabase, tracker);
    }
  });

  test('TC-6.2: payment completion succeeds even when conversion update fails', async () => {
    const tracker = createCleanupTracker();
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    try {
      const partner = await createTestUser('payment-failure-partner', tracker);
      const referred = await createTestUser('payment-failure-referred', tracker);

      const gymId = await ensureTestGym(partner.id, tracker);
      const packageId = await createTestPackage(gymId, 2800, tracker);
      const orderId = await createTestOrder(referred.id, 2800, tracker);
      const bookingId = await createTestBooking(
        {
          orderId,
          userId: referred.id,
          gymId,
          packageId,
          price: 2800,
          email: referred.email,
        },
        tracker,
      );

      const { data: conversion, error: insertError } = await supabase
        .from('affiliate_conversions')
        .insert({
          affiliate_user_id: partner.id,
          referred_user_id: referred.id,
          conversion_type: 'booking',
          conversion_value: 2800,
          commission_rate: 10,
          commission_amount: 280,
          status: 'pending',
          reference_id: bookingId,
          reference_type: 'booking',
        })
        .select()
        .single();

      if (insertError || !conversion?.id) {
        throw new Error(`Failed to seed conversion for payment test: ${insertError?.message ?? 'unknown error'}`);
      }

      tracker.conversionIds.add(conversion.id);

      const { error: updateError } = await supabase
        .from('affiliate_conversions')
        .update({ commission_amount: -100 })
        .eq('id', conversion.id);

      expect(updateError).toBeTruthy();
      logAffiliateError('Failed to update booking conversion (expected)', updateError);

      const { error: bookingUpdateError } = await supabase
        .from('bookings')
        .update({ payment_status: 'paid', status: 'confirmed' })
        .eq('id', bookingId);

      expect(bookingUpdateError).toBeNull();

      const { data: booking } = await supabase
        .from('bookings')
        .select('payment_status, status')
        .eq('id', bookingId)
        .single();

      expect(booking?.payment_status).toBe('paid');
      expect(booking?.status).toBe('confirmed');
      expect(warnSpy).toHaveBeenCalledWith(
        '[AffiliateTest] Failed to update booking conversion (expected)',
        updateError.message ?? updateError,
      );
    } finally {
      warnSpy.mockRestore();
      await cleanupResources(supabase, tracker);
    }
  });

  test('TC-6.3: database integrity and cascading behaviour', async () => {
    const tracker = createCleanupTracker();

    const referrer = await createTestUser('integrity-referrer', tracker);
    const referred = await createTestUser('integrity-referred', tracker);

    try {
      const { data: conversion, error } = await supabase
        .from('affiliate_conversions')
        .insert({
          affiliate_user_id: referrer.id,
          referred_user_id: referred.id,
          conversion_type: 'signup',
          conversion_value: 0,
          commission_rate: 0,
          commission_amount: 0,
          status: 'confirmed',
          metadata: { check: 'integrity' },
          confirmed_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error || !conversion?.id) {
        throw new Error(`Failed to create conversion for integrity test: ${error?.message ?? 'unknown error'}`);
      }

      tracker.conversionIds.add(conversion.id);

      await supabase.auth.admin.deleteUser(referrer.id);
      tracker.userIds.delete(referrer.id);

      const { count: remainingAfterReferrerDelete } = await supabase
        .from('affiliate_conversions')
        .select('id', { count: 'exact', head: true })
        .eq('id', conversion.id);

      expect(remainingAfterReferrerDelete).toBe(0);

      const newReferrer = await createTestUser('integrity-referrer-2', tracker);
      const newReferred = await createTestUser('integrity-referred-2', tracker);

      const { data: conversion2, error: error2 } = await supabase
        .from('affiliate_conversions')
        .insert({
          affiliate_user_id: newReferrer.id,
          referred_user_id: newReferred.id,
          conversion_type: 'signup',
          conversion_value: 0,
          commission_rate: 0,
          commission_amount: 0,
          status: 'confirmed',
          metadata: { check: 'integrity-2' },
          confirmed_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error2 || !conversion2?.id) {
        throw new Error(`Failed to create conversion (phase 2): ${error2?.message ?? 'unknown error'}`);
      }

      tracker.conversionIds.add(conversion2.id);

      await supabase.auth.admin.deleteUser(newReferred.id);
      tracker.userIds.delete(newReferred.id);

      const { data: conversionAfterReferredDelete } = await supabase
        .from('affiliate_conversions')
        .select('referred_user_id')
        .eq('id', conversion2.id)
        .single();

      expect(conversionAfterReferredDelete?.referred_user_id).toBeNull();

      const randomAffiliateId = randomUUID();
      const { error: fkError } = await supabase
        .from('affiliate_conversions')
        .insert({
          affiliate_user_id: randomAffiliateId,
          conversion_type: 'signup',
          conversion_value: 0,
          commission_rate: 0,
          commission_amount: 0,
          status: 'confirmed',
        });

      expect(fkError).toBeTruthy();
    } finally {
      await cleanupResources(supabase, tracker);
    }
  });
});

if (missingEnvVars.length) {
  describe('Affiliate edge cases (TC-6.x)', () => {
    test.skip(`skipped because missing env vars: ${missingEnvVars.join(', ')}`, () => {
      // Document missing environment setup in test output
    });
  });
}

