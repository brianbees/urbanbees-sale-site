# Urban Bees Product Management System - Full Project Audit

**Date:** February 1, 2026 (Updated: February 13, 2026)  
**Auditor:** Senior Software Engineer  
**Scope:** Complete repository scan (source code, config, scripts, documentation)

---

## ✅ RESOLVED ITEMS (Feb 13, 2026)

**New resolutions since Feb 2:**

12. **✅ Image editing functionality** - Built-in crop and rotate tools in admin panel
13. **✅ Hero image management** - Promote any gallery image to hero position
14. **✅ Image reordering** - Drag-and-drop for gallery images
15. **✅ Frontend sorting** - "Newest First" set as default sort
16. **✅ Add-to-cart reliability** - Loading states, timeouts, error handling, duplicate prevention
17. **✅ URL shortening** - Automatic shortening of long URLs in descriptions (is.gd API)
18. **✅ Link rendering consistency** - URLs and mailto links clickable on all product views
19. **✅ Cache revalidation precision** - Specific product page cache clearing by ID
20. **✅ Image edit persistence** - Edited images save immediately with frontend sync

---

## ✅ RESOLVED ITEMS (Feb 2, 2026)

The following audit findings have been addressed:

1. **✅ Image compression duplication** - Extracted to `admin/lib/image-utils.ts`
2. **✅ API routes for mutations** - Created server-side routes to use service role key securely
3. **✅ Client-side RLS bypass attempt** - Moved all mutations to API routes
4. **✅ Migration scripts archived** - Moved to `docs/archived-scripts/`
5. **✅ Frontend now reads from database** - Supabase integration complete
6. **✅ Search & filter system** - eBay-style dropdowns with whole-word matching
7. **✅ Deploy mechanism** - One-click cache revalidation on preview page
8. **✅ Cart drawer removed** - Replaced with dedicated `/cart` page for better UX
9. **✅ Stock management** - Real-time validation with cart quantity awareness
10. **✅ Header navigation** - Global cart access with item count badge
11. **✅ eBay-style layout** - Horizontal product cards (image left, details right)

**Remaining items below are still relevant for future optimization.**

---

## Summary (High-Level Findings)

1. **Exact duplicate code**: `compressImage()` function duplicated verbatim in `add-product/page.tsx` and `edit-product/page.tsx` (94 lines total, 47 lines each).
2. **Near-duplicate Supabase client setup**: Identical logic with minor style differences between `admin/lib/supabase.ts` and `frontend/src/lib/supabase.ts`.
3. **Redundant PostCSS configs**: Frontend has both `postcss.config.js` and `postcss.config.mjs` with identical content.
4. **Database type definitions duplicated**: `DatabaseProduct` and `DatabaseVariant` interfaces exist in both apps with slight structural differences.
5. **Dead/unused file**: `admin/app/add-variant/page.tsx` exists but is superseded by combined form in `add-product/page.tsx` (variant fields now inline).
6. **Large static product data file**: `frontend/src/data/products.ts` (823 lines) is now redundant since the system uses Supabase as source of truth, yet still imported and used.
7. **Unused scripts**: `frontend/scripts/import-products.js` and `scripts/copy-product-images.ps1` appear to be one-time migration scripts that can be archived.
8. **Inconsistent image handling**: Frontend still references `/images/placeholder.jpg` in `products.ts` but the system now stores images in Supabase Storage.
9. **Missing image optimization in Next.js config**: Admin panel's `next.config.ts` has no `remotePatterns` for Supabase images despite using them.
10. **Documentation debt**: `docs/IMAGES_READY.md` describes a workflow based on local `/public/images/` files, now obsolete.

---

## Duplication & Redundancy

### 1. Exact Code Duplication

**`compressImage()` function:**
- **Location 1**: `admin/app/add-product/page.tsx` (lines 10-48)
- **Location 2**: `admin/app/edit-product/page.tsx` (lines 8-46)
- **Impact**: 47 lines × 2 = 94 lines of identical image compression logic
- **Evidence**: Both use canvas-based resizing (max 1920px), 85% JPEG quality, identical promise-based async implementation
- **Fix**: Extract to shared utility file `admin/lib/image-utils.ts`

```typescript
// Duplicate code found in both files:
async function compressImage(file: File): Promise<File> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxWidth = 1920;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          0.85
        );
      };
    };
  });
}
```

### 2. Near-Duplicate Database Types

**`DatabaseProduct` interface:**
- **admin/types/database.ts**: Includes `slug?` field and `WebsiteProduct` interface
- **frontend/src/types/database.ts**: No `slug` field, lacks `WebsiteProduct`
- **Impact**: Maintenance burden—changes require updates in two places
- **Evidence**:
  ```typescript
  // admin/types/database.ts
  export interface DatabaseProduct {
    id: string;
    name: string;
    slug?: string;  // ← Extra field
    category: string;
    description?: string;
    images: string[];
    created_at?: string;
    updated_at?: string;
  }
  
  export interface WebsiteProduct {  // ← Extra interface
    id: string;
    name: string;
    slug?: string;
    category?: string;
  }
  
  // frontend/src/types/database.ts
  export interface DatabaseProduct {
    id: string;
    name: string;
    // slug missing
    category: string;
    description?: string;
    images: string[];
    created_at?: string;
    updated_at?: string;
  }
  // WebsiteProduct missing
  ```
- **Fix**: Create shared types package or duplicate-but-document strategy

### 3. Supabase Client Setup

**Duplicate initialization:**
- **admin/lib/supabase.ts**: Direct env access with `!` assertion
- **frontend/src/lib/supabase.ts**: Fallback to empty strings
- **Impact**: Minor—different error handling philosophies but functionally identical
- **Evidence**:
  ```typescript
  // admin/lib/supabase.ts
  export const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  // frontend/src/lib/supabase.ts
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  export const supabase = createClient(supabaseUrl, supabaseAnonKey);
  ```
- **Risk**: Low, but inconsistent error behavior

### 4. PostCSS Configuration

**Duplicate config files:**
- `frontend/postcss.config.js` (CommonJS)
- `frontend/postcss.config.mjs` (ESM)
- **Impact**: Only `.mjs` is used by Next.js; `.js` is dead weight
- **Evidence**: Both contain identical Tailwind plugin setup
  ```javascript
  // postcss.config.js (CommonJS)
  module.exports = {
    plugins: {
      '@tailwindcss/postcss': {},
    },
  };
  
  // postcss.config.mjs (ESM)
  const config = {
    plugins: {
      "@tailwindcss/postcss": {},
    },
  };
  export default config;
  ```
- **Fix**: Delete `postcss.config.js`

---

## Structural Improvements

### 1. Unused/Dead Files

#### `admin/app/add-variant/page.tsx` (117 lines)
- **Status**: Standalone variant addition page
- **Context**: Variant fields now embedded in `add-product/page.tsx` (sku, price, stockQty inputs combined)
- **Evidence**: Admin homepage still links to `/add-variant` at line 33-43, but workflow no longer uses it
- **Risk**: User confusion—link exists but feature is redundant
- **Fix**: 
  1. Delete `admin/app/add-variant/page.tsx`
  2. Remove link from `admin/app/page.tsx` lines 33-43

#### `frontend/scripts/import-products.js` (114 lines)
- **Status**: Node.js script for one-time migration from `products.ts` to Supabase
- **Evidence**: References regex parsing of `products.ts` export, now obsolete workflow
- **Fix**: Archive to `docs/archived-scripts/import-products.js` or delete

#### `scripts/copy-product-images.ps1`
- **Status**: PowerShell script for copying images from old project structure
- **Evidence**: Hardcoded paths like `F:\Files_Folders\01 - Urban Bees website\sale\public\images`
- **Fix**: Archive to `docs/archived-scripts/` or delete

#### `consolidate.ps1` (224 lines)
- **Status**: Migration script for consolidating two source folders
- **Evidence**: One-time setup script referencing old paths:
  ```powershell
  $sourceFrontend = "F:\Files_Folders\01 - Urban Bees website\park_sales_website\urbanbees-website"
  $sourceAdmin = "F:\Files_Folders\01 - Urban Bees website\rpsale\urbanbees-product-admin"
  ```
- **Fix**: Move to `docs/archived-scripts/consolidate.ps1`

### 2. Large Static Data File

#### `frontend/src/data/products.ts` (823 lines)
- **Current Usage**:
  - `frontend/src/app/page.tsx` line 4: `import products from '@/data/products'`
  - `frontend/src/app/api/import-existing/route.ts` line 4: Used for one-time import
- **Context**: System now fetches products from Supabase dynamically (see `preview/page.tsx`)
- **Issue**: Frontend homepage still uses static data, while preview/detail pages use database
- **Evidence**: Two sources of truth—homepage shows old static products, dynamic pages show Supabase products
- **Fix**: Update `page.tsx` to fetch from Supabase like `preview/page.tsx` does

### 3. Inconsistent Configuration

#### Missing image optimization in admin
- **admin/next.config.ts**: Empty config, no `remotePatterns` for Supabase Storage
- **frontend/next.config.ts**: Has correct Supabase `remotePatterns`
- **Impact**: Admin panel can't display Supabase images in Next.js `<Image>` components optimally
- **Fix**: Copy `remotePatterns` config from frontend:
  ```typescript
  // Add to admin/next.config.ts
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pdovgefwzxfawuyngrke.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  ```

---

## Quick Wins (Low-Risk Cleanups)

**Estimated time: 20 minutes total**

1. ✅ **Delete `frontend/postcss.config.js`** - Only `.mjs` is active (2 min)
2. ✅ **Delete `admin/app/add-variant/page.tsx`** - Functionality merged into `add-product` (2 min)
3. ✅ **Remove "Add Variant" link** from `admin/app/page.tsx` lines 33-43 (2 min)
4. ✅ **Archive migration scripts** (5 min):
   - Move `consolidate.ps1` → `docs/archived-scripts/consolidate.ps1`
   - Move `frontend/scripts/import-products.js` → `docs/archived-scripts/import-products.js`
   - Move `scripts/copy-product-images.ps1` → `docs/archived-scripts/copy-product-images.ps1`
5. ✅ **Update `docs/IMAGES_READY.md`** - Mark obsolete or rewrite for Supabase Storage workflow (5 min)
6. ✅ **Add Supabase remote patterns to `admin/next.config.ts`** - Copy from frontend config (4 min)

---

## Risky Changes (Need Human Judgement)

### 1. Extract `compressImage()` to Shared Utility

**Action**: Create `admin/lib/image-utils.ts`:
```typescript
/**
 * Compresses an image file before upload to reduce storage costs and improve performance.
 * - Resizes to max 1920px width (maintains aspect ratio)
 * - Converts to JPEG at 85% quality
 * - Works entirely in browser (Canvas API)
 */
export async function compressImage(file: File): Promise<File> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxWidth = 1920;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          0.85
        );
      };
    };
  });
}
```

Then update both pages to `import { compressImage } from '@/lib/image-utils'`.

**Risk**: Low, but requires testing both add and edit flows to ensure no breakage.

**Priority**: Medium—saves 47 lines of duplication and centralizes logic for future changes (e.g., adjust compression quality globally).

---

### 2. Unify Database Type Definitions

**Options**:
- **A)** Create `shared-types` package at root for both apps to import
- **B)** Accept duplication but document which is canonical
- **C)** Make frontend copy from admin via build step

**Risk**: Medium—structural change affects imports across multiple files.

**Decision Point**: Do frontend and admin actually need identical types, or should they evolve independently?

**Recommendation**: Option B (accept duplication) since apps are deployed separately. Add comment header:
```typescript
// NOTE: Duplicated in admin/types/database.ts - keep in sync manually
// Last synced: 2026-02-01
```

---

### 3. Migrate Frontend Homepage to Supabase

**Problem**: `frontend/src/app/page.tsx` uses static `products.ts` (823 lines), while product detail pages fetch from Supabase.

**Action**: Refactor homepage to:
```typescript
// Change from:
import products from '@/data/products';

export default function Home() {
  return (
    <div>
      {products.map(product => <ProductCard product={product} />)}
    </div>
  );
}

// To:
import { supabase } from '@/lib/supabase';

export default async function Home() {
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('name');

  return (
    <div>
      {(products || []).map(product => <ProductCard product={product} />)}
    </div>
  );
}
```

**Risk**: HIGH
- 823 lines of hardcoded products may contain data not yet in Supabase
- Static site generation (SSG) would break—need ISR or dynamic rendering
- Potential for "products disappear" bug if Supabase is empty

**Decision Point**: Is `products.ts` still the source of truth, or has everything migrated to Supabase?

**Recommendation**: 
1. Verify all products exist in Supabase via preview page
2. If complete, update homepage to `async function Home()` with Supabase fetch
3. Otherwise, keep static for now and add migration task to `docs/TODO.md`

---

### 4. Delete or Archive `products.ts`

**Scenario A**: If migration complete
- Delete `frontend/src/data/products.ts`
- Update `import-existing/route.ts` (will break, but API becomes unused)

**Scenario B**: If products.ts still needed
- Keep file but add big header comment:
```typescript
// ⚠️ WARNING: This file is legacy static data. 
// The live site uses Supabase. Only modify for historical reference.
// Last known good state: 2026-02-01
// 
// This file should NOT be used for new features. Query Supabase instead.
```

**Risk**: VERY HIGH—deleting could break rollback capability.

**Recommendation**: Archive to `frontend/src/data/products.legacy.ts` and comment out the export. Keep for reference.

---

## Architectural Smells

### 1. Two Sources of Truth for Products
- **Static**: `products.ts` (823 lines)
- **Dynamic**: Supabase database
- **Result**: Homepage shows old data, detail pages show current data
- **Impact**: Confusing—"Why don't I see products I just added?"

### 2. Unused API Endpoint
- **File**: `frontend/src/app/api/import-existing/route.ts` (80 lines)
- **Purpose**: Imports from `products.ts` to Supabase
- **Usage**: Only called from preview page once
- **Status**: Once migration is done, this endpoint is dead weight

### 3. Inconsistent Image Strategy
- **Old**: `/images/placeholder.jpg` references in `products.ts`
- **New**: Supabase Storage URLs in database
- **Gap**: Frontend homepage still shows old images, detail pages show Supabase images

### 4. Manual File Writes in API Route
- **File**: `frontend/src/app/api/deploy-products/route.ts` line 118
- **Code**: `fs.writeFileSync(productsPath, fileContent)`
- **Problem**: Won't work in Vercel production (read-only filesystem)
- **Impact**: Creates false expectation that "deploy" button regenerates static file

### 5. Version Number in UI
- **File**: `admin/app/edit-product/page.tsx` line 260
- **Code**: `<span>v2.4.0</span>`
- **Problem**: No versioning system, just manual string updates
- **Better**: Use `package.json` version or build timestamp

---

## Suggested Next Actions (Prioritized)

### Phase 1: Immediate Cleanups (15 min)
1. Delete `frontend/postcss.config.js`
2. Delete `admin/app/add-variant/page.tsx`
3. Remove "Add Variant" card from `admin/app/page.tsx`
4. Add Supabase remote patterns to `admin/next.config.ts`

### Phase 2: Code Deduplication (30 min)
1. Extract `compressImage()` to `admin/lib/image-utils.ts`
2. Update imports in `add-product/page.tsx` and `edit-product/page.tsx`
3. Test image upload on both forms

### Phase 3: Documentation Update (20 min)
1. Update `docs/IMAGES_READY.md` to reflect Supabase Storage workflow
2. Archive migration scripts to `docs/archived-scripts/`
3. Add note to `README.md` explaining static vs. dynamic product sources

### Phase 4: Strategic Decision Required (Human Input)
**Question**: Should the frontend homepage fetch products from Supabase (dynamic) or keep using `products.ts` (static)?

**If Supabase is canonical:**
- Update `frontend/src/app/page.tsx` to async fetch
- Archive `products.ts` to `.legacy.ts`
- Remove `/api/import-existing` and `/api/deploy-products`

**If products.ts is still needed:**
- Add clear documentation about dual-source architecture
- Keep as-is but mark static data with warning comments

### Phase 5: Future-Proofing (Post-Decision)
1. Standardize image handling (all Supabase or all local)
2. Remove hardcoded version numbers, use `package.json` version or build timestamp
3. Consider monorepo structure with shared types package

---

## Maintenance Cost Factors

1. **Duplication = 2× Effort**: Any change to image compression requires editing two files.
2. **Type Drift Risk**: Database types in admin vs. frontend may diverge silently.
3. **Dead Code Cruft**: Unused files create confusion for new developers ("Should I use add-variant or add-product?").
4. **Unclear Data Flow**: Static products.ts vs. Supabase makes it hard to answer "where does this data come from?"
5. **FS Writes in API**: `deploy-products/route.ts` won't work in production—creates false expectation.

---

## File Inventory Summary

### Active Files (Keep)
- ✅ `admin/app/{add-product,edit-product,page}.tsx` - Core admin features
- ✅ `admin/lib/supabase.ts` - Database connection
- ✅ `admin/types/database.ts` - Type definitions
- ✅ `frontend/src/app/{page,layout,preview,product/[id]}.tsx` - Frontend pages
- ✅ `frontend/src/lib/supabase.ts` - Database connection
- ✅ `frontend/src/components/*.tsx` - UI components
- ✅ `frontend/postcss.config.mjs` - Build config (active)
- ✅ `docs/{TODO,SCHEMA_ARCHITECTURE}.md` - Current docs

### Delete (Redundant)
- ❌ `frontend/postcss.config.js` - Duplicate of `.mjs`
- ❌ `admin/app/add-variant/page.tsx` - Superseded by combined form

### Archive (Historical)
- 📦 `consolidate.ps1` → `docs/archived-scripts/`
- 📦 `frontend/scripts/import-products.js` → `docs/archived-scripts/`
- 📦 `scripts/copy-product-images.ps1` → `docs/archived-scripts/`

### Needs Decision (Strategic)
- ⚠️ `frontend/src/data/products.ts` - Static data vs. Supabase source of truth
- ⚠️ `frontend/src/app/api/import-existing/route.ts` - One-time migration endpoint
- ⚠️ `frontend/src/app/api/deploy-products/route.ts` - Manual file write (won't work in prod)
- ⚠️ `docs/IMAGES_READY.md` - Describes obsolete workflow

---

## Conclusion

The codebase is **functional and production-ready** but carries **technical debt** from evolution:
- Migration from static to dynamic data is incomplete
- Duplicate code increases maintenance burden
- Unused files create confusion

**Recommended immediate action**: Execute Phase 1 cleanups (15 min) to remove clear redundancies.

**Critical decision needed**: Clarify whether `products.ts` or Supabase is the canonical source of truth, then align all data flows accordingly.

---

**End of Audit**
