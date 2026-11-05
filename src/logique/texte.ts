// Sans accent, sans casse, sans point médian ni trait d’union : « developpeur » trouve « Développeur·se ».
export function normaliser(texte: string): string {
  return texte.normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/[·-]/g, '').toLowerCase()
}
