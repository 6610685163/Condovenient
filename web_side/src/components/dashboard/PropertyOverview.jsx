import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const PropertyOverview = () => {
    const metrics = [
        { label: 'Occupancy Rate', value: '83%', change: 'vs 78% last month', isPositive: true },
        { label: 'Collection Rate', value: '94%', change: 'vs 91% last month', isPositive: true },
        { label: 'Maintenance Resolution', value: '2.3 days', change: 'avg response time', isPositive: false, isNeutral: true },
        { label: 'Resident Satisfaction', value: '4.8/5', change: 'from 142 reviews', isPositive: true },
    ];

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between h-full">
            <div>
                <h2 className="text-lg font-bold text-slate-800">Property Overview</h2>
                <p className="text-sm text-slate-400 mb-6">Key metrics at a glance</p>
            </div>

            <div className="divide-y divide-slate-100 flex-1 flex flex-col justify-center">
                {metrics.map((metric, index) => (
                    <div key={index} className="flex justify-between items-center py-3.5 first:pt-0 last:pb-0">
                        <div>
                            <p className="text-sm text-slate-500 font-medium">{metric.label}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{metric.change}</p>
                        </div>
                        <div className="text-right flex items-center gap-1.5">
                            <span className="text-xl font-bold text-slate-800">{metric.value}</span>
                            {metric.isNeutral ? (
                                <span className="text-red-500"><ArrowDownRight size={16} /></span>
                            ) : metric.isPositive ? (
                                <span className="text-emerald-500"><ArrowUpRight size={16} /></span>
                            ) : (
                                <span className="text-red-500"><ArrowDownRight size={16} /></span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PropertyOverview;