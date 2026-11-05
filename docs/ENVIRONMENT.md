# Environnement du projet

Carte des paths, services, accès, commandes. À jour au fil des découvertes.

À consulter **avant de lancer toute commande non-triviale**.

---

## Repo

- **Path hôte** : `/srv/AdrienGras/constellation`
- **Remote** : `git@github.com:AdrienGras/constellation.git` (`origin`)
- **Branche par défaut** : `main`
- **Convention de merge** : une branche par chantier (`donnees-v1.1`…), fusion locale `--no-ff` dans `main` puis push, sur demande d'Adrien uniquement. Commits en français, avec le trailer `Co-Authored-By`.

## Stack d'exécution

- **Runtime** : Python 3.12, bibliothèque standard seule, pour les scripts de données. La pile de l'app n'est **pas encore choisie** ; Adrien a demandé une maquette basée sur **shadcn**.
- **Commandes principales** :
  - `python3 scripts/valider.py metiers.json` : valide le jeu de données (code 0 si tout va bien).
  - `python3 -m unittest discover -s tests -t . -v` : 56 tests (validateur, fusion, validité du vrai `metiers.json`).
  - `python3 scripts/fusionner.py --essai` : dry run de la fusion `recherche/` → `metiers.json`. **Ne plus lancer sans `--essai`** : refuse sur une v1.1 sans `--force` (voir QUIRKS).

## Fichiers clés

| Fichier | Rôle |
|---|---|
| `PRD — App métiers du numérique (module TEM, CODA).md` | PRD de l'app (5 écrans, règles d'affichage, contraintes) |
| `metiers.json` | **Unique source de données de l'app** (v1.1) : meta, categories, macro_branches, quiz, metiers, sources |
| `relecture.md` | Relecture des 36 fiches + décisions d'Adrien (02/11/2026), toutes appliquées |
| `recherche/` | Trace des recherches (Apec, Silkhom, ROME/parcours, roadmap.sh) ; historique, plus appliqué |
| `scripts/`, `tests/` | Validateur et script de fusion |
| `docs/superpowers/specs/`, `plans/` | Design et plan de la phase données |

## Services

| Service | Rôle | Accès |
|---|---|---|
| GitHub Pages | Hébergement cible de l'app (100 % statique, pas de backend) | à configurer |

## Variables d'environnement

| Bloc | Variables clés |
|---|---|
| — | aucune |

## Accès / secrets

- Aucun secret. Pas de tracking, pas de compte, pas d'appel réseau à l'exécution.
