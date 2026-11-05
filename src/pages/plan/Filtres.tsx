import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { ToggleGroup, ToggleGroupItem, ToggleLiens } from '@/components/ui/toggle-group'
import { PastilleLigne } from '@/components/metier/PastilleLigne'
import { categorieParId, lignes } from '@/donnees'
import { useFiltres } from '@/etat/FiltresContext'
import { FILTRES_VIDES, type Filtres as ValeurFiltres } from '@/logique/filtres'
import { cn } from '@/lib/utils'
import { styleChamp } from '@/components/ui/input'
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

/** Légende des 8 lignes, posée dans le plan (une colonne) ou dans le flux de la page. */
export function LegendeLignes({ className }: { className?: string }) {
  return (
    <div role="group" aria-label="Légende des lignes" className={className}>
      {lignes.map((l) => (
        <PastilleLigne key={l.id} ligne={l.id} taille="sm" />
      ))}
    </div>
  )
}

export function Filtres({ legende = true }: { legende?: boolean }) {
  const { filtres, setFiltres } = useFiltres()
  const selectCategorie = useRef<HTMLSelectElement>(null)
  const actif = filtres.categories.length > 0 || filtres.type !== 'tous'

  return (
    <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
      <div className="relative w-[240px] max-w-full">
      <label className="flex flex-col gap-1.5">
        <span className="text-[15px] leading-5 font-bold">Catégorie</span>
        <select
          ref={selectCategorie}
          className={cn(styleChamp, 'cursor-pointer')}
          value={filtres.categories[0] ?? ''}
          onChange={(e) =>
            setFiltres({ ...filtres, categories: e.target.value ? [e.target.value] : [] })
          }
        >
          <option value="">Toutes les catégories</option>
          {lignes.map((l) => (
            <optgroup key={l.id} label={`Ligne ${l.num}, ${l.libelle}`}>
              {l.categories.map((c) => (
                <option key={c} value={c}>
                  {categorieParId(c)?.libelle ?? c}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </label>
      {actif ? (
        // Posé sur la rangée du libellé, pour ne pas élargir la rangée des filtres.
        <Button variant="link" className="absolute top-0 right-0 text-[15px]" onClick={() => {
            setFiltres(FILTRES_VIDES)
            // Le bouton se démonte avec les filtres : le focus passe au premier champ.
            selectCategorie.current?.focus()
          }}>
          Effacer les filtres
        </Button>
      ) : null}
      </div>
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
      {legende ? (
        <LegendeLignes className="flex flex-1 flex-wrap justify-end gap-x-3 gap-y-1.5 pb-1" />
      ) : null}
    </div>
  )
}
