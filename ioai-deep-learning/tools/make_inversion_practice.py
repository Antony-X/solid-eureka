# Builds the PRACTICE replica of the "Operation Inversion" task (NOT the real task data).
# Writes data/inversion_practice/{model.pt, data.csv, true_column.csv}.
# usage: python tools/make_inversion_practice.py      (about 20 s on one CPU thread)
# Same recipe and seeds as the research replica "replica_relu" (ReLU MLP, q = 0.25), so the numbers quoted
# in the lecture (Adam lr 0.1 -> MSE 0.024) are the numbers you get here.
from pathlib import Path

import numpy as np
import pandas as pd
import torch
import torch.nn as nn

torch.set_num_threads(1)
torch.manual_seed(0)
rng = np.random.default_rng(0)
OUT = Path(__file__).resolve().parent.parent / "data" / "inversion_practice"
OUT.mkdir(parents=True, exist_ok=True)
MISSING = 3  # the column that gets overwritten with 0.0

# 10 standard-normal features with a few mild correlations; x3 is correlated with x1 (0.5) and x5 (0.4),
# so the other columns carry a little information about the missing one (a usable prior)
C = np.eye(10)
for i, j, r in [(1, 3, 0.5), (3, 5, 0.4), (0, 2, 0.3), (6, 7, -0.3), (8, 9, 0.4)]:
    C[i, j] = C[j, i] = r
L = np.linalg.cholesky(C)


def sample(n, gen):
    return (gen.standard_normal((n, 10)) @ L.T).astype(np.float32)


def target(x):
    x0, x1, x2, x3, x4, x5, x6, x7, x8, x9 = x.T
    # 1.2*x3 + 0.25*x3^2 is a parabola with its vertex near x3 = -2.4: some rows get a second root
    return (np.sin(1.5 * x0) + 0.5 * x1 * x2 + 1.2 * x3 + 0.25 * x3**2 + 0.35 * x3 * x4
            + 0.6 * np.tanh(2 * x5) - 0.4 * x6**2 + 0.3 * x7 * x8 + 0.5 * np.cos(2 * x9) + 0.3 * x9)


class MLP(nn.Module):
    def __init__(self):
        super().__init__()
        self.net = nn.Sequential(nn.Linear(10, 64), nn.ReLU(), nn.Linear(64, 64), nn.ReLU(), nn.Linear(64, 1))

    def forward(self, x):
        return self.net(x)


X_train = torch.tensor(sample(50_000, rng))
y_train = torch.tensor(target(X_train.numpy()), dtype=torch.float32)[:, None]
model = MLP()
opt = torch.optim.Adam(model.parameters(), lr=3e-3)
sched = torch.optim.lr_scheduler.CosineAnnealingLR(opt, 60 * 196)
for epoch in range(60):
    for idx in torch.randperm(len(X_train)).split(256):
        loss = ((model(X_train[idx]) - y_train[idx]) ** 2).mean()
        opt.zero_grad(set_to_none=True)
        loss.backward()
        opt.step()
        sched.step()
model.eval()
torch.jit.script(model).save(OUT / "model.pt")

# a 1000-row sample whose missing column has mean(x^2) close to 0.968, so the all-zeros
# baseline MSE matches the real task's baseline
for s in range(10_000):
    X = sample(1000, np.random.default_rng(1000 + s))
    if abs((X[:, MISSING] ** 2).mean() - 0.968) < 0.002:
        break
with torch.no_grad():
    y = model(torch.tensor(X))[:, 0].numpy()
pd.DataFrame({"x_true": X[:, MISSING]}).to_csv(OUT / "true_column.csv", index=False)
X[:, MISSING] = 0.0
df = pd.DataFrame(X, columns=[f"x{i}" for i in range(10)])
df["y"] = y
df.to_csv(OUT / "data.csv", index=False)
print(f"final train MSE {loss.item():.4f}; sample seed {s}; zero-baseline MSE "
      f"{(pd.read_csv(OUT / 'true_column.csv').x_true ** 2).mean():.4f}; y std {y.std():.3f}")
