# Security Documentation

## Security Audit Report - 2025-12-26

This document outlines the security measures implemented and critical security considerations for the HotelX reservation system.

---

## ✅ Fixed Vulnerabilities

### CRITICAL Fixes

1. **Removed Wildcard CORS on Admin Endpoints** ✓
   - **Issue**: AdminController had `@CrossOrigin(origins = "*")` allowing any domain to access admin APIs
   - **Fix**: Removed wildcard CORS annotation; now uses centralized CORS configuration in SecurityConfig
   - **Impact**: Prevents CSRF attacks on administrative functions
   - **File**: [AdminController.java:33](backend/src/main/java/com/hotel/reservation/controller/AdminController.java#L33)

### HIGH Severity Fixes

2. **Sanitized Error Messages** ✓
   - **Issue**: Stack traces and internal error details exposed to clients
   - **Fix**: Added generic error messages for clients; detailed logging server-side only
   - **Impact**: Prevents information disclosure that could aid attackers
   - **Files**:
     - [GlobalExceptionHandler.java:105-111](backend/src/main/java/com/hotel/reservation/exception/GlobalExceptionHandler.java#L105-L111)
     - [GlobalExceptionHandler.java:120-126](backend/src/main/java/com/hotel/reservation/exception/GlobalExceptionHandler.java#L120-L126)

3. **Implemented Stripe Webhook Signature Verification** ✓
   - **Issue**: Webhook endpoint accepted any payload without validation
   - **Fix**: Added `verifyWebhook()` method using Stripe's signature verification
   - **Impact**: Prevents payment manipulation and fraudulent refunds
   - **Files**:
     - [PaymentController.java:168-191](backend/src/main/java/com/hotel/reservation/controller/PaymentController.java#L168-L191)
     - [PaymentService.java:315-406](backend/src/main/java/com/hotel/reservation/service/PaymentService.java#L315-L406)

### MEDIUM Severity Fixes

4. **Added Input Validation** ✓
   - **Issue**: Missing validation on reservation dates and guest counts
   - **Fix**: Comprehensive validation for:
     - Date ranges (no past dates, max 2 years future)
     - Guest count (1-10 guests)
     - Special requests length (<500 chars)
   - **Impact**: Prevents invalid data and potential DoS via data overflow
   - **File**: [ReservationController.java:109-145](backend/src/main/java/com/hotel/reservation/controller/ReservationController.java#L109-L145)

5. **Implemented Security Headers** ✓
   - **Fix**: Added comprehensive OWASP security headers:
     - `X-Frame-Options: DENY` (clickjacking protection)
     - `X-Content-Type-Options: nosniff` (MIME sniffing prevention)
     - `X-XSS-Protection: 1; mode=block`
     - `Strict-Transport-Security` (HSTS for HTTPS)
     - `Content-Security-Policy` (XSS and injection prevention)
     - `Referrer-Policy` (privacy protection)
     - `Permissions-Policy` (browser feature control)
   - **File**: [SecurityHeadersConfig.java](backend/src/main/java/com/hotel/reservation/config/SecurityHeadersConfig.java)

---

## 🔴 CRITICAL - Action Required

### 1. EXPOSED SECRETS IN .ENV FILES

**URGENT**: The following files contain real secrets and MUST be removed from version control:

- [backend/.env](backend/.env)
- [frontend/.env](frontend/.env)

**Immediate Actions Required:**

```bash
# 1. Remove .env files from git history
git rm --cached backend/.env frontend/.env .env

# 2. Add to .gitignore (should already be there)
echo "*.env" >> .gitignore
echo "!.env.example" >> .gitignore

# 3. Rotate ALL exposed secrets immediately:
```

**Secrets to Rotate:**

1. **JWT_SECRET** (line 6 in backend/.env)
   - Generate new: `openssl rand -base64 64`
   - Update in environment variables

2. **Stripe API Keys** (line 10-11)
   - Go to Stripe Dashboard → Developers → API Keys
   - Roll keys immediately
   - Update `STRIPE_API_KEY` and `STRIPE_WEBHOOK_SECRET`

3. **OAuth2 Credentials** (lines 14-20)
   - **Google OAuth2**:
     - Go to Google Cloud Console → Credentials
     - Regenerate `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
   - **Okta OAuth2**:
     - Go to Okta Admin Console → Applications
     - Regenerate `OKTA_CLIENT_ID` and `OKTA_CLIENT_SECRET`

4. **Commit cleaned files:**
```bash
git add .gitignore
git commit -m "security: Remove exposed secrets from repository"
git push
```

---

## ⚠️ Remaining Security Considerations

### PCI-DSS Compliance Warning

**Issue**: The `processDirectCardPayment()` method in [PaymentService.java:222-310](backend/src/main/java/com/hotel/reservation/service/PaymentService.java#L222-L310) handles raw card data server-side.

**Risk**:
- **PCI-DSS Level 1 Compliance Required** if you handle card data directly
- Annual security audits required
- Quarterly vulnerability scans required
- Significant legal and financial liability in case of breach

**Recommended Solution**:
```java
// REMOVE this method entirely and use Stripe Elements client-side
// This approach:
// 1. Keeps card data in browser (never touches your server)
// 2. Reduces PCI scope to simplest level (SAQ-A)
// 3. Eliminates most compliance burden

// Alternative: Use Stripe Payment Links or Checkout Sessions
// See: https://stripe.com/docs/payments/checkout
```

**If you MUST keep server-side card handling:**
- Obtain PCI-DSS Level 1 certification
- Implement tokenization immediately after receiving card data
- Never log or store card numbers
- Use a PCI-compliant hosting environment
- Implement encryption at rest and in transit

### Rate Limiting

**Current State**: No rate limiting implemented

**Recommendation**: Add rate limiting to prevent:
- Brute force attacks on login endpoints
- Credential stuffing
- API abuse and DoS

**Implementation**:
```xml
<!-- Add to pom.xml -->
<dependency>
    <groupId>com.bucket4j</groupId>
    <artifactId>bucket4j-core</artifactId>
    <version>8.0.0</version>
</dependency>
```

```java
// Implement rate limiting on:
// - /api/auth/login (5 attempts per minute per IP)
// - /api/auth/register (3 attempts per minute per IP)
// - /api/payments/** (10 requests per minute per user)
```

### CSRF Protection

**Current State**: CSRF disabled (acceptable for stateless JWT APIs)

**Note**: This is acceptable for a stateless JWT-based API, but:
- Ensure cookies are NOT used for authentication
- Set `SameSite=Strict` on any cookies
- Document this decision for auditors

---

## 🔒 Security Best Practices Implemented

### Authentication & Authorization
✅ BCrypt password hashing with strong work factor
✅ JWT tokens with expiration (24 hours)
✅ Role-based access control (RBAC) with @PreAuthorize
✅ OAuth2 integration (Google, Okta)
✅ Secure session management (stateless)

### Data Protection
✅ MongoDB parameterized queries (no SQL injection)
✅ Input validation on critical endpoints
✅ Output encoding (Spring Boot default)
✅ HTTPS enforcement in production (via HSTS header)

### API Security
✅ CORS properly configured with whitelist
✅ Security headers (XSS, CSP, frame protection)
✅ Webhook signature verification
✅ Error message sanitization

### Infrastructure Security
✅ Environment-based configuration
✅ Secrets in environment variables (not hardcoded)
✅ Security logging for audit trail

---

## 📋 Security Checklist for Deployment

### Before Production Deployment:

- [ ] Rotate ALL secrets (JWT, Stripe, OAuth2)
- [ ] Verify .env files are in .gitignore
- [ ] Enable HTTPS and verify HSTS header is set
- [ ] Review and whitelist CORS origins (no wildcards)
- [ ] Implement rate limiting on auth endpoints
- [ ] Set up security monitoring and alerting
- [ ] Configure automated backup for MongoDB
- [ ] Review IAM permissions (principle of least privilege)
- [ ] Enable CloudWatch/monitoring logs
- [ ] Set up WAF (Web Application Firewall) rules
- [ ] Test Stripe webhooks in production
- [ ] Verify OAuth2 redirect URIs match production URLs
- [ ] Remove or protect admin endpoints from public access
- [ ] Configure database encryption at rest
- [ ] Set up automated security scanning (Dependabot, Snyk)

### Ongoing Security:

- [ ] Regular dependency updates (weekly)
- [ ] Security patch monitoring
- [ ] Access log review (monthly)
- [ ] Penetration testing (quarterly)
- [ ] Incident response plan documented
- [ ] Security training for team members

---

## 🛡️ Security Contact

For security issues, please contact: [security@hotelx.example.com]

**Do NOT create public GitHub issues for security vulnerabilities.**

---

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [PCI-DSS Requirements](https://www.pcisecuritystandards.org/)
- [Stripe Security Best Practices](https://stripe.com/docs/security/guide)
- [Spring Security Documentation](https://spring.io/projects/spring-security)

---

**Last Updated**: 2025-12-26
**Security Audit By**: Claude (Senior Security Analyst)
**Next Review Date**: 2025-03-26
