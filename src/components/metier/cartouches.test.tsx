import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ligneDuMetier, metierParId, metiers, titresDepuis } from '@/donnees'
import type { Metier } from '@/donnees/types'
import { CartoucheApec } from './CartoucheApec'
import { CartoucheSilkhom } from './CartoucheSilkhom'

function metier(id: string): Metier {
  const m = metierParId(id)
  if (!m) throw new Error(`Métier introuvable : ${id}`)
  return m
}

function silkhom(m: Metier) {
  return (
    <CartoucheSilkhom
      silkhom={m.salaires.silkhom}
      type={m.type}
      depuisTitres={titresDepuis(m)}
      ligne={ligneDuMetier(m)}
      raisonAbsence={m.fiabilite_note}
    />
  )
}

function apec(m: Metier) {
  return <CartoucheApec apec={m.salaires.apec} raisonAbsence={m.fiabilite_note} />
}

const PREMIER_EMPLOI = 'La plus proche d’un premier emploi'

describe('CartoucheSilkhom', () => {
  it('dev-backend : cinq profils, zone Régions, badge premier emploi, aucune étiquette de niveau', async () => {
    const { container } = render(silkhom(metier('dev-backend')))
    const onglets = screen.getAllByRole('tab').map((t) => t.textContent)
    expect(onglets).toEqual(['Java', 'Python', 'PHP', 'Net', 'Backend JS'])
    expect(screen.getByRole('tablist', { name: 'Profil Silkhom' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Régions (Dijon)' })).toBeChecked()
    expect(screen.getAllByText(PREMIER_EMPLOI)).toHaveLength(1)
    expect(screen.getByText('Salaire cible')).toBeInTheDocument()
    expect(screen.getByText('Moyenne relevée par Silkhom :', { exact: false }).textContent).toBe(
      'Moyenne relevée par Silkhom : n.d.',
    )
    expect(container.textContent).not.toMatch(/junior|confirmé|senior|expert/i)

    await userEvent.click(screen.getByRole('radio', { name: 'Paris' }))
    expect(screen.queryByText(PREMIER_EMPLOI)).not.toBeInTheDocument()
  })

  it('la zone choisie est conservée quand on change de profil', async () => {
    render(silkhom(metier('dev-backend')))
    await userEvent.click(screen.getByRole('radio', { name: 'Grandes villes' }))
    await userEvent.click(screen.getByRole('tab', { name: 'Python' }))
    expect(screen.getByRole('radio', { name: 'Grandes villes' })).toBeChecked()
    expect(screen.getByRole('table', { name: /Profil Silkhom Python, zone Grandes villes/ })).toBeInTheDocument()
  })

  it('la zone reste toujours sélectionnée (pas de désélection)', async () => {
    render(silkhom(metier('dev-backend')))
    await userEvent.click(screen.getByRole('radio', { name: 'Régions (Dijon)' }))
    expect(screen.getByRole('radio', { name: 'Régions (Dijon)' })).toBeChecked()
  })

  it('dsi : pas de premier emploi direct, tranches « et plus », aucun badge', () => {
    render(silkhom(metier('dsi')))
    expect(
      screen.getByText('Pas de premier emploi direct : métier accessible après 6 ans d’expérience.'),
    ).toBeInTheDocument()
    expect(screen.getByText('6 ans et plus')).toBeInTheDocument()
    expect(screen.getByText('15 ans et plus')).toBeInTheDocument()
    expect(screen.queryByText(PREMIER_EMPLOI)).not.toBeInTheDocument()
  })

  it('mlops : métier d’évolution, pas de badge', () => {
    render(silkhom(metier('mlops')))
    expect(
      screen.getByText(
        'Métier d’évolution : les années comptent l’expérience dans ce poste, après un premier métier (Ingénieur·e DevOps, Data engineer ou Ingénieur·e machine learning).',
      ),
    ).toBeInTheDocument()
    expect(screen.queryByText(PREMIER_EMPLOI)).not.toBeInTheDocument()
  })

  it('integrateur-web : rapprochement avec le profil Frontend', () => {
    const m = metier('integrateur-web')
    const { container } = render(silkhom(m))
    expect(screen.getByText('Données du profil Silkhom « Développeur Frontend » :', { exact: false })).toBeInTheDocument()
    expect(container.textContent).toContain(m.salaires.silkhom!.rapprochement!.raison)
    expect(screen.getByText('41,9 k€')).toBeInTheDocument()
  })

  it('technicien-support : badge présent en Régions', () => {
    render(silkhom(metier('technicien-support')))
    expect(screen.getAllByText(PREMIER_EMPLOI)).toHaveLength(1)
  })

  it('sans donnée Silkhom : n.d. écrit et raison affichée', () => {
    render(<CartoucheSilkhom silkhom={null} type="entree" depuisTitres={[]} ligne="developpement" raisonAbsence="Pas de ligne." />)
    expect(screen.getByText('n.d.')).toBeInTheDocument()
    expect(screen.getByText('Pas de ligne.')).toBeInTheDocument()
  })
})

describe('CartoucheApec', () => {
  it('dev-backend : médiane, famille, mention et ligne Moins de 35 ans', () => {
    render(apec(metier('dev-backend')))
    expect(screen.getByText('Salaire cible')).toBeInTheDocument()
    expect(
      screen.getByText('Médiane des cadres, toutes expériences, pas un salaire d’embauche.'),
    ).toBeInTheDocument()
    expect(screen.getByText('50 k€')).toBeInTheDocument()
    expect(screen.getByText('médiane · famille « Développement informatique »')).toBeInTheDocument()
    const ligne = screen.getByRole('row', { name: /Moins de 35 ans/ })
    expect(within(ligne).getByText('44 k€')).toBeInTheDocument()
    expect(within(ligne).getAllByText('n.d.')).toHaveLength(2)
    expect(screen.getByRole('img', { name: /^1er décile \d+ k€, médiane 50 k€, 9e décile \d+ k€$/ })).toBeInTheDocument()
  })

  it('mlops : rapprochement avec la famille Big Data', () => {
    const m = metier('mlops')
    const { container } = render(apec(m))
    expect(screen.getByText('Données de la famille Apec « Big Data » :', { exact: false })).toBeInTheDocument()
    expect(container.textContent).toContain(m.salaires.apec!.rapprochement!.raison)
  })

  it('integrateur-web : n.d., pas de donnée Apec, raison brute', () => {
    const m = metier('integrateur-web')
    const { container } = render(apec(m))
    expect(screen.getByText('n.d.')).toBeInTheDocument()
    expect(screen.getByText('Pas de donnée Apec pour ce métier.')).toBeInTheDocument()
    expect(container.textContent).toContain(
      'Pourquoi : poste souvent non cadre, donc sans salaire Apec ; ',
    )
    expect(container.textContent).toContain(m.fiabilite_note)
  })

  it('technicien-support : n.d.', () => {
    render(apec(metier('technicien-support')))
    expect(screen.getByText('n.d.')).toBeInTheDocument()
  })
})

describe('toutes les fiches', () => {
  it(`les ${metiers.length} fiches se rendent sans erreur`, () => {
    for (const m of metiers) {
      const { container, unmount } = render(
        <>
          {silkhom(m)}
          {apec(m)}
        </>,
      )
      expect(screen.getAllByText('Salaire cible')).toHaveLength(2)
      const texte = container.textContent ?? ''
      expect(texte, m.id).not.toMatch(/\bnull\b|undefined/)
      expect(texte, m.id).not.toMatch(/junior|confirm|senior|expert|variation/i)
      unmount()
    }
  })
})
