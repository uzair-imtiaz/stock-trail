import { message } from 'antd';
import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { getUser, logout } from './apis';
import AppLayout from './components/AppLayout';
import InventoryForm from './components/InventoryForm';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashbaord';
import Inventory from './pages/Inventory';
import Invoices from './pages/Invoices';
import Register from './pages/Register';
import RoutesPage from './pages/RoutesPage';
import Sales from './pages/Sales';
import SignIn from './pages/Signin';
import StockManagement from './pages/StockManagement';
import Users from './pages/Users';
import ReceiptForm from './pages/addReceipt';
import Receipts from './pages/Receipts';
import Shops from './pages/Shops';
import Accounts from './pages/Accounts';
import Expenses from './pages/Expenses';
import Purchase from './pages/Purchase';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await getUser();
        if (response?.success) {
          setUser(response.data);
        } else {
          message.error(response?.message || 'Something went wrong');
        }
      } catch (error) {
        message.error(error.message);
      } finally {
        setLoading(false);
      }
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
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="routes" element={<RoutesPage />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="users" element={<Users />} />
            <Route path="inventory/new" element={<InventoryForm />} />
            <Route path="inventory/:id/edit" element={<InventoryForm />} />
            <Route path="sales" element={<Sales />} />
            <Route path="invoices" element={<Invoices />} />
            <Route path="receipts" element={<Receipts />} />
            <Route path="receipts/new" element={<ReceiptForm />} />
            <Route
              path="inventory/stock-management"
              element={<StockManagement />}
            />
            <Route path="core/shops" element={<Shops />} />
            <Route path="core/accounts" element={<Accounts />} />
            <Route path="core/expenses" element={<Expenses />} />
            <Route path="purchase" element={<Purchase />} />
            <Route path="*" element={<h1>404</h1>} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
