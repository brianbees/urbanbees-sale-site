# Urban Bees Sale Site

A Next.js monorepo for managing and displaying beekeeping products for sale.

## Project Structure

```
├── admin/          # Product management admin panel (Next.js)
├── frontend/       # Customer-facing sale site (Next.js)
└── docs/          # Documentation
```

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL + Storage)
- **State Management:** Zustand (cart)
- **Deployment:** Vercel
- **Image Processing:** Canvas API (client-side compression)

## Installation

Each app must be installed separately:

```bash
# Install admin panel dependencies
cd admin
npm install

# Install frontend dependencies
cd frontend
npm install
```

## Running Locally

### Admin Panel (port 3001)
```bash
cd admin
npm run dev -- -p 3001
```
Open: http://localhost:3001

### Frontend (port 3000)
```bash
cd frontend
npm run dev
```
Open: http://localhost:3000

## Required Environment Variables

### Admin Panel (`admin/.env.local`)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

### Frontend (`frontend/.env.local`)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Features

### Admin Panel
- Add/edit products with image upload
- Auto-compress images (max 1920px, 85% quality)
- Manage variants (SKU, price, stock)
- API routes for secure mutations

### Frontend
- Product catalog with search and filters
- Sort by name/price
- Category filtering
- Responsive eBay-style UI
- 5-minute cache with on-demand revalidation
- Preview page with deploy button

## Database Structure

**Tables:**
- `products` - Product info and image URLs
- `variants` - Pricing, SKU, stock quantities
- `website_products` - Legacy product mappings

**Storage:**
- `product-images` - Compressed product images

**Security:**
- Row Level Security (RLS) enabled
- Public: Read-only access
- Admin: Full CRUD via service role key

## Deployment

Both apps auto-deploy from the `main` branch via GitHub → Vercel integration.

**Live URLs:**
- Admin: https://urbanbees-product-admin.vercel.app
- Frontend: https://frontend-six-kappa-30.vercel.app

## Documentation

See `/docs` folder for:
- `TODO.md` - Feature requests and roadmap
- `PROJECT_AUDIT_2026-02-01.md` - Code audit
- `DEPLOYMENT_REMINDER.md` - Deployment notes
- `SCHEMA_ARCHITECTURE.md` - Database schema

## Development Notes

- Admin uses API routes to bypass RLS restrictions
- Frontend queries Supabase directly (public read-only)
- Deploy button clears frontend cache via revalidation API
- Search uses whole-word matching (regex with word boundaries)
