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
.sec-why .why-res .ref { color: var(--muted); }
.sec-why .tl svg { overflow: visible; }
`);

{
  // canvas label on a paper chip, so dots never hide it (align: 'center' | 'left' | 'right' = which edge sits at x)
  const chip = (ctx, C, txt, x, y, align) => {
    ctx.save(); ctx.font = `700 30px ${C.fontBody}`;
    const w = ctx.measureText(txt).width + 20;
    const cx = align === 'right' ? x - w / 2 : align === 'left' ? x + w / 2 : x;
    ctx.fillStyle = C.paper; ctx.fillRect(cx - w / 2, y - 22, w, 44);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.strokeRect(cx - w / 2, y - 22, w, 44);
    ctx.restore();
    Plot.text(ctx, txt, cx, y, { size: 30, weight: 700, align: 'center', base: 'middle' });
  };

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
    <p class="time">1.5 min</p>
    <p class="say">A toy dataset: orange dots in the middle, a blue ring around them. You may have seen logistic regression; if not, it is the simplest classifier, and its border between the colours is always one straight line. Can one straight line put all orange on one side and all blue on the other?</p>
    <p class="do">Show of hands: yes or no. Press <b>Train</b>: the line swings round for about a second, then stays straight. Point at the readouts: the loss stays near 0.68 and the accuracy stops near 59% (it started at 58%). Press → for the answer; <b>Reset</b> and <b>Train</b> again if someone wants a second look.</p>
    <p class="ask">Why can't it do better, however long we train?</p>
    <p class="ans">Every straight line leaves orange and blue dots on both sides: the orange is surrounded. Training longer only polishes the line; it cannot bend it.</p>
    <p>Maths for you: logistic regression computes p = σ(w₁x₁ + w₂x₂ + b), and its 50% border, w₁x₁ + w₂x₂ + b = 0, is a straight line.</p>`,
  });

  /* ---------- 2 · Kobe: A1 pair activity ---------- */
  // Logistic regression on Kobe's (x, y), all 25,697 labelled Kaggle shots (sklearn, no penalty):
  // logit = 0.0988 − 0.0000642·x − 0.00352·y  →  50% line y ≈ 28.1 − 0.018·x (tenths of feet), accuracy 58.1%.
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
            <div data-step="2" class="ref"><span class="mono">55%</span> always say “miss”</div>
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
      const lineY = x => 28.1 - 0.018 * x;
      const label = chip;
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
          label(ctx, C, '3 ft circle', fr.sx(-36), fr.sy(-22), 'right');
        }
      };
      draw();
      api.onStep(draw);
      api.onTheme(draw);
    },
    notes: `
    <p class="time">3.5 min</p>
    <p class="say">Now real data: 800 of Kobe Bryant's shots, orange went in, blue missed. The hoop is the small circle near the bottom edge. In pairs, copy a rough court on paper: a rectangle, the hoop near the bottom, the big arc of the three-point line. One of you shades where Kobe scores most, the other draws the single straight line that best splits makes from misses, the way logistic regression would. Two minutes.</p>
    <p class="do">Press <b>Start</b> on the timer. Walk around and look at the sketches; pick one pair whose line runs across the court near the hoop to show later. When time is up press → three times: (1) the make-rate bars, (2) the best straight line, with "always say miss" (55%) as the number to beat, (3) the circle round the rim.</p>
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
    <h2>One layer was not enough: the field froze</h2>
    <p class="quote">“…will be able to walk, talk, see, write, reproduce itself and be conscious of its existence.” <span class="tiny">New York Times, 1958</span></p>
    <div class="tl">
      <div><span class="yr">1958</span><span class="ev">Perceptron</span>${Widgets.netSVG({ sizes: [2, 1], w: 200, h: 230, r: 28, edgeWidth: 3.5 })}<span class="small muted">one layer learns</span></div>
      <div data-step="1"><span class="yr">1969</span><span class="ev">Minsky &amp; Papert</span>${xorSVG}<span class="small muted">no single line</span></div>
      <div data-step="2" class="winter"><span class="yr">1970s</span><span class="ev">AI winter</span><span class="small">funding dries up</span></div>
      <div data-step="3"><span class="yr">1986</span><span class="ev">Backprop</span>${Widgets.netSVG({ sizes: [2, 2, 1], w: 320, h: 230, r: 28, edgeWidth: 3.5 })}<span class="small muted">hidden layers learn</span></div>
    </div>`,
    notes: `
    <p class="time">1.5 min</p>
    <p class="say">This problem stopped the whole field once. In 1958 Frank Rosenblatt showed the Perceptron, a single learning layer, basically logistic regression with a hard threshold: the picture is two inputs wired straight to one output. The New York Times wrote that the Navy expected it to "walk, talk, see, write, reproduce itself and be conscious of its existence". In 1969 Minsky and Papert proved that one layer cannot even learn XOR: orange in two opposite corners, blue in the other two. No straight line separates them. Money left neural networks for more than a decade. The fix, training networks with a hidden layer by backpropagation, became famous in 1986: look at the extra column of neurons in the middle.</p>
    <p class="do">The quote and 1958 are already on screen: read the quote aloud with a straight face. Then press → three times, one event per press (1969, the winter, 1986). At 1969, point at the XOR square and ask the question below.</p>
    <p class="ask">Where would you put one straight line to separate the XOR square?</p>
    <p class="ans">Nowhere: any line leaves a blue and an orange dot on the same side. Two lines (a stripe) would do it, which is what a hidden layer with two neurons does. You will build that network yourselves in the next section.</p>
    <p>Get the history right: Minsky and Papert proved the limit for <b>single-layer</b> perceptrons; they knew multi-layer networks could represent XOR but doubted they could be trained. The book was read as a verdict on all neural networks. Dates are rough: the general "AI winter" is usually put at about 1974–1980 (the 1973 Lighthill report cut UK funding), and neural-network research stayed unfashionable until the mid-1980s. The Mark I Perceptron (built 1959–60, 400 photocells, weights on motor-driven potentiometers) even had a middle layer, but it was wired randomly and never learned: only the last layer learned. Backprop has a messy history (Linnainmaa 1970, Werbos 1974/1982); Rumelhart, Hinton and Williams made it famous in Nature, 1986. Sad coda: Rosenblatt drowned on his 43rd birthday in 1971 and never saw it.</p>`,
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
        <div class="stack">
          <p class="lead" data-only="0">Seen from above: the same circle data.</p>
          <p class="lead dim-after" data-step="1">Lift each dot: further out = higher.</p>
        </div>
        <p class="lead dim-after" data-step="2">One flat sheet now separates them.</p>
        <p class="lead dim-after" data-step="3">Dropped to the floor, the cut is a circle.</p>
        <p class="lead" data-step="4"><b>But which lift for Kobe's court?</b></p>
        <p class="tiny" data-step="1">drag to rotate</p>
      </div>
    </div>`,
    init(el, api) {
      const D = NN.data.circle(300, 101, 0);
      const W = 960, H = 768, S = 285, ZS = 1.3, CUT = 0.36;   // inner r² ≤ 0.25, outer r² ≥ 0.50
      const cv = Plot.canvas(el.querySelector('#why-lift'), W, H);
      const st = { t: 0, pitch: 90, yaw: 0, plane: 0, ring: 0 };
      const goal = { t: 0, pitch: 90, yaw: 0, plane: 0, ring: 0 };
      const TARGET = [
        { t: 0, pitch: 90, yaw: 0, plane: 0, ring: 0 },
        { t: 1, pitch: 24, yaw: -32, plane: 0, ring: 0 },
        { t: 1, pitch: 24, yaw: -32, plane: 1, ring: 0 },
        { t: 1, pitch: 24, yaw: -32, plane: 1, ring: 1 },
        { t: 1, pitch: 24, yaw: -32, plane: 1, ring: 1 },
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
        if (st.ring > 0.5) {   // label the floor circle just below its front-most point
          const q = ringPts(Math.sqrt(CUT), 0, 90).reduce((a, b) => (b[1] > a[1] ? b : a));
          chip(ctx, C, 'circle on the floor', q[0], Math.min(H - 26, q[1] + 44), 'center');
        }
        if (st.plane > 0.5) {   // label the sheet just outside its right-most corner
          const q = [proj(-E, -E, CUT), proj(E, -E, CUT), proj(E, E, CUT), proj(-E, E, CUT)].reduce((a, b) => (b[0] > a[0] ? b : a));
          chip(ctx, C, 'flat sheet', Math.min(W - 4, q[0] + 20), q[1] + 46, 'right');
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
    <p class="time">2 min</p>
    <p class="say">Fix 1: invent a new feature, a trick you may have seen in classical ML. Lift every dot by its distance from the centre: orange stays low, the blue ring goes high, and a flat sheet now slides between them. Drop that cut back to the floor and it is a circle.</p>
    <p class="do">→ the dots rise (about 1 s); drag the picture to spin it so everyone sees the gap. → the sheet, → the circle on the floor, → the question.</p>
    <p class="ask">Which height would you invent for Kobe's court? For a spiral?</p>
    <p class="ans">For Kobe, distance from the rim, but you had to know basketball. For a spiral, nobody has a good guess. And the Kobe task gives the network only x and y, so it must invent its features itself: next slide.</p>
    <p>Maths for you: the height is z = x² + y²; inner dots have z ≤ 0.25 and outer ones z ≥ 0.5, so the sheet z = 0.36 separates them and lands on the floor as the circle of radius 0.6. A flat cut in a bigger space is a curved border in the original one (the idea behind kernel SVMs).</p>`,
  });

  /* ---------- 5 · fix 2: a hidden layer learns the features ---------- */
  Deck.slide({
    id: 'why-hidden',
    title: 'Fix 2: a hidden layer learns the features',
    steps: 1,
    html: `
    <h2>Fix 2: four neurons, four lines, one shape</h2>
    <div id="why-pg2"></div>`,
    init(el, api) {
      const pg = Widgets.playground(api, el.querySelector('#why-pg2'), {
        size: 720, data: 'circle', n: 300, hidden: [4], act: 'tanh', opt: 'adam', lr: 0.01,
        steps: 1, controls: ['play', 'reset'], neurons: true, seed: 1, maxEpochs: 1200,
      });
      const side = pg.root.querySelector('.pg-side');
      const box = document.createElement('div');
      box.className = 'why-side';
      box.innerHTML = `<span class="tag tag-predict">predict</span>
        <div class="stack">
          <p class="lead" data-only="0">Four straight edges: what shape?</p>
          <p class="lead" data-step="1">Four straight edges fence in the orange.</p>
        </div>`;
      side.insertBefore(box, side.firstChild);
    },
    notes: `
    <p class="time">2.5 min</p>
    <p class="say">Fix 2: let the network learn the features itself. The hidden layer is four one-line models side by side, the four small squares, and one more neuron on top combines their answers.</p>
    <p class="ask">Each small square is split by one straight edge. What shape will four of them make in the big picture?</p>
    <p class="ans">Take guesses, do not confirm yet. After training: the four edges join into one closed fence around the orange (often lopsided, like a rounded triangle; any closed shape works).</p>
    <p class="do">Press <b>Train</b>: the shape forms in about 4 s and reaches 100% in about 5. Point at each small square (still a straight edge), then trace its side of the fence in the big picture. Press → for the answer.</p>
    <p class="ask">The small squares are straight. How does the big picture become round?</p>
    <p class="ans">The last neuron says "orange" only where all four agree you are inside. More neurons give more walls, so a smoother shape.</p>
    <p>The net is 2-4-1 with tanh, trained with Adam (lr 0.01); a small square's colour is that neuron's output. Hidden neurons need not mean anything; here they just happen to be readable.</p>`,
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
