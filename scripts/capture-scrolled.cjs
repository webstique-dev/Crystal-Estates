const { chromium } = require('playwright');

async function testWithScroll() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 320, height: 800 } });
  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  // Scroll down step by step to trigger all ScrollTriggers
  const scrollHeight = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < scrollHeight; y += 400) {
    await page.evaluate((pos) => window.scrollTo(0, pos), y);
    await page.waitForTimeout(100);
  }
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(600);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);

  await page.screenshot({ path: 'C:/Users/SHAN/.gemini/antigravity/brain/cd022fac-cf24-49a8-aeda-bf51f3f85d7d/responsive-320-scrolled.png', fullPage: true });

  // Also check individual section screenshots at 320px
  const sections = ['#home', '#about', '.team-sec', '#plots', '.features-sec', '#process', '#reviews', '#faq', '#contact', '.footer-ref'];
  for (const s of sections) {
    const el = await page.$(s);
    if (el) {
      const cleanName = s.replace(/[^a-zA-Z0-9]/g, '');
      await el.screenshot({ path: `C:/Users/SHAN/.gemini/antigravity/brain/cd022fac-cf24-49a8-aeda-bf51f3f85d7d/sec-320-${cleanName}.png` });
    }
  }

  await browser.close();
  console.log('Done scrolling and capturing screenshots');
}

testWithScroll().catch(console.error);
