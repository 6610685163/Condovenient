import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import MainLayout from './layouts/MainLayout';
import TechLayout from './layouts/TechLayout';

import Login from './pages/Login';
import Register from './pages/Register';

import Dashboard from './pages/dashboard';
import Residents from './pages/Residents';
import Invoices from './pages/Invoices';
import Repairs from './pages/Repairs';
import Notifications from './pages/Notifications';
import Parcels from './pages/Parcels';
import Visitors from './pages/Visitors';

import TechDashboard from './pages/technician/TechDashboard';
import MyJobs from './pages/technician/MyJobs';
import WorkingStatus from './pages/technician/WorkingStatus';
import MyFeedback from './pages/technician/MyFeedback';

import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="residents" element={<Residents />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="repairs" element={<Repairs />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="parcels" element={<Parcels />} />
          <Route path="visitors" element={<Visitors />} />
        </Route>

        <Route path="/technician" element={
          <ProtectedRoute allowedRoles={['technician']}>
            <TechLayout />
          </ProtectedRoute>
        }>
          <Route index element={<TechDashboard />} />
          <Route path="jobs" element={<MyJobs />} />
          <Route path="status" element={<WorkingStatus />} />
          <Route path="feedback" element={<MyFeedback />} />
        </Route>

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;