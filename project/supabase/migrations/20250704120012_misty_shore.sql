/*
  # Add image_base64 column to inventory_items table

  1. Changes
    - Add `image_base64` column to `inventory_items` table
    - Column type: TEXT (nullable)
    - Allows storing base64 encoded images as an alternative to image URLs

  2. Notes
    - This column is optional and nullable
    - Applications can use either `image_url` or `image_base64` for product images
    - Base64 storage is useful for offline functionality and embedded images
*/

-- Add image_base64 column to inventory_items table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'inventory_items' AND column_name = 'image_base64'
  ) THEN
    ALTER TABLE inventory_items ADD COLUMN image_base64 TEXT;
  END IF;
END $$;