import { useId, useState, type ReactNode } from 'react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Logo } from './Logo'

export type PageActive = 'nuage' | 'quiz' | 'roadmap' | 'sources'

const PAGES: { id: PageActive; libelle: string; chemin: string }[] = [
  { id: 'nuage', libelle: 'Nuage', chemin: '/' },
  { id: 'quiz', libelle: 'Quiz', chemin: '/quiz' },
  { id: 'roadmap', libelle: 'Roadmap', chemin: '/roadmap' },
  { id: 'sources', libelle: 'Sources', chemin: '/sources' },
]

export function BarreNavigation({ actif, fin }: { actif: PageActive | null; fin?: ReactNode }) {
  // Sous `md`, les liens sont repliés derrière le bouton Menu (maquette M1).
  const [ouvert, setOuvert] = useState(false)
  const idListe = useId()
  return (
    <header data-barre className="relative">
      {/* L’ancre est prise par le routeur : on déplace le focus à la main. */}
      <a
        href="#contenu"
        onClick={(e) => {
          e.preventDefault()
          document.getElementById('contenu')?.focus()
        }}
        className="absolute top-[-60px] left-2 z-50 rounded-sm bg-primaire px-3 py-2 text-sur-primaire focus:top-2"
      >
        Aller au contenu
      </a>
      <nav
        aria-label="Navigation principale"
        className="flex min-h-[60px] flex-wrap items-center justify-between gap-x-6 bg-surface px-4 py-2 shadow-[0_1px_0_var(--trait)] md:h-[68px] md:flex-nowrap md:justify-start md:px-6 md:py-0"
      >
        <Link
          to="/"
          className="inline-flex items-center gap-2.5 rounded-sm font-display text-2xl font-[750] tracking-[-0.02em] text-encre no-underline"
        >
          <Logo />
          constellation
        </Link>
        <Button
          variant="ghost"
          aria-expanded={ouvert}
          aria-controls={idListe}
          onClick={() => setOuvert((o) => !o)}
          className="md:hidden"
        >
          {ouvert ? 'Fermer' : 'Menu'}
        </Button>
        <ul
          id={idListe}
          className={cn(
            'm-0 w-full list-none flex-col border-t border-trait p-0 pt-1 md:flex md:w-auto md:flex-row md:gap-1 md:border-t-0 md:pt-0',
            ouvert ? 'flex' : 'hidden',
          )}
        >
          {PAGES.map((p) => (
            <li key={p.id}>
              <Link
                to={p.chemin}
                onClick={() => setOuvert(false)}
                aria-current={actif === p.id ? 'page' : undefined}
                className={cn(
                  'flex min-h-12 items-center rounded-sm px-2 md:inline-flex md:h-11 md:min-h-0 md:px-4 text-base font-bold text-encre no-underline hover:bg-surface-muted',
                  'aria-[current=page]:bg-primaire aria-[current=page]:text-sur-primaire',
                )}
              >
                {p.libelle}
              </Link>
            </li>
          ))}
        </ul>
        {fin ? (
          <div className="ml-auto flex items-center gap-1.5 text-[14px] text-encre-douce">
            {fin}
          </div>
        ) : null}
      </nav>
    </header>
  )
}
