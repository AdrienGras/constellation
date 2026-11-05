import { describe, expect, it } from 'vitest'
import {
  ajouterItem,
  choisirCible,
  deplacerItem,
  estEtatRoadmap,
  estVide,
  modifierItem,
  nbItems,
  roadmapVide,
  supprimerItem,
  urlAcceptable,
  validerBrouillon,
  type Brouillon,
} from './roadmap'

const brouillon = (titre: string): Brouillon => ({ type: 'projet', titre, url: '', note: '' })

describe('roadmapVide', () => {
  it('a cinq années vides, pas de cible', () => {
    const e = roadmapVide()
    expect(Object.keys(e.annees)).toEqual(['2027', '2028', '2029', '2030', '2031'])
    for (const liste of Object.values(e.annees)) expect(liste).toEqual([])
    expect(e.cible).toBeNull()
    expect(estVide(e)).toBe(true)
    expect(estEtatRoadmap(e)).toBe(true)
  })
})

describe('ajouter, modifier, supprimer', () => {
  it('opère sans muter l’état d’entrée', () => {
    const e0 = roadmapVide()
    const copie0 = structuredClone(e0)
    const e1 = ajouterItem(e0, 2027, brouillon('Un'), 'a')
    const e2 = ajouterItem(e1, 2027, brouillon('Deux'), 'b')
    expect(e0).toEqual(copie0)
    expect(nbItems(e2)).toBe(2)
    expect(estVide(e2)).toBe(false)

    const copie2 = structuredClone(e2)
    const e3 = modifierItem(e2, 2027, 'a', { ...brouillon('Un modifié'), note: 'n' })
    expect(e2).toEqual(copie2)
    expect(e3.annees['2027'][0]).toEqual({ id: 'a', type: 'projet', titre: 'Un modifié', url: '', note: 'n' })

    const e4 = supprimerItem(e3, 2027, 'b')
    expect(e3.annees['2027']).toHaveLength(2)
    expect(e4.annees['2027'].map((i) => i.id)).toEqual(['a'])
  })

  it('génère un id quand il n’est pas fourni', () => {
    const e = ajouterItem(roadmapVide(), 2028, brouillon('X'))
    expect(e.annees['2028'][0].id).not.toBe('')
  })
})

describe('deplacerItem', () => {
  const base = ['a', 'b', 'c'].reduce(
    (e, id) => ajouterItem(e, 2027, brouillon(id), id),
    roadmapVide(),
  )
  const ids = (e: typeof base) => e.annees['2027'].map((i) => i.id)

  it('déplace', () => expect(ids(deplacerItem(base, 2027, 0, 2))).toEqual(['b', 'c', 'a']))
  it('ignore hors bornes', () => {
    expect(ids(deplacerItem(base, 2027, 0, -1))).toEqual(['a', 'b', 'c'])
    expect(ids(deplacerItem(base, 2027, 2, 3))).toEqual(['a', 'b', 'c'])
  })
})

describe('choisirCible', () => {
  it('change la cible sans toucher aux items', () => {
    const e = ajouterItem(roadmapVide(), 2027, brouillon('a'), 'a')
    const f = choisirCible(e, 'dev-web')
    expect(f.cible).toBe('dev-web')
    expect(f.annees).toEqual(e.annees)
    expect(e.cible).toBeNull()
    expect(estVide(f)).toBe(false)
    expect(choisirCible(f, null).cible).toBeNull()
  })
})

describe('validerBrouillon', () => {
  it('refuse un titre vide', () => {
    expect(validerBrouillon({ ...brouillon('  ') }).titre).toBe('Donne un titre à cet élément.')
  })
  it('refuse une url sans http(s)', () => {
    expect(validerBrouillon({ ...brouillon('x'), url: 'symfony.com' }).url).toBe(
      'L’adresse doit commencer par http:// ou https://.',
    )
  })
  it('accepte url vide ou valide', () => {
    expect(validerBrouillon({ ...brouillon('x'), url: '' })).toEqual({})
    expect(validerBrouillon({ ...brouillon('x'), url: 'https://x.fr' })).toEqual({})
  })
})

describe('estEtatRoadmap', () => {
  it('refuse une année manquante', () => {
    const e = roadmapVide() as unknown as { annees: Record<string, unknown> }
    delete e.annees['2030']
    expect(estEtatRoadmap(e)).toBe(false)
  })
  it('refuse un item sans type', () => {
    const e = structuredClone(roadmapVide()) as unknown as { annees: Record<string, unknown[]> }
    e.annees['2027'].push({ id: 'a', titre: 't', url: '', note: '' })
    expect(estEtatRoadmap(e)).toBe(false)
  })
  it('refuse le non-objet', () => expect(estEtatRoadmap(null)).toBe(false))
})

describe('urlAcceptable', () => {
  it('accepte vide, http et https', () => {
    for (const u of ['', 'https://x.fr', 'http://x.fr']) expect(urlAcceptable(u)).toBe(true)
  })
  it('refuse les autres schémas et les adresses nues', () => {
    for (const u of ['javascript:alert(1)', 'JAVASCRIPT:alert(1)', 'data:text/html,x', 'symfony.com'])
      expect(urlAcceptable(u)).toBe(false)
  })
  it('estEtatRoadmap refuse une url dangereuse', () => {
    const e = ajouterItem(roadmapVide(), 2027, { ...brouillon('a'), url: 'javascript:alert(1)' }, 'a')
    expect(estEtatRoadmap(e)).toBe(false)
  })
})
