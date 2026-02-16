# Operational Rules

This document defines mandatory rules for future development. Follow these guidelines to maintain system consistency, performance, and architectural integrity.

**Last Updated:** February 16, 2026

---

## Image Management Rules

### Rule 1: Use Thumbnail Transformations for All Product Images

**When building product displays, always apply appropriate thumbnail sizes based on display context.**

**Sizes Available:**
- `tiny`: 80px @ 70% quality (compact lists, print page)
- `small`: 150px @ 75% quality (cards, gallery thumbnails, cart)
- `medium`: 250px @ 80% quality (grid view)
- `large`: 400px @ 80% quality (featured displays)
- Full resolution: No transformation (product detail main image only)

**Usage:**
```typescript
import { thumbnailSizes } from '@/lib/image-utils';

// Compact lists, print page
<img src={thumbnailSizes.tiny(imageUrl)} />

// Standard cards, cart, wishlist
<img src={thumbnailSizes.small(imageUrl)} />

// Grid view
<img src={thumbnailSizes.medium(imageUrl)} />

// Full product image
<img src={imageUrl} />
```

**Never:**
- Load full-resolution images for thumbnails
- Rely on CSS to resize images (doesn't reduce file size)
- Apply transformations to URLs stored in state (apply at render time)

**Why:**
- 70-90% reduction in data transfer
- Faster page loads and scroll performance
- Better mobile experience
- Lower bandwidth costs

---

### Rule 2: Store Original URLs in State

**When saving image URLs to cart/wishlist state or database, always store original URLs.**

**Correct:**
```typescript
// State
const item = {
  productId: '123',
  image: 'https://url/image.jpg', // Original URL
  quantity: 1
};

// Apply transformation at render time
<img src={thumbnailSizes.small(item.image)} />
```

**Incorrect:**
```typescript
// Don't do this
const item = {
  image: 'https://url/image.jpg?width=150&quality=75' // Transformed URL
};
```

**Why:**
- Flexibility to change thumbnail strategy later
- Different contexts need different sizes
- Easier to debug and maintain
- Database stores canonical URLs

---

### Rule 3: Compress All Admin Uploads

**When processing image uploads in admin panel, always compress before uploading to Supabase.**

**Rules:**
- Max dimension: 1920px (maintain aspect ratio)
- Quality: 85% JPEG compression
- Format: JPEG only (convert PNG/WEBP if needed)
- Process client-side using HTML5 Canvas

**Implementation:**
```typescript
import { compressImage } from '@/lib/image-utils';

const compressedBlob = await compressImage(file);
// Upload compressedBlob to Supabase
```

**Why:**
- Reduces storage costs
- Faster uploads and downloads
- Consistent file sizes
- Sufficient quality for e-commerce

---

## Performance Rules

### Rule 4: Respect ISR Cache Times

**When fetching data in page components, configure appropriate revalidation intervals.**

**Cache Times:**
- Homepage (`/`): 300 seconds (5 minutes)
- Product pages (`/product/[id]`): 60 seconds (1 minute)
- Static content: Can be longer (15-60 minutes)

**Implementation:**
```typescript
// app/page.tsx
export const revalidate = 300;

// app/product/[id]/page.tsx
export const revalidate = 60;
```

**When to Revalidate:**
- After admin product mutations → Call `/api/revalidate`
- After image edits → Call `/api/revalidate`
- After bulk operations → Clear entire cache

**Never:**
- Set `revalidate = 0` (disables ISR benefits)
- Set cache times longer than data change frequency
- Forget to trigger revalidation after mutations

**Why:**
- Balances performance vs freshness
- Reduces database load
- Provides instant load for repeat visitors
- Targeted revalidation ensures changes appear quickly

---

### Rule 5: Implement Timeouts for External Requests

**When calling external APIs or performing async operations, always implement timeouts.**

**Timeouts:**
- Add to cart: 5 seconds
- Stock checks: 3 seconds
- URL shortening: 5 seconds
- Image uploads: 30 seconds

**Implementation:**
```typescript
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 5000);

try {
  const response = await fetch(url, { signal: controller.signal });
  clearTimeout(timeout);
} catch (error) {
  if (error.name === 'AbortError') {
    // Handle timeout
  }
}
```

**Why:**
- Prevents indefinite hangs
- Better user experience (clear error messages)
- Allows user to retry
- Protects against network issues

---

### Rule 6: Use Next/Image for All Product Images

**When rendering product images in React components, always use Next/Image component.**

**Correct:**
```typescript
import Image from 'next/image';

<Image 
  src={thumbnailSizes.small(imageUrl)} 
  alt={productName}
  width={150}
  height={150}
  sizes="(max-width: 768px) 100vw, 150px"
/>
```

**Exceptions:**
- Print page (use `<img>` for better print compatibility)
- Emails (Next/Image not supported)

**Why:**
- Automatic lazy loading
- Responsive image optimization
- Priority loading for above-fold content
- Better Core Web Vitals scores

---

## Data Access Rules

### Rule 7: Use Service Role Key Only in API Routes

**When performing write operations (INSERT, UPDATE, DELETE), always use service role key in server-side API routes.**

**Server-Side (Correct):**
```typescript
// app/api/update-product/route.ts
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  const { id, name } = await request.json();
  const { data, error } = await supabaseAdmin
    .from('products')
    .update({ name })
    .eq('id', id);
  // ...
}
```

**Client-Side (Incorrect):**
```typescript
// Never expose service role key to client
const supabase = createClient(url, serviceRoleKey); // Don't do this
```

**Environment Variables:**
- `NEXT_PUBLIC_SUPABASE_URL` - Client and server
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Client and server
- `SUPABASE_SERVICE_ROLE_KEY` - Server only (no `NEXT_PUBLIC_` prefix)

**Why:**
- Security: Service role bypasses RLS
- Separation of concerns: Frontend is read-only
- Clear audit trail: All writes go through API routes
- Prevents malicious client-side operations

---

### Rule 8: Validate Stock Server-Side

**When checking product availability, always validate stock quantities server-side.**

**Flow:**
1. Frontend calls `/api/check-stock` with `variantId` and `requestedQuantity`
2. Backend queries Supabase directly
3. Backend returns `{ available: boolean, stock_qty: number }`
4. Frontend uses result to permit/deny operation

**Never:**
- Trust client-side stock data
- Allow cart operations without stock validation
- Cache stock quantities client-side for long periods

**Why:**
- Prevents overselling
- Ensures data consistency
- Protects against race conditions
- Multiple users can't exceed stock

---

### Rule 9: Use Cart-Aware Stock Validation

**When validating stock, always consider items already in user's cart.**

**Implementation:**
```typescript
// Frontend
const cartQuantity = cart.items
  .filter(item => item.variantId === variantId)
  .reduce((sum, item) => sum + item.quantity, 0);

const availableForUser = stockQty - cartQuantity;
```

**Why:**
- Prevents adding more than available stock
- Accounts for user's existing selections
- Better error messages ("You already have 3 in your cart")

---

## State Management Rules

### Rule 10: Keep Cart and Wishlist State Minimal

**When storing cart/wishlist items, store only essential data: IDs and quantities.**

**Correct:**
```typescript
interface CartItem {
  productId: string;
  variantId: string;
  quantity: number;
  image: string;        // For display only
}
```

**Incorrect:**
```typescript
interface CartItem {
  productId: string;
  variantId: string;
  quantity: number;
  name: string;         // Fetch from database
  price: number;        // Fetch from database
  description: string;  // Fetch from database
  category: string;     // Fetch from database
}
```

**Why:**
- State stays synchronized with database
- Price changes don't create stale data
- Smaller LocalStorage footprint
- Simpler state updates

---

### Rule 11: Validate State on Render

**When displaying cart/wishlist items, always fetch current data from Supabase.**

**Flow:**
1. Read cart state for `productId` and `variantId`
2. Query Supabase for current product/variant data
3. Display current price, name, stock
4. Show error if product/variant no longer exists

**Never:**
- Display prices from LocalStorage
- Assume products still exist
- Skip stock validation before checkout

**Why:**
- Prevents outdated pricing
- Handles deleted products gracefully
- Ensures accurate stock information

---

## Security Rules

### Rule 12: Never Expose Service Role Key to Client

**Service role key must only exist in server-side code and environment variables without `NEXT_PUBLIC_` prefix.**

**Environment Setup:**
```bash
# .env.local (correct)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# .env.local (incorrect)
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # Don't do this
```

**Code:**
- Import `supabaseAdmin` from `@/lib/supabase` in API routes only
- Never import in client components
- Never pass service role key as prop

**Why:**
- Service role bypasses RLS
- Client code is visible to users
- Prevents unauthorized database operations

---

### Rule 13: Test RLS Policies

**When modifying database schema or RLS policies, always test with anonymous key.**

**Testing Process:**
1. Open browser console on frontend
2. Try unauthorized operations:
   ```javascript
   // Should fail
   await supabaseClient.from('products').delete().eq('id', 'some-id');
   ```
3. Verify SELECT works:
   ```javascript
   // Should succeed
   const { data } = await supabaseClient.from('products').select('*');
   ```

**Expected Results:**
- SELECT: Success (public read access)
- INSERT, UPDATE, DELETE: Failure (admin only)

**Why:**
- Ensures security policies are working
- Catches accidental policy changes
- Verifies RLS is enabled on tables

---

## UI/UX Rules

### Rule 14: Provide Loading States for Async Operations

**When performing async operations (add to cart, save product, upload images), always show loading states.**

**Requirements:**
- Disable button during operation
- Show loading text ("Adding to Cart...")
- Display spinner or loading indicator
- Prevent duplicate clicks

**Implementation:**
```typescript
const [loading, setLoading] = useState(false);

async function handleAddToCart() {
  if (loading) return;
  setLoading(true);
  try {
    // Perform operation
  } finally {
    setLoading(false);
  }
}

<button disabled={loading}>
  {loading ? 'Adding to Cart...' : 'Add to Cart'}
</button>
```

**Why:**
- Clear feedback to user
- Prevents confusion during delays
- Avoids duplicate operations
- Better perceived performance

---

### Rule 15: Show Clear Error Messages

**When operations fail, display specific, actionable error messages.**

**Good Error Messages:**
- "Not enough stock available (3 remaining)"
- "Request timed out. Please try again."
- "Failed to save changes. Check your connection."
- "Image upload failed. File may be too large."

**Bad Error Messages:**
- "Error"
- "Something went wrong"
- "Operation failed"
- Silent failures

**Implementation:**
```typescript
catch (error) {
  if (error.name === 'AbortError') {
    setError('Request timed out. Please try again.');
  } else if (error.message.includes('stock')) {
    setError(`Not enough stock available (${stockQty} remaining)`);
  } else {
    setError('Failed to add to cart. Please try again.');
  }
}
```

**Why:**
- Users understand what went wrong
- Clear path to resolution
- Reduces support requests
- Better user experience

---

### Rule 16: Maintain Fallback Contact Methods

**When implementing contact features, always provide multiple fallback methods.**

**Required Methods:**
- Primary: mailto: link
- Fallback 1: Download text file
- Fallback 2: Visible email address (copyable)
- Fallback 3: Manual data display

**Never:**
- Rely solely on mailto: (blocked on many corporate PCs)
- Hide email address completely
- Provide only one contact method

**Why:**
- Ensures customers can always reach seller
- Accommodates locked-down environments
- Provides audit trail (downloaded files)
- Reduces lost enquiries

---

## Architecture Rules

### Rule 17: Keep Frontend Read-Only

**Frontend should only perform read operations directly against Supabase. All writes go through API routes.**

**Frontend (Read):**
```typescript
const { data: products } = await supabaseClient
  .from('products')
  .select('*');
```

**Backend (Write):**
```typescript
const { data } = await supabaseAdmin
  .from('products')
  .insert({ name: 'New Product' });
```

**Why:**
- Clear separation of concerns
- Easier to audit and secure
- Centralized business logic
- Consistent error handling

---

### Rule 18: Trigger Revalidation After Mutations

**After any admin mutation, always call the frontend revalidation API.**

**Implementation:**
```typescript
// After successful mutation
await fetch(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/revalidate`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ productId })
});
```

**When to Revalidate:**
- Product created/updated/deleted
- Variant created/updated/deleted
- Image edited/uploaded/deleted
- Any data change visible to customers

**Why:**
- Changes appear immediately on frontend
- No waiting for cache expiration
- Better admin experience
- Ensures data consistency

---

### Rule 19: Use Targeted Revalidation When Possible

**When revalidating frontend cache, pass specific productId for targeted invalidation.**

**Targeted (Preferred):**
```typescript
await fetch('/api/revalidate', {
  method: 'POST',
  body: JSON.stringify({ productId: '123' })
});
// Revalidates: /, /product/123
```

**Full Cache Clear (Last Resort):**
```typescript
await fetch('/api/revalidate', {
  method: 'POST'
});
// Revalidates: / only
```

**Why:**
- Faster revalidation
- Less database load
- More predictable behavior
- Other products stay cached

---

## Code Quality Rules

### Rule 20: Use TypeScript Strictly

**All code must pass TypeScript strict mode compilation with no errors.**

**Requirements:**
- Define interfaces for all data structures
- No `any` types without explicit justification
- Type all function parameters and returns
- Use database types from `types/database.ts`

**Why:**
- Catches errors at compile time
- Self-documenting code
- Better IDE support
- Easier refactoring

---

### Rule 21: Follow Consistent Naming Conventions

**Use consistent naming across the codebase.**

**Conventions:**
- Components: PascalCase (`ProductCard.tsx`)
- Functions: camelCase (`getThumbnailUrl`)
- Constants: SCREAMING_SNAKE_CASE (`MAX_IMAGE_SIZE`)
- Files: kebab-case for non-components (`image-utils.ts`)
- Database tables: snake_case (`product_images`)

**Why:**
- Easier to navigate codebase
- Clear distinction between types
- Follows community standards

---

## Testing Rules

### Rule 22: Test Happy Path and Edge Cases

**When implementing new features, test both successful flows and failure scenarios.**

**Required Tests:**
- Happy path: Feature works as intended
- Empty state: No data exists
- Null/undefined: Missing required fields
- Network failure: API calls fail
- Timeout: Operations take too long
- Validation failure: Invalid input

**Why:**
- Prevents production bugs
- Handles edge cases gracefully
- Better user experience
- Reduces support burden

---

## Documentation Rules

### Rule 23: Update Documentation When Changing Workflows

**When modifying user or admin workflows, update the relevant documentation.**

**Documents to Update:**
- `WORKFLOWS.md`: Changed user/admin flows
- `DESIGN_DECISIONS.md`: New architectural decisions
- `OPERATIONAL_RULES.md`: New development rules
- `CHANGELOG.md`: Version history

**Format:**
- Describe current behavior, not history
- Focus on what and why, not how
- Use clear, action-oriented language
- Include context and implications

**Why:**
- Keeps documentation accurate
- Prevents regression
- Helps future developers
- Maintains system knowledge

---

## Adding New Rules

When creating new operational rules:
1. Ensure rule is broadly applicable (not one-off situation)
2. Explain "why" not just "what"
3. Provide code examples
4. Note exceptions if any
5. Link to design decisions if relevant

**Format:**
```
### Rule X: [Clear Rule Title]

**[One sentence summary of the rule]**

**Implementation:** [Code example or specific guidance]

**Why:** [Reasoning behind the rule]
```
