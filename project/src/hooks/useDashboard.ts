import { useState, useEffect } from 'react';
import { supabase, isSupabaseConnected } from '../lib/supabase';

interface DashboardStats {
  todaySales: number;
  totalProducts: number;
  lowStockCount: number;
  totalCustomers: number;
  salesGrowth: number;
}

interface RecentSale {
  id: string;
  customer_name: string;
  final_amount: number;
  created_at: string;
}

interface LowStockItem {
  id: string;
  name: string;
  stock_quantity: number;
  min_stock_level: number;
}

interface SalesDataPoint {
  name: string;
  sales: number;
}

export function useDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    todaySales: 0,
    totalProducts: 0,
    lowStockCount: 0,
    totalCustomers: 0,
    salesGrowth: 0
  });
  const [recentSales, setRecentSales] = useState<RecentSale[]>([]);
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [salesData, setSalesData] = useState<SalesDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      if (isSupabaseConnected && supabase) {
        // Fetch today's sales
        const today = new Date().toISOString().split('T')[0];
        const { data: todaySalesData } = await supabase
          .from('sales')
          .select('final_amount')
          .gte('created_at', today + 'T00:00:00')
          .lte('created_at', today + 'T23:59:59');

        const todaySales = todaySalesData?.reduce((sum, sale) => sum + sale.final_amount, 0) || 0;

        // Fetch total products
        const { count: totalProducts } = await supabase
          .from('inventory_items')
          .select('*', { count: 'exact', head: true });

        // Fetch low stock items - items where stock_quantity <= min_stock_level
        const { data: lowStockData } = await supabase
          .from('inventory_items')
          .select('id, name, stock_quantity, min_stock_level')
          .filter('stock_quantity', 'lte', 'min_stock_level');

        // Fetch total customers (using sales for customer count since we removed customers table)
        const { data: uniqueCustomers } = await supabase
          .from('sales')
          .select('customer_name')
          .not('customer_name', 'is', null);

        const totalCustomers = new Set(uniqueCustomers?.map(c => c.customer_name)).size || 0;

        // Fetch recent sales
        const { data: recentSalesData } = await supabase
          .from('sales')
          .select('id, customer_name, final_amount, created_at')
          .order('created_at', { ascending: false })
          .limit(5);

        // Fetch sales data for chart (last 7 days)
        const salesChartData = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          
          const { data: daySales } = await supabase
            .from('sales')
            .select('final_amount')
            .gte('created_at', dateStr + 'T00:00:00')
            .lte('created_at', dateStr + 'T23:59:59');

          const dayTotal = daySales?.reduce((sum, sale) => sum + sale.final_amount, 0) || 0;
          
          salesChartData.push({
            name: date.toLocaleDateString('en-US', { weekday: 'short' }),
            sales: dayTotal
          });
        }

        setStats({
          todaySales,
          totalProducts: totalProducts || 0,
          lowStockCount: lowStockData?.length || 0,
          totalCustomers,
          salesGrowth: 5.2 // Mock growth percentage
        });

        setRecentSales(recentSalesData || []);
        setLowStockItems(lowStockData || []);
        setSalesData(salesChartData);
      } else {
        // Mock data for local mode
        setStats({
          todaySales: 1250.50,
          totalProducts: 8,
          lowStockCount: 2,
          totalCustomers: 5,
          salesGrowth: 5.2
        });

        setRecentSales([
          { id: '1', customer_name: 'John Doe', final_amount: 999.99, created_at: new Date().toISOString() },
          { id: '2', customer_name: 'Jane Smith', final_amount: 249.99, created_at: new Date().toISOString() }
        ]);

        setLowStockItems([
          { id: '4', name: 'iPhone 15 Silicone Case', stock_quantity: 2, min_stock_level: 20 },
          { id: '6', name: 'iPad Air (5th Gen)', stock_quantity: 0, min_stock_level: 5 }
        ]);

        setSalesData([
          { name: 'Mon', sales: 1200 },
          { name: 'Tue', sales: 800 },
          { name: 'Wed', sales: 1500 },
          { name: 'Thu', sales: 900 },
          { name: 'Fri', sales: 1800 },
          { name: 'Sat', sales: 2200 },
          { name: 'Sun', sales: 1250 }
        ]);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    stats,
    recentSales,
    lowStockItems,
    salesData,
    loading,
    refresh: fetchDashboardData
  };
}