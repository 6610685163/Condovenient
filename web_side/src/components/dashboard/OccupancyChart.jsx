const OccupancyChart = ({ data }) => {
    // กำหนดค่าเริ่มต้นเป็น Fallback ในกรณีที่สถิติกำลังโหลด
    const chartData = data || { occupied: 0, vacant: 188, maintenance: 0, rate: 0 };

    // คำนวณเส้นรอบวงของวงกลม SVG เพื่อแสดงความคืบหน้าของกราฟ
    const strokeDasharray = 364;
    const strokeDashoffset = strokeDasharray - (strokeDasharray * chartData.rate) / 100;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between min-h-[320px]">
            <div>
                <h2 className="text-sm font-bold text-slate-800">Occupancy Status</h2>
                <p className="text-xs text-slate-400 mb-4">Current unit distribution</p>
            </div>

            {/* Dynamic SVG Circular Progress */}
            <div className="relative flex justify-center items-center my-2">
                <svg className="w-36 h-36 transform -rotate-90">
                    <circle cx="72" cy="72" r="58" stroke="#F1F5F9" strokeWidth="14" fill="transparent" />
                    <circle
                        cx="72" cy="72" r="58" stroke="#059669" strokeWidth="14" fill="transparent"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                    />
                </svg>
                <div className="absolute text-center">
                    <span className="text-2xl font-bold text-slate-800">{chartData.rate}%</span>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Occupied</p>
                </div>
            </div>

            {/* ข้อมูลแจกแจงสถิติจริงจากระบบ */}
            <div className="space-y-2 mt-2">
                <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2 text-slate-600 font-medium">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 block"></span>
                        <span>Occupied (ห้องที่มีผู้พัก)</span>
                    </div>
                    <span className="font-bold text-slate-800">{chartData.occupied}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2 text-slate-600 font-medium">
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-200 block"></span>
                        <span>Vacant (ห้องว่าง)</span>
                    </div>
                    <span className="font-bold text-slate-800">{chartData.vacant}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2 text-slate-600 font-medium">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 block"></span>
                        <span>Under Maintenance (งานซ่อมค้าง)</span>
                    </div>
                    <span className="font-bold text-slate-800">{chartData.maintenance}</span>
                </div>
            </div>
        </div>
    );
};

export default OccupancyChart;