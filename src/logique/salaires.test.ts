import { describe, expect, it } from 'vitest'
import { metierParId, metiers, titresDepuis } from '../donnees'
import type { Metier } from '../donnees/types'
import {
  ZONES,
  ZONE_PAR_DEFAUT,
  avertissementSilkhom,
  badgePremierEmploi,
  echelleApec,
  echelleSilkhom,
  fourchette,
  kApec,
  keur,
  libelleTranche,
  listeFr,
} from './salaires'

function m(id: string): Metier {
  const x = metierParId(id)
  if (!x) throw new Error(id)
  return x
}

describe('formats', () => {
  it('keur', () => {
    expect(keur(52.8)).toBe('52,8 k€')
    expect(keur(null)).toBe('n.d.')
  })
  it('fourchette', () => {
    expect(fourchette([30, 35])).toBe('30 – 35 k€')
    expect(fourchette(null)).toBe('n.d.')
  })
  it('libelleTranche', () => {
    const n = { paris: null, grandes_villes: null, regions: null }
    expect(libelleTranche({ annees_min: 0, annees_max: 2, ...n })).toBe('0–2 ans')
    expect(libelleTranche({ annees_min: 6, annees_max: null, ...n })).toBe('6 ans et plus')
    expect(libelleTranche({ annees_min: 15, annees_max: null, ...n })).toBe('15 ans et plus')
  })
  it('listeFr', () => {
    expect(listeFr(['A'])).toBe('A')
    expect(listeFr(['A', 'B', 'C'])).toBe('A, B ou C')
  })
  it('zones', () => {
    expect(ZONES.map((z) => z.value)).toEqual(['paris', 'grandes_villes', 'regions'])
    expect(ZONES[2].label).toBe('Régions (Dijon)')
    expect(ZONE_PAR_DEFAUT).toBe('regions')
  })
  it('kApec', () => {
    expect(kApec(55)).toBe('55 k€')
    expect(kApec(undefined)).toBe('n.d.')
    expect(kApec(null)).toBe('n.d.')
  })
})

describe('dev-backend', () => {
  const d = m('dev-backend')
  const s = d.salaires.silkhom!
  const premiere = s.grilles[0].niveaux[0]
  it('badge et avertissement', () => {
    expect(s.grilles).toHaveLength(5)
    expect(badgePremierEmploi(0, premiere, 'regions', 'entree')).toBe(true)
    expect(badgePremierEmploi(0, premiere, 'paris', 'entree')).toBe(false)
    expect(badgePremierEmploi(1, premiere, 'regions', 'entree')).toBe(false)
    expect(avertissementSilkhom(s, d.type, titresDepuis(d))).toBeNull()
    expect(keur(s.moyenne_keur)).toBe('n.d.')
  })
  it('échelle', () => {
    const tous: number[] = []
    for (const g of s.grilles)
      for (const n of g.niveaux)
        for (const z of ['paris', 'grandes_villes', 'regions'] as const)
          if (n[z]) tous.push(n[z]![0], n[z]![1])
    const mn = Math.min(...tous)
    const mx = Math.max(...tous)
    const [a, b] = echelleSilkhom(s)
    expect(a).toBe(Math.floor(mn / 5) * 5 - 5)
    expect(b).toBe(Math.ceil(mx / 5) * 5)
    expect(a).toBeLessThan(mn)
    expect(b).toBeGreaterThanOrEqual(mx)
  })
  it('apec d1 absent', () => {
    expect(kApec(d.salaires.apec?.moins_35_ans?.d1)).toBe('n.d.')
  })
})

describe('dsi', () => {
  const d = m('dsi')
  const s = d.salaires.silkhom!
  it('avertissement attention', () => {
    expect(avertissementSilkhom(s, d.type, titresDepuis(d))).toEqual({
      variante: 'attention',
      texte: 'Pas de premier emploi direct : métier accessible après 6 ans d’expérience.',
    })
    expect(s.grilles[0].niveaux.map(libelleTranche)).toEqual(['6 ans et plus', '15 ans et plus'])
    for (const z of ['paris', 'grandes_villes', 'regions'] as const)
      s.grilles[0].niveaux.forEach((_, i) =>
        expect(badgePremierEmploi(i, s.grilles[0].niveaux[0], z, d.type)).toBe(false),
      )
  })
})

describe('mlops', () => {
  const d = m('mlops')
  const s = d.salaires.silkhom!
  it('avertissement neutre', () => {
    expect(avertissementSilkhom(s, 'evolution', titresDepuis(d))).toEqual({
      variante: 'neutre',
      texte:
        'Métier d’évolution : les années comptent l’expérience dans ce poste, après un premier métier (Ingénieur·e DevOps, Data engineer ou Ingénieur·e machine learning).',
    })
    expect(badgePremierEmploi(0, s.grilles[0].niveaux[0], 'regions', 'evolution')).toBe(false)
  })
})

describe('autres métiers', () => {
  it('integrateur-web', () => {
    const d = m('integrateur-web')
    expect(d.salaires.silkhom!.rapprochement!.de).toBe('Développeur Frontend')
    expect(d.salaires.silkhom!.grilles[0].niveaux.map(libelleTranche)).toEqual([
      '0–2 ans',
      '2–5 ans',
      '5 ans et plus',
    ])
    expect(d.salaires.apec).toBeNull()
  })
  it('technicien-support', () => {
    const d = m('technicien-support')
    const s = d.salaires.silkhom!
    expect(badgePremierEmploi(0, s.grilles[0].niveaux[0], 'regions', d.type)).toBe(true)
    expect(d.salaires.apec).toBeNull()
    expect(keur(33.1)).toBe('33,1 k€')
  })
  it('aucune étiquette de niveau', () => {
    for (const x of metiers)
      for (const g of x.salaires.silkhom?.grilles ?? [])
        for (const n of g.niveaux) {
          const l = libelleTranche(n)
          expect(l).toMatch(/^\d+(–\d+)? ans( et plus)?$/)
          expect(l).not.toMatch(/junior|confirm|senior|expert/i)
        }
  })
  it('echelleApec', () => {
    const a = m('dev-backend').salaires.apec ?? metiers.find((x) => x.salaires.apec)!.salaires.apec!
    const [mn, mx] = echelleApec(a)
    expect(mn).toBe(Math.floor(a.d1 / 10) * 10 - 10)
    expect(mx).toBe(Math.ceil(a.d9 / 10) * 10 + 10)
  })
})
