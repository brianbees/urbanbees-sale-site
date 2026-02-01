# Urban Bees - Product Admin Panel

Backend management tool for Urban Bees product catalog.

---

## Overview

This Next.js application provides a web interface for managing products and variants in a Supabase database. It's designed to work alongside the customer-facing frontend but operates independently with its own database.

**Tech Stack:**
- Next.js 16.1.5 (App Router + Turbopack)
- React 19
- TypeScript (with strict type checking)
- Tailwind CSS 4
- Supabase (PostgreSQL + Storage)

---

## Getting Started

### Prerequisites
- Node.js 20+
- Supabase account with project created
- Database credentials

### Installation

```bash
npm install
```

### Environment Setup

Create `.env.local` in this directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Development

```bash
npm run dev -- -p 3001
```

Open [http://localhost:3001](http://localhost:3001) to access the admin panel.

---

## Database Schema

### Required Tables

#### `products`
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT,
  description TEXT,
  images TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `variants`
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
```

#### `website_products` (Reference)
```sql
CREATE TABLE website_products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT,
  category TEXT
);
```

### Storage Bucket

Create a public storage bucket named `product-images` for image uploads.

---

## Type Safety

All database operations use TypeScript types defined in `types/database.ts`:

```typescript
import type { DatabaseProduct, DatabaseVariant } from '@/types/database';
```

This ensures:
- Correct UUID usage for foreign keys
- Proper data structure validation
- Compile-time error catching

---

## Features

### 1. Add Product (`/add-product`)
- Select from existing website products or enter manually
- Upload multiple product images
- Store with auto-generated UUID
- Images uploaded to Supabase Storage
- Category and description fields

### 2. Add Variant (`/add-variant`)
- Select product from database (UUID-based)
- Set price and stock quantity
- Optional SKU field

---

## Architecture Notes

**⚠️ Important:** This admin panel writes to a Supabase database that is **separate** from the frontend's static product catalog. 

The frontend uses static TypeScript data (`frontend/src/data/products.ts`), while this admin panel manages a dynamic database. They are intentionally separate systems.

See `../docs/SCHEMA_ARCHITECTURE.md` for complete details on data flow and integration points.

---

## Project Structure

```
admin/
├── app/
│   ├── page.tsx              # Home with navigation cards
│   ├── layout.tsx            # Root layout
│   ├── add-product/
│   │   └── page.tsx          # Product creation form
│   └── add-variant/
│       └── page.tsx          # Variant creation form
├── lib/
│   └── supabase.ts           # Supabase client
├── types/
│   └── database.ts           # Database schema types
├── .env.local                # Environment variables (not committed)
└── README.md                 # This file
```

---

## Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Lint code
npm run lint
```

---

## Deployment

### Vercel (Recommended)

1. Push to GitHub repository
2. Import project to Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

### Other Platforms

Ensure environment variables are set in your hosting platform's dashboard.

---

## Common Issues

### "Invalid UUID" Errors
- Ensure you're selecting products from the dropdown (not entering UUIDs manually)
- Check that `products` table exists with UUID primary key

### "Invalid JSON" Errors  
- Option values must be valid JSON objects
- Examples: `{}`, `{"size":"Large"}`, `{"color":"Red","size":"M"}`

### Images Not Uploading
- Verify `product-images` storage bucket exists in Supabase
- Check bucket is set to public access
- Ensure file size is reasonable (< 5MB per image)

---

## Security

- Never commit `.env.local` to version control
- Keep Supabase credentials secure
- Use Supabase Row Level Security (RLS) policies for production
- Consider authentication for admin access in production

---

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

For schema details and data flow, see:
- `../docs/SCHEMA_ARCHITECTURE.md` - Complete architecture guide
- `../docs/AUDIT_SUMMARY.md` - Recent schema fixes and validation

---

**Version:** 1.1  
**Last Updated:** January 30, 2026
