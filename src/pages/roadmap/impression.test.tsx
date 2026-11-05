import { render, screen } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { RouterProvider, createMemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CLES } from '../../logique/stockage'
import type { EtatRoadmap, Item } from '../../logique/roadmap'
import { routes } from '../../routes'

function monter(cible: string | null, annees: Partial<Record<string, Item[]>> = {}) {
  const etat: EtatRoadmap = {
    version: 1,
    cible,
    annees: { '2027': [], '2028': [], '2029': [], '2030': [], '2031': [], ...annees },
    modifie_le: null,
  }
  localStorage.setItem(CLES.roadmap, JSON.stringify(etat))
  window.scrollTo = vi.fn()
  const router = createMemoryRouter(routes, { initialEntries: ['/roadmap'] })
  return render(<RouterProvider router={router} />)
}

beforeEach(() => {
  localStorage.clear()
  // @ts-expect-error retour à l’absence de matchMedia (jsdom)
  delete window.matchMedia
})

describe('impression de la roadmap', () => {
  it('l’en-tête d’impression existe et porte la cible', () => {
    const { container } = monter('dev-backend')
    const entete = container.querySelector('[data-impression]')
    expect(entete).not.toBeNull()
    expect(entete?.textContent).toContain('Ma roadmap 2027 → 2031 · Développeur·se back-end')
    expect(entete?.textContent).toMatch(/Imprimée le \d{1,2}(er)? \p{L}+ \d{4}/u)
  })

  it('sans cible, l’en-tête indique « métier visé : n.d. »', () => {
    const { container } = monter(null)
    expect(container.querySelector('[data-impression]')?.textContent).toContain(
      'Ma roadmap 2027 → 2031 · métier visé : n.d.',
    )
  })

  it('une année vide affiche une phrase pour l’impression', () => {
    const { container } = monter(null)
    expect(container.querySelectorAll('[data-vide-imprime]')).toHaveLength(5)
    expect(screen.getAllByText('Rien de prévu pour 2027.')).toHaveLength(1)
  })

  it('l’URL imprimée est complète, et seulement pour un élément qui en a une', () => {
    const url = 'https://exemple.fr/un/long/chemin?q=1'
    const { container } = monter(null, {
      '2027': [
        { id: 'a', type: 'projet', titre: 'A', url, note: '' },
        { id: 'c', type: 'notion', titre: 'C', url: '', note: '' },
      ],
    })
    const urls = container.querySelectorAll('[data-url-imprimee]')
    expect(urls).toHaveLength(1)
    expect(urls[0].textContent).toBe(url)
    expect(container.querySelectorAll('[data-actions-item]')).toHaveLength(2)
  })

  it('impression.css masque la navigation et les actions', () => {
    const css = readFileSync(resolve(__dirname, '../../styles/impression.css'), 'utf8')
    expect(css).toContain('@media print')
    expect(css).toContain('size: A4')
    expect(css).toContain('break-inside: avoid')
    for (const sel of ['[data-barre]', '[data-bandeau]', '[data-actions]', '[data-competences]', '[data-actions-item]']) {
      expect(css).toMatch(new RegExp(`${sel.replace(/[[\]]/g, '\\$&')}[^{]*\\{[^}]*display:\\s*none`))
    }
  })
})
