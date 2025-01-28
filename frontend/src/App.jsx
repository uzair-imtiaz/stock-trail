import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import RoutesPage from './pages/RoutesPage';
import Inventory from './pages/Inventory';
import Users from './pages/Users';
import AppLayout from './components/AppLayout';
import Dashboard from './pages/Dashbaord';
import SignIn from './pages/Signin';
import Register from './pages/Register';
import { useEffect, useState } from 'react';
import { getUser, logout } from './apis';
import Cookies from 'js-cookie';
import { message } from 'antd';

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const response = await getUser();
      if (response?.success) {
        setUser(response.data);
      } else {
        message.error(response?.message || 'Something went wrong');
      }
    };

    const token = Cookies.get('token');
    console.log('token', token);
    if (token) {
      fetchUser();
    }
  }, []);

  const handleLogin = (user) => {
    setUser(user);
  };

  const handleLogout = async () => {
    await logout();
    Cookies.remove('token');
    setUser(null);
  };

  return (
    <Router>
      <Routes>
        <Route path="/signin" element={<SignIn onLogin={handleLogin} />} />
        <Route path="/register" element={<Register />} />
        {/* Layout wrapper */}
        <Route element={<AppLayout user={user} onLogout={handleLogout} />}>
          {/* Protected routes */}
          <Route path="/" element={<ProtectedRoute user={user} />}>
            <Route index element={<Dashboard />} />
            <Route path="routes" element={<RoutesPage />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="users" element={<Users />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
