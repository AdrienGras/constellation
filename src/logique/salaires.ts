import type { Apec, Fourchette, NiveauSilkhom, Silkhom, TypeMetier, Zone } from '../donnees/types'

export const ZONES: { value: Zone; label: string }[] = [
  { value: 'paris', label: 'Paris' },
  { value: 'grandes_villes', label: 'Grandes villes' },
  { value: 'regions', label: 'Régions (Dijon)' },
]

export const ZONE_PAR_DEFAUT: Zone = 'regions'

export function keur(n: number | null): string {
  return n === null ? 'n.d.' : String(n).replace('.', ',') + ' k€'
}

export function fourchette(p: Fourchette | null): string {
  return p ? p[0] + ' – ' + p[1] + ' k€' : 'n.d.'
}

export function libelleTranche(n: NiveauSilkhom): string {
  return n.annees_max === null ? n.annees_min + ' ans et plus' : n.annees_min + '–' + n.annees_max + ' ans'
}

export function listeFr(xs: string[]): string {
  return xs.length < 2 ? xs.join('') : xs.slice(0, -1).join(', ') + ' ou ' + xs[xs.length - 1]
}

export function echelleSilkhom(s: Silkhom): [number, number] {
  const tous: number[] = []
  for (const g of s.grilles)
    for (const n of g.niveaux)
      for (const z of ['paris', 'grandes_villes', 'regions'] as const) {
        const p = n[z]
        if (p) tous.push(p[0], p[1])
      }
  return [Math.floor(Math.min(...tous) / 5) * 5 - 5, Math.ceil(Math.max(...tous) / 5) * 5]
}

export function badgePremierEmploi(
  indexTranche: number,
  premiere: NiveauSilkhom,
  zone: Zone,
  type: TypeMetier,
): boolean {
  return indexTranche === 0 && zone === 'regions' && premiere.annees_min === 0 && type === 'entree'
}

export function avertissementSilkhom(
  s: Silkhom,
  type: TypeMetier,
  depuisTitres: string[],
): { variante: 'attention' | 'neutre'; texte: string } | null {
  const premier = s.grilles[0].niveaux[0]
  if (premier.annees_min > 0)
    return {
      variante: 'attention',
      texte: 'Pas de premier emploi direct : métier accessible après ' + premier.annees_min + ' ans d’expérience.',
    }
  if (type === 'evolution')
    return {
      variante: 'neutre',
      texte:
        'Métier d’évolution : les années comptent l’expérience dans ce poste, après un premier métier' +
        (depuisTitres.length ? ' (' + listeFr(depuisTitres) + ')' : '') +
        '.',
    }
  return null
}

export function echelleApec(a: Apec): [number, number] {
  return [Math.floor(a.d1 / 10) * 10 - 10, Math.ceil(a.d9 / 10) * 10 + 10]
}

export function kApec(x: number | null | undefined): string {
  return x === null || x === undefined ? 'n.d.' : x + ' k€'
}
