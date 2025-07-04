import { useState, useEffect } from 'react';
import { supabase, isSupabaseConnected, Category } from '../lib/supabase';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);

      if (isSupabaseConnected && supabase) {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('display_name');

        if (error) throw error;
        setCategories(data || []);
      } else {
        // Mock data for local mode
        setCategories([
          { id: '1', name: 'phones', display_name: 'Phones', created_at: new Date().toISOString() },
          { id: '2', name: 'accessories', display_name: 'Accessories', created_at: new Date().toISOString() },
          { id: '3', name: 'cases', display_name: 'Cases', created_at: new Date().toISOString() },
          { id: '4', name: 'chargers', display_name: 'Chargers', created_at: new Date().toISOString() },
          { id: '5', name: 'tablets', display_name: 'Tablets', created_at: new Date().toISOString() },
          { id: '6', name: 'smart_watches', display_name: 'Smart Watches', created_at: new Date().toISOString() }
        ]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (name: string, displayName: string) => {
    try {
      setLoading(true);

      if (isSupabaseConnected && supabase) {
        const { data, error } = await supabase
          .from('categories')
          .insert([{ name: name.toLowerCase().replace(/\s+/g, '_'), display_name: displayName }])
          .select()
          .single();

        if (error) throw error;
        setCategories(prev => [...prev, data]);
        return { success: true, data };
      } else {
        // Local storage fallback
        const newCategory: Category = {
          id: Date.now().toString(),
          name: name.toLowerCase().replace(/\s+/g, '_'),
          display_name: displayName,
          created_at: new Date().toISOString()
        };
        setCategories(prev => [...prev, newCategory]);
        return { success: true, data: newCategory };
      }
    } catch (error) {
      console.error('Error creating category:', error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    createCategory,
    refresh: fetchCategories
  };
}