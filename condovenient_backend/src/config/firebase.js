const admin = require('firebase-admin');
const serviceAccount = require('./firebase-key.json'); // เรียกไฟล์กุญแจที่เพิ่งวาง

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;