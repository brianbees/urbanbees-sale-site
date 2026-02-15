# Security Policy

## 🔒 Minimal Security Baseline

This project follows a practical security baseline designed to prevent credential leaks and security incidents.

---

## 1. Absolute Rule (The Only Rule That Matters)

**No secrets in Git. Ever.**

### Allowed in Git:
- ✅ `.env.example` → placeholders only
- ✅ Documentation → placeholders only (`your_key_here`)

### Never Allowed:
- ❌ `.env.local`
- ❌ API keys (Supabase, PayPal, etc.)
- ❌ Tokens
- ❌ Service role keys
- ❌ JWT secrets
- ❌ Database URLs with passwords

---

## 2. Environment Setup

### Quick Start

```bash
# Admin Panel
cp admin/.env.example admin/.env.local
# Edit admin/.env.local with your real credentials

# Frontend
cp frontend/.env.example frontend/.env.local
# Edit frontend/.env.local with your real credentials
```

### Where to Get Credentials

**Supabase:**
- Dashboard: https://supabase.com/dashboard
- Settings → API → Copy keys

**PayPal:**
- Dashboard: https://developer.paypal.com/dashboard
- Apps & Credentials → Create/view app

---

## 3. Pre-Commit Secret Scanning

This project uses **gitleaks** to prevent accidental credential commits.

### Installation

**Windows:**
```powershell
choco install gitleaks
```

**macOS:**
```bash
brew install gitleaks
```

**Manual (all platforms):**
Download from: https://github.com/gitleaks/gitleaks/releases

### Setup Pre-Commit Hook

```bash
# Create hook file
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/sh
gitleaks protect --staged --verbose
if [ $? -ne 0 ]; then
  echo "❌ Commit blocked: potential secret detected"
  echo "Review the flagged content and remove secrets before committing"
  exit 1
fi
EOF

# Make executable (Mac/Linux)
chmod +x .git/hooks/pre-commit
```

**Windows PowerShell:**
```powershell
@"
#!/bin/sh
gitleaks protect --staged --verbose
if [ `$? -ne 0 ]; then
  echo "❌ Commit blocked: potential secret detected"
  exit 1
fi
"@ | Out-File -FilePath .git/hooks/pre-commit -Encoding ASCII
```

### Test It Works

```bash
# This should be BLOCKED:
echo "test=sb_secret_abc123" > test-secret.txt
git add test-secret.txt
git commit -m "test"  # Should fail with secret detection

# Clean up
rm test-secret.txt
git reset HEAD test-secret.txt
```

---

## 4. GitHub Push Protection

**Status:** Enabled ✅

Secret scanning and push protection are active on this repository. GitHub will block pushes containing known secret patterns.

To enable on your fork:
1. Go to: Repository → Settings → Security
2. Enable: **Secret scanning** and **Push protection**

---

## 5. One-Minute Commit Checklist

Before pushing, quickly scan your staged changes:

```bash
# Check for common secret patterns
git diff --cached | grep -E "(sb_|sk_|pk_|AIza|Bearer|eyJ|://.*:.*@)"
```

**If any matches found:**
- ❌ Stop immediately
- Review each match
- Remove secrets
- Use placeholders instead

**Common patterns to watch for:**
- `sb_secret_` → Supabase service role key
- `sb_publishable_` → Supabase anon key
- `eyJhbGc` → JWT tokens
- `AIza` → Google API keys
- `pk_live_` or `sk_live_` → Stripe keys
- URLs with passwords: `https://user:password@host`

---

## 6. Documentation Rule

**When writing documentation:**

✅ **Good:**
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_publishable_key_here
```

❌ **Bad:**
```bash
SUPABASE_URL=https://pdovgefwzxfa_REAL_PROJECT_ID.supabase.co
SUPABASE_ANON_KEY=sb_publishable_REAL_KEY_WAS_HERE
```

**Never copy-paste from `.env.local` into documentation!**

---

## 7. Script Development Rule

**Never hardcode credentials in scripts.**

✅ **Good:**
```javascript
import 'dotenv/config';  // Loads .env.local
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!key) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(url, key);
```

❌ **Bad:**
```javascript
const key = 'sb_secret_HARDCODED_KEY_HERE';
const supabase = createClient(url, key);
```

---

## 8. Incident Response

### If You Discover a Leaked Secret

**DO NOT** commit a "fix" that just removes it (it stays in git history).

**Immediate Steps:**

1. **Rotate the credential immediately**
   - Supabase: Dashboard → Settings → API → Regenerate keys
   - PayPal: Dashboard → Revoke and create new credentials

2. **Verify .env.local files have new keys**
   ```bash
   # Update local files
   vim admin/.env.local
   vim frontend/.env.local
   ```

3. **Update Vercel environment variables**
   - Admin: https://vercel.com/your-team/urbanbees-product-admin/settings/environment-variables
   - Frontend: https://vercel.com/your-team/frontend/settings/environment-variables

4. **Redeploy both projects**
   - Deployments → Latest → ... → Redeploy

5. **Clean Git History** (after keys are rotated)
   ```bash
   # Option A: BFG Repo-Cleaner (fast)
   bfg --replace-text passwords.txt

   # Option B: git-filter-repo (comprehensive)
   git filter-repo --path README.md --invert-paths
   ```

6. **Force push cleaned history**
   ```bash
   git push --force origin main
   ```

7. **Notify team**
   - Email: brian@urbanbees.co.uk
   - Subject: "Security Incident: Credential Rotation"

---

## 9. The 80/20 Summary

**If you do only these three things:**

1. ✅ `.env.local` only for secrets (never commit)
2. ✅ Install gitleaks pre-commit hook
3. ✅ Enable GitHub push protection

**You eliminate ~95% of real-world credential leaks.**

---

## 10. Verification Commands

```bash
# Verify .env.local is ignored
git check-ignore -v admin/.env.local
git check-ignore -v frontend/.env.local
# Should show: .gitignore:X:.env*

# Verify .env.example is tracked
git check-ignore admin/.env.example
git check-ignore frontend/.env.example
# Should show: (nothing - not ignored)

# Verify gitleaks is installed
gitleaks version

# Scan entire repo for secrets (audit)
gitleaks detect --verbose

# Test pre-commit hook
echo "test=sb_secret_abc123" > test.txt
git add test.txt
git commit -m "test"  # Should BLOCK
rm test.txt
```

---

## Contact

**Security Issues:**
- Email: brian@urbanbees.co.uk
- Subject: "Security Issue: [Brief Description]"

**For Sensitive Vulnerabilities:**
Please report privately via email rather than creating a public issue.

---

## Version History

- **v1.0** (Feb 15, 2026) - Initial security baseline after credential rotation incident
