import { useState } from 'react';
import { supabase, isSupabaseConnected, PhoneIMEI } from '../lib/supabase';

export function usePhoneIMEI() {
  const [phoneIMEIs, setPhoneIMEIs] = useState<PhoneIMEI[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPhoneIMEIs = async (inventoryItemId?: string) => {
    try {
      setLoading(true);

      if (isSupabaseConnected && supabase) {
        let query = supabase.from('phone_imei').select('*');
        
        if (inventoryItemId) {
          query = query.eq('inventory_item_id', inventoryItemId);
        }

        const { data, error } = await query.order('created_at');

        if (error) throw error;
        setPhoneIMEIs(data || []);
      } else {
        // Mock data for local mode
        setPhoneIMEIs([]);
      }
    } catch (error) {
      console.error('Error fetching phone IMEIs:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPhoneIMEI = async (inventoryItemId: string, imeiNumber: string) => {
    try {
      setLoading(true);

      if (isSupabaseConnected && supabase) {
        const { data, error } = await supabase
          .from('phone_imei')
          .insert([{ inventory_item_id: inventoryItemId, imei_number: imeiNumber }])
          .select()
          .single();

        if (error) throw error;
        setPhoneIMEIs(prev => [...prev, data]);
        return { success: true, data };
      } else {
        // Local storage fallback
        const newIMEI: PhoneIMEI = {
          id: Date.now().toString(),
          inventory_item_id: inventoryItemId,
          imei_number: imeiNumber,
          is_sold: false,
          created_at: new Date().toISOString()
        };
        setPhoneIMEIs(prev => [...prev, newIMEI]);
        return { success: true, data: newIMEI };
      }
    } catch (error) {
      console.error('Error creating phone IMEI:', error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const getAvailableIMEIs = async (inventoryItemId: string) => {
    try {
      if (isSupabaseConnected && supabase) {
        const { data, error } = await supabase
          .from('phone_imei')
          .select('*')
          .eq('inventory_item_id', inventoryItemId)
          .eq('is_sold', false);

        if (error) throw error;
        return data || [];
      } else {
        return phoneIMEIs.filter(imei => 
          imei.inventory_item_id === inventoryItemId && !imei.is_sold
        );
      }
    } catch (error) {
      console.error('Error fetching available IMEIs:', error);
      return [];
    }
  };

  const deletePhoneIMEI = async (id: string) => {
    try {
      if (isSupabaseConnected && supabase) {
        const { error } = await supabase
          .from('phone_imei')
          .delete()
          .eq('id', id);

        if (error) throw error;
        setPhoneIMEIs(prev => prev.filter(imei => imei.id !== id));
        return { success: true };
      } else {
        setPhoneIMEIs(prev => prev.filter(imei => imei.id !== id));
        return { success: true };
      }
    } catch (error) {
      console.error('Error deleting phone IMEI:', error);
      return { success: false, error };
    }
  };

  return {
    phoneIMEIs,
    loading,
    createPhoneIMEI,
    getAvailableIMEIs,
    deletePhoneIMEI,
    fetchPhoneIMEIs
  };
}