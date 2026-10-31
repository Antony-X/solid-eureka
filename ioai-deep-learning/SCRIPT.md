# Teacher's script — Neural networks, hands-on

Slide-by-slide script for the 28-minute lecture (10 slides). It is generated from the speaker notes in the deck (`tools/export_script.js`), so it always matches `lecture.html`. For background on every topic, the task hint ladders and the Q&A cheat-sheet, read `COACH_GUIDE.md` first.

How to read it: **Say** is what to tell the class, **Do** is what to click or draw, **Ask** is a question for the class and **Answer** its answer. "Press →" means advance one build step. In the deck, P opens the presenter window with these notes, a timer and the next slide.

| # | Section | Minutes | Clock | Slides |
|---|---|---|---|---|
| 0 | Opening | 10 | 0:00–0:10 | 1–6 |
| 1 | Break | 10 | 0:10–0:20 | 7–7 |
| 2 | Wrap-up | 8 | 0:20–0:28 | 8–10 |


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

**Answer:** 1) p = σ(w·x + b), where σ(z) = 1/(1 + e^(−z)). 2) For sigmoid followed by binary cross-entropy, the derivative of the loss with respect to the raw score z is simply p − y (prediction minus label). This is why the two are always used together. 3) Backprop computes ∂loss/∂parameter for every parameter, by applying the chain rule backwards through the computation, reusing intermediate results.

If many students miss question 2, spend 30 seconds deriving it: L = −[y log p + (1−y) log(1−p)], dp/dz = p(1−p), so dL/dz = p − y. It returns in the loss section.

### Slide 6 · Predict: Kobe's shooting

*On screen:* Kobe Bryant took 25,697 labelled shots. What % went in? *(2 build steps)*

**Time:** 2 min

**Say:** Today's running example is real data: every shot Kobe Bryant took in 20 NBA seasons, with its position on the court. Orange dots went in, blue dots missed. This is also the data of your first task this afternoon.

**Do:** Everyone writes a number on paper first. Then → reveals 44.6%, → again reveals the consequence.

**Ask:** If 44.6% went in, how accurate is a "model" that always says "miss"?

**Answer:** 55.4% (about 55%). Remember this number: any model that does not clearly beat 55% has learned nothing. Later we will see that the best possible model only reaches about 61%, because the same spot can produce both a make and a miss.

Facts for the coach: the data is the Kaggle "Kobe Bryant Shot Selection" set (30,697 shots from 1996 to his last game on 13 April 2016; 5,000 had hidden labels). His regular-season career field-goal percentage was .447. Kobe died in a helicopter crash in January 2020; mention it respectfully if it comes up, and never joke about it.


---

## 1 · Break — 10 min (0:10–0:20)

### Slide 7 · Break: 10 minutes

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

## 2 · Wrap-up — 8 min (0:20–0:28)

### Slide 8 · The whole lecture in one picture

**Time:** 2 min

**Say:** This is the picture from the very beginning, now with today's words under every box. Data: scaled, in batches, split into training and validation. Model: linear layers with activations in between, stacked. Loss: MSE for numbers, binary cross-entropy for yes/no, cross-entropy for classes. Gradients: one call, loss.backward(). Update: optimizer.step(), and Adam with learning rate 1e-3 is the default you start with.

**Ask:** Ask two or three students to explain one arrow each, in their own words.

**Answer:** Good answers mention: the model outputs logits; the loss compares predictions with labels; backward computes ∂loss/∂weight for every weight; the optimizer moves each weight a small step against its gradient; we repeat for many epochs and watch the validation loss.

### Slide 9 · You can now…

*On screen:* What you can do now

**Time:** 30 s

**Say:** Six skills from today. The first three are theory you will be asked about; the last three are what wins practical rounds.

**Do:** Ask for a show of hands on each line. Anything with few hands is what to repeat at the start of tomorrow.

### Slide 10 · Now: two tasks

*On screen:* Now: two tasks. Tomorrow: harder ones.

**Time:** 30 s

**Say:** Now you solve two olympiad tasks with exactly what we covered. Kobe: a tiny legal network that predicts whether a shot goes in. Inversion: a frozen network and a missing input column, which you recover with gradients. Tomorrow we continue with harder tasks, so note which parts of today felt shaky.

**Do:** Hand out the task files and the starter notebooks (notebooks/02 and 03). Remind them: baseline first, validation split, and save the best model.

