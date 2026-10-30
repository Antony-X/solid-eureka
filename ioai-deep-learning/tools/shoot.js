// Screenshot slides for review.
//   node tools/shoot.js [outDir] [--theme light|dark] [--from 1] [--to 999] [--steps] [--train 2000]
// --steps also shoots every build step; --train N waits N ms on slides with live demos
// after pressing their first "Train" button, so the trained state is captured.
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const args = process.argv.slice(2);
  const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
  const out = args[0] && !args[0].startsWith('--') ? args[0] : 'build/shots';
  const theme = opt('--theme', 'light');
  const from = +opt('--from', 1), to = +opt('--to', 9999);
  const steps = args.includes('--steps');
  const train = +opt('--train', 0);
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, colorScheme: theme });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errors.push(`[${m.type()}] ${m.text()}`); });
  page.on('pageerror', e => errors.push('[pageerror] ' + e.message));
  const file = 'file://' + path.resolve(opt('--file', path.resolve(__dirname, '..', 'lecture.html')));
  await page.goto(file + '#' + from);
  await page.waitForTimeout(600);
  const total = await page.evaluate(() => Deck.slides.length);
  const report = [];
  for (let i = from - 1; i < Math.min(total, to); i++) {
    await page.evaluate(i => Deck.go(i, 0), i);
    await page.waitForTimeout(450);
    const info = await page.evaluate(() => {
      const s = Deck.slides[Deck.cur];
      const el = s.el;
      // detect content overflowing the slide box
      const r0 = el.getBoundingClientRect();
      const k = Deck.scale;
      const over = [];
      el.querySelectorAll('*').forEach(n => {
        if (n.closest('[data-only]:not(.is-shown)')) return;
        const r = n.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) return;
        if (r.right > r0.right + 2 || r.bottom > r0.bottom + 2 || r.left < r0.left - 2 || r.top < r0.top - 2) over.push(n.tagName + '.' + (n.className && n.className.baseVal === undefined ? n.className : '') + ' ' + Math.round((r.right - r0.left) / k) + 'x' + Math.round((r.bottom - r0.top) / k));
      });
      return { id: s.id, title: s.title, maxStep: s.maxStep, over: over.slice(0, 5) };
    });
    const id = String(i + 1).padStart(3, '0');
    if (train) {
      const clicked = await page.evaluate(() => {
        const b = Array.from(Deck.slides[Deck.cur].el.querySelectorAll('button')).find(b => /^(Train|Run|Play|Go)/i.test(b.textContent.trim()));
        if (b) { b.click(); return true; } return false;
      });
      if (clicked) await page.waitForTimeout(train);
    }
    if (steps && info.maxStep > 0) {
      for (let k = 0; k <= info.maxStep; k++) {
        await page.evaluate(k => Deck.go(Deck.cur, k), k);
        await page.waitForTimeout(420);
        await page.screenshot({ path: `${out}/${id}-${k}.png` });
      }
    } else {
      if (info.maxStep > 0) { await page.evaluate(() => Deck.go(Deck.cur, 'end')); await page.waitForTimeout(450); }
      await page.screenshot({ path: `${out}/${id}.png` });
    }
    report.push(`${id} ${info.id} steps=${info.maxStep}` + (info.over.length ? ' OVERFLOW ' + info.over.join(' | ') : ''));
  }
  fs.writeFileSync(`${out}/report.txt`, report.join('\n') + '\n\nconsole:\n' + errors.join('\n'));
  console.log(report.join('\n'));
  if (errors.length) console.log('console errors:\n' + errors.slice(0, 30).join('\n'));
  await browser.close();
})();
