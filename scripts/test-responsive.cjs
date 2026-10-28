const { chromium } = require('playwright');
const fs = require('fs');

async function testResponsive() {
  const browser = await chromium.launch();
  const widths = [320, 360, 375, 768, 1200];
  const results = {};

  for (const w of widths) {
    const page = await browser.newPage({ viewport: { width: w, height: 800 } });
    await page.goto('http://localhost:5174/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);

    const data = await page.evaluate((width) => {
      const docW = document.documentElement.scrollWidth;
      const clientW = document.documentElement.clientWidth;
      const bodyW = document.body.scrollWidth;
      
      const elements = Array.from(document.querySelectorAll('*'));
      const overflowing = [];

      for (const el of elements) {
        // skip html, body, svg defs, paths
        if (['HTML', 'BODY', 'path', 'defs', 'linearGradient', 'stop', 'SCRIPT', 'STYLE'].includes(el.tagName)) continue;
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) continue;
        
        // Check if element spills out of viewport
        if (rect.right > width + 1 || rect.left < -1) {
          overflowing.push({
            tag: el.tagName,
            cls: typeof el.className === 'string' ? el.className.split(' ').slice(0, 2).join(' ') : '',
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            width: Math.round(rect.width)
          });
        }
      }

      return {
        docW,
        clientW,
        bodyW,
        hasHorizontalScroll: docW > clientW,
        overflowCount: overflowing.length,
        overflowing: overflowing.slice(0, 15)
      };
    }, w);

    results[w] = data;
    await page.screenshot({ path: `responsive-${w}.png`, fullPage: true });
    await page.close();
  }

  await browser.close();
  console.log(JSON.stringify(results, null, 2));
}

testResponsive().catch(err => {
  console.error(err);
  process.exit(1);
});

