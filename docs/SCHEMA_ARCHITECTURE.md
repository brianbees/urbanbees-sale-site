# Schema & Architecture Documentation

**Last Updated:** February 2, 2026  
**Purpose:** Document data models, schema, and integration points

---

## System Architecture (Current)

This project contains **TWO SEPARATE APPLICATIONS** with **UNIFIED DATA SOURCE**:

```
┌─────────────────────────────────────┐
│  FRONTEND (Customer E-commerce)    │
│  - Reads from Supabase database    │
│  - Public read-only access (RLS)   │
│  - Server-side rendering (SSR)     │
│  - 5-minute cache, on-demand clear │
└─────────────────────────────────────┘
                  ↓
         ┌────────────────┐
         │  SUPABASE DB   │
         │  (PostgreSQL)  │
         └────────────────┘
                  ↑
┌─────────────────────────────────────┐
│  ADMIN (Product Management)         │
│  - Writes via API routes            │
│  - Service role key (bypasses RLS) │
│  - Create/update/delete products   │
│  - Image upload to Storage          │
└─────────────────────────────────────┘
```

**✅ UNIFIED:** Both systems use the same Supabase database. Admin writes, frontend reads.  
**🔒 SECURITY:** Row Level Security (RLS) enforces public read-only, admin full CRUD.

---

## Data Models

### Database Model (Supabase)

```typescript
interface DatabaseProduct {
  id: string;              // UUID (e.g., "a1b2c3d4-...")
  name: string;
  slug?: string;           // URL-friendly slug for frontend mapping
  category: string;
  description?: string;
  images: string[];        // Array of URLs from Supabase Storage
  created_at?: string;
  updated_at?: string;
}

interface DatabaseVariant {
  id: string;              // UUID
  product_id: string;      // FK to products.id (UUID)
  sku?: string;
  price: number;
  stock_qty: number;
  option_values: Record<string, string>;
  created_at?: string;
  updated_at?: string;
}

interface WebsiteProduct {
  id: string;              // String slug matching frontend
  name: string;
  slug?: string;
  category?: string;
}
```

**Data Source:** Supabase PostgreSQL database  
**Update Method:** Admin panel forms  
**Used By:** Inventory management, future database-driven features

---

## Database Schema

### Supabase Tables

#### `products` table
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT,                    -- URL-friendly identifier
  category TEXT,
  description TEXT,
  images TEXT[],                 -- Array of image URLs
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_products_slug ON products(slug);
```

#### `variants` table
```sql
CREATE TABLE variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  sku TEXT,
  price NUMERIC NOT NULL,
  stock_qty INTEGER NOT NULL,
  option_values JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_variants_product_id ON variants(product_id);
```

#### `website_products` table (Reference)
```sql
CREATE TABLE website_products (
  id TEXT PRIMARY KEY,           -- Slug from frontend (e.g., "bb-1412-assembled-cedar")
  name TEXT NOT NULL,
  slug TEXT,
  category TEXT
);
```

**Purpose:** Provides a reference list of frontend products for admin dropdown  
**Maintenance:** Must be manually synced with `frontend/src/data/products.ts`

---

## Schema Alignment & Data Flow

### Current State

**Frontend → Customer**
```
products.ts → Next.js pages → Customer sees products
```

**Admin → Database**
```
Admin forms → Supabase → Database (NOT visible to customers)
```

### Key Schema Differences

| Aspect | Frontend | Database |
|--------|----------|----------|
| **Product ID** | String slug | UUID |
| **Images** | `ProductImage[]` objects | `string[]` URLs |
| **Variants** | Nested in Product | Separate table with FK |
| **Updates** | Manual file edit | Admin panel |
| **Source of Truth** | `products.ts` file | Supabase tables |

---

## Integration Points

### How They Connect (Currently)

1. **Product Name Reference:**
   - Admin loads `website_products` table
   - Dropdown shows frontend product names
   - User selects existing product or enters new name

2. **Slug Generation:**
   - Admin generates slug from product name
   - Stored in `products.slug` field
   - Could be used for frontend mapping (not implemented)

### What's Missing

- [ ] No sync from database → frontend
- [ ] No API to fetch database products on frontend
- [ ] No automated export process
- [ ] No slug uniqueness validation

---

## Usage Guidelines

### Adding Products to Frontend

**Method 1: Manual (Current)**
1. Edit `frontend/src/data/products.ts`
2. Add product object with slug ID
3. Add images to `frontend/public/images/`
4. Commit changes

**Method 2: Admin Panel (Future)**
1. Use admin to create product
2. Run export script to generate `products.ts`
3. Sync images from Supabase Storage
4. Rebuild frontend

### Adding Products to Database

1. Open admin panel: http://localhost:3001
2. Click "Add Product"
3. Select from website products or enter new name
4. Upload images (stored in Supabase Storage bucket `product-images`)
5. Save (creates record with UUID)
6. Add variants with pricing/inventory

### Maintaining Data Consistency

**Option A: Frontend-Only (Current)**
- Keep using static `products.ts`
- Ignore admin database
- Simple, no sync needed

**Option B: Database-Driven (Future)**
- Migrate frontend to read from Supabase
- Remove static data file
- Single source of truth
- Requires Supabase client on frontend

**Option C: Hybrid with Sync**
- Admin writes to database
- Export script generates `products.ts`
- Manual sync step before deployment
- Complex but flexible

---

## Known Issues & Limitations

### ⚠️ Current Limitations

1. **No Automatic Sync**
   - Database products won't appear on frontend without manual export
   - Frontend products won't appear in admin unless added to `website_products`

2. **Duplicate Data**
   - Same product can exist in both systems with different IDs
   - No validation to prevent duplicates

3. **Type Inconsistencies**
   - Frontend: `images: ProductImage[]`
   - Database: `images: string[]`
   - If systems were merged, would need transformation layer

4. **Slug Collision Risk**
   - Manual slug generation could create duplicates
   - No uniqueness constraint enforced

### 🔧 Fixed Issues

- ✅ UUID vs string ID mismatch in variants (now uses UUIDs correctly)
- ✅ Duplicate file input fields (removed)
- ✅ TypeScript `any[]` types (now properly typed)
- ✅ Missing slug field (now stored in database)
- ✅ Inconsistent dropdown source (now clear which table is used)

---

## Future Recommendations

### Short Term
1. Add slug uniqueness validation in admin
2. Create `website_products` sync script from `products.ts`
3. Add database schema migration files
4. Add error handling for FK violations

### Long Term
1. Decide on architectural direction (static vs database-driven)
2. If database-driven: Migrate frontend to Supabase
3. If static: Remove admin or convert to data generator
4. Add image sync between Supabase Storage and `public/images/`
5. Implement proper TypeScript SDK for database types

---

## Type Safety Checklist

- [x] Database types defined in `admin/types/database.ts`
- [x] Admin forms use typed state variables
- [x] Supabase queries return typed data
- [x] Frontend Product types documented
- [ ] Shared types package (if systems merge)
- [ ] Runtime validation for database inserts
- [ ] Zod schemas for form validation

---

## Migration Path (If Unifying Systems)

### Step 1: Add API Layer
```typescript
// frontend/app/api/products/route.ts
import { supabase } from '@/lib/supabase';

export async function GET() {
  const { data } = await supabase.from('products').select('*');
  return Response.json(data);
}
```

### Step 2: Transform Database → Frontend Format
```typescript
function transformDbProduct(dbProduct: DatabaseProduct): Product {
  return {
    id: dbProduct.slug || dbProduct.id,
    name: dbProduct.name,
    slug: dbProduct.slug || dbProduct.id,
    category: dbProduct.category as ProductCategory,
    images: dbProduct.images.map(src => ({ src, alt: dbProduct.name })),
    // ... transform other fields
  };
}
```

### Step 3: Update Frontend to Fetch
```typescript
// frontend/app/page.tsx
async function getProducts() {
  const res = await fetch('/api/products');
  return res.json();
}
```

### Step 4: Remove Static Data
- Delete `frontend/src/data/products.ts`
- Update all imports
- Rebuild

---

## Contact & Support

For questions about:
- **Frontend data:** Check `frontend/src/data/products.ts`
- **Database schema:** See Supabase dashboard
- **Admin forms:** Review `admin/app/add-*` pages
- **This document:** Located at `docs/SCHEMA_ARCHITECTURE.md`
