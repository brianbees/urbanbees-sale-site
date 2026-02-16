# TODO - Future Features

## Recent Updates (Feb 15, 2026)

### Completed Today ✅
- **Favicon System Overhaul** - Converted from dynamic to static implementation
  - Removed dynamic icon.tsx (ImageResponse generation)
  - Created static favicon.ico with Urban Bees logo (9.6KB)
  - Updated favicon.svg with teal-to-green gradient fallback
  - Next.js priority: favicon.ico > favicon.svg
  - Simpler architecture, faster loading, better browser compatibility
- **Print View Improvements** - Responsive, compact print layout
  - 30px images in compact mode (50% reduction)
  - Responsive layout: vertical stack (mobile), horizontal inline (desktop)
  - Email/Print controls now text links instead of buttons
  - Minimalist h-3 icons
  - Removed "Offers welcome" text from descriptions via regex
- **Wishlist Mobile Optimization** - Stacked card layout for small screens
  - Image/details at top, action buttons at bottom
  - Better touch target spacing
  - Improved readability on mobile devices
- **Header Simplification** - Removed cart icon, kept wishlist only
  - Cleaner navigation (logo + wishlist)
  - Cart functionality not needed currently
- **Back Button Fix** - Navigate to homepage when no browser history
  - Prevents broken back button on new tab opens
  - Checks history length before using router.back()
- **Email Cleanup** - Removed "Total: £0.00" line from email bodies
  - Shows item count only, cleaner output

---

## Recent Updates (Feb 13, 2026)

### Completed Today ✅
- **Variant Management** - Full workflow for adding/removing variants to products
  - "+ Add Variant" button in edit-product page
  - Delete variant button (🗑️) with confirmation dialog
  - New variants auto-created on save (via `/api/create-variant`)
  - No more manual database edits required
- **Smart Variant Selector** - Frontend displays variants for all product types
  - Dropdown selector for products without defined options
  - Shows "SKU - £XX.XX" format in dropdown
  - Button selector for products with options (Size, Color, etc.)
  - Fixes: variants now visible on all multi-variant products
- **Image Editing Tools** - Built-in crop and rotate functionality in product editor
  - Canvas-based image editor with modal UI
  - 90°/180° rotation controls
  - Interactive crop tool with drag-to-move and corner handles for resizing
  - Dark overlay shows area to be removed (standard crop UX)
  - Images persist immediately to database and clear frontend cache
  - Edited images replace originals automatically
- **Hero Image Management** - Promote any gallery image to hero with one click
  - "Make Hero" button on all non-hero images
  - Drag-and-drop reordering for gallery images (hero stays fixed at position 0)
  - Visual indicators (HERO badge, drag handles)
- **Newest First Sorting** - Default sort changed to show most recently created/updated products
  - Smart timestamp logic (max of created_at or updated_at)
  - Maintains alphabetical fallback for ties
- **Add-to-Cart Performance Fixes** - Eliminated delays and inconsistent cart updates
  - Loading states with spinner animation ("Adding to Cart...")
  - 5-second timeout with AbortController prevents indefinite hangs
  - Duplicate click prevention (button disabled during request)
  - Proper error messages ("Request timed out" vs "Failed to add")
  - Error handling stops cart update on failure (no silent failures)
- **Automatic URL Shortening** - Long URLs in descriptions shortened on save
  - Uses is.gd API (free, no API key required)
  - Skips URLs under 40 characters or already shortened
  - Parallel processing for multiple URLs
  - Graceful fallback (keeps original on failure)
  - Console logging for debugging
- **Consistent Link Rendering** - URLs and mailto links clickable everywhere
  - Fixed: Homepage product cards now render clickable links
  - Matches product detail page behavior
  - mailto links show clean email without protocol prefix
  - Links don't trigger card navigation (stopPropagation)
- **Targeted Cache Revalidation** - Frontend cache clears specific product pages
  - Revalidate API accepts productId parameter
  - Admin triggers cache clear after image edits and full saves
  - Changes appear immediately on frontend (no 5-minute wait)

### System Architecture Improvements
- **Image Edit Persistence** - Edited images save immediately, don't wait for "Save Product"
- **Frontend-Backend Sync** - Admin calls frontend revalidation API after mutations
- **Error Visibility** - All failures surface to users (no silent errors)
- **Performance Monitoring** - Console logs track shortening, cache clears, stock checks

---

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

## Completed Features (Unlisted Until Now)

### Print List Feature ✅
**Route:** `/for_print` (`frontend/src/app/for_print/page.tsx` & `ForPrintClient.tsx`)
- Print-friendly product lists with multiple view modes
- Mode toggle: Wishlist (with checkboxes) or All Products
- Email and Print buttons with mailto generation
- Responsive layout (stacked mobile, inline desktop)
- Clean description rendering (offer text removed)
- Fetches live data from Supabase
- Not linked from main navigation (internal tool)

---

## Planned Features
[...existing code...]

---
## Recent Updates (Feb 16, 2026)

### Completed Today ✅
- **Download Order Summary Feature** - Complete fallback for mailto: workflow (v3.4.0)
  - **Problem:** Even with visible email addresses, some users need attachments for enquiries
  - **Solution:** Added download buttons that generate structured text files
  - **Implementation:**
    - Created `download-utils.ts` with text file generation utility
    - Added "Download" buttons to wishlist, cart, and for_print pages
    - Downloads include: date, items, variants, quantities, SKU, categories
    - Auto-generated filename: `my_wishlist_2026-02-16.txt` format
    - No prices included (enquiry-focused format)
  - **User workflow:** Try email link → If fails → Download → Attach to manual email
  - **Business benefits:**
    - Structured requests (not vague "I'm interested" emails)
    - Clear audit trail of what customer wants
    - Works on locked-down PCs, any device, any browser
  - **Result:** Zero barriers to customer contact - always a way to send enquiry
  
- **Production Robustness: Email Contact Fallbacks** - Enhanced UX for users without mailto: handlers
  - **Context:** Confirmed desktop mailto: issues were environment configuration (not code bug)
  - **Problem:** Some users on locked-down PCs or without mail clients can't use mailto: links
  - **Solution:** Added fallback mechanisms for universal contact access
  - **Improvements:**
    - Added `select-all` CSS class to email links (easier text selection)
    - Added descriptive `title` attributes with fallback instructions
    - Added `stopPropagation()` to ProductDisplay email links (consistency)
    - Wishlist page: Shows visible email address below buttons
    - Print page: Shows visible email address below buttons
    - All email addresses now clearly copyable even if clicking fails
  - **Result:** Users can always obtain contact email, regardless of system configuration
  - **Philosophy:** Production quality means users are never blocked by their environment
  
- **Diagnostic Test Page** - Created /test-mailto for systematic investigation
  - 5 systematic tests to isolate mailto: issues (environment vs code vs context)
  - Testing protocol and results template
  - Helped confirm root cause was environment, not application
  
- **Hydration Issue ACTUALLY Resolved** - Fixed React hydration error (#418) on homepage
  - **Initial misdiagnosis:** Thought undefined functions were the cause
  - **Actual root cause:** Nested `<a>` tags (invalid HTML) causing browser DOM correction
  - **The problem:** `renderDescriptionLine()` created `<a>` tags inside `<Link>` components
  - **Why it caused hydration:** Browsers auto-correct invalid HTML, but React expects original structure
  - **Timing:** Error occurred immediately on page load, BEFORE any user interaction
  - **Fix #1 (Hydration):** Moved description with links outside of Link component
  - **Fix #2 (Rules of Hooks):** Changed conditional `useCartStore()`/`useWishlistStore()` calls to unconditional
  - **Fix #3 (Runtime bug):** Fixed undefined `removeFromWishlist()`/`addToWishlist()` functions
  - All TypeScript compilation errors cleared
  - Valid HTML structure now renders correctly
  
### Key Learning
- **Hydration errors ≠ Runtime errors**
- Hydration occurs BEFORE user interaction (during initial page load)
- Event handler bugs (like undefined functions) are runtime issues, not hydration issues
- Always check: Does the error appear on load or after clicking?
- **Environment vs Application:** Don't assume code bug - verify environment first
- **Production robustness:** Users blocked by environment = production issue, even if technically "working"
  
---
