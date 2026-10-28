// Competitor "orbit" on hover/focus. Shared by both map versions.
// Logos: official logo files may be mapped in GT_LOGOS (data.js), e.g. { "Gamma": "logos/gamma.png" }.
// Any competitor without a mapped file shows a neutral monogram token, not a recreated logo.
(function () {
  const css = `
  .gt-orbit{position:fixed;left:0;top:0;width:0;height:0;pointer-events:none;z-index:40}
  .gt-orbit .ring-line{left:0;top:0;position:absolute;border-radius:50%;border:1px dashed rgba(160,190,255,.28);transform:translate(-50%,-50%) scale(.4);opacity:0;transition:transform .45s cubic-bezier(.2,.8,.2,1),opacity .3s}
  .gt-orbit .gt-orb-spin{position:absolute;left:0;top:0;width:0;height:0;transform-origin:0 0;animation:gtOrb 18s linear infinite}
  .gt-orbit .arm{position:absolute;left:0;top:0}
  .gt-orbit .pos{position:absolute;left:0;top:0;transform:translateX(0);transition:transform .5s cubic-bezier(.2,.8,.2,1)}
  .gt-orbit .tok{position:absolute;transform:translate(-50%,-50%)}
  .gt-orbit .gt-orb-tokin{transform-origin:50% 50%;animation:gtOrb 18s linear infinite reverse}
  .gt-orbit .face{display:grid;place-items:center;border-radius:50%;font:600 11px/1 "Geist",sans-serif;letter-spacing:-.02em;color:#0A0F22;
    background:var(--c);box-shadow:0 0 0 1.5px rgba(8,12,28,.9),0 0 0 2.5px rgba(200,220,255,.25),0 6px 16px rgba(0,0,0,.5),0 0 18px -4px var(--c);
    transform:scale(.2);opacity:0;transition:transform .45s cubic-bezier(.3,1.5,.5,1),opacity .25s;overflow:hidden}
  .gt-orbit .face img{width:72%;height:72%;object-fit:contain}
  .gt-orbit .face.img{background:#F4F6FB}
  .gt-orbit .name{position:absolute;left:50%;top:100%;margin-top:4px;transform:translateX(-50%);white-space:nowrap;font:500 10px/1 "Geist Mono",monospace;
    color:#C9D3EA;background:rgba(6,9,22,.85);padding:3px 5px;border-radius:5px;opacity:0;transition:opacity .3s .15s}
  .gt-orbit.on .ring-line{transform:translate(-50%,-50%) scale(1);opacity:1}
  .gt-orbit.on .face{transform:scale(1);opacity:1}
  .gt-orbit.on .name{opacity:1}
  .gt-orbit.still .gt-orb-spin,.gt-orbit.still .gt-orb-tokin{animation-play-state:paused}
  @keyframes gtOrb{to{transform:rotate(360deg)}}
  @media (prefers-reduced-motion:reduce){.gt-orbit .gt-orb-spin,.gt-orbit .gt-orb-tokin{animation:none}.gt-orbit .pos,.gt-orbit .face{transition:none}}`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  const hue = (s) => { let h = 0; for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) % 360; return h; };
  const mono = (s) => {
    const w = s.replace(/[^A-Za-z0-9 ]/g, ' ').split(/\s+/).filter(Boolean);
    if (w.length > 1) return (w[0][0] + w[1][0]).toUpperCase();
    return w[0].length <= 3 ? w[0] : w[0][0].toUpperCase() + w[0][1].toLowerCase();
  };

  let el = null, hideT = null, curOpts = {};
  function show(anchor, cat, opts) {
    clearTimeout(hideT); if (el) { el.remove(); curOpts.onHide && curOpts.onHide(); }
    curOpts = opts || {};
    const r = anchor.getBoundingClientRect();
    const k = r.width / (opts.baseTile || 60);
    const n = cat.competitors.length;
    const tok = Math.max(24, Math.round(30 * Math.min(1.15, Math.max(.8, k))));
    const R = r.width / 2 + tok * 0.5 + 24 + (n > 4 ? 6 : 0);
    el = document.createElement('div');
    el.className = 'gt-orbit' + (opts.isPaused && opts.isPaused() ? ' still' : '');
    el.style.left = (r.left + r.width / 2) + 'px'; el.style.top = (r.top + r.height / 2) + 'px';
    el.setAttribute('aria-hidden', 'true');
    const logos = window.GT_LOGOS || {};
    let html = `<div class="ring-line" style="width:${R * 2}px;height:${R * 2}px"></div><div class="gt-orb-spin">`;
    cat.competitors.forEach((c, i) => {
      const a = -90 + (360 / n) * i;
      const src = logos[c];
      html += `<div class="arm" style="transform:rotate(${a}deg)"><div class="pos" data-r="${R}"><div class="tok" style="transform:translate(-50%,-50%) rotate(${-a}deg)"><div class="gt-orb-tokin">
        <div class="face${src ? ' img' : ''}" title="${c}" style="--c:oklch(0.86 0.09 ${hue(c)});width:${tok}px;height:${tok}px;font-size:${Math.round(tok * .37)}px;transition-delay:${i * 40}ms">${src ? `<img src="${src}" alt="">` : mono(c)}</div>
        ${opts.names ? `<span class="name">${c}</span>` : ''}</div></div></div></div>`;
    });
    el.innerHTML = html + '</div>';
    document.body.appendChild(el);
    opts.onShow && opts.onShow();
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (!el) return; el.classList.add('on');
      el.querySelectorAll('.pos').forEach((p) => (p.style.transform = `translateX(${p.dataset.r}px)`));
    }));
  }
  function hide() {
    if (!el) return; const e = el; el = null;
    e.classList.remove('on'); e.querySelectorAll('.pos').forEach((p) => (p.style.transform = 'translateX(0)'));
    curOpts.onHide && curOpts.onHide();
    hideT = setTimeout(() => e.remove(), 380);
  }
  window.addEventListener('scroll', hide, { passive: true });
  window.addEventListener('wheel', hide, { passive: true });

  // attach(anchorEl, triggerEl, cat, opts) — opts: { baseTile, names, isPaused, onShow, onHide }
  window.GT_ORBIT = {
    attach(anchor, trigger, cat, opts = {}) {
      trigger.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') show(anchor, cat, opts); });
      trigger.addEventListener('pointerleave', hide);
      trigger.addEventListener('focus', () => show(anchor, cat, opts));
      trigger.addEventListener('blur', hide);
    },
    hide
  };
})();
