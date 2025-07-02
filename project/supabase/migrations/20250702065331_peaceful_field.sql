/*
  # Create Services Table

  1. New Tables
    - `services`
      - `id` (uuid, primary key)
      - `model_name` (text) - Mobile model name
      - `problem` (text) - Description of the problem
      - `customer_name` (text) - Customer name
      - `phone_number` (text) - Customer phone number
      - `amount` (decimal) - Service charge amount
      - `comments` (text) - Additional comments
      - `status` (text) - pending, in_progress, completed
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `services` table
    - Add policies for authenticated and anonymous users
*/

CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_name text NOT NULL,
  problem text NOT NULL,
  customer_name text NOT NULL,
  phone_number text NOT NULL,
  amount decimal(10,2) NOT NULL DEFAULT 0.00,
  comments text DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated and anonymous users
CREATE POLICY "Allow all operations on services"
  ON services
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_services_created_at ON services(created_at);
CREATE INDEX IF NOT EXISTS idx_services_status ON services(status);
CREATE INDEX IF NOT EXISTS idx_services_customer_name ON services(customer_name);

-- Create trigger for updated_at
CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();