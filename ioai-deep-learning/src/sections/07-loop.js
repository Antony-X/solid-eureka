Deck.section({ id: 'loop', title: 'The training loop, live', minutes: 28 });

Deck.css(`
.sec-loop .lp-two { display: grid; grid-template-columns: 860px 820px; gap: 48px; flex: 1; min-height: 0; align-items: start; }
.sec-loop .lp-left { gap: 40px; }
.sec-loop .lp-read { gap: 56px; }
.sec-loop .lp-t6 { display: grid; grid-template-columns: 1056px 576px; gap: 96px; flex: 1; min-height: 0; align-items: start; }
.sec-loop pre.lp-c30 { font-size: 30px; padding: 24px 30px; }
.sec-loop .lp-eff { display: flex; flex-direction: column; gap: 36px; }
.sec-loop .stack.lp-eff { display: grid; }
.sec-loop .stack.lp-eff > div { display: flex; flex-direction: column; gap: 20px; }
.sec-loop .lp-eff .lbl { font-family: var(--font-mono); font-size: 28px; color: var(--muted); letter-spacing: .06em; }
.sec-loop .lp-num { font-family: var(--font-mono); font-size: 48px; font-weight: 600; line-height: 1.1; font-variant-numeric: tabular-nums; }
.sec-loop .lp-num small { font-size: 30px; color: var(--muted); font-weight: 500; }
.sec-loop .lp-cells { display: flex; flex-direction: column; gap: 30px; margin-top: 16px; }
.sec-loop .lp-cell { display: grid; grid-template-columns: 96px 980px 1fr; align-items: center; gap: 24px; }
.sec-loop .lp-cell .n { font-family: var(--font-mono); font-size: 30px; color: var(--muted); }
.sec-loop .lp-cell code { font-family: var(--font-mono); font-size: 40px; background: var(--code-bg); border-left: 6px solid var(--ink); padding: 16px 28px; white-space: pre; }
.sec-loop .lp-cell .what { font-size: 36px; color: var(--muted); }
.sec-loop .lp-cell.bug code { border-left-color: var(--bad); }
.sec-loop .lp-ranges { display: grid; grid-template-columns: auto auto; gap: 14px 40px; align-items: baseline; font-size: 40px; }
.sec-loop .lp-ranges .k { font-family: var(--font-mono); font-size: 34px; }
.sec-loop .lp-ranges .v { font-family: var(--font-mono); font-size: 40px; font-weight: 600; }
.sec-loop .lp-opts { display: grid; grid-template-columns: repeat(3, 1fr); gap: 48px; }
.sec-loop .lp-opt { position: relative; border: 3px solid var(--ink); padding: 22px 28px; font-size: 44px; line-height: 1.15; min-height: 72px; display: flex; gap: 22px; align-items: center; }
.sec-loop .lp-opt .n { font-family: var(--font-mono); font-size: 48px; font-weight: 600; }
.sec-loop .lp-opt .ok-frame { position: absolute; inset: -9px; border: 6px solid var(--ok); pointer-events: none; }
.sec-loop .lp-opt .ok-tag { position: absolute; right: 20px; top: 50%; transform: translateY(-50%); font-family: var(--font-mono); font-size: 52px; font-weight: 700; color: var(--ok); }
.sec-loop .lp-opt .dim { position: absolute; inset: -3px; background: color-mix(in srgb, var(--paper) 68%, transparent); pointer-events: none; }
.sec-loop .lp-bars { display: flex; flex-direction: column; gap: 64px; margin-top: 24px; }
.sec-loop .lp-bar-row { display: grid; grid-template-columns: 540px 240px 1fr; gap: 32px; align-items: center; }
.sec-loop .lp-bar-row .name { font-size: 48px; line-height: 1.1; }
.sec-loop .lp-bar-row .ll { font-family: var(--font-mono); font-size: 64px; font-weight: 600; }
.sec-loop .lp-track { position: relative; height: 104px; border-left: 3px solid var(--muted); }
.sec-loop .lp-track i { position: absolute; left: 0; top: 0; bottom: 0; background: var(--ink); }
.sec-loop .lp-track b { position: absolute; top: 50%; transform: translateY(-50%); font-family: var(--font-mono); font-size: 56px; font-weight: 600; padding-left: 20px; }
.sec-loop .lp-bar-row.base .lp-track i { background: var(--muted); }
.sec-loop .lp-bar-head { display: grid; grid-template-columns: 540px 240px 1fr; gap: 32px; font-family: var(--font-mono); font-size: 28px; color: var(--muted); letter-spacing: .08em; text-transform: uppercase; }
.sec-loop .lp-scale { display: flex; justify-content: space-between; }
.sec-loop .lp-err { font-family: var(--font-mono); font-size: 30px; line-height: 1.45; background: var(--code-bg); border-left: 6px solid var(--bad); padding: 22px 28px; white-space: pre-wrap; }
.sec-loop .lp-err .e { color: var(--bad); font-weight: 700; }
.sec-loop .lp-verdict { display: flex; gap: 28px; align-items: baseline; font-size: 40px; }
.sec-loop .lp-verdict .big-n { font-family: var(--font-mono); font-size: 88px; font-weight: 700; line-height: 1; }
.sec-loop .lp-sig-grid { display: grid; grid-template-columns: 640px 1fr; gap: 72px; flex: 1; min-height: 0; align-items: start; }
.sec-loop .lp-seen { display: flex; flex-direction: column; gap: 30px; }
.sec-loop .lp-seen .ui-readout-value { font-size: 64px; }
`);

/* ---------- 1. the five beats, with one real step on a 2-8-8-1 net ---------- */
{
  const LR = 0.5;         // plain SGD on one batch; big enough to see, small enough that the loss falls
  const BATCH = 64;
  const W = 820, H = 740;
  const xs = [80, 320, 560, 740];
  const sizes = [2, 8, 8, 1];
  const ys = sizes.map(n => Array.from({ length: n }, (_, i) => n === 1 ? 331 : n === 2 ? 271 + 120 * i : 100 + 66 * i));

  Deck.slide({
    id: 'loop-beats',
    title: 'The five beats of one training step',
    html: `
    <h2>Every training step is the same five lines</h2>
    <div class="lp-two">
      <div class="col lp-left">
        ${Code.py(`
          opt.zero_grad()            # 1 clear
          logits = model(x)          # 2 forward
          loss = loss_fn(logits, y)  # 3 how wrong?
          loss.backward()            # 4 gradients
          opt.step()                 # 5 nudge weights`, { hl: '1:1 2:2 3:3 4:4 5:5', cls: 'lp-beats-code lp-c30' })}
        <div class="ui-row lp-read"></div>
        <div class="ui-row lp-ctl"></div>
      </div>
      <div class="lp-net"></div>
    </div>`,
    init(el, api) {
      const host = el.querySelector('.lp-net');
      const pre = el.querySelector('pre.lp-beats-code');
      const D = KOBE;
      // scale the shots with their own mean and std (the model sees scaled inputs)
      const n = D.X.length, mu = [0, 0], sd = [0, 0];
      D.X.forEach(p => { mu[0] += p[0] / n; mu[1] += p[1] / n; });
      D.X.forEach(p => { sd[0] += (p[0] - mu[0]) ** 2 / n; sd[1] += (p[1] - mu[1]) ** 2 / n; });
      sd[0] = Math.sqrt(sd[0]); sd[1] = Math.sqrt(sd[1]);
      const Xs = D.X.map(p => [(p[0] - mu[0]) / sd[0], (p[1] - mu[1]) / sd[1]]);
      const order = NN.data.shuffle(n, NN.rng(11));
      const net = new NN.MLP(sizes, { act: 'relu', seed: 3 });
      let batchNo = 0, S = null;

      const copy = arr => arr.map(a => Float64Array.from(a));
      function compute() {
        const idx = order.slice((batchNo * BATCH) % n, (batchNo * BATCH) % n + BATCH);
        const W0 = copy(net.W), b0 = copy(net.b);
        // mean activation of every unit over the batch (for the forward picture)
        const act = sizes.map(k => new Float64Array(k));
        idx.forEach(i => { net.forward(Xs[i]); for (let l = 1; l < sizes.length; l++) for (let j = 0; j < sizes[l]; j++) act[l][j] += net.a[l][j] / idx.length; });
        const loss0 = net.lossAndGrad(Xs, D.Y, 'bce', idx);
        const G = copy(net.gW), Gb = copy(net.gb);
        const W1 = W0.map((w, l) => w.map((v, i) => v - LR * G[l][i]));
        const b1 = b0.map((b, l) => b.map((v, i) => v - LR * Gb[l][i]));
        net.W = W1.map(a => Float64Array.from(a)); net.b = b1.map(a => Float64Array.from(a));
        const loss1 = net.lossAndGrad(Xs, D.Y, 'bce', idx);
        net.W = copy(W0); net.b = copy(b0);
        let gmax = 0; G.forEach(g => g.forEach(v => { gmax = Math.max(gmax, Math.abs(v)); }));
        S = { idx, W0, b0, W1, b1, G, gmax, act, loss0, loss1 };
      }

      const wWidth = v => 2 + 12 * Math.min(1, Math.abs(v) / 1.2);
      function svg(k) {
        const Wt = k >= 5 ? S.W1 : S.W0;
        let s = `<svg class="dg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="2-8-8-1 network during one training step">`;
        // lanes: forward on top, backward at the bottom, never on the same line
        s += `<g style="opacity:${k === 2 || k === 3 ? 1 : 0.15}"><text class="lbl" x="0" y="36" style="text-anchor:start">forward</text><line class="flow" x1="160" y1="36" x2="800" y2="36"/></g>`;
        s += `<g style="opacity:${k === 4 ? 1 : 0.15}"><text class="lbl-g" x="0" y="706" style="text-anchor:start;font:600 30px var(--font-mono)">backward</text><line class="back" x1="800" y1="706" x2="180" y2="706"/></g>`;
        // edges (weights: orange +, blue -, thickness = size; gradients: magenta dashed)
        for (let l = 0; l < 3; l++) for (let j = 0; j < sizes[l + 1]; j++) for (let i = 0; i < sizes[l]; i++) {
          const x1 = xs[l], y1 = ys[l][i], x2 = xs[l + 1], y2 = ys[l + 1][j];
          const w = Wt[l][j * sizes[l] + i];
          if (k === 4) {
            const g = Math.abs(S.G[l][j * sizes[l] + i]) / (S.gmax || 1);
            s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" style="stroke:var(--rule);stroke-width:2"/>`;
            if (g > 0.002) s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" style="stroke:var(--grad);stroke-width:${(3 + 9 * Math.sqrt(g)).toFixed(1)};stroke-dasharray:12 8;stroke-linecap:butt"/>`;
          } else {
            s += `<line class="w ${w >= 0 ? 'pos' : 'neg'}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" style="stroke-width:${wWidth(w).toFixed(1)}"/>`;
          }
        }
        // output -> loss (straight down)
        s += `<line class="flow" x1="${xs[3]}" y1="368" x2="${xs[3]}" y2="452" style="stroke-width:4;opacity:${k >= 3 ? 1 : 0.3}"/>`;
        // nodes; in the forward beat, fill = how strongly each hidden unit fires on this batch
        let amax = 0; for (let l = 1; l < 3; l++) S.act[l].forEach(v => { amax = Math.max(amax, v); });
        sizes.forEach((m, l) => ys[l].forEach((y, i) => {
          const r = l === 0 ? 28 : l === 3 ? 34 : 26;
          const cls = l === 0 ? 'nrn in' : l === 3 ? 'nrn out' : 'nrn';
          s += `<circle class="${cls}" cx="${xs[l]}" cy="${y}" r="${r}"/>`;
          if (k >= 2 && l > 0 && l < 3) {
            const a = Math.min(1, S.act[l][i] / (amax || 1));
            if (a > 0.01) s += `<circle cx="${xs[l]}" cy="${y}" r="${r - 5}" style="fill:var(--ink);opacity:${(0.12 + 0.8 * a).toFixed(2)}"/>`;
          }
        }));
        s += `<text class="lbl-s" x="${xs[0]}" y="${ys[0][0] - 52}">loc_x</text><text class="lbl-s" x="${xs[0]}" y="${ys[0][1] + 52}">loc_y</text>`;
        s += `<text class="lbl-m" x="${xs[3]}" y="${ys[3][0] + 2}">z</text>`;
        // loss box under the output
        s += `<rect class="box" x="672" y="460" width="136" height="112" style="stroke-width:${k === 3 || k === 5 ? 5 : 3}"/>`;
        s += `<text class="lbl-s" x="740" y="490">loss</text>`;
        s += `<text class="lbl" x="740" y="538" style="font-size:34px">${k >= 5 ? S.loss1.toFixed(2) : k >= 3 ? S.loss0.toFixed(2) : '?'}</text>`;
        const say = { 1: ['every .grad = 0', 'g'], 4: ['a gradient for all 105', 'g'], 5: ['weights moved, loss fell', 'i'] }[k];
        if (say) s += `<text class="${say[1] === 'g' ? 'lbl-g' : 'lbl'}" x="320" y="644" style="font:600 32px var(--font-mono)">${say[0]}</text>`;
        return s + '</svg>';
      }

      const rr = el.querySelector('.lp-read');
      const R = { batch: UI.readout(rr, 'batch of 64'), before: UI.readout(rr, 'loss'), after: UI.readout(rr, 'after the step') };
      let shown = 0;
      function render(k) {
        shown = k;
        host.innerHTML = svg(k);
        R.batch.set('#' + (batchNo + 1));
        R.before.set(k >= 3 ? S.loss0.toFixed(3) : '–');
        R.after.set(k >= 5 ? S.loss1.toFixed(3) : '–');
      }
      // optional: replay all five beats on the next batch
      let anim = -1, t = 0;
      const lines = Array.from(pre.querySelectorAll('.ln'));
      const hl = k => { pre.classList.toggle('has-hl', k > 0); lines.forEach((ln, j) => ln.classList.toggle('hl', j + 1 === k)); };
      UI.button(el.querySelector('.lp-ctl'), 'Next batch: run 5 beats', () => {
        net.W = copy(S.W1); net.b = copy(S.b1);
        batchNo++; compute(); anim = 1; t = 0; hl(1); render(1);
      }, { kind: 'primary' });
      UI.button(el.querySelector('.lp-ctl'), 'Reset', () => {
        const fresh = new NN.MLP(sizes, { act: 'relu', seed: 3 });
        net.W = fresh.W; net.b = fresh.b; batchNo = 0; anim = -1; compute(); render(api.step); hl(api.step);
      });
      api.loop(dt => {
        if (anim > 0) {
          t += dt;
          if (t > 0.9) { t = 0; anim++; if (anim > 5) anim = -1; else { hl(anim); render(anim); } }
        }
        return true;
      });
      compute();
      render(0);
      api.onStep(k => { anim = -1; render(k); });
    },
    notes: `
    <p class="time">4 min</p>
    <p class="say">Everything we did so far, the model, the loss, the gradients, the optimizer, is used in five lines of code. They run once for every batch of shots, thousands of times. Say them with me: clear, forward, loss, backward, step.</p>
    <p class="do">Press → five times. Each press highlights one line and shows on the right what that line does to the real 2-8-8-1 Kobe network (64 real shots, scaled):</p>
    <ul>
      <li><b>1 zero_grad</b>: every stored gradient is set back to zero (nothing visible changes in the network).</li>
      <li><b>2 forward</b>: the batch flows left to right; dark hidden neurons are the ones that fire a lot on these 64 shots; blank ones are off (ReLU gave 0).</li>
      <li><b>3 loss</b>: one number for the whole batch, about 0.7 for a fresh network (a coin flip is 0.69).</li>
      <li><b>4 backward</b>: magenta dashed lines are gradients, thicker means "this weight is more to blame". Every one of the 105 weights gets one, in one call.</li>
      <li><b>5 step</b>: the weights change a little and the loss on the same batch goes down (0.695 → 0.664). Point at the "after the step" readout.</li>
    </ul>
    <p class="do">Optional: "Next batch: run 5 beats" plays the same five beats on the next 64 shots, with the code lines lighting up in turn. Press it two or three times while saying the beats aloud. "Reset" goes back to the fresh network.</p>
    <p class="ask">Which line actually changes the weights?</p>
    <p class="ans">Only opt.step(). backward() only computes gradients and stores them in each weight's .grad; it does not move anything. zero_grad() only clears .grad.</p>
    <p>Honesty note: this picture uses plain SGD with learning rate 0.5 on one batch, so the biggest weight moves by about 0.1 and you can just see the change; the batch loss goes from 0.695 to 0.664. In real training with Adam (lr 0.001) each weight moves about 0.001 per step, invisible after one step; that is why we need about 9,000 steps.</p>
    <p>Orange lines are positive weights, blue negative, thickness is size. Magenta always means gradients / learning.</p>`,
  });
}

/* ---------- 2. live coding map ---------- */
Deck.slide({
  id: 'loop-live',
  title: 'Live coding: the notebook',
  html: `
  <div class="row"><span class="tag tag-code">live coding</span><span class="kicker">notebooks/01_live_coding.ipynb</span></div>
  <h2>Now we build it, cell by cell</h2>
  <div class="lp-cells">
    <div class="lp-cell"><span class="n">[1]</span><code>df = pd.read_csv("data_train.csv")</code><span class="what">25,000 shots</span></div>
    <div class="lp-cell"><span class="n">[2]</span><code>X_tr = (X_tr - mu) / sd</code><span class="what">scale</span></div>
    <div class="lp-cell"><span class="n">[3]</span><code>model = MLP()</code><span class="what">105 weights</span></div>
    <div class="lp-cell"><span class="n">[4]</span><code>for epoch in range(30): ...</code><span class="what">train</span></div>
    <div class="lp-cell"><span class="n">[5]</span><code>model.eval()</code><span class="what">measure</span></div>
    <div class="lp-cell bug"><span class="n">[6]</span><code># break it on purpose, 4 times</code><span class="what">bugs</span></div>
  </div>`,
  notes: `
  <p class="time">3 min (1 for the slide, 2 for cell 1 in the notebook)</p>
  <p class="say">Now I write the whole thing in front of you. I will type, not paste, and before every run you predict what will happen. I will also make four mistakes on purpose; these are the mistakes that cost points in competitions.</p>
  <p class="do">Switch to notebooks/01_live_coding.ipynb. The imports and the data loading are already written; run cell 1 and print X.shape (25000, 2), y.shape (25000, 1) and y.mean() = 0.447 (44.7% made). Make the font big (Ctrl/Cmd +) and use a light theme.</p>
  <ul>
    <li>Type, don't paste. Say each line aloud as you type it, then point at the output and say it again.</li>
    <li>Before each run, ask for a prediction (hands up, or a number on paper).</li>
    <li>Keep the finished notebook open on a second device; if the live code breaks, switch to it. Every result is also on the next slides.</li>
  </ul>
  <p class="ask">Before running cell 1: what fraction of Kobe's shots went in? (Remember the opening.)</p>
  <p class="ans">About 45% (44.7% in the task file). So "always miss" is right about 55% of the time; that is the floor every model must beat.</p>`,
});

/* ---------- 3. planned mistake 1: raw inputs ---------- */
Deck.slide({
  id: 'loop-raw',
  title: 'Planned mistake 1: raw coordinates',
  steps: 3,
  html: `
  <div class="row"><span class="tag tag-predict">predict</span><span class="tag tag-warn">planned mistake 1</span></div>
  <h2>First loss on raw coordinates?</h2>
  <div class="split" style="align-items:start;flex:none">
    <div class="col">
      <div class="lbl kicker">raw inputs, tenths of feet</div>
      <div class="lp-ranges">
        <span class="k">loc_x</span><span class="v">−250 … 248</span>
        <span class="k">loc_y</span><span class="v">−44 … 791</span>
      </div>
    </div>
    <div data-step="2">${Code.py(`
      mu = X_tr.mean(0)   # from TRAIN only
      sd = X_tr.std(0)
      X_tr = (X_tr - mu) / sd
      X_va = (X_va - mu) / sd   # same mu, sd`, { cls: 'lp-c30' })}</div>
  </div>
  <div class="lp-meter grow"></div>`,
  init(el, api) {
    const host = el.querySelector('.lp-meter');
    const w = 1728, h = 330;
    const ax = 190;
    const sx = Plot.scale(0, 4, 40, w - 60);
    const ticks = [0, 1, 2, 3, 4].map(v => `<line x1="${sx(v)}" y1="${ax}" x2="${sx(v)}" y2="${ax + 18}" style="stroke:var(--muted);stroke-width:2.5"/><text class="lbl" x="${sx(v)}" y="${ax + 44}" style="fill:var(--muted)">${v}</text>`).join('');
    host.innerHTML = `
      <svg class="dg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="loss at the first step: 0.69 expected, 2.36 with raw inputs">
        <text class="lbl-s" x="1000" y="24" style="text-anchor:start">loss printed at the very first step</text>
        <line x1="${sx(0)}" y1="${ax}" x2="${sx(4)}" y2="${ax}" style="stroke:var(--muted);stroke-width:3"/>
        ${ticks}
        <line x1="${sx(0.69)}" y1="${ax - 76}" x2="${sx(0.69)}" y2="${ax}" style="stroke:var(--muted);stroke-width:3;stroke-dasharray:12 10"/>
        <text class="lbl" x="${sx(0.69)}" y="${ax - 100}" style="fill:var(--muted)">coin flip 0.69</text>
        <g data-step="1">
          <circle cx="${sx(2.36)}" cy="${ax}" r="18" style="fill:var(--bad)"/>
          <text class="lbl" x="${sx(2.36)}" y="${ax - 56}" style="fill:var(--bad);font-size:48px">✗ raw: 2.36</text>
        </g>
        <g data-step="3">
          <circle cx="${sx(0.69)}" cy="${ax}" r="18" style="fill:var(--ok)"/>
          <text class="lbl" x="${sx(0.69)}" y="${ax + 104}" style="fill:var(--ok);font-size:48px">✓ scaled: 0.69</text>
        </g>
      </svg>`;
  },
  notes: `
  <p class="time">3 min</p>
  <p class="say">Planned mistake number one. I feed the coordinates straight from the file into the network. They are in tenths of feet: x goes from −250 to 248 and y up to 791. The network was built expecting numbers around −2 to 2.</p>
  <p class="ask">A fresh network knows nothing, so it should say about 50/50 for every shot. What loss should the very first step print? And what do you think it prints with these raw numbers?</p>
  <p class="ans">It should print about 0.69 (the loss of a coin flip, ln 2; with Kobe's 45% it is 0.687). With raw inputs it prints about 2.3 (2.36 in our run with seed 0; other seeds gave 2.1 and 3.8). The very first sanity check fails.</p>
  <p class="do">In the notebook, run the first training step on raw inputs and read the loss aloud. Then press → to show the fix (step 2): subtract the mean, divide by the standard deviation. Run again: 0.69 (step 3).</p>
  <p class="say">Why it goes wrong: each first-layer neuron multiplies x by a weight of size about 0.5. With x around 100, the neuron's value is around 50 instead of around 0.5, so the network starts out extremely confident, and confident-and-wrong is expensive.</p>
  <p><b>Common mistake:</b> computing the mean and std on the validation (or test) data, or on everything. Always use the training statistics and apply the same numbers to validation, test and the grader's data.</p>
  <p>Story (30 s): this advice is in LeCun, Bottou, Orr and Müller's "Efficient BackProp" from 1998: "Convergence is usually faster if the average of each input variable over the training set is close to zero." 28 years later it is still bug number one. Our numbers (task file, 80/20 split): mean (6.5, 91.7), std (110, 88).</p>`,
});

/* ---------- 4. live demo: SGD needs scaled inputs ---------- */
Deck.slide({
  id: 'loop-court',
  title: 'Live demo: scale your inputs',
  html: `
  <div class="row"><span class="tag tag-try">try it live</span></div>
  <h2>Plain SGD learns nothing from raw inputs</h2>
  <div class="lp-court grow"></div>`,
  init(el, api) {
    Widgets.courtNet(api, el.querySelector('.lp-court'), {
      w: 720, hidden: [8, 8], act: 'relu', opt: 'sgd', lr: 0.1, sgdLr: 0.1, adamLr: 0.01,
      normalize: false, controls: ['play', 'reset', 'norm', 'opt'], n: 3000, maxEpochs: 120, showDots: 700,
    });
  },
  notes: `
  <p class="time">2.5 min</p>
  <p class="say">This is the same 2-8-8-1 network training live in the browser on 3,000 of Kobe's real shots. The colour on the court is the predicted chance of a make: orange means "likely in", blue means "likely miss". The optimizer is plain SGD with learning rate 0.1, and the inputs are raw coordinates.</p>
  <p class="ask">Predict: after 100 epochs, will it beat "always miss" (54.6% on these shots)?</p>
  <p class="do">1) Press Train with "raw inputs" and "SGD" selected (the default). Watch for about 6 seconds: the accuracy sits at 54.6%, exactly "always miss", and the court goes uniformly blue. It predicts "miss" everywhere.</p>
  <p class="do">2) Click "scaled inputs" (this resets the net), press Train: within a few seconds the accuracy climbs to about 60% and an orange spot appears around the rim, which is exactly where Kobe made more than half his shots.</p>
  <p class="do">3) Click "Adam", then try both raw and scaled: both reach about 60%. Adam hides the problem.</p>
  <p class="ans">With raw inputs and SGD the huge numbers make the first steps enormous, the ReLU neurons die (output 0 for every shot) and the network collapses to a constant: always miss. Scaled, the same optimizer works. Adam rescales every step by itself, so it survives raw inputs here, but scaling is free and makes every default (learning rate, initialisation) behave as designed.</p>
  <p>Note: the loss readout at epoch 0 shows about 14.5 for raw inputs (this browser network starts with larger weights than PyTorch's default, which gives 2.3); either way it is far above 0.69. If a run looks stuck, press Reset and Train again. In our PyTorch runs the same thing happens: SGD + momentum lr 0.1 on raw inputs collapsed to "always miss" on all 3 seeds; scaled reached 60.3%.</p>`,
});

/* ---------- 5. setup code ---------- */
Deck.slide({
  id: 'loop-setup',
  title: 'The script, part 1: setup',
  html: `
  <h2>Before the loop: data, model, loss, optimizer</h2>
  <div class="lp-t6">
    ${Code.py(`
      X = torch.tensor(df[["loc_x", "loc_y"]].values,
                       dtype=torch.float32)
      y = torch.tensor(df["shot_made_flag"].values,
                       dtype=torch.float32).unsqueeze(1)
      idx = torch.randperm(len(X))       # shuffle
      tr, va = idx[:20000], idx[20000:]  # 80/20
      mu, sd = X[tr].mean(0), X[tr].std(0)
      X = (X - mu) / sd                  # train stats
      X_tr, y_tr, X_va, y_va = X[tr], y[tr], X[va], y[va]
      model = MLP()                      # 2-8-8-1
      loss_fn = nn.BCEWithLogitsLoss()
      opt = torch.optim.Adam(model.parameters(), lr=1e-3)`, { hl: '1:1-4 2:5-6,9 3:7-8 4:10 5:11-12', cls: 'lp-c30' })}
    <div class="stack lp-eff">
      <div data-only="0 1"><div class="lbl">shapes</div><div class="lp-num">X (25000, 2)</div><div class="lp-num">y (25000, 1)</div></div>
      <div data-only="2"><div class="lbl">split</div><div class="lp-num">20,000 <small>train</small></div><div class="lp-num">5,000 <small>validation</small></div></div>
      <div data-only="3"><div class="lbl">train mean / std</div><div class="lp-num">x 6.5 / 110</div><div class="lp-num">y 91.7 / 88</div></div>
      <div data-only="4"><div class="lbl">model from part 2</div>${Widgets.netSVG({ sizes: [2, 8, 8, 1], w: 520, h: 420, r: 18 })}<div class="lp-num">105 <small>weights</small></div></div>
      <div data-only="5"><div class="lbl">loss takes logits</div><div class="lp-num">no sigmoid</div><div class="lbl" style="margin-top:24px">optimizer</div><div class="lp-num">Adam, lr 0.001</div></div>
    </div>
  </div>`,
  notes: `
  <p class="time">1.5 min (then type it in the notebook)</p>
  <p class="say">This is everything that happens before the loop: turn the table into tensors, split 80/20, scale with the training statistics, build the model, choose the loss and the optimizer. Twelve lines.</p>
  <p class="do">Press → five times; each press highlights a group of lines and the right side shows the result: the shapes, the split sizes, the mean and std, the 105-weight model, the loss and optimizer. Then type the same cells in the notebook.</p>
  <ul>
    <li><b>unsqueeze(1)</b> turns y from shape (25000,) into (25000, 1), the same shape as the model's output. We will break this on purpose later.</li>
    <li>MLP is the class from the "From one neuron to an MLP" part: fc1 = Linear(2, 8), fc2 = Linear(8, 8), fc3 = Linear(8, 1), ReLU in between, and <b>no sigmoid at the end</b>. In the notebook it is cell 3.</li>
    <li><b>BCEWithLogitsLoss</b> applies the sigmoid itself, in a numerically safe way. That is why the model outputs raw scores (logits).</li>
  </ul>
  <p class="ask">How many numbers will Adam be adjusting?</p>
  <p class="ans">105: 24 in fc1 (2·8 + 8), 72 in fc2 (8·8 + 8), 9 in fc3 (8 + 1). Check it in code: sum(p.numel() for p in model.parameters()).</p>`,
});

/* ---------- 6. the loop code ---------- */
Deck.slide({
  id: 'loop-code',
  title: 'The script, part 2: the loop',
  html: `
  <h2>The loop: epochs, batches, five beats</h2>
  <div class="lp-t6">
    ${Code.py(`
      for epoch in range(30):
          perm = torch.randperm(len(X_tr))
          for i in range(0, len(X_tr), 64):
              idx = perm[i:i + 64]
              opt.zero_grad()
              logits = model(X_tr[idx])
              loss = loss_fn(logits, y_tr[idx])
              loss.backward()
              opt.step()
          print(epoch, loss.item())`, { hl: '1:1 2:2-4 3:5-9 4:10' })}
    <div class="lp-eff">
      <div data-step="1"><div class="lbl">epoch = every shot once</div><div class="lp-num">30 <small>epochs</small></div></div>
      <div data-step="2"><div class="lbl">20,000 shots ÷ 64</div><div class="lp-num">313 <small>batches per epoch</small></div></div>
      <div data-step="3"><div class="lbl">one batch = one step</div><div class="lp-num">9,390 <small>steps</small></div></div>
      <div data-step="4"><div class="lbl">printed at the end</div><div class="lp-num">≈ 0.66 <small>loss</small></div></div>
    </div>
  </div>`,
  notes: `
  <p class="time">3 min (including typing it in the notebook)</p>
  <p class="say">Two loops. The outer loop runs over epochs: one epoch means the network has seen every training shot once. The inner loop cuts the shuffled shots into batches of 64; every batch gets the five beats we just saw.</p>
  <p class="do">Press → four times: the outer loop; the shuffle and the batches; the five beats; the print. Then type it in the notebook, saying the five beats aloud again, and run it (about 10 seconds on a laptop).</p>
  <ul>
    <li>20,000 / 64 = 312.5, so 313 batches per epoch; the last one has only 32 shots. 30 epochs × 313 = 9,390 updates. (The optimizer section used the Kaggle file with 20,558 training shots, which gives 322 steps per epoch; same idea.)</li>
    <li>randperm reshuffles every epoch so the batches are different each time.</li>
    <li>The printed loss is the loss of the last batch only, so it jumps around (0.62 to 0.72 is normal). Do not read too much into one value.</li>
  </ul>
  <p class="ask">If I double the batch size to 128 and keep 30 epochs, what happens to the number of steps?</p>
  <p class="ans">It halves (157 per epoch, 4,710 in total). Fewer, less noisy steps; with a fixed number of epochs this often trains less. Count steps, not only epochs.</p>`,
});

/* ---------- 7. results ---------- */
{
  const lo = 50, hi = 65;
  const pct = v => (100 * (v - lo) / (hi - lo)).toFixed(1) + '%';
  const row = (name, ll, acc, step, cls) => `
    <div class="lp-bar-row ${cls || ''}" data-step="${step}">
      <div class="name">${name}</div><div class="ll">${ll}</div>
      <div class="lp-track"><i style="width:${pct(acc)}"></i><b style="left:${pct(acc)}">${acc}%</b></div>
    </div>`;
  Deck.slide({
    id: 'loop-results',
    title: 'Kobe results: baselines vs MLP',
    html: `
    <div class="row"><span class="tag tag-predict">predict</span></div>
    <h2>Will 105 weights beat 0.687?</h2>
    <div class="lp-bars">
      <div class="lp-bar-head"><span>model</span><span>val loss</span><span class="lp-scale"><span>accuracy 50%</span><span>65%</span></span></div>
      ${row('always “miss”', '0.687', 55, 1, 'base')}
      ${row('logistic regression', '0.675', 58, 2)}
      ${row('<b>2-8-8-1 MLP</b>', '<mark>0.662</mark>', 61, 3)}
    </div>
    <p class="lead muted bottom" data-step="4">Small gap, real gain: basketball is noisy.</p>`,
    notes: `
    <p class="time">2 min</p>
    <p class="ask">Before the reveal: the constant guess (45% for every shot) has validation loss 0.687. Will our network beat it? By a lot or a little? Write a number.</p>
    <p class="do">Press → three times to reveal the three rows from top to bottom, then once more for the takeaway.</p>
    <p class="ans">Yes, but by a little: 0.662 against 0.687, and 61% accuracy against 55%. Logistic regression sits in between (0.675, 58%) because it can only draw a straight boundary, and Kobe's good zone is a small disc around the rim.</p>
    <p class="say">Is 61% bad? No. Even at the rim Kobe only scored about 63% of the time, so no model that sees only the position can be right much more than 61% of the time. The labels are coin flips with a probability that depends on position. In the task you are fighting for about 5 points between 55% and 61%.</p>
    <p>Numbers: mean of 3 seeds on the Kaggle labelled shots, 80/20 split, Adam lr 0.001, batch 64, 30 epochs. Our check of the slide code on the task file (seed 0): constant 0.686, logistic 0.673 (58.6%), MLP 0.6625 (60.6%). Your live numbers will differ in the third digit; the order will not.</p>`,
  });
}

/* ---------- 8. planned mistake 2: no zero_grad ---------- */
Deck.slide({
  id: 'loop-zerograd',
  title: 'Planned mistake 2: no zero_grad',
  html: `
  <div class="row"><span class="tag tag-predict">predict</span><span class="tag tag-warn">planned mistake 2</span></div>
  <h2>I delete <code class="ic">opt.zero_grad()</code>. Then?</h2>
  <div class="lp-opts">
    <div class="lp-opt"><span class="n">1</span>crash<i class="dim" data-step="1"></i></div>
    <div class="lp-opt"><span class="n">2</span>same result<i class="dim" data-step="1"></i></div>
    <div class="lp-opt"><span class="n">3</span>trains, but worse<i class="ok-frame" data-step="1"></i><span class="ok-tag" data-step="1">✓</span></div>
  </div>
  <div class="split" style="align-items:end">
    <div data-step="2">
      <svg class="dg" viewBox="0 0 760 380" width="760" height="380" role="img" aria-label="w.grad grows 2, 4, 6 when backward is called three times">
        <text class="lbl" x="0" y="24" style="text-anchor:start">(2 * w).backward()  three times</text>
        ${[2, 4, 6].map((v, i) => `
          <rect x="${120 + i * 210}" y="${330 - v * 40}" width="130" height="${v * 40}" style="fill:var(--grad-soft);stroke:var(--grad);stroke-width:4"/>
          <text class="lbl-g" x="${185 + i * 210}" y="${306 - v * 40}" style="font:700 40px var(--font-mono)">${v}</text>
          <text class="lbl-s" x="${185 + i * 210}" y="360">call ${i + 1}</text>`).join('')}
        <text class="lbl-s" x="40" y="190">w.grad</text>
      </svg>
    </div>
    <div data-step="3" class="col">
      <div class="lbl kicker">Kobe, validation accuracy</div>
      <div class="lp-verdict"><span class="big-n bad">53%</span><span>✗ without zero_grad</span></div>
      <div class="lp-verdict"><span class="big-n muted">55%</span><span>always “miss”</span></div>
    </div>
  </div>`,
  notes: `
  <p class="time">2 min</p>
  <p class="ask">I delete the line opt.zero_grad() and train again. Vote with fingers: 1 it crashes, 2 nothing changes, 3 it trains, but worse.</p>
  <p class="do">Count the votes, then press → to reveal answer 3. In the notebook: comment out opt.zero_grad(), run, read the result.</p>
  <p class="ans">3. No error at all. PyTorch adds every new gradient to the one already stored in .grad. Without clearing, each step uses the sum of all gradients since the start, a stale and ever-growing direction.</p>
  <p class="do">Press → for the tiny demo: w is a single number, the gradient of 2w is 2, but calling backward() three times stores 2, then 4, then 6. Press → again for the Kobe result.</p>
  <p class="say">On Kobe, the network without zero_grad reaches only 53% accuracy (log loss 0.686): worse than always saying "miss". No error message, just a silently bad model.</p>
  <p>Why PyTorch adds up gradients on purpose: sometimes you want the gradient of a big batch that does not fit in memory, so you call backward() on several small batches and step once. The cost is that you must clear by hand.</p>
  <p>Numbers: mean of 3 seeds (Adam, Kaggle data). Our run of the slide code on the task file with seed 0 was even worse: 44% accuracy, it predicted "made" for every shot. Adam limits the damage because it rescales steps; with plain SGD the summed gradient keeps growing. This is Karpathy's famous mistake #3: "you forgot to .zero_grad() (in pytorch) before .backward()".</p>`,
});

/* ---------- 9. the cliffhanger reveal: sigmoid + BCEWithLogitsLoss ---------- */
{
  // validation outputs (5,000 shots, 20 bins on [0, 1]) from our run of the slide code on the task file
  const HIST_OK = [12, 7, 5, 6, 11, 137, 565, 956, 1258, 516, 310, 321, 896, 0, 0, 0, 0, 0, 0, 0];
  const HIST_BUG = [3882, 29, 27, 24, 20, 16, 12, 12, 18, 16, 16, 928, 0, 0, 0, 0, 0, 0, 0, 0];
  const hist = (H, title, note) => {
    const w = 480, h = 420, x0 = 30, y0 = 360, bw = (w - 2 * x0) / 20, k = 290 / 3882;
    let s = `<svg class="dg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${title}">`;
    s += `<text class="lbl" x="${x0}" y="22" style="text-anchor:start">${title}</text>`;
    H.forEach((c, i) => { if (c) s += `<rect x="${x0 + i * bw + 1}" y="${y0 - Math.max(3, c * k)}" width="${bw - 2}" height="${Math.max(3, c * k)}" style="fill:var(--ink)"/>`; });
    s += `<line x1="${x0}" y1="${y0}" x2="${w - x0}" y2="${y0}" style="stroke:var(--muted);stroke-width:2.5"/>`;
    s += [0, 0.5, 1].map(v => `<text class="lbl-s" x="${x0 + v * (w - 2 * x0)}" y="${y0 + 30}">${v}</text>`).join('');
    if (note) s += note;
    return s + '</svg>';
  };
  Deck.slide({
    id: 'loop-sigmoid',
    title: 'Cliffhanger reveal: two sigmoids',
    html: `
    <div class="row"><span class="tag tag-warn">planned mistake 3</span><span class="kicker">the vote from before the break</span></div>
    <h2>Two sigmoids: normal loss, broken model</h2>
    <div class="lp-sig-grid">
      <div class="col" style="gap:36px">
        ${Code.py(`
          return torch.sigmoid(self.fc3(h))
          loss_fn = nn.BCEWithLogitsLoss()`, { cls: 'lp-c30' })}
        <div class="lp-seen">
          <div data-step="1" class="ui-readout"><span class="ui-readout-label">printed loss</span><span class="ui-readout-value">0.68 <span class="small muted">looks normal</span></span></div>
          <div data-step="2" class="ui-readout"><span class="ui-readout-label">accuracy</span><span class="ui-readout-value">61% <span class="small muted">looks normal</span></span></div>
        </div>
      </div>
      <div class="col" style="gap:28px">
        <div data-step="3" class="row" style="gap:40px;align-items:start">
          <div>${hist(HIST_OK, 'correct model')}</div>
          <div>${hist(HIST_BUG, 'two sigmoids', `<text class="lbl" x="80" y="86" style="text-anchor:start;fill:var(--bad)">← 76% say “&lt; 1%”</text>`)}</div>
        </div>
        <div class="lbl-s tiny" data-step="3" style="margin-top:-12px">predicted chance of a make, 5,000 validation shots</div>
        <div data-step="4" class="lp-verdict"><span class="big-n bad">4.69</span><span>✗ true log loss <span class="muted">(correct: 0.662)</span></span></div>
      </div>
    </div>`,
    notes: `
    <p class="time">3 min</p>
    <p class="say">Before the break you voted: a sigmoid as the last layer of the model, and BCEWithLogitsLoss as the loss. Crash, normal, quietly worse, or NaN? Let's run it.</p>
    <p class="do">In the notebook change the last line of forward to return torch.sigmoid(self.fc3(h)) and train. Then press → for each reveal:</p>
    <ul>
      <li>Step 1: the printed loss ends around 0.68. Looks like a normal run.</li>
      <li>Step 2: accuracy (output above 0.5 = "made") is 61%, the same as the correct model.</li>
      <li>Step 3: the histograms of the predicted chances. The correct model says between 0 and 0.62 for every shot. The buggy one says "less than 1%" for 76% of all shots, including mid-range jumpers that go in 40% of the time.</li>
      <li>Step 4: score those outputs as probabilities (log loss, which is what Kaggle and many olympiad tasks use): 4.69, against 0.662 for the correct model and 0.687 for a constant guess.</li>
    </ul>
    <p class="ans">"Quietly worse": no crash, no NaN, normal-looking loss and accuracy, but the probabilities are garbage. A bug can leave accuracy unchanged and still destroy the competition metric.</p>
    <p class="say">Why: the loss applies its own sigmoid to whatever the model outputs. The model's output is already squeezed between 0 and 1, so the loss only ever sees chances between 50% and 73%. To push a "miss" as low as it can go, the network must push its own output all the way down to 0. So it learns extreme outputs.</p>
    <p>The maths, if a student asks: the loss sees σ(σ(z)), and σ(s) for s in (0, 1) lies in (0.5, 0.731). So each made shot costs at least −ln 0.731 = 0.313 and each miss at least −ln 0.5 = 0.693: the printed loss is trapped and can never look very good or very bad. The two fixes: remove the sigmoid from the model (preferred; BCEWithLogitsLoss is numerically safer), or keep it and use nn.BCELoss.</p>
    <p>Kobe task note: a final nn.Sigmoid in the submitted model is allowed (the official baseline has one). If you train with it, use nn.BCELoss; or train without it using BCEWithLogitsLoss and add the sigmoid only in the submitted class. Also: with this bug, "logits > 0" accuracy reads 44% (everything "made"), because the outputs are never negative.</p>
    <p>Numbers: 4.69 and 61% are the mean of 3 seeds; our run of the slide code on the task file (seed 0): printed val loss 0.6845, accuracy 61.7%, true log loss 4.60, 76.4% of outputs below 0.01. Karpathy's mistake #4 is the multi-class cousin: "you passed softmaxed outputs to a loss that expects raw logits".</p>`,
  });
}

/* ---------- 10. planned mistake 4: target shape ---------- */
{
  const cell = 116;
  const grid = () => {
    const x0 = 196, y0 = 90;
    let s = `<svg class="dg" viewBox="0 0 576 530" width="576" height="530" role="img" aria-label="predictions (3,1) minus targets (3,) broadcast to a 3 by 3 grid">`;
    s += `<text class="lbl-s" x="${x0 + 1.5 * cell}" y="30">target  (3,)</text>`;
    s += `<text class="lbl-s" x="64" y="${y0 + 1.5 * cell - 18}">pred</text><text class="lbl-s" x="64" y="${y0 + 1.5 * cell + 18}">(3, 1)</text>`;
    [1, 2, 3].forEach((t, j) => { s += `<text class="lbl" x="${x0 + j * cell + cell / 2}" y="70">${t}</text>`; });
    [1, 2, 3].forEach((p, i) => {
      s += `<text class="lbl" x="${x0 - 26}" y="${y0 + i * cell + cell / 2}">${p}</text>`;
      [1, 2, 3].forEach((t, j) => {
        const d = (p - t) ** 2, diag = i === j;
        s += `<rect x="${x0 + j * cell}" y="${y0 + i * cell}" width="${cell}" height="${cell}" style="fill:${diag ? 'var(--paper)' : 'var(--code-bg)'};stroke:var(--ink);stroke-width:3"/>`;
        s += `<text class="lbl" x="${x0 + j * cell + cell / 2}" y="${y0 + i * cell + cell / 2}" style="font-size:40px;fill:${diag ? 'var(--ink)' : 'var(--bad)'}">${d}</text>`;
      });
    });
    s += `<text class="lbl" x="${x0 + 1.5 * cell}" y="${y0 + 3 * cell + 44}" style="fill:var(--bad);font-size:34px">average of 9 = 1.33</text>`;
    return s + '</svg>';
  };
  Deck.slide({
    id: 'loop-shape',
    title: 'Planned mistake 4: the target shape',
    html: `
    <div class="row"><span class="tag tag-warn">planned mistake 4</span></div>
    <h2>Targets must be (N, 1), not (N,)</h2>
    <div class="split" style="align-items:start;grid-template-columns:1080px 1fr;gap:72px">
      <div class="col" style="gap:40px">
        <div data-step="1"><div class="kicker">BCEWithLogitsLoss: loud</div>
          <div class="lp-err"><span class="e">ValueError:</span> Target size (torch.Size([64])) must be the same as input size (torch.Size([64, 1]))</div></div>
        <div data-step="2"><div class="kicker">MSELoss: silent (only a warning)</div>
          <div class="lp-err">perfect predictions [1, 2, 3] → loss <span class="e">1.33</span>, not 0</div></div>
        <div data-step="3">${Code.py(`y = y.unsqueeze(1)    # (N,) -> (N, 1)`, { cls: 'lp-c30' })}</div>
      </div>
      <div data-step="2">${grid()}</div>
    </div>`,
    notes: `
    <p class="time">2 min</p>
    <p class="say">Last planned mistake. I remove the unsqueeze(1), so y has shape (N,) while the model outputs shape (N, 1).</p>
    <p class="do">In the notebook remove .unsqueeze(1) and run. Press → to show the error. Read it aloud, slowly: "Target size 64 must be the same as input size 64 by 1."</p>
    <p class="say">This one is the friendly bug: it crashes, it tells you exactly what is wrong. Read error messages from the last line up; the last line says what, the lines above say where.</p>
    <p class="do">Press → again. Now the same mistake with MSELoss, the loss for numbers (and the loss of the inversion task).</p>
    <p class="ask">Three predictions 1, 2, 3 and targets 1, 2, 3: perfect. What is the MSE?</p>
    <p class="ans">It should be 0, but PyTorch prints 1.33. A column (3, 1) minus a row (3,) is "broadcast" to a 3×3 table: every prediction is compared with every target. Only the diagonal is what you meant; the average of all 9 squares is 12/9 = 1.33. PyTorch only prints a UserWarning ("Using a target size … that is different to the input size … This will likely lead to incorrect results due to broadcasting"), easy to miss. With 20,000 shots the table would have 400 million entries.</p>
    <p class="do">Press → for the fix: y.unsqueeze(1) (or y.view(-1, 1)). Habit: print logits.shape and y.shape once before training.</p>
    <p>Verified in PyTorch 2.15: the ValueError text above is exact, and MSELoss on (3,1) vs (3,) perfect predictions returns 1.3333 with the warning.</p>`,
  });
}

/* ---------- 11. evaluate correctly ---------- */
{
  const sig = (() => {
    const w = 520, h = 330, x0 = 40, x1 = 500, y0 = 270, y1 = 30;
    const sx = z => x0 + (z + 6) / 12 * (x1 - x0), sy = p => y0 - p * (y0 - y1);
    let d = '';
    for (let i = 0; i <= 60; i++) { const z = -6 + i / 5; d += (i ? 'L' : 'M') + sx(z).toFixed(1) + ',' + sy(1 / (1 + Math.exp(-z))).toFixed(1); }
    return `<svg class="dg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="sigmoid: logit 0 is 50%">
      <line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y0}" style="stroke:var(--muted);stroke-width:2.5"/>
      <line x1="${sx(0)}" y1="${y0}" x2="${sx(0)}" y2="${y1}" style="stroke:var(--muted);stroke-width:2.5"/>
      <line x1="${x0}" y1="${sy(0.5)}" x2="${x1}" y2="${sy(0.5)}" style="stroke:var(--muted);stroke-width:3;stroke-dasharray:12 10"/>
      <path d="${d}" style="fill:none;stroke:var(--ink);stroke-width:5"/>
      <circle cx="${sx(0)}" cy="${sy(0.5)}" r="10" style="fill:var(--ink)"/>
      <text class="lbl-s" x="${sx(0) - 64}" y="${sy(0.5) - 28}">50%</text>
      <text class="lbl-s" x="${sx(0)}" y="${y0 + 32}">logit 0</text>
      <text class="lbl" x="${sx(3)}" y="${sy(0.5) + 56}">made</text>
      <text class="lbl" x="${sx(-4)}" y="${sy(0.5) - 96}">miss</text>
    </svg>`;
  })();
  Deck.slide({
    id: 'loop-eval',
    title: 'Evaluate correctly',
    html: `
    <h2>Measure on validation, without gradients</h2>
    <div class="lp-t6">
      ${Code.py(`
        model.eval()
        with torch.no_grad():
            logits = model(X_va)
            val_loss = loss_fn(logits, y_va).item()
            pred = (logits > 0).float()
            acc = (pred == y_va).float().mean().item()
            print(val_loss, acc, pred.mean().item())`, { hl: '1:1 2:2-3 3:5 4:7' })}
      <div class="stack lp-eff">
        <div data-only="1"><div class="lbl">evaluation mode</div><div class="lp-num">dropout off</div><div class="lp-num"><small>(a habit: our net has none)</small></div></div>
        <div data-only="2"><div class="lbl">no graph, no .grad</div><div class="lp-num">faster, less memory</div></div>
        <div data-only="3"><div class="lbl">logit &gt; 0 means &gt; 50%</div>${sig}</div>
        <div data-only="4"><div class="lbl">printed</div><div class="lp-num">0.662 <small>val loss</small></div><div class="lp-num">61% <small>accuracy</small></div><div class="lp-num">≈ 0.3 <small>predicted “made”</small></div></div>
      </div>
    </div>`,
    notes: `
    <p class="time">1.5 min</p>
    <p class="say">The last cell: measure the model on the validation shots it never trained on. Three habits: switch to evaluation mode, turn off gradient tracking, and turn logits into decisions correctly.</p>
    <p class="do">Press → four times, one line group at a time, then run the cell in the notebook.</p>
    <ul>
      <li><b>model.eval()</b> switches layers like dropout and batch-norm to their test behaviour. Our Linear + ReLU net has neither, so here it changes nothing, but forgetting it is Karpathy's mistake #2, so build the habit. Call model.train() before training again.</li>
      <li><b>torch.no_grad()</b>: we only measure, so PyTorch does not need to remember the computation for backward. Faster and less memory.</li>
      <li><b>logits &gt; 0</b>: a logit of 0 is exactly 50%, positive means "more likely made". No sigmoid needed to decide.</li>
      <li>Print three numbers: loss, accuracy, and the fraction predicted "made". If that fraction is 0 or 1, the model is a constant: always check it.</li>
    </ul>
    <p class="ask">Our model predicts "made" for about 30% of shots, but Kobe made 45%. Is that a bug?</p>
    <p class="ans">No. "Made" is predicted only where the chance is above 50%, which is basically within 3 feet of the rim. Everywhere else the best single guess is "miss", even though 40% of those shots go in.</p>
    <p>Numbers from our run of this exact code on the task file (seed 0): val loss 0.6625, accuracy 60.6%, fraction "made" 0.305. Longer or faster training (Adam lr 1e-2) brings the fraction down to about 0.22.</p>`,
  });
}
