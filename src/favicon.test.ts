import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('favicon', () => {
  it('index.html référence un favicon local qui existe dans public/', () => {
    const html = readFileSync(resolve(__dirname, '../index.html'), 'utf8')
    const lien = html.match(/<link rel="icon"[^>]*href="([^"]+)"/)
    expect(lien).not.toBeNull()
    const href = lien![1]
    expect(href).not.toMatch(/^https?:/)
    expect(existsSync(resolve(__dirname, '../public', href.replace(/^\//, '')))).toBe(true)
  })
})
