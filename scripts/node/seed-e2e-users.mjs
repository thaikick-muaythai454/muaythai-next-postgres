import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

function requireEnv(name, fallback) {
  const value = process.env[name] ?? fallback;

  if (!value) {
    throw new Error(`Missing required environment variable ${name}`);
  }

  return value;
}

const TEST_USERS = [
  {
    email: requireEnv('E2E_REGULAR_EMAIL', 'e2e_regular_user@muaythai.test'),
    password: requireEnv('E2E_REGULAR_PASSWORD'),
    role: 'authenticated',
    username: 'e2e_regular_user',
    fullName: 'E2E Regular User',
  },
  {
    email: requireEnv('E2E_PARTNER_EMAIL', 'e2e_partner_user@muaythai.test'),
    password: requireEnv('E2E_PARTNER_PASSWORD'),
    role: 'partner',
    username: 'e2e_partner_user',
    fullName: 'E2E Partner User',
  },
  {
    email: requireEnv('E2E_ADMIN_EMAIL', 'e2e_admin_user@muaythai.test'),
    password: requireEnv('E2E_ADMIN_PASSWORD'),
    role: 'admin',
    username: 'e2e_admin_user',
    fullName: 'E2E Admin User',
  },
];

async function findUserByEmail(email) {
  let page = 1;
  const perPage = 200;

  while (page <= 10) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) {
      throw new Error(`Failed to list users: ${error.message}`);
    }

    const match = data.users.find((user) => user.email === email) ?? null;
    if (match) {
      return match;
    }

    if (data.users.length < perPage) {
      break;
    }

    page += 1;
  }

  return null;
}

async function ensureUser(definition) {
  console.log(`\n→ Seeding user ${definition.email} (${definition.role})`);

  let user = await findUserByEmail(definition.email);

  if (!user) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: definition.email,
      password: definition.password,
      email_confirm: true,
      user_metadata: {
        username: definition.username,
        full_name: definition.fullName,
      },
    });

    if (error) {
      throw new Error(`Failed to create user ${definition.email}: ${error.message}`);
    }

    user = data.user ?? null;
  } else {
    const { error } = await supabase.auth.admin.updateUserById(user.id, {
      password: definition.password,
      email_confirm: true,
      user_metadata: {
        ...(user.user_metadata ?? {}),
        username: definition.username,
        full_name: definition.fullName,
      },
    });

    if (error) {
      throw new Error(`Failed to update user ${definition.email}: ${error.message}`);
    }
  }

  if (!user) {
    throw new Error(`User record missing for ${definition.email}`);
  }

  const userId = user.id;

  const { error: profileError } = await supabase.from('profiles').upsert(
    {
      user_id: userId,
      full_name: definition.fullName,
      username: definition.username,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  );

  if (profileError) {
    throw new Error(`Failed to upsert profile for ${definition.email}: ${profileError.message}`);
  }

  const { error: roleError } = await supabase.from('user_roles').upsert(
    {
      user_id: userId,
      role: definition.role,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  );

  if (roleError) {
    throw new Error(`Failed to upsert user role for ${definition.email}: ${roleError.message}`);
  }

  if (definition.role === 'partner') {
    const { error: partnerError } = await supabase.from('partner_profiles').upsert(
      {
        user_id: userId,
        business_name: definition.fullName,
        contact_email: definition.email,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    );

    if (partnerError) {
      const code = partnerError.code ?? '';
      const message = partnerError.message ?? '';
      const tableMissing = code === '42P01' || code === 'PGRST102' || code === 'PGRST302' || message.includes('Could not find the table');

      if (tableMissing) {
        console.warn(`⚠️  Skipping partner_profiles upsert: ${message}`);
      } else {
        throw new Error(`Failed to upsert partner profile for ${definition.email}: ${message}`);
      }
    }
  }

  console.log(`✓ User ready: ${definition.email}`);
}

async function main() {
  try {
    for (const user of TEST_USERS) {
      await ensureUser(user);
    }

    console.log('\n✅ Playwright test users are ready.');
    console.log('   Emails:');
    TEST_USERS.forEach((user) => {
      console.log(`   - ${user.role}: ${user.email}`);
    });
  } catch (error) {
    console.error('\n❌ Failed to seed Playwright users.');
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

await main();

