"""Calcule le plan de métro du nuage : 8 lignes rayonnant depuis « ta formation »."""
import json, math, sys
D = json.load(open('/srv/AdrienGras/constellation/metiers.json', encoding='utf-8'))
TOK = {x['name']: x['value'] for x in json.load(open(sys.argv[1]))['color']['tokens']}
def col(n):
    v = TOK[n]; return col(v[1:-1]) if v.startswith('{') else v
CX, CY, S, R0 = 640, 360, 36, 78
R2 = math.sqrt(0.5)
# direction initiale, nb de stations en diagonale avant de virer, direction après
TRACE = {
  'developpement': ((1, 0), None, None), 'infra-cloud': ((-1, 0), None, None),
  'cybersecurite': ((0, -1), None, None), 'qualite-archi': ((0, 1), None, None),
  'data-ia': ((R2, -R2), 5, (1, 0)), 'produit-design': ((-R2, -R2), 5, (-1, 0)),
  'relation-transmission': ((-R2, R2), 5, (-1, 0)), 'management': ((R2, R2), 2, (1, 0))}
M = {m['id']: m for m in D['metiers']}
lignes = []
for num, mb in enumerate(D['macro_branches'], 1):
    lid = mb['id']; d0, k, d1 = TRACE[lid]
    ordre = []
    for c in mb['categories']:
        ms = [m for m in D['metiers'] if m['categorie'] == c]
        ordre += [m for m in ms if m['type'] == 'entree'] + [m for m in ms if m['type'] == 'evolution']
    pts = []; x, y = CX + d0[0] * R0, CY + d0[1] * R0
    for i, m in enumerate(ordre):
        if i > 0:
            d = d0 if (k is None or i < k) else d1
            x, y = x + d[0] * S, y + d[1] * S
        pts.append((round(x, 1), round(y, 1), m))
    lignes.append(dict(id=lid, num=num, nom=mb['libelle'], couleur=col('ligne-' + lid), fond=col(f'ligne-{lid}-pastel'), pts=pts, d0=d0, k=k, d1=d1))
def chemin(pts, debut=None, fin=None):
    xs = ([debut] if debut else []) + [(p[0], p[1]) for p in pts] + ([fin] if fin else [])
    return 'M ' + ' L '.join(f'{x:g} {y:g}' for x, y in xs)
out = {'lignes': [], 'stations': {}}
for l in lignes:
    p0 = l['pts'][0]; d0 = l['d0']; dl = l['d1'] if l['k'] and len(l['pts']) > l['k'] else d0
    debut = (round(CX + d0[0] * 30, 1), round(CY + d0[1] * 30, 1))
    der = l['pts'][-1]; term = (round(der[0] + dl[0] * 34, 1), round(der[1] + dl[1] * 34, 1))
    quartiers = []
    for c in [c for c in D['macro_branches'][l['num'] - 1]['categories']]:
        seg = [p for p in l['pts'] if p[2]['categorie'] == c]
        quartiers.append(dict(cat=c, libelle=next(x['libelle'] for x in D['categories'] if x['id'] == c), d=chemin(seg) if len(seg) > 1 else f'M {seg[0][0]} {seg[0][1]} L {seg[0][0]+0.1} {seg[0][1]}', x=seg[0][0], y=seg[0][1], xf=seg[-1][0], yf=seg[-1][1]))
    out['lignes'].append(dict(id=l['id'], num=l['num'], nom=l['nom'], couleur=l['couleur'], fond=l['fond'], d=chemin(l['pts'], debut, term), terminus=term, quartiers=quartiers))
    for x, y, m in l['pts']:
        out['stations'][m['id']] = dict(x=x, y=y, titre=m['titre'], type=m['type'], cat=m['categorie'], ligne=l['id'], couleur=col('cat-' + m['categorie']),
            voisins=m['voisins_meme_categorie'] + m['voisins_autres_categories'])
# distance minimale entre stations
st = list(out['stations'].values()); dmin = min(math.dist((a['x'], a['y']), (b['x'], b['y'])) for i, a in enumerate(st) for b in st[i+1:])
xs = [s['x'] for s in st]; ys = [s['y'] for s in st]
print('stations', len(st), 'dmin', round(dmin, 1), 'x', min(xs), max(xs), 'y', min(ys), max(ys))
json.dump(out, open(sys.argv[2], 'w'), ensure_ascii=False, indent=0)
