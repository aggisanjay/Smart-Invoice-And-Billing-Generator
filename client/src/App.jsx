import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/common/Layout';
import Dashboard from './pages/Dashboard';
import InvoicesPage from './pages/InvoicesPage';
import CreateInvoice from './pages/CreateInvoice';
import EditInvoice from './pages/EditInvoice';
import InvoiceDetail from './pages/InvoiceDetail';
import ClientsPage from './pages/ClientsPage';
import ItemsPage from './pages/ItemsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import './styles/global.css';

const PrivateRoute = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) return <div className="flex-center" style={{ height:'100vh', justifyContent:'center' }}>Loading…</div>;
  return token ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? <Navigate to="/" replace /> : children;
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <Toaster position="top-right" toastOptions={{ duration: 3000, style: { borderRadius: '8px', fontFamily: 'DM Sans' } }} />
          <Routes>
            <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
            <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
              <Route index             element={<Dashboard />} />
              <Route path="invoices"   element={<InvoicesPage />} />
              <Route path="invoices/new"     element={<CreateInvoice />} />
              <Route path="invoices/:id"     element={<InvoiceDetail />} />
              <Route path="invoices/:id/edit" element={<EditInvoice />} />
              <Route path="clients"    element={<ClientsPage />} />
              <Route path="items"      element={<ItemsPage />} />
              <Route path="profile"    element={<ProfilePage />} />
            </Route>
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;