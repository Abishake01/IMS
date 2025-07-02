/*
  # Admin Services and System Fixes

  1. New Tables
    - `admin_services` - Admin service management with material cost
    
  2. Fixes
    - Ensure proper RLS policies
    - Add material_cost field to services
    
  3. Security
    - Enable RLS on admin_services table
    - Add policies for authenticated and anonymous users
*/

-- Create admin_services table
CREATE TABLE IF NOT EXISTS admin_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_name text NOT NULL,
  problem text NOT NULL,
  customer_name text NOT NULL,
  phone_number text NOT NULL,
  amount decimal(10,2) NOT NULL DEFAULT 0.00,
  material_cost decimal(10,2) NOT NULL DEFAULT 0.00,
  comments text DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add material_cost to existing services table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'services' AND column_name = 'material_cost'
  ) THEN
    ALTER TABLE services ADD COLUMN material_cost decimal(10,2) DEFAULT 0.00;
  END IF;
END $$;

-- Enable RLS on admin_services
ALTER TABLE admin_services ENABLE ROW LEVEL SECURITY;

-- Create policies for admin_services
CREATE POLICY "Allow all operations on admin_services"
  ON admin_services
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_services_created_at ON admin_services(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_services_status ON admin_services(status);
CREATE INDEX IF NOT EXISTS idx_admin_services_customer_name ON admin_services(customer_name);

-- Create trigger for updated_at on admin_services
CREATE TRIGGER update_admin_services_updated_at
  BEFORE UPDATE ON admin_services
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();