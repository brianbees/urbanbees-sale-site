# Urban Bees Sale Site - Feature Documentation

**Last Updated:** February 13, 2026  
**Version:** 3.0.0  

## Table of Contents
1. [Admin Panel Features](#admin-panel-features)
2. [Customer Frontend Features](#customer-frontend-features)
3. [Image Management](#image-management)
4. [Product Management](#product-management)
5. [Shopping & Checkout](#shopping--checkout)
6. [Performance & Caching](#performance--caching)

---

## Admin Panel Features

### Product Management
**Location:** `https://urbanbees-product-admin.vercel.app`

#### Add Product
- Multi-image upload with automatic compression (max 1920px, 85% JPEG quality)
- Camera-free upload (gallery selection only for easier desktop workflow)
- Inline variant creation (SKU, price, stock quantity)
- Category dropdown selection
- Rich text description with automatic URL shortening
- Real-time preview with clickable links

#### Edit Product
- Dropdown selector for all existing products
- Live preview of description with URL/mailto link rendering
- Image management:
  - **Hero Badge** on first image (cannot be reordered)
  - **Drag-and-drop** reordering for gallery images (hero locked at position 0)
  - **Promote to Hero** button on any gallery image (swaps to position 0)
  - **Delete** button with visual confirmation
  - **Edit Image** button opens built-in editor
- Variant editing with create/update logic
- Auto-saves edited images immediately with frontend cache clear

### Image Editing Tools (NEW Feb 13, 2026)
**Access:** Click "✎ Edit" button on any product image

#### Features:
- **Canvas-based editor** with modal UI
- **Rotation controls:**
  - ↻ 90° (clockwise)
  - ↺ -90° (counter-clockwise)
  - 180° rotation
  - Non-destructive until saved
- **Crop tool:**
  - Toggle on/off with "Enable Crop" button
  - Blue border shows crop area
  - Dark overlay dims area to be removed
  - **Drag to move** crop rectangle
  - **Drag corner handles** to resize crop area
  - Minimum 10% size constraint
  - Constrained within image bounds
- **Workflow:**
  1. Click "Edit" on image
  2. Apply rotation and/or crop
  3. Click "Save Changes"
  4. Edited image replaces original immediately
  5. Database updated automatically
  6. Frontend cache cleared for instant visibility
  7. Old image marked for deletion

#### Technical Details:
- Images downscaled to max 600px for fast editing
- CORS-enabled for Supabase Storage images
- JPEG export at 90% quality
- Filename format: `{slug}-edited-{position}-{timestamp}.jpg`

### URL Shortening (NEW Feb 13, 2026)
**Automatic on save**

#### Behavior:
- Scans description for all URLs on product save
- Shortens URLs longer than 40 characters
- Uses is.gd API (free, no API key required)
- Processes multiple URLs in parallel
- Skips already-shortened domains (is.gd, bit.ly, tinyurl.com, etc.)
- Falls back to original URL if shortening fails
- Console logs success/failure for debugging

#### Example:
```
Before: https://www.verylongdomainname.com/products/category/item?id=123
After:  https://is.gd/abc123
```

---

## Customer Frontend Features

### Homepage
**Location:** `https://frontend-six-kappa-30.vercel.app`

#### Product Grid
- **eBay-style horizontal layout** (image left, details right)
- Responsive design (mobile/tablet/desktop)
- **Default sort:** "Newest First" (by created_at or updated_at)
- **Search:** Whole-word matching across product names and descriptions
- **Filter:** Category dropdown
- **Sort options:**
  - Name (A-Z / Z-A)
  - Price (Low-High / High-Low)
  - Newest First (default)
- **Quick actions:**
  - Add to Cart button with loading spinner
  - Wishlist heart icon (toggle on/off)
  - Stock quantity display
- **Clickable links** in descriptions (URLs and mailto)
- **Truncated descriptions** (2 lines with "...")

#### Product Cards
- Product name + category badge
- First image with hover effects
- Price display or "Contact for Price"
- Variant selector (if multiple variants)
- Stock availability indicator

### Product Detail Page
**Location:** `https://frontend-six-kappa-30.vercel.app/product/{id}`

#### Features:
- **Large hero image** (400-500px height, click to zoom)
- **Gallery thumbnails** (6 per row)
- **Lightbox modal** for full-size viewing
- **Full description** with clickable URLs and mailto links
- **Variant selector** (if product has options)
- **Add to Cart** with:
  - Real-time stock validation (checks current cart quantity)
  - Loading spinner during stock check
  - 5-second timeout protection
  - Clear error messages
  - Success toast with "Continue Shopping" or "Go to Cart"
- **Wishlist toggle** with heart icon
- **Stock display** (e.g., "5 in stock")
- **Back button** to return to homepage

#### Performance:
- ISR with 60-second revalidation
- Specific product page cache clearing on admin edits
- Optimized images with Next.js Image component

---

## Image Management

### Upload & Compression
- **Auto-compression** before upload:
  - Max width: 1920px
  - Maintains aspect ratio
  - JPEG quality: 85%
  - Browser-based (Canvas API)
- **Naming convention:** `{product-slug}-{number}-{timestamp}.jpg`
- **Storage:** Supabase Storage (product-images bucket)

### Image Order & Hero
- **Hero image:** Always first in array (position 0)
- **Gallery images:** Positions 1-N, drag-drop reorderable
- **Promote to Hero:** Click "⭐ Make Hero" on any gallery image
  - Swaps selected image to position 0
  - Old hero moves to gallery
  - Atomic update (no intermediate states)
- **Visual indicators:**
  - HERO badge on first image
  - ⋮⋮ drag handle on gallery images
  - Hover effects reveal action buttons

### Image Editing
- **In-place editing:** No need to re-upload
- **Non-destructive:** Preview changes before saving
- **Automatic persistence:** Saves immediately on "Save Changes"
- **Cache clearing:** Frontend updates instantly
- **Maintains position:** Edited image stays in same slot (hero or gallery)

---

## Product Management

### Data Structure
```typescript
Product {
  id: string (UUID)
  name: string
  category: string
  description: string (with shortene URLs)
  images: string[] (Supabase Storage URLs)
  created_at: timestamp
  updated_at: timestamp
}

Variant {
  id: string (UUID)
  product_id: string (FK)
  sku: string
  price: number
  stock_qty: number
  option_values: object
}
```

### Workflows

#### Create Product Flow:
1. Admin → Add Product
2. Fill name, category, description
3. Upload images (auto-compressed)
4. Add variant details (SKU, price, stock)
5. Click "Create Product"
6. Long URLs shortened automatically
7. Redirect to Preview page
8. Frontend cache clears (5-min cache)

#### Edit Product Flow:
1. Admin → Edit Product
2. Select product from dropdown
3. Modify fields (name, description, category)
4. Manage images:
   - Drag-drop reorder
   - Promote to hero
   - Delete
   - Edit (crop/rotate)
5. Update variants
6. Click "Save Product"
7. URLs shortened if new/modified
8. Frontend cache clears for specific product
9. Changes visible immediately

#### Edit Image Flow:
1. Edit Product → Hover image → "✎ Edit"
2. Modal opens with image editor
3. Rotate and/or crop as needed
4. Click "Save Changes"
5. Edited image uploads to Supabase
6. Description URLs shortened (if applies)
7. Database updated with new image URL
8. Frontend cache cleared for product
9. Old image marked for deletion
10. Modal closes, preview updates

---

## Shopping & Checkout

### Add to Cart
**Locations:** Homepage cards, Product detail page

#### Flow:
1. User clicks "Add to Cart"
2. **Loading state** shows spinner + "Adding to Cart..."
3. **Stock validation:**
   - Fetch current stock from database
   - Check quantity already in cart
   - Compare: `currentInCart + 1 <= availableStock`
   - **5-second timeout** with AbortController
4. **Success:**
   - Item added to Zustand cart store
   - LocalStorage persisted
   - Toast notification with action buttons
5. **Failure scenarios:**
   - Out of stock → "Sorry, this item is currently out of stock."
   - Max quantity reached → "You already have the maximum available quantity."
   - Timeout → "Request timed out. Please check your connection."
   - API error → "Failed to add item to cart. Please try again."
6. **Loading state clears** regardless of outcome

#### Features:
- **Duplicate click prevention** (button disabled during request)
- **Cart-aware validation** (considers existing cart quantity)
- **Visual feedback** (spinner, color changes)
- **Error visibility** (alerts, console logs)
- **Timeout protection** (no indefinite hangs)

### Cart Page
**Location:** `/cart`

#### Features:
- Line item display (image, name, variant, price)
- Quantity adjusters (+/- buttons)
- Remove item button
- Subtotal per line
- Grand total calculation
- **Stock warnings** (red alert if stock changed)
- **Checkout button** (disabled if stock issues)
- "Continue Shopping" link back to homepage

### Wishlist
**Location:** `/wishlist`

#### Features:
- Persistent across sessions (LocalStorage)
- Add/remove from any page (heart icon)
- View all saved items
- Quick "Add to Cart" from wishlist
- Remove from wishlist

### PayPal Checkout
**Status:** Basic implementation

#### Current Flow:
1. User clicks "Checkout with PayPal"
2. PayPal order created via `/api/paypal/create-order`
3. PayPal modal opens
4. User completes payment
5. Order captured via `/api/paypal/capture-order`
6. Success page shows order ID

#### Pending Enhancement:
- Automatic order details in PayPal metadata (no manual typing)

---

## Performance & Caching

### Frontend Caching
- **Homepage:** 5-minute ISR (`revalidate = 300`)
- **Product pages:** 60-second ISR (`revalidate = 60`)
- **Manual clear:** Preview page "Clear Cache" button
- **Automatic clear:** Admin triggers after edits

### Cache Revalidation Strategy
**API Endpoint:** `/api/revalidate`

#### Accepts:
```json
{
  "productId": "uuid-optional",
  "reason": "string-optional"
}
```

#### Clears:
- Homepage (`/`)
- Preview page (`/preview`)
- Specific product page (`/product/{productId}`) if ID provided
- All product pages (`/product/[id]`) if no ID provided

#### Triggered By:
- Admin "Save Product" button
- Admin "Save Changes" in ImageEditor
- Preview page "Clear Cache" button
- Any product mutation in admin

### Image Optimization
- **Next.js Image component** on frontend
- **Lazy loading** for off-screen images
- **Priority loading** for hero and first 8 grid items
- **Responsive sizes** (`sizes` attribute for optimal loading)
- **Supabase CDN** for fast global delivery

### API Performance
- **Stock check:** ~200-500ms (Supabase query)
- **URL shortening:** ~300-800ms per URL (is.gd API, parallel)
- **Image upload:** Varies by file size (compressed first)
- **Cache clear:** ~100-300ms (Next.js revalidation)

---

## Technical Stack

### Frontend
- **Framework:** Next.js 16.1.5 (App Router)
- **React:** 19.x with TypeScript
- **Styling:** Tailwind CSS 4
- **State:** Zustand (cart, wishlist)
- **Images:** Next/Image + Supabase Storage
- **Payments:** PayPal SDK

### Admin
- **Framework:** Next.js 16.1.5 (App Router)
- **React:** 19.x with TypeScript
- **Styling:** Tailwind CSS 4
- **Image editing:** HTML5 Canvas API
- **URL shortening:** is.gd API (free)

### Backend
- **Database:** Supabase PostgreSQL
- **Storage:** Supabase Storage (product-images bucket)
- **Auth:** Supabase RLS (public read, admin write)
- **APIs:** Next.js API routes (server-side mutations)

### Deployment
- **Hosting:** Vercel (auto-deploy from main branch)
- **Repository:** github.com/brianbees/urbanbees-sale-site
- **Admin URL:** https://urbanbees-product-admin.vercel.app
- **Frontend URL:** https://frontend-six-kappa-30.vercel.app
- **Branch:** main (production)

---

## Environment Variables

### Required (Both Apps)
```env
NEXT_PUBLIC_SUPABASE_URL=https://pdovgefwzxfawuyngrke.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

### Admin Only
```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...  # Server-side mutations
```

### Frontend Only
```env
NEXT_PUBLIC_PAYPAL_CLIENT_ID=AQh...  # PayPal checkout
```

---

## Browser Support
- **Chrome/Edge:** Full support (recommended)
- **Firefox:** Full support
- **Safari:** Full support (13+)
- **Mobile:** Responsive design, touch-optimized

## Known Limitations
- URL shortening requires is.gd API availability (free tier)
- Image editing requires modern browser (Canvas API support)
- Drag-drop reordering desktop-only (touch not supported)
- PayPal checkout requires PayPal account

## Future Enhancements
See [TODO.md](TODO.md) for planned features.
