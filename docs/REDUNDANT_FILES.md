# Redundant Files and Folders

This document lists files and folders in the Urban Bees Product Management System that are safe to delete or archive as of February 4, 2026. These items are no longer used in deployment, navigation, or active workflows.

## Delete (Redundant)
- `frontend/postcss.config.js`
  - Path: frontend/postcss.config.js
  - Reason: Duplicate, use postcss.config.mjs

- `app/` directory
  - Path: app/
  - Reason: Not used in deployment/navigation

- `app/page.tsx`
  - Path: app/page.tsx
  - Reason: Superseded, not used

## Archive (Move to docs/archived-scripts/)
- `frontend/scripts/import-products.js`
  - Path: frontend/scripts/import-products.js
  - Reason: One-time migration script

- `scripts/copy-product-images.ps1`
  - Path: scripts/copy-product-images.ps1
  - Reason: Migration script

- `consolidate.ps1`
  - Path: docs/archived-scripts/consolidate.ps1
  - Reason: Migration script

## Archive (Rename)
- `products.ts` (if Supabase is canonical)
  - Path: frontend/src/data/products.ts
  - Action: Rename to products.legacy.ts
  - Reason: Static data, now replaced by Supabase

## Delete (Dead API Endpoints)
- `import-existing/route.ts`
  - Path: frontend/src/app/api/import-existing/route.ts
  - Reason: Dead endpoint after migration

- `deploy-products/route.ts`
  - Path: frontend/src/app/api/deploy-products/route.ts
  - Reason: Manual file writes, not used in Vercel

## Delete (Placeholder Images)
- Any placeholder images in frontend/public/images/
  - Path: frontend/public/images/
  - Reason: If Supabase Storage is now used for product images

---

**Note:** Review before deleting or archiving to ensure no active references remain. For historical or rollback purposes, consider archiving rather than deleting.
