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

**Say:** Today we go from the models you already know, which draw straight lines, to neural networks, which can learn almost any shape. Everything you see on these slides is computed live in this browser.

**Do:** Let the spiral on the right train while you talk. Point at it: two interleaved spirals, orange and blue. A network with 105 numbers inside is learning to separate them right now.

**Ask:** Could logistic regression separate these two spirals?

**Answer:** No. Logistic regression draws one straight line. By the end of the first hour you will know exactly why the network can and logistic regression cannot.

Keys: → / space next, ← back, P opens the presenter window (notes, timer, next slide), N shows notes on this screen, T toggles light/dark, F full screen, B black screen, O slide map, ? help.

### Slide 2 · Today's map

*On screen:* Three hours: theory, live demos, code

**Time:** 1 min

**Say:** Here is the plan. Roughly every ten minutes you will do something: predict what happens before I run a demo, compute something on paper, or write code. There is one break in the middle. The last part prepares you for the two tasks you will solve this afternoon.

**Do:** Point at the two tagged rows: "live code" (we write the training loop together) and "tasks" (the two problems you start today). Tell them to keep paper and a pen ready: many slides ask them to write a prediction before the answer appears.

Pacing: the presenter window (key P) shows the planned clock for every section and warns you when you are behind. If you are late, the safest places to cut are the extra demos in "Activations" (sigmoid towers, space warping) and the optimizer schedules slide.

### Slide 3 · Three ideas you need today

*(4 build steps)*

**Time:** 3 min

**Say:** Before we start, three ideas in plain words. You may know them already from classical ML; if so, this is a one-minute check. Everything today is built on these three.

**Do:** Press → for each card. After each one, ask a student to say it back in their own words.

1. **A model is a box with knobs.** Numbers go in (for Kobe: where the shot was taken), a guess comes out (the chance it goes in). The knobs are the model's weights. Different knob settings give different guesses. Logistic regression is a small box with three knobs; today's networks have hundreds.
2. **The loss says how wrong the guess was.** We compare the guess with what really happened and get one number. Small is good. Guessing 41% for a shot that went in costs more than guessing 90%.
3. **Training rolls downhill.** For every knob we can compute which direction makes the loss smaller (that is what the gradient tells us; backpropagation is the method that computes it for every knob at once). We turn each knob a small step that way, and repeat thousands of times. That is gradient descent.

**Ask:** If the loss goes up after a step, what went wrong?

**Answer:** The step was too big: we jumped over the bottom of the valley. The size of the step is the learning rate; we will play with it after the break.

If students already know all of this well, move on quickly. If they look unsure, draw the valley on the board (key W opens a blank whiteboard, D draws) and roll a "ball" down it by hand.

### Slide 4 · Predict: Kobe's shooting

*On screen:* 25,697 Kobe Bryant shots. What % went in? *(2 build steps)*

**Time:** 2 min

**Say:** Today's running example is real data: the shots Kobe Bryant took in his 20 NBA seasons, each with its position on the court. The basket is at the bottom of this picture. Orange dots went in, blue dots missed. This is also the data of your first task this afternoon.

**Do:** Everyone writes a number on paper first (15 seconds). Ask two or three students to say theirs out loud. Then → reveals 44.6%, and → again reveals the consequence.

**Ask:** If 44.6% went in, how often is a "model" right that always says "miss"?

**Answer:** 55.4% of the time (100 − 44.6), so about 55%. Remember this number: any model that does not clearly beat 55% has learned nothing. Later we will see that even the best possible model only reaches about 61%, because the same spot on the court produces both makes and misses.

Facts for the coach: the data is the Kaggle "Kobe Bryant Shot Selection" set: all 30,697 field-goal attempts from 1996 to his last game on 13 April 2016; 5,000 have a hidden label, which leaves 25,697 labelled shots. The dots are a random 800 of them. His regular-season career field-goal percentage was .447. Your task file has 25,000 of these shots (44.7% made). Kobe died in a helicopter crash in January 2020; mention it respectfully if it comes up, and never joke about it.


---

## 1 · Why neural networks? — 12 min (0:08–0:20)

### Slide 5 · Can one straight line do it?

*On screen:* Can one straight line separate the colours? *(1 build step)*

**Time:** 1.5 min

**Say:** Here is a toy dataset: orange dots in the middle, blue dots in a ring around them. You already know logistic regression. Its decision boundary is always one straight line. Question: can one straight line put all the orange dots on one side and all the blue dots on the other?

**Do:** Ask for a show of hands: "yes" or "no". Then press **Train**. The black line swings round for about a second and then stops moving: it stays straight. Point at the readouts: the loss stays near 0.68 and the accuracy stops at 59% (it started at 58%, so training bought almost nothing). Press → to show the answer. Press **Reset** and **Train** again if someone wants to see it twice: same result.

**Ask:** Why can't it do better, however long we train?

**Answer:** Every straight line leaves orange and blue dots on both sides. The orange dots are surrounded. Training longer only polishes the best line; it cannot bend it.

Maths, if a student asks: logistic regression computes p = σ(w₁x₁ + w₂x₂ + b). The 50% boundary is where w₁x₁ + w₂x₂ + b = 0, which is a straight line. Even the best possible hand-placed line only gets 71% here; logistic regression gets 59% because it minimises log loss, not accuracy, and on this nearly symmetric data the best it can do is shrug.

### Slide 6 · Fix 1: invent a feature (lift to 3-D)

*On screen:* Fix 1: lift the dots, then one flat cut works *(4 build steps)*

**Time:** 2 min

**Say:** First fix, and it is a trick you already know from classical ML: invent a new feature. Give every dot a height: the further it is from the centre, the higher we lift it. The orange dots in the middle stay low, the blue ring goes up high. Now a flat sheet slides between them, which is just a linear model in 3-D. Look at where the sheet cuts the bowl and drop that back onto the floor: it is a circle. A straight cut in the new space is a curved boundary in the old one.

**Do:** Press → once: the dots rise and the camera tilts (about one second). Drag on the picture with the mouse to spin the bowl so everybody sees the gap. Press → for the sheet, → for the circle on the floor, → for the question.

**Ask:** Last step: which height would you invent for Kobe's court? For a spiral?

**Answer:** For Kobe, distance from the rim is a good guess, but you had to know basketball. For a spiral, nobody has a good guess. And in the Kobe olympiad task you are not even allowed to compute features yourself: the network gets only x and y, and may use only linear layers and activations. So the network must invent its features itself. That is the next slide.

Maths for the coach: the new feature is z = x² + y² (squared distance from the centre). Inner dots have z ≤ 0.25, outer dots z ≥ 0.50, so the sheet at z = 0.36 separates them perfectly, and x² + y² = 0.36 is a circle of radius 0.6. This is the idea behind kernel methods (SVMs) too.

### Slide 7 · Fix 2: a hidden layer learns the features

*On screen:* Fix 2: four neurons, four lines, one shape *(1 build step)*

**Time:** 2.5 min

**Say:** Second fix: instead of inventing the feature, let the network learn it. Take four logistic regressions side by side. That is the hidden layer: the four small squares on the left. Each one can only draw a straight line, orange on one side, blue on the other. Then one more logistic regression on top combines the four answers.

**Ask:** Before training: each small square can only ever be split by one straight edge. What shape will the big picture make out of four of them?

**Answer:** Take guesses, do not confirm yet. (Answer after training: the four edges join into one closed fence around the orange dots. Here the sides come out unequal, so it looks like a rounded triangle with one corner cut off; that is fine, any closed shape works.)

**Do:** Press **Train**. The shape forms in about 4 seconds and is finished (100%) in about 5; it keeps polishing for a while after. Point first at the small squares: each is still a straight edge, but the edges move to different sides of the orange disc. Then point at the big picture: the four edges together fence in the disc, each small square supplying one side of the fence. Trace each side with your finger and point to the small square it comes from. Press → to show the answer. Press **Reset** and **Train** again if you want a second look.

**Ask:** The small squares are straight edges. How does the big picture become round?

**Answer:** The last neuron adds up the four answers and says "orange" only where all four agree that you are on the inside. Four straight walls around the centre make a closed shape. More neurons give more walls, so a smoother shape. This is the "how many lines would you need" answer from the Kobe slide.

Behind the picture: the network is 2-4-1 with tanh in the hidden layer, trained with Adam (learning rate 0.01, one full-batch step per frame) on the full 300 points. The colours in the small squares show each neuron's output: orange where it is positive, blue where it is negative. The hidden layer has learned new features (four "which side of my line are you on" scores); the last layer is ordinary logistic regression on those features. Misconception to head off: hidden neurons are not little brains and need not mean anything; here they just happen to be readable.


---

## 2 · From one neuron to an MLP — 18 min (0:20–0:38)

### Slide 8 · One neuron: weigh, add, bend

*On screen:* A neuron: weigh the inputs, add, bend

**Time:** 2 min

**Say:** You already know one neuron: it is logistic regression. It takes the inputs, multiplies each one by its own weight, adds them up together with a bias, and then bends the result with an activation function. With a sigmoid as the bend, this is exactly logistic regression. Inside a network we usually bend with ReLU instead: keep positive sums, turn negative sums into zero.

**Do:** The inputs are fixed at 1 and 2. Point at the three steps: weigh (the numbers on the arrows), add (the circle shows 0.5 + 2 − 1 = 1.5), bend (ReLU keeps 1.5). Then drag "weight 1" down to −2: the sum becomes −1 and the output snaps to 0. Say: "the neuron is off". Drag it back. Click "sigmoid": the output becomes a probability between 0 and 1. Orange arrow = positive weight, blue arrow = negative weight, thickness = size.

**Ask:** With ReLU, what is the output if the sum is −3? And if the sum is +3?

**Answer:** 0 and 3. ReLU(z) = max(0, z). Negative sums are switched off, positive sums pass through unchanged.

The maths, if a student asks: z = w₁x₁ + w₂x₂ + b, output = φ(z), where φ is ReLU or σ. The bias is just a weight on an input that is always 1, which is why it is drawn as a box with a 1 in it.

History in one breath: McCulloch and Pitts (1943) described the first artificial neuron, a yes/no threshold unit computing logic. Rosenblatt's perceptron (1958) was one such neuron that learned its weights. Do not say "it works like a brain cell": a 2021 study needed a 5–8-layer network to imitate a single real cortical neuron.

### Slide 9 · One neuron cuts the court with a line

*On screen:* One neuron cuts the court with a straight line

**Time:** 2 min

**Say:** Now feed the neuron every position on Kobe's court. The colour shows the neuron's answer: orange where it says "made", blue where it says "missed". Whatever weights you choose, the border between the two colours is always a straight line. The arrow shows which side is orange. One neuron can only ever cut the court in two with one straight cut.

**Do:** "turn" rotates the arrow (this changes the two weights), "shift" sets how far the line is from the rim (this changes the bias; a negative shift puts the rim on the blue side), "steepness" makes the colour change sharp or soft (all weights bigger or smaller). Start: the line is 10 ft out and the neuron says "made" for everything closer. Read the accuracy aloud: 54.5%, worse than "always miss" (55.4%)! Then let a student direct you: "turn it, shift it, beat 55%". The best they can find is about 59%: turn about −90°, shift about 1 ft, a line hugging the rim, i.e. "made only if almost under the basket" (about 4,200 of the 25,000 labelled shots are at the rim itself and Kobe made 62% of them). Switch to ReLU once: the far side becomes plain paper, the neuron is simply off there.

**Ask:** Kobe scores near the rim and misses far away, in all directions. Can one straight line separate "near" from "far"?

**Answer:** No. "Near the rim" is a half-disc, and its border is curved. The best single line gets about 59% on these shots, only a little above "always miss" (55%). The 2-8-8-1 network we build later gets about 61%. We need several lines combined: a hidden layer.

Background: the line is where the sum is exactly 0 (w₁x + w₂y + b = 0). The arrow is the weight vector (w₁, w₂); it is always perpendicular to the line. The bias moves the line without turning it. Bigger weights do not move the line, they only make the transition sharper. Inputs here are court positions in units of 10 ft, the accuracy is measured on the 6,000 Kobe shots stored in the deck (500 are drawn).

### Slide 10 · Count the parameters

*On screen:* How many numbers does 2-8-8-1 learn? *(5 build steps)*

**Time:** 2 min

**Say:** Every arrow is one weight, and every neuron after the inputs has one bias. Learning means finding good values for all of these numbers. Let's count them for the network you will build for the Kobe task: 2 inputs, two hidden layers of 8, one output.

**Do:** Press → for each layer and let the room call out the number first. Step 1: 2×8 weights + 8 biases = **24**. Step 2: 8×8 + 8 = **72**. Step 3: 8×1 + 1 = **9**, total **105**. Then give pairs 1 minute for the two questions on the right, and reveal: step 4, 2-16-1 = 2×16 + 16 + 16×1 + 1 = **65**; step 5, 784-128-10 (an MLP for 28×28 digit images) = 784×128 + 128 + 128×10 + 10 = **101,770**.

**Ask:** 2-16-1 has fewer parameters than 2-8-8-1 (65 vs 105). Is it allowed in the Kobe task?

**Answer:** No. The rule is "at most 3 linear layers, at most 8 neurons in each", not a parameter budget. 16 neurons in one layer breaks it, and a rule-breaking submission scores 0. 2-8-8-1 is the largest legal network.

Rule of thumb: nn.Linear(in, out) has in × out + out parameters. In PyTorch, check with sum(p.numel() for p in model.parameters()). All counts verified in PyTorch.

### Slide 11 · Forward pass, animated

*On screen:* Click a spot: the numbers flow through

**Time:** 2 min

**Say:** This is a real 2-8-8-1 network, the largest the Kobe task allows, already trained on 20,000 of Kobe's shots. The court colour is its answer everywhere: orange where it thinks he scores more often, blue where he misses more. Click a spot and watch the forward pass: the position goes in on the left, each layer does weigh-add-bend, and a chance comes out on the right.

**Do:** It starts on a mid-range shot from the left elbow (about 41%). Click "Rim": about 60% (the inputs are 0 there, so the first arrows carry nothing and only the biases matter). Click "Corner 3": about 35%. Click "Half court": about 5%. Then click anywhere on the court. Point out: thick orange arrows push the next neuron up, thick blue ones push it down, dotted ones carry nothing because the neuron before them is off (0). Yellow fill = how strongly a neuron fires. The number in the output circle is the raw score (logit); the sigmoid turns it into the percentage. "Real shot" picks one of Kobe's real shots and shows what really happened. Optional: "lines on" draws each first-layer neuron's straight cut on the court; the curved orange zone near the rim is built from these straight cuts.

**Ask:** Even at the rim the network only says about 60%. Is the network bad?

**Answer:** No, basketball is noisy. Kobe made only 62% of his shots at the rim, so no model can be sure. This network is right about 61% of the time, versus 55% for "always miss". That is close to the best anyone gets from position alone (the best real Kobe-task scores were about 62%).

Background: inputs are the court position in units of 10 ft (x across, y away from the rim), so the rim is (0, 0) and half court is y ≈ 4.1. (In the Kobe task the grader feeds the raw numbers, in tenths of a foot; the network must cope with that.) Some hidden neurons show 0 for every position you click: they are "dead" ReLUs (one in the first layer, two in the second), which is common and is discussed in the activations section. The weights were trained in PyTorch with Adam (lr 0.01, 25 epochs, batch 64) on 20,000 shots; on all 25,000 labelled shots it scores accuracy 60.9%, log loss 0.664 (validation about 61–62%, log loss 0.66).

### Slide 12 · An MLP in PyTorch

*On screen:* The same network, in PyTorch *(4 build steps)*

**Time:** 2 min

**Say:** Here is the Kobe network as PyTorch code. A model is a class with two parts. __init__ builds the parts: three linear layers and two ReLUs; this is where the 105 numbers live. forward says the route the data takes through the parts. You never call forward yourself: you write model(x) and PyTorch calls it for you.

**Do:** Step 1 highlights __init__ (the parts list on the right). Step 2 highlights forward (the arrows appear: the route). Step 3: create the model, feed 32 random shots: the output shape is (32, 1), one number per shot, and the parameter count is 105, the same as we counted by hand. Step 4: the Kobe-task warning.

**Ask:** The last line returns fc3(x) with no sigmoid. Is that a bug?

**Answer:** No, it is deliberate. The model outputs a raw score, a "logit"; the loss function BCEWithLogitsLoss applies the sigmoid inside, in a numerically safe way. To get a probability for a report, use torch.sigmoid(model(x)). (The loss section explains this; the Kobe grader only measures accuracy, so a final nn.Sigmoid is also acceptable there.)

Kobe task rules to repeat now: only linear layers with allowed activations after them (ReLU, Sigmoid, Tanh, ELU, LeakyReLU, PReLU), at most 3 linear layers with at most 8 neurons each, and build the layers directly as attributes like this. A model wrapped in nn.Sequential gets a score of 0 because the checker cannot see inside it. The official baseline class is called MyModel with no constructor arguments; keep that name. The code on this slide was run in PyTorch: printing the model lists fc1, act1, fc2, act2, fc3, and the counts match.


---

## 3 · Activations: any function — 18 min (0:38–0:56)

### Slide 13 · No activation: still one line

*On screen:* No activation: 105 weights, still one line

**Time:** 2 min

**Say:** Let us check the vote with a real network. This is a 2-8-8-1 network, 105 weights, with no activation between the layers. Watch what it does with the circle.

**Do:** Press Train. The boundary stays one straight line and the accuracy gets stuck at 59% (the line can only slice off part of the blue ring): all 105 weights behave like one neuron. Press Pause. Now click **ReLU** under "between the layers" and press Train again: within about a second the boundary bends around the orange disk and the accuracy reaches 100%. Optionally try **tanh**: a smooth round boundary.

**Ask:** What exactly did we change between the two runs?

**Answer:** Only one thing: a bend (the activation) after each hidden neuron. Same data, same 105 weights, same optimizer. The bend is what lets depth add power.

Why it works: with ReLU every hidden neuron becomes "a line, but flat on one side". Combining many such bent ramps gives polygons, which is why the ReLU boundary looks slightly angular.

### Slide 14 · The activation zoo

*On screen:* Any bend will do: the activation zoo *(1 build step)*

**Time:** 1.5 min

**Say:** So we need a bend after each neuron. Any bend works; these are the five you will meet. ReLU: zero for negative inputs, the input itself for positive ones. Leaky ReLU: the same, but with a small slope on the left. Sigmoid: squashes everything into 0 to 1. tanh: the same S-shape, but from −1 to 1. GELU: a smooth ReLU, used in transformers like ChatGPT.

**Do:** Press → to show the magenta dashed curves: the **slope** of each activation. Then sweep the pointer from left to right across the sigmoid plot and stop at the middle.

**Ask:** Look at the sigmoid's slope. What is the largest it ever gets?

**Answer:** 0.25, at input 0 (the readout says 0.25). Far from 0 the sigmoid is flat and its slope is almost 0. ReLU's slope is exactly 1 for every positive input. Keep this in mind: during backprop every layer multiplies the gradient by this slope, which will matter in five minutes.

Background: σ(z) = 1/(1+e^(−z)); tanh(z) = 2σ(2z) − 1; ReLU(z) = max(0, z); Leaky ReLU is drawn with slope 0.1 on the left so it is visible (PyTorch's default is 0.01); GELU(z) = z·Φ(z) has a small dip, minimum −0.17 near z = −0.75. Analogy that works: ReLU is a one-way valve (a diode, hence the name "rectifier"). Avoid saying "the activation decides whether the neuron fires": modern activations are continuous, not on/off switches.

History in one sentence: ReLU-like units go back to Fukushima in 1969; the name "rectified linear unit" comes from Nair and Hinton in 2010; in 2012 AlexNet reported that ReLU reached its training target six times faster than tanh.

### Slide 15 · Any curve from hinges

*On screen:* More hinges, any curve *(2 build steps)*

**Time:** 1.5 min

**Say:** The hat was one building block. Now the dashed curve is any wiggly curve, and each dot is a hinge: one hidden ReLU neuron. With only three hinges the best we can do is a rough zig-zag. Watch the thick line as we add hinges.

**Do:** Press → for 8 hinges, → again for 32 (or click the numbers under "hinges"). The readout "error" (mean squared error) drops from 0.07 (3 hinges) to 0.002 (8) to 0.000005 (32): the dashed curve disappears under the thick line. With ≤ 8 hinges the faint lines show each neuron's own ramp.

**Ask:** If I want the error ten times smaller, what do I do?

**Answer:** Add more hinges, that is, more neurons in the hidden layer. One hidden layer is a "connect-the-dots machine": every extra neuron is an extra dot where the line may bend.

How the weights are chosen here: the hinge positions are evenly spaced, and the output weights are the best possible ones (least squares, solved exactly in the browser). On the next slides gradient descent will have to find them on its own. Analogy that works: Lego skyline. With enough thin bricks you can copy any skyline.

### Slide 16 · Gradient descent finds the hinges

*On screen:* Training finds the hinges by itself

**Time:** 1.5 min

**Say:** So far we placed the hinges by hand. A real network starts from random weights and must find them with gradient descent, the same training you know from logistic regression. Here is a 1-4-1 ReLU network learning the dots.

**Do:** Press Train: with 4 neurons the line gets the rough shape but cannot follow the wiggles; the error stops at about 0.014. Click **2 neurons** (it restarts by itself; press Train only if the button says Train): worse, it stops at about 0.06. Click **8 neurons**: about 0.005, still worse than the 8 hand-placed hinges on the previous slide (0.002). Click **32 neurons**: within a second it is close (0.001), it lingers there for a few seconds, then drops to about 0.0001 and stops after 5 to 7 seconds (9,000 epochs). Point at the corners in the thick line: those are the hinges the network found by itself.

**Ask:** With 2 neurons the error stays at 0.06 however long we train. Why?

**Answer:** Two ReLU neurons give at most two bends, and this curve needs more. Training can only find what the network is able to draw. And with 8 neurons it could have matched our hand-placed hinges but ended a bit worse: gradient descent walks downhill from where it starts and can settle in a slightly worse spot. Enough neurons make a good fit possible; they do not promise that training finds it. That is the theme of the next slide.


---

## 4 · Loss: how wrong are we? — 12 min (0:56–1:08)

### Slide 17 · Squared error: big misses cost the most

**Time:** 1.5 min

**Say:** The loss is one number that says how wrong the model is. Training means making that number small, nothing more. Here is the simplest one. We predict a number: what share of Kobe's shots go in, from how far away he shoots. The dots are the real answers from 25,697 of his shots. The black line is our model.

**Say:** For every dot we take the miss, the vertical gap between the dot and the line, and draw a square on it. The loss is the average size of those squares. That is the mean squared error.

**Do:** Start: the line is flat at 44%, a model that ignores distance. Point at the huge square at 0–4 ft (Kobe makes 62% there): one big miss dominates. Drag an end dot to tilt the line and show that squares grow and shrink. Then press **Fit the line**: the line tilts until the total area is smallest (loss 64 → 18). Reset if you want to replay.

**Ask:** A miss of 10 points costs 100. What does a miss of 20 points cost?

**Answer:** 400, four times as much, not twice. Squaring makes big misses very expensive, so the line works hardest to avoid them.

Background for you: MSE = average of (prediction − target)². PyTorch: `nn.MSELoss()`. It is the loss for predicting numbers (regression), which is what the inversion task's frozen model does. The "Fit" button runs gradient descent on the loss, the same thing every training run does. The numbers are percentage points squared, so don't worry about units: only "smaller is better" matters. If a student asks about outliers: because of the squaring, one crazy data point can pull the line a lot; other losses (absolute error, Huber) are gentler.

### Slide 18 · Confident and wrong costs the most

*(5 build steps)*

**Time:** 2.5 min

**Say:** For yes/no questions the model gives a forecast, like a weather forecaster: "90% chance it goes in." Kobe takes the shot and it goes in. How should we punish the forecast? Four forecasters said 90%, 50%, 10% and 0.1%. Rank them from best to worst, and guess how much worse the last one is than the first.

**Do:** Give 60 seconds: students rank the four forecasts with a neighbour and guess the loss numbers. Then press → four times: each press reveals one forecast's loss and grows the curve. The last press is the dramatic one: 0.1% costs 6.91, 66 times the loss of the 90% forecaster.

**Say:** A hesitant wrong answer (50%) costs 0.69. A confident wrong answer (0.1%) costs almost 7, and saying exactly 0% would cost infinity. That is why a model trained with this loss learns to be honest about uncertainty: Kobe is a noisy shooter, so a good model rarely says more than about 60%.

**Do:** Fifth press: a slider and a "went in / missed" switch appear. Drag the forecast; flip to "missed" and the curve mirrors: now a high forecast is the expensive one.

**Ask:** The shot is missed and the forecast was 90%. What is the loss?

**Answer:** 2.30, the same as forecasting 10% for a made shot: the loss only looks at the chance you gave to what really happened.

Background: this is binary cross-entropy, also called log loss: loss = −ln(chance you gave to what happened), averaged over all shots. Values: 90% → 0.105, 50% → 0.693, 10% → 2.303, 0.1% → 6.908 (natural log). It is the official metric of the Kaggle Kobe competition. "Surprise meter" is a good image: the loss is how surprised the model was. It is the same loss as in logistic regression, which they know.

### Slide 19 · Pick the loss from what you predict

*(4 build steps)*

**Time:** 2 min

**Say:** Three kinds of questions cover almost every task you will meet, and each has its loss. Before each row appears, ask the class to name the loss.

**Do:** → Row 1: predicting a number (a price, a temperature, the inversion task's output). One output, mean squared error, the squares from the first slide.

**Do:** → Row 2: yes/no (Kobe: in or out). One score, BCEWithLogitsLoss, the log loss we just saw. The target is 0. or 1. as a float.

**Do:** → Row 3: one of K classes, for example what kind of shot Kobe took (jump shot, layup, dunk, other). The model gives K scores, one per class. Point at the bars: scores 0.5, 2.0, 1.0, −1.0 become 14%, 61%, 22%, 3%. That conversion is called softmax: the biggest score gets the biggest share and the shares add up to 100%. The loss is again "−log of the chance given to the right answer": if it was a layup, −ln 0.61 = 0.50.

**Do:** → The rule under all three: the model ends with a plain linear layer. No sigmoid, no softmax: the loss does that part.

**Ask:** You predict which of 10 digits is in an image. How many outputs, and which loss? What is the first loss of an untrained network?

**Answer:** 10 scores, nn.CrossEntropyLoss. Untrained: 10% for each class, loss = −ln 0.1 = 2.30 (the same sanity check as 0.69 for yes/no).

Background: softmax(z)ᵢ = e^(zᵢ) / Σⱼ e^(zⱼ): make every score positive with exp, then divide by the total. CrossEntropyLoss takes the raw scores, shape (N, K), and the class numbers as integers (0 … K−1), shape (N,), not one-hot. BCEWithLogitsLoss wants targets with the same shape as the scores, (N, 1), as floats. A 2-class softmax is the same as one sigmoid, so for yes/no use one score.

### Slide 20 · Cliffhanger: sigmoid + BCEWithLogitsLoss

*On screen:* A sigmoid at the end. What happens? *(2 build steps)*

**Time:** 2 min

**Say:** Last question before the break. A classmate thinks: "my model should output a chance, so I'll put a sigmoid at the end", and keeps BCEWithLogitsLoss. What happens when they train? 1 crash, 2 trains normally, 3 trains but is quietly worse, 4 the loss becomes NaN.

**Do:** → highlights the two lines that matter (the sigmoid in the model and the loss). 30 seconds of silent thinking, then everyone votes with fingers at once. Note the rough counts on the board.

**Do:** → Discussion: one minute with a neighbour, ideally with someone who voted differently. Then vote again and write the new counts next to the old ones.

**Say:** Don't tell them the answer, even if they ask. Say: "We'll run it live after the break and you'll see." Leave the vote counts on the board.

**Do:** Hint you may give if the room is stuck: "Remember the logits slide: what does BCEWithLogitsLoss do first with whatever it receives?"

For you only (the reveal is in "The training loop, live"): the answer is 3. Nothing crashes and nothing is NaN. The loss applies a second sigmoid, so the chance it sees is σ(σ(z)), always between 50% and 73%. The printed loss looks normal and accuracy stays around 61%, but the real outputs become extreme (76% of them below 1% or above 99%), and the true log loss of what you would submit is 4.69 instead of 0.662. Good discussion arguments to listen for: "it double-squashes" (correct), "it crashes because of shapes" (no, shapes are fine), "NaN because log(0)" (no: whatever the model outputs, even exactly 0, the loss's own sigmoid turns it into at least 50%, so the log never sees 0).


---

## 5 · Break — 10 min (1:08–1:18)

### Slide 21 · Break: 10 minutes

*On screen:* True or bluff?

**Time:** 10 min

**Say:** Ten minutes of break. Stand up, drink water, look out of a window. When we come back we start with a game: ten claims about neural networks, and you decide for each one whether it is true or a bluff.

**Do:** The timer starts by itself when this slide appears (Pause or Reset if needed). Keep this slide on screen during the break: the timer only runs while the slide is visible. When it reaches 0:00 the numbers turn white on black.

The game is on the next two slides (5 claims each, about 3 minutes in total). It wakes everyone up after the break and repeats a few names they will hear again. If you are short on time, play only the first slide. If you are early at the end of the day, it also works as a filler.

### Slide 22 · True or bluff? (1–5)

*On screen:* True or bluff? *(5 build steps)*

**Time:** 1.5 min

**Do:** For each line: read the claim aloud, count "3, 2, 1, show!", students hold up a hand for **true** or a fist for **bluff**. Then press → to reveal the verdict and tell the one-line story below. Do not explain more than one sentence per claim.

1. **True.** New York Times, 8 July 1958: the US Navy showed "the embryo of an electronic computer that it expects will be able to walk, talk, see, write, reproduce itself and be conscious of its existence." The machine could only draw one straight line. Hype is old.
2. **Bluff.** Minsky & Papert's 1969 book *Perceptrons* proved that a network *without* hidden layers can't compute XOR. They knew a hidden layer could represent it but doubted it could be trained. People read the book as "neural nets don't work" and funding dried up for years. In section 2 we solved XOR with two hidden neurons.
3. **True.** Geoffrey Hinton (Reddit "ask me anything", 2016): the tellers at his bank kept changing; he guessed it was so that employees could not cooperate to cheat the bank. Randomly switching off different neurons on every example stops neurons from "conspiring", which reduces overfitting. That is dropout.
4. **Bluff.** Hebb's 1949 book describes the idea, but the catchy sentence comes from the neuroscientist Carla Shatz, in *Scientific American*, 1992. Famous quotes are often not by the famous person.
5. **True.** Krizhevsky, Sutskever and Hinton trained AlexNet for five to six days on two GTX 580 gaming cards and won the ImageNet competition in 2012 with 15.3% top-5 error against 26.2% for second place. That started the deep-learning boom.

### Slide 23 · True or bluff? (6–10)

*On screen:* True or bluff? *(5 build steps)*

**Time:** 1.5 min

**Do:** For each line: read the claim aloud, count "3, 2, 1, show!", students hold up a hand for **true** or a fist for **bluff**. Then press → to reveal the verdict and tell the one-line story below. Do not explain more than one sentence per claim.

1. **True** (as Quanta Magazine reports it). At OpenAI a team member went on vacation and forgot to stop a training run. Long after the network had memorised its training data, it suddenly started to generalise perfectly. "We got lucky… and by lucky, I mean forgetful." We meet grokking again in section 8.
2. **Bluff.** The "10-minute attention span" is a myth: studies (Wilson & Korn 2007, Bradbury 2016) find no fixed limit. Attention drops and comes back in short cycles, and doing something (predicting, voting, writing) brings it back. That is why this lecture makes you do something every few minutes.
3. **True.** Kingma & Ba's Adam paper (2014) had about 200,000 Google Scholar citations by March 2025, which made it number 4 of all 21st-century papers in the data behind a 2025 *Nature* ranking. It is the optimizer you will type this afternoon.
4. **Bluff.** In 2021 Beniaguev, Segev and London needed a deep network with five to eight layers to imitate one realistic model of a single cortical neuron. Artificial "neurons" are a cartoon of real ones; do not take the brain analogy literally.
5. **Bluff.** Augustin-Louis Cauchy described steepest descent in 1847, more than a century before neural networks. "Your optimizer's grandfather was born in 1847."

**Say:** Ask: "Who got 8 or more right?" Then move on to the after-break quiz.


---

## 6 · Gradient descent and optimizers — 15 min (1:18–1:33)

### Slide 24 · The learning rate, live

*On screen:* Too small crawls, too big explodes

**Time:** 2.5 min

**Say:** Same bowl, same ball, but now we let it run, and we change only one number: the learning rate. Below the bowl you see where the weight is after each step; the dashed line is the bottom.

**Do:** For each value, first ask "what will happen?", then click it and press **Run** (5 steps per second, at most 40 steps; **Reset** restarts). Order: **0.3** (the default when the slide opens), then **0.02**, then **0.9**, then **1.05**.

- **0.3**: big confident steps, at the bottom (within 0.01) after 7 steps.
- **0.02**: tiny steps; after 40 steps it is still 0.6 away (it needs 140 steps). Too small = slow, wasted time.
- **0.9**: the ball jumps over the bottom to the other wall every step (0 → 5.4 → 1.08 → 4.54 …) but each jump is smaller; it arrives after 26 steps. In the w-plot it zig-zags around the dashed line.
- **1.05**: every jump overshoots more than the last (0 → 6.3 → −0.63 → 6.99 …). It blows up. In real training this is the loss going to NaN.

**Ask:** Which learning rate would be fastest of all here?

**Answer:** 0.5: it lands exactly on the bottom in one step. Above 0.5 it starts to zig-zag; at 1 it bounces between 0 and 6 forever; above 1 it explodes. Steeper bowls lower all of these limits, which is why there is no universal "right" learning rate.

Background: the distance to the bottom is multiplied by (1 − 2·lr) at each step, so lr 0.9 (factor −0.8) is exactly as fast as lr 0.1 (factor +0.8). Goodfellow, Bengio and Courville's textbook: "If you have time to tune only one hyperparameter, tune the learning rate."

### Slide 25 · Epoch, batch, step

*On screen:* One step per batch, not per epoch *(3 build steps)*

**Time:** 2 min

**Say:** Three words people mix up. An **epoch** is one pass over all the training data: for Kobe, 20,558 shots. A **batch** is the small handful of shots we look at before taking one step: here 64. A **step** is one update of all the weights. So the network does not wait for the whole epoch: it takes a step after every batch.

**Do:** Step 0: the bar is all 20,558 training shots. → (1): cut into batches of 64: the zoom shows one batch (real Kobe shots, orange = made, blue = missed). Ask the class to compute the number of steps per epoch before you point at 322.

**Ask:** 20,558 shots in batches of 64: how many steps per epoch, and how big is the last batch?

**Answer:** 20,558 / 64 = 321.2, so 322 steps; 321 full batches use 20,544 shots, leaving 14 for the last batch. 30 epochs = 9,660 steps.

**Do:** → (2): the prediction question; take a vote. → (3): the answer from our real Kobe runs. The magenta bars are the number of steps (weight updates) each one took in 30 epochs; the loss is on the right.

**Say:** Same 30 epochs, but batches of 64 make 9,660 steps and reach validation loss 0.662. Using all shots at once makes only 30 steps, and the loss 0.688 is no better than always guessing 44.6%. Count steps, not epochs.

Why batches work: the slope from 64 random shots is a noisy but honest estimate of the slope from all shots, and it is 300 times cheaper. The noise makes the path wobble but it still goes downhill. Yann LeCun tweeted in 2018: "Friends dont let friends use minibatches larger than 32" (a joke with a point). Typical batch sizes for small tables: 32 to 256.

### Slide 26 · Race in a narrow valley

*On screen:* Plain descent zig-zags in a narrow valley *(2 build steps)*

**Time:** 2.5 min

**Say:** Now a 2-D loss surface seen from above, like a map with height lines. It is a long, narrow valley: very steep across, almost flat along. The bottom is the cross. Three classic optimizers race from the same start, 100 steps each.

**Do:** Step 0: only plain gradient descent (SGD, dotted path). Ask "predict the path", then press **Run**. It bounces from wall to wall and then crawls along the floor: after 100 steps it is still far from the bottom (loss 0.27).

**Do:** → (1) adds **momentum** (dashed) and starts the race again automatically; SGD is dimmed. → (2) adds **Adam** (solid). Use **Run**/**Reset** to replay.

- **Momentum** = a heavy ball. It keeps most of its previous velocity (90%), so the back-and-forth pushes cancel and the pushes along the valley add up. It overshoots past the bottom (to x ≈ +0.8), comes back, and ends far closer than SGD (loss 0.0003).
- **Adam** = every weight has its own cruise control. It measures how big each weight's slopes usually are and divides by that, so the steep direction is calmed down and the flat direction is sped up. It heads almost straight for the bottom (loss 0.003 after 100 steps).

**Ask:** Pair task (1 min, "optimizer charades"): one partner describes how each of the three would walk down a long narrow valley; the other names it.

**Answer:** SGD zig-zags across and crawls along; momentum builds up speed along the floor and overshoots a bit; Adam evens out the step sizes per direction and goes fairly straight.

Honesty notes. The learning rates here (0.019, 0.01, 0.1) are toy values for this toy surface, not the defaults for neural networks; for Adam the learning rate is roughly how far each coordinate moves per step, so 0.1 here means about 0.1 per step. Surface: 0.5(x² + 100y²), start (−5, 1.5), momentum β = 0.9, Adam β = (0.9, 0.999). These update rules match PyTorch's SGD, SGD(momentum=0.9) and Adam exactly. The idea of these races comes from Alec Radford's famous 2014 animations.

### Slide 27 · What to use: Adam, then tune lr

*On screen:* Start with Adam, lr 0.001 *(3 build steps)*

**Time:** 1 min

**Say:** In practice you never write the update by hand. You make an optimizer once, give it the model's weights and a learning rate, and inside the loop you call three lines: zero_grad, backward, step. They do exactly what our hand-written lines did, for every weight at once.

**Do:** → (1): the default. Adam with 0.001, then also try 0.003 and 0.0003 and keep whatever is best on validation. → (2): the three loop lines next to the manual version from the paper step (for plain SGD, step() is exactly w -= lr * w.grad; Adam does its smarter version). → (3): changing the optimizer is one line; the loop stays the same.

- **Adam** (Kingma and Ba, 2014) is one of the most cited papers of the century: about 200,000 Google Scholar citations, 4th of all 21st-century papers in the data behind Nature's 2025 ranking.
- Andrej Karpathy tweeted in 2016: "3e-4 is the best learning rate for Adam, hands down." It was half a joke; in his 2019 training recipe he really does start with Adam at 3e-4 because "Adam is much more forgiving to hyperparameters, including a bad learning rate".
- **AdamW** is Adam with weight decay done properly; use it when you want weight decay.
- **SGD with momentum 0.9** is still common for image networks (CNNs), where a well-tuned SGD often ends up slightly better, but its good learning-rate range is narrower.

**Ask:** Which order do the three lines go in, and could zero_grad go after backward?

**Answer:** zero_grad, backward, step (zero_grad may also go right after step). Not between backward and step: it would wipe the fresh slopes, step would find no gradient and no weight would move.

The code is tested: it runs with any model, loss_fn and DataLoader. The full loop with the forward pass is built line by line in the next section.


---

## 7 · The training loop, live — 35 min (1:33–2:08)

### Slide 28 · The five beats of one training step

*On screen:* Every training step is the same five lines *(5 build steps)*

**Time:** 4 min

**Say:** Everything we did so far, the model, the loss, the gradients, the optimizer, is used in five lines of code. They run once for every batch of shots, thousands of times. Say them with me: clear, forward, loss, backward, step.

**Do:** Press → five times. Each press highlights one line and shows on the right what that line does to the real 2-8-8-1 Kobe network (64 real shots, scaled):

- **1 zero_grad**: every stored gradient is set back to zero (nothing visible changes in the network).
- **2 forward**: the batch flows left to right; dark hidden neurons are the ones that fire a lot on these 64 shots; blank ones are off (ReLU gave 0).
- **3 loss**: one number for the whole batch, about 0.7 for a fresh network (a coin flip is 0.69).
- **4 backward**: magenta dashed lines are gradients, thicker means "this weight is more to blame". Every one of the 105 weights gets one, in one call.
- **5 step**: every weight moves a little against its gradient. The thick magenta line is the one weight that moved most, with its old and new value underneath; all the others moved less, too little to see. It usually starts at one of the darkest hidden neurons: a neuron that fired a lot on this batch carries more of the blame, so its outgoing weight moves most. Point at the "after the step" readout: the loss on the same 64 shots went down (0.695 → 0.664).

**Do:** Optional: "Next batch: run 5 beats" plays the same five beats on the next 64 shots, with the code lines lighting up in turn. Press it two or three times while saying the beats aloud. "Reset" goes back to the fresh network.

**Ask:** Which line actually changes the weights?

**Answer:** Only opt.step(). backward() only computes gradients and stores them in each weight's .grad; it does not move anything. zero_grad() only clears .grad.

Honesty note: this picture uses plain SGD with learning rate 0.5 on one batch, so the biggest weight moves by about 0.1 and you can just see the change; the batch loss goes from 0.695 to 0.664. In real training with Adam (lr 0.001) each weight moves about 0.001 per step, invisible after one step; that is why we need about 9,000 steps.

Orange lines are positive weights, blue negative, thickness is size. Magenta always means gradients / learning.

### Slide 29 · Live coding: the notebook

*On screen:* Now we build it, cell by cell

**Time:** 3 min (1 for the slide, 2 for Part 3 in the notebook)

**Say:** Now we run the real thing in PyTorch, one cell at a time. Before every run you predict what will happen. I will also make four mistakes on purpose; these are the mistakes that cost points in competitions.

**Do:** Switch to notebooks/01_live_coding.ipynb. The slide lists the notebook's parts in the order we use them. Run Part 0 (setup) and Part 1 (the MLP class) if you have not already; skip Part 2 (it belongs to the optimizer section). Then run Part 3: the file has 25,000 shots and 44.7% went in, so "always miss" is already 55.3% right. The table under it shows the raw coordinates in the hundreds: point at it, it is the next mistake. Make the font big (Ctrl/Cmd +) and use a light theme.

- The notebook is complete and its saved outputs are the numbers to expect (same seed, so you will get the same numbers). Run it with Shift+Enter, one cell at a time. If you feel confident, delete the loop in Part 5 and re-type it live while saying the five beats.
- Say each line aloud before you run it, then point at the output and say it again.
- At every PREDICT cell stop and take a vote (fingers or a number on paper) before running the next cell.
- If the notebook breaks, every result is also on the next slides.

**Ask:** Before running Part 3: what fraction of Kobe's shots went in? (Remember the opening.)

**Answer:** About 45% (44.7% in the task file). So "always miss" is right about 55% of the time; that is the floor every model must beat.

### Slide 30 · Live demo: scale your inputs

*On screen:* Does plain SGD care about raw inputs?

**Time:** 2.5 min

**Say:** This is the same 2-8-8-1 network training live in the browser on 3,000 of Kobe's real shots. The colour on the court is the predicted chance of a make: orange means "likely in", blue means "likely miss". The optimizer is plain SGD with learning rate 0.1, and the inputs are raw coordinates.

**Ask:** Predict: after 100 epochs, will it beat "always miss" (54.6% on these shots)?

**Do:** 1) Press Train with "raw inputs" and "SGD" selected (the default). Watch for about 6 seconds: the accuracy sits at 54.6%, exactly "always miss", and the court stays one pale colour (about 45% everywhere): it predicts "miss" for every shot. It stops by itself at epoch 120 (about 10 s).

**Do:** 2) Click "scaled inputs" (this resets the net), press Train: within a few seconds the accuracy climbs to about 60% and an orange spot appears around the rim, which is exactly where Kobe made more than half his shots.

**Do:** 3) Click "Adam", then try raw and scaled: both reach about 60% (raw is jumpier, it can dip back to 55% for a while). Adam hides the problem.

**Answer:** No for the first question: with raw inputs and SGD the huge numbers make the first steps enormous, the network is knocked into a state where every shot gets the same answer, and it never recovers: always miss. Scaled, the same optimizer works. Adam rescales every step by itself, so it survives raw inputs here, but scaling is free and makes every default (learning rate, initialisation) behave as designed.

Note: the loss readout at epoch 0 shows about 14.5 for raw inputs (this browser network starts with larger weights than PyTorch's default, which gives 2.3); either way it is far above 0.69. If a run looks stuck, press Reset and Train again. In our PyTorch runs the same thing happens: SGD + momentum lr 0.1 on raw inputs collapsed to "always miss" on all 3 seeds; scaled reached 60.3%.

### Slide 31 · The script, part 1: setup

*On screen:* Before the loop: data, model, loss, optimizer *(5 build steps)*

**Time:** 1.5 min (then type it in the notebook)

**Say:** This is everything that happens before the loop: turn the table into tensors, split 80/20, scale with the training statistics, build the model, choose the loss and the optimizer. Twelve lines.

**Do:** Press → five times; each press highlights a group of lines and the right side shows the result: the shapes, the split sizes, the mean and std, the 105-weight model, the loss and optimizer. The notebook (Parts 3 to 5) uses these lines and names (X_tr, y_tr, X_va, y_va, .unsqueeze(1)) in a slightly different order: it splits first (Part 3), shows mistake 1 on the raw X_tr and then scales X_tr and X_va with the training mu and sd (Part 4); model, loss and optimizer come in Part 5. Same result.

- **unsqueeze(1)** turns y from shape (25000,) into (25000, 1), the same shape as the model's output. We will break this on purpose later.
- MLP is the class from the "From one neuron to an MLP" part: fc1 = Linear(2, 8), fc2 = Linear(8, 8), fc3 = Linear(8, 1), ReLU in between, and **no sigmoid at the end**. In the notebook it is defined in Part 1.
- **BCEWithLogitsLoss** applies the sigmoid itself, in a numerically safe way. That is why the model outputs raw scores (logits).

**Ask:** How many numbers will Adam be adjusting?

**Answer:** 105: 24 in fc1 (2·8 + 8), 72 in fc2 (8·8 + 8), 9 in fc3 (8 + 1). Check it in code: sum(p.numel() for p in model.parameters()).

### Slide 32 · The script, part 2: the loop

*On screen:* The loop: epochs, batches, five beats *(4 build steps)*

**Time:** 3 min (including typing it in the notebook)

**Say:** Two loops. The outer loop runs over epochs: one epoch means the network has seen every training shot once. The inner loop cuts the shuffled shots into batches of 64; every batch gets the five beats we just saw.

**Do:** Press → four times: the outer loop; the shuffle and the batches; the five beats; the print. Then go to notebook Part 5: the loop cell is this code plus two lines (model.train() at the start of each epoch, and the train and validation loss stored after each epoch for the plot). Point at the five numbered comments, say the beats aloud again, and run it (about 10 seconds on a laptop). It prints the epoch and the last batch's loss: 30 lines that jump between 0.61 and 0.78, ending at 0.640. The next cell measures the model: validation loss 0.6655. Later parts reuse the same loop as a function, train(model, opt, X, y).

- 20,000 / 64 = 312.5, so 313 batches per epoch; the last one has only 32 shots. 30 epochs × 313 = 9,390 updates. (The optimizer section used the Kaggle file with 20,558 training shots, which gives 322 steps per epoch; same idea.)
- randperm reshuffles every epoch so the batches are different each time.
- The printed loss is the loss of the last batch only (32 shots), so it jumps around (0.61 to 0.78 in the notebook run). Do not read too much into one value.

**Ask:** If I double the batch size to 128 and keep 30 epochs, what happens to the number of steps?

**Answer:** It halves (157 per epoch, 4,710 in total). Fewer, less noisy steps; with a fixed number of epochs this often trains less. Count steps, not only epochs.

### Slide 33 · Kobe results: baselines vs MLP

*On screen:* Will 105 weights beat “always miss”? *(4 build steps)*

**Time:** 2 min

**Ask:** Before the reveal: the constant guess (45% for every shot) has validation loss 0.687. Will our network beat it? By a lot or a little? Write a number.

**Do:** Press → three times to reveal the three rows from top to bottom, then once more for the takeaway.

**Answer:** Yes, but by a little: 0.662 against 0.687, and 61% accuracy against 55%. Logistic regression sits in between (0.675, 58%) because it can only draw a straight boundary, and Kobe's good zone is a small disc around the rim.

**Say:** Is 61% bad? No. Even at the rim Kobe only scored about 63% of the time, so no model that sees only the position can be right much more than 61% of the time. The labels are coin flips with a probability that depends on position. In the task you are fighting for about 5 points between 55% and 61%.

Numbers: mean of 3 seeds on the Kaggle labelled shots, 80/20 split, Adam lr 0.001, batch 64, 30 epochs. The notebook (Part 5, seed 0) prints constant 0.6860 (always miss 56.1%), logistic regression 0.6729 (58.8%), MLP 0.6655 (60.4%): the third digit differs from the slide, the order and the gaps do not.

### Slide 34 · Cliffhanger reveal: two sigmoids

*On screen:* Two sigmoids: normal loss, broken model *(4 build steps)*

**Time:** 3 min

**Say:** Before the break you voted: a sigmoid as the last layer of the model, and BCEWithLogitsLoss as the loss. Crash, normal, quietly worse, or NaN? Let's run it.

**Do:** Re-take the vote (1 crash, 2 normal, 3 quietly worse, 4 NaN). Run notebook Part 7: the class MLPSigmoid is a copy of MLP whose forward ends with return torch.sigmoid(self.fc3(x)), the first code line on the slide; it trains with the same loop (about 10 s). Then press → for each reveal, running the matching notebook cell:

- Step 1: the printed validation loss is 0.685 (second cell of Part 7). Looks like a normal, slightly weak run.
- Step 2: accuracy (output above 0.5 = "made") is 61.7%, about the same as the correct model (60.4%).
- Step 3: the histograms of the predicted chances (the notebook draws the same two). The correct model says between 0 and 0.64 for every shot. The buggy one says "less than 1%" for 76% of all shots, including mid-range jumpers that go in 40% of the time.
- Step 4: score those outputs as probabilities (log loss, which is what Kaggle and many olympiad tasks use): the notebook prints 4.532 (it clips the probabilities at 1e-7 first, because −log 0 is infinite), against 0.665 for the correct model and 0.686 for a constant guess.

**Answer:** "Quietly worse": no crash, no NaN, normal-looking loss and accuracy, but the probabilities are garbage. A bug can leave accuracy unchanged and still destroy the competition metric.

**Say:** Why: the loss applies its own sigmoid to whatever the model outputs. The model's output is already squeezed between 0 and 1, so the loss only ever sees chances between 50% and 73%. To push a "miss" as low as it can go, the network must push its own output all the way down to 0. So it learns extreme outputs.

The maths, if a student asks: the loss sees σ(σ(z)), and σ(s) for s in (0, 1) lies in (0.5, 0.731). So each made shot costs at least −ln 0.731 = 0.313 and each miss at least −ln 0.5 = 0.693: the printed loss is trapped and can never look very good or very bad. Where Kobe makes less than half his shots, the best the loss can see is 0.5, so the output is pushed to 0 (61% of the outputs are below 1e-7). Near the rim, where he makes about 65%, the loss is happiest when σ(output) equals the make rate, so the output settles at about 0.57: the small bump in the histogram. Nothing goes near 1 (largest output 0.62). Accuracy survives only because 65% is above σ(0.5) = 0.62; a zone with a 55% make rate would be called a miss. The two fixes: remove the sigmoid from the model (preferred; BCEWithLogitsLoss is numerically safer), or keep it and use nn.BCELoss.

Kobe task note: a final nn.Sigmoid in the submitted model is allowed (the official baseline has one). If you train with it, use nn.BCELoss; or train without it using BCEWithLogitsLoss and add the sigmoid only in the submitted class. Also: with this bug, "logits > 0" accuracy reads 44% (everything "made"), because the outputs are never negative.

Numbers: all from notebook Part 7 (seed 0). The exact true log loss depends on the clip: each made shot with an output below 1e-7 costs −ln(1e-7) ≈ 16. sklearn's log_loss on a float64 array clips at 2.2e-16 and reports about 7.5; with the 1e-7 clip other seeds and splits gave 4.5 to 4.7 (the 4.69 quoted in other sections' notes). A count that does not depend on the clip: 1,453 of the 2,196 made validation shots got less than 1%. Either way it is far worse than the 0.69 of a constant guess. Karpathy's mistake #4 is the multi-class cousin: "you passed softmaxed outputs to a loss that expects raw logits".

### Slide 35 · Evaluate correctly

*On screen:* Measure on validation, without gradients *(4 build steps)*

**Time:** 1.5 min

**Say:** The last cell: measure the model on the validation shots it never trained on. Three habits: switch to evaluation mode, turn off gradient tracking, and turn logits into decisions correctly.

**Do:** Press → four times, one line group at a time. In the notebook the same lines are the function evaluate() at the start of Part 5, which you have already used; scroll back to it and point at model.eval(), torch.no_grad() and logits > 0.

- **model.eval()** switches layers like dropout and batch-norm to their test behaviour. Our Linear + ReLU net has neither, so here it changes nothing, but forgetting it is Karpathy's mistake #2, so build the habit. Call model.train() before training again.
- **torch.no_grad()**: we only measure, so PyTorch does not need to remember the computation for backward. Faster and less memory.
- **logits > 0**: a logit of 0 is exactly 50%, positive means "more likely made". No sigmoid needed to decide.
- Print three numbers: loss, accuracy, and the fraction predicted "made". If that fraction is 0 or 1, the model is a constant: always check it.

**Ask:** Our model predicts "made" for only about a third of the shots, but Kobe made 45%. Is that a bug?

**Answer:** No. "Made" is predicted only where the chance is above 50%, which is basically within 3 feet of the rim. Everywhere else the best single guess is "miss", even though 40% of those shots go in.

Numbers: the notebook's model (Part 5, seed 0) gives val loss 0.6655, accuracy 60.4%, fraction "made" 0.348; other seeds and splits gave 0.23 to 0.31. The fraction depends on exactly where the 50% line ends up around the rim, so anything from 0.2 to 0.35 is normal.


---

## 8 · Generalization and debugging — 15 min (2:08–2:23)

### Slide 36 · Train, validation, test

*On screen:* Grade the model on shots it never saw *(3 build steps)*

**Time:** 1 min

**Say:** A model is only useful on shots it has never seen. So we split our data like a school year. The training shots are homework: the weights learn from them. The validation shots are a mock exam: we never train on them, we only use them to choose settings, like the learning rate or when to stop. The test set is the real exam: in the olympiad the grader keeps it hidden and scores you once.

**Do:** Press → three times: the validation block, then the hidden test block, then the warning line.

**Ask:** If you try 50 settings and keep the one with the best validation score, is that validation score still an honest estimate?

**Answer:** Slightly too optimistic: you picked the luckiest of 50. That is exactly why a separate test set exists, and why the hidden leaderboard (the final "board B") can differ from the live one.

Numbers: Kobe has 25,697 labelled shots; our 80/20 split gives 20,558 training and 5,139 validation shots (the same split behind every Kobe number in this deck). Common mistake: computing the normalisation mean and standard deviation on all data, or on the validation data. Use the training shots only; the bug hunt later has exactly this bug.

### Slide 37 · Overfitting, live

*On screen:* A big net on 12 points memorises the noise

**Time:** 2 min

**Say:** Twelve noisy points from a smooth curve, the dashed line, and a big network with about a thousand weights. The small hollow dots are validation points: the network never trains on them. On the right, two loss curves: magenta is the training loss, black is the validation loss.

**Ask:** Before I press Train: if we train for a very long time, what happens to the training loss? And to the validation loss?

**Do:** Take two or three answers, then press **Train** (about 10 seconds). Narrate: first the black model curve becomes smooth and close to the dashed curve and both losses fall. Then the network starts bending its curve through every single black point: the training loss dives towards 0, while the validation loss turns back up. The dashed vertical line marks the step with the best validation loss so far. Press **Restore best**: the model jumps back to that smoother curve. Then click **80 points** and press Train again: the same big net now cannot thread a curve through every point, so the two loss curves stay close together.

**Answer:** Training loss keeps falling (to about 0: it memorises all 12 points, noise included). Validation loss falls, reaches its minimum early (around step 80, about 0.10), then climbs to about 0.27, more than twice as bad. With 80 points the two losses end close together (about 0.08 and 0.10) and the curve stays smooth. Memorising answers is not understanding.

Everyday picture: a student who memorises last year's exam answers scores 100% on that paper and badly on a new one. The gap between the two curves is the warning sign, not the training loss alone. The y-axis is logarithmic so that the training loss diving towards 0 stays visible. Loss here is mean squared error, because this is a curve-fitting demo. Do not demo a "smaller net" here: on only 12 points even a 7-weight net ends up chasing the noise if you train it long enough.

### Slide 38 · Five cures for memorising

*(5 build steps)*

**Time:** 1.5 min

**Say:** Here is our patient again: the big net that memorised 500 shots and reached a validation loss of 1.23. Five standard cures, each with what it did on Kobe.

**Do:** Press → five times, one cure per click, about 15 seconds each; tell the bank story at cure 5. Spend the most time on 3 (stop early) and 5 (dropout).

- **More data**: the best cure when you can get it. With all 20,558 shots, a big net (2-64-64-64-1) reaches 0.660 instead of memorising.
- **Smaller model**: fewer weights means less room to memorise. Our legal 2-8-8-1 on the same 500 shots: best 0.677.
- **Stop early and keep the best weights**: after every epoch measure the validation loss; whenever it is the best so far, save a copy of the weights (the code on the slide); at the end, load that copy. This is exactly the "Restore best" button from the live demo. On the patient, the best validation loss came very early (step 20): 0.675 instead of 1.23 (notebook Part 10: step 10, 0.678 instead of 1.35). That score is slightly optimistic, because we picked the step by looking at the same validation set; report a held-out test set once, at the end.
- **Weight decay**: every step also shrinks each weight a little toward 0, so the net cannot build the huge, wild weights that memorising needs. In PyTorch: `torch.optim.AdamW(model.parameters(), lr=1e-3, weight_decay=1.0)`. On the patient after 2,000 steps: 0.76 instead of 1.23. Better, but it does not beat stopping early; cures are often combined.
- **Dropout**: during training, randomly switch off some neurons in every step (watch the crosses jump around), so no neuron can rely on one particular partner. `nn.Dropout(0.5)` between layers; it is switched off automatically by `model.eval()`, which is one reason to always call it before evaluating. On the patient (dropout 0.5 after both hidden layers), after 2,000 steps: 0.71 instead of 1.23.

**Say:** Story: Geoffrey Hinton said he got the idea for dropout at his bank. The tellers kept changing, and a teller told him they were moved around a lot. Hinton guessed the reason: cheating the bank needs several employees to cooperate, and rotating people breaks up such conspiracies. Randomly removing neurons breaks up "conspiracies" between neurons, which is what memorising is.

**Ask:** Which cure can you NOT use much in the Kobe task, and why?

**Answer:** "Smaller model" and "more data" are fixed by the rules (at most 2-8-8-1, the given shots). With only 105 parameters and 20,000 shots, the Kobe net barely overfits at all; early stopping with the best checkpoint is the cure worth keeping.

Source for the bank story: Hinton's answer in the Google Brain "Ask me anything" on Reddit, August 2016; dropout paper: Hinton et al. 2012 / Srivastava et al. 2014. All numbers are from our runs on the real Kobe data, same 80/20 split as everywhere in the deck (500-shot runs: full-batch Adam or AdamW, lr 1e-3, 2,000 steps, validation on the usual 5,139 shots, best checkpoint measured every 10 steps).

### Slide 39 · Loss-curve doctor

*On screen:* Loss-curve doctor: what went wrong? *(6 build steps)*

**Time:** 2 min

**Say:** Reading the loss curve is the most useful debugging skill you will learn today. Six patients. Magenta is always the training loss, black the validation loss; the little 0.69 mark on each axis is the loss of a net that knows nothing. Write down a diagnosis for each card, then we check.

**Do:** Give 45 seconds of silent writing (just the numbers 1 to 6 and a word each), then press → six times, one diagnosis per click. Before each click ask one student for their answer; keep it quick.

1. **Learning rate too high**: the loss jumps around, spikes, drifts up; in the worst case it becomes nan. Fix: divide the lr by 10. (Kobe: Adam with lr 1.0 ended at 0.701, worse than guessing.)
2. **Overfitting**: training keeps falling, validation turns up. Fix: keep the best checkpoint, stop early, smaller model or more data.
3. **Learning rate too low**: a slow, almost straight line that never flattens. Fix: lr ×10, or train longer. (Kobe: plain SGD with lr 0.001 only reached 0.683.)
4. **Learned nothing**: flat at 0.69 from the start. Suspects: forgotten `optimizer.step()` or `zero_grad`, dead ReLUs, labels shuffled separately from inputs, unscaled inputs.
5. **Very noisy**: each step sees a small random batch, so the loss wiggles. Some wiggle is normal; this much means a bigger batch, a smaller lr, or simply plotting a moving average.
6. **Healthy**: fast drop, then flat, validation just a little above training. A small gap is normal and is not overfitting.

Common misconception: "training loss below validation loss means overfitting". No: a small, stable gap is normal. Overfitting means validation gets worse while training still gets better. These six curves are drawn by hand (schematic), not from real runs.


---

## 9 · Olympiad playbook and the two tasks — 30 min (2:23–2:53)

### Slide 40 · Task 1: Kobe, will this shot go in?

*On screen:* Kobe: will this shot go in?

**Time:** 30 s

**Say:** Task one. Kobe Bryant played 20 seasons for the Lakers and took 30,697 shots that the NBA logged with their position on the court. You get 25,000 of them, each with "went in" or "missed". Your job: from the position alone, predict whether a shot goes in.

**Do:** Point at the court: every dot is one shot seen from above, the hoop at the bottom. Orange = made, blue = missed (800 of his shots shown). Let them notice the pile of shots right under the basket.

Where the task comes from: problem 1 of round 2 of China's national AI olympiad (NOAI 2024), reused as question 1 of the NOAI 2025 teaching test; the platform Bohrium labels that test "APOAI2025 Mock". The 25,000 rows are exactly the labelled shots of Kaggle's 2016 "Kobe Bryant Shot Selection" competition, shuffled and renumbered.

Be respectful: Kobe died in a helicopter crash in January 2020 with his daughter Gianna and seven others. Some students may feel strongly about him; mention it calmly if it comes up, and no jokes. A useful hook instead: he called his work ethic "Mamba mentality", obsessing over the boring details. For us that means seeds, scaling, baselines and validation.

### Slide 41 · The rules

*On screen:* The rules: a tiny net, raw inputs *(4 build steps)*

**Time:** 1.5 min

**Say:** The rules are strict on purpose. The network sees only two numbers per shot, loc_x and loc_y, and they arrive raw: tenths of a foot, with the hoop at zero. The statement claims they are "already normalized". That is false: x goes from −250 to 248 and y from −44 to 791.

**Do:** → 1: the size limit. At most 3 linear layers with at most 8 neurons each, so 2-8-8-1 is the biggest legal network: 105 numbers.

**Do:** → 2: activations only from this list, placed after linear layers. Build the layers as named attributes (self.fc1, self.fc2, self.fc3). nn.Sequential scores 0 because the checker cannot see inside it.

**Do:** → 3: you upload a zip with two files, the model class and the trained weights. → 4: the score is plain accuracy on hidden test shots. Board A is shown live during the contest; board B, the other half, is the final score.

**Ask:** Can you feed the distance to the rim as a third input? The data file has a column shot_distance.

**Answer:** No. The input must be exactly loc_x and loc_y; the grader passes two columns, so a three-input model would crash. It would not help anyway: shot_distance is just the distance computed from x and y, rounded down to whole feet.

Background: the baseline notebook names the class MyModel with an empty constructor; keep that. Mixing activations (ELU then ReLU) is fine. A final nn.Sigmoid is what the baseline does, so the grader most likely thresholds the output at 0.5; keep it.

### Slide 42 · Predict the best possible score

*On screen:* What accuracy can the best model reach? *(5 build steps)*

**Time:** 1.5 min

**Say:** Before anyone trains anything: what is the best accuracy possible on this task? Everybody write one number on paper. Do not look at your neighbour.

**Do:** Wait 20 seconds. Take two or three guesses aloud (students usually say 70–90%). Then reveal one step per press:

- → 1: always say "miss": 55.3%. Free points, zero intelligence.
- → 2: the best possible straight-line boundary: 58.6%. That is all logistic regression can do, and also all the official baseline (a 2-1-1-1 chain) can do.
- → 3: a legal 2-8-8-1 trained properly gets about 60.5–61% on validation, and that is the ceiling: boosted trees and nearest-neighbours on the same two numbers also stop at about 61%.
- → 4: the best honest leaderboard scores were 62.1–62.5%. Each board has only about 2,500 shots, so scores wobble by about ±1 point just by luck.
- → 5: why so low? The labels are coin flips. 4,200 shots were taken at exactly the rim position, and even those went in only 62.5% of the time. No model can know which of them will go in.

**Ask:** Your friend gets 60.4% and you get 60.9% on the live board. Who has the better model?

**Answer:** You cannot tell. The board noise (about ±1 point) is bigger than the gap. Trust your own validation split, ideally with several seeds, and treat differences below about half a point as ties.

### Slide 43 · Hint: fold the scaling into fc1

*On screen:* Hide the scaling inside the first layer *(3 build steps)*

**Time:** 1 min

**Say:** Here is the trap. You will train on scaled inputs, because that is the right thing to do. But the grader feeds raw coordinates into your network. So the scaling must live inside the weights. The good news: the scaling is itself a linear operation, so you can merge it into the first linear layer exactly.

**Do:** Top row: while training, x has 7 subtracted and is divided by 110 (y: minus 91, divided by 88; these are the means and spreads of the task data). → 1: what you submit has no separate scaling box: the first layer's weights are changed so it gives exactly the same outputs on raw numbers.

**Do:** → 2: the recipe in words: divide each weight by the spread of the input it multiplies; then shift the bias by the new weights times the means. Do not give them code; let them derive it on paper (it is one line of algebra) and check it numerically. → 3: the check is the proof: feed raw coordinates to the folded model and scaled coordinates to the original one; the outputs must agree.

The algebra, for the coach: fc1 on scaled input is W·((x − μ)/σ) + b = (W/σ)·x + (b − (W/σ)·μ), where "/σ" divides column j of W by σ_j. In PyTorch, inside torch.no_grad(): weight ← weight / std (broadcast over columns), bias ← bias − new_weight @ mean. We checked it: the outputs match to 5 × 10⁻⁷; the reference pipeline gives the same accuracy on raw inputs after folding.

**Ask:** Why is folding the scaling into fc1 exact, and not just an approximation?

**Answer:** Subtracting a mean and dividing by a spread is a linear (affine) step, and a linear step followed by a linear layer is still one linear layer. Nothing is lost.

### Slide 44 · Four ways to lose points on Kobe

*(4 build steps)*

**Time:** 1 min

**Say:** Four mistakes that cost points on this exact task; three of them are in real public notebooks for it. None of them shows up in your training loss: you only find out when the grader runs your zip.

**Do:** → 1: computing distance or angle inside forward() breaks the rule "only linear layers and activations", and it does not even help: we measured no gain over plain x, y. Scaling folded into fc1 (previous slide) is fine because it lives in the weights.

**Ask:** → 2 first ask: your class must end with nn.Sigmoid, because the grader expects a probability. Which loss do you train with?

**Answer:** Either nn.BCELoss on the Sigmoid output, or BCEWithLogitsLoss on the raw score before the Sigmoid (for example a method logits() that stops after fc3, while forward() adds the Sigmoid). Never the Sigmoid output into BCEWithLogitsLoss: that is the cliffhanger bug from before the break. A Sigmoid has no weights, so the saved state_dict is the same either way.

**Do:** → 3: one public notebook wrote a 2-1-1-1 class into submission_model.py but saved 2-8-4-1 weights, so loading failed. Write submission_model.py first and import that exact class in your training notebook. → 4: before uploading, open a fresh notebook, unzip, load the class and the weights, feed raw coordinates, and check that you get your validation accuracy back.

One more, if asked: do not chase the live board. With about 2,500 shots per board it wobbles by about ±1 point by pure luck; trust your own validation split.

### Slide 45 · Task 2: optimise the input, not the weights

*On screen:* Optimise the input, not the weights *(3 build steps)*

**Time:** 2 min

**Say:** Task two, translated from the Georgian statement: "Operation Inversion: digital restoration of data". You get a trained network that is frozen, and a table of rows: the inputs and the network's output y for each row. But one input column was overwritten with zeros. Your job is to recover that column.

**Say:** Left is what you know: in training the data is fixed and the gradient moves the weights. → 1: in inversion we flip it. The weights are frozen; the missing input becomes the thing that learns. The gradient of the loss flows back through the same network, but we stop at the input. Same backprop, different target.

**Do:** Analogy for students who do not like maths: the model is a frozen lock, and we are turning the key until it opens.

**Do:** → 2: the most famous example of moving inputs with gradients.

**Ask:** GoogLeNet says "panda" with 57.7% confidence. Add a noise pattern so small you cannot see it (0.007 times the sign of the input gradient). What does it say now?

**Answer:** → 3: "gibbon", with 99.3% confidence (Goodfellow et al., 2014). The two pandas look identical to us. The noise is exactly what our task uses: the gradient with respect to the input.

More stories if there is time (one sentence each): DeepDream (Google, 2015) runs gradient ascent on a photo to amplify what a layer sees; style transfer (Gatys 2015) optimises the pixels to match a painting's style. Fredrikson et al. (USENIX Security 2014) took a model that recommends doses of the blood thinner warfarin, plus a patient's age, weight and dose, and recovered the patient's missing genetic marker. That is exactly our task: one hidden input, the other inputs and the output known. It is a privacy attack, and it is just backprop.

About the task data: our notes come from replicas we built (10 input columns, 1,000 rows, a 10-64-64-1 network saved as model.pt), because the original files were not available to us. Check the column count and file names on the real statement.

### Slide 46 · Two toy inversions

*On screen:* One unknown: one answer, or two

**Time:** 2 min

**Say:** Two tiny versions of the task, small enough to see everything. The "frozen model" is a + 2b + c², and we know its output is 4.65. Each picture shows the loss, how wrong the output is, for every value of the unknown. The magenta dots are the optimiser's steps.

**Ask:** Before each run on the left, ask for a quick hand vote: "Will it land, crawl, bounce, or fly off?"

**Do:** Left (find b, starting from 0): press **Run** with lr 0.125: one jump and it lands exactly on 0.7. Choose lr 0.05: small careful steps. lr 0.25: it bounces between 0 and 1.4 forever. lr 0.3: each bounce is bigger and it flies off the chart. The step size must fit the steepness of the valley.

**Do:** Right (find c, Adam lr 0.1): start +0.1 → it rolls to +1.5. Start −0.1 → it rolls to −1.5. Both give exactly 4.65. Start exactly 0 → it never moves: 0 is the top of the hill, the slope there is exactly zero, so the gradient says nothing.

**Ask:** Starting at +0.1 we get +1.5; the true answer was +1.5. Did gradient descent "know" the answer?

**Answer:** No. It went to whichever valley was downhill from the start. If the truth had been −1.5 it would have been wrong, with a perfect fit. Two keys open the same lock; the fit cannot tell you which one is right.

Maths for the coach: left loss (2b − 1.4)², gradient 4(2b − 1.4); one SGD step is b ← b(1 − 8·lr) + 5.6·lr, which converges only if lr < 0.25 (2 divided by the curvature 8) and lands in one step at lr = 1/8. Right loss (c² − 2.25)², gradient 4c(c² − 2.25), zero at c = 0 (a local maximum). All checked in PyTorch: SGD and Adam both stay at exactly 0 from c = 0.

### Slide 47 · Skeleton code with TODOs

*On screen:* Your starting point: fill the TODOs *(5 build steps)*

**Time:** 1.5 min

**Say:** Here is the shape of a first solution. It is not complete on purpose: the three dots are for you. Step through it with me.

**Do:** → 1 (lines 1–3): load the model, put it in eval mode, freeze every weight. → 2 (lines 4–6): find the column that is all zeros; split the other columns off; the missing column z is the only tensor that requires a gradient.

**Do:** → 3 (line 7): the learning rate. Adam moves every value by about lr per step, whatever the gradient. With lr 0.001, 500 steps can move a value by at most 0.5, and the answers are often 1 or 2 away: MSE 0.43. With lr 0.1: 0.024. "1e-3" is a default for weights, not for inputs.

**Do:** → 4 (lines 9–10): glue the columns back together, run the frozen model, compare with y. The [:, 0] matters: the model returns shape (N, 1) and y is (N,). Subtracting them silently makes an N × N table and mixes all rows; our replica then scored MSE 2.44, worse than submitting zeros.

**Do:** → 5 (line 12): after it runs, look at the residual of every row, try the grid from the previous slide, and decide what to do with rows that have two answers.

**Ask:** Why .sum() over rows and not .mean()?

**Answer:** The rows are independent problems, so each z only feels its own row's error. With Adam it makes no difference (Adam ignores the overall scale of the loss). With plain SGD, .mean() divides every row's gradient by 1,000 and z barely moves (MSE 0.71).

Checked: this code with k, lr = 0.1 and 500 steps filled in runs on our replica in under a second and gives MSE 0.0236. If the model was saved with TorchScript, torch.jit.load and .eval() work exactly as shown. Freezing with p.requires_grad_(False) matters in torch 2.15: without it, torch.no_grad() still builds a graph for scripted models.

### Slide 48 · Plan before typing

*On screen:* Write your first three experiments *(1 build step)*

**Time:** 3.5 min

**Say:** Last thing before you start: plan before you type. In pairs, write down the first three experiments you will run for each task, in order. Three minutes. One of you writes, the other checks: does the plan start with a baseline? Is there a validation split? What number will tell you it worked?

**Do:** Click **Start** on the timer. Walk around; look for plans that start with a big model and no baseline. At 0:00, ask two pairs to read one plan aloud. Then press → to show an example plan and compare.

**Ask:** Does your first experiment produce a number you can compare everything else to?

**Answer:** It should: for Kobe the "always miss" accuracy (55.3%) and a logistic regression; for inversion the all-zeros submission (MSE 0.968, score 0) and a check that the model reproduces y once the true column is in. Every later experiment is judged against that number.

Pair activity A9 from the teaching pack. If time is short, do it for one task only (Kobe). The example plan on → is one good order, not the only one: for Kobe, the full validation accuracy should land around 60.5–61%; for inversion, Adam lr 0.1 should leave most rows with a tiny residual.


---

## 10 · Wrap-up — 7 min (2:53–3:00)

### Slide 49 · The whole lecture in one picture

**Time:** 2 min

**Say:** This is the picture from the very beginning, now with today's words on every box. Data: scaled, in batches, split into training and validation. Model: linear layers with activations in between, stacked. Loss: MSE for numbers, binary cross-entropy for yes/no, cross-entropy for classes. Gradients: one call, loss.backward(). Update: optimizer.step(), and Adam with learning rate 1e-3 is the default you start with.

**Ask:** Ask two or three students to explain one arrow each, in their own words.

**Answer:** Good answers mention: the model outputs a score (a logit) and the loss compares it with the label; backward works out, for every weight, which way to nudge it; the optimizer moves each weight a small step that way; we repeat for many epochs and watch the validation loss.

### Slide 50 · Now: two tasks

*On screen:* Now: two tasks. Tomorrow: harder ones.

**Time:** 30 s

**Say:** Now you solve two olympiad tasks with exactly what we covered. Kobe: a tiny legal network that predicts whether a shot goes in, from its position only. Inversion: a frozen network and one input column that was set to zero; you recover it with gradients, changing the input instead of the weights. Tomorrow we continue with harder tasks, so note which parts of today felt shaky.

**Do:** Hand out the task files and the starter notebooks (notebooks/02_kobe_starter and notebooks/03_inversion_starter). Remind them: baseline first, a validation split, and save the best model. The magenta dashed arrow is the input we will learn, like a weight in normal training.

