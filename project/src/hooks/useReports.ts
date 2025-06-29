import { useState, useEffect } from 'react';
import { supabase, isSupabaseConnected } from '../lib/supabase';
import { format, parseISO, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

interface ReportData {
  totalSales: number;
  totalTransactions: number;
  totalItemsSold: number;
  averageOrderValue: number;
  salesChange: number;
  transactionChange: number;
  itemsChange: number;
  aovChange: number;
}

interface SalesDataPoint {
  name: string;
  sales: number;
  transactions?: number;
  items?: number;
  avgOrderValue?: number;
}

interface TopProduct {
  name: string;
  quantity: number;
  revenue: number;
}

interface ProductDetail {
  item_name: string;
  date: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export function useReports(
  reportType: 'daily' | 'weekly' | 'monthly',
  dateRange: { start: string; end: string }
) {
  const [reports, setReports] = useState<ReportData>({
    totalSales: 0,
    totalTransactions: 0,
    totalItemsSold: 0,
    averageOrderValue: 0,
    salesChange: 0,
    transactionChange: 0,
    itemsChange: 0,
    aovChange: 0
  });
  const [salesData, setSalesData] = useState<SalesDataPoint[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [productDetails, setProductDetails] = useState<ProductDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, [reportType, dateRange]);

  const fetchReportData = async () => {
    try {
      setLoading(true);

      if (isSupabaseConnected && supabase) {
        const startDate = new Date(dateRange.start + 'T00:00:00');
        const endDate = new Date(dateRange.end + 'T23:59:59');

        // Fetch sales data for the period
        const { data: salesData, error: salesError } = await supabase
          .from('sales')
          .select('*')
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString());

        if (salesError) throw salesError;

        // Fetch sale items for the period with sales data
        const { data: saleItemsData, error: itemsError } = await supabase
          .from('sale_items')
          .select(`
            *,
            sales!inner(created_at)
          `)
          .gte('sales.created_at', startDate.toISOString())
          .lte('sales.created_at', endDate.toISOString());

        if (itemsError) throw itemsError;

        // Calculate totals
        const totalSales = salesData?.reduce((sum, sale) => sum + sale.final_amount, 0) || 0;
        const totalTransactions = salesData?.length || 0;
        const totalItemsSold = saleItemsData?.reduce((sum, item) => sum + item.quantity, 0) || 0;
        const averageOrderValue = totalTransactions > 0 ? totalSales / totalTransactions : 0;

        // Generate time series data
        const timeSeriesData = generateTimeSeriesData(salesData || [], saleItemsData || [], reportType, startDate, endDate);

        // Get top products
        const topProductsData = getTopProducts(saleItemsData || []);

        // Get product details
        const productDetailsData = getProductDetails(saleItemsData || []);

        setReports({
          totalSales,
          totalTransactions,
          totalItemsSold,
          averageOrderValue,
          salesChange: 5.2, // Mock percentage change
          transactionChange: 3.1,
          itemsChange: 8.7,
          aovChange: 2.3
        });

        setSalesData(timeSeriesData);
        setTopProducts(topProductsData);
        setProductDetails(productDetailsData);
      } else {
        // Mock data for local mode
        const mockProductDetails = [
          { item_name: 'iPhone 15 Pro', date: new Date().toISOString(), quantity: 2, unit_price: 999.99, total_price: 1999.98 },
          { item_name: 'AirPods Pro', date: new Date().toISOString(), quantity: 1, unit_price: 249.99, total_price: 249.99 },
          { item_name: 'Galaxy S24 Ultra', date: new Date(Date.now() - 86400000).toISOString(), quantity: 1, unit_price: 1199.99, total_price: 1199.99 }
        ];

        setReports({
          totalSales: 5250.75,
          totalTransactions: 12,
          totalItemsSold: 18,
          averageOrderValue: 437.56,
          salesChange: 5.2,
          transactionChange: 3.1,
          itemsChange: 8.7,
          aovChange: 2.3
        });

        setSalesData(generateMockTimeSeriesData(reportType));
        setTopProducts([
          { name: 'iPhone 15 Pro', quantity: 5, revenue: 4999.95 },
          { name: 'AirPods Pro', quantity: 8, revenue: 1999.92 },
          { name: 'Galaxy S24 Ultra', quantity: 2, revenue: 2399.98 }
        ]);
        setProductDetails(mockProductDetails);
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
      
      // Fallback to mock data
      const mockProductDetails = [
        { item_name: 'iPhone 15 Pro', date: new Date().toISOString(), quantity: 2, unit_price: 999.99, total_price: 1999.98 },
        { item_name: 'AirPods Pro', date: new Date().toISOString(), quantity: 1, unit_price: 249.99, total_price: 249.99 },
        { item_name: 'Galaxy S24 Ultra', date: new Date(Date.now() - 86400000).toISOString(), quantity: 1, unit_price: 1199.99, total_price: 1199.99 }
      ];

      setReports({
        totalSales: 5250.75,
        totalTransactions: 12,
        totalItemsSold: 18,
        averageOrderValue: 437.56,
        salesChange: 5.2,
        transactionChange: 3.1,
        itemsChange: 8.7,
        aovChange: 2.3
      });

      setSalesData(generateMockTimeSeriesData(reportType));
      setTopProducts([
        { name: 'iPhone 15 Pro', quantity: 5, revenue: 4999.95 },
        { name: 'AirPods Pro', quantity: 8, revenue: 1999.92 },
        { name: 'Galaxy S24 Ultra', quantity: 2, revenue: 2399.98 }
      ]);
      setProductDetails(mockProductDetails);
    } finally {
      setLoading(false);
    }
  };

  const generateTimeSeriesData = (sales: any[], saleItems: any[], type: string, start: Date, end: Date): SalesDataPoint[] => {
    const data: SalesDataPoint[] = [];
    const current = new Date(start);

    while (current <= end) {
      let periodStart: Date;
      let periodEnd: Date;
      let label: string;

      switch (type) {
        case 'daily':
          periodStart = startOfDay(current);
          periodEnd = endOfDay(current);
          label = format(current, 'MMM dd');
          current.setDate(current.getDate() + 1);
          break;
        case 'weekly':
          periodStart = startOfWeek(current);
          periodEnd = endOfWeek(current);
          label = `Week of ${format(periodStart, 'MMM dd')}`;
          current.setDate(current.getDate() + 7);
          break;
        case 'monthly':
          periodStart = startOfMonth(current);
          periodEnd = endOfMonth(current);
          label = format(current, 'MMM yyyy');
          current.setMonth(current.getMonth() + 1);
          break;
        default:
          continue;
      }

      const periodSales = sales.filter(sale => {
        const saleDate = new Date(sale.created_at);
        return saleDate >= periodStart && saleDate <= periodEnd;
      });

      const periodItems = saleItems.filter(item => {
        const saleDate = new Date(item.sales.created_at);
        return saleDate >= periodStart && saleDate <= periodEnd;
      });

      const totalSales = periodSales.reduce((sum, sale) => sum + sale.final_amount, 0);
      const totalTransactions = periodSales.length;
      const totalItems = periodItems.reduce((sum, item) => sum + item.quantity, 0);
      const avgOrderValue = totalTransactions > 0 ? totalSales / totalTransactions : 0;

      data.push({
        name: label,
        sales: totalSales,
        transactions: totalTransactions,
        items: totalItems,
        avgOrderValue
      });
    }

    return data;
  };

  const getTopProducts = (saleItems: any[]): TopProduct[] => {
    const productMap = new Map<string, { quantity: number; revenue: number }>();

    saleItems.forEach(item => {
      const existing = productMap.get(item.item_name) || { quantity: 0, revenue: 0 };
      productMap.set(item.item_name, {
        quantity: existing.quantity + item.quantity,
        revenue: existing.revenue + item.total_price
      });
    });

    return Array.from(productMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  };

  const getProductDetails = (saleItems: any[]): ProductDetail[] => {
    return saleItems.map(item => ({
      item_name: item.item_name,
      date: item.sales.created_at,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price
    })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const generateMockTimeSeriesData = (type: string): SalesDataPoint[] => {
    const data: SalesDataPoint[] = [];
    const count = type === 'daily' ? 7 : type === 'weekly' ? 4 : 3;

    for (let i = 0; i < count; i++) {
      const sales = Math.floor(Math.random() * 2000) + 500;
      const transactions = Math.floor(Math.random() * 10) + 2;
      const items = Math.floor(Math.random() * 15) + 3;

      data.push({
        name: type === 'daily' ? `Day ${i + 1}` : 
              type === 'weekly' ? `Week ${i + 1}` : 
              `Month ${i + 1}`,
        sales,
        transactions,
        items,
        avgOrderValue: sales / transactions
      });
    }

    return data;
  };

  return {
    reports,
    salesData,
    topProducts,
    productDetails,
    loading,
    refresh: fetchReportData
  };
}