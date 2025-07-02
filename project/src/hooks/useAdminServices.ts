import { useState, useEffect } from 'react';
import { supabase, isSupabaseConnected } from '../lib/supabase';

interface AdminService {
  id: string;
  model_name: string;
  problem: string;
  customer_name: string;
  phone_number: string;
  amount: number;
  material_cost: number;
  comments: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface AdminServiceFormData {
  model_name: string;
  problem: string;
  customer_name: string;
  phone_number: string;
  amount: number;
  material_cost: number;
  comments: string;
  status: string;
}

export function useAdminServices() {
  const [adminServices, setAdminServices] = useState<AdminService[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAdminServices = async () => {
    try {
      setLoading(true);

      if (isSupabaseConnected && supabase) {
        const { data, error } = await supabase
          .from('admin_services')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setAdminServices(data || []);
      } else {
        // Mock data for local mode
        setAdminServices([
          {
            id: '1',
            model_name: 'iPhone 15 Pro',
            problem: 'Screen replacement',
            customer_name: 'John Doe',
            phone_number: '+91 9876543210',
            amount: 8000,
            material_cost: 5000,
            comments: 'Original screen replacement',
            status: 'completed',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching admin services:', error);
    } finally {
      setLoading(false);
    }
  };

  const createAdminService = async (serviceData: AdminServiceFormData) => {
    try {
      setLoading(true);

      if (isSupabaseConnected && supabase) {
        const { data, error } = await supabase
          .from('admin_services')
          .insert([serviceData])
          .select()
          .single();

        if (error) throw error;
        setAdminServices(prev => [data, ...prev]);
        return { success: true, data };
      } else {
        // Local storage fallback
        const newService: AdminService = {
          ...serviceData,
          id: Date.now().toString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setAdminServices(prev => [newService, ...prev]);
        return { success: true, data: newService };
      }
    } catch (error) {
      console.error('Error creating admin service:', error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminServices();
  }, []);

  return {
    adminServices,
    loading,
    createAdminService,
    refresh: fetchAdminServices
  };
}