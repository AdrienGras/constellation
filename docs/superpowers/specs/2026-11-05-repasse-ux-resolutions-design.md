# Repasse UX : résolutions de PC portable (design)

Date : 05/11/2026. Branche : `app`. Base : audit `docs/ux/repasse-2026-11/rapport.md` (problèmes n° 1 à 5, plus trois points de son annexe). Approches validées par Adrien le 05/11/2026.

## Intention

Le 28/05/2027, une dizaine d'étudiant·es de B2 utilisent constellation sur leur PC portable, et le formateur la projette. L'audit montre qu'aux tailles courantes (1366×768, 1280×720, 1280×800), l'écran d'accueil cache l'essentiel du plan. C'est pire après le quiz, au moment où il faut repérer ses 3 lignes allumées et la zone d'exploration en pointillés. Le quiz oblige à défiler pour valider presque chaque question, et la colonne des compétences de la roadmap ne suit pas le défilement. L'objectif est que ces écrans se lisent et s'utilisent sans gymnastique sur ces machines.

**Contrainte découverte pendant le brainstorming** : les tailles de l'audit sont des tailles d'écran. Dans Chrome sous Windows, il faut retirer la barre des tâches (environ 48 px) et l'interface du navigateur (environ 85 px). La fenêtre utile d'un écran 1366×768 fait donc environ **1366×633**, celle d'un 1280×720 environ **1280×590**. Le plan (format 1280/720) ne peut pas tenir entier dans ces fenêtres sans libellés illisibles. En revanche, il remplit exactement un écran 16/9 en plein écran.

## Objectifs

1. **Plan** : le plan commence nettement plus haut, avant comme après le quiz. Cible : haut du plan à **300 px au plus** pour toute largeur ≥ 1280 px. On mesure en coordonnées de page (`boundingBox().y + scrollY` du conteneur du plan), barre de navigation de 68 px comprise. Les deux lignes horizontales et le centre « TA FORMATION » doivent être visibles sans défiler dans une fenêtre de 1366×633.
2. **Plein écran** : un bouton passe le plan en plein écran. En 1366×768 ou au vidéoprojecteur, il est alors visible en entier, libellés compris.
3. **Encart du quiz** : avant, pendant (départage en attente) et après le quiz, l'encart n'écrase plus le titre et ne repousse plus le contenu. Même en-tête sur la liste.
4. **Roadmap** : la colonne « Compétences de la fiche » reste collée à 24 px du haut pendant le défilement (≥ 1024 px).
5. **Quiz** : le bouton « Question suivante » (et « Voir mon résultat », y compris au départage) est visible sans défiler pour les 16 questions, quelle que soit la hauteur de la fenêtre.
6. **Hors résolution, validé dans cette repasse** :
   - la ligne Management affiche des exemples au résultat et au départage ;
   - les boutons `ghost` désactivés ne ressemblent plus à des boutons survolés ;
   - les filets du tableau Apec passent sous la première colonne.
7. **Non-régression** : des tests e2e (Page Object Model) mesurent ces mises en page dans les fenêtres réelles.

## Non-objectifs

- La taille des textes (n° 6 de l'audit) et les points cosmétiques n° 7 à 13 : hors de cette repasse.
- Redessiner le plan : on ne touche ni à `plan.json`, ni au tracé, ni au ratio 1280/720.
- Le mobile : on ne refait rien en dessous de `md` (768 px). Il faut seulement ne pas le casser, et les tests mobiles existants doivent passer.
- Les marges noires du PDF (n° 13) : à confirmer plus tard (voir `docs/QUIRKS.md`).

## Anti-objectifs (ce serait un échec même si ça marche)

- **Réduire le plan pour le faire tenir** : les libellés ne doivent pas descendre sous leur taille actuelle (11,1 px en 1280).
- Perdre des libellés visibles de formulaire (« Catégorie », « Type de métier ») ou casser un critère WCAG 2 AA (axe doit rester vert, focus visible, clavier complet).
- Retirer du sens de l'encart après le quiz : le top 3 avec les rangs, la consigne sur la zone d'exploration et son décompte, l'idée de « point de départ, pas verdict », « Refaire le quiz ».
- Une couleur hors des tokens du design system.

## Contraintes

- Règles permanentes de `CLAUDE.md` : français, tutoiement, écriture inclusive, tokens de couleur uniquement, POM sans sélecteur brut dans les specs, commit uniquement sur demande d'Adrien, jamais de push.
- La maquette reste la référence visuelle. **Écart validé par Adrien** : l'en-tête de l'accueil (plan et liste) et l'emplacement de la légende des lignes.
- `metiers.json` n'est pas modifié (les exemples Management viennent des métiers d'évolution déjà présents).

## Approches envisagées (plan)

- **A. En-tête compact, légende des lignes dans le plan.** Titre et bascule sur une rangée, filtres et encart du quiz réduit sur une seconde, légende déplacée dans le coin haut droit du plan, qui est vide. Le plan démarre vers 260 à 300 px ; le bas défile encore sur les petites fenêtres.
- **B. A, plus un plan plafonné à la hauteur de la fenêtre.** Le plan tient entier sur les grands écrans, mais les libellés tombent à 8 ou 9 px sur les petits. Écartée : contraire au n° 6 et à l'anti-objectif.
- **C. A, plus un bouton « Plein écran »** (API Fullscreen) sur le plan. **Retenue : A + C.** A rend l'accueil utilisable tel quel, C donne le plan entier et lisible à qui en a besoin, formateur compris.

Pour le quiz, une barre de navigation collée en bas de la fenêtre a été préférée à un simple resserrement des espacements : resserrer ne gagne pas les 200 px qui manquent à 1280×590.

## Décisions

### En-tête de l'accueil (plan `#/` et liste `#/liste`)

- **Rangée 1** : à gauche, l'étiquette (« Accueil » / « Accueil · vue liste »), le titre `h1` et le chapeau ; à droite, la bascule Graphe/Liste. Seule la bascule partage la rangée avec le titre, pour que le titre tienne sur **une ligne à partir de 1280 px**. Le chapeau garde son texte et peut tenir sur deux lignes.
- **Rangée 2** : à gauche, les filtres (liste « Catégorie », bascule « Type de métier », lien « Effacer les filtres » quand ils sont actifs), avec leurs libellés visibles. À droite, l'encart du quiz en version compacte.
- **Encart compact** (`EncartQuiz`), dans ses trois états :
  - **avant le quiz** : la carte en rangée actuelle (« Par où commencer ? » + « Commencer le quiz ») ;
  - **départage en attente** : la carte actuelle (« Ton quiz attend un dernier choix. » + « Finir le quiz ») ;
  - **après le quiz** : une carte basse qui garde le top 3 en pastilles avec leur rang, une phrase de consigne avec le décompte (« Choisis 3 métiers dans ta zone d'exploration : les lignes en pointillés (5 lignes, 38 métiers). »), le rappel « point de départ, pas un verdict » et « Refaire le quiz ». Le titre `h2` « Tes 3 lignes de départ sont allumées » peut devenir plus petit ou disparaître visuellement, mais la région garde son nom accessible « Ton résultat de quiz ». Elle peut occuper deux lignes de texte.
- Sous `lg` (1024 px), les rangées passent à la ligne naturellement, sans défilement horizontal. Entre 768 et 1279 px, le titre peut passer sur deux lignes.
- **Si la cible de 300 px n'est pas atteinte**, on retire dans cet ordre (validé par Adrien), et seulement ce qu'il faut :
  1. l'étiquette « Accueil » au-dessus du titre (l'onglet « Nuage » de la barre indique déjà où on est) ;
  2. le chapeau, raccourci à une ligne : « 68 métiers sur 8 lignes. Survole une station pour voir le métier, clique pour ouvrir sa fiche. » ;
  3. le rappel « point de départ, pas un verdict » dans l'encart après le quiz (il reste sur l'écran de résultat du quiz).

  La consigne sur la zone d'exploration et son décompte ne sont jamais retirés. Ce retrait vaut pour le plan ; la liste suit, pour garder le même en-tête.

### Légende des lignes

- **Plan** : à partir de **`xl` (1280 px)**, la légende (8 pastilles `sm`) devient une carte posée dans le plan (`bg-surface`, `shadow-carte`, comme la légende des stations en bas à droite).
  - Elle est sur **une colonne de 8 rangées** (environ 230 × 225 px), dans une zone vide du tracé. Relevé en unités du viewBox 1280×720 : le coin haut gauche (x 0–320, y 0–330) est vide ; en haut à droite, seule une bande étroite l'est (x 1040–1280, y 0–330), car la ligne 4 s'étend jusqu'à x ≈ 1035. **Coin haut gauche conseillé** ; le bouton plein écran prend alors le coin haut droit.
  - Elle garde `role="group"` et `aria-label="Légende des lignes"` : contrairement à la légende des stations, elle n'est pas `aria-hidden`.
  - Elle reste dans le conteneur du plan, donc visible en plein écran.
  - **Sous `xl`**, elle revient au-dessus du plan, dans le flux, comme aujourd'hui : en dessous de 1280 px, la zone vide devient trop petite pour la carte.
  - Un test e2e vérifie qu'elle ne recouvre aucune station (ni le bouton plein écran) en 1280 et 1536 de large. *Choix de Claude.*
- **Liste** : plus de légende, chaque groupe de la liste porte déjà sa pastille. `Filtres` reçoit une prop booléenne pour ne pas afficher la légende ; le plan l'affiche lui-même, dans le conteneur. *Choix de Claude.*

### Plein écran du plan

- Bouton « Plein écran » (icône `lucide-react` `Maximize`), **dans le conteneur du plan**, dans un coin qui ne recouvre ni station, ni libellé, ni la légende (haut droit si la légende est en haut à gauche), pour rester cliquable en plein écran. Une fois en plein écran, il devient « Quitter le plein écran » (icône `Minimize`). Échap fonctionne aussi (comportement natif).
- L'élément passé en plein écran est le conteneur du plan (stations, bulle, deux légendes). En plein écran : fond `bg-fond`, plan centré horizontalement et verticalement, au plus grand qui respecte le ratio 1280/720 (`width: min(100vw, 100vh × 16/9)`). Sur un écran 16/10, il reste des bandes de fond : c'est voulu. *Choix de Claude.*
- Le bouton n'est pas rendu si `document.fullscreenEnabled` est faux (ou absent, comme dans jsdom).
- L'état suit `fullscreenchange`, pour que le libellé et l'icône restent justes après Échap.
- Filtres, top 3 et survol restent actifs en plein écran (les états viennent des contextes).

### Roadmap : colonne sticky

- Le `sticky` (`lg:sticky lg:top-6 lg:self-start`) passe de l'`aside` de `Competences` à son enveloppe dans `RoadmapPage.tsx` (enfant direct de la rangée flex), ou l'enveloppe s'étire à la hauteur de la frise. Le choix entre les deux revient au builder ; le résultat attendu est l'objectif 4.
- La colonne est plafonnée à la hauteur de la fenêtre moins ses marges (`max-h: calc(100dvh - 3rem)` environ), avec un défilement interne si les compétences d'un métier dépassent : en 1366×633, une colonne plus haute que la fenêtre aurait son bas inaccessible. *Choix de Claude.*

### Quiz : navigation collée en bas

- Dans `Question` et `Departage`, la rangée des boutons devient une barre `sticky bottom-0`, sur fond `bg-fond`, avec une séparation discrète (bordure `trait` ou ombre), sur la largeur de la colonne du quiz.
- Les espacements verticaux peuvent être resserrés (`py-8` → `py-6`, etc.) sans changer la hiérarchie typographique.
- Le focus visible des boutons ne doit pas être rogné par la barre, et la note « Il n'y a pas de bonne réponse… » reste lisible.

### Exemples de la ligne Management

- `exemplesDeLigne` (`src/pages/quiz/Resultat.tsx`) garde les métiers d'entrée de la ligne. S'il n'y en a aucun, elle prend les métiers d'évolution, dans l'ordre de `stationsDeLigne`, 3 au plus. Vérifié dans les données : Management est la seule ligne sans métier d'entrée (4 stations : CTO, Chief data officer, DSI, Engineering manager). L'affichage devient « **Par exemple, après quelques années :** CTO (directeur·rice technique), Chief data officer, DSI (directeur·rice des systèmes d'information) ». Les titres viennent tels quels de `metiers.json`. Même rendu dans `Departage`.
- La fonction renvoie de quoi choisir le libellé (par exemple `{ titres, apresQuelquesAnnees }`). La forme exacte revient au builder.

### Boutons désactivés

- Variante `ghost` de `button.tsx` : un bouton désactivé reste transparent, sans bordure ni fond, avec un texte atténué (`text-encre-douce`, opacité réduite si besoin). Il ne doit plus avoir le fond `bg-surface-muted` du survol. Les autres variantes gardent leur style désactivé actuel.

### Tableau Apec

- Les cellules d'en-tête de ligne (`th` de la première colonne) reçoivent le même filet bas que les cellules (`border-b border-trait`), dans `CartoucheApec.tsx` ou dans le composant `table.tsx` si le cas est général.

### Tests

Ordre TDD : chaque comportement commence par un test rouge.

- **Unitaires (Vitest)** :
  - `exemplesDeLigne` : la ligne Management renvoie des métiers d'évolution avec le drapeau du libellé ; une ligne avec des métiers d'entrée est inchangée ;
  - rendu « après quelques années » dans `Resultat` et `Departage` ;
  - bouton plein écran absent sans `document.fullscreenEnabled`, présent et libellé selon l'état quand on le simule ;
  - légende absente de la liste, présente dans le plan ;
  - encart après le quiz : top 3, consigne, « Refaire le quiz ».
- **e2e (Playwright, POM)** : nouvelle spec, par exemple `tests-e2e/mise-en-page.spec.ts`, ignorée par le projet `mobile`. Elle fixe ses viewports par `test.use` : **1366×633** (Windows 1366×768 avec Chrome) et **1280×590**, plus 1280×800 pour le plan. Les méthodes de mesure vont dans les page objects.
  - plan avant et après le quiz : haut du plan ≤ 300 px, `scrollWidth <= clientWidth`, titre sur une ligne ;
  - plein écran : un clic sur « Plein écran » fait du conteneur du plan l'élément en plein écran, puis « Quitter le plein écran » en sort ;
  - roadmap remplie : après un défilement de 900 px, le haut de la colonne des compétences est à 24 px (± 1). Données de test : métier visé `dev-backend` et 7 éléments répartis 3 / 2 / 1 / 0 / 1 sur 2027–2031, posés dans le stockage par une méthode du page object (même jeu que l'audit) ;
  - légende dans le plan (1280 et 1536 de large) : aucune intersection avec une station ni avec le bouton plein écran ;
  - quiz : pour chacune des 16 questions, **à l'ouverture et sans défiler**, le bas du bouton suivant (ou « Voir mon résultat ») est ≤ à la hauteur de la fenêtre ; idem au départage. Une fois la page défilée jusqu'en bas, la barre ne recouvre pas la dernière réponse ni la note (le bas de la dernière carte est au-dessus du haut de la barre) ;
  - liste après le quiz : pas de défilement horizontal, champ « Chercher un métier » visible sans défiler en 1366×633.
- Les tests existants (`npm test`, `npm run lint`, `npm run build`, `npm run e2e`, axe compris) restent verts. Plusieurs page objects et tests ciblent la légende (`Légende des lignes`) ou l'encart : les mettre à jour sans affaiblir ce qu'ils vérifient. Une assertion sur la légende de la **liste** passe sur le **plan** ; on ne la supprime que si son seul objet était la présence de la légende sur la liste, que ce design retire.
- Le test plein écran tourne sur le projet `desktop` (Chromium). Si `document.fullscreenEnabled` est faux en headless, le test le constate et le signale, il ne l'ignore pas en silence.

### Mémoire projet

En fin d'exécution : ligne dans `docs/INDEX.md`, entrée dans `docs/HANDOFF.md`, et mises à jour de `QUIRKS`, `CONVENTIONS` et `BACKLOG` si besoin. Ajouter dans `maquette/README.md` une note sur l'écart d'en-tête validé. Ajouter au rapport d'audit une section « Suites » qui pointe vers ce design.

## Laissé au builder

- La structure des composants de l'en-tête (composant partagé plan/liste ou non), les classes Tailwind exactes, les espacements, tant que les cibles mesurées sont atteintes.
- Le coin exact et les marges de la carte de légende dans le plan, tant qu'elle ne recouvre ni station, ni libellé, ni terminus, à toutes les largeurs ≥ `xl`.
- Le style exact de la barre de navigation du quiz.
- La forme du retour de `exemplesDeLigne`.
