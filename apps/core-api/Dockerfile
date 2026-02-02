FROM node:22-slim AS base
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
WORKDIR /app

# Copy everything (monorepo)
COPY . .

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build all packages then core-api
RUN pnpm --filter @cyberfaith/core-api... build

# Production — use tsx to handle TS workspace packages at runtime
EXPOSE 3001
ENV PORT=3001
WORKDIR /app/apps/core-api
CMD ["sh", "start.sh"]
