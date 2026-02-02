FROM node:22-slim AS base
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
WORKDIR /app

# Copy everything (monorepo)
COPY . .

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build core-api
RUN pnpm --filter @cyberfaith/core-api build

# Production — run from the monorepo root
EXPOSE 3001
ENV PORT=3001
WORKDIR /app/apps/core-api
CMD ["node", "dist/main"]
