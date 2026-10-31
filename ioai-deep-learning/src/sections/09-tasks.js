Deck.section({ id: 'task', title: 'Olympiad playbook and the two tasks', minutes: 22 });

Deck.css(`
.sec-task .chk { display: grid; grid-template-columns: repeat(3, 1fr); gap: 72px; flex: 1; align-items: start; margin-top: 16px; }
.sec-task .chk-col { display: flex; flex-direction: column; gap: 30px; }
.sec-task .chk-col h3 { font-family: var(--font-mono); font-size: 30px; font-weight: 600; letter-spacing: .12em; text-transform: uppercase; color: var(--muted); border-bottom: 3px solid var(--ink); padding-bottom: 12px; }
.sec-task .chk-item { display: grid; grid-template-columns: 48px 1fr; gap: 6px 24px; align-items: center; }
.sec-task .chk-box { width: 40px; height: 40px; border: 4px solid var(--ink); box-sizing: border-box; grid-row: span 2; align-self: start; margin-top: 4px; }
.sec-task .chk-item b { font-size: 40px; font-weight: 700; line-height: 1.1; }
.sec-task .chk-item code { font-family: var(--font-mono); font-size: 29px; color: var(--muted); }
.sec-task .stat { font-family: var(--font-display); font-weight: 800; font-stretch: 110%; font-size: 112px; line-height: .95; }
.sec-task .stat-l { font-size: 40px; color: var(--muted); margin-top: 6px; }
.sec-task .dotl { display: inline-block; width: 26px; height: 26px; border-radius: 50%; vertical-align: -2px; margin-right: 14px; }
.sec-task .cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 48px; }
.sec-task .card { border-top: 4px solid var(--ink); padding-top: 18px; display: flex; flex-direction: column; gap: 10px; font-size: 32px; line-height: 1.25; }
.sec-task .card h3 { font-size: 40px; }
.sec-task .card .mono { font-size: 29px; }
.sec-task .xx { color: var(--bad); font-weight: 700; }
.sec-task .boards { display: flex; height: 64px; border: 3px solid var(--ink); margin-top: 6px; }
.sec-task .boards span { flex: 1; display: flex; align-items: center; justify-content: center; font-family: var(--font-mono); font-size: 28px; }
.sec-task .boards span + span { border-left: 3px solid var(--ink); background: var(--code-bg); }
.sec-task .side { display: flex; flex-direction: column; gap: 28px; }
.sec-task .hint { display: grid; grid-template-columns: repeat(2, 1fr); gap: 28px 64px; }
.sec-task .hint div { border-left: 6px solid var(--ink); padding: 4px 0 4px 22px; font-size: 32px; line-height: 1.25; }
.sec-task .hint b { display: block; font-size: 36px; margin-bottom: 4px; }
.sec-task .traps { flex: 1; align-content: space-evenly; gap: 72px 64px; }
.sec-task .traps div { font-size: 38px; padding: 12px 0 12px 30px; }
.sec-task .traps b { font-size: 46px; margin-bottom: 14px; }
.sec-task .eqs { font-family: var(--font-math); font-size: 56px; }
.sec-task .vmid { flex: 1; min-height: 0; display: flex; flex-direction: column; justify-content: center; gap: 56px; }
.sec-task .rules .card { font-size: 36px; gap: 14px; }
.sec-task .rules .card h3 { font-size: 46px; }
.sec-task .rules .card .mono { font-size: 33px; line-height: 1.35; }
.sec-task .rules .boards { height: 80px; }
.sec-task .rules .boards span { font-size: 32px; }
.sec-task .eqs i { font-style: italic; }
.sec-task .toys { display: grid; grid-template-columns: 1fr 1fr; gap: 96px; flex: 1; min-height: 0; }
.sec-task .toy { display: flex; flex-direction: column; gap: 16px; }
.sec-task .toy h3 { font-size: 40px; }
.sec-task .toy .ui-row { gap: 20px 24px; }
.sec-task .toy-read { font-family: var(--font-mono); font-size: 30px; color: var(--muted); min-width: 9em; }
.sec-task .toy-read b { color: var(--grad); font-weight: 700; }
.sec-task .t-code { display: grid; grid-template-columns: 1120px 1fr; gap: 72px; align-items: start; flex: 1; }
.sec-task pre.code.t-skel { font-size: 32px; }
.sec-task .t-effect { align-self: stretch; }
.sec-task .t-effect > div { display: flex; flex-direction: column; gap: 20px; font-size: 34px; line-height: 1.25; }
.sec-task .t-effect .big2 { font-family: var(--font-display); font-weight: 800; font-size: 60px; line-height: 1; }
.sec-task .bar { height: 40px; background: var(--ink); }
.sec-task .barlab { font-family: var(--font-mono); font-size: 28px; color: var(--muted); }
.sec-task .plan { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; }
.sec-task .plan h3 { border-bottom: 3px solid var(--ink); padding-bottom: 10px; margin-bottom: 18px; }
.sec-task .plan ol { margin: 0; padding-left: 1.3em; font-size: 38px; line-height: 1.3; display: flex; flex-direction: column; gap: 32px; }
.sec-task .plan .blank { display: block; border-bottom: 3px dashed var(--rule); height: 50px; }
.sec-task .t10 { display: grid; grid-template-columns: 1056px 1fr; gap: 96px; flex: 1; align-items: start; align-content: center; }
.sec-task .gridside { display: flex; flex-direction: column; gap: 30px; }
.sec-task .gridside .ui-readout-value { font-size: 40px; }
.sec-task .live-hint { font-size: 30px; color: var(--muted); line-height: 1.35; }
.sec-task .live-hint b { color: var(--ink); }
.sec-task .courtnet-side { gap: 30px; }
.sec-task .courtnet-side .pg-readouts { gap: 20px 36px; }
.sec-task .rim-cap { font-size: 32px; display: flex; align-items: center; gap: 16px; }
.sec-task .rim-disc { width: 34px; height: 34px; border-radius: 50%; border: 4px solid var(--ink); background: color-mix(in srgb, var(--c1) 40%, transparent); box-sizing: border-box; }
.sec-task .rim-dash { width: 48px; border-top: 5px dashed var(--ink); }
`);

{
  /* ---------- helpers (section scope) ---------- */
  const SH = 0.94;   // court height / width
  // Kobe's shots on a half court
  function drawShots(ctx, fr, C, n) {
    ctx.save();
    ctx.lineWidth = 2;
    for (let i = 0; i < n; i++) {
      const [x, y] = KOBE.X[i];
      ctx.beginPath(); ctx.arc(fr.sx(x), fr.sy(y), 6, 0, 2 * Math.PI);
      ctx.fillStyle = KOBE.Y[i] ? C.c1 : C.c0; ctx.fill();
      ctx.strokeStyle = C.paper; ctx.stroke();
    }
    ctx.restore();
  }
  // a horizontal pipeline of layer boxes as SVG (x positions computed from widths)
  function pipeSVG(items, o) {
    o = Object.assign({ w: 1728, h: 150, y: 20, bh: 96, gap: 44 }, o);
    let x = 0, s = '';
    const pos = [];
    items.forEach((it, i) => {
      const w = it.w;
      pos.push([x, x + w]);
      if (it.kind === 'txt') s += `<text class="${it.cls || 'lbl'}" x="${x + w / 2}" y="${o.y + o.bh / 2}" style="${it.style || ''}">${it.t}</text>`;
      else s += `<rect class="box ${it.kind === 'act' ? 'act' : ''}" x="${x}" y="${o.y}" width="${w}" height="${o.bh}" style="${it.box || ''}"/>` +
        `<text class="lbl" x="${x + w / 2}" y="${o.y + o.bh / 2}" style="${it.style || ''}">${it.t}</text>`;
      if (i < items.length - 1) s += `<line class="flow" x1="${x + w + 6}" y1="${o.y + o.bh / 2}" x2="${x + w + o.gap - 8}" y2="${o.y + o.bh / 2}" style="stroke-width:4"/>`;
      x += w + o.gap;
    });
    return { s, pos, width: x - o.gap };
  }
  // small panda face (SVG), drawn in ink and paper only
  const panda = (x, y, s) => `<g transform="translate(${x},${y}) scale(${s})">
    <circle cx="-62" cy="-58" r="30" style="fill:var(--ink)"/><circle cx="62" cy="-58" r="30" style="fill:var(--ink)"/>
    <ellipse cx="0" cy="0" rx="86" ry="78" style="fill:var(--paper);stroke:var(--ink);stroke-width:5"/>
    <ellipse cx="-32" cy="-8" rx="20" ry="28" transform="rotate(30 -32 -8)" style="fill:var(--ink)"/>
    <ellipse cx="32" cy="-8" rx="20" ry="28" transform="rotate(-30 32 -8)" style="fill:var(--ink)"/>
    <circle cx="-30" cy="-12" r="6" style="fill:var(--paper)"/><circle cx="30" cy="-12" r="6" style="fill:var(--paper)"/>
    <ellipse cx="0" cy="26" rx="14" ry="10" style="fill:var(--ink)"/>
    <path d="M-16,44 Q0,56 16,44" style="fill:none;stroke:var(--ink);stroke-width:5;stroke-linecap:round"/></g>`;
  // noise square: the sign of the input gradient, drawn in magenta
  const noise = (x, y, size) => {
    const r = NN.rng(42), n = 14, c = size / n;
    let s = `<rect x="${x}" y="${y}" width="${size}" height="${size}" style="fill:var(--paper);stroke:var(--grad);stroke-width:3"/>`;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (r() < 0.5) s += `<rect x="${(x + i * c).toFixed(1)}" y="${(y + j * c).toFixed(1)}" width="${c.toFixed(1)}" height="${c.toFixed(1)}" style="fill:var(--grad)"/>`;
    return s;
  };
  const lock = (x, y) => `<g transform="translate(${x},${y})"><path d="M-14,0 V-12 A14,14 0 0 1 14,-12 V0" style="fill:none;stroke:var(--ink);stroke-width:5"/><rect x="-22" y="0" width="44" height="34" style="fill:var(--ink)"/></g>`;

  /* ================================================================
     1. Pre-flight checklist
     ================================================================ */
  const item = (b, c) => `<div class="chk-item"><span class="chk-box"></span><b>${b}</b><code>${c}</code></div>`;
  Deck.slide({
    id: 'task-check',
    title: 'Pre-flight checklist',
    html: `
    <div class="kicker">olympiad playbook</div>
    <h2>Nine checks before you trust a number</h2>
    <div class="chk">
      <div class="chk-col" data-step="1"><h3>before training</h3>
        ${item('fix the seed', 'torch.manual_seed(0)')}
        ${item('scale the inputs', 'mean / std of TRAIN only')}
        ${item('baselines first', 'always "miss" = 55.3%')}
        ${item('validation split', '80% train · 20% val')}
      </div>
      <div class="chk-col" data-step="2"><h3>while training</h3>
        ${item('the right loss', 'BCEWithLogitsLoss')}
        ${item('Adam', 'lr = 1e-3, then sweep')}
        ${item('watch validation', 'not only the train loss')}
      </div>
      <div class="chk-col" data-step="3"><h3>before submitting</h3>
        ${item('keep the best weights', 'copy.deepcopy(state_dict)')}
        ${item('count parameters', 'assert n_params <= 105')}
      </div>
    </div>`,
    notes: `
    <p class="time">1.5 min</p>
    <p class="say">Before the two tasks, here is the checklist that wins practical rounds. Pilots run a checklist before every take-off, even after ten thousand flights, because the boring mistakes are the ones that crash planes. In olympiad tasks the boring mistakes cost the most points too: a missing seed, unscaled inputs, no baseline, no validation split.</p>
    <p class="do">Press → three times: one column per press. Read only the bold words; the grey code is the hint for how.</p>
    <ul>
      <li><b>Before:</b> seed, so a result can be repeated; scale with the mean and standard deviation of the TRAINING part only; compute a baseline (for Kobe "always miss" already gets 55.3%); keep 20% aside as validation.</li>
      <li><b>While:</b> BCEWithLogitsLoss for yes/no, fed the raw score (for Kobe the submitted class ends with a Sigmoid, so train on the score before it; the pitfalls slide comes back to this); Adam 1e-3 to start, then try 3e-3 and 1e-2; judge by the validation loss.</li>
      <li><b>Before submitting:</b> save the best weights with copy.deepcopy (a plain state_dict() keeps changing as you train); count the parameters in code: sum(p.numel() for p in model.parameters()).</li>
    </ul>
    <p class="ask">The official Kobe baseline notebook printed a training loss of 0.6877. Which check would have told its author that the model learned nothing?</p>
    <p class="ans">"Baselines first": always guessing the average make rate gives a loss of 0.6876. The model was no better than a constant, and nobody noticed because nobody computed the baseline.</p>`,
  });

  /* ================================================================
     2. Task 1: Kobe
     ================================================================ */
  Deck.slide({
    id: 'task-kobe',
    title: 'Task 1: Kobe, will this shot go in?',
    html: `
    <div class="kicker">task 1 · NOAI 2024, round 2, problem 1</div>
    <h2>Kobe: will this shot go in?</h2>
    <div class="split split-46" style="grid-template-columns: 768px 1fr; gap: 96px; align-items: start">
      <div id="task-kobe-court"></div>
      <div class="col" style="gap: 44px; padding-top: 24px">
        <div><div class="stat">30,697</div><div class="stat-l">shots · 20 seasons · 1996–2016</div></div>
        <div><div class="stat">25,000</div><div class="stat-l">of them in your training file</div></div>
        <div class="lead" style="line-height:1.5"><span class="dotl" style="background:var(--c1)"></span>44.7% went in<br><span class="dotl" style="background:var(--c0)"></span>55.3% missed</div>
      </div>
    </div>`,
    init(el, api) {
      const host = el.querySelector('#task-kobe-court');
      const W = 744, fr = Widgets.courtFrame(12, 4, W - 24);
      const cv = Plot.canvas(host, W, Math.ceil(fr.h) + 8);
      const draw = () => { const C = Plot.colors(); cv.clear(); drawShots(cv.ctx, fr, C, 800); Widgets.drawCourt(cv.ctx, fr, { color: C.ink, width: 3 }); };
      draw(); api.onTheme(draw);
    },
    notes: `
    <p class="time">30 s</p>
    <p class="say">Task one. Kobe Bryant took 30,697 shots in 20 seasons, each logged with its position on the court, and you get 25,000 of them marked "went in" or "missed". From the position alone, predict whether a shot goes in.</p>
    <p class="do">Point at the court: every dot is one shot seen from above, hoop at the bottom; orange = made, blue = missed (800 shown). Let them notice the pile right under the basket.</p>
    <p>Source: China's national AI olympiad (NOAI 2024, round 2, problem 1), built on Kaggle's "Kobe Bryant Shot Selection" data. Kobe died in a helicopter crash in 2020; if it comes up, mention it calmly, no jokes.</p>`,
  });

  /* ================================================================
     3. The rules
     ================================================================ */
  const P = pipeSVG([
    { kind: 'txt', t: 'loc_x, loc_y', w: 230, style: 'font-size:32px' },
    { t: 'Linear 2→8', w: 228 }, { kind: 'act', t: 'act', w: 110 },
    { t: 'Linear 8→8', w: 228 }, { kind: 'act', t: 'act', w: 110 },
    { t: 'Linear 8→1', w: 228 }, { kind: 'act', t: 'Sigmoid', w: 168 },
    { kind: 'txt', t: 'P(made)', w: 150, style: 'font-size:32px' },
  ], { gap: 42, y: 20 });
  const lin = [P.pos[1], P.pos[3], P.pos[5]];
  Deck.slide({
    id: 'task-rules',
    title: 'The rules',
    html: `
    <h2>The rules: a tiny net, raw inputs</h2>
    <div class="vmid">
    <svg class="dg" viewBox="0 0 1728 310" width="1728" height="310" role="img" aria-label="loc_x, loc_y into Linear 2 to 8, activation, Linear 8 to 8, activation, Linear 8 to 1, Sigmoid">
      ${P.s}
      <text class="lbl-s" x="0" y="190" style="text-anchor:start">raw</text>
      <text class="lbl-s" x="0" y="232" style="text-anchor:start">x −250…248</text>
      <text class="lbl-s" x="0" y="274" style="text-anchor:start">y −44…791</text>
      <g data-step="1">
        <path d="M${lin[0][0]},136 v14 H${lin[2][1]} v-14" style="fill:none;stroke:var(--ink);stroke-width:3"/>
        <text class="lbl" x="${(lin[0][0] + lin[2][1]) / 2}" y="196" style="font-size:34px">≤ 3 Linear layers · ≤ 8 neurons each</text>
        <text class="lbl-s" x="${(lin[0][0] + lin[2][1]) / 2}" y="242" style="font-size:30px">max: 2-8-8-1 = 105 parameters</text>
      </g>
    </svg>
    <div class="cards rules">
      <div class="card" data-step="2"><h3>act = only these</h3>
        <span class="mono">nn.ReLU · nn.Sigmoid<br>nn.Tanh · nn.ELU<br>nn.LeakyReLU · nn.PReLU</span>
        <span><span class="xx">✗</span> <span class="mono">nn.Sequential</span> → score 0</span></div>
      <div class="card" data-step="3"><h3>submission.zip</h3>
        <span class="mono">submission_model.py</span>
        <span class="mono">submission_dic.pth</span></div>
      <div class="card" data-step="4"><h3>score = test accuracy</h3>
        <div class="boards"><span>A: live</span><span>B: final</span></div></div>
    </div>
    </div>`,
    notes: `
    <p class="time">1.5 min</p>
    <p class="say">The rules are strict on purpose. The network sees only loc_x and loc_y, and they arrive raw, in tenths of a foot. The statement says "already normalized", but x runs from −250 to 248 and y from −44 to 791.</p>
    <p class="do">→ 1: 2-8-8-1 (105 numbers) is the biggest legal net. → 2: only these activations; name the layers (self.fc1, …), since nn.Sequential scores 0. → 3: a zip with the class (submission_model.py, with its imports) and the trained state_dict (submission_dic.pth). → 4: accuracy on hidden shots, about 2,500 per board; board A is live, board B is final.</p>
    <p class="ask">Can you add the column shot_distance as a third input?</p>
    <p class="ans">No: the grader passes exactly two columns. It would not help anyway: it is computed from x and y.</p>
    <p>Keep the baseline's class name MyModel and its final nn.Sigmoid.</p>`,
  });

  /* ================================================================
     4. Predict the score: a ruler of accuracies
     ================================================================ */
  const ax = v => 60 + (v - 50) * (1600 / 15);  // 50% .. 65% on the ruler
  const mark = (v, top, label, sub, step, cls) => `<g data-step="${step}">
      <line x1="${ax(v)}" y1="${top ? 170 : 236}" x2="${ax(v)}" y2="${top ? 236 : 302}" style="stroke:var(--${cls || 'ink'});stroke-width:6"/>
      <text class="lbl" x="${ax(v)}" y="${top ? 92 : 344}" style="font-size:40px;fill:var(--${cls || 'ink'})">${label}</text>
      <text class="lbl-s" x="${ax(v)}" y="${top ? 136 : 388}" style="font-size:30px">${sub}</text></g>`;
  Deck.slide({
    id: 'task-predict',
    title: 'Predict the best possible score',
    html: `
    <div class="row"><span class="tag tag-predict">predict</span></div>
    <h2>What accuracy can the best model reach?</h2>
    <div class="vmid">
    <svg class="dg" viewBox="0 0 1728 410" width="1728" height="410" role="img" aria-label="accuracy ruler from 50 to 65 percent">
      <line x1="60" y1="236" x2="1660" y2="236" style="stroke:var(--ink);stroke-width:4"/>
      ${[50, 55, 60, 65].map(v => `<line x1="${ax(v)}" y1="222" x2="${ax(v)}" y2="250" style="stroke:var(--muted);stroke-width:3"/><text class="lbl-s" x="${ax(v)}" y="276" style="font-size:28px">${v}%</text>`).join('')}
      ${mark(55.3, true, '55.3%', 'always "miss"', 1, 'muted')}
      ${mark(58.6, false, '58.6%', 'best straight line', 2)}
      <g data-step="3">
        <rect x="${ax(60.5)}" y="214" width="${ax(61) - ax(60.5)}" height="44" style="fill:var(--ink)"/>
        <text class="lbl" x="${ax(60.75)}" y="92" style="font-size:40px">≈ 61%</text>
        <text class="lbl-s" x="${ax(60.75)}" y="136" style="font-size:30px">legal 2-8-8-1</text>
        <line x1="${ax(60.75)}" y1="160" x2="${ax(60.75)}" y2="210" style="stroke:var(--ink);stroke-width:4"/>
      </g>
      <g data-step="4">
        <rect x="${ax(62.1)}" y="214" width="${ax(62.5) - ax(62.1)}" height="44" style="fill:var(--muted)"/>
        <line x1="${ax(62.3)}" y1="262" x2="${ax(62.3)}" y2="300" style="stroke:var(--muted);stroke-width:4"/>
        <text class="lbl" x="${ax(62.3) + 40}" y="344" style="font-size:40px;fill:var(--muted)">62–62.5%</text>
        <text class="lbl-s" x="${ax(62.3) + 40}" y="388" style="font-size:30px">leaderboard best</text>
      </g>
    </svg>
    <p class="lead" data-step="5">Even at the rim, only <b>62.5%</b> go in.</p>
    </div>`,
    notes: `
    <p class="time">1.5 min</p>
    <p class="say">Before anyone trains anything: what is the best accuracy possible here? Everybody write one number.</p>
    <p class="do">Take two or three guesses (usually 70–90%), then one step per press:</p>
    <ul>
      <li>→ 1: always "miss": free points.</li>
      <li>→ 2: the best straight line. You may have seen logistic regression; if not: a model that can only cut the court with one straight line, so this is its limit.</li>
      <li>→ 3: a legal 2-8-8-1 trained well: the ceiling.</li>
      <li>→ 4: the best leaderboard; luck moves board scores by about ±1 point.</li>
      <li>→ 5: even rim shots go in only 62.5%: the labels are partly luck.</li>
    </ul>
    <p class="ask">Your friend gets 60.4% and you 60.9% on the live board. Who has the better model?</p>
    <p class="ans">You cannot tell: the board's luck is bigger than the gap. Trust your validation split.</p>`,
  });

  /* ================================================================
     5. Accuracy only sees the 50% line
     ================================================================ */
  // FG% by distance (1-ft bins, 0..29 ft) from all 25,000 labelled rows of the task file
  const FG = [0.635, 0.663, 0.530, 0.441, 0.476, 0.439, 0.425, 0.426, 0.476, 0.441, 0.415, 0.461, 0.453, 0.418, 0.430,
    0.426, 0.391, 0.390, 0.403, 0.418, 0.399, 0.426, 0.374, 0.385, 0.364, 0.358, 0.315, 0.298, 0.224, 0.197];
  Deck.slide({
    id: 'task-rim',
    title: 'Accuracy only sees the 50% line',
    html: `
    <h2>Accuracy only sees the 50% line</h2>
    <div class="row" style="align-items:flex-start; gap:96px">
      <div id="task-rim-bars"></div>
      <div class="col" style="gap:14px">
        <div id="task-rim-court"></div>
        <div class="rim-cap" data-step="1"><span class="rim-disc"></span>"made" only within 3 ft → <b>60.7%</b></div>
        <div class="rim-cap" data-step="2"><span class="rim-dash"></span>best straight cut → <b>58.6%</b></div>
      </div>
    </div>`,
    init(el, api) {
      const BW = 960, BH = 620;
      const cb = Plot.canvas(el.querySelector('#task-rim-bars'), BW, BH);
      const CW = 620, fr = Widgets.courtFrame(0, 0, CW);
      const cc = Plot.canvas(el.querySelector('#task-rim-court'), CW, Math.ceil(fr.h) + 2);
      const sx = Plot.scale(-0.5, 29.5, 110, BW - 20), sy = Plot.scale(0, 0.8, BH - 70, 50);
      function bars() {
        const C = Plot.colors(), ctx = cb.ctx;
        cb.clear();
        ctx.save();
        ctx.font = `28px ${C.fontMono}`; ctx.fillStyle = C.muted; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
        [0, 0.2, 0.4, 0.6].forEach(v => ctx.fillText(Math.round(v * 100) + '%', sx.range[0] - 14, sy(v)));
        ctx.textAlign = 'center'; ctx.textBaseline = 'top';
        [0, 5, 10, 15, 20, 25].forEach(v => ctx.fillText(v, sx(v), BH - 60));
        ctx.textAlign = 'right'; ctx.fillStyle = C.ink; ctx.font = `30px ${C.fontBody}`;
        ctx.fillText('distance from the rim (feet)', BW - 20, BH - 28);
        ctx.textAlign = 'left'; ctx.textBaseline = 'top';
        ctx.fillText('shots made', sx.range[0] + 6, 4);
        const bw = (sx(1) - sx(0)) * 0.78;
        FG.forEach((p, d) => {
          ctx.fillStyle = p > 0.5 ? C.c1 : C.c0;
          ctx.fillRect(sx(d) - bw / 2, sy(p), bw, sy(0) - sy(p));
        });
        ctx.strokeStyle = C.muted; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(sx.range[0], sy(0)); ctx.lineTo(sx.range[1], sy(0)); ctx.stroke();
        ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.setLineDash([14, 10]);
        ctx.beginPath(); ctx.moveTo(sx.range[0], sy(0.5)); ctx.lineTo(sx.range[1], sy(0.5)); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = C.ink; ctx.font = `700 32px ${C.fontMono}`; ctx.textAlign = 'right'; ctx.textBaseline = 'bottom';
        ctx.fillText('50%', sx.range[1], sy(0.5) - 10);
        ctx.font = `30px ${C.fontBody}`; ctx.textAlign = 'left';
        ctx.fillStyle = C.c1; ctx.fillText('0–2 ft: more in than out', sx(3), sy(0.66));
        ctx.fillStyle = C.c0; ctx.fillText('3 ft and beyond: more out than in', sx(8), sy(0.6));
        ctx.restore();
      }
      function court(k) {
        const C = Plot.colors(), ctx = cc.ctx;
        cc.clear();
        drawShots(ctx, fr, C, 600);
        Widgets.drawCourt(ctx, fr, { color: C.ink, width: 3 });
        const px = Math.abs(fr.sx(1) - fr.sx(0));
        if (k >= 1) {
          ctx.save();
          ctx.beginPath(); ctx.arc(fr.sx(0), fr.sy(0), 30 * px, 0, 2 * Math.PI);
          ctx.fillStyle = Plot.alpha(C.c1, 0.35); ctx.fill();
          ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.stroke();
          ctx.restore();
        }
        if (k >= 2) {
          // best straight cut on the task data: 0.208 x + 0.978 y = 18.2, "made" below it
          const yAt = x => (18.2 - 0.2079 * x) / 0.9781;
          ctx.save();
          ctx.strokeStyle = C.ink; ctx.lineWidth = 5; ctx.setLineDash([16, 10]);
          ctx.beginPath(); ctx.moveTo(fr.sx(-250), fr.sy(yAt(-250))); ctx.lineTo(fr.sx(250), fr.sy(yAt(250))); ctx.stroke();
          ctx.restore();
        }
      }
      const draw = () => { bars(); court(api.step); };
      draw();
      api.onStep(k => court(k));
      api.onTheme(draw);
    },
    steps: 2,
    notes: `
    <p class="time">1.5 min</p>
    <p class="say">Here is why the ceiling is so low. Each bar is how often Kobe scored from that distance. Accuracy only asks one yes/no question per shot: is it more likely in or out? So only the dashed 50% line matters. Only the first bars, right at the rim, are above it.</p>
    <p class="do">Point at the orange bars (0–2 feet) and the long row of blue bars. Then → 1: the court lights up the small disc around the hoop. The best possible answer is basically "made if within about 3 feet of the rim, otherwise missed": 60.7% on held-out shots. That is the whole ceiling.</p>
    <p class="do">→ 2: the dashed line is the best a single straight line can do: 58.6%. A straight line cannot draw a disc. The official baseline is a 2-1-1-1 chain; with one neuron per layer it can only cut the court with one straight line, and its run learned nothing at all (loss 0.6877, same as a constant guess). The fix is width (8 neurons), not more depth.</p>
    <p class="ask">The three-point line changes the points a shot is worth. Does it show up in the best accuracy boundary?</p>
    <p class="ans">No. Kobe made fewer than half of his shots on both sides of the three-point line, so both sides are "miss". Accuracy cannot see it. (It would matter if the score were expected points or log loss.)</p>
    <p>Numbers: 1-foot bins from all 25,000 rows of the task file: 0 ft 63.5% (4,480 shots), 1 ft 66.3%, 2 ft 53.0%, 3 ft 44.1%, then 36–48% out to 25 ft. The rule "made iff r ≤ 3 ft" predicts "made" for about 22% of shots. Trained 2-8-8-1 networks agree with it on 97–99% of validation shots. The straight cut drawn here is the best line found on the task data (59.2% on the data it was fitted to, 58.6% on held-out shots).</p>`,
  });

  /* ================================================================
     6. Live: courtNet
     ================================================================ */
  Deck.slide({
    id: 'task-live',
    title: 'Live: the net learns the hot zone',
    html: `
    <div class="row" style="gap:32px"><span class="tag tag-predict">predict</span><span class="tag tag-try">try it live</span></div>
    <h2>What does plain SGD learn from raw numbers?</h2>
    <div class="grow" id="task-live"></div>`,
    init(el, api) {
      const w = Widgets.courtNet(api, el.querySelector('#task-live'), {
        w: 720, hidden: [8, 8], act: 'relu', opt: 'sgd', lr: 0.1, sgdLr: 0.1, adamLr: 0.01, normalize: false,
        controls: ['play', 'reset', 'norm', 'opt'], n: 3000, maxEpochs: 100,
      });
      const side = el.querySelector('.courtnet-side');
      const h = document.createElement('div');
      h.className = 'live-hint';
      h.innerHTML = '<b>1</b> SGD + raw inputs &nbsp; <b>2</b> SGD + scaled &nbsp; <b>3</b> Adam + raw';
      side.appendChild(h);
      // when a run reaches its last epoch, flip the button back to "Train" so the next toggle does not auto-start
      api.loop(() => { if (w.S.playing && w.S.epoch >= 100) w.pause(); return true; });
      api.onLeave(() => w.pause());
    },
    notes: `
    <p class="time">2 min</p>
    <p class="say">This is a legal 2-8-8-1 ReLU network training live on 3,000 of Kobe's shots. Orange background = the net thinks "made", blue = "missed". It starts with plain SGD, learning rate 0.1, on the raw coordinates, exactly as the grader will hand them over.</p>
    <p class="ask">Predict: with raw numbers in the hundreds, what will plain SGD learn?</p>
    <p class="do">1) Click <b>Train</b> (100 epochs, about 8 seconds; the button turns back into Train when the run ends). Watch accuracy: it sits at 54.6%, the "always miss" value for these 3,000 shots, and the court turns blue everywhere. Huge inputs make huge activations; the ReLUs die and the net settles on a constant.</p>
    <p class="do">2) Click <b>scaled inputs</b>, then <b>Train</b>. Same network, same learning rate, inputs divided by their spread: within a second the orange blob appears around the hoop and accuracy climbs to about 60%.</p>
    <p class="do">3) Click <b>Adam</b> and <b>raw inputs</b>, then <b>Train</b>. Adam also gets to about 60% (after a wobbly start). Adam takes steps of about the same size whatever the gradient size, so it hides the scaling problem. Scale anyway: it makes every learning rate and default behave as designed.</p>
    <p class="ans">Plain SGD on raw coordinates collapses to "always miss"; scaling fixes it; Adam hides the problem.</p>
    <p>Our PyTorch runs agree: SGD + momentum, lr 0.1, raw ReLU inputs collapsed to "always miss" (55.3% on validation) in 3 of 3 seeds, while scaled inputs reached 60.3%; with Adam, raw and scaled were equal. Reset and every toggle restart from the same seed and shuffle order, so the demo repeats exactly: SGD + raw ends at 54.6% with no shot called "made", SGD + scaled at 60.0%, Adam + raw at 60.3% (it dips below 50% around epoch 20 before recovering). With other shuffle orders SGD + raw escaped in about half of our runs, to about 59.7% without the rim zone: it is a lottery, which is exactly the problem.</p>`,
  });

  /* ================================================================
     7. Hint: fold the scaling into fc1
     ================================================================ */
  const R1 = pipeSVG([
    { kind: 'txt', t: 'raw x, y', w: 170, style: 'font-size:32px' },
    { t: 'x: −7, ÷ 110', w: 300, box: 'stroke-dasharray:10 8', style: 'font-size:32px' },
    { t: 'fc1', w: 150 }, { kind: 'txt', t: '…', w: 60 },
  ], { gap: 48, y: 30, bh: 110 });
  const R2 = pipeSVG([
    { kind: 'txt', t: 'raw x, y', w: 170, style: 'font-size:32px' },
    { t: 'fc1 with new weights', w: 498, style: 'font-size:32px' }, { kind: 'txt', t: '…', w: 60 },
  ], { gap: 48, y: 30, bh: 110 });
  Deck.slide({
    id: 'task-fold',
    title: 'Hint: fold the scaling into fc1',
    html: `
    <h2>Hide the scaling inside the first layer</h2>
    <div class="vmid">
    <div class="row" style="gap:56px;align-items:flex-end">
      <div class="col" style="gap:28px">
        <div class="kicker">while training</div>
        <svg class="dg" viewBox="0 0 1000 170" width="1180" height="201" role="img" aria-label="raw x, y, then scaling, then fc1">${R1.s}
          <text class="lbl-s" x="${(R1.pos[1][0] + R1.pos[1][1]) / 2}" y="160">y: −91, ÷ 88</text></svg>
        <div class="kicker" data-step="1">what you submit</div>
        <svg class="dg" viewBox="0 0 1000 170" width="1180" height="201" data-step="1" role="img" aria-label="raw x, y into fc1 with new weights">${R2.s}
          <text class="lbl-s" x="${(R2.pos[1][0] + R2.pos[1][1]) / 2}" y="160">same answers · legal</text></svg>
      </div>
      <div class="col" data-step="2" style="gap:16px;padding-bottom:72px">
        <div class="eqs"><i>W</i>′ = <i>W</i> ÷ std</div>
        <div class="lead muted">+ shift the bias</div>
      </div>
    </div>
    </div>`,
    notes: `
    <p class="time">1 min</p>
    <p class="say">The trap: you train on scaled inputs, but the grader feeds raw coordinates. So the scaling must live inside the weights. It is just "subtract, then divide", so it merges exactly into the first layer.</p>
    <p class="do">Top: while training, x − 7, then ÷ 110 (y − 91, ÷ 88). → 1: you submit only fc1 with new weights. → 2: divide each weight by its input's spread, then shift the bias to match.</p>
    <p class="say">Check it: raw inputs into the folded model must give the same outputs as scaled inputs into the original, to 6 decimals.</p>
    <p class="ask">Is this exact, or an approximation?</p>
    <p class="ans">Exact: subtract-and-divide followed by a linear layer is still one linear layer.</p>
    <p>Code, inside torch.no_grad(): weight /= std (per input column), then bias −= weight @ mean; outputs match to 5 × 10⁻⁷.</p>`,
  });

  /* ================================================================
     7b. Four ways to lose Kobe points
     ================================================================ */
  Deck.slide({
    id: 'task-traps',
    title: 'Four ways to lose points on Kobe',
    html: `
    <h2>Four ways to lose points on Kobe</h2>
    <div class="hint traps">
      <div data-step="1"><b><span class="xx">✗</span> extra maths in forward()</b>only Linear + activation</div>
      <div data-step="2"><b><span class="xx">✗</span> Sigmoid + BCEWithLogitsLoss</b>use one, not both</div>
      <div data-step="3"><b><span class="xx">✗</span> train one class, submit another</b>import submission_model.py</div>
      <div data-step="4"><b><span class="xx">✗</span> never reloading the zip</b>reload it, feed raw x, y</div>
    </div>`,
    notes: `
    <p class="time">1 min</p>
    <p class="say">Four mistakes that cost points on this task, three of them from real public notebooks. None shows in the training loss: you only find out when the grader runs your zip.</p>
    <p class="do">→ 1: distance, angle or buffers inside forward() break the rules (only "linear + activation") and gave us no gain; folding the scaling into fc1 is fine.</p>
    <p class="ask">→ 2: the class must end with nn.Sigmoid. Which loss do you train with?</p>
    <p class="ans">nn.BCELoss on the Sigmoid output, or BCEWithLogitsLoss on the score before it. Never both: that is the cliffhanger bug (normal printed loss, real log loss about 4.5).</p>
    <p class="do">→ 3: write submission_model.py first and import it (one public notebook saved weights for a different shape). → 4: load the zip fresh, feed raw x, y, and check you get your validation accuracy.</p>`,
  });

  /* ================================================================
     8. Task 2: inversion
     ================================================================ */
  const cells = (x, y, n, miss) => Array.from({ length: n }, (_, i) =>
    `<rect class="${i === miss ? 't-param' : 't-data'}" x="${x + i * 34}" y="${y}" width="34" height="56" style="${i === miss ? 'stroke:var(--grad);stroke-width:4' : ''}"/>` +
    (i === miss ? `<text class="lbl" x="${x + i * 34 + 17}" y="${y + 28}" style="fill:var(--grad);font-size:34px">?</text>` : '')).join('');
  Deck.slide({
    id: 'task-inv',
    title: 'Task 2: optimise the input, not the weights',
    html: `
    <h2>Optimise the input, not the weights</h2>
    <div class="row" style="gap:96px;align-items:flex-start">
      <svg class="dg" viewBox="0 0 816 330" width="816" height="330" role="img" aria-label="training: data in, weights move">
        <text class="lbl-b" x="0" y="20" style="text-anchor:start">training</text>
        ${cells(0, 110, 6, -1)}
        <text class="lbl-s" x="102" y="84">data: fixed</text>
        <line class="flow" x1="214" y1="138" x2="290" y2="138"/>
        <rect class="t-param" x="300" y="78" width="250" height="120" style="stroke-width:4"/>
        <text class="lbl" x="425" y="118">model</text>
        <text class="lbl" x="425" y="158" style="fill:var(--grad);font-size:28px">weights move</text>
        <line class="flow" x1="556" y1="138" x2="626" y2="138"/>
        <text class="lbl-m" x="700" y="122">loss</text><text class="lbl-s" x="700" y="162">vs label</text>
        <path class="back" d="M700,200 V268 H425 V212"/>
        <text class="lbl-s" x="560" y="300" style="fill:var(--grad)">gradient → weights</text>
      </svg>
      <svg class="dg" viewBox="0 0 816 330" width="816" height="330" data-step="1" role="img" aria-label="inversion: model frozen, the missing input moves">
        <text class="lbl-b" x="0" y="20" style="text-anchor:start">inversion</text>
        ${cells(0, 110, 6, 3)}
        <text class="lbl-s" x="102" y="84">one column zeroed</text>
        <line class="flow" x1="214" y1="138" x2="290" y2="138"/>
        <rect class="box" x="300" y="78" width="250" height="120" style="stroke-width:5"/>
        <text class="lbl" x="455" y="118">model</text>
        <text class="lbl-s" x="455" y="158">frozen</text>${lock(345, 128)}
        <line class="flow" x1="556" y1="138" x2="626" y2="138"/>
        <text class="lbl-m" x="700" y="122">loss</text><text class="lbl-s" x="700" y="162">vs known y</text>
        <path class="back" d="M700,200 V268 H119 V178"/>
        <text class="lbl-s" x="400" y="300" style="fill:var(--grad)">gradient → the missing input</text>
      </svg>
    </div>
    <svg class="dg" viewBox="-10 0 940 250" width="1222" height="325" data-step="2" role="img" aria-label="panda plus tiny noise is classified as gibbon">
      ${panda(110, 110, 0.95)}
      <text class="lbl" x="110" y="226">"panda" 57.7%</text>
      <text class="lbl-b" x="300" y="110">+ 0.007 ×</text>
      ${noise(400, 30, 160)}
      <text class="lbl-s" x="480" y="226" style="fill:var(--grad)">input gradient's sign</text>
      <text class="lbl-b" x="650" y="110">=</text>
      ${panda(800, 110, 0.95)}
      <text class="lbl" x="800" y="226" data-step="3">"gibbon" 99.3%</text>
    </svg>`,
    notes: `
    <p class="time">2 min</p>
    <p class="say">Task two, "Operation Inversion". You get a frozen trained network and rows of inputs with its output y, but one input column was set to zeros. Recover that column.</p>
    <p class="do">Left: in training the data is fixed and the weights move. → 1: in inversion the weights are frozen and the missing input moves downhill instead. Analogy: the model is a lock; we turn the key until it opens.</p>
    <p class="ask">→ 2: a network says "panda" (57.7%). We add invisible noise built from the gradient with respect to the input. What now?</p>
    <p class="ans">→ 3: "gibbon", 99.3% (Goodfellow et al., 2014): the same tool as our task. The same trick drives DeepDream and style transfer.</p>
    <p>Fredrikson et al. (2014) recovered a patient's missing genetic marker from a drug-dosing model and the dose this way: exactly this task. Our task numbers come from replicas we built; check the real statement.</p>`,
  });

  /* ================================================================
     9. Two 1-D toys
     ================================================================ */
  function toy(api, host, cfg) {
    const W = 816, H = 520;
    const wrap = document.createElement('div');
    host.appendChild(wrap);
    const cv = Plot.canvas(wrap, W, H);
    const sx = Plot.scale(cfg.dom[0], cfg.dom[1], 70, W - 20), sy = Plot.scale(0, cfg.ymax, H - 56, 30);
    const S = { path: [cfg.start], running: false, t: 0, gone: false, m: 0, v: 0, k: 0 };
    const row = UI.row(host);
    const run = UI.button(row, 'Run', () => { reset(); S.running = true; }, { kind: 'primary' });
    UI.choice(row, cfg.choices, cfg.value, v => { cfg.set(v); reset(); draw(); });
    const rd = document.createElement('span'); rd.className = 'toy-read'; row.appendChild(rd);
    function reset() { S.path = [cfg.start]; S.running = false; S.gone = false; S.m = 0; S.v = 0; S.k = 0; draw(); }
    function step() {
      const x = S.path[S.path.length - 1], g = cfg.dL(x);
      let nx;
      if (cfg.opt === 'adam') {
        S.k++; S.m = 0.9 * S.m + 0.1 * g; S.v = 0.999 * S.v + 0.001 * g * g;
        const mh = S.m / (1 - Math.pow(0.9, S.k)), vh = S.v / (1 - Math.pow(0.999, S.k));
        nx = x - cfg.lr * mh / (Math.sqrt(vh) + 1e-8);
      } else nx = x - cfg.lr * g;
      S.path.push(nx);
      if (!isFinite(nx) || nx < cfg.dom[0] - 0.02 || nx > cfg.dom[1] + 0.02) { S.gone = true; S.running = false; }
      if (S.path.length > cfg.maxSteps) S.running = false;
    }
    function draw() {
      const C = Plot.colors(), ctx = cv.ctx;
      cv.clear();
      Plot.axes(ctx, sx, sy, { xt: cfg.xt, yt: [], grid: false, zero: false, font: 28, fmt: v => (Math.round(v * 10) / 10) + '' });
      ctx.save();
      ctx.strokeStyle = C.muted; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(sx.range[0], sy(0)); ctx.lineTo(sx.range[1], sy(0)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(sx.range[0], sy(0)); ctx.lineTo(sx.range[0], sy(cfg.ymax)); ctx.stroke();
      ctx.restore();
      Plot.text(ctx, 'loss', 4, 36, { size: 28, base: 'top', color: C.muted });
      Plot.text(ctx, cfg.name, sx.range[1], sy(0) - 12, { size: 34, align: 'right', color: C.ink, weight: 700 });
      ctx.save(); Plot.clip(ctx, 0, 20, W, H - 50);
      Plot.fn(ctx, sx, sy, cfg.L, { color: C.ink, width: 5 });
      // the optimiser's path in magenta
      const P = S.path.filter(isFinite);
      ctx.strokeStyle = C.grad; ctx.lineWidth = 3.5; ctx.setLineDash([10, 8]);
      ctx.beginPath();
      P.forEach((x, i) => { const px = sx(x), py = sy(Math.min(cfg.ymax * 1.5, cfg.L(x))); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); });
      ctx.stroke(); ctx.setLineDash([]);
      P.forEach((x, i) => {
        const last = i === P.length - 1;
        Plot.dot(ctx, sx(x), sy(Math.min(cfg.ymax * 1.5, cfg.L(x))), last ? 13 : 7, C.grad, C.paper);
      });
      ctx.restore();
      cfg.marks.forEach(m => {
        ctx.save(); ctx.strokeStyle = C.ink; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(sx(m), sy(0) - 18); ctx.lineTo(sx(m), sy(0)); ctx.stroke(); ctx.restore();
      });
      const x = S.path[S.path.length - 1];
      rd.innerHTML = S.gone ? `step ${S.path.length - 1}: <b>blows up</b>` : `step ${S.path.length - 1}: ${cfg.short} = <b>${(Math.abs(x) < 5e-4 ? 0 : x).toFixed(3)}</b>`;
    }
    api.loop(dt => {
      if (!S.running) return true;
      S.t += dt;
      if (S.t > cfg.dt) { S.t = 0; step(); draw(); }
      return true;
    });
    api.onTheme(draw);
    draw();
    return { reset, S, draw, run };
  }
  Deck.slide({
    id: 'task-toys',
    title: 'Two toy inversions',
    html: `
    <h2>One unknown: one answer, or two</h2>
    <p class="small muted" style="margin-top:-16px">frozen model: <span class="m"><i>f</i> = <i>a</i> + 2<i>b</i> + <i>c</i><sup>2</sup> = 4.65</span></p>
    <div class="toys">
      <div class="toy"><h3>find <i>b</i> (a = 1, c = 1.5)</h3><div id="task-toy1"></div></div>
      <div class="toy"><h3>find <i>c</i> (a = 1, b = 0.7)</h3><div id="task-toy2"></div></div>
    </div>`,
    init(el, api) {
      // loss for b: (2b - 1.4)^2, gradient 4(2b - 1.4); SGD from b = 0
      const c1 = { name: 'b', short: 'b', dom: [-0.7, 2.1], ymax: 7.5, xt: [0, 0.7, 1.4], start: 0, opt: 'sgd', lr: 0.125, dt: 0.6, maxSteps: 12,
        L: b => (2 * b - 1.4) ** 2, dL: b => 4 * (2 * b - 1.4), marks: [0.7],
        choices: [0.05, 0.125, 0.25, 0.3].map(v => ({ value: v, label: 'lr ' + v })), value: 0.125, set: v => { c1.lr = v; } };
      // loss for c: (c^2 - 2.25)^2, gradient 4c(c^2 - 2.25); Adam lr 0.1
      const c2 = { name: 'c', short: 'c', dom: [-2.4, 2.4], ymax: 7.5, xt: [-1.5, 0, 1.5], start: 0.1, opt: 'adam', lr: 0.1, dt: 0.08, maxSteps: 110,
        L: c => (c * c - 2.25) ** 2, dL: c => 4 * c * (c * c - 2.25), marks: [-1.5, 1.5],
        choices: [0.1, -0.1, 0].map(v => ({ value: v, label: 'start ' + (v > 0 ? '+' : '') + v })), value: 0.1, set: v => { c2.start = v; } };
      toy(api, el.querySelector('#task-toy1'), c1);
      toy(api, el.querySelector('#task-toy2'), c2);
    },
    notes: `
    <p class="time">2 min</p>
    <p class="say">Two tiny versions of the task: the frozen "model" is a + 2b + c², and its output is 4.65. Left: one unknown with one answer; right: one unknown with two answers. Each curve shows how wrong the output is for every value of the unknown; the magenta dots are the optimiser's steps.</p>
    <p class="do">Left: before each <b>Run</b> ask "land, crawl, bounce or fly off?". lr 0.125 lands on 0.7 in one jump; 0.05 crawls; 0.25 bounces; 0.3 flies off. Right (Adam): start +0.1 → +1.5, start −0.1 → −1.5, both perfect; start 0 never moves (a flat hilltop).</p>
    <p class="ask">We got +1.5, the true answer. Did gradient descent "know" it?</p>
    <p class="ans">No: it rolled into whichever valley was downhill from the start. Two keys open the same lock.</p>
    <p>Left: plain SGD settles only for lr below 0.25.</p>`,
  });

  /* ================================================================
     10. Look at all of it: the 1-D grid
     ================================================================ */
  const ROWS = {"1":{"f":[2.112,2.096,2.079,2.062,2.046,2.029,2.012,1.996,1.979,1.963,1.946,1.929,1.913,1.896,1.879,1.863,1.846,1.83,1.813,1.796,1.78,1.763,1.747,1.729,1.711,1.693,1.675,1.654,1.632,1.61,1.589,1.566,1.542,1.518,1.494,1.47,1.446,1.422,1.397,1.372,1.346,1.321,1.295,1.27,1.244,1.219,1.194,1.166,1.141,1.116,1.091,1.066,1.051,1.039,1.026,1.016,1.015,1.02,1.025,1.029,1.034,1.038,1.042,1.05,1.057,1.064,1.072,1.079,1.092,1.106,1.12,1.134,1.148,1.162,1.176,1.19,1.205,1.219,1.234,1.25,1.268,1.286,1.31,1.334,1.361,1.398,1.44,1.481,1.522,1.563,1.602,1.641,1.68,1.718,1.757,1.796,1.834,1.871,1.908,1.949,1.993,2.038,2.082,2.125,2.168,2.21,2.253,2.296,2.339,2.384,2.433,2.488,2.542,2.597,2.66,2.731,2.803,2.874,2.946,3.02,3.094,3.167,3.241,3.315,3.388,3.462,3.535,3.614,3.694,3.774,3.855,3.935,4.023,4.114,4.205,4.295,4.387,4.482,4.579,4.675,4.772,4.871,4.974,5.076,5.179,5.287,5.401,5.516,5.63,5.744,5.856,5.968,6.078,6.188,6.304,6.421,6.538,6.654,6.77,6.889,7.012,7.134,7.256,7.378,7.501,7.622,7.744,7.866,7.987,8.109,8.23,8.351,8.472,8.599,8.731,8.862,8.993,9.125,9.255,9.383,9.51,9.637,9.764,9.89,10.016,10.143,10.269,10.395,10.521,10.647,10.773,10.899,11.025,11.151,11.275,11.399,11.521,11.643,11.765,11.887,12.01],"y":2.896,"truth":0.865,"roots":[0.865],"gd":0.865},"9":{"f":[-0.526,-0.539,-0.551,-0.564,-0.577,-0.589,-0.602,-0.615,-0.627,-0.64,-0.655,-0.671,-0.687,-0.703,-0.72,-0.736,-0.752,-0.768,-0.784,-0.801,-0.818,-0.838,-0.857,-0.877,-0.896,-0.916,-0.937,-0.957,-0.978,-0.998,-1.019,-1.039,-1.06,-1.081,-1.101,-1.122,-1.142,-1.162,-1.182,-1.202,-1.222,-1.242,-1.262,-1.283,-1.304,-1.324,-1.345,-1.366,-1.387,-1.405,-1.418,-1.432,-1.446,-1.46,-1.474,-1.488,-1.501,-1.515,-1.518,-1.516,-1.515,-1.514,-1.513,-1.511,-1.509,-1.506,-1.503,-1.501,-1.498,-1.495,-1.493,-1.49,-1.487,-1.485,-1.482,-1.479,-1.477,-1.474,-1.457,-1.435,-1.414,-1.395,-1.377,-1.35,-1.321,-1.291,-1.261,-1.227,-1.194,-1.16,-1.127,-1.09,-1.053,-1.016,-0.979,-0.942,-0.905,-0.867,-0.824,-0.778,-0.731,-0.685,-0.641,-0.597,-0.553,-0.51,-0.467,-0.425,-0.382,-0.339,-0.295,-0.248,-0.187,-0.126,-0.06,0.012,0.082,0.152,0.221,0.291,0.361,0.43,0.5,0.569,0.643,0.719,0.796,0.872,0.949,1.025,1.102,1.18,1.258,1.336,1.414,1.492,1.57,1.648,1.726,1.804,1.882,1.96,2.039,2.117,2.195,2.274,2.356,2.447,2.538,2.631,2.724,2.819,2.921,3.023,3.125,3.226,3.328,3.43,3.532,3.639,3.748,3.853,3.956,4.058,4.161,4.263,4.366,4.473,4.581,4.69,4.798,4.907,5.016,5.124,5.233,5.342,5.455,5.568,5.681,5.793,5.906,6.019,6.132,6.245,6.358,6.471,6.584,6.697,6.81,6.924,7.038,7.152,7.267,7.381,7.496,7.61,7.724,7.839,7.953,8.067,8.182],"y":-1.024,"truth":-0.361,"roots":[-3.487,-0.361],"gd":-0.361},"140":{"f":[1.276,1.242,1.207,1.173,1.139,1.104,1.07,1.04,1.01,0.978,0.947,0.915,0.883,0.85,0.818,0.786,0.753,0.72,0.688,0.655,0.622,0.587,0.552,0.517,0.482,0.447,0.411,0.376,0.341,0.306,0.271,0.236,0.2,0.165,0.13,0.095,0.061,0.029,-0.002,-0.034,-0.066,-0.097,-0.129,-0.16,-0.192,-0.217,-0.241,-0.264,-0.287,-0.311,-0.335,-0.359,-0.384,-0.409,-0.434,-0.458,-0.481,-0.504,-0.526,-0.548,-0.57,-0.593,-0.615,-0.637,-0.658,-0.678,-0.7,-0.718,-0.737,-0.755,-0.769,-0.778,-0.784,-0.783,-0.782,-0.781,-0.78,-0.779,-0.777,-0.776,-0.775,-0.774,-0.773,-0.77,-0.769,-0.767,-0.765,-0.764,-0.766,-0.762,-0.755,-0.749,-0.742,-0.736,-0.729,-0.719,-0.703,-0.687,-0.666,-0.645,-0.62,-0.595,-0.569,-0.544,-0.52,-0.496,-0.468,-0.439,-0.411,-0.385,-0.358,-0.325,-0.287,-0.249,-0.21,-0.172,-0.134,-0.095,-0.057,-0.018,0.021,0.061,0.1,0.145,0.197,0.256,0.317,0.378,0.44,0.501,0.564,0.629,0.695,0.76,0.825,0.889,0.953,1.019,1.09,1.16,1.23,1.298,1.367,1.437,1.513,1.594,1.675,1.756,1.837,1.916,1.995,2.074,2.154,2.239,2.324,2.408,2.495,2.586,2.677,2.767,2.858,2.949,3.041,3.132,3.227,3.334,3.444,3.554,3.664,3.774,3.884,3.994,4.104,4.214,4.324,4.434,4.544,4.654,4.765,4.876,4.987,5.098,5.209,5.321,5.432,5.554,5.678,5.803,5.927,6.051,6.175,6.3,6.428,6.561,6.694,6.826,6.959,7.091,7.223,7.355,7.486],"y":-0.612,"truth":-1.906,"roots":[-1.906,0.016],"gd":0.016}};
  Deck.slide({
    id: 'task-grid',
    title: 'One unknown? Look at all of it',
    html: `
    <h2>One unknown? Try every value at once</h2>
    <div class="row" style="align-items:flex-start;gap:72px">
      <div id="task-grid-cv"></div>
      <div class="gridside" id="task-grid-side"></div>
    </div>`,
    init(el, api) {
      const W = 1080, H = 700;
      const cv = Plot.canvas(el.querySelector('#task-grid-cv'), W, H);
      const side = el.querySelector('#task-grid-side');
      let cur = '9';
      const sx = Plot.scale(-5, 5, 80, W - 20);
      const rr = UI.row(side);
      const rN = UI.readout(rr, 'answers'), rG = UI.readout(rr, 'Adam from 0');
      const rr2 = UI.row(side);
      const rT = UI.readout(rr2, 'true value');
      UI.choice(side, [{ value: '1', label: 'row 1' }, { value: '9', label: 'row 9' }, { value: '140', label: 'row 140' }], cur, v => { cur = v; draw(); });
      const note = document.createElement('div');
      note.className = 'live-hint';
      note.innerHTML = '<b>33%</b> of rows have two answers<br>(our replica)<br><br><code class="ic">torch.linspace(-5, 5, 2001)</code>';
      side.appendChild(note);
      function draw() {
        const C = Plot.colors(), ctx = cv.ctx, R = ROWS[cur];
        cv.clear();
        const lo = Math.floor(Math.min(...R.f, R.y) - 0.5), hi = Math.ceil(Math.min(Math.max(...R.f), lo + 12) + 0.5);
        const sy = Plot.scale(lo, hi, H - 60, 20);
        Plot.axes(ctx, sx, sy, { xt: [-4, -2, 0, 2, 4], yt: Plot.ticks(lo, hi, 4), font: 28, grid: true, zero: false });
        Plot.text(ctx, 'missing input z', W - 20, sy(lo) - 14, { size: 30, align: 'right', weight: 700 });
        Plot.text(ctx, 'model output', sx.range[0] + 12, 24, { size: 30, base: 'top', color: C.ink });
        ctx.save(); Plot.clip(ctx, sx.range[0], 0, W, H - 60);
        // target y
        ctx.strokeStyle = C.muted; ctx.lineWidth = 3; ctx.setLineDash([12, 10]);
        ctx.beginPath(); ctx.moveTo(sx.range[0], sy(R.y)); ctx.lineTo(sx.range[1], sy(R.y)); ctx.stroke(); ctx.setLineDash([]);
        // the model's output as z sweeps the grid
        ctx.strokeStyle = C.ink; ctx.lineWidth = 5; ctx.lineJoin = 'round';
        ctx.beginPath();
        R.f.forEach((v, i) => { const x = sx(-5 + i * 0.05); i ? ctx.lineTo(x, sy(v)) : ctx.moveTo(x, sy(v)); });
        ctx.stroke();
        ctx.restore();
        Plot.text(ctx, 'known y', sx.range[1] - 6, sy(R.y) - 12, { size: 28, align: 'right', color: C.muted });
        // Adam from 0: an arrow along the target line from 0 to where it stopped
        const gy = sy(R.y) + 46;
        if (Math.abs(R.gd) > 0.12) Plot.arrow(ctx, sx(0), gy, sx(R.gd), gy, { color: C.grad, width: 5, head: 20 });
        Plot.dot(ctx, sx(0), gy, 8, C.grad, C.paper);
        // roots (every crossing) and the true value
        R.roots.forEach(r => Plot.dot(ctx, sx(r), sy(R.y), 12, C.paper, C.ink));
        ctx.save(); ctx.strokeStyle = C.ok; ctx.lineWidth = 5;
        ctx.beginPath(); ctx.arc(sx(R.truth), sy(R.y), 22, 0, 2 * Math.PI); ctx.stroke(); ctx.restore();
        Plot.text(ctx, '✓ true', sx(R.truth), sy(R.y) - 34, { size: 28, align: 'center', color: C.ok, weight: 700 });
        rN.set(R.roots.length);
        const ok = Math.abs(R.gd - R.truth) < 0.01;
        rG.set(`${R.gd.toFixed(2)} ${ok ? '<span class="ok">✓</span>' : '<span class="bad">✗</span>'}`);
        rT.set(R.truth.toFixed(2));
      }
      draw();
      api.onTheme(draw);
    },
    notes: `
    <p class="time">1.5 min</p>
    <p class="say">In the real task each row has only one unknown number. So instead of walking downhill, you can simply try every value: 2,001 values between −5 and 5, for all 1,000 rows at once, in about a second. Then you see every answer, not just the one gradient descent happened to find.</p>
    <p class="do">The black curve is the real replica network's output for one row as we sweep the missing input; the dashed line is the known output y. Every crossing (white circle) is an exact answer. The magenta arrow is where Adam ends when it starts at 0. The green ring is the true value.</p>
    <ul>
      <li><b>row 1</b>: one crossing. Adam finds it. Easy.</li>
      <li><b>row 9</b>: two crossings, at −3.49 and −0.36. Adam from 0 stops at the near one, which happens to be right.</li>
      <li><b>row 140</b>: two crossings, at −1.91 and +0.02. Adam from 0 stops at +0.02 with a perfect fit, but the truth was −1.91.</li>
    </ul>
    <p class="ask">In row 140 the fit is perfect at both crossings. How could you decide which one to submit?</p>
    <p class="ans">Use other information, a "prior": which values are typical for this column (look at the other rows, or at how this column correlates with the other columns), or submit something in between when you are unsure, because the score is squared error. That is where the last points of the task are hidden; the basic method already gets about 98 out of 100.</p>
    <p>Numbers from our ReLU replica: 330 of 1,000 rows have two answers in [−5, 5]. Almost all of the remaining error of plain Adam comes from about 15 rows where it picks the wrong one.</p>`,
  });

  /* ================================================================
     11. The skeleton with TODOs
     ================================================================ */
  const SKEL = `
    model = torch.jit.load("model.pt").eval()
    for p in model.parameters():
        p.requires_grad_(False)       # frozen
    k = ...                           # TODO: zero column
    L, R = X[:, :k], X[:, k+1:]
    z = torch.zeros(N, requires_grad=True)
    opt = torch.optim.Adam([z], lr=...)   # TODO
    for step in range(...):               # TODO
        Xz = torch.cat([L, z[:, None], R], 1)
        loss = ((model(Xz)[:, 0] - y)**2).sum()
        opt.zero_grad(); loss.backward(); opt.step()
    # TODO: residuals? grid? which answer?`;
  Deck.slide({
    id: 'task-code',
    title: 'Skeleton code with TODOs',
    html: `
    <h2>Your starting point: fill the TODOs</h2>
    <div class="t-code">
      ${Code.py(SKEL, { hl: '1:1-3 2:4-6 3:7 4:9-10 5:12', cls: 't-skel' })}
      <div class="stack t-effect">
        <div data-only="1"><span class="big2">frozen</span>
          <svg class="dg" viewBox="0 0 120 90" width="120" height="90">${lock(60, 40)}</svg></div>
        <div data-only="2"><span class="big2 grad">only z learns</span></div>
        <div data-only="3"><span class="big2">lr ≈ 0.1</span>
          <div><div class="barlab">lr 0.001 · 500 steps → MSE 0.43</div><div class="bar" style="width:${0.433 / 0.433 * 520}px"></div></div>
          <div><div class="barlab">lr 0.1 · 500 steps → MSE 0.024</div><div class="bar" style="width:${0.0236 / 0.433 * 520}px"></div></div></div>
        <div data-only="4"><span class="big2">[:, 0]</span>
          <span><span class="xx">✗</span> without it: (N, N), MSE 2.44</span></div>
        <div data-only="5"><span class="big2">then check</span></div>
      </div>
    </div>`,
    notes: `
    <p class="time">1.5 min</p>
    <p class="say">The shape of a first solution, incomplete on purpose: the three dots are for you. X, y and N come from data.csv, as float32 tensors.</p>
    <p class="do">→ 1: load and freeze the weights; they never change. → 2: find the zero column; only z learns, one unknown per row, all 1,000 rows at once. → 3: Adam moves each value about lr per step: lr 0.001 barely moves (MSE 0.43), lr 0.1 gives 0.024. → 4: the model gives (N, 1), y is (N,); without [:, 0], (N, 1) − (N,) silently becomes an N × N table (MSE 2.44, worse than zeros). → 5: check each row's leftover error; a grid of values (torch.linspace) shows rows with two answers.</p>
    <p class="ask">Why .sum() over rows and not .mean()?</p>
    <p class="ans">Each row is its own problem; with plain SGD, .mean() shrinks each row's gradient 1,000-fold. Adam does not care.</p>
    <p>Our replica: all zeros scores 0 (MSE 0.968); this skeleton reaches 0.024 in under a second.</p>`,
  });

  /* ================================================================
     12. How it's scored
     ================================================================ */
  const sx100 = v => 60 + v * 15.4;                   // score 0..100 on a straight ruler
  const sc = m => Math.max(0, Math.min(100, (0.968 - m) / (0.968 - 0.0045) * 100));
  const rmark = (m, label, mse, step, up) => {
    const x = sx100(sc(m)), s = sc(m), anchor = s > 99 ? 'end' : s < 1 ? 'start' : 'middle';
    const tx = s > 99 ? x + 20 : s < 1 ? x - 20 : x;
    return `<g data-step="${step}">
      <circle cx="${x}" cy="260" r="13" style="fill:var(--ink);stroke:var(--paper);stroke-width:3"/>
      <line x1="${x}" y1="${up ? 170 : 282}" x2="${x}" y2="${up ? 238 : 330}" style="stroke:var(--ink);stroke-width:3"/>
      <text class="lbl" x="${tx}" y="${up ? 40 : 370}" style="font-size:44px;font-weight:700;text-anchor:${anchor}">${s <= 0 || s >= 100 ? Math.round(s) : s.toFixed(1)}</text>
      <text class="lbl-s" x="${tx}" y="${up ? 92 : 420}" style="font-size:30px;fill:var(--ink);text-anchor:${anchor}">${label}</text>
      <text class="lbl-s" x="${tx}" y="${up ? 136 : 462}" style="font-size:28px;text-anchor:${anchor}">MSE ${mse}</text></g>`;
  };
  Deck.slide({
    id: 'task-ruler',
    title: 'How the inversion task is scored',
    html: `
    <h2>Score: zeros get 0, the best got 100</h2>
    <svg class="dg" viewBox="0 0 1728 500" width="1728" height="500" role="img" aria-label="score ruler from 0 to 100 with four submissions on it">
      <line x1="${sx100(0)}" y1="260" x2="${sx100(100)}" y2="260" style="stroke:var(--ink);stroke-width:4"/>
      ${[0, 25, 50, 75, 100].map(v => `<line x1="${sx100(v)}" y1="246" x2="${sx100(v)}" y2="274" style="stroke:var(--muted);stroke-width:3"/>`).join('')}
      <text class="lbl-s" x="${sx100(25)}" y="306" style="font-size:28px">25</text>
      <text class="lbl-s" x="${sx100(75)}" y="306" style="font-size:28px">75</text>
      ${rmark(0.968, 'all zeros', '0.968', 1, true)}
      ${rmark(0.433, 'Adam lr 0.001', '0.433', 2, true)}
      ${rmark(0.0236, 'Adam lr 0.1', '0.024', 3, true)}
      ${rmark(0.0045, 'best known', '0.0045', 4, false)}
    </svg>
    <p class="lead" data-step="5">The last two points are all about rows with two answers.</p>`,
    notes: `
    <p class="time">45 s</p>
    <p class="say">How the inversion task is scored: you submit your recovered column and they compute the mean squared error against the truth. Submitting all zeros gives the baseline error 0.968, which scores 0. The best known solution has error 0.0045, which scores 100. In between, the score is a straight line in the error.</p>
    <p class="do">→ 1–4: zeros 0 points; Adam with lr 0.001 about 55; Adam with lr 0.1 about 98 (on our replica); best known 100. Point at the tiny gap between 98 and 100: on the ruler it is nothing, but the error (MSE) has to shrink five-fold, from 0.024 to 0.0045. → 5: that is where the rows with two answers come in.</p>
    <p>Formula for the coach: score = (0.968 − MSE) / (0.968 − 0.0045) × 100, clipped to [0, 100]. Our replica numbers: 0.433 → 55.5, 0.0236 → 98.0, the full recipe (all answers per row, weighted by a learned prior, submit the weighted mean) 0.0145 → 99.0. The shape bug (MSE 2.44) scores 0.</p>
    <p class="ask">You have a 98. Is it worth two more hours?</p>
    <p class="ans">Only if other tasks are done. The cheap 98 comes in 15 minutes; the last 2 points need careful thinking about rows with two answers. Olympiad strategy: bank the safe score first on every task, then polish.</p>`,
  });

  /* ================================================================
     13. Plan before typing (A9)
     ================================================================ */
  Deck.slide({
    id: 'task-plan',
    title: 'Plan before typing',
    html: `
    <span class="tag tag-pair">pairs · 3 min</span>
    <h2>Write your first three experiments</h2>
    <div class="t10">
      <div class="plan">
        <div><h3>Kobe</h3>
          <div class="stack">
            <ol data-until="1"><li><span class="blank"></span></li><li><span class="blank"></span></li><li><span class="blank"></span></li></ol>
            <ol data-step="1"><li>baselines: always "miss", logistic regression</li><li>scaled 2-8-8-1, Adam 1e-3, val split</li><li>lr 3e-3 · 1e-2 × 3 seeds, then fold + zip</li></ol>
          </div></div>
        <div><h3>Inversion</h3>
          <div class="stack">
            <ol data-until="1"><li><span class="blank"></span></li><li><span class="blank"></span></li><li><span class="blank"></span></li></ol>
            <ol data-step="1"><li>zeros baseline, find the column</li><li>Adam lr 0.1 on z only, 500 steps</li><li>residuals + grid: count the answers</li></ol>
          </div></div>
      </div>
      <div class="side"><div id="task-plan-timer"></div></div>
    </div>`,
    init(el, api) { Widgets.timer(api, el.querySelector('#task-plan-timer'), 3); },
    notes: `
    <p class="time">3.5 min</p>
    <p class="say">Plan before you type. In pairs, write the first three experiments for each task, in order, in three minutes. One writes, the other checks: is there a baseline, a validation split, a number that says it worked?</p>
    <p class="do">Done when: three experiments per task, in order. Press <b>Start</b> and walk around; look for plans with a big model and no baseline. At 0:00 ask two pairs to read a plan, then press → for the example.</p>
    <p class="ask">Does your first experiment give a number to compare everything else with?</p>
    <p class="ans">It should: for Kobe, "always miss" (55.3%) and a straight-line model (about 59%); for inversion, all zeros (MSE 0.968). A good Kobe net then lands near 61%.</p>
    <p>Short on time: do it for Kobe only.</p>`,
  });
}
