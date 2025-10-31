# คู่มือฟีเจอร์

เอกสารอธิบายฟีเจอร์ต่างๆ ของโปรเจกต์ Muay Thai Next.js + Supabase

## 📋 ภาพรวมฟีเจอร์

โปรเจกต์นี้เป็นแพลตฟอร์มครบครันสำหรับการจองค่ายมวยไทย ประกอบด้วยฟีเจอร์หลัก 6 ส่วน:

1. **ระบบสมาชิก (Authentication)**
2. **ระบบจัดการค่ายมวย (Gym Management)**
3. **ระบบการจอง (Booking System)**
4. **ระบบชำระเงิน (Payment Gateway)**
5. **ระบบจัดการสิทธิ์ (Role-Based Access)**
6. **แดชบอร์ด (Dashboards)**

## 🔐 1. ระบบสมาชิก (Authentication)

### ฟีเจอร์ย่อย
- การสมัครสมาชิก
- การเข้าสู่ระบบ
- การยืนยันอีเมล
- การรีเซ็ตรหัสผ่าน
- การจัดการโปรไฟล์

### การทำงาน

#### การสมัครสมาชิก
```typescript
// User Registration Flow
1. User fills registration form
2. Validate input data (Zod schema)
3. Create user in Supabase Auth
4. Send email verification
5. Create user profile in database
6. Redirect to email verification page
```

#### การเข้าสู่ระบบ
```typescript
// Login Flow
1. User enters email/password
2. Authenticate with Supabase Auth
3. Get user session and JWT token
4. Fetch user profile and roles
5. Redirect to appropriate dashboard
```

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/signup` | POST | สมัครสมาชิก |
| `/api/auth/signin` | POST | เข้าสู่ระบบ |
| `/api/auth/signout` | POST | ออกจากระบบ |
| `/api/auth/reset-password` | POST | รีเซ็ตรหัสผ่าน |
| `/api/auth/update-profile` | PUT | อัพเดทโปรไฟล์ |

### Components

```
src/components/auth/
├── LoginForm.tsx           # ฟอร์มเข้าสู่ระบบ
├── RegisterForm.tsx        # ฟอร์มสมัครสมาชิก
├── ResetPasswordForm.tsx   # ฟอร์มรีเซ็ตรหัสผ่าน
├── ProfileForm.tsx         # ฟอร์มแก้ไขโปรไฟล์
└── AuthGuard.tsx          # Component ป้องกันการเข้าถึง
```

## 🏋️ 2. ระบบจัดการค่ายมวย (Gym Management)

### ฟีเจอร์ย่อย
- การสร้างและแก้ไขข้อมูลค่ายมวย
- การอัพโหลดรูปภาพ
- การจัดการแพ็คเกจ
- การตั้งค่าราคาและระยะเวลา
- การจัดการสถานะค่ายมวย

### การทำงาน

#### การสร้างค่ายมวย
```typescript
// Gym Creation Flow
1. Partner fills gym information form
2. Upload gym images to Supabase Storage
3. Validate gym data
4. Create gym record in database
5. Generate unique slug for gym
6. Set gym status (pending approval)
7. Notify admin for approval
```

#### การจัดการแพ็คเกจ
```typescript
// Package Management Flow
1. Partner creates gym packages
2. Set package details (name, price, duration, features)
3. Validate package data
4. Save to database
5. Update gym package list
```

### Database Schema

```sql
-- Gyms Table
CREATE TABLE gyms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES profiles(id),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    description TEXT,
    location JSONB,
    images JSONB,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Gym Packages Table
CREATE TABLE gym_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID REFERENCES gyms(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    duration_days INTEGER NOT NULL,
    features JSONB,
    is_active BOOLEAN DEFAULT true
);
```

### Components

```
src/components/gyms/
├── GymForm.tsx             # ฟอร์มสร้าง/แก้ไขค่ายมวย
├── GymCard.tsx             # การ์ดแสดงข้อมูลค่ายมวย
├── GymList.tsx             # รายการค่ายมวย
├── GymDetails.tsx          # รายละเอียดค่ายมวย
├── PackageForm.tsx         # ฟอร์มจัดการแพ็คเกจ
├── PackageCard.tsx         # การ์ดแสดงแพ็คเกจ
└── ImageUpload.tsx         # Component อัพโหลดรูปภาพ
```

## 📅 3. ระบบการจอง (Booking System)

### ฟีเจอร์ย่อย
- การค้นหาค่ายมวย
- การเลือกแพ็คเกจ
- การเลือกวันที่เริ่มต้น
- การยืนยันการจอง
- การติดตามสถานะการจอง

### การทำงาน

#### การจองแพ็คเกจ
```typescript
// Booking Flow
1. User searches and selects gym
2. Choose package and start date
3. Calculate end date and total amount
4. Fill booking form
5. Create booking record (status: pending)
6. Generate reference number
7. Redirect to payment
8. Update booking status after payment
```

#### การจัดการการจอง
```typescript
// Booking Management
1. User can view booking history
2. Partner can view gym bookings
3. Admin can view all bookings
4. Status tracking (pending, confirmed, cancelled, completed)
5. Email notifications for status changes
```

### Database Schema

```sql
-- Bookings Table
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id),
    gym_package_id UUID REFERENCES gym_packages(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    reference_number VARCHAR(50) UNIQUE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Components

```
src/components/bookings/
├── BookingForm.tsx         # ฟอร์มการจอง
├── BookingCard.tsx         # การ์ดแสดงการจอง
├── BookingList.tsx         # รายการการจอง
├── BookingDetails.tsx      # รายละเอียดการจอง
├── BookingStatus.tsx       # สถานะการจอง
└── DatePicker.tsx          # เลือกวันที่
```

## 💳 4. ระบบชำระเงิน (Payment Gateway)

### ฟีเจอร์ย่อย
- การชำระเงินผ่าน Stripe
- การติดตามสถานะการชำระเงิน
- การออกใบเสร็จ
- การคืนเงิน (Admin)

### การทำงาน

#### การชำระเงิน
```typescript
// Payment Flow
1. Create Stripe Payment Intent
2. Redirect to Stripe Checkout
3. User completes payment
4. Stripe webhook confirms payment
5. Update booking status to 'confirmed'
6. Create payment record
7. Send confirmation email
8. Redirect to success page
```

#### Stripe Integration
```typescript
// Stripe Configuration
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// Create Payment Intent
export async function createPaymentIntent(amount: number, currency: string = 'thb') {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100, // Convert to cents
    currency,
    automatic_payment_methods: {
      enabled: true,
    },
  });
  
  return paymentIntent;
}
```

### Database Schema

```sql
-- Payments Table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'THB',
    status VARCHAR(50) DEFAULT 'pending',
    stripe_payment_intent_id VARCHAR(255),
    stripe_charge_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Components

```
src/components/payments/
├── PaymentForm.tsx         # ฟอร์มชำระเงิน
├── PaymentStatus.tsx       # สถานะการชำระเงิน
├── PaymentHistory.tsx      # ประวัติการชำระเงิน
└── Receipt.tsx             # ใบเสร็จ
```

## 👥 5. ระบบจัดการสิทธิ์ (Role-Based Access)

### ระดับสิทธิ์

#### User (ผู้ใช้ทั่วไป)
- ดูข้อมูลค่ายมวยสาธารณะ
- จองแพ็คเกจ
- จัดการโปรไฟล์ส่วนตัว
- ดูประวัติการจอง

#### Partner (เจ้าของค่ายมวย)
- สิทธิ์ทั้งหมดของ User
- สร้างและจัดการค่ายมวยของตนเอง
- จัดการแพ็คเกจ
- ดูการจองของค่ายมวยตนเอง
- ดูสถิติและรายงาน

#### Admin (ผู้ดูแลระบบ)
- สิทธิ์ทั้งหมดในระบบ
- จัดการผู้ใช้ทั้งหมด
- อนุมัติ/ปฏิเสธค่ายมวย
- ดูข้อมูลและสถิติทั้งหมด
- จัดการระบบ

### การทำงาน

#### Role Assignment
```sql
-- Promote user to admin
SELECT public.promote_to_admin('user@example.com');

-- Check user role
SELECT * FROM public.check_user_role('user@example.com');

-- List all admins
SELECT * FROM public.list_all_admins();
```

#### Permission Checking
```typescript
// Permission Hooks
export function usePermissions() {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserPermissions(user.id).then(setPermissions);
    }
  }, [user]);

  return {
    isAdmin: permissions?.role === 'admin',
    isPartner: permissions?.role === 'partner' || permissions?.role === 'admin',
    canManageGym: (gymId: string) => 
      permissions?.role === 'admin' || permissions?.ownedGyms?.includes(gymId),
  };
}
```

### Components

```
src/components/auth/
├── RoleGuard.tsx           # ป้องกันการเข้าถึงตาม role
├── PermissionCheck.tsx     # ตรวจสอบสิทธิ์
└── AdminRoute.tsx          # Route สำหรับ admin เท่านั้น
```

## 📊 6. แดชบอร์ด (Dashboards)

### User Dashboard
- ภาพรวมการจองของผู้ใช้
- ค่ายมวยที่แนะนำ
- ประวัติการจอง
- การตั้งค่าโปรไฟล์

### Partner Dashboard
- สถิติค่ายมวย
- การจองที่เข้ามา
- จัดการค่ายมวยและแพ็คเกจ
- รายงานรายได้

### Admin Dashboard
- ภาพรวมระบบทั้งหมด
- จัดการผู้ใช้
- อนุมัติค่ายมวย
- สถิติและรายงาน
- การตั้งค่าระบบ

### การทำงาน

#### Dashboard Data Fetching
```typescript
// Dashboard Hooks
export function useDashboardData(userRole: string) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        let dashboardData;
        
        switch (userRole) {
          case 'admin':
            dashboardData = await fetchAdminDashboard();
            break;
          case 'partner':
            dashboardData = await fetchPartnerDashboard();
            break;
          default:
            dashboardData = await fetchUserDashboard();
        }
        
        setData(dashboardData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [userRole]);

  return { data, loading };
}
```

### Components

```
src/components/dashboard/
├── UserDashboard.tsx       # Dashboard ผู้ใช้
├── PartnerDashboard.tsx    # Dashboard partner
├── AdminDashboard.tsx      # Dashboard admin
├── StatsCard.tsx           # การ์ดแสดงสถิติ
├── RecentBookings.tsx      # การจองล่าสุด
├── GymStats.tsx            # สถิติค่ายมวย
└── SystemStats.tsx         # สถิติระบบ
```

## 🔄 Feature Integration

### Cross-Feature Communication

```typescript
// Event System for Feature Communication
export class EventBus {
  private events: { [key: string]: Function[] } = {};

  on(event: string, callback: Function) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  emit(event: string, data?: any) {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(data));
    }
  }
}

// Usage Example
eventBus.on('booking:created', (booking) => {
  // Update dashboard stats
  // Send notification
  // Update gym availability
});
```

### State Management

```typescript
// Global State Context
interface AppState {
  user: User | null;
  gyms: Gym[];
  bookings: Booking[];
  notifications: Notification[];
}

export const AppContext = createContext<{
  state: AppState;
  dispatch: Dispatch<AppAction>;
} | null>(null);
```

## 📱 Responsive Design

### Breakpoints

```css
/* Tailwind CSS Breakpoints */
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
2xl: 1536px /* Extra large desktop */
```

### Mobile-First Approach

```typescript
// Responsive Components
export function GymCard({ gym }: { gym: Gym }) {
  return (
    <div className="
      w-full 
      sm:w-1/2 
      lg:w-1/3 
      xl:w-1/4 
      p-4
    ">
      <div className="
        bg-white 
        rounded-lg 
        shadow-md 
        hover:shadow-lg 
        transition-shadow
      ">
        {/* Card content */}
      </div>
    </div>
  );
}
```

## 🔍 Search & Filtering

### Gym Search Features
- ค้นหาตามชื่อค่ายมวย
- กรองตามตำแหน่ง
- กรองตามราคา
- กรองตามฟีเจอร์
- เรียงลำดับผลการค้นหา

### Implementation

```typescript
// Search Hook
export function useGymSearch() {
  const [filters, setFilters] = useState<GymFilters>({
    query: '',
    location: '',
    priceRange: [0, 10000],
    features: [],
  });

  const [results, setResults] = useState<Gym[]>([]);

  const searchGyms = useCallback(async () => {
    const gyms = await searchGymsWithFilters(filters);
    setResults(gyms);
  }, [filters]);

  return {
    filters,
    setFilters,
    results,
    searchGyms,
  };
}
```

## 📧 Email Notifications

### Email Types
- ยืนยันการสมัครสมาชิก
- รีเซ็ตรหัสผ่าน
- ยืนยันการจอง
- อัพเดทสถานะการจอง
- การแจ้งเตือนสำหรับ Partner/Admin

### Implementation with Resend

```typescript
// Email Service
export class EmailService {
  private resend = new Resend(process.env.RESEND_API_KEY);

  async sendBookingConfirmation(booking: Booking) {
    await this.resend.emails.send({
      from: process.env.FROM_EMAIL!,
      to: booking.user.email,
      subject: 'ยืนยันการจอง - Muay Thai Next',
      html: await renderBookingConfirmationEmail(booking),
    });
  }
}
```

## 🚀 Performance Optimization

### Frontend Optimization
- Image optimization with Next.js Image
- Code splitting and lazy loading
- Caching with SWR/React Query
- Bundle optimization

### Database Optimization
- Proper indexing
- Query optimization
- Connection pooling
- Pagination

### Example Optimizations

```typescript
// Image Optimization
import Image from 'next/image';

export function GymImage({ src, alt }: { src: string; alt: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={400}
      height={300}
      className="rounded-lg"
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,..."
    />
  );
}

// Data Fetching with SWR
export function useGyms() {
  const { data, error, isLoading } = useSWR('/api/gyms', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000, // 1 minute
  });

  return {
    gyms: data,
    isLoading,
    error,
  };
}
```

## 📊 Analytics & Monitoring

### Tracking Events
- Page views
- User interactions
- Booking conversions
- Error tracking

### Implementation

```typescript
// Analytics Service
export class AnalyticsService {
  static trackEvent(event: string, properties?: Record<string, any>) {
    if (typeof window !== 'undefined') {
      // Google Analytics
      gtag('event', event, properties);
      
      // Custom analytics
      fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event, properties }),
      });
    }
  }

  static trackBooking(booking: Booking) {
    this.trackEvent('booking_created', {
      gym_id: booking.gym_package.gym_id,
      package_id: booking.gym_package_id,
      amount: booking.total_amount,
    });
  }
}
```

## 🔮 Future Features

### Planned Enhancements
1. **Real-time Chat** - ระหว่างผู้ใช้และเจ้าของค่าย
2. **Review System** - รีวิวและให้คะแนนค่ายมวย
3. **Loyalty Program** - โปรแกรมสะสมแต้ม
4. **Mobile App** - แอปพลิเคชันมือถือ
5. **Advanced Analytics** - รายงานและสถิติขั้นสูง
6. **Multi-language Support** - รองรับหลายภาษา

### Technical Improvements
1. **Microservices Architecture** - แยกระบบเป็น services
2. **GraphQL API** - API ที่ยืดหยุ่นมากขึ้น
3. **Real-time Updates** - อัพเดทข้อมูลแบบ real-time
4. **Advanced Caching** - ระบบ cache ขั้นสูง
5. **AI Recommendations** - แนะนำค่ายมวยด้วย AI

---

เอกสารนี้ให้ภาพรวมครบถ้วนของฟีเจอร์ทั้งหมดในโปรเจกต์ หากต้องการรายละเอียดเพิ่มเติมของฟีเจอร์ใดๆ สามารถดูได้ในโค้ดหรือติดต่อทีมพัฒนา