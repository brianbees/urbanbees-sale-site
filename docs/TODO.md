# TODO - Future Features

## Recent Updates (Feb 2, 2026)

### Completed Today ✅
- **Cart Page System** - Converted from drawer to dedicated `/cart` page with proper navigation
- **Header Component** - Global navigation with cart icon and item count badge
- **Smart Stock Validation** - Cart-aware stock checking prevents overselling
  - Validates available stock before adding items
  - Considers current cart quantity when adding more
  - Real-time stock warnings on cart page with red alerts
  - Disables checkout if stock issues exist
- **eBay-Style Product Layout** - Horizontal cards (image left, details right)
- **Enhanced UX** - Add to cart shows notification with "Continue Shopping" / "Go to Cart" options
- **Search & Filter System** - eBay-style dropdowns with category filter, sort options
- **Whole-word Search** - Search matches complete words only (not partial)
- **Responsive Design** - Mobile-optimized filter layout
- **One-click Deploy** - Deploy button on preview page for instant cache clearing
- **API Routes for Mutations** - Moved admin CRUD operations server-side to fix RLS issues
- **Local Development Setup** - Working dev servers on localhost:3000 and localhost:3001

---

## Recent Updates (Feb 1, 2026)

### Completed
- ✅ Product page revalidation (60s cache) - new images show within 1 minute
- ✅ Edit buttons on product detail pages
- ✅ Image filenames use product-name-number-timestamp format
- ✅ Edit/preview buttons open in same tab
- ✅ Redirect to preview page after editing product
- ✅ Standardized placeholder images across all pages
- ✅ Supabase Row Level Security (RLS) enabled on all tables
- ✅ Database security configured (public read-only, admin full access)
- ✅ Code deduplication (image compression utility)
- ✅ Homepage caching (5-minute revalidation)

### Admin Panel (v2.4.0)
- Image compression: Auto-compress to max 1920px @ 85% JPEG quality
- Image upload: Gallery-only (no forced camera)
- Edit workflow: Edit → Save → Preview page
- Image naming: `product-slug-1-timestamp.jpg`, `product-slug-2-timestamp.jpg`

## PayPal Checkout Enhancement

**Request:** Remove the requirement for customers to manually type their order details into the PayPal note.

**Goal:** Update the checkout logic so that the Cart Summary (items, quantities, and IDs) is sent directly to the payment provider's metadata. Order details should show up automatically in the seller dashboard when a payment is completed.

**Status:** Pending implementation

---

## Internal/Utility Pages

- **For Print Page** (`frontend/src/app/for_print/page.tsx` & `ForPrintClient.tsx`)
  - Purpose: Generates a print-friendly list of all products, including name, description, price, SKU, and stock quantity.
  - Data Source: Fetches live product and variant data from Supabase.
  - Usage: Used for internal inventory printouts or quick reference sheets. Not linked from main navigation.
  - Status: Not referenced in other documentation until Feb 2026. Now tracked here for completeness.
