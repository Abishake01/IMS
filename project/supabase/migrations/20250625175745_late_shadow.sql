/*
  # Mobile Shop Inventory Management Schema

  1. New Tables
    - `inventory_items`
      - `id` (uuid, primary key)
      - `name` (text) - Item name/model
      - `brand` (text) - Brand name (Apple, Samsung, etc.)
      - `category` (text) - phones, accessories, cases, etc.
      - `sku` (text, unique) - Stock keeping unit
      - `price` (decimal) - Selling price
      - `cost_price` (decimal) - Cost price
      - `stock_quantity` (integer) - Current stock
      - `min_stock_level` (integer) - Minimum stock alert level
      - `description` (text) - Item description
      - `specifications` (jsonb) - Technical specs
      - `image_url` (text) - Product image URL
      - `status` (text) - active, discontinued, out_of_stock
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `inventory_items` table
    - Add policies for authenticated users to manage inventory
*/

CREATE TABLE IF NOT EXISTS inventory_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  brand text NOT NULL,
  category text NOT NULL DEFAULT 'phones',
  sku text UNIQUE NOT NULL,
  price decimal(10,2) NOT NULL DEFAULT 0.00,
  cost_price decimal(10,2) NOT NULL DEFAULT 0.00,
  stock_quantity integer NOT NULL DEFAULT 0,
  min_stock_level integer NOT NULL DEFAULT 5,
  description text DEFAULT '',
  specifications jsonb DEFAULT '{}',
  image_url text DEFAULT '',
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Allow authenticated users to read inventory"
  ON inventory_items
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert inventory"
  ON inventory_items
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update inventory"
  ON inventory_items
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to delete inventory"
  ON inventory_items
  FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON inventory_items(category);
CREATE INDEX IF NOT EXISTS idx_inventory_items_brand ON inventory_items(brand);
CREATE INDEX IF NOT EXISTS idx_inventory_items_status ON inventory_items(status);
CREATE INDEX IF NOT EXISTS idx_inventory_items_stock ON inventory_items(stock_quantity);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_inventory_items_updated_at
  BEFORE UPDATE ON inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO inventory_items (name, brand, category, sku, price, cost_price, stock_quantity, min_stock_level, description, specifications, image_url, status) VALUES
  ('iPhone 15 Pro', 'Apple', 'phones', 'APL-IP15P-128', 999.99, 850.00, 15, 5, 'Latest iPhone with A17 Pro chip', '{"storage": "128GB", "color": "Natural Titanium", "display": "6.1 inch"}', 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg', 'active'),
  ('Galaxy S24 Ultra', 'Samsung', 'phones', 'SAM-GS24U-256', 1199.99, 1000.00, 8, 3, 'Premium Samsung flagship with S Pen', '{"storage": "256GB", "color": "Titanium Black", "display": "6.8 inch"}', 'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg', 'active'),
  ('AirPods Pro', 'Apple', 'accessories', 'APL-APP-GEN2', 249.99, 180.00, 25, 10, 'Wireless earbuds with active noise cancellation', '{"battery": "30 hours", "features": "ANC, Spatial Audio"}', 'https://images.pexels.com/photos/3780681/pexels-photo-3780681.jpeg', 'active'),
  ('iPhone 15 Case', 'Apple', 'cases', 'APL-IP15-CASE-BLK', 49.99, 25.00, 50, 20, 'Official Apple silicone case for iPhone 15', '{"material": "Silicone", "color": "Black"}', 'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg', 'active'),
  ('Galaxy Buds Pro', 'Samsung', 'accessories', 'SAM-GBP-WHT', 199.99, 140.00, 12, 8, 'Premium wireless earbuds with ANC', '{"battery": "28 hours", "features": "ANC, 360 Audio"}', 'https://images.pexels.com/photos/3780681/pexels-photo-3780681.jpeg', 'active');