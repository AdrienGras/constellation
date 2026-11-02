import contextlib
import copy
import io
import json
import tempfile
import unittest
from pathlib import Path

from scripts.fusionner import appliquer, ecrire, fusionner, main, normaliser
from tests.fixtures import donnees_valides

RACINE = Path(__file__).resolve().parent.parent


def modification(metier, champ, valeur, source="source de test"):
    return {"metier": metier, "champ": champ, "valeur": valeur, "source": source}


def chantier(nom, *modifications, sources_ajoutees=()):
    return {
        "chantier": nom,
        "sources_ajoutees": list(sources_ajoutees),
        "modifications": list(modifications),
    }


def metier(donnees, id_):
    return next(m for m in donnees["metiers"] if m["id"] == id_)


class TestNormaliser(unittest.TestCase):
    def test_normaliser_ajoute_rapprochement_null(self):
        d = donnees_valides()
        for m in d["metiers"]:
            for bloc in m["salaires"].values():
                if bloc is not None:
                    del bloc["rapprochement"]
        resultat = normaliser(d)
        for m in resultat["metiers"]:
            for bloc in m["salaires"].values():
                if bloc is not None:
                    self.assertIn("rapprochement", bloc)
                    self.assertIsNone(bloc["rapprochement"])
        self.assertIsNone(metier(resultat, "metier-2")["salaires"]["apec"])

    def test_normaliser_garde_un_rapprochement_existant(self):
        d = donnees_valides()
        rapprochement = {"de": "Autre métier", "raison": "Les deux postes se ressemblent."}
        metier(d, "metier-1")["salaires"]["apec"]["rapprochement"] = rapprochement
        resultat = normaliser(d)
        self.assertEqual(metier(resultat, "metier-1")["salaires"]["apec"]["rapprochement"], rapprochement)


class TestAppliquer(unittest.TestCase):
    def assertUnRefus(self, refus, *textes):
        self.assertEqual(len(refus), 1, refus)
        for texte in textes:
            self.assertIn(texte, refus[0])

    def test_remplit_champ_vide(self):
        d = donnees_valides()
        metier(d, "metier-1")["rome"] = None
        resultat, refus = appliquer(d, [chantier("rome", modification("metier-1", "rome", "M1805"))])
        self.assertEqual(refus, [])
        self.assertEqual(metier(resultat, "metier-1")["rome"], "M1805")

    def test_remplit_bloc_apec_null(self):
        d = donnees_valides()
        bloc = {"famille": "Données", "mediane": 48, "d1": 36, "d9": 70, "rapprochement": None}
        resultat, refus = appliquer(d, [chantier("apec", modification("metier-2", "salaires.apec", bloc))])
        self.assertEqual(refus, [])
        self.assertEqual(metier(resultat, "metier-2")["salaires"]["apec"], bloc)

    def test_parent_null_refuse(self):
        d = donnees_valides()
        resultat, refus = appliquer(d, [chantier("apec", modification("metier-2", "salaires.apec.mediane", 50))])
        self.assertUnRefus(refus, "metier-2", "salaires.apec.mediane")
        self.assertIsNone(metier(resultat, "metier-2")["salaires"]["apec"])

    def test_parent_absent_refuse(self):
        d = donnees_valides()
        _, refus = appliquer(d, [chantier("x", modification("metier-1", "inconnu.sous_cle", 1))])
        self.assertUnRefus(refus, "metier-1", "inconnu.sous_cle")

    def test_changement_de_chiffre_refuse(self):
        d = donnees_valides()
        resultat, refus = appliquer(d, [chantier("apec", modification("metier-1", "salaires.apec.mediane", 52))])
        self.assertUnRefus(refus, "relecture.md")
        self.assertEqual(metier(resultat, "metier-1")["salaires"]["apec"]["mediane"], 50)

    def test_valeur_identique_sans_refus(self):
        d = donnees_valides()
        resultat, refus = appliquer(d, [chantier("apec", modification("metier-1", "salaires.apec.mediane", 50))])
        self.assertEqual(refus, [])
        self.assertEqual(resultat, d)

    def test_retrait_moyenne_autorise(self):
        d = donnees_valides()
        resultat, refus = appliquer(
            d, [chantier("silkhom", modification("metier-1", "salaires.silkhom.moyenne_keur", None))]
        )
        self.assertEqual(refus, [])
        self.assertIsNone(metier(resultat, "metier-1")["salaires"]["silkhom"]["moyenne_keur"])

        resultat, refus = appliquer(
            d, [chantier("silkhom", modification("metier-1", "salaires.silkhom.moyenne_keur", 45.0))]
        )
        self.assertUnRefus(refus, "relecture.md")
        self.assertEqual(metier(resultat, "metier-1")["salaires"]["silkhom"]["moyenne_keur"], 42.2)

    def test_variation_pct_ne_peut_que_etre_retiree(self):
        d = donnees_valides()
        champ = "salaires.silkhom.variation_pct"
        resultat, refus = appliquer(d, [chantier("s", modification("metier-1", champ, None))])
        self.assertEqual(refus, [])
        self.assertIsNone(metier(resultat, "metier-1")["salaires"]["silkhom"]["variation_pct"])
        _, refus = appliquer(d, [chantier("s", modification("metier-1", champ, -3.0))])
        self.assertUnRefus(refus, "relecture.md")

    def test_champs_librement_ecrasables(self):
        d = donnees_valides()
        metier(d, "metier-1")["fiabilite_note"] = "Ancienne note."
        modifications = [
            modification("metier-1", "fiabilite_note", "Nouvelle note."),
            modification("metier-1", "salaires.silkhom.moyenne_verifiee", False),
            modification("metier-1", "salaires.silkhom.moyenne_source", "silkhom-ia-2026"),
        ]
        resultat, refus = appliquer(d, [chantier("silkhom", *modifications)])
        self.assertEqual(refus, [])
        m = metier(resultat, "metier-1")
        self.assertEqual(m["fiabilite_note"], "Nouvelle note.")
        self.assertIs(m["salaires"]["silkhom"]["moyenne_verifiee"], False)
        self.assertEqual(m["salaires"]["silkhom"]["moyenne_source"], "silkhom-ia-2026")

    def test_fiabilite_ne_peut_que_baisser(self):
        d = donnees_valides()
        resultat, refus = appliquer(d, [chantier("apec", modification("metier-1", "fiabilite", "moyenne"))])
        self.assertEqual(refus, [])
        self.assertEqual(metier(resultat, "metier-1")["fiabilite"], "moyenne")

        metier(d, "metier-1")["fiabilite"] = "faible"
        resultat, refus = appliquer(d, [chantier("apec", modification("metier-1", "fiabilite", "bonne"))])
        self.assertUnRefus(refus, "relecture.md")
        self.assertEqual(metier(resultat, "metier-1")["fiabilite"], "faible")

    def test_fiabilite_inconnue_refusee(self):
        d = donnees_valides()
        resultat, refus = appliquer(d, [chantier("apec", modification("metier-1", "fiabilite", "excellente"))])
        self.assertUnRefus(refus, "metier-1", "fiabilite")
        self.assertEqual(metier(resultat, "metier-1")["fiabilite"], "bonne")

    def test_fiabilite_multi_chantiers_rang_le_plus_bas(self):
        d = donnees_valides()
        chantiers = [
            chantier("silkhom", modification("metier-1", "fiabilite", "moyenne")),
            chantier("apec", modification("metier-1", "fiabilite", "faible")),
        ]
        resultat, refus = appliquer(d, chantiers)
        self.assertEqual(refus, [])
        self.assertEqual(metier(resultat, "metier-1")["fiabilite"], "faible")
        resultat, refus = appliquer(d, list(reversed(chantiers)))
        self.assertEqual(refus, [])
        self.assertEqual(metier(resultat, "metier-1")["fiabilite"], "faible")

    def test_fiabilite_note_multi_chantiers_jointe(self):
        d = donnees_valides()
        chantiers = [
            chantier("silkhom", modification("metier-1", "fiabilite_note", "Note Silkhom.")),
            chantier("apec", modification("metier-1", "fiabilite_note", "Note Apec.")),
            chantier("zzz", modification("metier-1", "fiabilite_note", "Note Apec.")),
        ]
        resultat, refus = appliquer(d, chantiers)
        self.assertEqual(refus, [])
        self.assertEqual(metier(resultat, "metier-1")["fiabilite_note"], "Note Apec. ; Note Silkhom.")

    def test_source_obligatoire(self):
        d = donnees_valides()
        metier(d, "metier-1")["rome"] = None
        resultat, refus = appliquer(d, [chantier("rome", modification("metier-1", "rome", "M1805", source=""))])
        self.assertUnRefus(refus, "metier-1", "source")
        self.assertIsNone(metier(resultat, "metier-1")["rome"])

    def test_metier_inconnu(self):
        _, refus = appliquer(donnees_valides(), [chantier("rome", modification("fantome", "rome", "M1805"))])
        self.assertUnRefus(refus, "fantome")

    def test_conflit_entre_chantiers_refuse(self):
        d = donnees_valides()
        metier(d, "metier-1")["rome"] = None
        champ = "rome"
        resultat, refus = appliquer(
            d,
            [
                chantier("a", modification("metier-1", champ, "M1805")),
                chantier("b", modification("metier-1", champ, "M1806")),
            ],
        )
        self.assertEqual(len(refus), 2, refus)
        self.assertTrue(all("metier-1" in r and "rome" in r for r in refus))
        self.assertIsNone(metier(resultat, "metier-1")["rome"])

        resultat, refus = appliquer(
            d,
            [
                chantier("a", modification("metier-1", champ, "M1805")),
                chantier("b", modification("metier-1", champ, "M1805")),
            ],
        )
        self.assertEqual(refus, [])
        self.assertEqual(metier(resultat, "metier-1")["rome"], "M1805")

    def test_conflit_bloc_et_sous_champ_refuse(self):
        d = donnees_valides()
        bloc = {"famille": "Données", "mediane": 48, "d1": 36, "d9": 70, "rapprochement": None}
        a = chantier("a", modification("metier-2", "salaires.apec", bloc))
        b = chantier("b", modification("metier-2", "salaires.apec.mediane", 50))
        resultats = []
        for chantiers in ([a, b], [b, a]):
            resultat, refus = appliquer(d, chantiers)
            self.assertEqual(len(refus), 2, refus)
            for r in refus:
                self.assertIn("salaires.apec.mediane", r)
                self.assertIn("salaires.apec", r)
                self.assertIn("chantier a", r)
                self.assertIn("chantier b", r)
            self.assertIsNone(metier(resultat, "metier-2")["salaires"]["apec"])
            resultats.append((resultat, sorted(refus)))
        self.assertEqual(resultats[0], resultats[1])

    def test_blocs_voisins_de_chantiers_differents_sans_conflit(self):
        d = donnees_valides()
        bloc = {"famille": "Données", "mediane": 48, "rapprochement": None}
        chantiers = [
            chantier("a", modification("metier-2", "salaires.apec", bloc)),
            chantier("b", modification("metier-2", "salaires.apec_bis", 1)),
        ]
        resultat, refus = appliquer(d, chantiers)
        self.assertEqual(refus, [])
        self.assertEqual(metier(resultat, "metier-2")["salaires"]["apec"], bloc)
        self.assertEqual(metier(resultat, "metier-2")["salaires"]["apec_bis"], 1)

    def test_entree_non_mutee(self):
        d = donnees_valides()
        metier(d, "metier-1")["rome"] = None
        avant = copy.deepcopy(d)
        bloc = {"famille": "Données", "mediane": 48, "rapprochement": None}
        chantiers = [
            chantier(
                "x",
                modification("metier-1", "rome", "M1805"),
                modification("metier-2", "salaires.apec", bloc),
            )
        ]
        resultat, refus = appliquer(d, chantiers)
        self.assertEqual(refus, [])
        self.assertEqual(d, avant)
        resultat["metiers"][1]["salaires"]["apec"]["mediane"] = 1
        self.assertEqual(bloc["mediane"], 48)


class TestFusionner(unittest.TestCase):
    def test_fusionner_meta_et_cles(self):
        d = donnees_valides()
        macro_branches, quiz = d.pop("macro_branches"), d.pop("quiz")
        d["meta"]["version"] = "1.0"
        resultat, refus = fusionner(d, [], macro_branches, quiz, "2026-12-01")
        self.assertEqual(refus, [])
        self.assertEqual(resultat["meta"]["version"], "1.1")
        self.assertEqual(resultat["meta"]["genere_le"], "2026-12-01")
        self.assertEqual(list(resultat), ["meta", "categories", "macro_branches", "quiz", "metiers", "sources"])
        self.assertEqual(resultat["macro_branches"], macro_branches)
        self.assertEqual(resultat["quiz"], quiz)

    def test_fusionner_applique_les_modifications(self):
        d = donnees_valides()
        macro_branches, quiz = d.pop("macro_branches"), d.pop("quiz")
        metier(d, "metier-1")["rome"] = None
        resultat, refus = fusionner(
            d, [chantier("rome", modification("metier-1", "rome", "M1805"))], macro_branches, quiz, "2026-12-01"
        )
        self.assertEqual(refus, [])
        self.assertEqual(metier(resultat, "metier-1")["rome"], "M1805")

    def test_sources_ajoutees_sans_doublon(self):
        d = donnees_valides()
        macro_branches, quiz = d["macro_branches"], d["quiz"]
        deja_presente = {"id": "cigref-2025", "titre": "Autre titre", "editeur": "Autre"}
        nouvelle = {"id": "apec-2025", "titre": "Référentiel Apec", "editeur": "Apec"}
        chantiers = [
            chantier("a", sources_ajoutees=[deja_presente, nouvelle]),
            chantier("b", sources_ajoutees=[nouvelle]),
        ]
        resultat, refus = fusionner(d, chantiers, macro_branches, quiz, "2026-12-01")
        self.assertEqual(refus, [])
        ids = [s["id"] for s in resultat["sources"]]
        self.assertEqual(ids, ["silkhom-it-2026", "cigref-2025", "apec-2025"])
        self.assertEqual(resultat["sources"][1]["titre"], "Nomenclature Cigref")


class TestEcriture(unittest.TestCase):
    def test_aller_retour_identique(self):
        texte = (RACINE / "metiers.json").read_text(encoding="utf-8")
        with tempfile.TemporaryDirectory() as dossier:
            chemin = Path(dossier) / "metiers.json"
            ecrire(chemin, json.loads(texte))
            self.assertEqual(chemin.read_bytes(), texte.encode("utf-8"))


def lancer(argv, racine):
    """Lance la ligne de commande sans polluer la sortie des tests."""
    with contextlib.redirect_stdout(io.StringIO()):
        return main(argv, racine)


class TestLigneDeCommande(unittest.TestCase):
    def preparer(self, dossier, donnees):
        racine = Path(dossier)
        ecrire(racine / "metiers.json", donnees)
        return racine

    def test_sans_dossier_recherche_pas_de_plantage(self):
        d = donnees_valides()
        with tempfile.TemporaryDirectory() as dossier:
            racine = self.preparer(dossier, d)
            avant = (racine / "metiers.json").read_bytes()
            code = lancer(["--essai"], racine)
            self.assertEqual(code, 0)
            self.assertEqual((racine / "metiers.json").read_bytes(), avant)

    def test_refus_empeche_l_ecriture(self):
        d = donnees_valides()
        with tempfile.TemporaryDirectory() as dossier:
            racine = self.preparer(dossier, d)
            avant = (racine / "metiers.json").read_bytes()
            (racine / "recherche").mkdir()
            mauvais = chantier("x", modification("metier-1", "salaires.apec.mediane", 52))
            (racine / "recherche" / "x.json").write_text(json.dumps(mauvais), encoding="utf-8")
            code = lancer([], racine)
            self.assertEqual(code, 1)
            self.assertEqual((racine / "metiers.json").read_bytes(), avant)

    def test_ecrit_sans_refus(self):
        d = donnees_valides()
        metier(d, "metier-1")["rome"] = None
        with tempfile.TemporaryDirectory() as dossier:
            racine = self.preparer(dossier, d)
            (racine / "recherche").mkdir()
            bon = chantier("rome", modification("metier-1", "rome", "M1805"))
            (racine / "recherche" / "rome.json").write_text(json.dumps(bon), encoding="utf-8")
            code = lancer([], racine)
            self.assertEqual(code, 0)
            ecrit = json.loads((racine / "metiers.json").read_text(encoding="utf-8"))
            self.assertEqual(metier(ecrit, "metier-1")["rome"], "M1805")


if __name__ == "__main__":
    unittest.main()
