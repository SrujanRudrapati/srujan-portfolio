// Phase V0 capture script. Run from the repo root: cp docs/v3/refs/capture.mjs ./.cap.mjs && node .cap.mjs && rm .cap.mjs
import { chromium } from '@playwright/test';
import fs from 'node:fs';
const OUT = '/Users/srujan/srujan-portfolio/docs/v3/refs';
const SITES = [
  ['eddy-naboulet', 'https://eddy-naboulet.dev/'],
  ['mijobello', 'https://mijobello.com/'],
  ['cartooneast', 'https://cartooneast.in/'],
  ['russellnumo', 'https://www.russellnumo.nl/'],
];
const VIEWS = [['desktop', 1440, 900, false], ['mobile', 390, 844, true]];
const STEPS = 8;
const browser = await chromium.launch({ headless: true });
const report = {};
for (const [name, url] of SITES) {
  report[name] = {};
  for (const [vname, w, h, mobile] of VIEWS) {
    const dir = `${OUT}/${name}/${vname}`;
    fs.mkdirSync(dir, { recursive: true });
    const ctx = await browser.newContext({
      viewport: { width: w, height: h }, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 1,
      recordVideo: { dir, size: { width: Math.min(w, 960), height: Math.round(Math.min(w, 960) * h / w) } },
      userAgent: mobile ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1' : undefined,
    });
    const page = await ctx.newPage();
    const r = { ok: true, shots: 0 };
    try {
      const t0 = Date.now();
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
      r.loadMs = Date.now() - t0;
      await page.screenshot({ path: `${dir}/00-load.png` });
      await page.waitForTimeout(3500); // let intro/boot finish
      await page.screenshot({ path: `${dir}/01-first.png` });
      r.info = await page.evaluate(() => {
        const fams = new Set(); const colors = new Set(); let maxFont = 0;
        for (const el of document.querySelectorAll('body *')) {
          const cs = getComputedStyle(el);
          if (el.childNodes.length && [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) {
            fams.add(cs.fontFamily.split(',')[0].trim()); colors.add(cs.color);
            maxFont = Math.max(maxFont, parseFloat(cs.fontSize));
          }
          if (cs.backgroundColor !== 'rgba(0, 0, 0, 0)') colors.add('bg:' + cs.backgroundColor);
        }
        const scripts = [...document.scripts].map(s => s.src).filter(Boolean);
        const g = window;
        return {
          title: document.title, scrollHeight: document.documentElement.scrollHeight,
          fonts: [...fams].slice(0, 12), colorCount: colors.size, colors: [...colors].slice(0, 30), maxFont,
          libs: { gsap: !!g.gsap, lenis: !!(g.lenis || document.documentElement.classList.contains('lenis')), three: !!g.THREE, scrollTrigger: !!g.ScrollTrigger },
          htmlClass: document.documentElement.className, links: [...document.querySelectorAll('a')].map(a => a.getAttribute('href')).filter(Boolean).slice(0, 40),
          nav: [...document.querySelectorAll('nav a, header a')].map(a => a.textContent.trim()).filter(Boolean).slice(0, 20),
          scripts: scripts.slice(0, 20),
          text: document.body.innerText.slice(0, 1500),
        };
      });
      for (let i = 1; i <= STEPS; i++) {
        await page.mouse.move(w / 2, h / 2);
        // wheel so smooth-scroll libraries respond
        for (let k = 0; k < 6; k++) { await page.mouse.wheel(0, h / 6); await page.waitForTimeout(80); }
        await page.waitForTimeout(900);
        await page.screenshot({ path: `${dir}/${String(i + 1).padStart(2, '0')}-step${i}.png` });
        r.shots++;
        r.lastScrollY = await page.evaluate(() => window.scrollY);
      }
      if (mobile && r.lastScrollY < 50) {
        // wheel ignored on touch; fall back to scrollTo
        for (let i = 1; i <= STEPS; i++) {
          await page.evaluate(([i, hh]) => window.scrollTo(0, i * hh), [i, h]);
          await page.waitForTimeout(900);
          await page.screenshot({ path: `${dir}/${String(i + 1).padStart(2, '0')}-step${i}.png` });
        }
        r.lastScrollY = await page.evaluate(() => window.scrollY);
        r.fallbackScroll = true;
      }
    } catch (e) { r.ok = false; r.error = String(e).slice(0, 300); }
    await ctx.close();
    report[name][vname] = r;
    // rename video
    for (const f of fs.readdirSync(dir)) if (f.endsWith('.webm') && f !== 'scroll.webm') fs.renameSync(`${dir}/${f}`, `${dir}/scroll.webm`);
  }
}
await browser.close();
fs.writeFileSync(`${OUT}/teardown.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(Object.fromEntries(Object.entries(report).map(([k, v]) => [k, Object.fromEntries(Object.entries(v).map(([a, b]) => [a, { ok: b.ok, err: b.error, loadMs: b.loadMs, y: b.lastScrollY }]))])), null, 1));
