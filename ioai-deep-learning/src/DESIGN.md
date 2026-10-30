# IOAI Neural Networks deck: design review and spec

Scope: engine at `ioai-deep-learning/src` (engine.css, CONTRACT.md, lib/*.js) and the five test shots in `build/shots/`.
Numbers below come from `scratchpad/research/colors.py` and `search.py`: WCAG 2.x contrast, CVD simulation with Machado et al. 2009 at severity 1.0 via `colorspacious`, and distances in CAM02-UCS (ΔE under about 10 is confusable, over 20 is clearly distinct).

---

## 0. Verdict in one paragraph

The identity works and is not generic: graph paper, expanded heavy Archivo, Atkinson body text, mono readouts and the strict blue/orange/magenta semantics. Keep all of it. The problems come from projection. Orange text fails contrast (3.0:1). The code highlight is invisible on a projector (1.01:1 against the code background). The dimmed code lines are too faint (2.0:1). Several labels sit below a legible size (20–24px). Court dots are 3px with no outline. Magenta is spent on chrome (progress bar, slider thumbs, timer), so it stops meaning "gradient". The syntax highlighter uses blue, orange and pink, which collide with the class and gradient colours. Content edges don't sit on the 48px grid. The fixes are token-level and rule-level, not a redesign.

---

## 1. Research distilled into rules we adopt

| Source | What we take | Rule in this deck |
|---|---|---|
| Alley, assertion–evidence | Sentence headline (≤ 2 lines, left-aligned) plus visual evidence. No bullets. | `h2` is a claim, ≤ 8 words, one line preferred. |
| Mayer, multimedia principles | Coherence (cut extras), signalling (cue the structure), spatial contiguity (labels on the figure), temporal contiguity (words with picture), segmenting (learner-paced chunks), pre-training (names first), redundancy (no narration duplicated as on-screen text). | Labels go directly on the figure with no legends. Builds are ≤ 5 steps and presenter-paced. The notes carry the prose. Each section opens by naming its 2–3 terms. |
| Tufte | Data-ink, smallest effective difference, direct labelling, small multiples. On projection: "figure/ground contrast must overcome ambient light"; test in the room; prefer a light tint over pure white. | No boxes around things that aren't objects. Grid as faint as possible. Small multiples for A/B comparisons on identical scales. Paper stays `#fbfbf8`, not white. |
| 3Blue1Brown | A colour is the identity of a quantity for the whole video. Objects transform in place. Focus by dimming everything else. Equations coloured term-by-term to match the picture. | `--c0/--c1/--grad` never change meaning. A figure persists across slides at the same position. Focus is shown by dimming to .35, never with boxes or glow. |
| Bret Victor, Nicky Case, Seeing Theory, distill | Explorable explanations: the reader manipulates the model. Victor's critique: dropping someone in a sandbox with "figure it out" is not an explanation. Common pattern: guided tour, then a sandbox at the end. | Demos start in a meaningful, paused state. The presenter drives a scripted path (predict, then run, then explain), and the sandbox comes after. Each control sits next to what it changes. |
| reveal.js conventions | Fragments, speaker view (current + next + timer + notes), overview (O), black screen (B/.), chalkboard/pen, auto-animate. | Already present: steps, N, P, O, B, L, C. Add pen (D), whiteboard (W), zoom (Z), freeze loops (M), and a next-*step* preview in the presenter view. |
| 8H rule and visual angle | Smallest text ≥ 1/50 of screen height is the absolute floor. Comfortable reading is 1.5–2× that. ISO-style comfortable character height is 16–22 arcmin. | See the type floor in §2.2. |
| Projector folklore, checked numerically | Lit rooms add a veil of ambient light. Light backgrounds survive it better. Thin fonts and hairlines fade. | Light theme is the default for classrooms. Weights ≥ 400. Meaning-bearing strokes ≥ 3px. |

---

## 2. Projector constraints, quantified

### 2.1 Assume the worst projector
* Many schools still have **1280×800 (WXGA)** projectors, where the 1920×1080 stage scales by 0.667. A 1px stage line becomes 0.67 device px and anti-aliases to grey. **Any stroke that carries meaning must be ≥ 3px; hairlines ≥ 2px.** The paper grid at 1px may vanish, which is fine.
* **Lit room.** I modelled ambient light as a veil of 15% of white added to both colours. Ink on paper drops from 16.5:1 to 5.5:1. The current orange drops to 2.4:1. Muted grey drops to 3.5:1.
* **Flat classroom.** Heads block the bottom ~15% of the screen. Nothing students must read goes below y ≈ 900. Controls (which only the presenter needs) may live low.
* **Dark theme in a lit room** loses more. Its colours fall to 2.1–3.1:1 against paper that turns grey because the projector's black is the room light. Use dark only in dimmed rooms. `T` already cycles themes.

### 2.2 Type size floor (stage px on 1080 height; cap height ≈ 0.70 em)
The table gives the visual acuity needed to *resolve* the cap height from the back row. For comparison, 20/40 is the driving standard.

| font px | at 6H | at 8H | use |
|---|---|---|---|
| 24 | 20/36 | 20/27 | credits only |
| 28 | 20/42 | 20/31 | **floor**: labels, ticks, kicker, tags, readout labels |
| 32 | 20/48 | 20/36 | small text, layer names |
| 40 | 20/59 | 20/45 | body |
| 48 | 20/71 | 20/53 | lead, quiz options |
| 68 | 20/101 | 20/76 | headline (comfortable reading at 8H needs about 57px+) |

Decisions: **floor 28px** for anything on the stage (canvas labels included), 24px only for attributions. Body 40. Anything the room must *read* rather than glance at should be ≥ 48.

### 2.3 Colour: measured
On paper `#fbfbf8`, WCAG ratio / lit-room ratio:

| token | current | ratio | proposed | ratio |
|---|---|---|---|---|
| `--c0` | `#2a64c8` | 5.39 / 3.44 | `#2266d0` | 5.22 / 3.38 |
| `--c1` | `#e2731b` | **3.02** / 2.40 | `#c85400` | 4.29 / 3.01 |
| `--grad` | `#c22a73` | 5.23 / 3.38 | `#a8145f` | 6.91 / 3.92 |
| `--muted` | `#5d6679` | 5.56 / 3.50 | `#4f586b` | 6.89 / 3.91 |
| `--ok` | `#1f8a5b` | 4.18 / 2.96 | `#16794f` | 5.22 / 3.38 |
| `--bad` | `#c0392b` | 5.25 / 3.39 | `#b8261a` | 6.08 / 3.67 |
| `--hi` vs `--code-bg` | `#fff1b8` | **1.01** | `#ffe27a` + 8px ink bar | 1.14 (the bar carries it) |
| paper grid | `#e4e7ed` | 1.19 | `#eaedf2` (new `--paper-grid`) | 1.13 |

CVD distances, CAM02-UCS ΔE (normal / deuteranopia / protanopia / tritanopia):

| pair | current | proposed |
|---|---|---|
| c0–c1 | 65 / 63 / 57 / 59 | 64 / 60 / 55 / 59 |
| **c0–grad** | 51 / 34 / **18** / 60 | 52 / 35 / **25** / 60 |
| c1–grad | 34 / 31 / 45 / 16 | 31 / 28 / 41 / 13 |
| ok–bad | 52 / **13** / **17** / 62 | 53 / **16** / **16** / 60 |
| c1–bad | 21 / 17 / 22 / 17 | 15 / **10** / 14 / 9 |

What the numbers say:
* **Blue vs orange is excellent** for every CVD type. Keep the pair.
* **Blue vs magenta is the weak pair for protans.** The current magenta simulates to slate blue `#4c5875` at nearly the same lightness as c0 (L* 45 vs 44). The fix is a lightness gap: the proposed magenta is darker (L* 37 vs 45), which raises protan ΔE from 18 to 25. A free optimiser preferred an even darker wine (`#873152`, min ΔE 30) but loses the magenta identity, so I didn't take it. Dark theme: `#ff5fa6` becomes `#f0448f` (L* 57 vs blue 68), protan ΔE 17 → 25.
* **ok/bad and orange/red can't be fixed by colour.** That needs redundant coding (§5.4).
* Gradient vs ink for protans is 18. Add redundancy: gradient arrows are **dashed with open chevron heads**.

---

## 3. Review of the current screens

**What works**
* Archivo 800 at stretch 112% for titles is distinctive, and the headlines are already claims ("A tiny network learns a circle").
* The playground's **hidden-unit thumbnails form a small multiple**. That is the single best visual idea in the engine.
* Mono, tabular readouts at 44px. The **"ALWAYS 'MISS' 54.6%" baseline** next to accuracy is excellent pedagogy.
* Big, literal controls ("Pause", "Reset", "8 neurons") with ink-filled selected state.
* `loopSVG` already uses the right grammar: forward in ink, backward in magenta.
* Section-segmented progress bar. Presenter window with pacing. Offline build with fonts embedded.

**What to change**
1. **001 (title)**: the five activity tags use five colours, two of which are class colours. Tags become ink only. *Re-shoot 001–002, which were captured with the help overlay open.*
2. **002 (playground)**: readout labels are 20px (below the deck's own floor), so raise them to 28. The loss sparkline is a 3px magenta line with no anchor, so add an end-value label in 28px mono. Axes on the neuron thumbnails are fine without labels.
3. **003 (code)**:
   * Dimmed lines at opacity .32 give 2.0:1, so raise to .5 (3.25:1).
   * The highlight `#fff1b8` is 1.01:1 against the code background and will vanish, so add an 8px ink left bar.
   * The rainbow syntax theme collides with the semantics: blue `t-fn` reads as class 0, orange `t-num` as class 1, pink `t-self` as gradient. Switch to **monochrome syntax** (weight and italic only) and allow semantic spans (`.grad` on `loss.backward()`).
   * The code box spans 1712px for 5 short lines, leaving 45% of the slide empty. Use template T6, which puts the effect of each line on the right.
4. **004 (fit1d)**:
   * Targets are drawn in c0 blue but they are not class 0. Make them hollow ink dots and draw the model curve in ink at 5px. Magenta is only for what learning moves (residual arrows, loss).
   * The canvas paints an opaque paper rectangle that cuts the grid off-module. Use a transparent canvas or a `.plain` slide.
   * Tick labels go from 22 to 28.
   * The right half is empty, so move the controls into it.
5. **005 (court)**:
   * No headline. Add one.
   * The code draws 1500 dots at r 3.2 and alpha .55 (about 2 device px on WXGA), with no outline and the same hue as the heat underneath, so they disappear. Use r 6 at full alpha with a 2px paper stroke, show ≤ 800 subsampled shots, and drop heat strength from .75 to .5.
   * The court should use the full 768px height.
6. **Global**:
   * Margins of 84/104 are off the 48px module. Use 96/96/72 with `background-position: 0 0`, so the left edge, canvas edges and columns land on grid lines.
   * Magenta is spent on chrome: progress bar, slider thumbs, `timer.is-done`, help keys. Chrome goes to ink, and magenta is kept for gradients.
   * `.panel`, `pre.code` and `.tag` use 6–10px radii. Cap radii at 4px; drafting paper has square corners.

---

## 4. Layout system

* Stage 1920×1080. Paper grid 48px means 40 columns by 22.5 rows; the half row is hidden under the progress bar.
* **Safe frame**: x 96–1824, y 96–1008. That is 1728×912 = 36×19 cells, inside the 5% title-safe area for overscanning projectors.
* **Bands**: headline y 96–192 (2 cells). Gap of 1 cell. **Content y 240–1008 (768 = 16 cells).**
* **12 columns** of 144px (3 cells each), with no intrinsic gutters. Gutters are 48 or 96.
* **Canonical splits**, all on the module:
  * Square visual plus side column: visual **768×768 at (96,240)**, side x 960–1824 (864).
  * Halves: **816 + 96 + 816** (x 96–912 and 1008–1824).
  * Code plus effect: code x 96–1152 (1056), effect x 1248–1824 (576).
  * Full-bleed figure: 1728×768.

### Type scale (stage px)
| role | class | size / weight | notes |
|---|---|---|---|
| giant number or word | `.huge` | 220 / 800, stretch 115% | section numbers, one stat |
| title | `h1` | 132 / 800, stretch 112% | ≤ 2 lines |
| statement | `.big` | 104 / 800, stretch 110% | predict question, takeaway |
| headline | `h2` | 68 / 750, stretch 108% | claim, ≤ 8 words, 1 line ≈ 44 chars |
| sub-head | `h3` | 44 / 700 | panel titles in comparisons |
| lead | `.lead` | 48 | quiz options, short captions |
| body | — | 40 | |
| small | `.small` | **32** (was 30) | |
| label | `.tiny`, `.kicker`, `.tag`, readout labels, ticks, SVG labels | **28** (was 20–24) | the floor |
| maths | `.eq` 64, `.m` 1.12em | STIX italic | |
| code | `pre.code` 34 (`-s` 28 is the floor, `-l` 40) | JetBrains, ligatures off | ≤ 12 lines, ≤ 50 chars |

### Line weights (stage px)
* Paper grid: 1.
* Plot grid: 1.5, `--grid`.
* Axes: 2.5, `--muted`.
* Rules: 2, `--rule`.
* Decision boundary: 4, ink.
* Model function or curve: 5, ink.
* Reference or target curve: 3, `--muted`, dashed 12/10.
* Data-flow arrow: 5, ink. Gradient arrow: 5, `--grad`, dashed 14/10.
* Neuron stroke: 3.5. Layer box: 3.
* Weight lines: 2 to 12 px, proportional to |w|.

### Canvas
* Points: r 7–8, or r 6 when there are more than 400. Always a 2px `--paper` stroke. Show no more than ~800 points (subsample for display).
* Heat strength ≤ .55 under points.
* Labels ≥ 28px.
* Canvas sizes are multiples of 48 (720, 768, 816, 864).
* Canvases are transparent, never filled with paper.

### Controls
* Heights ≥ 64px; labels 30px bold.
* One primary action (ink-filled), placed first.
* Slider thumb: ink with a paper ring (not magenta).
* Readouts sit high (top of the side column). Controls sit low (bottom of the side column), because readouts are for the room and controls are for the presenter.

---

## 5. Templates (12)

Every template keeps the headline at y 96 (except T1, T2, T11 and T12). Positions are x, y, w, h on the stage. HTML uses existing engine classes plus the new classes listed in §8.

### T1 Title
* Kicker at (96,96), 28 mono.
* `h1` at (96,240), w 1152, 132/800, ≤ 2 lines.
* `.lead.muted` at (96,~600), w 1056.
* Signature figure on the right: (1248,240,576,576), a 2-8-8-1 `netSVG` in ink with one magenta backward path (dashed).
* Footer `.tiny` at (96,960): date and coach.
* The grid stays on.
```html
<div class="kicker">IOAI training · day 4</div>
<div class="t-title"><div><h1>Neural networks, hands-on</h1><p class="lead muted">From straight lines to any function.</p></div><div class="t-fig">${Widgets.netSVG({sizes:[2,8,8,1],w:576,h:576})}</div></div>
```

### T2 Section divider with time budget
* `.huge` section number at (96,96), mono, `--muted`.
* `h1` title at (96,384).
* **Budget bar** at (96,864,1728,24): one segment per section, width ∝ minutes (180 min gives 9.6 px/min), 6px gaps. Past sections are `--muted`, the current one is `--ink`, future ones are `--rule` outline only.
* Under the bar, in 28px mono: current section "25 min · 0:40–1:05" left-aligned under its own segment.
* No other text.
```html
<div class="huge mono muted">03</div><h1>Activations</h1>
<div class="budget bottom"><i style="--m:20" class="past"></i><i style="--m:25" class="past"></i><i style="--m:25" class="now"></i>…</div>
<div class="tiny mono">25 min · 0:40–1:05</div>
```
`.budget{display:flex;gap:6px;height:24px}.budget i{flex:var(--m);border:2px solid var(--rule)}.budget .past{background:var(--muted);border-color:var(--muted)}.budget .now{background:var(--ink);border-color:var(--ink)}`. The engine can generate this from `Deck.sections`, so add `Deck.budgetHTML(sectionId)`.

### T3 Big question / predict
* `tag` PREDICT at (96,96).
* `.big` question at (96,192), w 1536, ≤ 2 lines.
* Options at y 576–960 as three 528×384 figures at x 96 / 696 / 1296, with gutters of 72 between them. Each has a **numeral 1–3** (56px mono, so students can vote with fingers) above it.
* Step 1 ("vote"): the notes say *hands up*.
* Step 2: the right answer gets a 6px `--ok` frame plus "✓ 2" in text. The others dim to .3.
* Text-only variant: options in a row at 48px.

### T4 One big visual + three-word caption
* `h2` caption (2–5 words) at (96,96).
* Visual at (96,240,1728,768), or a centred 768 square.
* Nothing else on the slide. Grid on (or `.plain` if the visual is dense).

### T5 Visual + caption, left/right
* Visual 768² at (96,240).
* Side column (960,240,864,768) holds ≤ 3 labels at 40–48px. Each one connects to the figure with a 2px `--muted` leader line, or (preferred) repeats a colour chip from the figure.
* Mirror the layout with `.flip` (visual on the right) to alternate rhythm; never mirror twice in a row.

### T6 Code with a line-by-line build
* `h2` at (96,96).
* Code at (96,240,1056,≤768), 34px. At ≤ 12 lines, ≤ 50 characters each.
* Effect column (1248,240,576,768). It shows what the highlighted line does: a tensor-shape block (§6.4), a mini plot, or `.eq`. Swap the content per step with `.stack > [data-only]`.
* Step k highlights line(s) k. Other lines stay at .5, so they are still readable.
```js
html: `<h2>One training step, five lines</h2><div class="t-code">${Code.py(src,{hl:'1:2 2:3 3:4 4:5 5:6'})}
<div class="stack t-effect"><div data-only="1">${shapeSVG('(32,2)@(2,8)')}</div><div data-only="2">…</div></div></div>`
```

### T7 Compare two (before/after, A vs B)
* `h2` (the verdict, e.g. "Adam reaches the bottom first") at (96,96).
* Two panels at (96,240,816,672) and (1008,240,816,672). Each has an `h3` label above (44px). Class colours are not allowed in the labels; use ink.
* **Identical scales, axes and positions.** Only the variable changes.
* Optional delta line at (96,960), 32px: "loss 0.41 → 0.07".
* If the difference is subtle, show the same panel twice with step 1 "A" and step 2 overlaying "B" in the same frame.

### T8 Live demo with controls
* `h2` at (96,96).
* Canvas 768² at (96,240).
* Side column (960,240,864,768):
  * Readouts row at the top (y 240, values 44px, labels 28).
  * Loss curve 864×240 at y 360, magenta, with end label.
  * Controls stacked at the bottom (y ≥ 720): primary button, then choices, then sliders.
* Starts **paused in a meaningful state**. The presenter path is predict, run, explain, then sandbox.

### T9 Quiz with reveal
* `h2` question at (96,96).
* 2×2 options at (96,240), (1008,240), (96,624), (1008,624), each 816×336. Inside each: a numeral 1–4 at 56px mono in a 72px square with a 3px ink outline, and the content at 48px (text) or a figure 288px high.
* Step 1: correct option gets the `--ok` frame and "✓", wrong options dim to .3.
* Step 2: one "why" line at (96,968) in 32px, or say it out loud and keep it in the notes.

### T10 Exercise with countdown
* `tag` (ON PAPER / CODE / PAIRS) at (96,96).
* `h2` task (≤ 8 words) at (96,168).
* Left (96,288,1056,720): ≤ 3 numbered lines at 40px, or a figure.
* Right (1248,288,576,720):
  * `Widgets.timer` face at 200px mono.
  * Start/Reset below it.
  * "done when…" in 32px `--muted`.
* At 0:00 the face inverts (paper text on an ink block). No sound and no flashing.

### T11 Key takeaway
* Kicker "takeaway" at (96,96).
* `.big` statement at (96,360), w 1536, ≤ 12 words, one `<mark>` on the key term.
* Optional glyph-sized reminder of the evidence (240² thumbnail of the slide's figure) at (1584,720).
* `.plain` paper, so the statement stands alone.

### T12 The whole lecture in one picture
* Full-bleed (96,96,1728,912) training-loop map: data → model → loss → gradients → update, using `loopSVG`.
* Each section is pinned as a numbered circle (r 28, ink stroke) on the part of the loop it explains: activations on *model*, losses on *loss*, optimisers on *update*, debugging on all the arrows.
* Re-show it at every section boundary with the current part at full ink and the rest dimmed to .3. This is the "you are here" anchor and also the final recap slide.

---

## 6. Diagram vocabulary (inline SVG)

### 6.1 Shared defs (inject once per document; marker ids are global)
```html
<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
  <marker id="ah-ink" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="5" markerHeight="5"
          markerUnits="strokeWidth" orient="auto-start-reverse">
    <path d="M0,0 L12,6 L0,12 z" style="fill:var(--ink)"/></marker>
  <marker id="ah-grad" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="5" markerHeight="5"
          markerUnits="strokeWidth" orient="auto-start-reverse">
    <path d="M1,1 L11,6 L1,11" style="fill:none;stroke:var(--grad);stroke-width:2.2;stroke-linejoin:round"/></marker>
</defs></svg>
```

### 6.2 Classes (add to engine.css)
```css
.dg text { dominant-baseline: central; }
.dg .nrn  { fill: var(--paper); stroke: var(--ink); stroke-width: 3.5; }
.dg .nrn.in   { fill: var(--code-bg); }               /* inputs */
.dg .nrn.out  { stroke-width: 5; }                     /* output */
.dg .w     { stroke-linecap: round; stroke-opacity: .85; }
.dg .w.pos { stroke: var(--c1); }  .dg .w.neg { stroke: var(--c0); }
.dg .w.off { stroke: var(--rule); stroke-dasharray: 2 8; } /* dead / zero */
.dg .box   { fill: var(--paper); stroke: var(--ink); stroke-width: 3; }
.dg .box.act { fill: var(--code-bg); }
.dg .flow  { fill: none; stroke: var(--ink);  stroke-width: 5; marker-end: url(#ah-ink); }
.dg .back  { fill: none; stroke: var(--grad); stroke-width: 5; stroke-dasharray: 14 10; marker-end: url(#ah-grad); }
.dg .lbl   { font: 600 30px var(--font-mono); fill: var(--ink); text-anchor: middle; }
.dg .lbl-s { font: 500 28px var(--font-mono); fill: var(--muted); text-anchor: middle; }
.dg .lbl-m { font: italic 36px var(--font-math); fill: var(--ink); text-anchor: middle; }
.dg .lbl-g { font: italic 36px var(--font-math); fill: var(--grad); }
.dg .t-data  { fill: var(--code-bg);  stroke: var(--ink); stroke-width: 3; }
.dg .t-param { fill: var(--grad-soft); stroke: var(--ink); stroke-width: 3; }
.dg .t-gradt { fill: none; stroke: var(--grad); stroke-width: 4; stroke-dasharray: 12 8; }
.dg .t-shared { stroke: var(--ink); stroke-width: 7; }
.dg .t-clash  { stroke: var(--bad); stroke-width: 7; }
```
(Attribute-only fallback, if the contract keeps "attributes only": `fill="var(--paper)" stroke="var(--ink)" stroke-width="3.5"`.)

### 6.3 Neurons and weights
* Neuron radius: **28** (≤ 8 per layer), **20** (≤ 16 per layer), **40** for single-neuron anatomy. Inside the circle the label is a math italic variable (`x₁`, `h₃`, `ŷ`) at 1.05 r.
* Bias: a 20px square with the same stroke.
* Weight width is `2 + 10·min(1, |w|/w_ref)`. Sign by colour: **orange +, blue −**. This is allowed because the deck defines c0/c1 as the negative/positive diverging pair. Show a "+ / −" chip the first time.
* Weights with |w| < .05 are drawn `.off`. Edges are drawn before nodes.
```html
<svg class="dg" viewBox="0 0 480 288" width="480" height="288" role="img" aria-label="one neuron">
  <line class="w pos" x1="72" y1="72"  x2="360" y2="144" style="stroke-width:10"/>
  <line class="w neg" x1="72" y1="216" x2="360" y2="144" style="stroke-width:4"/>
  <circle class="nrn in" cx="72" cy="72" r="28"/><text class="lbl-m" x="72" y="72"><tspan>x</tspan><tspan font-size="24" dy="8">1</tspan></text>
  <circle class="nrn in" cx="72" cy="216" r="28"/><text class="lbl-m" x="72" y="216">x₂</text>
  <circle class="nrn out" cx="360" cy="144" r="40"/>
  <path d="M340,156 L360,156 L380,128" fill="none" style="stroke:var(--ink);stroke-width:4"/> <!-- ReLU glyph -->
  <text class="lbl-s" x="216" y="72">w₁ = +0.9</text>
</svg>
```

### 6.4 Tensor-shape blocks (matmul as rectangles)
* Scale: **1 feature = 24px**. The batch axis is drawn at a fixed 192px with a wavy break mark, since it stands for "N".
* Rows are vertical (batch), columns horizontal (features).
* Data tensors use `.t-data`; parameters `.t-param` (magenta tint, because learning moves them); a gradient is the **same rectangle dashed in magenta** (`.t-gradt`), which shows that `W.grad.shape == W.shape`.
* Use the **Falk layout**: X left of Y, W above Y. The contracted dimension then lines up physically, and those edges are drawn `.t-shared`. For a shape bug, draw them `.t-clash` with "2 ≠ 3".
```html
<svg class="dg" viewBox="0 0 528 480" width="528" height="480" role="img" aria-label="(32,2) @ (2,8) gives (32,8)">
  <rect class="t-param" x="168" y="72"  width="192" height="48"/>  <!-- W (2,8)  -->
  <rect class="t-data"  x="96"  y="144" width="48"  height="192"/> <!-- X (32,2) -->
  <rect class="t-data"  x="168" y="144" width="192" height="192"/> <!-- Y (32,8) -->
  <line class="t-shared" x1="96" y1="340" x2="144" y2="340"/>     <!-- X width = 2 -->
  <line class="t-shared" x1="364" y1="72" x2="364" y2="120"/>     <!-- W height = 2 -->
  <text class="lbl" x="264" y="40">W (2, 8)</text>
  <text class="lbl" x="120" y="384">X</text><text class="lbl-s" x="120" y="420">(32, 2)</text>
  <text class="lbl" x="264" y="384">Y = X @ W</text><text class="lbl-s" x="264" y="420">(32, 8)</text>
</svg>
```
Inline variant for code slides: `[X 48×192] @ [W 48×192 rotated] → [Y 192×192]`, with the operators in 56px STIX and the blocks bottom-aligned.

### 6.5 Layers and flow
* A layer box is 96px high. Width is the label width plus 48. `Linear 2→8` in 30px mono. The activation box `ReLU` uses `.box.act` and contains its 32px glyph.
* Forward lane: `.flow` arrows on the centre line.
* Backward lane: `.back` arrows 36px below, pointing the other way, labelled with `.lbl-g` (`∂L/∂W`).
* Never put both directions on one line.

### 6.6 Labelling rules
* Label directly beside the mark, with no legends.
* Variables in STIX italic 36px; code names and shapes in 30px mono; the floor is 28.
* Never rotate text. Put the y-axis name horizontally at the top of the axis.
* Leader lines: 2px `--muted`, only when the label can't touch the mark.

---

## 7. Animation and build rules

1. **One new thing per step, ≤ 5 steps per slide** (segmenting). If you need more, the slide is two slides.
2. **Presenter-paced only.** Nothing auto-advances. Demos start paused but already drawn (never an empty box); autoplay is only for ambient loops that carry no content.
3. **Reveal order equals reading order**: top-left to bottom-right, and claim before evidence only when you are not asking for a prediction.
4. **Timing**: element fade 300ms ease-out with ≤ 14px rise (as now). Slide change 150–250ms crossfade, with no other transitions. State changes inside demos (morphs, a boundary moving to a new setting) take 400–600ms. Never animate letters.
5. **Focus by dimming**: previous steps go to .35 (`dim-after`) and code context to .5. Never use pulsing or glow. A single 600ms `--hi` background flash is allowed on a number that just changed.
6. **Motion has meaning**: magenta moves only for learning (update arrows, a loss curve drawing, weights changing thickness). Data and model geometry move in ink.
7. **Continuity**: when consecutive slides share a figure, it stays at identical coordinates. The cut then reads as a change in place, like 3b1b's transforms, with no auto-animate needed.
8. **Training speed**: tune steps per frame so the interesting phase lasts 5–10 seconds, so the presenter can narrate it. Loops cost ≤ 4ms per frame.
9. **Reduced motion and freeze**: honour `prefers-reduced-motion`. Add key **M** to freeze all `api.loop`s, so the presenter can stop and point.

---

## 8. Engine UX additions (priority order)
1. **Pen (D)**: draw over the stage in 6px ink. Clears on slide change, Shift+D keeps it. This is reveal's chalkboard; maths teaching needs it.
2. **Whiteboard (W)**: an empty graph-paper slide over the current one. The grid is the whiteboard.
3. **Zoom (Z or Alt-click)**: 2× around the pointer, for code and dense plots.
4. **Freeze (M)**: pause every loop.
5. **Presenter view**: preview of the next *step* (not just the next title), the section budget bar, and elapsed time against budget (`deck-notes-pace` exists; make it the biggest thing on the panel).
6. **Help overlay**: 18px minimum (it is 15). Never auto-open on the projector.
7. **Corner counter** (12px): hide on the projector window; show it in the presenter view only.

---

## 9. CSS diff (engine.css)

```diff
 :root {
-  --muted: #5d6679;
-  --rule: #c9ced8;
+  --muted: #4f586b;         /* 6.9:1, lit room 3.9 */
+  --rule: #b9c0cc;          /* survives a 0.67x downscale */
   --grid: #e4e7ed;          /* plot grid */
-  --c0: #2a64c8;
-  --c1: #e2731b;
-  --grad: #c22a73;
-  --ok: #1f8a5b;
-  --bad: #c0392b;
-  --hi: #fff1b8;
-  --c0-soft: #dfe8f7;
-  --c1-soft: #fbe6d4;
-  --grad-soft: #f6dce8;
+  --paper-grid: #eaedf2;    /* 1.13:1, paper only */
+  --c0: #2266d0;            /* 5.2:1, L*45 */
+  --c1: #c85400;            /* 4.3:1 (was 3.0) */
+  --grad: #a8145f;          /* 6.9:1, L*37: lightness gap to c0 for protans */
+  --ok: #16794f;
+  --bad: #b8261a;
+  --hi: #ffe27a;
+  --c0-soft: #d8e3f2;  --c1-soft: #f3e0d0;  --grad-soft: #eed6e0;
 }
 /* dark (both blocks) */
-  --muted: #9aa4b8; --rule: #323b51; --c0: #5b97ff; --c1: #ff9d4a; --grad: #ff5fa6;
-  --ok: #43c08a; --bad: #ff6b5e; --hi: #4a4120;
+  --muted: #a7b0c2; --rule: #3a445c; --paper-grid: #181f2f;
+  --c0: #6aa6ff; --c1: #ff9a3d; --grad: #f0448f;   /* L* 68 / 73 / 57 */
+  --ok: #4cc795; --bad: #ff7366; --hi: #5a4a12;
+  --c0-soft: #253655; --c1-soft: #46342a; --grad-soft: #43213c;

 .slide {
-  padding: 84px 104px 80px;
+  padding: 96px 96px 72px;              /* edges on the 48px module */
-    linear-gradient(var(--grid) 1px, transparent 1px),
-    linear-gradient(90deg, var(--grid) 1px, transparent 1px);
-  background-position: -1px -1px;
+    linear-gradient(var(--paper-grid) 1px, transparent 1px),
+    linear-gradient(90deg, var(--paper-grid) 1px, transparent 1px);
+  background-position: 0 0;
-  gap: 32px;
+  gap: 48px;
 }
-.kicker { font-size: 24px; letter-spacing: .14em; }
+.kicker { font-size: 28px; letter-spacing: .1em; }
-.small { font-size: 30px; }
-.tiny { font-size: 24px; }
+.small { font-size: 32px; }
+.tiny { font-size: 28px; }
-.tag { font-size: 24px; border: 2.5px solid currentColor; border-radius: 6px; }
-.tag-predict { color: var(--grad); } .tag-try { color: var(--c0); } .tag-paper { color: var(--c1); } .tag-pair { color: var(--ok); }
+.tag { font-size: 28px; border: 3px solid var(--ink); border-radius: 0; color: var(--ink); }
+.tag-predict, .tag-try, .tag-paper, .tag-code, .tag-pair { color: var(--ink); }
-.panel { border-radius: 10px; }
+.panel { border-radius: 4px; }
-pre.code { border-radius: 10px; border: 2px solid var(--rule); }
+pre.code { border-radius: 0; border: 0; border-left: 6px solid var(--ink); }
-pre.code.has-hl .ln { opacity: .32; }
-pre.code.has-hl .ln.hl { opacity: 1; background: var(--hi); }
+pre.code.has-hl .ln { opacity: .5; }
+pre.code.has-hl .ln.hl { opacity: 1; background: var(--hi); box-shadow: inset 8px 0 0 var(--ink); }
-.t-kw { color: #8b2fc9; font-weight: 600; } .t-str { color: #1d7a45; } .t-num { color: #b44f0c; }
-.t-fn { color: #1d5fbf; } .t-bi { color: #0f7a8a; } .t-self { color: #a33b67; } .t-dec { color: #8b2fc9; }
+.t-kw, .t-dec { color: var(--ink); font-weight: 700; }
+.t-str { color: var(--muted); } .t-num, .t-fn, .t-bi, .t-attr { color: var(--ink); }
+.t-self { color: var(--ink); font-style: italic; }
+/* delete the dark-theme .t-* overrides; colour code semantically with .c0 .c1 .grad spans */
-.ui-slider input[type=range]::-webkit-slider-thumb { background: var(--grad); box-shadow: 0 0 0 2px var(--grad); }
+.ui-slider input[type=range]::-webkit-slider-thumb { background: var(--ink); box-shadow: 0 0 0 2px var(--ink); }
+/* same for ::-moz-range-thumb */
-.ui-readout-label { font-size: 20px; }
+.ui-readout-label { font-size: 28px; }
-.deck-bar-seg.is-current .deck-bar-fill { background: var(--grad); }
+.deck-bar-seg.is-current .deck-bar-fill { background: var(--ink); }
-.timer.is-done .timer-face { color: var(--grad); }
+.timer.is-done .timer-face { color: var(--paper); background: var(--ink); padding: 0 24px; }
-.deck-help-card dl { font-size: 15px; }
+.deck-help-card dl { font-size: 18px; }
```

plot.js and widgets.js defaults:
* `axes` font 22 → 28.
* `points` r 7 is fine; `courtNet` dots go to r 6 with the paper stroke, at most 800 shown, heat strength .75 → .5.
* `fit1d` targets become hollow ink, the model curve ink at 5px.
* `netSVG` layer names 22 → 28; weight width `2 + 10|w|`.
* `loopSVG` backward arrows dashed 14/10 with the open chevron head.
