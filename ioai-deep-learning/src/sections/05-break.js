Deck.section({ id: 'brk', title: 'Break', minutes: 10 });

Deck.css(`
.sec-brk .brk-grid { display: grid; grid-template-columns: 720px 1fr; gap: 96px; align-items: center; flex: 1; min-height: 0; }
.sec-brk .brk-grid .timer-face { font-size: 240px; }
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
    <p class="say">Ten minutes of break. Stand up, drink water, look out of a window. When we come back we start with a game: ten claims about neural networks, and you decide for each one whether it is true or a bluff.</p>
    <p class="do">The timer starts by itself when this slide appears (Pause or Reset if needed). Keep this slide on screen during the break: the timer only runs while the slide is visible. When it reaches 0:00 the numbers turn white on black.</p>
    <p>The game is on the next two slides (5 claims each, about 3 minutes in total). It wakes everyone up after the break and repeats a few names they will hear again. If you are short on time, play only the first slide. If you are early at the end of the day, it also works as a filler.</p>`,
  });

  const playNotes = `
    <p class="do">For each line: read the claim aloud, count "3, 2, 1, show!", students hold up a hand for <b>true</b> or a fist for <b>bluff</b>. Then press → to reveal the verdict and tell the one-line story below. Do not explain more than one sentence per claim.</p>`;

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
      <li><b>True.</b> New York Times, 8 July 1958: the US Navy showed "the embryo of an electronic computer that it expects will be able to walk, talk, see, write, reproduce itself and be conscious of its existence." The machine could only draw one straight line. Hype is old.</li>
      <li><b>Bluff.</b> Minsky &amp; Papert's 1969 book <i>Perceptrons</i> proved that a network <i>without</i> hidden layers can't compute XOR. They knew a hidden layer could represent it but doubted it could be trained. People read the book as "neural nets don't work" and funding dried up for years. In section 2 we solved XOR with two hidden neurons.</li>
      <li><b>True.</b> Geoffrey Hinton (Reddit "ask me anything", 2016): the tellers at his bank kept changing; he guessed it was so that employees could not cooperate to cheat the bank. Randomly switching off different neurons on every example stops neurons from "conspiring", which reduces overfitting. That is dropout.</li>
      <li><b>Bluff.</b> Hebb's 1949 book describes the idea, but the catchy sentence comes from the neuroscientist Carla Shatz, in <i>Scientific American</i>, 1992. Famous quotes are often not by the famous person.</li>
      <li><b>True.</b> Krizhevsky, Sutskever and Hinton trained AlexNet for five to six days on two GTX 580 gaming cards and won the ImageNet competition in 2012 with 15.3% top-5 error against 26.2% for second place. That started the deep-learning boom.</li>
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
      <li><b>True</b> (as Quanta Magazine reports it). At OpenAI a team member went on vacation and forgot to stop a training run. Long after the network had memorised its training data, it suddenly started to generalise perfectly. "We got lucky… and by lucky, I mean forgetful." We meet grokking again in section 8.</li>
      <li><b>Bluff.</b> The "10-minute attention span" is a myth: studies (Wilson &amp; Korn 2007, Bradbury 2016) find no fixed limit. Attention drops and comes back in short cycles, and doing something (predicting, voting, writing) brings it back. That is why this lecture makes you do something every few minutes.</li>
      <li><b>True.</b> Kingma &amp; Ba's Adam paper (2014) had about 200,000 Google Scholar citations by March 2025, which made it number 4 of all 21st-century papers in the data behind a 2025 <i>Nature</i> ranking. It is the optimizer you will type this afternoon.</li>
      <li><b>Bluff.</b> In 2021 Beniaguev, Segev and London needed a deep network with five to eight layers to imitate one realistic model of a single cortical neuron. Artificial "neurons" are a cartoon of real ones; do not take the brain analogy literally.</li>
      <li><b>Bluff.</b> Augustin-Louis Cauchy described steepest descent in 1847, more than a century before neural networks. "Your optimizer's grandfather was born in 1847."</li>
    </ol>
    <p class="say">Ask: "Who got 8 or more right?" Then move on to the after-break quiz.</p>`,
  });
}
