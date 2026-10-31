// Export the speaker notes of every slide into SCRIPT.md (the teacher's script).
//   NODE_PATH=$(npm root -g) node tools/export_script.js
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const root = path.resolve(__dirname, '..');
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto('file://' + path.join(root, 'lecture.html'));
  await page.waitForTimeout(500);
  const data = await page.evaluate(() => {
    // turn a notes fragment into Markdown
    const LABEL = { time: 'Time', say: 'Say', do: 'Do', ask: 'Ask', ans: 'Answer' };
    function inline(node) {
      let out = '';
      node.childNodes.forEach(n => {
        if (n.nodeType === 3) { out += n.textContent.replace(/\s+/g, ' '); return; }
        if (n.nodeType !== 1) return;
        const t = n.tagName.toLowerCase(), inner = inline(n);
        if (t === 'b' || t === 'strong') out += inner.trim() ? `**${inner.trim()}**` : '';
        else if (t === 'i' || t === 'em') out += inner.trim() ? `*${inner.trim()}*` : '';
        else if (t === 'code') out += '`' + n.textContent + '`';
        else if (t === 'br') out += '  \n';
        else if (t === 'a') out += `[${inner}](${n.getAttribute('href')})`;
        else out += inner;
      });
      return out;
    }
    function md(html) {
      const box = document.createElement('div');
      box.innerHTML = html || '';
      const parts = [];
      box.childNodes.forEach(n => {
        if (n.nodeType === 3) { if (n.textContent.trim()) parts.push(n.textContent.trim()); return; }
        if (n.nodeType !== 1) return;
        const t = n.tagName.toLowerCase();
        if (t === 'ul' || t === 'ol') {
          const items = Array.from(n.children).map((li, k) => (t === 'ol' ? `${k + 1}. ` : '- ') + inline(li).trim());
          parts.push(items.join('\n'));
        } else if (t === 'pre') {
          parts.push('```\n' + n.textContent.trim() + '\n```');
        } else {
          const cls = Array.from(n.classList).find(c => LABEL[c]);
          const text = inline(n).trim();
          if (!text) return;
          parts.push(cls ? `**${LABEL[cls]}:** ${text}` : text);
        }
      });
      return parts.join('\n\n');
    }
    function headline(s) {
      const h = s.el.querySelector('h1, h2, .big');
      if (!h) return '';
      const c = h.cloneNode(true);
      c.querySelectorAll('br').forEach(b => b.replaceWith(' '));
      return c.textContent.replace(/\s+/g, ' ').trim();
    }
    let t = 0;
    return Deck.sections.map((sec, si) => {
      const start = t; t += sec.minutes || 0;
      return {
        title: sec.title, minutes: sec.minutes, start, end: t, index: si,
        slides: sec.slides.map(s => ({ n: s.index + 1, title: s.title || s.id, head: headline(s), notes: md(s.notes), steps: s.maxStep })),
      };
    });
  });
  await browser.close();

  const clock = m => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`;
  const total = data.reduce((s, x) => s + (x.minutes || 0), 0);
  const nSlides = data.reduce((s, x) => s + x.slides.length, 0);
  let out = `# Teacher's script — Neural networks, hands-on\n\n`;
  out += `Slide-by-slide script for the ${total}-minute lecture (${nSlides} slides). It is generated from the speaker notes in the deck (\`tools/export_script.js\`), so it always matches \`lecture.html\`. For background on every topic, the task hint ladders and the Q&A cheat-sheet, read \`COACH_GUIDE.md\` first.\n\n`;
  out += `How to read it: **Say** is what to tell the class, **Do** is what to click or draw, **Ask** is a question for the class and **Answer** its answer. "Press →" means advance one build step. In the deck, P opens the presenter window with these notes, a timer and the next slide.\n\n`;
  out += `| # | Section | Minutes | Clock | Slides |\n|---|---|---|---|---|\n`;
  data.forEach(s => { out += `| ${s.index} | ${s.title} | ${s.minutes} | ${clock(s.start)}–${clock(s.end)} | ${s.slides[0] ? s.slides[0].n : ''}–${s.slides.length ? s.slides[s.slides.length - 1].n : ''} |\n`; });
  out += '\n';
  data.forEach(s => {
    out += `\n---\n\n## ${s.index} · ${s.title} — ${s.minutes} min (${clock(s.start)}–${clock(s.end)})\n\n`;
    s.slides.forEach(sl => {
      out += `### Slide ${sl.n} · ${sl.title}\n\n`;
      if (sl.head && sl.head !== sl.title) out += `*On screen:* ${sl.head}${sl.steps ? ` *(${sl.steps} build step${sl.steps > 1 ? 's' : ''})*` : ''}\n\n`;
      else if (sl.steps) out += `*(${sl.steps} build step${sl.steps > 1 ? 's' : ''})*\n\n`;
      out += (sl.notes || '_No notes._') + '\n\n';
    });
  });
  fs.writeFileSync(path.join(root, 'SCRIPT.md'), out);
  console.log(`SCRIPT.md: ${nSlides} slides, ${out.length} chars`);
})();
