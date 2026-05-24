import { useEffect, useState, useCallback } from 'react';
import { Package, Plus, X, CheckCircle, RefreshCw, Clock, Search, MoreHorizontal, Home, Box, Truck } from 'lucide-react';

const API = 'http://localhost:3000';

const Parcels = () => {
  const [parcels, setParcels] = useState([]);
  const [lockerStatus, setLockerStatus] = useState(Array(12).fill(0));
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ userId: '', carrier: '', lockerNumber: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [users, setUsers] = useState([]);

  // UI States ใหม่
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // ✅ เปลี่ยนจาก Dropdown มาใช้ Tab: 'all', 'arrived', 'picked_up'
  const [actionMenuOpenId, setActionMenuOpenId] = useState(null);

  // 1. Logic ดึงข้อมูล
  const load = useCallback(async () => {
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

  // 2. Logic ลงทะเบียนพัสดุ
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

  // 3. Logic รับพัสดุ
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
        setActionMenuOpenId(null);
        setTimeout(() => { setSuccess(''); load(); }, 2000);
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาด');
    }
  };

  // Helper Functions
  const getUserDetails = (userId) => {
    const u = users.find(u => u.user_id === userId);
    return u ? { name: u.name, room: u.username } : { name: userId, room: 'Unknown Room' };
  };

  const formatDate = (iso) => {
    if (!iso) return '-';
    const d = new Date(iso);
    return d.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  // คำนวณสถิติ
  const arrivedCount = parcels.filter(p => p.status === 'arrived').length;
  const pickedCount = parcels.filter(p => p.status === 'picked_up').length;

  // กรองตาราง
  const filteredParcels = parcels.filter(p => {
    const user = getUserDetails(p.userId);
    const matchSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.room.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.carrier?.toLowerCase().includes(searchTerm.toLowerCase());

    let matchStatus = true;
    if (activeTab === 'arrived') matchStatus = p.status === 'arrived';
    if (activeTab === 'picked_up') matchStatus = p.status === 'picked_up';

    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 pb-8 font-sans relative">

      {/* Invisible Overlay สำหรับ Dropdown 3 จุด */}
      {actionMenuOpenId && (
        <div className="fixed inset-0 z-10" onClick={() => setActionMenuOpenId(null)}></div>
      )}

      {/* ── 1. Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 relative z-0">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
            <Home size={14} /> <span>/</span> <span>Parcels</span>
          </div>
          <h1 className="text-4xl font-serif font-bold text-slate-800">Parcel Management</h1>
        </div>
        <button
          onClick={() => { setShowModal(true); setError(''); }}
          className="flex items-center gap-2 bg-[#FBBF24] hover:bg-[#F59E0B] text-slate-900 px-6 py-2.5 rounded-full font-semibold transition-colors active:scale-95 shadow-sm shadow-amber-200/50"
        >
          <Box size={18} /> Register Parcel
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm relative z-0">{error}</div>}
      {success && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm relative z-0">{success}</div>}

      {/* ── 2. Stat Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-0">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-slate-50 rounded-bl-full"></div>
          <p className="text-[10px] font-bold text-slate-400 tracking-[0.1em] mb-2 uppercase">TOTAL PARCELS</p>
          <h3 className="text-4xl font-serif font-bold text-slate-800">{parcels.length}</h3>
        </div>

        <div className="bg-[#FFF9F2] p-6 rounded-2xl shadow-sm border border-[#FDE6D5] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-[#FDE6D5] rounded-bl-full"></div>
          <p className="text-[10px] font-bold text-slate-500 tracking-[0.1em] mb-2 uppercase">AWAITING PICKUP</p>
          <h3 className="text-4xl font-serif font-bold text-[#D97706]">{arrivedCount}</h3>
        </div>

        <div className="bg-[#F6FAF7] p-6 rounded-2xl shadow-sm border border-[#E5F3EB] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-[#E5F3EB] rounded-bl-full"></div>
          <p className="text-[10px] font-bold text-slate-500 tracking-[0.1em] mb-2 uppercase">PICKED UP</p>
          <h3 className="text-4xl font-serif font-bold text-[#059669]">{pickedCount}</h3>
        </div>
      </div>

      {/* ── 3. Locker Status Grid ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 relative z-0">
        <div className="flex items-center gap-2 mb-1">
          <div className="bg-amber-100 p-1.5 rounded-lg"><Box size={16} className="text-amber-600" /></div>
          <h2 className="text-lg font-bold text-slate-800">Locker Status</h2>
        </div>
        <p className="text-sm text-slate-500 mb-6 ml-9">Real-time availability</p>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {lockerStatus.map((status, i) => {
            const occupied = status === 1;
            return (
              <div key={i} className={`flex flex-col items-center justify-center py-4 rounded-xl border transition-all ${occupied
                  ? 'border-amber-400 bg-amber-50/50 text-amber-600'
                  : 'border-slate-200 bg-slate-50/50 text-slate-400'
                }`}>
                <Box size={24} className={`mb-2 ${occupied ? 'text-amber-500' : 'text-slate-300'}`} />
                <span className={`text-lg font-bold leading-none ${occupied ? 'text-amber-600' : 'text-slate-400'}`}>{i + 1}</span>
                <span className="text-[10px] uppercase font-bold tracking-wider mt-1">{occupied ? 'Occupied' : 'Empty'}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 4. Toolbar แคปซูล (เหลือแค่ Search) ── */}
      <div className="bg-white rounded-full shadow-sm border border-slate-100 flex items-center p-1.5 focus-within:ring-2 focus-within:ring-amber-400/50 transition-all relative z-20">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by recipient, room, or parcel ID..."
            className="w-full pl-12 pr-4 py-2.5 bg-transparent border-none rounded-full text-sm focus:outline-none focus:ring-0"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* ── 5. ตาราง Parcels พร้อม ✅ แถบ Tab แบบใหม่ ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-visible relative z-10 pt-2">

        {/* ✅ Tab Navigation แบบมีเส้นใต้และ Notification Badge */}
        <div className="flex border-b border-slate-100 px-4 md:px-6 mb-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`pb-3 px-4 text-sm font-semibold transition-colors relative ${activeTab === 'all' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            All Parcels
          </button>

          <button
            onClick={() => setActiveTab('arrived')}
            className={`pb-3 px-4 text-sm font-semibold transition-colors relative flex items-center gap-2 ${activeTab === 'arrived' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            Awaiting Pickup
            {/* 🔴 ตัวเลขแจ้งเตือน (Badge) */}
            {arrivedCount > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${activeTab === 'arrived' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                }`}>
                {arrivedCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('picked_up')}
            className={`pb-3 px-4 text-sm font-semibold transition-colors relative ${activeTab === 'picked_up' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            Picked Up
          </button>
        </div>

        {loading ? (
          <p className="text-center text-slate-400 py-12">Loading parcels...</p>
        ) : filteredParcels.length === 0 ? (
          <p className="text-center text-slate-400 py-12">No parcels found in this category.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-slate-50/50 border-y border-slate-100">
                <tr className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                  <th className="px-6 py-4">Parcel ID</th>
                  <th className="px-6 py-4">Recipient & Room</th>
                  <th className="px-6 py-4">Carrier</th>
                  <th className="px-6 py-4 text-center">Locker</th>
                  <th className="px-6 py-4">Arrived</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredParcels.map((p, i) => {
                  const user = getUserDetails(p.userId);
                  const isAwaiting = p.status === 'arrived';
                  const displayId = p.id ? `PKG-${p.id.substring(0, 3).toUpperCase()}` : `PKG-00${i + 1}`;

                  return (
                    <tr key={p.id || i} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-bold text-amber-500">{displayId}</td>

                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800">{user.name}</div>
                        <div className="text-xs text-slate-500 mt-0.5">Room {user.room}</div>
                      </td>

                      <td className="px-6 py-4 text-slate-700 font-medium">
                        <div className="flex items-center gap-2">
                          <Truck size={14} className="text-slate-400" /> {p.carrier || 'Unknown'}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <span className="inline-block px-3 py-1 bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold rounded-full">
                          #{p.lockerNumber}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-slate-500 text-xs">{formatDate(p.arrivedAt)}</td>

                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold border flex items-center w-fit gap-1.5 ${isAwaiting
                            ? 'bg-amber-50/50 border-amber-200 text-amber-600'
                            : 'bg-emerald-50/50 border-emerald-200 text-emerald-600'
                          }`}>
                          <Clock size={10} /> {isAwaiting ? 'Awaiting Pickup' : 'Picked Up'}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-center relative" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={(e) => { e.stopPropagation(); setActionMenuOpenId(actionMenuOpenId === p.id ? null : p.id); }}
                          className={`p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded-full transition-colors ${actionMenuOpenId === p.id ? 'bg-slate-100 text-slate-700' : ''}`}
                        >
                          <MoreHorizontal size={18} />
                        </button>

                        {actionMenuOpenId === p.id && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setActionMenuOpenId(null); }}></div>
                            <div className="absolute right-12 top-10 w-44 bg-white border border-slate-100 shadow-xl rounded-xl z-50 py-1.5 text-left overflow-hidden">
                              {isAwaiting ? (
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleMarkPickedUp(p.id); }}
                                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-emerald-600 hover:bg-emerald-50 transition-colors"
                                >
                                  <CheckCircle size={16} className="text-emerald-400" /> Mark Picked Up
                                </button>
                              ) : (
                                <div className="px-4 py-2.5 text-xs text-slate-400 text-center italic">Already picked up</div>
                              )}
                            </div>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <div className="p-4 border-t border-slate-100 text-xs text-slate-400 font-medium italic bg-slate-50/50 rounded-b-2xl">
          Showing {filteredParcels.length} of {parcels.length} parcels
        </div>
      </div>

      {/* ── 6. Modal ลงทะเบียนพัสดุใหม่ ── */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-serif font-bold text-slate-800">Register Parcel</h2>
              <button onClick={() => { setShowModal(false); setError(''); }} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>

            {error && <p className="bg-red-50 text-red-600 p-3 rounded-xl text-xs mb-4 border border-red-100">{error}</p>}

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Select Resident *</label>
                <select className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-400 focus:bg-white outline-none transition-all text-slate-700"
                  value={form.userId} onChange={e => setForm({ ...form, userId: e.target.value })}>
                  <option value="">-- Choose Resident --</option>
                  {users.filter(u => u.role !== 'admin').map(u => (
                    <option key={u.user_id} value={u.user_id}>{u.name} ({u.username})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Carrier Company</label>
                <input className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-400 focus:bg-white outline-none transition-all text-slate-700"
                  placeholder="e.g. Kerry Express, Flash, J&T" value={form.carrier} onChange={e => setForm({ ...form, carrier: e.target.value })} />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Assign Locker *</label>
                <select className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-400 focus:bg-white outline-none transition-all text-slate-700"
                  value={form.lockerNumber} onChange={e => setForm({ ...form, lockerNumber: e.target.value })}>
                  <option value="">-- Select Empty Locker --</option>
                  {Array.from({ length: 12 }).map((_, i) => {
                    const occupied = lockerStatus[i] === 1;
                    return (
                      <option key={i + 1} value={i + 1} disabled={occupied}>
                        Locker #{i + 1} {occupied ? '(Occupied)' : '(Empty)'}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-8">
              <button onClick={() => { setShowModal(false); setError(''); }}
                className="w-1/3 bg-slate-100 text-slate-700 py-2.5 rounded-xl hover:bg-slate-200 transition-colors font-semibold text-sm active:scale-95">Cancel</button>
              <button onClick={handleRegister} disabled={saving}
                className="flex-1 flex justify-center items-center gap-2 bg-[#FBBF24] hover:bg-[#F59E0B] text-slate-900 py-2.5 rounded-xl transition-colors font-semibold text-sm shadow-sm disabled:opacity-50 active:scale-95">
                {saving ? 'Registering...' : <><Box size={16} /> Save & Notify</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Parcels;
