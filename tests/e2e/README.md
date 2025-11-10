# E2E Tests (End-to-End)

## 📋 Overview

E2E tests สำหรับทดสอบ user flows แบบเต็มรูปแบบใน browser จริง โดยใช้ **Playwright**

## 🔐 Required Environment Variables

ก่อนรัน E2E tests หรือสคริปต์ seed ผู้ใช้ ให้กำหนดค่าต่อไปนี้ใน `.env.local` (หรือ export ใน shell):

```
E2E_DEFAULT_PASSWORD=<secure-password-used-for-generated-users>
E2E_REGULAR_PASSWORD=<password-for-existing-regular-user>
E2E_PARTNER_PASSWORD=<password-for-existing-partner-user>
E2E_ADMIN_PASSWORD=<password-for-existing-admin-user>

# ไม่บังคับ แต่แนะนำให้ตั้งค่าเพื่อง่ายต่อการสลับอีเมล
E2E_REGULAR_EMAIL=e2e_regular_user@muaythai.test
E2E_PARTNER_EMAIL=e2e_partner_user@muaythai.test
E2E_ADMIN_EMAIL=e2e_admin_user@muaythai.test

# สคริปต์สร้าง users ใน scripts/node/create-test-users.js
E2E_TEST_USER_PASSWORD=<password-for-created-regular-user>
E2E_TEST_PARTNER_PASSWORD=<password-for-created-partner-user>
E2E_TEST_ADMIN_PASSWORD=<password-for-created-admin-user>
```

> ℹ️ หากไม่ตั้งค่ารหัสผ่านเหล่านี้ สคริปต์และ tests จะหยุดทำงานพร้อมข้อความ error เพื่อป้องกันการ hard-code ความลับลงใน repository

## 👤 Test Accounts จาก `run-create-user.sh test-users`

หลังจากรัน `./scripts/shell/run-create-user.sh test-users` ระบบจะสร้างผู้ใช้ไว้ 5 บัญชีสำหรับการทดสอบ โดยใช้อีเมลตามตารางด้านล่าง และดึงรหัสผ่านจาก environment variables ที่ตั้งไว้ใน `.env.local`:

| Role            | Email                         | Password Env Var(s)¹                  |
|-----------------|------------------------------|---------------------------------------|
| Admin           | `admin@muaythai.com`         | `E2E_ADMIN_PASSWORD` → `E2E_TEST_ADMIN_PASSWORD` |
| Partner         | `partner@muaythai.com`       | `E2E_PARTNER_PASSWORD` → `E2E_TEST_PARTNER_PASSWORD` |
| Regular User    | `user@muaythai.com`          | `E2E_REGULAR_PASSWORD` → `E2E_TEST_USER_PASSWORD` |
| Gym Owner       | `gymowner@muaythai.com`      | ใช้ `E2E_TEST_USER_PASSWORD` (หรือ `E2E_DEFAULT_PASSWORD` เป็น fallback) |
| Trainer         | `trainer@muaythai.com`       | ใช้ `E2E_TEST_USER_PASSWORD` (หรือ `E2E_DEFAULT_PASSWORD` เป็น fallback) |

¹ สคริปต์และ Playwright tests จะลองอ่านรหัสผ่านตามลำดับที่ระบุ (ลูกศรชี้ไป fallback ถัดไป) และสุดท้ายจะใช้ `E2E_DEFAULT_PASSWORD` เมื่อไม่มีค่าก่อนหน้า

## 📁 Structure

```
e2e/
├── auth/              # Authentication flows
├── affiliate/         # Affiliate system flows
├── admin/             # Admin management flows
├── helpers.ts         # Shared test helpers
└── fixtures/          # Test fixtures and data
```

## 🚀 Running Tests

### รัน E2E tests ทั้งหมด
```bash
npm run test:e2e
```

### รัน tests แต่ละหมวด
```bash
npm run test:e2e:auth
npm run test:e2e:affiliate
npm run test:e2e:admin
```

### รัน test file เฉพาะ
```bash
npx playwright test tests/e2e/auth/auth-flow.spec.ts
```

### รัน tests แบบ UI mode (interactive)
```bash
npm run test:e2e:ui
```

### รัน tests แบบ headed (เห็น browser)
```bash
npm run test:e2e:headed
```

### Debug mode
```bash
npm run test:e2e:debug
```

### ดู test report
```bash
npm run test:report
```

## ✅ Test Coverage

### Authentication Flows (11 tests) ✅
**File**: `auth/auth-flow.spec.ts`

- ✅ Generate test users (regular, partner, admin)
- ✅ Signup - Regular User
- ✅ Signup - Partner User (to be)
- ✅ Signup - Admin User
- ✅ Login - Regular User
- ✅ Partner Application - Submit gym application
- ✅ Admin Setup
- ✅ Admin Login
- ✅ Admin Approval - Approve partner application
- ✅ Partner Login After Approval
- ✅ Final Verification - All users can access dashboards

**Duration**: ~2.3 minutes

### Affiliate Flows (4 tests) ✅
**File**: `affiliate/affiliate-signup-sessionstorage.spec.ts` (3 tests)

- ✅ SessionStorage persistence after navigation
- ✅ URL param takes precedence over sessionStorage
- ✅ SessionStorage cleanup verification

**Duration**: 13.8s

**File**: `affiliate/affiliate-dashboard.spec.ts` (1 test)

- ✅ Dashboard displays data correctly
  - Stats cards verification
  - Conversion history table
  - Status badges
  - API data consistency

**Duration**: 1.7m

### Admin Flows ⏳
**File**: `admin/admin-gym-management.spec.ts`

- ⏳ Pending more tests

### Missing E2E Tests ⏳

#### Booking Flow (High Priority)
- ⏳ Browse gyms
- ⏳ Select package
- ⏳ Complete booking
- ⏳ Payment with Stripe
- ⏳ Booking confirmation

#### User Profile (Medium Priority)
- ⏳ View profile
- ⏳ Edit profile
- ⏳ Upload profile picture
- ⏳ Change password

#### Partner Dashboard (Medium Priority)
- ⏳ View analytics
- ⏳ Manage packages
- ⏳ Create promotions
- ⏳ View bookings

#### Gamification (Low Priority)
- ⏳ Earn points
- ⏳ Unlock badges
- ⏳ View leaderboard
- ⏳ Complete challenges

## 📝 Writing E2E Tests

### Test Template
```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: Navigate to page
    await page.goto('/your-page');
  });

  test('should complete user flow', async ({ page }) => {
    // Arrange: Setup initial state

    // Act: Perform user actions
    await page.click('button[data-testid="submit"]');

    // Assert: Verify results
    await expect(page.locator('.success-message')).toBeVisible();
  });
});
```

### Best Practices
1. Test complete user flows, not individual actions
2. Use data-testid attributes for stable selectors
3. Wait for network requests to complete
4. Take screenshots on failure
5. Test on multiple browsers (Chromium, Firefox, WebKit)
6. Test responsive layouts
7. Test accessibility
8. Clean up test data after tests

## 🔧 Configuration

Playwright config อยู่ใน `playwright.config.ts`:

```typescript
export default {
  testDir: './tests/e2e',
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
};
```

## 🎯 Priority E2E Tests to Write

### 🔴 High Priority (Critical user flows)
1. Complete booking flow (browse → book → pay → confirm)
2. Partner application flow (apply → wait → approval → access)
3. User registration and login flow ✅
4. Affiliate signup with referral ✅
5. Payment failure and retry flow

### 🟠 Medium Priority
1. Partner dashboard - manage packages and promotions
2. Admin dashboard - approve gyms and partners
3. User profile management
4. Affiliate dashboard ✅
5. Search and filter gyms

### 🟡 Low Priority
1. Newsletter subscription
2. Event registration
3. Product purchase
4. Article reading
5. Gamification interactions

## 🔍 Debugging E2E Tests

### Debug mode
```bash
npx playwright test --debug
```

### Headed mode (see browser)
```bash
npx playwright test --headed
```

### UI mode (interactive)
```bash
npx playwright test --ui
```

### View test report
```bash
npx playwright show-report
```

### View traces
```bash
npx playwright show-trace trace.zip
```

## 📸 Screenshots

Screenshots จาก failed tests จะถูกเก็บไว้ที่:
```
tests/screenshots/
```

## 🐛 Troubleshooting

### Timeout errors
- เพิ่ม timeout ใน test config
- Use `await page.waitForLoadState('networkidle')`
- ตรวจสอบว่า dev server running

### Element not found
- ใช้ data-testid แทน CSS selectors
- Wait for element with `await page.waitForSelector()`
- Check if element is in viewport

### Flaky tests
- Add explicit waits
- Use stable selectors (data-testid)
- Avoid timing-dependent assertions
- Run tests multiple times to identify flakiness

## 📚 References

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Testing Best Practices](https://playwright.dev/docs/best-practices)
- [Testing Summary](../../docs/TESTING_SUMMARY.md)
- [Test Report Checklist](../../docs/TEST_REPORT_CHECKLIST.md)
