import brut from '../../metiers.json'
import planBrut from './plan.json'
import type {
  Categorie,
  Donnees,
  Ligne,
  LigneId,
  Metier,
  Plan,
  Question,
  Source,
} from './types'

const donnees = brut as unknown as Donnees

export const metiers: Metier[] = donnees.metiers
export const categories: Categorie[] = donnees.categories
export const questions: Question[] = donnees.quiz.questions
export const sources: Source[] = donnees.sources
export const meta = donnees.meta
export const plan = planBrut as unknown as Plan

export const lignes: Ligne[] = donnees.macro_branches.map((l, i) => ({
  ...l,
  num: i + 1,
}))

const metiersParId = new Map(metiers.map((m) => [m.id, m]))
const categoriesParId = new Map(categories.map((c) => [c.id, c]))
const lignesParId = new Map(lignes.map((l) => [l.id, l]))
const ligneParCategorie = new Map(
  lignes.flatMap((l) => l.categories.map((c) => [c, l.id] as const)),
)

export function metierParId(id: string): Metier | undefined {
  return metiersParId.get(id)
}

export function categorieParId(id: string): Categorie | undefined {
  return categoriesParId.get(id)
}

export function ligneParId(id: LigneId): Ligne {
  const ligne = lignesParId.get(id)
  if (!ligne) throw new Error(`Ligne inconnue : ${id}`)
  return ligne
}

export function ligneDuMetier(m: Metier): LigneId {
  const id = ligneParCategorie.get(m.categorie)
  if (!id) throw new Error(`Catégorie sans ligne : ${m.categorie}`)
  return id
}

export function stationsDeLigne(id: LigneId): string[] {
  return Object.entries(plan.stations)
    .filter(([, s]) => s.ligne === id)
    .map(([stationId]) => stationId)
}

export function titresDepuis(m: Metier): string[] {
  return m.depuis.flatMap((id) => {
    const source = metiersParId.get(id)
    return source ? [source.titre] : []
  })
}
