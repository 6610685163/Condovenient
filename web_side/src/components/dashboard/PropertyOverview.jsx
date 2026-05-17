import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const PropertyOverview = ({ occupancyRate = 0 }) => {
    // คำนวณส่วนต่างเมื่อเทียบกับสถิติม็อคเดือนที่แล้ว
    const rateDifference = Math.round(occupancyRate - 78);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between min-h-[320px]">
            <div>
                <h2 className="text-sm font-bold text-slate-800">Property Overview</h2>
                <p className="text-xs text-slate-400 mb-4">Key metrics at a glance</p>
            </div>

            <div className="divide-y divide-slate-50 flex-1 flex flex-col justify-center">
                {/* 1. อัตราการเข้าพักดึงจากตัวแปรจริง */}
                <div className="py-2.5 flex justify-between items-center">
                    <div>
                        <p className="text-xs font-semibold text-slate-700">Occupancy Rate</p>
                        <p className="text-[10px] text-slate-400">vs 78% last month</p>
                    </div>
                    <div className="text-right">
                        <span className="text-base font-bold text-slate-800">{occupancyRate}%</span>
                        <span className={`text-[10px] font-bold flex items-center justify-end gap-0.5 ${rateDifference >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {rateDifference >= 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                            {Math.abs(rateDifference)}%
                        </span>
                    </div>
                </div>

                {/* 2. สรุปอัตราจัดเก็บค่าส่วนกลาง */}
                <div className="py-2.5 flex justify-between items-center">
                    <div>
                        <p className="text-xs font-semibold text-slate-700">Collection Rate</p>
                        <p className="text-[10px] text-slate-400">vs 91% last month</p>
                    </div>
                    <div className="text-right">
                        <span className="text-base font-bold text-slate-800">94%</span>
                        <span className="text-[10px] font-bold text-emerald-500 flex items-center justify-end gap-0.5">
                            <ArrowUpRight size={10} /> 3%
                        </span>
                    </div>
                </div>

                {/* 3. เวลาเฉลี่ยในการปิดงานซ่อม */}
                <div className="py-2.5 flex justify-between items-center">
                    <div>
                        <p className="text-xs font-semibold text-slate-700">Maintenance Resolution</p>
                        <p className="text-[10px] text-slate-400">avg response time</p>
                    </div>
                    <div className="text-right">
                        <span className="text-base font-bold text-slate-800">2.3 days</span>
                        <span className="text-[10px] font-bold text-rose-500 flex items-center justify-end gap-0.5">
                            <ArrowDownRight size={10} /> 0.5d
                        </span>
                    </div>
                </div>

                {/* 4. อัตราความพึงพอใจของลูกบ้าน */}
                <div className="py-2.5 flex justify-between items-center">
                    <div>
                        <p className="text-xs font-semibold text-slate-700">Resident Satisfaction</p>
                        <p className="text-[10px] text-slate-400">from 142 reviews</p>
                    </div>
                    <div className="text-right">
                        <span className="text-base font-bold text-slate-800">4.8/5</span>
                        <span className="text-[10px] font-bold text-emerald-500 flex items-center justify-end gap-0.5">
                            <ArrowUpRight size={10} /> 0.2
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PropertyOverview;