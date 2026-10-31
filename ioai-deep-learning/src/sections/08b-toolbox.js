Deck.section({ id: 'tool', title: 'Training toolbox', minutes: 12 });

Deck.css(`
.sec-tool pre.recipe { font-size: 26px; line-height: 1.38; padding: 18px 24px; }
.sec-tool .tb-two { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; flex: 1; min-height: 0; }
.sec-tool .tb-cap { font-size: 34px; color: var(--muted); }
.sec-tool .tb-mode { display: flex; gap: 16px; align-items: center; }
.sec-tool svg.dg .nrn.off { fill: var(--paper); stroke: var(--bad); stroke-dasharray: 6 6; opacity: .5; }
.sec-tool svg.dg .w.off { opacity: .08; }
.sec-tool #tdrop-net { width: 100%; }
.sec-tool #tdrop-net svg { width: 100%; height: auto; }
.sec-tool .sched-grid { display: grid; grid-template-columns: minmax(0,1fr) 640px; gap: 40px; align-items: start; flex: 1; min-height: 0; }
`);

/* ---------- dropout ---------- */
Deck.slide({
  id: 'tool-dropout',
  title: 'Dropout',
  html: `
  <h2>Dropout: switch off random neurons while training</h2>
  <div class="tb-two">
    <div class="col">
      <div id="tdrop-net"></div>
      <div class="tb-mode" id="tdrop-ctl"></div>
    </div>
    <div class="col">
      ${Code.py(`
        self.drop = nn.Dropout(p=0.2)   # turn off 20%

        def forward(self, x):
            x = torch.relu(self.fc1(x))
            x = self.drop(x)
            return self.fc2(x)

        model.train()   # dropout ON
        model.eval()    # dropout OFF for predictions
      `, { hl: '1:1 2:5 3:8-9' })}
      <p class="tb-cap" data-step="3">Forget <b>model.eval()</b> → noisy, worse predictions.</p>
    </div>
  </div>`,
  init(el, api) {
    const host = el.querySelector('#tdrop-net');
    const sizes = [2, 6, 6, 1], W = 760, H = 440;
    const xs = sizes.map((_, l) => 60 + (W - 120) * l / (sizes.length - 1));
    const ys = sizes.map(n => Array.from({ length: n }, (_, i) => n === 1 ? H / 2 : 40 + (H - 80) * i / (n - 1)));
    let s = `<svg class="dg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="network with dropout">`;
    for (let l = 0; l < sizes.length - 1; l++) for (let i = 0; i < sizes[l]; i++) for (let j = 0; j < sizes[l + 1]; j++)
      s += `<line class="w" data-a="${l}-${i}" data-b="${l + 1}-${j}" x1="${xs[l]}" y1="${ys[l][i]}" x2="${xs[l + 1]}" y2="${ys[l + 1][j]}"/>`;
    sizes.forEach((n, l) => { for (let i = 0; i < n; i++) s += `<circle class="nrn ${l === 0 ? 'in' : l === sizes.length - 1 ? 'out' : ''}" data-n="${l}-${i}" cx="${xs[l]}" cy="${ys[l][i]}" r="24"/>`; });
    host.innerHTML = s + '</svg>';
    let training = true, t = 0;
    const rng = NN.rng(4);
    const shuffle = () => {
      const off = new Set();
      [1, 2].forEach(l => { for (let i = 0; i < sizes[l]; i++) if (training && rng() < 0.4) off.add(l + '-' + i); });
      host.querySelectorAll('[data-n]').forEach(c => c.classList.toggle('off', off.has(c.dataset.n)));
      host.querySelectorAll('line').forEach(w => w.classList.toggle('off', off.has(w.dataset.a) || off.has(w.dataset.b)));
    };
    const ctl = el.querySelector('#tdrop-ctl');
    UI.choice(ctl, [{ value: true, label: 'model.train()' }, { value: false, label: 'model.eval()' }], true, v => { training = v; shuffle(); });
    shuffle();
    api.loop(dt => { t += dt; if (t > 0.9) { t = 0; if (training) shuffle(); } return true; });
  },
  notes: `
  <p class="time">2 min</p>
  <p class="say">Dropout is the bank-teller idea: during training, every step switches off a random 20% of the neurons. No neuron can rely on one particular partner, so the network learns several backup ways to get the answer, and it memorises less.</p>
  <p class="do">Let the picture flicker: each flash is one training step with different neurons off. Click <b>model.eval()</b>: all neurons come back for predictions. Then → three times through the code.</p>
  <p class="ask">What happens if you forget model.eval() when you measure validation accuracy?</p>
  <p class="ans">Dropout stays on, so predictions are random and worse, and the score jumps around between runs.</p>
  <p>Practical: p = 0.1–0.5 between hidden layers, never on the output. It only helps when the model is overfitting; on a tiny network (like 2-8-8-1) it usually hurts.</p>`,
});

/* ---------- batch norm ---------- */
Deck.slide({
  id: 'tool-bn',
  title: 'Batch norm',
  html: `
  <h2>Batch norm: re-centre every layer’s numbers</h2>
  <div class="tb-two">
    <div class="col">
      <div id="tbn-plot"></div>
      <div id="tbn-ctl"></div>
    </div>
    <div class="col">
      ${Code.py(`
        self.fc1 = nn.Linear(2, 64)
        self.bn1 = nn.BatchNorm1d(64)

        def forward(self, x):
            x = self.fc1(x)
            x = self.bn1(x)       # mean 0, spread 1
            x = torch.relu(x)
            ...
      `, { hl: '1:2 2:6' })}
      <p class="tb-cap" data-step="3">Faster, steadier training. Needs batches of 2 or more, and <b>model.eval()</b> for predictions.</p>
    </div>
  </div>`,
  init(el, api) {
    const w = 760, h = 440;
    const cv = Plot.canvas(el.querySelector('#tbn-plot'), w, h);
    const sx = Plot.scale(-8, 8, 50, w - 20), sy = Plot.scale(0, 1, h - 60, 90);
    let shift = 4, spread = 2.2;
    const rng = NN.rng(9);
    const base = Array.from({ length: 600 }, () => rng.normal());
    const hist = (vals, color) => {
      const bins = 48, cnt = new Array(bins).fill(0);
      vals.forEach(v => { const b = Math.floor((v + 8) / 16 * bins); if (b >= 0 && b < bins) cnt[b]++; });
      const mx = 90;
      const ctx = cv.ctx;
      ctx.fillStyle = color;
      cnt.forEach((c, b) => {
        const x0 = sx(-8 + 16 * b / bins), x1 = sx(-8 + 16 * (b + 1) / bins);
        ctx.fillRect(x0 + 1, sy(Math.min(1, c / mx)), x1 - x0 - 2, sy(0) - sy(Math.min(1, c / mx)));
      });
    };
    const draw = () => {
      const C = Plot.colors();
      cv.clear(C.paper);
      Plot.axes(cv.ctx, sx, sy, { xt: [-8, -4, 0, 4, 8], yt: [], zero: false, grid: false });
      Plot.text(cv.ctx, 'value of one neuron →', w - 20, h - 4, { color: C.muted, align: 'right', size: 24 });
      const raw = base.map(v => shift + spread * v);
      const m = raw.reduce((a, b) => a + b, 0) / raw.length;
      const sd = Math.sqrt(raw.reduce((a, b) => a + (b - m) ** 2, 0) / raw.length);
      hist(raw, Plot.alpha(C.muted, 0.45));
      hist(raw.map(v => (v - m) / sd), Plot.alpha(C.c0, 0.85));
      Plot.text(cv.ctx, 'before', Math.max(110, Math.min(w - 90, sx(shift))), 62, { color: C.muted, align: 'center', size: 28, weight: 700 });
      Plot.text(cv.ctx, 'after batch norm', sx(0), 24, { color: C.c0, align: 'center', size: 28, weight: 700 });
    };
    const ctl = el.querySelector('#tbn-ctl');
    UI.slider(ctl, { label: 'shift', min: -5, max: 5, step: 0.1, value: shift, fmt: v => v.toFixed(1), oninput: v => { shift = v; draw(); } });
    UI.slider(ctl, { label: 'spread', min: 0.4, max: 3, step: 0.05, value: spread, fmt: v => v.toFixed(2), oninput: v => { spread = v; draw(); } });
    draw();
    api.onTheme(draw);
  },
  notes: `
  <p class="time">2 min</p>
  <p class="say">As weights change, the numbers coming out of a layer drift: bigger, smaller, shifted. The next layer has to keep re-adjusting. Batch norm takes each neuron’s values over the current batch and re-centres them to mean 0 and spread 1 (then lets the network learn its own shift and scale).</p>
  <p class="do">Drag <b>shift</b> and <b>spread</b>: the grey "before" histogram moves around, the blue "after" one stays put. Then → twice through the code.</p>
  <p class="ask">Why does it need at least 2 examples in a batch?</p>
  <p class="ans">With one example there is no "average over the batch" to subtract; PyTorch raises an error in training mode. In eval mode it uses running averages saved during training, so remember model.eval().</p>
  <p>Practical: put it after a Linear (or Conv) layer and before the activation. It lets you use larger learning rates. It is standard in CNNs; for tiny MLPs and tabular data it is optional. Transformers use LayerNorm instead (same idea, per example).</p>`,
});

/* ---------- LR scheduler code ---------- */
Deck.slide({
  id: 'tool-sched',
  title: 'LR schedulers in PyTorch',
  html: `
  <h2>Learning-rate scheduler: two extra lines</h2>
  <div class="sched-grid">
    <div class="col">
    ${Code.py(`
      from torch.optim.lr_scheduler import CosineAnnealingLR
      opt = torch.optim.Adam(model.parameters(), lr=1e-3)
      sched = CosineAnnealingLR(opt, T_max=100)

      for epoch in range(100):
          for xb, yb in loader:
              ...              # the five lines
          sched.step()         # once per epoch
    `, { hl: '1:1,3 2:8', size: 's' })}
      <div data-step="3">
        ${Code.py(`
          # or: halve lr when validation stops improving
          sched = ReduceLROnPlateau(opt, factor=0.5, patience=5)
          sched.step(val_loss)
        `, { size: 's' })}
      </div>
    </div>
    <div id="tsched-plot"></div>
  </div>`,
  init(el, api) {
    const w = 640, h = 300;
    const cv = Plot.canvas(el.querySelector('#tsched-plot'), w, h);
    const sx = Plot.scale(0, 100, 70, w - 20), sy = Plot.scale(0, 1.05, h - 50, 20);
    const draw = () => {
      const C = Plot.colors();
      cv.clear(C.paper);
      Plot.axes(cv.ctx, sx, sy, { xt: [0, 25, 50, 75, 100], yt: [0, 0.5, 1], fmtY: v => v ? v + '×' : '0', xlabel: 'epoch', ylabel: 'lr' });
      Plot.fn(cv.ctx, sx, sy, e => 0.5 * (1 + Math.cos(Math.PI * e / 100)), { color: C.ink, width: 5 });
      Plot.fn(cv.ctx, sx, sy, e => Math.pow(0.5, Math.floor(e / 25)), { color: C.muted, width: 3, dash: [10, 10] });
      Plot.text(cv.ctx, 'cosine', sx(62), sy(0.42), { size: 26, weight: 700 });
      Plot.text(cv.ctx, 'halve when stuck', sx(28), sy(0.62), { size: 24, color: C.muted });
    };
    draw();
    api.onTheme(draw);
  },
  notes: `
  <p class="time">2 min</p>
  <p class="say">Big steps at the start to get near the bottom quickly, small steps at the end to settle into it. A scheduler changes the learning rate for you as training goes on.</p>
  <p class="do">→ 1: create it next to the optimizer. → 2: call <b>sched.step()</b> once per epoch, after the batch loop. → 3: the other common choice, ReduceLROnPlateau, which watches the validation loss.</p>
  <p class="ask">Where does sched.step() go: inside the batch loop or after it?</p>
  <p class="ans">For epoch-based schedulers like CosineAnnealingLR and StepLR: once per epoch, after the batches. (OneCycleLR is the exception: once per batch.) Calling it in the wrong place makes the learning rate drop far too fast.</p>
  <p>Olympiad default: Adam or AdamW plus cosine, or ReduceLROnPlateau when you don't know how many epochs you need. A schedule usually gives a small extra gain, not a miracle.</p>`,
});

/* ---------- full recipe ---------- */
Deck.slide({
  id: 'tool-recipe',
  title: 'The full recipe',
  html: `
  <h2>Everything together</h2>
  ${Code.py(`
    opt = torch.optim.AdamW(model.parameters(), lr=1e-2, weight_decay=0.01)
    sched = torch.optim.lr_scheduler.CosineAnnealingLR(opt, T_max=50)
    best, wait = 1e9, 0
    for epoch in range(50):
        model.train()
        for xb, yb in loader:
            loss = loss_fn(model(xb), yb)
            opt.zero_grad(); loss.backward()
            nn.utils.clip_grad_norm_(model.parameters(), 1.0)
            opt.step()
        sched.step()
        model.eval()
        with torch.no_grad(): val = loss_fn(model(Xv), yv).item()
        if val < best: best, best_w, wait = val, copy.deepcopy(model.state_dict()), 0
        else: wait += 1
        if wait >= 10: break           # early stopping
    model.load_state_dict(best_w)
  `, { size: 's', hl: '1:1 2:9 3:2,11 4:5,12 5:14-17', cls: 'recipe' })}
`,
  notes: `
  <p class="time">3 min</p>
  <p class="say">This is a complete, competition-ready training loop: the five beats plus four safety features. You will not need all of them every time, but you should know where each line goes.</p>
  <p class="do">Press → five times; each step highlights one feature:</p>
  <ol>
    <li><b>AdamW with weight_decay</b>: gently pulls every weight towards 0, so the model stays simpler (less overfitting).</li>
    <li><b>clip_grad_norm_</b>: if one batch produces a huge gradient, it is scaled down, so one bad step can't wreck training. Goes between backward() and step().</li>
    <li><b>Scheduler</b>: created next to the optimizer, stepped once per epoch.</li>
    <li><b>model.train() / model.eval()</b>: switches dropout and batch norm between training and prediction behaviour.</li>
    <li><b>Early stopping</b>: remember the weights with the best validation loss (deepcopy, otherwise the "copy" keeps changing), stop when it hasn't improved for 10 epochs, and load the best weights at the end.</li>
  </ol>
  <p class="ask">Why copy.deepcopy and not just best_w = model.state_dict()?</p>
  <p class="ans">state_dict() returns references to the live weights, which keep changing as training continues. deepcopy freezes a real snapshot.</p>`,
});
