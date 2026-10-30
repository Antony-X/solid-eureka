/* Code: a tiny Python syntax highlighter for slides.
   Code.py(src, {hl: '1:3-4 2:6', size: 'm'}) returns a <pre class="code"> string.
   hl lists, per build step, which lines (1-based) to spotlight.             */
(function () {
  'use strict';
  const C = (window.Code = {});
  const KW = new Set('and as assert break class continue def del elif else except False finally for from global if import in is lambda None nonlocal not or pass raise return True try while with yield'.split(' '));
  const BI = new Set('print range len float int str list dict tuple zip enumerate sum min max abs super isinstance round sorted map'.split(' '));
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  function line(src) {
    let out = '', i = 0;
    const n = src.length;
    while (i < n) {
      const ch = src[i];
      if (ch === '#') { out += `<span class="t-com">${esc(src.slice(i))}</span>`; break; }
      if (ch === '"' || ch === "'") {
        let j = i + 1;
        while (j < n && src[j] !== ch) { if (src[j] === '\\') j++; j++; }
        out += `<span class="t-str">${esc(src.slice(i, j + 1))}</span>`;
        i = j + 1; continue;
      }
      if (/[0-9]/.test(ch) && !/[A-Za-z_]/.test(src[i - 1] || '')) {
        const m = /^[0-9][0-9_]*(\.[0-9]*)?(e-?[0-9]+)?/.exec(src.slice(i));
        out += `<span class="t-num">${m[0]}</span>`; i += m[0].length; continue;
      }
      if (/[A-Za-z_]/.test(ch)) {
        const m = /^[A-Za-z_][A-Za-z_0-9]*/.exec(src.slice(i));
        const w = m[0];
        const nextCh = src[i + w.length];
        const prevCh = src[i - 1];
        let cls = '';
        if (KW.has(w)) cls = 't-kw';
        else if (w === 'self') cls = 't-self';
        else if (BI.has(w) && prevCh !== '.') cls = 't-bi';
        else if (nextCh === '(') cls = 't-fn';
        else if (prevCh === '.') cls = 't-attr';
        out += cls ? `<span class="${cls}">${w}</span>` : w;
        i += w.length; continue;
      }
      if (ch === '@') {
        const m = /^@[A-Za-z_.]+/.exec(src.slice(i));
        if (m) { out += `<span class="t-dec">${m[0]}</span>`; i += m[0].length; continue; }
      }
      if ('=+-*/<>%'.includes(ch)) { out += `<span class="t-op">${esc(ch)}</span>`; i++; continue; }
      out += esc(ch); i++;
    }
    return out;
  }

  // strip common indentation and the leading/trailing blank lines of a template literal
  C.dedent = function (src) {
    const lines = src.replace(/\t/g, '    ').split('\n');
    while (lines.length && !lines[0].trim()) lines.shift();
    while (lines.length && !lines[lines.length - 1].trim()) lines.pop();
    const ind = Math.min(...lines.filter(l => l.trim()).map(l => l.match(/^ */)[0].length));
    return lines.map(l => l.slice(ind));
  };

  C.py = function (src, opt) {
    opt = opt || {};
    const lines = C.dedent(src);
    const body = lines.map(l => `<span class="ln">${line(l) || ' '}</span>`).join('\n');
    const attrs = [`class="code${opt.size ? ' code-' + opt.size : ''}${opt.cls ? ' ' + opt.cls : ''}"`];
    if (opt.hl) attrs.push(`data-hl="${opt.hl}"`);
    if (opt.step != null) attrs.push(`data-step="${opt.step}"`);
    return `<pre ${attrs.join(' ')}><code>${body}</code></pre>`;
  };
  // inline code
  C.i = s => `<code class="ic">${line(s)}</code>`;
})();
