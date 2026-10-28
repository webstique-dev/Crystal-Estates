const { chromium } = require('playwright');

async function testFullPageUnder320() {
  const browser = await chromium.launch();
  const widths = [280, 300, 319, 320];

  for (const w of widths) {
    const page = await browser.newPage({ viewport: { width: w, height: 700 } });
    await page.goto('http://localhost:5174/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    const data = await page.evaluate((width) => {
      const docW = document.documentElement.scrollWidth;
      const clientW = document.documentElement.clientWidth;
      const bodyW = document.body.scrollWidth;

      const overflowing = [];
      document.querySelectorAll('*').forEach((el) => {
        if (['HTML', 'BODY', 'SCRIPT', 'STYLE', 'defs', 'path', 'linearGradient', 'stop', 'circle'].includes(el.tagName)) return;
        const r = el.getBoundingClientRect();
        if (r.right > width + 1 || r.left < -1) {
          overflowing.push({
            tag: el.tagName,
            cls: typeof el.className === 'string' ? el.className.slice(0, 30) : '',
            left: Math.round(r.left),
            right: Math.round(r.right),
            width: Math.round(r.width),
            text: (el.innerText || '').slice(0, 20).trim()
          });
        }
      });

      return {
        width,
        docW,
        clientW,
        bodyW,
        hasOverflow: docW > clientW || bodyW > clientW,
        overflowing: overflowing.filter(x => !x.cls.includes('marquee')).slice(0, 20)
      };
    }, w);

    console.log(JSON.stringify(data, null, 2));
    await page.close();
  }

  await browser.close();
}

testFullPageUnder320().catch(console.error);
