# RadioGroup

Choix exclusif dans un `fieldset` + `legend`. `variant: 'carte'` pour le **quiz** : grandes cartes lettrées A à D, toute la carte est cliquable, la sélection passe en `primaire`. `variant` par défaut (liste) pour les formulaires, comme le type d'un item de roadmap.

Props : `legend` (obligatoire : c'est la question), `legendeMasquee` si un titre visible la répète déjà, `options: [{ value, label, description? }]`, `defaultValue`, `onValueChange`, `name`.
