# Urban Bees - Customer Website

Customer-facing e-commerce storefront for Urban Bees beekeeping supplies.

---

## Overview

This Next.js application serves as the public-facing website where customers can browse products, view details, and add items to their cart. It uses **static product data** for fast performance and simple deployment.

**Tech Stack:**
- Next.js 16.1.6 (App Router + Turbopack)
- React 19
- TypeScript (strict mode)
- Tailwind CSS 4
- Zustand (cart state management)

---

## Getting Started

### Prerequisites
- Node.js 20+

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the website.

---

## Data Source

**Products:** Static TypeScript file at `src/data/products.ts`

This file contains all 69 products with:
- Product details (name, category, description)
- Variants (pricing, stock, options)
- Image references
- Features and metadata

**No database required** - all data is bundled at build time for maximum performance.

---

## Features

- **Product Catalog:** Browse 69+ beekeeping products across 13 categories
- **Product Details:** Individual pages with interactive image gallery
- **Shopping Cart:** Persistent cart using Zustand + localStorage
- **Preview Mode:** Test database products at `/preview` before deploying
- **One-Click Deploy:** Export database products to production
- **Image Gallery:** Click thumbnails to view different product images
- **Database Integration:** Supabase for dynamic product management
- **Responsive Design:** Mobile-first design with Tailwind CSS
- **Hybrid Rendering:** Static + database-driven product pages

---

## Preview & Deploy Workflow

### Testing Products (Preview Mode)

1. **Access Preview:** https://frontend-six-kappa-30.vercel.app/preview
2. **Import Existing Products:** Click "📥 Import 69 Products" button (one-time)
3. **View Database Products:** All products from Supabase displayed in real-time
4. **Test Features:**
   - Click products to view detail pages
   - Interactive image gallery (click thumbnails)
   - Delete products (hover over cards)
5. **Deploy When Ready:** Click "🚀 Deploy to Production"

### Deploying to Production

The deploy button:
- Exports all database products to `src/data/products.ts`
- Triggers automatic rebuild
- Main site updates in ~30 seconds
- Products go live at https://frontend-six-kappa-30.vercel.app

---

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Home page (product grid)
│   │   ├── layout.tsx            # Root layout with cart
│   │   ├── preview/
│   │   │   └── page.tsx          # Preview/testing page
│   │   ├── product/[id]/
│   │   │   └── page.tsx          # Product detail pages
│   │   └── api/
│   │       ├── deploy-products/  # Export database to file
│   │       ├── import-existing/  # Import static products
│   │       └── delete-product/   # Delete from database
│   ├── components/
│   │   ├── Cart.tsx              # Shopping cart UI
│   │   ├── ProductCard.tsx       # Product grid item
│   │   └── ProductDisplay.tsx    # Interactive image gallery
│   ├── data/
│   │   └── products.ts           # Product catalog (auto-generated)
│   ├── lib/
│   │   └── supabase.ts           # Supabase client
│   ├── types/
│   │   └── database.ts           # Database type definitions
│   └── store/
│       └── cart.ts               # Cart state management
├── public/
│   └── images/                   # Product images
├── scripts/
│   └── import-products.js        # Manual import script
└── README.md                     # This file
```

---

## Adding Products

To add or modify products, edit `src/data/products.ts`:

```typescript
export const products: Product[] = [
  {
    id: "my-product-id",
    name: "Product Name",
    slug: "product-name",
    category: "Brood Boxes",
    currency: "GBP",
    images: [
      { src: "/images/my-product.jpg", alt: "Product Name" }
    ],
    variants: [
      {
        id: "default",
        price: 50.00,
        stockQty: 10,
        optionValues: {}
      }
    ]
  }
];
```

Then add the product image to `public/images/`.

See `../docs/IMAGE_MAPPING.md` for image filename conventions.

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

```bash
npm run build
```

Push to GitHub and import to Vercel - it will automatically detect Next.js and deploy.

### Static Export (Alternative)

For pure static hosting (Netlify, AWS S3, etc.):

1. Add to `next.config.ts`:
   ```typescript
   output: 'export'
   ```

2. Build:
   ```bash
   npm run build
   ```

3. Deploy the `out/` directory

---

## Architecture Notes

**⚠️ Important:** This website uses static product data that is **separate** from the admin panel's database.

The admin panel (`../admin/`) manages products in Supabase, but those changes do not automatically appear here. This is intentional for simplicity and performance.

See `../docs/SCHEMA_ARCHITECTURE.md` for details on the data architecture and potential integration paths.

---

## Product Catalog

- **Total Products:** 69
- **Categories:** 13 (Brood Boxes, Supers, Nucs & Travel, Floors & Stands, etc.)
- **Images:** 69 product photos in `/public/images/`
- **Variants:** Multiple pricing/options per product where applicable

Product data was cleaned from "regents park stock check.docx" with prices in GBP.

---

## Customization

### Styling
- Tailwind configuration in `tailwind.config.js`
- Global styles in `src/app/globals.css`
- Component-level styling uses Tailwind utility classes

### Cart Behavior
- Cart state managed in `src/store/cart.ts`
- Persists to localStorage automatically
- Modify `useCartStore` to change behavior

### Product Display
- Grid layout in `src/app/page.tsx`
- Card component in `src/components/ProductCard.tsx`
- Detail page template in `src/app/product/[id]/page.tsx`

---

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Zustand](https://github.com/pmndrs/zustand)

For project documentation:
- `../README.md` - Root project overview
- `../docs/FIXES_SUMMARY.txt` - 17 fixes applied
- `../docs/SCHEMA_ARCHITECTURE.md` - Architecture guide

---

**Version:** 1.1  
**Last Updated:** January 30, 2026
