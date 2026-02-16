# Operations Guide

This document covers deployment, environment setup, troubleshooting, and operational procedures for the Urban Bees sale site.

**Last Updated:** February 16, 2026

---

## Environment Setup

### 1. Supabase Configuration

**Required:**
- Supabase project with PostgreSQL database
- Storage bucket: `product-images` (public access)
- Row-Level Security (RLS) enabled on all tables
- Service role key for admin operations

**Database Tables:**
- `products`: Product master data
- `variants`: Product variants (SKU, price, stock)
- `website_products`: Reference data for admin dropdowns

**RLS Policies:**
```sql
-- Public: Read-only access
CREATE POLICY "Public read access" ON products
  FOR SELECT USING (true);

CREATE POLICY "Public read access" ON variants
  FOR SELECT USING (true);

-- Admin: Full access via service role key (bypasses RLS)
```

**Verify RLS:**
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('products', 'variants', 'website_products');
```
All should show `rowsecurity = true`.

---

### 2. Environment Variables

**Admin Panel (`admin/.env.local`):**
```bash
# Supabase Connection (public)
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_publishable_key

# Service Role Key (server-side only)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Frontend (`frontend/.env.local`):**
```bash
# Supabase Connection (public)
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_publishable_key

# PayPal Integration
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_client_id
```

**Vercel Production Variables:**

Admin Panel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (NOT prefixed - server only)

Frontend:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_PAYPAL_CLIENT_ID`

**Critical:**
- Service role key must NOT have `NEXT_PUBLIC_` prefix
- Apply env vars to Production, Preview, and Development
- Redeploy after changing environment variables

---

### 3. Local Development Setup

**Clone Repository:**
```powershell
git clone https://github.com/brianbees/urbanbees-sale-site.git
cd urbanbees-sale-site
```

**Install Dependencies:**
```powershell
# Admin panel
cd admin
npm install

# Frontend
cd ../frontend
npm install
```

**Create Environment Files:**
- Copy `.env.example` to `.env.local` (if template exists)
- Add all required environment variables (see section above)

**Verify Connection:**
- Test Supabase URL and keys
- Check database tables exist
- Verify RLS policies active

---

### 4. Running Development Servers

**Admin Panel (port 3000):**
```powershell
cd admin
npm run dev
```
Access: http://localhost:3000

**Frontend (port 3001 to avoid conflict):**
```powershell
cd frontend
npm run dev -- -p 3001
```
Access: http://localhost:3001

**Port Already in Use:**
```powershell
npm run dev -- -p 3002
```

---

## Deployment

### 1. Automatic Deployment (Recommended)

**Setup:**
- GitHub repository connected to Vercel
- Auto-deploy enabled on `main` branch
- Environment variables configured in Vercel

**Process:**
1. Commit changes locally:
   ```powershell
   git add -A
   git commit -m "Description of changes"
   ```

2. Push to GitHub:
   ```powershell
   git push origin main
   ```

3. Vercel auto-detects push and deploys both apps
   - Admin: https://urbanbees-product-admin.vercel.app
   - Frontend: https://frontend-six-kappa-30.vercel.app

4. Monitor builds: https://vercel.com/brianbees-projects

**Timing:**
- Build time: 1-2 minutes per app
- DNS propagation: Immediate (Vercel edge network)
- Cache invalidation: Per app's ISR settings

---

### 2. Manual Deployment

**From workspace root:**
```powershell
# Deploy admin
cd admin
npx vercel --prod --yes

# Deploy frontend
cd ../frontend
npx vercel --prod --yes
```

**Via VS Code Tasks:**
- Open Command Palette (Ctrl+Shift+P)
- Select "Tasks: Run Task"
- Choose "Deploy Admin to Vercel" or "Deploy Frontend to Vercel"

---

### 3. Post-Deployment Verification

**Admin Panel:**
1. Navigate to https://urbanbees-product-admin.vercel.app
2. Create or edit a test product
3. Verify images upload successfully
4. Check variant management works

**Frontend:**
1. Navigate to https://frontend-six-kappa-30.vercel.app
2. Verify products display correctly
3. Test add-to-cart functionality
4. Check stock validation works
5. Test email/download features

**If Changes Don't Appear:**
- Wait 5 minutes for cache expiration (homepage)
- Use admin "Clear Cache" button on preview page
- Manually trigger revalidation via admin operations

---

## Troubleshooting

### Products Not Appearing on Frontend

**Symptoms:**
- Product created in admin
- Shows in admin panel
- Not visible on frontend after several minutes

**Solutions:**
1. **Wait for cache expiration** (5 minutes for homepage)
2. **Manual cache clear:**
   - Admin panel → Preview page
   - Click "Clear Cache" button
3. **Check Supabase directly:**
   - Open Supabase dashboard
   - Verify product exists in `products` table
   - Check `images` array is populated
4. **Verify RLS policies:**
   - Test SELECT query with anonymous key
   - Ensure public read access enabled

---

### Admin Cannot Create/Edit Products (401 Error)

**Symptoms:**
- "Unauthorized" or 401 errors in admin panel
- Changes don't save
- Console shows authentication errors

**Solutions:**
1. **Check service role key in Vercel:**
   - Variable name: `SUPABASE_SERVICE_ROLE_KEY` (no `NEXT_PUBLIC_` prefix)
   - Variable value: Correct service role key from Supabase project settings
   - Applied to: Production, Preview, Development
2. **Redeploy admin after env var changes:**
   - Go to Vercel dashboard
   - Select admin project
   - Click "Redeploy" (not just "Redeploy with existing build")
3. **Verify in local dev:**
   - Check `admin/.env.local` has `SUPABASE_SERVICE_ROLE_KEY`
   - Restart dev server after adding

---

### Images Not Loading

**Symptoms:**
- Product images show broken image icon
- Image URLs return 404
- Console shows network errors

**Solutions:**
1. **Check Next.js image configuration:**
   - Verify `next.config.ts` has Supabase `remotePatterns`
   ```typescript
   images: {
     remotePatterns: [
       {
         protocol: 'https',
         hostname: '[project].supabase.co',
       },
     ],
   }
   ```
2. **Verify Supabase Storage:**
   - Check `product-images` bucket exists
   - Verify bucket is public
   - Test image URL directly in browser
3. **Check image upload succeeded:**
   - Admin should show success message after upload
   - Image should appear in product gallery
   - Check Supabase Storage dashboard for uploaded files
4. **Verify URL format:**
   - Should start with `https://[project].supabase.co/storage/v1/object/public/`
   - Should include bucket name and file path

---

### Add to Cart Timeout

**Symptoms:**
- "Request timed out" error after clicking "Add to Cart"
- Button shows loading state then fails
- No items added to cart

**Solutions:**
1. **Check Supabase connection:**
   - Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
   - Test direct database query in browser console
2. **Check API route:**
   - Verify `/api/check-stock` exists in frontend
   - Test endpoint directly: `POST /api/check-stock` with `{ variantId, requestedQuantity }`
3. **Check variant exists:**
   - Verify variant ID is valid
   - Check `variants` table in Supabase for entry
4. **Network issues:**
   - Test with different network
   - Check browser console for CORS errors
   - Verify Supabase project is not paused (free tier)

---

### Stock Validation Errors

**Symptoms:**
- "Not enough stock" errors when stock exists
- Can't add items with available quantity
- Stock warnings incorrect

**Solutions:**
1. **Verify stock in database:**
   - Check `variants` table in Supabase
   - Confirm `stock_qty` column has correct value
2. **Check cart-aware logic:**
   - Empty cart and try again
   - May have items already in cart that consume available stock
3. **Clear LocalStorage:**
   - Browser DevTools → Application → LocalStorage
   - Delete cart state
   - Refresh page
4. **Verify variant mapping:**
   - Ensure product has variants defined
   - Check variant IDs match between frontend and database

---

### Cache Issues

**Symptoms:**
- Changes not appearing after 5+ minutes
- Old product data shown
- Revalidation not working

**Solutions:**
1. **Manual revalidation:**
   - Admin preview page → "Clear Cache" button
   - Or call `/api/revalidate` directly
2. **Check revalidation API:**
   - Verify `frontend/app/api/revalidate/route.ts` exists
   - Test endpoint: `POST /api/revalidate` with `{ productId }`
3. **Verify ISR configuration:**
   - Homepage: `export const revalidate = 300`
   - Product pages: `export const revalidate = 60`
4. **Hard refresh:**
   - Ctrl+Shift+R (Windows)
   - Cmd+Shift+R (Mac)
   - Clears browser cache and reloads

---

### Build Failures

**Symptoms:**
- Vercel deployment fails
- TypeScript compilation errors
- Lint errors blocking build

**Solutions:**
1. **Check build logs:**
   - Vercel dashboard → Deployments → Select failed build
   - Read error messages carefully
2. **Test build locally:**
   ```powershell
   npm run build
   ```
   Reproduces same errors as Vercel
3. **Type checking:**
   ```powershell
   npm run type-check
   ```
   Or `npx tsc --noEmit`
4. **Lint errors:**
   ```powershell
   npm run lint
   ```
   Fix reported issues
5. **Dependency issues:**
   ```powershell
   rm -rf node_modules package-lock.json
   npm install
   ```

---

## Monitoring

### Performance Metrics

**Check Core Web Vitals:**
1. Open Chrome DevTools
2. Lighthouse tab → Run audit
3. Target scores:
   - Performance: 90+
   - SEO: 90+
   - Accessibility: 90+

**Monitor image loading:**
1. DevTools → Network tab → Img filter
2. Check file sizes:
   - Thumbnails: 20-80KB
   - Full images: 200-500KB
3. Verify thumbnail transformations applied (URL params visible)

---

### Database Health

**Check table sizes:**
```sql
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

**Check RLS status:**
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

**Monitor storage usage:**
- Supabase dashboard → Storage
- Check `product-images` bucket size
- Free tier: 1GB limit

---

### Error Monitoring

**Check Vercel logs:**
1. Vercel dashboard → Project → Logs
2. Filter by error severity
3. Look for patterns in failures

**Frontend console errors:**
- Open browser DevTools
- Console tab
- Look for red errors
- Check Network tab for failed requests

**Admin console errors:**
- Test product operations
- Watch for API failures
- Verify revalidation calls succeed

---

## Maintenance Tasks

### Regular Checks (Monthly)

- **Supabase storage:** Review image usage vs limits
- **Database size:** Check table growth
- **Vercel bandwidth:** Monitor data transfer
- **Broken images:** Scan for 404s
- **Cache performance:** Review hit rates

### Backup Procedures

**Database:**
- Supabase provides automated daily backups (paid plans)
- Export data manually: Supabase → Database → Export

**Images:**
- Download from Supabase Storage bucket
- Store backup locally or in secondary cloud storage

**Code:**
- GitHub repository serves as version control
- Vercel maintains deployment history

---

## Common Operations

### Clear All Caches

```powershell
# Via admin
# Open preview page → Click "Clear Cache"

# Via API
curl -X POST https://frontend-six-kappa-30.vercel.app/api/revalidate
```

### Bulk Product Update

1. Export products from Supabase:
   ```sql
   SELECT * FROM products;
   ```
2. Modify data in CSV/spreadsheet
3. Import updated data via SQL:
   ```sql
   UPDATE products SET 
     name = '...',
     category = '...'
   WHERE id = '...';
   ```
4. Trigger revalidation for all products

### Emergency Rollback

1. Vercel dashboard → Deployments
2. Find last working deployment
3. Click "Promote to Production"
4. Rollback completes in ~30 seconds

---

## Security Checks

### Verify RLS Protection

**Test in browser console (frontend):**
```javascript
// Should succeed (public read)
const { data } = await supabaseClient.from('products').select('*');

// Should fail (no public write)
await supabaseClient.from('products').delete().eq('id', 'test-id');
```

**Expected:**
- SELECT: Returns data
- DELETE/UPDATE/INSERT: Error or no effect

### Verify Service Role Key Security

**Check environment variables:**
- Vercel: `SUPABASE_SERVICE_ROLE_KEY` (no `NEXT_PUBLIC_` prefix)
- Local: `admin/.env.local` has key
- Frontend: Should NOT have service role key

**Check code:**
- Service role only used in API routes
- Never exposed to client bundles
- Never passed as prop or state

---

## Support Resources

**Supabase Dashboard:**
- Access via your Supabase project
- Database editor, Storage manager, API logs

**Vercel Dashboard:**
- Project deployments and builds
- Environment variables
- Domain and SSL settings

**GitHub Repository:**
- Issues: https://github.com/brianbees/urbanbees-sale-site/issues
- Code: https://github.com/brianbees/urbanbees-sale-site

**Documentation:**
- `README.md`: High-level overview
- `WORKFLOWS.md`: User and admin flows
- `DESIGN_DECISIONS.md`: Architectural decisions
- `OPERATIONAL_RULES.md`: Development rules
- `CHANGELOG.md`: Version history
