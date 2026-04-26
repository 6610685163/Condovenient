import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Residents from './pages/Residents';
import Invoices from './pages/Invoices';
import Repairs from './pages/Repairs';
import Notifications from './pages/Notifications';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* กลุ่ม 1: หน้าที่ต้องมี Sidebar (Admin Panel) */}
        <Route path="/" element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="residents" element={<Residents />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="repairs" element={<Repairs />} />
          <Route path="notifications" element={<Notifications />} />
        </Route>

        {/* กลุ่ม 2: หน้าที่ไม่ต้องมี Sidebar */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;