import { test, expect } from '@playwright/test';

test('images resize proportionally, stay centered and retain their size in drafts and previews', async ({ page }) => {
  await page.goto('/teacher-assignment-new.html');
  const editor = page.locator('[data-rich-content]').first();
  await editor.fill('Nội dung màu đen');
  await editor.press('End');
  const png = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 600; canvas.height = 300;
    canvas.getContext('2d')!.fillRect(0, 0, 600, 300);
    return canvas.toDataURL().split(',')[1];
  });
  await page.locator('[data-rich-image]').setInputFiles({ name:'chart.png', mimeType:'image/png', buffer:Buffer.from(png, 'base64') });
  const img = editor.locator('img');
  await expect(img).toBeVisible();
  await img.evaluate(element => element.scrollIntoView({block:'center', behavior:'instant'}));
  await img.click();
  const handle = page.locator('.rich-image-handle.se');
  await expect(handle).toBeVisible();
  const before = (await img.boundingBox())!;
  const grip = (await handle.boundingBox())!;
  await page.mouse.move(grip.x + grip.width / 2, grip.y + grip.height / 2);
  await page.mouse.down();
  await page.mouse.move(grip.x + grip.width / 2 - before.width / 4, grip.y + grip.height / 2, {steps:10});
  await page.mouse.up();
  const after = (await img.boundingBox())!;
  expect(after.width).toBeLessThan(before.width * .75);
  expect(after.width / after.height).toBeCloseTo(2, 1);
  const bounds = (await editor.boundingBox())!;
  expect(after.x + after.width / 2).toBeCloseTo(bounds.x + bounds.width / 2, 0);
  const width = await img.getAttribute('width');
  await expect(editor).toHaveCSS('color','rgb(0, 0, 0)');
  await page.getByRole('button',{name:'Lưu nháp',exact:true}).click();
  await page.reload();
  await expect(img).toHaveAttribute('width',width!);
  await img.click();
  await expect(handle).toBeVisible();
  await page.getByRole('button',{name:'Xem trước',exact:true}).click();
  const output = page.locator('.rich-output');
  await expect(output.locator('img')).toHaveAttribute('width',width!);
  await expect(output).toHaveCSS('color','rgb(0, 0, 0)');
  await expect(page.locator('.rich-image-resizer')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
});

for (const skill of ['Reading', 'Listening']) {
  test(`${skill}: real clicks keep initial text plain and do not activate Bold`, async ({ page }) => {
    await page.goto('/teacher-assignment-new.html');
    const section = page.locator('[data-assignment-section]').first();
    await section.locator('[data-section-skill]').selectOption(skill);
    const editor = section.locator('[data-rich-content]');
    const bold = section.getByRole('button', { name: 'In đậm', exact: true });
    // Clicking the blank editing surface must not activate its first toolbar button.
    await editor.click({ position: { x: 25, y: 30 } });
    await expect(editor).toBeFocused();
    await expect(bold).toHaveAttribute('aria-pressed', 'false');
    await page.keyboard.type('I want to ');
    await expect(editor.locator('b, strong, i, em, u')).toHaveCount(0);
    await bold.click();
    await page.keyboard.type('make');
    await bold.click();
    await expect(bold).toHaveAttribute('aria-pressed', 'false');
    await page.keyboard.type(' a cake');
    await expect(editor).toHaveText('I want to make a cake');
    await expect(editor.locator('b, strong')).toHaveText('make');

    // Select the word using actual mouse gestures, format, then click once to deselect.
    await editor.fill('I want to make a cake');
    const word = await editor.evaluate(element => {
      const range = document.createRange();
      range.setStart(element.firstChild!, 10);
      range.setEnd(element.firstChild!, 14);
      const rect = range.getBoundingClientRect();
      return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
    });
    await page.mouse.dblclick(word.x, word.y);
    await expect.poll(() => page.evaluate(() => getSelection()?.toString().trim())).toBe('make');
    await bold.click();
    await expect(editor.locator('b, strong')).toHaveText('make');
    // Count commands to ensure a surface click never forwards another click to Bold.
    await bold.evaluate(button => {
      button.setAttribute('data-click-count', '0');
      button.addEventListener('click', () => button.setAttribute('data-click-count', String(Number(button.getAttribute('data-click-count')) + 1)));
    });
    await editor.click({ position: { x: 25, y: 100 } });
    await expect.poll(() => page.evaluate(() => getSelection()?.isCollapsed)).toBe(true);
    await expect(bold).toHaveAttribute('data-click-count', '0');
    await expect(editor).toBeFocused();
    await expect(editor.locator('b, strong')).toHaveText('make');
  });
}
