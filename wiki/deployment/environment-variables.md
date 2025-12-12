# Environment Variables Guide

How to manage environment variables in development and production.

## Overview

We use different `.env` files for different purposes:

```
.
├── .env                    # Root (for Docker Compose) - NOT committed
├── .env.example            # Root template - COMMITTED
├── apps/api/.env          # API secrets - NOT committed
├── apps/api/.env.example  # API template - COMMITTED
├── apps/ui/.env           # UI config - NOT committed
└── apps/ui/.env.example   # UI template - COMMITTED
```

**Rule: Only `.env.example` files are committed to git.**

---

## Development Setup

### API Environment Variables

**File:** `apps/api/.env`

```env
# Google Gemini API Key
GOOGLE_GENERATIVE_AI_API_KEY=your_key_here

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/tropigo

# Server
PORT=8060
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:8070
```

**How to get API keys:**
- **Gemini**: https://makersuite.google.com/app/apikey (free)

### UI Environment Variables

**File:** `apps/ui/.env`

```env
# API URL
VITE_API_URL=http://localhost:8060

# Environment
VITE_ENV=development
```

**Important:** Vite only exposes variables prefixed with `VITE_`

### How to Use in Code

**In API (Bun/Node.js):**
```typescript
const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
const dbUrl = process.env.DATABASE_URL
```

**In UI (Vite):**
```typescript
const apiUrl = import.meta.env.VITE_API_URL
const env = import.meta.env.VITE_ENV
```

---

## First-Time Setup

### 1. Copy Example Files

```bash
# API
cp apps/api/.env.example apps/api/.env

# UI
cp apps/ui/.env.example apps/ui/.env

# Root (for later)
cp .env.example .env
```

### 2. Add Your Keys

Edit `apps/api/.env` and add your Gemini API key:
```env
GOOGLE_GENERATIVE_AI_API_KEY=AIza...your_actual_key
```

### 3. Start Development

```bash
bun run dev
```

Bun automatically loads `.env` files!

---

## Production Setup

### Option 1: Platform Environment Variables

Most platforms (Railway, Vercel, Render) let you set env vars in their dashboard.

**No .env file needed** - just add variables in the platform UI.

### Option 2: VPS with .env

If deploying to VPS:

1. SSH into server
2. Create `.env` files
3. Add production values
4. Never commit them!

### Option 3: Docker Compose

**File:** `.env` (root)

```env
DB_USER=postgres
DB_PASSWORD=secure_password_here
DB_NAME=tropigo
API_PORT=8060
GOOGLE_GENERATIVE_AI_API_KEY=your_key
```

**Referenced in `docker-compose.yml`:**
```yaml
services:
  api:
    environment:
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}
      GOOGLE_GENERATIVE_AI_API_KEY: ${GOOGLE_GENERATIVE_AI_API_KEY}
```

---

## Environment Variables Reference

### API Variables

| Variable | Required | Example | Description |
|----------|----------|---------|-------------|
| `GOOGLE_GENERATIVE_AI_API_KEY` | Yes | `AIza...` | Gemini API key |
| `DATABASE_URL` | Yes | `postgresql://...` | PostgreSQL connection |
| `PORT` | No | `8060` | API server port |
| `NODE_ENV` | No | `development` | Environment mode |
| `CORS_ORIGIN` | No | `http://localhost:8070` | Allowed CORS origin |

### UI Variables

| Variable | Required | Example | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | Yes | `http://localhost:8060` | API base URL |
| `VITE_ENV` | No | `development` | Environment mode |

**Remember:** Vite variables must start with `VITE_`

---

## Security Best Practices

### 1. Never Commit Secrets

✅ DO:
```bash
git add .env.example
```

❌ DON'T:
```bash
git add .env  # NEVER!
```

### 2. Use Strong Passwords in Production

```env
# Bad
DB_PASSWORD=postgres

# Good
DB_PASSWORD=xK9mP2nQ8vL5wR7cT4hJ
```

### 3. Rotate API Keys Regularly

If you suspect a key is compromised:
1. Generate new key
2. Update `.env`
3. Restart services
4. Revoke old key

### 4. Different Keys for Different Environments

```env
# Development
GOOGLE_GENERATIVE_AI_API_KEY=dev_key

# Production
GOOGLE_GENERATIVE_AI_API_KEY=prod_key
```

---

## Troubleshooting

### Variable Not Loading

**API (Bun):**
```typescript
console.log('API Key:', process.env.GOOGLE_GENERATIVE_AI_API_KEY)
// If undefined, check:
// 1. .env file exists
// 2. Variable name matches
// 3. No quotes around value
```

**UI (Vite):**
```typescript
console.log('API URL:', import.meta.env.VITE_API_URL)
// If undefined, check:
// 1. Starts with VITE_
// 2. Restart dev server
// 3. .env in ui folder
```

### Gemini API Not Working

**Error:** `API key not valid`

**Fix:**
1. Get new key: https://makersuite.google.com/app/apikey
2. Copy entire key (starts with `AIza`)
3. Paste in `.env` (no quotes needed)
4. Restart API server

### CORS Errors

**Error:** `Access-Control-Allow-Origin`

**Fix:**
```env
# In apps/api/.env
CORS_ORIGIN=http://localhost:8070
```

Then update API:
```typescript
app.use('/*', cors({
  origin: process.env.CORS_ORIGIN || '*'
}))
```

---

## .gitignore Configuration

Already configured! `.env` files are ignored:

```gitignore
# Environment variables
.env
.env.local
.env.*.local
```

But `.env.example` files ARE committed.

---

## Team Workflow

### For New Team Members

1. Clone repo
2. Copy `.env.example` files
3. Get API keys from team lead
4. Add keys to `.env` files
5. Start development

### For Team Lead

1. Share API keys securely (not in Slack/Discord!)
2. Use a password manager or secrets service
3. Document which keys are needed
4. Rotate shared keys periodically

---

## Summary

**Development:**
- Create `.env` files from `.env.example`
- Add your API keys
- Never commit `.env` files
- Share keys securely with team

**Production:**
- Use platform env vars (Railway, Vercel)
- Or root `.env` for Docker
- Use strong passwords
- Rotate keys regularly

**When in doubt:** Check `.env.example` files for templates!
