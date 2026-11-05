# Handoff — état courant du projet

Notes informelles à destination de la prochaine session (humaine ou Claude). Format
libre, **antéchronologique** : l'entrée la plus récente en haut.

**À mettre à jour à la fin d'une session significative.** Pas besoin de noter chaque
petit truc — l'idée est de se resituer en 30 secondes en début de session.

Chaque entrée est un titre `## AAAA-MM-JJ — Titre court de la session`, suivi de
quatre marqueurs en **gras**, chacun en tête de paragraphe, dans cet ordre :
`**Dernière chose faite**`, `**Trucs en suspens**`, `**Prochaine chose à creuser**`,
`**Notes pour future Claude**`.

**Ces quatre marqueurs sont obligatoires, exactement sous cette forme — jamais en
sous-titres `###`, jamais en prose libre sans eux.** Le hook `SessionStart` extrait
le digest de resituation injecté à chaque démarrage de session en cherchant CES
marqueurs précis dans la dernière entrée. Une entrée qui ne les porte pas dégrade
silencieusement la resituation vers un extrait brut des 2000 premiers caractères du
corps, sans distinction entre ce qui est fait, en suspens, ou à creuser.

---

## 2026-11-05 — Maquette jouable de bout en bout (passe d'interactivité)

**Dernière chose faite** : 3 commentaires d'Adrien traités et résolus sur le canevas (encarts qui débordaient sur E1/E2, texte des boutons-liens blanc au survol). Puis, à sa demande, passe d'interactivité : routes de la barre de navigation sur tous les écrans (nouvelle prop `routes` de `BarreNavigation`), bascule Graphe / Liste en liens (items `href` de `ToggleGroup`), plan E1/E2 avec infobulle, focus clavier et liens voisins sur les 68 stations, filtres catégorie / type actifs (plan et liste), roadmap E11 où l'on change de métier visé en direct, menu mobile et accordéons + recherche sur M1. Logique testée hors navigateur avec node. Post-it vert « Comment jouer la maquette » à gauche d'E1. Artboards copiés dans `maquette/canevas/`.

**Trucs en suspens** : **maquette validée par Adrien le 05/11** (« les maquettes sont bonnes »), écarts au design compris. Seules 4 fiches sont modélisées (les autres stations disent « Fiche non modélisée dans la maquette »). Le résultat du quiz n'allume pas E2 en direct (état non partagé entre artboards). Rien n'est commité.

**Prochaine chose à creuser** : **implémentation**, confiée par Adrien à un thread T3 dédié (Opus 5.5, effort high, superpowers) : design d'implémentation court → `superpowers:writing-plans` → exécution. Pile actée le 05/11 : React + Vite + Tailwind CSS + shadcn/ui, `lucide-react`, build statique GitHub Pages. Références : PRD, `docs/superpowers/specs/2026-11-02-maquette-design.md` (section « Révision du 4 novembre »), `maquette/` (design system, canevas, `plan.json`).

**Notes pour future Claude** : le scratchpad est **vidé entre deux sessions** : travailler depuis `maquette/` (source de vérité locale) ou relire les fichiers du canevas avec `Artifact read` (`paths`), qui les enregistre sous `scratchpad/artifact-files/<id>/project/` ; ce dossier peut servir directement de `root` pour republier. Ordre : publier le design system, puis recopier `bundle.js` / `bundle.css` dans le canevas (`{"artifact", "path"}`) et monter `designSystems[0].version`. Les styles passés en trou `style="{{x.style}}"` sont des objets JS (camelCase).

## 2026-11-04 — Design system « constellation » validé et canevas des 16 maquettes publié

**Dernière chose faite** : brainstorming de la maquette (spec `docs/superpowers/specs/2026-11-02-maquette-design.md`, section « Révision du 4 novembre » qui fait foi), puis bascule sur les artefacts claude.ai. Design system **validé par Adrien** : https://claude.ai/artifact/VHX2ssXV1wRTpzDimUkkge (thème sombre unique, 8 lignes fluo, WCAG AA vérifié sur 121 paires, 23 composants dont `CartoucheSilkhom` / `CartoucheApec` qui appliquent seuls les règles de salaires). Canevas publié : https://claude.ai/artifact/WzcbrRpVeq6Ghw9aUgXevM — E1–E13 desktop (nuage, après quiz, liste, 4 fiches, quiz jouable, résultat, roadmap vide / remplie jouable / A4, sources), M1–M3 mobile, page Références. Règle « premier emploi » précisée par Adrien (badge réservé aux métiers d'entrée ; phrase « Métier d'évolution… » sinon) et reportée dans la PRD. Sources de la maquette copiées dans `maquette/` (non commitées).

**Trucs en suspens** : Adrien n'a **pas encore relu le canevas** ni validé ses 3 écarts au design (pôle central « ta formation », E2 sans atténuation, salaires après le contenu) ; je n'ai jamais vu le rendu des artboards dans claude.ai (aucune capture possible) : des hauteurs ou des composants peuvent être cassés. Passe d'interactivité restante (BACKLOG). Rien n'est commité : PRD modifiée, spec maquette, mémoire projet, dossier `maquette/`. `meta.unites` de `metiers.json` énonce encore l'ancienne règle « premier emploi ».

**Prochaine chose à creuser** : lire les commentaires d'Adrien sur le canevas (`ArtifactComments` action `read` sur l'URL du canevas), corriger, puis faire la passe d'interactivité (infobulle sur toutes les stations, filtres actifs, liens de toutes les fiches) jusqu'à ce qu'Adrien puisse jouer le parcours complet. Ensuite seulement : plan d'implémentation (`superpowers:writing-plans`), pile React + shadcn à acter.

**Notes pour future Claude** : le canevas et le design system se modifient par l'outil `Artifact` (publish avec `url` + `root` ; index `canvas.json` / `design-system.json` relu avant chaque publication qui le touche). Un fichier copié côté serveur d'un autre artefact (`{"artifact", "path"}`) doit être **listé** (`action: list, scope: files`) avant d'être republié, sinon refus. Les artboards chargent `ds/constellation/tokens.css`, `components/bundle.css` puis `bundle.js` ; toute modif du bundle = publier le DS puis recopier ces fichiers dans le canevas et monter la version dans `designSystems`. Le dossier de session (scratchpad) disparaît : les scripts utiles sont dans `maquette/outils/` (chemins à adapter). Adrien aime : le sombre fluo, les décisions argumentées courtes ; il a refusé : le thème clair, les couleurs « strictes ».

## 2026-11-02 — Données metiers.json v1.1 livrées et relues ; bootstrap de la mémoire projet

**Dernière chose faite** : phase données terminée et poussée sur `main` (7fc69bb). `metiers.json` v1.1 : salaires Apec/Silkhom complétés (rapprochements déclarés avec raison), 62 codes ROME, parcours, 29 liens roadmap.sh, 8 macro-branches, quiz de 16 questions. Adrien a relu tout `relecture.md` point par point ; toutes ses décisions sont appliquées (section « Décisions d'Adrien » en fin de `relecture.md`), les 36 `a_relire` sont à `false`. PRD mise à jour (plus de mode hors ligne, GitHub Pages seul ; règle « salaire cible » ; tranches en années). Mémoire projet amorcée (`/init-memory`).

**Trucs en suspens** : pile technique de l'app non choisie (la maquette sera basée sur shadcn, donc React probable — à confirmer avec Adrien). Licence des textes (CC BY 4.0 proposée) à décider. Question à Yoan sur le seuil de 12 élèves (article 8) et l'absence du groupe B2-I. Configuration GitHub Pages. Envoi du lien à scolarite-orleans@coda.school au plus tard le 21/05/2027.

**Prochaine chose à creuser** : **maquette des 5 écrans** (nuage, fiche, quiz, roadmap, sources) façon Figma, basée sur shadcn, à faire valider par Adrien AVANT plan et implémentation. Ordre décidé par Adrien : maquette → validation → plan → implémentation → publication. Commencer par la brainstorming (superpowers) et lire la PRD en entier (8 Ko) : elle est la référence fonctionnelle.

**Notes pour future Claude** :
- Contraintes d'affichage à porter dans la maquette (PRD, « Règles d'affichage ») : Silkhom (brut fixe) et Apec (fixe + variable, cadres) jamais sur le même graphique ni la même colonne ; chaque bloc présenté comme **« salaire cible »**, pas un salaire de sortie d'études ; Apec = « médiane des cadres, toutes expériences, pas un salaire d'embauche » ; la 1re tranche Silkhom en régions n'est signalée « la plus proche d'un premier emploi » que si `annees_min == 0`, sinon « pas de premier emploi direct : métier accessible après N ans d'expérience » ; tranches affichées en années (« 0–2 ans », « N ans et plus »), jamais `junior/confirmé/senior/expert` ; un `rapprochement` non nul s'affiche avec sa `raison` ; valeur absente = « n.d. », jamais une estimation ; zone par défaut « régions » (Dijon) ; badge de fiabilité (`bonne`/`moyenne`/`faible`/`nd`) ; `roadmap_url` optionnel (29/68).
- Public : ~10 étudiants de B2 CODA Dijon, majoritairement attirés par le back-end, bagage théorique limité, en cycle initial ou quelques semaines d'alternance. Journée TEM du 28/05/2027 ; le formateur projette l'app (vidéoprojecteur), les étudiants l'utilisent sur leur portable. Desktop d'abord, lisible sur mobile. Accessibilité : contrastes, clavier, vue liste alternative au graphe.
- Nuage : graphe façon Obsidian, 68 nœuds, couleur par catégorie (17), catégories ancrées à des positions fixes, arêtes = voisins (175 paires). Après le quiz : top 3 des macro-branches mis en évidence, le reste signalé comme zone d'exploration (explorer 3 métiers hors top 3).
- Roadmap : grille imposée 2027→2031, items typés (« projet à réaliser » / « notion à apprendre »), titre, URL, note ; réordonnancement ; localStorage protégé ; export PDF via impression (A4, une année par bloc, sans fond) ; export/import JSON.
- Langue : français, tutoiement, écriture inclusive cohérente avec les fiches (« Développeur·se »).
- Données : ne jamais relancer `fusionner.py` ; corriger `metiers.json` par script Python (même format d'écriture) puis `valider.py`.
