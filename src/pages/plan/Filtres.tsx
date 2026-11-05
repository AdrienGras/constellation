import { Button } from '@/components/ui/button'
import { ToggleGroup, ToggleGroupItem, ToggleLiens } from '@/components/ui/toggle-group'
import { PastilleLigne } from '@/components/metier/PastilleLigne'
import { categorieParId, lignes } from '@/donnees'
import { useFiltres } from '@/etat/FiltresContext'
import { FILTRES_VIDES, type Filtres as ValeurFiltres } from '@/logique/filtres'
import { cn } from '@/lib/utils'
import { Link } from 'react-router'

export function BasculeVue({ actif }: { actif: 'graphe' | 'liste' }) {
  return (
    <ToggleLiens
      label="Affichage"
      items={[
        { href: '/', label: 'Graphe', actif: actif === 'graphe' },
        { href: '/liste', label: 'Liste', actif: actif === 'liste' },
      ]}
      rendreLien={({ href, ...reste }) => <Link to={href ?? '/'} {...reste} />}
    />
  )
}

const TYPES: { valeur: ValeurFiltres['type']; libelle: string }[] = [
  { valeur: 'tous', libelle: 'Tous' },
  { valeur: 'entree', libelle: 'Entrée' },
  { valeur: 'evolution', libelle: 'Évolution' },
]

export function Filtres() {
  const { filtres, setFiltres } = useFiltres()
  const actif = filtres.categories.length > 0 || filtres.type !== 'tous'

  const basculer = (cat: string) =>
    setFiltres({
      ...filtres,
      categories: filtres.categories.includes(cat)
        ? filtres.categories.filter((c) => c !== cat)
        : [...filtres.categories, cat],
    })

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
        <div className="flex flex-col gap-1.5">
          <span className="text-[15px] leading-5 font-bold">Type de métier</span>
          <ToggleGroup
            type="single"
            aria-label="Type de métier"
            value={filtres.type}
            onValueChange={(v) => {
              if (v) setFiltres({ ...filtres, type: v as ValeurFiltres['type'] })
            }}
          >
            {TYPES.map((t) => (
              <ToggleGroupItem key={t.valeur} value={t.valeur}>
                {t.libelle}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
        {actif ? (
          <Button variant="ghost" onClick={() => setFiltres(FILTRES_VIDES)}>
            Effacer les filtres
          </Button>
        ) : null}
      </div>
      <div role="group" aria-label="Catégories" className="flex flex-wrap gap-x-6 gap-y-2">
        {lignes.map((l) => (
          <div key={l.id} className="flex flex-wrap items-center gap-1.5">
            <PastilleLigne ligne={l.id} taille="sm" sansNom />
            {l.categories.map((c) => {
              const pressee = filtres.categories.includes(c)
              return (
                <button
                  key={c}
                  type="button"
                  aria-pressed={pressee}
                  onClick={() => basculer(c)}
                  className={cn(
                    'inline-flex h-9 cursor-pointer items-center rounded-sm border border-trait-fort px-3 text-[15px] leading-5 font-bold',
                    pressee
                      ? 'border-primaire bg-primaire text-sur-primaire'
                      : 'bg-surface text-encre hover:bg-surface-muted',
                  )}
                >
                  {categorieParId(c)?.libelle ?? c}
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
