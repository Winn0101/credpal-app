# Stage 1: Install dependencies
FROM node:18-alpine AS deps
WORKDIR /app
COPY nodejsapp/package.json nodejsapp/package-lock.json* ./
RUN npm ci --only=production

# Stage 2: Production image
FROM node:18-alpine AS production
WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
COPY --from=deps /app/node_modules ./node_modules
COPY nodejsapp/src ./src
COPY nodejsapp/package.json ./
RUN chown -R appuser:appgroup /app
USER appuser
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "src/index.js"]







