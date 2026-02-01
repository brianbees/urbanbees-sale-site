# Urban Bees - Consolidated Project

**Created:** January 30, 2026  
**Consolidation:** Two separate codebases merged into organized structure

---

## 📁 Project Structure

This folder contains two related but separate Next.js applications:

```
001-RP-sale-site/
├── frontend/          # Customer-facing e-commerce website
├── admin/             # Backend product management tool
├── docs/              # Shared documentation
├── scripts/           # Utility scripts
├── consolidate.ps1    # Consolidation script
└── README.md          # This file
```

---

## 🚀 Quick Start

### Frontend (Customer Website)
```powershell
cd frontend
npm install
npm run dev
```
**Local:** http://localhost:3000  
**Production:** https://frontend-six-kappa-30.vercel.app  
**Preview/Testing:** https://frontend-six-kappa-30.vercel.app/preview

### Admin (Product Management)
```powershell
cd admin
npm install
npm run dev -- -p 3001
```
**Local:** http://localhost:3001  
**Production:** https://urbanbees-product-admin.vercel.app

---

## � Complete Workflow

### How the System Works

1. **Add Products** → Admin panel (https://urbanbees-product-admin.vercel.app)
   - Upload images (stored in Supabase Storage)
   - Add variants with pricing and stock

2. **Test Products** → Preview page (https://frontend-six-kappa-30.vercel.app/preview)
   - See products from database in real-time
   - Delete products with delete button (hover over product cards)
   - Click products to see detail page with image gallery
   - Click thumbnails to view different images

3. **Import Existing** → Click "📥 Import 69 Products" button on preview page
   - One-time import of original 69 products into database
   - Safe to run multiple times (skips duplicates)

4. **Deploy to Production** → Click "🚀 Deploy to Production" on preview page
   - Exports database → `products.ts` file
   - Main site rebuilds automatically (~30 seconds)
   - All products go live on https://frontend-six-kappa-30.vercel.app

---

## �📦 What's Inside

### Frontend Application
**Purpose:** Customer-facing e-commerce storefront  
**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Zustand, Supabase  
**Features:**
- Product catalog with categories
- Product detail pages with interactive image gallery
- Shopping cart (persistent)
- Checkout flow
- **Preview mode** - test database products before deploying
- **One-click deploy** - export database to production
- Supabase Storage image support
- 69+ product images

**Key Files:**
- `src/data/products.ts` - Product catalog (auto-generated from database)
- `src/components/Cart.tsx` - Shopping cart UI
- `src/components/ProductDisplay.tsx` - Interactive image gallery
- `src/store/cartStore.ts` - Cart state management
- `src/app/preview/page.tsx` - Preview/testing page
- `src/app/api/deploy-products/route.ts` - Export database to file
- `src/app/api/import-existing/route.ts` - Import static products to database
- `src/app/api/delete-product/route.ts` - Delete products from database
- `public/images/` - Product images

### Admin Application
**Purpose:** Backend tool for managing products  
**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Supabase  
**Features:**
- Add new products with mobile camera or gallery upload
- Edit existing products and variants
- Delete products
- Supabase database integration
- Type-safe database operations
- Responsive design for all devices

**Key Files:**
- `app/add-product/page.tsx` - Product creation form with pricing
- `app/edit-product/page.tsx` - Product editing form (supports URL params)
- `app/add-variant/page.tsx` - Variant creation form
- `lib/supabase.ts` - Database connection
- `types/database.ts` - Database schema types
- `.env.local` - Database credentials (⚠️ keep secure)

---

## ⚙️ Configuration

### Frontend Configuration
- **Port:** 3000 (default)
- **Data Source:** Static file (`src/data/products.ts`)
- **State Management:** Zustand (cart persistence)
- **No database required**

### Admin Configuration
- **Port:** 3001 (recommended to avoid conflict with frontend)
- **Data Source:** Supabase database
- **Environment Variables Required:**
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Setup Admin Credentials:**
1. Copy `.env.local.example` to `.env.local` (if exists)
2. Or create `admin/.env.local` with:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

---

## 📚 Documentation

All documentation is in the `docs/` folder:

### Schema & Architecture (NEW)
- **SCHEMA_ARCHITECTURE.md** - Complete data model documentation, table schemas, integration guide
- **AUDIT_SUMMARY.md** - Full schema audit report with all fixes applied

### Original Documentation
- **FIXES_SUMMARY.txt** - Log of 17 fixes applied to the frontend
- **IMAGE_MAPPING.md** - Complete product image reference
- **IMAGES_READY.md** - Image setup instructions
- **TODO.md** - Future feature requests
- **CONSOLIDATION_PLAN.md** - Detailed merge documentation
- **MANUAL_REVIEW_CHECKLIST.md** - Post-consolidation verification

**Important:** See `SCHEMA_ARCHITECTURE.md` for understanding how frontend (static data) and admin (database) systems work together.

---

## 🔧 Development

### Building for Production

**Frontend:**
```powershell
cd frontend
npm run build
npm run start
```

**Admin:**
```powershell
cd admin
npm run build
npm run start
```

### Linting
```powershell
# In either frontend/ or admin/
npm run lint
```

---

## 🖼️ Product Images

**Location:** `frontend/public/images/`  
**Count:** 69 product images  
**Format:** JPG

**Adding/Replacing Images:**
1. See `docs/IMAGE_MAPPING.md` for filename reference
2. Copy images to `frontend/public/images/`
3. Use exact filenames as documented
4. Recommended: 800-1200px width, < 500KB

---

## 🔐 Security Notes

### Files to Keep Secure
- ❌ **DO NOT commit** `admin/.env.local` to git
- ❌ **DO NOT share** Supabase credentials publicly
- ✅ **DO add** `.env.local` to `.gitignore`

### Git Setup
```powershell
# Initialize git (optional)
git init

# Check .gitignore includes:
# node_modules/
# .next/
# .env.local
# *.log
```

---

## 🚨 Common Issues

### Port Already in Use
```powershell
# Change port in package.json script:
"dev": "next dev -p 3001"
```

### Module Not Found
```powershell
# Reinstall dependencies
rm -r node_modules package-lock.json
npm install
```

### Supabase Connection Failed
- Check `.env.local` exists in `admin/`
- Verify credentials are correct
- Ensure no extra spaces/quotes around values
- Check Supabase project is active

### Images Not Loading
- Verify `frontend/public/images/` contains 69 images
- Check image filenames match exactly (case-sensitive)
- Run `scripts/copy-product-images.ps1` if needed

---

## 📊 Project Statistics

**Frontend:**
- ~30 TypeScript/TSX files
- 69 product images
- 823-line product catalog
- 17 documented fixes applied

**Admin:**
- ~8 TypeScript/TSX files
- Supabase integration
- 2 main features (add product, add variant)

**Combined:**
- ~127 unique files (excluding node_modules, builds)
- Zero file conflicts
- Complementary codebases

---

## 🔄 Deployment

### Frontend (Customer Site)
**Recommended:** Vercel, Netlify, or static hosting

```powershell
cd frontend
npm run build
# Deploy contents of .next/ or out/ directory
```

### Admin (Internal Tool)
**Recommended:** Vercel (with environment variables)
**Current Deployment:** https://urbanbees-product-admin.vercel.app

```powershell
cd admin
npx vercel --prod
# Environment variables automatically synced from Vercel project
```

---

## 🛠️ Maintenance

### Updating Dependencies
```powershell
# Check for updates
npm outdated

# Update all
npm update

# Update specific package
npm install package@latest
```

### Adding New Products (via Admin)
1. Run admin app
2. Navigate to "Add Product"
3. Fill in product details
4. Submit to Supabase

### Adding New Products (Static - Frontend Only)
1. Edit `frontend/src/data/products.ts`
2. Add product object to `products` array
3. Rebuild frontend

---

## 📞 Support

**Documentation:** See `docs/` folder  
**Consolidation Details:** See `CONSOLIDATION_PLAN.md`  
**Known Issues:** See `docs/FIXES_SUMMARY.txt`  
**Feature Requests:** See `docs/TODO.md`

---

## ✅ Status & Verification

**Last Updated:** January 30, 2026

### Schema Audit Complete ✅
- All data model mismatches resolved
- TypeScript types added for database operations
- Foreign key relationships validated
- Both applications build successfully

### Current State
- ✅ Frontend: Fully functional, 69 products, static data
- ✅ Admin: Type-safe, Supabase connected, schema aligned
- ✅ No compile errors or type mismatches
- ✅ Production builds verified
- ✅ Documentation complete

### Quick Health Check
```powershell
# Run type checks
cd admin && npx tsc --noEmit
cd frontend && npx tsc --noEmit

# Build for production
cd admin && npm run build
cd frontend && npm run build
```

All checks should pass with zero errors.

---

## 📝 Version History

- **v1.1** - January 30, 2026 - Schema audit & fixes
  - Added database type definitions (`admin/types/database.ts`)
  - Fixed UUID vs string ID mismatches
  - Removed duplicate file input fields
  - Added slug field to database inserts
  - Created comprehensive architecture docs
  - Validated all builds and type checks
  
- **v1.0** - January 30, 2026 - Initial consolidation
  - Merged `park_sales_website/urbanbees-website` (frontend - master)
  - Merged `rpsale/urbanbees-product-admin` (admin)
  - Zero conflicts, clean separation
  - All 17 frontend fixes preserved

---

**Status:** ✅ Ready for Development  
**Original Sources:** Preserved and untouched  
**Risk Level:** Low (no conflicts found)
