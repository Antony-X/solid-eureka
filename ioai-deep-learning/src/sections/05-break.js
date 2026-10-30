Deck.section({ id: 'brk', title: 'Break', minutes: 10 });

Deck.css(`
.sec-brk .brk-grid { display: grid; grid-template-columns: 2fr 3fr; gap: 96px; align-items: start; flex: 1; min-height: 0; }
.sec-brk .puzzle { display: flex; flex-direction: column; gap: 28px; }
.sec-brk .truth { font-family: var(--font-mono); font-size: 34px; border-collapse: collapse; }
.sec-brk .truth td, .sec-brk .truth th { padding: 6px 26px; text-align: center; border-bottom: 2px solid var(--rule); }
.sec-brk .truth th { font-size: 26px; color: var(--muted); font-weight: 600; }
`);

Deck.slide({
  id: 'brk-timer',
  title: 'Break: 10 minutes',
  html: `
  <div class="kicker">break</div>
  <div class="brk-grid">
    <div class="col">
      <h2>Ten minutes</h2>
      <div id="brk-timer"></div>
    </div>
    <div class="puzzle">
      <span class="tag tag-paper">optional puzzle</span>
      <p class="lead">What does this network compute for 0/1 inputs?</p>
      <div class="row" style="gap:40px;align-items:center">
      ${(() => {
        // h1 = ReLU(x1 + x2), h2 = ReLU(x1 + x2 - 1), y = h1 - 2 h2  ->  XOR
        const IN = [[60, 70], [60, 290]], HID = [[330, 70], [330, 290]], OUT = [560, 180];
        const e = (p, q, cls, lab, t) => {
          const lx = p[0] + (q[0] - p[0]) * t, ly = p[1] + (q[1] - p[1]) * t;
          return `<line class="w ${cls}" x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${q[1]}" style="stroke-width:6"/>` +
            `<rect x="${lx - 24}" y="${ly - 20}" width="48" height="40" fill="var(--paper)"/><text class="lbl" x="${lx}" y="${ly}">${lab}</text>`;
        };
        return `<svg class="dg" viewBox="0 0 640 380" width="560" height="333" role="img" aria-label="2-2-1 ReLU network">
          ${e(IN[0], HID[0], 'pos', '1', 0.5)}${e(IN[0], HID[1], 'pos', '1', 0.28)}
          ${e(IN[1], HID[0], 'pos', '1', 0.28)}${e(IN[1], HID[1], 'pos', '1', 0.5)}
          ${e(HID[0], OUT, 'pos', '+1', 0.5)}${e(HID[1], OUT, 'neg', '−2', 0.5)}
          <circle class="nrn in" cx="60" cy="70" r="40"/><text class="lbl-m" x="60" y="70">x₁</text>
          <circle class="nrn in" cx="60" cy="290" r="40"/><text class="lbl-m" x="60" y="290">x₂</text>
          <circle class="nrn" cx="330" cy="70" r="40"/><text class="lbl-s" x="330" y="14">bias 0</text>
          <circle class="nrn" cx="330" cy="290" r="40"/><text class="lbl-s" x="330" y="352">bias −1</text>
          <circle class="nrn out" cx="560" cy="180" r="40"/><text class="lbl-m" x="560" y="180">y</text>
          <path d="M312,82 L330,82 L348,58" fill="none" style="stroke:var(--ink);stroke-width:4"/>
          <path d="M312,302 L330,302 L348,278" fill="none" style="stroke:var(--ink);stroke-width:4"/>
        </svg>`;
      })()}
      <table class="truth">
        <tr><th>x₁</th><th>x₂</th><th>y</th></tr>
        <tr><td>0</td><td>0</td><td><span data-step="1">0</span></td></tr>
        <tr><td>0</td><td>1</td><td><span data-step="1">1</span></td></tr>
        <tr><td>1</td><td>0</td><td><span data-step="1">1</span></td></tr>
        <tr><td>1</td><td>1</td><td><span data-step="1">0</span></td></tr>
      </table>
      </div>
      <p class="lead" data-step="2"><b>XOR</b>, the function one neuron can't learn.</p>
    </div>
  </div>`,
  init(el, api) {
    Widgets.timer(api, el.querySelector('#brk-timer'), 10, { auto: true });
  },
  notes: `
  <p class="time">10 min</p>
  <p class="do">The timer starts by itself when this slide appears (Pause/Reset if needed). Leave the slide up during the break. Students who stay can try the puzzle on paper.</p>
  <p class="ask">What does this network output for the four inputs?</p>
  <p class="ans">Hidden 1 = ReLU(x₁ + x₂), hidden 2 = ReLU(x₁ + x₂ − 1), y = h₁ − 2h₂. For (0,0): 0. For (0,1) or (1,0): h₁ = 1, h₂ = 0, so y = 1. For (1,1): h₁ = 2, h₂ = 1, y = 2 − 2 = 0. That is XOR: exactly the function Minsky and Papert showed a single perceptron cannot compute, solved with just two hidden ReLU neurons.</p>
  <p class="do">After the break press → twice to reveal the truth table and the answer, and spend one minute on it before the next section. It is a nice bridge back in: "a hidden layer of two neurons solves the problem that froze the field for a decade".</p>`,
});
