/* NN: a tiny, readable neural-network toolkit for the live demos.
   Seeded randomness, activations, an MLP with backprop, SGD / momentum / Adam,
   and small 2-D datasets. Everything runs in plain JS, fast enough to train
   a 2-8-8-1 network on 500 points many times per frame.                       */
(function () {
  'use strict';
  const NN = (window.NN = {});

  /* ---------- randomness ---------- */
  NN.rng = function (seed) {
    let a = (seed >>> 0) || 1;
    const r = function () {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    r.normal = function () {
      let u = 0, v = 0;
      while (u === 0) u = r();
      v = r();
      return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    };
    r.uniform = (lo, hi) => lo + (hi - lo) * r();
    return r;
  };

  /* ---------- activations: f(z) and f'(z) ---------- */
  const sig = z => 1 / (1 + Math.exp(-z));
  NN.sigmoid = sig;
  const erfApprox = x => { // Abramowitz-Stegun 7.1.26
    const s = Math.sign(x); x = Math.abs(x);
    const t = 1 / (1 + 0.3275911 * x);
    const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
    return s * y;
  };
  NN.act = {
    linear: { f: z => z, d: () => 1, name: 'none' },
    relu: { f: z => (z > 0 ? z : 0), d: z => (z > 0 ? 1 : 0), name: 'ReLU' },
    leaky: { f: z => (z > 0 ? z : 0.1 * z), d: z => (z > 0 ? 1 : 0.1), name: 'Leaky ReLU' },
    tanh: { f: z => Math.tanh(z), d: z => { const t = Math.tanh(z); return 1 - t * t; }, name: 'tanh' },
    sigmoid: { f: sig, d: z => { const s = sig(z); return s * (1 - s); }, name: 'sigmoid' },
    gelu: {
      f: z => 0.5 * z * (1 + erfApprox(z / Math.SQRT2)),
      d: z => 0.5 * (1 + erfApprox(z / Math.SQRT2)) + z * Math.exp(-z * z / 2) / Math.sqrt(2 * Math.PI),
      name: 'GELU',
    },
    silu: { f: z => z * sig(z), d: z => { const s = sig(z); return s + z * s * (1 - s); }, name: 'SiLU' },
    step: { f: z => (z > 0 ? 1 : 0), d: () => 0, name: 'step' },
  };

  /* ---------- MLP ---------- */
  // sizes like [2, 8, 8, 1]; hidden layers use `act`, the last layer is linear
  // (it outputs a logit for classification or a value for regression).
  function MLP(sizes, opt) {
    opt = opt || {};
    this.sizes = sizes.slice();
    this.act = opt.act || 'tanh';
    this.rng = NN.rng(opt.seed == null ? 1 : opt.seed);
    this.W = []; this.b = []; this.gW = []; this.gb = [];
    for (let l = 0; l < sizes.length - 1; l++) {
      const nin = sizes[l], nout = sizes[l + 1];
      // PyTorch nn.Linear default: U(-1/sqrt(in), 1/sqrt(in)); a bit larger helps tiny demos
      const k = (opt.initScale || 1) * Math.sqrt((this.act === 'relu' || this.act === 'leaky' ? 6 : 3) / nin);
      const W = new Float64Array(nin * nout);
      for (let i = 0; i < W.length; i++) W[i] = this.rng.uniform(-k, k);
      const b = new Float64Array(nout);
      if (this.act === 'relu' || this.act === 'leaky') for (let i = 0; i < nout; i++) b[i] = this.rng.uniform(-0.1, 0.1);
      this.W.push(W); this.b.push(b);
      this.gW.push(new Float64Array(nin * nout)); this.gb.push(new Float64Array(nout));
    }
    this.L = sizes.length - 1;
    // scratch buffers for one sample
    this.z = sizes.map(n => new Float64Array(n));
    this.a = sizes.map(n => new Float64Array(n));
    this.dz = sizes.map(n => new Float64Array(n));
  }
  NN.MLP = MLP;

  // forward one sample; returns the output array (shared buffer: copy if you keep it)
  MLP.prototype.forward = function (x) {
    const A = NN.act[this.act];
    const a0 = this.a[0];
    for (let i = 0; i < a0.length; i++) a0[i] = x[i];
    for (let l = 0; l < this.L; l++) {
      const nin = this.sizes[l], nout = this.sizes[l + 1];
      const W = this.W[l], b = this.b[l], ain = this.a[l], z = this.z[l + 1], aout = this.a[l + 1];
      const last = l === this.L - 1;
      for (let j = 0; j < nout; j++) {
        let s = b[j];
        const row = j * nin;
        for (let i = 0; i < nin; i++) s += W[row + i] * ain[i];
        z[j] = s;
        aout[j] = last ? s : A.f(s);
      }
    }
    return this.a[this.L];
  };
  MLP.prototype.predict = function (x) { return this.forward(x)[0]; };
  // value of hidden unit j in layer l (1-based hidden layers) after the last forward()
  MLP.prototype.hidden = function (l, j) { return this.a[l][j]; };

  MLP.prototype.zeroGrad = function () {
    for (let l = 0; l < this.L; l++) { this.gW[l].fill(0); this.gb[l].fill(0); }
  };

  // accumulate gradients for one sample, given dLoss/dOutput already in this.dz[L]
  MLP.prototype._backward = function () {
    const A = NN.act[this.act];
    for (let l = this.L - 1; l >= 0; l--) {
      const nin = this.sizes[l], nout = this.sizes[l + 1];
      const W = this.W[l], gW = this.gW[l], gb = this.gb[l];
      const dout = this.dz[l + 1], ain = this.a[l], din = this.dz[l];
      for (let i = 0; i < nin; i++) din[i] = 0;
      for (let j = 0; j < nout; j++) {
        const d = dout[j];
        if (d === 0) continue;
        gb[j] += d;
        const row = j * nin;
        for (let i = 0; i < nin; i++) { gW[row + i] += d * ain[i]; din[i] += d * W[row + i]; }
      }
      if (l > 0) { const z = this.z[l]; for (let i = 0; i < nin; i++) din[i] *= A.d(z[i]); }
    }
  };

  // one full pass over (a batch of) data: returns mean loss, leaves mean grads
  // loss: 'bce' (binary cross-entropy on logits, labels 0/1) or 'mse'
  MLP.prototype.lossAndGrad = function (X, Y, loss, idx) {
    this.zeroGrad();
    const n = idx ? idx.length : X.length;
    let total = 0;
    const dOut = this.dz[this.L];
    for (let t = 0; t < n; t++) {
      const k = idx ? idx[t] : t;
      const out = this.forward(X[k])[0];
      const y = Y[k];
      if (loss === 'mse') {
        const e = out - y;
        total += e * e;
        dOut[0] = 2 * e / n;
      } else {
        // log(1 + e^z) - y z, computed stably
        total += Math.max(out, 0) - out * y + Math.log1p(Math.exp(-Math.abs(out)));
        dOut[0] = (sig(out) - y) / n;
      }
      this._backward();
    }
    return total / n;
  };
  MLP.prototype.params = function () { return this.W.concat(this.b); };
  MLP.prototype.grads = function () { return this.gW.concat(this.gb); };
  MLP.prototype.count = function () { return this.params().reduce((s, p) => s + p.length, 0); };
  MLP.prototype.accuracy = function (X, Y) {
    let ok = 0;
    for (let k = 0; k < X.length; k++) ok += (this.predict(X[k]) > 0 ? 1 : 0) === Y[k] ? 1 : 0;
    return ok / X.length;
  };

  /* ---------- optimizers on lists of Float64Arrays ---------- */
  // NN.optimizer('sgd' | 'momentum' | 'adam', {lr, beta, b1, b2, eps})
  NN.optimizer = function (kind, o) {
    o = Object.assign({ lr: 0.01, beta: 0.9, b1: 0.9, b2: 0.999, eps: 1e-8, wd: 0 }, o || {});
    const st = { kind, o, t: 0, m: null, v: null };
    st.reset = function () { st.t = 0; st.m = null; st.v = null; };
    st.step = function (params, grads) {
      if (!st.m) { st.m = params.map(p => new Float64Array(p.length)); st.v = params.map(p => new Float64Array(p.length)); }
      st.t++;
      const { lr, beta, b1, b2, eps, wd } = st.o;
      for (let k = 0; k < params.length; k++) {
        const p = params[k], g = grads[k], m = st.m[k], v = st.v[k];
        for (let i = 0; i < p.length; i++) {
          const gi = g[i];
          if (wd) p[i] -= lr * wd * p[i];
          if (kind === 'sgd') p[i] -= lr * gi;
          else if (kind === 'momentum') { m[i] = beta * m[i] + gi; p[i] -= lr * m[i]; }
          else if (kind === 'rmsprop') { v[i] = b2 * v[i] + (1 - b2) * gi * gi; p[i] -= lr * gi / (Math.sqrt(v[i]) + eps); }
          else { // adam
            m[i] = b1 * m[i] + (1 - b1) * gi;
            v[i] = b2 * v[i] + (1 - b2) * gi * gi;
            const mh = m[i] / (1 - Math.pow(b1, st.t)), vh = v[i] / (1 - Math.pow(b2, st.t));
            p[i] -= lr * mh / (Math.sqrt(vh) + eps);
          }
        }
      }
    };
    return st;
  };

  /* ---------- datasets: arrays X (pairs) and Y (0/1) in roughly [-1, 1]^2 ---------- */
  NN.data = {};
  NN.data.circle = function (n, seed, noise) {
    const r = NN.rng(seed || 7), X = [], Y = [];
    for (let i = 0; i < n; i++) {
      const inside = i % 2 === 0;
      const rad = inside ? 0.5 * Math.sqrt(r()) : 0.7 + 0.3 * r();
      const t = 2 * Math.PI * r();
      X.push([rad * Math.cos(t) + (noise || 0) * r.normal(), rad * Math.sin(t) + (noise || 0) * r.normal()]);
      Y.push(inside ? 1 : 0);
    }
    return { X, Y };
  };
  NN.data.xor = function (n, seed, noise) {
    const r = NN.rng(seed || 3), X = [], Y = [];
    for (let i = 0; i < n; i++) {
      let x = r.uniform(-1, 1), y = r.uniform(-1, 1);
      x += x > 0 ? 0.05 : -0.05; y += y > 0 ? 0.05 : -0.05;
      X.push([x + (noise || 0) * r.normal(), y + (noise || 0) * r.normal()]);
      Y.push(x * y > 0 ? 1 : 0);
    }
    return { X, Y };
  };
  NN.data.spiral = function (n, seed, noise) {
    const r = NN.rng(seed || 11), X = [], Y = [];
    for (let i = 0; i < n; i++) {
      const c = i % 2;
      const t = r() ;
      const rad = 0.08 + 0.9 * t;
      const ang = 1.75 * t * 2 * Math.PI + c * Math.PI;
      const s = noise == null ? 0.03 : noise;
      X.push([rad * Math.sin(ang) + s * r.normal(), rad * Math.cos(ang) + s * r.normal()]);
      Y.push(c);
    }
    return { X, Y };
  };
  NN.data.blobs = function (n, seed, spread) {
    const r = NN.rng(seed || 5), X = [], Y = [];
    const s = spread || 0.22;
    for (let i = 0; i < n; i++) {
      const c = i % 2;
      X.push([(c ? 0.45 : -0.45) + s * r.normal(), (c ? 0.35 : -0.35) + s * r.normal()]);
      Y.push(c);
    }
    return { X, Y };
  };
  NN.data.moons = function (n, seed, noise) {
    const r = NN.rng(seed || 9), X = [], Y = [];
    const s = noise == null ? 0.08 : noise;
    for (let i = 0; i < n; i++) {
      const c = i % 2, t = Math.PI * r();
      const x = c ? 1 - Math.cos(t) : Math.cos(t);
      const y = c ? 0.5 - Math.sin(t) : Math.sin(t);
      X.push([(x - 0.5) * 0.85 + s * r.normal(), (y - 0.25) * 0.85 + s * r.normal()]);
      Y.push(c);
    }
    return { X, Y };
  };
  NN.data.shuffle = function (n, rng) {
    const idx = Array.from({ length: n }, (_, i) => i);
    for (let i = n - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); const t = idx[i]; idx[i] = idx[j]; idx[j] = t; }
    return idx;
  };
})();
