import { Receipt, Wrench, UserPlus, Bell, Clock } from 'lucide-react';

const ActivityFeed = ({ repairs = [], loading }) => {
    // นำข้อมูลใบแจ้งซ่อมจริงมาแปลงให้เข้ากับโครงสร้าง Timeline
    const repairActivities = repairs.slice(0, 3).map((repair) => ({
        icon: Wrench,
        iconColor: 'text-amber-600 bg-amber-50 border-amber-100',
        title: `Maintenance requested`,
        detail: `${repair.title} - Room ${repair.roomNumber || 'N/A'}`,
        time: 'Just now',
    }));

    // กิจกรรมจำลองอื่นๆ เพื่อให้หน้าตาเหมือนดีไซน์ที่สมบูรณ์
    const mockActivities = [
        { icon: Receipt, iconColor: 'text-slate-600 bg-slate-50 border-slate-100', title: 'Invoice paid', detail: 'Room A-1201', time: '2 min ago' },
        { icon: UserPlus, iconColor: 'text-slate-600 bg-slate-50 border-slate-100', title: 'New resident registered', detail: 'Room C-1502', time: '1 hour ago' },
        { icon: Bell, iconColor: 'text-slate-600 bg-slate-50 border-slate-100', title: 'Announcement sent', detail: 'Room All Units', time: '5 hours ago' },
    ];

    // รวมกิจกรรมเข้าด้วยกัน (ถ้ากำลังโหลดให้ใช้ mock พลางๆก่อน)
    const allActivities = loading ? mockActivities : [...repairActivities, ...mockActivities].slice(0, 6);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 h-full flex flex-col">
            <div className="mb-6">
                <h2 className="text-lg font-bold text-slate-800">Activity Feed</h2>
                <p className="text-sm text-slate-400">Real-time updates</p>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 space-y-6 relative before:absolute before:top-2 before:bottom-2 before:left-[18px] before:w-0.5 before:bg-slate-100">
                {allActivities.map((act, index) => {
                    const Icon = act.icon;
                    return (
                        <div key={index} className="flex items-start gap-4 relative z-10 group">
                            <div className={`p-2 rounded-full border transition-all group-hover:scale-110 ${act.iconColor}`}>
                                <Icon size={16} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start gap-2">
                                    <h3 className="text-sm font-semibold text-slate-700 truncate">{act.title}</h3>
                                    <span className="text-xs text-slate-400 whitespace-nowrap flex items-center gap-1">
                                        <Clock size={12} /> {act.time}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 mt-0.5">{act.detail}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            <button className="w-full text-center text-sm font-medium text-slate-400 hover:text-amber-600 transition-colors pt-4 mt-4 border-t border-slate-50 cursor-pointer">
                View all activity
            </button>
        </div>
    );
};

export default ActivityFeed;