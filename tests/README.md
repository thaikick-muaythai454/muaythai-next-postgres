# E2E Automation Testing Guide

## Overview

ระบบ automation testing นี้ใช้ Playwright เพื่อทดสอบ end-to-end flow ของระบบการจัดการผู้ใช้ทั้ง 3 roles:
- **Authenticated User** (ผู้ใช้ทั่วไป)
- **Partner** (เจ้าของค่ายมวย)
- **Admin** (ผู้ดูแลระบบ)

## Test Coverage

### ✅ Complete Authentication Flow
การทดสอบครอบคลุม:

1. **User Signup (สมัครสมาชิก)**
   - สมัครสมาชิกใหม่ 3 คน
   - ตรวจสอบการสร้างบัญชีสำเร็จ

2. **Partner Application (สมัครเป็น Partner)**
   - ผู้ใช้คนหนึ่งสมัครเป็น Partner
   - กรอกข้อมูลค่ายมวย
   - ส่งใบสมัครและรอการอนุมัติ

3. **Admin Approval (Admin อนุมัติค่ายมวย)**
   - Admin เข้าสู่ระบบ
   - ตรวจสอบใบสมัคร Partner
   - อนุมัติใบสมัคร
   - อัพเดท role จาก authenticated → partner

4. **Login Verification (ตรวจสอบการ login)**
   - ทดสอบ login ทั้ง 3 roles
   - ตรวจสอบ access control
   - ยืนยันว่าแต่ละ role เข้าถึง dashboard ที่ถูกต้อง

## Prerequisites

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment
ตรวจสอบว่าไฟล์ `.env.local` มีค่าที่ถูกต้อง:
```env
SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Setup
ตรวจสอบว่า database มี tables ที่จำเป็น:
- `auth.users` - ผู้ใช้จาก Supabase Auth
- `profiles` - ข้อมูลผู้ใช้
- `user_roles` - role ของผู้ใช้
- `gyms` - ข้อมูลค่ายมวย

### 4. Start Development Server
```bash
npm run dev
```
เซิร์ฟเวอร์ต้องรันที่ `http://localhost:3000`

## Running Tests

### Run All Tests
```bash
npm run test:e2e
```

### Run Tests in UI Mode (Recommended for Development)
```bash
npm run test:e2e:ui
```

### Run Tests in Debug Mode
```bash
npm run test:e2e:debug
```

### Run Specific Test File
```bash
# Main test suite (สมัคร + ทดสอบทั้งหมด)
npx playwright test tests/e2e/auth-flow.spec.ts

# 🆕 Login tests only (ใช้ user ที่มีอยู่แล้ว)
npx playwright test tests/e2e/login-existing-users.spec.ts
```

### View Test Report
```bash
npx playwright show-report
```

### 🆕 Run Login Tests (Quick Tests)
```bash
# รัน login tests ทั้งหมด
npx playwright test login-existing-users --ui

# รัน test เฉพาะ role
npx playwright test login-existing-users -g "Regular User"
npx playwright test login-existing-users -g "Partner User"
npx playwright test login-existing-users -g "Admin User"

# รัน quick tests (เร็วที่สุด)
npx playwright test login-existing-users -g "Quick Test"
```

## Test Structure

```
tests/
├── e2e/
│   ├── helpers.ts                    # Helper functions และ utilities
│   ├── auth-flow.spec.ts             # Main E2E test suite (สมัคร + ทดสอบทั้งหมด)
│   └── login-existing-users.spec.ts  # 🆕 Login tests (ใช้ user ที่มีอยู่แล้ว)
├── screenshots/                      # Test screenshots (auto-generated)
├── README.md                         # This file
└── HOW_TO_TEST_EXISTING_USERS.md    # 🆕 คู่มือทดสอบ login

playwright-report/                    # Test reports (auto-generated)
playwright.config.ts                  # Playwright configuration
```

## Test Flow Details

### Step 1-4: User Signup
สร้าง 3 test users:
- Regular User: `test_user_[timestamp]@test.com`
- Partner User: `test_partner_[timestamp]@test.com`
- Admin User: `test_admin_[timestamp]@test.com`

### Step 5: Regular User Login
- Login ด้วย email/username
- ตรวจสอบว่าเข้า dashboard ได้
- Logout

### Step 6: Partner Application
- Partner user login
- ไปที่ `/partner/apply`
- กรอกข้อมูลค่ายมวย
- Submit application
- Status: `pending`

### Step 7: Admin Setup (Manual Step)
⚠️ **IMPORTANT**: Admin role ต้องตั้งค่าด้วยตนเอง

วิธีตั้งค่า admin:
```sql
-- 1. หา user_id จาก email
SELECT id, email FROM auth.users 
WHERE email = 'test_admin_[timestamp]@test.com';

-- 2. Set admin role
INSERT INTO user_roles (user_id, role) 
VALUES ('[user_id_from_step_1]', 'admin')
ON CONFLICT (user_id) 
DO UPDATE SET role = 'admin';
```

### Step 8: Admin Login
- Login ด้วย admin account
- ตรวจสอบว่าเข้า `/admin/dashboard` ได้

### Step 9: Admin Approval
- Admin เข้า `/admin/dashboard/approvals`
- ดูรายการ pending applications
- อนุมัติ partner application
- Partner role จะถูก update อัตโนมัติ

### Step 10: Partner Verification
- Partner user login อีกครั้ง
- ตรวจสอบว่าเข้า `/partner/dashboard` ได้
- ยืนยันว่า role เปลี่ยนเป็น `partner`

### Step 11: Final Verification
- ทดสอบ login ทั้ง 3 roles อีกครั้ง
- ตรวจสอบ access control
- สรุปผลการทดสอบ

## Debugging

### View Screenshots
screenshots จะถูกสร้างอัตโนมัติใน `tests/screenshots/` สำหรับ:
- Success states
- Error states
- Debug points

### Check Console Logs
Playwright จะ output logs ระหว่างการทดสอบ:
```
Generated Test Users:
Regular User: test_user_1234567890@test.com
Partner User: test_partner_1234567890@test.com
Admin User: test_admin_1234567890@test.com
```

### Common Issues

#### 1. Email Confirmation Required
**Problem**: Supabase requires email confirmation before login

**Solution**: 
- Disable email confirmation in Supabase dashboard
- OR implement email confirmation bypass for testing
- OR use a test email service

ไปที่ Supabase Dashboard → Authentication → Email Templates
Set "Confirm signup" to **disabled** for development

#### 2. Admin Role Not Set
**Problem**: Cannot access admin dashboard

**Solution**: 
Run SQL command to set admin role (see Step 7)

#### 3. Partner Application Not Found
**Problem**: Admin cannot see pending applications

**Solution**:
- Check if partner application was submitted successfully
- Verify gym data in `gyms` table
- Check application status

#### 4. Port Already in Use
**Problem**: `localhost:3000` is already in use

**Solution**:
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or change port in playwright.config.ts
```

## Configuration

### Playwright Config (`playwright.config.ts`)

**Key Settings**:
- `baseURL`: `http://localhost:3000` (change if using different port)
- `timeout`: 60 seconds per test
- `fullyParallel`: false (tests run sequentially)
- `workers`: 1 (single worker for sequential execution)
- `webServer`: Auto-start dev server

### Environment Variables

Create `.env.test` for test-specific settings:
```env
PLAYWRIGHT_BASE_URL=http://localhost:3000
```

## Advanced Usage

### Custom Test Data

Edit `helpers.ts` to customize test data:

```typescript
export function generateTestUser(role: string): UserCredentials {
  return {
    username: `custom_${role}_username`,
    fullName: `Custom Name`,
    email: `custom_${role}@test.com`,
    password: 'CustomPassword123!',
  };
}
```

### Add More Tests

Create new test files in `tests/e2e/`:

```typescript
import { test, expect } from '@playwright/test';

test.describe('My Custom Tests', () => {
  test('my test', async ({ page }) => {
    // Your test code
  });
});
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## Best Practices

1. **Clean Test Data**: Each test run creates new users with unique timestamps
2. **Sequential Testing**: Tests run in order to maintain state
3. **Screenshot Everything**: Debug screenshots help identify issues
4. **Graceful Failures**: Tests log issues but continue when possible
5. **Manual Steps Documented**: Admin setup is clearly documented

## Maintenance

### Clean Up Test Data

Periodically clean test users from database:

```sql
-- Delete test users
DELETE FROM auth.users 
WHERE email LIKE 'test_%@test.com';

-- Delete test gyms
DELETE FROM gyms 
WHERE email LIKE 'test_%@test.com';
```

### Update Tests

When UI changes, update selectors in `helpers.ts`:
- Form field names
- Button text
- URL patterns

## Support

หากมีปัญหาหรือคำถาม:
1. ตรวจสอบ screenshots ใน `tests/screenshots/`
2. ดู test report: `npx playwright show-report`
3. Run tests in UI mode: `npm run test:e2e:ui`
4. Check console logs for detailed error messages

## License

MIT License - See project LICENSE file

