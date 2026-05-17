import { useEffect, useState } from 'react';
import { Users, Wrench, Package, UserCheck } from 'lucide-react';

import DashboardHeader from '../components/dashboard/DashboardHeader';
import StatCard from '../components/dashboard/StatCard';
import QuickActions from '../components/dashboard/QuickActions';
import OccupancyChart from '../components/dashboard/OccupancyChart';
import PropertyOverview from '../components/dashboard/PropertyOverview';
import ActivityFeed from '../components/dashboard/ActivityFeed';

const API = 'http://localhost:3000';

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [repairs, setRepairs] = useState([]);
  const [parcels, setParcels] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/auth/users`).then(r => r.json()).catch(() => []),
      fetch(`${API}/api/repair/list`).then(r => r.json()).catch(() => []),
      fetch(`${API}/api/parcel/all`).then(r => r.json()).catch(() => ({ parcels: [] })),
      fetch(`${API}/api/visitors/active`).then(r => r.json()).catch(() => [])
    ]).then(([uRes, rRes, pRes, vRes]) => {
      setUsers(Array.isArray(uRes) ? uRes : []);
      setRepairs(Array.isArray(rRes) ? rRes : []);
      setParcels(pRes.success ? pRes.parcels : []);
      setVisitors(Array.isArray(vRes) ? vRes : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // 1. สถิติสำหรับ 4 กล่องหลัก
  const residentCount = users.filter(u => u.role !== 'admin').length;
  const pendingRepairs = repairs.filter(r => r.status === 'pending').length;
  const awaitingParcels = parcels.filter(p => p.status === 'arrived').length;
  const activeVisitors = visitors.length;

  // 2. สถิติสำหรับ Header มุมขวาบน (ดึงจากข้อมูลแจ้งซ่อมจริง)
  const urgentCount = repairs.filter(r => r.priority === 'urgent' && r.status !== 'completed').length;
  const doneCount = repairs.filter(r => r.status === 'completed').length;

  // 3. สถิติสำหรับ Occupancy Chart (สมมติโครงการมี 188 ห้อง)
  const totalUnits = 188;
  const uniqueRooms = new Set(users.filter(u => u.roomNumber && u.role !== 'admin').map(u => u.roomNumber)).size;
  const occupancyData = {
    occupied: uniqueRooms,
    vacant: totalUnits - uniqueRooms,
    maintenance: repairs.filter(r => r.status !== 'completed').length,
    rate: Math.round((uniqueRooms / totalUnits) * 100) || 0
  };

  // 4. รวบรวม Activity Feed จากทุกระบบ (เรียงตามเวลาล่าสุด)
  const getTime = (dateStr, fbTimestamp) => {
    if (fbTimestamp) return fbTimestamp._seconds * 1000;
    return dateStr ? new Date(dateStr).getTime() : Date.now();
  };

  const mixedActivities = [
    ...repairs.map(r => ({ id: `rep-${r.id}`, type: 'repair', title: 'Maintenance requested', desc: `${r.title} (Room ${r.roomNumber})`, time: getTime(r.createdAt) })),
    ...parcels.map(p => ({ id: `par-${p.id}`, type: 'parcel', title: 'New parcel arrived', desc: `For ${p.userName || 'Resident'} (Locker #${p.lockerNumber})`, time: getTime(p.arrivedAt) })),
    ...visitors.map(v => ({ id: `vis-${v.id}`, type: 'visitor', title: 'Visitor checked in', desc: `${v.visitorName} visiting Room ${v.contactRoom}`, time: getTime(null, v.checkInTime) })),
    ...users.filter(u => u.role !== 'admin').map(u => ({ id: `usr-${u.user_id}`, type: 'user', title: 'New resident registered', desc: `${u.name} (Room ${u.roomNumber || 'N/A'})`, time: getTime(u.createdAt) }))
  ].sort((a, b) => b.time - a.time).slice(0, 5); // เอา 5 รายการล่าสุด

  return (
    <div className="space-y-6 pb-8 font-sans">
      {/* ส่งข้อมูลไปให้ Header */}
      <DashboardHeader
        userName="Admin"
        stats={{ urgent: urgentCount, pending: pendingRepairs, done: doneCount }}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Residents" icon={Users} value={loading ? '...' : residentCount} subtitle="Registered users" subtitleColor="text-slate-500" />
        <StatCard title="Awaiting Parcels" icon={Package} value={loading ? '...' : awaitingParcels} subtitle="Ready for pickup" subtitleColor="text-amber-500" />
        <StatCard title="Pending Maintenance" icon={Wrench} value={loading ? '...' : pendingRepairs} subtitle="Requires attention" subtitleColor="text-rose-500" isHighlight={true} />
        <StatCard title="Active Visitors" icon={UserCheck} value={loading ? '...' : activeVisitors} subtitle="Currently inside" subtitleColor="text-emerald-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ส่งข้อมูลไปให้กราฟโดนัท */}
            <OccupancyChart data={occupancyData} />
            <PropertyOverview occupancyRate={occupancyData.rate} />
          </div>
          <QuickActions />
        </div>

        <div className="lg:col-span-1 h-full">
          {/* ส่งข้อมูลรวมมิตรไปให้ Feed */}
          <ActivityFeed activities={mixedActivities} loading={loading} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

//   const assignedRepairs = repairs.filter(r => r.status === 'assigned').length;

//   const stats = [
//     { title: 'ลูกบ้านทั้งหมด', value: loading ? '...' : `${users.length} คน`, icon: Users, color: 'bg-blue-500' },
//     { title: 'แจ้งซ่อมรอดำเนินการ', value: loading ? '...' : `${pendingRepairs} รายการ`, icon: Wrench, color: 'bg-red-500' },
//     { title: 'กำลังดำเนินการซ่อม', value: loading ? '...' : `${assignedRepairs} รายการ`, icon: Receipt, color: 'bg-orange-500' },
//     { title: 'แจ้งซ่อมทั้งหมด', value: loading ? '...' : `${repairs.length} รายการ`, icon: Bell, color: 'bg-green-500' },
//   ];

//   const recentRepairs = repairs.slice(0, 5);

//   const statusColor = {
//     pending: 'bg-yellow-100 text-yellow-700',
//     assigned: 'bg-blue-100 text-blue-700',
//     completed: 'bg-green-100 text-green-700',
//   };
//   const statusLabel = {
//     pending: 'รอดำเนินการ',
//     assigned: 'กำลังซ่อม',
//     completed: 'เสร็จสิ้น',
//   };

//   return (
//     <div className="space-y-6">
//       <h1 className="text-2xl font-bold text-gray-800">ภาพรวมโครงการ</h1>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//         {stats.map((stat, i) => (
//           <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
//             <div className={`${stat.color} p-3 rounded-lg text-white`}>
//               <stat.icon size={22} />
//             </div>
//             <div>
//               <p className="text-xs text-gray-500">{stat.title}</p>
//               <h3 className="text-xl font-bold text-gray-800">{stat.value}</h3>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Recent Repairs */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
//         <h2 className="text-lg font-semibold text-gray-700 mb-4">ใบแจ้งซ่อมล่าสุด</h2>
//         {loading ? (
//           <p className="text-gray-400 text-center py-8">กำลังโหลด...</p>
//         ) : recentRepairs.length === 0 ? (
//           <p className="text-gray-400 text-center py-8">ยังไม่มีใบแจ้งซ่อม</p>
//         ) : (
//           <table className="w-full text-sm">
//             <thead>
//               <tr className="text-left text-gray-500 border-b">
//                 <th className="pb-3">หัวข้อ</th>
//                 <th className="pb-3">ห้อง</th>
//                 <th className="pb-3">หมวดหมู่</th>
//                 <th className="pb-3">สถานะ</th>
//               </tr>
//             </thead>
//             <tbody>
//               {recentRepairs.map((r, i) => (
//                 <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
//                   <td className="py-3 font-medium text-gray-800">{r.title}</td>
//                   <td className="py-3 text-gray-600">{r.roomNumber}</td>
//                   <td className="py-3 text-gray-600">{r.category}</td>
//                   <td className="py-3">
//                     <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[r.status] || 'bg-gray-100 text-gray-600'}`}>
//                       {statusLabel[r.status] || r.status}
//                     </span>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         )}
//       </div>
//     </div>
//   );
// };
