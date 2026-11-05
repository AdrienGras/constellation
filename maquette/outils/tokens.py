"""Construit tokens.json du design system constellation (thème sombre unique)
et vérifie toutes les paires de contraste WCAG 2 AA dans les deux thèmes."""
import json, sys
sys.path.insert(0, '.')
from couleurs import ratio, hex2oklch, oklch2hex

SORTIE = sys.argv[1]
DONNEES = json.load(open('/srv/AdrienGras/constellation/metiers.json', encoding='utf-8'))
CAT = {c['id']: c['libelle'] for c in DONNEES['categories']}
LC = json.load(open('lignes.json', encoding='utf-8'))          # clair
LS = json.load(open('lignes-sombre.json', encoding='utf-8'))   # sombre
THEMES = ('sombre',)

N = {  # neutres : (sombre, clair)
  'fond': ('#0c1117', '#f7f6f1'), 'surface': ('#151c25', '#ffffff'), 'surface-muted': ('#1f2833', '#eeede6'),
  'trait': ('#2a3442', '#dcdacf'), 'trait-fort': ('#6e7a8b', '#7d7b70'),
  'encre': ('#eef2f7', '#121a33'), 'encre-douce': ('#a3adbb', '#4a5163'),
  'primaire': ('#eef2f7', '#182452'), 'primaire-survol': ('#ffffff', '#25356f'), 'sur-primaire': ('#0c1117', '#ffffff'),
  'focus': ('#ffffff', '#1d4ed8'),
  'succes': ('#5cf29b', '#17663a'), 'succes-doux': ('#0f3a24', '#dcf2e3'),
  'attention': ('#ffc94d', '#7a4a00'), 'attention-doux': ('#3d2c05', '#fbeccb'),
  'danger': ('#ff8080', '#a3261f'), 'danger-doux': ('#4a1416', '#fde4e0'),
  'info': ('#7cc4ff', '#1e4f9c'), 'info-doux': ('#0d2a47', '#e6effc'),
}
USAGES = {
  'fond': "Fond de page, graphite bleuté. Toute l'app pose ses surfaces dessus.",
  'surface': "Cartes, cartouches, menus, champs, posés sur `fond`.",
  'surface-muted': "En-têtes de tableau, zones calmes, piste des barres de progression et de plage.",
  'trait': "Filets décoratifs et séparateurs. Ne porte jamais une information seul.",
  'trait-fort': "Bordure des champs, cases et boutons outline : ≥ 3:1 sur `fond` et `surface`.",
  'encre': "Texte principal, sur `fond`, `surface`, `surface-muted` et tous les fonds de ligne (`ligne-*-pastel`).",
  'encre-douce': "Texte secondaire, métadonnées, mentions de source : ≥ 4,5:1 sur `fond`, `surface`, `surface-muted`.",
  'primaire': "Couleur de l'interface : bouton principal, lien actif, option sélectionnée. Blanc cassé : l'élément le plus lumineux de l'écran. Jamais pour une donnée.",
  'primaire-survol': "Survol du bouton principal.",
  'sur-primaire': "Texte et icônes posés sur `primaire`.",
  'focus': "Anneau de focus clavier, 2 px plein, décalé de 2 px : ≥ 3:1 sur toutes les surfaces.",
}
toks = []
def t(name, sombre, clair, usage):
    toks.append({'name': name, 'value': {'sombre': sombre, 'clair': clair}, 'usage': usage})
for k, (vs, vc) in N.items():
    if k in USAGES: t(k, vs, vc, USAGES[k])
for k, u in [('succes', 'Fiabilité « bonne », premier emploi'), ('attention', 'Fiabilité « moyenne », avertissements'), ('danger', 'Fiabilité « faible », erreurs de saisie'), ('info', "Mentions de prudence sur les salaires")]:
    t(k, *N[k], f"{u} : texte et icône, sur `{k}-doux`, `surface` et `fond`. Toujours accompagné d'un mot.")
    t(f'{k}-doux', *N[k + '-doux'], f"Fond du badge ou de l'encadré « {k} ».")

def fond_de_ligne_sombre(vive):
    """Fond de quartier sombre, teinté de la ligne : la couleur vive et `encre` y passent 4,5:1."""
    L, C, H = hex2oklch(vive)
    for i in range(36, 10, -1):
        h = oklch2hex(i / 100, min(C, 0.09), H)
        if ratio(vive, h) >= 4.6 and ratio(N['encre'][0], h) >= 4.6: return h
    raise SystemExit('pas de fond pour ' + vive)

for i, lid in enumerate(LC, 1):
    c, s = LC[lid], LS[lid]
    nom = c['nom']
    fs = fond_de_ligne_sombre(s['vive'])
    t(f'ligne-{lid}', s['vive'], c['vive'], f"Ligne {i} · {nom} : trajet du plan, stations, pastille numérotée. Couleur fluo, ≥ 4,5:1 sur `fond` et `surface` : elle sert aussi pour du texte.")
    t(f'ligne-{lid}-pastel', fs, c['pastel'], f"Ligne {i} · {nom} : fond sombre teinté de la ligne : quartier sur le plan, badges de ligne, rang dans le quiz. Ne porte jamais seul une information.")
    t(f'ligne-{lid}-encre', '{ligne-%s}' % lid, c['encre'], f"Ligne {i} · {nom} : texte coloré de la ligne, sur `ligne-{lid}-pastel`, `surface` et `fond` (≥ 4,5:1). C'est la couleur de ligne elle-même.")
    t(f'sur-ligne-{lid}', '{fond}', '#ffffff' if ratio('#ffffff', c['vive']) >= 4.5 else '{encre}', f"Chiffre de la pastille et texte posés sur `ligne-{lid}` (≥ 4,5:1).")

def nuances(vive, k, theme, haut=None):
    L, C, H = hex2oklch(vive)
    if theme == 'clair':
        cibles = [3.3 + ((haut or 8.0) - 3.3) * j / (k - 1) for j in range(k)]
        out = []
        for cible in cibles:
            for i in range(1000, 150, -1):
                h = oklch2hex(i / 1000, max(C, 0.09), H)
                if ratio(h, '#ffffff') >= cible and ratio(h, N['fond'][1]) >= 3.05: break
            out.append(h)
        return out
    # sombre : de la couleur de ligne vers plus clair et plus doux, toutes ≥ 4,5:1 sur surface
    out = []
    for j in range(k):
        Lj = min(0.95, L + 0.07 * j); h = oklch2hex(Lj, C * (1 - 0.18 * j), H)
        out.append(h)
    return out
for mb in DONNEES['macro_branches']:
    cats = mb['categories']; lid = mb['id']
    if len(cats) == 1:
        t(f'cat-{cats[0]}', '{ligne-%s}' % lid, '{ligne-%s}' % lid, f"Catégorie « {CAT[cats[0]]} » : seule catégorie de la ligne {LC[lid]['nom']}, même couleur que la ligne.")
        continue
    haut = {'qualite-archi': 5.6, 'produit-design': 6.2}.get(lid, 8.0)
    ns, nc = nuances(LS[lid]['vive'], len(cats), 'sombre'), nuances(LC[lid]['vive'], len(cats), 'clair', haut)
    for cid, a, b in zip(cats, ns, nc):
        t(f'cat-{cid}', a, b, f"Catégorie « {CAT[cid]} » (ligne {LC[lid]['nom']}) : remplissage des stations de ce quartier. Nuance de la ligne ; le quartier se reconnaît d'abord par son nom écrit.")
ordre_cat = [c['id'] for c in DONNEES['categories']]
cats_t = sorted([x for x in toks if x['name'].startswith('cat-')], key=lambda x: ordre_cat.index(x['name'][4:]))
toks = [x for x in toks if not x['name'].startswith('cat-')] + cats_t

# ---- vérification
IDX = {x['name']: x for x in toks}
def val(name, th):
    v = IDX[name]['value'][th]
    return val(v[1:-1], th) if v.startswith('{') else v
paires = []
for s in ['fond', 'surface', 'surface-muted']:
    paires += [('encre', s, 4.5), ('encre-douce', s, 4.5), ('focus', s, 3)]
paires += [('trait-fort', 'fond', 3), ('trait-fort', 'surface', 3), ('sur-primaire', 'primaire', 4.5), ('sur-primaire', 'primaire-survol', 4.5), ('primaire', 'fond', 3), ('primaire', 'surface', 3)]
for k in ['succes', 'attention', 'danger', 'info']:
    paires += [(k, f'{k}-doux', 4.5), (k, 'surface', 4.5), (k, 'fond', 4.5), ('encre', f'{k}-doux', 4.5)]
for lid in LC:
    paires += [(f'sur-ligne-{lid}', f'ligne-{lid}', 4.5), (f'ligne-{lid}', 'fond', 3), (f'ligne-{lid}', 'surface', 3),
               (f'ligne-{lid}-encre', f'ligne-{lid}-pastel', 4.5), (f'ligne-{lid}-encre', 'surface', 4.5), (f'ligne-{lid}-encre', 'fond', 4.5),
               ('encre', f'ligne-{lid}-pastel', 4.5)]
for x in cats_t:
    paires += [(x['name'], 'fond', 3), (x['name'], 'surface', 3)]
echecs = 0; rapport = []
for th in THEMES:
    for a, b, mini in paires:
        r = ratio(val(a, th), val(b, th)); ok = r >= mini; echecs += not ok
        rapport.append((th, a, b, round(r, 2), mini, 'OK' if ok else 'ÉCHEC'))
json.dump(rapport, open('contrastes.json', 'w'), ensure_ascii=False)
print(f'{len(paires)} paires × {len(THEMES)} thèmes, {echecs} échec(s)')
for x in rapport:
    if x[5] != 'OK': print(x)

tokens = json.load(open(SORTIE, encoding='utf-8'))
for x in toks: x['value'] = x['value']['sombre']
tokens['color'] = {'themes': [{'id': 'sombre', 'name': 'Sombre'}], 'tokens': toks}
tokens['shadow'] = {'tokens': [
  {'name': 'ombre-carte', 'value': '0 0 0 1px rgba(255, 255, 255, 0.05), 0 2px 8px rgba(0, 0, 0, 0.45)', 'usage': "Cartes et cartouches posés sur `fond`."},
  {'name': 'ombre-flottante', 'value': '0 0 0 1px rgba(255, 255, 255, 0.08), 0 16px 40px rgba(0, 0, 0, 0.6)', 'usage': "Infobulles, menus et dialogues."}]}
json.dump(tokens, open(SORTIE, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
0 and print({x['name']: x['value']['sombre'] for x in toks if x['name'].startswith(('cat-', 'ligne-')) and x['name'].endswith(('pastel',)) or x['name'].startswith('cat-')})
