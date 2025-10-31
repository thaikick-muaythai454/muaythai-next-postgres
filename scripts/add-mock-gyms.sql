-- ============================================================================
-- ADD MOCK GYMS TO SUPABASE
-- ============================================================================
-- Script สำหรับเพิ่มค่ายมวยจำลองเข้าไปใน Supabase
-- วิธีใช้: Copy & Paste ไฟล์นี้ไปรันใน Supabase SQL Editor
-- ============================================================================

DO $$
DECLARE
  v_system_user_id UUID;
  v_admin_user_id UUID;
  v_gym_id UUID;
BEGIN
  -- หา system user หรือ admin user สำหรับเป็น owner
  -- ถ้าไม่มี system user ให้ใช้ admin แทน
  
  -- ลองหา system user ก่อน
  SELECT id INTO v_system_user_id 
  FROM auth.users 
  WHERE email = 'system@muaythai.com' 
  LIMIT 1;
  
  -- ถ้าไม่มี system user ให้หา admin
  IF v_system_user_id IS NULL THEN
    SELECT id INTO v_admin_user_id 
    FROM auth.users 
    WHERE email = 'admin@muaythai.com' 
    LIMIT 1;
    
    v_system_user_id := v_admin_user_id;
  END IF;
  
  -- ถ้ายังไม่มี user เลย ให้สร้าง system user ใหม่
  IF v_system_user_id IS NULL THEN
    v_system_user_id := '00000000-0000-0000-0000-000000000001';
    
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
      v_system_user_id,
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
  END IF;

  -- ============================================================================
  -- เพิ่มค่ายมวยจำลอง
  -- ============================================================================
  
  -- 1. ค่ายมวยในกรุงเทพ
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
    services,
    created_at,
    updated_at
  ) VALUES (
    v_system_user_id,
    'ค่ายมวยราชดำเนิน',
    'Rajadamnern Muay Thai Gym',
    '记录的 管理',
    '+66 2 223 1441',
    'info@rajadamnern.com',
    'Bangkok',
    '1 Ratchadamnoen Nok Road, Pom Prap Sattru Phai, Bangkok 10100',
    'ค่ายมวยราชดำเนินเป็นหนึ่งในสนามมวยที่เก่าแก่ที่สุดในประเทศไทย ตั้งอยู่ใจกลางกรุงเทพฯ มีประวัติศาสตร์ยาวนานและผลิตนักมวยระดับโลกมากมาย',
    13.7580,
    100.5014,
    'https://maps.google.com/?q=13.7580,100.5014',
    'facebook.com/rajadamnern',
    'Traditional',
    'rajadamnern-muay-thai-gym',
    'approved',
    ARRAY['เทรนนิ่งมวยไทย', 'ฟิตเนส', 'นวดสปอร์ต', 'อุปกรณ์มวย', 'ที่จอดรถ'],
    NOW(),
    NOW()
  ) ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO v_gym_id;

  -- เพิ่มแพ็คเกจให้ค่ายมวยราชดำเนิน
  IF v_gym_id IS NOT NULL THEN
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
    (
      v_gym_id,
      'ทดลอง 1 วัน',
      'Day Pass',
      'one_time',
      NULL,
      400.00,
      'ทดลองเทรนนิ่งมวยไทย 1 วัน',
      ARRAY['เทรนนิ่ง 1 วัน', 'ครูฝึก', 'อุปกรณ์'],
      true
    ),
    (
      v_gym_id,
      'แพ็คเกจ 1 เดือน',
      '1 Month Package',
      'package',
      1,
      6000.00,
      'เทรนนิ่งมวยไทย 1 เดือน ไม่จำกัด',
      ARRAY['เทรนนิ่งไม่จำกัด', 'ครูฝึก', 'อุปกรณ์', 'ฟิตเนส'],
      true
    ) ON CONFLICT DO NOTHING;
  END IF;

  -- 2. ค่ายมวยในเชียงใหม่
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
    services,
    created_at,
    updated_at
  ) VALUES (
    v_system_user_id,
    'ค่ายมวยดอยสุเทพ',
    'Doi Suthep Muay Thai Camp',
    'นพดล มวยไทย',
    '+66 53 123 456',
    'info@doisuthep.com',
    'Chiang Mai',
    '123 Suthep Road, Suthep, Mueang Chiang Mai, Chiang Mai 50200',
    'ค่ายมวยตั้งอยู่ใกล้ดอยสุเทพ มีบรรยากาศธรรมชาติ เหมาะสำหรับผู้ที่ต้องการเทรนนิ่งพร้อมพักผ่อนในบรรยากาศภูเขา',
    18.7883,
    98.9427,
    'https://maps.google.com/?q=18.7883,98.9427',
    'facebook.com/doisuthep',
    'Traditional',
    'doi-suthep-muay-thai-camp',
    'approved',
    ARRAY['เทรนนิ่งมวยไทย', 'ที่พัก', 'อาหาร', 'นวดสปอร์ต'],
    NOW(),
    NOW()
  ) ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO v_gym_id;

  IF v_gym_id IS NOT NULL THEN
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
    (
      v_gym_id,
      'แพ็คเกจ 1 สัปดาห์ (พร้อมที่พัก)',
      '1 Week Package with Accommodation',
      'one_time',
      NULL,
      3500.00,
      'เทรนนิ่ง 1 สัปดาห์ พร้อมที่พัก',
      ARRAY['เทรนนิ่ง 7 วัน', 'ที่พัก 7 คืน', 'อาหาร 3 มื้อ', 'ครูฝึก'],
      true
    ),
    (
      v_gym_id,
      'แพ็คเกจ 1 เดือน',
      '1 Month Package',
      'package',
      1,
      5500.00,
      'เทรนนิ่ง 1 เดือน',
      ARRAY['เทรนนิ่งไม่จำกัด', 'ครูฝึก', 'อุปกรณ์'],
      true
    ) ON CONFLICT DO NOTHING;
  END IF;

  -- 3. ค่ายมวยในพัทยา
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
    services,
    created_at,
    updated_at
  ) VALUES (
    v_system_user_id,
    'ค่ายมวยพัทยา',
    'Pattaya Muay Thai Academy',
    'สมศักดิ์ มวยไทย',
    '+66 38 123 456',
    'info@pattayamuaythai.com',
    'Pattaya',
    '456 Beach Road, Pattaya, Chonburi 20150',
    'ค่ายมวยใกล้ชายหาดพัทยา เหมาะสำหรับนักท่องเที่ยวที่ต้องการเทรนนิ่งพร้อมท่องเที่ยว',
    12.9236,
    100.8825,
    'https://maps.google.com/?q=12.9236,100.8825',
    'facebook.com/pattayamuaythai',
    'Modern',
    'pattaya-muay-thai-academy',
    'approved',
    ARRAY['เทรนนิ่งมวยไทย', 'ฟิตเนส', 'สระว่ายน้ำ', 'อาหาร', 'ที่จอดรถ'],
    NOW(),
    NOW()
  ) ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO v_gym_id;

  IF v_gym_id IS NOT NULL THEN
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
    (
      v_gym_id,
      'ทดลอง 1 วัน',
      'Day Pass',
      'one_time',
      NULL,
      500.00,
      'ทดลองเทรนนิ่ง 1 วัน',
      ARRAY['เทรนนิ่ง 1 วัน', 'ครูฝึก', 'อุปกรณ์', 'ใช้สระว่ายน้ำ'],
      true
    ),
    (
      v_gym_id,
      'แพ็คเกจ 1 สัปดาห์',
      '1 Week Package',
      'one_time',
      NULL,
      3000.00,
      'เทรนนิ่ง 1 สัปดาห์',
      ARRAY['เทรนนิ่ง 7 วัน', 'ครูฝึก', 'อุปกรณ์', 'ฟิตเนส', 'สระว่ายน้ำ'],
      true
    ),
    (
      v_gym_id,
      'แพ็คเกจ 1 เดือน',
      '1 Month Package',
      'package',
      1,
      7000.00,
      'เทรนนิ่ง 1 เดือน ไม่จำกัด',
      ARRAY['เทรนนิ่งไม่จำกัด', 'ครูฝึก', 'อุปกรณ์', 'ฟิตเนส', 'สระว่ายน้ำ', 'คลาส Yoga'],
      true
    ) ON CONFLICT DO NOTHING;
  END IF;

  -- 4. ค่ายมวยในภูเก็ต
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
    services,
    created_at,
    updated_at
  ) VALUES (
    v_system_user_id,
    'ค่ายมวยภูเก็ต บีช',
    'Phuket Beach Muay Thai',
    'ประเสริฐ มวยไทย',
    '+66 76 234 567',
    'info@phuketbeach.com',
    'Phuket',
    '789 Patong Beach Road, Patong, Phuket 83150',
    'ค่ายมวยใกล้หาดป่าตอง มีบรรยากาศแบบรีสอร์ท เหมาะสำหรับผู้ที่ต้องการเทรนนิ่งพร้อมพักผ่อน',
    7.8804,
    98.3520,
    'https://maps.google.com/?q=7.8804,98.3520',
    'facebook.com/phuketbeach',
    'Modern',
    'phuket-beach-muay-thai',
    'approved',
    ARRAY['เทรนนิ่งมวยไทย', 'ฟิตเนส', 'สระว่ายน้ำ', 'ที่พัก', 'อาหาร', 'นวดสปอร์ต'],
    NOW(),
    NOW()
  ) ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO v_gym_id;

  IF v_gym_id IS NOT NULL THEN
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
    (
      v_gym_id,
      'แพ็คเกจ 1 สัปดาห์ (พร้อมที่พัก)',
      '1 Week Package with Accommodation',
      'one_time',
      NULL,
      4500.00,
      'เทรนนิ่ง 1 สัปดาห์ พร้อมที่พัก',
      ARRAY['เทรนนิ่ง 7 วัน', 'ที่พัก 7 คืน', 'อาหาร 3 มื้อ', 'ครูฝึก', 'ใช้สระว่ายน้ำ'],
      true
    ),
    (
      v_gym_id,
      'แพ็คเกจ 1 เดือน',
      '1 Month Package',
      'package',
      1,
      7500.00,
      'เทรนนิ่ง 1 เดือน ไม่จำกัด',
      ARRAY['เทรนนิ่งไม่จำกัด', 'ครูฝึก', 'อุปกรณ์', 'ฟิตเนส', 'สระว่ายน้ำ'],
      true
    ) ON CONFLICT DO NOTHING;
  END IF;

  -- 5. ค่ายมวยในอีสาน
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
    services,
    created_at,
    updated_at
  ) VALUES (
    v_system_user_id,
    'ค่ายมวยอีสาน ฟิตเนส',
    'Isan Fitness & Muay Thai',
    'วิชัย มวยไทย',
    '+66 43 345 678',
    'info@isanfitness.com',
    'Khon Kaen',
    '321 Mittraphap Road, Mueang Khon Kaen, Khon Kaen 40000',
    'ค่ายมวยและฟิตเนสในจังหวัดขอนแก่น มีอุปกรณ์ครบครัน เหมาะสำหรับผู้ที่ต้องการเทรนนิ่งแบบครบวงจร',
    16.4322,
    102.8236,
    'https://maps.google.com/?q=16.4322,102.8236',
    'facebook.com/isanfitness',
    'Modern',
    'isan-fitness-muay-thai',
    'approved',
    ARRAY['เทรนนิ่งมวยไทย', 'ฟิตเนส', 'โยคะ', 'Pilates', 'คาร์ดิโอ', 'อุปกรณ์'],
    NOW(),
    NOW()
  ) ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO v_gym_id;

  IF v_gym_id IS NOT NULL THEN
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
    (
      v_gym_id,
      'ทดลอง 1 วัน',
      'Day Pass',
      'one_time',
      NULL,
      300.00,
      'ทดลองเทรนนิ่ง 1 วัน',
      ARRAY['เทรนนิ่ง 1 วัน', 'ใช้ฟิตเนส', 'อุปกรณ์'],
      true
    ),
    (
      v_gym_id,
      'แพ็คเกจ 1 เดือน',
      '1 Month Package',
      'package',
      1,
      4500.00,
      'เทรนนิ่ง 1 เดือน ไม่จำกัด',
      ARRAY['เทรนนิ่งไม่จำกัด', 'ฟิตเนส', 'อุปกรณ์', 'คลาส Yoga', 'คลาส Pilates'],
      true
    ),
    (
      v_gym_id,
      'แพ็คเกจ 3 เดือน',
      '3 Months Package',
      'package',
      3,
      12000.00,
      'เทรนนิ่ง 3 เดือน ประหยัดกว่า',
      ARRAY['เทรนนิ่งไม่จำกัด', 'ฟิตเนส', 'อุปกรณ์', 'คลาส Yoga', 'คลาส Pilates', 'ส่วนลด 11%'],
      true
    ) ON CONFLICT DO NOTHING;
  END IF;

  RAISE NOTICE '✅ เพิ่มค่ายมวยจำลองเรียบร้อยแล้ว!';
  RAISE NOTICE '📋 เพิ่มทั้งหมด 5 ค่ายมวย:';
  RAISE NOTICE '   1. ค่ายมวยราชดำเนิน (Bangkok)';
  RAISE NOTICE '   2. ค่ายมวยดอยสุเทพ (Chiang Mai)';
  RAISE NOTICE '   3. ค่ายมวยพัทยา (Pattaya)';
  RAISE NOTICE '   4. ค่ายมวยภูเก็ต บีช (Phuket)';
  RAISE NOTICE '   5. ค่ายมวยอีสาน ฟิตเนส (Khon Kaen)';

END $$;

-- ============================================================================
-- ตรวจสอบผลลัพธ์
-- ============================================================================
SELECT 
  gym_name,
  gym_name_english,
  location,
  status,
  slug,
  created_at
FROM gyms
WHERE status = 'approved'
ORDER BY created_at DESC
LIMIT 10;

