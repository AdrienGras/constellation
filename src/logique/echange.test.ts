import { describe, expect, it } from 'vitest'
import { metiers } from '../donnees'
import { FORMAT, exporterRoadmap, importerRoadmap } from './echange'
import { ajouterItem, choisirCible, roadmapVide } from './roadmap'

const ids = new Set(metiers.map((m) => m.id))
const idConnu = metiers[0].id

const exemple = () =>
  choisirCible(
    ajouterItem(
      ajouterItem(roadmapVide(), 2027, { type: 'projet', titre: 'Un', url: 'https://x.fr', note: 'n' }, 'a'),
      2029,
      { type: 'notion', titre: 'Deux', url: '', note: '' },
      'b',
    ),
    idConnu,
  )

const fichier = (surcharge: Record<string, unknown>) =>
  JSON.stringify({ format: FORMAT, version: 1, exporte_le: 'x', cible: null, annees: {}, ...surcharge })

describe('exporterRoadmap', () => {
  it('nomme le fichier à la date locale et sérialise le contenu', () => {
    const { nom, contenu } = exporterRoadmap(exemple(), new Date('2027-05-28T10:00:00'))
    expect(nom).toBe('constellation-roadmap-2027-05-28.json')
    const j = JSON.parse(contenu)
    expect(j.format).toBe('constellation-roadmap')
    expect(j.version).toBe(1)
    expect(typeof j.exporte_le).toBe('string')
    expect(j.cible).toBe(idConnu)
    expect(j.annees['2027']).toHaveLength(1)
  })
})

describe('importerRoadmap', () => {
  it('fait l’aller-retour', () => {
    const e = exemple()
    const r = importerRoadmap(exporterRoadmap(e, new Date()).contenu, ids)
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.roadmap.annees).toEqual(e.annees)
      expect(r.roadmap.cible).toBe(idConnu)
      expect(r.cibleInconnue).toBe(false)
    }
  })

  it('refuse un JSON illisible', () => {
    expect(importerRoadmap('{pas du json', ids)).toEqual({
      ok: false,
      erreur: 'Ce fichier n’est pas un JSON lisible.',
    })
  })
  it('refuse un format absent ou différent', () => {
    const attendu = { ok: false, erreur: 'Ce fichier n’est pas une roadmap constellation.' }
    expect(importerRoadmap(fichier({ format: 'autre' }), ids)).toEqual(attendu)
    expect(importerRoadmap('[]', ids)).toEqual(attendu)
    expect(importerRoadmap('null', ids)).toEqual(attendu)
  })
  it('refuse une version inconnue', () => {
    expect(importerRoadmap(fichier({ version: 2 }), ids)).toEqual({
      ok: false,
      erreur:
        'Cette roadmap vient d’une version de constellation que l’app ne connaît pas (version 2).',
    })
  })
  it('refuse une année hors grille', () => {
    expect(importerRoadmap(fichier({ annees: { '2032': [] } }), ids)).toEqual({
      ok: false,
      erreur: 'L’année 2032 n’est pas dans la grille 2027 → 2031.',
    })
  })
  it('refuse un item mal formé, rang à partir de 1', () => {
    const annees = { '2028': [{ type: 'projet', titre: 'ok' }, { type: 'autre', titre: 'x' }] }
    expect(importerRoadmap(fichier({ annees }), ids)).toEqual({
      ok: false,
      erreur:
        'L’élément n° 2 de 2028 est incomplet : il lui faut un type (projet ou notion) et un titre.',
    })
  })
  it('renvoie la première erreur : format avant version', () => {
    const r = importerRoadmap(fichier({ format: 'x', version: 9 }), ids)
    expect(r).toEqual({ ok: false, erreur: 'Ce fichier n’est pas une roadmap constellation.' })
  })

  it('tolère les imperfections', () => {
    const annees = {
      '2027': [
        { type: 'projet', titre: '  Espacé  ', inconnu: 1 },
        { id: 'z', type: 'notion', titre: 'T', url: 'https://a.fr', note: 'n' },
      ],
    }
    const r = importerRoadmap(fichier({ annees }), ids)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    const [a, b] = r.roadmap.annees['2027']
    expect(a.id).not.toBe('')
    expect(a).toEqual({ id: a.id, type: 'projet', titre: '  Espacé  ', url: '', note: '' })
    expect(b.id).toBe('z')
    expect(r.roadmap.annees['2028']).toEqual([])
  })

  it('accepte une année numérique', () => {
    // JSON.parse ne produit que des chaînes comme clés ; on vérifie la tolérance via les clés « 2027 »
    const r = importerRoadmap(fichier({ annees: { '2027': [] } }), ids)
    expect(r.ok).toBe(true)
  })

  it('met à null une cible inconnue et le signale', () => {
    const r = importerRoadmap(fichier({ cible: 'metier-disparu' }), ids)
    expect(r).toMatchObject({ ok: true, cibleInconnue: true })
    if (r.ok) expect(r.roadmap.cible).toBeNull()
  })
})
