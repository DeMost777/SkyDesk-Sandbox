#!/bin/bash
# SessionStart (Claude Code on the web): install dependencies and start Storybook in the
# background, so the Storybook MCP server (http://localhost:6006/mcp, .mcp.json) is up —
# the agent reads UI docs only through it (CLAUDE.md → «Решения и gotchas»).
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-$(dirname "$0")/../..}"

# npm install, not npm ci: the container is cached after the hook, so later sessions skip it.
npm install --no-audit --no-fund >/dev/null

# POST ping with a timeout: a plain GET on /mcp opens an event stream and never returns.
mcp_ready() {
  curl -s -o /dev/null -w '%{http_code}' --max-time 3 -X POST http://localhost:6006/mcp \
    -H 'Content-Type: application/json' -H 'Accept: application/json, text/event-stream' \
    -d '{"jsonrpc":"2.0","id":0,"method":"ping"}' | grep -q '^200$'
}

# Idempotent: a Storybook already answering on 6006 is reused.
if ! mcp_ready; then
  # setsid + nohup: Storybook outlives the hook process.
  setsid nohup npx storybook dev -p 6006 --ci --no-open >/tmp/storybook.log 2>&1 < /dev/null &
fi

# Wait until the MCP endpoint answers (first start ≈ 15–20 s), so the MCP client can connect.
for _ in $(seq 1 60); do
  if mcp_ready; then
    echo "Storybook MCP ready: http://localhost:6006/mcp"
    exit 0
  fi
  sleep 2
done

echo "Storybook did not start in 120 s — see /tmp/storybook.log. Fallback: npm run storybook:docs" >&2
exit 0
