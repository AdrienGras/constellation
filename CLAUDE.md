# constellation — app métiers du numérique (module TEM, CODA Dijon)

Web app statique (GitHub Pages) pour la journée « Construire son avenir dans le numérique » du 28/05/2027 : ~10 étudiants de B2 découvrent les métiers (quiz, nuage, fiches) puis construisent une roadmap 2027–2031. Référence fonctionnelle : `PRD — App métiers du numérique (module TEM, CODA).md`.

## Règles permanentes

- Tout échange, texte d'interface et commit en **français** ; tutoiement côté étudiant ; écriture inclusive cohérente avec les fiches (« Développeur·se »).
- `metiers.json` est l'**unique source de données** de l'app (aucun appel réseau à l'exécution). Ne jamais relancer `scripts/fusionner.py` dessus ; le modifier par script Python (voir `docs/CONVENTIONS.md`) puis `python3 scripts/valider.py metiers.json`.
- Salaires : toujours présentés comme **salaires cibles**, jamais comme salaires de sortie d'études ; Silkhom et Apec jamais sur le même graphique ni la même colonne ; valeur absente = « n.d. », jamais une estimation (détails : PRD, « Règles d'affichage »).
- Ordre de travail décidé par Adrien : maquette (shadcn) → validation → plan → implémentation → publication. **La maquette est validée (05/11/2026)** : c'est la référence visuelle et comportementale de l'implémentation (`maquette/README.md`).
- Pile technique : React + Vite + Tailwind CSS + shadcn/ui (icônes `lucide-react`), site statique pour GitHub Pages. Thème sombre unique ; couleurs et composants repris du design system « constellation » (`maquette/design-system/`), contraste WCAG 2 AA obligatoire.
- Commit et push uniquement sur demande d'Adrien.

<!-- MEMORY_BLOCK_START -->
## Mémoire projet

<!-- MEMORY_V2_ADDITIONS_START -->
### Chargement automatique (v2)

Le hook `SessionStart` de ce dépôt injecte automatiquement, à chaque démarrage de session, un
snapshot de resituation basé sur trois natures de documents :

| Nature | Fichiers | Chargement |
|---|---|---|
| Journal temporel | `HANDOFF.md` | corps des `K=3` dernières entrées + index de tous les titres, plus l'index des titres des archives (borné à 12 mois) |
| Catalogue perpétuel | `QUIRKS.md` | tous les titres, corps à la demande |
| Référence | tout autre `docs/*.md` racine, **`ENVIRONMENT.md` compris** | contenu entier sous 4 Ko, sinon index des titres avec numéros de ligne |

**Tu n'as donc plus besoin de lancer `/load-memory` pour te resituer en début de session** — c'est
déjà fait. La commande ne sert plus qu'à charger **davantage** : le corps complet d'un fichier
au-delà de ce que le hook a injecté, ou l'intégralité du scaffold. Sans argument, elle ne charge
rien du tout — elle affiche juste la carte des sections disponibles.

### Règles de déclenchement

- *Avant d'écrire du code d'un type donné* : lancer `grep -n '^## ' docs/CONVENTIONS.md`, repérer
  la section pertinente, puis `Read` avec `offset`/`limit` sur cette seule section. Ne jamais
  charger le fichier entier pour écrire un seul composant.
- *Jamais en entier, sans exception* : ne jamais `Read` un `docs/*.md` sans `offset`/`limit`.
  Pour `docs/ENVIRONMENT.md` en particulier — à consulter avant toute commande non-triviale —
  repère la section pertinente dans son index (`grep -n '^## ' docs/ENVIRONMENT.md`) puis lis
  cette plage précise avant de lancer la commande ; ne le charge jamais en bloc.
- *Jamais deux fois* : ne pas relire un fichier déjà lu dans la session courante ; son contenu est
  encore dans le contexte.
- *Écrire une entrée `HANDOFF.md`* : toujours poser les quatre marqueurs en gras du gabarit
  (`**Dernière chose faite**`, `**Trucs en suspens**`, `**Prochaine chose à creuser**`,
  `**Notes pour future Claude**`). Le digest de resituation injecté au démarrage extrait son
  contenu par ces marqueurs ; une entrée en prose libre dégrade silencieusement la resituation
  vers un extrait brut des 2000 premiers caractères du corps.
- *L'aperçu est tronqué* : le contexte injecté au démarrage est un **aperçu** ; le snapshot
  complet est dans `.git/memory-snapshot.md`. S'il ne suffit pas, lance `/load-memory` sans
  argument pour obtenir la carte de ses sections (une commande, pas une lecture), puis relance
  `/load-memory` avec un argument explicite (`full`, un entier, ou un nom de fichier) pour
  charger quoi que ce soit. Ne lis jamais ce fichier en entier ni par plage devinée.
<!-- MEMORY_V2_ADDITIONS_END -->

### Pour approfondir

- **`docs/HANDOFF.md`** — état courant, dernière chose faite, trucs à savoir tout de suite.
  Injecté par le hook (3 dernières entrées + index) ; `/load-memory HANDOFF` ou `/load-memory full`
  pour l'historique complet.
- **`docs/INDEX.md`** — catalogue des features livrées avec liens vers spec/plan.
- **`docs/ENVIRONMENT.md`** — paths, services, env vars, accès. Injecté par le hook en entier
  sous 4 Ko, sinon en index de titres seul ; à consulter avant de lancer toute commande
  non-triviale (par plage si dégradé en index).
- **`docs/STYLE.md`** — voix et prose, gabarits par genre de contenu, si le projet en a un.
- **`docs/QUIRKS.md`** — pièges et comportements non-évidents. Injecté par le hook sous forme
  d'index de titres seul ; `Read` la plage voulue (ou `/load-memory QUIRKS`) pour le corps d'un
  piège précis.
- **`docs/BACKLOG.md`** — idées et améliorations identifiées mais non urgentes.
- **`docs/CONVENTIONS.md`** — skeletons de code et règles tacites.
- **`docs/superpowers/specs/`** — design docs détaillés par feature.
- **`docs/superpowers/plans/`** — plans d'implémentation détaillés par feature.
- **`docs/handoff/`** — archives du journal `HANDOFF.md`, une par mois (`<AAAA-MM>.md`), déplacées
  là par `rotate-memory.sh` une fois le mois révolu. **Non chargé automatiquement** ; s'y rendre via
  le lien du bloc de pointeurs en tête de `docs/HANDOFF.md`.
- **`docs/reference/`** — rangement optionnel pour de la référence réellement hors-sujet. Rôle
  déclassé par rapport au v1 (où c'était l'unique ligne de défense du contexte) : un fichier
  thématique volumineux ne coûte plus rien, il passe en index automatiquement. **Non chargé
  automatiquement.**

### À mettre à jour DURANT la session (decision tree — une question = un fichier)

| Tu découvres ou décides… | Fichier |
|---|---|
| Une règle qui s'applique TOUJOURS au projet | `CLAUDE.md` |
| Une règle de **voix / ton / rédaction** de contenu de cours | `docs/STYLE.md` |
| Un squelette de code récurrent | `docs/CONVENTIONS.md` |
| Une feature livrée | ajouter une ligne dans `docs/INDEX.md` + spec/plan dans `docs/superpowers/` si non-trivial |
| Où vit un container, un path, un port, un accès | `docs/ENVIRONMENT.md` |
| Un comportement non-évident, un piège | `docs/QUIRKS.md` (ajouter dès la découverte, pas plus tard) |
| Une idée future / nice-to-have | `docs/BACKLOG.md` |
| L'état mental d'une session significative | `docs/HANDOFF.md` (en fin de session) |

### Règle de fin d'implémentation (NON-NÉGOCIABLE)

À la fin de toute implémentation significative (feature livrée, refactor majeur, bug fix non-trivial, nouvelle commande/script), **avant de signaler la fin du travail**, tu DOIS :

1. **Mettre à jour `docs/INDEX.md`** — ajouter une ligne dans la table correspondante (feature, commande, etc.).
2. **Mettre à jour `docs/HANDOFF.md`** — ajouter une entrée datée en haut (sous le titre H1) avec : `Dernière chose faite`, `Trucs en suspens`, `Prochaine chose à creuser`, `Notes pour future Claude`.
3. **Mettre à jour `docs/QUIRKS.md`** si tu as découvert un piège non-évident pendant l'implémentation.
4. **Mettre à jour `docs/BACKLOG.md`** si tu as identifié des améliorations futures que tu n'as pas implémentées.
5. **Mettre à jour `docs/CONVENTIONS.md`** si tu as introduit un nouveau pattern qui doit être reproduit.
   **Mettre à jour `docs/STYLE.md`** si tu as établi/affiné une règle de voix ou de rédaction.
6. **Mettre à jour `docs/ENVIRONMENT.md`** si tu as ajouté/découvert un service, path, port, env var.
7. **Mettre à jour `CLAUDE.md`** si tu as établi une règle qui s'applique toujours au projet.

Ces mises à jour font partie de la définition de "terminé". Une feature livrée sans mise à jour de la mémoire est une feature à moitié livrée.
<!-- MEMORY_BLOCK_END -->
