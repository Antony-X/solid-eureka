# Teacher's script — Neural networks, hands-on

Slide-by-slide script for the 180-minute lecture (50 slides). It is generated from the speaker notes in the deck (`tools/export_script.js`), so it always matches `lecture.html`. For background on every topic, the task hint ladders and the Q&A cheat-sheet, read `COACH_GUIDE.md` first.

How to read it: **Say** is what to tell the class, **Do** is what to click or draw, **Ask** is a question for the class and **Answer** its answer. "Press →" means advance one build step. In the deck, P opens the presenter window with these notes, a timer and the next slide.

| # | Section | Minutes | Clock | Slides |
|---|---|---|---|---|
| 0 | Opening | 8 | 0:00–0:08 | 1–4 |
| 1 | Why neural networks? | 12 | 0:08–0:20 | 5–7 |
| 2 | From one neuron to an MLP | 18 | 0:20–0:38 | 8–12 |
| 3 | Activations: any function | 18 | 0:38–0:56 | 13–16 |
| 4 | Loss: how wrong are we? | 12 | 0:56–1:08 | 17–20 |
| 5 | Break | 10 | 1:08–1:18 | 21–23 |
| 6 | Gradient descent and optimizers | 15 | 1:18–1:33 | 24–27 |
| 7 | The training loop, live | 35 | 1:33–2:08 | 28–35 |
| 8 | Generalization and debugging | 15 | 2:08–2:23 | 36–39 |
| 9 | Olympiad playbook and the two tasks | 30 | 2:23–2:53 | 40–48 |
| 10 | Wrap-up | 7 | 2:53–3:00 | 49–50 |


---

## 0 · Opening — 8 min (0:00–0:08)

### Slide 1 · Neural networks, hands-on

*On screen:* Neural networks, hands‑on

**Time:** 1 min

**Say:** Today we go from models that draw one straight line to neural networks, which can learn almost any shape. Everything on these slides is computed live in this browser.

**Do:** Let the spiral train while you talk: a network with 105 numbers inside is learning to separate two interleaved spirals right now.

**Ask:** Could one straight line separate these two spirals?

**Answer:** No. In the first hour you will see why a network can.

Keys: → / space next, ← back, P presenter window, N notes here, T light/dark, F full screen, B black, O slide map, ? help.

### Slide 2 · Today's map

*On screen:* Three hours: theory, live demos, code

**Time:** 1 min

**Say:** Here is the plan. Every few minutes you will do something: predict before a demo, count on paper, or write code. There is one break, and the last part prepares the two tasks you start this afternoon.

**Do:** Point at the "live code" row (we write the training loop together) and the "tasks" row. Ask for paper and a pen.

Pacing: the presenter window (P) shows the planned clock and warns when you are behind. If late, shorten pair work and optional questions, not the training loop or the task briefing.

### Slide 3 · Three ideas you need today

*(4 build steps)*

**Time:** 3 min

**Say:** Three ideas in plain words; everything today is built on them. If the room already knows them, keep it to one minute.

**Do:** Press → for each card; ask a student to say it back in their own words.

- **Knobs:** a shot's position goes in, a chance comes out; the knobs (weights) decide the guess.
- **Loss:** one number for how wrong the guess was; small is good.
- **Downhill:** turn each knob a little in the direction that lowers the loss (the gradient; backpropagation computes it), repeat. That is gradient descent.

**Ask:** If the loss goes up after a step, what went wrong?

**Answer:** The step was too big: we jumped over the bottom of the valley. The step size is the learning rate; we play with it after the break.

If faces look unsure: W opens a whiteboard, D a pen; draw a valley and roll a ball down it.

### Slide 4 · Predict: Kobe's shooting

*On screen:* 25,697 Kobe Bryant shots. What % went in? *(2 build steps)*

**Time:** 2 min

**Say:** Our running example is real data: Kobe Bryant's shots from 20 NBA seasons, each with its position on the court. Basket at the bottom; orange went in, blue missed. It is also the data of your first task this afternoon.

**Do:** Everyone writes a number on paper (15 s); take two or three guesses aloud. → reveals 44.6%, → the consequence.

**Ask:** If 44.6% went in, how often is a "model" right that always says "miss"?

**Answer:** About 55%. A model that does not clearly beat 55% has learned nothing; even the best reach only about 61%, because the same spot gives both makes and misses.

Data: Kaggle "Kobe Bryant Shot Selection", 25,697 labelled shots (1996–2016); 800 are drawn. Kobe died in a helicopter crash in 2020; if it comes up, be respectful.


---

## 1 · Why neural networks? — 12 min (0:08–0:20)

### Slide 5 · Can one straight line do it?

*On screen:* Can one straight line separate the colours? *(1 build step)*

**Time:** 1.5 min

**Say:** A toy dataset: orange dots in the middle, a blue ring around them. You may have seen logistic regression; if not, it is the simplest classifier, and its border between the colours is always one straight line. Can one straight line put all orange on one side and all blue on the other?

**Do:** Show of hands. Press **Train**: the line swings for about a second, then stays straight. Readouts: loss stays near 0.68, accuracy stops near 59% (it started at 58%). Press → for the answer.

**Ask:** Why can't it do better, however long we train?

**Answer:** Every straight line leaves both colours on both sides: the orange is surrounded. Training longer only polishes the line; it cannot bend it.

Maths for you: p = σ(w₁x₁ + w₂x₂ + b); the 50% border w₁x₁ + w₂x₂ + b = 0 is a line.

### Slide 6 · Fix 1: invent a feature (lift to 3-D)

*On screen:* Fix 1: lift the dots, then one flat cut works *(4 build steps)*

**Time:** 2 min

**Say:** Fix 1: invent a new feature, a trick you may have seen in classical ML. Lift each dot by its distance from the centre: the blue ring rises and a flat sheet slides between the colours. Dropped back to the floor, that flat cut is a circle.

**Do:** → the dots rise; drag the picture to spin it. → the sheet, → the circle, → the question.

**Ask:** Which height would you invent for Kobe's court? For a spiral?

**Answer:** For Kobe, distance from the rim, but you had to know basketball. For a spiral, nobody knows. And the Kobe task gives the network only x and y, so it must invent features itself: next slide.

Maths for you: height z = x² + y²; the sheet z = 0.36 lands on the floor as a circle of radius 0.6 (the idea behind kernel SVMs).

### Slide 7 · Fix 2: a hidden layer learns the features

*On screen:* Fix 2: four neurons, four lines, one shape *(1 build step)*

**Time:** 2.5 min

**Say:** Fix 2: let the network learn the features. The hidden layer is four one-line models side by side, the small squares; one more neuron on top combines their answers.

**Ask:** Each small square is cut by one straight edge. What shape will four of them make?

**Do:** Take guesses, then press **Train**: the shape forms in about 4 s. Point at each small square, then trace its side of the fence in the big picture. Press →.

**Answer:** A closed fence around the orange, often lopsided. The last neuron says "orange" only where all four agree you are inside; more neurons give more walls and a smoother shape.

The net is 2-4-1 with tanh, trained with Adam. Hidden neurons need not mean anything; here they just happen to be readable.


---

## 2 · From one neuron to an MLP — 18 min (0:20–0:38)

### Slide 8 · One neuron: weigh, add, bend

*On screen:* A neuron: weigh the inputs, add, bend

**Time:** 2 min

**Say:** A neuron multiplies each input by its weight, adds them up with a bias, then bends the result. With a sigmoid as the bend it is exactly the one-line model from before (logistic regression, if you have seen it). Inside networks we usually bend with ReLU: keep positive sums, turn negative ones into 0.

**Do:** Inputs are 1 and 2: point at weigh, add (0.5 + 2 − 1 = 1.5), bend (ReLU keeps 1.5). Drag "weight 1" to −2: the sum is −1 and the output snaps to 0, "the neuron is off". Click "sigmoid": the output becomes a chance.

**Ask:** With ReLU, what comes out for a sum of −3? Of +3?

**Answer:** 0 and 3: negative sums are switched off, positive ones pass through.

Maths for you: output = φ(w₁x₁ + w₂x₂ + b), φ = ReLU, max(0, z), or σ. Avoid "it works like a brain cell": real neurons are far more complex.

### Slide 9 · One neuron cuts the court with a line

*On screen:* One neuron cuts the court with a straight line

**Time:** 2 min

**Say:** Now feed the neuron every spot on Kobe's court: orange where it says "made", blue where it says "missed". Whatever the weights, the border is always a straight line; the arrow points to the orange side.

**Do:** Start: the line is 10 ft out, accuracy 54.5%, worse than "always miss" (55.4%). Let students steer turn (the weights), shift (the bias) and steepness to beat 55%: the best is about 59%, a line hugging the rim. Switch to ReLU once: the far side goes plain, the neuron is off there.

**Ask:** Kobe scores near the rim and misses far away, in every direction. Can one line separate near from far?

**Answer:** No: "near the rim" has a curved border. One line gets about 59%; the full network, combining several lines, about 61%.

The arrow is the weight pair (w₁, w₂), at right angles to the line.

### Slide 10 · Count the parameters

*On screen:* How many numbers does 2-8-8-1 learn? *(5 build steps)*

**Time:** 2 min

**Say:** Every arrow is one weight, and every neuron after the inputs has one bias. Learning means finding good values for all these numbers. Let's count them for the Kobe network.

**Do:** Press → per layer and let the room call out first: 2×8 + 8 = **24**, 8×8 + 8 = **72**, 8×1 + 1 = **9**, total **105**. Pairs take a minute for the right side: 2-16-1 = **65**; 784-128-10 (digit images) = **101,770**.

**Ask:** 2-16-1 has fewer numbers. Is it allowed in the Kobe task?

**Answer:** No. The rule is at most 3 linear layers of at most 8 neurons each, not a number budget; breaking it scores 0.

Rule of thumb: nn.Linear(in, out) has in × out + out numbers.

### Slide 11 · Forward pass, animated

*On screen:* Click a spot: the numbers flow through

**Time:** 2 min

**Say:** A real 2-8-8-1 network, already trained on 20,000 of Kobe's shots; the court colour is its answer everywhere. Click a spot: the position goes in on the left, every layer does weigh-add-bend, and a chance comes out on the right.

**Do:** Click "Rim" (about 60%), "Corner 3" (about 35%), "Half court" (about 5%), then anywhere. Orange arrows push the next neuron up, blue push it down, dotted carry nothing (the neuron before is off). "Real shot" also shows what happened.

**Ask:** Even at the rim it only says about 60%. Is the network bad?

**Answer:** No, basketball is noisy: Kobe made about 62% at the rim. The network is right about 61% of the time, against 55% for "always miss", close to the best possible.

Inputs are in units of 10 ft; the output circle shows the raw score before the sigmoid. Neurons stuck at 0 everywhere are "dead" ReLUs: they never learn.

### Slide 12 · An MLP in PyTorch

*On screen:* The same network, in PyTorch *(4 build steps)*

**Time:** 2 min

**Say:** The Kobe network as PyTorch code: a class with two parts. __init__ builds the parts, three linear layers and two ReLUs holding the 105 numbers; forward gives the route through them. You never call forward yourself: model(x) does it.

**Do:** → 1 highlights __init__, → 2 forward (the arrows). → 3: 32 random shots in, shape (32, 1) out, and 105 parameters, as counted by hand. → 4: the Kobe-task warning.

**Ask:** The last line returns fc3(x) with no sigmoid. Is that a bug?

**Answer:** No. The model outputs a raw score (a "logit"); the loss, BCEWithLogitsLoss, applies the sigmoid itself, safely. For a chance, use torch.sigmoid(model(x)).

Kobe rules (repeated later): at most 3 linear layers of at most 8 neurons, built as attributes like this; nn.Sequential scores 0 because the checker cannot see inside it.


---

## 3 · Activations: any function — 18 min (0:38–0:56)

### Slide 13 · No activation: still one line

*On screen:* No activation: 105 weights, still one line

**Time:** 2 min

**Say:** Two hidden layers of 8 neurons, 105 weights, and nothing between the layers: each neuron only adds up its weighted inputs. Can it separate the orange disk from the blue ring?

**Do:** Press Train: one straight line, accuracy stuck at about 59%. Pause, click **ReLU** under "between the layers", Train: within a second the boundary bends around the disk, 100%. Optional: **tanh** gives a round boundary.

**Ask:** What did we change between the two runs?

**Answer:** Only a bend (the activation) after each hidden neuron. Without it, all the layers together still act like one straight line.

ReLU boundaries are made of straight pieces, which is why they look slightly angular.

### Slide 14 · The activation zoo

*On screen:* Any bend will do: the activation zoo *(1 build step)*

**Time:** 1.5 min

**Say:** Almost any bend works. ReLU: zero for negative inputs, the input itself for positive ones; Leaky ReLU keeps a small slope on the left. Sigmoid squashes into 0 to 1, tanh is the same S from −1 to 1, and GELU is a smooth ReLU used in models like GPT.

**Do:** Press → to show the magenta dashed **slope** curves. Sweep the pointer across the sigmoid plot and stop at the middle.

**Ask:** What is the largest slope the sigmoid ever has?

**Answer:** 0.25, at input 0; far from 0 it is flat. ReLU's slope is 1 for every positive input. Training relies on these slopes and flat spots barely learn: one reason ReLU is the usual default.

Avoid "the neuron fires": these are smooth bends, not on/off switches.

### Slide 15 · Any curve from hinges

*On screen:* More hinges, any curve *(2 build steps)*

**Time:** 1.5 min

**Say:** One ReLU neuron draws a hinge: flat, then a straight ramp. The dashed curve is a wiggly target, each dot is one neuron's hinge, and the thick line adds them up. With three hinges we only get a rough zig-zag.

**Do:** Press → for 8 hinges, → again for 32. The "error" drops from 0.07 to 0.002 to 0.000005 and the dashed curve disappears under the thick line. The faint lines are each neuron's own ramp.

**Ask:** I want the error ten times smaller. What do I do?

**Answer:** Add hinges, that is, more hidden neurons: each one is one more place where the line may bend.

Here the hinges are evenly spaced and the output weights computed exactly; on the next slide training must find them itself.

### Slide 16 · Gradient descent finds the hinges

*On screen:* Training finds the hinges by itself

**Time:** 1.5 min

**Say:** Now the network starts from random weights and must find the hinges by training. You may have seen gradient descent; if not: it nudges every weight a little to shrink the error, thousands of times.

**Do:** Press Train: 4 neurons, rough shape, error about 0.014. Click **2 neurons** (it restarts; press Train if needed): stuck at 0.06. **8**: about 0.005, worse than 8 hand-placed hinges (0.002). **32**: about 0.0001 after 5 to 7 seconds. Point at the corners: the hinges it found.

**Ask:** With 2 neurons the error stays at 0.06 however long we train. Why?

**Answer:** Two neurons give at most two bends; this curve needs more. More neurons make a good fit possible, but training starts at random and can settle a little worse, as with 8.


---

## 4 · Loss: how wrong are we? — 12 min (0:56–1:08)

### Slide 17 · Squared error: big misses cost the most

**Time:** 1.5 min

**Say:** The loss is one number that says how wrong the model is; training makes it small. Dots: the share of Kobe's shots made from each distance; the line is our model. Each miss becomes a square, and the loss is the average square: the mean squared error.

**Do:** Point at the big square at 0–4 ft. Drag an end dot to grow and shrink squares, then press **Fit the line**: loss 64 → 18.

**Ask:** A miss of 10 points costs 100. What does a miss of 20 cost?

**Answer:** 400, four times as much: big misses are very expensive, so the line works hardest to avoid them.

PyTorch: `nn.MSELoss()`, the loss for predicting numbers, as in the inversion task.

### Slide 18 · Confident and wrong costs the most

*(5 build steps)*

**Time:** 2.5 min

**Say:** For yes/no the model gives a forecast, like a weather forecaster: "90% chance it goes in." The shot goes in; four forecasters had said 90%, 50%, 10% and 0.1%. Rank them, and guess how much worse the last is than the first.

**Do:** 60 seconds with a neighbour. Press → four times, one loss each: 0.1% costs 6.91, 66 times the 90% forecaster. A fifth press adds a slider and a "went in / missed" switch.

**Ask:** The shot missed and the forecast was 90%. What is the loss?

**Answer:** 2.30, as for 10% on a made shot: only the chance given to what happened counts.

This is binary cross-entropy (log loss), the official Kobe metric. You may have seen it in logistic regression; if not, "surprise meter" is enough.

### Slide 19 · Pick the loss from what you predict

*(4 build steps)*

**Time:** 2 min

**Say:** Three kinds of questions cover almost every task, each with its loss. Before each row, let the class guess.

**Do:** → Row 1, a number (the inversion task): one output, mean squared error.

**Do:** → Row 2, yes/no (Kobe): one score, BCEWithLogitsLoss, the forecast loss; targets 0. or 1. as floats.

**Do:** → Row 3, one of K classes: K scores; softmax turns them into shares (the bars), and the loss punishes a low share for the right answer.

**Do:** → The rule: the model ends with plain Linear; the loss does the squashing.

**Ask:** Which of 10 digits is in an image: how many outputs, which loss?

**Answer:** 10 scores, nn.CrossEntropyLoss. Untrained, each class gets 10%, so the first loss is about 2.3.

CrossEntropyLoss wants raw scores and class numbers 0 … K−1 as integers, not one-hot.

### Slide 20 · Cliffhanger: sigmoid + BCEWithLogitsLoss

*On screen:* A sigmoid at the end. What happens? *(2 build steps)*

**Time:** 2 min

**Say:** Last question before the break. A classmate wants the model to output a chance, so they add a sigmoid at the end and keep BCEWithLogitsLoss. What happens?

**Do:** → highlights the two lines; 30 seconds of silence, then a finger vote (note the counts). → One minute with a neighbour, re-vote. Do not reveal: "we run it after the break."

**Ask:** 1 crash, 2 trains normally, 3 quietly worse, 4 NaN?

**Answer:** For you only (revealed after the break): 3. The loss adds a second sigmoid: printed loss looks normal (about 0.68), accuracy about 61%, but the outputs become extreme; their true log loss is about 4.5, against 0.67 when correct (about 3 out of 4 outputs say "less than 1%").

No crash (shapes are fine) and no NaN: the loss's own sigmoid lifts any output to at least 50%.


---

## 5 · Break — 10 min (1:08–1:18)

### Slide 21 · Break: 10 minutes

*On screen:* True or bluff?

**Time:** 10 min

**Say:** Ten minutes of break: stand up, drink water, look out of a window. When we come back we play a game: ten claims about neural networks, true or bluff?

**Do:** The timer starts by itself (Pause or Reset if needed) and only runs while this slide is visible, so keep it on screen. At 0:00 the numbers turn white on black.

The game is on the next two slides, about 3 minutes in total; if you are short on time, play only the first.

### Slide 22 · True or bluff? (1–5)

*On screen:* True or bluff? *(5 build steps)*

**Time:** 1.5 min

**Do:** For each line: read the claim, count "3, 2, 1, show!": hand up for **true**, fist for **bluff**. Press → to reveal the verdict and say the one line below, no more.

1. **True.** About a machine that could only draw one straight line: hype is old.
2. **Bluff.** Only for networks *without* a hidden layer, but the book was read as "neural nets don't work" and funding dried up.
3. **True.** Hinton's bank moved tellers so they could not team up to cheat; dropping random neurons stops them "conspiring".
4. **Bluff.** Hebb (1949) had the idea; the catchy sentence is Carla Shatz's (1992).
5. **True.** Two GTX 580 cards, five to six days; it won ImageNet 2012 and started the deep-learning boom.

### Slide 23 · True or bluff? (6–10)

*On screen:* True or bluff? *(5 build steps)*

**Time:** 1.5 min

**Do:** For each line: read the claim, count "3, 2, 1, show!": hand up for **true**, fist for **bluff**. Press → to reveal the verdict and say the one line below, no more.

1. **True** (as the researchers tell it). Someone left a run going over a holiday; long after memorising, the network suddenly generalised: "grokking".
2. **Bluff.** No fixed limit exists; attention dips and comes back when you do something.
3. **True.** About 200,000 by 2025; you will type Adam this afternoon.
4. **Bluff.** Imitating one realistic brain neuron took a deep network of five to eight layers (2021).
5. **Bluff.** Cauchy described it in 1847, a century before neural networks.

**Say:** Ask: "Who got 8 or more right?" Then move on to how the network learns.


---

## 6 · Gradient descent and optimizers — 15 min (1:18–1:33)

### Slide 24 · The learning rate, live

*On screen:* Too small crawls, too big explodes

**Time:** 2.5 min

**Say:** Training means rolling downhill on the loss. This bowl is the loss of one weight w, lowest at 3; each step moves the ball against the slope, by learning rate × slope. We change only the learning rate.

**Do:** For each value ask "what will happen?", then click it and press **Run**. Order: 0.3, 0.02, 0.9, 1.05.

- **0.3**: at the bottom in 7 steps.
- **0.02**: crawls; still 0.6 away after 40 steps.
- **0.9**: overshoots every step, but arrives (26 steps).
- **1.05**: every jump is bigger: it blows up (in real training the loss becomes NaN).

**Ask:** Which learning rate would be fastest here?

**Answer:** 0.5: one step lands on the bottom. A steeper bowl lowers every limit, so there is no universal right value.

### Slide 25 · Epoch, batch, step

*On screen:* One step per batch, not per epoch *(3 build steps)*

**Time:** 2 min

**Say:** An **epoch** is one pass over all the training shots. A **batch** is a handful of them, here 64. After every batch we take one **step**: one update of all the weights.

**Do:** → (1): the zoom shows one batch of real shots; let the class compute the steps per epoch first. → (2): take the vote. → (3): our Kobe runs.

**Ask:** 20,558 shots in batches of 64: how many steps per epoch?

**Answer:** 322 (the last batch has 14 shots), so 9,660 steps in 30 epochs.

**Say:** Batches of 64 learn (0.662); all shots at once takes only 30 steps and is no better than guessing (0.688). Count steps, not epochs.

A slope from 64 random shots is noisy but honest, and 300 times cheaper. (The notebook has 20,000 training shots: 313 steps per epoch.)

### Slide 26 · Race in a narrow valley

*On screen:* Plain descent zig-zags in a narrow valley *(2 build steps)*

**Time:** 2.5 min

**Say:** A loss surface seen from above, like a map: a long, narrow valley, steep across and almost flat along, with the bottom at the cross. Three optimizers race from the same start.

**Do:** Ask "predict the path", then press **Run**: plain gradient descent (SGD, dotted) zig-zags, then crawls. Each → adds a racer (momentum dashed, then Adam solid) and restarts the race.

- **Momentum** = a heavy ball: side-to-side pushes cancel, pushes along the floor add up. It overshoots, then ends closest.
- **Adam** = its own step size for each weight: small across the steep walls, big along the flat floor, so it goes almost straight.

**Ask:** Pair task (1 min): describe one walk to your neighbour; they name the optimizer.

**Answer:** Zig-zag, then crawl: SGD. Speeds up and overshoots: momentum. Fairly straight: Adam.

The learning rates are toy values for this surface, not real-network defaults.

### Slide 27 · What to use: Adam, then tune lr

*On screen:* Start with Adam, lr 0.001 *(3 build steps)*

**Time:** 1 min

**Say:** You never write the update by hand. You create an optimizer once, with the model's weights and a learning rate, and in the loop call three lines: zero_grad, backward, step.

**Do:** → (1): start with Adam 0.001; also try 0.003 and 0.0003 and keep the best on validation. → (2): for every weight: clear the old slope, compute the new one, move against it. backward() is backpropagation; you may have seen it, if not: PyTorch finds every weight's slope for you. → (3): changing the optimizer is one line.

**Ask:** Could zero_grad go between backward and step?

**Answer:** No: it would wipe the fresh slopes, so step would move nothing.

AdamW is Adam with weight decay done properly.


---

## 7 · The training loop, live — 35 min (1:33–2:08)

### Slide 28 · The five beats of one training step

*On screen:* Every training step is the same five lines *(5 build steps)*

**Time:** 4 min

**Say:** Model, loss and optimizer come together in five lines that run once per batch, thousands of times. Say them with me: clear, forward, loss, backward, step.

**Do:** Press → five times; the right side shows each line acting on the real 2-8-8-1 Kobe network, 64 shots:

- **1** wipe the old gradients.
- **2** shots flow left to right; dark neurons fire a lot.
- **3** one loss for the batch, about 0.7 (coin flip: 0.69).
- **4** magenta = gradients: which way each of the 105 weights should move to lower the loss; thicker = more to blame (backpropagation, done by PyTorch).
- **5** every weight moves a little (thick magenta: moved most); the batch loss drops, 0.695 → 0.664.

**Ask:** Which line actually changes the weights?

**Answer:** Only opt.step(); backward() only computes gradients.

The demo uses plain SGD with a big learning rate so one step is visible; real Adam steps are tiny, hence about 9,000 of them.

### Slide 29 · Live coding: the notebook

*On screen:* Now we build it, cell by cell

**Time:** 3 min (1 for the slide, 2 for Part 3)

**Say:** Now we run it in PyTorch, one cell at a time, and you predict before every run. I will also make four mistakes on purpose, the ones that cost points in competitions.

**Do:** Open notebooks/01_live_coding.ipynb (big font, light theme); its saved outputs are the numbers to expect. Run Parts 0 and 1, skip 2, run 3. Point at the raw coordinates in the hundreds: mistake 1.

**Ask:** What fraction of Kobe's shots went in?

**Answer:** About 45%, so "always miss" is right about 55% of the time: the floor to beat.

Mistakes 2 and 4 have no slide; the next slides' notes say when to run them.

### Slide 30 · Live demo: scale your inputs

*On screen:* Does plain SGD care about raw inputs?

**Time:** 2.5 min (+2 for notebook Part 4)

**Say:** The same 2-8-8-1 network, training live on 3,000 of Kobe's shots: orange means "likely in", blue "likely miss". It uses plain SGD on the raw coordinates.

**Ask:** Will it beat "always miss" (54.6% on these shots)?

**Do:** 1) Train: it stays at 54.6%, one pale colour: "miss" for every shot. 2) "scaled inputs", Train: about 60%, an orange spot at the rim. 3) "Adam": raw and scaled both reach about 60%; Adam hides the problem.

**Answer:** No: huge inputs make huge first steps and the network gets stuck on one answer. Scaling (minus the training mean, divided by the training std) fixes it.

**Do:** Notebook Part 4: ask "a fresh network says 50/50; what should its first loss be?" About 0.69. Raw coordinates print 2.36; scaled, 0.69.

### Slide 31 · The script, part 1: setup

*On screen:* Before the loop: data, model, loss, optimizer *(5 build steps)*

**Time:** 1.5 min

**Say:** Everything before the loop: tensors, an 80/20 split, scaling with the training statistics, the model, the loss and the optimizer. Twelve lines.

**Do:** Press → five times; the right side shows each result. In the notebook these lines are spread over Parts 3 to 5.

- **unsqueeze(1)** makes y shape (25000, 1), like the model's output (Part 8 breaks this on purpose).
- The model ends **without a sigmoid**: BCEWithLogitsLoss applies it itself, safely.

**Ask:** How many numbers will Adam be adjusting?

**Answer:** 105: 24 + 72 + 9, as we counted for the 2-8-8-1.

### Slide 32 · The script, part 2: the loop

*On screen:* The loop: epochs, batches, five beats *(4 build steps)*

**Time:** 3 min (including running it)

**Say:** Two loops. The outer one runs over epochs, every training shot once; the inner one cuts the shuffled shots into batches of 64, and every batch gets the five beats.

**Do:** Press → four times, then run the loop in notebook Part 5 (about 10 s). It prints the last batch's loss each epoch: noisy, between 0.61 and 0.78, ending at 0.640. The next cell: validation loss 0.6655.

**Ask:** Batch size 128 instead of 64, still 30 epochs: what happens to the number of steps?

**Answer:** It halves (4,710 instead of 9,390): less learning in the same epochs. Count steps.

20,000 / 64 = 312.5, so 313 batches; the last has 32 shots. (The batch slide used the full Kaggle file, hence 322.)

### Slide 33 · Kobe results: baselines vs MLP

*On screen:* Will 105 weights beat “always miss”? *(4 build steps)*

**Time:** 2 min (+2 for notebook Part 6)

**Ask:** Always guessing 45% gives validation loss 0.686. Will our network beat it, by a lot or a little?

**Do:** Run the baseline cell of notebook Part 5 (the same three rows), then press → four times.

**Answer:** By a little: 0.665 against 0.686, 60% against 56% accuracy ("always miss" is 56% on these validation shots). Logistic regression is in between; you may have seen it, if not: it is one neuron, so only a straight boundary.

**Say:** Is 60% bad? No: even at the rim Kobe made fewer than two in three, so position alone cannot do much better.

**Do:** Then notebook Part 6, mistake 2 (no slide): delete opt.zero_grad() and predict. No error, but accuracy about 44%: it calls every shot "made", worse than "always miss", because each new gradient is added to the old ones.

### Slide 34 · Cliffhanger reveal: two sigmoids

*On screen:* Two sigmoids: normal loss, broken model *(4 build steps)*

**Time:** 3 min (+2 for Part 8 if time)

**Say:** Before the break you voted: a sigmoid at the end of the model, plus BCEWithLogitsLoss. Crash, normal, quietly worse, or NaN? Let's run it.

**Do:** Re-vote, run notebook Part 7 (about 10 s), then press → once per result:

- 1: printed loss 0.68, looks normal.
- 2: accuracy 61.7%, like the correct model.
- 3: 76% of its outputs are under 1%; none above 99%.
- 4: true log loss (the competition metric) about 4.5, against 0.665.

**Answer:** Quietly worse: normal-looking numbers, garbage probabilities.

**Say:** The loss adds its own sigmoid, so it only sees chances between 50% and 73%; to push a miss lower, the network drives its output to 0. Fix: drop the model's sigmoid, or keep it and use nn.BCELoss.

**Do:** If time, Part 8 (mistake 4, no slide): without .unsqueeze(1), BCEWithLogitsLoss crashes clearly; MSELoss silently gives 1.33 for perfect predictions.

### Slide 35 · Evaluate correctly

*On screen:* Measure on validation, without gradients *(4 build steps)*

**Time:** 1.5 min

**Say:** Last piece: measure on validation shots the model never trained on. Three habits: evaluation mode, no gradient tracking, and turning scores into decisions.

**Do:** Press → four times; in the notebook these lines are evaluate() at the start of Part 5.

- **model.eval()**: test mode for layers like dropout; our net has none, but build the habit.
- **torch.no_grad()**: no gradients needed: faster, less memory.
- **logits > 0**: a score of 0 is exactly 50%, so no sigmoid is needed.
- Share predicted "made" (0.35): if 0 or 1, the model is a constant.

**Ask:** It says "made" for only a third of the shots, but Kobe made 45%. Bug?

**Answer:** No: it says "made" only where the chance is above 50%, near the rim; elsewhere "miss" is the best guess.


---

## 8 · Generalization and debugging — 15 min (2:08–2:23)

### Slide 36 · Train, validation, test

*On screen:* Grade the model on shots it never saw *(3 build steps)*

**Time:** 1 min

**Say:** A model is only useful on shots it has never seen, so we split the data like a school year. Training shots are homework; validation shots are a mock exam for choosing settings, like the learning rate or when to stop. The test set is the real exam: the grader keeps it hidden and scores it once.

**Do:** Press → three times.

**Ask:** You try 50 settings and keep the best validation score. Is that score still honest?

**Answer:** Slightly too optimistic: you picked the luckiest of 50. That is why the hidden test set exists.

Scale with the mean and spread of the training shots only. The slide's 20,558 / 5,139 come from Kaggle's labelled shots; the notebook's task file splits 20,000 / 5,000.

### Slide 37 · Overfitting, live

*On screen:* A big net on 12 points memorises the noise

**Time:** 2 min

**Say:** Twelve noisy points from a smooth dashed curve, and a big network with about a thousand weights. The hollow dots are validation points it never trains on; magenta is the training loss, black the validation loss.

**Ask:** If we train for a very long time, what happens to each loss?

**Do:** Take two or three answers, then press **Train** (about 10 s): both losses fall, then the curve bends through every black point and validation turns up. Press **Restore best**. Then choose **80 points** and train again: the curves stay close.

**Answer:** Training loss goes to about 0: it memorises the noise. Validation is best early (about 0.10), then climbs to about 0.27.

Like memorising last year's exam: perfect on that paper, bad on a new one.

### Slide 38 · Five cures for memorising

*(5 build steps)*

**Time:** 1.5 min

**Say:** The patient: a net about 600 times bigger than the Kobe net, trained on only 500 shots. Its validation loss climbs to 1.23, worse than a constant guess (0.69). Five standard cures, with what each did on Kobe.

**Do:** Press → five times, about 15 s each; spend longest on 3 and 5.

- **Stop early**: save the weights whenever validation is the best so far (the "Restore best" button).
- **Weight decay**: every step shrinks each weight a little toward 0.
- **Dropout**: random neurons off at every step, like the rotating bank tellers from the break game.

**Ask:** Which cures can you not use much on Kobe?

**Answer:** More data and a smaller model: the rules fix both. The 105-weight Kobe net barely overfits, so keep the best checkpoint.

Notebook Part 10, same story: 1.35 at the end, best 0.678 at step 10.

### Slide 39 · Loss-curve doctor

*On screen:* Loss-curve doctor: what went wrong? *(6 build steps)*

**Time:** 2 min

**Say:** Reading a loss curve is the most useful debugging skill of today. Magenta is the training loss, black the validation loss; the 0.69 mark is a net that knows nothing. Write one word per card, then we check.

**Do:** 45 s of silent writing, then press → six times; ask one student before each click.

1. **lr too high**: spikes, drifts up. Divide it by 10.
2. **Overfitting**: keep the best checkpoint.
3. **lr too low**: a slow straight line. ×10, or train longer.
4. **Learned nothing**: flat at 0.69. Look for a missing `step()` or `zero_grad()`, unscaled inputs, shuffled labels.
5. **Very noisy**: bigger batch or smaller lr.
6. **Healthy**: validation a little above training is normal.

The six curves are hand-drawn sketches, not real runs.


---

## 9 · Olympiad playbook and the two tasks — 30 min (2:23–2:53)

### Slide 40 · Task 1: Kobe, will this shot go in?

*On screen:* Kobe: will this shot go in?

**Time:** 30 s

**Say:** Task one. Kobe Bryant took 30,697 shots in 20 seasons, each logged with its position on the court, and you get 25,000 of them marked "went in" or "missed". From the position alone, predict whether a shot goes in.

**Do:** Point at the court: every dot is one shot seen from above, hoop at the bottom; orange = made, blue = missed (800 shown). Let them notice the pile right under the basket.

Source: China's national AI olympiad (NOAI 2024, round 2, problem 1), built on Kaggle's "Kobe Bryant Shot Selection" data. Kobe died in a helicopter crash in 2020; if it comes up, mention it calmly, no jokes.

### Slide 41 · The rules

*On screen:* The rules: a tiny net, raw inputs *(4 build steps)*

**Time:** 1.5 min

**Say:** The rules are strict on purpose. The network sees only loc_x and loc_y, and they arrive raw, in tenths of a foot. The statement says "already normalized", but x runs from −250 to 248 and y from −44 to 791.

**Do:** → 1: 2-8-8-1 (105 numbers) is the biggest legal net. → 2: only these activations; name the layers (self.fc1, …), since nn.Sequential scores 0. → 3: a zip with the class and the weights. → 4: accuracy on hidden shots; board A is live, board B is final.

**Ask:** Can you add the column shot_distance as a third input?

**Answer:** No: the grader passes exactly two columns. It would not help anyway: it is computed from x and y.

Keep the baseline's class name MyModel and its final nn.Sigmoid.

### Slide 42 · Predict the best possible score

*On screen:* What accuracy can the best model reach? *(5 build steps)*

**Time:** 1.5 min

**Say:** Before anyone trains anything: what is the best accuracy possible here? Everybody write one number.

**Do:** Take two or three guesses (usually 70–90%), then one step per press:

- → 1: always "miss": free points.
- → 2: the best straight line. You may have seen logistic regression; if not: a model that can only cut the court with one straight line, so this is its limit.
- → 3: a legal 2-8-8-1 trained well: the ceiling.
- → 4: the best leaderboard; luck moves board scores by about ±1 point.
- → 5: even rim shots go in only 62.5%: the labels are partly luck.

**Ask:** Your friend gets 60.4% and you 60.9% on the live board. Who has the better model?

**Answer:** You cannot tell: the board's luck is bigger than the gap. Trust your validation split.

### Slide 43 · Hint: fold the scaling into fc1

*On screen:* Hide the scaling inside the first layer *(3 build steps)*

**Time:** 1 min

**Say:** The trap: you train on scaled inputs, but the grader feeds raw coordinates. So the scaling must live inside the weights. It is just "subtract, then divide", so it merges exactly into the first layer.

**Do:** Top: while training, x − 7, then ÷ 110 (y − 91, ÷ 88). → 1: you submit only fc1 with new weights. → 2: divide each weight by its input's spread, then shift the bias to match. → 3: raw inputs into the folded model must give the same outputs as scaled inputs into the original.

**Ask:** Is this exact, or an approximation?

**Answer:** Exact: subtract-and-divide followed by a linear layer is still one linear layer.

Code, inside torch.no_grad(): weight /= std (per input column), then bias −= weight @ mean; outputs match to 5 × 10⁻⁷.

### Slide 44 · Four ways to lose points on Kobe

*(4 build steps)*

**Time:** 1 min

**Say:** Four mistakes that cost points on this task, three of them from real public notebooks. None shows in the training loss: you only find out when the grader runs your zip.

**Do:** → 1: distance or angle inside forward() breaks the rules and gave us no gain; folding the scaling into fc1 is fine.

**Ask:** → 2: the class must end with nn.Sigmoid. Which loss do you train with?

**Answer:** nn.BCELoss on the Sigmoid output, or BCEWithLogitsLoss on the score before it. Never both: that is the cliffhanger bug (normal printed loss, real log loss about 4.5).

**Do:** → 3: write submission_model.py first and import it (one public notebook saved weights for a different shape). → 4: load the zip fresh, feed raw x, y, and check you get your validation accuracy.

### Slide 45 · Task 2: optimise the input, not the weights

*On screen:* Optimise the input, not the weights *(3 build steps)*

**Time:** 2 min

**Say:** Task two, "Operation Inversion". You get a frozen trained network and rows of inputs with its output y, but one input column was set to zeros. Recover that column.

**Do:** Left: in training the data is fixed and the weights move. → 1: in inversion the weights are frozen and the missing input moves downhill instead. Analogy: the model is a lock; we turn the key until it opens.

**Ask:** → 2: a network says "panda" (57.7%). We add invisible noise built from the gradient with respect to the input. What now?

**Answer:** → 3: "gibbon", 99.3% (Goodfellow et al., 2014): the same tool as our task.

Fredrikson et al. (2014) recovered a patient's missing genetic marker from a drug-dosing model this way. Our task numbers come from replicas we built; check the real statement.

### Slide 46 · Two toy inversions

*On screen:* One unknown: one answer, or two

**Time:** 2 min

**Say:** Two tiny versions of the task: the frozen "model" is a + 2b + c², and its output is 4.65. Each curve shows how wrong the output is for every value of the unknown; the magenta dots are the optimiser's steps.

**Do:** Left: before each **Run** ask "land, crawl, bounce or fly off?". lr 0.125 lands on 0.7 in one jump; 0.05 crawls; 0.25 bounces; 0.3 flies off. Right (Adam): start +0.1 → +1.5, start −0.1 → −1.5, both perfect; start 0 never moves (a flat hilltop).

**Ask:** We got +1.5, the true answer. Did gradient descent "know" it?

**Answer:** No: it rolled into whichever valley was downhill from the start. Two keys open the same lock.

Left: plain SGD settles only for lr below 0.25.

### Slide 47 · Skeleton code with TODOs

*On screen:* Your starting point: fill the TODOs *(5 build steps)*

**Time:** 1.5 min

**Say:** The shape of a first solution, incomplete on purpose: the three dots are for you.

**Do:** → 1: load and freeze the weights. → 2: find the zero column; only z learns. → 3: Adam moves each value about lr per step: lr 0.001 barely moves (MSE 0.43), lr 0.1 gives 0.024. → 4: without [:, 0], (N, 1) − (N,) silently becomes an N × N table (MSE 2.44, worse than zeros). → 5: check each row's leftover error; a grid of values (torch.linspace) shows rows with two answers.

**Ask:** Why .sum() over rows and not .mean()?

**Answer:** Each row is its own problem; with plain SGD, .mean() shrinks each row's gradient 1,000-fold. Adam does not care.

Our replica: all zeros scores 0 (MSE 0.968); this skeleton reaches 0.024 in under a second.

### Slide 48 · Plan before typing

*On screen:* Write your first three experiments *(1 build step)*

**Time:** 3.5 min

**Say:** Plan before you type. In pairs, write the first three experiments for each task, in order, in three minutes. One writes, the other checks: is there a baseline, a validation split, a number that says it worked?

**Do:** Press **Start** and walk around; look for plans with a big model and no baseline. At 0:00 ask two pairs to read a plan, then press → for the example.

**Ask:** Does your first experiment give a number to compare everything else with?

**Answer:** It should: for Kobe, "always miss" (55.3%) and a straight-line model (about 59%); for inversion, all zeros (MSE 0.968). A good Kobe net then lands near 61%.

Short on time: do it for Kobe only.


---

## 10 · Wrap-up — 7 min (2:53–3:00)

### Slide 49 · The whole lecture in one picture

**Time:** 2 min

**Say:** The whole lecture is one loop, with today's words on every box. Data is scaled, batched and split; the model is linear layers with activations between them; the loss is MSE for numbers and cross-entropy for yes/no or classes. Then loss.backward() finds the gradients and optimizer.step() moves the weights, with Adam at lr 1e-3 as the default start.

**Ask:** Ask two or three students to explain one arrow each, in their own words.

**Answer:** Good answers: the model makes a guess and the loss compares it with the label; backward works out which way to nudge every weight; the optimizer moves each weight a small step that way; we repeat and watch the validation loss.

### Slide 50 · Now: two tasks

*On screen:* Now: two tasks. Tomorrow: harder ones.

**Time:** 30 s

**Say:** Now you solve two olympiad tasks with exactly what we covered. Kobe: a tiny legal network that predicts from the position whether a shot goes in. Inversion: a frozen network and one zeroed input column, which you recover by changing the input instead of the weights.

**Do:** Hand out the task files and the starter notebooks (notebooks/02_kobe_starter, notebooks/03_inversion_starter). Remind them: baseline first, a validation split, save the best model. The magenta dashed arrow is the input that learns. Ask them to note what felt shaky; tomorrow's tasks are harder.

