Deck.section({ id: 'open', title: 'Opening', minutes: 10 });

Deck.slide({
  id: 'open-title',
  title: 'Neural networks, hands-on',
  cls: 'plain',
  html: `
  <div class="split split-46">
    <div class="col gap-l">
      <div class="kicker">IOAI training · deep learning</div>
      <h1>Neural<br>networks,<br>hands&#8209;on</h1>
      <p class="lead muted">From straight lines to any function.</p>
    </div>
    <div class="fill-center" id="open-spiral"></div>
  </div>`,
  init(el, api) {
    const pg = Widgets.playground(api, el.querySelector('#open-spiral'), {
      size: 820, data: 'spiral', n: 400, hidden: [8, 8], act: 'tanh', opt: 'adam', lr: 0.02,
      steps: 6, autoplay: true, controls: [], readouts: false, res: 64, maxEpochs: 6000, dot: 6,
    });
    // restart the show every time we come back to the title
    api.onEnter(() => { if (pg.S.epoch >= 6000) pg.reset(); pg.play(); });
  },
  notes: `
  <p class="time">1 min</p>
  <p class="say">Today we go from the models you already know, which draw straight lines, to neural networks, which can learn almost any shape. Everything you see on these slides is computed live in this browser.</p>
  <p class="do">Let the spiral on the right train while you talk. Point at it: two interleaved spirals, orange and blue. A network with 105 numbers inside is learning to separate them right now.</p>
  <p class="ask">Could logistic regression separate these two spirals?</p>
  <p class="ans">No. Logistic regression draws one straight line. By the end of the first hour you will know exactly why the network can and logistic regression cannot.</p>
  <p>Keys: → / space next, ← back, P opens the presenter window (notes, timer, next slide), N shows notes on this screen, T toggles light/dark, F full screen, B black screen, O slide map, ? help.</p>`,
});

Deck.slide({
  id: 'open-path',
  title: 'Where we are',
  html: `
  <h2>You already have every ingredient</h2>
  <div class="fill-center">
    <svg viewBox="0 0 1700 420" width="1700" height="420" role="img" aria-label="Path: vectors, matrices, gradient descent, classical ML, neural networks today, harder tasks tomorrow">
      <line x1="120" y1="190" x2="1580" y2="190" stroke="var(--rule)" stroke-width="8" stroke-linecap="round"/>
      <line x1="120" y1="190" x2="1166" y2="190" stroke="var(--ink)" stroke-width="8" stroke-linecap="round"/>
      ${[['vectors', 120], ['matrices', 380], ['gradient<br>descent', 640], ['classical ML', 900]].map(([t, x]) => `
        <circle cx="${x}" cy="190" r="26" fill="var(--ink)"/>
        <foreignObject x="${x - 140}" y="240" width="280" height="120"><div xmlns="http://www.w3.org/1999/xhtml" style="text-align:center;font-size:34px;line-height:1.15;color:var(--muted)">${t}</div></foreignObject>`).join('')}
      <circle cx="1220" cy="190" r="46" fill="var(--grad)"/>
      <circle cx="1220" cy="190" r="66" fill="none" stroke="var(--grad)" stroke-width="5" stroke-dasharray="10 10"/>
      <text x="1220" y="80" text-anchor="middle" font-family="var(--font-mono)" font-size="26" letter-spacing="3" fill="var(--grad)">TODAY</text>
      <foreignObject x="1060" y="268" width="320" height="140"><div xmlns="http://www.w3.org/1999/xhtml" style="text-align:center;font-family:var(--font-display);font-weight:800;font-size:44px;line-height:1.05;color:var(--ink)">neural networks</div></foreignObject>
      <circle cx="1560" cy="190" r="26" fill="var(--paper)" stroke="var(--ink)" stroke-width="5"/>
      <foreignObject x="1440" y="240" width="240" height="120"><div xmlns="http://www.w3.org/1999/xhtml" style="text-align:center;font-size:34px;line-height:1.15;color:var(--muted)">harder tasks<br>(tomorrow)</div></foreignObject>
    </svg>
  </div>`,
  notes: `
  <p class="time">1 min</p>
  <p class="say">A neural network is not a new subject. It is built from things you already know: vectors and matrices for the computation, gradient descent for the learning, and logistic regression as the very last layer. Today we only add one new idea, the hidden layer with a nonlinearity, and then we learn to train such models well in PyTorch.</p>
  <p>Why say this: students who already "know" backprop often feel deep learning is a separate, mysterious world. Framing it as "logistic regression + learned features" lowers the barrier and lets you lean on what they know.</p>`,
});

Deck.slide({
  id: 'open-map',
  title: "Today's map",
  html: `
  <h2>Three hours: theory, live demos, code</h2>
  <div class="grow" id="open-map"></div>`,
  init(el) {
    // drawn from the registered sections so it always matches the deck
    const host = el.querySelector('#open-map');
    const secs = Deck.sections;
    const total = secs.reduce((s, x) => s + (x.minutes || 0), 0) || 180;
    let t = 0;
    const rows = secs.map((sec, i) => {
      const start = t; t += sec.minutes || 0;
      const kind = /break/i.test(sec.title) ? 'brk' : /task/i.test(sec.title) ? 'task' : /live|loop/i.test(sec.title) ? 'code' : '';
      const clock = Math.floor(start / 60) + ':' + String(start % 60).padStart(2, '0');
      return `<div class="map-row ${kind}"><span class="map-clock">${clock}</span>
        <span class="map-bar"><span style="width:${100 * (sec.minutes || 0) / 25}%"></span></span>
        <span class="map-title">${sec.title}</span><span class="map-min">${sec.minutes} min</span></div>`;
    });
    host.innerHTML = `<div class="map">${rows.join('')}</div>`;
    host.dataset.total = total;
  },
  notes: `
  <p class="time">1 min</p>
  <p class="say">Here is the plan. Roughly every ten minutes you will do something: predict what happens before I run a demo, compute something on paper, or write code. There is one break in the middle. The last part prepares you for the two tasks you will solve this afternoon.</p>
  <p class="do">Point at the orange rows (the tasks) and the blue row (live coding). Tell them to keep a notebook open for paper exercises.</p>
  <p>Pacing: the presenter window (key P) shows the planned clock for every section and warns you when you are behind. If you are late, the safest places to cut are the extra demos in "Activations" (sigmoid towers, space warping) and the optimizer schedules slide.</p>`,
});

Deck.slide({
  id: 'open-loop',
  title: 'The one picture of today',
  html: `
  <h2>One picture for the whole day</h2>
  <div class="fill-center">${Widgets.loopSVG({ w: 1500, h: 560, steps: true })}</div>
  <p class="lead muted" data-step="7">By 3:00 you can explain every arrow.</p>`,
  notes: `
  <p class="time">2 min</p>
  <p class="say">Every neural network you will ever train, from our 105-parameter network to ChatGPT, runs this loop. Data goes into the model, the model makes a prediction, the loss measures how wrong it is. Then we go backwards: gradients tell every weight which way to move, the optimizer moves them a little, and we repeat thousands of times.</p>
  <p class="do">Press → to build the picture one box at a time; name each box as it appears. Black arrows are the forward pass; magenta arrows are learning (gradients and updates). Magenta always means "learning" in this deck.</p>
  <p class="ask">Which of these boxes did you already meet with logistic regression?</p>
  <p class="ans">All of them. Logistic regression has data, a (very small) model, a loss (cross-entropy), gradients and gradient-descent updates. Today we make the model box bigger and learn how to make the loop work well.</p>`,
});

Deck.css(`
.sec-open .recall { display: flex; flex-direction: column; gap: 44px; margin-top: 16px; }
.sec-open .recall-row { display: grid; grid-template-columns: 70px 1fr 1fr; gap: 40px; align-items: baseline; }
.sec-open .recall-row .n { font-family: var(--font-mono); font-size: 34px; color: var(--muted); }
.sec-open .recall-row .q { font-size: 40px; }
.sec-open .recall-row .a { font-size: 40px; border-left: 6px solid var(--ok); padding-left: 24px; }
.sec-open .kobe-pct { font-family: var(--font-display); font-weight: 800; font-size: 200px; line-height: .9; font-stretch: 110%; }
`);

Deck.slide({
  id: 'open-recall',
  title: 'Warm-up: three questions',
  html: `
  <div class="row"><span class="tag tag-paper">on paper · 2 min</span></div>
  <h2>Warm-up: what do you already know?</h2>
  <div class="recall">
    <div class="recall-row"><span class="n">1</span><span class="q">Logistic regression: write <span class="m"><i>p</i></span> using <span class="m"><b>x</b></span>, <span class="m"><b>w</b></span>, <span class="m"><i>b</i></span>.</span>
      <span class="a" data-step="1"><span class="m"><i>p</i> = σ(<b>w</b>·<b>x</b> + <i>b</i>)</span></span></div>
    <div class="recall-row"><span class="n">2</span><span class="q">Sigmoid + cross-entropy: <span class="m">∂<i>L</i>/∂<i>z</i></span> = ?</span>
      <span class="a" data-step="2"><span class="m"><i>p</i> − <i>y</i></span></span></div>
    <div class="recall-row"><span class="n">3</span><span class="q">Backprop computes … (one sentence)</span>
      <span class="a" data-step="3">the gradient of the loss for every parameter, chain rule, backwards</span></div>
  </div>`,
  notes: `
  <p class="time">3 min (2 to write, 1 to reveal)</p>
  <p class="do">Everyone writes answers on paper, no notes. Then press → three times to reveal the answers one by one; ask for a show of hands "who had it?" after each.</p>
  <p class="say">Testing yourself is one of the strongest ways to remember something; this takes two minutes and tells me where you are.</p>
  <p class="ans">1) p = σ(w·x + b), where σ(z) = 1/(1 + e^(−z)). 2) For sigmoid followed by binary cross-entropy, the derivative of the loss with respect to the raw score z is simply p − y (prediction minus label). This is why the two are always used together. 3) Backprop computes ∂loss/∂parameter for every parameter, by applying the chain rule backwards through the computation, reusing intermediate results.</p>
  <p>If many students miss question 2, spend 30 seconds deriving it: L = −[y log p + (1−y) log(1−p)], dp/dz = p(1−p), so dL/dz = p − y. It returns in the loss section.</p>`,
});

Deck.slide({
  id: 'open-kobe',
  title: "Predict: Kobe's shooting",
  html: `
  <div class="row"><span class="tag tag-predict">predict</span></div>
  <div class="split split-46">
    <div id="open-kobe-court" class="fill-center"></div>
    <div class="col gap-l">
      <h2>Kobe Bryant took 25,697 labelled shots. What % went in?</h2>
      <div data-step="1"><div class="kobe-pct">44.6%</div></div>
      <p class="lead" data-step="2">So always guessing <span class="c0">“miss”</span> is right <b>55%</b> of the time.</p>
    </div>
  </div>`,
  init(el, api) {
    const host = el.querySelector('#open-kobe-court');
    const fr = Widgets.courtFrame(0, 0, 720);
    const cv = Plot.canvas(host, 720, Math.ceil(fr.h));
    const draw = () => {
      const C = Plot.colors(), ctx = cv.ctx;
      cv.clear(C.paper);
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 800; i++) {
        const [x, y] = KOBE.X[i];
        ctx.beginPath(); ctx.arc(fr.sx(x), fr.sy(y), 5, 0, 2 * Math.PI);
        ctx.fillStyle = KOBE.Y[i] ? C.c1 : C.c0; ctx.fill(); ctx.strokeStyle = C.paper; ctx.stroke();
      }
      Widgets.drawCourt(ctx, fr, { color: C.ink, width: 3 });
    };
    draw();
    api.onTheme(draw);
  },
  notes: `
  <p class="time">2 min</p>
  <p class="say">Today's running example is real data: every shot Kobe Bryant took in 20 NBA seasons, with its position on the court. Orange dots went in, blue dots missed. This is also the data of your first task this afternoon.</p>
  <p class="do">Everyone writes a number on paper first. Then → reveals 44.6%, → again reveals the consequence.</p>
  <p class="ask">If 44.6% went in, how accurate is a "model" that always says "miss"?</p>
  <p class="ans">55.4% (about 55%). Remember this number: any model that does not clearly beat 55% has learned nothing. Later we will see that the best possible model only reaches about 61%, because the same spot can produce both a make and a miss.</p>
  <p>Facts for the coach: the data is the Kaggle "Kobe Bryant Shot Selection" set (30,697 shots from 1996 to his last game on 13 April 2016; 5,000 had hidden labels). His regular-season career field-goal percentage was .447. Kobe died in a helicopter crash in January 2020; mention it respectfully if it comes up, and never joke about it.</p>`,
});
