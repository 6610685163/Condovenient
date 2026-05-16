import { useEffect, useState, useCallback } from 'react';
import { Plus, X, RefreshCw, FileText, CheckCircle, Clock } from 'lucide-react';

const API = 'http://localhost:3000';

const Invoices = () => {
  const [users, setUsers]         = useState([]);
  const [invoices, setInvoices]   = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [loading, setLoading]     = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ userId: '', roomId: '', amount: '', description: 'ค่าส่วนกลาง', dueDate: '' });
  const [saving, setSaving]       = useState(false);
  const [msg, setMsg]             = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetch(`${API}/api/auth/users`).then(r => r.json()).then(data => setUsers(Array.isArray(data) ? data : []));
  }, []);

  const loadInvoices = useCallback(async () => {
    if (!selectedUser) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/payment/invoices/${selectedUser}`);
      const data = await res.json();
      setInvoices(data.success ? data.invoices : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [selectedUser]);

  useEffect(() => { loadInvoices(); }, [loadInvoices]);

  const handleCreate = async () => {
    if (!form.userId || !form.amount) { setMsg('กรุณาเลือกผู้ใช้และระบุยอดเงิน'); return; }
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
      setSuccessMsg(`✅ สร้าง Invoice สำเร็จ! ลูกบ้านจะเห็นในแอปทันที`);
      setTimeout(() => { setSuccessMsg(''); if (selectedUser === form.userId) loadInvoices(); }, 3000);
    } else {
      setMsg(data.error || 'เกิดข้อผิดพลาด');
    }
  };

  const formatDate = (ts) => {
    if (!ts) return '-';
    const d = ts._seconds ? new Date(ts._seconds * 1000) : new Date(ts);
    return `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`;
  };

  const statusConfig = {
    pending: { label: 'รอชำระ', cls: 'bg-yellow-100 text-yellow-700', icon: <Clock size={12}/> },
    paid: { label: 'ชำระแล้ว', cls: 'bg-green-100 text-green-700', icon: <CheckCircle size={12}/> },
  };

  const pendingCount = invoices.filter(i => i.status === 'pending').length;
  const totalPending = invoices.filter(i => i.status === 'pending').reduce((s, i) => s + (i.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">จัดการ Invoice</h1>
          {selectedUser && invoices.length > 0 && (
            <p className="text-sm text-gray-500 mt-1">รอชำระ {pendingCount} รายการ • ยอดค้าง ฿{totalPending.toLocaleString()}</p>
          )}
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          <Plus size={18} /> สร้าง Invoice
        </button>
      </div>

      {successMsg && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">{successMsg}</div>}

      {/* Filter by user */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-600 whitespace-nowrap">ดู Invoice ของ:</label>
          <select className="flex-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            value={selectedUser} onChange={e => setSelectedUser(e.target.value)}>
            <option value="">-- เลือกลูกบ้าน --</option>
            {users.filter(u => u.role !== 'admin').map(u => (
              <option key={u.user_id} value={u.user_id}>{u.name} ({u.username})</option>
            ))}
          </select>
          <button onClick={loadInvoices} className="text-gray-400 hover:text-gray-600 p-2"><RefreshCw size={14}/></button>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {!selectedUser ? (
          <div className="p-12 text-center text-gray-400">
            <FileText size={48} className="mx-auto mb-4 opacity-40"/>
            <p>เลือกลูกบ้านเพื่อดู Invoice</p>
          </div>
        ) : loading ? (
          <p className="text-center text-gray-400 py-12">กำลังโหลด...</p>
        ) : invoices.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <FileText size={48} className="mx-auto mb-4 opacity-40"/>
            <p>ยังไม่มี Invoice สำหรับลูกบ้านคนนี้</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500 uppercase">
                <th className="px-4 py-3 text-left">รายการ</th>
                <th className="px-4 py-3 text-left">ยอดเงิน</th>
                <th className="px-4 py-3 text-left">วันครบกำหนด</th>
                <th className="px-4 py-3 text-left">วันที่สร้าง</th>
                <th className="px-4 py-3 text-left">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {invoices.map(inv => {
                const sc = statusConfig[inv.status] || { label: inv.status, cls: 'bg-gray-100 text-gray-600', icon: null };
                return (
                  <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{inv.description}</td>
                    <td className="px-4 py-3 text-sm font-bold text-gray-900">฿{(inv.amount || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{inv.dueDate || '-'}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{formatDate(inv.createdAt)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${sc.cls}`}>
                        {sc.icon} {sc.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">สร้าง Invoice ใหม่</h2>
              <button onClick={() => { setShowModal(false); setMsg(''); }}><X size={20}/></button>
            </div>
            {msg && <p className="text-red-500 text-sm">{msg}</p>}

            <div>
              <label className="text-xs text-gray-500 mb-1 block">เลือกลูกบ้าน *</label>
              <select className="w-full border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.userId} onChange={e => setForm({ ...form, userId: e.target.value })}>
                <option value="">-- เลือกผู้ใช้ --</option>
                {users.filter(u => u.role !== 'admin').map(u => (
                  <option key={u.user_id} value={u.user_id}>{u.name} ({u.username})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1 block">เลขห้อง / Room ID</label>
              <input className="w-full border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="เช่น A-101"
                value={form.roomId} onChange={e => setForm({ ...form, roomId: e.target.value })} />
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1 block">รายการ</label>
              <input className="w-full border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="เช่น ค่าส่วนกลาง เดือน พ.ค. 2026"
                value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1 block">ยอดเงิน (บาท) *</label>
              <input className="w-full border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                type="number" placeholder="5250"
                value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1 block">วันครบกำหนด</label>
              <input className="w-full border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                type="date"
                value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={() => { setShowModal(false); setMsg(''); }}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300">ยกเลิก</button>
              <button onClick={handleCreate} disabled={saving}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {saving ? 'กำลังสร้าง...' : '💳 สร้าง Invoice'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;
