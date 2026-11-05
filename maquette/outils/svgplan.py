"""Rend le plan en SVG. Usage : svgplan.py plan.json mode [survol] [top3,...]"""
import json, sys, math
P = json.load(open(sys.argv[1])); mode = sys.argv[2]
survol = sys.argv[3] if len(sys.argv) > 3 and sys.argv[3] != '-' else None
top = sys.argv[4].split(',') if len(sys.argv) > 4 else []
FOND = '#0c1117'
o = []
o.append(f'<svg viewBox="0 0 1280 720" width="1280" height="720" role="img" aria-label="Plan des 68 métiers : 8 lignes partent de ta formation" style="display: block">')
# quartiers : bandes larges le long du tracé
for l in P['lignes']:
    explo = top and l['id'] not in top
    for q in l['quartiers']:
        if explo:
            o.append(f'<path d="{q["d"]}" fill="none" stroke="{l["couleur"]}" stroke-width="52" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 7" stroke-opacity="0.9"/>')
        o.append(f'<path d="{q["d"]}" fill="none" stroke="{l["fond"]}" stroke-width="44" stroke-linecap="round" stroke-linejoin="round"/>')
# tracés
for l in P['lignes']:
    fort = l['id'] in top
    if fort:
        o.append(f'<path d="{l["d"]}" fill="none" stroke="{l["couleur"]}" stroke-width="20" stroke-opacity="0.22" stroke-linecap="round" stroke-linejoin="round"/>')
    o.append(f'<path d="{l["d"]}" fill="none" stroke="{l["couleur"]}" stroke-width="{12 if fort else 8}" stroke-linecap="round" stroke-linejoin="round"/>')
# liens voisins au survol
S = P['stations']
if survol:
    s0 = S[survol]
    for v in s0['voisins']:
        if v in S:
            o.append(f'<line x1="{s0["x"]}" y1="{s0["y"]}" x2="{S[v]["x"]}" y2="{S[v]["y"]}" stroke="{s0["couleur"]}" stroke-width="2" stroke-dasharray="5 5"/>')
# stations
LIENS = {'dev-backend': 'fiche-dev-backend.dc.html', 'dsi': 'fiche-dsi.dc.html', 'integrateur-web': 'fiche-integrateur-web.dc.html', 'mlops': 'fiche-mlops.dc.html'}
for sid, s in S.items():
    r = 11 if sid == survol else 8
    if sid in LIENS: o.append(f'<a href="{LIENS[sid]}" aria-label="{s["titre"]}">')
    if sid == survol:
        o.append(f'<circle cx="{s["x"]}" cy="{s["y"]}" r="18" fill="none" stroke="{s["couleur"]}" stroke-width="2" stroke-opacity="0.7"/>')
    if s['type'] == 'evolution':
        o.append(f'<circle cx="{s["x"]}" cy="{s["y"]}" r="{r}" fill="{FOND}" stroke="{s["couleur"]}" stroke-width="4"/><circle cx="{s["x"]}" cy="{s["y"]}" r="{r-5}" fill="{s["couleur"]}"/>')
    else:
        o.append(f'<circle cx="{s["x"]}" cy="{s["y"]}" r="{r}" fill="{s["couleur"]}" stroke="{FOND}" stroke-width="3"/>')
    if sid in LIENS: o.append('</a>')
# libellés de quartier
for l in P['lignes']:
    for q in l['quartiers']:
        o.append(f'<text x="{q["lx"]:g}" y="{q["ly"]:g}" text-anchor="{q["la"]}" fill="{l["couleur"]}" font-family="Atkinson Hyperlegible, sans-serif" font-size="12" font-weight="700" letter-spacing="0.06em">{q["libelle"].upper()}</text>')
# terminus : pastille numérotée
for l in P['lignes']:
    x, y = l['terminus']
    o.append(f'<circle cx="{x}" cy="{y}" r="14" fill="{l["couleur"]}" stroke="{FOND}" stroke-width="3"/><text x="{x}" y="{y+5}" text-anchor="middle" fill="{FOND}" font-family="Bricolage Grotesque, sans-serif" font-size="15" font-weight="800">{l["num"]}</text>')
# hub
o.append(f'<circle cx="640" cy="360" r="30" fill="#eef2f7"/><text x="640" y="356" text-anchor="middle" fill="{FOND}" font-family="Bricolage Grotesque, sans-serif" font-size="12" font-weight="800">TA</text><text x="640" y="370" text-anchor="middle" fill="{FOND}" font-family="Bricolage Grotesque, sans-serif" font-size="10" font-weight="800">FORMATION</text>')
o.append('</svg>')
print('\n'.join(o))
