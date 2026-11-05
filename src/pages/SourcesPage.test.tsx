import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { meta, sources } from '../donnees'
import { LICENCE_TEXTES, SourcesPage } from './SourcesPage'

function rendre() {
  return render(
    <MemoryRouter>
      <SourcesPage />
    </MemoryRouter>,
  )
}

describe('SourcesPage', () => {
  it('affiche les mentions', () => {
    rendre()
    expect(screen.getByText(meta.mentions)).toBeInTheDocument()
  })

  it('liste les 6 sources dans un tableau', () => {
    rendre()
    const table = screen.getByRole('table')
    const colonnes = within(table).getAllByRole('columnheader').map((c) => c.textContent)
    expect(colonnes).toEqual(['Source', 'Éditeur', 'Date', 'Ce qu’on en tire', 'Licence'])
    expect(within(table).getAllByRole('row')).toHaveLength(7)
  })

  it('chaque titre est un lien externe vers l’url', () => {
    rendre()
    expect(sources).toHaveLength(6)
    for (const s of sources) {
      const lien = screen.getByRole('link', { name: new RegExp(s.titre.replace(/[()]/g, '\\$&')) })
      expect(lien).toHaveAttribute('href', s.url)
      expect(lien).toHaveAttribute('target', '_blank')
      expect(lien).toHaveAttribute('rel', 'noopener noreferrer')
    }
  })

  it('affiche la licence des textes et la version des données', () => {
    rendre()
    expect(LICENCE_TEXTES).toBe(
      'Textes propres à constellation (fiches rédigées par CODA, quiz, interface) : licence CC BY 4.0. Les passages adaptés du Cigref et les données de salaires restent soumis aux conditions de leurs sources. Code : licence MIT.',
    )
    expect(screen.getByText(/Textes propres à constellation .* licence CC BY 4\.0\./)).toBeInTheDocument()
    expect(screen.queryByText(/à décider/)).not.toBeInTheDocument()
    expect(screen.getByText(/Données relevées le 2026-11-02, version 1\.1\./)).toBeInTheDocument()
  })
})
