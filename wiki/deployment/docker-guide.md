# Docker & Deployment Guide

Planning document for containerizing and deploying TropiGo.

## Current Issue: Type Imports

**Problem:**
```typescript
// UI importing from API source (will break in Docker)
import type { Experience } from '../../../api/src/db/schema'
```

In Docker:
- UI container = Built static files only
- API container = Bun runtime with source
- UI won't have access to `api/src/` ❌

**Solution (do this before dockerizing):**

### Option 1: Use Shared Types Package (Recommended)

**Re-export types from shared package:**
```typescript
// packages/types/src/index.ts
export type {
  Experience,
  User,
  NewExperience,
  NewUser
} from '../../apps/api/src/db/schema'
```

**Update UI imports:**
```typescript
// apps/ui/src/api/experiences.ts
import type { Experience } from '@tropigo/types'  // ✓ Works in Docker
```

**Why this works:**
- Types available during build (monorepo structure)
- UI build can resolve workspace packages
- After build, UI only ships static files (no types needed)

### Option 2: API Type Package

Create a separate package that API exports:
```
packages/
  └── api-types/
      └── src/
          └── index.ts  # Export inferred types
```

Both approaches work - Option 1 is simpler.

---

## Docker Architecture

### Overview

```
┌─────────────────────────────────────────┐
│          Nginx / Caddy                  │
│         (Reverse Proxy)                 │
│  ┌──────────────┐   ┌──────────────┐  │
│  │ UI (Static)  │   │   API (Bun)  │  │
│  │ port: 80/443 │   │  port: 8060  │  │
│  └──────────────┘   └──────────────┘  │
│           ▲                ▲            │
│           │                │            │
│           └────────────────┴───────┐   │
│                                    │   │
│                          ┌─────────▼──┐│
│                          │ PostgreSQL ││
│                          │ port: 5432 ││
│                          └────────────┘│
└─────────────────────────────────────────┘
```

### Container Strategy

**3 Containers:**
1. **UI Container** - Nginx serving built React app
2. **API Container** - Bun runtime with Hono API
3. **Database** - PostgreSQL (already in docker-compose)

Optional:
4. **Grafana** - Monitoring (already in docker-compose)
5. **Loki** - Logging (already in docker-compose)

---

## Dockerfiles

### UI Dockerfile

**Location:** `apps/ui/Dockerfile`

```dockerfile
# Multi-stage build
FROM node:18 AS builder

# Set working directory
WORKDIR /app

# Copy entire monorepo (needed for workspace packages)
COPY package.json bun.lock ./
COPY apps ./apps
COPY packages ./packages

# Install dependencies
RUN npm install -g bun
RUN bun install

# Build UI
WORKDIR /app/apps/ui
RUN bun run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/apps/ui/dist /usr/share/nginx/html

# Copy nginx config
COPY apps/ui/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**Nginx Config** (`apps/ui/nginx.conf`):
```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # SPA routing - all routes go to index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy (optional - can also point directly to API container)
    location /api {
        proxy_pass http://api:8060;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### API Dockerfile

**Location:** `apps/api/Dockerfile`

```dockerfile
FROM oven/bun:1

WORKDIR /app

# Copy package files
COPY package.json bun.lock ./
COPY apps/api/package.json ./apps/api/
COPY packages ./packages

# Install dependencies
RUN bun install

# Copy API source
COPY apps/api ./apps/api

# Set working directory to API
WORKDIR /app/apps/api

# Expose port
EXPOSE 8060

# Start API
CMD ["bun", "run", "src/index.ts"]
```

### Docker Compose

**Location:** `docker-compose.prod.yml`

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:18-alpine
    container_name: tropigo-db
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${DB_USER:-postgres}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-postgres}
      POSTGRES_DB: ${DB_NAME:-tropigo}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - tropigo-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    container_name: tropigo-api
    restart: unless-stopped
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://${DB_USER:-postgres}:${DB_PASSWORD:-postgres}@postgres:5432/${DB_NAME:-tropigo}
    ports:
      - "8060:8060"
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - tropigo-network

  ui:
    build:
      context: .
      dockerfile: apps/ui/Dockerfile
    container_name: tropigo-ui
    restart: unless-stopped
    ports:
      - "80:80"
    depends_on:
      - api
    networks:
      - tropigo-network

volumes:
  postgres_data:

networks:
  tropigo-network:
    driver: bridge
```

---

## Deployment Options

### Option 1: Docker on VPS (Recommended)

**Pros:**
- Isolated environments
- Easy to replicate
- Can scale containers
- Consistent across dev/prod

**Steps:**
1. SSH into VPS
2. Install Docker & Docker Compose
3. Clone repo
4. Run `docker-compose -f docker-compose.prod.yml up -d`

**VPS Requirements:**
- 2 CPU cores
- 4GB RAM
- 20GB storage
- Ubuntu 22.04 or similar

### Option 2: Direct Deployment (Simpler)

**Pros:**
- No Docker overhead
- Simpler debugging
- Faster for small projects

**Steps:**
1. SSH into VPS
2. Install Bun, PostgreSQL, Nginx
3. Clone repo
4. Build UI: `bun run --cwd apps/ui build`
5. Serve UI with Nginx
6. Run API: `bun run --cwd apps/api start`
7. Use PM2 to keep API running

### Option 3: Platform Services

**Pros:**
- Managed infrastructure
- Auto-scaling
- Easy CI/CD

**Options:**
- **Railway** - Deploy from GitHub, supports monorepo
- **Render** - Free tier, Docker support
- **Fly.io** - Global edge deployment
- **Vercel (UI) + Railway (API)** - Separate services

---

## Environment Variables

### Required for Production

**API (.env):**
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/db
PORT=8060
CORS_ORIGIN=https://yourdomain.com
```

**UI (.env):**
```env
VITE_API_URL=https://api.yourdomain.com
```

### Using .env in Docker

**Create `.env` file:**
```env
DB_USER=postgres
DB_PASSWORD=your_secure_password
DB_NAME=tropigo
API_PORT=8060
```

**Reference in docker-compose:**
```yaml
environment:
  DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}
```

---

## Pre-Deployment Checklist

### Code Changes

- [ ] Fix type imports (use `@tropigo/types` instead of direct API imports)
- [ ] Add environment variable handling
- [ ] Update API URL in UI (use env var)
- [ ] Add production build scripts
- [ ] Configure CORS for production domain

### Docker Setup

- [ ] Create `apps/ui/Dockerfile`
- [ ] Create `apps/api/Dockerfile`
- [ ] Create `apps/ui/nginx.conf`
- [ ] Create `docker-compose.prod.yml`
- [ ] Create `.env.example` file
- [ ] Test build locally: `docker-compose -f docker-compose.prod.yml build`

### Database

- [ ] Run migrations: `bun run db:push` or `bun run db:migrate`
- [ ] Seed production data (if needed)
- [ ] Set up database backups
- [ ] Configure connection pooling

### Security

- [ ] Use strong database password
- [ ] Enable HTTPS (Let's Encrypt)
- [ ] Configure firewall rules
- [ ] Set up rate limiting
- [ ] Add authentication to API
- [ ] Sanitize user inputs

### Monitoring

- [ ] Set up logging (Loki already configured)
- [ ] Configure Grafana dashboards
- [ ] Set up error tracking (Sentry)
- [ ] Add health check endpoints
- [ ] Configure alerts

---

## Build and Deploy Commands

### Local Testing

```bash
# Build UI
bun run --cwd apps/ui build

# Test production build
bun run --cwd apps/ui preview

# Build API (if needed)
bun run --cwd apps/api build
```

### Docker Build

```bash
# Build all services
docker-compose -f docker-compose.prod.yml build

# Start services
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop services
docker-compose -f docker-compose.prod.yml down
```

### VPS Deployment

```bash
# SSH into VPS
ssh user@your-vps-ip

# Clone repo
git clone <your-repo-url>
cd tropigo-by-leapone

# Create .env file
nano .env

# Build and start
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps
```

---

## CI/CD with GitHub Actions

**Location:** `.github/workflows/deploy.yml`

```yaml
name: Deploy to VPS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Deploy to VPS
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd tropigo-by-leapone
            git pull
            docker-compose -f docker-compose.prod.yml build
            docker-compose -f docker-compose.prod.yml up -d
```

---

## Troubleshooting

### Build Fails

**Issue:** `Cannot find module '@tropigo/types'`
**Fix:** Make sure entire monorepo is copied during Docker build

**Issue:** `EACCES: permission denied`
**Fix:** Run with sudo or fix Docker permissions

### Container Won't Start

**Issue:** Port already in use
**Fix:** Stop conflicting services or change port mapping

**Issue:** Database connection failed
**Fix:** Check `DATABASE_URL` and ensure PostgreSQL is running

### Type Errors in Production

**Issue:** UI can't find API types
**Fix:** Follow "Type Imports" section above

---

## Performance Optimization

### UI Optimizations

- Enable gzip compression in Nginx
- Add caching headers
- Minify assets (Vite does this)
- Use CDN for static assets

### API Optimizations

- Enable PostgreSQL connection pooling
- Add Redis caching layer
- Use database indexes
- Implement rate limiting

### Docker Optimizations

- Use multi-stage builds (already in Dockerfiles)
- Minimize layer size
- Use .dockerignore
- Cache dependencies layer

---

## When You're Ready to Deploy

1. **Review this guide**
2. **Fix type imports** (use shared package)
3. **Test locally with Docker**
   ```bash
   docker-compose -f docker-compose.prod.yml up
   ```
4. **Set up VPS** (if using Option 1)
5. **Configure domain and SSL**
6. **Deploy and monitor**

## Helpful Resources

- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Bun in Docker](https://bun.sh/guides/ecosystem/docker)
- [Nginx Configuration](https://nginx.org/en/docs/)
- [Let's Encrypt SSL](https://letsencrypt.org/getting-started/)

---

**Note:** This is a planning document. Implement these steps when you're ready to deploy. For hackathon, direct deployment might be faster!
