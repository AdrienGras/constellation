export const CLES = {
  quiz: 'constellation.quiz.v1',
  roadmap: 'constellation.roadmap.v1',
} as const

const SONDE = 'constellation.sonde'

// L'accès à window.localStorage peut lui-même jeter (navigation privée, cookies bloqués).
function stockage(): Storage | null {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

export function stockageDisponible(): boolean {
  try {
    const s = stockage()
    if (!s) return false
    s.setItem(SONDE, '1')
    s.removeItem(SONDE)
    return true
  } catch {
    return false
  }
}

// Une valeur illisible ou refusée par le validateur renvoie null sans être effacée.
export function lire<T>(cle: string, valider: (v: unknown) => v is T): T | null {
  try {
    const brut = stockage()?.getItem(cle)
    if (brut == null) return null
    const valeur: unknown = JSON.parse(brut)
    return valider(valeur) ? valeur : null
  } catch {
    return null
  }
}

export function ecrire(cle: string, valeur: unknown): boolean {
  try {
    const s = stockage()
    if (!s) return false
    s.setItem(cle, JSON.stringify(valeur))
    return true
  } catch {
    return false
  }
}
