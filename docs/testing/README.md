# คู่มือการทดสอบ

เอกสารประกอบสำหรับการทดสอบในโปรเจกต์ Muay Thai Next.js + Supabase

## 📋 ภาพรวม

โปรเจกต์นี้มีระบบการทดสอบที่ครอบคลุม ประกอบด้วย:
- **E2E Testing** ด้วย Playwright
- **Script Validation Tests** สำหรับ database scripts
- **Unit Tests** สำหรับ components และ utilities

## 🧪 ประเภทการทดสอบ

### 1. E2E Testing (Playwright)
ทดสอบ user flow ทั้งหมดผ่าน browser จริง

**ครอบคลุม:**
- การสมัครสมาชิกและเข้าสู่ระบบ
- การค้นหาและจองค่ายมวย
- ระบบการชำระเงิน
- Dashboard สำหรับ Admin และ Partner
- การจัดการข้อมูลค่ายมวย

### 2. Script Validation Tests
ทดสอบการทำงานของ database scripts

**ครอบคลุม:**
- Admin management functions
- Database utilities
- Development setup scripts
- Storage configuration

### 3. Component Tests (อนาคต)
ทดสอบ React components แต่ละตัว

## 🚀 การรันเทส

### E2E Tests

```bash
# รันเทสทั้งหมด (headless)
npm run test:e2e

# รันเทสพร้อม UI
npm run test:e2e:ui

# รันเทสแบบ debug
npm run test:e2e:debug

# รันเทสเฉพาะไฟล์
npx playwright test auth.spec.ts

# รันเทสใน browser เฉพาะ
npx playwright test --project=chromium
```

### Script Validation Tests

```bash
# รันการทดสอบ scripts ทั้งหมด
node tests/scripts/run-all-tests.js

# รันการทดสอบแต่ละส่วน
node tests/scripts/run-all-tests.js --admin
node tests/scripts/run-all-tests.js --database
node tests/scripts/run-all-tests.js --setup
node tests/scripts/run-all-tests.js --storage

# รันการทดสอบแบบ verbose
node tests/scripts/run-all-tests.js --verbose
```

## 📁 โครงสร้างไฟล์ทดสอบ

```
tests/
├── e2e/                          # E2E tests (Playwright)
│   ├── auth.spec.ts             # การทดสอบ authentication
│   ├── booking.spec.ts          # การทดสอบระบบจอง
│   ├── admin.spec.ts            # การทดสอบ admin dashboard
│   ├── partner.spec.ts          # การทดสอบ partner dashboard
│   └── utils/                   # Test utilities
├── scripts/                     # Script validation tests
│   ├── admin-management.test.js
│   ├── database-utilities.test.js
│   ├── development-setup.test.js
│   ├── storage-configuration.test.js
│   ├── run-all-tests.js
│   └── README.md
└── unit/                        # Unit tests (อนาคต)
    ├── components/
    ├── utils/
    └── services/
```

## ⚙️ การตั้งค่าการทดสอบ

### Environment Variables สำหรับการทดสอบ

```env
# .env.test
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_local_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_local_service_key

# Test user credentials
TEST_ADMIN_EMAIL=admin@muaythai.com
TEST_ADMIN_PASSWORD=password123
TEST_USER_EMAIL=user@muaythai.com
TEST_USER_PASSWORD=password123
```

### Playwright Configuration

```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

## 📝 การเขียนเทส

### E2E Test Example

```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should login successfully', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('[data-testid="email"]', 'admin@muaythai.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('[data-testid="email"]', 'invalid@email.com');
    await page.fill('[data-testid="password"]', 'wrongpassword');
    await page.click('[data-testid="login-button"]');
    
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });
});
```

### Script Validation Test Example

```javascript
// tests/scripts/admin-management.test.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function testAdminPromotion() {
  console.log('🧪 Testing admin promotion...');
  
  try {
    // Test promoting user to admin
    const { data, error } = await supabase
      .rpc('promote_to_admin', { email: 'test@example.com' });
    
    if (error) throw error;
    
    console.log('✅ Admin promotion test passed');
    return true;
  } catch (error) {
    console.log('❌ Admin promotion test failed:', error.message);
    return false;
  }
}
```

## 🔧 Test Data Management

### Test Users

โปรเจกต์สร้าง test users อัตโนมัติผ่าน development setup:

```bash
./scripts/development-setup.sh --users-only
```

**Test Users ที่สร้าง:**
- `admin@muaythai.com` / `password123` (Admin)
- `user@muaythai.com` / `password123` (User)
- `partner@muaythai.com` / `password123` (Partner)
- `partner2@muaythai.com` / `password123` (Partner)

### Test Data Cleanup

```typescript
// tests/utils/cleanup.ts
export async function cleanupTestData() {
  // ลบข้อมูลทดสอบหลังจากรันเทส
  await supabase.from('bookings').delete().eq('user_id', testUserId);
  await supabase.from('gyms').delete().eq('owner_id', testUserId);
}
```

## 📊 Test Reports

### Playwright Reports

```bash
# สร้าง HTML report
npx playwright test --reporter=html

# เปิด report
npx playwright show-report
```

### Script Validation Reports

```bash
# รันพร้อม verbose output
node tests/scripts/run-all-tests.js --verbose > test-report.log
```

## 🚨 Troubleshooting

### Common Issues

1. **Tests ล้มเหลวเพราะ timeout**
   ```typescript
   // เพิ่ม timeout ใน test
   test('slow test', async ({ page }) => {
     test.setTimeout(60000); // 60 seconds
     // test code...
   });
   ```

2. **Database connection issues**
   ```bash
   # ตรวจสอบ Supabase local
   supabase status
   
   # รีสตาร์ท Supabase
   supabase stop && supabase start
   ```

3. **Test data conflicts**
   ```typescript
   // ใช้ unique identifiers
   const testEmail = `test-${Date.now()}@example.com`;
   ```

4. **Browser issues**
   ```bash
   # ติดตั้ง browsers ใหม่
   npx playwright install
   
   # รันใน headed mode เพื่อ debug
   npx playwright test --headed
   ```

### Debug Commands

```bash
# Debug E2E tests
npx playwright test --debug

# Debug script tests
node tests/scripts/admin-management.test.js

# Check test environment
./scripts/development-setup.sh --check-only

# Validate database for testing
node scripts/database-utilities.js check
```

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Start Supabase
        run: |
          npm install -g supabase
          supabase start
      
      - name: Run script validation tests
        run: node tests/scripts/run-all-tests.js
        env:
          SUPABASE_URL: http://127.0.0.1:54321
          SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## 📚 Best Practices

### 1. Test Organization
- จัดกลุ่มเทสตาม feature
- ใช้ descriptive test names
- เขียน test documentation

### 2. Test Data
- ใช้ unique identifiers
- ทำความสะอาดหลังจากเทส
- หลีกเลี่ยงการพึ่งพา external data

### 3. Assertions
- ใช้ specific assertions
- ตรวจสอบทั้ง positive และ negative cases
- รอให้ elements พร้อมก่อน assert

### 4. Maintenance
- อัพเดทเทสเมื่อมีการเปลี่ยนแปลง feature
- รันเทสเป็นประจำ
- ติดตาม test coverage

## 📞 Support

หากพบปัญหาในการทดสอบ:

1. ตรวจสอบ [Troubleshooting](#troubleshooting) ด้านบน
2. ดู [Script Tests Documentation](../../tests/scripts/README.md)
3. รันคำสั่งตรวจสอบ: `./scripts/development-setup.sh --check-only`
4. ติดต่อทีมพัฒนาพร้อมข้อความ error และ test logs