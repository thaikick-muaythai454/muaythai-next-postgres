# คู่มือการติดตั้งและใช้งาน Stripe Payment Gateway

## 📋 สารบัญ
1. [การติดตั้ง](#การติดตั้ง)
2. [การตั้งค่า Stripe Account](#การตั้งค่า-stripe-account)
3. [การตั้งค่า Environment Variables](#การตั้งค่า-environment-variables)
4. [การรัน Database Migration](#การรัน-database-migration)
5. [การตั้งค่า Webhook](#การตั้งค่า-webhook)
6. [การใช้งาน](#การใช้งาน)
7. [การทดสอบ](#การทดสอบ)

---

## 🚀 การติดตั้ง

### 1. Packages ที่ติดตั้งแล้ว
```bash
npm install stripe @stripe/stripe-js @stripe/react-stripe-js
```

เราได้ติดตั้ง packages เหล่านี้แล้ว:
- `stripe` - Stripe Node.js library (สำหรับ server-side)
- `@stripe/stripe-js` - Stripe.js library (สำหรับ client-side)
- `@stripe/react-stripe-js` - React components สำหรับ Stripe

---

## 🔑 การตั้งค่า Stripe Account

### 1. สร้าง Stripe Account
1. ไปที่ https://dashboard.stripe.com/register
2. สมัครสมาชิก (ใช้อีเมลและข้อมูลธุรกิจของคุณ)
3. ยืนยันอีเมล

### 2. เปิดโหมด Test Mode
1. ล็อกอินเข้า Stripe Dashboard
2. ตรวจสอบว่าคุณอยู่ใน **Test mode** (มุมบนขวา)
   - Toggle ควรอยู่ที่ "Test mode"

### 3. รับ API Keys
1. ไปที่ https://dashboard.stripe.com/apikeys
2. คุณจะเห็น:
   - **Publishable key** (pk_test_...)
   - **Secret key** (sk_test_...) - คลิก "Reveal test key"
3. เก็บ keys เหล่านี้ไว้ใช้ในขั้นตอนถัดไป

---

## ⚙️ การตั้งค่า Environment Variables

### 1. แก้ไขไฟล์ `.env.local`

เปิดไฟล์ `.env.local` และเพิ่ม/แก้ไข Stripe keys:

```env
# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_key_here
STRIPE_SECRET_KEY=sk_test_your_actual_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**⚠️ สำคัญ:**
- แทนที่ `pk_test_your_actual_key_here` ด้วย Publishable key จริงของคุณ
- แทนที่ `sk_test_your_actual_secret_key_here` ด้วย Secret key จริงของคุณ
- **อย่า commit** `.env.local` เข้า git (ไฟล์นี้อยู่ใน .gitignore แล้ว)

---

## 🗄️ การรัน Database Migration

### 1. Run Migration สำหรับ Payments Tables

```bash
# ถ้าใช้ Supabase local
npx supabase db reset --local

# หรือถ้าใช้ Supabase cloud
npx supabase db push
```

Migration นี้จะสร้าง tables ต่อไปนี้:
- `payments` - เก็บข้อมูลการชำระเงิน
- `orders` - เก็บข้อมูลคำสั่งซื้อ
- `product_orders` - เก็บข้อมูลคำสั่งซื้อสินค้า
- `ticket_bookings` - เก็บข้อมูลการจองตั๋ว
- `gym_bookings` - เก็บข้อมูลการจองค่ายมวย

### 2. ตรวจสอบ Tables

```bash
npx supabase db inspect db --schema public
```

---

## 🔔 การตั้งค่า Webhook

Webhook จะทำให้ Stripe แจ้งเตือนแอปของคุณเมื่อมีการชำระเงินสำเร็จหรือล้มเหลว

### สำหรับ Local Development (ใช้ Stripe CLI)

#### 1. ติดตั้ง Stripe CLI
```bash
# macOS
brew install stripe/stripe-cli/stripe

# Windows (ใช้ Scoop)
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe

# หรือดาวน์โหลดจาก: https://github.com/stripe/stripe-cli/releases
```

#### 2. Login เข้า Stripe CLI
```bash
stripe login
```
จะเปิด browser ให้คุณยืนยันการเชื่อมต่อ

#### 3. Forward Webhooks ไปยัง Local Server
```bash
# เปิด terminal ใหม่และรันคำสั่งนี้
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

คุณจะได้ **webhook signing secret** (whsec_...)

#### 4. คัดลอก Webhook Secret ไปยัง `.env.local`
```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

#### 5. เริ่ม Development Server
```bash
# เปิด terminal อีกหนึ่งอัน
npm run dev
```

**ตอนนี้คุณมี 2 terminals ทำงาน:**
- Terminal 1: `npm run dev` (Next.js server)
- Terminal 2: `stripe listen --forward-to...` (Webhook forwarding)

### สำหรับ Production

#### 1. ตั้งค่า Webhook ใน Stripe Dashboard
1. ไปที่ https://dashboard.stripe.com/webhooks
2. คลิก "+ Add endpoint"
3. ใส่ URL: `https://yourdomain.com/api/webhooks/stripe`
4. เลือก events ที่ต้องการ:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
   - `charge.refunded`
5. คลิก "Add endpoint"
6. คัดลอก **Signing secret** (whsec_...)
7. เพิ่มใน production environment variables

---

## 💳 การใช้งาน

### 1. การซื้อสินค้า (Shop)

```typescript
// ตัวอย่างการใช้งาน
// เปิด URL: /shop/checkout?productId=123&productName=T-Shirt&quantity=2&amount=1000

// หน้าจะแสดง:
// - สรุปรายการสั่งซื้อ
// - ฟอร์มชำระเงิน Stripe
// - หลังชำระเงินจะ redirect ไป /shop/order-success
```

### 2. การจองตั๋ว (Ticket Booking)

```typescript
// ตัวอย่างการใช้งาน
// เปิด URL: /tickets/checkout?eventId=event123&eventName=Muay Thai Fight&ticketCount=2&amount=2000

// หน้าจะแสดง:
// - สรุปการจองตั๋ว
// - ฟอร์มชำระเงิน
// - หลังชำระเงินจะ redirect ไป /tickets/booking-success
```

### 3. การจองค่ายมวย (Gym Booking) - พร้อม Progress Bar

```typescript
// ตัวอย่างการใช้งาน
// เปิด URL: /gyms/booking/[gymId]

// ขั้นตอน:
// Step 1: เลือกวันที่เข้าพัก
// Step 2: เลือกแพ็กเกจ (รายวัน/รายสัปดาห์/รายเดือน)
// Step 3: กรอกข้อมูลติดต่อ
// Step 4: ชำระเงิน
```

**ตัวอย่างการใช้ในหน้า Gym Detail:**

```tsx
import Link from 'next/link';

function GymDetailPage({ gym }) {
  return (
    <div>
      <h1>{gym.name}</h1>
      <Link
        href={`/gyms/booking/${gym.id}`}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg"
      >
        จองเลย
      </Link>
    </div>
  );
}
```

---

## 🧪 การทดสอบ

### Test Cards สำหรับทดสอบ

Stripe มี test cards ให้ใช้ทดสอบ:

#### ✅ การชำระเงินสำเร็จ
```
Card Number: 4242 4242 4242 4242
Expiry: ใส่อนาคต (เช่น 12/34)
CVC: ใส่ 3 หลักใดก็ได้ (เช่น 123)
```

#### ❌ การชำระเงินถูกปฏิเสธ
```
Card Number: 4000 0000 0000 0002
Expiry: ใส่อนาคต
CVC: ใส่ 3 หลักใดก็ได้
```

#### 🔒 การยืนยันตัวตน 3D Secure
```
Card Number: 4000 0027 6000 3184
Expiry: ใส่อนาคต
CVC: ใส่ 3 หลักใดก็ได้
```

### ขั้นตอนการทดสอบ

1. **เริ่มต้น servers:**
   ```bash
   # Terminal 1
   npm run dev

   # Terminal 2
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

2. **ทดสอบการซื้อสินค้า:**
   - เปิด: `http://localhost:3000/shop/checkout?productId=test-product&productName=Test%20Product&quantity=1&amount=100`
   - กรอก test card: 4242 4242 4242 4242
   - คลิก "ชำระเงิน"
   - ตรวจสอบว่า redirect ไป success page

3. **ทดสอบการจองค่ายมวย:**
   - เปิด: `http://localhost:3000/gyms/booking/[gym-id]`
   - ทำตามขั้นตอน 4 steps
   - ชำระเงินด้วย test card
   - ตรวจสอบ progress bar ทำงาน
   - ตรวจสอบว่า redirect ไป success page

4. **ตรวจสอบ Webhook:**
   - ดูใน Terminal 2 (stripe listen) ควรเห็น:
     ```
     payment_intent.succeeded
     ```
   - ตรวจสอบใน Supabase ว่า:
     - `payments` table มีข้อมูลใหม่
     - `orders` table มีข้อมูลใหม่
     - `gym_bookings` table มีข้อมูลใหม่ (สำหรับ gym booking)

5. **ตรวจสอบใน Stripe Dashboard:**
   - ไปที่ https://dashboard.stripe.com/test/payments
   - คุณจะเห็นรายการชำระเงินที่เพิ่งทำ

---

## 📊 โครงสร้างฐานข้อมูล

### Tables ที่สร้างขึ้น

```sql
payments
├── id (uuid)
├── user_id (uuid)
├── stripe_payment_intent_id (text)
├── stripe_customer_id (text)
├── amount (decimal)
├── currency (text)
├── status (payment_status enum)
├── payment_type (payment_type enum)
└── metadata (jsonb)

orders
├── id (uuid)
├── user_id (uuid)
├── payment_id (uuid)
├── order_number (text)
├── total_amount (decimal)
├── status (order_status enum)
└── items (jsonb)

gym_bookings
├── id (uuid)
├── order_id (uuid)
├── user_id (uuid)
├── gym_id (uuid)
├── start_date (date)
├── end_date (date)
├── package_type (text)
├── total_price (decimal)
└── is_confirmed (boolean)
```

---

## 🔐 Security Best Practices

1. **อย่า expose Secret Key:**
   - ใช้แค่ใน server-side code
   - ไม่ใช้ใน client-side code
   - เก็บใน environment variables

2. **ตรวจสอบ Webhook Signature:**
   - ใช้ `stripe.webhooks.constructEvent()`
   - ตรวจสอบว่า request มาจาก Stripe จริง

3. **ตรวจสอบ Amount:**
   - ตรวจสอบราคาที่ server-side ก่อนสร้าง payment intent
   - อย่าเชื่อถือ amount ที่มาจาก client

4. **Use HTTPS in Production:**
   - Webhook endpoint ต้องเป็น HTTPS
   - Stripe จะไม่ส่ง webhook ไปยัง HTTP

---

## 🐛 Troubleshooting

### ปัญหา: "Missing STRIPE_SECRET_KEY"
**แก้ไข:**
- ตรวจสอบ `.env.local` มี `STRIPE_SECRET_KEY`
- Restart dev server หลังแก้ไข env

### ปัญหา: Webhook ไม่ทำงาน
**แก้ไข:**
- ตรวจสอบ `stripe listen` กำลังทำงาน
- ตรวจสอบ `.env.local` มี `STRIPE_WEBHOOK_SECRET`
- ตรวจสอบ URL ใน webhook ถูกต้อง

### ปัญหา: Payment fails ทันที
**แก้ไข:**
- ใช้ test card ที่ถูกต้อง (4242 4242 4242 4242)
- ตรวจสอบ expiry date ใส่วันในอนาคต
- ตรวจสอบใน Stripe Dashboard > Logs

### ปัญหา: Database error
**แก้ไข:**
- รัน migration อีกครั้ง: `npx supabase db reset --local`
- ตรวจสอบ RLS policies
- ตรวจสอบ user authentication

---

## 📚 Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Testing Cards](https://stripe.com/docs/testing)
- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)
- [Stripe Dashboard](https://dashboard.stripe.com)
- [Next.js + Stripe Guide](https://stripe.com/docs/payments/quickstart?lang=node&client=next)

---

## 🎯 สรุป

คุณได้ติดตั้งระบบชำระเงิน Stripe เรียบร้อยแล้ว ซึ่งรองรับ:

✅ **3 ประเภทการชำระเงิน:**
1. การซื้อสินค้า (Shop)
2. การจองตั๋ว (Ticket Booking)
3. การจองค่ายมวย (Gym Booking) พร้อม Progress Bar แบบ 4 steps

✅ **Features ที่มี:**
- Payment Intent API
- Webhook handler
- Database schema สำหรับ payments และ bookings
- Reusable payment components
- Success pages
- Test mode ready

**ขั้นตอนถัดไป:**
1. ใส่ Stripe API keys ใน `.env.local`
2. รัน database migration
3. ตั้งค่า webhook ด้วย Stripe CLI
4. ทดสอบด้วย test cards
5. เมื่อพร้อม production ให้สลับไปใช้ production keys

**ต้องการความช่วยเหลือ?**
- ดูใน Stripe Dashboard > Logs
- เช็ค Terminal output
- ดู Network tab ใน browser DevTools
