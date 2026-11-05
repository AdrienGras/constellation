import { useEffect, useRef, useState } from 'react'
import { Outlet, useLocation } from 'react-router'
import { BarreNavigation, type PageActive } from '../components/metier/BarreNavigation'
import { TooltipProvider } from '../components/ui/tooltip'
import { FiltresProvider } from '../etat/FiltresContext'
import { QuizProvider } from '../etat/QuizContext'
import { RoadmapProvider } from '../etat/RoadmapContext'
import { stockageDisponible } from '../logique/stockage'

function pageActive(chemin: string): PageActive | null {
  if (chemin === '/' || chemin === '/liste' || chemin.startsWith('/fiche/')) return 'nuage'
  if (chemin === '/quiz') return 'quiz'
  if (chemin === '/roadmap') return 'roadmap'
  if (chemin === '/sources') return 'sources'
  return null
}

export function Layout() {
  const { pathname } = useLocation()
  const precedent = useRef(pathname)
  const [stockageOk] = useState(stockageDisponible)

  // Au changement de route seulement : le h1 est déjà rendu par l’Outlet quand cet effet s’exécute.
  useEffect(() => {
    if (precedent.current === pathname) return
    precedent.current = pathname
    window.scrollTo(0, 0)
    const h1 = document.querySelector<HTMLElement>('#contenu h1')
    if (h1) {
      h1.tabIndex = -1
      h1.focus()
    }
  }, [pathname])

  return (
    <TooltipProvider>
      <BarreNavigation actif={pageActive(pathname)} />
      {stockageOk ? null : (
        <p role="status" data-bandeau className="m-0 bg-surface-muted px-6 py-3 text-encre">
          Ton navigateur ne garde rien : ton résultat de quiz et ta roadmap seront perdus en fermant
          l’onglet. Pense à exporter.
        </p>
      )}
      <QuizProvider>
        <RoadmapProvider>
          <FiltresProvider>
            <main id="contenu" tabIndex={-1}>
              <Outlet />
            </main>
          </FiltresProvider>
        </RoadmapProvider>
      </QuizProvider>
    </TooltipProvider>
  )
}
