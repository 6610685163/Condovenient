import { useEffect, useState } from 'react';
import { X, Wrench, CheckCircle, Search, User as UserIcon } from 'lucide-react';

const API = 'http://localhost:3000';

const WORKING_STATUS = {
  online:  { label: 'ว่าง',         color: 'bg-green-100 text-green-700' },
  working: { label: 'กำลังทำงาน',   color: 'bg-amber-100 text-amber-700' },
  break:   { label: 'พักงาน',       color: 'bg-yellow-100 text-yellow-700' },
  offline: { label: 'ออฟไลน์',      color: 'bg-gray-100 text-gray-500' },
};

const Repairs = () => {
  const [repairs, setRepairs]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);
  const [detailRepair, setDetailRepair] = useState(null);
  const [techName, setTechName] = useState('');
  const [techId, setTechId]     = useState('');
  const [saving, setSaving]     = useState(false);
  const [note, setNote]         = useState('');
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');

  const [technicians, setTechnicians] = useState([]);
  const [loadingTechs, setLoadingTechs] = useState(false);
  const [showTechList, setShowTechList] = useState(false);
  const [onlyAvailable, setOnlyAvailable] = useState(true);
  const [techSearch, setTechSearch] = useState('');

  const load = () => {
    setLoading(true); setError('');
    fetch(`${API}/api/repair/list`)
      .then(r => r.json())
      .then(data => { setRepairs(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => { setError('ไม่สามารถโหลดข้อมูลได้'); setLoading(false); });
  };

  const loadTechnicians = () => {
    setLoadingTechs(true);
    fetch(`${API}/api/staff?role=technician`)
      .then(r => r.json())
      .then(data => {
        setTechnicians(Array.isArray(data.staff) ? data.staff : []);
        setLoadingTechs(false);
      })
      .catch(() => { setLoadingTechs(false); });
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { if (selected) loadTechnicians(); }, [selected]);

  const visibleTechs = technicians.filter(t => {
    if (onlyAvailable && t.workingStatus !== 'online') return false;
    if (techSearch.trim()) {
      const q = techSearch.toLowerCase();
      return (t.name || '').toLowerCase().includes(q)
          || (t.username || '').toLowerCase().includes(q);
    }
    return true;
  });

  const pickTechnician = (t) => {
    setTechName(t.name || t.username);
    setTechId(t.id);
    setShowTechList(false);
    setError('');
  };

  const handleAssign = async () => {
    if (!techName) { setError('กรุณาระบุชื่อช่าง'); return; }
    setSaving(true); setError('');
    try {
      const res = await fetch(`${API}/api/repair/assign/${selected.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ technicianId: techId || 'tech-auto', technicianName: techName }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('มอบหมายช่างเรียบร้อยแล้ว');
        setSelected(null); setTechName(''); setTechId('');
        setTimeout(() => { setSuccess(''); load(); }, 1500);
      } else { setError(data.error || 'เกิดข้อผิดพลาด'); }
    } catch { setError('เกิดข้อผิดพลาดในการสื่อสารกับเซิร์ฟเวอร์'); }
    setSaving(false);
  };

  const handleClose = async (id) => {
    if (!confirm('ปิดงานซ่อมนี้?')) return;
    try {
      const res = await fetch(`${API}/api/repair/close/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completionNote: note || 'งานเสร็จสิ้น', imageAfterUrl: '' }),
      });
      if (res.ok) {
        setSuccess('ปิดงานซ่อมเรียบร้อยแล้ว');
        setNote(''); setDetailRepair(null);
        setTimeout(() => { setSuccess(''); load(); }, 1500);
      } else {
        const data = await res.json();
        setError(data.error || 'เกิดข้อผิดพลาด');
      }
    } catch { setError('เกิดข้อผิดพลาดในการสื่อสารกับเซิร์ฟเวอร์'); }
  };

  const statusColor = {
    pending:     'bg-yellow-100 text-yellow-700',
    assigned:    'bg-blue-100 text-blue-700',
    in_progress: 'bg-indigo-100 text-indigo-700',
    completed:   'bg-green-100 text-green-700',
  };
  const statusLabel = {
    pending: 'รอดำเนินการ',
    assigned: 'รอช่างรับงาน',
    in_progress: 'กำลังซ่อม',
    completed: 'เสร็จสิ้น',
  };
  const priorityLabel = { low: 'ต่ำ', normal: 'ปกติ', high: 'สูง' };
  const priorityColor = { high: 'bg-red-100 text-red-700', low: 'bg-blue-100 text-blue-700', normal: 'bg-gray-100 text-gray-700' };

  const formatDate = (ts) => {
    if (!ts) return '-';
    try {
      const d = ts._seconds ? new Date(ts._seconds * 1000) : new Date(ts);
      return d.toLocaleString('th-TH');
    } catch { return '-'; }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">จัดการใบแจ้งซ่อม</h1>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
      {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">✅ {success}</div>}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? <p className="text-center text-gray-400 py-12">กำลังโหลด...</p>
          : repairs.length === 0 ? <p className="text-center text-gray-400 py-12">ยังไม่มีใบแจ้งซ่อม</p>
          : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left text-gray-500 border-b">
                <th className="px-6 py-4">หัวข้อ</th>
                <th className="px-6 py-4">ห้อง</th>
                <th className="px-6 py-4">หมวดหมู่</th>
                <th className="px-6 py-4">ความเร่ง</th>
                <th className="px-6 py-4">ช่าง</th>
                <th className="px-6 py-4">สถานะ</th>
                <th className="px-6 py-4">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {repairs.map((r, i) => (
                <tr key={i} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-800">{r.title}</div>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(r.createdAt)}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{r.roomNumber}</td>
                  <td className="px-6 py-4 text-gray-600">{r.category}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${priorityColor[r.priority] || 'bg-gray-100 text-gray-700'}`}>
                      {priorityLabel[r.priority] || 'ปกติ'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{r.technicianName || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[r.status] || 'bg-gray-100 text-gray-600'}`}>
                      {statusLabel[r.status] || r.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => setDetailRepair(r)}
                        className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded transition-colors">
                        รายละเอียด
                      </button>
                      {r.status === 'pending' && (
                        <button onClick={() => { setSelected(r); setError(''); }}
                          className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded transition-colors flex items-center gap-1">
                          <Wrench size={12} /> มอบหมาย
                        </button>
                      )}
                      {(r.status === 'assigned' || r.status === 'in_progress') && (
                        <button onClick={() => handleClose(r.id)}
                          className="text-xs bg-green-100 hover:bg-green-200 text-green-700 px-2 py-1 rounded transition-colors flex items-center gap-1">
                          <CheckCircle size={12} /> ปิดงาน
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {detailRepair && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">รายละเอียดใบแจ้งซ่อม</h2>
              <button onClick={() => setDetailRepair(null)}><X size={20} /></button>
            </div>

            <div className="flex gap-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[detailRepair.status] || 'bg-gray-100'}`}>
                {statusLabel[detailRepair.status] || detailRepair.status}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColor[detailRepair.priority] || 'bg-gray-100'}`}>
                ความเร่งด่วน: {priorityLabel[detailRepair.priority] || 'ปกติ'}
              </span>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">หัวข้อ</label>
                  <p className="text-sm bg-gray-50 px-3 py-2 rounded-lg text-gray-800 font-medium">{detailRepair.title}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">หมายเลขห้อง</label>
                  <p className="text-sm bg-gray-50 px-3 py-2 rounded-lg text-gray-700">{detailRepair.roomNumber}</p>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">หมวดหมู่</label>
                <p className="text-sm bg-gray-50 px-3 py-2 rounded-lg text-gray-700">{detailRepair.category}</p>
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">รายละเอียดที่แจ้งมา</label>
                <p className="text-sm bg-gray-50 px-3 py-2 rounded-lg text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {detailRepair.description || '-'}
                </p>
              </div>
              {detailRepair.technicianName && (
                <div>
                  <label className="text-xs text-gray-400 block mb-1">ช่างที่รับผิดชอบ</label>
                  <p className="text-sm bg-blue-50 px-3 py-2 rounded-lg text-blue-700">{detailRepair.technicianName}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">วันที่แจ้ง</label>
                  <p className="text-xs bg-gray-50 px-3 py-2 rounded-lg text-gray-600">{formatDate(detailRepair.createdAt)}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">อัปเดตล่าสุด</label>
                  <p className="text-xs bg-gray-50 px-3 py-2 rounded-lg text-gray-600">{formatDate(detailRepair.updatedAt)}</p>
                </div>
              </div>
              {detailRepair.completionNote && (
                <div>
                  <label className="text-xs text-gray-400 block mb-1">บันทึกการปิดงาน</label>
                  <p className="text-sm bg-green-50 px-3 py-2 rounded-lg text-green-700">{detailRepair.completionNote}</p>
                </div>
              )}
              <div>
                <label className="text-xs text-gray-400 block mb-1">User ID ผู้แจ้ง</label>
                <p className="text-xs font-mono bg-gray-50 px-3 py-2 rounded-lg text-gray-500 break-all">{detailRepair.userId || '-'}</p>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              {detailRepair.status === 'pending' && (
                <button onClick={() => { setDetailRepair(null); setSelected(detailRepair); setError(''); }}
                  className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
                  <Wrench size={14} /> มอบหมายช่าง
                </button>
              )}
              {(detailRepair.status === 'assigned' || detailRepair.status === 'in_progress') && (
                <button onClick={() => handleClose(detailRepair.id)}
                  className="flex items-center gap-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm">
                  <CheckCircle size={14} /> ปิดงานซ่อม
                </button>
              )}
              <button onClick={() => setDetailRepair(null)}
                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 text-sm">ปิด</button>
            </div>
          </div>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setShowTechList(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">มอบหมายช่าง</h2>
              <button onClick={() => { setSelected(null); setError(''); setShowTechList(false); setTechName(''); setTechId(''); }}>
                <X size={20} />
              </button>
            </div>

            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">{error}</div>}

            <div className="bg-gray-50 rounded-xl p-3 space-y-1">
              <p className="text-sm text-gray-600">งาน: <span className="font-medium text-gray-800">{selected.title}</span></p>
              <p className="text-sm text-gray-600">ห้อง: <span className="font-medium">{selected.roomNumber}</span></p>
              <p className="text-sm text-gray-600">หมวดหมู่: <span className="font-medium">{selected.category}</span></p>
            </div>

            <div className="relative">
              <label className="text-xs text-gray-500 block mb-1">เลือกช่าง *</label>
              <button type="button"
                onClick={() => setShowTechList(v => !v)}
                className="w-full flex items-center justify-between border rounded-lg px-4 py-2 text-sm bg-white hover:border-blue-400 focus:ring-2 focus:ring-blue-500 outline-none">
                {techName ? (
                  <span className="flex items-center gap-2">
                    <UserIcon size={14} className="text-blue-600" />
                    <span className="font-medium text-gray-800">{techName}</span>
                    {techId && <span className="text-xs text-gray-400">({techId.slice(0, 6)}...)</span>}
                  </span>
                ) : (
                  <span className="text-gray-400">— เลือกช่างจากรายการ —</span>
                )}
                <Search size={14} className="text-gray-400" />
              </button>

              {showTechList && (
                <div className="absolute left-0 right-0 mt-2 bg-white border rounded-xl shadow-lg z-10 max-h-80 overflow-hidden flex flex-col">
                  <div className="p-2 border-b space-y-2">
                    <input autoFocus placeholder="ค้นหาช่าง..."
                      value={techSearch} onChange={e => setTechSearch(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-gray-100 rounded-lg outline-none focus:bg-white focus:ring-2 focus:ring-blue-500" />
                    <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                      <input type="checkbox" checked={onlyAvailable}
                        onChange={e => setOnlyAvailable(e.target.checked)} />
                      แสดงเฉพาะช่างที่ว่าง (online)
                    </label>
                  </div>

                  <div className="overflow-y-auto">
                    {loadingTechs ? (
                      <p className="text-center text-gray-400 py-6 text-sm">กำลังโหลดรายชื่อช่าง...</p>
                    ) : visibleTechs.length === 0 ? (
                      <p className="text-center text-gray-400 py-6 text-sm">
                        {onlyAvailable ? 'ไม่มีช่างที่ว่างในขณะนี้' : 'ไม่พบช่างในระบบ'}
                      </p>
                    ) : (
                      visibleTechs.map(t => {
                        const ws = WORKING_STATUS[t.workingStatus] || WORKING_STATUS.offline;
                        const isAvailable = t.workingStatus === 'online';
                        return (
                          <button key={t.id} type="button"
                            onClick={() => pickTechnician(t)}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b last:border-b-0 transition-colors ${
                              isAvailable ? 'hover:bg-blue-50' : 'hover:bg-gray-50'
                            }`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              isAvailable ? 'bg-blue-100' : 'bg-gray-100'
                            }`}>
                              <UserIcon size={16} className={isAvailable ? 'text-blue-600' : 'text-gray-500'} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-800 truncate">{t.name || t.username}</div>
                              <div className="text-xs text-gray-400 truncate">{t.username}</div>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${ws.color}`}>
                              {ws.label}
                            </span>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button onClick={() => { setSelected(null); setError(''); setShowTechList(false); setTechName(''); setTechId(''); }}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors">ยกเลิก</button>
              <button onClick={handleAssign} disabled={saving || !techName || !techId}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
                {saving ? 'กำลังบันทึก...' : 'ยืนยัน'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
//gokjgjhiuoesjg
export default Repairs;