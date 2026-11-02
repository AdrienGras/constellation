"""Fusion des fichiers de recherche dans metiers.json.

Usage : python3 scripts/fusionner.py [--essai]
Lit metiers.json et recherche/*.json (macro_branches.json et quiz.json à part),
affiche les refus et les erreurs de validation. Sans --essai, et seulement s'il
n'y a aucun refus, réécrit metiers.json au format de la v1.0.
Code de sortie 1 s'il y a un refus ou une erreur de validation.
"""

import copy
import datetime
import json
import sys
from pathlib import Path

try:
    from scripts.valider import BLOCS_SALAIRES, FIABILITES, valider
except ImportError:  # lancé comme `python3 scripts/fusionner.py`
    from valider import BLOCS_SALAIRES, FIABILITES, valider

VERSION = "1.1"
RANG_FIABILITE = {nom: rang for rang, nom in enumerate(reversed(FIABILITES))}  # nd = 0 … bonne = 3
VIDES = (None, [], "")

# Champs dont une valeur v1.0 non vide peut être remplacée (voir `_ecrasement_autorise`).
ECRASABLES = {
    "fiabilite_note",
    "fiabilite",
    "salaires.silkhom.moyenne_verifiee",
    "salaires.silkhom.moyenne_source",
    "salaires.silkhom.moyenne_keur",
    "salaires.silkhom.variation_pct",
}
LIBRES = {"fiabilite_note", "salaires.silkhom.moyenne_verifiee", "salaires.silkhom.moyenne_source"}
RETRAIT_SEUL = {"salaires.silkhom.moyenne_keur", "salaires.silkhom.variation_pct"}
# Champs que plusieurs chantiers ajustent légitimement : leurs propositions sont combinées.
COMBINES = {"fiabilite", "fiabilite_note"}

SEPARATEUR_NOTES = " ; "
FICHIERS_A_PART = ("macro_branches.json", "quiz.json")


# --- Normalisation ------------------------------------------------------------

def normaliser(donnees):
    """Renvoie une copie où chaque bloc salaires non nul a la clé `rapprochement`."""
    resultat = copy.deepcopy(donnees)
    for metier in resultat.get("metiers", []):
        salaires = metier.get("salaires")
        if not isinstance(salaires, dict):
            continue
        for nom in BLOCS_SALAIRES:
            if isinstance(salaires.get(nom), dict):
                salaires[nom].setdefault("rapprochement", None)
    return resultat


# --- Application des modifications ---------------------------------------------

def _rang(valeur):
    """Rang de fiabilité d'une valeur, None si ce n'est pas une fiabilité connue."""
    return RANG_FIABILITE.get(valeur) if isinstance(valeur, str) else None


def _refus_chiffre(metier, champ):
    return f"{metier} {champ} : changement de chiffre v1.0, à proposer dans relecture.md"


def _modification_valide(modification, ids_metiers):
    """Renvoie le message de refus d'une modification mal formée, ou None."""
    metier, champ = modification.get("metier"), modification.get("champ")
    source = modification.get("source")
    if not isinstance(metier, str) or metier not in ids_metiers:
        return f"{metier} {champ} : métier inconnu"
    if not isinstance(source, str) or not source.strip():
        return f"{metier} {champ} : source vide ou absente"
    if not isinstance(champ, str) or not champ or "valeur" not in modification:
        return f"{metier} : champ ou valeur absent"
    return None


def _combiner_fiabilite(modifications):
    """Renvoie (la proposition de rang le plus bas, refus des valeurs inconnues)."""
    refus, valeurs = [], []
    for m in modifications:
        if _rang(m["valeur"]) is not None:
            valeurs.append(m["valeur"])
        else:
            refus.append(f"{m['metier']} fiabilite : valeur {m['valeur']!r} hors de {', '.join(FIABILITES)}")
    if not valeurs:
        return None, refus
    return min(valeurs, key=_rang), refus


def _combiner_notes(modifications):
    """Joint les notes distinctes, dans l'ordre alphabétique des chantiers."""
    refus, notes = [], []
    for m in sorted(modifications, key=lambda m: m["chantier"]):
        if not isinstance(m["valeur"], str):
            refus.append(f"{m['metier']} fiabilite_note : texte attendu, reçu {m['valeur']!r}")
        elif m["valeur"] not in notes:
            notes.append(m["valeur"])
    if not notes:
        return None, refus
    return SEPARATEUR_NOTES.join(notes), refus


def _est_prefixe(court, long):
    return long.startswith(court + ".")


def _conflits_bloc_sous_champ(modifications):
    """Refuse les modifications de chantiers différents dont un champ contient l'autre.

    Renvoie (modifications sans conflit, refus). Les champs combinés sont exemptés.
    """
    en_conflit, refus = set(), []
    for i, m1 in enumerate(modifications):
        for j in range(i + 1, len(modifications)):
            m2 = modifications[j]
            if m1["metier"] != m2["metier"] or m1["chantier"] == m2["chantier"]:
                continue
            if COMBINES & {m1["champ"], m2["champ"]}:
                continue
            if _est_prefixe(m1["champ"], m2["champ"]) or _est_prefixe(m2["champ"], m1["champ"]):
                en_conflit.update((i, j))
                for m, autre in ((m1, m2), (m2, m1)):
                    refus.append(
                        f"{m['metier']} {m['champ']} : conflit entre le chantier {m['chantier']} "
                        f"({m['champ']}) et le chantier {autre['chantier']} ({autre['champ']}), "
                        f"l'un des champs contient l'autre"
                    )
    restantes = [m for i, m in enumerate(modifications) if i not in en_conflit]
    return restantes, refus


def _resoudre_conflits(modifications):
    """Renvoie (modifications à appliquer, refus) après la première passe de conflits."""
    modifications, refus_prefixes = _conflits_bloc_sous_champ(modifications)
    groupes = {}
    for m in modifications:
        groupes.setdefault((m["metier"], m["champ"]), []).append(m)
    retenues, refus = [], refus_prefixes
    for (metier, champ), groupe in groupes.items():
        if champ in COMBINES:
            combiner = _combiner_fiabilite if champ == "fiabilite" else _combiner_notes
            valeur, refus_groupe = combiner(groupe)
            refus.extend(refus_groupe)
            if valeur is not None:
                retenues.append({**groupe[0], "valeur": valeur})
            continue
        valeurs = []
        for m in groupe:
            if m["valeur"] not in valeurs:
                valeurs.append(m["valeur"])
        if len(valeurs) == 1:
            retenues.append(groupe[0])
            continue
        for m in groupe:
            refus.append(
                f"{metier} {champ} : conflit, le chantier {m['chantier']} pose {m['valeur']!r} "
                f"et un autre chantier une valeur différente"
            )
    return retenues, refus


def _ecrasement_autorise(champ, actuelle, nouvelle):
    if champ in LIBRES:
        return True
    if champ in RETRAIT_SEUL:
        return nouvelle is None
    if champ == "fiabilite":
        rang_actuel, rang_nouveau = _rang(actuelle), _rang(nouvelle)
        return rang_actuel is not None and rang_nouveau is not None and rang_nouveau <= rang_actuel
    return False


def _appliquer_une(metier_donnees, modification):
    """Applique une modification au métier. Renvoie un message de refus, ou None."""
    metier, champ, valeur = modification["metier"], modification["champ"], modification["valeur"]
    *chemin, cle = champ.split(".")
    parent = metier_donnees
    for segment in chemin:
        parent = parent.get(segment) if isinstance(parent, dict) else None
        if not isinstance(parent, dict):
            return f"{metier} {champ} : le bloc parent {segment!r} est nul, absent ou n'est pas un objet"
    actuelle = parent.get(cle)
    if actuelle in VIDES:
        parent[cle] = copy.deepcopy(valeur)
        return None
    if actuelle == valeur:
        return None
    if champ in ECRASABLES and _ecrasement_autorise(champ, actuelle, valeur):
        parent[cle] = copy.deepcopy(valeur)
        return None
    return _refus_chiffre(metier, champ)


def appliquer(donnees, chantiers):
    """Applique les modifications des chantiers. Renvoie (nouvelles données, refus).

    `donnees` n'est jamais modifié.
    """
    resultat = copy.deepcopy(donnees)
    par_id = {m.get("id"): m for m in resultat.get("metiers", [])}
    refus, valides = [], []
    for chantier in chantiers:
        for modification in chantier.get("modifications", []):
            modification = {**modification, "chantier": chantier.get("chantier", "?")}
            message = _modification_valide(modification, par_id)
            if message:
                refus.append(message)
            else:
                valides.append(modification)
    retenues, refus_conflits = _resoudre_conflits(valides)
    refus.extend(refus_conflits)
    for modification in retenues:
        message = _appliquer_une(par_id[modification["metier"]], modification)
        if message:
            refus.append(message)
    return resultat, refus


# --- Fusion --------------------------------------------------------------------

def _inserer_apres_categories(donnees, ajouts):
    """Reconstruit `donnees` en plaçant `ajouts` juste après `categories` (ou à la fin)."""
    resultat = {}
    for cle, valeur in donnees.items():
        if cle in ajouts:
            continue
        resultat[cle] = valeur
        if cle == "categories":
            resultat.update(ajouts)
    for cle, valeur in ajouts.items():
        resultat.setdefault(cle, valeur)
    return resultat


def fusionner(donnees, chantiers, macro_branches, quiz, date):
    """Enchaîne normaliser et appliquer, pose macro_branches et quiz, ajoute les sources.

    `macro_branches` ou `quiz` valant None laissent la valeur déjà présente.
    Renvoie (nouvelles données, refus).
    """
    resultat, refus = appliquer(normaliser(donnees), chantiers)
    ajouts = {}
    for cle, valeur in (("macro_branches", macro_branches), ("quiz", quiz)):
        if valeur is None:
            valeur = resultat.get(cle)
        if valeur is not None:
            ajouts[cle] = copy.deepcopy(valeur)
    resultat = _inserer_apres_categories(resultat, ajouts)

    sources = resultat.setdefault("sources", [])
    connus = {s.get("id") for s in sources}
    for chantier in chantiers:
        for source in chantier.get("sources_ajoutees", []):
            if source.get("id") not in connus:
                sources.append(copy.deepcopy(source))
                connus.add(source.get("id"))

    resultat["meta"] = {**resultat.get("meta", {}), "version": VERSION, "genere_le": date}
    return resultat, refus


# --- Fichiers et ligne de commande -----------------------------------------------

def lire(chemin):
    return json.loads(Path(chemin).read_text(encoding="utf-8"))


def ecrire(chemin, donnees):
    """Écrit au format de la v1.0 : indent 2, accents conservés, pas de saut de ligne final."""
    texte = json.dumps(donnees, ensure_ascii=False, indent=2)
    Path(chemin).write_bytes(texte.encode("utf-8"))


def _lire_a_part(dossier, nom):
    chemin = dossier / nom
    if chemin.exists():
        return lire(chemin)
    print(f"{chemin.name} absent : valeur déjà présente dans metiers.json conservée")
    return None


def main(argv, racine=None):
    racine = Path(racine) if racine else Path(__file__).resolve().parent.parent
    essai = "--essai" in argv
    dossier = racine / "recherche"

    donnees = lire(racine / "metiers.json")
    fichiers = sorted(p for p in dossier.glob("*.json") if p.name not in FICHIERS_A_PART)
    if not fichiers:
        print(f"Aucun chantier dans {dossier}")
    chantiers = [lire(p) for p in fichiers]
    macro_branches = _lire_a_part(dossier, "macro_branches.json")
    quiz = _lire_a_part(dossier, "quiz.json")

    resultat, refus = fusionner(
        donnees, chantiers, macro_branches, quiz, datetime.date.today().isoformat()
    )
    erreurs = valider(resultat)
    for message in refus:
        print(f"REFUS {message}")
    for message in erreurs:
        print(f"ERREUR {message}")

    if refus:
        print("metiers.json non modifié : refus à traiter")
    elif essai:
        print("Essai : metiers.json non modifié")
    else:
        ecrire(racine / "metiers.json", resultat)
        print("metiers.json réécrit")
    return 1 if refus or erreurs else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
