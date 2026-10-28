const { chromium } = require('playwright');

async function inspectHeroDetails() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 320, height: 750 } });
  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle' });

  for (const w of [320, 300, 280]) {
    await page.setViewportSize({ width: w, height: 750 });
    await page.waitForTimeout(300);

    const details = await page.evaluate(() => {
      const hero = document.getElementById('home');
      const items = Array.from(hero.querySelectorAll('*')).map(el => {
        const r = el.getBoundingClientRect();
        return {
          tag: el.tagName,
          cls: el.className,
          w: Math.round(r.width),
          h: Math.round(r.height),
          left: Math.round(r.left),
          right: Math.round(r.right),
          text: (el.innerText || '').slice(0, 35).replace(/\n/g, ' ')
        };
      });
      return items.filter(it => it.w > 0 && it.h > 0);
    });

    console.log(`\n=== WIDTH ${w} ===`);
    details.forEach(d => {
      if (d.right > w) {
        console.log(`OVERFLOW: ${d.tag}.${d.cls} right=${d.right} w=${d.w} max=${w} text="${d.text}"`);
      }
    });
  }

  await browser.close();
}

inspectHeroDetails().catch(console.error);
