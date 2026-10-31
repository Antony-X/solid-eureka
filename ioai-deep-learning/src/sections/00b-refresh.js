// A plain-words refresher that assumes nothing: model = knobs, loss = how wrong,
// training = turn the knobs a little, downhill. Joins the Opening section.
Deck.css(`
.sec-open .rf { display: grid; grid-template-columns: repeat(3, 1fr); gap: 56px; flex: 1; min-height: 0; align-items: start; margin-top: 12px; }
.sec-open .rf-card { display: flex; flex-direction: column; gap: 22px; }
.sec-open .rf-card h3 { font-size: 46px; }
.sec-open .rf-card p { font-size: 34px; color: var(--muted); max-width: 15em; }
.sec-open .rf-n { font-family: var(--font-mono); font-size: 30px; color: var(--muted); }
`);

Deck.slide({
  id: 'open-refresh',
  title: 'Three ideas you need today',
  html: `
  <h2>Three ideas you need today</h2>
  <div class="rf">
    <div class="rf-card" data-step="1">
      <span class="rf-n">1</span>
      <svg class="dg" viewBox="0 0 540 300" width="520" height="289" role="img" aria-label="a model is a box with knobs">
        <line class="flow" x1="10" y1="150" x2="118" y2="150"/>
        <text class="lbl-s" x="4" y="110" style="text-anchor:start">shot</text>
        <rect class="box" x="126" y="60" width="228" height="180" rx="8" style="stroke-width:5"/>
        ${[180, 240, 300].map((x, k) => `
          <circle cx="${x}" cy="130" r="24" fill="var(--paper)" stroke="var(--ink)" stroke-width="4"/>
          <line x1="${x}" y1="130" x2="${x + 16 * Math.cos(-0.8 - k)}" y2="${130 + 16 * Math.sin(-0.8 - k)}" stroke="var(--ink)" stroke-width="5" stroke-linecap="round"/>`).join('')}
        <text class="lbl-s" x="240" y="275">knobs = weights</text>
        <line class="flow" x1="362" y1="150" x2="430" y2="150"/>
        <text class="lbl-b" x="486" y="150">41%</text>
      </svg>
      <h3>A model is a box with knobs</h3>
      <p>Numbers go in, a guess comes out. The knobs decide the guess.</p>
    </div>
    <div class="rf-card" data-step="2">
      <span class="rf-n">2</span>
      <svg class="dg" viewBox="0 0 500 300" width="520" height="312" role="img" aria-label="the loss measures how wrong the guess was">
        <text class="lbl" x="120" y="60">guess 41%</text>
        <text class="lbl" x="370" y="60">it went in</text>
        <rect x="40" y="130" width="420" height="44" rx="6" fill="var(--code-bg)" stroke="var(--ink)" stroke-width="3"/>
        <rect x="40" y="130" width="250" height="44" rx="6" fill="var(--grad-soft)" stroke="var(--grad)" stroke-width="3"/>
        <text class="lbl-s" x="40" y="214" style="text-anchor:start">right</text>
        <text class="lbl-s" x="460" y="214" style="text-anchor:end">very wrong</text>
        <text class="lbl" x="250" y="262">loss = how wrong</text>
      </svg>
      <h3>The loss says how wrong</h3>
      <p>One number. Small is good. We compare the guess with the truth.</p>
    </div>
    <div class="rf-card" data-step="3">
      <span class="rf-n">3</span>
      <svg class="dg" viewBox="0 0 500 300" width="520" height="312" role="img" aria-label="training rolls downhill on the loss">
        <path d="M30,40 C120,260 380,260 470,40" fill="none" stroke="var(--ink)" stroke-width="5"/>
        <circle cx="96" cy="150" r="20" fill="var(--grad)"/>
        <path d="M120,182 Q150,214 186,226" fill="none" stroke="var(--grad)" stroke-width="5" stroke-dasharray="14 10" marker-end="url(#ah-grad)"/>
        <text class="lbl-s" x="250" y="280">best knob setting</text>
        <line x1="250" y1="234" x2="250" y2="258" stroke="var(--muted)" stroke-width="3"/>
        <text class="lbl-s" x="80" y="40">loss</text>
      </svg>
      <h3>Training rolls downhill</h3>
      <p>Turn every knob a little in the direction that makes the loss smaller. Repeat.</p>
    </div>
  </div>
  <p class="lead" data-step="4">Today: a much bigger box, and how to train it well.</p>`,
  notes: `
  <p class="time">3 min</p>
  <p class="say">Before we start, three ideas in plain words. You may know them already from classical ML; if so, this is a one-minute check. Everything today is built on these three.</p>
  <p class="do">Press → for each card. After each one, ask a student to say it back in their own words.</p>
  <ol>
    <li><b>A model is a box with knobs.</b> Numbers go in (for Kobe: where the shot was taken), a guess comes out (the chance it goes in). The knobs are the model's weights. Different knob settings give different guesses. Logistic regression is a small box with three knobs; today's networks have hundreds.</li>
    <li><b>The loss says how wrong the guess was.</b> We compare the guess with what really happened and get one number. Small is good. Guessing 41% for a shot that went in costs more than guessing 90%.</li>
    <li><b>Training rolls downhill.</b> For every knob we can compute which direction makes the loss smaller (that is what the gradient tells us; backpropagation is the method that computes it for every knob at once). We turn each knob a small step that way, and repeat thousands of times. That is gradient descent.</li>
  </ol>
  <p class="ask">If the loss goes up after a step, what went wrong?</p>
  <p class="ans">The step was too big: we jumped over the bottom of the valley. The size of the step is the learning rate; we will play with it after the break.</p>
  <p>If students already know all of this well, move on quickly. If they look unsure, draw the valley on the board (key W opens a blank whiteboard, D draws) and roll a "ball" down it by hand.</p>`,
});
