import { ANNEES, nouvelId, roadmapVide, urlAcceptable, type EtatRoadmap, type Item } from './roadmap'

export const FORMAT = 'constellation-roadmap'

const deuxChiffres = (n: number) => String(n).padStart(2, '0')

export function exporterRoadmap(
  e: EtatRoadmap,
  maintenant: Date,
): { nom: string; contenu: string } {
  const date = `${maintenant.getFullYear()}-${deuxChiffres(maintenant.getMonth() + 1)}-${deuxChiffres(maintenant.getDate())}`
  const contenu = JSON.stringify(
    {
      format: FORMAT,
      version: 1,
      exporte_le: maintenant.toISOString(),
      cible: e.cible,
      annees: e.annees,
    },
    null,
    2,
  )
  return { nom: `${FORMAT}-${date}.json`, contenu }
}

export type ResultatImport =
  | { ok: true; roadmap: EtatRoadmap; cibleInconnue: boolean }
  | { ok: false; erreur: string }

const echec = (erreur: string): ResultatImport => ({ ok: false, erreur })

const estObjet = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)

export function importerRoadmap(texte: string, idsMetiers: ReadonlySet<string>): ResultatImport {
  let brut: unknown
  try {
    brut = JSON.parse(texte)
  } catch {
    return echec('Ce fichier n’est pas un JSON lisible.')
  }
  if (!estObjet(brut) || brut.format !== FORMAT) {
    return echec('Ce fichier n’est pas une roadmap constellation.')
  }
  if (brut.version !== 1) {
    return echec(
      `Cette roadmap vient d’une version de constellation que l’app ne connaît pas (version ${String(brut.version)}).`,
    )
  }

  const annees = estObjet(brut.annees) ? brut.annees : {}
  const roadmap = roadmapVide()
  const idsVus = new Set<string>()
  for (const cle of Object.keys(annees)) {
    const annee = ANNEES.find((a) => String(a) === cle)
    if (annee === undefined) {
      return echec(`L’année ${cle} n’est pas dans la grille 2027 → 2031.`)
    }
    const liste = Array.isArray(annees[cle]) ? (annees[cle] as unknown[]) : []
    const items: Item[] = []
    for (let i = 0; i < liste.length; i++) {
      const it = liste[i]
      if (
        !estObjet(it) ||
        (it.type !== 'projet' && it.type !== 'notion') ||
        typeof it.titre !== 'string' ||
        it.titre.trim() === ''
      ) {
        return echec(
          `L’élément n° ${i + 1} de ${cle} est incomplet : il lui faut un type (projet ou notion) et un titre.`,
        )
      }
      const url = typeof it.url === 'string' ? it.url.trim() : ''
      if (!urlAcceptable(url)) {
        return echec(
          `L’élément n° ${i + 1} de ${cle} a une adresse qui ne commence pas par http:// ou https://.`,
        )
      }
      let id = typeof it.id === 'string' ? it.id : ''
      if (id === '' || idsVus.has(id)) id = nouvelId()
      idsVus.add(id)
      items.push({
        id,
        type: it.type,
        titre: it.titre.trim(),
        url,
        note: typeof it.note === 'string' ? it.note.trim() : '',
      })
    }
    roadmap.annees[`${annee}`] = items
  }

  const cible = typeof brut.cible === 'string' ? brut.cible : null
  const cibleInconnue = cible !== null && !idsMetiers.has(cible)
  roadmap.cible = cible !== null && !cibleInconnue ? cible : null
  return { ok: true, roadmap, cibleInconnue }
}
