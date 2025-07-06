import React, { useState, useEffect } from 'react';
import { AdminSidebar } from './AdminSidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById('admin-sidebar');
      const toggleButton = document.getElementById('sidebar-toggle');
      
      if (sidebarOpen && sidebar && toggleButton) {
        if (!sidebar.contains(event.target as Node) && !toggleButton.contains(event.target as Node)) {
          setSidebarOpen(false);
        }
      }
    };

    if (sidebarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Also close on escape key
      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          setSidebarOpen(false);
        }
      };
      document.addEventListener('keydown', handleEscape);
      
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [sidebarOpen]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [children]);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <AdminSidebar 
        isOpen={sidebarOpen} 
        onToggle={() => setSidebarOpen(!sidebarOpen)} 
      />
      
      <main className="flex-1 lg:ml-64 overflow-auto">
        <div className="p-8">
          {/* Mobile menu button */}
          <button
            id="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {sidebarOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
          
          <div className="lg:hidden h-16"></div> {/* Spacer for mobile menu button */}
          {children}
        </div>
      </main>
    </div>
  );
}