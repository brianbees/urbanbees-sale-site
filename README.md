# Urban Bees Sale Site

A Next.js monorepo for managing and displaying beekeeping products for sale.

## Project Structure

```
├── admin/          # Product management admin panel (Next.js 16.1.5)
├── frontend/       # Customer-facing sale site (Next.js 16.1.6)
└── docs/          # Documentation
```

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

- Product catalog with live database sync
- 60-second page revalidation (new images appear within 1 minute)
- Edit buttons on product detail pages
- Shopping cart with Zustand state management
- Responsive design with Tailwind CSS

## Database

**Supabase Project:** pdovgefwzxfawuyngrke

Tables:
- `products` - Product information and image arrays
- `variants` - Product variants with pricing and stock

Storage:
- `product-images` - Compressed product images

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
