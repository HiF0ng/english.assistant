import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { createDemoState } from '../../src/lib/domain';

const manifest = JSON.parse(readFileSync('public/ui-manifest.json', 'utf8'));

test('all teacher and student subpages have safe return links, including direct entry', async ({ page, request }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  for (const item of manifest.filter((item: {role: string}) => ['teacher', 'student'].includes(item.role))) {
    await page.goto(`/${item.file}`);
    const back = page.locator('[data-page-back]');
    if (item.file.endsWith('-dashboard.html')) { await expect(back).toHaveCount(0); continue; }
    await expect(back).toBeVisible();
    const target = new URL(await back.getAttribute('href') as string, page.url());
    expect(target.pathname).not.toBe(new URL(page.url()).pathname);
    expect((await request.get(target.href)).status()).toBe(200);
    expect(await back.evaluate(node => node.getBoundingClientRect().height)).toBeGreaterThanOrEqual(44);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  }
  expect(errors).toEqual([]);
});

for (const role of ['teacher', 'student']) {
  test(`${role} returns through assignment details to the exact class after reload`, async ({ page }) => {
    const fixture = createDemoState();
    fixture.classes.push({ id: 'second-class', name: 'Second class', description: '', code: 'SECOND' });
    fixture.assignments.push({ ...fixture.assignments[0], id: 'second-task', classId: 'second-class', title: 'Second class assignment' });
    await page.goto('/');
    await page.evaluate(data => localStorage.setItem('english-assistant.demo.v1', JSON.stringify(data)), fixture);
    await page.goto(`/${role}-classes.html`);
    await page.locator('.class-card').filter({ hasText: 'Second class' }).getByRole('link', { name: /Vào lớp học/ }).click();
    const classUrl = page.url();
    await expect(page.locator('[data-class-name]')).toHaveText('Second class');
    await page.locator('.tabs').getByRole('tab', { name: 'Bài tập', exact: true }).click();
    const listUrl = page.url();
    await expect(page.locator('#class-assignments-list .task-row')).toHaveCount(1);
    await expect(page.locator('#class-assignments-list')).toContainText('Second class assignment');
    await page.locator('#class-assignments-list h3 a').click();
    await expect(page).toHaveURL(new RegExp(`${role}-assignment-(detail|preview).html`));
    const detailUrl = page.url();
    if (role === 'student') {
      await page.getByRole('link', { name: /Bắt đầu làm bài/ }).click();
      await page.locator('[name="answer-0"]').fill('nine');
      await page.locator('[data-page-back]').click();
      await expect(page).toHaveURL(detailUrl);
    }
    await page.reload();
    await page.locator('[data-page-back]').click();
    await expect(page).toHaveURL(listUrl);
    if (role === 'teacher') {
      for (const label of ['Học sinh', 'Lịch trình', 'Cài đặt lớp']) {
        await page.locator('.tabs').getByRole('tab', { name: label, exact: true }).click();
        await expect(page.locator('[data-class-name]')).toHaveText('Second class');
      }
    }
    await page.locator('[data-page-back]').click();
    await expect(page).toHaveURL(/\/((teacher|student)-classes)\.html$/);
  });
}

  test('draft preview returns to the editor and external return URLs are ignored', async ({ page }) => {
    await page.goto('/teacher-assignment-new.html');
    await page.locator('[data-assignment-section]').first().getByLabel('Tên bài tập', { exact: true }).fill('Draft to continue');
    await page.getByRole('button', { name: 'Xem trước', exact: true }).click();
    await expect(page).toHaveURL(/teacher-assignment-preview.html/);
    await page.locator('[data-page-back]').click();
    await expect(page.locator('[data-assignment-section]').first().getByLabel('Tên bài tập', { exact: true })).toHaveValue('Draft to continue');
  for (const value of ['https://example.com/', '//example.com/', 'javascript:alert(1)', '/admin-users.html', '/teacher-assignments.html']) {
    await page.goto('/teacher-class-new.html?returnTo=' + encodeURIComponent(value));
    await expect(page.locator('[data-page-back]')).toHaveAttribute('href', 'teacher-classes.html');
  }
  await page.goto('/notifications.html?role=teacher');
  await page.locator('[data-page-back]').click();
  await expect(page).toHaveURL(/teacher-dashboard.html$/);
});

for (const role of ['teacher', 'student']) {
  test(`${role} class tabs keep the header and document stable and support history`, async ({ page }, info) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`/${role}-class-detail.html?id=class-foundation`);
    await expect(page.locator('#assignment-list .task-row')).toHaveCount(1);
    await expect(page.getByRole('link', { name: 'Chỉnh sửa lớp', exact: true })).toHaveCount(0);
    const header = await page.locator('.class-cover').elementHandle();
    const initial = await page.locator('.class-cover').boundingBox();
    const timeOrigin = await page.evaluate(() => performance.timeOrigin);
    const tabs = page.getByRole('tab');
    for (let i = 0; i < await tabs.count(); i++) {
      await tabs.nth(i).click();
      await expect(tabs.nth(i)).toHaveAttribute('aria-selected', 'true');
      expect(await page.evaluate(() => performance.timeOrigin)).toBe(timeOrigin);
      expect(await header!.evaluate(node => node === document.querySelector('.class-cover'))).toBe(true);
      expect(await page.locator('.class-cover').boundingBox()).toEqual(initial);
      await expect(page.locator('[data-class-panel]:visible')).toHaveCount(1);
    }
    if (role === 'teacher') {
      const form = page.locator('[data-form="class-settings"]');
      await form.getByLabel('Tên lớp', { exact: true }).fill('Lớp đã cập nhật');
      await page.getByRole('tab', { name: 'Tổng quan', exact: true }).click();
      await page.getByRole('tab', { name: 'Cài đặt lớp', exact: true }).click();
      await expect(form.getByLabel('Tên lớp', { exact: true })).toHaveValue('Lớp đã cập nhật');
      await form.getByRole('button', { name: 'Lưu thay đổi', exact: true }).click();
      await expect(page.locator('[data-class-name]')).toHaveText('Lớp đã cập nhật');
      expect(await page.evaluate(() => performance.timeOrigin)).toBe(timeOrigin);
    }
    await page.getByRole('tab', { name: 'Tổng quan', exact: true }).click();
    await page.getByRole('tab', { name: 'Bài tập', exact: true }).click();
    await page.goBack();
    await expect(page.getByRole('tab', { name: 'Tổng quan', exact: true })).toHaveAttribute('aria-selected','true');
    await page.goForward();
    await expect(page.getByRole('tab', { name: 'Bài tập', exact: true })).toHaveAttribute('aria-selected','true');
    await page.reload();
    await expect(page.getByRole('tab', { name: 'Bài tập', exact: true })).toHaveAttribute('aria-selected','true');
    await page.getByRole('tab', { name: 'Bài tập', exact: true }).focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('tab', { name: role === 'teacher' ? 'Học sinh' : 'Lịch học', exact: true })).toHaveAttribute('aria-selected','true');
    await page.screenshot({ path: `.qa/class-tabs-${role}-${info.project.name}.png`, fullPage: true });
    expect(errors).toEqual([]);
  });
}
