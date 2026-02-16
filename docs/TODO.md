# Planned Improvements

This document tracks planned features and improvements for the Urban Bees sale site. Completed items are documented in [CHANGELOG.md](CHANGELOG.md).

**Last Updated:** February 16, 2026

---

## High Priority

### PayPal Checkout Enhancement

**Goal:** Automatically populate order details in PayPal metadata instead of requiring customers to type them manually.

**Current State:**
- Cart summary shows items, quantities, and prices
- Customer must manually type order details into PayPal note field
- Seller receives payment but may not have complete order information

**Desired State:**
- Cart summary sent automatically to PayPal as structured metadata
- Order details appear in seller's PayPal dashboard alongside payment
- Customer doesn't need to transcribe order information

**Implementation Needs:**
- Research PayPal SDK metadata/custom fields API
- Pass cart items as structured data to PayPal
- Test that data appears correctly in PayPal seller dashboard
- Ensure backwards compatibility with email workflow

**Priority:** High (improves order accuracy and customer experience)

---

## Medium Priority

### Bulk Product Operations

**Goal:** Enable admin to perform operations on multiple products at once.

**Use Cases:**
- Change category for multiple products
- Delete multiple outdated products
- Mark multiple products as discontinued
- Bulk price updates

**Implementation Considerations:**
- Checkbox selection on admin homepage
- "Bulk Actions" dropdown with available operations
- Confirmation dialogs for destructive actions
- Progress indicator for long-running operations
- Revalidate affected products after completion

**Priority:** Medium (improves admin efficiency for large catalogs)

---

### Product Import/Export

**Goal:** Allow admin to import/export product data via CSV for bulk operations outside the admin panel.

**Use Cases:**
- Import products from existing inventory systems
- Export for backup or analysis
- Bulk editing in spreadsheet applications
- Migration between environments

**Format:**
- CSV with columns: name, category, description, SKU, price, stock
- Image URLs reference Supabase Storage
- Variants as separate rows or nested structure

**Implementation Considerations:**
- Export: Generate CSV from current database state
- Import: Validate format before inserting
- Handle errors gracefully (skip invalid rows, show summary)
- Document CSV format and required fields

**Priority:** Medium (useful for initial setup and ongoing management)

---

## Low Priority

### Customer Order History (Optional)

**Goal:** Allow customers to review their past enquiries.

**Current State:**
- No order history (no user accounts)
- Cart and wishlist are session-based only
- Email/download provides record, but not stored in system

**Considerations:**
- Requires user accounts or session tracking
- Adds complexity to system architecture
- May conflict with privacy-first design (no stored customer data)
- Email/download workflow provides sufficient record for most use cases

**Decision:** Low priority unless customer feedback indicates strong need

---

### Enhanced Search

**Goal:** Improve product search with fuzzy matching, synonyms, and advanced filters.

**Current State:**
- Whole-word matching only
- Category filter and sort options
- No partial word matching or typo tolerance

**Potential Improvements:**
- Fuzzy search (handles typos: "bkeeping" → "beekeeping")
- Synonym matching ("hive" → "beehive", "colony")
- Price range filters
- Stock availability filter (in stock / out of stock)
- Multi-category selection

**Implementation Considerations:**
- May require search index or third-party service (Algolia, MeiliSearch)
- Adds complexity and potential cost
- Current search sufficient for small-medium catalogs

**Priority:** Low (evaluate when catalog grows significantly)

---

### Admin Analytics Dashboard

**Goal:** Provide insights into product performance, enquiry patterns, and customer behavior.

**Metrics to Track:**
- Most viewed products
- Most added to wishlist/cart
- Popular categories
- Search queries (what customers are looking for)
- Contact/download conversion rates

**Implementation Considerations:**
- Requires event tracking (Google Analytics or custom)
- Privacy implications (GDPR compliance)
- Database schema changes (analytics tables)
- Dashboard UI in admin panel

**Priority:** Low (useful for business insights but not core functionality)

---

## Technical Debt

### Test Coverage

**Goal:** Add automated tests for critical flows.

**Areas to Cover:**
- Product CRUD operations (admin)
- Stock validation (frontend)
- Image upload and compression
- Cart/wishlist state management
- Revalidation triggers

**Testing Strategy:**
- Unit tests: Utility functions (image compression, URL shortening)
- Integration tests: API routes (create product, check stock)
- E2E tests: Critical user flows (browse → add to cart → email)

**Priority:** Medium (prevents regressions, improves maintainability)

---

### Code Organization

**Goal:** Improve code structure for maintainability.

**Potential Improvements:**
- Consolidate duplicate components between admin and frontend
- Extract common utilities to shared library
- Standardize error handling patterns
- Centralize API client configuration

**Considerations:**
- Balance between DRY principles and app separation
- Avoid premature abstraction
- Maintain clear boundaries between admin and frontend

**Priority:** Low (current structure is functional but could be optimized)

---

## Ideas for Exploration

### Progressive Web App (PWA)

**Concept:** Enable offline browsing and "Add to Home Screen" functionality.

**Benefits:**
- Faster load times with service worker caching
- Offline product browsing
- Native app-like experience on mobile
- Push notifications for new products (optional)

**Trade-offs:**
- Additional complexity (service worker management)
- Cache invalidation challenges
- Limited benefit for enquiry-based workflow (no offline checkout)

**Status:** Idea stage (evaluate need and effort)

---

### Live Chat Integration

**Concept:** Allow customers to chat with seller directly from product pages.

**Benefits:**
- Instant answers to product questions
- Higher conversion rates (immediate engagement)
- Alternative to email for quick enquiries

**Trade-offs:**
- Requires staffing during business hours
- Additional cost (third-party chat service)
- May not align with enquiry-based workflow

**Status:** Idea stage (assess customer preference)

---

## Future Considerations

When adding new features:
1. **Maintain design decisions** - Don't compromise intentional architectural choices (see [DESIGN_DECISIONS.md](DESIGN_DECISIONS.md))
2. **Follow operational rules** - Ensure new code follows established patterns (see [OPERATIONAL_RULES.md](OPERATIONAL_RULES.md))
3. **Update workflows** - Document new user/admin flows in [WORKFLOWS.md](WORKFLOWS.md)
4. **Document decisions** - Record new architectural choices in [DESIGN_DECISIONS.md](DESIGN_DECISIONS.md)
5. **Update changelog** - Log all changes in [CHANGELOG.md](CHANGELOG.md)

---

## Rejected Ideas

### Full Checkout System

**Concept:** Build complete e-commerce checkout with inventory reservation, order confirmation, shipping, etc.

**Reason for Rejection:**
- Conflicts with enquiry-based business model
- Prevents price negotiation and custom quotes
- Massive increase in complexity
- PayPal integration already available for straightforward purchases

**Decision:** Email/download workflow better aligns with business needs

---

### User Accounts

**Concept:** Allow customers to create accounts with saved carts, order history, addresses.

**Reason for Rejection:**
- Adds authentication complexity
- Privacy concerns (storing customer data)
- Current LocalStorage approach sufficient for enquiry workflow
- No long-term state needed (browse → enquire → done)

**Decision:** Session-based state matches use case better
