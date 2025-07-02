import { useState, useEffect } from 'react';
import { supabase, isSupabaseConnected, Service } from '../lib/supabase';

interface ServiceFormData {
  model_name: string;
  problem: string;
  customer_name: string;
  phone_number: string;
  amount: number;
  comments: string;
}

export function useServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchServices = async () => {
    try {
      setLoading(true);

      if (isSupabaseConnected && supabase) {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setServices(data || []);
      } else {
        // Mock data for local mode
        setServices([
          {
            id: '1',
            model_name: 'iPhone 15 Pro',
            problem: 'Screen cracked',
            customer_name: 'John Doe',
            phone_number: '+91 9876543210',
            amount: 5000,
            comments: 'Customer dropped the phone',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const createService = async (serviceData: ServiceFormData) => {
    try {
      setLoading(true);

      if (isSupabaseConnected && supabase) {
        const { data, error } = await supabase
          .from('services')
          .insert([serviceData])
          .select()
          .single();

        if (error) throw error;
        setServices(prev => [data, ...prev]);
        return { success: true, data };
      } else {
        // Local storage fallback
        const newService: Service = {
          ...serviceData,
          id: Date.now().toString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setServices(prev => [newService, ...prev]);
        return { success: true, data: newService };
      }
    } catch (error) {
      console.error('Error creating service:', error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  return {
    services,
    loading,
    createService,
    refresh: fetchServices
  };
}