import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { BarreNavigation } from './BarreNavigation'
import { BadgeFiabilite } from './BadgeFiabilite'
import { BadgeType } from './BadgeType'
import { ItemRoadmap } from './ItemRoadmap'
import { PastilleLigne } from './PastilleLigne'
import { PlageSalaire } from './PlageSalaire'
import { Station } from './Station'
import type { Item } from '@/logique/roadmap'

function Lieu() {
  return <output data-testid="lieu">{useLocation().pathname + useLocation().hash}</output>
}

describe('BarreNavigation', () => {
  it('marque la page active', () => {
    render(
      <MemoryRouter>
        <BarreNavigation actif="quiz" />
      </MemoryRouter>,
    )
    expect(screen.getByRole('link', { name: 'Quiz' })).toHaveAttribute('aria-current', 'page')
    for (const nom of ['Nuage', 'Roadmap', 'Sources']) {
      expect(screen.getByRole('link', { name: nom })).not.toHaveAttribute('aria-current')
    }
    expect(screen.getByRole('link', { name: 'Aller au contenu' })).toHaveAttribute(
      'href',
      '#contenu',
    )
    expect(screen.getByRole('link', { name: /constellation/ })).toHaveAttribute('href', '/')
  })

  it('le lien d’évitement donne le focus à #contenu sans changer la route', async () => {
    render(
      <MemoryRouter initialEntries={['/quiz']}>
        <BarreNavigation actif="quiz" />
        <Routes>
          <Route
            path="*"
            element={
              <main id="contenu" tabIndex={-1}>
                x
              </main>
            }
          />
        </Routes>
        <Lieu />
      </MemoryRouter>,
    )
    await userEvent.click(screen.getByRole('link', { name: 'Aller au contenu' }))
    expect(screen.getByRole('main')).toHaveFocus()
    expect(screen.getByTestId('lieu')).toHaveTextContent(/^\/quiz$/)
  })
})

describe('PastilleLigne', () => {
  it('rang 2 affiche numéro, nom et rang', () => {
    render(<PastilleLigne ligne="infra-cloud" rang={2} />)
    expect(screen.getByText('2', { selector: 'span' })).toBeInTheDocument()
    expect(screen.getByText('2e choix')).toBeInTheDocument()
    expect(screen.getByText('Infra & cloud')).toBeInTheDocument()
  })

  it('sansNom expose un nom accessible', () => {
    render(<PastilleLigne ligne="developpement" sansNom />)
    expect(screen.getByRole('img', { name: 'Ligne 1, Développement' })).toBeInTheDocument()
  })
})

describe('Station', () => {
  it('affiche le titre et distingue entrée et évolution', () => {
    const { container, rerender } = render(
      <Station ligne="data-ia" type="entree" titre="Analyste" />,
    )
    expect(screen.getByText('Analyste')).toBeInTheDocument()
    expect(container.querySelectorAll('circle')).toHaveLength(2)
    rerender(<Station ligne="data-ia" type="evolution" titre="Analyste" />)
    expect(container.querySelectorAll('circle')).toHaveLength(3)
  })
})

describe('BadgeType', () => {
  it('evolution affiche Métier d’évolution', () => {
    render(<BadgeType type="evolution" />)
    expect(screen.getByText('Métier d’évolution')).toBeInTheDocument()
  })
  it('entree affiche Métier d’entrée', () => {
    render(<BadgeType type="entree" />)
    expect(screen.getByText('Métier d’entrée')).toBeInTheDocument()
  })
})

describe('BadgeFiabilite', () => {
  it('moyenne affiche Fiabilité moyenne', () => {
    render(<BadgeFiabilite niveau="moyenne" />)
    expect(screen.getByText('Fiabilité moyenne')).toBeInTheDocument()
  })
  it('nd affiche n.d.', () => {
    render(<BadgeFiabilite niveau="nd" />)
    expect(screen.getByText('n.d.')).toBeInTheDocument()
  })
  it('avec une note, le badge est focalisable', () => {
    render(<BadgeFiabilite niveau="bonne" note="Source officielle" />)
    expect(screen.getByText('Fiabilité bonne').closest('[tabindex]')).not.toBeNull()
  })
})

describe('PlageSalaire', () => {
  it('positionne la barre sur l’échelle', () => {
    const { container } = render(<PlageSalaire min={30} max={50} echelle={[20, 60]} />)
    const barre = container.querySelector('[data-slot="plage-barre"]') as HTMLElement
    expect(barre.style.left).toBe('25%')
    expect(barre.style.width).toBe('50%')
  })
})

describe('ItemRoadmap', () => {
  const item: Item = {
    id: 'a',
    type: 'projet',
    titre: 'X',
    url: 'https://exemple.fr/page',
    note: 'Une note',
  }
  const actions = () => ({
    onMonter: vi.fn(),
    onDescendre: vi.fn(),
    onModifier: vi.fn(),
    onSupprimer: vi.fn(),
  })

  it('expose les quatre actions nommées et appelle les rappels', async () => {
    const a = actions()
    render(<ItemRoadmap item={item} premier={false} dernier={false} {...a} />)
    await userEvent.click(screen.getByRole('button', { name: 'Monter « X »' }))
    await userEvent.click(screen.getByRole('button', { name: 'Descendre « X »' }))
    await userEvent.click(screen.getByRole('button', { name: 'Modifier « X »' }))
    await userEvent.click(screen.getByRole('button', { name: 'Supprimer « X »' }))
    expect(a.onMonter).toHaveBeenCalledOnce()
    expect(a.onDescendre).toHaveBeenCalledOnce()
    expect(a.onModifier).toHaveBeenCalledOnce()
    expect(a.onSupprimer).toHaveBeenCalledOnce()
    expect(screen.getByText('Projet à réaliser')).toBeInTheDocument()
    expect(screen.getByText('Une note')).toBeInTheDocument()
  })

  it('premier désactive Monter, dernier désactive Descendre', () => {
    render(<ItemRoadmap item={item} premier dernier {...actions()} />)
    expect(screen.getByRole('button', { name: 'Monter « X »' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Descendre « X »' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Modifier « X »' })).toBeEnabled()
  })

  it('affiche l’URL sans https:// dans un lien externe sûr', () => {
    render(<ItemRoadmap item={item} premier={false} dernier={false} {...actions()} />)
    const lien = screen.getByRole('link', { name: 'exemple.fr/page' })
    expect(lien).toHaveAttribute('href', 'https://exemple.fr/page')
    expect(lien).toHaveAttribute('target', '_blank')
    expect(lien).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('ne rend aucun lien pour une URL non http(s)', () => {
    render(
      <ItemRoadmap
        item={{ ...item, url: 'javascript:alert(1)' }}
        premier={false}
        dernier={false}
        {...actions()}
      />,
    )
    expect(screen.queryByRole('link')).toBeNull()
    expect(screen.queryByText(/javascript/)).toBeNull()
  })

  it('ne rend aucun lien pour une URL vide', () => {
    render(<ItemRoadmap item={{ ...item, url: '' }} premier={false} dernier={false} {...actions()} />)
    expect(screen.queryByRole('link')).toBeNull()
  })

  it('type notion affiche Notion à apprendre', () => {
    render(
      <ItemRoadmap item={{ ...item, type: 'notion' }} premier={false} dernier={false} {...actions()} />,
    )
    expect(screen.getByText('Notion à apprendre')).toBeInTheDocument()
  })

  it('affiche la poignée fournie', () => {
    render(
      <ItemRoadmap
        item={item}
        premier={false}
        dernier={false}
        poignee={<span>poignée</span>}
        {...actions()}
      />,
    )
    expect(screen.getByText('poignée')).toBeInTheDocument()
  })
})
