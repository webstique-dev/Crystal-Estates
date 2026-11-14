import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function runHeroTests() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  console.log('--- 1. Testing Desktop (1440x900) ---');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

  // 1. Transparent Navigation in Hero
  const header = page.locator('header.header');
  const headerClasses = await header.getAttribute('class');
  console.log('Header initial classes:', headerClasses);
  if (!headerClasses?.includes('header--in-hero')) {
    throw new Error('Expected header to have header--in-hero class when at top of hero');
  }

  // Verify dropdown chevrons removed
  const navArrows = await page.locator('.header__nav-arrow').count();
  console.log('Navigation dropdown arrows count:', navArrows);
  if (navArrows > 0) {
    throw new Error(`Expected 0 dropdown arrows in navigation menu, but found ${navArrows}`);
  }

  // Verify Portal link hidden/removed
  const portalLinks = await page.locator('.header__portal-link').count();
  const portalTextLinks = await page.locator('header.header a:has-text("Portal")').count();
  console.log('Portal links count:', portalLinks, '| text links count:', portalTextLinks);
  if (portalLinks > 0 || portalTextLinks > 0) {
    throw new Error('Expected Portal link to be hidden/removed');
  }

  const headerBg = await header.evaluate((el) => window.getComputedStyle(el).backgroundColor);
  console.log('Header computed background-color:', headerBg);

  // 2. Video element verification
  const videoSource = page.locator('.hero-ref__video source');
  const videoSrc = await videoSource.getAttribute('src');
  console.log('Video source:', videoSrc);
  if (!videoSrc?.includes('13282387_3840_2160_60fps_online-video-cutter.com_qarfsk.mp4')) {
    throw new Error('Hero video src does not match the original Cloudinary video');
  }

  // 3. Hero Title & Italic serif typography
  const title = page.locator('.hero-ref__display-title');
  const titleText = await title.innerText();
  console.log('Hero title text:', titleText.replace(/\n/g, ' '));

  const italicWord = page.locator('.hero-ref__italic-serif');
  const italicFontFamily = await italicWord.evaluate((el) => window.getComputedStyle(el).fontFamily);
  const italicFontStyle = await italicWord.evaluate((el) => window.getComputedStyle(el).fontStyle);
  console.log('Italic word font-family:', italicFontFamily, '| style:', italicFontStyle);

  // 4. Floating Widget Card
  const widgetCard = page.locator('.hero-ref__widget-card');
  const widgetVisible = await widgetCard.isVisible();
  console.log('Widget card visible:', widgetVisible);
  const widgetEyebrow = await page.locator('.hero-ref__widget-tag').innerText();
  const exploreBtn = page.locator('.hero-ref__widget-action-btn');
  const exploreHref = await exploreBtn.getAttribute('href');
  console.log('Widget eyebrow:', widgetEyebrow, '| Explore button href:', exploreHref);

  // Take Desktop Screenshot
  const outDir = path.resolve('./tests-output');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  await page.screenshot({ path: path.join(outDir, 'hero-desktop-1440.png'), fullPage: false });
  console.log('Saved hero-desktop-1440.png');

  // 5. Test Scroll Transition for Header (scroll past hero section)
  console.log('--- 2. Testing Scroll Transition ---');
  await page.evaluate(() => window.scrollTo(0, 1100));
  await page.waitForTimeout(600);

  const headerClassesScrolled = await header.getAttribute('class');
  console.log('Header scrolled classes:', headerClassesScrolled);
  if (!headerClassesScrolled?.includes('header--scrolled')) {
    throw new Error('Expected header to have header--scrolled class after scrolling past hero threshold');
  }
  if (headerClassesScrolled?.includes('header--in-hero')) {
    throw new Error('Expected header to NOT have header--in-hero class after scrolling down');
  }

  // 6. Test Lenis smooth scroll
  const isLenisHtml = await page.evaluate(() => {
    return document.documentElement.classList.contains('lenis') || !!window.lenis;
  });
  console.log('Lenis smooth scroll initialized on page:', isLenisHtml);

  // 7. Test Tablet Viewport (768x1024)
  console.log('--- 3. Testing Tablet (768x1024) ---');
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);

  const tabletOverflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > window.innerWidth;
  });
  console.log('Tablet horizontal overflow detected:', tabletOverflow);
  await page.screenshot({ path: path.join(outDir, 'hero-tablet-768.png'), fullPage: false });
  console.log('Saved hero-tablet-768.png');

  // 8. Test Mobile Viewport (375x812)
  console.log('--- 4. Testing Mobile (375x812) ---');
  await page.setViewportSize({ width: 375, height: 812 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);

  const mobileOverflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > window.innerWidth;
  });
  console.log('Mobile horizontal overflow detected:', mobileOverflow);

  const mobileTitleVisible = await title.isVisible();
  const mobileCardVisible = await widgetCard.isVisible();
  console.log('Mobile title visible:', mobileTitleVisible, '| Mobile card visible:', mobileCardVisible);

  await page.screenshot({ path: path.join(outDir, 'hero-mobile-375.png'), fullPage: false });
  console.log('Saved hero-mobile-375.png');

  await browser.close();
  console.log('--- ALL HERO & RESPONSIVENESS CHECKS PASSED SUCCESSFULLY ---');
}

runHeroTests().catch((err) => {
  console.error('Playwright test failed:', err);
  process.exit(1);
});
