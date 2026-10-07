import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const manifest: { file: string; title: string; role: string }[] = JSON.parse(readFileSync('public/ui-manifest.json', 'utf8'));
const KEY = 'english-assistant.demo.v1';
async function navigate(page: Page, name: string) {
  const menu = page.getByRole('button', { name: 'Mở điều hướng' });
  if (await menu.isVisible() && await menu.getAttribute('aria-expanded') !== 'true') await menu.click();
  await page.locator('.sidebar nav').getByRole('link', { name, exact: true }).click();
}

test('role login, separate admin entry and no password persistence', async ({ page }, info) => {
  expect(manifest.some(item => item.file === 'pages.html')).toBe(false);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Hỗ trợ giáo viên,');
  await expect(page.locator('.studio-lead')).toHaveText('Hỗ trợ giáo viên và học sinh trên con đường chinh phục Tiếng Anh cùng công nghệ mới nhất từ Google và Microsoft');
  await expect(page.locator('.studio-hero-note')).toHaveCount(0);
  await expect(page.locator('.studio-kicker')).toHaveCount(0);
  await expect(page.getByText('Bấm các mục để khám phá', { exact: false })).toHaveCount(0);
  await expect(page.locator('.studio-skill')).toHaveCount(4);
  await expect(page.locator('.studio-skill a, .studio-skill p, .studio-skill .skill-arrow')).toHaveCount(0);
  await expect(page.locator('.mosaic-feedback blockquote')).toHaveCount(0);
  await expect(page.locator('.skill-chart')).toBeVisible();
  await expect(page.locator('.skill-chart figcaption')).toContainText('Đọc');
  await expect(page.locator('.studio-cta small')).toHaveCount(0);
  await page.goto('/teacher-dashboard.html');
  await expect(page.locator('.prototype-bar')).toHaveCount(0);
  await expect(page.getByText('Bản giao diện · Dữ liệu mẫu', { exact: true })).toHaveCount(0);
  await page.goto('/');
  const desktopPreview = await page.evaluate(() => window.innerWidth > 1000);
  const positions: number[] = [];
  // The hero is an explorable product screen, including keyboard access.
  for (const feature of ['classes', 'calendar', 'results', 'assignments']) {
    const control = page.locator(`[data-preview="${feature}"]`);
    await control.focus();
    await control.press('Enter');
    await expect(control).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator(`#preview-${feature}`)).toBeVisible();
    await expect(page.locator('.preview-panel:visible')).toHaveCount(1);
    if (desktopPreview) positions.push(await page.locator('.studio-intro').evaluate(element => element.getBoundingClientRect().top));
  }
  if (desktopPreview) expect(Math.max(...positions) - Math.min(...positions)).toBeLessThanOrEqual(1);
  await page.screenshot({ path: `.qa/ui-${info.project.name}-homepage.png`, fullPage: true, animations: 'disabled' });
  await page.goto('/login.html');
  await expect(page.getByRole('radio')).toHaveCount(2);
  await expect(page.getByText('Ghi nhớ đăng nhập', { exact: true })).toBeVisible();
  await expect(page.locator('.preview-note, .auth-bottom')).toHaveCount(0);
  await page.getByText('Học sinh', { exact: true }).click();
  await page.getByLabel('Email', { exact: true }).fill('student@example.test');
  await page.getByLabel('Mật khẩu', { exact: true }).fill('NotARealSecret123');
  await page.getByRole('button', { name: 'Hiện mật khẩu', exact: true }).click();
  await expect(page.getByLabel('Mật khẩu', { exact: true })).toHaveAttribute('type', 'text');
  await page.getByRole('button', { name: 'Ẩn mật khẩu', exact: true }).click();
  await page.screenshot({ path: `.qa/ui-${info.project.name}-login.png`, fullPage: true, animations: 'disabled' });
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
  await expect(page).toHaveURL(/student-dashboard.html/);
  expect(await page.evaluate(() => JSON.stringify({ ...localStorage, ...sessionStorage }))).not.toContain('NotARealSecret123');
  await page.goto('/register.html');
  await expect(page.getByText('Tôi đồng ý với Thông tin và điều khoản sử dụng', { exact: true })).toBeVisible();
  await expect(page.locator('.preview-note, .auth-bottom')).toHaveCount(0);
  await page.goto('/login.html');
  await page.getByText('Giáo viên', { exact: true }).click();
  await page.getByLabel('Email', { exact: true }).fill('teacher@example.test');
  await page.getByLabel('Mật khẩu', { exact: true }).fill('NotARealSecret123');
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
  await expect(page).toHaveURL(/teacher-dashboard.html/);
  await page.goto('/admin-login.html');
  await expect(page.getByRole('radio')).toHaveCount(0);
  await page.getByLabel('Email', { exact: true }).fill('admin@example.test');
  await page.getByLabel('Mật khẩu', { exact: true }).fill('NotARealSecret123');
  await page.getByRole('button', { name: /Đăng nhập/ }).click();
  await expect(page).toHaveURL(/admin.html#overview/);
  await page.screenshot({ path: `.qa/ui-${info.project.name}-admin.png`, fullPage: true, animations: 'disabled' });
});

test('teacher review queue is grouped under the class navigation', async ({ page }) => {
  await page.goto('/teacher-dashboard.html');
  const sidebarIsOffscreen = await page.locator('#sidebar').evaluate(sidebar => sidebar.getBoundingClientRect().right <= 0);
  if (sidebarIsOffscreen) await page.getByRole('button', { name: 'Mở điều hướng', exact: true }).click();
  await expect(page.locator('#teacher-class-submenu')).toBeHidden();
  await page.locator('.teacher-class-nav > .nav-group-trigger').click();
  await expect(page).toHaveURL(/teacher-classes\.html$/);
  await expect(page.locator('.page-back')).toHaveCount(0);
  await expect(page.locator('#teacher-class-submenu .nav-submenu-link')).toHaveCount(2);
  await expect(page.locator('#teacher-class-submenu .icon, #teacher-class-submenu b')).toHaveCount(0);
  const sidebarIsOffscreen2 = await page.locator('#sidebar').evaluate(sidebar => sidebar.getBoundingClientRect().right <= 0);
  if (sidebarIsOffscreen2) await page.getByRole('button', { name: 'Mở điều hướng', exact: true }).click();
  const reviewLink = page.getByRole('link', { name: /Bài tập chờ nhận xét/ });
  await expect(reviewLink).toBeVisible();
  await reviewLink.click();
  await expect(page).toHaveURL(/teacher-submissions\.html$/);
  await expect(page.getByRole('heading', { name: 'Bài tập chờ nhận xét', exact: true })).toBeVisible();
  await expect(page.locator('.page-back')).toHaveCount(0);
  await expect(page.locator('.nav-submenu-link.active')).toHaveCount(1);
  await expect(page.locator('.teacher-review-list-head select')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Xem lớp học', exact: true })).toBeVisible();
  await expect(page.locator('.teacher-review-hero')).toHaveCSS('color', 'rgb(255, 255, 255)');
});

test('student sidebar follows the compact teacher navigation style', async ({ page }) => {
  await page.goto('/student-dashboard.html');
  await expect(page.locator('.sidebar .nav-section')).toHaveCount(0);
  await expect(page.locator('.sidebar nav')).not.toContainText('Bài đã nộp');
  await expect(page.getByRole('link', { name: 'Tổng quan', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Lớp của tôi', exact: true })).toBeVisible();
});

test('student core pages use the same premium learning theme as teacher pages', async ({ page }) => {
  await page.goto('/student-dashboard.html');
  await expect(page.locator('.student-dashboard-hero')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Chào Lan Anh', exact: true })).toBeVisible();
  await expect(page.locator('.student-dashboard-stats .stat')).toHaveCount(3);
  await expect(page.getByRole('heading', { name: 'Bài tập cần làm', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Luyện tập theo kỹ năng', exact: true })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'GỢI Ý HÔM NAY', exact: true })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Lịch trình hôm nay', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Xem lịch trình', exact: true })).toHaveCount(2);
  await expect(page.getByRole('link', { name: 'Xem tất cả', exact: true })).toHaveAttribute('href', /student-class-detail\.html\?tab=assignments/);
  const assignmentCard = page.locator('.student-dashboard-assignment-card').first();
  if (await assignmentCard.count()) {
    await expect(assignmentCard).toBeVisible();
    await expect(assignmentCard).not.toContainText('Giờ Việt Nam');
    await expect(assignmentCard.locator('.badge, .skill-icon, .btn')).toHaveCount(0);
    await expect(assignmentCard).toHaveAttribute('href', /student-assignment-detail\.html/);
  }

  await page.goto('/student-classes.html');
  await expect(page.locator('.student-class-hero')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Lớp của tôi', exact: true })).toBeVisible();
  await expect(page.locator('[data-page-back]')).toHaveCount(0);
  await expect(page.locator('.student-class-hero-summary')).toContainText('Bài tập chờ làm');
  await expect(page.locator('.student-class-directory .search-field')).toBeVisible();
  await expect(page.locator('.student-class-grid .class-letter')).toHaveCount(0);
  await page.getByRole('button', { name: 'Tham gia lớp', exact: true }).click();
  const joinDialog = page.getByRole('dialog');
  await expect(joinDialog).toBeVisible();
  await expect(joinDialog.getByRole('heading', { name: 'Tham gia lớp học', exact: true })).toBeVisible();
  await expect(joinDialog.getByLabel('Mã lớp')).toBeVisible();
  await expect(joinDialog.getByLabel('Mật khẩu lớp')).toBeVisible();
  await joinDialog.getByRole('button', { name: 'Hủy', exact: true }).click();
  await expect(joinDialog).toBeHidden();

  await page.goto('/student-class-detail.html?tab=assignments');
  await expect(page.locator('.student-class-detail-hero')).toBeVisible();
  await expect(page.locator('.student-class-detail-hero + .class-tabs')).toBeVisible();
  await expect(page.locator('#class-tab-assignments')).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#class-panel-assignments')).toBeVisible();
  await expect(page.locator('#class-panel-overview')).toBeHidden();

  await page.goto('/student-profile.html');
  await expect(page.locator('.student-profile-hero')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Hành trình của riêng bạn', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Lưu thay đổi', exact: true })).toBeVisible();
});

test('student class detail separates actionable assignments from results and exposes documents', async ({ page }) => {
  const activeDeadline = new Date(Date.now() + 7 * 86400000).toISOString();
  const expiredDeadline = new Date(Date.now() - 7 * 86400000).toISOString();
  const data = {
    version: 1,
    classes: [{ id: 'class-student-overview', name: 'Lớp tổng quan', description: 'Lớp kiểm tra tổng quan.', code: 'OVERVIEW01' }],
    assignments: [
      { id: 'assignment-active', classId: 'class-student-overview', title: 'Bài đang chờ làm', skill: 'Reading', passage: 'Nội dung bài tập.', deadline: activeDeadline, questions: [{ id: 'question-active', text: 'Câu hỏi', accepted: ['A'] }] },
      { id: 'assignment-expired', classId: 'class-student-overview', title: 'Bài đã hết hạn', skill: 'Reading', passage: 'Nội dung bài tập.', deadline: expiredDeadline, questions: [{ id: 'question-expired', text: 'Câu hỏi', accepted: ['A'] }] },
      { id: 'assignment-submitted', classId: 'class-student-overview', title: 'Bài đã nộp', skill: 'Reading', passage: 'Nội dung bài tập.', deadline: activeDeadline, questions: [{ id: 'question-submitted', text: 'Câu hỏi', accepted: ['A'] }] },
    ],
    submissions: [{ id: 'submission-student-overview', assignmentId: 'assignment-submitted', answers: ['A'], submittedAt: new Date().toISOString(), correct: 1, total: 1, published: false }],
  };
  await page.goto('/');
  await page.evaluate(({ key, data }) => localStorage.setItem(key, JSON.stringify(data)), { key: KEY, data });
  await page.goto('/student-class-detail.html?id=class-student-overview');
  await expect(page.locator('.student-class-detail-hero .class-meta')).toHaveCount(0);
  await expect(page.getByRole('tab', { name: 'Tổng quan', exact: true })).toHaveCount(0);
  await expect(page.getByRole('tab', { name: 'Tài liệu', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Thông tin tham gia lớp', exact: true })).toHaveCount(0);
  const activeAssignments = page.locator('#class-assignments-list');
  await expect(activeAssignments).toContainText('Bài đang chờ làm');
  await expect(activeAssignments).not.toContainText('Bài đã hết hạn');
  await page.getByRole('tab', { name: 'Kết quả', exact: true }).click();
  const resultCard = page.locator('#student-class-results-list .student-result-card');
  await expect(resultCard).toHaveCount(2);
  const expiredResultCard = resultCard.filter({ hasText: 'Bài đã hết hạn' });
  await expect(expiredResultCard).toContainText('Thời gian nộp');
  await expect(expiredResultCard).toContainText('Điểm bài làm');
  await expect(expiredResultCard).toContainText('n/a');
  await expect(resultCard.locator('.badge.blue')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Xem bài làm', exact: true })).toHaveCount(1);
  const expiredBadge = page.locator('#student-class-results-list .badge.red');
  await expect(expiredBadge).toHaveText('Đã hết hạn nộp');
  await expect(expiredBadge).toHaveCSS('color', 'rgb(177, 58, 74)');
  await page.getByRole('tab', { name: 'Tài liệu', exact: true }).click();
  await expect(page.locator('[data-student-class-documents-list]')).toBeVisible();
  await expect(page.locator('.class-documents-empty')).toContainText('Giáo viên chưa chia sẻ tài liệu');
  await page.getByRole('tab', { name: 'Kết quả', exact: true }).click();
  await page.getByRole('link', { name: 'Xem bài làm', exact: true }).click();
  await expect(page.locator('#result-detail')).toContainText('Trả lời:');
  await expect(page.locator('#result-detail')).toContainText('Điểm và đáp án đúng sẽ xuất hiện sau khi công bố.');
});

test('teacher class directory keeps its hero description compact and routes from the class submenu', async ({ page }) => {
  await page.goto('/teacher-dashboard.html');
  const sidebarIsOffscreen = await page.locator('#sidebar').evaluate(sidebar => sidebar.getBoundingClientRect().right <= 0);
  if (sidebarIsOffscreen) await page.getByRole('button', { name: 'Mở điều hướng', exact: true }).click();
  await page.locator('.teacher-class-nav > .nav-group-trigger').click();
  await expect(page).toHaveURL(/teacher-classes\.html$/);
  const heroDescription = page.locator('.teacher-class-hero-copy > p:last-child');
  await expect(heroDescription).toHaveText('Tổ chức lớp, kết nối học sinh và theo dõi hành trình học tập trong một không gian duy nhất.');
  if (await page.evaluate(() => innerWidth >= 1280)) {
    await expect(heroDescription).toHaveCSS('white-space', 'nowrap');
    expect(await heroDescription.evaluate(node => node.scrollWidth <= node.clientWidth + 1)).toBe(true);
  }
});

test('teacher dashboard greeting stays on one desktop line and class cards keep hover clearance', async ({ page }) => {
  await page.goto('/teacher-dashboard.html');
  const greeting = page.locator('.teacher-dashboard-greeting');
  await expect(greeting).toHaveText('Xin chào Giáo viên mẫu, thầy/cô sẽ làm gì hôm nay?');
  const assignedMetric = page.locator('.teacher-dashboard-stats .stat').nth(2);
  await expect(assignedMetric).toContainText('Bài đã giao');
  await expect(assignedMetric.locator('[data-count="assignments"]')).toHaveText(/^\d+$/);
  const viewportWidth = await page.evaluate(() => innerWidth);
  if (viewportWidth > 1100) {
    await expect(greeting).toHaveCSS('white-space', 'nowrap');
    expect(await greeting.evaluate(node => node.scrollWidth <= node.clientWidth + 1)).toBe(true);
  }
  const track = page.locator('#class-summary.class-carousel-track');
  const card = track.locator('.class-card').first();
  await card.hover();
  const [trackBox, cardBox] = await Promise.all([track.boundingBox(), card.boundingBox()]);
  expect(trackBox).not.toBeNull();
  expect(cardBox).not.toBeNull();
  expect(cardBox!.y).toBeGreaterThanOrEqual(trackBox!.y);
});

test('create class and reading, autosave, submit, review and publish', async ({ page }, info) => {
  const exceptions: string[] = [];
  page.on('pageerror', error => exceptions.push(error.message));
  await page.goto('/teacher-dashboard.html');
  await expect(page.getByRole('heading', { name: 'Tổng quan', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Lịch trình hôm nay', exact: true })).toBeVisible();
  await expect(page.getByText('Lịch minh họa cho thiết kế.', { exact: true })).toHaveCount(0);
  await expect(page.locator('#assignment-list')).toHaveCount(0);
  await expect(page.locator('.sidebar .nav-section')).toHaveCount(0);
  await expect(page.locator('.sidebar nav .nav-link')).toHaveCount(3);
  await expect(page.getByRole('link', { name: 'Bài tập', exact: true })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Bài nộp', exact: true })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Học sinh', exact: true })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Lịch dạy', exact: true })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Báo cáo', exact: true })).toHaveCount(0);
  const paymentButton = page.getByRole('button', { name: 'Thanh toán', exact: true });
  const sidebarIsOffscreen = await page.locator('#sidebar').evaluate(sidebar => sidebar.getBoundingClientRect().right <= 0);
  if (sidebarIsOffscreen) await page.getByRole('button', { name: 'Mở điều hướng', exact: true }).click();
  await paymentButton.click();
  await expect(page.getByRole('dialog')).toContainText('Chức năng tạm thời chưa khả dụng.');
  await page.getByRole('dialog').getByRole('button', { name: 'Quay lại', exact: true }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.locator('#class-summary.class-carousel-track')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Xem lớp trước' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Xem lớp tiếp theo' })).toBeVisible();
  await page.screenshot({ path: `.qa/ui-${info.project.name}-dashboard.png`, fullPage: true, animations: 'disabled' });
  await navigate(page, 'Lớp học');
  await page.getByRole('link', { name: 'Tạo lớp mới' }).click();
  await expect(page.getByText('Mã lớp được sinh khi tạo mẫu.', { exact: false })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Lớp học có tổ chức hơn.', exact: true })).toHaveCount(0);
  await expect(page.getByLabel('Mật khẩu lớp', { exact: true })).toBeEnabled();
  await page.getByLabel('Mật khẩu lớp', { exact: true }).fill('lop-thu-nghiem-2026');
  await page.getByLabel('Tên lớp', { exact: true }).fill('IELTS lớp thử nghiệm');
  await page.getByLabel('Mô tả', { exact: true }).fill('Lớp tạo trong bài kiểm tra trình duyệt.');
  await page.getByRole('button', { name: 'Tạo lớp học', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'IELTS lớp thử nghiệm', exact: true })).toBeVisible();
  const trialClassId = await page.evaluate(key => JSON.parse(localStorage.getItem(key) || '{}').classes.find((item: { name: string }) => item.name === 'IELTS lớp thử nghiệm').id, KEY);
  const trialClass = page.locator('.class-card').filter({ hasText: 'IELTS lớp thử nghiệm' });
  await expect(trialClass.locator('.class-letter')).toHaveCount(0);
  await expect(trialClass.getByRole('link', { name: 'Vào lớp học', exact: true })).toBeVisible();
  await trialClass.getByRole('button', { name: 'Mời vào lớp', exact: true }).click();
  const invitationDialog = page.getByRole('dialog');
  await expect(invitationDialog.getByRole('heading', { name: 'Mời vào lớp', exact: true })).toBeVisible();
  const invitationLink = await invitationDialog.getByLabel('Link tham gia lớp học', { exact: true }).inputValue();
  const invitationCode = new URL(invitationLink).searchParams.get('code')!;
  await expect(invitationDialog.getByText('Mã lớp', { exact: true })).toBeVisible();
  await expect(invitationDialog.getByText('Mật khẩu lớp', { exact: true })).toBeVisible();
  await expect(invitationDialog.getByRole('link', { name: 'Mở trang tham gia', exact: true })).toHaveCount(0);
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await invitationDialog.getByRole('button', { name: 'Sao chép toàn bộ', exact: true }).click();
  await expect(page.locator('#toast')).toContainText('Đã sao chép thông tin mời vào lớp.');
  await page.goto(invitationLink);
  await expect(page.getByLabel('Mã lớp', { exact: true })).toHaveValue(invitationCode);
  await page.getByLabel('Mật khẩu lớp', { exact: true }).fill('sai-mat-khau');
  await page.getByRole('button', { name: 'Xem lớp mẫu', exact: true }).click();
  await expect(page.locator('#toast')).toContainText('Mật khẩu lớp chưa đúng.');
  await page.getByLabel('Mật khẩu lớp', { exact: true }).fill('lop-thu-nghiem-2026');
  await page.getByRole('button', { name: 'Xem lớp mẫu', exact: true }).click();
  await expect(page.getByRole('dialog').getByRole('heading', { name: 'Sẵn sàng tham gia lớp', exact: true })).toBeVisible();
  await page.goto('/teacher-classes.html');
  await page.reload();
  await expect(page.getByRole('heading', { name: 'IELTS lớp thử nghiệm', exact: true })).toBeVisible();
  for (const className of ['IELTS lớp carousel A', 'IELTS lớp carousel B']) {
    await page.goto('/teacher-class-new.html');
    await page.getByLabel('Tên lớp', { exact: true }).fill(className);
    await page.getByLabel('Mô tả', { exact: true }).fill('Lớp bổ sung để kiểm tra carousel tổng quan.');
    await page.getByRole('button', { name: 'Tạo lớp học', exact: true }).click();
    await expect(page.getByRole('heading', { name: className, exact: true })).toBeVisible();
  }
  await page.goto('/teacher-dashboard.html');
  const classTrack = page.locator('#class-summary.class-carousel-track');
  const trackBefore = await classTrack.evaluate(element => element.scrollLeft);
  await expect(page.getByRole('button', { name: 'Xem lớp tiếp theo' })).toBeEnabled();
  await page.getByRole('button', { name: 'Xem lớp tiếp theo' }).click();
  await expect.poll(() => classTrack.evaluate(element => element.scrollLeft)).toBeGreaterThan(trackBefore);
  await page.getByRole('button', { name: 'Xem lớp trước' }).click();
  await expect.poll(() => classTrack.evaluate(element => element.scrollLeft)).toBeLessThanOrEqual(trackBefore + 1);
  await page.goto(`/teacher-class-detail.html?id=${encodeURIComponent(trialClassId)}&tab=assignments`);
  await page.getByRole('link', { name: 'Tạo bài tập' }).first().click();
  await expect(page).toHaveURL(new RegExp(`teacher-assignment-new\\.html\\?classId=${encodeURIComponent(trialClassId)}`));
  await expect(page.getByText('01 · Thông tin', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Một bài tập tốt bắt đầu từ…', exact: true })).toHaveCount(0);
  await expect(page.getByText('Giáo viên luôn quyết định.', { exact: true })).toHaveCount(0);
  const assignmentInfo = page.locator('.assignment-info-panel');
  await expect(assignmentInfo.getByRole('heading', { name: 'Thông tin bài tập', exact: true })).toBeVisible();
  await expect(assignmentInfo).toContainText('Lớp nhận bài');
  await expect(assignmentInfo.locator('[data-primary-class-name]')).toHaveText('IELTS lớp thử nghiệm');
  await expect(page.getByLabel('Lớp nhận bài', { exact: true })).toHaveCount(0);
  await expect(assignmentInfo.getByLabel('Kỹ năng', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Có thể chọn nhiều lớp. Lớp hiện tại luôn nhận bài tập này.', { exact: true })).toHaveCount(0);
  const firstSection = page.locator('[data-assignment-section]').first();
  await expect(firstSection.getByRole('combobox', { name: 'Loại bài tập', exact: true })).toHaveValue('Reading');
  await expect(firstSection.getByRole('button', { name: 'In đậm' })).toBeVisible();
  await expect(firstSection.getByRole('button', { name: 'In nghiêng' })).toBeVisible();
  await expect(firstSection.getByRole('button', { name: 'Gạch chân' })).toBeVisible();
  await firstSection.getByLabel('Tên bài tập', { exact: true }).fill('Reading bài kiểm tra');
  const deadlineField = page.getByLabel('Hạn cuối nộp bài', { exact: true });
  await deadlineField.evaluate((input: HTMLInputElement) => { input.showPicker = () => { input.dataset.pickerOpened = 'true'; }; });
  await deadlineField.click({ position: { x: 24, y: 20 } });
  await expect(deadlineField).toHaveAttribute('data-picker-opened', 'true');
  await deadlineField.fill(new Date(Date.now() + 7 * 86400000 + 7 * 3600000).toISOString().slice(0, 16));
  await page.getByText('Chọn thêm lớp học', { exact: true }).click();
  await page.locator('.class-multiselect-option').filter({ hasText: 'IELTS lớp carousel A' }).locator('input').check();
  await expect(page.locator('[data-extra-classes-label]')).toHaveText('Đã chọn 1 lớp');
  await firstSection.getByRole('textbox', { name: 'Nội dung section' }).fill('The school opens at nine.');
  const firstQuestion = firstSection.locator('[data-assignment-question]').first();
  await firstQuestion.getByLabel('Nội dung câu hỏi', { exact: true }).fill('When does the school open?');
  await firstQuestion.getByLabel('Đáp án 1', { exact: true }).fill('nine');
  await firstQuestion.getByLabel('Đáp án 2', { exact: true }).fill('9');
  await firstQuestion.getByLabel('Đặt đáp án 1 là đáp án đúng').check();
  await firstQuestion.getByRole('button', { name: '+ Thêm câu trả lời' }).click();
  await expect(firstQuestion.locator('[data-assignment-option]')).toHaveCount(3);
  await firstQuestion.getByRole('button', { name: 'Xóa đáp án 3' }).click();
  await firstSection.getByRole('button', { name: '+ Thêm câu hỏi' }).click();
  await expect(firstSection.locator('[data-assignment-question]')).toHaveCount(2);
  await firstSection.locator('[data-assignment-question]').nth(1).getByRole('button', { name: 'Xóa câu hỏi' }).click();
  await page.getByRole('button', { name: '+ Thêm section' }).click();
  const secondSection = page.locator('[data-assignment-section]').nth(1);
  await secondSection.getByRole('combobox', { name: 'Loại bài tập', exact: true }).selectOption('Speaking');
  await secondSection.getByLabel('Tên bài tập', { exact: true }).fill('Speaking mở rộng');
  await secondSection.getByRole('textbox', { name: 'Nội dung section' }).fill('Describe your favorite place.');
  await expect(secondSection.getByText('Câu hỏi Reading', { exact: true })).toBeHidden();
  await page.getByRole('button', { name: 'Giao bài' }).click();
  await expect(page.locator('#class-assignments-list')).toContainText('Reading bài kiểm tra');
  const assignedClassNames = await page.evaluate(({ key, title }) => {
    const data = JSON.parse(localStorage.getItem(key) || '{}');
    return data.assignments.filter((item: { title: string }) => item.title === title).map((item: { classId: string }) => data.classes.find((classroom: { id: string }) => classroom.id === item.classId)?.name);
  }, { key: KEY, title: 'Reading bài kiểm tra' });
  expect(assignedClassNames).toEqual(expect.arrayContaining(['IELTS lớp thử nghiệm', 'IELTS lớp carousel A']));
  await page.goto(`/student-class-detail.html?id=${encodeURIComponent(trialClassId)}&tab=assignments`);
  await page.locator('#class-assignments-list .task-row').filter({ hasText: 'Reading bài kiểm tra' }).getByRole('link', { name: /Làm bài/ }).click();
  await page.getByRole('link', { name: /Bắt đầu làm bài/ }).click();
  await page.getByRole('radio', { name: 'nine', exact: true }).check();
  await page.reload();
  await expect(page.getByRole('radio', { name: 'nine', exact: true })).toBeChecked();
  await page.getByRole('button', { name: 'Nộp bài', exact: true }).click();
  await expect(page.locator('#class-panel-results').getByText('Chờ công bố', { exact: true })).toBeVisible();
  await expect(page.locator('#class-panel-results').getByText('1/1', { exact: true })).toHaveCount(0);
  await page.goto('/teacher-submissions.html');
  await page.getByRole('link', { name: /Xem bài/ }).click();
  await page.getByLabel('Nhận xét của giáo viên').fill('Rất tốt, tiếp tục phát huy!');
  await page.getByRole('button', { name: 'Công bố kết quả', exact: true }).click();
  await page.goto(`/student-class-detail.html?id=${encodeURIComponent(trialClassId)}&tab=results`);
  await expect(page.locator('#class-panel-results').getByText('1/1', { exact: true })).toBeVisible();
  await page.locator('#class-panel-results').getByRole('link', { name: /Xem kết quả/ }).click();
  await expect(page.getByText('Rất tốt, tiếp tục phát huy!', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText('1/1', { exact: true })).toBeVisible();
  await page.screenshot({ path: `.qa/ui-${info.project.name}-result.png`, fullPage: true, animations: 'disabled' });
  expect(exceptions).toEqual([]);
});

test('form validation, drafts, calendar, safe config and corrupted storage recovery', async ({ page }) => {
  await page.goto('/register.html');
  await page.getByLabel('Họ và tên', { exact: true }).fill('Người dùng mẫu');
  await page.getByLabel('Email', { exact: true }).fill('test@example.test');
  await page.getByLabel('Mật khẩu', { exact: true }).fill('NotARealSecret123');
  await page.getByLabel('Xác nhận mật khẩu', { exact: true }).fill('OtherSecret123');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Tạo tài khoản' }).click();
  await expect(page.locator('.form-error')).toContainText('khớp');
  await page.goto('/teacher-assignment-new.html');
  const draftSection = page.locator('[data-assignment-section]').first();
  await draftSection.getByRole('combobox', { name: 'Loại bài tập', exact: true }).selectOption('Writing');
  await expect(draftSection.getByText('Câu hỏi Reading', { exact: true })).toBeHidden();
  await draftSection.getByLabel('Tên bài tập', { exact: true }).fill('Writing nháp');
  const richContent = draftSection.getByRole('textbox', { name: 'Nội dung section' });
  await richContent.fill('Describe your learning goals.');
  await richContent.evaluate(element => {
    const text = element.firstChild!;
    const range = document.createRange();
    range.setStart(text, 0); range.setEnd(text, 8);
    const selection = document.getSelection()!;
    selection.removeAllRanges(); selection.addRange(range);
  });
  await draftSection.getByRole('button', { name: 'In đậm' }).click();
  await expect(richContent.locator('b, strong')).toHaveCount(1);
  await richContent.press('End');
  await draftSection.getByLabel('Tải ảnh lên nội dung').setInputFiles({ name: 'lesson.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64') });
  await expect(richContent.locator('img')).toHaveCount(1);
  await page.getByRole('button', { name: 'Xem trước', exact: true }).click();
  await expect(page.locator('#assignment-preview')).toContainText('Describe your learning goals.');
  await page.goto('/student-writing.html');
  await page.getByLabel('Nội dung bài viết').fill('Learning English is very useful.');
  await expect(page.locator('#word-count')).toHaveText('5 từ');
  await page.reload();
  await expect(page.getByLabel('Nội dung bài viết')).toHaveValue('Learning English is very useful.');
  await page.goto('/teacher-class-detail.html?tab=schedule');
  await page.getByRole('button', { name: 'Thêm lịch trình' }).click();
  const scheduleDialog = page.getByRole('dialog');
  await expect(scheduleDialog).toContainText('Thêm lịch trình');
  await expect(scheduleDialog.getByLabel('Tên lịch trình', { exact: true })).toBeVisible();
  await expect(scheduleDialog.getByLabel('Nội dung & ghi chú', { exact: true })).toBeVisible();
  await expect(scheduleDialog.locator('[data-schedule-attachment]')).toHaveCount(3);
  await expect(scheduleDialog).not.toContainText('Lưu bản nháp buổi học');
  await expect(scheduleDialog.getByRole('button', { name: 'Lưu lịch trình' })).toBeVisible();
  await scheduleDialog.getByRole('button', { name: 'Đóng hộp thoại' }).click();
  const calendarDeadline = new Date().toISOString();
  const previousMonthDeadline = new Date(new Date().getFullYear(), new Date().getMonth(), 0, 12).toISOString();
  await page.evaluate(({ key, calendarDeadline, previousMonthDeadline }) => {
    const data = JSON.parse(localStorage.getItem(key)!);
    data.assignments = [{ id: 'calendar-sync-assignment', classId: 'class-foundation', title: 'Bài tập đồng bộ lịch', skill: 'Reading', passage: 'Nội dung', deadline: calendarDeadline, questions: [{ id: 'calendar-sync-question', text: 'Câu hỏi lịch', options: ['Đúng', 'Sai'], accepted: ['Đúng'] }] }, { id: 'calendar-adjacent-assignment', classId: 'class-foundation', title: 'Bài tập tháng trước', skill: 'Reading', passage: 'Nội dung', deadline: previousMonthDeadline, questions: [{ id: 'calendar-adjacent-question', text: 'Câu hỏi tháng trước', options: ['Đúng', 'Sai'], accepted: ['Đúng'] }] }];
    localStorage.setItem(key, JSON.stringify(data));
  }, { key: KEY, calendarDeadline, previousMonthDeadline });
  await page.reload();
  await expect(page.getByRole('button', { name: 'Tháng trước' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Tháng sau' })).toBeVisible();
  await expect(page.locator('.legend')).toHaveCount(0);
  await expect(page.locator('#calendar')).not.toContainText('IELTS mẫu');
  await expect(page.locator('.deadline-event')).toHaveCount(2);
  await expect(page.locator('.deadline-event').filter({ hasText: 'Bài tập đồng bộ lịch' })).toContainText('Hạn nộp');
  await expect(page.locator('.calendar-cell.outside .deadline-event')).toContainText('Bài tập tháng trước');
  const currentMonth = await page.locator('#calendar-title').textContent();
  await page.getByRole('button', { name: 'Tháng sau' }).click();
  await expect(page.locator('#calendar-title')).not.toHaveText(currentMonth!);
  await page.getByRole('button', { name: 'Tháng trước' }).click();
  await expect(page.locator('#calendar-title')).toHaveText(currentMonth!);
  await page.goto('/admin.html#prompt');
  await page.locator('.prompt-collapse').first().locator(':scope > summary').click();
  await page.locator('.prompt-row').first().locator('summary').press('Enter');
  await expect(page.getByLabel('Part', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Prompt TA', { exact: true })).toBeVisible();
  await expect(page.getByText('Quy tắc chấm dự kiến', { exact: true })).toHaveCount(0);
  await page.goto('/admin.html#settings');
  const before = await page.evaluate(key => localStorage.getItem(key), KEY);
  await page.getByRole('button', { name: 'Đặt lại dữ liệu mẫu', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: /Hủy/ }).click();
  expect(await page.evaluate(key => localStorage.getItem(key), KEY)).toBe(before);
  await page.evaluate(key => localStorage.setItem(key, '{broken'), KEY);
  await page.reload();
  await expect(page.getByRole('alert')).toContainText('Dữ liệu mẫu');
  await page.getByRole('button', { name: 'Đặt lại dữ liệu mẫu', exact: true }).first().click();
  await page.getByRole('dialog').getByRole('button', { name: 'Đặt lại dữ liệu', exact: true }).click();
  await expect(page.getByRole('alert')).toHaveCount(0);
});

test('search, independent settings, notification roles and local audio preview', async ({ page }) => {
  await page.goto('/teacher-classes.html');
  await expect(page.locator('.toolbar [data-filter]')).toHaveCount(0);
  const searchAlignment = await page.locator('.search-field').evaluate(field => {
    const icon = field.querySelector('.icon')!.getBoundingClientRect();
    const box = field.getBoundingClientRect();
    return Math.abs((icon.top + icon.height / 2) - (box.top + box.height / 2));
  });
  expect(searchAlignment).toBeLessThanOrEqual(1);
  await page.getByRole('searchbox').fill('not-existing-class');
  await expect(page.locator('.filter-empty')).toBeVisible();
  await expect(page.locator('.class-card:visible')).toHaveCount(0);
  await page.getByRole('searchbox').fill('IELTS');
  await expect(page.locator('.class-card:visible')).toHaveCount(1);
  await page.goto('/settings.html');
  await expect(page.locator('.page-back-row')).toHaveCount(0);
  await expect(page.getByText('Email tổng hợp', { exact: true })).toHaveCount(0);
  await expect(page.locator('[data-teacher-avatar-file]')).toHaveAttribute('accept', 'image/png,image/jpeg,image/webp');
  await expect(page.getByRole('button', { name: 'Lưu thay đổi', exact: true })).toHaveCount(1);
  await page.getByLabel('Tên hiển thị').fill('Cô Minh');
  await page.getByLabel('Nhắc lịch học').uncheck();
  await page.locator('[data-teacher-avatar-file]').setInputFiles({ name: 'avatar.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64') });
  await expect(page.locator('[data-teacher-avatar] img')).toHaveCount(2);
  await page.getByRole('button', { name: 'Lưu thay đổi', exact: true }).click();
  await page.reload();
  await expect(page.getByLabel('Tên hiển thị')).toHaveValue('Cô Minh');
  await expect(page.getByLabel('Nhắc lịch học')).not.toBeChecked();
  await expect(page.locator('[data-teacher-avatar] img')).toHaveCount(2);
  await page.goto('/admin.html#prompt');
  await page.locator('.prompt-collapse').first().locator(':scope > summary').click();
  await page.locator('.prompt-row').first().locator('summary').press('Enter');
  const form = page.locator('form[data-form="writing-prompts"]');
  await form.getByLabel('Tên prompt', { exact: true }).fill('Writing Task 1');
  await form.getByLabel('Prompt TA', { exact: true }).fill('writing-task-achievement-demo');
  await form.getByRole('button', { name: 'Lưu prompt' }).click();
  await page.reload();
  await page.locator('.prompt-collapse').first().locator(':scope > summary').click();
  await page.locator('.prompt-row').first().locator('summary').press('Enter');
  await expect(form.getByLabel('Tên prompt', { exact: true })).toHaveValue('Writing Task 1');
  await expect(form.getByLabel('Prompt TA', { exact: true })).toHaveValue('writing-task-achievement-demo');
  await page.goto('/notifications.html?role=teacher');
  await expect(page.locator('.notification-item').nth(1)).toHaveAttribute('href', 'teacher-class-detail.html?tab=schedule');
  await page.goto('/notifications.html?role=admin');
  await expect(page.locator('a[href*="admin-"]')).toHaveCount(0);
  await expect(page.locator('.notification-item').nth(1)).toHaveAttribute('href', 'student-class-detail.html?tab=schedule');
  await page.goto('/student-speaking.html');
  const wave = Buffer.alloc(244);
  wave.write('RIFF'); wave.writeUInt32LE(236, 4); wave.write('WAVEfmt ', 8); wave.writeUInt32LE(16, 16);
  wave.writeUInt16LE(1, 20); wave.writeUInt16LE(1, 22); wave.writeUInt32LE(8000, 24);
  wave.writeUInt32LE(16000, 28); wave.writeUInt16LE(2, 32); wave.writeUInt16LE(16, 34);
  wave.write('data', 36); wave.writeUInt32LE(200, 40);
  await page.locator('[data-audio-preview]').setInputFiles({ name: 'sample.wav', mimeType: 'audio/wav', buffer: wave });
  await expect(page.locator('audio')).toBeVisible();
  await expect(page.locator('audio')).toHaveAttribute('src', /^blob:/);
});

test('teacher class detail emphasizes its assignment and student information', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.removeItem('english-assistant.demo.v1'));
  await page.goto('/teacher-class-detail.html');
  await expect(page.locator('.teacher-class-detail-hero .class-meta')).toContainText('Số học sinh');
  await expect(page.locator('[data-class-student-count]')).toHaveText(/^\d+$/);
  await expect(page.locator('[data-class-assignment-count]')).toHaveText(/^\d+$/);
  await expect(page.locator('[data-class-password-summary]')).toBeHidden();
  await expect(page.locator('.teacher-class-detail-summary > .btn')).toHaveCount(1);
  await expect(page.locator('.teacher-class-detail-hero')).toHaveCSS('color', 'rgb(255, 255, 255)');
  await expect(page.getByText('Nhóm học sinh mẫu', { exact: true })).toHaveCount(0);
  await expect(page.locator('.tabs a')).toHaveText(['Bài tập', 'Tài liệu', 'Học sinh', 'Lịch trình', 'Cài đặt lớp']);
  await expect(page.locator('#class-tab-assignments')).toHaveAttribute('aria-selected', 'true');
  const assignmentPanel = page.locator('#class-panel-assignments .class-assignment-panel').first();
  await expect(assignmentPanel).toBeVisible();
  await expect(assignmentPanel.locator('.class-assignment-row')).toHaveCount(0);
  await expect(assignmentPanel).not.toContainText('A visit to the library');
  await expect(assignmentPanel.locator('.skill-icon')).toHaveCount(0);
  await expect(assignmentPanel.getByRole('link', { name: 'Tạo bài tập', exact: true })).toBeVisible();
  await page.getByRole('tab', { name: 'Học sinh', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Học sinh trong lớp', exact: true })).toBeVisible();
  const studentTable = page.locator('#class-panel-students .class-students-table');
  await expect(studentTable.locator('thead')).toContainText('Điểm trung bình');
  await expect(studentTable.locator('thead')).toContainText('Hành động');
  await expect(studentTable).not.toContainText('IELTS Intensive');
  await expect(studentTable).not.toContainText('Chưa nộp bài');
  await expect(studentTable).not.toContainText('Đã nộp bài');
  await expect(studentTable.getByRole('button', { name: /Xem thông tin/ })).toHaveCount(4);
  await expect(studentTable.getByRole('button', { name: /Chỉnh sửa thông tin/ })).toHaveCount(4);
  await expect(studentTable.getByRole('button', { name: /Xóa .* khỏi lớp/ })).toHaveCount(4);
  await expect(studentTable.getByRole('columnheader', { name: 'Học sinh', exact: true })).not.toHaveCSS('text-align', 'center');
  await expect(studentTable.getByRole('columnheader', { name: 'Điểm trung bình', exact: true })).toHaveCSS('text-align', 'center');
  await expect(studentTable.getByRole('columnheader', { name: 'Hành động', exact: true })).toHaveCSS('text-align', 'center');
  await expect(studentTable.locator('tbody td:nth-child(2)').first()).toHaveCSS('text-align', 'center');
  await expect(studentTable.locator('tbody td:nth-child(3)').first()).toHaveCSS('text-align', 'center');
  const firstStudent = studentTable.locator('tbody tr').first();
  await firstStudent.getByRole('button', { name: /Xem thông tin/ }).click();
  await expect(page.getByRole('dialog')).toContainText('Thông tin học viên');
  await expect(page.getByRole('dialog')).toContainText('Nguyễn Lan Anh');
  await page.getByRole('dialog').getByRole('button', { name: 'Đóng', exact: true }).click();
  await firstStudent.getByRole('button', { name: /Chỉnh sửa thông tin/ }).click();
  await firstStudent.getByLabel('Tên học sinh').fill('Nguyễn Lan Anh mới');
  await firstStudent.getByLabel('Email học sinh').fill('lananh.moi@example.test');
  await firstStudent.getByRole('button', { name: 'Lưu', exact: true }).click();
  await expect(firstStudent).toContainText('Nguyễn Lan Anh mới');
  await firstStudent.getByRole('button', { name: /Xóa .* khỏi lớp/ }).click();
  await expect(page.getByRole('dialog')).toContainText('Bạn có muốn xóa học sinh');
  await expect(page.getByRole('dialog').getByRole('button', { name: 'Hủy', exact: true })).toBeVisible();
  await page.getByRole('dialog').getByRole('button', { name: 'Hủy', exact: true }).click();
  await expect(firstStudent).toContainText('Nguyễn Lan Anh mới');
  await firstStudent.getByRole('button', { name: /Xóa .* khỏi lớp/ }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Xóa', exact: true }).click();
  await expect(studentTable.locator('tbody tr')).toHaveCount(3);
  await expect(page.locator('[data-class-student-count]')).toHaveText('3');
});

test('assignment builder supports an assignment title, clean rich-text paste, and listening questions', async ({ page }) => {
  await page.goto('/teacher-assignment-new.html');
  const info = page.locator('.assignment-info-panel');
  await info.getByLabel('Tên bài tập', { exact: true }).fill('Bài kiểm tra nghe');
  const section = page.locator('[data-assignment-section]').first();
  const editor = section.getByRole('textbox', { name: 'Nội dung section' });
  await expect(section.getByRole('button', { name: 'Danh sách đánh số' })).toBeVisible();

  await editor.evaluate(element => {
    element.focus();
    const clipboard = new DataTransfer();
    clipboard.setData('text/plain', 'Nội dung được dán');
    clipboard.setData('text/html', '<strong>Nội dung được dán</strong>');
    element.dispatchEvent(new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData: clipboard }));
  });
  await expect(editor).toHaveText('Nội dung được dán');
  await expect(editor.locator('strong, b, em, i, u')).toHaveCount(0);

  await editor.fill('Alpha');
  await editor.press('End');
  const bold = section.getByRole('button', { name: 'In đậm' });
  await bold.click();
  await expect(bold).toHaveAttribute('aria-pressed', 'true');
  await editor.type(' bold');
  await bold.click();
  await expect(bold).toHaveAttribute('aria-pressed', 'false');
  await editor.type(' plain');
  await expect(editor.locator('strong, b')).not.toContainText('plain');
  await expect(bold).toHaveAttribute('aria-pressed', 'false');

  await section.getByRole('combobox', { name: 'Loại bài tập', exact: true }).selectOption('Listening');
  await expect(section.getByText('Câu hỏi Listening', { exact: true })).toBeVisible();
  const audio = section.getByLabel('Tải file bài nghe', { exact: true });
  await audio.setInputFiles({ name: 'sample.mp3', mimeType: 'audio/mpeg', buffer: Buffer.from('sample audio') });
  await expect(section.locator('[data-section-audio-name]')).toHaveText('Đã chọn: sample.mp3');
  await expect(section.locator('[data-section-audio-preview]')).toBeVisible();
});

test('teacher can assign writing and speaking without answer sections', async ({ page }) => {
  const deadline = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16);
  await page.goto('/');
  await page.evaluate(key => localStorage.removeItem(key), KEY);
  for (const [skill, title, content] of [
    ['Writing', 'Writing Task 2', 'Discuss whether students should study abroad.'],
    ['Speaking', 'Speaking Task 2', 'Describe a memorable journey.'],
  ]) {
    await page.goto('/teacher-assignment-new.html');
    const section = page.locator('[data-assignment-section]').first();
    await section.getByRole('combobox', { name: 'Loại bài tập', exact: true }).selectOption(skill);
    await expect(section.locator('[data-assignment-question-builder]')).toBeHidden();
    await section.getByLabel('Tên bài tập', { exact: true }).fill(title);
    await section.getByRole('textbox', { name: 'Nội dung section' }).fill(content);
    await page.getByLabel('Hạn cuối nộp bài', { exact: true }).fill(deadline);
    await page.getByRole('button', { name: 'Giao bài', exact: true }).click();
    await expect(page).toHaveURL(/teacher-class-detail\.html\?id=class-foundation&tab=assignments/);
  }
  const assignments = await page.evaluate(key => JSON.parse(localStorage.getItem(key) || '{}').assignments, KEY);
  expect(assignments).toEqual(expect.arrayContaining([
    expect.objectContaining({ title: 'Writing Task 2', skill: 'Writing', questions: [] }),
    expect.objectContaining({ title: 'Speaking Task 2', skill: 'Speaking', questions: [] }),
  ]));
  await page.reload();
  await expect(page.locator('#class-assignments-list')).toContainText('Writing Task 2');
  await expect(page.locator('#class-assignments-list')).toContainText('Speaking Task 2');
});

test('student can draft and submit a writing assignment in the workspace', async ({ page }) => {
  const deadline = new Date(Date.now() + 7 * 86400000).toISOString();
  const data = {
    version: 1,
    classes: [{ id: 'class-writing', name: 'Lớp viết', description: 'Lớp kiểm tra Writing.', code: 'WRITING001' }],
    assignments: [{ id: 'writing-workspace', classId: 'class-writing', title: 'Writing Task 2', skill: 'Writing', passage: 'Discuss the benefits of learning a second language.', deadline, questions: [] }],
    submissions: [],
  };
  await page.goto('/');
  await page.evaluate(({ key, data }) => localStorage.setItem(key, JSON.stringify(data)), { key: KEY, data });
  await page.goto('/student-reading.html?id=writing-workspace&classId=class-writing');
  const workspace = page.locator('#reading-workspace');
  const response = workspace.getByLabel('Nội dung bài viết');
  await expect(workspace.getByRole('heading', { name: 'Bài viết của bạn' })).toBeVisible();
  await expect(response).toBeVisible();
  await response.fill('Learning a second language builds confidence and opens new opportunities.');
  await expect(workspace.locator('[data-writing-assignment-count]')).toHaveText('10 từ');
  await page.getByRole('button', { name: 'Nộp bài viết', exact: true }).click();
  await expect(page).toHaveURL(/student-class-detail\.html\?id=class-writing&tab=results/);
  const submission = await page.evaluate(key => JSON.parse(localStorage.getItem(key) || '{}').submissions[0], KEY);
  expect(submission).toEqual(expect.objectContaining({ assignmentId: 'writing-workspace', response: 'Learning a second language builds confidence and opens new opportunities.', answers: [], correct: 0, total: 0 }));
});

test('teacher assignment cards show only the required details and can be deleted', async ({ page }) => {
  const deadline = new Date(Date.now() + 7 * 86400000).toISOString();
  const completedDeadline = new Date(Date.now() - 7 * 86400000).toISOString();
  await page.goto('/');
  await page.evaluate(({ key, deadline, completedDeadline }) => localStorage.setItem(key, JSON.stringify({
    version: 1,
    classes: [{ id: 'class-foundation', name: 'IELTS Foundation', description: 'Lớp kiểm tra.', code: 'IELTS01' }],
    assignments: [{ id: 'assignment-card-test', classId: 'class-foundation', title: 'Bài kiểm tra tuần 1', skill: 'Reading', passage: 'Nội dung', deadline, questions: [{ id: 'q1', text: 'Câu hỏi?', options: ['Đáp án', 'Phương án khác'], accepted: ['Đáp án'] }] }, { id: 'assignment-completed-test', classId: 'class-foundation', title: 'Bài kiểm tra đã hết hạn', skill: 'Reading', passage: 'Nội dung cũ', deadline: completedDeadline, questions: [{ id: 'q2', text: 'Câu hỏi cũ?', options: ['Đáp án', 'Phương án khác'], accepted: ['Đáp án'] }] }],
    submissions: [{ id: 'submission-card-test', assignmentId: 'assignment-card-test', answers: ['Đáp án'], submittedAt: deadline, correct: 1, total: 1, published: false }],
  })), { key: KEY, deadline, completedDeadline });
  await page.goto('/teacher-class-detail.html?tab=assignments');
  await expect(page.getByRole('heading', { name: 'Bài tập đang diễn ra', exact: true })).toBeVisible();
  const completedPanel = page.locator('#class-panel-assignments .class-completed-assignment-panel');
  await expect(completedPanel.getByRole('heading', { name: 'Bài tập đã hoàn thành', exact: true })).toBeVisible();
  await expect(completedPanel).toContainText('Bài kiểm tra đã hết hạn');
  await expect(completedPanel).toContainText('Đã hết hạn nộp');
  const card = page.locator('#class-panel-assignments .class-assignment-panel:not(.class-completed-assignment-panel) .class-assignment-row');
  await expect(card).toHaveCount(1);
  await expect(card).toContainText('Bài kiểm tra tuần 1');
  await expect(card).toContainText('Hạn nộp');
  await expect(card).toContainText('Đã nộp: 1/4');
  await expect(card.locator('.assignment-submission-count')).toHaveCSS('font-weight', '400');
  await expect(card).not.toContainText('Reading');
  await expect(card.getByRole('link', { name: 'Xem' })).toBeVisible();
  await expect(card.getByRole('link', { name: 'Chỉnh sửa bài tập: Bài kiểm tra tuần 1' })).toBeVisible();
  await expect(card.getByRole('button', { name: 'Xóa bài tập: Bài kiểm tra tuần 1' })).toBeVisible();
  await card.getByRole('link', { name: 'Chỉnh sửa bài tập: Bài kiểm tra tuần 1' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Chỉnh sửa bài tập');
  const editForm = page.locator('[data-form="assignment"]');
  await expect(editForm.locator('.assignment-info-panel').getByLabel('Tên bài tập', { exact: true })).toHaveValue('Bài kiểm tra tuần 1');
  await editForm.locator('.assignment-info-panel').getByLabel('Tên bài tập', { exact: true }).fill('Bài kiểm tra đã chỉnh sửa');
  await editForm.getByRole('button', { name: 'Lưu thay đổi' }).click();
  await expect(page).toHaveURL(/teacher-class-detail\.html\?.*tab=assignments/);
  await expect(card).toContainText('Bài kiểm tra đã chỉnh sửa');
  await card.getByRole('link', { name: 'Xem' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Bài kiểm tra đã chỉnh sửa');
  await expect(page.locator('[data-assignment-preview-deadline]')).toContainText('Hạn nộp');
  await expect(page.locator('body')).not.toContainText('Kiểm tra nội dung trước khi giao cho học sinh.');
  await expect(page.locator('.panel-head')).toHaveCount(0);
  await expect(page.locator('.preview-question input[type="radio"]:checked')).toHaveCount(1);
  await page.goto('/teacher-class-detail.html?tab=assignments');
  await card.getByRole('button', { name: 'Xóa bài tập: Bài kiểm tra đã chỉnh sửa' }).click();
  await expect(page.getByRole('dialog')).toContainText('Bạn có chắc chắn muốn xóa bài tập này?');
  await expect(page.getByRole('dialog').getByRole('button', { name: 'Quay lại' })).toBeVisible();
  await page.getByRole('dialog').getByRole('button', { name: 'Xóa', exact: true }).click();
  await expect(page.locator('#class-panel-assignments .class-assignment-panel:not(.class-completed-assignment-panel) .class-assignment-row')).toHaveCount(0);
});

test('teacher can delete a class only after confirming the destructive action', async ({ page }) => {
  const deadline = new Date(Date.now() + 7 * 86400000).toISOString();
  const data = {
    version: 1,
    classes: [{ id: 'class-delete-test', name: 'Lớp cần xóa', description: 'Lớp kiểm tra xóa.', code: 'DELETE01' }],
    assignments: [{ id: 'assignment-delete-test', classId: 'class-delete-test', title: 'Bài tập cần xóa', skill: 'Reading', passage: 'Nội dung', deadline, questions: [{ id: 'delete-question', text: 'Câu hỏi?', options: ['Đúng', 'Sai'], accepted: ['Đúng'] }] }],
    submissions: [{ id: 'submission-delete-test', assignmentId: 'assignment-delete-test', answers: ['Đúng'], submittedAt: deadline, correct: 1, total: 1, published: false }],
  };
  await page.goto('/');
  await page.evaluate(({ key, data }) => localStorage.setItem(key, JSON.stringify(data)), { key: KEY, data });
  await page.goto('/teacher-class-detail.html?id=class-delete-test&tab=settings');
  const deleteSection = page.locator('.class-danger-zone');
  await expect(deleteSection.getByRole('heading', { name: 'Xóa lớp' })).toBeVisible();
  await deleteSection.getByRole('button', { name: 'Xóa lớp' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('heading', { name: 'Bạn chắc chắn muốn xóa lớp này?' })).toBeVisible();
  await expect(dialog).toContainText('Hành động này không thể hoàn tác.');
  await dialog.getByRole('button', { name: 'Hủy' }).click();
  await expect(dialog).toBeHidden();
  await deleteSection.getByRole('button', { name: 'Xóa lớp' }).click();
  await dialog.getByRole('button', { name: 'Xóa', exact: true }).click();
  await expect(page).toHaveURL(/teacher-classes\.html/);
  await expect(page.locator('.class-card')).toHaveCount(0);
  const stored = await page.evaluate(key => JSON.parse(localStorage.getItem(key) || '{}'), KEY);
  expect(stored.classes).toEqual([]);
  expect(stored.assignments).toEqual([]);
  expect(stored.submissions).toEqual([]);
});

test('teacher can upload, preview and remove a class document', async ({ page }) => {
  const data = { version: 1, classes: [{ id: 'class-documents-test', name: 'Lớp tài liệu', description: 'Lớp kiểm tra tài liệu.', code: 'DOCS0001' }], assignments: [], submissions: [] };
  await page.goto('/');
  await page.evaluate(({ key, data }) => localStorage.setItem(key, JSON.stringify(data)), { key: KEY, data });
  await page.goto('/teacher-class-detail.html?id=class-documents-test&tab=documents');
  await expect(page.getByRole('tab', { name: 'Tài liệu' })).toHaveAttribute('aria-selected', 'true');
  await page.locator('.class-documents-panel').getByRole('button', { name: 'Tải tài liệu lên' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('heading', { name: 'Tải tài liệu lên' })).toBeVisible();
  await expect(dialog.locator('input[name="documentFile"]')).toHaveAttribute('accept', '.pdf,.doc,.docx');
  await dialog.getByLabel('Tên tài liệu').fill('Hướng dẫn lớp học');
  await dialog.locator('input[name="documentFile"]').setInputFiles({ name: 'huong-dan-lop.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4 sample') });
  await expect(dialog.locator('[data-class-document-file-name]')).toContainText('huong-dan-lop.pdf');
  await dialog.getByRole('button', { name: 'Tải tài liệu lên' }).click();
  await expect(page.locator('[data-class-documents-list]')).toContainText('Hướng dẫn lớp học');
  await expect(page.locator('[data-class-documents-list]')).toContainText('Ngày tải lên:');
  await page.reload();
  await expect(page.locator('[data-class-documents-list]')).toContainText('Hướng dẫn lớp học');
  await page.goto('/student-class-detail.html?id=class-documents-test&tab=documents');
  const studentDocument = page.locator('[data-student-class-documents-list] .class-document-item');
  await expect(studentDocument).toContainText('Hướng dẫn lớp học');
  const studentDownload = studentDocument.getByRole('link', { name: 'Tải xuống tài liệu Hướng dẫn lớp học' });
  await expect(studentDownload).toHaveAttribute('download', 'huong-dan-lop.pdf');
  await expect(studentDownload).toHaveAttribute('href', /^data:application\/pdf/);
  await page.goto('/teacher-class-detail.html?id=class-documents-test&tab=documents');
  await page.getByRole('button', { name: 'Xem tài liệu Hướng dẫn lớp học' }).click();
  await expect(dialog.getByRole('heading', { name: 'Xem trước tài liệu' })).toBeVisible();
  await expect(dialog).toHaveClass(/document-preview-dialog/);
  await expect(dialog.locator('.document-preview-frame')).toBeVisible();
  await dialog.getByRole('button', { name: 'Đóng', exact: true }).click();
  await page.getByRole('button', { name: 'Chỉnh sửa tài liệu Hướng dẫn lớp học' }).click();
  await dialog.getByLabel('Tên tài liệu').fill('Hướng dẫn đã cập nhật');
  await dialog.getByRole('button', { name: 'Lưu thay đổi' }).click();
  await expect(page.locator('[data-class-documents-list]')).toContainText('Hướng dẫn đã cập nhật');
  await page.getByRole('button', { name: 'Xóa tài liệu Hướng dẫn đã cập nhật' }).click();
  await expect(dialog.getByRole('heading', { name: 'Bạn muốn xóa tài liệu này?' })).toBeVisible();
  await expect(dialog).toContainText('Thao tác này không thể hoàn tác.');
  await dialog.getByRole('button', { name: 'Hủy' }).click();
  await expect(dialog).toBeHidden();
  await page.getByRole('button', { name: 'Xóa tài liệu Hướng dẫn đã cập nhật' }).click();
  await dialog.getByRole('button', { name: 'Xóa', exact: true }).click();
  await expect(page.locator('.class-documents-empty')).toBeVisible();
});

test('teacher can review an assignment result list and send its prepared notification', async ({ page }) => {
  const deadline = new Date(Date.now() + 7 * 86400000).toISOString();
  const data = {
    version: 1,
    classes: [{ id: 'class-foundation', name: 'IELTS Foundation', description: 'Lớp kiểm tra.', code: 'IELTS01' }],
    assignments: [{ id: 'assignment-results-test', classId: 'class-foundation', title: 'Bài kiểm tra kết quả', skill: 'Reading', passage: 'Nội dung', deadline, questions: [{ id: 'q1', text: 'Câu hỏi?', options: ['Đáp án đúng', 'Phương án khác'], accepted: ['Đáp án đúng'] }] }],
    submissions: [{ id: 'submission-results-test', assignmentId: 'assignment-results-test', answers: ['Đáp án đúng'], submittedAt: deadline, correct: 1, total: 1, published: false }],
  };
  await page.goto('/');
  await page.evaluate(({ key, data }) => localStorage.setItem(key, JSON.stringify(data)), { key: KEY, data });
  await page.goto('/teacher-assignment-preview.html?id=assignment-results-test&classId=class-foundation');
  await expect(page.locator('.preview-question .is-correct')).toContainText('Đáp án đúng');
  await expect(page.locator('.preview-question .is-correct input')).toHaveCSS('border-color', 'rgb(36, 89, 220)');
  await page.getByRole('link', { name: 'Xem kết quả', exact: true }).click();
  await expect(page).toHaveURL(/teacher-assignment-results\.html\?id=assignment-results-test/);
  await expect(page.locator('.assignment-results-table thead')).toContainText('Giáo viên chấm');
  await expect(page.locator('.assignment-results-table tbody tr')).toHaveCount(1);
  await expect(page.getByRole('link', { name: 'Xem bài làm', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Duyệt kết quả tự động', exact: true }).click();
  await expect(page.locator('#toast')).toContainText('Đã duyệt kết quả tự động');
  await page.getByRole('button', { name: 'Gửi kết quả HS', exact: true }).click();
  await expect(page.locator('#app-dialog')).toContainText('chưa gửi email hoặc thông báo thật');
});

test('teacher can review AI feedback for a submitted writing assignment', async ({ page }) => {
  const deadline = new Date(Date.now() + 7 * 86400000).toISOString();
  const data = {
    version: 1,
    classes: [{ id: 'class-writing-review', name: 'Lớp Writing', description: 'Lớp kiểm tra AI.', code: 'WRITING002' }],
    assignments: [{ id: 'assignment-writing-review', classId: 'class-writing-review', title: 'Writing Task 2', skill: 'Writing', passage: 'Discuss the role of technology in education.', deadline, questions: [] }],
    submissions: [{ id: 'submission-writing-review', assignmentId: 'assignment-writing-review', answers: [], response: 'Technology makes education more accessible for students around the world.', submittedAt: deadline, correct: 0, total: 0, published: false }],
  };
  await page.goto('/');
  await page.evaluate(({ key, data }) => localStorage.setItem(key, JSON.stringify(data)), { key: KEY, data });
  await page.goto('/teacher-assignment-results.html?id=assignment-writing-review&classId=class-writing-review');
  await expect(page.getByRole('heading', { name: 'Danh sách học sinh đã nộp', exact: true })).toBeVisible();
  await expect(page.locator('.assignment-results-table tbody tr')).toHaveCount(1);
  await expect(page.locator('.assignment-results-table thead')).toContainText('Chấm tự động');
  await page.getByRole('link', { name: 'Xem bài làm', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'AI Chấm Tự Động', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Chỉnh sửa từ AI', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Đề xuất chỉnh sửa từ AI', exact: true })).toBeVisible();
  await expect(page.getByText(/Điểm AI chấm tự động/)).toBeVisible();
  await expect(page.getByText('Điểm giáo viên chấm', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: /Lưu nhận xét mẫu/ })).toHaveCount(0);
  await expect(page.locator('body')).not.toContainText('Bài viết cần được giáo viên xem và nhận xét.');
  const score = page.locator('input[name="teacherScore"]');
  await score.fill('7.5');
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('english-assistant.ui.v2') || '{}')['teacher-score-submission-writing-review'])).toBe('7.5');
});

test('all HTML pages render, links resolve and mobile has no horizontal overflow', async ({ page, request }, info) => {
  test.setTimeout(120000);
  const errors: string[] = [];
  const links = new Set<string>();
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  expect(manifest).toHaveLength(42);
  for (const item of manifest) {
    const response = await page.goto(`/${item.file}`);
    expect(response?.status(), item.file).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    if (['login.html', 'register.html'].includes(item.file) && await page.locator('.auth-story').isVisible()) {
      const centers = await page.evaluate(() => {
        const story = document.querySelector('.auth-story')!.getBoundingClientRect();
        const content = document.querySelector('.auth-story-content')!.getBoundingClientRect();
        const graphic = document.querySelector('.auth-class-notes')!.getBoundingClientRect();
        return {
          story: story.left + story.width / 2,
          content: content.left + content.width / 2,
          graphic: graphic.left + graphic.width / 2,
        };
      });
      expect(Math.abs(centers.content - centers.story), `${item.file} content is off-center`).toBeLessThanOrEqual(1);
      expect(Math.abs(centers.graphic - centers.story), `${item.file} graphic is off-center`).toBeLessThanOrEqual(1);
    }
    if (!item.file.startsWith('admin-')) {
      await expect(page.locator('body')).not.toContainText(/admin|quản trị/i);
      await expect(page.locator('a[href*="admin-"]')).toHaveCount(0);
      const tinyText = await page.locator('body *').evaluateAll(nodes => nodes.filter(node =>
        node instanceof HTMLElement && node.getClientRects().length &&
        [...node.childNodes].some(child => child.nodeType === Node.TEXT_NODE && child.textContent?.trim()) &&
        !node.closest('script, style, .sr-only') &&
        parseFloat(getComputedStyle(node).fontSize) < 14
      ).map(node => `${node.tagName}.${node.className}: ${getComputedStyle(node).fontSize}`));
      expect(tinyText, `Small text on ${item.file}`).toEqual([]);
    }
    const overflow = await page.evaluate(() => ({ width: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
    expect(overflow.scroll, `${item.file} overflows ${overflow.width}px`).toBeLessThanOrEqual(overflow.width + 1);
    for (const href of await page.locator('a[href]').evaluateAll(anchors => anchors.map(a => new URL((a as HTMLAnchorElement).href)).filter(u => u.origin === location.origin).map(u => u.pathname))) links.add(href);
    if (['teacher-assignment-new.html', 'teacher-class-detail.html', 'student-profile.html', 'student-speaking.html'].includes(item.file)) await page.screenshot({ path: `.qa/ui-${info.project.name}-${item.file.replace('.html', '')}.png`, fullPage: true, animations: 'disabled' });
  }
  for (const href of links) expect((await request.get(href)).status(), href).toBe(200);
  for (const retired of ['/teacher-assignments.html', '/teacher-students.html', '/teacher-calendar.html', '/student-assignments.html', '/student-calendar.html', '/student-results.html']) {
    expect((await request.get(retired)).status(), retired).toBe(404);
  }
  expect((await request.get('/not-a-real-route')).status()).toBe(404);
  expect(errors).toEqual([]);
});
