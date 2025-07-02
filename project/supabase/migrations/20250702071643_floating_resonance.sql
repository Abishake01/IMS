/*
  # Create Services Table (Fixed)

  1. New Tables
    - `services`
      - `id` (uuid, primary key)
      - `model_name` (text) - Mobile model name
      - `problem` (text) - Problem description
      - `customer_name` (text) - Customer name
      - `phone_number` (text) - Customer phone
      - `amount` (decimal) - Service amount
      - `comments` (text) - Additional comments
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `services` table
    - Add policies for authenticated and anonymous users

  3. Performance
    - Add indexes for common queries
    - Add trigger for updated_at column
*/

-- Create services table if it doesn't exist
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_name text NOT NULL,
  problem text NOT NULL,
  customer_name text NOT NULL,
  phone_number text NOT NULL,
  amount decimal(10,2) NOT NULL DEFAULT 0.00,
  comments text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists and recreate it
DROP POLICY IF EXISTS "Allow all operations on services" ON services;

-- Create policy for authenticated and anonymous users
CREATE POLICY "Allow all operations on services"
  ON services
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_services_created_at ON services(created_at);
CREATE INDEX IF NOT EXISTS idx_services_customer_name ON services(customer_name);

-- Create trigger for updated_at (drop first if exists)
DROP TRIGGER IF EXISTS update_services_updated_at ON services;

CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();