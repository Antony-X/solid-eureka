# Neural networks, hands-on — IOAI training day

A 3-hour visual lecture that moves an olympiad team from classical ML into deep learning
(MLPs, activations, losses, optimizers, the PyTorch training loop, debugging), followed by
two practical tasks: **Kobe** (shot prediction with a tiny legal MLP) and **Inversion**
(recover a missing input of a frozen model).

## What is here

| File | What it is |
|---|---|
| `lecture.html` | The slide deck. One self-contained file: open it in Chrome or Edge, works offline. All demos run live in the browser. |
| `SCRIPT.md` | The teacher's script: slide-by-slide what to say, what to click, questions and answers, timings. Generated from the deck's speaker notes. |
| `COACH_GUIDE.md` | Background for the coach: setup, the plan, how to teach each topic, the two tasks with hint ladders, Q&A cheat-sheet, stories. Read this first. |
| `notebooks/01_live_coding.ipynb` | The notebook you type and run live during the second half (with planned mistakes). |
| `notebooks/02_kobe_starter.ipynb` | Task 1 starter for students (rules checker and submission writer included). |
| `notebooks/03_inversion_starter.ipynb` | Task 2 starter for students (with a practice replica and self-scoring). |
| `solutions/` | Reference solutions for the coach. Don't hand these out. |
| `data/kobe/data_train.csv` | The real Kobe training data (25,000 shots). |
| `data/inversion_practice/` | A practice replica of the inversion task (not the real task data). |
| `src/` | Deck sources: engine, libraries, one file per section, the outline, the design spec, the authoring contract. |
| `tools/` | `build.py` (assemble `lecture.html`), `shoot.js` (screenshots), `export_script.js` (regenerate `SCRIPT.md`). |

## Presenting

Open `lecture.html`, press **F** for full screen. With a projector as a second screen, press
**P** to open the presenter window (notes, timer, pacing, next slide) and keep it on your laptop.

| Key | Action |
|---|---|
| → / space / PgDn | next build step or slide (clickers work) |
| ← / PgUp | back |
| P | presenter window · N notes on this screen |
| O | slide map (click to jump) · `12` Enter jumps to slide 12 |
| T | light / dark theme (light in a lit room) |
| F | full screen · B black screen |
| L | laser pointer · D draw on the slide · E erase · W blank whiteboard |
| C | show the clock · R resets it |
| ? | help |

## Rebuilding

```
python3 tools/build.py                                  # writes lecture.html
NODE_PATH=$(npm root -g) node tools/export_script.js    # regenerates SCRIPT.md from the notes
```
