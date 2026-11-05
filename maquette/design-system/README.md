constellation présente les 68 métiers du numérique comme un **plan de métro** : chaque grande famille de métiers est une ligne numérotée, chaque métier une station. L'app sert une journée d'orientation (CODA Dijon, étudiant·es de 2e année) : on la projette au vidéoprojecteur dans une salle éclairée, et chacun·e l'utilise sur son portable. Desktop d'abord, lisible sur mobile. **Thème sombre uniquement** : un fond graphite qui laisse les lignes fluo faire tout le spectacle.

## Voix et contenus

- **Tutoiement** côté étudiant·e, phrases courtes, verbes d'action : « Fais le quiz pour voir tes 3 lignes de départ. »
- **Écriture inclusive** au point médian, cohérente avec les fiches : « Développeur·se back-end », « étudiant·es ». Pas de doublets « il ou elle ».
- **Casse** : titres et boutons en minuscules après la majuscule initiale (« Exporter en JSON »). Le nom de l'app s'écrit toujours **constellation**, en minuscules.
- **Pas de verdict** : le résultat du quiz est « un point de départ, pas un verdict ». On dit « tes 3 lignes de départ », jamais « ton profil » ni « ton métier idéal ».
- **Vocabulaire réservé** : « ligne » désigne une des 8 familles du plan. Les lignes de la grille Silkhom (Java, Python…) s'appellent **profils Silkhom** à l'écran.
- **Pas d'emoji**, pas de point d'exclamation, pas de superlatif.
- **Une donnée absente s'écrit « n.d. »**, jamais une estimation, un tiret ou un vide.

### Les salaires (règles strictes)

- Chaque bloc s'intitule **« Salaire cible »** : un salaire à viser après quelques années, **jamais** un salaire de sortie d'études.
- **Silkhom** (brut annuel fixe) et **Apec** (fixe + variable, cadres) ne vont jamais sur le même graphique, dans la même colonne, ni côte à côte : deux cartouches empilés (`CartoucheSilkhom`, `CartoucheApec`), séparés par la phrase « Ces deux sources ne mesurent pas la même chose : ne les compare pas entre elles. »
- Le cartouche Apec commence par « Médiane des cadres, toutes expériences, pas un salaire d'embauche. »
- Les tranches Silkhom s'écrivent en années (« 0–2 ans », « 6 ans et plus »), jamais junior / confirmé / senior / expert.
- Badge « la plus proche d'un premier emploi » : première tranche, zone Régions, qui commence à 0 an, **métier d'entrée** uniquement. Les cartouches appliquent ces règles d'eux-mêmes : ne pas les reconstruire à la main.

## Fondations visuelles

### Couleur

- **Un seul thème, sombre.** Fond graphite bleuté, lignes fluo. Ne jamais écrire une couleur en dur : tout passe par les tokens.
- **Fond et texte** : la page est en `fond` ; cartes, cartouches et champs en `surface` avec `ombre-carte` (un liseré clair à 5 % plus une ombre portée). Texte en `encre`, texte secondaire en `encre-douce`. Les deux passent 4,5:1 sur `fond`, `surface`, `surface-muted` et sur tous les fonds de ligne.
- **L'interface est neutre, les données sont en couleur.** Boutons principaux, lien actif et sélection en `primaire`, un blanc cassé qui est l'élément le plus lumineux de l'écran (texte `sur-primaire`). Les couleurs de ligne ne servent **jamais** à un bouton ni à un élément d'interface : elles disent à quelle famille appartient un métier.
- **Les 8 lignes**, dans l'ordre de `macro_branches` : 1 Développement (bleu ciel), 2 Infra & cloud (vert), 3 Cybersécurité (rouge), 4 Data & IA (violet), 5 Qualité & architecture (orange), 6 Produit & design (rose), 7 Relation & transmission (jaune), 8 Management (cyan). Chacune a quatre tokens :
  - `ligne-<id>` : couleur fluo des trajets, stations et pastilles, ≥ 4,5:1 sur `fond` et `surface` : elle sert aussi pour du texte ;
  - `ligne-<id>-pastel` : fond sombre teinté de la ligne, pour les quartiers, les badges de ligne et le rang du quiz ;
  - `ligne-<id>-encre` : texte coloré de la ligne (alias de `ligne-<id>`), ≥ 4,5:1 sur son fond teinté, `surface` et `fond` ;
  - `sur-ligne-<id>` : le chiffre posé sur une pastille.
- **Les 17 catégories** (`cat-<id>`) sont des nuances de leur ligne, toutes ≥ 3:1 sur `fond` et `surface`. Sur le plan, une catégorie se reconnaît d'abord à son **quartier légendé** (position fixe + nom écrit) ; la nuance ne fait que renforcer.
- **Jamais la couleur seule** (WCAG 1.4.1) : une ligne a son numéro et son nom, un type de métier sa forme de station et son mot, une fiabilité son icône et son mot. Les couleurs voisines se distinguent aussi par la clarté (le violet de la ligne 4 est nettement plus sombre que le bleu de la ligne 1), pour les personnes daltoniennes.
- **États** : `succes`, `attention`, `danger`, `info` sur leur fond `-doux`, toujours avec un mot. `info` porte les mentions de prudence sur les salaires.
- **Contrastes** : tout le système est vérifié au niveau **WCAG 2 AA** (texte 4,5:1, éléments graphiques et focus 3:1).
- **Au vidéoprojecteur** : baisser la lumière de la salle autant que possible ; un fond sombre perd son contraste en pleine lumière.

### Typographie

- **Bricolage Grotesque** (`display`) pour les titres : `titre-affiche` une fois par écran, `titre-1` pour le nom d'un métier, `titre-2` pour les sections, `titre-3` pour les cartes.
- **Atkinson Hyperlegible** (`sans`) pour tout le texte : conçue pour la lisibilité, elle tient au vidéoprojecteur. `corps` 17 px, **jamais sous 16 px** pour un texte à lire ; `petit` pour les sources et aides ; `etiquette` en capitales espacées pour les surtitres et en-têtes de tableau.
- **JetBrains Mono** (`mono`) pour les chiffres : fourchettes, médianes, codes ROME, URL imprimées, toujours en chiffres tabulaires.
- Les trois familles viennent de Google Fonts dans les aperçus ; l'app finale les embarque (aucun appel réseau à l'exécution).

### Espace, formes, profondeur

- Espacements par pas de 4 px : `espace-1` (4) à `espace-8` (64). Padding des cartes `espace-5`, écart entre sections d'une fiche `espace-6`, marge de page desktop `espace-7`.
- Rayons : `rayon-sm` pour badges, champs et boutons ; `rayon-md` pour cartes et dialogues ; `rayon-lg` pour les quartiers du plan et les cartes du quiz ; `rayon-pilule` pour pastilles et barres.
- Ombres : `ombre-carte` pour ce qui est posé sur le fond, `ombre-flottante` pour infobulles, menus et dialogues. Pas de bordure colorée sur un côté de carte, pas de dégradé.
- **Focus clavier** : contour plein `focus` de 2 px, décalé de 2 px, sur tout élément manipulable (≥ 3:1 sur toutes les surfaces).
- Cibles tactiles de 44 px minimum ; 36 px seulement dans une barre d'outils dense.

### Le plan de métro

- Chaque ligne trace un trajet épais (`trace-ligne`, couleur `ligne-<id>`) en segments à 0°, 45° et 90°, numéro de ligne en pastille aux deux terminus.
- Les stations (`Station`, `station-diametre`) prennent la couleur de leur catégorie avec un liseré `surface`. **Pleine** pour un métier d'entrée, **à anneau** pour un métier d'évolution.
- Les quartiers sont des enveloppes `rayon-lg` au pastel de la ligne, nom de la catégorie écrit en `ligne-<id>-encre`.
- Les liens « voisin » (`trace-voisin`) n'apparaissent qu'au survol ou au focus d'une station.
- Après le quiz, les 3 lignes choisies restent pleines ; le reste passe en état `attenue` et est signalé « ta zone d'exploration ».

## Iconographie

Icônes **Lucide** (le jeu de shadcn/ui ; `lucide-react` à l'implémentation), trait de 2 px, 18 px dans le texte, 15 px dans un badge, en `currentColor`. Toujours décoratives (`aria-hidden`) à côté d'un mot ; un bouton icône seul porte un `aria-label`. Pictogrammes propres au système : le tronçon de ligne du logotype et les deux formes de station.

## Composants

Les primitives suivent l'anatomie de **shadcn/ui** et en gardent les noms : `Button`, `Badge`, `Card`, `Tabs`, `ToggleGroup`, `Input`, `Textarea`, `Select`, `RadioGroup`, `Alert`, `Tooltip`, `Dialog`, `Table`, `Progress`. Les composants du domaine portent des noms français, comme les champs de `metiers.json` : `BarreNavigation`, `PastilleLigne`, `Station`, `BadgeFiabilite`, `BadgeType`, `PlageSalaire`, `CartoucheSilkhom`, `CartoucheApec`, `ItemRoadmap`. Ils vivent dans `window.Constellation` et attendent React 18 sur la page. Les données des cartouches se passent telles qu'elles sont dans `metiers.json` (`salaires.silkhom`, `salaires.apec`).

## Utiliser ce système

- Espace de noms du bundle : **`Constellation`** (`window.Constellation`), React 18 fourni par la page.
- Sur un canevas Design ou une page, charger dans cet ordre : `tokens.css`, `components/bundle.css` (il importe aussi les trois polices Google Fonts), puis `components/bundle.js`.
- Monter un composant : `<x-import component-from-global-scope="Constellation.CartoucheSilkhom" …>` ; les props sont celles de `components/index.d.ts`.
- Le fond de page est `var(--fond)` : le poser sur la racine de chaque écran, avec `color: var(--encre)` et `font-family: var(--font-sans)`.
