import { expect, test } from './fixtures'
import { FENETRES, QUIZ_A, QUIZ_B, ROADMAP_AUDIT } from './donnees'

/** Station la plus à gauche de la ligne 6 (Produit & design), sous la carte de légende. */
const STATION_LIGNE_6 = 'UX designer'

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

    test('départage au clavier : la dernière ligne n’est pas masquée par la barre', async ({ quiz }) => {
      await quiz.ouvrir()
      await quiz.poserStockage('constellation.quiz.v1', QUIZ_A)
      await quiz.defilerA(0)
      await quiz.tabulerJusquAuDerniereCase()
      const barre = await quiz.rectEcran(quiz.barreNavigation)
      expect((await quiz.rectEcran(quiz.dernierChoix)).bas).toBeLessThanOrEqual(barre.haut)
    })
  })
}

for (const [nom, fenetre] of [
  ['1280×590', FENETRES.w1280],
  ['1536×731', FENETRES.w1536],
] as const) {
  test.describe(`plan : légende et bouton plein écran (${nom})`, () => {
    test.use({ viewport: fenetre })

    test('la légende et le bouton ne recouvrent aucune station', async ({ plan }) => {
      await plan.ouvrir()
      await expect(plan.boutonPleinEcran).toBeVisible()
      expect(await plan.stationsRecouvertesPar(plan.legende)).toEqual([])
      expect(await plan.stationsRecouvertesPar(plan.boutonPleinEcran)).toEqual([])
      const l = await plan.rectEcran(plan.legende)
      const b = await plan.rectEcran(plan.boutonPleinEcran)
      const croise = l.gauche < b.droite && l.droite > b.gauche && l.haut < b.bas && l.bas > b.haut
      expect(croise).toBe(false)
      const d = await plan.rectEcran(plan.dessin)
      for (const r of [l, b]) {
        expect(r.gauche).toBeGreaterThanOrEqual(d.gauche - 1)
        expect(r.droite).toBeLessThanOrEqual(d.droite + 1)
        expect(r.haut).toBeGreaterThanOrEqual(d.haut - 1)
        expect(r.bas).toBeLessThanOrEqual(d.bas + 1)
      }
    })
  })
}

test.describe('plan : bulle au-dessus de la légende (1280×590)', () => {
  test.use({ viewport: FENETRES.w1280 })

  test('la bulle d’une station du coin haut gauche reste entièrement visible', async ({ plan }) => {
    await plan.ouvrir()
    await plan.survolerStation(STATION_LIGNE_6)
    await expect(plan.bulle).toBeVisible()
    expect(await plan.bulleEntierementVisible()).toBe(true)
  })
})

const ETATS_QUIZ = [
  ['avant le quiz', null],
  ['résultat du quiz', QUIZ_B],
  ['départage en attente', QUIZ_A],
] as const

for (const [nom, fenetre] of [
  ['1280×590', FENETRES.w1280],
  ['1366×633', FENETRES.w1366],
  ['1536×731', FENETRES.w1536],
  ['1280×800', FENETRES.w1280x800],
] as const) {
  for (const [etat, quiz] of ETATS_QUIZ) {
    test.describe(`plan : en-tête compact (${nom}, ${etat})`, () => {
      test.use({ viewport: fenetre })

      test('plan à 300 px au plus, titre sur une ligne, sans défilement horizontal', async ({ plan }) => {
        await plan.ouvrir()
        if (quiz) await plan.poserStockage('constellation.quiz.v1', quiz)
        expect(await plan.hautDansLaPage(plan.dessin)).toBeLessThanOrEqual(300)
        expect(await plan.nombreDeLignes(plan.titre)).toBe(1)
        const { contenu, fenetre: largeur } = await plan.largeursDocument()
        expect(contenu).toBeLessThanOrEqual(largeur)
      })
    })
  }
}

for (const [etat, quiz] of ETATS_QUIZ) {
  test.describe(`plan : centre visible sans défiler (1366×633, ${etat})`, () => {
    test.use({ viewport: FENETRES.w1366 })

    test('le bas du centre « TA FORMATION » tient dans la fenêtre', async ({ plan }) => {
      await plan.ouvrir()
      if (quiz) await plan.poserStockage('constellation.quiz.v1', quiz)
      expect((await plan.rectEcran(plan.centre)).bas).toBeLessThanOrEqual(await plan.hauteurFenetre())
    })
  })
}

test.describe('plan : filtre actif (1280×590)', () => {
  test.use({ viewport: FENETRES.w1280 })

  test('filtre actif : le plan reste à 300 px au plus', async ({ plan }) => {
    await plan.ouvrir()
    await plan.poserStockage('constellation.quiz.v1', QUIZ_B)
    await plan.choisirCategorie('Back-end')
    expect(await plan.hautDansLaPage(plan.dessin)).toBeLessThanOrEqual(300)
  })

  test('« Effacer les filtres » n’empiète pas sur la liste « Catégorie »', async ({ plan }) => {
    await plan.ouvrir()
    await plan.choisirCategorie('Back-end')
    const select = await plan.rectEcran(plan.listeCategorie)
    const bouton = await plan.rectEcran(plan.boutonEffacerFiltres)
    expect(bouton.bas).toBeLessThanOrEqual(select.haut)
    // Contour de focus compris : 2 px de trait et 2 px de décalage.
    await plan.boutonEffacerFiltres.focus()
    expect((await plan.rectEcran(plan.boutonEffacerFiltres)).bas + 4).toBeLessThanOrEqual(select.haut)
  })
})

test.describe('liste : après le quiz (1366×633)', () => {
  test.use({ viewport: FENETRES.w1366 })

  test('liste après le quiz : recherche visible sans défiler', async ({ liste }) => {
    await liste.ouvrir()
    await liste.poserStockage('constellation.quiz.v1', QUIZ_B)
    expect((await liste.rectEcran(liste.recherche)).bas).toBeLessThanOrEqual(await liste.hauteurFenetre())
    const { contenu, fenetre } = await liste.largeursDocument()
    expect(contenu).toBeLessThanOrEqual(fenetre)
  })
})

test.describe('plan : plein écran', () => {
  test.use({ viewport: FENETRES.w1366 })

  test('entrer puis sortir', async ({ plan }) => {
    await plan.ouvrir()
    expect(await plan.pleinEcranDisponible(), 'API Fullscreen indisponible dans ce Chromium').toBe(true)
    const avant = await plan.rectEcran(plan.dessin)
    await plan.boutonPleinEcran.click()
    await expect.poll(() => plan.pleinEcranActif()).toBe(true)
    await expect(plan.boutonPleinEcran).toHaveText('Quitter le plein écran')
    const d = await plan.rectEcran(plan.dessin)
    const h = await plan.hauteurFenetre()
    expect(d.haut).toBeGreaterThanOrEqual(-1)
    expect(d.bas).toBeLessThanOrEqual(h + 1)
    expect(d.gauche).toBeGreaterThanOrEqual(-1)
    await plan.boutonPleinEcran.click()
    await expect.poll(() => plan.pleinEcranActif()).toBe(false)
    await expect(plan.boutonPleinEcran).toHaveText('Plein écran')
    await expect
      .poll(async () => {
        const apres = await plan.rectEcran(plan.dessin)
        return Math.max(
          ...(['haut', 'bas', 'gauche', 'droite'] as const).map((k) => Math.abs(apres[k] - avant[k])),
        )
      })
      .toBeLessThanOrEqual(1)
  })
})
