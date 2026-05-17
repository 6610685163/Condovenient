const OccupancyChart = () => {
    // ข้อมูลจำลองตามดีไซน์
    const data = [
        { name: 'Occupied', count: 156, color: 'bg-amber-500', text: 'text-amber-500' },
        { name: 'Vacant', count: 24, color: 'bg-slate-300', text: 'text-slate-300' },
        { name: 'Under Maintenance', count: 8, color: 'bg-emerald-600', text: 'text-emerald-600' },
    ];

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between h-full">
            <div>
                <h2 className="text-lg font-bold text-slate-800">Occupancy Status</h2>
                <p className="text-sm text-slate-400 mb-4">Current unit distribution</p>
            </div>

            {/*ส่วนแสดงกราฟ Donut ด้วย SVG */}
            <div className="flex justify-center items-center relative my-4">
                <svg className="w-40 h-40 transform -rotate-90">
                    {/* Vacant (ฐานวงกลมสีเทา) */}
                    <circle cx="80" cy="80" r="60" stroke="#CBD5E1" strokeWidth="20" fill="transparent" />
                    {/* Occupied (เส้นสีทอง 83%) */}
                    <circle cx="80" cy="80" r="60" stroke="#F59E0B" strokeWidth="20" fill="transparent"
                        strokeDasharray="376.9" strokeDashoffset="64" />
                    {/* Under Maintenance (เส้นสีเขียว) */}
                    <circle cx="80" cy="80" r="60" stroke="#059669" strokeWidth="20" fill="transparent"
                        strokeDasharray="376.9" strokeDashoffset="350" />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-slate-800">83%</span>
                    <span className="text-xs text-slate-400 uppercase tracking-wider">Occupied</span>
                </div>
            </div>

            {/* คำอธิบายสัญลักษณ์สีด้านล่าง */}
            <div className="space-y-2 pt-2 border-t border-slate-50">
                {data.map((item, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2">
                            <span className={`w-3 h-3 rounded-full ${item.color}`}></span>
                            <span className="text-slate-500">{item.name}</span>
                        </div>
                        <span className="font-semibold text-slate-700">{item.count}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OccupancyChart;