import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  BarChart3, 
  Settings, 
  Smartphone,
  LogOut
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AdminSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const adminMenuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
  { id: 'inventory', label: 'Products', icon: Package, path: '/admin/inventory' },
  { id: 'phones', label: 'Phones', icon: Smartphone, path: '/admin/phones' },
  { id: 'sales', label: 'Sales', icon: ShoppingCart, path: '/admin/sales' },
  { id: 'reports', label: 'Reports', icon: BarChart3, path: '/admin/reports' },
  { id: 'admin-service', label: 'Admin Service', icon: Settings, path: '/admin/admin-service' },
];

export function AdminSidebar({ isOpen, onToggle }: AdminSidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div 
      id="admin-sidebar"
      className={`bg-white shadow-lg h-full w-64 fixed left-0 top-0 z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">ShopManager</h1>
            <p className="text-sm text-gray-500">Admin Panel</p>
          </div>
        </div>
      </div>
      
      {/* User Info */}
      <div className="px-6 py-3 bg-gray-50 border-y border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-medium text-sm">
              {user?.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
      
      <nav className="mt-6">
        <ul className="space-y-1 px-3">
          {adminMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-blue-700' : 'text-gray-500'}`} />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="absolute bottom-6 left-3 right-3">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5 text-gray-500" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}