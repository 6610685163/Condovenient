import { Navigate } from 'react-router-dom';

const ROLE_HOME = {
  admin: '/',
  technician: '/technician',
};

const ProtectedRoute = ({ children, allowedRoles }) => {
  const raw = localStorage.getItem('user_token');
  if (!raw) {
    return <Navigate to="/login" replace />;
  }

  let user;
  try {
    user = JSON.parse(raw);
  } catch {
    localStorage.removeItem('user_token');
    return <Navigate to="/login" replace />;
  }

  if (!user?.role) {
    localStorage.removeItem('user_token');
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    const home = ROLE_HOME[user.role];
    if (home) return <Navigate to={home} replace />;
    return <Navigate to="/login" replace state={{ error: 'คุณไม่มีสิทธิ์เข้าใช้งานหน้านี้' }} />;
  }

  return children;
};

export default ProtectedRoute;