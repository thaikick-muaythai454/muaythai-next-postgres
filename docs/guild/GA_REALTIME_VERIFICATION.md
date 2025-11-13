# Google Analytics Real-Time Events Verification Guide

## วิธีการตรวจสอบ GA Real-Time Events

### วิธีที่ 1: ใช้ Google Analytics Dashboard (แนะนำ)

#### ขั้นตอนการตรวจสอบ:

1. **เข้าสู่ Google Analytics Dashboard**
   - ไปที่ [Google Analytics](https://analytics.google.com/)
   - เลือก Property ที่ต้องการ
   - ไปที่ **Reports** → **Real-time** (หรือ **Realtime**)

2. **เปิด Real-Time Overview**
   - ใน Real-Time dashboard จะแสดง:
     - **Active users right now** (ผู้ใช้ที่กำลังใช้งานอยู่)
     - **Events by Event name** (events ที่เกิดขึ้น)
     - **Top pages** (หน้าที่ถูกเข้าชม)

3. **ทดสอบ User Signup Event**
   - เปิดแอปใน browser อีก tab/window
   - ทำการ signup ใหม่
   - กลับมาดู Real-Time dashboard
   - ควรเห็น event `sign_up` ในรายการ "Events by Event name"
   - คลิกที่ event `sign_up` เพื่อดูรายละเอียด:
     - `user_id`: ควรแสดง user ID ที่ signup
     - `method`: ควรแสดง 'email' หรือ 'google'

4. **ดู Event Details**
   - คลิกที่ event name ใน Real-Time dashboard
   - จะเห็นรายละเอียด:
     - Event count (จำนวนครั้งที่เกิด event)
     - Event parameters (user_id, method, etc.)
     - Timestamp

#### ข้อควรระวัง:
- Real-Time reports แสดงข้อมูลภายใน 30 นาทีที่ผ่านมา
- อาจมี delay 1-2 วินาที หลังเกิด event
- ต้องปิด Ad Blockers ที่อาจบล็อก GA scripts

---

### วิธีที่ 2: ใช้ Browser DevTools (Network Tab)

#### ขั้นตอนการตรวจสอบ:

1. **เปิด Browser DevTools**
   - กด `F12` หรือ `Cmd+Option+I` (Mac)
   - ไปที่ tab **Network**

2. **Filter Network Requests**
   - ในช่อง Filter พิมพ์: `google-analytics.com` หรือ `collect`
   - จะเห็น requests ไปยัง Google Analytics

3. **ทำการ Signup**
   - เปิดหน้า signup และทำการ signup
   - ดู Network tab จะเห็น request ไปยัง:
     ```
     https://www.google-analytics.com/g/collect?v=2&...
     ```

4. **ตรวจสอบ Request Payload**
   - คลิกที่ request `collect`
   - ไปที่ tab **Payload** หรือ **Query String Parameters**
   - ตรวจสอบ parameters:
     - `en`: ควรเป็น `sign_up`
     - `ep.user_id`: ควรเป็น user ID
     - `ep.method`: ควรเป็น 'email' หรือ 'google'

---

### วิธีที่ 3: ใช้ Browser Console (gtag Debug)

#### ขั้นตอนการตรวจสอบ:

1. **เปิด Browser Console**
   - กด `F12` หรือ `Cmd+Option+J` (Mac)
   - ไปที่ tab **Console**

2. **ตรวจสอบว่า gtag พร้อมใช้งาน**
   ```javascript
   // ตรวจสอบว่า gtag มีอยู่
   console.log(typeof window.gtag); // ควรได้ 'function'
   
   // ตรวจสอบว่า trackUserSignup มีอยู่
   console.log(typeof window.trackUserSignup); // ควรได้ 'function'
   ```

3. **ทดสอบ trackUserSignup โดยตรง**
   ```javascript
   // ทดสอบ signup event
   window.trackUserSignup('test-user-123', 'email');
   
   // ตรวจสอบว่า gtag ถูกเรียก
   // ควรเห็น request ใน Network tab
   ```

4. **ใช้ GA Debug Mode (ถ้ามี)**
   - เพิ่ม `?debug_mode=true` ใน URL
   - หรือใช้ [GA Debugger Chrome Extension](https://chrome.google.com/webstore/detail/google-analytics-debugger/jnkmfdileelhofjcijamephohjechhna)

---

### วิธีที่ 4: ใช้ Google Analytics DebugView

#### ขั้นตอนการตรวจสอบ:

1. **เปิด GA DebugView**
   - ใน Google Analytics Dashboard
   - ไปที่ **Admin** → **DebugView**
   - หรือใช้ URL: `https://analytics.google.com/analytics/web/#/debugview/`

2. **เปิด Debug Mode ใน Browser**
   - ใช้ Chrome Extension: [Google Analytics Debugger](https://chrome.google.com/webstore/detail/google-analytics-debugger/jnkmfdileelhofjcijamephohjechhna)
   - หรือเพิ่ม parameter ใน URL: `?debug_mode=true`

3. **ทำการ Signup**
   - ทำการ signup ใน browser ที่เปิด debug mode
   - กลับมาดู DebugView
   - จะเห็น events แบบ real-time พร้อมรายละเอียดทั้งหมด

---

## Quick Test Script

### ใช้ Browser Console เพื่อทดสอบ:

```javascript
// 1. ตรวจสอบว่า analytics functions พร้อมใช้งาน
console.log('gtag available:', typeof window.gtag === 'function');
console.log('trackUserSignup available:', typeof window.trackUserSignup === 'function');

// 2. ทดสอบ signup event
if (window.trackUserSignup) {
  window.trackUserSignup('test-user-console-' + Date.now(), 'email');
  console.log('✅ trackUserSignup called');
} else {
  console.error('❌ trackUserSignup not available');
}

// 3. ตรวจสอบ Network requests
// เปิด Network tab และ filter ด้วย "google-analytics.com"
// ควรเห็น request ไปยัง /g/collect
```

---

## Checklist สำหรับการตรวจสอบ TC-9.1

### ก่อนเริ่มทดสอบ:
- [ ] ตั้งค่า `NEXT_PUBLIC_GA_MEASUREMENT_ID` ใน `.env.local` หรือ environment variables
- [ ] Restart development server (ถ้าเป็น local)
- [ ] ปิด Ad Blockers
- [ ] เปิด Browser DevTools (Network tab)

### ขั้นตอนการทดสอบ:
1. [ ] เปิด Google Analytics Real-Time dashboard
2. [ ] เปิดแอปใน browser อีก tab
3. [ ] ทำการ signup ใหม่ (email หรือ google)
4. [ ] ตรวจสอบใน Real-Time dashboard:
   - [ ] เห็น event `sign_up` ในรายการ events
   - [ ] Event count เพิ่มขึ้น
5. [ ] คลิกที่ event `sign_up` เพื่อดูรายละเอียด:
   - [ ] เห็น parameter `user_id` (ถูกต้อง)
   - [ ] เห็น parameter `method` ('email' หรือ 'google')
6. [ ] ตรวจสอบใน Network tab:
   - [ ] เห็น request ไปยัง `google-analytics.com/g/collect`
   - [ ] Request payload มี `en=sign_up`
   - [ ] Request payload มี `ep.user_id` และ `ep.method`

### ผลลัพธ์ที่คาดหวัง:
- ✅ Event `sign_up` ปรากฏใน Real-Time dashboard ภายใน 1-2 วินาที
- ✅ Event parameters (`user_id`, `method`) ถูกต้อง
- ✅ Network request ส่งไปยัง Google Analytics สำเร็จ (status 200)

---

## Troubleshooting

### Event ไม่ปรากฏใน Real-Time Dashboard

1. **ตรวจสอบ Environment Variable**
   ```bash
   # ตรวจสอบว่า NEXT_PUBLIC_GA_MEASUREMENT_ID ถูกตั้งค่า
   echo $NEXT_PUBLIC_GA_MEASUREMENT_ID
   ```

2. **ตรวจสอบ Browser Console**
   - เปิด Console และดูว่ามี errors หรือไม่
   - ตรวจสอบว่า gtag function มีอยู่

3. **ตรวจสอบ Network Tab**
   - ดูว่ามี requests ไปยัง google-analytics.com หรือไม่
   - ถ้าไม่มี อาจเป็นเพราะ:
     - Ad Blocker บล็อก GA scripts
     - Environment variable ไม่ถูกตั้งค่า
     - GA script ไม่ได้ load

4. **ตรวจสอบ GA Measurement ID**
   - ต้องเริ่มต้นด้วย `G-`
   - ต้องเป็น Measurement ID ที่ถูกต้องจาก GA dashboard

5. **ตรวจสอบว่าเป็น Client Component**
   - `trackUserSignup` ต้องถูกเรียกจาก client component
   - ตรวจสอบว่า signup page มี `"use client"` directive

### Event ปรากฏแต่ Parameters ไม่ถูกต้อง

1. **ตรวจสอบ Function Call**
   - ดูว่า `trackUserSignup(userId, method)` ถูกเรียกด้วย parameters ที่ถูกต้อง
   - ตรวจสอบใน signup page code

2. **ตรวจสอบ Event Parameters**
   - ดูใน Network tab → Request payload
   - ตรวจสอบว่า `ep.user_id` และ `ep.method` มีค่า

---

## สรุป

**วิธีที่แนะนำสำหรับการตรวจสอบ TC-9.1:**

1. **ใช้ Google Analytics Real-Time Dashboard** (วิธีหลัก)
   - ง่ายที่สุด
   - เห็นผลแบบ real-time
   - มีรายละเอียดครบถ้วน

2. **ใช้ Browser DevTools Network Tab** (วิธีเสริม)
   - ตรวจสอบ technical details
   - ดู request payload
   - ดีสำหรับ debugging

3. **ใช้ Browser Console** (สำหรับ quick test)
   - ทดสอบ function โดยตรง
   - ตรวจสอบว่า functions พร้อมใช้งาน

---

## References

- [Google Analytics Real-Time Reports](https://support.google.com/analytics/answer/1638635)
- [GA4 DebugView](https://support.google.com/analytics/answer/7201382)
- [GA4 Event Parameters](https://developers.google.com/analytics/devguides/collection/ga4/events)

