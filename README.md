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

## Deployment

**Admin Panel:** https://urbanbees-product-admin.vercel.app
**Frontend:** https://frontend-six-kappa-30.vercel.app

Both apps auto-deploy from the `main` branch via GitHub → Vercel integration.

## Admin Panel Features (v2.4.0)

- Add/edit products with image upload
- Image compression: Auto-compress to max 1920px @ 85% JPEG quality
- Gallery-only image upload (no forced camera)
- Image naming: `product-slug-1-timestamp.jpg` format
- Edit workflow: Edit → Save → Redirects to preview page
- Database: Supabase PostgreSQL + Storage

## Frontend Features

- Product catalog with search and filters
- Sort by name/price with eBay-style dropdowns
- Category filtering
- Whole-word search matching
- Responsive mobile-first design
- 5-minute cache with on-demand revalidation
- Preview page with one-click deploy button
- Shopping cart with Zustand state management

## Database

**Supabase Project:** pdovgefwzxfawuyngrke

Tables:
- `products` - Product information and image arrays
- `variants` - Product variants with pricing and stock

Storage:
- `product-images` - Compressed product images

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

## Development

Each app can be run independently:

```bash
# Admin panel
cd admin
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

## Documentation

See `/docs` folder for:
- `TODO.md` - Feature requests and completed updates
- `PROJECT_AUDIT_2026-02-01.md` - Code audit and improvement plan
- `SCHEMA_ARCHITECTURE.md` - Database schema details
