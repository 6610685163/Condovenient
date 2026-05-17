import { useEffect, useState } from 'react';
import { Plus, X, Search, Filter, MoreHorizontal, Home, ChevronDown, Flag, Clock, Wrench, CheckCircle, Eye, AlertTriangle } from 'lucide-react';

const API = 'http://localhost:3000';

const Repairs = () => {
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // States สำหรับ Modals
  const [detailRepair, setDetailRepair] = useState(null);
  const [selectedAssign, setSelectedAssign] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // States ฟอร์มต่างๆ
  const [techName, setTechName] = useState('');
  const [techId, setTechId] = useState('');
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState('');

  // UI States สำหรับ Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [priorityFilter, setPriorityFilter] = useState('All Priority');
  const [filterTypeOpen, setFilterTypeOpen] = useState(null); // 'status' หรือ 'priority'
  const [actionMenuOpenId, setActionMenuOpenId] = useState(null);

  // 1. ดึงข้อมูล
  const load = () => {
    setLoading(true); setError('');
    fetch(`${API}/api/repair/list`)
      .then(r => r.json())
      .then(data => { setRepairs(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => { setError('ไม่สามารถโหลดข้อมูลได้'); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  // 2. มอบหมายช่าง (Assign)
  const handleAssign = async () => {
    if (!techName) { setError('กรุณาระบุชื่อช่าง'); return; }
    setSaving(true); setError('');
    try {
      const res = await fetch(`${API}/api/repair/assign/${selectedAssign.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ technicianId: techId || 'tech-auto', technicianName: techName }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('มอบหมายช่างเรียบร้อยแล้ว');
        setSelectedAssign(null); setTechName(''); setTechId('');
        setTimeout(() => { setSuccess(''); load(); }, 1500);
      } else { setError(data.error || 'เกิดข้อผิดพลาด'); }
    } catch { setError('เกิดข้อผิดพลาดในการสื่อสารกับเซิร์ฟเวอร์'); }
    setSaving(false);
  };

  // 3. ปิดงานซ่อม (Close)
  const handleClose = async (id, overrideNote = '') => {
    if (!confirm('ยืนยันการปิดงานซ่อมนี้?')) return;
    try {
      const res = await fetch(`${API}/api/repair/close/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completionNote: overrideNote || note || 'งานเสร็จสิ้น', imageAfterUrl: '' }),
      });
      if (res.ok) {
        setSuccess('ปิดงานซ่อมเรียบร้อยแล้ว');
        setNote(''); setDetailRepair(null); setActionMenuOpenId(null);
        setTimeout(() => { setSuccess(''); load(); }, 1500);
      } else {
        const data = await res.json();
        setError(data.error || 'เกิดข้อผิดพลาด');
      }
    } catch { setError('เกิดข้อผิดพลาดในการสื่อสารกับเซิร์ฟเวอร์'); }
  };

  // Helpers สำหรับสีและป้าย (อิงตาม Design ใหม่)
  const getStatusDisplay = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return { label: 'Completed', cls: 'bg-[#E8F5E9] text-[#2E7D32]' };
      case 'assigned': return { label: 'In Progress', cls: 'bg-blue-50 text-blue-600' };
      case 'pending': return { label: 'Pending', cls: 'bg-[#FEF3D8] text-[#9A6B01]' };
      default: return { label: status || 'Unknown', cls: 'bg-slate-100 text-slate-600' };
    }
  };

  const getPriorityDisplay = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'urgent': return { label: 'Urgent', cls: 'border-red-200 text-red-600 bg-red-50/50', icon: <AlertTriangle size={12} /> };
      case 'high': return { label: 'High', cls: 'border-orange-200 text-orange-600 bg-orange-50/50', icon: <Flag size={12} /> };
      case 'medium':
      case 'normal': return { label: 'Medium', cls: 'border-blue-200 text-blue-600 bg-blue-50/50', icon: null };
      case 'low': return { label: 'Low', cls: 'border-slate-200 text-slate-600 bg-slate-50/50', icon: null };
      default: return { label: 'Normal', cls: 'border-slate-200 text-slate-600 bg-slate-50/50', icon: null };
    }
  };

  const formatDateShort = (ts) => {
    if (!ts) return '-';
    try {
      const d = ts._seconds ? new Date(ts._seconds * 1000) : new Date(ts);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch { return '-'; }
  };

  // คำนวณข้อมูลสำหรับ Stat Cards
  const highPriorityCount = repairs.filter(r => r.priority === 'high' || r.priority === 'urgent').length;
  const pendingReviewCount = repairs.filter(r => r.status === 'pending').length;
  const completedCount = repairs.filter(r => r.status === 'completed').length;

  // กรองข้อมูลตาราง
  const filteredRepairs = repairs.filter(r => {
    const matchSearch = r.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.roomNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.id?.toLowerCase().includes(searchTerm.toLowerCase());

    // แปลงสถานะ assigned ให้ตรงกับคำว่า in progress ในฟิลเตอร์
    const mappedStatus = r.status === 'assigned' ? 'in progress' : r.status;
    const matchStatus = statusFilter === 'All Status' || mappedStatus === statusFilter.toLowerCase();

    const mappedPriority = (r.priority === 'normal' ? 'medium' : r.priority) || 'medium';
    const matchPriority = priorityFilter === 'All Priority' || mappedPriority === priorityFilter.toLowerCase();

    return matchSearch && matchStatus && matchPriority;
  });

  return (
    <div className="space-y-6 pb-8 font-sans relative">

      {/* Invisible Overlay สำหรับปิด Dropdowns */}
      {(filterTypeOpen || actionMenuOpenId) && (
        <div className="fixed inset-0 z-10" onClick={() => { setFilterTypeOpen(null); setActionMenuOpenId(null); }}></div>
      )}

      {/* ── 1. Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 relative z-0">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
            <Home size={14} /> <span>/</span> <span>Maintenance</span>
          </div>
          <h1 className="text-4xl font-serif font-bold text-slate-800">Maintenance Requests</h1>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-[#FBBF24] hover:bg-[#F59E0B] text-slate-900 px-6 py-2.5 rounded-full font-semibold transition-colors active:scale-95 shadow-sm shadow-amber-200/50"
        >
          <Plus size={18} /> New Request
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm relative z-0">{error}</div>}
      {success && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm relative z-0">{success}</div>}

      {/* ── 2. Stat Cards (ตาม Design) ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-0">
        {/* High Priority (Pink) */}
        <div className="bg-[#FFF1F2] p-6 rounded-2xl shadow-sm border border-[#FFE4E6] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-[#FFE4E6] rounded-bl-full"></div>
          <p className="text-[10px] font-bold text-slate-500 tracking-[0.1em] mb-2 uppercase">HIGH PRIORITY</p>
          <h3 className="text-4xl font-serif font-bold text-[#E11D48]">{highPriorityCount}</h3>
        </div>

        {/* Pending Review (Orange) */}
        <div className="bg-[#FFF9F2] p-6 rounded-2xl shadow-sm border border-[#FDE6D5] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-[#FDE6D5] rounded-bl-full"></div>
          <p className="text-[10px] font-bold text-slate-500 tracking-[0.1em] mb-2 uppercase">PENDING REVIEW</p>
          <h3 className="text-4xl font-serif font-bold text-[#D97706]">{pendingReviewCount}</h3>
        </div>

        {/* Completed This Week (Green) */}
        <div className="bg-[#F6FAF7] p-6 rounded-2xl shadow-sm border border-[#E5F3EB] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-[#E5F3EB] rounded-bl-full"></div>
          <p className="text-[10px] font-bold text-slate-500 tracking-[0.1em] mb-2 uppercase">COMPLETED THIS WEEK</p>
          <h3 className="text-4xl font-serif font-bold text-[#059669]">{completedCount}</h3>
        </div>
      </div>

      {/* ── 3. Toolbar แคปซูล (Search + 2 Filters) ── */}
      <div className="bg-white rounded-full shadow-sm border border-slate-100 flex items-center p-1.5 focus-within:ring-2 focus-within:ring-amber-400/50 transition-all relative z-20">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by ID, room, or issue description..."
            className="w-full pl-12 pr-4 py-2.5 bg-transparent border-none rounded-l-full text-sm focus:outline-none focus:ring-0"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center">
          <div className="w-px h-6 bg-slate-200 hidden md:block"></div>

          {/* Status Filter */}
          <div className="relative">
            <button
              onClick={() => setFilterTypeOpen(filterTypeOpen === 'status' ? null : 'status')}
              className="flex items-center gap-2 px-4 py-2 bg-transparent text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors whitespace-nowrap"
            >
              <Filter size={16} className="text-slate-400" /> {statusFilter} <ChevronDown size={14} className="text-slate-400" />
            </button>
            {filterTypeOpen === 'status' && (
              <div className="absolute right-0 top-full mt-2 w-36 bg-white border border-slate-100 shadow-xl rounded-xl py-2 z-50">
                {['All Status', 'Pending', 'In Progress', 'Completed'].map(s => (
                  <button key={s} onClick={() => { setStatusFilter(s); setFilterTypeOpen(null); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">{s}</button>
                ))}
              </div>
            )}
          </div>

          <div className="w-px h-6 bg-slate-200 hidden md:block"></div>

          {/* Priority Filter */}
          <div className="relative pr-2">
            <button
              onClick={() => setFilterTypeOpen(filterTypeOpen === 'priority' ? null : 'priority')}
              className="flex items-center gap-2 px-4 py-2 bg-transparent text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors whitespace-nowrap"
            >
              <Filter size={16} className="text-slate-400" /> {priorityFilter} <ChevronDown size={14} className="text-slate-400" />
            </button>
            {filterTypeOpen === 'priority' && (
              <div className="absolute right-0 top-full mt-2 w-36 bg-white border border-slate-100 shadow-xl rounded-xl py-2 z-50">
                {['All Priority', 'Urgent', 'High', 'Medium', 'Low'].map(p => (
                  <button key={p} onClick={() => { setPriorityFilter(p); setFilterTypeOpen(null); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">{p}</button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── 4. ตาราง Maintenance ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-visible relative z-10">
        {loading ? (
          <p className="text-center text-slate-400 py-12">กำลังโหลดข้อมูลใบแจ้งซ่อม...</p>
        ) : filteredRepairs.length === 0 ? (
          <p className="text-center text-slate-400 py-12">ไม่พบรายการแจ้งซ่อม</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">
                  <th className="w-10 px-4 py-4 text-center"></th> {/* ช่องสำหรับธง */}
                  <th className="px-4 py-4">Request</th>
                  <th className="px-4 py-4">Room</th>
                  <th className="px-4 py-4">Issue</th>
                  <th className="px-4 py-4">Priority</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Assigned</th>
                  <th className="px-4 py-4">Last Updated</th>
                  <th className="px-4 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRepairs.map((r, i) => {
                  const statusInfo = getStatusDisplay(r.status);
                  const prioInfo = getPriorityDisplay(r.priority);
                  const isHighAlert = r.priority === 'urgent' || r.priority === 'high';
                  // จำลอง Request ID ถ้าของจริงเป็น hash ยาวๆ
                  const displayId = r.id ? `MNT-${r.id.substring(0, 3).toUpperCase()}` : `MNT-00${i + 1}`;

                  return (
                    <tr key={r.id || i} className="hover:bg-slate-50/50 transition-colors group">
                      {/* คอลัมน์ธง */}
                      <td className="px-4 py-4 text-center">
                        {isHighAlert && <Flag size={16} fill="currentColor" className={r.priority === 'urgent' ? 'text-red-500' : 'text-amber-500'} />}
                      </td>

                      <td className="px-4 py-4 font-bold text-slate-800">{displayId}</td>
                      <td className="px-4 py-4 font-bold text-amber-600">{r.roomNumber || '-'}</td>
                      <td className="px-4 py-4 text-slate-800 font-medium truncate max-wxs" title={r.title}>{r.title}</td>

                      {/* ป้าย Priority แบบโปร่ง (Outline) */}
                      <td className="px-4 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border flex items-center w-fit gap-1 ${prioInfo.cls}`}>
                          {prioInfo.icon} {prioInfo.label}
                        </span>
                      </td>

                      {/* ป้าย Status แบบทึบ (Pill) */}
                      <td className="px-4 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.cls}`}>
                          {statusInfo.label}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        {r.technicianName
                          ? <span className="font-semibold text-slate-700">{r.technicianName}</span>
                          : <span className="italic text-slate-400">Unassigned</span>}
                      </td>

                      <td className="px-4 py-4 text-slate-500 flex items-center gap-1.5 mt-2.5">
                        <Clock size={14} /> {formatDateShort(r.updatedAt || r.createdAt)}
                      </td>

                      {/* คอลัมน์ Actions (จุด 3 จุด) */}
                      <td className="px-4 py-4 text-center relative">
                        <button
                          onClick={(e) => { e.stopPropagation(); setActionMenuOpenId(actionMenuOpenId === r.id ? null : r.id); }}
                          className={`p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded-full transition-colors ${actionMenuOpenId === r.id ? 'bg-slate-100 text-slate-700' : ''}`}
                        >
                          <MoreHorizontal size={18} />
                        </button>

                        {actionMenuOpenId === r.id && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setActionMenuOpenId(null); }}></div>
                            <div className="absolute right-10 top-10 w-40 bg-white border border-slate-100 shadow-xl rounded-xl z-50 py-1.5 text-left overflow-hidden">
                              <button
                                onClick={() => { setDetailRepair(r); setActionMenuOpenId(null); }}
                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                              >
                                <Eye size={16} className="text-slate-400" /> View Details
                              </button>

                              {r.status === 'pending' && (
                                <button
                                  onClick={() => { setSelectedAssign(r); setActionMenuOpenId(null); }}
                                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                                >
                                  <Wrench size={16} className="text-blue-400" /> Assign Tech
                                </button>
                              )}

                              {r.status === 'assigned' && (
                                <button
                                  onClick={() => { handleClose(r.id); setActionMenuOpenId(null); }}
                                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-emerald-600 hover:bg-emerald-50 transition-colors"
                                >
                                  <CheckCircle size={16} className="text-emerald-400" /> Mark Completed
                                </button>
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
        <div className="p-4 border-t border-slate-100 text-xs text-slate-400 font-medium italic">
          Showing {filteredRepairs.length} of {repairs.length} requests
        </div>
      </div>

      {/* ── 5. Modal ดูรายละเอียด ── */}
      {detailRepair && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-serif font-bold text-slate-800">Request Details</h2>
              <button onClick={() => setDetailRepair(null)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>

            <div className="flex gap-2 mb-6">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusDisplay(detailRepair.status).cls}`}>
                {getStatusDisplay(detailRepair.status).label}
              </span>
              <span className={`px-3 py-1 rounded-md text-xs font-semibold border ${getPriorityDisplay(detailRepair.priority).cls}`}>
                Priority: {getPriorityDisplay(detailRepair.priority).label}
              </span>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Issue Title</label>
                  <p className="text-sm bg-slate-50 border border-slate-100 px-3 py-2.5 rounded-xl text-slate-800 font-medium">{detailRepair.title}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Room Number</label>
                  <p className="text-sm bg-slate-50 border border-slate-100 px-3 py-2.5 rounded-xl text-amber-600 font-bold">{detailRepair.roomNumber}</p>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Category</label>
                <p className="text-sm bg-slate-50 border border-slate-100 px-3 py-2.5 rounded-xl text-slate-700">{detailRepair.category || '-'}</p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Description</label>
                <p className="text-sm bg-slate-50 border border-slate-100 px-3 py-2.5 rounded-xl text-slate-700 leading-relaxed min-h-[80px]">
                  {detailRepair.description || 'No description provided.'}
                </p>
              </div>

              {detailRepair.technicianName && (
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Assigned Technician</label>
                  <p className="text-sm bg-blue-50 border border-blue-100 px-3 py-2.5 rounded-xl text-blue-700 font-medium flex items-center gap-2">
                    <Wrench size={14} /> {detailRepair.technicianName}
                  </p>
                </div>
              )}

              {detailRepair.completionNote && (
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Completion Note</label>
                  <p className="text-sm bg-emerald-50 border border-emerald-100 px-3 py-2.5 rounded-xl text-emerald-700">
                    {detailRepair.completionNote}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-8">
              <button onClick={() => setDetailRepair(null)}
                className="flex-1 bg-slate-100 text-slate-700 py-2.5 rounded-xl hover:bg-slate-200 transition-colors font-semibold text-sm">Close</button>

              {detailRepair.status === 'pending' && (
                <button onClick={() => { setDetailRepair(null); setSelectedAssign(detailRepair); }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl transition-colors font-semibold text-sm flex items-center justify-center gap-2">
                  <Wrench size={16} /> Assign Tech
                </button>
              )}
              {detailRepair.status === 'assigned' && (
                <button onClick={() => handleClose(detailRepair.id)}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl transition-colors font-semibold text-sm flex items-center justify-center gap-2">
                  <CheckCircle size={16} /> Mark Completed
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── 6. Modal มอบหมายช่าง (Assign) ── */}
      {selectedAssign && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-serif font-bold text-slate-800">Assign Technician</h2>
              <button onClick={() => { setSelectedAssign(null); setError(''); }}><X size={20} className="text-slate-400 hover:text-slate-600" /></button>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mb-4">
              <p className="text-xs text-slate-500 mb-1">Issue: <span className="font-semibold text-slate-800">{selectedAssign.title}</span></p>
              <p className="text-xs text-slate-500">Room: <span className="font-bold text-amber-600">{selectedAssign.roomNumber}</span></p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Technician Name *</label>
              <input className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-400 focus:bg-white outline-none transition-all"
                placeholder="e.g. John Tech" value={techName} onChange={e => setTechName(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Technician ID (Optional)</label>
              <input className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-400 focus:bg-white outline-none transition-all"
                placeholder="e.g. TECH-001" value={techId} onChange={e => setTechId(e.target.value)} />
            </div>

            <div className="flex gap-3 pt-6">
              <button onClick={() => { setSelectedAssign(null); setError(''); }}
                className="w-1/3 bg-slate-100 text-slate-700 py-2.5 rounded-xl hover:bg-slate-200 transition-colors font-semibold text-sm">Cancel</button>
              <button onClick={handleAssign} disabled={saving || !techName}
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl hover:bg-blue-700 transition-colors font-semibold text-sm shadow-sm disabled:opacity-50">
                {saving ? 'Assigning...' : 'Confirm Assignment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 7. Modal สร้างใบแจ้งซ่อมใหม่ (New Request) ── */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-6 text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wrench size={32} className="text-amber-600" />
            </div>
            <h2 className="text-xl font-serif font-bold text-slate-800 mb-2">Resident Portal Feature</h2>
            <p className="text-sm text-slate-500 mb-6">
              New maintenance requests are typically submitted by residents via the Condovenient Mobile App.
              <br /><br />
              *(Admin creation feature coming soon)*
            </p>
            <button onClick={() => setShowCreateModal(false)}
              className="w-full bg-slate-100 text-slate-700 py-2.5 rounded-xl hover:bg-slate-200 transition-colors font-semibold text-sm">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Repairs;
// import { useEffect, useState } from 'react';
// import { X, Wrench, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';

// const API = 'http://localhost:3000';

// const Repairs = () => {
//   const [repairs, setRepairs]   = useState([]);
//   const [loading, setLoading]   = useState(true);
//   const [selected, setSelected] = useState(null);   // repair ที่จะ assign
//   const [detailRepair, setDetailRepair] = useState(null); // repair ที่จะดูรายละเอียด
//   const [techName, setTechName] = useState('');
//   const [techId, setTechId]     = useState('');
//   const [saving, setSaving]     = useState(false);
//   const [note, setNote]         = useState('');
//   const [error, setError]       = useState('');
//   const [success, setSuccess]   = useState('');

//   const load = () => {
//     setLoading(true); setError('');
//     fetch(`${API}/api/repair/list`)
//       .then(r => r.json())
//       .then(data => { setRepairs(Array.isArray(data) ? data : []); setLoading(false); })
//       .catch(() => { setError('ไม่สามารถโหลดข้อมูลได้'); setLoading(false); });
//   };

//   useEffect(() => { load(); }, []);

//   const handleAssign = async () => {
//     if (!techName) { setError('กรุณาระบุชื่อช่าง'); return; }
//     setSaving(true); setError('');
//     try {
//       const res = await fetch(`${API}/api/repair/assign/${selected.id}`, {
//         method: 'PATCH',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ technicianId: techId || 'tech-auto', technicianName: techName }),
//       });
//       const data = await res.json();
//       if (res.ok) {
//         setSuccess('มอบหมายช่างเรียบร้อยแล้ว');
//         setSelected(null); setTechName(''); setTechId('');
//         setTimeout(() => { setSuccess(''); load(); }, 1500);
//       } else { setError(data.error || 'เกิดข้อผิดพลาด'); }
//     } catch { setError('เกิดข้อผิดพลาดในการสื่อสารกับเซิร์ฟเวอร์'); }
//     setSaving(false);
//   };

//   const handleClose = async (id) => {
//     if (!confirm('ปิดงานซ่อมนี้?')) return;
//     try {
//       const res = await fetch(`${API}/api/repair/close/${id}`, {
//         method: 'PATCH',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ completionNote: note || 'งานเสร็จสิ้น', imageAfterUrl: '' }),
//       });
//       if (res.ok) {
//         setSuccess('ปิดงานซ่อมเรียบร้อยแล้ว');
//         setNote(''); setDetailRepair(null);
//         setTimeout(() => { setSuccess(''); load(); }, 1500);
//       } else {
//         const data = await res.json();
//         setError(data.error || 'เกิดข้อผิดพลาด');
//       }
//     } catch { setError('เกิดข้อผิดพลาดในการสื่อสารกับเซิร์ฟเวอร์'); }
//   };

//   const statusColor = {
//     pending:   'bg-yellow-100 text-yellow-700',
//     assigned:  'bg-blue-100 text-blue-700',
//     completed: 'bg-green-100 text-green-700',
//   };
//   const statusLabel = { pending: 'รอดำเนินการ', assigned: 'กำลังซ่อม', completed: 'เสร็จสิ้น' };
//   const priorityLabel = { low: 'ต่ำ', normal: 'ปกติ', high: 'สูง' };
//   const priorityColor = { high: 'bg-red-100 text-red-700', low: 'bg-blue-100 text-blue-700', normal: 'bg-gray-100 text-gray-700' };

//   const formatDate = (ts) => {
//     if (!ts) return '-';
//     try {
//       const d = ts._seconds ? new Date(ts._seconds * 1000) : new Date(ts);
//       return d.toLocaleString('th-TH');
//     } catch { return '-'; }
//   };

//   return (
//     <div className="space-y-6">
//       <h1 className="text-2xl font-bold text-gray-800">จัดการใบแจ้งซ่อม</h1>

//       {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
//       {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">✅ {success}</div>}

//       <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
//         {loading ? <p className="text-center text-gray-400 py-12">กำลังโหลด...</p>
//           : repairs.length === 0 ? <p className="text-center text-gray-400 py-12">ยังไม่มีใบแจ้งซ่อม</p>
//           : (
//           <table className="w-full text-sm">
//             <thead className="bg-gray-50">
//               <tr className="text-left text-gray-500 border-b">
//                 <th className="px-6 py-4">หัวข้อ</th>
//                 <th className="px-6 py-4">ห้อง</th>
//                 <th className="px-6 py-4">หมวดหมู่</th>
//                 <th className="px-6 py-4">ความเร่ง</th>
//                 <th className="px-6 py-4">ช่าง</th>
//                 <th className="px-6 py-4">สถานะ</th>
//                 <th className="px-6 py-4">จัดการ</th>
//               </tr>
//             </thead>
//             <tbody>
//               {repairs.map((r, i) => (
//                 <tr key={i} className="border-t hover:bg-gray-50">
//                   <td className="px-6 py-4">
//                     <div className="font-medium text-gray-800">{r.title}</div>
//                     <p className="text-xs text-gray-400 mt-0.5">{formatDate(r.createdAt)}</p>
//                   </td>
//                   <td className="px-6 py-4 text-gray-600">{r.roomNumber}</td>
//                   <td className="px-6 py-4 text-gray-600">{r.category}</td>
//                   <td className="px-6 py-4">
//                     <span className={`text-xs px-2 py-1 rounded-full font-medium ${priorityColor[r.priority] || 'bg-gray-100 text-gray-700'}`}>
//                       {priorityLabel[r.priority] || 'ปกติ'}
//                     </span>
//                   </td>
//                   <td className="px-6 py-4 text-gray-600">{r.technicianName || '-'}</td>
//                   <td className="px-6 py-4">
//                     <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[r.status] || 'bg-gray-100 text-gray-600'}`}>
//                       {statusLabel[r.status] || r.status}
//                     </span>
//                   </td>
//                   <td className="px-6 py-4">
//                     <div className="flex gap-2">
//                       {/* ปุ่มดูรายละเอียด */}
//                       <button onClick={() => setDetailRepair(r)}
//                         className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded transition-colors">
//                         รายละเอียด
//                       </button>
//                       {/* ปุ่ม assign ช่าง (เฉพาะ pending) */}
//                       {r.status === 'pending' && (
//                         <button onClick={() => { setSelected(r); setError(''); }}
//                           className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded transition-colors flex items-center gap-1">
//                           <Wrench size={12} /> มอบหมาย
//                         </button>
//                       )}
//                       {/* ปุ่มปิดงาน (เฉพาะ assigned) */}
//                       {r.status === 'assigned' && (
//                         <button onClick={() => handleClose(r.id)}
//                           className="text-xs bg-green-100 hover:bg-green-200 text-green-700 px-2 py-1 rounded transition-colors flex items-center gap-1">
//                           <CheckCircle size={12} /> ปิดงาน
//                         </button>
//                       )}
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         )}
//       </div>

//       {/* ── Modal รายละเอียดใบแจ้งซ่อม ── */}
//       {detailRepair && (
//         <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
//           <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
//             <div className="flex items-center justify-between">
//               <h2 className="text-lg font-bold text-gray-800">รายละเอียดใบแจ้งซ่อม</h2>
//               <button onClick={() => setDetailRepair(null)}><X size={20} /></button>
//             </div>

//             <div className="flex gap-2">
//               <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[detailRepair.status] || 'bg-gray-100'}`}>
//                 {statusLabel[detailRepair.status] || detailRepair.status}
//               </span>
//               <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColor[detailRepair.priority] || 'bg-gray-100'}`}>
//                 ความเร่งด่วน: {priorityLabel[detailRepair.priority] || 'ปกติ'}
//               </span>
//             </div>

//             <div className="space-y-3">
//               <div className="grid grid-cols-2 gap-3">
//                 <div>
//                   <label className="text-xs text-gray-400 block mb-1">หัวข้อ</label>
//                   <p className="text-sm bg-gray-50 px-3 py-2 rounded-lg text-gray-800 font-medium">{detailRepair.title}</p>
//                 </div>
//                 <div>
//                   <label className="text-xs text-gray-400 block mb-1">หมายเลขห้อง</label>
//                   <p className="text-sm bg-gray-50 px-3 py-2 rounded-lg text-gray-700">{detailRepair.roomNumber}</p>
//                 </div>
//               </div>
//               <div>
//                 <label className="text-xs text-gray-400 block mb-1">หมวดหมู่</label>
//                 <p className="text-sm bg-gray-50 px-3 py-2 rounded-lg text-gray-700">{detailRepair.category}</p>
//               </div>
//               <div>
//                 <label className="text-xs text-gray-400 block mb-1">รายละเอียดที่แจ้งมา</label>
//                 <p className="text-sm bg-gray-50 px-3 py-2 rounded-lg text-gray-700 leading-relaxed whitespace-pre-wrap">
//                   {detailRepair.description || '-'}
//                 </p>
//               </div>
//               {detailRepair.technicianName && (
//                 <div>
//                   <label className="text-xs text-gray-400 block mb-1">ช่างที่รับผิดชอบ</label>
//                   <p className="text-sm bg-blue-50 px-3 py-2 rounded-lg text-blue-700">{detailRepair.technicianName}</p>
//                 </div>
//               )}
//               <div className="grid grid-cols-2 gap-3">
//                 <div>
//                   <label className="text-xs text-gray-400 block mb-1">วันที่แจ้ง</label>
//                   <p className="text-xs bg-gray-50 px-3 py-2 rounded-lg text-gray-600">{formatDate(detailRepair.createdAt)}</p>
//                 </div>
//                 <div>
//                   <label className="text-xs text-gray-400 block mb-1">อัปเดตล่าสุด</label>
//                   <p className="text-xs bg-gray-50 px-3 py-2 rounded-lg text-gray-600">{formatDate(detailRepair.updatedAt)}</p>
//                 </div>
//               </div>
//               {detailRepair.completionNote && (
//                 <div>
//                   <label className="text-xs text-gray-400 block mb-1">บันทึกการปิดงาน</label>
//                   <p className="text-sm bg-green-50 px-3 py-2 rounded-lg text-green-700">{detailRepair.completionNote}</p>
//                 </div>
//               )}
//               {/* User ID */}
//               <div>
//                 <label className="text-xs text-gray-400 block mb-1">User ID ผู้แจ้ง</label>
//                 <p className="text-xs font-mono bg-gray-50 px-3 py-2 rounded-lg text-gray-500 break-all">{detailRepair.userId || '-'}</p>
//               </div>
//             </div>

//             <div className="flex gap-2 pt-2">
//               {detailRepair.status === 'pending' && (
//                 <button onClick={() => { setDetailRepair(null); setSelected(detailRepair); setError(''); }}
//                   className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
//                   <Wrench size={14} /> มอบหมายช่าง
//                 </button>
//               )}
//               {detailRepair.status === 'assigned' && (
//                 <button onClick={() => handleClose(detailRepair.id)}
//                   className="flex items-center gap-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm">
//                   <CheckCircle size={14} /> ปิดงานซ่อม
//                 </button>
//               )}
//               <button onClick={() => setDetailRepair(null)}
//                 className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 text-sm">ปิด</button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ── Modal มอบหมายช่าง ── */}
//       {selected && (
//         <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
//           <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
//             <div className="flex items-center justify-between">
//               <h2 className="text-lg font-bold text-gray-800">มอบหมายช่าง</h2>
//               <button onClick={() => { setSelected(null); setError(''); }}><X size={20} /></button>
//             </div>
//             {error && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">{error}</div>}
//             <div className="bg-gray-50 rounded-xl p-3 space-y-1">
//               <p className="text-sm text-gray-600">งาน: <span className="font-medium text-gray-800">{selected.title}</span></p>
//               <p className="text-sm text-gray-600">ห้อง: <span className="font-medium">{selected.roomNumber}</span></p>
//               <p className="text-sm text-gray-600">หมวดหมู่: <span className="font-medium">{selected.category}</span></p>
//             </div>
//             <div>
//               <label className="text-xs text-gray-500 block mb-1">ชื่อช่าง *</label>
//               <input className="w-full border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
//                 placeholder="เช่น สมชาย" value={techName} onChange={e => setTechName(e.target.value)} />
//             </div>
//             <div>
//               <label className="text-xs text-gray-500 block mb-1">รหัสช่าง (ไม่บังคับ)</label>
//               <input className="w-full border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
//                 placeholder="เช่น TECH-001" value={techId} onChange={e => setTechId(e.target.value)} />
//             </div>
//             <div className="flex gap-2">
//               <button onClick={() => { setSelected(null); setError(''); }}
//                 className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors">ยกเลิก</button>
//               <button onClick={handleAssign} disabled={saving || !techName}
//                 className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
//                 {saving ? 'กำลังบันทึก...' : 'ยืนยัน'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Repairs;
