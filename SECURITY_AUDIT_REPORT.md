# Security Audit Report

**Repository:** brianbees/urbanbees-sale-site  
**Audit Date:** February 15, 2026  
**Auditor:** GitHub Copilot Security Agent  
**Audit Type:** Comprehensive Security Compromise Assessment

---

## Executive Summary

This security audit was conducted to check for security compromises and vulnerabilities in the Urban Bees Sale Site repository. The audit included:

- ✅ Code analysis for hardcoded secrets and credentials
- ✅ Dependency vulnerability scanning
- ✅ API endpoint security assessment
- ✅ Authentication and authorization review
- ✅ Input validation analysis
- ✅ Git history examination for leaked credentials
- ✅ XSS and injection vulnerability assessment

### Overall Security Status: ⚠️ **HIGH RISK**

**Good News:**
- ✅ No hardcoded secrets or credentials found in the codebase
- ✅ No known vulnerabilities in dependencies
- ✅ Proper use of environment variables
- ✅ `.gitignore` properly configured to exclude `.env.local` files
- ✅ No credentials found in Git history
- ✅ SQL injection protection via Supabase client library

**Critical Issues:**
- 🔴 **No authentication on admin API routes** - Anyone can create/modify/delete products
- 🔴 **Unauthenticated cache invalidation endpoint** - Potential DoS vector
- 🔴 **No input validation on any API endpoints**
- 🔴 **Service role key bypasses all database security (Row-Level Security)**

---

## Detailed Findings

### 🔴 CRITICAL VULNERABILITIES

#### 1. Unauthenticated Admin API Routes

**Severity:** CRITICAL  
**Risk:** Complete compromise of product database

**Affected Files:**
- `admin/app/api/create-product/route.ts`
- `admin/app/api/update-product/route.ts`
- `admin/app/api/create-variant/route.ts`
- `admin/app/api/update-variant/route.ts`
- `frontend/src/app/api/delete-product/route.ts`

**Issue:**
All admin API routes have NO authentication checks. Anyone who discovers the endpoint URLs can:
- Create fake products with arbitrary prices
- Modify existing product prices and stock quantities
- Delete all products from the database
- Inject malicious content into product descriptions

**Example Attack:**
```bash
# Anyone can delete any product
curl -X POST https://frontend-six-kappa-30.vercel.app/api/delete-product \
  -H "Content-Type: application/json" \
  -d '{"productId": "any-product-id"}'

# Anyone can create products with $0 price
curl -X POST https://urbanbees-product-admin.vercel.app/api/create-product \
  -H "Content-Type: application/json" \
  -d '{"product": {"name": "Free Item", "price": 0}, "variants": []}'
```

**Impact:**
- **Data Integrity:** Attackers can corrupt the entire product catalog
- **Financial Loss:** Products can be repriced to $0
- **Reputation Damage:** Malicious content can be injected
- **Business Disruption:** All products can be deleted

**Recommendation:**
Implement authentication middleware for ALL admin routes:
```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const authToken = request.headers.get('authorization');
  
  // Verify token against a secure auth provider
  if (!isValidAdminToken(authToken)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
```

---

#### 2. Unauthenticated Cache Revalidation Endpoint

**Severity:** HIGH  
**Risk:** Denial of Service (DoS)

**Affected File:** `frontend/src/app/api/revalidate/route.ts`

**Issue:**
The `/api/revalidate` endpoint accepts POST requests without any authentication. This allows anyone to:
- Repeatedly trigger cache invalidation
- Force Next.js to rebuild pages unnecessarily
- Consume server resources
- Potentially crash the application

**Exposed via:** 
- Hardcoded URL in `admin/app/deploy/page.tsx` (line 14)
- `https://frontend-six-kappa-30.vercel.app/api/revalidate`

**Example Attack:**
```bash
# DoS attack - spam revalidation requests
while true; do
  curl -X POST https://frontend-six-kappa-30.vercel.app/api/revalidate
done
```

**Impact:**
- **Performance Degradation:** Excessive cache invalidation
- **Cost Increase:** Vercel serverless function invocations
- **User Experience:** Slow page loads during attack

**Recommendation:**
Add authentication token to revalidation endpoint:
```typescript
export async function POST(request: NextRequest) {
  const authToken = request.headers.get('x-revalidate-token');
  
  if (authToken !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  // ... rest of revalidation logic
}
```

---

#### 3. Missing Input Validation

**Severity:** HIGH  
**Risk:** Data corruption, business logic bypass

**Affected Files:** ALL API routes

**Issue:**
No API route validates input data:
- Product names can be empty strings or null
- Prices can be negative or non-numeric
- Stock quantities can be negative
- Variant IDs are not validated before database queries
- Product descriptions accept arbitrary HTML/JavaScript

**Examples:**
```typescript
// admin/app/api/create-product/route.ts
const { product, variants } = body; // No validation!

// admin/app/api/update-variant/route.ts
const { id, sku, price, stock_qty, option_values } = body; // No type checking!
```

**Impact:**
- **Data Integrity:** Invalid data in database (negative prices, empty names)
- **Business Logic Errors:** $-100 products, negative stock
- **XSS Potential:** Unvalidated descriptions could contain malicious scripts

**Recommendation:**
Use a schema validation library like Zod:
```typescript
import { z } from 'zod';

const productSchema = z.object({
  name: z.string().min(1).max(200),
  price: z.number().positive(),
  stock_qty: z.number().int().min(0),
  description: z.string().max(5000),
  category: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  // Validate input
  const validation = productSchema.safeParse(body.product);
  if (!validation.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: validation.error },
      { status: 400 }
    );
  }
  
  // Proceed with validated data
  const product = validation.data;
  // ...
}
```

---

#### 4. Service Role Key Bypasses All Security

**Severity:** HIGH  
**Risk:** Complete database access if key is leaked

**Affected Files:** All API routes in `admin/app/api/*`

**Issue:**
All admin operations use `SUPABASE_SERVICE_ROLE_KEY`, which:
- Bypasses Row-Level Security (RLS) policies
- Has full read/write access to the entire database
- Can access ALL tables, not just products/variants
- If leaked, provides complete database control

**Current Usage:**
```typescript
// admin/app/api/create-product/route.ts
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Bypasses ALL security
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);
```

**Impact:**
- **Database Exposure:** Service key has unlimited database access
- **No Audit Trail:** RLS bypassed = no row-level tracking
- **Blast Radius:** If key leaks, entire database is compromised

**Recommendation:**
1. Implement proper authentication (OAuth, JWT, Supabase Auth)
2. Use Supabase Auth with RLS policies instead of service key
3. Only use service key for server-side operations that MUST bypass RLS
4. Rotate service key immediately if any compromise is suspected

---

### 🟡 HIGH PRIORITY ISSUES

#### 5. Hardcoded Production URLs

**Severity:** MEDIUM  
**Risk:** Information disclosure, maintenance burden

**Affected Files:**
- `admin/app/deploy/page.tsx` (lines 14, 68, 76)

**Issue:**
Production URLs are hardcoded throughout the codebase:
- `https://frontend-six-kappa-30.vercel.app/api/revalidate`
- `https://frontend-six-kappa-30.vercel.app`
- `https://frontend-six-kappa-30.vercel.app/preview`

**Impact:**
- **Information Disclosure:** Exposes deployment URLs to anyone viewing the code
- **Maintenance:** URLs must be manually updated if deployment changes
- **Environment Confusion:** No separation between dev/staging/production

**Recommendation:**
Move URLs to environment variables:
```typescript
// .env.local
NEXT_PUBLIC_FRONTEND_URL=https://frontend-six-kappa-30.vercel.app

// admin/app/deploy/page.tsx
const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL;
const response = await fetch(`${frontendUrl}/api/revalidate`, { ... });
```

---

#### 6. PayPal Order Creation Without Server-Side Validation

**Severity:** MEDIUM  
**Risk:** Price manipulation

**Affected File:** `frontend/src/app/api/paypal/create-order/route.ts`

**Issue:**
The PayPal order creation endpoint calculates order totals from client-provided data without verifying against the database:

```typescript
// Line 28 - Uses client-provided prices directly
const total = items.reduce((sum: number, item: any) => 
  sum + (item.price * item.quantity), 0);
```

**Attack Scenario:**
1. Attacker intercepts client-side request
2. Modifies `item.price` from $100 to $1
3. Server creates PayPal order with manipulated price
4. Attacker completes purchase at fraudulent price

**Impact:**
- **Financial Loss:** Products sold at incorrect prices
- **Revenue Loss:** Attackers can set prices to $0.01

**Recommendation:**
Verify prices against database before creating PayPal order:
```typescript
// Fetch actual prices from database
const variantIds = items.map(item => item.variantId);
const { data: variants } = await supabase
  .from('variants')
  .select('id, price')
  .in('id', variantIds);

// Build price map
const priceMap = new Map(variants.map(v => [v.id, v.price]));

// Calculate total using DATABASE prices, not client prices
const total = items.reduce((sum, item) => {
  const actualPrice = priceMap.get(item.variantId);
  if (!actualPrice) throw new Error('Invalid variant');
  return sum + (actualPrice * item.quantity);
}, 0);
```

---

#### 7. No Audit Logging

**Severity:** MEDIUM  
**Risk:** Unable to detect or investigate security incidents

**Affected Files:** All admin API routes

**Issue:**
No logging of critical operations:
- Product creation/modification/deletion
- Price changes
- Stock adjustments
- Who made changes and when

**Impact:**
- **Incident Response:** Cannot determine what was changed or by whom
- **Compliance:** No audit trail for financial transactions
- **Debugging:** Difficult to trace issues back to specific actions

**Recommendation:**
Implement audit logging:
```typescript
// Create audit log table in Supabase
// products_audit_log (id, action, product_id, changes, ip_address, timestamp)

async function logAuditEvent(action: string, details: any) {
  await supabaseAdmin.from('audit_log').insert({
    action,
    details,
    ip_address: request.headers.get('x-forwarded-for'),
    timestamp: new Date().toISOString(),
  });
}

// Use in API routes
await logAuditEvent('product_created', { product_id: newProduct.id });
```

---

### ✅ POSITIVE FINDINGS

#### 1. No Hardcoded Secrets ✅

**Finding:** All sensitive credentials use environment variables correctly.

**Evidence:**
- Supabase URL: `process.env.NEXT_PUBLIC_SUPABASE_URL`
- Supabase Keys: `process.env.SUPABASE_SERVICE_ROLE_KEY`
- PayPal Keys: `process.env.PAYPAL_CLIENT_SECRET`

**Verification:**
```bash
# Searched entire codebase
grep -r "sb_secret_\|AIza\|pk_live_\|sk_live_" --include="*.ts" --include="*.js"
# Result: No matches (✅ PASS)
```

---

#### 2. No Credentials in Git History ✅

**Finding:** No `.env.local` files or credentials have been committed to Git.

**Verification:**
```bash
git log --all --full-history --pretty=format:"%H" -- "*.env.local" "*.env"
# Result: No matches (✅ PASS)

git log --all --grep="secret\|password\|key\|token" --oneline
# Result: No suspicious commits (✅ PASS)
```

---

#### 3. Dependencies Free of Known Vulnerabilities ✅

**Finding:** All npm dependencies are up-to-date with no known CVEs.

**Tested Dependencies:**
- `@supabase/supabase-js@2.93.1` ✅
- `next@16.1.5` ✅
- `react@19.2.3` ✅
- `react-dom@19.2.3` ✅
- `zustand@5.0.10` ✅
- `dotenv@17.2.3` ✅

**Result:** No vulnerabilities found via GitHub Advisory Database.

---

#### 4. SQL Injection Protection ✅

**Finding:** Using Supabase client library, which uses parameterized queries.

**Evidence:**
```typescript
// admin/app/api/create-product/route.ts
await supabaseAdmin
  .from('products')
  .insert(product) // Parameterized - safe from SQL injection
  .select()
  .single();
```

No raw SQL queries found. All database operations use Supabase's query builder, which automatically escapes parameters.

---

#### 5. Proper `.gitignore` Configuration ✅

**Finding:** `.gitignore` correctly excludes sensitive files.

**Configuration:**
```gitignore
# env files (NEVER commit real credentials)
.env*
!**/.env.example
```

**Verification:**
```bash
git check-ignore admin/.env.local
# Output: .gitignore:38:.env*  (✅ IGNORED)

git ls-files | grep ".env.local"
# Output: (none) (✅ PASS)
```

---

#### 6. Secure Environment Variable Examples ✅

**Finding:** `.env.example` files use placeholders, not real credentials.

**Evidence:**
```bash
# admin/.env.example
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here  # ✅ Placeholder

# frontend/.env.example  
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_client_id_here  # ✅ Placeholder
```

---

## Risk Assessment Matrix

| Finding | Severity | Likelihood | Impact | Risk Score |
|---------|----------|------------|--------|------------|
| Unauthenticated Admin APIs | CRITICAL | HIGH | CRITICAL | 🔴 9/10 |
| Missing Input Validation | HIGH | HIGH | HIGH | 🔴 8/10 |
| Service Role Key Usage | HIGH | MEDIUM | CRITICAL | 🟡 7/10 |
| Unauthenticated Revalidate | HIGH | MEDIUM | MEDIUM | 🟡 6/10 |
| PayPal Price Validation | MEDIUM | LOW | HIGH | 🟡 5/10 |
| Hardcoded URLs | MEDIUM | LOW | LOW | 🟢 3/10 |
| No Audit Logging | MEDIUM | N/A | MEDIUM | 🟢 4/10 |

---

## Recommendations Summary

### Immediate Actions (Within 24 Hours)

1. **🔴 CRITICAL:** Implement authentication on ALL admin API routes
   - Use API keys, JWT tokens, or Supabase Auth
   - Add middleware to verify authentication
   - Return 401 Unauthorized for invalid requests

2. **🔴 CRITICAL:** Add input validation to all API endpoints
   - Install validation library: `npm install zod`
   - Define schemas for all input data
   - Validate before database operations

3. **🔴 CRITICAL:** Protect the revalidation endpoint
   - Add secret token verification
   - Store token in environment variable
   - Update admin deploy page to include token

### Short-Term Actions (Within 1 Week)

4. **🟡 HIGH:** Implement server-side price validation for PayPal
   - Verify prices against database before order creation
   - Never trust client-provided prices

5. **🟡 HIGH:** Move hardcoded URLs to environment variables
   - Add `NEXT_PUBLIC_FRONTEND_URL` to .env.example
   - Update deployment configuration

6. **🟡 HIGH:** Add audit logging for admin operations
   - Create audit log table in Supabase
   - Log all product modifications

### Long-Term Actions (Within 1 Month)

7. **🟢 MEDIUM:** Consider implementing Supabase Auth with RLS
   - Replace service role key with proper authentication
   - Configure Row-Level Security policies
   - Use user-based authentication

8. **🟢 MEDIUM:** Set up automated security scanning
   - Enable GitHub Dependabot
   - Configure CodeQL for continuous scanning
   - Set up pre-commit hooks with gitleaks

9. **🟢 LOW:** Add rate limiting to API endpoints
   - Prevent brute force attacks
   - Limit requests per IP address

---

## Compliance & Best Practices

### OWASP Top 10 Assessment

| Risk | Status | Notes |
|------|--------|-------|
| A01:2021 – Broken Access Control | 🔴 FAIL | No authentication on admin routes |
| A02:2021 – Cryptographic Failures | ✅ PASS | Credentials properly managed |
| A03:2021 – Injection | ✅ PASS | Using parameterized queries |
| A04:2021 – Insecure Design | 🔴 FAIL | Missing security controls by design |
| A05:2021 – Security Misconfiguration | 🟡 PARTIAL | Service role key usage |
| A06:2021 – Vulnerable Components | ✅ PASS | No known vulnerabilities |
| A07:2021 – ID & Auth Failures | 🔴 FAIL | No authentication implemented |
| A08:2021 – Software & Data Integrity | 🟡 PARTIAL | No audit logging |
| A09:2021 – Security Logging Failures | 🔴 FAIL | No logging implemented |
| A10:2021 – Server-Side Request Forgery | ✅ PASS | No SSRF vectors found |

**OWASP Score: 4/10** (FAIL - Critical issues must be addressed)

---

## Security Testing Recommendations

### Manual Testing

1. **Test Authentication Bypass:**
   ```bash
   curl -X POST https://your-admin-domain.vercel.app/api/create-product \
     -H "Content-Type: application/json" \
     -d '{"product":{"name":"Test"},"variants":[]}'
   ```
   Expected: Should return 401 Unauthorized (currently returns 200 OK ❌)

2. **Test Input Validation:**
   ```bash
   curl -X POST https://your-admin-domain.vercel.app/api/update-variant \
     -H "Content-Type: application/json" \
     -d '{"price":-100,"stock_qty":-50}'
   ```
   Expected: Should return 400 Bad Request (currently accepts invalid data ❌)

3. **Test DoS on Revalidation:**
   ```bash
   for i in {1..100}; do 
     curl -X POST https://frontend-six-kappa-30.vercel.app/api/revalidate &
   done
   ```
   Expected: Should rate limit or require authentication (currently accepts all ❌)

### Automated Testing Tools

- **OWASP ZAP:** Scan for common web vulnerabilities
- **Burp Suite:** Manual security testing and request interception
- **npm audit:** Check for dependency vulnerabilities (✅ already passing)
- **CodeQL:** Static code analysis for security issues

---

## Incident Response Plan

### If Service Role Key is Compromised

1. **IMMEDIATE:** Rotate key in Supabase dashboard
2. **IMMEDIATE:** Update environment variables in Vercel
3. **IMMEDIATE:** Redeploy both admin and frontend applications
4. **Within 1 hour:** Audit database for unauthorized changes
5. **Within 24 hours:** Review access logs (if available)
6. **Within 1 week:** Implement proper authentication to prevent future issues

### If Admin API is Exploited

1. **IMMEDIATE:** Check for unauthorized product modifications
2. **IMMEDIATE:** Deploy authentication middleware
3. **Within 1 hour:** Review all products for price/content tampering
4. **Within 24 hours:** Notify customers if data was compromised
5. **Within 1 week:** Implement audit logging for forensics

---

## Conclusion

The Urban Bees Sale Site codebase demonstrates **good credential management practices** (no hardcoded secrets, proper .gitignore), but has **critical security gaps** in authentication and authorization.

### Security Scorecard

- **Credential Management:** ⭐⭐⭐⭐⭐ (5/5) Excellent
- **Dependency Security:** ⭐⭐⭐⭐⭐ (5/5) Excellent
- **Authentication:** ⭐☆☆☆☆ (1/5) Critical Failure
- **Input Validation:** ⭐☆☆☆☆ (1/5) Critical Failure
- **Authorization:** ⭐☆☆☆☆ (1/5) Critical Failure
- **Audit Logging:** ⭐☆☆☆☆ (1/5) Not Implemented

**Overall Security Rating: 🔴 2.3/5 (FAIL)**

### Priority Actions

The application is currently **vulnerable to unauthorized access and data manipulation**. The most critical actions are:

1. ✅ Implement authentication on admin routes
2. ✅ Add input validation
3. ✅ Protect revalidation endpoint
4. ✅ Validate prices server-side

These must be addressed **before going to production** or if already in production, **immediately**.

---

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js Middleware Authentication](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [SECURITY.md](./SECURITY.md) - Project security baseline
- [CWE-306: Missing Authentication](https://cwe.mitre.org/data/definitions/306.html)
- [CWE-20: Improper Input Validation](https://cwe.mitre.org/data/definitions/20.html)

---

**Report Generated:** February 15, 2026  
**Report Version:** 1.0  
**Next Review:** Recommended after implementing critical fixes
