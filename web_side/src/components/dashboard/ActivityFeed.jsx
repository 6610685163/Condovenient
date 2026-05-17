import { Wrench, UserPlus, Bell, Clock, Package, UserCheck } from 'lucide-react';

// ✅ เปลี่ยนจาก repairs เป็น activities
const ActivityFeed = ({ activities = [], loading }) => {

    // ฟังก์ชันเลือกไอคอนและสีให้ตรงกับประเภทของข้อมูล
    const getIconProps = (type) => {
        switch (type) {
            case 'repair': return { icon: Wrench, color: 'text-rose-500 bg-rose-50 border-rose-100' };
            case 'parcel': return { icon: Package, color: 'text-amber-500 bg-amber-50 border-amber-100' };
            case 'visitor': return { icon: UserCheck, color: 'text-emerald-500 bg-emerald-50 border-emerald-100' };
            case 'user': return { icon: UserPlus, color: 'text-blue-500 bg-blue-50 border-blue-100' };
            default: return { icon: Bell, color: 'text-slate-500 bg-slate-50 border-slate-100' };
        }
    };

    // ฟังก์ชันคำนวณเวลาที่ผ่านไป
    const formatTimeAgo = (timestamp) => {
        if (!timestamp) return 'Just now';
        const seconds = Math.floor((new Date() - timestamp) / 1000);
        if (seconds < 60) return 'Just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes} min ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} hours ago`;
        const days = Math.floor(hours / 24);
        return `${days} days ago`;
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 h-full flex flex-col">
            <div className="mb-6">
                <h2 className="text-lg font-bold text-slate-800">Activity Feed</h2>
                <p className="text-sm text-slate-400">Real-time updates</p>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 space-y-6 relative before:absolute before:top-2 before:bottom-2 before:left-[18px] before:w-0.5 before:bg-slate-100">
                {loading ? (
                    <div className="text-center text-slate-400 py-10 text-xs font-medium">Loading activities...</div>
                ) : activities.length === 0 ? (
                    <div className="text-center text-slate-400 py-10 text-xs font-medium italic">No recent activity.</div>
                ) : activities.map((act) => {
                    const { icon: Icon, color } = getIconProps(act.type);
                    return (
                        <div key={act.id} className="flex items-start gap-4 relative z-10 group">
                            <div className={`p-2 rounded-full border transition-all group-hover:scale-110 ${color}`}>
                                <Icon size={16} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start gap-2">
                                    <h3 className="text-sm font-semibold text-slate-700 truncate">{act.title}</h3>
                                    <span className="text-xs text-slate-400 whitespace-nowrap flex items-center gap-1">
                                        <Clock size={12} /> {formatTimeAgo(act.time)}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 mt-0.5">{act.desc}</p>
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