// The signed-in agent, as the sidebar footer shows them.

export interface AgentUser {
  name: string
  email: string
}

/** Avatar initials: first letter of the first and the last word — "Alex Pupkin" → "AP". */
export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return ''
  const first = words[0][0]
  const last = words.length > 1 ? words[words.length - 1][0] : ''
  return (first + last).toUpperCase()
}
