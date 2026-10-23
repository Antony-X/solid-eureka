/* ---------- cluster map ---------- */
// Inlined into template.html by ladder/export_web.py, inside the page script, so it shares
// WORDS, SETS, mode, neighbours(), explain() and the other helpers defined there.
const fmtN = (n) => n.toLocaleString("en-US");
const pill = (w) => isHead(w) ? `<span class="pill h">headword</span>` : `<span class="pill f">form</span>`;

/* Canvas map of every cluster with 2+ words. Positions come precomputed (ladder/clusters.py).
   To stay smooth on phones it never draws more than a few thousand words in one frame: zoomed
   out it shows a cached overview bitmap, at middle zooms cached 256 px tiles (missing ones are
   drawn a few per frame, with the blurrier parent tile standing in), and only when zoomed in
   does it draw the visible words and their links directly. Labels are capped and chosen by
   word frequency. */
const atlas = (() => {
  const TAU = Math.PI * 2, LINK_PX = 300, MAX_PU = 60;   // longest link drawn (screen px; a selected word shows all); max zoom (px per map unit)
  const box = $("mapbox"), cv = $("map-canvas"), ctx = cv.getContext("2d"), msg = $("map-msg"), card = $("map-card");
  const zoomBox = box.querySelector(".zoom"), randomBtn = $("map-random");
  const store = {}, widths = new Map();
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const cam = { x: 0, y: 0, s: 1 };   // world point at the centre of the view; css px per world step
  let D = null, IDX = null, C = {}, W = 0, H = 0, dpr = 1, active = false, needFit = false, token = 0;
  let sel = -1, selCl = -1, route = null;
  const TILE = 256, MAX_TILES = 96, LIVE_MAX = 3500;   // tile size in device px; cached tiles; most words drawn directly
  let raf = 0, anim = 0, idle = 0, interacting = false, frame = 1;
  let ov = null, occ = null, labelled = null, labelFrame = 0;
  const tiles = new Map(), spare = [];

  /* ---- data ---- */
  const gunzip = (buf) => new Response(new Blob([buf]).stream().pipeThrough(new DecompressionStream("gzip"))).arrayBuffer();

  function parse(buf, m) {
    const dv = new DataView(buf);
    if (dv.getUint32(0, true) !== 0x31434c57) throw new Error("unexpected map file");
    const k = dv.getUint32(4, true), n = dv.getUint32(8, true), unit = dv.getFloat32(12, true);
    const qw = dv.getUint32(16, true), qh = dv.getUint32(20, true);
    let off = 24;
    const size = new Uint32Array(buf, off, k); off += 4 * k;
    const delta = new Uint32Array(buf, off, n); off += 4 * n;
    const prio = new Uint8Array(buf, off, n); off = (off + n + 3) & ~3;
    const x = new Uint16Array(buf, off, n); off += 2 * n;
    const y = new Uint16Array(buf, off, n);
    if (!IDX) { IDX = new Map(); WORDS.forEach((w, i) => IDX.set(w, i)); }

    const word = new Int32Array(n), cl = new Int32Array(n), start = new Int32Array(k + 1), top = new Int32Array(k);
    const head = new Uint8Array(n), nodeOf = new Int32Array(WORDS.length).fill(-1);
    const cx = new Float64Array(k), cy = new Float64Array(k), cr = new Float64Array(k);
    const b = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };
    for (let c = 0, i = 0; c < k; c++) {
      const end = i + size[c];
      let w = 0, best = i, sx = 0, sy = 0, r2 = 0;
      start[c] = i;
      for (let j = i; j < end; j++) {
        w += delta[j]; word[j] = w; cl[j] = c; nodeOf[w] = j;
        head[j] = SETS.strict.has(WORDS[w]) ? 1 : 0;
        if (prio[j] > prio[best]) best = j;
        sx += x[j]; sy += y[j];
      }
      const mx = sx / size[c], my = sy / size[c];
      for (let j = i; j < end; j++) r2 = Math.max(r2, (x[j] - mx) ** 2 + (y[j] - my) ** 2);
      cx[c] = mx; cy[c] = my; cr[c] = Math.sqrt(r2) + 0.9 * unit; top[c] = best;
      b.x0 = Math.min(b.x0, mx - cr[c]); b.y0 = Math.min(b.y0, my - cr[c]);
      b.x1 = Math.max(b.x1, mx + cr[c]); b.y1 = Math.max(b.y1, my + cr[c]);
      i = end;
    }
    start[k] = n;

    // spatial grid for culling and hit tests
    const cs = Math.ceil(Math.max(qw, qh) / 200) || 1, gx = Math.floor(qw / cs) + 1, gy = Math.floor(qh / cs) + 1;
    const gStart = new Int32Array(gx * gy + 1), gItems = new Int32Array(n), cellOf = new Int32Array(n);
    for (let j = 0; j < n; j++) { const c = Math.floor(x[j] / cs) + Math.floor(y[j] / cs) * gx; cellOf[j] = c; gStart[c + 1]++; }
    for (let c = 0; c < gx * gy; c++) gStart[c + 1] += gStart[c];
    const fill = gStart.slice(0, gx * gy);
    for (let j = 0; j < n; j++) gItems[fill[cellOf[j]]++] = j;

    // every word, most frequent first: the order labels are tried in
    const pc = new Int32Array(257), byPrio = new Int32Array(n);
    for (let j = 0; j < n; j++) pc[256 - prio[j]]++;
    for (let p = 1; p < 257; p++) pc[p] += pc[p - 1];
    for (let j = 0; j < n; j++) byPrio[pc[255 - prio[j]]++] = j;

    return { mode: m, k, n, unit, size, word, cl, start, top, head, nodeOf, prio, x, y, cx, cy, cr, bounds: b,
             cs, gx, gy, gStart, gItems, byPrio, seen: new Uint32Array(n), vis: new Int32Array(n), nb: new Map(), tops: new Map() };
  }

  function load(m) {
    if (!store[m]) {
      store[m] = (async () => {
        let buf;
        if (m === "strict") buf = Uint8Array.from(atob($("map-strict").textContent.trim()), (c) => c.charCodeAt(0)).buffer;
        else {
          const res = await fetch("clusters-standard.bin");
          if (!res.ok) throw new Error("HTTP " + res.status);
          buf = await res.arrayBuffer();
        }
        return parse(await gunzip(buf), m);
      })();
      store[m].catch(() => { delete store[m]; });
    }
    return store[m];
  }

  function show(m, then) {
    const t = ++token;
    if (!D || D.mode !== m) {
      msg.textContent = m === "standard" ? "Loading the map of all word forms (about 0.7 MB)…" : "Loading the map…";
      msg.hidden = false;
    }
    return wordsReady.then(() => load(m)).then((data) => {
      if (t !== token) return;
      if (D !== data) {
        D = data; ov = null; dropTiles(); sel = -1; selCl = -1; route = null; card.hidden = true;
        if (measure()) fit(false); else needFit = true;
        summary();
      }
      msg.hidden = true;
      if (then) then();
      invalidate();
    }).catch((err) => {
      if (t !== token) return;
      msg.textContent = `The map could not be loaded (${err.message}). ` +
        (location.protocol === "file:" ? "Serve the folder over HTTP, for example with python -m http.server, to load it." : "Reload the page to try again.");
      msg.hidden = false;
    });
  }

  function nbrs(i) {
    let a = D.nb.get(i);
    if (!a) {
      const list = neighbours(WORDS[D.word[i]], D.mode);
      a = new Int32Array(list.length);
      for (let q = 0; q < list.length; q++) a[q] = D.nodeOf[IDX.get(list[q])];
      D.nb.set(i, a);
    }
    return a;
  }
  function topNodes(c, m) {   // a cluster's words, most frequent first
    let t = D.tops.get(c);
    if (!t) {
      t = [];
      for (let j = D.start[c]; j < D.start[c + 1]; j++) t.push(j);
      t.sort((a, b) => D.prio[b] - D.prio[a]);
      D.tops.set(c, t);
    }
    return t.slice(0, m);
  }

  /* ---- view ---- */
  function readColors() {
    const cs = getComputedStyle(document.documentElement), v = (n) => cs.getPropertyValue(n).trim();
    C = { sea: v("--sea"), land: v("--land"), landLine: v("--land-line"), dot: v("--dot"), dotForm: v("--dot-form"),
          edge: v("--edge"), ink: v("--ink"), ink2: v("--ink-2"), muted: v("--muted"), accent: v("--accent") };
  }
  function retheme() { readColors(); ov = null; dropTiles(); invalidate(); }
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", retheme);
  new MutationObserver(retheme).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  if (document.fonts) document.fonts.load('400 13px "Noto Sans Georgian"').then(() => { widths.clear(); invalidate(); }, () => {});

  function measure() {
    const r = cv.getBoundingClientRect(), w = Math.round(r.width), h = Math.round(r.height);
    if (!w || !h) return false;
    const d = Math.min(window.devicePixelRatio || 1, 2);
    if (w !== W || h !== H || d !== dpr) { W = w; H = h; dpr = d; cv.width = Math.round(w * d); cv.height = Math.round(h * d); }
    return true;
  }
  new ResizeObserver(() => { if (active && measure() && D) { if (needFit) { needFit = false; fit(false); } invalidate(); } }).observe(box);

  const fitScale = (b, pad = 22) => Math.min((W - 2 * pad) / (b.x1 - b.x0), (H - 2 * pad) / (b.y1 - b.y0));
  const clampS = (s) => Math.max(fitScale(D.bounds) * 0.5, Math.min(MAX_PU / D.unit, s));
  function fit(animate = true) { const b = D.bounds; moveTo((b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2, fitScale(b), animate); }
  function fitCluster(c) { moveTo(D.cx[c], D.cy[c], Math.min(W, H) * 0.4 / D.cr[c], true); }
  function zoomAt(px, py, f) {
    const wx = (px - W / 2) / cam.s + cam.x, wy = (py - H / 2) / cam.s + cam.y;
    cam.s = clampS(cam.s * f);
    cam.x = wx - (px - W / 2) / cam.s; cam.y = wy - (py - H / 2) / cam.s;
  }
  function stopAnim() { if (anim) { cancelAnimationFrame(anim); anim = 0; interacting = false; } }
  function moveTo(x, y, s, animate = true, ms = 520) {
    s = clampS(s); stopAnim();
    if (!animate || reduce.matches || !active) { cam.x = x; cam.y = y; cam.s = s; invalidate(); return; }
    const a = { ...cam }, t0 = performance.now(), ls = Math.log(a.s), le = Math.log(s);
    interacting = true;
    const step = (t) => {
      const u = Math.min(1, (t - t0) / ms), e = u < 0.5 ? 2 * u * u : 1 - (-2 * u + 2) ** 2 / 2;
      cam.s = Math.exp(ls + (le - ls) * e); cam.x = a.x + (x - a.x) * e; cam.y = a.y + (y - a.y) * e;
      render();
      if (u < 1) anim = requestAnimationFrame(step); else { anim = 0; interacting = false; invalidate(); }
    };
    anim = requestAnimationFrame(step);
  }
  function invalidate() { if (!raf && active) raf = requestAnimationFrame(render); }
  function beginInteract() { interacting = true; clearTimeout(idle); }
  function endInteract() { clearTimeout(idle); idle = setTimeout(() => { interacting = false; invalidate(); }, 140); }

  /* ---- drawing ---- */
  function queryRect(x0, y0, x1, y1, out, mark) {   // words inside a world rectangle; returns how many
    const cs = D.cs;
    const ga = Math.max(0, Math.floor(x0 / cs)), gb = Math.min(D.gx - 1, Math.floor(x1 / cs));
    const ha = Math.max(0, Math.floor(y0 / cs)), hb = Math.min(D.gy - 1, Math.floor(y1 / cs));
    let count = 0;
    if (mark) frame++;
    for (let r = ha; r <= hb; r++) for (let q = ga; q <= gb; q++) {
      const c = q + r * D.gx;
      for (let t = D.gStart[c], e = D.gStart[c + 1]; t < e; t++) {
        const j = D.gItems[t], X = D.x[j], Y = D.y[j];
        if (X < x0 || X > x1 || Y < y0 || Y > y1) continue;
        out[count++] = j;
        if (mark) D.seen[j] = frame;
      }
    }
    return count;
  }
  const dotRadius = (pu) => Math.max(0.8, Math.min(4.5, pu * 0.13));

  // Land (one disc per cluster), links when zoomed in, then words. list === null means every word.
  function drawBase(g, s, ox, oy, Wp, Hp, list, count, links) {
    const pu = D.unit * s;
    g.fillStyle = C.sea; g.fillRect(0, 0, Wp, Hp);
    g.beginPath();
    for (let c = 0; c < D.k; c++) {
      const R = D.cr[c] * s, X = (D.cx[c] - ox) * s, Y = (D.cy[c] - oy) * s;
      if (X + R < 0 || X - R > Wp || Y + R < 0 || Y - R > Hp) continue;
      if (R < 1) g.rect(X - 1, Y - 1, 2, 2); else { g.moveTo(X + R, Y); g.arc(X, Y, R, 0, TAU); }
    }
    g.fillStyle = C.land; g.fill();
    if (pu >= 1) { g.strokeStyle = C.landLine; g.lineWidth = 1; g.stroke(); }

    if (links && pu >= 10) {
      const far = (LINK_PX / s) ** 2;   // long links would criss-cross the view; a selected word shows all of its own
      const until = performance.now() + (interacting ? 2 : 6);   // neighbours not yet known are worked out within this budget
      let pending = false;
      g.beginPath();
      for (let t = 0; t < count; t++) {
        const i = list[t];
        if (!D.nb.has(i) && (pending || performance.now() > until)) { pending = true; continue; }
        const a = nbrs(i), X = (D.x[i] - ox) * s, Y = (D.y[i] - oy) * s;
        for (let q = 0; q < a.length; q++) {
          const j = a[q];
          if (j < 0 || (j < i && D.seen[j] === frame)) continue;   // a visible pair is drawn once
          if ((D.x[j] - D.x[i]) ** 2 + (D.y[j] - D.y[i]) ** 2 > far) continue;
          g.moveTo(X, Y); g.lineTo((D.x[j] - ox) * s, (D.y[j] - oy) * s);
        }
      }
      g.strokeStyle = C.edge; g.lineWidth = 1; g.stroke();
      if (pending) setTimeout(invalidate, 16);   // finish the rest over the next frames
    }

    const r = dotRadius(pu), round = r >= 1.6;
    g.globalAlpha = pu < 2 ? 0.6 : 1;
    for (let pass = 0; pass < 2; pass++) {   // word forms first, dictionary words on top
      g.beginPath();
      let any = false;
      for (let t = 0; t < count; t++) {
        const i = list ? list[t] : t;
        if (D.head[i] !== pass) continue;
        const X = (D.x[i] - ox) * s, Y = (D.y[i] - oy) * s;
        if (round) { g.moveTo(X + r, Y); g.arc(X, Y, r, 0, TAU); } else g.rect(X - r, Y - r, 2 * r, 2 * r);
        any = true;
      }
      if (any) { g.fillStyle = pass ? C.dot : C.dotForm; g.fill(); }
    }
    g.globalAlpha = 1;
  }

  function buildOverview() {
    const b = D.bounds, k = 2048 / Math.max(b.x1 - b.x0, b.y1 - b.y0), c = document.createElement("canvas");
    c.width = Math.ceil((b.x1 - b.x0) * k); c.height = Math.ceil((b.y1 - b.y0) * k);
    drawBase(c.getContext("2d"), k, b.x0, b.y0, c.width, c.height, null, D.n, false);
    ov = { canvas: c, k, x0: b.x0, y0: b.y0 };
    if (!D.tvis) D.tvis = new Int32Array(D.n);
  }
  function drawOverview() {
    ctx.fillStyle = C.sea; ctx.fillRect(0, 0, W, H);
    const s = cam.s;
    ctx.drawImage(ov.canvas, (ov.x0 - cam.x) * s + W / 2, (ov.y0 - cam.y) * s + H / 2, ov.canvas.width / ov.k * s, ov.canvas.height / ov.k * s);
  }

  // Tile (z, tx, ty) covers TILE device px at 2^z times the overview's resolution.
  function dropTiles() { for (const t of tiles.values()) spare.push(t); tiles.clear(); }
  function renderTile(z, tx, ty) {
    const k = ov.k * 2 ** z, T = TILE / k, x0 = ov.x0 + tx * T, y0 = ov.y0 + ty * T, pad = 6 / k;
    const count = queryRect(x0 - pad, y0 - pad, x0 + T + pad, y0 + T + pad, D.tvis, false);
    const c = spare.pop() || Object.assign(document.createElement("canvas"), { width: TILE, height: TILE });
    drawBase(c.getContext("2d"), k, x0, y0, TILE, TILE, D.tvis, count, false);
    tiles.set(z + "/" + tx + "/" + ty, c);
    if (tiles.size > MAX_TILES) { const old = tiles.keys().next().value; spare.push(tiles.get(old)); tiles.delete(old); }
    return c;
  }
  function drawTiles() {
    const need = cam.s * dpr, z = Math.max(1, Math.ceil(Math.log2(need / ov.k) - 0.15)), T = TILE / (ov.k * 2 ** z);
    const b = D.bounds, vx0 = Math.max(b.x0, cam.x - W / 2 / cam.s), vx1 = Math.min(b.x1, cam.x + W / 2 / cam.s);
    const vy0 = Math.max(b.y0, cam.y - H / 2 / cam.s), vy1 = Math.min(b.y1, cam.y + H / 2 / cam.s);
    if (vx0 >= vx1 || vy0 >= vy1) return drawOverview();
    // device-pixel-aligned edges so neighbouring tiles meet without seams
    const sx = (tx) => Math.round(((ov.x0 + tx * T - cam.x) * cam.s + W / 2) * dpr) / dpr;
    const sy = (ty) => Math.round(((ov.y0 + ty * T - cam.y) * cam.s + H / 2) * dpr) / dpr;
    const ready = [], missing = [];
    for (let ty = Math.floor((vy0 - ov.y0) / T); ty <= Math.floor((vy1 - ov.y0) / T); ty++) {
      for (let tx = Math.floor((vx0 - ov.x0) / T); tx <= Math.floor((vx1 - ov.x0) / T); tx++) {
        const key = z + "/" + tx + "/" + ty, t = tiles.get(key), x = sx(tx), y = sy(ty), item = [tx, ty, x, y, sx(tx + 1) - x, sy(ty + 1) - y];
        if (t) { tiles.delete(key); tiles.set(key, t); item.push(t); ready.push(item); }   // re-insert: most recently used
        else { item.push(Math.hypot(x - W / 2, y - H / 2)); missing.push(item); }
      }
    }
    if (missing.length) drawOverview();   // stands in wherever no tile is ready
    else { ctx.fillStyle = C.sea; ctx.fillRect(0, 0, W, H); }
    for (const [, , x, y, w, h, t] of ready) ctx.drawImage(t, x, y, w, h);
    if (!missing.length) return;
    missing.sort((a, c) => a[6] - c[6]);   // centre of the view first
    const until = performance.now() + (interacting ? 0 : 10);   // while dragging, one new tile per frame
    let left = 0, made = 0;
    for (const [tx, ty, x, y, w, h] of missing) {
      if (made && performance.now() > until) {
        const p = tiles.get((z - 1) + "/" + (tx >> 1) + "/" + (ty >> 1));   // the blurrier parent stands in
        if (p) ctx.drawImage(p, (tx & 1) * TILE / 2, (ty & 1) * TILE / 2, TILE / 2, TILE / 2, x, y, w, h);
        left++;
        continue;
      }
      ctx.drawImage(renderTile(z, tx, ty), x, y, w, h);
      made++;
    }
    if (left) invalidate();
  }

  function render() {
    raf = 0;
    if (!D || !active || !W) return;
    if (!C.sea) readColors();
    if (!ov) buildOverview();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const s = cam.s, ox = cam.x - W / 2 / s, oy = cam.y - H / 2 / s;
    if (ov.k >= s * dpr * 0.95) drawOverview();        // the overview bitmap is sharp enough
    else {
      const m = 24 / s, count = queryRect(ox - m, oy - m, ox + W / s + m, oy + H / s + m, D.vis, true);
      if (count <= LIVE_MAX) drawBase(ctx, s, ox, oy, W, H, D.vis, count, true);
      else drawTiles();
    }
    drawOverlays(s, ox, oy);
  }

  const font = (size, weight) => `${weight} ${size}px "Noto Sans Georgian", system-ui, sans-serif`;
  function textW(t, size, weight) {
    const key = size + "|" + weight + "|" + t;
    let w = widths.get(key);
    if (w === undefined) { ctx.font = font(size, weight); w = ctx.measureText(t).width; widths.set(key, w); }
    return w;
  }

  function drawOverlays(s, ox, oy) {
    const pu = D.unit * s, X = (i) => (D.x[i] - ox) * s, Y = (i) => (D.y[i] - oy) * s;
    ctx.lineJoin = ctx.lineCap = "round";
    if (selCl >= 0) {
      ctx.beginPath(); ctx.arc((D.cx[selCl] - ox) * s, (D.cy[selCl] - oy) * s, Math.max(D.cr[selCl] * s, 7), 0, TAU);
      ctx.strokeStyle = C.accent; ctx.lineWidth = 2; ctx.stroke();
    }
    if (sel >= 0) {
      const a = nbrs(sel), x = X(sel), y = Y(sel);
      ctx.beginPath();
      for (const j of a) if (j >= 0) { ctx.moveTo(x, y); ctx.lineTo(X(j), Y(j)); }
      ctx.strokeStyle = C.accent; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.beginPath();
      for (const j of a) if (j >= 0) { ctx.moveTo(X(j) + 3.5, Y(j)); ctx.arc(X(j), Y(j), 3.5, 0, TAU); }
      ctx.fillStyle = C.accent; ctx.fill();
      ctx.beginPath(); ctx.arc(x, y, 6.5, 0, TAU); ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = C.land; ctx.stroke();
    }
    if (route) {
      ctx.beginPath(); route.forEach((i, k) => k ? ctx.lineTo(X(i), Y(i)) : ctx.moveTo(X(i), Y(i)));
      ctx.strokeStyle = C.accent; ctx.lineWidth = 3; ctx.stroke();
      ctx.beginPath(); for (const i of route) { ctx.moveTo(X(i) + 5, Y(i)); ctx.arc(X(i), Y(i), 5, 0, TAU); }
      ctx.fillStyle = C.accent; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = C.land; ctx.stroke();
    }
    labels(s, ox, oy, pu);
  }

  // Words and cluster names, most important first, skipping any that would overlap another.
  function labels(s, ox, oy, pu) {
    const cell = 8, cols = Math.ceil(W / cell) + 1, rows = Math.ceil(H / cell) + 1;
    if (!occ || occ.length < cols * rows) occ = new Uint8Array(cols * rows); else occ.fill(0, 0, cols * rows);
    const claim = (x0, y0, x1, y1) => {
      if (x0 < 2 || y0 < 2 || x1 > W - 2 || y1 > H - 2) return false;
      const a = x0 / cell | 0, b = x1 / cell | 0, c = y0 / cell | 0, d = y1 / cell | 0;
      for (let r = c; r <= d; r++) for (let q = a; q <= b; q++) if (occ[r * cols + q]) return false;
      for (let r = c; r <= d; r++) for (let q = a; q <= b; q++) occ[r * cols + q] = 1;
      return true;
    };
    // keep labels out from under the buttons and the info card
    const keepOut = (el) => {
      if (el.hidden) return;
      const a = el.getBoundingClientRect(), o = cv.getBoundingClientRect();
      const x0 = Math.max(0, (a.left - o.left) / cell | 0), x1 = Math.min(cols - 1, (a.right - o.left) / cell | 0);
      const y0 = Math.max(0, (a.top - o.top) / cell | 0), y1 = Math.min(rows - 1, (a.bottom - o.top) / cell | 0);
      for (let r = y0; r <= y1; r++) for (let q = x0; q <= x1; q++) occ[r * cols + q] = 1;
    };
    keepOut(zoomBox); keepOut(randomBtn); keepOut(card);
    if (!labelled || labelled.length !== D.n) labelled = new Uint32Array(D.n);
    labelFrame++;
    ctx.textBaseline = "middle"; ctx.lineJoin = "round";
    const dr = dotRadius(pu);
    // fewer labels when zoomed out, so the overview stays readable
    let budget = Math.round(Math.max(12, Math.min(interacting ? 45 : 90, W * H / 8000)) * Math.max(0.2, Math.min(1, pu / 16)));
    const put = (i, strong) => {
      if (labelled[i] === labelFrame) return false;
      const px = (D.x[i] - ox) * s, py = (D.y[i] - oy) * s;
      if (px < 0 || px > W || py < 0 || py > H) return false;
      const w = WORDS[D.word[i]], size = D.head[i] ? 13 : 12, weight = strong ? 600 : D.head[i] ? 500 : 400, tw = textW(w, size, weight);
      let x = px + dr + 4;
      if (!claim(x - 2, py - 8, x + tw + 2, py + 8)) { x = px - dr - 4 - tw; if (!claim(x - 2, py - 8, x + tw + 2, py + 8)) return false; }
      ctx.font = font(size, weight); ctx.lineWidth = 3.5; ctx.strokeStyle = C.land; ctx.strokeText(w, x, py);
      ctx.fillStyle = strong ? C.accent : D.head[i] ? C.ink : C.ink2; ctx.fillText(w, x, py);
      labelled[i] = labelFrame;
      return true;
    };
    if (route) for (const i of route) put(i, true);
    if (sel >= 0) { put(sel, true); for (const j of nbrs(sel)) if (j >= 0 && put(j, false)) budget--; }

    ctx.textAlign = "center";
    for (let c = 0, shown = 0; c < D.k && shown < 16; c++) {
      const R = D.cr[c] * s;
      if (c > 0 && (R < 3 || R > 140)) continue;
      const px = (D.cx[c] - ox) * s, py = (D.cy[c] - oy) * s + (c === 0 ? -R - 12 : R + 10);
      if (px < 0 || px > W || py < 0 || py > H) continue;
      const text = c === 0 ? `Main cluster · ${fmtN(D.size[0])} words` : `${WORDS[D.word[D.top[c]]]} · ${D.size[c]}`;
      const weight = c === 0 ? 600 : 400, tw = textW(text, 11.5, weight);
      if (!claim(px - tw / 2 - 2, py - 8, px + tw / 2 + 2, py + 8)) continue;
      ctx.font = font(11.5, weight); ctx.lineWidth = 3; ctx.strokeStyle = C.sea; ctx.strokeText(text, px, py);
      ctx.fillStyle = c === 0 ? C.ink2 : C.muted; ctx.fillText(text, px, py);
      shown++;
    }
    ctx.textAlign = "left";

    for (let t = 0, tries = 0; t < D.n && budget > 0 && tries < 700; t++) {
      const i = D.byPrio[t], px = (D.x[i] - ox) * s, py = (D.y[i] - oy) * s;
      if (px < 0 || px > W || py < 0 || py > H) continue;
      tries++;
      if (put(i, false)) budget--;
    }
  }

  /* ---- input ---- */
  const pts = new Map();
  let gesture = null, lastTap = { t: 0, x: 0, y: 0 };
  cv.addEventListener("pointerdown", (e) => {
    if (!D) return;
    cv.setPointerCapture(e.pointerId);
    pts.set(e.pointerId, { x: e.offsetX, y: e.offsetY });
    stopAnim(); beginInteract(); cv.classList.add("drag");
    gesture = pts.size === 1 ? { moved: 0, t: performance.now() } : { moved: 99, t: 0 };
  });
  cv.addEventListener("pointermove", (e) => {
    const p = pts.get(e.pointerId);
    if (!p || !D) return;
    const nx = e.offsetX, ny = e.offsetY;
    if (pts.size === 1) {
      cam.x -= (nx - p.x) / cam.s; cam.y -= (ny - p.y) / cam.s;
      gesture.moved += Math.abs(nx - p.x) + Math.abs(ny - p.y);
    } else {   // pinch: keep the world point under the fingers' midpoint under it
      const [a, b] = [...pts.values()];
      const m0x = (a.x + b.x) / 2, m0y = (a.y + b.y) / 2, d0 = Math.hypot(a.x - b.x, a.y - b.y);
      p.x = nx; p.y = ny;
      const m1x = (a.x + b.x) / 2, m1y = (a.y + b.y) / 2, d1 = Math.hypot(a.x - b.x, a.y - b.y);
      const wx = (m0x - W / 2) / cam.s + cam.x, wy = (m0y - H / 2) / cam.s + cam.y;
      if (d0 > 0) cam.s = clampS(cam.s * d1 / d0);
      cam.x = wx - (m1x - W / 2) / cam.s; cam.y = wy - (m1y - H / 2) / cam.s;
    }
    p.x = nx; p.y = ny;
    invalidate();
  });
  const release = (e) => {
    if (!pts.delete(e.pointerId) || pts.size) return;
    cv.classList.remove("drag");
    if (e.type === "pointerup" && gesture && gesture.moved < 8 && performance.now() - gesture.t < 500) tap(e.offsetX, e.offsetY);
    gesture = null; endInteract();
  };
  cv.addEventListener("pointerup", release);
  cv.addEventListener("pointercancel", release);
  cv.addEventListener("wheel", (e) => {
    if (!D) return;
    e.preventDefault(); stopAnim(); beginInteract();
    const dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
    zoomAt(e.offsetX, e.offsetY, Math.exp(-dy * (e.ctrlKey ? 0.01 : 0.0018)));
    invalidate(); endInteract();
  }, { passive: false });
  cv.addEventListener("keydown", (e) => {
    if (!D) return;
    const k = e.key, step = 80 / cam.s;
    if (k === "ArrowLeft") cam.x -= step; else if (k === "ArrowRight") cam.x += step;
    else if (k === "ArrowUp") cam.y -= step; else if (k === "ArrowDown") cam.y += step;
    else if (k === "+" || k === "=") return zoomButton(1.8);
    else if (k === "-" || k === "_") return zoomButton(1 / 1.8);
    else if (k === "0") return fit();
    else if (k === "Escape") return clearSel();
    else return;
    e.preventDefault(); invalidate();
  });
  function zoomButton(f) { if (D) moveTo(cam.x, cam.y, cam.s * f, true, 260); }
  $("z-in").onclick = () => zoomButton(1.8);
  $("z-out").onclick = () => zoomButton(1 / 1.8);
  $("z-fit").onclick = () => { if (D) fit(); };

  function hit(px, py) {
    const wx = (px - W / 2) / cam.s + cam.x, wy = (py - H / 2) / cam.s + cam.y, rad = 16 / cam.s, cs = D.cs;
    let best = -1, bd = rad * rad;
    for (let r = Math.max(0, Math.floor((wy - rad) / cs)); r <= Math.min(D.gy - 1, Math.floor((wy + rad) / cs)); r++)
      for (let q = Math.max(0, Math.floor((wx - rad) / cs)); q <= Math.min(D.gx - 1, Math.floor((wx + rad) / cs)); q++) {
        const c = q + r * D.gx;
        for (let t = D.gStart[c]; t < D.gStart[c + 1]; t++) {
          const j = D.gItems[t], d = (D.x[j] - wx) ** 2 + (D.y[j] - wy) ** 2;
          if (d < bd) { bd = d; best = j; }
        }
      }
    return best;
  }
  function islandAt(px, py) {
    const wx = (px - W / 2) / cam.s + cam.x, wy = (py - H / 2) / cam.s + cam.y;
    for (let c = 1; c < D.k; c++) if ((D.cx[c] - wx) ** 2 + (D.cy[c] - wy) ** 2 <= D.cr[c] ** 2) return c;
    return -1;
  }
  function tap(px, py) {
    const now = performance.now();
    if (now - lastTap.t < 320 && Math.hypot(px - lastTap.x, py - lastTap.y) < 30) {   // double tap zooms in
      lastTap.t = 0;
      const s = clampS(cam.s * 2.4), wx = (px - W / 2) / cam.s + cam.x, wy = (py - H / 2) / cam.s + cam.y;
      return moveTo(wx - (px - W / 2) / s, wy - (py - H / 2) / s, s, true, 280);
    }
    lastTap = { t: now, x: px, y: py };
    const i = hit(px, py);
    if (i >= 0) return selectNode(i, false);
    const c = islandAt(px, py);
    if (c > 0) return selectCluster(c, false);
    clearSel();
  }

  /* ---- selection and the info card ---- */
  function showCard(html) { card.innerHTML = `<button class="x" aria-label="Close">×</button>${html}`; card.hidden = false; card.scrollTop = 0; }
  function clearSel() { sel = -1; selCl = -1; route = null; card.hidden = true; invalidate(); }
  const share = (n) => `${Math.round(100 * n / SETS[D.mode].size)}%`;
  function whereLine(c, w) {
    return c === 0
      ? `It is in the <b>main cluster</b> of ${fmtN(D.size[0])} words, so ladders join it to ${share(D.size[0])} of this dictionary.`
      : `It is on an <b>island of ${D.size[c]} words</b> (cluster #${fmtN(c + 1)} by size). Ladders from <span class="ka">${esc(w)}</span> reach only the other ${D.size[c] - 1}.`;
  }
  const chip = (j, from) => `<button class="chip ${D.head[j] ? "" : "f"}" data-n="${j}" title="${esc(explain(WORDS[D.word[j]]))}">${esc(WORDS[D.word[j]])}${from === undefined ? "" : `<small>${esc(editOf(WORDS[D.word[from]], WORDS[D.word[j]]).op)}</small>`}</button>`;

  function selectNode(i, fly) {
    sel = i; selCl = D.cl[i] > 0 ? D.cl[i] : -1; route = null;
    const w = WORDS[D.word[i]], nb = [...nbrs(i)].filter((j) => j >= 0).sort((a, b) => D.prio[b] - D.prio[a]);
    showCard(`<div class="mc-head"><span class="w" lang="ka">${esc(w)}</span>${pill(w)}</div>
      <div class="mc-gl">${esc(explain(w)) || "<span class='muted'>No gloss in Wiktionary.</span>"}</div>
      <div class="mc-line">${whereLine(D.cl[i], w)}</div>
      <div class="eyebrow">${nb.length} neighbour${nb.length === 1 ? "" : "s"}</div>
      <div class="chips mc-chips">${nb.map((j) => chip(j, i)).join("")}</div>
      <div class="row"><button class="btn ghost sm" data-act="cluster">Zoom to cluster</button><button class="btn sm" data-act="ladder" data-w="${esc(w)}">Start a ladder here</button></div>`);
    if (fly) {   // frame the word with its neighbours, leaving room for the card
      let x0 = D.x[i], x1 = x0, y0 = D.y[i], y1 = y0;
      for (const j of nb.slice(0, 40)) { x0 = Math.min(x0, D.x[j]); x1 = Math.max(x1, D.x[j]); y0 = Math.min(y0, D.y[j]); y1 = Math.max(y1, D.y[j]); }
      const pad = 3 * D.unit, sc = Math.min((W - 80) / (x1 - x0 + pad), H * 0.5 / (y1 - y0 + pad), 30 / D.unit);
      moveTo((x0 + x1) / 2, (y0 + y1) / 2 + 0.2 * H / sc, sc);
    } else invalidate();
  }
  function selectCluster(c, fly) {
    sel = -1; selCl = c; route = null;
    const list = topNodes(c, 40), more = D.size[c] - list.length;
    showCard(`<div class="mc-head"><span class="w">${c === 0 ? "Main cluster" : `Island of ${D.size[c]} words`}</span></div>
      <div class="mc-line">${c === 0 ? `${fmtN(D.size[0])} words, ${share(D.size[0])} of this dictionary. A ladder connects any two of them.` : `Cluster #${fmtN(c + 1)} by size. A ladder connects any two of these words, but none leads off the island.`}</div>
      <div class="chips mc-chips">${list.map((j) => chip(j)).join("")}${more > 0 ? `<span class="muted" style="font-size:12px;align-self:center">+${fmtN(more)} more</span>` : ""}</div>
      <div class="row"><button class="btn ghost sm" data-act="cluster">Zoom to cluster</button></div>`);
    if (fly) fitCluster(c); else invalidate();
  }
  function cardFor(w) {
    sel = -1; selCl = -1; route = null;
    if (!SETS[D.mode].has(w)) {
      showCard(`<div class="mc-line">${SETS.standard.has(w)
        ? `<b class="ka">${esc(w)}</b> is a word form, not a dictionary headword. Switch to “All word forms” to find it.`
        : `<b class="ka">${esc(w)}</b> is not in the dictionary${suggest(w)}`}</div>`);
      return invalidate();
    }
    const j = D.nodeOf[IDX.get(w)];
    if (j >= 0) return selectNode(j, true);
    showCard(`<div class="mc-head"><span class="w" lang="ka">${esc(w)}</span>${pill(w)}</div>
      <div class="mc-gl">${esc(explain(w))}</div>
      <div class="mc-line">No word is one letter away from <span class="ka">${esc(w)}</span>, so it is a cluster of one. Words like this are not drawn on the map.</div>`);
    invalidate();
  }
  card.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b || !D) return;
    if (b.classList.contains("x")) return clearSel();
    if (b.dataset.n) return selectNode(+b.dataset.n, true);
    if (b.dataset.act === "cluster") fitCluster(selCl >= 0 ? selCl : sel >= 0 ? D.cl[sel] : 0);
    if (b.dataset.act === "ladder") { $("from").value = b.dataset.w; go("ladder"); run(); }
    if (b.dataset.act === "hide") clearSel();
  });

  /* ---- summary and lists ---- */
  function summary() {
    const lone = SETS[D.mode].size - D.n, total = D.k + lone;
    $("map-sum").innerHTML = `<b>${fmtN(total)} clusters.</b> The largest holds ${fmtN(D.size[0])} words (${share(D.size[0])} of this dictionary). ` +
      `${fmtN(D.k - 1)} islands have between 2 and ${fmtN(D.size[1])} words, and ${fmtN(lone)} words have no neighbours at all: each is a cluster of one and is left off the map.`;
    $("key-form").hidden = D.mode === "strict";
    const rows = [];
    for (let c = 0; c < Math.min(10, D.k); c++) {
      rows.push(`<tr class="click" data-c="${c}"><td class="num">${c + 1}</td><td class="ka">${topNodes(c, 5).map((j) => esc(WORDS[D.word[j]])).join(" · ")}</td><td class="num">${fmtN(D.size[c])}</td></tr>`);
    }
    $("cl-top").innerHTML = `<thead><tr><th style="text-align:right">#</th><th>Words</th><th style="text-align:right">Size</th></tr></thead><tbody>${rows.join("")}</tbody>`;
    const B = [[1, 1, "1"], [2, 2, "2"], [3, 3, "3"], [4, 4, "4"], [5, 9, "5–9"], [10, 49, "10–49"], [50, Infinity, "50+"]];
    const n = B.map(([lo]) => lo === 1 ? lone : 0);
    for (let c = 0; c < D.k; c++) n[B.findIndex(([lo, hi]) => D.size[c] >= lo && D.size[c] <= hi)]++;
    const max = Math.max(...n);
    $("cl-sizes").innerHTML = B.map(([, , label], k) => `<div class="bar"><span class="k mono">${label}</span><span class="t" style="width:${Math.max(0.5, 100 * n[k] / max)}%;--c:var(--series-1)"></span><span class="n">${fmtN(n[k])}</span></div>`).join("");
    $("cl-sizes-note").textContent = "How many clusters have each number of words. Size 1 is a word with no neighbours.";
  }
  $("cl-top").addEventListener("click", (e) => {
    const r = e.target.closest("tr.click");
    if (r && D) { selectCluster(+r.dataset.c, true); box.scrollIntoView({ block: "nearest", behavior: reduce.matches ? "auto" : "smooth" }); }
  });
  $("map-find").addEventListener("submit", (e) => { e.preventDefault(); const w = $("map-q").value.trim(); if (w) show(mode, () => cardFor(w)); });
  $("map-random").onclick = () => show(mode, () => {
    let c = 1;
    for (let t = 0; t < 60; t++) { c = 1 + Math.floor(Math.random() * (D.k - 1)); if (D.size[c] >= 3) break; }
    selectCluster(c, true);
  });
  $("cm-strict").onclick = () => { setMode("strict"); show("strict"); };
  $("cm-standard").onclick = () => { setMode("standard"); show("standard"); };

  return {
    activate() { active = true; readColors(); measure(); show(mode); },
    deactivate() { active = false; stopAnim(); },
    showWord(w) { show(mode, () => cardFor(w)); },
    showRoute(path) {
      show(mode, () => {
        const nodes = path.map((w) => D.nodeOf[IDX.get(w)]);
        if (nodes.some((j) => j < 0)) return;
        sel = -1; route = nodes; selCl = D.cl[nodes[0]] > 0 ? D.cl[nodes[0]] : -1;
        showCard(`<div class="mc-head"><span class="w" lang="ka">${esc(path[0])} → ${esc(path[path.length - 1])}</span></div>
          <div class="mc-line">${path.length - 1} steps through ${D.cl[nodes[0]] === 0 ? "the main cluster" : `an island of ${D.size[D.cl[nodes[0]]]} words`}.</div>
          <div class="row"><button class="btn ghost sm" data-act="hide">Hide ladder</button></div>`);
        let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
        for (const j of nodes) { x0 = Math.min(x0, D.x[j]); x1 = Math.max(x1, D.x[j]); y0 = Math.min(y0, D.y[j]); y1 = Math.max(y1, D.y[j]); }
        const pad = 4 * D.unit, sc = clampS(Math.min((W - 60) / (x1 - x0 + pad), (H * 0.55) / (y1 - y0 + pad), 40 / D.unit));
        moveTo((x0 + x1) / 2, (y0 + y1) / 2 + 0.18 * H / sc, sc);   // nudge up so the card does not cover it
      });
    },
  };
})();

/* ---------- pages ---------- */
const VIEWS = ["ladder", "clusters", "findings"];
let view = null;
function go(v) {
  if (!VIEWS.includes(v)) v = "ladder";
  const changed = v !== view;
  view = v;
  for (const x of VIEWS) $("view-" + x).hidden = x !== v;
  document.querySelectorAll(".tabs button").forEach((b) => b.setAttribute("aria-current", b.dataset.view === v ? "page" : "false"));
  try { if (location.hash.slice(1) !== v) history.replaceState(null, "", "#" + v); } catch (e) { /* sandboxed frame */ }
  if (v === "clusters") atlas.activate(); else atlas.deactivate();
  if (v === "ladder" && ladderMode !== null && ladderMode !== mode) run();
  if (changed) window.scrollTo(0, 0);
}
document.querySelector(".tabs").addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) go(b.dataset.view); });
document.querySelector(".brand").addEventListener("click", (e) => { e.preventDefault(); go("ladder"); });
window.addEventListener("hashchange", () => go(location.hash.slice(1)));
$("ladder-map").onclick = () => { if (shownPath) { const p = shownPath; go("clusters"); atlas.showRoute(p); } };
