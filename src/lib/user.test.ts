import { describe, expect, it } from 'vitest'
import { initials } from './user'

describe('initials', () => {
  it('takes the first and the last word', () => {
    expect(initials('Alex Pupkin')).toBe('AP')
    expect(initials('Anna Maria Lind')).toBe('AL')
  })

  it('one word gives one letter, empty gives nothing', () => {
    expect(initials('Alex')).toBe('A')
    expect(initials('   ')).toBe('')
  })

  it('is upper case', () => {
    expect(initials('alex pupkin')).toBe('AP')
  })
})
