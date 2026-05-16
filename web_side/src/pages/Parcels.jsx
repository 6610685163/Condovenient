import { useEffect, useState } from 'react';
import { Package, Plus, X, CheckCircle } from 'lucide-react';

const API = 'http://localhost:3000';

const Parcels = () => {
  const [parcels, setParcels]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [form, setForm] = useState({ userId: '', carrier: '', lockerNumber: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [users, setUsers] = useState([]);

  const load = () => {
    setLoading(true);
    setError('');
    Promise.all([
      fetch(`${API}/api/auth/users`).then(r => r.json()),
    ])
    .then(([usersData]) => {
      setUsers(Array.isArray(usersData) ? usersData : []);
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setError('ไม่สามารถโหลดข้อมูลได้');
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  const handleRegister = async () => {
    if (!form.userId || !form.lockerNumber) {
      setError('กรุณาระบุผู้ใช้และหมายเลข Locker');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const res = await fetch(`${API}/api/parcel/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setSaving(false);
      
      if (data.success) {
        setSuccess('ลงทะเบียนพัสดุและส่งการแจ้งเตือนให้ลูกบ้านแล้ว');
        setShowModal(false);
        setForm({ userId: '', carrier: '', lockerNumber: '' });
        setTimeout(() => {
          setSuccess('');
          load();
        }, 2000);
      } else {
        setError(data.message || 'เกิดข้อผิดพลาด');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการสื่อสารกับเซิร์ฟเวอร์');
      setSaving(false);
    }
  };

  const getLockerStatus = (lockerId) => {
    const status = [1, 0, 2, 0, 0, 1, 2, 0, 0, 2, 0, 0];
    // 0 = empty, 1 = occupied, 2 = pending
    return status[parseInt(lockerId) - 1] || 0;
  };

  const statusLabel = { 0: 'ว่าง', 1: 'ใช้งาน', 2: 'รอรับ' };
  const statusColor = { 0: 'bg-green-100 text-green-700', 1: 'bg-blue-100 text-blue-700', 2: 'bg-yellow-100 text-yellow-700' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">จัดการพัสดุ</h1>
        <button
          onClick={() => { setShowModal(true); setError(''); }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} /> ลงทะเบียนพัสดุ
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
          <CheckCircle size={18} />
          {success}
        </div>
      )}

      {/* Locker Status Display */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">สถานะตู้เก็บพัสดุ</h2>
        <div className="grid grid-cols-6 gap-2">
          {Array.from({ length: 12 }).map((_, i) => {
            const status = getLockerStatus((i + 1).toString());
            return (
              <div
                key={i}
                className={`p-4 rounded-lg text-center font-medium text-sm cursor-pointer transition-all hover:shadow-lg ${
                  statusColor[status] || 'bg-gray-100'
                }`}
              >
                <div className="text-2xl mb-1">{i + 1}</div>
                <div className="text-xs">{statusLabel[status]}</div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 text-xs text-gray-600 space-y-1">
          <p>🟢 ว่าง - สามารถใช้งานได้</p>
          <p>🔵 ใช้งาน - มีพัสดุอยู่</p>
          <p>🟡 รอรับ - รอลูกบ้านมารับ</p>
        </div>
      </div>

      {/* Parcels List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <p className="text-center text-gray-400 py-12">กำลังโหลด...</p>
        ) : (
          <div className="p-6 text-center text-gray-400">
            <Package size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">ระบบจัดการพัสดุ</p>
            <p className="text-sm mt-2">กดปุ่ม "ลงทะเบียนพัสดุ" เพื่อเพิ่มพัสดุใหม่</p>
          </div>
        )}
      </div>

      {/* Modal Register Parcel */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">ลงทะเบียนพัสดุใหม่</h2>
              <button onClick={() => { setShowModal(false); setError(''); }}><X size={20} /></button>
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="text-xs text-gray-500 block mb-1">เลือกผู้รับ *</label>
              <select
                className="w-full border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.userId}
                onChange={e => setForm({ ...form, userId: e.target.value })}
              >
                <option value="">-- เลือกลูกบ้าน --</option>
                {users.map(u => (
                  <option key={u.user_id} value={u.user_id}>
                    {u.name} ({u.username})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-500 block mb-1">บริษัทขนส่ง</label>
              <input
                className="w-full border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="เช่น Kerry, Flash, Ninja Van"
                value={form.carrier}
                onChange={e => setForm({ ...form, carrier: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs text-gray-500 block mb-1">หมายเลข Locker (1-12) *</label>
              <select
                className="w-full border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.lockerNumber}
                onChange={e => setForm({ ...form, lockerNumber: e.target.value })}
              >
                <option value="">-- เลือกตู้ --</option>
                {Array.from({ length: 12 }).map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    Locker #{i + 1}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => { setShowModal(false); setError(''); }}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleRegister}
                disabled={saving}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'กำลังลงทะเบียน...' : 'ลงทะเบียน'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Parcels;
