import { useEffect, useState, useCallback } from 'react';
import { Plus, X, Search, Filter, MoreHorizontal, Home, ChevronDown, Edit2, Trash2, Wrench } from 'lucide-react';

const API = 'http://localhost:3000';

const Invoices = () => {
  const [users, setUsers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // States สำหรับแก้ไข
  const [editingInvoice, setEditingInvoice] = useState(null);

  // Form State
  const [form, setForm] = useState({ userId: '', roomId: '', amount: '', description: 'ค่าส่วนกลาง', dueDate: '', status: 'pending' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // UI States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [filterOpen, setFilterOpen] = useState(false);
  const [actionMenuOpenId, setActionMenuOpenId] = useState(null);

  // 1. Logic ดึงข้อมูล
  const loadAllInvoices = useCallback(async (usersList) => {
    if (!usersList || usersList.length === 0) return;
    setLoading(true);
    try {
      const promises = usersList.filter(u => u.role !== 'admin').map(u =>
        fetch(`${API}/api/payment/invoices/${u.user_id}`).then(r => r.json()).catch(() => ({ success: false, invoices: [] }))
      );
      const results = await Promise.all(promises);
      let allInvoices = [];
      results.forEach((res, index) => {
        if (res.success && res.invoices) {
          const validUsers = usersList.filter(u => u.role !== 'admin');
          const enrichedInvoices = res.invoices.map(inv => ({
            ...inv,
            userName: validUsers[index]?.name || 'Unknown',
            roomId: validUsers[index]?.username || '-'
          }));
          allInvoices = [...allInvoices, ...enrichedInvoices];
        }
      });
      allInvoices.sort((a, b) => {
        const dateA = a.createdAt?._seconds ? a.createdAt._seconds * 1000 : new Date(a.createdAt).getTime();
        const dateB = b.createdAt?._seconds ? b.createdAt._seconds * 1000 : new Date(b.createdAt).getTime();
        return dateB - dateA;
      });
      setInvoices(allInvoices);
    } catch (e) { console.error("Error loading invoices:", e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetch(`${API}/api/auth/users`)
      .then(r => r.json())
      .then(data => {
        const usersData = Array.isArray(data) ? data : [];
        setUsers(usersData);
        loadAllInvoices(usersData);
      });
  }, [loadAllInvoices]);

  // 2. ฟังก์ชันเปิด Modal แก้ไข
  const handleOpenEditModal = (inv) => {
    setEditingInvoice(inv);
    setForm({
      userId: inv.userId || '',
      roomId: inv.roomId || '',
      amount: inv.amount || '',
      description: inv.description || '',
      dueDate: inv.dueDate ? new Date(inv.dueDate).toISOString().split('T')[0] : '',
      status: inv.status || 'pending'
    });
    setMsg('');
    setShowModal(true);
  };

  // 3. ฟังก์ชันบันทึกข้อมูล (สร้าง / แก้ไข)
  const handleSubmit = async () => {
    if (!form.userId || !form.amount) { setMsg('กรุณาเลือกผู้ใช้และระบุยอดเงิน'); return; }
    setSaving(true);
    setMsg('');

    const url = editingInvoice
      ? `${API}/api/payment/invoices/${editingInvoice.id}`
      : `${API}/api/payment/invoices`;

    const method = editingInvoice ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setSaving(false);

      if (data.success) {
        setShowModal(false);
        setEditingInvoice(null);
        setForm({ userId: '', roomId: '', amount: '', description: 'ค่าส่วนกลาง', dueDate: '', status: 'pending' });
        setSuccessMsg(`✅ ${editingInvoice ? 'Updated' : 'Created'} Invoice successfully!`);
        loadAllInvoices(users);
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        setMsg(data.error || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      }
    } catch (e) {
      setMsg('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
      setSaving(false);
    }
  };

  // 4. ฟังก์ชันลบ Invoice
  const handleDelete = async (invId) => {
    if (!confirm('คุณต้องการลบ Invoice นี้ใช่หรือไม่? (การกระทำนี้ไม่สามารถย้อนกลับได้)')) return;
    try {
      const res = await fetch(`${API}/api/payment/invoices/${invId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success || res.ok) {
        setSuccessMsg('✅ ลบ Invoice เรียบร้อยแล้ว');
        loadAllInvoices(users);
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        setMsg(data.error || 'เกิดข้อผิดพลาดในการลบ');
      }
    } catch (e) {
      console.error(e);
      setMsg('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
    }
  };

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '-';
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid': return 'bg-[#E8F5E9] text-[#2E7D32]';
      case 'pending': return 'bg-[#FEF3D8] text-[#9A6B01]';
      case 'overdue': return 'bg-[#FFF1F2] text-[#E11D48]';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const totalUnpaid = invoices.filter(i => i.status === 'pending' || i.status === 'overdue').reduce((s, i) => s + (Number(i.amount) || 0), 0);
  const totalCollected = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + (Number(i.amount) || 0), 0);
  const overdueCount = invoices.filter(i => i.status === 'overdue').length;

  const filteredInvoices = invoices.filter(inv =>
    (inv.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.roomId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.userName?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (statusFilter === 'All Status' || inv.status?.toLowerCase() === statusFilter.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-8 font-sans relative">

      {/* แก้ไข: แยก Overlay ของ Filter ให้ออกมาเดี่ยวๆ ไม่ไปยุ่งกับเมนู 3 จุด */}
      {filterOpen && (
        <div className="fixed inset-0 z-10" onClick={() => setFilterOpen(false)}></div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 relative z-0">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
            <Home size={14} /> <span>/</span> <span>Invoices</span>
          </div>
          <h1 className="text-4xl font-serif font-bold text-slate-800">Invoice Management</h1>
        </div>
        <button
          onClick={() => { setShowModal(true); setEditingInvoice(null); setMsg(''); setForm({ userId: '', roomId: '', amount: '', description: 'ค่าส่วนกลาง', dueDate: '', status: 'pending' }); }}
          className="flex items-center gap-2 bg-[#FBBF24] hover:bg-[#F59E0B] text-slate-900 px-6 py-2.5 rounded-full font-semibold transition-colors active:scale-95 shadow-sm"
        >
          <Plus size={18} /> Create Invoice
        </button>
      </div>

      {successMsg && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm z-0 relative">{successMsg}</div>}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-0">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-[#FFF9F2] rounded-bl-full"></div>
          <p className="text-[10px] font-bold text-slate-400 tracking-[0.1em] mb-2 uppercase">TOTAL UNPAID</p>
          <h3 className="text-4xl font-serif font-bold text-[#D97706]">฿{totalUnpaid.toLocaleString()}</h3>
        </div>
        <div className="bg-[#F6FAF7] p-6 rounded-2xl shadow-sm border border-[#E5F3EB] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-[#E5F3EB] rounded-bl-full"></div>
          <p className="text-[10px] font-bold text-slate-500 tracking-[0.1em] mb-2 uppercase">COLLECTED THIS MONTH</p>
          <h3 className="text-4xl font-serif font-bold text-[#059669]">฿{totalCollected.toLocaleString()}</h3>
        </div>
        <div className="bg-[#FFF1F2] p-6 rounded-2xl shadow-sm border border-[#FFE4E6] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-[#FFE4E6] rounded-bl-full"></div>
          <p className="text-[10px] font-bold text-slate-500 tracking-[0.1em] mb-2 uppercase">OVERDUE INVOICES</p>
          <h3 className="text-4xl font-serif font-bold text-[#E11D48]">{overdueCount}</h3>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-full shadow-sm border border-slate-100 flex items-center p-1.5 focus-within:ring-2 focus-within:ring-amber-400/50 transition-all relative z-20">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by room, resident, or description..."
            className="w-full pl-12 pr-4 py-2.5 bg-transparent border-none rounded-l-full text-sm focus:outline-none focus:ring-0"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-px h-6 bg-slate-200 hidden md:block"></div>
        <div className="relative">
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="flex items-center gap-2.5 px-6 py-2.5 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors whitespace-nowrap"
          >
            <Filter size={16} className="text-slate-400" /> {statusFilter} <ChevronDown size={14} className="text-slate-400" />
          </button>

          {filterOpen && (
            <div className="absolute right-0 top-full mt-2 w-40 bg-white border border-slate-100 shadow-xl rounded-xl py-2 z-50 overflow-hidden">
              {['All Status', 'Paid', 'Pending', 'Overdue'].map(status => (
                <button
                  key={status}
                  onClick={() => { setStatusFilter(status); setFilterOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                >
                  {status}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ตาราง Invoices */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-visible relative z-10">
        {loading ? (
          <p className="text-center text-slate-400 py-12">กำลังโหลดข้อมูล Invoices...</p>
        ) : filteredInvoices.length === 0 ? (
          <p className="text-center text-slate-400 py-12">ไม่พบข้อมูล Invoice</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr className="text-xs font-bold text-slate-700 tracking-wider uppercase">
                  <th className="px-6 py-4">Invoice ID</th>
                  <th className="px-6 py-4">Room</th>
                  <th className="px-6 py-4">Resident</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Due Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.map((inv, i) => (
                  <tr key={inv.id || i} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-400 text-xs">{inv.id ? inv.id.substring(0, 8).toUpperCase() : `INV-${100 + i}`}</td>
                    <td className="px-6 py-4 font-bold text-amber-600">{inv.roomId}</td>
                    <td className="px-6 py-4 font-semibold text-slate-800">{inv.userName}</td>
                    <td className="px-6 py-4 text-slate-500">{inv.description}</td>
                    <td className="px-6 py-4 font-bold text-slate-900">฿{(inv.amount || 0).toLocaleString()}</td>
                    <td className="px-6 py-4 text-slate-500 font-medium">{formatDateForDisplay(inv.dueDate)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 w-fit ${getStatusStyle(inv.status)}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        <span className="capitalize">{inv.status || 'Pending'}</span>
                      </span>
                    </td>

                    {/* ✅ แก้ไขคอลัมน์ Actions: จัด Z-index ให้ปุ่มลอยอยู่เหนือตารางเสมอ */}
                    <td className="px-6 py-4 text-center relative" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActionMenuOpenId(actionMenuOpenId === inv.id ? null : inv.id);
                        }}
                        className={`p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded-full transition-colors ${actionMenuOpenId === inv.id ? 'bg-slate-100 text-slate-700' : ''}`}
                      >
                        <MoreHorizontal size={18} />
                      </button>

                      {/* Dropdown Menu (Edit / Delete) */}
                      {actionMenuOpenId === inv.id && (
                        <>
                          {/* แผ่นใสดักคลิกเฉพาะสำหรับตาราง (z-40) */}
                          <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setActionMenuOpenId(null); }}></div>

                          {/* กล่องเมนูตัวจริง (z-50) */}
                          <div className="absolute right-12 top-10 w-36 bg-white border border-slate-100 shadow-xl rounded-xl z-50 py-1.5 text-left overflow-hidden">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleOpenEditModal(inv); setActionMenuOpenId(null); }}
                              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                              <Edit2 size={16} className="text-slate-400" /> Edit
                            </button>
                            <div className="w-full h-px bg-slate-100 my-1"></div>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDelete(inv.id); setActionMenuOpenId(null); }}
                              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 size={16} className="text-red-400" /> Delete
                            </button>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal สร้าง / แก้ไข */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-serif font-bold text-slate-800">
                {editingInvoice ? `Edit Invoice ${editingInvoice.id?.substring(0, 8).toUpperCase()}` : 'Create New Invoice'}
              </h2>
              <button onClick={() => { setShowModal(false); setMsg(''); setEditingInvoice(null); }} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>

            {msg && <p className="bg-red-50 text-red-600 p-3 rounded-xl text-xs mb-4 border border-red-100">{msg}</p>}

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Select Resident *</label>
                <select className="w-full border border-slate-200 bg-slate-100 rounded-xl px-4 py-2.5 text-sm focus:ring-0 outline-none transition-all disabled:opacity-70 text-slate-600"
                  value={form.userId}
                  disabled={!!editingInvoice}
                  onChange={e => {
                    const selected = users.find(u => u.user_id == e.target.value);
                    setForm({ ...form, userId: e.target.value, roomId: selected ? selected.username : '' });
                  }}>
                  <option value="">-- Choose User --</option>
                  {users.filter(u => u.role !== 'admin').map(u => (
                    <option key={u.user_id} value={u.user_id}>{u.name} ({u.username})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Room ID</label>
                  <input className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-400 focus:bg-white outline-none transition-all"
                    placeholder="e.g. A-101" value={form.roomId} onChange={e => setForm({ ...form, roomId: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Amount (฿) *</label>
                  <input className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-400 focus:bg-white outline-none transition-all font-bold"
                    type="number" placeholder="1250" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Description</label>
                <input className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-400 focus:bg-white outline-none transition-all"
                  placeholder="เช่น ค่าส่วนกลาง" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Due Date</label>
                  <input className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-400 focus:bg-white outline-none transition-all"
                    type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
                </div>
                {editingInvoice && (
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Status *</label>
                    <select className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-400 focus:bg-white outline-none transition-all"
                      value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="overdue">Overdue</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-8">
              <button onClick={() => { setShowModal(false); setMsg(''); setEditingInvoice(null); }}
                className="w-1/3 bg-slate-100 text-slate-700 py-2.5 rounded-xl hover:bg-slate-200 transition-colors font-semibold text-sm active:scale-95">Cancel</button>
              <button onClick={handleSubmit} disabled={saving}
                className="flex-1 flex justify-center items-center gap-2 bg-[#FBBF24] hover:bg-[#F59E0B] text-slate-900 py-2.5 rounded-xl transition-colors font-semibold text-sm shadow-sm disabled:opacity-50 active:scale-95">
                {saving ? 'Saving...' : (editingInvoice ? <><Wrench size={16} /> Update Invoice</> : 'Create Invoice')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;
// import { useEffect, useState, useCallback } from 'react';
// import { Plus, X, RefreshCw, FileText, CheckCircle, Clock } from 'lucide-react';

// const API = 'http://localhost:3000';

// const Invoices = () => {
//   const [users, setUsers] = useState([]);
//   const [invoices, setInvoices] = useState([]);
//   const [selectedUser, setSelectedUser] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [showModal, setShowModal] = useState(false);
//   const [form, setForm] = useState({ userId: '', roomId: '', amount: '', description: 'ค่าส่วนกลาง', dueDate: '' });
//   const [saving, setSaving] = useState(false);
//   const [msg, setMsg] = useState('');
//   const [successMsg, setSuccessMsg] = useState('');

//   useEffect(() => {
//     fetch(`${API}/api/auth/users`).then(r => r.json()).then(data => setUsers(Array.isArray(data) ? data : []));
//   }, []);

//   const loadInvoices = useCallback(async () => {
//     if (!selectedUser) return;
//     setLoading(true);
//     try {
//       const res = await fetch(`${API}/api/payment/invoices/${selectedUser}`);
//       const data = await res.json();
//       setInvoices(data.success ? data.invoices : []);
//     } catch (e) { console.error(e); }
//     finally { setLoading(false); }
//   }, [selectedUser]);

//   useEffect(() => { loadInvoices(); }, [loadInvoices]);

//   const handleCreate = async () => {
//     if (!form.userId || !form.amount) { setMsg('กรุณาเลือกผู้ใช้และระบุยอดเงิน'); return; }
//     setSaving(true);
//     const res = await fetch(`${API}/api/payment/invoices`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(form),
//     });
//     const data = await res.json();
//     setSaving(false);
//     if (data.success) {
//       setShowModal(false);
//       setForm({ userId: '', roomId: '', amount: '', description: 'ค่าส่วนกลาง', dueDate: '' });
//       setMsg('');
//       setSuccessMsg(`✅ สร้าง Invoice สำเร็จ! ลูกบ้านจะเห็นในแอปทันที`);
//       setTimeout(() => { setSuccessMsg(''); if (selectedUser === form.userId) loadInvoices(); }, 3000);
//     } else {
//       setMsg(data.error || 'เกิดข้อผิดพลาด');
//     }
//   };

//   const formatDate = (ts) => {
//     if (!ts) return '-';
//     const d = ts._seconds ? new Date(ts._seconds * 1000) : new Date(ts);
//     return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
//   };

//   const statusConfig = {
//     pending: { label: 'รอชำระ', cls: 'bg-yellow-100 text-yellow-700', icon: <Clock size={12} /> },
//     paid: { label: 'ชำระแล้ว', cls: 'bg-green-100 text-green-700', icon: <CheckCircle size={12} /> },
//   };

//   const pendingCount = invoices.filter(i => i.status === 'pending').length;
//   const totalPending = invoices.filter(i => i.status === 'pending').reduce((s, i) => s + (i.amount || 0), 0);

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-800">จัดการ Invoice</h1>
//           {selectedUser && invoices.length > 0 && (
//             <p className="text-sm text-gray-500 mt-1">รอชำระ {pendingCount} รายการ • ยอดค้าง ฿{totalPending.toLocaleString()}</p>
//           )}
//         </div>
//         <button onClick={() => setShowModal(true)}
//           className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
//           <Plus size={18} /> สร้าง Invoice
//         </button>
//       </div>

//       {successMsg && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">{successMsg}</div>}

//       {/* Filter by user */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
//         <div className="flex items-center gap-3">
//           <label className="text-sm text-gray-600 whitespace-nowrap">ดู Invoice ของ:</label>
//           <select className="flex-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
//             value={selectedUser} onChange={e => setSelectedUser(e.target.value)}>
//             <option value="">-- เลือกลูกบ้าน --</option>
//             {users.filter(u => u.role !== 'admin').map(u => (
//               <option key={u.user_id} value={u.user_id}>{u.name} ({u.username})</option>
//             ))}
//           </select>
//           <button onClick={loadInvoices} className="text-gray-400 hover:text-gray-600 p-2"><RefreshCw size={14} /></button>
//         </div>
//       </div>

//       {/* Invoices Table */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
//         {!selectedUser ? (
//           <div className="p-12 text-center text-gray-400">
//             <FileText size={48} className="mx-auto mb-4 opacity-40" />
//             <p>เลือกลูกบ้านเพื่อดู Invoice</p>
//           </div>
//         ) : loading ? (
//           <p className="text-center text-gray-400 py-12">กำลังโหลด...</p>
//         ) : invoices.length === 0 ? (
//           <div className="p-12 text-center text-gray-400">
//             <FileText size={48} className="mx-auto mb-4 opacity-40" />
//             <p>ยังไม่มี Invoice สำหรับลูกบ้านคนนี้</p>
//           </div>
//         ) : (
//           <table className="w-full">
//             <thead>
//               <tr className="bg-gray-50 text-xs text-gray-500 uppercase">
//                 <th className="px-4 py-3 text-left">รายการ</th>
//                 <th className="px-4 py-3 text-left">ยอดเงิน</th>
//                 <th className="px-4 py-3 text-left">วันครบกำหนด</th>
//                 <th className="px-4 py-3 text-left">วันที่สร้าง</th>
//                 <th className="px-4 py-3 text-left">สถานะ</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-50">
//               {invoices.map(inv => {
//                 const sc = statusConfig[inv.status] || { label: inv.status, cls: 'bg-gray-100 text-gray-600', icon: null };
//                 return (
//                   <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
//                     <td className="px-4 py-3 text-sm font-medium text-gray-800">{inv.description}</td>
//                     <td className="px-4 py-3 text-sm font-bold text-gray-900">฿{(inv.amount || 0).toLocaleString()}</td>
//                     <td className="px-4 py-3 text-sm text-gray-600">{inv.dueDate || '-'}</td>
//                     <td className="px-4 py-3 text-xs text-gray-500">{formatDate(inv.createdAt)}</td>
//                     <td className="px-4 py-3">
//                       <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${sc.cls}`}>
//                         {sc.icon} {sc.label}
//                       </span>
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         )}
//       </div>

//       {/* Modal */}
//       {showModal && (
//         <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
//           <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
//             <div className="flex items-center justify-between">
//               <h2 className="text-lg font-bold text-gray-800">สร้าง Invoice ใหม่</h2>
//               <button onClick={() => { setShowModal(false); setMsg(''); }}><X size={20} /></button>
//             </div>
//             {msg && <p className="text-red-500 text-sm">{msg}</p>}

//             <div>
//               <label className="text-xs text-gray-500 mb-1 block">เลือกลูกบ้าน *</label>
//               <select className="w-full border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
//                 value={form.userId} onChange={e => setForm({ ...form, userId: e.target.value })}>
//                 <option value="">-- เลือกผู้ใช้ --</option>
//                 {users.filter(u => u.role !== 'admin').map(u => (
//                   <option key={u.user_id} value={u.user_id}>{u.name} ({u.username})</option>
//                 ))}
//               </select>
//             </div>

//             <div>
//               <label className="text-xs text-gray-500 mb-1 block">เลขห้อง / Room ID</label>
//               <input className="w-full border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
//                 placeholder="เช่น A-101"
//                 value={form.roomId} onChange={e => setForm({ ...form, roomId: e.target.value })} />
//             </div>

//             <div>
//               <label className="text-xs text-gray-500 mb-1 block">รายการ</label>
//               <input className="w-full border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
//                 placeholder="เช่น ค่าส่วนกลาง เดือน พ.ค. 2026"
//                 value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
//             </div>

//             <div>
//               <label className="text-xs text-gray-500 mb-1 block">ยอดเงิน (บาท) *</label>
//               <input className="w-full border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
//                 type="number" placeholder="5250"
//                 value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
//             </div>

//             <div>
//               <label className="text-xs text-gray-500 mb-1 block">วันครบกำหนด</label>
//               <input className="w-full border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
//                 type="date"
//                 value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
//             </div>

//             <div className="flex gap-2 pt-2">
//               <button onClick={() => { setShowModal(false); setMsg(''); }}
//                 className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300">ยกเลิก</button>
//               <button onClick={handleCreate} disabled={saving}
//                 className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
//                 {saving ? 'กำลังสร้าง...' : '💳 สร้าง Invoice'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Invoices;
