import { chromium } from "playwright";

export async function generateMicrositeThumbnail(url: string) {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1200, height: 800 },
  });

  await page.goto(url, { waitUntil: "networkidle" });

  const buffer = await page.screenshot({
    fullPage: false,
    type: "jpeg",
    quality: 80,
  });

  await browser.close();

  return buffer;
}