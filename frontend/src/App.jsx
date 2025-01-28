import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import RoutesPage from './pages/RoutesPage';
import Inventory from './pages/Inventory';
import Users from './pages/Users';
import AppLayout from './components/AppLayout';
import Dashboard from './pages/Dashbaord';

// Example user object (replace with actual authentication logic)
const user = {
  isAuthenticated: true, // Change to false to test unauthorized access
  role: 'admin',
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Layout wrapper */}
        <Route element={<AppLayout user={user} />}>
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
}

export default App;
