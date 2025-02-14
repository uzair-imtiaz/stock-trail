import { message, Spin } from 'antd';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

function ProtectedRoute({ user, loading }) {
  const location = useLocation();
  const hasAccess = user?.modules?.some((module) =>
    location.pathname?.startsWith(`/${module}`)
  );
  if (user?.role === 'admin') {
    return <Outlet />;
  }
  if (loading) {
    return <Spin />;
  }
  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  if (!hasAccess) {
    message.error('You are not authorized to access this page');
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
