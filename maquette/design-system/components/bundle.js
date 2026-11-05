/* @ds-bundle: {"format":4,"namespace":"Constellation","components":[{"name":"Button"},{"name":"Badge"},{"name":"Card"},{"name":"Tabs"},{"name":"ToggleGroup"},{"name":"Input"},{"name":"Textarea"},{"name":"Select"},{"name":"RadioGroup"},{"name":"Alert"},{"name":"Tooltip"},{"name":"Dialog"},{"name":"Table"},{"name":"Progress"},{"name":"BarreNavigation"},{"name":"PastilleLigne"},{"name":"Station"},{"name":"BadgeFiabilite"},{"name":"BadgeType"},{"name":"PlageSalaire"},{"name":"CartoucheSilkhom"},{"name":"CartoucheApec"},{"name":"ItemRoadmap"}]} */
(function () {
  'use strict';
  var React = window.React;
  var h = React.createElement;
  var useState = React.useState;
  var useId = React.useId || function () { var r = React.useRef('cs-' + Math.random().toString(36).slice(2, 8)); return r.current; };

  function cx() { return Array.prototype.filter.call(arguments, Boolean).join(' '); }
  function omit(o, keys) { var r = {}; for (var k in o) { if (keys.indexOf(k) < 0) r[k] = o[k]; } return r; }

  /* ---- Lignes du plan (ordre de metiers.json > macro_branches) ---- */
  var LIGNES = [
    { id: 'developpement', numero: 1, nom: 'Développement' },
    { id: 'infra-cloud', numero: 2, nom: 'Infra & cloud' },
    { id: 'cybersecurite', numero: 3, nom: 'Cybersécurité' },
    { id: 'data-ia', numero: 4, nom: 'Data & IA' },
    { id: 'qualite-archi', numero: 5, nom: 'Qualité & architecture' },
    { id: 'produit-design', numero: 6, nom: 'Produit & design' },
    { id: 'relation-transmission', numero: 7, nom: 'Relation & transmission' },
    { id: 'management', numero: 8, nom: 'Management' }
  ];
  function ligne(id) { for (var i = 0; i < LIGNES.length; i++) { if (LIGNES[i].id === id) return LIGNES[i]; } return LIGNES[0]; }

  /* ---- Icônes : tracés Lucide (lucide-react à l'implémentation) ---- */
  var ICONES = {
    check: ['M20 6 9 17l-5-5'],
    x: ['M18 6 6 18', 'm6 6 12 12'],
    'chevron-down': ['m6 9 6 6 6-6'],
    info: ['c12,12,10', 'M12 16v-4', 'M12 8h.01'],
    alerte: ['m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3', 'M12 9v4', 'M12 17h.01'],
    aide: ['c12,12,10', 'M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3', 'M12 17h.01'],
    'check-cercle': ['c12,12,10', 'm9 12 2 2 4-4'],
    'moins-cercle': ['c12,12,10', 'M8 12h8'],
    poignee: ['c9,12,1', 'c9,5,1', 'c9,19,1', 'c15,12,1', 'c15,5,1', 'c15,19,1'],
    haut: ['m5 12 7-7 7 7', 'M12 19V5'],
    bas: ['M12 5v14', 'm19 12-7 7-7-7'],
    lien: ['M15 3h6v6', 'M10 14 21 3', 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6'],
    code: ['m16 18 6-6-6-6', 'm8 6-6 6 6 6'],
    livre: ['M12 7v14', 'M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z'],
    recherche: ['c11,11,8', 'm21 21-4.3-4.3'],
    plus: ['M5 12h14', 'M12 5v14'],
    corbeille: ['M3 6h18', 'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6', 'M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2'],
    crayon: ['M21.17 6.81a1 1 0 0 0-3.99-3.99L3.84 16.17a2 2 0 0 0-.5.83l-1.32 4.35a.5.5 0 0 0 .62.62l4.35-1.32a2 2 0 0 0 .83-.5z', 'm15 5 4 4'],
    disque: ['M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z', 'M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7', 'M7 3v4a1 1 0 0 0 1 1h7']
  };
  function Icone(props) {
    var parts = ICONES[props.nom] || [];
    return h('svg', { className: cx('cs-ico', props.petit && 'cs-ico-sm'), viewBox: '0 0 24 24', 'aria-hidden': 'true', focusable: 'false' },
      parts.map(function (d, i) {
        if (d.charAt(0) === 'c') { var c = d.slice(1).split(','); return h('circle', { key: i, cx: c[0], cy: c[1], r: c[2] }); }
        return h('path', { key: i, d: d });
      }));
  }

  /* ---- Primitives (anatomie shadcn/ui) ---- */
  function Button(props) {
    var variant = props.variant || 'default', size = props.size || 'default';
    var rest = omit(props, ['variant', 'size', 'className', 'children', 'icone', 'as']);
    var Tag = props.as === 'a' ? 'a' : 'button';
    if (Tag === 'button' && !rest.type) rest.type = 'button';
    rest.className = cx('cs-btn', 'cs-btn-' + variant, size !== 'default' && 'cs-btn-' + size, props.className);
    return h(Tag, rest, props.icone ? h(Icone, { nom: props.icone }) : null, props.children);
  }

  function Badge(props) {
    return h('span', { className: cx('cs-badge', 'cs-badge-' + (props.variant || 'secondary'), props.className) }, props.icone ? h(Icone, { nom: props.icone, petit: true }) : null, props.children);
  }

  function Card(props) { return h(props.as || 'section', { className: cx('cs-card', props.className), 'aria-labelledby': props['aria-labelledby'] }, props.children); }
  function CardHeader(props) { return h('div', { className: 'cs-card-header' }, props.children); }
  function CardTitle(props) { return h(props.as || 'h3', { className: 'cs-card-title', id: props.id }, props.children); }
  function CardDescription(props) { return h('p', { className: 'cs-card-desc' }, props.children); }
  function CardContent(props) { return h('div', { className: 'cs-card-content' }, props.children); }
  function CardFooter(props) { return h('div', { className: 'cs-card-footer' }, props.children); }

  function Tabs(props) {
    var items = props.items || [];
    var st = useState(props.defaultValue || (items[0] && items[0].value)); var actif = props.value || st[0];
    var base = useId();
    function choisir(v) { st[1](v); if (props.onValueChange) props.onValueChange(v); }
    function clavier(e, i) {
      var n = items.length, j = null;
      if (e.key === 'ArrowRight') j = (i + 1) % n; else if (e.key === 'ArrowLeft') j = (i - 1 + n) % n; else if (e.key === 'Home') j = 0; else if (e.key === 'End') j = n - 1;
      if (j !== null) { e.preventDefault(); choisir(items[j].value); var el = document.getElementById(base + '-t-' + j); if (el) el.focus(); }
    }
    var courant = items.filter(function (it) { return it.value === actif; })[0];
    return h('div', { className: props.className },
      h('div', { role: 'tablist', 'aria-label': props.label, className: 'cs-tablist' }, items.map(function (it, i) {
        var sel = it.value === actif;
        return h('button', { key: it.value, type: 'button', role: 'tab', id: base + '-t-' + i, 'aria-selected': sel ? 'true' : 'false', 'aria-controls': base + '-p', tabIndex: sel ? 0 : -1, className: 'cs-tab', onClick: function () { choisir(it.value); }, onKeyDown: function (e) { clavier(e, i); } }, it.label);
      })),
      courant && courant.content !== undefined ? h('div', { role: 'tabpanel', id: base + '-p', 'aria-labelledby': base + '-t-' + items.indexOf(courant), className: 'cs-tabpanel', tabIndex: 0 }, courant.content) : null);
  }

  function ToggleGroup(props) {
    var st = useState(props.defaultValue); var val = props.value !== undefined ? props.value : st[0];
    return h('div', { role: 'group', 'aria-label': props.label, className: cx('cs-togglegroup', props.className) }, (props.items || []).map(function (it) {
      if (it.href) return h('a', { key: it.value, href: it.href, className: 'cs-toggle', 'aria-current': it.value === val ? 'page' : undefined, 'aria-pressed': it.value === val ? 'true' : 'false' }, it.label);
      return h('button', { key: it.value, type: 'button', className: 'cs-toggle', 'aria-pressed': it.value === val ? 'true' : 'false', onClick: function () { st[1](it.value); if (props.onValueChange) props.onValueChange(it.value); } }, it.label);
    }));
  }

  function Champ(props, controle) {
    var id = props.id || props._autoId;
    var aide = props.hint ? id + '-aide' : null, err = props.error ? id + '-err' : null;
    return h('div', { className: cx('cs-field', props.className) },
      h('label', { htmlFor: id }, props.label, props.optional ? h('span', { style: { fontWeight: 400, color: 'var(--encre-douce)' } }, ' (facultatif)') : null),
      controle(id, [aide, err].filter(Boolean).join(' ') || undefined),
      props.hint ? h('p', { className: 'cs-hint', id: aide }, props.hint) : null,
      props.error ? h('p', { className: 'cs-error', id: err }, h(Icone, { nom: 'alerte', petit: true }), props.error) : null);
  }
  var CHAMP = ['label', 'hint', 'error', 'optional', 'className', 'icone'];
  function Input(props) {
    var auto = useId(); var p = Object.assign({ _autoId: auto }, props);
    return Champ(p, function (id, desc) {
      var input = h('input', Object.assign(omit(props, CHAMP), { id: id, 'aria-describedby': desc, 'aria-invalid': props.error ? 'true' : undefined }));
      return props.icone === 'recherche' ? h('div', { className: 'cs-search' }, h(Icone, { nom: 'recherche' }), input) : input;
    });
  }
  function Textarea(props) {
    var auto = useId(); var p = Object.assign({ _autoId: auto }, props);
    return Champ(p, function (id, desc) { return h('textarea', Object.assign(omit(props, CHAMP), { id: id, 'aria-describedby': desc })); });
  }
  function Select(props) {
    var auto = useId(); var p = Object.assign({ _autoId: auto }, props);
    return Champ(p, function (id, desc) {
      return h('div', { className: 'cs-select-wrap' },
        h('select', Object.assign(omit(props, CHAMP.concat(['options'])), { id: id, 'aria-describedby': desc }), (props.options || []).map(function (o) { return h('option', { key: o.value, value: o.value }, o.label); })),
        h(Icone, { nom: 'chevron-down' }));
    });
  }

  function RadioGroup(props) {
    var auto = useId(); var name = props.name || auto;
    var carte = props.variant === 'carte';
    var lettres = 'ABCDEFGH';
    return h('fieldset', { className: cx('cs-radiogroup', carte && 'cs-radiogroup-carte', props.className) },
      h('legend', { className: cx('cs-legend', props.legendeMasquee && 'cs-sr') }, props.legend),
      (props.options || []).map(function (o, i) {
        return h('label', { key: o.value, className: 'cs-radio' },
          h('input', { type: 'radio', name: name, value: o.value, defaultChecked: props.defaultValue === o.value, onChange: props.onValueChange ? function () { props.onValueChange(o.value); } : undefined }),
          h('span', { className: 'cs-radio-box', 'aria-hidden': 'true' }),
          carte ? h('span', { className: 'cs-radio-letter', 'aria-hidden': 'true' }, lettres.charAt(i)) : null,
          h('span', { className: 'cs-radio-text' }, h('span', null, o.label), o.description ? h('span', { className: 'cs-radio-desc' }, o.description) : null));
      }));
  }

  function Alert(props) {
    var v = props.variant || 'info';
    var ico = props.icone || (v === 'attention' ? 'alerte' : 'info');
    return h('div', { className: cx('cs-alert', 'cs-alert-' + v, props.className), role: props.role },
      h(Icone, { nom: ico }),
      h('div', null, props.title ? h('p', { className: 'cs-alert-title' }, props.title) : null, props.children ? h('p', { className: 'cs-alert-body' }, props.children) : null));
  }

  function Tooltip(props) {
    var st = useState(false); var ouvert = props.open !== undefined ? props.open : st[0];
    var id = useId();
    var enfant = React.cloneElement(props.children, { 'aria-describedby': ouvert ? id : undefined, onMouseEnter: function () { st[1](true); }, onMouseLeave: function () { st[1](false); }, onFocus: function () { st[1](true); }, onBlur: function () { st[1](false); } });
    return h('span', { className: 'cs-tooltip-wrap' }, enfant, ouvert ? h('span', { role: 'tooltip', id: id, className: 'cs-tooltip' }, props.content) : null);
  }

  function Dialog(props) {
    var titreId = useId();
    if (!props.open) return null;
    return h('div', { className: cx('cs-overlay', props.inline && 'cs-overlay-inline') },
      h('div', { role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': titreId, className: 'cs-dialog' },
        h('button', { type: 'button', className: 'cs-icon-btn cs-dialog-close', 'aria-label': 'Fermer', onClick: props.onClose }, h(Icone, { nom: 'x' })),
        h('h2', { id: titreId }, props.title),
        props.description ? h('p', { className: 'cs-dialog-desc' }, props.description) : null,
        props.children,
        props.footer ? h('div', { className: 'cs-dialog-footer' }, props.footer) : null));
  }

  function Table(props) {
    var cols = props.columns || [];
    return h('div', { className: 'cs-table-wrap' }, h('table', { className: 'cs-table' },
      props.caption ? h('caption', null, props.caption) : null,
      h('thead', null, h('tr', null, cols.map(function (c) { return h('th', { key: c.key, scope: 'col', className: c.align === 'right' ? 'cs-right' : undefined }, c.label); }))),
      h('tbody', null, (props.rows || []).map(function (r, i) {
        return h('tr', { key: i }, cols.map(function (c, j) {
          var Tag = j === 0 && props.rowHeaders ? 'th' : 'td';
          return h(Tag, { key: c.key, scope: Tag === 'th' ? 'row' : undefined, className: cx(c.align === 'right' && 'cs-right', c.num && 'cs-num') }, r[c.key] === null || r[c.key] === undefined ? h('span', { className: 'cs-nd' }, 'n.d.') : r[c.key]);
        }));
      }))));
  }

  function Progress(props) {
    var max = props.max || 100, pct = Math.max(0, Math.min(100, (props.value / max) * 100));
    return h('div', { className: 'cs-progress' },
      props.label ? h('div', { className: 'cs-progress-label', 'aria-hidden': 'true' }, h('span', null, props.label), props.detail ? h('span', { style: { color: 'var(--encre-douce)', fontWeight: 400 } }, props.detail) : null) : null,
      h('div', { className: 'cs-progress-track', role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': max, 'aria-valuenow': props.value, 'aria-label': props.label }, h('div', { className: 'cs-progress-bar', style: { width: pct + '%' } })));
  }

  /* ---- Composants du domaine ---- */
  function Logo() {
    return h('svg', { width: 34, height: 24, viewBox: '0 0 34 24', 'aria-hidden': 'true' },
      h('path', { d: 'M3 19 L11 11 H23 L31 3', fill: 'none', stroke: 'var(--ligne-developpement)', strokeWidth: 4, strokeLinecap: 'round', strokeLinejoin: 'round' }),
      h('circle', { cx: 11, cy: 11, r: 4, fill: 'var(--surface)', stroke: 'var(--encre)', strokeWidth: 2.5 }),
      h('circle', { cx: 23, cy: 11, r: 4, fill: 'var(--surface)', stroke: 'var(--encre)', strokeWidth: 2.5 }));
  }
  var PAGES = [{ id: 'nuage', label: 'Nuage' }, { id: 'quiz', label: 'Quiz' }, { id: 'roadmap', label: 'Roadmap' }, { id: 'sources', label: 'Sources' }];
  function BarreNavigation(props) {
    var routes = props.routes || {};
    function route(id) { return routes[id] || '#' + id; }
    return h('header', { style: { position: 'relative' } },
      h('a', { href: '#contenu', className: 'cs-skip' }, 'Aller au contenu'),
      h('nav', { className: 'cs-nav', 'aria-label': 'Navigation principale' },
        h('a', { href: route('nuage'), className: 'cs-logo cs-link' }, h(Logo), 'constellation'),
        h('ul', null, PAGES.map(function (p) { return h('li', { key: p.id }, h('a', { href: route(p.id), 'aria-current': props.actif === p.id ? 'page' : undefined }, p.label)); })),
        props.fin ? h('div', { className: 'cs-nav-end' }, props.fin) : null));
  }

  var RANGS = ['1er choix', '2e choix', '3e choix'];
  function PastilleLigne(props) {
    var l = ligne(props.ligne);
    return h('span', { className: cx('cs-pastille', props.taille && 'cs-pastille-' + props.taille) },
      h('span', { className: 'cs-pastille-num', style: { background: 'var(--ligne-' + l.id + ')', color: 'var(--sur-ligne-' + l.id + ')' }, 'aria-hidden': props.sansNom ? undefined : 'true', 'aria-label': props.sansNom ? 'Ligne ' + l.numero + ', ' + l.nom : undefined, role: props.sansNom ? 'img' : undefined }, l.numero),
      props.sansNom ? null : h('span', null, h('span', { className: 'cs-sr' }, 'Ligne ' + l.numero + ', '), l.nom),
      props.rang ? h('span', { className: 'cs-pastille-rang', style: { background: 'var(--ligne-' + l.id + '-pastel)', color: 'var(--ligne-' + l.id + '-encre)' } }, RANGS[props.rang - 1]) : null);
  }

  function Station(props) {
    var l = ligne(props.ligne);
    var couleur = props.categorie ? 'var(--cat-' + props.categorie + ')' : 'var(--ligne-' + l.id + ')';
    var etat = props.etat || 'repos';
    var r = etat === 'survol' ? 11 : 9;
    var evolution = props.type === 'evolution';
    var opacite = etat === 'attenue' ? 0.45 : 1;
    var svg = h('svg', { width: 34, height: 34, viewBox: '0 0 34 34', 'aria-hidden': 'true', style: { opacity: opacite } },
      etat === 'survol' || etat === 'focus' ? h('circle', { cx: 17, cy: 17, r: r + 5, fill: 'none', stroke: etat === 'focus' ? 'var(--focus)' : couleur, strokeWidth: 2, strokeOpacity: etat === 'focus' ? 1 : 0.5 }) : null,
      h('circle', { cx: 17, cy: 17, r: r + 2, fill: 'var(--surface)' }),
      evolution
        ? [h('circle', { key: 'a', cx: 17, cy: 17, r: r, fill: 'var(--surface)', stroke: couleur, strokeWidth: 4 }), h('circle', { key: 'b', cx: 17, cy: 17, r: r - 5, fill: couleur })]
        : h('circle', { cx: 17, cy: 17, r: r, fill: couleur }));
    if (!props.titre) return svg;
    return h('span', { className: 'cs-station' }, svg, h('span', null, props.titre));
  }

  var FIAB = {
    bonne: { v: 'succes', i: 'check-cercle', t: 'Fiabilité bonne' },
    moyenne: { v: 'attention', i: 'moins-cercle', t: 'Fiabilité moyenne' },
    faible: { v: 'danger', i: 'alerte', t: 'Fiabilité faible' },
    nd: { v: 'neutre', i: 'aide', t: 'Fiabilité n.d.' }
  };
  function BadgeFiabilite(props) {
    var f = FIAB[props.niveau] || FIAB.nd;
    var badge = h(Badge, { variant: f.v, icone: f.i }, f.t);
    return props.note ? h(Tooltip, { content: props.note }, h('span', { tabIndex: 0, style: { borderRadius: 'var(--rayon-sm)' } }, badge)) : badge;
  }
  function BadgeType(props) {
    return props.type === 'evolution'
      ? h(Badge, { variant: 'outline' }, h('svg', { width: 14, height: 14, viewBox: '0 0 14 14', 'aria-hidden': 'true' }, h('circle', { cx: 7, cy: 7, r: 5, fill: 'none', stroke: 'currentColor', strokeWidth: 2.5 }), h('circle', { cx: 7, cy: 7, r: 1.6, fill: 'currentColor' })), 'Métier d’évolution')
      : h(Badge, { variant: 'outline' }, h('svg', { width: 14, height: 14, viewBox: '0 0 14 14', 'aria-hidden': 'true' }, h('circle', { cx: 7, cy: 7, r: 5.5, fill: 'currentColor' })), 'Métier d’entrée');
  }

  function keur(n) { return String(n).replace('.', ',') + ' k€'; }
  function fourchette(p) { return p ? p[0] + ' – ' + p[1] + ' k€' : null; }
  function PlageSalaire(props) {
    var mn = props.echelle[0], mx = props.echelle[1], span = mx - mn || 1;
    var g = ((props.min - mn) / span) * 100, w = ((props.max - props.min) / span) * 100;
    return h('div', { className: 'cs-plage', 'aria-hidden': 'true' }, h('div', { className: 'cs-plage-barre', style: { left: g + '%', width: Math.max(w, 2) + '%', background: props.couleur || 'var(--primaire)' } }));
  }

  var ZONES = [{ value: 'paris', label: 'Paris' }, { value: 'grandes_villes', label: 'Grandes villes' }, { value: 'regions', label: 'Régions (Dijon)' }];
  function libelleTranche(n) { return n.annees_max === null || n.annees_max === undefined ? n.annees_min + ' ans et plus' : n.annees_min + '–' + n.annees_max + ' ans'; }
  function listeFr(xs) { return xs.length < 2 ? xs.join('') : xs.slice(0, -1).join(', ') + ' ou ' + xs[xs.length - 1]; }

  function GrilleSilkhom(props) {
    var g = props.grille, zone = props.zone, couleur = props.couleur;
    var premier = g.niveaux[0];
    return h('table', { className: 'cs-tranches' },
      h('caption', { className: 'cs-sr' }, 'Profil Silkhom ' + g.ligne + ', zone ' + ZONES.filter(function (z) { return z.value === zone; })[0].label),
      h('thead', null, h('tr', null, h('th', { scope: 'col' }, 'Expérience'), h('th', { scope: 'col' }, 'Fourchette'), h('th', { scope: 'col' }, h('span', { className: 'cs-sr' }, 'Visualisation')))),
      h('tbody', null, g.niveaux.map(function (n, i) {
        var p = n[zone];
        var badge = i === 0 && zone === 'regions' && premier.annees_min === 0 && props.type === 'entree';
        return h('tr', { key: i },
          h('td', { className: 'cs-tranche' }, libelleTranche(n), badge ? h('div', null, h('span', { className: 'cs-premier-emploi' }, 'La plus proche d’un premier emploi')) : null),
          h('td', { className: 'cs-fourchette' }, p ? fourchette(p) : h('span', { className: 'cs-nd' }, 'n.d.')),
          h('td', { className: 'cs-barre' }, p ? h(PlageSalaire, { min: p[0], max: p[1], echelle: props.echelle, couleur: couleur }) : null));
      })));
  }

  function CartoucheSilkhom(props) {
    var s = props.silkhom;
    var zoneSt = useState(props.zoneParDefaut || 'regions'); var zone = zoneSt[0];
    if (!s) {
      return h('section', { className: 'cs-cartouche', 'aria-label': 'Salaire cible, Silkhom' },
        h('h3', { className: 'cs-cartouche-titre' }, 'Salaire cible ', h('span', null, '· Silkhom')),
        h('p', { className: 'cs-apec-mediane' }, h('span', { className: 'cs-nd', style: { fontSize: '28px' } }, 'n.d.')),
        props.raisonAbsence ? h('p', { className: 'cs-rapprochement' }, props.raisonAbsence) : null);
    }
    var tous = [];
    s.grilles.forEach(function (g) { g.niveaux.forEach(function (n) { ['paris', 'grandes_villes', 'regions'].forEach(function (z) { if (n[z]) tous.push(n[z][0], n[z][1]); }); }); });
    var echelle = [Math.floor(Math.min.apply(null, tous) / 5) * 5 - 5, Math.ceil(Math.max.apply(null, tous) / 5) * 5];
    var couleur = props.ligne ? 'var(--ligne-' + props.ligne + ')' : undefined;
    var premier = s.grilles[0].niveaux[0];
    var avertissement = premier.annees_min > 0
      ? h(Alert, { variant: 'attention', title: 'Pas de premier emploi direct : métier accessible après ' + premier.annees_min + ' ans d’expérience.' })
      : props.type === 'evolution'
        ? h(Alert, { variant: 'neutre', icone: 'info', title: 'Métier d’évolution : les années comptent l’expérience dans ce poste, après un premier métier' + (props.depuis && props.depuis.length ? ' (' + listeFr(props.depuis) + ')' : '') + '.' })
        : null;
    var contenu = function (g) { return h(GrilleSilkhom, { grille: g, zone: zone, echelle: echelle, couleur: couleur, type: props.type }); };
    return h('section', { className: 'cs-cartouche', 'aria-label': 'Salaire cible, Silkhom' },
      h('div', { className: 'cs-cartouche-head' },
        h('div', null, h('h3', { className: 'cs-cartouche-titre' }, 'Salaire cible ', h('span', null, '· Silkhom')),
          h('p', { className: 'cs-cartouche-sous' }, 'Brut annuel fixe, hors primes, par années d’expérience dans le poste.')),
        h(ToggleGroup, { label: 'Zone géographique', items: ZONES, value: zone, onValueChange: zoneSt[1] })),
      avertissement,
      s.grilles.length > 1
        ? h(Tabs, { label: 'Profil Silkhom', items: s.grilles.map(function (g) { return { value: g.ligne, label: g.ligne, content: contenu(g) }; }) })
        : contenu(s.grilles[0]),
      h('p', { className: 'cs-moyenne' }, 'Moyenne relevée par Silkhom : ', s.moyenne_keur === null || s.moyenne_keur === undefined ? h('span', { className: 'cs-nd' }, 'n.d.') : h('b', null, keur(s.moyenne_keur))),
      s.rapprochement ? h('p', { className: 'cs-rapprochement' }, h('strong', null, 'Données du profil Silkhom « ' + s.rapprochement.de + ' » : '), s.rapprochement.raison) : null,
      h('p', { className: 'cs-cartouche-source' }, 'Source : Silkhom, baromètre des salaires 2026.'));
  }

  function Reglette(props) {
    var a = props.apec, mn = Math.floor(a.d1 / 10) * 10 - 10, mx = Math.ceil(a.d9 / 10) * 10 + 10, span = mx - mn;
    function pos(v) { return ((v - mn) / span) * 100 + '%'; }
    return h('div', { className: 'cs-reglette', role: 'img', 'aria-label': '1er décile ' + a.d1 + ' k€, médiane ' + a.mediane + ' k€, 9e décile ' + a.d9 + ' k€' },
      h('div', { className: 'cs-reglette-piste' }),
      h('div', { className: 'cs-reglette-plage', style: { left: pos(a.d1), width: ((a.d9 - a.d1) / span) * 100 + '%' } }),
      h('div', { className: 'cs-reglette-mediane', style: { left: pos(a.mediane) } }),
      h('span', { className: 'cs-reglette-lbl', style: { left: pos(a.d1) } }, '1er décile ', h('b', null, a.d1)),
      h('span', { className: 'cs-reglette-lbl cs-reglette-lbl-haut', style: { left: pos(a.mediane) } }, 'médiane ', h('b', null, a.mediane)),
      h('span', { className: 'cs-reglette-lbl', style: { left: pos(a.d9) } }, '9e décile ', h('b', null, a.d9)));
  }

  function CartoucheApec(props) {
    var a = props.apec;
    var tete = h('div', null,
      h('h3', { className: 'cs-cartouche-titre' }, 'Salaire cible ', h('span', null, '· Apec')),
      h('p', { className: 'cs-cartouche-sous' }, 'Fixe + variable, cadres du secteur privé.'));
    var mention = h(Alert, { variant: 'info', title: 'Médiane des cadres, toutes expériences, pas un salaire d’embauche.' });
    if (!a) {
      return h('section', { className: 'cs-cartouche', 'aria-label': 'Salaire cible, Apec' }, tete,
        h('p', { className: 'cs-apec-mediane', style: { margin: 0 } }, h('span', { className: 'cs-nd', style: { fontSize: '28px', lineHeight: '34px' } }, 'n.d.'), h('span', { style: { color: 'var(--encre-douce)' } }, 'Pas de donnée Apec pour ce métier.')),
        props.raisonAbsence ? h('p', { className: 'cs-rapprochement' }, h('strong', null, 'Pourquoi : '), props.raisonAbsence) : null,
        h('p', { className: 'cs-cartouche-source' }, 'Source : Apec, rémunérations des cadres, édition 2025.'));
    }
    function v(x) { return x === null || x === undefined ? null : x + ' k€'; }
    return h('section', { className: 'cs-cartouche', 'aria-label': 'Salaire cible, Apec' }, tete, mention,
      h('div', { className: 'cs-apec-mediane' }, h('span', { className: 'cs-chiffre' }, keur(a.mediane)), h('span', null, 'médiane · famille « ' + a.famille + ' »')),
      h(Reglette, { apec: a }),
      h(Table, {
        rowHeaders: true,
        columns: [{ key: 'zone', label: 'Population' }, { key: 'med', label: 'Médiane', align: 'right', num: true }, { key: 'd1', label: '1er décile', align: 'right', num: true }, { key: 'd9', label: '9e décile', align: 'right', num: true }],
        rows: [
          { zone: 'Île-de-France', med: v(a.idf && a.idf.mediane), d1: v(a.idf && a.idf.d1), d9: v(a.idf && a.idf.d9) },
          { zone: 'Autres régions', med: v(a.autres_regions && a.autres_regions.mediane), d1: v(a.autres_regions && a.autres_regions.d1), d9: v(a.autres_regions && a.autres_regions.d9) },
          { zone: 'Moins de 35 ans', med: v(a.moins_35_ans && a.moins_35_ans.mediane), d1: v(a.moins_35_ans && a.moins_35_ans.d1), d9: v(a.moins_35_ans && a.moins_35_ans.d9) }
        ]
      }),
      a.rapprochement ? h('p', { className: 'cs-rapprochement' }, h('strong', null, 'Données de la famille Apec « ' + a.rapprochement.de + ' » : '), a.rapprochement.raison) : null,
      h('p', { className: 'cs-cartouche-source' }, 'Source : Apec, rémunérations des cadres, édition 2025.'));
  }

  function ItemRoadmap(props) {
    var projet = props.type === 'projet';
    return h('article', { className: 'cs-item', 'aria-label': (projet ? 'Projet à réaliser : ' : 'Notion à apprendre : ') + props.titre },
      h('span', { className: 'cs-item-grip', title: 'Glisser pour déplacer', 'aria-hidden': 'true' }, h(Icone, { nom: 'poignee' })),
      h('div', { className: 'cs-item-body' },
        h('span', null, h('span', { className: cx('cs-badge', projet ? 'cs-type-projet' : 'cs-type-notion') }, h(Icone, { nom: projet ? 'code' : 'livre', petit: true }), projet ? 'Projet à réaliser' : 'Notion à apprendre')),
        h('p', { className: 'cs-item-titre' }, props.titre),
        props.url ? h('a', { className: 'cs-item-url cs-link', href: props.url, target: '_blank', rel: 'noopener' }, props.url.replace(/^https?:\/\//, '')) : null,
        props.note ? h('p', { className: 'cs-item-note' }, props.note) : null),
      h('div', { className: 'cs-item-actions' },
        h('button', { type: 'button', className: 'cs-icon-btn', 'aria-label': 'Monter « ' + props.titre + ' »', disabled: props.premier, onClick: props.onMonter }, h(Icone, { nom: 'haut' })),
        h('button', { type: 'button', className: 'cs-icon-btn', 'aria-label': 'Descendre « ' + props.titre + ' »', disabled: props.dernier, onClick: props.onDescendre }, h(Icone, { nom: 'bas' })),
        h('button', { type: 'button', className: 'cs-icon-btn', 'aria-label': 'Modifier « ' + props.titre + ' »', onClick: props.onModifier }, h(Icone, { nom: 'crayon' })),
        h('button', { type: 'button', className: 'cs-icon-btn', 'aria-label': 'Supprimer « ' + props.titre + ' »', onClick: props.onSupprimer }, h(Icone, { nom: 'corbeille' }))));
  }

  var ns = window.Constellation || (window.Constellation = {});
  Object.assign(ns, {
    Button: Button, Badge: Badge, Card: Card, CardHeader: CardHeader, CardTitle: CardTitle, CardDescription: CardDescription, CardContent: CardContent, CardFooter: CardFooter,
    Tabs: Tabs, ToggleGroup: ToggleGroup, Input: Input, Textarea: Textarea, Select: Select, RadioGroup: RadioGroup, Alert: Alert, Tooltip: Tooltip, Dialog: Dialog,
    Table: Table, Progress: Progress, BarreNavigation: BarreNavigation, PastilleLigne: PastilleLigne, Station: Station, BadgeFiabilite: BadgeFiabilite, BadgeType: BadgeType,
    PlageSalaire: PlageSalaire, CartoucheSilkhom: CartoucheSilkhom, CartoucheApec: CartoucheApec, ItemRoadmap: ItemRoadmap, Icone: Icone, LIGNES: LIGNES
  });
})();
