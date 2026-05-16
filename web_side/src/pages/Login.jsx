import { useState } from 'react';
import { Building2 } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { auth, googleProvider, facebookProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // รับ error message จาก ProtectedRoute (กรณีถูกเตะออกเพราะไม่ใช่ admin)
  const routeError = location.state?.error || '';

  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState(routeError);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleLoginSuccess = (user) => {
    if (user.role !== 'admin') {
      setError('คุณไม่มีสิทธิ์เข้าใช้งานระบบนี้ (เฉพาะ Admin เท่านั้น)');
      return;
    }
    localStorage.setItem('user_token', JSON.stringify(user));
    navigate('/');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await axios.post('http://localhost:3000/api/auth/login', {
        username: formData.username,
        password: formData.password,
      });
      if (response.data.success) {
        handleLoginSuccess(response.data.user);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login ผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider, endpoint) => {
    setLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();
      const response = await axios.post(`http://localhost:3000/api/auth/${endpoint}`, { token });
      if (response.data.success) {
        handleLoginSuccess(response.data.user);
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อกับ Social Media');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* ซ้าย - รูปภาพ */}
      <div className="hidden lg:flex w-1/2 bg-blue-600 items-center justify-center relative overflow-hidden">
        <div className="absolute w-[500px] h-[500px] bg-yellow-400 rounded-full blur-3xl opacity-50 mix-blend-multiply filter top-0 -left-20 animate-blob"></div>
        <div className="absolute w-[500px] h-[500px] bg-yellow-400 rounded-full blur-3xl opacity-50 mix-blend-multiply filter bottom-0 -right-20 animate-blob animation-delay-2000"></div>
        <div className="relative z-10 w-3/4 h-3/4 bg-gray-300 rounded-3xl overflow-hidden shadow-2xl">
          <img
            src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1000&auto=format&fit=crop"
            alt="Condo"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* ขวา - ฟอร์ม */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-left">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-blue-600 rounded-lg text-white"><Building2 size={24} /></div>
              <span className="text-xl font-bold">Condovenient</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Admin Login</h2>
            <p className="text-sm text-gray-500 mt-1">เฉพาะผู้ดูแลระบบเท่านั้น</p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Email / Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter your Email or Username"
                  className="w-full mt-1 px-4 py-3 bg-gray-100 border-transparent rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your Password"
                  className="w-full mt-1 px-4 py-3 bg-gray-100 border-transparent rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded-lg transition-colors shadow-md disabled:opacity-50"
            >
              {loading ? 'กำลังเข้าสู่ระบบ...' : 'Sign In'}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
              <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">- OR -</span></div>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                disabled={loading}
                onClick={() => handleSocialLogin(googleProvider, 'google-login')}
                className="w-1/2 py-2 px-4 border border-gray-300 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                <span className="text-sm font-medium text-gray-700">Google</span>
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleSocialLogin(facebookProvider, 'facebook-login')}
                className="w-1/2 py-2 px-4 border border-gray-300 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors disabled:opacity-50"
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