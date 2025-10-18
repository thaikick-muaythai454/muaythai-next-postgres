-- ============================================================================
-- SEED DATA FOR TESTING
-- ============================================================================
-- NOTE: Test users are created via scripts/create-test-users.sh
-- All test users have the password: "password123"
-- Run: ./scripts/create-test-users.sh after running migrations
-- ============================================================================

-- NOTE: auth.users are now created via Admin API script (see scripts/create-test-users.sh)
-- This ensures passwords are hashed correctly by Supabase Auth

-- ============================================================================
-- SEED DATA SUMMARY
-- ============================================================================
-- To create test users, run: ./scripts/create-test-users.sh
--
-- Test Users:
--   Admin: admin@muaythai.com / password123
--   Regular User: user@muaythai.com / password123
--   Partner 1: partner1@muaythai.com / password123
--   Partner 2: partner2@muaythai.com / password123
--
-- After creating users via the script, you can:
--   1. Set admin role manually in database
--   2. Create gym applications for partners
-- ============================================================================

-- ============================================================================
-- APPROVED GYMS DATA (For /gyms page)
-- ============================================================================
-- These are pre-approved gyms to display on the public gyms page
-- NOTE: We use a dummy user_id here. In production, these should be linked to real partner accounts
-- ============================================================================

DO $$
DECLARE
  dummy_user_id UUID;
BEGIN
  -- Create a dummy user for system-generated gyms
  INSERT INTO auth.users (
    id,
    email,
    email_confirmed_at,
    encrypted_password,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role
  ) VALUES (
    '00000000-0000-0000-0000-000000000001'::UUID,
    'system@muaythai.com',
    NOW(),
    '$2a$10$dummy.hash.for.system.user.only',
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false,
    'authenticated'
  ) ON CONFLICT (id) DO NOTHING;

  dummy_user_id := '00000000-0000-0000-0000-000000000001'::UUID;

  -- Insert approved gyms based on mock data
  INSERT INTO gyms (
    user_id,
    gym_name,
    gym_name_english,
    contact_name,
    phone,
    email,
    location,
    address,
    gym_details,
    rating,
    latitude,
    longitude,
    map_url,
    socials,
    gym_type,
    slug,
    status,
    created_at,
    updated_at
  ) VALUES
  -- Lumpinee Boxing Stadium
  (
    dummy_user_id,
    'สนามมวยลุมพินี',
    'Lumpinee Boxing Stadium',
    'Lumpinee Management',
    '+66 2 251 4303',
    'contact@lumpinee.com',
    'Bangkok',
    '6 Rama IV Road, Thung Maha Mek, Sathon, Bangkok 10120',
    'One of the most prestigious Muay Thai stadiums in Thailand. Training facility with world-class trainers.',
    4.8,
    13.7245,
    100.5386,
    'https://maps.google.com/?q=13.7245,100.5386',
    'facebook.com/lumpinee',
    'Professional',
    'lumpinee-boxing-stadium',
    'approved',
    NOW(),
    NOW()
  ),
  -- Fairtex Training Center
  (
    dummy_user_id,
    'ค่ายมวยแฟร์เท็กซ์',
    'Fairtex Training Center',
    'Fairtex Management',
    '+66 2 316 1818',
    'info@fairtex.com',
    'Samut Prakan',
    '221/12 Moo 1, Bang Pla, Bang Phli, Samut Prakan 10540',
    'World-renowned Muay Thai training camp. Fairtex has produced many champions.',
    4.9,
    13.5933,
    100.7031,
    'https://maps.google.com/?q=13.5933,100.7031',
    'facebook.com/fairtex',
    'Professional',
    'fairtex-training-center',
    'approved',
    NOW(),
    NOW()
  ),
  -- Tiger Muay Thai
  (
    dummy_user_id,
    'ไทเกอร์ มวยไทย',
    'Tiger Muay Thai',
    'Tiger Muay Thai Management',
    '+66 76 367 071',
    'info@tigermuaythai.com',
    'Phuket',
    '7/11 Moo 5, Soi Ta-iad, Chalong, Phuket 83130',
    'Located in Phuket, Tiger Muay Thai is one of the largest and most famous training camps in the world.',
    4.7,
    7.8804,
    98.3520,
    'https://maps.google.com/?q=7.8804,98.3520',
    'facebook.com/tigermuaythai',
    'Professional',
    'tiger-muay-thai',
    'approved',
    NOW(),
    NOW()
  ),
  -- Petchyindee Academy
  (
    dummy_user_id,
    'สถาบันเพชรยินดี',
    'Petchyindee Academy',
    'Petchyindee Management',
    '+66 2 123 4567',
    'info@petchyindee.com',
    'Bangkok',
    '123 Rama IV Road, Bangkok 10110',
    'Historic gym with a legacy of producing top fighters. Traditional training methods combined with modern facilities.',
    4.6,
    13.7563,
    100.5018,
    'https://maps.google.com/?q=13.7563,100.5018',
    'facebook.com/petchyindee',
    'Professional',
    'petchyindee-academy',
    'approved',
    NOW(),
    NOW()
  )
  ON CONFLICT (slug) DO NOTHING;

END $$;
