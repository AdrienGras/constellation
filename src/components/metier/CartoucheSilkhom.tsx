import { useState } from 'react'
import { Info } from 'lucide-react'
import type { GrilleSilkhom, LigneId, Silkhom, TypeMetier, Zone } from '@/donnees/types'
import {
  ZONES,
  ZONE_PAR_DEFAUT,
  avertissementSilkhom,
  badgePremierEmploi,
  echelleSilkhom,
  fourchette,
  keur,
  libelleTranche,
} from '@/logique/salaires'
import { Alert, AlertTitle } from '@/components/ui/alert'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { PlageSalaire } from './PlageSalaire'

const ND = <span className="font-mono font-semibold text-encre-douce">n.d.</span>

function GrilleTranches({
  grille,
  zone,
  echelle,
  couleur,
  type,
}: {
  grille: GrilleSilkhom
  zone: Zone
  echelle: [number, number]
  couleur?: string
  type: TypeMetier
}) {
  const premiere = grille.niveaux[0]
  const libelleZone = ZONES.find((z) => z.value === zone)?.label
  return (
    <Table label="Grille Silkhom, défilable">
      <TableCaption className="sr-only">{`${grille.ligne ? `Profil Silkhom ${grille.ligne}` : 'Grille Silkhom'}, zone ${libelleZone}`}</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead scope="col">Expérience</TableHead>
          <TableHead scope="col">Fourchette</TableHead>
          <TableHead scope="col">
            <span className="sr-only">Visualisation</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {grille.niveaux.map((n, i) => {
          const p = n[zone]
          return (
            <TableRow key={i}>
              <TableCell className="w-px font-bold whitespace-nowrap">
                {libelleTranche(n)}
                {badgePremierEmploi(i, premiere, zone, type) ? (
                  <div>
                    <span className="mt-1 inline-flex rounded-sm bg-succes-doux px-2 py-0.5 text-[13px] leading-[18px] font-bold text-succes">
                      La plus proche d’un premier emploi
                    </span>
                  </div>
                ) : null}
              </TableCell>
              <TableCell className="w-px font-mono text-[17px] whitespace-nowrap tabular-nums">
                {p ? fourchette(p) : ND}
              </TableCell>
              <TableCell className="w-full">
                {/* Piste plafonnée : au-delà, la fourchette s'éloignerait de sa barre (≈ sa largeur en 1280).
                    Calée sur la 1re ligne de la fourchette (22 px), même quand le badge rend la ligne plus haute. */}
                {p ? (
                  <div className="flex h-[22px] max-w-[640px] items-center [&>*]:flex-1">
                    <PlageSalaire min={p[0]} max={p[1]} echelle={echelle} couleur={couleur} />
                  </div>
                ) : null}
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

export function CartoucheSilkhom({
  silkhom,
  type,
  depuisTitres,
  ligne,
  raisonAbsence,
}: {
  silkhom: Silkhom | null
  type: TypeMetier
  depuisTitres: string[]
  ligne: LigneId
  raisonAbsence?: string | null
}) {
  const [zone, setZone] = useState<Zone>(ZONE_PAR_DEFAUT)

  const titre = (
    <h3 className="m-0 font-display text-[20px] leading-[26px] font-[650]">
      Salaire cible <span className="font-medium text-encre-douce">· Silkhom</span>
    </h3>
  )
  const classeCartouche =
    'flex min-w-0 flex-col gap-4 rounded-md bg-surface p-5 shadow-carte'

  if (!silkhom) {
    return (
      <section aria-label="Salaire cible, Silkhom" className={classeCartouche}>
        {titre}
        <p className="m-0 flex items-baseline gap-3">
          <span className="font-mono text-[28px] leading-[34px] font-semibold text-encre-douce">n.d.</span>
        </p>
        {raisonAbsence ? (
          <p className="m-0 rounded-sm bg-surface-muted px-4 py-3 text-[15px] leading-[22px]">
            {raisonAbsence}
          </p>
        ) : null}
      </section>
    )
  }

  const echelle = echelleSilkhom(silkhom)
  const couleur = `var(--ligne-${ligne})`
  const avertissement = avertissementSilkhom(silkhom, type, depuisTitres)
  const grille = (g: GrilleSilkhom) => (
    <GrilleTranches grille={g} zone={zone} echelle={echelle} couleur={couleur} type={type} />
  )

  return (
    <section aria-label="Salaire cible, Silkhom" className={classeCartouche}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          {titre}
          <p className="mt-0.5 mb-0 text-[15px] leading-[22px] text-encre-douce">
            Brut annuel fixe, hors primes, par années d’expérience dans le poste.
          </p>
        </div>
        <ToggleGroup
          type="single"
          aria-label="Zone géographique"
          className="max-w-full flex-wrap"
          value={zone}
          onValueChange={(v) => {
            if (v) setZone(v as Zone)
          }}
        >
          {ZONES.map((z) => (
            <ToggleGroupItem key={z.value} value={z.value}>
              {z.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      {avertissement ? (
        <Alert variant={avertissement.variante}>
          {avertissement.variante === 'neutre' ? <Info aria-hidden="true" /> : null}
          <AlertTitle>{avertissement.texte}</AlertTitle>
        </Alert>
      ) : null}

      {silkhom.grilles.length > 1 ? (
        <Tabs defaultValue="0">
          <TabsList aria-label="Profil Silkhom">
            {silkhom.grilles.map((g, i) => (
              <TabsTrigger key={i} value={String(i)}>
                {g.ligne ?? `Profil ${i + 1}`}
              </TabsTrigger>
            ))}
          </TabsList>
          {silkhom.grilles.map((g, i) => (
            <TabsContent key={i} value={String(i)}>
              {grille(g)}
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        grille(silkhom.grilles[0])
      )}

      <p className="m-0 text-[15px] text-encre-douce">
        Moyenne relevée par Silkhom :{' '}
        {silkhom.moyenne_keur === null ? (
          ND
        ) : (
          <b className="font-mono font-semibold text-encre">{keur(silkhom.moyenne_keur)}</b>
        )}
      </p>
      {silkhom.rapprochement ? (
        <p className="m-0 rounded-sm bg-surface-muted px-4 py-3 text-[15px] leading-[22px]">
          <strong className="font-bold">
            {`Données du profil Silkhom « ${silkhom.rapprochement.de} » : `}
          </strong>
          {silkhom.rapprochement.raison}
        </p>
      ) : null}
      <p className="m-0 text-[14px] leading-5 text-encre-douce">
        Source : Silkhom, baromètre des salaires 2026.
      </p>
    </section>
  )
}
