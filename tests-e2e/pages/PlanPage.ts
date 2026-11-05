import type { Locator } from '@playwright/test'
import { AppPage, echapper } from './AppPage'

export class PlanPage extends AppPage {
  async ouvrir() {
    await this.allerA('/')
  }

  /** Station du plan, trouvée par le début de son nom accessible (le titre du métier). */
  station(titre: string): Locator {
    return this.page.getByRole('link', { name: new RegExp(`^${echapper(titre)}, `) })
  }

  async ouvrirStation(titre: string) {
    await this.station(titre).click()
  }

  /** Tracés de lignes ; avec `etat`, seulement ceux de cet état (`top` ou `exploration`). */
  traces(etat?: 'top' | 'exploration'): Locator {
    return this.page.locator(etat ? `[data-trace][data-etat="${etat}"]` : '[data-trace]')
  }

  get lienCommencerQuiz(): Locator {
    return this.page.getByRole('link', { name: 'Commencer le quiz' })
  }

  get listeCategorie(): Locator {
    return this.page.getByRole('combobox', { name: 'Catégorie' })
  }

  get boutonEffacerFiltres(): Locator {
    return this.page.getByRole('button', { name: 'Effacer les filtres' })
  }

  get lienVueListe(): Locator {
    return this.page.getByRole('link', { name: 'Liste', exact: true })
  }

  /** Choisit une catégorie dans la liste « Catégorie » (par son libellé). */
  async choisirCategorie(libelle: string) {
    await this.page.getByRole('combobox', { name: 'Catégorie' }).selectOption({ label: libelle })
  }

  get dessin(): Locator {
    return this.page.locator('[data-plan-dessin]')
  }

  /** Centre du plan : le texte « FORMATION » du disque central. */
  get centre(): Locator {
    return this.page.locator('[data-plan-dessin] [data-centre]')
  }

  get enveloppe(): Locator {
    return this.page.locator('[data-plan]')
  }

  get legende(): Locator {
    return this.page.getByRole('group', { name: 'Légende des lignes' })
  }

  get boutonPleinEcran(): Locator {
    return this.page.getByRole('button', { name: /^(Plein écran|Quitter le plein écran)$/ })
  }

  async pleinEcranActif(): Promise<boolean> {
    return this.page.evaluate(() => document.fullscreenElement?.hasAttribute('data-plan') ?? false)
  }

  async pleinEcranDisponible(): Promise<boolean> {
    return this.page.evaluate(() => document.fullscreenEnabled === true)
  }

  /** Noms accessibles des stations dont le rectangle croise celui de `cible`. */
  async stationsRecouvertesPar(cible: Locator): Promise<string[]> {
    const handle = await cible.elementHandle()
    // Le routeur est à ancre : les liens valent `#/fiche/…`, d'où `href*=`.
    const { total, recouvertes } = await this.page.evaluate((el) => {
      const c = el!.getBoundingClientRect()
      const liens = Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-plan-dessin] a[href*="/fiche/"]'))
      return {
        total: liens.length,
        recouvertes: liens
          .filter((a) => {
            const r = a.getBoundingClientRect()
            return r.left < c.right && r.right > c.left && r.top < c.bottom && r.bottom > c.top
          })
          .map((a) => a.getAttribute('aria-label') ?? ''),
      }
    }, handle)
    // Garde-fou : un sélecteur cassé ferait passer le test à vide.
    if (total !== 68) throw new Error(`${total} stations trouvées au lieu de 68 : sélecteur cassé ?`)
    return recouvertes
  }

  get bulle(): Locator {
    return this.page.locator('#plan-bulle')
  }

  async survolerStation(titre: string) {
    await this.station(titre).hover()
  }

  /** Vrai si l'élément au centre de chaque coin de la bulle appartient à la bulle. */
  async bulleEntierementVisible(): Promise<boolean> {
    return this.page.locator('#plan-bulle').evaluate((bulle) => {
      const r = bulle.getBoundingClientRect()
      const coins = [
        [r.left + 2, r.top + 2],
        [r.right - 2, r.top + 2],
        [r.left + 2, r.bottom - 2],
        [r.right - 2, r.bottom - 2],
      ]
      return coins.every(([x, y]) => {
        const e = document.elementFromPoint(x, y)
        return e !== null && bulle.contains(e)
      })
    })
  }
}
