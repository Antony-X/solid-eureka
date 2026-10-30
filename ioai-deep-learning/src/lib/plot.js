/* Plot: small canvas helpers for the demos. Colours always come from the CSS
   tokens, so every drawing follows the light/dark theme (redraw on api.onTheme). */
(function () {
  'use strict';
  const P = (window.Plot = {});

  // read a CSS custom property, e.g. P.css('--c0')
  P.css = function (name, elx) {
    return getComputedStyle(elx || document.documentElement).getPropertyValue(name).trim();
  };
  // the colour vocabulary used in every plot
  P.colors = function () {
    const c = n => P.css(n);
    return {
      bg: c('--bg'), paper: c('--paper'), ink: c('--ink'), muted: c('--muted'), grid: c('--grid'), rule: c('--rule'),
      c0: c('--c0'), c1: c('--c1'), grad: c('--grad'), ok: c('--ok'), bad: c('--bad'), hi: c('--hi'),
      fontBody: c('--font-body'), fontMono: c('--font-mono'), fontDisplay: c('--font-display'),
    };
  };

  /* ---------- colour maths ---------- */
  P.rgb = function (s) {
    s = s.trim();
    if (s[0] === '#') {
      if (s.length === 4) s = '#' + s[1] + s[1] + s[2] + s[2] + s[3] + s[3];
      return [parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16), parseInt(s.slice(5, 7), 16)];
    }
    const m = s.match(/[\d.]+/g);
    return m ? m.slice(0, 3).map(Number) : [0, 0, 0];
  };
  P.mix = function (a, b, t) {
    const A = Array.isArray(a) ? a : P.rgb(a), B = Array.isArray(b) ? b : P.rgb(b);
    return [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t];
  };
  P.str = (c, alpha) => alpha == null ? `rgb(${c.map(Math.round).join(',')})` : `rgba(${c.map(Math.round).join(',')},${alpha})`;
  P.alpha = (hex, a) => P.str(P.rgb(hex), a);

  /* ---------- canvas ---------- */
  // Creates a crisp canvas of CSS size w x h (stage pixels) inside parent.
  P.canvas = function (parent, w, h, cls) {
    const cv = document.createElement('canvas');
    const R = 2;
    cv.width = Math.round(w * R); cv.height = Math.round(h * R);
    cv.style.width = w + 'px'; cv.style.height = h + 'px';
    if (cls) cv.className = cls;
    parent.appendChild(cv);
    const ctx = cv.getContext('2d');
    ctx.setTransform(R, 0, 0, R, 0, 0);
    const o = { cv, ctx, w, h, R };
    // convert a pointer event to canvas coordinates (works with the scaled stage)
    o.pos = function (e) {
      const r = cv.getBoundingClientRect();
      return [(e.clientX - r.left) * w / r.width, (e.clientY - r.top) * h / r.height];
    };
    o.clear = function (fill) {
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
      if (fill) { ctx.fillStyle = fill; ctx.fillRect(0, 0, cv.width, cv.height); }
      else ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.restore();
    };
    return o;
  };

  // linear scale: s(x) maps domain -> range; s.inv(px) maps back
  P.scale = function (d0, d1, r0, r1) {
    const k = (r1 - r0) / (d1 - d0);
    const s = x => r0 + (x - d0) * k;
    s.inv = p => d0 + (p - r0) / k;
    s.domain = [d0, d1]; s.range = [r0, r1];
    return s;
  };
  // a square plotting frame: {sx, sy, x0, y0, x1, y1}
  P.frame = function (x0, y0, size, dom) {
    dom = dom || [-1.2, 1.2];
    return { sx: P.scale(dom[0], dom[1], x0, x0 + size), sy: P.scale(dom[0], dom[1], y0 + size, y0), x0, y0, x1: x0 + size, y1: y0 + size };
  };

  P.ticks = function (a, b, n) {
    const span = b - a, step0 = span / (n || 5);
    const mag = Math.pow(10, Math.floor(Math.log10(step0)));
    const err = step0 / mag;
    const step = (err >= 7.5 ? 10 : err >= 3.5 ? 5 : err >= 1.5 ? 2 : 1) * mag;
    const out = [];
    for (let v = Math.ceil(a / step) * step; v <= b + step * 1e-9; v += step) out.push(Math.abs(v) < step * 1e-9 ? 0 : v);
    return out;
  };

  // axes with light grid; opt: {xt, yt, xlabel, ylabel, grid, zero, font}
  P.axes = function (ctx, sx, sy, opt) {
    opt = opt || {};
    const C = P.colors();
    const [x0, x1] = sx.range, [y0, y1] = [sy.range[1], sy.range[0]];
    const xt = opt.xt || P.ticks(sx.domain[0], sx.domain[1], opt.nx || 5);
    const yt = opt.yt || P.ticks(sy.domain[0], sy.domain[1], opt.ny || 5);
    ctx.save();
    ctx.lineWidth = 1;
    if (opt.grid !== false) {
      ctx.strokeStyle = C.grid;
      xt.forEach(v => { const p = Math.round(sx(v)) + 0.5; ctx.beginPath(); ctx.moveTo(p, y0); ctx.lineTo(p, y1); ctx.stroke(); });
      yt.forEach(v => { const p = Math.round(sy(v)) + 0.5; ctx.beginPath(); ctx.moveTo(x0, p); ctx.lineTo(x1, p); ctx.stroke(); });
    }
    ctx.strokeStyle = C.muted; ctx.lineWidth = 2.5;
    if (opt.zero !== false) {
      if (sy.domain[0] <= 0 && sy.domain[1] >= 0) { ctx.beginPath(); ctx.moveTo(x0, sy(0)); ctx.lineTo(x1, sy(0)); ctx.stroke(); }
      if (sx.domain[0] <= 0 && sx.domain[1] >= 0) { ctx.beginPath(); ctx.moveTo(sx(0), y0); ctx.lineTo(sx(0), y1); ctx.stroke(); }
    }
    if (opt.labels !== false) {
      ctx.fillStyle = C.muted;
      ctx.font = `${opt.font || 26}px ${C.fontMono}`;
      const fmt = opt.fmt || (v => +v.toFixed(3) + '');
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      const yb = opt.xAt != null ? sy(opt.xAt) : y1;
      xt.forEach(v => { if (opt.skipZero && v === 0) return; ctx.fillText(fmt(v), sx(v), yb + 8); });
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      const xl = opt.yAt != null ? sx(opt.yAt) : x0;
      yt.forEach(v => { if (opt.skipZero && v === 0) return; ctx.fillText(fmt(v), xl - 10, sy(v)); });
      ctx.font = `${opt.font || 28}px ${C.fontBody}`;
      if (opt.xlabel) { ctx.textAlign = 'right'; ctx.textBaseline = 'bottom'; ctx.fillStyle = C.ink; ctx.fillText(opt.xlabel, x1, (opt.xAt != null ? sy(opt.xAt) : y1) - 8); }
      if (opt.ylabel) { ctx.textAlign = 'left'; ctx.textBaseline = 'top'; ctx.fillStyle = C.ink; ctx.fillText(opt.ylabel, (opt.yAt != null ? sx(opt.yAt) : x0) + 10, y0 + 2); }
    }
    ctx.restore();
  };

  // polyline of a function over the x-domain
  P.fn = function (ctx, sx, sy, f, opt) {
    opt = opt || {};
    const [a, b] = sx.domain, n = opt.n || 400;
    ctx.save();
    ctx.beginPath();
    let pen = false;
    for (let i = 0; i <= n; i++) {
      const x = a + (b - a) * i / n, y = f(x);
      if (!isFinite(y)) { pen = false; continue; }
      const py = sy(y);
      if (opt.clip !== false && (py < sy.range[1] - 2000 || py > sy.range[0] + 2000)) { pen = false; continue; }
      pen ? ctx.lineTo(sx(x), py) : ctx.moveTo(sx(x), py);
      pen = true;
    }
    ctx.strokeStyle = opt.color || P.colors().ink;
    ctx.lineWidth = opt.width || 4;
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    if (opt.dash) ctx.setLineDash(opt.dash);
    ctx.stroke();
    ctx.restore();
  };

  // clip drawing to a rectangle
  P.clip = function (ctx, x0, y0, x1, y1) { ctx.beginPath(); ctx.rect(x0, y0, x1 - x0, y1 - y0); ctx.clip(); };

  // points: X array of [x,y], Y labels (0/1) -> class colours
  P.points = function (ctx, X, Y, sx, sy, opt) {
    opt = opt || {};
    const C = P.colors();
    const r = opt.r || 7;
    ctx.save();
    ctx.lineWidth = opt.stroke || 2;
    ctx.strokeStyle = opt.edge || C.paper;
    for (let i = 0; i < X.length; i++) {
      ctx.beginPath();
      ctx.arc(sx(X[i][0]), sy(X[i][1]), r, 0, 2 * Math.PI);
      ctx.fillStyle = Y[i] ? C.c1 : C.c0;
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  };

  // probability heatmap: p(x,y) in [0,1] painted from class-0 tint to class-1 tint.
  // res = cells per side; uses an offscreen canvas and smooth upscaling.
  P.heat = function (ctx, f, fr, opt) {
    opt = opt || {};
    const res = opt.res || 60;
    const C = P.colors();
    const c0 = P.rgb(C.c0), c1 = P.rgb(C.c1), base = P.rgb(C.paper);
    const strength = opt.strength == null ? 0.55 : opt.strength;
    const mid = opt.mid == null ? 0.5 : opt.mid, span = opt.span || 0.5;
    const off = P._off || (P._off = document.createElement('canvas'));
    off.width = res; off.height = res;
    const octx = off.getContext('2d');
    const img = octx.createImageData(res, res);
    const [dx0, dx1] = fr.sx.domain, [dy0, dy1] = fr.sy.domain;
    for (let j = 0; j < res; j++) {
      const y = dy1 - (j + 0.5) / res * (dy1 - dy0);
      for (let i = 0; i < res; i++) {
        const x = dx0 + (i + 0.5) / res * (dx1 - dx0);
        let p = f(x, y);
        if (!isFinite(p)) p = 0.5;
        const t = Math.min(1, Math.abs(p - mid) / span);
        const tgt = p > mid ? c1 : c0;
        const c = P.mix(base, tgt, strength * Math.pow(t, opt.gamma || 0.8));
        const o = 4 * (j * res + i);
        img.data[o] = c[0]; img.data[o + 1] = c[1]; img.data[o + 2] = c[2]; img.data[o + 3] = 255;
      }
    }
    octx.putImageData(img, 0, 0);
    ctx.save();
    ctx.imageSmoothingEnabled = opt.smooth !== false;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(off, fr.x0, fr.y0, fr.x1 - fr.x0, fr.y1 - fr.y0);
    ctx.restore();
  };

  // the p = 0.5 contour of f on a grid (marching squares, straight segments)
  P.contour = function (ctx, f, fr, opt) {
    opt = opt || {};
    const res = opt.res || 80, lvl = opt.level == null ? 0.5 : opt.level;
    const [dx0, dx1] = fr.sx.domain, [dy0, dy1] = fr.sy.domain;
    const gx = i => dx0 + i / res * (dx1 - dx0), gy = j => dy0 + j / res * (dy1 - dy0);
    const v = [];
    for (let j = 0; j <= res; j++) { v.push([]); for (let i = 0; i <= res; i++) v[j].push(f(gx(i), gy(j)) - lvl); }
    ctx.save();
    ctx.strokeStyle = opt.color || P.colors().ink;
    ctx.lineWidth = opt.width || 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    const lerp = (a, b) => a / (a - b);
    for (let j = 0; j < res; j++) for (let i = 0; i < res; i++) {
      const a = v[j][i], b = v[j][i + 1], c = v[j + 1][i + 1], d = v[j + 1][i];
      const pts = [];
      if ((a > 0) !== (b > 0)) pts.push([gx(i + lerp(a, b)), gy(j)]);
      if ((b > 0) !== (c > 0)) pts.push([gx(i + 1), gy(j + lerp(b, c))]);
      if ((d > 0) !== (c > 0)) pts.push([gx(i + lerp(d, c)), gy(j + 1)]);
      if ((a > 0) !== (d > 0)) pts.push([gx(i), gy(j + lerp(a, d))]);
      for (let k = 0; k + 1 < pts.length; k += 2) {
        ctx.moveTo(fr.sx(pts[k][0]), fr.sy(pts[k][1]));
        ctx.lineTo(fr.sx(pts[k + 1][0]), fr.sy(pts[k + 1][1]));
      }
    }
    ctx.stroke();
    ctx.restore();
  };

  P.arrow = function (ctx, x0, y0, x1, y1, opt) {
    opt = opt || {};
    const head = opt.head || 16, ang = Math.atan2(y1 - y0, x1 - x0);
    ctx.save();
    ctx.strokeStyle = ctx.fillStyle = opt.color || P.colors().grad;
    ctx.lineWidth = opt.width || 4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - Math.cos(ang) * head * 0.6, y1 - Math.sin(ang) * head * 0.6); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x1 - head * Math.cos(ang - 0.42), y1 - head * Math.sin(ang - 0.42));
    ctx.lineTo(x1 - head * Math.cos(ang + 0.42), y1 - head * Math.sin(ang + 0.42));
    ctx.closePath(); ctx.fill();
    ctx.restore();
  };

  P.dot = function (ctx, x, y, r, fill, stroke) {
    ctx.beginPath(); ctx.arc(x, y, r, 0, 2 * Math.PI);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 3; ctx.stroke(); }
  };

  P.text = function (ctx, s, x, y, opt) {
    opt = opt || {};
    const C = P.colors();
    ctx.save();
    ctx.font = `${opt.weight || 400} ${opt.size || 26}px ${opt.mono ? C.fontMono : opt.display ? C.fontDisplay : C.fontBody}`;
    ctx.fillStyle = opt.color || C.ink;
    ctx.textAlign = opt.align || 'left';
    ctx.textBaseline = opt.base || 'alphabetic';
    ctx.fillText(s, x, y);
    ctx.restore();
  };

  // a small loss-curve sparkline: values array, frame box
  P.curve = function (ctx, vals, box, opt) {
    opt = opt || {};
    const C = P.colors();
    const { x, y, w, h } = box;
    if (!vals.length) return;
    let lo = opt.min != null ? opt.min : Math.min(...vals), hi = opt.max != null ? opt.max : Math.max(...vals);
    if (opt.log) { lo = Math.log10(Math.max(1e-6, lo)); hi = Math.log10(Math.max(1e-6, hi)); }
    if (hi - lo < 1e-9) hi = lo + 1;
    const n = opt.n || vals.length;
    ctx.save();
    ctx.beginPath();
    vals.forEach((v, i) => {
      const vv = opt.log ? Math.log10(Math.max(1e-6, v)) : v;
      const px = x + w * i / Math.max(1, n - 1), py = y + h - h * (vv - lo) / (hi - lo);
      i ? ctx.lineTo(px, Math.max(y, Math.min(y + h, py))) : ctx.moveTo(px, Math.max(y, Math.min(y + h, py)));
    });
    ctx.strokeStyle = opt.color || C.grad; ctx.lineWidth = opt.width || 3; ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.restore();
  };
})();
