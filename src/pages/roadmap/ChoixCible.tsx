import { useMemo, useState } from 'react'
import { PastilleLigne } from '@/components/metier/PastilleLigne'
import { Input } from '@/components/ui/input'
import { ligneDuMetier, metiers } from '@/donnees'
import { normaliser } from '@/logique/texte'
import { cn } from '@/lib/utils'

export function ChoixCible({
  cible,
  onChoisir,
}: {
  cible: string | null
  onChoisir: (id: string) => void
}) {
  const [recherche, setRecherche] = useState('')
  const requete = normaliser(recherche.trim())
  const visibles = useMemo(
    () => metiers.filter((m) => normaliser(m.titre).includes(requete)),
    [requete],
  )

  return (
    <div className="flex max-w-[720px] flex-col gap-3">
      <Input
        aria-label="Chercher un métier"
        placeholder="Chercher un métier"
        value={recherche}
        onChange={(e) => setRecherche(e.target.value)}
      />
      <p role="status" className="sr-only">
        {visibles.length === 0 ? 'Aucun métier ne correspond.' : `${visibles.length} métiers`}
      </p>
      {visibles.length === 0 ? (
        <p className="m-0 text-encre-douce">Aucun métier ne correspond à cette recherche.</p>
      ) : null}
      <ul
        aria-label="Métiers"
        className="m-0 grid max-h-[320px] list-none grid-cols-1 gap-2 overflow-y-auto p-0 sm:grid-cols-2"
      >
        {visibles.map((m) => (
          <li key={m.id}>
            <button
              type="button"
              aria-current={m.id === cible ? 'true' : undefined}
              onClick={() => onChoisir(m.id)}
              className={cn(
                'flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-sm border bg-surface px-3 py-2 text-left text-[16px] leading-5 font-bold text-encre hover:bg-surface-muted',
                m.id === cible ? 'border-2 border-primaire' : 'border-trait-fort',
              )}
            >
              <PastilleLigne ligne={ligneDuMetier(m)} sansNom taille="sm" />
              {m.titre}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
