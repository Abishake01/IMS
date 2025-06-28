import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Inventory } from './pages/Inventory';
import { Billing } from './pages/Billing';
import { Reports } from './pages/Reports';
import { Sales } from './pages/Sales';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Router>
      <div className="flex h-screen bg-gray-50">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-x-hidden overflow-y-auto">
            <Routes>
              <Route path="/" element={<Dashboard onMenuClick={() => setSidebarOpen(true)} />} />
              <Route path="/inventory" element={<Inventory onMenuClick={() => setSidebarOpen(true)} />} />
              <Route path="/billing" element={<Billing onMenuClick={() => setSidebarOpen(true)} />} />
              <Route path="/sales" element={<Sales onMenuClick={() => setSidebarOpen(true)} />} />
              <Route path="/reports" element={<Reports onMenuClick={() => setSidebarOpen(true)} />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;