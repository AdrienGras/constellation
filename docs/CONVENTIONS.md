# Conventions de code

Squelettes et patterns récurrents du projet. À consulter avant de créer un nouveau
type de fichier ou de composant.

Si tu découvres un pattern récurrent : documente-le ici.

Une section par pattern (`## <Nom du pattern> — squelette`), avec le code minimal
reproductible dans un bloc de code, suivi si besoin d'une sous-section
`### Règles tacites`.

---

## Modification de metiers.json — squelette

```python
import json, sys
from pathlib import Path
sys.path.insert(0, "/srv/AdrienGras/constellation")
from scripts.fusionner import ecrire
from scripts.valider import valider

chemin = Path("/srv/AdrienGras/constellation/metiers.json")
d = json.loads(chemin.read_text(encoding="utf-8"))
m = {x["id"]: x for x in d["metiers"]}
m["dev-backend"]["rome"] = "M1855"          # une modification décidée
assert valider(d) == [], valider(d)
ecrire(chemin, d)
```

### Règles tacites

- Jamais `fusionner.py` sur la v1.1 ; jamais de lecture intégrale du fichier dans le contexte (≈ 230 Ko) : passer par des scripts.
- Tout chiffre a une source (`sources[]` par `id`). Un rapprochement : `{"de": "<libellé exact>", "raison": "<phrase lisible par un·e étudiant·e>"}` et `fiabilite` ≤ `moyenne`.
- Parcours : préfixes courts « ROME : » / « Cigref : » ; le détail (fiche, profil) va dans `source_texte_detail`.
- Quiz : situations de vie étudiante, tutoiement, inclusif ; poids 1 ou 2, 1–2 branches par réponse ; équilibre score max ≤ 10 % (validateur) et espérance au hasard ≤ 15 %.

## Fichier de chantier de recherche — squelette

```json
{"chantier": "apec", "sources_ajoutees": [], "modifications": [
  {"metier": "<id>", "champ": "salaires.apec", "valeur": {}, "source": "apec-2025, famille « … », p. N"}
]}
```

### Règles tacites

- Historique de la phase v1.0 → v1.1 (`recherche/`) ; chaque `.md` de chantier a « Choix faits », « Cas douteux », « Propositions de changement de chiffres ».
