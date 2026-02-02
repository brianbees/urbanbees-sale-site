# Urban Bees - Customer Website

Customer-facing e-commerce storefront for Urban Bees beekeeping supplies.

---

## Overview

This Next.js application serves as the public-facing website where customers can browse products, view details, and add items to their cart. It uses **Supabase** for real-time product data and stock management.

**Tech Stack:**
- Next.js 16.1.6 (App Router + Turbopack)
- React 19
- TypeScript (strict mode)
- Tailwind CSS 4
- Zustand (cart state management with localStorage persistence)
- Supabase (database and storage)

**Key Features:**
- eBay-style horizontal product cards (image left, details right)
- Dedicated `/cart` page with proper navigation (no drawer)
- Global header with cart icon and item count badge
- Real-time stock validation with cart quantity awareness
- Stock warnings with disabled checkout when issues exist
- 5-minute server-side cache for optimal performance

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

**Products:** Supabase PostgreSQL database with 5-minute server-side cache

The frontend fetches products from:
- **Table:** `products` (name, description, category, images)
- **Table:** `variants` (pricing, stock quantities, SKUs, options)
- **Storage:** Supabase Storage for product images

**Real-time features:**
- Stock validation on every "Add to Cart"
- Cart quantity awareness prevents overselling
- Stock warnings displayed on cart page
- Checkout disabled when stock issues exist

---

## Features

### Product Display
- **eBay-Style Layout:** Horizontal cards with image left (128-160px), details right
- **Vertical List:** Products displayed in list format (not grid)
- **Search & Filter:** Category dropdown, sort by name/price, whole-word search
- **Product Details:** Full-page view with image gallery, variant selectors, stock info

### Shopping Cart
- **Dedicated Cart Page:** `/cart` with proper back button navigation
- **Header Navigation:** Persistent cart icon with item count badge on all pages
- **Cart Features:**
  - Two-column layout (items + order summary)
  - 128px product images
  - Quantity controls with +/- buttons
  - Real-time stock validation
  - Red alert warnings for stock issues
  - "Proceed to Checkout" disabled when stock problems exist
  - Confirmation dialog for "Clear Cart"

### Stock Management
- **Pre-Add Validation:** Checks available stock before adding to cart
- **Cart Quantity Awareness:** Considers items already in cart when validating
- **Smart Alerts:**
  - "Sorry, this item is currently out of stock."
  - "You already have the maximum available quantity (X) in your cart."
  - "Only X available. You already have Y in your cart."
- **Cart Page Warnings:** Red alerts show when items exceed available stock

### Technical
- **Database Integration:** Supabase for dynamic product management
- **Persistent Cart:** Zustand + localStorage (survives page refresh)
- **Server-Side Rendering:** 5-minute cache (revalidate=300)
- **Responsive Design:** Mobile-first with Tailwind CSS
- **Image Optimization:** Next.js Image component with Supabase CDN

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
│   │   ├── page.tsx              # Home page (product list with filters)
│   │   ├── layout.tsx            # Root layout with Header component
│   │   ├── cart/
│   │   │   └── page.tsx          # Dedicated cart page
│   │   ├── preview/
│   │   │   └── page.tsx          # Preview/testing page
│   │   ├── product/[id]/
│   │   │   └── page.tsx          # Product detail pages
│   │   └── api/
│   │       ├── check-stock/      # Real-time stock validation
│   │       ├── deploy-products/  # Export database to file
│   │       ├── import-existing/  # Import static products
│   │       ├── delete-product/   # Delete from database
│   │       └── revalidate/       # Cache invalidation
│   ├── components/
│   │   ├── Header.tsx            # Global nav with cart icon
│   │   ├── ProductCard.tsx       # Horizontal product card (eBay-style)
│   │   ├── ProductDisplay.tsx    # Full product detail view
│   │   └── ProductsGrid.tsx      # List container with filters
│   ├── data/
│   │   └── products.ts           # Product catalog (fallback/static)
│   ├── lib/
│   │   └── supabase.ts           # Supabase client
│   ├── types/
│   │   └── database.ts           # Database type definitions
│   └── store/
│       └── cart.ts               # Cart state (Zustand + localStorage)
├── public/
│   └── images/                   # Product images (legacy/fallback)
└── README.md                     # This file
```

---

## Cart Store API

The cart uses Zustand with localStorage persistence:

```typescript
import { useCartStore } from '@/store/cart';

// In your component:
const { items, addItem, removeItem, updateQuantity, clearCart, getTotalItems, getTotalPrice } = useCartStore();

// Add item
addItem({
  productId: 'abc',
  productName: 'Product Name',
  variantId: 'variant-id',
  variant: { Size: 'Large' },
  variantName: 'Large',
  price: 50.00,
  image: '/path/to/image.jpg',
  stockQty: 10
});

// Update quantity
updateQuantity('product-id', 'variant-name', 5);

// Remove item
removeItem('product-id', 'variant-name');

// Get totals
const itemCount = getTotalItems();  // Returns total quantity
const total = getTotalPrice();      // Returns total price
```

---

## Stock Validation Flow

1. **User clicks "Add to Cart"**
   - Frontend calls `/api/check-stock` with `variantId`
   - Checks current cart quantity for that variant
   - Compares `currentQtyInCart + 1` vs `availableStock`
   - Shows alert if insufficient stock

2. **User visits `/cart` page**
   - On mount, checks stock for all cart items
   - Displays red warnings for items exceeding stock
   - Disables "Proceed to Checkout" if any issues exist

3. **User increases quantity in cart**
   - Immediately checks stock again
   - Updates warnings dynamically
   - Prevents checkout if over limit

---

## Adding Products

Products are managed through the **Admin Panel** at https://urbanbees-product-admin.vercel.app

1. Click "Add Product"
2. Fill in details (name, category, description)
3. Add variants with prices and stock quantities
4. Upload images (auto-compressed to 1920px @ 85% quality)
5. Save → Preview → Deploy

Changes appear on the frontend within 5 minutes due to server-side caching (revalidate=300).

For immediate updates, click the deploy button on the preview page to clear cache.

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
