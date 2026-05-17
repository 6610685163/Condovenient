import { useEffect, useState } from 'react';
import { Trash2, UserPlus, X, Search, Filter, MoreHorizontal, Home, Eye, EyeOff, ChevronDown, List, LayoutGrid, Edit2 } from 'lucide-react';

const API = 'http://localhost:3000';

const Residents = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ username: '', password: '', name: '', role: 'resident' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [detailUser, setDetailUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // States สำหรับ Search, Filter, และ Dropdowns
  const [searchTerm, setSearchTerm] = useState('');
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('All Roles');
  const [actionMenuOpen, setActionMenuOpen] = useState(null); // เก็บ ID ของแถวที่ถูกกด 3 จุด

  const load = () => {
    setLoading(true);
    setError('');
    fetch(`${API}/api/auth/users`)
      .then(r => r.json())
      .then(data => { setUsers(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => { setError('ไม่สามารถโหลดข้อมูลได้'); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id, name) => {
    if (!confirm(`ลบ "${name}" ออกจากระบบ?`)) return;
    try {
      const res = await fetch(`${API}/api/auth/users/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        setSuccess(`ลบ "${name}" เรียบร้อยแล้ว`);
        if (detailUser?.user_id === id) setDetailUser(null);
        setTimeout(() => { setSuccess(''); load(); }, 1500);
      } else {
        setError(data.message || 'เกิดข้อผิดพลาดในการลบ');
      }
    } catch { setError('เกิดข้อผิดพลาดในการสื่อสารกับเซิร์ฟเวอร์'); }
  };

  const handleCreate = async () => {
    if (!form.username || !form.password || !form.name) { setError('กรุณากรอกข้อมูลให้ครบ'); return; }
    if (form.password.length < 6) { setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'); return; }
    setSaving(true); setError('');
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
        setTimeout(() => { setSuccess(''); load(); }, 1500);
      } else { setError(data.message || 'เกิดข้อผิดพลาด'); }
    } catch { setError('เกิดข้อผิดพลาดในการสื่อสารกับเซิร์ฟเวอร์'); setSaving(false); }
  };

  const getRoleStyle = (role) => {
    if (role === 'admin') return 'bg-purple-100 text-purple-700';
    if (role === 'resident' || role === 'owner') return 'bg-[#FEF3D8] text-[#9A6B01]';
    return 'bg-slate-100 text-slate-700';
  };

  // กรองผู้ใช้ตาม Search และ Role ที่เลือก
  const filteredUsers = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = selectedRoleFilter === 'All Roles' ||
      (selectedRoleFilter === 'Owner' && (u.role === 'owner' || u.role === 'resident')) ||
      (selectedRoleFilter === 'Admin' && u.role === 'admin') ||
      (selectedRoleFilter === 'Tenant' && u.role === 'tenant');
    return matchSearch && matchRole;
  });

  return (
    <div className="space-y-6 pb-8 font-sans relative">

      {/* ── Invisible Overlay สำหรับปิด Dropdown เมื่อคลิกที่ว่าง ── */}
      {(roleDropdownOpen || actionMenuOpen) && (
        <div className="fixed inset-0 z-10" onClick={() => { setRoleDropdownOpen(false); setActionMenuOpen(null); }}></div>
      )}

      {/* ── 1. Header & ✅ ปุ่ม Add Resident (ทรงแคปซูลยา สีทึบ) ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 relative z-0">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
            <Home size={14} /> <span>/</span> <span>Residents</span>
          </div>
          <h1 className="text-4xl font-serif font-bold text-slate-800">Resident Directory</h1>
        </div>
        <button
          onClick={() => { setShowModal(true); setError(''); }}
          // ✅ ปรับเป็น rounded-full และใช้สีเหลืองทึบ (Solid Amber) ตามดีไซน์เรฟ
          className="flex items-center gap-2 bg-[#FBBF24] hover:bg-[#F59E0B] text-slate-900 px-5 py-2.5 rounded-full font-semibold transition-colors active:scale-95"
        >
          <UserPlus size={18} /> Add Resident
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}
      {success && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm">{success}</div>}

      {/* ── 2. Stat Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-0">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-slate-50 rounded-bl-full"></div>
          <div className="relative z-10">
            <p className="text-xs font-bold text-slate-400 tracking-wider mb-2 uppercase">Total Residents</p>
            <h3 className="text-4xl font-serif font-bold text-slate-800">{loading ? '...' : users.length}</h3>
          </div>
        </div>
        <div className="bg-[#F6FAF7] p-6 rounded-2xl shadow-sm border border-[#E5F3EB] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-[#E5F3EB] rounded-bl-full"></div>
          <div className="relative z-10">
            <p className="text-xs font-bold text-slate-500 tracking-wider mb-2 uppercase">Active Residents</p>
            <h3 className="text-4xl font-serif font-bold text-emerald-600">6</h3>
          </div>
        </div>
        <div className="bg-[#FFF9F2] p-6 rounded-2xl shadow-sm border border-[#FDE6D5] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-[#FDE6D5] rounded-bl-full"></div>
          <div className="relative z-10">
            <p className="text-xs font-bold text-slate-500 tracking-wider mb-2 uppercase">Pending Approval</p>
            <h3 className="text-4xl font-serif font-bold text-amber-500">1</h3>
          </div>
        </div>
      </div>

      {/* ── ✅ 3. Toolbar (รวมอยู่ในกรอบแคปซูลยาวกรอบเดียว) ── */}
      <div className="bg-white rounded-full shadow-sm border border-slate-100 flex items-center p-1.5 relative z-20">

        {/* ช่อง Search */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by room, name, or email..."
            className="w-full pl-12 pr-4 py-2 bg-transparent border-none rounded-l-full text-sm focus:outline-none focus:ring-0"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 pr-2">
          {/* เส้นแบ่ง */}
          <div className="w-px h-6 bg-slate-200 hidden md:block"></div>

          {/* ✅ ปุ่มและ Dropdown All Roles */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-2.5 px-4 py-2 bg-transparent text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors whitespace-nowrap"
            >
              <Filter size={16} className="text-slate-400" /> {selectedRoleFilter} <ChevronDown size={14} className="text-slate-400" />
            </button>

            {/* เมนูตัวเลือก Roles */}
            {roleDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-40 bg-white border border-slate-100 shadow-lg rounded-xl py-2 z-50">
                <button onClick={() => { setSelectedRoleFilter('All Roles'); setRoleDropdownOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">All Roles</button>
                <button onClick={() => { setSelectedRoleFilter('Owner'); setRoleDropdownOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Owner</button>
                <button onClick={() => { setSelectedRoleFilter('Tenant'); setRoleDropdownOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Tenant</button>
                <button onClick={() => { setSelectedRoleFilter('Admin'); setRoleDropdownOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Admin</button>
              </div>
            )}
          </div>

          <div className="w-px h-6 bg-slate-200 hidden md:block"></div>

          {/* ✅ ปุ่ม View Toggle (List/Grid) ตามดีไซน์เรฟ */}
          <div className="hidden md:flex items-center bg-slate-50 border border-slate-200 rounded-full p-0.5">
            <button className="p-1.5 bg-white rounded-full text-slate-800 shadow-sm"><List size={16} /></button>
            <button className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors"><LayoutGrid size={16} /></button>
          </div>
        </div>
      </div>

      {/* ── 4. ตารางลูกบ้าน ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden relative z-0">
        {loading ? (
          <p className="text-center text-slate-400 py-12">กำลังโหลดข้อมูล...</p>
        ) : filteredUsers.length === 0 ? (
          <p className="text-center text-slate-400 py-12">ไม่พบข้อมูลลูกบ้าน</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr className="text-xs font-bold text-slate-700 tracking-wider uppercase">
                  <th className="px-6 py-4">Room/User</th>
                  <th className="px-6 py-4">Resident</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Move-in</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u, i) => {
                  const initials = u.name.substring(0, 2).toUpperCase();
                  return (
                    <tr
                      key={i}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                      onClick={() => { setDetailUser(u); setShowPassword(false); }}
                    >
                      <td className="px-6 py-4 font-bold text-amber-600 max-w-[150px] truncate" title={u.username}>
                        {u.username}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs flex-shrink-0">
                            {initials}
                          </div>
                          <span className="font-semibold text-slate-800 truncate">{u.name}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-slate-500 text-xs max-w-[180px]">
                        <p className="truncate" title={u.username}>{u.username.includes('@') ? u.username : `${u.username}@email.com`}</p>
                        <p className="mt-0.5">+1 (555) 000-0000</p>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`px-4 py-1.5 rounded-full text-xs font-semibold ${getRoleStyle(u.role)}`}>
                          {u.role === 'resident' ? 'Tenant' : u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="px-4 py-1.5 rounded-full text-xs font-semibold bg-[#E8F5E9] text-[#2E7D32]">
                          Active
                        </span>
                      </td>

                      <td className="px-6 py-4 text-slate-500 font-medium text-xs">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
                      </td>

                      {/* ✅ คอลัมน์ Actions พร้อมปุ่ม 3 จุดที่กดแล้วมี Popup Dropdown */}
                      <td className="px-6 py-4 text-center relative" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => setActionMenuOpen(actionMenuOpen === u.user_id ? null : u.user_id)}
                          className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded-full transition-colors"
                        >
                          <MoreHorizontal size={18} />
                        </button>

                        {/* Popup Menu 3 จุด */}
                        {actionMenuOpen === u.user_id && (
                          <div className="absolute right-12 top-10 w-44 bg-white border border-slate-100 shadow-xl rounded-xl z-50 py-1.5 text-left overflow-hidden">
                            <button
                              onClick={() => { setDetailUser(u); setShowPassword(false); setActionMenuOpen(null); }}
                              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                              <Eye size={16} className="text-slate-400" /> View Profile
                            </button>
                            <button
                              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                              <Edit2 size={16} className="text-slate-400" /> Edit
                            </button>
                            <div className="w-full h-px bg-slate-100 my-1"></div>
                            <button
                              onClick={() => { handleDelete(u.user_id, u.name); setActionMenuOpen(null); }}
                              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 size={16} className="text-red-400" /> Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── 5. Modals ── */}
      {detailUser && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-6 overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-serif font-bold text-slate-800">Resident Details</h2>
              <button onClick={() => setDetailUser(null)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>

            <div className="flex items-center gap-4 bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100">
              <div className="w-14 h-14 rounded-full bg-white border shadow-sm flex items-center justify-center text-slate-700 text-xl font-bold flex-shrink-0">
                {detailUser.name?.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-lg font-bold text-slate-800 truncate">{detailUser.name}</p>
                <span className={`inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-semibold ${getRoleStyle(detailUser.role)}`}>
                  {detailUser.role.charAt(0).toUpperCase() + detailUser.role.slice(1)}
                </span>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">User ID</label>
                <p className="text-sm font-mono bg-slate-50 px-3 py-2 rounded-xl text-slate-700 break-all border border-slate-100 mt-1">
                  {detailUser.user_id || '-'}
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Username / Room</label>
                <p className="text-sm font-mono bg-slate-50 px-3 py-2 rounded-xl text-slate-700 break-all border border-slate-100 mt-1">
                  {detailUser.username || '-'}
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Password Hash</label>
                <div className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-xl mt-1 border border-slate-100">
                  <p className="text-sm font-mono text-slate-600 truncate mr-2">
                    {showPassword ? detailUser.password : '••••••••••••••••'}
                  </p>
                  <button onClick={() => setShowPassword(!showPassword)} className="text-slate-400 hover:text-amber-500">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Date Created</label>
                <p className="text-sm font-medium text-slate-700 mt-1">
                  {detailUser.createdAt ? new Date(detailUser.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : '-'}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => { setDetailUser(null); handleDelete(detailUser.user_id, detailUser.name); }}
                className="flex items-center justify-center gap-2 bg-red-50 text-red-600 px-4 py-2.5 rounded-xl hover:bg-red-100 transition-colors text-sm font-semibold w-1/3 active:scale-95">
                <Trash2 size={16} /> Delete
              </button>
              <button onClick={() => setDetailUser(null)}
                className="flex-1 bg-slate-100 text-slate-700 py-2.5 rounded-xl hover:bg-slate-200 transition-colors text-sm font-semibold active:scale-95">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-serif font-bold text-slate-800">Add New Resident</h2>
              <button onClick={() => { setShowModal(false); setError(''); }} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>

            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-4">{error}</div>}

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Full Name</label>
                <input className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-400 focus:bg-white outline-none transition-all"
                  placeholder="e.g. Sarah Johnson" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Room Number / Username</label>
                <input className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-400 focus:bg-white outline-none transition-all"
                  placeholder="e.g. A-1201" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Password</label>
                <input className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-400 focus:bg-white outline-none transition-all"
                  placeholder="Minimum 6 characters" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Role</label>
                <select className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-400 focus:bg-white outline-none transition-all"
                  value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                  <option value="resident">Tenant / Resident</option>
                  <option value="owner">Owner</option>
                  <option value="technician">Technician</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-8">
              <button onClick={() => { setShowModal(false); setError(''); }}
                className="w-1/3 bg-slate-100 text-slate-700 py-2.5 rounded-xl hover:bg-slate-200 transition-colors font-semibold text-sm">Cancel</button>
              <button onClick={handleCreate} disabled={saving}
                className="flex-1 bg-[#FBBF24] hover:bg-[#F59E0B] text-slate-900 py-2.5 rounded-xl transition-colors font-semibold text-sm shadow-sm disabled:opacity-50 active:scale-95">
                {saving ? 'Saving...' : 'Add Resident'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Residents;
// import { useEffect, useState } from 'react';
// import { Trash2, UserPlus, X, AlertCircle, Eye, EyeOff, ChevronRight } from 'lucide-react';

// const API = 'http://localhost:3000';

// const Residents = () => {
//   const [users, setUsers]       = useState([]);
//   const [loading, setLoading]   = useState(true);
//   const [showModal, setShowModal] = useState(false);
//   const [form, setForm] = useState({ username: '', password: '', name: '', role: 'resident' });
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
//   const [detailUser, setDetailUser] = useState(null);
//   const [showPassword, setShowPassword] = useState(false);

//   const load = () => {
//     setLoading(true);
//     setError('');
//     fetch(`${API}/api/auth/users`)
//       .then(r => r.json())
//       .then(data => { setUsers(Array.isArray(data) ? data : []); setLoading(false); })
//       .catch(() => { setError('ไม่สามารถโหลดข้อมูลได้'); setLoading(false); });
//   };

//   useEffect(() => { load(); }, []);

//   const handleDelete = async (id, name) => {
//     if (!confirm(`ลบ "${name}" ออกจากระบบ?`)) return;
//     try {
//       const res = await fetch(`${API}/api/auth/users/${id}`, { method: 'DELETE' });
//       const data = await res.json();
//       if (res.ok) {
//         setSuccess(`ลบ "${name}" เรียบร้อยแล้ว`);
//         if (detailUser?.user_id === id) setDetailUser(null);
//         setTimeout(() => { setSuccess(''); load(); }, 1500);
//       } else {
//         setError(data.message || 'เกิดข้อผิดพลาดในการลบ');
//       }
//     } catch { setError('เกิดข้อผิดพลาดในการสื่อสารกับเซิร์ฟเวอร์'); }
//   };

//   const handleCreate = async () => {
//     if (!form.username || !form.password || !form.name) { setError('กรุณากรอกข้อมูลให้ครบ'); return; }
//     if (form.password.length < 6) { setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'); return; }
//     setSaving(true); setError('');
//     try {
//       const res = await fetch(`${API}/api/auth/register`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(form),
//       });
//       const data = await res.json();
//       setSaving(false);
//       if (data.success) {
//         setSuccess('เพิ่มผู้ใช้เรียบร้อยแล้ว');
//         setShowModal(false);
//         setForm({ username: '', password: '', name: '', role: 'resident' });
//         setTimeout(() => { setSuccess(''); load(); }, 1500);
//       } else { setError(data.message || 'เกิดข้อผิดพลาด'); }
//     } catch { setError('เกิดข้อผิดพลาดในการสื่อสารกับเซิร์ฟเวอร์'); setSaving(false); }
//   };

//   const roleLabel = { resident: 'ลูกบ้าน', admin: 'Admin', technician: 'ช่าง', staff: 'เจ้าหน้าที่' };
//   const roleColor = {
//     resident: 'bg-blue-100 text-blue-700',
//     admin: 'bg-purple-100 text-purple-700',
//     technician: 'bg-orange-100 text-orange-700',
//     staff: 'bg-green-100 text-green-700'
//   };

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <h1 className="text-2xl font-bold text-gray-800">จัดการลูกบ้าน</h1>
//         <button onClick={() => { setShowModal(true); setError(''); }}
//           className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
//           <UserPlus size={18} /> เพิ่มผู้ใช้
//         </button>
//       </div>

//       {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2"><AlertCircle size={18} className="mt-0.5 flex-shrink-0" /><span>{error}</span></div>}
//       {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">✅ {success}</div>}

//       <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
//         {loading ? <p className="text-center text-gray-400 py-12">กำลังโหลด...</p>
//           : users.length === 0 ? <p className="text-center text-gray-400 py-12">ยังไม่มีผู้ใช้ในระบบ</p>
//           : (
//           <table className="w-full text-sm">
//             <thead className="bg-gray-50 border-b">
//               <tr className="text-left text-gray-500">
//                 <th className="px-6 py-4">ชื่อ-นามสกุล</th>
//                 <th className="px-6 py-4">Username</th>
//                 <th className="px-6 py-4">บทบาท</th>
//                 <th className="px-6 py-4">วันที่สร้าง</th>
//                 <th className="px-6 py-4">จัดการ</th>
//               </tr>
//             </thead>
//             <tbody>
//               {users.map((u, i) => (
//                 <tr key={i} className="border-t hover:bg-blue-50 cursor-pointer transition-colors"
//                   onClick={() => { setDetailUser(u); setShowPassword(false); }}>
//                   <td className="px-6 py-4 font-medium text-gray-800">
//                     <span className="flex items-center gap-1">{u.name} <ChevronRight size={14} className="text-blue-400" /></span>
//                   </td>
//                   <td className="px-6 py-4 text-gray-600 font-mono text-sm">{u.username}</td>
//                   <td className="px-6 py-4">
//                     <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColor[u.role] || 'bg-gray-100 text-gray-600'}`}>{roleLabel[u.role] || u.role}</span>
//                   </td>
//                   <td className="px-6 py-4 text-gray-600 text-sm">{u.createdAt ? new Date(u.createdAt).toLocaleDateString('th-TH') : '-'}</td>
//                   <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
//                     <button onClick={() => handleDelete(u.user_id, u.name)}
//                       className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-all" title="ลบผู้ใช้">
//                       <Trash2 size={18} />
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         )}
//       </div>

//       {/* ── Modal รายละเอียด ── */}
//       {detailUser && (
//         <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
//           <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
//             <div className="flex items-center justify-between">
//               <h2 className="text-lg font-bold text-gray-800">ข้อมูลผู้ใช้</h2>
//               <button onClick={() => setDetailUser(null)}><X size={20} /></button>
//             </div>

//             <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-4">
//               <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xl font-bold">
//                 {detailUser.name?.charAt(0) || '?'}
//               </div>
//               <div>
//                 <p className="text-base font-bold text-gray-800">{detailUser.name}</p>
//                 <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleColor[detailUser.role] || 'bg-gray-100 text-gray-600'}`}>
//                   {roleLabel[detailUser.role] || detailUser.role}
//                 </span>
//               </div>
//             </div>

//             <div className="space-y-3">
//               <div>
//                 <label className="text-xs text-gray-400 block mb-1">User ID</label>
//                 <p className="text-sm font-mono bg-gray-50 px-3 py-2 rounded-lg text-gray-700 break-all">{detailUser.user_id || '-'}</p>
//               </div>
//               <div>
//                 <label className="text-xs text-gray-400 block mb-1">Username / เลขห้อง</label>
//                 <p className="text-sm font-mono bg-gray-50 px-3 py-2 rounded-lg text-gray-700">{detailUser.username || '-'}</p>
//               </div>
//               <div>
//                 <label className="text-xs text-gray-400 block mb-1">รหัสผ่าน</label>
//                 <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
//                   <p className="text-sm font-mono text-gray-700 flex-1 tracking-widest">
//                     {showPassword ? (detailUser.password || detailUser.passwordPlain || '(ถูก hash ไว้)') : '••••••••'}
//                   </p>
//                   <button onClick={() => setShowPassword(p => !p)} className="text-gray-400 hover:text-gray-700 transition-colors">
//                     {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//                   </button>
//                 </div>
//                 {!detailUser.password && !detailUser.passwordPlain && (
//                   <p className="text-xs text-orange-500 mt-1">* รหัสผ่านถูก hash ไว้ในระบบ ต้องเก็บรหัสต้นฉบับแยกต่างหาก</p>
//                 )}
//               </div>
//               <div>
//                 <label className="text-xs text-gray-400 block mb-1">วันที่สร้างบัญชี</label>
//                 <p className="text-sm bg-gray-50 px-3 py-2 rounded-lg text-gray-700">
//                   {detailUser.createdAt ? new Date(detailUser.createdAt).toLocaleString('th-TH') : '-'}
//                 </p>
//               </div>
//             </div>

//             <div className="flex gap-2 pt-2">
//               <button onClick={() => { setDetailUser(null); handleDelete(detailUser.user_id, detailUser.name); }}
//                 className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors text-sm">
//                 <Trash2 size={16} /> ลบผู้ใช้
//               </button>
//               <button onClick={() => setDetailUser(null)}
//                 className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm">ปิด</button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ── Modal เพิ่มผู้ใช้ ── */}
//       {showModal && (
//         <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
//           <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4 max-h-[90vh] overflow-y-auto">
//             <div className="flex items-center justify-between">
//               <h2 className="text-lg font-bold text-gray-800">เพิ่มผู้ใช้ใหม่</h2>
//               <button onClick={() => { setShowModal(false); setError(''); }}><X size={20} /></button>
//             </div>
//             {error && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">{error}</div>}
//             <div>
//               <label className="text-xs text-gray-500 block mb-1">ชื่อ-นามสกุล *</label>
//               <input className="w-full border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
//                 placeholder="เช่น สมชายดี ยืนยิ่ง" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
//             </div>
//             <div>
//               <label className="text-xs text-gray-500 block mb-1">Username (เลขห้อง/ID) *</label>
//               <input className="w-full border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
//                 placeholder="เช่น A-101 หรือ john_doe" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
//             </div>
//             <div>
//               <label className="text-xs text-gray-500 block mb-1">รหัสผ่าน (อย่างน้อย 6 ตัวอักษร) *</label>
//               <input className="w-full border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
//                 placeholder="••••••" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
//             </div>
//             <div>
//               <label className="text-xs text-gray-500 block mb-1">บทบาท</label>
//               <select className="w-full border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
//                 value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
//                 <option value="resident">ลูกบ้าน</option>
//                 <option value="technician">ช่าง</option>
//                 <option value="staff">เจ้าหน้าที่</option>
//                 <option value="admin">Admin</option>
//               </select>
//             </div>
//             <div className="flex gap-2 pt-2">
//               <button onClick={() => { setShowModal(false); setError(''); }}
//                 className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors">ยกเลิก</button>
//               <button onClick={handleCreate} disabled={saving}
//                 className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
//                 {saving ? 'กำลังบันทึก...' : 'เพิ่มผู้ใช้'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Residents;
