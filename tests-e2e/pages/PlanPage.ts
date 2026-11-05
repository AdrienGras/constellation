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

  get lienVueListe(): Locator {
    return this.page.getByRole('link', { name: 'Liste', exact: true })
  }

  get dessin(): Locator {
    return this.page.locator('[data-plan-dessin]')
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
    return this.page.evaluate((el) => {
      const c = el!.getBoundingClientRect()
      return Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href^="/fiche/"]'))
        .filter((a) => {
          const r = a.getBoundingClientRect()
          return r.left < c.right && r.right > c.left && r.top < c.bottom && r.bottom > c.top
        })
        .map((a) => a.getAttribute('aria-label') ?? '')
    }, handle)
  }
}
