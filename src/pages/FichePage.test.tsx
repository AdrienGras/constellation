import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RouterProvider, createMemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { metierParId } from '../donnees'
import { roadmapVide } from '../logique/roadmap'
import { CLES } from '../logique/stockage'
import { routes } from '../routes'

let router: ReturnType<typeof createMemoryRouter>

function monter(chemin: string) {
  window.scrollTo = vi.fn()
  router = createMemoryRouter(routes, { initialEntries: [chemin] })
  render(<RouterProvider router={router} />)
}

function cibleStockee() {
  const brut = localStorage.getItem(CLES.roadmap)
  return brut ? (JSON.parse(brut) as { cible: string | null }).cible : null
}

beforeEach(() => localStorage.clear())

describe('FichePage', () => {
  it('affiche l’en-tête de dev-backend et le titre du document', async () => {
    monter('/fiche/dev-backend')
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Développeur·se back-end' }),
    ).toBeInTheDocument()
    expect(document.title).toBe('Développeur·se back-end · constellation')
    expect(screen.getByText('ROME M1855')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '← Retour au plan' })).toHaveAttribute('href', '/')
    expect(screen.queryByRole('heading', { name: 'On y arrive depuis' })).toBeNull()
  })

  it('le lien roadmap.sh s’ouvre dans un nouvel onglet', async () => {
    monter('/fiche/dev-backend')
    const lien = await screen.findByRole('link', { name: /Voir la roadmap sur roadmap\.sh/ })
    expect(lien).toHaveAttribute('href', 'https://roadmap.sh/backend')
    expect(lien).toHaveAttribute('target', '_blank')
    expect(lien).toHaveAttribute('rel', 'noopener noreferrer')
    expect(lien).toHaveTextContent('(nouvel onglet)')
  })

  it('place les salaires cibles après le parcours', async () => {
    monter('/fiche/dev-backend')
    const parcours = await screen.findByRole('heading', { name: 'Parcours' })
    const salaires = screen.getByRole('heading', { name: 'Salaires cibles' })
    expect(
      parcours.compareDocumentPosition(salaires) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
    expect(
      screen.getByText(/Ces deux sources ne mesurent pas la même chose : ne les compare pas entre elles\.$/),
    ).toBeInTheDocument()
  })

  it('dsi liste ses métiers d’origine et n’a pas de lien roadmap.sh', async () => {
    monter('/fiche/dsi')
    const titre = await screen.findByRole('heading', { name: 'On y arrive depuis' })
    const liste = titre.parentElement as HTMLElement
    const liens = within(liste).getAllByRole('link')
    expect(liens).toHaveLength(3)
    expect(liens.map((l) => l.getAttribute('href'))).toContain('/fiche/cto')
    expect(screen.queryByRole('link', { name: /roadmap\.sh/ })).toBeNull()
    expect(screen.getByText('ROME M1803')).toBeInTheDocument()
  })

  it('integrateur-web : source rédaction et note de fiabilité', async () => {
    monter('/fiche/integrateur-web')
    expect(
      await screen.findByText('Texte : Rédaction CODA, relue par Adrien Gras.'),
    ).toBeInTheDocument()
    expect(screen.getByText(/^Fiabilité : poste souvent non cadre/)).toBeInTheDocument()
  })

  it('cigref : source citée sans note quand elle est absente', async () => {
    monter('/fiche/dev-backend')
    expect(
      await screen.findByText('Texte : Cigref, nomenclature des profils métiers du SI (2025).'),
    ).toBeInTheDocument()
    expect(screen.queryByText(/^Fiabilité :/)).toBeNull()
  })

  it('chaque voisin est un lien vers sa fiche', async () => {
    monter('/fiche/dev-backend')
    await screen.findByRole('heading', { level: 1 })
    const m = metierParId('dev-backend')!
    for (const id of [...m.voisins_meme_categorie, ...m.voisins_autres_categories]) {
      const titre = metierParId(id)!.titre
      expect(screen.getByRole('link', { name: titre })).toHaveAttribute('href', `/fiche/${id}`)
    }
  })

  it('un id inconnu affiche Métier introuvable', async () => {
    monter('/fiche/inconnu')
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Métier introuvable' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Ce métier n’existe pas ou plus dans constellation.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Revenir au plan' })).toHaveAttribute('href', '/')
  })

  it('Viser sans cible enregistre la cible et ouvre la roadmap', async () => {
    monter('/fiche/dev-backend')
    await userEvent.click(await screen.findByRole('button', { name: 'Viser ce métier dans ma roadmap' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/roadmap'))
    expect(cibleStockee()).toBe('dev-backend')
  })

  it('Viser avec une autre cible demande confirmation', async () => {
    localStorage.setItem(CLES.roadmap, JSON.stringify({ ...roadmapVide(), cible: 'dsi' }))
    monter('/fiche/dev-backend')
    await userEvent.click(await screen.findByRole('button', { name: 'Viser ce métier dans ma roadmap' }))
    const dialogue = await screen.findByRole('dialog', { name: 'Changer de métier visé ?' })
    expect(dialogue).toHaveTextContent(
      "Ta roadmap vise aujourd’hui DSI (directeur·rice des systèmes d'information). Tes éléments restent en place.",
    )
    await userEvent.click(within(dialogue).getByRole('button', { name: 'Annuler' }))
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(router.state.location.pathname).toBe('/fiche/dev-backend')
    expect(cibleStockee()).toBe('dsi')

    await userEvent.click(screen.getByRole('button', { name: 'Viser ce métier dans ma roadmap' }))
    await userEvent.click(await screen.findByRole('button', { name: 'Viser Développeur·se back-end' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/roadmap'))
    expect(cibleStockee()).toBe('dev-backend')
  })
})
