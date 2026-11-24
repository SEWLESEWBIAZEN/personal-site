
# syntax=docker/dockerfile:1

# ============================================
# Base Stage
# ============================================
FROM node:20-alpine AS base

RUN apk add --no-cache libc6-compat openssl \
    && corepack enable

WORKDIR /app


# ============================================
# Dependencies Stage
# ============================================
FROM base AS deps

COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma

RUN pnpm install --frozen-lockfile


# ============================================
# Builder Stage
# ============================================
FROM base AS builder

ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN pnpm prisma generate && pnpm build


# ============================================
# Database Migration Stage
# Build separately using --target migrate
# ============================================
FROM base AS migrate

WORKDIR /app

ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY prisma ./prisma

CMD ["pnpm", "prisma", "migrate", "deploy"]


# ============================================
# Production Runner Stage
# ============================================
FROM node:20-alpine AS runner

RUN apk add --no-cache openssl

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Create non-root application user
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Copy standalone production output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# Copy static assets
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Prepare application directories
RUN mkdir -p public uploads \
    && chown -R nextjs:nodejs public uploads

# Run as non-root user
USER nextjs

EXPOSE 3000

# Start Next.js standalone server
CMD ["node", "server.js"]
