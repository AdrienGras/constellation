import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { Maximize, Minimize } from 'lucide-react'
import { Link } from 'react-router'
import { Station } from '@/components/metier/Station'
import { Button } from '@/components/ui/button'
import { categorieParId, ligneParId, plan, stationsDeLigne } from '@/donnees'
import type { LigneId } from '@/donnees/types'
import { correspondFiltre, type Filtres } from '@/logique/filtres'
import { LegendeLignes } from './Filtres'
import { usePleinEcran } from './usePleinEcran'

const L = 1280
const H = 720
const TEXTE = { fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 700, letterSpacing: '0.06em' }
const OPACITE_EXPLORATION = 0.4
const NUM = { fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, fill: 'var(--fond)' }

const libelleType = (t: string) => (t === 'entree' ? 'métier d’entrée' : 'métier d’évolution')

interface Actif {
  id: string
  clavier: boolean
}

export function PlanSvg({ filtres, top3 }: { filtres: Filtres; top3: LigneId[] | null }) {
  const [actif, setActif] = useState<Actif | null>(null)
  const ouvert = actif !== null
  const fermeture = useRef<number | undefined>(undefined)

  // WCAG 1.4.13 : la bulle reste ouverte quand la souris passe de la station à la bulle,
  // d’où une fermeture différée que l’entrée dans la bulle ou dans une station annule.
  const annulerFermeture = useCallback(() => window.clearTimeout(fermeture.current), [])
  const fermerPlusTard = () => {
    annulerFermeture()
    fermeture.current = window.setTimeout(() => setActif(null), 200)
  }
  useEffect(() => annulerFermeture, [annulerFermeture])

  // WCAG 1.4.13 : Échap ferme la bulle sans déplacer le focus.
  useEffect(() => {
    if (!ouvert) return
    const fermer = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActif(null)
    }
    document.addEventListener('keydown', fermer)
    return () => document.removeEventListener('keydown', fermer)
  }, [ouvert])

  const enveloppe = useRef<HTMLDivElement>(null)
  const pleinEcran = usePleinEcran(enveloppe)

  // La bulle s'affiche au-dessus de sa station, sauf si elle sortirait alors par le haut de la fenêtre :
  // elle passe dessous. Mesuré avant affichage, et remis à « dessus » à chaque ouverture : le côté est lié à
  // l’objet `actif`, recréé à chaque survol ou focus (une station resurvolée plus bas repasse dessus).
  const bulle = useRef<HTMLDivElement>(null)
  const [cote, setCote] = useState<{ ouverture: Actif; cote: 'dessus' | 'dessous' } | null>(null)
  const coteBulle = cote && cote.ouverture === actif ? cote.cote : 'dessus'
  useLayoutEffect(() => {
    if (!actif || coteBulle !== 'dessus' || !bulle.current) return
    if (bulle.current.getBoundingClientRect().top < 8) setCote({ ouverture: actif, cote: 'dessous' })
  }, [actif, coteBulle])

  const courante = actif ? plan.stations[actif.id] : null
  const voisins = courante ? courante.voisins.filter((id) => plan.stations[id]) : []
  const etatLigne = (id: LigneId) => (top3 ? (top3.includes(id) ? 'top' : 'exploration') : undefined)

  return (
    <div
      ref={enveloppe}
      data-plan
      className="relative flex flex-col [&:fullscreen]:items-center [&:fullscreen]:justify-center [&:fullscreen]:bg-fond"
    >
      <div className="relative mx-auto flex w-full max-w-[1280px] flex-col gap-3 [:fullscreen_&]:w-[min(100vw,calc(100vh*16/9))] [:fullscreen_&]:max-w-none">
        <LegendeLignes className="flex flex-wrap gap-x-4 gap-y-2 max-xl:mx-6 md:max-xl:mx-12 xl:absolute xl:top-3 xl:left-4 xl:z-[6] xl:flex-col xl:flex-nowrap xl:gap-y-2 xl:rounded-md xl:bg-surface xl:px-3 xl:py-3 xl:shadow-carte" />
        {pleinEcran.disponible ? (
          <Button
            variant="outline"
            size="sm"
            onClick={pleinEcran.basculer}
            className="max-xl:mr-6 max-xl:self-end md:max-xl:mr-12 xl:absolute xl:top-3 xl:right-4 xl:z-[6]"
          >
            {pleinEcran.actif ? <Minimize aria-hidden="true" /> : <Maximize aria-hidden="true" />}
            {pleinEcran.actif ? 'Quitter le plein écran' : 'Plein écran'}
          </Button>
        ) : null}
        <div data-plan-dessin className="relative aspect-[1280/720] w-full">
          <svg viewBox={`0 0 ${L} ${H}`} aria-hidden="true" className="absolute inset-0 block size-full">
            {/* Après le quiz, la zone d’exploration est estompée par ses tracés (fond des quartiers et trait) ;
                ses stations et ses libellés gardent leur plein contraste : on doit pouvoir y explorer. */}
            {plan.lignes.map((l) =>
              l.quartiers.map((q) => (
                <path
                  key={`${l.id}-${q.cat}`}
                  d={q.d}
                  fill="none"
                  stroke={l.fond}
                  strokeWidth={44}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={etatLigne(l.id) === 'exploration' ? OPACITE_EXPLORATION : undefined}
                />
              )),
            )}
            {plan.lignes.map((l) => {
              const etat = etatLigne(l.id)
              return (
                <path
                  key={l.id}
                  d={l.d}
                  data-trace={l.id}
                  data-etat={etat}
                  fill="none"
                  stroke={l.couleur}
                  strokeWidth={etat === 'top' ? 12 : 8}
                  opacity={etat === 'exploration' ? OPACITE_EXPLORATION : undefined}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={etat === 'top' ? { filter: `drop-shadow(0 0 6px ${l.couleur})` } : undefined}
                />
              )
            })}
            {plan.lignes.map((l) =>
              l.quartiers.map((q) => (
                <text key={`${l.id}-${q.cat}`} x={q.lx} y={q.ly} textAnchor={q.la} fill={l.couleur} style={TEXTE}>
                  {q.libelle.toUpperCase()}
                </text>
              )),
            )}
            {/* Rayon 34 : à 30, « FORMATION » touchait le bord du disque. La station la plus proche est à 78. */}
            <circle data-disque cx={640} cy={360} r={34} fill="var(--encre)" />
            <text x={640} y={356} textAnchor="middle" style={{ ...NUM, fontSize: 12 }}>
              TA
            </text>
            <text x={640} y={370} textAnchor="middle" data-centre style={{ ...NUM, fontSize: 10 }}>
              FORMATION
            </text>
            {plan.lignes.map((l) => (
              <g key={l.id}>
                <circle cx={l.terminus[0]} cy={l.terminus[1]} r={14} fill={l.couleur} stroke="var(--fond)" strokeWidth={3} />
                <text x={l.terminus[0]} y={l.terminus[1] + 5} textAnchor="middle" style={NUM}>
                  {l.num}
                </text>
              </g>
            ))}
            {courante
              ? voisins.map((id) => (
                  <line
                    key={id}
                    data-voisin={id}
                    x1={courante.x}
                    y1={courante.y}
                    x2={plan.stations[id].x}
                    y2={plan.stations[id].y}
                    stroke={courante.couleur}
                    strokeWidth={2}
                    strokeDasharray="6 5"
                  />
                ))
              : null}
          </svg>

          <div role="group" aria-label="Plan des métiers : 68 stations" className="absolute inset-0">
            {plan.lignes.flatMap((l) =>
              stationsDeLigne(l.id).map((id) => {
                const s = plan.stations[id]
                const ligne = ligneParId(s.ligne)
                const cat = categorieParId(s.cat)?.libelle ?? s.cat
                const retenue = correspondFiltre({ categorie: s.cat, type: s.type }, filtres)
                const courant = actif?.id === id
                const etat = courant
                  ? actif.clavier
                    ? 'focus'
                    : 'survol'
                  : actif && voisins.includes(id)
                    ? 'survol'
                    : retenue
                      ? 'repos'
                      : 'attenue'
                const rangQuiz = top3 ? (top3.includes(s.ligne) ? ', ligne de ton top 3' : ', zone d’exploration') : ''
                return (
                  // Cible ronde dont le diamètre suit la largeur du plan (34 px au plus, 24 au moins, WCAG 2.5.8) :
                  // les centres les plus proches sont à 35,9 / 1280 de la largeur, donc pas de chevauchement au-dessus de 856 px.
                  // Le dessin de la station suit la taille du lien (sinon ses 34 px fixes imposent la hauteur du lien et
                  // le décentrent) et ne prend pas le pointeur : la zone de clic reste le disque du lien.
                  <Link
                    key={id}
                    to={`/fiche/${id}`}
                    aria-label={`${s.titre}, ${cat}, ${libelleType(s.type)}, ligne ${ligne.num} ${ligne.libelle}${rangQuiz}${retenue ? '' : ', hors filtre'}`}
                    aria-describedby={courant ? 'plan-bulle' : undefined}
                    data-attenue={retenue ? undefined : 'true'}
                    onMouseEnter={() => {
                      annulerFermeture()
                      setActif({ id, clavier: false })
                    }}
                    onMouseLeave={fermerPlusTard}
                    onFocus={() => {
                      annulerFermeture()
                      setActif({ id, clavier: true })
                    }}
                    onBlur={() => setActif(null)}
                    className="absolute grid aspect-square w-[clamp(24px,2.75%,34px)] -translate-x-1/2 [&>svg]:pointer-events-none [&>svg]:size-full -translate-y-1/2 place-items-center rounded-full"
                    style={{ left: `${(s.x / L) * 100}%`, top: `${(s.y / H) * 100}%`, zIndex: courant ? 3 : 2 }}
                  >
                    <Station ligne={s.ligne} type={s.type} etat={etat} />
                  </Link>
                )
              }),
            )}
          </div>

          {courante ? (
            <div
              ref={bulle}
              id="plan-bulle"
              role="tooltip"
              data-cote={coteBulle}
              onMouseEnter={annulerFermeture}
              onMouseLeave={fermerPlusTard}
              className="absolute z-[7] max-w-[300px] rounded-sm bg-encre px-3.5 py-2.5 text-[14px] leading-5 text-fond shadow-flottante"
              style={{
                left: `${(courante.x / L) * 100}%`,
                top: `${(courante.y / H) * 100}%`,
                transform: `translate(${courante.x < 160 ? '-10%' : courante.x > 1120 ? '-90%' : '-50%'}, ${coteBulle === 'dessus' ? 'calc(-100% - 24px)' : '24px'})`,
              }}
            >
              <strong className="block text-base leading-[22px]">{courante.titre}</strong>
              <span>
                {categorieParId(courante.cat)?.libelle ?? courante.cat} · {libelleType(courante.type)}
              </span>
              <br />
              <span className="font-bold">Clique pour ouvrir la fiche</span>
            </div>
          ) : null}

          <div
            aria-hidden="true"
            className="absolute right-4 bottom-3 flex items-end gap-6 rounded-md bg-surface px-4 py-3 shadow-carte max-md:hidden"
          >
            <Station ligne="developpement" type="entree" titre="Métier d’entrée" />
            <Station ligne="developpement" type="evolution" titre="Métier d’évolution" />
            <Legende libelle="Métiers voisins (au survol)">
              <line x1={4} y1={17} x2={56} y2={17} stroke="var(--ligne-developpement)" strokeWidth={2} strokeDasharray="5 5" />
            </Legende>
            {top3 ? (
              <Legende libelle="Zone d’exploration">
                <line
                  x1={4}
                  y1={17}
                  x2={56}
                  y2={17}
                  stroke="var(--ligne-cybersecurite)"
                  strokeWidth={8}
                  strokeLinecap="round"
                  opacity={OPACITE_EXPLORATION}
                />
              </Legende>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

function Legende({ libelle, children }: { libelle: string; children: ReactNode }) {
  return (
    <span className="inline-flex flex-col items-center gap-1.5 text-center text-[13px] leading-[18px] text-encre-douce">
      <svg width={60} height={34} viewBox="0 0 60 34">
        {children}
      </svg>
      <span>{libelle}</span>
    </span>
  )
}
