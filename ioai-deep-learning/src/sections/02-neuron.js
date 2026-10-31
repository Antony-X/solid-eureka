Deck.section({ id: 'neu', title: 'From one neuron to an MLP', minutes: 18 });

Deck.css(`
.sec-neu .neu-demo { display: flex; gap: 48px; align-items: flex-start; flex: 1; min-height: 0; }
.sec-neu .neu-side { display: flex; flex-direction: column; gap: 24px; min-width: 0; flex: 1; }
.sec-neu .neu-side .ui-slider { grid-template-columns: 190px 1fr 120px; }
.sec-neu .neu-ctl { display: flex; flex-direction: column; gap: 14px; }
.sec-neu .neu-readouts { display: flex; gap: 56px; }
.sec-neu .neu-cap { font-size: 32px; color: var(--muted); }
.sec-neu .neu-row { display: flex; gap: 48px; align-items: flex-start; flex: 1; min-height: 0; }
.sec-neu .neu-steps { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 22px; font-size: 34px; }
.sec-neu .neu-steps li { display: grid; grid-template-columns: 56px 1fr; gap: 12px; align-items: baseline; }
.sec-neu .neu-steps b { font-family: var(--font-mono); color: var(--muted); font-size: 30px; }
.sec-neu .neu-steps .v { font-family: var(--font-mono); font-weight: 600; }
.sec-neu .truth { font-family: var(--font-mono); font-size: 36px; border-collapse: collapse; }
.sec-neu .truth td, .sec-neu .truth th { padding: 8px 16px; text-align: center; border-bottom: 2px solid var(--rule); white-space: nowrap; }
.sec-neu .truth th { font-size: 28px; color: var(--muted); font-weight: 600; }
.sec-neu .truth .sep { border-left: 3px solid var(--rule); }
.sec-neu .t-code { display: grid; grid-template-columns: 1056px 1fr; gap: 96px; align-items: start; flex: 1; min-height: 0; }
.sec-neu .t-effect { min-width: 0; }
.sec-neu .t-effect > div { display: flex; flex-direction: column; gap: 20px; }
.sec-neu .out { font-family: var(--font-mono); font-size: 36px; font-weight: 600; background: var(--code-bg); padding: 10px 20px; border-left: 6px solid var(--muted); width: fit-content; }
.sec-neu .qa { display: flex; flex-direction: column; gap: 40px; }
.sec-neu .qa .q { font-size: 40px; }
.sec-neu .qa .a { font-family: var(--font-mono); font-size: 40px; font-weight: 600; }
.sec-neu .scale-list { display: flex; flex-direction: column; gap: 28px; }
.sec-neu .scale-list > div { display: grid; grid-template-columns: 1fr auto; gap: 24px; align-items: baseline; border-bottom: 2px solid var(--rule); padding-bottom: 12px; font-size: 38px; }
.sec-neu .scale-list .n { font-family: var(--font-mono); font-weight: 600; font-size: 38px; }
.sec-neu .fwd-btns { display: flex; gap: 20px; flex-wrap: wrap; align-items: center; }
`);

(() => {
  // ---------- small helpers (section scope) ----------
  const fmt = (v, d = 1) => {
    const s = Math.abs(v) < 0.5 * Math.pow(10, -d) ? (0).toFixed(d) : Math.abs(v).toFixed(d);
    return (v < 0 && +s !== 0 ? '−' : '') + s;
  };
  const trim = s => s.replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1');
  const fnum = (v, d = 2) => { const s = trim(Math.abs(v).toFixed(d)); return (v < -1e-9 && s !== '0' ? '−' : '') + s; };
  const relu = z => (z > 0 ? z : 0);
  const sig = z => 1 / (1 + Math.exp(-z));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const glyph = (kind, cx, cy, s) => {
    if (kind === 'relu') return `M${cx - s},${cy + s * 0.5} L${cx},${cy + s * 0.5} L${cx + s},${cy - s * 0.7}`;
    let d = '';
    for (let i = 0; i <= 24; i++) { const t = -1 + 2 * i / 24; const y = sig(t * 5); d += (i ? ' L' : 'M') + (cx + t * s).toFixed(1) + ',' + (cy + s * 0.6 - 1.2 * s * y).toFixed(1); }
    return d;
  };

  /* =====================================================================
     1. One neuron: weigh, add, bend
     ===================================================================== */
  Deck.slide({
    id: 'neu-neuron',
    title: 'One neuron: weigh, add, bend',
    html: `
    <h2>A neuron: weigh the inputs, add, bend</h2>
    <div class="neu-demo">
      <svg class="dg" viewBox="0 0 1000 640" width="1000" height="640" role="img" aria-label="one neuron with two inputs, a bias, a sum and an activation">
        <text class="lbl-s" x="96" y="40">inputs</text>
        <text class="lbl-s" x="300" y="40">weights</text>
        <text class="lbl-s" x="510" y="40">add</text>
        <text class="lbl-s" x="735" y="40">bend</text>
        <text class="lbl-s" x="925" y="40">output</text>
        <line class="w" id="n1-e0" x1="96" y1="150" x2="510" y2="330"/>
        <line class="w" id="n1-e1" x1="96" y1="330" x2="510" y2="330"/>
        <line class="w" id="n1-e2" x1="96" y1="520" x2="510" y2="330"/>
        ${[[150, 0.45], [330, 0.45], [520, 0.45]].map(([y, t], k) => {
          const lx = 96 + (510 - 96) * t, ly = y + (330 - y) * t;
          return `<rect x="${lx - 62}" y="${ly - 24}" width="124" height="48" fill="var(--paper)"/><text class="lbl" id="n1-l${k}" x="${lx}" y="${ly}">×1</text>`;
        }).join('')}
        <circle class="nrn in" cx="96" cy="150" r="46"/><text class="lbl" x="96" y="150" style="font-size:36px">1</text>
        <circle class="nrn in" cx="96" cy="330" r="46"/><text class="lbl" x="96" y="330" style="font-size:36px">2</text>
        <rect class="box" x="58" y="482" width="76" height="76"/><text class="lbl" x="96" y="520" style="font-size:36px">1</text>
        <text class="lbl-m" x="20" y="150">x₁</text><text class="lbl-m" x="20" y="330">x₂</text>
        <text class="lbl-s" x="96" y="600">bias</text>
        <circle class="nrn" cx="510" cy="330" r="74"/>
        <text class="lbl" id="n1-z" x="510" y="330" style="font-size:44px">0</text>
        <text class="lbl-s" id="n1-sum" x="510" y="450">0 + 0 + 0</text>
        <line class="flow" x1="586" y1="330" x2="652" y2="330"/>
        <rect class="box act" x="665" y="272" width="140" height="116"/>
        <path id="n1-glyph" d="" fill="none" style="stroke:var(--ink);stroke-width:6;stroke-linecap:round;stroke-linejoin:round"/>
        <text class="lbl-s" id="n1-act" x="735" y="420">ReLU</text>
        <line class="flow" x1="810" y1="330" x2="856" y2="330"/>
        <text class="lbl-b" id="n1-o" x="874" y="330" style="font-size:56px;text-anchor:start">0</text>
      </svg>
      <div class="neu-side">
        <p class="n1-cap" style="font-size:34px;font-weight:600;margin:0"></p>
        <div class="n1-plot"></div>
        <div class="neu-ctl"></div>
      </div>
    </div>`,
    init(el, api) {
      const S = { w: [0.5, 1], b: -1, act: 'relu' };
      const x = [1, 2];
      const plotHost = el.querySelector('.n1-plot');
      const cv = Plot.canvas(plotHost, 680, 380);
      const ctl = el.querySelector('.neu-ctl');
      const $ = s => el.querySelector(s);
      function draw() {
        const z = S.w[0] * x[0] + S.w[1] * x[1] + S.b;
        const f = S.act === 'relu' ? relu : sig;
        const out = f(z);
        // diagram
        const ws = [S.w[0], S.w[1], S.b];
        ws.forEach((w, k) => {
          const e = $('#n1-e' + k);
          e.setAttribute('class', 'w ' + (Math.abs(w) < 0.05 ? 'off' : w > 0 ? 'pos' : 'neg'));
          e.style.strokeWidth = (3 + 8 * Math.min(1, Math.abs(w) / 2)).toFixed(1);
          $('#n1-l' + k).textContent = '×' + fnum(w, 1);
        });
        const parts = [S.w[0] * x[0], S.w[1] * x[1], S.b];
        $('#n1-sum').textContent = parts.map((p, i) => (i ? (p < 0 ? '− ' : '+ ') + fnum(Math.abs(p), 1) : fnum(p, 1))).join(' ');
        $('#n1-z').textContent = fnum(z, 2);
        $('#n1-o').textContent = S.act === 'relu' ? fnum(out, 2) : fnum(out, 2);
        $('#n1-glyph').setAttribute('d', glyph(S.act, 735, 330, 44));
        $('#n1-act').textContent = S.act === 'relu' ? 'ReLU' : 'sigmoid';
        // activation plot
        const C = Plot.colors(), ctx = cv.ctx;
        cv.clear();
        const sx = Plot.scale(-4, 4, 70, 660);
        const sy = S.act === 'relu' ? Plot.scale(-1, 4, 330, 40) : Plot.scale(-0.25, 1.25, 330, 40);
        Plot.axes(ctx, sx, sy, { font: 28, xt: [-4, -2, 0, 2, 4], yt: S.act === 'relu' ? [0, 1, 2, 3, 4] : [0, 0.5, 1], fmt: v => fnum(v, 1) });
        Plot.fn(ctx, sx, sy, f, { color: C.ink, width: 5 });
        const zc = clamp(z, -4, 4);
        ctx.save(); ctx.setLineDash([8, 8]); ctx.strokeStyle = C.muted; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(sx(zc), sy(0)); ctx.lineTo(sx(zc), sy(f(zc))); ctx.lineTo(sx(-4), sy(f(zc))); ctx.stroke(); ctx.restore();
        Plot.dot(ctx, sx(zc), sy(f(zc)), 12, C.ink, C.paper);
        Plot.text(ctx, 'output', sx(0) + 14, 30, { size: 28, color: C.ink, base: 'top' });
        Plot.text(ctx, 'sum', 660, sy(0) - 12, { size: 28, color: C.ink, align: 'right' });
        $('.n1-cap').textContent = S.act === 'relu' ? 'ReLU: a negative sum becomes 0' : 'sigmoid: this neuron is logistic regression';
      }
      const sl = [
        UI.slider(ctl, { label: 'weight 1', min: -2, max: 2, step: 0.1, value: S.w[0], fmt: v => fnum(v, 1), oninput: v => { S.w[0] = v; draw(); } }),
        UI.slider(ctl, { label: 'weight 2', min: -2, max: 2, step: 0.1, value: S.w[1], fmt: v => fnum(v, 1), oninput: v => { S.w[1] = v; draw(); } }),
        UI.slider(ctl, { label: 'bias', min: -3, max: 3, step: 0.1, value: S.b, fmt: v => fnum(v, 1), oninput: v => { S.b = v; draw(); } }),
      ];
      const row = UI.row(ctl);
      UI.choice(row, [{ value: 'relu', label: 'ReLU' }, { value: 'sigmoid', label: 'sigmoid' }], S.act, v => { S.act = v; draw(); });
      UI.button(row, 'Reset', () => { S.w = [0.5, 1]; S.b = -1; sl[0].set(0.5); sl[1].set(1); sl[2].set(-1); draw(); });
      draw();
      api.onTheme(draw);
    },
    notes: `
    <p class="time">2 min</p>
    <p class="say">A neuron multiplies each input by its weight, adds them up with a bias, then bends the result. With a sigmoid as the bend it is exactly the one-line model from before (logistic regression, if you have seen it). Inside networks we usually bend with ReLU: keep positive sums, turn negative ones into 0.</p>
    <p class="do">Inputs are 1 and 2: point at weigh, add (0.5 + 2 − 1 = 1.5), bend (ReLU keeps 1.5). Drag "weight 1" to −2: the sum is −1 and the output snaps to 0, "the neuron is off". Click "sigmoid": the output becomes a chance.</p>
    <p class="ask">With ReLU, what comes out for a sum of −3? Of +3?</p>
    <p class="ans">0 and 3: negative sums are switched off, positive ones pass through.</p>
    <p>Maths for you: output = φ(w₁x₁ + w₂x₂ + b), φ = ReLU, max(0, z), or σ. Avoid "it works like a brain cell": real neurons are far more complex.</p>`,
  });

  /* =====================================================================
     2. One neuron = one straight cut of Kobe's court
     ===================================================================== */
  Deck.slide({
    id: 'neu-line',
    title: 'One neuron cuts the court with a line',
    html: `
    <h2>One neuron cuts the court with a straight line</h2>
    <div class="neu-demo">
      <div class="n2-court"></div>
      <div class="neu-side" style="align-self:stretch">
        <div class="neu-readouts"></div>
        <p class="neu-cap" style="margin-top:8px">Arrow: the orange side, where this neuron says "made".</p>
        <div class="neu-ctl" style="margin-top:auto"></div>
      </div>
    </div>`,
    init(el, api) {
      const S = { th: -90, d: -1.0, s: 2, act: 'sigmoid' };
      const W = 768;
      const fr = Widgets.courtFrame(0, 0, W);
      const cv = Plot.canvas(el.querySelector('.n2-court'), W, Math.ceil(fr.h));
      const rr = el.querySelector('.neu-readouts');
      const rAcc = UI.readout(rr, 'this line');
      const rBase = UI.readout(rr, 'always "miss"');
      const rW = UI.readout(rr, 'weights · bias');
      const D = window.KOBE, N = D.X.length;
      const base = 1 - D.Y.reduce((a, b) => a + b, 0) / N;
      rBase.set((100 * base).toFixed(1) + '%');
      const show = 500;
      function params() {
        const t = S.th * Math.PI / 180, c = Math.cos(t), sn = Math.sin(t);
        return { c, sn, w1: S.s * c, w2: S.s * sn, b: -S.s * S.d };
      }
      function draw() {
        const P = params();
        const zf = (x, y) => P.w1 * x / 100 + P.w2 * y / 100 + P.b;
        const C = Plot.colors(), ctx = cv.ctx;
        cv.clear(C.paper);
        if (S.act === 'sigmoid') Plot.heat(ctx, (x, y) => sig(zf(x, y)), fr, { res: 64, strength: 0.6 });
        else Plot.heat(ctx, (x, y) => 0.5 + 0.5 * Math.min(1, relu(zf(x, y)) / 3), fr, { res: 64, strength: 0.65, gamma: 1 });
        ctx.save(); ctx.lineWidth = 2; ctx.strokeStyle = C.paper;
        for (let i = 0; i < show; i++) {
          ctx.beginPath(); ctx.arc(fr.sx(D.X[i][0]), fr.sy(D.X[i][1]), 6, 0, 2 * Math.PI);
          ctx.fillStyle = D.Y[i] ? C.c1 : C.c0; ctx.fill(); ctx.stroke();
        }
        ctx.restore();
        Widgets.drawCourt(ctx, fr, { color: C.muted, width: 3 });
        // the line z = 0 and the arrow (normal) anchored near the middle of the court
        const q = [0, 1.6], k = P.c * q[0] + P.sn * q[1] - S.d;
        const a = [q[0] - k * P.c, q[1] - k * P.sn];
        const px = (u, v) => [fr.sx(u * 100), fr.sy(v * 100)];
        ctx.save(); ctx.beginPath(); ctx.rect(0, 0, cv.w, cv.h); ctx.clip();
        const p1 = px(a[0] - 10 * P.sn, a[1] + 10 * P.c), p2 = px(a[0] + 10 * P.sn, a[1] - 10 * P.c);
        ctx.strokeStyle = C.ink; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(p1[0], p1[1]); ctx.lineTo(p2[0], p2[1]); ctx.stroke();
        const L = 0.8 + 0.08 * S.s;
        const h0 = px(a[0], a[1]), h1 = px(a[0] + L * P.c, a[1] + L * P.sn);
        Plot.arrow(ctx, h0[0], h0[1], h1[0], h1[1], { color: C.ink, width: 6, head: 26 });
        Plot.dot(ctx, h0[0], h0[1], 9, C.ink, C.paper);
        ctx.restore();
        let ok = 0;
        for (let i = 0; i < N; i++) ok += ((zf(D.X[i][0], D.X[i][1]) > 0 ? 1 : 0) === D.Y[i]) ? 1 : 0;
        rAcc.set((100 * ok / N).toFixed(1) + '%');
        rW.set(`<span style="font-size:34px">${fnum(P.w1, 1)}, ${fnum(P.w2, 1)} · ${fnum(P.b, 1)}</span>`);
      }
      const ctl = el.querySelector('.neu-ctl');
      const sl = [
        UI.slider(ctl, { label: 'turn', min: -180, max: 180, step: 5, value: S.th, fmt: v => Math.round(v) + '°', oninput: v => { S.th = v; draw(); } }),
        // shown as the line's distance from the rim (positive: the rim is on the orange side)
        UI.slider(ctl, { label: 'shift', min: -4, max: 3, step: 0.1, value: -S.d, fmt: v => fnum(v * 10, 0) + ' ft', oninput: v => { S.d = -v; draw(); } }),
        UI.slider(ctl, { label: 'steepness', min: 0.3, max: 8, step: 0.1, value: S.s, fmt: v => v.toFixed(1), oninput: v => { S.s = v; draw(); } }),
      ];
      const row = UI.row(ctl);
      UI.choice(row, [{ value: 'sigmoid', label: 'sigmoid' }, { value: 'relu', label: 'ReLU' }], S.act, v => { S.act = v; draw(); });
      UI.button(row, 'Reset', () => { S.th = -90; S.d = -1; S.s = 2; sl[0].set(-90); sl[1].set(1); sl[2].set(2); draw(); });
      draw();
      api.onTheme(draw);
    },
    notes: `
    <p class="time">2 min</p>
    <p class="say">Now feed the neuron every spot on Kobe's court: orange where it says "made", blue where it says "missed". Whatever the weights, the border is always a straight line; the arrow points to the orange side.</p>
    <p class="do">Start: the line is 10 ft out, accuracy 54.5%, worse than "always miss" (55.4%). Let students steer turn (the weights), shift (the bias) and steepness to beat 55%: the best is about 59%, a line hugging the rim. Switch to ReLU once: the far side goes plain, the neuron is off there.</p>
    <p class="ask">Kobe scores near the rim and misses far away, in every direction. Can one line separate near from far?</p>
    <p class="ans">No: "near the rim" has a curved border. One line gets about 59%; the full network, combining several lines, about 61%.</p>
    <p>The arrow is the weight pair (w₁, w₂), at right angles to the line.</p>`,
  });

  /* =====================================================================
     3. On paper: a forward pass through a 2-2-1 network (E1)
     ===================================================================== */
  const E1 = (() => {
    const IN = [[150, 170], [150, 470]], H = [[590, 170], [590, 470]], O = [990, 320];
    const E = [[IN[0], H[0], 1, 0.5], [IN[1], H[0], -1, 0.25], [IN[0], H[1], 0.5, 0.25], [IN[1], H[1], 1, 0.5], [H[0], O, 2, 0.45], [H[1], O, -1, 0.45]];
    const line = ([p, q, w]) => `<line class="w ${w > 0 ? 'pos' : 'neg'}" x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${q[1]}" style="stroke-width:${3 + 3 * Math.abs(w)}"/>`;
    const lab = ([p, q, w, t]) => {
      const lx = p[0] + (q[0] - p[0]) * t, ly = p[1] + (q[1] - p[1]) * t;
      return `<rect x="${lx - 40}" y="${ly - 24}" width="80" height="48" fill="var(--paper)"/><text class="lbl" x="${lx}" y="${ly}">${fnum(w, 1)}</text>`;
    };
    return `<svg class="dg" viewBox="0 0 1220 650" width="1220" height="650" role="img" aria-label="2-2-1 network with x = (1, 2)">
      ${E.map(line).join('')}
      <g data-step="2"><line x1="${H[0][0]}" y1="${H[0][1]}" x2="${O[0]}" y2="${O[1]}" style="stroke-width:14;stroke:var(--paper)"/>
        <line class="w off" x1="${H[0][0]}" y1="${H[0][1]}" x2="${O[0]}" y2="${O[1]}" style="stroke-width:5"/></g>
      ${E.map(lab).join('')}
      <circle class="nrn in" cx="150" cy="170" r="54"/><text class="lbl" x="150" y="170" style="font-size:40px">1</text>
      <circle class="nrn in" cx="150" cy="470" r="54"/><text class="lbl" x="150" y="470" style="font-size:40px">2</text>
      <text class="lbl-m" x="50" y="170">x₁</text><text class="lbl-m" x="50" y="470">x₂</text>
      <circle class="nrn" cx="590" cy="170" r="58"/><circle class="nrn" cx="590" cy="470" r="58"/>
      <text class="lbl-s" x="590" y="84">bias 0</text><text class="lbl-s" x="590" y="562">bias −1</text>
      <circle class="nrn out" cx="990" cy="320" r="58"/><text class="lbl-s" x="990" y="410">bias +0.5</text>
      <g data-only="1"><text class="lbl" x="590" y="170" style="font-size:40px">−1</text><text class="lbl" x="590" y="470" style="font-size:40px">1.5</text>
        <text class="lbl-s" x="700" y="110">sum</text><text class="lbl-s" x="690" y="540">sum</text></g>
      <g data-step="2"><text class="lbl" x="590" y="170" style="font-size:40px;fill:var(--muted)">0</text><text class="lbl" x="590" y="470" style="font-size:40px">1.5</text>
        <text class="lbl-s" x="700" y="110">off</text><text class="lbl-s" x="690" y="540">on</text></g>
      <g data-step="3"><text class="lbl" x="990" y="320" style="font-size:40px">−1</text></g>
      <g data-step="4"><text class="lbl-b" x="1140" y="300" style="font-size:56px">27%</text><text class="lbl-s" x="1140" y="352">goes in</text></g>
      <g data-step="5"><text class="lbl-b" x="1000" y="520" style="font-size:44px">loss 1.31</text><text class="lbl-s" x="1000" y="566">it was made</text></g>
    </svg>`;
  })();
  Deck.slide({
    id: 'neu-e1',
    title: 'On paper: one forward pass',
    html: `
    <div class="row" style="gap:32px"><span class="tag tag-paper">on paper</span><h2>One forward pass, by hand</h2></div>
    <div class="neu-row">
      ${E1}
      <ol class="neu-steps">
        <li data-step="1" class="dim-after"><b>1</b><span>multiply, add</span></li>
        <li data-step="2" class="dim-after"><b>2</b><span>ReLU: negative → 0</span></li>
        <li data-step="3" class="dim-after"><b>3</b><span>multiply, add</span></li>
        <li data-step="4" class="dim-after"><b>4</b><span>sigmoid → a chance</span></li>
        <li data-step="5" class="dim-after"><b>5</b><span>loss: how wrong?</span></li>
      </ol>
    </div>`,
    notes: `
    <p class="time">3 min</p>
    <p class="say">Before any code, let's push one input through a tiny network by hand. Two inputs, two hidden ReLU neurons, one output neuron with a sigmoid. Copy the diagram and compute each step before I reveal it. Every neuron does the same three things you just saw: weigh, add, bend.</p>
    <p class="do">Give 60 seconds for steps 1–2 on paper, then press → once per step. The numbers appear on the diagram:</p>
    <ul>
      <li>Step 1, hidden sums: top = 1·1 + (−1)·2 + 0 = <b>−1</b>; bottom = 0.5·1 + 1·2 − 1 = <b>1.5</b>.</li>
      <li>Step 2, ReLU: −1 becomes <b>0</b> (the top neuron is off, its arrow turns dotted), 1.5 stays <b>1.5</b>.</li>
      <li>Step 3, output sum: 2·0 + (−1)·1.5 + 0.5 = <b>−1</b>.</li>
      <li>Step 4, sigmoid: σ(−1) = 1/(1 + e¹) = <b>0.269</b>, "27% chance it goes in".</li>
      <li>Step 5, the shot was made (y = 1): loss = −ln(0.269) = <b>1.313</b>. The network gave a made shot only a 27% chance, so the loss is high (a perfect 100% would give loss 0); the loss section explains this.</li>
    </ul>
    <p class="ask">The top hidden neuron output 0. How much does its outgoing weight (2) matter for this shot?</p>
    <p class="ans">Not at all: 2 × 0 = 0. And during training it will also get zero gradient for this shot. If a ReLU neuron is off for every shot, it never learns again: a "dead ReLU" (next section).</p>
    <p>Optional faded practice (E2) for fast students, the backward pass with learning rate 0.1: ∂L/∂z = p − y = −0.731; ∂L/∂w₂ = (0, −1.097); ∂L/∂b₂ = −0.731; the top hidden neuron gets gradient 0 (ReLU was off); bottom: ∂L/∂W₁ row 2 = (0.731, 1.462), ∂L/∂b₁ = (0, 0.731). After one step: w₂ = (2, −0.890), b₂ = 0.573, W₁ row 2 = (0.427, 0.854), b₁ = (0, −1.073); new p = 0.408, loss 0.896 (down from 1.313). All numbers checked in PyTorch.</p>`,
  });

  /* =====================================================================
     4. Invent first: XOR with two hidden ReLUs (E4 / P2)
     ===================================================================== */
  const XOR = (() => {
    const IN = [[70, 80], [70, 300]], HID = [[330, 80], [330, 300]], OUT = [560, 190];
    const e = (p, q, cls, lab, t) => {
      const lx = p[0] + (q[0] - p[0]) * t, ly = p[1] + (q[1] - p[1]) * t;
      return `<line class="w ${cls}" x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${q[1]}" style="stroke-width:6"/>` +
        `<rect x="${lx - 30}" y="${ly - 22}" width="60" height="44" fill="var(--paper)"/>` +
        `<text class="lbl" x="${lx}" y="${ly}" data-until="1">?</text><text class="lbl" x="${lx}" y="${ly}" data-step="1">${lab}</text>`;
    };
    return `<svg class="dg" viewBox="0 0 640 400" width="736" height="460" role="img" aria-label="2-2-1 ReLU network for XOR">
      ${e(IN[0], HID[0], 'pos', '1', 0.5)}${e(IN[0], HID[1], 'pos', '1', 0.27)}
      ${e(IN[1], HID[0], 'pos', '1', 0.27)}${e(IN[1], HID[1], 'pos', '1', 0.5)}
      ${e(HID[0], OUT, 'pos', '+1', 0.5)}${e(HID[1], OUT, 'neg', '−2', 0.5)}
      <circle class="nrn in" cx="70" cy="80" r="42"/><text class="lbl-m" x="70" y="80">x₁</text>
      <circle class="nrn in" cx="70" cy="300" r="42"/><text class="lbl-m" x="70" y="300">x₂</text>
      <circle class="nrn" cx="330" cy="80" r="42"/><circle class="nrn" cx="330" cy="300" r="42"/>
      <path d="M306,92 L330,92 L354,64" fill="none" style="stroke:var(--ink);stroke-width:5"/>
      <path d="M306,312 L330,312 L354,284" fill="none" style="stroke:var(--ink);stroke-width:5"/>
      <text class="lbl-s" x="330" y="18" data-until="1">bias ?</text><text class="lbl-s" x="330" y="18" data-step="1">bias 0</text>
      <text class="lbl-s" x="330" y="370" data-until="1">bias ?</text><text class="lbl-s" x="330" y="370" data-step="1">bias −1</text>
      <text class="lbl-m" x="404" y="58" style="font-size:32px">h₁</text><text class="lbl-m" x="404" y="324" style="font-size:32px">h₂</text>
      <circle class="nrn out" cx="560" cy="190" r="42"/><text class="lbl-m" x="560" y="190">out</text>
      <text class="lbl-s" x="560" y="262">no bend</text>
    </svg>`;
  })();
  Deck.slide({
    id: 'neu-xor',
    title: 'Invent first: XOR with two ReLUs',
    html: `
    <div class="row" style="gap:32px"><span class="tag tag-pair">pairs · 2 min</span><h2>Find weights that compute XOR</h2></div>
    <div class="neu-row" style="gap:56px">
      <div class="col" style="gap:28px">${XOR}
        <p class="lead" data-step="3">Two hidden neurons solve what froze the field.</p></div>
      <table class="truth">
        <tr><th>x₁</th><th>x₂</th><th>want</th><th class="sep"><span data-step="2">h₁</span></th><th><span data-step="2">h₂</span></th><th><span data-step="2">out</span></th></tr>
        ${[[0, 0, 0], [0, 1, 1], [1, 0, 1], [1, 1, 0]].map(([a, b, y]) => {
          const h1 = a + b, h2 = Math.max(0, a + b - 1);
          return `<tr><td>${a}</td><td>${b}</td><td><b>${y}</b></td><td class="sep"><span data-step="2">${h1}</span></td><td><span data-step="2">${h2}</span></td><td><span data-step="2"><b>${h1 - 2 * h2}</b> <span class="ok">✓</span></span></td></tr>`;
        }).join('')}
      </table>
      <div class="stack">
        <div data-until="3" class="xor-timer"></div>
        <div data-step="3" class="col" style="gap:12px"><div class="xor-map"></div><p class="neu-cap">two parallel cuts, not one</p></div>
      </div>
    </div>`,
    init(el, api) {
      Widgets.timer(api, el.querySelector('.xor-timer'), 2);
      const S = 420;
      const cv = Plot.canvas(el.querySelector('.xor-map'), S, S);
      const fr = Plot.frame(30, 10, S - 40, [-0.5, 1.5]);
      const out = (a, b) => relu(a + b) - 2 * relu(a + b - 1);
      function draw() {
        const C = Plot.colors(), ctx = cv.ctx;
        cv.clear();
        Plot.heat(ctx, (a, b) => clamp(0.5 + (out(a, b) - 0.5), 0, 1), fr, { res: 80, strength: 0.6, smooth: true });
        Plot.contour(ctx, (a, b) => out(a, b), fr, { res: 80, level: 0.5, color: C.ink, width: 4 });
        ctx.save(); ctx.strokeStyle = C.rule; ctx.lineWidth = 2; ctx.strokeRect(fr.x0, fr.y0, fr.x1 - fr.x0, fr.y1 - fr.y0); ctx.restore();
        [[0, 0, 0], [0, 1, 1], [1, 0, 1], [1, 1, 0]].forEach(([a, b, y]) => Plot.dot(ctx, fr.sx(a), fr.sy(b), 18, y ? C.c1 : C.c0, C.paper));
        Plot.text(ctx, '(0,0)', fr.sx(0), fr.sy(0) + 26, { size: 28, color: C.ink, align: 'center', base: 'top' });
        Plot.text(ctx, '(1,1)', fr.sx(1), fr.sy(1) - 26, { size: 28, color: C.ink, align: 'center', base: 'bottom' });
      }
      draw();
      api.onTheme(draw);
    },
    notes: `
    <p class="time">3 min (2 min pair work, 1 min reveal)</p>
    <p class="say">XOR is "one or the other, but not both". It is the function a single neuron cannot learn, the one that stalled the field in 1969. Your turn to be the training algorithm: in pairs, find weights and biases for this network of two hidden ReLU neurons so that the output matches the "want" column for all four inputs. The output neuron just adds, no bend.</p>
    <p class="do">Press Start on the timer (2 min). Walk around. If a pair is stuck after a minute, give the hint: "let h₁ count how many inputs are on, and let h₂ fire only when both are on." Then press → to reveal the weights, → again for the table, → for the picture.</p>
    <ul>
      <li>Step 1: h₁ = ReLU(x₁ + x₂), h₂ = ReLU(x₁ + x₂ − 1), out = h₁ − 2·h₂.</li>
      <li>Step 2 (table): (0,0) → 0 − 0 = 0; (0,1) and (1,0) → 1 − 0 = 1; (1,1) → 2 − 2·1 = 0. Exactly XOR.</li>
      <li>Step 3 (picture): the output over the whole square. Orange where it is above 0.5. The orange band between two parallel lines covers (0,1) and (1,0), and leaves (0,0) and (1,1) outside. Two neurons = two cuts.</li>
    </ul>
    <p class="ask">Is this the only answer?</p>
    <p class="ans">No. Many weight settings work (for example swap the two hidden neurons, or scale weights and biases together). That is normal: training finds one of many good solutions, which is why different seeds give different networks.</p>
    <p>Story (30 s): Minsky and Papert's book <i>Perceptrons</i> (1969) proved a single-layer perceptron cannot compute XOR. They knew multi-layer networks could, but nobody knew how to train the hidden layer. Rosenblatt's Mark I perceptron even had a hidden layer, wired at random, and only its last layer learned. Funding dried up until backpropagation was popularised in 1986: backprop is what lets the hidden layer learn. Do not say "they proved neural networks can't do XOR"; that is a common myth.</p>`,
  });

  /* =====================================================================
     5. nn.Linear: a whole layer of neurons for a whole batch of shots
     ===================================================================== */
  const blk = (x, y, rows, cols, cw, ch, cls, label, sub, hlRow) => {
    let s = `<rect class="${cls}" x="${x}" y="${y}" width="${cols * cw}" height="${rows * ch}"/>`;
    for (let c = 1; c < cols; c++) s += `<line x1="${x + c * cw}" y1="${y}" x2="${x + c * cw}" y2="${y + rows * ch}" style="stroke:var(--ink);stroke-width:1.5;stroke-opacity:.45"/>`;
    if (ch >= 20) for (let r = 1; r < rows; r++) s += `<line x1="${x}" y1="${y + r * ch}" x2="${x + cols * cw}" y2="${y + r * ch}" style="stroke:var(--ink);stroke-width:1.5;stroke-opacity:.45"/>`;
    if (hlRow != null) s += `<rect x="${x}" y="${y + hlRow * ch}" width="${cols * cw}" height="${ch}" style="fill:var(--hi);stroke:var(--ink);stroke-width:3"/>`;
    if (label) s += `<text class="lbl" x="${x + cols * cw / 2}" y="${y + rows * ch + 34}">${label}</text>`;
    if (sub) s += `<text class="lbl-s" x="${x + cols * cw / 2}" y="${y + rows * ch + 70}">${sub}</text>`;
    return s;
  };
  Deck.slide({
    id: 'neu-linear',
    title: 'nn.Linear: one layer, a whole batch',
    html: `
    <h2>nn.Linear(2, 8): eight neurons, every shot at once</h2>
    <div class="t-code">
      ${Code.py(`
        import torch
        from torch import nn

        layer = nn.Linear(2, 8)
        X = torch.randn(32, 2)   # 32 shots: x, y
        Y = layer(X)

        print(Y.shape)
        print(layer.weight.shape)
        print(layer.bias.shape)`, { hl: '1:4 2:5-6,8 3:9 4:10' })}
      <div class="stack t-effect">
        <div data-only="0 1">${Widgets.netSVG({ sizes: [2, 8], w: 520, h: 600, r: 26, layerNames: ['2 in', '8 out'] })}</div>
        <div data-only="2">
          <svg class="dg" viewBox="0 0 560 560" width="560" height="560" role="img" aria-label="32 by 2 in, 32 by 8 out">
            ${blk(20, 40, 32, 2, 40, 12, 't-data', 'X', '32 × 2', 5)}
            <line class="flow" x1="124" y1="232" x2="208" y2="232"/>
            ${blk(224, 40, 32, 8, 40, 12, 't-data', 'Y', '32 × 8', 5)}
            <text class="lbl-s" x="166" y="196">layer</text>
          </svg>
          <div class="out">torch.Size([32, 8])</div>
          <p class="neu-cap">one row per shot: 8 numbers, one per neuron</p>
        </div>
        <div data-only="3">
          <svg class="dg" viewBox="0 0 560 480" width="560" height="480" role="img" aria-label="weight matrix 8 by 2">
            ${blk(180, 20, 8, 2, 80, 44, 't-param', 'weight', '8 × 2', 2)}
            <text class="lbl-s" x="120" y="130" style="text-anchor:end">neuron 3</text>
          </svg>
          <div class="out">torch.Size([8, 2])</div>
          <p class="neu-cap">one row per neuron: its 2 weights</p>
        </div>
        <div data-only="4">
          <svg class="dg" viewBox="0 0 560 480" width="560" height="480" role="img" aria-label="bias vector of 8">
            ${blk(180, 20, 8, 2, 80, 44, 't-param', 'weight', '8 × 2')}
            ${blk(400, 20, 8, 1, 80, 44, 't-param', 'bias', '8')}
          </svg>
          <div class="out">torch.Size([8])</div>
          <p class="neu-cap">one bias per neuron</p>
        </div>
      </div>
    </div>`,
    notes: `
    <p class="time">2 min</p>
    <p class="say">In PyTorch you never write neurons one at a time. nn.Linear(2, 8) is a whole layer: 8 neurons, each looking at the same 2 inputs. And you never feed one shot at a time either: you feed a batch, here 32 shots, as a table with one row per shot. The layer gives back a table with one row per shot and one column per neuron.</p>
    <p class="do">Before each press, ask the room to predict what the highlighted print will show; then press → to reveal.</p>
    <ul>
      <li>Step 1: Linear(2, 8) means 2 numbers in, 8 numbers out (the picture: 2 inputs wired to 8 neurons).</li>
      <li>Step 2: Y.shape is <b>(32, 8)</b>: the batch size stays, the 2 becomes 8. Highlighted row: one shot in, its 8 neuron outputs out.</li>
      <li>Step 3: layer.weight.shape is <b>(8, 2)</b>, not (2, 8). PyTorch stores one row per neuron (out × in). Many students guess (2, 8); that is the point of asking.</li>
      <li>Step 4: layer.bias.shape is <b>(8)</b>, one bias per neuron.</li>
    </ul>
    <p class="ask">If I feed 1,000 shots instead of 32, does the layer need more weights?</p>
    <p class="ans">No. The same 8 × 2 weights and 8 biases are applied to every shot. Y becomes (1000, 8). The number of parameters depends only on the layer sizes, not on the batch.</p>
    <p>The maths behind it (for the coach): Y = X @ W.T + b, a matrix multiply (32×2)·(2×8) = (32×8), then the bias is added to every row ("broadcasting"). torch.allclose(layer(X), X @ layer.weight.T + layer.bias) returns True. The code on the slide was run in PyTorch 2.x and prints exactly torch.Size([32, 8]), torch.Size([8, 2]), torch.Size([8]). The activation (ReLU) is a separate step applied to every number of Y.</p>`,
  });

  /* =====================================================================
     6. Count the parameters (A4)
     ===================================================================== */
  Deck.slide({
    id: 'neu-count',
    title: 'Count the parameters',
    html: `
    <div class="row" style="gap:32px"><span class="tag tag-pair">pairs</span><h2>How many numbers does 2-8-8-1 learn?</h2></div>
    <div class="neu-row" style="gap:64px">
      <svg class="dg" viewBox="0 0 1100 700" width="1100" height="700" role="img" aria-label="2-8-8-1 network with parameter counts per layer">
        ${Widgets.netSVG({ sizes: [2, 8, 8, 1], w: 1100, h: 520, r: 22 })}
        <g data-step="1"><text class="lbl" x="202" y="580">2×8 + 8</text><text class="lbl-b" x="202" y="640">24</text></g>
        <g data-step="2"><text class="lbl" x="550" y="580">8×8 + 8</text><text class="lbl-b" x="550" y="640">72</text></g>
        <g data-step="3"><text class="lbl" x="880" y="580">8×1 + 1</text><text class="lbl-b" x="880" y="640">9</text></g>
        <g data-step="1"><text class="lbl-s" x="202" y="690">weights + biases</text></g>
        <g data-step="3"><text class="lbl-b" x="1060" y="640" style="font-size:56px">= 105</text></g>
      </svg>
      <div class="qa">
        <div><p class="q">2-16-1?</p><p class="a" data-step="4">65 · illegal for Kobe</p></div>
        <div><p class="q">784-128-10?<br><span class="neu-cap">(digit images)</span></p><p class="a" data-step="5">101,770</p></div>
      </div>
    </div>`,
    notes: `
    <p class="time">2 min</p>
    <p class="say">Every arrow is one weight, and every neuron after the inputs has one bias. Learning means finding good values for all these numbers. Let's count them for the Kobe network.</p>
    <p class="do">Press → per layer and let the room call out first: 2×8 + 8 = <b>24</b>, 8×8 + 8 = <b>72</b>, 8×1 + 1 = <b>9</b>, total <b>105</b>. Pairs take a minute for the right side: 2-16-1 = <b>65</b>; 784-128-10 (digit images) = <b>101,770</b>.</p>
    <p class="ask">2-16-1 has fewer numbers. Is it allowed in the Kobe task?</p>
    <p class="ans">No. The rule is at most 3 linear layers of at most 8 neurons each, not a number budget; breaking it scores 0.</p>
    <p>Rule of thumb: nn.Linear(in, out) has in × out + out numbers.</p>`,
  });

  /* =====================================================================
     7. Forward pass, animated: click a spot on Kobe's court
     ===================================================================== */
  // A 2-8-8-1 ReLU net trained in PyTorch (Adam 1e-2, 25 epochs, batch 64) on 20,000 of
  // Kobe's labelled shots; inputs are court positions in units of 10 ft. Validation
  // (5,000 shots): log loss 0.660, accuracy 61.8%.
  const KN = {
    W1: [0.772, 0.007, -0.936, -1.324, 0.085, 1.0, -0.283, 0.786, -0.033, -0.137, -0.569, -0.546, -2.086, -0.099, -0.379, -0.166],
    b1: [-0.644, 0.503, -1.519, -1.031, -0.142, 0.274, -0.105, 0.203],
    W2: [-0.245, 0.715, -0.362, -1.021, -0.224, 0.251, -2.902, 0.297, -0.289, -0.422, -0.247, -0.623, -0.357, 0.042, -0.177, -0.036, 0.187, -1.625, -1.121, -1.123, -0.347, -0.429, -1.26, -0.217, 0.558, -0.025, 1.698, 0.521, -0.011, 0.014, 0.406, 0.02, -1.115, -0.212, -0.45, 0.073, 0.075, 0.04, -0.949, 0.239, -1.001, 0.432, -0.659, -0.377, 0.056, 0.507, -2.463, -0.119, 0.438, 0.023, 1.034, 0.359, -0.037, -0.395, 0.237, -0.162, -0.382, 0.262, 0.217, -0.353, 0.014, -0.112, -0.11, -0.214],
    b2: [0.373, -0.401, 0.452, -0.502, 0.508, 0.037, -1.787, -0.282],
    W3: [0.504, -0.265, -0.583, -0.295, 0.287, 0.204, -0.795, -0.037],
    b3: -0.235,
  };
  const kfwd = (u, v) => {
    const h1 = [], h2 = [];
    for (let j = 0; j < 8; j++) h1.push(relu(KN.W1[2 * j] * u + KN.W1[2 * j + 1] * v + KN.b1[j]));
    for (let j = 0; j < 8; j++) { let s = KN.b2[j]; for (let i = 0; i < 8; i++) s += KN.W2[8 * j + i] * h1[i]; h2.push(relu(s)); }
    let z = KN.b3; for (let i = 0; i < 8; i++) z += KN.W3[i] * h2[i];
    return { x: [u, v], h1, h2, z, p: sig(z) };
  };
  const FW = { w: 960, h: 640, xs: [96, 340, 584, 760], r: [40, 33, 33, 40] };
  const fwdY = n => Array.from({ length: n }, (_, i) => n === 1 ? 300 : n === 2 ? [220, 390][i] : 36 + i * 74);
  const FWD_SVG = (() => {
    const L = [2, 8, 8, 1];
    let s = `<svg class="dg fwd-net" viewBox="0 0 ${FW.w} ${FW.h}" width="${FW.w}" height="${FW.h}" role="img" aria-label="2-8-8-1 network, activations for the chosen shot">`;
    for (let l = 0; l < 3; l++) {
      s += `<g class="fwd-L${l}">`;
      const ya = fwdY(L[l]), yb = fwdY(L[l + 1]);
      for (let i = 0; i < L[l]; i++) for (let j = 0; j < L[l + 1]; j++) s += `<line class="w" data-e="${l}-${i}-${j}" x1="${FW.xs[l]}" y1="${ya[i]}" x2="${FW.xs[l + 1]}" y2="${yb[j]}"/>`;
      s += '</g>';
    }
    L.forEach((n, l) => fwdY(n).forEach((y, i) => {
      s += `<circle class="nrn ${l === 0 ? 'in' : l === 3 ? 'out' : ''}" cx="${FW.xs[l]}" cy="${y}" r="${FW.r[l]}"/>` +
        `<circle class="fwd-fill" data-n="${l}-${i}" cx="${FW.xs[l]}" cy="${y}" r="${FW.r[l] - 3}" style="fill:var(--hi);opacity:0"/>` +
        `<text class="lbl" data-t="${l}-${i}" x="${FW.xs[l]}" y="${y}" style="font-size:28px"></text>`;
    }));
    s += `<text class="lbl-m" x="24" y="220">x</text><text class="lbl-m" x="24" y="390">y</text><text class="lbl-s" x="96" y="462">×10 ft</text>`;
    s += `<text class="lbl-b fwd-p" x="818" y="290" style="font-size:60px;text-anchor:start"></text><text class="lbl-s" x="822" y="346" style="text-anchor:start">goes in</text>`;
    s += `<text class="lbl-s fwd-real-l" x="822" y="410" style="text-anchor:start">Kobe:</text><text class="lbl fwd-real" x="818" y="452" style="font-size:34px;text-anchor:start"></text>`;
    ['input', 'hidden 1', 'hidden 2'].forEach((t, l) => { s += `<text class="lbl-s" x="${FW.xs[l]}" y="${FW.h - 22}">${t}</text>`; });
    return s + '</svg>';
  })();
  Deck.slide({
    id: 'neu-forward',
    title: 'Forward pass, animated',
    html: `
    <div class="row" style="gap:32px"><span class="tag tag-try">try it</span><h2>Click a spot: the numbers flow through</h2></div>
    <div class="neu-demo" style="gap:48px">
      <div class="fwd-court"></div>
      <div class="col" style="gap:20px">${FWD_SVG}<div class="fwd-btns"></div></div>
    </div>`,
    init(el, api) {
      const W = 720, fr = Widgets.courtFrame(0, 0, W);
      const cv = Plot.canvas(el.querySelector('.fwd-court'), W, Math.ceil(fr.h));
      const D = window.KOBE;
      const S = { pt: [-90, 160], res: kfwd(-0.9, 1.6), t: 9, real: null, lines: false };
      const edges = Array.from(el.querySelectorAll('[data-e]')).map(n => { const [l, i, j] = n.dataset.e.split('-').map(Number); return { n, l, i, j }; });
      const fills = {}, texts = {};
      el.querySelectorAll('[data-n]').forEach(n => (fills[n.dataset.n] = n));
      el.querySelectorAll('[data-t]').forEach(n => (texts[n.dataset.t] = n));
      const groups = [0, 1, 2].map(l => el.querySelector('.fwd-L' + l));
      const pEl = el.querySelector('.fwd-p'), realEl = el.querySelector('.fwd-real'), realL = el.querySelector('.fwd-real-l');
      const Wt = (l, i, j) => l === 0 ? KN.W1[2 * j + i] : l === 1 ? KN.W2[8 * j + i] : KN.W3[i];
      const vals = l => { const R = S.res; return l === 0 ? R.x : l === 1 ? R.h1 : l === 2 ? R.h2 : [R.z]; };
      function setNet() {
        edges.forEach(e => {
          const a = vals(e.l)[e.i], s = Wt(e.l, e.i, e.j) * a;
          if (Math.abs(s) < 0.02) { e.n.setAttribute('class', 'w off'); e.n.style.strokeWidth = 2; }
          else { e.n.setAttribute('class', 'w ' + (s > 0 ? 'pos' : 'neg')); e.n.style.strokeWidth = (1.5 + 8 * Math.min(1, Math.abs(s) / 1.2)).toFixed(1); }
        });
        [0, 1, 2, 3].forEach(l => vals(l).forEach((v, i) => {
          const k = l + '-' + i;
          const off = l > 0 && l < 3 && v < 0.05;   // tiny activations read as 0, never "0.0"
          texts[k].textContent = l === 0 || l === 3 ? fmt(v, 1) : (off ? '0' : Math.abs(v) >= 10 ? Math.round(v) : fmt(v, 1));
          texts[k].style.fill = off ? 'var(--muted)' : '';
          fills[k].style.opacity = l === 0 || l === 3 ? 0 : Math.min(1, v / 1.5).toFixed(2);
        }));
        pEl.textContent = Math.round(100 * S.res.p) + '%';
        realEl.textContent = S.real == null ? '' : S.real ? 'made' : 'missed';
        realL.style.display = S.real == null ? 'none' : '';
        realEl.style.fill = S.real == null ? '' : S.real ? 'var(--c1)' : 'var(--c0)';
      }
      function setPhase() {
        const t = S.t;
        groups.forEach((g, l) => (g.style.opacity = clamp((t - l) / 0.6, 0, 1).toFixed(2)));
        [1, 2, 3].forEach(l => vals(l).forEach((_, i) => {
          const k = l + '-' + i, o = clamp((t - l + 0.3) / 0.4, 0, 1);
          texts[k].style.opacity = o.toFixed(2);
          if (o < 1) fills[k].style.opacity = 0;
        }));
        pEl.style.opacity = realEl.style.opacity = realL.style.opacity = clamp((t - 3) / 0.4, 0, 1).toFixed(2);
      }
      function drawCourt() {
        const C = Plot.colors(), ctx = cv.ctx;
        cv.clear(C.paper);
        Plot.heat(ctx, (x, y) => kfwd(x / 100, y / 100).p, fr, { res: 64, mid: 0.45, span: 0.25, strength: 0.6 });
        ctx.save(); ctx.lineWidth = 1.5; ctx.strokeStyle = C.paper;
        for (let i = 0; i < 300; i++) { ctx.beginPath(); ctx.arc(fr.sx(D.X[i][0]), fr.sy(D.X[i][1]), 5, 0, 2 * Math.PI); ctx.fillStyle = D.Y[i] ? C.c1 : C.c0; ctx.fill(); ctx.stroke(); }
        ctx.restore();
        Widgets.drawCourt(ctx, fr, { color: C.muted, width: 3 });
        if (S.lines) {
          ctx.save(); ctx.beginPath(); ctx.rect(0, 0, cv.w, cv.h); ctx.clip();
          ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.setLineDash([12, 10]);
          for (let j = 0; j < 8; j++) {
            const a = KN.W1[2 * j], b = KN.W1[2 * j + 1], c = KN.b1[j], n = Math.hypot(a, b);
            const f0 = [-a * c / (n * n), -b * c / (n * n)], d = [-b / n, a / n];
            ctx.beginPath(); ctx.moveTo(fr.sx((f0[0] - 20 * d[0]) * 100), fr.sy((f0[1] - 20 * d[1]) * 100));
            ctx.lineTo(fr.sx((f0[0] + 20 * d[0]) * 100), fr.sy((f0[1] + 20 * d[1]) * 100)); ctx.stroke();
          }
          ctx.restore();
        }
        const px = fr.sx(S.pt[0]), py = fr.sy(S.pt[1]);
        ctx.save(); ctx.strokeStyle = C.ink; ctx.lineWidth = 5;
        ctx.beginPath(); ctx.arc(px, py, 18, 0, 2 * Math.PI); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(px - 30, py); ctx.lineTo(px - 12, py); ctx.moveTo(px + 12, py); ctx.lineTo(px + 30, py);
        ctx.moveTo(px, py - 30); ctx.lineTo(px, py - 12); ctx.moveTo(px, py + 12); ctx.lineTo(px, py + 30); ctx.stroke();
        ctx.restore();
      }
      function choose(x, y, real) {
        S.pt = [clamp(x, -250, 250), clamp(y, -47.5, 422.5)];
        S.res = kfwd(S.pt[0] / 100, S.pt[1] / 100);
        S.real = real == null ? null : real;
        S.t = 0;
        setNet(); setPhase(); drawCourt();
      }
      cv.cv.addEventListener('pointerdown', e => { const [px, py] = cv.pos(e); choose(fr.sx.inv(px), fr.sy.inv(py)); });
      const btns = el.querySelector('.fwd-btns');
      UI.button(btns, 'Rim', () => choose(0, 0), { kind: 'primary' });
      UI.button(btns, 'Corner 3', () => choose(-226, 10));
      UI.button(btns, 'Half court', () => choose(0, 410));
      let k = 17;
      UI.button(btns, 'Real shot', () => { k = (k * 37 + 11) % D.X.length; choose(D.X[k][0], D.X[k][1], D.Y[k]); });
      UI.choice(btns, [{ value: false, label: 'lines off' }, { value: true, label: 'lines on' }], false, v => { S.lines = v; drawCourt(); });
      setNet(); setPhase(); drawCourt();
      api.loop(dt => { if (S.t < 3.6) { S.t += dt * 3.2; setPhase(); } return true; });
      api.onTheme(drawCourt);
    },
    notes: `
    <p class="time">2 min</p>
    <p class="say">A real 2-8-8-1 network, already trained on 20,000 of Kobe's shots; the court colour is its answer everywhere. Click a spot: the position goes in on the left, every layer does weigh-add-bend, and a chance comes out on the right.</p>
    <p class="do">Click "Rim" (about 60%), "Corner 3" (about 35%), "Half court" (about 5%), then anywhere. Orange arrows push the next neuron up, blue push it down, dotted carry nothing (the neuron before is off). "Real shot" also shows what happened.</p>
    <p class="ask">Even at the rim it only says about 60%. Is the network bad?</p>
    <p class="ans">No, basketball is noisy: Kobe made about 62% at the rim. The network is right about 61% of the time, against 55% for "always miss", close to the best possible.</p>
    <p>Inputs are in units of 10 ft; the output circle shows the raw score before the sigmoid. Neurons stuck at 0 everywhere are "dead" ReLUs: they never learn.</p>`,
  });

  /* =====================================================================
     8. The same network in PyTorch
     ===================================================================== */
  const PARTS = [['fc1', 'Linear 2→8'], ['act1', 'ReLU'], ['fc2', 'Linear 8→8'], ['act2', 'ReLU'], ['fc3', 'Linear 8→1']];
  Deck.slide({
    id: 'neu-module',
    title: 'An MLP in PyTorch',
    html: `
    <h2>The same network, in PyTorch</h2>
    <div class="t-code" style="grid-template-columns: 960px 1fr; gap: 64px">
      <div class="col" style="gap:36px">
        ${Code.py(`
          class MLP(nn.Module):
              def __init__(self):
                  super().__init__()
                  self.fc1 = nn.Linear(2, 8)
                  self.act1 = nn.ReLU()
                  self.fc2 = nn.Linear(8, 8)
                  self.act2 = nn.ReLU()
                  self.fc3 = nn.Linear(8, 1)
              def forward(self, x):
                  x = self.act1(self.fc1(x))
                  x = self.act2(self.fc2(x))
                  return self.fc3(x)   # a logit`, { hl: '1:2-8 2:9-12', size: 's' })}
        <div data-step="4" class="row" style="gap:24px"><span class="tag tag-warn">Kobe task</span><span class="lead">no <code class="ic">nn.Sequential</code>: it scores 0</span></div>
      </div>
      <div class="stack t-effect">
        <div data-until="3">
          <svg class="dg" viewBox="0 0 560 700" width="560" height="700" role="img" aria-label="layers fc1, act1, fc2, act2, fc3">
            <text class="lbl-m" x="280" y="24">x</text>
            ${PARTS.map(([n, t], i) => {
              const y = 60 + i * 124;
              return `<rect class="box ${t === 'ReLU' ? 'act' : ''}" x="60" y="${y}" width="440" height="88"/>` +
                `<text class="lbl" x="280" y="${y + 44}">${n} · ${t}</text>` +
                `<g data-step="2"><line class="flow" x1="280" y1="${y - 34}" x2="280" y2="${y - 6}" style="stroke-width:4"/></g>`;
            }).join('')}
            <g data-step="2"><line class="flow" x1="280" y1="646" x2="280" y2="680" style="stroke-width:4"/></g>
            <text class="lbl-s" x="420" y="684" data-step="2">logit</text>
          </svg>
        </div>
        <div data-step="3">
          ${Code.py(`
            model = MLP()
            x = torch.randn(32, 2)
            print(model(x).shape)
            ps = model.parameters()
            print(sum(p.numel() for p in ps))`, { size: 's' })}
          <div class="out">torch.Size([32, 1])<br>105</div>
        </div>
      </div>
    </div>`,
    notes: `
    <p class="time">2 min</p>
    <p class="say">The Kobe network as PyTorch code: a class with two parts. __init__ builds the parts, three linear layers and two ReLUs holding the 105 numbers; forward gives the route through them. You never call forward yourself: model(x) does it.</p>
    <p class="do">→ 1 highlights __init__, → 2 forward (the arrows). → 3: 32 random shots in, shape (32, 1) out, and 105 parameters, as counted by hand. → 4: the Kobe-task warning.</p>
    <p class="ask">The last line returns fc3(x) with no sigmoid. Is that a bug?</p>
    <p class="ans">No. The model outputs a raw score (a "logit"); the loss, BCEWithLogitsLoss, applies the sigmoid itself, safely. For a chance, use torch.sigmoid(model(x)).</p>
    <p>Kobe rules (repeated later): at most 3 linear layers of at most 8 neurons, built as attributes like this; nn.Sequential scores 0 because the checker cannot see inside it.</p>`,
  });

  /* =====================================================================
     9. Same recipe, different scale: zoom out from 105 to 175 billion
     ===================================================================== */
  const MODELS = [
    { name: 'Kobe net', n: 105, show: '105' },
    { name: 'digit MLP', n: 101770, show: '101,770' },
    { name: 'AlexNet, 2012', n: 6e7, show: '60 million' },
    { name: 'GPT-3, 2020', n: 1.75e11, show: '175 billion' },
  ];
  Deck.slide({
    id: 'neu-scale',
    title: 'Same recipe, different scale',
    html: `
    <h2>Same recipe, 1.7 billion times bigger</h2>
    <div class="neu-demo" style="gap:96px">
      <div class="scale-cv"></div>
      <div class="neu-side" style="gap:40px">
        <div class="scale-list">
          ${MODELS.map((m, i) => `<div ${i ? `data-step="${i}"` : ''}><span>${m.name}</span><span class="n">${m.show}</span></div>`).join('')}
        </div>
        <p class="lead" data-step="4">Same parts: linear layers, activations, backprop.</p>
      </div>
    </div>`,
    init(el, api) {
      const S = 768, P = 24, side0 = S - 72;
      const cv = Plot.canvas(el.querySelector('.scale-cv'), S, S);
      const target = k => Math.log10(MODELS[Math.min(k, 3)].n) + 2 * Math.log10(1 / 0.82);
      let u = target(0), goal = u, u0 = u, tw = 1;
      function draw() {
        const C = Plot.colors(), ctx = cv.ctx;
        cv.clear();
        const x0 = P, y1 = S - 48;
        ctx.save();
        for (let i = MODELS.length - 1; i >= 0; i--) {
          const m = MODELS[i], sd = side0 * Math.sqrt(m.n / Math.pow(10, u));
          if (sd < 0.5 || sd > side0 * 1.05) continue;
          ctx.fillStyle = Plot.alpha(C.ink, 0.06); ctx.fillRect(x0, y1 - sd, sd, sd);
          ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.strokeRect(x0, y1 - sd, sd, sd);
        }
        ctx.restore();
        ctx.save(); ctx.beginPath(); ctx.rect(0, 0, S, S); ctx.clip();
        for (let i = 0; i < MODELS.length; i++) {
          const m = MODELS[i], sd = side0 * Math.sqrt(m.n / Math.pow(10, u));
          if (sd > side0 * 1.05) continue;
          if (sd >= 150) {
            Plot.text(ctx, m.name, x0 + 18, y1 - sd + 16, { size: 34, weight: 700, color: C.ink, base: 'top' });
            Plot.text(ctx, m.show, x0 + 18, y1 - sd + 58, { size: 30, mono: true, color: C.muted, base: 'top' });
          } else if (sd >= 3 && i === MODELS.findIndex(q => side0 * Math.sqrt(q.n / Math.pow(10, u)) >= 3)) {
            const tx = x0 + sd + 40, ty = y1 - sd - 70;
            ctx.strokeStyle = C.muted; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(x0 + sd + 2, y1 - sd - 2); ctx.lineTo(tx - 6, ty + 6); ctx.stroke();
            Plot.text(ctx, m.name, tx, ty, { size: 30, weight: 700, color: C.ink, base: 'bottom' });
          }
        }
        const kobe = side0 * Math.sqrt(105 / Math.pow(10, u));
        if (kobe < 3) {
          ctx.strokeStyle = C.ink; ctx.lineWidth = 3;
          ctx.beginPath(); ctx.arc(x0 + 2, y1 - 2, 14, 0, 2 * Math.PI); ctx.stroke();
          const lbl = kobe < 0.1 ? 'Kobe net: ' + kobe.toFixed(3) + ' px' : 'Kobe net';
          Plot.text(ctx, lbl, x0 + 24, y1 + 4, { size: 30, weight: 700, color: C.ink, base: 'top' });
        }
        ctx.restore();
      }
      api.onStep(k => { if (target(k) === goal) return; u0 = u; goal = target(k); tw = 0; });
      api.onEnter(() => { u = u0 = goal = target(api.step); tw = 1; draw(); });
      api.loop(dt => {
        if (tw < 1) { tw = Math.min(1, tw + dt / 1.1); const e = tw < 0.5 ? 2 * tw * tw : 1 - 2 * (1 - tw) * (1 - tw); u = u0 + (goal - u0) * e; draw(); }
        return true;
      });
      draw();
      api.onTheme(draw);
    },
    notes: `
    <p class="time">1 min</p>
    <p class="say">Each square's area is a number of parameters. Our Kobe network has 105. Watch what happens when we zoom out.</p>
    <p class="do">Press → four times: a digit-recognition MLP (101,770), AlexNet from 2012 (60 million, the network that started the deep-learning boom), GPT-3 from 2020 (175 billion). At the GPT-3 zoom, the Kobe network's square is far smaller than one pixel. Last press: the punchline.</p>
    <p class="ask">GPT-3 is a chatbot model, not an MLP. Which of today's parts does it use?</p>
    <p class="ans">All of them. About two thirds of GPT-3's 175 billion parameters sit in MLP blocks just like ours: Linear(12288 → 49152), GELU, Linear(49152 → 12288), repeated in each of its 96 layers. It is trained with backprop and Adam. The recipe is the same; the scale is 1.7 billion times bigger (175,000,000,000 / 105 ≈ 1.67 × 10⁹).</p>
    <p>Sources: GPT-3 175 billion parameters, 96 layers, width 12288, feed-forward width 4 × 12288 (Brown et al. 2020); AlexNet 60 million (Krizhevsky et al. 2012). Do not quote parameter counts for newer models: they are not officially published. Data per parameter is a nice contrast: Kobe's net sees about 190 training shots per parameter (20,000 / 105), GPT-3 saw about 1.7 tokens (word pieces) per parameter (300 billion / 175 billion).</p>`,
  });
})();
