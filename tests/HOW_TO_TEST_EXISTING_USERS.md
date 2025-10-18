# 🔐 วิธีทดสอบ Login กับ User ที่มีอยู่แล้ว

## 📋 Overview

Test file นี้สำหรับทดสอบ **login เข้าบัญชีที่สมัครไปแล้ว** แทนที่จะสมัครใหม่ทุกครั้ง

**Test File**: `tests/e2e/login-existing-users.spec.ts`

---

## 🚀 Quick Start

### Step 1: รัน Main Test ก่อน (ถ้ายังไม่มี users)

```bash
npm run test:e2e:ui
```

หรือ

```bash
npm run test:e2e
```

### Step 2: Copy Email จาก Console

เมื่อ test รันเสร็จ จะเห็น output แบบนี้:

```
=== TEST SUMMARY ===
Test Users Created:
Regular User: test_user_1760785430506_r5d8zk@test.com
Partner User: test_partner_1760785430506_jzk62a@test.com
Admin User: test_admin_1760785430506_cxo53j@test.com
```

**Copy 3 email addresses นี้!**

### Step 3: Update Test Credentials

เปิดไฟล์ `tests/e2e/login-existing-users.spec.ts` และแก้ไข:

```typescript
const TEST_USERS = {
  regular: {
    email: 'test_user_1760785430506_r5d8zk@test.com',  // ← แก้ตรงนี้
    password: 'Test@1234567890',
  },
  partner: {
    email: 'test_partner_1760785430506_jzk62a@test.com',  // ← แก้ตรงนี้
    password: 'Test@1234567890',
  },
  admin: {
    email: 'test_admin_1760785430506_cxo53j@test.com',  // ← แก้ตรงนี้
    password: 'Test@1234567890',
  },
};
```

### Step 4: รัน Login Tests

```bash
# รัน login tests ใน UI mode
npx playwright test login-existing-users --ui

# หรือ headless mode
npx playwright test login-existing-users

# หรือรัน test เดียว (quick tests)
npx playwright test login-existing-users -g "Quick Test: Regular User"
```

---

## 🎯 Test Cases ที่มี

### 1. **Test 1: Regular User Login**
- Login ด้วย email/password
- เข้า `/dashboard`
- ตรวจสอบว่า access ได้
- Logout

### 2. **Test 2: Partner User Login**
- Login ด้วย email/password
- เข้า `/partner/dashboard`
- ตรวจสอบว่า access ได้ หรือถูก redirect ไป `/partner/apply`
- Logout

### 3. **Test 3: Admin User Login**
- Login ด้วย email/password
- เข้า `/admin/dashboard`
- ตรวจสอบว่า access ได้
- Logout

### 4. **Test 4: Verify All Roles**
- ทดสอบ login ทั้ง 3 roles ติดต่อกัน
- แสดงสรุปผลทั้งหมด

### 5. **Test 5: Username Login**
- ทดสอบ login ด้วย username (แทน email)
- ตรวจสอบว่า login ได้

### Quick Tests (Individual)
- `Quick Test: Regular User Only`
- `Quick Test: Partner User Only`
- `Quick Test: Admin User Only`

---

## 📊 Expected Output

```bash
=== Testing Regular User Login ===
Email: test_user_1760785430506_r5d8zk@test.com
Current URL after login: http://localhost:3000/
Dashboard URL: http://localhost:3000/dashboard
✓ Regular user can access dashboard
✓ Regular user logged out successfully

=== Testing Partner User Login ===
Email: test_partner_1760785430506_jzk62a@test.com
Current URL after login: http://localhost:3000/
Dashboard URL: http://localhost:3000/partner/dashboard
✓ Partner user can access partner dashboard
✓ Partner user logged out successfully

=== Testing Admin User Login ===
Email: test_admin_1760785430506_cxo53j@test.com
Current URL after login: http://localhost:3000/
Dashboard URL: http://localhost:3000/admin/dashboard
✓ Admin user can access admin dashboard
✓ Admin user logged out successfully

=== Final Verification - All Roles ===

=== SUMMARY ===
Regular User: ✓ PASS
Partner User: ✓ PASS
Admin User: ✓ PASS

✓ All roles verified successfully!

8 passed (32.5s)
```

---

## 🎨 Test Modes

### 1. UI Mode (แนะนำ)
```bash
npx playwright test login-existing-users --ui
```
- เห็น browser actions
- Debug ได้ง่าย
- ดู screenshots real-time

### 2. Headed Mode
```bash
npx playwright test login-existing-users --headed
```
- เห็น browser แต่ไม่มี UI controls

### 3. Headless Mode (เร็วที่สุด)
```bash
npx playwright test login-existing-users
```
- รันแบบ background
- เหมาะสำหรับ CI/CD

### 4. Debug Mode
```bash
npx playwright test login-existing-users --debug
```
- หยุดที่ breakpoints
- ตรวจสอบ step-by-step

---

## 🔍 รัน Test เฉพาะ Role

### Regular User Only
```bash
npx playwright test login-existing-users -g "Regular User"
```

### Partner User Only
```bash
npx playwright test login-existing-users -g "Partner User"
```

### Admin User Only
```bash
npx playwright test login-existing-users -g "Admin User"
```

### Quick Tests Only
```bash
npx playwright test login-existing-users -g "Quick Test"
```

---

## 📸 Screenshots

Screenshots จะถูกสร้างอัตโนมัติ:

```
tests/screenshots/
├── regular-user-after-login-XXXX.png
├── regular-user-dashboard-XXXX.png
├── partner-user-after-login-XXXX.png
├── partner-user-dashboard-XXXX.png
├── admin-user-after-login-XXXX.png
├── admin-user-dashboard-XXXX.png
├── final-verification-complete-XXXX.png
└── quick-*-user-XXXX.png
```

---

## ⚠️ Important Notes

### 1. Admin Role
Admin role ต้องตั้งค่าในฐานข้อมูลก่อน:

```sql
-- หา user_id
SELECT id, email FROM auth.users 
WHERE email = 'test_admin_XXX@test.com';

-- Set admin role
INSERT INTO user_roles (user_id, role) 
VALUES ('<user_id>', 'admin')
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
```

### 2. Partner Status
Partner user อาจแสดงผลต่างกันขึ้นอยู่กับ status:
- **Pending**: Redirect ไป `/partner/apply`
- **Approved**: เข้า `/partner/dashboard` ได้

### 3. Password
Password default คือ: `Test@1234567890`

### 4. Dev Server
ต้อง start dev server ก่อน:
```bash
npm run dev
```

---

## 🐛 Troubleshooting

### ❌ Error: "Invalid login credentials"
**สาเหตุ**: Email/password ไม่ถูกต้อง

**แก้ไข**:
1. ตรวจสอบว่า email ใน test file ถูกต้อง
2. ตรวจสอบว่า users ยังอยู่ใน database
3. ลอง login manual ผ่าน UI

### ❌ Error: "Cannot access admin dashboard (403)"
**สาเหตุ**: Admin role ยังไม่ได้ตั้งค่า

**แก้ไข**: 
Run SQL ตาม Note ข้างต้น

### ❌ Error: "Partner redirected to apply page"
**สาเหตุ**: Partner application ยังไม่ได้รับการอนุมัติ

**แก้ไข**:
1. Login ด้วย admin account
2. ไปที่ `/admin/dashboard/approvals`
3. อนุมัติ partner application

---

## 📚 Related Files

- **Test File**: `tests/e2e/login-existing-users.spec.ts`
- **Helpers**: `tests/e2e/helpers.ts`
- **Config**: `playwright.config.ts`
- **Main Test**: `tests/e2e/auth-flow.spec.ts`

---

## 🎓 Tips

### 1. เก็บ Credentials ไว้
Copy email addresses และเก็บไว้ในที่ปลอดภัย สำหรับทดสอบในภายหลัง

### 2. ใช้ Quick Tests
สำหรับทดสอบเร็วๆ ใช้ Quick Tests แทน Full Test Suite

### 3. Check Database
ตรวจสอบ users ใน database:
```sql
SELECT email, created_at FROM auth.users 
WHERE email LIKE 'test_%@test.com'
ORDER BY created_at DESC
LIMIT 10;
```

### 4. Clean Old Users
ลบ test users เก่าๆ:
```sql
DELETE FROM auth.users 
WHERE email LIKE 'test_%@test.com' 
AND created_at < NOW() - INTERVAL '7 days';
```

---

## ✅ Success Checklist

ก่อนรัน tests:
- [ ] Dev server รันอยู่ (`npm run dev`)
- [ ] มี test users อยู่ใน database แล้ว
- [ ] Copy email addresses ถูกต้อง
- [ ] Update credentials ใน test file แล้ว
- [ ] Admin role ตั้งค่าแล้ว (สำหรับ admin tests)

หลังรัน tests:
- [ ] All tests passed (8/8)
- [ ] Screenshots ถูกสร้าง
- [ ] Regular user access dashboard
- [ ] Partner user access partner area
- [ ] Admin user access admin dashboard

---

**🚀 Ready! รัน tests ได้เลย:**

```bash
npx playwright test login-existing-users --ui
```

**Happy Testing! 🎭**


