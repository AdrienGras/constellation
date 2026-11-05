# Design — Implémentation de l'app constellation

5 novembre 2026 · Adrien Gras

**Statut : validé par Adrien le 5 novembre 2026.**

## Intention

Construire l'app réelle à partir de la maquette validée le 05/11/2026. C'est le support de la journée « Construire son avenir dans le numérique » (TEM, CODA Dijon, 28/05/2027). Une dizaine d'étudiant·es de B2, surtout attiré·es par le back-end, y découvrent 68 métiers le matin (quiz, plan, fiches), puis y construisent une roadmap 2027–2031 l'après-midi. Le formateur projette l'app, et chacun·e l'utilise sur son portable. L'app reste en ligne après la journée.

Le *quoi* est fixé par la PRD (`PRD — App métiers du numérique (module TEM, CODA).md`) et par la maquette (`maquette/`, `docs/superpowers/specs/2026-11-02-maquette-design.md`, section « Révision du 4 novembre » qui fait foi). Ce document fixe le *comment*.

## Objectifs

- Les cinq écrans de la PRD (plan, fiche, quiz, roadmap, sources), fidèles à la maquette : visuel, comportement, micro-copies.
- Les critères de fin de la PRD :
  - 68 métiers accessibles depuis le plan et la vue liste ;
  - le quiz produit un top 3 et le plan le met en évidence ;
  - une roadmap 2027–2031 se crée, se sauvegarde, se réimporte et s'imprime en A4 lisible ;
  - l'app tourne sur GitHub Pages.
- Les règles d'affichage des salaires respectées à la lettre et couvertes par des tests.
- WCAG 2 AA, navigation clavier complète, vue liste équivalente au plan.

## Non-objectifs

- Backend, comptes, synchronisation, statistiques, version anglaise, mobile-first (PRD, « Hors périmètre »).
- Verrouillage des métiers déjà choisis : la non-répétition se gère au tableau.
- Thème clair.
- Modifier le contenu des fiches. Seule exception : l'alignement de `meta.unites.silkhom` (voir « Données »).

## Anti-objectifs (ce serait un échec même si ça marche)

- Un salaire présenté comme un salaire de sortie d'études, Silkhom et Apec rapprochés, une estimation à la place de « n.d. », une étiquette junior / senior.
- Un résultat de quiz qui sonne comme un verdict : pas de score chiffré, pas de « ton profil ».
- Un plan illisible au vidéoprojecteur, ou qui n'existe qu'à la souris.
- Une roadmap perdue sans prévenir : stockage indisponible non signalé, ou import qui écrase sans confirmation.
- Un appel réseau à l'exécution (polices, CDN, analytics).

## Contraintes

- 100 % statique, GitHub Pages, aucun appel réseau à l'exécution, `metiers.json` (v1.1) seule source de données.
- Pile imposée : React + Vite + Tailwind CSS + shadcn/ui, icônes `lucide-react`.
- Les tokens du design system font foi (`maquette/design-system/tokens.json` / `tokens.css`). Les couleurs ne s'écrivent jamais en dur.
- Français, tutoiement, écriture inclusive au point médian, ni emoji ni point d'exclamation (voir `maquette/design-system/README.md`, « Voix et contenus »).
- Commit et push uniquement sur demande d'Adrien.

## Approches envisagées

La pile et la maquette fixent presque tout. Le seul vrai choix portait sur le plan :

| Approche | Pour | Contre |
|---|---|---|
| **SVG dessiné depuis `plan.json`** (retenue) | Reproduit exactement le plan validé (lignes rayonnantes, segments à 45°, quartiers, étiquettes), sans dépendance, rendu statique et rapide | Les positions sont figées : si les données changent, il faut relancer `maquette/outils/plan.py` |
| Bibliothèque de graphe (force-graph, Sigma, React Flow) | Disposition recalculée, zoom et panoramique gratuits | Perd le tracé métro validé, ajoute une dépendance lourde, rend l'accessibilité plus difficile |

Adrien a validé l'approche SVG le 05/11/2026, avec l'ensemble des choix techniques ci-dessous.

## Décisions

### Pile et structure du dépôt

- App Vite **à la racine du dépôt** : `index.html`, `package.json`, `src/`, `public/`, `tests-e2e/`. Le dossier Python `tests/` reste à sa place ; les tests JS vivent à côté du code (`*.test.ts(x)`) et les tests de bout en bout dans `tests-e2e/`.
- **TypeScript** (décision de Claude) : les types de `metiers.json` reprennent ceux de `maquette/design-system/components/index.d.ts`.
- `metiers.json` est importé depuis la racine (`import data from '../metiers.json'`) et typé dans `src/donnees/`. Ce module est le seul point d'accès aux données.
- `maquette/plan.json` est **copié** dans `src/donnees/plan.json` (décision de Claude), pour que l'app ne dépende pas de `maquette/`. Un test vérifie que les deux fichiers restent identiques, et que `plan.json` contient bien les 68 métiers de `metiers.json` avec la même ligne et le même type.
- Tailwind CSS v4 : les tokens de `tokens.css` deviennent des variables CSS dans `src/styles/tokens.css` (copie), exposées au thème Tailwind (`@theme`) sous leurs noms français (`bg-fond`, `text-encre`, `bg-ligne-developpement`…).
- shadcn/ui : les primitives sont générées par la CLI (Radix sous le capot pour Dialog, Tabs, ToggleGroup, RadioGroup, Tooltip, Select), puis restylées pour reproduire `bundle.css`. Elles gardent leurs noms shadcn. Les composants métier (`BarreNavigation`, `PastilleLigne`, `Station`, `BadgeFiabilite`, `BadgeType`, `PlageSalaire`, `CartoucheSilkhom`, `CartoucheApec`, `ItemRoadmap`) gardent leurs noms français. Ils sont **portés** depuis `bundle.js` / `bundle.css`, avec la même anatomie et les mêmes props que `index.d.ts`, sauf quand React idiomatique impose un écart (par exemple `icone: string` remplacé par un composant `lucide-react`).
- Polices auto-hébergées via `@fontsource` : Bricolage Grotesque (variable), Atkinson Hyperlegible (400, 700, italique), JetBrains Mono (400–600).
- Routage : `react-router` en mode **hash** (`createHashRouter`).

### Routes

| Route | Écran | Maquette |
|---|---|---|
| `#/` | Plan (graphe) ; sur un écran étroit, la vue liste par défaut | E1, E2, M1 |
| `#/liste` | Plan, vue liste | E3 |
| `#/fiche/:id` | Fiche métier (`id` de `metiers.json`) ; id inconnu → message « Métier introuvable » + lien vers le plan | E4–E7, M2 |
| `#/quiz` | Quiz (questions, départage, résultat) | E8, E9 |
| `#/roadmap` | Roadmap | E10, E11, E12 (impression), M3 |
| `#/sources` | Sources et mentions | E13 |

La bascule Graphe / Liste est une paire de liens (`ToggleGroup` à items `href`), comme dans la maquette. Les filtres (catégories, type) vivent dans l'état de la page, partagé entre graphe et liste, et ne sont pas persistés (décision de Claude). Toute route inconnue renvoie vers `#/`. Chaque changement de route remet le défilement en haut, pose un `document.title` propre (« Développeur·se back-end · constellation ») et place le focus sur le `h1` de la page.

Sous 768 px (décision de Claude, le seuil reste à ajuster), `#/` ouvre la liste. Le graphe reste accessible par la bascule.

### Plan (graphe)

- SVG `viewBox` repris de `plan.json` (1280 × 720), mis à l'échelle de la largeur disponible. Pas de zoom ni de panoramique.
- Couches : quartiers (enveloppes pastel et noms), trajets des 8 lignes (`d`), pastilles de terminus, liens voisins (masqués), stations.
- Chaque station est un **lien** (`<a href="#/fiche/id">`) focusable au clavier, avec un `aria-label` « Titre, catégorie, métier d'entrée/évolution, ligne N ». Station pleine pour un métier d'entrée, à anneau pour un métier d'évolution. La cible de clic fait au moins 34 px, comme dans la maquette.
- Au survol ou au focus : infobulle (titre, catégorie, type) et liens « voisin » tracés depuis la station, en trait fin de la couleur de sa ligne. L'ordre de tabulation suit l'ordre des lignes, puis l'ordre de passage sur la ligne.
- Le SVG des tracés est `aria-hidden`. Le plan a un titre accessible, et un lien « Passer à la vue liste » le précède.
- Les filtres atténuent les stations hors filtre sans les retirer (le plan garde sa forme). Une station atténuée reste focusable, et son `aria-label` dit « hors filtre ». Les états de la maquette E1 font foi.
- **Après le quiz** : les 3 lignes du top 3 sont épaissies et lumineuses, numérotées 1-2-3 (`PastilleLigne rang`). Les 5 autres reçoivent le liseré pointillé « zone d'exploration », **sans atténuation**. Un encart rappelle « un point de départ, pas un verdict » avec « Refaire le quiz ». Sans quiz : l'invitation « Fais le quiz pour voir tes 3 lignes de départ ». La vue liste marque « hors de ton top 3 » sur les métiers concernés.

### Quiz

- Une question par écran (`RadioGroup` en cartes), Précédent / Suivant. On ne peut pas avancer sans répondre, et les réponses restent modifiables jusqu'au résultat (comportement du canevas E8).
- **Calcul** (module pur `src/logique/quiz.ts`) : somme des poids des réponses par macro-branche, sur les 16 questions.
- **Égalités (décision d'Adrien, 05/11/2026)** :
  - Le tri se fait par score décroissant. Si des branches sont à égalité **à la frontière du top 3** (le score de la 3e place est partagé par des branches au-delà), le quiz affiche un **écran de départage** entre la dernière question et le résultat : « Ces lignes sont à égalité pour ta 3e place : laquelle te parle le plus ? ».
  - L'étudiant·e choisit autant de lignes qu'il reste de places : 1 en général, 2 si l'égalité porte sur les places 2 et 3, 3 si toutes les branches sont à égalité. Chaque ligne proposée montre `PastilleLigne`, ses catégories et 2-3 métiers d'exemple.
  - Une égalité entre branches qui sont toutes dans le top 3 ne change que leur ordre d'affichage ; elle est tranchée par l'ordre de `macro_branches`, sans rien demander.
  - Les lignes choisies au départage se placent après celles qui sont déjà qualifiées, dans l'ordre des lignes.
  - Si on modifie une réponse ensuite (en refaisant le quiz), le départage précédent est oublié.
- **Résultat** (E9) : « Tes 3 lignes de départ », rang 1 à 3 sans score, catégories, 2-3 métiers d'exemple (les métiers d'entrée de la branche, dans l'ordre du tracé de `plan.json`), « un point de départ, pas un verdict », « Voir sur le plan », « Refaire le quiz », « Résultat gardé dans ce navigateur ».
- **Persistance** : on garde les réponses, l'index de la question courante, le départage et l'état terminé. Le top 3 n'est jamais stocké : il est recalculé à chaque fois. Un quiz interrompu reprend à la question où il s'était arrêté. « Refaire le quiz » remet tout à zéro.

### Fiche métier

- Structure de la maquette (E4–E7, M2) :
  - en-tête : pastille de ligne, catégorie, titre, `BadgeType`, `BadgeFiabilite`, code ROME, brief ;
  - deux colonnes : à gauche missions, compétences, « À éviter si », parcours ; à droite les repères (métiers « depuis » cliquables, voisins même catégorie / autres catégories cliquables, lien roadmap.sh s'il existe, source du texte, note de fiabilité) ;
  - puis les salaires : chapeau commun, `CartoucheSilkhom`, la phrase « Ces deux sources ne mesurent pas la même chose : ne les compare pas entre elles. », puis `CartoucheApec`, **empilés**.
- Bouton « Viser ce métier dans ma roadmap » (décision de Claude ; la PRD cite la fiche parmi les entrées de la roadmap). Il fixe la cible de la roadmap puis y mène ; si une autre cible est déjà posée, il demande confirmation.
- La logique des salaires est portée **à l'identique** de `CartoucheSilkhom` et `CartoucheApec` (`bundle.js`) dans des fonctions pures (`src/logique/salaires.ts`) :
  - libellé de tranche en années (`libelleTranche`), dans l'ordre des données, trous visibles, jamais d'étiquette `niveau` ni de `variation_pct` ;
  - zone Régions (Dijon) par défaut ;
  - badge « la plus proche d'un premier emploi » sur la 1re tranche **seulement** en zone Régions, si `annees_min == 0` et que le métier est d'entrée ;
  - métier d'évolution qui démarre à 0 an : la phrase « Métier d'évolution : les années comptent l'expérience dans ce poste, après un premier métier (<titres des métiers « depuis »>). » ;
  - 1re tranche > 0 an : Alert « Pas de premier emploi direct : métier accessible après N ans d'expérience », quelle que soit la zone ;
  - moyenne relevée ou « n.d. » ;
  - rapprochements affichés avec leur raison ;
  - Apec `null` : cartouche « n.d. » avec la raison tirée de `fiabilite_note`.
- Tests de ces règles sur les fiches témoins `dev-backend`, `dsi`, `integrateur-web`, `mlops`, `technicien-support`, plus un test sur les 68 fiches qui vérifie qu'aucune ne plante et qu'aucune étiquette de niveau ne s'affiche.

### Roadmap

- Écran E10 (vide) / E11 (remplie), M3 (mobile).
- Choix du métier visé dans les 68 (recherche filtrante en liste, comme dans la maquette). Les compétences de la fiche visée s'affichent à côté (colonne sticky sur desktop, panneau repliable sur mobile), avec un lien vers la fiche. On peut changer de métier visé sans toucher aux items.
- Grille fixe 2027 → 2031, une station par année, une invite par année vide.
- Item : type `projet` (« Projet à réaliser ») ou `notion` (« Notion à apprendre »), titre (requis), URL (facultative ; si elle est renseignée, elle doit être en `http(s)://` ; sinon, erreur au champ), note (facultative). Ajout et modification par `Dialog`, suppression avec confirmation (décision de Claude).
- Réordonnancement **dans une année** : glisser-déposer à la souris (`@dnd-kit/sortable`) **et** boutons monter / descendre. Le déplacement d'un item d'une année à l'autre n'est pas demandé par la PRD ; il est hors périmètre (au backlog).
- Barre d'actions : Ajouter, Imprimer (PDF), Exporter en JSON, Importer un JSON. Indicateur « Enregistré dans ce navigateur », ou un avertissement si le stockage est indisponible.
- **Impression** (E12) : feuille `@media print` dédiée, A4 portrait. En-tête avec métier visé et date ; une année par bloc (`break-inside: avoid`) ; texte noir sur blanc ; URL imprimées en entier (JetBrains Mono, coupure autorisée). Navigation, boutons, colonne de compétences et fonds masqués.

### Stockage navigateur

Module `src/logique/stockage.ts` : chaque lecture et chaque écriture passe par `try/catch`. Une valeur illisible ou d'une version inconnue est ignorée (l'app repart de zéro, sans planter) et laissée en place, pour qu'elle reste récupérable à la main (décision de Claude). Au démarrage, une sonde d'écriture détecte un stockage indisponible et affiche le bandeau de la maquette : « Ton navigateur ne garde rien : ton résultat de quiz et ta roadmap seront perdus en fermant l'onglet. Pense à exporter. »

| Clé | Contenu |
|---|---|
| `constellation.quiz.v1` | `{ version: 1, reponses: { q01: "a", … }, question: 5, departage: ["data-ia"], termine: true }` |
| `constellation.roadmap.v1` | `{ version: 1, cible: "dev-backend" \| null, annees: { "2027": [Item], …, "2031": [Item] }, modifie_le: ISO }` |

`Item = { id: string, type: "projet" | "notion", titre: string, url: string, note: string }`. L'`id` est généré à la création (`crypto.randomUUID`, avec un repli) et sert de clé au glisser-déposer.

L'écriture se fait à chaque modification. L'état vit dans un contexte React par domaine (quiz, roadmap), sans bibliothèque d'état (décision de Claude).

### Export / import JSON

- Export : un fichier `constellation-roadmap-AAAA-MM-JJ.json` contenant `{ format: "constellation-roadmap", version: 1, exporte_le: ISO, cible, annees }`.
- Import :
  - on lit le fichier et on le valide (format, version, cible connue ou `null`, années 2027–2031 seulement, items bien formés) ;
  - un `id` manquant est regénéré ;
  - en cas d'erreur, un message en français dit précisément ce qui ne va pas, et rien n'est modifié ;
  - si le fichier est valide et que la roadmap courante n'est pas vide, un `Dialog` demande confirmation avant de la remplacer ;
  - une cible inconnue (fiche disparue) est importée comme `null`, et l'app le signale.

### Données

- `metiers.json` reste intouché par l'app.
- Une seule modification, par script Python (squelette de `docs/CONVENTIONS.md`) : aligner `meta.unites.silkhom` sur la règle de la PRD (exception des métiers d'évolution). Ensuite on lance `python3 scripts/valider.py metiers.json` et `python3 -m unittest discover -s tests -t .`. L'app n'affiche pas `meta.unites`, mais le fichier publié doit dire vrai.

### Sources et mentions (E13)

Texte de `meta.mentions` ; tableau des 6 sources (titre, éditeur, date, usage, licence, lien). La licence des textes propres reste affichée « à décider » tant qu'Adrien n'a pas tranché (CC BY 4.0 proposée). C'est une constante unique dans le code, facile à changer.

### Accessibilité

- Lien d'évitement « Aller au contenu », focus visible (contour `focus` 2 px décalé de 2 px), cibles de 44 px, `lang="fr"`, landmarks.
- Annonces : le changement de question au quiz et l'enregistrement de la roadmap passent par une région `aria-live` polie ; les erreurs d'import sont en `role="alert"`.
- Le réordonnancement est clavier par les boutons ; dnd-kit fournit aussi ses annonces, traduites en français.
- `prefers-reduced-motion` respecté (pas d'animation de tracé).
- Contrastes : les paires du design system sont déjà vérifiées (`maquette/outils/tokens.py`) ; axe vérifie le rendu réel.

### Tests

- **Vitest + Testing Library** (jsdom) :
  - logique pure : quiz (scores, détection de l'égalité à la frontière, départage, persistance), salaires (règles ci-dessus sur les 5 fiches témoins et les 68), stockage (stockage absent, valeur corrompue, version inconnue), import / export (fichiers valides et invalides) ;
  - composants : cartouches, item de roadmap, filtres, écran de départage.
- **Playwright + @axe-core/playwright** (Chromium) :
  - parcours quiz → résultat → plan allumé ;
  - quiz avec départage ;
  - fiche depuis le plan et depuis la liste ;
  - roadmap : créer, réordonner (clavier et souris), recharger, exporter, importer ;
  - aperçu impression (`emulateMedia print`) ;
  - stockage bloqué ;
  - analyse axe (WCAG 2 AA) de chaque écran, desktop 1280 et mobile 390 ;
  - les e2e tournent sur le build de production (`vite preview`) avec la base `/constellation/`.
- Les tests Python existants restent verts.

### Déploiement

- `vite.config.ts` : `base: '/constellation/'`.
- Workflow GitHub Actions `.github/workflows/pages.yml` : sur push de `main`, installation, lint, tests unitaires, build, e2e, puis `actions/upload-pages-artifact` et `actions/deploy-pages`. L'activation de Pages (source « GitHub Actions ») dans les réglages du dépôt est une action d'Adrien.
- Seul `dist/` est publié : `maquette/`, `recherche/`, `scripts/` et `docs/` ne partent jamais.

### Mémoire projet

Au fil de l'implémentation : `docs/ENVIRONMENT.md` (commandes npm, Node, URL Pages), `docs/CONVENTIONS.md` (squelettes de composant, de test, d'accès aux données), `docs/QUIRKS.md` (pièges rencontrés), `docs/INDEX.md`, `docs/HANDOFF.md`, et la ligne « pile » de `CLAUDE.md` si besoin.

## Laissé au builder

- Découpage exact des fichiers sous `src/` (suggestion : `donnees/`, `logique/`, `components/ui/` pour shadcn, `components/` pour le métier, `pages/`).
- Versions exactes des dépendances (dernières stables).
- Micro-copies non citées (messages d'erreur d'import, invites vides), dans la voix du design system.
- Seuil exact de l'écran étroit et adaptation du plan entre 768 et 1280 px.
- Lint et format (ESLint + Prettier par défaut).
