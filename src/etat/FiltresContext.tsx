import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { FILTRES_VIDES, type Filtres } from '../logique/filtres'

interface ValeurFiltres {
  filtres: Filtres
  setFiltres(f: Filtres): void
}

const FiltresContext = createContext<ValeurFiltres | null>(null)

// En mémoire seulement : les filtres survivent à la navigation, pas au rechargement.
export function FiltresProvider({ children }: { children: ReactNode }) {
  const [filtres, setFiltres] = useState<Filtres>(FILTRES_VIDES)
  const valeur = useMemo(() => ({ filtres, setFiltres }), [filtres])
  return <FiltresContext.Provider value={valeur}>{children}</FiltresContext.Provider>
}

export function useFiltres(): ValeurFiltres {
  const v = useContext(FiltresContext)
  if (!v) throw new Error('useFiltres doit être utilisé dans un FiltresProvider')
  return v
}
