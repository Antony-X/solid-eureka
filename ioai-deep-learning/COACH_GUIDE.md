# Coach's guide: "Neural networks, hands-on"

## Quick start

**Open:** `lecture.html` in Chrome or Edge (**F** full screen, **P** presenter window with notes and a pace clock); `notebooks/01_live_coding.ipynb`, already run (its saved outputs are the numbers to expect); `SCRIPT.md`, printed (what to say on each slide). `lecture-full.html` is an optional bank of about 45 extra slides (2.2).

**The three hours** (minutes from `src/LEAN.json`)

| Clock | Min | Section | Slides |
|---|---|---|---|
| 0:00–0:08 | 8 | Opening | 1–4 |
| 0:08–0:20 | 12 | Why neural networks? | 5–7 |
| 0:20–0:38 | 18 | From one neuron to an MLP | 8–12 |
| 0:38–0:56 | 18 | Activations: any function | 13–16 |
| 0:56–1:08 | 12 | Loss: how wrong are we? | 17–20 |
| 1:08–1:18 | 10 | Break, then True or bluff | 21–23 |
| 1:18–1:33 | 15 | Gradient descent and optimizers | 24–27 |
| 1:33–2:08 | 35 | The training loop, live | 28–35 |
| 2:08–2:23 | 15 | Generalization and debugging | 36–39 |
| 2:23–2:53 | 30 | Olympiad playbook and the two tasks | 40–48 |
| 2:53–3:00 | 7 | Wrap-up | 49–50 |

**Five things that matter most**

1. **Check what they know on slide 3.** We aren't sure what they have seen. If faces look blank, slow down there and use 2.3.
2. **Predict, then reveal.** Every demo starts with a vote or a number on paper.
3. **Keep the cliffhanger:** vote on slide 20 before the break, reveal it live on slide 34.
4. **Live-code from the notebook** with the four planned mistakes (3.2).
5. **Protect the task time:** slide 40 by 2:23. Kobe's grader feeds raw coordinates (fold the scaling into `fc1`); Inversion needs Adam lr ≈ 0.1, not 1e-3.

**Task files.** Statements, hints and traps: section 5. Students get `notebooks/02_kobe_starter.ipynb` with `data/kobe/data_train.csv`, and `notebooks/03_inversion_starter.ipynb` with the task's `model.pt` and `data.csv` (practice replica: `data/inversion_practice/`). Coach only: `solutions/` (two notebooks and finished submissions).

---

**How this guide fits.** `SCRIPT.md` says what to say on each slide; this guide explains why it is true, what students get wrong and how to answer. "Notebook" numbers are what `01_live_coding.ipynb` prints. Slides often show three-seed averages, so the third digit can differ (log loss 0.662 on slides, 0.665 in the notebook); the order and the gaps are what matter.

## 1. Before the session

### 1.1 Setup checklist

- [ ] Projector as an **extended display**, not mirrored. Open `lecture.html` in Chrome or Edge (one file, works offline), drag it to the projector, press **F**.
- [ ] Press **P** and drag the presenter window to the laptop (allow pop-ups if nothing opens). One screen only: **N** shows the notes on the main screen, where students see them too.
- [ ] **T** for the light theme in a lit room. Other keys: **B** black screen, **O** slide map, **D** draw, **W** whiteboard, **?** all keys. The pace clock starts when you leave the title slide.
- [ ] Open the live notebook in Jupyter or Colab with `data/kobe/data_train.csv` (Colab: upload it and set `DATA_DIR = "."`). Run it once (about a minute) and check your numbers against the saved outputs. Big font, light theme, notifications off.
- [ ] Paper and pens, a board, a phone timer as backup. Task files ready. Decide the Kobe rulings (5.1); students will ask.

### 1.2 What to print

**The vocabulary card, one per student**, handed out at the start. It costs nothing and rescues students who haven't met these words.

> - **Parameter**: a number the model learns (a weight or a bias). The 2-8-8-1 Kobe network has 105.
> - **Hyper-parameter**: a number *you* choose: learning rate, batch size, width, epochs, seed.
> - **Forward pass**: computing the output from the input, layer by layer.
> - **Logit**: the raw score before the sigmoid. 0 means 50%; positive means "more likely yes".
> - **Loss**: one number saying how wrong the predictions are. Training makes it smaller.
> - **Gradient**: for each parameter, which way (and how strongly) the loss changes if you nudge it.
> - **Backward pass**: `loss.backward()` computes the gradient for every parameter at once.
> - **Optimizer**: the rule that turns gradients into small changes (SGD, Adam).
> - **Batch**: the examples behind one update (say 64 shots). **Step**: one update. **Epoch**: one pass over all the training data.

Also print the two task statements (section 5) for students and section 6 for your desk.

### 1.3 A 15-minute rehearsal

| Minutes | Do this |
|---|---|
| 0–3 | Open the deck, press P, check both windows move together. |
| 3–8 | Run each live demo once (slides 5, 15–16, 24, 26, 30, 37, 46). |
| 8–13 | Run the notebook's four planned mistakes (3.2). |
| 13–15 | Say aloud without notes: what a loss is; Adam in one sentence; why no sigmoid before `BCEWithLogitsLoss`. |

---

## 2. The plan

**Checkpoints:** break slide (21) at 1:08; end of live coding (slide 35) at 2:08; slide 40 at 2:23. More than 5 minutes behind at a checkpoint: start cutting.

**Never cut:** slide 3 (three ideas), the cliffhanger vote (20) and reveal (34), the five beats (28), notebook mistakes 1–3, the loss-curve doctor (39), "Predict the best possible score" (42), the folding hint (43), "Plan before typing" (48).

### 2.1 If late, cut in this order

1. Slide 23 (the second True-or-bluff slide).
2. Slide 16: say "training places the hinges for us, roughly".
3. Slide 30: the notebook's first loss of 2.36 makes the point.
4. Notebook mistake 4: one sentence; it returns in Inversion.
5. Slide 37: go straight to the cures.
6. Slide 48: plan for Kobe only.

### 2.2 If early, add (from `lecture-full.html`)

Open it in a second tab, press O, click the slide. To make a slide permanent, add its id to `src/LEAN.json` and run `python3 tools/build.py`.

- **"Bug hunt: five planted bugs"** after slide 39: pairs, 4 minutes, on paper (answers in its notes). The best addition.
- **"Exit ticket"** before slide 50 (answers are on the slide).
- "Invent first: XOR with two ReLUs", "Universal approximation theorem", "Predict: Adam's first step".
- Notebook Parts 9 (optimizers on Kobe), 10 (overfitting) and 11 (bridge to Inversion).

### 2.3 If they haven't seen it

Don't assume backprop, logistic regression or calculus. Some speaker notes say "you already know logistic regression"; if they don't, use one sentence from this table and move on. Formulas in the notes are for you; say the sentence instead.

| If they haven't seen… | Explain it as… |
|---|---|
| vectors and matrices | A vector is a list of numbers (a shot is x, y); a matrix is a table of numbers, and multiplying by it computes many weighted sums at once. |
| logistic regression | A model that adds up weighted inputs and squashes the total into a chance between 0 and 1, so it splits yes from no with one straight line. |
| the sigmoid | A squashing curve that turns any score into a chance between 0 and 1; a score of 0 gives 50%. |
| a gradient | For every knob: if I turn it up a little, does the loss go up or down, and how fast? |
| gradient descent | Roll downhill: measure the slope, take a small step down, repeat thousands of times. |
| backpropagation | The bookkeeping that finds every knob's slope in one backward sweep; in PyTorch it is one line, `loss.backward()`. |
| the log in log loss | We pay −log of the chance we gave to what happened: 90% costs 0.1, 50% costs 0.69, 1% costs 4.6. |
| a validation split | Homework and a mock exam: learn from one part, check honestly on shots the model never saw. |
| overfitting | Memorising last year's exam answers: perfect on that paper, bad on a new one. |

---

## 3. How to teach

### 3.1 The moves

**Predict, then reveal.** Show the setup ("don't answer yet"), give 30 seconds of silence, then everyone commits at once (paper, hands, or fingers for A/B/C/D). If the vote is split (roughly 30–70% right), give 60 seconds with a neighbour and vote again. Reveal, then ask a student "why?" before you explain. Over 80% right: reveal and move on. Name the misconception, never the student: "Many strong people predict A. Here is why A is tempting."

**Energy**

- Say at the start: "This will feel harder than a lecture. That is the learning."
- Never talk more than about 6 minutes without students doing something; shorter in the second half.
- Cold-call with wait time: ask, wait 3–5 seconds, then name a student.
- Walk around during pair work. Let them struggle two minutes before you help. Start the break on time.

### 3.2 Live coding and the four planned mistakes

Run the notebook cell by cell (retype the Part 5 loop if you feel confident). Say each line aloud, ask "What will this print?" before *every* run, read the output aloud. If something breaks, debug aloud for a minute, then use the saved outputs.

Slide 29 lists notebook Parts 3–8 in order. Only mistakes 1 and 3 have slides in `lecture.html` (30 and 34); show 2 and 4 in the notebook.

| # | Mistake (notebook part) | Ask first | What the notebook prints | The lesson |
|---|---|---|---|---|
| 1 | Raw coordinates (Part 4) | "What will the first loss be?" (fresh network: ≈ 0.69) | **2.36**; after scaling **0.69** | Scale with the *training* mean and std. Checking the first loss catches it. |
| 2 | Delete `opt.zero_grad()` (Part 6) | Crash, same, or worse? | No error. "Made" for every shot: **about 44%**, worse than "always miss" (56% on this split) | Gradients pile up (2, 4, 6) unless cleared. |
| 3 | `torch.sigmoid` at the end with `BCEWithLogitsLoss` (Part 7, the cliffhanger) | Re-take the slide-20 vote | Printed loss **≈ 0.68**, accuracy **≈ 61%**: looks normal. But 76% of outputs are below 1% and the true log loss is **≈ 4.5** (correct model 0.665) | A bug can keep the accuracy and wreck the probabilities. |
| 4 | Labels (N,) instead of (N, 1) (Part 8) | "Will this run?" | `BCEWithLogitsLoss` errors (read it aloud); `MSELoss` only warns and gives 1.33 for three *perfect* predictions | Print shapes. Returns in Inversion. |

### 3.3 When you can't answer

Check section 6. Otherwise: "Good question. I don't know for sure, and I won't guess." If a one-minute experiment settles it, make it a prediction. Off-topic questions (transformers, GPUs) go in a "parking lot" corner of the board for the end. If a student was right and you were wrong, say so.

### 3.4 Things not to say

- "Neural networks work like the brain" (loosely inspired at most); "Minsky and Papert proved networks can't do XOR" (only without a hidden layer).
- "Adam always wins", "training finds the global minimum", "networks can learn anything".
- "The Kobe inputs are normalised" (raw tenths of a foot); "this was APOAI 2025" (China's NOAI 2024 problem 1).
- Jokes about Kobe's death (January 2020, helicopter crash). Mention it respectfully if it comes up, or not at all.

---

## 4. The content, explained for you

Each topic: the idea in plain words, key numbers, what students get wrong, what they ask. Slide numbers refer to `lecture.html`.

### 4.1 Why straight lines fail (slides 5–7)

**Say.** A model that only adds up weighted inputs, like logistic regression, splits yes from no with one straight line. If no line separates the classes (a circle inside a ring, a spiral), more training can't help: the model contains only lines. Kobe's chance depends mostly on the distance from the rim, so lines of equal chance are arcs. Fix 1: invent a feature (distance squared lifts the circle into a bowl that one flat cut separates). Fix 2: let the model invent its own features. That is a hidden layer.

**Numbers (notebook).** Validation log loss: constant guess 0.686, logistic regression 0.673 (58.8%), 2-8-8-1 network 0.665 (60.4%). The best possible straight line on the task file: 58.6%.

**Watch for.** "Train it longer and it will bend." It can't.

**They ask.** *"Why not just add x² + y²?"* Perfect for a circle; for a court or a spiral you'd have to guess. And the Kobe rules forbid hand-made features.

### 4.2 Neurons, layers and shapes (slides 8–12)

**Say.** A neuron weighs its inputs, adds a bias, then bends the result with an activation; its zero line cuts the court in two. A hidden layer is several neurons side by side, each drawing its own line; the next layer combines their reports, like line-drawers and a manager. Depth = number of layers, width = neurons per layer. For students who know matrices: a layer computes activation(*W***x** + **b**) for the whole batch at once.

**Shapes.** Data is (batch, features), say (32, 2); `nn.Linear(2, 8)` makes it (32, 8). PyTorch stores the weight as (out, in) = (8, 2), one row per neuron. Each layer has in × out weights plus out biases. Print `.shape` constantly: wrong shapes are the most common beginner error.

**Numbers.** 2-8-8-1 = 24 + 72 + 9 = **105** parameters, the largest legal Kobe network. In code: `sum(p.numel() for p in model.parameters())`.

**Watch for.** Expecting (in, out); forgetting biases; thinking the batch size changes the count.

**They ask.** *"Two hidden layers but three linear layers?"* Each hidden layer is linear plus activation; the third linear layer gives the output score.

### 4.3 Activations (slides 13–16)

**Say.** Without a bend between them, stacked linear layers collapse into one: ten of them can only draw what one can, a straight line. ReLU, max(0, *z*), is the default bend. Three ReLUs make a hat: ReLU(*x*) − 2·ReLU(*x* − 1) + ReLU(*x* − 2) rises from 0 to 1 and back between *x* = 0 and 2. Add many scaled hats and you can follow any curve, like joining the dots. That is the "universal approximation theorem": one hidden layer, wide enough, can match any smooth curve over a region. It does **not** say how wide, that training will find the weights (slide 16 shows it often doesn't quite), or anything about noisy data or inputs outside the data.

**Which one.** ReLU in hidden layers; LeakyReLU or ELU if units die; tanh is fine in small nets; the sigmoid only to turn a final score into a probability. **Output rule:** no activation at the end of the model. Output the raw score and let the loss apply the sigmoid. (The Kobe submission is the exception; see 5.1.)

**Draw.** Three ramps adding up to a hat; many hats adding up to a wiggly curve.

**Numbers.** On Kobe, ReLU and tanh tie (0.662 vs 0.664 in our runs). Width matters more: the official 2-1-1-1 baseline passes one number per layer, so it can only draw a straight line (57.7%). An 80 times bigger network gains nothing (0.660 vs 0.662): the limit is basketball's randomness.

**Watch for.** Over-rating the choice of activation; "2-8-8-1 can fit Kobe perfectly" (the labels are coin flips).

**They ask.** *"What is a dead ReLU?"* A unit whose line misses the whole data cloud outputs 0 everywhere, gets no gradient and never recovers. Lower the lr, scale the inputs, change the seed or use LeakyReLU.

### 4.4 Losses and logits (slides 17–20)

**Say.** Match the loss to what you predict. A number: mean squared error (MSE), the average squared miss; Inversion is scored with it. Yes/no: log loss (binary cross-entropy), a surprise meter: confident and wrong is a huge surprise, like "90% rain" on a dry day. One of K classes: cross-entropy. The **logit** is the raw score before the sigmoid: 0 means 50%, +2 about 88%, −2 about 12%. The model outputs logits; the loss takes logits.

| Task | Model outputs | Loss | Labels |
|---|---|---|---|
| a number | 1 value | `nn.MSELoss()` | float, same shape as the output |
| yes / no | 1 logit | `nn.BCEWithLogitsLoss()` (applies the sigmoid itself) | float 0/1, shape (N, 1) |
| one of K | K logits | `nn.CrossEntropyLoss()` (applies softmax itself) | integer class, shape (N,) |

Accuracy can't be the loss: it is a staircase with no slope to follow.

**Numbers.** Cost of a made shot: predicted 90% → 0.1, 50% → 0.69, 10% → 2.3. A fresh network's first loss is about **0.69** (10 classes: 2.30); far from that means a bug. Kobe's best constant guess (44.7% for every shot) scores **0.686**: the number to beat.

**The cliffhanger, explained.** With a sigmoid in the model *and* `BCEWithLogitsLoss`, the output is squashed twice, so the loss only ever sees chances between 50% and 73%. The printed loss therefore looks normal (≈ 0.68). To push it down on misses, the network drives its own outputs to extremes: 76% end below 1%. Accuracy survives (≈ 61%), but the true log loss is ≈ 4.5 (correct model 0.665). Fix: remove the sigmoid, or keep it and use `nn.BCELoss`. Cousin: a softmax in the model plus `CrossEntropyLoss`.

**Watch for.** Float labels for `CrossEntropyLoss`; labels of shape (N,) for `BCEWithLogitsLoss`.

**They ask.** *"Why the log?"* It punishes confident mistakes hard and rewards honest probabilities.

### 4.5 Gradient descent and the learning rate (slides 24–25)

**Say.** The gradient tells each weight which way is uphill; we step the other way. The learning rate is the step size and the most important knob. Slide 24: 0.02 crawls, 0.3 arrives in 7 steps, 0.9 zig-zags but arrives, 1.05 explodes. On paper (notebook Part 2): loss (*w* − 3)², start at 0, lr 0.1: slope −6, so *w* becomes 0.6.

**Epoch, batch, step.** Epoch = one pass over the training data; batch = the examples behind one update; step = one update. Steps per epoch = shots ÷ batch size, rounded up. Slide 25 uses 20,558 shots (322 steps of 64); the notebook uses 20,000 (313 steps, 9,390 in 30 epochs). Someone will notice. **Count steps, not epochs:** 30 full-batch epochs are only 30 steps and end at 0.688, no better than a constant; batches of 64 reach 0.662 (slide 25).

**Narrow valleys.** If the loss is much steeper one way than another, gradient descent zig-zags across and crawls along; unscaled inputs cause this (4.7).

**Watch for.** Epoch, batch and step used as synonyms; "a bigger lr trains faster" (only up to the edge).

### 4.6 Optimizers (slides 26–27)

**One sentence each.** **SGD**: step = lr × gradient. **Momentum**: a heavy ball that keeps its speed, so zig-zags cancel. **Adam**: momentum plus its own step size per weight; in practice **each weight moves about lr per step, whatever its gradient** (notebook Part 2: gradients of 1000, 1 and 0.001 all move 0.001 at lr 1e-3). **AdamW**: Adam with weight decay done properly.

**Recommend.** Start with `Adam(model.parameters(), lr=1e-3)`, try 3e-4, 3e-3 and 1e-2, keep the best on validation. For *inputs* (Inversion), use lr ≈ 0.1. Adam is a default, not magic: on Kobe a tuned SGD did as well.

**Numbers (notebook Part 9, 30 epochs, validation)**

| Setting | Log loss | Accuracy |
|---|---|---|
| constant guess | 0.686 | 56.1% |
| SGD lr 1e-3 | 0.681 | 56.1% (barely moved: "always miss") |
| SGD lr 0.1 | 0.663 | 61.0% |
| Adam lr 1e-3 | 0.666 | 60.4% |
| Adam lr 1.0 | 0.689 | 56.1% (jumps, ends at "always miss") |

**Watch for.** "Adam needs no tuning"; using Adam's 1e-3 with plain SGD.

### 4.7 Input scaling (slide 30, notebook Part 4)

**Say.** Standardise each input: subtract the training mean, divide by the training standard deviation (std), and apply the same two numbers to validation, test and grader data. Raw numbers in the hundreds make a fresh network confidently wrong from step 0, and mixed scales make a narrow valley where no single lr suits every weight.

**Numbers.** Kobe's coordinates are raw tenths of a foot: `loc_x` from −250 to 248 (std ≈ 110), `loc_y` from −44 to 791 (std ≈ 88). The statement's "already normalized" is false. First loss (notebook): raw **2.36**, scaled **0.69**. Plain SGD at lr 0.1 on raw inputs collapses to "always miss"; scaled, it reaches about 60% (slide 30). Adam copes with raw inputs because its per-weight steps hide the scale. Scale anyway.

**The Kobe twist.** The grader feeds raw coordinates, so fold the scaling into `fc1`: divide each weight column by its input's std, then subtract (new weights × means) from the bias. It is exact (outputs agree to about 1e-6) and legal, because a scaling step followed by a linear layer is still one linear layer.

**Watch for.** Mean and std computed on all the data or on validation.

**They ask.** *"Why only training statistics?"* Validation must imitate unseen data, and the grader's data brings no statistics of its own.

### 4.8 The training loop (slides 28–35)

The code is in notebook Part 5 and on slides 31–32. What to stress:

- **The five beats, aloud every time:** zero_grad, forward, loss, backward, step.
- `zero_grad()`: gradients add up unless cleared (three `backward()` calls give 2, 4, 6).
- `backward()` only computes gradients; only `step()` moves weights. Create the optimizer once, outside the loop.
- Evaluate under `model.eval()` and `torch.no_grad()` (Q&A 9).
- `logit > 0` means "chance above 50%".

**Loud bugs.** Read the last line of the error: it usually names the fix.

| Message (shortened) | Cause | Fix |
|---|---|---|
| `mat1 and mat2 shapes cannot be multiplied (64x3 and 2x8)` | 3 input columns, layer built for 2 | match `in_features` |
| `mat1 and mat2 must have the same dtype, but got Double and Float` | numpy/pandas give float64 | `X.float()` |
| `Target size (torch.Size([64])) must be the same as input size (torch.Size([64, 1]))` | labels (N,) with `BCEWithLogitsLoss` | `y.unsqueeze(1)` |
| `result type Float can't be cast to the desired output type Long` | integer labels into BCE | `y.float()` |
| `Can't call numpy() on Tensor that requires grad` | converting a tracked tensor | `.detach().numpy()` |

**Silent bugs (no error):** no `zero_grad`; a sigmoid before `BCEWithLogitsLoss`; `MSELoss` with (N, 1) against (N,); the optimizer created inside the loop; validation scaled with its own statistics; "validation" measured on the training set.

**They ask.** *"Why does PyTorch add gradients up?"* So several small batches can be added before one step.

### 4.9 Generalisation and debugging (slides 36–39)

**Say.** Training data is homework (it fits the weights), validation a mock exam (choose settings and when to stop), the test set the real exam (in a competition, the hidden board). Tuning to the live board overfits it. Underfitting: both losses high and close. Overfitting: training keeps falling while validation turns up.

**Cures.** More data; a smaller model; early stopping with `copy.deepcopy(model.state_dict())` (a plain `state_dict()` keeps changing and saves the *last* weights); weight decay; dropout. Kobe's 105 parameters can't memorise 20,000 noisy shots, so these hardly matter there. Keep the best checkpoint anyway.

**Numbers (notebook Part 10).** A 2-256-256-1 network (66,817 parameters) on only 500 shots, 2,000 steps: training loss 0.387, validation 1.35. Its best weights came at step 10 (validation 0.678). The slides show 1.23 (three seeds).

**Debugging.** Slide 39 (the loss-curve doctor) is your desk reference during the tasks. Karpathy's checks: the first loss is ≈ 0.69; the model beats "always miss"; it can memorise one tiny batch (if not, there is a bug); look at the predictions; change one thing at a time. Always print the fraction predicted "made".

**Watch for.** "Training loss below validation loss means overfitting." A small, stable gap is normal.

**They ask.** *"Kobe is stuck at 61%. Underfitting?"* No, that is the ceiling (5.1).

### 4.10 Changing inputs instead of weights (slides 45–47)

**Say.** Backprop computes the gradient for anything marked `requires_grad=True`. Training: data fixed, weights move. Inversion: weights frozen, one input moves. Same loop. Plain picture: a frozen lock, and we turn the key until it opens.

**The toys (slide 46).** The "model" is *a* + 2*b* + *c*² = 4.65 with *a* = 1. Find *b* (0.7): lr 0.125 lands in one step, 0.25 bounces forever, 0.3 blows up. Find *c*: *c*² = 2.25, so ±1.5. Start at +0.1 → +1.5; at −0.1 → −1.5; at exactly 0 it never moves (the top of a hill, slope 0). The wrong sign fits perfectly and is still wrong: when several inputs give the same output, you need a prior guess to choose.

**The lr trap.** Adam moves each value about lr per step, so lr 1e-3 is far too slow for values of size 1–3. Notebook Part 11, 300 steps: lr 1e-3 leaves an MSE of 0.57, lr 0.1 recovers the answer exactly.

**Look at all of it.** One unknown per row: evaluate 2,001 values for every row at once under `torch.no_grad()`. Every crossing of *y* is a solution; gradient descent finds only the one downhill from its start.

**Watch for.** Changing the weights (forbidden) or all ten inputs; trusting a perfect fit.

**They ask.** *"Can different inputs give the same output?"* Yes: 331 of 1000 rows on the practice replica.

---

## 5. The two afternoon tasks

### 5.1 Task 1: Kobe shot prediction

**Origin.** China's NOAI 2024, round 2, problem 1 (Bohrium labels a reuse "APOAI2025 Mock"); the rows are Kaggle's labelled Kobe Bryant shots.

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

The largest legal network is 2-8-8-1. The official baseline names the class `MyModel` with a no-argument constructor; keep that.

**Rulings to announce** (our recommendations)

- Distance or angle computed inside `forward()`: illegal (only linear layers and activations), and no measurable gain.
- `shot_distance` or `minutes_remaining` as inputs: illegal; the grader passes 2 columns.
- Scaling inside `forward()`: grey; fold it into `fc1` instead.
- A final `nn.Sigmoid`: keep it (see the traps).

**Why the scores are so low** (tell them after they've tried). Each shot is a coin flip whose chance depends on position; even the 4,200 shots right at the rim went in only 62.5% of the time. Only within about 3 ft of the rim do more than half go in, so the best possible answer is roughly "made if within 3 ft".

**Expected scores** (validation accuracy on the task file)

| Model | Accuracy |
|---|---|
| "always miss" | 55.3% |
| official 2-1-1-1 baseline (a straight line) | 57.7% |
| best possible straight line | 58.6% |
| "made if within ~3 ft" | 60.7% |
| good legal 2-8-8-1 (the ceiling) | 60.5–61% |

On the starter's split expect about 60.2%. The best honest leaderboard scores were 0.621 (A) and 0.625 (B); each board wobbles by ±0.01.

**Reference approach** (`solutions/02_kobe_solution.ipynb`)

1. Write `submission_model.py` first (the starter's `%%writefile` cell): `MyModel` with `fc1`, `fc2`, `fc3` (2→8→8→1), activations between them, a final `nn.Sigmoid()`, and a `logits()` method that stops before the sigmoid. Import that class to train.
2. Split 80/20; standardise with training statistics.
3. `BCEWithLogitsLoss` on `model.logits(x)`, Adam lr 1e-2, full batch, about 2,000 steps.
4. Check: validation ≈ 0.60–0.61, fraction predicted "made" about 0.2–0.35.
5. Fold the scaling into `fc1`, save the `state_dict`, zip both files.
6. Reload the zip in a fresh folder like the grader, run on **raw** validation coordinates, confirm the accuracy and the rule checks.

**Traps**

- **Raw coordinates from the grader.** Forget to fold and the submitted network sees inputs 100 times too large.
- **`nn.Sequential` scores 0.** Write `self.fc1 = …` explicitly.
- **Class/weights mismatch.** Train the exact class you submit, and reload the zip before uploading.
- **The sigmoid.** The grader most likely thresholds the output at 0.5, so `forward()` ends with `nn.Sigmoid()`. Then `BCEWithLogitsLoss` must get `model.logits(x)`, not `model(x)` (that is the cliffhanger bug), or train `model(x)` with `nn.BCELoss`.
- **The best checkpoint** must be `copy.deepcopy(model.state_dict())`.
- **A constant predictor.** Too small an lr, too few steps or a bad seed gives "always miss" (55.3%) or "always made" (44.7%). Print the fraction predicted "made".
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

**Launch.** Hand out the statement, `03_inversion_starter.ipynb` and the data. The starter runs as given and submits all zeros (score ≈ 0). It already finds the zeroed column and wraps the model as `predict(z)`; the TODOs are the optimizer loop on the missing column, a residual check, a plot of one row, and choosing between several solutions. Say only: "Same backprop as this morning; the input is the parameter." Students may use the other columns' statistics; only the model's weights are off limits.

**Practice vs real.** `data/inversion_practice/` is our replica, with `true_column.csv` so the starter can score itself. The real files have no truth: students see only the per-row residual |*f*(*z*) − *y*| and how many solutions each row has.

**The score is linear in MSE**, so the top end is squeezed: MSE 0.5 scores 49, 0.1 scores 90, 0.0236 scores 98, 0.0145 scores 99.

**Expected scores** (on the practice replica: 10 inputs, a 10-64-64-1 network, the same 0.968 baseline; a guide only)

| Method | MSE | Score |
|---|---|---|
| leave zeros | 0.967 | ≈ 0 |
| Adam lr 1e-3, 500 steps, from 0 | 0.433 | 55 |
| **Adam lr 0.1, 500 steps, from 0** (safe first submission) | 0.0236 | **≈ 98** |
| all solutions, pick the one closest to 0 | 0.021 | 98.3 |
| **all solutions, weighted average** | 0.0145 | **≈ 99** |

Adam from 0 works well because it finds the solution closest to 0, a built-in prior guess.

**Reference approaches** (`solutions/03_inversion_solution.ipynb`)

1. *Safe, under a second.* Freeze the model; `z = torch.zeros(N, requires_grad=True)` in the missing column; loss `((model(...)[:, 0] - y)**2).sum()`; `Adam([z], lr=0.1)` for 500 steps.
2. *The improvement.* Evaluate 2,001 values in [−5, 5] for every row. Each sign change of *f* − *y* brackets a solution; polish it with a few Newton steps. Where a row has several, weight each by how plausible it is and submit the **weighted average**: it minimises the expected squared error, while picking one is a gamble.

**Traps**

- **`model.eval()`.** A model saved in training mode loads with dropout on; two calls on the same input then differ.
- **Freeze the parameters:** `for p in model.parameters(): p.requires_grad_(False)`. Otherwise, with TorchScript, the grid evaluation gets slow.
- **float32.** pandas gives float64, which causes the dtype error.
- **(N, 1) vs (N,).** The model returns (N, 1), *y* is (N,). `model(X) - y` silently becomes an N × N table mixing all rows: MSE 2.44, *worse than zeros*. Use `[:, 0]` and assert shapes.
- **Adam lr 1e-3 is far too slow for inputs.** Use about 0.1. lr 1.0 overshoots into wrong solutions (MSE 1.39).
- **SGD with `.mean()` hardly moves** (every row's gradient is divided by 1000; MSE 0.709). Use `.sum()` or Adam.
- **Optimise only the missing column.** Moving all 10 inputs "explains" *y* with wrong values (MSE 0.504).
- **Rows with two solutions.** 331 of 1000 replica rows have them, and a few wrong picks cause most of the remaining error. Residuals can't see them (the fit is perfect); only a grid does. "Random restarts, keep the smallest residual" is a coin flip and scores *worse than zeros*.
- **`torch.set_num_threads(1)`** if torch is mysteriously slow on a busy shared CPU.
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
3. **Why ReLU, not sigmoid, in hidden layers?** The sigmoid's slope is at most 0.25 and almost 0 when saturated, so gradients shrink layer by layer. ReLU's slope is 1 when it is on.
4. **You said no sigmoid in the model. Why does the Kobe submission have one?** The grader wants probabilities. Train through `model.logits(x)` with `BCEWithLogitsLoss`, or train `model(x)` with `nn.BCELoss`. The bug is a sigmoid *plus* `BCEWithLogitsLoss`.
5. **Why batches, not all the data at once?** Many more updates per epoch and less memory. 30 full-batch epochs on Kobe learned nothing.
6. **How many layers and units?** Start small, grow while validation improves, try several seeds. For Kobe: 2-8-8-1, the legal maximum.
7. **Loss vs metric?** Train on a smooth loss (log loss); report the competition's metric. Accuracy has no useful slope.
8. **Why check the loss before training?** The cheapest bug detector: about 0.69 for yes/no. On Kobe, 2.36 means unscaled inputs.
9. **`model.eval()` vs `torch.no_grad()`?** `eval()` changes how dropout and batch-norm behave; `no_grad()` stops gradient recording. Use both to evaluate.
10. **Why different results every run?** Random starting weights and shuffling. `torch.manual_seed(0)` reproduces a run; report several seeds.
11. **Why not start all the weights at zero?** Every hidden unit would compute the same thing, get the same gradient and stay a copy forever. PyTorch's random start is fine.
12. **Do more epochs always help?** No, validation can get worse. On Kobe, 100 epochs gained almost nothing over 30.
13. **Dropout and weight decay: why not on Kobe?** Both fight memorising, and 105 parameters can't memorise 20,000 noisy shots. With Adam, use AdamW for weight decay.
14. **Why is Kobe accuracy only about 61%?** Each shot is a coin flip; even at the rim he scored about 63%. Extra Kaggle columns (shot type) reach about 68%, but aren't allowed.
15. **0.607 vs 0.611 on the board: which is better?** Probably neither: board noise is ±0.01. Compare several-seed averages on your own validation split.
16. **Inversion: sum or mean in the loss?** Sum. Rows are independent, and with SGD the mean divides each row's gradient by 1000. Adam doesn't care.
17. **Inversion: two values fit perfectly. Which one?** The data can't tell them apart. Use a prior guess, or submit their weighted average to minimise the expected squared error.
18. **CNNs, transformers, GPUs?** Parking lot. Same loop, losses and optimizers; only the model box changes.

---

## 7. After the session

If you used the exit ticket, tally right and wrong per question: above 80%, done; 50–80%, one minute tomorrow; below 50%, re-teach with a new prediction question.

**Tomorrow**

- **Three warm-up questions** before anything new: "Why must there be a bend between layers?", "What should the first yes/no loss print?", "How far does Adam move a weight per step?"
- **Kobe debrief.** The ladder 55.3% → 58.6% (best line) → 60.7% (rim rule) → ≈ 61% (network). Show the folding step and the sigmoid/`BCELoss` pairing. Ask whose zip failed to reload, and why.
- **Inversion debrief.** Plot one row with two solutions. Explain why Adam from 0 already scores about 98, and why the last points come from choosing between solutions, not from polishing residuals.
- **The muddiest points** and your parking lot.
