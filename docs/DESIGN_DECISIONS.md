# Design Decisions

This document records the key architectural and design decisions that shape how the Urban Bees sale site operates. These decisions are intentional and should not be "optimised away" without understanding their context and implications.

**Last Updated:** February 16, 2026

---

## 1. Email-Based Enquiries (No Checkout Flow)

**Decision:** Customers contact seller via email/download instead of completing transactions on-site.

**Context:**
- Business model focuses on enquiries and negotiations ("Offers welcome")
- No need for immediate payment processing infrastructure
- Simpler workflow for both customers and business

**Reason:**
- Reduces complexity (no order management, inventory reservation, refunds)
- Allows price negotiation and custom quotes
- Aligns with personalized sales approach

**Implication:**
- Cart/wishlist are selection tools, not transaction systems
- Download feature provides structured enquiry format for email attachment
- PayPal integration available but secondary to email workflow
- Stock validation helps prevent enquiries for unavailable items

**Implementation Rules:**
- Always provide fallback methods (download + visible email)
- Generated files must contain all selection details (no prices)
- mailto: links should open cleanly but not be the only option

---

## 2. Client-Side State Management (Zustand)

**Decision:** Cart and wishlist state stored in browser LocalStorage via Zustand, not in database.

**Context:**
- No user accounts or authentication system
- Sessions are short-lived (browse → enquire → email)
- State complexity is minimal (product IDs and quantities)

**Reason:**
- Zero backend infrastructure for session management
- Instant state updates without API calls
- Privacy-friendly (no tracking, no cookies)
- Survives page refreshes and browser restarts

**Implication:**
- State is device-specific (doesn't sync across devices)
- Lost if LocalStorage is cleared
- Stock validation must happen server-side on demand
- No order history or saved carts in database

**Implementation Rules:**
- Store minimal data: `{ productId, variantId, quantity }`
- Always store original image URLs (apply transformations at render time)
- Validate stock against Supabase before checkout/email
- Never trust client-side quantities for business logic

---

## 3. Image Performance Strategy (Thumbnail Transformations)

**Decision:** Load appropriately-sized images based on display context using Supabase Storage transformations.

**Context:**
- Product images originally 500KB-2MB full resolution
- Many views display images at 50-250px width
- Supabase Storage supports URL-based image transformation

**Reason:**
- 70-90% reduction in data transfer per image
- Dramatically faster page load and scroll performance
- Better mobile/slow connection experience
- No degradation in perceived visual quality

**Implication:**
- Homepage: 90-95% less image data
- Cart/wishlist: 85-90% less image data
- Admin panel: Faster image grid loading
- Requires consistent transformation strategy across codebase

**Implementation Rules:**
- Use `thumbnailSizes` utility for all product images
- Context-based sizing:
  - Compact lists: `tiny` (80px @ 70% quality)
  - Standard cards: `small` (150px @ 75% quality)
  - Grid views: `medium` (250px @ 80% quality)
  - Gallery thumbnails: `small` (150px)
  - Full product images: Original resolution
- Admin image grids: 150px via URL parameters
- Never use CSS to resize full-resolution images
- Apply transformations at render time, not in state storage

---

## 4. Server-Side Image Editing (HTML5 Canvas)

**Decision:** Image crop/rotate operations run in browser using HTML5 Canvas API, then upload to Supabase.

**Context:**
- Admin needs to adjust product images without external tools
- Server-side image processing requires additional infrastructure
- Modern browsers have robust Canvas support

**Reason:**
- Zero backend processing costs or dependencies
- Instant preview before upload
- Leverages browser's native image handling
- Simple implementation with immediate feedback

**Implication:**
- Edited images fully replace originals (no versioning)
- Max size: 1920px width, 85% JPEG quality
- Processing happens on admin's machine
- Large images may cause performance issues on low-end devices

**Implementation Rules:**
- Compress all images before upload (max 1920px, 85% JPEG)
- Canvas operations must maintain aspect ratio
- Persist immediately to database, don't wait for "Save Product"
- Trigger frontend cache revalidation after image edits
- Provide clear visual feedback during processing

---

## 5. Print Page Density Optimization

**Decision:** For Print page uses 30-40% less vertical space and loads tiny/small thumbnails.

**Context:**
- Users want to print product selections for offline review
- Original layout wasted space with large margins/padding
- Full-resolution images unnecessary for print

**Reason:**
- More products per printed page (paper efficiency)
- Faster page load for print preview
- Maintains readability while prioritizing density
- Reduces ink/paper costs for users

**Implication:**
- Compact spacing may feel cramped compared to main site
- Text must remain readable at smaller sizes
- Images optimized for print resolution, not screen

**Implementation Rules:**
- Reduce margins/padding to 2-4px on print page only
- Do not apply compact layout to browsing pages
- Use `tiny` or `small` thumbnails (80-150px)
- Maintain clear visual separation between products
- Keep text at readable font size (not below 12px)

---

## 6. URL Shortening (is.gd API)

**Decision:** Automatically shorten URLs over 40 characters in product descriptions using is.gd.

**Context:**
- Long URLs break layout and readability
- Product descriptions may contain manufacturer links
- Need simple, free solution without rate limits

**Reason:**
- is.gd API free, no authentication required
- Saves descriptions clean and professional
- Doesn't affect SEO (descriptions are not indexed separately)
- Graceful fallback on API failure

**Implication:**
- Shortened links are permanent (is.gd doesn't expire)
- Original URLs lost after shortening (not reversible)
- API failures keep original URLs (safe default)
- May introduce external dependency latency

**Implementation Rules:**
- Only shorten URLs longer than 40 characters
- Skip already-shortened URLs (is.gd, bit.ly, etc.)
- Process all URLs in parallel (don't block on failures)
- Log shortening results for debugging
- Never fail the save operation if shortening fails

---

## 7. Row-Level Security Architecture

**Decision:** Public read-only access via RLS, admin writes via service role key in API routes.

**Context:**
- Frontend needs fast, direct database access
- Admin needs full CRUD without exposing credentials
- Supabase RLS provides declarative security

**Reason:**
- Frontend gets ISR benefits with Supabase client
- No API gateway needed for reads
- Service role key never exposed to client
- Clear security boundary between public and admin

**Implication:**
- Frontend uses anonymous key (limited by RLS policies)
- Admin uses API routes that invoke service role client
- All mutations go through Next.js API routes
- Cannot expose service role key in environment variables with `NEXT_PUBLIC_` prefix

**Implementation Rules:**
- Public: SELECT only on `products`, `variants`, `website_products`
- Admin: All operations via `supabaseAdmin` client in API routes
- Service role key stored as `SUPABASE_SERVICE_ROLE_KEY` (server-side only)
- Frontend revalidation triggered after admin mutations
- Test RLS policies manually with anonymous key in browser console

---

## 8. ISR Caching Strategy

**Decision:** Homepage cached for 5 minutes, product pages for 60 seconds, targeted revalidation on edits.

**Context:**
- Product data changes infrequently (admin-driven updates)
- Homepage needs fast load times
- Product details need reasonable freshness

**Reason:**
- Balance between performance and freshness
- Reduce database load (Supabase free tier limits)
- Instant load for repeat visitors
- Targeted revalidation ensures changes appear quickly

**Implication:**
- New products may take up to 5 minutes to appear on homepage
- Edited products may take up to 60 seconds to update (unless revalidated)
- Admin must manually trigger revalidation for immediate updates
- Cache misses still hit database

**Implementation Rules:**
- Homepage: `revalidate = 300` (5 minutes)
- Product pages: `revalidate = 60` (1 minute)
- Admin triggers revalidation API after mutations
- Revalidation targets specific product IDs when possible
- Provide "Clear Cache" button in admin for manual control

---

## 9. Variant Selector Presentation

**Decision:** Show dropdown for simple variants, buttons for option-based variants.

**Context:**
- Some products have structured options (Size, Color)
- Others have arbitrary variants (SKU + price only)
- UI must adapt to product type

**Reason:**
- Buttons better for 2-6 options with clear labels
- Dropdown better for many variants or space constraints
- Matches user expectations from e-commerce sites

**Implication:**
- Frontend logic must detect variant structure
- Button layout requires more space
- Dropdown always works as fallback

**Implementation Rules:**
- Use buttons if: `option_values` populated and ≤6 variants
- Use dropdown if: No `option_values` or >6 variants
- Dropdown format: "SKU - £XX.XX"
- Button format: Option label + price
- Always select first variant by default

---

## 10. No User Authentication

**Decision:** No login system, no user accounts, no authentication.

**Context:**
- Business model is enquiry-based, not transactional
- Admin access controlled via separate Vercel deployment
- Customers don't need to save data long-term

**Reason:**
- Massive reduction in complexity (no auth provider, password reset, email verification)
- Privacy-friendly (no personal data stored)
- Zero security surface for customer-facing site
- Faster development and maintenance

**Implication:**
- No saved carts across devices
- No order history
- No customer profiles or addresses
- Admin protection relies on Vercel deployment separation

**Implementation Rules:**
- Never build authentication into frontend
- Admin protected by Vercel URL obscurity and optional Vercel auth
- State management local to browser only
- Do not collect email addresses in database

---

## Future Decisions

When adding new features or modifying the system, document decisions here if they:
- Affect system architecture or data flow
- Introduce new external dependencies
- Change user workflows significantly
- Create constraints for future development
- Solve a non-obvious problem in a particular way

**Format:**
```
## X. Decision Name

**Decision:** [What was decided]

**Context:** [What situation led to this decision]

**Reason:** [Why this approach was chosen]

**Implication:** [What constraints or requirements this creates]

**Implementation Rules:** [Specific guidance for developers]
```
