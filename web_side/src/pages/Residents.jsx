import { useEffect, useState } from 'react';
import { Trash2, UserPlus, X } from 'lucide-react';

const API = 'http://localhost:3000';

const Residents = () => {
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ username: '', password: '', name: '', role: 'resident' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const load = () => {
    setLoading(true);
    fetch(`${API}/api/auth/users`)
      .then(r => r.json())
      .then(data => { setUsers(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id, name) => {
    if (!confirm(`ลบ "${name}" ออกจากระบบ?`)) return;
    await fetch(`${API}/api/auth/users/${id}`, { method: 'DELETE' });
    load();
  };

  const handleCreate = async () => {
    if (!form.username || !form.password || !form.name) {
      setMsg('กรุณากรอกข้อมูลให้ครบ'); return;
    }
    setSaving(true);
    const res = await fetch(`${API}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);
    if (data.success) {
      setShowModal(false);
      setForm({ username: '', password: '', name: '', role: 'resident' });
      setMsg('');
      load();
    } else {
      setMsg(data.message || 'เกิดข้อผิดพลาด');
    }
  };

  const roleLabel = { resident: 'ลูกบ้าน', admin: 'Admin', staff: 'เจ้าหน้าที่' };
  const roleColor = { resident: 'bg-blue-100 text-blue-700', admin: 'bg-purple-100 text-purple-700', staff: 'bg-green-100 text-green-700' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">จัดการลูกบ้าน</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <UserPlus size={18} /> เพิ่มผู้ใช้
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <p className="text-center text-gray-400 py-12">กำลังโหลด...</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left text-gray-500">
                <th className="px-6 py-4">ชื่อ</th>
                <th className="px-6 py-4">Username</th>
                <th className="px-6 py-4">สิทธิ์</th>
                <th className="px-6 py-4">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={i} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-800">{u.name}</td>
                  <td className="px-6 py-4 text-gray-600">{u.username}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColor[u.role] || 'bg-gray-100 text-gray-600'}`}>
                      {roleLabel[u.role] || u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDelete(u.user_id, u.name)}
                      className="text-red-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal เพิ่มผู้ใช้ */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">เพิ่มผู้ใช้ใหม่</h2>
              <button onClick={() => { setShowModal(false); setMsg(''); }}><X size={20} /></button>
            </div>
            {msg && <p className="text-red-500 text-sm">{msg}</p>}
            <input className="w-full border rounded-lg px-4 py-2 text-sm" placeholder="ชื่อ-นามสกุล"
              value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <input className="w-full border rounded-lg px-4 py-2 text-sm" placeholder="Username / เลขห้อง"
              value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
            <input className="w-full border rounded-lg px-4 py-2 text-sm" placeholder="รหัสผ่าน" type="password"
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            <select className="w-full border rounded-lg px-4 py-2 text-sm"
              value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
              <option value="resident">ลูกบ้าน</option>
              <option value="staff">เจ้าหน้าที่</option>
              <option value="admin">Admin</option>
            </select>
            <button
              onClick={handleCreate}
              disabled={saving}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {saving ? 'กำลังบันทึก...' : 'เพิ่มผู้ใช้'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Residents;