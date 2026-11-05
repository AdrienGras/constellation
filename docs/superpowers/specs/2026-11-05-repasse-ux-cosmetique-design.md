# Repasse UX cosmétique (audit n° 7 à 13, plus n° 14) — design

Date : 05/11/2026. Branche : `repasse-ux-cosmetique` (depuis `main`, `bf6284e`). Audit : `docs/ux/repasse-2026-11/rapport.md`, sections 7 à 13. Première repasse : `2026-11-05-repasse-ux-resolutions-design.md`.

## Intention

Fermer les points cosmétiques restants de l'audit des résolutions de PC portable. Contrainte : ne rien perdre des gains de la première repasse. Il faut garder le haut du dessin du plan à 300 px au plus, et « TA FORMATION » visible sans défiler en 1366×633, dans les trois états du quiz. Adrien ajoute un n° 14 : après le quiz, la zone d'exploration ne doit plus attirer l'œil plus que le top 3.

**Non-objectifs** : le n° 6 (textes de 13 à 15 px, libellés à 11 px) reste au BACKLOG. Le n° 11 (métiers voisins sur deux lignes en 1280) est gardé tel quel, comme l'a jugé l'audit.

**Anti-objectifs** :
- casser les tests de `tests-e2e/mise-en-page.spec.ts` ;
- atténuer les stations hors du top 3 (voir le n° 14) ;
- passer sous le contraste AA.

## Mesures préalables (05/11/2026, build de production)

- **N° 13 confirmé.** Avec `printBackground: true`, la marge `@page` de 15 mm sort en `rgb(18,18,18)`. Une feuille `color-scheme: light` sous `@media print` la fait sortir en blanc.
- **N° 7, plan pleine largeur** (jusqu'à `max-w-[1280px]`) : le haut du dessin est inchangé. Le bas du centre en 1366×633 après le quiz passe de 630 à **633 px**, pour une fenêtre de 633 : la marge tombe à zéro. En 1280, le dessin passe de 1184×666 à 1280×720, et les libellés sont à 12 px.
- **N° 7, liste « Catégorie » à 280 px** : l'encart du quiz passe à la ligne. Le haut du plan monte à 288 px en 1366 après le quiz et à **306 px** en 1280×590, au-delà de la cible de 300.
- **N° 12.** Les liens des stations sont ronds (`rounded-full`), et le clic suit le cercle. Leurs centres sont au plus près à 35,9 unités du viewBox (en diagonale). Le chevauchement de 9 à 11 px relevé par l'audit est celui des rectangles. Pour des cercles de 34 px, il n'y a de chevauchement réel qu'en dessous de 1212 px de large.
- **N° 10.** En 1280, la piste des barres fait 662 px. À 1536, elle fait 816 px.

## Approches retenues

| N° | Décision | Écartées |
|---|---|---|
| 7 | Plan en pleine largeur de la page (il sort du `px-12`, plafonné à 1280 px). L'en-tête passe de `pt-4` à `pt-3` (4 px de moins) pour rendre la marge sous le centre en 1366×633. La légende dans le flux (sous 1280 px) prend `gap-x-4 gap-y-2`, comme dans la maquette. **La liste « Catégorie » reste à 240 px** : à 280 px, la cible des 300 px saute (accord d'Adrien). | Liste à 280 px ; plan gardé dans le `px-12` |
| 8 | Les 4 actions d'un élément de roadmap passent **sur une rangée**, en haut à droite (`flex-row`). Sous `sm`, la rangée se place sous le contenu, alignée à droite, pour laisser la largeur au titre. Une carte avec un titre d'une ligne passe d'environ 150 px à environ 90 px. | Grille 2×2 (encore environ 106 px de haut) |
| 9 | Cellule « Date » en `whitespace-nowrap`. | — |
| 10 | Piste des barres plafonnée à 640 px (`max-w-[640px]`), soit à peu près sa largeur en 1280. Au-delà, l'espace libre va à droite de la barre. | Plafonner le tableau entier |
| 11 | Gardé tel quel. | — |
| 12 | (a) La bulle passe **sous** la station quand, placée au-dessus, son haut sortirait de la fenêtre (marge de 8 px). La mesure se fait au rendu, dans un `useLayoutEffect`, et le côté est recalculé à chaque changement de station. (b) Le diamètre des cibles suit la largeur du plan : `w-[clamp(24px,2.75%,34px)]` avec `aspect-square`. Il vaut 34 px à partir de 1237 px de plan, et ne descend jamais sous les 24 px de WCAG 2.5.8. (c) Le disque central passe d'un rayon de 30 à 34 : la corde à la hauteur de « FORMATION » passe de 57 à 65 unités, pour un texte d'environ 58 unités. La station la plus proche du centre est à 78 unités. | Bulle bornée par décalage vertical ; texte réduit à 9 |
| 13 | `color-scheme: light` sur `:root` sous `@media print`, dans `impression.css`. | Retirer la balise meta (l'écran perdrait ses contrôles natifs sombres) |
| 14 | Après le quiz, les 5 lignes hors du top 3 sont **atténuées par leurs tracés seulement** : le fond des quartiers et le trait de la ligne passent à une opacité d'environ 0,4. Leurs stations, leurs numéros de terminus et leurs libellés de quartier gardent leur plein contraste. Le pointillé de 52 de large disparaît. La pastille « Zone d'exploration » de la légende devient un trait pâle de la même opacité. Le top 3 reste épaissi et lumineux. Cela revient sur la décision de la maquette (« reste du plan non atténué »), à la demande d'Adrien (05/11/2026). | Retirer seulement le pointillé ; tout atténuer comme un filtre (confusion avec l'état `attenue` des filtres, et message « pas pour toi » pendant l'exploration) |

## Tests de non-régression (e2e, Page Object Model)

Chaque test vise un point mesurable. Les mesures passent par `tests-e2e/pages/`, et aucun sélecteur brut n'apparaît dans les specs.

- **N° 7** : en 1280×800, le dessin du plan fait la largeur de la fenêtre (à 1 px près). Les tests des 300 px et du centre restent verts. Le bas du centre en 1366×633 garde au moins 2 px de marge.
- **N° 8** : en 1280×800 avec `ROADMAP_AUDIT`, un élément au titre d'une ligne fait au plus 110 px de haut.
- **N° 9** : sur la page Sources, chaque cellule « Date » tient sur une ligne (`nombreDeLignes`, collection comptée).
- **N° 10** : en 1536, sur la fiche `dev-backend`, la piste fait au plus 640 px.
- **N° 12** :
  - après défilement, une station du haut du plan survolée a sa bulle entièrement dans la fenêtre (test `elementFromPoint` aux 4 coins) ;
  - en 1280×800, aucun couple de stations n'a des cercles cibles qui se chevauchent (distance des centres au moins égale au diamètre ; 68 stations comptées) ;
  - le texte « FORMATION » tient dans le disque.
- **N° 13** : en média `print`, le `color-scheme` calculé de `:root` vaut `light`. Une vérification manuelle du PDF (`pdftoppm`, pixel de la marge) se fait avant et après, et son résultat va dans la section « Suites » du rapport.
- **N° 14** : test unitaire (Vitest). Après le quiz, les tracés hors du top 3 ont une opacité inférieure à 1 et plus de pointillé, et aucune station n'est `data-attenue` sans filtre.

## Laissé à l'exécutant

- Valeurs exactes d'opacité, dans les bornes AA pour le texte et les stations.
- Nommage des méthodes de page object.
- Remesurer les cibles après coup et mettre à jour la section « Suites » du rapport.
