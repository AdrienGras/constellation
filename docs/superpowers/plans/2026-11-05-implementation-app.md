# Implémentation de l'app constellation — plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal :** construire l'app statique constellation (plan, fiche, quiz, roadmap, sources) fidèle à la maquette validée, et la publier sur GitHub Pages.

**Architecture :** une SPA React + TypeScript bâtie par Vite à la racine du dépôt, routée par ancre (`createHashRouter`). Toute la logique métier (quiz, salaires, roadmap, import / export, stockage) est faite de fonctions pures dans `src/logique/`, testées par Vitest. Des contextes React (`src/etat/`) branchent ces fonctions sur le `localStorage`. Les pages (`src/pages/`) montent des primitives shadcn restylées aux tokens et des composants métier portés depuis `maquette/design-system/components/bundle.js`. Le plan est un SVG dessiné depuis `plan.json`.

**Tech Stack :** Node 24, npm, React 19, TypeScript, Vite, Tailwind CSS v4 (`@tailwindcss/vite`), shadcn/ui (Radix), `lucide-react`, `react-router` 7, `@dnd-kit/core` + `@dnd-kit/sortable`, `@fontsource`, Vitest + jsdom + Testing Library, Playwright + `@axe-core/playwright`, GitHub Actions → Pages. Python 3.12 (scripts de données existants).

**Spec :** `docs/superpowers/specs/2026-11-05-implementation-app-design.md` (validé le 05/11/2026). Références : PRD (`PRD — App métiers du numérique (module TEM, CODA).md`) ; maquette `maquette/canevas/*.dc.html` (visuel et micro-copies) ; `maquette/design-system/` (tokens, `components/bundle.js`, `bundle.css`, `index.d.ts`).

## Global Constraints

- Français partout (interface, commits), tutoiement, écriture inclusive au point médian, ni emoji ni point d'exclamation, apostrophe typographique `’` dans les textes d'interface (comme `bundle.js`). Titres et boutons en minuscules après la majuscule initiale. Le nom de l'app s'écrit `constellation`.
- Toute valeur absente s'affiche `n.d.`, jamais une estimation, un tiret ou un vide.
- Salaires : chaque bloc s'intitule « Salaire cible » ; Silkhom et Apec ne sont jamais côte à côte ni dans un même tableau ou graphique ; tranches en années, jamais d'étiquette `niveau` ni de `variation_pct`.
- Aucune couleur en dur dans les composants : uniquement les variables de `tokens.css` (via les classes Tailwind ou `var(--…)`). Seule exception : `plan.json` porte ses couleurs, qu'on peut utiliser telles quelles (ce sont les valeurs des tokens).
- Aucun appel réseau à l'exécution : pas de Google Fonts, pas de CDN, pas d'analytics.
- `metiers.json` n'est modifié qu'à la tâche 2, par script Python, suivi de `python3 scripts/valider.py metiers.json` et `python3 -m unittest discover -s tests -t .`. Ne jamais lancer `scripts/fusionner.py`.
- `base: '/constellation/'` dans Vite ; seul `dist/` est publié.
- Focus visible partout (contour `var(--focus)` 2 px, décalé de 2 px), cibles ≥ 44 px (36 px dans une barre d'outils dense), corps de texte ≥ 16 px.
- Commits : en français, avec le trailer `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Jamais de push sans demande d'Adrien.
- Vérification d'une tâche : `npm run lint && npm test` verts, plus la commande propre à la tâche.

## Review Focus

1. **Quiz rouvert après une mise à jour des données ou un stockage d'une autre version** : un `constellation.quiz.v1` qui référence une question ou une réponse inconnue ne doit pas planter ; on ignore les réponses inconnues. Test : tâche 4, `ignore les réponses inconnues`.
2. **Import d'une roadmap exportée puis retouchée à la main** (item sans `id`, `url` absente, année en nombre plutôt qu'en chaîne, champ en trop) : on accepte ce qui est récupérable et on refuse avec un message clair le reste, sans rien modifier. Tests : tâche 6, `importerRoadmap` cas « tolérants ».
3. **Fiche ouverte par une URL tapée à la main ou un ancien lien** (`#/fiche/inconnu`, `#/fiche/`) : message « Métier introuvable » et lien vers le plan, sans écran blanc. Test : tâche 11.
4. **Métier visé de la roadmap disparu des données** (cible stockée inconnue) : la roadmap s'affiche, la cible repasse à « aucun », et un message le dit. Test : tâche 10 (`RoadmapProvider` avec une cible inconnue).
5. **Navigation clavier dans le plan quand des filtres atténuent des stations** : les stations atténuées restent focusables, et leur `aria-label` dit « hors filtre ». Test : tâche 12.

---

## Structure des fichiers

```
index.html, package.json, vite.config.ts, tsconfig*.json, eslint.config.js, .prettierrc, components.json, .nvmrc
playwright.config.ts, tests-e2e/*.spec.ts, .github/workflows/pages.yml
src/
  main.tsx                     polices, CSS, RouterProvider
  routes.tsx                   createHashRouter, routes
  styles/tokens.css            copie exacte de maquette/design-system/tokens.css
  styles/index.css             Tailwind, @theme, variables shadcn, base
  styles/impression.css        @media print de la roadmap
  lib/utils.ts                 cn()
  test/setup.ts                jest-dom, nettoyage localStorage
  donnees/types.ts             types de metiers.json et plan.json
  donnees/index.ts             accès unique aux données
  donnees/plan.json            copie de maquette/plan.json
  logique/stockage.ts          lecture / écriture protégées
  logique/quiz.ts              scores, classement, départage, état persistant
  logique/salaires.ts          règles d'affichage des salaires
  logique/roadmap.ts           état et opérations de la roadmap
  logique/echange.ts           export / import JSON
  logique/filtres.ts           filtres du plan et de la liste
  etat/QuizContext.tsx, etat/RoadmapContext.tsx, etat/FiltresContext.tsx
  components/ui/*.tsx          primitives shadcn restylées
  components/Champ.tsx         libellé + aide + erreur autour d'un champ
  components/metier/*.tsx      BarreNavigation, PastilleLigne, Station, BadgeFiabilite, BadgeType,
                               PlageSalaire, CartoucheSilkhom, CartoucheApec, ItemRoadmap
  pages/Layout.tsx             barre, bandeau stockage, <main id="contenu">, focus et titre
  pages/usePageTitre.ts
  pages/plan/PlanPage.tsx, PlanSvg.tsx, Filtres.tsx, EncartQuiz.tsx
  pages/ListePage.tsx
  pages/FichePage.tsx
  pages/quiz/QuizPage.tsx, Question.tsx, Departage.tsx, Resultat.tsx
  pages/roadmap/RoadmapPage.tsx, ChoixCible.tsx, Annee.tsx, DialogItem.tsx, Competences.tsx, ActionsRoadmap.tsx
  pages/SourcesPage.tsx
```

Les tests unitaires sont à côté du code (`x.test.ts(x)`).

---

### Task 1 : Socle Vite + TypeScript + Tailwind + tokens + Vitest

**Files :**
- Create : `package.json`, `.nvmrc` (`24`), `index.html`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `eslint.config.js`, `.prettierrc`, `components.json`, `src/main.tsx`, `src/styles/tokens.css`, `src/styles/index.css`, `src/lib/utils.ts`, `src/test/setup.ts`, `src/vite-env.d.ts`
- Modify : `.gitignore` (ajouter `node_modules/`, `dist/`, `test-results/`, `playwright-report/`, `coverage/`)
- Test : `src/styles/tokens.test.ts`, `src/styles/index.test.ts`

**Interfaces :**
- Produces : alias `@/` → `src/` ; `cn(...classes: ClassValue[]): string` dans `src/lib/utils.ts` ; scripts npm `dev`, `build` (`tsc -b && vite build`), `preview`, `test` (`vitest run`), `test:watch`, `lint` (`eslint .`), `e2e` (`playwright test`, ajouté à la tâche 17).

- [ ] **Step 1 : Installer les dépendances** (dernières versions stables)

```bash
npm init -y
npm i react react-dom react-router lucide-react clsx tailwind-merge class-variance-authority @fontsource/atkinson-hyperlegible @fontsource-variable/bricolage-grotesque @fontsource/jetbrains-mono
npm i -D vite @vitejs/plugin-react typescript @types/react @types/react-dom @types/node tailwindcss @tailwindcss/vite vitest jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom eslint @eslint/js typescript-eslint eslint-plugin-react-hooks eslint-plugin-react-refresh globals prettier
```

Dans `package.json` : `"type": "module"`, `"private": true`, `"name": "constellation"`.

- [ ] **Step 2 : Écrire les tests qui échouent**

`src/styles/tokens.test.ts` : `tokens.css est une copie exacte du design system`. Il lit `src/styles/tokens.css` et `maquette/design-system/tokens.css` avec `fs` et vérifie `expect(copie).toBe(original)`.

`src/styles/index.test.ts` : `index.css déclare les polices auto-hébergées`. Il lit `src/styles/index.css` et vérifie qu'il ne contient pas `fonts.googleapis.com` et qu'il définit `--font-display` avec `"Bricolage Grotesque Variable"`.

- [ ] **Step 3 : Lancer** `npx vitest run src/styles` → échec (fichiers absents).

- [ ] **Step 4 : Mettre en place le socle**
  - `cp maquette/design-system/tokens.css src/styles/tokens.css`.
  - `vite.config.ts` : `base: '/constellation/'`, plugins `react()` et `tailwindcss()`, alias `@` → `./src`, bloc `test: { environment: 'jsdom', setupFiles: ['src/test/setup.ts'], include: ['src/**/*.test.{ts,tsx}'], css: false }` (référence de type `vitest/config`).
  - `tsconfig.app.json` : `strict`, `resolveJsonModule`, `paths: { "@/*": ["./src/*"] }`, `types: ["vitest/globals", "@testing-library/jest-dom"]`.
  - `index.html` : `<html lang="fr">`, `<title>constellation</title>`, `<meta name="viewport" content="width=device-width, initial-scale=1">`, `<meta name="color-scheme" content="dark">`, `<div id="root">`.
  - `src/styles/index.css`, dans l'ordre :
    - `@import "tailwindcss";` puis `@import "./tokens.css";` ;
    - `:root { --font-display: "Bricolage Grotesque Variable", "Atkinson Hyperlegible", system-ui, sans-serif; }`, car le paquet variable expose ce nom de famille (piège à noter dans QUIRKS) ;
    - variables shadcn mappées sur les tokens : `--background: var(--fond)`, `--foreground: var(--encre)`, `--card` et `--popover: var(--surface)`, `--card-foreground` et `--popover-foreground: var(--encre)`, `--primary: var(--primaire)`, `--primary-foreground: var(--sur-primaire)`, `--secondary`, `--muted` et `--accent: var(--surface-muted)`, `--secondary-foreground` et `--accent-foreground: var(--encre)`, `--muted-foreground: var(--encre-douce)`, `--destructive: var(--danger)`, `--border: var(--trait)`, `--input: var(--trait-fort)`, `--ring: var(--focus)`, `--radius: var(--rayon-md)` ;
    - `@theme inline` qui expose `--color-<token>` pour `fond`, `surface`, `surface-muted`, `trait`, `trait-fort`, `encre`, `encre-douce`, `primaire`, `primaire-survol`, `sur-primaire`, `focus`, les 4 états et leurs `-doux`, les 8 `ligne-<id>` et leur `-pastel`, et les 17 `cat-<id>` ; plus `--color-background` et les autres couleurs shadcn, `--font-display`, `--font-sans`, `--font-mono`, `--radius-sm` / `--radius-md` / `--radius-lg` vers les `--rayon-*`, `--shadow-carte` / `--shadow-flottante` ;
    - base : `body { background: var(--fond); color: var(--encre); font-family: var(--font-sans); font-size: 17px; line-height: 26px; }`, `:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; }`, `@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation: none !important; transition: none !important; } }`.
  - `src/main.tsx` : importe `@fontsource/atkinson-hyperlegible/400.css`, `/700.css`, `/400-italic.css`, `@fontsource-variable/bricolage-grotesque`, `@fontsource/jetbrains-mono/400.css`, `/500.css`, `/600.css`, puis `./styles/index.css`. Il rend provisoirement `<h1>constellation</h1>` (remplacé à la tâche 10).
  - `src/test/setup.ts` : `import '@testing-library/jest-dom/vitest'` ; `afterEach(() => { cleanup(); localStorage.clear(); })`.
  - `components.json` (shadcn) : `style: "new-york"`, `tsx: true`, `rsc: false`, `tailwind: { config: "", css: "src/styles/index.css", baseColor: "neutral", cssVariables: true }`, `aliases: { components: "@/components", ui: "@/components/ui", lib: "@/lib", utils: "@/lib/utils", hooks: "@/hooks" }`, `iconLibrary: "lucide"`.
  - ESLint : config plate recommandée `typescript-eslint` + `react-hooks` + `react-refresh`, qui ignore `dist`, `maquette`, `recherche`, `coverage`, `playwright-report`.

- [ ] **Step 5 : Vérifier**
  - `npm test` → PASS ;
  - `npm run lint` → 0 erreur ;
  - `npm run build` → `dist/index.html` référence `/constellation/assets/…` ;
  - `grep -r googleapis dist/` → vide.

- [ ] **Step 6 : Commit** — `git add -A && git commit -m "Socle : Vite, TypeScript, Tailwind, tokens et polices embarquées"`

---

### Task 2 : Données — alignement de `meta`, module d'accès, `plan.json`

**Files :**
- Modify : `metiers.json` (par script, `meta.unites.silkhom` et `meta.mentions`, textes ci-dessous)
- Create : `src/donnees/types.ts`, `src/donnees/index.ts`, `src/donnees/plan.json` (copie de `maquette/plan.json`)
- Test : `src/donnees/donnees.test.ts`

**Interfaces :**
- Produces (`src/donnees/types.ts`) :
  - `LigneId` (8 ids, ordre de `macro_branches`), `Zone`, `TypeMetier = 'entree' | 'evolution'`, `Fiabilite = 'bonne' | 'moyenne' | 'faible'`, `Fourchette`, `NiveauSilkhom`, `GrilleSilkhom`, `Rapprochement`, `Silkhom`, `ValeursApec`, `Apec` : comme `maquette/design-system/components/index.d.ts`, sauf `ValeursApec.d1/d9` facultatifs.
  - `Metier { id, categorie, titre, type, depuis: string[], rome: string | null, brief, missions: string, competences: string[], a_eviter_si: string, parcours: string, salaires: { silkhom: Silkhom | null; apec: Apec | null }, fiabilite: Fiabilite, fiabilite_note: string | null, source_texte: 'cigref' | 'redaction', source_texte_detail: string, voisins_meme_categorie: string[], voisins_autres_categories: string[], roadmap_url: string | null }`
  - `Categorie { id, libelle, nb }`, `Ligne { id: LigneId; num: number; libelle: string; categories: string[] }`, `Question { id, intitule, reponses: { id: string; texte: string; poids: Partial<Record<LigneId, number>> }[] }`, `Source { id, titre, editeur, date, url, usage, licence }`
  - `PlanQuartier { cat, libelle, d, x, y, xf, yf, lx, ly, la: 'start' | 'middle' | 'end' }`, `PlanLigne { id: LigneId; num; nom; couleur; fond; d; terminus: [number, number]; quartiers: PlanQuartier[] }`, `PlanStation { x, y, titre, type: TypeMetier, cat, ligne: LigneId, couleur, voisins: string[] }`, `Plan { lignes: PlanLigne[]; stations: Record<string, PlanStation> }`
- Produces (`src/donnees/index.ts`) :
  - `metiers: Metier[]` ; `metierParId(id: string): Metier | undefined` ; `categorieParId(id: string): Categorie | undefined` ;
  - `lignes: Ligne[]` (`num` = rang 1..8 dans `macro_branches`) ; `ligneParId(id: LigneId): Ligne` ; `ligneDuMetier(m: Metier): LigneId` ;
  - `questions: Question[]` ; `sources: Source[]` ; `meta: { version: string; genere_le: string; mentions: string }` ;
  - `plan: Plan` ; `stationsDeLigne(id: LigneId): string[]` (ids dans l'ordre d'insertion de `plan.stations`, c'est-à-dire l'ordre du tracé) ;
  - `titresDepuis(m: Metier): string[]` (titres des métiers `depuis`, ids inconnus ignorés).

- [ ] **Step 1 : Aligner `meta` par script** (squelette de `docs/CONVENTIONS.md`, « Modification de metiers.json », **en remplaçant le chemin en dur par la racine du dépôt courant** : `git rev-parse --show-toplevel`, sinon on modifie le dépôt principal depuis un worktree). Valeurs exactes :
  - `meta.unites.silkhom` = `k€ brut annuel fixe ; tableaux [min, max] ; zones paris / grandes_villes / regions (Dijon = regions) ; fourchettes par années d'expérience dans le poste ; pour un métier d'entrée, la première tranche en régions est la plus proche d'un premier emploi quand elle commence à 0 an ; pour un métier d'évolution, les années comptent l'expérience dans ce poste, après un premier métier ; si la première tranche ne commence pas à 0 an : pas de premier emploi direct, métier accessible après N ans d'expérience (N = annees_min de la première tranche)`
  - dans `meta.mentions`, remplacer `dans les grilles Silkhom seule la première tranche en régions, quand elle commence à 0 an, approche un premier emploi ; les autres métiers ne s'ouvrent qu'après quelques années d'expérience.` par `dans les grilles Silkhom, seule la première tranche en régions d'un métier d'entrée, quand elle commence à 0 an, approche un premier emploi ; les métiers d'évolution et les autres ne s'ouvrent qu'après quelques années d'expérience.` (texte validé par Adrien le 05/11/2026).

  Le script fait `assert ancien in d["meta"]["mentions"]` avant le remplacement.

- [ ] **Step 2 : Vérifier les données**
  - `python3 scripts/valider.py metiers.json` → code 0 ;
  - `python3 -m unittest discover -s tests -t .` → 56 tests OK ;
  - `git diff --stat metiers.json` → 1 fichier ; pas de saut de ligne final (`tail -c1 metiers.json | xxd` ≠ `0a`).

- [ ] **Step 3 : Écrire les tests qui échouent** (`src/donnees/donnees.test.ts`)
  - `plan.json est une copie exacte de la maquette` : contenu de `src/donnees/plan.json` === `maquette/plan.json`.
  - `68 métiers, 17 catégories, 8 lignes, 16 questions, 6 sources`.
  - `chaque métier a une station de même ligne et de même type` : pour chaque `m`, `plan.stations[m.id]` existe, `.ligne === ligneDuMetier(m)`, `.type === m.type`, `.cat === m.categorie` ; et `Object.keys(plan.stations).length === 68`.
  - `les lignes suivent l'ordre de macro_branches` : `lignes.map(l => l.id)` = `['developpement','infra-cloud','cybersecurite','data-ia','qualite-archi','produit-design','relation-transmission','management']`, `num` 1 à 8.
  - `titresDepuis(mlops)` = `['Ingénieur·e DevOps', 'Data engineer', 'Ingénieur·e machine learning']`.
  - `stationsDeLigne('developpement')` commence par `['dev-legacy-cobol', 'dev-rust-systeme', 'dev-backend']`.
  - `metierParId('inconnu')` → `undefined`.

- [ ] **Step 4 : Lancer** `npx vitest run src/donnees` → échec.

- [ ] **Step 5 : Implémenter** : `cp maquette/plan.json src/donnees/plan.json`, `types.ts`, `index.ts`. `metiers.json` est importé par `import brut from '../../metiers.json'` puis typé par `as unknown as Donnees`.

- [ ] **Step 6 : Lancer** `npm test` → PASS.

- [ ] **Step 7 : Commit** — `git commit -m "Données : module d'accès typé, plan.json, meta alignée sur la règle premier emploi"`

---

### Task 3 : Stockage protégé

**Files :**
- Create : `src/logique/stockage.ts`
- Test : `src/logique/stockage.test.ts`

**Interfaces :**
- Produces :
  - `CLES = { quiz: 'constellation.quiz.v1', roadmap: 'constellation.roadmap.v1' } as const` ;
  - `stockageDisponible(): boolean` (écrit puis efface `constellation.sonde`) ;
  - `lire<T>(cle: string, valider: (v: unknown) => v is T): T | null` ;
  - `ecrire(cle: string, valeur: unknown): boolean`.

- [ ] **Step 1 : Écrire les tests qui échouent**
  - `lire renvoie null si la clé est absente`.
  - `écrire puis lire rend la valeur` : un validateur trivial, valeur `{ version: 1 }`.
  - `lire renvoie null sur un JSON illisible et laisse la valeur en place` : `localStorage.setItem(k, '{pas du json')` → `null`, puis `getItem(k)` vaut toujours `'{pas du json'`.
  - `lire renvoie null si le validateur refuse, sans effacer`.
  - `lire et écrire ne lèvent pas si le stockage jette` : `vi.spyOn(Storage.prototype, 'getItem' | 'setItem').mockImplementation(() => { throw new Error('SecurityError') })` → `lire` = `null`, `ecrire` = `false`.
  - `stockageDisponible est faux si setItem jette, vrai sinon`, et ne laisse pas `constellation.sonde`.

- [ ] **Step 2 : Lancer** `npx vitest run src/logique/stockage` → échec.
- [ ] **Step 3 : Implémenter** (`try/catch` autour de chaque accès à `localStorage` ; l'accès à `window.localStorage` lui-même peut jeter).
- [ ] **Step 4 : Lancer** → PASS.
- [ ] **Step 5 : Commit** — `"Stockage : lecture et écriture protégées du localStorage"`

---

### Task 4 : Logique du quiz (scores, classement, départage)

**Files :**
- Create : `src/logique/quiz.ts`
- Test : `src/logique/quiz.test.ts`

**Interfaces :**
- Consumes : `questions`, `lignes`, `LigneId` (tâche 2).
- Produces :
  - `type Reponses = Record<string, string>` ;
  - `calculerScores(questions: Question[], reponses: Reponses): Record<LigneId, number>` ;
  - `interface Classement { qualifiees: LigneId[]; aDepartager: LigneId[]; places: number }` ;
  - `classer(scores: Record<LigneId, number>, ordre: LigneId[]): Classement` ;
  - `top3(c: Classement, departage: LigneId[]): LigneId[] | null` ;
  - `interface EtatQuiz { version: 1; reponses: Reponses; question: number; departage: LigneId[]; termine: boolean }` ;
  - `etatQuizInitial(): EtatQuiz` ; `estEtatQuiz(v: unknown): v is EtatQuiz` ;
  - `quizComplet(questions: Question[], reponses: Reponses): boolean`.

Algorithme de `classer` (décision d'Adrien, 05/11/2026), à suivre exactement :

```
tri = ordre trié par score décroissant, à score égal par rang dans `ordre`
s3 = score de tri[2]
qualifiees = éléments de tri dont score > s3          (déjà dans l'ordre de tri)
candidats  = éléments de `ordre` dont score == s3      (dans l'ordre des lignes)
places = 3 - qualifiees.length
si candidats.length == places : qualifiees += candidats ; aDepartager = [] ; places = 0
sinon : aDepartager = candidats
```

`top3(c, departage)` : si `c.aDepartager` est vide, renvoie `c.qualifiees`. Sinon, garde de `departage` les ids présents dans `c.aDepartager`, sans doublon. S'il en reste exactement `c.places`, renvoie `[...c.qualifiees, ...ces ids triés dans l'ordre des lignes]` ; sinon `null`.

- [ ] **Step 1 : Écrire les tests qui échouent** (valeurs calculées sur le vrai `metiers.json`)
  - `scores pour toutes les réponses a` : `calculerScores(questions, {q01:'a',…,q16:'a'})` = `{developpement:6, 'infra-cloud':1, cybersecurite:2, 'data-ia':3, 'qualite-archi':6, 'produit-design':6, 'relation-transmission':8, management:3}`.
  - `toutes b : pas d'égalité` : `top3(classer(...), [])` = `['infra-cloud','management','developpement']` (scores 8, 7, 6 puis 5).
  - `toutes c : égalité à l'intérieur du top 3 tranchée par l'ordre des lignes` : `['qualite-archi','cybersecurite','produit-design']` (9, 8, 8), `aDepartager` vide.
  - `toutes a : départage de 2 places parmi 3` : `qualifiees = ['relation-transmission']`, `aDepartager = ['developpement','qualite-archi','produit-design']`, `places = 2` ; `top3(c, [])` = `null` ; `top3(c, ['produit-design','developpement'])` = `['relation-transmission','developpement','produit-design']` ; `top3(c, ['management','developpement'])` = `null`.
  - `départage d'une place` (scores synthétiques) : `{developpement:10,'infra-cloud':8,cybersecurite:6,'data-ia':6, autres 0}` → `qualifiees ['developpement','infra-cloud']`, `aDepartager ['cybersecurite','data-ia']`, `places 1`.
  - `ignore les réponses inconnues` (Review Focus 1) : `calculerScores(questions, { q01: 'z', q99: 'a' })` → tous les scores à 0, sans exception.
  - `estEtatQuiz` : accepte `etatQuizInitial()` ; refuse `null`, `{version: 2}`, un `reponses` non objet, un `departage` contenant un id inconnu.
  - `quizComplet` : faux s'il manque `q16`, vrai avec 16 réponses valides.

- [ ] **Step 2 : Lancer** `npx vitest run src/logique/quiz` → échec.
- [ ] **Step 3 : Implémenter.**
- [ ] **Step 4 : Lancer** → PASS.
- [ ] **Step 5 : Commit** — `"Quiz : scores, top 3 et départage des égalités"`

---

### Task 5 : Logique des salaires

**Files :**
- Create : `src/logique/salaires.ts`
- Test : `src/logique/salaires.test.ts`

**Interfaces :**
- Consumes : types `Silkhom`, `Apec`, `NiveauSilkhom`, `Zone`, `TypeMetier` ; `metierParId`, `titresDepuis` (tâche 2).
- Produces (portage à l'identique de `bundle.js`, lignes 258–380) :
  - `ZONES: { value: Zone; label: string }[]` = Paris / Grandes villes / Régions (Dijon) ;
  - `ZONE_PAR_DEFAUT: Zone = 'regions'` ;
  - `keur(n: number | null): string` ;
  - `fourchette(p: Fourchette | null): string` ;
  - `libelleTranche(n: NiveauSilkhom): string` ;
  - `listeFr(xs: string[]): string` ;
  - `echelleSilkhom(s: Silkhom): [number, number]` ;
  - `badgePremierEmploi(indexTranche: number, premiere: NiveauSilkhom, zone: Zone, type: TypeMetier): boolean` ;
  - `avertissementSilkhom(s: Silkhom, type: TypeMetier, depuisTitres: string[]): { variante: 'attention' | 'neutre'; texte: string } | null` ;
  - `echelleApec(a: Apec): [number, number]` (bornes de la réglette : `floor(d1/10)*10-10`, `ceil(d9/10)*10+10`) ;
  - `kApec(x: number | null | undefined): string` (`'55 k€'` ou `'n.d.'`).

- [ ] **Step 1 : Écrire les tests qui échouent**
  - `keur(52.8)` = `'52,8 k€'` ; `keur(null)` = `'n.d.'` ; `fourchette([30,35])` = `'30 – 35 k€'` (espaces + tiret demi-cadratin) ; `fourchette(null)` = `'n.d.'`.
  - `libelleTranche` : `{0,2}` → `'0–2 ans'` ; `{6,null}` → `'6 ans et plus'` ; `{15,null}` → `'15 ans et plus'`.
  - `listeFr(['A'])` = `'A'` ; `listeFr(['A','B','C'])` = `'A, B ou C'`.
  - **dev-backend** (entrée, 5 profils Java / Python / PHP / Net / Backend JS, 1re tranche 0–2 ans, Régions `[30,35]` pour Java) :
    - `badgePremierEmploi(0, premiere, 'regions', 'entree')` vrai ;
    - le même en `'paris'` → faux ; `indexTranche` 1 → faux ;
    - `avertissementSilkhom` → `null` ;
    - `keur(moyenne_keur)` → `'n.d.'`.
  - **dsi** (évolution, 1re tranche à 6 ans) : `avertissementSilkhom(...)` = `{ variante: 'attention', texte: 'Pas de premier emploi direct : métier accessible après 6 ans d’expérience.' }` ; `libelleTranche` des deux tranches = `['6 ans et plus', '15 ans et plus']` ; badge faux partout.
  - **mlops** (évolution, 0–3 ans) : `avertissementSilkhom(s, 'evolution', titresDepuis(mlops))` = `{ variante: 'neutre', texte: 'Métier d’évolution : les années comptent l’expérience dans ce poste, après un premier métier (Ingénieur·e DevOps, Data engineer ou Ingénieur·e machine learning).' }` ; `badgePremierEmploi(0, …, 'regions', 'evolution')` faux.
  - **integrateur-web** : `silkhom.rapprochement.de` = `'Développeur Frontend'` ; tranches `['0–2 ans','2–5 ans','5 ans et plus']` ; `apec` null.
  - **technicien-support** : entrée, badge vrai en Régions, `apec` null, `keur(33.1)` = `'33,1 k€'`.
  - `aucune fiche ne produit d'étiquette de niveau` : pour les 68 métiers et toutes leurs tranches, `libelleTranche(n)` correspond à `/^\d+(–\d+)? ans( et plus)?$/` et ne contient ni `junior`, ni `confirm`, ni `senior`, ni `expert`.
  - `echelleSilkhom(dev-backend)` = `[min arrondi aux 5 inférieurs − 5, max arrondi aux 5 supérieurs]` sur toutes les zones et tous les profils (valeur calculée dans le test à partir des données, et vérifiée < min et ≥ max).
  - `kApec(undefined)` = `'n.d.'` (dev-backend `moins_35_ans.d1` absent).

- [ ] **Step 2 : Lancer** → échec.
- [ ] **Step 3 : Implémenter** en recopiant la logique de `bundle.js` (`keur`, `fourchette`, `libelleTranche`, `listeFr`, calcul d'`echelle`, condition du badge, `avertissement`), avec les apostrophes `’` des textes.
- [ ] **Step 4 : Lancer** → PASS.
- [ ] **Step 5 : Commit** — `"Salaires : règles d'affichage portées du design system"`

---

### Task 6 : Logique de la roadmap et échange JSON

**Files :**
- Create : `src/logique/roadmap.ts`, `src/logique/echange.ts`
- Test : `src/logique/roadmap.test.ts`, `src/logique/echange.test.ts`

**Interfaces :**
- Produces (`roadmap.ts`) :
  - `ANNEES = [2027, 2028, 2029, 2030, 2031] as const` ; `type Annee = typeof ANNEES[number]` ;
  - `type TypeItem = 'projet' | 'notion'` ;
  - `interface Item { id: string; type: TypeItem; titre: string; url: string; note: string }` ; `type Brouillon = Omit<Item, 'id'>` ;
  - `interface EtatRoadmap { version: 1; cible: string | null; annees: Record<\`${Annee}\`, Item[]>; modifie_le: string | null }` ;
  - `roadmapVide(): EtatRoadmap` ;
  - `nouvelId(): string` (`crypto.randomUUID` s'il existe, sinon `Date.now().toString(36) + Math.random().toString(36).slice(2)`) ;
  - `ajouterItem(e, annee: Annee, b: Brouillon, id?: string): EtatRoadmap` ; `modifierItem(e, annee, id, b): EtatRoadmap` ; `supprimerItem(e, annee, id): EtatRoadmap` ;
  - `deplacerItem(e, annee, de: number, vers: number): EtatRoadmap` (sans effet hors bornes) ;
  - `choisirCible(e, id: string | null): EtatRoadmap` ;
  - `estVide(e): boolean` (aucun item **et** cible null) ; `nbItems(e): number` ;
  - `validerBrouillon(b: Brouillon): { titre?: string; url?: string }` ;
  - `estEtatRoadmap(v: unknown): v is EtatRoadmap`.

  Toutes ces fonctions sont pures : elles ne touchent pas à `modifie_le`, que le contexte pose à l'écriture.
- Produces (`echange.ts`) :
  - `FORMAT = 'constellation-roadmap'` ;
  - `exporterRoadmap(e: EtatRoadmap, maintenant: Date): { nom: string; contenu: string }` ;
  - `type ResultatImport = { ok: true; roadmap: EtatRoadmap; cibleInconnue: boolean } | { ok: false; erreur: string }` ;
  - `importerRoadmap(texte: string, idsMetiers: ReadonlySet<string>): ResultatImport`.

Messages exacts :

| Cas | Texte |
|---|---|
| Titre vide (après `trim`) | `Donne un titre à cet élément.` |
| URL non vide, sans `http://` ni `https://` | `L’adresse doit commencer par http:// ou https://.` |
| JSON illisible | `Ce fichier n’est pas un JSON lisible.` |
| `format` absent ou différent | `Ce fichier n’est pas une roadmap constellation.` |
| `version` ≠ 1 | `Cette roadmap vient d’une version de constellation que l’app ne connaît pas (version ${v}).` |
| Année hors 2027–2031 | `L’année ${a} n’est pas dans la grille 2027 → 2031.` |
| Item mal formé | `L’élément n° ${k} de ${a} est incomplet : il lui faut un type (projet ou notion) et un titre.` |

- [ ] **Step 1 : Écrire les tests qui échouent** (`roadmap.test.ts`)
  - `roadmapVide` : 5 années vides, `cible` null, `estVide` vrai.
  - `ajouter / modifier / supprimer` : ajout de 2 items en 2027 (ids `'a'`, `'b'`), modification du titre de `'a'`, suppression de `'b'` ; l'état d'entrée n'est pas muté (`Object.isFrozen` ou comparaison à une copie).
  - `deplacerItem` : `[a,b,c]`, `(0→2)` → `[b,c,a]` ; `(0→-1)` → inchangé ; `(2→3)` → inchangé.
  - `choisirCible` change la cible sans toucher aux items.
  - `validerBrouillon` : `{titre:'  '}` → erreur titre ; `{url:'symfony.com'}` → erreur url ; `{url:''}` et `{url:'https://x.fr'}` → pas d'erreur url.
  - `estEtatRoadmap` refuse une année manquante et un item sans `type`.

- [ ] **Step 2 : Écrire les tests qui échouent** (`echange.test.ts`)
  - `export` : `nom` = `'constellation-roadmap-2027-05-28.json'` pour `new Date('2027-05-28T10:00:00')` ; `JSON.parse(contenu)` contient `format`, `version: 1`, `exporte_le`, `cible`, `annees`.
  - `aller-retour` : `importerRoadmap(exporterRoadmap(e).contenu, ids)` → `ok`, `roadmap.annees` égal à celui de `e`.
  - Erreurs : chacun des 5 messages d'import du tableau, sur un fichier construit pour le cas.
  - **Cas tolérants** (Review Focus 2) :
    - item sans `id` → importé avec un id non vide ;
    - item sans `url` ni `note` → importé avec `''` ;
    - champ inconnu en plus → ignoré ;
    - année absente du fichier → année vide ;
    - `titre` avec espaces autour → gardé tel quel.
  - `cible inconnue` : `cible: 'metier-disparu'` → `ok`, `roadmap.cible === null`, `cibleInconnue === true`.

- [ ] **Step 3 : Lancer** `npx vitest run src/logique/roadmap src/logique/echange` → échec.
- [ ] **Step 4 : Implémenter.**
- [ ] **Step 5 : Lancer** → PASS.
- [ ] **Step 6 : Commit** — `"Roadmap : opérations pures, validation, export et import JSON"`

---

### Task 7 : Primitives shadcn restylées et `Champ`

**Files :**
- Create : `src/components/ui/{button,badge,card,tabs,toggle-group,toggle,input,textarea,select,radio-group,alert,tooltip,dialog,table,progress,label}.tsx` (via la CLI), `src/components/Champ.tsx`
- Test : `src/components/ui/primitives.test.tsx`, `src/components/Champ.test.tsx`

**Interfaces :**
- Produces : les API shadcn standard (composition : `Tabs/TabsList/TabsTrigger/TabsContent`, `Dialog/DialogContent/DialogTitle/DialogDescription/DialogFooter`, etc.), avec ces variantes ajoutées :
  - `Button` : `variant` ∈ `default | secondary | outline | ghost | link` ; `size` ∈ `default | sm | lg | icon` ;
  - `Badge` : `variant` ∈ `default | secondary | outline | succes | attention | danger | neutre` ;
  - `Alert` : `variant` ∈ `info | attention | neutre`.
  - `Champ({ label: ReactNode; aide?: ReactNode; erreur?: string; facultatif?: boolean; children: (props: { id: string; 'aria-describedby'?: string; 'aria-invalid'?: boolean }) => ReactNode })` : rend le `<Label>`, la mention « facultatif », l'aide et l'erreur (`role="alert"` absent : l'erreur est liée par `aria-describedby`).

- [ ] **Step 1 : Générer** `npx shadcn@latest add button badge card tabs toggle-group input textarea select radio-group alert tooltip dialog table progress label`. Vérifier ensuite que la CLI n'a pas réécrit les variables de `src/styles/index.css`, et rétablir le mapping de la tâche 1 si besoin.
- [ ] **Step 2 : Écrire les tests qui échouent** (`primitives.test.tsx`)
  - `Button par défaut est en primaire` : sa classe contient `bg-primary`.
  - `Badge succes affiche son texte`.
  - `Alert attention a role="alert" seulement si demandé` : `role` par défaut absent.
  - `ToggleGroup en liens` : un `ToggleGroup` dont les items sont des `<a href>` (pattern `asChild` de la bascule Graphe / Liste) rend 2 liens, dont un `aria-current="page"`.
  - `Champ relie l'aide et l'erreur` : `getByLabelText('Titre')` a un `aria-describedby` qui pointe vers l'aide et l'erreur, et `aria-invalid="true"` quand une erreur est fournie.
- [ ] **Step 3 : Lancer** → échec.
- [ ] **Step 4 : Restyler** chaque primitive pour reproduire `maquette/design-system/components/bundle.css` (classes `cs-btn*`, `cs-badge*`, `cs-card`, `cs-tabs`, `cs-toggle`, `cs-champ`, `cs-radio-carte`, `cs-alert*`, `cs-tooltip`, `cs-dialog`, `cs-table`, `cs-progress`) : tailles, rayons, ombres, hauteurs minimales 44 px, états survol / focus / désactivé. Écrire `Champ`. Mettre les textes Radix accessibles en français (par exemple « Fermer » sur le bouton de fermeture du Dialog).
- [ ] **Step 5 : Lancer** → PASS. Le contrôle visuel se fait contre les aperçus `maquette/design-system/components/*/preview.html`, une fois les primitives montées dans les pages (tâches 10 à 15).
- [ ] **Step 6 : Commit** — `"Composants : primitives shadcn aux couleurs de constellation"`

---

### Task 8 : Composants métier de base

**Files :**
- Create : `src/components/metier/{BarreNavigation,PastilleLigne,Station,BadgeFiabilite,BadgeType,PlageSalaire,ItemRoadmap,Logo}.tsx`
- Test : `src/components/metier/base.test.tsx`

**Interfaces :**
- Consumes : `ligneParId`, `LigneId` (tâche 2), primitives (tâche 7).
- Produces (props de `index.d.ts`, adaptées) :
  - `BarreNavigation({ actif: 'nuage' | 'quiz' | 'roadmap' | 'sources' | null })` : liens via `react-router` `<Link>` vers `/`, `/quiz`, `/roadmap`, `/sources`, libellés `Nuage`, `Quiz`, `Roadmap`, `Sources`, logo `constellation` vers `/`, lien d'évitement `Aller au contenu` vers `#contenu` (il fait `focus()` sur `#contenu` au clic, puisque l'ancre est prise par le routeur) ;
  - `PastilleLigne({ ligne, taille?: 'sm' | 'lg', rang?: 1 | 2 | 3, sansNom?: boolean })` : numéro + nom ; `rang` affiche `1er choix` / `2e choix` / `3e choix` ;
  - `Station({ ligne, categorie?, type, etat?: 'repos' | 'survol' | 'focus' | 'attenue', titre? })` : forme pleine (entrée) ou à anneau (évolution), pour les légendes ;
  - `BadgeFiabilite({ niveau: Fiabilite | 'nd', note?: string | null })` : icône + mot (`Fiabilité bonne`…) ;
  - `BadgeType({ type })` : `Métier d’entrée` / `Métier d’évolution`, avec la forme de station ;
  - `PlageSalaire({ min, max, echelle, couleur? })` ;
  - `ItemRoadmap({ item: Item; premier: boolean; dernier: boolean; onMonter; onDescendre; onModifier; onSupprimer; poignee?: ReactNode })`.

- [ ] **Step 1 : Écrire les tests qui échouent**
  - `BarreNavigation marque la page active` : `actif="quiz"` → le lien `Quiz` a `aria-current="page"`, les autres non ; le lien `Aller au contenu` existe (rendu dans un `MemoryRouter`).
  - `PastilleLigne rang 2` affiche `2` (numéro de ligne) et `2e choix`, et le nom de la ligne.
  - `BadgeType evolution` affiche `Métier d’évolution`.
  - `BadgeFiabilite moyenne` affiche `Fiabilité moyenne` ; `nd` affiche `n.d.`.
  - `ItemRoadmap` : boutons accessibles `Monter « X »`, `Descendre « X »`, `Modifier « X »`, `Supprimer « X »` ; `premier` désactive Monter, `dernier` désactive Descendre ; l'URL s'affiche sans `https://` ; un lien externe a `target="_blank"` et `rel="noopener noreferrer"` ; type `notion` → `Notion à apprendre`.
- [ ] **Step 2 : Lancer** → échec.
- [ ] **Step 3 : Implémenter** en portant `bundle.js` (fonctions homonymes) et `bundle.css`. Icônes `lucide-react` en `aria-hidden` : `ArrowUp`, `ArrowDown`, `Pencil`, `Trash2`, `GripVertical`, `Code`, `BookOpen`, `ShieldCheck` / `ShieldAlert` / `ShieldQuestion` pour la fiabilité (au choix de l'implémenteur, avec mot obligatoire).
- [ ] **Step 4 : Lancer** → PASS.
- [ ] **Step 5 : Commit** — `"Composants métier : navigation, pastilles, stations, badges, item de roadmap"`

---

### Task 9 : Cartouches de salaires

**Files :**
- Create : `src/components/metier/CartoucheSilkhom.tsx`, `src/components/metier/CartoucheApec.tsx`
- Test : `src/components/metier/cartouches.test.tsx`

**Interfaces :**
- Consumes : `src/logique/salaires.ts` (tâche 5), primitives (tâche 7), `PlageSalaire` (tâche 8).
- Produces :
  - `CartoucheSilkhom({ silkhom: Silkhom | null; type: TypeMetier; depuisTitres: string[]; ligne: LigneId; raisonAbsence?: string | null })` ;
  - `CartoucheApec({ apec: Apec | null; raisonAbsence?: string | null })`.

  Structure et textes de `bundle.js` : titre `Salaire cible · Silkhom` / `Salaire cible · Apec` ; sous-titres ; ToggleGroup `Zone géographique` ; `Tabs` `Profil Silkhom` si plusieurs grilles ; tableau avec caption masquée ; `Moyenne relevée par Silkhom : …` ; `Données du profil Silkhom « … » : raison` ; mention Apec ; médiane + famille ; réglette ; tableau Île-de-France / Autres régions / Moins de 35 ans ; `Données de la famille Apec « … » : raison` ; `Pas de donnée Apec pour ce métier.` + `Pourquoi : …` ; sources.

- [ ] **Step 1 : Écrire les tests qui échouent** (données réelles via `metierParId`)
  - **dev-backend** :
    - 5 onglets `Java`, `Python`, `PHP`, `Net`, `Backend JS` ;
    - `Régions (Dijon)` sélectionné ;
    - texte `La plus proche d’un premier emploi` présent une fois dans l'onglet actif ;
    - après clic sur `Paris` → absent ;
    - aucun texte `junior|confirmé|senior|expert` (insensible à la casse) ;
    - `Moyenne relevée par Silkhom : n.d.` ;
    - Apec : `Médiane des cadres, toutes expériences, pas un salaire d’embauche.`, `50 k€`, `famille « Développement informatique »`, ligne `Moins de 35 ans` avec `44 k€` et deux `n.d.`.
  - **dsi** : `Pas de premier emploi direct : métier accessible après 6 ans d’expérience.` ; `6 ans et plus` et `15 ans et plus` ; pas de badge premier emploi, y compris en Régions.
  - **mlops** : `Métier d’évolution : les années comptent l’expérience dans ce poste, après un premier métier (Ingénieur·e DevOps, Data engineer ou Ingénieur·e machine learning).` ; pas de badge ; Apec `Données de la famille Apec « Big Data » :` suivi de la raison.
  - **integrateur-web** : `Données du profil Silkhom « Développeur Frontend » :` + raison ; Apec `n.d.`, `Pas de donnée Apec pour ce métier.`, `Pourquoi : poste souvent non cadre, donc sans salaire Apec ; …` (raison = `fiabilite_note`).
  - **technicien-support** : badge présent en Régions ; Apec `n.d.`.
  - `les 68 fiches se rendent sans erreur` : boucle sur `metiers` qui rend les deux cartouches.
- [ ] **Step 2 : Lancer** → échec.
- [ ] **Step 3 : Implémenter** (zone en `useState(ZONE_PAR_DEFAUT)`, partagée entre les onglets de profils comme dans `bundle.js`).
- [ ] **Step 4 : Lancer** → PASS.
- [ ] **Step 5 : Commit** — `"Cartouches Silkhom et Apec avec les règles de salaires cibles"`

---

### Task 10 : Coque de l'app — routes, mise en page, états partagés, page Sources

**Files :**
- Create : `src/routes.tsx`, `src/pages/Layout.tsx`, `src/pages/usePageTitre.ts`, `src/etat/QuizContext.tsx`, `src/etat/RoadmapContext.tsx`, `src/etat/FiltresContext.tsx`, `src/logique/filtres.ts`, `src/pages/SourcesPage.tsx`, et des pages provisoires (`<h1>` seul) pour plan, liste, fiche, quiz, roadmap
- Modify : `src/main.tsx` (rend `<RouterProvider router={router} />`)
- Test : `src/etat/etat.test.tsx`, `src/logique/filtres.test.ts`, `src/pages/Layout.test.tsx`, `src/pages/SourcesPage.test.tsx`

**Interfaces :**
- Consumes : stockage (3), quiz (4), roadmap (6), `BarreNavigation` (8).
- Produces :
  - `router` (`createHashRouter`) avec un layout racine et les enfants `/` (`PlanPage`), `/liste`, `/fiche/:id`, `/quiz`, `/roadmap`, `/sources`, et `*` → `<Navigate to="/" replace />` ;
  - `usePageTitre(titre: string): void` : pose `document.title = \`${titre} · constellation\`` ;
  - `useQuiz(): { etat: EtatQuiz; classement: Classement | null; top3: LigneId[] | null; repondre(qid: string, rid: string): void; allerA(i: number): void; terminer(): void; rouvrir(): void; choisirDepartage(ids: LigneId[]): void; refaire(): void }` :
    - `rouvrir` remet `termine` à faux et `question` à 15 (dernière question), réponses conservées ;
    - `classement` est null tant que le quiz n'est pas complet ;
    - `top3` est non null seulement si `termine` et départage résolu ;
    - `repondre` vide `departage` si la réponse change ;
  - `useRoadmap(): { etat: EtatRoadmap; enregistre: boolean; cibleOubliee: boolean; remplacer(e: EtatRoadmap): void; ajouter(a: Annee, b: Brouillon): void; modifier(a: Annee, id: string, b: Brouillon): void; supprimer(a: Annee, id: string): void; deplacer(a: Annee, de: number, vers: number): void; choisirCible(id: string | null): void }` :
    - chaque modification pose `modifie_le` et écrit dans `CLES.roadmap` ;
    - `enregistre` = résultat de la dernière écriture ;
    - au chargement, une cible inconnue de `metierParId` passe à `null` avec `cibleOubliee = true` ;
  - `interface Filtres { categories: string[]; type: 'tous' | TypeMetier }` ; `FILTRES_VIDES` ; `correspondFiltre(m: { categorie: string; type: TypeMetier }, f: Filtres): boolean` (`categories` vide = toutes) ; `useFiltres(): { filtres: Filtres; setFiltres(f: Filtres): void }` (en mémoire seulement) ;
  - `Layout` :
    - `BarreNavigation` (route `actif` déduite du chemin : `/`, `/liste` et `/fiche/*` → `nuage`) ;
    - bandeau si `stockageDisponible()` est faux, texte exact : `Ton navigateur ne garde rien : ton résultat de quiz et ta roadmap seront perdus en fermant l'onglet. Pense à exporter.` (`role="status"`) ;
    - `<main id="contenu" tabIndex={-1}>` + `<Outlet />` ;
    - à chaque changement de `location.pathname` : `window.scrollTo(0, 0)` puis focus du premier `h1` de `main` (`tabIndex = -1` posé à la volée) ;
    - les providers Quiz, Roadmap et Filtres enveloppent l'`Outlet`.

- [ ] **Step 1 : Écrire les tests qui échouent**
  - `filtres.test.ts` :
    - `correspondFiltre` avec `FILTRES_VIDES` → vrai ;
    - `{categories:['backend'], type:'tous'}` → vrai pour `dev-backend`, faux pour `dsi` ;
    - `{categories:[], type:'evolution'}` → faux pour `dev-backend`.
  - `etat.test.tsx` (`renderHook` avec les providers) :
    - le quiz reprend un état stocké `{version:1, reponses:{q01:'a'}, question:1, departage:[], termine:false}` ;
    - `repondre` écrit dans `constellation.quiz.v1` ;
    - toutes les réponses `a` puis `terminer` → `top3` null et `classement.aDepartager` de longueur 3 ; `choisirDepartage(['developpement','qualite-archi'])` → `top3` = `['relation-transmission','developpement','qualite-archi']` ;
    - changer une réponse vide `departage` ;
    - `rouvrir` → `termine` faux, `question` 15, réponses conservées ;
    - `refaire` → `etatQuizInitial()`.
  - `etat.test.tsx` (roadmap) :
    - `ajouter` écrit dans `constellation.roadmap.v1` avec `modifie_le` non null ;
    - setItem qui jette → `enregistre` faux, l'état en mémoire est quand même à jour ;
    - **cible inconnue au chargement** (Review Focus 4) : stockage `{…, cible:'metier-disparu'}` → `etat.cible === null`, `cibleOubliee === true`.
  - `Layout.test.tsx` (`createMemoryRouter` sur les mêmes routes) :
    - `#/sources` → `document.title` = `Sources et mentions · constellation`, et le `h1` a le focus ;
    - route inconnue → page plan ;
    - setItem qui jette → bandeau présent avec le texte exact.
  - `SourcesPage.test.tsx` :
    - affiche `meta.mentions` (texte de la tâche 2) ;
    - un tableau de 6 lignes, colonnes `Source`, `Éditeur`, `Date`, `Ce qu’on en tire`, `Licence` ; chaque titre est un lien vers `url` (`target="_blank"`, `rel="noopener noreferrer"`) ;
    - la phrase `Licence des textes propres à constellation : à décider (CC BY 4.0 proposée).`, qui vient de la constante `LICENCE_TEXTES` exportée par `SourcesPage.tsx` ;
    - `Données relevées le 2026-11-02, version 1.1.`
- [ ] **Step 2 : Lancer** → échec.
- [ ] **Step 3 : Implémenter.** Page Sources : fidèle à `maquette/canevas/sources.dc.html` (titre `Sources et mentions`, surtitre `D’où viennent ces informations`).
- [ ] **Step 4 : Lancer** `npm test` → PASS ; `npm run dev` puis ouvrir `http://localhost:5173/constellation/#/sources` : barre, page et lien d'évitement fonctionnent.
- [ ] **Step 5 : Commit** — `"Coque : routes par ancre, mise en page, états du quiz et de la roadmap, page Sources"`

---

### Task 11 : Fiche métier

**Files :**
- Create : `src/pages/FichePage.tsx`
- Test : `src/pages/FichePage.test.tsx`

**Interfaces :**
- Consumes : `metierParId`, `categorieParId`, `ligneDuMetier`, `titresDepuis` (2), composants (8, 9), `useRoadmap` (10), `usePageTitre` (10).
- Produces : la route `/fiche/:id`.

Structure (référence : `maquette/canevas/fiche-*.dc.html`, M2 `m-fiche.dc.html`) :
- lien `← Retour au plan` ;
- en-tête : `PastilleLigne` + catégorie, `h1` titre, `BadgeType`, `BadgeFiabilite`, `ROME M1855` (ou `ROME n.d.`), brief en chapô ;
- deux colonnes ≥ 1024 px, empilées dessous :
  - gauche : `Missions`, `Compétences` (badges), `À éviter si` avec `Un repère pour réfléchir, pas une règle.`, `Parcours` ;
  - droite : `On y arrive depuis` (si évolution, liens), `Métiers voisins, même catégorie`, `Voisins dans d’autres lignes` (liens avec pastille de ligne), `Voir la roadmap sur roadmap.sh ↗` (si `roadmap_url`), bouton `Viser ce métier dans ma roadmap`, source `Texte : Cigref, nomenclature des profils métiers du SI (2025).` ou `Texte : Rédaction CODA, relue par Adrien Gras.` suivie de `Fiabilité : ${fiabilite_note}.` si la note existe ;
- section `Salaires cibles` : chapeau `Ce que tu peux viser après quelques années, pas un salaire de sortie d’études. Les deux sources ci-dessous ne mesurent pas la même chose : ne les compare pas entre elles.`, `CartoucheSilkhom`, phrase `Ces deux sources ne mesurent pas la même chose : ne les compare pas entre elles.`, `CartoucheApec` (empilés, `raisonAbsence = fiabilite_note`).

`Viser ce métier dans ma roadmap` : si `roadmap.cible` est null ou déjà ce métier → `choisirCible(id)` puis `navigate('/roadmap')`. Sinon, Dialog `Changer de métier visé ?` / `Ta roadmap vise aujourd’hui ${titre actuel}. Tes éléments restent en place.` / boutons `Viser ${titre}` et `Annuler`.

- [ ] **Step 1 : Écrire les tests qui échouent**
  - `dev-backend` :
    - `h1` = `Développeur·se back-end` ; titre du document `Développeur·se back-end · constellation` ;
    - `ROME M1855` ;
    - lien roadmap.sh vers `https://roadmap.sh/backend` ;
    - pas de section `On y arrive depuis` ;
    - la section salaires vient après `Parcours` dans l'ordre du DOM.
  - `dsi` : `On y arrive depuis` avec 3 liens dont l'un mène à `/fiche/cto` ; pas de lien roadmap.sh.
  - `integrateur-web` : `Texte : Rédaction CODA, relue par Adrien Gras.` et `Fiabilité : poste souvent non cadre…`.
  - Voisins : chaque id de `voisins_meme_categorie` et de `voisins_autres_categories` de `dev-backend` donne un lien `/fiche/<id>`.
  - **Introuvable** (Review Focus 3) : `/fiche/inconnu` → `h1` `Métier introuvable`, texte `Ce métier n’existe pas ou plus dans constellation.`, lien `Revenir au plan` vers `/`.
  - Viser : sans cible → la roadmap stockée a `cible: 'dev-backend'` et la route est `/roadmap` ; avec cible `dsi` → Dialog, `Annuler` ne change rien, `Viser Développeur·se back-end` change la cible.
- [ ] **Step 2 : Lancer** → échec.
- [ ] **Step 3 : Implémenter.**
- [ ] **Step 4 : Lancer** → PASS.
- [ ] **Step 5 : Commit** — `"Fiche métier : contenu, repères, salaires cibles et lien vers la roadmap"`

---

### Task 12 : Plan (graphe), filtres et état après le quiz

**Files :**
- Create : `src/pages/plan/PlanPage.tsx`, `src/pages/plan/PlanSvg.tsx`, `src/pages/plan/Filtres.tsx`, `src/pages/plan/EncartQuiz.tsx`
- Test : `src/pages/plan/plan.test.tsx`

**Interfaces :**
- Consumes : `plan`, `lignes`, `categorieParId` (2), `useQuiz`, `useFiltres`, `correspondFiltre` (10), `PastilleLigne`, `Station`, `Tooltip`, `ToggleGroup` (7, 8).
- Produces :
  - `PlanSvg({ filtres: Filtres; top3: LigneId[] | null })` ;
  - `Filtres()` (réutilisé par la liste en tâche 13) : catégories en multi-sélection groupées par ligne, type `Tous` / `Entrée` / `Évolution` ;
  - `EncartQuiz()` (réutilisé en tâche 13) ;
  - `BasculeVue({ actif: 'graphe' | 'liste' })`.

Rendu (valeurs exactes dans `maquette/canevas/Main.dc.html` et `nuage-apres-quiz.dc.html`) :
- `svg viewBox="0 0 1280 720"` à largeur 100 %, `aria-hidden`, avec en couches :
  - quartiers : `path d` en trait `fond` de la ligne, `stroke-width 44`, extrémités rondes ;
  - tracés : `d` en `couleur`, `stroke-width 8` ;
  - noms de quartiers : `text` `lx/ly/la`, 12 px, gras, capitales espacées ;
  - pôle central `TA FORMATION` ;
  - pastilles de terminus (cercle `r 14` + numéro) ;
  - liens voisins de la station active (trait 2 px de la couleur de sa ligne).
- Stations : une couche HTML positionnée en pourcentages au-dessus du SVG (`left = x/1280`, `top = y/720`). Chaque station est un `<Link to="/fiche/id">` de 34 px, avec un `aria-label` de la forme `Développeur·se back-end, Back-end, métier d’entrée, ligne 1 Développement` (+ `, hors filtre` si atténuée). L'ordre DOM suit `stationsDeLigne` pour chaque ligne, lignes dans l'ordre. Au survol ou au focus : `Tooltip` (titre, catégorie, type) et voisins tracés.
- Légende : 8 `PastilleLigne`, formes `Station` entrée / évolution, `Métiers voisins (au survol)`.
- Avant le quiz : encart `Par où commencer ? Le quiz allume tes 3 lignes de départ.` + bouton `Commencer le quiz` (`/quiz`).
- Après le quiz (`top3` non null) :
  - les 3 tracés sont épaissis et lumineux, avec `PastilleLigne rang` ;
  - les 5 autres reçoivent le liseré pointillé, **sans atténuation** ;
  - l'encart dit `Tes 3 lignes de départ sont allumées` / `C’est un point de départ, pas un verdict. Ce matin, choisis 3 métiers dans ta zone d’exploration : les lignes en pointillés (${n} lignes, ${m} métiers).` (n = 5, m = nombre de stations hors top 3) / `Refaire le quiz` (appelle `refaire()` puis va à `/quiz`) ;
  - légende `Zone d’exploration`.
- Lien `Passer à la vue liste` avant le plan.
- Sur écran < 768 px (`matchMedia('(max-width: 767px)')`), au premier rendu de `/` dans la session (drapeau `sessionStorage` protégé), redirection vers `/liste`.
- Page : titre `Le plan des métiers du numérique`, sous-titre `68 métiers sur 8 lignes, qui partent toutes de ta formation. Survole une station pour voir le métier, clique pour ouvrir sa fiche.` ; `usePageTitre('Plan des métiers')`.

- [ ] **Step 1 : Écrire les tests qui échouent**
  - `68 liens de station`, dont `Développeur·se back-end, Back-end, métier d’entrée, ligne 1 Développement` → `/fiche/dev-backend`.
  - `focus d'une station affiche ses voisins` : focus sur dev-backend → 8 éléments `[data-voisin]` dans le SVG ; blur → 0.
  - **filtre catégorie** (Review Focus 5) : filtre `backend` → les 63 autres stations ont `data-attenue="true"`, restent dans l'ordre de tabulation (pas de `tabIndex=-1`) et leur `aria-label` finit par `, hors filtre`.
  - `avant le quiz` : bouton `Commencer le quiz`.
  - `après le quiz` (quiz stocké, réponses toutes `b`, `termine: true`) :
    - texte `Tes 3 lignes de départ sont allumées` ;
    - tracés `infra-cloud`, `management` et `developpement` en `data-etat="top"` ;
    - les 5 autres en `data-etat="exploration"` ;
    - aucune station n'a `data-attenue="true"`.
  - `quiz terminé mais départage non résolu` (toutes `a`) : encart d'avant quiz remplacé par `Ton quiz attend un dernier choix.` + lien `Finir le quiz`.
- [ ] **Step 2 : Lancer** → échec.
- [ ] **Step 3 : Implémenter.**
- [ ] **Step 4 : Lancer** → PASS ; contrôle visuel à 1280 px contre la maquette E1 et E2 (`npm run dev`).
- [ ] **Step 5 : Commit** — `"Plan : stations accessibles, voisins au survol, filtres et lignes du quiz"`

---

### Task 13 : Vue liste

**Files :**
- Create : `src/pages/ListePage.tsx`
- Test : `src/pages/ListePage.test.tsx`

**Interfaces :**
- Consumes : `Filtres`, `EncartQuiz`, `BasculeVue` (12), données (2), `useQuiz`, `useFiltres` (10).

Structure (référence `nuage-liste.dc.html`, mobile `m-nuage.dc.html`) :
- titre `Les 68 métiers, ligne par ligne`, sous-titre `La même chose que le plan, au clavier ou au lecteur d’écran. Chaque nom ouvre la fiche du métier.` ;
- mêmes filtres et même encart que le plan ;
- une section par ligne (`h2` avec `PastilleLigne`), une sous-liste par catégorie (`h3`), chaque métier en lien `/fiche/id` avec `BadgeType` ;
- les métiers hors filtre sont retirés (contrairement au plan), avec un compteur `${n} métiers affichés sur 68` en `aria-live="polite"` ;
- après le quiz, la section de chaque ligne hors top 3 porte la mention `Hors de ton top 3 : zone d’exploration`, et le top 3 sa `PastilleLigne rang`.
- Chaque section de ligne est un `<details>` (comme M1) : ouvert par défaut à partir de 768 px, replié en dessous. Au-dessus des sections, une recherche par titre `Chercher un métier` (filtre texte insensible à la casse et aux accents) ; quand elle est remplie, toutes les sections qui ont un résultat s'ouvrent.

- [ ] **Step 1 : Écrire les tests qui échouent**
  - 68 liens de fiche sans filtre ; 8 `h2` dans l'ordre des lignes ; 17 `h3`.
  - Filtre type `Évolution` → seuls les métiers d'évolution, compteur cohérent avec `metiers.filter(m => m.type === 'evolution').length`.
  - Après le quiz `b` : 5 mentions `Hors de ton top 3 : zone d’exploration`.
  - Recherche `developpeur` trouve `Développeur·se back-end`.
  - Le filtre posé sur la liste est conservé en revenant sur `/` (même `FiltresProvider`).
- [ ] **Step 2 : Lancer** → échec.
- [ ] **Step 3 : Implémenter.**
- [ ] **Step 4 : Lancer** → PASS.
- [ ] **Step 5 : Commit** — `"Vue liste : les 68 métiers par ligne, filtres partagés avec le plan"`

---

### Task 14 : Quiz — questions, départage, résultat

**Files :**
- Create : `src/pages/quiz/QuizPage.tsx`, `Question.tsx`, `Departage.tsx`, `Resultat.tsx`
- Test : `src/pages/quiz/quiz.test.tsx`

**Interfaces :**
- Consumes : `useQuiz` (10), `questions`, `lignes`, `stationsDeLigne`, `metierParId`, `categorieParId` (2), `RadioGroup`, `Progress`, `PastilleLigne` (7, 8).
- Produces : `exemplesDeLigne(id: LigneId, n = 3): string[]`, exporté par `Resultat.tsx` : titres des `n` premiers métiers d'entrée de `stationsDeLigne(id)`.

Comportement (référence `quiz-question.dc.html`, `quiz-resultat.dc.html`) :
- `QuizPage` choisit l'écran : `!termine` → `Question` à l'index `etat.question` ; `termine` et `top3 === null` → `Departage` ; sinon `Resultat`.
- `Question` :
  - surtitre `Quiz · environ 10 minutes`, `Progress` `Question ${i+1} sur 16`, intitulé en `h1` ;
  - `RadioGroup` en cartes, aide `Il n’y a pas de bonne réponse : choisis ce qui te ressemble le plus, même de peu.` ;
  - `← Question précédente` (désactivé à la 1re) ;
  - `Question suivante` / `Voir mon résultat` à la 16e, désactivé tant qu'il n'y a pas de réponse ;
  - le changement de question annonce `Question ${i+1} sur 16` dans une région `aria-live="polite"` et met le focus sur le `h1`.
- `Departage` :
  - `h1` `Une dernière question` ; texte `Ces lignes sont à égalité pour ta 3e place : laquelle te parle le plus ?` (si `places === 1`) ou `Ces lignes sont à égalité pour tes ${places} dernières places : choisis-en ${places}.` ;
  - une carte par ligne de `aDepartager` (`PastilleLigne`, catégories, `Par exemple :` + `exemplesDeLigne`) : radio si 1 place, cases à cocher limitées à `places` sinon ;
  - `Voir mon résultat` (actif quand le compte est bon) → `choisirDepartage` ;
  - `← Revenir aux questions` → `rouvrir()`.
- `Resultat` :
  - surtitre `Résultat du quiz`, `h1` `Tes 3 lignes de départ` ;
  - 3 cartes de rang (`PastilleLigne rang`, catégories, `Par exemple :` + exemples) ;
  - `Un point de départ, pas un verdict. Ce matin, tu vas justement explorer ailleurs : 3 métiers hors de ces lignes.` ;
  - boutons `Voir mes lignes sur le plan` (`/`) et `Refaire le quiz` ;
  - `Tu peux refaire le quiz quand tu veux ; seul le dernier résultat compte.` ; `Résultat gardé dans ce navigateur.` (ou, si le stockage est indisponible, `Résultat perdu en fermant l’onglet : ton navigateur ne garde rien.`) ;
  - aucun nombre de points affiché.

- [ ] **Step 1 : Écrire les tests qui échouent** (`user-event`)
  - Parcours `b` ×16 → `Tes 3 lignes de départ`, rangs `1er choix` Infra & cloud, `2e choix` Management, `3e choix` Développement ; aucun chiffre de score (`queryByText(/\d+ points?/)` null).
  - `Question suivante` désactivé sans réponse ; `← Question précédente` garde la réponse précédente cochée.
  - Reprise : état stocké `question: 6` → `Question 7 sur 16` au montage.
  - Parcours `a` ×16 → écran `Une dernière question` avec 3 cartes (Développement, Qualité & architecture, Produit & design) et le texte des 2 places ; cocher 2 → résultat `Relation & transmission` en `1er choix`.
  - `Refaire le quiz` → `Question 1 sur 16`, stockage remis à zéro.
  - `exemplesDeLigne('developpement')` = 3 titres, tous de type entrée.
- [ ] **Step 2 : Lancer** → échec.
- [ ] **Step 3 : Implémenter.**
- [ ] **Step 4 : Lancer** → PASS.
- [ ] **Step 5 : Commit** — `"Quiz : 16 questions, départage des égalités, résultat sans verdict"`

---

### Task 15 : Roadmap — écran, édition, réordonnancement, export / import

**Files :**
- Create : `src/pages/roadmap/{RoadmapPage,ChoixCible,Annee,DialogItem,Competences,ActionsRoadmap}.tsx`
- Modify : `package.json` (`@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`)
- Test : `src/pages/roadmap/roadmap.test.tsx`

**Interfaces :**
- Consumes : `useRoadmap` (10), `roadmap.ts` / `echange.ts` (6), `ItemRoadmap` (8), `Dialog`, `RadioGroup`, `Champ`, `Input`, `Textarea` (7), `metiers`, `metierParId`, `ligneDuMetier` (2).
- Produces : la route `/roadmap`.

Comportement (référence `roadmap-vide.dc.html`, `roadmap.dc.html`, `m-roadmap.dc.html`) :
- En-tête : surtitre `Ma roadmap · 2027 → 2031`.
  - Sans cible : `h1` `Quel métier vises-tu ?`, texte `Choisis-le parmi les 68 métiers. Ce matin t’a peut-être fait changer d’avis : c’est prévu, tu pourras en changer à tout moment.`, puis `ChoixCible` ouvert.
  - Avec cible : `h1` `Cap sur ${titre}`, `Le métier visé peut changer.` + bouton `Changer`.
- `ChoixCible` : `Input` `Chercher un métier` (insensible à la casse et aux accents) au-dessus d'une liste de boutons (titre + `PastilleLigne sansNom`), 68 au départ. Le choix appelle `choisirCible`.
- Si `cibleOubliee` : `Alert` `Le métier visé de ta roadmap n’existe plus dans constellation : choisis-en un autre. Tes éléments sont conservés.`
- Grille : trajet vertical, une station par année 2027 → 2031 (`h2` = année), items en liste triable.
  - Année vide : `Rien pour ${an} pour l’instant. Ajoute un projet à réaliser ou une notion à apprendre.`
  - Bouton `Ajouter à ${an}`.
- Réordonnancement dans une année :
  - dnd-kit `SortableContext` (stratégie verticale), poignée `GripVertical` passée à `ItemRoadmap` ;
  - capteurs pointeur et clavier, annonces en français (`screenReaderInstructions` et `announcements`, par exemple `Élément « ${titre} » déplacé en position ${n} sur ${total}.`) ;
  - boutons monter / descendre → `deplacer`.
- `DialogItem` (ajout et modification) :
  - titre `Ajouter à ${an}` / `Modifier l’élément` ;
  - `RadioGroup` `Type` (`Projet à réaliser`, `Notion à apprendre`) ;
  - `Titre` requis ; `Ressource (URL)` facultative ; `Note` facultative ;
  - erreurs de `validerBrouillon` sous les champs, focus sur le premier champ en erreur ;
  - `Enregistrer` / `Annuler`.
- Suppression : Dialog `Supprimer « ${titre} » ?` / `Supprimer` / `Annuler`.
- `Competences` : `Compétences de la fiche`, `Une référence pour construire ta roadmap, pas une liste à cocher.`, badges des compétences de la cible, lien `Voir la fiche`. Sans cible : `Elles s’afficheront ici dès que tu auras choisi un métier.` Colonne sticky ≥ 1024 px ; en dessous, `<details>` replié `Compétences de la fiche`.
- `ActionsRoadmap` :
  - `Ajouter` (ouvre le Dialog pour 2027) ;
  - `Imprimer en PDF` (`window.print()`) ;
  - `Exporter en JSON` (Blob + `<a download={nom}>`) ;
  - `Importer un JSON` (`<input type="file" accept="application/json,.json">` caché derrière un bouton) ;
  - la racine d'`ActionsRoadmap` porte `data-actions`, celle de `Competences` `data-competences` (cibles de la feuille d'impression, tâche 16) ;
  - indicateur `Enregistré dans ce navigateur` (icône `Check`) ou `Non enregistré : ton navigateur ne garde rien. Pense à exporter.` selon `enregistre` et `stockageDisponible()`, en `aria-live="polite"`.
- Import :
  - erreur → `Alert` `role="alert"` avec le message de `importerRoadmap`, rien n'est modifié ;
  - succès et roadmap courante non vide → Dialog `Remplacer ta roadmap ?` / `Le fichier contient ${n} éléments. Ta roadmap actuelle (${m} éléments) sera remplacée.` / `Remplacer` / `Annuler` ;
  - succès sur une roadmap vide → remplacement direct ;
  - `cibleInconnue` → message `Le métier visé dans ce fichier n’existe plus dans constellation : choisis-en un autre.`

- [ ] **Step 1 : Écrire les tests qui échouent** (`user-event`)
  - Vide : `Quel métier vises-tu ?`, 5 `h2` 2027…2031, 5 invites vides, 68 boutons de choix ; recherche `backend` → `Développeur·se back-end` ; choix → `Cap sur Développeur·se back-end` et 5 compétences de la fiche affichées.
  - Ajout 2027 : Dialog ; `Enregistrer` sans titre → `Donne un titre à cet élément.` et focus sur `Titre` ; URL `symfony.com` → erreur d'URL ; valide → item affiché avec `Projet à réaliser`, Dialog fermé, stockage à jour.
  - Monter / descendre : 2 items, `Descendre « A »` → ordre `B, A` ; `Monter « B »` désactivé une fois B en tête.
  - Supprimer avec confirmation ; `Annuler` garde l'item.
  - Export : `URL.createObjectURL` espionné ; le nom de fichier commence par `constellation-roadmap-`.
  - Import d'un fichier invalide (`File` avec `{}`) → `Ce fichier n’est pas une roadmap constellation.` en `role="alert"`, roadmap inchangée.
  - Import valide sur une roadmap non vide → Dialog `Remplacer ta roadmap ?` ; `Annuler` ne change rien ; `Remplacer` remplace.
  - `cibleOubliee` → Alert présente.
- [ ] **Step 2 : Lancer** → échec.
- [ ] **Step 3 : Implémenter.**
- [ ] **Step 4 : Lancer** → PASS ; contrôle manuel du glisser-déposer à la souris et au clavier (`npm run dev`).
- [ ] **Step 5 : Commit** — `"Roadmap : métier visé, éléments par année, réordonnancement, export et import JSON"`

---

### Task 16 : Impression A4 de la roadmap

**Files :**
- Create : `src/styles/impression.css` (importé par `RoadmapPage.tsx`)
- Modify : `src/pages/roadmap/RoadmapPage.tsx` (en-tête d'impression `data-impression` caché à l'écran), `src/components/metier/ItemRoadmap.tsx` (`<span data-url-imprimee>` visible seulement à l'impression ; boutons d'action dans un conteneur `data-actions-item`)
- Test : `src/pages/roadmap/impression.test.tsx`

Règles (référence `roadmap-impression.dc.html`), sous `@media print` :
- `@page { size: A4 portrait; margin: 15mm; }` ;
- `body` sur fond blanc, texte noir, aucune ombre ni couleur de fond (`* { background: transparent !important; box-shadow: none !important; color: #000 !important; }` : seule couleur en dur autorisée, propre au papier) ;
- masqués : `header` / `nav`, lien d'évitement, bandeau, `ActionsRoadmap`, `Competences`, boutons d'item, poignées, Dialogs ;
- en-tête d'impression visible : `Ma roadmap 2027 → 2031 · ${titre de la cible ou « métier visé : n.d. »}` et `Imprimée le ${date en français}` ;
- chaque année est un bloc `break-inside: avoid`, avec `h2` année ;
- chaque item montre son type en mot, son titre, son URL **en entier** (JetBrains Mono, `overflow-wrap: anywhere`) et sa note ;
- corps 11 pt, minimum 10 pt.

- [ ] **Step 1 : Écrire les tests qui échouent**
  - `l'en-tête d'impression existe et porte la cible` : `[data-impression]` contient `Ma roadmap 2027 → 2031 · Développeur·se back-end`.
  - `impression.css masque la navigation et les actions` : le fichier contient `@media print`, `size: A4`, `break-inside: avoid`, et les sélecteurs de `nav`, `[data-actions]`, `[data-competences]` avec `display: none`.
  - `l'URL imprimée est complète` : chaque item rend aussi un `<span data-url-imprimee>` avec l'URL d'origine, `https://` compris.
- [ ] **Step 2 : Lancer** → échec.
- [ ] **Step 3 : Implémenter.**
- [ ] **Step 4 : Lancer** → PASS ; vérification réelle à la tâche 17 (Playwright `emulateMedia({ media: 'print' })` + `page.pdf({ format: 'A4' })`).
- [ ] **Step 5 : Commit** — `"Roadmap : impression A4, une année par bloc, URL en entier"`

---

### Task 17 : Tests de bout en bout, accessibilité, déploiement Pages

**Files :**
- Create : `playwright.config.ts`, `tests-e2e/parcours.spec.ts`, `tests-e2e/roadmap.spec.ts`, `tests-e2e/accessibilite.spec.ts`, `tests-e2e/aides.ts`, `.github/workflows/pages.yml`
- Modify : `package.json` (scripts `e2e`, devDependencies `@playwright/test`, `@axe-core/playwright`), `vite.config.ts` (exclure `tests-e2e` de Vitest)

**Interfaces :**
- Produces : `tests-e2e/aides.ts` → `repondreQuiz(page, lettres: string): Promise<void>` (une lettre par question, `'b'.repeat(16)`), `viderStockage(page)`.

- [ ] **Step 1 : Configurer Playwright** :
  - `webServer: { command: 'npm run build && npx vite preview --port 4173 --strictPort', url: 'http://localhost:4173/constellation/', reuseExistingServer: !process.env.CI }` ;
  - `use.baseURL = 'http://localhost:4173/constellation/'` ;
  - projets `desktop` (1280 × 800) et `mobile` (390 × 844), Chromium ;
  - `npx playwright install chromium`.
- [ ] **Step 2 : Écrire les specs**
  - `parcours.spec.ts` :
    - quiz `b` ×16 → résultat → `Voir mes lignes sur le plan` → 3 tracés `data-etat="top"` ;
    - quiz `a` ×16 → départage → résultat ;
    - plan → clic station dev-backend → fiche → voisin `Développeur·se full-stack` → retour arrière du navigateur → fiche dev-backend ;
    - rechargement sur `#/fiche/dsi` → fiche DSI (lien profond) ;
    - `#/fiche/inconnu` → `Métier introuvable` ;
    - mobile : `/` ouvre `#/liste`.
  - `roadmap.spec.ts` :
    - choisir la cible, ajouter 2 éléments, réordonner au clavier (dnd-kit : Espace, Flèche bas, Espace) et par bouton, recharger → tout est conservé ;
    - export (`page.waitForEvent('download')`), vider le stockage, import du fichier téléchargé → mêmes éléments ;
    - `emulateMedia({ media: 'print' })` : `nav` invisible, `[data-impression]` visible, URL complète visible ; `page.pdf({ format: 'A4' })` produit un fichier non vide ;
    - stockage bloqué (`addInitScript` qui fait jeter `localStorage.setItem`) → bandeau visible, l'app reste utilisable.
  - `accessibilite.spec.ts` : pour `#/`, `#/liste`, `#/fiche/dev-backend`, `#/fiche/dsi`, `#/quiz` (question et résultat), `#/roadmap` (vide et remplie avec Dialog ouvert), `#/sources`, en desktop et mobile : `new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze()` → `violations` vide. Plus un test de tabulation : depuis le haut de `#/`, `Tab` atteint `Aller au contenu` en premier, et le focus est visible (`outline-style` ≠ `none`).
  - `aucune requête hors de l'origine` : `page.on('request')` sur un parcours complet → toutes les URL commencent par `http://localhost:4173/`.
- [ ] **Step 3 : Lancer** `npm run e2e` → corriger jusqu'au vert (correctifs dans les composants concernés, avec un test unitaire si le défaut est logique).
- [ ] **Step 4 : Écrire le workflow** `.github/workflows/pages.yml` :
  - déclencheurs `push` sur `main` et `workflow_dispatch` ; `permissions: { contents: read, pages: write, id-token: write }` ; `concurrency: { group: pages, cancel-in-progress: false }` ;
  - job `build` : `actions/checkout`, `actions/setup-node` (`node-version-file: .nvmrc`, `cache: npm`), `npm ci`, `npm run lint`, `npm test`, `python3 scripts/valider.py metiers.json`, `npx playwright install --with-deps chromium`, `npm run e2e`, `actions/configure-pages`, `actions/upload-pages-artifact` (`path: dist`) ;
  - job `deploy` (`needs: build`, environnement `github-pages`) : `actions/deploy-pages`.
- [ ] **Step 5 : Vérifier** : `npm run lint && npm test && npm run e2e` vert ; `npx --yes @action-validator/cli .github/workflows/pages.yml`, ou à défaut un contrôle YAML (`python3 -c "import yaml,sys;yaml.safe_load(open(sys.argv[1]))" .github/workflows/pages.yml`, si PyYAML est présent).
- [ ] **Step 6 : Commit** — `"Tests de bout en bout, accessibilité axe et déploiement GitHub Pages"`

---

### Task 18 : Mémoire projet et clôture

**Files :**
- Modify : `docs/INDEX.md`, `docs/HANDOFF.md`, `docs/ENVIRONMENT.md`, `docs/CONVENTIONS.md`, `docs/QUIRKS.md`, `docs/BACKLOG.md`, `CLAUDE.md`, `README.md`, `PRD — App métiers du numérique (module TEM, CODA).md` (critères de fin cochés selon l'état réel)

- [ ] **Step 1 : `docs/ENVIRONMENT.md`** (sections « Stack d'exécution », « Fichiers clés », « Services ») :
  - Node 24 / npm ;
  - commandes `npm run dev` (`http://localhost:5173/constellation/`), `npm test`, `npm run lint`, `npm run build`, `npm run e2e` ;
  - workflow Pages et URL attendue `https://adriengras.github.io/constellation/` ;
  - activation de Pages (source « GitHub Actions ») à faire par Adrien.
- [ ] **Step 2 : `docs/CONVENTIONS.md`** : squelettes « Fonction pure de `src/logique/` + test », « Page avec `usePageTitre` », « Composant métier porté de `bundle.js` », « Lecture / écriture du stockage » ; règle tacite : couleurs uniquement par tokens.
- [ ] **Step 3 : `docs/QUIRKS.md`** : au minimum la famille `Bricolage Grotesque Variable` de `@fontsource-variable`, la CLI shadcn qui peut réécrire `index.css`, le chemin en dur du squelette Python dans un worktree, et tout piège rencontré pendant l'exécution.
- [ ] **Step 4 : `docs/BACKLOG.md`** :
  - déplacer un élément d'une année à l'autre ;
  - zoom du plan sur mobile ;
  - test au vidéoprojecteur (déjà listé) ;
  - licence des textes (déjà listée) ;
  - cocher l'alignement de `meta.unites.silkhom`.
- [ ] **Step 5 : `docs/INDEX.md`** : une ligne « App constellation (React/Vite) » avec liens vers le spec et ce plan. **`docs/HANDOFF.md`** : entrée datée en haut avec les 4 marqueurs en gras. **`CLAUDE.md`** : ligne « Pile technique » complétée (commandes, `src/`), et la règle « couleurs uniquement par tokens ». **`README.md`** : présentation courte, commandes, lien Pages.
- [ ] **Step 6 : Vérification finale** (superpowers:verification-before-completion) :
  - `npm run lint && npm test && npm run build && npm run e2e` ;
  - `python3 scripts/valider.py metiers.json && python3 -m unittest discover -s tests -t .` ;
  - sortie complète lue, aucun échec.
- [ ] **Step 7 : Commit** — `"Mémoire projet : app constellation livrée"`
