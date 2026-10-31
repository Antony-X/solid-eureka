# Coach's guide: "Neural networks, hands-on"

This guide teaches you the material behind the three-hour lecture and the two afternoon tasks. It sits next to:

- `lecture.html`, the slide deck. Every slide has speaker notes.
- `SCRIPT.md`, the same notes exported slide by slide. It tells you *what to say on each slide*.
- `notebooks/01_live_coding.ipynb`, the live-coding notebook. `solutions/` holds the reference solutions for both tasks.

This file explains *why* each slide is true, what students get wrong, and how to answer them. Tonight, read sections 4 and 5. Tomorrow morning, work through section 1. Print section 6 for the desk.

"Our run" marks numbers from our own experiments on the real data. Students' numbers will differ a little; the *ordering* is what matters.

---

## 1. Before the session

### 1.1 Setup checklist

**Displays**
- [ ] Connect the laptop to the projector as an **extended display**, not mirrored.
- [ ] Open `lecture.html` in **Chrome or Edge**. It is one self-contained file; no internet needed.
- [ ] Drag the window to the projector and press **F** (full screen).
- [ ] Press **P**: a presenter window opens with the notes, a pace clock and the next slide's title. Drag it to the laptop; both windows stay in sync. If nothing opens, allow pop-ups and press P again.
- [ ] Only one display? **N** shows the notes on the main screen, where students see them too. Glance at it during pair work only, and keep a printed `SCRIPT.md`.
- [ ] Press **T** until the theme is **light** in a lit room. Dark slides lose most of their contrast when room light washes out the projector's black.

| Key | What it does |
|---|---|
| → / space / clicker | next build step or slide |
| ← | back |
| **B** | black screen: pulls eyes to you or the board |
| **O** | slide map; click to jump |
| 12 Enter | jump to slide 12 |
| D / E / W | draw on the slide / erase / blank whiteboard |
| L | laser pointer |
| C / R | show the clock / reset it |
| ? | all keys |

The pace clock starts when you leave the title slide; the presenter window shows each section's planned times and says "behind plan" when you are late.

**Live coding**
- [ ] Open `notebooks/01_live_coding.ipynb` in Jupyter or Colab with `data/kobe/data_train.csv` (in Colab, upload the CSV and set `DATA_DIR = "."`).
- [ ] Run the setup and data cells before class. Big font (Ctrl/Cmd +), light theme, notifications off.
- [ ] Run the whole notebook once (about a minute) and note *your* numbers.
- [ ] Keep the finished notebook and `solutions/` open on a second device.

**Room**
- [ ] Paper and pens: every prediction goes on paper *before* the reveal.
- [ ] A visible timer (activity slides have their own; keep a phone as backup), a board and markers.
- [ ] Task files ready (section 5): Kobe `data_train.csv`; Inversion `model.pt` and `data.csv`; the two starter notebooks (`notebooks/02` and `03`).
- [ ] Decide the Kobe rulings (section 5.1) before class. Students will ask.

### 1.2 What to print

**The vocabulary card, one per student**, handed out during the warm-up. Learning the names before the code is a cheap, well-evidenced win (Mayer's "pre-training" principle).

> **Parameter**: a number the model learns (a weight or a bias). The 2-8-8-1 Kobe net has 105.
> **Hyper-parameter**: a number *you* choose: learning rate, batch size, width, epochs, seed.
> **Forward pass**: computing the output from the input, layer by layer.
> **Logit**: the raw score *z* before the sigmoid; *p* = σ(*z*). *z* = 0 means 50%.
> **Loss**: one number saying how wrong the predictions are. Training makes it smaller.
> **Backward pass**: `loss.backward()` computes the gradient of the loss for every parameter.
> **Optimizer**: the rule that turns gradients into updates (SGD, Adam).
> **Batch**: the examples used for one update (for example 64 shots).
> **Step**: one update, using one batch.
> **Epoch**: one full pass over the training data, ⌈N / B⌉ steps.

Also print: the 12-line bug-hunt code from section 8 of the deck (pairs work faster on paper), the two task statements (section 5), and for yourself the plan (section 2) and the Q&A (section 6).

### 1.3 A 15-minute rehearsal

| Minutes | Do this |
|---|---|
| 0–3 | Open the deck, press P, check that both windows move together, set the light theme, look at the whole map (O). |
| 3–8 | Run each live demo once: the playground (section 1), the hinge builder (3), the learning-rate ball and the optimizer race (6), the Kobe court net (7 and 9). |
| 8–13 | Run the live-coding notebook's four planned mistakes (section 3.4) and write down your numbers. |
| 13–15 | Say three things aloud without notes: Adam in one sentence; why a sigmoid must not go before `BCEWithLogitsLoss`; what the universal approximation theorem does *not* say. If one comes out muddled, reread it in section 4. |

---

## 2. The plan at a glance

Clock times from `src/OUTLINE.md`.

| # | Section | Clock | Min | What students do | Number to remember |
|---|---|---|---|---|---|
| 0 | Opening | 0:00–0:10 | 10 | Warm-up recall Q1–Q3 on paper; predict Kobe's make % | 44.6% made → "always miss" ≈ 55% |
| 1 | Why neural networks? | 0:10–0:22 | 12 | Predict "one straight line?"; A1 pair sketch | log loss: constant 0.687, logistic 0.675 |
| 2 | From one neuron to an MLP | 0:22–0:40 | 18 | E1 forward pass; invent XOR weights; predict shapes; count parameters | 2-8-8-1 = 105 parameters |
| 3 | Activations: any function | 0:40–1:02 | 22 | P1 vote; build a hat from ReLUs; mini-quiz | σ′ ≤ 0.25; ReLU vs tanh 0.662 vs 0.664 |
| 4 | Loss: how wrong are we? | 1:02–1:15 | 13 | Rank four losses; predict the first loss; **cliffhanger vote, no reveal** | ln 2 = 0.693 at init |
| 5 | Break | 1:15–1:25 | 10 | True-or-Bluff statements on screen | |
| 6 | Gradient descent and optimizers | 1:25–1:47 | 22 | True-or-Bluff reveal and recall Q4–Q9; one GD step on paper; epoch arithmetic; predict Adam's first step and the Kobe optimizer chart | Adam lr 1e-3: each weight moves ≈ 0.001 per step |
| 7 | The training loop, live | 1:47–2:15 | 28 | Predict before every run; four planned mistakes; cliffhanger reveal | raw inputs: loss at init ≈ 2.3; double sigmoid: log loss 4.69 |
| 8 | Generalization and debugging | 2:15–2:30 | 15 | Predict P9, P13; **bug hunt in pairs, 4 min** | 2-256-256-1 on 500 shots: train 0.37, val 1.23 |
| 9 | Olympiad playbook and the two tasks | 2:30–2:52 | 22 | Predict the Kobe ceiling; two inversion toys; **plan the first three experiments** | Kobe ceiling ≈ 61%; Inversion 0.968 → 0.0045 |
| 10 | Wrap-up | 2:52–3:00 | 8 | Exit ticket Q10–Q15 | |

The True-or-Bluff reveal (about 3 minutes) comes *after* the break, inside section 6's time. Keep it brisk.

**Checkpoints:** on the break slide at 1:15; finishing the live coding at 2:15; starting the tasks at 2:30. More than 5 minutes behind at a checkpoint means start cutting.

**Never cut:** the warm-up recall, the cliffhanger vote and reveal, the five beats in the live coding, the bug hunt, the planning activity, the exit ticket.

**If late, cut in this order**
1. The "steep S-curves make bumps" slide in section 3 (marked optional).
2. The learning-rate schedules slide in section 6. Say one sentence instead: "for small tasks, a constant lr plus keeping the best epoch is fine."
3. The double-descent and grokking story in section 8 (keep only the vacation sentence).
4. The vote on the Kobe optimizer chart (just reveal it).
5. Toy 1 in section 9. Keep Toy 2 (two roots): it is the key to the Inversion task.
6. The error-gallery slide in section 8. Point students to section 4.13 of this guide.

**If early, add**
- E2, the backward pass by hand (numbers in section 4.2).
- E8, one Adam step by hand: g = 4, β₁ = 0.9, β₂ = 0.999, lr 0.001 → m̂ = 4, v̂ = 16, step 0.001. With g = 0.04: still 0.001.
- Optimizer charades: one partner describes how SGD, momentum and Adam walk down a narrow valley; the other names which is which.
- A learning-rate sweep in the notebook (1e-4 to 1) with a plot.
- "Know your ceiling": students compute Kobe's make rate by distance and find the only zone above 50%.

---

## 3. How to teach: the moves

### 3.1 Predict, then reveal

Students who only *watch* a demo understand it no better than students who never saw it; students who predict first learn significantly more (Crouch et al. 2004). Every demo in the deck starts with a prediction:

1. Show the setup. "Don't answer yet."
2. 30 seconds of silent thinking.
3. Public commitment: write it down, then hands or fingers for A/B/C/D.
4. If the vote is split (roughly 30–70% right): 60 seconds with a neighbour, then vote again.
5. Reveal.
6. Ask "Why?" and let a student explain before you do.

Over 80% right on the first vote: reveal and move on. Never punish a wrong prediction. Name the misconception, not the student: "Many strong people predict A. Here is why A is tempting."

### 3.2 Peer instruction

Use it on the hard concept questions: P1 (10 linear layers vs 1), the cliffhanger (sigmoid plus `BCEWithLogitsLoss`), P9 (an 80× bigger net), and "does the UAT guarantee a perfect fit on Kobe?". Vote alone, discuss in pairs, vote again, explain. Discussion helps even when nobody in the pair knew the answer (Smith et al. 2009).

### 3.3 Worked, then faded, then independent

Do one hand calculation fully on the board (E1). Do the next half with them (E2, optional). Leave the rest to them (XOR weights, the ReLU hat). Fade fast: over-guiding strong students can hurt them (the "expertise reversal effect"). For the "invent first" tasks, let them struggle for two minutes before you show the answer.

### 3.4 Live coding

**Rules.** Imports and data loading are pre-run; type the model and loop yourself, saying every line aloud, then read the output aloud. Ask "What will this print?" before *every* run. Stick to the rehearsed code. If something breaks, debug aloud for up to a minute, then switch to the finished copy.

**The four planned mistakes, in order**

| # | Mistake | Ask first | What happens | The lesson |
|---|---|---|---|---|
| 1 | Feed raw coordinates | "What will the first loss be?" (≈ 0.69) | ≈ 2.3 (2.36 with seed 0; other seeds 2.1 and 3.8) | Standardise with the *training* mean and std. The loss-at-init check catches it. |
| 2 | Delete `opt.zero_grad()` | Crash, same, or something else? | No error; 3-seed mean: log loss 0.686, accuracy 53.4%, below "always miss". The notebook's seed-0 run can be worse (one run predicted "made" for every shot, 44%). | Gradients add up: 2, then 4, then 6. |
| 3 | `nn.Sigmoid()` at the end with `BCEWithLogitsLoss` (the cliffhanger) | Re-vote the question from before the break | Printed loss looks normal (≈ 0.68), accuracy a normal ≈ 61%, but the true log loss is ≈ 4.6–4.7 and about 76% of outputs are below 0.01 or above 0.99 | A bug can keep accuracy and destroy the metric. |
| 4 | Labels of shape (N,) instead of (N, 1) | "Will this run?" | `BCEWithLogitsLoss` stops with an error (read it aloud). `MSELoss` only warns and returns a wrong number: perfect predictions give 4.0 on five points. | Print shapes. This matters in the Inversion task. |

### 3.5 When you can't answer a question

- Check section 6 first: most likely questions are there.
- Otherwise say "Good question. I don't know for sure, and I won't guess." Strong students spot invented answers.
- If a one-minute experiment settles it, make it a prediction: "Let's predict, then try it."
- Off-topic (transformers, CNNs, GPUs): write it in a "parking lot" corner of the board; answer at the end or tomorrow.
- If a student turns out right and you were wrong, say so plainly.

### 3.6 Keeping the energy up for three hours

- At minute 2, say: "This will feel harder than a lecture. That is the learning." Students in active classes learn more but *feel* they learn less (Deslauriers et al. 2019). Judge the session by the exit tickets.
- Never talk more than about 6 minutes without students doing something. Attention lapses come in shorter cycles as a lecture goes on, and questions and demos reset them (Bunce et al. 2010), so the second half has shorter segments.
- Cold-call with wait time: ask, wait 3–5 seconds, then name a student.
- Press B to pull attention to you. Walk around during pair work and listen.
- One short story per section (section 7), followed by "and this matters for your code because…".
- Start the break on time, even mid-section.

---

## 4. The content, explained for you

Each topic: what to say, the one picture to draw, the key numbers, what students get wrong, and the questions they will ask.

### 4.1 Why linear models fail

**Say.** Logistic regression's decision boundary *p* = 0.5 is where **w**·**x** + *b* = 0: a straight line. If the classes can't be separated by a line (a circle inside a ring, XOR, spirals), no amount of training helps; the model family only contains lines. Kobe's data is the same: his chance depends mainly on distance from the rim, so the lines of equal chance are arcs. Two fixes. Invent a feature: add *x*² + *y*², the circle lifts into a bowl, and a flat plane cuts the bowl in a circle. Or let the model learn the features, because nobody knows the right feature for a spiral or a court. That is a hidden layer.

**Draw.** Circle data with one obviously failing line. Next to it, the bowl sliced by a horizontal plane.

**Numbers (our run).** Make rate 62.8% at 0–3 ft, 39.8% at 16–24 ft, 6.1% beyond 30 ft. Log loss: constant 0.687, logistic regression 0.675, small MLP 0.662. The best possible straight line on the task file reaches 58.6% accuracy.

**They will ask.**
- *"Why not just add x² and y²?"* For a circle that works perfectly. For a spiral or a court you would have to guess; hidden layers learn it.
- *"Why did neural networks stall after 1969?"* A single-layer perceptron can't compute XOR, and nobody knew how to train hidden layers until backprop spread in 1986.

### 4.2 The neuron and the MLP

**Say.** One neuron is logistic regression without the final sigmoid: a weighted sum plus a bias, then an activation. Its line *z* = 0 cuts the plane, with the weight vector perpendicular to it. A hidden layer is several neurons side by side, each drawing its own line; the next layer combines their reports. Think of a committee of line-drawers and a manager who weighs their reports. In matrix form: **h** = φ(*W*₁**x** + **b**₁), ŷ = *W*₂**h** + *b*₂. Depth = number of layers; width = neurons per layer. Training is the backprop they know; autograd applies the chain rule. XOR needs just two hidden ReLUs: h₁ = ReLU(x₁ + x₂), h₂ = ReLU(x₁ + x₂ − 1), y = h₁ − 2h₂ gives 0, 1, 1, 0.

**Draw.** The 2-8-8-1 network with the shapes written on the arrows: W₁ 8×2, W₂ 8×8, W₃ 1×8.

**Numbers (E1, worked).** **x** = (1, 2); *W*₁ = [[1, −1], [0.5, 1]], **b**₁ = (0, −1); **w**₂ = (2, −1), *b*₂ = 0.5; target *y* = 1. Then **a**₁ = (−1, 1.5), **h** = (0, 1.5) (unit 1 is off), *z* = −1, *p* = 0.269, loss 1.313. Optional E2 (lr 0.1): δ*z* = *p* − *y* = −0.731; ∂*L*/∂**w**₂ = (0, −1.097); unit 1 gets gradient 0 because its ReLU was off; after one step *p* = 0.408 and the loss is 0.896.

**Students get wrong.** "Neurons work like brain neurons." "Hidden unit 3 means something" (shuffle the units and you get the same network).

**They will ask.**
- *"Is it like a brain?"* Loosely inspired at most. Mimicking one model cortical neuron took a 5–8-layer deep network (Beniaguev et al. 2021).
- *"Two hidden layers but three linear layers?"* Each hidden layer is a linear layer plus an activation; the third linear layer outputs the logit.

### 4.3 Tensor shapes and parameter counts

**Say.** Data is (batch, features), for example (32, 2). `nn.Linear(2, 8)` turns it into (32, 8). PyTorch stores the weight as (out, in) = (8, 2), one row per output neuron, and computes **x** @ *W*ᵀ + **b**. Each `Linear(in, out)` has in·out + out parameters. Wrong shapes are the most common beginner error: print `.shape` constantly.

**Draw.** Rectangles: (32×2) times (2×8) equals (32×8); the inner 2s cancel.

**Numbers.** `Linear(2, 8)` = 24. 2-8-8-1 = 24 + 72 + 9 = **105** (the Kobe maximum). 2-16-1 = 65. 2-64-64-64-1 = 8,577. 784-128-10 = 101,770. GPT-3 = 175 billion, about 1.7 billion Kobe nets. In code: `sum(p.numel() for p in model.parameters())`.

**Students get wrong.** Expecting (in, out); forgetting biases; thinking the batch size changes the count.

**They will ask.**
- *"Why (8, 2) and not (2, 8)?"* Row *j* is neuron *j*'s weight vector.
- *"Why 'shapes cannot be multiplied'?"* The data's column count doesn't match `in_features` (section 4.13).

### 4.4 Activations and why they are needed

**Say.** Without a nonlinearity, layers collapse: *W*₂(*W*₁**x** + **b**₁) + **b**₂ = (*W*₂*W*₁)**x** + (*W*₂**b**₁ + **b**₂), one linear layer. Ten linear layers represent exactly the same functions as one. The activation is what bends the function.

| Activation | What it is | Use it for |
|---|---|---|
| ReLU | max(0, *z*); slope 1 or 0 | the default in hidden layers |
| Leaky ReLU, ELU | ReLU with a small slope or curve below 0 | when units die (4.7) |
| Sigmoid | range (0, 1) | turning a final logit into a probability; not deep hidden layers |
| tanh | range (−1, 1), zero-centred | small, smooth nets |
| GELU, SiLU | smooth ReLUs | transformers |

**Output rule:** no activation inside the model. Output the logit and let the loss add the sigmoid or softmax. For regression, no activation either. (The Kobe *submission* is a deliberate exception; see 5.1.) A ReLU net is piecewise linear, so its decision regions are polygons.

**Draw.** Sigmoid, tanh and ReLU side by side, derivatives underneath; mark the sigmoid derivative's peak, 0.25 at *z* = 0.

**Numbers.** ReLU(−5) = 0. σ(0) = 0.5. Max σ′ = 0.25; max tanh′ = 1. On Kobe, ReLU vs tanh: 0.662 vs 0.664 (our run), about the same change as moving Adam's lr from 1e-3 to 1e-2.

**They will ask.**
- *"ReLU isn't differentiable at 0. Problem?"* No. PyTorch uses slope 0 there, and exact zeros are rare.
- *"Which activation for Kobe?"* Any allowed one. ReLU, tanh, ELU and LeakyReLU scored within noise of each other in our runs.

### 4.5 Universal approximation, and what it does NOT say

**Say.** The honest version: a network with **one hidden layer** and a **non-polynomial** activation can approximate any continuous function on a bounded region **as closely as you like**, if the layer is **wide enough** (Cybenko 1989; Hornik 1991; Leshno et al. 1993). See it in 1-D: `ReLU(x) − 2·ReLU(x − 1) + ReLU(x − 2)` is a hat (0 until 0, up to 1 at *x* = 1, back to 0 at 2, flat after). Put hats at many points, scale them to the function's values, add them up: you get the "join the dots" curve through any function. Steep sigmoid pairs make "bumps" the same way (Nielsen's free online book, chapter 4, is a good link for students).

**What it does NOT say:**
1. How wide the layer must be (it can grow exponentially with the number of inputs).
2. That gradient descent will *find* the weights.
3. Anything about generalising from finite, noisy data.
4. Anything outside the region: far from the data a ReLU net is linear and extrapolates in a straight line.

Analogy: with enough thin Lego bricks you can match any skyline. The theorem promises the bricks exist, not the building instructions, and not tomorrow's skyline.

**Draw.** Three ramps adding to a hat; then hats adding to a wiggly curve.

**Students get wrong.** "Nets can learn anything." "So 2-8-8-1 can fit Kobe perfectly": no, the width is fixed and the labels are coin flips.

**They will ask.**
- *"Then why use deep nets?"* Depth can be far more efficient (4.6).
- *"It's about sigmoids. Does ReLU count?"* Yes: any non-polynomial activation.
- *"What does the Kobe net say for a 300-ft shot?"* Something arbitrary; the data stops around 79 ft.

### 4.6 Depth vs width

**Say.** One wide layer suffices in principle, but depth can be exponentially more efficient. Each ReLU layer can *fold* the input space, and the next layer cuts through all the folds at once. The tent map composed *k* times has 2^*k* linear pieces using only 2*k* neurons (Telgarsky 2016). Fold paper *k* times and one cut makes many pieces. The price: deep nets are harder to train and have more to fit. Depth helps when the function is compositional *and* you have the data.

On Kobe, *width* is the first fix. The official baseline is 2-1-1-1: each layer passes on one number, so the output depends only on **w**·**x** + *b* and the boundary is a straight line. It scores 57.7% ± 1.5% (our replica), like logistic regression. 2-8-8-1 reaches about 60.5–61%. An 80× bigger net (2-64-64-64-1) gives log loss 0.660 vs 0.662: the limit is basketball's noise, not capacity.

**Draw.** A sheet folded twice with one cut, or the sawtooth: one tent, two tents, four tents.

**They will ask.**
- *"2-8-8-1 or 2-8-1?"* Both legal; 2-8-8-1 is the safe maximum; the difference is tiny.

### 4.7 Vanishing gradients and dead ReLUs

**Say.** Backprop multiplies one activation derivative per layer. Sigmoid's is at most 0.25, so ten sigmoid layers give at most 0.25¹⁰ ≈ 10⁻⁶: the early layers barely learn. ReLU's derivative is 1 on the active side, a big reason it became the default. Its own failure is a *dead* unit: if a unit's pre-activation is negative for *every* input (its line lies outside the data cloud), its output and gradient are always 0 and it never recovers. In an 8-unit layer each dead unit costs 12.5% of the layer. Causes: lr too high, unscaled inputs, bad luck. Fixes: lower lr, scale inputs, another seed, LeakyReLU or ELU.

**Draw.** A chain of boxes with "× 0.25" between them. Next to it, a data cloud with one neuron's line far outside it, labelled "always 0".

**They will ask.**
- *"How do I find dead units?"* Pass the training inputs through the layer: `(h > 0).any(dim=0)` is `False` for dead units.
- *"Do batch norm or skip connections fix it?"* They help deep nets; a 3-layer MLP doesn't need them. Parking lot.

### 4.8 Losses: MSE, BCE, cross-entropy, logits

**Say.** The loss is one number for how wrong we are. Match it to what you predict. **Numbers → MSE**, the mean of (ŷ − *y*)² (the Inversion task is scored with it). **Yes/no → binary cross-entropy** (log loss): −[*y* log *p* + (1 − *y*) log(1 − *p*)]. It is a *surprise meter*: confident and wrong is a huge surprise, like a forecaster who said "90% rain" on a dry day. **One of K → cross-entropy** with softmax.

A **logit** is the raw score *z*: *p* = σ(*z*), *z* = ln(*p*/(1 − *p*)); *z* = 2 is 88%, *z* = −2 is 12%. The model outputs logits; the loss takes logits:

| Task | Model outputs | Loss | Labels |
|---|---|---|---|
| a number | 1 value | `nn.MSELoss()` | float, same shape as the output |
| yes / no | 1 logit | `nn.BCEWithLogitsLoss()` (sigmoid inside, numerically stable) | float 0/1, shape (N, 1) |
| one of K | K logits | `nn.CrossEntropyLoss()` (softmax inside) | integer class, shape (N,) |

Why not train on accuracy? It is a staircase: small weight changes rarely flip a prediction, so its gradient is zero almost everywhere.

**Draw.** −ln *p* for a made shot, with *p* = 0.9 → 0.105, 0.5 → 0.693, 0.1 → 2.303, 0.001 → 6.908.

**Numbers.** At initialisation logits are near 0, so BCE ≈ ln 2 = **0.693** (10 classes: ln 10 = 2.303). Far from that means a bug. Kobe's best *constant* prediction (*p* = 0.446) scores **0.687**: the number to beat. Setting the output bias to logit(0.446) = −0.217 starts the net at the baseline; it removes the "hockey stick", but after 3 epochs there is no difference (our run).

**The cliffhanger, explained.** With `nn.Sigmoid()` in the model *and* `BCEWithLogitsLoss`, the sigmoid is applied twice. The loss sees σ(σ(*z*)), which is stuck between 0.5 and 0.731, so it can never go below 0.313 on a make or 0.693 on a miss. The only way down is to push the inner sigmoid to 0 or 1. Result (3-seed mean): printed loss normal, accuracy 61%, but 76% of outputs below 0.01 or above 0.99 and a true log loss of **4.69** (correct model 0.662). No error. The same family: softmax in the model plus `CrossEntropyLoss`.

**They will ask.**
- *"Why the log?"* Log loss is the negative log-likelihood of what happened, and a *proper scoring rule*: on average it is minimised by reporting your true belief.
- *"Is a 2-class softmax different from a sigmoid?"* No: softmax(*z*₁, *z*₂)₁ = σ(*z*₁ − *z*₂). Use one logit for binary tasks.

### 4.9 Gradient descent, the learning rate, epochs, batches, steps

**Say.** θ ← θ − η∇*L*: the gradient points uphill, so step against it. η, the learning rate, is the most important knob ("If you have time to tune only one hyperparameter, tune the learning rate", Goodfellow et al. 2016). On paper: *L*(*w*) = (*w* − 3)², *w*₀ = 0, η = 0.1: gradient −6, so *w*₁ = 0.6. Here the error is multiplied by (1 − 2η) each step: it converges for 0 < η < 1, oscillates above 0.5, lands in one step at 0.5, bounces forever at 1, diverges above 1. The demo presets: 0.02 too slow (140 steps), 0.3 good (7), 0.9 oscillating but converging (26), 1.05 diverging.

In PyTorch: `requires_grad=True`, `loss.backward()` fills `.grad`, update inside `torch.no_grad()`, then `grad.zero_()`.

**Epoch, batch, step.** Steps per epoch = ⌈N / B⌉. The deck uses the Kaggle split: 20,558 shots, B = 64 → 322 steps (last batch 14), 30 epochs = 9,660 steps. The notebook uses the task file: 20,000 training shots → 313 steps (last batch 32), 9,390 steps. Expect someone to notice. **Count steps, not epochs:** 30 full-batch epochs is 30 steps and reached only 0.688 (no better than constant); batch 64 reached 0.662 (our run). Minibatch noise shrinks like 1/√B.

**Ravines.** When one direction of the loss surface is much steeper than another, contours are long thin ellipses and gradient descent zig-zags across and crawls along. Unscaled inputs cause exactly this (4.12).

**Draw.** The parabola with three step sequences (tiny, good, bouncing); then a thin ellipse with a zig-zag path.

**They will ask.**
- *"Which batch size?"* 64–256 for small tabular data. Full batch is fine for Kobe, given many more steps. Bigger batch: raise the lr a little.
- *"Does the small last batch matter?"* No (`drop_last=True` drops it).

### 4.10 Optimizers: SGD, momentum, RMSprop, Adam, AdamW, schedules

**Say, one sentence each.**
- **SGD**: step = lr × gradient. Simple; the right lr depends heavily on the problem and the input scale.
- **Momentum**: a heavy ball. It keeps a velocity, speeds up where gradients agree and cancels zig-zags. β = 0.9 averages roughly the last 10 gradients and can go up to 10× faster on a steady slope.
- **RMSprop**: divides each parameter's step by the running size of *its own* gradients. Mostly historical now.
- **Adam = momentum + its own step size for every parameter** (plus a small bias correction at the start). The practical consequence: **each parameter moves about lr per step, whatever the size of its gradient.** Gradients of 1000, 1 and 0.001 all move by exactly 0.001 on the first step at lr 1e-3.
- **AdamW**: Adam with weight decay applied directly to the weights. Use it whenever you want weight decay with Adam.

| Situation | Use | PyTorch (defaults checked in 2.15) |
|---|---|---|
| Any new problem tonight: MLPs, tabular, olympiad tasks | **Adam, lr 1e-3**, then try 3e-4, 3e-3, 1e-2, keep the best on validation | `Adam(params, lr=1e-3)`; betas (0.9, 0.999), eps 1e-8 |
| You want weight decay | AdamW | `AdamW(params, lr=1e-3, weight_decay=0.01)` |
| CNNs from scratch, time to tune | SGD + momentum (tuned SGD often slightly beats Adam there) | `SGD(params, lr=0.1, momentum=0.9)`; defaults lr 1e-3, momentum 0 |
| Optimising *inputs* (Inversion) | Adam with lr on the scale of the values (≈ 0.1), or L-BFGS | `LBFGS(params)` needs a closure |

**Schedules.** Constant; step decay; cosine; linear warmup then cosine (transformers; step it every batch). For small tasks, `ReduceLROnPlateau` on the validation loss plus keeping the best epoch is enough. Warmup is a stability tool for big models; it doesn't rescue a wrong lr.

**Be honest: Adam is a default, not magic.** On a ravine rotated by 45°, Adam does worse than plain SGD (final loss 7.06 vs 0.27 in the race demo): per-parameter steps only help when the bad direction lines up with the axes. Adaptive methods can generalise worse on image models (Wilson et al. 2017). On Kobe, tuned SGD matched Adam.

**Draw.** A narrow valley with three paths: SGD zig-zagging, momentum swinging wide then settling, Adam heading fairly straight.

**Numbers: the Kobe optimizer chart** (our run, 30 epochs, validation):

| Setting | Log loss | Accuracy |
|---|---|---|
| constant | 0.688 | 55.2% |
| Adam 3e-4 / **1e-3** / 1e-2 | 0.664 / **0.662** / 0.660 | 60.5% / 61.3% / 61.8% |
| Adam 1.0 | 0.701 | 51.7%, worse than constant |
| SGD 1e-3 | 0.683 | 55.2%, barely moved |
| SGD 0.1 | 0.663 | 61.4% |

"lr 1e-3 is an Adam default, not a law of nature."

**They will ask.**
- *"Why does Adam need bias correction?"* Its running averages start at 0, so the first ones are too small; dividing by (1 − βᵗ) fixes that, which is why step 1 is exactly lr.
- *"Why do people say 3e-4?"* Karpathy's 2016 joke tweet ("3e-4 is the best learning rate for Adam, hands down"), which he later used seriously as a safe start.

### 4.11 Initialisation

**Say.** Weights start random to break *symmetry*. If all hidden units start equal, they compute the same thing, get the same gradient and stay copies forever: eight units act like one. With all zeros in a tanh or ReLU net it is worse: the first layer gets exactly zero gradient and never learns. `nn.Linear` already initialises randomly (uniform in ±1/√fan_in), which is fine for small nets. Randomness also means every run differs: fix `torch.manual_seed(0)` to reproduce, and try several seeds to be honest.

**Numbers (our run).** Kobe 2-8-8-1 tanh with every parameter set to 0.5: after 300 Adam steps all 8 first-layer rows are still identical (≈ [0.583, 0.566]). All zeros: the first layer is still exactly 0.

**They will ask.**
- *"Logistic regression works from zero. Why not here?"* It has no hidden units, so there is no symmetry to break, and its loss is convex.

### 4.12 Input normalisation

**Say.** Standardise each input, (*x* − mean)/std, with statistics from the **training set only**, and apply the same two numbers to validation, test and grader data. It turns the loss surface from a ravine into a round bowl, so one lr suits every direction. It keeps pre-activations near ±1, so tanh doesn't saturate and ReLU gradients aren't 100× too big. And it lets the defaults (Adam 1e-3, PyTorch's init) behave as designed. This is 1998 advice (LeCun et al., "Efficient BackProp") and still bug number one.

**Numbers.**
- Kobe's coordinates are raw tenths of feet: `loc_x` −250 to 248 (std ≈ 110), `loc_y` −44 to 791 (std ≈ 88). The task statement calls them "already normalized". That is false.
- Loss at init: raw ≈ 2.3, standardised ≈ 0.69.
- Logistic regression on Kobe-like data: the steepest direction is about 40,000× steeper than the flattest when raw, 1.01× when standardised. Gradient descent needs over 20,000 steps raw vs 3–9 standardised.
- The surprise: with **Adam**, raw coordinates train about as well (0.664 vs 0.662), because Adam's per-parameter steps hide the scale. With **SGD + momentum at lr 0.1**, raw inputs collapse to "always miss" (55.3%) while standardised inputs reach 60.3%. Scale changes each layer's effective learning rate; whether it hurts depends on the optimizer. Standardise anyway: one line.

**The Kobe twist.** The grader feeds *raw* coordinates, so the scaling must live inside the weights. Fold it into `fc1`: divide each column of *W* by that input's std (*W*′ = *W*/σ), then **b**′ = **b** − *W*′**μ**. Exact (outputs match to about 1e-6) and legal.

**Draw.** Two contour plots: long thin ellipses with a zig-zag ("raw") and circles with a straight path ("standardised").

**They will ask.**
- *"Why only training statistics?"* Validation must imitate unseen data; using its statistics leaks information, and the grader's data won't come with statistics.
- *"Min-max or z-score?"* z-score by default; min-max is worse for skewed features like `loc_y`.

### 4.13 The training loop, line by line

The notebook's version (the class form carries over to the Kobe task, which forbids `nn.Sequential`):

```python
class MLP(nn.Module):
    def __init__(self):
        super().__init__()
        self.fc1 = nn.Linear(2, 8);  self.act1 = nn.ReLU()
        self.fc2 = nn.Linear(8, 8);  self.act2 = nn.ReLU()
        self.fc3 = nn.Linear(8, 1)                 # one logit, no sigmoid
    def forward(self, x):
        x = self.act1(self.fc1(x))
        x = self.act2(self.fc2(x))
        return self.fc3(x)

model, loss_fn = MLP(), nn.BCEWithLogitsLoss()
opt = torch.optim.Adam(model.parameters(), lr=1e-3)
for epoch in range(30):
    model.train()
    for idx in torch.randperm(len(X_train)).split(64):   # shuffle, batches of 64
        opt.zero_grad()                                  # 1. clear old gradients
        logits = model(X_train[idx])                     # 2. forward
        loss = loss_fn(logits, y_train[idx])             # 3. loss (y shape (B, 1))
        loss.backward()                                  # 4. backward: fills .grad
        opt.step()                                       # 5. update the weights
    model.eval()
    with torch.no_grad():
        val_logits = model(X_val)
        val_acc = ((val_logits > 0).float() == y_val).float().mean()
```

**The five beats: zero, forward, loss, backward, step.** Say them aloud every time.
- `zero_grad()`: gradients **add up** by default (three `backward()` calls on 2*w* give 2, 4, 6).
- `backward()` only computes gradients; only `step()` moves weights. The optimizer is created once, outside the loop.
- `model.eval()` switches off dropout and batch-norm training behaviour; `torch.no_grad()` stops recording for backprop. A Linear+ReLU net behaves the same either way, but build the habit.
- `logit > 0` is the same as *p* > 0.5.

**Loud bugs (exact messages from the deck's error gallery, PyTorch 2.15).** Read the last line of the traceback: it names the fix.

| Message | Cause | Fix |
|---|---|---|
| `RuntimeError: addmm: mat1 and mat2 shapes cannot be multiplied (64x3 and 2x8)` | 3 input columns, layer built for 2 | match `in_features` to the data |
| `RuntimeError: mat1 and mat2 must have the same dtype, but got Double and Float` | numpy/pandas give float64 | `X.float()` or `dtype=torch.float32` |
| `ValueError: Target size (torch.Size([64])) must be the same as input size (torch.Size([64, 1]))` | labels (N,) with `BCEWithLogitsLoss` | `y.unsqueeze(1)` |
| `RuntimeError: result type Float can't be cast to the desired output type Long` | integer labels into BCE | `y.float()` |
| `RuntimeError: Can't call numpy() on Tensor that requires grad.` | converting a tracked tensor | `.detach().numpy()` |

**Silent bugs (no error).** No `zero_grad`. Sigmoid before `BCEWithLogitsLoss`. `MSELoss` with (N, 1) vs (N,) (only a `UserWarning` about broadcasting). Creating the optimizer inside the epoch loop (resets Adam). Scaling validation data with validation statistics. "Validation" computed on the training set.

**They will ask.**
- *"Why does PyTorch add gradients up?"* So you can sum gradients over several small batches before one step. The price: you clear them yourself.
- *"Why `.item()`?"* It turns a one-number tensor into a Python float, so logging doesn't keep the graph alive.

### 4.14 Generalisation, regularisation and debugging

**Say.** *Train* fits the weights, *validation* chooses hyper-parameters and when to stop, *test* is reported once. In a competition the hidden leaderboard is the test set; the public board behaves like validation, and tuning to it overfits it. *Underfitting*: train and validation both high and close. *Overfitting*: train keeps falling while validation turns up and the gap grows.

Cures: more data; a smaller model; **weight decay** (a pull of every weight towards 0; AdamW); **dropout** (randomly zero hidden units during training so they can't co-adapt; off in `eval()`); **early stopping** with the best checkpoint, `best = copy.deepcopy(model.state_dict())`. A plain `state_dict()` keeps references, so you would save the *last* weights; one public Kobe notebook did exactly that. For Kobe none of this matters: 105 parameters can't memorise 20,000 noisy shots, and train ≈ validation. The difficulty there is optimisation and scaling.

**The loss-curve doctor.**

| Curve | Diagnosis | Try |
|---|---|---|
| explodes or NaN | lr too high (or unscaled inputs) | lr ÷ 3–10; check scaling |
| falls slowly, almost straight | lr too low | lr × 3–10 |
| flat near 0.69 from the start | stuck: dead or saturated units, a constant predictor | scaling, lr, seed; print the fraction predicted "made" |
| train falls, validation rises | overfitting | early stopping, smaller model, weight decay, more data |
| very jagged | batch too small or lr too high | bigger batch, lower lr |
| both fall and flatten together | healthy, maybe at the noise ceiling | check the gap to the baseline, stop tuning |

**Karpathy's recipe** ("A Recipe for Training Neural Networks", 2019): (1) check the loss at init; (2) train an input-independent baseline (inputs set to zero) that the real model must beat; (3) overfit one tiny batch (two examples) to near-zero loss, or there's a bug; (4) look at predictions (for Kobe, a heat map of the court); (5) change one thing at a time, fix seeds, keep a log. "Neural net training fails silently."

**Bug hunt answer key** (the slide's order): (1) scaling with validation statistics; (2) `nn.Sigmoid()` with `BCEWithLogitsLoss`; (3) labels (64,) vs output (64, 1), the only one that crashes; (4) no `opt.zero_grad()`; (5) "validation" loss computed on the training set (and no `eval()`/`no_grad()`). Most often missed: 1 and 2.

**A modern caveat (one minute).** In *double descent*, test error can rise then fall again as models grow past fitting the training set exactly. In *grokking*, generalisation can appear long after 100% training accuracy, on tiny algorithmic datasets. Our small nets follow the classic picture; don't promise grokking on Kobe.

**Numbers (our run).** 500 training shots, full batch: after 2,000 steps a 2-256-256-1 has train loss 0.37 and validation 1.23; the 2-8-8-1's best validation (0.677) comes at step 300. Networks can memorise random labels perfectly (Zhang et al. 2017), so training accuracy alone proves nothing.

**They will ask.**
- *"Validation loss below training loss: bug?"* Usually not: the training loss is averaged while the weights were still improving, dropout is training-only, or the split is lucky.
- *"Kobe train accuracy is stuck at 61%. Underfitting?"* No, that is the ceiling (5.1).

### 4.15 Optimising inputs instead of weights

**Say.** Backprop computes the gradient with respect to *anything* with `requires_grad=True`. In training the data is fixed and the weights move. In inversion the weights are frozen and an *input* moves: the same loop with a different leaf. Famous uses: the adversarial panda (invisible noise turns "panda" into "gibbon" at 99.3%); DeepDream; style transfer; model-inversion attacks (Fredrikson et al. 2014 inferred a patient's genotype, a missing input, from a warfarin-dosing model's output and the patient's other data: exactly the afternoon task).

**Toy 1, one answer.** *f*(*a*, *b*, *c*) = *a* + 2*b* + *c*², with *a* = 1, *c* = 1.5, *y* = 4.65; recover *b* = 0.7. Plain GD: lr 0.125 lands in one step, 0.25 bounces between 0 and 1.4 forever, 0.3 blows up. The step limit is 2 divided by the curvature.

**Toy 2, two answers.** Recover *c* with *a* = 1, *b* = 0.7: *c*² = 2.25, so ±1.5. Start at +0.1 → +1.5; at −0.1 → −1.5; at **exactly 0** it never moves (SGD and Adam), because *c* = 0 is the top of a hill where the gradient is exactly 0. The wrong sign costs a squared error of 9, with a perfect fit. **Non-uniqueness is the real limit:** you need a prior to choose.

**The lr trap.** Adam moves each value about lr per step, so at lr 1e-3 an input needs 2,000 steps to travel 2. Use lr ≈ 0.1 for values of size ±1–3. On our replica: Adam 1e-3 for 500 steps gives MSE 0.433, lr 0.1 gives 0.024.

**One unknown? Look at all of it.** With one unknown per row, evaluate the model at 2,001 values for every row at once (under `torch.no_grad()`). Every crossing of *y* is a solution; gradient descent only finds the one downhill from its start.

**Draw.** Two pipelines. Training: data (fixed) → model (weights moving, magenta) → loss. Inversion: data with one column moving (magenta) → model (frozen, padlock) → output vs *y* → loss.

**They will ask.**
- *"Why not train a model that predicts the missing column?"* You'd have to generate training pairs yourself through the frozen model, and it would face the same ambiguity (two values of *c*, one *y*).
- *"Can different inputs really give the same output?"* Yes: on our replicas 33–50% of rows have two or more exact solutions in [−5, 5].

---

## 5. The two afternoon tasks

### 5.1 Task 1: Kobe shot prediction

**Origin.** Problem 1 of round 2 of China's NOAI 2024, reused as question 1 of the NOAI 2025 teaching test, which Bohrium labels "APOAI2025 Mock Competition". (No real "APOAI 2025" contest took place.) The 25,000 rows are Kaggle's labelled Kobe Bryant shots, renumbered and shuffled.

**The statement (official English, condensed; our corrections in brackets).**

> **Predicting the shooting percentage of a basketball star.** `data_train.csv` holds a star player's shots: `loc_x`, `loc_y` (position on the court; "already normalized" [false: raw tenths of a foot, rim at (0, 0), x from −250 to 248, y from −44 to 791]), `minutes_remaining`, `shot_distance`, `shot_made_flag` (1 = made, 0 = missed), `shot_id`. The training set has 20,000 rows; the hidden test set about 5,000. [The file has 25,000 rows and probably includes the test rows; with 105 parameters this makes no practical difference.]
>
> **Task.** Use PyTorch to build a multi-layer perceptron that predicts whether a shot from a given position goes in:
> 1. The input is exactly 2 features (`loc_x`, `loc_y`); the output is 1 label.
> 2. Only linear layers and activation functions after linear layers; **at most 3 linear layers**. Build the network directly; **do not nest it in `nn.Sequential()`**. The scorer can't see inside `nn.Sequential`, and such submissions score 0.
> 3. Activations only from `nn.ReLU`, `nn.Sigmoid`, `nn.Tanh`, `nn.ELU`, `nn.LeakyReLU`, `nn.PReLU`.
> 4. **At most 8 neurons per linear layer.**
> 5. Loss, optimizer and learning rate are free.
>
> **Submission.** `submission.zip` containing `submission_model.py` (the class definition and its imports) and `submission_dic.pth` (the trained `state_dict`).
>
> **Scoring.** If the structure obeys the rules, the score is the **test accuracy**; otherwise 0. Leaderboard A (50% of the test set) is live; leaderboard B (the other 50%) is computed afterwards and is final.

The largest legal net is 2-8-8-1 (105 parameters). The official baseline calls the class `MyModel` with a no-argument constructor; keep that.

**Rulings to announce** (our recommendations):
- Distance or angle computed inside `forward()`: treat as illegal (only linear layers and activations), and it gives no measurable gain.
- `shot_distance` or `minutes_remaining` as inputs: illegal; the grader passes 2 columns. `shot_distance` is just ⌊√(x² + y²)/10⌋.
- Scaling inside `forward()` with buffers: grey; fold it into `fc1` instead.
- A tuned threshold folded into the last bias (`fc3.bias -= log(t/(1−t))`): legal, but gains nothing measurable.
- Ensembles: impossible within 3 layers of width 8.
- A final `nn.Sigmoid`: keep it (see the traps).

**Why the scores are so low** (tell them after they've tried). Each label is a coin flip whose probability depends on position. Even the 4,200 shots at exactly (0, 0) went in only 62.5% of the time. Accuracy only asks which side of 50% a spot is on, and only shots within about 3 ft of the rim go in more than half the time. So the accuracy-optimal answer is essentially "made iff within 3 ft" (60.7%), which says "made" for about 22% of shots. The 3-point line is invisible to accuracy: both sides are below 50%.

**Expected scores** (validation accuracy, task file):

| Model | Accuracy |
|---|---|
| "always miss" | 55.3% |
| official 2-1-1-1 baseline (a straight line) | 57.7% ± 1.5% |
| best possible straight line | 58.6% |
| "made iff within ~3 ft" | 60.7% |
| good legal 2-8-8-1 | ≈ 60.5–61% |
| gradient boosting or kNN on (x, y) | ≈ 60.5% (ceiling ≈ 61%) |

On the real boards, the best legitimate scores were 0.6212 (A) and 0.6249 (B), with a B median of 0.612. A board of about 2,500 shots has a standard deviation of about ±0.01, so 0.62–0.625 is a good model plus luck over many submissions. Board entries above 0.96 are grader exploits, not models.

**Reference approach** (≈ 60.5–60.8% on validation; the full notebook is in `solutions/`):
1. Write `submission_model.py` first: `MyModel` with `fc1 = nn.Linear(2, 8)`, activation, `fc2 = nn.Linear(8, 8)`, activation, `fc3 = nn.Linear(8, 1)`, `nn.Sigmoid()`. Import that class to train.
2. Split 80/20 (stratified); standardise with training statistics.
3. BCE on the sigmoid output (`nn.BCELoss`), Adam lr 1e-2, full batch for about 2,000 steps (or batch 256 for about 25 epochs).
4. Check: validation ≈ 0.605, fraction predicted "made" ≈ 0.2.
5. Fold the scaling into `fc1`, save the `state_dict`, zip both files.
6. Unzip into a fresh folder, import from there, `load_state_dict(..., strict=True)`, run on **raw** validation coordinates, confirm the accuracy, assert the rules (≤ 3 `nn.Linear`, each `out_features` ≤ 8, no `nn.Sequential`).

**Traps**
- **Raw coordinates from the grader.** Train on scaled inputs and forget to fold, and the submitted net sees inputs 100× too large.
- **`nn.Sequential` scores 0.** Write `self.fc1 = …` explicitly; avoid `ModuleList` tricks the checker might not see.
- **Class/weights mismatch.** Two public notebooks trained one architecture and submitted another's class, so `load_state_dict` failed. Train the exact class you submit; reload the zip before uploading.
- **`shot_distance` is illegal** (and redundant).
- **The Sigmoid.** The grader most likely thresholds the output at 0.5 (not published; the baseline ends in a Sigmoid). So the submission ends with `nn.Sigmoid()`, trained with `nn.BCELoss`, *not* `BCEWithLogitsLoss` (that is the lecture's double-sigmoid bug). A logits model trained with `BCEWithLogitsLoss` can get the Sigmoid added in the submitted class; it has no parameters, so the `state_dict` doesn't change.
- **The best checkpoint** must be `copy.deepcopy(model.state_dict())`.
- **A constant predictor.** Too small an lr, too few steps or a bad seed gives "always miss" (55.3%) or "always made" (44.7%; one public copy scored 0.44). Always print the fraction predicted "made".
- **Chasing the leaderboard.** Differences under 0.01 are noise; validate with several seeds.

**Hint ladder** (times from the start of the task; give a hint only to students who are stuck)

| Hint | When | Say |
|---|---|---|
| 1 | ~15 min, no baseline | "Before training: what does 'always miss' score? Compute the make rate by distance. Where is it above 50%?" |
| 2 | ~30 min, no legal model | "Write the class first: `MyModel` with `fc1`, `fc2`, `fc3`, an activation after the first two, no `nn.Sequential`. Assert ≤ 105 parameters. Train exactly this class." |
| 3 | ~45 min, stuck at 55–58% | "Is the net wide enough to draw a disc (2-1-1-1 only draws a line)? What fraction do you predict 'made'? It should be about 0.2. Try Adam lr 1e-2, full batch, about 2,000 steps." |
| 4 | ~60 min, about to submit | "The grader feeds raw coordinates. Fold your scaling into fc1: divide each column of W by that input's std, subtract W′μ from the bias. Check the outputs are unchanged on raw inputs." |
| 5 | ~75 min, no valid zip | Walk them through steps 5–6 of the reference approach. |

### 5.2 Task 2: Operation "Inversion"

**The statement (our translation of the Georgian original).**

> **Operation "Inversion": digital restoration of data**
>
> **Context.** Imagine you work at a high-tech research centre where a unique AI model has been built. From ten different parameters it precisely determines the final outcome of an experiment (*y*). Because of a technical failure on the server, one column of the database was damaged: all its values were replaced with zero. The model is "frozen", which means it cannot be retrained. But since the model already "knows" the relationship between the parameters and the outcome, it becomes the key to recovering the information. Your task is to recover the values of the lost column for each of the 1000 samples by mathematical optimisation.
>
> **Given resources.**
> 1. **Model.** `model.pt`, a pre-trained TorchScript model. It takes 10 values and returns one target variable (*y*). Load it with `model = torch.jit.load("model.pt")` and `model.eval()`.
> 2. **Data.** `data.csv`, 1000 records with 10 columns (`x0` to `x9`) and the outcome `y`. One column is filled entirely with 0.0. That column is your target.
>
> **The task.** Find values for the damaged column that agree as closely as possible with the model's logic: if the recovered values and the other 9 parameters are fed to the model, it should return values as close as possible to the *y* in the table.
>
> **Loading the data and the model.**
> ```python
> # Step 1: load the data
> import numpy as np
> import pandas as pd
> import torch
> import torch.nn.functional as F
>
> df = pd.read_csv("data.csv")
> y = df["y"].values.astype("float32")
> X = df.drop(columns="y").values.astype("float32")
>
> # Step 2: load and check the model
> model = torch.jit.load("model.pt")
> model.eval()
> X_t = torch.from_numpy(X)
> y_t = torch.from_numpy(y)
> with torch.no_grad():
>     pred = model(X_t).squeeze()
>
> # Step 3: write submission.csv
> sub = pd.DataFrame({"subtaskID": 1, "datapointID": range(1000), "answer": your_answer})
> sub.to_csv("submission.csv", index=False)
> ```
>
> **Submission file.** `submission.csv` with exactly 1000 rows, where `answer` is the recovered value of the damaged column:
> ```
> subtaskID,datapointID,answer
> 1,0,1.234567
> 1,1,-0.567890
> ...
> ```
>
> **Evaluation.** First the MSE of your prediction: MSE = (1/1000) Σᵢ (x̂ᵢ − xᵢ*)² for i = 0 … 999, where x̂ᵢ is your recovered value and xᵢ* the original. Then the score: **score = (MSE_baseline − MSE_yours) / (MSE_baseline − MSE_best) × 100**, clipped to [0, 100], with MSE_baseline ≈ 0.968 (leaving the column as zeros) and MSE_best ≈ 0.0045 (the best known solution). Zeros give 0 points; the more accurate the recovery, the higher the score (maximum 100).
>
> **Constraints.** The model is untouchable: changing its weights is forbidden. The corresponding code must be submitted together with the answers.

**Launch.** Hand out `model.pt`, `data.csv`, the statement and the starter notebook. The starter runs as given and writes a valid all-zeros submission (score ≈ 0), with TODOs: find the column, rebuild the input with `torch.cat`, an Adam loop on the missing column only, check residuals and a grid, choose between several roots. Say only: "Same backprop as this morning; the input is the parameter."

**The score is linear in MSE**, so the top end is compressed:

| MSE | 0.5 | 0.2 | 0.1 | 0.05 | 0.0236 | 0.0145 | ≤ 0.0045 |
|---|---|---|---|---|---|---|---|
| score | 48.6 | 79.7 | 90.1 | 95.3 | 98.0 | 99.0 | 100 |

**Expected scores.** We don't have the real model, so these come from replicas we built (10 roughly normal inputs, a 10-64-64-1 TorchScript MLP, 1000 rows, the same 0.968 baseline). Treat them as a guide. The real best (0.0045) lies between our easy and hard replicas, so the real model probably has *some* ambiguous rows.

| Method (hard replica) | MSE | Score |
|---|---|---|
| leave zeros | 0.967 | 0 |
| Adam lr 1e-3, 500 steps, from 0 | 0.433 | 55 |
| **Adam lr 0.1, 500 steps, from 0** (safe first submission) | 0.0236 | **≈ 98** |
| L-BFGS from 0, or "all roots, pick the one closest to 0" | 0.021 | 98.3 |
| **all roots, prior-weighted average (posterior mean)** | 0.0145 | **≈ 99** |

Adam from 0 works so well because starting at 0 picks the solution closest to 0, a built-in prior.

**Reference approaches** (full notebook in `solutions/`):
1. *Safe (under a second).* `model.eval()`, freeze the parameters, float32. `k = int((X == 0).all(0).nonzero()[0])`. `z = torch.zeros(N, requires_grad=True)`; input `torch.cat([X[:, :k], z[:, None], X[:, k+1:]], 1)`; prediction `model(...)[:, 0]`; loss `((pred - y)**2).sum()`; `Adam([z], lr=0.1)` for 500 steps. Only `z` goes to the optimizer.
2. *The improvement.* Evaluate a grid of 2,001 values in [−5, 5] for every row under `no_grad`. Each sign change of *f* − *y* brackets a root; polish with a few Newton steps. Count roots per row. Where there are several, weight each by its plausibility (a normal prior for the column, fitted from the other 9 columns, divided by the slope |*f*′| at the root) and submit the **weighted average**: it minimises the expected squared error, while picking one root is a gamble.

**Traps**
- **`model.eval()`.** A model scripted in training mode loads with `training=True`; with dropout, two calls on the same input differ.
- **Freeze the parameters:** `for p in model.parameters(): p.requires_grad_(False)`. A TorchScript quirk in torch 2.15: after one call in gradient mode, `torch.no_grad()` stops working on scripted models (grid evaluation gets slow) and `torch.inference_mode()` crashes. `model.requires_grad_(False)` isn't supported on scripted models; use the loop. Input gradients still work.
- **float32.** pandas gives float64 → the dtype error.
- **(N, 1) vs (N,).** The model returns (N, 1), *y* is (N,). `model(X) - y` silently becomes an N×N matrix mixing all rows: MSE 2.44, *worse than zeros*. Use `[:, 0]` or `.squeeze()`; assert shapes.
- **Adam lr 1e-3 is far too slow for inputs.** Use about 0.1. lr 1.0 overshoots into the wrong root (MSE 1.39).
- **SGD with `.mean()` doesn't move** (every row's gradient ÷ 1000; MSE 0.709). Use `.sum()` or Adam.
- **Optimise only the missing column.** Moving all 10 inputs "explains" *y* with the wrong values (MSE 0.504).
- **Two-root rows.** On the hard replica 330 of 1000 rows have two exact solutions; about 15 rows with the wrong one cause almost all the remaining error. Residuals can't see them (the fit is exact); only counting roots on a grid does. "Multi-start, keep the smallest residual" is a coin flip and scores *worse than zeros*.
- **Stationary starts.** Exactly at a point with zero gradient (Toy 2's 0, or a ReLU exactly at 0), nothing moves.
- **`torch.set_num_threads(1)`.** On a shared or overloaded CPU the default threads made torch about 100× slower in our tests.
- **Submit the code** with the answers.

**Hint ladder**

| Hint | When | Say |
|---|---|---|
| 1 | ~10 min | "Which column is it? You can find it in one line. What happens to the output when you put other values in that column?" |
| 2 | ~25 min | "Make the missing column the parameter: `z = torch.zeros(N, requires_grad=True)`, rebuild the input with `torch.cat`, loss = sum of squared differences to *y*, only `z` in the optimizer. Freeze the model. Print every shape." |
| 3 | ~40 min, score below 60 | "How far does Adam move a value per step? About lr. Your values are ±1–3. Try lr 0.1 for 500 steps. Is your prediction (N, 1) or (N,)?" |
| 4 | ~60 min, around 98 | "One unknown per row: try 2,001 values for every row at once and plot *f*(*z*) for a few rows against the line *y*. How many crossings?" |
| 5 | ~80 min | "With two crossings, which do you submit? Prefer the one closest to a prior guess (0, or a regression of the column on the others). Better: what minimises the *expected* squared error when you're unsure? A weighted average." |

---

## 6. Q&A cheat-sheet

These complement the questions in section 4; most are cross-topic or about the tasks.

1. **Adam in one sentence?** Momentum plus its own step size for every parameter; each moves about lr per step. Start at lr 1e-3, then tune.
2. **Is Adam always best?** No, it is the most forgiving default. Tuned SGD + momentum often wins on image CNNs; on Kobe tuned SGD matched Adam.
3. **Why ReLU and not sigmoid in hidden layers?** Sigmoid's gradient is at most 0.25 and vanishes when saturated; ReLU's is 1 when active. AlexNet trained about 6× faster with ReLU than tanh.
4. **Why no activation on the output layer?** The loss applies sigmoid/softmax in a numerically stable way; for regression you want any real number.
5. **Why minibatches?** Many more updates per epoch, less memory, helpful noise. 30 full-batch epochs on Kobe (30 steps) learned nothing.
6. **How many layers and units?** Start small, grow until validation stops improving, several seeds. For Kobe, the maximum 2-8-8-1.
7. **What is weight decay? Adam or AdamW?** A pull of all weights towards 0. With Adam use AdamW, otherwise Adam's scaling weakens the decay on weights with large gradients.
8. **Loss vs metric?** Train on a smooth loss (BCE), report the competition's metric. For Kobe the metric is accuracy, which has no useful gradient.
9. **Why check the loss before training?** It is the cheapest bug detector: ≈ 0.69 for a binary problem. 2.3 on Kobe means unscaled inputs.
10. **Does example order matter?** Shuffle every epoch; sorted data gives biased batches.
11. **What does `model.eval()` change?** Dropout and batch-norm behaviour. Nothing for Linear+ReLU, but build the habit. `no_grad()` is separate: it stops gradient recording.
12. **Parameters vs hyper-parameters?** Learned by gradient descent (the 105 weights and biases) vs chosen by you (lr, batch, width, epochs, seed).
13. **Why different results every run?** Random init and shuffling. Fix `torch.manual_seed`; report several seeds.
14. **Do more epochs always help?** No: validation can rise. On Kobe, 100 epochs gained only 0.0007 log loss over 30.
15. **What is dropout, and why not on Kobe?** Randomly zeroing hidden units in training so they can't rely on each other. Kobe's tiny net can't overfit, so there is nothing to regularise.
16. **Why float32?** The weights are float32 and PyTorch won't mix dtypes in a matrix multiply.
17. **Can one hidden layer do everything (UAT)?** In principle, but it may need to be enormous and GD may not find it. Depth is often far more efficient.
18. **What is L-BFGS?** An optimizer that uses curvature information. Excellent for small, smooth, full-batch problems (Inversion: 0.021 MSE in under half a second); rarely used for minibatch training.
19. **Why is Kobe accuracy only ~61%? Can anyone get 70%?** Each shot is a coin flip; even at the rim he scored about 63%. With extra Kaggle columns (shot type, season), gradient boosting reaches about 68%, but those aren't allowed.
20. **My two Kobe models score 0.607 and 0.611. Which is better?** Probably neither: the board noise is about ±0.01 and seed spread 0.005–0.01. Compare means over several seeds.
21. **You said no sigmoid in the model. Why does the Kobe submission have one?** The grader wants probabilities and thresholds them. Train that model with `nn.BCELoss`. The bug is only Sigmoid *plus* `BCEWithLogitsLoss`.
22. **Can I compute distance to the rim inside `forward()`?** Treat it as illegal: only linear layers and activations. It gives no measurable gain anyway.
23. **Why must the scaling be folded into `fc1`?** The grader feeds raw coordinates. *W*′ = *W*/σ, *b*′ = *b* − *W*′μ give identical outputs on raw inputs: a linear step followed by a linear layer is still one linear layer.
24. **Should I tune the threshold?** For a calibrated model 0.5 is already optimal. If you must, fold it into the last bias.
25. **Inversion: why sum and not mean?** The rows are independent. With SGD, the mean divides each row's gradient by 1000 and nothing moves; Adam doesn't care.
26. **Inversion: why not optimise all 10 inputs?** You would change data you were given, and the optimizer explains *y* by moving everything (MSE 0.504).
27. **Inversion: what if two values fit perfectly?** The data can't tell them apart. Use a prior (closest to 0 or to a regression guess), or submit the weighted average to minimise the expected squared error.
28. **Inversion: is it allowed to use the other columns' statistics?** Yes. Only the model's weights are off limits, and you must submit your code.
29. **What about CNNs and transformers?** Parking lot. Same loop, losses and optimizers; only the model box changes.

---

## 7. Stories and facts you can tell

At most one per section, under 60 seconds, then "and this matters for your code because…". Where only secondary sources exist, say "reportedly".

| # | Story | Why it matters |
|---|---|---|
| 1 | **1958 hype.** The New York Times reported the Navy expected the perceptron to "walk, talk, see, write, reproduce itself and be conscious of its existence." It drew one line. | Hype vs reality; today, 105 numbers predict basketball shots. |
| 2 | **The Mark I Perceptron (1960)**: 400 photocells, motor-driven potentiometers as weights, a fixed random middle layer. **Only the last layer learned.** | It had a hidden layer but couldn't train it; backprop filled the gap. |
| 3 | **Minsky & Papert (1969)** proved a *single-layer* perceptron can't compute XOR; they doubted multi-layer nets could be trained. Funding dried up. | Two hidden ReLUs solve XOR: the limit was training, not representation. |
| 4 | **Walter Pitts**, the story goes, hid from bullies in a library at 12, read *Principia Mathematica* in three days and wrote to Bertrand Russell about its mistakes. He co-wrote the first neural-network paper (1943). | A teenager helped start the field. (Say "the story goes".) |
| 5 | **Backprop's disputed birth.** Linnainmaa's 1970 thesis had the method; Werbos applied it to networks; Rumelhart, Hinton & Williams made it famous in 1986. | Credit in science is messy. |
| 6 | **Gradient descent is from 1847** (Cauchy). | "Your optimizer's grandfather was born in 1847." |
| 7 | **AlexNet (2012)** trained 5–6 days on two GTX 580 gaming GPUs and won ImageNet with 15.3% top-5 error against 26.2%; ReLU trained about 6× faster than tanh. | It made ReLU and dropout standard. |
| 8 | **Dropout and the bank tellers.** Hinton (2016 Reddit AMA): his bank kept rotating tellers, which he guessed stopped them cooperating to defraud it; dropping random neurons stops them "conspiring". | Overfitting in one picture. |
| 9 | **Adam's citations:** about 200,000 on Google Scholar, 4th of all 21st-century papers in the data behind Nature's 2025 list. | The optimizer they type is the standard. |
| 10 | **Karpathy's 2018 tweet**, "most common neural net mistakes": not overfitting one batch first, forgetting train/eval mode, forgetting `.zero_grad()`, passing softmaxed outputs to a loss that expects logits. | Three of the four are in today's live coding. |
| 11 | **LeCun (2018):** "Training with large minibatches is bad for your health… Friends dont let friends use minibatches larger than 32." | A joke with a real point about batch size. |
| 12 | **The adversarial panda.** Noise of size 0.007 turns GoogLeNet's "panda" (57.7%) into "gibbon" (99.3%). The noise is the sign of the gradient with respect to the *input*. | Backprop aimed at the input: the Inversion task. |
| 13 | **DeepDream's dumbbells** (Google, 2015): the network's dumbbells came with muscular arms attached, because it had never seen one without an arm. | Networks learn the data, not your intention. |
| 14 | **Model inversion is a real attack.** Fredrikson et al. (2014) inferred patients' genotypes, a missing input, from a warfarin-dosing model, weighting candidates by how common each genotype is; in 2015 they recovered recognisable faces from a face-recognition model. | Literally the afternoon task, including the prior-weighted tie-break. |
| 15 | **Grokking.** A network suddenly generalised long after memorising its training set, found because a team member went on vacation and forgot to stop the run: "we got lucky… and by lucky, I mean forgetful" (as reported by Quanta). | The U-curve isn't everything; but no grokking on Kobe. |

Spares: networks can memorise random labels perfectly (Zhang et al. 2017); the 2024 Nobel Prize in Physics went to Hopfield and Hinton, 66 years after the 1958 demo; IOAI 2027 is in Singapore.

**Things NOT to say**
- "Minsky & Papert proved neural networks can't do XOR." Single-layer only.
- "Hinton invented backprop in 1986." He co-popularised it.
- "Hebb said 'neurons that fire together wire together'." That's Carla Shatz, 1992.
- "Neural networks work like the brain."
- "Attention span is 10 minutes" (or the goldfish claim). The evidence is weak.
- Parameter counts for GPT-4 or later models. Not disclosed.
- "AlexNet was trained in Krizhevsky's bedroom." Unverified.
- "Adam always wins" or "Adam needs no tuning."
- "The optimizer finds the global minimum." It finds a good-enough low region.
- "The UAT means networks can learn anything."
- "The Kobe inputs are normalised." They are raw tenths of feet.
- "Raw inputs make training fail completely." With Adam they trained fine on Kobe; SGD shows the damage.
- "This was APOAI 2025." It is NOAI 2024 problem 1 under a Bohrium label.
- A quoted definition of "Mamba mentality" in Kobe's words (not verified; paraphrase: "obsess over the boring details").
- Jokes about Kobe's death (January 2020, helicopter crash, with his daughter). Mention it respectfully if it comes up, or not at all.

---

## 8. After the session

### 8.1 Exit-ticket answers

| # | Question | Answer |
|---|---|---|
| 10 | Order: `loss.backward()`, `opt.step()`, `opt.zero_grad()`, `loss = loss_fn(model(x), y)` | `zero_grad` → forward + loss → `backward` → `step` |
| 11 | Kobe made 44.6%. Log loss of the best constant? Accuracy of "always miss"? | ≈ 0.687; ≈ 55% |
| 12 | True/false: "If train loss < val loss, the model is overfitting." | **False as stated.** A small gap is normal; overfitting is validation rising while training falls, or a growing gap. |
| 13 | `BCEWithLogitsLoss` expects probabilities or logits? | Logits |
| 14 | In Inversion, which tensor has `requires_grad=True`? | The missing input column, not the weights |
| 15 | One thing still muddy | Open; read them all |

### 8.2 How to read them

Tally right/wrong per question (ten minutes). Above 80%: done. 50–80%: one minute tomorrow. Below 50%: re-teach with a new prediction question.
- **Q10 with `step` before `backward`**: words without logic. Redo the five beats asking "what does each line need from the previous one?"
- **Q11 = 0.693**: they confuse a fair coin with the base rate. Redo −[0.446 ln 0.446 + 0.554 ln 0.554] = 0.687.
- **Q12 = True**: the classic overfitting misconception. Show the 500-shot curves and point at the gap *growing*.
- **Q13 = probabilities**: re-teach logits with the 4.69 vs 0.662 result. Worth the time: it causes silent bugs.
- **Q14 = the weights**: they missed the inversion idea. Use "frozen lock, adjust the key".
- **Q15**: group the answers into two or three themes; answer the biggest first tomorrow, then the parking lot.

### 8.3 What to review tomorrow

- **Three retrieval questions** from today before anything new: "Why must there be a nonlinearity between layers?", "What should the first BCE loss print?", "How far does Adam move a parameter per step?"
- **Kobe debrief.** The ceiling ladder: 55.3% → 58.6% (best line) → 60.7% (rim rule) → ≈ 61% (MLP). Ask why the 3-point line doesn't appear in the boundary. Show the folding identity and the Sigmoid/`BCELoss` pairing. Ask whose zip failed to reload, and why.
- **Inversion debrief.** Plot one row with two roots. Explain why Adam from 0 already scores about 98, and why the last points come from choosing between roots, not polishing residuals. Show the weighted-average idea to the strongest students.
- **The muddiest points** from Q15 and anything below 50% on the tally.
