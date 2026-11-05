import type { Locator } from '@playwright/test'
import { AppPage } from './AppPage'

export class FichePage extends AppPage {
  async ouvrir(id: string) {
    await this.allerA(`/fiche/${id}`)
  }

  /** Lien vers un métier voisin ou d'origine, dans le panneau « Repères ». */
  voisin(titre: string): Locator {
    return this.page
      .getByRole('complementary', { name: 'Repères' })
      .getByRole('link', { name: titre, exact: true })
  }

  get boutonViser(): Locator {
    return this.page.getByRole('button', { name: 'Viser ce métier dans ma roadmap' })
  }

  /** Quand une autre cible est déjà visée, une confirmation demande de valider le changement. */
  async confirmerViser(titre: string) {
    await this.page.getByRole('dialog').getByRole('button', { name: `Viser ${titre}` }).click()
  }

  /** Largeur de la piste de chaque barre (parent de `[data-slot="plage-barre"]`) de la grille Silkhom visible. */
  async largeursPistesSilkhom(): Promise<number[]> {
    const largeurs = await this.page
      .getByRole('region', { name: 'Salaire cible, Silkhom' })
      .locator('[data-slot="plage-barre"]:visible')
      .evaluateAll((barres) => barres.map((b) => b.parentElement!.getBoundingClientRect().width))
    if (largeurs.length === 0) throw new Error('Aucune barre Silkhom trouvée : sélecteur cassé ?')
    return largeurs
  }

  /** Pour chaque ligne visible de la grille Silkhom : écart (px) entre la fin du texte de la fourchette et le début de la piste. */
  async ecartsFourchettePiste(): Promise<number[]> {
    const ecarts = await this.page
      .getByRole('region', { name: 'Salaire cible, Silkhom' })
      .locator('[data-slot="plage-barre"]:visible')
      .evaluateAll((barres) =>
        barres.map((b) => {
          const piste = b.parentElement!
          const fourchette = piste.closest('tr')!.querySelectorAll('td')[1]
          const plage = document.createRange()
          plage.selectNodeContents(fourchette)
          return piste.getBoundingClientRect().left - plage.getBoundingClientRect().right
        }),
      )
    if (ecarts.length === 0) throw new Error('Aucune barre Silkhom trouvée : sélecteur cassé ?')
    return ecarts
  }

  /** Pour chaque ligne visible de la grille Silkhom : décalage vertical (px) entre le milieu de la piste et celui de la 1re ligne de la fourchette. */
  async decalagesFourchettePiste(): Promise<number[]> {
    const decalages = await this.page
      .getByRole('region', { name: 'Salaire cible, Silkhom' })
      .locator('[data-slot="plage-barre"]:visible')
      .evaluateAll((barres) =>
        barres.map((b) => {
          const piste = b.parentElement!.getBoundingClientRect()
          const plage = document.createRange()
          plage.selectNodeContents(b.closest('tr')!.querySelectorAll('td')[1])
          const ligne = plage.getClientRects()[0]
          return Math.abs(piste.top + piste.height / 2 - (ligne.top + ligne.height / 2))
        }),
      )
    if (decalages.length === 0) throw new Error('Aucune barre Silkhom trouvée : sélecteur cassé ?')
    return decalages
  }
}
