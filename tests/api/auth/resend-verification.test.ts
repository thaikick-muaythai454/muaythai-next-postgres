import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import type { NextRequest } from "next/server";

type SendVerificationPayload = {
  to: string;
  otp: string;
  fullName: string;
};

const sendVerificationEmailMock = jest.fn() as jest.MockedFunction<
  (payload: SendVerificationPayload) => Promise<{ success: boolean; error?: string }>
>;

const createAdminClientMock = jest.fn() as jest.MockedFunction<() => unknown>;

jest.mock("@supabase/ssr", () => ({
  createServerClient: jest.fn(() => ({})),
}));

jest.mock("../../../src/lib/email/resend", () => ({
  sendVerificationEmail: sendVerificationEmailMock,
}));

jest.mock("../../../src/lib/database/supabase/server", () => ({
  createAdminClient: createAdminClientMock,
}));

let POST: (request: NextRequest | Request) => Promise<Response>;
let PUT: (request: NextRequest | Request) => Promise<Response>;

const createJsonRequest = (
  method: "POST" | "PUT",
  body: Record<string, unknown>
) =>
  new Request("http://localhost/api/auth/resend-verification", {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  }) as unknown as NextRequest;

describe("API: /api/auth/resend-verification", () => {
  beforeAll(async () => {
    const routeModule = await import(
      "../../../src/app/api/auth/resend-verification/route"
    );
    POST = routeModule.POST as (
      request: NextRequest | Request
    ) => Promise<Response>;
    PUT = routeModule.PUT as (
      request: NextRequest | Request
    ) => Promise<Response>;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    sendVerificationEmailMock.mockReset();
    createAdminClientMock.mockReset();
    sendVerificationEmailMock.mockResolvedValue({ success: true });
  });

  describe('POST /api/auth/resend-verification', () => {
    it('returns 400 when email is invalid', async () => {
      const request = createJsonRequest('POST', { email: 'invalid-email' });

      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body).toEqual({
        success: false,
        error: "Invalid email format",
      });
      expect(sendVerificationEmailMock).not.toHaveBeenCalled();
    });

    it('returns 200 and sends OTP when email is valid', async () => {
      const request = createJsonRequest('POST', {
        email: 'user-success@example.com',
        fullName: 'Test User',
      });

      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toEqual({
        success: true,
        message: "Verification email sent successfully",
      });
      expect(sendVerificationEmailMock).toHaveBeenCalledTimes(1);
      const callArgs = sendVerificationEmailMock.mock.calls[0]?.[0];
      expect(callArgs?.to).toBe('user-success@example.com');
      expect(typeof callArgs?.otp).toBe('string');
      expect(callArgs?.otp?.length).toBe(6);
    });
  });

  describe('PUT /api/auth/resend-verification', () => {
    it('returns 400 when OTP has not been generated', async () => {
      const request = createJsonRequest('PUT', {
        email: 'no-otp@example.com',
        otp: '000000',
        username: 'nootp',
        fullName: 'No OTP',
        phone: '0123456789',
        password: 'StrongPass123!',
      });

      const response = await PUT(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body).toEqual({
        success: false,
        error: 'OTP not found or expired',
      });
      expect(createAdminClientMock).not.toHaveBeenCalled();
    });

    it('creates user profile when OTP is valid', async () => {
      let capturedOtp = '';
      sendVerificationEmailMock.mockImplementation(async (payload) => {
        capturedOtp = payload.otp;
        return { success: true };
      });

      const postRequest = createJsonRequest('POST', {
        email: 'otp-user@example.com',
        fullName: 'OTP User',
      });
      await POST(postRequest);

      const profilesSelectEqMock = jest.fn(async () => ({ data: [], error: null }));
      const profilesSelectMock = jest.fn(() => ({ eq: profilesSelectEqMock }));
      const profilesInsertMock = jest.fn(async () => ({ error: null }));
      const userRolesInsertMock = jest.fn(async () => ({ error: null }));
      const userPointsInsertMock = jest.fn(async () => ({ error: null }));

      createAdminClientMock.mockReturnValue({
        from: jest.fn((table: string) => {
          switch (table) {
            case 'profiles':
              return {
                select: profilesSelectMock,
                insert: profilesInsertMock,
              };
            case 'user_roles':
              return {
                insert: userRolesInsertMock,
              };
            case 'user_points':
              return {
                insert: userPointsInsertMock,
              };
            default:
              return {
                insert: jest.fn(),
              };
          }
        }),
        auth: {
          admin: {
            listUsers: jest.fn(async () => ({
              data: { users: [] },
              error: null,
            })),
            createUser: jest.fn(async () => ({
              data: { user: { id: 'user-123' } },
              error: null,
            })),
          },
        },
      });

      const putRequest = createJsonRequest('PUT', {
        email: 'otp-user@example.com',
        otp: capturedOtp,
        username: 'otpuser',
        fullName: 'OTP User',
        phone: '0123456789',
        password: 'StrongPass123!',
      });

      const response = await PUT(putRequest);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.user.id).toBe('user-123');
      expect(createAdminClientMock).toHaveBeenCalledTimes(1);
      expect(profilesSelectMock).toHaveBeenCalledTimes(1);
      expect(profilesInsertMock).toHaveBeenCalledTimes(1);
      expect(userRolesInsertMock).toHaveBeenCalledTimes(1);
      expect(userPointsInsertMock).toHaveBeenCalledTimes(1);
    });
  });
});
