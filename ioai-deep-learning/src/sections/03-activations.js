Deck.section({ id: 'act', title: 'Activations: any function', minutes: 22 });

Deck.css(`
.sec-act .q-big { font-size: 96px; }
.sec-act .q-opts { display: flex; gap: 48px; }
.sec-act .q-opt { flex: 1; border: 3px solid var(--rule); padding: 22px 32px; font-size: 48px; display: flex; gap: 28px; align-items: baseline; transition: opacity .3s ease, border-color .3s ease; }
.sec-act .q-opt b { font-family: var(--font-mono); font-size: 56px; }
.sec-act .q-opt .tick { margin-left: auto; color: var(--ok); font-weight: 700; }
.sec-act.revealed .q-opt { opacity: .3; }
.sec-act.revealed .q-opt.right { opacity: 1; border-color: var(--ok); border-width: 6px; }
.sec-act .demo { display: grid; grid-template-columns: auto 1fr; gap: 64px; align-items: start; flex: 1; min-height: 0; }
.sec-act .side { display: flex; flex-direction: column; gap: 32px; min-width: 0; }
.sec-act .side .ui-slider { grid-template-columns: 210px 1fr auto; }
.sec-act .side .ui-choice { align-self: flex-start; }
.sec-act .q-chain { margin: 12px 0 24px; }
.sec-act .ro-row { display: flex; gap: 48px; flex-wrap: wrap; }
.sec-act .zoo { display: grid; grid-template-columns: repeat(5, 336px); gap: 12px; }
.sec-act .zoo-cell { display: flex; flex-direction: column; gap: 10px; }
.sec-act .zoo-cell h3 { font-size: 40px; }
.sec-act .zoo-ro { font-family: var(--font-mono); font-size: 30px; display: flex; gap: 14px; }
.sec-act .zoo-ro span { color: var(--muted); }
.sec-act .zoo-ro.grad, .sec-act .zoo-ro.grad b { color: var(--grad); }
.sec-act .answer { border-left: 8px solid var(--ok); padding: 8px 0 8px 28px; display: flex; flex-direction: column; gap: 12px; }
.sec-act .answer .m { font-size: 40px; }
.sec-act .verdict-ok { color: var(--ok); }
.sec-act .nots { display: flex; flex-direction: column; gap: 22px; font-size: 40px; }
.sec-act .nots div { display: flex; gap: 20px; align-items: baseline; }
.sec-act .nots b { font-family: var(--font-mono); color: var(--bad); font-size: 36px; }
.sec-act .chain svg { display: block; }
.sec-act .where { font-size: 36px; }
.sec-act .where td:first-child { color: var(--muted); }
.sec-act .quiz { display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 48px 96px; flex: 1; min-height: 0; }
.sec-act .quiz > div { display: flex; flex-direction: column; gap: 28px; border-top: 3px solid var(--rule); padding-top: 28px; }
.sec-act .quiz .qq { font-size: 56px; line-height: 1.2; display: flex; gap: 28px; align-items: baseline; }
.sec-act .quiz .qq b { font-family: var(--font-mono); font-size: 56px; color: var(--muted); }
.sec-act .quiz .qa { font-size: 56px; font-weight: 700; color: var(--ok); padding-left: 76px; }
.sec-act .fitwrap .fit1d-controls { gap: 24px 40px; }
`);

(() => {
  // ---------- shared helpers (section scope) ----------
  // the curve used for "any curve": a smooth wiggle on [-1, 1]
  const target = x => 0.8 * Math.sin(2.5 * x) + 0.4 * Math.cos(7 * x) - 0.2;
  const relu = z => (z > 0 ? z : 0);
  const sig = z => 1 / (1 + Math.exp(-z));

  // a 1-D plotting box inside a canvas of size w x h
  function box(w, h, xd, yd, pad) {
    pad = Object.assign({ l: 64, r: 20, t: 20, b: 48 }, pad || {});
    return {
      w, h, pad,
      sx: Plot.scale(xd[0], xd[1], pad.l, w - pad.r),
      sy: Plot.scale(yd[0], yd[1], h - pad.b, pad.t),
      clip(ctx) { ctx.beginPath(); ctx.rect(pad.l, pad.t, w - pad.l - pad.r, h - pad.t - pad.b); ctx.clip(); },
    };
  }
  // polyline through points [[x,y],...] in data units
  function poly(ctx, B, pts, color, width, dash) {
    ctx.save(); B.clip(ctx);
    ctx.beginPath();
    pts.forEach(([x, y], i) => { const px = B.sx(x), py = B.sy(y); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); });
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    if (dash) ctx.setLineDash(dash);
    ctx.stroke(); ctx.restore();
  }
  function curve(ctx, B, f, color, width, dash, n) {
    const [a, b] = B.sx.domain, N = n || 500, pts = [];
    for (let i = 0; i <= N; i++) { const x = a + (b - a) * i / N; pts.push([x, f(x)]); }
    poly(ctx, B, pts, color, width, dash);
  }

  /* ================================================================
     1. Predict: 10 linear layers vs 1
     ================================================================ */
  const chain = (n, y, label) => {
    let s = '', x = 160;
    s += `<circle class="nrn in" cx="80" cy="${y}" r="40"/><text class="lbl-m" x="80" y="${y}">x</text>`;
    for (let i = 0; i < n; i++) {
      s += `<line class="flow" x1="${x - 38}" y1="${y}" x2="${x - 6}" y2="${y}" style="stroke-width:4"/>`;
      s += `<rect class="box" x="${x}" y="${y - 50}" width="68" height="100" style="stroke-width:4"/>`;
      x += 116;
    }
    s += `<line class="flow" x1="${x - 34}" y1="${y}" x2="${x - 4}" y2="${y}" style="stroke-width:4"/>`;
    s += `<circle class="nrn out" cx="${x + 40}" cy="${y}" r="40"/><text class="lbl-m" x="${x + 40}" y="${y}">y</text>`;
    s += `<text class="lbl-b" x="${x + 112}" y="${y}" style="text-anchor:start">${label}</text>`;
    return s;
  };
  Deck.slide({
    id: 'act-predict',
    title: 'Predict: 10 linear layers vs 1',
    html: `
    <span class="tag tag-predict">predict</span>
    <div class="big q-big">Can 10 layers with no activation draw more than 1?</div>
    <svg class="dg q-chain" viewBox="0 0 1728 300" width="1728" height="300" role="img" aria-label="a chain of ten linear layers and a single linear layer">
      ${chain(10, 70, '10 × Linear')}
      ${chain(1, 236, '1 × Linear')}
    </svg>
    <div class="q-opts">
      <div class="q-opt"><b>1</b>more shapes</div>
      <div class="q-opt right"><b>2</b>the same<span class="tick" data-step="1">✓</span></div>
      <div class="q-opt"><b>3</b>fewer shapes</div>
    </div>`,
    init(el, api) { api.onStep(k => el.classList.toggle('revealed', k >= 1)); },
    notes: `
    <p class="time">1.5 min</p>
    <p class="say">Here is a question to vote on. I stack ten Linear layers, one after another, with nothing in between. Compare that with a single Linear layer. Can the tall stack draw more shapes, the same shapes, or fewer?</p>
    <p class="do">Give 20 seconds of silence, then a show of fingers: 1, 2 or 3. If the room is split, give one minute to argue with a neighbour and vote again. Then press → to reveal.</p>
    <p class="ans">2, the same. A Linear layer only stretches, turns and shifts. Do that ten times and you still only stretched, turned and shifted: you could have done it in one go. So the stack still draws one straight boundary line.</p>
    <p>Background, if a student asks for the algebra (do not put it on the board unless asked): two layers give W₂(W₁x + b₁) + b₂ = (W₂W₁)x + (W₂b₁ + b₂), which is again "a matrix times x plus a vector". Example: W₁ = [[1,2],[0,1]], b₁ = (1,0), W₂ = [1,−1], b₂ = 3 collapses to W = [1,1], b = 4. We checked numerically that 10 random stacked layers equal one layer to 6·10⁻⁸ (float rounding).</p>
    <p>Common mistake: "more weights must mean more power". Training can behave differently, but the set of functions is exactly the same.</p>`,
  });

  /* ================================================================
     2. Collapse, live: the playground with activation 'none'
     ================================================================ */
  Deck.slide({
    id: 'act-collapse',
    title: 'No activation: still one line',
    html: `
    <h2>No activation: 105 weights, still one line</h2>
    <div class="grow" id="act-pg"></div>`,
    init(el, api) {
      const pg = Widgets.playground(api, el.querySelector('#act-pg'), {
        size: 768, data: 'circle', n: 300, hidden: [8, 8], act: 'linear', acts: ['linear', 'relu', 'tanh'],
        opt: 'adam', lr: 0.03, steps: 4, controls: ['play', 'reset', 'act'], maxEpochs: 1500, lossW: 760,
      });
      const rows = el.querySelectorAll('.pg-side .pg-controls');
      if (rows[1]) rows[1].insertAdjacentHTML('beforebegin', '<div class="small muted">between the layers:</div>');
      return pg;
    },
    notes: `
    <p class="time">2 min</p>
    <p class="say">Let us check the vote with a real network. This is a 2-8-8-1 network, 105 weights, with no activation between the layers. Watch what it does with the circle.</p>
    <p class="do">Press Train. The boundary stays one straight line and the accuracy gets stuck at 59% (the line can only slice off part of the blue ring): all 105 weights behave like one neuron. Press Pause. Now click <b>ReLU</b> under "between the layers" and press Train again: within about a second the boundary bends around the orange disk and the accuracy reaches 100%. Optionally try <b>tanh</b>: a smooth round boundary.</p>
    <p class="ask">What exactly did we change between the two runs?</p>
    <p class="ans">Only one thing: a bend (the activation) after each hidden neuron. Same data, same 105 weights, same optimizer. The bend is what lets depth add power.</p>
    <p>Why it works: with ReLU every hidden neuron becomes "a line, but flat on one side". Combining many such bent ramps gives polygons, which is why the ReLU boundary looks slightly angular.</p>`,
  });

  /* ================================================================
     3. The activation zoo (+ slopes)
     ================================================================ */
  const ZOO = ['relu', 'leaky', 'sigmoid', 'tanh', 'gelu'];
  Deck.slide({
    id: 'act-zoo',
    title: 'The activation zoo',
    html: `
    <h2>Any bend will do: the activation zoo</h2>
    <div class="zoo">${ZOO.map(k => `
      <div class="zoo-cell" data-k="${k}">
        <h3>${NN.act[k].name}</h3>
        <div class="zcv"></div>
        <div class="zoo-ro"><span>out</span><b class="vf">0</b></div>
        <div class="zoo-ro grad" data-step="1"><span>slope</span><b class="vd">0</b></div>
      </div>`).join('')}
    </div>
    <p class="small muted">input <b class="mono" id="act-z">0.0</b> · point at any plot</p>`,
    init(el, api) {
      const W = 336, H = 500;
      let z0 = 0;
      const cells = ZOO.map(k => {
        const c = el.querySelector(`.zoo-cell[data-k="${k}"]`);
        const cv = Plot.canvas(c.querySelector('.zcv'), W, H);
        const B = box(W, H, [-4, 4], [-1.5, 2.5], { l: 44, r: 10, t: 12, b: 44 });
        cv.cv.addEventListener('pointermove', e => { const [px] = cv.pos(e); z0 = Math.max(-4, Math.min(4, B.sx.inv(px))); drawAll(); });
        return { k, c, cv, B, vf: c.querySelector('.vf'), vd: c.querySelector('.vd') };
      });
      const zEl = el.querySelector('#act-z');
      function draw(o) {
        const C = Plot.colors(), ctx = o.cv.ctx, A = NN.act[o.k], B = o.B;
        o.cv.clear();
        Plot.axes(ctx, B.sx, B.sy, { xt: [-4, -2, 0, 2, 4], yt: [-1, 0, 1, 2], font: 26, labels: o.k === 'relu', fmt: v => String(v) });
        if (o.k !== 'relu') {
          ctx.save(); ctx.fillStyle = C.muted; ctx.font = `26px ${C.fontMono}`; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
          [-4, 0, 4].forEach(v => ctx.fillText(String(v), B.sx(v), H - B.pad.b + 8)); ctx.restore();
        }
        const showD = api.step >= 1;
        if (showD) curve(ctx, B, A.d, C.grad, 4, [12, 9]);
        curve(ctx, B, A.f, C.ink, 5);
        // cursor
        const px = B.sx(z0);
        ctx.save(); ctx.strokeStyle = C.muted; ctx.lineWidth = 2; ctx.setLineDash([6, 6]);
        ctx.beginPath(); ctx.moveTo(px, B.pad.t); ctx.lineTo(px, H - B.pad.b); ctx.stroke(); ctx.restore();
        Plot.dot(ctx, px, B.sy(A.f(z0)), 9, C.ink, C.paper);
        if (showD) Plot.dot(ctx, px, B.sy(A.d(z0)), 8, C.grad, C.paper);
        o.vf.textContent = A.f(z0).toFixed(2);
        o.vd.textContent = A.d(z0).toFixed(2);
      }
      function drawAll() { cells.forEach(draw); zEl.textContent = z0.toFixed(1); }
      drawAll();
      api.onStep(drawAll);
      api.onTheme(drawAll);
    },
    notes: `
    <p class="time">1.5 min</p>
    <p class="say">So we need a bend after each neuron. Any bend works; these are the five you will meet. ReLU: zero for negative inputs, the input itself for positive ones. Leaky ReLU: the same, but with a small slope on the left. Sigmoid: squashes everything into 0 to 1. tanh: the same S-shape, but from −1 to 1. GELU: a smooth ReLU, used in transformers like ChatGPT.</p>
    <p class="do">Press → to show the magenta dashed curves: the <b>slope</b> of each activation. Then sweep the pointer from left to right across the sigmoid plot and stop at the middle.</p>
    <p class="ask">Look at the sigmoid's slope. What is the largest it ever gets?</p>
    <p class="ans">0.25, at input 0 (the readout says 0.25). Far from 0 the sigmoid is flat and its slope is almost 0. ReLU's slope is exactly 1 for every positive input. Keep this in mind: during backprop every layer multiplies the gradient by this slope, which will matter in five minutes.</p>
    <p>Background: σ(z) = 1/(1+e^(−z)); tanh(z) = 2σ(2z) − 1; ReLU(z) = max(0, z); Leaky ReLU is drawn with slope 0.1 on the left so it is visible (PyTorch's default is 0.01); GELU(z) = z·Φ(z) has a small dip, minimum −0.17 near z = −0.75. Analogy that works: ReLU is a one-way valve (a diode, hence the name "rectifier"). Avoid saying "the activation decides whether the neuron fires": modern activations are continuous, not on/off switches.</p>
    <p>History in one sentence: ReLU-like units go back to Fukushima in 1969; the name "rectified linear unit" comes from Nair and Hinton in 2010; in 2012 AlexNet reported that ReLU reached its training target six times faster than tanh.</p>`,
  });

  /* ================================================================
     4. Invent first: build a hat from three ramps
     ================================================================ */
  Deck.slide({
    id: 'act-hat',
    title: 'Invent: a hat from ReLUs',
    html: `
    <div class="row" style="gap:32px"><span class="tag tag-pair">pairs · 2 min</span><h2>Build this hat from three ramps</h2></div>
    <div class="demo">
      <div id="act-hat-cv"></div>
      <div class="side" id="act-hat-side">
        <div class="ro-row" id="act-hat-ro"></div>
        <div class="answer" data-step="1">
          <div class="lead">+1, −2, +1</div>
          <div class="m">ReLU(<i>x</i>) − 2 ReLU(<i>x</i>−1) + ReLU(<i>x</i>−2)</div>
          <div class="small muted">= a network with 3 hidden neurons</div>
        </div>
      </div>
    </div>`,
    init(el, api) {
      const W = 960, H = 640;
      const cv = Plot.canvas(el.querySelector('#act-hat-cv'), W, H);
      const B = box(W, H, [-1, 3.5], [-1.5, 2.2], { l: 64, b: 52 });
      const knots = [0, 1, 2];
      const a = [1, 0, 0];
      const hat = x => relu(x) - 2 * relu(x - 1) + relu(x - 2);
      const sum = x => a.reduce((s, ak, i) => s + ak * relu(x - knots[i]), 0);
      const side = el.querySelector('#act-hat-side');
      const ro = el.querySelector('#act-hat-ro');
      const verdict = UI.readout(ro, 'your curve');
      const sl = knots.map((t, i) => UI.slider(side, {
        label: `ramp at ${t}`, min: -3, max: 3, step: 0.5, value: a[i],
        fmt: v => (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v).toFixed(1),
        oninput: v => { a[i] = v; draw(); },
      }));
      function draw() {
        const C = Plot.colors(), ctx = cv.ctx;
        cv.clear();
        Plot.axes(ctx, B.sx, B.sy, { xt: [-1, 0, 1, 2, 3], yt: [-1, 0, 1, 2], font: 28, fmt: v => String(v) });
        curve(ctx, B, hat, C.muted, 3, [12, 10]);
        a.forEach((ak, i) => { if (ak) curve(ctx, B, x => ak * relu(x - knots[i]), Plot.alpha(C.ink, 0.3), 4); });
        curve(ctx, B, sum, C.ink, 6);
        knots.forEach(t => Plot.dot(ctx, B.sx(t), B.sy(sum(t)), 9, C.ink, C.paper));
        Plot.text(ctx, 'target', B.sx(2.15), B.sy(0.18), { size: 28, color: C.muted });
        let err = 0;
        for (let x = -1; x <= 3.5; x += 0.05) err = Math.max(err, Math.abs(sum(x) - hat(x)));
        verdict.set(err < 1e-9 ? '<span class="verdict-ok">✓ a hat</span>' : 'not yet');
      }
      draw();
      api.onTheme(draw);
      api.onStep(k => {
        const v = k >= 1 ? [1, -2, 1] : [1, 0, 0];
        v.forEach((x, i) => { a[i] = x; sl[i].set(x); });
        draw();
      });
    },
    notes: `
    <p class="time">3 min</p>
    <p class="say">Your turn to invent. You may use ramps: a ramp is a ReLU that stays flat at 0 and then rises with slope 1, starting at a point you choose. Here we have three ramps, starting at 0, at 1 and at 2. Choose how much of each to add, positive or negative, so that the sum is the dashed hat: 0, up to 1, back down to 0, and flat 0 afterwards.</p>
    <p class="do">Pairs, 2 minutes, on paper. Then take suggestions and try them live with the three sliders: the faint lines are the individual ramps, the thick line is their sum, and the readout says "✓ a hat" when it matches exactly. A good path: start (ramp at 0 = +1, already there) → "it keeps going up, so bend it down at 1" → students usually try −1 first: flat after 1, not down. Ask "how steep must it fall?" → −2. Now it falls forever → "+1 at 2 to stop it". Press → to reveal the answer (the sliders jump to +1, −2, +1).</p>
    <p class="ask">Each slider is the weight of one hidden neuron going to the output. What does a weight do to the slope of the curve?</p>
    <p class="ans">It changes the slope at that ramp's starting point by exactly that amount: +1 makes it rise, −2 turns rising (+1) into falling (−1), +1 makes it flat again. Each ReLU adds one bend.</p>
    <p class="ask">Follow-up for fast pairs: how would you build a staircase? A bump in 2-D?</p>
    <p class="ans">A staircase: many steep ramp pairs (up, then flatten) placed side by side. In 2-D: hats along x and along y, added, then a second layer that keeps only where both are high.</p>
    <p>For the coach: this hat is a real PyTorch network, 1 input, 3 hidden ReLUs, 1 output (tested):</p>
    <pre>hidden = nn.Linear(1, 3); out = nn.Linear(3, 1)
with torch.no_grad():
    hidden.weight[:] = torch.tensor([[1.], [1.], [1.]])
    hidden.bias[:] = torch.tensor([0., -1., -2.])
    out.weight[:] = torch.tensor([[1., -2., 1.]])
    out.bias[:] = 0.
    x = torch.tensor([[0.], [1.], [2.], [3.]])
    print(out(torch.relu(hidden(x))))   # 0, 1, 0, 0</pre>`,
  });

  /* ================================================================
     5. Any curve from hinges (least squares on the output weights)
     ================================================================ */
  function solve(A, b) { // Gaussian elimination with partial pivoting
    const n = b.length;
    for (let c = 0; c < n; c++) {
      let p = c;
      for (let r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r;
      [A[c], A[p]] = [A[p], A[c]]; [b[c], b[p]] = [b[p], b[c]];
      for (let r = c + 1; r < n; r++) {
        const f = A[r][c] / A[c][c];
        for (let k = c; k < n; k++) A[r][k] -= f * A[c][k];
        b[r] -= f * b[c];
      }
    }
    const x = new Array(n).fill(0);
    for (let r = n - 1; r >= 0; r--) { let s = b[r]; for (let k = r + 1; k < n; k++) s -= A[r][k] * x[k]; x[r] = s / A[r][r]; }
    return x;
  }
  // best output weights for N hinges at evenly spaced points: returns {f, knots, w, mse}
  function hingeFit(N) {
    const knots = Array.from({ length: N }, (_, k) => -1 + 2 * k / N);
    const xs = Array.from({ length: 201 }, (_, i) => -1 + 2 * i / 200);
    const feat = x => [1].concat(knots.map(t => relu(x - t)));
    const P = N + 1, A = Array.from({ length: P }, () => new Array(P).fill(0)), r = new Array(P).fill(0);
    xs.forEach(x => { const v = feat(x), y = target(x); for (let i = 0; i < P; i++) { r[i] += v[i] * y; for (let j = 0; j < P; j++) A[i][j] += v[i] * v[j]; } });
    for (let i = 0; i < P; i++) A[i][i] += 1e-9;
    const w = solve(A, r);
    const f = x => feat(x).reduce((s, v, i) => s + v * w[i], 0);
    const mse = xs.reduce((s, x) => s + (f(x) - target(x)) ** 2, 0) / xs.length;
    return { f, knots, w, mse };
  }
  Deck.slide({
    id: 'act-hinges',
    title: 'Any curve from hinges',
    html: `
    <h2>More hinges, any curve</h2>
    <div class="demo">
      <div id="act-hg-cv"></div>
      <div class="side" id="act-hg-side"><div class="ro-row" id="act-hg-ro"></div></div>
    </div>`,
    init(el, api) {
      const W = 1056, H = 680;
      const cv = Plot.canvas(el.querySelector('#act-hg-cv'), W, H);
      const B = box(W, H, [-1, 1], [-1.6, 1.4], { l: 70, b: 52 });
      const ro = el.querySelector('#act-hg-ro');
      const rN = UI.readout(ro, 'hinges'), rE = UI.readout(ro, 'error');
      let N = 3, fit = hingeFit(N);
      const side = el.querySelector('#act-hg-side');
      const ch = UI.choice(side, [1, 2, 3, 5, 8, 16, 32].map(v => ({ value: v, label: String(v) })), N, v => { N = v; fit = hingeFit(N); draw(); }, { label: 'hinges' });
      function draw() {
        const C = Plot.colors(), ctx = cv.ctx;
        cv.clear();
        Plot.axes(ctx, B.sx, B.sy, { xt: [-1, -0.5, 0, 0.5, 1], yt: [-1, 0, 1], font: 28, fmt: v => String(v) });
        // each hinge's own contribution, faint
        if (N <= 8) fit.knots.forEach((t, i) => curve(ctx, B, x => fit.w[0] / N + fit.w[i + 1] * relu(x - t), Plot.alpha(C.ink, 0.22), 3, null, 200));
        curve(ctx, B, target, C.muted, 3, [12, 10]);
        curve(ctx, B, fit.f, C.ink, 6, null, 800);
        fit.knots.forEach(t => Plot.dot(ctx, B.sx(t), B.sy(fit.f(t)), N > 16 ? 6 : 9, C.ink, C.paper));
        rN.set(N);
        rE.set(fit.mse < 0.0001 ? fit.mse.toFixed(6) : fit.mse.toFixed(4));
      }
      draw();
      api.onTheme(draw);
      api.onStep(k => { const v = [3, 8, 32][k] || 3; N = v; ch.set(v); fit = hingeFit(N); draw(); });
    },
    steps: 2,
    notes: `
    <p class="time">1.5 min</p>
    <p class="say">The hat was one building block. Now the dashed curve is any wiggly curve, and each dot is a hinge: one hidden ReLU neuron. With only three hinges the best we can do is a rough zig-zag. Watch the thick line as we add hinges.</p>
    <p class="do">Press → for 8 hinges, → again for 32 (or click the numbers under "hinges"). The readout "error" (mean squared error) drops from 0.07 (3 hinges) to 0.002 (8) to 0.000005 (32): the dashed curve disappears under the thick line. With ≤ 8 hinges the faint lines show each neuron's own ramp.</p>
    <p class="ask">If I want the error ten times smaller, what do I do?</p>
    <p class="ans">Add more hinges, that is, more neurons in the hidden layer. One hidden layer is a "connect-the-dots machine": every extra neuron is an extra dot where the line may bend.</p>
    <p>How the weights are chosen here: the hinge positions are evenly spaced, and the output weights are the best possible ones (least squares, solved exactly in the browser). On the next slides gradient descent will have to find them on its own. Analogy that works: Lego skyline. With enough thin bricks you can copy any skyline.</p>`,
  });

  /* ================================================================
     6. Sigmoid towers (Nielsen) — optional
     ================================================================ */
  Deck.slide({
    id: 'act-towers',
    title: 'Steep S-curves make bumps (optional)',
    html: `
    <h2>Steep S-curves make bumps, then curves</h2>
    <div class="demo">
      <div id="act-tw-cv"></div>
      <div class="side" id="act-tw-side">
        <div class="stack">
          <p class="lead" data-only="0">1 neuron: an S-curve</p>
          <p class="lead" data-only="1">2 neurons: a bump</p>
          <p class="lead" data-only="2">many pairs: any curve</p>
        </div>
      </div>
    </div>`,
    steps: 2,
    init(el, api) {
      const W = 1056, H = 680;
      const cv = Plot.canvas(el.querySelector('#act-tw-cv'), W, H);
      const B = box(W, H, [-1, 1], [-1.6, 1.4], { l: 70, b: 52 });
      let steep = 8, nb = 16;
      const side = el.querySelector('#act-tw-side');
      const stS = UI.slider(side, { label: 'steepness', min: 0, max: 2.5, step: 0.01, value: Math.log10(steep), map: v => Math.pow(10, v), fmt: v => v.toFixed(0), oninput: v => { steep = v; draw(); } });
      UI.choice(side, [4, 8, 16, 32].map(v => ({ value: v, label: String(v) })), nb, v => { nb = v; draw(); }, { label: 'bumps' });
      const bumps = () => Array.from({ length: nb }, (_, j) => {
        const a = -1 + 2 * j / nb, b = j === nb - 1 ? 1.2 : -1 + 2 * (j + 1) / nb;
        return { a, b, h: target(-1 + 2 * (j + 0.5) / nb) };
      });
      function draw() {
        const C = Plot.colors(), ctx = cv.ctx, k = api.step;
        cv.clear();
        Plot.axes(ctx, B.sx, B.sy, { xt: [-1, -0.5, 0, 0.5, 1], yt: [-1, 0, 1], font: 28, fmt: v => String(v) });
        if (k === 0) curve(ctx, B, x => sig(steep * x), C.ink, 6);
        else if (k === 1) {
          curve(ctx, B, x => sig(steep * (x + 0.3)), Plot.alpha(C.ink, 0.25), 4);
          curve(ctx, B, x => -sig(steep * (x - 0.3)), Plot.alpha(C.ink, 0.25), 4);
          curve(ctx, B, x => sig(steep * (x + 0.3)) - sig(steep * (x - 0.3)), C.ink, 6);
        } else {
          const bs = bumps();
          curve(ctx, B, target, C.muted, 3, [12, 10]);
          if (nb <= 16) bs.forEach(q => curve(ctx, B, x => q.h * (sig(steep * (x - q.a)) - sig(steep * (x - q.b))), Plot.alpha(C.ink, 0.22), 3, null, 300));
          curve(ctx, B, x => bs.reduce((s, q) => s + q.h * (sig(steep * (x - q.a)) - sig(steep * (x - q.b))), 0), C.ink, 6, null, 800);
        }
      }
      draw();
      api.onStep(k => { if (k === 2 && steep < 60) { steep = 60; stS.set(Math.log10(60)); } draw(); });
      api.onTheme(draw);
    },
    notes: `
    <p class="time">1 min · optional, cut if late</p>
    <p class="say">Does this only work with ReLU? No. Here is the same trick with sigmoid neurons. One sigmoid neuron is an S-curve; make its weight large and it becomes a sharp step.</p>
    <p class="do">Drag "steepness" up to about 100: the S becomes a step. Press →: two steps, one up and one down, make a bump. Press → again: 16 bumps side by side, each as tall as the curve at its spot, rebuild the dashed curve. Drag steepness down and up again to show blurry vs. sharp blocks; switch between 4 and 32 bumps.</p>
    <p class="ask">How many hidden neurons does the 16-bump curve use?</p>
    <p class="ans">32: every bump needs two sigmoid neurons (a step up and a step down).</p>
    <p>Source: Michael Nielsen's free online book <i>Neural Networks and Deep Learning</i>, chapter 4, "A visual proof that neural nets can compute any function". Good link for curious students afterwards; it also builds 2-D "towers" the same way.</p>`,
  });

  /* ================================================================
     7. Training finds the hinges itself (fit1d)
     ================================================================ */
  Deck.slide({
    id: 'act-fit',
    title: 'Gradient descent finds the hinges',
    html: `
    <h2>Training finds the hinges by itself</h2>
    <div class="fitwrap grow" id="act-fit"></div>`,
    init(el, api) {
      Widgets.fit1d(api, el.querySelector('#act-fit'), {
        w: 1728, h: 620, f: target, xs: [-1, 1], ys: [-1.6, 1.4], n: 40, hidden: [4], act: 'relu', lr: 0.01, steps: 30,
        seed: 2, controls: ['play', 'reset', 'width'], maxEpochs: 9000, // 9000: stops in a calm spot (Adam spikes at 12000)
      });
    },
    notes: `
    <p class="time">1.5 min</p>
    <p class="say">So far we placed the hinges by hand. A real network starts from random weights and must find them with gradient descent, the same training you know from logistic regression. Here is a 1-4-1 ReLU network learning the dots.</p>
    <p class="do">Press Train: with 4 neurons the line gets the rough shape but cannot follow the wiggles; the error stops at about 0.014. Click <b>2 neurons</b> (it restarts by itself; press Train only if the button says Train): worse, it stops at about 0.06. Click <b>8 neurons</b>: about 0.005, still worse than the 8 hand-placed hinges on the previous slide (0.002). Click <b>32 neurons</b>: within a second it is close (0.001), it lingers there for a few seconds, then drops to about 0.0001 and stops after 5 to 7 seconds (9,000 epochs). Point at the corners in the thick line: those are the hinges the network found by itself.</p>
    <p class="ask">With 2 neurons the error stays at 0.06 however long we train. Why?</p>
    <p class="ans">Two ReLU neurons give at most two bends, and this curve needs more. Training can only find what the network is able to draw. And with 8 neurons it could have matched our hand-placed hinges but ended a bit worse: gradient descent walks downhill from where it starts and can settle in a slightly worse spot. Enough neurons make a good fit possible; they do not promise that training finds it. That is the theme of the next slide.</p>`,
  });

  /* ================================================================
     8. Universal approximation and what it does NOT say
     ================================================================ */
  Deck.slide({
    id: 'act-uat',
    title: 'Universal approximation theorem',
    html: `
    <h2>One wide layer can copy any curve</h2>
    <div class="split split-46" style="align-items:start">
      <div class="col" style="gap:36px">
        <p class="lead">Enough neurons: any curve, inside the data range.</p>
        <p class="tiny">Cybenko 1989 · Hornik 1991</p>
        <div class="nots">
          <div class="small muted" data-step="1">It does not promise:</div>
          <div data-step="1"><b>✗</b>training will find it</div>
          <div data-step="2"><b>✗</b>how many neurons</div>
          <div data-step="3"><b>✗</b>good guesses on noisy data</div>
          <div data-step="4"><b>✗</b>anything outside the data</div>
        </div>
      </div>
      <div id="act-uat-cv"></div>
    </div>`,
    init(el, api) {
      // a 1-32-1 ReLU net trained on the dots in [-1, 1] (deterministic)
      const X = [], Y = [];
      for (let i = 0; i < 40; i++) { const x = -1 + 2 * (i + 0.5) / 40; X.push([x]); Y.push(target(x)); }
      const net = new NN.MLP([1, 32, 1], { act: 'relu', seed: 8 }); // seed 8: fits well (MSE 0.0003), tails go opposite ways
      const opt = NN.optimizer('adam', { lr: 0.01 });
      for (let e = 0; e < 5000; e++) { net.lossAndGrad(X, Y, 'mse'); opt.step(net.params(), net.grads()); }
      const W = 960, H = 720;
      const cv = Plot.canvas(el.querySelector('#act-uat-cv'), W, H);
      const B = box(W, H, [-3, 3], [-3, 3], { l: 56, b: 52, t: 60 });
      function draw() {
        const C = Plot.colors(), ctx = cv.ctx, out = api.step >= 4;
        cv.clear();
        // the data range
        ctx.fillStyle = Plot.alpha(C.ink, 0.06);
        ctx.fillRect(B.sx(-1), B.pad.t, B.sx(1) - B.sx(-1), H - B.pad.t - B.pad.b);
        Plot.axes(ctx, B.sx, B.sy, { xt: [-3, -2, -1, 0, 1, 2, 3], yt: [-2, 0, 2], font: 28, fmt: v => String(v) });
        Plot.text(ctx, 'data range', B.sx(0), 40, { size: 28, color: C.muted, align: 'center' });
        if (out) curve(ctx, B, target, C.muted, 3, [12, 10]);
        else curve(ctx, B, x => (x >= -1 && x <= 1 ? target(x) : NaN), C.muted, 3, [12, 10]);
        X.forEach((x, i) => Plot.dot(ctx, B.sx(x[0]), B.sy(Y[i]), 6, C.paper, C.muted));
        curve(ctx, B, x => (out || (x >= -1 && x <= 1) ? net.predict([x]) : NaN), C.ink, 5, null, 600);
        if (out) Plot.text(ctx, 'outside: straight lines to nowhere', B.sx(2.95), B.sy(-2.6), { size: 28, color: C.ink, align: 'right' });
      }
      draw();
      api.onStep(draw);
      api.onTheme(draw);
    },
    notes: `
    <p class="time">2 min</p>
    <p class="say">What we just built has a name: the universal approximation theorem. Cybenko proved it in 1989 for sigmoids, and Hornik in 1991 showed the type of bend hardly matters. In words: one hidden layer with enough neurons can copy any smooth curve, as closely as you like, inside a bounded range. It is a true and important theorem. But students often read far more into it than it says.</p>
    <p class="do">Press → four times, one "does not promise" at a time, and say one sentence for each:</p>
    <ul>
      <li><b>Training will find it.</b> The theorem says good weights exist; we just saw 8 trained neurons end worse than 8 hand-placed hinges.</li>
      <li><b>How many neurons.</b> It may need a huge number, especially with many inputs.</li>
      <li><b>Good guesses on noisy data.</b> A wide net can also copy the noise. Kobe's shots are noisy: even at the rim he scored only about 62%.</li>
      <li><b>Anything outside the data.</b> On the last step the right plot shows the trained network outside its data: ReLU networks continue as straight lines, wherever those happen to point.</li>
    </ul>
    <p class="ask">The Kobe data has no shots from beyond about 79 feet. What will a ReLU network predict for a shot from 300 feet?</p>
    <p class="ans">Something arbitrary. Far from the data a ReLU net is just a straight line in the input, so its score keeps growing or shrinking. The theorem only covers the range you trained on.</p>
    <p class="ask">Does the theorem guarantee our 2-8-8-1 network can reach loss 0 on Kobe?</p>
    <p class="ans">No, twice over: 8 neurons per layer is a fixed, small width, and the target itself is noisy (the same spot sometimes scores, sometimes not), so no model can predict every shot.</p>
    <p>Precise statement for the coach: a network with one hidden layer and any non-polynomial activation can approximate any continuous function on a compact set to any accuracy, given enough hidden units (Cybenko 1989; Hornik, Stinchcombe and White 1989; Hornik 1991; Leshno et al. 1993). Analogy: the Lego skyline: the bricks exist, but nobody gives you the building instructions, and they do not tell you tomorrow's skyline.</p>`,
  });

  /* ================================================================
     9. Depth folds: the sawtooth
     ================================================================ */
  // exact sawtooth after k tent layers: vertices at j/2^k, alternating 0,1
  const saw = k => Array.from({ length: (1 << k) + 1 }, (_, j) => [j / (1 << k), j % 2]);
  const chainSVG = k => {
    const gap = 92, w = 120 + k * gap + 110, y0 = 54, y1 = 126;
    let s = `<svg class="dg" viewBox="0 0 ${w} 200" width="${w}" height="200" role="img" aria-label="${k} layers of 2 neurons">`;
    const xs = Array.from({ length: k }, (_, i) => 120 + i * gap);
    xs.forEach((x, i) => {
      const px = i ? xs[i - 1] : 40;
      const pys = i ? [y0, y1] : [90];
      pys.forEach(py => [y0, y1].forEach(y => { s += `<line class="w" x1="${px}" y1="${py}" x2="${x}" y2="${y}"/>`; }));
    });
    const last = xs[k - 1];
    [y0, y1].forEach(y => { s += `<line class="w" x1="${last}" y1="${y}" x2="${last + 90}" y2="90"/>`; });
    s += `<circle class="nrn in" cx="40" cy="90" r="24"/><text class="lbl-m" x="40" y="90" style="font-size:30px">x</text>`;
    xs.forEach(x => [y0, y1].forEach(y => { s += `<circle class="nrn" cx="${x}" cy="${y}" r="20"/>`; }));
    s += `<circle class="nrn out" cx="${last + 90}" cy="90" r="24"/>`;
    s += `<text class="lbl-s" x="${(120 + last) / 2}" y="176">${k} layer${k > 1 ? 's' : ''} × 2 neurons</text>`;
    return s + '</svg>';
  };
  Deck.slide({
    id: 'act-depth',
    title: 'Depth folds space',
    html: `
    <h2>Every layer folds: the pieces double</h2>
    <div class="demo">
      <div class="col" style="gap:8px"><div id="act-dp-cv"></div><div class="chain" id="act-dp-chain"></div></div>
      <div class="side" id="act-dp-side">
        <div class="ro-row" id="act-dp-ro"></div>
        <div class="ro-row" id="act-dp-ro2"></div>
      </div>
    </div>`,
    steps: 4,
    init(el, api) {
      const W = 1008, H = 520;
      const cv = Plot.canvas(el.querySelector('#act-dp-cv'), W, H);
      const B = box(W, H, [0, 1], [-0.08, 1.12], { l: 60, b: 52 });
      const ro = el.querySelector('#act-dp-ro'), ro2 = el.querySelector('#act-dp-ro2');
      const rL = UI.readout(ro, 'layers'), rN = UI.readout(ro, 'neurons'), rP = UI.readout(ro, 'pieces');
      const rS = UI.readout(ro2, '1 wide layer needs');
      let k = 1;
      const side = el.querySelector('#act-dp-side');
      const ch = UI.choice(side, [1, 2, 3, 4, 5, 6].map(v => ({ value: v, label: String(v) })), k, v => { k = v; draw(); }, { label: 'layers' });
      const chainEl = el.querySelector('#act-dp-chain');
      function draw() {
        const C = Plot.colors(), ctx = cv.ctx;
        cv.clear();
        Plot.axes(ctx, B.sx, B.sy, { xt: [0, 0.25, 0.5, 0.75, 1], yt: [0, 1], font: 28, fmt: v => String(v) });
        if (k > 1) poly(ctx, B, saw(k - 1), C.muted, 3, [12, 10]);
        poly(ctx, B, saw(k), C.ink, 6);
        rL.set(k); rN.set(2 * k); rP.set(1 << k);
        rS.set(`≥ ${(1 << k) - 1} neurons`);
        chainEl.innerHTML = chainSVG(k);
      }
      draw();
      api.onStep(s => { k = s + 1; ch.set(k); draw(); });
      api.onTheme(draw);
    },
    notes: `
    <p class="time">2 min</p>
    <p class="say">If one wide layer can already copy anything, why do people stack many layers? Because each layer can fold the space. This network has only 2 ReLU neurons per layer. One layer makes a single tent: up, then down. Feed that tent into an identical layer, and each half gets folded again: two tents. Every new layer doubles the number of straight pieces.</p>
    <p class="do">Bring a strip of paper. Fold it in half, in half again, in half again (3 folds), unfold it: 8 panels, like the 8 pieces at 3 layers. Then press → to go from 1 to 5 layers (or click the layer numbers). The dashed line is the previous depth; the readouts count neurons and pieces.</p>
    <p class="ask">At 5 layers we use 10 neurons and get 32 pieces. How many neurons would a single hidden layer need for the same zig-zag?</p>
    <p class="ans">At least 31: in one layer, each neuron adds at most one bend, and 32 pieces need 31 bends. At 10 layers: 20 neurons deep versus at least 1,023 in one layer. Depth can be exponentially cheaper.</p>
    <p>Background: each layer computes tent(z) = 2·ReLU(z) − 4·ReLU(z − ½) on [0, 1], which needs exactly 2 ReLUs; composing it k times gives 2ᵏ linear pieces (we checked k = 1…6 numerically). This is Telgarsky's 2016 "benefits of depth" construction (also Montúfar et al. 2014, "folding"). Honest caveat for strong students: a randomly initialised deep network does not automatically have exponentially many pieces; the weights have to be special, like these.</p>`,
  });

  /* ================================================================
     10. Vanishing gradients
     ================================================================ */
  // per-layer weight-gradient norms at initialisation, 10 hidden layers of width 64,
  // batch 256, MSE on random targets, geometric mean over 5 seeds (PyTorch, our run)
  const VG = {
    sigmoid: [2.57e-7, 3.14e-6, 1.27e-5, 5.66e-5, 2.37e-4, 1.01e-3, 4.77e-3, 2.05e-2, 8.65e-2, 3.69e-1],
    relu: [4.41e-1, 5.92e-1, 7.92e-1, 9.06e-1, 1.06, 1.22, 1.34, 1.50, 1.67, 1.64],
  };
  Deck.slide({
    id: 'act-vanish',
    title: 'Vanishing gradients',
    html: `
    <h2>Through sigmoids, the gradient fades away</h2>
    <div id="act-vg-cv"></div>`,
    steps: 1,
    init(el, api) {
      const W = 1728, H = 700;
      const cv = Plot.canvas(el.querySelector('#act-vg-cv'), W, H);
      const lo = -7.5, hi = 0.6; // log10 range
      function row(ctx, C, vals, top, h, name, show) {
        const x0 = 300, x1 = W - 40, bw = (x1 - x0) / 10;
        const y = v => top + h - h * (Math.log10(v) - lo) / (hi - lo);
        Plot.text(ctx, name, 0, top + h / 2, { size: 44, weight: 700, display: true, base: 'middle' });
        ctx.save(); ctx.strokeStyle = C.grid; ctx.lineWidth = 1.5;
        [-6, -4, -2, 0].forEach(e => { ctx.beginPath(); ctx.moveTo(x0, y(Math.pow(10, e))); ctx.lineTo(x1, y(Math.pow(10, e))); ctx.stroke(); });
        ctx.restore();
        [[0, '1'], [-3, '0.001'], [-6, '0.000001']].forEach(([e, s]) => Plot.text(ctx, s, x0 - 14, y(Math.pow(10, e)), { size: 26, mono: true, color: C.muted, align: 'right', base: 'middle' }));
        if (!show) return;
        vals.forEach((v, i) => {
          ctx.fillStyle = Plot.alpha(C.grad, 0.85);
          const yy = y(v);
          ctx.fillRect(x0 + i * bw + 10, yy, bw - 20, top + h - yy);
        });
        ctx.save(); ctx.strokeStyle = C.muted; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(x0, top + h); ctx.lineTo(x1, top + h); ctx.stroke(); ctx.restore();
        const fmt = v => v >= 0.01 ? v.toFixed(2) : v.toFixed(-Math.floor(Math.log10(v))).replace(/0+$/, '').replace(/\d$/, d => d);
        Plot.text(ctx, fmt(vals[0]), x0 + 10, Math.min(y(vals[0]), y(vals[1])) - 12, { size: 30, mono: true, weight: 600, color: C.grad, align: 'left' });
        Plot.text(ctx, fmt(vals[9]), x0 + 9.5 * bw, y(vals[9]) - 12, { size: 30, mono: true, weight: 600, color: C.grad, align: 'center' });
      }
      function draw() {
        const C = Plot.colors(), ctx = cv.ctx;
        cv.clear();
        const x0 = 300, x1 = W - 40, bw = (x1 - x0) / 10;
        row(ctx, C, VG.sigmoid, 96, 240, 'sigmoid', true);
        row(ctx, C, VG.relu, 410, 240, 'ReLU', api.step >= 1);
        for (let i = 0; i < 10; i++) Plot.text(ctx, String(i + 1), x0 + (i + 0.5) * bw, 676, { size: 28, mono: true, color: C.muted, align: 'center', base: 'middle' });
        Plot.text(ctx, 'layer', 0, 676, { size: 28, mono: true, color: C.muted, base: 'middle' });
        // the backward direction
        ctx.save(); ctx.strokeStyle = C.grad; ctx.lineWidth = 5; ctx.setLineDash([14, 10]);
        ctx.beginPath(); ctx.moveTo(x1 - 10, 56); ctx.lineTo(x0 + 40, 56); ctx.stroke(); ctx.restore();
        ctx.save(); ctx.strokeStyle = C.grad; ctx.lineWidth = 5; ctx.lineJoin = 'round';
        ctx.beginPath(); ctx.moveTo(x0 + 60, 40); ctx.lineTo(x0 + 34, 56); ctx.lineTo(x0 + 60, 72); ctx.stroke(); ctx.restore();
        Plot.text(ctx, 'gradient flows back from the loss', x0 + 34, 0, { size: 30, color: C.grad, base: 'top' });
      }
      draw();
      api.onStep(draw);
      api.onTheme(draw);
    },
    notes: `
    <p class="time">1.5 min</p>
    <p class="say">Remember the sigmoid's slope: at most 0.25. Backprop multiplies by that slope once per layer, on the way back from the loss to the first layer. So after ten sigmoid layers the signal is at best 0.25 to the power 10, about one millionth. These bars are measured in PyTorch on a fresh 10-layer network: how big the gradient is at each layer.</p>
    <p class="do">Point at the sigmoid row: the last layer (right) gets a gradient of about 0.37, the first layer (left) about 0.0000003: a million times smaller. The first layers barely learn.</p>
    <p class="ask">Before I show it: same network, but with ReLU. What will the bars look like?</p>
    <p class="ans">Press → for the ReLU row: every layer gets a gradient of similar size (0.44 at the first layer, 1.64 at the last), because ReLU's slope is exactly 1 wherever it is active.</p>
    <p class="ask">The scale on the left jumps by a factor of 1,000 per grid line. Why draw it like that?</p>
    <p class="ans">On a normal scale the sigmoid bars for the first layers would be invisible, which is exactly the problem: they are effectively zero.</p>
    <p>Setup (our run): 10 hidden layers of 64 neurons, a batch of 256 random inputs, MSE on random targets, at initialisation; sigmoid with Xavier initialisation, ReLU with Kaiming (He) initialisation; norm of each layer's weight gradient, geometric mean of 5 seeds. tanh (not shown) stays flat around 0.12–0.14 per layer. Analogy: a dimmer switch stuck at the ends: turning the knob further does nothing, so the gradient is about zero. This is one big reason ReLU replaced sigmoid in hidden layers around 2010–2012.</p>`,
  });

  /* ================================================================
     11. Dead ReLU on Kobe's court
     ================================================================ */
  Deck.slide({
    id: 'act-dead',
    title: 'Dead ReLU',
    html: `
    <h2>A ReLU that never fires never learns</h2>
    <div class="demo">
      <div id="act-dd-cv"></div>
      <div class="side" id="act-dd-side"><div class="ro-row" id="act-dd-ro"></div></div>
    </div>`,
    init(el, api) {
      const Wc = 768;
      const fr = Widgets.courtFrame(0, 0, Wc);
      const cv = Plot.canvas(el.querySelector('#act-dd-cv'), Wc, Math.ceil(fr.h));
      const nx = 0.28, ny = 0.96; // the neuron's direction on the court (unit vector)
      let shift = 1.0, leaky = false; // pre-activation z = (n·p)/100 - shift   (p in tenths of feet)
      const pts = KOBE.X.slice(0, 800), lab = KOBE.Y.slice(0, 800);
      const ro = el.querySelector('#act-dd-ro');
      const rA = UI.readout(ro, 'active on'), rG = UI.readout(ro, 'learning signal');
      const side = el.querySelector('#act-dd-side');
      UI.slider(side, { label: 'line from rim', min: -1, max: 5, step: 0.05, value: shift, fmt: v => (v * 10).toFixed(0) + ' ft', oninput: v => { shift = v; draw(); } });
      UI.choice(side, [{ value: false, label: 'ReLU' }, { value: true, label: 'Leaky ReLU' }], leaky, v => { leaky = v; draw(); });
      function draw() {
        const C = Plot.colors(), ctx = cv.ctx;
        cv.clear(C.paper);
        // the active half-plane: n·p > 100·shift
        const d = 100 * shift;
        const P = (t, s) => [d * nx + t * -ny + s * nx, d * ny + t * nx + s * ny]; // court coords
        ctx.save();
        ctx.beginPath(); ctx.rect(0, 0, Wc, fr.h); ctx.clip();
        const q = [P(-900, 0), P(900, 0), P(900, 1200), P(-900, 1200)];
        ctx.beginPath(); q.forEach(([x, y], i) => (i ? ctx.lineTo(fr.sx(x), fr.sy(y)) : ctx.moveTo(fr.sx(x), fr.sy(y))));
        ctx.fillStyle = Plot.alpha(C.ink, 0.07); ctx.fill();
        let act = 0;
        ctx.lineWidth = 2;
        pts.forEach((p, i) => {
          const on = p[0] * nx + p[1] * ny > d;
          if (on) act++;
          ctx.beginPath(); ctx.arc(fr.sx(p[0]), fr.sy(p[1]), 6, 0, 2 * Math.PI);
          ctx.fillStyle = Plot.alpha(lab[i] ? C.c1 : C.c0, on ? 1 : leaky ? 0.38 : 0.18); ctx.fill();
          if (on) { ctx.strokeStyle = C.paper; ctx.stroke(); }
        });
        Widgets.drawCourt(ctx, fr, { color: Plot.alpha(C.ink, 0.6), width: 3 });
        // the neuron's line
        const a = P(-900, 0), b = P(900, 0);
        ctx.strokeStyle = C.ink; ctx.lineWidth = 5;
        ctx.beginPath(); ctx.moveTo(fr.sx(a[0]), fr.sy(a[1])); ctx.lineTo(fr.sx(b[0]), fr.sy(b[1])); ctx.stroke();
        // label the two sides of the line, left of centre (skip a label that would leave the canvas)
        const t = (d * nx + 110) / ny;
        [[72, 'active: output > 0'], [-72, leaky ? 'output small, not 0' : 'output = 0']].forEach(([off, txt]) => {
          const [lx, ly] = P(t, off), X = fr.sx(lx), Y = fr.sy(ly);
          if (Y < 36 || Y > fr.h - 24) return;
          ctx.font = `600 28px ${C.fontMono}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.lineWidth = 8; ctx.lineJoin = 'round'; ctx.strokeStyle = C.paper; ctx.strokeText(txt, X, Y);
          ctx.fillStyle = C.ink; ctx.fillText(txt, X, Y);
        });
        ctx.restore();
        const frac = act / pts.length;
        rA.set(act >= 8 ? Math.round(100 * frac) + '% of shots' : act + (act === 1 ? ' shot' : ' shots'));
        if (frac > 0) rG.set('flows');
        else rG.set(leaky ? 'weak, but alive' : '<span class="bad">0 ✗ dead</span>');
      }
      draw();
      api.onTheme(draw);
    },
    notes: `
    <p class="time">1.5 min</p>
    <p class="say">One danger of ReLU. A hidden neuron is a line on the court: on one side (shaded) it outputs a positive number, on the other side exactly 0. Bright shots are on its active side; faded shots get 0. Backprop only sends learning signal through shots where the neuron is active.</p>
    <p class="do">Drag "line from rim" to the right: the line moves up the court and fewer shots stay bright (77% at 0 ft, 41% at 10 ft, 15% at 20 ft, a single deep heave at 35 ft). Past about 39 ft no shot is active any more: the readout says "0 ✗ dead". This neuron outputs 0 for every shot, its slope is 0 for every shot, so its gradient is 0 and it never moves again. Then click <b>Leaky ReLU</b>: the faded shots light up a little, because the inactive side now passes a small signal (slope 0.01 in PyTorch), so the neuron can still come back.</p>
    <p class="ask">The Kobe task allows at most 8 neurons per layer. Why is a dead neuron worse there than in a big network?</p>
    <p class="ans">Each dead neuron costs 1/8 = 12.5% of the layer. Three dead neurons lose over a third of a tiny network.</p>
    <p>How it happens: a too-large learning rate throws a neuron's line off the data in one step (in our test with a 2-64-64-1 net, learning rate 3.0 killed 56% of the second layer, versus about 9% at 0.01), or unscaled inputs. Fixes: a smaller learning rate, scaled inputs, a different seed, or Leaky ReLU / ELU / tanh (all allowed in the Kobe task). Link to the paper exercise E2: there hidden unit 1 got gradient 0 for one input; a dead neuron is that, for every input.</p>`,
  });

  /* ================================================================
     12. Does it matter on Kobe? + which activation where
     ================================================================ */
  const KL = [['always 44.6%', 0.688, 'muted'], ['logistic regression', 0.675, 'muted'], ['tanh', 0.664, 'ink'], ['ReLU', 0.662, 'ink']];
  const nlX = v => 120 + (0.692 - v) / (0.692 - 0.657) * 1480;
  Deck.slide({
    id: 'act-kobe',
    title: 'ReLU or tanh on Kobe?',
    html: `
    <div class="row" style="gap:32px"><span class="tag tag-predict">predict</span><h2>On Kobe: ReLU or tanh?</h2></div>
    <svg class="dg" style="margin-top:48px" viewBox="0 0 1728 290" width="1728" height="290" role="img" aria-label="validation log loss on Kobe: constant 0.688, logistic regression 0.675, tanh 0.664, ReLU 0.662">
      <line x1="100" y1="200" x2="1640" y2="200" style="stroke:var(--muted);stroke-width:3"/>
      ${[0.66, 0.67, 0.68, 0.69].map(v => `<line x1="${nlX(v)}" y1="190" x2="${nlX(v)}" y2="210" style="stroke:var(--muted);stroke-width:3"/><text class="lbl-s" x="${nlX(v)}" y="240">${v.toFixed(2)}</text>`).join('')}
      <text class="lbl-s" x="1640" y="276" style="text-anchor:end">validation log loss · lower is better →</text>
      ${KL.map(([n, v, c], i) => `<g ${i >= 2 ? 'data-step="1"' : ''}>
        <circle cx="${nlX(v)}" cy="200" r="16" style="fill:var(--${c});stroke:var(--paper);stroke-width:3"/>
        <text class="lbl" x="${nlX(v)}" y="${i === 3 ? 108 : i === 2 ? 150 : 150}" style="fill:var(--${c});${i === 3 ? 'text-anchor:start' : i === 2 ? 'text-anchor:end' : ''}">${n} ${v.toFixed(3)}</text></g>`).join('')}
    </svg>
    <table class="tbl where" style="margin-top:48px" data-step="2">
      <tr><td>hidden layers</td><td><b>ReLU</b> as the default; tanh is fine for small nets</td></tr>
      <tr><td>transformers</td><td>GELU or SiLU</td></tr>
      <tr><td>output layer</td><td><b>none</b>: output a raw score; the loss adds the sigmoid</td></tr>
    </table>`,
    notes: `
    <p class="time">1.5 min</p>
    <p class="say">Back to Kobe. Same 2-8-8-1 network, same training, only the activation changes: ReLU or tanh. Which one predicts his shots better? Vote.</p>
    <p class="do">Hands up for ReLU, then for tanh. Press → to reveal. The grey dots are the baselines you know: always predicting 44.6% (0.688) and logistic regression (0.675).</p>
    <p class="ans">Practically a tie: ReLU 0.662, tanh 0.664 (validation log loss, average of 3 seeds, our PyTorch runs on the real data). Changing Adam's learning rate from 1e-3 to 1e-2 moves the result by the same tiny amount (to 0.660). For tiny networks, input scaling and the learning rate matter more than the activation. Try both, with several seeds.</p>
    <p class="do">Press → for the rule of thumb. Stress the last row: the model's last layer has <b>no</b> activation. It outputs a raw score (a "logit"), and the loss function adds the sigmoid itself. We will see in the next section what goes wrong if you add your own sigmoid.</p>
    <p>Kobe task rule: only nn.ReLU, nn.Sigmoid, nn.Tanh, nn.ELU, nn.LeakyReLU and nn.PReLU are allowed after the linear layers.</p>`,
  });

  /* ================================================================
     13. Quiz
     ================================================================ */
  Deck.slide({
    id: 'act-quiz',
    title: 'Quiz: activations',
    html: `
    <h2>Quick check: write your answers</h2>
    <div class="quiz">
      <div><div class="qq"><b>1</b><span>ReLU(−5) = ?</span></div><div class="qa" data-step="1">0</div></div>
      <div><div class="qq"><b>2</b><span>sigmoid(0) = ?</span></div><div class="qa" data-step="2">0.5</div></div>
      <div><div class="qq"><b>3</b><span>The steepest slope of a sigmoid?</span></div><div class="qa" data-step="3">0.25, at 0</div></div>
      <div><div class="qq"><b>4</b><span>2-8-8-1 with no activations, on the circle?</span></div><div class="qa" data-step="4">straight line, ~59%</div></div>
    </div>`,
    notes: `
    <p class="time">1 min</p>
    <p class="say">Thirty seconds, write four answers on paper, no looking back.</p>
    <p class="do">Then press → four times to reveal one answer at a time. Ask for hands: "who had this right?"</p>
    <ul>
      <li>ReLU(−5) = 0: negative inputs are cut to zero.</li>
      <li>sigmoid(0) = 0.5: a score of 0 means a 50/50 guess.</li>
      <li>0.25, in the middle: that is why ten sigmoid layers shrink the gradient to about a millionth.</li>
      <li>One straight line, accuracy stuck under 60% (59% in our demo): without a bend, ten layers or one are the same.</li>
    </ul>
    <p>If many miss question 4, go back two minutes to the live demo (slide "No activation: still one line") before moving on.</p>`,
  });
})();
