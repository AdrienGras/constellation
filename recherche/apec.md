# Chantier Apec — notes de recherche

Source unique : `apec-2025`, « Les rémunérations des cadres dans 111 familles de métiers, édition 2025 » (PDF téléchargé depuis l'URL de `metiers.json`, 127 pages, lu le 2026-11-02). Les numéros de page cités sont ceux imprimés en pied de page ; ils coïncident avec les pages du PDF.

Les 19 familles déjà utilisées en v1.0 ont été recoupées une à une avec le PDF (médiane, D1, D9, barres Île-de-France, Autres régions, moins de 35 ans) : tous les chiffres v1.0 sont exacts. Les blocs ajoutés reprennent donc les chiffres de ces familles, dans la même forme que la v1.0, avec `rapprochement` en plus.

## Choix faits

### Correspondance directe (`rapprochement: null`) — 12 métiers

| Métier | Famille | Page | Métier Apec correspondant |
|---|---|---|---|
| `dev-bdd` | Développement informatique | 64 | Développeur·euse (la famille « Administration de bases de données » ne liste que l'administrateur·rice de BDD) |
| `dev-android` | Développement informatique | 64 | Développeur·euse |
| `dev-ios` | Développement informatique | 64 | Développeur·euse |
| `dev-mobile-multiplateforme` | Développement informatique | 64 | Développeur·euse |
| `dev-jeu-video` | Développement informatique | 64 | Développeur·euse |
| `lead-developer` | Développement informatique | 64 | Développeur·euse / Ingénieur·e études et développement |
| `architecte-logiciel` | Développement informatique | 64 | Architecte développement |
| `platform-engineer` | Infrastructures et systèmes informatiques | 60 | Ingénieur·e système (même famille que `ingenieur-devops`, `sre`, `ingenieur-cloud`, sans rapprochement en v1.0) |
| `devsecops` | Sécurité informatique | 56 | Ingénieur·e sécurité informatique |
| `ingenieur-iam` | Sécurité informatique | 56 | Ingénieur·e sécurité informatique |
| `chief-data-officer` | Big Data | 62 | Chief Data officer |
| `directeur-projet` | Gestion de projets informatiques | 53 | Directeur·rice de projets informatiques |

### Rapprochement déclaré — 12 métiers

Aucun de ces métiers n'est à `bonne` : aucune modification `fiabilite` n'est nécessaire. Chacun reçoit une `fiabilite_note` « salaire Apec rapproché de la famille « … » ».

| Métier | Famille retenue | Page | Pourquoi |
|---|---|---|---|
| `integrateur-web` | Développement informatique | 64 | Pas de métier « intégrateur » dans l'étude ; famille de `dev-frontend`, son voisin. |
| `dev-ia-embarquee` | Informatique industrielle et technique | 58 | « Ingénieur·e informatique embarquée » couvre l'embarqué, pas l'IA ; même famille que `dev-embarque`. |
| `cloud-finops` | Infrastructures et systèmes informatiques | 60 | Métier issu du cloud (`depuis` : `ingenieur-cloud`) ; famille de toute la catégorie devops-cloud. |
| `analytics-engineer` | Big Data | 62 | La famille liste data engineer et data analyst, les deux métiers entre lesquels il se situe. |
| `ml-engineer` | Big Data | 62 | Pas de famille IA ; data scientist est le métier listé le plus proche. |
| `mlops` | Big Data | 62 | Idem ; data engineer est le plus proche. |
| `ingenieur-ia-generative` | Big Data | 62 | Idem. |
| `ingenieur-computer-vision` | Big Data | 62 | Idem. Les quatre métiers IA partagent la même famille pour rester comparables entre eux. |
| `ingenieur-support-applicatif` | Production et maintenance informatique | 55 | La famille liste « Incident manager » et « Ingénieur·e de maintenance informatique ». |
| `responsable-support-it` | Production et maintenance informatique | 55 | La famille liste « Responsable de parc informatique » et « Responsable de production informatique ». |
| `devrel` | Développement informatique | 64 | Pas de famille DevRel ; la fiche indique qu'on y arrive depuis `dev-backend` / `dev-fullstack`. |
| `engineering-manager` | Direction informatique | 52 | La famille liste « Responsable informatique », qui encadre une équipe ; cohérent avec la grille Silkhom de l'EM (70–95 k€ en confirmé), proche de celle du CTO. |

### Rapprochement implicite de la v1.0 rendu explicite — 1 métier

- `product-manager` : famille « Gestion de projets informatiques » (p. 53), dont la liste (chef·fe de projet Agile, chef·fe de projet informatique, directeur·rice de projets, PMO, webmaster) ne contient aucun métier produit. Ajout de `salaires.apec.rapprochement` et d'une `fiabilite_note` ; aucun chiffre ne change et le badge reste `moyenne`. Voir aussi la proposition n° 2.

### Laissés à `null` — 2 métiers

- `technicien-systemes-reseaux` et `technicien-support` : postes de technicien, le plus souvent non cadres. L'étude Apec ne mesure que les cadres du privé ; aucune famille ne les décrit, et leur appliquer une famille de cadres afficherait un salaire qui n'est pas le leur. Leurs `fiabilite_note` v1.0 (« souvent non cadre, absent de l'Apec ») restent justes et ne sont pas touchées.

## Cas douteux

- **Notes de fiabilité écrasées.** La fusion remplace la `fiabilite_note` v1.0 par la jonction des notes des chantiers. Pour `dev-ia-embarquee` (« profil très rare »), `cloud-finops` (« métier récent, nouvelle ligne Silkhom 2026 alignée sur DevOps ») et `ingenieur-ia-generative` (« métier jeune, intitulés instables »), la note v1.0 disparaîtra si aucun autre chantier ne la reprend. Pour `devrel`, la note « aucun chiffre fiable trouvé » est de toute façon contredite par le nouveau chiffre. À vérifier au moment de la fusion.
- **`devrel`** : badge `nd` conservé (on ne relève jamais un badge) alors qu'un salaire Apec s'affiche. Autre famille envisageable : « Avant-vente et support commercial » (p. 26, médiane 56 k€), car l'ingénieur·e avant-vente présente aussi un produit technique ; écartée parce que son D9 (92 k€) reflète des parts variables commerciales que le DevRel n'a pas en général.
- **`mlops`** : l'exemple de la spec citait « Développement informatique ». J'ai retenu « Big Data » pour que les quatre métiers IA aient la même famille et parce que le MLOps vient surtout du data engineering. Écart : médiane 54 k€ (Big Data) contre 50 k€ (Développement).
- **`engineering-manager`** : il partage les chiffres de `cto` et `dsi` (médiane 77 k€). Alternative : « Direction en études, R&D » (p. 66, médiane 65 k€, IDF 75, autres régions 61, moins de 35 ans 48), mais cette famille concerne surtout l'industrie et le BTP.
- **`ingenieur-support-applicatif` et `responsable-support-it`** : la médiane de la famille (58 k€, D9 99 k€) est tirée vers le haut par les responsables de production ; elle surestime probablement un poste de support applicatif en début de carrière. Rapprochement déclaré, badge déjà à `moyenne`.
- **`integrateur-web`** : beaucoup d'intégrateur·rices ne sont pas cadres. On aurait pu le laisser à `null` comme les techniciens ; j'ai choisi le rapprochement parce que le métier figure dans la même filière que `dev-frontend` et que la spec réserve le « n.d. » aux postes non cadres par nature.
- **`dev-jeu-video`** : classé en correspondance directe (c'est un·e développeur·se), mais l'étude n'a pas de secteur jeu vidéo ; les salaires de ce secteur ne sont pas isolés.
- **`lead-developer`** : correspondance directe, mais la médiane de la famille couvre tous les âges ; elle ne distingue pas un lead d'un·e développeur·se confirmé·e.
- **`product-owner`, `scrum-master`** (v1.0) : rattachés à « Gestion de projets informatiques », proches de « Chef·fe de projet Agile ». Laissés sans rapprochement explicite.
- **`cto`** (v1.0) : « Direction informatique » liste le DSI et le responsable informatique, pas le directeur technique ; « Direction en études, R&D » serait une alternative. Pas de proposition : l'écart de sens est faible.

## Propositions de changement de chiffres

### 1. `ux-designer` — `salaires.apec`

- **Valeur actuelle** : famille « Art, création et design », médiane 45, D1 35, D9 60 ; `idf`, `autres_regions`, `moins_35_ans` à `null`.
- **Valeur proposée** : famille « Marketing digital », médiane 52, D1 37, D9 74 ; `idf` {médiane 55, D1 40, D9 77} ; `autres_regions` {médiane 46, D1 35, D9 67} ; `moins_35_ans` {médiane 45} ; `rapprochement: null`.
- **Raison** : l'Apec liste explicitement « UX designer » parmi les métiers de la famille « Marketing digital ». La famille « Art, création et design » liste designer, graphiste, web designer, infographiste 3D, styliste…, mais pas l'UX. Conséquence à noter : `ui-designer` (web designer, famille Art) et `ux-designer` n'auraient plus les mêmes chiffres.
- **Source** : apec-2025, famille « Marketing digital », p. 90 (liste des métiers et chiffres) ; famille « Art, création et design », p. 39.

### 2. `product-manager` — `salaires.apec`

- **Valeur actuelle** : famille « Gestion de projets informatiques », médiane 57, D1 41, D9 79 ; `idf` {63, 45, 87} ; `autres_regions` {52, 39, 73} ; `moins_35_ans` {48} (rapprochement rendu explicite par ce chantier).
- **Valeur proposée** : famille « Marketing digital », médiane 52, D1 37, D9 74 ; `idf` {médiane 55, D1 40, D9 77} ; `autres_regions` {médiane 46, D1 35, D9 67} ; `moins_35_ans` {médiane 45} ; `rapprochement: null`.
- **Raison** : l'Apec liste « Chef·fe de produit digital » dans la famille « Marketing digital » ; c'est le seul métier produit numérique nommé dans l'étude. Confiance moyenne : le product manager d'un éditeur logiciel est plus technique que le chef de produit digital d'un service marketing. Si la proposition est refusée, le rapprochement explicite déjà posé reste valable.
- **Source** : apec-2025, famille « Marketing digital », p. 90 ; famille « Gestion de projets informatiques », p. 53.
