# Admin Gym Management

ระบบจัดการยิมสำหรับผู้ดูแลระบบ (Admin)

## โครงสร้างโฟลเดอร์

```
gyms/
├── _components/              # UI Components (Private)
│   ├── modals/              # Modal components
│   │   ├── GymDetailModal.tsx    # แสดงรายละเอียดยิม
│   │   ├── GymEditModal.tsx      # แก้ไขข้อมูลยิม
│   │   └── GymDeleteDialog.tsx   # ยืนยันการลบยิม
│   ├── GymStatsCards.tsx    # การ์ดสถิติยิม
│   └── index.ts             # Barrel exports
│
├── _hooks/                   # Custom React Hooks (Private)
│   ├── useGymManagement.ts  # Hook สำหรับจัดการ state และ logic
│   └── index.ts             # Barrel exports
│
├── _lib/                     # Utilities & Types (Private)
│   ├── types.ts             # TypeScript interfaces
│   ├── constants.ts         # Constants & configurations
│   ├── validation.ts        # Form validation functions
│   ├── utils.ts             # Utility functions
│   └── index.ts             # Barrel exports
│
├── page.tsx                 # Main page component
└── README.md                # Documentation (this file)
```

## ฟีเจอร์หลัก

### 1. ดูรายละเอียดยิม
- แสดงข้อมูลยิมแบบเต็มรูปแบบ
- Image gallery สำหรับรูปภาพยิม
- แสดงสถานะปัจจุบัน (pending, approved, rejected)

### 2. อนุมัติ/ปฏิเสธยิม
- อนุมัติยิมที่มีสถานะ pending
- ปฏิเสธยิมพร้อมลบออกจากระบบ
- อัพเดท user role อัตโนมัติ

### 3. แก้ไขข้อมูลยิม
- แก้ไขข้อมูลยิมทุก field
- Form validation แบบ real-time
- แสดงข้อความ error ใต้ field

### 4. ลบยิม
- ลบยิมออกจากระบบ
- Confirmation dialog ก่อนลบ
- ไม่สามารถย้อนกลับได้

### 5. ค้นหาและกรอง
- ค้นหายิมจาก: ชื่อยิม, ผู้ติดต่อ, เบอร์โทร, ที่อยู่
- กรองตามสถานะ: ทั้งหมด, อนุมัติแล้ว, รออนุมัติ, ไม่อนุมัติ
- Real-time filtering

### 6. สถิติยิม
- แสดงจำนวนยิมทั้งหมด
- แสดงจำนวนยิมแต่ละสถานะ
- Live update เมื่อข้อมูลเปลี่ยน

## การใช้งาน

### Import Components

```tsx
import {
  GymStatsCards,
  GymDetailModal,
  GymEditModal,
  GymDeleteDialog,
} from './_components';
```

### Import Hook

```tsx
import { useGymManagement } from './_hooks';

function MyComponent() {
  const {
    gyms,
    filteredGyms,
    selectedGym,
    isLoading,
    handleApprove,
    handleReject,
    handleEdit,
    handleDelete,
  } = useGymManagement();
  
  // Use the hook...
}
```

### Import Types & Utils

```tsx
import {
  type GymDetailModalProps,
  type GymFormData,
  STATUS_CONFIG,
  validateField,
  formatDate,
} from './_lib';
```

## API Endpoints

### GET /api/gyms
ดึงรายการยิมทั้งหมด (Admin only)

### GET /api/gyms/[id]
ดึงข้อมูลยิมเดี่ยว (Admin only)

### PATCH /api/gyms/[id]
แก้ไขข้อมูลยิม (Admin only)

### DELETE /api/gyms/[id]
ลบยิม (Admin only)

### PATCH /api/partner-applications/[id]
อนุมัติ/ปฏิเสธยิม (Admin only)

## Validation Rules

### ชื่อยิม (gym_name)
- ความยาว: 3-100 ตัวอักษร
- Required

### ชื่อผู้ติดต่อ (contact_name)
- ความยาว: 2-100 ตัวอักษร
- Required

### เบอร์โทรศัพท์ (phone)
- รูปแบบ: 0X-XXXX-XXXX หรือ 0XXXXXXXXX
- Required

### อีเมล (email)
- รูปแบบอีเมลที่ถูกต้อง
- Required

### เว็บไซต์ (website)
- รูปแบบ URL ที่ถูกต้อง
- Optional

### ที่อยู่ (location)
- ความยาวอย่างน้อย 10 ตัวอักษร
- Required

## Toast Notifications

ระบบใช้ `react-hot-toast` สำหรับแสดงข้อความแจ้งเตือน:

- ✅ **Success**: อนุมัติ, แก้ไข, ลบสำเร็จ
- ❌ **Error**: เกิดข้อผิดพลาด

## Testing

E2E tests อยู่ที่: `tests/e2e/admin-gym-management.spec.ts`

```bash
# Run E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui
```

## Best Practices

1. **ใช้ Custom Hook** - `useGymManagement` สำหรับ state management
2. **Validate ทั้ง Client & Server** - ป้องกัน invalid data
3. **แสดง Loading States** - UX ที่ดีขึ้น
4. **Error Handling** - จัดการ error ทุกกรณี
5. **Toast Notifications** - แจ้งเตือนผู้ใช้ทุก action

## Dependencies

- `@heroui/react` - UI components
- `@heroicons/react` - Icons
- `react-hot-toast` - Toast notifications
- `@supabase/supabase-js` - Database client

## Notes

- โฟลเดอร์ที่ขึ้นต้นด้วย `_` เป็น private (Next.js convention)
- ใช้ barrel exports (`index.ts`) สำหรับ clean imports
- Types และ validation แยกออกมาเพื่อ reusability
- Custom hook แยก business logic ออกจาก UI
