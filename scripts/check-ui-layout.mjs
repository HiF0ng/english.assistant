// Run after starting the preview server: node scripts/check-ui-layout.mjs
import { chromium } from '@playwright/test';
import { existsSync, readFileSync } from 'node:fs';
const edge = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const manifest = JSON.parse(readFileSync(new URL('../public/ui-manifest.json', import.meta.url), 'utf8'));
const browser = await chromium.launch(existsSync(edge) ? { executablePath: edge } : {});
const failures = [];
try {
  for (const width of [320, 768]) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await context.newPage();
    for (const item of manifest) {
      const response = await page.goto(`http://127.0.0.1:3000/${item.file}`);
      const size = await page.evaluate(() => ({ width: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
      if (response.status() !== 200 || size.scroll > size.width + 1) failures.push({ file: item.file, status: response.status(), ...size });
    }
    console.log(`Checked ${manifest.length} pages at ${width}px`);
    await context.close();
  }
} finally { await browser.close(); }
if (failures.length) { console.error(failures); process.exitCode = 1; }
else console.log('PASS: no document horizontal overflow at 320px / 768px.');
