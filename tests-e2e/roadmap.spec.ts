import { readFile } from 'node:fs/promises'
import { expect, test } from './fixtures'

const CIBLE = 'Développeur·se back-end'
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

  test('export, stockage vidé, import : mêmes éléments', async ({ roadmap, page }) => {
    await roadmap.ouvrir()
    await roadmap.choisirCible(CIBLE)
    await roadmap.ajouterElement(2027, A)
    await roadmap.ajouterElement(2029, B)

    const chemin = await roadmap.exporter()
    expect((await readFile(chemin, 'utf8')).length).toBeGreaterThan(0)

    await page.evaluate(() => window.localStorage.clear())
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
