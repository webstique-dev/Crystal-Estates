const { chromium } = require('playwright');

async function testWhatsAppIcons() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 400, height: 750 } });
  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  // Screenshot floating button
  const waFloat = await page.$('.wa-float');
  if (waFloat) {
    await waFloat.screenshot({ path: 'C:/Users/SHAN/.gemini/antigravity/brain/cd022fac-cf24-49a8-aeda-bf51f3f85d7d/wa-float-icon.png' });
  }

  // Scroll to contact form and screenshot button
  await page.evaluate(() => document.getElementById('contact').scrollIntoView());
  await page.waitForTimeout(600);

  const contactBtn = await page.$('.contact-form button[type="submit"]');
  if (contactBtn) {
    await contactBtn.screenshot({ path: 'C:/Users/SHAN/.gemini/antigravity/brain/cd022fac-cf24-49a8-aeda-bf51f3f85d7d/wa-contact-btn.png' });
  }

  await browser.close();
  console.log('Captured WhatsApp icon screenshots');
}

testWhatsAppIcons().catch(console.error);
