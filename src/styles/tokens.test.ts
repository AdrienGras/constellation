import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('tokens.css', () => {
  it('est une copie exacte du design system', () => {
    const copie = readFileSync(resolve(__dirname, 'tokens.css'), 'utf8')
    const original = readFileSync(
      resolve(__dirname, '../../maquette/design-system/tokens.css'),
      'utf8',
    )
    expect(copie).toBe(original)
  })
})
