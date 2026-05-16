import { useEffect, useState, useCallback } from 'react';
import { Package, Plus, X, CheckCircle, RefreshCw, QrCode, Clock } from 'lucide-react';

const API = 'http://localhost:3000';

const Parcels = () => {
  const [parcels, setParcels]     = useState([]);
  const [lockerStatus, setLockerStatus] = useState(Array(12).fill(0));
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ userId: '', carrier: '', lockerNumber: '' });
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');
  const [users, setUsers]         = useState([]);
  const [filter, setFilter]       = useState('all'); // all | arrived | picked_up

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [usersRes, parcelsRes, lockerRes] = await Promise.all([
        fetch(`${API}/api/auth/users`).then(r => r.json()),
        fetch(`${API}/api/parcel/all`).then(r => r.json()),
        fetch(`${API}/api/parcel/status`).then(r => r.json()),
      ]);

      setUsers(Array.isArray(usersRes) ? usersRes : []);
      setParcels(parcelsRes.success ? parcelsRes.parcels : []);
      setLockerStatus(lockerRes.success ? lockerRes.lockerStatus : Array(12).fill(0));
    } catch (err) {
      console.error(err);
      setError('ไม่สามารถโหลดข้อมูลได้ กรุณาตรวจสอบการเชื่อมต่อ Backend');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [load]);

  const handleRegister = async () => {
    if (!form.userId || !form.lockerNumber) {
      setError('กรุณาระบุผู้รับและหมายเลข Locker');
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
        setSuccess(`✅ ${data.message}`);
        setShowModal(false);
        setForm({ userId: '', carrier: '', lockerNumber: '' });
        setTimeout(() => { setSuccess(''); load(); }, 2500);
      } else {
        setError(data.message || 'เกิดข้อผิดพลาด');
      }
    } catch (err) {
      setError('ไม่สามารถเชื่อมต่อ Backend ได้');
      setSaving(false);
    }
  };

  const handleMarkPickedUp = async (parcelId) => {
    if (!confirm('ยืนยันว่าลูกบ้านรับพัสดุแล้ว?')) return;
    try {
      const res = await fetch(`${API}/api/parcel/pickup/${parcelId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('✅ บันทึกการรับพัสดุแล้ว');
        setTimeout(() => { setSuccess(''); load(); }, 2000);
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาด');
    }
  };

  const statusColors = {
    arrived: 'bg-blue-100 text-blue-700',
    picked_up: 'bg-green-100 text-green-700',
  };
  const statusLabels = { arrived: 'รอรับ', picked_up: 'รับแล้ว' };

  const lockerColors = {
    0: 'bg-gray-50 text-gray-400 border border-gray-200',
    1: 'bg-blue-100 text-blue-700 border border-blue-300 cursor-pointer hover:shadow-md',
  };
  const lockerIcons = { 0: '🔓', 1: '📦' };

  const filteredParcels = filter === 'all' ? parcels
    : parcels.filter(p => p.status === filter);

  const getUserName = (userId) => {
    const u = users.find(u => u.user_id === userId);
    return u ? `${u.name} (${u.username})` : userId;
  };

  const formatDate = (iso) => {
    if (!iso) return '-';
    const d = new Date(iso);
    return `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()} ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
  };

  const arrivedCount = parcels.filter(p => p.status === 'arrived').length;
  const pickedCount = parcels.filter(p => p.status === 'picked_up').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">จัดการพัสดุ</h1>
          <p className="text-sm text-gray-500 mt-1">รอรับ {arrivedCount} รายการ • รับแล้ว {pickedCount} รายการ</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="flex items-center gap-1 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            <RefreshCw size={14} /> รีเฟรช
          </button>
          <button
            onClick={() => { setShowModal(true); setError(''); }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} /> ลงทะเบียนพัสดุ
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
          <CheckCircle size={16} /> {success}
        </div>
      )}

      {/* Locker Status */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">🗄 สถานะตู้เก็บพัสดุ (Real-time)</h2>
        <div className="grid grid-cols-6 gap-2">
          {lockerStatus.map((status, i) => (
            <div
              key={i}
              className={`p-3 rounded-lg text-center font-medium text-sm transition-all ${lockerColors[status] || 'bg-gray-50 text-gray-400'}`}
            >
              <div className="text-xl mb-1">{lockerIcons[status] || '🔓'}</div>
              <div className="font-bold">{i + 1}</div>
              <div className="text-xs mt-1">{status === 1 ? 'มีพัสดุ' : 'ว่าง'}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-4 text-xs text-gray-500">
          <span>📦 มีพัสดุรอรับ</span>
          <span>🔓 ว่าง</span>
        </div>
      </div>

      {/* Parcels List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Filter tabs */}
        <div className="flex border-b border-gray-100">
          {[['all','ทั้งหมด'], ['arrived','รอรับ'], ['picked_up','รับแล้ว']].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setFilter(val)}
              className={`px-6 py-3 text-sm font-medium transition-colors ${filter === val ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {label}
              {val === 'arrived' && arrivedCount > 0 && (
                <span className="ml-2 bg-blue-100 text-blue-600 text-xs rounded-full px-2 py-0.5">{arrivedCount}</span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-center text-gray-400 py-12">กำลังโหลด...</p>
        ) : filteredParcels.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Package size={48} className="mx-auto mb-4 opacity-40" />
            <p className="text-base font-medium">ไม่มีรายการพัสดุ</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500 uppercase">
                <th className="px-4 py-3 text-left">ผู้รับ</th>
                <th className="px-4 py-3 text-left">ขนส่ง</th>
                <th className="px-4 py-3 text-left">Locker</th>
                <th className="px-4 py-3 text-left">มาถึง</th>
                <th className="px-4 py-3 text-left">สถานะ</th>
                <th className="px-4 py-3 text-left">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredParcels.map(parcel => (
                <tr key={parcel.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">{getUserName(parcel.userId)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{parcel.carrier || '-'}</td>
                  <td className="px-4 py-3">
                    <span className="bg-gray-100 text-gray-700 text-xs font-bold px-2 py-1 rounded">
                      #{parcel.lockerNumber}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 flex items-center gap-1">
                    <Clock size={12} /> {formatDate(parcel.arrivedAt)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[parcel.status] || 'bg-gray-100'}`}>
                      {statusLabels[parcel.status] || parcel.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {parcel.status === 'arrived' && (
                      <button
                        onClick={() => handleMarkPickedUp(parcel.id)}
                        className="text-xs text-green-600 border border-green-200 px-3 py-1 rounded hover:bg-green-50 transition-colors"
                      >
                        ✓ ยืนยันรับแล้ว
                      </button>
                    )}
                    {parcel.status === 'picked_up' && (
                      <span className="text-xs text-gray-400">รับแล้ว {formatDate(parcel.pickedUpAt)}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Register */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">ลงทะเบียนพัสดุใหม่</h2>
              <button onClick={() => { setShowModal(false); setError(''); }}><X size={20} /></button>
            </div>

            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">{error}</div>}

            <div>
              <label className="text-xs text-gray-500 block mb-1">เลือกผู้รับ *</label>
              <select
                className="w-full border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.userId}
                onChange={e => setForm({ ...form, userId: e.target.value })}
              >
                <option value="">-- เลือกลูกบ้าน --</option>
                {users.filter(u => u.role !== 'admin').map(u => (
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
                placeholder="เช่น Kerry, Flash, Ninja Van, J&T"
                value={form.carrier}
                onChange={e => setForm({ ...form, carrier: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs text-gray-500 block mb-1">หมายเลข Locker *</label>
              <select
                className="w-full border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.lockerNumber}
                onChange={e => setForm({ ...form, lockerNumber: e.target.value })}
              >
                <option value="">-- เลือกตู้ที่ว่าง --</option>
                {Array.from({ length: 12 }).map((_, i) => {
                  const occupied = lockerStatus[i] === 1;
                  return (
                    <option key={i + 1} value={i + 1} disabled={occupied}>
                      Locker #{i + 1} {occupied ? '(ใช้งานอยู่)' : '(ว่าง)'}
                    </option>
                  );
                })}
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
                {saving ? 'กำลังลงทะเบียน...' : '📦 ลงทะเบียน + แจ้งเตือน'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Parcels;
