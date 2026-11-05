import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('index.css', () => {
  it('déclare les polices auto-hébergées', () => {
    const css = readFileSync(resolve(__dirname, 'index.css'), 'utf8')
    expect(css).not.toContain('fonts.googleapis.com')
    expect(css).toMatch(/--font-display:\s*"Bricolage Grotesque Variable"/)
  })
})
