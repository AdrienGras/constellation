import type { Locator, Page } from '@playwright/test'

/** Base des écrans : navigation par ancre, barre de navigation, bandeau, lien d'évitement. */
export class AppPage {
  constructor(readonly page: Page) {}

  /** `route` s'écrit comme dans l'app : `/`, `/liste`, `/fiche/dsi`. */
  async allerA(route: string) {
    await this.page.goto(`./#${route}`)
    await this.attendreChargement()
  }

  /** Attend que l'app soit montée (la barre de navigation est rendue par la mise en page). */
  async attendreChargement() {
    await this.barre.waitFor()
  }

  /** Vide le localStorage de l'origine (la page doit déjà être chargée). */
  async viderStockage() {
    await this.page.evaluate(() => window.localStorage.clear())
  }

  /** Écrit une valeur JSON dans le localStorage (la page doit être chargée), recharge et attend l'app. */
  async poserStockage(cle: string, valeur: unknown) {
    await this.page.evaluate(([k, v]) => window.localStorage.setItem(k, v), [cle, JSON.stringify(valeur)] as const)
    await this.page.reload()
    await this.attendreChargement()
  }

  /** Rectangle de `cible` en coordonnées de fenêtre. */
  async rectEcran(cible: Locator): Promise<{ haut: number; bas: number; gauche: number; droite: number }> {
    return cible.evaluate((el) => {
      const r = el.getBoundingClientRect()
      return { haut: r.top, bas: r.bottom, gauche: r.left, droite: r.right }
    })
  }

  /** Haut de `cible` en coordonnées de page (indépendant du défilement). */
  async hautDansLaPage(cible: Locator): Promise<number> {
    return cible.evaluate((el) => el.getBoundingClientRect().top + window.scrollY)
  }

  async defilerA(y: number) {
    await this.page.evaluate((valeur) => window.scrollTo(0, valeur), y)
  }

  async hauteurFenetre(): Promise<number> {
    return this.page.evaluate(() => window.innerHeight)
  }

  /** Nombre de lignes de texte de `cible` : centres verticaux distincts des rectangles du contenu (tolérance 7 px). */
  async nombreDeLignes(cible: Locator): Promise<number> {
    return cible.evaluate((el) => {
      const plage = document.createRange()
      plage.selectNodeContents(el)
      const centres: number[] = []
      for (const r of plage.getClientRects()) {
        if (r.width === 0 || r.height === 0) continue
        const centre = r.top + r.height / 2
        if (!centres.some((c) => Math.abs(c - centre) <= 7)) centres.push(centre)
      }
      return centres.length
    })
  }

  get barre(): Locator {
    return this.page.getByRole('navigation', { name: 'Navigation principale' })
  }

  lienBarre(nom: 'Nuage' | 'Quiz' | 'Roadmap' | 'Sources'): Locator {
    return this.barre.getByRole('link', { name: nom, exact: true })
  }

  /** Bouton qui déplie la navigation sur écran étroit (absent au-dessus du point de rupture `md`). */
  get boutonMenu(): Locator {
    return this.barre.getByRole('button', { name: /^(Menu|Fermer)$/ })
  }

  async ouvrirMenu() {
    await this.boutonMenu.click()
  }

  /** Largeurs du document : au-delà de la fenêtre, la page défile horizontalement (WCAG 1.4.10). */
  async largeursDocument(): Promise<{ contenu: number; fenetre: number }> {
    return this.page.evaluate(() => ({
      contenu: document.documentElement.scrollWidth,
      fenetre: document.documentElement.clientWidth,
    }))
  }

  get lienEvitement(): Locator {
    return this.page.getByRole('link', { name: 'Aller au contenu' })
  }

  get contenu(): Locator {
    return this.page.locator('main')
  }

  get titre(): Locator {
    return this.page.getByRole('heading', { level: 1 })
  }

  /** Bandeau « ton navigateur ne garde rien », affiché quand le stockage est refusé. */
  get bandeauStockage(): Locator {
    return this.page.getByRole('status').filter({ hasText: 'Ton navigateur ne garde rien' })
  }
}

/** Échappe un texte pour l'inclure tel quel dans une expression régulière. */
export function echapper(texte: string): string {
  return texte.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
