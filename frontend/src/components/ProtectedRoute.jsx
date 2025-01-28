import { Navigate, Outlet } from 'react-router-dom';

function ProtectedRoute({ user }) {
  console.log(user);
  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
