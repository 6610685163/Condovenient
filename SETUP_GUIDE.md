# 🏢 Condovenient - Comprehensive Condo Management System

ระบบจัดการคอนโดมิเนียมแบบครบวงจร พร้อมใช้งานทั้ง Mobile App, Web Admin, และ Backend API

## 📋 ระบบและฟังก์ชันต่างๆ

### 1. **ระบบยืนยันตัวตน (Authentication & Login)** 
- Login ด้วย Username/Password
- Login ด้วย Google
- Login ด้วย Facebook
- ลงทะเบียนผู้ใช้งานใหม่
- บันทึก Login History

### 2. **ระบบชำระค่าส่วนกลาง (Payment & Billing)**
- สร้าง Invoice ให้ลูกบ้าน
- ดึงรายการ Invoice ของลูกบ้าน
- บันทึกการชำระเงิน
- ตรวจสอบกับ Bank API
- สร้าง Receipt อัตโนมัติ
- ดึงประวัติการชำระเงิน

### 3. **ระบบแจ้งเตือน (Notification Service)** 
- ส่งการแจ้งเตือนไปยังลูกบ้าน
- ดึงรายการแจ้งเตือนของผู้ใช้
- มาร์ก Notification ว่าอ่านแล้ว
- แจ้งเตือนอัตโนมัติเมื่อมีพัสดุ
- แจ้งเตือนอัตโนมัติเมื่อมีการซ่อม

### 4. **ระบบจัดการพัสดุ (Parcel System)** 
- ลงทะเบียนพัสดุเข้าตู้ Smart Locker
- ดึงสถานะตู้เก็บพัสดุ
- สร้าง QR Code สำหรับเปิดตู้
- บันทึกการรับพัสดุ

### 5. **ระบบแจ้งซ่อม (Repair System)** 
- สร้างใบแจ้งซ่อมจากลูกบ้าน
- มอบหมายงานซ่อมให้ช่าง
- ปิดงานซ่อมหลังจากเสร็จ
- ดึงรายการแจ้งซ่อมทั้งหมด

### 6. **ระบบผู้มาติดต่อ (Visitor System)**
- ลงทะเบียนผู้มาติดต่อเข้า
- ลงทะเบียนผู้มาติดต่อออก
- ดึงรายชื่อผู้มาติดต่อที่อยู่ในโครงการ
- บันทึกประวัติการเข้า-ออก

### 7. **ระบบบันทึกประวัติเข้า (Access Log)** 
- บันทึกเวลาเข้าของรถ
- บันทึกเวลาออกของรถ
- ดึงประวัติการเข้า-ออก

### 8. **ระบบจัดการลูกบ้าน (Resident Management)** 
- ดึงรายชื่อลูกบ้านทั้งหมด
- เพิ่มผู้ใช้งานใหม่
- ลบผู้ใช้งาน

---

## 🚀 การติดตั้งและเรียกใช้ระบบ

### Backend (Node.js + Express + Firebase)

```bash
# 1. เปลี่ยนไปที่โฟลเดอร์ Backend
cd condovenient_backend

# 2. ติดตั้ง Dependencies
npm install

# 3. สร้างไฟล์ .env จากตัวอย่าง
cp .env.example .env

# 4. แก้ไขไฟล์ .env ใส่ Firebase Keys
# - FIREBASE_PROJECT_ID
# - FIREBASE_PRIVATE_KEY
# - FIREBASE_CLIENT_EMAIL

# 5. วาง firebase-key.json ในโฟลเดอร์ src/config/

# 6. รันเซิร์ฟเวอร์
npm start           # Production
npm run dev         # Development (ใช้ nodemon)
```

### Web Admin (React + Vite)

```bash
# 1. เปลี่ยนไปที่โฟลเดอร์ Web
cd web_side

# 2. ติดตั้ง Dependencies
npm install

# 3. รันพัฒนาเซิร์ฟเวอร์
npm run dev

# 4. สร้าง Build สำหรับ Production
npm run build
```

### Flutter App (Mobile)

```bash
# 1. เปลี่ยนไปที่โฟลเดอร์ Project
cd condovenient_project

# 2. ติดตั้ง Dependencies
flutter pub get

# 3. รันแอป
flutter run

# 4. สร้าง APK สำหรับ Android
flutter build apk

# 5. สร้าง IPA สำหรับ iOS
flutter build ios
```

---

## 📡 API Endpoints

### Authentication
```
POST   /api/auth/login              - Login ด้วย Username/Password
POST   /api/auth/register           - ลงทะเบียนผู้ใช้ใหม่
POST   /api/auth/google-login       - Login ด้วย Google
POST   /api/auth/facebook-login     - Login ด้วย Facebook
GET    /api/auth/users              - ดึงรายชื่อผู้ใช้ทั้งหมด
DELETE /api/auth/users/:id          - ลบผู้ใช้
```

### Notifications
```
POST   /api/auth/notifications              - ส่งการแจ้งเตือน
GET    /api/auth/notifications/:userId      - ดึงการแจ้งเตือน
PATCH  /api/auth/notifications/:notificationId/read - มาร์กว่าอ่านแล้ว
```

### Payments
```
POST   /api/payment/pay-common-fee           - ชำระค่าส่วนกลาง
POST   /api/payment/invoices                 - สร้าง Invoice
GET    /api/payment/invoices/:userId         - ดึง Invoice
POST   /api/payment/verify/:paymentId        - ตรวจสอบกับ Bank
GET    /api/payment/receipts/:receiptId      - ดึง Receipt
GET    /api/payment/payment-history/:roomId  - ดึงประวัติการชำระ
```

### Repairs
```
POST   /api/repair/create           - สร้างใบแจ้งซ่อม
GET    /api/repair/list             - ดึงรายการแจ้งซ่อมทั้งหมด
GET    /api/repair/list/:userId     - ดึงแจ้งซ่อมของผู้ใช้
PATCH  /api/repair/assign/:ticketId - มอบหมายช่าง
PATCH  /api/repair/close/:ticketId  - ปิดงานซ่อม
```

### Parcels
```
GET    /api/parcel/status           - ดึงสถานะตู้พัสดุ
POST   /api/parcel/register         - ลงทะเบียนพัสดุ
POST   /api/parcel/generate-qr      - สร้าง QR Code
```

### Visitors
```
POST   /api/visitors/check-in       - ลงทะเบียนเข้า
PUT    /api/visitors/check-out/:id  - ลงทะเบียนออก
GET    /api/visitors/active         - ดึงผู้มาติดต่อที่อยู่ในโครงการ
```

### Access Logs
```
POST   /api/access-log/log-entry    - บันทึกการเข้า
POST   /api/access-log/log-exit     - บันทึกการออก
GET    /api/access-log/history      - ดึงประวัติการเข้า-ออก
```

---

## 🔑 Database Schema (Firebase Firestore)

### Collections

1. **users** - ข้อมูลผู้ใช้
2. **invoices** - ใบแจ้งหนี้
3. **commonFees** - การชำระค่าส่วนกลาง
4. **receipts** - ใบเสร็จ
5. **repairTickets** - ใบแจ้งซ่อม
6. **parcels** - พัสดุ
7. **visitors** - ผู้มาติดต่อ
8. **access_logs** - บันทึกการเข้า-ออก
9. **notifications** - การแจ้งเตือน
10. **loginLogs** - บันทึก Login

---

## 📱 ฟีเจอร์ต่างๆ

### Mobile App (Flutter)
- ✅ Login & Register
- ✅ ชำระค่าส่วนกลาง
- ✅ แจ้งซ่อม
- ✅ รับพัสดุจาก Locker (QR Code)
- ✅ ลงทะเบียนผู้มาติดต่อ

### Web Admin (React)
- ✅ Dashboard ภาพรวม
- ✅ จัดการลูกบ้าน
- ✅ จัดการ Invoice
- ✅ จัดการใบแจ้งซ่อม
- ✅ จัดการพัสดุ
- ✅ จัดการผู้มาติดต่อ
- ✅ ส่งการแจ้งเตือน

### Backend
- ✅ REST API แบบครบวงจร
- ✅ Firebase Firestore Integration
- ✅ Bank Payment Verification
- ✅ QR Code Generation
- ✅ Real-time Notifications

---

## 🛠️ สต็ก Technology

| Layer | Technologies |
|-------|--------------|
| **Frontend Web** | React, Vite, Tailwind CSS, Lucide Icons |
| **Frontend Mobile** | Flutter, Dart |
| **Backend** | Node.js, Express.js |
| **Database** | Firebase Firestore |
| **Authentication** | Firebase Auth, Google Sign-In, Facebook Auth |
| **Payment** | Bank API Integration |
| **QR Code** | QRServer API |

---

## 🔒 ความปลอดภัย

- ✅ JWT Token Authentication
- ✅ Firebase Authentication
- ✅ Social Media OAuth
- ✅ Password Validation
- ✅ CORS Configuration
- ✅ Server-side Validation

---

## 📊 การทดสอบ API

### ใช้ Postman หรือ cURL

**ตัวอย่าง Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"A-101","password":"password123"}'
```

**ตัวอย่าง Create Repair Ticket:**
```bash
curl -X POST http://localhost:3000/api/repair/create \
  -H "Content-Type: application/json" \
  -d '{
    "userId":"user123",
    "roomNumber":"A-101",
    "title":"ไฟห้องนอนเสีย",
    "description":"ไฟห้องนอนเสีย ต้องเปลี่ยนหลอด",
    "category":"ไฟฟ้า / แสงสว่าง",
    "priority":"normal"
  }'
```

---

## 📝 หมายเหตุและข้อควรรู้

1. **Firebase Setup**: ต้องสร้าง Firebase Project และดาวน์โหลด `firebase-key.json`
2. **Environment Variables**: ต้องตั้งค่าตัวแปรสภาพแวดล้อม ใน `.env`
3. **CORS**: ต้องตั้งค่า CORS ให้ถูกต้องสำหรับ Development
4. **Mobile URL**: Android ใช้ `10.0.2.2:3000` แทน `localhost:3000`
5. **Bank API**: ในตัวอย่างเป็น Mock API เท่านั้น ต้องแทนด้วย Real Bank API

---

## 🐛 Troubleshooting

### Backend ไม่เชื่อมต่อ Firebase
- ✓ ตรวจสอบ `firebase-key.json` อยู่ในโฟลเดอร์ `src/config/`
- ✓ ตรวจสอบ Environment Variables ในไฟล์ `.env`

### Mobile App ไม่สามารถเชื่อมต่อ Backend
- ✓ ใช้ `http://10.0.2.2:3000` แทน `localhost:3000`
- ✓ ตรวจสอบ Backend กำลังทำงานอยู่

### Web Admin ไม่สามารถเรียก API
- ✓ ตรวจสอบ CORS ถูก configure
- ✓ ตรวจสอบ Backend Port คือ 3000

---

## 📞 สนับสนุนและติดต่อ

สำหรับข้อมูลเพิ่มเติม โปรดติดต่อทีมพัฒนา

---

**ขอบคุณที่ใช้งาน Condovenient! 🙏**
