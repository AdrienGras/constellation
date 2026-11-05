export const ANNEES = [2027, 2028, 2029, 2030, 2031] as const
export type Annee = (typeof ANNEES)[number]
export type TypeItem = 'projet' | 'notion'

export interface Item {
  id: string
  type: TypeItem
  titre: string
  url: string
  note: string
}
export type Brouillon = Omit<Item, 'id'>

export interface EtatRoadmap {
  version: 1
  cible: string | null
  annees: Record<`${Annee}`, Item[]>
  modifie_le: string | null
}

export function roadmapVide(): EtatRoadmap {
  return {
    version: 1,
    cible: null,
    annees: { '2027': [], '2028': [], '2029': [], '2030': [], '2031': [] },
    modifie_le: null,
  }
}

export function nouvelId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

function avecAnnee(e: EtatRoadmap, annee: Annee, liste: Item[]): EtatRoadmap {
  return { ...e, annees: { ...e.annees, [annee]: liste } }
}

export function ajouterItem(
  e: EtatRoadmap,
  annee: Annee,
  b: Brouillon,
  id: string = nouvelId(),
): EtatRoadmap {
  return avecAnnee(e, annee, [...e.annees[annee], { ...b, id }])
}

export function modifierItem(e: EtatRoadmap, annee: Annee, id: string, b: Brouillon): EtatRoadmap {
  return avecAnnee(
    e,
    annee,
    e.annees[annee].map((i) => (i.id === id ? { ...b, id } : i)),
  )
}

export function supprimerItem(e: EtatRoadmap, annee: Annee, id: string): EtatRoadmap {
  return avecAnnee(
    e,
    annee,
    e.annees[annee].filter((i) => i.id !== id),
  )
}

export function deplacerItem(e: EtatRoadmap, annee: Annee, de: number, vers: number): EtatRoadmap {
  const liste = e.annees[annee]
  const dansBornes = (n: number) => Number.isInteger(n) && n >= 0 && n < liste.length
  if (!dansBornes(de) || !dansBornes(vers) || de === vers) return e
  const copie = [...liste]
  const [item] = copie.splice(de, 1)
  copie.splice(vers, 0, item)
  return avecAnnee(e, annee, copie)
}

export function choisirCible(e: EtatRoadmap, id: string | null): EtatRoadmap {
  return { ...e, cible: id }
}

export function nbItems(e: EtatRoadmap): number {
  return ANNEES.reduce((n, a) => n + e.annees[a].length, 0)
}

export function estVide(e: EtatRoadmap): boolean {
  return nbItems(e) === 0 && e.cible === null
}

export function urlAcceptable(url: string): boolean {
  const u = url.trim()
  if (u === '') return true
  try {
    const { protocol } = new URL(u)
    return protocol === 'http:' || protocol === 'https:'
  } catch {
    return false
  }
}

export function validerBrouillon(b: Brouillon): { titre?: string; url?: string } {
  const erreurs: { titre?: string; url?: string } = {}
  if (b.titre.trim() === '') erreurs.titre = 'Donne un titre à cet élément.'
  if (!urlAcceptable(b.url)) {
    erreurs.url = 'L’adresse doit commencer par http:// ou https://.'
  }
  return erreurs
}

const estObjet = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)

function estItem(v: unknown): v is Item {
  return (
    estObjet(v) &&
    typeof v.id === 'string' &&
    (v.type === 'projet' || v.type === 'notion') &&
    typeof v.titre === 'string' &&
    typeof v.url === 'string' &&
    urlAcceptable(v.url) &&
    typeof v.note === 'string'
  )
}

export function estEtatRoadmap(v: unknown): v is EtatRoadmap {
  if (!estObjet(v) || v.version !== 1) return false
  if (v.cible !== null && typeof v.cible !== 'string') return false
  if (v.modifie_le !== null && typeof v.modifie_le !== 'string') return false
  const annees = v.annees
  if (!estObjet(annees)) return false
  return ANNEES.every((a) => {
    const liste = annees[String(a)]
    return Array.isArray(liste) && liste.every(estItem)
  })
}
