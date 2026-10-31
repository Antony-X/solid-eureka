Deck.section({ id: 'opt', title: 'Gradient descent and optimizers', minutes: 22 });

Deck.css(`
.sec-opt .quiz { display: grid; grid-template-columns: repeat(3, 1fr); grid-template-rows: 1fr 1fr; gap: 40px 64px; flex: 1; min-height: 0; }
.sec-opt .qz { display: flex; flex-direction: column; gap: 14px; border-top: 4px solid var(--ink); padding-top: 18px; }
.sec-opt .qz .n { font-family: var(--font-mono); font-size: 30px; color: var(--muted); font-weight: 600; }
.sec-opt .qz .q { font-size: 38px; line-height: 1.2; }
.sec-opt .qz .a { font-size: 38px; line-height: 1.2; font-weight: 700; }
.sec-opt .demo { display: grid; grid-template-columns: 768px 1fr; gap: 96px; flex: 1; min-height: 0; }
.sec-opt .demo.wide { grid-template-columns: 1104px 1fr; }
.sec-opt .side { display: flex; flex-direction: column; gap: 28px; min-width: 0; }
.sec-opt .side .ctl { margin-top: auto; display: flex; flex-direction: column; gap: 22px; }
.sec-opt .kv { display: flex; align-items: baseline; gap: 28px; }
.sec-opt .kv span { font-family: var(--font-mono); font-size: 30px; color: var(--muted); min-width: 5.2em; text-transform: uppercase; letter-spacing: .08em; }
.sec-opt .kv b { font-family: var(--font-mono); font-size: 60px; font-weight: 600; }
.sec-opt .kv b.grad { color: var(--grad); }
.sec-opt .verdict { font-size: 40px; font-weight: 700; min-height: 1.3em; }
.sec-opt .racers { display: flex; flex-direction: column; gap: 22px; }
.sec-opt .rc { display: grid; grid-template-columns: 96px 1fr auto; align-items: center; gap: 20px; transition: opacity .3s ease; }
.sec-opt .rc .nm { font-size: 40px; font-weight: 700; line-height: 1.05; }
.sec-opt .rc .nm small { display: block; font-family: var(--font-mono); font-size: 28px; font-weight: 500; color: var(--muted); }
.sec-opt .rc .v { font-family: var(--font-mono); font-size: 44px; font-weight: 600; font-variant-numeric: tabular-nums; text-align: right; }
.sec-opt .rc.dim { opacity: .35; }
.sec-opt .rc.off { display: none; }
.sec-opt .rhead { font-family: var(--font-mono); font-size: 28px; color: var(--muted); letter-spacing: .1em; text-transform: uppercase; display: flex; justify-content: space-between; }
.sec-opt .stepno { font-family: var(--font-mono); font-size: 44px; font-weight: 600; }
.sec-opt .pair { display: grid; grid-template-columns: 1fr 1fr; gap: 96px; flex: 1; min-height: 0; }
.sec-opt .pair > div { display: flex; flex-direction: column; gap: 14px; }
.sec-opt .pair .res { font-size: 40px; font-weight: 700; min-height: 1.3em; }
.sec-opt .t-code { display: grid; grid-template-columns: 1056px 1fr; gap: 96px; flex: 1; min-height: 0; align-items: start; }
.sec-opt .effect { font-size: 40px; line-height: 1.25; }
.sec-opt .effect .bigv { font-family: var(--font-mono); font-size: 64px; font-weight: 600; line-height: 1.25; }
.sec-opt .cmp { display: grid; grid-template-columns: 300px 1fr 420px; gap: 10px 32px; align-items: center; font-size: 40px; }
.sec-opt .cmp .hd { font-family: var(--font-mono); font-size: 28px; color: var(--muted); letter-spacing: .08em; text-transform: uppercase; }
.sec-opt .cmp .bw { display: flex; align-items: center; gap: 20px; }
.sec-opt .cmp .bar { height: 44px; background: var(--grad); flex: 0 0 auto; }
.sec-opt .cmp .bw span { font-family: var(--font-mono); font-size: 34px; color: var(--grad); font-weight: 600; }
.sec-opt .sched { display: grid; grid-template-columns: repeat(4, 1fr); gap: 64px; }
.sec-opt .sched > div { display: flex; flex-direction: column; gap: 12px; }
.sec-opt .sched h3 { font-size: 40px; }
.sec-opt .sched .mono { font-size: 28px; color: var(--muted); }
`);

(() => {
  const SQ2 = Math.SQRT2;

  /* ---------------- number formatting ---------------- */
  const minus = s => s.replace(/^-/, '−');
  const fmtLoss = v => {
    if (!isFinite(v) || Math.abs(v) > 1e6) return '∞';
    const a = Math.abs(v);
    if (a >= 100) return minus(v.toFixed(0));
    if (a >= 0.01) return minus(v.toFixed(2));
    if (a >= 1e-4) return minus(v.toPrecision(1));
    return '≈ 0';
  };

  /* ---------------- 1-D bowl: loss (w - 3)^2 ---------------- */
  const L1 = w => (w - 3) * (w - 3);
  // draws the parabola with the ball's path. st = {path, tangent, stepArrow, ghost}
  function drawBowl(cv, view, st) {
    const C = Plot.colors(), ctx = cv.ctx;
    cv.clear();
    const pad = { l: 84, r: 24, t: 48, b: 64 };
    const sx = Plot.scale(view.w0, view.w1, pad.l, cv.w - pad.r);
    const sy = Plot.scale(0, view.L1, cv.h - pad.b, pad.t);
    Plot.axes(ctx, sx, sy, { font: 28, nx: view.nx || 6, ny: 4, xlabel: 'w', ylabel: 'loss' });
    Plot.fn(ctx, sx, sy, L1, { color: C.ink, width: 5 });
    Plot.text(ctx, 'bottom', sx(3), sy(0) - 14, { size: 28, color: C.muted, align: 'center' });
    ctx.save();
    Plot.clip(ctx, pad.l - 4, pad.t - 24, cv.w, cv.h - pad.b + 4);
    const P = st.path || [];
    if (st.tangent != null) {
      const w0 = st.tangent, s = 2 * (w0 - 3), d = view.tanLen || 1.2;
      ctx.save(); ctx.setLineDash([14, 10]); ctx.lineCap = 'round';
      ctx.strokeStyle = C.grad; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(sx(w0 - d), sy(L1(w0) - s * d)); ctx.lineTo(sx(w0 + d), sy(L1(w0) + s * d)); ctx.stroke();
      ctx.restore();
      halo(ctx, 'slope ' + minus(String(s)), sx(w0 + d) + 12, sy(L1(w0) + s * d) + 6, { size: 34, weight: 700, color: C.grad });
    }
    if (st.stepArrow) {
      const [a, b] = st.stepArrow, y = sy(0) - 40;
      Plot.arrow(ctx, sx(a), y, sx(b), y, { color: C.grad, width: 5, head: 18 });
      halo(ctx, 'move ' + (b - a).toFixed(1), (sx(a) + sx(b)) / 2, y - 26, { size: 32, weight: 700, color: C.grad, align: 'center' });
    }
    if (st.ghost != null) Plot.dot(ctx, sx(st.ghost), sy(L1(st.ghost)), 15, Plot.alpha(C.grad, 0.3));
    for (let k = 0; k + 1 < P.length; k++) {
      Plot.arrow(ctx, sx(P[k]), sy(L1(P[k])), sx(P[k + 1]), sy(L1(P[k + 1])), { color: Plot.alpha(C.grad, k + 2 < P.length ? 0.55 : 1), width: 4, head: 18 });
    }
    for (let k = 0; k + 1 < P.length; k++) Plot.dot(ctx, sx(P[k]), sy(L1(P[k])), 7, Plot.alpha(C.grad, 0.55));
    if (P.length) {
      const w = P[P.length - 1];
      ctx.beginPath(); ctx.arc(sx(w), sy(L1(w)), 15, 0, 2 * Math.PI);
      ctx.fillStyle = C.grad; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = C.paper; ctx.stroke();
    }
    ctx.restore();
  }
  // text with a paper halo so it stays readable over lines
  function halo(ctx, s, x, y, o) {
    const C = Plot.colors();
    ctx.save();
    ctx.font = `${o.weight || 600} ${o.size || 28}px ${o.mono ? C.fontMono : C.fontBody}`;
    ctx.textAlign = o.align || 'left'; ctx.textBaseline = o.base || 'middle';
    ctx.lineJoin = 'round'; ctx.lineWidth = 8; ctx.strokeStyle = C.paper; ctx.strokeText(s, x, y);
    ctx.fillStyle = o.color || C.ink; ctx.fillText(s, x, y);
    ctx.restore();
  }

  /* ---------------- 2-D surfaces for the races ---------------- */
  const halves = (top, n) => Array.from({ length: n }, (_, k) => top * Math.pow(0.5, k));
  const SURF = {
    valley: {
      f: (x, y) => 0.5 * (x * x + 100 * y * y), g: (x, y) => [x, 100 * y],
      start: [-5, 1.5], levels: [500, 250].concat(halves(125, 15)), shade: f => Math.log1p(f) / Math.log1p(800),
      marks: [{ x: 0, y: 0, label: 'bottom', dx: 76, dy: 46 }],
    },
    tilted: {
      f: (x, y) => { const u = (x + y) / SQ2, v = (y - x) / SQ2; return 0.5 * (u * u + 100 * v * v); },
      g: (x, y) => { const u = (x + y) / SQ2, v = (y - x) / SQ2; return [(u - 100 * v) / SQ2, (u + 100 * v) / SQ2]; },
      start: [-4.596, -2.475], levels: [500, 250].concat(halves(125, 15)), shade: f => Math.log1p(f) / Math.log1p(800),
      marks: [{ x: 0, y: 0, label: 'bottom', dx: 70, dy: 40 }],
    },
    saddle: {
      f: (x, y) => x * x - y * y + y * y * y * y / 4 + 1, g: (x, y) => [2 * x, -2 * y + y * y * y],
      start: [-1.8, 0.001], levels: [0.1, 0.4, 0.7, 1, 1.6, 2.5, 4, 6, 8.5, 11], shade: f => f / 13,
      marks: [{ x: 0, y: 0, label: 'saddle', dx: 66, dy: 40 }, { x: 0, y: SQ2, label: 'bottom', dx: -150, dy: -12 }, { x: 0, y: -SQ2, label: 'bottom', dx: 80, dy: 0 }],
    },
    bowl: {
      f: (x, y) => 0.5 * (x * x + y * y), g: (x, y) => [x, y],
      start: [-5, 1.5], levels: [500, 250].concat(halves(125, 15)), shade: f => Math.log1p(f) / Math.log1p(800),
      marks: [{ x: 0, y: 0, label: 'bottom', dx: 76, dy: 46 }],
    },
  };
  const STYLE = {
    sgd: { dash: [1, 11], width: 7 },
    momentum: { dash: [18, 10], width: 4 },
    adam: { dash: [], width: 5 },
  };
  const LABEL_AT = { sgd: [0, 48, 'center'], momentum: [24, -2, 'left'], adam: [0, -46, 'center'] };
  // a little SVG sample of each racer's line style (shown next to its readout)
  const swatch = kind => {
    const s = STYLE[kind];
    return `<svg viewBox="0 0 96 30" width="96" height="30" aria-hidden="true"><line x1="6" y1="15" x2="90" y2="15" style="stroke:var(--grad);stroke-width:${s.width};stroke-linecap:round${s.dash.length ? ';stroke-dasharray:' + s.dash.join(' ') : ''}"/><circle cx="84" cy="15" r="10" style="fill:var(--grad);stroke:var(--paper);stroke-width:3"/></svg>`;
  };

  // Race: optimizers moving on a 2-D loss surface drawn as contour lines.
  function Race(api, host, w, h) {
    const cv = Plot.canvas(host, w, h);
    const off = document.createElement('canvas');
    off.width = cv.cv.width; off.height = cv.cv.height;
    const R = { surf: null, view: null, racers: [], k: 0, steps: 100, sps: 16, playing: false, ticks: [], acc: 0 };
    const X = x => w / 2 + (x - R.view.cx) * R.view.ppu;
    const Y = y => h / 2 - (y - R.view.cy) * R.view.ppu;

    function bake() {
      const C = Plot.colors(), S = R.surf;
      const o = off.getContext('2d');
      o.setTransform(1, 0, 0, 1, 0, 0); o.clearRect(0, 0, off.width, off.height);
      const cell = 4, nx = Math.ceil(w / cell) + 1, ny = Math.ceil(h / cell) + 1;
      const F = new Float64Array(nx * ny);
      for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
        F[j * nx + i] = S.f(R.view.cx + (i * cell - w / 2) / R.view.ppu, R.view.cy - (j * cell - h / 2) / R.view.ppu);
      }
      // shading: low = paper, high = a light grey
      const tmp = document.createElement('canvas'); tmp.width = nx; tmp.height = ny;
      const tctx = tmp.getContext('2d'), img = tctx.createImageData(nx, ny);
      const base = Plot.rgb(C.paper), top = Plot.rgb(C.muted);
      for (let q = 0; q < nx * ny; q++) {
        const t = Math.max(0, Math.min(1, S.shade(F[q])));
        const c = Plot.mix(base, top, 0.03 + 0.3 * t);
        img.data[4 * q] = c[0]; img.data[4 * q + 1] = c[1]; img.data[4 * q + 2] = c[2]; img.data[4 * q + 3] = 255;
      }
      tctx.putImageData(img, 0, 0);
      o.setTransform(cv.R, 0, 0, cv.R, 0, 0);
      o.imageSmoothingEnabled = true;
      o.drawImage(tmp, -cell / 2, -cell / 2, nx * cell, ny * cell);
      // contour lines (marching squares)
      o.strokeStyle = Plot.alpha(C.muted, 0.5); o.lineWidth = 2; o.lineCap = 'round';
      o.beginPath();
      S.levels.forEach(lv => {
        for (let j = 0; j + 1 < ny; j++) for (let i = 0; i + 1 < nx; i++) {
          const a = F[j * nx + i] - lv, b = F[j * nx + i + 1] - lv, c = F[(j + 1) * nx + i + 1] - lv, d = F[(j + 1) * nx + i] - lv;
          const pts = [];
          if ((a > 0) !== (b > 0)) pts.push([(i + a / (a - b)) * cell, j * cell]);
          if ((b > 0) !== (c > 0)) pts.push([(i + 1) * cell, (j + b / (b - c)) * cell]);
          if ((d > 0) !== (c > 0)) pts.push([(i + d / (d - c)) * cell, (j + 1) * cell]);
          if ((a > 0) !== (d > 0)) pts.push([i * cell, (j + a / (a - d)) * cell]);
          for (let k = 0; k + 1 < pts.length; k += 2) { o.moveTo(pts[k][0], pts[k][1]); o.lineTo(pts[k + 1][0], pts[k + 1][1]); }
        }
      });
      o.stroke();
      // landmarks
      S.marks.forEach(m => {
        const px = X(m.x), py = Y(m.y);
        o.strokeStyle = C.ink; o.lineWidth = 4;
        o.beginPath(); o.moveTo(px - 12, py); o.lineTo(px + 12, py); o.moveTo(px, py - 12); o.lineTo(px, py + 12); o.stroke();
        o.font = `600 28px ${C.fontBody}`; o.textAlign = 'center'; o.textBaseline = 'middle';
        o.fillStyle = C.ink; o.fillText(m.label, px + (m.dx || 0), py + (m.dy || 0));
      });
      const [sx0, sy0] = S.start;
      o.strokeStyle = C.ink; o.lineWidth = 4;
      o.beginPath(); o.arc(X(sx0), Y(sy0), 14, 0, 2 * Math.PI); o.stroke();
      o.font = `600 28px ${C.fontBody}`; o.fillStyle = C.ink; o.textAlign = 'right';
      o.fillText('start', X(sx0) - 24, Y(sy0));
      o.strokeStyle = C.rule; o.lineWidth = 2; o.strokeRect(1, 1, w - 2, h - 2);
    }

    function draw() {
      const C = Plot.colors(), ctx = cv.ctx;
      cv.clear();
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(off, 0, 0); ctx.restore();
      ctx.save();
      Plot.clip(ctx, 0, 0, w, h);
      R.racers.forEach(r => {
        if (r.off) return;
        ctx.globalAlpha = r.dim ? 0.3 : 1;
        const s = STYLE[r.kind];
        ctx.strokeStyle = C.grad; ctx.lineWidth = s.width; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.setLineDash(s.dash);
        ctx.beginPath();
        r.path.forEach((p, i) => (i ? ctx.lineTo(X(p[0]), Y(p[1])) : ctx.moveTo(X(p[0]), Y(p[1]))));
        ctx.stroke(); ctx.setLineDash([]);
      });
      R.racers.forEach(r => {
        if (r.off) return;
        ctx.globalAlpha = r.dim ? 0.3 : 1;
        const px = X(r.p[0]), py = Y(r.p[1]);
        ctx.beginPath(); ctx.arc(px, py, 12, 0, 2 * Math.PI);
        ctx.fillStyle = C.grad; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = C.paper; ctx.stroke();
        if (r.label !== false) {
          const [dx, dy, al] = LABEL_AT[r.kind];
          halo(ctx, r.name, px + dx, py + dy, { size: 32, weight: 700, color: C.grad, align: al });
        }
      });
      ctx.restore();
    }

    function stepAll() {
      const S = R.surf;
      R.racers.forEach(r => {
        if (r.off || r.dead || (r.stopAtTol && r.doneAt != null)) return;
        const g = S.g(r.p[0], r.p[1]);
        r.g[0] = g[0]; r.g[1] = g[1];
        r.opt.step([r.p], [r.g]);
        r.loss = S.f(r.p[0], r.p[1]);
        if (!isFinite(r.loss) || Math.abs(r.p[0]) + Math.abs(r.p[1]) > 1e6) r.dead = true;
        r.path.push([r.p[0], r.p[1]]);
        if (r.tol != null && r.doneAt == null && r.loss < r.tol) r.doneAt = R.k + 1;
      });
      R.k++;
    }

    R.set = function (cfg) {
      R.surf = SURF[cfg.surf]; R.view = cfg.view; R.steps = cfg.steps || 100; R.sps = cfg.sps || 16;
      R.mode = cfg.mode || 'loss';
      R.defs = cfg.racers;
      bake(); R.reset();
    };
    R.reset = function () {
      R.k = 0; R.acc = 0; R.playing = false;
      R.racers = R.defs.map(d => {
        const r = Object.assign({}, d);
        r.p = new Float64Array(R.surf.start); r.g = new Float64Array(2);
        r.opt = NN.optimizer(d.kind, { lr: d.lr, beta: 0.9, b1: 0.9, b2: 0.999 });
        r.path = [[r.p[0], r.p[1]]]; r.loss = R.surf.f(r.p[0], r.p[1]); r.doneAt = null; r.dead = false;
        return r;
      });
      draw(); R.ticks.forEach(fn => fn(R));
    };
    R.play = function () { if (R.k >= R.steps) R.reset(); R.playing = true; R.ticks.forEach(fn => fn(R)); };
    R.pause = function () { R.playing = false; R.ticks.forEach(fn => fn(R)); };
    R.onTick = fn => R.ticks.push(fn);
    R.draw = draw;
    api.loop(dt => {
      if (!R.playing) return true;
      R.acc += dt * R.sps;
      let n = Math.floor(R.acc); R.acc -= n;
      if (n > 0) {
        while (n-- > 0 && R.k < R.steps) stepAll();
        if (R.k >= R.steps) R.playing = false;
        draw(); R.ticks.forEach(fn => fn(R));
      }
      return true;
    });
    api.onTheme(() => { if (R.surf) { bake(); draw(); } });
    return R;
  }

  // side column with one readout row per racer + Run/Reset
  function raceSide(side, R, kinds) {
    const head = document.createElement('div');
    head.className = 'rhead';
    head.innerHTML = '<span>step</span><span class="rh-v">loss</span>';
    const stepEl = document.createElement('div');
    stepEl.className = 'stepno';
    const list = document.createElement('div');
    list.className = 'racers';
    const rows = {};
    kinds.forEach(k => {
      const d = document.createElement('div');
      d.className = 'rc';
      d.innerHTML = `${swatch(k)}<span class="nm"></span><span class="v">–</span>`;
      list.appendChild(d);
      rows[k] = d;
    });
    side.append(stepEl, head, list);
    const ctl = document.createElement('div');
    ctl.className = 'ctl';
    side.appendChild(ctl);
    const row = UI.row(ctl);
    const run = UI.button(row, 'Run', () => (R.playing ? R.pause() : R.play()), { kind: 'primary' });
    UI.button(row, 'Reset', () => R.reset());
    R.onTick(() => {
      stepEl.textContent = R.k + ' / ' + R.steps;
      run.textContent = R.playing ? 'Pause' : 'Run';
      head.querySelector('.rh-v').textContent = R.mode === 'arrive' ? 'steps to a bottom' : 'loss';
      kinds.forEach(k => {
        const r = R.racers.find(x => x.kind === k), el = rows[k];
        el.classList.toggle('off', !r || !!r.off);
        el.classList.toggle('dim', !!(r && r.dim));
        if (!r) return;
        el.querySelector('.nm').innerHTML = `${r.name}<small>lr ${r.lr}</small>`;
        el.querySelector('.v').textContent = r.dead ? 'blew up'
          : R.mode === 'arrive' ? (r.doneAt != null ? String(r.doneAt) : '–') : fmtLoss(r.loss);
      });
    });
  }

  /* =================================================================== */

  Deck.slide({
    id: 'opt-recall',
    title: 'After the break: six questions',
    html: `
    <h2>From memory: six questions, no notes</h2>
    <div class="quiz">
      ${[
        ['Why must there be an activation between layers?', 'Without it, 10 layers collapse into 1 linear layer.'],
        ['Steepest slope of the sigmoid?', '0.25, in the middle (z = 0)'],
        [`How many numbers does ${Code.i('nn.Linear(8, 8)')} learn?`, '72 = 64 weights + 8 biases'],
        ['First loss of a fresh yes/no network?', '≈ 0.69 (= ln 2)'],
        ["Adam's default learning rate?", '0.001'],
        ['Name one thing the universal approximation theorem does NOT promise.', 'That training finds them · how many neurons · right on new data'],
      ].map(([q, a], i) => `
        <div class="qz"><span class="n">Q${i + 1}</span><div class="q">${q}</div><div class="a" data-step="${i + 1}">${a}</div></div>`).join('')}
    </div>`,
    notes: `
    <p class="time">3 min</p>
    <p class="say">Welcome back. Before we go on, six quick questions about the first half. Write your answers on paper, alone, no notes. You have two minutes. Getting them wrong now is fine: trying to remember is what makes it stick.</p>
    <p class="do">Give 2 minutes of silence. Then press → six times; each press reveals one answer. For each, ask for a show of hands "who had it?" before you say why.</p>
    <ul>
      <li><b>Q1</b>: two linear layers in a row are just one linear layer (multiply two matrices and you get one matrix), so the network can still only draw a straight line. The activation bends it.</li>
      <li><b>Q2</b>: the sigmoid is steepest in the middle, slope 0.25. Through 10 sigmoid layers the gradient shrinks by at least 0.25¹⁰ ≈ one millionth: vanishing gradients.</li>
      <li><b>Q3</b>: an 8×8 weight matrix (64) plus 8 biases = 72.</li>
      <li><b>Q4</b>: a fresh network says "50/50" for everything, and −ln(0.5) = 0.693. If your first printed loss is 2 or 50, something is broken.</li>
      <li><b>Q5</b>: 0.001 (written 1e-3), both in the Adam paper and in PyTorch. Today we will see why it is a default, not a law.</li>
      <li><b>Q6</b>: the theorem only says good weights exist for a wide enough network. It does not say gradient descent will find them, how many neurons you need, or that the network will be right on new data or outside the region you trained on.</li>
    </ul>
    <p>If many students miss Q1 or Q4, spend 30 more seconds there: both come back in the next hour.</p>`,
  });

  /* ------------------------------------------------------------------ */
  const PAPER_VIEW = { w0: -1, w1: 5, L1: 17, nx: 6, tanLen: 1.1 };
  Deck.slide({
    id: 'opt-paper',
    title: 'One step downhill, on paper',
    html: `
    <h2>Each step: move against the slope</h2>
    <div class="demo">
      <div class="opt-paper-cv"></div>
      <div class="side">
        <span class="tag tag-paper">on paper</span>
        <p class="lead">Ball at <b>w = 0</b>, learning rate <b>0.1</b>.<br>Where does it go?</p>
        <div class="kv" data-step="1"><span>slope</span><b class="grad">−6</b></div>
        <div class="kv" data-step="2"><span>move</span><b class="grad">0.1 × 6 = 0.6</b></div>
        <div class="kv" data-step="3"><span>new w</span><b>0.6</b></div>
        <p class="eq" data-step="4">new <i>w</i> = <i>w</i> − lr × slope</p>
      </div>
    </div>`,
    init(el, api) {
      const cv = Plot.canvas(el.querySelector('.opt-paper-cv'), 768, 768);
      const draw = () => {
        const k = api.step;
        drawBowl(cv, PAPER_VIEW, {
          path: k >= 3 ? [0, 0.6] : [0],
          tangent: k >= 1 && k < 3 ? 0 : null,
          stepArrow: k >= 2 && k < 3 ? [0, 0.6] : null,
        });
      };
      draw();
      api.onStep(draw);
      api.onTheme(draw);
    },
    notes: `
    <p class="time">2 min</p>
    <p class="say">Gradient descent with one weight. The loss is this bowl, lowest at w = 3. Our ball sits at w = 0. The rule is: look at the slope under your feet, and step the other way. How far? Learning rate times slope.</p>
    <p class="do">Ask the question first and let everyone write a number. Then → (1): the dashed magenta line is the slope at w = 0: −6 (the bowl goes down to the right). → (2): move = 0.1 × 6 = 0.6, to the right because the slope is negative. → (3): the ball is now at w = 0.6. → (4): the whole rule in one line.</p>
    <p class="ask">The slope is −6. Which way do we move, and why "minus" slope?</p>
    <p class="ans">Right. A negative slope means "downhill is to the right", so we move by −lr × slope = +0.6. The minus sign always turns "uphill" into "downhill".</p>
    <p>Maths for you (do not put on the board unless asked): loss = (w − 3)², slope = 2(w − 3) = −6 at w = 0, new w = 0 − 0.1 × (−6) = 0.6. The next steps are 1.08, 1.464, … approaching 3. Picture for students: a hiker in thick fog who only feels the slope under their boots. Fun fact: this method is from Augustin-Louis Cauchy, 1847, a century before neural networks.</p>`,
  });

  /* ------------------------------------------------------------------ */
  Deck.slide({
    id: 'opt-lr',
    title: 'The learning rate, live',
    html: `
    <h2>Too small crawls, too big explodes</h2>
    <div class="demo">
      <div class="opt-lr-cv"></div>
      <div class="side">
        <div class="ui-row opt-lr-ro"></div>
        <div class="opt-lr-mini"></div>
        <div class="verdict opt-lr-verdict"></div>
        <div class="ctl opt-lr-ctl"></div>
      </div>
    </div>`,
    init(el, api) {
      const VIEW = { w0: -3, w1: 9, L1: 40, nx: 6, tanLen: 1 };
      const MAX = 40;
      const cv = Plot.canvas(el.querySelector('.opt-lr-cv'), 768, 768);
      const mini = Plot.canvas(el.querySelector('.opt-lr-mini'), 864, 250);
      const ro = el.querySelector('.opt-lr-ro');
      const R = { step: UI.readout(ro, 'step'), w: UI.readout(ro, 'w'), loss: UI.readout(ro, 'loss') };
      const verdict = el.querySelector('.opt-lr-verdict');
      const S = { lr: 0.3, path: [0], playing: false, acc: 0 };
      const ctl = el.querySelector('.opt-lr-ctl');
      UI.choice(ctl, [0.02, 0.3, 0.9, 1.05].map(v => ({ value: v, label: String(v) })), S.lr, v => { S.lr = v; reset(); }, { label: 'learning rate' });
      const row = UI.row(ctl);
      const run = UI.button(row, 'Run', () => { if (S.path.length > MAX || blown()) reset(); S.playing = !S.playing; sync(); }, { kind: 'primary' });
      UI.button(row, '+1 step', () => { if (!blown() && S.path.length <= MAX) { stepOnce(); draw(); } });
      UI.button(row, 'Reset', () => reset());
      const blown = () => Math.abs(S.path[S.path.length - 1] - 3) > 12;
      function stepOnce() { const w = S.path[S.path.length - 1]; S.path.push(w - S.lr * 2 * (w - 3)); }
      function sync() { run.textContent = S.playing ? 'Pause' : 'Run'; }
      function reset() { S.path = [0]; S.playing = false; S.acc = 0; sync(); draw(); }
      function drawMini() {
        const C = Plot.colors(), ctx = mini.ctx;
        mini.clear();
        const sx = Plot.scale(0, MAX, 70, 840), sy = Plot.scale(-2, 8, 200, 18);
        Plot.axes(ctx, sx, sy, { font: 26, nx: 4, ny: 2, yt: [0, 3, 6], xlabel: 'step', ylabel: 'w', zero: false });
        ctx.save(); ctx.setLineDash([12, 10]); ctx.strokeStyle = C.muted; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(sx(0), sy(3)); ctx.lineTo(sx(MAX), sy(3)); ctx.stroke(); ctx.restore();
        ctx.save(); Plot.clip(ctx, 64, 14, 850, 206);
        ctx.strokeStyle = C.grad; ctx.lineWidth = 4; ctx.lineJoin = 'round';
        ctx.beginPath();
        S.path.forEach((w, k) => (k ? ctx.lineTo(sx(k), sy(w)) : ctx.moveTo(sx(k), sy(w))));
        ctx.stroke();
        S.path.forEach((w, k) => Plot.dot(ctx, sx(k), sy(w), 5, C.grad));
        ctx.restore();
      }
      function draw() {
        drawBowl(cv, VIEW, { path: S.path });
        drawMini();
        const n = S.path.length - 1, w = S.path[n];
        R.step.set(n); R.w.set(Math.abs(w) > 999 ? '∞' : minus(w.toFixed(2))); R.loss.set(fmtLoss(L1(w)));
        let first = -1;
        for (let k = 0; k <= n; k++) if (Math.abs(S.path[k] - 3) < 0.01) { first = k; break; }
        if (blown()) verdict.innerHTML = `<span class="bad">✗ blew up</span>`;
        else if (first >= 0) verdict.innerHTML = `<span class="ok">✓</span> at the bottom after ${first} steps`;
        else if (n >= MAX) verdict.innerHTML = `still ${Math.abs(w - 3).toFixed(1)} away after ${MAX} steps`;
        else verdict.innerHTML = '';
      }
      api.loop(dt => {
        if (!S.playing) return true;
        S.acc += dt * 5;
        if (S.acc >= 1) {
          S.acc -= 1;
          if (S.path.length > MAX || blown()) { S.playing = false; sync(); } else stepOnce();
          draw();
        }
        return true;
      });
      draw();
      api.onTheme(draw);
    },
    notes: `
    <p class="time">2.5 min</p>
    <p class="say">Training means rolling downhill on the loss. This bowl is the loss of one weight w, lowest at 3; each step moves the ball against the slope, by learning rate × slope. We change only the learning rate.</p>
    <p class="do">For each value ask "what will happen?", then click it and press <b>Run</b>. Order: 0.3, 0.02, 0.9, 1.05.</p>
    <ul>
      <li><b>0.3</b>: at the bottom in 7 steps.</li>
      <li><b>0.02</b>: crawls; still 0.6 away after 40 steps.</li>
      <li><b>0.9</b>: overshoots every step, but arrives (26 steps).</li>
      <li><b>1.05</b>: every jump is bigger: it blows up (in real training the loss becomes NaN).</li>
    </ul>
    <p class="ask">Which learning rate would be fastest here?</p>
    <p class="ans">0.5: one step lands on the bottom. A steeper bowl lowers every limit, so there is no universal right value.</p>`,
  });

  /* ------------------------------------------------------------------ */
  const MANUAL = `
    import torch
    w = torch.tensor(0.0, requires_grad=True)
    for step in range(3):
        loss = (w - 3) ** 2
        loss.backward()           # w.grad = -6
        with torch.no_grad():
            w -= 0.1 * w.grad     # 0 -> 0.6
        w.grad.zero_()            # forget it
        print(round(w.item(), 3))`;
  Deck.slide({
    id: 'opt-torch',
    title: 'The same step in PyTorch',
    html: `
    <h2>The same step in PyTorch</h2>
    <div class="t-code">
      ${Code.py(MANUAL, { hl: '1:2 2:4-5 3:6-7 4:8 5:9' })}
      <div class="stack effect">
        <div data-only="1"><p>PyTorch, please track slopes for <b>w</b>.</p><p class="bigv">w = 0</p></div>
        <div data-only="2"><p>Backward fills in the slope.</p><p class="bigv grad">w.grad = −6</p></div>
        <div data-only="3"><p>The step itself, not tracked.</p><p class="bigv">w: 0 → 0.6</p></div>
        <div data-only="4"><p>Clear it, or the next slope is <b>added</b> to this one.</p><p class="bigv grad">w.grad = 0</p></div>
        <div data-only="5"><p>Output:</p><p class="bigv">0.6<br>1.08<br>1.464</p></div>
      </div>
    </div>`,
    notes: `
    <p class="time">1.5 min</p>
    <p class="say">Here is exactly the paper step, written in PyTorch. Three steps of the loop give 0.6, 1.08 and 1.464, the same numbers you would get by hand. Every training loop you will ever write is this loop with more weights.</p>
    <p class="do">Press → five times; each press highlights a line and shows its effect on the right.</p>
    <ul>
      <li>(1) <b>requires_grad=True</b>: "I will want the slope of the loss with respect to w".</li>
      <li>(2) compute the loss, then <b>loss.backward()</b>: PyTorch runs backprop and stores the slope in <b>w.grad</b> (−6).</li>
      <li>(3) the update, inside <b>torch.no_grad()</b> so that PyTorch does not try to differentiate the update itself.</li>
      <li>(4) <b>w.grad.zero_()</b>: PyTorch <i>adds</i> new gradients to old ones. Without this line the second step would use −6 + (−4.8) instead of −4.8.</li>
      <li>(5) the printout: 0.6, 1.08, 1.464 (tested in PyTorch).</li>
    </ul>
    <p class="ask">What goes wrong if we delete line 8?</p>
    <p class="ans">The slopes pile up: each step uses the sum of all slopes so far, so the steps get bigger and bigger and overshoot. We will see this bug again on Kobe in the next section (forgetting zero_grad).</p>`,
  });

  /* ------------------------------------------------------------------ */
  Deck.slide({
    id: 'opt-batch',
    title: 'Epoch, batch, step',
    html: `
    <h2>One step per batch, not per epoch</h2>
    <div class="col" style="gap:20px">
      ${(() => {
        const W = 1728, n = 322, sw = W * 64 / 20558, lastW = W * 14 / 20558;
        let s = `<svg class="dg" viewBox="0 0 ${W} 440" width="${W}" height="440" role="img" aria-label="20,558 shots cut into 322 batches of 64">`;
        s += `<path d="M2,62 V36 H${W - 2} V62" style="fill:none;stroke:var(--ink);stroke-width:3"/>`;
        s += `<rect x="${W / 2 - 440}" y="8" width="880" height="48" style="fill:var(--paper)"/>`;
        s += `<text class="lbl" x="${W / 2}" y="32" style="font-size:36px">1 epoch = all 20,558 training shots</text>`;
        s += `<rect class="t-data" x="1.5" y="80" width="${W - 3}" height="64"/>`;
        let sl = '';
        for (let i = 0; i < n - 1; i++) if (i % 2) sl += `<rect x="${i * sw}" y="80" width="${sw}" height="64" style="fill:var(--rule)"/>`;
        s += `<g data-step="1">${sl}`;
        s += `<rect x="0" y="76" width="${Math.max(6, sw)}" height="72" style="fill:var(--ink)"/>`;
        s += `<rect x="${W - Math.max(4, lastW)}" y="76" width="${Math.max(4, lastW)}" height="72" style="fill:var(--ink)"/>`;
        // zoom: first batch (64 shots)
        s += `<path d="M0,148 L40,200 M${sw},148 L296,200" style="stroke:var(--muted);stroke-width:2;fill:none"/>`;
        s += `<rect x="40" y="200" width="256" height="232" style="fill:var(--paper);stroke:var(--ink);stroke-width:3"/>`;
        for (let i = 0; i < 64; i++) {
          const cx = 62 + (i % 8) * 30, cy = 222 + Math.floor(i / 8) * 27;
          s += `<circle cx="${cx}" cy="${cy}" r="10" style="fill:var(${KOBE.Y[i] ? '--c1' : '--c0'});stroke:var(--paper);stroke-width:2"/>`;
        }
        s += `<text class="lbl-b" x="330" y="260" style="text-anchor:start">1 batch = 64 shots</text>`;
        s += `<text class="lbl-g" x="330" y="316" style="text-anchor:start;font-size:40px">→ 1 step</text>`;
        // zoom: last batch (14 shots)
        s += `<path d="M${W - 3},148 L${W},200 M${W - 3},148 L${W - 230},200" style="stroke:var(--muted);stroke-width:2;fill:none"/>`;
        s += `<rect x="${W - 230}" y="200" width="228" height="86" style="fill:var(--paper);stroke:var(--ink);stroke-width:3"/>`;
        for (let i = 0; i < 14; i++) {
          const cx = W - 206 + (i % 7) * 30, cy = 224 + Math.floor(i / 7) * 38;
          s += `<circle cx="${cx}" cy="${cy}" r="10" style="fill:var(${KOBE.Y[100 + i] ? '--c1' : '--c0'});stroke:var(--paper);stroke-width:2"/>`;
        }
        s += `<text class="lbl" x="${W - 116}" y="320">last batch: 14</text>`;
        s += `<text class="lbl-b" x="${W / 2 + 120}" y="380" style="font-size:56px">322 steps per epoch</text>`;
        s += `</g></svg>`;
        return s;
      })()}
      <div class="row" data-step="2" style="gap:28px"><span class="tag tag-predict">predict</span><span class="lead">30 epochs. Batches of 64, or all 20,558 at once?</span></div>
      <div class="cmp" data-step="3">
        <span></span><span class="hd">steps taken</span><span class="hd">validation loss</span>
        <span>batches of 64</span><div class="bw"><div class="bar" style="width:640px"></div><span>9,660</span></div><span><b>0.662</b> <span class="ok">✓ learned</span></span>
        <span>all at once</span><div class="bw"><div class="bar" style="width:6px"></div><span>30</span></div><span><b>0.688</b> <span class="bad">✗ = guessing</span></span>
      </div>
    </div>`,
    notes: `
    <p class="time">2 min</p>
    <p class="say">An <b>epoch</b> is one pass over all the training shots. A <b>batch</b> is a handful of them, here 64. After every batch we take one <b>step</b>: one update of all the weights.</p>
    <p class="do">→ (1): the zoom shows one batch of real shots; let the class compute the steps per epoch first. → (2): take the vote. → (3): our Kobe runs.</p>
    <p class="ask">20,558 shots in batches of 64: how many steps per epoch?</p>
    <p class="ans">322 (the last batch has 14 shots), so 9,660 steps in 30 epochs.</p>
    <p class="say">Batches of 64 learn (0.662); all shots at once takes only 30 steps and is no better than guessing (0.688). Count steps, not epochs.</p>
    <p>A slope from 64 random shots is noisy but honest, and 300 times cheaper. (The notebook has 20,000 training shots: 313 steps per epoch.)</p>`,
  });

  /* ------------------------------------------------------------------ */
  Deck.slide({
    id: 'opt-scale',
    title: 'Scale your inputs: a round bowl',
    html: `
    <h2>Scaled inputs make a round bowl</h2>
    <div class="pair">
      <div><h3>raw Kobe x, y: in the hundreds</h3><div class="opt-sc-a"></div><div class="res opt-sc-ra"></div></div>
      <div><h3>scaled: (x − mean) / std</h3><div class="opt-sc-b"></div><div class="res opt-sc-rb"></div></div>
    </div>
    <div class="ui-row opt-sc-ctl" style="position:absolute;right:96px;bottom:72px"></div>`,
    init(el, api) {
      const view = { cx: 0, cy: 0, ppu: 64 };
      const A = Race(api, el.querySelector('.opt-sc-a'), 816, 576);
      const B = Race(api, el.querySelector('.opt-sc-b'), 816, 576);
      A.set({ surf: 'valley', view, steps: 300, sps: 40, racers: [{ kind: 'sgd', lr: 0.019, name: 'lr 0.019', label: false, tol: 1e-3, stopAtTol: true }] });
      B.set({ surf: 'bowl', view, steps: 300, sps: 40, racers: [{ kind: 'sgd', lr: 0.5, name: 'lr 0.5', label: false, tol: 1e-3, stopAtTol: true }] });
      const out = (R, node) => R.onTick(() => {
        const r = R.racers[0];
        node.innerHTML = `<span class="muted">${r.name} ·</span> ` + (r.doneAt != null ? `<span class="ok">✓</span> bottom after ${r.doneAt} steps` : (R.k ? `step ${R.k}…` : 'ready'));
      });
      out(A, el.querySelector('.opt-sc-ra'));
      out(B, el.querySelector('.opt-sc-rb'));
      A.reset(); B.reset();
      const ctl = el.querySelector('.opt-sc-ctl');
      const run = UI.button(ctl, 'Run', () => {
        const go = !(A.playing || B.playing);
        [A, B].forEach(R => { if (go) { if (R.racers[0].doneAt != null || R.k >= R.steps) R.reset(); R.play(); } else R.pause(); });
        run.textContent = go ? 'Pause' : 'Run';
      }, { kind: 'primary' });
      UI.button(ctl, 'Reset', () => { A.reset(); B.reset(); run.textContent = 'Run'; });
      A.onTick(() => { if (!A.playing && !B.playing) run.textContent = 'Run'; });
      // stop each side as soon as it reaches the bottom
      [A, B].forEach(R => R.onTick(() => { if (R.racers[0].doneAt != null && R.playing) R.pause(); }));
    },
    notes: `
    <p class="time">1.5 min</p>
    <p class="say">Kobe's coordinates are in tenths of feet: x goes from −250 to 248, y up to 791. Big, unequal inputs stretch the loss bowl into a long narrow valley. On the left, gradient descent zig-zags across the narrow direction and crawls along the long one. On the right we first subtract the mean and divide by the spread of each input: the bowl becomes round and the same algorithm walks straight to the bottom.</p>
    <p class="do">Ask "which side gets to the bottom first, and by how much?" Then press <b>Run</b>. The right side finishes almost immediately (7 steps); the left zig-zags and needs 246 steps.</p>
    <p class="ask">Why not just use a bigger learning rate on the left?</p>
    <p class="ans">The steep direction (up and down) explodes as soon as lr goes above 0.02, exactly like lr 1.05 on the last demo. The steepest direction sets the speed limit, and the flat direction then crawls. On the round bowl both directions are equally steep, so lr 0.5 is safe.</p>
    <p>How bad is it on real data? For logistic regression on Kobe's raw coordinates, the steepest direction of the bowl is about 30,000 times steeper than the flattest; after standardising, the ratio is about 1.04 (our numerical check on data_train.csv). In the next section you will see the symptom in code: with raw inputs the first loss is 2.33 instead of 0.69. Rule: compute mean and std on the training data only, and apply the same numbers to validation and test (LeCun et al., "Efficient BackProp", 1998).</p>
    <p>The toy surfaces here: left 0.5(x² + 100y²), right 0.5(x² + y²), same start (−5, 1.5).</p>`,
  });

  /* ------------------------------------------------------------------ */
  const RACERS = [
    { kind: 'sgd', name: 'SGD', lr: 0.019 },
    { kind: 'momentum', name: 'momentum', lr: 0.01 },
    { kind: 'adam', name: 'Adam', lr: 0.1 },
  ];
  const VALLEY_VIEW = { cx: 0, cy: 0, ppu: 92 };
  Deck.slide({
    id: 'opt-race',
    title: 'Race in a narrow valley',
    html: `
    <div class="stack">
      <h2 data-only="0">Plain descent zig-zags in a narrow valley</h2>
      <h2 data-only="1">Momentum: a heavy ball keeps rolling</h2>
      <h2 data-only="2">Adam: each weight gets its own step size</h2>
    </div>
    <div class="demo wide">
      <div class="opt-race-cv"></div>
      <div class="side opt-race-side"></div>
    </div>`,
    init(el, api) {
      const R = Race(api, el.querySelector('.opt-race-cv'), 1104, 720);
      raceSide(el.querySelector('.opt-race-side'), R, ['sgd', 'momentum', 'adam']);
      let last = -1;
      const config = k => {
        if (k === last) return;
        last = k;
        R.set({
          surf: 'valley', view: VALLEY_VIEW, steps: 100, sps: 16,
          racers: RACERS.slice(0, k + 1).map((r, i) => Object.assign({}, r, { dim: i < k })),
        });
        if (k > 0) R.play();
      };
      config(0);
      api.onStep(config);
    },
    notes: `
    <p class="time">2.5 min</p>
    <p class="say">A loss surface seen from above, like a map: a long, narrow valley, steep across and almost flat along, with the bottom at the cross. Three optimizers race from the same start.</p>
    <p class="do">Ask "predict the path", then press <b>Run</b>: plain gradient descent (SGD, dotted) zig-zags, then crawls. Each → adds a racer (momentum dashed, then Adam solid) and restarts the race.</p>
    <ul>
      <li><b>Momentum</b> = a heavy ball: side-to-side pushes cancel, pushes along the floor add up. It overshoots, then ends closest.</li>
      <li><b>Adam</b> = its own step size for each weight: small across the steep walls, big along the flat floor, so it goes almost straight.</li>
    </ul>
    <p class="ask">Pair task (1 min): describe one walk to your neighbour; they name the optimizer.</p>
    <p class="ans">Zig-zag, then crawl: SGD. Speeds up and overshoots: momentum. Fairly straight: Adam.</p>
    <p>The learning rates are toy values for this surface, not real-network defaults.</p>`,
  });

  /* ------------------------------------------------------------------ */
  Deck.slide({
    id: 'opt-honest',
    title: 'Adam is not magic',
    html: `
    <div class="stack">
      <h2 data-only="0">Turn the valley 45°: who wins now?</h2>
      <h2 data-only="1">Tilted valley: Adam loses its edge</h2>
      <h2 data-only="2">At a saddle, momentum and Adam escape first</h2>
    </div>
    <div class="demo wide">
      <div class="opt-hon-cv"></div>
      <div class="side opt-hon-side"></div>
    </div>`,
    init(el, api) {
      const R = Race(api, el.querySelector('.opt-hon-cv'), 1104, 720);
      raceSide(el.querySelector('.opt-hon-side'), R, ['sgd', 'momentum', 'adam']);
      let surf = '';
      const config = k => {
        const want = k < 2 ? 'tilted' : 'saddle';
        if (want === surf) { if (k === 1 && R.k === 0 && !R.playing) R.play(); return; }
        surf = want;
        if (want === 'tilted') {
          R.set({ surf: 'tilted', view: { cx: -0.8, cy: -0.6, ppu: 92 }, steps: 100, sps: 16, racers: RACERS.map(r => Object.assign({}, r)) });
          if (k === 1) R.play();
        } else {
          R.set({ surf: 'saddle', view: { cx: 0, cy: 0, ppu: 158 }, steps: 150, sps: 25, mode: 'arrive',
            racers: RACERS.map(r => Object.assign({}, r, { lr: 0.05, tol: 0.05 })) });
          R.play();
        }
      };
      config(0);
      api.onStep(config);
    },
    notes: `
    <p class="time">2 min</p>
    <p class="say">Is Adam simply the best? Here is the same valley, only turned by 45 degrees. Nothing else changed: same start distance, same learning rates.</p>
    <p class="do">Ask "who wins now?" and take a vote. Then → (1): the headline changes and the race starts (or press <b>Run</b>). SGD and momentum behave exactly as before (they do not care how the valley is turned; final losses 0.27 and 0.0003 again). Adam now zig-zags across the valley and crawls along it: after 100 steps it is still far from the bottom (loss about 7, much worse than plain SGD).</p>
    <p class="ask">Why does turning the valley hurt Adam?</p>
    <p class="ans">Adam gives each weight (each axis: left-right, up-down) its own step size. That only helps when the steep direction lines up with an axis. In the tilted valley the steep direction is diagonal, so both axes look equally steep and Adam's trick no longer helps; worse, the big wall-to-wall slopes make it shrink its steps along the floor too. Adam is a strong default, not magic.</p>
    <p class="do">→ (2) switches to a <b>saddle</b> and starts the race: downhill to the top and bottom, uphill to the left and right, with the start almost exactly on the ridge. All three use lr 0.05. The right column now shows after how many steps each one reached a bottom.</p>
    <p class="say">Plain SGD walks straight into the saddle and sits there, because the slope that would push it off is almost zero. Adam leaves the saddle first (after about 11 steps), because it turns even a tiny slope into a normal-sized step; momentum leaves after about 25, SGD only after about 66. They reach a bottom after 41 (Adam), 34 (momentum) and 82 (SGD) steps. Big networks have many saddles and flat regions, which is one reason momentum and Adam are popular.</p>
    <p>Surfaces: tilted valley = the same 0.5(u² + 100v²) in rotated coordinates; saddle = x² − y² + y⁴/4 + 1 from (−1.8, 0.001), saddle point at (0, 0) with loss 1, bottoms at (0, ±1.41) with loss 0. If the start were exactly on the ridge (y = 0), nobody would escape: in real training the noise from mini-batches gives the kick.</p>`,
  });

  /* ------------------------------------------------------------------ */
  Deck.slide({
    id: 'opt-adam-step',
    title: "Predict: Adam's first step",
    html: `
    <div class="row" style="gap:32px"><span class="tag tag-predict">predict</span><h2>lr 0.001: how far does each weight move?</h2></div>
    ${(() => {
      const P = [{ x: 250, t: 'slope 1000' }, { x: 776, t: 'slope 1' }, { x: 1302, t: 'slope 0.001' }];
      const unit = 70; // 0.001 of movement is drawn this long
      let s = `<svg class="dg" viewBox="0 0 1728 600" width="1728" height="600" role="img" aria-label="three weights on slopes 1000, 1 and 0.001">`;
      s += `<text class="lbl-b" x="0" y="440" style="text-anchor:start" data-step="1">plain</text>`;
      s += `<text class="lbl-b" x="0" y="550" style="text-anchor:start" data-step="2">Adam</text>`;
      P.forEach((p, i) => {
        const gx = p.x, ground = 330;
        s += `<text class="lbl-b" x="${gx + 200}" y="30">${p.t}</text>`;
        s += `<line x1="${gx}" y1="${ground}" x2="${gx + 420}" y2="${ground}" style="stroke:var(--muted);stroke-width:2.5"/>`;
        let x0, y0, x1, y1;
        if (i === 0) { x0 = gx + 150; y0 = 70; x1 = gx + 190; y1 = ground; }
        else if (i === 1) { x0 = gx + 20; y0 = 90; x1 = gx + 260; y1 = ground; }
        else { x0 = gx + 10; y0 = ground - 40; x1 = gx + 410; y1 = ground - 26; }
        s += `<line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}" style="stroke:var(--ink);stroke-width:6;stroke-linecap:round"/>`;
        // ball resting on the ramp: offset from the surface along its upward normal
        const bx = x0 + (x1 - x0) * 0.45, by = y0 + (y1 - y0) * 0.45, len = Math.hypot(x1 - x0, y1 - y0);
        const cx = bx + 21 * (y1 - y0) / len, cy = by - 21 * (x1 - x0) / len;
        s += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="18" style="fill:var(--grad);stroke:var(--paper);stroke-width:3"/>`;
        const ax = gx + 60;
        // plain gradient descent, lr 0.001: moves 1, 0.001, 0.000001
        s += `<g data-step="1">`;
        if (i === 0) s += `<line class="back" x1="${ax}" y1="400" x2="${gx + 470}" y2="400" style="stroke-dasharray:none"/><text class="lbl" x="${ax}" y="448" style="text-anchor:start;font-size:34px">1 · flies off</text>`;
        else if (i === 1) s += `<line class="back" x1="${ax}" y1="400" x2="${ax + unit}" y2="400" style="stroke-dasharray:none"/><text class="lbl" x="${ax}" y="448" style="text-anchor:start;font-size:34px">0.001</text>`;
        else s += `<circle cx="${ax}" cy="400" r="6" style="fill:var(--grad)"/><text class="lbl" x="${ax}" y="448" style="text-anchor:start;font-size:34px">0.000001 · stuck</text>`;
        s += `</g><g data-step="2"><line class="back" x1="${ax}" y1="510" x2="${ax + unit}" y2="510" style="stroke-dasharray:none"/><text class="lbl" x="${ax}" y="558" style="text-anchor:start;font-size:34px">0.001</text></g>`;
      });
      return s + '</svg>';
    })()}
    <p class="lead" data-step="3"><mark>Adam: every weight moves about lr per step.</mark></p>`,
    notes: `
    <p class="time">1.5 min</p>
    <p class="say">Three weights sit on very different slopes: 1000, 1 and 0.001. We take one step with learning rate 0.001. How far does each weight move, first with plain gradient descent, then with Adam?</p>
    <p class="do">Let everyone write two answers per weight. → (1) plain gradient descent: the move is lr × slope, so 1, 0.001 and 0.000001. The steep one flies off, the flat one is stuck. → (2) Adam: all three move exactly 0.001. → (3) the takeaway.</p>
    <p class="ask">Why does Adam move them all by the same amount?</p>
    <p class="ans">Adam divides each weight's slope by the typical size of that weight's recent slopes. On the first step "typical size" is just the slope itself, so 1000/1000 = 1/1 = 0.001/0.001 = 1, and every weight moves exactly lr. Later it is roughly lr (smaller when the slope keeps changing sign or is mostly noise).</p>
    <p class="say">Remember this for the inversion task this afternoon: there you move an <i>input</i> with Adam. With lr 0.001, a value that has to travel 2 needs at least 2,000 steps. Pick the learning rate on the scale of the distance you need to travel (for example 0.1).</p>
    <p>For the strongest students (paper, 2 min): g = 4, β₁ = 0.9, β₂ = 0.999, lr = 0.001. m = 0.1 × 4 = 0.4, v = 0.001 × 16 = 0.016; bias-corrected m̂ = 0.4 / 0.1 = 4, v̂ = 0.016 / 0.001 = 16; step = 0.001 × 4 / √16 = 0.001. With g = 0.04 the step is still 0.001. (Checked in PyTorch: gradients 1000, 1, 0.001 all move 0.0010.) Adam = "adaptive moment estimation", Kingma and Ba, 2014.</p>`,
  });

  /* ------------------------------------------------------------------ */
  Deck.slide({
    id: 'opt-kobe',
    title: 'Predict: learning rates on Kobe',
    html: `
    <div class="row" style="gap:32px"><span class="tag tag-predict">predict</span><h2>On Kobe, which settings beat guessing?</h2></div>
    ${(() => {
      const sx = v => 640 + (v - 0.65) / 0.06 * 1040;
      const rows = [
        { y: 70, l: 'Adam, lr 0.001', v: 0.662, note: 'our reference', st: 0 },
        { y: 190, l: 'Adam, lr 1', v: 0.701, note: '✗ worse than guessing', cls: 'bad', st: 1 },
        { y: 310, l: 'SGD, lr 0.001', v: 0.683, note: 'barely moved', st: 2 },
        { y: 430, l: 'SGD, lr 0.1', v: 0.663, note: '≈ Adam', st: 3 },
      ];
      let s = `<svg class="dg" viewBox="0 0 1728 640" width="1728" height="640" role="img" aria-label="validation loss of four settings on Kobe">`;
      const gx = sx(0.688);
      s += `<line x1="${gx}" y1="10" x2="${gx}" y2="500" style="stroke:var(--muted);stroke-width:3;stroke-dasharray:12 10"/>`;
      s += `<text class="lbl-s" x="${gx + 14}" y="520" style="text-anchor:start">guessing: 0.688</text>`;
      s += `<line x1="${sx(0.65)}" y1="560" x2="${sx(0.71)}" y2="560" style="stroke:var(--muted);stroke-width:2.5"/>`;
      [0.65, 0.66, 0.67, 0.68, 0.69, 0.70, 0.71].forEach(t => {
        s += `<line x1="${sx(t)}" y1="560" x2="${sx(t)}" y2="572" style="stroke:var(--muted);stroke-width:2.5"/><text class="lbl-s" x="${sx(t)}" y="598">${t.toFixed(2)}</text>`;
      });
      s += `<text class="lbl-s" x="${sx(0.65)}" y="632" style="text-anchor:start;fill:var(--ink)">validation loss  ← better</text>`;
      rows.forEach(r => {
        s += `<line x1="${sx(0.65)}" y1="${r.y}" x2="${sx(0.71)}" y2="${r.y}" style="stroke:var(--grid);stroke-width:2"/>`;
        s += `<text class="lbl-b" x="0" y="${r.y}" style="text-anchor:start">${r.l}</text>`;
        const g = `<circle cx="${sx(r.v)}" cy="${r.y}" r="16" style="fill:var(--ink)"/><text class="lbl" x="${sx(r.v) + 30}" y="${r.y}" style="text-anchor:start;font-size:34px;paint-order:stroke;stroke:var(--paper);stroke-width:10px;stroke-linejoin:round">${r.v.toFixed(3)}</text>` +
          `<text class="lbl" x="0" y="${r.y + 46}" style="text-anchor:start;font-size:30px;${r.cls ? 'fill:var(--bad)' : 'fill:var(--muted)'}">${r.note}</text>`;
        if (r.st) s += `<text class="lbl" x="${sx(0.68)}" y="${r.y}" style="fill:var(--muted);font-size:40px" data-until="${r.st}">?</text><g data-step="${r.st}">${g}</g>`;
        else s += g;
      });
      return s + '</svg>';
    })()}
    <p class="lead" data-step="4"><mark>lr 0.001 is Adam's default, not a law of nature.</mark></p>`,
    notes: `
    <p class="time">1.5 min</p>
    <p class="say">Real numbers from our runs on Kobe's shots: our legal 2-8-8-1 network, 30 epochs, validation loss (lower is better). The dashed line is the "dumb" model that always predicts 44.6%: loss 0.688. Adam with lr 0.001 gets 0.662. Now predict the three others: better than guessing or not?</p>
    <p class="do">Take a quick vote on each row (thumbs up = beats the dashed line). Then → three times to reveal one row at a time, and → once more for the takeaway.</p>
    <ul>
      <li><b>Adam, lr 1</b>: 0.701, worse than guessing (and accuracy 51.7%, below "always miss" at 55%). Steps of about 1 per weight per step are far too big.</li>
      <li><b>SGD, lr 0.001</b>: 0.683. It barely moved in 9,660 steps: plain SGD moves lr × slope, and the slopes are small.</li>
      <li><b>SGD, lr 0.1</b>: 0.663, as good as Adam. Plain SGD is fine once its learning rate is right.</li>
    </ul>
    <p class="ask">So is Adam better than SGD?</p>
    <p class="ans">Not by itself. Each optimizer has its own good range of learning rates. Adam's default happens to be a good start for most networks; SGD needs a different number. The learning rate matters more than the optimizer's name.</p>
    <p>Setup: 80/20 split of 25,697 labelled shots (train 20,558), standardised inputs, batch 64, ReLU, mean of 3 seeds. Also measured: Adam lr 0.01 gave 0.660 (slightly better than 0.001) and Adam 3e-4 gave 0.664.</p>`,
  });

  /* ------------------------------------------------------------------ */
  const LOOP = `
    opt = torch.optim.Adam(model.parameters(),
                           lr=1e-3)
    for xb, yb in loader:
        loss = loss_fn(model(xb), yb)
        opt.zero_grad()    # forget old slopes
        loss.backward()    # new slopes
        opt.step()         # move every weight`;
  Deck.slide({
    id: 'opt-default',
    title: 'What to use: Adam, then tune lr',
    html: `
    <h2>Start with Adam, lr 0.001</h2>
    <div class="t-code">
      ${Code.py(LOOP, { hl: '1:1-2 2:5-7 3:1-2' })}
      <div class="stack effect">
        <div data-only="1"><p>Then try</p><p class="bigv">0.003<br>0.0003</p><p class="muted small">keep the best on validation</p></div>
        <div data-only="2"><p>What they do for each of the 105 weights:</p>${Code.py(`
          w.grad.zero_()
          loss.backward()
          w -= lr * w.grad`, { size: 's' })}</div>
        <div data-only="3"><p>Swap one line, keep the loop:</p>${Code.py(`
          opt = torch.optim.SGD(
              model.parameters(),
              lr=0.1, momentum=0.9)`, { size: 's' })}</div>
      </div>
    </div>`,
    notes: `
    <p class="time">1 min</p>
    <p class="say">You never write the update by hand. You create an optimizer once, with the model's weights and a learning rate, and in the loop call three lines: zero_grad, backward, step.</p>
    <p class="do">→ (1): start with Adam 0.001; also try 0.003 and 0.0003 and keep the best on validation. → (2): for every weight: clear the old slope, compute the new one, move against it. backward() is backpropagation; you may have seen it, if not: PyTorch finds every weight's slope for you. → (3): changing the optimizer is one line.</p>
    <p class="ask">Could zero_grad go between backward and step?</p>
    <p class="ans">No: it would wipe the fresh slopes, so step would move nothing.</p>
    <p>AdamW is Adam with weight decay done properly.</p>`,
  });

  /* ------------------------------------------------------------------ */
  Deck.slide({
    id: 'opt-sched',
    title: 'Learning-rate schedules',
    html: `
    <h2>Big steps early, small steps late</h2>
    <div class="fill-center">
      <div class="sched">
        ${(() => {
          const W = 384, H = 420, pl = 10, pb = 20;
          const curves = [
            ['constant', '', t => 1],
            ['step down', 'MultiStepLR', t => (t < 0.5 ? 1 : t < 0.75 ? 0.1 : 0.01)],
            ['warm-up + cosine', 'OneCycleLR', t => (t < 0.08 ? t / 0.08 : 0.5 * (1 + Math.cos(Math.PI * (t - 0.08) / 0.92)))],
            ['drop when stuck', 'ReduceLROnPlateau', t => (t < 0.45 ? 1 : t < 0.62 ? 0.5 : t < 0.8 ? 0.25 : 0.125)],
          ];
          return curves.map(([name, cls, f]) => {
            let d = '';
            for (let i = 0; i <= 200; i++) {
              const t = i / 200, x = pl + t * (W - pl - 6), y = 48 + (1 - f(t)) * (H - pb - 64);
              d += (i ? 'L' : 'M') + x.toFixed(1) + ',' + y.toFixed(1);
            }
            return `<div><h3>${name}</h3>
              <svg class="dg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${name} learning-rate schedule">
                <path d="M${pl},10 V${H - pb} H${W}" style="fill:none;stroke:var(--muted);stroke-width:2.5"/>
                <path d="${d}" style="fill:none;stroke:var(--grad);stroke-width:5;stroke-linejoin:round"/>
                <text class="lbl-s" x="${pl + 14}" y="12" style="text-anchor:start">lr</text>
                <text class="lbl-s" x="${W}" y="${H}" style="text-anchor:end">training →</text>
              </svg>
              <span class="mono">${cls || '&nbsp;'}</span></div>`;
          }).join('');
        })()}
      </div>
    </div>`,
    notes: `
    <p class="time">1 min</p>
    <p class="say">One more knob, briefly. Many people change the learning rate during training: big steps at the start to travel fast, small steps at the end to settle into the bottom instead of bouncing around it. Think of parking a car: fast on the road, slow in the parking space.</p>
    <ul>
      <li><b>Constant</b>: simplest; fine for small tasks like Kobe if you keep the best checkpoint.</li>
      <li><b>Step down</b>: divide lr by 10 at fixed points (the classic image-network recipe).</li>
      <li><b>Warm-up + cosine</b>: start tiny, ramp up, then glide smoothly down to almost 0. The default for transformers and large models.</li>
      <li><b>Drop when stuck</b> (ReduceLROnPlateau): halve the lr whenever the validation loss stops improving for a few epochs. The easiest good choice for small olympiad tasks.</li>
    </ul>
    <p class="ask">Why would a smaller learning rate at the end give a better result?</p>
    <p class="ans">With mini-batches every step is a bit noisy, so with a constant lr the weights keep jiggling around the bottom. Smaller steps shrink the jiggle so the weights settle closer to the bottom.</p>
    <p>If you are running late, skip this slide. On a small tabular test (our run), cosine or ReduceLROnPlateau improved the final validation loss from 0.42 to about 0.37, but keeping the best epoch mattered about as much. PyTorch: torch.optim.lr_scheduler. OneCycleLR does warm-up then cosine decay in one object (call sched.step() after every batch); ReduceLROnPlateau is called as sched.step(val_loss) once per epoch.</p>`,
  });
})();
