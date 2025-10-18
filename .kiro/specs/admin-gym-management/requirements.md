# Requirements Document

## Introduction

ระบบจัดการยิมสำหรับผู้ดูแลระบบ (Admin Gym Management System) เป็นฟีเจอร์ที่ช่วยให้ผู้ดูแลระบบสามารถจัดการค่ายมวยไทยที่สมัครเข้ามาในระบบได้อย่างมีประสิทธิภาพ โดยสามารถดูรายละเอียด อนุมัติ ปฏิเสธ แก้ไข และลบข้อมูลยิมได้จากหน้าเดียว

## Glossary

- **Admin System**: ระบบผู้ดูแลที่ใช้จัดการข้อมูลยิมทั้งหมด
- **Gym Management Page**: หน้าจัดการยิมที่แสดงรายการยิมทั้งหมดจาก table gyms
- **Gym Record**: ข้อมูลค่ายมวยที่เก็บใน table gyms ของ Supabase
- **Status Update System**: ระบบอัพเดทสถานะยิม (pending, approved, rejected)
- **Detail Modal**: หน้าต่างแสดงรายละเอียดยิมแบบเต็ม
- **Edit Modal**: หน้าต่างสำหรับแก้ไขข้อมูลยิม
- **Delete Confirmation**: หน้าต่างยืนยันการลบยิม

## Requirements

### Requirement 1: ดูรายละเอียดยิมแบบละเอียด

**User Story:** ในฐานะผู้ดูแลระบบ ฉันต้องการดูรายละเอียดยิมแบบเต็มรูปแบบ เพื่อที่จะตรวจสอบข้อมูลก่อนตัดสินใจอนุมัติหรือปฏิเสธ

#### Acceptance Criteria

1. WHEN ผู้ดูแลคลิกปุ่ม "ดูรายละเอียด" บนแถวยิม, THE Gym Management Page SHALL แสดง Detail Modal พร้อมข้อมูลยิมทั้งหมด
2. THE Detail Modal SHALL แสดงข้อมูล: ชื่อยิม, ผู้ติดต่อ, เบอร์โทร, อีเมล, ที่อยู่, เว็บไซต์, รายละเอียดยิม, บริการที่มี, รูปภาพยิม, สถานะปัจจุบัน, วันที่สร้าง, วันที่อัพเดท
3. THE Detail Modal SHALL แสดงรูปภาพยิมทั้งหมดในรูปแบบ gallery ที่สามารถดูขยายได้
4. THE Detail Modal SHALL มีปุ่ม "อนุมัติ" และ "ปฏิเสธ" สำหรับยิมที่มีสถานะ pending
5. THE Detail Modal SHALL มีปุ่ม "แก้ไข" และ "ลบ" สำหรับยิมทุกสถานะ

### Requirement 2: อนุมัติและปฏิเสธยิม

**User Story:** ในฐานะผู้ดูแลระบบ ฉันต้องการอนุมัติหรือปฏิเสธยิมได้จากหน้าจัดการยิม เพื่อควบคุมว่ายิมไหนจะแสดงในระบบ

#### Acceptance Criteria

1. WHEN ผู้ดูแลคลิกปุ่ม "อนุมัติ" บนยิมที่มีสถานะ pending, THE Status Update System SHALL อัพเดทสถานะเป็น approved
2. WHEN ผู้ดูแลคลิกปุ่ม "ปฏิเสธ" บนยิมที่มีสถานะ pending, THE Status Update System SHALL อัพเดทสถานะเป็น rejected
3. WHEN สถานะถูกอัพเดทสำเร็จ, THE Gym Management Page SHALL รีเฟรชข้อมูลและแสดงสถานะใหม่
4. WHEN สถานะถูกอัพเดทสำเร็จ, THE Admin System SHALL แสดงข้อความแจ้งเตือนความสำเร็จ
5. IF การอัพเดทสถานะล้มเหลว, THEN THE Admin System SHALL แสดงข้อความแจ้งเตือนข้อผิดพลาด
6. THE Status Update System SHALL บันทึกวันที่อัพเดทใน field updated_at

### Requirement 3: แก้ไขข้อมูลยิม

**User Story:** ในฐานะผู้ดูแลระบบ ฉันต้องการแก้ไขข้อมูลยิมได้ เพื่อปรับปรุงข้อมูลที่ไม่ถูกต้องหรือเพิ่มเติมข้อมูล

#### Acceptance Criteria

1. WHEN ผู้ดูแลคลิกปุ่ม "แก้ไข" บนยิม, THE Gym Management Page SHALL แสดง Edit Modal พร้อมฟอร์มแก้ไข
2. THE Edit Modal SHALL แสดงฟอร์มที่มีข้อมูลปัจจุบันของยิมทุก field
3. THE Edit Modal SHALL อนุญาตให้แก้ไข: ชื่อยิม, ผู้ติดต่อ, เบอร์โทร, อีเมล, ที่อยู่, เว็บไซต์, รายละเอียดยิม, บริการ, สถานะ
4. WHEN ผู้ดูแลกดปุ่ม "บันทึก", THE Admin System SHALL ตรวจสอบความถูกต้องของข้อมูล
5. WHEN ข้อมูลถูกต้อง, THE Admin System SHALL อัพเดทข้อมูลใน table gyms และรีเฟรชหน้า
6. IF ข้อมูลไม่ถูกต้อง, THEN THE Edit Modal SHALL แสดงข้อความแจ้งเตือนข้อผิดพลาดใต้ field ที่ผิด

### Requirement 4: ลบยิม

**User Story:** ในฐานะผู้ดูแลระบบ ฉันต้องการลบยิมที่ไม่เหมาะสมหรือซ้ำซ้อนออกจากระบบ เพื่อรักษาความสะอาดของฐานข้อมูล

#### Acceptance Criteria

1. WHEN ผู้ดูแลคลิกปุ่ม "ลบ" บนยิม, THE Gym Management Page SHALL แสดง Delete Confirmation พร้อมชื่อยิม
2. THE Delete Confirmation SHALL แสดงคำเตือนว่าการลบไม่สามารถย้อนกลับได้
3. WHEN ผู้ดูแลยืนยันการลบ, THE Admin System SHALL ลบ Gym Record จาก table gyms
4. WHEN การลบสำเร็จ, THE Gym Management Page SHALL รีเฟรชข้อมูลและแสดงข้อความแจ้งเตือนความสำเร็จ
5. IF การลบล้มเหลว, THEN THE Admin System SHALL แสดงข้อความแจ้งเตือนข้อผิดพลาด

### Requirement 5: กรองและค้นหายิม

**User Story:** ในฐานะผู้ดูแลระบบ ฉันต้องการกรองและค้นหายิมได้ เพื่อหายิมที่ต้องการจัดการได้รวดเร็ว

#### Acceptance Criteria

1. THE Gym Management Page SHALL มี tabs สำหรับกรองยิมตามสถานะ: ทั้งหมด, อนุมัติแล้ว, รออนุมัติ, ไม่อนุมัติ
2. WHEN ผู้ดูแลคลิก tab, THE Gym Management Page SHALL แสดงเฉพาะยิมที่มีสถานะตรงกับ tab ที่เลือก
3. THE Gym Management Page SHALL มีช่องค้นหาที่สามารถค้นหาจาก: ชื่อยิม, ผู้ติดต่อ, เบอร์โทร, ที่อยู่
4. WHEN ผู้ดูแลพิมพ์ในช่องค้นหา, THE Gym Management Page SHALL กรองรายการยิมแบบ real-time
5. THE Gym Management Page SHALL แสดงจำนวนยิมที่กรองได้

### Requirement 6: แสดงสถิติยิม

**User Story:** ในฐานะผู้ดูแลระบบ ฉันต้องการเห็นสถิติยิมแบบภาพรวม เพื่อติดตามสถานะของยิมในระบบ

#### Acceptance Criteria

1. THE Gym Management Page SHALL แสดงการ์ดสถิติ 4 ใบ: ยิมทั้งหมด, อนุมัติแล้ว, รออนุมัติ, ไม่อนุมัติ
2. THE Admin System SHALL นับจำนวนยิมจาก table gyms แบบ real-time
3. WHEN ข้อมูลยิมมีการเปลี่ยนแปลง, THE Gym Management Page SHALL อัพเดทสถิติอัตโนมัติ
4. THE Gym Management Page SHALL แสดงจำนวนยิมในแต่ละสถานะด้วยตัวเลขขนาดใหญ่และสีที่แตกต่างกัน
