# ============================================================================
# Multi-stage Dockerfile for TropiGo API (Bun Monorepo)
# Based on official Bun Docker guide: https://bun.com/docs/guides/ecosystem/docker
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
# Install dependencies (creates proper workspace structure with .bun folder)
RUN cd /temp/prod && bun install --frozen-lockfile

# ============================================================================
# Final release image
# ============================================================================
FROM base AS release

# Copy node_modules from temp directory (includes .bun folder and all workspace symlinks)
COPY --from=install --chown=bun:bun /temp/prod/node_modules node_modules
# Copy workspace apps
COPY --from=install --chown=bun:bun /temp/prod/apps apps
# Copy packages
COPY --from=install --chown=bun:bun /temp/prod/packages packages
# Copy root package.json
COPY --chown=bun:bun package.json .

# Set environment
ENV NODE_ENV=production \
    PORT=8060

# Use bun user (already exists in official image)
USER bun

# Expose port
EXPOSE 8060

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD bun run -e 'fetch("http://localhost:8060/health").then(r => r.ok ? process.exit(0) : process.exit(1))' || exit 1

# Start the application in production mode
CMD ["bun", "run", "apps/api/src/index.ts"]
