import { useState } from 'react';
import { supabase, isSupabaseConnected } from '../lib/supabase';

interface SaleItem {
  inventory_item_id: string;
  item_name: string;
  item_sku: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  selectedIMEI?: string;
}

interface SaleData {
  customer_name: string;
  customer_phone?: string;
  total_amount: number;
  discount_amount: number;
  gst_amount?: number;
  cgst_amount?: number;
  final_amount: number;
  payment_method: string;
  notes?: string;
  items: SaleItem[];
}

export function useBilling() {
  const [loading, setLoading] = useState(false);

  const createSale = async (saleData: SaleData) => {
    setLoading(true);
    try {
      if (!isSupabaseConnected || !supabase) {
        // Local fallback - just return success
        console.log('Sale created locally:', saleData);
        return { success: true, data: { id: Date.now().toString() } };
      }

      // Create the sale record (without GST columns since they don't exist in the database)
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert([{
          customer_name: saleData.customer_name,
          customer_phone: saleData.customer_phone,
          total_amount: saleData.total_amount,
          discount_amount: saleData.discount_amount,
          final_amount: saleData.final_amount,
          payment_method: saleData.payment_method,
          notes: saleData.notes,
          status: 'completed'
        }])
        .select()
        .single();

      if (saleError) throw saleError;

      // Create sale items
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

      // Handle IMEI marking for phones
      for (const item of saleData.items) {
        if (item.selectedIMEI) {
          // Find the sale item that was just created
          const { data: createdSaleItem } = await supabase
            .from('sale_items')
            .select('id')
            .eq('sale_id', sale.id)
            .eq('inventory_item_id', item.inventory_item_id)
            .single();

          if (createdSaleItem) {
            // Mark the IMEI as sold
            await supabase
              .from('phone_imei')
              .update({ 
                is_sold: true, 
                sale_item_id: createdSaleItem.id 
              })
              .eq('imei_number', item.selectedIMEI);
          }
        }
      }

      return { success: true, data: sale };
    } catch (error) {
      console.error('Error creating sale:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create sale' 
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    createSale,
    loading
  };
}