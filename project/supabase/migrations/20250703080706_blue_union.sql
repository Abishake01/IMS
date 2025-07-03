/*
  # Add Warranty Fields to Inventory

  1. Database Changes
    - Add `has_warranty` boolean field to inventory_items
    - Add `warranty_duration` integer field (in days)
    - Add `warranty_unit` text field (days/months/years)

  2. Security
    - Maintain existing RLS policies
*/

-- Add warranty fields to inventory_items table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'inventory_items' AND column_name = 'has_warranty'
  ) THEN
    ALTER TABLE inventory_items ADD COLUMN has_warranty boolean DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'inventory_items' AND column_name = 'warranty_duration'
  ) THEN
    ALTER TABLE inventory_items ADD COLUMN warranty_duration integer DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'inventory_items' AND column_name = 'warranty_unit'
  ) THEN
    ALTER TABLE inventory_items ADD COLUMN warranty_unit text DEFAULT 'days';
  END IF;
END $$;

-- Update existing products with sample warranty data
UPDATE inventory_items 
SET 
  has_warranty = true,
  warranty_duration = 12,
  warranty_unit = 'months'
WHERE category = 'phones';

UPDATE inventory_items 
SET 
  has_warranty = true,
  warranty_duration = 6,
  warranty_unit = 'months'
WHERE category = 'accessories';

UPDATE inventory_items 
SET 
  has_warranty = false
WHERE category IN ('cases', 'chargers');