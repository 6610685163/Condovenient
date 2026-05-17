import { Outlet } from 'react-router-dom';
import TechSidebar from '../components/TechSidebar';

const TechLayout = () => {
  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      {/* เมนูซ้าย */}
      <TechSidebar />

      {/* พื้นที่เนื้อหาขวา */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default TechLayout;