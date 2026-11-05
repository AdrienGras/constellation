import type { TypeMetier } from '../donnees/types'

export interface Filtres {
  categories: string[]
  type: 'tous' | TypeMetier
}

export const FILTRES_VIDES: Filtres = { categories: [], type: 'tous' }

// Une liste de catégories vide veut dire « toutes ».
export function correspondFiltre(m: { categorie: string; type: TypeMetier }, f: Filtres): boolean {
  if (f.categories.length > 0 && !f.categories.includes(m.categorie)) return false
  return f.type === 'tous' || m.type === f.type
}
