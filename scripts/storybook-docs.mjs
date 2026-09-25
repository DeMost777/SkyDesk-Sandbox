// Fallback CLI for the Storybook MCP docs tools, when the MCP server is not connected in a session.
//   npm run storybook:docs                         → docs-list
//   npm run storybook:docs -- show <id>            → docs-show
//   npm run storybook:docs -- story <storyId>      → docs-show-story
// Needs a running Storybook (started by .claude/hooks/session-start.sh, or `npm run storybook`).
// STORYBOOK_MCP_URL overrides http://localhost:6006/mcp.

const url = process.env.STORYBOOK_MCP_URL ?? 'http://localhost:6006/mcp'
const [command = 'list', id] = process.argv.slice(2)
const calls = {
  list: ['docs-list', {}],
  show: ['docs-show', { id }],
  story: ['docs-show-story', { storyId: id }],
}
if (!calls[command] || (command !== 'list' && !id)) {
  console.error('Usage: npm run storybook:docs [-- list | show <id> | story <storyId>]')
  process.exit(2)
}
const [name, args] = calls[command]

let res
try {
  res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name, arguments: args } }),
    signal: AbortSignal.timeout(30_000),
  })
} catch (e) {
  console.error(`Storybook MCP is not reachable at ${url} (${e.message}). Start it: npm run storybook`)
  process.exit(1)
}
// The server answers as a server-sent event: "data: {json}".
const body = await res.text()
const json = JSON.parse(body.split('\n').find((l) => l.startsWith('data: '))?.slice(6) ?? body)
if (json.error) {
  console.error(json.error.message ?? JSON.stringify(json.error))
  process.exit(1)
}
const text = json.result.content.map((c) => c.text ?? '').join('\n')
console.log(text)
process.exit(json.result.isError ? 1 : 0)
