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
import { AuthProvider } from './contexts/AuthContext';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'inventory':
        return <Inventory />;
      case 'phones':
        return <Phones />;
      case 'billing':
        return <Billing />;
      case 'phone-billing':
        return <PhoneBilling />;
      case 'sales':
        return <Sales />;
      case 'reports':
        return <Reports />;
      case 'service':
        return <Service />;
      case 'admin-service':
        return <AdminService />;
      case 'service-report':
        return <ServiceReport />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <AuthProvider>
      <div className="flex h-screen bg-gray-50">
        <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
        <main className="flex-1 ml-64 overflow-auto">
          <div className="p-8">
            {renderPage()}
          </div>
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;