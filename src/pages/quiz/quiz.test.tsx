import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RouterProvider, createMemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { metiers, questions } from '../../donnees'
import { CLES } from '../../logique/stockage'
import { routes } from '../../routes'
import { exemplesDeLigne } from './Resultat'

function monter() {
  window.scrollTo = vi.fn()
  const router = createMemoryRouter(routes, { initialEntries: ['/quiz'] })
  return render(<RouterProvider router={router} />)
}

const INDEX: Record<string, number> = { a: 0, b: 1, c: 2, d: 3 }

async function repondreTout(user: ReturnType<typeof userEvent.setup>, lettre: string) {
  for (let i = 0; i < questions.length; i++) {
    await user.click(screen.getAllByRole('radio')[INDEX[lettre]])
    await user.click(screen.getByRole('button', { name: i === 15 ? 'Voir mon résultat' : 'Question suivante' }))
  }
}

beforeEach(() => localStorage.clear())

describe('Quiz', () => {
  it('parcours b x16 : résultat sans score, rangs dans l’ordre', async () => {
    const user = userEvent.setup()
    monter()
    expect(document.title).toBe('Quiz · constellation')
    await repondreTout(user, 'b')
    expect(
      screen.getByRole('heading', { level: 1, name: 'Tes 3 lignes de départ' }),
    ).toBeInTheDocument()
    expect(document.title).toBe('Tes 3 lignes de départ · constellation')
    expect(document.activeElement).toBe(screen.getByRole('heading', { level: 1 }))
    const rangs = screen.getAllByText(/^[123](er|e) choix$/).map((n) => n.closest('li')?.textContent)
    expect(rangs[0]).toMatch(/Infra & cloud.*1er choix/)
    expect(rangs[1]).toMatch(/Management.*2e choix/)
    expect(rangs[2]).toMatch(/Développement.*3e choix/)
    expect(screen.queryByText(/\d+ points?/)).toBeNull()
    expect(screen.getByRole('link', { name: 'Voir mes lignes sur le plan' })).toHaveAttribute('href', '/')
    expect(screen.getByText('Résultat gardé dans ce navigateur.')).toBeInTheDocument()
  })

  it('désactive Question suivante sans réponse et garde la réponse en revenant', async () => {
    const user = userEvent.setup()
    monter()
    expect(screen.getByRole('button', { name: 'Question suivante' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '← Question précédente' })).toBeDisabled()
    expect(screen.getByText('Question 1 sur 16', { selector: '[aria-live]' })).toBeInTheDocument()
    await user.click(screen.getAllByRole('radio')[2])
    await user.click(screen.getByRole('button', { name: 'Question suivante' }))
    expect(screen.getAllByRole('radio').every((r) => r.getAttribute('aria-checked') === 'false')).toBe(true)
    await user.click(screen.getByRole('button', { name: '← Question précédente' }))
    expect(screen.getAllByRole('radio')[2]).toBeChecked()
  })

  it('déplace le focus sur le h1 au changement de question', async () => {
    const user = userEvent.setup()
    monter()
    await user.click(screen.getAllByRole('radio')[0])
    await user.click(screen.getByRole('button', { name: 'Question suivante' }))
    expect(screen.getByRole('heading', { level: 1 })).toHaveFocus()
    expect(screen.getByText('Question 2 sur 16', { selector: '[aria-live]' })).toBeInTheDocument()
  })

  it('reprend à la question stockée', () => {
    localStorage.setItem(
      CLES.quiz,
      JSON.stringify({ version: 1, reponses: {}, question: 6, departage: [], termine: false }),
    )
    monter()
    expect(screen.getAllByText('Question 7 sur 16').length).toBeGreaterThan(0)
  })

  it('parcours a x16 : départage à 2 places puis résultat', async () => {
    const user = userEvent.setup()
    monter()
    await repondreTout(user, 'a')
    expect(screen.getByRole('heading', { level: 1, name: 'Une dernière question' })).toBeInTheDocument()
    expect(
      screen.getByText('Ces lignes sont à égalité pour tes 2 dernières places : choisis-en 2.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'Une dernière question' })).toHaveFocus()
    const cases = screen.getAllByRole('checkbox')
    expect(cases).toHaveLength(3)
    expect(cases[0]).toHaveAccessibleName(/Développement/)
    expect(cases[1]).toHaveAccessibleName(/Qualité & architecture/)
    expect(cases[2]).toHaveAccessibleName(/Produit & design/)
    const voir = screen.getByRole('button', { name: 'Voir mon résultat' })
    expect(voir).toBeDisabled()
    await user.click(screen.getByRole('checkbox', { name: /Qualité & architecture/ }))
    await user.click(screen.getByRole('checkbox', { name: /Produit & design/ }))
    expect(screen.getByText('2 sur 2 choisies')).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: /Développement/ })).toBeDisabled()
    await user.click(voir)
    expect(screen.getByRole('heading', { level: 1, name: 'Tes 3 lignes de départ' })).toHaveFocus()
    const rangs = screen.getAllByText(/^[123](er|e) choix$/).map((n) => n.closest('li')?.textContent)
    expect(rangs[0]).toMatch(/Relation & transmission.*1er choix/)
    expect(rangs[1]).toMatch(/Qualité & architecture.*2e choix/)
    expect(rangs[2]).toMatch(/Produit & design.*3e choix/)
  })

  it('refaire le quiz revient à la question 1 et vide le stockage', async () => {
    const user = userEvent.setup()
    monter()
    await repondreTout(user, 'b')
    await user.click(screen.getByRole('button', { name: 'Refaire le quiz' }))
    expect(screen.getByText('Question 1 sur 16', { selector: '[aria-live]' })).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem(CLES.quiz) ?? '{}').reponses).toEqual({})
  })

  it('signale un stockage indisponible sur le résultat', async () => {
    const reponses = Object.fromEntries(questions.map((q) => [q.id, 'b']))
    localStorage.setItem(
      CLES.quiz,
      JSON.stringify({ version: 1, reponses, question: 15, departage: [], termine: true }),
    )
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('plein')
    })
    monter()
    expect(
      screen.getByText('Résultat perdu en fermant l’onglet : ton navigateur ne garde rien.'),
    ).toBeInTheDocument()
    vi.restoreAllMocks()
  })

  it('exemplesDeLigne renvoie 3 titres de métiers d’entrée', () => {
    const ex = exemplesDeLigne('developpement')
    expect(ex).toHaveLength(3)
    for (const t of ex) {
      expect(metiers.find((m) => m.titre === t)?.type).toBe('entree')
    }
  })
})
