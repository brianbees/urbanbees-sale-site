# Urban Bees Sale Site

A modern e-commerce platform for beekeeping equipment with full-featured admin panel and customer storefront.

**Version:** 3.1.0  
**Last Updated:** February 13, 2026

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
│   ├── FEATURES.md           # Complete feature list
│   ├── CHANGELOG.md          # Version history
│   ├── TODO.md               # Planned features
│   ├── PROJECT_AUDIT.md      # Code quality audit
│   └── SCHEMA_ARCHITECTURE.md # Database schema
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

**Supabase Project:** pdovgefwzxfawuyngrke

### Tables
- `products` - Product information (name, description, slug, images[], category, created_at, updated_at)
- `variants` - Product variants (SKU, variant_name, price_aud, stock_available, is_primary)

### Storage Buckets
- `product-images` - Compressed JPEG images (public access, max 1920px, 85% quality)

### Row-Level Security
- Products: Public read, admin write
- Variants: Public read, admin write
- Images: Public access via CDN

## ⚙️ Environment Variables

### Admin Panel (`admin/.env.local`)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://pdovgefwzxfawuyngrke.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Frontend (`frontend/.env.local`)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://pdovgefwzxfawuyngrke.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_client_id_here
```

## 🚀 Development

Each app runs independently:

```bash
# Admin panel (port 3000)
cd admin
npm install
npm run dev

# Frontend (port 3001)
cd frontend
npm install
npm run dev
```

### Build Commands
```bash
# Production build
npm run build

# Type checking
npm run type-check

# Linting
npm run lint
```

## 📦 Deployment

**Method:** Automatic via GitHub → Vercel integration

1. Push to `main` branch
2. Vercel auto-builds and deploys both apps
3. Admin: `urbanbees-product-admin.vercel.app`
4. Frontend: `frontend-six-kappa-30.vercel.app`

**Manual Deploy:**
```bash
# From workspace root
npm run deploy:admin    # or run task: Deploy Admin to Vercel
npm run deploy:frontend # or run task: Deploy Frontend to Vercel
```

## 🔧 Key Technologies

- **Next.js 16.1.5** - React framework with App Router + Turbopack
- **TypeScript** - Strict mode enabled
- **Tailwind CSS 4** - Utility-first styling
- **Supabase** - PostgreSQL + Storage + RLS
- **Zustand** - Client-side state management
- **PayPal SDK** - Payment processing
- **HTML5 Canvas** - Client-side image editing (crop/rotate)
- **is.gd API** - Automatic URL shortening

## 📝 Recent Updates (v3.0.0 - Feb 13, 2026)

### Added
- Image editing tools (crop + rotate) in Edit Product screen
- Hero image promotion (any image → hero position)
- Drag-and-drop image reordering with locked hero
- Automatic URL shortening using is.gd API (40+ char threshold)
- Clickable links in product descriptions (homepage + product pages)
- Loading states for Add-to-Cart (spinner + text)
- 5-second timeout protection for Add-to-Cart operations
- User-facing error messages (timeout vs. general error)

### Changed
- Default sort: "Newest First" (was "Name A-Z")
- Cache revalidation: Now accepts productId for targeted clearing
- Edit workflow: Images save immediately with frontend sync

### Fixed
- Add-to-Cart delays (3-5 seconds with no feedback)
- Duplicate Add-to-Cart clicks during slow operations
- Inconsistent link rendering between homepage and product pages
- Cache not clearing after image edits

## 🐛 Known Issues

- None at this time

## 📞 Support

For technical questions or bug reports, see the GitHub repository issues page.

---

**Version 3.0.0** | Built with ❤️ for Urban Bees | February 2026
