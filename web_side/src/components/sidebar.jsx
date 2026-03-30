// src/components/Sidebar.jsx
import { LayoutDashboard, Users, Package, Settings, LogOut } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';


const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        // ลบกุญแจออกจากกระเป๋า
        localStorage.removeItem("user_token");

        // ดีดกลับไปหน้า Login
        navigate("/login");
    };

    const menuItems = [
        { icon: LayoutDashboard, text: "Dashboard", path: "/" },
        { icon: Users, text: "จัดการลูกบ้าน", path: "/residents" },
        { icon: Package, text: "พัสดุ", path: "/parcels" },
        { icon: Settings, text: "ตั้งค่า", path: "/settings" },
    ];

    return (
        <div className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col shadow-sm">
            {/* Logo ส่วนบน */}
            <div className="p-6 flex items-center gap-2 border-b border-gray-100">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-xl">C</span>
                </div>
                <span className="text-xl font-bold text-gray-800">Condovenient</span>
            </div>

            {/* Menu Items */}
            <nav className="flex-1 p-4 space-y-2">
                {menuItems.map((item, index) => {
                    // 4. เช็คว่าหน้านี้เป็นหน้าปัจจุบันหรือไม่?
                    const isActive = location.pathname === item.path;

                    return (
                        <Link // 5. เปลี่ยนจาก button เป็น Link
                            key={index}
                            to={item.path}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-200 ${isActive
                                ? "bg-blue-50 text-blue-600 font-semibold" // สีตอนเลือกอยู่
                                : "text-gray-600 hover:bg-gray-50 hover:text-blue-600" // สีปกติ
                                }`}
                        >
                            <item.icon size={20} />
                            <span className="font-medium">{item.text}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* ปุ่ม Log Out ด้านล่าง */}
            <div className="p-4 border-t border-gray-100">
                <button
                    onClick={handleLogout} // <-- ใส่ onClick ตรงนี้
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-500 rounded-xl hover:bg-red-50 transition-colors cursor-pointer"
                >
                    <LogOut size={20} />
                    <span className="font-medium">ออกจากระบบ</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;