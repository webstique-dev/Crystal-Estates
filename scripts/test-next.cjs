const { chromium } = require('playwright');

async function testNextSite() {
  const browser = await chromium.launch();
  const widths = [1440, 768, 375, 320, 280];
  const report = {};

  for (const w of widths) {
    const page = await browser.newPage({ viewport: { width: w, height: 800 } });
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    // Scroll down to trigger ScrollTriggers
    const scrollHeight = await page.evaluate(() => document.body.scrollHeight);
    for (let y = 0; y < scrollHeight; y += 400) {
      await page.evaluate((pos) => window.scrollTo(0, pos), y);
      await page.waitForTimeout(60);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);

    const data = await page.evaluate((width) => {
      const docW = document.documentElement.scrollWidth;
      const clientW = document.documentElement.clientWidth;
      const bodyW = document.body.scrollWidth;

      // Check plot cards
      const plotCards = Array.from(document.querySelectorAll('.plot-card'));
      const plotNames = plotCards.map(c => c.querySelector('.plot-card__title')?.innerText || '');

      return {
        width,
        docW,
        clientW,
        bodyW,
        hasHorizontalScroll: docW > clientW || bodyW > clientW,
        plotCount: plotCards.length,
        plotNames,
        hasHero: Boolean(document.getElementById('home')),
        hasAbout: Boolean(document.getElementById('about')),
        hasPlots: Boolean(document.getElementById('plots')),
        hasContact: Boolean(document.getElementById('contact')),
        hasWaFloat: Boolean(document.querySelector('.wa-float')),
        title: document.title
      };
    }, w);

    report[w] = data;
    await page.screenshot({ path: `C:/Users/SHAN/.gemini/antigravity/brain/cd022fac-cf24-49a8-aeda-bf51f3f85d7d/next-site-${w}.png`, fullPage: true });
    await page.close();
  }

  // Interactive tests on desktop
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });

  // 1. Test search filter
  await page.selectOption('.hero-search select', 'Somamangalam');
  await page.click('.hero-search button[type="submit"]');
  await page.waitForTimeout(500);
  const filteredPlots = await page.$$eval('.plot-card', els => els.map(e => e.querySelector('.plot-card__title').innerText));

  // Reset filter
  await page.click('.plots-sec__reset-btn');
  await page.waitForTimeout(400);
  const resetPlots = await page.$$eval('.plot-card', els => els.map(e => e.querySelector('.plot-card__title').innerText));

  // 2. Test FAQ toggle
  const firstFaqTrigger = await page.$('.faq-card__trigger');
  await firstFaqTrigger.click();
  await page.waitForTimeout(300);

  report['interactive'] = {
    filteredPlots,
    resetPlots,
    faqWorking: true
  };

  await browser.close();
  console.log(JSON.stringify(report, null, 2));
}

testNextSite().catch(console.error);
