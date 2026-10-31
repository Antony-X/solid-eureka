Deck.section({ id: 'brk', title: 'Break', minutes: 10 });

Deck.css(`
.sec-brk .brk-grid { display: grid; grid-template-columns: 560px 1fr; gap: 80px; align-items: start; flex: 1; min-height: 0; }
.sec-brk .tb { display: flex; flex-direction: column; gap: 22px; }
.sec-brk .tb-row { display: grid; grid-template-columns: 44px 1fr 170px; gap: 24px; align-items: baseline; font-size: 34px; line-height: 1.25; }
.sec-brk .tb-n { font-family: var(--font-mono); color: var(--muted); font-size: 30px; }
.sec-brk .tb-v { font-family: var(--font-mono); font-weight: 700; font-size: 30px; text-transform: uppercase; letter-spacing: .06em; }
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
    <div class="col">
      <div class="row"><span class="tag tag-pair">true or bluff?</span></div>
      <div class="tb">
        <div class="tb-row"><span class="tb-n">1</span><span class="tb-s">In 1958 the New York Times said the Navy expects the perceptron to be “conscious of its existence”.</span><span class="tb-v ok" data-step="1">✓ true</span></div>
        <div class="tb-row"><span class="tb-n">2</span><span class="tb-s">Minsky &amp; Papert proved multi-layer networks can't learn XOR.</span><span class="tb-v bad" data-step="2">✗ bluff</span></div>
        <div class="tb-row"><span class="tb-n">3</span><span class="tb-s">Dropout was inspired by bank tellers being moved around.</span><span class="tb-v ok" data-step="3">✓ true</span></div>
        <div class="tb-row"><span class="tb-n">4</span><span class="tb-s">AlexNet (2012) was trained on two gaming GPUs.</span><span class="tb-v ok" data-step="4">✓ true</span></div>
        <div class="tb-row"><span class="tb-n">5</span><span class="tb-s">Grokking was found because someone forgot to stop training before a vacation.</span><span class="tb-v ok" data-step="5">✓ true</span></div>
        <div class="tb-row"><span class="tb-n">6</span><span class="tb-s">Gradient descent was invented for neural networks.</span><span class="tb-v bad" data-step="6">✗ bluff</span></div>
      </div>
    </div>
  </div>`,
  init(el, api) {
    Widgets.timer(api, el.querySelector('#brk-timer'), 10, { auto: true });
  },
  notes: `
  <p class="time">10 min break + 3 min game after it</p>
  <p class="do">The timer starts by itself when this slide appears (Pause/Reset if needed). Leave the slide up; students can think about the six statements during the break. After the break, read each statement aloud, students hold up a hand for "true" or a fist for "bluff", then press → to reveal the verdict and tell the one-line story.</p>
  <ol>
    <li><b>True.</b> NYT, 8 July 1958: the Navy revealed "the embryo of an electronic computer that it expects will be able to walk, talk, see, write, reproduce itself and be conscious of its existence." The hype was enormous for a machine that drew one straight line.</li>
    <li><b>Bluff.</b> Minsky &amp; Papert's 1969 book proved that a <i>single-layer</i> perceptron can't compute XOR. They knew multi-layer networks could represent it but doubted they could be trained. The book was read as a verdict on all neural nets and funding dried up. Backprop (popularised in 1986) answered it; the XOR network from section 2 has just two hidden neurons.</li>
    <li><b>True.</b> Geoffrey Hinton (Reddit AMA, 2016): his bank kept moving tellers around, he guessed it was to stop employees cooperating to defraud the bank, and realised that randomly removing different neurons on each example would stop neurons from "conspiring" — that is, from overfitting.</li>
    <li><b>True.</b> Krizhevsky, Sutskever and Hinton trained AlexNet for five to six days on two GTX 580 gaming cards, and won ImageNet 2012 with 15.3% top-5 error against 26.2% for second place. That started the deep-learning boom.</li>
    <li><b>True</b> (as reported by Quanta Magazine). At OpenAI, a team member went on vacation and forgot to stop a run; the network, long after memorising its training set, suddenly generalised perfectly. "We got lucky… and by lucky, I mean forgetful."</li>
    <li><b>Bluff.</b> Augustin-Louis Cauchy described steepest descent in 1847, more than a century before neural networks. "Your optimizer's grandfather was born in 1847."</li>
  </ol>`,
});
