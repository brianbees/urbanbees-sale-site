# Add product_name to Variants Table

This migration adds a `product_name` column to the `variants` table for easier CSV exports.

## Step 1: Add Column in Supabase

Go to your Supabase SQL Editor and run:

```sql
ALTER TABLE variants ADD COLUMN IF NOT EXISTS product_name TEXT;
```

## Step 2: Populate Existing Data

Run the migration script:

```bash
node scripts/add-product-name-to-variants.mjs
```

This will populate the `product_name` field for all existing variants.

## Step 3: Commit and Deploy

The code changes are already in place:
- TypeScript types updated
- API routes updated to set `product_name` automatically for new/updated variants
- When product name changes, all its variants are updated too

## What This Achieves

✅ CSV exports from variants table now include product names  
✅ No joins needed for simple reports  
✅ Zero impact on frontend or existing functionality  
✅ Future variants automatically get product_name set  

## Files Changed

- `frontend/src/types/database.ts` - Added product_name field
- `admin/types/database.ts` - Added product_name field
- `admin/app/api/create-product/route.ts` - Sets product_name when creating variants
- `admin/app/api/create-variant/route.ts` - Fetches and sets product_name
- `admin/app/api/update-product/route.ts` - Updates product_name in variants when product name changes
