#!/bin/bash
set -e

REMOTE="yxzk@192.168.3.228"
REMOTE_PATH="/opt/docker-compose/front/design-tool"
DIST_DIR=".deploy-dist"

# ── Step 1: Local build ──────────────────────────────────
echo "==> Building locally..."
rm -rf ${DIST_DIR}
pnpm build

# ── Step 2: Assemble deployment package ───────────────────
echo "==> Assembling deployment package..."
mkdir -p ${DIST_DIR}

# Copy standalone server (rsync handles pnpm symlinks correctly)
rsync -a .next/standalone/ ${DIST_DIR}/

# Copy static assets into .next/static
mkdir -p ${DIST_DIR}/.next/static
rsync -a .next/static/ ${DIST_DIR}/.next/static/

# Copy public assets
mkdir -p ${DIST_DIR}/public
rsync -a public/ ${DIST_DIR}/public/

# Copy database migrations and scripts
mkdir -p ${DIST_DIR}/migrations
rsync -a src/database/migrations/ ${DIST_DIR}/migrations/
cp scripts/migrate.js ${DIST_DIR}/migrate.js
chmod +x docker-entrypoint.sh
cp docker-entrypoint.sh ${DIST_DIR}/docker-entrypoint.sh
cp server-standalone.js ${DIST_DIR}/server-standalone.js

echo "    Package size: $(du -sh ${DIST_DIR} | cut -f1)"

# ── Step 3: Sync to remote ────────────────────────────────
echo "==> Syncing to ${REMOTE}:${REMOTE_PATH}..."
rsync -avz --delete \
  ${DIST_DIR}/ ${REMOTE}:${REMOTE_PATH}/dist/

# Sync docker files
rsync -avz \
  Dockerfile.minimal ${REMOTE}:${REMOTE_PATH}/Dockerfile.minimal
rsync -avz \
  docker-compose.yml ${REMOTE}:${REMOTE_PATH}/docker-compose.yml

# ── Step 4: Build image and restart on remote ─────────────
echo "==> Deploying on remote..."
ssh ${REMOTE} "cd ${REMOTE_PATH} \
  && echo 'yxzk123.' | sudo -S docker-compose -f docker-compose.yml down 2>/dev/null || true \
  && echo 'yxzk123.' | sudo -S docker build -f Dockerfile.minimal -t dev-tool:latest . \
  && MAX_RETRIES=3 RETRY_COUNT=0; while [ \$RETRY_COUNT -lt \$MAX_RETRIES ]; do \
      if echo 'yxzk123.' | sudo -S docker-compose -f docker-compose.yml up -d; then \
        break; \
      else \
        RETRY_COUNT=\$((RETRY_COUNT + 1)); \
        if [ \$RETRY_COUNT -lt \$MAX_RETRIES ]; then \
          echo \"部署失败，等待 5 秒后重试 (\$RETRY_COUNT/\$MAX_RETRIES)...\"; \
          sleep 5; \
        else \
          echo '部署失败，已重试 \$MAX_RETRIES 次'; \
          exit 1; \
        fi; \
      fi; \
    done \
  && echo 'yxzk123.' | sudo -S docker image prune -f"

# ── Cleanup ───────────────────────────────────────────────
rm -rf ${DIST_DIR}

echo "==> Deploy done! http://${REMOTE}:6006"
