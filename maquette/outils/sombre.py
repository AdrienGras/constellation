import sys, json
sys.path.insert(0, '.')
from couleurs import *
FOND, SURF, MUTED = '#0c1117', '#151c25', '#1f2833'
L = [('developpement','Développement',248,.18,.77),('infra-cloud','Infra & cloud',150,.21,.84),('cybersecurite','Cybersécurité',22,.22,.68),
     ('data-ia','Data & IA',300,.24,.64),('qualite-archi','Qualité & architecture',55,.19,.78),('produit-design','Produit & design',345,.22,.74),
     ('relation-transmission','Relation & transmission',100,.19,.93),('management','Management',205,.15,.86)]
res = {}
for id_, nom, H, C, Lum in L:
    v = oklch2hex(Lum, C, H); halo = oklch2hex(0.30, 0.08, H)
    res[id_] = dict(nom=nom, vive=v, halo=halo)
    print(f"{nom:24} {v}  fond {ratio(v,FOND):.1f}  surface {ratio(v,SURF):.1f}  muted {ratio(v,MUTED):.1f} | halo {halo} vive/halo {ratio(v,halo):.1f}  texte encre-sombre sur vive {ratio(FOND,v):.1f}")
json.dump(res, open('lignes-sombre.json','w'), ensure_ascii=False, indent=1)
vs=[r['vive'] for r in res.values()]; ns=list(res)
for t in ('normal','deuteranopie','protanopie'):
    sim = vs if t=='normal' else [simuler(v,t) for v in vs]
    p = sorted((distance_ok(sim[i],sim[j]),ns[i][:6],ns[j][:6]) for i in range(8) for j in range(i+1,8))
    print(t, [(round(d,3),a,b) for d,a,b in p[:4]])
for n,c in [('texte',"#eef2f7"),('texte-doux','#a3adbb'),('trait-fort','#6e7a8b')]:
    print(n, c, round(ratio(c,FOND),2), round(ratio(c,SURF),2), round(ratio(c,MUTED),2))
