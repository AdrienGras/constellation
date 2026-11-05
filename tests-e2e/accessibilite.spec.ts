import { analyserAccessibilite } from './accessibilite'
import { expect, test } from './fixtures'

test.describe('accessibilité (axe, WCAG 2.1 A et AA)', () => {
  test('plan', async ({ plan, page }, info) => {
    test.skip(info.project.name === 'mobile', 'Le plan est remplacé par la liste sur écran étroit.')
    await plan.ouvrir()
    expect(await analyserAccessibilite(page)).toEqual([])
  })

  test('liste', async ({ liste, page }) => {
    await liste.ouvrir()
    expect(await analyserAccessibilite(page)).toEqual([])
  })

  test('fiche dev-backend', async ({ fiche, page }) => {
    await fiche.ouvrir('dev-backend')
    expect(await analyserAccessibilite(page)).toEqual([])
  })

  test('fiche dsi', async ({ fiche, page }) => {
    await fiche.ouvrir('dsi')
    expect(await analyserAccessibilite(page)).toEqual([])
  })

  test('quiz : question', async ({ quiz, page }) => {
    await quiz.ouvrir()
    expect(await analyserAccessibilite(page)).toEqual([])
  })

  test('quiz : résultat', async ({ quiz, page }) => {
    await quiz.ouvrir()
    await quiz.repondreTout('b'.repeat(16))
    await expect(quiz.titreResultat).toBeVisible()
    expect(await analyserAccessibilite(page)).toEqual([])
  })

  test('roadmap vide', async ({ roadmap, page }) => {
    await roadmap.ouvrir()
    expect(await analyserAccessibilite(page)).toEqual([])
  })

  test('roadmap remplie, dialogue ouvert', async ({ roadmap, page }) => {
    await roadmap.ouvrir()
    await roadmap.choisirCible('Développeur·se back-end')
    await roadmap.ajouterElement(2027, {
      titre: 'API REST',
      url: 'https://example.org/api',
      note: 'Avec tests',
    })
    await roadmap.ajouterElement(2027, { titre: 'Notions de SQL', type: 'notion' })
    await roadmap.ouvrirAjout(2028)
    await expect(roadmap.dialogue).toBeVisible()
    expect(await analyserAccessibilite(page)).toEqual([])
  })

  test('sources', async ({ sources, page }) => {
    await sources.ouvrir()
    expect(await analyserAccessibilite(page)).toEqual([])
  })

  test('clavier : Tab atteint « Aller au contenu » en premier, avec un focus visible', async ({
    plan,
    page,
  }) => {
    await plan.ouvrir()
    // Sur écran étroit, / redirige vers la liste et le focus passe au titre : on repart d'un chargement neuf.
    await page.reload()
    await plan.attendreChargement()
    await page.keyboard.press('Tab')
    await expect(plan.lienEvitement).toBeFocused()
    await expect(plan.lienEvitement).not.toHaveCSS('outline-style', 'none')
  })
})

const LARGEURS_ETROITES = [390, 320]

test.describe('reflow : pas de défilement horizontal (WCAG 1.4.10)', () => {
  // Playwright exige un motif de déstructuration pour le premier argument.
  // eslint-disable-next-line no-empty-pattern
  test.beforeEach(({}, info) => {
    test.skip(info.project.name !== 'mobile', 'Vérifié sur les largeurs de téléphone.')
  })

  for (const largeur of LARGEURS_ETROITES) {
    test.describe(`à ${largeur} px`, () => {
      test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width: largeur, height: 844 })
      })

      const verifier = async (app: {
        largeursDocument(): Promise<{ contenu: number; fenetre: number }>
      }) => {
        const { contenu, fenetre } = await app.largeursDocument()
        expect(contenu).toBeLessThanOrEqual(fenetre)
      }

      test('liste', async ({ liste }) => {
        await liste.ouvrir()
        await verifier(liste)
      })

      test('fiche dev-backend', async ({ fiche }) => {
        await fiche.ouvrir('dev-backend')
        await verifier(fiche)
      })

      test('fiche dsi', async ({ fiche }) => {
        await fiche.ouvrir('dsi')
        await verifier(fiche)
      })

      test('fiche introuvable', async ({ fiche }) => {
        await fiche.ouvrir('metier-inexistant')
        await verifier(fiche)
      })

      test('quiz : question et résultat', async ({ quiz }) => {
        await quiz.ouvrir()
        await verifier(quiz)
        await quiz.repondreTout('b'.repeat(16))
        await expect(quiz.titreResultat).toBeVisible()
        await verifier(quiz)
      })

      test('roadmap vide et remplie', async ({ roadmap }) => {
        await roadmap.ouvrir()
        await verifier(roadmap)
        await roadmap.choisirCible('Développeur·se back-end')
        await roadmap.ajouterElement(2027, {
          titre: 'API REST',
          url: 'https://example.org/api',
          note: 'Avec tests',
        })
        await verifier(roadmap)
      })

      test('sources', async ({ sources }) => {
        await sources.ouvrir()
        await verifier(sources)
      })
    })
  }

  test('menu mobile : il s’ouvre, puis un lien navigue', async ({ liste, quiz }) => {
    await liste.ouvrir()
    await expect(liste.boutonMenu).toHaveAttribute('aria-expanded', 'false')
    await expect(liste.lienBarre('Quiz')).toBeHidden()

    await liste.ouvrirMenu()
    await expect(liste.boutonMenu).toHaveAttribute('aria-expanded', 'true')
    await liste.lienBarre('Quiz').click()

    await expect(quiz.titre).toBeVisible()
    await expect(liste.boutonMenu).toHaveAttribute('aria-expanded', 'false')
  })
})
