# Changelog

All notable changes to the Urban Bees Sale Site will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [3.5.0] - 2026-02-16

### Added
- **About Page:** New `/about` route with placeholder content
  - Simple centered layout ready for content
  - Back button with smart navigation (history-aware with homepage fallback)
  - Consistent with site styling and responsive design
  - Prevents broken navigation on direct links or new tabs

### Changed
- **Header Navigation:** Added "About" link in main navigation
  - Position: Logo → About → Wishlist
  - Hidden on mobile to prevent wrapping
  - Visible on tablets and desktop (sm:inline)
  - Hover effect matches site theme (amber-600)

---

## [3.4.0] - 2026-02-16

### Added
- **Download Order Summary Feature:** Reliable fallback for users who can't use mailto: links
  - Created `download-utils.ts` with structured text file generation
  - Added "Download" button to wishlist, cart, and for_print pages
  - Downloads include: date, item list, variants, quantities, SKU, categories
  - Auto-generated filename with date (e.g., `my_wishlist_2026-02-16.txt`)
  - Helpful tooltips: "Download if email links don't work on your device"
  - **Business benefit:** Structured enquiries, clear audit trail, works on locked-down PCs
  - **User workflow:** Try email link → If fails → Download → Attach to manual email
  - Ensures no user is blocked from sending a complete enquiry

### Changed
- Price information removed from downloaded summaries (enquiry-focused format)
- Shows item count only, not total prices
- Cleaner format for customers to request quotes

---

## [3.3.0] - 2026-02-16

### Added
- **Diagnostic Test Page:** Created `/test-mailto` for systematic mailto: link testing
  - 5 systematic tests to isolate mailto: issues (environment vs code vs context)
  - Testing protocol and results template
  - Helps diagnose desktop vs mobile email link behavior differences
- **Production Robustness:** Email contact fallbacks for users without mailto: handlers
  - Added `select-all` CSS class to all email links (easier manual copy)
  - Added descriptive `title` attributes with fallback instructions  
  - Visible email addresses on wishlist and print pages
  - Users can always copy contact email manually if clicking fails
  - Ensures contact possible regardless of system configuration

### Fixed
- **Critical Hydration Error (#418):** Resolved React hydration mismatch on homepage
  - **Root cause:** Nested `<a>` tags (invalid HTML) - `renderDescriptionLine()` created links inside `<Link>` components
  - Browsers auto-correct invalid HTML but React expects original structure → mismatch
  - **Fix:** Moved description rendering outside Link component to prevent nested anchors
  - **Additional:** Fixed Rules of Hooks violation (conditional `useCartStore()`/`useWishlistStore()` calls)
  - **Additional:** Fixed undefined `removeFromWishlist()`/`addToWishlist()` functions (runtime bug)
  - Valid HTML structure, clean hydration, no console errors

### Changed
- **Email Link Consistency:** Added `stopPropagation()` to ProductDisplay email links
  - Now consistent with ProductCard behavior
  - Prevents parent container click interference

### Technical
- All email links now use `select-all` class and descriptive tooltips
- Wishlist page shows "Or email directly: sale@urbanbees.co.uk"
- Print page shows "Or email directly: sale@urbanbees.co.uk"
- Created comprehensive diagnostic documentation in `HYDRATION_FIX_2026-02-16.md`

---

## [3.2.0] - 2026-02-15

### Changed
- **Favicon System:** Converted from dynamic icon.tsx to static favicon.ico + favicon.svg
  - Removed runtime ImageResponse generation
  - Static 9.6KB Urban Bees logo favicon.ico (highest priority)
  - SVG fallback with teal-to-green gradient and "UB" text
  - Simpler, faster, more reliable browser support
- **Print View Layout:** Responsive print view with compact design
  - 30px images in compact mode (reduced from 60px)
  - Responsive: stacked vertical (mobile), inline horizontal (desktop ≥768px)
  - Email/Print controls converted to text links (blue underlined) from solid buttons
  - Icons reduced to h-3 w-3 for minimalist appearance
  - Removed "Offers welcome" text from printed descriptions
- **Wishlist Mobile Layout:** Cards now stack vertically on mobile
  - Image/details section at top
  - Action buttons at bottom
  - Improved readability on small screens
- **Header Navigation:** Simplified to logo + wishlist only
  - Removed cart icon (functionality not needed currently)
  - Cleaner, more focused navigation

### Fixed
- **Back Button Navigation:** Now redirects to homepage when no browser history
  - Fixes broken back button when opening product in new tab
  - Checks `window.history.length` before calling `router.back()`
- **Email Body Cleanup:** Removed "Total: £0.00" line from email templates
  - Displays item count only, cleaner output

### Technical
- Deleted `frontend/src/app/icon.tsx` (dynamic generation)
- Created `frontend/src/app/favicon.ico` with Urban Bees branding
- Updated `frontend/src/app/favicon.svg` with matching gradient design
- Modified `ForPrintClient.tsx` with `cleanDescription()` regex to remove offer text
- Updated `wishlist/page.tsx` with mobile-first stacked card layout
- Simplified `Header.tsx` by removing cart icon and useCartStore import
- Enhanced `ProductDisplay.tsx` and `ProductCard.tsx` to hide Add to Cart when price unavailable

---

## [3.1.0] - 2026-02-13

### Added
- **Variant Management in Admin Panel**
  - "+ Add Variant" button in edit-product page
  - Add multiple variants to existing products without database access
  - Delete variant button (🗑️) for each variant when multiple exist
  - Confirmation dialog when deleting saved variants
  - Automatic creation of new variants via `/api/create-variant` on save
  - `addNewVariant()` and `removeVariant()` functions
- **Smart Variant Selector on Frontend**
  - Dropdown selector for products with multiple variants but no defined options
  - Shows "SKU - £XX.XX" or "Option N - £XX.XX" format
  - Complements existing button-based selector for products with options
  - Automatically chooses appropriate UI based on product data structure
- **Image Editing Tools** (built-in canvas-based editor)
  - Canvas-based crop tool with interactive drag-to-move and corner-resize handles
  - Rotation controls (90°, -90°, 180°)
  - Dark overlay shows crop area vs. removal area
  - Immediate persistence to database and frontend cache clear
  - Modal UI with save/cancel workflow
- **Hero Image Management**
  - "Make Hero" button promotes any gallery image to hero position (index 0)
  - Visual HERO badge on first image
  - Drag-and-drop reordering for gallery images (hero locked at position 0)
  - ⋮⋮ drag handle indicators
- **Automatic URL Shortening**
  - is.gd API integration (free, no API key)
  - Shortens URLs >40 characters on product save
  - Skips already-shortened domains
  - Parallel processing, graceful fallback
- **Consistent Link Rendering**
  - URLs and mailto links now clickable on homepage product cards
  - Matches product detail page behavior
  - stopPropagation prevents card navigation when clicking embedded links
- **Enhanced Add-to-Cart UX**
  - Spinner animation with "Adding to Cart..." text
  - 5-second timeout with AbortController
  - Duplicate click prevention (button disabled during request)
  - Proper error messages surface to users (no silent failures)

### Changed
- **Default Sort:** Frontend homepage now defaults to "Newest First" (max of created_at/updated_at)
- **Cache Revalidation:** Frontend API now accepts specific `productId` for targeted cache clearing
- **Image Edit Flow:** Edited images persist immediately without requiring "Save Product" click
- **Admin Triggers:** Image edits and product saves now automatically clear frontend cache

### Fixed
- **Variant Visibility:** Products with multiple variants but no options now show selector
- **Workflow Gap:** Previously required manual database INSERT to add variants to existing products
- **Add-to-Cart Delays:** Eliminated 3-5 second hangs with proper loading states
- **Cart Update Reliability:** Stock check errors now prevent cart update (removed "continue anyway" logic)
- **Timeout Handling:** Requests that exceed 5 seconds show "Request timed out" alert
- **Error Visibility:** All failure scenarios show user-facing alerts with specific messages
- **Link Rendering Inconsistency:** Homepage product cards now render clickable URLs/mailto links

### Technical
- Modified `ProductDisplay.tsx` to show dropdown when `variants.length > 1` and `!product.options`
- Enhanced `edit-product/page.tsx` with variant array manipulation functions
- Leveraged existing `/api/create-variant` endpoint (no new API routes needed)
- Refactored cache revalidation to accept `productId` parameter
- Added `isAddingToCart` state to ProductDisplay and ProductCard components
- Created url-shortener utility (`admin/lib/url-shortener.ts`)
- Enhanced error handling with specific timeout detection
- Added `onClick={(e) => e.stopPropagation()}` to embedded links in ProductCard

---

## [3.0.0] - 2026-02-13

### Added
- **Image Editing Tools** in admin panel
  - Canvas-based crop tool with interactive drag-to-move and corner-resize handles
  - Rotation controls (90°, -90°, 180°)
  - Dark overlay shows crop area vs. removal area
  - Immediate persistence to database and frontend cache clear
  - Modal UI with save/cancel workflow
- **Hero Image Management**
  - "Make Hero" button promotes any gallery image to hero position (index 0)
  - Visual HERO badge on first image
  - Drag-and-drop reordering for gallery images (hero locked at position 0)
  - ⋮⋮ drag handle indicators
- **Automatic URL Shortening**
  - is.gd API integration (free, no API key)
  - Shortens URLs >40 characters on product save
  - Skips already-shortened domains
  - Parallel processing, graceful fallback
  - Console logging for debugging
- **Consistent Link Rendering**
  - URLs and mailto links now clickable on homepage product cards
  - Matches product detail page behavior
  - stopPropagation prevents card navigation when clicking embedded links

### Changed
- **Default Sort:** Frontend homepage now defaults to "Newest First" (max of created_at/updated_at)
- **Cache Revalidation:** Frontend API now accepts specific `productId` for targeted cache clearing
- **Image Edit Flow:** Edited images persist immediately without requiring "Save Product" click
- **Admin Triggers:** Image edits and product saves now automatically clear frontend cache

### Fixed
- **Add-to-Cart Delays:** Eliminated 3-5 second hangs with proper loading states
  - Added spinner animation with "Adding to Cart..." text
  - Implemented 5-second timeout with AbortController
  - Duplicate click prevention (button disabled during request)
  - Proper error messages surface to users (no silent failures)
- **Cart Update Reliability:** Stock check errors now prevent cart update (removed "continue anyway" logic)
- **Timeout Handling:** Requests that exceed 5 seconds show "Request timed out" alert
- **Error Visibility:** All failure scenarios show user-facing alerts with specific messages
- **Link Rendering Inconsistency:** Homepage product cards now render clickable URLs/mailto links

### Technical
- Refactored cache revalidation to accept `productId` parameter
- Added `isAddingToCart` state to ProductDisplay and ProductCard components
- Created url-shortener utility (`admin/lib/url-shortener.ts`)
- Enhanced error handling with specific timeout detection
- Added `onClick={(e) => e.stopPropagation()}` to embedded links in ProductCard

---

## [2.4.0] - 2026-02-02

### Added
- **Dedicated Cart Page** (`/cart`) replacing drawer-based cart
- **Global Header** with cart icon and item count badge
- **Smart Stock Validation**
  - Cart-aware stock checking (considers existing cart quantity)
  - Real-time stock warnings on cart page (red alerts)
  - Checkout button disabled if stock issues exist
- **eBay-Style Product Layout** (horizontal cards: image left, details right)
- **Enhanced Add-to-Cart UX**
  - Success toast with "Continue Shopping" / "Go to Cart" buttons
  - Auto-dismiss after user action
- **Search & Filter System**
  - Whole-word search matching
  - Category filter dropdown
  - Sort options (name, price, newest)
  - eBay-style filter layout
- **One-Click Deploy** button on preview page for cache clearing
- **API Routes for Mutations** (moved admin CRUD server-side for RLS compliance)
  - `/api/create-product`
  - `/api/update-product`
  - `/api/create-variant`
  - `/api/update-variant`

### Changed
- Cart now uses dedicated page instead of off-canvas drawer
- Admin operations use service role key via API routes (not client-side RLS bypass)
- Stock checking moved to backend API (`/api/check-stock`)

### Fixed
- RLS compliance (all mutations through server-side API routes)
- Stock overselling (cart-aware validation)
- Mobile responsiveness in filter/search UI

### Technical
- Migrated from client-side Supabase mutations to server-side API routes
- Added stock validation endpoint
- Implemented cart quantity awareness in stock checks

---

## [2.3.0] - 2026-02-01

### Added
- **Product Page Revalidation** - 60-second cache for product pages
- **Edit Buttons** on product detail pages
- **Image Compression Utility** (`admin/lib/image-utils.ts`)
  - Max 1920px width, 85% JPEG quality
  - Extracted from duplicate code in add/edit product pages
- **Standardized Placeholders** - Consistent fallback images across all pages

### Changed
- **Image Filename Format:** `{product-slug}-{number}-{timestamp}.jpg`
- **Edit Workflow:** Edit → Save → Redirect to Preview
- **Homepage Caching:** 5-minute revalidation (`revalidate = 300`)
- Edit/preview buttons open in same tab (removed `target="_blank"`)

### Fixed
- **Image Upload:** Gallery selection only (removed forced camera on mobile)
- **Code Deduplication:** Extracted `compressImage()` to shared utility

### Security
- **Supabase RLS Enabled** on all tables (products, variants)
- Database security: public read-only, admin full access via service role key
- Environment separation: anon key (client) vs. service role key (admin server)

### Documentation
- Updated `IMAGES_READY.md` for Supabase Storage workflow
- Archived migration scripts to `docs/archived-scripts/`
- Created `SCHEMA_ARCHITECTURE.md` for database documentation
- Created `SUPABASE_RLS_SETUP.md` for security policies

---

## [2.2.0] - 2026-01-28

### Added
- **Admin Panel** - Product and variant CRUD operations
- **Add Product Page** with inline variant creation
- **Edit Product Page** with dropdown selector
- **Supabase Integration**
  - PostgreSQL database (products, variants tables)
  - Storage bucket for images (product-images)
- **Frontend Dynamic Rendering** from Supabase
- **Preview Page** (`/preview`) for testing database products

### Changed
- Migrated from static `products.ts` to Supabase database
- Image storage moved from `/public/images/` to Supabase Storage

---

## [2.1.0] - 2026-01-20

### Added
- **Wishlist Feature** with LocalStorage persistence
- **PayPal Checkout Integration**
  - Create order API (`/api/paypal/create-order`)
  - Capture order API (`/api/paypal/capture-order`)
- **Success Page** (`/success`) after checkout
- **Product Detail Pages** with full image gallery
- **Variant Selection** on product pages

---

## [2.0.0] - 2026-01-15

### Added
- **Shopping Cart** with Zustand state management
- **Cart Drawer** (off-canvas) with line items
- **Add to Cart** functionality on product cards
- **Stock Quantity Display** on frontend
- **Price Formatting** (GBP currency)

---

## [1.0.0] - 2026-01-10

### Added
- Initial project structure with Next.js 16 and React 19
- Static product catalog (`frontend/src/data/products.ts`)
- Product grid with filtering and search
- Category-based navigation
- Responsive design with Tailwind CSS 4
- Basic product card layout with images
- TypeScript strict mode configuration

### Technical
- Next.js App Router architecture
- Turbopack for development
- ESLint + Prettier configuration
- Vercel deployment setup

---

## Version History

- **3.0.0** - Feb 13, 2026 - Image editing, URL shortening, performance fixes
- **2.4.0** - Feb 2, 2026 - Cart page, stock validation, search/filter
- **2.3.0** - Feb 1, 2026 - RLS security, image compression, caching
- **2.2.0** - Jan 28, 2026 - Supabase integration, admin panel
- **2.1.0** - Jan 20, 2026 - Wishlist, PayPal checkout
- **2.0.0** - Jan 15, 2026 - Shopping cart with Zustand
- **1.0.0** - Jan 10, 2026 - Initial static site launch
