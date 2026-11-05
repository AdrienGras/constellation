import { describe, expect, it } from 'vitest'
import { lignes, questions } from '../donnees'
import type { LigneId } from '../donnees/types'
import { calculerScores, classer, estEtatQuiz, etatQuizInitial, quizComplet, top3 } from './quiz'

const ordre = lignes.map((l) => l.id)
const toutes = (choix: string) => Object.fromEntries(questions.map((q) => [q.id, choix]))

describe('calculerScores', () => {
  it('somme les poids pour toutes les réponses a', () => {
    expect(calculerScores(questions, toutes('a'))).toEqual({
      developpement: 6,
      'infra-cloud': 1,
      cybersecurite: 2,
      'data-ia': 3,
      'qualite-archi': 6,
      'produit-design': 6,
      'relation-transmission': 8,
      management: 3,
    })
  })

  it('ignore les réponses inconnues', () => {
    const scores = calculerScores(questions, { q01: 'z', q99: 'a' })
    expect(Object.values(scores).every((s) => s === 0)).toBe(true)
    expect(Object.keys(scores).sort()).toEqual([...ordre].sort())
  })
})

describe('classer et top3', () => {
  it('toutes b : pas d’égalité', () => {
    const c = classer(calculerScores(questions, toutes('b')), ordre)
    expect(top3(c, [])).toEqual(['infra-cloud', 'management', 'developpement'])
  })

  it('toutes c : égalité dans le top 3 tranchée par l’ordre des lignes', () => {
    const c = classer(calculerScores(questions, toutes('c')), ordre)
    expect(c.aDepartager).toEqual([])
    expect(top3(c, [])).toEqual(['qualite-archi', 'cybersecurite', 'produit-design'])
  })

  it('toutes a : départage de 2 places parmi 3', () => {
    const c = classer(calculerScores(questions, toutes('a')), ordre)
    expect(c.qualifiees).toEqual(['relation-transmission'])
    expect(c.aDepartager).toEqual(['developpement', 'qualite-archi', 'produit-design'])
    expect(c.places).toBe(2)
    expect(top3(c, [])).toBeNull()
    expect(top3(c, ['produit-design', 'developpement'])).toEqual([
      'relation-transmission',
      'developpement',
      'produit-design',
    ])
    expect(top3(c, ['management', 'developpement'])).toBeNull()
  })

  it('départage d’une place', () => {
    const scores = Object.fromEntries(ordre.map((id) => [id, 0])) as Record<LigneId, number>
    Object.assign(scores, {
      developpement: 10,
      'infra-cloud': 8,
      cybersecurite: 6,
      'data-ia': 6,
    })
    const c = classer(scores, ordre)
    expect(c.qualifiees).toEqual(['developpement', 'infra-cloud'])
    expect(c.aDepartager).toEqual(['cybersecurite', 'data-ia'])
    expect(c.places).toBe(1)
  })

  it('ignore les doublons du départage', () => {
    const c = classer(calculerScores(questions, toutes('a')), ordre)
    expect(top3(c, ['developpement', 'developpement', 'qualite-archi'])).toEqual([
      'relation-transmission',
      'developpement',
      'qualite-archi',
    ])
  })
})

describe('estEtatQuiz', () => {
  it('accepte l’état initial', () => {
    expect(estEtatQuiz(etatQuizInitial())).toBe(true)
  })

  it('refuse les valeurs invalides', () => {
    const base = etatQuizInitial()
    expect(estEtatQuiz(null)).toBe(false)
    expect(estEtatQuiz({ version: 2 })).toBe(false)
    expect(estEtatQuiz({ ...base, reponses: 'x' })).toBe(false)
    expect(estEtatQuiz({ ...base, departage: ['inconnu'] })).toBe(false)
  })
})

describe('quizComplet', () => {
  it('est faux s’il manque q16, vrai avec 16 réponses valides', () => {
    const r = toutes('a')
    const { q16, ...sans } = r
    expect(q16).toBe('a')
    expect(quizComplet(questions, sans)).toBe(false)
    expect(quizComplet(questions, r)).toBe(true)
  })
})
