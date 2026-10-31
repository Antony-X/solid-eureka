/* Widgets: reusable live demos built on NN + Plot + UI.
   Each takes the slide api (for animation loops and theme redraws).          */
(function () {
  'use strict';
  const Wg = (window.Widgets = {});

  /* ------------------------------------------------------------------
     playground: a 2-D classifier that trains live, TensorFlow-Playground style.
     opts: size, data ('circle'|'xor'|'spiral'|'moons'|'blobs'|{X,Y}), n, noise,
           hidden ([] = logistic regression), act, opt ('adam'|'sgd'|'momentum'),
           lr, steps (per frame), autoplay, controls (array of names:
           'play','reset','step','act','hidden','lr','data','opt'),
           neurons (show first-layer neuron maps), domain, seed, readouts, maxEpochs
  ------------------------------------------------------------------ */
  Wg.playground = function (api, parent, o) {
    o = Object.assign({
      size: 720, data: 'circle', n: 300, noise: 0.0, hidden: [8, 8], act: 'tanh', opt: 'adam', lr: 0.03,
      steps: 4, autoplay: false, controls: ['play', 'reset'], neurons: false, domain: [-1.25, 1.25], seed: 1,
      readouts: true, res: 56, maxEpochs: 4000, loss: 'bce',
    }, o || {});
    const root = document.createElement('div');
    root.className = 'pg';
    parent.appendChild(root);
    const main = document.createElement('div');
    main.className = 'pg-main';
    root.appendChild(main);
    let neuronBox = null;
    if (o.neurons) { neuronBox = document.createElement('div'); neuronBox.className = 'pg-neurons'; main.appendChild(neuronBox); }
    const cvWrap = document.createElement('div');
    cvWrap.className = 'pg-canvas';
    main.appendChild(cvWrap);
    const cv = Plot.canvas(cvWrap, o.size, o.size);
    const side = document.createElement('div');
    side.className = 'pg-side';
    main.appendChild(side);

    const S = { data: null, net: null, optim: null, epoch: 0, playing: !!o.autoplay, losses: [], acc: 0, loss: 0 };
    const fr = Plot.frame(0, 0, o.size, o.domain);

    function makeData() {
      if (typeof o.data === 'object') S.data = o.data;
      else S.data = NN.data[o.data](o.n, o.seed + 100, o.noise);
    }
    function makeNet() {
      S.net = new NN.MLP([2].concat(o.hidden, [1]), { act: o.act, seed: o.seed });
      S.optim = NN.optimizer(o.opt, { lr: o.lr });
      S.epoch = 0; S.losses = [];
      S.loss = S.net.lossAndGrad(S.data.X, S.data.Y, o.loss);
      S.acc = S.net.accuracy(S.data.X, S.data.Y);
    }
    function trainSteps(k) {
      for (let i = 0; i < k; i++) {
        S.loss = S.net.lossAndGrad(S.data.X, S.data.Y, o.loss);
        S.optim.step(S.net.params(), S.net.grads());
        S.epoch++;
        if (S.epoch % 2 === 0) S.losses.push(S.loss);
      }
      S.acc = S.net.accuracy(S.data.X, S.data.Y);
    }
    const prob = (x, y) => NN.sigmoid(S.net.predict([x, y]));

    // neuron maps
    let nCanv = [];
    function buildNeurons() {
      if (!neuronBox) return;
      neuronBox.innerHTML = '';
      nCanv = [];
      const h = o.hidden[0] || 0;
      const sz = Math.min(o.neuronSize || 110, Math.floor((o.size - 12 * (h - 1)) / Math.max(1, h)));
      for (let j = 0; j < h; j++) nCanv.push(Plot.canvas(neuronBox, sz, sz, 'pg-neuron'));
    }
    function drawNeurons() {
      if (!neuronBox) return;
      nCanv.forEach((c, j) => {
        const f = Plot.frame(0, 0, c.w, o.domain);
        c.clear(Plot.colors().paper);
        Plot.heat(c.ctx, (x, y) => {
          S.net.forward([x, y]);
          const a = S.net.hidden(1, j);
          const v = o.act === 'relu' || o.act === 'leaky' ? Math.tanh(a) : o.act === 'sigmoid' ? 2 * a - 1 : Math.tanh(a);
          return 0.5 + 0.5 * v;
        }, f, { res: 22, strength: 0.9 });
      });
    }

    function draw() {
      const C = Plot.colors();
      const ctx = cv.ctx;
      cv.clear(C.paper);
      Plot.heat(ctx, prob, fr, { res: o.res });
      if (o.boundary !== false) Plot.contour(ctx, prob, fr, { res: 60, color: C.ink, width: 3 });
      Plot.points(ctx, S.data.X, S.data.Y, fr.sx, fr.sy, { r: o.dot || 7 });
      ctx.save(); ctx.strokeStyle = C.rule; ctx.lineWidth = 2; ctx.strokeRect(1, 1, o.size - 2, o.size - 2); ctx.restore();
      drawNeurons();
      if (R.epoch) {
        R.epoch.set(S.epoch);
        R.loss.set(S.loss.toFixed(3));
        R.acc.set(Math.round(S.acc * 100) + '%');
      }
      if (lossCv) {
        lossCv.clear();
        Plot.curve(lossCv.ctx, S.losses, { x: 4, y: 6, w: lossCv.w - 8, h: lossCv.h - 12 }, { min: 0, max: Math.max(0.75, S.losses[0] || 0.75) });
      }
    }

    // controls
    const R = {};
    let lossCv = null;
    if (o.readouts) {
      const rr = UI.row(side, 'pg-readouts');
      R.epoch = UI.readout(rr, 'epoch');
      R.loss = UI.readout(rr, 'loss');
      R.acc = UI.readout(rr, 'accuracy');
      const lw = document.createElement('div');
      lw.className = 'pg-loss';
      side.appendChild(lw);
      lossCv = Plot.canvas(lw, o.lossW || 420, 120);
    }
    const ctl = UI.row(side, 'pg-controls');
    const has = k => o.controls.includes(k);
    let playBtn = null;
    if (has('play')) playBtn = UI.button(ctl, 'Train', () => { S.playing = !S.playing; syncPlay(); }, { kind: 'primary' });
    if (has('step')) UI.button(ctl, '+1 step', () => { trainSteps(1); draw(); });
    if (has('reset')) UI.button(ctl, 'Reset', () => { reset(); });
    function syncPlay() { if (playBtn) playBtn.textContent = S.playing ? 'Pause' : 'Train'; }
    const ctl2 = UI.row(side, 'pg-controls');
    if (has('data')) UI.choice(ctl2, ['circle', 'xor', 'moons', 'spiral'].map(v => ({ value: v, label: v })), o.data, v => { o.data = v; makeData(); reset(); });
    if (has('act')) UI.choice(ctl2, (o.acts || ['linear', 'relu', 'tanh', 'sigmoid']).map(v => ({ value: v, label: NN.act[v].name })), o.act, v => { o.act = v; reset(); });
    if (has('hidden')) UI.choice(ctl2, (o.hiddenChoices || [[], [2], [4], [8, 8]]).map(v => ({ value: v.join('-') || '0', label: v.length ? '2-' + v.join('-') + '-1' : '2-1' })), o.hidden.join('-') || '0', v => { o.hidden = v === '0' ? [] : v.split('-').map(Number); buildNeurons(); reset(); });
    if (has('opt')) UI.choice(ctl2, ['sgd', 'momentum', 'adam'].map(v => ({ value: v, label: v === 'sgd' ? 'SGD' : v === 'adam' ? 'Adam' : 'Momentum' })), o.opt, v => { o.opt = v; reset(); });
    if (has('lr')) UI.slider(side, { label: 'learning rate', min: -4, max: 0.5, step: 0.05, value: Math.log10(o.lr), map: v => Math.pow(10, v), fmt: v => v < 0.01 ? v.toExponential(0) : v.toFixed(v < 0.1 ? 3 : 2), oninput: v => { o.lr = v; S.optim.o.lr = v; } });

    function reset() { makeNet(); S.playing = !!o.autoplay && S.playing; syncPlay(); draw(); }
    makeData(); buildNeurons(); makeNet(); syncPlay(); draw();

    api.loop(() => {
      if (S.playing && S.epoch < o.maxEpochs) { trainSteps(o.steps); draw(); }
      return true;
    });
    api.onTheme(draw);
    return {
      S, draw, reset, root,
      play() { S.playing = true; syncPlay(); },
      pause() { S.playing = false; syncPlay(); },
      set(nv) { Object.assign(o, nv); if (nv.data) makeData(); if (nv.hidden) buildNeurons(); reset(); },
      train(k) { trainSteps(k); draw(); },
    };
  };

  /* ------------------------------------------------------------------
     fit1d: an MLP fits y = f(x) from samples, live.
     opts: w, h, f, xs ([a,b]), ys ([lo,hi]), n, hidden, act, lr, steps, autoplay, controls
  ------------------------------------------------------------------ */
  Wg.fit1d = function (api, parent, o) {
    o = Object.assign({ w: 900, h: 560, f: x => Math.sin(3 * x), xs: [-1, 1], ys: [-1.5, 1.5], n: 60, hidden: [16], act: 'tanh', lr: 0.01, steps: 20, autoplay: false, controls: ['play', 'reset'], seed: 2, opt: 'adam', noise: 0 }, o || {});
    const root = document.createElement('div');
    root.className = 'fit1d';
    parent.appendChild(root);
    const cv = Plot.canvas(root, o.w, o.h);
    const pad = { l: 70, r: 20, t: 20, b: 50 };
    const sx = Plot.scale(o.xs[0], o.xs[1], pad.l, o.w - pad.r);
    const sy = Plot.scale(o.ys[0], o.ys[1], o.h - pad.b, pad.t);
    const r = NN.rng(o.seed);
    const X = [], Y = [];
    for (let i = 0; i < o.n; i++) { const x = o.xs[0] + (o.xs[1] - o.xs[0]) * (i + 0.5) / o.n; X.push([x]); Y.push(o.f(x) + o.noise * r.normal()); }
    const S = { net: null, optim: null, epoch: 0, playing: !!o.autoplay, loss: 0 };
    function makeNet() {
      S.net = new NN.MLP([1].concat(o.hidden, [1]), { act: o.act, seed: o.seed });
      S.optim = NN.optimizer(o.opt, { lr: o.lr });
      S.epoch = 0;
      S.loss = S.net.lossAndGrad(X, Y, 'mse');
    }
    function draw() {
      const C = Plot.colors(), ctx = cv.ctx;
      cv.clear(C.paper);
      Plot.axes(ctx, sx, sy, { font: 26 });
      if (o.showTarget !== false) Plot.fn(ctx, sx, sy, o.f, { color: C.muted, width: 3, dash: [10, 10] });
      ctx.save();
      X.forEach((x, i) => Plot.dot(ctx, sx(x[0]), sy(Y[i]), 6, C.paper, C.muted));
      ctx.restore();
      Plot.fn(ctx, sx, sy, x => S.net.predict([x]), { color: C.ink, width: 5 });
      if (R.loss) { R.epoch.set(S.epoch); R.loss.set(S.loss.toFixed(4)); }
    }
    const R = {};
    const side = UI.row(root, 'fit1d-controls');
    let playBtn = null;
    if (o.controls.includes('play')) playBtn = UI.button(side, 'Train', () => { S.playing = !S.playing; sync(); }, { kind: 'primary' });
    if (o.controls.includes('reset')) UI.button(side, 'Reset', () => { makeNet(); draw(); });
    if (o.controls.includes('width')) UI.choice(side, [2, 4, 8, 32].map(v => ({ value: v, label: v + ' neurons' })), o.hidden[0], v => { o.hidden = [v]; makeNet(); draw(); });
    if (o.readouts !== false) { R.epoch = UI.readout(side, 'epoch'); R.loss = UI.readout(side, 'mse'); }
    function sync() { if (playBtn) playBtn.textContent = S.playing ? 'Pause' : 'Train'; }
    makeNet(); sync(); draw();
    api.loop(() => {
      if (S.playing && S.epoch < (o.maxEpochs || 20000)) {
        for (let i = 0; i < o.steps; i++) { S.loss = S.net.lossAndGrad(X, Y, 'mse'); S.optim.step(S.net.params(), S.net.grads()); S.epoch++; }
        draw();
      }
      return true;
    });
    api.onTheme(draw);
    return { S, draw, reset() { makeNet(); draw(); }, play() { S.playing = true; sync(); }, pause() { S.playing = false; sync(); } };
  };

  /* ------------------------------------------------------------------
     netSVG: an SVG string of a fully connected network.
     opts: sizes [2,8,8,1], w, h, r (neuron radius), labels (array of arrays of
     strings per layer, optional), layerNames (strings under each layer),
     weights (function(l, i, j) -> number, sets thickness/colour), cls,
     edge ('var(--rule)'), node fill per layer (fills array).
  ------------------------------------------------------------------ */
  Wg.netSVG = function (o) {
    o = Object.assign({ sizes: [2, 4, 1], w: 700, h: 420, r: 26, edge: 'var(--muted)', edgeWidth: 2.5 }, o || {});
    const L = o.sizes.length, padX = o.r + 6, padY = o.r + 6;
    const bottom = o.layerNames ? 56 : 0;
    const xs = o.sizes.map((_, l) => padX + (o.w - 2 * padX) * l / (L - 1));
    const ys = o.sizes.map(n => Array.from({ length: n }, (_, i) => n === 1 ? (o.h - bottom) / 2 : padY + (o.h - bottom - 2 * padY) * i / (n - 1)));
    let s = `<svg class="net ${o.cls || ''}" viewBox="0 0 ${o.w} ${o.h}" width="${o.w}" height="${o.h}" role="img" aria-label="network ${o.sizes.join('-')}">`;
    for (let l = 0; l < L - 1; l++) for (let i = 0; i < o.sizes[l]; i++) for (let j = 0; j < o.sizes[l + 1]; j++) {
      let stroke = o.edge, width = o.edgeWidth, op = 0.55;
      if (o.weights) {
        const v = o.weights(l, i, j);
        stroke = v >= 0 ? 'var(--c1)' : 'var(--c0)';
        width = 1 + 6 * Math.min(1, Math.abs(v));
        op = 0.85;
      }
      s += `<line x1="${xs[l]}" y1="${ys[l][i]}" x2="${xs[l + 1]}" y2="${ys[l + 1][j]}" stroke="${stroke}" stroke-width="${width}" stroke-opacity="${op}" data-l="${l}" data-i="${i}" data-j="${j}"/>`;
    }
    o.sizes.forEach((n, l) => {
      for (let i = 0; i < n; i++) {
        const fill = o.fills ? o.fills[l] : 'var(--paper)';
        s += `<circle cx="${xs[l]}" cy="${ys[l][i]}" r="${o.r}" fill="${fill}" stroke="var(--ink)" stroke-width="3.5" data-node="${l}-${i}"/>`;
        const lab = o.labels && o.labels[l] && o.labels[l][i];
        if (lab) s += `<text x="${xs[l]}" y="${ys[l][i]}" text-anchor="middle" dominant-baseline="central" font-family="var(--font-math)" font-style="italic" font-size="${o.r * 1.05}" fill="var(--ink)">${lab}</text>`;
      }
      if (o.layerNames && o.layerNames[l]) s += `<text x="${xs[l]}" y="${o.h - 14}" text-anchor="middle" font-family="var(--font-mono)" font-size="28" fill="var(--muted)">${o.layerNames[l]}</text>`;
    });
    return s + '</svg>';
  };

  /* ------------------------------------------------------------------
     loopSVG: the training loop as one picture.
     data → model → loss (forward, ink); loss → gradients → update → model
     (backward, magenta). opts: w, h, notes (show the detail labels), dim
  ------------------------------------------------------------------ */
  Wg.loopSVG = function (o) {
    o = Object.assign({ w: 1500, h: 620, notes: false }, o || {});
    const W = o.w, H = o.h;
    const bw = 300, bh = 120;
    const top = o.notes ? 110 : 70, bot = H - bh - (o.notes ? 100 : 40);
    const X = [40, (W - bw) / 2, W - bw - 40];
    const node = (x, y, label, sub, color, step) =>
      `<g ${step ? `data-step="${step}"` : ''}><rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="10" fill="var(--paper)" stroke="${color}" stroke-width="5"/>` +
      `<text x="${x + bw / 2}" y="${y + bh / 2 + 2}" text-anchor="middle" dominant-baseline="central" font-family="var(--font-display)" font-weight="800" font-size="46" fill="${color}">${label}</text>` +
      (o.notes && sub ? `<text x="${x + bw / 2}" y="${y < H / 2 ? y - 26 : y + bh + 46}" text-anchor="middle" font-family="var(--font-mono)" font-size="28" fill="var(--muted)">${sub}</text>` : '') + '</g>';
    const arrow = (x1, y1, x2, y2, color, step) => {
      const a = Math.atan2(y2 - y1, x2 - x1), h = 22;
      const dash = color === 'var(--grad)' ? ' stroke-dasharray="16 12"' : '';
      return `<g ${step ? `data-step="${step}"` : ''}><line x1="${x1}" y1="${y1}" x2="${x2 - Math.cos(a) * h * 0.7}" y2="${y2 - Math.sin(a) * h * 0.7}" stroke="${color}" stroke-width="6" stroke-linecap="round"${dash}/>` +
        `<polygon points="${x2},${y2} ${x2 - h * Math.cos(a - 0.45)},${y2 - h * Math.sin(a - 0.45)} ${x2 - h * Math.cos(a + 0.45)},${y2 - h * Math.sin(a + 0.45)}" fill="${color}"/></g>`;
    };
    const ink = 'var(--ink)', g = 'var(--grad)';
    const midY = top + bh / 2, botY = bot + bh / 2;
    const st = o.steps ? (k => k) : (() => 0);
    let s = `<svg class="loop" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="training loop: data, model, loss, gradients, update">`;
    s += node(X[0], top, 'data', 'scaled · batches · train/val', ink, st(1));
    s += arrow(X[0] + bw + 8, midY, X[1] - 8, midY, ink, st(2));
    s += node(X[1], top, 'model', 'Linear + activation, stacked', ink, st(2));
    s += arrow(X[1] + bw + 8, midY, X[2] - 8, midY, ink, st(3));
    s += node(X[2], top, 'loss', 'MSE · BCE · cross-entropy', ink, st(3));
    s += arrow(X[2] + bw / 2, top + bh + 10, X[2] + bw / 2, bot - 10, g, st(4));
    s += node(X[2], bot, 'gradients', 'loss.backward()', g, st(4));
    s += arrow(X[2] - 8, botY, X[1] + bw + 8, botY, g, st(5));
    s += node(X[1], bot, 'update', 'optimizer.step() · Adam 1e-3', g, st(5));
    s += arrow(X[1] + bw / 2, bot - 10, X[1] + bw / 2, top + bh + 10, g, st(6));
    s += `<text x="${X[0] + bw / 2}" y="${botY}" text-anchor="middle" dominant-baseline="central" font-family="var(--font-mono)" font-size="30" fill="var(--muted)" ${o.steps ? 'data-step="6"' : ''}>repeat ×1000</text>`;
    return s + '</svg>';
  };

  /* ------------------------------------------------------------------
     timer: a big countdown. Widgets.timer(api, parent, minutes) -> {start, reset}
     Starts when the slide is entered if opts.auto, else on click.
  ------------------------------------------------------------------ */
  Wg.timer = function (api, parent, minutes, opt) {
    opt = opt || {};
    const box = document.createElement('div');
    box.className = 'timer';
    const face = document.createElement('div');
    face.className = 'timer-face';
    box.appendChild(face);
    const ctl = UI.row(box);
    let left = minutes * 60, running = false, last = 0;
    const show = () => { const m = Math.floor(left / 60), s = Math.floor(left % 60); face.textContent = m + ':' + String(s).padStart(2, '0'); box.classList.toggle('is-done', left <= 0); };
    const btn = UI.button(ctl, 'Start', () => { running = !running; btn.textContent = running ? 'Pause' : 'Start'; }, { kind: 'primary' });
    UI.button(ctl, 'Reset', () => { left = minutes * 60; running = false; btn.textContent = 'Start'; show(); });
    parent.appendChild(box);
    show();
    api.loop((dt) => {
      if (running && left > 0) { left = Math.max(0, left - dt); show(); }
      return true;
    });
    if (opt.auto) api.onEnter(() => { if (!running && left === minutes * 60) { running = true; btn.textContent = 'Pause'; } });
    return { start() { running = true; btn.textContent = 'Pause'; }, reset() { left = minutes * 60; show(); } };
  };

  /* ------------------------------------------------------------------
     Basketball half court in shot-log units: tenths of feet, hoop at (0,0),
     x in [-250, 250], y from the baseline (-47.5) to half court (422.5).
  ------------------------------------------------------------------ */
  Wg.COURT = { x0: -250, x1: 250, y0: -47.5, y1: 422.5 };
  // a frame that maps court units onto a w x h box at (left, top); hoop at the bottom
  Wg.courtFrame = function (left, top, w) {
    const C = Wg.COURT, h = w * (C.y1 - C.y0) / (C.x1 - C.x0);
    return { sx: Plot.scale(C.x0, C.x1, left, left + w), sy: Plot.scale(C.y0, C.y1, top + h, top), x0: left, y0: top, x1: left + w, y1: top + h, w, h };
  };
  Wg.drawCourt = function (ctx, fr, opt) {
    opt = opt || {};
    const col = opt.color || Plot.colors().ink;
    const { sx, sy } = fr;
    const k = Math.abs(sx(1) - sx(0));
    ctx.save();
    ctx.strokeStyle = col; ctx.lineWidth = opt.width || 3; ctx.lineCap = 'round';
    const seg = (x0, y0, x1, y1) => { ctx.beginPath(); ctx.moveTo(sx(x0), sy(y0)); ctx.lineTo(sx(x1), sy(y1)); ctx.stroke(); };
    const arc = (cx, cy, r, a0, a1, dash) => {
      ctx.beginPath(); ctx.setLineDash(dash || []);
      // canvas angles run clockwise with y down; court y is flipped
      ctx.arc(sx(cx), sy(cy), r * k, -a1, -a0);
      ctx.stroke(); ctx.setLineDash([]);
    };
    ctx.strokeRect(sx(-250), sy(422.5), 500 * k, 470 * k);                // boundary
    ctx.strokeRect(sx(-80), sy(142.5), 160 * k, 190 * k);                 // paint
    arc(0, 142.5, 60, 0, Math.PI);                                        // free-throw circle, top
    arc(0, 142.5, 60, Math.PI, 2 * Math.PI, [12, 12]);                    // and its dashed half
    arc(0, 0, 40, 0, Math.PI);                                            // restricted area
    seg(-30, -7.5, 30, -7.5);                                             // backboard
    ctx.beginPath(); ctx.arc(sx(0), sy(0), 7.5 * k, 0, 2 * Math.PI); ctx.stroke(); // rim
    const a = Math.acos(220 / 237.5);
    seg(-220, -47.5, -220, 237.5 * Math.sin(a)); seg(220, -47.5, 220, 237.5 * Math.sin(a)); // corner threes
    arc(0, 0, 237.5, a, Math.PI - a);                                     // three-point arc
    arc(0, 422.5, 60, Math.PI, 2 * Math.PI);                              // centre circle
    ctx.restore();
  };

  /* ------------------------------------------------------------------
     courtNet: a legal 2-8-8-1 MLP learns P(made | x, y) from Kobe's shots.
     opts: w (court width px), hidden, act, lr, steps, normalize, controls
           ('play','reset','act','norm'), dots, autoplay
  ------------------------------------------------------------------ */
  Wg.courtNet = function (api, parent, o) {
    o = Object.assign({ w: 820, hidden: [8, 8], act: 'tanh', lr: 0.01, steps: 2, normalize: true, controls: ['play', 'reset'], dots: true, n: 3000, autoplay: false, opt: 'adam', batch: 256 }, o || {});
    const D = window.KOBE;
    const X = D.X.slice(0, o.n), Y = D.Y.slice(0, o.n);
    const mean = [0, 0], std = [0, 0];
    for (const p of X) { mean[0] += p[0] / X.length; mean[1] += p[1] / X.length; }
    for (const p of X) { std[0] += (p[0] - mean[0]) ** 2 / X.length; std[1] += (p[1] - mean[1]) ** 2 / X.length; }
    std[0] = Math.sqrt(std[0]); std[1] = Math.sqrt(std[1]);
    const prep = p => o.normalize ? [(p[0] - mean[0]) / std[0], (p[1] - mean[1]) / std[1]] : [p[0], p[1]];
    let Xin = X.map(prep);
    const root = document.createElement('div');
    root.className = 'courtnet';
    parent.appendChild(root);
    const fr = Wg.courtFrame(0, 0, o.w);
    const cv = Plot.canvas(root, o.w, Math.ceil(fr.h));
    const side = document.createElement('div');
    side.className = 'courtnet-side';
    root.appendChild(side);
    const rng = NN.rng(5);
    const S = { net: null, optim: null, epoch: 0, playing: !!o.autoplay, loss: 0, acc: 0 };
    const base = 1 - Y.reduce((a, b) => a + b, 0) / Y.length;
    function makeNet() {
      S.net = new NN.MLP([2].concat(o.hidden, [1]), { act: o.act, seed: 3 });
      S.optim = NN.optimizer(o.opt, { lr: o.lr });
      S.epoch = 0;
      S.loss = S.net.lossAndGrad(Xin, Y, 'bce');
      S.acc = S.net.accuracy(Xin, Y);
    }
    function train(k) {
      for (let t = 0; t < k; t++) {
        // one epoch of mini-batches
        const idx = NN.data.shuffle(Xin.length, rng);
        let tot = 0, nb = 0;
        for (let b = 0; b < idx.length; b += o.batch) {
          tot += S.net.lossAndGrad(Xin, Y, 'bce', idx.slice(b, b + o.batch)); nb++;
          S.optim.step(S.net.params(), S.net.grads());
        }
        S.loss = tot / nb; S.epoch++;
      }
      S.acc = S.net.accuracy(Xin, Y);
    }
    function draw() {
      const C = Plot.colors(), ctx = cv.ctx;
      cv.clear(C.paper);
      Plot.heat(ctx, (x, y) => NN.sigmoid(S.net.predict(prep([x, y]))), fr, { res: 70, mid: 0.45, span: 0.3, strength: 0.6 });
      if (o.dots) {
        ctx.save();
        ctx.lineWidth = 1.5;
        for (let i = 0; i < Math.min(X.length, o.showDots || 800); i++) {
          ctx.beginPath(); ctx.arc(fr.sx(X[i][0]), fr.sy(X[i][1]), 5, 0, 2 * Math.PI);
          ctx.fillStyle = Y[i] ? C.c1 : C.c0; ctx.fill();
          ctx.strokeStyle = C.paper; ctx.stroke();
        }
        ctx.restore();
      }
      Wg.drawCourt(ctx, fr, { color: C.ink, width: 3 });
      if (R.acc) {
        R.epoch.set(S.epoch);
        R.loss.set(S.loss.toFixed(3));
        R.acc.set((100 * S.acc).toFixed(1) + '%');
      }
    }
    const R = {};
    const rr = UI.row(side, 'pg-readouts');
    R.epoch = UI.readout(rr, 'epoch');
    R.loss = UI.readout(rr, 'loss');
    R.acc = UI.readout(rr, 'accuracy');
    const bl = UI.readout(rr, 'always "miss"');
    bl.set((100 * base).toFixed(1) + '%');
    const ctl = UI.row(side, 'pg-controls');
    let playBtn = null;
    if (o.controls.includes('play')) playBtn = UI.button(ctl, 'Train', () => { S.playing = !S.playing; sync(); }, { kind: 'primary' });
    if (o.controls.includes('reset')) UI.button(ctl, 'Reset', () => { makeNet(); draw(); });
    if (o.controls.includes('norm')) UI.choice(ctl, [{ value: true, label: 'scaled inputs' }, { value: false, label: 'raw inputs' }], o.normalize, v => { o.normalize = v; Xin = X.map(prep); makeNet(); draw(); });
    if (o.controls.includes('act')) UI.choice(ctl, ['relu', 'tanh', 'sigmoid'].map(v => ({ value: v, label: NN.act[v].name })), o.act, v => { o.act = v; makeNet(); draw(); });
    if (o.controls.includes('opt')) UI.choice(ctl, [{ value: 'sgd', label: 'SGD' }, { value: 'adam', label: 'Adam' }], o.opt, v => { o.opt = v; o.lr = v === 'sgd' ? (o.sgdLr || 0.05) : (o.adamLr || 0.01); makeNet(); draw(); });
    if (o.controls.includes('dots')) UI.choice(ctl, [{ value: true, label: 'shots on' }, { value: false, label: 'shots off' }], o.dots, v => { o.dots = v; draw(); });
    function sync() { if (playBtn) playBtn.textContent = S.playing ? 'Pause' : 'Train'; }
    makeNet(); sync(); draw();
    let acc = 0;
    api.loop(dt => {
      if (S.playing && S.epoch < (o.maxEpochs || 300)) {
        acc += dt;
        if (acc > 0.05) { acc = 0; train(1); draw(); }
      }
      return true;
    });
    api.onTheme(draw);
    return { S, draw, train(k) { train(k); draw(); }, reset() { makeNet(); draw(); }, play() { S.playing = true; sync(); }, pause() { S.playing = false; sync(); } };
  };
})();
