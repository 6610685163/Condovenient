import { useEffect, useState } from 'react';
import { Wrench, CheckCircle, Star, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const API = 'http://localhost:3000';

const getUser = () => {
  try { return JSON.parse(localStorage.getItem('user_token') || 'null'); } catch { return null; }
};

// Local StatCard component styled identically to the Admin's StatCard
const StatCard = ({ icon: Icon, title, value, colorClass, to }) => (
  <Link to={to} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-md hover:border-slate-200 transition-all group">
    <div className={`p-4 rounded-xl ${colorClass} text-white shadow-sm group-hover:scale-105 transition-transform`}>
      <Icon size={24} strokeWidth={2} />
    </div>
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{title}</p>
      <h3 className="text-2xl font-serif font-bold text-slate-800">{value}</h3>
    </div>
  </Link>
);

const TechDashboard = () => {
  const user = getUser();
  const [jobs, setJobs] = useState([]);
  const [feedback, setFeedback] = useState({ count: 0, averageScore: 0 });
  const [status, setStatus] = useState('offline');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    Promise.all([
      fetch(`${API}/api/repair/technician/${user.id}`).then(r => r.json()),
      fetch(`${API}/api/ratings/technician/${user.id}`).then(r => r.json()),
      fetch(`${API}/api/staff/${user.id}/status`).then(r => r.json())
    ]).then(([j, f, s]) => {
      setJobs(Array.isArray(j) ? j : []);
      setFeedback({
        count: f.count || 0,
        averageScore: f.averageScore || 0,
      });
      setStatus(s.staff?.workingStatus || 'offline');
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user?.id]);

  const assigned = jobs.filter(j => j.status === 'assigned').length;
  const inProgress = jobs.filter(j => j.status === 'in_progress').length;
  const completed = jobs.filter(j => j.status === 'completed').length;

  const stats = [
    { title: 'รอรับงาน', value: loading ? '...' : `${assigned}`, icon: Clock, colorClass: 'bg-amber-500', link: '/technician/jobs' },
    { title: 'กำลังดำเนินการซ่อม', value: loading ? '...' : `${inProgress}`, icon: Wrench, colorClass: 'bg-blue-500', link: '/technician/jobs' },
    { title: 'เสร็จสิ้นแล้ว', value: loading ? '...' : `${completed}`, icon: CheckCircle, colorClass: 'bg-emerald-500', link: '/technician/jobs' },
    { title: 'คะแนนเฉลี่ย', value: loading ? '...' : `${feedback.averageScore || '-'}`, icon: Star, colorClass: 'bg-purple-500', link: '/technician/feedback' },
  ];

  const recentJobs = jobs.slice(0, 5);

  const getStatusDisplay = (statusStr) => {
    switch (statusStr?.toLowerCase()) {
      case 'completed': return { label: 'Completed', cls: 'bg-emerald-50 text-emerald-600 border border-emerald-100' };
      case 'in_progress': return { label: 'In Progress', cls: 'bg-blue-50 text-blue-600 border border-blue-100' };
      case 'assigned': return { label: 'Assigned', cls: 'bg-amber-50 text-amber-600 border border-amber-100' };
      default: return { label: statusStr || 'Unknown', cls: 'bg-slate-50 text-slate-600 border border-slate-200' };
    }
  };

  return (
    <div className="space-y-6 pb-8 font-sans">
      {/* Header & Status */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-800">Technician Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">ยินดีต้อนรับกลับมา, <span className="font-semibold text-slate-700">{user?.name}</span></p>
        </div>
        <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Status</span>
          <span className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
            status === 'working' ? 'bg-blue-50 text-blue-600' :
            status === 'break' ? 'bg-amber-50 text-amber-600' :
            status === 'online' ? 'bg-emerald-50 text-emerald-600' :
            'bg-slate-100 text-slate-500'
          }`}>
            {status}
          </span>
          <Link to="/technician/status" className="text-amber-500 text-xs font-bold hover:text-amber-600 hover:underline ml-1">
            CHANGE
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} to={stat.link} />
        ))}
      </div>

      {/* Recent Jobs Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">งานที่ได้รับมอบหมายล่าสุด</h2>
          <Link to="/technician/jobs" className="text-sm font-semibold text-amber-500 hover:text-amber-600">View All →</Link>
        </div>
        
        {loading ? (
          <p className="text-center text-slate-400 py-12">กำลังโหลดข้อมูล...</p>
        ) : recentJobs.length === 0 ? (
          <div className="p-12 text-center bg-slate-50/50">
            <p className="text-slate-500 font-medium">ยังไม่มีงานที่ได้รับมอบหมายในขณะนี้</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">
                  <th className="px-6 py-4">Issue</th>
                  <th className="px-6 py-4">Room</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentJobs.map((j, i) => {
                  const statusInfo = getStatusDisplay(j.status);
                  return (
                    <tr key={j.id || i} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-800">{j.title}</td>
                      <td className="px-6 py-4 font-bold text-amber-600">{j.roomNumber}</td>
                      <td className="px-6 py-4 text-slate-600 font-medium">{j.category}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase ${statusInfo.cls}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TechDashboard;