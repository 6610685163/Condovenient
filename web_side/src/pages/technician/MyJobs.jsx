import { useEffect, useState } from 'react';
import { Wrench, CheckCircle, Clock, Hammer, X, Flag, AlertTriangle, MoreHorizontal, Eye } from 'lucide-react';

const API = 'http://localhost:3000';

const getUser = () => {
  try { return JSON.parse(localStorage.getItem('user_token') || 'null'); } catch { return null; }
};

const MyJobs = () => {
  const user = getUser();
  const [jobs, setJobs] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  
  // States for Modals
  const [closeTarget, setCloseTarget] = useState(null);
  const [closeNote, setCloseNote] = useState('');
  const [detailJob, setDetailJob] = useState(null);
  const [actionMenuOpenId, setActionMenuOpenId] = useState(null);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = () => {
    if (!user?.id) return;
    setLoading(true);
    const q = filter && filter !== 'all' ? `?status=${filter}` : '';
    fetch(`${API}/api/repair/technician/${user.id}${q}`)
      .then(r => r.json())
      .then(d => { setJobs(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => { setError('โหลดงานไม่สำเร็จ'); setLoading(false); });
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, [filter]);

  const acceptJob = async (id) => {
    setError(''); setSuccess('');
    try {
      const res = await fetch(`${API}/api/repair/accept/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ technicianId: user.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('รับงานเรียบร้อย');
        setActionMenuOpenId(null);
        setTimeout(() => setSuccess(''), 1500);
        load();
      } else setError(data.error || 'รับงานไม่สำเร็จ');
    } catch { setError('เชื่อมต่อ Server ไม่สำเร็จ'); }
  };

  const closeJob = async () => {
    if (!closeTarget) return;
    try {
      const res = await fetch(`${API}/api/repair/close/${closeTarget.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completionNote: closeNote }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('ปิดงานเรียบร้อย');
        setCloseTarget(null); setCloseNote(''); setActionMenuOpenId(null); setDetailJob(null);
        setTimeout(() => setSuccess(''), 1500);
        load();
      } else setError(data.error || 'ปิดงานไม่สำเร็จ');
    } catch { setError('เชื่อมต่อ Server ไม่สำเร็จ'); }
  };

  // Helpers for styling
  const getStatusDisplay = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return { label: 'Completed', cls: 'bg-[#E8F5E9] text-[#2E7D32]' };
      case 'in_progress': return { label: 'In Progress', cls: 'bg-blue-50 text-blue-600' };
      case 'assigned': return { label: 'Assigned', cls: 'bg-amber-50 text-amber-600' };
      default: return { label: status || 'Unknown', cls: 'bg-slate-100 text-slate-600' };
    }
  };

  const getPriorityDisplay = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'urgent': return { label: 'Urgent', cls: 'border-red-200 text-red-600 bg-red-50/50', icon: <AlertTriangle size={12} /> };
      case 'high': return { label: 'High', cls: 'border-orange-200 text-orange-600 bg-orange-50/50', icon: <Flag size={12} /> };
      case 'medium':
      case 'normal': return { label: 'Medium', cls: 'border-blue-200 text-blue-600 bg-blue-50/50', icon: null };
      case 'low': return { label: 'Low', cls: 'border-slate-200 text-slate-600 bg-slate-50/50', icon: null };
      default: return { label: 'Normal', cls: 'border-slate-200 text-slate-600 bg-slate-50/50', icon: null };
    }
  };

  const formatDateShort = (ts) => {
    if (!ts) return '-';
    try {
      const d = ts._seconds ? new Date(ts._seconds * 1000) : new Date(ts);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch { return '-'; }
  };

  return (
    <div className="space-y-6 pb-8 relative">
      {(actionMenuOpenId) && (
        <div className="fixed inset-0 z-10" onClick={() => setActionMenuOpenId(null)}></div>
      )}

      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 relative z-0">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-800">My Jobs</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your assigned maintenance requests</p>
        </div>
        
        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-100">
          {[{id: 'all', label: 'All Jobs'}, {id: 'assigned', label: 'New'}, {id: 'in_progress', label: 'In Progress'}, {id: 'completed', label: 'Done'}].map(tab => {
             const isActive = filter === tab.id || (filter === '' && tab.id === 'all');
             return (
              <button key={tab.id} onClick={() => setFilter(tab.id === 'all' ? '' : tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  isActive ? 'bg-[#FBBF24] text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}>
                {tab.label}
              </button>
             );
          })}
        </div>
      </div>

      {success && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm relative z-0">{success}</div>}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm relative z-0">{error}</div>}

      {/* Jobs Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-visible relative z-10">
        {loading ? (
          <p className="text-center text-slate-400 py-12">กำลังโหลดงาน...</p>
        ) : jobs.length === 0 ? (
          <p className="text-center text-slate-400 py-12">ไม่พบงานในหมวดหมู่นี้</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">
                  <th className="w-10 px-4 py-4 text-center"></th>
                  <th className="px-4 py-4">Request</th>
                  <th className="px-4 py-4">Room</th>
                  <th className="px-4 py-4">Issue</th>
                  <th className="px-4 py-4">Priority</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Assigned Date</th>
                  <th className="px-4 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {jobs.map((j, i) => {
                  const statusInfo = getStatusDisplay(j.status);
                  const prioInfo = getPriorityDisplay(j.priority);
                  const isHighAlert = j.priority === 'urgent' || j.priority === 'high';
                  const displayId = j.id ? `MNT-${j.id.substring(0, 3).toUpperCase()}` : `MNT-00${i + 1}`;

                  return (
                    <tr key={j.id || i} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-4 py-4 text-center">
                        {isHighAlert && <Flag size={16} fill="currentColor" className={j.priority === 'urgent' ? 'text-red-500' : 'text-amber-500'} />}
                      </td>
                      <td className="px-4 py-4 font-bold text-slate-800">{displayId}</td>
                      <td className="px-4 py-4 font-bold text-amber-600">{j.roomNumber || '-'}</td>
                      <td className="px-4 py-4 text-slate-800 font-medium truncate max-w-xs" title={j.title}>{j.title}</td>
                      
                      <td className="px-4 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border flex items-center w-fit gap-1 ${prioInfo.cls}`}>
                          {prioInfo.icon} {prioInfo.label}
                        </span>
                      </td>
                      
                      <td className="px-4 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.cls}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      
                      <td className="px-4 py-4 text-slate-500 flex items-center gap-1.5 mt-2.5">
                        <Clock size={14} /> {formatDateShort(j.createdAt)}
                      </td>
                      
                      <td className="px-4 py-4 text-center relative">
                        <button
                          onClick={(e) => { e.stopPropagation(); setActionMenuOpenId(actionMenuOpenId === j.id ? null : j.id); }}
                          className={`p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded-full transition-colors ${actionMenuOpenId === j.id ? 'bg-slate-100 text-slate-700' : ''}`}
                        >
                          <MoreHorizontal size={18} />
                        </button>

                        {actionMenuOpenId === j.id && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setActionMenuOpenId(null); }}></div>
                            <div className="absolute right-10 top-10 w-40 bg-white border border-slate-100 shadow-xl rounded-xl z-50 py-1.5 text-left overflow-hidden">
                              <button
                                onClick={() => { setDetailJob(j); setActionMenuOpenId(null); }}
                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                              >
                                <Eye size={16} className="text-slate-400" /> View Details
                              </button>
                              
                              {j.status === 'assigned' && (
                                <button
                                  onClick={() => acceptJob(j.id)}
                                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                                >
                                  <Hammer size={16} className="text-blue-400" /> Accept Job
                                </button>
                              )}
                              
                              {j.status === 'in_progress' && (
                                <button
                                  onClick={() => { setCloseTarget(j); setActionMenuOpenId(null); }}
                                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-emerald-600 hover:bg-emerald-50 transition-colors"
                                >
                                  <CheckCircle size={16} className="text-emerald-400" /> Mark Completed
                                </button>
                              )}
                            </div>
                          </>
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

      {/* Details Modal */}
      {detailJob && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-serif font-bold text-slate-800">Job Details</h2>
              <button onClick={() => setDetailJob(null)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            
            <div className="flex gap-2 mb-6">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusDisplay(detailJob.status).cls}`}>
                {getStatusDisplay(detailJob.status).label}
              </span>
              <span className={`px-3 py-1 rounded-md text-xs font-semibold border ${getPriorityDisplay(detailJob.priority).cls}`}>
                Priority: {getPriorityDisplay(detailJob.priority).label}
              </span>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Issue Title</label>
                  <p className="text-sm bg-slate-50 border border-slate-100 px-3 py-2.5 rounded-xl text-slate-800 font-medium">{detailJob.title}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Room Number</label>
                  <p className="text-sm bg-slate-50 border border-slate-100 px-3 py-2.5 rounded-xl text-amber-600 font-bold">{detailJob.roomNumber}</p>
                </div>
              </div>
              
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Description</label>
                <p className="text-sm bg-slate-50 border border-slate-100 px-3 py-2.5 rounded-xl text-slate-700 leading-relaxed min-h-[80px]">
                  {detailJob.description || 'No description provided.'}
                </p>
              </div>

              {detailJob.completionNote && (
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Completion Note</label>
                  <p className="text-sm bg-emerald-50 border border-emerald-100 px-3 py-2.5 rounded-xl text-emerald-700">
                    {detailJob.completionNote}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-8">
              <button onClick={() => setDetailJob(null)}
                className="flex-1 bg-slate-100 text-slate-700 py-2.5 rounded-xl hover:bg-slate-200 transition-colors font-semibold text-sm">Close</button>
              
              {detailJob.status === 'assigned' && (
                <button onClick={() => { acceptJob(detailJob.id); setDetailJob(null); }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl transition-colors font-semibold text-sm flex items-center justify-center gap-2">
                  <Hammer size={16} /> Accept Job
                </button>
              )}

              {detailJob.status === 'in_progress' && (
                <button onClick={() => { setCloseTarget(detailJob); setDetailJob(null); }}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl transition-colors font-semibold text-sm flex items-center justify-center gap-2">
                  <CheckCircle size={16} /> Mark Completed
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Close Job Modal */}
      {closeTarget && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-serif font-bold text-slate-800">Mark Completed</h3>
              <button onClick={() => setCloseTarget(null)}><X size={20} className="text-slate-400 hover:text-slate-600" /></button>
            </div>
            
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mb-4">
              <p className="text-xs text-slate-500 mb-1">Issue: <span className="font-semibold text-slate-800">{closeTarget.title}</span></p>
              <p className="text-xs text-slate-500">Room: <span className="font-bold text-amber-600">{closeTarget.roomNumber}</span></p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Completion Note / Work Done</label>
              <textarea 
                rows={4} 
                value={closeNote} 
                onChange={e => setCloseNote(e.target.value)}
                className="w-full border border-slate-200 bg-slate-50 rounded-xl p-4 text-sm focus:ring-2 focus:ring-emerald-400 focus:bg-white outline-none transition-all resize-none"
                placeholder="Describe the repairs made (e.g. replaced pipe, fixed wiring)..." 
              />
            </div>
            
            <div className="flex gap-3 pt-6">
              <button onClick={() => setCloseTarget(null)}
                className="w-1/3 bg-slate-100 text-slate-700 py-2.5 rounded-xl hover:bg-slate-200 transition-colors font-semibold text-sm">Cancel</button>
              <button onClick={closeJob} disabled={!closeNote.trim()}
                className="flex-1 bg-emerald-600 text-white py-2.5 rounded-xl hover:bg-emerald-700 transition-colors font-semibold text-sm shadow-sm disabled:opacity-50">
                Confirm Completion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyJobs;