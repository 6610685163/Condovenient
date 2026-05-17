import { useEffect, useState } from 'react';
import { Wrench, CheckCircle, Star, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const API = 'http://localhost:3000';

const getUser = () => {
  try { return JSON.parse(localStorage.getItem('user_token') || 'null'); } catch { return null; }
};

const TechDashboard = () => {
  const user = getUser();
  const [jobs, setJobs] = useState([]);
  const [feedback, setFeedback] = useState({ count: 0, averageScore: 0 });
  const [status, setStatus] = useState('offline');

  useEffect(() => {
    if (!user?.id) return;

    fetch(`${API}/api/repair/technician/${user.id}`)
      .then(r => r.json())
      .then(d => setJobs(Array.isArray(d) ? d : []))
      .catch(() => setJobs([]));

    fetch(`${API}/api/ratings/technician/${user.id}`)
      .then(r => r.json())
      .then(d => setFeedback({
        count: d.count || 0,
        averageScore: d.averageScore || 0,
      }))
      .catch(() => {});

    fetch(`${API}/api/staff/${user.id}/status`)
      .then(r => r.json())
      .then(d => setStatus(d.staff?.workingStatus || 'offline'))
      .catch(() => {});
  }, [user?.id]);

  const assigned = jobs.filter(j => j.status === 'assigned').length;
  const inProgress = jobs.filter(j => j.status === 'in_progress').length;
  const completed = jobs.filter(j => j.status === 'completed').length;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-1">Technician Dashboard</h1>
      <p className="text-gray-500 mb-2">ยินดีต้อนรับ {user?.name}</p>
      <p className="text-sm mb-8">
        สถานะปัจจุบัน:
        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
          status === 'working' ? 'bg-green-100 text-green-700' :
          status === 'break'   ? 'bg-amber-100 text-amber-700' :
          status === 'online'  ? 'bg-blue-100 text-blue-700' :
          'bg-gray-100 text-gray-600'
        }`}>{status}</span>
        <Link to="/technician/status" className="ml-3 text-blue-600 text-xs hover:underline">เปลี่ยน</Link>
      </p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <StatCard icon={Clock}      color="bg-amber-500" label="รอรับงาน"     value={assigned}    to="/technician/jobs" />
        <StatCard icon={Wrench}     color="bg-blue-500"  label="กำลังทำ"      value={inProgress}  to="/technician/jobs" />
        <StatCard icon={CheckCircle} color="bg-green-500" label="เสร็จแล้ว"   value={completed}   to="/technician/jobs" />
        <StatCard icon={Star}       color="bg-yellow-500" label="คะแนนเฉลี่ย" value={feedback.averageScore || '-'} to="/technician/feedback" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">งานล่าสุด</h2>
          <Link to="/technician/jobs" className="text-blue-600 text-sm hover:underline">ดูทั้งหมด →</Link>
        </div>
        {jobs.length === 0 ? (
          <div className="text-gray-400 text-sm py-6 text-center">ยังไม่มีงาน</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {jobs.slice(0, 5).map(j => (
              <li key={j.id} className="py-3 flex items-center gap-3">
                <Wrench className="text-blue-500" size={18} />
                <div className="flex-1">
                  <div className="font-semibold text-gray-800">{j.title}</div>
                  <div className="text-xs text-gray-500">ห้อง {j.roomNumber} · {j.category}</div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  j.status === 'assigned'   ? 'bg-amber-100 text-amber-700' :
                  j.status === 'in_progress'? 'bg-blue-100 text-blue-700' :
                  j.status === 'completed'  ? 'bg-green-100 text-green-700' :
                  'bg-gray-100 text-gray-700'
                }`}>{j.status}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color, to }) => (
  <Link to={to}
    className="flex items-center gap-4 p-6 rounded-2xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition">
    <div className={`p-3 rounded-xl ${color}`}>
      <Icon size={24} className="text-white" />
    </div>
    <div>
      <div className="text-3xl font-bold text-gray-800">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  </Link>
);

export default TechDashboard;