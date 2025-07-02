import { createClient } from '@supabase/supabase-js';

// Check if Supabase environment variables are available
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create client only if environment variables exist
export const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export const isSupabaseConnected = Boolean(supabaseUrl && supabaseKey);

export interface InventoryItem {
  id: string;
  name: string;
  brand: string;
  category: string;
  sku: string;
  price: number;
  cost_price: number;
  stock_quantity: number;
  min_stock_level: number;
  description: string;
  specifications: Record<string, any>;
  image_url: string;
  status: 'active' | 'discontinued' | 'out_of_stock';
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface Sale {
  id: string;
  customer_id?: string;
  customer_name: string;
  customer_phone?: string;
  total_amount: number;
  discount_amount: number;
  final_amount: number;
  payment_method: string;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  inventory_item_id: string;
  item_name: string;
  item_sku: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}

export interface Service {
  id: string;
  model_name: string;
  problem: string;
  customer_name: string;
  phone_number: string;
  amount: number;
  material_cost?: number;
  comments: string;
  created_at: string;
  updated_at: string;
}

export interface StockMovement {
  id: string;
  inventory_item_id: string;
  movement_type: 'sale' | 'purchase' | 'adjustment' | 'return';
  quantity: number;
  reference_id?: string;
  reference_type?: string;
  notes?: string;
  created_at: string;
}

export interface DailyReport {
  id: string;
  report_date: string;
  total_sales: number;
  total_transactions: number;
  total_items_sold: number;
  top_selling_items: any[];
  created_at: string;
  updated_at: string;
}

// Sample data for fallback
export const sampleInventoryData: InventoryItem[] = [
  {
    id: '1',
    name: 'iPhone 15 Pro',
    brand: 'Apple',
    category: 'phones',
    sku: 'APL-IP15P-128',
    price: 999.99,
    cost_price: 850.00,
    stock_quantity: 15,
    min_stock_level: 5,
    description: 'Latest iPhone with A17 Pro chip and titanium design',
    specifications: { storage: '128GB', color: 'Natural Titanium', display: '6.1 inch' },
    image_url: 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=400',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Galaxy S24 Ultra',
    brand: 'Samsung',
    category: 'phones',
    sku: 'SAM-GS24U-256',
    price: 1199.99,
    cost_price: 1000.00,
    stock_quantity: 8,
    min_stock_level: 3,
    description: 'Premium Samsung flagship with S Pen and AI features',
    specifications: { storage: '256GB', color: 'Titanium Black', display: '6.8 inch' },
    image_url: 'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg?auto=compress&cs=tinysrgb&w=400',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    name: 'AirPods Pro (2nd Gen)',
    brand: 'Apple',
    category: 'accessories',
    sku: 'APL-APP-GEN2',
    price: 249.99,
    cost_price: 180.00,
    stock_quantity: 25,
    min_stock_level: 10,
    description: 'Wireless earbuds with active noise cancellation',
    specifications: { battery: '30 hours', features: 'ANC, Spatial Audio' },
    image_url: 'https://images.pexels.com/photos/3780681/pexels-photo-3780681.jpeg?auto=compress&cs=tinysrgb&w=400',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '4',
    name: 'iPhone 15 Silicone Case',
    brand: 'Apple',
    category: 'cases',
    sku: 'APL-IP15-CASE-BLK',
    price: 49.99,
    cost_price: 25.00,
    stock_quantity: 2,
    min_stock_level: 20,
    description: 'Official Apple silicone case for iPhone 15',
    specifications: { material: 'Silicone', color: 'Black' },
    image_url: 'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg?auto=compress&cs=tinysrgb&w=400',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '5',
    name: 'Galaxy Buds Pro',
    brand: 'Samsung',
    category: 'accessories',
    sku: 'SAM-GBP-WHT',
    price: 199.99,
    cost_price: 140.00,
    stock_quantity: 12,
    min_stock_level: 8,
    description: 'Premium wireless earbuds with ANC',
    specifications: { battery: '28 hours', features: 'ANC, 360 Audio' },
    image_url: 'https://images.pexels.com/photos/3780681/pexels-photo-3780681.jpeg?auto=compress&cs=tinysrgb&w=400',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '6',
    name: 'iPad Air (5th Gen)',
    brand: 'Apple',
    category: 'tablets',
    sku: 'APL-IPAD-AIR5-64',
    price: 599.99,
    cost_price: 480.00,
    stock_quantity: 0,
    min_stock_level: 5,
    description: 'Powerful iPad with M1 chip',
    specifications: { storage: '64GB', color: 'Space Gray', display: '10.9 inch' },
    image_url: 'https://images.pexels.com/photos/1334597/pexels-photo-1334597.jpeg?auto=compress&cs=tinysrgb&w=400',
    status: 'out_of_stock',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '7',
    name: 'Apple Watch Series 9',
    brand: 'Apple',
    category: 'smart_watches',
    sku: 'APL-AW9-45MM',
    price: 429.99,
    cost_price: 350.00,
    stock_quantity: 18,
    min_stock_level: 6,
    description: 'Advanced smartwatch with health monitoring',
    specifications: { size: '45mm', color: 'Midnight', features: 'GPS, Cellular' },
    image_url: 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=400',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '8',
    name: 'USB-C Fast Charger',
    brand: 'Apple',
    category: 'chargers',
    sku: 'APL-USBC-20W',
    price: 19.99,
    cost_price: 12.00,
    stock_quantity: 45,
    min_stock_level: 25,
    description: '20W USB-C power adapter',
    specifications: { power: '20W', connector: 'USB-C' },
    image_url: 'https://images.pexels.com/photos/4526414/pexels-photo-4526414.jpeg?auto=compress&cs=tinysrgb&w=400',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];