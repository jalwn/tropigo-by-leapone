# ============================================================================
# Multi-stage Dockerfile for TropiGo UI (Bun Monorepo)
# ============================================================================

FROM oven/bun:1.3.4 AS base
WORKDIR /usr/src/app

# ============================================================================
# Install dependencies into temp directory for layer caching
# ============================================================================
FROM base AS install
RUN mkdir -p /temp/prod
COPY package.json bun.lock* /temp/prod/
# Copy workspace apps BEFORE install (required for workspace resolution)
COPY apps /temp/prod/apps
COPY packages /temp/prod/packages
# Install dependencies
RUN cd /temp/prod && bun install --frozen-lockfile

# ============================================================================
# Build stage
# ============================================================================
FROM base AS builder

# Copy node_modules from install stage
COPY --from=install /temp/prod/node_modules node_modules
# Copy workspace apps
COPY --from=install /temp/prod/apps apps
# Copy packages
COPY --from=install /temp/prod/packages packages
# Copy root package.json
COPY package.json .

# Build the application with API URL (relative path for nginx proxy)
# The VITE_ prefix makes it available to Vite during build
ARG VITE_API_URL=/api
ENV VITE_API_URL=${VITE_API_URL}
RUN cd apps/ui && VITE_API_URL=${VITE_API_URL} bun run build

# ============================================================================
# Serve with nginx
# ============================================================================
FROM nginx:alpine AS runner

# Copy built assets from builder
COPY --from=builder /usr/src/app/apps/ui/dist /usr/share/nginx/html

# Copy nginx configuration
COPY apps/ui/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 8070

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
