# Core Workflows

This document describes how the Urban Bees sale site is used by customers and administrators. These are the primary paths through the system.

**Last Updated:** February 16, 2026

---

## Customer Workflows

### 1. Browse and Discover Products

**Entry Points:**
- Homepage: https://frontend-six-kappa-30.vercel.app
- Direct links to product pages

**Flow:**
1. Customer lands on homepage
2. Products displayed in eBay-style horizontal cards (image left, details right)
3. Default sort: "Newest First" (by created_at/updated_at)
4. Can use search box (whole-word matching)
5. Can filter by category dropdown
6. Can change sort order (Newest, Name A-Z, Name Z-A)

**Available Actions:**
- Click product card → View product detail page
- Click wishlist icon → Add to wishlist (instant)
- View product images in cards
- Read descriptions with clickable links
- See variant count and price range

**Performance:**
- Homepage cached 5 minutes (ISR)
- Lazy loading for images below fold
- Thumbnail images based on view mode (tiny/small/medium)

---

### 2. View Product Details

**Entry Points:**
- Click product card from homepage
- Direct URL: `/product/[productId]`

**Flow:**
1. Customer navigates to product page
2. Large hero image displayed with gallery thumbnails below
3. Full description rendered with clickable URLs and mailto links
4. Variant selector shown (dropdown or buttons based on product)
5. Stock status displayed ("X in stock" or "Out of stock")

**Available Actions:**
- Click gallery thumbnail → View different image
- Click main image → Open lightbox modal (full-size view)
- Select variant → Update price and stock display
- Click "Add to Cart" → Add selected variant to cart
- Click wishlist icon → Add/remove from wishlist
- Click URLs in description → Open in new tab
- Click email links → Open mailto: or copy address

**Variant Selection:**
- **Button mode:** Products with option_values (Size, Color, etc.)
- **Dropdown mode:** Products without structured options
- First variant selected by default
- Price and stock update automatically

**Performance:**
- Product pages cached 60 seconds (ISR)
- Gallery thumbnails use `small` size (150px)
- Main image at full resolution
- Revalidated immediately after admin edits

---

### 3. Manage Wishlist

**Entry Points:**
- Wishlist icon in header (shows count badge)
- Direct URL: `/wishlist`

**Flow:**
1. Customer clicks wishlist icon in header
2. Navigates to dedicated wishlist page
3. All saved products displayed in compact cards
4. Select variant for each product via dropdown
5. Enter quantities if needed

**Available Actions:**
- Change variant selection → Price updates
- Adjust quantities → Ready for enquiry
- Click "Email Your Selection" → Open mailto: with structured details
- Click "Download Your Selection" → Generate text file for manual email
- Remove items from wishlist (trash icon)
- Navigate to product detail page

**State Management:**
- Wishlist stored in browser LocalStorage (Zustand)
- Persists across sessions
- Device-specific (doesn't sync)
- Lost if LocalStorage cleared

**Email/Download Output:**
- Date and item count
- Each product: Name, variant details, quantity
- No prices (enquiry-focused)
- Formatted for easy reading

**Performance:**
- Tiny thumbnails (80px) for compact cards
- Instant state updates (no API calls)
- Stock validation on demand

---

### 4. Shopping Cart Flow

**Entry Points:**
- "Add to Cart" on product page
- Cart state persists across pages

**Flow:**
1. Customer selects variant and clicks "Add to Cart"
2. Loading state shown ("Adding to Cart..." with spinner)
3. Stock validation against Supabase (cart-aware)
4. Success: Item added, confirmation shown
5. Navigate to `/cart` to review

**Cart Page Actions:**
- View all cart items with thumbnails
- Adjust quantities (stock warnings if exceeded)
- Remove items
- See total price calculation
- Click "Email Your Order" → Open mailto: with details
- Click "Download Your Order" → Generate text file
- Proceed to PayPal checkout (if desired)

**Stock Validation:**
- Checks available stock before adding
- Considers current cart quantity
- Shows red alerts if stock insufficient
- Disables checkout if conflicts exist

**State Management:**
- Cart stored in LocalStorage (Zustand)
- Persists across sessions
- Real-time stock validation via API

**Performance:**
- Small thumbnails (150px) for cart items
- 5-second timeout on add-to-cart requests
- Prevents duplicate clicks during request

---

### 5. Print/Export Workflow

**Entry Points:**
- From cart or wishlist, open "For Print" preview
- Direct URL: `/for_print`

**Flow:**
1. Customer selects products (cart or wishlist)
2. Navigate to For Print page
3. Compact, print-optimized layout displayed
4. All products shown with minimal spacing

**Available Actions:**
- Click "Email This Selection" → Open mailto:
- Click "Download Selection" → Generate text file
- Browser Print → Generate PDF or print to paper
- Email address visible for manual copy

**Layout Optimization:**
- 30-40% less vertical space than main site
- Tiny/small thumbnails (80-150px)
- Readable text at minimum size
- More products per printed page

**Performance:**
- Lightweight thumbnails for fast load
- No large images downloaded
- Printer-friendly CSS

---

## Admin Workflows

### 6. Create New Product

**Entry Points:**
- Admin homepage: https://urbanbees-product-admin.vercel.app
- Click "Add Product" button

**Flow:**
1. Admin navigates to `/add-product`
2. Fill in product details:
   - Name (required)
   - Category (dropdown)
   - Description (rich text with URL auto-shortening)
3. Upload images (multiple files)
4. Images automatically compressed (max 1920px, 85% JPEG)
5. Add first variant:
   - SKU
   - Price
   - Stock quantity
   - Option values (optional: Size, Color, etc.)
6. Click "Create Product"

**Automatic Processing:**
- URLs over 40 chars shortened via is.gd API
- Images compressed before upload to Supabase Storage
- Slug generated from product name
- First image becomes hero image
- Frontend cache revalidated after creation

**Validation:**
- Name required
- Category required
- At least one image required
- At least one variant required
- Price must be numeric
- Stock must be integer

**Result:**
- Product created in database
- Uploaded images stored in Supabase `product-images` bucket
- Redirected to edit page for further changes
- Product appears on frontend within 5 minutes (or immediately if cache cleared)

---

### 7. Edit Existing Product

**Entry Points:**
- Admin homepage → Click product card
- Direct URL: `/edit-product/[productId]`

**Flow:**
1. Admin navigates to product edit page
2. Current product data loaded from Supabase
3. Can modify all fields:
   - Name, category, description
   - Upload additional images
   - Edit gallery (crop, rotate, reorder, promote, delete)
   - Add/remove/edit variants
4. Click "Save Changes"

**Image Management:**
- Drag-and-drop to reorder gallery (hero locked at position 0)
- Click "Edit Image" → Open crop/rotate modal
  - Rotate 90° or 180°
  - Interactive crop with drag to move, corner handles to resize
  - Dark overlay shows area to be removed
- Click "Make Hero" → Promote gallery image to hero position
- Click delete icon → Remove image from product
- Click "Add Images" → Upload additional images

**Image Operations (Immediate Persistence):**
- Edits save instantly to database
- Don't wait for "Save Product" button
- Frontend cache revalidated after each image operation
- Original files replaced (no versioning)

**Variant Management:**
- View all variants in table (SKU, price, stock)
- Click "+ Add Variant" → Navigate to add-variant flow
- Click delete icon (🗑️) → Confirmation dialog → Delete variant
- Inline editing of SKU, price, stock, options

**Description Processing:**
- Long URLs shortened on save (is.gd API)
- Clickable preview shown below text area
- mailto: and https:// links rendered correctly

**Revalidation:**
- After save, admin triggers `/api/revalidate` on frontend
- Passes productId for targeted cache invalidation
- Changes appear immediately on frontend

**Result:**
- Product updated in database
- Images persisted to Supabase Storage
- Frontend revalidated and updated
- Admin sees success confirmation

---

### 8. Add Variant to Product

**Entry Points:**
- Edit product page → Click "+ Add Variant"
- Direct URL: `/add-variant?productId=[id]`

**Flow:**
1. Admin clicks "+ Add Variant" on edit-product page
2. Navigates to variant creation form with productId pre-filled
3. Fill in variant details:
   - SKU (optional identifier)
   - Price (required)
   - Stock quantity (required)
   - Option values (optional: Size, Color, etc.)
4. Click "Create Variant"

**Processing:**
- Variant created via `/api/create-variant`
- Linked to product via `product_id` foreign key
- `product_name` denormalized for CSV exports
- Frontend cache revalidated

**Result:**
- New variant appears in product edit page
- Available in variant selector on frontend
- Stock tracking active for new variant

---

### 9. Publish and Deploy Changes

**Entry Points:**
- Admin makes changes in panel
- Auto-deploy via GitHub on push

**Flow (Automatic):**
1. Admin saves changes in panel
2. API route writes to Supabase
3. Frontend revalidation API called automatically
4. Changes visible immediately on frontend (ISR cache updated)

**Flow (Manual Deployment):**
1. Developer commits code changes to GitHub
2. Push to `main` branch
3. Vercel auto-detects push
4. Builds and deploys both admin and frontend
5. Live within 1-2 minutes

**Manual Cache Clear:**
- Admin can use preview page "Clear Cache" button
- Forces homepage revalidation
- Useful if caching issues occur

**Monitoring:**
- Check Vercel dashboard for build status
- Test admin panel for product operations
- Verify frontend displays updated data

---

### 10. Image Gallery Workflow

**Entry Points:**
- Edit product page → Gallery section

**Flow:**
1. Admin views product gallery
2. Hero image shown first with "HERO" badge
3. Gallery images shown in order with drag handles

**Available Operations:**
- **Reorder:** Drag gallery images (hero stays at position 0)
- **Promote to Hero:** Click "Make Hero" on any gallery image
- **Edit Image:** Click "Edit Image" → Crop/rotate modal
- **Delete Image:** Click delete icon → Confirmation → Remove
- **Add Images:** Click "Add Images" → Upload new files

**Image Editing Modal:**
1. Image displayed on canvas
2. Rotation controls: 90° CW, 180°, 90° CCW
3. Crop tool: Drag to move, corner handles to resize
4. Dark overlay shows cropped area
5. Click "Apply" → Image persisted immediately
6. Modal closes, updated image shown in gallery
7. Frontend cache cleared automatically

**Hero Image Rules:**
- Always at position 0 in images array
- Cannot be reordered via drag-and-drop
- Can be replaced by promoting gallery image
- Must have at least one image (cannot delete if only one)

**Performance:**
- Gallery uses small thumbnails (150px)
- Full resolution loaded only in edit modal
- Immediate persistence prevents data loss

---

## System Workflows

### 11. Cache Revalidation Flow

**Trigger Points:**
- Admin saves product changes
- Admin edits/deletes images
- Admin creates/deletes variants
- Manual "Clear Cache" button

**Flow:**
1. Admin action completes successfully
2. Admin API route calls frontend `/api/revalidate`
3. Passes `productId` for targeted revalidation
4. Frontend Next.js revalidates:
   - Homepage (`/`)
   - Specific product page (`/product/[productId]`)
5. Next ISR regenerates pages on next request

**Timing:**
- Targeted revalidation: Immediate (next request)
- Full cache expiry: 5 min (homepage), 60s (product pages)

**Manual Override:**
- Admin preview page has "Clear Cache" button
- Forces homepage revalidation
- Useful for troubleshooting cache issues

---

### 12. Stock Validation Flow

**Trigger Points:**
- Customer clicks "Add to Cart"
- Customer proceeds to checkout

**Flow:**
1. Frontend calls `/api/check-stock`
2. Passes `variantId` and `requestedQuantity`
3. Backend queries Supabase for `variants.stock_qty`
4. Compares requested vs available
5. Returns `{ available: boolean, stock_qty: number }`
6. Frontend shows error or proceeds with add

**Cart-Aware Logic:**
- Frontend includes current cart quantity in check
- Backend validation considers existing cart items
- Prevents overselling across multiple add-to-cart operations

**Error Handling:**
- Stock insufficient: Show error, prevent add
- Stock exceeded in cart: Show red warning
- Out of stock: Disable "Add to Cart" button

---

## Future Workflow Changes

When adding new features or modifying workflows:
- Update this document to reflect current behavior
- Focus on user actions and system responses
- Avoid implementation details unless they affect usage
- Use clear entry points, flows, and outcomes
- Include performance notes if relevant to user experience
