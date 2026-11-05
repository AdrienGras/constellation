import { mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { Locator } from '@playwright/test'
import { AppPage, echapper } from './AppPage'

export type TypeElement = 'projet' | 'notion'

export interface ElementRoadmap {
  type?: TypeElement
  titre: string
  url?: string
  note?: string
}

const LIBELLE_TYPE: Record<TypeElement, string> = {
  projet: 'Projet à réaliser',
  notion: 'Notion à apprendre',
}

export class RoadmapPage extends AppPage {
  async ouvrir() {
    await this.allerA('/roadmap')
  }

  // --- Métier visé ---

  get champRecherche(): Locator {
    return this.page.getByRole('textbox', { name: 'Chercher un métier' })
  }

  get boutonChanger(): Locator {
    return this.page.getByRole('button', { name: 'Changer', exact: true })
  }

  async choisirCible(titre: string) {
    await this.page
      .getByRole('list', { name: 'Métiers' })
      // Le nom accessible commence par celui de la pastille de ligne.
      .getByRole('button', { name: new RegExp(`${echapper(titre)}$`) })
      .click()
  }

  // --- Éléments ---

  /** Section d'une année (2027 à 2031). */
  annee(annee: number): Locator {
    return this.page.getByRole('region', { name: String(annee), exact: true })
  }

  /** Titres des éléments d'une année, dans l'ordre affiché. */
  titresDeLAnnee(annee: number): Locator {
    return this.annee(annee).getByRole('article').locator('[data-titre-element]')
  }

  get dialogue(): Locator {
    return this.page.getByRole('dialog')
  }

  async ajouterElement(annee: number, element: ElementRoadmap) {
    await this.ouvrirAjout(annee)
    await this.remplirDialogue(element)
    await this.dialogue.getByRole('button', { name: 'Enregistrer' }).click()
    await this.dialogue.waitFor({ state: 'detached' })
    await this.attendreRetourDuFocus(`Ajouter à ${annee}`)
  }

  /** À la fermeture, l'app rend le focus au bouton d'origine : on attend ce bouton précis avant d'enchaîner. */
  async attendreRetourDuFocus(nomBouton: string) {
    await this.page.waitForFunction(
      (nom) => document.activeElement?.tagName === 'BUTTON' && document.activeElement.textContent?.trim() === nom,
      nomBouton,
    )
  }

  async ouvrirAjout(annee: number) {
    await this.page.getByRole('button', { name: `Ajouter à ${annee}` }).click()
    await this.dialogue.waitFor()
  }

  async remplirDialogue({ type = 'projet', titre, url, note }: ElementRoadmap) {
    await this.dialogue.getByRole('radio', { name: LIBELLE_TYPE[type] }).check()
    await this.dialogue.getByLabel('Titre').fill(titre)
    if (url !== undefined) await this.dialogue.getByLabel('Ressource (URL)').fill(url)
    if (note !== undefined) await this.dialogue.getByLabel('Note').fill(note)
  }

  // --- Réordonnancement ---

  poignee(titre: string): Locator {
    return this.page.getByRole('button', { name: `Déplacer « ${titre} »` })
  }

  bouton(verbe: 'Monter' | 'Descendre' | 'Modifier' | 'Supprimer', titre: string): Locator {
    return this.page.getByRole('button', { name: `${verbe} « ${titre} »` })
  }

  async monter(titre: string) {
    await this.bouton('Monter', titre).click()
  }

  async descendre(titre: string) {
    await this.bouton('Descendre', titre).click()
  }

  /**
   * Réordonnancement au clavier (dnd-kit) : Espace, flèche bas, Espace. dnd-kit ignore une touche
   * tant que la précédente n'est pas prise en compte : on attend sa trace avant la suivante.
   */
  async descendreAuClavier(titre: string) {
    const poignee = this.poignee(titre)
    const annonce = this.page.locator('[aria-live="assertive"]')
    await poignee.focus()
    await this.page.keyboard.press('Space')
    await this.page.waitForFunction(
      (nom) => document.querySelector(`[aria-label="${nom}"]`)?.getAttribute('aria-pressed') === 'true',
      `Déplacer « ${titre} »`,
    )
    const avant = (await annonce.allTextContents()).join()
    await this.page.keyboard.press('ArrowDown')
    await this.page.waitForFunction(
      (texte) =>
        [...document.querySelectorAll('[aria-live="assertive"]')].map((n) => n.textContent).join() !== texte,
      avant,
    )
    await this.page.keyboard.press('Space')
  }

  /**
   * Réordonnancement à la souris (dnd-kit, capteur pointeur) : on saisit la poignée de `titre`
   * et on la dépose sur l'élément `cible`, en plusieurs pas pour franchir le seuil d'activation.
   */
  async deplacerALaSouris(titre: string, cible: string) {
    const depart = await this.poignee(titre).boundingBox()
    const arrivee = await this.poignee(cible).boundingBox()
    if (!depart || !arrivee) throw new Error('Poignée introuvable à l’écran.')
    const { mouse } = this.page
    await mouse.move(depart.x + depart.width / 2, depart.y + depart.height / 2)
    await mouse.down()
    await mouse.move(depart.x + depart.width / 2, depart.y + depart.height / 2 + 10, { steps: 5 })
    await mouse.move(arrivee.x + arrivee.width / 2, arrivee.y + arrivee.height / 2 + 4, { steps: 15 })
    await mouse.up()
  }

  // --- Export, import, impression ---

  /** Télécharge l'export JSON et renvoie le chemin du fichier enregistré. */
  async exporter(): Promise<string> {
    const [telechargement] = await Promise.all([
      this.page.waitForEvent('download'),
      this.page.getByRole('button', { name: 'Exporter en JSON' }).click(),
    ])
    const dossier = await mkdtemp(join(tmpdir(), 'constellation-e2e-'))
    const chemin = join(dossier, telechargement.suggestedFilename())
    await telechargement.saveAs(chemin)
    return chemin
  }

  /** Choisit le fichier à importer. Si la roadmap n'est pas vide, `confirmerRemplacement` suit. */
  async importer(chemin: string) {
    await this.page.locator('input[type="file"]').setInputFiles(chemin)
  }

  async confirmerRemplacement() {
    await this.page.getByRole('button', { name: 'Remplacer', exact: true }).click()
  }

  get messageEnregistre(): Locator {
    return this.page.getByText('Enregistré dans ce navigateur')
  }

  get blocImpression(): Locator {
    return this.page.locator('[data-impression]')
  }

  urlImprimee(url: string): Locator {
    return this.page.locator('[data-url-imprimee]').filter({ hasText: url })
  }
}
