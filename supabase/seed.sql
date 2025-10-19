-- ============================================================================
-- SEED DATA FOR TESTING & PRE-APPROVED GYMS
-- ============================================================================

-- Test user accounts are created using scripts/create-test-users.sh.
-- All test users use password: "password123"
-- Run after migrations: ./scripts/create-test-users.sh
-- For more info: see scripts/create-test-users.sh (creates auth.users with proper password hash)

-- Summary of test users (created via script):
--   Admin:          admin@muaythai.com        / password123
--   Regular User:   user@muaythai.com         / password123
--   Partner 1:      partner1@muaythai.com     / password123
--   Partner 2:      partner2@muaythai.com     / password123
-- After creation:
--   (1) Set admin role in the database for admin@muaythai.com
--   (2) Create gym applications for partners

-- ============================================================================
-- PRE-APPROVED GYMS DATA (as shown on /gyms page)
-- These use a dummy user (system@muaythai.com) for user_id linkage
-- In production, link to real partner accounts
-- ============================================================================

DO $$
DECLARE
  v_dummy_user_id CONSTANT UUID := '00000000-0000-0000-0000-000000000001';
BEGIN
  -- Ensure dummy system user exists for gym ownership
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
    v_dummy_user_id,
    'system@muaythai.com',
    NOW(),
    '$2a$10$dummy.hash.for.system.user.only',
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    FALSE,
    'authenticated'
  ) ON CONFLICT (id) DO NOTHING;

  -- Use a record type for clean gym data insertion
  WITH gyms_data AS (
    SELECT *
    FROM (VALUES
      (
        v_dummy_user_id,
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
        'approved'
      ),
      (
        v_dummy_user_id,
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
        'approved'
      ),
      (
        v_dummy_user_id,
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
        'approved'
      ),
      (
        v_dummy_user_id,
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
        'approved'
      )
    ) AS gym(
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
      status
    )
  )
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
  )
  SELECT
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
    NOW(),
    NOW()
  FROM gyms_data
  ON CONFLICT (slug) DO NOTHING;

END $$;
