# คู่มือการติดตั้งและตั้งค่า

คู่มือครบครันสำหรับการติดตั้งและตั้งค่าโปรเจกต์ Muay Thai Next.js + Supabase

## 📋 ภาพรวม

หมวดนี้รวบรวมคู่มือการติดตั้งและตั้งค่าทั้งหมดที่จำเป็นสำหรับการพัฒนาและ deploy โปรเจกต์

## 🚀 การเริ่มต้นอย่างรวดเร็ว

### สำหรับนักพัฒนาใหม่

1. **Clone โปรเจกต์:**
   ```bash
   git clone https://github.com/your-username/muaythai-next-postgres.git
   cd muaythai-next-postgres
   ```

2. **ติดตั้ง dependencies:**
   ```bash
   npm install
   ```

3. **ตั้งค่า environment variables:**
   ```bash
   cp .env.example .env.local
   # แก้ไขค่าใน .env.local ตามคู่มือด้านล่าง
   ```

4. **ตั้งค่าฐานข้อมูลและสภาพแวดล้อม:**
   ```bash
   ./scripts/development-setup.sh
   ```

5. **รันโปรเจกต์:**
   ```bash
   npm run dev
   ```

## 📚 คู่มือการตั้งค่าแต่ละส่วน

### 🗄️ Supabase Setup
- **Local Development**: ใช้ Supabase CLI สำหรับการพัฒนาท้องถิ่น
- **Production**: ตั้งค่า Supabase project บน cloud

#### Local Supabase Setup
```bash
# ติดตั้ง Supabase CLI
npm install -g supabase

# เริ่มต้น Supabase local
supabase start

# ตรวจสอบสถานะ
supabase status
```

#### Production Supabase Setup
1. สร้าง project ใหม่ที่ [supabase.com](https://supabase.com)
2. คัดลอก Project URL และ API Keys
3. ตั้งค่าใน `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

### 💳 Stripe Setup
สำหรับระบบการชำระเงิน

#### Development
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### Production
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 📧 Email Setup (Resend)
สำหรับการส่งอีเมล

```env
RESEND_API_KEY=re_...
FROM_EMAIL=noreply@yourdomain.com
```

### 🔐 Authentication Setup
การตั้งค่าระบบ authentication

```env
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000  # สำหรับ development
```

## 🗄️ Database Setup

### 1. Apply Migrations
```bash
# Local development
supabase db reset

# Production
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

### 2. Configure Storage
```sql
-- รันใน Supabase SQL Editor
\i scripts/storage-configuration.sql
```

### 3. Setup Admin Functions
```sql
-- รันใน Supabase SQL Editor
\i scripts/admin-management.sql
```

### 4. Create Admin User
```sql
-- รันใน Supabase SQL Editor
SELECT public.promote_to_admin('your-admin@email.com');
```

### 5. Verify Setup
```bash
node scripts/database-utilities.js all
```

## 🌍 Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | - |
| `STRIPE_SECRET_KEY` | Stripe secret key | - |
| `RESEND_API_KEY` | Resend API key | - |
| `FROM_EMAIL` | From email address | - |

### Environment Files

```
.env.local          # Local development (gitignored)
.env.example        # Template file (committed)
.env.production     # Production variables (gitignored)
```

## 🚀 Deployment Setup

### Vercel Deployment

1. **Connect Repository:**
   - เชื่อมต่อ GitHub repository กับ Vercel

2. **Set Environment Variables:**
   - ตั้งค่า environment variables ใน Vercel dashboard

3. **Deploy:**
   ```bash
   # Automatic deployment on push to main branch
   git push origin main
   ```

### Manual Deployment

1. **Build Project:**
   ```bash
   npm run build
   ```

2. **Start Production Server:**
   ```bash
   npm start
   ```

## 🧪 Testing Setup

### E2E Testing (Playwright)

```bash
# ติดตั้ง Playwright
npx playwright install

# รันเทส
npm run test:e2e

# รันเทสพร้อม UI
npm run test:e2e:ui
```

### Script Validation Tests

```bash
# รันการทดสอบ scripts
node tests/scripts/run-all-tests.js

# รันการทดสอบแต่ละส่วน
node tests/scripts/admin-management.test.js
```

## 🔧 Development Tools

### Recommended VS Code Extensions

```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-playwright.playwright",
    "supabase.supabase-vscode"
  ]
}
```

### Git Hooks

```bash
# ติดตั้ง pre-commit hooks
npm install --save-dev husky lint-staged

# ตั้งค่า pre-commit
npx husky add .husky/pre-commit "npm run lint"
```

## 🚨 Troubleshooting

### Common Issues

1. **Supabase Connection Failed**
   ```bash
   # ตรวจสอบสถานะ
   supabase status
   
   # รีสตาร์ท
   supabase stop
   supabase start
   ```

2. **Environment Variables Not Found**
   ```bash
   # ตรวจสอบไฟล์ .env.local
   cat .env.local
   
   # ตรวจสอบว่าตัวแปรถูกโหลด
   echo $NEXT_PUBLIC_SUPABASE_URL
   ```

3. **Database Migration Issues**
   ```bash
   # ตรวจสอบสถานะ migration
   supabase migration list
   
   # รีเซ็ต database (local only)
   supabase db reset
   ```

4. **Build Errors**
   ```bash
   # ล้าง cache
   rm -rf .next
   npm run build
   ```

### Debug Commands

```bash
# ตรวจสอบสภาพแวดล้อม
./scripts/development-setup.sh --check-only

# ตรวจสอบฐานข้อมูล
node scripts/database-utilities.js check

# ตรวจสอบ TypeScript
npx tsc --noEmit

# ตรวจสอบ ESLint
npm run lint
```

## 📞 Support

หากพบปัญหาในการติดตั้ง:

1. ตรวจสอบ [Troubleshooting](#troubleshooting) ด้านบน
2. ดู [Database Setup Guide](../database/README.md)
3. รันคำสั่งตรวจสอบ: `./scripts/development-setup.sh --check-only`
4. ติดต่อทีมพัฒนาพร้อมข้อความ error

## 🔄 Next Steps

หลังจากติดตั้งเสร็จแล้ว:

1. ศึกษา [Database Scripts](../database/README.md)
2. อ่าน [Architecture Overview](../architecture/README.md)
3. ดู [Feature Guides](../features/README.md)
4. ทำความเข้าใจ [Contributing Guidelines](../contributing/README.md)