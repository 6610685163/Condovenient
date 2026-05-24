import { useEffect, useState, useCallback } from 'react';
import { Plus, X, Clock, Search, MoreHorizontal, Home, UserCheck, Car, LogOut, CheckCircle, AlertTriangle } from 'lucide-react';

const API = 'http://localhost:3000';

// ดึงข้อมูล admin ที่ล็อกอินอยู่จาก localStorage
const getCurrentAdmin = () => {
  try {
    const raw = localStorage.getItem('user_token');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

const Visitors = () => {
  const [visitors, setVisitors] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ visitorName: '', plateNumber: '', contactRoom: '', purpose: 'Guest' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // UI States ใหม่
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('inside'); // 'inside' | 'history'
  const [actionMenuOpenId, setActionMenuOpenId] = useState(null);

  const admin = getCurrentAdmin();

  // 1. โหลดข้อมูลคนที่อยู่ด้านใน (Active)
  const loadVisitors = useCallback(() => {
    setError('');
    fetch(`${API}/api/visitors/active`)
      .then(r => r.json())
      .then(data => { setVisitors(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => { setError('ไม่สามารถโหลดข้อมูลได้'); setLoading(false); });
  }, []);

  // 2. โหลดข้อมูลประวัติ (History)
  const loadHistory = useCallback(() => {
    fetch(`${API}/api/visitors/history`)
      .then(r => r.json())
      .then(data => { setHistory(Array.isArray(data) ? data : []); setHistoryLoaded(true); })
      .catch(console.error);
  }, []);

  useEffect(() => {
    loadVisitors();
    const interval = setInterval(loadVisitors, 30000);
    return () => clearInterval(interval);
  }, [loadVisitors]);

  // เมื่อเปลี่ยน Tab เป็นประวัติ ให้โหลดข้อมูลถ้ายังไม่ได้โหลด
  useEffect(() => {
    if (activeTab === 'history' && !historyLoaded) {
      loadHistory();
    }
  }, [activeTab, historyLoaded, loadHistory]);

  // 3. ลงทะเบียนเข้า
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
          addedBy: admin?.name || admin?.username || 'Admin',
        }),
      });
      const data = await res.json();
      setSaving(false);
      if (res.ok) {
        setSuccess(`✅ ลงทะเบียนเข้าสำเร็จ`);
        setShowModal(false);
        setForm({ visitorName: '', plateNumber: '', contactRoom: '', purpose: 'Guest' });
        setTimeout(() => { setSuccess(''); loadVisitors(); }, 1500);
      } else {
        setError(data.error || data.message || 'เกิดข้อผิดพลาด');
      }
    } catch { setError('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้'); setSaving(false); }
  };

  // 4. ลงทะเบียนออก
  const handleCheckOut = async (visitorId) => {
    if (!confirm('ยืนยันการลงทะเบียนออก?')) return;
    try {
      const res = await fetch(`${API}/api/visitors/check-out/${visitorId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('✅ ลงทะเบียนออกเรียบร้อยแล้ว');
        setActionMenuOpenId(null);
        setTimeout(() => {
          setSuccess('');
          loadVisitors();
          if (historyLoaded) loadHistory();
        }, 1500);
      } else {
        setError(data.error || data.message || 'เกิดข้อผิดพลาด');
      }
    } catch { setError('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้'); }
  };

  // Helpers
  const formatTime = (timestamp) => {
    if (!timestamp) return '-';
    try {
      const date = timestamp._seconds ? new Date(timestamp._seconds * 1000) : new Date(timestamp);
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } catch { return '-'; }
  };

  const isOverstaying = (checkInTime) => {
    if (!checkInTime) return false;
    const date = checkInTime._seconds ? new Date(checkInTime._seconds * 1000) : new Date(checkInTime);
    const diffHours = (new Date() - date) / (1000 * 60 * 60);
    return diffHours > 8; // สมมติว่าเกิน 8 ชม. คือ Overstaying
  };

  const getPurposeStyle = (purpose) => {
    const p = purpose?.toLowerCase() || '';
    if (p.includes('delivery') || p.includes('ส่งของ')) return 'bg-blue-50 border-blue-200 text-blue-600';
    if (p.includes('contractor') || p.includes('ซ่อม')) return 'bg-orange-50 border-orange-200 text-orange-600';
    if (p.includes('guest') || p.includes('เยี่ยม')) return 'bg-purple-50 border-purple-200 text-purple-600';
    return 'bg-slate-50 border-slate-200 text-slate-600';
  };

  // รวมข้อมูลและกรองตาม Tab และ Search
  const currentData = activeTab === 'inside' ? visitors : history;
  const filteredVisitors = currentData.filter(v => {
    const matchSearch =
      v.visitorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.plateNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.contactRoom?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSearch;
  });

  const overstayCount = visitors.filter(v => isOverstaying(v.checkInTime)).length;

  return (
    <div className="space-y-6 pb-8 font-sans relative">

      {actionMenuOpenId && (
        <div className="fixed inset-0 z-10" onClick={() => setActionMenuOpenId(null)}></div>
      )}

      {/* ── 1. Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 relative z-0">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
            <Home size={14} /> <span>/</span> <span>Visitors</span>
          </div>
          <h1 className="text-4xl font-serif font-bold text-slate-800">Visitor Management</h1>
        </div>
        <button
          onClick={() => { setShowModal(true); setError(''); }}
          className="flex items-center gap-2 bg-[#FBBF24] hover:bg-[#F59E0B] text-slate-900 px-6 py-2.5 rounded-full font-semibold transition-colors active:scale-95 shadow-sm shadow-amber-200/50"
        >
          <UserCheck size={18} /> Check-in Visitor
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm relative z-0">{error}</div>}
      {success && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm relative z-0">{success}</div>}

      {/* ── 2. Stat Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-0">
        <div className="bg-[#FFF9F2] p-6 rounded-2xl shadow-sm border border-[#FDE6D5] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-[#FDE6D5] rounded-bl-full"></div>
          <p className="text-[10px] font-bold text-slate-500 tracking-[0.1em] mb-2 uppercase">CURRENTLY INSIDE</p>
          <h3 className="text-4xl font-serif font-bold text-[#D97706]">{visitors.length}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-slate-50 rounded-bl-full"></div>
          <p className="text-[10px] font-bold text-slate-400 tracking-[0.1em] mb-2 uppercase">TOTAL VISITORS TODAY</p>
          <h3 className="text-4xl font-serif font-bold text-slate-800">{visitors.length + history.length}</h3>
        </div>

        <div className="bg-[#FFF1F2] p-6 rounded-2xl shadow-sm border border-[#FFE4E6] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-[#FFE4E6] rounded-bl-full"></div>
          <p className="text-[10px] font-bold text-slate-500 tracking-[0.1em] mb-2 uppercase">OVERSTAYING (&gt;8 HRS)</p>
          <h3 className="text-4xl font-serif font-bold text-[#E11D48]">{overstayCount}</h3>
        </div>
      </div>

      {/* ── 3. Toolbar (Search Only) ── */}
      <div className="bg-white rounded-full shadow-sm border border-slate-100 flex items-center p-1.5 focus-within:ring-2 focus-within:ring-amber-400/50 transition-all relative z-20">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by name, license plate, or room..."
            className="w-full pl-12 pr-4 py-2.5 bg-transparent border-none rounded-full text-sm focus:outline-none focus:ring-0"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* ── 4. ตาราง Visitors พร้อม Tabs ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-visible relative z-10 pt-2">

        {/* Tabs */}
        <div className="flex border-b border-slate-100 px-4 md:px-6 mb-2">
          <button
            onClick={() => setActiveTab('inside')}
            className={`pb-3 px-4 text-sm font-semibold transition-colors relative flex items-center gap-2 ${activeTab === 'inside' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            Currently Inside
            {visitors.length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${activeTab === 'inside' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                }`}>{visitors.length}</span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 px-4 text-sm font-semibold transition-colors relative flex items-center gap-2 ${activeTab === 'history' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            History (Checked Out)
          </button>
        </div>

        {loading ? (
          <p className="text-center text-slate-400 py-12">Loading visitors...</p>
        ) : filteredVisitors.length === 0 ? (
          <p className="text-center text-slate-400 py-12">No visitors found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-slate-50/50 border-y border-slate-100">
                <tr className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                  <th className="px-6 py-4">Visitor Name</th>
                  <th className="px-6 py-4">License Plate</th>
                  <th className="px-6 py-4">Target Room</th>
                  <th className="px-6 py-4">Purpose</th>
                  <th className="px-6 py-4">Time In</th>
                  <th className="px-6 py-4">Time Out</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredVisitors.map((v, i) => {
                  const isHistory = activeTab === 'history';
                  const overstay = !isHistory && isOverstaying(v.checkInTime);

                  return (
                    <tr key={v.id || i} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-800">{v.visitorName}</td>

                      <td className="px-6 py-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-slate-300 rounded-lg bg-white shadow-sm font-bold text-slate-700 text-xs tracking-wider">
                          <Car size={14} className="text-slate-400" />
                          {v.plateNumber}
                        </div>
                      </td>

                      <td className="px-6 py-4 font-bold text-amber-600">{v.contactRoom}</td>

                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getPurposeStyle(v.purpose)}`}>
                          {v.purpose || 'Guest'}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-slate-600 font-medium flex items-center gap-1.5 mt-2.5">
                        <Clock size={14} className="text-slate-400" /> {formatTime(v.checkInTime)}
                      </td>

                      <td className="px-6 py-4 text-slate-400 font-medium">
                        {isHistory ? formatTime(v.checkOutTime) : '—'}
                      </td>

                      <td className="px-6 py-4">
                        {isHistory ? (
                          <span className="px-3 py-1 rounded-full text-[10px] font-bold border bg-slate-50 border-slate-200 text-slate-600 flex items-center w-fit gap-1.5">
                            <LogOut size={10} /> Checked Out
                          </span>
                        ) : overstay ? (
                          <span className="px-3 py-1 rounded-full text-[10px] font-bold border bg-rose-50 border-rose-200 text-rose-600 flex items-center w-fit gap-1.5">
                            <AlertTriangle size={10} /> Overstaying
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-[10px] font-bold border bg-emerald-50 border-emerald-200 text-emerald-600 flex items-center w-fit gap-1.5">
                            <CheckCircle size={10} /> Inside
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-center relative" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={(e) => { e.stopPropagation(); setActionMenuOpenId(actionMenuOpenId === v.id ? null : v.id); }}
                          className={`p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded-full transition-colors ${actionMenuOpenId === v.id ? 'bg-slate-100 text-slate-700' : ''}`}
                        >
                          <MoreHorizontal size={18} />
                        </button>

                        {actionMenuOpenId === v.id && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setActionMenuOpenId(null); }}></div>
                            <div className="absolute right-12 top-10 w-44 bg-white border border-slate-100 shadow-xl rounded-xl z-50 py-1.5 text-left overflow-hidden">
                              {!isHistory ? (
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleCheckOut(v.id); }}
                                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-orange-600 hover:bg-orange-50 transition-colors"
                                >
                                  <LogOut size={16} className="text-orange-400" /> Check Out
                                </button>
                              ) : (
                                <div className="px-4 py-2.5 text-xs text-slate-400 text-center italic">No actions available</div>
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
          Showing {filteredVisitors.length} visitors
        </div>
      </div>

      {/* ── 5. Modal ลงทะเบียนเข้า (Check-in) ── */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-serif font-bold text-slate-800">Check-in Visitor</h2>
              <button onClick={() => { setShowModal(false); setError(''); }} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>

            {error && <p className="bg-red-50 text-red-600 p-3 rounded-xl text-xs mb-4 border border-red-100">{error}</p>}

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Visitor Name *</label>
                <input className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-400 focus:bg-white outline-none transition-all text-slate-700"
                  placeholder="e.g. Somsak Thongchai" value={form.visitorName} onChange={e => setForm({ ...form, visitorName: e.target.value })} />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">License Plate *</label>
                <div className="relative">
                  <Car className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input className="w-full border border-slate-200 bg-slate-50 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-400 focus:bg-white outline-none transition-all text-slate-700 uppercase"
                    placeholder="e.g. กข 1234" value={form.plateNumber} onChange={e => setForm({ ...form, plateNumber: e.target.value.toUpperCase() })} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Target Room *</label>
                  <input className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-400 focus:bg-white outline-none transition-all text-slate-700 font-bold text-amber-600"
                    placeholder="e.g. A-1201" value={form.contactRoom} onChange={e => setForm({ ...form, contactRoom: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Purpose</label>
                  <select className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-400 focus:bg-white outline-none transition-all text-slate-700"
                    value={form.purpose} onChange={e => setForm({ ...form, purpose: e.target.value })}>
                    <option value="Guest">Guest (เยี่ยมเยียน)</option>
                    <option value="Delivery">Delivery (ส่งของ)</option>
                    <option value="Contractor">Contractor (ช่าง)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-8">
              <button onClick={() => { setShowModal(false); setError(''); }}
                className="w-1/3 bg-slate-100 text-slate-700 py-2.5 rounded-xl hover:bg-slate-200 transition-colors font-semibold text-sm active:scale-95">Cancel</button>
              <button onClick={handleCheckIn} disabled={saving}
                className="flex-1 flex justify-center items-center gap-2 bg-[#FBBF24] hover:bg-[#F59E0B] text-slate-900 py-2.5 rounded-xl transition-colors font-semibold text-sm shadow-sm disabled:opacity-50 active:scale-95">
                {saving ? 'Processing...' : <><UserCheck size={16} /> Confirm Check-in</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Visitors;
