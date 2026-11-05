import type { Apec, ValeursApec } from '@/donnees/types'
import { echelleApec, kApec, keur } from '@/logique/salaires'
import { Alert, AlertTitle } from '@/components/ui/alert'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const SOURCE = 'Source : Apec, rémunérations des cadres, édition 2025.'
const classeCartouche = 'flex min-w-0 flex-col gap-4 rounded-md bg-surface p-5 shadow-carte'

function Tete() {
  return (
    <div>
      <h3 className="m-0 font-display text-[20px] leading-[26px] font-[650]">
        Salaire cible <span className="font-medium text-encre-douce">· Apec</span>
      </h3>
      <p className="mt-0.5 mb-0 text-[15px] leading-[22px] text-encre-douce">
        Fixe + variable, cadres du secteur privé.
      </p>
    </div>
  )
}

function Reglette({ apec }: { apec: Apec }) {
  const [mn, mx] = echelleApec(apec)
  const span = mx - mn
  const pos = (v: number) => `${((v - mn) / span) * 100}%`
  const etiquette = 'absolute -translate-x-1/2 text-[13px] leading-4 whitespace-nowrap text-encre-douce'
  return (
    <div
      role="img"
      aria-label={`1er décile ${apec.d1} k€, médiane ${apec.mediane} k€, 9e décile ${apec.d9} k€`}
      className="relative mx-3.5 h-14"
    >
      <div className="absolute inset-x-0 top-5 h-3 rounded-full bg-surface-muted" />
      <div
        className="absolute top-5 h-3 rounded-full bg-info-doux shadow-[inset_0_0_0_2px_var(--info)]"
        style={{ left: pos(apec.d1), width: `${((apec.d9 - apec.d1) / span) * 100}%` }}
      />
      <div
        className="absolute top-3 -ml-0.5 h-7 w-1 rounded-sm bg-encre"
        style={{ left: pos(apec.mediane) }}
      />
      <span className={`${etiquette} top-10`} style={{ left: pos(apec.d1) }}>
        1er décile <b className="font-mono text-encre">{apec.d1}</b>
      </span>
      <span className={`${etiquette} -top-1.5`} style={{ left: pos(apec.mediane) }}>
        médiane <b className="font-mono text-encre">{apec.mediane}</b>
      </span>
      <span className={`${etiquette} top-10`} style={{ left: pos(apec.d9) }}>
        9e décile <b className="font-mono text-encre">{apec.d9}</b>
      </span>
    </div>
  )
}

function LignePopulation({ libelle, v }: { libelle: string; v: ValeursApec | null }) {
  const cellule = 'text-right font-mono tabular-nums'
  const valeur = (x: number | null | undefined) =>
    x === null || x === undefined ? (
      <span className="font-mono font-semibold text-encre-douce">n.d.</span>
    ) : (
      kApec(x)
    )
  return (
    <TableRow>
      <TableHead scope="row" className="bg-transparent text-[16px] leading-[22px] font-bold tracking-normal text-encre normal-case">
        {libelle}
      </TableHead>
      <TableCell className={cellule}>{valeur(v?.mediane)}</TableCell>
      <TableCell className={cellule}>{valeur(v?.d1)}</TableCell>
      <TableCell className={cellule}>{valeur(v?.d9)}</TableCell>
    </TableRow>
  )
}

export function CartoucheApec({
  apec,
  raisonAbsence,
}: {
  apec: Apec | null
  raisonAbsence?: string | null
}) {
  if (!apec) {
    return (
      <section aria-label="Salaire cible, Apec" className={classeCartouche}>
        <Tete />
        <p className="m-0 flex flex-wrap items-baseline gap-3">
          <span className="font-mono text-[28px] leading-[34px] font-semibold text-encre-douce">n.d.</span>
          <span className="text-encre-douce">Pas de donnée Apec pour ce métier.</span>
        </p>
        {raisonAbsence ? (
          <p className="m-0 rounded-sm bg-surface-muted px-4 py-3 text-[15px] leading-[22px]">
            <strong className="font-bold">Pourquoi : </strong>
            {raisonAbsence}
          </p>
        ) : null}
        <p className="m-0 text-[14px] leading-5 text-encre-douce">{SOURCE}</p>
      </section>
    )
  }

  return (
    <section aria-label="Salaire cible, Apec" className={classeCartouche}>
      <Tete />
      <Alert variant="info">
        <AlertTitle>Médiane des cadres, toutes expériences, pas un salaire d’embauche.</AlertTitle>
      </Alert>
      <div className="flex flex-wrap items-baseline gap-3">
        <span className="font-mono text-[40px] leading-[44px] font-semibold tabular-nums">
          {keur(apec.mediane)}
        </span>
        <span>{`médiane · famille « ${apec.famille} »`}</span>
      </div>
      <Reglette apec={apec} />
      <Table label="Médianes Apec par population">
        <TableHeader>
          <TableRow>
            <TableHead scope="col">Population</TableHead>
            <TableHead scope="col" className="text-right">Médiane</TableHead>
            <TableHead scope="col" className="text-right">1er décile</TableHead>
            <TableHead scope="col" className="text-right">9e décile</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <LignePopulation libelle="Île-de-France" v={apec.idf} />
          <LignePopulation libelle="Autres régions" v={apec.autres_regions} />
          <LignePopulation libelle="Moins de 35 ans" v={apec.moins_35_ans} />
        </TableBody>
      </Table>
      {apec.rapprochement ? (
        <p className="m-0 rounded-sm bg-surface-muted px-4 py-3 text-[15px] leading-[22px]">
          <strong className="font-bold">
            {`Données de la famille Apec « ${apec.rapprochement.de} » : `}
          </strong>
          {apec.rapprochement.raison}
        </p>
      ) : null}
      <p className="m-0 text-[14px] leading-5 text-encre-douce">{SOURCE}</p>
    </section>
  )
}
