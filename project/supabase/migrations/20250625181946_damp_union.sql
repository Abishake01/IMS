/*
  # Add anonymous user policies for inventory_items table

  1. Security Changes
    - Add RLS policies to allow anonymous users to perform CRUD operations on inventory_items
    - This enables the application to work with the anonymous Supabase key
    - Policies allow SELECT, INSERT, UPDATE, and DELETE for anon role

  Note: In a production environment, you may want to restrict these policies further
  based on your specific security requirements.
*/

-- Add policy to allow anonymous users to read inventory items
CREATE POLICY "Allow anonymous users to read inventory"
  ON inventory_items
  FOR SELECT
  TO anon
  USING (true);

-- Add policy to allow anonymous users to insert inventory items
CREATE POLICY "Allow anonymous users to insert inventory"
  ON inventory_items
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Add policy to allow anonymous users to update inventory items
CREATE POLICY "Allow anonymous users to update inventory"
  ON inventory_items
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Add policy to allow anonymous users to delete inventory items
CREATE POLICY "Allow anonymous users to delete inventory"
  ON inventory_items
  FOR DELETE
  TO anon
  USING (true);