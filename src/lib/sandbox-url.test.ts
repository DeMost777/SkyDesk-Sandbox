import { describe, expect, it } from 'vitest'
import { buildSandboxUrl, DEFAULT_PARAMS, parseSandboxUrl } from './sandbox-url'

describe('sandbox URL', () => {
  it('empty URL → defaults', () => {
    expect(parseSandboxUrl('')).toEqual(DEFAULT_PARAMS)
  })

  it('round-trips a full address', () => {
    const params = {
      page: 'pnr-search' as const,
      persona: 'agent-no-defaults',
      pnr: 'ABC123',
      office: 'C1Z2',
      gds: 'Galileo' as const,
      state: 'result' as const,
    }
    expect(parseSandboxUrl(buildSandboxUrl(params))).toEqual(params)
  })

  it('drops unknown values instead of failing', () => {
    const p = parseSandboxUrl('?page=nope&gds=Worldspan&state=weird&pnr=%207jrwt4')
    expect(p).toMatchObject({ page: 'pnr-search', gds: null, state: 'idle', pnr: '7JRWT4' })
  })

  it('omits defaults, so the plain address stays clean', () => {
    expect(buildSandboxUrl({})).toBe('')
    expect(buildSandboxUrl({ pnr: '7JRWT4' })).toBe('?pnr=7JRWT4')
  })
})
