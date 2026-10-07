import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('admin build emits one SPA page and no retired admin pages', () => {
  const manifest = JSON.parse(readFileSync('public/ui-manifest.json', 'utf8'));
  const adminPages = manifest.filter((page: { file: string }) => page.file.startsWith('admin'));
  const html = readFileSync('public/admin.html', 'utf8');

  assert.deepEqual(adminPages.map((page: { file: string }) => page.file).sort(), ['admin-login.html', 'admin.html']);
  for (const route of ['overview', 'users', 'user-detail', 'prompt', 'quota', 'settings', 'audit']) {
    assert.match(html, new RegExp(`data-admin-panel="${route}"`));
  }
  assert.match(html, /data-form="writing-prompts"/);
  assert.match(html, /data-form="speaking-prompts"/);
  assert.match(html, /<details class="prompt-row" data-prompt-row>/);
  assert.match(html, /data-prompt-name/);
  assert.doesNotMatch(html, /Quy tắc chấm dự kiến/);
  assert.match(html, /data-quota-chart/);
  assert.match(html, /Quota Writing mỗi ngày/);
  assert.doesNotMatch(html, /Lượt chấm mỗi học sinh mỗi tháng/);
  assert.match(html, /data-form="ai-api-settings"/);
  assert.match(html, /API chấm Writing/);
  assert.match(html, /API nghe lời học sinh nói/);
  assert.match(html, /API chấm Listening/);
  assert.doesNotMatch(html, /Thông tin hệ thống/);
  assert.doesNotMatch(html, /Môi trường hiện tại/);
});
