DO $$
DECLARE
  v_partner_owner_id UUID;
BEGIN
  -- Prefer dedicated partner user for seed data
  SELECT id INTO v_partner_owner_id FROM auth.users WHERE email = 'partner@muaythai.com';

  IF v_partner_owner_id IS NULL THEN
    SELECT id INTO v_partner_owner_id FROM auth.users WHERE email = 'partner1@muaythai.com';
  END IF;

  IF v_partner_owner_id IS NULL THEN
    RAISE NOTICE 'Skipping gym seed data because no partner user exists (expected partner@muaythai.com or partner1@muaythai.com).';
  ELSE
    -- Use a record type for clean gym data insertion
    WITH gyms_data AS (
      SELECT *
      FROM (VALUES
        (
          v_partner_owner_id,
        'สนามมวยลุมพินี',
        'Lumpinee Boxing Stadium',
        'Lumpinee Management',
        '+66 2 251 4303',
        'contact@lumpinee.com',
        'Bangkok',
        '6 Rama IV Road, Thung Maha Mek, Sathon, Bangkok 10120',
        'One of the most prestigious Muay Thai stadiums in Thailand. Training facility with world-class trainers.',
        13.7245,
        100.5386,
        'https://maps.google.com/?q=13.7245,100.5386',
        'facebook.com/lumpinee',
        'Professional',
        'lumpinee-boxing-stadium',
        'approved'
      ),
      (
        v_partner_owner_id,
        'ค่ายมวยแฟร์เท็กซ์',
        'Fairtex Training Center',
        'Fairtex Management',
        '+66 2 316 1818',
        'info@fairtex.com',
        'Samut Prakan',
        '221/12 Moo 1, Bang Pla, Bang Phli, Samut Prakan 10540',
        'World-renowned Muay Thai training camp. Fairtex has produced many champions.',
        13.5933,
        100.7031,
        'https://maps.google.com/?q=13.5933,100.7031',
        'facebook.com/fairtex',
        'Professional',
        'fairtex-training-center',
        'approved'
      ),
      (
        v_partner_owner_id,
        'ไทเกอร์ มวยไทย',
        'Tiger Muay Thai',
        'สมชาย มวยไทย',  -- Owner: Somchai (partner1)
        '+66 76 367 071',
        'partner1@muaythai.com',  -- Partner1's email
        'Phuket',
        '7/11 Moo 5, Soi Ta-iad, Chalong, Phuket 83130',
        'Located in Phuket, Tiger Muay Thai is one of the largest and most famous training camps in the world. เจ้าของค่าย: สมชาย มวยไทย',
        7.8804,
        98.3520,
        'https://maps.google.com/?q=7.8804,98.3520',
        'facebook.com/tigermuaythai',
        'Professional',
        'tiger-muay-thai',
        'approved'
      ),
      (
        v_partner_owner_id,
        'สถาบันเพชรยินดี',
        'Petchyindee Academy',
        'Petchyindee Management',
        '+66 2 123 4567',
        'info@petchyindee.com',
        'Bangkok',
        '123 Rama IV Road, Bangkok 10110',
        'Historic gym with a legacy of producing top fighters. Traditional training methods combined with modern facilities.',
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
  END IF;

END $$;

-- ============================================================================
-- GYM PACKAGES FOR TIGER MUAY THAI (Partner 1's gym)
-- ============================================================================
DO $$
DECLARE
  v_tiger_gym_id UUID;
BEGIN
  -- Get Tiger Muay Thai gym_id
  SELECT id INTO v_tiger_gym_id FROM gyms WHERE slug = 'tiger-muay-thai';
  
  IF v_tiger_gym_id IS NOT NULL THEN
    -- Insert packages for Tiger Muay Thai
    INSERT INTO gym_packages (
      gym_id,
      name,
      name_english,
      package_type,
      duration_months,
      price,
      description,
      features,
      is_active
    ) VALUES
    -- One-time packages (ครั้งเดียว)
    (
      v_tiger_gym_id,
      'ทดลองเทรนนิ่ง 1 วัน',
      'Day Pass',
      'one_time',
      NULL,
      500.00,
      'ทดลองเทรนนิ่งมวยไทย 1 วัน พร้อมครูฝึกมืออาชีพ',
      ARRAY['เทรนนิ่งมวยไทย 1 วัน', 'ครูฝึกมืออาชีพ', 'อุปกรณ์ครบครัน', 'น้ำดื่ม'],
      true
    ),
    (
      v_tiger_gym_id,
      'ทดลองเทรนนิ่ง 1 สัปดาห์',
      'Week Pass',
      'one_time',
      NULL,
      2500.00,
      'เทรนนิ่งมวยไทย 1 สัปดาห์ เหมาะสำหรับนักท่องเที่ยว',
      ARRAY['เทรนนิ่งมวยไทย 7 วัน', 'ครูฝึกมืออาชีพ', 'อุปกรณ์ครบครัน', 'น้ำดื่ม', 'ผ้าเช็ดตัว'],
      true
    ),
    -- Monthly packages (รายเดือน)
    (
      v_tiger_gym_id,
      'แพ็คเกจ 1 เดือน',
      '1 Month Package',
      'package',
      1,
      8000.00,
      'เทรนนิ่งมวยไทย 1 เดือน เข้าได้ไม่จำกัด',
      ARRAY['เทรนนิ่งไม่จำกัด', 'ครูฝึกมืออาชีพ', 'อุปกรณ์ครบครัน', 'น้ำดื่ม', 'ผ้าเช็ดตัว', 'ฟิตเนส'],
      true
    ),
    (
      v_tiger_gym_id,
      'แพ็คเกจ 3 เดือน',
      '3 Months Package',
      'package',
      3,
      21000.00,
      'เทรนนิ่งมวยไทย 3 เดือน ประหยัดกว่า 12% (ราคาปกติ 24,000 บาท)',
      ARRAY['เทรนนิ่งไม่จำกัด', 'ครูฝึกมืออาชีพ', 'อุปกรณ์ครบครัน', 'น้ำดื่ม', 'ผ้าเช็ดตัว', 'ฟิตเนส', 'โปรแกรมอาหาร'],
      true
    ),
    (
      v_tiger_gym_id,
      'แพ็คเกจ 6 เดือน',
      '6 Months Package',
      'package',
      6,
      40000.00,
      'เทรนนิ่งมวยไทย 6 เดือน ประหยัดกว่า 17% (ราคาปกติ 48,000 บาท) คุ้มที่สุด!',
      ARRAY['เทรนนิ่งไม่จำกัด', 'ครูฝึกมืออาชีพ', 'อุปกรณ์ครบครัน', 'น้ำดื่ม', 'ผ้าเช็ดตัว', 'ฟิตเนส', 'โปรแกรมอาหาร', 'คลาส Yoga', 'นวดสปอร์ต 2 ครั้ง/เดือน'],
      true
    )
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Created packages for Tiger Muay Thai';
  ELSE
    RAISE NOTICE 'Tiger Muay Thai gym not found, skipping package creation';
  END IF;
END $$;
