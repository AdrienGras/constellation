import { readFile } from 'node:fs/promises'
import { expect, test } from './fixtures'
import { ROADMAP_AUDIT } from './donnees'

const CIBLE = 'Développeur·se back-end'
const DSI = 'DSI (directeur·rice des systèmes d\'information)'
const A = { titre: 'API REST', url: 'https://example.org/api', note: 'Avec tests' }
const B = { titre: 'Notions de SQL', type: 'notion' as const }
const C = { titre: 'Projet fil rouge' }

test.describe('roadmap', () => {
  test('cible, éléments, réordonnancement (clavier et boutons), persistance au rechargement', async ({
    roadmap,
    page,
  }) => {
    await roadmap.ouvrir()
    await roadmap.choisirCible(CIBLE)
    await expect(roadmap.titre).toHaveText(`Cap sur ${CIBLE}`)

    await roadmap.ajouterElement(2027, A)
    await roadmap.ajouterElement(2027, B)
    await roadmap.ajouterElement(2027, C)
    await expect(roadmap.titresDeLAnnee(2027)).toHaveText([A.titre, B.titre, C.titre])

    await roadmap.descendreAuClavier(A.titre)
    await expect(roadmap.titresDeLAnnee(2027)).toHaveText([B.titre, A.titre, C.titre])

    await roadmap.descendre(A.titre)
    await expect(roadmap.titresDeLAnnee(2027)).toHaveText([B.titre, C.titre, A.titre])

    await roadmap.monter(C.titre)
    await expect(roadmap.titresDeLAnnee(2027)).toHaveText([C.titre, B.titre, A.titre])

    await page.reload()
    await expect(roadmap.titre).toHaveText(`Cap sur ${CIBLE}`)
    await expect(roadmap.titresDeLAnnee(2027)).toHaveText([C.titre, B.titre, A.titre])
  })

  test('réordonnancement à la souris : la poignée dépose l’élément à sa nouvelle place', async ({
    roadmap,
    page,
  }) => {
    await roadmap.ouvrir()
    await roadmap.choisirCible(CIBLE)
    await roadmap.ajouterElement(2027, A)
    await roadmap.ajouterElement(2027, B)
    await roadmap.ajouterElement(2027, C)

    await roadmap.deplacerALaSouris(A.titre, C.titre)
    await expect(roadmap.titresDeLAnnee(2027)).toHaveText([B.titre, C.titre, A.titre])

    await page.reload()
    await expect(roadmap.titresDeLAnnee(2027)).toHaveText([B.titre, C.titre, A.titre])
  })

  test('deux onglets : la modification de l’un ne perd pas celle de l’autre', async ({
    roadmap,
    page,
    ficheAutreOnglet: fiche,
  }) => {
    await roadmap.ouvrir()
    await roadmap.choisirCible(CIBLE)

    // L'onglet B charge sa fiche alors que la roadmap n'a pas encore d'élément.
    await fiche.ouvrir('dsi')
    await expect(fiche.boutonViser).toBeVisible()

    await roadmap.ajouterElement(2027, A)
    await expect(roadmap.titresDeLAnnee(2027)).toHaveText([A.titre])

    await fiche.boutonViser.click()
    await fiche.confirmerViser(DSI)

    await page.reload()
    await expect(roadmap.titresDeLAnnee(2027)).toHaveText([A.titre])
    await expect(roadmap.titre).toHaveText(`Cap sur ${DSI}`)
  })

  test('export, stockage vidé, import : mêmes éléments', async ({ roadmap, page }) => {
    await roadmap.ouvrir()
    await roadmap.choisirCible(CIBLE)
    await roadmap.ajouterElement(2027, A)
    await roadmap.ajouterElement(2029, B)

    const chemin = await roadmap.exporter()
    expect((await readFile(chemin, 'utf8')).length).toBeGreaterThan(0)

    await roadmap.viderStockage()
    await page.reload()
    await expect(roadmap.titre).toHaveText('Quel métier vises-tu ?')
    await expect(roadmap.titresDeLAnnee(2027)).toHaveCount(0)

    await roadmap.importer(chemin)
    await expect(roadmap.titre).toHaveText(`Cap sur ${CIBLE}`)
    await expect(roadmap.titresDeLAnnee(2027)).toHaveText([A.titre])
    await expect(roadmap.titresDeLAnnee(2029)).toHaveText([B.titre])
  })

  test('impression : navigation masquée, bloc d’impression et URL complète visibles, PDF produit', async ({
    roadmap,
    page,
  }) => {
    await roadmap.ouvrir()
    await roadmap.choisirCible(CIBLE)
    await roadmap.ajouterElement(2027, A)

    await expect(roadmap.barre).toBeVisible()
    await expect(roadmap.blocImpression).toBeHidden()

    await page.emulateMedia({ media: 'print' })
    await expect(roadmap.barre).toBeHidden()
    await expect(roadmap.blocImpression).toBeVisible()
    await expect(roadmap.urlImprimee(A.url)).toBeVisible()

    const pdf = await page.pdf({ format: 'A4' })
    expect(pdf.byteLength).toBeGreaterThan(1000)
  })

  test('stockage refusé : bandeau affiché, l’app reste utilisable', async ({ roadmap, page }) => {
    await page.addInitScript(() => {
      Storage.prototype.setItem = () => {
        throw new DOMException('Quota dépassé', 'QuotaExceededError')
      }
    })
    await roadmap.ouvrir()
    await expect(roadmap.bandeauStockage).toBeVisible()

    await roadmap.choisirCible(CIBLE)
    await roadmap.ajouterElement(2027, A)
    await expect(roadmap.titresDeLAnnee(2027)).toHaveText([A.titre])
  })
})

test.describe('roadmap : carte d’élément sur mobile', () => {
  // eslint-disable-next-line no-empty-pattern
  test.beforeEach(({}, info) => {
    test.skip(info.project.name !== 'mobile', 'Disposition propre à l’écran étroit.')
  })

  test('les actions passent sous le titre, qui garde sa largeur', async ({ roadmap }) => {
    await roadmap.ouvrir()
    await roadmap.poserStockage('constellation.roadmap.v1', ROADMAP_AUDIT)
    const titre = 'API REST de gestion de bibliothèque en Node.js'
    const t = await roadmap.rectEcran(roadmap.titreElement(titre))
    // Avant : 166 px (actions empilées à droite) ; la largeur utile de la carte en 390 px est de 214 px.
    expect(t.droite - t.gauche).toBeGreaterThanOrEqual(200)
    for (const a of await roadmap.rectsActions(titre)) expect(a.haut).toBeGreaterThanOrEqual(t.bas)
  })
})
