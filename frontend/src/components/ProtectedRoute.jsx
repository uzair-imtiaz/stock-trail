import { message, Spin } from 'antd';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { getPermission } from '../utils';

function ProtectedRoute({ user, loading }) {
  console.log('user', user)
  console.log('loading', loading)
  const location = useLocation();
  const hasAccess = getPermission(user, location.pathname);

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
    return <Navigate to="/sales" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
