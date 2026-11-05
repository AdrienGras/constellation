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

  /** Rectangles des 68 liens de station (garde-fou sur le nombre). */
  private async rectsDesCibles(): Promise<{ nom: string; x: number; y: number; diametre: number }[]> {
    // Le routeur est à ancre : les liens valent `#/fiche/…`, d'où `href*=`.
    const cibles = await this.page.locator('[data-plan-dessin] a[href*="/fiche/"]').evaluateAll((liens) =>
      liens.map((a) => {
        const r = a.getBoundingClientRect()
        return { nom: a.getAttribute('aria-label') ?? '', x: r.left + r.width / 2, y: r.top + r.height / 2, diametre: r.width }
      }),
    )
    if (cibles.length !== 68) throw new Error(`${cibles.length} stations trouvées au lieu de 68 : sélecteur cassé ?`)
    return cibles
  }

  /** Paires de stations dont les cibles rondes se chevauchent (distance des centres < demi-somme des diamètres − 0,5). */
  async ciblesQuiSeChevauchent(): Promise<string[]> {
    const cibles = await this.rectsDesCibles()
    const paires: string[] = []
    cibles.forEach((a, i) =>
      cibles.slice(i + 1).forEach((b) => {
        if (Math.hypot(a.x - b.x, a.y - b.y) < (a.diametre + b.diametre) / 2 - 0.5) paires.push(`${a.nom} / ${b.nom}`)
      }),
    )
    return paires
  }

  /**
   * Points de la zone cliquable réelle qui ouvrent une autre station que la plus proche (le survol « saute »).
   * Échantillons par station : les 4 coins de son dessin (svg, inset 1 px) et 8 points à 16 px de son centre.
   */
  async pointsQuiOuvrentUneStationPlusLointaine(): Promise<string[]> {
    const { total, fautes } = await this.page.evaluate(() => {
      const liens = Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-plan-dessin] a[href*="/fiche/"]'))
      const centres = liens.map((a) => {
        const r = a.getBoundingClientRect()
        return { a, x: r.left + r.width / 2, y: r.top + r.height / 2 }
      })
      const fautes: string[] = []
      for (const c of centres) {
        const d = c.a.querySelector('svg')!.getBoundingClientRect()
        const points = [
          [d.left + 1, d.top + 1],
          [d.right - 1, d.top + 1],
          [d.left + 1, d.bottom - 1],
          [d.right - 1, d.bottom - 1],
          ...Array.from({ length: 8 }, (_, i) => [c.x + 16 * Math.cos((i * Math.PI) / 4), c.y + 16 * Math.sin((i * Math.PI) / 4)]),
        ]
        for (const [x, y] of points) {
          const touche = document.elementFromPoint(x, y)?.closest('a[href*="/fiche/"]')
          if (!touche) continue
          const plusProche = centres.reduce((m, o) => (Math.hypot(o.x - x, o.y - y) < Math.hypot(m.x - x, m.y - y) ? o : m))
          const ecart = Math.hypot(centres.find((o) => o.a === touche)!.x - x, centres.find((o) => o.a === touche)!.y - y) -
            Math.hypot(plusProche.x - x, plusProche.y - y)
          if (ecart > 0.5) fautes.push(`${touche.getAttribute('aria-label')?.split(',')[0]} au lieu de ${plusProche.a.getAttribute('aria-label')?.split(',')[0]}`)
        }
      }
      return { total: liens.length, fautes }
    })
    if (total !== 68) throw new Error(`${total} stations trouvées au lieu de 68 : sélecteur cassé ?`)
    return fautes
  }

  /** Quitte le survol (pointeur hors du plan) et attend la fermeture de la bulle. */
  async quitterSurvol() {
    await this.page.mouse.move(0, 0)
    await this.bulle.waitFor({ state: 'detached' })
  }

  async diametreMinimalDesCibles(): Promise<number> {
    return Math.min(...(await this.rectsDesCibles()).map((c) => c.diametre))
  }

  /** Vrai si les 4 coins du texte « FORMATION » sont dans le disque central (unités SVG). */
  async centreDansLeDisque(): Promise<boolean> {
    return this.page.locator('[data-plan-dessin]').evaluate((dessin) => {
      const texte = dessin.querySelector<SVGTextElement>('[data-centre]')
      const disque = dessin.querySelector<SVGCircleElement>('[data-disque]')
      if (!texte || !disque) throw new Error('Centre ou disque introuvable : sélecteur cassé ?')
      const b = texte.getBBox()
      const cx = disque.cx.baseVal.value
      const cy = disque.cy.baseVal.value
      const r = disque.r.baseVal.value
      return [
        [b.x, b.y],
        [b.x + b.width, b.y],
        [b.x, b.y + b.height],
        [b.x + b.width, b.y + b.height],
      ].every(([x, y]) => Math.hypot(x - cx, y - cy) <= r)
    })
  }

  get bulle(): Locator {
    return this.page.locator('#plan-bulle')
  }

  /** Fait défiler la page pour que le centre de la station soit à `hautEcran` px du haut de la fenêtre. */
  async amenerStationA(titre: string, hautEcran: number) {
    const r = await this.rectEcran(this.station(titre))
    const scrollY = await this.page.evaluate(() => window.scrollY)
    await this.defilerA(scrollY + (r.haut + r.bas) / 2 - hautEcran)
  }

  /** Vrai si l'élément au centre de la station est la station elle-même (la bulle ne la cache pas). */
  async stationVisibleSousLaBulle(titre: string): Promise<boolean> {
    return this.station(titre).evaluate((lien) => {
      const r = lien.getBoundingClientRect()
      const e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
      return e !== null && lien.contains(e)
    })
  }

  /** Côté de la bulle par rapport à sa station : `dessus` ou `dessous`. */
  async coteDeLaBulle(): Promise<string | null> {
    return this.bulle.getAttribute('data-cote')
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
