import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  categories,
  lignes,
  ligneDuMetier,
  metierParId,
  metiers,
  plan,
  questions,
  sources,
  stationsDeLigne,
  titresDepuis,
} from './index'

describe('données', () => {
  it('plan.json est une copie exacte de la maquette', () => {
    const copie = readFileSync('src/donnees/plan.json', 'utf-8')
    const maquette = readFileSync('maquette/plan.json', 'utf-8')
    expect(copie).toBe(maquette)
  })

  it('68 métiers, 17 catégories, 8 lignes, 16 questions, 6 sources', () => {
    expect(metiers).toHaveLength(68)
    expect(categories).toHaveLength(17)
    expect(lignes).toHaveLength(8)
    expect(questions).toHaveLength(16)
    expect(sources).toHaveLength(6)
  })

  it('chaque métier a une station de même ligne et de même type', () => {
    for (const m of metiers) {
      const station = plan.stations[m.id]
      expect(station, m.id).toBeDefined()
      expect(station.ligne).toBe(ligneDuMetier(m))
      expect(station.type).toBe(m.type)
      expect(station.cat).toBe(m.categorie)
    }
    expect(Object.keys(plan.stations)).toHaveLength(68)
  })

  it("les lignes suivent l'ordre de macro_branches", () => {
    expect(lignes.map((l) => l.id)).toEqual([
      'developpement',
      'infra-cloud',
      'cybersecurite',
      'data-ia',
      'qualite-archi',
      'produit-design',
      'relation-transmission',
      'management',
    ])
    expect(lignes.map((l) => l.num)).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
  })

  it('titresDepuis(mlops) donne les titres des métiers sources', () => {
    const mlops = metierParId('mlops')
    expect(mlops).toBeDefined()
    expect(titresDepuis(mlops!)).toEqual([
      'Ingénieur·e DevOps',
      'Data engineer',
      'Ingénieur·e machine learning',
    ])
  })

  it("stationsDeLigne suit l'ordre du tracé", () => {
    expect(stationsDeLigne('developpement').slice(0, 3)).toEqual([
      'dev-legacy-cobol',
      'dev-rust-systeme',
      'dev-backend',
    ])
  })

  it('metierParId renvoie undefined pour un id inconnu', () => {
    expect(metierParId('inconnu')).toBeUndefined()
  })
})
