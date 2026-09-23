import { describe, expect, it } from 'vitest'
import { cn } from './utils'

describe('cn — custom token classes', () => {
  it('keeps a token font size next to a text colour', () => {
    expect(cn('text-2xs', 'text-muted-foreground')).toBe('text-2xs text-muted-foreground')
    expect(cn('text-heading', 'text-foreground')).toBe('text-heading text-foreground')
  })

  it('still resolves real conflicts between token classes', () => {
    expect(cn('text-sm', 'text-2xs')).toBe('text-2xs')
    expect(cn('rounded-md', 'rounded-card')).toBe('rounded-card')
    expect(cn('shadow-md', 'shadow-popover')).toBe('shadow-popover')
  })
})
