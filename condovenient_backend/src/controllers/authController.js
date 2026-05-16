const { db, admin } = require('../config/firebase');

exports.login = async (req, res) => {
    // 1. รับค่าที่ส่งมาจากหน้าบ้าน
    const { username, password } = req.body;

    try {
        // 2. ค้นหา User ใน Firestore Database โดยใช้ where()
        const usersRef = db.collection('users');
        const snapshot = await usersRef.where('username', '==', username).get();

        // 3. ถ้าไม่เจอ User (snapshot จะว่างเปล่า)
        if (snapshot.empty) {
            return res.status(401).json({ success: false, message: 'ไม่พบผู้ใช้งานนี้' });
        }

        // ดึงข้อมูล Document ออกมา (สมมติว่า username ไม่ซ้ำ จะเจอแค่ 1 รายการ)
        const userDoc = snapshot.docs[0];
        const user = userDoc.data();
        const userId = userDoc.id; // ใน Firestore ID ของเอกสารจะอยู่ที่ .id

        // 4. เช็ค Password (แบบง่าย)
        if (password !== user.password) {
            return res.status(401).json({ success: false, message: 'รหัสผ่านไม่ถูกต้อง' });
        }

        // 5. บันทึก Log การ Login สำเร็จ
        await db.collection('loginLogs').add({
            userId: userId,
            username: username,
            loginAt: admin.firestore.FieldValue.serverTimestamp(),
            method: 'password'
        });

        // 6. Login สำเร็จ ส่งข้อมูลกลับไปให้หน้าบ้าน
        res.json({
            success: true,
            message: 'Login สำเร็จ',
            user: {
                id: userId,
                name: user.name,
                role: user.role, // หน้าบ้านต้องใช้ค่านี้เพื่อเปลี่ยนหน้าจอ
                roomNumber: user.roomNumber || ''
            }
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.register = async (req, res) => {
    // 1. รับค่าจากหน้าบ้าน
    const { username, password, name, role } = req.body;

    try {
        // 2. เช็คก่อนว่า Username นี้มีคนใช้ไปหรือยัง?
        const usersRef = db.collection('users');
        const snapshot = await usersRef.where('username', '==', username).get();
        
        if (!snapshot.empty) {
            return res.status(400).json({ success: false, message: 'Username นี้มีผู้ใช้งานแล้ว' });
        }

        // 3. เพิ่มข้อมูลลง Firestore ด้วยคำสั่ง .add() (ระบบจะสุ่ม ID ให้เอง)
        const newUser = {
            username: username,
            password: password,
            name: name,
            role: role || 'resident', // ถ้าไม่ส่ง role มา ให้ default เป็น resident
            createdAt: admin.firestore.FieldValue.serverTimestamp() // เก็บเวลาสร้างไว้ด้วย
        };

        const docRef = await usersRef.add(newUser);

        // 4. ส่งผลลัพธ์กลับไป
        res.status(201).json({
            success: true,
            message: 'สมัครสมาชิกสำเร็จ!',
            user: {
                id: docRef.id,
                ...newUser
            }
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.googleLogin = async (req, res) => {
    // 1. รับค่า Token ที่ส่งมาจาก Flutter
    const { token } = req.body;

    try {
        // 2. ยืนยัน Token กับ Firebase ว่าถูกต้องไหม
        const decodedToken = await admin.auth().verifyIdToken(token);
        const { email, name, uid } = decodedToken;

        // 3. เช็คว่ามี User นี้ใน Database ของเราหรือยัง?
        const usersRef = db.collection('users');
        const snapshot = await usersRef.where('username', '==', email).get();

        let userData;
        let userId;

        // 4. ถ้ายังไม่มี ให้สมัครสมาชิกให้อัตโนมัติ
        if (snapshot.empty) {
            // สร้าง Password มั่วๆ เพราะ User นี้เข้าผ่าน Google ไม่ต้องใช้ Password
            const randomPassword = Math.random().toString(36).slice(-8); 
            
            const newUser = {
                username: email,
                password: randomPassword,
                name: name || 'Google User',
                role: 'resident',
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            };

            const docRef = await usersRef.add(newUser);
            userData = newUser;
            userId = docRef.id;
        } else {
            // ถ้ามีอยู่แล้วก็ดึงข้อมูลมาใช้ได้เลย
            const userDoc = snapshot.docs[0];
            userData = userDoc.data();
            userId = userDoc.id;
        }

        // 5. บันทึก Log การ Login ด้วย Google
        await db.collection('loginLogs').add({
            userId: userId,
            username: email,
            loginAt: admin.firestore.FieldValue.serverTimestamp(),
            method: 'google'
        });

        // 6. ส่งข้อมูล User กลับไปให้หน้าบ้าน
        res.json({
            success: true,
            message: 'Google Login สำเร็จ',
            user: {
                id: userId,
                name: userData.name,
                role: userData.role
            }
        });

    } catch (err) {
        console.error('Google Login Error:', err.message);
        res.status(401).json({ success: false, message: 'Invalid Token' });
    }
};

exports.facebookLogin = async (req, res) => {
    const { token } = req.body;
    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        const { email, uid, name } = decodedToken;

        // บางครั้ง Facebook ไม่ส่ง Email มา ให้ใช้ UID แทน
        const username = email || uid;

        const usersRef = db.collection('users');
        const snapshot = await usersRef.where('username', '==', username).get();

        let userData;
        let userId;

        if (snapshot.empty) {
            // สมัครสมาชิกใหม่
            const randomPassword = Math.random().toString(36).slice(-8);
            const newUser = {
                username: username,
                password: randomPassword,
                name: name || 'Facebook User',
                role: 'resident',
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            };
            const docRef = await usersRef.add(newUser);
            userData = newUser;
            userId = docRef.id;
        } else {
            const userDoc = snapshot.docs[0];
            userData = userDoc.data();
            userId = userDoc.id;
        }

        // บันทึก Log การ Login ด้วย Facebook
        await db.collection('loginLogs').add({
            userId: userId,
            username: username,
            loginAt: admin.firestore.FieldValue.serverTimestamp(),
            method: 'facebook'
        });

        res.json({
            success: true,
            message: 'Facebook Login สำเร็จ',
            user: { id: userId, name: userData.name, role: userData.role }
        });

    } catch (err) {
        console.error('Facebook Login Error:', err.message);
        res.status(401).json({ success: false, message: 'Invalid Token' });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const snapshot = await db.collection('users').get();
        let users = [];
        
        // วนลูปอ่านข้อมูลทีละ Document แล้วเลือกเฉพาะ field ที่ต้องการ
        snapshot.forEach(doc => {
            const data = doc.data();
            users.push({
                user_id: doc.id, // ใช้ Document ID ไปจำลองเป็น user_id
                username: data.username,
                name: data.name,
                role: data.role
            });
        });

        // ส่งข้อมูลกลับไปเป็น JSON array
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.deleteUser = async (req, res) => {
    // 1. รับค่า id ที่ส่งมาทาง URL
    const { id } = req.params;

    try {
        const userRef = db.collection('users').doc(id);
        const doc = await userRef.get();

        // 3. เช็คว่ามี id นี้อยู่ไหม ก่อนลบ
        if (!doc.exists) {
            return res.status(404).json({ success: false, message: 'ไม่พบผู้ใช้งานนี้ (อาจจะลบไปแล้ว)' });
        }

        const userData = doc.data();
        
        // 2. สั่งลบข้อมูลใน Firestore
        await userRef.delete();

        // 4. แจ้งกลับว่าลบสำเร็จ
        res.json({
            success: true,
            message: `ลบผู้ใช้งาน ${userData.username} เรียบร้อยแล้ว`,
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// --- ฟังก์ชันใหม่: ส่ง Notification ให้ User ---
exports.receiveNotification = async (req, res) => {
    // รับค่า userId และข้อความแจ้งเตือนจาก body
    const { userId, title, message, type } = req.body;

    try {
        // ตรวจสอบว่า userId มีอยู่จริง
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return res.status(404).json({ success: false, message: 'ไม่พบผู้ใช้งานนี้' });
        }

        // บันทึก Notification ลง Firestore ใน collection 'notifications'
        const notification = {
            userId: userId,
            title: title || 'แจ้งเตือนจากระบบ',
            message: message || '',
            type: type || 'general',   // เช่น 'payment', 'repair', 'general'
            isRead: false,              // ยังไม่ได้อ่าน
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };

        const docRef = await db.collection('notifications').add(notification);

        res.status(201).json({
            success: true,
            message: 'ส่งการแจ้งเตือนสำเร็จ',
            notificationId: docRef.id
        });

    } catch (err) {
        console.error('Notification Error:', err.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// --- ฟังก์ชันใหม่: ดึง Notification ของ User ---
exports.getNotifications = async (req, res) => {
    const { userId } = req.params;

    try {
        const snapshot = await db.collection('notifications')
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .get();

        const notifications = [];
        snapshot.forEach(doc => notifications.push({ id: doc.id, ...doc.data() }));

        res.status(200).json({ success: true, notifications });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// --- ฟังก์ชันใหม่: มาร์ค Notification ว่าอ่านแล้ว ---
exports.markNotificationRead = async (req, res) => {
    const { notificationId } = req.params;

    try {
        await db.collection('notifications').doc(notificationId).update({
            isRead: true,
            readAt: admin.firestore.FieldValue.serverTimestamp()
        });

        res.status(200).json({ success: true, message: 'อัปเดตสถานะการอ่านแล้ว' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};