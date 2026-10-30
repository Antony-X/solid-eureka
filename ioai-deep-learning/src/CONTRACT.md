# Slide authoring contract

Every section of the deck is one file in `src/sections/NN-name.js`. Files load in
name order after the libraries, so all globals below are available. The build
(`python3 tools/build.py`) inlines everything into `lecture.html`; nothing is
loaded from the network, so **never reference external URLs, images or fonts**.

## Registering slides

```js
Deck.section({ id: 'act', title: 'Activations', minutes: 25 });   // once per file, first line

Deck.slide({
  id: 'act-collapse',              // unique, kebab-case, prefixed with the section id
  title: 'Linear layers collapse', // shown in the slide map (O) and notes; not rendered on the slide
  cls: 'plain',                    // optional extra classes on <section class="slide">
  html: `...`,                     // slide markup (template literal)
  notes: `<p class="say">…</p>`,   // speaker notes (HTML) — required on every slide
  steps: 3,                        // optional: extra build steps not declared in markup
  init(el, api) { … },             // optional: called once, lazily, before first display
});
```

### Section CSS
Do **not** edit shared files (`src/engine.*`, `src/lib/*`). If a section needs its own
styles, register them once at the top of the section file with
``Deck.css(`.sec-act .zoo { … }`)``. Every slide element has the class `sec-<section id>`,
so always prefix selectors with it. Section-only helper functions go inside the section
file wrapped in a block or IIFE (`(() => { … })();` or `{ … }`) so they do not leak globals.

### Stage
The slide is a fixed **1920×1080** box (scaled to the screen). Padding is 84px
top, 104px sides, 80px bottom, so usable area is about **1712×916**. The slide
is a flex column with `gap: 32px`. Nothing may overflow it; `tools/shoot.js`
reports overflow.

### Build steps (fragments)
* `data-step="k"` — hidden until step k, then stays (k ≥ 1).
* `data-only="k"` or `data-only="2 3"` — visible only at those steps. Use
  inside `<div class="stack">` to swap things in the same place.
* `data-until="k"` — visible until step k, then hidden.
* add class `dim-after` to a `data-step` element to dim it once a later step is shown.
* Code line highlights: `Code.py(src, { hl: '1:2 2:3-4 3:6,8' })` → at step 1 line 2
  is spotlighted, at step 2 lines 3–4, etc. (lines are 1-based).
* JS can react: `api.onStep(k => …)`; total steps = max of all of the above and `steps`.

### The `api` object passed to `init(el, api)`
* `api.loop((dt, now) => { …; return true })` — requestAnimationFrame loop that
  runs **only while the slide is visible** (return `false` to stop it).
* `api.onTheme(fn)` — redraw when light/dark changes. **Every canvas must redraw here.**
* `api.onStep(fn)`, `api.onEnter(fn)`, `api.onLeave(fn)`, `api.$(sel)`, `api.$$(sel)`,
  `api.active`, `api.step`.

## Libraries (globals)

* **`Plot`** — `Plot.canvas(parent, w, h)` → `{cv, ctx, w, h, pos(e), clear(fill)}` (crisp,
  2× backing). `Plot.colors()` → theme colours `{paper, ink, muted, grid, rule, c0, c1,
  grad, ok, bad, hi, fontBody, fontMono, fontDisplay}`. `Plot.scale(d0,d1,r0,r1)` (with
  `.inv`), `Plot.frame(x0,y0,size,[lo,hi])`, `Plot.axes(ctx,sx,sy,{xlabel,ylabel,font,grid,nx,ny,fmt})`,
  `Plot.fn(ctx,sx,sy,f,{color,width,dash})`, `Plot.points(ctx,X,Y,sx,sy,{r})`,
  `Plot.heat(ctx,(x,y)=>p,frame,{res,strength})` (probability map in class colours),
  `Plot.contour(ctx,(x,y)=>p,frame,{level,color,width})`, `Plot.arrow`, `Plot.dot`,
  `Plot.text(ctx,s,x,y,{size,weight,mono,display,color,align,base})`, `Plot.curve(ctx, values, {x,y,w,h}, {min,max,log,color})`,
  `Plot.mix(a,b,t)`, `Plot.rgb(hex)`, `Plot.str(rgbArray, alpha)`, `Plot.alpha(hex, a)`.
* **`NN`** — `NN.rng(seed)` (with `.normal()`, `.uniform(a,b)`), `NN.act[name]`
  (`linear relu leaky tanh sigmoid gelu silu step`, each `{f, d, name}`), `NN.sigmoid`,
  `new NN.MLP([2,8,8,1], {act, seed})` with `.forward(x)`, `.predict(x)`, `.hidden(layer, j)`,
  `.lossAndGrad(X, Y, 'bce'|'mse')`, `.params()`, `.grads()`, `.count()`, `.accuracy(X,Y)`;
  `NN.optimizer('sgd'|'momentum'|'rmsprop'|'adam', {lr, beta, b1, b2, eps, wd})` → `.step(params, grads)`;
  datasets `NN.data.circle|xor|spiral|moons|blobs(n, seed, noise)` → `{X, Y}` in about [-1,1]².
* **`Widgets`** — `Widgets.playground(api, parent, {size, data, hidden, act, opt, lr, steps,
  autoplay, controls:['play','reset','step','act','hidden','lr','data','opt'], neurons, readouts,
  acts, hiddenChoices, maxEpochs})` and `Widgets.fit1d(api, parent, {w, h, f, xs, ys, n, hidden,
  act, lr, steps, controls:['play','reset','width'], noise})`,
  `Widgets.netSVG({sizes:[2,4,1], w, h, r, labels:[['x₁','x₂'],…], layerNames:['input','hidden','output'], weights:(l,i,j)=>w, fills})`
  → SVG string of a fully connected network (edges colour by weight sign if `weights` given),
  `Widgets.timer(api, parent, minutes, {auto})` → big countdown with Start/Reset,
  `Widgets.courtNet(api, parent, {w, hidden, act, lr, normalize, controls:['play','reset','norm','act','dots'], dots, n})`
  → a 2-8-8-1 MLP training live on Kobe Bryant's real shots with a probability heatmap on the court,
  `Widgets.courtFrame(left, top, w)` + `Widgets.drawCourt(ctx, frame, {color, width})` to draw an NBA half
  court in shot-log units (tenths of feet, hoop at (0,0), x∈[−250,250], y∈[−47.5,422.5]).
* **`KOBE`** — `{X: [[loc_x, loc_y], …], Y: [0/1, …]}`, 6000 of Kobe Bryant's real shots from the task's training data.
* **`UI`** — `UI.slider(parent, {label, min, max, step, value, fmt, map, oninput})`,
  `UI.button(parent, label, onclick, {kind:'primary'})`, `UI.choice(parent, items, value, onchange, {label})`,
  `UI.row(parent)`, `UI.readout(parent, label)` → `.set(html)`.
* **`Code`** — `Code.py(src, {hl, size:'s'|'l', step})` returns a highlighted `<pre>`; `Code.i('x.shape')` inline.

## Visual language (follow strictly)

* **Colours only through tokens**: in CSS use `var(--ink)`, `var(--muted)`, `var(--c0)`,
  `var(--c1)`, `var(--grad)`, `var(--ok)`, `var(--bad)`, `var(--rule)`, `var(--grid)`,
  `var(--paper)`, `var(--hi)`, `var(--c0-soft)`, `var(--c1-soft)`, `var(--grad-soft)`, `var(--code-bg)`.
  In canvas use `Plot.colors()` **inside the draw function** (so theme switches work).
  No literal hex colours anywhere in section files. Inline SVG uses `fill="var(--c0)"` style
  attributes or `style="stroke: var(--ink)"`.
* **Meaning of colours, everywhere**: `--c0` blue = class 0 / negative / "miss";
  `--c1` orange = class 1 / positive / "made"; `--grad` magenta = gradients, learning,
  the optimizer, anything that moves/updates; `--ink` = the model / structure;
  `--ok`/`--bad` only for right/wrong verdicts.
* **Minimal text**: a slide is one visual plus a few words. Headline ≤ 8 words, and
  prefer a headline that states the claim ("Stacked linear layers are still one line")
  over a topic label. Body text ≤ 15 words per slide outside code. Explanations go in
  the notes, not on the slide.
* Type classes: `h1` (title), `h2` (slide headline, 68px), `h3`, `.big` (104px statement),
  `.huge` (220px), `.lead` (48px), `.small` (30px), `.tiny` (24px muted, the smallest allowed),
  `.kicker` (mono eyebrow), `.muted`, `.c0 .c1 .grad .ok .bad`, `mark`. Minimum on-slide
  font size is 24px (canvas labels ≥ 20px).
* Maths without a library: `<span class="m"><i>w</i><sub>1</sub><i>x</i><sub>1</sub> + <i>b</i></span>`
  inline, or a display line `<p class="eq">…</p>`. `.frac` for fractions:
  `<span class="frac"><span>1</span><span>N</span></span>`.
* Layout helpers: `.row`, `.col`, `.split` (+ `.split-37/46/64/73`), `.grow`, `.center`,
  `.fill-center`, `.stack`, `.bottom`, `.panel` (use sparingly), `.callout`, `.tbl`.
* Activity markers (text, no icons): `<span class="tag tag-predict">predict</span>`,
  `tag-try` (try it live), `tag-paper` (on paper), `tag-code` (live coding), `tag-pair`
  (pair discussion), `tag-warn` (pitfall).
* Canvas sizes are in stage pixels; typical big plot 700–860px square. Use
  `Plot.canvas` (never raw canvas) so it is crisp when projected.
* Animations: purposeful only; loops must be cheap (≤ ~4 ms/frame). Respect the
  slide lifecycle (use `api.loop`). Animated demos should start in a meaningful,
  readable state (draw once in `init`), never an empty box.
* Controls: buttons say exactly what they do ("Train", "Reset", "Step"). Sliders
  show their value. Keep controls large (they are styled already).
* Do not use emoji. Do not put borders/shadows on everything. Left-align by default.

## Speaker notes format

Notes are what the coach reads on the presenter screen (key P) — they must let a
coach who has never taught this deliver it confidently. Use these paragraph classes:

* `<p class="time">2 min</p>` — how long to spend.
* `<p class="say">…</p>` — what to say, in plain spoken sentences (2–5 sentences).
* `<p class="do">…</p>` — what to click/draw/demo, step by step.
* `<p class="ask">…</p>` then `<p class="ans">…</p>` — a question for the class and its answer.
* plain `<p>` or `<ul>` for background the coach should know (why it is true, common
  student mistakes, a fun fact).

## Testing

Build only your section into your own file (other agents build in parallel, so never
write `lecture.html` yourself), then screenshot it:
```
python3 tools/build.py --only 03-activations.js --out build/s03/deck.html
NODE_PATH=$(npm root -g) node tools/shoot.js build/s03/shots --file build/s03/deck.html [--from A --to B] [--steps] [--train 2500] [--theme dark]
python3 tools/sheet.py build/s03/sheet.png build/s03/shots/0*.png --cols 3 --width 640   # contact sheet
```
`--steps` shoots every build step, `--train N` clicks the first Train button and waits N ms.
Look at the PNGs (Read tool). Fix every OVERFLOW line in `report.txt` and every console error.
