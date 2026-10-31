# Teacher's script — Neural networks, hands-on

Slide-by-slide script for the 180-minute lecture (90 slides). It is generated from the speaker notes in the deck (`tools/export_script.js`), so it always matches `lecture.html`. For background on every topic, the task hint ladders and the Q&A cheat-sheet, read `COACH_GUIDE.md` first.

How to read it: **Say** is what to tell the class, **Do** is what to click or draw, **Ask** is a question for the class and **Answer** its answer. "Press →" means advance one build step. In the deck, P opens the presenter window with these notes, a timer and the next slide.

| # | Section | Minutes | Clock | Slides |
|---|---|---|---|---|
| 0 | Opening | 10 | 0:00–0:10 | 1–6 |
| 1 | Why neural networks? | 12 | 0:10–0:22 | 7–12 |
| 2 | From one neuron to an MLP | 18 | 0:22–0:40 | 13–21 |
| 3 | Activations: any function | 22 | 0:40–1:02 | 22–34 |
| 4 | Loss: how wrong are we? | 13 | 1:02–1:15 | 35–41 |
| 5 | Break | 10 | 1:15–1:25 | 42–42 |
| 6 | Gradient descent and optimizers | 22 | 1:25–1:47 | 43–54 |
| 7 | The training loop, live | 28 | 1:47–2:15 | 55–65 |
| 8 | Generalization and debugging | 15 | 2:15–2:30 | 66–74 |
| 9 | Olympiad playbook and the two tasks | 22 | 2:30–2:52 | 75–87 |
| 10 | Wrap-up | 8 | 2:52–3:00 | 88–90 |


---

## 0 · Opening — 10 min (0:00–0:10)

### Slide 1 · Neural networks, hands-on

*On screen:* Neural networks, hands‑on

**Time:** 1 min

**Say:** Today we go from the models you already know, which draw straight lines, to neural networks, which can learn almost any shape. Everything you see on these slides is computed live in this browser.

**Do:** Let the spiral on the right train while you talk. Point at it: two interleaved spirals, orange and blue. A network with 105 numbers inside is learning to separate them right now.

**Ask:** Could logistic regression separate these two spirals?

**Answer:** No. Logistic regression draws one straight line. By the end of the first hour you will know exactly why the network can and logistic regression cannot.

Keys: → / space next, ← back, P opens the presenter window (notes, timer, next slide), N shows notes on this screen, T toggles light/dark, F full screen, B black screen, O slide map, ? help.

### Slide 2 · Where we are

*On screen:* You already have every ingredient

**Time:** 1 min

**Say:** A neural network is not a new subject. It is built from things you already know: vectors and matrices for the computation, gradient descent for the learning, and logistic regression as the very last layer. Today we only add one new idea, the hidden layer with a nonlinearity, and then we learn to train such models well in PyTorch.

Why say this: students who already "know" backprop often feel deep learning is a separate, mysterious world. Framing it as "logistic regression + learned features" lowers the barrier and lets you lean on what they know.

### Slide 3 · Today's map

*On screen:* Three hours: theory, live demos, code

**Time:** 1 min

**Say:** Here is the plan. Roughly every ten minutes you will do something: predict what happens before I run a demo, compute something on paper, or write code. There is one break in the middle. The last part prepares you for the two tasks you will solve this afternoon.

**Do:** Point at the orange rows (the tasks) and the blue row (live coding). Tell them to keep a notebook open for paper exercises.

Pacing: the presenter window (key P) shows the planned clock for every section and warns you when you are behind. If you are late, the safest places to cut are the extra demos in "Activations" (sigmoid towers, space warping) and the optimizer schedules slide.

### Slide 4 · The one picture of today

*On screen:* One picture for the whole day *(7 build steps)*

**Time:** 2 min

**Say:** Every neural network you will ever train, from our 105-parameter network to ChatGPT, runs this loop. Data goes into the model, the model makes a prediction, the loss measures how wrong it is. Then we go backwards: gradients tell every weight which way to move, the optimizer moves them a little, and we repeat thousands of times.

**Do:** Press → to build the picture one box at a time; name each box as it appears. Black arrows are the forward pass; magenta arrows are learning (gradients and updates). Magenta always means "learning" in this deck.

**Ask:** Which of these boxes did you already meet with logistic regression?

**Answer:** All of them. Logistic regression has data, a (very small) model, a loss (cross-entropy), gradients and gradient-descent updates. Today we make the model box bigger and learn how to make the loop work well.

### Slide 5 · Warm-up: three questions

*On screen:* Warm-up: what do you already know? *(3 build steps)*

**Time:** 3 min (2 to write, 1 to reveal)

**Do:** Everyone writes answers on paper, no notes. Then press → three times to reveal the answers one by one; ask for a show of hands "who had it?" after each.

**Say:** Testing yourself is one of the strongest ways to remember something; this takes two minutes and tells me where you are.

**Answer:** 1) A probability between 0 and 1 (it squashes a weighted sum through the S-shaped sigmoid). 2) One straight line: points on one side get p > 0.5, on the other side p < 0.5. This is the limitation we break today. 3) For every weight, which direction (and roughly how strongly) to nudge it so the loss goes down. Gradient descent then takes a small step in that direction.

Background for you: the formula is p = σ(w·x + b). You do not need to write it on the board; the picture "one straight line" is what matters for the next section.

### Slide 6 · Predict: Kobe's shooting

*On screen:* Kobe Bryant took 25,697 labelled shots. What % went in? *(2 build steps)*

**Time:** 2 min

**Say:** Today's running example is real data: every shot Kobe Bryant took in 20 NBA seasons, with its position on the court. Orange dots went in, blue dots missed. This is also the data of your first task this afternoon.

**Do:** Everyone writes a number on paper first. Then → reveals 44.6%, → again reveals the consequence.

**Ask:** If 44.6% went in, how accurate is a "model" that always says "miss"?

**Answer:** 55.4% (about 55%). Remember this number: any model that does not clearly beat 55% has learned nothing. Later we will see that the best possible model only reaches about 61%, because the same spot can produce both a make and a miss.

Facts for the coach: the data is the Kaggle "Kobe Bryant Shot Selection" set (30,697 shots from 1996 to his last game on 13 April 2016; 5,000 had hidden labels). His regular-season career field-goal percentage was .447. Kobe died in a helicopter crash in January 2020; mention it respectfully if it comes up, and never joke about it.


---

## 1 · Why neural networks? — 12 min (0:10–0:22)

### Slide 7 · Can one straight line do it?

*On screen:* Can one straight line separate the colours? *(1 build step)*

**Time:** 2 min

**Say:** Here is a toy dataset: orange dots in the middle, blue dots in a ring around them. You already know logistic regression. Its decision boundary is always one straight line. Question: can one straight line put all the orange dots on one side and all the blue dots on the other?

**Do:** Ask for a show of hands: "yes" or "no". Then press **Train**. Logistic regression trains for a second. Point at the black line and at the readouts: the loss stays near 0.68 and the accuracy stops at about 59%. Press → to show the answer. Press **Reset** and **Train** again if someone wants to see it twice: same result.

**Ask:** Why can't it do better, however long we train?

**Answer:** Every straight line leaves orange and blue dots on both sides. The orange dots are surrounded. Training longer only polishes the best line; it cannot bend it.

Maths, if a student asks: logistic regression computes p = σ(w₁x₁ + w₂x₂ + b). The 50% boundary is where w₁x₁ + w₂x₂ + b = 0, which is a straight line. Even the best possible hand-placed line only gets 71% here; logistic regression gets 59% because it minimises log loss, not accuracy, and on this nearly symmetric data the best it can do is shrug.

### Slide 8 · Kobe: where would one line go?

*(3 build steps)*

**Time:** 3 min

**Say:** Now real data: 800 of Kobe Bryant's shots, orange went in, blue missed. The hoop is at the bottom. In pairs: one of you shades where Kobe scores most, the other draws the single straight line that best splits makes from misses, the way logistic regression would. Two minutes.

**Do:** Press **Start** on the timer. Walk around and look at the sketches. When time is up press → three times: (1) the make-rate bars, (2) the best straight line, (3) the circle round the rim.

**Ask:** After step 1: what do the bars tell you?

**Answer:** His chance drops the further he is from the rim: 63% within 3 feet, about 40% at mid-range, 6% from very far. Only the first bar is above 50%. So "equal chance" lines are arcs around the hoop, not straight lines.

**Ask:** After step 2: what is wrong with the straight line?

**Answer:** It runs across the whole court about 3 feet in front of the rim. Everything below it is called "made", including corner three-pointers, which go in only about 35% of the time. A line cannot wrap around the hoop. A circle of 3 feet does: 61% correct against 58% for the line (and 55% for always saying "miss").

**Ask:** How many straight lines would you need to draw something close to that circle?

**Answer:** A few: three make a triangle, four a square, eight an octagon. Keep this in mind: that is exactly what a hidden layer will do.

Where the numbers come from: all 25,697 labelled shots of the Kaggle data. Make rate by distance 62.8 / 44.2 / 43.1 / 39.8 / 33.7 / 6.1%. Logistic regression on (x, y) predicts "made" below a nearly flat line 2.8 ft in front of the rim and is right 58.1% of the time; the rule "made if within 3 ft" is right 61.0%. 16.8% of all shots are recorded exactly at the rim (dunks and lay-ups), so many dots sit on top of each other there.

### Slide 9 · XOR and the first AI winter

*On screen:* One layer was not enough: 20 lost years *(4 build steps)*

**Time:** 2 min

**Say:** This problem stopped the whole field once. In 1958 Frank Rosenblatt showed the Perceptron, a single learning layer, basically logistic regression with a hard threshold. The New York Times wrote that the Navy expected it to "walk, talk, see, write, reproduce itself and be conscious of its existence". In 1969 Minsky and Papert proved that one layer cannot even learn XOR: orange in two opposite corners, blue in the other two. No straight line separates them. Money left the field for years. The fix, training networks with hidden layers by backpropagation, became famous in 1986.

**Do:** Press → four times, one event per press. Read the quote aloud with a straight face. At 1969, point at the XOR square and ask the question below.

**Ask:** Where would you put one straight line to separate the XOR square?

**Answer:** Nowhere: any line leaves a blue and an orange dot on the same side. Two lines (a stripe) would do it, which is what a hidden layer with two neurons does. You will build that network yourselves in the next section.

Get the history right: Minsky and Papert proved the limit for **single-layer** perceptrons; they knew multi-layer networks could represent XOR but doubted they could be trained. The book was read as a verdict on all neural networks. The Mark I Perceptron (built 1959–60, 400 photocells, weights on motor-driven potentiometers) even had a middle layer, but it was wired randomly and never learned: only the last layer learned. Backprop has a messy history (Linnainmaa 1970, Werbos 1974/1982); Rumelhart, Hinton and Williams made it famous in Nature, 1986. Sad coda: Rosenblatt drowned on his 43rd birthday in 1971 and never saw it.

### Slide 10 · Fix 1: invent a feature (lift to 3-D)

*On screen:* Fix 1: lift the dots, then one flat cut works *(4 build steps)*

**Time:** 2.5 min

**Say:** First fix, and it is a trick you already know from classical ML: invent a new feature. Give every dot a height: the further it is from the centre, the higher we lift it. The orange dots in the middle stay low, the blue ring goes up high. Now a flat sheet slides between them, which is just a linear model in 3-D. Look at where the sheet cuts the bowl and drop that back onto the floor: it is a circle. A straight cut in the new space is a curved boundary in the old one.

**Do:** Press → once: the dots rise and the camera tilts (about one second). Drag on the picture with the mouse to spin the bowl so everybody sees the gap. Press → for the sheet, → for the circle on the floor, → for the question.

**Ask:** Last step: which height would you invent for Kobe's court? For a spiral?

**Answer:** For Kobe, distance from the rim is a good guess, but you had to know basketball. For a spiral, nobody has a good guess. And in the Kobe olympiad task you are not even allowed to compute features yourself: the network gets only x and y, and may use only linear layers and activations. So the network must invent its features itself. That is the next slide.

Maths for the coach: the new feature is z = x² + y² (squared distance from the centre). Inner dots have z ≤ 0.25, outer dots z ≥ 0.50, so the sheet at z = 0.36 separates them perfectly, and x² + y² = 0.36 is a circle of radius 0.6. This is the idea behind kernel methods (SVMs) too.

### Slide 11 · Fix 2: a hidden layer learns the features

*On screen:* Fix 2: four neurons, four lines, one shape

**Time:** 2.5 min

**Say:** Second fix: instead of inventing the feature, let the network learn it. Take four logistic regressions side by side. That is the hidden layer: the four small squares on the left. Each one can only draw a straight line, orange on one side, blue on the other. Then one more logistic regression on top combines the four answers. Watch what happens when we train.

**Do:** Press **Train**. It takes about 5–8 seconds. Point first at the small squares: each is still a straight edge, but the edges move to different sides of the orange disc. Then point at the big picture: the four edges together fence in the disc, like a rounded square. Accuracy goes to 100%. Press **Reset** and **Train** again if you want a second look.

**Ask:** The small squares are straight edges. How does the big picture become round?

**Answer:** The last neuron adds up the four answers and says "orange" only where all four agree that you are on the inside. Four straight walls around the centre make a closed shape. More neurons give more walls, so a smoother shape. This is the "how many lines would you need" answer from the Kobe slide.

Behind the picture: the network is 2-4-1 with tanh in the hidden layer, trained with Adam (learning rate 0.03) on the full 300 points. The colours in the small squares show each neuron's output: orange where it is positive, blue where it is negative. The hidden layer has learned new features (four "which side of my line are you on" scores); the last layer is ordinary logistic regression on those features. Misconception to head off: hidden neurons are not little brains and need not mean anything; here they just happen to be readable.

### Slide 12 · Takeaway: hidden layer = learned features

*On screen:* A hidden layer learns its own features.

**Time:** 1 min

**Say:** So the story is: one straight line fails on curved patterns like the circle or Kobe's hot zone around the rim. Inventing a feature fixes it, if you can guess the right one. A neural network learns its own features in the hidden layer, and the last layer is plain logistic regression on top. In the next section we open up one neuron and see exactly how it computes.

**Ask:** In one sentence: what does a hidden layer do?

**Answer:** It turns the raw inputs into new features (here: "which side of each line"), learned from the data, so that a simple last layer can separate the classes.


---

## 2 · From one neuron to an MLP — 18 min (0:22–0:40)

### Slide 13 · One neuron: weigh, add, bend

*On screen:* A neuron: weigh the inputs, add, bend

**Time:** 2 min

**Say:** You already know one neuron: it is logistic regression. It takes the inputs, multiplies each one by its own weight, adds them up together with a bias, and then bends the result with an activation function. With a sigmoid as the bend, this is exactly logistic regression. Inside a network we usually bend with ReLU instead: keep positive sums, turn negative sums into zero.

**Do:** The inputs are fixed at 1 and 2. Point at the three steps: weigh (the numbers on the arrows), add (the circle shows 0.5 + 2 − 1 = 1.5), bend (ReLU keeps 1.5). Then drag "weight 1" down to −2: the sum becomes −1 and the output snaps to 0. Say: "the neuron is off". Drag it back. Click "sigmoid": the output becomes a probability between 0 and 1. Orange arrow = positive weight, blue arrow = negative weight, thickness = size.

**Ask:** With ReLU, what is the output if the sum is −3? And if the sum is +3?

**Answer:** 0 and 3. ReLU(z) = max(0, z). Negative sums are switched off, positive sums pass through unchanged.

The maths, if a student asks: z = w₁x₁ + w₂x₂ + b, output = φ(z), where φ is ReLU or σ. The bias is just a weight on an input that is always 1, which is why it is drawn as a box with a 1 in it.

History in one breath: McCulloch and Pitts (1943) described the first artificial neuron, a yes/no threshold unit computing logic. Rosenblatt's perceptron (1958) was one such neuron that learned its weights. Do not say "it works like a brain cell": a 2021 study needed a 5–8-layer network to imitate a single real cortical neuron.

### Slide 14 · One neuron cuts the court with a line

*On screen:* One neuron cuts the court with a straight line

**Time:** 2 min

**Say:** Now feed the neuron every position on Kobe's court. The colour shows the neuron's answer: orange where it says "made", blue where it says "missed". Whatever weights you choose, the border between the two colours is always a straight line. The arrow shows which side is orange. One neuron can only ever cut the court in two with one straight cut.

**Do:** "turn" rotates the arrow (this changes the two weights), "shift" slides the line (this changes the bias), "steepness" makes the colour change sharp or soft (all weights bigger or smaller). Start: the line is 10 ft out and the neuron says "made" for everything closer. Read the accuracy aloud: 54.5%, worse than "always miss" (55.4%)! Then let a student direct you: "turn it, shift it, beat 55%". The best they can find is about 59%: a line hugging the rim (shift about −1 ft), i.e. "made only if almost under the basket". Switch to ReLU once: the far side becomes plain paper, the neuron is simply off there.

**Ask:** Kobe scores near the rim and misses far away, in all directions. Can one straight line separate "near" from "far"?

**Answer:** No. "Near the rim" is a half-disc, and its border is curved. The best single line gets about 59% on these shots, only a little above "always miss" (55%). The 2-8-8-1 network we build later gets about 61%. We need several lines combined: a hidden layer.

Background: the line is where the sum is exactly 0 (w₁x + w₂y + b = 0). The arrow is the weight vector (w₁, w₂); it is always perpendicular to the line. The bias moves the line without turning it. Bigger weights do not move the line, they only make the transition sharper. Inputs here are court positions in units of 10 ft, the accuracy is measured on the 6,000 Kobe shots stored in the deck (500 are drawn).

### Slide 15 · On paper: one forward pass

*On screen:* One forward pass, by hand *(5 build steps)*

**Time:** 3 min

**Say:** Before any code, let's push one input through a tiny network by hand. Two inputs, two hidden ReLU neurons, one output neuron with a sigmoid. Copy the diagram and compute each step before I reveal it. Every neuron does the same three things you just saw: weigh, add, bend.

**Do:** Give 60 seconds for steps 1–2 on paper, then press → once per step. The numbers appear on the diagram:

- Step 1, hidden sums: top = 1·1 + (−1)·2 + 0 = **−1**; bottom = 0.5·1 + 1·2 − 1 = **1.5**.
- Step 2, ReLU: −1 becomes **0** (the top neuron is off, its arrow turns dotted), 1.5 stays **1.5**.
- Step 3, output sum: 2·0 + (−1)·1.5 + 0.5 = **−1**.
- Step 4, sigmoid: σ(−1) = 1/(1 + e¹) = **0.269**, "27% chance it goes in".
- Step 5, the shot was made (y = 1): loss = −ln(0.269) = **1.313**. A confident wrong-ish answer costs a lot; the loss section explains this.

**Ask:** The top hidden neuron output 0. How much does its outgoing weight (2) matter for this shot?

**Answer:** Not at all: 2 × 0 = 0. And during training it will also get zero gradient for this shot. If a ReLU neuron is off for every shot, it never learns again: a "dead ReLU" (next section).

Optional faded practice (E2) for fast students, the backward pass with learning rate 0.1: ∂L/∂z = p − y = −0.731; ∂L/∂w₂ = (0, −1.097); ∂L/∂b₂ = −0.731; the top hidden neuron gets gradient 0 (ReLU was off); bottom: ∂L/∂W₁ row 2 = (0.731, 1.462), ∂L/∂b₁ = (0, 0.731). After one step: w₂ = (2, −0.890), b₂ = 0.573, W₁ row 2 = (0.427, 0.854), b₁ = (0, −1.073); new p = 0.408, loss 0.896 (down from 1.313). All numbers checked in PyTorch.

### Slide 16 · Invent first: XOR with two ReLUs

*On screen:* Find weights that compute XOR *(3 build steps)*

**Time:** 3 min (2 min pair work, 1 min reveal)

**Say:** XOR is "one or the other, but not both". It is the function a single neuron cannot learn, the one that stalled the field in 1969. Your turn to be the training algorithm: in pairs, find weights and biases for this network of two hidden ReLU neurons so that the output matches the "want" column for all four inputs. The output neuron just adds, no bend.

**Do:** Press Start on the timer (3 min). Walk around. If a pair is stuck after a minute, give the hint: "let h₁ count how many inputs are on, and let h₂ fire only when both are on." Then press → to reveal the weights, → again for the table, → for the picture.

- Step 1: h₁ = ReLU(x₁ + x₂), h₂ = ReLU(x₁ + x₂ − 1), out = h₁ − 2·h₂.
- Step 2 (table): (0,0) → 0 − 0 = 0; (0,1) and (1,0) → 1 − 0 = 1; (1,1) → 2 − 2·1 = 0. Exactly XOR.
- Step 3 (picture): the output over the whole square. Orange where it is above 0.5. The orange band between two parallel lines covers (0,1) and (1,0), and leaves (0,0) and (1,1) outside. Two neurons = two cuts.

**Ask:** Is this the only answer?

**Answer:** No. Many weight settings work (for example swap the two hidden neurons, or scale weights and biases together). That is normal: training finds one of many good solutions, which is why different seeds give different networks.

Story (30 s): Minsky and Papert's book *Perceptrons* (1969) proved a single-layer perceptron cannot compute XOR. They knew multi-layer networks could, but nobody knew how to train the hidden layer. Rosenblatt's Mark I perceptron even had a hidden layer, wired at random, and only its last layer learned. Funding dried up until backpropagation was popularised in 1986: backprop is what lets the hidden layer learn. Do not say "they proved neural networks can't do XOR"; that is a common myth.

### Slide 17 · nn.Linear: one layer, a whole batch

*On screen:* nn.Linear(2, 8): eight neurons, every shot at once *(4 build steps)*

**Time:** 2 min

**Say:** In PyTorch you never write neurons one at a time. nn.Linear(2, 8) is a whole layer: 8 neurons, each looking at the same 2 inputs. And you never feed one shot at a time either: you feed a batch, here 32 shots, as a table with one row per shot. The layer gives back a table with one row per shot and one column per neuron.

**Do:** Before each press, ask the room to predict what the highlighted print will show; then press → to reveal.

- Step 1: Linear(2, 8) means 2 numbers in, 8 numbers out (the picture: 2 inputs wired to 8 neurons).
- Step 2: Y.shape is **(32, 8)**: the batch size stays, the 2 becomes 8. Highlighted row: one shot in, its 8 neuron outputs out.
- Step 3: layer.weight.shape is **(8, 2)**, not (2, 8). PyTorch stores one row per neuron (out × in). Many students guess (2, 8); that is the point of asking.
- Step 4: layer.bias.shape is **(8)**, one bias per neuron.

**Ask:** If I feed 1,000 shots instead of 32, does the layer need more weights?

**Answer:** No. The same 8 × 2 weights and 8 biases are applied to every shot. Y becomes (1000, 8). The number of parameters depends only on the layer sizes, not on the batch.

The maths behind it (for the coach): Y = X @ W.T + b, a matrix multiply (32×2)·(2×8) = (32×8), then the bias is added to every row ("broadcasting"). torch.allclose(layer(X), X @ layer.weight.T + layer.bias) returns True. The code on the slide was run in PyTorch 2.x and prints exactly torch.Size([32, 8]), torch.Size([8, 2]), torch.Size([8]). The activation (ReLU) is a separate step applied to every number of Y.

### Slide 18 · Count the parameters

*On screen:* The Kobe network has 105 numbers to learn *(5 build steps)*

**Time:** 2 min

**Say:** Every arrow is one weight, and every neuron after the inputs has one bias. Learning means finding good values for all of these numbers. Let's count them for the network you will build for the Kobe task: 2 inputs, two hidden layers of 8, one output.

**Do:** Press → for each layer and let the room call out the number first. Step 1: 2×8 weights + 8 biases = **24**. Step 2: 8×8 + 8 = **72**. Step 3: 8×1 + 1 = **9**, total **105**. Then give pairs 1 minute for the two questions on the right, and reveal: step 4, 2-16-1 = 2×16 + 16 + 16×1 + 1 = **65**; step 5, 784-128-10 (an MLP for 28×28 digit images) = 784×128 + 128 + 128×10 + 10 = **101,770**.

**Ask:** 2-16-1 has fewer parameters than 2-8-8-1 (65 vs 105). Is it allowed in the Kobe task?

**Answer:** No. The rule is "at most 3 linear layers, at most 8 neurons in each", not a parameter budget. 16 neurons in one layer breaks it, and a rule-breaking submission scores 0. 2-8-8-1 is the largest legal network.

Rule of thumb: nn.Linear(in, out) has in × out + out parameters. In PyTorch, check with sum(p.numel() for p in model.parameters()). All counts verified in PyTorch.

### Slide 19 · Forward pass, animated

*On screen:* Click a spot: the numbers flow through

**Time:** 2 min

**Say:** This is a real 2-8-8-1 network, the largest the Kobe task allows, already trained on 20,000 of Kobe's shots. The court colour is its answer everywhere: orange where it thinks he scores more often, blue where he misses more. Click a spot and watch the forward pass: the position goes in on the left, each layer does weigh-add-bend, and a chance comes out on the right.

**Do:** It starts on a mid-range shot from the left elbow (about 41%). Click "Rim": about 60% (the inputs are 0 there, so the first arrows carry nothing and only the biases matter). Click "Corner 3": about 35%. Click "Half court": about 4%. Then click anywhere on the court. Point out: thick orange arrows push the next neuron up, thick blue ones push it down, dotted ones carry nothing because the neuron before them is off (0). Yellow fill = how strongly a neuron fires. The number in the output circle is the raw score (logit); the sigmoid turns it into the percentage. "Real shot" picks one of Kobe's real shots and shows what really happened. Optional: "lines on" draws each first-layer neuron's straight cut on the court; the curved orange zone near the rim is built from these straight cuts.

**Ask:** Even at the rim the network only says about 60%. Is the network bad?

**Answer:** No, basketball is noisy. Kobe made only 62.5% of his shots at the rim, so no model can be sure. This network is right 61.8% of the time on shots it never saw, versus 55% for "always miss". That is close to the best anyone gets on this data.

Background: inputs are the court position in units of 10 ft (x across, y away from the rim), so the rim is (0, 0) and half court is y ≈ 4.1. Some hidden neurons show 0 for every position you click: they are "dead" ReLUs (one in the first layer, three in the second), which is common and is discussed in the activations section. The weights were trained in PyTorch with Adam (lr 0.01, 25 epochs, batch 64); validation log loss 0.660, accuracy 61.8%.

### Slide 20 · An MLP in PyTorch

*On screen:* The same network, in PyTorch *(4 build steps)*

**Time:** 2 min

**Say:** Here is the Kobe network as PyTorch code. A model is a class with two parts. __init__ builds the parts: three linear layers and two ReLUs; this is where the 105 numbers live. forward says the route the data takes through the parts. You never call forward yourself: you write model(x) and PyTorch calls it for you.

**Do:** Step 1 highlights __init__ (the parts list on the right). Step 2 highlights forward (the arrows appear: the route). Step 3: create the model, feed 32 random shots: the output shape is (32, 1), one number per shot, and the parameter count is 105, the same as we counted by hand. Step 4: the Kobe-task warning.

**Ask:** The last line returns fc3(x) with no sigmoid. Is that a bug?

**Answer:** No, it is deliberate. The model outputs a raw score, a "logit"; the loss function BCEWithLogitsLoss applies the sigmoid inside, in a numerically safe way. To get a probability for a report, use torch.sigmoid(model(x)). (The loss section explains this; the Kobe grader only measures accuracy, so a final nn.Sigmoid is also acceptable there.)

Kobe task rules to repeat now: only linear layers with allowed activations after them (ReLU, Sigmoid, Tanh, ELU, LeakyReLU, PReLU), at most 3 linear layers with at most 8 neurons each, and build the layers directly as attributes like this. A model wrapped in nn.Sequential gets a score of 0 because the checker cannot see inside it. The official baseline class is called MyModel with no constructor arguments; keep that name. The code on this slide was run in PyTorch: printing the model lists fc1, act1, fc2, act2, fc3, and the counts match.

### Slide 21 · Same recipe, different scale

*On screen:* Same recipe, 1.7 billion times bigger *(4 build steps)*

**Time:** 1 min

**Say:** Each square's area is a number of parameters. Our Kobe network has 105. Watch what happens when we zoom out.

**Do:** Press → four times: a digit-recognition MLP (101,770), AlexNet from 2012 (60 million, the network that started the deep-learning boom), GPT-3 from 2020 (175 billion). At the GPT-3 zoom, the Kobe network's square is far smaller than one pixel. Last press: the punchline.

**Ask:** GPT-3 is a chatbot model, not an MLP. Which of today's parts does it use?

**Answer:** All of them. About two thirds of GPT-3's 175 billion parameters sit in MLP blocks just like ours: Linear(12288 → 49152), GELU, Linear(49152 → 12288), repeated in each of its 96 layers. It is trained with backprop and Adam. The recipe is the same; the scale is 1.7 billion times bigger (175,000,000,000 / 105 ≈ 1.67 × 10⁹).

Sources: GPT-3 175 billion parameters, 96 layers, width 12288, feed-forward width 4 × 12288 (Brown et al. 2020); AlexNet 60 million (Krizhevsky et al. 2012). Do not quote parameter counts for newer models: they are not officially published. Data per parameter is a nice contrast: Kobe's net sees about 245 labelled shots per parameter, GPT-3 saw about 1.7 words per parameter.


---

## 3 · Activations: any function — 22 min (0:40–1:02)

### Slide 22 · Predict: 10 linear layers vs 1

*On screen:* 10 layers with no activation. Versus 1 layer? *(1 build step)*

**Time:** 1.5 min

**Say:** Here is a question to vote on. I stack ten Linear layers, one after another, with nothing in between. Compare that with a single Linear layer. Can the tall stack draw more shapes, the same shapes, or fewer?

**Do:** Give 20 seconds of silence, then a show of fingers: 1, 2 or 3. If the room is split, give one minute to argue with a neighbour and vote again. Then press → to reveal.

**Answer:** 2, the same. A Linear layer only stretches, turns and shifts. Do that ten times and you still only stretched, turned and shifted: you could have done it in one go. So the stack still draws one straight boundary line.

Background, if a student asks for the algebra (do not put it on the board unless asked): two layers give W₂(W₁x + b₁) + b₂ = (W₂W₁)x + (W₂b₁ + b₂), which is again "a matrix times x plus a vector". Example: W₁ = [[1,2],[0,1]], b₁ = (1,0), W₂ = [1,−1], b₂ = 3 collapses to W = [1,1], b = 4. We checked numerically that 10 random stacked layers equal one layer to 6·10⁻⁸ (float rounding).

Common mistake: "more weights must mean more power". Training can behave differently, but the set of functions is exactly the same.

### Slide 23 · No activation: still one line

*On screen:* No activation: 105 weights, still one line

**Time:** 2 min

**Say:** Let us check the vote with a real network. This is a 2-8-8-1 network, 105 weights, with no activation between the layers. Watch what it does with the circle.

**Do:** Press Train. The boundary stays one straight line and the accuracy stays near 50%: all 105 weights behave like one neuron. Press Pause. Now click **ReLU** under "between the layers" and press Train again: within a few seconds the boundary bends around the orange disk and the accuracy climbs towards 100%. Optionally try **tanh**: a smooth round boundary.

**Ask:** What exactly did we change between the two runs?

**Answer:** Only one thing: a bend (the activation) after each hidden neuron. Same data, same 105 weights, same optimizer. The bend is what lets depth add power.

Why it works: with ReLU every hidden neuron becomes "a line, but flat on one side". Combining many such bent ramps gives polygons, which is why the ReLU boundary looks slightly angular.

### Slide 24 · The activation zoo

*On screen:* Any bend will do: the activation zoo *(1 build step)*

**Time:** 1.5 min

**Say:** So we need a bend after each neuron. Any bend works; these are the five you will meet. ReLU: zero for negative inputs, the input itself for positive ones. Leaky ReLU: the same, but with a small slope on the left. Sigmoid: squashes everything into 0 to 1. tanh: the same S-shape, but from −1 to 1. GELU: a smooth ReLU, used in transformers like ChatGPT.

**Do:** Press → to show the magenta dashed curves: the **slope** of each activation. Then sweep the pointer from left to right across the sigmoid plot and stop at the middle.

**Ask:** Look at the sigmoid's slope. What is the largest it ever gets?

**Answer:** 0.25, at input 0 (the readout says 0.25). Far from 0 the sigmoid is flat and its slope is almost 0. ReLU's slope is exactly 1 for every positive input. Keep this in mind: during backprop every layer multiplies the gradient by this slope, which will matter in five minutes.

Background: σ(z) = 1/(1+e^(−z)); tanh(z) = 2σ(2z) − 1; ReLU(z) = max(0, z); Leaky ReLU is drawn with slope 0.1 on the left so it is visible (PyTorch's default is 0.01); GELU(z) = z·Φ(z) has a small dip, minimum −0.17 near z = −0.75. Analogy that works: ReLU is a one-way valve (a diode, hence the name "rectifier"). Avoid saying "the activation decides whether the neuron fires": modern activations are continuous, not on/off switches.

History in one sentence: ReLU-like units go back to Fukushima in 1969; the name "rectified linear unit" comes from Nair and Hinton in 2010; in 2012 AlexNet reported that ReLU reached its training target six times faster than tanh.

### Slide 25 · Invent: a hat from ReLUs

*On screen:* Build this hat from three ramps *(1 build step)*

**Time:** 3 min

**Say:** Your turn to invent. You may use ramps: a ramp is a ReLU that stays flat at 0 and then rises with slope 1, starting at a point you choose. Here we have three ramps, starting at 0, at 1 and at 2. Choose how much of each to add, positive or negative, so that the sum is the dashed hat: 0, up to 1, back down to 0, and flat 0 afterwards.

**Do:** Pairs, 2 minutes, on paper. Then take suggestions and try them live with the three sliders: the faint lines are the individual ramps, the thick line is their sum, and the readout says "✓ a hat" when it matches exactly. A good path: start (ramp at 0 = +1, already there) → "it keeps going up, so bend it down at 1" → students usually try −1 first: flat after 1, not down. Ask "how steep must it fall?" → −2. Now it falls forever → "+1 at 2 to stop it". Press → to reveal the answer (the sliders jump to +1, −2, +1).

**Ask:** Each slider is the weight of one hidden neuron going to the output. What does a weight do to the slope of the curve?

**Answer:** It changes the slope at that ramp's starting point by exactly that amount: +1 makes it rise, −2 turns rising (+1) into falling (−1), +1 makes it flat again. Each ReLU adds one bend.

**Ask:** Follow-up for fast pairs: how would you build a staircase? A bump in 2-D?

**Answer:** A staircase: many steep ramp pairs (up, then flatten) placed side by side. In 2-D: hats along x and along y, added, then a second layer that keeps only where both are high.

For the coach: this hat is a real PyTorch network, 1 input, 3 hidden ReLUs, 1 output (tested):

```
hidden = nn.Linear(1, 3); out = nn.Linear(3, 1)
with torch.no_grad():
    hidden.weight[:] = torch.tensor([[1.], [1.], [1.]])
    hidden.bias[:] = torch.tensor([0., -1., -2.])
    out.weight[:] = torch.tensor([[1., -2., 1.]])
    out.bias[:] = 0.
    x = torch.tensor([[0.], [1.], [2.], [3.]])
    print(out(torch.relu(hidden(x))))   # 0, 1, 0, 0
```

### Slide 26 · Any curve from hinges

*On screen:* More hinges, any curve *(2 build steps)*

**Time:** 1.5 min

**Say:** The hat was one building block. Now the dashed curve is any wiggly curve, and each white dot is a hinge: one hidden ReLU neuron. With only three hinges the best we can do is a rough zig-zag. Watch the thick line as we add hinges.

**Do:** Press → for 8 hinges, → again for 32 (or click the numbers under "hinges"). The readout "error" (mean squared error) drops from about 0.1 to almost zero. With ≤ 8 hinges the faint lines show each neuron's own ramp.

**Ask:** If I want the error ten times smaller, what do I do?

**Answer:** Add more hinges, that is, more neurons in the hidden layer. One hidden layer is a "connect-the-dots machine": every extra neuron is an extra dot where the line may bend.

How the weights are chosen here: the hinge positions are evenly spaced, and the output weights are the best possible ones (least squares, solved exactly in the browser). On the next slides gradient descent will have to find them on its own. Analogy that works: Lego skyline. With enough thin bricks you can copy any skyline.

### Slide 27 · Steep S-curves make bumps (optional)

*On screen:* Steep S-curves make bumps, then curves *(2 build steps)*

**Time:** 1 min · optional, cut if late

**Say:** Does this only work with ReLU? No. Here is the same trick with sigmoid neurons. One sigmoid neuron is an S-curve; make its weight large and it becomes a sharp step.

**Do:** Drag "steepness" up to about 100: the S becomes a step. Press →: two steps, one up and one down, make a bump. Press → again: 16 bumps side by side, each as tall as the curve at its spot, rebuild the dashed curve. Drag steepness down and up again to show blurry vs. sharp blocks; switch between 4 and 32 bumps.

**Ask:** How many hidden neurons does the 16-bump curve use?

**Answer:** 32: every bump needs two sigmoid neurons (a step up and a step down).

Source: Michael Nielsen's free online book *Neural Networks and Deep Learning*, chapter 4, "A visual proof that neural nets can compute any function". Good link for curious students afterwards; it also builds 2-D "towers" the same way.

### Slide 28 · Gradient descent finds the hinges

*On screen:* Training finds the hinges by itself

**Time:** 1.5 min

**Say:** So far we placed the hinges by hand. A real network starts from random weights and must find them with gradient descent, the same training you know from logistic regression. Here is a 1-4-1 ReLU network learning the dots.

**Do:** Press Train: with 4 neurons the line gets the rough shape but cannot follow the wiggles (error about 0.014). Click **2 neurons** and Train: worse (about 0.06). Click **32 neurons** and Train: it first hesitates, then snaps onto the curve within about 8 seconds (error near 0.0002). Point at the corners in the thick line: those are the hinges the network found by itself.

**Ask:** With 32 neurons the training paused for a few seconds at a bad fit before improving. Why could that happen?

**Answer:** Gradient descent only walks downhill from where it starts; it can crawl across flat stretches. Having enough neurons makes a good fit possible; it does not make finding it instant. That is the theme of the next slide.

### Slide 29 · Universal approximation theorem

*On screen:* One wide layer can copy any curve *(4 build steps)*

**Time:** 2 min

**Say:** What we just built has a name: the universal approximation theorem. Cybenko proved it in 1989 for sigmoids, and Hornik in 1991 showed the type of bend hardly matters. In words: one hidden layer with enough neurons can copy any smooth curve, as closely as you like, inside a bounded range. It is a true and important theorem. But students often read far more into it than it says.

**Do:** Press → four times, one "does not promise" at a time, and say one sentence for each:

- **Training will find it.** The theorem says good weights exist; we just saw gradient descent hesitate.
- **How many neurons.** It may need a huge number, especially with many inputs.
- **Good guesses on new, noisy data.** A wide net can also copy the noise. Kobe's shots are noisy: even at the rim he scored only about 62%.
- **Anything outside the data.** On the last step the right plot shows the trained network outside its data: ReLU networks continue as straight lines, wherever those happen to point.

**Ask:** The Kobe data has no shots from beyond about 79 feet. What will a ReLU network predict for a shot from 300 feet?

**Answer:** Something arbitrary. Far from the data a ReLU net is just a straight line in the input, so its score keeps growing or shrinking. The theorem only covers the range you trained on.

**Ask:** Does the theorem guarantee our 2-8-8-1 network can reach loss 0 on Kobe?

**Answer:** No, twice over: 8 neurons per layer is a fixed, small width, and the target itself is noisy (the same spot sometimes scores, sometimes not), so no model can predict every shot.

Precise statement for the coach: a network with one hidden layer and any non-polynomial activation can approximate any continuous function on a compact set to any accuracy, given enough hidden units (Cybenko 1989; Hornik, Stinchcombe and White 1989; Hornik 1991; Leshno et al. 1993). Analogy: the Lego skyline: the bricks exist, but nobody gives you the building instructions, and they do not tell you tomorrow's skyline.

### Slide 30 · Depth folds space

*On screen:* Every layer folds: the pieces double *(4 build steps)*

**Time:** 2 min

**Say:** If one wide layer can already copy anything, why do people stack many layers? Because each layer can fold the space. This network has only 2 ReLU neurons per layer. One layer makes a single tent: up, then down. Feed that tent into an identical layer, and each half gets folded again: two tents. Every new layer doubles the number of straight pieces.

**Do:** Bring a strip of paper. Fold it in half, in half again, in half again (3 folds), unfold it: 8 panels, like the 8 pieces at 3 layers. Then press → to go from 1 to 5 layers (or click the layer numbers). The dashed line is the previous depth; the readouts count neurons and pieces.

**Ask:** At 5 layers we use 10 neurons and get 32 pieces. How many neurons would a single hidden layer need for the same zig-zag?

**Answer:** At least 31: in one layer, each neuron adds at most one bend, and 32 pieces need 31 bends. At 10 layers: 20 neurons deep versus at least 1,023 in one layer. Depth can be exponentially cheaper.

Background: each layer computes tent(z) = 2·ReLU(z) − 4·ReLU(z − ½) on [0, 1], which needs exactly 2 ReLUs; composing it k times gives 2ᵏ linear pieces (we checked k = 1…6 numerically). This is Telgarsky's 2016 "benefits of depth" construction (also Montúfar et al. 2014, "folding"). Honest caveat for strong students: a randomly initialised deep network does not automatically have exponentially many pieces; the weights have to be special, like these.

### Slide 31 · Vanishing gradients

*On screen:* Through sigmoids, the gradient fades away *(1 build step)*

**Time:** 1.5 min

**Say:** Remember the sigmoid's slope: at most 0.25. Backprop multiplies by that slope once per layer, on the way back from the loss to the first layer. So after ten sigmoid layers the signal is at best 0.25 to the power 10, about one millionth. These bars are measured in PyTorch on a fresh 10-layer network: how big the gradient is at each layer.

**Do:** Point at the sigmoid row: the last layer (right) gets a gradient of about 0.37, the first layer (left) about 0.0000003: a million times smaller. The first layers barely learn. Press → for the ReLU row: every layer gets a gradient of similar size, because ReLU's slope is exactly 1 wherever it is active.

**Ask:** The scale on the left jumps by a factor of 1,000 per grid line. Why draw it like that?

**Answer:** On a normal scale the sigmoid bars for the first layers would be invisible, which is exactly the problem: they are effectively zero.

Setup (our run): 10 hidden layers of 64 neurons, a batch of 256 random inputs, MSE on random targets, at initialisation; sigmoid with Xavier initialisation, ReLU with Kaiming (He) initialisation; norm of each layer's weight gradient, geometric mean of 5 seeds. tanh (not shown) stays flat around 0.12–0.14 per layer. Analogy: a dimmer switch stuck at the ends: turning the knob further does nothing, so the gradient is about zero. This is one big reason ReLU replaced sigmoid in hidden layers around 2010–2012.

### Slide 32 · Dead ReLU

*On screen:* A ReLU that never fires never learns

**Time:** 1.5 min

**Say:** One danger of ReLU. A hidden neuron is a line on the court: on one side (shaded) it outputs a positive number, on the other side exactly 0. Bright shots are on its active side; faded shots get 0. Backprop only sends learning signal through shots where the neuron is active.

**Do:** Drag "move the line" to the right: the line moves up the court and fewer shots stay bright. At about 45 ft no shot is active any more: the readout says "0 ✗ dead". This neuron outputs 0 for every shot, its slope is 0 for every shot, so its gradient is 0 and it never moves again. Then click **Leaky ReLU**: the inactive side now passes a little signal (slope 0.01), so the neuron can still come back.

**Ask:** The Kobe task allows at most 8 neurons per layer. Why is a dead neuron worse there than in a big network?

**Answer:** Each dead neuron costs 1/8 = 12.5% of the layer. Three dead neurons lose over a third of a tiny network.

How it happens: a too-large learning rate throws a neuron's line off the data in one step (in our test with a 2-64-64-1 net, learning rate 3.0 killed 56% of the second layer, versus about 9% at 0.01), or unscaled inputs. Fixes: a smaller learning rate, scaled inputs, a different seed, or Leaky ReLU / ELU / tanh (all allowed in the Kobe task). Link to the paper exercise E2: there hidden unit 1 got gradient 0 for one input; a dead neuron is that, for every input.

### Slide 33 · ReLU or tanh on Kobe?

*On screen:* On Kobe: ReLU or tanh? *(2 build steps)*

**Time:** 1.5 min

**Say:** Back to Kobe. Same 2-8-8-1 network, same training, only the activation changes: ReLU or tanh. Which one predicts his shots better? Vote.

**Do:** Hands up for ReLU, then for tanh. Press → to reveal. The grey dots are the baselines you know: always predicting 44.6% (0.688) and logistic regression (0.675).

**Answer:** Practically a tie: ReLU 0.662, tanh 0.664 (validation log loss, average of 3 seeds, our PyTorch runs on the real data). Changing Adam's learning rate from 1e-3 to 1e-2 moves the result by the same tiny amount (to 0.660). For tiny networks, input scaling and the learning rate matter more than the activation. Try both, with several seeds.

**Do:** Press → for the rule of thumb. Stress the last row: the model's last layer has **no** activation. It outputs a raw score (a "logit"), and the loss function adds the sigmoid itself. We will see in the next section what goes wrong if you add your own sigmoid.

Kobe task rule: only nn.ReLU, nn.Sigmoid, nn.Tanh, nn.ELU, nn.LeakyReLU and nn.PReLU are allowed after the linear layers.

### Slide 34 · Quiz: activations

*On screen:* Quick check: write your answers *(4 build steps)*

**Time:** 1 min

**Say:** Thirty seconds, write four answers on paper, no looking back.

**Do:** Then press → four times to reveal one answer at a time. Ask for hands: "who had this right?"

- ReLU(−5) = 0: negative inputs are cut to zero.
- sigmoid(0) = 0.5: a score of 0 means a 50/50 guess.
- 0.25, in the middle: that is why ten sigmoid layers shrink the gradient to about a millionth.
- One straight line, accuracy near 50%: without a bend, ten layers or one are the same.

If many miss question 4, go back two minutes to the live demo (slide "No activation: still one line") before moving on.


---

## 4 · Loss: how wrong are we? — 13 min (1:02–1:15)

### Slide 35 · Squared error: big misses cost the most

**Time:** 1.5 min

**Say:** The loss is one number that says how wrong the model is. Training means making that number small, nothing more. Here is the simplest one. We predict a number: what share of Kobe's shots go in, from how far away he shoots. The dots are the real answers from 25,697 of his shots. The black line is our model.

**Say:** For every dot we take the miss, the vertical gap between the dot and the line, and draw a square on it. The loss is the average size of those squares. That is the mean squared error.

**Do:** Start: the line is flat at 44%, a model that ignores distance. Point at the huge square at 0–4 ft (Kobe makes 62% there): one big miss dominates. Drag an end dot to tilt the line and show that squares grow and shrink. Then press **Fit the line**: the line tilts until the total area is smallest (loss 64 → 18). Reset if you want to replay.

**Ask:** A miss of 10 points costs 100. What does a miss of 20 points cost?

**Answer:** 400, four times as much, not twice. Squaring makes big misses very expensive, so the line works hardest to avoid them.

Background for you: MSE = average of (prediction − target)². PyTorch: `nn.MSELoss()`. It is the loss for predicting numbers (regression), which is what the inversion task's frozen model does. The "Fit" button runs gradient descent on the loss, the same thing every training run does. The numbers are percentage points squared, so don't worry about units: only "smaller is better" matters. If a student asks about outliers: because of the squaring, one crazy data point can pull the line a lot; other losses (absolute error, Huber) are gentler.

### Slide 36 · Confident and wrong costs the most

*(5 build steps)*

**Time:** 2.5 min

**Say:** For yes/no questions the model gives a forecast, like a weather forecaster: "90% chance it goes in." Kobe takes the shot and it goes in. How should we punish the forecast? Four forecasters said 90%, 50%, 10% and 0.1%. Rank them from best to worst, and guess how much worse the last one is than the first.

**Do:** Give 60 seconds: students rank the four forecasts with a neighbour and guess the loss numbers. Then press → four times: each press reveals one forecast's loss and grows the curve. The last press is the dramatic one: 0.1% costs 6.91, 66 times the loss of the 90% forecaster.

**Say:** A hesitant wrong answer (50%) costs 0.69. A confident wrong answer (0.1%) costs almost 7, and saying exactly 0% would cost infinity. That is why a model trained with this loss learns to be honest about uncertainty: Kobe is a noisy shooter, so a good model rarely says more than about 60%.

**Do:** Fifth press: a slider and a "went in / missed" switch appear. Drag the forecast; flip to "missed" and the curve mirrors: now a high forecast is the expensive one.

**Ask:** The shot is missed and the forecast was 90%. What is the loss?

**Answer:** 2.30, the same as forecasting 10% for a made shot: the loss only looks at the chance you gave to what really happened.

Background: this is binary cross-entropy, also called log loss: loss = −ln(chance you gave to what happened), averaged over all shots. Values: 90% → 0.105, 50% → 0.693, 10% → 2.303, 0.1% → 6.908 (natural log). It is the official metric of the Kaggle Kobe competition. "Surprise meter" is a good image: the loss is how surprised the model was. It is the same loss as in logistic regression, which they know.

### Slide 37 · Why not use accuracy as the loss?

*On screen:* Accuracy is flat: no way downhill *(2 build steps)*

**Time:** 1.5 min

**Say:** We care about accuracy, so why not train on accuracy directly? Here are Kobe's 13 shots from one game, by distance: orange went in, blue missed. Our tiny model has one knob, the black line: closer than the line, it says "in"; farther, "miss".

**Do:** Step 0: drag the black line slowly to the right. The "% wrong" curve is a staircase: it only changes when the line jumps over a shot. Stop on a flat part.

**Ask:** Standing here, which way should the line move to get better?

**Answer:** You can't tell: the ground is flat on both sides (slope 0). Gradient descent needs a slope, and accuracy gives zero slope almost everywhere.

**Do:** Press → : the log loss appears. It is smooth, so at every position there is a slope; the magenta arrow points downhill. Press → again and click **Roll downhill**: the line slides by itself to the bottom of the log loss (about 17 ft). Drag it somewhere else and roll again.

**Say:** So we train on a smooth loss and only report accuracy at the end. The loss is the compass, accuracy is the scoreboard.

Background: to make the loss smooth, the model gives a forecast instead of a hard yes/no: forecast = σ((t − distance)/3 ft), so shots near the line get forecasts near 50%. Students may notice that the bottom of the log loss (≈ 17 ft, 23% wrong) is not the best accuracy (15% wrong at 14–16 ft): the loss and the metric are not identical, and that is normal. The data are the 13 labelled shots of the 7 Dec 2015 game at Toronto in the Kaggle file.

### Slide 38 · The model outputs a score (logit)

*On screen:* The model outputs a score, not a % *(1 build step)*

**Time:** 1.5 min

**Say:** One important word: logit. The last layer of our network is a plain linear layer, so it outputs any number, like −3 or +2.5. We call that number the score, or logit. It is not a percentage yet. The S-shaped sigmoid turns it into a chance: score 0 means 50%, +2 means 88%, −2 means 12%.

**Do:** Drag along the curve (click anywhere on it): show 0 → 50%, +2 → 88%, −2 → 12%, and that even +6 never quite reaches 100%. Then press → to show the pipeline. The numbers in the pipeline follow the dot: drag again and watch score → % → loss update.

**Say:** In PyTorch the model stops at the score. The loss, `nn.BCEWithLogitsLoss`, applies the sigmoid itself, then the log. "With logits" in the name means: give me the raw scores. When you need the actual percentage, for a submission or to look at, you call `torch.sigmoid(score)` yourself.

**Ask:** Why let the loss do the sigmoid instead of the model?

**Answer:** It is more accurate on a computer. For a very confident wrong score (say −120) the sigmoid rounds to exactly 0 in float32, and log(0) breaks. Done together, the loss computes it exactly (120) and still gives a useful gradient.

Background: logit = log-odds, z = ln(p / (1 − p)); σ(z) = 1/(1 + e^(−z)). The PyTorch docs: BCEWithLogitsLoss "combines a Sigmoid layer and the BCELoss in one single class" and is "more numerically stable". Remember this slide: the last slide of this section asks what happens if you add a sigmoid to the model anyway.

### Slide 39 · Predict: the first loss of a fresh network

*On screen:* Untrained network on Kobe: first loss? *(2 build steps)*

**Time:** 1.5 min

**Say:** Before any training, the network's weights are random and small, so every score comes out close to 0. What is the first loss it prints on Kobe's shots? Pick 1, 2, 3 or 4.

**Do:** 30 seconds of thinking, then everyone shows fingers at once. Press → to reveal 0.69.

**Say:** Score 0 means 50% for every shot, a coin flip. A 50% forecast costs 0.69 whether the shot goes in or not, so the average is 0.69. This is your first sanity check in every project: if the first printed loss is 2 or 50, something is broken before you have even started.

**Do:** Press → again. Point at the two numbers.

**Say:** We really ran five fresh networks: all around 0.69. And the simplest honest model, "every shot has a 44.6% chance", Kobe's overall average, scores 0.687. That is the number your network has to beat. Notice how close it is to 0.69: all the real learning happens in the last few hundredths.

**Ask:** If a classmate's network finishes training at 0.688, what has it learned?

**Answer:** Basically nothing beyond Kobe's average. Below 0.687 it starts using where he shot from.

Background: −ln 0.5 = ln 2 = 0.693. Best constant: −[0.446·ln 0.446 + 0.554·ln 0.554] = 0.687. The five values are 2-8-8-1 ReLU networks with PyTorch's default initialisation, standardised inputs, seeds 0–4, on all 25,697 labelled shots. Karpathy's training recipe calls this "verify loss @ init". After the break, in the live coding, we will see a first loss that is far from 0.69, and why.

### Slide 40 · Pick the loss from what you predict

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

### Slide 41 · Cliffhanger: sigmoid + BCEWithLogitsLoss

*On screen:* A sigmoid at the end. What happens? *(2 build steps)*

**Time:** 2 min

**Say:** Last question before the break. A classmate thinks: "my model should output a chance, so I'll put a sigmoid at the end", and keeps BCEWithLogitsLoss. What happens when they train? 1 crash, 2 trains normally, 3 trains but is quietly worse, 4 the loss becomes NaN.

**Do:** → highlights the two lines that matter (the sigmoid in the model and the loss). 30 seconds of silent thinking, then everyone votes with fingers at once. Note the rough counts on the board.

**Do:** → Discussion: one minute with a neighbour, ideally with someone who voted differently. Then vote again and write the new counts next to the old ones.

**Say:** Don't tell them the answer, even if they ask. Say: "We'll run it live after the break and you'll see." Leave the vote counts on the board.

**Do:** Hint you may give if the room is stuck: "Remember the logits slide: what does BCEWithLogitsLoss do first with whatever it receives?"

For you only (the reveal is in "The training loop, live"): the answer is 3. Nothing crashes and nothing is NaN. The loss applies a second sigmoid, so the chance it sees is σ(σ(z)), always between 50% and 73%. The printed loss looks normal and accuracy stays around 61%, but the real outputs become extreme (76% of them below 1% or above 99%), and the true log loss of what you would submit is 4.69 instead of 0.662. Good discussion arguments to listen for: "it double-squashes" (correct), "it crashes because of shapes" (no, shapes are fine), "NaN because log(0)" (no, the inner sigmoid never reaches exactly 0 here).


---

## 5 · Break — 10 min (1:15–1:25)

### Slide 42 · Break: 10 minutes

*On screen:* Ten minutes *(6 build steps)*

**Time:** 10 min break + 3 min game after it

**Do:** The timer starts by itself when this slide appears (Pause/Reset if needed). Leave the slide up; students can think about the six statements during the break. After the break, read each statement aloud, students hold up a hand for "true" or a fist for "bluff", then press → to reveal the verdict and tell the one-line story.

1. **True.** NYT, 8 July 1958: the Navy revealed "the embryo of an electronic computer that it expects will be able to walk, talk, see, write, reproduce itself and be conscious of its existence." The hype was enormous for a machine that drew one straight line.
2. **Bluff.** Minsky & Papert's 1969 book proved that a *single-layer* perceptron can't compute XOR. They knew multi-layer networks could represent it but doubted they could be trained. The book was read as a verdict on all neural nets and funding dried up. Backprop (popularised in 1986) answered it; the XOR network from section 2 has just two hidden neurons.
3. **True.** Geoffrey Hinton (Reddit AMA, 2016): his bank kept moving tellers around, he guessed it was to stop employees cooperating to defraud the bank, and realised that randomly removing different neurons on each example would stop neurons from "conspiring" — that is, from overfitting.
4. **True.** Krizhevsky, Sutskever and Hinton trained AlexNet for five to six days on two GTX 580 gaming cards, and won ImageNet 2012 with 15.3% top-5 error against 26.2% for second place. That started the deep-learning boom.
5. **True** (as reported by Quanta Magazine). At OpenAI, a team member went on vacation and forgot to stop a run; the network, long after memorising its training set, suddenly generalised perfectly. "We got lucky… and by lucky, I mean forgetful."
6. **Bluff.** Augustin-Louis Cauchy described steepest descent in 1847, more than a century before neural networks. "Your optimizer's grandfather was born in 1847."


---

## 6 · Gradient descent and optimizers — 22 min (1:25–1:47)

### Slide 43 · After the break: six questions

*On screen:* From memory: six questions, no notes *(6 build steps)*

**Time:** 3 min

**Say:** Welcome back. Before we go on, six quick questions about the first half. Write your answers on paper, alone, no notes. You have two minutes. Getting them wrong now is fine: trying to remember is what makes it stick.

**Do:** Give 2 minutes of silence. Then press → six times; each press reveals one answer. For each, ask for a show of hands "who had it?" before you say why.

- **Q1**: two linear layers in a row are just one linear layer (multiply two matrices and you get one matrix), so the network can still only draw a straight line. The activation bends it.
- **Q2**: the sigmoid is steepest in the middle, slope 0.25. Through 10 sigmoid layers the gradient shrinks by at least 0.25¹⁰ ≈ one millionth: vanishing gradients.
- **Q3**: an 8×8 weight matrix (64) plus 8 biases = 72.
- **Q4**: a fresh network says "50/50" for everything, and −ln(0.5) = 0.693. If your first printed loss is 2 or 50, something is broken.
- **Q5**: 0.001 (written 1e-3), both in the Adam paper and in PyTorch. Today we will see why it is a default, not a law.
- **Q6**: the theorem only says good weights exist for a wide enough network. It does not say gradient descent will find them, how many neurons you need, or that the network will be right on new data or outside the region you trained on.

If many students miss Q1 or Q4, spend 30 more seconds there: both come back in the next hour.

### Slide 44 · One step downhill, on paper

*On screen:* Each step: move against the slope *(4 build steps)*

**Time:** 2 min

**Say:** Gradient descent with one weight. The loss is this bowl, lowest at w = 3. Our ball sits at w = 0. The rule is: look at the slope under your feet, and step the other way. How far? Learning rate times slope.

**Do:** Ask the question first and let everyone write a number. Then → (1): the dashed magenta line is the slope at w = 0: −6 (the bowl goes down to the right). → (2): move = 0.1 × 6 = 0.6, to the right because the slope is negative. → (3): the ball is now at w = 0.6. → (4): the whole rule in one line.

**Ask:** The slope is −6. Which way do we move, and why "minus" slope?

**Answer:** Right. A negative slope means "downhill is to the right", so we move by −lr × slope = +0.6. The minus sign always turns "uphill" into "downhill".

Maths for you (do not put on the board unless asked): loss = (w − 3)², slope = 2(w − 3) = −6 at w = 0, new w = 0 − 0.1 × (−6) = 0.6. The next steps are 1.08, 1.464, … approaching 3. Picture for students: a hiker in thick fog who only feels the slope under their boots. Fun fact: this method is from Augustin-Louis Cauchy, 1847, a century before neural networks.

### Slide 45 · The learning rate, live

*On screen:* Too small crawls, too big explodes

**Time:** 3 min

**Say:** Same bowl, same ball, but now we let it run, and we change only one number: the learning rate. Below the bowl you see where the weight is after each step; the dashed line is the bottom.

**Do:** For each value, first ask "what will happen?", then click it and press **Run** (5 steps per second, at most 40 steps; **Reset** restarts). Order: **0.3** (the default when the slide opens), then **0.02**, then **0.9**, then **1.05**.

- **0.3**: big confident steps, at the bottom (within 0.01) after 7 steps.
- **0.02**: tiny steps; after 40 steps it is still 0.6 away (it needs 140 steps). Too small = slow, wasted time.
- **0.9**: the ball jumps over the bottom to the other wall every step (0 → 5.4 → 1.08 → 4.54 …) but each jump is smaller; it arrives after 26 steps. In the w-plot it zig-zags around the dashed line.
- **1.05**: every jump overshoots more than the last (0 → 6.3 → −0.63 → 6.99 …). It blows up. In real training this is the loss going to NaN.

**Ask:** Which learning rate would be fastest of all here?

**Answer:** 0.5: it lands exactly on the bottom in one step. Above 0.5 it starts to zig-zag; at 1 it bounces between 0 and 6 forever; above 1 it explodes. Steeper bowls lower all of these limits, which is why there is no universal "right" learning rate.

Background: the distance to the bottom is multiplied by (1 − 2·lr) at each step, so lr 0.9 (factor −0.8) is exactly as fast as lr 0.1 (factor +0.8). Goodfellow, Bengio and Courville's textbook: "If you have time to tune only one hyperparameter, tune the learning rate."

### Slide 46 · The same step in PyTorch

*(5 build steps)*

**Time:** 2 min

**Say:** Here is exactly the paper step, written in PyTorch. Three steps of the loop give 0.6, 1.08 and 1.464, the same numbers you would get by hand. Every training loop you will ever write is this loop with more weights.

**Do:** Press → five times; each press highlights a line and shows its effect on the right.

- (1) **requires_grad=True**: "I will want the slope of the loss with respect to w".
- (2) compute the loss, then **loss.backward()**: PyTorch runs backprop and stores the slope in **w.grad** (−6).
- (3) the update, inside **torch.no_grad()** so that PyTorch does not try to differentiate the update itself.
- (4) **w.grad.zero_()**: PyTorch *adds* new gradients to old ones. Without this line the second step would use −6 + (−4.8) instead of −4.8.
- (5) the printout: 0.6, 1.08, 1.464 (tested in PyTorch).

**Ask:** What goes wrong if we delete line 8?

**Answer:** The slopes pile up: each step uses the sum of all slopes so far, so the steps get bigger and bigger and overshoot. We will see this bug again on Kobe in the next section (forgetting zero_grad).

### Slide 47 · Epoch, batch, step

*On screen:* One step per batch, not per epoch *(3 build steps)*

**Time:** 2.5 min

**Say:** Three words people mix up. An **epoch** is one pass over all the training data: for Kobe, 20,558 shots. A **batch** is the small handful of shots we look at before taking one step: here 64. A **step** is one update of all the weights. So the network does not wait for the whole epoch: it takes a step after every batch.

**Do:** Step 0: the bar is all 20,558 training shots. → (1): cut into batches of 64: the zoom shows one batch (real Kobe shots, orange = made, blue = missed). Ask the class to compute the number of steps per epoch before you point at 322.

**Ask:** 20,558 shots in batches of 64: how many steps per epoch, and how big is the last batch?

**Answer:** 20,558 / 64 = 321.2, so 322 steps; 321 full batches use 20,544 shots, leaving 14 for the last batch. 30 epochs = 9,660 steps.

**Do:** → (2): the prediction question; take a vote. → (3): the answer from our real Kobe runs.

**Say:** Same 30 epochs, but batches of 64 make 9,660 steps and reach validation loss 0.662. Using all shots at once makes only 30 steps, and the loss 0.688 is no better than always guessing 44.6%. Count steps, not epochs.

Why batches work: the slope from 64 random shots is a noisy but honest estimate of the slope from all shots, and it is 300 times cheaper. The noise makes the path wobble but it still goes downhill. Yann LeCun tweeted in 2018: "Friends dont let friends use minibatches larger than 32" (a joke with a point). Typical batch sizes for small tables: 32 to 256.

### Slide 48 · Scale your inputs: a round bowl

*On screen:* Scaled inputs make a round bowl

**Time:** 2 min

**Say:** Kobe's coordinates are in tenths of feet: x goes from −250 to 248, y up to 791. Big, unequal inputs stretch the loss bowl into a long narrow valley. On the left, gradient descent zig-zags across the narrow direction and crawls along the long one. On the right we first subtract the mean and divide by the spread of each input: the bowl becomes round and the same algorithm walks straight to the bottom.

**Do:** Ask "which side gets to the bottom first, and by how much?" Then press **Run**. The right side finishes almost immediately (7 steps); the left zig-zags and needs 246 steps.

**Ask:** Why not just use a bigger learning rate on the left?

**Answer:** The steep direction (up and down) explodes as soon as lr goes above 0.02, exactly like lr 1.05 on the last demo. The steepest direction sets the speed limit, and the flat direction then crawls. On the round bowl both directions are equally steep, so lr 0.5 is safe.

How bad is it on real data? For logistic regression on Kobe-like raw coordinates, the steepest direction of the bowl is about 40,000 times steeper than the flattest; after standardising, the ratio is 1.01 (our numerical check). In the next section you will see the symptom in code: with raw inputs the first loss is 2.33 instead of 0.69. Rule: compute mean and std on the training data only, and apply the same numbers to validation and test (LeCun et al., "Efficient BackProp", 1998).

The toy surfaces here: left 0.5(x² + 100y²), right 0.5(x² + y²), same start (−5, 1.5).

### Slide 49 · Race in a narrow valley

*On screen:* Plain descent zig-zags in a narrow valley *(2 build steps)*

**Time:** 3 min

**Say:** Now a 2-D loss surface seen from above, like a map with height lines. It is a long, narrow valley: very steep across, almost flat along. The bottom is the cross. Three classic optimizers race from the same start, 100 steps each.

**Do:** Step 0: only plain gradient descent (SGD, dotted path). Ask "predict the path", then press **Run**. It bounces from wall to wall and then crawls along the floor: after 100 steps it is still far from the bottom (loss 0.27).

**Do:** → (1) adds **momentum** (dashed) and starts the race again automatically; SGD is dimmed. → (2) adds **Adam** (solid). Use **Run**/**Reset** to replay.

- **Momentum** = a heavy ball. It keeps most of its previous velocity (90%), so the back-and-forth pushes cancel and the pushes along the valley add up. It overshoots past the bottom (to x ≈ +0.8), comes back, and ends far closer than SGD (loss 0.0003).
- **Adam** = every weight has its own cruise control. It measures how big each weight's slopes usually are and divides by that, so the steep direction is calmed down and the flat direction is sped up. It heads almost straight for the bottom (loss 0.003 after 100 steps).

**Ask:** Pair task (1 min, "optimizer charades"): one partner describes how each of the three would walk down a long narrow valley; the other names it.

**Answer:** SGD zig-zags across and crawls along; momentum builds up speed along the floor and overshoots a bit; Adam evens out the step sizes per direction and goes fairly straight.

Honesty notes. The learning rates here (0.019, 0.01, 0.1) are toy values for this toy surface, not the defaults for neural networks; for Adam the learning rate is roughly how far each coordinate moves per step, so 0.1 here means about 0.1 per step. Surface: 0.5(x² + 100y²), start (−5, 1.5), momentum β = 0.9, Adam β = (0.9, 0.999). These update rules match PyTorch's SGD, SGD(momentum=0.9) and Adam exactly. The idea of these races comes from Alec Radford's famous 2014 animations.

### Slide 50 · Adam is not magic

*On screen:* Tilt the valley: Adam loses its edge *(1 build step)*

**Time:** 2 min

**Say:** Is Adam simply the best? Here is the same valley, only turned by 45 degrees. Nothing else changed: same start distance, same learning rates.

**Do:** Ask "who wins now?", then press **Run**. SGD and momentum behave exactly as before (they do not care how the valley is turned; final losses 0.27 and 0.0003 again). Adam now gets stuck high on the side of the valley (loss about 7, worse than plain SGD).

**Ask:** Why does turning the valley hurt Adam?

**Answer:** Adam gives each weight (each axis: left-right, up-down) its own step size. That only helps when the steep direction lines up with an axis. In the tilted valley the steep direction is diagonal, so both axes look equally steep and Adam's trick no longer helps. Adam is a strong default, not magic.

**Do:** → (1) switches to a **saddle** and starts the race: downhill to the top and bottom, uphill to the left and right, with the start almost exactly on the ridge. All three use lr 0.05.

**Say:** Plain SGD walks straight into the saddle and sits there, because the slope that would push it off is almost zero. Momentum escapes sooner, and Adam escapes first because it turns even a tiny slope into a normal-sized step (escape after about 66, 25 and 11 steps). Big networks have many saddles and flat regions, which is one reason momentum and Adam are popular.

Surfaces: tilted valley = the same 0.5(u² + 100v²) in rotated coordinates; saddle = x² − y² + y⁴/4 from (−1.8, 0.001), bottoms at (0, ±1.41). If the start were exactly on the ridge (y = 0), nobody would escape: in real training the noise from mini-batches gives the kick.

### Slide 51 · Predict: Adam's first step

*On screen:* How far does each weight move? *(3 build steps)*

**Time:** 2 min

**Say:** Three weights sit on very different slopes: 1000, 1 and 0.001. We take one step with learning rate 0.001. How far does each weight move, first with plain gradient descent, then with Adam?

**Do:** Let everyone write two answers per weight. → (1) plain gradient descent: the move is lr × slope, so 1, 0.001 and 0.000001. The steep one flies off, the flat one is stuck. → (2) Adam: all three move exactly 0.001. → (3) the takeaway.

**Ask:** Why does Adam move them all by the same amount?

**Answer:** Adam divides each weight's slope by the typical size of that weight's recent slopes. On the first step "typical size" is just the slope itself, so 1000/1000 = 1/1 = 0.001/0.001 = 1, and every weight moves exactly lr. Later it is roughly lr (smaller when the slope keeps changing sign or is mostly noise).

**Say:** Remember this for the inversion task this afternoon: there you move an *input* with Adam. With lr 0.001, a value that has to travel 2 needs at least 2,000 steps. Pick the learning rate on the scale of the distance you need to travel (for example 0.1).

For the strongest students (paper, 2 min): g = 4, β₁ = 0.9, β₂ = 0.999, lr = 0.001. m = 0.1 × 4 = 0.4, v = 0.001 × 16 = 0.016; bias-corrected m̂ = 0.4 / 0.1 = 4, v̂ = 0.016 / 0.001 = 16; step = 0.001 × 4 / √16 = 0.001. With g = 0.04 the step is still 0.001. (Checked in PyTorch: gradients 1000, 1, 0.001 all move 0.0010.) Adam = "adaptive moment estimation", Kingma and Ba, 2014.

### Slide 52 · Predict: learning rates on Kobe

*On screen:* On Kobe, which settings beat guessing? *(4 build steps)*

**Time:** 2 min

**Say:** Real numbers from our runs on Kobe's shots: our legal 2-8-8-1 network, 30 epochs, validation loss (lower is better). The dashed line is the "dumb" model that always predicts 44.6%: loss 0.688. Adam with lr 0.001 gets 0.662. Now predict the three others: better than guessing or not?

**Do:** Take a quick vote on each row (thumbs up = beats the dashed line). Then → three times to reveal one row at a time, and → once more for the takeaway.

- **Adam, lr 1**: 0.701, worse than guessing (and accuracy 51.7%, below "always miss" at 55%). Steps of about 1 per weight per step are far too big.
- **SGD, lr 0.001**: 0.683. It barely moved in 9,660 steps: plain SGD moves lr × slope, and the slopes are small.
- **SGD, lr 0.1**: 0.663, as good as Adam. Plain SGD is fine once its learning rate is right.

**Ask:** So is Adam better than SGD?

**Answer:** Not by itself. Each optimizer has its own good range of learning rates. Adam's default happens to be a good start for most networks; SGD needs a different number. The learning rate matters more than the optimizer's name.

Setup: 80/20 split of 25,697 labelled shots (train 20,558), standardised inputs, batch 64, ReLU, mean of 3 seeds. Also measured: Adam lr 0.01 gave 0.660 (slightly better than 0.001) and Adam 3e-4 gave 0.664.

### Slide 53 · What to use: Adam, then tune lr

*On screen:* Start with Adam, lr 0.001 *(3 build steps)*

**Time:** 1.5 min

**Say:** In practice you never write the update by hand. You make an optimizer once, give it the model's weights and a learning rate, and inside the loop you call three lines: zero_grad, backward, step. They do exactly what our hand-written lines did, for every weight at once.

**Do:** → (1): the default. Adam with 0.001, then also try 0.003 and 0.0003 and keep whatever is best on validation. → (2): the three loop lines next to the manual version from the paper step (for plain SGD, step() is exactly w -= lr * w.grad; Adam does its smarter version). → (3): changing the optimizer is one line; the loop stays the same.

- **Adam** (Kingma and Ba, 2014) is one of the most cited papers of the century: about 200,000 Google Scholar citations, 4th of all 21st-century papers in the data behind Nature's 2025 ranking.
- Andrej Karpathy tweeted in 2016: "3e-4 is the best learning rate for Adam, hands down." It was half a joke; in his 2019 training recipe he really does start with Adam at 3e-4 because "Adam is much more forgiving to hyperparameters, including a bad learning rate".
- **AdamW** is Adam with weight decay done properly; use it when you want weight decay.
- **SGD with momentum 0.9** is still common for image networks (CNNs), where a well-tuned SGD often ends up slightly better, but its good learning-rate range is narrower.

**Ask:** Which order do the three lines go in, and could zero_grad go after backward?

**Answer:** zero_grad, backward, step (zero_grad may also go right after step). Not between backward and step: then step would see a gradient of zero and nothing would learn.

The code is tested: it runs with any model, loss_fn and DataLoader. The full loop with the forward pass is built line by line in the next section.

### Slide 54 · Learning-rate schedules

*On screen:* Big steps early, small steps late

**Time:** 1 min

**Say:** One more knob, briefly. Many people change the learning rate during training: big steps at the start to travel fast, small steps at the end to settle into the bottom instead of bouncing around it. Think of parking a car: fast on the road, slow in the parking space.

- **Constant**: simplest; fine for small tasks like Kobe if you keep the best checkpoint.
- **Step down**: divide lr by 10 at fixed points (the classic image-network recipe).
- **Warm-up + cosine**: start tiny, ramp up, then glide smoothly down to almost 0. The default for transformers and large models.
- **Drop when stuck** (ReduceLROnPlateau): halve the lr whenever the validation loss stops improving for a few epochs. The easiest good choice for small olympiad tasks.

**Ask:** Why would a smaller learning rate at the end give a better result?

**Answer:** With mini-batches every step is a bit noisy, so with a constant lr the weights keep jiggling around the bottom. Smaller steps shrink the jiggle so the weights settle closer to the bottom.

If you are running late, skip this slide. On a small tabular test (our run), cosine or ReduceLROnPlateau improved the final validation loss from 0.42 to about 0.37, but keeping the best epoch mattered about as much. PyTorch: torch.optim.lr_scheduler; call sched.step() once per batch (cosine) or sched.step(val_loss) once per epoch (plateau).


---

## 7 · The training loop, live — 28 min (1:47–2:15)

### Slide 55 · The five beats of one training step

*On screen:* Every training step is the same five lines *(5 build steps)*

**Time:** 4 min

**Say:** Everything we did so far, the model, the loss, the gradients, the optimizer, is used in five lines of code. They run once for every batch of shots, thousands of times. Say them with me: clear, forward, loss, backward, step.

**Do:** Press → five times. Each press highlights one line and shows on the right what that line does to the real 2-8-8-1 Kobe network (64 real shots, scaled):

- **1 zero_grad**: every stored gradient is set back to zero (nothing visible changes in the network).
- **2 forward**: the batch flows left to right; dark hidden neurons are the ones that fire a lot on these 64 shots; blank ones are off (ReLU gave 0).
- **3 loss**: one number for the whole batch, about 0.7 for a fresh network (a coin flip is 0.69).
- **4 backward**: magenta dashed lines are gradients, thicker means "this weight is more to blame". Every one of the 105 weights gets one, in one call.
- **5 step**: the weights change a little and the loss on the same batch goes down (0.695 → 0.664). Point at the "after the step" readout.

**Do:** Optional: "Next batch: run 5 beats" plays the same five beats on the next 64 shots, with the code lines lighting up in turn. Press it two or three times while saying the beats aloud. "Reset" goes back to the fresh network.

**Ask:** Which line actually changes the weights?

**Answer:** Only opt.step(). backward() only computes gradients and stores them in each weight's .grad; it does not move anything. zero_grad() only clears .grad.

Honesty note: this picture uses plain SGD with learning rate 0.5 on one batch, so the biggest weight moves by about 0.1 and you can just see the change; the batch loss goes from 0.695 to 0.664. In real training with Adam (lr 0.001) each weight moves about 0.001 per step, invisible after one step; that is why we need about 9,000 steps.

Orange lines are positive weights, blue negative, thickness is size. Magenta always means gradients / learning.

### Slide 56 · Live coding: the notebook

*On screen:* Now we build it, cell by cell

**Time:** 3 min (1 for the slide, 2 for cell 1 in the notebook)

**Say:** Now I write the whole thing in front of you. I will type, not paste, and before every run you predict what will happen. I will also make four mistakes on purpose; these are the mistakes that cost points in competitions.

**Do:** Switch to notebooks/01_live_coding.ipynb. The imports and the data loading are already written; run cell 1 and print X.shape (25000, 2), y.shape (25000, 1) and y.mean() = 0.447 (44.7% made). Make the font big (Ctrl/Cmd +) and use a light theme.

- Type, don't paste. Say each line aloud as you type it, then point at the output and say it again.
- Before each run, ask for a prediction (hands up, or a number on paper).
- Keep the finished notebook open on a second device; if the live code breaks, switch to it. Every result is also on the next slides.

**Ask:** Before running cell 1: what fraction of Kobe's shots went in? (Remember the opening.)

**Answer:** About 45% (44.7% in the task file). So "always miss" is right about 55% of the time; that is the floor every model must beat.

### Slide 57 · Planned mistake 1: raw coordinates

*On screen:* First loss on raw coordinates? *(3 build steps)*

**Time:** 3 min

**Say:** Planned mistake number one. I feed the coordinates straight from the file into the network. They are in tenths of feet: x goes from −250 to 248 and y up to 791. The network was built expecting numbers around −2 to 2.

**Ask:** A fresh network knows nothing, so it should say about 50/50 for every shot. What loss should the very first step print? And what do you think it prints with these raw numbers?

**Answer:** It should print about 0.69 (the loss of a coin flip, ln 2; with Kobe's 45% it is 0.687). With raw inputs it prints about 2.3 (2.36 in our run with seed 0; other seeds gave 2.1 and 3.8). The very first sanity check fails.

**Do:** In the notebook, run the first training step on raw inputs and read the loss aloud. Then press → to show the fix (step 2): subtract the mean, divide by the standard deviation. Run again: 0.69 (step 3).

**Say:** Why it goes wrong: each first-layer neuron multiplies x by a weight of size about 0.5. With x around 100, the neuron's value is around 50 instead of around 0.5, so the network starts out extremely confident, and confident-and-wrong is expensive.

**Common mistake:** computing the mean and std on the validation (or test) data, or on everything. Always use the training statistics and apply the same numbers to validation, test and the grader's data.

Story (30 s): this advice is in LeCun, Bottou, Orr and Müller's "Efficient BackProp" from 1998: "Convergence is usually faster if the average of each input variable over the training set is close to zero." 28 years later it is still bug number one. Our numbers (task file, 80/20 split): mean (6.5, 91.7), std (110, 88).

### Slide 58 · Live demo: scale your inputs

*On screen:* Plain SGD learns nothing from raw inputs

**Time:** 2.5 min

**Say:** This is the same 2-8-8-1 network training live in the browser on 3,000 of Kobe's real shots. The colour on the court is the predicted chance of a make: orange means "likely in", blue means "likely miss". The optimizer is plain SGD with learning rate 0.1, and the inputs are raw coordinates.

**Ask:** Predict: after 100 epochs, will it beat "always miss" (54.6% on these shots)?

**Do:** 1) Press Train with "raw inputs" and "SGD" selected (the default). Watch for about 6 seconds: the accuracy sits at 54.6%, exactly "always miss", and the court goes uniformly blue. It predicts "miss" everywhere.

**Do:** 2) Click "scaled inputs" (this resets the net), press Train: within a few seconds the accuracy climbs to about 60% and an orange spot appears around the rim, which is exactly where Kobe made more than half his shots.

**Do:** 3) Click "Adam", then try both raw and scaled: both reach about 60%. Adam hides the problem.

**Answer:** With raw inputs and SGD the huge numbers make the first steps enormous, the ReLU neurons die (output 0 for every shot) and the network collapses to a constant: always miss. Scaled, the same optimizer works. Adam rescales every step by itself, so it survives raw inputs here, but scaling is free and makes every default (learning rate, initialisation) behave as designed.

Note: the loss readout at epoch 0 shows about 14.5 for raw inputs (this browser network starts with larger weights than PyTorch's default, which gives 2.3); either way it is far above 0.69. If a run looks stuck, press Reset and Train again. In our PyTorch runs the same thing happens: SGD + momentum lr 0.1 on raw inputs collapsed to "always miss" on all 3 seeds; scaled reached 60.3%.

### Slide 59 · The script, part 1: setup

*On screen:* Before the loop: data, model, loss, optimizer *(5 build steps)*

**Time:** 1.5 min (then type it in the notebook)

**Say:** This is everything that happens before the loop: turn the table into tensors, split 80/20, scale with the training statistics, build the model, choose the loss and the optimizer. Twelve lines.

**Do:** Press → five times; each press highlights a group of lines and the right side shows the result: the shapes, the split sizes, the mean and std, the 105-weight model, the loss and optimizer. Then type the same cells in the notebook.

- **unsqueeze(1)** turns y from shape (25000,) into (25000, 1), the same shape as the model's output. We will break this on purpose later.
- MLP is the class from the "From one neuron to an MLP" part: fc1 = Linear(2, 8), fc2 = Linear(8, 8), fc3 = Linear(8, 1), ReLU in between, and **no sigmoid at the end**. In the notebook it is cell 3.
- **BCEWithLogitsLoss** applies the sigmoid itself, in a numerically safe way. That is why the model outputs raw scores (logits).

**Ask:** How many numbers will Adam be adjusting?

**Answer:** 105: 24 in fc1 (2·8 + 8), 72 in fc2 (8·8 + 8), 9 in fc3 (8 + 1). Check it in code: sum(p.numel() for p in model.parameters()).

### Slide 60 · The script, part 2: the loop

*On screen:* The loop: epochs, batches, five beats *(4 build steps)*

**Time:** 3 min (including typing it in the notebook)

**Say:** Two loops. The outer loop runs over epochs: one epoch means the network has seen every training shot once. The inner loop cuts the shuffled shots into batches of 64; every batch gets the five beats we just saw.

**Do:** Press → four times: the outer loop; the shuffle and the batches; the five beats; the print. Then type it in the notebook, saying the five beats aloud again, and run it (about 10 seconds on a laptop).

- 20,000 / 64 = 312.5, so 313 batches per epoch; the last one has only 32 shots. 30 epochs × 313 = 9,390 updates. (The optimizer section used the Kaggle file with 20,558 training shots, which gives 322 steps per epoch; same idea.)
- randperm reshuffles every epoch so the batches are different each time.
- The printed loss is the loss of the last batch only, so it jumps around (0.62 to 0.72 is normal). Do not read too much into one value.

**Ask:** If I double the batch size to 128 and keep 30 epochs, what happens to the number of steps?

**Answer:** It halves (157 per epoch, 4,710 in total). Fewer, less noisy steps; with a fixed number of epochs this often trains less. Count steps, not only epochs.

### Slide 61 · Kobe results: baselines vs MLP

*On screen:* Will 105 weights beat 0.687? *(4 build steps)*

**Time:** 2 min

**Ask:** Before the reveal: the constant guess (45% for every shot) has validation loss 0.687. Will our network beat it? By a lot or a little? Write a number.

**Do:** Press → three times to reveal the three rows from top to bottom, then once more for the takeaway.

**Answer:** Yes, but by a little: 0.662 against 0.687, and 61% accuracy against 55%. Logistic regression sits in between (0.675, 58%) because it can only draw a straight boundary, and Kobe's good zone is a small disc around the rim.

**Say:** Is 61% bad? No. Even at the rim Kobe only scored about 63% of the time, so no model that sees only the position can be right much more than 61% of the time. The labels are coin flips with a probability that depends on position. In the task you are fighting for about 5 points between 55% and 61%.

Numbers: mean of 3 seeds on the Kaggle labelled shots, 80/20 split, Adam lr 0.001, batch 64, 30 epochs. Our check of the slide code on the task file (seed 0): constant 0.686, logistic 0.673 (58.6%), MLP 0.6625 (60.6%). Your live numbers will differ in the third digit; the order will not.

### Slide 62 · Planned mistake 2: no zero_grad

*On screen:* I delete opt.zero_grad(). Then? *(3 build steps)*

**Time:** 2 min

**Ask:** I delete the line opt.zero_grad() and train again. Vote with fingers: 1 it crashes, 2 nothing changes, 3 it trains, but worse.

**Do:** Count the votes, then press → to reveal answer 3. In the notebook: comment out opt.zero_grad(), run, read the result.

**Answer:** 3. No error at all. PyTorch adds every new gradient to the one already stored in .grad. Without clearing, each step uses the sum of all gradients since the start, a stale and ever-growing direction.

**Do:** Press → for the tiny demo: w is a single number, the gradient of 2w is 2, but calling backward() three times stores 2, then 4, then 6. Press → again for the Kobe result.

**Say:** On Kobe, the network without zero_grad reaches only 53% accuracy (log loss 0.686): worse than always saying "miss". No error message, just a silently bad model.

Why PyTorch adds up gradients on purpose: sometimes you want the gradient of a big batch that does not fit in memory, so you call backward() on several small batches and step once. The cost is that you must clear by hand.

Numbers: mean of 3 seeds (Adam, Kaggle data). Our run of the slide code on the task file with seed 0 was even worse: 44% accuracy, it predicted "made" for every shot. Adam limits the damage because it rescales steps; with plain SGD the summed gradient keeps growing. This is Karpathy's famous mistake #3: "you forgot to .zero_grad() (in pytorch) before .backward()".

### Slide 63 · Cliffhanger reveal: two sigmoids

*On screen:* Two sigmoids: normal loss, broken model *(4 build steps)*

**Time:** 3 min

**Say:** Before the break you voted: a sigmoid as the last layer of the model, and BCEWithLogitsLoss as the loss. Crash, normal, quietly worse, or NaN? Let's run it.

**Do:** In the notebook change the last line of forward to return torch.sigmoid(self.fc3(h)) and train. Then press → for each reveal:

- Step 1: the printed loss ends around 0.68. Looks like a normal run.
- Step 2: accuracy (output above 0.5 = "made") is 61%, the same as the correct model.
- Step 3: the histograms of the predicted chances. The correct model says between 0 and 0.62 for every shot. The buggy one says "less than 1%" for 76% of all shots, including mid-range jumpers that go in 40% of the time.
- Step 4: score those outputs as probabilities (log loss, which is what Kaggle and many olympiad tasks use): 4.69, against 0.662 for the correct model and 0.687 for a constant guess.

**Answer:** "Quietly worse": no crash, no NaN, normal-looking loss and accuracy, but the probabilities are garbage. A bug can leave accuracy unchanged and still destroy the competition metric.

**Say:** Why: the loss applies its own sigmoid to whatever the model outputs. The model's output is already squeezed between 0 and 1, so the loss only ever sees chances between 50% and 73%. To push a "miss" as low as it can go, the network must push its own output all the way down to 0. So it learns extreme outputs.

The maths, if a student asks: the loss sees σ(σ(z)), and σ(s) for s in (0, 1) lies in (0.5, 0.731). So each made shot costs at least −ln 0.731 = 0.313 and each miss at least −ln 0.5 = 0.693: the printed loss is trapped and can never look very good or very bad. The two fixes: remove the sigmoid from the model (preferred; BCEWithLogitsLoss is numerically safer), or keep it and use nn.BCELoss.

Kobe task note: a final nn.Sigmoid in the submitted model is allowed (the official baseline has one). If you train with it, use nn.BCELoss; or train without it using BCEWithLogitsLoss and add the sigmoid only in the submitted class. Also: with this bug, "logits > 0" accuracy reads 44% (everything "made"), because the outputs are never negative.

Numbers: 4.69 and 61% are the mean of 3 seeds; our run of the slide code on the task file (seed 0): printed val loss 0.6845, accuracy 61.7%, true log loss 4.60, 76.4% of outputs below 0.01. Karpathy's mistake #4 is the multi-class cousin: "you passed softmaxed outputs to a loss that expects raw logits".

### Slide 64 · Planned mistake 4: the target shape

*On screen:* Targets must be (N, 1), not (N,) *(3 build steps)*

**Time:** 2 min

**Say:** Last planned mistake. I remove the unsqueeze(1), so y has shape (N,) while the model outputs shape (N, 1).

**Do:** In the notebook remove .unsqueeze(1) and run. Press → to show the error. Read it aloud, slowly: "Target size 64 must be the same as input size 64 by 1."

**Say:** This one is the friendly bug: it crashes, it tells you exactly what is wrong. Read error messages from the last line up; the last line says what, the lines above say where.

**Do:** Press → again. Now the same mistake with MSELoss, the loss for numbers (and the loss of the inversion task).

**Ask:** Three predictions 1, 2, 3 and targets 1, 2, 3: perfect. What is the MSE?

**Answer:** It should be 0, but PyTorch prints 1.33. A column (3, 1) minus a row (3,) is "broadcast" to a 3×3 table: every prediction is compared with every target. Only the diagonal is what you meant; the average of all 9 squares is 12/9 = 1.33. PyTorch only prints a UserWarning ("Using a target size … that is different to the input size … This will likely lead to incorrect results due to broadcasting"), easy to miss. With 20,000 shots the table would have 400 million entries.

**Do:** Press → for the fix: y.unsqueeze(1) (or y.view(-1, 1)). Habit: print logits.shape and y.shape once before training.

Verified in PyTorch 2.15: the ValueError text above is exact, and MSELoss on (3,1) vs (3,) perfect predictions returns 1.3333 with the warning.

### Slide 65 · Evaluate correctly

*On screen:* Measure on validation, without gradients *(4 build steps)*

**Time:** 1.5 min

**Say:** The last cell: measure the model on the validation shots it never trained on. Three habits: switch to evaluation mode, turn off gradient tracking, and turn logits into decisions correctly.

**Do:** Press → four times, one line group at a time, then run the cell in the notebook.

- **model.eval()** switches layers like dropout and batch-norm to their test behaviour. Our Linear + ReLU net has neither, so here it changes nothing, but forgetting it is Karpathy's mistake #2, so build the habit. Call model.train() before training again.
- **torch.no_grad()**: we only measure, so PyTorch does not need to remember the computation for backward. Faster and less memory.
- **logits > 0**: a logit of 0 is exactly 50%, positive means "more likely made". No sigmoid needed to decide.
- Print three numbers: loss, accuracy, and the fraction predicted "made". If that fraction is 0 or 1, the model is a constant: always check it.

**Ask:** Our model predicts "made" for about 30% of shots, but Kobe made 45%. Is that a bug?

**Answer:** No. "Made" is predicted only where the chance is above 50%, which is basically within 3 feet of the rim. Everywhere else the best single guess is "miss", even though 40% of those shots go in.

Numbers from our run of this exact code on the task file (seed 0): val loss 0.6625, accuracy 60.6%, fraction "made" 0.305. Longer or faster training (Adam lr 1e-2) brings the fraction down to about 0.22.


---

## 8 · Generalization and debugging — 15 min (2:15–2:30)

### Slide 66 · Train, validation, test

*On screen:* Grade the model on shots it never saw *(3 build steps)*

**Time:** 1 min

**Say:** A model is only useful on shots it has never seen. So we split our data like a school year. The training shots are homework: the weights learn from them. The validation shots are a mock exam: we never train on them, we only use them to choose settings, like the learning rate or when to stop. The test set is the real exam: in the olympiad the grader keeps it hidden and scores you once.

**Do:** Press → three times: the validation block, then the hidden test block, then the warning line.

**Ask:** If you try 50 settings and keep the one with the best validation score, is that validation score still an honest estimate?

**Answer:** Slightly too optimistic: you picked the luckiest of 50. That is exactly why a separate test set exists, and why the hidden leaderboard (the final "board B") can differ from the live one.

Numbers: Kobe has 25,697 labelled shots; our 80/20 split gives 20,558 training and 5,139 validation shots (the same split behind every Kobe number in this deck). Common mistake: computing the normalisation mean and standard deviation on all data, or on the validation data. Use the training shots only; the bug hunt later has exactly this bug.

### Slide 67 · Overfitting, live

*On screen:* A big net on 12 points memorises the noise

**Time:** 3 min

**Say:** Twelve noisy points from a smooth curve, the dashed line, and a big network with about a thousand weights. The small hollow dots are validation points: the network never trains on them. Watch both loss curves: magenta is the training loss, black is the validation loss.

**Ask:** Before I press Train: if we train for a very long time, what happens to the training loss? And to the validation loss?

**Do:** Take a few answers, then press **Train** (about 10 seconds). Narrate: first the black curve becomes smooth and close to the dashed curve and both losses fall. Then the network starts bending its curve through every single black point: the training loss dives towards 0, while the validation loss turns back up. The dashed vertical line marks the step with the best validation loss so far. Press **Restore best**: the model jumps back to that smoother curve. Then click **small net 1-3-1** and Train: it cannot bend enough to memorise, so its two curves stay close.

**Answer:** Training loss keeps falling (to about 0: it memorises all 12 points, noise included). Validation loss falls, reaches its minimum very early (around step 75), then climbs to more than twice that value. Memorising answers is not understanding.

Everyday picture: a student who memorises last year's exam answers scores 100% on that paper and badly on a new one. The gap between the two curves is the warning sign, not the training loss alone. The y-axis is logarithmic so that the training loss diving towards 0 stays visible. Loss here is mean squared error, because this is a curve-fitting demo.

### Slide 68 · Predict: a bigger net on Kobe

*On screen:* Kobe: does an 80× bigger net score better? *(2 build steps)*

**Time:** 1.5 min

**Say:** Same Kobe data, same training recipe. On the left our legal net with 105 parameters; next to it a net with 8,577 parameters, 80 times bigger.

**Ask:** With all 20,558 training shots, will the big net get a much better, about the same, or a much worse validation loss? Hands up for each.

**Do:** After the vote press →: 0.662 against 0.660. Then ask "and if we only had 500 shots?" and press → again for the right panel.

**Answer:** About the same: 0.662 vs 0.660, a difference of 0.002. The limit is the randomness of basketball (the same spot gives makes and misses), not the size of the network. With only 500 shots, a 2-256-256-1 net memorises: its training loss falls to 0.37 while its validation loss climbs to 1.23, far worse than simply guessing 44.6% for every shot (0.688).

Lesson: the right size depends on how much data you have and how noisy it is. Bigger is not automatically better. Also: a classmate who proudly reports "55% validation accuracy" on Kobe has learned nothing: always saying "miss" already gets 55.2%. (Numbers: our runs, 80/20 split, Adam 1e-3, 30 epochs, mean of 3 seeds; the 500-shot run is full-batch Adam 1e-3, 2,000 steps.)

### Slide 69 · Five cures for memorising

*(5 build steps)*

**Time:** 2 min

**Say:** Here is our patient again: the big net that memorised 500 shots and reached a validation loss of 1.23. Five standard cures, each with what it did on Kobe.

**Do:** Press → five times, one cure per click. Spend the most time on 3 and 5.

- **More data**: the best cure when you can get it. With all 20,558 shots, a big net (2-64-64-64-1) reaches 0.660 instead of memorising.
- **Smaller model**: fewer weights means less room to memorise. Our legal 2-8-8-1 on the same 500 shots: best 0.677.
- **Stop early and keep the best weights**: after every epoch measure the validation loss; whenever it is the best so far, save a copy of the weights (the code on the slide); at the end, load that copy. This is exactly the "Restore best" button from the live demo. On the patient, the best validation loss came very early (step 20): 0.675 instead of 1.23.
- **Weight decay**: every step also shrinks each weight a little toward 0, so the net cannot build the huge, wild weights that memorising needs. In PyTorch: `torch.optim.AdamW(model.parameters(), lr=1e-3, weight_decay=1.0)`. On the patient after 2,000 steps: 0.76 instead of 1.23. Better, but it does not beat stopping early; cures are often combined.
- **Dropout**: during training, randomly switch off some neurons in every step (watch the crosses jump around), so no neuron can rely on one particular partner. `nn.Dropout(0.5)` between layers; it is switched off automatically by `model.eval()`, which is one reason to always call it before evaluating. On the patient (dropout 0.5 after both hidden layers), after 2,000 steps: 0.71 instead of 1.23.

**Say:** Story: Geoffrey Hinton said he got the idea for dropout at his bank. The tellers kept changing, and a teller told him they were moved around a lot. Hinton guessed the reason: cheating the bank needs several employees to cooperate, and rotating people breaks up such conspiracies. Randomly removing neurons breaks up "conspiracies" between neurons, which is what memorising is.

**Ask:** Which cure can you NOT use much in the Kobe task, and why?

**Answer:** "Smaller model" and "more data" are fixed by the rules (at most 2-8-8-1, the given shots). With only 105 parameters and 20,000 shots, the Kobe net barely overfits at all; early stopping with the best checkpoint is the cure worth keeping.

Source for the bank story: Hinton's answer in the Google Brain "Ask me anything" on Reddit, August 2016; dropout paper: Hinton et al. 2012 / Srivastava et al. 2014. All numbers are from our runs on the real Kobe data, same 80/20 split as everywhere in the deck (500-shot runs: full-batch Adam or AdamW, lr 1e-3, 2,000 steps, validation on the usual 5,139 shots, best checkpoint measured every 10 steps).

### Slide 70 · Loss-curve doctor

*On screen:* Loss-curve doctor: what went wrong? *(6 build steps)*

**Time:** 2.5 min

**Say:** Reading the loss curve is the most useful debugging skill you will learn today. Six patients. Magenta is always the training loss, black the validation loss; the little 0.69 mark on each axis is the loss of a net that knows nothing. Write down a diagnosis for each card, then we check.

**Do:** Give 60 seconds of silent writing, then press → six times, one diagnosis per click. Before each click ask one student for their answer.

1. **Learning rate too high**: the loss jumps around, spikes, drifts up; in the worst case it becomes nan. Fix: divide the lr by 10. (Kobe: Adam with lr 1.0 ended at 0.701, worse than guessing.)
2. **Overfitting**: training keeps falling, validation turns up. Fix: keep the best checkpoint, stop early, smaller model or more data.
3. **Learning rate too low**: a slow, almost straight line that never flattens. Fix: lr ×10, or train longer. (Kobe: plain SGD with lr 0.001 only reached 0.683.)
4. **Stuck at 0.69**: flat from the start, the net learned nothing. Suspects: forgotten `optimizer.step()` or `zero_grad`, dead ReLUs, labels shuffled separately from inputs, unscaled inputs.
5. **Very noisy**: each step sees a small random batch, so the loss wiggles. Some wiggle is normal; this much means a bigger batch, a smaller lr, or simply plotting a moving average.
6. **Healthy**: fast drop, then flat, validation just a little above training. A small gap is normal and is not overfitting.

Common misconception: "training loss below validation loss means overfitting". No: a small, stable gap is normal. Overfitting means validation gets worse while training still gets better. These six curves are drawn by hand (schematic), not from real runs.

### Slide 71 · Karpathy's four checks

*On screen:* Training fails silently: check four things *(4 build steps)*

**Time:** 1.5 min

**Say:** Andrej Karpathy, who led AI at Tesla, wrote the most famous checklist for training networks. His key sentence: neural net training fails silently. A wrong program usually still runs and still prints a loss, it is just quietly worse. So before trusting any run, do four cheap checks.

**Do:** Press → four times, one check per click; the court map appears with check 4.

1. **Look at the very first loss.** A fresh net guesses about 50/50, so binary cross-entropy starts near 0.69. On Kobe with scaled inputs we got 0.69; with raw coordinates (values in the hundreds) 2.33. A strange first number is your first warning.
2. **Beat a dumb baseline.** On Kobe, always saying "miss" is right 55.2% of the time, and always predicting 44.6% gives loss 0.688. If you do not beat these clearly, the net has learned nothing. So "55% accuracy" is not a result, it is the baseline.
3. **Overfit a tiny batch.** Train on just two shots for a few hundred steps. A working net must reach a loss near 0. If it cannot memorise two examples, there is a bug in the code, not a lack of data.
4. **Look at what it predicts.** For Kobe: draw the predicted chance of a make on the court, like here. Orange near the rim, blue far away: that makes sense. A striped or random map means a bug.

**Ask:** Why is check 3 so powerful?

**Answer:** Memorising two examples is the easiest task there is. If even that fails, the problem must be in the code (loss, labels, optimizer, shapes), and you found it in seconds instead of after a long run.

Karpathy also tweeted (2018) his list of the most common mistakes: not overfitting a single batch first, forgetting train/eval mode, forgetting zero_grad before backward, and passing softmaxed outputs to a loss that expects raw logits. All of them appear in the bug hunt next.

### Slide 72 · Bug hunt: five planted bugs

*On screen:* This loop has five bugs. Find them. *(5 build steps)*

**Time:** 5 min (4 in pairs, 1 to reveal)

**Do:** Hand out the printed loop (the same 12 lines). Pairs circle every bug they find. Press **Start** on the timer. When it ends, ask "who found 5? 4? 3?" and then press → five times; each click highlights one bug in the code and lists it on the right. Ask the class for each one before clicking.

1. **Line 1: scaling with validation statistics.** The mean and standard deviation must come from the training shots only, and then be applied to both. Otherwise information from the "mock exam" leaks into training, and train and validation are scaled differently.
2. **Line 4: `nn.Sigmoid()` at the end together with `BCEWithLogitsLoss`.** The loss already applies a sigmoid, so it is applied twice. Silent: on Kobe the printed loss looked normal and accuracy stayed 61%, but the real log loss of the outputs was 4.69 instead of 0.662. The model must output logits.
3. **Line 8: the label shape.** `yb` has shape (64,) but the model outputs (64, 1). `BCEWithLogitsLoss` stops with "Target size (torch.Size([64])) must be the same as input size (torch.Size([64, 1]))". Fix: make the labels (N, 1) with `ytr.unsqueeze(1)`. This is the only one of the five bugs that crashes. (With `MSELoss` the same mismatch does not crash: it silently compares every output with every label.)
4. **Lines 9 to 11: no `opt.zero_grad()`.** Gradients add up step after step. On Kobe: 0.686 and 53.4% accuracy, worse than always saying "miss".
5. **Line 12: the "validation" loss is computed on the training data**, so it can only look good. Use `Xva, yva`, call `model.eval()` and wrap it in `with torch.no_grad():`, then `model.train()` again before training.

Most often missed: bug 1 (it looks harmless) and bug 2 (it looks like what logistic regression does). Bonus if someone points out that `nn.Sequential` is fine in general but forbidden by the Kobe task rules. We ran this exact code in PyTorch 2.15: it stops at bug 3 with the ValueError above; with the five fixes it trains normally.

### Slide 73 · Bug gallery: real error messages

*On screen:* Loud bugs: the last line names the fix *(5 build steps)*

**Time:** 1 min

**Say:** The good news: some bugs are loud. PyTorch stops and prints an error. Students often panic at the long red traceback. Read only the last line: it says what is wrong, and often how to fix it. These five are the ones you will meet today, copied exactly from PyTorch 2.15.

**Do:** For each line, ask "what is the fix?" and then press → to reveal it (five clicks).

1. The input has 3 columns but the first layer was built for 2 (64 rows × 3 columns times a 2 × 8 weight matrix). Make the layer match the data, or remove the extra column.
2. Data loaded with numpy or pandas is float64 ("Double"), the model's weights are float32 ("Float"). Convert: `torch.tensor(X, dtype=torch.float32)` or `X.float()`.
3. The labels are a flat list of 64 numbers, the model outputs a column of 64. Add the column dimension with `unsqueeze(1)`.
4. Labels created as integers (Long) go into a loss that needs floats. `y.float()`.
5. You tried to turn a tensor that is still connected to the gradient machinery into numpy (for example to plot predictions). Detach it first, as the message says.

All five were produced by running the failing code in torch 2.15.0 on CPU. Note that in 2.15 the first message starts with "addmm:"; older versions print it without that prefix. The silent bugs from the bug hunt are the dangerous ones; loud bugs cost you a minute.

### Slide 74 · Double descent and grokking

*On screen:* Bigger can be worse, then better again *(1 build step)*

**Time:** 1 min (cut to 20 s if late: keep only the vacation story)

**Say:** One last surprise: the rule "too big means overfitting" is not the whole story. Left: we fit 40 training points with models of growing size. The error on new data first gets worse as the model grows, explodes exactly when the model has just enough weights to pass through all 40 points, and then, as the model keeps growing, gets better again. The biggest model is the best of all. This is called double descent; it is one reason huge networks like ChatGPT work at all.

**Do:** Press → for the right panel.

**Say:** Right: grokking. On some small puzzles, a network reaches 100% on its training data quickly while staying at chance on new data, and then, thousands of steps later, it suddenly "gets it". How was it discovered? The researcher Alethea Power said: "And then one day, we got lucky. And by lucky, I mean forgetful." A team member went on holiday and forgot to stop the training run; when they came back, the network had generalised.

**Ask:** Should you train your Kobe net for a week, hoping it groks?

**Answer:** No. Grokking was seen on tiny algorithmic puzzles, not on noisy data like basketball shots, and double descent needs models far bigger than the Kobe rules allow. For our tasks the classic advice holds: watch the validation loss and keep the best checkpoint.

Background: the left curve is real, from a small linear-regression experiment in our research notes (400 random features, 40 training points, least-squares fit using the first P features; median test error over 50 random datasets; peak 167 at P = 40, 0.93 at P = 400). Sources: Belkin et al., PNAS 2019; Nakkiran et al. 2019 ("Deep Double Descent"); Power et al. 2022 ("Grokking"); the quote is from Quanta Magazine, April 2024. The word "grok" comes from Heinlein's 1961 novel *Stranger in a Strange Land*. The right panel is a schematic, not data.


---

## 9 · Olympiad playbook and the two tasks — 22 min (2:30–2:52)

### Slide 75 · Pre-flight checklist

*On screen:* Nine checks before you trust a number *(3 build steps)*

**Time:** 1.5 min

**Say:** Before the two tasks, here is the checklist that wins practical rounds. Pilots run a checklist before every take-off, even after ten thousand flights, because the boring mistakes are the ones that crash planes. In olympiad tasks the boring mistakes cost the most points too: a missing seed, unscaled inputs, no baseline, no validation split.

**Do:** Press → three times: one column per press. Read only the bold words; the grey code is the hint for how.

- **Before:** seed, so a result can be repeated; scale with the mean and standard deviation of the TRAINING part only; compute a baseline (for Kobe "always miss" already gets 55.3%); keep 20% aside as validation.
- **While:** BCEWithLogitsLoss for yes/no (the model outputs a raw score, no sigmoid inside the training model); Adam 1e-3 to start, then try 3e-3 and 1e-2; judge by the validation loss.
- **Before submitting:** save the best weights with copy.deepcopy (a plain state_dict() keeps changing as you train); count the parameters in code: sum(p.numel() for p in model.parameters()).

**Ask:** The official Kobe baseline notebook printed a training loss of 0.6877. Which check would have told its author that the model learned nothing?

**Answer:** "Baselines first": always guessing the average make rate gives a loss of 0.6876. The model was no better than a constant, and nobody noticed because nobody computed the baseline.

### Slide 76 · Task 1: Kobe, will this shot go in?

*On screen:* Kobe: will this shot go in?

**Time:** 30 s

**Say:** Task one. Kobe Bryant played 20 seasons for the Lakers and took 30,697 shots that the NBA logged with their position on the court. You get 25,000 of them, each with "went in" or "missed". Your job: from the position alone, predict whether a shot goes in.

**Do:** Point at the court: every dot is one shot seen from above, the hoop at the bottom. Orange = made, blue = missed (800 of his shots shown). Let them notice the pile of shots right under the basket.

Where the task comes from: problem 1 of round 2 of China's national AI olympiad (NOAI 2024), reused as question 1 of the NOAI 2025 teaching test; the platform Bohrium labels that test "APOAI2025 Mock". The 25,000 rows are exactly the labelled shots of Kaggle's 2016 "Kobe Bryant Shot Selection" competition, shuffled and renumbered.

Be respectful: Kobe died in a helicopter crash in January 2020 with his daughter Gianna and seven others. Some students may feel strongly about him; mention it calmly if it comes up, and no jokes. A useful hook instead: he called his work ethic "Mamba mentality", obsessing over the boring details. For us that means seeds, scaling, baselines and validation.

### Slide 77 · The rules

*On screen:* The rules: a tiny net, raw inputs *(4 build steps)*

**Time:** 2 min

**Say:** The rules are strict on purpose. The network sees only two numbers per shot, loc_x and loc_y, and they arrive raw: tenths of a foot, with the hoop at zero. The statement claims they are "already normalized". That is false: x goes from −250 to 248 and y from −44 to 791.

**Do:** → 1: the size limit. At most 3 linear layers with at most 8 neurons each, so 2-8-8-1 is the biggest legal network: 105 numbers.

**Do:** → 2: activations only from this list, placed after linear layers. Build the layers as named attributes (self.fc1, self.fc2, self.fc3). nn.Sequential scores 0 because the checker cannot see inside it.

**Do:** → 3: you upload a zip with two files, the model class and the trained weights. → 4: the score is plain accuracy on hidden test shots. Board A is shown live during the contest; board B, the other half, is the final score.

**Ask:** Can you feed the distance to the rim as a third input? The data file has a column shot_distance.

**Answer:** No. The input must be exactly loc_x and loc_y; the grader passes two columns, so a three-input model would crash. It would not help anyway: shot_distance is just the distance computed from x and y, rounded down to whole feet.

Background: the baseline notebook names the class MyModel with an empty constructor; keep that. Mixing activations (ELU then ReLU) is fine. A final nn.Sigmoid is what the baseline does, so the grader most likely thresholds the output at 0.5; keep it.

### Slide 78 · Predict the best possible score

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

### Slide 79 · Accuracy only sees the 50% line

*(2 build steps)*

**Time:** 1.5 min

**Say:** Here is why the ceiling is so low. Each bar is how often Kobe scored from that distance. Accuracy only asks one yes/no question per shot: is it more likely in or out? So only the dashed 50% line matters. Only the first bars, right at the rim, are above it.

**Do:** Point at the orange bars (0–2 feet) and the long row of blue bars. Then → 1: the court lights up the small disc around the hoop. The best possible answer is basically "made if within about 3 feet of the rim, otherwise missed": 60.7% on held-out shots. That is the whole ceiling.

**Do:** → 2: the dashed line is the best a single straight line can do: 58.6%. A straight line cannot draw a disc. The official baseline is a 2-1-1-1 chain; with one neuron per layer it can only cut the court with one straight line, and its run learned nothing at all (loss 0.6877, same as a constant guess). The fix is width (8 neurons), not more depth.

**Ask:** The three-point line changes the points a shot is worth. Does it show up in the best accuracy boundary?

**Answer:** No. Kobe made fewer than half of his shots on both sides of the three-point line, so both sides are "miss". Accuracy cannot see it. (It would matter if the score were expected points or log loss.)

Numbers: 1-foot bins from all 25,000 rows of the task file: 0 ft 63.5% (4,480 shots), 1 ft 66.3%, 2 ft 53.0%, 3 ft 44.1%, then 36–48% out to 25 ft. The rule "made iff r ≤ 3 ft" predicts "made" for about 22% of shots. Trained 2-8-8-1 networks agree with it on 97–99% of validation shots. The straight cut drawn here is the best line found on the task data (59.2% on the data it was fitted to, 58.6% on held-out shots).

### Slide 80 · Live: the net learns the hot zone

*On screen:* SGD on raw numbers learns nothing

**Time:** 2 min

**Say:** This is a legal 2-8-8-1 ReLU network training live on 3,000 of Kobe's shots. Orange background = the net thinks "made", blue = "missed". It starts with plain SGD, learning rate 0.1, on the raw coordinates, exactly as the grader will hand them over.

**Ask:** Predict: with raw numbers in the hundreds, what will plain SGD learn?

**Do:** 1) Click **Train** (100 epochs, about 5 seconds). Watch accuracy: it sits at 54.6%, the "always miss" value for these 3,000 shots, and the court turns blue everywhere. Huge inputs make huge activations; the ReLUs die and the net settles on a constant.

**Do:** 2) Click **scaled inputs**, then **Train**. Same network, same learning rate, inputs divided by their spread: within a second the orange blob appears around the hoop and accuracy climbs to about 60%.

**Do:** 3) Click **Adam** and **raw inputs**, then **Train**. Adam also gets to about 60% (after a wobbly start). Adam takes steps of about the same size whatever the gradient size, so it hides the scaling problem. Scale anyway: it makes every learning rate and default behave as designed.

**Answer:** Plain SGD on raw coordinates collapses to "always miss"; scaling fixes it; Adam hides the problem.

Our PyTorch runs agree: SGD + momentum, lr 0.1, raw ReLU inputs collapsed to "always miss" (55.3% on validation) in 3 of 3 seeds, while scaled inputs reached 60.3%; with Adam, raw and scaled were equal. Reset and every toggle restart from the same seed and shuffle order, so the demo repeats exactly: SGD + raw ends at 54.6% with no shot called "made", SGD + scaled at 60.0%, Adam + raw at 60.3% (it dips below 50% around epoch 20 before recovering). With other shuffle orders SGD + raw escaped in about half of our runs, to about 59.7% without the rim zone: it is a lottery, which is exactly the problem.

### Slide 81 · Hint: fold the scaling into fc1

*On screen:* Hide the scaling inside the first layer *(3 build steps)*

**Time:** 1.5 min

**Say:** Here is the trap. You will train on scaled inputs, because that is the right thing to do. But the grader feeds raw coordinates into your network. So the scaling must live inside the weights. The good news: the scaling is itself a linear operation, so you can merge it into the first linear layer exactly.

**Do:** Top row: while training, x has 7 subtracted and is divided by 110 (y: minus 91, divided by 88; these are the means and spreads of the task data). → 1: what you submit has no separate scaling box: the first layer's weights are changed so it gives exactly the same outputs on raw numbers.

**Do:** → 2: the recipe in words: divide each weight by the spread of the input it multiplies; then shift the bias by the new weights times the means. Do not give them code; let them derive it on paper (it is one line of algebra) and check it numerically.

The algebra, for the coach: fc1 on scaled input is W·((x − μ)/σ) + b = (W/σ)·x + (b − (W/σ)·μ), where "/σ" divides column j of W by σ_j. In PyTorch, inside torch.no_grad(): weight ← weight / std (broadcast over columns), bias ← bias − new_weight @ mean. We checked it: the outputs match to 5 × 10⁻⁷; the reference pipeline gives the same accuracy on raw inputs after folding.

**Do:** → 3: four more hints. Computing distance or angle inside forward() breaks the "only linear layers and activations" rule, and it does not help (we measured no gain). Public notebooks lost everything by training one class and submitting another, so write submission_model.py first and import it. Before uploading, load the zip in a fresh notebook and run it on raw inputs. And do not chase the board: it moves by about one point by pure luck.

**Ask:** Why is folding the scaling into fc1 exact, and not just an approximation?

**Answer:** Subtracting a mean and dividing by a spread is a linear (affine) step, and a linear step followed by a linear layer is still one linear layer. Nothing is lost.

### Slide 82 · Task 2: optimise the input, not the weights

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

### Slide 83 · Two toy inversions

*On screen:* One unknown: one answer, or two

**Time:** 2 min

**Say:** Two tiny versions of the task, small enough to see everything. The "frozen model" is a + 2b + c², and we know its output is 4.65. Each picture shows the loss, how wrong the output is, for every value of the unknown. The magenta dots are the optimiser's steps.

**Do:** Left (find b, starting from 0): press **Run** with lr 0.125: one jump and it lands exactly on 0.7. Choose lr 0.05: small careful steps. lr 0.25: it bounces between 0 and 1.4 forever. lr 0.3: each bounce is bigger and it flies off the chart. The step size must fit the steepness of the valley.

**Do:** Right (find c, Adam lr 0.1): start +0.1 → it rolls to +1.5. Start −0.1 → it rolls to −1.5. Both give exactly 4.65. Start exactly 0 → it never moves: 0 is the top of the hill, the slope there is exactly zero, so the gradient says nothing.

**Ask:** Starting at +0.1 we get +1.5; the true answer was +1.5. Did gradient descent "know" the answer?

**Answer:** No. It went to whichever valley was downhill from the start. If the truth had been −1.5 it would have been wrong, with a perfect fit. Two keys open the same lock; the fit cannot tell you which one is right.

Maths for the coach: left loss (2b − 1.4)², gradient 4(2b − 1.4); one SGD step is b ← b(1 − 8·lr) + 5.6·lr, which converges only if lr < 0.25 (2 divided by the curvature 8) and lands in one step at lr = 1/8. Right loss (c² − 2.25)², gradient 4c(c² − 2.25), zero at c = 0 (a local maximum). All checked in PyTorch: SGD and Adam both stay at exactly 0 from c = 0.

### Slide 84 · One unknown? Look at all of it

*On screen:* One unknown? Try every value at once

**Time:** 1.5 min

**Say:** In the real task each row has only one unknown number. So instead of walking downhill, you can simply try every value: 2,001 values between −5 and 5, for all 1,000 rows at once, in about a second. Then you see every answer, not just the one gradient descent happened to find.

**Do:** The black curve is the real replica network's output for one row as we sweep the missing input; the dashed line is the known output y. Every crossing (white circle) is an exact answer. The magenta arrow is where Adam ends when it starts at 0. The green ring is the true value.

- **row 1**: one crossing. Adam finds it. Easy.
- **row 9**: two crossings, at −3.49 and −0.36. Adam from 0 stops at the near one, which happens to be right.
- **row 140**: two crossings, at −1.91 and +0.02. Adam from 0 stops at +0.02 with a perfect fit, but the truth was −1.91.

**Ask:** In row 140 the fit is perfect at both crossings. How could you decide which one to submit?

**Answer:** Use other information, a "prior": which values are typical for this column (look at the other rows, or at how this column correlates with the other columns), or submit something in between when you are unsure, because the score is squared error. That is where the last points of the task are hidden; the basic method already gets about 98 out of 100.

Numbers from our ReLU replica: 330 of 1,000 rows have two answers in [−5, 5]. Almost all of the remaining error of plain Adam comes from about 15 rows where it picks the wrong one.

### Slide 85 · Skeleton code with TODOs

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

### Slide 86 · How the inversion task is scored

*On screen:* Score: zeros get 0, the best got 100 *(5 build steps)*

**Time:** 45 s

**Say:** How the inversion task is scored: you submit your recovered column and they compute the mean squared error against the truth. Submitting all zeros gives the baseline error 0.968, which scores 0. The best known solution has error 0.0045, which scores 100. In between, the score is a straight line in the error.

**Do:** → 1–4: zeros 0 points; Adam with lr 0.001 about 55; Adam with lr 0.1 about 98 (on our replica); best known 100. The axis is logarithmic so you can see that the last two points need the error to shrink five-fold.

Formula for the coach: score = (0.968 − MSE) / (0.968 − 0.0045) × 100, clipped to [0, 100]. Our replica numbers: 0.433 → 55.5, 0.0236 → 98.0, the full recipe (all answers per row, weighted by a learned prior, submit the weighted mean) 0.0145 → 99.0. The shape bug (MSE 2.44) scores 0.

**Ask:** You have a 98. Is it worth two more hours?

**Answer:** Only if other tasks are done. The cheap 98 comes in 15 minutes; the last 2 points need careful thinking about rows with two answers. Olympiad strategy: bank the safe score first on every task, then polish.

### Slide 87 · Plan before typing

*On screen:* Write your first three experiments *(1 build step)*

**Time:** 3.5 min

**Say:** Last thing before you start: plan before you type. In pairs, write down the first three experiments you will run for each task, in order. Three minutes. One of you writes, the other checks: does the plan start with a baseline? Is there a validation split? What number will tell you it worked?

**Do:** Click **Start** on the timer. Walk around; look for plans that start with a big model and no baseline. At 0:00, ask two pairs to read one plan aloud. Then press → to show an example plan and compare.

**Ask:** Does your first experiment produce a number you can compare everything else to?

**Answer:** It should: for Kobe the "always miss" accuracy (55.3%) and a logistic regression; for inversion the all-zeros submission (MSE 0.968, score 0) and a check that the model reproduces y once the true column is in. Every later experiment is judged against that number.

Pair activity A9 from the teaching pack. If time is short, do it for one task only (Kobe). The example plan on → is one good order, not the only one: for Kobe, the full validation accuracy should land around 60.5–61%; for inversion, Adam lr 0.1 should leave most rows with a tiny residual.


---

## 10 · Wrap-up — 8 min (2:52–3:00)

### Slide 88 · The whole lecture in one picture

**Time:** 2 min

**Say:** This is the picture from the very beginning, now with today's words under every box. Data: scaled, in batches, split into training and validation. Model: linear layers with activations in between, stacked. Loss: MSE for numbers, binary cross-entropy for yes/no, cross-entropy for classes. Gradients: one call, loss.backward(). Update: optimizer.step(), and Adam with learning rate 1e-3 is the default you start with.

**Ask:** Ask two or three students to explain one arrow each, in their own words.

**Answer:** Good answers mention: the model outputs logits; the loss compares predictions with labels; backward computes ∂loss/∂weight for every weight; the optimizer moves each weight a small step against its gradient; we repeat for many epochs and watch the validation loss.

### Slide 89 · You can now…

*On screen:* What you can do now

**Time:** 30 s

**Say:** Six skills from today. The first three are theory you will be asked about; the last three are what wins practical rounds.

**Do:** Ask for a show of hands on each line. Anything with few hands is what to repeat at the start of tomorrow.

### Slide 90 · Now: two tasks

*On screen:* Now: two tasks. Tomorrow: harder ones.

**Time:** 30 s

**Say:** Now you solve two olympiad tasks with exactly what we covered. Kobe: a tiny legal network that predicts whether a shot goes in. Inversion: a frozen network and a missing input column, which you recover with gradients. Tomorrow we continue with harder tasks, so note which parts of today felt shaky.

**Do:** Hand out the task files and the starter notebooks (notebooks/02 and 03). Remind them: baseline first, validation split, and save the best model.

