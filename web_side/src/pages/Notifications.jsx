import { useState } from 'react';
import { Send, X } from 'lucide-react';
import { useEffect } from 'react';

const API = 'http://localhost:3000';

const Notifications = () => {
  const [users, setUsers]   = useState([]);
  const [form, setForm]     = useState({ userId: '', title: '', message: '', type: 'general' });
  const [sending, setSending] = useState(false);
  const [msg, setMsg]       = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetch(`${API}/api/auth/users`)
      .then(r => r.json())
      .then(data => setUsers(Array.isArray(data) ? data : []));
  }, []);

  const handleSend = async () => {
    if (!form.userId || !form.title || !form.message) {
      setMsg('กรุณากรอกข้อมูลให้ครบ'); return;
    }
    setSending(true);
    const res = await fetch(`${API}/api/auth/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSending(false);
    if (data.success) {
      setForm({ userId: '', title: '', message: '', type: 'general' });
      setMsg('');
      setSuccessMsg('ส่งการแจ้งเตือนสำเร็จ!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } else {
      setMsg(data.message || 'เกิดข้อผิดพลาด');
    }
  };

  const typeOptions = [
    { value: 'general', label: 'ทั่วไป' },
    { value: 'payment', label: 'การชำระเงิน' },
    { value: 'repair',  label: 'แจ้งซ่อม' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">ส่ง Notification</h1>

      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          ✅ {successMsg}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-lg space-y-4">
        {msg && <p className="text-red-500 text-sm">{msg}</p>}

        <div>
          <label className="text-xs text-gray-500 mb-1 block">ส่งถึง</label>
          <select className="w-full border rounded-lg px-4 py-2 text-sm"
            value={form.userId} onChange={e => setForm({ ...form, userId: e.target.value })}>
            <option value="">-- เลือกผู้รับ --</option>
            {users.map(u => (
              <option key={u.user_id} value={u.user_id}>{u.name} ({u.username})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1 block">ประเภท</label>
          <select className="w-full border rounded-lg px-4 py-2 text-sm"
            value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
            {typeOptions.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1 block">หัวข้อ</label>
          <input className="w-full border rounded-lg px-4 py-2 text-sm" placeholder="เช่น แจ้งเตือนค่าส่วนกลาง"
            value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1 block">ข้อความ</label>
          <textarea className="w-full border rounded-lg px-4 py-2 text-sm" rows={4}
            placeholder="รายละเอียดการแจ้งเตือน..."
            value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} />
        </div>

        <button
          onClick={handleSend}
          disabled={sending}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <Send size={16} />
          {sending ? 'กำลังส่ง...' : 'ส่ง Notification'}
        </button>
      </div>
    </div>
  );
};

export default Notifications;