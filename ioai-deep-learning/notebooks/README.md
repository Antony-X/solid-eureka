# Notebooks

| notebook | for | what it does |
|---|---|---|
| `01_live_coding.ipynb` | coach, in the lecture | live coding for lecture sections 6–8 (optimizers, the training loop, debugging), run cell by cell |
| `02_kobe_starter.ipynb` | students | Task 1 (Kobe shot prediction): statement and rules, data, always-miss baseline, a legal `MyModel` skeleton, a training-loop skeleton, validation accuracy, an automatic rule checker, and a cell that writes `submission.zip` and reloads it like the grader |
| `03_inversion_starter.ipynb` | students | Task 2 (Operation Inversion): statement, the given loading code, detection of the zeroed column, a gradient-descent skeleton on that column only, a residual check, a plot of one row, self-scoring with the task's formula, and the submission writer |
| `../solutions/02_kobe_solution.ipynb` | coach | reference for Task 1 |
| `../solutions/03_inversion_solution.ipynb` | coach | reference for Task 2 |

Every starter runs from top to bottom as it is. The `TODO`s are placeholders that run, so later cells always
work: the untrained Kobe model still gets packaged and checked, and the inversion starter submits all zeros.
Students replace the placeholders. Keep `solutions/` away from them until the tasks are over.

## Opening them

**Jupyter on your laptop.** Python 3.10 or newer, then:

```
pip install torch numpy pandas scikit-learn matplotlib jupyter
cd ioai-deep-learning/notebooks
jupyter lab
```

Run notebooks from the folder they live in: the data paths are relative (`../data/...`).

**Google Colab.** *File → Upload notebook* (or open it from GitHub). Then open the Files panel on the left and
upload the data files:
- Kobe: `data/kobe/data_train.csv`;
- Inversion: `model.pt` and `data.csv` from `data/inversion_practice/`, plus `true_column.csv` to score yourself.

You do not have to edit anything. The first code cell sets `DATA_DIR` to `../data/...`, and when that folder does
not exist, as in Colab, it falls back to the folder the notebook runs in (`.`), where the uploaded files are.
Everything else works unchanged, `%%writefile` included. Download `kobe_submission/submission.zip` or
`submission.csv` from the Files panel.

Each notebook runs in under a minute on a CPU. No GPU is needed.

## Data

| path | what |
|---|---|
| `../data/kobe/data_train.csv` | the real task file: 25,000 labelled shots (`loc_x, loc_y, minutes_remaining, shot_distance, shot_made_flag, shot_id`). Only `loc_x, loc_y` may be used. |
| `../data/inversion_practice/` | a **practice replica** of the inversion task (`model.pt`, `data.csv`, `true_column.csv`). It is NOT the real task data; see its README. Rebuild it with `../tools/make_inversion_practice.py`. |

The real inversion files come with the task itself. Put them in a folder of their own and point `DATA_DIR` at
it in the first code cell. They have no `true_column.csv`; the self-scoring cells notice this and print
"score not available", and every other cell runs as before.

## Numbers to expect

Kobe (validation split `random_state=0`, 5,000 shots):

| | accuracy |
|---|---|
| always miss | 0.5526 |
| rule "made iff within 3 ft of the rim" (≈ ceiling) | 0.6022 |
| reference 2-8-8-1 ReLU, Adam 1e-2, 2,000 full-batch steps | 0.6018 (BCE 0.665) |
| same model after folding the scaling into `fc1`, reloaded from the zip, raw inputs | 0.6018 (max diff 6e-7) |

Over five random splits the reference averages about 0.607. On the leaderboard, expect 0.60–0.625 (±0.01 noise per board).

Inversion practice replica (score = (0.968 − MSE)/(0.968 − 0.0045) · 100):

| method | MSE | score |
|---|---|---|
| all zeros | 0.9671 | 0.1 |
| Adam lr 0.1, 500 steps from 0, sum loss | 0.0236 | 98.0 |
| grid 2001 in [−5, 5], argmin \|f − y\| (no selection rule) | 2.1591 | 0.0 |
| all roots, the one closest to 0 | 0.0212 | 98.3 |
| regression prior, posterior mean | 0.0192 | 98.5 |
| EM prior, posterior mean | 0.0145 | 99.0 |

On the replica, 331 of 1000 rows have two or more exact solutions.
