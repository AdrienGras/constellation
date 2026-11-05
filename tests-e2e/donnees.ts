/** Fenêtres de mesure de la repasse UX (hauteurs d'un PC portable, barres du navigateur déduites). */
export const FENETRES = {
  w1366: { width: 1366, height: 633 },
  w1280: { width: 1280, height: 590 },
  w1536: { width: 1536, height: 731 },
  w1280x800: { width: 1280, height: 800 },
  /** Sous 1280 px : légende et bouton « Plein écran » dans le flux de la page. */
  w1024: { width: 1024, height: 700 },
}

/** Quiz terminé, les 16 réponses identiques : « a » donne le départage en attente, « b » le résultat Infra & cloud / Management / Développement. */
const etatQuiz = (lettre: 'a' | 'b') => ({
  version: 1,
  reponses: Object.fromEntries(
    Array.from({ length: 16 }, (_, i) => [`q${String(i + 1).padStart(2, '0')}`, lettre]),
  ),
  question: 15,
  departage: [],
  termine: true,
})

export const QUIZ_A = etatQuiz('a')
export const QUIZ_B = etatQuiz('b')

const element = (id: string, type: 'projet' | 'notion', titre: string, url = '', note = '') => ({
  id,
  type,
  titre,
  url,
  note,
})

export const ROADMAP_AUDIT = {
  version: 1,
  cible: 'dev-backend',
  annees: {
    '2027': [
      element('audit-1', 'notion', 'Bases de SQL et modélisation de données', 'https://roadmap.sh/sql', 'Faire les exercices du module'),
      element('audit-2', 'projet', 'API REST de gestion de bibliothèque en Node.js'),
      element('audit-3', 'notion', 'Git avancé : rebase, bisect, hooks'),
    ],
    '2028': [
      element('audit-4', 'projet', 'Stage de 3 mois en entreprise : back-end PHP/Symfony'),
      element('audit-5', 'notion', 'Docker et docker compose'),
    ],
    '2029': [element('audit-6', 'notion', 'Architecture hexagonale et DDD')],
    '2030': [],
    '2031': [element('audit-7', 'projet', 'Alternance en Master : développeur·se back-end')],
  },
  modifie_le: null,
}
