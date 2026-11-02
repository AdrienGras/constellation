# PRD — App métiers du numérique (module TEM, CODA)

Nov 2, 2026 · @Adrien

## Contexte et objectif

Une web app statique sert de support à la journée « Construire son avenir dans le numérique » (TEM) du 28/05/2027, pour environ 10 étudiants de B2 à CODA, campus CCI de Dijon. Le matin, elle sert à découvrir les métiers ; l'après-midi, à construire une roadmap d'apprentissage à 5 ans.

Les objectifs pédagogiques de la lettre de mission :

1. Découvrir une diversité de métiers de l'informatique et leurs réalités concrètes (missions, compétences, environnements).
2. Construire une roadmap d'apprentissage personnalisée (objectifs, points d'appui, étapes de progression).
3. Collaborer en équipe en tenant compte des profils, difficultés et dynamiques de chacun.

L'app porte les objectifs 1 et 2. L'objectif 3 se joue en salle, hors de l'app : pot commun de ressources et relecture croisée des roadmaps en binômes.

## Utilisateurs et déroulé

Deux utilisateurs : les étudiants, chacun sur son ordinateur, et le formateur, qui projette l'app au tableau. Les étudiants sont en 2e année, majoritairement attirés par le back-end, avec un bagage théorique encore limité.

| Créneau (indicatif) | Activité | Rôle de l'app |
| --- | --- | --- |
| 9h30–9h50 | Quiz | Calcule le top 3 de branches de chaque étudiant |
| 9h50–11h20 | Exploration de 3 métiers hors du top 3, sans doublon entre étudiants | Nuage + fiches ; la non-répétition est tenue au tableau |
| 11h20–12h00 | Préparation des présentations | Fiches consultées |
| 13h30–14h30 | Présentations au tableau, environ 5 min chacune | Fiches projetées |
| 14h30–16h30 | Construction de la roadmap à 5 ans | Page roadmap, export PDF |
| 16h30–17h00 | Relecture croisée en binômes, pot commun de ressources | Aucun (hors app) |

La cible de la roadmap est libre : l'exploration du matin peut la faire changer.

## Périmètre fonctionnel

L'app compte cinq écrans : nuage, fiche, quiz, roadmap, sources.

### 1. Nuage de métiers (accueil)

- Graphe façon Obsidian : un nœud par métier (68), une couleur par catégorie (17), une arête par lien « voisin ».
- Chaque catégorie est ancrée à une position fixe, pour que les zones aient un sens stable d'un affichage à l'autre.
- Survol : titre du métier. Clic : ouverture de la fiche.
- Filtres : catégorie, métier d'entrée ou d'évolution.
- Après le quiz, le top 3 de l'étudiant est mis en évidence et le reste du nuage est signalé comme sa zone d'exploration.
- Une vue liste équivalente existe pour le clavier et les lecteurs d'écran.

### 2. Fiche métier

- Brief, missions, compétences, « à éviter si », parcours.
- Type : entrée ou évolution ; pour un métier d'évolution, les métiers « depuis » sont cliquables.
- Salaires Silkhom : grille par tranche d'expérience, avec sélecteur de zone (Paris, grandes villes, régions). Zone par défaut : régions.
- Salaires Apec : médiane et déciles de la famille, affichés à part, avec une phrase rappelant que les deux sources ne se comparent pas.
- Badge de fiabilité et source du texte.
- Voisins cliquables ; lien roadmap.sh quand il existe.
- Une valeur absente s'affiche « n.d. », jamais une estimation.

### 3. Quiz

- 16 questions à choix ; chaque réponse pondère une ou plusieurs des 8 macro-branches.
- Résultat : un top 3 de branches, présenté comme un point de départ, pas un verdict.
- Le résultat est gardé dans le navigateur ; le quiz peut être refait.

### 4. Roadmap

- Choix libre du métier cible, dans tout le nuage.
- Les compétences de la fiche cible restent visibles à côté, comme référence.
- Grille imposée, année par année de 2027 à 2031.
- Chaque item a un type (« projet à réaliser » ou « notion à apprendre »), un titre, une ressource (URL) et une note facultative.
- Ajout, suppression et réordonnancement des items dans une année.
- Sauvegarde automatique dans le navigateur.
- Export PDF par l'impression du navigateur, en A4 lisible ; export et import JSON pour sauvegarder ou changer de machine.

### 5. Sources et mentions

- Texte de mentions et liste des sources, tirés de `metiers.json`.

## Données

Toutes les données viennent d'un seul fichier, `metiers.json` (version 1.1, 02/11/2026), embarqué dans l'app : 68 métiers, 17 catégories, 175 liens, 6 sources. Aucun appel réseau à l'exécution.

| Clé | Contenu |
| --- | --- |
| `meta` | version, unités des salaires, texte de mentions |
| `categories[]` | `id`, `libelle`, `nb` |
| `macro_branches[]` | `id`, `libelle`, `categories[]` (les 8 branches du quiz, qui regroupent les 17 catégories) |
| `quiz.questions[]` | `id`, `intitule`, `reponses[]` → `id`, `texte`, `poids` (macro-branche → 1 ou 2) |
| `metiers[]` | `id`, `categorie`, `titre`, `type` (`entree` / `evolution`), `depuis[]`, `rome`, `brief`, `missions`, `competences[]`, `a_eviter_si`, `parcours` |
| `metiers[].salaires.silkhom` | `grilles[]` → `ligne`, `niveaux[]` → `niveau`, `annees_min`, `annees_max`, `paris` / `grandes_villes` / `regions` en `[min, max]` k€ ; `moyenne_keur`, `variation_pct`, `moyenne_verifiee`, `rapprochement` ; ou `null` |
| `metiers[].salaires.apec` | `famille`, `mediane`, `d1`, `d9`, `idf`, `autres_regions`, `moins_35_ans`, `rapprochement` ; ou `null` |
| `metiers[]` (suite) | `fiabilite`, `fiabilite_note`, `source_texte`, `a_relire`, `voisins_meme_categorie[]`, `voisins_autres_categories[]`, `roadmap_url` |
| `sources[]` | `titre`, `editeur`, `date`, `url`, `usage`, `licence` |

Règles d'affichage :

- Silkhom est en brut annuel fixe, l'Apec en fixe + variable pour des cadres : jamais sur un même graphique ni dans une même colonne.
- Les tranches d'expérience varient d'une ligne Silkhom à l'autre ; les afficher telles qu'elles sont dans les données.
- `rapprochement` vaut `null` ou `{de, raison}`. Quand il est renseigné, les chiffres viennent d'un métier voisin : l'app l'affiche avec sa `raison` (« données de … »), sous le bloc de salaires concerné.
- `a_relire` n'est pas affiché. Il sert à suivre la relecture des 36 fiches concernées avant la mise en ligne.
- `roadmap_url` est renseigné pour 31 fiches sur 68 ; l'app doit tolérer son absence.

## Contraintes techniques

- **100 % statique**, hébergé sur GitHub Pages et laissé en ligne après la journée. Pas de backend, pas de compte, pas de tracking.
- **Stockage** : résultat du quiz et roadmap dans le `localStorage` du navigateur, lectures et écritures protégées. L'app reste fonctionnelle si le stockage est vide ou indisponible.
- **Cible** : ordinateurs portables des étudiants et vidéoprojecteur. Desktop d'abord, lisible sur mobile.
- **Impression** : feuille de style dédiée pour la roadmap, une année par bloc, sans navigation ni couleurs de fond.
- **Accessibilité** : contrastes suffisants, navigation clavier, et une vue liste comme alternative au graphe.
- **Pile technique** : à décider (voir décisions ouvertes).

## Hors périmètre

- Comptes, authentification, backend, synchronisation entre appareils.
- Verrouillage des métiers déjà choisis : la non-répétition est tenue au tableau.
- Pot commun de ressources et relecture croisée : en salle, au tableau ou dans un document partagé.
- Roadmap pré-remplie ou arbre de compétences récursif : la construction reste à la charge de l'étudiant.
- Version anglaise, statistiques d'usage, mobile-first.

## Décisions ouvertes et critères de fin

Le nuage, les fiches et la roadmap peuvent être développés dès maintenant. Les macro-branches sont validées : le quiz peut être développé à son tour, une fois ses questions relues.

| Décision | État | Bloque |
| --- | --- | --- |
| Regrouper les 17 catégories en macro-branches pour le quiz ; la règle « hors top 3 » porte sur ces macro-branches | Validé (8 branches) | Rien |
| Questions et pondérations du quiz | Rédigées (16 questions), à relire | Quiz |
| Pile technique | À décider | Démarrage du code |
| Licence des textes propres (CC BY 4.0 proposée) | À décider | Mise en ligne |
| Liens roadmap.sh par fiche (`roadmap_url`) | Remplis pour 31 fiches sur 68 | Rien, affichage conditionnel |
| Seuil de 12 élèves (article 8) et absence du groupe B2-I : question à Yoan | À poser | Maintien de la session |
| Relecture des 36 fiches marquées `a_relire` (`relecture.md`) | À faire | Mise en ligne |

Critères de fin :

- [ ] Les 68 métiers sont accessibles depuis le nuage et la vue liste.
- [ ] Le quiz produit un top 3, et le nuage le met en évidence.
- [ ] Une roadmap 2027–2031 se crée, se sauvegarde, se réimporte et s'imprime en A4 lisible.
- [ ] L'app tourne sur GitHub Pages.
- [ ] Tous les `a_relire` sont passés à `false`.
- [ ] Le lien GitHub Pages est envoyé à scolarite-orleans@coda.school au plus tard le 21/05/2027.
