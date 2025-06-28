import React from 'react';
import { Menu, TrendingUp, Package, DollarSign, Users, AlertTriangle, ShoppingCart } from 'lucide-react';
import { StatsCard } from '../components/StatsCard';
import { RecentSales } from '../components/RecentSales';
import { LowStockAlert } from '../components/LowStockAlert';
import { SalesChart } from '../components/SalesChart';
import { useDashboard } from '../hooks/useDashboard';

interface DashboardProps {
  onMenuClick: () => void;
}

export function Dashboard({ onMenuClick }: DashboardProps) {
  const { stats, recentSales, lowStockItems, salesData, loading } = useDashboard();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your store.</p>
        </div>
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Today's Sales"
          value={`₹${stats.todaySales.toLocaleString()}`}
          icon={DollarSign}
          color="bg-green-500"
          trend={{ value: stats.salesGrowth, isPositive: stats.salesGrowth >= 0 }}
        />
        <StatsCard
          title="Total Products"
          value={stats.totalProducts}
          icon={Package}
          color="bg-blue-500"
        />
        <StatsCard
          title="Low Stock Items"
          value={stats.lowStockCount}
          icon={AlertTriangle}
          color="bg-amber-500"
        />
        <StatsCard
          title="Total Customers"
          value={stats.totalCustomers}
          icon={Users}
          color="bg-purple-500"
        />
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <SalesChart data={salesData} />
        <RecentSales sales={recentSales} />
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <LowStockAlert items={lowStockItems} />
      )}
    </div>
  );
}