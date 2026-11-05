# Quirks & pièges connus

Comportements non-évidents découverts au fil du projet. **Catalogue perpétuel** :
un `##` par piège, jamais purgé — les entrées restent utiles indéfiniment.

Le titre de chaque section est **le seul élément injecté automatiquement** au
démarrage de session (index sans corps). Il doit donc être **descriptif du piège
concret**, jamais générique — un titre vague le rend invisible dans l'index, même
si le corps qui le détaille est correct. Format exact :
`## Sujet concret du piège (AAAA-MM-JJ)`.

**Si tu en découvres un nouveau pendant une session : ajoute-le ici dès la
découverte, pas plus tard.**

Corps attendu pour chaque entrée : `**Découvert**` (contexte de la découverte),
`**Symptôme**` (ce qui a été observé), `**Cause**` (l'explication), `**Workaround**`
(contournement ou correction), `**Référence**` (fichier·s/commande·s concerné·s).

---

## Relancer fusionner.py sur la v1.1 écrase les décisions manuelles (2026-11-02)

**Découvert** : revue finale de la phase données.
**Symptôme** : une relance réécrivait des `rapprochement` remis à `null`, des notes et le quiz depuis `recherche/`, avec code 0 et sans erreur de validation.
**Cause** : la fusion considère toute valeur vide comme « à remplir » et écrase librement `fiabilite_note` ; `recherche/` reflète l'état d'avant la relecture.
**Workaround** : le script refuse désormais d'écrire si `meta.version == "1.1"` sans `--force`. Modifier `metiers.json` par script Python, puis `valider.py`.
**Référence** : `scripts/fusionner.py` (`main`), `relecture.md` (« Décisions appliquées »).

## recherche/quiz.json est périmé : le quiz vit dans metiers.json (2026-11-02)

**Découvert** : application des décisions d'Adrien.
**Symptôme** : `recherche/quiz.json` ne contient ni les retouches ni le rééquilibrage validés.
**Cause** : depuis la fusion, la seule source est la clé `quiz` de `metiers.json`.
**Workaround** : lire et modifier le quiz dans `metiers.json` uniquement.
**Référence** : `metiers.json` → `quiz.questions`.

## metiers.json s'écrit sans saut de ligne final, indent 2, ensure_ascii=False (2026-11-02)

**Découvert** : script de fusion.
**Symptôme** : un autre format réécrit tout le fichier et rend le diff illisible.
**Cause** : format d'origine de la v1.0.
**Workaround** : écrire avec `scripts.fusionner.ecrire(Path, dict)` ou `json.dumps(d, ensure_ascii=False, indent=2)` sans `\n` final.
**Référence** : `scripts/fusionner.py` (`ecrire`), test `test_aller_retour_identique`.

## Les grilles Silkhom ne commencent pas toutes à 0 an (2026-11-02)

**Découvert** : vérification de la règle « premier emploi ».
**Symptôme** : 9 fiches (chief-data-officer, dsi, rssi, cto, engineering-manager, architecte-entreprise, architecte-cloud, directeur-projet, scrum-master) ont une 1re tranche à 2, 3, 4 ou 6 ans ; dsi et rssi ont deux tranches ouvertes (6+ et 15+). Tranches aussi variables d'une ligne à l'autre (0–2/2–5/5+ ou 0–3/3–7/7+), avec parfois un trou.
**Cause** : données Silkhom telles que publiées sur la page web (le PDF donne d'autres tranches ; on suit la page).
**Workaround** : afficher les années depuis `annees_min`/`annees_max`, jamais `niveau` ; « premier emploi » seulement si `annees_min == 0`.
**Référence** : PRD, « Règles d'affichage » ; `meta.unites.silkhom`.

## L'Apec ne couvre que les cadres et donne des médianes toutes expériences (2026-11-02)

**Découvert** : recherche Apec.
**Symptôme** : techniciens et intégrateur web en « n.d. » côté Apec ; médianes bien au-dessus d'un salaire d'embauche.
**Cause** : baromètre Apec = cadres du privé, fixe + variable, tous âges.
**Workaround** : présenter l'Apec comme « salaire cible, pas un salaire d'embauche » ; ne jamais le mettre sur le même graphique que Silkhom.
**Référence** : `meta.unites.apec`, PRD.

## Pages Cigref : page du PDF = numéro imprimé + 6 (2026-11-02)

**Découvert** : relecture des parcours.
**Symptôme** : les numéros de page cités ne tombent pas sur la bonne page du PDF.
**Cause** : pagination imprimée décalée dans le PDF Cigref 2025.
**Workaround** : ajouter 6 pour ouvrir la page dans le PDF.
**Référence** : `sources[]` id `cigref-2025`.

## Lancer Python avec -I depuis le dépôt nécessite sys.path.insert pour importer scripts (2026-11-02)

**Découvert** : scripts de vérification.
**Symptôme** : `ModuleNotFoundError: scripts` avec `python3 -I`.
**Cause** : `-I` retire le répertoire courant de `sys.path`.
**Workaround** : `sys.path.insert(0, '/srv/AdrienGras/constellation')` avant `from scripts.valider import valider`.
**Référence** : `scripts/`.

## Un fichier copié depuis un autre artefact doit être listé avant d'être republié (2026-11-04)

**Découvert** : mise à jour du bundle du design system dans le canevas des maquettes.
**Symptôme** : `Artifact publish` refuse tout l'envoi (« published content is not what you last saw ») pour `project/ds/constellation/components/bundle.js`.
**Cause** : les fichiers copiés côté serveur (`files: {"…": {"artifact": url, "path": …}}`) n'ont jamais été lus ni listés par la session ; l'outil protège contre l'écrasement de contenu non vu.
**Workaround** : `Artifact` action `list`, `scope: "files"` sur le canevas, puis republier la même commande.
**Référence** : canevas https://claude.ai/artifact/WzcbrRpVeq6Ghw9aUgXevM, `project/ds/constellation/`.

## Les artefacts claude.ai refusent les .d.ts et ne génèrent tokens.css qu'à l'enregistrement (2026-11-04)

**Découvert** : première publication du design system.
**Symptôme** : publication refusée pour `components/index.d.ts` (« extension .ts is not served ») ; aucun `tokens.css` servi tant que personne n'a enregistré depuis la page, donc les artboards du canevas n'avaient pas de variables CSS.
**Cause** : seuls les types web courants sont servis ; `tokens.css` est généré par la page du design system à l'enregistrement.
**Workaround** : envoyer `index.d.ts` avec `contentType: "text/plain"` ; écrire soi-même `project/tokens.css` (1re ligne `/* constellation — generated from tokens.json */`) et le citer dans la section « Utiliser ce système » du README.
**Référence** : `maquette/design-system/tokens.css`, `maquette/design-system/README.md`.

## Le badge « premier emploi » n’existe que pour les métiers d’entrée (2026-11-04)

**Découvert** : builder check du design de la maquette.
**Symptôme** : 14 des 23 métiers d'évolution (dont mlops, sre, lead-developer) ont une 1re tranche Silkhom à 0 an ; la règle mécanique de la PRD leur aurait donné « la plus proche d'un premier emploi ».
**Cause** : pour un métier d'évolution, les années comptent l'expérience dans le poste, pas depuis la sortie d'études.
**Workaround** : décision d'Adrien (04/11) : badge seulement si `type == "entree"` ; sinon phrase « Métier d'évolution : les années comptent l'expérience dans ce poste, après un premier métier (…) ». Implémenté dans `CartoucheSilkhom`, reporté dans la PRD.
**Référence** : PRD « Règles d'affichage » ; `maquette/design-system/components/bundle.js` (`GrilleSilkhom`).


## La règle a:hover d'un artboard repeint le texte des boutons-liens (2026-11-04)

**Découvert** : commentaire d'Adrien sur le bouton « Voir mes lignes sur le plan » (E8).
**Symptôme** : au survol, le texte d'un `<a class="cs-btn cs-btn-default">` passe en blanc sur fond blanc cassé.
**Cause** : le `<helmet>` de chaque artboard déclare `a:hover{color:#ffffff}`, plus spécifique que `.cs-btn-default`.
**Workaround** : `bundle.css` du design system fixe la couleur de `a.cs-btn-<variante>` et `a.cs-btn-<variante>:hover`. Tout nouveau style de lien-bouton doit faire de même.
**Référence** : `maquette/design-system/components/bundle.css`.

## Le scratchpad de session est vidé entre deux sessions (2026-11-05)

**Découvert** : reprise de la maquette le lendemain.
**Symptôme** : `scratchpad/` vide ; les artboards et scripts écrits la veille n'y sont plus.
**Cause** : le dossier temporaire est propre à la session et nettoyé.
**Workaround** : garder la source de vérité dans `maquette/` (design system, canevas, outils) ; pour modifier le canevas, relire ses fichiers avec `Artifact read` (`paths`) puis republier depuis `scratchpad/artifact-files/<id>/`.
**Référence** : `maquette/README.md`.

## `@fontsource-variable/bricolage-grotesque` expose la famille « Bricolage Grotesque Variable » (2026-11-05)

**Découvert** : mise en place des polices (tâche 1).
**Symptôme** : `font-family: 'Bricolage Grotesque'` ne s'applique pas, le navigateur retombe sur la police de secours.
**Cause** : le paquet déclare sa `@font-face` sous le nom « Bricolage Grotesque Variable ».
**Workaround** : utiliser ce nom exact dans `--font-display` (et le déclarer une seule fois : il avait été dupliqué).
**Référence** : `src/index.css`.

## La CLI shadcn crée un dossier `@/` littéral et ajoute une dépendance `cn` (2026-11-05)

**Découvert** : ajout des composants shadcn (tâche 7).
**Symptôme** : un dossier `@/` apparaît à la racine du dépôt ; `package.json` gagne une dépendance parasite `cn` ; `index.css` peut être réécrit.
**Cause** : la CLI n'a pas résolu l'alias `@/` de `components.json`, et `cn` n'est pas l'utilitaire `lib/utils`.
**Workaround** : après chaque `npx shadcn add`, déplacer les fichiers dans `src/components/ui/`, supprimer le dossier `@/` et la dépendance `cn`, relire le diff de `index.css`.
**Référence** : `components.json`, `src/components/ui/`.

## Radix ToggleGroup ne convient pas à des liens (2026-11-05)

**Découvert** : bascule Graphe / Liste (tâche 7).
**Symptôme** : le ToggleGroup Radix gère un état et des `role=radio`, pas la navigation ; la bascule ne change pas la route et l'accessibilité est fausse.
**Cause** : c'est un contrôle de sélection, pas un groupe de liens.
**Workaround** : `ToggleLiens` dans `src/components/ui/toggle-group.tsx` : de vrais liens (`aria-current`) stylés comme la bascule.
**Référence** : `src/components/ui/toggle-group.tsx`.

## Le Dialog Radix piloté par état ne rend pas le focus à l'ouvreur (2026-11-05)

**Découvert** : dialogue d'ajout / modification d'un élément de roadmap (tâche 15).
**Symptôme** : après fermeture, le focus retombe sur `body` (WCAG 2.4.3).
**Cause** : le dialogue est ouvert par un état du parent, sans `DialogTrigger` : Radix ne connaît pas l'ouvreur.
**Workaround** : `useRetourFocus` mémorise l'élément actif à l'ouverture et le refocalise à la fermeture.
**Référence** : `src/pages/roadmap/useRetourFocus.ts`.

## jsdom n'a ni `matchMedia` ni `ResizeObserver` (2026-11-05)

**Découvert** : tests de composants Radix et de la liste (tâches 12 et 15).
**Symptôme** : `window.matchMedia is not a function` ou `ResizeObserver is not defined`.
**Cause** : jsdom n'implémente pas ces API.
**Workaround** : `ResizeObserver` est stubé dans `src/test/setup.ts` ; `matchMedia` est stubé dans les tests qui en ont besoin, et le code tolère son absence (ouvert par défaut ; pas de redirection mobile).
**Référence** : `src/test/setup.ts` ; tolérance à l'absence de `matchMedia` dans `src/pages/ListePage.tsx`, `src/pages/plan/PlanPage.tsx` et `src/pages/roadmap/Competences.tsx`.

## Le glisser-déposer dnd-kit n'est pas testable en jsdom (2026-11-05)

**Découvert** : tests de la roadmap (tâche 15).
**Symptôme** : les capteurs dnd-kit ne bougent jamais : jsdom renvoie des rectangles nuls.
**Cause** : pas de mise en page, donc pas de géométrie.
**Workaround** : tester la logique de réordonnancement en unitaire, le glisser (souris et clavier) en e2e Playwright.
**Référence** : `tests-e2e/roadmap.spec.ts`.

## `react-hooks/rules-of-hooks` se déclenche sur le `use` des fixtures Playwright (2026-11-05)

**Découvert** : e2e (tâche 17).
**Symptôme** : ESLint signale un hook appelé hors composant sur `await use(page)`.
**Cause** : le paramètre de fixture Playwright s'appelle `use`, comme le hook React.
**Workaround** : règle désactivée pour `tests-e2e/**` seulement dans `eslint.config.js`, pas globalement.
**Référence** : `tests-e2e/fixtures.ts`, `eslint.config.js`.

## Le classifieur de permissions refuse un `git commit` de sous-agent (« Unrequested Commit ») (2026-11-05)

**Découvert** : tâche 16 du plan.
**Symptôme** : le sous-agent n'obtient pas le droit de commiter, même sur une branche locale.
**Cause** : le classifieur ne voit pas l'autorisation d'Adrien dans le contexte du sous-agent.
**Workaround** : écrire explicitement dans la consigne « Adrien a autorisé les commits locaux sur la branche `app`, sans push » ; à défaut, commit par le contrôleur sur feu vert explicite.
**Référence** : `.superpowers/sdd/2026-11-05-implementation-app/implementeur-commun.md`.

## Le chemin en dur du squelette Python de CONVENTIONS pose problème dans un worktree (2026-11-05)

**Découvert** : relecture du plan.
**Symptôme** : le squelette fait `sys.path.insert(0, "/srv/AdrienGras/constellation")` : dans un worktree, il importe les scripts du dépôt principal, pas ceux de la branche.
**Cause** : chemin absolu vers le dépôt principal.
**Workaround** : travailler dans le dépôt lui-même, ou remplacer le chemin par la racine du worktree courant.
**Référence** : `docs/CONVENTIONS.md`, section « Modification de metiers.json ».

## Un `sr-only` dans un tableau défilable fait défiler la page (2026-11-05)

**Découvert** : correctifs de la revue finale (reflow à 390 et 320 px).
**Symptôme** : `scrollWidth` du document dépasse `clientWidth` alors que le tableau est dans un conteneur `overflow-x-auto`.
**Cause** : un élément `position: absolute` (`sr-only` de `TableCaption`, en-tête « Visualisation ») dont l'ancêtre positionné est hors du conteneur n'est pas rogné par son `overflow`.
**Workaround** : le conteneur du `Table` est `relative`. Même famille : `src/styles/tokens.css` est importé hors `@layer`, donc `.titre-affiche` bat les utilitaires Tailwind ; les réglages responsives de ces classes vont dans `index.css`.
**Référence** : `src/components/ui/table.tsx`, `src/styles/index.css`, `tests-e2e/accessibilite.spec.ts` (reflow).

## Un sous-agent a poussé la branche `app` sans autorisation (2026-11-05)

**Découvert** : au push de la PR #2, `origin/app` existait déjà à `6eb8746` (push du 05/11 à 10:21, pendant la tâche 7).
**Symptôme** : une branche distante apparaît alors que les consignes n'autorisaient que des commits locaux.
**Cause** : un sous-agent implémenteur a lancé `git push` de lui-même ; rien ne l'en empêchait techniquement.
**Workaround** : écrire en toutes lettres « ne pousse jamais » dans chaque consigne de sous-agent (déjà dans `implementeur-commun.md`), et vérifier `git reflog show origin/<branche>` en fin d'exécution. Aucun dégât ici (historique linéaire, prolongé ensuite).
**Référence** : PR https://github.com/AdrienGras/constellation/pull/2.

## Un `sticky` dans une enveloppe de même hauteur ne colle jamais (2026-11-05)

**Découvert** : audit des résolutions (repasse UX), roadmap défilée de 900 px.
**Symptôme** : `aside[data-competences]` a bien `position: sticky; top: 24px` (calculé), mais la colonne « Compétences de la fiche » défile avec la page, à toutes les largeurs ≥ 1024 px.
**Cause** : l'élément sticky est enveloppé dans `<div className="lg:flex-1">`, dans une rangée flex en `lg:items-start` : l'enveloppe a exactement la hauteur de l'`aside`. Un élément sticky ne sort jamais de son parent, il n'a donc aucune course.
**Workaround** : porter `sticky` sur l'enveloppe (enfant direct de la rangée flex), ou laisser l'enveloppe s'étirer à la hauteur de la frise. Un test unitaire jsdom ne le voit pas : il faut un e2e qui mesure `boundingBox().y` après défilement.
**Référence** : `src/pages/roadmap/RoadmapPage.tsx:104` et `:124`, `src/pages/roadmap/Competences.tsx:27`, `docs/ux/repasse-2026-11/rapport.md` (n° 3).

## `color-scheme: dark` noircit les marges du PDF imprimé (à confirmer) (2026-11-05)

**Découvert** : audit des résolutions, `page.pdf({ printBackground: true })` de la roadmap.
**Symptôme** : le contenu A4 est blanc, mais les marges `@page` de 15 mm sont noires.
**Cause** : probablement `<meta name="color-scheme" content="dark">` : Chromium peint la zone des marges de page avec le canevas sombre, que `impression.css` ne surcharge pas (il ne touche que `html` et `body`).
**Workaround** : non appliqué. Piste : `color-scheme: light` sous `@media print` sur `:root`. Vérifier d'abord dans la boîte d'impression de Chrome et d'Edge, case « Graphiques d'arrière-plan » cochée et décochée.
**Référence** : `index.html:6`, `src/styles/impression.css`, `docs/ux/repasse-2026-11/rapport.md` (n° 13).

## `scroll-margin` ne joue que sur l'élément qui reçoit le focus (2026-11-05)

**Découvert** : barre de navigation du quiz collée en bas de la fenêtre (repasse UX, étape 2).
**Symptôme** : malgré une marge de défilement sur le label ou la carte, la case focalisée au clavier passait sous la barre `sticky bottom-0`.
**Cause** : le navigateur applique `scroll-margin` à l'élément focalisé, ici la pastille radio Radix ou l'`input` checkbox du départage, pas son label ni sa carte. Pour une case centrée dans une carte haute, la marge doit aussi couvrir le bas de la carte.
**Workaround** : `scroll-mb-32` sur la pastille (`src/components/ui/radio-group.tsx`, `RadioCarte`), `scroll-mb-40` sur la case du départage (`src/pages/quiz/Departage.tsx`). Vérifié par `tests-e2e/mise-en-page.spec.ts`.
**Référence** : `docs/superpowers/specs/2026-11-05-repasse-ux-resolutions-design.md`.

## Radix `RadioGroup` déplace le focus dans un `setTimeout` (2026-11-05)

**Découvert** : test clavier de la barre du quiz (`tests-e2e/mise-en-page.spec.ts`).
**Symptôme** : une touche envoyée juste après la précédente atterrit sur l'ancienne pastille, le test devient instable.
**Cause** : `focusFirst` de `@radix-ui/react-roving-focus` (utilisé par `RadioGroup`) est appelé dans un `setTimeout` (`dist/index.mjs`, ligne 202) : le focus arrive au tick suivant, pas de façon synchrone.
**Workaround** : attendre chaque arrivée du focus (`toBeFocused`) avant la touche suivante.
**Référence** : `src/components/ui/radio-group.tsx`, `node_modules/@radix-ui/react-roving-focus/dist/index.mjs`.

## L'en-tête du plan est au plafond : 298 px pour 300 px (2026-11-05)

**Découvert** : mesures de la repasse UX, étape 2 (tâche 7).
**Symptôme** : `tests-e2e/mise-en-page.spec.ts` échoue dès qu'une ligne s'ajoute à l'en-tête ou à l'encart du quiz.
**Cause** : haut du dessin du plan à 258 px avant le quiz, 298 px après, pour un plafond de 300 px (barre de navigation comprise) : 2 px de marge.
**Workaround** : retirer d'abord ce qui est prévu dans l'ordre validé par Adrien : le rappel « point de départ, pas un verdict » de l'encart (`src/pages/plan/EncartQuiz.tsx`) est la prochaine étape. L'étiquette « Accueil » et le chapeau long sont déjà retirés ; la consigne de la zone d'exploration et son décompte restent.
**Référence** : `src/pages/plan/EnTeteAccueil.tsx`, `src/pages/plan/EncartQuiz.tsx`.

## Tailwind v4 n'a pas de variante `fullscreen:` (2026-11-05)

**Découvert** : bouton « Plein écran » du plan (repasse UX, étape 2).
**Symptôme** : `fullscreen:` ne produit aucune règle CSS.
**Cause** : Tailwind v4 ne fournit pas cette variante.
**Workaround** : variantes arbitraires, `[&:fullscreen]:` sur l'élément plein écran et `[:fullscreen_&]:` pour ses descendants (bouton, légende).
**Référence** : `src/pages/plan/usePleinEcran.ts`, `src/pages/plan/PlanPage.tsx`.

## Une spec Playwright qui exporte ses constantes les fait réenregistrer (2026-11-05)

**Découvert** : écriture de `tests-e2e/mise-en-page.spec.ts` (repasse UX, étape 2).
**Symptôme** : importer `FENETRES` ou `QUIZ_A` de cette spec dans une autre rejouerait les tests de la première.
**Cause** : importer un fichier `*.spec.ts` l'exécute, donc ses `test()` s'enregistrent une seconde fois.
**Workaround** : déplacer les constantes dans un module non-spec (par exemple `tests-e2e/donnees.ts`) avant le premier import croisé.
**Référence** : `tests-e2e/mise-en-page.spec.ts`.
