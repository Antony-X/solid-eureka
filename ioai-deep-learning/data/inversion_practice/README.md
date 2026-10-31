# Inversion practice replica (NOT the real task data)

A stand-in for the "Operation Inversion" task files, built by the coach so the team can practise before
the real task. The real model, the real data and the real hidden column are different.

| file | what |
|---|---|
| `model.pt` | frozen TorchScript MLP, 10 inputs → 1 output (`torch.jit.load("model.pt")`) |
| `data.csv` | 1000 rows of `x0 … x9, y`; one input column was overwritten with `0.0` |
| `true_column.csv` | the hidden column (`x_true`), only for self-scoring. The real task has no such file. |

Answering all zeros gives MSE 0.967 here, matching the real task's baseline of about 0.968. About a third of the
rows have two exact solutions, so picking between them matters.

Rebuild with `python tools/make_inversion_practice.py` (about 20 s on CPU). The script uses the same seeds,
so it recreates these files. Use it if `torch.jit.load` refuses the file under an older torch, e.g. in Colab.
