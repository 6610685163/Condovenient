import { LayoutDashboard, Wrench, Activity, Star, LogOut } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const TechSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  let user = null;
  try { user = JSON.parse(localStorage.getItem('user_token') || 'null'); } catch {}

  const handleLogout = () => {
    localStorage.removeItem('user_token');
    navigate('/login');
  };

  const menuItems = [
    { icon: LayoutDashboard, text: 'Dashboard',       path: '/technician' },
    { icon: Wrench,          text: 'งานของฉัน',      path: '/technician/jobs' },
    { icon: Activity,        text: 'สถานะการทำงาน',  path: '/technician/status' },
    { icon: Star,            text: 'Feedback',        path: '/technician/feedback' },
  ];

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col shadow-sm">
      <div className="p-6 flex items-center gap-2 border-b border-gray-100">
        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-xl">C</span>
        </div>
        <div>
          <div className="text-xl font-bold text-gray-800">Condovenient</div>
          <div className="text-xs text-orange-600 font-semibold">Technician Panel</div>
        </div>
      </div>

      {user && (
        <div className="px-6 py-3 border-b border-gray-100 text-sm">
          <div className="text-gray-500">Logged in as</div>
          <div className="font-semibold text-gray-800">{user.name || user.username}</div>
        </div>
      )}

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item, index) => {
          const isActive = location.pathname === item.path
            || (item.path !== '/technician' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={index}
              to={item.path}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-200 ${
                isActive
                  ? 'bg-orange-50 text-orange-600 font-semibold'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-orange-600'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.text}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-500 rounded-xl hover:bg-red-50 transition-colors cursor-pointer">
          <LogOut size={20} />
          <span className="font-medium">ออกจากระบบ</span>
        </button>
      </div>
    </div>
  );
};

export default TechSidebar;