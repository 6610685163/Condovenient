import { Sun, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';

const DashboardHeader = ({ userName }) => {
    // ฟังก์ชันหาวันที่ปัจจุบันแบบอ่านง่าย
    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
            <div>
                <p className="text-slate-500 text-sm font-medium mb-1">{today}</p>
                <h1 className="text-3xl font-bold text-slate-800">
                    Good morning, <span className="text-amber-500">{userName}</span>
                </h1>
            </div>

            <div className="flex flex-wrap gap-4">
                {/* Widget สภาพอากาศ */}
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
                    <Sun className="text-amber-400" size={20} />
                    <span className="font-semibold text-slate-700">32 °C</span>
                    <span className="text-slate-400 text-sm">Sunny</span>
                </div>

                {/* Widget สรุปสถานะงาน */}
                <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 text-sm font-medium">
                    <div className="flex items-center gap-1.5 text-red-500">
                        <AlertTriangle size={16} /> 3 urgent
                    </div>
                    <div className="w-px h-4 bg-slate-200"></div>
                    <div className="flex items-center gap-1.5 text-slate-600">
                        <Clock size={16} /> 7 pending
                    </div>
                    <div className="w-px h-4 bg-slate-200"></div>
                    <div className="flex items-center gap-1.5 text-emerald-500">
                        <CheckCircle2 size={16} /> 12 done
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardHeader;