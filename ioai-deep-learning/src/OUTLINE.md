# Lecture outline — "Neural networks, hands-on" (180 min)

Audience: olympiad students who know vectors, matrices, gradient descent, classical
ML, logistic regression and backprop. Goal by the end of the day: they can build,
train, evaluate and debug a small MLP in PyTorch without copying, and they are ready
to start two tasks: **Kobe** (shot prediction with a tiny legal MLP) and **Inversion**
(recover a missing input of a frozen model by optimising the input).

Teaching rules (from research/pedagogy.md): never talk more than ~6 minutes without
students doing something; every demo is *predict, then reveal* (public vote first);
worked example → faded example → independent; retrieval quizzes at the start, after
the break and at the end; anchor everything in Kobe's data; one short story per
section, tied to the concept. Slides carry pictures and few words; explanations live in
the speaker notes.

Research files (read the parts relevant to your section; paths are in the scratchpad
`/tmp/claude-0/-home-user-solid-eureka/86c8d8ec-0fba-57b8-9249-8695458b91c0/scratchpad/research/`):
`pedagogy.md` (§1 content sequence, §1.10 misconceptions, §1.11 predict bank P1–P15,
§1.12 pair activities A1–A10, §1.13 quiz Q1–Q15, §1.14 paper exercises E1–E9, §3 verified
facts F1–F38, §5 coach Q&A, Appendix A real Kobe numbers), `visuals.md` (how to draw each
visual), `optimizers.md` (verified demo parameters), `olympiad.md` (practical tips, exact
PyTorch error messages), `basketball.md` (the Kobe task), `inversion.md` (the inversion
task), `design.md` (= src/DESIGN.md).

| # | file | section title | min | clock |
|---|------|---------------|-----|-------|
| 0 | 00-opening.js | Opening | 10 | 0:00–0:10 |
| 1 | 01-why.js | Why neural networks? | 12 | 0:10–0:22 |
| 2 | 02-neuron.js | From one neuron to an MLP | 18 | 0:22–0:40 |
| 3 | 03-activations.js | Activations: any function | 22 | 0:40–1:02 |
| 4 | 04-loss.js | Loss: how wrong are we? | 13 | 1:02–1:15 |
| 5 | 05-break.js | Break | 10 | 1:15–1:25 |
| 6 | 06-optim.js | Gradient descent and optimizers | 22 | 1:25–1:47 |
| 7 | 07-loop.js | The training loop, live | 28 | 1:47–2:15 |
| 8 | 08-generalize.js | Generalization and debugging | 15 | 2:15–2:30 |
| 9 | 09-tasks.js | Olympiad playbook and the two tasks | 22 | 2:30–2:52 |
| 10 | 10-wrap.js | Wrap-up | 8 | 2:52–3:00 |

Real numbers to reuse (from our runs on the real Kobe data, 80/20 split, 3 seeds):
44.6% of labelled shots made → "always miss" = 55.2% accuracy, constant-prediction log loss
0.687–0.688; logistic regression on (x,y) 0.675; legal 2-8-8-1 (105 params) Adam 1e-3 0.662
and ≈61% accuracy; Adam 1e-2 0.660; 80× bigger net 0.660; SGD lr 1e-3 0.683; SGD lr 0.1
0.663; Adam lr 1.0 0.701 (51.7%); no zero_grad 0.686 (53.4%); sigmoid + BCEWithLogitsLoss
printed loss looks normal, accuracy 61% but true log loss 4.69 (76% of outputs < 0.01 or
> 0.99); raw (unscaled) inputs: loss at init 2.33 instead of 0.69; 2-256-256-1 on 500 shots:
train 0.37 vs val 1.23; ReLU vs tanh on Kobe 0.662 vs 0.664.

---------------------------------------------------------------------------------

## 0 · Opening (10 min) — done (00-opening.js), add slides 5–6
1. Title with a live spiral. 2. Where we are. 3. Today's map. 4. The one picture (loop).
5. **Warm-up recall** (Q1–Q3, write then reveal by steps): p = σ(w·x + b); ∂BCE/∂z = p − y;
   backprop = gradient of the loss w.r.t. every parameter via the chain rule backwards.
6. **Predict: what % of Kobe's shots went in?** Court with his shots; everyone writes a number;
   reveal 44.6% → "always miss" already gets 55%. "Remember these numbers."

## 1 · Why neural networks? (12 min)
1. **Predict**: circle dataset. "One straight line?"
2. **Logistic regression fails, live**: playground hidden=[] on circle, boundary stays a line.
3. **Kobe too**: A1 pair activity: sketch where Kobe scores and where a logistic-regression
   boundary would go (his make-rate falls with distance from the rim: a curve, not a line).
4. **XOR and the first AI winter**: 1958 Perceptron + NYT quote ("walk, talk, see, write,
   reproduce itself and be conscious of its existence"), 1969 Minsky & Papert (single layer
   only!), winter, 1986 backprop.
5. **Fix 1: invent a feature**: 3-D lift z = x² + y², a flat plane cuts the paraboloid,
   rotate by dragging; the cut is a circle back in 2-D.
6. **But which feature for a spiral? For a court?** — let the model learn the features.
7. **Fix 2: a hidden layer**: playground 2-4-1 tanh on circle with neuron maps: each hidden
   neuron is one line (a logistic regression); the output combines them into a polygon.
8. **Takeaway**: "hidden layer = learned features".

## 2 · From one neuron to an MLP (18 min)
1. **One neuron = logistic regression without the last sigmoid**: diagram, sliders for w₁ w₂ b;
   live z and ReLU(z).
2. **A neuron is a line**: plane coloured by output, the line z = 0, the weight vector as a
   normal arrow; sliders rotate/shift it.
3. **On paper (worked, E1)**: 2-2-1 forward pass x = (1, 2) … → p = 0.269, loss 1.313; reveal
   each intermediate by step. (E2 backward pass is in the notes as optional faded practice.)
4. **Invent first (E4/P2)**: pairs find 2-2-1 ReLU weights for XOR; reveal h₁ = ReLU(x₁+x₂),
   h₂ = ReLU(x₁+x₂−1), y = h₁ − 2h₂ with truth table. "Two hidden neurons solve what froze
   the field." (The XOR network SVG from the old break slide can be reused.)
5. **A layer is a matrix multiply**: tensor blocks (32,2)@(2,8)→(32,8), Falk layout (DESIGN §6.4).
6. **nn.Linear in code**: predict the shapes; `layer.weight.shape` is (8, 2) (out × in).
7. **Count parameters (A4)**: Linear(2,8) = 24; 2-8-8-1 = 24+72+9 = 105; 784-128-10 = 101,770.
8. **Forward pass, animated**: 2-8-8-1 diagram; click a court position, activations flow.
9. **An MLP in PyTorch**: `class MLP(nn.Module)` fc1/fc2/fc3; build __init__ vs forward;
   tag-warn "Kobe task: no nn.Sequential".
10. **Same recipe, different scale**: 105 vs GPT-3 175,000,000,000 (1.7 billion ×), zoom-out.

## 3 · Activations: any function (22 min)
1. **Predict (P1)**: "10 linear layers vs 1: more, same, fewer functions?"
2. **They collapse**: playground act=none hidden [8,8] on circle stays a line; E3 algebra
   W₂(W₁x+b₁)+b₂ = (W₂W₁)x + (W₂b₁+b₂).
3. **Activation zoo**: ReLU, Leaky ReLU, sigmoid, tanh, GELU; toggle the derivatives.
4. **Invent first (A3)**: build a hat with ReLUs: f(0)=0, f(1)=1, f(2)=0, flat outside →
   ReLU(x) − 2ReLU(x−1) + ReLU(x−2). Interactive hinge builder.
5. **Any curve from hinges**: target curve; slider N hinges; least-squares output weights;
   faint hinges + bold sum; MSE readout.
6. **Sigmoid towers (Nielsen)**: steep sigmoid pairs make bumps; many bumps make a curve.
7. **Training finds it by itself**: fit1d, 2/4/8/32 neurons.
8. **Universal approximation theorem**: Cybenko 1989 / Hornik 1991 — and what it does NOT
   say: how to find the weights, how wide, generalisation, extrapolation (P14).
9. **Depth folds space**: tent map composed k times → 2ᵏ linear pieces with 2k neurons
   (Telgarsky 2016); paper-folding analogy.
10. **Space warping** (optional, cut if late): a hidden layer bends the grid until classes
    become linearly separable (Olah 2014).
11. **Vanishing gradients**: σ′ ≤ 0.25 → 0.25¹⁰ ≈ 10⁻⁶; ReLU′ = 1 on the active side.
12. **Dead ReLU**: line outside the data → output 0, gradient 0 forever; Leaky ReLU.
13. **Does it matter on Kobe?** ReLU 0.662 vs tanh 0.664: barely. Which activation where:
    hidden ReLU default · tanh small/smooth · GELU/SiLU transformers; output none (logit).
14. **Quiz**: ReLU(−5)? σ(0)? σ′ max? MLP without activations on the circle?

## 4 · Loss: how wrong are we? (13 min)
1. **MSE you can see**: residuals drawn as literal squares; drag the line; area = loss.
2. **Cross-entropy**: −log p curve; slider p for a made shot; A5 ranking 0.105 < 0.693 <
   2.303 < 6.908. "Confident and wrong is expensive."
3. **Why not accuracy as the loss?** staircase (zero gradient) vs smooth BCE.
4. **Logits**: model outputs z; sigmoid turns it into p; losses take logits.
5. **Loss at the start (P3)**: ≈ 0.69 = ln 2; Kobe's constant baseline 0.687 is the number to beat.
6. **Cheat sheet**: number → 1 value → MSELoss; yes/no → 1 logit → BCEWithLogitsLoss;
   one of K → K logits → CrossEntropyLoss (softmax inside, integer labels).
7. **Softmax**: logits → exp → normalise, animated bars.
8. **Cliffhanger (P4) vote, no reveal**: "Sigmoid last layer + BCEWithLogitsLoss: crash /
   normal / quietly worse / NaN?" Vote, discuss, re-vote. "We'll run it after the break."

## 5 · Break (10 min) — rework 05-break.js
Timer + "True or Bluff?" (pedagogy §4.2): 10 statements, revealed one per step after the break
(or used as a filler). Keep the XOR puzzle only in section 2.

## 6 · Gradient descent and optimizers (22 min)
1. **After-break recall** (Q4–Q9, reveal by steps).
2. **On paper**: L(w) = (w−3)², w₀ = 0, η = 0.1 → gradient −6 → w₁ = 0.6.
3. **Learning rate, live**: ball on the parabola; presets too small / good / oscillating /
   diverging (values from optimizers.md); trajectory + w vs step.
4. **The same in PyTorch**: requires_grad, backward, no_grad update, grad.zero_().
5. **Epoch, batch, step** (A8): 20,558 shots, batch 64 → 322 steps/epoch, last batch 14;
   full batch vs mini-batch paths (smooth vs noisy); P12: batch 64 beats full batch per epoch.
6. **Ravines and input scale**: elongated contours → zig-zag; Kobe coordinates are in the
   hundreds → standardise; contours become round.
7. **Momentum**: heavy ball; race on the ravine.
8. **Adam = momentum + its own step size per weight**: race SGD / momentum / Adam; honest:
   Adam is a default, not magic (show a surface where it is not best).
9. **Predict (P7)**: gradients 1000, 1, 0.001 → after one Adam step (lr 1e-3) all moved 0.001.
10. **Predict (P8/P10)**: Kobe bar chart: Adam 1e-3 0.662, Adam 1.0 0.701, SGD 1e-3 0.683,
    SGD 0.1 0.663, constant 0.688. "lr 1e-3 is an Adam default, not a law of nature."
11. **What to use**: Adam lr 1e-3 (try 3e-3, 3e-4; Karpathy's 3e-4 tweet), AdamW for weight
    decay, SGD + momentum still common for CNNs; Adam is the #4 most-cited paper of the century.
12. **Schedules**: constant / step / cosine with warmup; ReduceLROnPlateau for small tasks.
13. **Code**: manual 3 lines ↔ optimizer 3 lines (zero_grad, backward, step).

## 7 · The training loop, live (28 min)
1. **The five beats**: zero_grad → forward → loss → backward → step; code with line builds +
   side diagram (forward ink, backward dashed magenta).
2. **One step, animated**: network diagram: activations forward, loss, gradients back,
   weights change thickness.
3. **Live coding (tag code)**: open notebooks/01; checklist of cells.
4. **Planned mistake 1 — no scaling**: predict the loss at init → 2.33 vs 0.69; standardise
   with *training* mean/std (LeCun 1998 "Efficient BackProp").
5. **The model and the loop**: complete minimal script (≤ 12 lines per slide, 2 slides).
6. **Kobe results table**: constant 0.687 / logistic 0.675 / MLP 0.662, accuracy 55 / – / 61%.
7. **Planned mistake 2 — no zero_grad (P5)**: 0.686, 53% (below "always miss"); gradients
   add up 2 → 4 → 6.
8. **Cliffhanger reveal (P4)**: sigmoid + BCEWithLogitsLoss: printed loss normal, accuracy 61%,
   true log loss 4.69, 76% of outputs extreme; loss trapped in (0.313, 0.693).
9. **Planned mistake 3 — target shape**: (N,) vs (N,1): the exact error message; MSELoss
   silently broadcasts to (N, N) (matters for inversion!).
10. **Live demo: scale your inputs** — courtNet raw vs scaled.
11. **Evaluate correctly**: model.eval(), torch.no_grad(), accuracy from logits > 0.

## 8 · Generalization and debugging (15 min)
1. **Train / validation / test** split bar; never tune on the test.
2. **Overfitting, live**: noisy data + big network; train vs val curves; 2-256-256-1 on 500
   shots: 0.37 vs 1.23.
3. **Predict (P9, P13)**: 80× bigger net → 0.660 (same); 55% accuracy = "always miss".
4. **Cures**: more data · smaller model · weight decay · dropout (Hinton's bank tellers) ·
   early stopping + best checkpoint (`copy.deepcopy(model.state_dict())`).
5. **Loss-curve doctor**: 6 curve shapes → diagnosis (lr too high, too low, plateau/saturated,
   overfitting, noisy, healthy).
6. **Karpathy's recipe**: loss at init, input-independent baseline, overfit one batch, visualise.
7. **Bug hunt (E9/A7)**: printed loop with 5 planted bugs; 4 min in pairs; reveal one per step.
8. **Bug gallery**: 4–5 exact PyTorch error messages with one-line fixes (olympiad.md).
9. **Story**: double descent and grokking ("lucky = forgetful") — the U-curve isn't everything.

## 9 · Olympiad playbook and the two tasks (22 min)
1. **Pre-flight checklist**: seed · scale inputs · baselines · validation split · right loss ·
   Adam 1e-3 · watch validation · keep the best weights · assert the parameter count.
2. **Task 1: Kobe** — "20 seasons, 30,697 shots. Will this one go in?" (be respectful about his
   death). The task is NOAI 2024 round 2 problem 1, reused as Q1 of the NOAI 2025 teaching test
   (Bohrium labels that test "APOAI2025 Mock"). The 25,000 rows are Kaggle's labelled Kobe shots.
3. **The rules** — inputs loc_x, loc_y only (raw, in tenths of feet: x −250…248, y −44…791;
   the statement's "already normalized" is false); ≤ 3 linear layers, ≤ 8 neurons each → 2-8-8-1
   (105 params) is the largest; activations only nn.ReLU/Sigmoid/Tanh/ELU/LeakyReLU/PReLU after
   linear layers; no nn.Sequential (scores 0); submission.zip = submission_model.py +
   submission_dic.pth; score = test accuracy (board A live 50%, board B final 50%).
4. **Predict the score** — "always miss" 55.3%; best straight line 58.6%; legal 2-8-8-1 ≈ 60.5–61%
   on validation (leaderboard 0.62–0.625); ceiling ≈ 61%. Why so low: Bernoulli labels — even the
   4,200 shots at exactly (0,0) went in only 62.5%. Accuracy only cares about the 50% line, and
   only shots within ~3 ft of the rim go in more than half the time: the accuracy-optimal answer
   is basically "made iff within 3 ft" (60.7%). The official 2-1-1-1 baseline can only draw a
   straight boundary and learned nothing (loss 0.6877 = constant). Width beats depth here.
5. **Live: the network learns Kobe's hot zones** — courtNet; SGD + raw inputs collapses to
   "always miss" while SGD + scaled reaches ≈ 60%; Adam hides the problem (no difference).
6. **Hints, not answers** — the grader feeds RAW coordinates, so any scaling must live in the
   weights: fold (x − μ)/σ into fc1 (W' = W/σ, b' = b − W μ/σ) — exact and legal; extra maths in
   forward() (distance, angle, buffers) breaks the "only linear layers + activations" rule.
   Write submission_model.py first and import that class for training (mismatch bug seen in
   public notebooks). Reload the zip and check it. Leaderboard noise ≈ ±0.01 (2,500 shots).
7. **Task 2: Inversion — optimise the input, not the weights**: training vs inversion diagrams
   (what is frozen, what moves); panda → gibbon 99.3% (P15); DeepDream; Fredrikson 2014 warfarin
   = this exact task.
8. **Toy 1: one unknown, one answer** — f = a + 2b + c², recover b; lr 0.125 one step, 0.25
   oscillates, 0.3 blows up (inversion.md demo_1d).
9. **Toy 2: two answers** — recover c, roots ±1.5; starting exactly at 0 → stuck (gradient 0).
10. **Adam's step is ≈ lr**: lr 1e-3 needs 2000 steps to move 2 → use lr ≈ 0.1 (Adam 1e-3:
    MSE 0.433; Adam 0.1: 0.024 on our replica).
11. **One unknown? Look at all of it** — 1-D grid of 2001 values in one batch shows every root;
    non-uniqueness is the real limit; pick by a prior.
12. **Skeleton code** — frozen model, missing column with requires_grad, torch.cat, loss, Adam (TODOs).
13. **How it's scored** — baseline 0.968 → best 0.0045, the formula as a ruler.
14. **Plan before typing (A9)**: pairs write their first three experiments for each task.

## 10 · Wrap-up (8 min)
1. The whole lecture in one picture (done). 2. What you can do now (done).
3. **Exit ticket** (Q10–Q15, reveal by steps). 4. Now: two tasks (done).
