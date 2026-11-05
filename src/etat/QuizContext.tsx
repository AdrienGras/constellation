import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { lignes, questions } from '../donnees'
import type { LigneId } from '../donnees/types'
import {
  calculerScores,
  classer,
  estEtatQuiz,
  etatQuizInitial,
  quizComplet,
  top3 as calculerTop3,
  type Classement,
  type EtatQuiz,
} from '../logique/quiz'
import { CLES, ecrire, lire } from '../logique/stockage'

interface ValeurQuiz {
  etat: EtatQuiz
  classement: Classement | null
  top3: LigneId[] | null
  repondre(qid: string, rid: string): void
  allerA(i: number): void
  terminer(): void
  rouvrir(): void
  choisirDepartage(ids: LigneId[]): void
  refaire(): void
}

const QuizContext = createContext<ValeurQuiz | null>(null)

const DERNIERE = questions.length - 1
const borner = (i: number) => Math.min(Math.max(i, 0), DERNIERE)
const ORDRE: LigneId[] = lignes.map((l) => l.id)

function relire(): EtatQuiz | null {
  const stocke = lire(CLES.quiz, estEtatQuiz)
  return stocke ? { ...stocke, question: borner(stocke.question) } : null
}

function etatInitial(): EtatQuiz {
  return relire() ?? etatQuizInitial()
}

export function QuizProvider({ children }: { children: ReactNode }) {
  const [etat, setEtat] = useState<EtatQuiz>(etatInitial)
  // Référence synchrone : plusieurs actions dans le même tour voient l’état le plus récent.
  const courant = useRef(etat)

  // Un autre onglet a pu écrire depuis : on repart de la valeur stockée quand elle est valide.
  const appliquer = useCallback((fn: (e: EtatQuiz) => EtatQuiz) => {
    const base = relire() ?? courant.current
    courant.current = base
    const suivant = fn(base)
    if (suivant === base) {
      setEtat(base)
      return
    }
    courant.current = suivant
    setEtat(suivant)
    ecrire(CLES.quiz, suivant)
  }, [])

  // Écriture depuis un autre onglet : on adopte l’état stocké s’il est valide, sinon on l’ignore.
  useEffect(() => {
    function surStockage(e: StorageEvent) {
      if (e.key !== null && e.key !== CLES.quiz) return
      const distant = relire()
      if (!distant) return
      courant.current = distant
      setEtat(distant)
    }
    window.addEventListener('storage', surStockage)
    return () => window.removeEventListener('storage', surStockage)
  }, [])

  const actions = useMemo(
    () => ({
      repondre: (qid: string, rid: string) =>
        appliquer((e) =>
          e.reponses[qid] === rid
            ? e
            : { ...e, reponses: { ...e.reponses, [qid]: rid }, departage: [] },
        ),
      allerA: (i: number) => appliquer((e) => ({ ...e, question: borner(i) })),
      terminer: () =>
        appliquer((e) => (quizComplet(questions, e.reponses) ? { ...e, termine: true } : e)),
      rouvrir: () => appliquer((e) => ({ ...e, termine: false, question: DERNIERE })),
      choisirDepartage: (ids: LigneId[]) => appliquer((e) => ({ ...e, departage: ids })),
      refaire: () => appliquer(() => etatQuizInitial()),
    }),
    [appliquer],
  )

  const valeur = useMemo<ValeurQuiz>(() => {
    const classement = quizComplet(questions, etat.reponses)
      ? classer(calculerScores(questions, etat.reponses), ORDRE)
      : null
    const top3 = classement && etat.termine ? calculerTop3(classement, etat.departage) : null
    return { etat, classement, top3, ...actions }
  }, [etat, actions])

  return <QuizContext.Provider value={valeur}>{children}</QuizContext.Provider>
}

export function useQuiz(): ValeurQuiz {
  const v = useContext(QuizContext)
  if (!v) throw new Error('useQuiz doit être utilisé dans un QuizProvider')
  return v
}
