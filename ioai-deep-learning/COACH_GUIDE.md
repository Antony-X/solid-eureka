# Coach's guide: "Neural networks, hands-on"

This guide teaches you the material behind the three-hour lecture and the two afternoon tasks. It sits next to three other files:

- `lecture.html`, the slide deck. Every slide has speaker notes.
- `SCRIPT.md`, the same speaker notes exported slide by slide. Read it to know *what to say on each slide*.
- This file. Read it to understand *why* each slide is true, what students will get wrong, and how to answer them.

How to use it: tonight, read section 4 (the content) and section 5 (the tasks). Tomorrow morning, work through the checklist in section 1. Print section 6 (Q&A) and keep it on the desk.

Numbers marked "our run" come from our own experiments on the real data. Students' numbers will differ a little because of different splits and seeds. What matters is the *ordering*: which setting is better and by roughly how much.

---

## 1. Before the session

### 1.1 Setup checklist

**Displays**
- [ ] Connect the laptop to the projector as an **extended display**, not mirrored. The slides go on the projector, your notes stay on the laptop.
- [ ] Open `lecture.html` in **Chrome or Edge**. It is one self-contained file and needs no internet.
- [ ] Drag the window to the projector and press **F** (full screen).
- [ ] Press **P**. A presenter window opens with the notes, a pace clock and the title of the next slide. Drag it to the laptop screen. The two windows stay in sync: pressing → in either one moves both. If nothing opens, the browser blocked the pop-up. Allow pop-ups for this file and press P again.
- [ ] Only one display? Press **N** to show the notes on the main screen. Students will see them too, so use N only for a quick glance during pair work, and keep a printed `SCRIPT.md` instead.
- [ ] Press **T** until the theme is **light** if the room is lit. Dark slides lose most of their contrast when room light washes out the projector's black. Use dark only in a dimmed room.

**Keys you will use**

| Key | What it does |
|---|---|
| → / space / PageDown (or a clicker) | next build step or slide |
| ← | back |
| **B** | black screen. Use it when you want eyes on you or the board. |
| **O** | slide map. Click a slide to jump there. |
| 12 Enter | jump to slide 12 |
| D / E / W | draw on the slide / erase / blank whiteboard |
| L | laser pointer |
| C / R | show the clock / reset it |
| ? | list of all keys |

The pace clock starts when you leave the title slide. The presenter window shows the planned clock for the current section and says "behind plan" when you are late. Press R if you started the clock too early.

**Live coding**
- [ ] Open `notebooks/01_live_coding.ipynb` in Jupyter or Colab, with `data/kobe/data_train.csv` next to it. In Colab, upload the CSV first.
- [ ] Run the import and data-loading cells before class.
- [ ] Make the font big (Ctrl/Cmd +), use a light theme, and turn notifications off.
- [ ] Time the training cell. It should finish in 15 seconds or less (ours: about 8 s for 30 epochs of a 2-8-8-1 net on one CPU thread). If the machine is slow or shared, add `torch.set_num_threads(1)`.
- [ ] Open the finished notebook and `solutions/` on a second device in case the live code breaks.

**Room**
- [ ] Paper and pens for every student. Every prediction and quiz answer goes on paper *before* the reveal.
- [ ] A visible timer. The activity slides have built-in timers and the break slide starts its own; keep a phone timer as a backup.
- [ ] A board and markers for the board pictures in section 4.
- [ ] Task files ready to hand out (section 5): Kobe `data_train.csv` plus its starter notebook, and Inversion `model.pt` and `data.csv` plus its starter notebook (`notebooks/02` and `03`).
- [ ] Decide the Kobe rule rulings before class (section 5.1, "Rulings"). Students will ask.

### 1.2 What to print

**The vocabulary card (one per student).** Hand it out during the warm-up (around 0:08). Learning the names before the code is one of the cheapest wins available (Mayer's "pre-training" principle).

> **Parameter**: a number the model learns (a weight or a bias). The 2-8-8-1 Kobe net has 105.
> **Hyper-parameter**: a number *you* choose before training: learning rate, batch size, width, number of epochs, seed.
> **Forward pass**: computing the output from the input, layer by layer.
> **Logit**: the raw score *z* before the sigmoid. *p* = σ(*z*). *z* = 0 means 50%.
> **Loss**: one number saying how wrong the predictions are. Training makes it smaller.
> **Backward pass**: `loss.backward()` computes the gradient of the loss for every parameter.
> **Optimizer**: the rule that turns gradients into parameter updates (SGD, Adam).
> **Batch**: the group of examples used for one update (for example 64 shots).
> **Step**: one parameter update, which uses one batch.
> **Epoch**: one full pass over the training data, which is ⌈N / B⌉ steps.

**Optional printouts**
- The bug-hunt code (section 8 of the deck). It is on the slide, but pairs work faster on paper.
- The two task statements (section 5 of this guide).
- For yourself: the plan table (section 2) and the Q&A sheet (section 6).

### 1.3 A 15-minute rehearsal

| Minutes | Do this |
|---|---|
| 0–3 | Open the deck, press P, check that both windows move together, set the light theme, press O and look at the whole map once. |
| 3–8 | Run each live demo once so nothing surprises you: the playground in section 1, the hinge builder in section 3, the learning-rate ball and the optimizer race in section 6, and the Kobe court network ("Train") in section 9. |
| 8–13 | Run the live-coding notebook top to bottom, including the three planned mistakes (section 3.4). Write down the numbers *you* get, because they may differ slightly from the slides. |
| 13–15 | Say three things out loud, without notes: Adam in one sentence; why a sigmoid must not go before `BCEWithLogitsLoss`; what the universal approximation theorem does *not* say. If any comes out muddled, reread that part of section 4. |

---

## 2. The plan at a glance

The clock times come from `src/OUTLINE.md`.

| # | Section | Clock | Min | What students do | Number to remember |
|---|---|---|---|---|---|
| 0 | Opening | 0:00–0:10 | 10 | Warm-up recall Q1–Q3 on paper; predict Kobe's make % | 44.6% made, so "always miss" ≈ 55% |
| 1 | Why neural networks? | 0:10–0:22 | 12 | Predict "one straight line?"; A1 pair sketch of Kobe's zones | log loss: constant 0.687, logistic 0.675 |
| 2 | From one neuron to an MLP | 0:22–0:40 | 18 | E1 forward pass on paper; invent XOR weights in pairs; predict `nn.Linear` shapes; count parameters | 2-8-8-1 = 105 parameters |
| 3 | Activations: any function | 0:40–1:02 | 22 | P1 vote (10 linear layers vs 1); build a hat from ReLUs; mini-quiz | σ′ ≤ 0.25; ReLU vs tanh on Kobe 0.662 vs 0.664 |
| 4 | Loss: how wrong are we? | 1:02–1:15 | 13 | Rank four losses (A5); predict the first loss; **cliffhanger vote, no reveal** | ln 2 = 0.693 at init |
| 5 | Break | 1:15–1:25 | 10 | True or Bluff statements on screen | |
| 6 | Gradient descent and optimizers | 1:25–1:47 | 22 | True-or-Bluff reveal and recall Q4–Q9; one GD step on paper; epoch arithmetic (A8); predict Adam's first step; predict the Kobe optimizer chart | Adam lr 1e-3: each weight moves ≈ 0.001 per step |
| 7 | The training loop, live | 1:47–2:15 | 28 | Predict before every run; three planned mistakes; cliffhanger reveal | raw inputs: loss at init 2.33; no `zero_grad`: 53%; double sigmoid: log loss 4.69 |
| 8 | Generalization and debugging | 2:15–2:30 | 15 | Predict P9 and P13; **bug hunt in pairs (4 min)** | 2-256-256-1 on 500 shots: train 0.37, val 1.23 |
| 9 | Olympiad playbook and the two tasks | 2:30–2:52 | 22 | Predict the Kobe score; two inversion toys; **plan the first three experiments (A9)** | Kobe ceiling ≈ 61%; Inversion 0.968 → 0.0045 |
| 10 | Wrap-up | 2:52–3:00 | 8 | Exit ticket Q10–Q15 | |

The break slide's reveal (six statements, about 3 minutes) happens *after* the break and eats into section 6. Keep it brisk.

**Checkpoints.** At 1:15 you should be on the break slide. At 2:15 you should be finishing the live coding. At 2:30 you should be starting the task section. If you are more than 5 minutes behind at any checkpoint, start cutting.

**Never cut:** the warm-up recall, the cliffhanger vote and its reveal, the live-coding five beats, the bug hunt, the planning activity (A9) and the exit ticket. These are where the learning happens.

**If you are late, cut in this order**
1. Section 3: the sigmoid-towers slide and the optional space-warping slide.
2. Section 6: the learning-rate schedules slide (one sentence instead: "for small tasks, constant lr plus early stopping is fine").
3. Section 8: the double-descent and grokking story.
4. Section 6: run P8/P10 as a reveal without a vote.
5. Section 9: Toy 1 (keep Toy 2, the two-roots one, because it is the key to the Inversion task).
6. Section 8: the bug gallery slide. Point students to section 4.13 of this guide instead.

**If you are early, add**
- E2, the backward pass by hand (the numbers are in the notes of the E1 slide and in section 4.2 below).
- E8, one Adam step by hand: g = 4, β₁ = 0.9, β₂ = 0.999, lr 0.001 gives m̂ = 4, v̂ = 16, step 0.001. Redo it with g = 0.04: still 0.001.
- Optimizer charades (A6): one partner describes how SGD, momentum and Adam walk down a narrow valley, the other names which is which.
- A live learning-rate sweep in the notebook (1e-4, 1e-3, 1e-2, 1e-1, 1) with a plot of the final loss.
- The Kobe "know your ceiling" exercise: compute the make rate by distance and find the only zone above 50%.

---

## 3. How to teach: the moves

### 3.1 Predict, then reveal

Students who only *watch* a demo understand it no better than students who never saw it. Students who predict first learn significantly more (Crouch et al. 2004). So every demo in the deck starts with a prediction. The procedure:

1. Show the setup. Say "Don't answer yet."
2. 30 seconds of silent thinking.
3. Public commitment: everyone writes on paper, then hands up for A/B/C/D or fingers 1–4. It must be public or recorded.
4. If the vote is split (roughly 30–70% right), give 60 seconds with a neighbour, then vote again.
5. Reveal.
6. Ask "Why?" and get a student to explain before you do.

If more than 80% are right on the first vote, reveal and move on. Never punish a wrong prediction. Say "Many strong people predict A. Here is why A is tempting…" and name the misconception, not the student.

### 3.2 Peer instruction

Use it on the hard concept questions: P1 (10 linear layers vs 1), the cliffhanger P4 (sigmoid plus `BCEWithLogitsLoss`), P9 (an 80× bigger net) and "does the UAT guarantee a perfect fit on Kobe?". Vote alone, discuss in pairs, vote again, then explain. Discussion helps even when nobody in the pair knew the answer at first (Smith et al. 2009).

### 3.3 Worked, then faded, then independent

Do one hand calculation fully on the board (E1, the forward pass). Do the next one half with students (E2, the backward pass, optional). Leave the next ones to them (XOR weights, the ReLU hat). These students are strong, so fade fast. Over-explaining to strong students can actually hurt them (the "expertise reversal effect"). "Invent first" tasks (XOR, the hat) suit them: let them struggle for two minutes before you show the answer.

### 3.4 Live coding

**Rules**
- The boilerplate (imports, data loading) is already run. Type the model and the loop yourself, slowly. Typing keeps you at the students' speed.
- Say every line out loud as you type it. Then point at the output and read it a second time.
- Ask "What will this print?" before *every* run, and take a show of hands.
- Stick to the rehearsed code. Improvised "neat tricks" are where demos die.
- If something breaks unexpectedly, debug it out loud. That is a lesson in itself. If it takes more than a minute, switch to the finished copy on the second device.

**The planned mistakes, in order**

| # | Mistake | Ask first | What happens (our run) | The lesson |
|---|---|---|---|---|
| 1 | Train on raw coordinates | "What will the first loss be?" (answer: ≈ 0.69) | Loss at init **2.33** instead of 0.69 | Standardise with the *training* mean and std. The loss-at-init check catches it before training. |
| 2 | Delete `opt.zero_grad()` | P5: crash, identical, or something else? | Trains, but val log loss **0.686** and accuracy **53.4%**, below "always miss" (55%) | Gradients add up by default: 2, then 4, then 6. |
| 3 | Add `nn.Sigmoid()` at the end, keep `BCEWithLogitsLoss` (the cliffhanger reveal) | Re-ask P4 from before the break | Printed losses look normal (train 0.74 → 0.66, val 0.683), accuracy a normal **61%**, but the true log loss of the outputs is **4.69** | A bug can leave accuracy unchanged and destroy the metric. Remove the Sigmoid. |
| 4 | Target shape (N,) instead of (N, 1) | "Will this run?" | `BCEWithLogitsLoss` raises an error (read it aloud). `MSELoss` only warns and silently computes the wrong thing. | Print shapes. This matters for the Inversion task. |

### 3.5 When you can't answer a question

- Say "Good question. I don't know for sure, and I don't want to guess." That is better than inventing an answer. Strong students notice invented answers.
- If a one-minute experiment can settle it, turn it into a prediction: "Let's predict, then try it in the notebook."
- If it is off-topic (transformers, CNNs, GPUs), write it in a "parking lot" corner of the board and answer it in the last minutes or tomorrow.
- Check section 6 of this guide first. Most likely questions are there.
- If a student turns out to be right and you were wrong, say so plainly. It models the right attitude.

### 3.6 Keeping the energy up for three hours

- Tell them at minute 2: "This will feel harder than a lecture. That is the learning happening." Students in active classes learn more but *feel* they learn less (Deslauriers et al. 2019). Judge the session by the exit tickets, not by how smooth it felt.
- Never talk for more than about 6 minutes without students doing something: a vote, a calculation, a pair discussion.
- Attention lapses come in shorter cycles as a lecture goes on, and demos and questions reset them (Bunce et al. 2010). So the second half has shorter segments and more pair work.
- Cold-call with wait time: ask, wait 3–5 seconds, then name a student. Use "phone a friend" if they are stuck.
- Press B (black screen) to pull attention to you or the board. Walk around during pair work and listen.
- One short story per section, always followed by "and the reason this matters for your code is…" (section 7).
- The break is sacred. Start it on time even mid-section.

---

## 4. The content, explained for you

Each topic has the same parts: what to say (in words you can repeat), the one picture to draw on the board, the key numbers, what students get wrong, and the questions they will ask.

### 4.1 Why linear models fail

**Say it like this.** Logistic regression computes *z* = **w**·**x** + *b* and *p* = σ(*z*). The decision boundary *p* = 0.5 is where *z* = 0, which is a straight line (a plane in more dimensions). If the two classes can't be separated by a line, logistic regression fails, however long you train it. A circle inside a ring, XOR, two spirals: all fail. Kobe's data fails too. His chance of scoring depends mainly on the *distance* from the rim, so the lines of equal chance are arcs around the basket, and a line can't draw an arc.

There are two fixes. Fix 1: invent a feature. Add *x*² + *y*² as a third input. The circle data lifts into a bowl, and a flat plane cuts the bowl in a circle. Fix 2: let the model learn the features. You don't know which feature a spiral or a basketball court needs, so give the model several "line-drawing" units and let training choose the lines. That is a hidden layer.

**Draw this.** Blue dots inside a circle, orange dots around it. One straight line that obviously fails. Next to it, the same data as a bowl in 3-D with a horizontal plane slicing it.

**Key numbers (our run).**
- Kobe's make rate by distance: 62.8% at 0–3 ft, 39.8% at 16–24 ft, 6.1% beyond 30 ft.
- Validation log loss: constant prediction 0.687, logistic regression on (x, y) 0.675, small MLP 0.662.
- The best possible straight-line rule on the task file gets 58.6% accuracy, against 55.3% for "always miss" and about 61% for a good MLP.

**Students get wrong.**
- "Train it longer and it will bend." It can't: the model family only contains lines.
- "Adding features is cheating." In general it's a perfectly good fix. In the Kobe task, though, the rules only allow linear layers and activations inside the model.

**They will ask.**
- *"So why not just add x² and y² as features?"* For a circle, that works perfectly. For a spiral or a court you would have to guess the right features, and hidden layers learn them for you.
- *"Why did neural networks die after 1969?"* Minsky and Papert proved that a single-layer perceptron can't compute XOR. Nobody knew how to train hidden layers until backpropagation became popular in 1986.

### 4.2 The neuron and the MLP

**Say it like this.** One neuron is logistic regression without the final sigmoid: a weighted sum plus a bias, then an activation function. Its line *z* = 0 cuts the plane in two, and the weight vector points across the line, towards the side where *z* grows. A hidden layer is several neurons side by side. Each draws its own line and reports how far you are on the good side of it. The next layer combines those reports. Think of a committee of line-drawers: junior analysts each draw one line, and a manager weighs their reports.

In matrix form: **h** = φ(*W*₁**x** + **b**₁), then ŷ = *W*₂**h** + *b*₂. For Kobe, *W*₁ is 8×2 (eight neurons, two inputs). Stack more layers and you get a multi-layer perceptron (MLP). *Depth* is the number of layers; *width* is the number of neurons per layer. Training is the backprop they already know; PyTorch's autograd applies the chain rule for them.

XOR needs only two hidden ReLUs: h₁ = ReLU(x₁ + x₂), h₂ = ReLU(x₁ + x₂ − 1), output y = h₁ − 2h₂. The inputs (0,0), (0,1), (1,0), (1,1) give 0, 1, 1, 0. Two hidden neurons solve what froze the field for over a decade.

**Draw this.** The 2-8-8-1 network: two input circles, eight, eight, one. Write the shapes directly on the arrows: "W₁: 8×2", "W₂: 8×8", "W₃: 1×8".

**Key numbers: the E1 worked example.** Input **x** = (1, 2). Hidden layer (ReLU): *W*₁ = [[1, −1], [0.5, 1]], **b**₁ = (0, −1). Output: **w**₂ = (2, −1), *b*₂ = 0.5, then a sigmoid. Target *y* = 1.
- **a**₁ = *W*₁**x** + **b**₁ = (−1, 1.5)
- **h** = ReLU(**a**₁) = (0, 1.5). Hidden unit 1 is switched off.
- *z* = 2·0 − 1·1.5 + 0.5 = −1.0
- *p* = σ(−1) = 0.269, loss = −ln 0.269 = 1.313

Optional E2 (the backward pass, lr 0.1): δ*z* = *p* − *y* = −0.731. ∂*L*/∂**w**₂ = (0, −1.097), ∂*L*/∂*b*₂ = −0.731. Hidden unit 1 gets gradient 0 because its ReLU was off. After one step *p* = 0.408 and the loss is 0.896, down from 1.313.

**Students get wrong.**
- "Neurons work like brain neurons." Say "loosely inspired by", never "works like".
- "Hidden unit 3 means something." Nothing forces that. Shuffle the eight units and you get the same network.
- "Initialise everything to zero, like logistic regression." See section 4.11.

**They will ask.**
- *"Is it really like a brain?"* No. In one study, a 5–8-layer deep network was needed to mimic the input–output behaviour of a single model cortical neuron (Beniaguev et al. 2021).
- *"Why are there two hidden layers but three linear layers?"* Each hidden layer is a linear layer plus an activation. The third linear layer is the output; it produces the logit.

### 4.3 Tensor shapes and parameter counts

**Say it like this.** Data comes as a matrix of shape (batch, features), for example (32, 2): 32 shots, two coordinates each. `nn.Linear(2, 8)` turns it into (32, 8): eight numbers per shot. PyTorch stores the weight as (out, in) = (8, 2), one row per output neuron, and computes **x** @ *W*ᵀ + **b**. Each `Linear(in, out)` has in·out + out parameters: the weights plus one bias per output neuron. Wrong shapes are the most common beginner error, so print `.shape` constantly.

**Draw this.** Rectangles: a tall thin (32×2) block times a (2×8) block equals a (32×8) block. The inner 2s cancel.

**Key numbers.**

| Network | Parameters |
|---|---|
| `Linear(2, 8)` | 2·8 + 8 = 24 |
| 2-8-8-1 (the Kobe maximum) | 24 + 72 + 9 = **105** |
| 2-16-1 | 65 |
| 2-64-64-64-1 | 8,577 |
| 784-128-10 (an MNIST MLP) | 101,770 |
| GPT-3 | 175 billion, about 1.7 billion times the Kobe net |

Count in code: `sum(p.numel() for p in model.parameters())`. The Kobe net sees about 245 labelled shots per parameter.

**Students get wrong.** Expecting the weight to be (in, out). Forgetting the biases. Thinking the batch size changes the parameter count (it doesn't).

**They will ask.**
- *"Why (8, 2) and not (2, 8)?"* One row per output neuron. Row *j* is neuron *j*'s weight vector.
- *"Why does my model crash with 'shapes cannot be multiplied'?"* The number of input columns doesn't match `in_features`. The exact message is in section 4.13.

### 4.4 Activations and why they are needed

**Say it like this.** Without a nonlinearity, stacked layers collapse into one: *W*₂(*W*₁**x** + **b**₁) + **b**₂ = (*W*₂*W*₁)**x** + (*W*₂**b**₁ + **b**₂). That is one linear layer with weight *W*₂*W*₁. So ten linear layers can represent exactly the same functions as one. The activation is what bends the function. It is the only thing that stops the network from collapsing to a line.

The zoo, practically:

| Activation | Formula and range | Use it for |
|---|---|---|
| ReLU | max(0, *z*); slope 1 or 0 | the default in hidden layers |
| Leaky ReLU, ELU | like ReLU with a small slope or curve for *z* < 0 | when units die (section 4.7) |
| Sigmoid | 1/(1 + e^(−*z*)), range (0, 1) | turning a final logit into a probability; avoid in deep hidden layers |
| tanh | range (−1, 1), zero-centred | small, smooth nets |
| GELU, SiLU | smooth versions of ReLU | transformers |

**Output layer rule:** no activation inside the model. Output the raw score (logit) and let the loss add the sigmoid or softmax. For regression, no activation either. (The Kobe *submission* is a deliberate exception; see section 5.1.)

A ReLU network computes a piecewise-linear function, so its decision regions are polygons.

**Draw this.** Sigmoid, tanh and ReLU side by side, each with its derivative underneath. Mark the sigmoid derivative's peak: 0.25 at *z* = 0.

**Key numbers.** ReLU(−5) = 0. σ(0) = 0.5. The maximum of σ′ is 0.25; the maximum of tanh′ is 1. On Kobe, ReLU vs tanh gives validation log loss 0.662 vs 0.664 (our run), which is barely different. Changing Adam's lr from 1e-3 to 1e-2 moves the result by about the same amount.

**Students get wrong.** Thinking the activation choice is a big deal for tiny nets: it isn't, normalisation and the learning rate matter more. Putting a sigmoid at the end *and* using `BCEWithLogitsLoss` (section 4.8).

**They will ask.**
- *"ReLU isn't differentiable at 0. Is that a problem?"* No. PyTorch uses slope 0 at exactly 0, and hitting exactly 0 is rare.
- *"Why is σ(0) = 0.5?"* e⁰ = 1, so σ(0) = 1/(1 + 1).
- *"Which activation for Kobe?"* Any allowed one. ReLU is the simplest to explain. In our runs ReLU, tanh, ELU and LeakyReLU all scored within noise of each other.

### 4.5 Universal approximation, and what it does NOT say

**Say it like this.** The honest statement: a network with **one hidden layer** and a **non-polynomial** activation (sigmoid, tanh, ReLU…) can approximate any continuous function on a bounded region **as closely as you like**, provided the hidden layer is **wide enough**. (Cybenko 1989 for sigmoids; Hornik 1991; Leshno et al. 1993 for any non-polynomial activation.)

You can see why in 1-D with ReLUs. `ReLU(x)` is a ramp. `ReLU(x) − 2·ReLU(x − 1) + ReLU(x − 2)` is a hat: 0 up to *x* = 0, up to 1 at *x* = 1, back to 0 at *x* = 2, flat after that. Three hidden units. Put hats at many grid points and scale their heights to the function's values, and their sum is the "join the dots" curve through any function. More hats give a finer fit. Steep sigmoid pairs make "bumps" in the same way (Michael Nielsen's free online book, chapter 4, has an interactive version to recommend to students).

**What it does NOT say** (this is the important slide):
1. How wide the layer must be. The width can grow exponentially with the number of inputs.
2. That gradient descent will *find* those weights.
3. Anything about generalising from finite, noisy data. A wide net can also approximate the noise.
4. Anything outside the bounded region. Far from the data, a ReLU net is linear, so it extrapolates in a straight line.

Analogy: with enough thin Lego bricks you can match any skyline. The theorem promises the bricks exist, not that you can find the building instructions, and not that you will copy tomorrow's skyline.

**Draw this.** The three ramps and their sum, the hat. Then three hats adding up to a wiggly curve.

**Students get wrong.** "Neural nets can learn anything." "UAT means our 2-8-8-1 can fit Kobe perfectly." No: the width is fixed, and the labels are coin flips (section 5.1).

**They will ask.**
- *"Then why use deep networks at all?"* Depth can be exponentially more efficient (next topic).
- *"The theorem is about sigmoids. Does ReLU count?"* Yes. Any non-polynomial activation works (Leshno et al. 1993).
- *"What does the Kobe net predict for a shot from 300 ft?"* Something arbitrary: a straight-line extrapolation of the logit. The data has no shots beyond about 79 ft.

### 4.6 Depth vs width

**Say it like this.** Width is how many neurons per layer; depth is how many layers. In principle one wide layer is enough. In practice depth can be far more efficient. Each ReLU layer can *fold* the input space, and the next layer cuts through all the folds at once, so the number of linear pieces can grow exponentially with depth. Concretely: the "tent map" composed *k* times has 2^*k* linear pieces and needs only 2*k* neurons (Telgarsky 2016). Paper-folding analogy: fold a sheet *k* times, make one cut, and you get many pieces.

The other side: deeper nets are harder to train (vanishing gradients, dead units) and have more parameters to fit. Depth helps when the function is compositional *and* you have the data.

On Kobe, *width* is the first fix. The official baseline is 2-1-1-1. Every layer has one unit, so the output is a monotone function of a single number **w**·**x** + *b*, and the decision boundary is a straight line. Its accuracy is 57.7% ± 1.5% (our replica), the same as logistic regression. Widening to 2-8-8-1 gives about 60.5–61%. Going 80× bigger (2-64-64-64-1, 8,577 parameters) gives a validation log loss of 0.660 vs 0.662: the same. The limit is the noise in basketball, not the capacity.

**Draw this.** A sheet of paper folded twice with one cut through it. Or the sawtooth: one tent, then two, then four.

**They will ask.**
- *"2-8-8-1 or 2-8-1?"* Both are legal. 2-8-8-1 is the largest allowed and the safe choice; the difference is tiny.
- *"Why exactly does 2-1-1-1 give a line?"* The single unit in each layer passes on one number. A chain of monotone functions of one number is still monotone, so "output > 0.5" is the same as "**w**·**x** + *b* > some constant": a half-plane.

### 4.7 Vanishing gradients and dead ReLUs

**Say it like this.** Backprop multiplies one activation derivative per layer. The sigmoid's derivative is at most 0.25, so after ten sigmoid layers the gradient is at most 0.25¹⁰ ≈ 10⁻⁶. The early layers barely learn. That is a *vanishing gradient*. ReLU's derivative is exactly 1 on the active side, which is a big reason it became the default.

ReLU has its own failure: a *dead* unit. If a unit's pre-activation is negative for *every* input (its line lies entirely outside the data cloud), its output is always 0 and its gradient is always 0, so it never recovers. In an 8-unit layer each dead unit costs 12.5% of the layer. Causes: a learning rate that is too high, unscaled inputs, or bad luck. Fixes: lower the lr, normalise the inputs, change the seed, or use LeakyReLU or ELU.

**Draw this.** A chain of boxes with "× 0.25" between them, shrinking arrows. Next to it, a cloud of data points with one neuron's line drawn far outside the cloud, labelled "always 0".

**Key numbers.** 0.25¹⁰ ≈ 9.5 × 10⁻⁷. In E2, hidden unit 1 had pre-activation −1 and got gradient exactly 0.

**They will ask.**
- *"How do I check for dead units?"* Run the training inputs through the first layer and count units that are never positive: `(h > 0).any(dim=0)` gives `False` for dead units.
- *"Do batch norm or residual connections fix this?"* They help in deep networks. A 3-layer MLP doesn't need them. Put it in the parking lot.

### 4.8 Losses: MSE, BCE, cross-entropy, logits

**Say it like this.** The loss is one number that says how wrong we are; training makes it smaller. Choose it to match what you predict.

- **Numbers → MSE**, the mean of (ŷ − *y*)². The Inversion task is scored with MSE.
- **Yes/no → binary cross-entropy (BCE)**, also called log loss: −[*y* log *p* + (1 − *y*) log(1 − *p*)]. Think of it as a *surprise meter*: the average surprise when the truth is revealed. A confident wrong guess is a huge surprise. A weather forecaster who said "90% rain" on a dry day deserves more blame than one who said "60%".
- **One of K classes → cross-entropy** with a softmax over K scores.

A **logit** is the raw score *z* before the sigmoid: *p* = σ(*z*), and *z* = ln(*p* / (1 − *p*)). *z* = 0 is 50%, *z* = 2 is 88%, *z* = −2 is 12%. In PyTorch the model outputs logits, and the loss takes logits:

| Task | Model outputs | Loss | Labels |
|---|---|---|---|
| a number | 1 value | `nn.MSELoss()` | float, same shape as the output |
| yes / no | 1 logit | `nn.BCEWithLogitsLoss()` (sigmoid inside) | float 0/1, shape (N, 1) |
| one of K | K logits | `nn.CrossEntropyLoss()` (softmax inside) | integer class index, shape (N,) |

`BCEWithLogitsLoss` combines the sigmoid and the BCE in one numerically stable step. That is why the sigmoid lives inside the loss and not in the model.

Why not train on accuracy directly? Accuracy is a staircase: nudging a weight rarely changes any prediction, so the gradient is zero almost everywhere. BCE is smooth and always says which way to move.

**Draw this.** The curve −ln *p* for a made shot, with four points marked: *p* = 0.9 → 0.105, *p* = 0.5 → 0.693, *p* = 0.1 → 2.303, *p* = 0.001 → 6.908. "Confident and wrong is expensive."

**Key numbers.**
- At initialisation, logits are near 0, so *p* ≈ 0.5 and BCE ≈ ln 2 = **0.693**. With 10 classes, cross-entropy starts near ln 10 = 2.303. If the first printed loss is far from this, something is broken.
- The best *constant* prediction on Kobe is *p* = 0.446, log loss **0.687**. That is the number to beat.
- Setting the output bias to logit(0.446) = −0.217 makes the net start at the baseline (0.6875 instead of 0.6905). It is a nicety: after 3 epochs there is no difference (our run).

**The cliffhanger, explained.** With `nn.Sigmoid()` as the last layer *and* `BCEWithLogitsLoss`, the sigmoid is applied twice. The probability the loss sees is σ(σ(*z*)), which always lies between 0.5 and 0.731. The loss can never go below 0.313 on a made shot or 0.693 on a miss. The only way the optimizer can reduce it is to push the inner sigmoid to 0 or 1. Result (our run): the printed loss looks normal, accuracy is a normal 61%, but 76% of the outputs are below 0.01 or above 0.99, and the true log loss of what you would submit is **4.69** (correct model: 0.662). No error is raised. The same family of bug: a softmax in the model followed by `CrossEntropyLoss`.

**Students get wrong.** The double sigmoid; the double softmax; float labels for `CrossEntropyLoss`; labels of shape (N,) for `BCEWithLogitsLoss`.

**They will ask.**
- *"Why the logarithm?"* Log loss is the negative log-likelihood of what actually happened. It is also a *proper scoring rule*: on average you minimise it by reporting your true belief.
- *"Is a 2-class softmax different from a sigmoid?"* No. softmax(*z*₁, *z*₂)₁ = σ(*z*₁ − *z*₂). Use one logit for binary problems.
- *"Then why does the Kobe submission end with a Sigmoid?"* The grader wants a probability and (most likely) thresholds it at 0.5. That is fine as long as you train that model with `nn.BCELoss` (no "WithLogits"). See section 5.1.

### 4.9 Gradient descent, the learning rate, epochs, batches and steps

**Say it like this.** Gradient descent: θ ← θ − η ∇*L*. The gradient points uphill, so we step against it. η is the learning rate, the most important knob in deep learning ("If you have time to tune only one hyperparameter, tune the learning rate", Goodfellow et al. 2016). Too small and the loss crawls. Too big and it oscillates or explodes.

The paper example: *L*(*w*) = (*w* − 3)², *w*₀ = 0, η = 0.1. The gradient is 2(0 − 3) = −6, so *w*₁ = 0 − 0.1·(−6) = 0.6. For this bowl the error shrinks by the factor (1 − 2η) each step: it converges for 0 < η < 1, flips sides every step when η > 0.5, lands exactly in one step at η = 0.5, bounces between 0 and 6 forever at η = 1, and diverges above 1. The demo presets: 0.02 is too slow (140 steps to get within 0.01), 0.3 is good (7 steps), 0.9 oscillates but converges (26 steps), 1.05 diverges.

The same in PyTorch: `w = torch.tensor(0.0, requires_grad=True)`; compute `loss = (w - 3)**2`; `loss.backward()` fills `w.grad`; update inside `with torch.no_grad(): w -= 0.1 * w.grad`; then `w.grad.zero_()`.

**Epoch, batch, step.** A batch is the group of examples used for one gradient estimate. A step is one update. An epoch is one pass over the training data. Steps per epoch = ⌈N / B⌉.
- The deck's numbers: N = 20,558 training shots, B = 64 → 322 steps per epoch (the last batch has 14 shots); 30 epochs = 9,660 steps.
- If your notebook uses the task file's 25,000 rows with an 80/20 split, N = 20,000 → 313 steps per epoch (the last batch has 32). Expect a student to notice.
- **Count steps, not epochs.** Full batch for 30 epochs is only 30 steps: validation log loss 0.688, no better than a constant. Batch 64 for 30 epochs is 9,660 steps: 0.662 (our run).
- Minibatch gradients are noisy; the noise shrinks like 1/√B. Small batches can't settle exactly at a fixed lr; they jitter in a "noise ball".

**Ravines and input scale.** When one direction of the loss surface is much steeper than another, the contours are long thin ellipses. Plain gradient descent zig-zags across the narrow direction and crawls along the long one. Unscaled inputs cause exactly this (section 4.12).

**Draw this.** The parabola (*w* − 3)² with three step sequences: tiny steps, good steps, steps bouncing to the other side. Then a long thin ellipse with a zig-zag path inside.

**They will ask.**
- *"What batch size should I use?"* 64–256 for small tabular data. Full batch is fine for Kobe (20,000 × 2 numbers), but give it many more steps. If you increase the batch, raise the lr a little.
- *"Does the small last batch matter?"* No. `DataLoader(..., drop_last=True)` drops it if you care.

### 4.10 Optimizers: SGD, momentum, RMSprop, Adam, AdamW, schedules

**Say it like this, one sentence each.**
- **SGD**: step = lr × gradient. Simple, but the right lr depends heavily on the problem and the input scale.
- **Momentum**: a heavy ball rolling downhill. It keeps a velocity (*v* ← β*v* + *g*, then step along *v*), so it speeds up in directions where the gradients agree and cancels the zig-zags. β = 0.9 is roughly an average of the last 10 gradients, and on a long steady slope it goes up to 10× faster than plain SGD. In PyTorch: `SGD(params, lr, momentum=0.9)`.
- **RMSprop**: divides each parameter's step by a running average size (RMS) of *its own* gradients, so steep and flat directions get similar steps. Mostly historical now.
- **Adam = momentum + its own step size for every parameter** (plus a small "bias correction" for the first steps). The practical consequence: **each parameter moves about lr per step, whatever the size of its gradient.** On the very first step it moves exactly lr. Gradients of 1000, 1 and 0.001 all produce a step of 0.001 at lr 1e-3.
- **AdamW**: Adam with weight decay done properly (applied straight to the weights instead of mixed into the gradient). Use it whenever you want weight decay with Adam.

**Defaults (PyTorch 2.15, checked).**

| Optimizer | Call | Defaults |
|---|---|---|
| SGD | `torch.optim.SGD(model.parameters(), lr=0.1, momentum=0.9)` | lr 1e-3, momentum 0 (you almost always change both) |
| Adam | `torch.optim.Adam(model.parameters(), lr=1e-3)` | lr 1e-3, betas (0.9, 0.999), eps 1e-8 |
| AdamW | `torch.optim.AdamW(model.parameters(), lr=1e-3, weight_decay=0.01)` | lr 1e-3, weight_decay 0.01 |
| RMSprop | `torch.optim.RMSprop(...)` | lr 1e-2, alpha 0.99 |
| L-BFGS | `torch.optim.LBFGS(params)` with a closure | for small, smooth, full-batch problems |

**When to use what.**

| Situation | Use |
|---|---|
| A new problem tonight: MLPs, tabular data, olympiad tasks | **Adam, lr 1e-3**, then try 3e-4, 3e-3, 1e-2 and pick by validation |
| You want weight decay | AdamW, weight_decay 0.01–0.1 |
| CNNs from scratch on images, with time to tune | SGD + momentum 0.9; a well-tuned SGD often slightly beats Adam |
| Tiny, smooth, full-batch problems (like Inversion) | Adam with a large lr, or L-BFGS |
| Optimising *inputs* | Adam with lr on the scale of the input values (≈ 0.1), not 1e-3 |

**Schedules.** Constant; step decay; cosine decay; linear warmup then cosine (standard for transformers, step it every batch). For small tasks: `ReduceLROnPlateau` on the validation loss plus early stopping is simple and enough. Warmup is a stability tool for big models; it doesn't rescue a wrong lr.

**Be honest: Adam is a default, not magic.** On the ravine rotated by 45°, Adam does worse than plain SGD (final loss 7.06 vs 0.27 in the race demo), because its per-parameter steps only help when the bad direction lines up with the parameter axes. Adaptive methods can generalise worse than tuned SGD on image models (Wilson et al. 2017). And tuned SGD matches Adam on Kobe.

**Draw this.** A long narrow valley with three paths: SGD zig-zagging, momentum swinging wide then settling, Adam heading fairly straight down.

**Key numbers: the Kobe optimizer chart (our run, validation log loss, 30 epochs).**

| Setting | Log loss | Accuracy |
|---|---|---|
| constant prediction | 0.688 | 55.2% |
| Adam lr 3e-4 | 0.664 | 60.5% |
| **Adam lr 1e-3** | **0.662** | 61.3% |
| Adam lr 1e-2 | 0.660 | 61.8% |
| Adam lr 1.0 | 0.701 | 51.7%, worse than constant |
| SGD lr 1e-3 | 0.683 | 55.2%, has barely moved |
| SGD lr 0.1 | 0.663 | 61.4% |

"lr 1e-3 is an Adam default, not a law of nature." At lr 1e-3, plain SGD barely moves.

**They will ask.**
- *"Why does Adam need bias correction?"* Its running averages start at 0, so the first ones are too small. Dividing by (1 − βᵗ) fixes that; that is why the very first step is exactly lr.
- *"Why do people say 3e-4?"* Karpathy tweeted "3e-4 is the best learning rate for Adam, hands down" (2016) as a joke, and in his 2019 training recipe he uses it seriously as a safe starting value.
- *"Is Adam always better than SGD?"* No. It is more forgiving of a bad lr, which is why it's the default.

### 4.11 Initialisation

**Say it like this.** Weights start random to break the *symmetry*. If all hidden units start equal, they compute the same thing, get the same gradient, and stay identical copies forever, so eight units behave like one. With all zeros in a tanh or ReLU net it is worse: the hidden outputs are 0, every gradient into the first layer is 0, and the first layer never learns at all. PyTorch's `nn.Linear` already initialises randomly (weights and biases uniform in ±1/√fan_in). That default is fine for small nets; for deep ReLU nets people use `nn.init.kaiming_normal_`.

Random initialisation also means different results on every run. Fix `torch.manual_seed(0)` for reproducibility, and try several seeds to be honest about the spread.

**Key numbers (our run).** Kobe 2-8-8-1 tanh, all parameters set to 0.5, then 300 Adam steps: all 8 first-layer rows still identical (about [0.583, 0.566]). All zeros: first-layer weights still exactly 0. A 2-16-1 net with constant init on circle data reaches 69% accuracy, the same as a net with one hidden unit; with random init it reaches 100%.

**They will ask.**
- *"Logistic regression works from zero. Why not here?"* Logistic regression has no hidden units, so there is no symmetry to break, and its loss is convex.
- *"Does the init trick for the bias help the score?"* Not on Kobe. It removes the "hockey-stick" start of the loss curve, that's all.

### 4.12 Input normalisation

**Say it like this.** Standardise each input: subtract its mean and divide by its standard deviation, using statistics from the **training set only**, and apply the same numbers to validation and test data. Why: it makes the loss surface a round bowl instead of a long ravine, so one learning rate suits every direction. It keeps pre-activations near ±1, so tanh units don't saturate and ReLU gradients aren't 100 times too big. And it makes the defaults (Adam 1e-3, PyTorch's init) behave the way they were designed. This is 1998 advice (LeCun et al., "Efficient BackProp") and it is still bug number one.

**Key numbers.**
- Kobe's raw coordinates are in tenths of feet: `loc_x` from −250 to 248 (std ≈ 110), `loc_y` from −44 to 791 (std ≈ 88). The task statement says they are "already normalized". That is false.
- Loss at initialisation: raw 2.33, standardised 0.69 (our run).
- For logistic regression on Kobe-like data, the curvature ratio of the loss surface is about 40,000 raw vs 1.01 standardised. Gradient descent needs more than 20,000 steps raw vs 3–9 steps standardised.
- The surprise: with **Adam**, raw coordinates train about as well (log loss 0.664 vs 0.662; no accuracy difference on the task file), because Adam's per-parameter steps hide the scale. With **SGD + momentum at lr 0.1**, raw inputs collapse to "always miss" (55.3%) while standardised inputs reach 60.3%. Lesson: scale changes the effective learning rate of each layer; whether that hurts depends on the optimizer. Standardise anyway: it costs one line.

**The Kobe twist.** The grader feeds the *raw* coordinates to the submitted model, so any scaling must live inside the weights. Fold it into the first layer: *W*′ = *W* / σ (divide each column by that input's std) and **b**′ = **b** − *W*′**μ**. The result is exact (in our pipeline the probabilities changed by at most 1e-6) and completely legal.

**Draw this.** Two contour plots side by side: long thin ellipses with a zig-zag path ("raw"), circles with a straight path ("standardised").

**They will ask.**
- *"Why only training statistics?"* Validation and test must look like unseen data. Using their statistics leaks information, and at grading time you won't have them.
- *"Min-max scaling or z-score?"* z-score by default. Min-max is worse when a feature is skewed, as `loc_y` is.

### 4.13 The training loop, line by line

Write this on the board before the live coding. It uses a class (not `nn.Sequential`) so it carries over to the Kobe task.

```python
class MLP(nn.Module):
    def __init__(self):
        super().__init__()
        self.fc1 = nn.Linear(2, 8)
        self.fc2 = nn.Linear(8, 8)
        self.fc3 = nn.Linear(8, 1)
    def forward(self, x):
        x = torch.relu(self.fc1(x))
        x = torch.relu(self.fc2(x))
        return self.fc3(x)                       # logits, no sigmoid

model = MLP()
loss_fn = nn.BCEWithLogitsLoss()
opt = torch.optim.Adam(model.parameters(), lr=1e-3)

for epoch in range(30):
    model.train()
    perm = torch.randperm(len(X_train))          # shuffle every epoch
    for i in range(0, len(X_train), 64):
        idx = perm[i:i + 64]
        opt.zero_grad()                          # 1. clear old gradients
        logits = model(X_train[idx])             # 2. forward
        loss = loss_fn(logits, y_train[idx])     # 3. loss  (y shape: [B, 1])
        loss.backward()                          # 4. backward: fills p.grad
        opt.step()                               # 5. update the weights
    model.eval()
    with torch.no_grad():
        val_logits = model(X_val)
        val_loss = loss_fn(val_logits, y_val).item()
        val_acc = ((val_logits > 0).float() == y_val).float().mean().item()
```

**The five beats: zero, forward, loss, backward, step.** Say them aloud every time.

| Line | What it does | Why it matters |
|---|---|---|
| `opt.zero_grad()` | clears the gradients from the last step | Gradients **add up** by default. Calling `backward()` three times on 2*w* gives `w.grad` = 2, then 4, then 6. |
| `model(X)` | the forward pass | Inputs must be float32, shape (B, 2). |
| `loss_fn(logits, y)` | one number | `y` must be float, shape (B, 1). |
| `loss.backward()` | backprop: fills `.grad` of every parameter | One call does all of backprop. |
| `opt.step()` | moves every parameter | The optimizer was given `model.parameters()` once, outside the loop. |
| `model.eval()` / `torch.no_grad()` | evaluation mode / no gradient bookkeeping | `eval()` switches off dropout and batch-norm training behaviour; `no_grad()` saves memory and time. A plain Linear+ReLU net behaves the same either way, but build the habit. |
| `val_logits > 0` | accuracy from logits | logit > 0 is the same as *p* > 0.5. |

**Exact error messages (PyTorch 2.15, checked).**

| You see | Cause | Fix |
|---|---|---|
| `ValueError: Target size (torch.Size([5])) must be the same as input size (torch.Size([5, 1]))` | labels of shape (N,) with `BCEWithLogitsLoss` | `y = y.view(-1, 1)` |
| `UserWarning: Using a target size (torch.Size([5])) that is different to the input size (torch.Size([5, 1])). This will likely lead to incorrect results due to broadcasting.` | the same mismatch with `MSELoss`: it silently broadcasts to an N×N matrix (perfect predictions report MSE 4.0) | match the shapes; take warnings seriously |
| `RuntimeError: mat1 and mat2 must have the same dtype, but got Double and Float` | pandas gave float64 | `torch.tensor(..., dtype=torch.float32)` |
| `RuntimeError: mat1 and mat2 shapes cannot be multiplied (3x3 and 2x8)` | the number of input columns doesn't match `in_features` | check `X.shape` |
| `RuntimeError: expected target dtype to be Long or Byte, but got Float` | float class labels with `CrossEntropyLoss` | `y.long()` |

**Silent bugs (no error at all).** No `zero_grad`. A Sigmoid before `BCEWithLogitsLoss`. Creating the optimizer inside the epoch loop (it resets Adam's memory every epoch). Normalising validation data with validation statistics. Evaluating on the training set and calling it validation.

**They will ask.**
- *"Why does PyTorch add gradients up instead of replacing them?"* So you can sum gradients over several small batches or several losses before one step. The price is that you must clear them yourself.
- *"Why `.item()`?"* It turns a one-number tensor into a plain Python float, so you don't keep the computation graph alive while logging.

### 4.14 Generalisation, regularisation and debugging

**Say it like this.** Three splits. *Train* to fit the weights. *Validation* to choose hyper-parameters and when to stop. *Test* to report once at the end. In a competition the hidden leaderboard is the test set, and the public leaderboard is closer to a validation set: tune to it too much and you overfit it.

*Underfitting*: train and validation losses both high and close together. *Overfitting*: train loss keeps falling while validation loss turns up, and the gap grows. A small gap with val slightly worse is normal.

Cures for overfitting:
- **More data**, or a **smaller model**.
- **Weight decay**: a pull of every weight towards 0 (AdamW's `weight_decay`).
- **Dropout**: during training, randomly zero a fraction of the hidden units on each example (the original paper dropped half), so units can't rely on each other. It switches off in `model.eval()`.
- **Early stopping**: keep the weights from the epoch with the best validation loss. Copy them with `best = copy.deepcopy(model.state_dict())`. A plain `model.state_dict()` keeps references, so you would save the *last* weights. (A public Kobe notebook made exactly this mistake.)

For Kobe, none of this matters much: 105 parameters against 20,000 noisy labels can't memorise anything, and train ≈ validation accuracy. The difficulty there is optimisation and scaling, not overfitting.

**The loss-curve doctor.**

| Curve looks like | Diagnosis | Try |
|---|---|---|
| explodes, or NaN | lr too high (or unscaled inputs) | lr ÷ 3–10, check scaling |
| falls slowly, almost a straight line | lr too low | lr × 3–10 |
| flat from the start near 0.69 | stuck: saturated or dead units, a constant predictor | check scaling, lr, seed; print the fraction predicted "made" |
| train falls, validation turns up | overfitting | early stopping, smaller model, weight decay, more data |
| very jagged | batch too small or lr too high | bigger batch, lower lr, smooth the plot |
| both fall and flatten together | healthy (maybe at the noise ceiling) | stop tuning, check the baseline gap |

**Karpathy's recipe, as a checklist** ("A Recipe for Training Neural Networks", 2019). (1) Check the loss at init (≈ 0.693, or 0.687 at the Kobe base rate). (2) Train an input-independent baseline, for example with all inputs set to zero; the real model must beat it. (3) Overfit one tiny batch (as few as two examples) to a loss near 0; if you can't, there's a bug. (4) Look at the predictions (for Kobe, a heat map on the court). (5) Change one thing at a time, fix the seeds, keep a log. His one-line summary: "Neural net training fails silently."

**The bug hunt (E9) answer key**, if the slide uses the standard five: (1) `nn.Sigmoid()` as the last layer with `BCEWithLogitsLoss`; (2) `opt.zero_grad()` missing; (3) validation data normalised with *validation* mean and std; (4) labels of shape (N,) against logits of shape (N, 1); (5) "validation" computed on the training set, or `model.eval()` missing. Bonus: the optimizer created inside the epoch loop. If the slide's bugs differ, its speaker notes have the key.

**A modern caveat (one minute, for curiosity).** The textbook U-curve is not the whole story. In *double descent*, test error can rise and then fall again as models grow past the point where they fit the training set exactly. In *grokking*, generalisation can appear long after training accuracy reaches 100%, on tiny algorithmic datasets. For our small nets the classic picture holds; don't promise grokking on Kobe.

**Key numbers (our run).** 500 training shots, full-batch Adam: after 2,000 steps the 2-256-256-1 net has train loss 0.37 and validation loss 1.23. The 2-8-8-1 net's best validation loss is 0.677 at step 300. Networks can even memorise random labels perfectly (Zhang et al. 2017), so high train accuracy proves nothing.

**They will ask.**
- *"My validation loss is lower than my training loss. Bug?"* Usually not. The training loss is averaged over the epoch while the weights were still improving, dropout is active only during training, or the split is lucky.
- *"Kobe train accuracy is stuck at 61%. Underfitting?"* No. 61% is the ceiling, because the same spot produces both makes and misses (section 5.1).
- *"How many seeds?"* At least three. On Kobe, treat accuracy differences below about 0.005 as ties.

### 4.15 Optimising inputs instead of weights

**Say it like this.** Backprop computes the gradient of the loss with respect to *anything* that has `requires_grad=True`. In training, the data is fixed and the weights move. In inversion, the weights are frozen and an *input* moves. It is the same loop with a different leaf.

Famous uses: adversarial examples (a nearly invisible change to a panda photo makes a network say "gibbon" with 99.3% confidence); DeepDream (change the image to amplify what a layer sees); style transfer (optimise the pixels so frozen network features match a target); model-inversion attacks (Fredrikson et al. 2014 inferred a patient's genotype, a missing input, from a warfarin-dosing model's output and the patient's other attributes, which is exactly the afternoon task).

**Toy 1, one answer.** *f*(*a*, *b*, *c*) = *a* + 2*b* + *c*². With *a* = 1, *c* = 1.5 and *y* = 4.65, recover *b* (the answer is 0.7). The loss is convex in *b*. With plain GD, lr 0.125 lands in one step, lr 0.25 bounces between 0 and 1.4 forever, lr 0.3 blows up. The step limit is set by the curvature.

**Toy 2, two answers.** Same *f*, recover *c* with *a* = 1, *b* = 0.7: now *c*² = 2.25, so *c* = +1.5 or −1.5. Start at +0.1 and you get +1.5; start at −0.1 and you get −1.5. Start at **exactly 0** and you stay at 0 forever, with SGD and with Adam, because the gradient there is exactly zero (*c* = 0 is a local maximum of the loss). Picking the wrong sign costs a squared error of 9. **Non-uniqueness is the real limit of inversion.** You need a rule for choosing between answers: a prior.

**The learning-rate trap.** Adam moves each value about lr per step. With lr 1e-3, an input needs 2,000 steps to travel a distance of 2. Choose the lr on the scale of the values you are recovering: about 0.1 for N(0, 1)-sized inputs. On our replica, Adam lr 1e-3 for 500 steps gives MSE 0.433; lr 0.1 gives 0.024.

**One unknown? Look at all of it.** With one unknown number per row, you can simply evaluate the model at 2,001 values of that number for every row in one batch (under `torch.no_grad()`). Every place where *f* crosses *y* is a solution. Gradient descent only finds the one downhill from its start; the grid shows them all.

**Draw this.** Two pipeline diagrams, one above the other. Training: data (fixed) → model (weights *moving*, magenta) → loss. Inversion: data with one column *moving* (magenta) → model (frozen, padlock) → output compared with *y* → loss.

**They will ask.**
- *"Isn't this just training?"* Yes, the same machinery. The missing column plays the role of the parameters.
- *"Why not train a model that predicts the missing column?"* You could generate training pairs yourself by feeding the frozen model random inputs, but the inverse model would face the same ambiguity (two values of *c*, one *y*) and it's more work.
- *"Can different inputs really give the same output?"* Yes. On our replicas, 33–50% of rows have two or more exact solutions in [−5, 5].

---

## 5. The two afternoon tasks

### 5.1 Task 1: Kobe shot prediction (NOAI 2024, round 2, problem 1)

**Where it comes from.** It is problem 1 of NOAI 2024 (China's national AI olympiad), round 2, reused as question 1 of the NOAI 2025 teaching test, which the Bohrium platform labels "APOAI2025 Mock Competition". (There was no real "APOAI 2025" contest; the first real APOAI was in 2026.) The 25,000 rows are Kaggle's labelled Kobe Bryant shots, renumbered and shuffled.

**The statement (English, with our corrections in brackets).**

> **Predicting the shooting percentage of a basketball star.**
> You are given a CSV file of a star basketball player's shots, `data_train.csv`. The meaningful columns are:
> - `loc_x`, `loc_y`: the player's horizontal and vertical position on the court when shooting. "Already normalized, ignore the units." [False: they are raw positions in tenths of a foot with the rim at (0, 0). `loc_x` ranges from −250 to 248, `loc_y` from −44 to 791.]
> - `minutes_remaining`, `shot_distance`: minutes left in the period and distance to the basket. [Not allowed as inputs. `shot_distance` is exactly ⌊√(x² + y²)/10⌋ anyway.]
> - `shot_made_flag`: 1 = made, 0 = missed.
> - `shot_id`: a unique identifier.
>
> The training set has 20,000 rows; the hidden test set has about 5,000. [The released file has 25,000 rows; it probably includes the test rows. With 105 parameters this makes no practical difference.]
>
> **Task.** Use PyTorch to implement a multi-layer perceptron that predicts whether a shot from a given position goes in:
> 1. The input is exactly 2 features (`loc_x`, `loc_y`); the output is 1 label (`shot_made_flag`).
> 2. Use only linear layers and activation functions placed after linear layers, with **at most 3 linear layers**. Build the network directly; **do not nest it in `nn.Sequential()`**. The scoring system can't see inside `nn.Sequential`, and such a submission scores 0.
> 3. Activations may only be `nn.ReLU`, `nn.Sigmoid`, `nn.Tanh`, `nn.ELU`, `nn.LeakyReLU`, `nn.PReLU`.
> 4. **Each linear layer has at most 8 neurons.**
> 5. The loss function, optimizer and learning rate are free choices.
>
> **Submission.** `submission.zip`, which unzips to `submission_model.py` (the model class definition and its imports) and `submission_dic.pth` (the trained `state_dict`, loaded at scoring time).
>
> **Scoring.** If the layer and neuron counts satisfy the rules, the score is the **accuracy on the test set**; otherwise the score is 0. Leaderboard A uses 50% of the test set and is shown live. Leaderboard B uses the other 50%, is computed after the contest, and is the final score.

The largest legal network is 2-8-8-1 (105 parameters). The official baseline names its class `MyModel` with a no-argument constructor; keep that.

**Rulings to give before they start** (our recommendations; announce them so nobody wastes time):
- Computing distance or angle inside `forward()`: treat as illegal. The rules allow only linear layers and activations. It also gives no measurable gain.
- Using `shot_distance` or `minutes_remaining`: illegal (the grader passes 2 columns).
- `(x − μ)/σ` inside `forward()` with buffers: grey zone; fold the scaling into `fc1` instead (exact and legal).
- Folding a tuned threshold into the last bias: legal, but it gains nothing measurable.
- Ensembling several nets: impossible within 3 linear layers of width 8.
- A final `nn.Sigmoid`: keep it (see the traps).

**Why the scores are so low (tell them after they've tried).** Each label is a coin flip whose probability depends on position. Even the 4,200 shots at exactly (0, 0) went in only 62.5% of the time, so a perfect model is still wrong on 37.5% of them. Accuracy only cares which side of 50% a spot falls on, and only shots within about 3 ft of the rim go in more than half the time. So the accuracy-optimal answer is essentially "made if and only if within 3 ft" (60.7%), which predicts "made" for about 22% of shots. The 3-point line is invisible to accuracy: shots on both sides of it go in less than half the time.

**Expected scores.**

| Model | Validation accuracy |
|---|---|
| "always miss" | 55.3% |
| official 2-1-1-1 baseline (a straight line) | 57.7% ± 1.5% |
| best possible straight line | 58.6% |
| "made iff within ~3 ft" rule | 60.7% |
| good legal 2-8-8-1 MLP | ≈ 60.5–61% |
| gradient boosting or kNN on (x, y) | ≈ 60.5% (the ceiling is about 61%) |

On the real leaderboards the best legitimate scores were 0.6212 (A) and 0.6249 (B); the B-board median was 0.612. A board of about 2,500 shots has a standard deviation of about ±0.01, so 0.62–0.625 is a good model plus luck over many submissions. Entries above 0.96 are grader exploits, not models.

**Reference approach** (scores ≈ 60.5–60.8% on validation):
1. Write `submission_model.py` first: class `MyModel` with `fc1 = nn.Linear(2, 8)`, an activation, `fc2 = nn.Linear(8, 8)`, an activation, `fc3 = nn.Linear(8, 1)`, then `nn.Sigmoid()`. Import this class for training, so the trained model and the submitted model can't differ.
2. Split 80/20 (stratified), standardise with the training mean and std.
3. Train with BCE on the sigmoid output (`nn.BCELoss` or `F.binary_cross_entropy`), Adam lr 1e-2, full batch for about 2,000 steps (or minibatches of 256 for about 25 epochs).
4. Check: validation accuracy ≈ 0.605, fraction predicted "made" ≈ 0.2.
5. Fold the scaling into `fc1` (section 4.12), save `state_dict()`, zip the two files.
6. Unzip into a fresh folder, import the class from there, `load_state_dict(..., strict=True)`, run it on **raw** validation coordinates, check the accuracy is unchanged, and assert the rules (≤ 3 `nn.Linear`, every `out_features` ≤ 8, no `nn.Sequential`).

The full reference notebook is in `solutions/`.

**Traps.**
- **The grader feeds raw coordinates.** If you trained on standardised inputs and forget to fold the scaling into `fc1`, the submitted model sees inputs 100 times too large and its accuracy collapses.
- **`nn.Sequential` scores 0.** So do `ModuleList` tricks the checker might not see. Write `self.fc1 = …` explicitly.
- **Class and weights mismatch.** Two public notebooks trained one architecture and submitted the class code of another, so `load_state_dict` failed. Another referenced names that didn't exist in `submission_model.py`. Train the exact class you submit, and reload the zip before submitting.
- **Using `shot_distance` is illegal**, and pointless: it is a function of (x, y).
- **The Sigmoid.** The grader most likely thresholds the output at 0.5 (this is not published; the baseline ends with a Sigmoid). So the submitted model should end with `nn.Sigmoid()`. Train it with `nn.BCELoss`, *not* `BCEWithLogitsLoss` (that would be the double-sigmoid bug from the lecture). If a student trained a logits model with `BCEWithLogitsLoss`, they can add the Sigmoid to the submitted class: it has no parameters, so the `state_dict` is unchanged.
- **The "best" checkpoint** must be `copy.deepcopy(model.state_dict())`.
- **A constant predictor.** A too-small lr, too few steps or an unlucky seed gives "always miss" (55.3%) or even "always made" (44.7%; one public copy scored 0.44). Always print the fraction predicted "made".
- **Chasing the leaderboard.** Differences under 0.01 are noise. Validate with several seeds.
- **Running code at import time** in `submission_model.py` to fake a score is cheating (one public "hack" notebook did it).

**Hint ladder.** Give the next hint only to students who are stuck. The times are suggestions, counted from the start of the task.

| Hint | When | Say |
|---|---|---|
| 1 | ~15 min, no baseline yet | "Before training anything: what accuracy does 'always miss' get? Compute the make rate by distance from the rim. Where is it above 50%?" |
| 2 | ~30 min, no legal model yet | "Write the class first: `MyModel` with `fc1`, `fc2`, `fc3` and an activation after the first two, no `nn.Sequential`. Assert the parameter count is 105 or less. Train exactly this class." |
| 3 | ~45 min, stuck near 55–58% | "Two things: is the model wide enough to draw a disc around the rim (a 2-1-1-1 can only draw a line)? And what is the fraction of shots you predict 'made'? It should be about 0.2. Try Adam lr 1e-2 with full batch and about 2,000 steps." |
| 4 | ~60 min, good validation, about to submit | "The grader feeds raw coordinates. If you standardised, fold it into fc1: divide each column of W by that input's std, and subtract W′μ from the bias. Check that the folded model on raw inputs gives the same predictions." |
| 5 | ~75 min, or anyone still without a valid zip | Walk them through steps 5–6 of the reference approach: save, zip, unzip into a fresh folder, reload with `strict=True`, test on raw inputs, check the rules. |

### 5.2 Task 2: Operation "Inversion"

**The statement (our English translation of the original Georgian).**

> **Operation "Inversion": digital restoration of data**
>
> **Context.** Imagine you work at a high-tech research centre where a unique AI model has been built. From ten different parameters, it precisely determines the final outcome of an experiment (*y*). Because of a technical failure on the server, one column of the database was damaged: all of its values were replaced with zero. The model is "frozen", which means it cannot be retrained. But since the model already "knows" the relationship between the parameters and the outcome, the model itself becomes the key to recovering the information. Your task is to recover the values of the lost column for each of the 1000 samples by mathematical optimisation.
>
> **Given resources.**
> 1. **Model.** `model.pt`, a pre-trained TorchScript model. It takes 10 values and returns one target variable (*y*). Load it with:
>    ```python
>    import torch
>    model = torch.jit.load("model.pt")
>    model.eval()
>    ```
> 2. **Data.** `data.csv`, 1000 records with 10 columns (`x0` to `x9`) and the outcome `y`. One of the columns is filled entirely with 0.0. That column is your target.
>
> **The task.** Find values for the damaged column that agree as closely as possible with the model's logic. In other words, if the recovered values and the other 9 parameters are fed to the model, it should return values as close as possible to the *y* given in the table.
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
> sub = pd.DataFrame({
>     "subtaskID": 1,
>     "datapointID": range(1000),
>     "answer": your_answer,
> })
> sub.to_csv("submission.csv", index=False)
> ```
>
> **Submission file.** `submission.csv` in this format, with exactly 1000 rows, where `answer` is the recovered value of the damaged column:
> ```
> subtaskID,datapointID,answer
> 1,0,1.234567
> 1,1,-0.567890
> ...
> ```
>
> **Evaluation.** Your work is scored by mean squared error. First the MSE of your prediction is computed:
> MSE = (1/1000) Σᵢ (x̂ᵢ − xᵢ*)², for i = 0 … 999, where x̂ᵢ is your recovered value and xᵢ* is the original.
> Then the score is scaled:
> **score = (MSE_baseline − MSE_yours) / (MSE_baseline − MSE_best) × 100**, clipped to [0, 100], where MSE_baseline ≈ 0.968 (leaving the column as zeros) and MSE_best ≈ 0.0045 (the best known solution). Leaving the column as zeros gives 0 points; the more accurately you recover the original values, the higher the score (maximum 100).
>
> **Constraints.** The model is untouchable: changing its weights is forbidden. You must submit the corresponding code together with your answers.

**How to launch it.** Hand out `model.pt`, `data.csv`, the statement and the starter notebook. The starter runs as given and writes a valid all-zeros submission (score about 0), with TODOs for: finding the column, building the input with `torch.cat`, the Adam loop on the missing column only, checking residuals and a grid, and choosing between several roots. Say only: "Same backprop as this morning; the input is the parameter."

**How the score behaves.** The score is linear in MSE, so the top end is compressed:

| MSE | 0.5 | 0.2 | 0.1 | 0.05 | 0.0236 | 0.0145 | ≤ 0.0045 |
|---|---|---|---|---|---|---|---|
| score | 48.6 | 79.7 | 90.1 | 95.3 | 98.0 | 99.0 | 100 |

Getting the basic method right is worth about 98 points. The last 1–2 points are all about rows with more than one answer.

**Expected scores.** We don't have the real task's model, so these come from four replicas we built (10 roughly normal inputs, a 10-64-64-1 TorchScript MLP, 1000 rows, one column zeroed with the same 0.968 baseline). The real model may behave differently; the real best of 0.0045 lies between our easy replica and our hard ones, so it probably has *some* ambiguous rows.

| Method | MSE (hard replica) | Score |
|---|---|---|
| leave zeros | 0.967 | 0 |
| Adam lr 1e-3, 500 steps, from 0 | 0.433 | 55 |
| **Adam lr 0.1, 500 steps, from 0** (the safe first submission) | 0.0236 | **≈ 98** |
| L-BFGS from 0 | 0.021 | 98.3 |
| all roots from a grid, pick the one closest to 0 | 0.021 | 98.3 |
| **all roots, prior-weighted average (posterior mean)** | 0.0145 | **≈ 99** |

Plain Adam from 0 works so well because starting at 0 picks the solution closest to 0, which acts as a built-in prior.

**Reference approaches.**
1. *Safe first submission (under 1 second).* Load, `model.eval()`, freeze the parameters, convert to float32. Find the column: `k = int((X == 0).all(0).nonzero()[0])`. Make `z = torch.zeros(N, requires_grad=True)`, rebuild the input with `torch.cat([X[:, :k], z[:, None], X[:, k+1:]], 1)`, take `model(...)[:, 0]`, use loss `((pred - y)**2).sum()`, and run `Adam([z], lr=0.1)` for 500 steps. Only `z` goes to the optimizer.
2. *The improvement.* Evaluate the model on a grid of 2,001 values in [−5, 5] for every row under `torch.no_grad()`. Every sign change of *f* − *y* along a row brackets a root; refine with a few Newton steps. Count the roots per row. Where a row has several, weight each root by how plausible it is (a normal prior for the missing column, fitted from the other 9 columns, divided by the slope |*f*′| at that root) and submit the **weighted average**. The average minimises the expected squared error; picking one root is a gamble.

The full reference notebook is in `solutions/`.

**Traps.**
- **`model.eval()`.** A model scripted in training mode loads with `training=True`; with dropout, two calls on the same input give different answers. Always call it (the statement does).
- **Freeze the parameters:** `for p in model.parameters(): p.requires_grad_(False)`. The weights don't change either way, but there is a TorchScript quirk in torch 2.15: after one call in gradient mode, `torch.no_grad()` no longer stops graph building, so grid evaluation becomes slow, and `torch.inference_mode()` crashes. `model.requires_grad_(False)` is not supported on scripted models; use the loop. Gradients still reach the input.
- **float32.** pandas gives float64: `mat1 and mat2 must have the same dtype, but got Double and Float`.
- **(N, 1) vs (N,) broadcasting.** The model returns shape (N, 1) and *y* is (N,). `model(X) - y` silently becomes an N×N matrix that mixes all rows: MSE 2.44 on our replica, *worse than submitting zeros*. Use `model(X)[:, 0]` (the statement's `.squeeze()` does the same) and assert shapes.
- **Adam lr 1e-3 is far too slow for inputs.** Each value moves at most about 0.001 per step. Use about 0.1. lr 1.0 overshoots into the wrong solution (MSE 1.39).
- **SGD with `.mean()` doesn't move.** Each row's gradient is divided by 1000 (MSE 0.709). Use `.sum()` (the rows are independent) or Adam, which doesn't care about the loss scale.
- **Don't optimise all 10 inputs.** The optimizer "explains" *y* by moving everything (MSE 0.504). Only the missing column moves.
- **Two-root rows.** On the hard replica, 330 of 1000 rows have two exact solutions, and about 15 rows where the "obvious" one is wrong cause almost all of the remaining error. Residuals can't reveal them, because the fit is exact. Only the grid (counting roots) shows them. "Multi-start and keep the smallest residual" is a coin flip between roots and scores *worse than zeros*.
- **Starting exactly at a stationary point.** At a point where the gradient is exactly 0 (Toy 2's *c* = 0, or a ReLU sitting exactly at 0), GD never moves.
- **`torch.set_num_threads(1)`.** On a shared or overloaded CPU, torch's default threads made it about 100× slower in our tests.
- **Code must be submitted** with the answers. Remind them to keep a clean script.

**Hint ladder.**

| Hint | When | Say |
|---|---|---|
| 1 | ~10 min | "Which column is it? You can find it in one line. What changes in the output when you put different values in that column?" |
| 2 | ~25 min, no optimisation yet | "Treat the missing column as the parameters: `z = torch.zeros(N, requires_grad=True)`, rebuild the input with `torch.cat`, loss = sum of squared differences to *y*, and give only `z` to the optimizer. Freeze the model. Print every shape." |
| 3 | ~40 min, loss barely moving or score below 60 | "How far does Adam move a value per step? About lr. Your values are around ±1–3. What lr do you need? Try 0.1 for 500 steps. And check: is your prediction (N, 1) or (N,)?" |
| 4 | ~60 min, score around 98 | "Look at the rows one by one. There is only one unknown per row, so try 2,001 values for every row at once and plot *f*(*z*) for a few rows against the line *y*. How many crossings do you see?" |
| 5 | ~80 min | "For rows with two crossings, which one should you submit? Prefer the one closest to a prior guess: 0, or a regression of the missing column on the other columns. Better still, think about what minimises the *expected* squared error when you're unsure: a weighted average of the candidates." |

---

## 6. Q&A cheat-sheet

1. **What exactly is a logit?** The raw score before the sigmoid, the log-odds z = ln(p/(1−p)). z = 0 means 50%, z = 2 means 88%, z = −2 means 12%.
2. **Why no activation on the output layer?** The loss applies the sigmoid or softmax internally, in a numerically stable way. For regression you want any real number.
3. **Why ReLU and not sigmoid in hidden layers?** Sigmoid's gradient is at most 0.25 and vanishes when it saturates; ReLU's is 1 on the active side. ReLU nets also train faster (AlexNet: about 6× faster than tanh to the same training error).
4. **ReLU isn't differentiable at 0. Problem?** No. PyTorch uses slope 0 there, and exact zeros are rare.
5. **Adam in one sentence?** Momentum plus its own step size for every parameter; each parameter moves about lr per step whatever its gradient. Start with lr 1e-3, then tune.
6. **Is Adam always best?** No. It is the most forgiving default. Tuned SGD with momentum often wins on image CNNs, and on Kobe tuned SGD (lr 0.1) matched Adam.
7. **Why lr 1e-3, and what is 3e-4?** 1e-3 is the default in the Adam paper and PyTorch. 3e-4 is Karpathy's joke ("the best learning rate for Adam, hands down") and also his safe starting value.
8. **Why minibatches and not the whole dataset?** Many more updates per epoch, less memory, and helpful noise. On Kobe, 30 full-batch epochs (30 steps) learned nothing (0.688); batch 64 reached 0.662.
9. **How many layers and units?** Start small, grow until validation stops improving, use several seeds. In the Kobe task, the maximum (2-8-8-1) is the sensible choice.
10. **Validation loss is lower than training loss. Bug?** Usually not: the training loss is averaged while the weights were still improving, dropout is only active in training, or the split is lucky.
11. **2-class softmax vs sigmoid?** Mathematically the same: softmax(z₁, z₂)₁ = σ(z₁ − z₂). Use one logit and `BCEWithLogitsLoss` for binary tasks.
12. **What is weight decay? Adam or AdamW?** A pull of all weights towards 0. With Adam, use AdamW: Adam's per-parameter scaling would otherwise weaken the decay for weights with large gradients.
13. **Why log loss for probabilities?** It is the negative log-likelihood, and a proper scoring rule: on average you minimise it by reporting your honest belief.
14. **Can a network extrapolate?** No guarantees. Far from the data, a ReLU net is linear, so it continues in a straight line.
15. **Does the order of examples matter?** Shuffle every epoch. Sorted data gives biased batches.
16. **What does `model.eval()` change?** It switches dropout and batch-norm to inference behaviour. For Linear+ReLU nets nothing changes, but build the habit.
17. **`model.eval()` vs `torch.no_grad()`?** `eval()` changes how some layers behave; `no_grad()` stops PyTorch recording operations for backprop. For evaluation you want both.
18. **Parameters vs hyper-parameters?** Parameters are learned by gradient descent (the 105 weights and biases). Hyper-parameters are chosen by you (lr, batch size, width, epochs, seed).
19. **Why different results every run?** Random initialisation and shuffling. Fix `torch.manual_seed`, and report several seeds.
20. **Why does PyTorch add gradients up?** So you can combine several batches or losses before one step. That's why you call `zero_grad()`.
21. **Why is `nn.Linear(2, 8).weight` of shape (8, 2)?** One row per output neuron; PyTorch computes x @ Wᵀ + b.
22. **Does the UAT mean one hidden layer is always enough?** In principle yes, but it may need to be enormous, and gradient descent may not find it. Depth is often far more efficient.
23. **Why is Kobe accuracy only 61%? Can anyone get 70%?** Each shot is a coin flip; even at the rim he scored only 62.5%. About 61% is the ceiling for (x, y). With extra Kaggle columns like shot type, gradient boosting reaches about 68%, but those aren't allowed.
24. **You said no sigmoid in the model. Why does the Kobe submission have one?** The grader wants probabilities. Train that model with `nn.BCELoss`. The bug is only Sigmoid *plus* `BCEWithLogitsLoss`.
25. **Can I compute the distance to the rim inside `forward()`?** Treat it as illegal: only linear layers and activations are allowed. It doesn't help measurably anyway.
26. **Why must the scaling be folded into `fc1`?** The grader feeds raw coordinates. W′ = W/σ and b′ = b − W′μ give exactly the same outputs on raw inputs.
27. **Should I tune the threshold?** For a calibrated model 0.5 is already optimal. If you must, fold it into the last bias: `fc3.bias -= log(t/(1−t))`.
28. **Inversion: why sum and not mean?** The rows are independent. With SGD, the mean divides every row's gradient by 1000 and nothing moves. Adam doesn't care.
29. **Inversion: why not optimise all 10 inputs?** You would change data you were given, and the optimizer would explain *y* by moving everything. Only the zeroed column is unknown.
30. **Inversion: what if two values fit perfectly?** Then the data can't tell them apart. Choose by a prior (closest to 0, or to a regression guess), or submit the weighted average of the candidates to minimise the expected squared error.
31. **What is dropout, and why not on Kobe?** Randomly zeroing hidden units during training so they can't co-adapt. Kobe's 105-parameter net can't overfit 20,000 noisy shots, so there is nothing to regularise.
32. **Why float32?** The weights are float32 and PyTorch won't mix dtypes in a matrix multiply. float32 is also the GPU standard.
33. **Do more epochs always help?** No. Validation loss can rise (overfitting). On Kobe, 100 epochs gained only 0.0007 log loss over 30.
34. **What about CNNs and transformers?** Parking lot. They use the same loop, losses and optimizers; only the model box changes.

---

## 7. Stories and facts you can tell

At most one story per section, under 60 seconds, always followed by "and this matters for your code because…". The sources were checked; where only secondary sources exist, say "reportedly".

| # | Story | Why it matters |
|---|---|---|
| 1 | **The 1958 hype.** The New York Times reported that the Navy expected the perceptron to "walk, talk, see, write, reproduce itself and be conscious of its existence." It drew one straight line. | Hype vs reality. Today we predict basketball shots with 105 numbers. |
| 2 | **The Mark I Perceptron (1960)** had a 400-photocell "retina" and motor-driven potentiometers as weights. Its middle layer was a fixed random plugboard: **only the last layer learned.** | It had a hidden layer but couldn't train it. Backprop filled that gap. |
| 3 | **Minsky & Papert, 1969** proved that a *single-layer* perceptron can't compute XOR. They knew multi-layer nets could, but doubted they could be trained. Funding dried up. | Two hidden ReLUs solve XOR. The limit was training, not representation. |
| 4 | **Walter Pitts**, the story goes, hid from bullies in a library at 12, read all of *Principia Mathematica* in three days and wrote to Bertrand Russell about its mistakes. He co-wrote the first neural-network paper (1943). | A teenager's work started the field. (Say "the story goes": it rests on recollections.) |
| 5 | **Backprop's disputed birth certificate.** Linnainmaa's 1970 thesis had the method; Werbos applied it to networks; Rumelhart, Hinton & Williams made it famous in 1986. | Credit in science is messy. Don't say "Hinton invented backprop". |
| 6 | **Gradient descent is from 1847** (Cauchy), more than a century before neural networks. | "Your optimizer's grandfather was born in 1847." |
| 7 | **AlexNet (2012)** trained for 5–6 days on two GTX 580 gaming GPUs and won ImageNet with 15.3% top-5 error against 26.2% for second place. ReLUs trained about 6× faster than tanh. | It made ReLU and dropout standard. |
| 8 | **Dropout and the bank tellers.** Hinton (2016 Reddit AMA) said his bank kept moving tellers around, which he guessed was to stop them cooperating to defraud the bank; dropping random neurons stops them "conspiring". | That is overfitting, in one picture. |
| 9 | **Adam is one of the most-cited papers of the century:** about 200,000 Google Scholar citations, 4th of all 21st-century papers in the Google Scholar data behind Nature's 2025 list. | The optimizer they type is the standard default. |
| 10 | **Karpathy's tweets.** "3e-4 is the best learning rate for Adam, hands down" (2016, a joke). And his "most common neural net mistakes" (2018): not overfitting one batch first, forgetting train/eval mode, forgetting `zero_grad()`, passing softmaxed outputs to a loss that expects raw logits. | Three of the four appear in today's live coding. |
| 11 | **LeCun (2018):** "Training with large minibatches is bad for your health… Friends dont let friends use minibatches larger than 32." | A joke with a real point about batch size; not a law. |
| 12 | **The adversarial panda.** Noise of size 0.007 turns GoogLeNet's "panda" (57.7%) into "gibbon" (99.3%). The noise is the sign of the gradient with respect to the *input*. | Backprop aimed at the input: the Inversion task. |
| 13 | **DeepDream's dumbbells** (Google, 2015): asked what dumbbells look like, the network drew them with muscular arms attached, because it had never seen a dumbbell without an arm. | Networks learn the data, not your intention. |
| 14 | **Model inversion is a real attack.** Fredrikson et al. (2014) inferred patients' genotypes, a missing input, from a warfarin-dosing model's output, weighting candidates by how common each genotype is. In 2015 they recovered recognisable faces from a face-recognition model. | That is literally the afternoon task, including the prior-weighted tie-break. |
| 15 | **Grokking.** A network suddenly generalised long after memorising its training set, discovered because a team member went on vacation and forgot to stop the run: "we got lucky… and by lucky, I mean forgetful" (as reported by Quanta). | The U-curve isn't the whole story; but don't promise it on Kobe. |

Spares: Zhang et al. (2017) showed networks can perfectly memorise random labels, so training accuracy proves nothing. The 2024 Nobel Prize in Physics went to Hopfield and Hinton for foundations of machine learning with neural networks: 66 years from the 1958 demo to a Nobel. IOAI 2027 is in Singapore.

**Things NOT to say**
- "Minsky & Papert proved neural networks can't do XOR." Single-layer only.
- "Hinton invented backprop in 1986." He co-popularised it.
- "Hebb said 'neurons that fire together wire together'." That slogan is Carla Shatz, 1992.
- "Neural networks work like the brain."
- "Attention span is 10 minutes" (or the goldfish claim). The evidence is weak.
- Exact parameter counts for GPT-4 or later models. They are not disclosed.
- "AlexNet was trained in Krizhevsky's bedroom." Unverified.
- "Adam always wins" or "Adam needs no tuning."
- "The optimizer finds the global minimum." It finds a good-enough low region.
- "The UAT means networks can learn anything."
- "The Kobe inputs are normalised, as the statement says." They are raw tenths of feet.
- "Raw inputs make training fail completely." With Adam on Kobe, raw inputs trained about as well; the damage shows with SGD.
- "This was APOAI 2025." No such contest took place; it is NOAI 2024 problem 1 under a Bohrium label.
- A quoted one-sentence definition of "Mamba mentality" in Kobe's words. Not verified; paraphrase it as "obsess over the boring details".
- Jokes about Kobe's death (January 2020, helicopter crash with his daughter). Mention it respectfully if it comes up, or not at all.

---

## 8. After the session

### 8.1 Exit-ticket answers (Q10–Q15)

| # | Question | Answer |
|---|---|---|
| 10 | Put in order: `loss.backward()`, `opt.step()`, `opt.zero_grad()`, `loss = loss_fn(model(x), y)` | `zero_grad` → forward + loss → `backward` → `step` |
| 11 | Kobe made 44.6% of his shots. Log loss of the best constant prediction? Accuracy of "always miss"? | ≈ 0.687 and ≈ 55% |
| 12 | True or false: "If train loss < val loss, the model is overfitting." | **False as stated.** A small gap is normal. Overfitting is when the validation loss rises while the training loss keeps falling, or the gap keeps growing. |
| 13 | Does `BCEWithLogitsLoss` expect probabilities or logits? | Logits |
| 14 | In the Inversion task, which tensor has `requires_grad=True`? | The missing input column, not the model weights |
| 15 | One thing that is still muddy | Open answer; read them all |

### 8.2 How to read the exit tickets

Tally each question as right or wrong; it takes ten minutes. Above 80% right: done. Between 50% and 80%: one minute of re-teaching tomorrow. Below 50%: re-teach it properly, with a new prediction question.

What the common wrong answers mean:
- **Q10 with `step` before `backward`**: they memorised words, not the logic. Re-run the five beats with "what does each line need from the previous one?"
- **Q11 = 0.693**: they confuse "a balanced coin" with "the base rate". Re-do E7: −[0.446 ln 0.446 + 0.554 ln 0.554] = 0.687.
- **Q12 = True**: the classic overfitting misconception. Show the 500-shot curves again and point at the gap *growing*.
- **Q13 = probabilities**: re-teach logits with the cliffhanger result (4.69 vs 0.662). This one causes silent bugs, so it's worth the time.
- **Q14 = the weights**: they missed the inversion idea. Use the "frozen lock, adjust the key" picture.
- **Q15**: group the answers into two or three themes. Answer the most common one at the start of tomorrow, and the parking-lot questions after it.

### 8.3 What to review tomorrow

- **A three-question retrieval warm-up** from today, before anything new. Spacing beats re-explaining. Good candidates: "Why must there be a nonlinearity between layers?", "What should the first BCE loss print?", "How far does Adam move a parameter in one step?"
- **The Kobe debrief.** Show the ceiling: always miss 55.3%, best straight line 58.6%, the rim rule 60.7%, a good MLP about 60.5–61%. Ask why the 3-point line doesn't appear in the decision boundary. Show the folding identity and the Sigmoid/`BCELoss` pairing. Ask who had a submission fail to reload, and why.
- **The Inversion debrief.** Show one row with two roots (plot *f*(*z*) and the line *y*). Explain why Adam from 0 already gets about 98, and why the last points come from choosing between roots, not from polishing residuals. Show the posterior-mean idea for the strongest students.
- **The muddiest points** from Q15, and anything below 50% on the tally.
