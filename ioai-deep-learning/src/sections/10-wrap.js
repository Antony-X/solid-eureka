Deck.section({ id: 'wrap', title: 'Wrap-up', minutes: 8 });

Deck.css(`
.sec-wrap .can { display: grid; grid-template-columns: repeat(2, 1fr); gap: 28px 80px; font-size: 40px; }
.sec-wrap .can div { display: flex; gap: 22px; align-items: baseline; }
.sec-wrap .can b { font-family: var(--font-mono); color: var(--muted); font-weight: 600; font-size: 30px; min-width: 1.6em; }
.sec-wrap .tasks { display: grid; grid-template-columns: 1fr 1fr; gap: 96px; align-items: end; }
.sec-wrap .task { display: flex; flex-direction: column; gap: 20px; }
`);

Deck.slide({
  id: 'wrap-loop',
  title: 'The whole lecture in one picture',
  html: `
  <h2>The whole lecture in one picture</h2>
  <div class="fill-center">${Widgets.loopSVG({ w: 1560, h: 640, notes: true })}</div>`,
  notes: `
  <p class="time">2 min</p>
  <p class="say">This is the picture from the very beginning, now with today's words under every box. Data: scaled, in batches, split into training and validation. Model: linear layers with activations in between, stacked. Loss: MSE for numbers, binary cross-entropy for yes/no, cross-entropy for classes. Gradients: one call, loss.backward(). Update: optimizer.step(), and Adam with learning rate 1e-3 is the default you start with.</p>
  <p class="ask">Ask two or three students to explain one arrow each, in their own words.</p>
  <p class="ans">Good answers mention: the model outputs logits; the loss compares predictions with labels; backward computes ∂loss/∂weight for every weight; the optimizer moves each weight a small step against its gradient; we repeat for many epochs and watch the validation loss.</p>`,
});

Deck.slide({
  id: 'wrap-can',
  title: 'You can now…',
  html: `
  <h2>What you can do now</h2>
  <div class="can">
    <div><b>1</b>explain why hidden layers need activations</div>
    <div><b>2</b>count parameters and predict tensor shapes</div>
    <div><b>3</b>pick the loss for a task</div>
    <div><b>4</b>train an MLP in PyTorch without copying</div>
    <div><b>5</b>read a loss curve and fix the learning rate</div>
    <div><b>6</b>use gradients to change an input, not a weight</div>
  </div>`,
  notes: `
  <p class="time">30 s</p>
  <p class="say">Six skills from today. The first three are theory you will be asked about; the last three are what wins practical rounds.</p>
  <p class="do">Ask for a show of hands on each line. Anything with few hands is what to repeat at the start of tomorrow.</p>`,
});

Deck.slide({
  id: 'wrap-tasks',
  title: 'Now: two tasks',
  html: `
  <h2>Now: two tasks. Tomorrow: harder ones.</h2>
  <div class="tasks grow">
    <div class="task"><div id="wrap-court"></div><h3>Kobe: will it go in?</h3><p class="small muted">2 inputs · ≤ 3 linear layers · ≤ 8 neurons</p></div>
    <div class="task">
      <svg class="dg" viewBox="0 0 760 420" width="760" height="420" role="img" aria-label="frozen model with one missing input">
        <rect class="box" x="300" y="70" width="240" height="280" style="stroke-width:5"/>
        <text class="lbl-b" x="420" y="190">model</text>
        <text class="lbl-s" x="420" y="246">frozen</text>
        ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => {
          const y = 80 + i * 29;
          const miss = i === 3;
          return `<line class="${miss ? 'back' : 'flow'}" x1="${miss ? 120 : 150}" y1="${y}" x2="292" y2="${y}" style="stroke-width:4"/>` +
            `<text class="${miss ? 'lbl-g' : 'lbl-s'}" x="${miss ? 80 : 110}" y="${y}" style="${miss ? 'font-size:34px' : 'font-size:26px'}">${miss ? '?' : 'x' + i}</text>`;
        }).join('')}
        <line class="flow" x1="548" y1="210" x2="690" y2="210"/>
        <text class="lbl-m" x="726" y="210">y</text>
      </svg>
      <h3>Inversion: find the missing input</h3><p class="small muted">frozen model · 1000 rows · score by MSE</p>
    </div>
  </div>`,
  init(el, api) {
    const host = el.querySelector('#wrap-court');
    const fr = Widgets.courtFrame(0, 0, 560);
    const cv = Plot.canvas(host, 560, Math.ceil(fr.h));
    const draw = () => {
      const C = Plot.colors();
      cv.clear(C.paper);
      const ctx = cv.ctx;
      ctx.lineWidth = 1.2;
      for (let i = 0; i < 700; i++) {
        const [x, y] = KOBE.X[i];
        ctx.beginPath(); ctx.arc(fr.sx(x), fr.sy(y), 4, 0, 2 * Math.PI);
        ctx.fillStyle = KOBE.Y[i] ? C.c1 : C.c0; ctx.fill(); ctx.strokeStyle = C.paper; ctx.stroke();
      }
      Widgets.drawCourt(ctx, fr, { color: C.ink, width: 3 });
    };
    draw();
    api.onTheme(draw);
  },
  notes: `
  <p class="time">30 s</p>
  <p class="say">Now you solve two olympiad tasks with exactly what we covered. Kobe: a tiny legal network that predicts whether a shot goes in. Inversion: a frozen network and a missing input column, which you recover with gradients. Tomorrow we continue with harder tasks, so note which parts of today felt shaky.</p>
  <p class="do">Hand out the task files and the starter notebooks (notebooks/02 and 03). Remind them: baseline first, validation split, and save the best model.</p>`,
});
