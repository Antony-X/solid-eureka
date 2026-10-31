Deck.section({ id: 'wrap', title: 'Wrap-up', minutes: 8 });

Deck.css(`
.sec-wrap .can { display: flex; flex-direction: column; gap: 36px; font-size: 48px; line-height: 1.15; margin-top: 16px; }
.sec-wrap .can div { display: flex; gap: 36px; align-items: baseline; }
.sec-wrap .can b { font-family: var(--font-mono); color: var(--muted); font-weight: 600; font-size: 36px; min-width: 1.2em; }
.sec-wrap .exit { display: flex; flex-direction: column; gap: 28px; }
.sec-wrap .exit-row { display: grid; grid-template-columns: 48px 1fr 700px; gap: 40px; align-items: baseline; font-size: 40px; line-height: 1.2; }
.sec-wrap .exit-row .n { font-family: var(--font-mono); font-size: 34px; color: var(--muted); }
.sec-wrap .exit-row .a { border-left: 8px solid var(--ok); padding-left: 24px; }
.sec-wrap .exit-row .a.open { border-left-color: var(--rule); color: var(--muted); }
.sec-wrap .tasks { display: grid; grid-template-columns: 1fr 1fr; gap: 96px; align-items: start; flex: 1; min-height: 0; }
.sec-wrap .task { display: flex; flex-direction: column; gap: 16px; }
.sec-wrap .task .fig { height: 576px; display: flex; align-items: center; }
`);

Deck.slide({
  id: 'wrap-loop',
  title: 'The whole lecture in one picture',
  html: `
  <h2>The whole lecture in one picture</h2>
  <div class="fill-center">${Widgets.loopSVG({ w: 1640, h: 720, notes: true })}</div>`,
  notes: `
  <p class="time">2 min</p>
  <p class="say">The whole lecture is one loop, with today's words on every box. Data is scaled, batched and split; the model is linear layers with activations between them; the loss is MSE for numbers and cross-entropy for yes/no or classes. Then loss.backward() finds the gradients and optimizer.step() moves the weights, with Adam at lr 1e-3 as the default start.</p>
  <p class="ask">Ask two or three students to explain one arrow each, in their own words.</p>
  <p class="ans">Good answers: the model makes a guess and the loss compares it with the label; backward works out which way to nudge every weight; the optimizer moves each weight a small step that way; we repeat and watch the validation loss.</p>`,
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
  <p class="do">Read each line and ask for a quick show of hands: "who feels OK with this?" Anything with few hands is what to repeat at the start of tomorrow; note it.</p>`,
});

Deck.slide({
  id: 'wrap-exit',
  title: 'Exit ticket',
  html: `
  <div class="row"><span class="tag tag-paper">on paper · 3 min · hand it in</span></div>
  <h2>Exit ticket</h2>
  <div class="exit">
    <div class="exit-row"><span class="n">1</span><span>Put in order: <span class="mono">backward</span>, <span class="mono">step</span>, <span class="mono">zero_grad</span>, forward + loss</span>
      <span class="a" data-step="1"><span class="mono">zero_grad</span> → forward + loss → <span class="mono">backward</span> → <span class="mono">step</span></span></div>
    <div class="exit-row"><span class="n">2</span><span>Kobe: what does a model that learned nothing score?</span>
      <span class="a" data-step="2">55% accuracy, log loss 0.687</span></div>
    <div class="exit-row"><span class="n">3</span><span>True or false: train loss below val loss means overfitting.</span>
      <span class="a" data-step="3">false: a small gap is normal; watch val loss <i>rise</i></span></div>
    <div class="exit-row"><span class="n">4</span><span><span class="mono">BCEWithLogitsLoss</span> wants probabilities or logits?</span>
      <span class="a" data-step="4">logits (no sigmoid in the model)</span></div>
    <div class="exit-row"><span class="n">5</span><span>Inversion: which tensor gets <span class="mono">requires_grad</span>?</span>
      <span class="a" data-step="5">only the missing input column</span></div>
    <div class="exit-row"><span class="n">6</span><span>What is still muddy for you?</span>
      <span class="a open">your answer: we start there tomorrow</span></div>
  </div>`,
  notes: `
  <p class="time">5 min (3 to write, 2 to reveal)</p>
  <p class="say">Last thing before the tasks: six questions, on a sheet of paper with your name. No notes. This is not graded; it tells me what to repeat tomorrow.</p>
  <p class="do">Give them 3 minutes. Then press → five times to reveal answers 1–5; after each, ask "hands up if you had it". Collect the sheets at the end. Tonight, read every answer to question 6 and start tomorrow with the most common one.</p>
  <ol>
    <li>zero_grad → forward + loss → backward → step. Most common mistake: zero_grad after backward (that wipes the gradients you just computed) or forgetting it (gradients pile up: 2, 4, 6…).</li>
    <li>"Always miss" is right 55% of the time (Kobe made 44.6%). The best constant guess (always say 44.6%) has log loss 0.687. Any real model must beat both; our legal 2-8-8-1 network reached about 0.662 and 61%.</li>
    <li>False as stated. Training loss is almost always a bit lower than validation loss, because the model has seen those examples. Overfitting is when validation loss starts going <i>up</i> while training loss keeps going down (or the gap keeps growing).</li>
    <li>Logits, the raw scores. The loss applies the sigmoid itself. Adding nn.Sigmoid() at the end does not crash; it quietly ruins the probabilities: accuracy still looked fine (61%), but the true log loss was about 4.5 (the cliffhanger from before the break).</li>
    <li>Only the missing input column (one number per row). The model's weights stay frozen: we change the input, not the network.</li>
    <li>Open question, no right answer. Typical answers: "why we need the activation", "what the gradient of the input means", "how to choose the learning rate".</li>
  </ol>`,
});

Deck.slide({
  id: 'wrap-tasks',
  title: 'Now: two tasks',
  html: `
  <h2>Now: two tasks. Tomorrow: harder ones.</h2>
  <div class="tasks">
    <div class="task"><div class="fig" id="wrap-court"></div><h3>Kobe: will it go in?</h3><p class="small muted">2 inputs · ≤ 3 linear layers · ≤ 8 neurons</p></div>
    <div class="task">
      <div class="fig">
      <svg class="dg" viewBox="0 0 816 576" width="816" height="576" role="img" aria-label="frozen model with one missing input">
        <rect class="box" x="330" y="44" width="250" height="488" style="stroke-width:5"/>
        <text class="lbl-b" x="455" y="258">model</text>
        <text class="lbl-s" x="455" y="316" style="font-size:30px">frozen</text>
        ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => {
          const y = 72 + i * 48;
          const miss = i === 3;
          return `<line class="${miss ? 'back' : 'flow'}" x1="${miss ? 150 : 160}" y1="${y}" x2="318" y2="${y}" style="stroke-width:4"/>` +
            `<text class="${miss ? 'lbl-g' : 'lbl-s'}" x="${miss ? 106 : 110}" y="${y}" style="text-anchor:middle;${miss ? 'font-size:48px;font-weight:700' : 'font-size:30px'}">${miss ? '?' : 'x' + i}</text>`;
        }).join('')}
        <line class="flow" x1="588" y1="288" x2="730" y2="288"/>
        <text class="lbl-m" x="770" y="288" style="font-size:44px">y</text>
      </svg>
      </div>
      <h3>Inversion: find the missing input</h3><p class="small muted">frozen model · 1,000 rows · score by MSE</p>
    </div>
  </div>`,
  init(el, api) {
    const host = el.querySelector('#wrap-court');
    const fr = Widgets.courtFrame(0, 0, 576);
    const cv = Plot.canvas(host, 576, Math.ceil(fr.h));
    const draw = () => {
      const C = Plot.colors();
      cv.clear(C.paper);
      const ctx = cv.ctx;
      ctx.lineWidth = 2;
      for (let i = 0; i < 600; i++) {
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
  <p class="time">30 s</p>
  <p class="say">Now you solve two olympiad tasks with exactly what we covered. Kobe: a tiny legal network that predicts from the position whether a shot goes in. Inversion: a frozen network and one zeroed input column, which you recover by changing the input instead of the weights.</p>
  <p class="do">Hand out the task files and the starter notebooks (notebooks/02_kobe_starter, notebooks/03_inversion_starter). Remind them: baseline first, a validation split, save the best model. The magenta dashed arrow is the input that learns. Ask them to note what felt shaky; tomorrow's tasks are harder.</p>`,
});
