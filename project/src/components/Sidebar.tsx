import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Receipt, 
  BarChart3, 
  Settings, 
  Wrench,
  FileText,
  Smartphone,
  CreditCard
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'inventory', label: 'Products', icon: Package },
  { id: 'phones', label: 'Phones', icon: Smartphone },
  { id: 'billing', label: 'Product Billing', icon: Receipt },
  { id: 'phone-billing', label: 'Phone Billing', icon: CreditCard },
  { id: 'sales', label: 'Sales', icon: ShoppingCart },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'service', label: 'Service', icon: Wrench },
  { id: 'admin-service', label: 'Admin Service', icon: Settings },
  { id: 'service-report', label: 'Service Report', icon: FileText },
];

export function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  return (
    <div className="bg-white shadow-lg h-full w-64 fixed left-0 top-0 z-40">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">ShopManager</h1>
            <p className="text-sm text-gray-500">Inventory & Sales</p>
          </div>
        </div>
      </div>
      
      <nav className="mt-6">
        <ul className="space-y-1 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onPageChange(item.id)}
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
    </div>
  );
}