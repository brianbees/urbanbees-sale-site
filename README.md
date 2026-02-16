# Urban Bees Sale Site

A modern e-commerce platform for beekeeping equipment with full-featured admin panel and customer storefront.

**Version:** 3.4.0  
**Last Updated:** February 16, 2026

## 🚀 Quick Links

- **Admin Panel:** https://urbanbees-product-admin.vercel.app
- **Customer Site:** https://frontend-six-kappa-30.vercel.app
- **Repository:** https://github.com/brianbees/urbanbees-sale-site
- **Documentation:** [docs/](docs/)

## 📁 Project Structure

```
├── admin/          # Product management admin panel (Next.js 16)
├── frontend/       # Customer-facing storefront (Next.js 16)
├── docs/          # Comprehensive documentation
│   ├── FEATURES.md                    # Complete feature list
│   ├── CHANGELOG.md                   # Version history
│   ├── TODO.md                        # Planned features
│   ├── PROJECT_AUDIT_2026-02-01.md    # Code quality audit
│   └── SCHEMA_ARCHITECTURE.md         # Database schema
└── scripts/       # Utility scripts

```

## 🛠 Tech Stack

### Frontend
- **Framework:** Next.js 16.1.5 (App Router + Turbopack)
- **React:** 19.x with TypeScript (strict mode)
- **Styling:** Tailwind CSS 4
- **State:** Zustand (cart, wishlist)
- **Payments:** PayPal SDK
- **Images:** Next/Image + Supabase Storage CDN

### Backend
- **Database:** Supabase PostgreSQL with RLS
- **Storage:** Supabase Storage (product-images bucket)
- **APIs:** Next.js API routes (server-side)
- **Image Processing:** HTML5 Canvas API + is.gd URL shortener

### Deployment
- **Hosting:** Vercel (auto-deploy from main branch)
- **CDN:** Vercel Edge Network + Supabase CDN
- **Caching:** ISR (5-min homepage, 60s product pages)

## ✨ Key Features (v3.1.0)

### Admin Panel
- ✅ **Variant Management** (add/remove variants to products)
- ✅ **Image Editing Tools** (crop + rotate) built-in
- ✅ **Hero Image Management** (promote any image to hero)
- ✅ **Drag-and-Drop Reordering** for gallery images
- ✅ **Automatic URL Shortening** in descriptions (is.gd)
- ✅ **Image Compression** (max 1920px, 85% JPEG quality)
- ✅ **Inline Variant Management** (SKU, price, stock)
- ✅ **Live Preview** with clickable links
- ✅ **Immediate Persistence** (edited images save instantly)

### Customer Frontend
- ✅ **Smart Variant Selector** (dropdown or buttons based on product)
- ✅ **Newest First Sorting** (default)
- ✅ **Smart Add-to-Cart** (loading states, timeouts, error handling)
- ✅ **Clickable Links Everywhere** (URLs, mailto in descriptions)
- ✅ **Download Order Summary** (text file fallback for email)
- ✅ **Real-Time Stock Validation** (cart-aware)
- ✅ **Wishlist with Persistence** (LocalStorage)
- ✅ **PayPal Checkout** integration
- ✅ **Responsive Design** (mobile/tablet/desktop)
- ✅ **Search & Filter** (whole-word matching, category filter)
- ✅ **eBay-Style Layout** (image left, details right)

## 📚 Documentation

Comprehensive documentation in [docs/](docs/):
- **[FEATURES.md](docs/FEATURES.md)** - Complete feature documentation with workflows
- **[CHANGELOG.md](docs/CHANGELOG.md)** - Version history (semantic versioning)
- **[TODO.md](docs/TODO.md)** - Recent updates and planned features
- **[PROJECT_AUDIT.md](docs/PROJECT_AUDIT_2026-02-01.md)** - Code quality audit and resolutions
- **[SCHEMA_ARCHITECTURE.md](docs/SCHEMA_ARCHITECTURE.md)** - Database schema details

## 🗄 Database

**Provider:** Supabase PostgreSQL with Storage  
**Dashboard:** Access via your Supabase project dashboard

### Tables

**`products`**
```sql
id UUID PRIMARY KEY
name TEXT NOT NULL
slug TEXT
category TEXT
description TEXT
images TEXT[]  -- Supabase Storage URLs
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

**`variants`**
```sql
id UUID PRIMARY KEY
product_id UUID REFERENCES products(id)
sku TEXT
price NUMERIC NOT NULL
stock_qty INTEGER NOT NULL
product_name TEXT  -- Denormalized for CSV exports
option_values JSONB
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

### Storage

**Bucket:** `product-images` (public access)  
**Format:** JPEG, max 1920px width, 85% quality  
**CDN:** Global delivery via Supabase edge network

### Security (Row-Level Security)

**Public Access:** Read-only (SELECT via anon key)  
**Admin Access:** Full CRUD (via service role key in API routes)

**Verify RLS status:**
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('products', 'variants');
-- rowsecurity should be TRUE
```

**Setup documentation:** See [SUPABASE_RLS_SETUP.md](docs/SUPABASE_RLS_SETUP.md)

## ⚙️ Environment Variables

### Admin Panel (`admin/.env.local`)
```bash
# Supabase Connection (required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_publishable_key_here

# Service Role Key (server-side API routes only - never expose to client)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Frontend (`frontend/.env.local`)
```bash
# Supabase Connection (required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_publishable_key_here

# PayPal Integration (required for checkout)
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_client_id_here
```

### Vercel Environment Variables (Production)

**Admin Panel:**
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `SUPABASE_SERVICE_ROLE_KEY` (NOT prefixed with NEXT_PUBLIC)

**Frontend:**
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `NEXT_PUBLIC_PAYPAL_CLIENT_ID`

**Security Note:** Service role key bypasses RLS. Only use server-side (API routes). Never add `NEXT_PUBLIC_` prefix to service role key.

## 🚀 Development

### Initial Setup

1. **Clone repository**
   ```bash
   git clone https://github.com/brianbees/urbanbees-sale-site.git
   cd urbanbees-sale-site
   ```

2. **Install dependencies**
   ```bash
   # Admin panel
   cd admin
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

3. **Configure environment variables**
   - Create `admin/.env.local` (see Environment Variables section)
   - Create `frontend/.env.local` (see Environment Variables section)

4. **Verify Supabase connection**
   - Test admin: http://localhost:3000
   - Test frontend: http://localhost:3001

### Run Development Servers

**Admin Panel (port 3000)**
```bash
cd admin
npm run dev
```

**Frontend (port 3001 - avoid conflict)**
```bash
cd frontend
npm run dev -- -p 3001
```

**Access locally:**
- Admin: http://localhost:3000
- Frontend: http://localhost:3001

### Build Commands
```bash
# Production build (in each app folder)
npm run build

# Type checking
npm run type-check

# Linting
npm run lint
```

## 📦 Deployment

### Automatic Deployment (Recommended)

**Setup:** GitHub → Vercel integration configured

1. Push changes to `main` branch
   ```bash
   git push origin main
   ```

2. Vercel auto-builds and deploys both apps
   - Admin: https://urbanbees-product-admin.vercel.app
   - Frontend: https://frontend-six-kappa-30.vercel.app

3. Monitor builds at https://vercel.com/brianbees-projects

### Manual Deployment

**From workspace root:**
```bash
# Deploy admin panel
cd admin
npx vercel --prod --yes

# Deploy frontend
cd ../frontend
npx vercel --prod --yes
```

**Via VS Code tasks:**
- Command Palette → "Tasks: Run Task"
- Select "Deploy Admin to Vercel" or "Deploy Frontend to Vercel"

### Post-Deployment Verification

1. **Admin Panel** - Create/edit test product
2. **Frontend** - Verify product appears (may take 5 min for cache)
3. **Clear cache** - Use preview page "Clear Cache" button if needed

## 🔧 Key Technologies

- **Next.js 16.1.5** - React framework with App Router + Turbopack
- **TypeScript** - Strict mode enabled
- **Tailwind CSS 4** - Utility-first styling
- **Supabase** - PostgreSQL + Storage + RLS
- **Zustand** - Client-side state management
- **PayPal SDK** - Payment processing
- **HTML5 Canvas** - Client-side image editing (crop/rotate)
- **is.gd API** - Automatic URL shortening

## 📝 Recent Updates

**Version 3.1.0** (Feb 13, 2026) - See [CHANGELOG.md](docs/CHANGELOG.md) for details

- Variant management (add/delete variants in admin)
- Image editing tools (crop + rotate)
- Hero image promotion
- Automatic URL shortening (is.gd)
- Add-to-cart improvements (loading states, timeouts)
- Smart variant selector (dropdown or buttons)
- Default "Newest First" sorting

## 🔧 Troubleshooting

**Products not appearing on frontend after creation:**
- Wait 5 minutes for cache to expire, or
- Use preview page "Clear Cache" button

**Admin can't create/edit products (401 error):**
- Verify `SUPABASE_SERVICE_ROLE_KEY` in Vercel environment variables
- Key should NOT have `NEXT_PUBLIC_` prefix
- Redeploy admin after changing env vars

**Images not loading:**
- Check `next.config.ts` has Supabase `remotePatterns`
- Verify image URLs start with your Supabase project URL

**Local dev: Port already in use:**
```bash
# Use different port
npm run dev -- -p 3002
```

## 🐛 Known Issues

See [TODO.md](docs/TODO.md) for planned improvements and [PROJECT_AUDIT.md](docs/PROJECT_AUDIT_2026-02-01.md) for technical debt.

## 📞 Support

**Documentation:** [docs/](docs/)  
**Issues:** https://github.com/brianbees/urbanbees-sale-site/issues  
**Supabase Dashboard:** Access via your Supabase project settings

---

**Version 3.1.0** | Built for Urban Bees | February 2026
