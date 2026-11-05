import { useQuiz } from '@/etat/QuizContext'
import { Departage } from './Departage'
import { Question } from './Question'
import { Resultat } from './Resultat'

export function QuizPage() {
  const { etat, top3 } = useQuiz()
  if (!etat.termine) return <Question index={etat.question} />
  if (top3 === null) return <Departage />
  return <Resultat top3={top3} />
}
