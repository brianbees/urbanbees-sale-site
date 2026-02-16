# Urban Bees Sale Site

An e-commerce platform for beekeeping equipment with enquiry-focused workflows. Customers browse products, build wishlists or carts, and contact the seller via email or download. Administrators manage products, variants, and images through a dedicated admin panel.

**Version:** 3.4.0  
**Last Updated:** February 16, 2026

---

## Live URLs

- **Customer Site:** https://frontend-six-kappa-30.vercel.app
- **Admin Panel:** https://urbanbees-product-admin.vercel.app
- **Repository:** https://github.com/brianbees/urbanbees-sale-site

---

## System Purpose

This system enables:

1. **Customer Browsing:** Search, filter, and view products with variants
2. **Selection Tools:** Wishlist and cart for organizing product enquiries
3. **Contact Methods:** Email, download, or manual copy for sending enquiries
4. **Admin Management:** Create, edit, and publish products with images
5. **Performance:** Fast page loads with image optimization and caching

### Key Design Choices

- **Email-based enquiries** instead of checkout (enables price negotiation and custom quotes)
- **Client-side state** (cart/wishlist in LocalStorage, no user accounts)
- **Thumbnail optimization** (70-90% faster image loading)
- **Row-level security** (public reads, admin writes via API routes)
- **ISR caching** (5-min homepage, 60s product pages)

For detailed design rationale, see [DESIGN_DECISIONS.md](docs/DESIGN_DECISIONS.md).

---

## Architecture

### Stack
- **Frontend/Admin:** Next.js 16 (App Router, React 19, TypeScript)
- **Database:** Supabase PostgreSQL with Row-Level Security
- **Storage:** Supabase Storage (product images)
- **State:** Zustand (cart/wishlist)
- **Deployment:** Vercel (auto-deploy from GitHub)
- **Caching:** Incremental Static Regeneration (ISR)

### Data Flow
```
Customer → Frontend (ISR) → Supabase (read-only)
Admin → API Routes → Supabase (full access) → Revalidate Frontend
```

### Project Structure
```
admin/          # Product management panel
frontend/       # Customer-facing site
docs/           # System documentation
scripts/        # Utility scripts
```

---

## Documentation

### Core Documentation
- **[WORKFLOWS.md](docs/WORKFLOWS.md)** - How customers and admins use the system
- **[DESIGN_DECISIONS.md](docs/DESIGN_DECISIONS.md)** - Architectural choices and rationale
- **[OPERATIONAL_RULES.md](docs/OPERATIONAL_RULES.md)** - Rules for future development
- **[OPERATIONS.md](docs/OPERATIONS.md)** - Deployment, environment, troubleshooting

### Reference Documentation
- **[CHANGELOG.md](docs/CHANGELOG.md)** - Version history
- **[SCHEMA_ARCHITECTURE.md](docs/SCHEMA_ARCHITECTURE.md)** - Database schema
- **[TODO.md](docs/TODO.md)** - Planned improvements

---

## Quick Start

### Prerequisites
- Node.js 18+
- Supabase account and project
- Vercel account (for deployment)
- Git for version control

### Local Development

1. **Clone and install:**
   ```bash
   git clone https://github.com/brianbees/urbanbees-sale-site.git
   cd urbanbees-sale-site
   
   # Install admin dependencies
   cd admin
   npm install
   
   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

2. **Configure environment:**
   - Create `admin/.env.local` with Supabase URL, anon key, and service role key
   - Create `frontend/.env.local` with Supabase URL, anon key, and PayPal client ID
   - See [OPERATIONS.md](docs/OPERATIONS.md) for complete environment setup

3. **Run development servers:**
   ```bash
   # Admin (port 3000)
   cd admin
   npm run dev
   
   # Frontend (port 3001)
   cd frontend
   npm run dev -- -p 3001
   ```

4. **Verify:**
   - Admin: http://localhost:3000
   - Frontend: http://localhost:3001

### Deployment

**Automatic (recommended):**
```bash
git push origin main
```
Vercel auto-deploys both apps.

**Manual:**
```bash
cd admin
npx vercel --prod --yes

cd ../frontend
npx vercel --prod --yes
```

See [OPERATIONS.md](docs/OPERATIONS.md) for troubleshooting and post-deployment verification.

---

## Database

**Provider:** Supabase PostgreSQL

**Tables:**
- `products` - Product master data (name, category, description, images)
- `variants` - Product variants (SKU, price, stock)
- `website_products` - Reference data for admin dropdowns

**Security:**
- Public: Read-only access via RLS policies
- Admin: Full access via service role key in API routes

**Setup:** See [SCHEMA_ARCHITECTURE.md](docs/SCHEMA_ARCHITECTURE.md)

---

## Key Workflows

### Customer Flow
1. Browse products on homepage (search, filter, sort)
2. View product details with variant selection
3. Add items to wishlist or cart
4. Download selection or email enquiry to seller

### Admin Flow
1. Create new products with images and variants
2. Edit existing products (crop/rotate images, reorder gallery)
3. Manage variants (add/edit/delete SKU, price, stock)
4. Publish changes (automatic frontend cache revalidation)

### System Flow
1. Admin saves changes → Writes to Supabase
2. API route triggers frontend revalidation
3. Next.js regenerates ISR pages on next request
4. Customers see updates within cache window (≤5 minutes)

For detailed workflows, see [WORKFLOWS.md](docs/WORKFLOWS.md).

---

## Contributing

When modifying the system:

1. **Follow operational rules:** See [OPERATIONAL_RULES.md](docs/OPERATIONAL_RULES.md)
2. **Update documentation:** Modify relevant docs (workflows, decisions, operations)
3. **Maintain design decisions:** Don't "optimize away" intentional choices
4. **Test thoroughly:** Happy path and edge cases
5. **Document new decisions:** Add to [DESIGN_DECISIONS.md](docs/DESIGN_DECISIONS.md) if architectural

---

## Support

- **Documentation:** [docs/](docs/)
- **Issues:** https://github.com/brianbees/urbanbees-sale-site/issues
- **Troubleshooting:** [OPERATIONS.md](docs/OPERATIONS.md)

---

**Version 3.4.0** | Urban Bees | February 2026
