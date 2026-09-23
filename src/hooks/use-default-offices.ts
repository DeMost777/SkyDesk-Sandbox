// Default Offices, persisted like the backend would: saved per persona in localStorage,
// so a saved default survives a reload. Seeds come from personas.mock.ts.
import * as React from 'react'
import type { DefaultOffices, GDS } from '@/lib/office'
import { getPersona, type PersonaId } from '@/mocks/personas.mock'

const storageKey = (persona: PersonaId) => `skydesk-sandbox:default-offices:${persona}`

function load(persona: PersonaId): DefaultOffices {
  try {
    const raw = window.localStorage.getItem(storageKey(persona))
    if (raw) return JSON.parse(raw) as DefaultOffices
  } catch {
    // Storage blocked or corrupted — fall back to the seed.
  }
  return getPersona(persona).defaults
}

function save(persona: PersonaId, value: DefaultOffices) {
  try {
    window.localStorage.setItem(storageKey(persona), JSON.stringify(value))
  } catch {
    // Storage blocked — keep working in memory.
  }
}

export function useDefaultOffices(persona: PersonaId) {
  const [defaults, setDefaults] = React.useState<DefaultOffices>(() => load(persona))

  const setDefault = React.useCallback(
    (gds: GDS, code: string | null) => {
      setDefaults((prev) => {
        const next = { ...prev }
        if (code) next[gds] = code
        else delete next[gds]
        save(persona, next)
        return next
      })
    },
    [persona],
  )

  /** SANDBOX-ONLY: back to the persona's seed data. */
  const reset = React.useCallback(() => {
    try {
      window.localStorage.removeItem(storageKey(persona))
    } catch {
      // ignore
    }
    setDefaults(getPersona(persona).defaults)
  }, [persona])

  return { defaults, setDefault, reset }
}
