import type { ReactNode } from 'react'
import { EncartQuiz } from './EncartQuiz'
import { BasculeVue, Filtres } from './Filtres'

// En-tête commun du plan et de la liste : titre et bascule sur la rangée 1, filtres et quiz sur la rangée 2.
// La légende des lignes n’y figure pas : le plan la porte lui-même, la liste a déjà une pastille par ligne.
export function EnTeteAccueil({
  etiquette,
  titre,
  chapeau,
  vue,
}: {
  etiquette?: string
  titre: string
  chapeau: ReactNode
  vue: 'graphe' | 'liste'
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          {etiquette ? (
            <p className="m-0 text-[13px] leading-5 font-bold tracking-[0.06em] text-encre-douce uppercase">
              {etiquette}
            </p>
          ) : null}
          <h1 className="titre-1 mt-1 mb-0">{titre}</h1>
          <p className="mt-2 mb-0 max-w-[820px] text-encre-douce">{chapeau}</p>
        </div>
        <BasculeVue actif={vue} />
      </div>
      <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
        <Filtres legende={false} />
        <EncartQuiz />
      </div>
    </div>
  )
}
