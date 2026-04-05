// src/pages/Register.jsx
import { Link } from 'react-router-dom';

const Register = () => {
    return (
        <div className="min-h-screen flex bg-white">
            {/* 1. ส่วนฟอร์ม (ซ้าย) */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="w-full max-w-md space-y-8">

                    <div className="text-left">
                        <h2 className="text-3xl font-bold text-gray-900">Create your Free Account</h2>
                    </div>

                    <form className="mt-8 space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Full Name</label>
                                <input
                                    type="text"
                                    placeholder="Enter your Full Name here"
                                    className="w-full mt-1 px-4 py-3 bg-gray-100 border-transparent rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Email</label>
                                <input
                                    type="email"
                                    placeholder="Enter your Email here"
                                    className="w-full mt-1 px-4 py-3 bg-gray-100 border-transparent rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Password</label>
                                <input
                                    type="password"
                                    placeholder="Enter your Password here"
                                    className="w-full mt-1 px-4 py-3 bg-gray-100 border-transparent rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>
                        </div>

                        <button type="submit" className="w-full py-3 px-4 bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded-lg transition-colors shadow-md">
                            Create Account
                        </button>

                        <p className="text-center text-sm text-gray-600">
                            Already have an account?
                            <Link to="/login" className="ml-1 text-yellow-500 font-bold hover:underline">
                                Log in
                            </Link>
                        </p>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                            <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">- OR -</span></div>
                        </div>

                        <div className="flex gap-4">
                            <button type="button" className="w-1/2 py-2 px-4 border border-gray-300 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
                                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                                <span className="text-sm font-medium text-gray-700">Google</span>
                            </button>
                            <button type="button" className="w-1/2 py-2 px-4 border border-gray-300 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
                                <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" className="w-5 h-5" alt="Facebook" />
                                <span className="text-sm font-medium text-gray-700">Facebook</span>
                            </button>
                        </div>
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