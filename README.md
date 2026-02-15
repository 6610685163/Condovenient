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

### 4. AI Security & Visitor Management

ระบบความปลอดภัยและการจัดการผู้มาติดต่อ

* **Visitor Pre-registration**
  ลูกบ้านสามารถลงทะเบียนแขกและทะเบียนรถล่วงหน้าผ่านแอป

* **AI License Plate Recognition (LPR)**
  กล้อง AI ตรวจจับป้ายทะเบียนและเปิดไม้กั้นอัตโนมัติ

* **AI Intrusion Detection**
  ตรวจจับความเคลื่อนไหวในพื้นที่เสี่ยงและแจ้งเตือน รปภ. แบบทันที

* **Emergency Announcement**
  ผู้จัดการนิติบุคคลสามารถส่งประกาศด่วนผ่าน Notification และ SMS ไปยังลูกบ้านทั้งหมด

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

### AI & Smart Security

| Component        | Technology |
| ---------------- | ---------- |
| Object Detection | YOLOv8     |
| Computer Vision  | OpenCV     |

---

## User Roles & Responsibilities

* **Resident (ลูกบ้าน)**
  ชำระค่าส่วนกลาง, แจ้งซ่อม, ลงทะเบียนแขก, รับพัสดุ

* **Juristic / Manager (นิติบุคคล)**
  จัดการด้านการเงิน, ส่งประกาศ, ดูแลภาพรวมโครงการ

* **Technician (ช่าง)**
  รับงานแจ้งซ่อม, อัปเดตสถานะการทำงาน

* **Security Guard (รปภ.)**
  ตรวจสอบการแจ้งเตือนจาก AI, บันทึก Log การเข้า-ออก

---

## Group Members

| Student ID | Name                    | Role |
| ---------- | ----------------------- | ---- |
| 6610625045 | กันตพงศ์ วิชชุเกรียงไกร      | Frontend Developer |
| 6610685064 | ฉัตรชัย สีคราม             | Backend Developer |
| 6610685130 | ชิติพัทธ์ ตากตำรงค์กุล       | Project Manager & Frontend Developer |
| 6610685163 | ธนบดี สุดแดน             | Backend Developer |
| 6610685361 | เสฎฐพัชร ญาณพัฒน์สร      | Backend Developer |

---

## Presentation

1. [Presentation Slide for Week 1 Concept Paper](https://www.canva.com/design/DAG-FyNWblo/xobZmQE7eSjgWgb1FErsow/view?utm_content=DAG-FyNWblo&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=hba639e7e36)
2. [Presentation Slide for Week 2 Requirments](https://www.canva.com/design/DAG-sJReu-w/c7vReubB-wnkl7ztFojcKg/view?utm_content=DAG-sJReu-w&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=hfebb2a9807)
3. [Presentation Slide for Week 3 Class Diagram & Use Case Diagram](https://www.canva.com/design/DAG_Vas4B1w/AGDJbdiOHehSkkot4NmS4w/view?utm_content=DAG_Vas4B1w&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=h012e3aefa6)
4. [Presentation Slide for Week 4 GUI & CLI](https://www.canva.com/design/DAG_5phXnt4/Bjl36ShquvO2duLYC4grOg/view?utm_content=DAG_5phXnt4&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=h79ed3928ff)
5. [Presentation Slide for Week 5 Mapping & Facade](https://www.canva.com/design/DAHAqaXcgHg/TXma4wYU04RRrjVmf9jwjQ/view?utm_content=DAHAqaXcgHg&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=hb8cfb31952)
6. [Presentation Slide for Week 6 Implement User / Login](https://www.canva.com/design/DAHBZGMB-Dg/04PgYhR3vkNhaxhjUTm5CQ/view?utm_content=DAHBZGMB-Dg&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=hd5be665360)

---

## Presentation History

- February 2, 2026 (Presentation Slide 1 - 5)

> *Condovenient – Smart Management for Smart Communities*
