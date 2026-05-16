import { useEffect, useState } from 'react';
import { X, ChevronDown } from 'lucide-react';

const API = 'http://localhost:3000';

const Repairs = () => {
  const [repairs, setRepairs]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState(null);
  const [techName, setTechName]   = useState('');
  const [techId, setTechId]       = useState('');
  const [saving, setSaving]       = useState(false);
  const [note, setNote]           = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    fetch(`${API}/api/repair/list`)
      .then(r => r.json())
      .then(data => { 
        setRepairs(Array.isArray(data) ? data : []); 
        setLoading(false); 
      })
      .catch(err => {
        console.error(err);
        setError('ไม่สามารถโหลดข้อมูลได้');
        setLoading(false);
      });
  };

  useEffect(() => { load(); }, []);

  const handleAssign = async () => {
    if (!techName) {
      setError('กรุณาระบุชื่อช่าง');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`${API}/api/repair/assign/${selected.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ technicianId: techId || 'tech-auto', technicianName: techName }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('มอบหมายช่างเรียบร้อยแล้ว');
        setSaving(false);
        setSelected(null);
        setTechName('');
        setTechId('');
        setTimeout(() => {
          setSuccess('');
          load();
        }, 1500);
      } else {
        setError(data.error || 'เกิดข้อผิดพลาด');
        setSaving(false);
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการสื่อสารกับเซิร์ฟเวอร์');
      setSaving(false);
    }
  };

  const handleClose = async (id) => {
    if (!confirm('ปิดงานซ่อมนี้?')) return;
    try {
      const res = await fetch(`${API}/api/repair/close/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completionNote: note || 'งานเสร็จสิ้น', imageAfterUrl: '' }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('ปิดงานซ่อมเรียบร้อยแล้ว');
        setNote('');
        setTimeout(() => {
          setSuccess('');
          load();
        }, 1500);
      } else {
        setError(data.error || 'เกิดข้อผิดพลาด');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการสื่อสารกับเซิร์ฟเวอร์');
    }
  };

  const statusColor = {
    pending:   'bg-yellow-100 text-yellow-700',
    assigned:  'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
  };
  const statusLabel = {
    pending:   'รอดำเนินการ',
    assigned:  'กำลังซ่อม',
    completed: 'เสร็จสิ้น',
  };

  const priorityLabel = {
    low: 'ต่ำ',
    normal: 'ปกติ',
    high: 'สูง',
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">จัดการใบแจ้งซ่อม</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          ✅ {success}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <p className="text-center text-gray-400 py-12">กำลังโหลด...</p>
        ) : repairs.length === 0 ? (
          <p className="text-center text-gray-400 py-12">ยังไม่มีใบแจ้งซ่อม</p>
        ) : (
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
                    <p className="text-xs text-gray-500 mt-1">{r.description?.substring(0, 50)}...</p>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{r.roomNumber}</td>
                  <td className="px-6 py-4 text-gray-600">{r.category}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      r.priority === 'high' ? 'bg-red-100 text-red-700' :
                      r.priority === 'low' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
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
                    <button
                      onClick={() => setExpandedId(expandedId === i ? null : i)}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      <ChevronDown size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal มอบหมายช่าง */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">มอบหมายช่าง</h2>
              <button onClick={() => { setSelected(null); setError(''); }}><X size={20} /></button>
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
                {error}
              </div>
            )}
            <div>
              <p className="text-sm text-gray-600">งาน: <span className="font-medium">{selected.title}</span></p>
              <p className="text-sm text-gray-600 mt-1">ห้อง: <span className="font-medium">{selected.roomNumber}</span></p>
              <p className="text-sm text-gray-600 mt-1">หมวดหมู่: <span className="font-medium">{selected.category}</span></p>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">ชื่อช่าง *</label>
              <input
                className="w-full border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="เช่น สมชาย"
                value={techName}
                onChange={e => setTechName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">รหัสช่าง (ไม่บังคับ)</label>
              <input
                className="w-full border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="เช่น TECH-001"
                value={techId}
                onChange={e => setTechId(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setSelected(null); setError(''); }}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleAssign}
                disabled={saving || !techName}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'กำลังบันทึก...' : 'ยืนยัน'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Repairs;