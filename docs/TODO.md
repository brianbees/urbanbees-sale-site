# TODO - Future Features

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
