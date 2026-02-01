# Supabase Row Level Security Setup

## ⚠️ IMPORTANT: Enable RLS Policies

Your Supabase tables currently allow public read/write access. This is a security risk.

### Steps to Enable RLS:

1. **Visit Supabase Dashboard:**
   https://supabase.com/dashboard/project/pdovgefwzxfawuyngrke/auth/policies

2. **Enable RLS on tables:**
   - Click on `products` table
   - Click "Enable RLS"
   - Repeat for `variants` table

3. **Create Policies:**

#### Products Table - Allow Public Read, No Write:
```sql
-- Allow everyone to read products
CREATE POLICY "Public products are viewable" ON products
FOR SELECT USING (true);

-- No public insert/update/delete policies = admin-only via service key
```

#### Variants Table - Same pattern:
```sql
-- Allow everyone to read variants
CREATE POLICY "Public variants are viewable" ON variants
FOR SELECT USING (true);
```

### For Admin Operations:

Your admin panel should use a **service role key** (not anon key) for:
- Creating products
- Updating products
- Deleting products

**Add to admin/.env.local:**
```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

Get your service role key from:
https://supabase.com/dashboard/project/pdovgefwzxfawuyngrke/settings/api

### Test After Enabling:

1. Frontend should still load products ✅
2. Try using browser console to delete a product - should fail ✅
3. Admin panel operations should still work ✅

---

## ✅ Setup Complete (Feb 1, 2026)

**Status:** RLS ENABLED - Database is now secured

**What was configured:**
- ✅ RLS enabled on products, variants, website_products tables
- ✅ Public read-only policies created (SELECT only)
- ✅ Service role key added to admin panel
- ✅ Admin operations use elevated permissions
- ✅ Vercel environment variable configured

**Security Status:**
- 🔒 Public users: Read-only access
- 🔒 Admin panel: Full CRUD with service role key
- 🔒 Frontend: Read-only with anon key
