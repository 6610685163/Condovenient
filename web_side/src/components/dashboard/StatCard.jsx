const StatCard = ({ title, icon: Icon, value, subtitle, subtitleColor, isHighlight = false }) => {
    // ตั้งค่าสีตามดีไซน์: กล่องปกติสีขาว กล่อง Highlight (แจ้งซ่อม) สีเหลืองอ่อน
    const bgClass = isHighlight ? 'bg-[#FDF8F3] border-[#FDE6D5]' : 'bg-white border-slate-100';
    const titleClass = isHighlight ? 'text-amber-800' : 'text-slate-500';
    const valueClass = isHighlight ? 'text-amber-600' : 'text-slate-800';

    // สีพื้นหลังโค้งมุมขวาบน และสีไอคอน
    const blobBg = isHighlight ? 'bg-[#FDE6D5]' : 'bg-slate-100';
    const iconColor = isHighlight ? 'text-amber-700' : 'text-slate-400';

    return (
        <div className={`p-6 rounded-2xl shadow-sm border ${bgClass} relative overflow-hidden transition-all hover:shadow-md`}>
            {/* ลูกเล่นพื้นหลังโค้งที่มุมขวาบน (Blob) */}
            <div
                className={`absolute top-0 right-0 w-20 h-20 ${blobBg}`}
                style={{ borderRadius: '0 0 0 60%' }}
            ></div>

            {/* ไอคอน (วางทับบน Blob) */}
            <div className="absolute top-5 right-5 z-10">
                <Icon size={24} className={iconColor} strokeWidth={2} />
            </div>

            {/* ข้อมูลเนื้อหา */}
            <div className="relative z-10">
                <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${titleClass}`}>{title}</p>
                <h3 className={`text-4xl font-serif font-bold mb-2 ${valueClass}`}>{value}</h3>
                <p className={`text-sm font-medium ${subtitleColor}`}>{subtitle}</p>
            </div>
        </div>
    );
};

export default StatCard;