// src/layouts/MainLayout.jsx
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const MainLayout = () => {
    return (
        <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
            {/* เมนูซ้าย */}
            <Sidebar />

            {/* พื้นที่เนื้อหาขวา (จะเปลี่ยนไปตามหน้า) */}
            <main className="flex-1 overflow-y-auto p-8">
                {/* เพิ่ม max-width เพื่อไม่ให้เนื้อหาจอกว้างเกินไปเวลาย่อขยาย */}
                <div className="max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default MainLayout;