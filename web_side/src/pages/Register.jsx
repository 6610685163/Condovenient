// src/pages/Register.jsx
import { useState } from 'react';
import { Building2, Eye, EyeOff } from 'lucide-react';
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

    // State สำหรับเปิดปิดตาดูรหัสผ่าน
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
            setError('กรุณากรอกข้อมูลให้ครบทุกช่อง');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
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
                setSuccess('สมัครสมาชิกสำเร็จ! กำลังพาท่านไปยังหน้าเข้าสู่ระบบ...');
                setTimeout(() => navigate('/login'), 2000);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex font-sans bg-[#F8FAFC]">

            {/* ── ✅ ฝั่งซ้าย: ฟอร์มสมัครสมาชิก (สลับมาอยู่ฝั่งซ้ายเพื่อให้ต่างจากหน้า Login) ── */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#F8FAFC]">
                <div className="w-full max-w-[420px] space-y-6 my-auto">

                    {/* Logo */}
                    <div className="flex items-center gap-3 mb-8">
                        <div className="bg-slate-900 p-2.5 rounded-xl text-white shadow-md">
                            <Building2 size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 leading-tight tracking-tight">Condovenient</h2>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-[28px] font-bold text-slate-900 mb-2 tracking-tight">Create an account</h2>
                        <p className="text-sm text-slate-500 font-medium">Please fill in your details to sign up</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm font-medium">
                            {success}
                        </div>
                    )}

                    <form className="mt-8 space-y-4" onSubmit={handleSubmit}>

                        <div>
                            <label className="text-xs font-bold text-slate-700 block mb-1.5">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g. John Doe"
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all text-sm text-slate-700 shadow-sm"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-700 block mb-1.5">Username</label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="e.g. john_doe123"
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all text-sm text-slate-700 shadow-sm"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-slate-700 block mb-1.5">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Min. 6 chars"
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all text-sm text-slate-700 shadow-sm pr-10"
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-700 block mb-1.5">Confirm Password</label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="Repeat password"
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all text-sm text-slate-700 shadow-sm pr-10"
                                    />
                                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-700 block mb-1.5">Role</label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all text-sm text-slate-700 shadow-sm"
                            >
                                <option value="resident">Resident (ลูกบ้าน)</option>
                                <option value="admin">Admin (ผู้ดูแลระบบ)</option>
                                <option value="technician">Technician (ช่าง)</option>
                            </select>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 px-4 bg-[#FBBF24] hover:bg-[#F59E0B] text-slate-900 font-bold text-sm rounded-xl transition-all shadow-md shadow-amber-200/50 disabled:opacity-50 active:scale-[0.98]"
                            >
                                {loading ? 'Signing up...' : 'Sign Up'}
                            </button>
                        </div>

                        <p className="text-center text-sm font-medium text-slate-500 pt-2">
                            Already have an account? <Link to="/login" className="text-amber-500 hover:text-amber-600 font-bold transition-colors">Sign in</Link>
                        </p>
                    </form>
                </div>
            </div>

            {/* ── ✅ ฝั่งขวา: รูปภาพตึก (สลับมาอยู่ฝั่งขวา) ── */}
            <div className="hidden lg:flex w-1/2 relative bg-slate-900">
                <img
                    src="https://images.unsplash.com/photo-1460317442991-0ec209397118?q=80&w=1000&auto=format&fit=crop"
                    alt="Modern Condominium"
                    className="absolute inset-0 w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent"></div>
                <div className="absolute bottom-16 left-12 right-12 text-white">
                    <h1 className="text-4xl font-bold font-serif mb-3 tracking-tight">Join Condovenient</h1>
                    <p className="text-slate-300 text-lg font-medium">Create your account to experience seamless property management.</p>
                </div>
            </div>

        </div>
    );
};

export default Register;
