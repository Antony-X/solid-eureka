Deck.section({ id: 'gen', title: 'Generalization and debugging', minutes: 15 });

Deck.css(`
.sec-gen .gen-split-fig { margin-top: 24px; }
.sec-gen .gen-demo { display: grid; grid-template-columns: 864px 816px; gap: 48px; align-items: start; }
.sec-gen .gen-side { display: flex; flex-direction: column; gap: 28px; }
.sec-gen .gen-side .ui-readout-value { font-size: 44px; }
.sec-gen .gen-side .pg-readouts { gap: 56px; }
.sec-gen .gen-two { display: grid; grid-template-columns: 816px 816px; gap: 96px; align-items: start; }
.sec-gen .gen-nets { display: flex; gap: 64px; align-items: flex-end; margin-top: 24px; }
.sec-gen .gen-net { display: flex; flex-direction: column; gap: 12px; align-items: center; }
.sec-gen .gen-net .p { font-family: var(--font-mono); font-size: 30px; line-height: 1.25; color: var(--muted); text-align: center; }
.sec-gen .gen-score { font-family: var(--font-display); font-weight: 800; font-size: 80px; line-height: 1; font-stretch: 110%; }
.sec-gen .gen-score small { display: block; font-family: var(--font-mono); font-size: 28px; font-weight: 500; color: var(--muted); font-stretch: 100%; margin-top: 8px; text-align: center; }
.sec-gen .gen-cures { display: flex; flex-direction: column; gap: 14px; }
.sec-gen .gen-cure { display: grid; grid-template-columns: 64px 176px 560px 1fr; gap: 32px; align-items: center; min-height: 112px; border-bottom: 2px solid var(--rule); padding-bottom: 10px; }
.sec-gen .gen-cure:last-child { border-bottom: 0; }
.sec-gen .gen-cure .n { font-family: var(--font-mono); font-size: 40px; color: var(--muted); }
.sec-gen .gen-cure .name { font-family: var(--font-display); font-weight: 750; font-size: 46px; line-height: 1.05; }
.sec-gen .gen-cure .ev { font-size: 32px; line-height: 1.25; }
.sec-gen .gen-cure .ev b { font-family: var(--font-mono); }
.sec-gen .gen-patient { font-size: 34px; max-width: none; }
.sec-gen .gen-patient b { font-family: var(--font-mono); }
.sec-gen .gen-doc { display: grid; grid-template-columns: repeat(3, 544px); gap: 28px 48px; }
.sec-gen .gen-card { display: flex; flex-direction: column; gap: 6px; position: relative; }
.sec-gen .gen-card .n { position: absolute; left: 0; top: 0; font-family: var(--font-mono); font-size: 40px; font-weight: 600; width: 60px; height: 60px; border: 3px solid var(--ink); display: grid; place-items: center; background: var(--paper); }
.sec-gen .gen-card .dx { font-size: 32px; line-height: 1.2; min-height: 78px; }
.sec-gen .gen-card .dx b { font-weight: 700; }
.sec-gen .gen-checks { display: flex; flex-direction: column; gap: 40px; }
.sec-gen .gen-check { display: grid; grid-template-columns: 72px 1fr; gap: 24px; align-items: baseline; }
.sec-gen .gen-check .n { font-family: var(--font-mono); font-size: 44px; color: var(--muted); }
.sec-gen .gen-check b { font-family: var(--font-display); font-size: 50px; font-weight: 750; display: block; line-height: 1.05; }
.sec-gen .gen-check .ev { font-size: 34px; color: var(--muted); display: block; margin-top: 6px; }
.sec-gen .gen-check .ev .mono { color: var(--ink); }
.sec-gen .gen-hunt { display: grid; grid-template-columns: 1104px 576px; gap: 48px; align-items: start; }
.sec-gen .gen-bugs { display: flex; flex-direction: column; gap: 22px; }
.sec-gen .gen-bug { display: grid; grid-template-columns: 52px 1fr; gap: 12px; font-size: 32px; line-height: 1.2; }
.sec-gen .gen-bug .n { font-family: var(--font-mono); font-weight: 600; }
.sec-gen .gen-bug .fx { display: block; color: var(--muted); font-size: 30px; margin-top: 4px; }
.sec-gen .gen-errs { display: flex; flex-direction: column; gap: 20px; }
.sec-gen .gen-err { display: grid; grid-template-columns: 1104px 1fr; gap: 48px; align-items: center; }
.sec-gen .gen-msg { margin: 0; font-family: var(--font-mono); font-size: 28px; line-height: 1.38; white-space: pre-wrap; background: var(--code-bg); border-left: 6px solid var(--bad); padding: 14px 22px; }
.sec-gen .gen-msg b { color: var(--bad); font-weight: 600; }
.sec-gen .gen-fix { font-size: 32px; line-height: 1.25; }
.sec-gen .gen-fix code.ic { font-size: 30px; }
.sec-gen .gen-cap { font-size: 30px; color: var(--muted); }
`);

{
  /* ---------- small helpers, local to this section ---------- */
  const L10 = Math.log10;
  // axes on log-scaled data: sx, sy are scales over log10 values; ticks given as raw values
  const logAxes = (ctx, sx, sy, xt, yt, opt) => Plot.axes(ctx, sx, sy, Object.assign({
    xt: xt.map(L10), yt: yt.map(L10), zero: false, font: 26,
    fmt: v => { const x = Math.pow(10, v); return x >= 1 ? Math.round(x).toLocaleString('en-US') : +x.toPrecision(1) + ''; },
  }, opt || {}));
  const polyline = (ctx, pts, color, width, dash) => {
    ctx.save(); ctx.beginPath();
    pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    if (dash) ctx.setLineDash(dash);
    ctx.stroke(); ctx.restore();
  };

  /* ================= 1. three piles ================= */
  Deck.slide({
    id: 'gen-split',
    title: 'Train, validation, test',
    html: `
    <h2>Grade the model on shots it never saw</h2>
    <div class="fill-center gen-split-fig">
      <svg class="dg" viewBox="0 0 1728 600" width="1728" height="600" role="img" aria-label="Kobe's labelled shots split into training and validation; the test set is hidden by the grader">
        <g>
          <text class="lbl-b" x="539" y="60" style="font-size:48px">train</text>
          <rect x="0" y="120" width="1078" height="150" style="fill:var(--ink)"/>
          <text class="lbl" x="539" y="195" style="fill:var(--paper);font-size:40px">20,558 shots</text>
          <text class="lbl" x="539" y="330" style="font-size:36px;font-weight:700">homework</text>
          <text class="lbl-s" x="539" y="380" style="font-size:32px">the weights learn from these</text>
        </g>
        <g data-step="1">
          <text class="lbl-b" x="1213" y="60" style="font-size:48px">validation</text>
          <rect x="1078" y="120" width="270" height="150" style="fill:var(--muted)"/>
          <line x1="1078" y1="112" x2="1078" y2="278" style="stroke:var(--paper);stroke-width:6"/>
          <text class="lbl" x="1213" y="195" style="fill:var(--paper);font-size:36px">5,139</text>
          <text class="lbl" x="1213" y="330" style="font-size:36px;font-weight:700">mock exam</text>
          <text class="lbl-s" x="1213" y="380" style="font-size:30px">choose settings,</text>
          <text class="lbl-s" x="1213" y="418" style="font-size:30px">when to stop</text>
        </g>
        <g data-step="2">
          <text class="lbl-b" x="1568" y="60" style="font-size:48px">test</text>
          <rect x="1412" y="122" width="312" height="146" style="fill:none;stroke:var(--ink);stroke-width:4;stroke-dasharray:14 10"/>
          <text class="lbl" x="1568" y="195" style="font-size:40px">hidden</text>
          <text class="lbl" x="1568" y="330" style="font-size:36px;font-weight:700">the real exam</text>
          <text class="lbl-s" x="1568" y="380" style="font-size:30px">the grader keeps it;</text>
          <text class="lbl-s" x="1568" y="418" style="font-size:30px">scored once</text>
        </g>
        <g data-step="3">
          <text x="0" y="540" style="font-family:var(--font-display);font-weight:800;font-size:56px;fill:var(--ink)">Tune on the exam, and you only fool yourself.</text>
        </g>
      </svg>
    </div>`,
    notes: `
    <p class="time">1 min</p>
    <p class="say">A model is only useful on shots it has never seen, so we split the data like a school year. Training shots are homework; validation shots are a mock exam for choosing settings, like the learning rate or when to stop. The test set is the real exam: the grader keeps it hidden and scores it once.</p>
    <p class="do">Press → three times.</p>
    <p class="ask">You try 50 settings and keep the best validation score. Is that score still honest?</p>
    <p class="ans">Slightly too optimistic: you picked the luckiest of 50. That is why the hidden test set exists.</p>
    <p>Scale with the mean and spread of the training shots only. The slide's 20,558 / 5,139 come from Kaggle's labelled shots; the notebook's task file splits 20,000 / 5,000.</p>`,
  });

  /* ================= 2. live overfitting ================= */
  Deck.slide({
    id: 'gen-overfit',
    title: 'Overfitting, live',
    html: `
    <h2>A big net on 12 points memorises the noise</h2>
    <div class="gen-demo">
      <div id="gen-fit"></div>
      <div class="gen-side" id="gen-fit-side"></div>
    </div>`,
    init(el, api) {
      const fitHost = el.querySelector('#gen-fit'), side = el.querySelector('#gen-fit-side');
      const W = 864, H = 720, CW = 816, CH = 420, MAX = 4000;
      const cv = Plot.canvas(fitHost, W, H);
      const sx = Plot.scale(-1.05, 1.05, 24, W - 24), sy = Plot.scale(-2.1, 2.1, H - 24, 70);
      const f = x => Math.sin(3 * x);
      const r = NN.rng(3), n = 12, noise = 0.3;
      const XA = [], YA = [], VX = [], VY = [];
      for (let i = 0; i < n; i++) { const x = -1 + 2 * (i + 0.5) / n + 0.6 / n * (r() - 0.5); XA.push([x]); YA.push(f(x) + noise * r.normal()); }
      for (let i = 0; i < 200; i++) { const x = -1 + 2 * r(); VX.push([x]); VY.push(f(x) + noise * r.normal()); }
      // 68 more shots of the same curve for the "more data" button (the first 12 stay the same)
      const r2 = NN.rng(15);
      for (let i = n; i < 80; i++) { const x = -1 + 2 * r2(); XA.push([x]); YA.push(f(x) + noise * r2.normal()); }
      let X = XA.slice(0, n), Y = YA.slice(0, n);
      const S = { n: 12, net: null, opt: null, step: 0, hist: [], best: null, playing: false, train: 0, val: 0, restored: false };
      const valLoss = () => { let v = 0; for (let i = 0; i < VX.length; i++) { const e = S.net.predict(VX[i]) - VY[i]; v += e * e; } return v / VX.length; };
      const snap = () => ({ step: S.step, val: S.val, W: S.net.W.map(a => a.slice()), b: S.net.b.map(a => a.slice()) });
      function make() {
        X = XA.slice(0, S.n); Y = YA.slice(0, S.n);
        S.net = new NN.MLP([1, 32, 32, 1], { act: 'tanh', seed: 3 });
        S.opt = NN.optimizer('adam', { lr: 0.003 });
        S.step = 0; S.restored = false;
        S.train = S.net.lossAndGrad(X, Y, 'mse'); S.val = valLoss();
        S.hist = [[S.step, S.train, S.val]];
        S.best = snap();
      }
      function advance(k) {
        const t0 = performance.now();   // at most ~4 ms of training per frame
        for (let i = 0; i < k && S.step < MAX && (i < 1 || performance.now() - t0 < 4); i++) {
          S.train = S.net.lossAndGrad(X, Y, 'mse');
          S.opt.step(S.net.params(), S.net.grads());
          S.step++;
        }
        S.val = valLoss();
        S.hist.push([S.step, S.train, S.val]);
        if (S.val < S.best.val) S.best = snap();
      }
      // loss-curve panel
      const R = {};
      const rr = UI.row(side, 'pg-readouts');
      R.step = UI.readout(rr, 'step'); R.tr = UI.readout(rr, 'train loss'); R.va = UI.readout(rr, 'val loss');
      const lc = Plot.canvas(side, CW, CH);
      const lx = Plot.scale(0, L10(MAX), 96, CW - 176), ly = Plot.scale(L10(0.0008), L10(1.5), CH - 48, 16);
      const ctl = UI.row(side);
      const play = UI.button(ctl, 'Train', () => { if (S.step >= MAX) return; S.playing = !S.playing; S.restored = false; sync(); }, { kind: 'primary' });
      UI.button(ctl, 'Reset', () => { make(); S.playing = false; sync(); draw(); });
      UI.button(ctl, 'Restore best', () => {
        const b = S.best;
        b.W.forEach((w, l) => S.net.W[l].set(w)); b.b.forEach((w, l) => S.net.b[l].set(w));
        S.playing = false; S.restored = true; sync();
        S.train = S.net.lossAndGrad(X, Y, 'mse'); S.val = valLoss(); draw();
      });
      const ctl2 = UI.row(side);
      UI.choice(ctl2, [{ value: 12, label: '12 points' }, { value: 80, label: '80 points' }], 12, v => { S.n = +v; make(); S.playing = false; sync(); draw(); }, { label: 'training data' });
      function sync() { play.textContent = S.playing ? 'Pause' : 'Train'; }

      function drawFit() {
        const C = Plot.colors(), ctx = cv.ctx;
        cv.clear();
        Plot.axes(ctx, sx, sy, { labels: false, nx: 4, ny: 4 });
        ctx.save(); Plot.clip(ctx, 0, 60, W, H);
        Plot.fn(ctx, sx, sy, f, { color: C.muted, width: 3, dash: [12, 10] });
        for (let i = 0; i < 70; i++) Plot.dot(ctx, sx(VX[i][0]), sy(VY[i]), 6, C.paper, C.muted);
        Plot.fn(ctx, sx, sy, x => S.net.predict([x]), { color: C.ink, width: 5 });
        ctx.lineWidth = 2.5;
        const rad = S.n > 12 ? 8 : 11;
        X.forEach((x, i) => { ctx.beginPath(); ctx.arc(sx(x[0]), sy(Y[i]), rad, 0, 2 * Math.PI); ctx.fillStyle = C.ink; ctx.fill(); ctx.strokeStyle = C.paper; ctx.stroke(); });
        ctx.restore();
        Plot.dot(ctx, 40, 30, 11, C.ink, null);
        Plot.text(ctx, S.n + ' training points', 62, 40, { size: 28, color: C.ink, weight: 600 });
        Plot.dot(ctx, 360, 30, 7, C.paper, C.muted);
        Plot.text(ctx, 'validation points', 378, 40, { size: 28, color: C.muted });
        Plot.text(ctx, 'model', W - 30, 40, { size: 28, color: C.ink, weight: 700, align: 'right' });
        ctx.save(); ctx.strokeStyle = C.ink; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(W - 150, 31); ctx.lineTo(W - 120, 31); ctx.stroke(); ctx.restore();
      }
      function drawCurve() {
        const C = Plot.colors(), ctx = lc.ctx;
        lc.clear();
        logAxes(ctx, lx, ly, [1, 10, 100, 1000], [0.001, 0.01, 0.1, 1], { ylabel: 'loss (log scale)' });
        Plot.text(ctx, 'steps →', CW - 160, CH - 14, { size: 26, color: C.muted });
        const P = (s, v) => [lx(L10(Math.max(1, s))), ly(L10(Math.max(0.0008, Math.min(1.5, v))))];
        if (S.best && S.best.step > 0) {
          const bx = lx(L10(S.best.step));
          polyline(ctx, [[bx, ly.range[1]], [bx, ly.range[0]]], C.muted, 3, [10, 8]);
          Plot.dot(ctx, bx, P(S.best.step, S.best.val)[1], 9, C.ink, null);
          Plot.text(ctx, 'best', bx + 12, ly.range[0] - 14, { size: 28, color: C.ink, weight: 700 });
        }
        polyline(ctx, S.hist.map(h => P(h[0], h[1])), C.grad, 4);
        polyline(ctx, S.hist.map(h => P(h[0], h[2])), C.ink, 5);
        const last = S.hist[S.hist.length - 1], pt = P(last[0], last[1]), pv = P(last[0], last[2]);
        let yt = pt[1], yv = pv[1];
        if (Math.abs(yt - yv) < 34) { if (yt > yv) yt = yv + 34; else yv = yt + 34; }
        Plot.text(ctx, 'train', pt[0] + 14, yt + 9, { size: 28, color: C.grad, weight: 700 });
        Plot.text(ctx, 'validation', pv[0] + 14, yv + 9, { size: 28, color: C.ink, weight: 700 });
        R.step.set(S.step + (S.restored ? ' <span class="muted" style="font-size:28px">restored ' + S.best.step + '</span>' : ''));
        R.tr.set(S.train.toFixed(3)); R.va.set(S.val.toFixed(3));
      }
      function draw() { drawFit(); drawCurve(); }
      make(); sync(); draw();
      api.loop(() => {
        if (!S.playing) return true;
        if (S.step >= MAX) { S.playing = false; sync(); return true; }
        advance(Math.max(1, Math.min(14, Math.round(S.step * 0.012))));
        draw();
        return true;
      });
      api.onTheme(draw);
    },
    notes: `
    <p class="time">2 min</p>
    <p class="say">Twelve noisy points from a smooth dashed curve, and a big network with about a thousand weights. The hollow dots are validation points it never trains on; magenta is the training loss, black the validation loss.</p>
    <p class="ask">If we train for a very long time, what happens to each loss?</p>
    <p class="do">Take two or three answers, then press <b>Train</b> (about 10 s): both losses fall, then the curve bends through every black point and validation turns up. Press <b>Restore best</b>. Then choose <b>80 points</b> and train again: the curves stay close.</p>
    <p class="ans">Training loss goes to about 0: it memorises the noise. Validation is best early (about 0.10), then climbs to about 0.27.</p>
    <p>Like memorising last year's exam: perfect on that paper, bad on a new one.</p>`,
  });

  /* ================= 3. Kobe: bigger net? ================= */
  Deck.slide({
    id: 'gen-kobe',
    title: 'Predict: a bigger net on Kobe',
    html: `
    <div class="row"><span class="tag tag-predict">predict</span></div>
    <h2>Kobe: does an 80× bigger net score better?</h2>
    <div class="gen-two grow">
      <div class="col">
        <h3>all 20,558 training shots</h3>
        <div class="gen-nets">
          <div class="gen-net">${Widgets.netSVG({ sizes: [2, 8, 8, 1], w: 300, h: 340, r: 14 })}<span class="p">2-8-8-1<br>105 parameters</span>
            <div class="gen-score" data-step="1">0.662<small>val loss</small></div></div>
          <div class="gen-net">${Widgets.netSVG({ sizes: [2, 64, 64, 64, 1], w: 420, h: 340, r: 3, edgeWidth: 0.5 })}<span class="p">2-64-64-64-1<br>8,577 parameters</span>
            <div class="gen-score" data-step="1">0.660<small>val loss</small></div></div>
        </div>
      </div>
      <div class="col" data-step="2">
        <h3>only 500 shots, 2-256-256-1</h3>
        <div id="gen-kobe500"></div>
      </div>
    </div>`,
    init(el, api) {
      const host = el.querySelector('#gen-kobe500');
      const Wc = 816, Hc = 560;
      const cv = Plot.canvas(host, Wc, Hc);
      const st = [10, 100, 300, 1000, 2000];
      const tr = [0.669, 0.636, 0.573, 0.453, 0.373], va = [0.676, 0.696, 0.745, 0.949, 1.228];
      const sx = Plot.scale(L10(8), L10(2600), 96, Wc - 200), sy = Plot.scale(0.3, 1.3, Hc - 48, 24);
      const draw = () => {
        const C = Plot.colors(), ctx = cv.ctx;
        cv.clear();
        Plot.axes(ctx, sx, sy, { xt: [1, 2, 3], yt: [0.4, 0.6, 0.8, 1, 1.2], zero: false, labels: false });
        [10, 100, 1000].forEach(v => Plot.text(ctx, v.toLocaleString('en-US'), sx(L10(v)), sy.range[0] + 34, { size: 26, color: C.muted, align: 'center', mono: true }));
        [0.4, 0.6, 0.8, 1, 1.2].forEach(v => Plot.text(ctx, v.toFixed(1), sx.range[0] - 10, sy(v) + 9, { size: 26, color: C.muted, align: 'right', mono: true }));
        Plot.text(ctx, 'loss', sx.range[0] + 10, 46, { size: 28, color: C.ink });
        Plot.text(ctx, 'steps →', sx.range[1] + 150, sy.range[0] + 34, { size: 26, color: C.ink, align: 'right' });
        polyline(ctx, [[sx.range[0], sy(0.688)], [sx.range[1], sy(0.688)]], C.muted, 3, [12, 10]);
        Plot.text(ctx, 'constant guess 0.688', sx.range[0] + 12, sy(0.688) + 64, { size: 26, color: C.muted });
        const pts = a => st.map((s, i) => [sx(L10(s)), sy(a[i])]);
        polyline(ctx, pts(tr), C.grad, 4); polyline(ctx, pts(va), C.ink, 5);
        pts(tr).forEach(p => Plot.dot(ctx, p[0], p[1], 7, C.grad, null));
        pts(va).forEach(p => Plot.dot(ctx, p[0], p[1], 8, C.ink, null));
        const e = pts(va)[4], t = pts(tr)[4];
        Plot.text(ctx, 'validation 1.23', e[0] + 16, e[1] + 10, { size: 28, color: C.ink, weight: 700 });
        Plot.text(ctx, 'train 0.37', t[0] + 16, t[1] + 10, { size: 28, color: C.grad, weight: 700 });
      };
      draw();
      api.onTheme(draw);
    },
    notes: `
    <p class="time">1.5 min</p>
    <p class="say">Same Kobe data, same training recipe. On the left our legal net with 105 parameters; next to it a 2-64-64-64-1 net with 8,577 parameters, 80 times bigger.</p>
    <p class="ask">With all 20,558 training shots, will the big net get a much better, about the same, or a much worse validation loss? Hands up for each.</p>
    <p class="do">After the vote press →: 0.662 against 0.660. Then ask "and if we only had 500 shots?" and press → again for the right panel.</p>
    <p class="ans">About the same: 0.662 vs 0.660, a difference of 0.002. The limit is the randomness of basketball (the same spot gives makes and misses), not the size of the network. With only 500 shots, a 2-256-256-1 net memorises: its training loss falls to 0.37 while its validation loss climbs to 1.23, far worse than simply guessing 44.6% for every shot (0.688).</p>
    <p>Lesson: the right size depends on how much data you have and how noisy it is. Bigger is not automatically better. Also: a classmate who proudly reports "55% validation accuracy" on Kobe has learned nothing: always saying "miss" already gets 55.2%. (Numbers: our runs, 80/20 split, Adam 1e-3, 30 epochs, mean of 3 seeds; the 500-shot run is full-batch Adam 1e-3, 2,000 steps.) If you run notebook Part 10 live (one seed, task file), it ends at train 0.39 and validation 1.35, with the best checkpoint at step 10 (0.678): a different number above 1, the same story.</p>`,
  });

  /* ================= 4. cures ================= */
  Deck.slide({
    id: 'gen-cures',
    title: 'Five cures for memorising',
    html: `
    <h2>Five cures for memorising</h2>
    <p class="gen-patient">The patient: 2-256-256-1 on 500 Kobe shots, validation loss <b>1.23</b></p>
    <div class="gen-cures">
      <div class="gen-cure" data-step="1"><span class="n">1</span>
        <svg class="dg" viewBox="0 0 176 100" width="176" height="100" aria-hidden="true">${
          Array.from({ length: 36 }, (_, i) => `<circle cx="${14 + (i % 9) * 19}" cy="${14 + Math.floor(i / 9) * 24}" r="6" style="fill:var(--ink)"/>`).join('')}</svg>
        <span class="name">More data</span><span class="ev">big net, all 20,558 shots: <b>0.660</b></span></div>
      <div class="gen-cure" data-step="2"><span class="n">2</span>
        <span>${Widgets.netSVG({ sizes: [2, 3, 1], w: 150, h: 100, r: 12 })}</span>
        <span class="name">Smaller model</span><span class="ev">2-8-8-1 on the same 500 shots: best <b>0.677</b></span></div>
      <div class="gen-cure" data-step="3"><span class="n">3</span>
        <svg class="dg" viewBox="0 0 176 100" width="176" height="100" aria-hidden="true">
          <path d="M8,14 C40,92 70,92 100,60 S150,20 170,8" style="fill:none;stroke:var(--ink);stroke-width:5"/>
          <line x1="66" y1="6" x2="66" y2="96" style="stroke:var(--muted);stroke-width:3;stroke-dasharray:8 6"/>
          <circle cx="66" cy="78" r="9" style="fill:var(--ink)"/></svg>
        <span class="name">Stop early, keep the best</span><span class="ev">best <b>0.675</b>, at step 20<br>${Code.i('best = copy.deepcopy(model.state_dict())')}</span></div>
      <div class="gen-cure" data-step="4"><span class="n">4</span>
        <svg class="dg" viewBox="0 0 176 100" width="176" height="100" aria-hidden="true">
          <line x1="4" y1="96" x2="172" y2="96" style="stroke:var(--muted);stroke-width:3"/>
          ${[[22, 70], [66, 40], [110, 60], [154, 30]].map(([x, y]) => `<rect x="${x - 14}" y="${y}" width="28" height="${96 - y}" style="fill:var(--grad-soft);stroke:var(--ink);stroke-width:3"/>
          <line x1="${x}" y1="${y - 22}" x2="${x}" y2="${y - 4}" style="stroke:var(--grad);stroke-width:4;marker-end:url(#ah-grad)"/>`).join('')}</svg>
        <span class="name">Weight decay</span><span class="ev">pull every weight toward 0: <b>0.76</b> at the end</span></div>
      <div class="gen-cure" data-step="5"><span class="n">5</span>
        <span id="gen-drop"></span>
        <span class="name">Dropout</span><span class="ev">random neurons off while training: <b>0.71</b> at the end</span></div>
    </div>`,
    init(el, api) {
      // dropout picture: a new random half of the hidden neurons is crossed out every 0.8 s
      const host = el.querySelector('#gen-drop');
      const sizes = [2, 5, 5, 1], w = 176, h = 100;
      const xs = [12, 64, 116, 166], ys = n => Array.from({ length: n }, (_, i) => n === 1 ? 50 : 10 + 80 * i / (n - 1));
      const rng = NN.rng(4);
      let off = new Set();
      const render = () => {
        let s = `<svg class="dg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-hidden="true">`;
        for (let l = 0; l < 3; l++) ys(sizes[l]).forEach((y1, i) => ys(sizes[l + 1]).forEach((y2, j) => {
          const dead = off.has(l + ':' + i) || off.has(l + 1 + ':' + j);
          s += `<line x1="${xs[l]}" y1="${y1}" x2="${xs[l + 1]}" y2="${y2}" style="stroke:${dead ? 'var(--rule)' : 'var(--muted)'};stroke-width:${dead ? 1 : 2}"/>`;
        }));
        sizes.forEach((n, l) => ys(n).forEach((y, i) => {
          const dead = off.has(l + ':' + i);
          s += `<circle cx="${xs[l]}" cy="${y}" r="8" style="fill:var(--paper);stroke:${dead ? 'var(--rule)' : 'var(--ink)'};stroke-width:3"/>`;
          if (dead) s += `<path d="M${xs[l] - 9},${y - 9} L${xs[l] + 9},${y + 9} M${xs[l] + 9},${y - 9} L${xs[l] - 9},${y + 9}" style="stroke:var(--ink);stroke-width:3.5"/>`;
        }));
        host.innerHTML = s + '</svg>';
      };
      const shuffle = () => { off = new Set(); [1, 2].forEach(l => { for (let i = 0; i < 5; i++) if (rng() < 0.4) off.add(l + ':' + i); }); render(); };
      shuffle();
      let t = 0;
      api.loop(dt => { if (api.step >= 5) { t += dt; if (t > 0.8) { t = 0; shuffle(); } } return true; });
    },
    notes: `
    <p class="time">1.5 min</p>
    <p class="say">The patient: a net about 600 times bigger than the Kobe net, trained on only 500 shots. Its validation loss climbs to 1.23, worse than a constant guess (0.69). Five standard cures, with what each did on Kobe.</p>
    <p class="do">Press → five times, about 15 s each; spend longest on 3 and 5.</p>
    <ul>
      <li><b>Stop early</b>: save the weights whenever validation is the best so far (the "Restore best" button).</li>
      <li><b>Weight decay</b>: every step shrinks each weight a little toward 0.</li>
      <li><b>Dropout</b>: random neurons off at every step, like the rotating bank tellers from the break game.</li>
    </ul>
    <p class="ask">Which cures can you not use much on Kobe?</p>
    <p class="ans">More data and a smaller model: the rules fix both. The 105-weight Kobe net barely overfits, so keep the best checkpoint.</p>
    <p>Notebook Part 10, same story: 1.35 at the end, best 0.678 at step 10.</p>`,
  });

  /* ================= 5. loss-curve doctor ================= */
  const DOC = [
    { dx: '<b>Learning rate too high</b><br>→ divide it by 10', seed: 11, lab: 0.36 },
    { dx: '<b>Overfitting</b><br>→ stop early, keep the best', seed: 12, val: true },
    { dx: '<b>Learning rate too low</b><br>→ ×10, or train longer', seed: 13 },
    { dx: '<b>Learned nothing</b><br>→ hunt the bug', seed: 14 },
    { dx: '<b>Very noisy</b><br>→ bigger batch or smaller lr', seed: 15, lab: 0.98 },
    { dx: '<b>Healthy</b><br>→ keep it, save the best', seed: 16, val: true },
  ];
  const docCurve = (k, t, r) => {
    const z = () => r() - 0.5;
    switch (k) {
      case 0: return 0.69 - 0.15 * (1 - Math.exp(-t * 18)) + 0.36 * t * t + (t > 0.03 && r() < 0.12 ? 0.25 * r() : 0) + (t > 0.03 ? 0.08 * z() : 0);
      case 1: return 0.12 + 0.58 * Math.exp(-4.5 * t) + 0.01 * z();
      case 2: return 0.69 - 0.16 * t + 0.008 * z();
      case 3: return 0.69 + 0.006 * z();
      case 4: return 0.28 + 0.42 * Math.exp(-6 * t) + 0.22 * z();
      default: return 0.24 + 0.46 * Math.exp(-7 * t) + 0.012 * z();
    }
  };
  const docVal = (k, t, r) => k === 1 ? 0.42 + 0.28 * Math.exp(-9 * t) + 0.42 * t * t + 0.01 * (r() - 0.5) : 0.3 + 0.4 * Math.exp(-7 * t) + 0.012 * (r() - 0.5);
  Deck.slide({
    id: 'gen-doctor',
    title: 'Loss-curve doctor',
    html: `
    <h2>Loss-curve doctor: what went wrong?</h2>
    <div class="gen-doc">
      ${DOC.map((d, i) => `<div class="gen-card"><span class="n">${i + 1}</span><div class="gen-doc-cv" data-k="${i}"></div><div class="dx" data-step="${i + 1}">${d.dx}</div></div>`).join('')}
    </div>`,
    init(el, api) {
      const Wc = 544, Hc = 250;
      const cvs = Array.from(el.querySelectorAll('.gen-doc-cv')).map(h => Plot.canvas(h, Wc, Hc));
      const draw = () => {
        const C = Plot.colors();
        cvs.forEach((cv, k) => {
          const ctx = cv.ctx;
          cv.clear();
          const x0 = 76, x1 = Wc - 8, y0 = 14, y1 = Hc - 34;
          const sx = t => x0 + t * (x1 - x0), sy = v => y1 - (v / 1.15) * (y1 - y0);
          // axes
          polyline(ctx, [[x0, y0], [x0, y1], [x1, y1]], C.muted, 2.5);
          Plot.text(ctx, 'loss', 4, y1 - 4, { size: 26, color: C.muted });
          Plot.text(ctx, 'steps →', x1, Hc - 2, { size: 26, color: C.muted, align: 'right' });
          Plot.text(ctx, '0.69', x0 - 8, sy(0.69) + 9, { size: 26, color: C.muted, align: 'right', mono: true });
          polyline(ctx, [[x0 + 4, sy(0.69)], [x0 + 20, sy(0.69)]], C.muted, 2.5);
          const r = NN.rng(DOC[k].seed), N = 120;
          const tr = [], va = [];
          for (let i = 0; i <= N; i++) { const t = i / N; tr.push([sx(t), sy(Math.min(1.12, Math.max(0.02, docCurve(k, t, r))))]); }
          if (DOC[k].val) { const r2 = NN.rng(DOC[k].seed + 50); for (let i = 0; i <= N; i++) { const t = i / N; va.push([sx(t), sy(Math.min(0.98, docVal(k, t, r2)))]); } }
          ctx.save(); ctx.beginPath(); ctx.rect(x0, y0 - 4, x1 - x0 + 4, y1 - y0 + 4); ctx.clip();
          polyline(ctx, tr, C.grad, 4);
          if (va.length) polyline(ctx, va, C.ink, 5);
          ctx.restore();
          if (va.length) {
            Plot.text(ctx, 'val', x1 - 4, va[N][1] - 14, { size: 26, color: C.ink, align: 'right', weight: 700 });
            if (tr[N][1] + 32 > y1 - 6) { const m = Math.round(N * 0.7); Plot.text(ctx, 'train', tr[m][0], tr[m][1] - 14, { size: 26, color: C.grad, align: 'center', weight: 700 }); }
            else Plot.text(ctx, 'train', x1 - 4, tr[N][1] + 32, { size: 26, color: C.grad, align: 'right', weight: 700 });
          } else Plot.text(ctx, 'train', x1 - 4, DOC[k].lab ? sy(DOC[k].lab) : tr[N][1] < (y0 + y1) / 2 ? tr[N][1] + 40 : tr[N][1] - 18, { size: 26, color: C.grad, align: 'right', weight: 700 });
        });
      };
      draw();
      api.onTheme(draw);
    },
    notes: `
    <p class="time">2 min</p>
    <p class="say">Reading a loss curve is the most useful debugging skill of today. Magenta is the training loss, black the validation loss; the 0.69 mark is a net that knows nothing. Write one word per card, then we check.</p>
    <p class="do">45 s of silent writing, then press → six times; ask one student before each click.</p>
    <ol>
      <li><b>lr too high</b>: spikes, drifts up. Divide it by 10.</li>
      <li><b>Overfitting</b>: keep the best checkpoint.</li>
      <li><b>lr too low</b>: a slow straight line. ×10, or train longer.</li>
      <li><b>Learned nothing</b>: flat at 0.69. Look for a missing <code>step()</code> or <code>zero_grad()</code>, unscaled inputs, shuffled labels.</li>
      <li><b>Very noisy</b>: bigger batch or smaller lr.</li>
      <li><b>Healthy</b>: validation a little above training is normal.</li>
    </ol>
    <p>The six curves are hand-drawn sketches, not real runs.</p>`,
  });

  /* ================= 6. Karpathy's checks ================= */
  Deck.slide({
    id: 'gen-recipe',
    title: "Karpathy's four checks",
    html: `
    <h2>Training fails silently: check four things</h2>
    <div class="split split-64">
      <div class="gen-checks">
        <div class="gen-check" data-step="1"><span class="n">1</span><div><b>First loss ≈ 0.69</b><span class="ev">Kobe scaled <span class="mono">0.69</span> ✓ · raw inputs <span class="mono">2.36</span> ✗</span></div></div>
        <div class="gen-check" data-step="2"><span class="n">2</span><div><b>Beat a dumb baseline</b><span class="ev">always “miss”: <span class="mono">55.2%</span> accuracy, loss <span class="mono">0.688</span></span></div></div>
        <div class="gen-check" data-step="3"><span class="n">3</span><div><b>Overfit two shots first</b><span class="ev">loss must reach ≈ <span class="mono">0</span>; if not, there is a bug</span></div></div>
        <div class="gen-check" data-step="4"><span class="n">4</span><div><b>Look at the predictions</b><span class="ev">does the map make basketball sense?</span></div></div>
      </div>
      <div class="col" data-step="4"><div id="gen-court"></div><span class="gen-cap">chance of a make, as the net sees it</span></div>
    </div>
    <p class="tiny">“Neural net training fails silently.” Andrej Karpathy, A Recipe for Training Neural Networks, 2019</p>`,
    init(el, api) {
      const host = el.querySelector('#gen-court');
      const fr = Widgets.courtFrame(0, 0, 576);
      const cv = Plot.canvas(host, 576, Math.ceil(fr.h));
      // a quick 2-8-8-1 fit on 3,000 of Kobe's shots, done once
      const X = KOBE.X.slice(0, 3000), Y = KOBE.Y.slice(0, 3000);
      const mu = [0, 1].map(d => X.reduce((s, p) => s + p[d], 0) / X.length);
      const sd = [0, 1].map(d => Math.sqrt(X.reduce((s, p) => s + (p[d] - mu[d]) ** 2, 0) / X.length));
      const prep = p => [(p[0] - mu[0]) / sd[0], (p[1] - mu[1]) / sd[1]];
      const Xs = X.map(prep);
      const net = new NN.MLP([2, 8, 8, 1], { act: 'tanh', seed: 3 });
      const opt = NN.optimizer('adam', { lr: 0.01 });
      const rng = NN.rng(5);
      for (let ep = 0; ep < 12; ep++) {
        const idx = NN.data.shuffle(Xs.length, rng);
        for (let b = 0; b < idx.length; b += 128) { net.lossAndGrad(Xs, Y, 'bce', idx.slice(b, b + 128)); opt.step(net.params(), net.grads()); }
      }
      const draw = () => {
        const C = Plot.colors(), ctx = cv.ctx;
        cv.clear(C.paper);
        Plot.heat(ctx, (x, y) => NN.sigmoid(net.predict(prep([x, y]))), fr, { res: 64, mid: 0.45, span: 0.25, strength: 0.75 });
        Widgets.drawCourt(ctx, fr, { color: C.ink, width: 3 });
      };
      draw();
      api.onTheme(draw);
    },
    notes: `
    <p class="time">1 min</p>
    <p class="say">Andrej Karpathy, who led AI at Tesla, wrote the most famous checklist for training networks. His key sentence: neural net training fails silently. A wrong program usually still runs and still prints a loss, it is just quietly worse. So before trusting any run, do four cheap checks.</p>
    <p class="do">Press → four times, one check per click; the court map appears with check 4.</p>
    <ol>
      <li><b>Look at the very first loss.</b> A fresh net guesses about 50/50, so binary cross-entropy starts near 0.69. On Kobe with scaled inputs we got 0.69; with raw coordinates (values in the hundreds) 2.36. A strange first number is your first warning.</li>
      <li><b>Beat a dumb baseline.</b> On Kobe, always saying "miss" is right 55.2% of the time, and always predicting 44.6% gives loss 0.688. If you do not beat these clearly, the net has learned nothing. So "55% accuracy" is not a result, it is the baseline.</li>
      <li><b>Overfit a tiny batch.</b> Train on just two shots (one made, one missed, from different spots) for a few hundred steps. A working net must reach a loss near 0. If it cannot memorise two examples, there is a bug in the code, not a lack of data. (Two shots from the very same spot with different results can never reach 0, so do not pick those.)</li>
      <li><b>Look at what it predicts.</b> For Kobe: draw the predicted chance of a make on the court, like here. Orange near the rim, blue far away: that makes sense. A striped or random map means a bug.</li>
    </ol>
    <p class="ask">Why is check 3 so powerful?</p>
    <p class="ans">Memorising two examples is the easiest task there is. If even that fails, the problem must be in the code (loss, labels, optimizer, shapes), and you found it in seconds instead of after a long run.</p>
    <p>Karpathy also tweeted (2018) his list of the most common mistakes: not overfitting a single batch first, forgetting train/eval mode, forgetting zero_grad before backward, and passing softmaxed outputs to a loss that expects raw logits. Three of them (train/eval mode, zero_grad, a sigmoid before a loss that expects raw logits) appear in the bug hunt next.</p>`,
  });

  /* ================= 7. bug hunt ================= */
  const HUNT = `
    mu, sd = Xva.mean(0), Xva.std(0)
    Xtr, Xva = (Xtr - mu) / sd, (Xva - mu) / sd
    model = nn.Sequential(nn.Linear(2, 8), nn.ReLU(),
        nn.Linear(8, 1), nn.Sigmoid())
    loss_fn = nn.BCEWithLogitsLoss()
    opt = torch.optim.Adam(model.parameters())
    for epoch in range(30):
        for xb, yb in batches(Xtr, ytr):  # yb: (64,)
            loss = loss_fn(model(xb), yb)
            loss.backward()
            opt.step()
        print('val', loss_fn(model(Xtr), ytr).item())`;
  Deck.slide({
    id: 'gen-hunt',
    title: 'Bug hunt: five planted bugs',
    html: `
    <div class="row"><span class="tag tag-pair">pairs · 4 min</span></div>
    <h2>This loop has five bugs. Find them.</h2>
    <div class="gen-hunt">
      ${Code.py(HUNT, { size: 's', hl: '1:1 2:4-5 3:8 4:9-11 5:12' })}
      <div class="stack">
        <div data-until="1" id="gen-timer"></div>
        <div class="gen-bugs">
          <div class="gen-bug" data-step="1"><span class="n">1</span><span>scaled with validation stats<span class="fx">→ use the training mean, std</span></span></div>
          <div class="gen-bug" data-step="2"><span class="n">2</span><span>Sigmoid + BCEWithLogitsLoss<span class="fx">→ delete nn.Sigmoid()</span></span></div>
          <div class="gen-bug" data-step="3"><span class="n">3</span><span>yb is (64,), output (64, 1)<span class="fx">→ ytr.unsqueeze(1): the only crash</span></span></div>
          <div class="gen-bug" data-step="4"><span class="n">4</span><span>no opt.zero_grad()<span class="fx">→ add it before backward()</span></span></div>
          <div class="gen-bug" data-step="5"><span class="n">5</span><span>“val” is the training set<span class="fx">→ Xva, yva, eval(), no_grad()</span></span></div>
        </div>
      </div>
    </div>`,
    init(el, api) { Widgets.timer(api, el.querySelector('#gen-timer'), 4); },
    notes: `
    <p class="time">5 min (4 in pairs, 1 to reveal)</p>
    <p class="do">Hand out the printed loop (the same 12 lines). Pairs circle every bug they find. Press <b>Start</b> on the timer. When it ends, ask "who found 5? 4? 3?" and then press → five times; each click highlights one bug in the code and lists it on the right. Ask the class for each one before clicking.</p>
    <ol>
      <li><b>Line 1: scaling with validation statistics.</b> The mean and standard deviation must come from the training shots only, and then be applied to both. Here they come from the "mock exam", so information about the validation shots leaks into training. On Kobe the damage is tiny (a random split has almost the same mean), which is exactly why nobody notices it; with a hidden test set you do not even have those statistics, and the Kobe grader feeds raw coordinates, so you must keep the training mean and standard deviation.</li>
      <li><b>Lines 4 and 5: <code>nn.Sigmoid()</code> at the end together with <code>BCEWithLogitsLoss</code>.</b> The loss already applies a sigmoid, so it is applied twice. Silent: on Kobe the printed loss looked normal and accuracy stayed 61%, but the real log loss of the outputs was about 4.5 instead of 0.662. The model must output logits.</li>
      <li><b>Line 8: the label shape.</b> <code>yb</code> has shape (64,) but the model outputs (64, 1). <code>BCEWithLogitsLoss</code> stops with "Target size (torch.Size([64])) must be the same as input size (torch.Size([64, 1]))". Fix: make the labels (N, 1) with <code>ytr.unsqueeze(1)</code>. This is the only one of the five bugs that crashes. (With <code>MSELoss</code> the same mismatch does not crash: it silently compares every output with every label.)</li>
      <li><b>Lines 9 to 11: no <code>opt.zero_grad()</code>.</b> Gradients add up step after step. On Kobe (our 2-8-8-1 runs, mean of 3 seeds): log loss 0.686 and about 44% accuracy, worse than always saying "miss".</li>
      <li><b>Line 12: the "validation" loss is computed on the training data</b>, so it can only look good. Use <code>Xva, yva</code>, call <code>model.eval()</code> and wrap it in <code>with torch.no_grad():</code>, then <code>model.train()</code> again before training.</li>
    </ol>
    <p>Most often missed: bug 1 (it looks harmless) and bug 2 (it looks like what logistic regression does). Bonus if someone points out that <code>nn.Sequential</code> is fine in general but forbidden by the Kobe task rules. We ran this exact code in PyTorch 2.15: it stops at bug 3 with the ValueError above; with the five fixes it trains normally.</p>`,
  });

  /* ================= 8. error gallery ================= */
  const ERRS = [
    ['RuntimeError: addmm: <b>mat1 and mat2 shapes cannot be multiplied (64x3 and 2x8)</b>', `input has 3 columns, layer expects 2: ${Code.i('nn.Linear(3, 8)')}`],
    ['RuntimeError: <b>mat1 and mat2 must have the same dtype, but got Double and Float</b>', `numpy and pandas give float64: ${Code.i('X = X.float()')}`],
    ['ValueError: <b>Target size (torch.Size([64])) must be the same as input size (torch.Size([64, 1]))</b>', `labels need shape (64, 1): ${Code.i('y = y.unsqueeze(1)')}`],
    ["RuntimeError: <b>result type Float can't be cast to the desired output type Long</b>", `labels must be floats: ${Code.i('y = y.float()')}`],
    ["RuntimeError: <b>Can't call numpy() on Tensor that requires grad.</b> Use tensor.detach().numpy() instead.", `the message says it: ${Code.i('.detach().numpy()')}`],
  ];
  Deck.slide({
    id: 'gen-errors',
    title: 'Bug gallery: real error messages',
    html: `
    <h2>Loud bugs: the last line names the fix</h2>
    <div class="gen-errs">
      ${ERRS.map((e, i) => `<div class="gen-err"><pre class="gen-msg">${e[0]}</pre><div class="gen-fix" data-step="${i + 1}">${e[1]}</div></div>`).join('')}
    </div>`,
    notes: `
    <p class="time">30 s</p>
    <p class="say">The good news: some bugs are loud. PyTorch stops and prints an error. Students often panic at the long red traceback. Read only the last line: it says what is wrong, and often how to fix it. These five are the ones you will meet today, copied exactly from PyTorch 2.15.</p>
    <p class="do">Ask "what is the fix?" for the first message only, then press → five times quickly to reveal all the fixes. The slide is a reference: tell students to come back to it when they hit one of these errors in the tasks.</p>
    <ol>
      <li>The input has 3 columns but the first layer was built for 2 (64 rows × 3 columns times a 2 × 8 weight matrix). Make the layer match the data, or remove the extra column.</li>
      <li>Data loaded with numpy or pandas is float64 ("Double"), the model's weights are float32 ("Float"). Convert: <code>torch.tensor(X, dtype=torch.float32)</code> or <code>X.float()</code>.</li>
      <li>The labels are a flat list of 64 numbers, the model outputs a column of 64. Add the column dimension with <code>unsqueeze(1)</code>.</li>
      <li>Labels created as integers (Long) go into a loss that needs floats. <code>y.float()</code>.</li>
      <li>You tried to turn a tensor that is still connected to the gradient machinery into numpy (for example to plot predictions). Detach it first, as the message says.</li>
    </ol>
    <p>All five were produced by running the failing code in torch 2.15.0 on CPU. Note that in 2.15 the first message starts with "addmm:"; older versions print it without that prefix. The silent bugs from the bug hunt are the dangerous ones; loud bugs cost you a minute.</p>`,
  });

  /* ================= 9. the U-curve is not everything ================= */
  Deck.slide({
    id: 'gen-story',
    title: 'Double descent and grokking',
    html: `
    <h2>Bigger can be worse, then better again</h2>
    <div class="gen-two grow">
      <div class="col"><h3>double descent</h3><div id="gen-dd"></div></div>
      <div class="col" data-step="1"><h3>grokking: understanding comes late</h3><div id="gen-grok"></div><span class="gen-cap">schematic, after Power et al. 2022</span></div>
    </div>`,
    init(el, api) {
      const Wc = 816, Hc = 600;
      const dd = Plot.canvas(el.querySelector('#gen-dd'), Wc, Hc);
      const gk = Plot.canvas(el.querySelector('#gen-grok'), Wc, Hc);
      const P = [5, 10, 20, 30, 35, 38, 40, 42, 45, 50, 60, 80, 120, 200, 300, 400];
      const E = [1.16, 1.32, 2.12, 4.62, 8.35, 20.4, 167, 27.6, 9.1, 5.1, 3.0, 2.0, 1.40, 1.09, 0.99, 0.93];
      const draw = () => {
        const C = Plot.colors();
        // double descent: test error vs model size (median of 50 random datasets, 40 training points)
        let ctx = dd.ctx; dd.clear();
        let sx = Plot.scale(L10(4), L10(450), 96, Wc - 24), sy = Plot.scale(L10(0.6), L10(300), Hc - 96, 40);
        logAxes(ctx, sx, sy, [10, 100], [1, 10, 100], { ylabel: 'error on new data (log)' });
        Plot.text(ctx, 'model size (number of weights, log) →', Wc - 24, Hc - 30, { size: 26, color: C.ink, align: 'right' });
        const x40 = sx(L10(40));
        polyline(ctx, [[x40, sy.range[1]], [x40, sy.range[0]]], C.muted, 3, [12, 10]);
        Plot.text(ctx, '= 40 training points', x40 + 14, sy(L10(160)) + 8, { size: 26, color: C.muted });
        const pts = P.map((p, i) => [sx(L10(p)), sy(L10(E[i]))]);
        polyline(ctx, pts, C.ink, 5);
        pts.forEach(p => Plot.dot(ctx, p[0], p[1], 7, C.ink, null));
        Plot.text(ctx, 'memorising', x40 - 14, sy(L10(60)), { size: 28, color: C.ink, weight: 700, align: 'right' });
        Plot.text(ctx, 'huge: best', sx(L10(400)), sy(L10(1.4)) - 16, { size: 28, color: C.ink, weight: 700, align: 'right' });
        // grokking: schematic accuracy curves
        ctx = gk.ctx; gk.clear();
        sx = Plot.scale(1, 5, 96, Wc - 24); sy = Plot.scale(0, 100, Hc - 96, 40);
        Plot.axes(ctx, sx, sy, { xt: [1, 2, 3, 4, 5], yt: [0, 50, 100], zero: false, labels: false });
        [0, 50, 100].forEach(v => Plot.text(ctx, v + '%', 86, sy(v) + 9, { size: 26, color: C.muted, align: 'right', mono: true }));
        Plot.text(ctx, 'accuracy', 106, 30, { size: 28, color: C.ink });
        Plot.text(ctx, 'training steps (log) →', Wc - 24, Hc - 30, { size: 26, color: C.ink, align: 'right' });
        const trainAcc = t => 100 / (1 + Math.exp(-5 * (t - 2.2)));
        const valAcc = t => 3 + 95 / (1 + Math.exp(-7 * (t - 4.1)));
        Plot.fn(ctx, sx, sy, trainAcc, { color: C.grad, width: 4 });
        Plot.fn(ctx, sx, sy, valAcc, { color: C.ink, width: 5 });
        Plot.text(ctx, 'train', sx(2.2) - 24, sy(80), { size: 28, color: C.grad, weight: 700, align: 'right' });
        Plot.text(ctx, 'validation', sx(2.7), sy(3) - 18, { size: 28, color: C.ink, weight: 700 });
      };
      draw();
      api.onTheme(draw);
    },
    notes: `
    <p class="time">30 s (if late, skip the left panel and tell only the vacation story)</p>
    <p class="say">One last surprise: "too big means overfitting" is not the whole story. Left: 40 training points, models of growing size. The error on new data explodes when the model has just enough weights to pass through all 40 points, then falls again: the biggest model is the best. This is double descent, part of why huge networks work so well.</p>
    <p class="do">Press → for the right panel.</p>
    <p class="say">Right: grokking. On some small puzzles a network memorises its training data quickly, stays at chance on new data, and thousands of steps later suddenly "gets it". The researcher Alethea Power: "And then one day, we got lucky. And by lucky, I mean forgetful." A team member went on holiday and forgot to stop the training run.</p>
    <p class="ask">Should you train your Kobe net for a week, hoping it groks?</p>
    <p class="ans">No. Grokking was seen on tiny algorithmic puzzles, not on noisy data like basketball shots, and double descent needs models far bigger than the Kobe rules allow. For our tasks the classic advice holds: watch the validation loss and keep the best checkpoint.</p>
    <p>Background: the left curve is real, from a small linear-regression experiment in our research notes (400 random features, 40 training points, least-squares fit using the first P features; median test error over 50 random datasets; peak 167 at P = 40, 0.93 at P = 400). Sources: Belkin et al., PNAS 2019; Nakkiran et al. 2019 ("Deep Double Descent"); Power et al. 2022 ("Grokking"); the quote is from Quanta Magazine, April 2024. The word "grok" comes from Heinlein's 1961 novel <i>Stranger in a Strange Land</i>. The right panel is a schematic, not data.</p>`,
  });
}
