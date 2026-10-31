# Architecture search results (Deeper Playground, spiral, test loss at epoch 1,000)

Random search with an exact copy of the site's training code (`nas.js`), about 260 architectures per setting,
each trained from 3 different random starts; ranked by the average test loss. Raw results: `nas0.jsonl`, `nas25.jsonl`.

## Noise 0 (as on the coach's screen)
| | Activation | Hidden layers | LR | Batch | Reg | Momentum | Inputs | Avg test loss |
|---|---|---|---|---|---|---|---|---|
| Best overall | Swish | 8-7-8-7 | 0.03 | 20 | L1 0.0001 | 0.9 | all 7 | **0.003** |
| Best with X1, X2 only | Swish | 6-8-4 | 0.03 | 5 | none | 0 | X1, X2 | **0.006** |
| Default (tanh 4-2, lr 0.03) | | | | | | | | ≈ 0.46 |

## Noise 25 (the challenge)
| | Activation | Hidden layers | LR | Batch | Reg | Momentum | Inputs | Avg test loss |
|---|---|---|---|---|---|---|---|---|
| Best overall | ELU | 8-7-4-5-8 | 0.03 | 3 | L2 0.001 | 0 | all 7 | 0.043 |
| Best with X1, X2 only | Swish | 8-8-6-8-5 | 0.1 | 10 | L2 0.003 | 0 | X1, X2 | 0.047 |
| Earlier reference | ELU | 8-8-8-8 | 0.1 | 10 | L2 0.001 | 0 | X1, X2 | 0.043 |
With noise the floor is about 0.04 for everything good: the noise, not the network, limits the score.
