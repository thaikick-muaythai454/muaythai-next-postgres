export type TestUserInfo = {
  email: string;
  password: string;
};

function resolvePasswordVar(primary: string): string {
  const primaryValue = process.env[primary];
  if (primaryValue) {
    return primaryValue;
  }

  const fallbackValue = process.env.E2E_DEFAULT_PASSWORD;
  if (fallbackValue) {
    return fallbackValue;
  }

  throw new Error(`Missing required environment variable ${primary} or E2E_DEFAULT_PASSWORD`);
}

export const TEST_USERS: Record<'regular' | 'partner' | 'admin', TestUserInfo> = {
  regular: {
    email: process.env.E2E_REGULAR_EMAIL ?? 'e2e_regular_user@muaythai.test',
    password: resolvePasswordVar('E2E_REGULAR_PASSWORD'),
  },
  partner: {
    email: process.env.E2E_PARTNER_EMAIL ?? 'e2e_partner_user@muaythai.test',
    password: resolvePasswordVar('E2E_PARTNER_PASSWORD'),
  },
  admin: {
    email: process.env.E2E_ADMIN_EMAIL ?? 'e2e_admin_user@muaythai.test',
    password: resolvePasswordVar('E2E_ADMIN_PASSWORD'),
  },
};

export default TEST_USERS;

