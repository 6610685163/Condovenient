import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

const API = 'http://localhost:3000';

const Repairs = () => {
  const [repairs, setRepairs]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState(null);
  const [techName, setTechName]   = useState('');
  const [techId, setTechId]       = useState('');
  const [saving, setSaving]       = useState(false);
  const [note, setNote]           = useState('');

  const load = () => {
    setLoading(true);
    fetch(`${API}/api/repair/list`)
      .then(r => r.json())
      .then(data => { setRepairs(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleAssign = async () => {
    if (!techName) return;
    setSaving(true);
    await fetch(`${API}/api/repair/assign/${selected.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ technicianId: techId || 'staff-001', technicianName: techName }),
    });
    setSaving(false);
    setSelected(null);
    setTechName('');
    load();
  };

  const handleClose = async (id) => {
    if (!confirm('ปิดงานซ่อมนี้?')) return;
    await fetch(`${API}/api/repair/close/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completionNote: note || 'งานเสร็จสิ้น', imageAfterUrl: '' }),
    });
    setNote('');
    load();
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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">จัดการใบแจ้งซ่อม</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <p className="text-center text-gray-400 py-12">กำลังโหลด...</p>
        ) : repairs.length === 0 ? (
          <p className="text-center text-gray-400 py-12">ยังไม่มีใบแจ้งซ่อม</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left text-gray-500">
                <th className="px-6 py-4">หัวข้อ</th>
                <th className="px-6 py-4">ห้อง</th>
                <th className="px-6 py-4">หมวดหมู่</th>
                <th className="px-6 py-4">ช่าง</th>
                <th className="px-6 py-4">สถานะ</th>
                <th className="px-6 py-4">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {repairs.map((r, i) => (
                <tr key={i} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-800">{r.title}</td>
                  <td className="px-6 py-4 text-gray-600">{r.roomNumber}</td>
                  <td className="px-6 py-4 text-gray-600">{r.category}</td>
                  <td className="px-6 py-4 text-gray-600">{r.technicianName || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[r.status] || 'bg-gray-100 text-gray-600'}`}>
                      {statusLabel[r.status] || r.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    {r.status === 'pending' && (
                      <button
                        onClick={() => setSelected(r)}
                        className="text-xs bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700"
                      >
                        มอบหมายช่าง
                      </button>
                    )}
                    {r.status === 'assigned' && (
                      <button
                        onClick={() => handleClose(r.id)}
                        className="text-xs bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700"
                      >
                        ปิดงาน
                      </button>
                    )}
                    {r.status === 'completed' && (
                      <span className="text-xs text-gray-400">เสร็จแล้ว</span>
                    )}
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
              <button onClick={() => setSelected(null)}><X size={20} /></button>
            </div>
            <p className="text-sm text-gray-600">งาน: <span className="font-medium">{selected.title}</span></p>
            <p className="text-sm text-gray-600">ห้อง: <span className="font-medium">{selected.roomNumber}</span></p>
            <input
              className="w-full border rounded-lg px-4 py-2 text-sm"
              placeholder="ชื่อช่าง"
              value={techName}
              onChange={e => setTechName(e.target.value)}
            />
            <input
              className="w-full border rounded-lg px-4 py-2 text-sm"
              placeholder="รหัสช่าง (ไม่บังคับ)"
              value={techId}
              onChange={e => setTechId(e.target.value)}
            />
            <button
              onClick={handleAssign}
              disabled={saving || !techName}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {saving ? 'กำลังบันทึก...' : 'ยืนยันมอบหมาย'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Repairs;