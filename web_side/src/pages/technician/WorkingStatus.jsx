import { useEffect, useState } from 'react';
import { Activity, Coffee, Wrench, Power } from 'lucide-react';

const API = 'http://localhost:3000';

const getUser = () => {
  try { return JSON.parse(localStorage.getItem('user_token') || 'null'); } catch { return null; }
};

const STATUS_OPTIONS = [
  { value: 'online',  label: 'ออนไลน์',     icon: Activity, color: 'bg-emerald-500',  activeBg: 'bg-emerald-50', activeBorder: 'border-emerald-500', activeText: 'text-emerald-700', description: 'พร้อมรับงาน' },
  { value: 'working', label: 'กำลังทำงาน',  icon: Wrench,   color: 'bg-blue-500', activeBg: 'bg-blue-50', activeBorder: 'border-blue-500', activeText: 'text-blue-700', description: 'กำลังดำเนินการ' },
  { value: 'break',   label: 'พักงาน',     icon: Coffee,   color: 'bg-amber-500', activeBg: 'bg-amber-50', activeBorder: 'border-amber-500', activeText: 'text-amber-700', description: 'พักชั่วคราว' },
  { value: 'offline', label: 'ออฟไลน์',    icon: Power,    color: 'bg-slate-500', activeBg: 'bg-slate-50', activeBorder: 'border-slate-500', activeText: 'text-slate-700', description: 'ไม่พร้อมรับงาน' },
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
    <div className="space-y-6 pb-8 font-sans">
      <div>
        <h1 className="text-3xl font-serif font-bold text-slate-800 mb-1">Working Status</h1>
        <p className="text-sm text-slate-500 mb-6">อัปเดตสถานะให้ Admin และระบบทราบ</p>
      </div>

      {msg && <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm font-medium">{msg}</div>}

      {/* เลือกสถานะ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {STATUS_OPTIONS.map(opt => {
          const Icon = opt.icon;
          const active = current === opt.value;
          return (
            <button key={opt.value} disabled={loading}
              onClick={() => updateStatus(opt.value)}
              className={`p-6 rounded-2xl border-2 transition-all duration-200 text-left relative overflow-hidden ${
                active
                  ? `${opt.activeBorder} ${opt.activeBg} shadow-sm transform scale-[1.02]`
                  : 'border-slate-100 bg-white hover:border-slate-300 hover:bg-slate-50'
              } disabled:opacity-50`}>
              
              <div className={`w-12 h-12 rounded-xl ${opt.color} flex items-center justify-center mb-4 shadow-sm`}>
                <Icon className="text-white" size={24} />
              </div>
              <div className={`font-bold text-lg mb-1 ${active ? opt.activeText : 'text-slate-800'}`}>
                {opt.label}
              </div>
              <div className={`text-xs font-medium ${active ? opt.activeText : 'text-slate-500'}`}>
                {opt.description}
              </div>
              {active && (
                <div className="absolute top-4 right-4">
                  <span className="flex h-3 w-3 relative">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${opt.color}`}></span>
                    <span className={`relative inline-flex rounded-full h-3 w-3 ${opt.color}`}></span>
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* ประวัติการเปลี่ยนสถานะ */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4">ประวัติการเปลี่ยนสถานะ</h2>
        {history.length === 0 ? (
          <div className="text-slate-400 text-sm py-8 text-center bg-slate-50 rounded-xl">ยังไม่มีประวัติการทำรายการ</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Time Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map(h => {
                  const opt = STATUS_OPTIONS.find(o => o.value === h.status);
                  return (
                    <tr key={h.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${opt ? opt.activeBg + ' ' + opt.activeText + ' ' + opt.activeBorder : 'bg-slate-100 text-slate-600'}`}>
                          {opt ? <opt.icon size={12} /> : null}
                          {opt ? opt.label : h.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right text-slate-500 font-medium">
                        {h.updatedAt ? new Date(h.updatedAt).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' }) : '-'}
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

export default WorkingStatus;