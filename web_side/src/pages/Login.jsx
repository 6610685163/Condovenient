import { useState } from 'react'; // เพิ่ม useState
import { Building2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios'; // เพิ่ม axios
import { auth, googleProvider, facebookProvider } from '../firebase'; // เรียก config ที่สร้างไว้
import { signInWithPopup } from 'firebase/auth';

const Login = () => {
    const navigate = useNavigate();
    
    // State สำหรับเก็บค่า input
    const [formData, setFormData] = useState({
        username: '', // Backend ใช้ username ไม่ใช่ email ในการ login ปกติ
        password: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // 1. ฟังก์ชัน Login ปกติ (Username/Password)
    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            // ยิงไปที่ Backend Port 3000
            const response = await axios.post('http://localhost:3000/api/auth/login', {
                username: formData.username,
                password: formData.password
            });

            if (response.data.success) {
                alert('Login สำเร็จ!');
                // เก็บข้อมูล User ลง LocalStorage (หรือ Context)
                localStorage.setItem("user_token", JSON.stringify(response.data.user));
                navigate("/");
            }
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Login ผิดพลาด');
        }
    }

    // 2. ฟังก์ชัน Social Login (ใช้ได้ทั้ง Google และ Facebook)
    const handleSocialLogin = async (provider, endpoint) => {
        try {
            const result = await signInWithPopup(auth, provider);
            const token = await result.user.getIdToken(); // ขอ Token จาก Firebase

            // ส่ง Token ไปให้ Backend ตรวจสอบ
            const response = await axios.post(`http://localhost:3000/api/auth/${endpoint}`, {
                token: token
            });

            if (response.data.success) {
                alert(`${response.data.message}`);
                localStorage.setItem("user_token", JSON.stringify(response.data.user));
                navigate("/");
            }
        } catch (error) {
            console.error("Social Login Error", error);
            alert('เกิดข้อผิดพลาดในการเชื่อมต่อกับ Social Media');
        }
    };

    return (
        <div className="min-h-screen flex bg-white">
            {/* ... (ส่วนรูปภาพด้านซ้าย เหมือนเดิม ไม่ต้องแก้) ... */}
            <div className="hidden lg:flex w-1/2 bg-blue-600 items-center justify-center relative overflow-hidden">
                 {/* คงโค้ดเดิมไว้ */}
                 <div className="absolute w-[500px] h-[500px] bg-yellow-400 rounded-full blur-3xl opacity-50 mix-blend-multiply filter top-0 -left-20 animate-blob"></div>
                 <div className="absolute w-[500px] h-[500px] bg-yellow-400 rounded-full blur-3xl opacity-50 mix-blend-multiply filter bottom-0 -right-20 animate-blob animation-delay-2000"></div>
                 <div className="relative z-10 w-3/4 h-3/4 bg-gray-300 rounded-3xl overflow-hidden shadow-2xl">
                    <img src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1000&auto=format&fit=crop" alt="Condo" className="w-full h-full object-cover"/>
                </div>
            </div>

            {/* ส่วนฟอร์ม (ขวา) */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="w-full max-w-md space-y-8">
                    {/* Header เหมือนเดิม */}
                    <div className="text-left">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="p-2 bg-blue-600 rounded-lg text-white"><Building2 size={24} /></div>
                            <span className="text-xl font-bold">Condovenient</span>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">Welcome Back!</h2>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Email / Username</label>
                                <input
                                    type="text"
                                    name="username" // ต้องตรงกับ state
                                    onChange={handleChange}
                                    placeholder="Enter your Email or Username"
                                    className="w-full mt-1 px-4 py-3 bg-gray-100 border-transparent rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Password</label>
                                <input
                                    type="password"
                                    name="password" // ต้องตรงกับ state
                                    onChange={handleChange}
                                    placeholder="Enter your Password"
                                    className="w-full mt-1 px-4 py-3 bg-gray-100 border-transparent rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <button type="submit" className="w-full py-3 px-4 bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded-lg transition-colors shadow-md">
                            Sign In
                        </button>

                        <p className="text-center text-sm text-gray-600">
                            Don't have an account?
                            <Link to="/register" className="ml-1 text-yellow-500 font-bold hover:underline">Register</Link>
                        </p>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                            <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">- OR -</span></div>
                        </div>

                        <div className="flex gap-4">
                            {/* ปุ่ม Google */}
                            <button 
                                type="button" 
                                onClick={() => handleSocialLogin(googleProvider, 'google-login')}
                                className="w-1/2 py-2 px-4 border border-gray-300 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                            >
                                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                                <span className="text-sm font-medium text-gray-700">Google</span>
                            </button>
                            
                            {/* ปุ่ม Facebook */}
                            <button 
                                type="button" 
                                onClick={() => handleSocialLogin(facebookProvider, 'facebook-login')}
                                className="w-1/2 py-2 px-4 border border-gray-300 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                            >
                                <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" className="w-5 h-5" alt="Facebook" />
                                <span className="text-sm font-medium text-gray-700">Facebook</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;