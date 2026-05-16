import { useState, useEffect, useCallback } from 'react';
import { Send, Bell, CheckCheck, RefreshCw, Trash2 } from 'lucide-react';

const API = 'http://localhost:3000';

const Notifications = () => {
  const [users, setUsers]   = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [notifList, setNotifList] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const [form, setForm] = useState({ userId: '', title: '', message: '', type: 'general' });
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetch(`${API}/api/auth/users`)
      .then(r => r.json())
      .then(data => setUsers(Array.isArray(data) ? data : []));
  }, []);

  const loadNotifs = useCallback(async () => {
    if (!selectedUser) return;
    setLoadingNotifs(true);
    try {
      const res = await fetch(`${API}/api/auth/notifications/${selectedUser}`);
      const data = await res.json();
      setNotifList(data.success ? data.notifications : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingNotifs(false);
    }
  }, [selectedUser]);

  useEffect(() => { loadNotifs(); }, [loadNotifs]);

  const handleMarkRead = async (notifId) => {
    await fetch(`${API}/api/auth/notifications/${notifId}/read`, { method: 'PATCH' });
    loadNotifs();
  };

  const handleMarkAllRead = async () => {
    const unread = notifList.filter(n => !n.isRead);
    await Promise.all(unread.map(n => fetch(`${API}/api/auth/notifications/${n.id}/read`, { method: 'PATCH' })));
    loadNotifs();
  };

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
      setForm({ userId: form.userId, title: '', message: '', type: 'general' });
      setMsg('');
      setSuccessMsg('✅ ส่งการแจ้งเตือนสำเร็จ!');
      setTimeout(() => { setSuccessMsg(''); if (selectedUser === form.userId) loadNotifs(); }, 2000);
    } else {
      setMsg(data.message || 'เกิดข้อผิดพลาด');
    }
  };

  const typeOptions = [
    { value: 'general', label: '📢 ทั่วไป' },
    { value: 'payment', label: '💳 การชำระเงิน' },
    { value: 'repair', label: '🔧 แจ้งซ่อม' },
  ];
  const typeColors = {
    general: 'bg-gray-100 text-gray-600',
    payment: 'bg-blue-100 text-blue-600',
    repair: 'bg-orange-100 text-orange-600',
    parcel: 'bg-purple-100 text-purple-600',
  };

  const unreadCount = notifList.filter(n => !n.isRead).length;

  const formatDate = (ts) => {
    if (!ts) return '';
    const d = ts._seconds ? new Date(ts._seconds * 1000) : new Date(ts);
    return `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()} ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">ระบบแจ้งเตือน</h1>

      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">{successMsg}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ส่ง Notification */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
            <Send size={18} /> ส่ง Notification ใหม่
          </h2>

          {msg && <p className="text-red-500 text-sm">{msg}</p>}

          <div>
            <label className="text-xs text-gray-500 mb-1 block">ส่งถึง *</label>
            <select className="w-full border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={form.userId} onChange={e => setForm({ ...form, userId: e.target.value })}>
              <option value="">-- เลือกผู้รับ --</option>
              {users.map(u => (
                <option key={u.user_id} value={u.user_id}>{u.name} ({u.username})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">ประเภท</label>
            <select className="w-full border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
              {typeOptions.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">หัวข้อ *</label>
            <input className="w-full border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="เช่น แจ้งเตือนค่าส่วนกลาง"
              value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">ข้อความ *</label>
            <textarea className="w-full border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              rows={4} placeholder="รายละเอียดการแจ้งเตือน..."
              value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} />
          </div>

          <button onClick={handleSend} disabled={sending}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 w-full justify-center">
            <Send size={16} />
            {sending ? 'กำลังส่ง...' : 'ส่ง Notification'}
          </button>
        </div>

        {/* ดู Notifications ของลูกบ้าน */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
              <Bell size={18} /> ดู Notifications
              {unreadCount > 0 && (
                <span className="bg-red-100 text-red-600 text-xs rounded-full px-2 py-0.5">{unreadCount} ยังไม่อ่าน</span>
              )}
            </h2>
            <button onClick={loadNotifs} className="text-gray-400 hover:text-gray-600">
              <RefreshCw size={14} />
            </button>
          </div>

          <div className="flex gap-2">
            <select className="flex-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={selectedUser} onChange={e => setSelectedUser(e.target.value)}>
              <option value="">-- เลือกลูกบ้าน --</option>
              {users.map(u => (
                <option key={u.user_id} value={u.user_id}>{u.name} ({u.username})</option>
              ))}
            </select>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-xs text-blue-600 border border-blue-200 px-3 py-2 rounded-lg hover:bg-blue-50">
                <CheckCheck size={14} /> อ่านทั้งหมด
              </button>
            )}
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {!selectedUser ? (
              <p className="text-gray-400 text-sm text-center py-8">เลือกลูกบ้านเพื่อดูการแจ้งเตือน</p>
            ) : loadingNotifs ? (
              <p className="text-gray-400 text-sm text-center py-8">กำลังโหลด...</p>
            ) : notifList.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">ยังไม่มีการแจ้งเตือน</p>
            ) : notifList.map(n => (
              <div key={n.id}
                className={`p-3 rounded-lg border text-sm transition-all ${n.isRead ? 'bg-gray-50 border-gray-100' : 'bg-blue-50 border-blue-100'}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${typeColors[n.type] || 'bg-gray-100 text-gray-600'}`}>
                        {n.type}
                      </span>
                      {!n.isRead && <span className="w-2 h-2 bg-blue-500 rounded-full inline-block" />}
                    </div>
                    <p className="font-medium text-gray-800">{n.title}</p>
                    <p className="text-gray-600 text-xs mt-0.5">{n.message}</p>
                    <p className="text-gray-400 text-xs mt-1">{formatDate(n.createdAt)}</p>
                  </div>
                  {!n.isRead && (
                    <button onClick={() => handleMarkRead(n.id)}
                      className="text-xs text-blue-600 hover:text-blue-800 shrink-0 mt-1">
                      ✓
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
