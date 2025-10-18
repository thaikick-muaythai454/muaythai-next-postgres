# ⚡ Quick Reference - E2E Testing

## 🎯 2 Test Suites

### 1. **Main Test** - สมัครและทดสอบทั้งหมด
```bash
npx playwright test auth-flow --ui
```
- สมัครสมาชิก 3 users
- Partner application
- Admin approval
- Login verification
- ⏱️ Time: ~45-60 วินาที

### 2. **Login Test** - ทดสอบ login เฉพาะ (🆕)
```bash
npx playwright test login-existing-users --ui
```
- ใช้ user ที่มีอยู่แล้ว
- ไม่สมัครใหม่
- ทดสอบ login 3 roles
- ⏱️ Time: ~30 วินาที

---

## 🚀 Quick Commands

### เริ่มต้น
```bash
npm run dev              # Terminal 1: Start server
npm run test:e2e:ui      # Terminal 2: Run all tests
```

### รัน Test แยก
```bash
# Main test (full flow)
npx playwright test auth-flow --ui

# Login test only
npx playwright test login-existing-users --ui
```

### รัน Role เฉพาะ
```bash
# Regular user
npx playwright test login-existing-users -g "Regular User"

# Partner user
npx playwright test login-existing-users -g "Partner User"

# Admin user
npx playwright test login-existing-users -g "Admin User"
```

### Quick Tests (เร็วสุด)
```bash
npx playwright test login-existing-users -g "Quick Test"
```

---

## 📝 Setup Login Test

### 1. รัน Main Test ก่อน
```bash
npx playwright test auth-flow
```

### 2. Copy Emails จาก Output
```
Regular User: test_user_XXX@test.com
Partner User: test_partner_XXX@test.com
Admin User: test_admin_XXX@test.com
```

### 3. Update Test File
แก้ไข `tests/e2e/login-existing-users.spec.ts`:
```typescript
const TEST_USERS = {
  regular: {
    email: 'test_user_XXX@test.com',  // ← แก้ตรงนี้
    password: 'Test@1234567890',
  },
  partner: {
    email: 'test_partner_XXX@test.com',  // ← แก้ตรงนี้
    password: 'Test@1234567890',
  },
  admin: {
    email: 'test_admin_XXX@test.com',  // ← แก้ตรงนี้
    password: 'Test@1234567890',
  },
};
```

### 4. รัน Login Test
```bash
npx playwright test login-existing-users --ui
```

---

## 📚 Documentation

| File | Description |
|------|-------------|
| `HOW_TO_TEST_EXISTING_USERS.md` | คู่มือทดสอบ login แบบละเอียด |
| `README.md` | คู่มือเต็ม E2E testing |
| `BUGFIX_TIMEOUT_ISSUE.md` | แก้ไข timeout errors |
| `QUICK_REFERENCE.md` | ไฟล์นี้ |

---

## 🎨 Test Modes

```bash
# UI Mode (แนะนำ)
--ui

# Headed (เห็น browser)
--headed

# Debug (step by step)
--debug

# Headless (เร็วสุด)
(no flag)
```

---

## 📸 Screenshots Location

```
tests/screenshots/
├── regular-user-*.png
├── partner-user-*.png
├── admin-user-*.png
└── final-*.png
```

---

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Port in use | `lsof -ti:3000 \| xargs kill -9` |
| Email not confirmed | Disable in Supabase Dashboard |
| Admin 403 | Set admin role via SQL |
| Timeout | Already fixed! |

---

## ✅ Checklist

ก่อนรัน tests:
- [ ] `npm run dev` รันอยู่
- [ ] Database connection OK
- [ ] Email confirmation disabled

สำหรับ Login Test:
- [ ] รัน main test ก่อน
- [ ] Copy emails
- [ ] Update test file
- [ ] Admin role set (for admin tests)

---

## 🎯 Test Results

### Main Test (auth-flow)
```
11 tests | ~45-60s
- 3 signups
- 1 partner app
- 1 admin approval
- 3 logins
- 3 verifications
```

### Login Test (login-existing-users)
```
8 tests | ~30s
- 3 role logins
- 1 verification
- 1 username test
- 3 quick tests
```

---

## 📞 Need Help?

1. ✅ อ่าน `HOW_TO_TEST_EXISTING_USERS.md`
2. ✅ Check screenshots
3. ✅ Run with `--debug`
4. ✅ Check console logs

---

**🚀 Happy Testing!**

```bash
# เริ่มต้น
npm run dev
npm run test:e2e:ui
```


