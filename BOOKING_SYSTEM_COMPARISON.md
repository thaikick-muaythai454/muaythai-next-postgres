# เปรียบเทียบระบบการจอง 2 แบบ

## 📊 สรุปความแตกต่าง

คุณมี **2 ระบบการจอง** ในโปรเจคนี้:

---

## 1️⃣ ระบบการจองแบบเดิม (ไม่มี Stripe)

### 📂 ไฟล์ที่เกี่ยวข้อง
- API: `/api/bookings` ([route.ts](src/app/api/bookings/route.ts))
- Database: ตาราง `bookings` และ `gym_packages`

### 🎯 จุดประสงค์
- การจองแบบง่าย ไม่มีการชำระเงินออนไลน์
- อาจใช้สำหรับ "จองก่อน ชำระทีหลัง" หรือการชำระเงินแบบอื่น

### 📝 ข้อมูลที่ใช้
```typescript
// Request Body
{
  gym_id: string;
  package_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  start_date: string;
  special_requests?: string;
  payment_method?: string;
}

// Response
{
  success: true,
  data: {
    booking_number: "BK202501XXXX",  // Format: BK + YYYYMM + random
    payment_status: "pending",
    status: "pending",
    // ... other fields
  }
}
```

### 🗄️ Database Schema
```sql
bookings (
  id,
  user_id,
  gym_id,
  package_id,
  booking_number,
  customer_name,
  customer_email,
  customer_phone,
  start_date,
  end_date,
  price_paid,
  package_name,
  package_type,
  duration_months,
  special_requests,
  payment_method,
  payment_status,  -- 'pending'
  status           -- 'pending'
)
```

### ✅ ข้อดี
- ง่าย รวดเร็ว
- ไม่ต้องผูกกับระบบชำระเงิน
- เหมาะสำหรับการจองที่ยังไม่ต้องการชำระเงินทันที

### ❌ ข้อจำกัด
- ไม่มีการชำระเงินออนไลน์
- ไม่มี payment tracking
- ไม่มี order management system

---

## 2️⃣ ระบบการจองแบบใหม่ (มี Stripe Payment)

### 📂 ไฟล์ที่เกี่ยวข้อง
- Page: `/gyms/booking/[gymId]` ([page.tsx](src/app/gyms/booking/[gymId]/page.tsx))
- API Payment: `/api/payments/create-payment-intent` ([route.ts](src/app/api/payments/create-payment-intent/route.ts))
- API Booking: `/api/bookings/gym` ([route.ts](src/app/api/bookings/gym/route.ts))
- Webhook: `/api/webhooks/stripe` ([route.ts](src/app/api/webhooks/stripe/route.ts))
- Database: ตาราง `payments`, `orders`, `gym_bookings`

### 🎯 จุดประสงค์
- การจองพร้อมชำระเงินออนไลน์ผ่าน Stripe
- ระบบ order management ที่สมบูรณ์
- มี Progress Bar 4 ขั้นตอน

### 📝 Flow การทำงาน

```
Step 1: เลือกวันที่
   ↓
Step 2: เลือกแพ็กเกจ
   ↓
Step 3: กรอกข้อมูลติดต่อ
   ↓
Step 4: ชำระเงินผ่าน Stripe
   ↓
Webhook อัพเดทสถานะ
   ↓
Success Page
```

### 🗄️ Database Schema

```sql
-- 1. ตาราง payments (เก็บข้อมูลการชำระเงิน)
payments (
  id,
  user_id,
  stripe_payment_intent_id,  -- Stripe payment ID
  stripe_customer_id,
  amount,
  currency,                  -- 'thb'
  status,                    -- 'pending', 'succeeded', 'failed'
  payment_type,              -- 'gym_booking'
  metadata                   -- JSON data
)

-- 2. ตาราง orders (เก็บข้อมูลคำสั่งซื้อ)
orders (
  id,
  user_id,
  payment_id,                -- FK to payments
  order_number,              -- "ORD-YYYYMMDD-XXXX"
  total_amount,
  status,                    -- 'pending', 'confirmed', 'completed'
  customer_name,
  customer_email,
  items                      -- JSON array
)

-- 3. ตาราง gym_bookings (เก็บข้อมูลการจองค่ายมวย)
gym_bookings (
  id,
  order_id,                  -- FK to orders
  user_id,
  gym_id,
  start_date,
  end_date,
  duration_days,
  package_type,              -- 'daily', 'weekly', 'monthly'
  package_name,
  total_price,
  is_confirmed,              -- Updated by webhook
  confirmed_at,
  notes,
  special_requests
)
```

### ✅ ข้อดี
- ชำระเงินออนไลน์ทันที ปลอดภัย
- มี Order Management System
- มี Payment Tracking
- รองรับ Webhook จาก Stripe
- Progress Bar ทำให้ UX ดีขึ้น
- สามารถ refund ได้
- มี audit trail สมบูรณ์

### ❌ ข้อจำกัด
- ซับซ้อนกว่า
- ต้องมี Stripe Account
- ต้องตั้งค่า Webhook

---

## 🤔 ควรใช้ระบบไหน?

### ใช้ระบบเดิม (`/api/bookings`) เมื่อ:
- ❌ **ไม่แนะนำ** สำหรับการใช้งานใหม่
- เก็บไว้เพื่อ backward compatibility เท่านั้น
- ถ้ามี code เก่าที่ยังใช้งานอยู่

### ใช้ระบบใหม่ (`/gyms/booking/[gymId]`) เมื่อ:
- ✅ **แนะนำ** สำหรับการพัฒนาใหม่ทั้งหมด
- ต้องการชำระเงินออนไลน์
- ต้องการระบบที่สมบูรณ์

---

## 📋 การใช้งาน

### ระบบเดิม (GET bookings)
```javascript
// ดึงรายการจองทั้งหมด
const response = await fetch('/api/bookings');
const { data: bookings } = await response.json();
```

### ระบบเดิม (POST - สร้างการจอง)
```javascript
// สร้างการจองแบบไม่มี payment
const response = await fetch('/api/bookings', {
  method: 'POST',
  body: JSON.stringify({
    gym_id: 'gym_123',
    package_id: 'pkg_456',
    customer_name: 'John Doe',
    customer_email: 'john@example.com',
    customer_phone: '0812345678',
    start_date: '2025-03-01',
  }),
});
```

### ระบบใหม่ (Stripe Payment Flow)
```javascript
// 1. ผู้ใช้กรอกข้อมูลใน UI (4 steps)
// 2. ระบบจะเรียก API อัตโนมัติ:

// Step 3 -> 4: สร้าง payment intent
const paymentResponse = await fetch('/api/payments/create-payment-intent', {
  method: 'POST',
  body: JSON.stringify({
    amount: 10000,
    paymentType: 'gym_booking',
    metadata: {
      gymId: 'gym_123',
      gymName: 'Tiger Muay Thai',
      startDate: '2025-03-01',
      endDate: '2025-03-31',
      packageType: 'monthly',
    },
  }),
});

const { clientSecret, orderId } = await paymentResponse.json();

// Step 4: สร้างการจอง
await fetch('/api/bookings/gym', {
  method: 'POST',
  body: JSON.stringify({
    orderId,
    gymId: 'gym_123',
    startDate: '2025-03-01',
    endDate: '2025-03-31',
    durationDays: 30,
    packageType: 'monthly',
    packageName: 'แพ็กเกจรายเดือน',
    packageNameEn: 'Monthly Package',
    unitPrice: 10000,
    totalPrice: 10000,
  }),
});

// Stripe Elements จะจัดการการชำระเงิน
// Webhook จะอัพเดทสถานะเมื่อชำระเงินสำเร็จ
```

---

## 🔄 Migration Path (ถ้าต้องการรวมระบบ)

ถ้าคุณต้องการให้ระบบเดิมใช้ Stripe ด้วย:

### Option 1: ใช้ระบบใหม่ทั้งหมด (แนะนำ)
1. ย้ายข้อมูลจาก `bookings` → `gym_bookings`
2. ใช้หน้า `/gyms/booking/[gymId]` สำหรับการจองใหม่ทั้งหมด
3. เก็บ API `/api/bookings` ไว้แค่ GET (ดูรายการเก่า)

### Option 2: อัพเกรดระบบเดิม
1. เพิ่มฟิลด์ใน `bookings` table:
   - `payment_id` → FK to `payments`
   - `order_id` → FK to `orders`
2. แก้ไข `/api/bookings` POST ให้เรียก payment API ก่อน
3. รวม logic เข้ากัน

### Option 3: ใช้ทั้ง 2 ระบบ (ปัจจุบัน)
- ระบบเดิม: สำหรับ backward compatibility
- ระบบใหม่: สำหรับ feature ใหม่ที่ต้องการ Stripe

---

## 📊 ตารางเปรียบเทียบ

| Feature | ระบบเดิม | ระบบใหม่ (Stripe) |
|---------|---------|-------------------|
| **API Endpoint** | `/api/bookings` | `/gyms/booking/[gymId]` |
| **Database Tables** | `bookings` | `payments`, `orders`, `gym_bookings` |
| **Payment Gateway** | ❌ ไม่มี | ✅ Stripe |
| **Online Payment** | ❌ | ✅ |
| **Order Tracking** | ❌ | ✅ |
| **Payment Status** | Manual | Automatic (Webhook) |
| **Refund Support** | ❌ | ✅ |
| **Progress Bar UI** | ❌ | ✅ (4 steps) |
| **Order Number Format** | `BK202501XXXX` | `ORD-YYYYMMDD-XXXX` |
| **Booking Confirmation** | Manual | Automatic |
| **Security** | Basic | Enhanced (Stripe) |
| **User Experience** | Simple | Modern & Complete |

---

## 🎯 คำแนะนำ

### สำหรับโปรเจคใหม่:
✅ **ใช้ระบบใหม่** (`/gyms/booking/[gymId]` + Stripe)

### สำหรับโปรเจคที่มีอยู่:
1. ถ้ามีข้อมูลเก่าใน `bookings` table → เก็บ API เดิมไว้
2. เพิ่มหน้าใหม่สำหรับการจองแบบใหม่
3. ค่อยๆ migrate ข้อมูลเก่า

### วิธีเชื่อมต่อทั้ง 2 ระบบ:
```typescript
// หน้า Gym Detail
function GymDetailPage({ gym }) {
  return (
    <div>
      {/* ปุ่มจองแบบใหม่ (มี Stripe) */}
      <Link href={`/gyms/booking/${gym.id}`}>
        จองพร้อมชำระเงิน (Stripe)
      </Link>

      {/* ปุ่มจองแบบเก่า (ไม่มี payment) */}
      <Link href={`/booking/new?gym_id=${gym.id}`}>
        จองแบบธรรมดา (ชำระทีหลัง)
      </Link>
    </div>
  );
}
```

---

## 📚 เอกสารที่เกี่ยวข้อง

- [STRIPE_SETUP_GUIDE.md](STRIPE_SETUP_GUIDE.md) - วิธีติดตั้ง Stripe
- [STRIPE_API_REFERENCE.md](STRIPE_API_REFERENCE.md) - API Documentation
- [Migration Script](./docs/booking-migration.md) - สคริปต์ย้ายข้อมูล (ถ้าต้องการ)

---

## ❓ คำถามที่พบบ่อย

### Q: ต้อง migrate ข้อมูลเก่าไหม?
A: ไม่จำเป็น สามารถใช้ทั้ง 2 ระบบแยกกันได้

### Q: ถ้าต้องการให้ระบบเดิมใช้ Stripe ทำยังไง?
A: แก้ API `/api/bookings` POST ให้เรียก `/api/payments/create-payment-intent` ก่อน

### Q: ระบบไหนดีกว่ากัน?
A: **ระบบใหม่** ดีกว่า เพราะมี payment tracking และ UX ดีกว่า

### Q: ถ้าไม่ต้องการ Stripe ล่ะ?
A: ใช้ระบบเดิม `/api/bookings` ต่อไปได้ หรือแก้ระบบใหม่ให้รองรับการชำระเงินแบบอื่น
