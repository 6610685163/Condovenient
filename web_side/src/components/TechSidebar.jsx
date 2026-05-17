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
    { icon: LayoutDashboard, text: 'Dashboard', path: '/technician' },
    { icon: Wrench, text: 'งานของฉัน', path: '/technician/jobs' },
    { icon: Activity, text: 'สถานะการทำงาน', path: '/technician/status' },
    { icon: Star, text: 'Feedback', path: '/technician/feedback' },
  ];

  return (
    <div className="w-64 h-screen bg-slate-900 border-r border-slate-800 flex flex-col shadow-xl z-10">
      {/* Logo Area */}
      <div className="p-6 flex items-center gap-3 border-b border-slate-800/50">
        <div className="w-10 h-10 bg-amber-400 rounded-xl flex items-center justify-center shadow-lg shadow-amber-400/20">
          <span className="text-slate-900 font-bold text-xl">C</span>
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-bold text-white leading-tight">Condovenient</span>
          <span className="text-xs text-amber-400 font-medium">Technician Panel</span>
        </div>
      </div>

      {/* User Info */}
      {user && (
        <div className="px-6 py-4 border-b border-slate-800/50 text-sm">
          <div className="text-xs text-slate-500 mb-0.5">Logged in as</div>
          <div className="font-semibold text-slate-200 truncate">{user.name || user.username}</div>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {menuItems.map((item, index) => {
          const isActive = location.pathname === item.path
            || (item.path !== '/technician' && location.pathname.startsWith(item.path));
            
          return (
            <Link
              key={index}
              to={item.path}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-slate-800/80 text-amber-400 font-semibold shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className="font-medium tracking-wide">{item.text}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout Footer */}
      <div className="p-4 border-t border-slate-800/50">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 rounded-xl hover:bg-red-500/10 hover:text-red-400 transition-colors cursor-pointer"
        >
          <LogOut size={20} />
          <span className="font-medium">Sign out</span>
        </button>
      </div>
    </div>
  );
};

export default TechSidebar;