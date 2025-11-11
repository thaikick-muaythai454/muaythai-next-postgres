import { awardReferralBookingPoints, revokeReferralBookingPoints, REFERRAL_BOOKING_POINTS } from '@/services/referral.service';
import { awardPoints } from '@/services/gamification.service';
import { createClient } from '@/lib/database/supabase/server';

jest.mock('@/services/gamification.service', () => ({
  awardPoints: jest.fn(),
}));

jest.mock('@/lib/database/supabase/server', () => ({
  createClient: jest.fn(),
}));

type PointsHistoryEntry = {
  id: string;
  user_id: string;
  points: number;
  action_type: string;
  reference_id: string;
  reference_type: string;
};

type PointsHistoryStubConfig = {
  singleResponses?: Array<PointsHistoryEntry | null>;
  listResponses?: PointsHistoryEntry[][];
};

const awardPointsMock = awardPoints as jest.MockedFunction<typeof awardPoints>;
const createClientMock = createClient as jest.MockedFunction<typeof createClient>;

function createConversionTableStub(conversion: Record<string, unknown> | null) {
  const table: any = {};
  table.select = jest.fn().mockReturnValue(table);
  table.eq = jest.fn().mockReturnValue(table);
  table.maybeSingle = jest.fn().mockResolvedValue({
    data: conversion,
    error: null,
  });
  table.update = jest.fn().mockReturnValue({
    eq: jest.fn().mockResolvedValue({ data: null, error: null }),
  });
  return table;
}

function createBookingTableStub(booking: Record<string, unknown> | null) {
  const table: any = {};
  table.select = jest.fn().mockReturnValue(table);
  table.eq = jest.fn().mockReturnValue(table);
  table.maybeSingle = jest.fn().mockResolvedValue({
    data: booking,
    error: null,
  });
  return table;
}

function createPointsHistoryStubFactory(config: PointsHistoryStubConfig = {}) {
  let singleIndex = 0;
  let listIndex = 0;

  return () => {
    const table: any = {};
    table.select = jest.fn().mockReturnValue(table);
    table.eq = jest.fn().mockReturnValue(table);
    table.in = jest.fn().mockReturnValue(table);
    table.order = jest.fn().mockReturnValue(table);
    table.maybeSingle = jest.fn().mockImplementation(async () => {
      const data =
        config.singleResponses && singleIndex < config.singleResponses.length
          ? config.singleResponses[singleIndex]
          : null;
      singleIndex += 1;
      return { data, error: null };
    });
    table.then = (resolve: (value: { data: PointsHistoryEntry[]; error: null }) => void) => {
      const data =
        config.listResponses && listIndex < config.listResponses.length
          ? config.listResponses[listIndex]
          : [];
      listIndex += 1;
      resolve({ data, error: null });
    };
    return table;
  };
}

function createSupabaseStub(options: {
  conversion: Record<string, unknown> | null;
  booking: Record<string, unknown> | null;
  pointsHistory?: PointsHistoryStubConfig;
}) {
  const conversionStub = createConversionTableStub(options.conversion);
  const bookingStub = createBookingTableStub(options.booking);
  const pointsHistoryFactory = createPointsHistoryStubFactory(options.pointsHistory);

  return {
    from: jest.fn((table: string) => {
      switch (table) {
        case 'affiliate_conversions':
          return conversionStub;
        case 'bookings':
          return bookingStub;
        case 'points_history':
          return pointsHistoryFactory();
        default:
          throw new Error(`Unhandled table ${table} in supabase stub`);
      }
    }),
  };
}

describe('referral booking points service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    createClientMock.mockReset();
  });

  it('awards points to referrer and referred user when no history exists', async () => {
    const supabaseStub = createSupabaseStub({
      conversion: {
        id: 'conv_1',
        affiliate_user_id: 'referrer-user',
        referred_user_id: 'referred-user',
        status: 'confirmed',
        metadata: null,
      },
      booking: {
        id: 'booking_1',
        user_id: 'referred-user',
        price_paid: 1500,
        booking_number: 'BK0001',
      },
      pointsHistory: {
        singleResponses: [null, null],
      },
    });

    awardPointsMock.mockResolvedValue(null);

    await awardReferralBookingPoints({
      bookingId: 'booking_1',
      supabase: supabaseStub as any,
    });

    expect(awardPointsMock).toHaveBeenCalledTimes(2);
    expect(awardPointsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'referrer-user',
        points: REFERRAL_BOOKING_POINTS.referrer,
        reference_type: 'booking_referral_referrer',
      }),
    );
    expect(awardPointsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'referred-user',
        points: REFERRAL_BOOKING_POINTS.referred,
        reference_type: 'booking_referral_referred',
      }),
    );
  });

  it('does not double award points if referrer already has an entry', async () => {
    const supabaseStub = createSupabaseStub({
      conversion: {
        id: 'conv_2',
        affiliate_user_id: 'referrer-user',
        referred_user_id: 'referred-user',
        status: 'confirmed',
        metadata: null,
      },
      booking: {
        id: 'booking_2',
        user_id: 'referred-user',
        price_paid: 2000,
        booking_number: 'BK0002',
      },
      pointsHistory: {
        singleResponses: [{ id: 'existing' } as any, null],
      },
    });

    awardPointsMock.mockResolvedValue(null);

    await awardReferralBookingPoints({
      bookingId: 'booking_2',
      supabase: supabaseStub as any,
    });

    expect(awardPointsMock).toHaveBeenCalledTimes(1);
    expect(awardPointsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'referred-user',
        reference_type: 'booking_referral_referred',
      }),
    );
  });

  it('reverses referral points when booking is refunded', async () => {
    const supabaseStub = createSupabaseStub({
      conversion: {
        id: 'conv_3',
        affiliate_user_id: 'referrer-user',
        referred_user_id: 'referred-user',
        status: 'confirmed',
        metadata: {},
      },
      booking: {
        id: 'booking_3',
        user_id: 'referred-user',
        price_paid: 1800,
        booking_number: 'BK0003',
      },
      pointsHistory: {
        singleResponses: [null, null, null, null],
        listResponses: [
          [
            {
              id: 'history_referrer',
              user_id: 'referrer-user',
              points: REFERRAL_BOOKING_POINTS.referrer,
              action_type: 'referral',
              reference_id: 'booking_3',
              reference_type: 'booking_referral_referrer',
            },
          ],
          [
            {
              id: 'history_referred',
              user_id: 'referred-user',
              points: REFERRAL_BOOKING_POINTS.referred,
              action_type: 'referral',
              reference_id: 'booking_3',
              reference_type: 'booking_referral_referred',
            },
          ],
        ],
      },
    });

    awardPointsMock.mockResolvedValue(null);

    await revokeReferralBookingPoints({
      bookingId: 'booking_3',
      supabase: supabaseStub as any,
    });

    expect(awardPointsMock).toHaveBeenCalledTimes(2);
    expect(awardPointsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'referrer-user',
        points: -REFERRAL_BOOKING_POINTS.referrer,
        reference_type: 'booking_referral_referrer_reversal',
      }),
    );
    expect(awardPointsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'referred-user',
        points: -REFERRAL_BOOKING_POINTS.referred,
        reference_type: 'booking_referral_referred_reversal',
      }),
    );
  });
});

