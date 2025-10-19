# Migration Guide - Add Phone to Profiles

## วิธีการ Apply Migration

### วิธีที่ 1: ใช้ Supabase Dashboard (แนะนำ)

1. ไปที่ https://supabase.com/dashboard
2. เลือกโปรเจคของคุณ
3. ไปที่ **SQL Editor**
4. Copy SQL จากไฟล์ `supabase/migrations/20251020000000_add_phone_to_profiles.sql`
5. Paste และกด Run

### วิธีที่ 2: ใช้ Supabase CLI

#### ขั้นตอนที่ 1: Link กับโปรเจค

```bash
# ดู project ref จาก Supabase Dashboard > Settings > General > Reference ID
npx supabase link --project-ref YOUR_PROJECT_REF

# หรือใช้ password-based linking
npx supabase link
```

#### ขั้นตอนที่ 2: Push Migrations

```bash
npx supabase db push
```

### วิธีที่ 3: ใช้ psql (สำหรับ Advanced Users)

```bash
# ดูค่า connection string จาก Supabase Dashboard
psql "postgresql://postgres:[YOUR-PASSWORD]@[HOST]/postgres" -f supabase/migrations/20251020000000_add_phone_to_profiles.sql
```

## ตรวจสอบว่า Migration สำเร็จ

Run คำสั่ง SQL นี้ใน SQL Editor:

```sql
-- ตรวจสอบว่ามีคอลัมน์ phone
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles';

-- ตรวจสอบ function handle_new_user
SELECT routine_name, routine_definition 
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user';
```

## หลังจาก Apply Migration

ระบบจะ:
- ✅ เพิ่มคอลัมน์ `phone` ในตาราง `profiles`
- ✅ สร้าง index สำหรับ phone
- ✅ อัพเดท trigger function ให้บันทึก phone อัตโนมัติเมื่อสมัครสมาชิกใหม่

## Rollback (ถ้าต้องการย้อนกลับ)

```sql
-- ลบคอลัมน์ phone
ALTER TABLE profiles DROP COLUMN IF EXISTS phone;

-- ลบ index
DROP INDEX IF EXISTS idx_profiles_phone;

-- Restore function เดิม (ไม่มี phone)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'authenticated');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
```

