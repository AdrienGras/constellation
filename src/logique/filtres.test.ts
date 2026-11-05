import { describe, expect, it } from 'vitest'
import { correspondFiltre, FILTRES_VIDES } from './filtres'

const backend = { categorie: 'backend', type: 'entree' as const }
const dsi = { categorie: 'dsi', type: 'evolution' as const }

describe('correspondFiltre', () => {
  it('accepte tout avec les filtres vides', () => {
    expect(correspondFiltre(backend, FILTRES_VIDES)).toBe(true)
    expect(correspondFiltre(dsi, FILTRES_VIDES)).toBe(true)
  })

  it('filtre par catégorie', () => {
    const f = { categories: ['backend'], type: 'tous' as const }
    expect(correspondFiltre(backend, f)).toBe(true)
    expect(correspondFiltre(dsi, f)).toBe(false)
  })

  it('filtre par type', () => {
    const f = { categories: [], type: 'evolution' as const }
    expect(correspondFiltre(backend, f)).toBe(false)
    expect(correspondFiltre(dsi, f)).toBe(true)
  })
})
