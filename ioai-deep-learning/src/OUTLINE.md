# Lecture outline — "Neural networks, hands-on" (180 min)

Audience: olympiad students who know vectors, matrices, gradient descent, classical
ML, logistic regression and backprop. Goal by the end of the day: they can build,
train, evaluate and debug a small MLP in PyTorch without copying, and they are ready
to start two tasks: **Kobe** (shot prediction with a tiny legal MLP) and **Inversion**
(recover a missing input of a frozen model by optimising the input).

Rhythm: every 8–12 minutes the students *do* something (predict, compute on paper,
discuss in pairs, watch a live demo they control, code). Slides carry pictures and
few words; the explanation lives in the speaker notes.

| # | file | section | minutes | clock |
|---|------|---------|---------|-------|
| 0 | 00-opening.js | Opening | 6 | 0:00–0:06 |
| 1 | 01-why.js | Why neural networks? | 14 | 0:06–0:20 |
| 2 | 02-neuron.js | From one neuron to an MLP | 20 | 0:20–0:40 |
| 3 | 03-activations.js | Activations and "any function" | 25 | 0:40–1:05 |
| 4 | 04-loss.js | Loss: how wrong are we? | 15 | 1:05–1:20 |
| 5 | 05-break.js | Break | 10 | 1:20–1:30 |
| 6 | 06-optim.js | Gradient descent and optimizers | 25 | 1:30–1:55 |
| 7 | 07-loop.js | The training loop, live | 25 | 1:55–2:20 |
| 8 | 08-generalize.js | Generalization and debugging | 15 | 2:20–2:35 |
| 9 | 09-tasks.js | Olympiad playbook + the two tasks | 22 | 2:35–2:57 |
| 10 | 10-wrap.js | Wrap-up | 3 | 2:57–3:00 |

---------------------------------------------------------------------------------

## 0 · Opening (6 min)
1. **Title** — "Neural networks, hands-on". Right half: a live 2-8-8-1 network learning the
   two-spiral dataset on autoplay (ambient wow). Kicker "IOAI training".
2. **Where we are** — a path of nodes: vectors → matrices → gradient descent → classical ML →
   **neural networks (today)** → harder tasks (tomorrow). "You are here" marker.
3. **Today's map** — a horizontal 3-hour timeline bar, blocks proportional to minutes, break
   marked, the two tasks at the end drawn as small pictures (court, frozen box with a missing input).
4. **The one picture of today** — the training loop cycle (data → model → loss → gradients →
   update → repeat) drawn small and greyed: "by 3:00 you can explain every arrow". (Re-used in wrap-up.)

## 1 · Why neural networks? (14 min)
1. **Predict**: circle dataset (orange inside, blue ring). "One straight line?" tag predict.
2. **Logistic regression fails, live** — playground hidden=[] on circle; Train; boundary is a line,
   accuracy stuck ≈ 50–65%. Caption: "logistic regression = one line".
3. **XOR and the first AI winter** — 4 XOR points + a line that can't work; mini timeline:
   1958 Perceptron (NYT quote), 1969 Minsky & Papert "Perceptrons", winter, 1986 backprop.
4. **Fix 1: invent a feature** — 3-D lift: z = x² + y²; points on a paraboloid, a flat plane
   cuts them; drag to rotate; step shows the circle that the plane makes back in 2-D.
5. **But which feature for this?** — spiral data and Kobe's court side by side, big "?".
6. **Fix 2: let the network learn the features** — playground 2-4-1 (tanh) on circle with
   neuron maps: each hidden neuron is a line; together they make a polygon. Train live.
7. **Takeaway** — "hidden layer = learned features".

## 2 · From one neuron to an MLP (20 min)
1. **One neuron** — diagram x₁,x₂ → Σ (weights on edges) + b → activation → output. Sliders
   w₁ w₂ b and inputs; live z and ReLU(z). Paper first: x=(2,−1), w=(0.5,−1), b=0.5 → z=2.5.
2. **A neuron is a line** — the plane coloured by the neuron's output, the line z=0 drawn,
   the weight vector w drawn as an arrow normal to the line; sliders rotate/shift it.
3. **On paper: a 2-2-1 network** — numbers on edges; students compute the output; reveal on step.
4. **A layer is a matrix multiply** — shape blocks: X (32×2) · Wᵀ (2×8) + b (8) → (32×8), coloured
   blocks drawn to scale; "rows = examples, columns = features/neurons".
5. **nn.Linear in code** — `layer = nn.Linear(2, 8)`, `x = torch.randn(32, 2)`, `layer(x).shape`,
   `layer.weight.shape` → (8, 2) (PyTorch stores out × in). Predict the shapes first.
6. **Count the parameters** — predict: nn.Linear(2,8) → 24; the 2-8-8-1 net → 24+72+9 = 105.
   Diagram with counts under each layer.
7. **Forward pass, animated** — 2-8-8-1 diagram; click a point on a small plot; activations flow
   left→right, neurons light up by value, output probability shown.
8. **An MLP in PyTorch** — `class MLP(nn.Module)` with fc1, fc2, fc3; build: __init__ = parts,
   forward = wiring; tag-warn: "Kobe task: no nn.Sequential".
9. **Same recipe, different scale** — 105 parameters vs GPT-3's 175,000,000,000: zoom-out
   animation where our net shrinks to an invisible dot.

## 3 · Activations and "any function" (25 min)
1. **Predict**: "Stack 100 linear layers — more powerful?"
2. **They collapse** — playground act=linear hidden=[8,8] on circle: still a line. Equation
   W₂(W₁x+b₁)+b₂ = (W₂W₁)x + (W₂b₁+b₂) with colours.
3. **Activation zoo** — ReLU, Leaky ReLU, sigmoid, tanh, GELU small multiples; click to enlarge;
   toggle to overlay the derivative.
4. **ReLU = a hinge** — one ReLU unit in 1-D: sliders w, b move the kink; two hinges make a ramp/bump.
5. **Any curve from hinges** — target curve (something fun: a skyline/camel); slider N hinges; output
   weights solved instantly (least squares); faint individual hinges + bold sum; MSE readout.
6. **Sigmoid towers (Nielsen)** — two steep sigmoids make a step-up/step-down bump; many bumps
   approximate a curve; slider steepness and number of bumps.
7. **Training finds it by itself** — fit1d on a wiggly target, 2/4/8/32 neurons.
8. **Universal approximation theorem** — Cybenko 1989 / Hornik 1991: one hidden layer can
   approximate any continuous function on a box… with possibly huge width. "Exists ≠ easy to train."
9. **Depth folds space** — sawtooth by composing a tent map (2 ReLUs) k times → 2ᵏ pieces with
   2k neurons (Telgarsky 2016); slider k; paper-folding analogy. Width would need 2ᵏ neurons.
10. **Space warping** — a hidden layer bends the input grid so the classes become separable
    (Olah 2014): animate the grid from input space to hidden space (2-2 tanh layer).
11. **Vanishing gradients** — sigmoid' ≤ 0.25; chain of 10 layers → ≤ 0.25¹⁰ ≈ 10⁻⁶ (bars shrinking);
    ReLU' = 1 on the active side.
12. **Dead ReLU** — a neuron whose line sits outside the data: output 0, gradient 0, forever.
    Leaky ReLU keeps a small slope.
13. **Which activation where?** — hidden: ReLU (default) · tanh (tiny nets, smooth targets) · GELU/SiLU
    (transformers). Output: none (a logit) + the right loss; sigmoid only to read a probability.
14. **Quiz** — ReLU(−5)? sigmoid(0)? MLP without activations on the circle? (reveal answers by step)

## 4 · Loss: how wrong are we? (15 min)
1. **MSE you can see** — points, a line, residuals drawn as literal squares; drag slope/intercept;
   total square area = loss.
2. **Cross-entropy** — curve −log p; slider p for a "made" shot: 0.9 → 0.105, 0.5 → 0.69,
   0.1 → 2.30, 0.01 → 4.6. "Confident and wrong is expensive."
3. **Why not optimise accuracy directly?** — accuracy vs a weight is a staircase (gradient 0
   almost everywhere); BCE is smooth. Predict first.
4. **Logits** — raw score z → sigmoid → probability; the model outputs logits.
5. **Cheat sheet** — task → last layer → loss: number → 1 value → MSELoss; yes/no → 1 logit →
   BCEWithLogitsLoss; one of K → K logits → CrossEntropyLoss (softmax inside).
6. **Pitfall: sigmoid twice** — buggy code highlighted; outputs squashed to (0.5, 0.73).
7. **Softmax** — logits → exp → normalise, animated bars.

## 5 · Break (10 min)
1. Big countdown 10:00 + an optional puzzle: "How many parameters in nn.Linear(784, 10)?" (7850)
   and "What does this network compute?" (a tiny net with given weights = XOR).

## 6 · Gradient descent and optimizers (25 min)
1. **On paper** — L(w) = (w−3)², w₀ = 0, η = 0.1 → gradient −6 → w₁ = 0.6.
2. **Learning rate, live** — ball on the parabola; presets "too small / good / oscillating /
   diverging" (exact values from research/optimizers.md); trajectory on the curve + w vs step.
3. **The same in PyTorch** — requires_grad, backward, no_grad update, grad.zero_(); line builds.
4. **Epoch, batch, step** — 1000 rows, batch 100 → 10 steps per epoch, drawn as blocks; full-batch
   vs mini-batch path on a bowl (smooth vs noisy).
5. **Ravines** — elongated contours → zig-zag; cause: features on different scales (Kobe
   coordinates in hundreds) → standardise; contours become round, path goes straight.
6. **Momentum** — heavy ball; race on the ravine: SGD vs momentum.
7. **Adam** — "momentum + its own step size for every weight". Race SGD vs momentum vs Adam on
   a 2-D surface; choose surface; play/reset. Honest: Adam is a good default, not magic.
8. **What to use** — default Adam lr 1e-3 (try 3e-3, 3e-4; Karpathy's 3e-4 tweet), AdamW for
   weight decay, SGD + momentum still common for CNNs with schedules.
9. **Schedules** — constant / step / cosine with warmup curves; "big steps first, small steps later".
10. **Code** — manual 3 lines ↔ optimizer 3 lines (zero_grad, backward, step).

## 7 · The training loop, live (25 min)
1. **The five lines** — loop code with line-by-line build; side diagram: forward (ink) →
   loss → backward (magenta) → step.
2. **One step, animated** — network diagram: activations flow forward, loss appears, gradients
   flow back, weights thicken/thin.
3. **Your turn: break it on purpose** — full playground (data, activation, width, lr, optimizer):
   challenges on the slide: spiral with 2-2-1? lr = 3? activation = none?
4. **Live coding** — tag code: open notebook 01; checklist of cells we type together.
5. **The complete script** — data tensors → model → loss/optimizer → loop → evaluate (2 slides).
6. **Scale your inputs** — courtNet with raw vs scaled inputs on Kobe's shots.
7. **Evaluate correctly** — model.eval(), torch.no_grad(), accuracy from logits (> 0).

## 8 · Generalization and debugging (15 min)
1. **Train / validation / test** — split bar; "never tune on the test".
2. **Overfitting, live** — noisy data, big network: boundary islands / wiggly curve; train vs
   validation loss curves drawn live; validation turns up.
3. **Cures** — more data · smaller model · weight decay · dropout (Hinton's bank tellers) ·
   early stopping; one small picture each.
4. **Early stopping + best checkpoint** — val curve minimum marked; `best = copy.deepcopy(model.state_dict())`.
5. **Loss-curve doctor** — 6 curve shapes; students diagnose; reveal (lr too high, lr too low,
   plateau/saturation, overfitting, noisy, healthy).
6. **Karpathy's recipe** — overfit one batch first; baselines first; look at your data.
7. **Bug gallery** — 4–5 real error messages with the one-line fix.

## 9 · Olympiad playbook + the two tasks (22 min)
1. **Pre-flight checklist** — seed · scale inputs · baseline · validation split · right loss ·
   Adam 1e-3 · watch validation · keep the best weights.
2. **Task 1: Kobe** — "20 seasons, 30,697 shots. Will this one go in?" court with his shots.
3. **The rules** — 2 → ≤8 → ≤8 → 1 diagram, allowed activations, no nn.Sequential, only loc_x, loc_y.
4. **Predict the score** — always "miss" 55%; a good legal MLP ≈ 60–61%; why the ceiling: same spot,
   both outcomes (Bernoulli).
5. **Live: the network learns Kobe's hot zones** — courtNet; toggle raw vs scaled inputs.
6. **Hints, not answers** — think about input scale (and where the scaling can live legally),
   activation choice, lr, epochs, validation. (Folding scaling into fc1 is a strong hint.)
7. **Task 2: Inversion** — "optimise the input, not the weights": DeepDream, adversarial panda,
   style transfer, model inversion. Training vs inversion diagrams (what is frozen, what moves).
8. **Toy 1: one unknown, one answer** — f(a,b,c) = a + 2b + c², know a=1, c=2, y=11; slide b; the loss
   parabola; GD finds b = 3.
9. **Toy 2: two answers** — unknown c: c² = 4 → ±2; GD from exactly 0 is stuck (zero gradient).
10. **One unknown number? Try them all** — grid search over 2001 values in one batch, then refine.
11. **Skeleton code** — frozen model, missing column with requires_grad, torch.cat, loss, Adam (TODOs).
12. **How it's scored** — baseline 0.968 → best 0.0045, the score formula as a ruler.

## 10 · Wrap-up (3 min)
1. **The whole lecture in one picture** — the training-loop cycle, each arrow labelled with today's words.
2. **Now: two tasks. Tomorrow: harder ones.** + questions.
