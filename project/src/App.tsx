import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginForm } from './components/LoginForm';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Inventory } from './pages/Inventory';
import { Billing } from './pages/Billing';
import { Reports } from './pages/Reports';
import { Sales } from './pages/Sales';

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
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
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <Routes>
            {user.role === 'admin' ? (
              <>
                <Route path="/" element={<Dashboard onMenuClick={() => setSidebarOpen(true)} />} />
                <Route path="/inventory" element={<Inventory onMenuClick={() => setSidebarOpen(true)} />} />
                <Route path="/sales" element={<Sales onMenuClick={() => setSidebarOpen(true)} />} />
                <Route path="/reports" element={<Reports onMenuClick={() => setSidebarOpen(true)} />} />
                <Route path="/billing" element={<Navigate to="/" replace />} />
              </>
            ) : (
              <>
                <Route path="/billing" element={<Billing onMenuClick={() => setSidebarOpen(true)} />} />
                <Route path="*" element={<Navigate to="/billing" replace />} />
              </>
            )}
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;