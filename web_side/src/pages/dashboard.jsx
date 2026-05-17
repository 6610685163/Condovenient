import { useEffect, useState } from 'react';
import { Users, Wrench, Package, UserCheck } from 'lucide-react'; // อัปเดตไอคอนใหม่ให้ตรงกับข้อมูล

// Import components
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
    // โหลดข้อมูลจริงจาก 4 โมดูลหลักพร้อมกัน
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

  // คำนวณสถิติจากข้อมูลจริง
  const residentCount = users.filter(u => u.role !== 'admin').length; // นับเฉพาะคนที่ไม่ใช่อแอดมิน
  const pendingRepairs = repairs.filter(r => r.status === 'pending').length;
  const awaitingParcels = parcels.filter(p => p.status === 'arrived').length;
  const activeVisitors = visitors.length;

  return (
    <div className="space-y-6 pb-8 font-sans">
      {/* ส่วนหัว */}
      <DashboardHeader userName="Admin" />

      {/* กล่องสถิติ 4 กล่อง (ดึงข้อมูล Real-time 100%) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Residents"
          icon={Users}
          value={loading ? '...' : residentCount}
          subtitle="Registered users"
          subtitleColor="text-slate-500"
        />
        <StatCard
          title="Awaiting Parcels"
          icon={Package}
          value={loading ? '...' : awaitingParcels}
          subtitle="Ready for pickup"
          subtitleColor="text-amber-500"
        />
        <StatCard
          title="Pending Maintenance"
          icon={Wrench}
          value={loading ? '...' : pendingRepairs}
          subtitle="Requires attention"
          subtitleColor="text-rose-500"
          isHighlight={true} // เน้นกล่องนี้เพราะเป็นเรื่องซ่อมบำรุง
        />
        <StatCard
          title="Active Visitors"
          icon={UserCheck}
          value={loading ? '...' : activeVisitors}
          subtitle="Currently inside"
          subtitleColor="text-emerald-500"
        />
      </div>

      {/* Grid ด้านล่าง (กราฟและไทม์ไลน์) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* ฝั่งซ้าย (กินพื้นที่ 2 ส่วน) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* กราฟโดนัท (ใช้ UI Component เดิม) */}
            <OccupancyChart />
            {/* สถิติเปรียบเทียบ (ใช้ UI Component เดิม) */}
            <PropertyOverview />
          </div>

          {/* ปุ่ม Quick Actions */}
          <QuickActions />
        </div>

        {/* ฝั่งขวา (ไทม์ไลน์) */}
        <div className="lg:col-span-1 h-full">
          {/* ส่งแจ้งซ่อมทั้งหมดไปให้ ActivityFeed คำนวณโชว์ประวัติ */}
          <ActivityFeed repairs={repairs} loading={loading} />
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
