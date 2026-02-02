# Deployment Guide

## Environment Variables

### Core API (`apps/core-api`)

| Variable | Description | Required |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `REDIS_URL` | Redis connection string | Yes |
| `JWT_SECRET` | Secret for signing JWT tokens | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Yes |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Yes |
| `GOOGLE_CALLBACK_URL` | OAuth callback URL | Yes |
| `STRIPE_SECRET_KEY` | Stripe secret key | Yes |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | Yes |
| `ALLOWED_ORIGINS` | Comma-separated allowed origins for CORS/CSRF | Yes |
| `ADMIN_EMAILS` | Comma-separated admin email addresses | No |
| `AUTH_MOCK` | Set to "true" for mock OAuth in development | No |

### Destiny Loom (`apps/destiny-loom`)

| Variable | Description | Required |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Core API URL | Yes |
| `NEXT_PUBLIC_APP_URL` | Public app URL | Yes |
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | Yes |

---

## API Key / Secret Rotation

### JWT Secret Rotation

1. **Generate a new secret** (admin-only endpoint):
   ```bash
   curl -X POST https://api.cyberfaith.app/admin/rotate-jwt-secret \
     -H "Authorization: Bearer $ADMIN_TOKEN"
   ```
   This will:
   - Generate a new 64-byte random secret
   - Invalidate all existing JWT tokens via Redis global timestamp
   - Return the new secret in the response

2. **Update the environment variable:**
   ```bash
   # Vercel
   vercel env rm JWT_SECRET production
   echo "NEW_SECRET_HERE" | vercel env add JWT_SECRET production

   # Or via dashboard: Settings → Environment Variables → JWT_SECRET
   ```

3. **Redeploy the Core API:**
   ```bash
   vercel --prod  # or trigger via CI/CD
   ```

4. **Users will need to re-authenticate** — all existing sessions are invalidated.

### Stripe Key Rotation

1. Generate new keys in the [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Update `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` env vars
3. Redeploy
4. The old webhook secret will stop working immediately — update first in Stripe, then in env

### Google OAuth Rotation

1. Generate new credentials in [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Update `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
3. Redeploy
4. Users may need to re-authenticate

### Database Credentials

1. Rotate via your PostgreSQL provider (Neon, Supabase, etc.)
2. Update `DATABASE_URL` in both Core API and Destiny Loom
3. Redeploy both services

---

## Data Retention Policy

| Data Type | Active Account | After Deletion |
|---|---|---|
| User profile | Retained while active | Anonymized immediately |
| Readings | Retained while active | Purged within 30 days |
| Journal entries | Retained while active | Purged within 30 days |
| Points transactions | Retained while active | Purged within 30 days |
| Comments | Retained while active | Soft-deleted, purged within 30 days |
| Friendships | Retained while active | Removed immediately |
| Payment records | Retained per legal requirements | Retained per Stripe's policy |
| Encrypted backups | Rolling 90-day window | Included in backup rotation |
| Server logs | 30 days | 30 days |

---

## Security Checklist

- [ ] All env vars set in production (no defaults)
- [ ] `ALLOWED_ORIGINS` set to production domains only
- [ ] HTTPS enforced (HSTS header configured)
- [ ] Rate limiting enabled (60 req/min default)
- [ ] CSRF protection via Origin/Referer validation
- [ ] CSP headers configured in Next.js
- [ ] Stripe webhook signature validation
- [ ] JWT token blacklisting via Redis
- [ ] Input sanitization on all user text inputs
- [ ] Drizzle parameterized queries (SQL injection prevention)
- [ ] Account deletion anonymizes PII
