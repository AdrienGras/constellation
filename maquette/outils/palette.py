import json, sys
sys.path.insert(0, '.')
from couleurs import *
FOND = '#f7f6f1'; BLANC = '#ffffff'
# (id, nom, teinte OKLCH, chroma, contraste visé sur blanc pour la couleur vive)
LIGNES = [
  ('developpement', 'Développement', 264, 0.20, 5.8),
  ('infra-cloud', 'Infra & cloud', 180, 0.15, 5.6),
  ('cybersecurite', 'Cybersécurité', 27, 0.21, 4.7),
  ('data-ia', 'Data & IA', 305, 0.20, 8.0),
  ('qualite-archi', 'Qualité & architecture', 52, 0.19, 3.3),
  ('produit-design', 'Produit & design', 350, 0.20, 3.4),
  ('relation-transmission', 'Relation & transmission', 228, 0.15, 3.3),
  ('management', 'Management', 40, 0.10, 10.5),
]
def au_contraste(H, C, cible):
    for i in range(1000, 150, -1):
        h = oklch2hex(i / 1000, C, H)
        if ratio(h, BLANC) >= cible and ratio(h, FOND) >= min(cible, 3.0) * 0.93 + 0.21: return h
def encre_de(H, C, fonds):
    for i in range(1000, 150, -1):
        h = oklch2hex(i / 1000, C, H)
        if all(ratio(h, f) >= 4.8 for f in fonds): return h
res = {}
for id_, nom, H, C, cible in LIGNES:
    vive = au_contraste(H, C, cible); pastel = '#efe8dc' if id_ == 'management' else oklch2hex(0.945, 0.045, H)
    encre = encre_de(H, min(C, 0.14), [FOND, BLANC, pastel])
    res[id_] = dict(nom=nom, vive=vive, pastel=pastel, encre=encre)
    print(f"{nom:26} vive {vive} blanc {ratio(vive,BLANC):.2f} fond {ratio(vive,FOND):.2f} pastel {ratio(vive,pastel):.2f} | pastel {pastel} | encre {encre} {ratio(encre,pastel):.2f}/{ratio(encre,FOND):.2f}")
json.dump(res, open('lignes.json', 'w'), ensure_ascii=False, indent=1)
vs = [r['vive'] for r in res.values()]; ns = list(res)
for t in ('normal', 'deuteranopie', 'protanopie'):
    sim = vs if t == 'normal' else [simuler(v, t) for v in vs]
    pairs = sorted(((distance_ok(sim[i], sim[j]), ns[i], ns[j]) for i in range(8) for j in range(i+1, 8)))
    print(t, [(round(d,3), a[:6], b[:6]) for d, a, b in pairs[:5]])
