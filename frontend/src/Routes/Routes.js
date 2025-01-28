import { Suspense } from 'react';
import { Outlet } from 'react-router';
import App from '../components/app';

const AppRoute = (props) => {
  const { handleLogout, user } = props;

  return (
    <App handleLogout={handleLogout} user={user}>
      <Suspense fallback={<div>...Loading </div>}>
        <Outlet />
      </Suspense>
    </App>
  );
};

export default AppRoute;
