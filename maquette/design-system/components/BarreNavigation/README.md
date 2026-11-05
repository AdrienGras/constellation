# BarreNavigation

Barre du haut de toutes les pages : logotype « constellation » (un tronçon de ligne et deux stations), liens **Nuage · Quiz · Roadmap · Sources** (la page courante en `primaire` + `aria-current="page"`), zone `fin` pour l'état d'enregistrement. Le lien « Aller au contenu » apparaît au premier Tab et vise `#contenu`. Pas de menu latéral.

`routes` (facultatif) associe chaque page à son adresse : `{ nuage, quiz, roadmap, sources }` ; sans lui, les liens visent `#nuage`, `#quiz`…
