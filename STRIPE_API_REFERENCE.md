# Stripe Payment API Reference

คู่มือการใช้งาน API endpoints สำหรับระบบชำระเงิน Stripe

---

## 📋 Table of Contents

1. [Payment Intents API](#payment-intents-api)
2. [Gym Bookings API](#gym-bookings-api)
3. [Webhooks API](#webhooks-api)
4. [Response Types](#response-types)
5. [Error Handling](#error-handling)

---

## 💳 Payment Intents API

### Create Payment Intent

สร้าง payment intent สำหรับการชำระเงิน

**Endpoint:** `POST /api/payments/create-payment-intent`

**Authentication:** Required (User must be logged in)

**Request Body:**
```typescript
{
  amount: number;          // จำนวนเงินเป็นบาท (THB)
  paymentType: 'product' | 'ticket' | 'gym_booking';
  metadata: {
    // สำหรับ product
    productId?: string;
    productName?: string;
    quantity?: number;

    // สำหรับ ticket
    eventId?: string;
    eventName?: string;
    eventDate?: string;
    ticketCount?: number;
    ticketType?: string;

    // สำหรับ gym_booking
    gymId?: string;
    gymName?: string;
    startDate?: string;
    endDate?: string;
    packageType?: string;
    packageName?: string;
    duration?: number;
    userName?: string;
    userPhone?: string;

    // ฟิลด์เพิ่มเติม
    [key: string]: any;
  };
}
```

**Response:**
```typescript
{
  clientSecret: string;      // ใช้สำหรับ Stripe Elements
  paymentIntentId: string;   // Stripe payment intent ID
  orderId: string;           // Order ID ในระบบ
  orderNumber: string;       // Order number (ORD-YYYYMMDD-XXXX)
}
```

**Example - Product Purchase:**
```javascript
const response = await fetch('/api/payments/create-payment-intent', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    amount: 1500,
    paymentType: 'product',
    metadata: {
      productId: 'prod_123',
      productName: 'Muay Thai Gloves',
      quantity: 1,
    },
  }),
});

const data = await response.json();
// data.clientSecret -> ใช้กับ Stripe Elements
```

**Example - Ticket Booking:**
```javascript
const response = await fetch('/api/payments/create-payment-intent', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    amount: 2000,
    paymentType: 'ticket',
    metadata: {
      eventId: 'event_456',
      eventName: 'Lumpinee Championship',
      eventDate: '2025-02-15',
      ticketCount: 2,
      ticketType: 'VIP',
    },
  }),
});

const data = await response.json();
```

**Example - Gym Booking:**
```javascript
const response = await fetch('/api/payments/create-payment-intent', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    amount: 10000,
    paymentType: 'gym_booking',
    metadata: {
      gymId: 'gym_789',
      gymName: 'Tiger Muay Thai',
      startDate: '2025-03-01',
      endDate: '2025-03-31',
      packageType: 'monthly',
      packageName: 'Monthly Package',
      duration: 30,
      userName: 'John Doe',
      userPhone: '0812345678',
    },
  }),
});

const data = await response.json();
```

**Error Responses:**
- `401 Unauthorized` - User not authenticated
- `400 Bad Request` - Missing required fields or invalid data
- `500 Internal Server Error` - Server error

---

## 🥊 Gym Bookings API

### Create Gym Booking

สร้างการจองค่ายมวย

**Endpoint:** `POST /api/bookings/gym`

**Authentication:** Required

**Request Body:**
```typescript
{
  orderId: string;           // Order ID from payment intent
  gymId: string;             // Gym ID
  startDate: string;         // ISO date string (YYYY-MM-DD)
  endDate: string;           // ISO date string (YYYY-MM-DD)
  durationDays: number;      // Number of days
  packageType: string;       // 'daily' | 'weekly' | 'monthly'
  packageName: string;       // Package name (TH)
  packageNameEn: string;     // Package name (EN)
  unitPrice: number;         // Price per unit
  totalPrice: number;        // Total price
  notes?: string;            // Optional notes
  specialRequests?: string;  // Optional special requests
}
```

**Response:**
```typescript
{
  id: string;
  order_id: string;
  user_id: string;
  gym_id: string;
  start_date: string;
  end_date: string;
  duration_days: number;
  package_type: string;
  package_name: string;
  package_name_en: string;
  unit_price: number;
  total_price: number;
  is_confirmed: boolean;
  created_at: string;
  updated_at: string;
}
```

**Example:**
```javascript
const response = await fetch('/api/bookings/gym', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    orderId: 'order_123',
    gymId: 'gym_789',
    startDate: '2025-03-01',
    endDate: '2025-03-31',
    durationDays: 30,
    packageType: 'monthly',
    packageName: 'แพ็กเกจรายเดือน',
    packageNameEn: 'Monthly Package',
    unitPrice: 10000,
    totalPrice: 10000,
    notes: 'I prefer morning training',
  }),
});

const booking = await response.json();
```

### Get User's Gym Bookings

ดึงข้อมูลการจองค่ายมวยทั้งหมดของผู้ใช้

**Endpoint:** `GET /api/bookings/gym`

**Authentication:** Required

**Response:**
```typescript
Array<{
  id: string;
  order_id: string;
  user_id: string;
  gym_id: string;
  start_date: string;
  end_date: string;
  duration_days: number;
  package_type: string;
  package_name: string;
  total_price: number;
  is_confirmed: boolean;
  gyms: {
    id: string;
    name: string;
    name_en: string;
    location: string;
    province: string;
    image_url: string;
  };
  orders: {
    id: string;
    order_number: string;
    status: string;
    total_amount: number;
  };
  created_at: string;
  updated_at: string;
}>
```

**Example:**
```javascript
const response = await fetch('/api/bookings/gym');
const bookings = await response.json();

bookings.forEach(booking => {
  console.log(`Booking at ${booking.gyms.name}`);
  console.log(`Order: ${booking.orders.order_number}`);
  console.log(`Status: ${booking.orders.status}`);
});
```

---

## 🔔 Webhooks API

### Stripe Webhook Handler

รับ events จาก Stripe และอัพเดทสถานะใน database

**Endpoint:** `POST /api/webhooks/stripe`

**Authentication:** Stripe signature verification

**Headers:**
```
stripe-signature: <signature>
```

**Supported Events:**

#### `payment_intent.succeeded`
- อัพเดท payment status เป็น 'succeeded'
- อัพเดท order status เป็น 'confirmed'
- ทำการ confirm gym booking (ถ้าเป็น gym_booking)

#### `payment_intent.payment_failed`
- อัพเดท payment status เป็น 'failed'
- อัพเดท order status เป็น 'canceled'

#### `payment_intent.canceled`
- อัพเดท payment status เป็น 'canceled'
- อัพเดท order status เป็น 'canceled'

#### `charge.refunded`
- อัพเดท payment status เป็น 'refunded'
- อัพเดท order status เป็น 'refunded'

**Response:**
```typescript
{
  received: true
}
```

**การตั้งค่า Webhook:**

1. **Local Development:**
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

2. **Production:**
   - ไปที่ Stripe Dashboard > Webhooks
   - เพิ่ม endpoint: `https://yourdomain.com/api/webhooks/stripe`
   - เลือก events ที่ต้องการ
   - คัดลอก signing secret ไปใส่ใน `STRIPE_WEBHOOK_SECRET`

---

## 📦 Response Types

### Payment Status
```typescript
type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'canceled'
  | 'refunded';
```

### Order Status
```typescript
type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'completed'
  | 'canceled'
  | 'refunded';
```

### Payment Type
```typescript
type PaymentType = 'product' | 'ticket' | 'gym_booking';
```

### Package Type
```typescript
type PackageType = 'daily' | 'weekly' | 'monthly';
```

---

## ⚠️ Error Handling

### Error Response Format
```typescript
{
  error: string;  // Error message
}
```

### Common Error Codes

#### 400 Bad Request
```json
{
  "error": "Missing required fields: amount, paymentType, metadata"
}
```

#### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

#### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

### Client-side Error Handling Example

```typescript
try {
  const response = await fetch('/api/payments/create-payment-intent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(paymentData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Payment failed');
  }

  const data = await response.json();
  // Use data.clientSecret with Stripe Elements
} catch (error) {
  console.error('Payment error:', error);
  // Show error to user
}
```

---

## 🔧 Utility Functions

### Format Amount for Stripe
```typescript
import { formatAmountForStripe } from '@/lib/stripe';

// Convert 100 THB to 10000 satang (smallest unit)
const amount = formatAmountForStripe(100); // Returns 10000
```

### Format Amount for Display
```typescript
import { formatAmountForDisplay } from '@/lib/stripe';

// Format amount for Thai display
const displayAmount = formatAmountForDisplay(100); // Returns "฿100.00"
```

### Get Stripe Client
```typescript
import { getStripe } from '@/lib/stripe-client';

const stripe = await getStripe();
// Use with Stripe Elements
```

---

## 📱 Client-side Integration Examples

### Using with Stripe Elements

```typescript
'use client';

import { useState, useEffect } from 'react';
import PaymentWrapper from '@/components/payments/PaymentWrapper';

export default function CheckoutPage() {
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    createPaymentIntent();
  }, []);

  const createPaymentIntent = async () => {
    const response = await fetch('/api/payments/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: 1000,
        paymentType: 'product',
        metadata: {
          productId: 'prod_123',
          productName: 'Test Product',
          quantity: 1,
        },
      }),
    });

    const data = await response.json();
    setClientSecret(data.clientSecret);
  };

  if (!clientSecret) {
    return <div>Loading...</div>;
  }

  return (
    <PaymentWrapper
      clientSecret={clientSecret}
      returnUrl="/payment/success"
      onSuccess={(paymentIntentId) => {
        console.log('Payment succeeded:', paymentIntentId);
      }}
      onError={(error) => {
        console.error('Payment failed:', error);
      }}
    />
  );
}
```

---

## 🎯 Best Practices

1. **Always validate on server-side:**
   - ตรวจสอบราคาและข้อมูลที่ server
   - อย่าเชื่อถือข้อมูลจาก client

2. **Handle webhooks properly:**
   - ตรวจสอบ signature ทุกครั้ง
   - Handle events แบบ idempotent

3. **User experience:**
   - แสดง loading state ขณะรอ payment
   - แสดง error message ที่ชัดเจน
   - Redirect ไป success page เมื่อสำเร็จ

4. **Security:**
   - ใช้ HTTPS ใน production
   - เก็บ secret keys ใน environment variables
   - อย่า expose secret key ใน client-side

5. **Testing:**
   - ใช้ test mode และ test cards ในการพัฒนา
   - ทดสอบทุก payment flow
   - ทดสอบ error cases

---

## 🔗 Related Documentation

- [STRIPE_SETUP_GUIDE.md](./STRIPE_SETUP_GUIDE.md) - คู่มือการติดตั้ง
- [Stripe API Docs](https://stripe.com/docs/api)
- [Payment Intents](https://stripe.com/docs/payments/payment-intents)
- [Webhooks](https://stripe.com/docs/webhooks)
