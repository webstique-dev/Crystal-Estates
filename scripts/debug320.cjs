const { chromium } = require('playwright');

async function debug320() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 320, height: 800 } });
  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  const culprits = await page.evaluate(() => {
    const list = [];
    document.querySelectorAll('*').forEach(el => {
      if (['HTML', 'BODY', 'SCRIPT', 'STYLE', 'defs', 'path', 'linearGradient', 'stop', 'circle'].includes(el.tagName)) return;
      const rect = el.getBoundingClientRect();
      const sw = el.scrollWidth;
      const ow = el.offsetWidth;
      // If element is directly causing horizontal stretch or its offset/rect exceeds 320
      if (ow > 320 || sw > 320 || rect.right > 320.5) {
        list.push({
          tag: el.tagName,
          id: el.id,
          cls: typeof el.className === 'string' ? el.className : '',
          scrollW: sw,
          offsetW: ow,
          clientW: el.clientWidth,
          rectRight: Math.round(rect.right),
          rectWidth: Math.round(rect.width)
        });
      }
    });
    return list;
  });

  console.log(JSON.stringify(culprits, null, 2));
  await browser.close();
}

debug320().catch(console.error);
