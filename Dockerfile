# ──────────────────────────────────────────────
# SignalSniper-AI — Production Docker Image
# AMD AI Hackathon · Fireworks AI · Gemma
# ──────────────────────────────────────────────

# Stage 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# Stage 2: Build the application
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Disable Next.js telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1

# Build-time env vars (empty defaults — real values injected at runtime)
ARG FIREWORKS_API_KEY=""
ARG GEMMA_API_URL=""
ENV FIREWORKS_API_KEY=${FIREWORKS_API_KEY}
ENV GEMMA_API_URL=${GEMMA_API_URL}

RUN npm run build

# Stage 3: Production runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

# Security: run as non-root
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone build output
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy prompt templates (readFileSync at runtime)
COPY --from=builder --chown=nextjs:nodejs /app/src/prompts ./src/prompts

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]
