# Complete Environment Variables Reference
## totalaud.io - All Environment Variables

**Date**: 2025-01-22  
**Source**: `.env.local`, `apps/aud-web/.env.local`, `.env.example`

---

## 🔐 CURRENT ENVIRONMENT VARIABLES (From .env.local)

### Supabase Configuration
```bash
NEXT_PUBLIC_SUPABASE_URL=https://ucncbighzqudaszewjrv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjbmNiaWdoenF1ZGFzemV3anJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5MTU2MjEsImV4cCI6MjA3NDQ5MTYyMX0.byAFslDRcX_Peto69Z7jG90CoWnQRaqNGOzhxteAgCI
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjbmNiaWdoenF1ZGFzemV3anJ2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODkxNTYyMSwiZXhwIjoyMDc0NDkxNjIxfQ.jNbVTjvh7uOGINRPXJ6TFQJuNEbOLuOccVm8nqnlgPE
SUPABASE_DEV_USER_ID=c5c261a8-8b35-4e77-ae6d-e293e65d746d
```

### AI Provider Keys
```bash
OPENAI_API_KEY=sk-your-openai-api-key-here
ANTHROPIC_API_KEY=sk-ant-your-anthropic-api-key-here
```

### Telegram Bot Configuration
```bash
TELEGRAM_BOT_TOKEN=8368524794:AAFXE5MHb9Bxvb6kLzF4iQOPbbNVoqTx3P4
TELEGRAM_CHAT_ID=5457812261
```

---

## 📋 ALL ENVIRONMENT VARIABLES (Complete List)

### Required for Railway Deployment

#### Supabase (Required)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://ucncbighzqudaszewjrv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

#### Auth (Required)
```bash
NEXTAUTH_URL=<your-railway-url>
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
```

#### AI Keys (Required)
```bash
ANTHROPIC_API_KEY=<your-anthropic-key>
OPENAI_API_KEY=<your-openai-key>
COHERE_API_KEY=<your-cohere-key>  # Optional
```

### Optional / Feature Flags

#### OS / Experimental Systems
```bash
MESHOS_ENABLED=true
OPERATOROS_ENABLED=true
HCL_ENABLED=true
```

#### Analytics (Optional)
```bash
NEXT_PUBLIC_POSTHOG_KEY=<optional>
NEXT_PUBLIC_POSTHOG_HOST=<optional>
```

#### Application URLs (Used in Code)
```bash
NEXT_PUBLIC_APP_URL=<app-url>
NEXT_PUBLIC_SITE_URL=<site-url>
VERCEL_URL=<auto-set-by-vercel>
```

#### Development Only
```bash
SUPABASE_DEV_USER_ID=<dev-user-id>  # Local development only
NODE_ENV=development  # Auto-set by Next.js
```

#### Google OAuth (If Using Integrations)
```bash
GOOGLE_CLIENT_ID=<google-client-id>
GOOGLE_CLIENT_SECRET=<google-client-secret>
GOOGLE_REDIRECT_URI=<redirect-uri>
NEXT_PUBLIC_GMAIL_CLIENT_ID=<gmail-client-id>
GMAIL_CLIENT_SECRET=<gmail-client-secret>
NEXT_PUBLIC_GOOGLE_SHEETS_CLIENT_ID=<sheets-client-id>
GOOGLE_SHEETS_CLIENT_SECRET=<sheets-client-secret>
```

#### Telegram (If Using)
```bash
TELEGRAM_BOT_TOKEN=<bot-token>
TELEGRAM_CHAT_ID=<chat-id>
```

---

## 🚀 Railway Deployment Variables

### Copy-Paste for Railway Dashboard

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://ucncbighzqudaszewjrv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjbmNiaWdoenF1ZGFzemV3anJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5MTU2MjEsImV4cCI6MjA3NDQ5MTYyMX0.byAFslDRcX_Peto69Z7jG90CoWnQRaqNGOzhxteAgCI
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjbmNiaWdoenF1ZGFzemV3anJ2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODkxNTYyMSwiZXhwIjoyMDc0NDkxNjIxfQ.jNbVTjvh7uOGINRPXJ6TFQJuNEbOLuOccVm8nqnlgPE

# Auth (Generate NEXTAUTH_SECRET after deployment)
NEXTAUTH_URL=<will-be-railway-url>
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>

# AI Keys
ANTHROPIC_API_KEY=sk-ant-your-anthropic-api-key-here
OPENAI_API_KEY=sk-your-openai-api-key-here
COHERE_API_KEY=<optional>

# OS / Experimental Systems
MESHOS_ENABLED=true
OPERATOROS_ENABLED=true
HCL_ENABLED=true

# Analytics (Optional)
NEXT_PUBLIC_POSTHOG_KEY=<optional>
NEXT_PUBLIC_POSTHOG_HOST=<optional>
```

---

## 📝 Variable Usage in Codebase

### Where Variables Are Used

1. **Supabase Client** (`apps/aud-web/src/lib/supabase/serviceRole.ts`):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_URL` (fallback)

2. **API Routes** (`apps/aud-web/src/app/api/flow-hub/brief/route.ts`):
   - `ANTHROPIC_API_KEY`

3. **EPK Collaborators** (`apps/aud-web/src/app/api/epk/[epkId]/collaborators/route.ts`):
   - `NEXT_PUBLIC_APP_URL`
   - `NEXT_PUBLIC_SITE_URL`
   - `VERCEL_URL`

4. **Hooks** (`apps/aud-web/src/hooks/useEpkCollaborators.ts`):
   - `NEXT_PUBLIC_APP_URL`

---

## 🔒 Security Notes

### Sensitive Variables (Never Commit)
- ✅ `SUPABASE_SERVICE_ROLE_KEY` - Server-side only
- ✅ `NEXTAUTH_SECRET` - Must be random
- ✅ `OPENAI_API_KEY` - API key
- ✅ `ANTHROPIC_API_KEY` - API key
- ✅ `TELEGRAM_BOT_TOKEN` - Bot token
- ✅ `GOOGLE_CLIENT_SECRET` - OAuth secret
- ✅ `GMAIL_CLIENT_SECRET` - OAuth secret

### Public Variables (Safe to Commit)
- ✅ `NEXT_PUBLIC_SUPABASE_URL` - Public URL
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public key (RLS protected)
- ✅ `MESHOS_ENABLED` - Feature flag
- ✅ `OPERATOROS_ENABLED` - Feature flag
- ✅ `HCL_ENABLED` - Feature flag

---

## 🎯 Quick Reference

### Generate NEXTAUTH_SECRET
```bash
openssl rand -base64 32
```

### Check Current Variables
```bash
# Root .env.local
cat .env.local

# App-specific .env.local
cat apps/aud-web/.env.local

# Production template
cat apps/aud-web/.env.production
```

### Railway Deployment Checklist
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `NEXTAUTH_URL` (use Railway URL after deploy)
- [ ] `NEXTAUTH_SECRET` (generate)
- [ ] `ANTHROPIC_API_KEY`
- [ ] `OPENAI_API_KEY`
- [ ] `MESHOS_ENABLED=true`
- [ ] `OPERATOROS_ENABLED=true`
- [ ] `HCL_ENABLED=true`

---

**Last Updated**: 2025-01-22  
**Source Files**: `.env.local`, `apps/aud-web/.env.local`, `.env.example`

