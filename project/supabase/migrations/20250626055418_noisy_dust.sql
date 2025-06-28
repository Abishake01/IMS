/*
  # Complete Billing and Sales Management System

  1. New Tables
    - `customers` - Customer information
    - `sales` - Sales transactions
    - `sale_items` - Individual items in each sale
    - `daily_reports` - Daily sales summaries
    - `stock_movements` - Track all stock changes

  2. Updated Tables
    - Add triggers to automatically update inventory when sales are made

  3. Security
    - Enable RLS on all new tables
    - Add policies for authenticated and anonymous users
*/

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  phone text,
  address text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create sales table
CREATE TABLE IF NOT EXISTS sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id),
  customer_name text NOT NULL,
  customer_phone text,
  total_amount decimal(10,2) NOT NULL DEFAULT 0.00,
  discount_amount decimal(10,2) DEFAULT 0.00,
  final_amount decimal(10,2) NOT NULL DEFAULT 0.00,
  payment_method text DEFAULT 'cash',
  status text DEFAULT 'completed',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create sale_items table
CREATE TABLE IF NOT EXISTS sale_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id uuid REFERENCES sales(id) ON DELETE CASCADE,
  inventory_item_id uuid REFERENCES inventory_items(id),
  item_name text NOT NULL,
  item_sku text NOT NULL,
  quantity integer NOT NULL,
  unit_price decimal(10,2) NOT NULL,
  total_price decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create stock_movements table
CREATE TABLE IF NOT EXISTS stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_item_id uuid REFERENCES inventory_items(id),
  movement_type text NOT NULL, -- 'sale', 'purchase', 'adjustment', 'return'
  quantity integer NOT NULL, -- positive for additions, negative for reductions
  reference_id uuid, -- sale_id, purchase_id, etc.
  reference_type text, -- 'sale', 'purchase', etc.
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create daily_reports table
CREATE TABLE IF NOT EXISTS daily_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_date date NOT NULL UNIQUE,
  total_sales decimal(10,2) DEFAULT 0.00,
  total_transactions integer DEFAULT 0,
  total_items_sold integer DEFAULT 0,
  top_selling_items jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;

-- Create policies for customers
CREATE POLICY "Allow all operations on customers" ON customers FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Create policies for sales
CREATE POLICY "Allow all operations on sales" ON sales FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Create policies for sale_items
CREATE POLICY "Allow all operations on sale_items" ON sale_items FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Create policies for stock_movements
CREATE POLICY "Allow all operations on stock_movements" ON stock_movements FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Create policies for daily_reports
CREATE POLICY "Allow all operations on daily_reports" ON daily_reports FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at);
CREATE INDEX IF NOT EXISTS idx_sales_customer_id ON sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_inventory_item_id ON sale_items(inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_inventory_item_id ON stock_movements(inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created_at ON stock_movements(created_at);
CREATE INDEX IF NOT EXISTS idx_daily_reports_date ON daily_reports(report_date);

-- Create triggers for updated_at columns
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sales_updated_at
  BEFORE UPDATE ON sales
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_reports_updated_at
  BEFORE UPDATE ON daily_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to update inventory stock when sale is made
CREATE OR REPLACE FUNCTION update_inventory_on_sale()
RETURNS TRIGGER AS $$
BEGIN
  -- Update inventory stock
  UPDATE inventory_items 
  SET stock_quantity = stock_quantity - NEW.quantity,
      updated_at = now()
  WHERE id = NEW.inventory_item_id;
  
  -- Create stock movement record
  INSERT INTO stock_movements (
    inventory_item_id,
    movement_type,
    quantity,
    reference_id,
    reference_type,
    notes
  ) VALUES (
    NEW.inventory_item_id,
    'sale',
    -NEW.quantity,
    NEW.sale_id,
    'sale',
    'Stock reduced due to sale'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update inventory on sale
CREATE TRIGGER trigger_update_inventory_on_sale
  AFTER INSERT ON sale_items
  FOR EACH ROW
  EXECUTE FUNCTION update_inventory_on_sale();

-- Function to update daily reports
CREATE OR REPLACE FUNCTION update_daily_report()
RETURNS TRIGGER AS $$
DECLARE
  sale_date date;
  total_items integer;
BEGIN
  sale_date := DATE(NEW.created_at);
  
  -- Get total items sold in this sale
  SELECT COALESCE(SUM(quantity), 0) INTO total_items
  FROM sale_items 
  WHERE sale_id = NEW.id;
  
  -- Insert or update daily report
  INSERT INTO daily_reports (report_date, total_sales, total_transactions, total_items_sold)
  VALUES (sale_date, NEW.final_amount, 1, total_items)
  ON CONFLICT (report_date) 
  DO UPDATE SET
    total_sales = daily_reports.total_sales + NEW.final_amount,
    total_transactions = daily_reports.total_transactions + 1,
    total_items_sold = daily_reports.total_items_sold + total_items,
    updated_at = now();
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update daily reports on new sale
CREATE TRIGGER trigger_update_daily_report
  AFTER INSERT ON sales
  FOR EACH ROW
  EXECUTE FUNCTION update_daily_report();

-- Insert sample customers
INSERT INTO customers (name, email, phone, address) VALUES
  ('John Doe', 'john@example.com', '+1234567890', '123 Main St'),
  ('Jane Smith', 'jane@example.com', '+1234567891', '456 Oak Ave'),
  ('Mike Johnson', 'mike@example.com', '+1234567892', '789 Pine Rd'),
  ('Sarah Wilson', 'sarah@example.com', '+1234567893', '321 Elm St'),
  ('David Brown', 'david@example.com', '+1234567894', '654 Maple Dr');