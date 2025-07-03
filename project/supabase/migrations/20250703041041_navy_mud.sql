/*
  # Add Service Date Fields

  1. Updates
    - Add `service_date` field to both `services` and `admin_services` tables
    - Set default to current date for existing records

  2. Security
    - Maintain existing RLS policies
*/

-- Add service_date to services table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'services' AND column_name = 'service_date'
  ) THEN
    ALTER TABLE services ADD COLUMN service_date date DEFAULT CURRENT_DATE;
  END IF;
END $$;

-- Add service_date to admin_services table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admin_services' AND column_name = 'service_date'
  ) THEN
    ALTER TABLE admin_services ADD COLUMN service_date date DEFAULT CURRENT_DATE;
  END IF;
END $$;

-- Create indexes for service_date fields
CREATE INDEX IF NOT EXISTS idx_services_service_date ON services(service_date);
CREATE INDEX IF NOT EXISTS idx_admin_services_service_date ON admin_services(service_date);