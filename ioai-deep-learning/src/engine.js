/* Deck engine.
   A fixed 1920x1080 stage scaled to the window. Slides are registered from
   section files with Deck.section() and Deck.slide(); see CONTRACT.md.        */
(function () {
  'use strict';
  const W = 1920, H = 1080;
  const D = (window.Deck = { W, H, sections: [], slides: [], cur: -1, step: 0 });
  let curSection = null;

  /* ---------- registration ---------- */
  D.section = function (def) {
    curSection = Object.assign({ slides: [], minutes: 0 }, def);
    D.sections.push(curSection);
    return curSection;
  };
  // section-specific CSS: Deck.css(`.sec-act .zoo { … }`) — injected once at start
  D._css = [];
  D.css = function (str) { D._css.push(str); };
  D.slide = function (def) {
    if (!curSection) D.section({ id: 'main', title: '' });
    def.section = curSection;
    curSection.slides.push(def);
    D.slides.push(def);
    return def;
  };

  /* ---------- per-slide api handed to init() ---------- */
  function makeApi(s) {
    const api = {
      el: s.el,
      active: false,
      step: 0,
      _loops: [], _theme: [], _step: [], _enter: [], _leave: [],
      loop(fn) { api._loops.push({ fn, raf: 0, last: 0 }); if (api.active) startLoops(api); return api; },
      onTheme(fn) { api._theme.push(fn); return api; },
      onStep(fn) { api._step.push(fn); return api; },
      onEnter(fn) { api._enter.push(fn); return api; },
      onLeave(fn) { api._leave.push(fn); return api; },
      $(sel) { return s.el.querySelector(sel); },
      $$(sel) { return Array.from(s.el.querySelectorAll(sel)); },
    };
    return api;
  }
  const reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function startLoops(api) {
    api._loops.forEach(L => {
      if (L.raf) return;
      L.last = performance.now();
      const tick = now => {
        const dt = Math.min(0.05, (now - L.last) / 1000);
        L.last = now;
        let keep;
        try { keep = L.fn(dt, now); } catch (e) { console.error(e); keep = false; }
        L.raf = keep === false ? 0 : requestAnimationFrame(tick);
      };
      L.raf = requestAnimationFrame(tick);
    });
  }
  function stopLoops(api) {
    api._loops.forEach(L => { if (L.raf) cancelAnimationFrame(L.raf); L.raf = 0; });
  }

  /* ---------- DOM ---------- */
  let root, stage, notesBox, overview, help, bar, laser, clockEl, numEl, secEl;
  const isPresenter = location.hash === '#presenter';

  function el(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  function build() {
    root = document.getElementById('deck');
    if (D._css.length) { const st = document.createElement('style'); st.textContent = D._css.join('\n'); document.head.appendChild(st); }
    stage = el('div', 'stage');
    root.appendChild(stage);
    D.slides.forEach((s, i) => {
      s.index = i;
      const sec = el('section', 'slide sec-' + (s.section.id || 'main') + ' ' + (s.cls || ''));
      sec.dataset.index = i;
      sec.dataset.id = s.id || 's' + i;
      sec.setAttribute('aria-hidden', 'true');
      sec.innerHTML = s.html || '';
      stage.appendChild(sec);
      s.el = sec;
      let max = s.steps || 0;
      sec.querySelectorAll('[data-step],[data-only],[data-until]').forEach(n => {
        ['step', 'only', 'until'].forEach(k => {
          const v = n.dataset[k];
          if (v != null && v !== '') max = Math.max(max, ...v.split(/[ ,]+/).map(Number));
        });
      });
      sec.querySelectorAll('[data-hl]').forEach(n => {
        n.dataset.hl.split(/\s+/).forEach(p => { const k = parseInt(p, 10); if (k > max) max = k; });
      });
      s.maxStep = max;
      s.api = makeApi(s);
      s.inited = false;
    });

    // chrome
    bar = el('div', 'deck-bar');
    D.sections.forEach(sec => {
      const seg = el('div', 'deck-bar-seg');
      seg.style.flexGrow = Math.max(1, sec.slides.length);
      seg.title = sec.title;
      seg.appendChild(el('div', 'deck-bar-fill'));
      sec._bar = seg;
      bar.appendChild(seg);
    });
    root.appendChild(bar);

    const corner = el('div', 'deck-corner');
    secEl = el('span', 'deck-corner-sec');
    numEl = el('span', 'deck-corner-num');
    clockEl = el('span', 'deck-corner-clock');
    corner.append(secEl, numEl, clockEl);
    root.appendChild(corner);

    notesBox = el('aside', 'deck-notes');
    notesBox.hidden = true;
    root.appendChild(notesBox);

    overview = el('div', 'deck-overview');
    overview.hidden = true;
    root.appendChild(overview);

    help = el('div', 'deck-help', `
      <div class="deck-help-card">
        <h2>Keys</h2>
        <dl>
          <dt>→ ↓ space PgDn</dt><dd>next step</dd>
          <dt>← ↑ PgUp</dt><dd>previous step</dd>
          <dt>Home / End</dt><dd>first / last slide</dd>
          <dt>12 Enter</dt><dd>go to slide 12</dd>
          <dt>O</dt><dd>slide map</dd>
          <dt>N</dt><dd>speaker notes on this screen</dd>
          <dt>P</dt><dd>presenter window (notes, timer, next slide)</dd>
          <dt>T</dt><dd>light / dark theme</dd>
          <dt>F</dt><dd>full screen</dd>
          <dt>B</dt><dd>black screen</dd>
          <dt>L</dt><dd>laser pointer</dd>
          <dt>D</dt><dd>draw on the slide · E erases</dd>
          <dt>W</dt><dd>whiteboard (blank graph paper)</dd>
          <dt>C</dt><dd>show clock · R resets it</dd>
          <dt>?</dt><dd>this help</dd>
        </dl>
      </div>`);
    help.hidden = true;
    help.addEventListener('click', () => (help.hidden = true));
    root.appendChild(help);

    // whiteboard + pen layer live inside the stage so they scale with it
    D._board = el('div', 'deck-board');
    D._board.hidden = true;
    stage.appendChild(D._board);
    const ink = document.createElement('canvas');
    ink.className = 'deck-ink';
    ink.width = W; ink.height = H;
    stage.appendChild(ink);
    D._ink = ink;
    setupPen(ink);

    laser = el('div', 'deck-laser');
    laser.hidden = true;
    root.appendChild(laser);

    const black = el('div', 'deck-black');
    black.hidden = true;
    root.appendChild(black);
    D._black = black;

    buildOverview();
    fit();
    window.addEventListener('resize', fit);
  }

  function fit() {
    const r = root.getBoundingClientRect();
    const k = Math.min(r.width / W, r.height / H);
    D.scale = k;
    stage.style.transform = `translate(${(r.width - W * k) / 2}px, ${(r.height - H * k) / 2}px) scale(${k})`;
  }

  function buildOverview() {
    const wrap = el('div', 'deck-overview-inner');
    D.sections.forEach((sec, si) => {
      const col = el('div', 'deck-ov-sec');
      col.appendChild(el('h3', '', `<span>${si}</span> ${sec.title || ''}` + (sec.minutes ? ` <em>${sec.minutes} min</em>` : '')));
      const ol = el('ol');
      sec.slides.forEach(s => {
        const li = el('li', '', `<span class="n">${s.index + 1}</span>${s.title || s.id || ''}`);
        li.addEventListener('click', () => { toggleOverview(false); go(s.index, 0); });
        s._ov = li;
        ol.appendChild(li);
      });
      col.appendChild(ol);
      wrap.appendChild(col);
    });
    overview.appendChild(wrap);
  }

  /* ---------- navigation ---------- */
  function applyStep(s, k) {
    s.el.querySelectorAll('[data-step]').forEach(n => {
      const v = Number(n.dataset.step);
      n.classList.toggle('is-shown', k >= v);
      n.classList.toggle('is-current', k === v);
    });
    s.el.querySelectorAll('[data-only]').forEach(n => {
      const vs = n.dataset.only.split(/[ ,]+/).map(Number);
      n.classList.toggle('is-shown', vs.includes(k));
    });
    s.el.querySelectorAll('[data-until]').forEach(n => {
      n.classList.toggle('is-gone', k >= Number(n.dataset.until));
    });
    s.el.querySelectorAll('pre[data-hl]').forEach(pre => {
      let lines = null;
      pre.dataset.hl.split(/\s+/).forEach(p => {
        const [st, spec] = p.split(':');
        if (Number(st) === k) lines = spec || '';
      });
      const set = new Set();
      if (lines) lines.split(',').forEach(r => {
        const [a, b] = r.split('-').map(Number);
        for (let j = a; j <= (b || a); j++) set.add(j);
      });
      pre.classList.toggle('has-hl', set.size > 0);
      pre.querySelectorAll('.ln').forEach((ln, j) => ln.classList.toggle('hl', set.has(j + 1)));
    });
    s.api.step = k;
    s.api._step.forEach(fn => { try { fn(k); } catch (e) { console.error(e); } });
  }

  function ensureInit(s) {
    if (s.inited || !s.init) { s.inited = true; return; }
    s.inited = true;
    try { s.init(s.el, s.api); } catch (e) { console.error('init failed for slide', s.id, e); }
  }

  function go(i, k, remote) {
    i = Math.max(0, Math.min(D.slides.length - 1, i));
    const prev = D.slides[D.cur];
    const s = D.slides[i];
    k = Math.max(0, Math.min(s.maxStep, k === 'end' ? s.maxStep : k || 0));
    if (prev && prev !== s) {
      if (D._board && D._board.hidden) clearInk();
      prev.el.classList.remove('is-active');
      prev.el.setAttribute('aria-hidden', 'true');
      prev.api.active = false;
      stopLoops(prev.api);
      prev.api._leave.forEach(fn => { try { fn(); } catch (e) { console.error(e); } });
    }
    ensureInit(s);
    // warm up the neighbours so they appear without a flash
    [i + 1, i - 1].forEach(j => { if (D.slides[j]) ensureInit(D.slides[j]); });
    const entering = prev !== s;
    D.cur = i;
    D.step = k;
    s.el.classList.add('is-active');
    s.el.setAttribute('aria-hidden', 'false');
    if (entering) {
      s.api.active = true;
      s.api._enter.forEach(fn => { try { fn(); } catch (e) { console.error(e); } });
      startLoops(s.api);
    }
    applyStep(s, k);
    updateChrome();
    if (!isPresenter) {
      const h = '#' + (i + 1);
      if (location.hash !== h) history.replaceState(null, '', h);
    }
    if (!remote) broadcast({ type: 'goto', i, k });
    if (!clock.started && i > 0) clock.start();
  }
  D.go = go;
  D.next = function () {
    const s = D.slides[D.cur];
    if (D.step < s.maxStep) go(D.cur, D.step + 1);
    else if (D.cur < D.slides.length - 1) go(D.cur + 1, 0);
  };
  D.prev = function () {
    if (D.step > 0) go(D.cur, D.step - 1);
    else if (D.cur > 0) go(D.cur - 1, 'end');
  };

  function updateChrome() {
    const s = D.slides[D.cur];
    const sec = s.section;
    const si = D.sections.indexOf(sec);
    secEl.textContent = sec.title || '';
    numEl.textContent = `${D.cur + 1} / ${D.slides.length}`;
    D.sections.forEach((x, j) => {
      const fill = x._bar.firstChild;
      if (j < si) fill.style.width = '100%';
      else if (j > si) fill.style.width = '0%';
      else fill.style.width = (100 * (x.slides.indexOf(s) + 1) / x.slides.length) + '%';
      x._bar.classList.toggle('is-current', j === si);
    });
    D.slides.forEach(x => x._ov && x._ov.classList.toggle('is-current', x === s));
    renderNotes();
    document.title = (s.title ? s.title + ' · ' : '') + D.docTitle;
  }

  /* ---------- clock and pacing ---------- */
  const clock = {
    started: false, t0: 0, show: false,
    start() { this.started = true; this.t0 = Date.now(); },
    reset() { this.started = true; this.t0 = Date.now(); },
    elapsed() { return this.started ? (Date.now() - this.t0) / 1000 : 0; },
  };
  D.clock = clock;
  function fmt(sec) {
    sec = Math.max(0, Math.round(sec));
    const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(s).padStart(2, '0');
  }
  D.fmt = fmt;
  function plan(sec) {
    let t = 0;
    for (const x of D.sections) { if (x === sec) break; t += x.minutes || 0; }
    return [t, t + (sec.minutes || 0)];
  }
  function tickClock() {
    clockEl.hidden = !clock.show;
    if (clock.show) clockEl.textContent = fmt(clock.elapsed());
    if (!notesBox.hidden || isPresenter) renderPace();
    setTimeout(tickClock, 500);
  }

  /* ---------- notes, presenter ---------- */
  function renderNotes() {
    const s = D.slides[D.cur];
    const next = D.slides[D.cur + 1];
    const html = `
      <div class="deck-notes-head">
        <span class="deck-notes-pace"></span>
        <span class="deck-notes-next">${next ? 'next → ' + (next.title || next.id) : 'last slide'}</span>
      </div>
      <div class="deck-notes-body">${s.notes || '<p class="muted">No notes for this slide.</p>'}</div>`;
    notesBox.innerHTML = html;
    if (D.presenterPanel) D.presenterPanel.innerHTML = html;
    renderPace();
  }
  function renderPace() {
    const s = D.slides[D.cur];
    if (!s) return;
    const [a, b] = plan(s.section);
    const t = clock.elapsed();
    const late = t / 60 > b;
    const txt = `<b>${fmt(t)}</b> elapsed · ${s.section.title || ''}: planned ${fmt(a * 60)}–${fmt(b * 60)}` +
      (late ? ' · <em>behind plan</em>' : '') + (s.maxStep ? ` · step ${D.step}/${s.maxStep}` : '');
    document.querySelectorAll('.deck-notes-pace').forEach(n => (n.innerHTML = txt));
  }

  let peer = null;
  let chan = null;
  try { chan = new BroadcastChannel('deck-sync'); } catch (e) { chan = null; }
  function broadcast(msg) {
    msg.from = isPresenter ? 'presenter' : 'main';
    try { if (peer && !peer.closed) peer.postMessage(msg, '*'); } catch (e) { /* ignore */ }
    try { if (window.opener && !window.opener.closed) window.opener.postMessage(msg, '*'); } catch (e) { /* ignore */ }
    try { chan && chan.postMessage(msg); } catch (e) { /* ignore */ }
  }
  function onRemote(msg) {
    if (!msg || typeof msg !== 'object') return;
    if (msg.type === 'goto' && (msg.i !== D.cur || msg.k !== D.step)) go(msg.i, msg.k, true);
    if (msg.type === 'clock') { clock.started = true; clock.t0 = msg.t0; }
  }
  window.addEventListener('message', e => onRemote(e.data));
  if (chan) chan.onmessage = e => onRemote(e.data);

  function openPresenter() {
    try {
      peer = window.open(location.href.split('#')[0] + '#presenter', 'deck-presenter', 'width=1280,height=800');
      setTimeout(() => broadcast({ type: 'goto', i: D.cur, k: D.step }), 800);
      setTimeout(() => broadcast({ type: 'clock', t0: clock.t0 || Date.now() }), 900);
    } catch (e) { peer = null; }
    if (!peer) { notesBox.hidden = false; renderNotes(); }
  }

  function setupPresenter() {
    document.documentElement.classList.add('is-presenter');
    const panel = el('div', 'deck-presenter-panel');
    D.presenterPanel = panel;
    document.body.appendChild(panel);
    const fitP = () => {
      root.style.width = '58vw';
      root.style.height = 'calc(58vw * 9 / 16)';
      fit();
    };
    fitP();
    window.addEventListener('resize', fitP);
  }

  /* ---------- pen and whiteboard ---------- */
  let drawing = false;
  function setupPen(cv) {
    const ctx = cv.getContext('2d');
    let last = null;
    const pos = e => {
      const r = cv.getBoundingClientRect();
      return [(e.clientX - r.left) * W / r.width, (e.clientY - r.top) * H / r.height];
    };
    cv.addEventListener('pointerdown', e => {
      if (!drawing) return;
      last = pos(e);
      cv.setPointerCapture(e.pointerId);
      e.preventDefault();
    });
    cv.addEventListener('pointermove', e => {
      if (!drawing || !last) return;
      const p = pos(e);
      ctx.strokeStyle = '#e8203a'; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(last[0], last[1]); ctx.lineTo(p[0], p[1]); ctx.stroke();
      last = p;
    });
    const up = () => { last = null; };
    cv.addEventListener('pointerup', up);
    cv.addEventListener('pointercancel', up);
  }
  function clearInk() { const c = D._ink; if (c) c.getContext('2d').clearRect(0, 0, c.width, c.height); }
  function toggleDraw(force) {
    drawing = force === undefined ? !drawing : force;
    D._ink.classList.toggle('is-drawing', drawing);
  }
  function toggleBoard() {
    D._board.hidden = !D._board.hidden;
    clearInk();
    if (!D._board.hidden) toggleDraw(true);
  }

  /* ---------- input ---------- */
  let typed = '';
  function onKey(e) {
    const t = e.target;
    if (t && (t.tagName === 'INPUT' && t.type !== 'range' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return;
    if (t && t.tagName === 'INPUT' && t.type === 'range' && /^Arrow/.test(e.key)) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key;
    if (!help.hidden && k !== '?') { help.hidden = true; if (k === 'Escape') return; }
    if (/^[0-9]$/.test(k)) { typed += k; return; }
    if (k === 'Enter' && typed) { go(parseInt(typed, 10) - 1, 0); typed = ''; return; }
    typed = '';
    switch (k) {
      case 'ArrowRight': case 'ArrowDown': case 'PageDown': case ' ':
        if (k === ' ' && e.shiftKey) D.prev(); else D.next();
        break;
      case 'ArrowLeft': case 'ArrowUp': case 'PageUp': case 'Backspace': D.prev(); break;
      case 'Home': go(0, 0); break;
      case 'End': go(D.slides.length - 1, 0); break;
      case 'n': case 'N': toggleNotes(); break;
      case 'o': case 'O': toggleOverview(); break;
      case 'Escape': toggleOverview(false); notesBox.hidden = true; break;
      case 'p': case 'P': openPresenter(); break;
      case 't': case 'T': cycleTheme(); break;
      case 'f': case 'F': toggleFull(); break;
      case 'b': case 'B': case '.': D._black.hidden = !D._black.hidden; break;
      case 'l': case 'L': laser.hidden = !laser.hidden; root.classList.toggle('no-cursor', !laser.hidden); break;
      case 'c': case 'C': clock.show = !clock.show; break;
      case 'd': case 'D': toggleDraw(); break;
      case 'e': case 'E': clearInk(); break;
      case 'w': case 'W': toggleBoard(); break;
      case 'r': case 'R': clock.reset(); broadcast({ type: 'clock', t0: clock.t0 }); break;
      case '?': help.hidden = !help.hidden; break;
      default: return;
    }
    e.preventDefault();
  }
  function toggleNotes() { notesBox.hidden = !notesBox.hidden; renderNotes(); }
  function toggleOverview(force) {
    overview.hidden = force === undefined ? !overview.hidden : !force;
    if (!overview.hidden) {
      const c = overview.querySelector('.is-current');
      if (c) c.scrollIntoView({ block: 'center' });
    }
  }
  function toggleFull() {
    try {
      if (document.fullscreenElement) document.exitFullscreen();
      else (document.documentElement.requestFullscreen() || Promise.resolve()).catch(() => {});
    } catch (e) { /* not available */ }
  }

  /* ---------- theme ---------- */
  const THEMES = ['system', 'light', 'dark'];
  function themeNow() {
    const a = document.documentElement.getAttribute('data-theme');
    if (a) return a;
    return window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  D.theme = themeNow;
  function setTheme(name) {
    if (name === 'system') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', name);
    try { localStorage.setItem('deck-theme', name); } catch (e) { /* storage blocked */ }
    themeChanged();
  }
  function cycleTheme() {
    let cur = 'system';
    try { cur = localStorage.getItem('deck-theme') || 'system'; } catch (e) { /* ignore */ }
    // skip the option that would look identical to the current one
    let next = THEMES[(THEMES.indexOf(cur) + 1) % 3];
    if (next !== 'system' && next === themeNow()) next = THEMES[(THEMES.indexOf(next) + 1) % 3];
    setTheme(next);
  }
  function themeChanged() {
    D.slides.forEach(s => s.inited && s.api._theme.forEach(fn => { try { fn(themeNow()); } catch (e) { console.error(e); } }));
  }
  if (window.matchMedia) {
    const mq = matchMedia('(prefers-color-scheme: dark)');
    (mq.addEventListener ? mq.addEventListener('change', themeChanged) : mq.addListener(themeChanged));
  }
  // the host viewer may set data-theme itself
  new MutationObserver(themeChanged).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  /* ---------- start ---------- */
  D.start = function () {
    D.docTitle = document.title;
    try {
      const saved = localStorage.getItem('deck-theme');
      if (saved && saved !== 'system') document.documentElement.setAttribute('data-theme', saved);
    } catch (e) { /* ignore */ }
    build();
    if (isPresenter) setupPresenter();
    document.addEventListener('keydown', onKey);
    // clicks on controls should not steal the clicker's keys
    document.addEventListener('click', e => {
      const b = e.target.closest('button');
      if (b) setTimeout(() => b.blur(), 0);
    });
    document.addEventListener('change', e => { if (e.target.type === 'range') e.target.blur(); });
    // touch: swipe to navigate
    let tx = null, ty = null;
    root.addEventListener('touchstart', e => { const p = e.touches[0]; tx = p.clientX; ty = p.clientY; }, { passive: true });
    root.addEventListener('touchend', e => {
      if (tx == null) return;
      const p = e.changedTouches[0];
      const dx = p.clientX - tx, dy = p.clientY - ty;
      if (Math.abs(dx) > 60 && Math.abs(dx) > 1.5 * Math.abs(dy) && !e.target.closest('input,canvas,button')) {
        dx < 0 ? D.next() : D.prev();
      }
      tx = null;
    });
    root.addEventListener('pointermove', e => {
      if (laser.hidden) return;
      const r = root.getBoundingClientRect();
      laser.style.transform = `translate(${e.clientX - r.left}px, ${e.clientY - r.top}px)`;
    });
    const m = /^#(\d+)$/.exec(location.hash);
    go(m ? parseInt(m[1], 10) - 1 : 0, 0, true);
    window.addEventListener('hashchange', () => {
      const mm = /^#(\d+)$/.exec(location.hash);
      if (mm && parseInt(mm[1], 10) - 1 !== D.cur) go(parseInt(mm[1], 10) - 1, 0);
    });
    tickClock();
  };
})();
