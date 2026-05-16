// src/pages/Register.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'http://localhost:3000';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        password: '',
        confirmPassword: '',
        role: 'resident'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validation
        if (!formData.name || !formData.username || !formData.password) {
            setError('กรุณากรอกข้อมูลให้ครบ');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('รหัสผ่านไม่ตรงกัน');
            return;
        }

        if (formData.password.length < 6) {
            setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(`${API}/api/auth/register`, {
                name: formData.name,
                username: formData.username,
                password: formData.password,
                role: formData.role
            });

            if (response.data.success) {
                setSuccess('สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ');
                setTimeout(() => navigate('/login'), 2000);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-white">
            {/* 1. ส่วนฟอร์ม (ซ้าย) */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="w-full max-w-md space-y-8">

                    <div className="text-left">
                        <h2 className="text-3xl font-bold text-gray-900">สมัครสมาชิก</h2>
                        <p className="text-gray-600 mt-2">สร้างบัญชีใหม่เพื่อใช้งาน Condovenient</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                            {success}
                        </div>
                    )}

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500">ชื่อ-นามสกุล</label>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="กรุณาระบุชื่อ-นามสกุล"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full mt-1 px-4 py-3 bg-gray-100 border-transparent rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">ชื่อผู้ใช้ (Username)</label>
                                <input
                                    type="text"
                                    name="username"
                                    placeholder="เช่น john_doe"
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="w-full mt-1 px-4 py-3 bg-gray-100 border-transparent rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">รหัสผ่าน</label>
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="กรุณาระบุรหัสผ่าน (อย่างน้อย 6 ตัวอักษร)"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full mt-1 px-4 py-3 bg-gray-100 border-transparent rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">ยืนยันรหัสผ่าน</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    placeholder="กรุณายืนยันรหัสผ่าน"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full mt-1 px-4 py-3 bg-gray-100 border-transparent rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">บทบาท</label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="w-full mt-1 px-4 py-3 bg-gray-100 border-transparent rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                >
                                    <option value="resident">ลูกบ้าน</option>
                                    <option value="admin">ผู้ดูแลระบบ</option>
                                    <option value="technician">ช่าง</option>
                                </select>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-400 text-black font-bold rounded-lg transition-colors shadow-md"
                        >
                            {loading ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก'}
                        </button>

                        <p className="text-center text-sm text-gray-600">
                            มีบัญชีแล้ว?
                            <Link to="/login" className="ml-1 text-yellow-500 font-bold hover:underline">
                                เข้าสู่ระบบ
                            </Link>
                        </p>
                    </form>
                </div>
            </div>

            {/* 2. ส่วนรูปภาพ (ขวา) - พื้นหลังสีฟ้า */}
            <div className="hidden lg:flex w-1/2 bg-blue-600 items-center justify-center relative overflow-hidden">
                {/* ก้อนสีเหลืองตกแต่ง */}
                <div className="absolute w-[600px] h-[600px] bg-yellow-400 rounded-full blur-3xl opacity-50 mix-blend-multiply filter top-1/2 -right-20"></div>

                <div className="relative z-10 w-3/4 h-3/4 bg-gray-300 rounded-3xl overflow-hidden shadow-2xl">
                    <img
                        src="https://images.unsplash.com/photo-1460317442991-0ec209397118?q=80&w=1000&auto=format&fit=crop"
                        alt="Condo"
                        className="w-full h-full object-cover"
                    />
                </div>
            </div>
        </div>
    );
};

export default Register;