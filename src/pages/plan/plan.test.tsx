import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RouterProvider, createMemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { questions } from '../../donnees'
import { CLES } from '../../logique/stockage'
import { routes } from '../../routes'

let router: ReturnType<typeof createMemoryRouter>

function monter(chemin = '/') {
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

const LIEN_BACKEND =
  'Développeur·se back-end, Back-end, métier d’entrée, ligne 1 Développement'

function stations(): HTMLElement[] {
  return screen
    .getAllByRole('link')
    .filter((a) => a.getAttribute('href')?.startsWith('/fiche/'))
}

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
})

describe('PlanPage', () => {
  it('affiche le titre, le sous-titre et la bascule de vue', () => {
    monter()
    expect(
      screen.getByRole('heading', { level: 1, name: 'Le plan des métiers du numérique' }),
    ).toBeInTheDocument()
    expect(document.title).toBe('Plan des métiers · constellation')
    expect(screen.getByText(/68 métiers sur 8 lignes/)).toBeInTheDocument()
    const bascule = screen.getByRole('navigation', { name: 'Affichage' })
    expect(within(bascule).getByRole('link', { name: 'Graphe' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(within(bascule).getByRole('link', { name: 'Liste' })).toHaveAttribute('href', '/liste')
    expect(screen.getByRole('link', { name: 'Passer à la vue liste' })).toHaveAttribute(
      'href',
      '/liste',
    )
  })

  it('rend 68 liens de station, dont dev-backend', () => {
    monter()
    expect(stations()).toHaveLength(68)
    expect(screen.getByRole('link', { name: LIEN_BACKEND })).toHaveAttribute(
      'href',
      '/fiche/dev-backend',
    )
  })

  it('le focus d’une station affiche ses voisins et sa bulle ; le blur les retire', async () => {
    const { container } = monter()
    const lien = screen.getByRole('link', { name: LIEN_BACKEND })
    expect(container.querySelectorAll('svg [data-voisin]')).toHaveLength(0)
    act(() => lien.focus())
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Développeur·se back-end')
    expect(container.querySelectorAll('svg [data-voisin]')).toHaveLength(8)
    expect(lien).toHaveAttribute('aria-describedby', screen.getByRole('tooltip').id)
    act(() => lien.blur())
    expect(container.querySelectorAll('svg [data-voisin]')).toHaveLength(0)
    expect(screen.queryByRole('tooltip')).toBeNull()
  })

  it('les stations sont regroupées sous un nom accessible', () => {
    monter()
    const groupe = screen.getByRole('group', { name: 'Plan des métiers : 68 stations' })
    expect(within(groupe).getAllByRole('link')).toHaveLength(68)
  })

  it('la bulle reste ouverte quand la souris passe de la station à la bulle (WCAG 1.4.13)', async () => {
    monter()
    const lien = screen.getByRole('link', { name: LIEN_BACKEND })
    await userEvent.hover(lien)
    const bulle = screen.getByRole('tooltip')
    expect(bulle).not.toHaveClass('pointer-events-none')
    await userEvent.unhover(lien)
    await userEvent.hover(bulle)
    expect(screen.getByRole('tooltip')).toBeInTheDocument()
    await userEvent.unhover(bulle)
    await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull())
  })

  it('Échap ferme la bulle et les voisins sans déplacer le focus', async () => {
    const { container } = monter()
    const lien = screen.getByRole('link', { name: LIEN_BACKEND })
    act(() => lien.focus())
    expect(await screen.findByRole('tooltip')).toBeInTheDocument()
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('tooltip')).toBeNull()
    expect(container.querySelectorAll('svg [data-voisin]')).toHaveLength(0)
    expect(lien).toHaveFocus()
  })

  it('le survol affiche aussi la bulle', async () => {
    monter()
    await userEvent.hover(screen.getByRole('link', { name: LIEN_BACKEND }))
    expect(screen.getByRole('tooltip')).toHaveTextContent('Back-end · métier d’entrée')
    await userEvent.unhover(screen.getByRole('link', { name: LIEN_BACKEND }))
    await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull())
  })

  it('un filtre de catégorie atténue les autres stations sans les sortir de la tabulation', async () => {
    monter()
    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Catégorie' }), 'Back-end')
    const toutes = stations()
    const attenuees = toutes.filter((s) => s.dataset.attenue === 'true')
    expect(attenuees).toHaveLength(63)
    for (const s of attenuees) {
      expect(s).not.toHaveAttribute('tabindex', '-1')
      expect(s.getAttribute('aria-label')).toMatch(/, hors filtre$/)
    }
    expect(screen.getByRole('link', { name: LIEN_BACKEND })).not.toHaveAttribute(
      'data-attenue',
      'true',
    )
  })

  it('le filtre de type est exclusif et « Effacer les filtres » apparaît seulement s’il y a un filtre', async () => {
    monter()
    expect(screen.queryByRole('button', { name: 'Effacer les filtres' })).toBeNull()
    const groupe = screen.getByRole('radiogroup', { name: 'Type de métier' })
    await userEvent.click(within(groupe).getByRole('radio', { name: 'Évolution' }))
    expect(stations().filter((s) => s.dataset.attenue === 'true').length).toBeGreaterThan(0)
    await userEvent.click(screen.getByRole('button', { name: 'Effacer les filtres' }))
    expect(stations().filter((s) => s.dataset.attenue === 'true')).toHaveLength(0)
    expect(screen.queryByRole('button', { name: 'Effacer les filtres' })).toBeNull()
    // Le bouton a disparu : le focus passe au sélecteur de catégorie.
    expect(screen.getByRole('combobox', { name: 'Catégorie' })).toHaveFocus()
  })

  it('avant le quiz : encart d’invitation et aucune ligne en exploration', () => {
    const { container } = monter()
    expect(screen.getByText('Par où commencer ?')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Commencer le quiz' })).toHaveAttribute(
      'href',
      '/quiz',
    )
    expect(container.querySelectorAll('[data-etat="top"], [data-etat="exploration"]')).toHaveLength(
      0,
    )
    expect(screen.getAllByText('Métiers voisins (au survol)')).toHaveLength(1)
  })

  it('après le quiz : 3 lignes allumées, 5 en exploration, rien d’atténué', async () => {
    stockerQuizTermine('b')
    const { container } = monter()
    expect(screen.getByText('Tes 3 lignes de départ sont allumées')).toBeInTheDocument()
    expect(
      screen.getByText(/les lignes en pointillés \(5 lignes, \d+ métiers\)/),
    ).toBeInTheDocument()
    for (const id of ['infra-cloud', 'management', 'developpement']) {
      expect(container.querySelector(`[data-trace="${id}"]`)).toHaveAttribute('data-etat', 'top')
    }
    expect(container.querySelectorAll('[data-trace][data-etat="exploration"]')).toHaveLength(5)
    expect(stations().filter((s) => s.dataset.attenue === 'true')).toHaveLength(0)
    expect(screen.getByText('Zone d’exploration')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: `${LIEN_BACKEND}, ligne de ton top 3` })).toBeInTheDocument()
    expect(
      screen.getByRole('link', {
        name: /^Développeur·se full-stack.*ligne 1 Développement, ligne de ton top 3$/,
      }),
    ).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /, zone d’exploration$/ })).toHaveLength(
      stations().length - stations().filter((s) => /top 3$/.test(s.getAttribute('aria-label') ?? '')).length,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Refaire le quiz' }))
    expect(router.state.location.pathname).toBe('/quiz')
    expect(JSON.parse(localStorage.getItem(CLES.quiz) ?? '{}').termine).toBe(false)
  })

  it('quiz terminé mais départage non résolu : propose de le finir', () => {
    stockerQuizTermine('a')
    monter()
    expect(screen.getByText('Ton quiz attend un dernier choix.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Finir le quiz' })).toHaveAttribute('href', '/quiz')
    expect(screen.queryByRole('link', { name: 'Commencer le quiz' })).toBeNull()
  })
})
