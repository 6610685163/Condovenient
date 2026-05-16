import {
  LayoutDashboard, Users, Wrench,
  Receipt, Bell, LogOut, Package, UserCheck
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user_token');
    navigate('/login');
  };

  const menuItems = [
    { icon: LayoutDashboard, text: 'Dashboard',       path: '/' },
    { icon: Users,           text: 'จัดการลูกบ้าน',  path: '/residents' },
    { icon: Receipt,         text: 'Invoice',         path: '/invoices' },
    { icon: Wrench,          text: 'แจ้งซ่อม',        path: '/repairs' },
    { icon: Package,         text: 'พัสดุ',           path: '/parcels' },
    { icon: UserCheck,       text: 'ผู้มาติดต่อ',      path: '/visitors' },
    { icon: Bell,            text: 'Notifications',   path: '/notifications' },
  ];

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col shadow-sm">
      {/* Logo */}
      <div className="p-6 flex items-center gap-2 border-b border-gray-100">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-xl">C</span>
        </div>
        <span className="text-xl font-bold text-gray-800">Condovenient</span>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={index}
              to={item.path}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-200 ${
                isActive
                  ? 'bg-blue-50 text-blue-600 font-semibold'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.text}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
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