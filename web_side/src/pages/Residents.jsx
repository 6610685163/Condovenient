import { useEffect, useState } from 'react';
import { Trash2, UserPlus, X, AlertCircle } from 'lucide-react';

const API = 'http://localhost:3000';

const Residents = () => {
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ username: '', password: '', name: '', role: 'resident' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    fetch(`${API}/api/auth/users`)
      .then(r => r.json())
      .then(data => { 
        setUsers(Array.isArray(data) ? data : []); 
        setLoading(false); 
      })
      .catch(err => {
        console.error(err);
        setError('ไม่สามารถโหลดข้อมูลได้');
        setLoading(false);
      });
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id, name) => {
    if (!confirm(`ลบ "${name}" ออกจากระบบ?`)) return;
    try {
      const res = await fetch(`${API}/api/auth/users/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        setSuccess(`ลบ "${name}" เรียบร้อยแล้ว`);
        setTimeout(() => {
          setSuccess('');
          load();
        }, 1500);
      } else {
        setError(data.message || 'เกิดข้อผิดพลาดในการลบ');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการสื่อสารกับเซิร์ฟเวอร์');
    }
  };

  const handleCreate = async () => {
    if (!form.username || !form.password || !form.name) {
      setError('กรุณากรอกข้อมูลให้ครบ');
      return;
    }
    
    if (form.password.length < 6) {
      setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const res = await fetch(`${API}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setSaving(false);
      if (data.success) {
        setSuccess('เพิ่มผู้ใช้เรียบร้อยแล้ว');
        setShowModal(false);
        setForm({ username: '', password: '', name: '', role: 'resident' });
        setTimeout(() => {
          setSuccess('');
          load();
        }, 1500);
      } else {
        setError(data.message || 'เกิดข้อผิดพลาด');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการสื่อสารกับเซิร์ฟเวอร์');
      setSaving(false);
    }
  };

  const roleLabel = { resident: 'ลูกบ้าน', admin: 'Admin', technician: 'ช่าง', staff: 'เจ้าหน้าที่' };
  const roleColor = { 
    resident: 'bg-blue-100 text-blue-700', 
    admin: 'bg-purple-100 text-purple-700', 
    technician: 'bg-orange-100 text-orange-700',
    staff: 'bg-green-100 text-green-700' 
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">จัดการลูกบ้าน</h1>
        <button
          onClick={() => { setShowModal(true); setError(''); }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <UserPlus size={18} /> เพิ่มผู้ใช้
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
          <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
          <span>{error}</span>
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
        ) : users.length === 0 ? (
          <p className="text-center text-gray-400 py-12">ยังไม่มีผู้ใช้ในระบบ</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left text-gray-500">
                <th className="px-6 py-4">ชื่อ-นามสกุล</th>
                <th className="px-6 py-4">Username</th>
                <th className="px-6 py-4">บทบาท</th>
                <th className="px-6 py-4">วันที่สร้าง</th>
                <th className="px-6 py-4">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={i} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-800">{u.name}</td>
                  <td className="px-6 py-4 text-gray-600 font-mono text-sm">{u.username}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColor[u.role] || 'bg-gray-100 text-gray-600'}`}>
                      {roleLabel[u.role] || u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-sm">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString('th-TH') : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDelete(u.user_id, u.name)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-all"
                      title="ลบผู้ใช้"
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
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">เพิ่มผู้ใช้ใหม่</h2>
              <button onClick={() => { setShowModal(false); setError(''); }}><X size={20} /></button>
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="text-xs text-gray-500 block mb-1">ชื่อ-นามสกุล *</label>
              <input 
                className="w-full border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="เช่น สมชายดี ยืนยิ่ง"
                value={form.name} 
                onChange={e => setForm({ ...form, name: e.target.value })} 
              />
            </div>

            <div>
              <label className="text-xs text-gray-500 block mb-1">Username (เลขห้อง/ID) *</label>
              <input 
                className="w-full border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="เช่น A-101 หรือ john_doe"
                value={form.username} 
                onChange={e => setForm({ ...form, username: e.target.value })} 
              />
            </div>

            <div>
              <label className="text-xs text-gray-500 block mb-1">รหัสผ่าน (อย่างน้อย 6 ตัวอักษร) *</label>
              <input 
                className="w-full border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="••••••"
                type="password"
                value={form.password} 
                onChange={e => setForm({ ...form, password: e.target.value })} 
              />
            </div>

            <div>
              <label className="text-xs text-gray-500 block mb-1">บทบาท</label>
              <select 
                className="w-full border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.role} 
                onChange={e => setForm({ ...form, role: e.target.value })}
              >
                <option value="resident">ลูกบ้าน</option>
                <option value="technician">ช่าง</option>
                <option value="staff">เจ้าหน้าที่</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => { setShowModal(false); setError(''); }}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleCreate}
                disabled={saving}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'กำลังบันทึก...' : 'เพิ่มผู้ใช้'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Residents;