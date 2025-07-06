import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginForm } from './components/LoginForm';
import { AdminLayout } from './components/AdminLayout';
import { UserLayout } from './components/UserLayout';
import { ProtectedRoute } from './components/ProtectedRoute';

// Admin Pages
import { Dashboard } from './pages/Dashboard';
import { Inventory } from './pages/Inventory';
import { Phones } from './pages/Phones';
import { Sales } from './pages/Sales';
import { Reports } from './pages/Reports';
import { AdminService } from './pages/AdminService';

// User Pages
import { Billing } from './pages/Billing';
import { PhoneBilling } from './pages/PhoneBilling';
import { Service } from './pages/Service';
import { ServiceReport } from './pages/ServiceReport';

function AppRoutes() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return (
    <Routes>
      {/* Admin Routes */}
      <Route path="/admin/*" element={
        <ProtectedRoute requiredRole="admin">
          <AdminLayout>
            <Routes>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="phones" element={<Phones />} />
              <Route path="sales" element={<Sales />} />
              <Route path="reports" element={<Reports />} />
              <Route path="admin-service" element={<AdminService />} />
              <Route path="" element={<Navigate to="dashboard" replace />} />
            </Routes>
          </AdminLayout>
        </ProtectedRoute>
      } />

      {/* User Routes */}
      <Route path="/user/*" element={
        <ProtectedRoute requiredRole="user">
          <UserLayout>
            <Routes>
              <Route path="billing" element={<Billing />} />
              <Route path="phone-billing" element={<PhoneBilling />} />
              <Route path="service" element={<Service />} />
              <Route path="service-report" element={<ServiceReport />} />
              <Route path="" element={<Navigate to="billing" replace />} />
            </Routes>
          </UserLayout>
        </ProtectedRoute>
      } />

      {/* Default redirects based on user role */}
      <Route path="/" element={
        user?.role === 'admin' 
          ? <Navigate to="/admin/dashboard" replace />
          : <Navigate to="/user/billing" replace />
      } />
      
      {/* Catch all - redirect to appropriate dashboard */}
      <Route path="*" element={
        user?.role === 'admin' 
          ? <Navigate to="/admin/dashboard" replace />
          : <Navigate to="/user/billing" replace />
      } />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;