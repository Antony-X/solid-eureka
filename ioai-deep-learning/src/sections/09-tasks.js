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
.sec-task .eqs { font-family: var(--font-math); font-size: 48px; }
.sec-task .eqs i { font-style: italic; }
.sec-task .toys { display: grid; grid-template-columns: 1fr 1fr; gap: 96px; flex: 1; min-height: 0; }
.sec-task .toy { display: flex; flex-direction: column; gap: 16px; }
.sec-task .toy h3 { font-size: 40px; }
.sec-task .toy .ui-row { gap: 20px 24px; }
.sec-task .toy-read { font-family: var(--font-mono); font-size: 30px; color: var(--muted); min-width: 9em; }
.sec-task .toy-read b { color: var(--grad); font-weight: 700; }
.sec-task .t-code { display: grid; grid-template-columns: 1056px 1fr; gap: 72px; align-items: start; flex: 1; }
.sec-task .t-effect { align-self: stretch; }
.sec-task .t-effect > div { display: flex; flex-direction: column; gap: 20px; font-size: 34px; line-height: 1.25; }
.sec-task .t-effect .big2 { font-family: var(--font-display); font-weight: 800; font-size: 60px; line-height: 1; }
.sec-task .bar { height: 40px; background: var(--ink); }
.sec-task .barlab { font-family: var(--font-mono); font-size: 28px; color: var(--muted); }
.sec-task .plan { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; }
.sec-task .plan h3 { border-bottom: 3px solid var(--ink); padding-bottom: 10px; margin-bottom: 18px; }
.sec-task .plan ol { margin: 0; padding-left: 1.3em; font-size: 34px; line-height: 1.3; display: flex; flex-direction: column; gap: 22px; }
.sec-task .plan .blank { display: block; border-bottom: 3px dashed var(--rule); height: 44px; }
.sec-task .t10 { display: grid; grid-template-columns: 1056px 1fr; gap: 96px; flex: 1; align-items: start; }
.sec-task .gridside { display: flex; flex-direction: column; gap: 30px; }
.sec-task .gridside .ui-readout-value { font-size: 40px; }
.sec-task .live-hint { font-size: 30px; color: var(--muted); line-height: 1.35; }
.sec-task .live-hint b { color: var(--ink); }
.sec-task .courtnet-side { gap: 30px; }
.sec-task .courtnet-side .pg-readouts { gap: 20px 36px; }
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
      <li><b>While:</b> BCEWithLogitsLoss for yes/no (the model outputs a raw score, no sigmoid inside the training model); Adam 1e-3 to start, then try 3e-3 and 1e-2; judge by the validation loss.</li>
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
    <p class="say">Task one. Kobe Bryant played 20 seasons for the Lakers and took 30,697 shots that the NBA logged with their position on the court. You get 25,000 of them, each with "went in" or "missed". Your job: from the position alone, predict whether a shot goes in.</p>
    <p class="do">Point at the court: every dot is one shot seen from above, the hoop at the bottom. Orange = made, blue = missed (800 of his shots shown). Let them notice the pile of shots right under the basket.</p>
    <p>Where the task comes from: problem 1 of round 2 of China's national AI olympiad (NOAI 2024), reused as question 1 of the NOAI 2025 teaching test; the platform Bohrium labels that test "APOAI2025 Mock". The 25,000 rows are exactly the labelled shots of Kaggle's 2016 "Kobe Bryant Shot Selection" competition, shuffled and renumbered.</p>
    <p>Be respectful: Kobe died in a helicopter crash in January 2020 with his daughter Gianna and seven others. Some students may feel strongly about him; mention it calmly if it comes up, and no jokes. A useful hook instead: he called his work ethic "Mamba mentality", obsessing over the boring details. For us that means seeds, scaling, baselines and validation.</p>`,
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
    <svg class="dg" viewBox="0 0 1728 310" width="1728" height="310" role="img" aria-label="loc_x, loc_y into Linear 2 to 8, activation, Linear 8 to 8, activation, Linear 8 to 1, Sigmoid">
      ${P.s}
      <text class="lbl-s" x="0" y="178" style="text-anchor:start">raw, in tenths</text>
      <text class="lbl-s" x="0" y="212" style="text-anchor:start">of a foot</text>
      <text class="lbl-s" x="0" y="250" style="text-anchor:start">x −250…248</text>
      <text class="lbl-s" x="0" y="284" style="text-anchor:start">y −44…791</text>
      <g data-step="1">
        <path d="M${lin[0][0]},136 v14 H${lin[2][1]} v-14" style="fill:none;stroke:var(--ink);stroke-width:3"/>
        <text class="lbl" x="${(lin[0][0] + lin[2][1]) / 2}" y="196" style="font-size:34px">≤ 3 Linear layers · ≤ 8 neurons each</text>
        <text class="lbl-s" x="${(lin[0][0] + lin[2][1]) / 2}" y="242" style="font-size:30px">2-8-8-1 = 105 parameters is the biggest legal net</text>
      </g>
    </svg>
    <div class="cards">
      <div class="card" data-step="2"><h3>act = only these</h3>
        <span class="mono">nn.ReLU · nn.Sigmoid · nn.Tanh<br>nn.ELU · nn.LeakyReLU · nn.PReLU</span>
        <span><span class="xx">✗</span> <span class="mono">nn.Sequential</span> → score 0</span></div>
      <div class="card" data-step="3"><h3>submission.zip</h3>
        <span class="mono">submission_model.py</span><span class="small muted">the class, its imports</span>
        <span class="mono">submission_dic.pth</span><span class="small muted">the trained state_dict</span></div>
      <div class="card" data-step="4"><h3>score = test accuracy</h3>
        <div class="boards"><span>board A · live</span><span>board B · final</span></div>
        <span class="small muted">each board: half the test set, ≈ 2,500 shots</span></div>
    </div>`,
    notes: `
    <p class="time">2 min</p>
    <p class="say">The rules are strict on purpose. The network sees only two numbers per shot, loc_x and loc_y, and they arrive raw: tenths of a foot, with the hoop at zero. The statement claims they are "already normalized". That is false: x goes from −250 to 248 and y from −44 to 791.</p>
    <p class="do">→ 1: the size limit. At most 3 linear layers with at most 8 neurons each, so 2-8-8-1 is the biggest legal network: 105 numbers.</p>
    <p class="do">→ 2: activations only from this list, placed after linear layers. Build the layers as named attributes (self.fc1, self.fc2, self.fc3). nn.Sequential scores 0 because the checker cannot see inside it.</p>
    <p class="do">→ 3: you upload a zip with two files, the model class and the trained weights. → 4: the score is plain accuracy on hidden test shots. Board A is shown live during the contest; board B, the other half, is the final score.</p>
    <p class="ask">Can you feed the distance to the rim as a third input? The data file has a column shot_distance.</p>
    <p class="ans">No. The input must be exactly loc_x and loc_y; the grader passes two columns, so a three-input model would crash. It would not help anyway: shot_distance is just the distance computed from x and y, rounded down to whole feet.</p>
    <p>Background: the baseline notebook names the class MyModel with an empty constructor; keep that. Mixing activations (ELU then ReLU) is fine. A final nn.Sigmoid is what the baseline does, so the grader most likely thresholds the output at 0.5; keep it.</p>`,
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
    <div class="row" style="gap:32px"><span class="tag tag-predict">predict</span><span class="lead muted">write down one number</span></div>
    <h2>What accuracy can the best model reach?</h2>
    <svg class="dg" viewBox="0 0 1728 450" width="1728" height="450" role="img" aria-label="accuracy ruler from 50 to 65 percent">
      <line x1="60" y1="236" x2="1660" y2="236" style="stroke:var(--ink);stroke-width:4"/>
      ${[50, 55, 60, 65].map(v => `<line x1="${ax(v)}" y1="222" x2="${ax(v)}" y2="250" style="stroke:var(--muted);stroke-width:3"/><text class="lbl-s" x="${ax(v)}" y="276" style="font-size:28px">${v}%</text>`).join('')}
      ${mark(55.3, true, '55.3%', 'always "miss"', 1, 'muted')}
      ${mark(58.6, false, '58.6%', 'best straight line', 2)}
      <g data-step="3">
        <rect x="${ax(60.5)}" y="214" width="${ax(61) - ax(60.5)}" height="44" style="fill:var(--ink)"/>
        <text class="lbl" x="${ax(60.75)}" y="92" style="font-size:40px">≈ 61%</text>
        <text class="lbl-s" x="${ax(60.75)}" y="136" style="font-size:30px">legal 2-8-8-1 = the ceiling</text>
        <line x1="${ax(60.75)}" y1="160" x2="${ax(60.75)}" y2="210" style="stroke:var(--ink);stroke-width:4"/>
      </g>
      <g data-step="4">
        <rect x="${ax(61.5)}" y="292" width="${ax(63.5) - ax(61.5)}" height="16" style="fill:var(--muted);opacity:.5"/>
        <text class="lbl" x="${ax(62.5) + 30}" y="344" style="font-size:40px">62–62.5%</text>
        <text class="lbl-s" x="${ax(62.5) + 30}" y="388" style="font-size:30px">best on the leaderboard</text>
        <text class="lbl-s" x="${ax(62.5) + 30}" y="424" style="font-size:30px">luck: ± 1 point</text>
      </g>
    </svg>
    <p class="lead" data-step="5">Shots right at the rim go in only <b>62.5%</b> of the time.</p>`,
    notes: `
    <p class="time">1.5 min</p>
    <p class="say">Before anyone trains anything: what is the best accuracy possible on this task? Everybody write one number on paper. Do not look at your neighbour.</p>
    <p class="do">Wait 20 seconds. Take two or three guesses aloud (students usually say 70–90%). Then reveal one step per press:</p>
    <ul>
      <li>→ 1: always say "miss": 55.3%. Free points, zero intelligence.</li>
      <li>→ 2: the best possible straight-line boundary: 58.6%. That is all logistic regression can do, and also all the official baseline (a 2-1-1-1 chain) can do.</li>
      <li>→ 3: a legal 2-8-8-1 trained properly gets about 60.5–61% on validation, and that is the ceiling: boosted trees and nearest-neighbours on the same two numbers also stop at about 61%.</li>
      <li>→ 4: the best honest leaderboard scores were 62.1–62.5%. Each board has only about 2,500 shots, so scores wobble by about ±1 point just by luck.</li>
      <li>→ 5: why so low? The labels are coin flips. 4,200 shots were taken at exactly the rim position, and even those went in only 62.5% of the time. No model can know which of them will go in.</li>
    </ul>
    <p class="ask">Your friend gets 60.4% and you get 60.9% on the live board. Who has the better model?</p>
    <p class="ans">You cannot tell. The board noise (about ±1 point) is bigger than the gap. Trust your own validation split, ideally with several seeds, and treat differences below about half a point as ties.</p>`,
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
      <div id="task-rim-court"></div>
    </div>`,
    init(el, api) {
      const BW = 960, BH = 620;
      const cb = Plot.canvas(el.querySelector('#task-rim-bars'), BW, BH);
      const CW = 672, fr = Widgets.courtFrame(0, 0, CW);
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
          tag(ctx, C, 'disc: "made" only within 3 ft → 60.7%', fr.sy(405), false);
        }
        if (k >= 2) {
          // best straight cut on the task data: 0.208 x + 0.978 y = 18.2, "made" below it
          const yAt = x => (18.2 - 0.2079 * x) / 0.9781;
          ctx.save();
          ctx.strokeStyle = C.ink; ctx.lineWidth = 5; ctx.setLineDash([16, 10]);
          ctx.beginPath(); ctx.moveTo(fr.sx(-250), fr.sy(yAt(-250))); ctx.lineTo(fr.sx(250), fr.sy(yAt(250))); ctx.stroke();
          ctx.restore();
          tag(ctx, C, 'dashed: best straight cut → 58.6%', fr.sy(405) + 46, true);
        }
      }
      function tag(ctx, C, t, y, dash) {
        ctx.save(); ctx.font = `700 27px ${C.fontBody}`;
        const w = ctx.measureText(t).width;
        ctx.fillStyle = C.paper; ctx.fillRect(10, y - 21, w + 20, 42);
        ctx.fillStyle = C.ink; ctx.textBaseline = 'middle'; ctx.fillText(t, 20, y);
        ctx.restore();
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
    <div class="row" style="gap:32px"><span class="tag tag-try">try it live</span></div>
    <h2>SGD on raw numbers learns nothing</h2>
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
      api.onLeave(() => w.pause());
    },
    notes: `
    <p class="time">2 min</p>
    <p class="say">This is a legal 2-8-8-1 ReLU network training live on 3,000 of Kobe's shots. Orange background = the net thinks "made", blue = "missed". It starts with plain SGD, learning rate 0.1, on the raw coordinates, exactly as the grader will hand them over.</p>
    <p class="ask">Predict: with raw numbers in the hundreds, what will plain SGD learn?</p>
    <p class="do">1) Click <b>Train</b> (100 epochs, about 5 seconds). Watch accuracy: it sits at 54.6%, the "always miss" value for these 3,000 shots, and the court turns blue everywhere. Huge inputs make huge activations; the ReLUs die and the net settles on a constant.</p>
    <p class="do">2) Click <b>scaled inputs</b>, then <b>Train</b>. Same network, same learning rate, inputs divided by their spread: within a second the orange blob appears around the hoop and accuracy climbs to about 60%.</p>
    <p class="do">3) Click <b>Adam</b> and <b>raw inputs</b>, then <b>Train</b>. Adam also gets to about 60% (after a wobbly start). Adam takes steps of about the same size whatever the gradient size, so it hides the scaling problem. Scale anyway: it makes every learning rate and default behave as designed.</p>
    <p class="ans">Plain SGD on raw coordinates collapses to "always miss"; scaling fixes it; Adam hides the problem.</p>
    <p>Our PyTorch runs agree: SGD + momentum, lr 0.1, raw ReLU inputs collapsed to "always miss" (55.3% on validation) in 3 of 3 seeds, while scaled inputs reached 60.3%; with Adam, raw and scaled were equal. Use the Reset button to restart; the shuffle order changes on each run, so numbers vary by a few tenths. If SGD on raw inputs escapes on some run, say so honestly: it is a lottery, which is exactly the problem.</p>`,
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
    <div class="row" style="gap:64px;align-items:flex-start">
      <div class="col" style="gap:20px">
        <div class="kicker">while training</div>
        <svg class="dg" viewBox="0 0 1000 170" width="1000" height="170" role="img" aria-label="raw x, y, then scaling, then fc1">${R1.s}
          <text class="lbl-s" x="${(R1.pos[1][0] + R1.pos[1][1]) / 2}" y="160">y: −91, ÷ 88</text></svg>
        <div class="kicker" data-step="1">what you submit</div>
        <svg class="dg" viewBox="0 0 1000 170" width="1000" height="170" data-step="1" role="img" aria-label="raw x, y into fc1 with new weights">${R2.s}
          <text class="lbl-s" x="${(R2.pos[1][0] + R2.pos[1][1]) / 2}" y="160">same answers · legal</text></svg>
      </div>
      <div class="col" data-step="2" style="gap:16px;padding-top:56px">
        <div class="kicker">new fc1</div>
        <div class="eqs"><i>W</i>′ = <i>W</i> ÷ std</div>
        <div class="eqs"><i>b</i>′ = <i>b</i> − <i>W</i>′· mean</div>
      </div>
    </div>
    <div class="hint" data-step="3">
      <div><b>✗ maths inside forward()</b>distance, angle, buffers: not "linear + activation"</div>
      <div><b>write submission_model.py first</b>import that class to train</div>
      <div><b>reload the zip and test it</b>raw inputs in, same accuracy out</div>
      <div><b>the board wobbles ± 1 point</b>trust your validation split</div>
    </div>`,
    notes: `
    <p class="time">1.5 min</p>
    <p class="say">Here is the trap. You will train on scaled inputs, because that is the right thing to do. But the grader feeds raw coordinates into your network. So the scaling must live inside the weights. The good news: the scaling is itself a linear operation, so you can merge it into the first linear layer exactly.</p>
    <p class="do">Top row: while training, x has 7 subtracted and is divided by 110 (y: minus 91, divided by 88; these are the means and spreads of the task data). → 1: what you submit has no separate scaling box: the first layer's weights are changed so it gives exactly the same outputs on raw numbers.</p>
    <p class="do">→ 2: the recipe in words: divide each weight by the spread of the input it multiplies; then shift the bias by the new weights times the means. Do not give them code; let them derive it on paper (it is one line of algebra) and check it numerically.</p>
    <p>The algebra, for the coach: fc1 on scaled input is W·((x − μ)/σ) + b = (W/σ)·x + (b − (W/σ)·μ), where "/σ" divides column j of W by σ_j. In PyTorch, inside torch.no_grad(): weight ← weight / std (broadcast over columns), bias ← bias − new_weight @ mean. We checked it: the outputs match to 5 × 10⁻⁷; the reference pipeline gives the same accuracy on raw inputs after folding.</p>
    <p class="do">→ 3: four more hints. Computing distance or angle inside forward() breaks the "only linear layers and activations" rule, and it does not help (we measured no gain). Public notebooks lost everything by training one class and submitting another, so write submission_model.py first and import it. Before uploading, load the zip in a fresh notebook and run it on raw inputs. And do not chase the board: it moves by about one point by pure luck.</p>
    <p class="ask">Why is folding the scaling into fc1 exact, and not just an approximation?</p>
    <p class="ans">Subtracting a mean and dividing by a spread is a linear (affine) step, and a linear step followed by a linear layer is still one linear layer. Nothing is lost.</p>`,
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
    <div class="kicker">task 2 · Operation Inversion: digital restoration of data</div>
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
    <svg class="dg" viewBox="0 0 1728 250" width="1728" height="250" data-step="2" role="img" aria-label="panda plus tiny noise is classified as gibbon">
      ${panda(110, 110, 0.95)}
      <text class="lbl" x="110" y="226">"panda" 57.7%</text>
      <text class="lbl-b" x="300" y="110">+ 0.007 ×</text>
      ${noise(400, 30, 160)}
      <text class="lbl-s" x="480" y="226" style="fill:var(--grad)">input gradient's sign</text>
      <text class="lbl-b" x="650" y="110">=</text>
      ${panda(800, 110, 0.95)}
      <text class="lbl" x="800" y="226" data-step="3">"gibbon" 99.3%</text>
      <text class="lbl-s" x="1000" y="80" style="text-anchor:start;font-size:30px" data-step="3">same trick: DeepDream · style transfer ·</text>
      <text class="lbl-s" x="1000" y="124" style="text-anchor:start;font-size:30px" data-step="3">Fredrikson 2014: dosing model + dose</text>
      <text class="lbl-s" x="1000" y="168" style="text-anchor:start;font-size:30px" data-step="3">→ patient's missing gene = this task</text>
    </svg>`,
    notes: `
    <p class="time">2 min</p>
    <p class="say">Task two, translated from the Georgian statement: "Operation Inversion: digital restoration of data". You get a trained network that is frozen, and a table of rows: the inputs and the network's output y for each row. But one input column was overwritten with zeros. Your job is to recover that column.</p>
    <p class="say">Left is what you know: in training the data is fixed and the gradient moves the weights. → 1: in inversion we flip it. The weights are frozen; the missing input becomes the thing that learns. The gradient of the loss flows back through the same network, but we stop at the input. Same backprop, different target.</p>
    <p class="do">Analogy for students who do not like maths: the model is a frozen lock, and we are turning the key until it opens.</p>
    <p class="do">→ 2: the most famous example of moving inputs with gradients.</p>
    <p class="ask">GoogLeNet says "panda" with 57.7% confidence. Add a noise pattern so small you cannot see it (0.007 times the sign of the input gradient). What does it say now?</p>
    <p class="ans">→ 3: "gibbon", with 99.3% confidence (Goodfellow et al., 2014). The two pandas look identical to us. The noise is exactly what our task uses: the gradient with respect to the input.</p>
    <p>More stories if there is time (one sentence each): DeepDream (Google, 2015) runs gradient ascent on a photo to amplify what a layer sees; style transfer (Gatys 2015) optimises the pixels to match a painting's style. Fredrikson et al. (USENIX Security 2014) took a model that recommends doses of the blood thinner warfarin, plus a patient's age, weight and dose, and recovered the patient's missing genetic marker. That is exactly our task: one hidden input, the other inputs and the output known. It is a privacy attack, and it is just backprop.</p>
    <p>About the task data: our notes come from replicas we built (10 input columns, 1,000 rows, a 10-64-64-1 network saved as model.pt), because the original files were not available to us. Check the column count and file names on the real statement.</p>`,
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
      Plot.text(ctx, 'loss', sx.range[0] + 10, 36, { size: 28, base: 'top', color: C.muted });
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
        ctx.beginPath(); ctx.moveTo(sx(m), sy(0) - 14); ctx.lineTo(sx(m), sy(0) + 14); ctx.stroke(); ctx.restore();
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
    <p class="small muted" style="margin-top:-16px">toy frozen model: <span class="m"><i>f</i> = <i>a</i> + 2<i>b</i> + <i>c</i><sup>2</sup></span> &nbsp;·&nbsp; we know <span class="m"><i>f</i> = 4.65</span></p>
    <div class="toys">
      <div class="toy"><h3>find <i>b</i> (a = 1, c = 1.5): one answer</h3><div id="task-toy1"></div></div>
      <div class="toy"><h3>find <i>c</i> (a = 1, b = 0.7): two answers</h3><div id="task-toy2"></div></div>
    </div>`,
    init(el, api) {
      // loss for b: (2b - 1.4)^2, gradient 4(2b - 1.4); SGD from b = 0
      const c1 = { name: 'b', short: 'b', dom: [-0.7, 2.1], ymax: 7.5, xt: [0, 0.7, 1.4], start: 0, opt: 'sgd', lr: 0.125, dt: 0.6, maxSteps: 12,
        L: b => (2 * b - 1.4) ** 2, dL: b => 4 * (2 * b - 1.4), marks: [0.7],
        choices: [0.05, 0.125, 0.25, 0.3].map(v => ({ value: v, label: 'lr ' + v })), value: 0.125, set: v => { c1.lr = v; } };
      // loss for c: (c^2 - 2.25)^2, gradient 4c(c^2 - 2.25); Adam lr 0.1
      const c2 = { name: 'c', short: 'c', dom: [-2.4, 2.4], ymax: 7.5, xt: [-1.5, 0, 1.5], start: 0.1, opt: 'adam', lr: 0.1, dt: 0.12, maxSteps: 60,
        L: c => (c * c - 2.25) ** 2, dL: c => 4 * c * (c * c - 2.25), marks: [-1.5, 1.5],
        choices: [0.1, -0.1, 0].map(v => ({ value: v, label: 'start ' + (v > 0 ? '+' : '') + v })), value: 0.1, set: v => { c2.start = v; } };
      toy(api, el.querySelector('#task-toy1'), c1);
      toy(api, el.querySelector('#task-toy2'), c2);
    },
    notes: `
    <p class="time">2 min</p>
    <p class="say">Two tiny versions of the task, small enough to see everything. The "frozen model" is a + 2b + c², and we know its output is 4.65. Each picture shows the loss, how wrong the output is, for every value of the unknown. The magenta dots are the optimiser's steps.</p>
    <p class="do">Left (find b, starting from 0): press <b>Run</b> with lr 0.125: one jump and it lands exactly on 0.7. Choose lr 0.05: small careful steps. lr 0.25: it bounces between 0 and 1.4 forever. lr 0.3: each bounce is bigger and it flies off the chart. The step size must fit the steepness of the valley.</p>
    <p class="do">Right (find c, Adam lr 0.1): start +0.1 → it rolls to +1.5. Start −0.1 → it rolls to −1.5. Both give exactly 4.65. Start exactly 0 → it never moves: 0 is the top of the hill, the slope there is exactly zero, so the gradient says nothing.</p>
    <p class="ask">Starting at +0.1 we get +1.5; the true answer was +1.5. Did gradient descent "know" the answer?</p>
    <p class="ans">No. It went to whichever valley was downhill from the start. If the truth had been −1.5 it would have been wrong, with a perfect fit. Two keys open the same lock; the fit cannot tell you which one is right.</p>
    <p>Maths for the coach: left loss (2b − 1.4)², gradient 4(2b − 1.4); one SGD step is b ← b(1 − 8·lr) + 5.6·lr, which converges only if lr < 0.25 (2 divided by the curvature 8) and lands in one step at lr = 1/8. Right loss (c² − 2.25)², gradient 4c(c² − 2.25), zero at c = 0 (a local maximum). All checked in PyTorch: SGD and Adam both stay at exactly 0 from c = 0.</p>`,
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
      ${Code.py(SKEL, { hl: '1:1-3 2:4-6 3:7 4:9-10 5:12', size: 's' })}
      <div class="stack t-effect">
        <div data-only="0"><span class="muted">X, y, N come from data.csv,<br>as float32 tensors</span></div>
        <div data-only="1"><span class="big2">frozen</span><span>the weights never change</span>
          <svg class="dg" viewBox="0 0 120 90" width="120" height="90">${lock(60, 40)}</svg></div>
        <div data-only="2"><span class="big2 grad">only z learns</span><span>one unknown per row, all 1,000 rows at once</span></div>
        <div data-only="3"><span class="big2">lr ≈ 0.1</span><span>Adam moves each value about lr per step</span>
          <div><div class="barlab">lr 0.001 · 500 steps → MSE 0.43</div><div class="bar" style="width:${0.433 / 0.433 * 520}px"></div></div>
          <div><div class="barlab">lr 0.1 · 500 steps → MSE 0.024</div><div class="bar" style="width:${0.0236 / 0.433 * 520}px"></div></div></div>
        <div data-only="4"><span class="big2">[:, 0]</span><span>model gives (N, 1), y is (N,)</span>
          <span class="small"><span class="xx">✗</span> forget it: (N, 1) − (N,) becomes (N, N), MSE 2.44, worse than zeros</span></div>
        <div data-only="5"><span class="big2">then check</span><span>residual of every row · grid of values · pick an answer</span></div>
      </div>
    </div>`,
    notes: `
    <p class="time">1.5 min</p>
    <p class="say">Here is the shape of a first solution. It is not complete on purpose: the three dots are for you. Step through it with me.</p>
    <p class="do">→ 1 (lines 1–3): load the model, put it in eval mode, freeze every weight. → 2 (lines 4–6): find the column that is all zeros; split the other columns off; the missing column z is the only tensor that requires a gradient.</p>
    <p class="do">→ 3 (line 7): the learning rate. Adam moves every value by about lr per step, whatever the gradient. With lr 0.001, 500 steps can move a value by at most 0.5, and the answers are often 1 or 2 away: MSE 0.43. With lr 0.1: 0.024. "1e-3" is a default for weights, not for inputs.</p>
    <p class="do">→ 4 (lines 9–10): glue the columns back together, run the frozen model, compare with y. The [:, 0] matters: the model returns shape (N, 1) and y is (N,). Subtracting them silently makes an N × N table and mixes all rows; our replica then scored MSE 2.44, worse than submitting zeros.</p>
    <p class="do">→ 5 (line 12): after it runs, look at the residual of every row, try the grid from the previous slide, and decide what to do with rows that have two answers.</p>
    <p class="ask">Why .sum() over rows and not .mean()?</p>
    <p class="ans">The rows are independent problems, so each z only feels its own row's error. With Adam it makes no difference (Adam ignores the overall scale of the loss). With plain SGD, .mean() divides every row's gradient by 1,000 and z barely moves (MSE 0.71).</p>
    <p>Checked: this code with k, lr = 0.1 and 500 steps filled in runs on our replica in under a second and gives MSE 0.0236. If the model was saved with TorchScript, torch.jit.load and .eval() work exactly as shown. Freezing with p.requires_grad_(False) matters in torch 2.15: without it, torch.no_grad() still builds a graph for scripted models.</p>`,
  });

  /* ================================================================
     12. How it's scored
     ================================================================ */
  const mx = m => 80 + (Math.log10(1) - Math.log10(m)) / (Math.log10(1) - Math.log10(0.003)) * 1560;  // MSE 1 → 0.003, log
  const sc = m => Math.max(0, Math.min(100, (0.968 - m) / (0.968 - 0.0045) * 100));
  const rmark = (m, label, step, up) => `<g data-step="${step}">
      <circle cx="${mx(m)}" cy="230" r="14" style="fill:var(--ink);stroke:var(--paper);stroke-width:3"/>
      <text class="lbl" x="${mx(m)}" y="${up ? 150 : 310}" style="font-size:38px">${sc(m) <= 0 || sc(m) >= 100 ? Math.round(sc(m)) : sc(m).toFixed(1)}</text>
      <text class="lbl-s" x="${mx(m)}" y="${up ? 104 : 356}" style="font-size:30px">${label}</text></g>`;
  Deck.slide({
    id: 'task-ruler',
    title: 'How the inversion task is scored',
    html: `
    <h2>Score: zeros get 0, the best got 100</h2>
    <svg class="dg" viewBox="0 0 1728 520" width="1728" height="520" role="img" aria-label="score ruler: MSE on a log scale and the score above it">
      <line x1="80" y1="230" x2="1660" y2="230" style="stroke:var(--ink);stroke-width:4"/>
      ${[1, 0.1, 0.01].map(m => `<line x1="${mx(m)}" y1="216" x2="${mx(m)}" y2="244" style="stroke:var(--muted);stroke-width:3"/><text class="lbl-s" x="${mx(m)}" y="${m === 1 ? 440 : 440}">${m}</text>`).join('')}
      <text class="lbl-s" x="1660" y="490" style="text-anchor:end;font-size:30px">MSE vs the true column → smaller is better</text>
      <text class="lbl-s" x="80" y="40" style="text-anchor:start;font-size:30px">score out of 100</text>
      ${rmark(0.968, 'all zeros', 1, true)}
      ${rmark(0.433, 'Adam lr 0.001', 2, false)}
      ${rmark(0.0236, 'Adam lr 0.1', 3, true)}
      ${rmark(0.0045, 'best known', 4, false)}
    </svg>
    <p class="lead" data-step="5">The last two points are all about rows with two answers.</p>`,
    notes: `
    <p class="time">45 s</p>
    <p class="say">How the inversion task is scored: you submit your recovered column and they compute the mean squared error against the truth. Submitting all zeros gives the baseline error 0.968, which scores 0. The best known solution has error 0.0045, which scores 100. In between, the score is a straight line in the error.</p>
    <p class="do">→ 1–4: zeros 0 points; Adam with lr 0.001 about 55; Adam with lr 0.1 about 98 (on our replica); best known 100. The axis is logarithmic so you can see that the last two points need the error to shrink five-fold.</p>
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
      <div class="side"><div id="task-plan-timer"></div><p class="small muted">done when: 3 experiments per task, in order</p></div>
    </div>`,
    init(el, api) { Widgets.timer(api, el.querySelector('#task-plan-timer'), 3); },
    notes: `
    <p class="time">3.5 min</p>
    <p class="say">Last thing before you start: plan before you type. In pairs, write down the first three experiments you will run for each task, in order. Three minutes. One of you writes, the other checks: does the plan start with a baseline? Is there a validation split? What number will tell you it worked?</p>
    <p class="do">Click <b>Start</b> on the timer. Walk around; look for plans that start with a big model and no baseline. At 0:00, ask two pairs to read one plan aloud. Then press → to show an example plan and compare.</p>
    <p class="ask">Does your first experiment produce a number you can compare everything else to?</p>
    <p class="ans">It should: for Kobe the "always miss" accuracy (55.3%) and a logistic regression; for inversion the all-zeros submission (MSE 0.968, score 0) and a check that the model reproduces y once the true column is in. Every later experiment is judged against that number.</p>
    <p>Pair activity A9 from the teaching pack. If time is short, do it for one task only (Kobe). The example plan on → is one good order, not the only one: for Kobe, the full validation accuracy should land around 60.5–61%; for inversion, Adam lr 0.1 should leave most rows with a tiny residual.</p>`,
  });
}
