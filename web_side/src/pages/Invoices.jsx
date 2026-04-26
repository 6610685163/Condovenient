import { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';

const API = 'http://localhost:3000';

const Invoices = () => {
  const [users, setUsers]       = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ userId: '', roomId: '', amount: '', description: 'ค่าส่วนกลาง', dueDate: '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg]       = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetch(`${API}/api/auth/users`)
      .then(r => r.json())
      .then(data => setUsers(Array.isArray(data) ? data : []));
  }, []);

  const handleCreate = async () => {
    if (!form.userId || !form.amount) {
      setMsg('กรุณาเลือกผู้ใช้และระบุยอดเงิน'); return;
    }
    setSaving(true);
    const res = await fetch(`${API}/api/payment/invoices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);
    if (data.success) {
      setShowModal(false);
      setForm({ userId: '', roomId: '', amount: '', description: 'ค่าส่วนกลาง', dueDate: '' });
      setMsg('');
      setSuccessMsg(`สร้าง Invoice สำเร็จ! ID: ${data.invoiceId}`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } else {
      setMsg(data.error || 'เกิดข้อผิดพลาด');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">จัดการ Invoice</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} /> สร้าง Invoice
        </button>
      </div>

      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          ✅ {successMsg}
        </div>
      )}

      {/* คำอธิบาย */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-400">
        <p className="text-lg font-medium text-gray-600 mb-2">สร้าง Invoice ให้ลูกบ้าน</p>
        <p className="text-sm">Admin สามารถสร้างใบแจ้งหนี้ค่าส่วนกลางรายเดือน<br />หรือค่าบริการพิเศษให้แต่ละห้องได้จากหน้านี้</p>
        <p className="text-xs mt-4 text-gray-300">Invoice ที่สร้างแล้วจะปรากฏในแอปของลูกบ้านทันที</p>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">สร้าง Invoice ใหม่</h2>
              <button onClick={() => { setShowModal(false); setMsg(''); }}><X size={20} /></button>
            </div>
            {msg && <p className="text-red-500 text-sm">{msg}</p>}

            <div>
              <label className="text-xs text-gray-500 mb-1 block">เลือกลูกบ้าน</label>
              <select className="w-full border rounded-lg px-4 py-2 text-sm"
                value={form.userId} onChange={e => setForm({ ...form, userId: e.target.value })}>
                <option value="">-- เลือกผู้ใช้ --</option>
                {users.map(u => (
                  <option key={u.user_id} value={u.user_id}>{u.name} ({u.username})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1 block">เลขห้อง / Room ID</label>
              <input className="w-full border rounded-lg px-4 py-2 text-sm" placeholder="เช่น A-101"
                value={form.roomId} onChange={e => setForm({ ...form, roomId: e.target.value })} />
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1 block">รายการ</label>
              <input className="w-full border rounded-lg px-4 py-2 text-sm" placeholder="เช่น ค่าส่วนกลาง เดือน พ.ค."
                value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1 block">ยอดเงิน (บาท)</label>
              <input className="w-full border rounded-lg px-4 py-2 text-sm" type="number" placeholder="5250"
                value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1 block">วันครบกำหนด</label>
              <input className="w-full border rounded-lg px-4 py-2 text-sm" type="date"
                value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
            </div>

            <button
              onClick={handleCreate}
              disabled={saving}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {saving ? 'กำลังสร้าง...' : 'สร้าง Invoice'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;