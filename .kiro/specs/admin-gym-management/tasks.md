# Implementation Plan

- [x] 1. สร้าง API endpoint สำหรับจัดการยิมเดี่ยว
  - สร้างไฟล์ `/api/gyms/[id]/route.ts` พร้อม GET, PATCH, DELETE methods
  - Implement authentication และ admin role check
  - เพิ่ม validation สำหรับ PATCH request (gym_name, contact_name, phone, email, location)
  - อัพเดท `updated_at` timestamp เมื่อแก้ไขข้อมูล
  - Return proper error responses (400, 401, 403, 404, 500)
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 2. สร้าง GymStatsCards component
  - สร้างไฟล์ `src/app/admin/dashboard/gyms/components/GymStatsCards.tsx`
  - รับ props `gyms: Gym[]` และคำนวณจำนวนแต่ละสถานะ
  - แสดง 4 การ์ด: ทั้งหมด (default), อนุมัติแล้ว (success), รออนุมัติ (warning), ไม่อนุมัติ (danger)
  - ใช้ HeroUI Card component พร้อม responsive grid layout
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 3. สร้าง GymDetailModal component
  - สร้างไฟล์ `src/app/admin/dashboard/gyms/components/GymDetailModal.tsx`
  - รับ props: isOpen, onClose, gym, onApprove, onReject, onEdit, onDelete, isProcessing
  - แสดงข้อมูลยิมทั้งหมด: ชื่อ, ผู้ติดต่อ, เบอร์, อีเมล, ที่อยู่, เว็บไซต์, รายละเอียด, บริการ
  - สร้าง image gallery ด้วย Next.js Image component แสดงรูปภาพยิมทั้งหมด
  - แสดงสถานะปัจจุบันด้วย Chip component (warning=pending, success=approved, danger=rejected)
  - เพิ่มปุ่ม "อนุมัติ" และ "ปฏิเสธ" สำหรับยิม pending พร้อม loading state
  - เพิ่มปุ่ม "แก้ไข" และ "ลบ" สำหรับยิมทุกสถานะ
  - แสดง metadata (วันที่สร้าง, วันที่อัพเดท) ในรูปแบบ Thai locale
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 4. สร้าง GymDeleteDialog component
  - สร้างไฟล์ `src/app/admin/dashboard/gyms/components/GymDeleteDialog.tsx`
  - รับ props: isOpen, onClose, gym, onConfirm, isProcessing
  - แสดงชื่อยิมที่จะลบและคำเตือนว่าไม่สามารถย้อนกลับได้
  - เพิ่มปุ่ม "ยกเลิก" (default) และ "ยืนยันการลบ" (danger) พร้อม loading state
  - ใช้ HeroUI Modal component ขนาดเล็ก
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 5. สร้าง GymEditModal component
  - สร้างไฟล์ `src/app/admin/dashboard/gyms/components/GymEditModal.tsx`
  - รับ props: isOpen, onClose, gym, onSave, isProcessing
  - สร้างฟอร์มแก้ไขพร้อม pre-fill ข้อมูลปัจจุบัน
  - เพิ่ม form fields: gym_name, contact_name, phone, email, website, location, gym_details, services, status
  - Implement client-side validation: gym_name (3-100 chars), contact_name (2-100 chars), phone (Thai format), email (valid format), website (valid URL), location (min 10 chars)
  - แสดงข้อความ error ใต้ field ที่ผิด
  - Disable ปุ่ม "บันทึก" ถ้าข้อมูลไม่ถูกต้อง
  - เพิ่ม loading state ขณะบันทึก
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [x] 6. อัพเดทหน้า Admin Gyms Page
  - แก้ไขไฟล์ `src/app/admin/dashboard/gyms/page.tsx`
  - เพิ่ม state management: selectedGym, searchQuery, modal states (detailModal, editModal, deleteDialog)
  - Implement loadGyms function เพื่อดึงข้อมูลจาก Supabase
  - Implement filterGyms function สำหรับกรองตาม status tab และ search query
  - เพิ่ม debounce สำหรับ search input (300ms)
  - Implement handleApprove function เรียก PATCH /api/partner-applications/[id] พร้อม status: 'approved'
  - Implement handleReject function เรียก PATCH /api/partner-applications/[id] พร้อม status: 'denied'
  - Implement handleEdit function เรียก PATCH /api/gyms/[id] พร้อมข้อมูลที่แก้ไข
  - Implement handleDelete function เรียก DELETE /api/gyms/[id]
  - เพิ่ม error handling และแสดง toast notifications สำหรับทุก actions
  - Integrate GymStatsCards component แทนการ์ดสถิติเดิม
  - Integrate GymDetailModal, GymEditModal, GymDeleteDialog components
  - อัพเดทปุ่มในตาราง: "ดูรายละเอียด" เปิด DetailModal, "แก้ไข" เปิด EditModal, "ลบ" เปิด DeleteDialog
  - เพิ่ม loading states (skeleton/spinner) ขณะโหลดข้อมูล
  - Refresh ข้อมูลอัตโนมัติหลังดำเนินการสำเร็จ
  - _Requirements: 1.1, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 3.1, 3.4, 3.5, 4.3, 4.4, 5.1, 5.2, 5.3, 5.4, 5.5, 6.3_

- [x] 7. เพิ่ม toast notification system
  - ติดตั้ง toast library (เช่น react-hot-toast หรือใช้ HeroUI notification)
  - สร้าง utility functions: showSuccessToast, showErrorToast
  - Integrate toast notifications ในทุก actions: approve, reject, edit, delete
  - แสดง success message: "อนุมัติยิมสำเร็จ", "แก้ไขข้อมูลสำเร็จ", "ลบยิมสำเร็จ"
  - แสดง error message: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง"
  - _Requirements: 2.4, 2.5, 3.5, 4.4, 4.5_

- [x] 8. เพิ่ม E2E tests สำหรับ Admin Gym Management
  - สร้างไฟล์ `tests/e2e/admin-gym-management.spec.ts`
  - Test: Admin login และเข้าหน้าจัดการยิม
  - Test: ดูรายละเอียดยิมใน DetailModal
  - Test: อนุมัติยิม pending และตรวจสอบสถานะเปลี่ยน
  - Test: แก้ไขข้อมูลยิมและตรวจสอบข้อมูลอัพเดท
  - Test: ลบยิมและตรวจสอบยิมหายจากรายการ
  - Test: ค้นหายิมด้วย search input
  - Test: กรองยิมด้วย status tabs
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1, 5.2, 5.3_
