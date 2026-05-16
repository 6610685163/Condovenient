import { useEffect, useState } from 'react';
import { LogIn, LogOut, Plus, X, MapPin, Clock, History, User } from 'lucide-react';

const API = 'http://localhost:3000';

// ดึงข้อมูล admin ที่ล็อกอินอยู่จาก localStorage
const getCurrentAdmin = () => {
  try {
    const raw = localStorage.getItem('user_token');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

const Visitors = () => {
  const [visitors, setVisitors]   = useState([]);
  const [history, setHistory]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [form, setForm] = useState({ visitorName: '', plateNumber: '', contactRoom: '', purpose: '' });
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');

  const admin = getCurrentAdmin();

  const loadVisitors = () => {
    setLoading(true); setError('');
    fetch(`${API}/api/visitors/active`)
      .then(r => r.json())
      .then(data => { setVisitors(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => { setError('ไม่สามารถโหลดข้อมูลได้'); setLoading(false); });
  };

  const loadHistory = () => {
    setHistoryLoading(true);
    fetch(`${API}/api/visitors/history`)
      .then(r => r.json())
      .then(data => { setHistory(Array.isArray(data) ? data : []); setHistoryLoading(false); })
      .catch(() => { setHistoryLoading(false); });
  };

  useEffect(() => {
    loadVisitors();
    const interval = setInterval(loadVisitors, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleCheckIn = async () => {
    if (!form.visitorName || !form.plateNumber || !form.contactRoom) {
      setError('กรุณากรอกข้อมูลให้ครบ (ชื่อ, ทะเบียนรถ, ห้องที่ติดต่อ)');
      return;
    }
    setSaving(true); setError('');
    try {
      const res = await fetch(`${API}/api/visitors/check-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          addedBy: admin?.name || admin?.username || 'Admin',   // ← ส่ง username ไปด้วย
        }),
      });
      const data = await res.json();
      setSaving(false);
      if (res.ok) {
        setSuccess(`ลงทะเบียนเข้าสำเร็จ${data.visitorId ? ` (ID: ${data.visitorId})` : ''}`);
        setShowModal(false);
        setForm({ visitorName: '', plateNumber: '', contactRoom: '', purpose: '' });
        setTimeout(() => { setSuccess(''); loadVisitors(); }, 1500);
      } else {
        setError(data.error || data.message || 'เกิดข้อผิดพลาด');
      }
    } catch { setError('เกิดข้อผิดพลาดในการสื่อสารกับเซิร์ฟเวอร์'); setSaving(false); }
  };

  const handleCheckOut = async (visitorId) => {
    if (!confirm('ลงทะเบียนออกผู้มาติดต่อนี้?')) return;
    try {
      const res = await fetch(`${API}/api/visitors/check-out/${visitorId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('ลงทะเบียนออกเรียบร้อยแล้ว');
        setTimeout(() => { setSuccess(''); loadVisitors(); if (showHistory) loadHistory(); }, 1500);
      } else {
        setError(data.error || data.message || 'เกิดข้อผิดพลาด');
      }
    } catch { setError('เกิดข้อผิดพลาดในการสื่อสารกับเซิร์ฟเวอร์'); }
  };

  const handleToggleHistory = () => {
    if (!showHistory) loadHistory();
    setShowHistory(!showHistory);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '-';
    try {
      const date = timestamp._seconds ? new Date(timestamp._seconds * 1000) : new Date(timestamp);
      return date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    } catch { return '-'; }
  };

  const formatDateTime = (timestamp) => {
    if (!timestamp) return '-';
    try {
      const date = timestamp._seconds ? new Date(timestamp._seconds * 1000) : new Date(timestamp);
      return date.toLocaleString('th-TH');
    } catch { return '-'; }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">จัดการผู้มาติดต่อ</h1>
        <div className="flex gap-2">
          <button onClick={handleToggleHistory}
            className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
            <History size={18} /> {showHistory ? 'ซ่อนประวัติ' : 'ประวัติทั้งหมด'}
          </button>
          <button onClick={() => { setShowModal(true); setError(''); }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <Plus size={18} /> ลงทะเบียนเข้า
          </button>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
      {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">✅ {success}</div>}

      {/* Active Visitors */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-blue-50 border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-700">
            ผู้มาติดต่อที่อยู่ในโครงการ
            <span className="ml-2 bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">{visitors.length}</span>
          </h2>
          <span className="text-xs text-gray-400">รีเฟรชอัตโนมัติทุก 30 วินาที</span>
        </div>

        {loading ? <p className="text-center text-gray-400 py-12">กำลังโหลด...</p>
          : visitors.length === 0 ? <p className="text-center text-gray-400 py-12">ไม่มีผู้มาติดต่อที่อยู่ในโครงการ</p>
          : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left text-gray-500">
                <th className="px-6 py-4">ชื่อผู้มาติดต่อ</th>
                <th className="px-6 py-4">ทะเบียนรถ</th>
                <th className="px-6 py-4">ห้องที่ติดต่อ</th>
                <th className="px-6 py-4">วัตถุประสงค์</th>
                <th className="px-6 py-4">เวลาเข้า</th>
                <th className="px-6 py-4">บันทึกโดย</th>
                <th className="px-6 py-4">สถานะ</th>
                <th className="px-6 py-4">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {visitors.map((v, i) => (
                <tr key={v.id || i} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-800">{v.visitorName}</td>
                  <td className="px-6 py-4 text-gray-600 font-mono text-sm">{v.plateNumber}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                      <MapPin size={14} />{v.contactRoom}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-sm">{v.purpose || '-'}</td>
                  <td className="px-6 py-4 text-gray-600 text-sm">
                    <span className="inline-flex items-center gap-1"><Clock size={14} />{formatTime(v.checkInTime)}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm">
                    <span className="inline-flex items-center gap-1">
                      <User size={13} />{v.addedBy || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                      <LogIn size={14} />อยู่ในโครงการ
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => handleCheckOut(v.id)}
                      className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 hover:bg-orange-200 px-3 py-1 rounded text-xs font-medium transition-colors">
                      <LogOut size={14} />ออก
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* History */}
      {showHistory && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 border-b px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-700">
              ประวัติผู้มาติดต่อ (ออกแล้ว)
              <span className="ml-2 bg-gray-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{history.length}</span>
            </h2>
          </div>
          {historyLoading ? <p className="text-center text-gray-400 py-12">กำลังโหลด...</p>
            : history.length === 0 ? <p className="text-center text-gray-400 py-12">ไม่มีประวัติผู้มาติดต่อ</p>
            : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr className="text-left text-gray-500">
                  <th className="px-6 py-4">ชื่อผู้มาติดต่อ</th>
                  <th className="px-6 py-4">ทะเบียนรถ</th>
                  <th className="px-6 py-4">ห้องที่ติดต่อ</th>
                  <th className="px-6 py-4">วัตถุประสงค์</th>
                  <th className="px-6 py-4">บันทึกโดย</th>
                  <th className="px-6 py-4">เวลาเข้า</th>
                  <th className="px-6 py-4">เวลาออก</th>
                </tr>
              </thead>
              <tbody>
                {history.map((v, i) => (
                  <tr key={v.id || i} className="border-t hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-800">{v.visitorName}</td>
                    <td className="px-6 py-4 text-gray-600 font-mono text-sm">{v.plateNumber}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-medium">
                        <MapPin size={14} />{v.contactRoom}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{v.purpose || '-'}</td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      <span className="inline-flex items-center gap-1">
                        <User size={13} />{v.addedBy || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">{formatDateTime(v.checkInTime)}</td>
                    <td className="px-6 py-4 text-gray-500 text-sm">{formatDateTime(v.checkOutTime)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Modal Check-in */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">ลงทะเบียนผู้มาติดต่อเข้า</h2>
              <button onClick={() => { setShowModal(false); setError(''); }}><X size={20} /></button>
            </div>

            {/* แสดง Admin ที่กำลังบันทึก */}
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 px-3 py-2 rounded-lg">
              <User size={15} className="text-blue-500" />
              <span className="text-xs text-blue-600">บันทึกโดย: </span>
              <span className="text-xs font-semibold text-blue-700">
                {admin?.name || admin?.username || 'Admin'}
              </span>
            </div>

            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">{error}</div>}

            <div>
              <label className="text-xs text-gray-500 block mb-1">ชื่อผู้มาติดต่อ *</label>
              <input className="w-full border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="เช่น สมชายดี ยืนยิ่ง" value={form.visitorName}
                onChange={e => setForm({ ...form, visitorName: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">ทะเบียนรถ *</label>
              <input className="w-full border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                placeholder="เช่น กท 1234" value={form.plateNumber}
                onChange={e => setForm({ ...form, plateNumber: e.target.value.toUpperCase() })} />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">ห้องที่ติดต่อ *</label>
              <input className="w-full border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="เช่น A-101" value={form.contactRoom}
                onChange={e => setForm({ ...form, contactRoom: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">วัตถุประสงค์</label>
              <input className="w-full border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="เช่น ส่งของ, ซ่อมแซม" value={form.purpose}
                onChange={e => setForm({ ...form, purpose: e.target.value })} />
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => { setShowModal(false); setError(''); }}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors">ยกเลิก</button>
              <button onClick={handleCheckIn} disabled={saving}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
                {saving ? 'กำลังลงทะเบียน...' : 'ลงทะเบียนเข้า'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Visitors;