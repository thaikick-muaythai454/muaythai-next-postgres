# Contributing to Muaythai Next.js + Supabase

ขอบคุณที่สนใจมีส่วนร่วมในโปรเจกต์นี้! 🎉

## 🚀 วิธีการมีส่วนร่วม

### 1. Fork และ Clone

```bash
# Fork repository บน GitHub แล้ว clone
git clone https://github.com/YOUR_USERNAME/muaythai-next-postgres.git
cd muaythai-next-postgres
```

### 2. ติดตั้งและตั้งค่า

```bash
# ติดตั้ง dependencies
npm install

# คัดลอก .env.example และกรอกค่า Supabase
cp .env.example .env.local

# รัน development server
npm run dev
```

### 3. สร้าง Branch ใหม่

```bash
# สร้าง branch สำหรับ feature หรือ bugfix ของคุณ
git checkout -b feature/your-feature-name
# หรือ
git checkout -b fix/your-bug-fix
```

### 4. ทำการเปลี่ยนแปลง

- เขียนโค้ดที่ชัดเจนและเข้าใจง่าย
- ใช้ TypeScript และ follow existing code style
- เพิ่ม comments สำหรับส่วนที่ซับซ้อน
- Test ให้แน่ใจว่าโค้ดของคุณทำงานได้ถูกต้อง

### 5. Commit

```bash
# เพิ่มไฟล์ที่เปลี่ยนแปลง
git add .

# Commit พร้อม message ที่ชัดเจน
git commit -m "feat: add new feature"
# หรือ
git commit -m "fix: resolve bug in component"
```

**Commit Message Guidelines:**

- `feat:` สำหรับ feature ใหม่
- `fix:` สำหรับ bug fixes
- `docs:` สำหรับการแก้ไข documentation
- `style:` สำหรับการแก้ไข formatting, styling
- `refactor:` สำหรับการ refactor code
- `test:` สำหรับการเพิ่ม tests
- `chore:` สำหรับงานอื่นๆ เช่น update dependencies

### 6. Push และสร้าง Pull Request

```bash
# Push ไปยัง fork ของคุณ
git push origin feature/your-feature-name
```

จากนั้นไปที่ GitHub และสร้าง Pull Request

## 📋 Code Style Guidelines

### TypeScript

- ใช้ TypeScript strict mode
- หลีกเลี่ยง `any` type ถ้าทำได้
- ตั้งชื่อตัวแปรให้มีความหมายชัดเจน

```typescript
// ❌ ไม่ดี
const d = new Date();
const x: any = getData();

// ✅ ดี
const currentDate = new Date();
const userData: User = getUserData();
```

### React Components

- ใช้ Functional Components กับ Hooks
- แยก logic ออกจาก UI ให้ชัดเจน
- ใช้ `use client` directive เมื่อจำเป็น

```tsx
// ✅ ดี
'use client';

import { useState, useEffect } from 'react';

interface Props {
  userId: string;
}

export default function UserProfile({ userId }: Props) {
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    fetchUser(userId);
  }, [userId]);
  
  return <div>{user?.name}</div>;
}
```

### Styling

- ใช้ Tailwind CSS utility classes
- หลีกเลี่ยง inline styles
- ใช้ dark mode classes เมื่อเหมาะสม

```tsx
// ✅ ดี
<div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
    Title
  </h1>
</div>
```

## 🧪 Testing

ก่อน submit Pull Request:

```bash
# Build โปรเจกต์
npm run build

# ตรวจสอบ TypeScript errors
npm run type-check

# ตรวจสอบ ESLint
npm run lint
```

## 📝 Documentation

หากคุณเพิ่ม feature ใหม่:

1. อัปเดต `README.md`
2. เพิ่ม comments ในโค้ด
3. สร้าง example page หากเหมาะสม
4. เพิ่ม SQL migration ถ้ามีการเปลี่ยนแปลง database schema

## 🐛 Reporting Bugs

หากเจอ bug:

1. ตรวจสอบว่ามี [Issue](https://github.com/YOUR_USERNAME/muaythai-next-postgres/issues) นี้อยู่แล้วหรือไม่
2. หากไม่มี ให้สร้าง Issue ใหม่พร้อมรายละเอียด:
   - **ขั้นตอนการทำซ้ำ** bug
   - **ผลลัพธ์ที่คาดหวัง**
   - **ผลลัพธ์ที่เกิดขึ้นจริง**
   - **สภาพแวดล้อม** (Browser, OS, Node version)
   - **Screenshots** หรือ error messages

## 💡 Feature Requests

หากมีความคิดเห็นสำหรับ feature ใหม่:

1. สร้าง [Issue](https://github.com/YOUR_USERNAME/muaythai-next-postgres/issues) แบบ Feature Request
2. อธิบายว่า feature นี้จะช่วยแก้ปัญหาอะไร
3. ให้ตัวอย่างการใช้งานที่เป็นไปได้

## 📞 Questions?

หากมีคำถาม:

- สร้าง [Discussion](https://github.com/YOUR_USERNAME/muaythai-next-postgres/discussions)
- หรือ comment ใน Issue ที่เกี่ยวข้อง

## ✨ Contributors

ขอบคุณทุกคนที่มีส่วนร่วม! 🙏

---

**หมายเหตุ**: ด้วยการมีส่วนร่วมในโปรเจกต์นี้ คุณยอมรับที่จะปฏิบัติตาม Code of Conduct

