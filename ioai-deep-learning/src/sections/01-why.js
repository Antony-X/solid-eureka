Deck.section({ id: 'why', title: 'Why neural networks?', minutes: 12 });

Deck.css(`
.sec-why .why-side { display: flex; flex-direction: column; gap: 28px; }
.sec-why .why-side .lead { max-width: 16em; }
.sec-why .why-lay { display: grid; grid-template-columns: 768px 1fr; gap: 96px; flex: 1; min-height: 0; align-items: start; }
.sec-why .why-lay3 { display: grid; grid-template-columns: 960px 1fr; gap: 72px; flex: 1; min-height: 0; align-items: start; }
.sec-why .why-lay3 canvas { cursor: grab; }
.sec-why .why-task { font-size: 40px; line-height: 1.35; }
.sec-why .why-task b { font-family: var(--font-mono); color: var(--muted); margin-right: 14px; }
.sec-why .timer-face { font-size: 150px; }
.sec-why .why-res { display: flex; flex-direction: column; gap: 14px; font-size: 40px; }
.sec-why .why-res .mono { font-weight: 600; }
.sec-why .tl { display: grid; grid-template-columns: repeat(4, 1fr); gap: 48px; flex: 1; min-height: 0; align-items: start; }
.sec-why .tl > div { display: flex; flex-direction: column; gap: 16px; border-top: 6px solid var(--ink); padding-top: 24px; }
.sec-why .tl .yr { font-family: var(--font-mono); font-size: 56px; font-weight: 600; line-height: 1; }
.sec-why .tl .ev { font-family: var(--font-display); font-weight: 800; font-size: 44px; line-height: 1.05; }
.sec-why .tl .winter { border-top-color: var(--rule); color: var(--muted); }
.sec-why .quote { font-family: var(--font-math); font-style: italic; font-size: 40px; line-height: 1.25; max-width: 30em; }
.sec-why .pg-neuron { width: 160px !important; height: 160px !important; }
.sec-why .pg-neurons { gap: 24px; }
.sec-why .pg-neurons::before { content: 'hidden'; font-family: var(--font-mono); font-size: 28px; color: var(--muted); }
.sec-why .take { display: flex; flex-direction: column; gap: 72px; justify-content: center; flex: 1; }
.sec-why .chain { display: flex; gap: 28px; align-items: center; font-size: 40px; color: var(--muted); flex-wrap: wrap; }
.sec-why .chain b { color: var(--ink); }
`);

{
  /* ---------- 1 · predict + logistic regression fails, live ---------- */
  Deck.slide({
    id: 'why-line',
    title: 'Can one straight line do it?',
    steps: 1,
    html: `
    <h2>Can one straight line separate the colours?</h2>
    <div id="why-pg1"></div>`,
    init(el, api) {
      const pg = Widgets.playground(api, el.querySelector('#why-pg1'), {
        size: 768, data: 'circle', n: 300, hidden: [], act: 'tanh', opt: 'adam', lr: 0.03,
        steps: 1, controls: ['play', 'reset'], seed: 1, maxEpochs: 600,
      });
      const side = pg.root.querySelector('.pg-side');
      const box = document.createElement('div');
      box.className = 'why-side';
      box.innerHTML = `<span class="tag tag-predict">predict</span>
        <p class="lead" data-step="1">No. Logistic regression = one line. It gets stuck near <b>60%</b>.</p>`;
      side.insertBefore(box, side.firstChild);
    },
    notes: `
    <p class="time">2 min</p>
    <p class="say">Here is a toy dataset: orange dots in the middle, blue dots in a ring around them. You already know logistic regression. Its decision boundary is always one straight line. Question: can one straight line put all the orange dots on one side and all the blue dots on the other?</p>
    <p class="do">Ask for a show of hands: "yes" or "no". Then press <b>Train</b>. Logistic regression trains for a second. Point at the black line and at the readouts: the loss stays near 0.68 and the accuracy stops at about 59%. Press → to show the answer. Press <b>Reset</b> and <b>Train</b> again if someone wants to see it twice: same result.</p>
    <p class="ask">Why can't it do better, however long we train?</p>
    <p class="ans">Every straight line leaves orange and blue dots on both sides. The orange dots are surrounded. Training longer only polishes the best line; it cannot bend it.</p>
    <p>Maths, if a student asks: logistic regression computes p = σ(w₁x₁ + w₂x₂ + b). The 50% boundary is where w₁x₁ + w₂x₂ + b = 0, which is a straight line. Even the best possible hand-placed line only gets 71% here; logistic regression gets 59% because it minimises log loss, not accuracy, and on this nearly symmetric data the best it can do is shrug.</p>`,
  });

  /* ---------- 2 · Kobe: A1 pair activity ---------- */
  // Logistic regression on Kobe's (x, y), all 25,697 labelled Kaggle shots (sklearn, no penalty):
  // logit = 0.0989 − 0.00006·x − 0.00352·y  →  50% line y ≈ 28.1 − 0.017·x (tenths of feet), accuracy 58.1%.
  // Rule "made iff within 3 ft (r ≤ 30)": accuracy 61.0%. Always "miss": 55.4%.
  const BARS = [['0–3', 62.8], ['3–10', 44.2], ['10–16', 43.1], ['16–24', 39.8], ['24–30', 33.7], ['30+', 6.1]];
  const barsSVG = (() => {
    const W = 780, H = 430, x0 = 40, base = 360, top = 40, k = (base - top) / 70, bw = 96, gap = 26;
    let s = `<svg class="dg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Kobe's make rate by distance">`;
    BARS.forEach(([lab, v], i) => {
      const x = x0 + i * (bw + gap), h = v * k;
      s += `<rect x="${x}" y="${base - h}" width="${bw}" height="${h}" style="fill:var(--c1)"/>`;
      const inside = h > 70;
      s += `<text class="lbl" x="${x + bw / 2}" y="${inside ? base - h + 30 : base - h - 24}" style="${inside ? 'fill:var(--paper)' : ''}">${Math.round(v)}%</text>`;
      s += `<text class="lbl-s" x="${x + bw / 2}" y="${base + 30}">${lab}</text>`;
    });
    const y50 = base - 50 * k;
    s += `<line x1="${x0 - 10}" y1="${y50}" x2="${x0 + 6 * (bw + gap)}" y2="${y50}" style="stroke:var(--ink);stroke-width:3;stroke-dasharray:12 10"/>`;
    s += `<text class="lbl" x="${x0 + 6 * (bw + gap) + 10}" y="${y50}" style="text-anchor:start">50%</text>`;
    s += `<line x1="${x0 - 10}" y1="${base}" x2="${x0 + 6 * (bw + gap) - gap + 10}" y2="${base}" style="stroke:var(--muted);stroke-width:2.5"/>`;
    s += `<text class="lbl-s" x="${x0 + 3 * (bw + gap) - gap / 2}" y="${base + 64}">feet from the rim</text>`;
    return s + '</svg>';
  })();

  Deck.slide({
    id: 'why-kobe',
    title: 'Kobe: where would one line go?',
    html: `
    <h2>Kobe: where would one line go?</h2>
    <div class="why-lay">
      <div id="why-court"></div>
      <div class="stack">
        <div class="why-side" data-only="0">
          <span class="tag tag-pair">pairs · 2 min</span>
          <div class="why-task"><div><b>1</b>Shade where Kobe scores.</div><div><b>2</b>Draw the best single straight line.</div></div>
          <div id="why-timer"></div>
        </div>
        <div class="why-side" data-only="1 2 3">
          <p class="small muted">Kobe's shots that went in</p>
          ${barsSVG}
          <div class="why-res">
            <div data-step="2"><span class="mono">58%</span> one straight line</div>
            <div data-step="3"><span class="mono">61%</span> a circle round the rim</div>
          </div>
        </div>
      </div>
    </div>`,
    init(el, api) {
      const host = el.querySelector('#why-court');
      const fr = Widgets.courtFrame(0, 0, 768);
      const cv = Plot.canvas(host, 768, Math.ceil(fr.h));
      Widgets.timer(api, el.querySelector('#why-timer'), 2);
      const lineY = x => 28.1 - 0.017 * x;
      const label = (ctx, C, txt, x, y) => {   // text on a paper chip so dots never hide it
        ctx.save(); ctx.font = `700 30px ${C.fontBody}`;
        const w = ctx.measureText(txt).width + 20;
        ctx.fillStyle = C.paper; ctx.fillRect(x - w / 2, y - 22, w, 44);
        ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.strokeRect(x - w / 2, y - 22, w, 44);
        ctx.restore();
        Plot.text(ctx, txt, x, y, { size: 30, weight: 700, align: 'center', base: 'middle' });
      };
      const draw = () => {
        const C = Plot.colors(), ctx = cv.ctx, k = api.step;
        cv.clear();
        if (k >= 2) {   // the "made" side of the line
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(fr.sx(-250), fr.sy(lineY(-250))); ctx.lineTo(fr.sx(250), fr.sy(lineY(250)));
          ctx.lineTo(fr.sx(250), fr.sy(-47.5)); ctx.lineTo(fr.sx(-250), fr.sy(-47.5)); ctx.closePath();
          ctx.fillStyle = Plot.alpha(C.c1, 0.22); ctx.fill();
          ctx.restore();
        }
        ctx.save();
        ctx.lineWidth = 2;
        for (let i = 0; i < 800; i++) {
          const [x, y] = KOBE.X[i];
          ctx.beginPath(); ctx.arc(fr.sx(x), fr.sy(y), 6, 0, 2 * Math.PI);
          ctx.fillStyle = KOBE.Y[i] ? C.c1 : C.c0; ctx.fill(); ctx.strokeStyle = C.paper; ctx.stroke();
        }
        ctx.restore();
        Widgets.drawCourt(ctx, fr, { color: C.ink, width: 3 });
        if (k >= 2) {
          ctx.save(); ctx.strokeStyle = C.ink; ctx.lineWidth = 5;
          ctx.beginPath(); ctx.moveTo(fr.sx(-250), fr.sy(lineY(-250))); ctx.lineTo(fr.sx(250), fr.sy(lineY(250))); ctx.stroke();
          ctx.restore();
          label(ctx, C, 'one line', fr.sx(165), fr.sy(lineY(165)) - 30);
        }
        if (k >= 3) {
          ctx.save(); ctx.strokeStyle = C.ink; ctx.lineWidth = 5;
          const r = 30 * Math.abs(fr.sx(1) - fr.sx(0));
          ctx.beginPath(); ctx.arc(fr.sx(0), fr.sy(0), r, 0, 2 * Math.PI); ctx.stroke();
          ctx.restore();
          label(ctx, C, '3 ft circle', fr.sx(-105), fr.sy(-22));
        }
      };
      draw();
      api.onStep(draw);
      api.onTheme(draw);
    },
    notes: `
    <p class="time">3 min</p>
    <p class="say">Now real data: 800 of Kobe Bryant's shots, orange went in, blue missed. The hoop is at the bottom. In pairs: one of you shades where Kobe scores most, the other draws the single straight line that best splits makes from misses, the way logistic regression would. Two minutes.</p>
    <p class="do">Press <b>Start</b> on the timer. Walk around and look at the sketches. When time is up press → three times: (1) the make-rate bars, (2) the best straight line, (3) the circle round the rim.</p>
    <p class="ask">After step 1: what do the bars tell you?</p>
    <p class="ans">His chance drops the further he is from the rim: 63% within 3 feet, about 40% at mid-range, 6% from very far. Only the first bar is above 50%. So "equal chance" lines are arcs around the hoop, not straight lines.</p>
    <p class="ask">After step 2: what is wrong with the straight line?</p>
    <p class="ans">It runs across the whole court about 3 feet in front of the rim. Everything below it is called "made", including corner three-pointers, which go in only about 35% of the time. A line cannot wrap around the hoop. A circle of 3 feet does: 61% correct against 58% for the line (and 55% for always saying "miss").</p>
    <p class="ask">How many straight lines would you need to draw something close to that circle?</p>
    <p class="ans">A few: three make a triangle, four a square, eight an octagon. Keep this in mind: that is exactly what a hidden layer will do.</p>
    <p>Where the numbers come from: all 25,697 labelled shots of the Kaggle data. Make rate by distance 62.8 / 44.2 / 43.1 / 39.8 / 33.7 / 6.1%. Logistic regression on (x, y) predicts "made" below a nearly flat line 2.8 ft in front of the rim and is right 58.1% of the time; the rule "made if within 3 ft" is right 61.0%. 16.8% of all shots are recorded exactly at the rim (dunks and lay-ups), so many dots sit on top of each other there.</p>`,
  });

  /* ---------- 3 · history: XOR and the first AI winter ---------- */
  const xorSVG = `<svg class="dg" viewBox="0 0 240 240" width="300" height="300" role="img" aria-label="XOR: orange at two opposite corners, blue at the other two">
    <rect x="20" y="20" width="200" height="200" style="fill:none;stroke:var(--rule);stroke-width:2.5"/>
    <circle cx="50" cy="190" r="22" class="c0"/><circle cx="190" cy="50" r="22" class="c0"/>
    <circle cx="50" cy="50" r="22" class="c1"/><circle cx="190" cy="190" r="22" class="c1"/>
    <text class="lbl-b" x="120" y="120">?</text></svg>`;
  Deck.slide({
    id: 'why-history',
    title: 'XOR and the first AI winter',
    html: `
    <h2>One layer was not enough: 20 lost years</h2>
    <p class="quote" data-step="1">“…will be able to walk, talk, see, write, reproduce itself and be conscious of its existence.” <span class="tiny">New York Times, 1958</span></p>
    <div class="tl">
      <div data-step="1"><span class="yr">1958</span><span class="ev">Perceptron</span><span class="small muted">one layer learns</span></div>
      <div data-step="2"><span class="yr">1969</span><span class="ev">Minsky &amp; Papert</span>${xorSVG}<span class="small muted">no single line</span></div>
      <div data-step="3" class="winter"><span class="yr">1970s</span><span class="ev">AI winter</span><span class="small">funding dries up</span></div>
      <div data-step="4"><span class="yr">1986</span><span class="ev">Backprop</span>${Widgets.netSVG({ sizes: [2, 2, 1], w: 320, h: 230, r: 28 })}<span class="small muted">hidden layers learn</span></div>
    </div>`,
    notes: `
    <p class="time">2 min</p>
    <p class="say">This problem stopped the whole field once. In 1958 Frank Rosenblatt showed the Perceptron, a single learning layer, basically logistic regression with a hard threshold. The New York Times wrote that the Navy expected it to "walk, talk, see, write, reproduce itself and be conscious of its existence". In 1969 Minsky and Papert proved that one layer cannot even learn XOR: orange in two opposite corners, blue in the other two. No straight line separates them. Money left the field for years. The fix, training networks with hidden layers by backpropagation, became famous in 1986.</p>
    <p class="do">Press → four times, one event per press. Read the quote aloud with a straight face. At 1969, point at the XOR square and ask the question below.</p>
    <p class="ask">Where would you put one straight line to separate the XOR square?</p>
    <p class="ans">Nowhere: any line leaves a blue and an orange dot on the same side. Two lines (a stripe) would do it, which is what a hidden layer with two neurons does. You will build that network yourselves in the next section.</p>
    <p>Get the history right: Minsky and Papert proved the limit for <b>single-layer</b> perceptrons; they knew multi-layer networks could represent XOR but doubted they could be trained. The book was read as a verdict on all neural networks. The Mark I Perceptron (built 1959–60, 400 photocells, weights on motor-driven potentiometers) even had a middle layer, but it was wired randomly and never learned: only the last layer learned. Backprop has a messy history (Linnainmaa 1970, Werbos 1974/1982); Rumelhart, Hinton and Williams made it famous in Nature, 1986. Sad coda: Rosenblatt drowned on his 43rd birthday in 1971 and never saw it.</p>`,
  });

  /* ---------- 4 · fix 1: invent a feature (lift to 3-D) ---------- */
  Deck.slide({
    id: 'why-lift',
    title: 'Fix 1: invent a feature (lift to 3-D)',
    html: `
    <h2>Fix 1: lift the dots, then one flat cut works</h2>
    <div class="why-lay3">
      <div id="why-lift"></div>
      <div class="why-side">
        <p class="lead" data-only="0">Seen from above: the same circle data.</p>
        <p class="lead" data-step="1">Lift each dot by its distance from the centre.</p>
        <p class="lead" data-step="2">Now one flat sheet separates them.</p>
        <p class="lead" data-step="3">Back on the floor, the cut is a circle.</p>
        <p class="lead" data-step="4"><b>But which lift for Kobe's court?</b></p>
        <p class="tiny" data-step="1">drag to rotate</p>
      </div>
    </div>`,
    init(el, api) {
      const D = NN.data.circle(300, 101, 0);
      const W = 960, H = 768, S = 285, ZS = 1.15, CUT = 0.36;   // inner r² ≤ 0.25, outer r² ≥ 0.50
      const cv = Plot.canvas(el.querySelector('#why-lift'), W, H);
      const st = { t: 0, pitch: 90, yaw: 0, plane: 0, ring: 0 };
      const goal = { t: 0, pitch: 90, yaw: 0, plane: 0, ring: 0 };
      const TARGET = [
        { t: 0, pitch: 90, yaw: 0, plane: 0, ring: 0 },
        { t: 1, pitch: 24, yaw: -32, plane: 0, ring: 0 },
        { t: 1, pitch: 24, yaw: -32, plane: 1, ring: 0 },
        { t: 1, pitch: 34, yaw: -32, plane: 1, ring: 1 },
        { t: 1, pitch: 34, yaw: -32, plane: 1, ring: 1 },
      ];
      const proj = (x, y, z) => {
        const a = st.yaw * Math.PI / 180, p = st.pitch * Math.PI / 180;
        const xr = x * Math.cos(a) - y * Math.sin(a), yr = x * Math.sin(a) + y * Math.cos(a);
        const cy = H / 2 + S * 0.5 * ZS * Math.cos(p);
        return [W / 2 + S * xr, cy - S * (z * ZS * Math.cos(p) + yr * Math.sin(p)), z * Math.sin(p) - yr * Math.cos(p)];
      };
      const poly = (ctx, pts) => { ctx.beginPath(); pts.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]))); ctx.closePath(); };
      const ringPts = (r, z, n) => Array.from({ length: n }, (_, i) => proj(r * Math.cos(2 * Math.PI * i / n), r * Math.sin(2 * Math.PI * i / n), z));
      function draw() {
        const C = Plot.colors(), ctx = cv.ctx;
        cv.clear();
        const E = 1.1;
        // the floor (the original 2-D plane)
        ctx.save();
        poly(ctx, [proj(-E, -E, 0), proj(E, -E, 0), proj(E, E, 0), proj(-E, E, 0)]);
        ctx.strokeStyle = C.rule; ctx.lineWidth = 3; ctx.stroke();
        if (st.ring > 0) {   // the cut, dropped back to the floor
          ctx.globalAlpha = st.ring;
          poly(ctx, ringPts(Math.sqrt(CUT), 0, 90));
          ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.setLineDash([12, 10]); ctx.stroke(); ctx.setLineDash([]);
        }
        ctx.restore();
        const pts = D.X.map((p, i) => { const z = st.t * (p[0] * p[0] + p[1] * p[1]); const q = proj(p[0], p[1], z); return { q, z, y: D.Y[i] }; });
        const dots = list => {
          list.sort((a, b) => a.q[2] - b.q[2]);
          ctx.save(); ctx.lineWidth = 2; ctx.strokeStyle = C.paper;
          list.forEach(d => { ctx.beginPath(); ctx.arc(d.q[0], d.q[1], 8, 0, 2 * Math.PI); ctx.fillStyle = d.y ? C.c1 : C.c0; ctx.fill(); ctx.stroke(); });
          ctx.restore();
        };
        if (st.plane > 0.01) {
          dots(pts.filter(d => d.z < CUT));
          ctx.save();
          poly(ctx, [proj(-E, -E, CUT), proj(E, -E, CUT), proj(E, E, CUT), proj(-E, E, CUT)]);
          ctx.fillStyle = Plot.alpha(C.ink, 0.13 * st.plane); ctx.fill();
          ctx.strokeStyle = Plot.alpha(C.ink, st.plane); ctx.lineWidth = 3; ctx.stroke();
          if (st.ring > 0) {
            ctx.globalAlpha = st.ring;
            poly(ctx, ringPts(Math.sqrt(CUT), CUT, 90));
            ctx.strokeStyle = C.ink; ctx.lineWidth = 5; ctx.stroke();
          }
          ctx.restore();
          dots(pts.filter(d => d.z >= CUT));
        } else dots(pts);
        if (st.ring > 0.5) {   // label the floor circle at its front-most point
          const q = ringPts(Math.sqrt(CUT), 0, 90).reduce((a, b) => (b[1] > a[1] ? b : a));
          Plot.text(ctx, 'circle on the floor', q[0] - 150, q[1] + 64, { size: 30, weight: 700, align: 'center' });
        }
        if (st.plane > 0.5) {   // label the sheet at its right-most corner
          const q = [proj(-E, -E, CUT), proj(E, -E, CUT), proj(E, E, CUT), proj(-E, E, CUT)].reduce((a, b) => (b[0] > a[0] ? b : a));
          Plot.text(ctx, 'flat sheet', q[0] - 10, q[1] - 22, { size: 30, weight: 700, align: 'right' });
        }
      }
      // drag to rotate
      let drag = null;
      cv.cv.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY, yaw: st.yaw, pitch: st.pitch }; cv.cv.setPointerCapture(e.pointerId); });
      cv.cv.addEventListener('pointermove', e => {
        if (!drag) return;
        const k = 1 / (Deck.scale || 1);
        st.yaw = goal.yaw = drag.yaw - (e.clientX - drag.x) * k * 0.35;
        st.pitch = goal.pitch = Math.max(2, Math.min(90, drag.pitch + (e.clientY - drag.y) * k * 0.3));
        draw();
      });
      const end = () => { drag = null; };
      cv.cv.addEventListener('pointerup', end); cv.cv.addEventListener('pointercancel', end);
      api.onStep(k => { Object.assign(goal, TARGET[Math.min(k, TARGET.length - 1)]); });
      api.loop(dt => {
        let moving = false;
        for (const key of Object.keys(goal)) {
          const d = goal[key] - st[key];
          if (Math.abs(d) > 1e-3) { st[key] += d * Math.min(1, dt * 4); moving = true; } else st[key] = goal[key];
        }
        if (moving) draw();
        return true;
      });
      draw();
      api.onTheme(draw);
    },
    notes: `
    <p class="time">2.5 min</p>
    <p class="say">First fix, and it is a trick you already know from classical ML: invent a new feature. Give every dot a height: the further it is from the centre, the higher we lift it. The orange dots in the middle stay low, the blue ring goes up high. Now a flat sheet slides between them, which is just a linear model in 3-D. Look at where the sheet cuts the bowl and drop that back onto the floor: it is a circle. A straight cut in the new space is a curved boundary in the old one.</p>
    <p class="do">Press → once: the dots rise and the camera tilts (about one second). Drag on the picture with the mouse to spin the bowl so everybody sees the gap. Press → for the sheet, → for the circle on the floor, → for the question.</p>
    <p class="ask">Last step: which height would you invent for Kobe's court? For a spiral?</p>
    <p class="ans">For Kobe, distance from the rim is a good guess, but you had to know basketball. For a spiral, nobody has a good guess. And in the Kobe olympiad task you are not even allowed to compute features yourself: the network gets only x and y, and may use only linear layers and activations. So the network must invent its features itself. That is the next slide.</p>
    <p>Maths for the coach: the new feature is z = x² + y² (squared distance from the centre). Inner dots have z ≤ 0.25, outer dots z ≥ 0.50, so the sheet at z = 0.36 separates them perfectly, and x² + y² = 0.36 is a circle of radius 0.6. This is the idea behind kernel methods (SVMs) too.</p>`,
  });

  /* ---------- 5 · fix 2: a hidden layer learns the features ---------- */
  Deck.slide({
    id: 'why-hidden',
    title: 'Fix 2: a hidden layer learns the features',
    html: `
    <h2>Fix 2: four neurons, four lines, one shape</h2>
    <div id="why-pg2"></div>`,
    init(el, api) {
      Widgets.playground(api, el.querySelector('#why-pg2'), {
        size: 720, data: 'circle', n: 300, hidden: [4], act: 'tanh', opt: 'adam', lr: 0.03,
        steps: 1, controls: ['play', 'reset'], neurons: true, seed: 1, maxEpochs: 1500,
      });
    },
    notes: `
    <p class="time">2.5 min</p>
    <p class="say">Second fix: instead of inventing the feature, let the network learn it. Take four logistic regressions side by side. That is the hidden layer: the four small squares on the left. Each one can only draw a straight line, orange on one side, blue on the other. Then one more logistic regression on top combines the four answers. Watch what happens when we train.</p>
    <p class="do">Press <b>Train</b>. It takes about 5–8 seconds. Point first at the small squares: each is still a straight edge, but the edges move to different sides of the orange disc. Then point at the big picture: the four edges together fence in the disc, like a rounded square. Accuracy goes to 100%. Press <b>Reset</b> and <b>Train</b> again if you want a second look.</p>
    <p class="ask">The small squares are straight edges. How does the big picture become round?</p>
    <p class="ans">The last neuron adds up the four answers and says "orange" only where all four agree that you are on the inside. Four straight walls around the centre make a closed shape. More neurons give more walls, so a smoother shape. This is the "how many lines would you need" answer from the Kobe slide.</p>
    <p>Behind the picture: the network is 2-4-1 with tanh in the hidden layer, trained with Adam (learning rate 0.03) on the full 300 points. The colours in the small squares show each neuron's output: orange where it is positive, blue where it is negative. The hidden layer has learned new features (four "which side of my line are you on" scores); the last layer is ordinary logistic regression on those features. Misconception to head off: hidden neurons are not little brains and need not mean anything; here they just happen to be readable.</p>`,
  });

  /* ---------- 6 · takeaway ---------- */
  Deck.slide({
    id: 'why-take',
    title: 'Takeaway: hidden layer = learned features',
    cls: 'plain',
    html: `
    <div class="kicker">takeaway</div>
    <div class="take">
      <p class="big">A hidden layer <mark>learns its own features</mark>.</p>
      <div class="chain"><b>one line fails</b> → invent a feature → <b>let the network invent it</b></div>
    </div>`,
    notes: `
    <p class="time">1 min</p>
    <p class="say">So the story is: one straight line fails on curved patterns like the circle or Kobe's hot zone around the rim. Inventing a feature fixes it, if you can guess the right one. A neural network learns its own features in the hidden layer, and the last layer is plain logistic regression on top. In the next section we open up one neuron and see exactly how it computes.</p>
    <p class="ask">In one sentence: what does a hidden layer do?</p>
    <p class="ans">It turns the raw inputs into new features (here: "which side of each line"), learned from the data, so that a simple last layer can separate the classes.</p>`,
  });
}
