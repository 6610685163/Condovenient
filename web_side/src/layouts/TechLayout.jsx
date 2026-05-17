import { Outlet } from 'react-router-dom';
import TechSidebar from '../components/TechSidebar';

const TechLayout = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      <TechSidebar />
      <main className="flex-1 overflow-auto p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default TechLayout;