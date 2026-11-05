import type { ReactNode } from 'react'
import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { questions } from '../donnees'
import { CLES } from '../logique/stockage'
import { etatQuizInitial } from '../logique/quiz'
import { roadmapVide } from '../logique/roadmap'
import { QuizProvider, useQuiz } from './QuizContext'
import { RoadmapProvider, useRoadmap } from './RoadmapContext'
import { FiltresProvider, useFiltres } from './FiltresContext'
import { FILTRES_VIDES } from '../logique/filtres'

afterEach(() => vi.restoreAllMocks())

const enveloppeQuiz = ({ children }: { children: ReactNode }) => (
  <QuizProvider>{children}</QuizProvider>
)
const enveloppeRoadmap = ({ children }: { children: ReactNode }) => (
  <RoadmapProvider>{children}</RoadmapProvider>
)

function toutRepondreA(r: ReturnType<typeof renderHook<ReturnType<typeof useQuiz>, unknown>>['result']) {
  act(() => {
    for (const q of questions) r.current.repondre(q.id, 'a')
  })
}

describe('QuizProvider', () => {
  it('reprend un état stocké', () => {
    localStorage.setItem(
      CLES.quiz,
      JSON.stringify({ version: 1, reponses: { q01: 'a' }, question: 1, departage: [], termine: false }),
    )
    const { result } = renderHook(() => useQuiz(), { wrapper: enveloppeQuiz })
    expect(result.current.etat.reponses).toEqual({ q01: 'a' })
    expect(result.current.etat.question).toBe(1)
  })

  it('borne la question stockée', () => {
    localStorage.setItem(
      CLES.quiz,
      JSON.stringify({ version: 1, reponses: {}, question: 99, departage: [], termine: false }),
    )
    const { result } = renderHook(() => useQuiz(), { wrapper: enveloppeQuiz })
    expect(result.current.etat.question).toBe(15)
  })

  it('repondre écrit dans le stockage', () => {
    const { result } = renderHook(() => useQuiz(), { wrapper: enveloppeQuiz })
    act(() => result.current.repondre('q01', 'a'))
    expect(JSON.parse(localStorage.getItem('constellation.quiz.v1')!).reponses).toEqual({ q01: 'a' })
  })

  it('terminer ne fait rien tant que le quiz est incomplet', () => {
    const { result } = renderHook(() => useQuiz(), { wrapper: enveloppeQuiz })
    act(() => result.current.repondre('q01', 'a'))
    act(() => result.current.terminer())
    expect(result.current.etat.termine).toBe(false)
    expect(result.current.classement).toBeNull()
  })

  it('toutes les réponses a, terminer, puis départage', () => {
    const { result } = renderHook(() => useQuiz(), { wrapper: enveloppeQuiz })
    toutRepondreA(result)
    act(() => result.current.terminer())
    expect(result.current.etat.termine).toBe(true)
    expect(result.current.top3).toBeNull()
    expect(result.current.classement?.aDepartager).toHaveLength(3)
    act(() => result.current.choisirDepartage(['developpement', 'qualite-archi']))
    expect(result.current.top3).toEqual(['relation-transmission', 'developpement', 'qualite-archi'])
  })

  it('changer une réponse vide le départage', () => {
    const { result } = renderHook(() => useQuiz(), { wrapper: enveloppeQuiz })
    toutRepondreA(result)
    act(() => result.current.terminer())
    act(() => result.current.choisirDepartage(['developpement', 'qualite-archi']))
    const q = questions[0]
    const autre = q.reponses.find((r) => r.id !== 'a')!.id
    act(() => result.current.repondre(q.id, autre))
    expect(result.current.etat.departage).toEqual([])
  })

  it('rouvrir remet la dernière question et garde les réponses', () => {
    const { result } = renderHook(() => useQuiz(), { wrapper: enveloppeQuiz })
    toutRepondreA(result)
    act(() => result.current.terminer())
    act(() => result.current.rouvrir())
    expect(result.current.etat.termine).toBe(false)
    expect(result.current.etat.question).toBe(15)
    expect(Object.keys(result.current.etat.reponses)).toHaveLength(questions.length)
  })

  it('refaire revient à l’état initial', () => {
    const { result } = renderHook(() => useQuiz(), { wrapper: enveloppeQuiz })
    toutRepondreA(result)
    act(() => result.current.refaire())
    expect(result.current.etat).toEqual(etatQuizInitial())
  })
})

describe('RoadmapProvider', () => {
  it('ajouter écrit dans le stockage avec modifie_le', () => {
    const { result } = renderHook(() => useRoadmap(), { wrapper: enveloppeRoadmap })
    act(() => result.current.ajouter(2027, { type: 'notion', titre: 'SQL', url: '', note: '' }))
    const stocke = JSON.parse(localStorage.getItem('constellation.roadmap.v1')!)
    expect(stocke.modifie_le).not.toBeNull()
    expect(stocke.annees['2027']).toHaveLength(1)
    expect(result.current.enregistre).toBe(true)
  })

  it('une écriture refusée passe enregistre à faux mais garde l’état', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota')
    })
    const { result } = renderHook(() => useRoadmap(), { wrapper: enveloppeRoadmap })
    act(() => result.current.ajouter(2027, { type: 'notion', titre: 'SQL', url: '', note: '' }))
    expect(result.current.enregistre).toBe(false)
    expect(result.current.etat.annees['2027']).toHaveLength(1)
  })

  it('oublie une cible inconnue au chargement', () => {
    localStorage.setItem(CLES.roadmap, JSON.stringify({ ...roadmapVide(), cible: 'metier-disparu' }))
    const { result } = renderHook(() => useRoadmap(), { wrapper: enveloppeRoadmap })
    expect(result.current.etat.cible).toBeNull()
    expect(result.current.cibleOubliee).toBe(true)
  })

  it('cibleOubliee repasse à faux après le choix d’une cible', () => {
    localStorage.setItem(CLES.roadmap, JSON.stringify({ ...roadmapVide(), cible: 'metier-disparu' }))
    const { result } = renderHook(() => useRoadmap(), { wrapper: enveloppeRoadmap })
    expect(result.current.cibleOubliee).toBe(true)
    act(() => result.current.choisirCible('dev-backend'))
    expect(result.current.cibleOubliee).toBe(false)
    expect(result.current.etat.cible).toBe('dev-backend')
  })

  it('garde une cible connue', () => {
    localStorage.setItem(CLES.roadmap, JSON.stringify({ ...roadmapVide(), cible: 'dev-backend' }))
    const { result } = renderHook(() => useRoadmap(), { wrapper: enveloppeRoadmap })
    expect(result.current.etat.cible).toBe('dev-backend')
    expect(result.current.cibleOubliee).toBe(false)
  })
})

describe('FiltresProvider', () => {
  it('garde les filtres en mémoire', () => {
    const { result } = renderHook(() => useFiltres(), {
      wrapper: ({ children }: { children: ReactNode }) => <FiltresProvider>{children}</FiltresProvider>,
    })
    expect(result.current.filtres).toEqual(FILTRES_VIDES)
    act(() => result.current.setFiltres({ categories: ['data'], type: 'entree' }))
    expect(result.current.filtres).toEqual({ categories: ['data'], type: 'entree' })
  })
})
