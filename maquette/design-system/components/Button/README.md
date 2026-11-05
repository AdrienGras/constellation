# Button

Bouton d'action, anatomie du `Button` de shadcn/ui.

- **`default`** (`primaire`, blanc cassé) : l'action pour laquelle l'écran existe, **une seule fois par vue** (« Commencer le quiz », « Ajouter un item »).
- **`secondary`** : action utile mais seconde (« Refaire le quiz »).
- **`outline`** : actions d'outillage groupées (export, import, impression).
- **`ghost`** : annuler, fermer, actions répétées dans une liste.
- **`link`** : navigation dans un texte ; passer `as: 'a'` et `href`.

Le consommateur fournit le libellé, verbe d'abord, à l'infinitif et en minuscules après la majuscule (« Exporter en JSON »). Hauteur 44 px par défaut (cible tactile), 36 px en `sm` seulement dans une barre d'outils dense. Une icône seule exige `size: 'icon'` et un `aria-label`. Jamais de couleur de ligne sur un bouton : les couleurs vives sont réservées aux données.
