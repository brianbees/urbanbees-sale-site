-- Add product_name column to variants table and populate it
-- Run this in Supabase SQL Editor

-- Step 1: Add the column
ALTER TABLE variants ADD COLUMN IF NOT EXISTS product_name TEXT;

-- Step 2: Populate the column with product names from products table
UPDATE variants 
SET product_name = products.name 
FROM products 
WHERE variants.product_id = products.id;

-- Step 3: Verify the results (optional - shows count of updated rows)
SELECT 
  COUNT(*) as total_variants,
  COUNT(product_name) as variants_with_names,
  COUNT(*) - COUNT(product_name) as variants_missing_names
FROM variants;
