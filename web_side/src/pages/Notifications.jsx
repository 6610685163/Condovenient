import { useState, useEffect, useCallback } from 'react';
import { Send, Bell, Home, ChevronDown, User, CheckCircle } from 'lucide-react';

const API = 'http://localhost:3000';

const Notifications = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [notifList, setNotifList] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const [form, setForm] = useState({ userId: '', title: '', message: '', priority: 'Normal' });
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [activeTab, setActiveTab] = useState('recent');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // ✅ State สำหรับเก็บข้อมูล Recent Broadcast ของจริง
  const [recentNotifs, setRecentNotifs] = useState([]);

  // โหลดรายชื่อผู้ใช้งาน
  useEffect(() => {
    fetch(`${API}/api/auth/users`)
      .then(r => r.json())
      .then(data => setUsers(Array.isArray(data) ? data : []));
  }, []);

  // ✅ โหลดประวัติการแจ้งเตือนทั้งหมด (Recent) จาก Backend
  const loadRecent = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/notifications/all`);
      const data = await res.json();
      if (data.success) {
        setRecentNotifs(data.notifications);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => { loadRecent(); }, [loadRecent]);

  // โหลดประวัติของลูกบ้านรายบุคคล
  const loadNotifs = useCallback(async () => {
    if (!selectedUser) return;
    setLoadingNotifs(true);
    try {
      const res = await fetch(`${API}/api/notifications/${selectedUser}`);
      const data = await res.json();
      setNotifList(data.success ? data.notifications : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingNotifs(false);
    }
  }, [selectedUser]);

  useEffect(() => { if (activeTab === 'resident') loadNotifs(); }, [loadNotifs, activeTab]);

  const handleMarkRead = async (notifId) => {
    await fetch(`${API}/api/notifications/${notifId}/read`, { method: 'PATCH' });
    loadNotifs();
  };

  const handleMarkAllRead = async () => {
    const unread = notifList.filter(n => !n.isRead);
    await Promise.all(unread.map(n => fetch(`${API}/api/notifications/${n.id}/read`, { method: 'PATCH' })));
    loadNotifs();
  };

  const handleSend = async () => {
    if (!form.userId || !form.title || !form.message) {
      setMsg('Please fill in all required fields.'); return;
    }
    setSending(true);
    setMsg('');

    try {
      // ✅ ส่งข้อมูลไปบันทึกที่ Backend จริงๆ
      await fetch(`${API}/api/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: form.userId,
          title: form.title,
          message: form.message,
          priority: form.priority,
          type: 'general'
        }),
      });

      setSuccessMsg('✅ Notification sent successfully!');
      setForm({ userId: '', title: '', message: '', priority: 'Normal' });

      // ✅ โหลดข้อมูลภาพรวมใหม่ทันที
      loadRecent();

      // ถ้ายืนอยู่หน้าลูกบ้านคนนั้นพอดี ก็โหลดข้อมูลเขาใหม่ด้วย
      if (selectedUser === form.userId && activeTab === 'resident') loadNotifs();

      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (e) {
      setMsg('Failed to send notification.');
    } finally {
      setSending(false);
    }
  };

  const unreadCount = notifList.filter(n => !n.isRead).length;

  const formatDate = (ts) => {
    if (!ts) return '';
    const d = ts._seconds ? new Date(ts._seconds * 1000) : new Date(ts);
    return d.toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  // Helper สำหรับหาชื่อผู้รับไปโชว์ใน Recent
  const getRecipientName = (userId) => {
    if (userId === 'all') return 'All Residents';
    const u = users.find(u => u.user_id == userId);
    return u ? `${u.name} (${u.username})` : 'Resident';
  };

  return (
    <div className="space-y-6 pb-8 font-sans relative">

      {userDropdownOpen && (
        <div className="fixed inset-0 z-10" onClick={() => setUserDropdownOpen(false)}></div>
      )}

      {/* Header */}
      <div className="mb-6 relative z-0">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
          <Home size={14} /> <span>/</span> <span>Notifications</span>
        </div>
        <h1 className="text-4xl font-serif font-bold text-slate-800">Notifications</h1>
        <p className="text-sm text-slate-500 mt-2">Send announcements and alerts to residents</p>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm transition-all">{successMsg}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* ฟอร์มส่ง (ซ้าย) */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
          <div className="flex items-center gap-2 mb-2">
            <Bell size={20} className="text-amber-500" />
            <h2 className="text-lg font-bold text-slate-800">New Notification</h2>
          </div>
          <p className="text-sm text-slate-500 mb-8">Compose and send notifications to residents</p>

          {msg && <p className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm mb-6">{msg}</p>}

          <div className="space-y-6">
            <div>
              <label className="text-sm font-semibold text-slate-800 block mb-2">Recipients</label>
              <select
                className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-amber-400 focus:bg-white outline-none transition-all text-slate-700"
                value={form.userId} onChange={e => setForm({ ...form, userId: e.target.value })}
              >
                <option value="" disabled>Select recipients...</option>
                <option value="all" className="font-bold text-amber-600">Broadcast to All Residents</option>
                {users.map(u => (
                  <option key={u.user_id} value={u.user_id}>{u.name} ({u.username})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-800 block mb-2">Title</label>
              <input
                className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-amber-400 focus:bg-white outline-none transition-all text-slate-700"
                placeholder="Enter notification title..."
                value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-800 block mb-2">Priority</label>
              <select
                className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-amber-400 focus:bg-white outline-none transition-all text-slate-700"
                value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}
              >
                <option value="Normal">Normal</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-800 block mb-2">Message</label>
              <textarea
                className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-amber-400 focus:bg-white outline-none transition-all text-slate-700 resize-none min-h-[120px]"
                placeholder="Write your notification message..."
                value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button className="px-6 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors active:scale-95">
                Save as Draft
              </button>
              <button
                onClick={handleSend} disabled={sending}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-slate-900 bg-[#FBBF24] hover:bg-[#F59E0B] transition-colors active:scale-95 shadow-sm shadow-amber-200/50 disabled:opacity-50"
              >
                <Send size={16} />
                {sending ? 'Sending...' : 'Send Notification'}
              </button>
            </div>
          </div>
        </div>

        {/* ระบบแท็บ (ขวา) */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col h-[680px]">

          <div className="flex bg-slate-100 rounded-full p-1 mb-5">
            <button
              onClick={() => setActiveTab('recent')}
              className={`flex-1 text-center py-2 text-xs font-bold rounded-full transition-all ${activeTab === 'recent' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Recent Broadcast
            </button>
            <button
              onClick={() => setActiveTab('resident')}
              className={`flex-1 text-center py-2 text-xs font-bold rounded-full transition-all ${activeTab === 'resident' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Resident History
            </button>
          </div>

          {/* แท็บ Recent (ของจริง) */}
          {activeTab === 'recent' && (
            <div className="flex-1 flex flex-col min-h-0">
              <h2 className="font-bold text-slate-800 text-sm mb-1">Recent Notifications</h2>
              <p className="text-xs text-slate-400 mb-4">History of sent announcements</p>

              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                {recentNotifs.length === 0 ? (
                  <div className="text-center text-slate-400 py-20 text-xs italic">No notifications sent yet.</div>
                ) : (
                  recentNotifs.map((notif) => (
                    <div key={notif.id} className="border border-slate-100 rounded-xl p-4 hover:bg-slate-50/50 transition-colors">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-slate-800 text-sm mb-1 pr-2">{notif.title}</h3>
                        {notif.priority === 'Urgent' && <span className="text-[9px] font-bold bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded">URGENT</span>}
                      </div>
                      <p className="text-xs text-slate-500 mb-3 truncate">To: {getRecipientName(notif.userId)}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400">{formatDate(notif.createdAt)}</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-bold">
                          Sent
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* แท็บ Resident (แก้บั๊กจอขาวแล้ว) */}
          {activeTab === 'resident' && (
            <div className="flex-1 flex flex-col min-h-0 relative">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-slate-800 text-sm">Resident History</h2>
                {unreadCount > 0 && (
                  <button onClick={handleMarkAllRead} className="text-xs text-amber-600 font-semibold flex items-center gap-1 hover:text-amber-700">
                    <CheckCircle size={12} /> Read All ({unreadCount})
                  </button>
                )}
              </div>

              <div className="relative mb-4 z-20">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="w-full flex items-center justify-between bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 text-xs font-semibold hover:bg-slate-100 transition-colors"
                >
                  <span className="flex items-center gap-2 truncate">
                    <User size={14} className="text-slate-400" />
                    {selectedUser ? users.find(u => u.user_id == selectedUser)?.name : 'Select Resident...'}
                  </span>
                  <ChevronDown size={14} className="text-slate-400 flex-shrink-0 ml-2" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1 max-h-52 overflow-y-auto bg-white border border-slate-100 shadow-xl rounded-xl py-1.5 text-xs z-50">
                    <button
                      onClick={() => { setSelectedUser(''); setNotifList([]); setUserDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2 text-slate-400 hover:bg-slate-50 font-medium"
                    >
                      -- Clear Selection --
                    </button>
                    {users.map(u => (
                      <button
                        key={u.user_id}
                        onClick={() => { setSelectedUser(u.user_id); setUserDropdownOpen(false); }}
                        className={`w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 font-medium flex justify-between ${selectedUser === u.user_id ? 'bg-amber-50/50 text-amber-700 font-bold' : ''}`}
                      >
                        <span>{u.name}</span>
                        <span className="text-slate-400 font-mono text-[10px]">{u.username}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {!selectedUser ? (
                  <div className="text-center text-slate-400 py-20 text-xs italic">Please select a resident to view history.</div>
                ) : loadingNotifs ? (
                  <div className="text-center text-slate-400 py-20 text-xs">Loading history...</div>
                ) : notifList.length === 0 ? (
                  <div className="text-center text-slate-400 py-20 text-xs italic">No notification records found.</div>
                ) : (
                  notifList.map(n => (
                    <div
                      key={n.id}
                      className={`p-4 border rounded-xl text-xs transition-all relative ${n.isRead ? 'bg-slate-50/70 border-slate-100' : 'bg-amber-50/20 border-amber-100'}`}
                    >
                      <div className="flex justify-between items-start gap-2 mb-1.5">
                        <span className="font-bold text-slate-800 text-sm break-all pr-4">{n.title}</span>
                        {!n.isRead && (
                          <button
                            onClick={() => handleMarkRead(n.id)}
                            className="absolute top-3 right-3 text-[10px] bg-amber-400 hover:bg-amber-500 text-slate-900 px-1.5 py-0.5 rounded font-bold transition-colors"
                            title="Mark as Read"
                          >
                            ✓
                          </button>
                        )}
                      </div>
                      <p className="text-slate-600 mb-2 leading-relaxed break-all">{n.message}</p>
                      <div className="text-[10px] text-slate-400 font-medium">{formatDate(n.createdAt)}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default Notifications;
