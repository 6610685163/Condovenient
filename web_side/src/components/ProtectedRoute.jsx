import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const raw = localStorage.getItem('user_token');

  if (!raw) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(raw);
    if (user.role !== 'admin') {
      // ล็อกอินแล้วแต่ไม่ใช่ admin → เตะออก กลับ login
      localStorage.removeItem('user_token');
      return <Navigate to="/login" replace state={{ error: 'คุณไม่มีสิทธิ์เข้าใช้งานระบบนี้' }} />;
    }
  } catch {
    localStorage.removeItem('user_token');
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;