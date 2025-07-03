import { useState, useEffect } from 'react';
import { supabase, isSupabaseConnected, getWarrantyStatus } from '../lib/supabase';

interface Sale {
  id: string;
  customer_name: string;
  customer_phone?: string;
  total_amount: number;
  discount_amount: number;
  final_amount: number;
  payment_method: string;
  status: string;
  created_at: string;
  sale_items?: SaleItem[];
}

interface SaleItem {
  id: string;
  item_name: string;
  item_sku: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  inventory_item?: {
    has_warranty: boolean;
    warranty_duration: number;
    warranty_unit: string;
  };
}

export function useSales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      setLoading(true);

      if (isSupabaseConnected && supabase) {
        const { data, error } = await supabase
          .from('sales')
          .select(`
            *,
            sale_items (
              id,
              item_name,
              item_sku,
              quantity,
              unit_price,
              total_price,
              inventory_items:inventory_item_id (
                has_warranty,
                warranty_duration,
                warranty_unit
              )
            )
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        // Process the data to include warranty information
        const processedSales = data?.map(sale => ({
          ...sale,
          sale_items: sale.sale_items?.map((item: any) => ({
            ...item,
            inventory_item: item.inventory_items,
            warranty_status: item.inventory_items ? 
              getWarrantyStatus(
                sale.created_at,
                item.inventory_items.has_warranty,
                item.inventory_items.warranty_duration,
                item.inventory_items.warranty_unit
              ) : 'No Warranty'
          }))
        })) || [];

        setSales(processedSales);
      } else {
        // Mock data for local mode
        setSales([
          {
            id: '1',
            customer_name: 'John Doe',
            customer_phone: '+1234567890',
            total_amount: 999.99,
            discount_amount: 0,
            final_amount: 999.99,
            payment_method: 'card',
            status: 'completed',
            created_at: new Date().toISOString(),
            sale_items: [
              {
                id: '1',
                item_name: 'iPhone 15 Pro',
                item_sku: 'APL-IP15P-128',
                quantity: 1,
                unit_price: 999.99,
                total_price: 999.99,
                inventory_item: {
                  has_warranty: true,
                  warranty_duration: 12,
                  warranty_unit: 'months'
                }
              }
            ]
          },
          {
            id: '2',
            customer_name: 'Jane Smith',
            customer_phone: '+1234567891',
            total_amount: 249.99,
            discount_amount: 25.00,
            final_amount: 224.99,
            payment_method: 'cash',
            status: 'completed',
            created_at: new Date(Date.now() - 86400000).toISOString(),
            sale_items: [
              {
                id: '2',
                item_name: 'AirPods Pro (2nd Gen)',
                item_sku: 'APL-APP-GEN2',
                quantity: 1,
                unit_price: 249.99,
                total_price: 249.99,
                inventory_item: {
                  has_warranty: true,
                  warranty_duration: 6,
                  warranty_unit: 'months'
                }
              }
            ]
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching sales:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    sales,
    loading,
    refresh: fetchSales
  };
}