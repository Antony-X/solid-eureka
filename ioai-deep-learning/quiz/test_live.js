// End-to-end test of ml-checkin.html with a mocked `room`/`user` runtime:
// one host page and three player pages share an in-memory room relayed by Node.
//   NODE_PATH=$(npm root -g) node quiz/test_live.js
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const FILE = 'file://' + path.resolve(__dirname, 'ml-checkin.html');
const OUT = path.resolve(__dirname, '..', 'build', 'quiz');
fs.mkdirSync(OUT, { recursive: true });

const MOCK = (peerId, isHost) => `
(() => {
  const handlers = { game: [] }, peersH = [], connH = [];
  let peers = [];
  window.__deliverEmit = (topic, data, from) => (handlers[topic] || []).forEach(h => h({ topic, data, peer: from, by: null, isMe: from === '${peerId}', sameTab: from === '${peerId}', kind: 'viewer', guest: false }));
  window.__deliverPeers = list => {
    peers = Object.freeze(list.map(p => Object.freeze({ peer: p.peer, by: null, isMe: p.peer === '${peerId}', sameTab: p.peer === '${peerId}', kind: 'viewer', guest: false, presence: p.presence, updatedAt: Date.now() })));
    peersH.forEach(h => h({ peers, joined: [], left: [], updated: peers }));
  };
  const room = {
    emit: async (topic, data) => { if (!${isHost}) throw { code: 'not_permitted' }; await window.__emit(topic, data); },
    on: (topic, h) => { (handlers[topic] = handlers[topic] || []).push(h); return () => {}; },
    presence: async patch => { await window.__presence(patch); },
    peers: () => peers,
    onPeers: h => { peersH.push(h); setTimeout(() => h({ peers, joined: peers, left: [], updated: [] }), 0); return () => {}; },
    onConnection: h => { setTimeout(() => h(true), 0); return () => {}; },
    connected: () => true,
  };
  const user = { canEdit: async () => ${isHost}, isOwner: async () => ${isHost} };
  window.claude = { use: async n => n === 'room' ? room : n === 'user' ? user : null };
})();`;

(async () => {
  const browser = await chromium.launch();
  const pages = {};
  const presence = {};               // peer -> presence object
  const errors = [];
  const relayPeers = async () => {
    const list = Object.keys(presence).map(peer => ({ peer, presence: presence[peer] }));
    for (const p of Object.values(pages)) await p.evaluate(l => window.__deliverPeers && window.__deliverPeers(l), list).catch(() => {});
  };
  async function open(name, isHost, vw, vh) {
    const ctx = await browser.newContext({ viewport: { width: vw, height: vh } });
    const page = await ctx.newPage();
    page.on('pageerror', e => errors.push(name + ': ' + e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push(name + ': ' + m.text()); });
    await page.exposeFunction('__emit', async (topic, data) => {
      for (const p of Object.values(pages)) await p.evaluate(([t, d, f]) => window.__deliverEmit(t, d, f), [topic, data, name]).catch(() => {});
    });
    await page.exposeFunction('__presence', async patch => {
      presence[name] = Object.assign({}, presence[name] || {}, patch);
      await relayPeers();
    });
    await page.addInitScript(MOCK(name, isHost));
    await page.goto(FILE);
    await page.waitForTimeout(300);
    pages[name] = page;
    return page;
  }
  const host = await open('host', true, 1600, 900);
  const p1 = await open('ana', false, 390, 800);
  const p2 = await open('ben', false, 390, 800);
  const p3 = await open('cai', false, 390, 800);
  const shot = async (page, n) => page.screenshot({ path: path.join(OUT, n + '.png') });

  await shot(host, '01-home-host');
  await host.click('#go-host');
  for (const [p, nick] of [[p1, 'Ana'], [p2, 'Ben'], [p3, 'Cai']]) {
    await p.click('#go-join'); await p.fill('#nick', nick); await p.click('button[type=submit]');
  }
  await host.waitForTimeout(400);
  await shot(host, '02-lobby'); await shot(p1, '02-player-wait');
  await host.click('#start');
  await host.waitForTimeout(500);
  await shot(host, '03-host-question'); await shot(p1, '03-player-question');
  // answers: Q1 correct = index 1
  await p1.click('.tile[data-i="1"]'); await p1.waitForTimeout(300);
  await p2.click('.tile[data-i="0"]'); await p2.waitForTimeout(600);
  await shot(p1, '04-player-locked');
  await p3.click('.tile[data-i="1"]');
  await host.waitForTimeout(800);   // all answered → host reveals automatically
  await shot(host, '05-host-reveal'); await shot(p1, '05-player-correct'); await shot(p2, '05-player-wrong');
  await host.click('#board'); await host.waitForTimeout(300);
  await shot(host, '06-board');
  // play the rest quickly: everyone answers, ana always right, ben right on even questions
  const Q = await host.evaluate(() => 16);
  for (let q = 1; q < Q; q++) {
    await host.click('#next'); await host.waitForTimeout(250);
    const right = await host.evaluate(() => null);
    for (const [p, mode] of [[p1, 'right'], [p2, 'even'], [p3, 'wrong']]) {
      const tiles = await p.$$('.tile[data-i]');
      if (!tiles.length) continue;
      // find the correct answer index from the host's reveal later; just pick by mode using page data
      const idx = await p.evaluate(m => {
        const n = document.querySelectorAll('.tile[data-i]').length;
        return m;
      }, mode);
      const pick = mode === 'wrong' ? 3 : (mode === 'even' && q % 2) ? 3 : null;
      if (pick == null) {
        // read the correct index from a hidden copy of the questions: click each until host shows it? use known answers
        const ANS = [1, 2, 0, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 2, 1];
        await p.click(`.tile[data-i="${ANS[q]}"]`);
      } else await p.click(`.tile[data-i="${pick}"]`);
      await p.waitForTimeout(120);
    }
    await host.waitForTimeout(500);
    const hasBoard = await host.$('#board');
    if (hasBoard) await host.click('#board');
    await host.waitForTimeout(200);
  }
  await host.click('#next'); await host.waitForTimeout(500);
  await shot(host, '07-final'); await shot(p1, '07-player-final'); await shot(p2, '07-player-final-ben');
  // classroom mode on a fresh standalone page
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 } });
  const solo = await ctx.newPage();
  solo.on('pageerror', e => errors.push('solo: ' + e.message));
  await solo.goto(FILE); await solo.waitForTimeout(300);
  await shot(solo, '08-standalone-home');
  await solo.click('#go-class');
  for (let i = 0; i < 5; i++) await solo.click('.tilebtns button[data-i="1"][data-d="1"]');
  for (let i = 0; i < 2; i++) await solo.click('.tilebtns button[data-i="0"][data-d="1"]');
  await shot(solo, '09-class-count');
  await solo.click('#show'); await shot(solo, '10-class-show');
  console.log('errors:', errors.length ? errors : 'none');
  await browser.close();
})();
