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
  <p class="say">Today we go from models that draw one straight line to neural networks, which can learn almost any shape. Everything on these slides is computed live in this browser.</p>
  <p class="do">Let the spiral train while you talk: a network with 105 numbers inside is learning to separate two interleaved spirals right now.</p>
  <p class="ask">Could one straight line separate these two spirals?</p>
  <p class="ans">No. In the first hour you will see why a network can.</p>
  <p>Keys: → / space next, ← back, P presenter window, N notes here, T light/dark, F full screen, B black, O slide map, ? help.</p>`,
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
        <foreignObject x="${x - 140}" y="240" width="280" height="120"><div xmlns="http://www.w3.org/1999/xhtml" style="text-align:center;font-size:38px;line-height:1.15;color:var(--muted)">${t}</div></foreignObject>`).join('')}
      <circle cx="1220" cy="190" r="46" fill="var(--ink)"/>
      <circle cx="1220" cy="190" r="66" fill="none" stroke="var(--ink)" stroke-width="5"/>
      <text x="1220" y="80" text-anchor="middle" font-family="var(--font-mono)" font-size="32" font-weight="600" letter-spacing="3" fill="var(--ink)">TODAY</text>
      <foreignObject x="1060" y="268" width="320" height="140"><div xmlns="http://www.w3.org/1999/xhtml" style="text-align:center;font-family:var(--font-display);font-weight:800;font-size:44px;line-height:1.05;color:var(--ink)">neural networks</div></foreignObject>
      <circle cx="1560" cy="190" r="26" fill="var(--paper)" stroke="var(--ink)" stroke-width="5"/>
      <foreignObject x="1420" y="240" width="280" height="120"><div xmlns="http://www.w3.org/1999/xhtml" style="text-align:center;font-size:38px;line-height:1.15;color:var(--muted)">harder tasks<br>(tomorrow)</div></foreignObject>
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
    const most = Math.max(...secs.map(x => x.minutes || 0)) || 25;
    const rows = secs.map((sec, i) => {
      const start = t; t += sec.minutes || 0;
      const kind = /break/i.test(sec.title) ? 'brk' : /task/i.test(sec.title) ? 'task' : /live|loop/i.test(sec.title) ? 'code' : '';
      const tag = kind === 'task' ? ' <span class="tag">tasks</span>' : kind === 'code' ? ' <span class="tag tag-code">live code</span>' : '';
      const clock = Math.floor(start / 60) + ':' + String(start % 60).padStart(2, '0');
      return `<div class="map-row ${kind}"><span class="map-clock">${clock}</span>
        <span class="map-bar"><span style="width:${100 * (sec.minutes || 0) / most}%"></span></span>
        <span class="map-title">${sec.title}${tag}</span><span class="map-min">${sec.minutes} min</span></div>`;
    });
    host.innerHTML = `<div class="map">${rows.join('')}</div>`;
    host.dataset.total = total;
  },
  notes: `
  <p class="time">1 min</p>
  <p class="say">Here is the plan. Every few minutes you will do something: predict before a demo, count on paper, or write code. There is one break, and the last part prepares the two tasks you start this afternoon.</p>
  <p class="do">Point at the "live code" row (we write the training loop together) and the "tasks" row. Ask for paper and a pen.</p>
  <p>Pacing: the presenter window (P) shows the planned clock and warns when you are behind. If late, shorten pair work and optional questions, not the training loop or the task briefing.</p>`,
});

Deck.slide({
  id: 'open-loop',
  title: 'The one picture of today',
  html: `
  <h2>One picture for the whole day</h2>
  <div class="fill-center">${Widgets.loopSVG({ w: 1500, h: 560, steps: true })}</div>
  <p class="lead muted" data-step="6">By 3:00 you can explain every arrow.</p>`,
  notes: `
  <p class="time">2 min</p>
  <p class="say">Every neural network you will ever train, from our 105-parameter network to ChatGPT, runs this loop. Data goes into the model, the model makes a prediction, the loss measures how wrong it is. Then we go backwards: gradients tell every weight which way to move, the optimizer moves them a little, and we repeat thousands of times.</p>
  <p class="do">Press → six times to build the picture one box at a time (data, model, loss, gradients, update, then "repeat"); name each box as it appears. Black arrows are the forward pass; magenta arrows are learning (gradients and updates). Magenta always means "learning" in this deck.</p>
  <p class="ask">Which of these boxes did you already meet with logistic regression?</p>
  <p class="ans">All of them. Logistic regression has data, a (very small) model, a loss (cross-entropy), gradients and gradient-descent updates. Today we make the model box bigger and learn how to make the loop work well.</p>`,
});

Deck.css(`
.sec-open .map { gap: 18px; }
.sec-open .map-row.code .map-bar span, .sec-open .map-row.task .map-bar span { background: var(--ink); }
.sec-open .map-min { font-size: 28px; }
.sec-open .map-title .tag { font-size: 28px; padding: 2px 14px 1px; margin-left: 20px; vertical-align: 4px; }
.sec-open .recall { display: flex; flex-direction: column; gap: 64px; margin-top: 24px; }
.sec-open .recall-row { display: grid; grid-template-columns: 64px 1fr 1fr; gap: 48px; align-items: baseline; }
.sec-open .recall-row .n { font-family: var(--font-mono); font-size: 40px; color: var(--muted); }
.sec-open .recall-row .q { font-size: 48px; line-height: 1.2; }
.sec-open .recall-row .a { font-size: 48px; line-height: 1.2; border-left: 8px solid var(--ok); padding-left: 28px; }
.sec-open .kobe-grid { display: grid; grid-template-columns: 720px 1fr; gap: 96px; align-items: center; flex: 1; min-height: 0; }
.sec-open .kobe-pct { font-family: var(--font-display); font-weight: 800; font-size: 200px; line-height: .9; font-stretch: 110%; }
.sec-open .kobe-key { font-size: 40px; }
.sec-open .kobe-key b { font-weight: 700; }
`);

Deck.slide({
  id: 'open-recall',
  title: 'Warm-up: three questions',
  html: `
  <div class="row"><span class="tag tag-paper">on paper · 2 min</span></div>
  <h2>Warm-up: what do you already know?</h2>
  <div class="recall">
    <div class="recall-row"><span class="n">1</span><span class="q">What does logistic regression output?</span>
      <span class="a" data-step="1">a probability between 0 and 1</span></div>
    <div class="recall-row"><span class="n">2</span><span class="q">What shape is its decision boundary?</span>
      <span class="a" data-step="2">one straight line</span></div>
    <div class="recall-row"><span class="n">3</span><span class="q">What does backprop tell each weight?</span>
      <span class="a" data-step="3">which way to move so the loss gets smaller</span></div>
  </div>`,
  notes: `
  <p class="time">3 min (2 to write, 1 to reveal)</p>
  <p class="say">Before we start, three quick questions about things you already know. Write your answers on paper, no notes, no phones. Testing yourself is one of the strongest ways to remember something, and it tells me where you are.</p>
  <p class="do">Give them 2 minutes (watch the clock). Then press → three times to reveal the answers one by one. After each one ask "hands up if you had it" and glance at the room.</p>
  <p class="ans">1) A probability between 0 and 1. It adds up the inputs times their weights, then squashes the result through the S-shaped sigmoid. 2) One straight line: on one side the probability is above 0.5, on the other side below. This is exactly the limitation we break today. 3) For every weight: which direction to nudge it, and roughly how strongly, so that the loss goes down. Gradient descent then takes a small step in that direction.</p>
  <p>If many hands stay down on 3: say "backprop is just bookkeeping: it works out, for every knob, whether turning it left or right makes the error smaller". Do not derive anything now; section 6 comes back to it with a ball rolling downhill.</p>
  <p>Background for you only (do not write it on the board): the formula is p = σ(w·x + b), and for sigmoid + cross-entropy the gradient with respect to the weighted sum z is simply p − y. The picture "one straight line" is what matters for the next section.</p>`,
});

Deck.slide({
  id: 'open-kobe',
  title: "Predict: Kobe's shooting",
  html: `
  <div class="kobe-grid">
    <div id="open-kobe-court"></div>
    <div class="col gap-l">
      <div class="col">
        <span class="tag tag-predict">predict</span>
        <h2>25,697 Kobe Bryant shots. What % went in?</h2>
        <p class="kobe-key"><b class="c1">● orange: in</b> &nbsp; <b class="c0">● blue: missed</b></p>
      </div>
      <div data-step="1"><div class="kobe-pct">44.6%</div></div>
      <p class="lead" data-step="2">So always guessing <b class="c0">“miss”</b> is right <b>55%</b> of the time.</p>
    </div>
  </div>`,
  init(el, api) {
    const host = el.querySelector('#open-kobe-court');
    const fr = Widgets.courtFrame(0, 0, 720);
    const cv = Plot.canvas(host, 720, Math.ceil(fr.h));
    const draw = () => {
      const C = Plot.colors(), ctx = cv.ctx;
      cv.clear(C.paper);
      ctx.lineWidth = 2;
      for (let i = 0; i < 800; i++) {
        const [x, y] = KOBE.X[i];
        ctx.beginPath(); ctx.arc(fr.sx(x), fr.sy(y), 6, 0, 2 * Math.PI);
        ctx.fillStyle = KOBE.Y[i] ? C.c1 : C.c0; ctx.fill(); ctx.strokeStyle = C.paper; ctx.stroke();
      }
      Widgets.drawCourt(ctx, fr, { color: C.ink, width: 3 });
    };
    draw();
    api.onTheme(draw);
  },
  notes: `
  <p class="time">2 min</p>
  <p class="say">Our running example is real data: Kobe Bryant's shots from 20 NBA seasons, each with its position on the court. Basket at the bottom; orange went in, blue missed. It is also the data of your first task this afternoon.</p>
  <p class="do">Everyone writes a number on paper (15 s); take two or three guesses aloud. → reveals 44.6%, → the consequence.</p>
  <p class="ask">If 44.6% went in, how often is a "model" right that always says "miss"?</p>
  <p class="ans">About 55%. A model that does not clearly beat 55% has learned nothing; even the best reach only about 61%, because the same spot gives both makes and misses.</p>
  <p>Data: Kaggle "Kobe Bryant Shot Selection", 25,697 labelled shots (1996–2016); 800 are drawn. Kobe died in a helicopter crash in 2020; if it comes up, be respectful.</p>`,
});
