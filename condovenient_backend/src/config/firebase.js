const admin = require('firebase-admin');
const serviceAccount = require('./firebase-key.json'); // เรียกไฟล์กุญแจที่เพิ่งวาง

// ตรวจสอบว่ายังไม่ได้ initializeApp ซ้ำ
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

// เรียกใช้งาน Firestore
const db = admin.firestore();

// Export ทั้ง admin (เผื่อใช้ Auth) และ db (สำหรับ Database)
module.exports = { admin, db };