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
import InventoryForm from './components/InventoryForm';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const response = await getUser();
      if (response?.success) {
        setUser(response.data);
      } else {
        message.error(response?.message || 'Something went wrong');
      }
      setLoading(false);
    };

    const token = Cookies.get('token');
    if (token) {
      fetchUser();
    }
  }, []);

  const handleLogin = (user) => {
    setUser(user);
  };

  const handleLogout = async () => {
    const response = await logout();
    if (response?.success) {
      Cookies.remove('token');
      setUser(null);
      message.success('Logout successful!');
    }
  };

  return (
    <Router>
      <Routes>
        <Route path="/signin" element={<SignIn onLogin={handleLogin} />} />
        <Route path="/register" element={<Register />} />
        {/* Layout wrapper */}
        <Route element={<AppLayout user={user} onLogout={handleLogout} />}>
          {/* Protected routes */}
          <Route
            path="/"
            element={<ProtectedRoute user={user} loading={loading} />}
          >
            <Route index element={<Dashboard />} />
            <Route path="routes" element={<RoutesPage />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="users" element={<Users />} />
            <Route path="inventory/new" element={<InventoryForm />} />
            <Route path="inventory/:id/edit" element={<InventoryForm />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
