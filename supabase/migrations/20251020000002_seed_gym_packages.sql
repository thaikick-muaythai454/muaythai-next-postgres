-- Seed data for gym packages
-- Migration: 20251020000002_seed_gym_packages.sql

-- Insert sample packages for existing gyms
-- Note: Replace gym IDs with actual IDs from your database

-- Get the first gym ID to use as example
DO $$
DECLARE
  sample_gym_id UUID;
BEGIN
  -- Get first approved gym
  SELECT id INTO sample_gym_id FROM gyms WHERE status = 'approved' LIMIT 1;
  
  IF sample_gym_id IS NOT NULL THEN
    -- Insert one-time package (รายครั้ง)
    INSERT INTO gym_packages (
      gym_id, package_type, name, name_english, description, price, duration_months, features, is_active
    ) VALUES
    (
      sample_gym_id,
      'one_time',
      'ฝึกรายครั้ง',
      'Single Session',
      'เหมาะสำหรับผู้ที่ต้องการทดลองฝึก หรือฝึกเป็นครั้งคราว',
      500.00,
      NULL,
      ARRAY['เข้าฝึกได้ 1 ครั้ง', 'ใช้อุปกรณ์ฟรี', 'ฝึกกับครูมืออาชีพ'],
      true
    );

    -- Insert package subscriptions (แพ็คเกจรายเดือน)
    INSERT INTO gym_packages (
      gym_id, package_type, name, name_english, description, price, duration_months, features, is_active
    ) VALUES
    -- 1 เดือน
    (
      sample_gym_id,
      'package',
      'แพ็คเกจ 1 เดือน',
      '1 Month Package',
      'ฝึกได้ไม่จำกัดตลอด 1 เดือน',
      3500.00,
      1,
      ARRAY['ฝึกได้ไม่จำกัด', 'ใช้อุปกรณ์ฟรี', 'ครูฝึกส่วนตัว', 'เข้าห้องอบไอน้ำ'],
      true
    ),
    -- 3 เดือน
    (
      sample_gym_id,
      'package',
      'แพ็คเกจ 3 เดือน',
      '3 Months Package',
      'ฝึกได้ไม่จำกัดตลอด 3 เดือน ประหยัดกว่า 15%',
      9000.00,
      3,
      ARRAY['ฝึกได้ไม่จำกัด', 'ใช้อุปกรณ์ฟรี', 'ครูฝึกส่วนตัว', 'เข้าห้องอบไอน้ำ', 'โปรแกรมฝึกเฉพาะบุคคล'],
      true
    ),
    -- 6 เดือน
    (
      sample_gym_id,
      'package',
      'แพ็คเกจ 6 เดือน',
      '6 Months Package',
      'ฝึกได้ไม่จำกัดตลอด 6 เดือน ประหยัดสุด 25%',
      16000.00,
      6,
      ARRAY['ฝึกได้ไม่จำกัด', 'ใช้อุปกรณ์ฟรี', 'ครูฝึกส่วนตัว', 'เข้าห้องอบไอน้ำ', 'โปรแกรมฝึกเฉพาะบุคคล', 'บริการนวดผ่อนคลาย'],
      true
    );
    
    RAISE NOTICE 'Sample packages created for gym: %', sample_gym_id;
  ELSE
    RAISE NOTICE 'No approved gyms found. Please create gym packages manually.';
  END IF;
END $$;

