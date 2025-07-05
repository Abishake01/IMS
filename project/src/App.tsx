import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Inventory } from './pages/Inventory';
import { Phones } from './pages/Phones';
import { Billing } from './pages/Billing';
import { PhoneBilling } from './pages/PhoneBilling';
import { Sales } from './pages/Sales';
import { Reports } from './pages/Reports';
import { Service } from './pages/Service';
import { AdminService } from './pages/AdminService';
import { ServiceReport } from './pages/ServiceReport';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginForm } from './components/LoginForm';

// Helper functions moved outside component to prevent re-creation
const isValidUserPage = (page: string) => {
  const userPages = ['billing', 'phone-billing', 'service', 'service-report'];
  return userPages.includes(page);
};

const isValidAdminPage = (page: string) => {
  const adminPages = ['dashboard', 'inventory', 'phones', 'sales', 'reports', 'admin-service'];
  return adminPages.includes(page);
};

function AppContent() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const { user, isLoading } = useAuth();

  const isAdmin = user?.role === 'admin';

  // Move useEffect to top level, before any conditional returns
  React.useEffect(() => {
    if (!user) return; // Don't set page if no user
    
    if (isAdmin && currentPage === 'dashboard') {
      setCurrentPage('dashboard');
    } else if (!isAdmin && (currentPage === 'dashboard' || !isValidUserPage(currentPage))) {
      setCurrentPage('billing');
    }
  }, [user, isAdmin, currentPage]);

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

  const renderPage = () => {
    // Admin pages
    if (isAdmin) {
      if (!isValidAdminPage(currentPage)) {
        return <Dashboard />;
      }

      switch (currentPage) {
        case 'dashboard':
          return <Dashboard />;
        case 'inventory':
          return <Inventory />;
        case 'phones':
          return <Phones />;
        case 'sales':
          return <Sales />;
        case 'reports':
          return <Reports />;
        case 'admin-service':
          return <AdminService />;
        default:
          return <Dashboard />;
      }
    }

    // User pages
    if (!isValidUserPage(currentPage)) {
      return <Billing />;
    }

    switch (currentPage) {
      case 'billing':
        return <Billing />;
      case 'phone-billing':
        return <PhoneBilling />;
      case 'service':
        return <Service />;
      case 'service-report':
        return <ServiceReport />;
      default:
        return <Billing />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      <main className="flex-1 ml-64 overflow-auto">
        <div className="p-8">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;