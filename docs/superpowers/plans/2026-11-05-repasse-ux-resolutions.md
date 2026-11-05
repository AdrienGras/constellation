# Repasse UX résolutions — plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** rendre l'accueil (plan, liste), le quiz et la roadmap utilisables sans gymnastique dans les fenêtres réelles des PC portables (1366×633, 1280×590), et corriger trois défauts vus pendant l'audit.

**Architecture:** l'en-tête de l'accueil devient un composant partagé par le plan et la liste (deux rangées, encart de quiz compact). La légende des lignes et un bouton plein écran vivent dans une enveloppe du plan, qui est l'élément mis en plein écran. Le quiz reçoit une barre de navigation collée en bas. Le `sticky` de la roadmap remonte d'un niveau. Une nouvelle spec e2e mesure ces mises en page par des page objects.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS v4, shadcn/ui, `lucide-react`, Vitest + Testing Library (jsdom), Playwright (POM).

**Spec:** `docs/superpowers/specs/2026-11-05-repasse-ux-resolutions-design.md` (et l'audit `docs/ux/repasse-2026-11/rapport.md`).

## Global Constraints

- Textes d'interface, commentaires, messages de commit : **français**, tutoiement, écriture inclusive (« Développeur·se »).
- Couleurs **uniquement par les tokens** (classes Tailwind issues de `tokens.css` / `index.css`) ; aucune couleur en dur.
- Specs e2e **sans sélecteur brut** : tout sélecteur et toute mesure DOM vont dans `tests-e2e/pages/`.
- `metiers.json` n'est pas modifié.
- **Commit local seulement si Adrien a autorisé les commits pour cette exécution ; jamais de push.** Messages en français, terminés par `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- WCAG 2 AA : libellés visibles « Catégorie » et « Type de métier » conservés, focus visible, axe vert (`tests-e2e/accessibilite.spec.ts`).
- Les libellés du plan ne rapetissent pas : le plan garde `aspect-[1280/720]` et toute la largeur disponible hors plein écran.
- Cible plan : **haut du dessin du plan ≤ 300 px en coordonnées de page** (barre de navigation comprise) pour toute largeur ≥ 1280 px, avant et après le quiz.
- Si la cible de 300 px n'est pas atteinte, retirer dans cet ordre, seulement ce qu'il faut : (1) l'étiquette « Accueil » / « Accueil · vue liste » ; (2) le chapeau raccourci à « 68 métiers sur 8 lignes. Survole une station pour voir le métier, clique pour ouvrir sa fiche. » ; (3) le rappel « point de départ, pas un verdict » de l'encart. La consigne de la zone d'exploration et son décompte ne sont jamais retirés.
- Fenêtres de mesure e2e : `{ width: 1366, height: 633 }`, `{ width: 1280, height: 590 }`, `{ width: 1536, height: 731 }`, plus `{ width: 1280, height: 800 }`.
- Vérification finale : `npm test`, `npm run lint`, `npm run build`, `npm run e2e` tous verts.

## Review Focus

1. **Filtre actif** : « Effacer les filtres » ajoute un élément à la rangée 2 et peut la faire passer à la ligne, donc repousser le plan. On attend toujours un plan à ≤ 300 px. Test ajouté à la tâche 6.
2. **Quiz en attente de départage** : l'encart « Ton quiz attend un dernier choix » sur le plan doit tenir la cible comme les deux autres états. Test ajouté à la tâche 6.
3. **Focus masqué par la barre collée du quiz** (WCAG 2.4.11) : une réponse atteinte au clavier ne doit pas finir sous la barre. Test ajouté à la tâche 4.
4. **Sortie du plein écran** : après « Quitter le plein écran » (ou Échap, natif), le libellé redevient « Plein écran » et le plan reprend sa taille. Tests ajoutés à la tâche 5 (unitaire, avec événement `fullscreenchange`) et à l'e2e de la tâche 5.
5. **Ordre clavier dans le plan** : le bouton plein écran doit être atteignable avant les 68 stations, sans 68 tabulations. Test ajouté à la tâche 5.

---

## Structure des fichiers

| Fichier | Rôle | Tâches |
|---|---|---|
| `src/pages/quiz/Resultat.tsx`, `Departage.tsx` | exemples de ligne avec repli sur les métiers d'évolution | 1 |
| `src/components/ui/button.tsx`, `src/components/metier/CartoucheApec.tsx` | bouton `ghost` désactivé, filet Apec | 2 |
| `src/pages/roadmap/RoadmapPage.tsx`, `Competences.tsx` | colonne sticky | 3 |
| `tests-e2e/mise-en-page.spec.ts` (créé) | e2e de mise en page, toutes tâches 3 à 6 | 3–6 |
| `tests-e2e/pages/AppPage.ts`, `PlanPage.ts`, `QuizPage.ts`, `RoadmapPage.ts`, `ListePage.ts` | mesures et pose d'état | 3–6 |
| `src/pages/quiz/Question.tsx`, `Departage.tsx` | barre de navigation collée | 4 |
| `src/pages/plan/usePleinEcran.ts` (créé), `PlanSvg.tsx`, `Filtres.tsx` | enveloppe, légende posée, plein écran | 5 |
| `src/pages/plan/EnTeteAccueil.tsx` (créé), `EncartQuiz.tsx`, `PlanPage.tsx`, `src/pages/ListePage.tsx` | en-tête compact partagé | 6 |
| `docs/*`, `maquette/README.md`, `docs/ux/repasse-2026-11/rapport.md` | mémoire projet | 7 |

---

### Task 1 : exemples de la ligne Management

**Files:**
- Modify: `src/pages/quiz/Resultat.tsx:15-21,45`
- Modify: `src/pages/quiz/Departage.tsx:13-19`
- Test: `src/pages/quiz/quiz.test.tsx`

**Interfaces:**
- Produces: `exemplesDeLigne(id: LigneId, n = 3): { titres: string[]; apresQuelquesAnnees: boolean }` et `libelleExemples(e: { apresQuelquesAnnees: boolean }): string` qui renvoie `'Par exemple :'` ou `'Par exemple, après quelques années :'`.

- [ ] **Step 1 : tests rouges** dans `quiz.test.tsx`. Adapter le test existant (ligne 172) à la nouvelle forme, puis ajouter :

```ts
it('exemplesDeLigne : ligne avec métiers d’entrée, inchangée', () => {
  const ex = exemplesDeLigne('developpement')
  expect(ex.apresQuelquesAnnees).toBe(false)
  expect(ex.titres).toHaveLength(3)
  for (const t of ex.titres) expect(metiers.find((m) => m.titre === t)?.type).toBe('entree')
})
it('exemplesDeLigne : Management se replie sur les métiers d’évolution', () => {
  expect(exemplesDeLigne('management')).toEqual({
    titres: ['CTO (directeur·rice technique)', 'Chief data officer', 'DSI (directeur·rice des systèmes d\'information)'],
    apresQuelquesAnnees: true,
  })
})
it('le résultat affiche « après quelques années » pour Management', () => {
  // quiz terminé tout en b : top 3 Infra & cloud, Management, Développement
  // (réutiliser le helper du fichier qui pose le quiz terminé, puis monter /quiz)
  expect(screen.getByText('Par exemple, après quelques années :')).toBeInTheDocument()
  expect(screen.getAllByText('Par exemple :')).toHaveLength(2)
})
```

Vérifier les titres exacts dans `metiers.json` (ordre de `stationsDeLigne('management')`) avant de figer l'assertion.

- [ ] **Step 2 :** `npx vitest run src/pages/quiz/quiz.test.tsx` → les nouveaux tests échouent.
- [ ] **Step 3 : implémenter** le repli : métiers d'entrée de la ligne ; s'il n'y en a aucun, métiers d'évolution, dans l'ordre de `stationsDeLigne`, 3 au plus. `Resultat` et `Details` (`Departage`) affichent `<strong>{libelleExemples(ex)}</strong> {ex.titres.join(', ')}`.
- [ ] **Step 4 :** `npx vitest run src/pages/quiz` → PASS.
- [ ] **Step 5 : commit** (si autorisé) `Quiz : exemples de la ligne Management (métiers d’évolution)`.

### Task 2 : bouton `ghost` désactivé et filet du tableau Apec

**Files:**
- Modify: `src/components/ui/button.tsx:9,16`
- Modify: `src/components/metier/CartoucheApec.tsx:72`
- Test: `src/components/ui/primitives.test.tsx`, `src/components/metier/cartouches.test.tsx`

- [ ] **Step 1 : tests rouges.**

```ts
// primitives.test.tsx
it('Button ghost désactivé : ni fond ni bordure de survol', () => {
  render(<Button variant="ghost" disabled>Monter</Button>)
  const b = screen.getByRole('button', { name: 'Monter' })
  expect(b.className).not.toMatch(/(^|\s)disabled:bg-surface-muted(\s|$)/)
  expect(b.className).toMatch(/disabled:bg-transparent/)
})
it('Button default désactivé garde son fond désactivé', () => {
  render(<Button disabled>Ok</Button>)
  expect(screen.getByRole('button', { name: 'Ok' }).className).toMatch(/disabled:bg-surface-muted/)
})
// cartouches.test.tsx, describe CartoucheApec
it('les en-têtes de ligne portent le filet bas', () => {
  // rendre la cartouche dev-backend comme les tests voisins
  for (const th of screen.getAllByRole('rowheader')) expect(th.className).toMatch(/border-b/)
})
```

- [ ] **Step 2 :** `npx vitest run src/components` → les 2 nouveaux tests rouges échouent (le 2ᵉ passe déjà).
- [ ] **Step 3 : implémenter.** Sortir `disabled:border-trait disabled:bg-surface-muted` de la base pour les porter par variante. `ghost` désactivé : `disabled:bg-transparent disabled:border-transparent disabled:text-encre-douce`, opacité réduite si besoin. Les autres variantes gardent exactement leur rendu désactivé actuel. Ajouter `border-b border-trait` au `TableHead scope="row"` de `CartoucheApec.tsx:72`.
- [ ] **Step 4 :** `npx vitest run src/components` → PASS.
- [ ] **Step 5 : commit** (si autorisé) `Bouton ghost désactivé sans fond de survol ; filet des en-têtes de ligne Apec`.

### Task 3 : colonne sticky de la roadmap (et socle de la spec e2e)

**Files:**
- Create: `tests-e2e/mise-en-page.spec.ts`
- Modify: `tests-e2e/pages/AppPage.ts`, `tests-e2e/pages/RoadmapPage.ts`
- Modify: `src/pages/roadmap/RoadmapPage.tsx:104,124`, `src/pages/roadmap/Competences.tsx:27`

**Interfaces:**
- Produces (dans `AppPage`, réutilisé par les tâches 4 à 6) :
  - `poserStockage(cle: string, valeur: unknown): Promise<void>` : la page doit être chargée ; écrit dans `localStorage`, recharge, attend `attendreChargement()` ;
  - `rectEcran(cible: Locator): Promise<{ haut: number; bas: number; gauche: number; droite: number }>` : `getBoundingClientRect`, coordonnées de fenêtre ;
  - `hautDansLaPage(cible: Locator): Promise<number>` : `rect.top + scrollY` ;
  - `defilerA(y: number): Promise<void>` ;
  - `hauteurFenetre(): Promise<number>` ;
  - `nombreDeLignes(cible: Locator): Promise<number>` : centres distincts des `Range.getClientRects()` du contenu, tolérance 7 px.
- Produces (spec) : constantes `FENETRES` (les 4 fenêtres des Global Constraints, nommées `w1366`, `w1280`, `w1536`, `w1280x800`), `QUIZ_A`, `QUIZ_B` (états terminés, `{ version: 1, reponses: { q01..q16: lettre }, question: 15, departage: [], termine: true }`), `ROADMAP_AUDIT` (cible `dev-backend`, éléments 3 / 2 / 1 / 0 / 1 sur 2027–2031, forme `EtatRoadmap` de `src/logique/roadmap.ts`), et un `test.beforeEach` qui fait `test.skip` sur le projet `mobile`.
- Produces (`RoadmapPage`) : `get colonneCompetences(): Locator` (`[data-competences]`).

- [ ] **Step 1 : test rouge** dans `mise-en-page.spec.ts` :

```ts
test.describe('roadmap : colonne des compétences', () => {
  test.use({ viewport: FENETRES.w1366 })
  test('reste collée à 24 px après 900 px de défilement', async ({ roadmap }) => {
    await roadmap.ouvrir()
    await roadmap.poserStockage('constellation.roadmap.v1', ROADMAP_AUDIT)
    await roadmap.defilerA(900)
    const { haut, bas } = await roadmap.rectEcran(roadmap.colonneCompetences)
    expect(Math.abs(haut - 24)).toBeLessThanOrEqual(1)
    expect(bas).toBeLessThanOrEqual(await roadmap.hauteurFenetre())
  })
})
```

- [ ] **Step 2 :** `npx playwright test tests-e2e/mise-en-page.spec.ts --project=desktop` → FAIL (haut ≈ −530).
- [ ] **Step 3 : implémenter.** Le `sticky` (`lg:sticky lg:top-6 lg:self-start`) passe sur l'enveloppe de `RoadmapPage.tsx:124`, enfant direct de la rangée flex. L'`aside` garde `data-competences`. Hauteur plafonnée à `calc(100dvh - 3rem)` à partir de `lg`, avec `overflow-y-auto`. Les tests unitaires existants (`roadmap.test.tsx:81,121`, `impression.test.tsx:70`) doivent rester verts.
- [ ] **Step 4 :** relancer la spec → PASS ; `npx vitest run src/pages/roadmap` → PASS.
- [ ] **Step 5 : commit** (si autorisé) `Roadmap : la colonne des compétences reste collée au défilement`.

### Task 4 : quiz, barre de navigation collée en bas

**Files:**
- Modify: `src/pages/quiz/Question.tsx:46,77-84`, `src/pages/quiz/Departage.tsx:40,86-93`, `src/components/ui/radio-group.tsx` (seulement si la marge de défilement s'y pose)
- Modify: `tests-e2e/pages/QuizPage.ts`
- Test: `tests-e2e/mise-en-page.spec.ts`, `src/pages/quiz/quiz.test.tsx`

**Interfaces:**
- Consumes: `AppPage.rectEcran`, `hauteurFenetre`, `defilerA`, `poserStockage`, `FENETRES`, `QUIZ_A` (tâche 3).
- Produces (`QuizPage`) :
  - `get barreNavigation(): Locator` (`[data-barre-quiz]`) ;
  - `get boutonAvancer(): Locator` (bouton « Question suivante » ou « Voir mon résultat ») ;
  - `get dernierChoix(): Locator` (dernière carte de réponse ou de ligne à départager) ;
  - `get note(): Locator` (« Il n’y a pas de bonne réponse… », absent au départage) ;
  - `cocherPremiere(): Promise<void>`.

- [ ] **Step 1 : tests rouges** (`mise-en-page.spec.ts`), pour `FENETRES.w1366` et `FENETRES.w1280` :
  - `'les 16 questions : bouton visible à l’ouverture'` : pour chaque question, `defilerA(0)`, puis `rectEcran(boutonAvancer).bas <= hauteurFenetre()`, puis `cocherPremiere()` et clic sur `boutonAvancer` ;
  - `'défilée en bas, la barre ne recouvre ni la dernière réponse ni la note'` : à la question 9 (la plus haute), `defilerA(99999)`, puis `rectEcran(dernierChoix).bas <= rectEcran(barreNavigation).haut` et pareil pour `note` ;
  - `'au clavier, la dernière réponse n’est pas masquée par la barre'` (Review Focus 3) : question 9, `defilerA(0)`, focus sur la première réponse, `ArrowDown` ×3, puis `rectEcran(dernierChoix).bas <= rectEcran(barreNavigation).haut` ;
  - `'départage : bouton visible à l’ouverture'` : `poserStockage('constellation.quiz.v1', QUIZ_A)`, puis `rectEcran(boutonAvancer).bas <= hauteurFenetre()`.
- [ ] **Step 2 :** lancer la spec → FAIL (bas jusqu'à 844 px).
- [ ] **Step 3 : implémenter.** La rangée des boutons de `Question` et `Departage` devient `<div data-barre-quiz>` : `sticky bottom-0`, fond `bg-fond`, filet haut `border-t border-trait`, padding vertical, même largeur que la colonne. Resserrer les espacements verticaux (`py-8` → `py-6`, par exemple). Une marge de défilement basse sur les cartes (`scroll-mb-*` ≥ hauteur de la barre) évite le focus masqué. Le contour de focus des boutons de la barre ne doit pas être rogné (pas d'`overflow` sur la barre).
- [ ] **Step 4 :** spec → PASS ; `npx vitest run src/pages/quiz` → PASS, sans modification des assertions existantes.
- [ ] **Step 5 : commit** (si autorisé) `Quiz : barre de navigation collée en bas de la fenêtre`.

### Task 5 : enveloppe du plan, légende posée, plein écran

**Files:**
- Create: `src/pages/plan/usePleinEcran.ts`
- Modify: `src/pages/plan/PlanSvg.tsx:49` (et la légende des stations, `:206`), `src/pages/plan/Filtres.tsx:31-97`, `src/pages/plan/PlanPage.tsx`
- Modify: `tests-e2e/pages/PlanPage.ts`
- Test: `src/pages/plan/plan.test.tsx`, `tests-e2e/mise-en-page.spec.ts`

**Interfaces:**
- Produces :
  - `usePleinEcran(cible: RefObject<HTMLElement | null>): { disponible: boolean; actif: boolean; basculer: () => void }`. `disponible` vaut `document.fullscreenEnabled === true` ; `actif` suit `document.fullscreenElement === cible.current` via `fullscreenchange` ; `basculer` appelle `requestFullscreen()` ou `document.exitFullscreen()`.
  - `Filtres({ legende = true }: { legende?: boolean })` : avec `legende={false}`, pas de groupe « Légende des lignes ».
  - Composant `LegendeLignes({ className }: { className?: string })`, exporté de `Filtres.tsx` : `role="group"`, `aria-label="Légende des lignes"`, les 8 `PastilleLigne taille="sm"`.
  - Dans `PlanSvg`, l'enveloppe `<div data-plan>` est l'élément mis en plein écran. Elle contient, dans cet ordre DOM : `LegendeLignes` (dans le flux sous `xl`, sinon `xl:absolute` en haut à gauche, une colonne de 8 rangées, `bg-surface shadow-carte`), le bouton plein écran (absolu, haut droit), puis le dessin `<div data-plan-dessin>` (l'ancien conteneur `aspect-[1280/720]`, avec stations, bulle et légende des stations).
- Produces (`PlanPage` e2e) : `get dessin(): Locator` (`[data-plan-dessin]`), `get enveloppe(): Locator` (`[data-plan]`), `get legende(): Locator` (groupe « Légende des lignes »), `get boutonPleinEcran(): Locator` (`/^(Plein écran|Quitter le plein écran)$/`), `pleinEcranActif(): Promise<boolean>` (`document.fullscreenElement` porte `data-plan`), `pleinEcranDisponible(): Promise<boolean>`, `stationsRecouvertesPar(cible: Locator): Promise<string[]>` (noms des stations dont le rectangle croise celui de `cible`).

- [ ] **Step 1 : tests unitaires rouges** (`plan.test.tsx`) :
  - `'sans API plein écran, pas de bouton'` : aucun bouton `/Plein écran/` ;
  - `'avec API plein écran : bouton, bascule et retour du libellé'` : `Object.defineProperty(document, 'fullscreenEnabled', { value: true, configurable: true })`, `HTMLElement.prototype.requestFullscreen = vi.fn()` (restaurés en fin de test). Clic sur « Plein écran », puis `requestFullscreen` est appelé. On définit `document.fullscreenElement` sur `[data-plan]` et on dispatch `fullscreenchange` : le bouton devient « Quitter le plein écran ». Avec `fullscreenElement = null` et un nouveau dispatch, il redevient « Plein écran » (Review Focus 4) ;
  - `'le bouton plein écran précède les stations dans l’ordre du document'` (Review Focus 5) : `bouton.compareDocumentPosition(premièreStation) & Node.DOCUMENT_POSITION_FOLLOWING` ;
  - `'une seule légende des lignes, dans l’enveloppe du plan'` : `getAllByRole('group', { name: 'Légende des lignes' })` de longueur 1, et `closest('[data-plan]')` non nul.
- [ ] **Step 2 :** `npx vitest run src/pages/plan` → FAIL.
- [ ] **Step 3 : implémenter** `usePleinEcran`, `LegendeLignes`, la prop `legende` de `Filtres` (`PlanPage` passe `legende={false}`, la légende vient de `PlanSvg`) et l'enveloppe. Le bouton est un `Button` `variant="outline" size="sm"`, icône `Maximize` / `Minimize` (`aria-hidden`), rendu seulement si `disponible`. En plein écran, l'enveloppe est en `flex items-center justify-center bg-fond`, et le dessin fait `width: min(100vw, calc(100vh * 16 / 9))`, ratio conservé (variante arbitraire `[&:fullscreen]` / `in-[:fullscreen]`, ou règle dans `index.css` ciblant `[data-plan]:fullscreen`). Hors plein écran, le dessin garde `mx-auto w-full max-w-[1280px]`.
- [ ] **Step 4 :** `npx vitest run src/pages/plan` → PASS.
- [ ] **Step 5 : tests e2e rouges** (`mise-en-page.spec.ts`) :
  - pour `FENETRES.w1280` et `FENETRES.w1536`, `'la légende et le bouton ne recouvrent aucune station'` : `stationsRecouvertesPar(legende)` et `stationsRecouvertesPar(boutonPleinEcran)` valent `[]`, et les rectangles de la légende et du bouton ne se croisent pas ;
  - `'plein écran : entrer puis sortir'` (`FENETRES.w1366`) : `expect(await plan.pleinEcranDisponible(), 'API Fullscreen indisponible dans ce Chromium').toBe(true)`. Clic sur le bouton, puis `pleinEcranActif()` vrai, libellé « Quitter le plein écran », `rectEcran(dessin)` contenu dans la fenêtre. Nouveau clic, puis `pleinEcranActif()` faux et libellé « Plein écran ».
- [ ] **Step 6 :** spec → PASS (après ajustement du coin ou des marges si une station est recouverte) ; relancer `npx playwright test tests-e2e/parcours.spec.ts tests-e2e/accessibilite.spec.ts` → PASS.
- [ ] **Step 7 : commit** (si autorisé) `Plan : légende des lignes posée dans le plan et bouton plein écran`.

### Task 6 : en-tête compact de l'accueil (plan et liste)

**Files:**
- Create: `src/pages/plan/EnTeteAccueil.tsx`
- Modify: `src/pages/plan/EncartQuiz.tsx`, `src/pages/plan/PlanPage.tsx:36-55`, `src/pages/ListePage.tsx:63-80`
- Modify: `tests-e2e/pages/PlanPage.ts`, `tests-e2e/pages/ListePage.ts`
- Test: `src/pages/plan/plan.test.tsx`, `src/pages/ListePage.test.tsx`, `tests-e2e/mise-en-page.spec.ts`

**Interfaces:**
- Consumes: `Filtres({ legende })` (tâche 5), `PlanPage.dessin` (tâche 5), mesures `AppPage` et constantes de la spec (tâche 3).
- Produces : `EnTeteAccueil({ etiquette, titre, chapeau, vue }: { etiquette?: string; titre: string; chapeau: ReactNode; vue: 'graphe' | 'liste' })`.
  - Rangée 1 : étiquette, `h1` (`titre-1`) et chapeau à gauche ; `BasculeVue` à droite, seule.
  - Rangée 2 : `Filtres legende={false}` à gauche, `EncartQuiz` à droite.
  - `PlanPage` et `ListePage` l'utilisent ; la liste garde sa rangée de recherche en dessous.
- Produces (`ListePage` e2e) : la `recherche` existe déjà ; (`PlanPage` e2e) `get titre` (déjà dans `AppPage`).

- [ ] **Step 1 : tests unitaires rouges.**
  - `plan.test.tsx`, adapter `'après le quiz…'` (ligne 161) sans affaiblir ce qu'il vérifie. La région `getByRole('region', { name: 'Ton résultat de quiz' })` contient les 3 pastilles avec « 1er choix », « 2e choix », « 3e choix », le texte `/zone d’exploration : les lignes en pointillés \(5 lignes, \d+ métiers\)/` et le bouton « Refaire le quiz ». Le texte « Tes 3 lignes de départ sont allumées » peut rester visible ou devenir `sr-only`.
  - `ListePage.test.tsx`, ajouter `'pas de légende des lignes sur la liste'` : `queryByRole('group', { name: 'Légende des lignes' })` est nul ; les 8 `h2` de ligne portent toujours leur pastille.
- [ ] **Step 2 :** `npx vitest run src/pages` → le test de la liste échoue ; le test du plan échoue si le texte change.
- [ ] **Step 3 : tests e2e rouges** (`mise-en-page.spec.ts`) :
  - pour chacune des fenêtres `w1280`, `w1366`, `w1536` et chacun des états avant le quiz, `QUIZ_B` (résultat) et `QUIZ_A` (départage en attente, Review Focus 2), `'plan à 300 px au plus, titre sur une ligne, sans défilement horizontal'` : `hautDansLaPage(plan.dessin) <= 300`, `nombreDeLignes(plan.titre) === 1`, `largeursDocument()` avec `contenu <= fenetre` ;
  - `'filtre actif : le plan reste à 300 px au plus'` (Review Focus 1), en `w1280` avec `QUIZ_B` : choisir une catégorie (méthode `PlanPage.choisirCategorie(libelle: string)` à ajouter), puis `hautDansLaPage(plan.dessin) <= 300` ;
  - `'liste après le quiz : recherche visible sans défiler'` en `w1366` : `rectEcran(liste.recherche).bas <= hauteurFenetre()` et pas de défilement horizontal.
- [ ] **Step 4 :** lancer la spec → FAIL (haut 380 à 512 px).
- [ ] **Step 5 : implémenter** `EnTeteAccueil` et l'encart compact.
  - Avant le quiz et départage en attente : cartes en rangée actuelles.
  - Après le quiz : carte basse avec les pastilles `sm` et leur rang, la consigne avec le décompte, le rappel « point de départ, pas un verdict » et « Refaire le quiz » (`variant="secondary" size="sm"`). Pas de `max-w-[780px]` qui écrase la rangée.
  - Retirer `lg:flex-nowrap`. Sous `lg`, les rangées passent à la ligne sans défilement horizontal.
  - Si une mesure dépasse 300 px, appliquer l'ordre de retrait des Global Constraints, une étape à la fois, en relançant la spec après chacune.
- [ ] **Step 6 :** spec → PASS ; `npx vitest run` → PASS ; `npx playwright test` (desktop et mobile) → PASS, axe compris.
- [ ] **Step 7 : commit** (si autorisé) `Accueil : en-tête compact partagé et encart de quiz réduit`.

### Task 7 : vérification complète et mémoire projet

**Files:**
- Modify: `docs/INDEX.md`, `docs/HANDOFF.md`, `docs/QUIRKS.md` (si piège), `docs/CONVENTIONS.md`, `docs/BACKLOG.md` (si idée), `maquette/README.md`, `docs/ux/repasse-2026-11/rapport.md`

- [ ] **Step 1 :** `npm test && npm run lint && npm run build && npm run e2e` → tout vert. Noter les nombres de tests.
- [ ] **Step 2 : captures après correction.** Refaire, dans le scratchpad, les mesures de l'audit pour le plan avant/après quiz (5 viewports d'écran + 1366×633). Copier 3 captures « après » dans `docs/ux/repasse-2026-11/captures/` (`plan-1366x633-apres-correction.png`, `plan-1280x800-apres-correction.png`, `quiz-1280x590-apres-correction.png`).
- [ ] **Step 3 : mémoire.**
  - `docs/INDEX.md` : ligne « Repasse UX, étape 2 », avec la spec et le plan.
  - `docs/HANDOFF.md` : entrée avec les 4 marqueurs en gras.
  - `docs/CONVENTIONS.md` : section « Test e2e de mise en page — squelette » (fenêtres réelles, mesures dans les page objects, `poserStockage`).
  - `maquette/README.md` : écart d'en-tête et de légende validé par Adrien le 05/11/2026.
  - Rapport d'audit : section « Suites » (problèmes 1 à 5 corrigés, liens vers spec et plan, captures après correction).
- [ ] **Step 4 : commit** (si autorisé) `Mémoire projet : repasse UX résolutions`.
