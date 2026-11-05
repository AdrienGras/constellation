import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RouterProvider, createMemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { lignes, metierParId, metiers, questions, stationsDeLigne } from '../donnees'
import { CLES } from '../logique/stockage'
import { routes } from '../routes'

let router: ReturnType<typeof createMemoryRouter>

function monter(chemin = '/liste') {
  window.scrollTo = vi.fn()
  router = createMemoryRouter(routes, { initialEntries: [chemin] })
  return render(<RouterProvider router={router} />)
}

function stockerQuizTermine(reponse: string) {
  const reponses = Object.fromEntries(questions.map((q) => [q.id, reponse]))
  localStorage.setItem(
    CLES.quiz,
    JSON.stringify({ version: 1, reponses, question: 15, departage: [], termine: true }),
  )
}

function liensFiche(): HTMLElement[] {
  return screen
    .getAllByRole('link')
    .filter((a) => a.getAttribute('href')?.startsWith('/fiche/'))
}

function mockerLargeur(etroit: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: !etroit,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia
}

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  // @ts-expect-error retour à l’absence de matchMedia (jsdom)
  delete window.matchMedia
})

describe('ListePage', () => {
  it('affiche le titre, le sous-titre, la bascule et le compteur', () => {
    monter()
    expect(
      screen.getByRole('heading', { level: 1, name: 'Les 68 métiers, ligne par ligne' }),
    ).toBeInTheDocument()
    expect(document.title).toBe('Liste des métiers · constellation')
    expect(
      screen.getByText(/La même chose que le plan, au clavier ou au lecteur d’écran/),
    ).toBeInTheDocument()
    const bascule = screen.getByRole('navigation', { name: 'Affichage' })
    expect(within(bascule).getByRole('link', { name: 'Liste' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.getByText('68 métiers affichés sur 68')).toHaveAttribute('aria-live', 'polite')
  })

  it('pas de légende des lignes sur la liste', () => {
  monter()
  expect(screen.queryByRole('group', { name: 'Légende des lignes' })).toBeNull()
  const titres = screen.getAllByRole('heading', { level: 2 })
  expect(titres).toHaveLength(8)
  for (const h of titres) expect(h.querySelector('[aria-hidden="true"]')).not.toBeNull()
})

it('rend 68 liens de fiche, 8 h2 dans l’ordre des lignes et 17 h3', () => {
    monter()
    expect(liensFiche()).toHaveLength(68)
    const attendus = lignes.map((l) => `Ligne ${l.num}, ${l.libelle}`)
    const h2 = screen
      .getAllByRole('heading', { level: 2 })
      .filter((h) => attendus.some((nom) => h.textContent?.endsWith(nom)))
    expect(h2.map((h) => attendus.find((nom) => h.textContent?.endsWith(nom)))).toEqual(attendus)
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(17)
  })

  it('suit l’ordre du tracé dans une catégorie', () => {
    monter()
    const premiere = lignes[0]
    const attendu = stationsDeLigne(premiere.id)
      .map((id) => metierParId(id)!)
      .filter((m) => m.categorie === premiere.categories[0])
      .map((m) => `/fiche/${m.id}`)
    const section = document.querySelector('details')!
    const premierGroupe = section.querySelector('ul')!
    const liens = within(premierGroupe as HTMLElement)
      .getAllByRole('link')
      .map((a) => a.getAttribute('href'))
    expect(liens).toEqual(attendu)
  })

  it('le filtre Évolution ne garde que les métiers d’évolution', async () => {
    monter()
    await userEvent.click(screen.getByRole('radio', { name: 'Évolution' }))
    const n = metiers.filter((m) => m.type === 'evolution').length
    expect(liensFiche()).toHaveLength(n)
    expect(screen.getByText(`${n} métiers affichés sur 68`)).toBeInTheDocument()
  })

  it('met le compteur au singulier', async () => {
    monter()
    await userEvent.type(screen.getByRole('searchbox', { name: 'Chercher un métier' }), 'back-end')
    expect(screen.getByText('1 métier affiché sur 68')).toBeInTheDocument()
  })

  it('trouve Développeur·se back-end en cherchant developpeur', async () => {
    monter()
    await userEvent.type(
      screen.getByRole('searchbox', { name: 'Chercher un métier' }),
      'DEVELOPPEUR',
    )
    expect(screen.getByRole('link', { name: /Développeur·se back-end/ })).toBeInTheDocument()
    expect(liensFiche().length).toBeLessThan(68)
  })

  it('annonce l’absence de résultat', async () => {
    monter()
    await userEvent.type(screen.getByRole('searchbox', { name: 'Chercher un métier' }), 'zzzzz')
    expect(screen.getByText('Aucun métier ne correspond à ta recherche.')).toBeInTheDocument()
    expect(liensFiche()).toHaveLength(0)
    expect(screen.getByText('0 métier affiché sur 68')).toBeInTheDocument()
  })

  it('après le quiz b, 5 lignes portent la mention d’exploration et 3 un rang', () => {
    stockerQuizTermine('b')
    monter()
    expect(screen.getAllByText('Hors de ton top 3 : zone d’exploration')).toHaveLength(5)
    expect(screen.getAllByText('1er choix')).toHaveLength(2) // encart + section
  })

  it('garde le filtre en revenant sur le plan', async () => {
    monter()
    await userEvent.click(screen.getByRole('radio', { name: 'Évolution' }))
    await userEvent.click(
      within(screen.getByRole('navigation', { name: 'Affichage' })).getByRole('link', {
        name: 'Graphe',
      }),
    )
    expect(router.state.location.pathname).toBe('/')
    expect(screen.getByRole('radio', { name: 'Évolution' })).toBeChecked()
  })

  it('ouvre les sections sur large écran et les replie sur étroit', () => {
    mockerLargeur(false)
    const { unmount } = monter()
    expect(document.querySelectorAll('details[open]')).toHaveLength(8)
    unmount()
    mockerLargeur(true)
    monter()
    expect(document.querySelectorAll('details[open]')).toHaveLength(0)
  })

  it('ouvre les sections qui ont un résultat quand on cherche, même sur étroit', async () => {
    mockerLargeur(true)
    monter()
    await userEvent.type(screen.getByRole('searchbox', { name: 'Chercher un métier' }), 'back-end')
    expect(document.querySelectorAll('details[open]')).toHaveLength(1)
  })
})
