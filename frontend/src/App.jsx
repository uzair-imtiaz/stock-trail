import { message } from 'antd';
import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { getUser, logout } from './apis';
import AppLayout from './components/AppLayout';
import InventoryForm from './components/InventoryForm';
import ProtectedRoute from './components/ProtectedRoute';
import Inventory from './pages/Inventory';
import Invoices from './pages/Invoices';
import Register from './pages/Register';
import RoutesPage from './pages/RoutesPage';
import Sales from './pages/Sales';
import SignIn from './pages/Signin';
import StockManagement from './pages/StockManagement';
import Users from './pages/Users';
import ReceiptForm from './pages/AddReceipt';
import Receipts from './pages/Receipts';
import Shops from './pages/Shops';
import Accounts from './pages/Accounts';
import Expenses from './pages/Expenses';
import Purchase from './pages/Purchase';
import Reports from './pages/Reports';
import ExpenseReport from './components/reports/ExpenseReport';
import CreditsReport from './components/reports/CreditsReport';
import SalesReport from './components/reports/SalesReport';
import PurchaseReport from './components/reports/PurchaseReport';
import Deductions from './pages/Deductions';
import Vendors from './pages/Vendors';

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
        console.log(error);
        message.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    const token = Cookies.get('token') || localStorage.getItem('token');
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = (user) => {
    setUser(user);
    Cookies.set('token', user.token);
    localStorage.setItem('token', user.token);
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
            <Route path="routes" element={<RoutesPage />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="users" element={<Users />} />
            <Route path="inventory/new" element={<InventoryForm />} />
            <Route path="inventory/:id/edit" element={<InventoryForm />} />
            <Route path="sales" element={<Sales />} />
            <Route path="sales/:id" element={<Sales />} />
            <Route path="sales/invoices" element={<Invoices />} />
            <Route path="sales/receipts" element={<Receipts />} />
            <Route path="sales/receipts/new" element={<ReceiptForm />} />
            <Route
              path="inventory/stock-management"
              element={<StockManagement />}
            />
            <Route path="core/shops" element={<Shops />} />
            <Route path="core/accounts" element={<Accounts />} />
            <Route path="core/expenses" element={<Expenses />} />
            <Route path="core/deductions" element={<Deductions />} />
            <Route path="core/vendors" element={<Vendors />} />
            <Route path="purchase" element={<Purchase />} />
            <Route path="reports" element={<Reports />} />
            <Route path="reports/expense" element={<ExpenseReport />} />
            <Route path="reports/credits" element={<CreditsReport />} />
            <Route path="reports/sale" element={<SalesReport />} />
            <Route path="reports/purchase" element={<PurchaseReport />} />
            <Route path="*" element={<h1>404</h1>} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
