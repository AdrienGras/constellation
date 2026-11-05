import { Link, useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { PastilleLigne } from '@/components/metier/PastilleLigne'
import { lignes, plan } from '@/donnees'
import { useQuiz } from '@/etat/QuizContext'

const CARTE = 'rounded-md bg-surface shadow-carte'
const CARTE_RANGEE = `${CARTE} ml-auto flex flex-wrap items-center gap-4 py-3 pr-3 pl-5`

// État du quiz sur l’écran d’accueil : invitation, départage à finir, ou résultat.
export function EncartQuiz() {
  const { etat, top3, refaire } = useQuiz()
  const navigate = useNavigate()

  if (top3) {
    const exploration = lignes.length - top3.length
    const metiers = Object.values(plan.stations).filter((s) => !top3.includes(s.ligne)).length
    return (
      <section
        aria-label="Ton résultat de quiz"
        className={`${CARTE} ml-auto flex max-w-[780px] min-w-0 flex-1 basis-[520px] flex-col gap-0.5 px-4 py-1.5`}
      >
        <h2 className="sr-only">Tes 3 lignes de départ sont allumées</h2>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {top3.map((id, i) => (
            <PastilleLigne key={id} ligne={id} taille="sm" rang={(i + 1) as 1 | 2 | 3} />
          ))}
        </div>
        <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2">
          <p className="m-0 min-w-0 flex-1 basis-[360px] text-[15px] leading-[18px] text-encre-douce">
            Un point de départ, pas un verdict. Ce matin, choisis 3 métiers dans ta zone
            d’exploration : les lignes estompées ({exploration} lignes, {metiers} métiers).
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              refaire()
              navigate('/quiz')
            }}
          >
            Refaire le quiz
          </Button>
        </div>
      </section>
    )
  }

  if (etat.termine) {
    return (
      <section
        aria-label="Ton quiz"
        className={CARTE_RANGEE}
      >
        <p className="m-0 text-[15px] leading-[22px] font-bold">Ton quiz attend un dernier choix.</p>
        <Button asChild>
          <Link to="/quiz">Finir le quiz</Link>
        </Button>
      </section>
    )
  }

  return (
    <section
      aria-label="Ton quiz"
      className={CARTE_RANGEE}
    >
      <p className="m-0 text-[15px] leading-[22px]">
        <strong>Par où commencer ?</strong>
        <br />
        <span className="text-encre-douce">Le quiz allume tes 3 lignes de départ.</span>
      </p>
      <Button asChild>
        <Link to="/quiz">Commencer le quiz</Link>
      </Button>
    </section>
  )
}
