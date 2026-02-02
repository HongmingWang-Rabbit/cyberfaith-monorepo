FROM node:22-slim AS base
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
WORKDIR /app

# Copy workspace root files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

# Copy all package.json files for workspace resolution
COPY apps/core-api/package.json apps/core-api/
COPY packages/ai-provider/package.json packages/ai-provider/
COPY packages/auth-client/package.json packages/auth-client/
COPY packages/db-utils/package.json packages/db-utils/
COPY packages/types/package.json packages/types/
COPY packages/utils/package.json packages/utils/
COPY packages/config-typescript/package.json packages/config-typescript/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY apps/core-api/ apps/core-api/
COPY packages/ packages/

# Build
RUN pnpm --filter @cyberfaith/core-api build

# Production
FROM node:22-slim
WORKDIR /app
COPY --from=base /app/apps/core-api/dist ./dist
COPY --from=base /app/apps/core-api/node_modules ./node_modules
COPY --from=base /app/node_modules/.pnpm ./node_modules/.pnpm
COPY --from=base /app/apps/core-api/package.json ./

EXPOSE 3001
ENV PORT=3001
CMD ["node", "dist/main"]
