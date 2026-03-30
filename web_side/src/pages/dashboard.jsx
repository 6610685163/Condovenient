// src/pages/Dashboard.jsx
import { Users, Package, AlertCircle } from 'lucide-react';

const iconMap = {
        users: Users,
        parcel: Package,       
        alert: AlertCircle 
    };

const Dashboard = () => {

    // ทำเป็น API นะ ข้างล่างเป็นแค่ข้อมูล mockup หน้าตาประมาณนี้
    const stats = [
        { title: "ลูกบ้านทั้งหมด", value: "120 ห้อง", icon: "Users", color: "bg-blue-500" },
        { title: "พัสดุรอนำจ่าย", value: "5 ชิ้น", icon: "Package", color: "bg-orange-500" },
        { title: "แจ้งซ่อมใหม่", value: "2 รายการ", icon: "AlertCircle", color: "bg-red-500" },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">ภาพรวมโครงการ</h1>

            {/* Cards แสดงสถานะ */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className={`${stat.color} p-4 rounded-lg text-white`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">{stat.title}</p>
                            <h3 className="text-xl font-bold text-gray-800">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* พื้นที่สำหรับกราฟหรือตารางในอนาคต */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-64 flex items-center justify-center text-gray-400">
                พื้นที่สำหรับแสดงกราฟ หรือประกาศข่าวสาร
            </div>
        </div>
    );
};

export default Dashboard;