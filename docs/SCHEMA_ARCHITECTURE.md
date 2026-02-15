# Schema & Architecture Documentation

**Last Updated:** February 15, 2026  
**Status:** Production system using Supabase as single source of truth

---

## System Architecture

```
┌─────────────────────────────────────┐
│  FRONTEND (Customer E-commerce)    │
│  - Reads from Supabase via ISR     │
│  - 5-min cache (homepage)          │
│  - 60-sec cache (product pages)    │
└─────────────────────────────────────┘
                  ↓
         ┌────────────────┐
         │  SUPABASE DB   │
         │  (PostgreSQL)  │
         │  + Storage CDN │
         └────────────────┘
                  ↑
┌─────────────────────────────────────┐
│  ADMIN (Product Management)         │
│  - Writes via API routes            │
│  - Service role key (bypasses RLS) │
│  - Clears frontend cache on save   │
└─────────────────────────────────────┘
```

**Security Model:**
- Public: Read-only (SELECT via RLS)
- Admin: Full CRUD (service role key via API routes)

---

## Database Schema

### `products` Table
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT,
  category TEXT,
  description TEXT,
  images TEXT[],                          -- Array of Supabase Storage URLs
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_products_slug ON products(slug);
```

### `variants` Table
```sql
CREATE TABLE variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  sku TEXT,
  price NUMERIC NOT NULL,
  stock_qty INTEGER NOT NULL,
  product_name TEXT,                     -- Denormalized for CSV exports
  option_values JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_variants_product_id ON variants(product_id);
```

### `website_products` Table (Reference Only)
```sql
CREATE TABLE website_products (
  id TEXT PRIMARY KEY,                   -- Slug from legacy system
  name TEXT NOT NULL,
  slug TEXT,
  category TEXT
);
```

**Purpose:** Provides dropdown options in admin panel for existing product names.

---

## TypeScript Interfaces

```typescript
interface DatabaseProduct {
  id: string;              // UUID
  name: string;
  slug?: string;           // URL-friendly identifier
  category: string;
  description?: string;
  images: string[];        // Supabase Storage URLs
  created_at?: string;
  updated_at?: string;
}

interface DatabaseVariant {
  id: string;              // UUID
  product_id: string;      // FK to products.id
  sku?: string;
  price: number;
  stock_qty: number;
  product_name?: string;   // Denormalized
  option_values: Record<string, string>;
  created_at?: string;
  updated_at?: string;
}
```

---

## Image Storage

**Bucket:** `product-images` (Supabase Storage)

**Naming Convention:**
- Original uploads: `{slug}-{position}-{timestamp}.jpg`
- Edited images: `{slug}-edited-{position}-{timestamp}.jpg`

**Processing:**
- Auto-compression: Max 1920px width, 85% JPEG quality
- Editing: Canvas-based crop/rotate (client-side)
- CDN: Automatic via Supabase global network

**Legacy System Note:**
Prior to Feb 2026, images were stored in `/public/images/` with manual filename mapping (68 placeholder files). System migrated to Supabase Storage with direct uploads.

---

## Row-Level Security (RLS)

### Products Table Policies
```sql
-- Allow public read access
CREATE POLICY "Public products are viewable" ON products
FOR SELECT USING (true);

-- No INSERT/UPDATE/DELETE policies = admin service role key only
```

### Variants Table Policies
```sql
-- Allow public read access
CREATE POLICY "Public variants are viewable" ON variants
FOR SELECT USING (true);
```

**Admin Access:** Uses `SUPABASE_SERVICE_ROLE_KEY` via API routes to bypass RLS.

---

## Data Flow Examples

### Adding a Product (Admin → Database)
1. Admin uploads images → Compressed → Supabase Storage
2. Admin fills form → Validates → Sends to `/api/create-product`
3. API route uses service role key → INSERT into `products`
4. Variants INSERTed into `variants` table with `product_id` FK
5. API returns success → Admin redirects to preview
6. Frontend cache cleared via `/api/revalidate`

### Viewing Products (Customer → Frontend)
1. User visits homepage → Next.js fetches from Supabase
2. Query: `SELECT * FROM products ORDER BY created_at DESC`
3. ISR cache serves result (5-minute freshness)
4. User clicks product → Fetches specific product + variants
5. ISR cache (60-second freshness)

### Editing an Image (Admin → Immediate Sync)
1. Admin clicks "Edit" on image → Canvas editor opens
2. Crop/rotate applied → Exported as new JPEG blob
3. Upload to Supabase Storage with new filename
4. UPDATE `products` SET `images[n]` = new URL
5. Call `/api/revalidate?productId={id}` → Clears specific product cache
6. Frontend shows updated image within seconds

---

## Environment Variables

### Required for Both Apps
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>
```

### Admin Only
```env
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>  # Server-side, never exposed to client
```

### Frontend Only
```env
NEXT_PUBLIC_PAYPAL_CLIENT_ID=<paypal_client_id>
```

---

## API Routes (Admin Backend)

**Mutation Endpoints:**
- `POST /api/create-product` - Creates product + variants
- `POST /api/update-product` - Updates product + variants (with product_name sync)
- `POST /api/create-variant` - Adds variant to existing product
- `POST /api/update-variant` - Updates variant details

**Frontend Endpoints:**
- `POST /api/check-stock` - Validates available quantity (cart-aware)
- `POST /api/revalidate` - Clears ISR cache (homepage, product pages)

**All mutations use service role key to bypass RLS.**

---

## Caching Strategy

| Page Type | Revalidation | Trigger |
|-----------|-------------|---------|
| Homepage | 5 minutes | Manual or on product save |
| Product Detail | 60 seconds | Manual or on product save |
| Preview Page | 5 minutes | Manual or on product save |

**Cache Clearing:**
- Automatic: Admin panel triggers after save/edit
- Manual: Preview page "Clear Cache" button
- Targeted: Accepts `productId` to clear specific product page only

---

## Known Limitations

1. **Type Duplication:** `DatabaseProduct` and `DatabaseVariant` exist in both `admin/types/` and `frontend/src/types/`. Keep manually synced.
2. **Slug Collision:** No uniqueness constraint on `slug` field. Manual validation required.
3. **Image Deletion:** Old images marked for deletion but not auto-removed (manual cleanup needed).

---

## Related Documentation
- **Features & Workflows:** [FEATURES.md](FEATURES.md)
- **Change History:** [CHANGELOG.md](CHANGELOG.md)
- **Security Setup:** [SUPABASE_RLS_SETUP.md](SUPABASE_RLS_SETUP.md)
- **Planned Work:** [TODO.md](TODO.md)

