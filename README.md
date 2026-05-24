# Condovenient (CN332)

> **Estate Management System for Smart Living**
> โปรเจกต์นี้เป็นส่วนหนึ่งของรายวิชา **CN332**

---

## About Condovenient

**Condovenient** คือแพลตฟอร์มบริหารจัดการนิติบุคคลบ้านจัดสรรและคอนโดมิเนียมแบบศูนย์กลาง
พัฒนาขึ้นเพื่อเปลี่ยนกระบวนการทำงานจากระบบเอกสารแบบเดิม ไปสู่ **Digital Transformation** อย่างเต็มรูปแบบ

ระบบช่วยเพิ่มประสิทธิภาพในการ

* จัดการข้อมูลภายในโครงการ
* การสื่อสารระหว่างลูกบ้านและเจ้าหน้าที่
* การเงิน ความปลอดภัย และการให้บริการแบบ **Real-time**

---

## Core Features

### 1. Financial Automation

ระบบการเงินและบัญชีอัตโนมัติ

* **E-Invoice Notification**
  ส่งใบแจ้งหนี้อิเล็กทรอนิกส์ผ่านแอปและอีเมลของลูกบ้านพร้อมกัน

* **QR Code Payment**
  ลูกบ้านสามารถสแกน QR Code เพื่อชำระเงินผ่าน Mobile Banking ได้ทันที

* **Auto-Reconciliation**
  เชื่อมต่อกับ Bank API เพื่อตรวจสอบยอดชำระเงินแบบ Real-time และตัดยอดค้างชำระอัตโนมัติ

* **E-Receipt**
  ระบบออกใบเสร็จอิเล็กทรอนิกส์และส่งกลับไปยังแอปพลิเคชันโดยทันที

---

### 2. Maintenance Management

ระบบแจ้งซ่อมและติดตามสถานะการดำเนินงาน

* **Issue Reporting**
  ลูกบ้านสามารถถ่ายรูป ระบุพิกัด และแจ้งซ่อมผ่านแอปพลิเคชัน

* **Technician Notification**
  ระบบแจ้งเตือนไปยังช่างที่เข้าเวรปฏิบัติงานโดยอัตโนมัติ

* **Job Tracking**
  ลูกบ้านสามารถติดตามสถานะงาน ดูชื่อช่าง และเวลาที่จะเข้าดำเนินการได้

* **Service Rating**
  ลูกบ้านสามารถให้คะแนนและประเมินความพึงพอใจหลังงานเสร็จสิ้น

---

### 3. Contactless Parcel Management

ระบบจัดการพัสดุแบบไร้สัมผัส

* **Parcel Logging**
  เจ้าหน้าที่สแกนบาร์โค้ดพัสดุเพื่อบันทึกข้อมูลเข้าสู่ระบบ

* **Resident Notification**
  แจ้งเตือนลูกบ้านพร้อมรูปพัสดุและ QR Code สำหรับรับของ

* **Smart Pickup**
  รับพัสดุผ่าน QR Code ด้วย Smart Locker หรือเจ้าหน้าที่ ลดความผิดพลาดในการรับของ


---

## Technical Stack

### Software Development

| Layer          | Technology |
| -------------- | ---------- |
| Mobile App     | Flutter    |
| Web Dashboard  | React      |
| Backend        | Node.js    |
| Database       | PostgreSQL |
| Cloud Services | Firebase   |

---

## User Roles & Responsibilities

* **Resident (ลูกบ้าน)**
  ชำระค่าส่วนกลาง, แจ้งซ่อม, ลงทะเบียนแขก, รับพัสดุ

* **Juristic / Manager (นิติบุคคล)**
  จัดการด้านการเงิน, ส่งประกาศ, ดูแลภาพรวมโครงการ

* **Technician (ช่าง)**
  รับงานแจ้งซ่อม, อัปเดตสถานะการทำงาน

---

## 🌐 Live Demo
สามารถเข้าทดลองใช้งานระบบ Web Dashboard ที่ Deploy ไว้ได้ที่:
👉 [ใส่ลิงก์ Live Demo ของคุณที่นี่]

---

## 🔑 Account Access (สำหรับอาจารย์ผู้สอน)
บัญชีจำลองสำหรับเข้าทดสอบระบบตาม Role ต่างๆ (เพื่อความปลอดภัย ข้อมูล Environment Variables `(.env)` ได้แนบส่งแยกในระบบ Assignment แล้ว):

| Role | Username / Email | Password |
| :--- | :--- | :--- |
| **Admin / Juristic** | admin | 123456 |
| **Resident** | 333 | nnnnnn |
| **Technician** | t | tttttt |

---

## 🚀 Local Setup & API Documentation

สำหรับวิธีการติดตั้ง การรันโปรเจกต์บนเครื่อง Local (ทั้งฝั่ง Web, Mobile และ Backend) การตั้งค่า Environment Variables `(.env)` รวมถึงรายละเอียดของ API Endpoints ทั้งหมด สามารถดูคู่มือฉบับเต็มได้ที่ลิงก์ด้านล่างนี้:

👉 **[อ่านคู่มือการติดตั้งและตั้งค่าระบบ (Setup & API Guide)](./SETUP_GUIDE.md)**

---

## Group Members

| Student ID | Name                    | Role |
| ---------- | ----------------------- | ---- |
| 6610625045 | กันตพงศ์ วิชชุเกรียงไกร      | Frontend Developer |
| 6610685064 | ฉัตรชัย สีคราม             | Backend Developer |
| 6610685130 | ชิติพัทธ์ ตากตำรงค์กุล       | Project Manager & Frontend Developer |
| 6610685163 | ธนบดี สุดแดน             | Backend Developer |
| 6610685361 | เสฎฐพัชร ญาณพัฒน์สร      | Backend & Database Engineer |

---

## Presentation

1. [Presentation Slide #1 Concept Paper](https://www.canva.com/design/DAG-FyNWblo/xobZmQE7eSjgWgb1FErsow/view?utm_content=DAG-FyNWblo&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=hba639e7e36)
2. [Presentation Slide #2 Requirments](https://www.canva.com/design/DAG-sJReu-w/c7vReubB-wnkl7ztFojcKg/view?utm_content=DAG-sJReu-w&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=hfebb2a9807)
3. [Presentation Slide #3 Class Diagram & Use Case Diagram](https://www.canva.com/design/DAG_Vas4B1w/AGDJbdiOHehSkkot4NmS4w/view?utm_content=DAG_Vas4B1w&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=h012e3aefa6)
4. [Presentation Slide #4 GUI & CLI](https://www.canva.com/design/DAG_5phXnt4/Bjl36ShquvO2duLYC4grOg/view?utm_content=DAG_5phXnt4&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=h79ed3928ff)
5. [Presentation Slide #5 Mapping & Facade](https://www.canva.com/design/DAHAqaXcgHg/TXma4wYU04RRrjVmf9jwjQ/view?utm_content=DAHAqaXcgHg&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=hb8cfb31952)
6. [Presentation Slide #6 Implement User / Login](https://www.canva.com/design/DAHBZGMB-Dg/04PgYhR3vkNhaxhjUTm5CQ/view?utm_content=DAHBZGMB-Dg&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=hd5be665360)
7. [Presentation Slide #7 Future Plans](https://canva.link/fqr9bm2141u0ui5)
8. [Presentation Slide #8 Final Presentation](https://canva.link/t30dn1q4l9czbvi)

---

## Presentation History

- February 2, 2026 (Presentation Slide 1 - 4)
- April 27, 2026 (Presentation Slide 5 - 7)
- May 18, 2026 (Presentation Slide 8)

> *Condovenient – Smart Management for Smart Communities*
