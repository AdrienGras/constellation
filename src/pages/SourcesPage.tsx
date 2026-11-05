import { meta, sources } from '../donnees'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'
import { usePageTitre } from './usePageTitre'

export const LICENCE_TEXTES = 'Licence des textes propres à constellation : à décider (CC BY 4.0 proposée).'

const COLONNES = ['Source', 'Éditeur', 'Date', 'Ce qu’on en tire', 'Licence']

export function SourcesPage() {
  usePageTitre('Sources et mentions')
  return (
    <div className="flex max-w-[1100px] flex-col gap-7 px-12 pt-10 pb-16">
      <div>
        <p className="etiquette m-0 text-encre-douce">Sources et mentions</p>
        <h1 className="titre-1 mt-1 mb-0">D’où viennent ces informations</h1>
      </div>
      <section className="flex flex-col gap-3 rounded-md bg-surface px-7 py-6 shadow-carte">
        <h2 className="titre-3 m-0">Mentions</h2>
        <p className="m-0 max-w-[900px]">{meta.mentions}</p>
        <p className="m-0 text-[15px] text-encre-douce">
          {LICENCE_TEXTES} Données relevées le {meta.genere_le}, version {meta.version}.
        </p>
      </section>
      <section className="flex flex-col gap-3">
        <h2 className="titre-2 m-0">Les {sources.length} sources</h2>
        <div className="rounded-md bg-surface shadow-carte">
          <Table label="Liste des sources">
            <TableHeader>
              <TableRow>
                {COLONNES.map((c) => (
                  <TableHead key={c} scope="col">
                    {c}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sources.map((s) => (
                <TableRow key={s.id}>
                  <th scope="row" className="border-b border-trait p-3 text-left align-top font-normal">
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-encre underline"
                    >
                      {s.titre}
                      <span className="sr-only"> (nouvel onglet)</span>
                    </a>
                  </th>
                  <TableCell>{s.editeur}</TableCell>
                  <TableCell className="font-mono">{s.date}</TableCell>
                  <TableCell>{s.usage}</TableCell>
                  <TableCell className="text-encre-douce">{s.licence}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
      <p className="m-0 text-[15px] text-encre-douce">
        Ton résultat de quiz et ta roadmap restent dans ton navigateur ; rien n’est envoyé nulle part.
      </p>
    </div>
  )
}
