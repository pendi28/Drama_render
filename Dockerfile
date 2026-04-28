FROM node:20-alpine AS builder

RUN corepack enable

WORKDIR /app

# Copy manifest files first for better layer caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc tsconfig.base.json tsconfig.json ./
COPY artifacts/api-server/package.json ./artifacts/api-server/
COPY artifacts/drama-app/package.json ./artifacts/drama-app/
COPY artifacts/mockup-sandbox/package.json ./artifacts/mockup-sandbox/
COPY lib/api-spec/package.json ./lib/api-spec/
COPY lib/api-zod/package.json ./lib/api-zod/
COPY lib/api-client-react/package.json ./lib/api-client-react/
COPY lib/db/package.json ./lib/db/
COPY scripts/package.json ./scripts/

RUN pnpm install --frozen-lockfile

# Copy the rest of the source
COPY . .

# Generate API client + build everything
RUN pnpm --filter @workspace/api-spec run codegen \
  && pnpm --filter @workspace/db exec tsc -b \
  && pnpm --filter @workspace/drama-app run build \
  && pnpm --filter @workspace/api-server run build

# ---- Runtime ----
FROM node:20-alpine

RUN corepack enable

WORKDIR /app

COPY --from=builder /app /app

ENV NODE_ENV=production
ENV STATIC_DIR=/app/artifacts/drama-app/dist/public
ENV PORT=8080

EXPOSE 8080

CMD ["pnpm", "--filter", "@workspace/api-server", "run", "start"]
