/* UI: big, projector-friendly controls for the demos. */
(function () {
  'use strict';
  const U = (window.UI = {});
  let uid = 0;
  const id = p => (p || 'ctl') + '-' + (++uid);

  // UI.slider(parent, {label, min, max, step, value, fmt, oninput, id})
  U.slider = function (parent, o) {
    const wrap = document.createElement('label');
    wrap.className = 'ui-slider';
    const inp = document.createElement('input');
    inp.type = 'range';
    inp.id = o.id || id('slider');
    inp.min = o.min; inp.max = o.max; inp.step = o.step || 'any'; inp.value = o.value;
    const name = document.createElement('span');
    name.className = 'ui-slider-label';
    name.innerHTML = o.label || '';
    const val = document.createElement('output');
    val.className = 'ui-slider-value';
    const fmt = o.fmt || (v => (+v).toFixed(2));
    const map = o.map || (v => v);
    const sync = () => { val.textContent = fmt(map(+inp.value)); };
    inp.addEventListener('input', () => { sync(); o.oninput && o.oninput(map(+inp.value)); });
    sync();
    wrap.append(name, inp, val);
    parent.appendChild(wrap);
    return {
      el: wrap, input: inp,
      get value() { return map(+inp.value); },
      set(v, fire) { inp.value = v; sync(); if (fire && o.oninput) o.oninput(map(+inp.value)); },
    };
  };

  // UI.button(parent, label, onclick, {kind:'primary'|'ghost'})
  U.button = function (parent, label, onclick, opt) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'ui-btn' + (opt && opt.kind ? ' ui-btn-' + opt.kind : '');
    b.id = (opt && opt.id) || id('btn');
    b.innerHTML = label;
    b.addEventListener('click', e => { e.stopPropagation(); onclick && onclick(e); });
    parent.appendChild(b);
    return b;
  };

  // UI.choice(parent, [{value,label}], value, onchange) -> segmented control
  U.choice = function (parent, items, value, onchange, opt) {
    const wrap = document.createElement('div');
    wrap.className = 'ui-choice';
    wrap.setAttribute('role', 'radiogroup');
    if (opt && opt.label) {
      const l = document.createElement('span');
      l.className = 'ui-choice-label';
      l.innerHTML = opt.label;
      wrap.appendChild(l);
    }
    const btns = items.map(it => {
      const b = document.createElement('button');
      b.type = 'button';
      b.id = id('choice');
      b.innerHTML = it.label;
      b.setAttribute('role', 'radio');
      b.addEventListener('click', e => { e.stopPropagation(); set(it.value, true); });
      wrap.appendChild(b);
      return b;
    });
    function set(v, fire) {
      value = v;
      items.forEach((it, i) => {
        btns[i].classList.toggle('is-on', it.value === v);
        btns[i].setAttribute('aria-checked', it.value === v ? 'true' : 'false');
      });
      if (fire && onchange) onchange(v);
    }
    set(value, false);
    parent.appendChild(wrap);
    return { el: wrap, set, get value() { return value; } };
  };

  // a row container for controls
  U.row = function (parent, cls) {
    const d = document.createElement('div');
    d.className = 'ui-row' + (cls ? ' ' + cls : '');
    parent.appendChild(d);
    return d;
  };

  // a live readout: UI.readout(parent, 'loss') -> {set(text)}
  U.readout = function (parent, label, cls) {
    const d = document.createElement('div');
    d.className = 'ui-readout' + (cls ? ' ' + cls : '');
    d.innerHTML = `<span class="ui-readout-label">${label}</span><span class="ui-readout-value">–</span>`;
    parent.appendChild(d);
    const v = d.lastChild;
    return { el: d, set(t) { v.innerHTML = t; } };
  };
})();
