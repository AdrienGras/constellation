"""Validation de metiers.json (v1.1).

Usage : python3 scripts/valider.py <fichier>
Affiche les erreurs, puis sort avec le code 0 s'il n'y en a aucune, 1 sinon.
"""

import json
import re
import sys
from collections import Counter

CLES_PREMIER_NIVEAU = ["meta", "categories", "macro_branches", "quiz", "metiers", "sources"]

CLES_METIER_V1 = [
    "id", "categorie", "titre", "type", "depuis", "rome", "brief", "missions",
    "competences", "a_eviter_si", "parcours", "salaires", "fiabilite",
    "fiabilite_note", "source_texte", "source_texte_detail", "a_relire",
    "voisins_meme_categorie", "voisins_autres_categories", "roadmap_url",
]

FIABILITES = ["bonne", "moyenne", "faible", "nd"]
FIABILITES_PLAFONNEES = ["moyenne", "faible", "nd"]
TYPES = ["entree", "evolution"]
ZONES_SILKHOM = ["paris", "grandes_villes", "regions"]
BLOCS_SALAIRES = ["silkhom", "apec"]
SOUS_BLOCS_APEC = ["idf", "autres_regions", "moins_35_ans"]
FORMAT_ROME = re.compile(r"^[A-N]\d{4}$")
PREFIXE_ROADMAP = "https://roadmap.sh/"
ECART_MAX_QUIZ = 0.10


# --- Accès tolérants aux données --------------------------------------------

def _liste_de_dicts(valeur):
    """Renvoie les éléments dict d'une liste, [] si la valeur n'est pas une liste."""
    if not isinstance(valeur, list):
        return []
    return [element for element in valeur if isinstance(element, dict)]


def _metiers(donnees):
    return _liste_de_dicts(donnees.get("metiers"))


def _ids(elements):
    return {e.get("id") for e in elements}


def _est_nombre(valeur):
    return isinstance(valeur, (int, float)) and not isinstance(valeur, bool)


def _est_intervalle(valeur):
    return isinstance(valeur, list) and len(valeur) == 2 and all(_est_nombre(v) for v in valeur)


def _bloc_salaires(metier, nom):
    """Renvoie le bloc de salaires `nom` du métier, ou None s'il est nul ou mal formé."""
    salaires = metier.get("salaires")
    bloc = salaires.get(nom) if isinstance(salaires, dict) else None
    return bloc if isinstance(bloc, dict) else None


def _blocs_salaires(metier):
    """Itère sur (nom, bloc) pour les blocs de salaires non nuls du métier."""
    for nom in BLOCS_SALAIRES:
        bloc = _bloc_salaires(metier, nom)
        if bloc is not None:
            yield nom, bloc


# --- Règles -------------------------------------------------------------------

def _verifier_cles_premier_niveau(donnees):
    return [f"{cle} : clé de premier niveau absente" for cle in CLES_PREMIER_NIVEAU if cle not in donnees]


def _verifier_cles_metiers(donnees):
    erreurs = []
    for metier in _metiers(donnees):
        id_ = metier.get("id", "?")
        for cle in CLES_METIER_V1:
            if cle not in metier:
                erreurs.append(f"{id_} : clé {cle} absente")
        if "fiabilite" in metier and metier["fiabilite"] not in FIABILITES:
            erreurs.append(
                f"{id_} : fiabilite {metier['fiabilite']!r} hors de {', '.join(FIABILITES)}"
            )
        if "type" in metier and metier["type"] not in TYPES:
            erreurs.append(f"{id_} : type {metier['type']!r} hors de {', '.join(TYPES)}")
        salaires = metier.get("salaires")
        if "salaires" in metier:
            if not isinstance(salaires, dict):
                erreurs.append(f"{id_} : salaires doit être un objet")
            else:
                for nom in BLOCS_SALAIRES:
                    if nom not in salaires:
                        erreurs.append(f"{id_} : salaires.{nom} absent (null si pas de donnée)")
    return erreurs


def _verifier_references(donnees):
    erreurs = []
    ids_metiers = _ids(_metiers(donnees))
    ids_categories = _ids(_liste_de_dicts(donnees.get("categories")))
    for metier in _metiers(donnees):
        id_ = metier.get("id", "?")
        if "categorie" in metier and metier["categorie"] not in ids_categories:
            erreurs.append(f"{id_} : categorie {metier['categorie']!r} inconnue")
        for cle in ["depuis", "voisins_meme_categorie", "voisins_autres_categories"]:
            valeur = metier.get(cle)
            if cle in metier and not isinstance(valeur, list):
                erreurs.append(f"{id_} : {cle} doit être une liste")
                continue
            for reference in valeur or []:
                if reference not in ids_metiers:
                    erreurs.append(f"{id_} : {cle} contient {reference!r}, métier inconnu")
    for branche in _liste_de_dicts(donnees.get("macro_branches")):
        for categorie in branche.get("categories") or []:
            if categorie not in ids_categories:
                erreurs.append(
                    f"macro_branches : {branche.get('id', '?')} cite la catégorie {categorie!r}, inconnue"
                )
    return erreurs


def _verifier_categories_macro_branches(donnees):
    if "macro_branches" not in donnees:
        return []
    appartenances = Counter()
    for branche in _liste_de_dicts(donnees["macro_branches"]):
        appartenances.update(branche.get("categories") or [])
    erreurs = []
    for categorie in _liste_de_dicts(donnees.get("categories")):
        id_ = categorie.get("id")
        nombre = appartenances[id_]
        if nombre != 1:
            erreurs.append(
                f"macro_branches : la catégorie {id_!r} appartient à {nombre} macro-branches, attendu 1"
            )
    return erreurs


def _verifier_silkhom(donnees):
    erreurs = []
    for metier in _metiers(donnees):
        id_ = metier.get("id", "?")
        bloc = _bloc_salaires(metier, "silkhom")
        if bloc is None:
            continue
        for g, grille in enumerate(_liste_de_dicts(bloc.get("grilles"))):
            precedent = None
            for niveau in _liste_de_dicts(grille.get("niveaux")):
                lieu = f"{id_} : salaires.silkhom grilles[{g}] niveau {niveau.get('niveau')!r}"
                for zone in ZONES_SILKHOM:
                    intervalle = niveau.get(zone)
                    if not _est_intervalle(intervalle):
                        erreurs.append(f"{lieu} {zone} : [min, max] attendu, reçu {intervalle!r}")
                    elif intervalle[0] > intervalle[1]:
                        erreurs.append(f"{lieu} {zone} : min {intervalle[0]} > max {intervalle[1]}")
                if precedent is not None and precedent.get("annees_max") is not None:
                    if niveau.get("annees_min") is None or niveau["annees_min"] < precedent["annees_max"]:
                        erreurs.append(
                            f"{lieu} : annees_min {niveau.get('annees_min')} < annees_max "
                            f"{precedent['annees_max']} du niveau précédent"
                        )
                precedent = niveau
        if bloc.get("moyenne_keur") is not None and bloc.get("moyenne_verifiee") is not True:
            erreurs.append(
                f"{id_} : salaires.silkhom moyenne_keur {bloc['moyenne_keur']} affichée "
                "mais moyenne_verifiee n'est pas true"
            )
    return erreurs


def _verifier_apec(donnees):
    erreurs = []
    for metier in _metiers(donnees):
        id_ = metier.get("id", "?")
        bloc = _bloc_salaires(metier, "apec")
        if bloc is None:
            continue
        a_verifier = [("salaires.apec", bloc)]
        a_verifier += [(f"salaires.apec.{nom}", bloc[nom]) for nom in SOUS_BLOCS_APEC if isinstance(bloc.get(nom), dict)]
        for lieu, valeurs in a_verifier:
            d1, mediane, d9 = valeurs.get("d1"), valeurs.get("mediane"), valeurs.get("d9")
            if _est_nombre(d1) and _est_nombre(mediane) and d1 > mediane:
                erreurs.append(f"{id_} : {lieu} d1 {d1} > mediane {mediane}")
            if _est_nombre(mediane) and _est_nombre(d9) and mediane > d9:
                erreurs.append(f"{id_} : {lieu} mediane {mediane} > d9 {d9}")
            if _est_nombre(d1) and _est_nombre(d9) and d1 > d9:
                erreurs.append(f"{id_} : {lieu} d1 {d1} > d9 {d9}")
    return erreurs


def _verifier_rapprochements(donnees):
    erreurs = []
    for metier in _metiers(donnees):
        id_ = metier.get("id", "?")
        avec_rapprochement = False
        for nom, bloc in _blocs_salaires(metier):
            lieu = f"{id_} : salaires.{nom}"
            if "rapprochement" not in bloc:
                erreurs.append(f"{lieu} : clé rapprochement absente (null si aucun)")
                continue
            rapprochement = bloc["rapprochement"]
            if rapprochement is None:
                continue
            avec_rapprochement = True
            if not isinstance(rapprochement, dict):
                erreurs.append(f"{lieu} : rapprochement doit être null ou un objet {{de, raison}}")
                continue
            for cle in ["de", "raison"]:
                texte = rapprochement.get(cle)
                if not isinstance(texte, str) or not texte.strip():
                    erreurs.append(f"{lieu} : rapprochement.{cle} vide ou absent")
        if avec_rapprochement and metier.get("fiabilite") in FIABILITES and metier["fiabilite"] not in FIABILITES_PLAFONNEES:
            erreurs.append(
                f"{id_} : fiabilite {metier['fiabilite']!r} alors qu'un salaire vient d'un rapprochement "
                f"(plafond : moyenne)"
            )
    return erreurs


def _verifier_rome_et_roadmap(donnees):
    erreurs = []
    for metier in _metiers(donnees):
        id_ = metier.get("id", "?")
        rome = metier.get("rome")
        if rome is not None and not (isinstance(rome, str) and FORMAT_ROME.match(rome)):
            erreurs.append(f"{id_} : rome {rome!r} mal formé (attendu une lettre A-N et 4 chiffres, ou null)")
        url = metier.get("roadmap_url")
        if url is not None and not (isinstance(url, str) and url.startswith(PREFIXE_ROADMAP)):
            erreurs.append(f"{id_} : roadmap_url {url!r} ne commence pas par {PREFIXE_ROADMAP}")
    return erreurs


def scores_max_quiz(quiz, branches):
    """Pour chaque branche, somme sur les questions du poids maximal qu'elle peut y recevoir."""
    scores = {branche: 0 for branche in branches}
    for question in _liste_de_dicts((quiz or {}).get("questions")):
        for branche in branches:
            poids = [
                reponse["poids"][branche]
                for reponse in _liste_de_dicts(question.get("reponses"))
                if isinstance(reponse.get("poids"), dict)
                and _est_nombre(reponse["poids"].get(branche))
            ]
            scores[branche] += max(poids, default=0)
    return scores


def _verifier_quiz(donnees):
    quiz = donnees.get("quiz")
    if not isinstance(quiz, dict):
        return []
    erreurs = []
    branches = [b.get("id") for b in _liste_de_dicts(donnees.get("macro_branches"))]
    questions = _liste_de_dicts(quiz.get("questions"))
    for id_question, nombre in Counter(q.get("id") for q in questions).items():
        if nombre > 1:
            erreurs.append(f"quiz : id de question {id_question!r} utilisé {nombre} fois")
    for question in questions:
        for reponse in _liste_de_dicts(question.get("reponses")):
            lieu = f"quiz : {question.get('id', '?')} réponse {reponse.get('id', '?')}"
            poids = reponse.get("poids")
            if not isinstance(poids, dict) or not 1 <= len(poids) <= 2:
                erreurs.append(f"{lieu} : poids doit viser 1 ou 2 macro-branches")
                continue
            for branche, valeur in poids.items():
                if branche not in branches:
                    erreurs.append(f"{lieu} : poids vise la macro-branche inconnue {branche!r}")
                if isinstance(valeur, bool) or not isinstance(valeur, int) or valeur not in (1, 2):
                    erreurs.append(f"{lieu} : poids {valeur!r} pour {branche!r}, entier de 1 à 2 attendu")
    if branches:
        scores = scores_max_quiz(quiz, branches)
        plus_haut, plus_bas = max(scores.values()), min(scores.values())
        if plus_haut == 0 or (plus_haut - plus_bas) / plus_haut > ECART_MAX_QUIZ:
            erreurs.append(
                f"quiz : équilibre rompu, scores maximaux par branche {scores} "
                f"(écart toléré {ECART_MAX_QUIZ:.0%})"
            )
    return erreurs


def _paires_de_voisins(metiers):
    paires = set()
    for metier in metiers:
        for cle in ["voisins_meme_categorie", "voisins_autres_categories"]:
            voisins = metier.get(cle)
            for voisin in voisins if isinstance(voisins, list) else []:
                paires.add(frozenset((metier.get("id"), voisin)))
    return paires


def _verifier_compteurs(donnees):
    erreurs = []
    metiers = _metiers(donnees)
    meta = donnees.get("meta") if isinstance(donnees.get("meta"), dict) else {}
    attendus = {"nb_metiers": len(metiers), "nb_liens": len(_paires_de_voisins(metiers))}
    for cle, attendu in attendus.items():
        if meta.get(cle) != attendu:
            erreurs.append(f"meta : {cle} vaut {meta.get(cle)!r}, attendu {attendu}")
    par_categorie = Counter(m.get("categorie") for m in metiers)
    for categorie in _liste_de_dicts(donnees.get("categories")):
        id_ = categorie.get("id")
        if categorie.get("nb") != par_categorie[id_]:
            erreurs.append(
                f"categories : {id_} a nb {categorie.get('nb')!r}, attendu {par_categorie[id_]}"
            )
    return erreurs


REGLES = [
    _verifier_cles_premier_niveau,
    _verifier_cles_metiers,
    _verifier_references,
    _verifier_categories_macro_branches,
    _verifier_silkhom,
    _verifier_apec,
    _verifier_rapprochements,
    _verifier_rome_et_roadmap,
    _verifier_quiz,
    _verifier_compteurs,
]


def valider(donnees):
    """Renvoie la liste des erreurs, vide si tout va bien."""
    erreurs = []
    for regle in REGLES:
        erreurs.extend(regle(donnees))
    return erreurs


def main(argv):
    if len(argv) != 2:
        print("Usage : python3 scripts/valider.py <fichier>", file=sys.stderr)
        return 2
    with open(argv[1], encoding="utf-8") as fichier:
        donnees = json.load(fichier)
    erreurs = valider(donnees)
    for erreur in erreurs:
        print(erreur)
    return 1 if erreurs else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
