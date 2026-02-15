const pool = require('../config/db');
const admin = require('../config/firebase');

exports.login = async (req, res) => {
    // 1. รับค่าที่ส่งมาจากหน้าบ้าน
    const { username, password } = req.body;

    try {
        // 2. ค้นหา User ใน Database
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

        // 3. ถ้าไม่เจอ User
        if (result.rows.length === 0) {
            return res.status(401).json({ success: false, message: 'ไม่พบผู้ใช้งานนี้' });
        }

        const user = result.rows[0];

        // 4. เช็ค Password (แบบง่าย)
        if (password !== user.password) {
            return res.status(401).json({ success: false, message: 'รหัสผ่านไม่ถูกต้อง' });
        }

        // 5. Login สำเร็จ ส่งข้อมูลกลับไปให้หน้าบ้าน
        res.json({
            success: true,
            message: 'Login สำเร็จ',
            user: {
                id: user.user_id,
                name: user.name,
                role: user.role // หน้าบ้านต้องใช้ค่านี้เพื่อเปลี่ยนหน้าจอ
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
        const checkUser = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (checkUser.rows.length > 0) {
            return res.status(400).json({ success: false, message: 'Username นี้มีผู้ใช้งานแล้ว' });
        }

        // 3. เพิ่มข้อมูลลง Database
        // (SQL: INSERT คือการเพิ่มแถวใหม่)
        const newUser = await pool.query(
            'INSERT INTO users (username, password, name, role) VALUES ($1, $2, $3, $4) RETURNING *',
            [username, password, name, role || 'resident'] // ถ้าไม่ส่ง role มา ให้ default เป็น resident
        );

        // 4. ส่งผลลัพธ์กลับไป
        res.status(201).json({
            success: true,
            message: 'สมัครสมาชิกสำเร็จ!',
            user: newUser.rows[0]
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

        // 3. เช็คว่ามี User นี้ใน Database ของเราหรือยัง? (ใช้ email เป็น username)
        // หมายเหตุ: คุณอาจต้องปรับ Database ให้ username เก็บ email ได้ หรือเพิ่ม column email
        let userResult = await pool.query('SELECT * FROM users WHERE username = $1', [email]);
        let user = userResult.rows[0];

        // 4. ถ้ายังไม่มี ให้สมัครสมาชิกให้อัตโนมัติ
        if (!user) {
            // สร้าง Password มั่วๆ เพราะ User นี้เข้าผ่าน Google ไม่ต้องใช้ Password
            const randomPassword = Math.random().toString(36).slice(-8); 
            
            const newUser = await pool.query(
                'INSERT INTO users (username, password, name, role) VALUES ($1, $2, $3, $4) RETURNING *',
                [email, randomPassword, name || 'Google User', 'resident']
            );
            user = newUser.rows[0];
        }

        // 5. ส่งข้อมูล User กลับไปให้หน้าบ้าน
        res.json({
            success: true,
            message: 'Google Login สำเร็จ',
            user: {
                id: user.user_id,
                name: user.name,
                role: user.role
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
        // Firebase Admin SDK จะตรวจสอบ Token ไม่ว่าจะมาจาก Google หรือ Facebook
        const decodedToken = await admin.auth().verifyIdToken(token);
        const { email, uid, name } = decodedToken;

        // บางครั้ง Facebook ไม่ส่ง Email มา (ถ้า User ไม่ได้ verify) ให้ใช้ UID แทน
        const username = email || uid;

        let userResult = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        let user = userResult.rows[0];

        if (!user) {
            // สมัครสมาชิกใหม่
            const randomPassword = Math.random().toString(36).slice(-8);
            const newUser = await pool.query(
                'INSERT INTO users (username, password, name, role) VALUES ($1, $2, $3, $4) RETURNING *',
                [username, randomPassword, name || 'Facebook User', 'resident']
            );
            user = newUser.rows[0];
        }

        res.json({
            success: true,
            message: 'Facebook Login สำเร็จ',
            user: { id: user.user_id, name: user.name, role: user.role }
        });

    } catch (err) {
        console.error('Facebook Login Error:', err.message);
        res.status(401).json({ success: false, message: 'Invalid Token' });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        // ดึง id, username, name, role (ไม่เอา password เพราะเป็นความลับ)
        const result = await pool.query('SELECT user_id, username, name, role FROM users ORDER BY user_id ASC');
        
        // ส่งข้อมูลกลับไปเป็น JSON array
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.deleteUser = async (req, res) => {
    // 1. รับค่า id ที่ส่งมาทาง URL (เช่น /users/5 -> id คือ 5)
    const { id } = req.params;

    try {
        // 2. สั่งลบข้อมูลใน Database
        const result = await pool.query('DELETE FROM users WHERE user_id = $1 RETURNING *', [id]);

        // 3. เช็คว่าลบได้จริงไหม (ถ้า rowCount = 0 แปลว่าไม่มี id นี้อยู่แล้ว)
        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'ไม่พบผู้ใช้งานนี้ (อาจจะลบไปแล้ว)' });
        }

        // 4. แจ้งกลับว่าลบสำเร็จ
        res.json({
            success: true,
            message: `ลบผู้ใช้งาน ${result.rows[0].username} เรียบร้อยแล้ว`,
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

