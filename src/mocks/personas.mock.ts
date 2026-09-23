import type { DefaultOffices } from '@/lib/office'

// "Who is looking" — pinned by ?persona=<id>. Default Offices saved in the sandbox
// are stored per persona on top of these seeds; "Reset demo data" restores them.

export type PersonaId = 'agent-with-defaults' | 'agent-no-defaults'

export interface Persona {
  id: PersonaId
  label: string
  defaults: DefaultOffices
}

export const PERSONAS: Persona[] = [
  {
    id: 'agent-with-defaults',
    label: 'Agent with defaults',
    defaults: { Amadeus: 'A2K9', Sabre: '5GW5', Galileo: 'Q8L3' },
  },
  {
    id: 'agent-no-defaults',
    label: 'Agent without defaults',
    defaults: {},
  },
]

export const DEFAULT_PERSONA: PersonaId = 'agent-with-defaults'

export function getPersona(id: PersonaId): Persona {
  return PERSONAS.find((p) => p.id === id) ?? PERSONAS[0]
}

/** Validates a ?persona= value; unknown values fall back to the default persona. */
export function toPersonaId(value: string | null): PersonaId {
  return PERSONAS.some((p) => p.id === value) ? (value as PersonaId) : DEFAULT_PERSONA
}
