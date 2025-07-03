/*
  # Fix Foreign Key Constraints for Inventory Deletion

  1. Database Changes
    - Update foreign key constraint in sale_items to allow CASCADE deletion
    - This will allow inventory items to be deleted even if they have sales records
    - Add proper constraint handling for data integrity

  2. Security
    - Maintain data integrity while allowing necessary deletions
    - Ensure proper cleanup of related records
*/

-- Drop the existing foreign key constraint
ALTER TABLE sale_items DROP CONSTRAINT IF EXISTS sale_items_inventory_item_id_fkey;

-- Add the foreign key constraint with CASCADE delete
-- This means when an inventory item is deleted, related sale_items will also be deleted
ALTER TABLE sale_items 
ADD CONSTRAINT sale_items_inventory_item_id_fkey 
FOREIGN KEY (inventory_item_id) 
REFERENCES inventory_items(id) 
ON DELETE CASCADE;

-- Also update stock_movements table constraint
ALTER TABLE stock_movements DROP CONSTRAINT IF EXISTS stock_movements_inventory_item_id_fkey;

ALTER TABLE stock_movements 
ADD CONSTRAINT stock_movements_inventory_item_id_fkey 
FOREIGN KEY (inventory_item_id) 
REFERENCES inventory_items(id) 
ON DELETE CASCADE;