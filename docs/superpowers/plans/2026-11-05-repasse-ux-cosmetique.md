# Repasse UX cosmétique (audit n° 7 à 14) — plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal :** fermer les n° 7 à 13 de l'audit des résolutions de PC portable, et le n° 14 (zone d'exploration estompée après le quiz), chacun avec un test de non-régression.

**Architecture :** il s'agit de correctifs locaux de classes Tailwind et de SVG dans les composants existants. Deux comportements sont nouveaux, tous deux dans `PlanSvg.tsx` : le côté de la bulle, calculé au rendu, et le diamètre des cibles, qui suit la largeur du plan. Les mesures passent par les page objects de `tests-e2e/pages/`.

**Tech Stack :** React 19, TypeScript, Tailwind CSS v4, Vitest + Testing Library, Playwright (Page Object Model).

**Spec :** `docs/superpowers/specs/2026-11-05-repasse-ux-cosmetique-design.md`

## Global Constraints

- Interface, commentaires et messages en français, tutoiement, écriture inclusive.
- Couleurs uniquement par les tokens (`tokens.css` / `index.css`). Seules exceptions : `plan.json`, et `#000` / `#fff` dans `impression.css`.
- WCAG 2 AA : les stations, les numéros de terminus et les libellés de quartier gardent leur plein contraste. Aucune cible ne descend sous 24 px.
- Specs e2e sans sélecteur brut ni mesure DOM : tout passe par `tests-e2e/pages/`. Toute méthode qui filtre une collection vérifie le nombre attendu (68 stations, 6 sources, 4 actions…) et lève une erreur sinon.
- Constantes partagées dans `tests-e2e/donnees.ts`, jamais exportées d'une spec.
- Tests à garder verts :
  - `mise-en-page.spec.ts` (haut du dessin ≤ 300 px, centre visible en 1366×633, légende et plein écran, bulle visible) ;
  - les 230 tests unitaires ;
  - le lint.
- **Aucun commit ni push** : Adrien les demande lui-même. Les sous-agents ne commitent pas.
- Liste « Catégorie » gardée à 240 px (décision d'Adrien).

## Review Focus

- **Bulle d'une station près du bas de la fenêtre** : la bascule ne doit jamais envoyer la bulle sous le bas de l'écran. Elle ne passe dessous que si elle sort en haut (Tâche 7, test « station du bas »).
- **Plan en plein écran** : la bulle et les cibles se calculent toujours par rapport à la fenêtre et au dessin. Le test de plein écran existant doit rester vert (Tâche 5).
- **Plan entre 768 et 1279 px** : la légende et le bouton « Plein écran » sont dans le flux, et doivent rester alignés sur l'en-tête, sans coller au bord (Tâche 5, test en 1024×700).
- **Élément de roadmap sur mobile (390 px)** : le titre ne doit pas se réduire à une colonne étroite à cause des 4 actions (Tâche 4, test du projet `mobile`).
- **Filtre actif après le quiz** : une station hors filtre sur une ligne estompée reste distinguable (opacité 0,45 de la station). Une station dans le filtre sur une ligne estompée garde son plein contraste (Tâche 8, test unitaire).

---

### Task 1 : n° 13, marges du PDF en blanc

**Files :**
- Modify : `src/styles/impression.css` (début du bloc `@media print`)
- Modify : `tests-e2e/pages/RoadmapPage.ts` (nouvelle méthode)
- Test : `tests-e2e/mise-en-page.spec.ts`

**Interfaces :**
- Produces : `RoadmapPage.schemaDeCouleursImprime(): Promise<string>`. La méthode émule `media: 'print'`, lit `getComputedStyle(document.documentElement).colorScheme`, puis rétablit `media: 'screen'`.

- [ ] **Step 1 : vérification manuelle « avant »**. Construire le PDF de la roadmap (`page.pdf({ format: 'A4', printBackground: true, preferCSSPageSize: true })` en média `print`, avec `ROADMAP_AUDIT` en stockage), puis `pdftoppm -r 30 -png -f 1 -l 1`. Lire le pixel (2, 2). Attendu : `(18, 18, 18)`. Script dans le scratchpad, pas dans le dépôt.
- [ ] **Step 2 : test qui échoue.**
  ```ts
  test.describe('impression : marges du PDF', () => {
    test('le schéma de couleurs imprimé est clair', async ({ roadmap }) => {
      await roadmap.ouvrir()
      await roadmap.poserStockage('constellation.roadmap.v1', ROADMAP_AUDIT)
      expect(await roadmap.schemaDeCouleursImprime()).toBe('light')
    })
  })
  ```
- [ ] **Step 3** : `npx playwright test mise-en-page -g "marges du PDF" --project=desktop`. Attendu : ÉCHEC, valeur `dark`.
- [ ] **Step 4** : dans `@media print`, ajouter `:root { color-scheme: light; }`, avec un commentaire qui justifie la règle : la meta `color-scheme: dark` fait peindre la marge `@page` en sombre.
- [ ] **Step 5** : relancer le test. Attendu : PASSE. Refaire le Step 1. Attendu : `(255, 255, 255)`. Noter les deux valeurs pour la section « Suites ».

### Task 2 : n° 9, dates des sources sur une ligne

**Files :**
- Modify : `src/pages/SourcesPage.tsx:63` (cellule `font-mono`)
- Modify : `tests-e2e/pages/SourcesPage.ts`
- Test : `tests-e2e/mise-en-page.spec.ts`

**Interfaces :**
- Produces : `SourcesPage.datesDuTableau(): Promise<Locator[]>`. La méthode renvoie les cellules de la 3e colonne (« Date ») du tableau « Liste des sources » et lève une erreur si leur nombre n'est pas 6.

- [ ] **Step 1 : test qui échoue**, en 1366×633 :
  ```ts
  test('chaque date du tableau tient sur une ligne', async ({ sources }) => {
    await sources.ouvrir()
    for (const cellule of await sources.datesDuTableau()) {
      expect(await sources.nombreDeLignes(cellule)).toBe(1)
    }
  })
  ```
- [ ] **Step 2** : lancer le test. Attendu : ÉCHEC (2 lignes pour `2025-10`).
- [ ] **Step 3** : ajouter `whitespace-nowrap` à la cellule.
- [ ] **Step 4** : relancer le test. Attendu : PASSE.

### Task 3 : n° 10, piste des barres Silkhom plafonnée

**Files :**
- Modify : `src/components/metier/CartoucheSilkhom.tsx:75-77` (3e cellule de `GrilleTranches`)
- Modify : `tests-e2e/pages/FichePage.ts`
- Test : `tests-e2e/mise-en-page.spec.ts`

**Interfaces :**
- Produces : `FichePage.largeursPistesSilkhom(): Promise<number[]>`. La méthode renvoie la largeur de la piste (le parent de `[data-slot="plage-barre"]`) de chaque ligne visible de la grille « Salaire cible, Silkhom ». Elle lève une erreur si aucune ligne n'est trouvée.

- [ ] **Step 1 : test qui échoue**, en 1536×731, fiche `dev-backend` : chaque largeur est ≤ 640.
- [ ] **Step 2** : lancer le test. Attendu : ÉCHEC (816).
- [ ] **Step 3** : envelopper `PlageSalaire` dans un `div` en `max-w-[640px]`, ou poser la classe sur la piste via une prop `className`. Garder `min-w-[120px]`.
- [ ] **Step 4** : relancer le test. Attendu : PASSE. Vérifier aussi que `npm test -- cartouches` passe toujours.

### Task 4 : n° 8, actions de l'élément de roadmap sur une rangée

**Files :**
- Modify : `src/components/metier/ItemRoadmap.tsx` (`article` et `data-actions-item`)
- Modify : `tests-e2e/pages/RoadmapPage.ts`
- Test : `tests-e2e/mise-en-page.spec.ts`. Pour le mobile, `tests-e2e/roadmap.spec.ts` (projet `mobile` non ignoré).

**Interfaces :**
- Produces :
  - `RoadmapPage.carteElement(titre: string): Locator`, qui renvoie l'`article` dont le nom finit par `: ${titre}` ;
  - `RoadmapPage.rectsActions(titre: string): Promise<Rect[]>`, qui renvoie les rectangles des 4 boutons Monter / Descendre / Modifier / Supprimer de cette carte et lève une erreur s'il n'y en a pas 4 ;
  - `RoadmapPage.titreElement(titre: string): Locator`.

- [ ] **Step 1 : tests qui échouent**, en 1280×800 avec `ROADMAP_AUDIT` :
  - la carte « Git avancé : rebase, bisect, hooks » fait au plus 110 px de haut ;
  - ses 4 actions ont le même `haut`, à 1 px près.
  
  En mobile (390×844), dans `roadmap.spec.ts` : le titre « API REST de gestion de bibliothèque en Node.js » fait au moins 240 px de large, et les 4 actions sont sous le bas du titre.
- [ ] **Step 2** : lancer les tests. Attendu : ÉCHEC (environ 150 px, actions empilées).
- [ ] **Step 3** : les actions passent en `flex-row gap-0.5`. À partir de `sm`, elles sont dans la rangée de l'`article`, alignées en haut. Sous `sm`, l'`article` passe en `flex-wrap` et les actions vont sur une rangée pleine largeur sous le contenu, en `justify-end`. La règle d'impression `[data-actions-item] { display: none }` reste inchangée.
- [ ] **Step 4** : relancer les tests. Attendu : PASSE. `npm test -- roadmap` doit rester vert (ordre et noms des boutons inchangés).

### Task 5 : n° 7, plan pleine largeur et légende de la maquette

**Files :**
- Modify : `src/pages/plan/PlanPage.tsx`. Le padding horizontal ne s'applique plus qu'à l'en-tête et au lien d'évitement. L'en-tête passe de `pt-4` à `pt-3`.
- Modify : `src/pages/plan/PlanSvg.tsx`. La légende dans le flux passe en `gap-x-4 gap-y-2`. Sous `xl`, la légende et le bouton « Plein écran » gardent la marge de l'en-tête (24 px, 48 px à partir de `md`).
- Modify : `tests-e2e/pages/PlanPage.ts`
- Test : `tests-e2e/mise-en-page.spec.ts`

**Interfaces :**
- Consumes : `rectEcran`, `largeursDocument`, `hauteurFenetre` (`AppPage`), `dessin`, `legende`, `centre` (`PlanPage`).
- Produces : aucune nouvelle méthode.

- [ ] **Step 1 : tests qui échouent.**
  - En 1280×800, la largeur du dessin (`droite − gauche`) est ≥ `largeursDocument().fenetre − 1`, et il n'y a pas de défilement horizontal.
  - Dans le test existant du centre en 1366×633, on durcit la marge : `bas ≤ hauteurFenetre() − 2`.
  - En 1024×700 (avant le quiz), le `gauche` de la légende est ≥ 47.
- [ ] **Step 2** : lancer les tests. Attendu : ÉCHEC pour la largeur (1184). Les deux autres passent déjà : ce sont des garde-fous pour la suite.
- [ ] **Step 3** : implémenter les trois changements des fichiers ci-dessus.
- [ ] **Step 4** : `npx playwright test mise-en-page --project=desktop`. Attendu : tout passe, y compris le haut ≤ 300 px, la légende et le bouton qui ne recouvrent aucune station, et le plein écran. Si le centre en 1366×633 ne garde pas ses 2 px, arrêter et le signaler à Adrien : ne pas toucher à la cible.

### Task 6 : n° 12 (b et c), cibles proportionnelles et disque central

**Files :**
- Modify : `src/pages/plan/PlanSvg.tsx`. Le lien de station passe de `size-[34px]` à `w-[clamp(24px,2.75%,34px)] aspect-square`. Le disque central passe de `r={30}` à `r={34}` et reçoit `data-disque`.
- Modify : `tests-e2e/pages/PlanPage.ts`
- Test : `tests-e2e/mise-en-page.spec.ts`

**Interfaces :**
- Produces :
  - `PlanPage.ciblesQuiSeChevauchent(): Promise<string[]>`. Pour chaque paire de liens de station (`[data-plan-dessin] a[href*="/fiche/"]`, 68 exigées), la méthode renvoie `"A / B"` si la distance entre les centres est inférieure à la demi-somme des largeurs moins 0,5. Les cibles sont rondes.
  - `PlanPage.diametreMinimalDesCibles(): Promise<number>`.
  - `PlanPage.centreDansLeDisque(): Promise<boolean>`. Les 4 coins du `getBBox()` de `[data-centre]` sont à une distance ≤ `r` du centre de `[data-disque]`, en unités SVG.

- [ ] **Step 1 : tests qui échouent.**
  - En 1280×800 et en 1366×633 : `ciblesQuiSeChevauchent()` vaut `[]` et `diametreMinimalDesCibles()` est ≥ 24.
  - En 1280×800 : `centreDansLeDisque()` vaut `true`.
- [ ] **Step 2** : lancer les tests. Attendu : ÉCHEC pour le disque. Les cibles peuvent déjà passer après la Tâche 5 (35,9 > 34) : on vérifie le cas réel en lançant aussi en 1024×700, où le test doit échouer avant la correction.
- [ ] **Step 3** : implémenter.
- [ ] **Step 4** : relancer les tests. Attendu : PASSE, y compris en 1024×700. Les tests unitaires de `plan.test.tsx` restent verts.

### Task 7 : n° 12 (a), la bulle bascule sous la station

**Files :**
- Modify : `src/pages/plan/PlanSvg.tsx`. Ajouter un état `cote: 'dessus' | 'dessous'`, remis à `'dessus'` à chaque changement de `actif.id`. Un `useLayoutEffect` sur la bulle passe `cote` à `'dessous'` si `getBoundingClientRect().top < 8` alors que la bulle est au-dessus. Au-dessous, la transformation devient `translate(<x>, 24px)`. La bulle a l'attribut `data-cote`.
- Modify : `tests-e2e/pages/PlanPage.ts`
- Test : `tests-e2e/mise-en-page.spec.ts`

**Interfaces :**
- Produces :
  - `PlanPage.amenerStationA(titre: string, hautEcran: number)`, qui fait défiler la page pour que le centre de la station soit à `hautEcran` px du haut de la fenêtre ;
  - `PlanPage.stationVisibleSousLaBulle(titre: string): Promise<boolean>`, vrai si `elementFromPoint` au centre de la station renvoie la station ou l'un de ses descendants.

- [ ] **Step 1 : tests qui échouent**, en 1280×590 après le quiz (`QUIZ_B`) :
  - station « RSSI (responsable de la sécurité des SI) » amenée à 60 px du haut, puis survolée : `bulleEntierementVisible()` vaut `true` et `stationVisibleSousLaBulle` aussi ;
  - même chose pour la station la plus basse du plan, « Lead developer » (y = 618), amenée à `hauteurFenetre() − 60` : la bulle reste au-dessus (`data-cote="dessus"`, lu par une méthode `PlanPage.coteDeLaBulle(): Promise<string | null>`) et entièrement visible.
- [ ] **Step 2** : lancer les tests. Attendu : ÉCHEC pour RSSI (bulle rognée).
- [ ] **Step 3** : implémenter.
- [ ] **Step 4** : relancer les tests et tout `mise-en-page.spec.ts`. Attendu : PASSE, y compris « bulle au-dessus de la légende ». Test unitaire : la bulle s'affiche toujours au survol et au focus. jsdom renvoie un rectangle à 0, donc la bulle passe dessous : vérifier que les tests existants n'en dépendent pas.

### Task 8 : n° 14, zone d'exploration estompée

**Files :**
- Modify : `src/pages/plan/PlanSvg.tsx`
  - Pour les lignes à l'état `exploration`, le fond des quartiers et le tracé prennent `opacity={0.4}`.
  - Le chemin pointillé de 52 de large est supprimé.
  - Le pictogramme « Zone d'exploration » de la légende devient un trait plein `var(--ligne-cybersecurite)` de 8 de large à `opacity 0.4`.
  - Les stations, les terminus et les libellés restent inchangés.
- Modify : `src/pages/plan/EncartQuiz.tsx:32`. « les lignes en pointillés » devient « les lignes estompées ».
- Test : `src/pages/plan/plan.test.tsx`

**Interfaces :**
- Consumes : `data-trace`, `data-etat`.
- Produces : aucune.

- [ ] **Step 1 : test qui échoue.** Dans « après le quiz… » :
  - le texte attendu devient `/zone d’exploration : les lignes estompées \(5 lignes, \d+ métiers\)/` ;
  - chaque `[data-trace][data-etat="exploration"]` a `opacity="0.4"` ;
  - chaque `[data-trace][data-etat="top"]` n'a pas d'attribut `opacity` ;
  - aucun `path[stroke-dasharray="1 7"]` dans le SVG du plan ;
  - toujours 0 station `data-attenue`.
  
  Nouveau test : après le quiz, avec un filtre « Back-end », il y a 63 stations `data-attenue` et « Développeur·se back-end » n'est pas atténuée.
- [ ] **Step 2** : `npm test -- plan`. Attendu : ÉCHEC sur le texte et sur l'opacité.
- [ ] **Step 3** : implémenter. Le titre de l'encart ne doit pas s'allonger : le haut ≤ 300 px du plan dépend de sa hauteur.
- [ ] **Step 4** : `npm test`, `npm run lint`, `npx playwright test mise-en-page --project=desktop`. Attendu : tout passe.

### Task 9 : vérification complète, mesures, rapport et mémoire

**Files :**
- Modify : `docs/ux/repasse-2026-11/rapport.md` (section « Suites »)
- Create : captures « après » dans `docs/ux/repasse-2026-11/captures/` :
  - `plan-1280x800-apres-cosmetique.png` (après le quiz) ;
  - `roadmap-1280x720-apres-cosmetique.png` ;
  - `fiche-1536x864-silkhom-apres-cosmetique.png`.
- Modify : `docs/INDEX.md`, `docs/HANDOFF.md` (4 marqueurs), `docs/QUIRKS.md`, `docs/BACKLOG.md` (retirer les n° 7 à 13, garder le n° 6), `docs/CONVENTIONS.md` si une méthode de POM fait école. Lecture par plage uniquement.

- [ ] **Step 1** : `npm test && npm run lint && npm run build && npm run e2e`. Attendu : tout passe, et le nombre de tests e2e est en hausse par rapport aux 93.
- [ ] **Step 2** : remesurer dans les 7 fenêtres du tableau « Suites » (avant / après le quiz) :
  - le haut du dessin ;
  - la largeur du dessin ;
  - le bas du centre en 1366×633 ;
  - la hauteur d'une carte de roadmap en 1280×720 ;
  - le pixel de marge du PDF (avant / après).
- [ ] **Step 3** : compléter « Suites » avec un tableau n° / problème / correction pour les n° 7 à 14, les mesures, le n° 11 gardé tel quel et la liste à 240 px gardée. Insérer les captures.
- [ ] **Step 4** : mettre à jour la mémoire, puis présenter le résultat à Adrien. Pas de commit sans sa demande.
