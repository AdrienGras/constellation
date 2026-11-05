import { lignes } from '../donnees'
import type { LigneId, Question } from '../donnees/types'

export type Reponses = Record<string, string>

export interface Classement {
  qualifiees: LigneId[]
  aDepartager: LigneId[]
  places: number
}

export interface EtatQuiz {
  version: 1
  reponses: Reponses
  question: number
  departage: LigneId[]
  termine: boolean
}

const idsLignes: LigneId[] = lignes.map((l) => l.id)

export function calculerScores(questions: Question[], reponses: Reponses): Record<LigneId, number> {
  const scores = Object.fromEntries(idsLignes.map((id) => [id, 0])) as Record<LigneId, number>
  for (const q of questions) {
    const choix = q.reponses.find((r) => r.id === reponses[q.id])
    if (!choix) continue
    for (const [ligne, poids] of Object.entries(choix.poids)) {
      if (ligne in scores) scores[ligne as LigneId] += poids ?? 0
    }
  }
  return scores
}

export function classer(scores: Record<LigneId, number>, ordre: LigneId[]): Classement {
  const tri = [...ordre].sort(
    (a, b) => scores[b] - scores[a] || ordre.indexOf(a) - ordre.indexOf(b),
  )
  const s3 = scores[tri[2]]
  const qualifiees = tri.filter((id) => scores[id] > s3)
  const candidats = ordre.filter((id) => scores[id] === s3)
  const places = 3 - qualifiees.length
  if (candidats.length === places) {
    return { qualifiees: [...qualifiees, ...candidats], aDepartager: [], places: 0 }
  }
  return { qualifiees, aDepartager: candidats, places }
}

export function top3(c: Classement, departage: LigneId[]): LigneId[] | null {
  if (c.aDepartager.length === 0) return c.qualifiees
  const choisis = new Set(departage.filter((id) => c.aDepartager.includes(id)))
  if (choisis.size !== c.places) return null
  return [...c.qualifiees, ...c.aDepartager.filter((id) => choisis.has(id))]
}

export function etatQuizInitial(): EtatQuiz {
  return { version: 1, reponses: {}, question: 0, departage: [], termine: false }
}

export function estEtatQuiz(v: unknown): v is EtatQuiz {
  if (typeof v !== 'object' || v === null) return false
  const e = v as Record<string, unknown>
  if (e.version !== 1) return false
  if (typeof e.reponses !== 'object' || e.reponses === null || Array.isArray(e.reponses))
    return false
  if (!Object.values(e.reponses).every((r) => typeof r === 'string')) return false
  if (typeof e.question !== 'number' || !Number.isInteger(e.question)) return false
  if (typeof e.termine !== 'boolean') return false
  return Array.isArray(e.departage) && e.departage.every((d) => idsLignes.includes(d as LigneId))
}

export function quizComplet(questions: Question[], reponses: Reponses): boolean {
  return questions.every((q) => q.reponses.some((r) => r.id === reponses[q.id]))
}
