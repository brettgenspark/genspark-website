(function () {
  const D = window.GT_DATA, ICON = window.GT_ICON;
  const $ = (s) => document.querySelector(s);
  const NS = 'http://www.w3.org/2000/svg';
  const mk = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  $('#title').textContent = D.title;
  $('#subtitle').textContent = D.subtitle;
  $('.core-label').textContent = D.center.label;

  const vp = $('#viewport'), world = $('#world'), svg = $('#links'), nodesEl = $('#nodes'), core = $('#core'), tip = $('#tooltip');
  const G = { orbit: $('#orbitG'), cross: $('#crossG'), spoke: $('#spokeG'), pulse: $('#pulseG'), nucleus: $('#nucleusG') };

  let L = null;               // layout
  let nodes = [];             // {cat, el, x, y, spoke, glow, pts, len}
  let crosses = [];           // {a,b,el,pts,len}
  let selected = null;        // category id | 'core' | null
  let hoverId = null;

  /* ---------- layout ---------- */
  function computeLayout() {
    const portrait = window.innerWidth < 760 && window.innerHeight > window.innerWidth;
    return portrait
      ? { mode: 'portrait', W: 900, H: 1260, cx: 450, cy: 610, rx: 345, ry: 505, nucleusR: 72, haloR: 112 }
      : { mode: 'land', W: 1420, H: 870, cx: 710, cy: 432, rx: 565, ry: 352, nucleusR: 80, haloR: 124 };
  }

  function samplePath(path) {
    const len = path.getTotalLength(), pts = [];
    for (let s = 0; s <= len; s += 2) { const p = path.getPointAtLength(s); pts.push([p.x, p.y]); }
    return { len, pts };
  }
  const at = (o, s) => o.pts[Math.max(0, Math.min(o.pts.length - 1, Math.round(s / 2)))];

  function build() {
    L = computeLayout();
    const { W, H, cx, cy, rx, ry } = L;
    world.style.width = W + 'px'; world.style.height = H + 'px';
    svg.setAttribute('width', W); svg.setAttribute('height', H); svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    Object.values(G).forEach((g) => (g.innerHTML = ''));
    svg.querySelectorAll('defs .sg').forEach((e) => e.remove());
    nodesEl.innerHTML = '';
    nodes = []; crosses = [];
    const defs = svg.querySelector('defs');

    // orbits
    mk('ellipse', { cx, cy, rx, ry, class: 'orbit' }, G.orbit);
    mk('ellipse', { cx, cy, rx: rx * 0.62, ry: ry * 0.62, class: 'orbit dash' }, G.orbit);

    // nodes
    D.categories.forEach((cat, i) => {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / 12;
      const x = cx + rx * Math.cos(a), y = cy + ry * Math.sin(a);
      const el = document.createElement('button');
      el.className = 'node' + (cat.candidate ? ' cand' : '');
      el.style.left = x + 'px'; el.style.top = (y - 34) + 'px';
      el.dataset.id = cat.id;
      el.setAttribute('aria-label', `${cat.id}. ${cat.name}${cat.candidate ? '. ' + cat.statusLabel : ''}. Open details`);
      el.innerHTML = `<span class="tile">${ICON(cat.icon)}<span class="num">${String(cat.id).padStart(2, '0')}</span><span class="flash"></span></span><span class="lbl">${cat.short}</span>`;
      nodesEl.appendChild(el);

      // spoke: from nucleus rim to tile edge, gentle consistent curl
      const ang = Math.atan2(y - cy, x - cx);
      const sx = cx + Math.cos(ang) * (L.nucleusR + 6), sy = cy + Math.sin(ang) * (L.nucleusR + 6);
      const ex = x - Math.cos(ang) * 44, ey = y - Math.sin(ang) * 44;
      const mx = (sx + ex) / 2, my = (sy + ey) / 2, dx = ex - sx, dy = ey - sy, dl = Math.hypot(dx, dy);
      const k = 0.13 * dl, qx = mx - (dy / dl) * k, qy = my + (dx / dl) * k;
      const d = `M${sx},${sy} Q${qx},${qy} ${ex},${ey}`;
      const nodeCol = i % 2 ? '#A08CFF' : '#7FE3FF';
      const g = mk('linearGradient', { id: 'sg' + cat.id, class: 'sg', gradientUnits: 'userSpaceOnUse', x1: ex, y1: ey, x2: sx, y2: sy }, defs);
      mk('stop', { offset: '0', 'stop-color': nodeCol, 'stop-opacity': '.95' }, g);
      mk('stop', { offset: '.6', 'stop-color': '#8C8CFF', 'stop-opacity': '.55' }, g);
      mk('stop', { offset: '1', 'stop-color': '#FFB49E', 'stop-opacity': '.85' }, g);
      const glow = mk('path', { d, class: 'spoke-glow' }, G.spoke);
      const spoke = mk('path', { d, class: 'spoke' + (cat.direct ? ' direct' : ''), stroke: `url(#sg${cat.id})` }, G.spoke);
      spoke.style.stroke = `url(#sg${cat.id})`;
      if (cat.direct) spoke.style.strokeWidth = '1.6';
      const s = samplePath(spoke);
      nodes.push({ cat, el, x, y, spoke, glow, col: nodeCol, ...s });
    });

    // cross links (faint workflow relationships)
    D.crossLinks.forEach(([ia, ib]) => {
      const A = nodes[ia - 1], B = nodes[ib - 1];
      const span = Math.min(Math.abs(ia - ib), 12 - Math.abs(ia - ib));
      const mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2;
      const vx = mx - cx, vy = my - cy, vl = Math.hypot(vx, vy);
      const dist = Math.hypot(B.x - A.x, B.y - A.y);
      const push = span === 1 ? 0.22 * dist : -0.3 * dist;
      const qx = mx + (vx / vl) * push, qy = my + (vy / vl) * push;
      const trim = (P, Q) => { const t = Math.atan2(Q[1] - P.y, Q[0] - P.x); return [P.x + Math.cos(t) * 46, P.y + Math.sin(t) * 46]; };
      const s0 = trim(A, [qx, qy]), s1 = trim(B, [qx, qy]);
      const el = mk('path', { d: `M${s0[0]},${s0[1]} Q${qx},${qy} ${s1[0]},${s1[1]}`, class: 'cross' }, G.cross);
      crosses.push({ a: ia, b: ib, el, ...samplePath(el) });
    });

    buildNucleus();
    bindNodes();
    syncSelectionClasses();
  }

  function buildNucleus() {
    const { cx, cy, nucleusR: r, haloR } = L, g = G.nucleus;
    const aura = mk('circle', { cx, cy, r: r * 2.7, fill: 'url(#auraGrad)', class: 'breath' }, g);
    mk('circle', { cx, cy, r: haloR + 26, fill: 'url(#haloGrad)' }, g);
    // SecondBrain halo
    const spin = mk('g', { class: 'halo-spin' }, g); spin.style.transformOrigin = `${cx}px ${cy}px`;
    mk('circle', { cx, cy, r: haloR + 12, class: 'halo-ring' }, spin);
    const tr = haloR;
    $('#haloPath').setAttribute('d', `M${cx - tr},${cy} a${tr},${tr} 0 1,1 ${tr * 2},0 a${tr},${tr} 0 1,1 ${-tr * 2},0`);
    const text = mk('text', { class: 'halo-text' }, spin);
    const tp = mk('textPath', { href: '#haloPath', startOffset: '0' }, text);
    const parts = D.center.halo.split('·');
    const sb = mk('tspan', { class: 'sb' }, tp); sb.textContent = parts[0].trim();
    const rest = mk('tspan', {}, tp); rest.textContent = '  ·  ' + (parts[1] || '').trim();
    const spin2 = mk('g', { class: 'halo-spin rev' }, g); spin2.style.transformOrigin = `${cx}px ${cy}px`;
    const dash = mk('circle', { cx, cy, r: haloR - 16, fill: 'none', stroke: 'rgba(255,190,170,.22)', 'stroke-width': 1, 'stroke-dasharray': '1 9', 'stroke-linecap': 'round' }, spin2);
    // nucleus body
    mk('circle', { cx, cy, r: r + 10, fill: 'none', stroke: 'rgba(255,200,180,.28)', 'stroke-width': 1 }, g);
    mk('circle', { cx, cy, r: r + 4, fill: '#FF8E72', opacity: .35, filter: 'url(#softGlow)' }, g);
    mk('circle', { cx, cy, r, fill: 'url(#nucleusGrad)' }, g);
    mk('ellipse', { cx, cy: cy - r * 0.42, rx: r * 0.55, ry: r * 0.22, fill: '#fff', opacity: .35 }, g);
    L.flash = mk('circle', { cx, cy, r: r + 16, fill: 'none', stroke: '#FFE6DA', 'stroke-width': 2, opacity: 0, class: 'nucleus-flash', filter: 'url(#glow)' }, g);
    core.style.left = cx + 'px'; core.style.top = cy + 'px';
    const cs = r * 2.1; core.style.width = core.style.height = cs + 'px'; core.style.margin = `${-cs / 2}px 0 0 ${-cs / 2}px`;
  }

  /* ---------- view transform (fit / zoom / pan) ---------- */
  const view = { s: 1, tx: 0, ty: 0 };
  let userMoved = false;
  function apply(ease) {
    world.classList.toggle('ease', !!ease && !reduce.matches);
    world.style.transform = `translate(${view.tx}px,${view.ty}px) scale(${view.s})`;
  }
  function panelInset() {
    return $('#panel').classList.contains('open') && window.innerWidth >= 760 ? Math.min(430, window.innerWidth - 32) + 24 : 0;
  }
  function fit(ease) {
    const r = vp.getBoundingClientRect();
    const availW = r.width - panelInset(), availH = r.height;
    let s = Math.min(availW / L.W, availH / L.H) * 0.98;
    if (L.mode === 'portrait') s = Math.max(s, Math.min(availW / L.W, 0.6));
    view.s = s; view.tx = (availW - L.W * s) / 2; view.ty = (availH - L.H * s) / 2;
    userMoved = false; apply(ease);
  }
  function zoomAt(f, px, py, ease) {
    const ns = Math.max(0.25, Math.min(2.6, view.s * f)); f = ns / view.s;
    view.tx = px - (px - view.tx) * f; view.ty = py - (py - view.ty) * f; view.s = ns; userMoved = true; apply(ease);
  }
  const vpCenter = () => { const r = vp.getBoundingClientRect(); return [(r.width - panelInset()) / 2, r.height / 2]; };
  $('#btnIn').onclick = () => zoomAt(1.25, ...vpCenter(), true);
  $('#btnOut').onclick = () => zoomAt(0.8, ...vpCenter(), true);
  $('#btnFit').onclick = () => fit(true);
  vp.addEventListener('wheel', (e) => {
    e.preventDefault(); const r = vp.getBoundingClientRect();
    zoomAt(Math.exp(-e.deltaY * 0.0015), e.clientX - r.left, e.clientY - r.top, false);
  }, { passive: false });

  const ptrs = new Map(); let drag = null, moved = false;
  vp.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    ptrs.set(e.pointerId, [e.clientX, e.clientY]);
    moved = false;
    drag = { x: e.clientX, y: e.clientY, tx: view.tx, ty: view.ty, dist: null };
    if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; drag.dist = Math.hypot(a[0] - b[0], a[1] - b[1]); drag.s = view.s; }
  });
  window.addEventListener('pointermove', (e) => {
    if (!drag || !ptrs.has(e.pointerId)) return;
    ptrs.set(e.pointerId, [e.clientX, e.clientY]);
    if (ptrs.size === 2 && drag.dist) {
      const [a, b] = [...ptrs.values()], r = vp.getBoundingClientRect();
      const d = Math.hypot(a[0] - b[0], a[1] - b[1]);
      zoomAt((drag.s * d / drag.dist) / view.s, (a[0] + b[0]) / 2 - r.left, (a[1] + b[1]) / 2 - r.top, false);
      moved = true; return;
    }
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!moved && Math.hypot(dx, dy) < 5) return;
    if (!moved) { moved = true; vp.classList.add('dragging'); try { vp.setPointerCapture(e.pointerId); } catch (_) {} hideTip(); GT_ORBIT.hide(); }
    view.tx = drag.tx + dx; view.ty = drag.ty + dy; userMoved = true; apply(false);
  });
  const endPtr = (e) => {
    ptrs.delete(e.pointerId);
    if (ptrs.size === 0) { drag = null; vp.classList.remove('dragging'); }
    else if (drag) { const [p] = [...ptrs.values()]; drag = { x: p[0], y: p[1], tx: view.tx, ty: view.ty, dist: null }; }
  };
  window.addEventListener('pointerup', endPtr); window.addEventListener('pointercancel', endPtr);
  vp.addEventListener('click', (e) => { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; } }, true);
  vp.addEventListener('click', (e) => { if (!e.target.closest('.node,.core') && selected) closePanel(); });

  /* ---------- hover / tooltip ---------- */
  function highlight(id) {
    hoverId = id; syncSelectionClasses();
  }
  function syncSelectionClasses() {
    const active = new Set();
    if (selected && selected !== 'core') active.add(+selected);
    if (hoverId) active.add(+hoverId);
    const coreActive = selected === 'core';
    nodes.forEach((n) => {
      const on = coreActive || active.has(n.cat.id);
      n.spoke.classList.toggle('hot', on); n.glow.classList.toggle('hot', on && !coreActive);
      n.el.classList.toggle('sel', selected === n.cat.id);
      n.el.classList.toggle('hover', hoverId === n.cat.id);
    });
    crosses.forEach((c) => c.el.classList.toggle('hot', coreActive || active.has(c.a) || active.has(c.b)));
    svg.classList.toggle('dim', active.size > 0 || coreActive);
    nodesEl.classList.toggle('graph-dim', active.size > 0);
    core.classList.toggle('sel', coreActive);
  }
  function showTip(n) {
    const r = n.el.querySelector('.tile').getBoundingClientRect(), vr = vp.getBoundingClientRect();
    tip.innerHTML = `<b>${n.cat.name}</b>${n.cat.job}<span class="hint">${matchMedia('(hover:hover)').matches ? 'Click' : 'Tap'} for details</span>`;
    tip.classList.add('on'); tip.setAttribute('aria-hidden', 'false');
    const tw = tip.offsetWidth, th = tip.offsetHeight;
    let x = r.left - vr.left + r.width / 2 - tw / 2, y = r.top - vr.top - th - 72;
    if (y < 6) y = r.bottom - vr.top + 90;
    x = Math.max(8, Math.min(vr.width - tw - 8, x));
    tip.style.left = x + 'px'; tip.style.top = y + 'px';
  }
  function hideTip() { tip.classList.remove('on'); tip.setAttribute('aria-hidden', 'true'); }

  function bindNodes() {
    nodes.forEach((n) => {
      const enter = () => { if (drag && moved) return; highlight(n.cat.id); showTip(n); };
      const leave = () => { highlight(null); hideTip(); };
      n.el.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') enter(); });
      n.el.addEventListener('pointerleave', leave);
      n.el.addEventListener('focus', enter); n.el.addEventListener('blur', leave);
      n.el.addEventListener('click', () => { hideTip(); openCat(n.cat.id, n.el); });
      GT_ORBIT.attach(n.el.querySelector('.tile'), n.el, n.cat, { baseTile: 68, isPaused: () => !playing,
        onShow: () => n.el.classList.add('orbiting'), onHide: () => n.el.classList.remove('orbiting') });
    });
  }
  core.addEventListener('pointerenter', () => { core.dataset.h = 1; });
  core.addEventListener('click', () => openCore(core));

  /* ---------- panels ---------- */
  const panel = $('#panel'), pBody = $('#panelBody');
  let returnFocus = null;
  const chips = (arr) => `<div class="chips">${arr.map((c) => `<span class="chip">${c}</span>`).join('')}</div>`;

  function openCat(id, from) {
    const c = D.categories.find((x) => x.id === +id); if (!c) return;
    selected = c.id; returnFocus = from || returnFocus;
    const prev = D.categories[(c.id + 10) % 12], next = D.categories[c.id % 12];
    pBody.innerHTML = `
      <div class="p-idx">Use case ${String(c.id).padStart(2, '0')} / 12</div>
      <div class="p-head"><div class="p-tile">${ICON(c.icon)}</div><h2 class="p-title" id="pTitle">${c.name}</h2></div>
      ${c.candidate || c.direct ? `<div class="badges">${c.candidate ? `<span class="badge cand">${c.statusLabel}</span>` : ''}${c.direct ? '<span class="badge direct">Work with an AI teammate</span>' : ''}</div>` : ''}
      ${c.candidate ? `<p class="note" style="margin-top:-4px">${c.statusNote}</p>` : ''}
      <p class="p-desc">${c.desc}</p>
      <div class="p-job"><span>What you want to do</span>“${c.job}”</div>
      <div class="sec"><div class="sec-k">Other tools in this category</div>${chips(c.competitors)}</div>
      ${c.distinction ? `<p class="note">${c.distinction}</p>` : ''}
      <div class="example"><span class="ex-k">Example · continue in GenTeam</span><p>${c.example}</p>
        <div class="flow"><i>${c.short}</i><b>→</b><i class="gt">GenTeam</i><b>→</b><i>People + agents</i></div></div>
      <div class="p-nav"><button data-go="${prev.id}">← ${prev.short}</button><button data-go="${next.id}">${next.short} →</button></div>`;
    pBody.querySelectorAll('[data-go]').forEach((b) => (b.onclick = () => openCat(b.dataset.go, nodes[b.dataset.go - 1].el)));
    showPanel();
  }

  function openCore(from) {
    selected = 'core'; returnFocus = from || core;
    const S = D.journey;
    pBody.innerHTML = `
      <div class="p-idx">Your shared workspace</div>
      <div class="p-head"><div class="p-tile" style="background:radial-gradient(circle at 50% 40%,#FFF4EC,#FF9C80 70%,#E25C4A);box-shadow:0 0 30px -4px rgba(255,142,114,.6)"></div><h2 class="p-title" id="pTitle">GenTeam<span style="display:block;font-size:13px;font-weight:400;color:var(--ink2);letter-spacing:0;margin-top:4px">${D.center.label}</span></h2></div>
      <p class="p-desc">${S.intro}</p>
      <ol class="steps">${S.steps.map((s, i) => `<li><span class="n">${i + 1}</span><div><b>${s.k}</b><span>${s.t}</span></div></li>`).join('')}</ol>
      <div class="sec"><div class="sec-k">Pick up where you left off</div>
        <div class="layer">${S.context}</div>
      </div>
      <div class="sec"><div class="sec-k">Make it work for you</div><ul class="notes">${S.notes.map((n) => `<li>${n}</li>`).join('')}</ul></div>`;
    showPanel();
  }

  function showPanel() {
    syncSelectionClasses();
    const wasOpen = panel.classList.contains('open');
    panel.classList.add('open'); panel.setAttribute('aria-hidden', 'false'); panel.scrollTop = 0;
    if (!wasOpen && !userMoved) fit(true);
    panel.focus({ preventScroll: true });
  }
  function closePanel() {
    if (!panel.classList.contains('open')) return;
    selected = null; syncSelectionClasses();
    panel.classList.remove('open'); panel.setAttribute('aria-hidden', 'true');
    if (!userMoved) fit(true);
    if (returnFocus) returnFocus.focus({ preventScroll: true });
  }
  $('#panelClose').onclick = closePanel;

  // Related tools and use-case list sheets
  $('#ctxBody').innerHTML = D.context.map((g) => `<div class="ctx-grp"><h3>${g.k}</h3>${chips(g.items)}</div>`).join('');
  $('#listBody').innerHTML = D.categories.map((c) => `<li><button data-id="${c.id}"><span class="n">${String(c.id).padStart(2, '0')}</span><span class="mini">${ICON(c.icon)}</span><span>${c.name}${c.candidate ? ` <span class="badge cand" style="font-size:9px;padding:3px 6px;margin-left:4px">${c.statusLabel}</span>` : ''}</span></button></li>`).join('');
  $('#listBody').querySelectorAll('button').forEach((b) => (b.onclick = () => { toggleSheet('listSheet', 'btnList', false); openCat(b.dataset.id, nodes[b.dataset.id - 1].el); }));
  function toggleSheet(id, btnId, force) {
    const el = $('#' + id), btn = $('#' + btnId);
    const open = force === undefined ? !el.classList.contains('open') : force;
    el.classList.toggle('open', open); el.setAttribute('aria-hidden', String(!open)); btn.setAttribute('aria-expanded', String(open));
    if (open) { const other = id === 'ctxPanel' ? ['listSheet', 'btnList'] : ['ctxPanel', 'btnCtx']; toggleSheet(other[0], other[1], false); }
  }
  $('#btnCtx').onclick = () => toggleSheet('ctxPanel', 'btnCtx');
  $('#btnList').onclick = () => toggleSheet('listSheet', 'btnList');
  $('#ctxClose').onclick = () => toggleSheet('ctxPanel', 'btnCtx', false);
  $('#listClose').onclick = () => toggleSheet('listSheet', 'btnList', false);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if ($('#ctxPanel').classList.contains('open') || $('#listSheet').classList.contains('open')) { toggleSheet('ctxPanel', 'btnCtx', false); toggleSheet('listSheet', 'btnList', false); return; }
      closePanel(); hideTip();
    }
    if (panel.classList.contains('open') && typeof selected === 'number' && (e.key === 'ArrowRight' || e.key === 'ArrowLeft') && panel.contains(document.activeElement)) {
      const id = e.key === 'ArrowRight' ? (selected % 12) + 1 : ((selected + 10) % 12) + 1;
      openCat(id, nodes[id - 1].el);
    }
  });

  /* ---------- electric pulses ---------- */
  let playing = !reduce.matches, pulses = [], lastSpawn = 0, lastT = 0, pid = 0;
  const btnPlay = $('#btnPlay');
  function setPlaying(p) {
    playing = p;
    document.body.classList.toggle('paused', !p);
    btnPlay.classList.toggle('is-paused', !p);
    btnPlay.setAttribute('aria-label', p ? 'Pause animation' : 'Play animation');
    G.pulse.style.opacity = p ? 1 : 0.0;
    if (p) { lastT = performance.now(); requestAnimationFrame(tick); }
  }
  btnPlay.onclick = () => setPlaying(!playing);
  reduce.addEventListener && reduce.addEventListener('change', () => setPlaying(!reduce.matches));

  function spawn(now) {
    const defs = svg.querySelector('defs');
    let track, inward = Math.random() < 0.62, color, kind;
    const focusId = typeof selected === 'number' ? selected : hoverId;
    if (Math.random() < 0.2 && crosses.length) {
      track = crosses[(Math.random() * crosses.length) | 0]; kind = 'cross'; color = '#B6A6FF'; inward = Math.random() < 0.5;
    } else {
      const n = focusId && Math.random() < 0.55 ? nodes[focusId - 1] : nodes[(Math.random() * 12) | 0];
      track = n; kind = 'spoke'; color = inward ? n.col : '#FFD2C2';
    }
    const id = 'pg' + (pid++);
    const grad = mk('linearGradient', { id, gradientUnits: 'userSpaceOnUse', class: 'sg' }, defs);
    mk('stop', { offset: '0', 'stop-color': color, 'stop-opacity': '0' }, grad);
    mk('stop', { offset: '1', 'stop-color': color, 'stop-opacity': kind === 'cross' ? '.7' : '.95' }, grad);
    const tail = mk('path', { class: 'pulse-tail', stroke: `url(#${id})`, 'stroke-width': kind === 'cross' ? 1.2 : 1.8 }, G.pulse);
    const head = mk('circle', { r: kind === 'cross' ? 1.8 : 2.4, fill: '#F4FDFF', class: 'pulse-head' }, G.pulse);
    pulses.push({ track, kind, inward, s: 0, speed: (kind === 'cross' ? 110 : 190) + Math.random() * 90, tl: kind === 'cross' ? 36 : 60, tail, head, grad });
  }
  function pos(p, s) { return at(p.track, p.inward ? p.track.len - s : s); }

  function flashNode(n) { const f = n.el.querySelector('.flash'); f.classList.add('on'); setTimeout(() => f.classList.remove('on'), 140); }
  function flashCore() { L.flash.setAttribute('opacity', '.55'); clearTimeout(L.ft); L.ft = setTimeout(() => L.flash.setAttribute('opacity', '0'), 120); }

  function tick(now) {
    if (!playing) return;
    const dt = Math.min(0.05, (now - lastT) / 1000); lastT = now;
    if (now - lastSpawn > 520 && pulses.length < 9) { spawn(now); lastSpawn = now - Math.random() * 200; }
    pulses = pulses.filter((p) => {
      p.s += p.speed * dt;
      const len = p.track.len;
      if (p.s - p.tl > len) { p.tail.remove(); p.head.remove(); p.grad.remove(); return false; }
      if (!p.arrived && p.s >= len) {
        p.arrived = true;
        if (p.kind === 'spoke') { p.inward ? flashCore() : flashNode(p.track); }
        else flashNode(nodes[(p.inward ? p.track.a : p.track.b) - 1]);
      }
      const h = Math.min(p.s, len), t0 = Math.max(0, p.s - p.tl);
      const pts = []; for (let s = t0; s <= h; s += 4) pts.push(pos(p, s)); pts.push(pos(p, h));
      p.tail.setAttribute('d', 'M' + pts.map((q) => q.join(',')).join(' L'));
      const a = pts[0], b = pts[pts.length - 1];
      p.grad.setAttribute('x1', a[0]); p.grad.setAttribute('y1', a[1]); p.grad.setAttribute('x2', b[0]); p.grad.setAttribute('y2', b[1]);
      p.head.setAttribute('cx', b[0]); p.head.setAttribute('cy', b[1]);
      p.head.setAttribute('opacity', p.s > len ? Math.max(0, 1 - (p.s - len) / p.tl) : 1);
      return true;
    });
    requestAnimationFrame(tick);
  }

  /* ---------- stars ---------- */
  function stars() {
    const c = $('#stars'), dpr = Math.min(2, devicePixelRatio || 1), w = innerWidth, h = innerHeight;
    c.width = w * dpr; c.height = h * dpr; const x = c.getContext('2d'); x.scale(dpr, dpr);
    let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const n = Math.round((w * h) / 5200);
    for (let i = 0; i < n; i++) {
      const r = rnd() < 0.92 ? rnd() * 0.8 + 0.2 : rnd() * 1.2 + 0.8;
      x.globalAlpha = 0.15 + rnd() * 0.5;
      x.fillStyle = rnd() < 0.2 ? '#B9AEFF' : rnd() < 0.3 ? '#A6EEFF' : '#DDE6FF';
      x.beginPath(); x.arc(rnd() * w, rnd() * h, r, 0, 7); x.fill();
    }
  }

  /* ---------- init ---------- */
  build(); fit(false); stars(); setPlaying(playing);
  let rt; window.addEventListener('resize', () => {
    clearTimeout(rt); rt = setTimeout(() => {
      const mode = computeLayout().mode;
      if (mode !== L.mode) { pulses.forEach((p) => { p.tail.remove(); p.head.remove(); }); pulses = []; build(); }
      fit(false); stars();
    }, 120);
  });
})();
