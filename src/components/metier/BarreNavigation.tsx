import type { ReactNode } from 'react'
import { Link } from 'react-router'
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
  return (
    <header className="relative">
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
        className="flex h-[68px] items-center gap-6 bg-surface px-6 shadow-[0_1px_0_var(--trait)]"
      >
        <Link
          to="/"
          className="inline-flex items-center gap-2.5 rounded-sm font-display text-2xl font-[750] tracking-[-0.02em] text-encre no-underline"
        >
          <Logo />
          constellation
        </Link>
        <ul className="m-0 flex list-none gap-1 p-0">
          {PAGES.map((p) => (
            <li key={p.id}>
              <Link
                to={p.chemin}
                aria-current={actif === p.id ? 'page' : undefined}
                className={cn(
                  'inline-flex h-11 items-center rounded-sm px-4 text-base font-bold text-encre no-underline hover:bg-surface-muted',
                  'aria-[current=page]:bg-primaire aria-[current=page]:text-sur-primaire',
                )}
              >
                {p.libelle}
              </Link>
            </li>
          ))}
        </ul>
        {fin ? (
          <div className="ml-auto flex items-center gap-1.5 text-[14px] text-encre-douce">{fin}</div>
        ) : null}
      </nav>
    </header>
  )
}
