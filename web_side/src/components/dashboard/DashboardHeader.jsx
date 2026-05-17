import { useState, useEffect } from 'react';
import { Sun, Moon, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';

const DashboardHeader = ({ stats }) => {
    const [greeting, setGreeting] = useState('Good morning');
    const [name, setName] = useState('Admin');

    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    useEffect(() => {
        // 1. เปลี่ยนคำทักทายและไอคอนตามช่วงเวลาจริงของวัน
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) {
            setGreeting('Good morning');
        } else if (hour >= 12 && hour < 17) {
            setGreeting('Good afternoon');
        } else if (hour >= 17 && hour < 21) {
            setGreeting('Good evening');
        } else {
            setGreeting('Good night');
        }

        // 2. ดึงข้อมูลชื่อจริง/ชื่อผู้ใช้ที่บันทึกจากระบบ Login จริงมาแสดงผล
        const token = localStorage.getItem('user_token');
        if (token) {
            try {
                const user = JSON.parse(token);
                if (user && user.name) {
                    setName(user.name);
                }
            } catch (e) {
                console.error("Error parsing user token:", e);
            }
        }
    }, []);

    // ฟังก์ชันเลือกไอคอนสภาพแวดล้อมตามเวลาจริง
    const getGreetingIcon = () => {
        const hour = new Date().getHours();
        if (hour >= 6 && hour < 18) {
            return <Sun className="text-amber-400" size={20} />;
        }
        return <Moon className="text-indigo-400" size={20} />;
    };

    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
            <div>
                <p className="text-slate-500 text-sm font-medium mb-1">{today}</p>
                <h1 className="text-3xl font-bold text-slate-800">
                    {greeting}, <span className="text-amber-500">{name}</span>
                </h1>
            </div>

            <div className="flex flex-wrap gap-4">
                {/* Weather / Time Widget */}
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
                    {getGreetingIcon()}
                    <span className="font-semibold text-slate-700">32 °C</span>
                    <span className="text-slate-400 text-sm">Sunny</span>
                </div>

                {/* Live Task Summary Counter */}
                <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 text-sm font-medium">
                    <span className="text-red-500 flex items-center gap-1">
                        <AlertTriangle size={14} /> {stats?.urgent || 0} urgent
                    </span>
                    <span className="text-slate-500 flex items-center gap-1">
                        <Clock size={14} /> {stats?.pending || 0} pending
                    </span>
                    <span className="text-emerald-500 flex items-center gap-1">
                        <CheckCircle2 size={14} /> {stats?.done || 0} done
                    </span>
                </div>
            </div>
        </div>
    );
};

export default DashboardHeader;