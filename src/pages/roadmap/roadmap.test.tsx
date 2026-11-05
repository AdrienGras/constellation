import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RouterProvider, createMemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CLES } from '../../logique/stockage'
import type { EtatRoadmap, Item } from '../../logique/roadmap'
import { routes } from '../../routes'

function monter() {
  window.scrollTo = vi.fn()
  const router = createMemoryRouter(routes, { initialEntries: ['/roadmap'] })
  return render(<RouterProvider router={router} />)
}

function item(titre: string, extra: Partial<Item> = {}): Item {
  return { id: `id-${titre}`, type: 'projet', titre, url: '', note: '', ...extra }
}

function stocker(cible: string | null, annees: Partial<Record<string, Item[]>> = {}) {
  const etat: EtatRoadmap = {
    version: 1,
    cible,
    annees: { '2027': [], '2028': [], '2029': [], '2030': [], '2031': [], ...annees },
    modifie_le: null,
  }
  localStorage.setItem(CLES.roadmap, JSON.stringify(etat))
}

function stockee(): EtatRoadmap {
  return JSON.parse(localStorage.getItem(CLES.roadmap) ?? 'null') as EtatRoadmap
}

function titres(annee: number): string[] {
  const section = screen.getByRole('heading', { level: 2, name: String(annee) }).closest('section')!
  return within(section)
    .getAllByRole('article')
    .map((a) => within(a).getAllByText(/^[A-Z]$/)[0].textContent ?? '')
}

beforeEach(() => {
  localStorage.clear()
  // @ts-expect-error retour à l’absence de matchMedia (jsdom)
  delete window.matchMedia
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('RoadmapPage : métier visé', () => {
  it('sans cible : invite, 5 années vides, 68 choix', () => {
    monter()
    expect(document.title).toBe('Ma roadmap · constellation')
    expect(screen.getByText('Ma roadmap · 2027 → 2031')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'Quel métier vises-tu ?' })).toBeInTheDocument()
    const annees = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)
    expect(annees).toEqual(['2027', '2028', '2029', '2030', '2031'])
    for (const an of [2027, 2028, 2029, 2030, 2031]) {
      expect(
        screen.getByText(`Rien pour ${an} pour l’instant. Ajoute un projet à réaliser ou une notion à apprendre.`),
      ).toBeInTheDocument()
      expect(screen.getByRole('button', { name: `Ajouter à ${an}` })).toBeInTheDocument()
    }
    expect(within(screen.getByRole('list', { name: 'Métiers' })).getAllByRole('button')).toHaveLength(68)
    expect(screen.getByText('Elles s’afficheront ici dès que tu auras choisi un métier.')).toBeInTheDocument()
  })

  it('recherche sans accent ni casse, puis choix : cap et compétences', async () => {
    const user = userEvent.setup()
    monter()
    await user.type(screen.getByRole('textbox', { name: 'Chercher un métier' }), 'BACKEND')
    const liste = screen.getByRole('list', { name: 'Métiers' })
    expect(within(liste).getAllByRole('button')).toHaveLength(1)
    await user.click(within(liste).getByRole('button', { name: /Développeur·se back-end/ }))
    expect(
      screen.getByRole('heading', { level: 1, name: 'Cap sur Développeur·se back-end' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Le métier visé peut changer.')).toBeInTheDocument()
    expect(screen.queryByRole('list', { name: 'Métiers' })).not.toBeInTheDocument()
    const competences = document.querySelector('[data-competences]') as HTMLElement
    expect(within(competences).getAllByRole('listitem')).toHaveLength(5)
    expect(within(competences).getByRole('link', { name: /Voir la fiche/ })).toHaveAttribute(
      'href',
      '/fiche/dev-backend',
    )
    expect(stockee().cible).toBe('dev-backend')
  })

  it('Changer rouvre le choix', async () => {
    const user = userEvent.setup()
    stocker('dev-backend')
    monter()
    await user.click(screen.getByRole('button', { name: 'Changer' }))
    expect(within(screen.getByRole('list', { name: 'Métiers' })).getAllByRole('button')).toHaveLength(68)
  })

  it('rechoisir le même métier rend le focus au titre', async () => {
    const user = userEvent.setup()
    stocker('dev-backend')
    monter()
    await user.click(screen.getByRole('button', { name: 'Changer' }))
    await user.click(
      within(screen.getByRole('list', { name: 'Métiers' })).getByRole('button', { name: /Développeur·se back-end/ }),
    )
    expect(screen.queryByRole('list', { name: 'Métiers' })).not.toBeInTheDocument()
    await waitFor(() => expect(screen.getByRole('heading', { level: 1 })).toHaveFocus())
  })

  it('compétences : le détail s’ouvre quand la fenêtre s’élargit', () => {
    let ecouteur: (e: { matches: boolean }) => void = () => {}
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: (_: string, f: typeof ecouteur) => (ecouteur = f),
      removeEventListener: vi.fn(),
    })) as unknown as typeof window.matchMedia
    monter()
    const details = document.querySelector('[data-competences] details') as HTMLDetailsElement
    expect(details.open).toBe(false)
    act(() => ecouteur({ matches: true }))
    expect(details.open).toBe(true)
  })

  it('cible disparue : alerte', () => {
    stocker('metier-disparu')
    monter()
    expect(
      screen.getByText(
        'Le métier visé de ta roadmap n’existe plus dans constellation : choisis-en un autre. Tes éléments sont conservés.',
      ),
    ).toBeInTheDocument()
  })
})

describe('RoadmapPage : éléments', () => {
  it('ajout en 2027 : validation, focus, enregistrement', async () => {
    const user = userEvent.setup()
    monter()
    await user.click(screen.getByRole('button', { name: 'Ajouter' }))
    const dialog = screen.getByRole('dialog', { name: 'Ajouter un élément' })
    expect(within(dialog).getByRole('combobox', { name: 'Année' })).toHaveValue('2027')
    await user.click(within(dialog).getByRole('button', { name: 'Enregistrer' }))
    expect(within(dialog).getByText('Donne un titre à cet élément.')).toBeInTheDocument()
    expect(within(dialog).getByRole('textbox', { name: 'Titre' })).toHaveFocus()

    await user.type(within(dialog).getByRole('textbox', { name: 'Titre' }), 'Mon API')
    await user.type(within(dialog).getByRole('textbox', { name: /Ressource/ }), 'symfony.com')
    await user.click(within(dialog).getByRole('button', { name: 'Enregistrer' }))
    expect(within(dialog).getByText('L’adresse doit commencer par http:// ou https://.')).toBeInTheDocument()
    expect(within(dialog).getByRole('textbox', { name: /Ressource/ })).toHaveFocus()

    const url = within(dialog).getByRole('textbox', { name: /Ressource/ })
    await user.clear(url)
    await user.type(url, '  https://symfony.com  ')
    await user.type(within(dialog).getByRole('textbox', { name: /Note/ }), ' une note ')
    await user.click(within(dialog).getByRole('button', { name: 'Enregistrer' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('article', { name: 'Projet à réaliser : Mon API' })).toBeInTheDocument()
    const [stocke] = stockee().annees['2027']
    expect(stocke).toMatchObject({ type: 'projet', titre: 'Mon API', url: 'https://symfony.com', note: 'une note' })
    await waitFor(() => expect(screen.getByRole('button', { name: 'Ajouter' })).toHaveFocus())
  })

  it('la barre d’actions propose le choix de l’année ; le bouton d’une année la fixe', async () => {
    const user = userEvent.setup()
    monter()
    await user.click(screen.getByRole('button', { name: 'Ajouter' }))
    let dialog = screen.getByRole('dialog', { name: 'Ajouter un élément' })
    const annees = within(dialog).getAllByRole('option').map((o) => o.textContent)
    expect(annees).toEqual(['2027', '2028', '2029', '2030', '2031'])
    await user.selectOptions(within(dialog).getByRole('combobox', { name: 'Année' }), '2030')
    await user.type(within(dialog).getByRole('textbox', { name: 'Titre' }), 'Stage')
    await user.click(within(dialog).getByRole('button', { name: 'Enregistrer' }))
    expect(stockee().annees['2030']).toHaveLength(1)
    expect(stockee().annees['2027']).toHaveLength(0)

    await user.click(screen.getByRole('button', { name: 'Ajouter à 2028' }))
    dialog = screen.getByRole('dialog', { name: 'Ajouter à 2028' })
    expect(within(dialog).queryByRole('combobox', { name: 'Année' })).toBeNull()
  })

  it('ajout d’une notion en 2029 via le bouton de l’année', async () => {
    const user = userEvent.setup()
    monter()
    await user.click(screen.getByRole('button', { name: 'Ajouter à 2029' }))
    const dialog = screen.getByRole('dialog', { name: 'Ajouter à 2029' })
    await user.click(within(dialog).getByRole('radio', { name: 'Notion à apprendre' }))
    await user.type(within(dialog).getByRole('textbox', { name: 'Titre' }), 'SQL')
    await user.click(within(dialog).getByRole('button', { name: 'Enregistrer' }))
    expect(screen.getByRole('article', { name: 'Notion à apprendre : SQL' })).toBeInTheDocument()
    expect(stockee().annees['2029']).toHaveLength(1)
  })

  it('modification', async () => {
    const user = userEvent.setup()
    stocker(null, { '2028': [item('A')] })
    monter()
    await user.click(screen.getByRole('button', { name: 'Modifier « A »' }))
    const dialog = screen.getByRole('dialog', { name: 'Modifier l’élément' })
    const titre = within(dialog).getByRole('textbox', { name: 'Titre' })
    expect(titre).toHaveValue('A')
    await user.clear(titre)
    await user.type(titre, 'Z')
    await user.click(within(dialog).getByRole('button', { name: 'Enregistrer' }))
    expect(stockee().annees['2028'][0]).toMatchObject({ id: 'id-A', titre: 'Z' })
  })

  it('monter et descendre', async () => {
    const user = userEvent.setup()
    stocker(null, { '2027': [item('A'), item('B')] })
    monter()
    expect(screen.getByRole('button', { name: 'Monter « A »' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'Descendre « A »' }))
    expect(titres(2027)).toEqual(['B', 'A'])
    expect(screen.getByRole('button', { name: 'Monter « B »' })).toBeDisabled()
    expect(stockee().annees['2027'].map((i) => i.titre)).toEqual(['B', 'A'])
  })

  it('le focus suit l’élément déplacé jusqu’en tête ou en queue', async () => {
    const user = userEvent.setup()
    stocker(null, { '2027': [item('A'), item('B')] })
    monter()
    screen.getByRole('button', { name: 'Descendre « A »' }).focus()
    await user.keyboard('{Enter}')
    await waitFor(() => expect(screen.getByRole('button', { name: 'Monter « A »' })).toHaveFocus())
    await user.keyboard('{Enter}')
    await waitFor(() => expect(screen.getByRole('button', { name: 'Descendre « A »' })).toHaveFocus())
  })

  it('poignée de déplacement nommée', () => {
    stocker(null, { '2027': [item('A'), item('B')] })
    monter()
    expect(screen.getByRole('button', { name: 'Déplacer « A »' })).toBeInTheDocument()
  })

  it('suppression avec confirmation, Annuler garde l’élément', async () => {
    const user = userEvent.setup()
    stocker(null, { '2027': [item('A')] })
    monter()
    await user.click(screen.getByRole('button', { name: 'Supprimer « A »' }))
    let dialog = screen.getByRole('dialog', { name: 'Supprimer « A » ?' })
    await user.click(within(dialog).getByRole('button', { name: 'Annuler' }))
    expect(screen.getByRole('article', { name: /A$/ })).toBeInTheDocument()
    await waitFor(() => expect(screen.getByRole('button', { name: 'Supprimer « A »' })).toHaveFocus())

    await user.click(screen.getByRole('button', { name: 'Supprimer « A »' }))
    dialog = screen.getByRole('dialog', { name: 'Supprimer « A » ?' })
    await user.click(within(dialog).getByRole('button', { name: 'Supprimer' }))
    expect(screen.queryByRole('article')).not.toBeInTheDocument()
    expect(stockee().annees['2027']).toHaveLength(0)
    await waitFor(() => expect(screen.getByRole('button', { name: 'Ajouter à 2027' })).toHaveFocus())
  })
})

describe('RoadmapPage : export et import', () => {
  it('indicateur d’enregistrement', () => {
    monter()
    expect(screen.getByText('Enregistré dans ce navigateur')).toBeInTheDocument()
  })

  it('imprime en PDF', async () => {
    const print = vi.spyOn(window, 'print').mockImplementation(() => {})
    monter()
    await userEvent.setup().click(screen.getByRole('button', { name: 'Imprimer en PDF' }))
    expect(print).toHaveBeenCalled()
  })

  it('exporte un fichier constellation-roadmap-…', async () => {
    const user = userEvent.setup()
    const creer = vi.fn(() => 'blob:test')
    const revoquer = vi.fn()
    URL.createObjectURL = creer
    URL.revokeObjectURL = revoquer
    let nom = ''
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      nom = this.download
    })
    stocker('dev-backend', { '2027': [item('A')] })
    monter()
    await user.click(screen.getByRole('button', { name: 'Exporter en JSON' }))
    expect(creer).toHaveBeenCalledTimes(1)
    expect(nom).toMatch(/^constellation-roadmap-/)
    expect(revoquer).toHaveBeenCalledWith('blob:test')
    expect(document.querySelector('a[download]')).toBeNull()
  })

  async function importer(contenu: string) {
    const entree = document.querySelector('input[type="file"]') as HTMLInputElement
    await act(async () => {
      fireEvent.change(entree, {
        target: { files: [new File([contenu], 'roadmap.json', { type: 'application/json' })] },
      })
    })
    return entree
  }

  const valide = JSON.stringify({
    format: 'constellation-roadmap',
    version: 1,
    cible: 'dev-backend',
    annees: { '2030': [{ id: 'x', type: 'notion', titre: 'Importé', url: '', note: '' }] },
  })

  it('fichier invalide : alerte, rien ne change', async () => {
    stocker(null, { '2027': [item('A')] })
    monter()
    await importer('{}')
    expect(await screen.findByRole('alert')).toHaveTextContent('Ce fichier n’est pas une roadmap constellation.')
    expect(stockee().annees['2027']).toHaveLength(1)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('fichier valide sur roadmap non vide : confirmation', async () => {
    const user = userEvent.setup()
    stocker(null, { '2027': [item('A')] })
    monter()
    const entree = await importer(valide)
    expect(entree.value).toBe('')
    const dialog = await screen.findByRole('dialog', { name: 'Remplacer ta roadmap ?' })
    expect(
      within(dialog).getByText(/Le fichier contient 1 élément\. Ta roadmap actuelle \(1 élément\) sera remplacée\./),
    ).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: 'Annuler' }))
    expect(stockee().annees['2030']).toHaveLength(0)

    await importer(valide)
    await user.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Remplacer' }))
    await waitFor(() => expect(stockee().annees['2030']).toHaveLength(1))
    expect(stockee().annees['2027']).toHaveLength(0)
    expect(stockee().cible).toBe('dev-backend')
    expect(screen.getByText('Roadmap importée.')).toBeInTheDocument()
  })

  it('fichier valide sur roadmap vide : remplacement direct, cible inconnue signalée', async () => {
    monter()
    await importer(valide.replace('dev-backend', 'inconnu'))
    await waitFor(() => expect(stockee().annees['2030']).toHaveLength(1))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(
      screen.getByText('Le métier visé dans ce fichier n’existe plus dans constellation : choisis-en un autre.'),
    ).toBeInTheDocument()
  })
})
