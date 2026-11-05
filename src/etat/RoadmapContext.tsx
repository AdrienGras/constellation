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
import { metierParId } from '../donnees'
import {
  ajouterItem,
  choisirCible as choisirCibleDans,
  deplacerItem,
  estEtatRoadmap,
  modifierItem,
  roadmapVide,
  supprimerItem,
  type Annee,
  type Brouillon,
  type EtatRoadmap,
} from '../logique/roadmap'
import { CLES, ecrire, lire } from '../logique/stockage'

interface ValeurRoadmap {
  etat: EtatRoadmap
  enregistre: boolean
  cibleOubliee: boolean
  remplacer(e: EtatRoadmap): void
  ajouter(a: Annee, b: Brouillon): void
  modifier(a: Annee, id: string, b: Brouillon): void
  supprimer(a: Annee, id: string): void
  deplacer(a: Annee, de: number, vers: number): void
  choisirCible(id: string | null): void
}

const RoadmapContext = createContext<ValeurRoadmap | null>(null)

interface Charge {
  etat: EtatRoadmap
  cibleOubliee: boolean
}

function normaliser(stocke: EtatRoadmap): Charge {
  if (stocke.cible !== null && !metierParId(stocke.cible)) {
    return { etat: { ...stocke, cible: null }, cibleOubliee: true }
  }
  return { etat: stocke, cibleOubliee: false }
}

function relire(): Charge | null {
  const stocke = lire(CLES.roadmap, estEtatRoadmap)
  return stocke ? normaliser(stocke) : null
}

function charger(): Charge {
  return relire() ?? { etat: roadmapVide(), cibleOubliee: false }
}

export function RoadmapProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(charger)
  const [etat, setEtat] = useState(initial.etat)
  const [cibleOubliee, setCibleOubliee] = useState(initial.cibleOubliee)
  const [enregistre, setEnregistre] = useState(true)
  const courant = useRef(etat)

  // Écriture depuis un autre onglet : on adopte l’état stocké s’il est valide, sinon on l’ignore.
  useEffect(() => {
    function surStockage(e: StorageEvent) {
      if (e.key !== null && e.key !== CLES.roadmap) return
      const distant = relire()
      if (!distant) return
      courant.current = distant.etat
      setEtat(distant.etat)
      setCibleOubliee(distant.cibleOubliee)
    }
    window.addEventListener('storage', surStockage)
    return () => window.removeEventListener('storage', surStockage)
  }, [])

  const poser = useCallback((suivant: EtatRoadmap) => {
    courant.current = suivant
    setEtat(suivant)
    setEnregistre(ecrire(CLES.roadmap, suivant))
  }, [])

  const modifierEtat = useCallback(
    (fn: (e: EtatRoadmap) => EtatRoadmap) => {
      // Un autre onglet a pu écrire depuis : on repart de la valeur stockée quand elle est valide.
      const distant = relire()
      const base = distant?.etat ?? courant.current
      if (distant) {
        courant.current = distant.etat
        setEtat(distant.etat)
      }
      const suivant = fn(base)
      if (suivant === base) return
      poser({ ...suivant, modifie_le: new Date().toISOString() })
    },
    [poser],
  )

  const actions = useMemo(
    () => ({
      remplacer: (e: EtatRoadmap) => {
        setCibleOubliee(false)
        poser(e)
      },
      ajouter: (a: Annee, b: Brouillon) => modifierEtat((e) => ajouterItem(e, a, b)),
      modifier: (a: Annee, id: string, b: Brouillon) =>
        modifierEtat((e) => modifierItem(e, a, id, b)),
      supprimer: (a: Annee, id: string) => modifierEtat((e) => supprimerItem(e, a, id)),
      deplacer: (a: Annee, de: number, vers: number) =>
        modifierEtat((e) => deplacerItem(e, a, de, vers)),
      choisirCible: (id: string | null) => {
        setCibleOubliee(false)
        modifierEtat((e) => choisirCibleDans(e, id))
      },
    }),
    [poser, modifierEtat],
  )

  const valeur = useMemo<ValeurRoadmap>(
    () => ({ etat, enregistre, cibleOubliee, ...actions }),
    [etat, enregistre, cibleOubliee, actions],
  )

  return <RoadmapContext.Provider value={valeur}>{children}</RoadmapContext.Provider>
}

export function useRoadmap(): ValeurRoadmap {
  const v = useContext(RoadmapContext)
  if (!v) throw new Error('useRoadmap doit être utilisé dans un RoadmapProvider')
  return v
}
