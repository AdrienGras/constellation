"""Placement glouton des noms de quartiers : évite stations, tracés et autres étiquettes."""
import json, sys, math
P = json.load(open(sys.argv[1]))
CW, H = 7.6, 14  # largeur moyenne d'un caractère en capitales 12 px espacées, hauteur
obst = [(s['x'] - 13, s['y'] - 13, s['x'] + 13, s['y'] + 13) for s in P['stations'].values()]
def pts_de(d):
    xs = d.replace('M', '').split('L'); return [tuple(map(float, p.split())) for p in xs]
for l in P['lignes']:
    pts = pts_de(l['d'])
    for (x1, y1), (x2, y2) in zip(pts, pts[1:]):
        n = max(1, int(math.dist((x1, y1), (x2, y2)) // 8))
        for i in range(n + 1):
            x, y = x1 + (x2 - x1) * i / n, y1 + (y2 - y1) * i / n
            obst.append((x - 23, y - 23, x + 23, y + 23))
    x, y = l['terminus']; obst.append((x - 16, y - 16, x + 16, y + 16))
obst.append((600, 320, 680, 400))  # pôle central
def chevauche(b):
    return any(not (b[2] <= o[0] or b[0] >= o[2] or b[3] <= o[1] or b[1] >= o[3]) for o in obst)
for l in P['lignes']:
    for q in l['quartiers']:
        w = len(q['libelle']) * CW + 4
        mx, my = (q['x'] + q['xf']) / 2, (q['y'] + q['yf']) / 2
        cands = []
        for d in (30, 42, 56, 72, 90):
            cands += [(mx, my - d, 'middle'), (mx, my + d + H * .6, 'middle'), (mx + d, my + 4, 'start'), (mx - d, my + 4, 'end'),
                      (q['x'], q['y'] - d, 'middle'), (q['xf'], q['yf'] - d, 'middle'), (q['x'], q['y'] + d + 8, 'middle'), (q['xf'], q['yf'] + d + 8, 'middle')]
        choisi = None
        for x, y, a in cands:
            x0 = x - w / 2 if a == 'middle' else (x if a == 'start' else x - w)
            b = (x0 - 3, y - H, x0 + w + 3, y + 4)
            if b[0] < 8 or b[2] > 1272 or b[1] < 8 or b[3] > 712: continue
            if not chevauche(b): choisi = (x, y, a, b); break
        if not choisi: print('ÉCHEC', q['libelle']); x, y, a = cands[0]; choisi = (x, y, a, (0, 0, 0, 0))
        q['lx'], q['ly'], q['la'] = round(choisi[0], 1), round(choisi[1], 1), choisi[2]
        obst.append(choisi[3])
json.dump(P, open(sys.argv[1], 'w'), ensure_ascii=False, indent=0)
print('ok')
