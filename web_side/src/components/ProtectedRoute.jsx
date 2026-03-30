// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // ตรวจสอบว่ามี "กุญแจ" (Token) ในกระเป๋าหรือยัง
  // (ในการทำงานจริง เราจะเช็คกับ Backend แต่ตอนนี้เช็ค localStorage ไปก่อน)
  const isAuthenticated = localStorage.getItem("user_token");

  if (!isAuthenticated) {
    // ถ้าไม่มีกุญแจ ให้ถีบไปหน้า Login
    return <Navigate to="/login" replace />;
  }

  // ถ้ามีกุญแจ อนุญาตให้เข้าได้ (แสดงเนื้อหาข้างใน)
  return children;
};

export default ProtectedRoute;