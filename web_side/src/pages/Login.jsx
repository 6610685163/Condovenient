import { useState } from 'react';
import { Building2, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { auth, googleProvider, facebookProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // รับ error message จาก ProtectedRoute
  const routeError = location.state?.error || '';

  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState(routeError);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      setError(err.response?.data?.message || 'Login ผิดพลาด กรุณาตรวจสอบข้อมูล');
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
    <div className="min-h-screen flex font-sans bg-[#F8FAFC]">
      {/* ── ฝั่งซ้าย: รูปภาพ ── */}
      <div className="hidden lg:flex w-1/2 relative bg-slate-900">
        <img
          src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1000&auto=format&fit=crop"
          alt="Condovenient Building"
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent"></div>
        <div className="absolute bottom-16 left-12 right-12 text-white">
          <h1 className="text-4xl font-bold font-serif mb-3 tracking-tight">Welcome to Condovenient</h1>
          <p className="text-slate-300 text-lg font-medium">Enterprise-grade property management for modern condominiums</p>
        </div>
      </div>

      {/* ── ฝั่งขวา: ฟอร์ม ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#F8FAFC]">
        <div className="w-full max-w-[420px] space-y-8">
          
          <div className="flex items-center gap-3 mb-10">
            <div className="bg-slate-900 p-2.5 rounded-xl text-white shadow-md">
              <Building2 size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 leading-tight tracking-tight">Condovenient</h2>
              <p className="text-[11px] text-slate-500 font-medium tracking-wide">Property Management System</p>
            </div>
          </div>

          <div>
            <h2 className="text-[28px] font-bold text-slate-900 mb-2 tracking-tight">Sign in</h2>
            <p className="text-sm text-slate-500 font-medium">Enter your credentials to access your dashboard</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          <form className="mt-8 space-y-5" onSubmit={handleLogin}>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Email address / Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="admin@condovenient.com"
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all text-sm text-slate-700 shadow-sm"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-slate-700">Password</label>
                <a href="#" className="text-xs font-bold text-amber-500 hover:text-amber-600 transition-colors">Forgot password?</a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all text-sm text-slate-700 shadow-sm pr-10"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1 pb-2">
              <input type="checkbox" id="remember" className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500 cursor-pointer"/>
              <label htmlFor="remember" className="text-sm font-medium text-slate-600 cursor-pointer">Remember me for 30 days</label>
            </div>

            <button type="submit" disabled={loading} className="w-full py-3 px-4 bg-[#FBBF24] hover:bg-[#F59E0B] text-slate-900 font-bold text-sm rounded-xl transition-all shadow-md shadow-amber-200/50 disabled:opacity-50 active:scale-[0.98]">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <div className="pt-4">
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                <div className="relative flex justify-center text-xs"><span className="px-3 bg-[#F8FAFC] text-slate-400 font-semibold uppercase tracking-wider">Or continue with</span></div>
              </div>

              <div className="flex gap-3">
                <button type="button" disabled={loading} onClick={() => handleSocialLogin(googleProvider, 'google-login')} className="flex-1 py-2.5 px-4 bg-white border border-slate-200 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors disabled:opacity-50 shadow-sm">
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-4 h-4" alt="Google" />
                  <span className="text-xs font-bold text-slate-600">Google</span>
                </button>
                <button type="button" disabled={loading} onClick={() => handleSocialLogin(facebookProvider, 'facebook-login')} className="flex-1 py-2.5 px-4 bg-white border border-slate-200 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors disabled:opacity-50 shadow-sm">
                  <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" className="w-4 h-4" alt="Facebook" />
                  <span className="text-xs font-bold text-slate-600">Facebook</span>
                </button>
              </div>
            </div>

            {/* ✅ เพิ่มลิงก์ไปหน้าสมัครสมาชิกที่นี่ */}
            <div className="text-center pt-4 space-y-2">
              <p className="text-sm font-medium text-slate-500">
                Don't have an account? <Link to="/register" className="text-amber-500 hover:text-amber-600 font-bold transition-colors">Sign up</Link>
              </p>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
// import { useState } from 'react';
// import { Building2 } from 'lucide-react';
// import { Link, useNavigate, useLocation } from 'react-router-dom';
// import axios from 'axios';
// import { auth, googleProvider, facebookProvider } from '../firebase';
// import { signInWithPopup } from 'firebase/auth';

// const Login = () => {
//   const navigate = useNavigate();
//   const location = useLocation();

//   // รับ error message จาก ProtectedRoute (กรณีถูกเตะออกเพราะไม่ใช่ admin)
//   const routeError = location.state?.error || '';

//   const [formData, setFormData] = useState({ username: '', password: '' });
//   const [error, setError] = useState(routeError);
//   const [loading, setLoading] = useState(false);

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//     setError('');
//   };

//   const handleLoginSuccess = (user) => {
//     if (user.role !== 'admin') {
//       setError('คุณไม่มีสิทธิ์เข้าใช้งานระบบนี้ (เฉพาะ Admin เท่านั้น)');
//       return;
//     }
//     localStorage.setItem('user_token', JSON.stringify(user));
//     navigate('/');
//   };

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');
//     try {
//       const response = await axios.post('http://localhost:3000/api/auth/login', {
//         username: formData.username,
//         password: formData.password,
//       });
//       if (response.data.success) {
//         handleLoginSuccess(response.data.user);
//       }
//     } catch (err) {
//       setError(err.response?.data?.message || 'Login ผิดพลาด');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSocialLogin = async (provider, endpoint) => {
//     setLoading(true);
//     setError('');
//     try {
//       const result = await signInWithPopup(auth, provider);
//       const token = await result.user.getIdToken();
//       const response = await axios.post(`http://localhost:3000/api/auth/${endpoint}`, { token });
//       if (response.data.success) {
//         handleLoginSuccess(response.data.user);
//       }
//     } catch (err) {
//       setError('เกิดข้อผิดพลาดในการเชื่อมต่อกับ Social Media');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex bg-white">
//       {/* ซ้าย - รูปภาพ */}
//       <div className="hidden lg:flex w-1/2 bg-blue-600 items-center justify-center relative overflow-hidden">
//         <div className="absolute w-[500px] h-[500px] bg-yellow-400 rounded-full blur-3xl opacity-50 mix-blend-multiply filter top-0 -left-20 animate-blob"></div>
//         <div className="absolute w-[500px] h-[500px] bg-yellow-400 rounded-full blur-3xl opacity-50 mix-blend-multiply filter bottom-0 -right-20 animate-blob animation-delay-2000"></div>
//         <div className="relative z-10 w-3/4 h-3/4 bg-gray-300 rounded-3xl overflow-hidden shadow-2xl">
//           <img
//             src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1000&auto=format&fit=crop"
//             alt="Condo"
//             className="w-full h-full object-cover"
//           />
//         </div>
//       </div>

//       {/* ขวา - ฟอร์ม */}
//       <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
//         <div className="w-full max-w-md space-y-8">
//           <div className="text-left">
//             <div className="flex items-center gap-2 mb-6">
//               <div className="p-2 bg-blue-600 rounded-lg text-white"><Building2 size={24} /></div>
//               <span className="text-xl font-bold">Condovenient</span>
//             </div>
//             <h2 className="text-3xl font-bold text-gray-900">Admin Login</h2>
//             <p className="text-sm text-gray-500 mt-1">เฉพาะผู้ดูแลระบบเท่านั้น</p>
//           </div>

//           {/* Error Banner */}
//           {error && (
//             <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
//               <span>⚠️</span> {error}
//             </div>
//           )}

//           <form className="mt-8 space-y-6" onSubmit={handleLogin}>
//             <div className="space-y-4">
//               <div>
//                 <label className="text-sm font-medium text-gray-500">Email / Username</label>
//                 <input
//                   type="text"
//                   name="username"
//                   value={formData.username}
//                   onChange={handleChange}
//                   placeholder="Enter your Email or Username"
//                   className="w-full mt-1 px-4 py-3 bg-gray-100 border-transparent rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
//                 />
//               </div>
//               <div>
//                 <label className="text-sm font-medium text-gray-500">Password</label>
//                 <input
//                   type="password"
//                   name="password"
//                   value={formData.password}
//                   onChange={handleChange}
//                   placeholder="Enter your Password"
//                   className="w-full mt-1 px-4 py-3 bg-gray-100 border-transparent rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
//                 />
//               </div>
//             </div>

//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full py-3 px-4 bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded-lg transition-colors shadow-md disabled:opacity-50"
//             >
//               {loading ? 'กำลังเข้าสู่ระบบ...' : 'Sign In'}
//             </button>

//             <div className="relative my-6">
//               <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
//               <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">- OR -</span></div>
//             </div>

//             <div className="flex gap-4">
//               <button
//                 type="button"
//                 disabled={loading}
//                 onClick={() => handleSocialLogin(googleProvider, 'google-login')}
//                 className="w-1/2 py-2 px-4 border border-gray-300 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors disabled:opacity-50"
//               >
//                 <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
//                 <span className="text-sm font-medium text-gray-700">Google</span>
//               </button>
//               <button
//                 type="button"
//                 disabled={loading}
//                 onClick={() => handleSocialLogin(facebookProvider, 'facebook-login')}
//                 className="w-1/2 py-2 px-4 border border-gray-300 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors disabled:opacity-50"
//               >
//                 <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" className="w-5 h-5" alt="Facebook" />
//                 <span className="text-sm font-medium text-gray-700">Facebook</span>
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;