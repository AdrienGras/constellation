import { categorieParId, ligneParId } from '@/donnees'
import type { LigneId } from '@/donnees/types'

export function categoriesDeLigne(id: LigneId): string {
  return ligneParId(id)
    .categories.map((c) => categorieParId(c)?.libelle ?? c)
    .join(', ')
}
