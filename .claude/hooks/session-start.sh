#!/bin/bash
# Cloud sessions (Claude Code on the web): install dependencies and start Storybook, so that
# `npm test` works and the `storybook` MCP server from .mcp.json has something to connect to.
# Synchronous on purpose: Claude Code gives an HTTP MCP server only a few retries at startup.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-$(dirname "$0")/../..}"

# npm install, not npm ci: keeps node_modules, which the cached container reuses.
npm install --no-audit --no-fund

MCP_URL="http://localhost:6006/mcp"
is_up() { curl -s -o /dev/null -m 2 -X POST -H 'Content-Type: application/json' -d '{}' "$MCP_URL"; }

if ! is_up; then
  # Detached: keeps running after the hook exits. Log for when the MCP server fails to connect.
  setsid nohup npm run storybook -- --ci --no-open > /tmp/storybook.log 2>&1 < /dev/null &
  for _ in $(seq 1 90); do
    is_up && break
    sleep 1
  done
fi

is_up && echo "Storybook is up: $MCP_URL" || echo "Storybook did not start in 90s, see /tmp/storybook.log"
