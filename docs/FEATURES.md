# Urban Bees Sale Site - Feature Capabilities

**Version:** 3.1.0 | Last Updated: February 13, 2026  
**For Implementation Details:** See [CHANGELOG.md](CHANGELOG.md)

## Current Feature Set

### Admin Panel (https://urbanbees-product-admin.vercel.app)

**Product Management**
- Create/edit products with multi-image upload
- Inline variant management (add/delete SKU, price, stock)
- Automatic image compression (max 1920px, 85% JPEG)
- Rich text descriptions with URL auto-shortening (>40 chars via is.gd)
- Category dropdown selection
- Real-time preview with clickable links

**Image Tools**
- Built-in crop and rotate editor (canvas-based)
- Drag-and-drop gallery reordering (hero image locked at position 0)
- One-click hero promotion (any image → hero)
- Immediate persistence (no "Save" required for edits)
- Auto-clears frontend cache on changes

**Variant Management** (v3.1.0)
- Add variants to existing products (no database access needed)
- Delete variants with confirmation dialog
- View all variants with SKU/price/stock in one table

### Customer Frontend (https://frontend-six-kappa-30.vercel.app)

**Product Discovery**
- eBay-style horizontal cards (image left, details right)
- Whole-word search + category filter + sort options
- Default sort: "Newest First" (by created_at/updated_at)
- Clickable URLs and mailto links in descriptions

**Product Pages**
- Large hero image with gallery thumbnails
- Lightbox modal for full-size viewing
- Smart variant selector (dropdown or buttons based on product structure)
- Full descriptions with rendered links

**Shopping**
- Add-to-cart with loading states and 5-second timeout
- Real-time stock validation (cart-aware)
- Dedicated cart page with line items and quantity controls
- Stock warnings (red alerts if quantity exceeds availability)
- Wishlist with LocalStorage persistence
- PayPal checkout integration

**Performance**
- ISR caching (5-min homepage, 60s product pages)
- Image lazy loading with priority for above-fold content
- Targeted cache revalidation by product ID
- Next.js Image optimization with Supabase CDN


## Technical Architecture

**Frontend Stack**
- Next.js 16.1.5 (App Router), React 19, TypeScript
- Tailwind CSS 4
- Zustand (cart/wishlist state)
- Next/Image + Supabase Storage CDN

**Backend Stack**
- Supabase PostgreSQL (RLS enabled)
- Supabase Storage (product-images bucket)
- Next.js API routes (server-side mutations)

**Key Services**
- is.gd API: URL shortening (free, no key required)
- PayPal SDK: Payment processing
- HTML5 Canvas API: Client-side image editing

## Database Schema

**Tables:**
- `products` (id, name, slug, category, description, images[], created_at, updated_at)
- `variants` (id, product_id, sku, price, stock_qty, option_values, product_name)
- `website_products` (reference table for admin dropdown)

**Security:**
- Public: Read-only access (SELECT via RLS)
- Admin: Full CRUD via service role key (API routes)

## Key Workflows

### Add Product (Admin)
1. Navigate to "Add Product"
2. Upload images (auto-compressed) → Supabase Storage
3. Fill name, category, description (URLs auto-shortened on save)
4. Add variant details (SKU, price, stock)
5. Click "Create Product" → Database INSERT
6. Redirect to preview → Frontend cache clears

### Edit Product (Admin)
1. Select product from dropdown
2. Modify fields, reorder images, edit images (crop/rotate)
3. Add/delete variants as needed
4. Click "Save Product" → Updates database
5. Image edits persist immediately with cache clear

### Add to Cart (Customer)
1. Click "Add to Cart" → Button shows spinner
2. Backend validates stock (cart-aware)
3. On success: Item added, toast notification
4. On failure: Alert with specific error (timeout/out-of-stock/general)
5. 5-second timeout prevents indefinite hangs

### Checkout (Customer)
1. Navigate to `/cart`
2. Review items with real-time stock warnings
3. Click "Checkout with PayPal"
4. Complete payment in PayPal modal
5. Redirect to success page with order ID

## Browser Support
- Chrome/Edge: Full support (recommended)
- Firefox: Full support
- Safari 13+: Full support
- Mobile: Responsive, touch-optimized

## Known Limitations
- URL shortening requires is.gd availability (free tier)
- Image editing requires Canvas API (modern browsers only)
- Drag-drop reordering: Desktop only (no touch support)
- PayPal checkout: Requires PayPal account

## Related Documentation
- **Version History:** [CHANGELOG.md](CHANGELOG.md)
- **Database Details:** [SCHEMA_ARCHITECTURE.md](SCHEMA_ARCHITECTURE.md)
- **UX Improvements:** [UX_AUDIT_2026-02-13.md](UX_AUDIT_2026-02-13.md)
- **Planned Features:** [TODO.md](TODO.md)

---

**For detailed implementation timelines and technical changes, refer to [CHANGELOG.md](CHANGELOG.md).**


