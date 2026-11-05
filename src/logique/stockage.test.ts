import { afterEach, describe, expect, it, vi } from 'vitest'
import { CLES, ecrire, lire, stockageDisponible } from './stockage'

const estObjet = (v: unknown): v is { version: number } =>
  typeof v === 'object' && v !== null && 'version' in v

afterEach(() => {
  vi.restoreAllMocks()
})

describe('CLES', () => {
  it('nomme les clés versionnées du quiz et de la roadmap', () => {
    expect(CLES).toEqual({
      quiz: 'constellation.quiz.v1',
      roadmap: 'constellation.roadmap.v1',
    })
  })
})

describe('lire', () => {
  it('renvoie null si la clé est absente', () => {
    expect(lire('absente', estObjet)).toBeNull()
  })

  it('écrire puis lire rend la valeur', () => {
    expect(ecrire('cle', { version: 1 })).toBe(true)
    expect(lire('cle', estObjet)).toEqual({ version: 1 })
  })

  it('renvoie null sur un JSON illisible et laisse la valeur en place', () => {
    localStorage.setItem('cle', '{pas du json')
    expect(lire('cle', estObjet)).toBeNull()
    expect(localStorage.getItem('cle')).toBe('{pas du json')
  })

  it('renvoie null si le validateur refuse, sans effacer', () => {
    localStorage.setItem('cle', JSON.stringify({ autre: true }))
    expect(lire('cle', estObjet)).toBeNull()
    expect(localStorage.getItem('cle')).toBe(JSON.stringify({ autre: true }))
  })

  it('ne lève pas si le stockage jette', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError')
    })
    expect(lire('cle', estObjet)).toBeNull()
  })
})

describe('ecrire', () => {
  it('renvoie false sans lever si le stockage jette', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('SecurityError')
    })
    expect(ecrire('cle', { version: 1 })).toBe(false)
  })
})

describe('stockageDisponible', () => {
  it('vrai quand le stockage fonctionne, sans laisser la sonde', () => {
    expect(stockageDisponible()).toBe(true)
    expect(localStorage.getItem('constellation.sonde')).toBeNull()
  })

  it('faux si setItem jette', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError')
    })
    expect(stockageDisponible()).toBe(false)
  })
})
