import { expect, test } from './fixtures'

const reservePlan = 'Le plan n’est pas la vue des écrans étroits (redirection vers la liste).'

test.describe('parcours étudiant', () => {
  test('quiz tout en B, puis les 3 lignes allumées sur le plan', async ({ quiz, plan }, info) => {
    test.skip(info.project.name === 'mobile', reservePlan)
    await quiz.ouvrir()
    await quiz.repondreTout('b'.repeat(16))
    await expect(quiz.titreResultat).toBeVisible()

    await quiz.lienVoirPlan.click()
    await expect(plan.traces('top')).toHaveCount(3)
    await expect(plan.traces('exploration')).toHaveCount(5)
  })

  test('quiz tout en A : départage, puis résultat', async ({ quiz }) => {
    await quiz.ouvrir()
    await quiz.repondreTout('a'.repeat(16))
    await expect(quiz.titreDepartage).toBeVisible()

    await quiz.departager(['Qualité & architecture', 'Produit & design'])
    await expect(quiz.titreResultat).toBeVisible()
  })

  test('plan, station, fiche, voisin, retour arrière du navigateur', async ({ plan, fiche, page }, info) => {
    test.skip(info.project.name === 'mobile', reservePlan)
    await plan.ouvrir()
    await plan.ouvrirStation('Développeur·se back-end')
    await expect(fiche.titre).toHaveText('Développeur·se back-end')

    await fiche.voisin('Développeur·se full-stack').click()
    await expect(fiche.titre).toHaveText('Développeur·se full-stack')

    await page.goBack()
    await expect(fiche.titre).toHaveText('Développeur·se back-end')
  })

  test('lien profond : recharger une fiche garde la fiche', async ({ fiche, page }) => {
    await fiche.ouvrir('dsi')
    await page.reload()
    await expect(fiche.titre).toContainText('DSI')
  })

  test('fiche inconnue : métier introuvable', async ({ fiche }) => {
    await fiche.ouvrir('inconnu')
    await expect(fiche.titre).toHaveText('Métier introuvable')
  })

  test('écran étroit : la première visite de / ouvre la liste', async ({ plan, liste, page }, info) => {
    test.skip(info.project.name !== 'mobile', 'Ne concerne que le projet mobile.')
    await plan.ouvrir()
    await expect(page).toHaveURL(/#\/liste$/)
    await expect(liste.titre).toHaveText('Les 68 métiers, ligne par ligne')
  })

  test('écran large : / reste sur le plan', async ({ plan, page }, info) => {
    test.skip(info.project.name !== 'desktop', 'Ne concerne que le projet desktop.')
    await plan.ouvrir()
    await expect(page).toHaveURL(/#\/$/)
    await expect(plan.titre).toHaveText('Le plan des métiers du numérique')
  })

  test('aucune requête hors de l’origine sur un parcours complet', async ({ quiz, liste, fiche, roadmap, sources, page }) => {
    const urls: string[] = []
    page.on('request', (r) => urls.push(r.url()))

    await liste.ouvrir()
    await fiche.ouvrir('dev-backend')
    await quiz.ouvrir()
    await quiz.repondreTout('b'.repeat(16))
    await expect(quiz.titreResultat).toBeVisible()
    await roadmap.ouvrir()
    await roadmap.ajouterElement(2027, { titre: 'Un projet', url: 'https://example.org/ressource' })
    await sources.ouvrir()
    await expect(sources.titre).toBeVisible()
    await page.waitForLoadState('networkidle')

    expect(urls.length).toBeGreaterThan(0)
    expect(urls.filter((u) => !u.startsWith('http://localhost:4173/'))).toEqual([])
  })
})

test.describe('impression', () => {
  test('une fiche imprimée garde son titre et masque la barre de navigation', async ({ fiche, page }) => {
    await fiche.ouvrir('dev-backend')
    await page.emulateMedia({ media: 'print' })
    await expect(fiche.titre).toBeVisible()
    await expect(fiche.titre).toHaveText('Développeur·se back-end')
    await expect(fiche.barre).toBeHidden()
  })
})
