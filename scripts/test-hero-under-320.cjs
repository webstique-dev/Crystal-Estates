const { chromium } = require('playwright');

async function testHeroUnder320() {
  const browser = await chromium.launch();
  const widths = [280, 300, 320];

  for (const w of widths) {
    const page = await browser.newPage({ viewport: { width: w, height: 750 } });
    await page.goto('http://localhost:5174/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);

    const data = await page.evaluate((width) => {
      const hero = document.getElementById('home');
      const frame = document.querySelector('.hero-ref__frame');
      const title = document.querySelector('.hero-ref__title');
      const search = document.querySelector('.hero-search');
      const topBar = document.querySelector('.hero-ref__top-bar');
      const bottomRow = document.querySelector('.hero-ref__bottom-row');
      const statsCluster = document.querySelector('.hero-ref__stats-cluster');
      const discoverBtn = document.querySelector('.hero-ref__discover-btn');

      const getInfo = (el, name) => {
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        return {
          name,
          scrollW: el.scrollWidth,
          offsetW: el.offsetWidth,
          rectW: Math.round(rect.width),
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          exceeds: rect.right > width
        };
      };

      const heroElements = hero.querySelectorAll('*');
      const overflowing = [];
      heroElements.forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.right > width + 0.5) {
          overflowing.push({
            tag: el.tagName,
            cls: el.className,
            text: (el.innerText || '').slice(0, 30),
            right: Math.round(r.right),
            width: Math.round(r.width)
          });
        }
      });

      return {
        viewportWidth: width,
        docScrollW: document.documentElement.scrollWidth,
        bodyScrollW: document.body.scrollWidth,
        hero: getInfo(hero, 'hero'),
        frame: getInfo(frame, 'frame'),
        title: getInfo(title, 'title'),
        topBar: getInfo(topBar, 'topBar'),
        bottomRow: getInfo(bottomRow, 'bottomRow'),
        statsCluster: getInfo(statsCluster, 'statsCluster'),
        discoverBtn: getInfo(discoverBtn, 'discoverBtn'),
        search: getInfo(search, 'search'),
        overflowingInHero: overflowing
      };
    }, w);

    console.log(`=== WIDTH ${w}px ===`);
    console.log(JSON.stringify(data, null, 2));

    await page.screenshot({ path: `C:/Users/SHAN/.gemini/antigravity/brain/cd022fac-cf24-49a8-aeda-bf51f3f85d7d/hero-${w}.png` });
    await page.close();
  }

  await browser.close();
}

testHeroUnder320().catch(console.error);

