import { useEffect, useState } from 'react';
import { Wrench, Clock, Hammer } from 'lucide-react';

const API = 'http://localhost:3000';

const getUser = () => {
  try { return JSON.parse(localStorage.getItem('user_token') || 'null'); } catch { return null; }
};

const STATUS_LABEL = {
  assigned: 'รอรับงาน',
  in_progress: 'กำลังทำ',
  completed: 'เสร็จแล้ว',
};
const STATUS_COLOR = {
  assigned: 'bg-amber-100 text-amber-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
};

const MyJobs = () => {
  const user = getUser();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = () => {
    if (!user?.id) return;
    setLoading(true);
    fetch(`${API}/api/repair/technician/${user.id}`)
      .then(r => r.json())
      .then(d => { setJobs(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => { setError('โหลดงานไม่สำเร็จ'); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const acceptJob = async (id) => {
    setError(''); setSuccess('');
    try {
      const res = await fetch(`${API}/api/repair/accept/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ technicianId: user.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('รับงานเรียบร้อย');
        setTimeout(() => setSuccess(''), 1500);
        load();
      } else setError(data.error || 'รับงานไม่สำเร็จ');
    } catch { setError('เชื่อมต่อ Server ไม่สำเร็จ'); }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">งานของฉัน</h1>
        <p className="text-gray-500 text-sm">รายการงานที่ได้รับมอบหมาย</p>
      </div>

      {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg">{success}</div>}
      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">{error}</div>}

      <div className="space-y-3">
        {loading ? (
          <div className="bg-white p-8 rounded-2xl text-center text-gray-400">กำลังโหลด...</div>
        ) : jobs.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl text-center text-gray-400">ยังไม่มีงาน</div>
        ) : jobs.map(j => (
          <div key={j.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-orange-100">
                <Wrench className="text-orange-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-gray-800">{j.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLOR[j.status] || 'bg-gray-100'}`}>
                    {STATUS_LABEL[j.status] || j.status}
                  </span>
                </div>
                <div className="text-sm text-gray-600">ห้อง {j.roomNumber} · {j.category}</div>
                {j.description && <p className="text-sm text-gray-600 mt-1">{j.description}</p>}
                <div className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                  <Clock size={12} />
                  {j.createdAt?._seconds ? new Date(j.createdAt._seconds * 1000).toLocaleString('th-TH') : '-'}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {j.status === 'assigned' && (
                  <button onClick={() => acceptJob(j.id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1">
                    <Hammer size={14} /> รับงาน
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyJobs;