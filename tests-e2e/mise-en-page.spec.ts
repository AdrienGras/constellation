import { expect, test } from './fixtures'

/** Fenêtres de mesure de la repasse UX (hauteurs d'un PC portable, barres du navigateur déduites). */
export const FENETRES = {
  w1366: { width: 1366, height: 633 },
  w1280: { width: 1280, height: 590 },
  w1536: { width: 1536, height: 731 },
  w1280x800: { width: 1280, height: 800 },
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

// Playwright exige un motif de déstructuration pour le premier argument.
// eslint-disable-next-line no-empty-pattern
test.beforeEach(({}, info) => {
  test.skip(info.project.name === 'mobile', 'Mesures de mise en page à partir de 1280 px de large.')
})

test.describe('roadmap : colonne des compétences', () => {
  test.use({ viewport: FENETRES.w1366 })

  test('reste collée à 24 px après 900 px de défilement', async ({ roadmap }) => {
    await roadmap.ouvrir()
    await roadmap.poserStockage('constellation.roadmap.v1', ROADMAP_AUDIT)
    await roadmap.defilerA(900)
    const { haut, bas } = await roadmap.rectEcran(roadmap.colonneCompetences)
    expect(Math.abs(haut - 24)).toBeLessThanOrEqual(1)
    expect(bas).toBeLessThanOrEqual(await roadmap.hauteurFenetre())
  })
})

for (const [nom, fenetre] of [
  ['1366×633', FENETRES.w1366],
  ['1280×590', FENETRES.w1280],
] as const) {
  test.describe(`quiz : barre de navigation collée (${nom})`, () => {
    test.use({ viewport: fenetre })

    test('les 16 questions : bouton visible à l’ouverture', async ({ quiz }) => {
      await quiz.ouvrir()
      for (let i = 0; i < 16; i++) {
        await quiz.defilerA(0)
        expect((await quiz.rectEcran(quiz.boutonAvancer)).bas).toBeLessThanOrEqual(await quiz.hauteurFenetre())
        await quiz.cocherPremiere()
        await quiz.boutonAvancer.click()
      }
    })

    test('défilée en bas, la barre ne recouvre ni la dernière réponse ni la note', async ({ quiz }) => {
      await quiz.ouvrir()
      for (let i = 0; i < 8; i++) {
        await quiz.cocherPremiere()
        await quiz.boutonAvancer.click()
      }
      await quiz.defilerA(99999)
      const barre = await quiz.rectEcran(quiz.barreNavigation)
      expect((await quiz.rectEcran(quiz.dernierChoix)).bas).toBeLessThanOrEqual(barre.haut)
      expect((await quiz.rectEcran(quiz.note)).bas).toBeLessThanOrEqual(barre.haut)
    })

    test('au clavier, la dernière réponse n’est pas masquée par la barre', async ({ quiz }) => {
      await quiz.ouvrir()
      for (let i = 0; i < 8; i++) {
        await quiz.cocherPremiere()
        await quiz.boutonAvancer.click()
      }
      await quiz.defilerA(0)
      await quiz.descendreAuClavier(3)
      const barre = await quiz.rectEcran(quiz.barreNavigation)
      expect((await quiz.rectEcran(quiz.dernierChoix)).bas).toBeLessThanOrEqual(barre.haut)
    })

    test('départage : bouton visible à l’ouverture', async ({ quiz }) => {
      await quiz.ouvrir()
      await quiz.poserStockage('constellation.quiz.v1', QUIZ_A)
      expect((await quiz.rectEcran(quiz.boutonAvancer)).bas).toBeLessThanOrEqual(await quiz.hauteurFenetre())
    })
  })
}
