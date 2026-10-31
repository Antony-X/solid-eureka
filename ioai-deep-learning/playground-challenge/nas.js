// Random-search NAS on the exact Deeper Playground simulator.
// node nas.js <noise> <workerIdx> <seconds> <out.jsonl>
const fs = require('fs');
const D = require('../sim/deeper-sim');
const [noise, wi, secs, out] = process.argv.slice(2);
let s = 1234 + 977 * +wi; const rnd = () => ((s = (s * 1103515245 + 12345) % 2147483648) / 2147483648);
const pick = a => a[Math.floor(rnd() * a.length)];
const EP = 1000;
function evalCfg(c) {
  const base = { dataset: 'spiral', noise: +noise, seed: '0.12345', percTrainData: 50, problem: 'classification',
    x: true, y: true, xSquared: c.feat, ySquared: c.feat, xTimesY: c.feat, sinX: c.feat, sinY: c.feat,
    activation: c.act, networkShape: c.shape, learningRate: c.lr, batchSize: c.bs,
    regularization: c.reg, regularizationRate: c.rr, momentum: c.mom, dropout: 0 };
  const res = [];
  for (const ws of [null, 'a', 'b']) {
    const run = D.createRun(D.makeState(base), ws ? { weightSeed: ws, noLoss: true } : { noLoss: true });
    for (let e = 0; e < EP; e++) run.oneStep();
    const m = run.metrics(); res.push(isFinite(m.lossTest) ? m.lossTest : 9);
  }
  return res;
}
const t0 = Date.now(); const f = fs.openSync(out, 'a');
while ((Date.now() - t0) / 1000 < +secs) {
  const L = 1 + Math.floor(rnd() * 6);
  const c = { act: pick(['relu', 'leaky_relu', 'elu', 'swish', 'tanh', 'softplus']),
    shape: Array.from({ length: L }, () => pick([4, 5, 6, 7, 8, 8, 8])),
    lr: pick([0.01, 0.03, 0.1, 0.3]), bs: pick([1, 3, 5, 10, 20]),
    reg: pick(['L2', 'L2', 'L1']), rr: pick([0, 0, 0.0001, 0.001, 0.003]),
    mom: pick([0, 0, 0.5, 0.9]), feat: rnd() < 0.5 };
  try { const r = evalCfg(c); fs.writeSync(f, JSON.stringify({ c, off: r[0], mean: (r[0] + r[1] + r[2]) / 3, worst: Math.max(...r) }) + '\n'); } catch (e) {}
}
