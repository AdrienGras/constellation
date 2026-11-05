"""Assemble les artboards de la roadmap : vide, remplie (jouable), aperçu d'impression A4."""
import json, html
D = json.load(open('/srv/AdrienGras/constellation/metiers.json', encoding='utf-8'))
M = {m['id']: m for m in D['metiers']}
B = '/tmp/claude-1000/-srv-AdrienGras-constellation/820987da-176b-4916-b2a1-c70a10db0665/scratchpad/canevas/root/project/'
e = lambda s: html.escape(s, quote=True)
ITEMS = {
 2027: [{'type': 'projet', 'titre': 'API REST de gestion de bibliothèque avec Symfony', 'url': 'https://symfony.com/doc/current/index.html', 'note': 'Pendant l’alternance, avec des tests et une documentation OpenAPI.'},
        {'type': 'notion', 'titre': 'Index et plans d’exécution en SQL', 'url': 'https://use-the-index-luke.com/fr', 'note': ''}],
 2028: [{'type': 'notion', 'titre': 'Docker et Docker Compose', 'url': 'https://docs.docker.com/get-started/', 'note': ''},
        {'type': 'projet', 'titre': 'Déployer mon API sur un VPS avec une CI GitHub Actions', 'url': 'https://docs.github.com/actions', 'note': 'Base de données, sauvegardes et HTTPS compris.'}],
 2029: [{'type': 'notion', 'titre': 'Sécurité applicative : OWASP Top 10', 'url': 'https://owasp.org/www-project-top-ten/', 'note': ''},
        {'type': 'projet', 'titre': 'Contribuer à un projet open source PHP', 'url': 'https://github.com/symfony/symfony/contribute', 'note': 'Commencer par une issue « good first issue ».'}],
 2030: [{'type': 'notion', 'titre': 'Architecture hexagonale', 'url': 'https://alistair.cockburn.us/hexagonal-architecture/', 'note': ''}],
 2031: [{'type': 'projet', 'titre': 'Un service à forte charge avec une file de messages', 'url': 'https://www.rabbitmq.com/tutorials', 'note': 'Objectif : un poste de développeur·se back-end.'}],
}
TETE = '''<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>@@T@@</title>
<script src="./support.js"></script>
<link rel="stylesheet" href="ds/constellation/tokens.css">
<link rel="stylesheet" href="ds/constellation/components/bundle.css">
<script src="ds/constellation/components/bundle.js"></script>
</head>
<body>
<x-dc>
<helmet>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400&amp;family=Bricolage+Grotesque:opsz,wght@12..96,500..800&amp;family=JetBrains+Mono:wght@400;500;600&amp;display=swap">
<style>
body{margin:0}
a{color:#eef2f7}a:hover{color:#ffffff}
</style>
</helmet>
'''
def pied(h, logique):
    return f'''</x-dc>
<script type="text/x-dc" data-dc-script data-props='{{"$preview":{{"width":1280,"height":{h}}}}}'>
{logique}
</script>
</body>
</html>
'''
cible = M['dev-backend']
comp = json.dumps([{'t': c} for c in cible['competences']], ensure_ascii=False)
TRAJET = '''<div style="position: relative; display: flex; flex-direction: column; gap: 8px">
<div aria-hidden="true" style="position: absolute; left: 25px; top: 24px; bottom: 24px; width: 8px; border-radius: 4px; background: var(--ligne-developpement)"></div>
<sc-for list="{{annees}}" as="a" hint-placeholder-count="5">
<section aria-label="{{a.an}}" style="position: relative; display: grid; grid-template-columns: 120px minmax(0, 1fr); gap: 16px; padding: 12px 0">
<div style="display: flex; align-items: flex-start; gap: 14px">
<svg width="58" height="58" viewBox="0 0 58 58" aria-hidden="true" style="flex: none"><circle cx="29" cy="29" r="20" fill="var(--fond)" stroke="var(--ligne-developpement)" stroke-width="6"></circle><circle cx="29" cy="29" r="8" fill="var(--ligne-developpement)"></circle></svg>
</div>
<div style="display: flex; flex-direction: column; gap: 10px; min-width: 0">
<h2 style="margin: 12px 0 0; font-family: var(--font-mono); font-size: 28px; line-height: 34px; font-weight: 600">{{a.an}}</h2>
@@CONTENU@@
</div>
</section>
</sc-for>
</div>'''
CONTENU_REMPLI = '''<sc-for list="{{a.items}}" as="it" hint-placeholder-count="2">
<x-import component-from-global-scope="Constellation.ItemRoadmap" type="{{it.type}}" titre="{{it.titre}}" url="{{it.url}}" note="{{it.note}}" premier="{{it.premier}}" dernier="{{it.dernier}}" on-monter="{{it.monter}}" on-descendre="{{it.descendre}}" on-modifier="{{it.modifier}}" on-supprimer="{{it.supprimer}}"></x-import>
</sc-for>
<sc-if value="{{a.vide}}" hint-placeholder-val="{{false}}"><p style="margin: 0; padding: 16px; border: 2px dashed var(--trait-fort); border-radius: var(--rayon-md); color: var(--encre-douce)">Rien pour {{a.an}} pour l’instant.</p></sc-if>
<x-import component-from-global-scope="Constellation.Button" variant="ghost" icone="plus" on-click="{{a.ajouter}}" style="align-self: flex-start">Ajouter à {{a.an}}</x-import>'''
DIALOGUE = '''<sc-if value="{{dialogue}}" hint-placeholder-val="{{false}}">
<x-import component-from-global-scope="Constellation.Dialog" open="{{dialogue}}" title="{{titreDialogue}}" description="Un projet à réaliser ou une notion à apprendre." on-close="{{fermer}}">
<x-import component-from-global-scope="Constellation.RadioGroup" legend="Type d’item" name="type-item" options="{{typesItem}}" default-value="{{brouillon.type}}" on-value-change="{{choisirType}}"></x-import>
<x-import component-from-global-scope="Constellation.Input" label="Titre" value="{{brouillon.titre}}" on-change="{{saisirTitre}}" placeholder="Ex. : API REST avec Symfony"></x-import>
<x-import component-from-global-scope="Constellation.Input" label="Ressource (URL)" type="url" value="{{brouillon.url}}" on-change="{{saisirUrl}}" placeholder="https://"></x-import>
<x-import component-from-global-scope="Constellation.Textarea" label="Note" optional="{{oui}}" value="{{brouillon.note}}" on-change="{{saisirNote}}"></x-import>
<div class="cs-dialog-footer">
<x-import component-from-global-scope="Constellation.Button" variant="ghost" on-click="{{fermer}}">Annuler</x-import>
<x-import component-from-global-scope="Constellation.Button" on-click="{{valider}}" disabled="{{titreVide}}">{{libelleValider}}</x-import>
</div>
</x-import>
</sc-if>'''
LOGIQUE = '''class Component extends DCLogic {
constructor(props) { super(props); this.state = { annees: @@INIT@@, dialogue: null, brouillon: { type: 'projet', titre: '', url: '', note: '' }, edition: null, message: '' }; }
maj(an, f) { this.setState({ annees: this.state.annees.map((a) => a.an === an ? Object.assign({}, a, { items: f(a.items.slice()) }) : a) }); }
renderVals() {
const st = this.state;
const annees = st.annees.map((a) => ({ an: a.an, vide: a.items.length === 0,
  ajouter: () => this.setState({ dialogue: a.an, edition: null, brouillon: { type: 'projet', titre: '', url: '', note: '' } }),
  items: a.items.map((it, k) => Object.assign({}, it, { premier: k === 0, dernier: k === a.items.length - 1,
    monter: () => this.maj(a.an, (xs) => { if (k > 0) { const t = xs[k - 1]; xs[k - 1] = xs[k]; xs[k] = t; } return xs; }),
    descendre: () => this.maj(a.an, (xs) => { if (k < xs.length - 1) { const t = xs[k + 1]; xs[k + 1] = xs[k]; xs[k] = t; } return xs; }),
    supprimer: () => this.maj(a.an, (xs) => { xs.splice(k, 1); return xs; }),
    modifier: () => this.setState({ dialogue: a.an, edition: k, brouillon: Object.assign({}, it) }) })) }));
const b = st.brouillon;
const champ = (nom) => (e) => this.setState({ brouillon: Object.assign({}, this.state.brouillon, { [nom]: e.target.value }) });
return {
  annees: annees, oui: true, competences: @@COMP@@, message: st.message, aMessage: !!st.message,
  dialogue: st.dialogue !== null, titreDialogue: (st.edition === null ? 'Ajouter un item à ' : 'Modifier un item de ') + st.dialogue,
  libelleValider: st.edition === null ? 'Ajouter' : 'Enregistrer', brouillon: b, titreVide: !b.titre.trim(),
  typesItem: [{ value: 'projet', label: 'Projet à réaliser', description: 'Quelque chose que tu construis.' }, { value: 'notion', label: 'Notion à apprendre', description: 'Un sujet à comprendre.' }],
  choisirType: (v) => this.setState({ brouillon: Object.assign({}, this.state.brouillon, { type: v }) }),
  saisirTitre: champ('titre'), saisirUrl: champ('url'), saisirNote: champ('note'),
  fermer: () => this.setState({ dialogue: null }),
  valider: () => { const an = st.dialogue, ed = st.edition, it = Object.assign({}, this.state.brouillon); this.maj(an, (xs) => { if (ed === null) xs.push(it); else xs[ed] = it; return xs; }); this.setState({ dialogue: null }); },
  exporter: () => this.setState({ message: 'constellation-roadmap.json est prêt (dans la maquette, rien n’est téléchargé).' })
};
}
}'''
def roadmap(nom, titre, h, items, entete, contenu):
    init = [{'an': an, 'items': items.get(an, [])} for an in range(2027, 2032)]
    corps = f'''<div style="width: 1280px; min-height: {h}px; background: var(--fond); color: var(--encre); font-family: var(--font-sans); font-size: 17px; line-height: 26px">
<x-import component-from-global-scope="Constellation.BarreNavigation" actif="roadmap" fin="Enregistré dans ce navigateur"></x-import>
<main id="contenu" style="padding: 32px 48px 64px; display: flex; flex-direction: column; gap: 24px">
{entete}
<div style="display: flex; gap: 40px; align-items: flex-start">
<div style="flex: 1; min-width: 0">{TRAJET.replace('@@CONTENU@@', contenu)}</div>
@@ASIDE@@
</div>
</main>
{DIALOGUE}
</div>
'''
    t = TETE.replace('@@T@@', titre) + corps + pied(h, LOGIQUE.replace('@@INIT@@', json.dumps(init, ensure_ascii=False)).replace('@@COMP@@', comp))
    return t
ASIDE = '''<aside aria-label="Compétences du métier visé" style="width: 340px; flex: none; background: var(--surface); border-radius: var(--rayon-md); box-shadow: var(--ombre-carte); padding: 24px; display: flex; flex-direction: column; gap: 14px">
<p class="etiquette" style="margin: 0; color: var(--encre-douce)">Compétences de la fiche</p>
<x-import component-from-global-scope="Constellation.PastilleLigne" ligne="developpement"></x-import>
<p style="margin: 0; font-weight: 700">Développeur·se back-end</p>
<div style="display: flex; flex-wrap: wrap; gap: 8px"><sc-for list="{{competences}}" as="c" hint-placeholder-count="5"><x-import component-from-global-scope="Constellation.Badge">{{c.t}}</x-import></sc-for></div>
<p style="margin: 0; font-size: 15px; line-height: 22px; color: var(--encre-douce)">Une référence pour construire ta roadmap, pas une liste à cocher.</p>
<a href="fiche-dev-backend.dc.html" style="font-weight: 700">Voir la fiche</a>
</aside>'''
ENTETE_REMPLI = '''<div style="display: flex; justify-content: space-between; align-items: flex-end; gap: 24px; flex-wrap: wrap">
<div>
<p class="etiquette" style="margin: 0; color: var(--encre-douce)">Ma roadmap · 2027 → 2031</p>
<h1 class="titre-1" style="margin: 4px 0 0">Cap sur Développeur·se back-end</h1>
<p style="margin: 6px 0 0; color: var(--encre-douce)">Le métier visé peut changer : <a href="roadmap-vide.dc.html">choisir un autre métier</a>.</p>
</div>
<div style="display: flex; gap: 8px; flex-wrap: wrap">
<a href="roadmap-impression.dc.html" class="cs-btn cs-btn-outline">Imprimer en PDF</a>
<x-import component-from-global-scope="Constellation.Button" variant="outline" icone="disque" on-click="{{exporter}}">Exporter en JSON</x-import>
<x-import component-from-global-scope="Constellation.Button" variant="ghost">Importer un JSON</x-import>
</div>
</div>
<sc-if value="{{aMessage}}" hint-placeholder-val="{{false}}"><x-import component-from-global-scope="Constellation.Alert" variant="neutre" icone="check" role="status" title="{{message}}"></x-import></sc-if>'''
t = roadmap('roadmap.dc.html', 'Roadmap remplie', 2000, ITEMS, ENTETE_REMPLI, CONTENU_REMPLI).replace('@@ASIDE@@', ASIDE)
open(B + 'roadmap.dc.html', 'w').write(t); print('roadmap', len(t))
ENTETE_VIDE = '''<div style="display: flex; flex-direction: column; gap: 6px">
<p class="etiquette" style="margin: 0; color: var(--encre-douce)">Ma roadmap · 2027 → 2031</p>
<h1 class="titre-1" style="margin: 0">Quel métier vises-tu ?</h1>
<p style="margin: 0; color: var(--encre-douce); max-width: 760px">Choisis-le parmi les 68 métiers. Ce matin t’a peut-être fait changer d’avis : c’est prévu, tu pourras en changer à tout moment.</p>
</div>
<div style="display: flex; gap: 16px; align-items: flex-end; flex-wrap: wrap">
<x-import component-from-global-scope="Constellation.Input" label="Métier visé" icone="recherche" default-value="back" placeholder="Ex. : DevOps, data, sécurité…" style="width: 420px"></x-import>
<x-import component-from-global-scope="Constellation.Button" variant="ghost">Importer un JSON</x-import>
</div>
<ul role="listbox" aria-label="Métiers correspondants" style="list-style: none; margin: -12px 0 0; padding: 8px; width: 420px; box-sizing: border-box; background: var(--surface); border-radius: var(--rayon-md); box-shadow: var(--ombre-flottante)">
<li role="option" aria-selected="true" style="display: flex; gap: 10px; align-items: center; padding: 8px 10px; border-radius: var(--rayon-sm); background: var(--surface-muted)"><x-import component-from-global-scope="Constellation.Station" ligne="developpement" categorie="backend" type="entree"></x-import><a href="roadmap.dc.html" style="color: var(--encre); font-weight: 700; text-decoration: none">Développeur·se back-end</a></li>
<li role="option" aria-selected="false" style="display: flex; gap: 10px; align-items: center; padding: 8px 10px"><x-import component-from-global-scope="Constellation.Station" ligne="developpement" categorie="backend" type="entree"></x-import><span>Développeur·se full-stack</span></li>
<li role="option" aria-selected="false" style="display: flex; gap: 10px; align-items: center; padding: 8px 10px"><x-import component-from-global-scope="Constellation.Station" ligne="developpement" categorie="backend" type="entree"></x-import><span>Développeur·se base de données</span></li>
</ul>'''
CONTENU_VIDE = '''<p style="margin: 0; padding: 16px; border: 2px dashed var(--trait-fort); border-radius: var(--rayon-md); color: var(--encre-douce)">Rien pour {{a.an}}. Ajoute un projet à réaliser ou une notion à apprendre.</p>
<x-import component-from-global-scope="Constellation.Button" variant="ghost" icone="plus" on-click="{{a.ajouter}}" style="align-self: flex-start">Ajouter à {{a.an}}</x-import>'''
ASIDE_VIDE = '''<aside style="width: 340px; flex: none; background: var(--surface); border-radius: var(--rayon-md); box-shadow: var(--ombre-carte); padding: 24px; color: var(--encre-douce)"><p class="etiquette" style="margin: 0 0 8px">Compétences de la fiche</p><p style="margin: 0">Elles s’afficheront ici dès que tu auras choisi un métier.</p></aside>'''
t = roadmap('roadmap-vide.dc.html', 'Roadmap vide', 1500, {}, ENTETE_VIDE, CONTENU_VIDE).replace('@@ASIDE@@', ASIDE_VIDE)
open(B + 'roadmap-vide.dc.html', 'w').write(t); print('vide', len(t))
# aperçu A4 : papier blanc, sans couleur de fond
blocs = ''
for an in range(2027, 2032):
    lis = ''.join(f'''<li style="padding: 8px 0; border-top: 1px solid #999999"><span style="font-size: 11px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase">{'Projet à réaliser' if it['type']=='projet' else 'Notion à apprendre'}</span><br><strong style="font-size: 14px">{e(it['titre'])}</strong><br><span style="font-family: var(--font-mono); font-size: 11px">{e(it['url'])}</span>{('<br><span style="font-size: 12px">' + e(it['note']) + '</span>') if it['note'] else ''}</li>''' for it in ITEMS[an])
    blocs += f'''<section style="break-inside: avoid; border: 1.5px solid #000000; border-radius: 6px; padding: 12px 16px"><h2 style="margin: 0 0 4px; font-family: var(--font-mono); font-size: 20px">{an}</h2><ul style="list-style: none; margin: 0; padding: 0">{lis}</ul></section>'''
a4 = TETE.replace('@@T@@', 'Roadmap, aperçu d’impression A4') + f'''<div style="width: 794px; height: 1123px; box-sizing: border-box; padding: 56px 60px; background: #ffffff; color: #000000; font-family: var(--font-sans); font-size: 13px; line-height: 18px; display: flex; flex-direction: column; gap: 14px">
<header style="display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid #000000; padding-bottom: 10px">
<div><p style="margin: 0; font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase">Ma roadmap 2027 → 2031</p><h1 style="margin: 2px 0 0; font-family: var(--font-display); font-size: 26px; line-height: 30px">Cap sur Développeur·se back-end</h1></div>
<p style="margin: 0; font-size: 11px; text-align: right">Imprimée le 28/05/2027<br>constellation · CODA Dijon</p>
</header>
{blocs}
<p style="margin: auto 0 0; font-size: 11px; color: #333333">Compétences de la fiche visée : {e(', '.join(cible['competences']))}.</p>
</div>
''' + f'''</x-dc>
<script type="text/x-dc" data-dc-script data-props='{{"$preview":{{"width":794,"height":1123}}}}'>
class Component extends DCLogic {{
renderVals() {{ return {{}}; }}
}}
</script>
</body>
</html>
'''
open(B + 'roadmap-impression.dc.html', 'w').write(a4); print('a4', len(a4))
# vérifier la logique de la roadmap
js = open(B + 'roadmap.dc.html').read(); js = js[js.index('class Component'):js.index('</script>', js.index('class Component'))]
open('/tmp/claude-1000/-srv-AdrienGras-constellation/820987da-176b-4916-b2a1-c70a10db0665/scratchpad/canevas/rm.js', 'w').write('''class DCLogic { constructor(p){this.props=p;} setState(s){Object.assign(this.state, s);} }
''' + js + '''
const c = new Component({}); let v = c.renderVals();
v.annees[0].items[1].monter(); v = c.renderVals(); console.log('après monter', v.annees[0].items.map(i => i.titre.slice(0, 12)));
v.annees[3].ajouter(); v = c.renderVals(); v.saisirTitre({ target: { value: 'Test' } }); v = c.renderVals(); v.valider(); v = c.renderVals(); console.log('2030', v.annees[3].items.map(i => i.titre));
v.annees[4].items[0].supprimer(); v = c.renderVals(); console.log('2031 vide', v.annees[4].vide);''')
import subprocess; print(subprocess.run(['node', '/tmp/claude-1000/-srv-AdrienGras-constellation/820987da-176b-4916-b2a1-c70a10db0665/scratchpad/canevas/rm.js'], capture_output=True, text=True))
