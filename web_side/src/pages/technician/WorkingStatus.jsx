import { useEffect, useState } from 'react';
import { Activity, Coffee, Wrench, Power } from 'lucide-react';

const API = 'http://localhost:3000';

const getUser = () => {
  try { return JSON.parse(localStorage.getItem('user_token') || 'null'); } catch { return null; }
};

const STATUS_OPTIONS = [
  { value: 'online',  label: 'ออนไลน์',     icon: Activity, color: 'bg-blue-500',  description: 'พร้อมรับงาน' },
  { value: 'working', label: 'กำลังทำงาน',  icon: Wrench,   color: 'bg-green-500', description: 'กำลังดำเนินการ' },
  { value: 'break',   label: 'พักงาน',     icon: Coffee,   color: 'bg-amber-500', description: 'พักชั่วคราว' },
  { value: 'offline', label: 'ออฟไลน์',    icon: Power,    color: 'bg-gray-500',  description: 'ไม่พร้อมรับงาน' },
];

const WorkingStatus = () => {
  const user = getUser();
  const [current, setCurrent] = useState('offline');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const load = () => {
    if (!user?.id) return;
    fetch(`${API}/api/staff/${user.id}/status`)
      .then(r => r.json())
      .then(d => setCurrent(d.staff?.workingStatus || 'offline'))
      .catch(() => {});

    fetch(`${API}/api/staff/${user.id}/status/history`)
      .then(r => r.json())
      .then(d => setHistory(d.logs || []))
      .catch(() => {});
  };

  useEffect(() => { load(); }, [user?.id]);

  const updateStatus = async (status) => {
    setLoading(true); setMsg('');
    try {
      const res = await fetch(`${API}/api/staff/${user.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setCurrent(status);
        setMsg('อัปเดตสถานะเรียบร้อย');
        setTimeout(() => setMsg(''), 1500);
        load();
      }
    } catch { setMsg('อัปเดตไม่สำเร็จ'); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-1">สถานะการทำงาน</h1>
      <p className="text-gray-500 text-sm mb-6">อัปเดตสถานะให้ admin และระบบทราบ</p>

      {msg && <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg">{msg}</div>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {STATUS_OPTIONS.map(opt => {
          const Icon = opt.icon;
          const active = current === opt.value;
          return (
            <button key={opt.value} disabled={loading}
              onClick={() => updateStatus(opt.value)}
              className={`p-6 rounded-2xl border-2 transition text-left ${
                active
                  ? 'border-orange-500 bg-orange-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-orange-300'
              } disabled:opacity-50`}>
              <div className={`w-12 h-12 rounded-xl ${opt.color} flex items-center justify-center mb-3`}>
                <Icon className="text-white" size={24} />
              </div>
              <div className="font-bold text-gray-800">{opt.label}</div>
              <div className="text-xs text-gray-500 mt-1">{opt.description}</div>
              {active && <div className="text-xs text-orange-600 font-semibold mt-2">✓ สถานะปัจจุบัน</div>}
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">ประวัติการเปลี่ยนสถานะ</h2>
        {history.length === 0 ? (
          <div className="text-gray-400 text-sm py-6 text-center">ยังไม่มีประวัติ</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {history.map(h => (
              <li key={h.id} className="py-3 flex items-center justify-between">
                <span className="font-medium text-gray-700 capitalize">{h.status}</span>
                <span className="text-xs text-gray-500">
                  {h.updatedAt ? new Date(h.updatedAt).toLocaleString('th-TH') : '-'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default WorkingStatus;