// src/layouts/MainLayout.jsx
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/sidebar';

const MainLayout = () => {
    return (
        <div className="flex h-screen bg-gray-50">
            {/* เมนูซ้าย */}
            <Sidebar />

            {/* พื้นที่เนื้อหาขวา (จะเปลี่ยนไปตามหน้า) */}
            <main className="flex-1 overflow-auto p-8">
                <Outlet />
            </main>
        </div>
    );
};

export default MainLayout;