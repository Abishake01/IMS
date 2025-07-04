import { useState, useEffect } from 'react';
import { supabase, InventoryItem, isSupabaseConnected, sampleInventoryData } from '../lib/supabase';

export function useInventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (isSupabaseConnected && supabase) {
        // Try to fetch from Supabase
        const { data, error } = await supabase
          .from('inventory_items')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setItems(data || []);
      } else {
        // Use local sample data
        setItems(sampleInventoryData);
      }
    } catch (err) {
      console.warn('Supabase connection failed, using local data:', err);
      setItems(sampleInventoryData);
      setError(null); // Don't show error when falling back to local data
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (item: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (isSupabaseConnected && supabase) {
        const { data, error } = await supabase
          .from('inventory_items')
          .insert([item])
          .select()
          .single();

        if (error) throw error;
        setItems(prev => [data, ...prev]);
        return { success: true, data };
      } else {
        // Local storage fallback
        const newItem: InventoryItem = {
          ...item,
          id: Date.now().toString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setItems(prev => [newItem, ...prev]);
        return { success: true, data: newItem };
      }
    } catch (err) {
      console.error('Error adding item:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to save item to database'
      };
    }
  };

  const updateItem = async (id: string, updates: Partial<InventoryItem>) => {
    try {
      if (isSupabaseConnected && supabase) {
        const { data, error } = await supabase
          .from('inventory_items')
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        setItems(prev => prev.map(item => item.id === id ? data : item));
        return { success: true, data };
      } else {
        // Local storage fallback
        const updatedItem = { ...updates, updated_at: new Date().toISOString() };
        setItems(prev => prev.map(item => 
          item.id === id ? { ...item, ...updatedItem } : item
        ));
        return { success: true, data: updatedItem };
      }
    } catch (err) {
      console.error('Error updating item:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to update item in database'
      };
    }
  };

  const deleteItem = async (id: string) => {
    try {
      if (isSupabaseConnected && supabase) {
        // Check if item has been sold
        const { data: saleItems } = await supabase
          .from('sale_items')
          .select('id')
          .eq('inventory_item_id', id)
          .limit(1);

        if (saleItems && saleItems.length > 0) {
          // Item has been sold, update status to discontinued instead of deleting
          const result = await updateItem(id, { status: 'discontinued' });
          if (result.success) {
            alert('This item has been sold and cannot be deleted. Status has been changed to "Discontinued" instead.');
            return { success: true };
          } else {
            return { 
              success: false, 
              error: 'Cannot delete item that has been sold. Failed to update status.' 
            };
          }
        }

        // First, optimistically update the UI
        const originalItems = [...items];
        setItems(prev => prev.filter(item => item.id !== id));

        // Then try to delete from Supabase
        const { error } = await supabase
          .from('inventory_items')
          .delete()
          .eq('id', id);

        if (error) {
          // If deletion fails, revert the optimistic update
          console.error('Failed to delete from Supabase:', error);
          setItems(originalItems);
          throw error;
        }
        
        return { success: true };
      } else {
        // Local storage - remove from state
        setItems(prev => prev.filter(item => item.id !== id));
        return { success: true };
      }
    } catch (err) {
      console.error('Error deleting item:', err);
      return { success: false, error: err };
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return {
    items,
    loading,
    error,
    addItem,
    updateItem,
    deleteItem,
    refresh: fetchItems,
    isUsingLocalData: !isSupabaseConnected
  };
}