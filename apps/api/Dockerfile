# Dockerfile for TropiGo API
FROM oven/bun:1 AS base
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json ./
COPY bun.lockb* ./
RUN bun install --production

# Production build
FROM base AS runner
WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Expose API port
EXPOSE 8060

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8060

# Run the application
CMD ["bun", "run", "src/index.ts"]
