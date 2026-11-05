import { render, screen, waitFor } from '@testing-library/react'
import { RouterProvider, createMemoryRouter } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { routes } from '../routes'

afterEach(() => vi.restoreAllMocks())

function monter(chemin: string) {
  window.scrollTo = vi.fn()
  render(<RouterProvider router={createMemoryRouter(routes, { initialEntries: [chemin] })} />)
}

describe('Layout', () => {
  it('pose le titre et le focus sur le h1 en changeant de page', async () => {
    monter('/')
    await screen.findByRole('heading', { level: 1, name: 'Le plan des métiers du numérique' })
    screen.getByRole('link', { name: 'Sources' }).click()
    const h1 = await screen.findByRole('heading', { level: 1, name: 'D’où viennent ces informations' })
    await waitFor(() => expect(h1).toHaveFocus())
    expect(document.title).toBe('Sources et mentions · constellation')
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0)
  })

  it('ne déplace pas le focus au premier chargement', async () => {
    monter('/sources')
    const h1 = await screen.findByRole('heading', { level: 1, name: 'D’où viennent ces informations' })
    expect(h1).not.toHaveFocus()
    expect(document.title).toBe('Sources et mentions · constellation')
  })

  it('renvoie une route inconnue vers le plan', async () => {
    monter('/n-importe-quoi')
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Le plan des métiers du numérique' }),
    ).toBeInTheDocument()
  })

  it('affiche le bandeau quand le stockage est indisponible', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('refusé')
    })
    monter('/')
    expect(await screen.findByRole('status')).toHaveTextContent(
      'Ton navigateur ne garde rien : ton résultat de quiz et ta roadmap seront perdus en fermant l’onglet. Pense à exporter.',
    )
  })
})
