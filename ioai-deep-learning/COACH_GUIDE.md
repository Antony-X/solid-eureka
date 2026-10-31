# Coach's guide: "Neural networks, hands-on"

## Quick start

**Open these**
- `lecture.html` (the 50-slide deck) in Chrome or Edge. **F** = full screen, **P** = presenter window with notes and a pace clock.
- `notebooks/01_live_coding.ipynb`, already run, for the live coding. Its saved outputs are the numbers to expect.
- `SCRIPT.md`, printed: what to say on each slide.
- Optional: `lecture-full.html`, a bank of about 45 extra slides (see 2.2). You don't need it.

**The three hours** (minutes from `src/LEAN.json`)

| # | Section | Clock | Min | Slides |
|---|---|---|---|---|
| 0 | Opening | 0:00–0:08 | 8 | 1–4 |
| 1 | Why neural networks? | 0:08–0:20 | 12 | 5–7 |
| 2 | From one neuron to an MLP | 0:20–0:38 | 18 | 8–12 |
| 3 | Activations: any function | 0:38–0:56 | 18 | 13–16 |
| 4 | Loss: how wrong are we? | 0:56–1:08 | 12 | 17–20 |
| 5 | Break, then True or bluff | 1:08–1:18 | 10 | 21–23 |
| 6 | Gradient descent and optimizers | 1:18–1:33 | 15 | 24–27 |
| 7 | The training loop, live | 1:33–2:08 | 35 | 28–35 |
| 8 | Generalization and debugging | 2:08–2:23 | 15 | 36–39 |
| 9 | Olympiad playbook and the two tasks | 2:23–2:53 | 30 | 40–48 |
| 10 | Wrap-up | 2:53–3:00 | 7 | 49–50 |

**The five things that matter most**
1. **Find out what they know on slide 3.** We are not sure what they have seen (roughly vectors, matrices, classical ML). Slide 3's three plain ideas carry the whole day: a model is a box with knobs, the loss says how wrong it is, training rolls downhill. If faces look blank, spend two more minutes there (see 2.3).
2. **Predict, then reveal.** Every demo starts with a vote or a number on paper.
3. **Keep the cliffhanger.** Vote on slide 20 before the break, don't give the answer, reveal it live on slide 34.
4. **Live-code from the notebook**, cell by cell, with four planned mistakes (3.2).
5. **Protect the task time.** Be on slide 40 by 2:23. Two traps decide most scores: Kobe's grader feeds raw coordinates (fold the scaling into `fc1`), and Inversion needs Adam lr ≈ 0.1, not 1e-3.

**Task files.** Statements, hint ladders and traps are in section 5. Students get `notebooks/02_kobe_starter.ipynb` with `data/kobe/data_train.csv`, and `notebooks/03_inversion_starter.ipynb` with the real task's `model.pt` and `data.csv` (or the practice replica in `data/inversion_practice/`). Solutions: `solutions/02_kobe_solution.ipynb`, `solutions/03_inversion_solution.ipynb`, and finished submissions in `solutions/kobe_submission/` and `solutions/inversion_submission/`. Keep `solutions/` away from students.

---

**How this guide fits.** `SCRIPT.md` says what to say and click on each slide. This guide explains why it is true, what students get wrong, and how to answer them. "Notebook" numbers are what `01_live_coding.ipynb` prints (one seed, the task file). The slides often show three-seed averages on a slightly different set of Kobe shots, so the third digit can differ (the network's log loss is 0.662 on the slides, 0.665 in the notebook). The order and the gaps are what matter.

## 1. Before the session

### 1.1 Setup checklist

**Displays**
- [ ] Connect the laptop to the projector as an **extended display**, not mirrored.
- [ ] Open `lecture.html` in Chrome or Edge. It is one self-contained file and works offline. Drag it to the projector and press **F**.
- [ ] Press **P** and drag the presenter window to the laptop. If nothing opens, allow pop-ups and press P again. With only one screen, **N** shows the notes on the main screen, where students see them too; keep a printed `SCRIPT.md`.
- [ ] Press **T** until the theme is light if the room is lit.

| Key | What it does |
|---|---|
| → / space / clicker | next build step or slide |
| ← | back |
| **B** | black screen |
| **O** | slide map; click to jump (or type 12 Enter) |
| D / E / W | draw / erase / blank whiteboard |
| C / R | show / reset the clock |
| ? | all keys |

The pace clock starts when you leave the title slide and says "behind plan" when you are late.

**Live coding**
- [ ] Open `notebooks/01_live_coding.ipynb` in Jupyter or Colab with `data/kobe/data_train.csv` (in Colab, upload the CSV and set `DATA_DIR = "."`).
- [ ] Run it top to bottom once (about a minute) and check that your numbers match the saved outputs.
- [ ] Big font (Ctrl/Cmd +), light theme, notifications off.

**Room**
- [ ] Paper and pens: predictions go on paper before the reveal. A board and markers; a phone timer as backup.
- [ ] Task files ready (Quick start). Decide the Kobe rulings (5.1) before class; students will ask.

### 1.2 What to print

**The vocabulary card, one per student.** Hand it out at the start. It costs nothing and it rescues students who have not met these words.

> **Parameter**: a number the model learns (a weight or a bias). The 2-8-8-1 Kobe network has 105.
> **Hyper-parameter**: a number *you* choose: learning rate, batch size, width, epochs, seed.
> **Forward pass**: computing the output from the input, layer by layer.
> **Logit**: the raw score before the sigmoid. 0 means 50%; positive means "more likely yes".
> **Loss**: one number saying how wrong the predictions are. Training makes it smaller.
> **Gradient**: for each parameter, which way (and how strongly) the loss changes if you nudge it.
> **Backward pass**: `loss.backward()` computes the gradient for every parameter at once.
> **Optimizer**: the rule that turns gradients into small changes of the parameters (SGD, Adam).
> **Batch**: the examples used for one update (for example 64 shots). **Step**: one update.
> **Epoch**: one full pass over the training data.

Also print the two task statements (section 5) for the students, and section 6 (Q&A) for your desk.

### 1.3 A 15-minute rehearsal

| Minutes | Do this |
|---|---|
| 0–3 | Open the deck, press P, check that both windows move together, set the theme, look at the map (O). |
| 3–8 | Run each live demo once: the straight-line playground (slide 5), the hinges (15–16), the learning-rate ball (24), the valley race (26), the scaling demo (30), overfitting (37), the toy inversions (46). |
| 8–13 | Run the notebook's four planned mistakes (3.2) and compare with the saved outputs. |
| 13–15 | Say aloud without notes: what a loss is; Adam in one sentence; why a sigmoid must not go before `BCEWithLogitsLoss`. If one comes out muddled, reread it in section 4. |

---

## 2. The plan

The timetable is in the Quick start; the presenter window shows the same planned times.

**Checkpoints:** the break slide (21) at 1:08; the end of the live coding (slide 35) at 2:08; slide 40 at 2:23. More than 5 minutes behind at a checkpoint means start cutting.

**Never cut:** slide 3 (the three ideas), the cliffhanger vote (20) and reveal (34), the five beats (28), notebook mistakes 1–3, the loss-curve doctor (39), "Predict the best possible score" (42), the folding hint (43), "Plan before typing" (48).

### 2.1 If late, cut in this order

1. The second True-or-bluff slide (23): play only slide 22.
2. Slide 16 (gradient descent finds the hinges). Say instead: "training places the hinges for us, roughly."
3. Slide 30 (the scaling demo). The notebook's first loss of 2.36 already makes the point.
4. Notebook mistake 4 (target shape): one sentence. It comes back as an Inversion trap.
5. Slide 37 (overfitting, live): go straight to the cures.
6. Slide 48: plan for Kobe only.

### 2.2 If early, add (from `lecture-full.html`)

Open `lecture-full.html` in a second tab, press O and click the slide. To make a slide permanent, add its id to `src/LEAN.json` and run `python3 tools/build.py`.

- **"Bug hunt: five planted bugs"** after slide 39: pairs, 4 minutes, on paper. The best addition. Answer key in 4.9.
- **"Exit ticket"** before slide 50 (answers in section 7).
- "Invent first: XOR with two ReLUs", "Universal approximation theorem", "Predict: Adam's first step".
- Notebook Part 9 (optimizers on Kobe), Part 10 (overfitting) and Part 11 (bridge to Inversion).

### 2.3 If they haven't seen it

Don't assume backprop, logistic regression or calculus. Some speaker notes say "you already know logistic regression"; if they don't, use one sentence from this table and move on. The formulas in the notes are for you; say the sentence instead.

| If they haven't seen… | Explain it as… |
|---|---|
| vectors and matrices | A vector is a list of numbers (a shot is the list x, y); a matrix is a table of numbers, and multiplying by it computes many weighted sums at once. |
| logistic regression | A model that adds up weighted inputs, squashes the total into a chance between 0 and 1, and so splits yes from no with one straight line. |
| the sigmoid | A squashing curve that turns any score into a chance between 0 and 1; a score of 0 gives 50%. |
| a gradient | For every knob: if I turn it up a little, does the loss go up or down, and how fast? |
| gradient descent | Roll downhill: measure the slope, take a small step down, repeat thousands of times. |
| backpropagation | The bookkeeping that finds every knob's slope in one backward sweep through the network; in PyTorch it is one line, `loss.backward()`. |
| the log in log loss | We pay −log of the chance we gave to what happened: 90% costs 0.1, 50% costs 0.69, 1% costs 4.6. Confident and wrong is expensive. |
| a validation split | Homework and a mock exam: learn from one part, check honestly on shots the model never saw. |
| overfitting | Memorising last year's exam answers: perfect on that paper, bad on a new one. |
| a tensor | PyTorch's name for an array of numbers that can remember how it was computed. |

---

## 3. How to teach

### 3.1 The moves

**Predict, then reveal.**
1. Show the setup. "Don't answer yet."
2. 30 seconds of silent thinking.
3. Everyone commits at once: paper, hands, or fingers for A/B/C/D.
4. If the vote is split (roughly 30–70% right): 60 seconds with a neighbour, then vote again.
5. Reveal, then ask a student "why?" before you explain.

More than 80% right first time: reveal and move on. Never punish a wrong prediction; name the misconception, not the student ("Many strong people predict A. Here is why A is tempting.").

**Pair discussion** works best on the hard concept questions: 10 linear layers vs 1 (slide 13), the cliffhanger (20), and "Is 61% a bad score?" (42). Vote alone, discuss in pairs, vote again.

**Worked, then on their own.** Do one example fully on the board, then let them do the next. Let them struggle for two minutes before you help. Strong students learn less when you over-guide them.

**Keeping the energy up**
- At the start, say: "This will feel harder than a lecture. That is the learning." Active classes *feel* less productive than lectures even when students learn more.
- Never talk more than about 6 minutes without students doing something; make the segments shorter in the second half.
- Cold-call with wait time: ask, wait 3–5 seconds, then name a student.
- B for a black screen pulls attention to you. Walk around during pair work and listen.
- Start the break on time, even mid-section.

### 3.2 Live coding and the four planned mistakes

**Rules.** Imports and data are pre-run. Run cell by cell; if you feel confident, retype the loop in Part 5 while saying the five beats. Say each line aloud before running it and read the output aloud after. Ask "What will this print?" before *every* run. If something breaks, debug aloud for up to a minute, then use the saved outputs.

Slide 29 lists the notebook parts in order: 3, 4, 5, 6, 7, 8. In the lean deck only mistakes 1 and 3 have slides (30 and 34). Show mistakes 2 and 4 in the notebook only; their slides are in `lecture-full.html`.

| # | Mistake (notebook part) | Ask first | What the notebook prints | The lesson |
|---|---|---|---|---|
| 1 | Feed raw coordinates (Part 4) | "What will the first loss be?" A fresh network should give about 0.69. | **2.36**; after scaling, **0.69** | Scale inputs with the *training* mean and std. Checking the loss before training catches it. |
| 2 | Delete `opt.zero_grad()` (Part 6) | Crash, same result, or worse? | No error. It says "made" for every shot: **about 44% accuracy** (log loss 0.700), worse than "always miss" (56% on this split) | Gradients pile up (2, then 4, then 6) unless you clear them. |
| 3 | `torch.sigmoid` at the end of the model, with `BCEWithLogitsLoss` (Part 7, the cliffhanger) | Re-take the vote from slide 20 | Printed loss **≈ 0.68** and accuracy **≈ 61%** look normal. But 76% of the outputs are below 1%, and the true log loss is **≈ 4.5** (correct model 0.665) | A bug can keep the accuracy and wreck the probabilities. |
| 4 | Labels of shape (N,) instead of (N, 1) (Part 8) | "Will this run?" | `BCEWithLogitsLoss` stops with an error (read it aloud). `MSELoss` only warns and returns 1.33 for three *perfect* predictions | Print shapes. This returns in the Inversion task. |

### 3.3 When you can't answer

- Check section 6 first.
- Otherwise: "Good question. I don't know for sure, and I won't guess." Strong students spot invented answers.
- If a one-minute experiment settles it, make it a prediction: "Let's predict, then try it."
- Off-topic (transformers, CNNs, GPUs): write it in a "parking lot" corner of the board and answer at the end or tomorrow.
- If a student turns out right and you were wrong, say so plainly.

### 3.4 Things not to say

- "Neural networks work like the brain." Loosely inspired at most.
- "Minsky and Papert proved neural networks can't do XOR." Only networks *without* a hidden layer.
- "Hinton invented backprop." He helped make it famous in 1986.
- "Adam always wins", "the optimizer finds the global minimum", "networks can learn anything".
- "The Kobe inputs are normalised." They are raw tenths of a foot.
- "Raw inputs make training fail completely." With Adam they trained fine on Kobe; plain SGD shows the damage.
- "This was APOAI 2025." It is China's NOAI 2024 problem 1 under a mock-test label.
- Jokes about Kobe's death (January 2020, helicopter crash). Mention it respectfully if it comes up, or not at all.

---

## 4. The content, explained for you

Each topic: the idea in plain words, a picture to draw, the key numbers, what students get wrong, and what they will ask. Slide numbers refer to `lecture.html`.

### 4.1 Why straight lines fail (slides 5–7)

**Say.** A model that only adds up weighted inputs, like logistic regression, splits yes from no with one straight line. If the classes can't be split by a line (a circle inside a ring, a spiral), no amount of training helps: the model only contains lines. Kobe's chance depends mainly on the distance from the rim, so lines of equal chance are arcs around the rim. Fix 1: invent a feature, such as distance squared; the circle lifts into a bowl and one flat cut separates it. Fix 2: let the model invent its own features. That is a hidden layer.

**Draw.** Circle-in-ring data with one obviously failing line; next to it, the bowl sliced by a flat sheet.

**Numbers (notebook, validation).** Log loss: constant guess 0.686, logistic regression 0.673 (58.8% accuracy), 2-8-8-1 network 0.665 (60.4%). The best possible straight line on the task file reaches 58.6%.

**Watch for.** "Train it longer and it will bend." It can't.

**They ask.** *"Why not just add x² and y²?"* For a circle that works perfectly. For a court or a spiral you would have to guess the right feature; a hidden layer learns it, and the Kobe rules forbid hand-made features anyway.

### 4.2 Neurons, layers, shapes and parameter counts (slides 8–12)

**Say.** A neuron weighs its inputs, adds them up with a bias, then bends the result with an activation. Its "zero line" cuts the court in two. A hidden layer is several neurons side by side, each drawing its own line; the next layer combines their reports, like a committee of line-drawers and a manager. *Depth* is the number of layers; *width* is the number of neurons per layer. Only for students who know matrices: a layer computes **h** = activation(*W***x** + **b**).

**Shapes.** Data is (batch, features), for example (32, 2). `nn.Linear(2, 8)` turns it into (32, 8). PyTorch stores the weight as (out, in) = (8, 2): one row per neuron. Each `Linear(in, out)` has in × out weights plus out biases. Wrong shapes are the most common beginner error; print `.shape` constantly.

**Draw.** The 2-8-8-1 network with the weight shapes on the arrows: 8×2, 8×8, 1×8.

**Numbers.** `Linear(2, 8)` = 24. 2-8-8-1 = 24 + 72 + 9 = **105**, the largest legal Kobe network. In code: `sum(p.numel() for p in model.parameters())`.

**Watch for.** Expecting (in, out); forgetting the biases; thinking the batch size changes the count; "hidden unit 3 means something" (shuffle the units and you get the same network).

**They ask.**
- *"Why (8, 2) and not (2, 8)?"* Row *j* holds neuron *j*'s weights.
- *"Two hidden layers but three linear layers?"* Each hidden layer is a linear layer plus an activation; the third linear layer gives the output score.

### 4.3 Activations: why the bend matters (slides 13–16)

**Say.** Without a bend between them, stacked linear layers collapse into one: ten linear layers can draw only what one can, a straight line. The activation is the bend. ReLU, max(0, *z*), is the default: zero on one side, a straight ramp on the other. Three ReLUs make a hat: ReLU(*x*) − 2·ReLU(*x* − 1) + ReLU(*x* − 2) is 0, rises to 1 at *x* = 1, and falls back to 0 at 2. Add many scaled hats and you can follow any curve, like joining the dots. That is the idea behind the "universal approximation theorem": one hidden layer, if wide enough, can match any smooth curve over a region.

**What the theorem does NOT say:** how wide the layer must be; that training will find the weights (slide 16 shows it often doesn't quite); anything about noisy data; anything outside the data, where a ReLU net just continues in straight lines.

| Activation | What it is | Use it for |
|---|---|---|
| ReLU | max(0, *z*) | the default in hidden layers |
| Leaky ReLU, ELU | ReLU with a small slope below 0 | when units "die" (below) |
| Sigmoid | squashes to (0, 1) | turning the final score into a probability |
| tanh | squashes to (−1, 1) | small, smooth networks |

**Output rule:** no activation at the end of the model. Output the raw score (the logit) and let the loss apply the sigmoid. (The Kobe *submission* is a deliberate exception; see 5.1.)

**Draw.** Three ramps adding up to a hat; then many hats adding up to a wiggly curve.

**Numbers.** On Kobe, ReLU and tanh score about the same (log loss 0.662 vs 0.664 in our runs). Width matters more: the official 2-1-1-1 baseline passes one number per layer, so it can only draw a straight line (57.7%); 2-8-8-1 reaches about 60.5–61%. An 80 times bigger network gains nothing (0.660 vs 0.662). The limit is basketball's randomness, not the network.

**Watch for.** Over-rating the choice of activation in tiny networks (scaling and the learning rate matter more); "so 2-8-8-1 can fit Kobe perfectly" (no: the width is fixed and the labels are coin flips); "deeper is always better".

**They ask.**
- *"ReLU has a corner at 0. Is that a problem?"* No. PyTorch uses slope 0 there, and exact zeros are rare.
- *"What is a dead ReLU?"* A unit whose line lies outside the whole data cloud outputs 0 for every input, gets no gradient and never recovers. Causes: too high a learning rate, unscaled inputs, bad luck. Fixes: lower lr, scale inputs, another seed, LeakyReLU.

### 4.4 Losses and logits (slides 17–20)

**Say.** The loss is one number for how wrong we are; match it to what you predict. A **number**: mean squared error (MSE), the average of the squared misses (Inversion is scored with it). **Yes/no**: binary cross-entropy, also called log loss. It is a surprise meter: confident and wrong is a huge surprise, like "90% rain" on a dry day. **One of K classes**: cross-entropy with softmax. The **logit** is the raw score before the sigmoid: 0 means 50%, +2 about 88%, −2 about 12%. The model outputs logits; the loss takes logits.

| Task | Model outputs | Loss | Labels |
|---|---|---|---|
| a number | 1 value | `nn.MSELoss()` | float, same shape as the output |
| yes / no | 1 logit | `nn.BCEWithLogitsLoss()` (applies the sigmoid itself, safely) | float 0/1, shape (N, 1) |
| one of K | K logits | `nn.CrossEntropyLoss()` (applies softmax itself) | integer class, shape (N,) |

Accuracy can't be the loss: it is a staircase, so tiny weight changes don't change it and there is no slope to follow.

**Draw.** The cost of a made shot for different predicted chances: 90% → 0.1, 50% → 0.69, 10% → 2.3, 0.1% → 6.9.

**Numbers.** A fresh network predicts about 50% everywhere, so its first loss is about **0.69** (10 classes: 2.30). Far from that means a bug. Kobe's best constant prediction (44.7% for every shot) scores **0.686**: the number to beat.

**The cliffhanger, explained.** With a sigmoid in the model *and* `BCEWithLogitsLoss`, the output is squashed twice. Whatever the model outputs, the loss sees a chance between 50% and 73%, so the printed loss can never look very good or very bad: it looks normal (≈ 0.68). To push it down on misses, the network drives its own outputs to the extreme: 76% of them end below 1%. Accuracy survives (≈ 61%) because the rim zone still lands on the right side of 0.5, but the true log loss of those probabilities is ≈ 4.5 (correct model 0.665). Fix: remove the sigmoid (preferred), or keep it and use `nn.BCELoss`. Same family: a softmax in the model plus `CrossEntropyLoss`.

**Watch for.** A sigmoid in the model plus `BCEWithLogitsLoss`; float labels for `CrossEntropyLoss`; labels of shape (N,) for `BCEWithLogitsLoss`.

**They ask.**
- *"Why the log?"* It punishes confident mistakes hard, and on average it is lowest when you report your honest belief.
- *"Is a 2-class softmax different from a sigmoid?"* No. Use one score for yes/no tasks.

### 4.5 Gradient descent, the learning rate, epochs and batches (slides 24–25)

**Say.** The gradient tells each weight which way is uphill; we step the other way. The learning rate is the step size and the most important knob. On paper: loss (*w* − 3)², start at *w* = 0, learning rate 0.1: the slope is −6, so *w* moves to 0.6 (notebook Part 2). On slide 24: 0.02 crawls (140 steps), 0.3 arrives in 7, 0.9 zig-zags but arrives, 1.05 explodes.

**Epoch, batch, step.** An epoch is one pass over all training data; a batch is the handful of examples behind one update; a step is one update. Steps per epoch = shots ÷ batch size, rounded up. Slide 25 uses 20,558 shots: 322 steps with batches of 64. The notebook uses the task file's 20,000 training shots: 313 steps (the last batch has 32), 9,390 in 30 epochs. Expect someone to notice the difference. **Count steps, not epochs:** 30 epochs of full-batch training are only 30 steps and end at 0.688, no better than a constant guess; batches of 64 reach 0.662 (slide 25).

**Narrow valleys.** When the loss is much steeper in one direction than another, gradient descent zig-zags across the valley and crawls along it. Unscaled inputs cause exactly this (4.7).

**Draw.** A parabola with three step sequences: tiny, good, bouncing.

**Watch for.** Using epoch, batch and step as synonyms; "a bigger learning rate trains faster" (only up to the edge).

**They ask.** *"Which batch size?"* 32–256 for small tables. *"Does the small last batch matter?"* No.

### 4.6 Optimizers (slides 26–27)

**Say, one sentence each.**
- **SGD**: step = learning rate × gradient.
- **Momentum**: a heavy ball that keeps its speed, so zig-zags cancel and steady slopes add up.
- **Adam**: momentum plus its own step size for every weight. In practice **each weight moves about lr per step, whatever the size of its gradient** (notebook Part 2: gradients of 1000, 1 and 0.001 all move exactly 0.001 at lr 1e-3).
- **AdamW**: Adam with weight decay done properly. Use it when you want weight decay.

| Situation | Use |
|---|---|
| Any new problem today: MLPs, tables, olympiad tasks | `Adam(params, lr=1e-3)`, then try 3e-4, 3e-3, 1e-2 and keep the best on validation |
| You want weight decay | `AdamW(params, lr=1e-3, weight_decay=0.01)` |
| Optimising *inputs* (Inversion) | Adam with lr about the size of the values (≈ 0.1) |

**Be honest: Adam is a default, not magic.** On Kobe a well-tuned plain SGD did as well.

**Numbers (notebook Part 9, same network and seed, 30 epochs, validation):**

| Setting | Log loss | Accuracy |
|---|---|---|
| constant guess | 0.686 | 56.1% |
| SGD lr 1e-3 | 0.681 | 56.1%: barely moved, still "always miss" |
| SGD lr 0.1 | 0.663 | 61.0% |
| Adam lr 1e-3 | 0.666 | 60.4% |
| Adam lr 1.0 | 0.689 | 56.1%: jumps around, ends at "always miss" |

"lr 1e-3 is an Adam default, not a law of nature."

**Draw.** A narrow valley with three paths: SGD zig-zagging, momentum swinging wide then settling, Adam heading fairly straight.

**Watch for.** "Adam needs no tuning"; using Adam's 1e-3 with plain SGD, where it barely moves.

### 4.7 Input scaling (slide 30, notebook Part 4)

**Say.** Standardise each input: subtract the training mean, divide by the training standard deviation (std). Apply the *same two numbers* to validation, test and grader data. Raw numbers in the hundreds make every first-layer score huge, so a fresh network is confidently wrong from step 0. Very different scales also make the valley narrow, so no single learning rate suits every weight. Scaling turns the valley into a round bowl and lets the defaults (Adam 1e-3, PyTorch's starting weights) behave as designed.

**Numbers.**
- Kobe's coordinates are raw tenths of a foot: `loc_x` from −250 to 248 (std ≈ 110), `loc_y` from −44 to 791 (std ≈ 88). The statement's "already normalized" is false.
- First loss before training (notebook): raw **2.36**, scaled **0.69**.
- Plain SGD at lr 0.1 on raw inputs collapses to "always miss"; scaled, it reaches about 60% (slide 30). Adam trains about as well on raw inputs, because its per-weight steps hide the scale. Standardise anyway.

**The Kobe twist.** The grader feeds *raw* coordinates, so the scaling must live inside the weights: fold it into `fc1`. In words: divide each column of the weight matrix by the std of its input, then subtract (new weights × means) from the bias. It is exact (outputs match to about 1e-6) and legal, because a scaling step followed by a linear layer is still one linear layer.

**Draw.** Two contour plots: long thin ellipses with a zig-zag path ("raw") and circles with a straight path ("scaled").

**Watch for.** Computing the mean and std on all the data or on validation; forgetting that the Kobe grader feeds raw coordinates.

**They ask.** *"Why only training statistics?"* Validation must imitate unseen data, and the grader's data won't come with its own statistics. *"Min-max or z-score?"* z-score by default.

### 4.8 The training loop, line by line (slides 28–35)

A compact version of the notebook's code. The class form carries over to the Kobe task, which forbids `nn.Sequential`.

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
    for idx in torch.randperm(len(X_tr)).split(64):    # shuffle, batches of 64
        opt.zero_grad()                                # 1. clear old gradients
        logits = model(X_tr[idx])                      # 2. forward
        loss = loss_fn(logits, y_tr[idx])              # 3. loss (y has shape (B, 1))
        loss.backward()                                # 4. backward: fills .grad
        opt.step()                                     # 5. update the weights
    model.eval()
    with torch.no_grad():
        val_acc = ((model(X_va) > 0).float() == y_va).float().mean()
```

**The five beats: zero, forward, loss, backward, step.** Say them aloud every time.
- `zero_grad()`: gradients **add up** unless cleared (three `backward()` calls give 2, 4, 6).
- `backward()` only computes gradients; only `step()` moves the weights. Create the optimizer once, outside the loop.
- `model.eval()` switches dropout and batch-norm to test behaviour; `torch.no_grad()` stops recording for the backward pass. Neither changes this small network's result, but build the habit.
- `logit > 0` is the same as "chance above 50%".

**Loud bugs.** Read the last line of the error: it usually names the fix.

| Message (shortened) | Cause | Fix |
|---|---|---|
| `mat1 and mat2 shapes cannot be multiplied (64x3 and 2x8)` | 3 input columns, layer built for 2 | match `in_features` to the data |
| `mat1 and mat2 must have the same dtype, but got Double and Float` | numpy and pandas give float64 | `X.float()` |
| `Target size (torch.Size([64])) must be the same as input size (torch.Size([64, 1]))` | labels (N,) with `BCEWithLogitsLoss` | `y.unsqueeze(1)` |
| `result type Float can't be cast to the desired output type Long` | integer labels into BCE | `y.float()` |
| `Can't call numpy() on Tensor that requires grad` | converting a tracked tensor | `.detach().numpy()` |

**Silent bugs (no error).** No `zero_grad`. A sigmoid before `BCEWithLogitsLoss`. `MSELoss` with (N, 1) against (N,), which only warns. Creating the optimizer inside the loop. Scaling validation data with validation statistics. "Validation" computed on the training set.

**They ask.**
- *"Why does PyTorch add gradients up?"* So you can add up several small batches before one step. The price: you clear them yourself.
- *"Why `.item()`?"* It turns a one-number tensor into a plain Python number for printing and logging.

### 4.9 Generalisation and debugging (slides 36–39)

**Say.** *Training* data fits the weights (homework), *validation* data chooses settings and when to stop (mock exam), the *test* set is used once (the real exam). In a competition the hidden board is the test set; tuning to the live board overfits it. *Underfitting*: training and validation loss both high and close together. *Overfitting*: training loss keeps falling while validation turns up and the gap grows.

**Cures:** more data; a smaller model; **early stopping**, keeping the best weights with `copy.deepcopy(model.state_dict())` (a plain `state_dict()` silently keeps changing and saves the *last* weights); **weight decay** (a gentle pull of every weight towards 0); **dropout** (randomly switch off hidden units during training; `eval()` turns it off). On Kobe they hardly matter: 105 parameters can't memorise 20,000 noisy shots. Keep the best checkpoint anyway.

**Numbers (notebook Part 10).** A 2-256-256-1 network (66,817 parameters) on only 500 shots, 2,000 full-batch steps: training loss 0.387, validation 1.35. Its best weights came at step 10 (validation 0.678). The slides show 1.23, a three-seed average.

**Draw.** Two curves against steps: training going down and down; validation going down, then up, with the best checkpoint marked at its lowest point.

**The loss-curve doctor (slide 39), for the afternoon**

| Curve | Diagnosis | Try |
|---|---|---|
| explodes or NaN | learning rate too high (or unscaled inputs) | lr ÷ 10; check the scaling |
| falls slowly, almost straight | learning rate too low | lr × 10, or train longer |
| flat near 0.69 from the start | learned nothing: a constant predictor, dead units, a missing `step()` | scaling, lr, seed; print the fraction predicted "made" |
| training falls, validation rises | overfitting | best checkpoint, smaller model, weight decay |
| very jagged | small batches | bigger batch, lower lr, or a moving average |
| both fall and flatten together | healthy, maybe at the noise ceiling | compare with the baseline and stop tuning |

**Karpathy's checks:** (1) check the loss before training (≈ 0.69 here); (2) beat a simple baseline ("always miss"); (3) make the model memorise one tiny batch, or there is a bug; (4) look at the predictions (for Kobe, a court heat map); (5) change one thing at a time, with fixed seeds.

**Bug hunt answer key** (only if you add the slide from `lecture-full.html`): (1) scaling with validation statistics; (2) `nn.Sigmoid()` with `BCEWithLogitsLoss`; (3) labels (64,) against output (64, 1), the only crash; (4) no `opt.zero_grad()`; (5) "validation" measured on the training set. Most often missed: 1 and 2.

**Watch for.** "High training accuracy means a good model"; "training loss below validation loss means overfitting" (a small, stable gap is normal).

**They ask.**
- *"Validation loss below training loss: a bug?"* Usually not: the training loss is averaged while the weights were still improving, dropout only runs in training, or the split is lucky.
- *"Kobe is stuck at 61%. Underfitting?"* No, that is the ceiling (5.1).

### 4.10 Optimising inputs instead of weights (slides 45–47)

**Say.** Backprop can compute the gradient for *anything* marked `requires_grad=True`. In training the data is fixed and the weights move. In inversion the weights are frozen and one *input* moves. Same loop, different target. For students who don't like maths: the model is a frozen lock, and we turn the key until it opens.

**Toy 1, one answer (slide 46, left).** The "model" is *a* + 2*b* + *c*², with *a* = 1, *c* = 1.5 and output 4.65; find *b* (it is 0.7). Learning rate 0.125 lands in one step, 0.25 bounces between 0 and 1.4 forever, 0.3 blows up. The step size must fit the steepness.

**Toy 2, two answers (right).** Find *c* with *a* = 1, *b* = 0.7: *c*² = 2.25, so +1.5 or −1.5. Starting at +0.1 gives +1.5; at −0.1 gives −1.5; starting at **exactly 0** it never moves, because 0 is the top of a hill where the slope is exactly zero. The wrong sign fits perfectly and is still wrong. When several inputs give the same output, the fit can't tell them apart; you need a prior guess to choose.

**The learning-rate trap.** Adam moves each value about lr per step, so at lr 1e-3 it needs thousands of steps to move a value by 2. Use about 0.1 for values of size 1–3. Notebook Part 11: after 300 steps, lr 1e-3 leaves an error (MSE) of 0.57; lr 0.1 recovers the answer exactly.

**One unknown? Look at all of it.** With one unknown per row, evaluate the model at 2,001 values for every row at once (under `torch.no_grad()`). Every crossing of the target *y* is a solution; gradient descent only finds the one downhill from its start.

**Draw.** Two pipelines. Training: data (fixed) → model (weights moving) → loss. Inversion: data with one column moving → model (frozen, a padlock) → output vs *y* → loss.

**Watch for.** Changing the weights (forbidden) or all ten inputs; Adam at lr 1e-3; taking a perfect fit as proof of the right answer.

**They ask.** *"Can different inputs really give the same output?"* Yes: on the practice replica, 331 of 1000 rows have two or more exact solutions.

---

## 5. The two afternoon tasks

### 5.1 Task 1: Kobe shot prediction

**Origin.** Problem 1 of round 2 of China's NOAI 2024, reused in an NOAI 2025 teaching test that the Bohrium platform labels "APOAI2025 Mock". The 25,000 rows are Kaggle's labelled Kobe Bryant shots, shuffled and renumbered.

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

The largest legal network is 2-8-8-1 (105 parameters). The official baseline names the class `MyModel` with a no-argument constructor; keep that.

**Rulings to announce** (our recommendations)
- Distance or angle computed inside `forward()`: illegal (only linear layers and activations), and it gives no measurable gain.
- `shot_distance` or `minutes_remaining` as inputs: illegal; the grader passes 2 columns.
- Scaling inside `forward()`: grey; fold it into `fc1` instead.
- A final `nn.Sigmoid`: keep it (see the traps).

**Why the scores are so low** (tell them after they have tried). Each shot is a coin flip whose chance depends on position. Even the 4,200 shots taken right at the rim went in only 62.5% of the time. Accuracy only asks which side of 50% each spot is on, and only shots within about 3 ft of the rim go in more than half the time. So the best possible answer is essentially "made if within 3 ft", which says "made" for about a fifth of the shots.

**Expected scores** (validation accuracy on the task file)

| Model | Accuracy |
|---|---|
| "always miss" | 55.3% |
| official 2-1-1-1 baseline (a straight line) | 57.7% |
| best possible straight line | 58.6% |
| "made if within ~3 ft" | 60.7% |
| good legal 2-8-8-1 (the ceiling, ≈ 61%) | 60.5–61% |

On the starter's own split expect a little less (rule 60.2%, reference network 60.2%). On the real boards the best honest scores were 0.621 (A) and 0.625 (B). A board of about 2,500 shots wobbles by about ±0.01, so entries above 0.96 are grader exploits, not models.

**Reference approach** (`solutions/02_kobe_solution.ipynb`)
1. Write `submission_model.py` first (the starter's `%%writefile` cell): `MyModel` with `fc1 = nn.Linear(2, 8)`, an activation, `fc2 = nn.Linear(8, 8)`, an activation, `fc3 = nn.Linear(8, 1)`, a final `nn.Sigmoid()`, and a `logits()` method that stops before the sigmoid. Import that class to train.
2. Split 80/20; standardise with training statistics.
3. `BCEWithLogitsLoss` on `model.logits(x)`, Adam lr 1e-2, full batch, about 2,000 steps.
4. Check: validation accuracy ≈ 0.60–0.61; fraction predicted "made" about 0.2–0.35.
5. Fold the scaling into `fc1`, save the `state_dict`, zip both files.
6. Unzip into a fresh folder, load like the grader, run on **raw** validation coordinates, confirm the accuracy and the rules (the starter's rule-check cell).

**Traps**
- **Raw coordinates from the grader.** Train on scaled inputs and forget to fold, and the submitted network sees inputs 100 times too large.
- **`nn.Sequential` scores 0.** Write `self.fc1 = …` explicitly.
- **Class/weights mismatch.** Two public notebooks trained one architecture and submitted another's class, so loading failed. Train the class you submit; reload the zip before uploading.
- **The sigmoid.** The grader most likely thresholds the output at 0.5, so `forward()` ends with `nn.Sigmoid()`. Then `BCEWithLogitsLoss` must get `model.logits(x)`, not `model(x)`: that would be the cliffhanger bug. (Or train `model(x)` with `nn.BCELoss`.)
- **The best checkpoint** must be `copy.deepcopy(model.state_dict())`.
- **A constant predictor.** Too small an lr, too few steps or a bad seed gives "always miss" (55.3%) or "always made" (44.7%). Always print the fraction predicted "made".
- **Chasing the leaderboard.** Differences under 0.01 are noise.

**Hint ladder** (minutes from the start of the task; only for students who are stuck)

| Hint | When | Say |
|---|---|---|
| 1 | ~15 min, no baseline | "Before training: what does 'always miss' score? Compute the make rate by distance. Where is it above 50%?" |
| 2 | ~30 min, no legal model | "The class in the `%%writefile` cell *is* your submission. Pick the sizes (at most 8) and the activations, no `nn.Sequential`, and run the rule-check cell after every change." |
| 3 | ~45 min, stuck at 55–58% | "Is the network wide enough to draw a disc? 2-1-1-1 only draws a line. What fraction do you predict 'made'? Try Adam lr 1e-2, full batch, about 2,000 steps." |
| 4 | ~60 min, about to submit | "The grader feeds raw coordinates. Fold your scaling into fc1: divide each column of the weights by that input's std, then fix the bias. Check that the outputs are unchanged on raw inputs." |
| 5 | ~75 min, no valid zip | Walk them through the starter's last cells: write `submission.zip`, reload it like the grader, check that every rule says PASS and that the accuracy on raw coordinates equals the validation accuracy. |

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

**Launch.** Hand out the statement, `03_inversion_starter.ipynb` and the data. The starter runs as given and submits all zeros (score ≈ 0). It already finds the zeroed column and wraps the model as `predict(z)`; the TODOs are the optimizer loop on the missing column only, a residual check, a plot of one row, and choosing between several solutions. Say only: "Same backprop as this morning; the input is the parameter." Students may use the other columns' statistics; only the model's weights are off limits.

**Practice data vs the real task.** `data/inversion_practice/` is our replica, not the real task. It includes `true_column.csv`, so the starter can score itself. On the real files there is no truth: students see only the loss, the per-row residual |*f*(*z*) − *y*| and the number of solutions per row. They can *estimate* their MSE by simulation: invent a column, compute *y* with the model, hide the column and rerun their pipeline.

**The score is linear in MSE**, so the top end is squeezed:

| MSE | 0.5 | 0.2 | 0.1 | 0.05 | 0.0236 | 0.0145 | ≤ 0.0045 |
|---|---|---|---|---|---|---|---|
| score | 48.6 | 79.7 | 90.1 | 95.3 | 98.0 | 99.0 | 100 |

**Expected scores.** We don't have the real model, so these come from the practice replica (10 inputs, a 10-64-64-1 network, 1000 rows, the same 0.968 baseline). Treat them as a guide.

| Method | MSE | Score |
|---|---|---|
| leave zeros | 0.967 | ≈ 0 |
| Adam lr 1e-3, 500 steps, from 0 | 0.433 | 55 |
| **Adam lr 0.1, 500 steps, from 0** (safe first submission) | 0.0236 | **≈ 98** |
| all solutions, pick the one closest to 0 | 0.021 | 98.3 |
| **all solutions, weighted average** | 0.0145 | **≈ 99** |

Adam from 0 works so well because starting at 0 picks the solution closest to 0, a built-in prior guess.

**Reference approaches** (`solutions/03_inversion_solution.ipynb`)
1. *Safe (under a second).* `model.eval()`, freeze the parameters, float32. Find the zero column `k`. `z = torch.zeros(N, requires_grad=True)`; input `torch.cat([X[:, :k], z[:, None], X[:, k+1:]], 1)`; prediction `model(...)[:, 0]`; loss `((pred - y)**2).sum()`; `Adam([z], lr=0.1)` for 500 steps. Only `z` goes to the optimizer.
2. *The improvement.* Evaluate a grid of 2,001 values in [−5, 5] for every row. Each sign change of *f* − *y* brackets a solution; polish it with a few Newton steps. Where a row has several, weight each by how plausible it is (a normal prior for the column, divided by the slope at that solution) and submit the **weighted average**. It minimises the expected squared error; picking one solution is a gamble.

**Traps**
- **`model.eval()`.** A model saved in training mode loads with dropout on; two calls on the same input then differ.
- **Freeze the parameters:** `for p in model.parameters(): p.requires_grad_(False)`. With TorchScript in torch 2.15, skipping this makes `torch.no_grad()` stop working after one gradient call (the grid gets slow), and `torch.inference_mode()` crashes. Input gradients still work.
- **float32.** pandas gives float64, which causes the dtype error.
- **(N, 1) vs (N,).** The model returns (N, 1), *y* is (N,). `model(X) - y` silently becomes an N × N table mixing all rows: MSE 2.44, *worse than zeros*. Use `[:, 0]` or `.squeeze()`, and assert shapes.
- **Adam lr 1e-3 is far too slow for inputs.** Use about 0.1. lr 1.0 overshoots into the wrong solution (MSE 1.39).
- **SGD with `.mean()` hardly moves** (every row's gradient is divided by 1000; MSE 0.709). Use `.sum()` or Adam.
- **Optimise only the missing column.** Moving all 10 inputs "explains" *y* with the wrong values (MSE 0.504).
- **Rows with two solutions.** On the replica, 331 of 1000 rows have two or more exact solutions, and about 15 wrong picks cause almost all the remaining error. Residuals can't see them (the fit is perfect); only counting solutions on a grid does. "Several random starts, keep the smallest residual" is a coin flip and scores *worse than zeros*.
- **Stuck starts.** Exactly at a point with zero slope (Toy 2's 0, or a ReLU exactly at 0), nothing moves.
- **`torch.set_num_threads(1)`.** On a busy shared CPU the default threads made torch about 100 times slower in our tests.
- **Submit the code** with the answers.

**Hint ladder**

| Hint | When | Say |
|---|---|---|
| 1 | ~10 min | "Read `predict(z)`: what does it do? What happens to the output when you put other values into the missing column?" |
| 2 | ~25 min | "Make the missing column the parameter: `z = torch.zeros(N, requires_grad=True)`, loss = sum of squared differences between `predict(z)` and *y*, and give only `[z]` to the optimizer. Print every shape." |
| 3 | ~40 min, self-score below 60, or residuals still large | "How far does Adam move a value per step? About lr. Your values are ±1–3. Try lr 0.1 for 500 steps. Is your prediction (N, 1) or (N,)?" |
| 4 | ~60 min, self-score around 98, or most residuals tiny | "One unknown per row: try 2,001 values for every row at once and plot *f*(*z*) for a few rows against the line *y*. How many crossings?" |
| 5 | ~80 min | "With two crossings, which do you submit? Prefer the one closest to a prior guess (0, or a prediction from the other columns). Better: what minimises the *expected* squared error when you're unsure? A weighted average." |

---

## 6. Q&A cheat-sheet

1. **Adam in one sentence?** Momentum plus its own step size for every weight; each moves about lr per step. Start at 1e-3, then tune.
2. **Is Adam always best?** No, just the most forgiving default. On Kobe, plain SGD at lr 0.1 did as well.
3. **Why ReLU, not sigmoid, in hidden layers?** The sigmoid's slope is at most 0.25 and almost 0 when it saturates, so gradients shrink layer by layer. ReLU's slope is 1 when it is on.
4. **You said no sigmoid in the model. Why does the Kobe submission have one?** The grader wants probabilities. Train through `model.logits(x)` with `BCEWithLogitsLoss`, or train `model(x)` with `nn.BCELoss`. The bug is a sigmoid *plus* `BCEWithLogitsLoss`.
5. **Why batches instead of all the data at once?** Many more updates per epoch, less memory, helpful noise. 30 full-batch epochs on Kobe learned nothing.
6. **How many layers and units?** Start small, grow while validation improves, try several seeds. For Kobe: 2-8-8-1, the legal maximum.
7. **Loss vs metric?** Train on a smooth loss (log loss); report the competition's metric. Kobe's metric, accuracy, has no useful slope.
8. **Why check the loss before training?** The cheapest bug detector: about 0.69 for yes/no. On Kobe, 2.36 means unscaled inputs.
9. **`model.eval()` vs `torch.no_grad()`?** `eval()` changes how dropout and batch-norm behave; `no_grad()` stops gradient recording. Use both to evaluate.
10. **Why different results every run?** Random starting weights and shuffling. Fix `torch.manual_seed(0)` to reproduce; report several seeds to be honest.
11. **Why not start all the weights at zero?** Then every hidden unit computes the same thing, gets the same gradient and stays a copy forever; eight units act like one. PyTorch's random start is fine.
12. **Do more epochs always help?** No, validation can get worse. On Kobe, 100 epochs gained almost nothing over 30.
13. **Dropout and weight decay: why not on Kobe?** Both fight memorising, and Kobe's 105-parameter network can't memorise 20,000 noisy shots. With Adam, use AdamW for weight decay.
14. **Why is Kobe accuracy only about 61%? Can anyone get 70%?** Each shot is a coin flip; even at the rim he scored about 63%. Extra Kaggle columns (shot type, season) reach about 68%, but they are not allowed.
15. **0.607 vs 0.611 on the board: which is better?** Probably neither. Board noise is about ±0.01 and different seeds differ by 0.005–0.01. Compare averages over several seeds on your own validation split.
16. **Inversion: sum or mean in the loss?** Sum. The rows are independent, and with SGD the mean divides each row's gradient by 1000. Adam doesn't care.
17. **Inversion: two values fit perfectly. Which one?** The data can't tell them apart. Use a prior guess, or submit their weighted average to minimise the expected squared error.
18. **CNNs, transformers, GPUs?** Parking lot. Same loop, losses and optimizers; only the model box changes.

---

## 7. After the session

**Exit ticket** (only if you added the slide from `lecture-full.html`)

| # | Question | Answer |
|---|---|---|
| 10 | Put in order: `loss.backward()`, `opt.step()`, `opt.zero_grad()`, `loss = loss_fn(model(x), y)` | `zero_grad` → forward and loss → `backward` → `step` |
| 11 | Kobe made 44.6%. Log loss of the best constant guess? Accuracy of "always miss"? | ≈ 0.687; ≈ 55% |
| 12 | True or false: "If training loss < validation loss, the model is overfitting." | False as stated: a small gap is normal |
| 13 | Does `BCEWithLogitsLoss` expect probabilities or logits? | Logits |
| 14 | In Inversion, which tensor has `requires_grad=True`? | The missing input column, not the weights |
| 15 | One thing that is still muddy | Read them all |

Tally right and wrong per question. Above 80%: done. 50–80%: one minute tomorrow. Below 50%: re-teach with a new prediction question. Q13 wrong: show the cliffhanger numbers again (log loss ≈ 4.5 vs 0.665); it causes silent bugs.

**Tomorrow**
- **Three warm-up questions** before anything new: "Why must there be a bend between layers?", "What should the first yes/no loss print?", "How far does Adam move a weight per step?"
- **Kobe debrief.** The ladder 55.3% → 58.6% (best line) → 60.7% (rim rule) → ≈ 61% (network). Show the folding step and the sigmoid/`BCELoss` pairing. Ask whose zip failed to reload, and why.
- **Inversion debrief.** Plot one row with two solutions. Explain why Adam from 0 already scores about 98, and why the last points come from choosing between solutions, not from polishing residuals.
- **The muddiest points** from the exit ticket or from your parking lot.
