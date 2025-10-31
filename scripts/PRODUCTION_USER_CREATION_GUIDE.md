# คู่มือการสร้างผู้ใช้ใน Production

คู่มือนี้จะช่วยคุณในการสร้างผู้ใช้ในระบบ Muay Thai Community สำหรับ production environment

## 🚀 วิธีการสร้างผู้ใช้

### 1. การเตรียม Environment

ก่อนอื่นต้องตั้งค่า environment variables สำหรับ production:

```bash
# คัดลอกไฟล์ตัวอย่าง
cp .env.production.example .env.production

# แก้ไขค่าต่างๆ ใน .env.production
nano .env.production
```

**ค่าที่ต้องตั้ง:**
- `NEXT_PUBLIC_SUPABASE_URL` - URL ของ Supabase project
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (สำคัญมาก!)
- `NODE_ENV=production`

### 2. วิธีการสร้างผู้ใช้

#### วิธีที่ 1: ใช้ Script (แนะนำ)

```bash
# สร้างผู้ใช้คนเดียว
node scripts/production-user-creation.js \
  --email admin@muaythai.com \
  --role admin \
  --full-name "System Administrator" \
  --username admin \
  --phone +66812345678 \
  --auto-generate-password

# สร้างผู้ใช้หลายคนจากไฟล์ JSON
node scripts/production-user-creation.js --bulk scripts/production-users.json

# ตรวจสอบผู้ใช้ที่มีอยู่
node scripts/production-user-creation.js --list

# ตรวจสอบผู้ใช้คนใดคนหนึ่ง
node scripts/production-user-creation.js --check user@example.com
```

#### วิธีที่ 2: ใช้ Admin Interface

1. เข้าสู่ระบบด้วยบัญชี admin
2. ไปที่ `/admin/users/create`
3. กรอกข้อมูลผู้ใช้
4. กดปุ่ม "สร้างผู้ใช้"

#### วิธีที่ 3: ใช้ API Endpoint

```bash
curl -X POST https://yourdomain.com/api/users/create \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "full_name": "John Doe",
    "username": "johndoe",
    "phone": "+66812345678",
    "role": "authenticated"
  }'
```

## 🔐 ความปลอดภัย

### 1. รหัสผ่าน

**สำหรับ Production:**
- ต้องมีอย่างน้อย 8 ตัวอักษร
- ต้องมีตัวพิมพ์เล็ก, ตัวพิมพ์ใหญ่, ตัวเลข และอักขระพิเศษ
- ตัวอย่าง: `SecurePass123!`

**การสร้างรหัสผ่านอัตโนมัติ:**
```bash
# ระบบจะสร้างรหัสผ่านที่ปลอดภัยให้อัตโนมัติ
node scripts/production-user-creation.js \
  --email user@example.com \
  --auto-generate-password
```

### 2. Service Role Key

⚠️ **สำคัญ:** Service Role Key มีสิทธิ์เข้าถึงฐานข้อมูลทั้งหมด
- เก็บไว้อย่างปลอดภัย
- อย่าแชร์กับใคร
- ใช้เฉพาะใน server-side

### 3. Environment Variables

```bash
# ตรวจสอบว่า environment ถูกต้อง
echo $NODE_ENV
echo $SUPABASE_URL
```

## 📋 บทบาทผู้ใช้

### 1. `admin` - ผู้ดูแลระบบ
- เข้าถึงได้ทุกฟีเจอร์
- จัดการผู้ใช้, โรงยิม, การจอง
- ดูรายงานและสถิติ

### 2. `partner` - พาร์ทเนอร์
- จัดการโรงยิมของตัวเอง
- ดูการจองและรายได้
- จัดการแพ็กเกจ

### 3. `authenticated` - ผู้ใช้ทั่วไป
- จองคอร์ส
- ดูโปรไฟล์
- ใช้ระบบ gamification

## 🛠️ การแก้ไขปัญหา

### 1. "Missing Supabase configuration"
```bash
# ตรวจสอบไฟล์ .env.production
cat .env.production | grep SUPABASE
```

### 2. "User already exists"
```bash
# ตรวจสอบผู้ใช้ที่มีอยู่
node scripts/production-user-creation.js --check user@example.com
```

### 3. "Permission denied"
- ตรวจสอบ Service Role Key
- ตรวจสอบ RLS policies ใน Supabase

### 4. "Password validation failed"
- ใช้รหัสผ่านที่ตรงตามข้อกำหนด
- หรือใช้ `--auto-generate-password`

## 📊 ตัวอย่างการใช้งาน

### สร้าง Admin User
```bash
node scripts/production-user-creation.js \
  --email admin@muaythai.com \
  --password AdminSecure123! \
  --full-name "System Administrator" \
  --username admin \
  --phone +66812345678 \
  --role admin
```

### สร้าง Partner User
```bash
node scripts/production-user-creation.js \
  --email partner@muaythai.com \
  --password PartnerSecure123! \
  --full-name "Gym Partner" \
  --username partner \
  --phone +66887654321 \
  --role partner
```

### สร้าง Regular User
```bash
node scripts/production-user-creation.js \
  --email user@muaythai.com \
  --password UserSecure123! \
  --full-name "Regular User" \
  --username user \
  --phone +66811111111 \
  --role authenticated
```

### สร้างผู้ใช้หลายคนพร้อมกัน
```bash
# ใช้ไฟล์ JSON
node scripts/production-user-creation.js --bulk scripts/production-users.json
```

## 🔍 การตรวจสอบ

### ดูรายชื่อผู้ใช้ทั้งหมด
```bash
node scripts/production-user-creation.js --list
```

### ตรวจสอบผู้ใช้คนใดคนหนึ่ง
```bash
node scripts/production-user-creation.js --check user@example.com
```

### ตรวจสอบใน Supabase Dashboard
1. เข้า Supabase Dashboard
2. ไปที่ Authentication > Users
3. ดูรายชื่อผู้ใช้ที่สร้าง

## 📝 Logging

ระบบจะบันทึก log ทุกการกระทำ:
- การสร้างผู้ใช้
- ข้อผิดพลาด
- การตรวจสอบผู้ใช้

Log จะแสดงในรูปแบบ:
```
[2024-01-21T10:30:00.000Z] USER_CREATION_START: { email: 'user@example.com', role: 'authenticated' }
[2024-01-21T10:30:01.000Z] USER_CREATION_SUCCESS: { email: 'user@example.com', userId: '...', role: 'authenticated' }
```

## 🚨 ข้อควรระวัง

1. **อย่าใช้รหัสผ่านง่ายๆ** ใน production
2. **ตรวจสอบสิทธิ์** ของ Service Role Key
3. **สำรองข้อมูล** ก่อนสร้างผู้ใช้จำนวนมาก
4. **ทดสอบ** ใน development environment ก่อน
5. **ตรวจสอบ RLS policies** ใน Supabase

## 📞 การขอความช่วยเหลือ

หากพบปัญหา:
1. ตรวจสอบ log ข้อผิดพลาด
2. ตรวจสอบ environment variables
3. ตรวจสอบ Supabase configuration
4. ติดต่อทีมพัฒนา

---

**หมายเหตุ:** คู่มือนี้ใช้สำหรับ production environment เท่านั้น สำหรับ development ให้ใช้ `scripts/create-user.js` แทน
