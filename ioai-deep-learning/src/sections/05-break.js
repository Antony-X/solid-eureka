Deck.section({ id: 'brk', title: 'Break', minutes: 10 });

Deck.css(`
.sec-brk .brk-grid { display: grid; grid-template-columns: 720px 1fr; gap: 96px; align-items: center; flex: 1; min-height: 0; }
.sec-brk .brk-grid .timer-face { font-size: 240px; }
.sec-brk .brk-big .timer-face { font-size: 360px; }
.sec-brk .brk-next { display: flex; flex-direction: column; gap: 40px; }
.sec-brk .tb { display: flex; flex-direction: column; gap: 44px; margin-top: 8px; }
.sec-brk .tb-row { display: grid; grid-template-columns: 56px 1fr 230px; gap: 32px; align-items: baseline; font-size: 44px; line-height: 1.2; }
.sec-brk .tb-n { font-family: var(--font-mono); color: var(--muted); font-size: 36px; }
.sec-brk .tb-v { font-family: var(--font-mono); font-weight: 700; font-size: 40px; text-transform: uppercase; letter-spacing: .06em; }
`);

{
  // the ten statements of pedagogy §4.2: [statement, true?]
  const TB = [
    ['In 1958 the <i>New York Times</i> wrote that the Navy expects the perceptron to be “conscious of its existence”.', true],
    ['Minsky &amp; Papert proved that networks with hidden layers can’t learn XOR.', false],
    ['Dropout was inspired by bank tellers being moved around.', true],
    ['“Neurons that fire together wire together” is Donald Hebb’s sentence.', false],
    ['AlexNet (2012) was trained on two gaming graphics cards.', true],
    ['Grokking was found because someone forgot to stop training before a vacation.', true],
    ['Students stop paying attention after exactly 10 minutes.', false],
    ['The paper that introduced Adam has over 200,000 citations.', true],
    ['One real brain neuron behaves like one artificial neuron.', false],
    ['Gradient descent was invented for neural networks.', false],
  ];
  const rows = (from) => TB.slice(from, from + 5).map(([s, t], k) => `
    <div class="tb-row"><span class="tb-n">${from + k + 1}</span><span>${s}</span>
      <span class="tb-v ${t ? 'ok' : 'bad'}" data-step="${k + 1}">${t ? '✓ true' : '✗ bluff'}</span></div>`).join('');

  Deck.slide({
    id: 'brk-timer',
    title: 'Break: 10 minutes',
    html: `
    <div class="kicker">break</div>
    <div class="brk-grid">
      <div id="brk-timer"></div>
      <div class="brk-next">
        <span class="tag tag-pair">after the break</span>
        <div class="big">True or bluff?</div>
        <p class="lead muted">Ten claims about neural networks.<br>Hand up: true. Fist: bluff.</p>
      </div>
    </div>`,
    init(el, api) {
      Widgets.timer(api, el.querySelector('#brk-timer'), 10, { auto: true });
    },
    notes: `
    <p class="time">10 min</p>
    <p class="say">Ten minutes of break: stand up, drink water, look out of a window. When we come back we play a game: ten claims about neural networks, true or bluff?</p>
    <p class="do">The timer starts by itself (Pause or Reset if needed) and only runs while this slide is visible, so keep it on screen. At 0:00 the numbers turn white on black.</p>
    <p>The game is on the next two slides, about 3 minutes in total; if you are short on time, play only the first.</p>`,
  });

  // plain break used by the main (lean) deck: just the clock
  Deck.slide({
    id: 'brk-plain',
    title: 'Break: 10 minutes',
    html: `
    <h2>Break</h2>
    <div class="fill-center brk-big"><div id="brk-plain-timer"></div></div>`,
    init(el, api) {
      Widgets.timer(api, el.querySelector('#brk-plain-timer'), 10, { auto: true });
    },
    notes: `
    <p class="time">10 min</p>
    <p class="say">Ten minutes: stand up, drink water. After the break we make the network learn.</p>
    <p class="do">The timer starts by itself and only runs while this slide is on screen (Pause or Reset if needed).</p>`,
  });

  const playNotes = `
    <p class="do">For each line: read the claim, count "3, 2, 1, show!": hand up for <b>true</b>, fist for <b>bluff</b>. Press → to reveal the verdict and say the one line below, no more.</p>`;

  Deck.slide({
    id: 'brk-tb1',
    title: 'True or bluff? (1–5)',
    html: `
    <div class="row"><span class="tag tag-pair">hand up = true · fist = bluff</span></div>
    <h2>True or bluff?</h2>
    <div class="tb">${rows(0)}</div>`,
    notes: `
    <p class="time">1.5 min</p>${playNotes}
    <ol>
      <li><b>True.</b> About a machine that could only draw one straight line: hype is old.</li>
      <li><b>Bluff.</b> Only for networks <i>without</i> a hidden layer, but the book was read as "neural nets don't work" and funding dried up.</li>
      <li><b>True.</b> Hinton's bank moved tellers so they could not team up to cheat; dropping random neurons stops them "conspiring".</li>
      <li><b>Bluff.</b> Hebb (1949) had the idea; the catchy sentence is Carla Shatz's (1992).</li>
      <li><b>True.</b> Two GTX 580 cards, five to six days; it won ImageNet 2012 and started the deep-learning boom.</li>
    </ol>`,
  });

  Deck.slide({
    id: 'brk-tb2',
    title: 'True or bluff? (6–10)',
    html: `
    <div class="row"><span class="tag tag-pair">hand up = true · fist = bluff</span></div>
    <h2>True or bluff?</h2>
    <div class="tb">${rows(5)}</div>`,
    notes: `
    <p class="time">1.5 min</p>${playNotes}
    <ol start="6">
      <li><b>True</b> (as the researchers tell it). Someone left a run going over a holiday; long after memorising, the network suddenly generalised: "grokking".</li>
      <li><b>Bluff.</b> No fixed limit exists; attention dips and comes back when you do something.</li>
      <li><b>True.</b> About 200,000 by 2025; you will type Adam this afternoon.</li>
      <li><b>Bluff.</b> Imitating one realistic brain neuron took a deep network of five to eight layers (2021).</li>
      <li><b>Bluff.</b> Cauchy described it in 1847, a century before neural networks.</li>
    </ol>
    <p class="say">Ask: "Who got 8 or more right?" Then move on to how the network learns.</p>`,
  });
}
