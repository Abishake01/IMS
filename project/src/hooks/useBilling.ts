import { useState } from 'react';
import { supabase, isSupabaseConnected } from '../lib/supabase';

interface SaleItem {
  inventory_item_id: string;
  item_name: string;
  item_sku: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface SaleData {
  customer_name: string;
  customer_phone?: string;
  total_amount: number;
  discount_amount: number;
  final_amount: number;
  payment_method: string;
  items: SaleItem[];
}

export function useBilling() {
  const [loading, setLoading] = useState(false);

  const createSale = async (saleData: SaleData) => {
    try {
      setLoading(true);

      if (isSupabaseConnected && supabase) {
        // Start a transaction by creating the sale first
        const { data: sale, error: saleError } = await supabase
          .from('sales')
          .insert([{
            customer_name: saleData.customer_name,
            customer_phone: saleData.customer_phone,
            total_amount: saleData.total_amount,
            discount_amount: saleData.discount_amount,
            final_amount: saleData.final_amount,
            payment_method: saleData.payment_method,
            status: 'completed'
          }])
          .select()
          .single();

        if (saleError) throw saleError;

        // Insert sale items
        const saleItems = saleData.items.map(item => ({
          sale_id: sale.id,
          inventory_item_id: item.inventory_item_id,
          item_name: item.item_name,
          item_sku: item.item_sku,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price
        }));

        const { error: itemsError } = await supabase
          .from('sale_items')
          .insert(saleItems);

        if (itemsError) throw itemsError;

        return { success: true, data: sale };
      } else {
        // Mock success for local mode
        console.log('Sale created (local mode):', saleData);
        return { success: true, data: { id: Date.now().toString() } };
      }
    } catch (error) {
      console.error('Error creating sale:', error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  return {
    createSale,
    loading
  };
}