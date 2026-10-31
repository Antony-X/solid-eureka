Deck.section({ id: 'loss', title: 'Loss: how wrong are we?', minutes: 13 });

Deck.css(`
.sec-loss .lx-grid { display: grid; grid-template-columns: 960px 1fr; gap: 72px; flex: 1; min-height: 0; align-items: start; }
.sec-loss .lx-grid.wide { grid-template-columns: 1104px 1fr; }
.sec-loss .lx-side { display: flex; flex-direction: column; gap: 32px; min-width: 0; height: 100%; }
.sec-loss .lx-side .ui-row { gap: 20px; }
.sec-loss .lx-side .ui-readout-label { font-size: 28px; }
.sec-loss .lx-note { font-size: 34px; color: var(--muted); }
.sec-loss .lx-ctl { margin-top: auto; display: flex; flex-direction: column; gap: 24px; }
.sec-loss canvas.lx-drag { cursor: grab; }
.sec-loss .lx-made { font-family: var(--font-display); font-weight: 800; font-size: 48px; color: var(--c1); }
.sec-loss .lx-fc { display: grid; grid-template-columns: 210px 1fr; row-gap: 14px; align-items: baseline; font-family: var(--font-mono); }
.sec-loss .lx-fc .h { font-size: 28px; color: var(--muted); letter-spacing: .08em; text-transform: uppercase; }
.sec-loss .lx-fc .p { font-size: 56px; font-weight: 600; }
.sec-loss .lx-fc .v { font-size: 56px; font-weight: 600; }
.sec-loss .lx-fc .v small { font-size: 30px; color: var(--muted); font-weight: 500; margin-left: 14px; }
.sec-loss .lx-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 48px; }
.sec-loss .lx-card { border: 3px solid var(--ink); padding: 28px 32px 36px; display: flex; flex-direction: column; gap: 18px; transition: opacity .3s ease, border-color .3s ease; position: relative; }
.sec-loss .lx-card .n { font-family: var(--font-mono); font-size: 40px; font-weight: 600; width: 64px; height: 64px; display: grid; place-items: center; border: 3px solid var(--ink); }
.sec-loss .lx-card .v { font-family: var(--font-mono); font-size: 120px; font-weight: 600; line-height: 1; }
.sec-loss .lx-card .tick { position: absolute; right: 28px; top: 22px; font-size: 56px; font-weight: 800; color: var(--ok); opacity: 0; }
.sec-loss .lx-cards.is-rev .lx-card { opacity: .3; }
.sec-loss .lx-cards.is-rev .lx-card.is-ans { opacity: 1; border-color: var(--ok); border-width: 6px; padding: 25px 29px 33px; }
.sec-loss .lx-cards.is-rev .lx-card.is-ans .tick { opacity: 1; }
.sec-loss .lx-facts { display: grid; grid-template-columns: auto 1fr; gap: 24px 40px; align-items: baseline; font-size: 44px; }
.sec-loss .lx-facts .k { font-family: var(--font-mono); font-size: 64px; font-weight: 600; text-align: right; }
.sec-loss .lx-pick { display: grid; grid-template-columns: 400px 1fr 280px 560px; gap: 0 40px; align-items: stretch; }
.sec-loss .lx-pick .hd { font-family: var(--font-mono); font-size: 28px; letter-spacing: .1em; text-transform: uppercase; color: var(--muted); padding-bottom: 12px; border-bottom: 2px solid var(--rule); align-self: end; }
.sec-loss .lx-pick .cell { padding: 14px 0; border-bottom: 2px solid var(--rule); min-height: 0; display: flex; flex-direction: column; justify-content: center; gap: 6px; }
.sec-loss .lx-pick .what { font-family: var(--font-display); font-weight: 750; font-size: 56px; line-height: 1.05; }
.sec-loss .lx-pick .eg { font-size: 32px; color: var(--muted); }
.sec-loss .lx-pick .last { font-size: 44px; }
.sec-loss .lx-pick .fn { font-family: var(--font-mono); font-size: 40px; font-weight: 600; }
.sec-loss .lx-pick [data-step] { transition: opacity .35s ease, transform .35s ease; }
.sec-loss .lx-vote { display: grid; grid-template-columns: 1056px 1fr; gap: 72px; align-items: start; }
.sec-loss .lx-opts { display: flex; flex-direction: column; gap: 44px; padding-top: 12px; }
.sec-loss .lx-opt { display: flex; gap: 28px; align-items: center; font-size: 52px; line-height: 1.1; }
.sec-loss .lx-opt b { font-family: var(--font-mono); font-size: 40px; font-weight: 600; min-width: 64px; height: 64px; display: grid; place-items: center; border: 3px solid var(--ink); }
.sec-loss .lx-pipe text { dominant-baseline: central; }
`);

(() => {
  /* ---------- helpers shared by the canvases of this section ---------- */
  const font = (C, size, kind, weight) => `${weight || 500} ${size}px ${kind === 'mono' ? C.fontMono : kind === 'display' ? C.fontDisplay : C.fontBody}`;
  function label(ctx, C, s, x, y, o) {
    o = o || {};
    ctx.save();
    ctx.font = font(C, o.size || 28, o.kind || 'body', o.weight);
    ctx.fillStyle = o.color || C.ink;
    ctx.textAlign = o.align || 'left';
    ctx.textBaseline = o.base || 'middle';
    if (o.halo) { ctx.lineWidth = 8; ctx.strokeStyle = C.paper; ctx.lineJoin = 'round'; ctx.strokeText(s, x, y); }
    ctx.fillText(s, x, y);
    ctx.restore();
  }
  // light grid + axes + tick labels; fx / fy format the tick values
  function axes(ctx, C, sx, sy, xt, yt, fx, fy) {
    const [x0, x1] = sx.range, y0 = sy.range[0], y1 = sy.range[1];
    ctx.save();
    ctx.lineWidth = 1.5; ctx.strokeStyle = C.grid;
    xt.forEach(v => { ctx.beginPath(); ctx.moveTo(sx(v), y0); ctx.lineTo(sx(v), y1); ctx.stroke(); });
    yt.forEach(v => { ctx.beginPath(); ctx.moveTo(x0, sy(v)); ctx.lineTo(x1, sy(v)); ctx.stroke(); });
    ctx.lineWidth = 2.5; ctx.strokeStyle = C.muted;
    ctx.beginPath(); ctx.moveTo(x0, y1); ctx.lineTo(x0, y0); ctx.lineTo(x1, y0); ctx.stroke();
    ctx.restore();
    xt.forEach(v => label(ctx, C, fx(v), sx(v), y0 + 14, { size: 28, kind: 'mono', color: C.muted, align: 'center', base: 'top' }));
    yt.forEach(v => label(ctx, C, fy(v), x0 - 14, sy(v), { size: 28, kind: 'mono', color: C.muted, align: 'right' }));
  }
  function textW(ctx, C, s, size, kind, weight) {
    ctx.save(); ctx.font = font(C, size, kind, weight); const w = ctx.measureText(s).width; ctx.restore(); return w;
  }
  // gradient-style arrow: dashed magenta shaft, open chevron head (DESIGN §2.3 / §4)
  function gradArrow(ctx, C, x0, y0, x1, y1) {
    const ang = Math.atan2(y1 - y0, x1 - x0), head = 22;
    ctx.save(); ctx.strokeStyle = C.grad; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.setLineDash([14, 10]);
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - Math.cos(ang) * 6, y1 - Math.sin(ang) * 6); ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(x1 - head * Math.cos(ang - 0.5), y1 - head * Math.sin(ang - 0.5));
    ctx.lineTo(x1, y1);
    ctx.lineTo(x1 - head * Math.cos(ang + 0.5), y1 - head * Math.sin(ang + 0.5));
    ctx.stroke(); ctx.restore();
  }
  const sig = z => 1 / (1 + Math.exp(-z));
  const softplus = z => Math.max(z, 0) + Math.log1p(Math.exp(-Math.abs(z)));

  /* =====================================================================
     1. MSE as literal squares, on Kobe's make rate by distance
     ===================================================================== */
  // Kaggle "Kobe Bryant Shot Selection", 25,697 labelled shots, 4-ft bins of
  // shot_distance (0-4 ft ... 24-28 ft cover 98% of shots): % of shots made.
  const BX = [2, 6, 10, 14, 18, 22, 26];
  const BY = [61.8, 43.5, 44.7, 42.8, 39.9, 39.5, 34.3];
  const YBAR = BY.reduce((a, b) => a + b, 0) / BY.length;   // 43.8

  Deck.slide({
    id: 'loss-mse',
    title: 'Squared error: big misses cost the most',
    html: `
    <h2>Squared error: big misses cost the most</h2>
    <div class="lx-grid wide">
      <div class="lx-mse-cv"></div>
      <div class="lx-side">
        <div class="lx-mse-ro"></div>
        <p class="lx-note">Each dot: % of Kobe's shots made from that distance.<br>Each miss becomes a square.</p>
        <div class="lx-ctl"><p class="small muted">Drag the line's end dots.</p><div class="ui-row lx-mse-btn"></div></div>
      </div>
    </div>`,
    init(el, api) {
      const W = 1104, H = 720, L = 120, R = 36, T = 64, B = 96;
      const cv = Plot.canvas(el.querySelector('.lx-mse-cv'), W, H, 'lx-drag');
      const Y0 = 25, Y1 = 70, XM = 31;
      // wide x axis so a 10-point miss (one square) fits between two neighbouring dots
      const sx = Plot.scale(-1, XM, L, W - R), sy = Plot.scale(Y0, Y1, H - B, T);
      const XA = 0, XB = 28;                      // where the two handles sit
      const S = { c: YBAR, b: 0, fitting: false }; // line: y = c + b (x - 14)
      const yAt = x => S.c + S.b * (x - 14);
      const mse = () => BY.reduce((s, y, i) => s + (yAt(BX[i]) - y) ** 2, 0) / BY.length;
      const ro = UI.readout(el.querySelector('.lx-mse-ro'), 'loss = average square');
      ro.el.querySelector('.ui-readout-value').style.fontSize = '96px';
      function draw() {
        const C = Plot.colors(), ctx = cv.ctx;
        cv.clear();
        axes(ctx, C, sx, sy, [0, 5, 10, 15, 20, 25, 30], [30, 40, 50, 60, 70], v => v, v => v + '%');
        label(ctx, C, 'shots made', L + 12, T - 34, { size: 28, color: C.ink });
        label(ctx, C, 'feet from the rim', W - R, H - 22, { size: 28, color: C.ink, align: 'right' });
        ctx.save();
        ctx.beginPath(); ctx.rect(L, T - 8, W - R - L, H - B - T + 8); ctx.clip();
        // squares: one per bin, side = the miss; a number goes inside a square only if it
        // does not collide with a dot or another number
        const taken = BX.map((x, i) => [sx(x), sy(BY[i]), 26, 26]);
        const free = (cx, cy, w, h) => !taken.some(r => Math.abs(r[0] - cx) < (r[2] + w) / 2 && Math.abs(r[1] - cy) < (r[3] + h) / 2);
        const nums = [];
        BX.forEach((x, i) => {
          const px = sx(x), py = sy(BY[i]), pf = sy(yAt(x));
          const side = Math.abs(pf - py);
          if (side < 1) return;
          const left = px + side > W - R ? px - side : px;
          const top = Math.min(py, pf);
          ctx.fillStyle = Plot.alpha(C.grad, 0.16); ctx.fillRect(left, top, side, side);
          ctx.strokeStyle = C.grad; ctx.lineWidth = 3; ctx.strokeRect(left, top, side, side);
          const area = (yAt(x) - BY[i]) ** 2;
          if (side > 62) nums.push([area.toFixed(0), left + side / 2, top + side / 2, side > 90 ? 34 : 28]);
        });
        nums.sort((a, b) => b[3] - a[3]).forEach(([txt, cx, cy, size]) => {
          const w = textW(ctx, C, txt, size, 'mono', 600) + 8, h = size + 6;
          if (!free(cx, cy, w, h)) return;
          taken.push([cx, cy, w, h]);
          label(ctx, C, txt, cx, cy, { size, kind: 'mono', weight: 600, color: C.grad, align: 'center' });
        });
        // the model: a straight line
        ctx.strokeStyle = C.ink; ctx.lineWidth = 5; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(sx(-1), sy(yAt(-1))); ctx.lineTo(sx(XM), sy(yAt(XM))); ctx.stroke();
        ctx.restore();
        // targets: hollow ink dots
        BX.forEach((x, i) => { ctx.lineWidth = 3.5; Plot.dot(ctx, sx(x), sy(BY[i]), 10, C.paper, C.ink); });
        // handles
        [XA, XB].forEach(x => {
          const y = Math.max(Y0, Math.min(Y1, yAt(x)));
          ctx.beginPath(); ctx.arc(sx(x), sy(y), 15, 0, 2 * Math.PI);
          ctx.fillStyle = C.ink; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = C.paper; ctx.stroke();
        });
        ro.set(mse().toFixed(1));
      }
      // drag a handle: the line goes through both handles
      let drag = null;
      const setFrom = (yA, yB) => { S.b = (yB - yA) / (XB - XA); S.c = yA + S.b * (14 - XA); };
      cv.cv.addEventListener('pointerdown', e => {
        const [px] = cv.pos(e);
        drag = Math.abs(px - sx(XA)) < Math.abs(px - sx(XB)) ? 'A' : 'B';
        S.fitting = false; syncBtn();
        cv.cv.setPointerCapture(e.pointerId); move(e);
      });
      const move = e => {
        if (!drag) return;
        const y = Math.max(Y0, Math.min(Y1, sy.inv(cv.pos(e)[1])));
        if (drag === 'A') setFrom(y, yAt(XB)); else setFrom(yAt(XA), y);
        draw();
      };
      cv.cv.addEventListener('pointermove', move);
      cv.cv.addEventListener('pointerup', () => { drag = null; });
      cv.cv.addEventListener('pointercancel', () => { drag = null; });
      // "Fit": gradient descent on (c, slope in units of one spread of x = 8 ft)
      const bc = UI.row(el.querySelector('.lx-mse-btn'));
      const fitBtn = UI.button(bc, 'Fit the line', () => { S.fitting = !S.fitting; syncBtn(); }, { kind: 'primary' });
      UI.button(bc, 'Reset', () => { S.c = YBAR; S.b = 0; S.fitting = false; syncBtn(); draw(); });
      function syncBtn() { fitBtn.textContent = S.fitting ? 'Pause' : 'Fit the line'; }
      api.loop(() => {
        if (!S.fitting) return true;
        let gc = 0, gb = 0;
        BX.forEach((x, i) => { const r = yAt(x) - BY[i], u = (x - 14) / 8; gc += 2 * r / BX.length; gb += 2 * r * u / BX.length; });
        S.c -= 0.03 * gc; S.b -= 0.03 * gb / 8;
        if (Math.abs(gc) + Math.abs(gb) < 0.02) { S.fitting = false; syncBtn(); }
        draw();
        return true;
      });
      draw();
      api.onTheme(draw);
    },
    notes: `
    <p class="time">1.5 min</p>
    <p class="say">The loss is one number that says how wrong the model is; training makes it small. Dots: the share of Kobe's shots made from each distance; the line is our model. Each miss becomes a square, and the loss is the average square: the mean squared error.</p>
    <p class="do">Point at the big square at 0–4 ft. Drag an end dot to grow and shrink squares, then press <b>Fit the line</b>: loss 64 → 18.</p>
    <p class="ask">A miss of 10 points costs 100. What does a miss of 20 cost?</p>
    <p class="ans">400, four times as much: big misses are very expensive, so the line works hardest to avoid them.</p>
    <p>PyTorch: <code>nn.MSELoss()</code>, the loss for predicting numbers, as in the inversion task.</p>`,
  });

  /* =====================================================================
     2. Cross-entropy: -log p for a made shot, with the A5 ranking
     ===================================================================== */
  const FC = [0.9, 0.5, 0.1, 0.001];
  Deck.slide({
    id: 'loss-ce',
    title: 'Confident and wrong costs the most',
    html: `
    <h2>Confident and wrong costs the most</h2>
    <div class="lx-grid">
      <div class="lx-ce-cv"></div>
      <div class="lx-side">
        <div class="lx-made">Kobe's shot went in.</div>
        <div class="lx-fc" style="transition:opacity .3s ease">
          <span class="h">forecast</span><span class="h">loss</span>
          ${FC.map((p, i) => `<span class="p">${p === 0.001 ? '0.1%' : Math.round(p * 100) + '%'}</span>
            <span class="v" data-step="${i + 1}">${(-Math.log(p)).toFixed(2)}${i === 3 ? '<small>× 66</small>' : ''}</span>`).join('')}
        </div>
        <div class="lx-ctl" data-step="5"><div class="lx-ce-ctl col"></div></div>
      </div>
    </div>`,
    init(el, api) {
      const W = 960, H = 720, L = 110, R = 40, T = 64, B = 96;
      const cv = Plot.canvas(el.querySelector('.lx-ce-cv'), W, H);
      const sx = Plot.scale(0, 1, L, W - R), sy = Plot.scale(0, 7.5, H - B, T);
      const S = { shown: 1, target: 1, p: 0.3, made: true };
      // the curve is revealed from p = 1 leftwards, down to the smallest forecast shown
      const targetFor = k => (k <= 0 ? 1 : k >= 4 ? 0.0006 : FC[k - 1]);
      function draw() {
        const C = Plot.colors(), ctx = cv.ctx;
        cv.clear();
        axes(ctx, C, sx, sy, [0, 0.25, 0.5, 0.75, 1], [0, 2, 4, 6], v => Math.round(v * 100) + '%', v => v);
        label(ctx, C, 'loss', L + 12, T - 34, { size: 28 });
        label(ctx, C, 'forecast: chance it goes in', W - R, H - 22, { size: 28, align: 'right' });
        const sand = api.step >= 5;
        const lossOf = p => (S.made ? -Math.log(p) : -Math.log(1 - p));
        // curve
        ctx.save();
        ctx.beginPath(); ctx.rect(L, T - 10, W - R - L + 10, H - B - T + 10); ctx.clip();
        ctx.beginPath();
        const lo = sand ? 0.0006 : S.shown, hi = sand ? 0.9994 : 1;
        const n = 500;
        for (let i = 0; i <= n; i++) {
          // sample densely near the steep end (log spacing)
          const p = S.made || !sand ? Math.exp(Math.log(lo) + (Math.log(hi) - Math.log(lo)) * i / n) : 1 - Math.exp(Math.log(1 - hi) + (Math.log(1 - lo) - Math.log(1 - hi)) * i / n);
          const x = sx(p), y = sy(Math.min(7.6, lossOf(p)));
          i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        }
        ctx.strokeStyle = C.ink; ctx.lineWidth = 5; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke();
        ctx.restore();
        if (!sand || S.made) {
          FC.forEach((p, i) => {
            const x = sx(p), y = sy(-Math.log(p));
            if (api.step < i + 1) {
              // not revealed yet: a "?" above this forecast on the x axis (predict first)
              label(ctx, C, '?', Math.max(L + 22, x), sy(0) - 34, { size: 40, kind: 'mono', weight: 700, color: C.muted, align: 'center' });
              return;
            }
            Plot.dot(ctx, x, y, sand ? 8 : 11, C.c1); ctx.lineWidth = 3; ctx.strokeStyle = C.paper; ctx.stroke();
            if (sand) return;   // in the sandbox the table on the right carries the four numbers
            const txt = (-Math.log(p)).toFixed(2);
            const o = { size: 32, kind: 'mono', weight: 600, halo: true };
            if (i === 3) label(ctx, C, txt, x + 26, y + 4, o);
            else if (i === 2) label(ctx, C, txt, x + 24, y - 18, o);   // right of the dot, off the steep curve
            else label(ctx, C, txt, x, y - 32, { ...o, align: 'center' });
          });
        }
        if (sand) {
          const p = S.p, y = lossOf(p);
          const x = sx(p), yy = sy(Math.min(7.4, y));
          ctx.save(); ctx.setLineDash([8, 8]); ctx.lineWidth = 2.5; ctx.strokeStyle = C.muted;
          ctx.beginPath(); ctx.moveTo(x, sy(0)); ctx.lineTo(x, yy); ctx.stroke(); ctx.restore();
          Plot.dot(ctx, x, yy, 14, S.made ? C.c1 : C.c0); ctx.lineWidth = 4; ctx.strokeStyle = C.paper; ctx.stroke();
          // keep the label on the flat side of the curve
          const right = S.made ? x < W - 300 : x < L + 260;
          label(ctx, C, 'loss ' + y.toFixed(2), x + (right ? 28 : -28), yy - (S.made || !right ? 34 : 80), { size: 34, kind: 'mono', weight: 600, align: right ? 'left' : 'right', halo: true });
        }
      }
      // controls (visible from step 5)
      const host = el.querySelector('.lx-ce-ctl');
      const sl = UI.slider(host, { label: 'forecast', min: 0.001, max: 0.999, step: 0.001, value: S.p, fmt: v => (v * 100).toFixed(v < 0.01 || v > 0.99 ? 1 : 0) + '%', oninput: v => { S.p = v; draw(); } });
      sl.el.style.width = '100%';
      const head = el.querySelector('.lx-made'), table = el.querySelector('.lx-fc');
      UI.choice(host, [{ value: true, label: 'it went in' }, { value: false, label: 'it missed' }], true, v => {
        S.made = v;
        head.textContent = v ? "Kobe's shot went in." : "Kobe's shot missed.";
        head.style.color = v ? 'var(--c1)' : 'var(--c0)';
        table.style.opacity = v ? 1 : 0.3;
        draw();
      });
      api.onStep(k => { S.target = targetFor(Math.min(k, 4)); if (k >= 5) S.shown = S.target; draw(); });
      api.loop(dt => {
        if (Math.abs(Math.log(S.shown) - Math.log(S.target)) > 0.002) {
          const a = Math.log(S.shown), b = Math.log(S.target);
          S.shown = Math.exp(a + (b - a) * Math.min(1, dt * 7));
          if (Math.abs(a - b) < 0.01) S.shown = S.target;
          draw();
        }
        return true;
      });
      draw();
      api.onTheme(draw);
    },
    notes: `
    <p class="time">2.5 min</p>
    <p class="say">For yes/no the model gives a forecast, like a weather forecaster: "90% chance it goes in." The shot goes in; four forecasters had said 90%, 50%, 10% and 0.1%. Rank them, and guess how much worse the last is than the first.</p>
    <p class="do">60 seconds with a neighbour. Press → four times, one loss each: 0.1% costs 6.91, 66 times the 90% forecaster. A fifth press adds a slider and a "went in / missed" switch.</p>
    <p class="ask">The shot missed and the forecast was 90%. What is the loss?</p>
    <p class="ans">2.30, as for 10% on a made shot: only the chance given to what happened counts.</p>
    <p>This is binary cross-entropy (log loss), the official Kobe metric. You may have seen it in logistic regression; if not, "surprise meter" is enough.</p>`,
  });

  /* =====================================================================
     3. Why not accuracy: staircase vs smooth, on 13 real shots from one game
     ===================================================================== */
  // Lakers at Toronto, 7 Dec 2015: the 13 labelled shots (shot_distance ft, made)
  const GAME = [[1, 1], [2, 1], [10, 1], [11, 1], [14, 1], [16, 0], [17, 0], [18, 1], [18, 1], [18, 0], [21, 0], [25, 0], [28, 0]];
  const SC = 3; // forecast = sigmoid((t - d) / 3 ft): "made if closer than t", softened
  const errAt = t => GAME.reduce((s, [d, y]) => s + ((d < t ? 1 : 0) !== y ? 1 : 0), 0) / GAME.length;
  const llAt = t => GAME.reduce((s, [d, y]) => s + softplus(-(2 * y - 1) * (t - d) / SC), 0) / GAME.length;
  const llGrad = t => GAME.reduce((s, [d, y]) => { const sg = 2 * y - 1; return s - sg / SC * sig(-sg * (t - d) / SC); }, 0) / GAME.length;

  Deck.slide({
    id: 'loss-acc',
    title: 'Why not use accuracy as the loss?',
    html: `
    <h2>Accuracy is flat: no way downhill</h2>
    <div class="lx-acc-cv"></div>
    <div class="row" style="gap:40px;margin-top:-24px">
      <p class="small muted">13 shots, Lakers at Toronto, 7 Dec 2015 · drag the black line</p>
      <div class="ui-row lx-acc-btn" data-step="2" style="margin-left:auto"></div>
    </div>`,
    init(el, api) {
      const W = 1728, H = 720, L = 250, R = 40;
      const cv = Plot.canvas(el.querySelector('.lx-acc-cv'), W, H, 'lx-drag');
      const sx = Plot.scale(0, 30, L, W - R);
      const strip = { y0: 22, y1: 150 };
      const syA = Plot.scale(0, 0.6, 390, 205);
      const syB = Plot.scale(0, 2.1, 662, 452);   // log loss reaches 1.98 at 0 ft
      const S = { t: 6, rolling: false };
      function curve(ctx, f, sy, color) {
        ctx.beginPath();
        for (let px = L; px <= W - R; px += 1) {
          const t = sx.inv(px), y = sy(f(t));
          px === L ? ctx.moveTo(px, y) : ctx.lineTo(px, y);
        }
        ctx.strokeStyle = color; ctx.lineWidth = 5; ctx.lineJoin = 'round'; ctx.stroke();
      }
      function panelAxes(ctx, C, sy, ticks, fmt) {
        ctx.save();
        ctx.lineWidth = 1.5; ctx.strokeStyle = C.grid;
        ticks.forEach(v => { ctx.beginPath(); ctx.moveTo(L, sy(v)); ctx.lineTo(W - R, sy(v)); ctx.stroke(); });
        ctx.lineWidth = 2.5; ctx.strokeStyle = C.muted;
        ctx.beginPath(); ctx.moveTo(L, sy.range[1]); ctx.lineTo(L, sy.range[0]); ctx.lineTo(W - R, sy.range[0]); ctx.stroke();
        ctx.restore();
        ticks.forEach(v => label(ctx, C, fmt(v), L - 14, sy(v), { size: 28, kind: 'mono', color: C.muted, align: 'right' }));
      }
      function draw() {
        const C = Plot.colors(), ctx = cv.ctx;
        cv.clear();
        const showB = api.step >= 1;
        // row labels
        label(ctx, C, 'shots', 40, 100, { size: 34, weight: 700 });
        label(ctx, C, '% wrong', 40, 300, { size: 34, weight: 700 });
        if (showB) label(ctx, C, 'log loss', 40, 555, { size: 34, weight: 700 });
        // shot strip
        ctx.save(); ctx.strokeStyle = C.muted; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(L, strip.y1); ctx.lineTo(W - R, strip.y1); ctx.stroke(); ctx.restore();
        const seen = {};
        GAME.forEach(([d, y]) => {
          const k = seen[d] = (seen[d] || 0) + 1;
          const cy = strip.y1 - 22 - (k - 1) * 30;
          Plot.dot(ctx, sx(d), cy, 13, y ? C.c1 : C.c0); ctx.lineWidth = 3; ctx.strokeStyle = C.paper; ctx.stroke();
        });
        label(ctx, C, 'in', sx(1) - 6, strip.y0 + 4, { size: 28, color: C.c1, weight: 700, align: 'center' });
        label(ctx, C, 'missed', sx(25), strip.y0 + 52, { size: 28, color: C.c0, weight: 700, align: 'center' });
        // panels
        panelAxes(ctx, C, syA, [0, 0.2, 0.4, 0.6], v => Math.round(v * 100) + '%');
        curve(ctx, errAt, syA, C.ink);
        if (showB) {
          panelAxes(ctx, C, syB, [0, 0.5, 1, 1.5, 2], v => v.toFixed(1));
          curve(ctx, llAt, syB, C.ink);
        }
        // x ticks
        const yb = showB ? syB.range[0] : syA.range[0];
        [0, 5, 10, 15, 20, 25, 30].forEach(v => label(ctx, C, v + ' ft', sx(v), yb + 14, { size: 28, kind: 'mono', color: C.muted, align: 'center', base: 'top' }));
        // the model's threshold t
        const x = sx(S.t);
        ctx.save(); ctx.strokeStyle = C.ink; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(x, strip.y0 - 10); ctx.lineTo(x, yb); ctx.stroke(); ctx.restore();
        label(ctx, C, '← "in"', x - 14, strip.y0 + 4, { size: 28, weight: 700, align: 'right', halo: true });
        label(ctx, C, '"miss" →', x + 14, strip.y0 + 4, { size: 28, weight: 700, halo: true });
        // markers + slopes
        const ea = errAt(S.t);
        Plot.dot(ctx, x, syA(ea), 11, C.ink); ctx.lineWidth = 3; ctx.strokeStyle = C.paper; ctx.stroke();
        const lr = S.t < 21;
        label(ctx, C, Math.round(ea * 100) + '% wrong · slope 0', x + (lr ? 18 : -18), syA.range[1] - 26, { size: 30, kind: 'mono', weight: 600, align: lr ? 'left' : 'right', halo: true });
        if (showB) {
          const lb = llAt(S.t), g = llGrad(S.t), yy = syB(lb);
          Plot.dot(ctx, x, yy, 11, C.ink); ctx.lineWidth = 3; ctx.strokeStyle = C.paper; ctx.stroke();
          const len = Math.max(-260, Math.min(260, -g * 2400));
          if (Math.abs(len) > 22) {
            // arrow along the tangent, pointing downhill (magenta: this is the gradient)
            const dy = (syB(lb + g * (len / (sx(1) - sx(0)))) - yy);
            gradArrow(ctx, C, x, yy, x + len, yy + dy);
          }
          label(ctx, C, 'log loss ' + lb.toFixed(2), x + (lr ? 18 : -18), syB.range[1] - 26, { size: 30, kind: 'mono', weight: 600, align: lr ? 'left' : 'right', halo: true });
        }
      }
      let drag = false;
      const setT = e => { S.t = Math.max(0, Math.min(30, sx.inv(cv.pos(e)[0]))); draw(); };
      cv.cv.addEventListener('pointerdown', e => { drag = true; S.rolling = false; sync(); cv.cv.setPointerCapture(e.pointerId); setT(e); });
      cv.cv.addEventListener('pointermove', e => { if (drag) setT(e); });
      cv.cv.addEventListener('pointerup', () => { drag = false; });
      cv.cv.addEventListener('pointercancel', () => { drag = false; });
      const bc = el.querySelector('.lx-acc-btn');
      const roll = UI.button(bc, 'Roll downhill', () => { S.rolling = !S.rolling; sync(); }, { kind: 'primary' });
      UI.button(bc, 'Reset', () => { S.t = 6; S.rolling = false; sync(); draw(); });
      function sync() { roll.textContent = S.rolling ? 'Pause' : 'Roll downhill'; }
      api.loop(dt => {
        if (!S.rolling) return true;
        const g = llGrad(S.t);
        S.t -= Math.max(-0.12, Math.min(0.12, 40 * g * dt * 4));
        if (Math.abs(g) < 0.0015) { S.rolling = false; sync(); }
        draw();
        return true;
      });
      api.onStep(draw);
      draw();
      api.onTheme(draw);
    },
    steps: 2,
    notes: `
    <p class="time">1.5 min</p>
    <p class="say">We care about accuracy, so why not train on accuracy directly? Here are Kobe's 13 shots from one game, by distance: orange went in, blue missed. Our tiny model has one knob, the black line: closer than the line, it says "in"; farther, "miss".</p>
    <p class="do">Step 0: drag the black line slowly to the right. The "% wrong" curve is a staircase: it only changes when the line jumps over a shot. Stop on a flat part.</p>
    <p class="ask">Standing here, which way should the line move to get better?</p>
    <p class="ans">You can't tell: the ground is flat on both sides (slope 0). Gradient descent needs a slope, and accuracy gives zero slope almost everywhere.</p>
    <p class="do">Press → : the log loss appears. It is smooth, so at every position there is a slope; the magenta arrow points downhill. Press → again and click <b>Roll downhill</b>: the line slides by itself to the bottom of the log loss (about 17 ft). Drag it somewhere else and roll again.</p>
    <p class="say">So we train on a smooth loss and only report accuracy at the end. The loss is the compass, accuracy is the scoreboard.</p>
    <p>Background: to make the loss smooth, the model gives a forecast instead of a hard yes/no: forecast = σ((t − distance)/3 ft), so shots near the line get forecasts near 50%. Students may notice that the bottom of the log loss (≈ 17 ft, 23% wrong) is not the best accuracy (15% wrong at 14–16 ft): the loss and the metric are not identical, and that is normal. The data are the 13 labelled shots of the 7 Dec 2015 game at Toronto in the Kaggle file.</p>`,
  });

  /* =====================================================================
     4. Logits: the model outputs a score; the loss turns it into a chance
     ===================================================================== */
  Deck.slide({
    id: 'loss-logit',
    title: 'The model outputs a score (logit)',
    html: `
    <h2>The model outputs a score, not a %</h2>
    <div class="lx-sig-cv"></div>
    <div data-step="1" style="width:1728px;height:250px">
      <svg class="dg lx-pipe" viewBox="0 0 1728 250" width="1728" height="250" style="width:1728px;height:250px;max-width:none" role="img" aria-label="shot to model to score to BCEWithLogitsLoss to loss">
        <text class="lbl" x="84" y="125">shot</text>
        <line class="flow" x1="175" y1="125" x2="250" y2="125"/>
        <rect class="box" x="262" y="77" width="220" height="96"/><text class="lbl-b" x="372" y="125">model</text>
        <line class="flow" x1="490" y1="125" x2="560" y2="125"/>
        <text class="lbl-s" x="650" y="70">score</text>
        <text class="lbl lx-z" x="650" y="125" style="font-size:44px">1.0</text>
        <line class="flow" x1="740" y1="125" x2="810" y2="125"/>
        <rect x="822" y="30" width="660" height="190" style="fill:none;stroke:var(--ink);stroke-width:3;stroke-dasharray:12 8"/>
        <text class="lbl" x="1152" y="4" style="font-size:32px">nn.BCEWithLogitsLoss()</text>
        <rect class="box act" x="852" y="77" width="140" height="96"/><text class="lbl-m" x="922" y="125">σ</text>
        <line class="flow" x1="1000" y1="125" x2="1060" y2="125"/>
        <text class="lbl lx-p" x="1140" y="125" style="font-size:44px">73%</text>
        <line class="flow" x1="1222" y1="125" x2="1282" y2="125"/>
        <rect class="box act" x="1292" y="77" width="160" height="96"/><text class="lbl" x="1372" y="125">−log</text>
        <line class="flow" x1="1490" y1="125" x2="1560" y2="125"/>
        <text class="lbl-s" x="1640" y="70">loss if in</text>
        <text class="lbl lx-l" x="1640" y="125" style="font-size:44px">0.31</text>
      </svg>
    </div>`,
    init(el, api) {
      const W = 1728, H = 456, L = 140, R = 40, T = 48, B = 100;
      const cv = Plot.canvas(el.querySelector('.lx-sig-cv'), W, H, 'lx-drag');
      const sx = Plot.scale(-7, 7, L, W - R), sy = Plot.scale(0, 1, H - B, T);
      const S = { z: 1 };
      const zt = el.querySelector('.lx-z'), pt = el.querySelector('.lx-p'), lt = el.querySelector('.lx-l');
      function draw() {
        const C = Plot.colors(), ctx = cv.ctx;
        cv.clear();
        axes(ctx, C, sx, sy, [-6, -4, -2, 0, 2, 4, 6], [0, 0.5, 1], v => (v > 0 ? '+' : '') + v, v => Math.round(v * 100) + '%');
        label(ctx, C, 'chance it goes in', L + 12, T - 6, { size: 28 });
        label(ctx, C, 'score from the model (logit)', W - R, H - 6, { size: 28, align: 'right', base: 'bottom' });
        Plot.fn(ctx, sx, sy, sig, { color: C.ink, width: 5 });
        const x = sx(S.z), y = sy(sig(S.z));
        ctx.save(); ctx.setLineDash([8, 8]); ctx.lineWidth = 2.5; ctx.strokeStyle = C.muted;
        ctx.beginPath(); ctx.moveTo(x, sy(0)); ctx.lineTo(x, y); ctx.lineTo(L, y); ctx.stroke(); ctx.restore();
        Plot.dot(ctx, x, y, 15, C.ink); ctx.lineWidth = 4; ctx.strokeStyle = C.paper; ctx.stroke();
        const p = sig(S.z);
        const right = S.z >= 0;   // the curve is flat on the far side, so the label sits there
        const txt = `score ${S.z >= 0 ? '+' : ''}${S.z.toFixed(1)} → ${(100 * p).toFixed(p < 0.01 || p > 0.99 ? 1 : 0)}%`;
        const tw = textW(ctx, C, txt, 36, 'mono', 600);
        // left edge of the label, kept inside the plot
        const lx = Math.max(L + 16, Math.min(W - R - tw, right ? x + 30 : x - 30 - tw));
        label(ctx, C, txt, lx, y + (right ? 50 : -50), { size: 36, kind: 'mono', weight: 600, halo: true });
        zt.textContent = (S.z >= 0 ? '+' : '') + S.z.toFixed(1);
        pt.textContent = (100 * p).toFixed(p < 0.01 || p > 0.99 ? 1 : 0) + '%';
        lt.textContent = (-Math.log(p)).toFixed(2);
      }
      let drag = false;
      const setZ = e => { S.z = Math.round(10 * Math.max(-6.5, Math.min(6.5, sx.inv(cv.pos(e)[0])))) / 10; draw(); };
      cv.cv.addEventListener('pointerdown', e => { drag = true; cv.cv.setPointerCapture(e.pointerId); setZ(e); });
      cv.cv.addEventListener('pointermove', e => { if (drag) setZ(e); });
      cv.cv.addEventListener('pointerup', () => { drag = false; });
      cv.cv.addEventListener('pointercancel', () => { drag = false; });
      draw();
      api.onTheme(draw);
    },
    notes: `
    <p class="time">1.5 min</p>
    <p class="say">One important word: logit. The last layer of our network is a plain linear layer, so it outputs any number, like −3 or +2.5. We call that number the score, or logit. It is not a percentage yet. The S-shaped sigmoid turns it into a chance: score 0 means 50%, +2 means 88%, −2 means 12%.</p>
    <p class="do">Drag along the curve (click anywhere on it): show 0 → 50%, +2 → 88%, −2 → 12%, and that even +6 never quite reaches 100%. Then press → to show the pipeline. The numbers in the pipeline follow the dot: drag again and watch score → % → loss update.</p>
    <p class="say">In PyTorch the model stops at the score. The loss, <code>nn.BCEWithLogitsLoss</code>, applies the sigmoid itself, then the log. "With logits" in the name means: give me the raw scores. When you need the actual percentage, for a submission or to look at, you call <code>torch.sigmoid(score)</code> yourself.</p>
    <p class="ask">Why let the loss do the sigmoid instead of the model?</p>
    <p class="ans">It is more accurate on a computer. For a very confident wrong score (say −120 for a shot that went in) the sigmoid rounds to exactly 0 in float32, and log(0) is minus infinity. PyTorch's separate <code>nn.BCELoss</code> then caps the loss at 100 and the gradient becomes 0: the model cannot learn from its worst mistake. Done together, <code>BCEWithLogitsLoss</code> computes the loss exactly (120) with a full-size gradient (−1). (We checked both numbers in PyTorch.)</p>
    <p>Background: logit = log-odds, z = ln(p / (1 − p)); σ(z) = 1/(1 + e^(−z)). The PyTorch docs: BCEWithLogitsLoss "combines a Sigmoid layer and the BCELoss in one single class" and is "more numerically stable". Remember this slide: the last slide of this section asks what happens if you add a sigmoid to the model anyway.</p>`,
  });

  /* =====================================================================
     5. Loss at the start (P3) and Kobe's number to beat
     ===================================================================== */
  Deck.slide({
    id: 'loss-start',
    title: 'Predict: the first loss of a fresh network',
    html: `
    <div class="row" style="gap:32px"><span class="tag tag-predict">predict</span><h2>Untrained network on Kobe: first loss?</h2></div>
    <div class="lx-cards lx-start-cards">
      ${['0', '0.50', '0.69', '1.00'].map((v, i) => `<div class="lx-card${i === 2 ? ' is-ans' : ''}"><span class="n">${i + 1}</span><span class="v">${v}</span><span class="tick">✓</span></div>`).join('')}
    </div>
    <p class="lead" data-step="1">Untrained = "50% for every shot" → loss <b class="mono">0.69</b></p>
    <div class="lx-facts" data-step="2">
      <span class="k">0.69</span><span>5 fresh PyTorch networks: 0.691 · 0.690 · 0.703 · 0.697 · 0.683</span>
      <span class="k">0.687</span><span>always say "44.6%" (Kobe's average): <mark>the number to beat</mark></span>
    </div>`,
    init(el, api) {
      const cards = el.querySelector('.lx-start-cards');
      api.onStep(k => cards.classList.toggle('is-rev', k >= 1));
    },
    notes: `
    <p class="time">1.5 min</p>
    <p class="say">Before any training, the network's weights are random and small, so every score comes out close to 0. What is the first loss it prints on Kobe's shots? Pick 1, 2, 3 or 4.</p>
    <p class="do">30 seconds of thinking, then everyone shows fingers at once. Press → to reveal 0.69.</p>
    <p class="say">Score 0 means 50% for every shot, a coin flip. A 50% forecast costs 0.69 whether the shot goes in or not, so the average is 0.69. This is your first sanity check in every project: if the first printed loss is 2 or 50, something is broken before you have even started.</p>
    <p class="do">Press → again. Point at the two numbers.</p>
    <p class="say">We really ran five fresh networks: all around 0.69. And the simplest honest model, "every shot has a 44.6% chance", Kobe's overall average, scores 0.687. That is the number your network has to beat. Notice how close it is to 0.69: all the real learning happens in the last few hundredths.</p>
    <p class="ask">If a classmate's network finishes training at 0.688, what has it learned?</p>
    <p class="ans">Basically nothing beyond Kobe's average. Below 0.687 it starts using where he shot from.</p>
    <p>Background: −ln 0.5 = ln 2 = 0.693. Best constant: −[0.446·ln 0.446 + 0.554·ln 0.554] = 0.687. The five values are 2-8-8-1 ReLU networks with PyTorch's default initialisation, standardised inputs, seeds 0–4, on all 25,697 labelled shots. Karpathy's training recipe calls this "verify loss @ init". After the break, in the live coding, we will see a first loss that is far from 0.69, and why.</p>`,
  });

  /* =====================================================================
     6. Which loss: number / yes-no / one of K (softmax shown as numbers)
     ===================================================================== */
  const glyphNum = `<svg class="dg" viewBox="0 0 260 120" width="340" height="157" aria-hidden="true">
      <line x1="10" y1="80" x2="250" y2="80" style="stroke:var(--muted);stroke-width:3"/>
      ${[20, 70, 120, 170, 220].map(x => `<line x1="${x}" y1="70" x2="${x}" y2="90" style="stroke:var(--muted);stroke-width:3"/>`).join('')}
      <path d="M150,38 L150,70" style="stroke:var(--ink);stroke-width:5"/><circle cx="150" cy="80" r="11" class="ink"/>
      <text class="lbl" x="150" y="16">3.7</text></svg>`;
  const glyphYes = `<svg class="dg" viewBox="0 0 260 120" width="340" height="157" aria-hidden="true">
      <circle cx="70" cy="60" r="34" class="c1"/><text class="lbl" x="70" y="60" style="fill:var(--paper)">in</text>
      <circle cx="190" cy="60" r="34" class="c0"/><text class="lbl" x="190" y="60" style="fill:var(--paper)">out</text></svg>`;
  // logits for (jump shot, layup, dunk, other) -> softmax 14%, 61%, 22%, 3%
  const glyphK = (() => {
    const z = [0.5, 2.0, 1.0, -1.0], e = z.map(Math.exp), s = e.reduce((a, b) => a + b, 0);
    return `<svg class="dg" viewBox="0 0 400 176" width="400" height="176" aria-hidden="true">
      ${e.map((v, i) => { const h = 96 * v / s / 0.61; const x = 14 + i * 98; return `<rect x="${x}" y="${136 - h}" width="64" height="${h}" class="ink"/><text class="lbl" x="${x + 32}" y="${116 - h}">${Math.round(100 * v / s)}%</text><text class="lbl-s" x="${x + 32}" y="160">${['jump', 'layup', 'dunk', 'other'][i]}</text>`; }).join('')}
      <line x1="6" y1="136" x2="394" y2="136" style="stroke:var(--muted);stroke-width:3"/></svg>`;
  })();

  Deck.slide({
    id: 'loss-pick',
    title: 'Pick the loss from what you predict',
    html: `
    <h2>Pick the loss from what you predict</h2>
    <div class="lx-pick">
      <span class="hd"></span><span class="hd">you predict</span><span class="hd">last layer</span><span class="hd">PyTorch loss</span>
      <div class="cell" data-step="1">${glyphNum}</div>
      <div class="cell" data-step="1"><span class="what">a number</span><span class="eg">inversion task's output</span></div>
      <div class="cell" data-step="1"><span class="last">1 output</span></div>
      <div class="cell" data-step="1"><span class="fn">nn.MSELoss()</span></div>
      <div class="cell" data-step="2">${glyphYes}</div>
      <div class="cell" data-step="2"><span class="what">yes / no</span><span class="eg">Kobe: in or out?</span></div>
      <div class="cell" data-step="2"><span class="last">1 score</span></div>
      <div class="cell" data-step="2"><span class="fn">nn.BCEWithLogitsLoss()</span></div>
      <div class="cell" data-step="3">${glyphK}</div>
      <div class="cell" data-step="3"><span class="what">one of K</span><span class="eg">shot type: jump, layup, dunk…</span></div>
      <div class="cell" data-step="3"><span class="last">K scores</span></div>
      <div class="cell" data-step="3"><span class="fn">nn.CrossEntropyLoss()</span></div>
    </div>
    <p class="lead" data-step="4">The last layer is plain <b>Linear</b>: the loss adds sigmoid or softmax.</p>`,
    notes: `
    <p class="time">2 min</p>
    <p class="say">Three kinds of questions cover almost every task, each with its loss. Before each row, let the class guess.</p>
    <p class="do">→ Row 1, a number (the inversion task): one output, mean squared error.</p>
    <p class="do">→ Row 2, yes/no (Kobe): one score, BCEWithLogitsLoss, the forecast loss; targets 0. or 1. as floats.</p>
    <p class="do">→ Row 3, one of K classes: K scores; softmax turns them into shares (the bars), and the loss punishes a low share for the right answer.</p>
    <p class="do">→ The rule: the model ends with plain Linear; the loss does the squashing.</p>
    <p class="ask">Which of 10 digits is in an image: how many outputs, which loss?</p>
    <p class="ans">10 scores, nn.CrossEntropyLoss. Untrained, each class gets 10%, so the first loss is about 2.3.</p>
    <p>CrossEntropyLoss wants raw scores and class numbers 0 … K−1 as integers, not one-hot.</p>`,
  });

  /* =====================================================================
     7. Cliffhanger (P4): vote, discuss, re-vote. No reveal here.
     ===================================================================== */
  Deck.slide({
    id: 'loss-vote',
    title: 'Cliffhanger: sigmoid + BCEWithLogitsLoss',
    html: `
    <div class="row" style="gap:32px"><span class="tag tag-predict">predict</span><h2>A sigmoid at the end. What happens?</h2></div>
    <div class="lx-vote">
      ${Code.py(`
        class MLP(nn.Module):
            ...
            def forward(self, x):
                x = torch.relu(self.fc1(x))
                x = torch.relu(self.fc2(x))
                return torch.sigmoid(self.fc3(x))

        loss_fn = nn.BCEWithLogitsLoss()`, { hl: '1:6,8 2:6,8', size: 'l' })}
      <div class="lx-opts">
        <div class="lx-opt"><b>1</b>it crashes</div>
        <div class="lx-opt"><b>2</b>it trains normally</div>
        <div class="lx-opt"><b>3</b>it trains, but is quietly worse</div>
        <div class="lx-opt"><b>4</b>the loss becomes NaN</div>
      </div>
    </div>
    <p class="lead" data-step="2">Talk 1 minute with a neighbour, then vote again.</p>`,
    steps: 2,
    notes: `
    <p class="time">2 min</p>
    <p class="say">Last question before the break. A classmate wants the model to output a chance, so they add a sigmoid at the end and keep BCEWithLogitsLoss. What happens?</p>
    <p class="do">→ highlights the two lines; 30 seconds of silence, then a finger vote (note the counts). → One minute with a neighbour, re-vote. Do not reveal: "we run it after the break."</p>
    <p class="ask">1 crash, 2 trains normally, 3 quietly worse, 4 NaN?</p>
    <p class="ans">For you only (revealed after the break): 3. The loss adds a second sigmoid: printed loss looks normal (about 0.68), accuracy about 61%, but the outputs become extreme; their true log loss is about 4.5, against 0.67 when correct (about 3 out of 4 outputs say "less than 1%").</p>
    <p>No crash (shapes are fine) and no NaN: the loss's own sigmoid lifts any output to at least 50%.</p>`,
  });
})();
