FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

FROM base AS builder
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm turbo build --filter=@cyberfaith/core-api

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/core-api/dist ./dist
COPY --from=builder /app/apps/core-api/package.json ./package.json

EXPOSE 4000
CMD ["node", "dist/main.js"]
