import { createDemoState, readDemoState, submitAssignment, publishSubmission, gradeAnswers, generateClassCode, normalizeClassCodes } from './domain.js?v=20261001-3';

import { setupNavigation, navigationUrl } from './navigation.js?v=20260930-4';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const esc = (value = '') => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const KEY = 'english-assistant.demo.v1';
const UI_KEY = 'english-assistant.ui.v2';
const params = new URLSearchParams(location.search);
const page = document.body.dataset.page;
let role = document.body.dataset.role;
let state;
let dataError = false;
let ui = {};
let toastTimer;
let audioURL;
let editingClassStudent = '';
const feedbackImageFiles = new Map();
const studentSpeakingRecorders = new Map();
const date = value => new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date(value));
const dateOnly = value => new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date(value));
const go = value => { location.href = value; };
const id = () => crypto.randomUUID();
const link = (href, text, cls = 'text') => `<a class="btn ${cls}" href="${esc(href)}">${esc(text)} →</a>`;
const plainLink = (href, text, cls = 'text') => `<a class="btn ${cls}" href="${esc(href)}">${esc(text)}</a>`;
const badge = (text, cls = 'blue') => `<span class="badge ${cls}">${esc(text)}</span>`;
const blank = (title, text, href, label) => `<div class="empty"><h3>${esc(title)}</h3><p>${esc(text)}</p>${href ? link(href, label, 'primary') : ''}</div>`;
const icons = {
  book: '<path d="M12 7c-3-3-7-3-10-2v14c4-1 7-1 10 2 3-3 6-3 10-2V5c-3-1-7-1-10 2Zm0 0v14"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
  users: '<circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6m2 4a5 5 0 0 1 3 5"/>',
  file: '<path d="M14 2H5v20h14V7Zm0 0v5h5M8 12h8m-8 4h6"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 2v6m10-6v6M3 11h18m-13 4h2m4 0h2"/>',
  chart: '<path d="M3 3v18h18M7 16v-4m5 4V8m5 8V5"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M9 21h6"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="m9 3-1 3-3 1-2 4 2 2v4l4 2 2 3 4-2 3-1 1-4 2-3-2-4-3-1-2-3Z"/>',
  shield: '<path d="m12 2 9 4v6c0 6-9 10-9 10S3 18 3 12V6Z"/><path d="m8 12 3 3 5-6"/>',
  search: '<circle cx="10" cy="10" r="7"/><path d="m15 15 6 6"/>',
  plus: '<path d="M12 4v16M4 12h16"/>',
  audio: '<path d="M3 11v2m4-6v10m5-14v18m5-14v10m4-6v2"/>',
  mic: '<rect x="8" y="2" width="8" height="14" rx="4"/><path d="M5 10v3a7 7 0 0 0 14 0v-3M12 20v3m-4 0h8"/>',
  pen: '<path d="m16 3 5 5L8 21H3v-5ZM13 6l5 5"/>',
  logout: '<path d="M9 3H3v18h6m5-14 5 5-5 5M7 12h14"/>',
  menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
  list: '<path d="M9 6h12M9 12h12M9 18h12"/><circle cx="4.5" cy="6" r=".8" fill="currentColor" stroke="none"/><circle cx="4.5" cy="12" r=".8" fill="currentColor" stroke="none"/><circle cx="4.5" cy="18" r=".8" fill="currentColor" stroke="none"/>',
  orderedList: '<path d="M10 6h11M10 12h11M10 18h11"/><path d="M3 5h2v2M3 11h2v2M3 17h2v2"/>',
  alignLeft: '<path d="M4 6h16M4 10h10M4 14h16M4 18h10"/>',
  alignCenter: '<path d="M4 6h16M7 10h10M4 14h16M7 18h10"/>',
  alignRight: '<path d="M4 6h16M10 10h10M4 14h16M10 18h10"/>',
  alignJustify: '<path d="M4 6h16M4 10h16M4 14h16M4 18h16"/>',
  chevronDown: '<path d="m7 10 5 5 5-5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',
  eye: '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
};
const icon = (name, cls = '') => `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.book}</svg>`;
const assignmentActionIcon = (name) => name === 'edit'
  ? '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m14 4 6 6M4 20l4.5-1L19 8.5a2.1 2.1 0 0 0-3-3L5.5 16Z"/><path d="M4 20h16"/></svg>'
  : name === 'view'
    ? '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>'
    : name === 'download'
      ? '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12"/><path d="m7 10 5 5 5-5M5 21h14"/></svg>'
      : '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M10 11v6m4-6v6M9 7l1-3h4l1 3m-9 0 1 13h10l1-13"/></svg>';
const documentIcon = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z"/><path d="M14 3v6h6M8 13h8M8 17h6"/></svg>';
const defaultClassStudents = {
  'class-foundation': [
    { id: 'student-lan-anh', initials: 'LA', name: 'Nguyễn Lan Anh', email: 'lananh@example.test', average: '8.5' },
    { id: 'student-minh-hai', initials: 'MH', name: 'Trần Minh Hải', email: 'minhhai@example.test', average: '7.8' },
    { id: 'student-thao-nguyen', initials: 'TN', name: 'Lê Thảo Nguyên', email: 'thaonguyen@example.test', average: '—' },
    { id: 'student-dang-khoa', initials: 'ĐK', name: 'Phạm Đăng Khoa', email: 'dangkhoa@example.test', average: '—' },
  ],
};
function classStudents(classId) {
  const saved = ui.classRosters?.[classId];
  return Array.isArray(saved) ? saved.filter(student => student && typeof student.id === 'string' && typeof student.name === 'string' && typeof student.email === 'string') : (defaultClassStudents[classId] || []);
}
const studentCountForClass = classId => classStudents(classId).length;
function classDocuments(classId) {
  const saved = ui.classDocuments?.[classId];
  return Array.isArray(saved) ? saved.filter(document => document && typeof document.id === 'string' && typeof document.name === 'string') : [];
}
function scheduleDateKey(value) {
  const scheduledAt = new Date(value);
  if (!Number.isFinite(scheduledAt.getTime())) return '';
  const parts = new Intl.DateTimeFormat('en-US', { timeZone:'Asia/Ho_Chi_Minh', year:'numeric', month:'2-digit', day:'2-digit' }).formatToParts(scheduledAt);
  const values = Object.fromEntries(parts.filter(part => part.type !== 'literal').map(part => [part.type, part.value]));
  return values.year + '-' + values.month + '-' + values.day;
}
function savedSchedules() {
  const valid = schedule => schedule && typeof schedule.id === 'string' && typeof schedule.classId === 'string' && typeof schedule.title === 'string' && typeof schedule.date === 'string' && scheduleDateKey(schedule.date);
  const schedules = Array.isArray(ui.schedules) ? ui.schedules.filter(valid) : [];
  const legacySchedules = Object.entries(ui)
    .filter(([key, value]) => /^form-.*-schedule-\d+$/u.test(key) && value && typeof value === 'object' && typeof value.title === 'string' && typeof value.date === 'string')
    .map(([key, value]) => ({ id:'legacy-' + key, classId:state?.classes[0]?.id || '', title:value.title, date:value.date, note:typeof value.note === 'string' ? value.note : '' }))
    .filter(valid);
  return [...schedules, ...legacySchedules].sort((left, right) => Date.parse(left.date) - Date.parse(right.date));
}
function renderStudentTodaySchedule() {
  const panel = $('.student-schedule-panel');
  if (!panel) return;
  const oldItems = $$('.schedule-item', panel);
  const target = oldItems[0]?.parentElement || panel;
  oldItems.forEach(item => item.remove());
  const today = scheduleDateKey(new Date());
  const schedules = savedSchedules().filter(schedule => scheduleDateKey(schedule.date) === today && state?.classes.some(classroom => classroom.id === schedule.classId));
  const oldEmpty = $('.today-schedule-empty', target);
  if (oldEmpty) oldEmpty.remove();
  if (!schedules.length) {
    target.insertAdjacentHTML('beforeend', '<div class="today-schedule-empty"><h3>Hôm nay chưa có lịch</h3><p>Lịch học bạn tham gia sẽ hiển thị tại đây.</p></div>');
    return;
  }
  const scheduleMarkup = schedules.map(schedule => {
    const classroom = state.classes.find(item => item.id === schedule.classId);
    const time = new Intl.DateTimeFormat('vi-VN', { hour:'2-digit', minute:'2-digit', hour12:false, timeZone:'Asia/Ho_Chi_Minh' }).format(new Date(schedule.date));
    const detail = [classroom?.name, schedule.note].filter(Boolean).join(' · ');
    return '<article class="schedule-item"><div class="time-block">' + esc(time) + '</div><div><span class="badge blue">Lịch học</span><h3>' + esc(schedule.title) + '</h3><p>' + esc(detail || 'Lịch học của lớp') + '</p></div></article>';
  }).join('');
  target.insertAdjacentHTML('beforeend', scheduleMarkup);
}
const documentExtension = document => String(document.extension || document.fileName || '').split('.').pop().toLowerCase();
const fileAsDataUrl = file => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.addEventListener('load', () => resolve(String(reader.result)));
  reader.addEventListener('error', () => reject(reader.error));
  reader.readAsDataURL(file);
});
function renderClassDocuments(classId) {
  const target = $('[data-class-documents-list]');
  const studentTarget = $('[data-student-class-documents-list]');
  if (!target && !studentTarget) return;
  const documents = classDocuments(classId);
  if (target) target.innerHTML = documents.length
    ? `<div class="class-document-list-head"><h3>Danh sách tài liệu</h3><span>${documents.length} tài liệu</span></div><div class="class-document-grid">${documents.map(document => `<article class="class-document-item"><div><h3>${esc(document.name)}</h3><p>Ngày tải lên: ${dateOnly(document.uploadedAt)}</p></div><div class="class-document-actions"><button class="class-student-action view" type="button" data-action="view-class-document" data-class-id="${esc(classId)}" data-document-id="${esc(document.id)}" aria-label="Xem tài liệu ${esc(document.name)}" title="Xem tài liệu">${assignmentActionIcon('view')}</button><button class="class-student-action edit" type="button" data-action="edit-class-document" data-class-id="${esc(classId)}" data-document-id="${esc(document.id)}" aria-label="Chỉnh sửa tài liệu ${esc(document.name)}" title="Chỉnh sửa tài liệu">${assignmentActionIcon('edit')}</button><button class="class-student-action delete" type="button" data-action="delete-class-document" data-class-id="${esc(classId)}" data-document-id="${esc(document.id)}" aria-label="Xóa tài liệu ${esc(document.name)}" title="Xóa tài liệu">${assignmentActionIcon('delete')}</button></div></article>`).join('')}</div>`
    : '<div class="class-documents-empty"><h3>Chưa có tài liệu</h3><p>Tải lên tài liệu liên quan để giáo viên và học sinh theo dõi theo từng lớp.</p></div>';
  if (studentTarget) studentTarget.innerHTML = documents.length
    ? `<div class="class-document-list-head"><h3>Tài liệu giáo viên đã chia sẻ</h3><span>${documents.length} tài liệu</span></div><div class="class-document-grid">${documents.map(document => { const fileName = document.fileName || document.name; const download = document.contentUrl ? `<a class="class-student-action download" href="${esc(document.contentUrl)}" download="${esc(fileName)}" aria-label="Tải xuống tài liệu ${esc(document.name)}" title="Tải xuống tài liệu">${assignmentActionIcon('download')}</a>` : `<button class="class-student-action download" type="button" disabled aria-label="Không thể tải xuống tài liệu ${esc(document.name)}" title="Tệp gốc không còn khả dụng">${assignmentActionIcon('download')}</button>`; return `<article class="class-document-item"><div><h3>${esc(document.name)}</h3><p>Ngày tải lên: ${dateOnly(document.uploadedAt)}</p></div><div class="class-document-actions"><button class="class-student-action view" type="button" data-action="view-class-document" data-class-id="${esc(classId)}" data-document-id="${esc(document.id)}" aria-label="Xem tài liệu ${esc(document.name)}" title="Xem tài liệu">${assignmentActionIcon('view')}</button>${download}</div></article>`; }).join('')}</div>`
    : '<div class="class-documents-empty"><h3>Chưa có tài liệu</h3><p>Giáo viên chưa chia sẻ tài liệu cho lớp này.</p></div>';
}
function toast(message, error = false) {
  const node = $('#toast'); node.textContent = message; node.classList.toggle('error', error); node.hidden = false;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { node.hidden = true; }, 8000);
}
function showDialog(title, html, variant = '') {
  const dialog = $('#app-dialog');
  $('#dialog-title').textContent = title;
  $('#dialog-content').innerHTML = html;
  dialog.classList.toggle('document-preview-dialog', variant === 'document-preview');
  if (!dialog.open) dialog.showModal();
}
function getUI() {
  const raw = localStorage.getItem(UI_KEY);
  if (!raw) return {};
  const parsed = JSON.parse(raw);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Cấu hình mẫu không hợp lệ. Đặt lại dữ liệu mẫu để tiếp tục.');
  return parsed;
}
function saveUI(next, message = '') {
  try { ui = { ...getUI(), ...next }; localStorage.setItem(UI_KEY, JSON.stringify(ui)); if (message) toast(message); return true; }
  catch { toast('Không thể lưu vào trình duyệt. Kiểm tra quyền lưu dữ liệu hoặc đặt lại dữ liệu mẫu.', true); return false; }
}
function update(reducer, message) {
  try {
    const raw = localStorage.getItem(KEY);
    const next = reducer(raw ? readDemoState(raw) : createDemoState());
    localStorage.setItem(KEY, JSON.stringify(next)); state = next; dataError = false; renderData();
    if (message) toast(message); return true;
  } catch (error) { toast(error.message || 'Không thể lưu dữ liệu.', true); return false; }
}
function removeRetiredDefaultAssignment(currentState) {
  const retiredId = 'reading-library';
  if (!currentState.assignments.some(assignment => assignment.id === retiredId)) return currentState;
  return {
    ...currentState,
    assignments: currentState.assignments.filter(assignment => assignment.id !== retiredId),
    submissions: currentState.submissions.filter(submission => submission.assignmentId !== retiredId),
  };
}
function audit(action) {
  const logs = Array.isArray(ui.audit) ? ui.audit : [];
  saveUI({ audit: [{ action, role: role || 'Khách', at: new Date().toISOString() }, ...logs].slice(0, 100) });
}
try {
  ui = getUI();
  const raw = localStorage.getItem(KEY);
  const savedState = raw ? readDemoState(raw) : createDemoState();
  state = normalizeClassCodes(removeRetiredDefaultAssignment(savedState));
  if (!raw || state !== savedState) localStorage.setItem(KEY, JSON.stringify(state));
} catch {
  dataError = true;
  toast('Không đọc được dữ liệu mẫu đã lưu. Bạn có thể đặt lại dữ liệu mẫu.', true);
  const workspace = $('.workspace');
  if (workspace) workspace.insertAdjacentHTML('afterbegin', '<div class="notice" role="alert">Dữ liệu mẫu đã lưu không hợp lệ hoặc trình duyệt chặn lưu trữ. <button class="btn outline" data-action="reset-demo">Đặt lại dữ liệu mẫu</button></div>');
}

// Preview roles do not retain login passwords.
let suggestedRole = params.get('role');
try { suggestedRole ||= sessionStorage.getItem('ea.preview-role') || localStorage.getItem('ea.preview-role'); } catch { /* Role defaults to teacher without storage. */ }
if (['teacher', 'student'].includes(suggestedRole)) {
  const radio = $(`input[name="role"][value="${suggestedRole}"]`); if (radio) radio.checked = true;
}

if (page === 'notifications.html' && (params.get('role') || suggestedRole) === 'teacher') {
  role = 'teacher'; document.body.dataset.role = role;
  $('.sidebar nav').innerHTML = '<a class="nav-link" href="teacher-dashboard.html"><span>Tổng quan</span></a><div class="nav-group teacher-class-nav" data-class-navigation><a class="nav-link nav-group-trigger" href="teacher-classes.html"><span>Lớp học</span></a><div id="teacher-class-submenu" class="nav-submenu" hidden><a href="teacher-classes.html" class="nav-submenu-link"><span>Lớp học</span></a><a href="teacher-submissions.html" class="nav-submenu-link"><span>Bài tập chờ nhận xét</span></a></div></div><button class="nav-link nav-payment" type="button" data-action="payment" aria-label="Thanh toán"><span class="nav-payment-symbol" aria-hidden="true">₫</span><span>Thanh toán</span></button>';
  $('.nav-section')?.remove();
  $('.breadcrumb').textContent = 'Không gian giáo viên / Thông báo';
  $('.profile-link').href = 'settings.html';
  $('.profile-link .person strong').textContent = 'Giáo viên mẫu';
  $('.profile-link .person small').textContent = 'Giáo viên';
  const notices = $$('.notification-item');
  notices[1].href = 'teacher-class-detail.html?tab=schedule';
  notices[2].href = 'teacher-submissions.html';
}

function taskRows(assignments, emptyState = {}) {
  if (!assignments.length) return blank(emptyState.title || 'Chưa có bài tập phù hợp', emptyState.text || (role === 'student' ? 'Giáo viên chưa giao bài tập mới cho lớp này.' : 'Tạo bài mới hoặc thử một kỹ năng khác.'), emptyState.href ?? (role === 'teacher' ? 'teacher-assignment-new.html' : ''), emptyState.label || (role === 'student' ? '' : 'Tạo bài tập'));
  return assignments.map(item => {
    const submission = state.submissions.find(s => s.assignmentId === item.id);
    const expired = Date.parse(item.deadline) < Date.now();
    const classroom = state.classes.find(c => c.id === item.classId);
    const studentTotal = studentCountForClass(classroom?.id);
    const submittedCount = state.submissions.filter(s => s.assignmentId === item.id).length;
    const href = role === 'student' ? `student-assignment-detail.html?id=${encodeURIComponent(item.id)}&classId=${encodeURIComponent(item.classId)}` : `teacher-assignment-preview.html?id=${encodeURIComponent(item.id)}&classId=${encodeURIComponent(item.classId)}`;
    const isClassDetail = page?.endsWith('class-detail.html');
    const isStudentDashboard = role === 'student' && page === 'student-dashboard.html';
    if (isStudentDashboard) return `<a class="student-dashboard-assignment-card" href="${href}" data-searchable="${esc([item.title, classroom?.name, item.skill].join(' '))}" aria-label="Mở bài tập ${esc(item.title)}"><span class="student-dashboard-assignment-label">BÀI TẬP CẦN LÀM</span><h3>${esc(item.title)}</h3><p>${esc(classroom?.name)} · ${item.questions.length} câu</p><div><span>Hạn nộp ${date(item.deadline)}</span><strong>Mở bài tập <span aria-hidden="true">→</span></strong></div></a>`;
    const title = isClassDetail && role === 'teacher' ? `<h3><a href="${href}">${esc(item.title)}</a></h3>` : `${badge(item.skill)}<h3><a href="${href}">${esc(item.title)}</a></h3>`;
    const actionLabel = isClassDetail ? (role === 'teacher' ? 'Xem' : expired ? 'Xem bài' : 'Làm bài') : role === 'student' ? expired ? 'Xem bài' : 'Làm bài' : 'Xem trước';
    const taskFacts = isClassDetail
      ? `<p>Hạn nộp ${date(item.deadline)}</p>${expired ? badge('Đã hết hạn nộp', 'red') : ''}${role === 'teacher' ? `<p class="assignment-submission-count">Đã nộp: ${submittedCount}/${studentTotal}</p>` : ''}`
      : `<p>${esc(classroom?.name)} · ${item.questions.length} câu</p><p>Hạn nộp ${date(item.deadline)} · Giờ Việt Nam</p>`;
    const actions = isClassDetail && role === 'teacher'
      ? `<div class="class-assignment-actions">${plainLink(href, actionLabel, 'outline')}<a class="assignment-action-icon edit" href="teacher-assignment-new.html?edit=${encodeURIComponent(item.id)}&classId=${encodeURIComponent(item.classId)}" aria-label="Chỉnh sửa bài tập: ${esc(item.title)}" title="Chỉnh sửa bài tập">${assignmentActionIcon('edit')}</a><button class="assignment-action-icon delete" type="button" data-action="delete-assignment" data-assignment-id="${esc(item.id)}" aria-label="Xóa bài tập: ${esc(item.title)}" title="Xóa bài tập">${assignmentActionIcon('delete')}</button></div>`
      : role === 'student' && submission ? badge(submission.published ? 'Đã công bố' : 'Chờ công bố', submission.published ? 'green' : 'amber') : link(href, actionLabel, role === 'student' ? 'primary' : 'outline');
    return `<article class="task-row ${isClassDetail ? 'class-assignment-row' : ''}" data-searchable="${esc([item.title, classroom?.name, item.skill].join(' '))}">${isClassDetail ? '' : '<span class="skill-icon reading">R</span>'}<div class="task-info">${title}${taskFacts}</div>${actions}</article>`;
  }).join('');
}
function studentClassResultRows(assignments) {
  const relevant = assignments.filter(item => state.submissions.some(submission => submission.assignmentId === item.id) || Date.parse(item.deadline) < Date.now());
  if (!relevant.length) return blank('Chưa có kết quả', 'Hoàn thành bài tập hoặc chờ đến hạn nộp để xem các bài tại đây.', '', '');
  return `<div class="student-result-grid">${relevant.map(item => {
    const submission = state.submissions.find(candidate => candidate.assignmentId === item.id);
    const href = `student-assignment-detail.html?id=${encodeURIComponent(item.id)}&classId=${encodeURIComponent(item.classId)}`;
    const status = submission
      ? submission.published
        ? badge('Đã công bố', 'green')
        : badge('Chờ công bố', 'amber')
      : badge('Đã hết hạn nộp', 'red');
    const submittedAt = submission ? date(submission.submittedAt) : 'n/a';
    const score = submission?.published && item.questions.length ? `${submission.correct}/${submission.total}` : 'n/a';
    const action = submission ? plainLink(`student-result-detail.html?id=${encodeURIComponent(submission.id)}&classId=${encodeURIComponent(item.classId)}`, 'Xem kết quả', 'outline') : '';
    return `<article class="student-result-card"><h3><a href="${href}">${esc(item.title)}</a></h3><dl><div><dt>Thời gian nộp</dt><dd>${submittedAt}</dd></div><div><dt>Điểm bài làm</dt><dd>${score}</dd></div></dl><footer>${status}${action}</footer></article>`;
  }).join('')}</div>`;
}
function syncClassCarousel() {
  const track = $('#class-summary.class-carousel-track');
  if (!track) return;
  const previous = $('[data-action="class-prev"]');
  const next = $('[data-action="class-next"]');
  const status = $('#class-carousel-status');
  const update = () => {
    const cards = $$('.class-card', track);
    const columns = Math.max(1, Math.min(3, cards.length));
    track.style.setProperty('--carousel-columns', String(columns));
    track.style.setProperty('--carousel-gaps', `${Math.max(0, columns - 1) * 16}px`);
    const canScroll = track.scrollWidth > track.clientWidth + 1;
    previous.disabled = !canScroll || track.scrollLeft <= 1;
    next.disabled = !canScroll || track.scrollLeft + track.clientWidth >= track.scrollWidth - 1;
    const start = cards.length ? Math.min(cards.length, Math.floor(track.scrollLeft / Math.max(cards[0].offsetWidth + 16, 1)) + 1) : 0;
    const visible = cards.length ? Math.min(3, cards.length - start + 1) : 0;
    if (status) status.textContent = cards.length ? `Đang hiển thị lớp ${start} đến ${start + visible - 1} trên ${cards.length}.` : 'Chưa có lớp học.';
  };
  if (!track.dataset.carouselBound) { track.addEventListener('scroll', update, { passive: true }); track.dataset.carouselBound = 'true'; }
  update();
}

function showClassInvitation(classId) {
  const classroom = state?.classes.find(item => item.id === classId);
  if (!classroom) return toast('Không tìm thấy lớp học để tạo lời mời.', true);
  const joinUrl = new URL(`student-classes.html?join=1&class=${encodeURIComponent(classroom.id)}&code=${encodeURIComponent(classroom.code)}`, location.href).href;
  const invitation = [`Tham gia lớp: ${classroom.name}`, `Link tham gia: ${joinUrl}`, `Mã lớp: ${classroom.code}`, classroom.classPassword ? `Mật khẩu lớp: ${classroom.classPassword}` : ''].filter(Boolean).join('\n');
  const password = classroom.classPassword ? `<div class="invite-detail"><span>Mật khẩu lớp</span><code>${esc(classroom.classPassword)}</code></div>` : '';
  showDialog('Mời vào lớp', `<p>Chia sẻ thông tin dưới đây để học sinh tham gia lớp học.</p><div class="invite-details"><label class="field">Link tham gia lớp học<input class="invite-link-value" type="text" readonly value="${esc(joinUrl)}"></label><div class="invite-detail"><span>Mã lớp</span><code>${esc(classroom.code)}</code></div>${password}</div><div class="form-actions"><button class="btn primary" type="button" data-action="copy-class-invitation" data-invitation="${esc(invitation)}">Sao chép toàn bộ</button></div>`);
}

function openStudentJoinDialog() {
  const code = params.get('code') || '';
  showDialog('Tham gia lớp học', `<p>Nhập mã lớp và mật khẩu do giáo viên cung cấp để mở không gian học tập của bạn.</p><form data-form="join" class="student-join-form"><label class="field">Mã lớp<input name="code" type="text" value="${esc(code)}" placeholder="Ví dụ A7K9M2X4PQ" required maxlength="10" pattern="(?=.*[A-Z])(?=.*[0-9])[A-Z0-9]{10}" autocomplete="off"></label><label class="field">Mật khẩu lớp<input name="classPassword" type="password" placeholder="Mật khẩu do giáo viên cung cấp" autocomplete="current-password"></label><p class="caption">Lớp không đặt mật khẩu chỉ cần nhập mã lớp.</p><div class="form-actions"><button class="btn outline" type="button" data-action="close-dialog">Hủy</button><button class="btn primary" type="submit">Xem lớp mẫu</button></div></form>`);
  window.setTimeout(() => $('#dialog-content input[name="code"]')?.focus(), 0);
}

function openStudentAssignmentsDialog() {
  const now = Date.now();
  const assignments = (state?.assignments || []).filter(assignment => Date.parse(assignment.deadline) >= now && !state.submissions.some(submission => submission.assignmentId === assignment.id));
  const content = assignments.length
    ? '<p class="student-pending-intro">Chọn một bài tập để bắt đầu. Tiến độ làm bài sẽ được lưu trong trình duyệt.</p><div class="student-pending-assignment-list">' + assignments.map(assignment => {
      const classroom = state.classes.find(item => item.id === assignment.classId);
      const sectionCount = assignmentSections(assignment).length;
      const href = 'student-assignment-detail.html?id=' + encodeURIComponent(assignment.id) + '&classId=' + encodeURIComponent(assignment.classId);
      return '<article class="student-pending-assignment"><div><span class="badge blue">' + esc(assignment.skill) + '</span><h3>' + esc(assignment.title) + '</h3><p>' + esc(classroom?.name || 'Lớp học') + ' · ' + sectionCount + ' phần</p><small>Hạn nộp ' + esc(date(assignment.deadline)) + '</small></div><a class="btn primary" href="' + esc(href) + '">Làm bài</a></article>';
    }).join('') + '</div>'
    : '<div class="student-pending-empty"><h3>Chưa có bài tập chờ thực hiện</h3><p>Bạn đã hoàn thành các bài còn hạn hoặc giáo viên chưa giao bài mới.</p></div>';
  showDialog('Bài tập chờ thực hiện', content + '<div class="form-actions"><button class="btn outline" type="button" data-action="close-dialog">Đóng</button></div>');
  window.setTimeout(() => $('#dialog-content a.btn.primary')?.focus(), 0);
}

function studentInitials(student) {
  if (student.initials) return student.initials;
  return student.name.split(/\s+/).filter(Boolean).slice(-2).map(word => word[0]).join('').toUpperCase() || 'HS';
}
function renderClassStudents(classId) {
  const roster = classStudents(classId);
  const rows = roster.map(student => {
    const editing = editingClassStudent === `${classId}:${student.id}`;
    const identity = editing
      ? `<div class="class-student-edit-fields"><label><span class="sr-only">Tên học sinh</span><input data-class-student-name type="text" value="${esc(student.name)}" maxlength="100" autocomplete="name" aria-label="Tên học sinh"></label><label><span class="sr-only">Email học sinh</span><input data-class-student-email type="email" value="${esc(student.email)}" maxlength="254" autocomplete="email" aria-label="Email học sinh"></label></div>`
      : `<div class="person"><span class="avatar">${esc(studentInitials(student))}</span><div><strong>${esc(student.name)}</strong><small>${esc(student.email)}</small></div></div>`;
    const actions = editing
      ? `<div class="class-student-actions"><button class="btn primary" type="button" data-action="save-class-student" data-class-id="${esc(classId)}" data-student-id="${esc(student.id)}">Lưu</button><button class="btn outline" type="button" data-action="cancel-edit-class-student">Hủy</button></div>`
      : `<div class="class-student-actions"><button class="class-student-action view" type="button" data-action="view-class-student" data-class-id="${esc(classId)}" data-student-id="${esc(student.id)}" aria-label="Xem thông tin ${esc(student.name)}" title="Xem thông tin học sinh">${assignmentActionIcon('view')}</button><button class="class-student-action edit" type="button" data-action="edit-class-student" data-class-id="${esc(classId)}" data-student-id="${esc(student.id)}" aria-label="Chỉnh sửa thông tin ${esc(student.name)}" title="Chỉnh sửa thông tin học sinh">${assignmentActionIcon('edit')}</button><button class="class-student-action delete" type="button" data-action="delete-class-student" data-class-id="${esc(classId)}" data-student-id="${esc(student.id)}" aria-label="Xóa ${esc(student.name)} khỏi lớp" title="Xóa học sinh khỏi lớp">${assignmentActionIcon('delete')}</button></div>`;
    return `<tr data-class-student-id="${esc(student.id)}"><td>${identity}</td><td><strong>${esc(student.average || '—')}</strong></td><td>${actions}</td></tr>`;
  }).join('');
  $$('[data-class-student-rows]').forEach(target => { target.innerHTML = rows || '<tr><td colspan="3"><p class="class-students-empty">Lớp chưa có học sinh.</p></td></tr>'; });
}
function saveClassRoster(classId, roster, message) {
  const rosters = ui.classRosters && typeof ui.classRosters === 'object' && !Array.isArray(ui.classRosters) ? ui.classRosters : {};
  if (saveUI({ classRosters: { ...rosters, [classId]: roster } }, message)) {
    renderData();
    audit(message);
    return true;
  }
  return false;
}

function studentProfileBands() {
  const skillNames = ['Reading', 'Listening', 'Writing', 'Speaking'];
  const values = Object.fromEntries(skillNames.map(skill => [skill, []]));
  for (const submission of state?.submissions || []) {
    if (!submission?.published) continue;
    const assignment = state.assignments.find(item => item.id === submission.assignmentId);
    if (!assignment) continue;
    const sections = assignmentSections(assignment);
    let questionOffset = 0;
    let grades = null;
    if (Array.isArray(assignment.questions) && assignment.questions.length && Array.isArray(submission.answers)) {
      try { grades = gradeAnswers(assignment.questions, submission.answers); } catch {}
    }
    sections.forEach((section, index) => {
      const skill = skillNames.includes(section.skill) ? section.skill : '';
      const questions = Array.isArray(section.questions) ? section.questions : [];
      const saved = Number(ui['section-score-' + submission.id + '-' + index]);
      let band = Number.isFinite(saved) && saved >= 0 && saved <= 9 ? saved : null;
      if (band === null && questions.length && grades) {
        const correct = grades.details.slice(questionOffset, questionOffset + questions.length).filter(Boolean).length;
        band = Number((correct / questions.length * 9).toFixed(1));
      }
      if (band === null && sections.length === 1) {
        const teacherScore = Number(ui['teacher-score-' + submission.id]);
        if (Number.isFinite(teacherScore) && teacherScore >= 0 && teacherScore <= 9) band = teacherScore;
      }
      if (skill && band !== null) values[skill].push(band);
      questionOffset += questions.length;
    });
  }
  return Object.fromEntries(skillNames.map(skill => {
    const scores = values[skill];
    return [skill, scores.length ? Number((scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(1)) : null];
  }));
}

function savedStudentProfileFor(student) {
  const profile = ui['form-student-profile.html-profile-0'];
  if (!profile || typeof profile !== 'object') return {};
  const profileEmail = String(profile.email || '').trim().toLowerCase();
  const isCurrentStudent = student?.id === 'student-lan-anh' || (profileEmail && profileEmail === String(student?.email || '').trim().toLowerCase());
  return isCurrentStudent ? profile : {};
}

function studentSkillSummaryMarkup(bands) {
  const entries = Object.entries(bands);
  const skills = '<div class="student-modal-skill-list">' + entries.map(([skill, score]) => '<span><small>' + esc(skill) + '</small><strong>' + (score === null ? '—' : score.toFixed(1)) + '</strong></span>').join('') + '</div>';
  return skills + studentProfileRadar(bands);
}

function studentProfileRadar(bands) {
  const entries = Object.entries(bands);
  const available = entries.filter(([, score]) => score !== null);
  if (!available.length) return '<div class="student-skill-empty"><strong>Chưa có kết quả đã chấm</strong><p>Radar sẽ xuất hiện sau khi giáo viên công bố kết quả bài làm.</p></div>';
  const cx = 130;
  const cy = 124;
  const radius = 75;
  const point = (ratio, index) => {
    const angle = -Math.PI / 2 + index * Math.PI / 2;
    return [cx + Math.cos(angle) * radius * ratio, cy + Math.sin(angle) * radius * ratio];
  };
  const polygon = ratio => entries.map((_, index) => point(ratio, index).map(value => value.toFixed(1)).join(',')).join(' ');
  const plotPoints = entries.map(([, score], index) => point((score || 0) / 9, index).map(value => value.toFixed(1)).join(',')).join(' ');
  const axes = entries.map((_, index) => {
    const [x, y] = point(1, index);
    return '<line x1="' + cx + '" y1="' + cy + '" x2="' + x.toFixed(1) + '" y2="' + y.toFixed(1) + '"></line>';
  }).join('');
  const labels = entries.map(([skill, score], index) => {
    const [x, y] = point(1.29, index);
    const anchor = index === 1 ? 'start' : index === 3 ? 'end' : 'middle';
    return '<text x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" text-anchor="' + anchor + '"><tspan>' + esc(skill) + '</tspan><tspan x="' + x.toFixed(1) + '" dy="14">' + (score === null ? '—' : score.toFixed(1)) + '</tspan></text>';
  }).join('');
  const dots = entries.map(([, score], index) => {
    const [x, y] = point((score || 0) / 9, index);
    return score === null ? '' : '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="3.7"></circle>';
  }).join('');
  return '<div class="student-skill-list" aria-label="Band điểm theo kỹ năng">' + entries.map(([skill, score]) => '<div><span>' + esc(skill) + '</span><strong>' + (score === null ? '—' : score.toFixed(1)) + '</strong></div>').join('') + '</div><section class="student-radar-card"><h3>Thế mạnh kỹ năng</h3><svg class="student-radar" viewBox="0 0 260 248" role="img" aria-label="Biểu đồ radar năng lực theo Reading, Listening, Writing và Speaking"><g class="student-radar-grid"><polygon points="' + polygon(.25) + '"></polygon><polygon points="' + polygon(.5) + '"></polygon><polygon points="' + polygon(.75) + '"></polygon><polygon points="' + polygon(1) + '"></polygon>' + axes + '</g><polygon class="student-radar-area" points="' + plotPoints + '"></polygon><g class="student-radar-dots">' + dots + '</g><g class="student-radar-labels">' + labels + '</g></svg><p>Mỗi trục thể hiện band điểm trung bình từ 0.0 đến 9.0.</p></section>';
}

function renderStudentProfile() {
  const form = $('[data-form="profile"]');
  if (!form) return;
  const saved = ui[formKey(form)] || {};
  const name = typeof saved.name === 'string' && saved.name.trim() ? saved.name.trim() : 'Nguyễn Lan Anh';
  const nameParts = name.split(/\s+/u).filter(Boolean);
  const initials = nameParts.slice(-2).map(part => part[0]).join('').toUpperCase() || 'HS';
  const avatar = typeof saved.avatarDataUrl === 'string' ? saved.avatarDataUrl : '';
  $$('[data-student-name]').forEach(node => { node.textContent = name; });
  $$('[data-student-avatar]').forEach(node => { node.innerHTML = avatar ? '<img src="' + esc(avatar) + '" alt="Ảnh đại diện của ' + esc(name) + '">' : esc(initials); });
  $$('[data-student-skill-analysis]').forEach(node => { node.innerHTML = studentProfileRadar(studentProfileBands()); });
}

function renderData() {
  if (!state || dataError) return;
  const savedTeacherProfile = ui['form-settings.html-teacher-profile-0'];
  const teacherName = typeof savedTeacherProfile?.name === 'string' && savedTeacherProfile.name.trim() ? savedTeacherProfile.name.trim() : 'Giáo viên mẫu';
  const teacherNameParts = teacherName.split(/\s+/u).filter(Boolean);
  const teacherInitials = teacherName === 'Giáo viên mẫu' ? 'GV' : `${teacherNameParts[0]?.[0] || ''}${teacherNameParts.at(-1)?.[0] || ''}`.toUpperCase() || 'GV';
  const teacherAvatar = typeof savedTeacherProfile?.avatarDataUrl === 'string' ? savedTeacherProfile.avatarDataUrl : '';
  $$('[data-teacher-name]').forEach(node => { node.textContent = teacherName; });
  $$('[data-teacher-avatar]').forEach(node => { node.innerHTML = teacherAvatar ? `<img src="${esc(teacherAvatar)}" alt="">` : esc(teacherInitials); });
  renderStudentProfile();
  const totalStudents = state.classes.reduce((total, classroom) => total + studentCountForClass(classroom.id), 0);
  const counts = { classes: state.classes.length, assignments: state.assignments.length, submissions: state.submissions.length, review: state.submissions.filter(s => !s.published).length, published: state.submissions.filter(s => s.published).length, pending: state.assignments.filter(a => !state.submissions.some(s => s.assignmentId === a.id)).length };
  $$('[data-count]').forEach(node => { node.textContent = counts[node.dataset.count]; });
  $$('[data-total-students]').forEach(node => { node.textContent = String(totalStudents); });
  const classCards = state.classes.map(c => {
    const detailUrl = `${role || 'teacher'}-class-detail.html?id=${encodeURIComponent(c.id)}`;
    const isTeacherClassList = role === 'teacher' && page === 'teacher-classes.html';
    const actions = isTeacherClassList ? `<div class="class-card-actions"><a class="btn outline" href="${detailUrl}">Vào lớp học</a><button class="btn outline" type="button" data-action="invite-class" data-class-id="${esc(c.id)}">Mời vào lớp</button></div>` : link(detailUrl, 'Vào lớp học', 'outline');
    const showClassLetter = role !== 'teacher' && page !== 'student-classes.html';
    return `<article class="class-card" data-searchable="${esc(c.name + ' ' + c.code)}">${showClassLetter ? `<span class="class-letter">${esc(c.name.slice(0, 1).toUpperCase())}</span>` : ''}<h3>${esc(c.name)}</h3><p>${esc(c.description || 'Một không gian mới để cùng nhau tiến bộ.')}</p><div class="class-meta class-card-meta"><span>Mã ${esc(c.code)}</span><span>${studentCountForClass(c.id)} học sinh</span></div>${actions}</article>`;
  }).join('');
  for (const selector of ['#class-list', '#class-summary']) if ($(selector)) $(selector).innerHTML = classCards || blank('Chưa có lớp', 'Tạo lớp đầu tiên để bắt đầu.', 'teacher-class-new.html', 'Tạo lớp');
  const classroom = state.classes.find(c => c.id === params.get('id')) || state.classes[0];
  if (page?.includes('class-detail') && classroom) {
    $$('[data-class-name]').forEach(node => { node.textContent = classroom.name; });
    $$('[data-class-description]').forEach(node => { node.textContent = classroom.description; });
    $$('[data-class-code]').forEach(node => { node.textContent = classroom.code; });
    const hasClassPassword = typeof classroom.classPassword === 'string' && classroom.classPassword.trim().length > 0;
    const classPassword = $('[data-class-password]'); if (classPassword) classPassword.textContent = hasClassPassword ? classroom.classPassword : 'Không có mật khẩu';
    $$('[data-class-password-summary]').forEach(node => { node.hidden = !hasClassPassword; node.textContent = hasClassPassword ? `Mật khẩu lớp: ${classroom.classPassword}` : ''; });
    const classJoinLink = $('[data-class-join-link]');
    if (classJoinLink) {
      const joinPath = `student-classes.html?join=1&class=${encodeURIComponent(classroom.id)}&code=${encodeURIComponent(classroom.code)}`;
      classJoinLink.href = joinPath;
      classJoinLink.textContent = new URL(joinPath, location.href).href;
    }
    const studentCount = studentCountForClass(classroom.id);
    $$('[data-class-student-count]').forEach(node => { node.textContent = String(studentCount); });
    const assignmentCount = state.assignments.filter(assignment => assignment.classId === classroom.id).length;
    $$('[data-class-assignment-count]').forEach(node => { node.textContent = String(assignmentCount); });
    const detailHeading = $('.page-head h1'); if (detailHeading) detailHeading.textContent = classroom.name;
    $$('.tabs a, .page-head a').forEach(anchor => { const url = new URL(anchor.href); if (url.pathname.endsWith('-class-detail.html')) url.searchParams.set('id', classroom.id); else url.searchParams.set('classId', classroom.id); anchor.href = url.href; });
    $$('a[href*="teacher-assignment-new.html"]').forEach(anchor => { const url = new URL(anchor.href); url.searchParams.set('classId', classroom.id); anchor.href = url.href; });
    if (role === 'admin' && $('.page-head>.btn')) $('.page-head>.btn').href = `${role}-class-new.html?edit=${encodeURIComponent(classroom.id)}`;
    const settings = $('[data-form="class-settings"]');
    if (settings && !settings.dataset.initialized) {
      settings.elements.namedItem('name').value = classroom.name;
      settings.elements.namedItem('description').value = classroom.description;
      settings.elements.namedItem('classPassword').value = classroom.classPassword || '';
      settings.dataset.classId = classroom.id;
      settings.dataset.initialized = 'true';
    }
    renderClassStudents(classroom.id);
    renderClassDocuments(classroom.id);
  }
  const assignmentItems = state.assignments.filter(a => (!page.includes('class-detail') || a.classId === classroom?.id) && (!params.get('classId') || a.classId === params.get('classId')));
  const now = Date.now();
  const activeAssignmentItems = assignmentItems.filter(assignment => Date.parse(assignment.deadline) >= now);
  const pendingAssignmentItems = activeAssignmentItems.filter(assignment => !state.submissions.some(submission => submission.assignmentId === assignment.id));
  const completedAssignmentItems = assignmentItems.filter(assignment => Date.parse(assignment.deadline) < now);
  if ($('#assignment-list')) $('#assignment-list').innerHTML = taskRows(assignmentItems);
  for (const selector of ['#class-assignments-list', '#class-overview-assignments-list']) if ($(selector)) $(selector).innerHTML = taskRows(role === 'student' ? pendingAssignmentItems : activeAssignmentItems, role === 'student' ? { title:'Chưa có bài tập chờ làm', text:'Các bài đã hết hạn nộp và bài đã làm nằm trong mục Kết quả.', href:'' } : { title:'Chưa có bài tập đang diễn ra', text:'Tạo bài mới để học sinh bắt đầu luyện tập.', href:'teacher-assignment-new.html' });
  for (const selector of ['#class-completed-assignments-list', '#class-overview-completed-assignments-list']) if ($(selector)) $(selector).innerHTML = taskRows(completedAssignmentItems, { title:'Chưa có bài tập đã hoàn thành', text:'Các bài đã hết hạn nộp sẽ xuất hiện tại đây.', href:'' });
  for (const select of $$('[data-class-select]')) { const previous = select.value; select.innerHTML = state.classes.map(c => `<option value="${esc(c.id)}">${esc(c.name)}</option>`).join(''); if (state.classes.some(c => c.id === previous)) select.value = previous; }
  renderAssignmentClassOptions();
  const reviewQueue = state.submissions.filter(submission => !submission.published);
  if ($('#submission-list')) $('#submission-list').innerHTML = reviewQueue.length ? reviewQueue.map(s => {
    const a = state.assignments.find(a => a.id === s.assignmentId);
    return `<article class="task-row" data-searchable="${esc(a?.title)}"><span class="avatar">HS</span><div class="task-info"><h3>${esc(a?.title)}</h3><p>Học sinh mẫu · ${date(s.submittedAt)}</p></div>${badge(s.published ? 'Đã công bố' : 'Chờ công bố', s.published ? 'green' : 'amber')}<strong>${s.correct}/${s.total}</strong>${link(`teacher-review.html?id=${encodeURIComponent(s.id)}`, 'Xem bài', 'outline')}</article>`;
  }).join('') : blank('Chưa có bài tập cần nhận xét', 'Bài làm chờ công bố sẽ xuất hiện tại đây để bạn xem và phản hồi.', 'teacher-classes.html', 'Xem lớp học');
  if ($('#student-class-results-list')) $('#student-class-results-list').innerHTML = studentClassResultRows(assignmentItems);
  for (const selector of ['#results-list', '#student-submission-list']) if ($(selector)) $(selector).innerHTML = state.submissions.length ? state.submissions.map(s => { const assignment = state.assignments.find(a => a.id === s.assignmentId); return `<article class="task-row"><span class="skill-icon reading">R</span><div class="task-info"><h3>${esc(assignment?.title)}</h3><p>Đã nộp ${date(s.submittedAt)}</p></div>${s.published ? `<strong>${s.correct}/${s.total}</strong>${link(`student-result-detail.html?id=${encodeURIComponent(s.id)}&classId=${encodeURIComponent(assignment?.classId || '')}`, 'Xem kết quả', 'outline')}` : badge('Chờ công bố', 'amber')}</article>`; }).join('') : blank('Chưa có bài nộp', 'Hoàn thành bài đầu tiên để bắt đầu theo dõi tiến bộ.', 'student-class-detail.html?tab=assignments', 'Xem bài tập');
  renderAssignment(); renderAssignmentResults(); renderReview(); renderStudentTodaySchedule(); renderAudit(); applyFilter(); syncClassCarousel();
}

function previewQuestionTemplate(question, questionIndex) {
  const options = question.options || question.accepted || [];
  const storedCorrectIndex = Number.isInteger(question.correctIndex) ? question.correctIndex : -1;
  const correctIndex = storedCorrectIndex >= 0 ? storedCorrectIndex : options.findIndex(option => (question.accepted || []).includes(option));
  return `<fieldset class="preview-question"><legend>${questionIndex + 1}. ${esc(question.text || 'Câu hỏi chưa hoàn thành')}</legend>${options.map((option, optionIndex) => `<label class="${optionIndex === correctIndex ? 'is-correct' : ''}"><input type="radio" disabled ${optionIndex === correctIndex ? 'checked' : ''}><span>${esc(option || 'Đáp án chưa hoàn thành')}</span>${optionIndex === correctIndex ? '<em>Đáp án đúng</em>' : ''}</label>`).join('')}</fieldset>`;
}
function updateAssignmentPreviewHead(title, deadline) {
  const previewHeading = $('[data-assignment-preview-title]');
  const previewDeadline = $('[data-assignment-preview-deadline]');
  if (previewHeading) previewHeading.textContent = title;
  if (previewDeadline) previewDeadline.textContent = deadline ? `Hạn nộp ${date(deadline)}` : 'Bản xem trước, chưa giao cho học sinh.';
  const heading = $('.page-head h1');
  const summary = $('.page-head p:last-child');
  if (heading) heading.textContent = title;
  if (summary) summary.textContent = deadline ? `Hạn nộp ${date(deadline)}` : 'Bản xem trước, chưa giao cho học sinh.';
}
function updateAssignmentPreviewSummary(assignment, sections) {
  const className = assignment ? state.classes.find(item => item.id === assignment.classId)?.name : 'Bản nháp chưa giao';
  const questionCount = sections.reduce((total, section) => total + (Array.isArray(section.questions) ? section.questions.length : 0), 0);
  $$('[data-assignment-preview-class-name]').forEach(node => { node.textContent = className || 'Chưa xác định lớp'; });
  $$('[data-assignment-preview-section-count]').forEach(node => { node.textContent = sections.length; });
  $$('[data-assignment-preview-question-count]').forEach(node => { node.textContent = questionCount || '—'; });
}
function assignmentPreviewSectionTemplate(section, sectionIndex, variant = 'blue') {
  const questions = supportsQuestions(section.skill) ? (section.questions || []) : [];
  const questionLabel = questions.length ? `${questions.length} câu hỏi` : 'Nội dung luyện tập';
  return `<section class="assignment-preview-section"><div class="assignment-preview-heading"><div><span class="badge ${variant}">${esc(section.skill || 'Reading')}</span><span class="assignment-preview-order">SECTION ${String(sectionIndex + 1).padStart(2, '0')}</span></div><span class="assignment-preview-question-count">${questionLabel}</span></div><h2 class="prompt">${esc(section.title || 'Bài chưa có tên')}</h2>${sectionTaskSummary(section)}${section.skill === 'Listening' && section.audioName ? `<p class="selected-audio-name">File bài nghe: ${esc(section.audioName)}</p>` : ''}<div class="assignment-preview-body"><div class="reading-passage rich-output">${renderRichText(section.content, section.contentText)}</div>${questions.map(previewQuestionTemplate).join('')}</div></section>`;
}
function updateAssignmentResultsLink(assignment) {
  const resultsLink = $('[data-assignment-results-link]');
  if (!resultsLink) return;
  resultsLink.hidden = !assignment;
  if (assignment) resultsLink.href = `teacher-assignment-results.html?id=${encodeURIComponent(assignment.id)}&classId=${encodeURIComponent(assignment.classId)}`;
}
function assignmentSections(assignment) {
  if (Array.isArray(assignment.sections) && assignment.sections.length) return assignment.sections;
  return [{ skill:assignment.skill, title:assignment.title, content:assignment.passageHtml || '', contentText:assignment.passage, questions:assignment.questions }];
}
function studentAssignmentDraft(assignment) {
  const key = 'reading-' + assignment.id;
  const form = $('form[data-assignment="' + assignment.id + '"]');
  const current = form ? draftFields(form) : {};
  return { ...(ui[key] || {}), ...current };
}
function studentAssignmentIsComplete(assignment, draft) {
  let questionOffset = 0;
  return assignmentSections(assignment).every((section, sectionIndex) => {
    const questions = Array.isArray(section.questions) ? section.questions : [];
    const sectionComplete = section.skill === 'Writing'
      ? Boolean(String(draft[assignmentSections(assignment).length === 1 ? 'response' : 'response-' + sectionIndex] || '').trim())
      : section.skill === 'Speaking'
        ? Boolean(draft['speaking-' + sectionIndex])
        : questions.every((_, localIndex) => Boolean(String(draft['answer-' + (questionOffset + localIndex)] || '').trim()));
    questionOffset += questions.length;
    return sectionComplete;
  });
}
function submitStudentAssignment(assignment, draft, allowIncomplete = false) {
  const answers = assignment.questions.map((_, index) => String(draft['answer-' + index] || ''));
  const sections = assignmentSections(assignment);
  const response = sections.length === 1 && assignment.skill === 'Writing'
    ? String(draft.response || '').trim()
    : sections.map((_, index) => String(draft['response-' + index] || '').trim()).filter(Boolean).join('\n\n');
  const submissionId = id();
  if (update(current => submitAssignment(current, assignment.id, answers, new Date(), submissionId, response, allowIncomplete), 'Đã nộp bài.')) {
    const speakingMedia = Object.fromEntries(sections.map((_, index) => [index, draft['speaking-' + index]]).filter(([, media]) => media));
    saveUI({ ['reading-' + assignment.id]:null, ['submission-speaking-' + submissionId]:speakingMedia });
    audit(allowIncomplete ? 'Nộp bài chưa hoàn thiện' : 'Nộp bài hoàn chỉnh');
    go('student-class-detail.html?id=' + encodeURIComponent(assignment.classId) + '&tab=results');
  }
}
function requestStudentAssignmentSubmit(assignment) {
  const draft = studentAssignmentDraft(assignment);
  saveUI({ ['reading-' + assignment.id]:draft });
  if (studentAssignmentIsComplete(assignment, draft)) return submitStudentAssignment(assignment, draft);
  showDialog('Bài làm chưa hoàn thiện', '<p>Bài làm chưa hoàn thiện. Bạn có chắc chắn muốn nộp bài?</p><div class="form-actions"><button class="btn outline" type="button" data-action="close-dialog">Quay lại</button><button class="btn primary" type="button" data-action="confirm-student-assignment-submit" data-assignment="' + esc(assignment.id) + '">Nộp bài</button></div>');
}
function renderStudentAssignmentActions(assignment) {
  const pageHead = $('.page-head');
  if (!pageHead) return;
  let actions = $('.student-assignment-actions', pageHead);
  if (!actions) {
    actions = document.createElement('div');
    actions.className = 'student-assignment-actions';
    pageHead.append(actions);
  }
  actions.innerHTML = '<button class="btn outline" type="button" data-action="save-student-assignment-draft" data-assignment="' + esc(assignment.id) + '">Lưu nháp</button><button class="btn primary" type="button" data-action="request-student-assignment-submit" data-assignment="' + esc(assignment.id) + '">Nộp bài</button>';
}
function renderMultiSectionAssignment(assignment) {
  const sections = assignmentSections(assignment);
  const requestedSection = Number(params.get('section') || '0');
  const sectionIndex = Number.isInteger(requestedSection) && requestedSection >= 0 && requestedSection < sections.length ? requestedSection : 0;
  const section = sections[sectionIndex];
  const questions = Array.isArray(section.questions) ? section.questions : [];
  const questionOffset = sections.slice(0, sectionIndex).reduce((total, item) => total + (Array.isArray(item.questions) ? item.questions.length : 0), 0);
  const draft = ui['reading-' + assignment.id] || {};
  const isFinalSection = sectionIndex === sections.length - 1;
  const sectionTone = section.skill === 'Writing' ? 'violet' : section.skill === 'Speaking' ? 'green' : 'blue';
  const questionMarkup = questions.map((question, localIndex) => {
    const answerIndex = questionOffset + localIndex;
    if (Array.isArray(question.options) && question.options.length >= 2) {
      const options = question.options.map(option => '<label class="choice-option"><input type="radio" name="answer-' + answerIndex + '" value="' + esc(option) + '" ' + (draft['answer-' + answerIndex] === option ? 'checked' : '') + ' required data-reading-draft><span>' + esc(option) + '</span></label>').join('');
      return '<fieldset class="student-choice-question"><legend>' + (localIndex + 1) + '. ' + esc(question.text) + '</legend>' + options + '</fieldset>';
    }
    return '<label class="field">' + (localIndex + 1) + '. ' + esc(question.text) + '<input name="answer-' + answerIndex + '" value="' + esc(draft['answer-' + answerIndex] || '') + '" required maxlength="500" autocomplete="off" data-reading-draft></label>';
  }).join('');
  const writingKey = 'response-' + sectionIndex;
  const writingMarkup = '<label class="field">Nội dung bài viết<textarea name="' + writingKey + '" class="writing-area" data-reading-draft required maxlength="20000" placeholder="Bắt đầu bài viết của bạn tại đây…">' + esc(draft[writingKey] || '') + '</textarea></label>';
  const speakingKey = 'speaking-' + sectionIndex;
  const speakingDraft = draft[speakingKey] && typeof draft[speakingKey] === 'object' ? draft[speakingKey] : null;
  const speakingMarkup = '<div class="student-speaking-submission"><p>Gửi file bài nói hoặc ghi âm trực tiếp để hoàn thành section này.</p><label class="btn outline upload-btn">Tải file bài nói<input type="file" accept="audio/*" data-speaking-file data-speaking-key="' + speakingKey + '"></label><button class="btn primary" type="button" data-action="toggle-student-recording" data-speaking-key="' + speakingKey + '">Bắt đầu ghi âm</button><span class="student-speaking-file-name">' + esc(speakingDraft?.name || 'Chưa có file bài nói') + '</span>' + (speakingDraft?.contentUrl ? '<audio controls src="' + esc(speakingDraft.contentUrl) + '"></audio>' : '') + '</div>';
  const answerContent = section.skill === 'Writing' ? writingMarkup : section.skill === 'Speaking' ? speakingMarkup : questions.length ? questionMarkup : '<p class="section-practice-note">Section này không có câu hỏi trắc nghiệm.</p>';
  const actionLabel = isFinalSection ? 'Nộp bài' : 'Tiếp tục';
  const actionNote = isFinalSection ? 'Kiểm tra câu trả lời trước khi nộp bài.' : 'Câu trả lời của section này sẽ được lưu trước khi chuyển tiếp.';
  $('#reading-workspace').innerHTML = '<div class="multi-section-progress" aria-label="Tiến độ section"><span>SECTION ' + String(sectionIndex + 1).padStart(2, '0') + ' / ' + String(sections.length).padStart(2, '0') + '</span><strong>' + esc(section.title || assignment.title) + '</strong></div><div class="exam-layout"><section class="panel"><span class="badge ' + sectionTone + '">' + esc(section.skill || 'Reading') + '</span><h2 class="prompt">' + esc(section.title || assignment.title) + '</h2><p>Hạn nộp ' + date(assignment.deadline) + '</p><div class="reading-passage rich-output">' + renderRichText(section.content, section.contentText) + '</div></section><section class="panel"><div class="panel-head"><h2>Câu trả lời của bạn</h2><span class="badge ' + sectionTone + '">' + questions.length + ' câu</span></div><form data-form="reading" data-assignment="' + esc(assignment.id) + '" data-section-index="' + sectionIndex + '">' + answerContent + '<p class="caption" data-autosave-status>' + actionNote + '</p><div class="form-actions"><button class="btn primary" type="submit">' + actionLabel + '</button></div></form></section></div>';
  if (section.skill === 'Listening') {
    const contentPanel = $('#reading-workspace .exam-layout > section:first-child');
    const passage = $('.reading-passage', contentPanel);
    const audioUrl = typeof section.audioDataUrl === 'string' ? section.audioDataUrl : '';
    const player = audioUrl
      ? '<div class="student-listening-player"><audio controls preload="metadata" src="' + esc(audioUrl) + '" data-student-listening-audio></audio><div><button class="btn outline" type="button" data-action="seek-student-listening" data-seek-seconds="-10">← 10 giây</button><button class="btn outline" type="button" data-action="seek-student-listening" data-seek-seconds="10">10 giây →</button></div></div>'
      : '<p class="section-practice-note">Giáo viên chưa đính kèm file nghe cho section này.</p>';
    passage?.insertAdjacentHTML('beforebegin', player);
  }
  const progressTitle = $('.multi-section-progress strong');
  if (progressTitle) progressTitle.remove();
  const sectionActions = $('form[data-section-index] .form-actions');
  if (sectionActions && sectionIndex > 0) sectionActions.insertAdjacentHTML('afterbegin', '<button class="btn outline" type="button" data-action="previous-assignment-section">Quay lại phần trước</button>');
}
function renderAssignment() {
  let a = state.assignments.find(a => a.id === params.get('id')) || (params.has('id') ? null : state.assignments[0]);
  if ($('#assignment-preview')) {
    const draft = params.get('draft') === '1' && ui.assignmentDraft;
    if (draft) {
      const sections = Array.isArray(draft.sections) ? draft.sections : [{ skill:draft.skill || 'Reading', title:draft.title || 'Bài chưa có tên', content:esc(draft.passage || draft.writingPrompt || draft.speakingPrompt || draft.transcript || '') }];
      updateAssignmentPreviewHead(draft.assignmentTitle || sections[0]?.title || 'Bài chưa có tên', draft.deadline);
      updateAssignmentPreviewSummary(null, sections);
      $('#assignment-preview').innerHTML = `<div class="assignment-preview-sections">${sections.map((section, sectionIndex) => assignmentPreviewSectionTemplate(section, sectionIndex, 'violet')).join('')}</div><p class="assignment-preview-draft-note">Đây là bản nháp. Học sinh chưa nhìn thấy nội dung này.</p>`;
    } else if (a) {
      const sections = Array.isArray(a.sections) && a.sections.length ? a.sections : [{ skill:a.skill, title:a.title, content:a.passageHtml || '', contentText:a.passage, questions:a.questions.map(q => ({ ...q, options:q.options || q.accepted })) }];
      updateAssignmentPreviewHead(a.title, a.deadline);
      updateAssignmentPreviewSummary(a, sections);
      $('#assignment-preview').innerHTML = `<div class="assignment-preview-sections">${sections.map((section, sectionIndex) => assignmentPreviewSectionTemplate(section, sectionIndex)).join('')}</div>`;
    }
    else { updateAssignmentPreviewHead('Không tìm thấy bài', ''); updateAssignmentPreviewSummary(null, []); $('#assignment-preview').innerHTML = blank('Không tìm thấy bài', 'Chọn một bài tập còn tồn tại.', 'teacher-class-detail.html?tab=assignments', 'Về danh sách'); }
    updateAssignmentResultsLink(draft ? null : a);
  }
  if ($('#assignment-detail')) {
    const assignmentInstructions = a?.skill === 'Writing'
      ? 'Đọc kỹ đề bài, soạn bài viết của bạn và nộp trước hạn.'
      : 'Đọc đoạn văn và trả lời các câu hỏi bằng từ hoặc cụm từ phù hợp.';
    const assignmentQuantity = a?.skill === 'Writing' ? '<div><dt>Bài làm</dt><dd>Nhập trực tiếp</dd></div>' : `<div><dt>Số câu</dt><dd>${a?.questions.length || 0}</dd></div>`;
    $('#assignment-detail').innerHTML = a ? `<div class="form-layout"><section class="panel"><span class="badge blue">${esc(a.skill)}</span><h2 class="prompt">${esc(a.title)}</h2><p>${assignmentInstructions}</p><dl class="detail-list"><div><dt>Lớp học</dt><dd>${esc(state.classes.find(c => c.id === a.classId)?.name)}</dd></div>${assignmentQuantity}<div><dt>Hạn nộp</dt><dd>${date(a.deadline)}</dd></div><div><dt>Lần nộp</dt><dd>01 lần trong bản mẫu</dd></div></dl><div class="form-actions">${link(`student-reading.html?id=${encodeURIComponent(a.id)}&classId=${encodeURIComponent(a.classId)}`, 'Bắt đầu làm bài', 'primary')}</div></section><aside class="info-card"><h2>Trước khi bắt đầu</h2><p>${a.skill === 'Writing' ? 'Bản nháp được tự động lưu trong trình duyệt này. Giáo viên sẽ xem bài viết sau khi bạn nộp.' : 'Bản nháp sẽ lưu tại trình duyệt khi bạn nhập. Kiểm tra câu trả lời trước khi nộp. Điểm xuất hiện sau khi giáo viên công bố.'}</p></aside></div>` : blank('Không tìm thấy bài', 'Bài tập không còn trong dữ liệu mẫu.', 'student-class-detail.html?tab=assignments', 'Về danh sách');
  }
  if ($('#reading-workspace')) {
    if (!a) { $('#reading-workspace').innerHTML = blank('Chưa có bài Reading', 'Giáo viên cần giao bài trước.', 'student-class-detail.html?tab=assignments', 'Về danh sách'); return; }
    const submitted = state.submissions.find(s => s.assignmentId === a.id);
    if (submitted) { $('#reading-workspace').innerHTML = blank('Bạn đã nộp bài này', submitted.published ? 'Kết quả đã được giáo viên công bố.' : 'Bài làm đang chờ giáo viên công bố kết quả.', `student-class-detail.html?id=${encodeURIComponent(a.classId)}&tab=results`, 'Xem kết quả'); return; }
    if (Date.parse(a.deadline) < Date.now()) { $('#reading-workspace').innerHTML = blank('Đã hết hạn nộp bài', 'Liên hệ giáo viên nếu cần thêm thời gian.', `student-class-detail.html?id=${encodeURIComponent(a.classId)}&tab=assignments`, 'Về danh sách'); return; }
    const draft = ui[`reading-${a.id}`] || {};
    renderStudentAssignmentActions(a);
    if (assignmentSections(a).length > 1) { renderMultiSectionAssignment(a); return; }
    if (a.skill === 'Writing') {
      const response = typeof draft.response === 'string' ? draft.response : '';
      $('#reading-workspace').innerHTML = `<div class="exam-layout"><section class="panel"><span class="badge violet">Writing</span><h2 class="prompt">${esc(a.title)}</h2><p>Hạn nộp ${date(a.deadline)}</p><div class="reading-passage rich-output">${renderRichText(a.passageHtml, a.passage)}</div></section><section class="panel"><div class="panel-head"><div><h2>Bài viết của bạn</h2><p class="caption">Viết trực tiếp vào ô bên dưới.</p></div><span class="badge violet" data-writing-assignment-count>${response.trim() ? response.trim().split(/\s+/u).length : 0} từ</span></div><form data-form="writing-assignment" data-assignment="${esc(a.id)}"><label class="field">Nội dung bài viết<textarea name="response" class="writing-area" data-writing-assignment-draft required maxlength="20000" placeholder="Bắt đầu bài viết của bạn tại đây…">${esc(response)}</textarea></label><div class="editor-footer"><span data-autosave-status>Bản nháp lưu tại trình duyệt này.</span><span>Tối đa 20.000 ký tự</span></div><div class="form-actions"><button class="btn primary" type="submit">Nộp bài viết</button></div></form></section></div>`;
    } else {
      $('#reading-workspace').innerHTML = `<div class="exam-layout"><section class="panel"><span class="badge blue">Reading</span><h2 class="prompt">${esc(a.title)}</h2><p>Hạn nộp ${date(a.deadline)}</p><div class="reading-passage rich-output">${renderRichText(a.passageHtml, a.passage)}</div></section><section class="panel"><div class="panel-head"><h2>Câu trả lời của bạn</h2><span class="badge blue">${a.questions.length} câu</span></div><form data-form="reading" data-assignment="${esc(a.id)}">${a.questions.map((q, index) => Array.isArray(q.options) && q.options.length >= 2 ? `<fieldset class="student-choice-question"><legend>${index + 1}. ${esc(q.text)}</legend>${q.options.map((option, optionIndex) => `<label class="choice-option"><input type="radio" name="answer-${index}" value="${esc(option)}" ${draft[`answer-${index}`] === option ? 'checked' : ''} required data-reading-draft><span>${esc(option)}</span></label>`).join('')}</fieldset>` : `<label class="field">${index + 1}. ${esc(q.text)}<input name="answer-${index}" value="${esc(draft[`answer-${index}`] || '')}" required maxlength="500" autocomplete="off" data-reading-draft></label>`).join('')}<p class="caption" data-autosave-status>Bản nháp lưu tại trình duyệt này.</p><button class="btn primary" type="submit">Nộp bài</button></form></section></div>`;
    }
  }
}
const assignmentResultRoster = [
  { initials: 'LA', name: 'Nguyễn Lan Anh', email: 'la@example.test' },
  { initials: 'MH', name: 'Trần Minh Hải', email: 'mh@example.test' },
  { initials: 'TN', name: 'Lê Thảo Nguyên', email: 'tn@example.test' },
  { initials: 'ĐK', name: 'Phạm Đăng Khoa', email: 'dk@example.test' },
];
function renderAssignmentResults() {
  const target = $('#assignment-results');
  if (!target) return;
  const assignment = state.assignments.find(item => item.id === params.get('id')) || (params.has('id') ? null : state.assignments[0]);
  if (!assignment) {
    target.innerHTML = blank('Không tìm thấy bài tập', 'Chọn một bài tập đã giao để xem kết quả.', 'teacher-class-detail.html?tab=assignments', 'Về danh sách bài tập');
    return;
  }
  updateAssignmentPreviewHead(assignment.title, assignment.deadline);
  const classroom = state.classes.find(item => item.id === assignment.classId);
  const assignmentSubmissions = state.submissions.filter(item => item.assignmentId === assignment.id);
  const submission = assignmentSubmissions[0] || null;
  const isAiSkill = assignment.skill === 'Writing' || assignment.skill === 'Speaking' || assignment.questions.length === 0;

  const totalStudents = assignmentResultRoster.length;
  const submittedCount = assignmentSubmissions.length;
  const reviewedCount = assignmentSubmissions.filter(item => item.published || ui[`teacher-score-${item.id}`] || ui[`feedback-${item.id}`]).length;
  const pendingCount = submittedCount - reviewedCount;

  const skillMeta = {
    Writing: { tone: 'violet', label: 'Writing · AI Chấm tự động', icon: 'pen' },
    Speaking: { tone: 'amber', label: 'Speaking · AI Chấm tự động', icon: 'mic' },
    Reading: { tone: 'blue', label: 'Reading', icon: 'book' },
    Listening: { tone: 'green', label: 'Listening', icon: 'audio' }
  }[assignment.skill] || { tone: 'blue', label: assignment.skill, icon: 'file' };

  // Keep the list deliberately editorial: teachers need a quick view of the
  // assignment and each submission, not a second dashboard of duplicated KPIs.
  const leanRows = assignmentSubmissions.map((item, index) => {
    const student = assignmentResultRoster[index % assignmentResultRoster.length];
    const savedTeacherScore = ui[`teacher-score-${item.id}`];
    const automaticGrade = isAiSkill ? `Band 6.5 / 9.0` : `${item.correct}/${item.total}`;
    const teacherGrade = savedTeacherScore || (item.published ? 'Đã công bố' : 'Chưa chấm');
    const submittedOnTime = Date.parse(item.submittedAt) <= Date.parse(assignment.deadline);
    const submissionStatus = submittedOnTime ? 'Đúng hạn' : 'Trễ hạn';
    const submissionStatusClass = submittedOnTime ? 'green-soft' : 'red';
    return `<tr data-searchable="${esc(`${student.name} ${student.email}`)}">
      <td>${index + 1}</td>
      <td><strong>${esc(student.name)}</strong><small class="table-secondary">${esc(student.email)}</small></td>
      <td><div class="submission-time"><span>${date(item.submittedAt)}</span><small class="badge ${submissionStatusClass} submission-deadline-status">${submissionStatus}</small></div></td>
      <td><span class="grade-value">${automaticGrade}</span></td>
      <td><span class="review-status ${savedTeacherScore || item.published ? 'is-complete' : ''}">${esc(teacherGrade)}</span></td>
      <td><a class="btn outline btn-sm" href="teacher-review.html?id=${encodeURIComponent(item.id)}&classId=${encodeURIComponent(assignment.classId)}">Xem bài làm</a></td>
    </tr>`;
  }).join('');

  target.innerHTML = `
    <section class="assessment-overview-hero" aria-labelledby="assignment-results-title">
      <div class="assessment-overview-copy">
        <p class="assessment-overview-kicker">KẾT QUẢ BÀI TẬP</p>
        <h1 id="assignment-results-title">${esc(assignment.title)}</h1>
        <p>${esc(classroom?.name || 'Lớp học')}<br>Hạn nộp ${date(assignment.deadline)}</p>
        <div class="assessment-overview-actions" aria-label="Thao tác kết quả">
          <button class="btn white" type="button" data-action="approve-automatic-results">Duyệt kết quả tự động</button>
          <button class="btn ghost" type="button" data-action="send-results-students">Gửi kết quả HS</button>
          <button class="btn ghost" type="button" data-action="send-results-parents">Gửi kết quả PH</button>
        </div>
      </div>
      <aside class="assessment-overview-summary" aria-label="Tổng quan bài tập">
        <p>${Date.parse(assignment.deadline) < Date.now() ? 'ĐÃ HẾT HẠN NỘP' : 'ĐANG NHẬN BÀI'}</p>
        <div class="assessment-overview-progress"><strong>${submittedCount}/${totalStudents}</strong><span>học sinh đã nộp</span></div>
        <dl class="assessment-overview-stats"><div><dt>Đã nộp</dt><dd>${submittedCount}</dd></div><div><dt>Cần chấm</dt><dd>${pendingCount}</dd></div><div><dt>Đã công bố</dt><dd>${reviewedCount}</dd></div></dl>
      </aside>
    </section>
    <section class="panel lean-results-panel">
      <div class="lean-section-heading">
        <div>
          <h2>Danh sách học sinh đã nộp</h2>
          <p class="text-muted">${submittedCount ? `Có <strong>${submittedCount}</strong> bài nộp cần theo dõi.` : 'Chưa có học sinh nộp bài.'}</p>
        </div>
        <label class="lean-search"><span>Tìm học sinh</span><input type="search" placeholder="Nhập tên hoặc email" data-search-roster aria-label="Tìm kiếm theo tên hoặc email học sinh"></label>
      </div>
      <div class="table-scroll">
        <table class="assignment-results-table lean-results-table">
          <thead><tr><th scope="col">STT</th><th scope="col">Học sinh</th><th scope="col">Thời gian nộp</th><th scope="col">Chấm tự động (AI)</th><th scope="col">Giáo viên chấm</th><th scope="col">Thao tác</th></tr></thead>
          <tbody>${leanRows || `<tr><td colspan="6" class="empty-table">Chưa có bài làm được nộp.</td></tr>`}</tbody>
        </table>
      </div>
    </section>
  `;

  const leanSearch = $('[data-search-roster]', target);
  if (leanSearch) {
    leanSearch.addEventListener('input', event => {
      const query = event.target.value.toLowerCase().trim();
      $$('.assignment-results-table tbody tr', target).forEach(row => { row.hidden = Boolean(query) && !row.dataset.searchable?.includes(query); });
    });
  }
  return;

  const rows = assignmentSubmissions.map((item, index) => {
    const student = assignmentResultRoster[index % assignmentResultRoster.length];
    let automaticGrade = '—';
    if (item) {
      if (isAiSkill) {
        automaticGrade = `<span class="ai-grade-tag"><span class="ai-sparkle">✦</span> Band 6.5</span>`;
      } else {
        automaticGrade = `<strong>${item.correct}/${item.total}</strong>`;
      }
    }
    const savedTeacherScore = ui[`teacher-score-${item.id}`] || (ui[`feedback-${item.id}`] ? (isAiSkill ? 'Band 7.0' : `${item.correct}/${item.total}`) : null);
    const teacherGrade = savedTeacherScore ? `Đã chấm: ${savedTeacherScore}` : (ui[`feedback-${item.id}`] ? 'Đã nhận xét' : 'Chưa chấm');
    const teacherTone = savedTeacherScore || ui[`feedback-${item.id}`] ? 'green' : 'amber';
    const work = `<a class="btn primary btn-sm action-btn" href="teacher-review.html?id=${encodeURIComponent(item.id)}&classId=${encodeURIComponent(assignment.classId)}"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg> Xem bài làm</a>`;

    return `<tr data-searchable="${esc(student.name)} ${esc(student.initials)} đã nộp ${item.published ? 'đã công bố' : 'chờ công bố'}">
      <td>${index + 1}</td>
      <td>
        <div class="person">
          <span class="avatar avatar-soft">${student.initials}</span>
          <div class="person-meta">
            <strong>${esc(student.name)}</strong>
            <small class="text-muted">HS00${index + 1} · ${student.initials.toLowerCase()}@example.test</small>
          </div>
        </div>
      </td>
      <td>
        <div class="sub-time-cell"><span>${date(item.submittedAt)}</span><small class="badge green-soft">Đúng hạn</small></div>
      </td>
      <td>${work}</td>
      <td>${automaticGrade}</td>
      <td><span class="badge ${teacherTone}">${teacherGrade}</span></td>
    </tr>`;
  }).join('');

  target.innerHTML = `
    <section class="assignment-results-hero">
      <div class="results-hero-main">
        <div class="results-hero-tags">
          <span class="badge ${skillMeta.tone}"><span class="badge-icon">${icon(skillMeta.icon)}</span> ${skillMeta.label}</span>
          <span class="badge blue-soft">${esc(classroom?.name || 'IELTS Foundation')}</span>
          <span class="badge ${Date.parse(assignment.deadline) < Date.now() ? 'red' : 'green-soft'}">${Date.parse(assignment.deadline) < Date.now() ? 'Đã hết hạn' : 'Đang mở'}</span>
        </div>
        <h1 class="results-hero-title">${esc(assignment.title)}</h1>
        <p class="results-hero-meta">
          <span><strong>Lớp:</strong> ${esc(classroom?.name || 'IELTS Foundation')}</span>
          <span>·</span>
          <span><strong>Hạn nộp:</strong> ${date(assignment.deadline)}</span>
          <span>·</span>
          <span><strong>Hình thức:</strong> ${isAiSkill ? (assignment.skill === 'Speaking' ? 'Bài nói ghi âm (AI chấm tự động)' : 'Bài viết tự luận (AI chấm tự động)') : `${assignment.questions.length} câu trắc nghiệm`}</span>
        </p>
      </div>
      <div class="results-hero-summary-badge">
        <div class="hero-progress-ring">
          <strong>${submittedCount}/${totalStudents}</strong>
          <span>Đã nộp bài</span>
        </div>
      </div>
    </section>

    <div class="results-kpi-grid">
      <article class="kpi-card">
        <div class="kpi-icon blue"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6m2 4a5 5 0 0 1 3 5"/></svg></div>
        <div>
          <p class="kpi-label">Sĩ số lớp</p>
          <strong class="kpi-val">${totalStudents} <small>học sinh</small></strong>
          <span class="kpi-note">100% trong danh sách</span>
        </div>
      </article>
      <article class="kpi-card">
        <div class="kpi-icon green"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="m5 12 4 4L19 6"/></svg></div>
        <div>
          <p class="kpi-label">Đã nộp bài</p>
          <strong class="kpi-val">${submittedCount} <small>/ ${totalStudents}</small></strong>
          <span class="kpi-note">${Math.round((submittedCount / totalStudents) * 100)}% tỷ lệ nộp</span>
        </div>
      </article>
      <article class="kpi-card">
        <div class="kpi-icon violet"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="m12 2 9 4v6c0 6-9 10-9 10S3 18 3 12V6Z"/></svg></div>
        <div>
          <p class="kpi-label">Điểm AI trung bình</p>
          <strong class="kpi-val">${isAiSkill ? 'Band 6.5' : (submission ? `${submission.correct}/${submission.total}` : '—')}</strong>
          <span class="kpi-note">${isAiSkill ? 'Chấm tự động theo IELTS' : 'Tỷ lệ đúng chuẩn'}</span>
        </div>
      </article>
      <article class="kpi-card">
        <div class="kpi-icon amber"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/></svg></div>
        <div>
          <p class="kpi-label">Trạng thái duyệt</p>
          <strong class="kpi-val">${submission?.published ? 'Đã duyệt' : (submittedCount > 0 ? '1 chờ duyệt' : '0 bài')}</strong>
          <span class="kpi-note">${submission?.published ? 'Học sinh đã xem kết quả' : 'Chờ giáo viên công bố'}</span>
        </div>
      </article>
    </div>

    <section class="panel assignment-results-panel">
      <div class="results-table-head">
        <div>
          <h2>Danh sách học sinh đã nộp</h2>
          <p class="text-muted">${esc(classroom?.name || 'Lớp học')} · ${submittedCount} bài nộp</p>
        </div>
        <div class="results-filter-box">
          <input type="search" class="results-search-input" placeholder="Tìm theo tên học sinh..." data-search-roster aria-label="Tìm kiếm học sinh">
        </div>
      </div>
      <div class="table-scroll">
        <table class="assignment-results-table">
          <thead>
            <tr>
              <th scope="col">STT</th>
              <th scope="col">Tên học sinh</th>
              <th scope="col">Ngày nộp bài</th>
              <th scope="col">Bài làm</th>
              <th scope="col">Chấm tự động</th>
              <th scope="col">Giáo viên chấm</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
      <p class="caption">Kết quả trong bản mẫu được lưu trên trình duyệt này.</p>
    </section>
  `;

  const searchInput = $('[data-search-roster]', target);
  if (searchInput) {
    searchInput.addEventListener('input', e => {
      const q = e.target.value.toLowerCase().trim();
      $$('.assignment-results-table tbody tr', target).forEach(tr => {
        const text = tr.textContent.toLowerCase();
        tr.hidden = q.length > 0 && !text.includes(q);
      });
    });
  }
}

function getAiWritingEvaluation(response) {
  return {
    overallBand: '6.5',
    criteria: [
      {
        name: 'Task Achievement (TA)',
        score: '6.5',
        strengths: 'Trả lời đúng trọng tâm đề bài, lập luận mạch lạc và góc nhìn cân bằng giữa các khía cạnh.',
        improvements: 'Phần dẫn chứng ở đoạn thân bài 2 còn tương đối chung chung, cần bổ sung ví dụ thực tế hoặc số liệu minh họa cụ thể hơn.'
      },
      {
        name: 'Coherence & Cohesion (CC)',
        score: '6.0',
        strengths: 'Cấu trúc bài viết 4 đoạn chuẩn mực (Mở bài, 2 Thân bài, Kết luận), phân đoạn rõ ràng.',
        improvements: 'Các từ nối còn lặp lại các từ quen thuộc như "Firstly", "In addition". Cần đa dạng hóa các phương thức liên kết mạch lạc.'
      },
      {
        name: 'Lexical Resource (LR)',
        score: '7.0',
        strengths: 'Sử dụng được nhiều từ vựng học thuật theo chủ đề (technological advancements, educational access, empower learners).',
        improvements: 'Tránh một số lỗi kết hợp từ (collocations) chưa thật sự tự nhiên và chú ý độ chính xác của từ loại.'
      },
      {
        name: 'Grammatical Range & Accuracy (GRA)',
        score: '6.5',
        strengths: 'Kết hợp linh hoạt giữa câu đơn, câu ghép và câu phức; đã sử dụng được mệnh đề quan hệ và liên từ phụ thuộc.',
        improvements: 'Cần chú ý sự hòa hợp giữa chủ ngữ và động từ (subject-verb agreement), cùng việc sử dụng mạo từ "the" trước danh từ xác định.'
      }
    ],
    corrections: [
      {
        type: 'Ngữ pháp · Chia động từ',
        orig: '...technology make education more accessible...',
        fix: '...technology makes education more accessible...',
        explain: 'Danh từ "technology" là danh từ không đếm được (singular/uncountable), động từ vị ngữ cần chia số ít "makes".'
      },
      {
        type: 'Từ vựng · Collocation',
        orig: '...cause a big impact for students...',
        fix: '...exerts a profound impact on students...',
        explain: 'Collocation học thuật chuẩn xác: "exert an impact on" (đi với giới từ "on" thay vì "for"). Dùng "profound" thay cho "big" để nâng band từ vựng.'
      },
      {
        type: 'Liên kết câu · Cohesion',
        orig: '...In the other hand, traditional classrooms...',
        fix: '...On the other hand, traditional classrooms...',
        explain: 'Cụm liên từ đối lập chuẩn xác trong tiếng Anh là "On the other hand" (dùng giới từ "on", không dùng "in").'
      },
      {
        type: 'Cấu trúc câu · Liên từ thừa',
        orig: '...Although online tools are effective, but students still need teachers...',
        fix: '...Although online tools are effective, students still need teachers...',
        explain: 'Trong câu phức tiếng Anh, mệnh đề chính không dùng liên từ kết hợp "but" khi mệnh đề phụ đã có liên từ nhượng bộ "Although".'
      }
    ],
    suggestions: {
      lexical: [
        { from: 'good for students', to: 'immensely beneficial for learners / advantageous' },
        { from: 'bad side of tech', to: 'drawbacks / detrimental consequences / pitfalls' },
        { from: 'make it easier', to: 'streamline the learning process / facilitate comprehension' },
        { from: 'a lot of knowledge', to: 'a wealth of academic information / extensive knowledge base' }
      ],
      structures: [
        'Sử dụng đảo ngữ có điều kiện (Inversion): "Were schools to integrate AI thoughtfully, learners would develop critical thinking skills faster."',
        'Sử dụng mệnh đề danh ngữ làm chủ ngữ: "What makes digital platforms truly revolutionary is their capacity for personalized pacing."',
        'Sử dụng cấu trúc nhượng bộ nâng cao: "Notwithstanding the undeniable benefits of technology, human mentorship remains indispensable."'
      ],
      nextSteps: [
        'Dành 3 phút đầu giờ lập dàn ý (Brainstorming & Outline) để sắp xếp ý tưởng mạch lạc.',
        'Kiểm tra lại bài viết (Proofreading) trong 3 phút cuối để sửa triệt để lỗi chia động từ và mạo từ.',
        'Bổ sung ví dụ cụ thể (Case study hoặc Real-world application) cho mỗi luận điểm chính.'
      ]
    }
  };
}

function getAiSpeakingEvaluation() {
  return {
    overallBand: '6.5',
    criteria: [
      {
        name: 'Fluency & Coherence (FC)',
        score: '6.5',
        strengths: 'Duy trì tốc độ nói ổn định (~128 từ/phút). Bố cục bài nói theo cue card đầy đủ và có tính liên kết.',
        improvements: 'Hạn chế các từ đệm ngập ngừng (filler sounds: "um", "uh", "like") khi cần thời gian suy nghĩ ý tưởng.'
      },
      {
        name: 'Lexical Resource (LR)',
        score: '7.0',
        strengths: 'Vốn từ vựng tương đối phong phú, sử dụng được các cụm collocation tự nhiên và paraphrase tốt.',
        improvements: 'Bổ sung thêm một số idioms và từ ngữ mang tính biểu cảm cao phù hợp ngữ cảnh Speaking Part 2.'
      },
      {
        name: 'Grammatical Range & Accuracy (GRA)',
        score: '6.0',
        strengths: 'Sử dụng linh hoạt giữa câu đơn và câu ghép, có thử nghiệm mệnh đề quan hệ và câu điều kiện.',
        improvements: 'Chú ý kiểm soát thì quá khứ đơn (Past Simple) khi kể chuyện, tránh nhầm lẫn dạng quá khứ của động từ bất quy tắc.'
      },
      {
        name: 'Pronunciation (PR)',
        score: '6.5',
        strengths: 'Phát âm rõ ràng, người nghe dễ dàng theo dõi. Ngữ điệu câu hỏi và ngắt nhịp tương đối tự nhiên.',
        improvements: 'Cần chú ý phát âm chuẩn các âm cuối (ending sounds: /s/, /z/, /t/, /d/) và trọng âm từ đa âm tiết.'
      }
    ],
    corrections: [
      {
        type: 'Phát âm & Trọng âm',
        orig: 'Technology /tek-noh-LOH-jee/',
        fix: 'Technology /tekˈnɒl.ə.dʒi/',
        explain: 'Trọng âm chính rơi vào âm tiết thứ 2 (NOL), không nhấn vào âm tiết thứ 3.'
      },
      {
        type: 'Âm cuối (Ending sound)',
        orig: 'accessed /ækˈses/',
        fix: 'accessed /ˈæk.sest/',
        explain: 'Động từ thêm đuôi -ed sau âm vô thanh /s/ phát âm thành /t/, học sinh đã bỏ quên âm đuôi này.'
      },
      {
        type: 'Thì động từ khi nói',
        orig: 'When I go to the library last week...',
        fix: 'When I went to the library last week...',
        explain: 'Mốc thời gian "last week" trong quá khứ yêu cầu dùng thì Quá khứ đơn "went" thay vì "go".'
      },
      {
        type: 'Từ đệm & Ngập ngừng',
        orig: 'Ghi nhận 5 lần chêm "uhm / like"',
        fix: 'Sử dụng cụm kéo dài tự nhiên',
        explain: 'Thay vì dùng "uhm...", hãy dùng "Well, let me think...", "That is an intriguing question..." để duy trì tính trôi chảy.'
      }
    ],
    suggestions: {
      lexical: [
        { from: 'very good place', to: 'a captivating destination / an ideal retreat' },
        { from: 'I like it because', to: 'what appeals to me most is...' },
        { from: 'a lot of people', to: 'a large crowd of visitors / countless tourists' },
        { from: 'make me happy', to: 'brings immense satisfaction / rejuvenates my mind' }
      ],
      structures: [
        'Sử dụng mệnh đề phân từ: "Having visited this place several times, I still find it remarkably peaceful."',
        'Sử dụng cấu trúc nhấn mạnh (Cleft sentence): "It was the breathtaking scenery that initially captivated my interest."',
        'Sử dụng câu điều kiện hỗn hợp khi liên hệ quá khứ - hiện tại: "Had I not discovered this spot, my weekends would be far more monotonous."'
      ],
      nextSteps: [
        'Thực hành ghi âm lại bài nói lần 2, tập trung bật rõ các ending sounds /s/, /ed/.',
        'Tập thói quen im lặng 1 giây thay vì phát ra âm "uhm" khi chuyển ý.',
        'Áp dụng phương pháp PEEL (Point - Explain - Example - Link) để trả lời trọn vẹn từng cue trong đề bài.'
      ]
    }
  };
}

function getReviewCorrections(submission, aiEvaluation) {
  const savedCorrections = ui[`review-corrections-${submission.id}`];
  return Array.isArray(savedCorrections) ? savedCorrections : aiEvaluation.corrections;
}

function renderFeedbackImageList(form) {
  const submissionId = form?.dataset.submission;
  const files = submissionId ? feedbackImageFiles.get(submissionId) || [] : [];
  const editable = form?.dataset.editing === 'true';
  const list = $('[data-feedback-image-list]', form);
  const summary = $('[data-feedback-image-summary]', form);
  if (list) {
    list.hidden = files.length === 0;
    list.innerHTML = files.map((file, index) => `<li><span>${esc(file.name)}</span><button type="button" class="feedback-image-remove" data-remove-feedback-image="${index}" data-submission="${esc(submissionId)}" aria-label="Xóa ảnh ${esc(file.name)}" title="Xóa ảnh"${editable ? '' : ' disabled'}>${assignmentActionIcon('delete')}</button></li>`).join('');
  }
  if (summary) summary.textContent = files.length ? `${files.length} ảnh đã chọn.` : 'Chưa chọn ảnh.';
}

function multiReviewStoreKey(kind, submissionId, sectionIndex) {
  return 'review-section-' + kind + '-' + submissionId + '-' + sectionIndex;
}

function multiReviewItems(kind, submissionId, sectionIndex, defaults) {
  const stored = ui[multiReviewStoreKey(kind, submissionId, sectionIndex)];
  return Array.isArray(stored) ? stored : defaults;
}

function multiReviewActions(kind, submissionId, sectionIndex, itemIndex, label, editable = true) {
  if (role !== 'teacher' || !editable) return '';
  return '<span class="review-item-actions"><button type="button" class="class-student-action edit" data-action="edit-section-review-item" data-review-item-kind="' + esc(kind) + '" data-submission="' + esc(submissionId) + '" data-section-index="' + sectionIndex + '" data-item-index="' + itemIndex + '" aria-label="Chỉnh sửa ' + esc(label) + ' ' + (itemIndex + 1) + '" title="Chỉnh sửa">' + assignmentActionIcon('edit') + '</button><button type="button" class="class-student-action delete review-delete-x" data-action="delete-section-review-item" data-review-item-kind="' + esc(kind) + '" data-submission="' + esc(submissionId) + '" data-section-index="' + sectionIndex + '" data-item-index="' + itemIndex + '" aria-label="Xóa ' + esc(label) + ' ' + (itemIndex + 1) + '" title="Xóa">×</button></span>';
}

function renderSectionEvaluationDetails(evaluation, submissionId, sectionIndex, editable = true) {
  if (!evaluation) return '';
  const criteria = multiReviewItems('criteria', submissionId, sectionIndex, evaluation.criteria).map((criterion, index) => '<article class="lean-criterion"><div><h3>' + esc(criterion.name) + '</h3><p><strong>Điểm mạnh:</strong> ' + esc(criterion.strengths) + '</p></div><div><span class="criterion-band' + (role === 'teacher' && editable ? ' editable' : '') + '">' + esc(criterion.score) + '</span><span class="criterion-review-actions">' + multiReviewActions('criteria', submissionId, sectionIndex, index, 'tiêu chí', editable) + '</span><p><strong>Cần hoàn thiện:</strong> ' + esc(criterion.improvements) + '</p></div></article>').join('');
  const corrections = multiReviewItems('corrections', submissionId, sectionIndex, evaluation.corrections).map((correction, index) => '<article class="lean-correction"><header><span>' + (index + 1) + '. ' + esc(correction.type) + '</span>' + multiReviewActions('corrections', submissionId, sectionIndex, index, 'lỗi cần sửa', editable) + '</header><div class="lean-correction-compare"><p><small>Nội dung học sinh</small><del>' + esc(correction.orig) + '</del></p><p><small>Đề xuất cải thiện</small><ins>' + esc(correction.fix) + '</ins></p></div><p class="text-muted">' + esc(correction.explain) + '</p></article>').join('');
  const lexical = evaluation.suggestions.lexical.map(item => '<li><span>' + esc(item.from) + '</span><strong>' + esc(item.to) + '</strong></li>').join('');
  const structures = evaluation.suggestions.structures.map(item => '<li>' + esc(item) + '</li>').join('');
  const nextSteps = evaluation.suggestions.nextSteps.map(item => '<li>' + esc(item) + '</li>').join('');
  const addCorrection = role === 'teacher' && editable ? '<button type="button" class="class-student-action edit add-section-correction" data-action="add-section-review-correction" data-submission="' + esc(submissionId) + '" data-section-index="' + sectionIndex + '" aria-label="Thêm lỗi cần sửa" title="Thêm lỗi cần sửa"><span aria-hidden="true">+</span></button>' : '';
  return '<details class="review-ai-details"><summary><span>Xem chi tiết đánh giá ' + esc(evaluation.skillLabel || '') + '</span><span class="review-ai-band">Band ' + esc(evaluation.overallBand) + '</span></summary><div class="review-ai-details-body"><section class="review-ai-criteria"><h3>Đánh giá tiêu chí</h3><div class="lean-criteria-list">' + criteria + '</div></section><section class="review-section-ai"><div class="review-section-heading"><h3>Lỗi cần sửa</h3>' + addCorrection + '</div><div class="lean-corrections-list">' + corrections + '</div></section><section class="review-section-ai"><h3>Đề xuất cải thiện</h3><div class="lean-suggestion-columns"><section><h4>Từ vựng</h4><ul class="lexical-suggestion-list">' + lexical + '</ul></section><section><h4>Cấu trúc câu</h4><ol>' + structures + '</ol></section><section><h4>Rèn luyện tiếp theo</h4><ol>' + nextSteps + '</ol></section></div></section></div></details>';
}

function renderMultiSectionReview(target, submission, assignment, grades) {
  const sections = assignmentSections(assignment);
  const reviewEditing = role === 'teacher' && (!submission.published || Boolean(ui['editing-review-' + submission.id]));
  const submittedResponses = String(submission.response || '').split(/\n\n/);
  const speakingMedia = ui['submission-speaking-' + submission.id] || {};
  let questionOffset = 0;
  let responseOffset = 0;
  const sectionBands = [];
  const sectionsMarkup = sections.map((section, sectionIndex) => {
    const questions = Array.isArray(section.questions) ? section.questions : [];
    const questionMarkup = questions.map((question, localIndex) => {
      const answerIndex = questionOffset + localIndex;
      const storedQuestion = assignment.questions[answerIndex];
      const accepted = storedQuestion?.accepted || (Array.isArray(question.options) && Number.isInteger(question.correctIndex) ? [question.options[question.correctIndex]] : []);
      const answer = submission.answers[answerIndex] || 'Chưa trả lời';
      const correct = Boolean(grades?.details[answerIndex]);
      return '<article class="answer-detail"><h3>' + (localIndex + 1) + '. ' + esc(question.text) + '</h3><p>Câu trả lời: <strong>' + esc(answer) + '</strong></p><p>Đáp án: <strong>' + esc(accepted.join(' / ') || 'Chưa thiết lập') + '</strong></p>' + badge(correct ? 'Chính xác' : 'Cần xem lại', correct ? 'green' : 'amber') + '</article>';
    }).join('');
    questionOffset += questions.length;
    let submittedWork = questionMarkup;
    if (section.skill === 'Writing') {
      const response = submittedResponses[responseOffset++] || 'Học sinh chưa nhập nội dung cho section này.';
      submittedWork = '<section class="review-section-response"><h3>Bài viết của học sinh</h3><p>' + esc(response) + '</p></section>';
    }
    if (section.skill === 'Speaking') {
      const media = speakingMedia[sectionIndex];
      submittedWork = '<section class="review-section-response"><h3>Bài nói của học sinh</h3>' + (media?.contentUrl ? '<audio controls src="' + esc(media.contentUrl) + '"></audio><p>' + esc(media.name || 'File bài nói') + '</p>' : '<p>Học sinh chưa gửi file bài nói hoặc bản ghi âm.</p>') + '</section>';
      const transcript = String(media?.transcript || '').trim();
      submittedWork += '<section class="review-section-response speaking-transcript" aria-label="Transcript bài nói"><h3>Transcript bài nói</h3><p>' + esc(transcript || 'Chưa có transcript bài nói.') + '</p></section>';
    }
    const evaluation = section.skill === 'Speaking' ? getAiSpeakingEvaluation() : section.skill === 'Writing' ? getAiWritingEvaluation(submittedResponses[Math.max(0, responseOffset - 1)] || '') : null;
    if (evaluation) evaluation.skillLabel = section.skill;
    const automaticBand = questions.length ? Number((questions.reduce((count, _, index) => count + (grades?.details[questionOffset - questions.length + index] ? 1 : 0), 0) / questions.length * 9).toFixed(1)) : Number(evaluation?.overallBand || 0);
    const savedBand = Number(ui['section-score-' + submission.id + '-' + sectionIndex]);
    const sectionBand = Number.isFinite(savedBand) && savedBand >= 0 && savedBand <= 9 ? savedBand : automaticBand;
    sectionBands.push(sectionBand);
    const sectionScore = '<section class="section-score-box"><span>Điểm section</span><strong>' + sectionBand.toFixed(1) + '<small>/ 9.0</small></strong>' + (questions.length ? '<small>' + questions.reduce((count, _, index) => count + (grades?.details[questionOffset - questions.length + index] ? 1 : 0), 0) + '/' + questions.length + ' câu đúng</small>' : '<small>Đánh giá tự động</small>') + (role === 'teacher' ? '<label><span>Điểm điều chỉnh</span><input type="number" min="0" max="9" step="0.1" value="' + sectionBand.toFixed(1) + '" data-section-score data-submission="' + esc(submission.id) + '" data-section-index="' + sectionIndex + '"' + (reviewEditing ? '' : ' disabled') + '></label>' : '') + '</section>';
    const evaluationDetails = renderSectionEvaluationDetails(evaluation, submission.id, sectionIndex, reviewEditing);
    return '<details class="panel multi-section-review-card"><summary class="multi-section-review-summary"><span><small>SECTION ' + String(sectionIndex + 1).padStart(2, '0') + '</small><strong>' + esc(section.title || assignment.title) + '</strong></span><span class="multi-section-summary-meta"><span class="badge ' + (section.skill === 'Writing' ? 'violet' : section.skill === 'Speaking' ? 'green' : 'blue') + '">' + esc(section.skill || 'Reading') + '</span><span class="badge violet" data-section-band-badge data-submission="' + esc(submission.id) + '" data-section-index="' + sectionIndex + '">' + sectionBand.toFixed(1) + '</span><span class="review-disclosure-label">Xem section</span></span></summary><div class="multi-section-review-body"><div class="reading-passage rich-output">' + renderRichText(section.content, section.contentText) + '</div><div class="multi-section-student-work">' + (submittedWork || '<p class="section-practice-note">Section này không có câu trả lời.</p>') + '</div>' + sectionScore + evaluationDetails + '</div></details>';
  }).join('');
  const averageBand = sectionBands.length ? sectionBands.reduce((sum, value) => sum + value, 0) / sectionBands.length : 0;
  const teacherTools = role === 'teacher'
    ? '<p class="section-score-average">Điểm tổng được tính từ trung bình band của các section.</p><form data-form="feedback" data-submission="' + esc(submission.id) + '" data-editing="' + reviewEditing + '" class="teacher-feedback-form"><label class="field">Nhận xét của giáo viên<textarea name="feedback" maxlength="3000" placeholder="Viết nhận xét hoặc hướng dẫn tiếp theo cho học sinh..."' + (reviewEditing ? '' : ' readonly') + '>' + esc(ui['feedback-' + submission.id] || '') + '</textarea></label><label class="feedback-image-field"><span>Ảnh đính kèm</span><input type="file" accept="image/*" multiple data-feedback-images aria-describedby="feedback-image-summary"' + (reviewEditing ? '' : ' disabled') + '><small id="feedback-image-summary" data-feedback-image-summary>Chưa chọn ảnh.</small><ul class="feedback-image-list" data-feedback-image-list hidden></ul></label><div class="feedback-status-bar"><small>Tối đa 3000 ký tự</small></div></form>' + (submission.published ? '<div class="published-review-actions"><p class="review-status review-published">Đã chấm bài</p>' + (reviewEditing ? '<button type="button" class="btn primary full-width review-save-published" data-action="save-published-review" data-submission="' + esc(submission.id) + '">Lưu</button>' : '<button type="button" class="btn outline full-width review-edit-published" data-action="edit-published-review" data-submission="' + esc(submission.id) + '">Chỉnh sửa</button>') + '</div>' : '<button class="btn primary full-width" data-publish="' + esc(submission.id) + '">Công bố kết quả</button>')
    : '<div class="student-feedback-box"><strong>Nhận xét từ giáo viên</strong><p>' + esc(ui['feedback-' + submission.id] || 'Chưa có nhận xét bổ sung.') + '</p></div>';
  target.innerHTML = '<div class="dashboard-columns review-columns multi-section-review-layout"><main>' + sectionsMarkup + '</main><aside class="review-sidebar"><section class="panel score-review-panel"><div class="panel-head"><h2>Tổng hợp điểm số</h2>' + badge(submission.published ? 'Đã công bố' : 'Chờ công bố', submission.published ? 'green' : 'amber') + '</div><div class="score-card ai-score-card"><div class="score-card-head"><span class="score-card-tag">Band điểm bài làm</span></div><div class="score-number-row"><strong class="large-score" data-average-band>' + averageBand.toFixed(1) + '<small>/ 9.0</small></strong></div><p>Trung bình ' + sectionBands.length + ' section</p></div><div class="lean-teacher-tools">' + teacherTools + '</div></section></aside></div>';
  if (role === 'teacher') renderFeedbackImageList($('form[data-form="feedback"]', target));
}

function renderReview() {
  const target = $('#review-content') || $('#result-detail'); if (!target) return;
  const s = state.submissions.find(s => s.id === params.get('id')) || (params.has('id') ? null : state.submissions[0]);
  if (!s) { target.innerHTML = blank('Chưa có bài làm để hiển thị', 'Hoàn thành một bài tập để kiểm tra giao diện này.', role === 'teacher' ? 'teacher-submissions.html' : 'student-class-detail.html?tab=assignments', 'Về danh sách'); return; }
  
  const a = state.assignments.find(item => item.id === s.assignmentId);
  if (!a) { target.innerHTML = blank('Không tìm thấy bài làm', 'Bài tập không còn trong dữ liệu mẫu.', 'student-class-detail.html?tab=results', 'Về kết quả'); return; }

  const isAiSkill = a.skill === 'Writing' || a.skill === 'Speaking' || a.questions.length === 0;

  if (role === 'student' && !s.published) {
    const studentWork = a.questions.length
      ? a.questions.map((question, index) => `<article class="answer-detail"><h3>${index + 1}. ${esc(question.text)}</h3><p>Trả lời: <strong>${esc(s.answers[index])}</strong></p></article>`).join('')
      : `<article class="answer-detail"><h3>Bài làm của bạn</h3><p>${esc(s.response || 'Đã nộp bài làm mẫu.')}</p></article>`;
    target.innerHTML = `<section class="panel"><div class="panel-head"><h2>${esc(a.title)}</h2>${badge('Chờ công bố', 'amber')}</div><p>Đã nộp ${date(s.submittedAt)}</p>${studentWork}<div class="notice">Bài làm đang chờ giáo viên công bố kết quả. Điểm và đáp án đúng sẽ xuất hiện sau khi công bố.</div></section>`;
    return;
  }

  const grades = a.questions.length ? gradeAnswers(a.questions, s.answers) : null;
  if (assignmentSections(a).length > 1) {
    renderMultiSectionReview(target, s, a, grades);
    return;
  }
  const aiEval = a.skill === 'Speaking' ? getAiSpeakingEvaluation() : getAiWritingEvaluation(s.response || '');
  const reviewCorrections = getReviewCorrections(s, aiEval);
  const teacherScore = ui[`teacher-score-${s.id}`] || (isAiSkill ? '7.0' : `${s.correct}/${s.total}`);
  const teacherScoreTone = ui[`teacher-score-${s.id}`] ? 'green' : (isAiSkill ? 'blue-soft' : 'green');
  const reviewEditing = role === 'teacher' && (!s.published || Boolean(ui[`editing-review-${s.id}`]));

  if (isAiSkill) {
    const isSpeaking = a.skill === 'Speaking';
    const originalText = s.response || (isSpeaking ? 'I would like to talk about a place I often visit in my free time...' : 'Some people believe that technology makes education more accessible, while others argue that it brings numerous distractions...');
    const wordCount = originalText.trim().split(/\s+/u).length;

    const leanCriteria = aiEval.criteria.map(criterion => `
      <article class="lean-criterion">
        <div><h3>${esc(criterion.name)}</h3><p><strong>Điểm mạnh:</strong> ${esc(criterion.strengths)}</p></div>
        <div><span class="criterion-band">${esc(criterion.score)}</span><p><strong>Cần hoàn thiện:</strong> ${esc(criterion.improvements)}</p></div>
      </article>
    `).join('');
    const leanCorrections = reviewCorrections.map((correction, index) => `
      <article class="lean-correction">
        <header><span>${index + 1}. ${esc(correction.type)}</span>${role === 'teacher' && reviewEditing ? `<span class="review-correction-actions"><button type="button" class="class-student-action edit" data-action="edit-review-correction" data-submission="${esc(s.id)}" data-correction-index="${index}" aria-label="Chỉnh sửa lỗi cần sửa ${index + 1}" title="Chỉnh sửa lỗi cần sửa">${assignmentActionIcon('edit')}</button><button type="button" class="class-student-action delete" data-action="delete-review-correction" data-submission="${esc(s.id)}" data-correction-index="${index}" aria-label="Xóa lỗi cần sửa ${index + 1}" title="Xóa lỗi cần sửa">${assignmentActionIcon('delete')}</button></span>` : ''}</header>
        <div class="lean-correction-compare"><p><small>Nội dung học sinh</small><del>${esc(correction.orig)}</del></p><p><small>Đề xuất cải thiện</small><ins>${esc(correction.fix)}</ins></p></div>
        <p class="text-muted">${esc(correction.explain)}</p>
      </article>
    `).join('');
    const lexicalSuggestions = aiEval.suggestions.lexical.map(row => `<li><span>${esc(row.from)}</span><strong>${esc(row.to)}</strong></li>`).join('');
    const structureSuggestions = aiEval.suggestions.structures.map(item => `<li>${esc(item)}</li>`).join('');
    const nextSteps = aiEval.suggestions.nextSteps.map(item => `<li>${esc(item)}</li>`).join('');
    const workContent = isSpeaking
      ? `<div class="speaking-submission"><p><strong>Bản ghi âm</strong><span>Thời lượng 01:45</span></p><p class="student-essay-text">${esc(originalText)}</p></div>`
      : `<div class="student-essay-container"><p class="student-essay-text">${esc(originalText)}</p></div>`;
    const teacherTools = role === 'teacher' ? `
      <label class="field lean-score-field">Điểm giáo viên chấm
        <div class="lean-score-input"><input type="number" step="0.5" min="0" max="9" name="teacherScore" value="${teacherScore}" data-submission="${esc(s.id)}" required${reviewEditing ? '' : ' disabled'}><span>/ 9.0</span></div>
      </label>
      <form data-form="feedback" data-submission="${esc(s.id)}" data-editing="${reviewEditing}" class="teacher-feedback-form">
        <label class="field">Nhận xét của giáo viên<textarea name="feedback" maxlength="3000" placeholder="Viết nhận xét hoặc hướng dẫn tiếp theo cho học sinh..."${reviewEditing ? '' : ' readonly'}>${esc(ui[`feedback-${s.id}`] || '')}</textarea></label>
        <label class="feedback-image-field"><span>Ảnh đính kèm</span><input type="file" accept="image/*" multiple data-feedback-images aria-describedby="feedback-image-summary"${reviewEditing ? '' : ' disabled'}><small id="feedback-image-summary" data-feedback-image-summary>Chưa chọn ảnh.</small><ul class="feedback-image-list" data-feedback-image-list hidden></ul></label>
        <div class="feedback-status-bar"><small>Tối đa 3000 ký tự</small></div>
      </form>
      ${s.published ? `<div class="published-review-actions"><p class="review-status review-published">Đã chấm bài</p>${reviewEditing ? `<button type="button" class="btn primary full-width review-save-published" data-action="save-published-review" data-submission="${esc(s.id)}">Lưu</button>` : `<button type="button" class="btn outline full-width review-edit-published" data-action="edit-published-review" data-submission="${esc(s.id)}">Chỉnh sửa</button>`}</div>` : `<button class="btn primary full-width" data-publish="${esc(s.id)}">Công bố kết quả</button>`}
      <button class="btn text preview-email-link" type="button" data-action="email-preview">Xem trước email kết quả</button>
    ` : `
      <div class="lean-score-field"><span>Điểm giáo viên chấm</span><strong>${esc(teacherScore)} / 9.0</strong></div>
      <div class="student-feedback-box"><strong>Nhận xét từ giáo viên</strong><p>${esc(ui[`feedback-${s.id}`] || 'Chưa có nhận xét bổ sung.')}</p></div>
    `;

    const studentFeedback = String(ui[`feedback-${s.id}`] || '').trim();
    const reviewContentSection = role === 'student'
      ? (studentFeedback ? `<section class="panel student-feedback-panel"><div class="lean-panel-heading"><h2>Nhận xét của giáo viên</h2></div><p>${esc(studentFeedback)}</p></section>` : '')
      : `<section class="panel lean-work-panel"><div class="lean-panel-heading"><div><h2>${isSpeaking ? 'Bài nói của học viên' : 'Bài viết của học viên'}</h2><p class="text-muted">${isSpeaking ? 'Bản ghi nội dung từ bài nói của học sinh.' : 'Nội dung bài làm học sinh đã nộp.'}</p></div><span class="word-count">${isSpeaking ? '01:45' : `${wordCount} từ`}</span></div>${workContent}</section>`;
    const heroScoreSummary = role === 'student'
      ? `<aside class="assessment-overview-summary review-score-summary student-result-score-summary" aria-label="Điểm bài làm"><div class="review-score-box"><span>Điểm bài làm</span><strong>${teacherScore}<small>/ 9.0</small></strong></div></aside>`
      : `<aside class="assessment-overview-summary review-score-summary" aria-label="Tổng quan điểm số"><div class="review-score-box"><span>Điểm AI chấm</span><strong>${aiEval.overallBand}<small>/ 9.0</small></strong></div><div class="review-score-box"><span>Điểm Giáo viên chấm</span><strong>${teacherScore}<small>/ 9.0</small></strong></div></aside>`;
    const reviewScorePanel = role === 'teacher' ? `<aside class="lean-review-aside"><section class="panel lean-scores-panel"><h2>Tổng hợp điểm</h2><dl class="lean-score-compare"><div><dt>Điểm AI chấm tự động</dt><dd>${aiEval.overallBand}<small>/ 9.0</small></dd></div><div><dt>Điểm giáo viên chấm</dt><dd>${teacherScore}<small>/ 9.0</small></dd></div></dl><div class="lean-teacher-tools">${teacherTools}</div></section></aside>` : '';
    const criteriaHeading = role === 'student' ? 'Đánh giá tiêu chí' : 'AI Chấm Tự Động';

    target.innerHTML = `
      <section class="assessment-overview-hero assessment-review-hero" aria-labelledby="teacher-review-title">
        <div class="assessment-overview-copy">
          <h1 id="teacher-review-title">${esc(a.title)}</h1>
          <p class="review-student-name">Nguyễn Lan Anh</p>
          <div class="review-submission-meta"><span>Đã nộp ${date(s.submittedAt)}</span><span class="badge ${Date.parse(s.submittedAt) <= Date.parse(a.deadline) ? 'green-soft' : 'red'}">${Date.parse(s.submittedAt) <= Date.parse(a.deadline) ? 'Đúng hạn' : 'Trễ hạn'}</span></div>
          <div class="assessment-review-status"><span class="review-status ${s.published ? 'review-published' : ''}">${s.published ? 'Đã chấm bài' : 'Chờ chấm bài'}</span></div>
        </div>
        ${heroScoreSummary}
      </section>
      <div class="lean-review-grid ${role === 'student' ? 'student-result-review' : ''}">
        <main class="lean-review-main">
          ${reviewContentSection}
          <section class="panel lean-ai-panel"><div class="lean-panel-heading"><div><h2>${criteriaHeading}</h2><p class="text-muted">Đánh giá theo các tiêu chí IELTS phù hợp với bài làm.</p></div><strong class="ai-overall-band">Band ${aiEval.overallBand}</strong></div><p class="ai-summary">Bài làm có nền tảng tốt. Giáo viên có thể dùng các nhận định dưới đây để đối chiếu trước khi chấm và phản hồi.</p><div class="lean-criteria-list">${leanCriteria}</div></section>
          <section class="panel lean-corrections-panel"><div class="lean-panel-heading"><div><h2>Lỗi cần sửa</h2></div></div><div class="lean-corrections-list">${leanCorrections}</div></section>
          <section class="panel lean-suggestions-panel"><div class="lean-panel-heading"><div><h2>Đề xuất cải thiện</h2></div></div><div class="lean-suggestion-columns"><section><h3>Từ vựng</h3><ul class="lexical-suggestion-list">${lexicalSuggestions}</ul></section><section><h3>Cấu trúc câu</h3><ol>${structureSuggestions}</ol></section><section><h3>Rèn luyện tiếp theo</h3><ol>${nextSteps}</ol></section></div></section>
        </main>
        ${reviewScorePanel}
      </div>
    `;
    return;

    const criteriaCards = aiEval.criteria.map(crit => `
      <article class="criterion-card">
        <div class="criterion-head">
          <h3>${esc(crit.name)}</h3>
          <span class="criterion-score-badge"><span class="ai-sparkle">✦</span> Band ${crit.score}</span>
        </div>
        <div class="criterion-body">
          <div class="crit-point crit-strength">
            <span class="crit-icon check">${icon('check')}</span>
            <div><strong>Điểm mạnh:</strong><p>${esc(crit.strengths)}</p></div>
          </div>
          <div class="crit-point crit-improve">
            <span class="crit-icon arrow">${icon('arrow')}</span>
            <div><strong>Cần hoàn thiện:</strong><p>${esc(crit.improvements)}</p></div>
          </div>
        </div>
      </article>
    `).join('');

    const errorCards = aiEval.corrections.map((err, idx) => `
      <article class="error-item-card">
        <div class="error-item-head">
          <span class="badge violet-soft">Lỗi ${idx + 1}</span>
          <span class="error-type-tag">${esc(err.type)}</span>
        </div>
        <div class="error-compare-grid">
          <div class="error-col orig">
            <span class="error-col-label">Nội dung học sinh:</span>
            <div class="error-code-del"><del>${esc(err.orig)}</del></div>
          </div>
          <div class="error-col fix">
            <span class="error-col-label">Đề xuất chỉnh sửa từ AI:</span>
            <div class="error-code-ins"><ins>${esc(err.fix)}</ins></div>
          </div>
        </div>
        <div class="error-explain-box">
          <strong>Giải thích chi tiết:</strong> ${esc(err.explain)}
        </div>
      </article>
    `).join('');

    const lexicalRows = aiEval.suggestions.lexical.map(row => `
      <tr>
        <td><span class="lex-from">${esc(row.from)}</span></td>
        <td><span class="lex-arrow">→</span></td>
        <td><strong class="lex-to">${esc(row.to)}</strong></td>
      </tr>
    `).join('');

    const structureItems = aiEval.suggestions.structures.map(item => `
      <li class="structure-item"><span class="structure-bullet">✦</span> <div>${esc(item)}</div></li>
    `).join('');

    const nextStepItems = aiEval.suggestions.nextSteps.map((step, idx) => `
      <li class="next-step-item"><span class="step-num">${idx + 1}</span> <span>${esc(step)}</span></li>
    `).join('');

    const studentWorkSection = isSpeaking ? `
      <section class="panel review-work-panel">
        <div class="panel-head">
          <div>
            <h2>Bài làm của học viên</h2>
            <p class="text-muted">Bản ghi âm và lời gỡ băng giọng nói của học sinh.</p>
          </div>
          <span class="badge amber">Audio 01:45</span>
        </div>
        <div class="speaking-player-card">
          <div class="speaking-player-controls">
            <button type="button" class="btn primary btn-audio-play" data-action="toggle-demo-audio">
              <svg class="icon play-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              <span>Nghe bài nói</span>
            </button>
            <div class="audio-wave-visual">
              <span style="height: 35%"></span><span style="height: 70%"></span><span style="height: 50%"></span><span style="height: 90%"></span>
              <span style="height: 60%"></span><span style="height: 80%"></span><span style="height: 45%"></span><span style="height: 95%"></span>
              <span style="height: 70%"></span><span style="height: 85%"></span><span style="height: 55%"></span><span style="height: 40%"></span>
            </div>
            <span class="audio-time">01:45 / 02:00</span>
          </div>
        </div>
        <div class="speech-transcript-box">
          <div class="transcript-head">
            <strong>Bản gỡ băng giọng nói (AI Transcription):</strong>
            <span class="badge blue-soft">Tốc độ: 128 từ/phút</span>
          </div>
          <p class="transcript-content">
            <span class="ts">[00:05]</span> "Today I would like to talk about a library that I usually visit in my free time. <span class="ts">[00:25]</span> It is located in the central district of my city. What appeals to me most is the quiet and inspiring atmosphere. <span class="ts">[00:50]</span> Although digital books are everywhere, I still prefer holding a physical book because it helps me concentrate better..."
          </p>
        </div>
      </section>
    ` : `
      <section class="panel review-work-panel">
        <div class="panel-head">
          <div>
            <h2>Bài viết của học viên</h2>
            <p class="text-muted">Nội dung bài làm gốc do học sinh nộp trực tiếp.</p>
          </div>
          <span class="badge violet">${wordCount} từ</span>
        </div>
        <div class="student-essay-container">
          <p class="student-essay-text">${esc(originalText)}</p>
        </div>
      </section>
    `;

    target.innerHTML = `
      <div class="review-header-banner">
        <div class="review-header-left">
          <div class="review-meta-pills">
            <span class="badge ${isSpeaking ? 'amber' : 'violet'}">${isSpeaking ? 'Speaking Part 2' : 'Writing Task 2'}</span>
            <span class="badge blue-soft">${esc(a.title)}</span>
            ${badge(s.published ? 'Đã công bố kết quả' : 'Chờ công bố kết quả', s.published ? 'green' : 'amber')}
          </div>
          <h1 class="review-page-title">${esc(a.title)}</h1>
          <div class="review-student-info">
            <span class="avatar avatar-soft">LA</span>
            <div>
              <strong>Nguyễn Lan Anh</strong>
              <small class="text-muted">Đã nộp: ${date(s.submittedAt)} · Đúng hạn</small>
            </div>
          </div>
        </div>
      </div>

      <div class="dashboard-columns review-columns">
        <div class="review-main-column">
          ${studentWorkSection}

          <!-- SECTION 1: AI CHẤM TỰ ĐỘNG -->
          <section class="panel ai-review-panel">
            <div class="panel-head">
              <div class="section-title-wrap">
                <span class="ai-sparkle-icon">✦</span>
                <div>
                  <h2>AI Chấm Tự Động</h2>
                  <p class="text-muted">Đánh giá toàn diện dựa trên 4 tiêu chí chuẩn IELTS.</p>
                </div>
              </div>
              <span class="badge violet"><span class="ai-sparkle">✦</span> Band ${aiEval.overallBand} / 9.0</span>
            </div>

            <div class="ai-overview-callout">
              <div class="ai-callout-icon">${icon('shield')}</div>
              <div class="ai-callout-content">
                <strong>Nhận xét tổng quan từ AI:</strong>
                <p>Bài làm thể hiện khả năng nắm bắt đề bài tốt, cấu trúc rõ ràng và vốn từ vựng phong phú. Để bứt phá lên Band 7.0+, học sinh cần chú ý kiểm soát độ chính xác của các cấu trúc ngữ pháp phức tạp và mở rộng lập luận sâu sắc hơn.</p>
              </div>
            </div>

            <div class="ai-criteria-grid">
              ${criteriaCards}
            </div>
          </section>

          <!-- SECTION 2: CHỈNH SỬA TỪ AI -->
          <section class="panel ai-corrections-panel">
            <div class="panel-head">
              <div class="section-title-wrap">
                <span class="ai-edit-icon">${icon('pen')}</span>
                <div>
                  <h2>Chỉnh sửa từ AI</h2>
                  <p class="text-muted">Phát hiện chi tiết các điểm cần sửa về ngữ pháp, từ vựng và cấu trúc.</p>
                </div>
              </div>
              <span class="badge blue">${aiEval.corrections.length} điểm cần sửa</span>
            </div>

            <div class="annotated-diff-box">
              <div class="annotated-diff-head">
                <strong>Đoạn văn có đánh dấu trực quan:</strong>
                <div class="diff-legend">
                  <span class="legend-del">■ Lỗi gốc</span>
                  <span class="legend-ins">■ Đề xuất sửa</span>
                </div>
              </div>
              <div class="annotated-diff-content">
                In today's digital era, technology <del class="ai-diff-del">make</del><ins class="ai-diff-ins">makes</ins> education more accessible than ever. However, some argue that it <del class="ai-diff-del">cause a big distraction</del><ins class="ai-diff-ins">creates significant distractions</ins> for learners. <del class="ai-diff-del">In the other hand</del><ins class="ai-diff-ins">On the other hand</ins>, digital platforms allow students <del class="ai-diff-del">access</del><ins class="ai-diff-ins">to access</ins> valuable materials anywhere. <del class="ai-diff-del">Although online courses are helpful, but learners</del><ins class="ai-diff-ins">Although online courses are helpful, learners</ins> still require guidance from experienced teachers.
              </div>
            </div>

            <div class="error-cards-list">
              ${errorCards}
            </div>
          </section>

          <!-- SECTION 3: ĐỀ XUẤT CHỈNH SỬA TỪ AI -->
          <section class="panel ai-suggestions-panel">
            <div class="panel-head">
              <div class="section-title-wrap">
                <span class="ai-sparkle-icon green-icon">✦</span>
                <div>
                  <h2>Đề xuất chỉnh sửa từ AI</h2>
                  <p class="text-muted">Gợi ý nâng cấp từ vựng học thuật, cấu trúc câu và chiến lược cải thiện.</p>
                </div>
              </div>
              <span class="badge green">Nâng band 7.0+</span>
            </div>

            <div class="suggestions-sub-block">
              <h3>1. Nâng cấp từ vựng & Collocations học thuật</h3>
              <div class="table-scroll">
                <table class="lexical-table">
                  <thead>
                    <tr>
                      <th>Từ vựng thông dụng</th>
                      <th></th>
                      <th>Từ vựng học thuật nâng cao gợi ý</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${lexicalRows}
                  </tbody>
                </table>
              </div>
            </div>

            <div class="suggestions-sub-block">
              <h3>2. Đề xuất cấu trúc câu nâng cao</h3>
              <ul class="advanced-structures-list">
                ${structureItems}
              </ul>
            </div>

            <div class="suggestions-sub-block">
              <h3>3. Hành động rèn luyện tiếp theo</h3>
              <ol class="next-steps-list">
                ${nextStepItems}
              </ol>
            </div>
          </section>
        </div>

        <!-- ASIDE: SECTION HIỂN THỊ ĐIỂM AI CHẤM VÀ ĐIỂM GIÁO VIÊN CHẤM -->
        <aside class="review-sidebar">
          <section class="panel score-review-panel">
            <div class="panel-head">
              <h2>Tổng hợp điểm số</h2>
              <span class="badge blue">Đồng bộ</span>
            </div>

            <!-- Card: Điểm AI Chấm -->
            <div class="score-card ai-score-card">
              <div class="score-card-head">
                <span class="score-card-tag"><span class="ai-sparkle">✦</span> Điểm AI chấm tự động</span>
                <span class="badge violet">IELTS Band</span>
              </div>
              <div class="score-number-row">
                <strong class="large-score">${aiEval.overallBand}</strong>
                <span class="score-denom">/ 9.0</span>
              </div>
              <div class="criteria-pills-row">
                <span>TA: <strong>6.5</strong></span>
                <span>CC: <strong>6.0</strong></span>
                <span>LR: <strong>7.0</strong></span>
                <span>GRA: <strong>6.5</strong></span>
              </div>
              <p class="score-card-caption">Được phân tích tự động theo 4 tiêu chí chuẩn quốc tế.</p>
            </div>

            <!-- Card: Điểm Giáo Viên Chấm -->
            <div class="score-card teacher-score-card">
              <div class="score-card-head">
                <span class="score-card-tag"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="m16 3 5 5L8 21H3v-5ZM13 6l5 5"/></svg> Điểm giáo viên chấm</span>
                <span class="badge ${teacherScoreTone}">${ui[`teacher-score-${s.id}`] ? 'Đã chấm' : 'Điểm dự kiến'}</span>
              </div>

              ${role === 'teacher' ? `
                <div class="teacher-score-input-section">
                  <label class="teacher-score-label">Điểm chính thức công bố:
                    <div class="teacher-score-input-wrap">
                      <input type="number" step="0.5" min="0" max="9" name="teacherScore" value="${teacherScore}" data-submission="${esc(s.id)}" class="teacher-score-input" required>
                      <span class="teacher-score-unit">/ 9.0</span>
                    </div>
                  </label>
                  <div class="quick-score-chips">
                    <small>Chọn nhanh:</small>
                    <button type="button" class="btn-score-chip ${teacherScore === '6.0' ? 'active' : ''}" data-set-score="6.0">6.0</button>
                    <button type="button" class="btn-score-chip ${teacherScore === '6.5' ? 'active' : ''}" data-set-score="6.5">6.5</button>
                    <button type="button" class="btn-score-chip ${teacherScore === '7.0' ? 'active' : ''}" data-set-score="7.0">7.0</button>
                    <button type="button" class="btn-score-chip ${teacherScore === '7.5' ? 'active' : ''}" data-set-score="7.5">7.5</button>
                    <button type="button" class="btn-score-chip ${teacherScore === '8.0' ? 'active' : ''}" data-set-score="8.0">8.0</button>
                  </div>
                  <div class="sync-score-row">
                    <button type="button" class="btn text btn-xs" data-set-score="${aiEval.overallBand}">✦ Lấy theo điểm AI (${aiEval.overallBand})</button>
                    <span class="autosave-status" id="score-autosave-status">✓ Đã lưu điểm</span>
                  </div>
                </div>
              ` : `
                <div class="score-number-row">
                  <strong class="large-score text-green">${teacherScore}</strong>
                  <span class="score-denom">/ 9.0</span>
                </div>
                <p class="score-card-caption">Điểm chính thức được giáo viên phê duyệt.</p>
              `}
            </div>

            <!-- Nhận xét của giáo viên -->
            ${role === 'teacher' ? `
              <form data-form="feedback" data-submission="${esc(s.id)}" class="teacher-feedback-form">
                <label class="field">Nhận xét của giáo viên
                  <textarea name="feedback" maxlength="3000" placeholder="Viết nhận xét chi tiết, lời khuyên hoặc góp ý cho học sinh...">${esc(ui[`feedback-${s.id}`] || '')}</textarea>
                </label>
                <div class="feedback-status-bar">
                  <span class="autosave-status" id="feedback-autosave-status">✓ Tự động lưu khi gõ</span>
                  <small class="char-count">Tối đa 3000 ký tự</small>
                </div>
              </form>

              <div class="form-actions review-actions">
                ${s.published
                  ? '<span class="badge green-pill">✓ Đã công bố kết quả</span>'
                  : `<button class="btn primary full-width btn-publish" data-publish="${esc(s.id)}"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="m5 12 4 4L19 6"/></svg> Công bố kết quả</button>`
                }
              </div>
              <button class="btn text preview-email-link" type="button" data-action="email-preview">Xem trước email kết quả →</button>
            ` : `
              <div class="student-feedback-box">
                <strong>Nhận xét từ giáo viên:</strong>
                <p>${esc(ui[`feedback-${s.id}`] || 'Chưa có nhận xét bổ sung.')}</p>
              </div>
            `}
          </section>
        </aside>
      </div>
    `;
    return;
  }

  // Reading / Listening questions flow
  const workDetail = a.questions.map((q, index) => `
    <article class="answer-detail">
      <h3>${index + 1}. ${esc(q.text)}</h3>
      <p>Câu trả lời: <strong>${esc(s.answers[index])}</strong></p>
      <p>Đáp án: <strong>${esc(q.accepted.join(' / '))}</strong></p>
      ${badge(grades.details[index] ? 'Chính xác' : 'Cần xem lại', grades.details[index] ? 'green' : 'amber')}
    </article>
  `).join('');

  target.innerHTML = `
    <div class="dashboard-columns review-columns">
      <section class="panel review-work-panel">
        <div class="panel-head">
          <div>
            <h2>${esc(a.title)}</h2>
            <p class="text-muted">Học sinh mẫu · ${date(s.submittedAt)}</p>
          </div>
          ${badge(s.published ? 'Đã công bố' : 'Chờ công bố', s.published ? 'green' : 'amber')}
        </div>
        ${workDetail}
      </section>

      <aside class="review-sidebar">
        <section class="panel score-review-panel">
          <div class="panel-head">
            <h2>Tổng hợp điểm số</h2>
            <span class="badge blue">Đồng bộ</span>
          </div>

          ${role === 'teacher' ? `
            <!-- Card: Điểm Chấm Tự Động -->
            <div class="score-card ai-score-card">
              <div class="score-card-head">
                <span class="score-card-tag"><span class="ai-sparkle">✦</span> Điểm chấm tự động</span>
                <span class="badge blue-soft">Tự động</span>
              </div>
              <div class="score-number-row">
                <strong class="large-score">${s.correct}/${s.total}</strong>
                <span class="score-denom">câu đúng</span>
              </div>
              <p class="score-card-caption">Tỷ lệ chính xác: ${Math.round((s.correct / s.total) * 100)}%</p>
            </div>

            <!-- Card: Điểm Giáo Viên Chấm -->
            <div class="score-card teacher-score-card">
              <div class="score-card-head">
                <span class="score-card-tag"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="m16 3 5 5L8 21H3v-5ZM13 6l5 5"/></svg> Điểm giáo viên chấm</span>
                <span class="badge ${ui[`teacher-score-${s.id}`] ? 'green' : 'blue-soft'}">${ui[`teacher-score-${s.id}`] ? 'Đã xác nhận' : 'Điểm tự động'}</span>
              </div>
              <div class="teacher-score-input-section">
                <label class="teacher-score-label">Điểm chính thức:
                  <div class="teacher-score-input-wrap">
                    <input type="text" name="teacherScore" value="${ui[`teacher-score-${s.id}`] || `${s.correct}/${s.total}`}" data-submission="${esc(s.id)}" class="teacher-score-input">
                  </div>
                </label>
                <div class="sync-score-row">
                  <span class="autosave-status" id="score-autosave-status">✓ Đã lưu điểm</span>
                </div>
              </div>
            </div>
          ` : `
            <div class="score-card">
              <div class="score-card-head">
                <span class="score-card-tag">Điểm bài làm</span>
                <span class="badge green">Đã công bố</span>
              </div>
              <div class="score-number-row">
                <strong class="large-score text-green">${ui[`teacher-score-${s.id}`] || `${s.correct}/${s.total}`}</strong>
                <span class="score-denom">câu đúng</span>
              </div>
              <p class="score-card-caption">Tỷ lệ chính xác: ${Math.round((s.correct / s.total) * 100)}%</p>
            </div>
          `}

          <!-- Nhận xét của giáo viên -->
          ${role === 'teacher' ? `
            <form data-form="feedback" data-submission="${esc(s.id)}" class="teacher-feedback-form">
              <label class="field">Nhận xét của giáo viên
                <textarea name="feedback" maxlength="3000" placeholder="Viết nhận xét chi tiết cho học sinh...">${esc(ui[`feedback-${s.id}`] || '')}</textarea>
              </label>
              <div class="feedback-status-bar">
                <span class="autosave-status" id="feedback-autosave-status">✓ Tự động lưu khi gõ</span>
                <small class="char-count">Tối đa 3000 ký tự</small>
              </div>
            </form>

            <div class="form-actions review-actions">
              ${s.published
                ? '<span class="badge green-pill">✓ Đã công bố kết quả</span>'
                : `<button class="btn primary full-width btn-publish" data-publish="${esc(s.id)}"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="m5 12 4 4L19 6"/></svg> Công bố kết quả</button>`
              }
            </div>
            <button class="btn text preview-email-link" type="button" data-action="email-preview">Xem trước email kết quả →</button>
          ` : `
            <div class="student-feedback-box">
              <strong>Nhận xét từ giáo viên:</strong>
              <p>${esc(ui[`feedback-${s.id}`] || 'Chưa có nhận xét bổ sung.')}</p>
            </div>
          `}
        </section>
      </aside>
    </div>
  `;
}
function renderAudit() {
  if (!$('#audit-list')) return;
  const logs = Array.isArray(ui.audit) ? ui.audit : [];
  $('#audit-list').innerHTML = logs.length ? `<div class="table-scroll"><table><thead><tr><th>Thời gian</th><th>Vai trò mẫu</th><th>Hành động</th></tr></thead><tbody>${logs.map(l => `<tr data-searchable="${esc(l.action)}"><td>${date(l.at)}</td><td>${esc(l.role)}</td><td>${esc(l.action)}</td></tr>`).join('')}</tbody></table></div>` : blank('Chưa có nhật ký mẫu', 'Thử tạo lớp, giao bài hoặc lưu cấu hình để xem hoạt động ở đây.');
}

function setupAdminSpa() {
  if (page !== 'admin.html') return;
  const titles = { overview:'Tổng quan hệ thống', users:'Quản lý người dùng', 'user-detail':'Thông tin người dùng', prompt:'Cấu hình AI', quota:'Hạn mức sử dụng', settings:'Cài đặt hệ thống', audit:'Nhật ký hoạt động' };
  const aiRoutes = new Set(['prompt', 'quota', 'settings']);
  const show = () => {
    const route = location.hash.slice(1);
    const active = Object.hasOwn(titles, route) ? route : 'overview';
    if (route !== active) history.replaceState(null, '', '#overview');
    $$('[data-admin-panel]').forEach(panel => { panel.hidden = panel.dataset.adminPanel !== active; });
    $$('[data-admin-route]').forEach(anchor => {
      const current = anchor.dataset.adminRoute === active;
      anchor.classList.toggle('active', current);
      if (current) anchor.setAttribute('aria-current', 'page'); else anchor.removeAttribute('aria-current');
    });
    const aiActive = aiRoutes.has(active);
    const group = $('.admin-ai-nav');
    group?.classList.toggle('group-active', aiActive);
    group?.classList.toggle('is-open', aiActive);
    const trigger = $('[data-admin-ai-trigger]');
    trigger?.classList.toggle('active', aiActive);
    if (aiActive) trigger?.setAttribute('aria-current', 'page'); else trigger?.removeAttribute('aria-current');
    const crumb = $('[data-admin-breadcrumb]');
    if (crumb) crumb.textContent = titles[active];
    document.title = `${titles[active]} | English Assistant`;
  };
  window.addEventListener('hashchange', show);
  show();
}

const adminWritingPromptTypes = {
  task1: ['Line Graph', 'Bar Graph', 'Pie Graph', 'Table', 'Map', 'Process', 'Mixed Chart'],
  task2: ['Agree & Disagree', 'Advantages & Disadvantages', 'Discuss both views', 'Problem & Solution', 'Two-part question'],
};
function promptRowMarkup(kind, index) {
  const remove = `<button class="class-student-action delete" type="button" data-action="remove-prompt-row" aria-label="Xóa prompt ${index + 1}" title="Xóa prompt">${assignmentActionIcon('delete')}</button>`;
  const name = `<label class="prompt-row-name"><span class="sr-only">Tên prompt</span><input name="promptName${index}" data-prompt-name value="Prompt ${index + 1}" maxlength="120" aria-label="Tên prompt"></label>`;
  if (kind === 'writing-prompts') return `<details class="prompt-row" data-prompt-row><summary>${name}${remove}</summary><div class="prompt-row-content"><div class="prompt-row-controls"><label class="field">Part<select name="writingPart${index}" data-writing-prompt-part aria-label="Part"><option value="task1">Part 1</option><option value="task2">Part 2</option></select></label><label class="field">Dạng<select name="writingType${index}" data-writing-prompt-type aria-label="Dạng"></select></label></div><div class="prompt-row-fields"><label class="field">Prompt TA<textarea name="writingTa${index}" rows="4" maxlength="10000" placeholder="Nhập prompt Task Achievement..."></textarea></label><label class="field">Prompt LR<textarea name="writingLr${index}" rows="4" maxlength="10000" placeholder="Nhập prompt Lexical Resource..."></textarea></label><label class="field">Prompt GRA<textarea name="writingGra${index}" rows="4" maxlength="10000" placeholder="Nhập prompt Grammar Range & Accuracy..."></textarea></label></div></div></details>`;
  return `<details class="prompt-row prompt-row-speaking" data-prompt-row><summary>${name}${remove}</summary><div class="prompt-row-content"><div class="prompt-row-controls"><label class="field">Speaking task<select name="speakingTask${index}" data-speaking-prompt-task aria-label="Speaking task"><option>Speaking Task 1</option><option>Speaking Task 2</option><option>Speaking Task 3</option></select></label></div><div class="prompt-row-fields"><label class="field">Prompt GRLR<textarea name="speakingGrlr${index}" rows="4" maxlength="10000" placeholder="Nhập prompt Grammatical Range & Lexical Resource..."></textarea></label><label class="field">Prompt FCPR<textarea name="speakingFcpr${index}" rows="4" maxlength="10000" placeholder="Nhập prompt Fluency, Coherence, Pronunciation & Relevance..."></textarea></label></div></div></details>`;
}
function updateWritingPromptType(row) {
  const part = $('[data-writing-prompt-part]', row)?.value === 'task2' ? 'task2' : 'task1';
  const type = $('[data-writing-prompt-type]', row);
  if (!type) return;
  const current = type.value;
  type.innerHTML = adminWritingPromptTypes[part].map(value => `<option value="${value}">${value}</option>`).join('');
  if (adminWritingPromptTypes[part].includes(current)) type.value = current;
}
function syncPromptRows(form) {
  const kind = form.dataset.form;
  const rows = $$('[data-prompt-row]', form);
  rows.forEach((row, index) => {
    const name = $('[data-prompt-name]', row);
    name.name = `promptName${index}`;
    if (!name.value.trim()) name.value = `Prompt ${index + 1}`;
    $('[data-action="remove-prompt-row"]', row).disabled = rows.length === 1;
    $('[data-action="remove-prompt-row"]', row).setAttribute('aria-label', `Xóa prompt ${index + 1}`);
    if (kind === 'writing-prompts') {
      $('[data-writing-prompt-part]', row).name = `writingPart${index}`;
      $('[data-writing-prompt-type]', row).name = `writingType${index}`;
      $('textarea[name^="writingTa"]', row).name = `writingTa${index}`;
      $('textarea[name^="writingLr"]', row).name = `writingLr${index}`;
      $('textarea[name^="writingGra"]', row).name = `writingGra${index}`;
      updateWritingPromptType(row);
    } else {
      $('[data-speaking-prompt-task]', row).name = `speakingTask${index}`;
      $('textarea[name^="speakingGrlr"]', row).name = `speakingGrlr${index}`;
      $('textarea[name^="speakingFcpr"]', row).name = `speakingFcpr${index}`;
    }
  });
}
function setupPromptEditors() {
  if (page !== 'admin.html') return;
  for (const form of $$('form[data-form="writing-prompts"], form[data-form="speaking-prompts"]')) {
    const list = $('[data-prompt-list]', form);
    const savedCount = Number(ui[`prompt-row-count-${form.dataset.form}`]);
    const count = Number.isInteger(savedCount) ? Math.min(Math.max(savedCount, 1), 20) : 1;
    while (list.children.length < count) list.insertAdjacentHTML('beforeend', promptRowMarkup(form.dataset.form, list.children.length));
    syncPromptRows(form);
  }
}

let calendarMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
function renderCalendar() {
  const container = $('#calendar'); if (!container) return;
  const month = calendarMonth.getMonth(), year = calendarMonth.getFullYear();
  $('#calendar-title').textContent = `Tháng ${month + 1}, ${year}`;
  const classId = params.get('id') || params.get('classId') || state?.classes[0]?.id;
  const deadlinesByDate = new Map();
  for (const assignment of state?.assignments || []) {
    if (classId && assignment.classId !== classId) continue;
    const deadline = new Date(assignment.deadline);
    if (!Number.isFinite(deadline.getTime())) continue;
    const dateKey = `${deadline.getFullYear()}-${deadline.getMonth()}-${deadline.getDate()}`;
    const events = deadlinesByDate.get(dateKey) || [];
    events.push(assignment);
    deadlinesByDate.set(dateKey, events);
  }
  const first = (new Date(year, month, 1).getDay() + 6) % 7;
  const count = new Date(year, month + 1, 0).getDate();
  const now = new Date();
  let html = ['T2','T3','T4','T5','T6','T7','CN'].map(day => `<div class="calendar-day-name">${day}</div>`).join('');
  const cells = Math.ceil((first + count) / 7) * 7;
  for (let index = 0; index < cells; index++) {
    const day = index - first + 1; const outside = day < 1 || day > count;
    const current = !outside && day === now.getDate() && month === now.getMonth() && year === now.getFullYear();
    const localDate = new Date(year, month, day);
    const dateKey = `${localDate.getFullYear()}-${localDate.getMonth()}-${localDate.getDate()}`;
    const deadlines = (deadlinesByDate.get(dateKey) || []).map(assignment => `<div class="calendar-event amber deadline-event"><strong>Hạn nộp</strong><span>${esc(assignment.title)}</span></div>`).join('');
    html += `<div class="calendar-cell ${outside ? 'outside' : ''} ${current ? 'today' : ''}"><span class="day-number">${localDate.getDate()}</span>${deadlines}</div>`;
  }
  container.innerHTML = html;
}
function applyFilter() {
  const query = ($('[data-search]')?.value || '').toLocaleLowerCase('vi').trim();
  const status = $('[data-filter]')?.value || 'Tất cả';
  const rows = $$('[data-searchable], [data-filter-table] tbody tr');
  let visible = 0;
  rows.forEach(row => { const text = (row.dataset.searchable || row.textContent).toLocaleLowerCase('vi'); row.hidden = !(text.includes(query) && (status === 'Tất cả' || row.textContent.includes(status))); if (!row.hidden) visible++; });
  if ($('.filter-empty')) $('.filter-empty').hidden = !rows.length || visible > 0;
}
function draftFields(form) {
  const fields = Object.fromEntries([...new FormData(form)].filter(([key, value]) => !(value instanceof File) && !/password|apiKey|confirm/i.test(key)));
  for (const checkbox of $$('input[type="checkbox"][name]:not(:disabled)', form)) fields[checkbox.name] = checkbox.checked ? 'on' : 'off';
  return fields;
}
const formKey = form => `form-${page}-${form.dataset.form}-${$$(`form[data-form="${form.dataset.form}"]`).indexOf(form)}`;
const assignmentSkills = ['Reading', 'Listening', 'Writing', 'Speaking'];
const writingTypes = {
  'Task 1': ['Line Graph', 'Bar Graph', 'Pie Graph', 'Table', 'Map', 'Process', 'Mixed Chart'],
  'Task 2': ['Agree & Disagree', 'Advantages & Disadvantages', 'Discuss both views', 'Problem & Solution', 'Two part questions'],
};
const speakingTasks = ['Speaking Task 1', 'Speaking Task 2', 'Speaking Task 3'];
const questionSkills = new Set(['Reading', 'Listening']);
const richEditorRanges = new WeakMap();
const sectionAudioUrls = new WeakMap();
function sanitizeRichHtml(html = '') {
  const template = document.createElement('template');
  template.innerHTML = String(html);
  const allowed = new Set(['P','DIV','BR','STRONG','B','EM','I','U','UL','OL','LI','FONT','IMG']);
  const clean = root => {
    [...root.childNodes].forEach(node => {
      if (node.nodeType === Node.COMMENT_NODE) { node.remove(); return; }
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      clean(node);
      const tag = node.tagName;
      if (!allowed.has(tag)) { node.replaceWith(...node.childNodes); return; }
      const src = node.getAttribute('src') || '';
      const alt = node.getAttribute('alt') || '';
      const size = node.getAttribute('size') || '';
      const width = node.getAttribute('width') || '';
      const alignment = node.getAttribute('align') || '';
      const textAlignment = (node.style?.textAlign || '').toLowerCase();
      const isImageBlock = node.hasAttribute('data-rich-image-block');
      [...node.attributes].forEach(attribute => node.removeAttribute(attribute.name));
      if (tag === 'IMG') {
        if (!/^data:image\/(?:png|jpe?g|gif|webp);base64,/i.test(src)) { node.remove(); return; }
        node.setAttribute('src', src);
        node.setAttribute('alt', alt.slice(0, 200));
        if (/^\d{1,4}$/.test(width) && Number(width) > 0) node.setAttribute('width', width);
      }
      if (tag === 'FONT' && /^[1-7]$/.test(size)) node.setAttribute('size', size);
      if ((tag === 'P' || tag === 'DIV') && /^(left|right|center|justify)$/.test(textAlignment || alignment)) {
        node.style.textAlign = textAlignment || alignment;
      }
      if (tag === 'DIV' && isImageBlock) node.setAttribute('data-rich-image-block', '');
    });
  };
  clean(template.content);
  return template.innerHTML;
}
function renderRichText(html, fallback = '') {
  const clean = sanitizeRichHtml(html);
  return clean || `<p>${esc(fallback || 'Chưa có nội dung.')}</p>`;
}
// Image controls live outside contenteditable so they never enter saved content
// or interfere with the editor's text selection and formatting commands.
function setupRichImageResizing() {
  if (!$('[data-assignment-sections]')) return;
  const frame = document.createElement('div');
  frame.className = 'rich-image-resizer';
  frame.hidden = true;
  frame.innerHTML = ['nw', 'ne', 'sw', 'se'].map(corner => `<button type="button" class="rich-image-handle ${corner}" data-resize-corner="${corner}" aria-label="Đổi kích thước ảnh (${corner})" title="Kéo để đổi kích thước ảnh; dùng phím mũi tên để tinh chỉnh"></button>`).join('');
  document.body.append(frame);
  let selectedImage = null;
  let drag = null;
  const position = () => {
    if (!selectedImage?.isConnected || !selectedImage.getClientRects().length) { frame.hidden = true; return; }
    const rect = selectedImage.getBoundingClientRect();
    Object.assign(frame.style, { left:`${rect.left}px`, top:`${rect.top}px`, width:`${rect.width}px`, height:`${rect.height}px` });
    frame.hidden = false;
  };
  const observer = new ResizeObserver(position);
  const select = img => {
    observer.disconnect();
    selectedImage = img;
    if (img) { observer.observe(img); position(); }
    else frame.hidden = true;
  };
  const resize = width => {
    const editor = selectedImage.closest('[data-rich-content]');
    const style = getComputedStyle(editor);
    const max = editor.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    selectedImage.setAttribute('width', String(Math.round(Math.max(Math.min(48, max), Math.min(max, width)))));
    position();
  };
  document.addEventListener('click', event => {
    if (frame.contains(event.target)) return;
    select(event.target.matches('[data-rich-content] img') ? event.target : null);
  });
  frame.addEventListener('pointerdown', event => {
    const handle = event.target.closest('[data-resize-corner]');
    if (!handle || !selectedImage || event.button !== 0) return;
    event.preventDefault();
    const rect = selectedImage.getBoundingClientRect();
    drag = { x:event.clientX, y:event.clientY, width:rect.width, ratio:rect.width / rect.height, corner:handle.dataset.resizeCorner };
    handle.setPointerCapture(event.pointerId);
  });
  frame.addEventListener('pointermove', event => {
    if (!drag) return;
    const dx = (event.clientX - drag.x) * (drag.corner.endsWith('e') ? 2 : -2);
    const dy = (event.clientY - drag.y) * (drag.corner.startsWith('s') ? 1 : -1) * drag.ratio;
    resize(drag.width + (Math.abs(dx) >= Math.abs(dy) ? dx : dy));
  });
  const finish = () => { drag = null; };
  frame.addEventListener('pointerup', finish);
  frame.addEventListener('pointercancel', finish);
  frame.addEventListener('lostpointercapture', finish);
  frame.addEventListener('keydown', event => {
    if (!selectedImage || !['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    resize(selectedImage.getBoundingClientRect().width + (['ArrowRight','ArrowDown'].includes(event.key) ? 10 : -10));
  });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') select(null); });
  document.addEventListener('input', position);
  window.addEventListener('scroll', position, true);
  window.addEventListener('resize', position);
}
function assignmentOptionTemplate(questionId, value = '', index = 0, correctIndex = 0) {
  return `<div class="assignment-option" data-assignment-option><input type="radio" name="correct-${esc(questionId)}" value="${index}" data-correct-option ${index === correctIndex ? 'checked' : ''} aria-label="Đặt đáp án ${index + 1} là đáp án đúng"><input type="text" value="${esc(value)}" maxlength="500" data-option-text aria-label="Đáp án ${index + 1}" placeholder="Nhập câu trả lời"><button class="icon-btn remove-option" type="button" data-action="remove-assignment-option" aria-label="Xóa đáp án ${index + 1}">×</button></div>`;
}
function assignmentQuestionTemplate(question = {}, index = 0) {
  const questionId = question.id || id();
  const options = Array.isArray(question.options) && question.options.length >= 2 ? question.options : ['', ''];
  const correctIndex = Number.isInteger(question.correctIndex) ? question.correctIndex : 0;
  return `<article class="assignment-question" data-assignment-question data-question-id="${esc(questionId)}"><div class="assignment-question-head"><h4>Câu hỏi ${index + 1}</h4><button class="btn text remove-question" type="button" data-action="remove-assignment-question">Xóa câu hỏi</button></div><label class="field">Nội dung câu hỏi<input type="text" maxlength="500" value="${esc(question.text || '')}" data-question-text placeholder="Nhập câu hỏi"></label><fieldset class="assignment-options"><legend>Câu trả lời</legend><p class="caption">Chọn nút tròn trước đáp án đúng.</p><div data-assignment-options>${options.map((option, optionIndex) => assignmentOptionTemplate(questionId, option, optionIndex, correctIndex)).join('')}</div><button class="btn text add-option" type="button" data-action="add-assignment-option">+ Thêm câu trả lời</button></fieldset></article>`;
}
function supportsQuestions(skill) { return questionSkills.has(skill); }
function questionHeading(skill) { return `Câu hỏi ${skill}`; }
function selectionIsInRichEditor(editor) {
  const selection = document.getSelection();
  if (!selection?.rangeCount) return false;
  const node = selection.getRangeAt(0).commonAncestorContainer;
  const element = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
  return element?.closest?.('[data-rich-content]') === editor;
}
function restoreRichEditorRange(editor) {
  const range = richEditorRanges.get(editor);
  if (!range) return;
  const selection = document.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
}
function saveRichEditorRange(editor) {
  const selection = document.getSelection();
  if (selection?.rangeCount) richEditorRanges.set(editor, selection.getRangeAt(0).cloneRange());
}
function updateRichToolbar(editor) {
  const toolbar = editor.closest('[data-rich-editor]')?.querySelector('.rich-toolbar');
  if (!toolbar || document.activeElement !== editor) return;
  for (const button of $$('[data-command]', toolbar)) {
    const active = document.queryCommandState(button.dataset.command);
    button.classList.toggle('active', active);
    button.setAttribute(button.getAttribute('role') === 'menuitemradio' ? 'aria-checked' : 'aria-pressed', String(active));
  }
  const activeList = ['insertUnorderedList', 'insertOrderedList'].find(command => document.queryCommandState(command));
  const listTrigger = $('[data-rich-list-trigger]', toolbar);
  if (listTrigger) {
    $('[data-rich-menu-icon]', listTrigger).innerHTML = icon(activeList === 'insertOrderedList' ? 'orderedList' : 'list');
    listTrigger.setAttribute('aria-label', activeList === 'insertOrderedList' ? 'Danh sách đánh số' : 'Danh sách');
  }
  const activeAlignment = ['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull'].find(command => document.queryCommandState(command)) || 'justifyLeft';
  const alignmentTrigger = $('[data-rich-align-trigger]', toolbar);
  if (alignmentTrigger) {
    $('[data-rich-menu-icon]', alignmentTrigger).innerHTML = icon({ justifyLeft:'alignLeft', justifyCenter:'alignCenter', justifyRight:'alignRight', justifyFull:'alignJustify' }[activeAlignment]);
    alignmentTrigger.setAttribute('aria-label', { justifyLeft:'Căn lề trái', justifyCenter:'Căn giữa', justifyRight:'Căn lề phải', justifyFull:'Căn đều hai bên' }[activeAlignment]);
  }
}
function runRichCommand(editor, command, value = null) {
  // A toolbar click preserves the live selection. Prefer that exact caret over
  // an older saved range, otherwise toggling a style can target typed text behind it.
  const hasLiveSelection = selectionIsInRichEditor(editor);
  editor.focus({ preventScroll:true });
  if (!hasLiveSelection) restoreRichEditorRange(editor);
  // Ask the browser for semantic tags (<strong>, <em>, <u>) instead of inline CSS.
  document.execCommand('styleWithCSS', false, false);
  document.execCommand(command, false, value);
  saveRichEditorRange(editor);
  requestAnimationFrame(() => { saveRichEditorRange(editor); updateRichToolbar(editor); });
}
function richEditorInsertionRange(editor) {
  const hasLiveSelection = selectionIsInRichEditor(editor);
  editor.focus({ preventScroll:true });
  if (!hasLiveSelection) restoreRichEditorRange(editor);
  const selection = document.getSelection();
  if (selection?.rangeCount && selectionIsInRichEditor(editor)) return selection.getRangeAt(0).cloneRange();
  const range = document.createRange();
  range.selectNodeContents(editor);
  range.collapse(false);
  return range;
}
function insertRichImageAtCaret(editor, source, alt) {
  const range = richEditorInsertionRange(editor);
  range.deleteContents();
  const block = document.createElement('div');
  block.dataset.richImageBlock = '';
  const image = document.createElement('img');
  image.src = source;
  image.alt = alt.slice(0, 200);
  image.draggable = true;
  block.append(image);
  range.insertNode(block);
  const caret = document.createRange();
  caret.setStartAfter(block);
  caret.collapse(true);
  const selection = document.getSelection();
  selection.removeAllRanges();
  selection.addRange(caret);
  saveRichEditorRange(editor);
  editor.dispatchEvent(new Event('input', { bubbles:true }));
  return image;
}
function caretRangeAtPoint(editor, x, y) {
  const range = document.caretRangeFromPoint?.(x, y);
  if (range && editor.contains(range.commonAncestorContainer)) return range;
  const position = document.caretPositionFromPoint?.(x, y);
  if (position && editor.contains(position.offsetNode)) {
    const next = document.createRange();
    next.setStart(position.offsetNode, position.offset);
    next.collapse(true);
    return next;
  }
  const end = document.createRange();
  end.selectNodeContents(editor);
  end.collapse(false);
  return end;
}
function setupRichImageDragging() {
  let draggedImage = null;
  let draggedNode = null;
  let dropMarker = null;
  const clearDropMarker = () => {
    if (dropMarker?.isConnected) dropMarker.remove();
    dropMarker = null;
  };
  const placeDropMarker = (editor, x, y) => {
    const range = caretRangeAtPoint(editor, x, y);
    clearDropMarker();
    dropMarker = document.createElement('span');
    dropMarker.dataset.richDropMarker = '';
    dropMarker.setAttribute('aria-hidden', 'true');
    range.insertNode(dropMarker);
  };
  document.addEventListener('dragstart', event => {
    const image = event.target.closest?.('[data-rich-content] img');
    if (!image) return;
    draggedImage = image;
    draggedNode = image.closest('[data-rich-image-block]') || image;
    image.classList.add('is-dragging');
    document.body.classList.add('rich-image-dragging');
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', '');
  });
  document.addEventListener('dragover', event => {
    if (!draggedImage) return;
    const editor = event.target.closest?.('[data-rich-content]');
    if (!editor || editor !== draggedNode.closest('[data-rich-content]')) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    editor.classList.add('is-image-dragover');
    placeDropMarker(editor, event.clientX, event.clientY);
  });
  document.addEventListener('dragleave', event => {
    const editor = event.target.closest?.('[data-rich-content]');
    if (editor && !editor.contains(event.relatedTarget)) editor.classList.remove('is-image-dragover');
  });
  document.addEventListener('drop', event => {
    if (!draggedImage) return;
    const editor = event.target.closest?.('[data-rich-content]');
    if (!editor || editor !== draggedNode.closest('[data-rich-content]')) return;
    event.preventDefault();
    if (dropMarker?.isConnected) dropMarker.replaceWith(draggedNode);
    else caretRangeAtPoint(editor, event.clientX, event.clientY).insertNode(draggedNode);
    const range = document.createRange();
    range.setStartAfter(draggedNode);
    range.collapse(true);
    const selection = document.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    editor.classList.remove('is-image-dragover');
    editor.dispatchEvent(new Event('input', { bubbles:true }));
  });
  document.addEventListener('dragend', () => {
    if (draggedImage?.isConnected) draggedImage.classList.remove('is-dragging');
    $$('[data-rich-content].is-image-dragover').forEach(editor => editor.classList.remove('is-image-dragover'));
    document.body.classList.remove('rich-image-dragging');
    clearDropMarker();
    draggedImage = null;
    draggedNode = null;
  });
}
function richFormatMenuTemplate(sectionId, type) {
  const isList = type === 'list';
  const menuId = 'rich-menu-' + sectionId + '-' + type;
  const trigger = isList
    ? '<button type="button" class="rich-tool rich-menu-trigger" data-action="toggle-rich-dropdown" data-rich-list-trigger aria-label="Danh sách" aria-haspopup="menu" aria-expanded="false" aria-controls="' + esc(menuId) + '"><span data-rich-menu-icon>' + icon('list') + '</span>' + icon('chevronDown', 'rich-menu-chevron') + '</button>'
    : '<button type="button" class="rich-tool rich-menu-trigger" data-action="toggle-rich-dropdown" data-rich-align-trigger aria-label="Căn lề trái" aria-haspopup="menu" aria-expanded="false" aria-controls="' + esc(menuId) + '"><span data-rich-menu-icon>' + icon('alignLeft') + '</span>' + icon('chevronDown', 'rich-menu-chevron') + '</button>';
  const options = isList
    ? [['insertUnorderedList', 'list', 'Danh sách dấu đầu dòng'], ['insertOrderedList', 'orderedList', 'Danh sách đánh số']]
    : [['justifyLeft', 'alignLeft', 'Căn lề trái'], ['justifyCenter', 'alignCenter', 'Căn giữa'], ['justifyRight', 'alignRight', 'Căn lề phải'], ['justifyFull', 'alignJustify', 'Căn đều hai bên']];
  return '<div class="rich-dropdown" data-rich-dropdown>' + trigger + '<div id="' + esc(menuId) + '" class="rich-dropdown-menu rich-' + type + '-menu" role="menu" aria-label="' + (isList ? 'Kiểu danh sách' : 'Căn lề') + '" hidden>' + options.map(([command, iconName, label]) => '<button type="button" class="rich-dropdown-option" role="menuitemradio" aria-checked="false" data-action="rich-command" data-command="' + command + '" aria-label="' + label + '" title="' + label + '">' + icon(iconName) + (isList ? '<span>' + label + '</span>' : '<span class="sr-only">' + label + '</span>') + '</button>').join('') + '</div></div>';
}
function closeRichDropdowns(except = null) {
  $$('[data-rich-dropdown].is-open').forEach(dropdown => {
    if (dropdown === except) return;
    dropdown.classList.remove('is-open');
    const trigger = $('[data-action="toggle-rich-dropdown"]', dropdown);
    const menu = $('.rich-dropdown-menu', dropdown);
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
    if (menu) menu.hidden = true;
  });
}
function toggleRichDropdown(trigger) {
  const dropdown = trigger.closest('[data-rich-dropdown]');
  const menu = $('.rich-dropdown-menu', dropdown);
  const opening = !dropdown.classList.contains('is-open');
  closeRichDropdowns(dropdown);
  dropdown.classList.toggle('is-open', opening);
  trigger.setAttribute('aria-expanded', String(opening));
  menu.hidden = !opening;
}
function richEditorTemplate(sectionId, content = '') {
  return '<div class="rich-editor" data-rich-editor><div class="rich-toolbar" role="toolbar" aria-label="Công cụ định dạng nội dung"><button type="button" class="rich-tool" data-action="rich-command" data-command="bold" aria-label="In đậm" aria-pressed="false"><strong>B</strong></button><button type="button" class="rich-tool" data-action="rich-command" data-command="italic" aria-label="In nghiêng" aria-pressed="false"><em>I</em></button><button type="button" class="rich-tool" data-action="rich-command" data-command="underline" aria-label="Gạch chân" aria-pressed="false"><u>U</u></button><label class="rich-size-label"><span class="sr-only">Kích thước chữ</span><select data-rich-size aria-label="Kích thước chữ"><option value="3">Cỡ vừa</option><option value="2">Cỡ nhỏ</option><option value="4">Cỡ lớn</option><option value="5">Tiêu đề</option></select></label>' + richFormatMenuTemplate(sectionId, 'list') + '<span class="rich-toolbar-separator" aria-hidden="true"></span>' + richFormatMenuTemplate(sectionId, 'alignment') + '<label class="rich-tool rich-image-tool" title="Chèn ảnh tại vị trí con trỏ">Ảnh<input type="file" accept="image/png,image/jpeg,image/gif,image/webp" data-rich-image aria-label="Chèn ảnh tại vị trí con trỏ"></label></div><div class="rich-content" contenteditable="true" role="textbox" aria-multiline="true" aria-label="Nội dung section" data-rich-content data-placeholder="Nhập nội dung bài tập..." data-section-editor="' + esc(sectionId) + '">' + sanitizeRichHtml(content) + '</div></div>';
}
function listeningAudioTemplate(sectionId, audioName = '') {
  const helpId = `listening-audio-help-${sectionId}`;
  return `<div class="listening-audio-field" data-listening-audio hidden><label class="field">Tải file bài nghe<input type="file" accept="audio/*,.mp3,.wav,.m4a,.ogg" data-section-audio aria-describedby="${esc(helpId)}"></label><p id="${esc(helpId)}" class="caption">Chọn file MP3, WAV, M4A hoặc OGG (tối đa 50 MB).</p><p class="selected-audio-name" data-section-audio-name ${audioName ? '' : 'hidden'}>${audioName ? `Đã chọn: ${esc(audioName)}` : ''}</p><audio controls data-section-audio-preview hidden></audio></div>`;
}
function sectionTaskOptions(section) {
  const part = Object.hasOwn(writingTypes, section.writingPart) ? section.writingPart : 'Task 1';
  const options = (values, selected) => values.map(value => `<option value="${esc(value)}" ${value === selected ? 'selected' : ''}>${esc(value)}</option>`).join('');
  return `<div class="assignment-section-meta" data-writing-options hidden><label class="field">Part<select data-writing-part>${options(Object.keys(writingTypes), part)}</select></label><label class="field">Dạng bài<select data-writing-type>${options(writingTypes[part], section.writingType)}</select></label></div><div data-speaking-options hidden><label class="field">Speaking Task<select data-speaking-task>${options(speakingTasks, section.speakingTask)}</select></label></div>`;
}
function updateWritingTypes(section) {
  const part = $('[data-writing-part]', section).value;
  const field = $('[data-writing-type]', section);
  const previous = field.value;
  field.innerHTML = writingTypes[part].map(value => `<option value="${esc(value)}">${esc(value)}</option>`).join('');
  if (writingTypes[part].includes(previous)) field.value = previous;
}
function sectionTaskSummary(section) {
  if (section.skill === 'Writing' && section.writingPart) return `<p>${esc(section.writingPart)} · ${esc(section.writingType || '')}</p>`;
  if (section.skill === 'Speaking' && section.speakingTask) return `<p>${esc(section.speakingTask)}</p>`;
  return '';
}
function assignmentSectionTemplate(section = {}, index = 0) {
  // Keep the editor outside a <label>: label activation forwards clicks on the
  // editable surface to its first labelable control (the Bold toolbar button).
  const sectionId = section.id || id();
  const skill = assignmentSkills.includes(section.skill) ? section.skill : 'Reading';
  const questions = Array.isArray(section.questions) && section.questions.length ? section.questions : [{}];
  return `<article class="assignment-builder-section" data-assignment-section data-section-id="${esc(sectionId)}" data-audio-name="${esc(section.audioName || '')}"><div class="assignment-section-head"><div><span class="section-number">Section ${index + 1}</span><h3>Phần nội dung bài tập</h3></div><button class="btn text remove-section" type="button" data-action="remove-assignment-section">Xóa section</button></div><div class="assignment-section-meta"><label class="field">Loại bài tập<select data-section-skill>${assignmentSkills.map(option => `<option ${option === skill ? 'selected' : ''}>${option}</option>`).join('')}</select></label><label class="field">Tên bài tập<input type="text" maxlength="150" value="${esc(section.title || '')}" data-section-title placeholder="Ví dụ A visit to the library"></label></div>${sectionTaskOptions(section)}${listeningAudioTemplate(sectionId, section.audioName || '')}<div class="field assignment-content-label"><span data-content-label>${skill === 'Reading' ? 'Nội dung đoạn đọc' : 'Nội dung bài tập'}</span>${richEditorTemplate(sectionId, section.content || '')}</div><div class="reading-question-builder" data-assignment-question-builder ${supportsQuestions(skill) ? '' : 'hidden'}><div class="question-builder-heading"><div><h3 data-question-heading>${questionHeading(skill)}</h3><p>Mỗi câu hỏi cần ít nhất hai đáp án.</p></div><button class="btn outline" type="button" data-action="add-assignment-question">+ Thêm câu hỏi</button></div><div class="assignment-question-list" data-assignment-questions>${questions.map(assignmentQuestionTemplate).join('')}</div></div></article>`;
}
function renumberAssignmentBuilder() {
  const sections = $$('[data-assignment-section]');
  sections.forEach((section, sectionIndex) => {
    $('.section-number', section).textContent = `Section ${sectionIndex + 1}`;
    $('.remove-section', section).disabled = sections.length === 1;
    $('.remove-section', section).setAttribute('aria-label', `Xóa section ${sectionIndex + 1}`);
    $$('[data-assignment-question]', section).forEach((question, questionIndex) => {
      $('h4', question).textContent = `Câu hỏi ${questionIndex + 1}`;
      $('.remove-question', question).disabled = $$('[data-assignment-question]', section).length === 1;
      const questionId = question.dataset.questionId;
      const options = $$('[data-assignment-option]', question);
      options.forEach((option, optionIndex) => {
        const radio = $('[data-correct-option]', option);
        const input = $('[data-option-text]', option);
        const remove = $('[data-action="remove-assignment-option"]', option);
        radio.name = `correct-${questionId}`;
        radio.value = String(optionIndex);
        radio.setAttribute('aria-label', `Đặt đáp án ${optionIndex + 1} là đáp án đúng`);
        input.setAttribute('aria-label', `Đáp án ${optionIndex + 1}`);
        remove.setAttribute('aria-label', `Xóa đáp án ${optionIndex + 1}`);
        remove.disabled = options.length <= 2;
      });
    });
  });
}
function updateAssignmentSection(section) {
  const skill = $('[data-section-skill]', section).value;
  $('[data-writing-options]', section).hidden = skill !== 'Writing';
  $('[data-speaking-options]', section).hidden = skill !== 'Speaking';
  $('[data-listening-audio]', section).hidden = skill !== 'Listening';
  $('[data-assignment-question-builder]', section).hidden = !supportsQuestions(skill);
  $('[data-question-heading]', section).textContent = questionHeading(skill);
  $('[data-content-label]', section).textContent = skill === 'Reading' ? 'Nội dung đoạn đọc' : 'Nội dung bài tập';
}
function serializeAssignmentSections() {
  return $$('[data-assignment-section]').map(section => {
    const editor = $('[data-rich-content]', section);
    const skill = $('[data-section-skill]', section).value;
    return {
      id: section.dataset.sectionId,
      skill,
      title: $('[data-section-title]', section).value.trim(),
      content: sanitizeRichHtml(editor.innerHTML),
      contentText: editor.innerText.trim(),
      writingPart: $('[data-writing-part]', section).value,
      writingType: $('[data-writing-type]', section).value,
      speakingTask: $('[data-speaking-task]', section).value,
      audioName: section.dataset.audioName || '',
      audioDataUrl: section.dataset.audioDataUrl || '',
      questions: supportsQuestions(skill) ? $$('[data-assignment-question]', section).map(question => {
        const options = $$('[data-option-text]', question).map(option => option.value.trim());
        const selected = $('[data-correct-option]:checked', question);
        return { id: question.dataset.questionId, text: $('[data-question-text]', question).value.trim(), options, correctIndex: selected ? Number(selected.value) : -1 };
      }) : []
    };
  });
}
function editedAssignment() {
  const assignmentId = params.get('edit');
  return assignmentId ? state?.assignments.find(assignment => assignment.id === assignmentId) : null;
}
function dateTimeLocalValue(dateValue) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date(dateValue)).filter(part => part.type !== 'literal').map(part => [part.type, part.value]));
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}
function assignmentEditDraft(assignment) {
  const sections = Array.isArray(assignment.sections) && assignment.sections.length
    ? assignment.sections
    : [{ skill: assignment.skill, title: assignment.title, content: assignment.passageHtml || assignment.passage, contentText: assignment.passage, questions: assignment.questions }];
  return {
    assignmentTitle: assignment.title,
    deadline: dateTimeLocalValue(assignment.deadline),
    classId: assignment.classId,
    sections: sections.map(section => ({
      ...section,
      questions: (section.questions || []).map(question => {
        const options = question.options || question.accepted || [];
        const correctIndex = Number.isInteger(question.correctIndex) ? question.correctIndex : options.findIndex(option => (question.accepted || []).includes(option));
        return { ...question, options, correctIndex };
      })
    }))
  };
}
function assignmentBuilderDraft() {
  const assignment = editedAssignment();
  return assignment ? assignmentEditDraft(assignment) : ui.assignmentDraft;
}
function setupAssignmentBuilder() {
  const container = $('[data-assignment-sections]');
  if (!container) return;
  const draft = assignmentBuilderDraft();
  let sections = Array.isArray(draft?.sections) ? draft.sections : null;
  if (!sections?.length && draft) {
    const legacy = draft;
    const skill = assignmentSkills.includes(legacy.skill) ? legacy.skill : 'Reading';
    sections = [{ skill, title: legacy.title || '', content: legacy.passage || legacy.writingPrompt || legacy.speakingPrompt || legacy.transcript || '', questions: supportsQuestions(skill) ? [{ text: legacy.question || '', options: String(legacy.accepted || '').split('|').map(value => value.trim()).filter(Boolean), correctIndex: 0 }] : [] }];
  }
  if (!sections?.length) sections = [{ skill: 'Reading', title: '', content: '', questions: [{}] }];
  container.innerHTML = sections.map(assignmentSectionTemplate).join('');
  $$('[data-assignment-section]', container).forEach((section, index) => { section.dataset.audioDataUrl = sections[index]?.audioDataUrl || ''; });
  $$('[data-assignment-section]', container).forEach(updateAssignmentSection);
  renumberAssignmentBuilder();
}
function updateExtraClassLabel() {
  const label = $('[data-extra-classes-label]');
  if (!label) return;
  const selected = $$('[data-extra-class]:checked').length;
  label.textContent = selected ? `Đã chọn ${selected} lớp` : 'Chọn thêm lớp học';
}
function renderAssignmentClassOptions() {
  const form = $('[data-form="assignment"]');
  const container = $('[data-extra-class-options]');
  if (!form || !container || !state) return;
  const requestedClassId = params.get('classId') || editedAssignment()?.classId;
  const primaryClass = state.classes.find(c => c.id === requestedClassId) || state.classes[0];
  if (!primaryClass) {
    container.innerHTML = '<p class="caption">Chưa có lớp học để giao bài.</p>';
    return;
  }
  $('[data-primary-class-id]').value = primaryClass.id;
  $('[data-primary-class-name]').textContent = primaryClass.name;
  const extraClasses = state.classes.filter(c => c.id !== primaryClass.id);
  container.innerHTML = extraClasses.length ? extraClasses.map(c => `<label class="class-multiselect-option"><input type="checkbox" name="extraClass-${esc(c.id)}" value="${esc(c.id)}" data-extra-class><span><strong>${esc(c.name)}</strong><small>Mã ${esc(c.code)}</small></span></label>`).join('') : '<p class="caption">Bạn chưa có lớp học nào khác.</p>';
}
function restoreForms() {
  const form = $('[data-form="assignment"]');
  const draft = assignmentBuilderDraft();
  if (form && draft) {
    for (const [key, value] of Object.entries(draft)) {
      const field = form.elements.namedItem(key);
      if (!field || typeof value !== 'string' || ['password','apiKey'].includes(key)) continue;
      if (field.type === 'checkbox') field.checked = value === 'on'; else field.value = value;
    }
  }
  if (form && params.get('classId') && state?.classes.some(c => c.id === params.get('classId'))) {
    form.elements.namedItem('classId').value = params.get('classId');
  }
  const assignment = editedAssignment();
  if (form && assignment) {
    form.dataset.editAssignmentId = assignment.id;
    $('.page-head h1').textContent = 'Chỉnh sửa bài tập';
    $('.page-head p:last-child').textContent = 'Cập nhật nội dung, câu hỏi và hạn nộp của bài tập.';
    $('.assignment-extra-classes')?.setAttribute('hidden', '');
    $('[type="submit"]', form).textContent = 'Lưu thay đổi';
  }
  const edit = params.get('edit'); const classForm = $('[data-form="class"]');
  if (edit && classForm && state) {
    const c = state.classes.find(c => c.id === edit);
    if (c) { classForm.elements.namedItem('name').value = c.name; classForm.elements.namedItem('description').value = c.description; $('h1').textContent = 'Chỉnh sửa lớp học'; $('[type="submit"]', classForm).textContent = 'Lưu thay đổi lớp'; }
  }
  const joinForm = $('[data-form="join"]'); const classCode = params.get('code');
  if (joinForm && classCode) joinForm.elements.namedItem('code').value = classCode;
  for (const form of $$('form[data-form]')) {
    const saved = ui[formKey(form)];
    if (!saved || typeof saved !== 'object') continue;
    for (const [key, value] of Object.entries(saved)) { const field = form.elements.namedItem(key); if (!field || /password|apiKey|confirm/i.test(key)) continue; if (field.type === 'checkbox') field.checked = value === 'on'; else if (typeof value === 'string') { field.value = value; if (field.matches('[data-writing-prompt-part]')) updateWritingPromptType(field.closest('[data-prompt-row]')); } }
  }
  $$('[data-draft]').forEach(field => { const value = ui[`draft-${field.dataset.draft}`]; if (typeof value === 'string') field.value = value; });
  updateWordCount();
  updateExtraClassLabel();
  if (ui.notificationsRead) $$('.notification-item').forEach(n => n.classList.add('read'));
}
function updateWordCount() { if ($('#word-count')) { const value = $('[data-word-count]').value.trim(); $('#word-count').textContent = `${value ? value.split(/\s+/u).length : 0} từ`; } }

function setupClassTabs() {
  const nav = $('.class-tabs');
  if (!nav) return;
  const tabs = $$('[data-class-tab]', nav);
  const panels = $$('[data-class-panel]');
  const show = (key, push = false) => {
    const fallback = !tabs.some(tab => tab.dataset.classTab === key);
    if (fallback) key = tabs[0]?.dataset.classTab;
    const url = new URL(location.href);
    if (fallback && url.searchParams.has('tab')) {
      url.searchParams.set('tab', key);
      history.replaceState(null, '', url);
    }
    if (push && (url.searchParams.get('tab') || tabs[0]?.dataset.classTab) !== key) {
      url.searchParams.set('tab', key);
      history.pushState(null, '', url);
    }
    tabs.forEach(tab => {
      const active = tab.dataset.classTab === key;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      const target = new URL(location.href);
      target.searchParams.set('tab', tab.dataset.classTab);
      tab.href = target.href;
    });
    panels.forEach(panel => { panel.hidden = panel.dataset.classPanel !== key; });
  };
  nav.addEventListener('click', event => {
    const tab = event.target.closest('[data-class-tab]');
    if (!tab || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    show(tab.dataset.classTab, true);
  });
  nav.addEventListener('keydown', event => {
    const index = tabs.indexOf(event.target.closest('[data-class-tab]'));
    if (index < 0 || !['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    tabs[next].focus({ preventScroll: true });
    show(tabs[next].dataset.classTab, true);
  });
  window.addEventListener('popstate', () => show(new URLSearchParams(location.search).get('tab')));
  show(params.get('tab'));
}

setupAdminSpa(); renderData(); renderCalendar(); setupAssignmentBuilder(); setupPromptEditors(); restoreForms(); setupClassTabs(); setupNavigation(role);
if (page === 'student-classes.html' && params.get('join') === '1') openStudentJoinDialog();
setupRichImageResizing();
setupRichImageDragging();

document.addEventListener('selectionchange', () => {
  const selection = document.getSelection();
  if (!selection?.rangeCount) return;
  const node = selection.getRangeAt(0).commonAncestorContainer;
  const element = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
  const editor = element?.closest?.('[data-rich-content]');
  if (editor) { saveRichEditorRange(editor); updateRichToolbar(editor); }
});
document.addEventListener('change', event => {
  if (event.target.matches('[data-writing-prompt-part]')) updateWritingPromptType(event.target.closest('[data-prompt-row]'));
});
document.addEventListener('click', event => {
  if (event.target.closest('[data-prompt-name]')) event.stopPropagation();
});
document.addEventListener('mousedown', event => {
  if (event.target.closest('[data-action="rich-command"], [data-action="toggle-rich-dropdown"]')) event.preventDefault();
});
document.addEventListener('pointerdown', event => {
  const imageTool = event.target.closest?.('.rich-image-tool');
  if (!imageTool) return;
  const editor = imageTool.closest('[data-rich-editor]')?.querySelector('[data-rich-content]');
  if (editor) saveRichEditorRange(editor);
});
document.addEventListener('focusin', event => {
  const editor = event.target.closest?.('[data-rich-content]');
  if (editor) { saveRichEditorRange(editor); updateRichToolbar(editor); }
});
document.addEventListener('keyup', event => {
  const editor = event.target.closest?.('[data-rich-content]');
  if (editor) { saveRichEditorRange(editor); updateRichToolbar(editor); }
});
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  const dropdown = event.target.closest?.('[data-rich-dropdown]');
  if (!dropdown?.classList.contains('is-open')) return;
  event.preventDefault();
  closeRichDropdowns();
  $('[data-action="toggle-rich-dropdown"]', dropdown)?.focus({ preventScroll:true });
});
document.addEventListener('paste', event => {
  const editor = event.target.closest?.('[data-rich-content]');
  if (!editor) return;
  // Paste text only: formatting copied from Word, Docs, or a website must never
  // silently switch the editor into bold/italic/underlined typing mode.
  const text = event.clipboardData?.getData('text/plain');
  if (text == null) return;
  event.preventDefault();
  runRichCommand(editor, 'insertText', text.replace(/\r\n?/g, '\n'));
});

document.addEventListener('click', async event => {
  const logout = event.target.closest('[data-logout]');
  if (logout) { try { sessionStorage.removeItem('ea.preview-role'); } catch {} return; }
  const removeFeedbackImage = event.target.closest('[data-remove-feedback-image]');
  if (removeFeedbackImage) {
    const submissionId = removeFeedbackImage.dataset.submission;
    const files = [...(feedbackImageFiles.get(submissionId) || [])];
    files.splice(Number(removeFeedbackImage.dataset.removeFeedbackImage), 1);
    feedbackImageFiles.set(submissionId, files);
    const form = removeFeedbackImage.closest('form');
    const picker = $('[data-feedback-images]', form);
    if (picker) {
      const transfer = new DataTransfer();
      files.forEach(file => transfer.items.add(file));
      picker.files = transfer.files;
    }
    renderFeedbackImageList(form);
    return;
  }
  const richDropdownToggle = event.target.closest('[data-action="toggle-rich-dropdown"]');
  if (richDropdownToggle) {
    toggleRichDropdown(richDropdownToggle);
    return;
  }
  if (!event.target.closest('[data-rich-dropdown]')) closeRichDropdowns();
  const addSectionCorrection = event.target.closest('[data-action="add-section-review-correction"]');
  if (addSectionCorrection) {
    const submission = state.submissions.find(item => item.id === addSectionCorrection.dataset.submission);
    const assignment = submission && state.assignments.find(item => item.id === submission.assignmentId);
    const sectionIndex = Number(addSectionCorrection.dataset.sectionIndex);
    const section = assignment && assignmentSections(assignment)[sectionIndex];
    if (!submission || !section || !['Writing', 'Speaking'].includes(section.skill)) return toast('Không tìm thấy section để thêm lỗi.', true);
    if (submission.published && !ui['editing-review-' + submission.id]) return toast('Chọn Chỉnh sửa trước khi bổ sung lỗi.', true);
    const fields = '<label class="field">Loại lỗi<input name="type" required maxlength="100" placeholder="Ví dụ: Ngữ pháp · Chia động từ"></label><label class="field">Nội dung học sinh<textarea name="orig" required maxlength="1000" placeholder="Đoạn nội dung cần sửa"></textarea></label><label class="field">Đề xuất cải thiện<textarea name="fix" required maxlength="1000" placeholder="Cách viết hoặc nói đề xuất"></textarea></label><label class="field">Giải thích<textarea name="explain" required maxlength="2000" placeholder="Giải thích ngắn cho học sinh"></textarea></label>';
    showDialog('Thêm lỗi cần sửa', '<form data-form="section-review-item-add" data-submission="' + esc(submission.id) + '" data-section-index="' + sectionIndex + '">' + fields + '<div class="form-actions"><button class="btn outline" type="button" data-action="close-dialog">Hủy</button><button class="btn primary" type="submit">Thêm lỗi</button></div></form>');
    return;
  }
  const sectionReviewControl = event.target.closest('[data-action="edit-section-review-item"], [data-action="delete-section-review-item"]');
  if (sectionReviewControl) {
    const submission = state.submissions.find(item => item.id === sectionReviewControl.dataset.submission);
    const assignment = submission && state.assignments.find(item => item.id === submission.assignmentId);
    const sectionIndex = Number(sectionReviewControl.dataset.sectionIndex);
    const section = assignment && assignmentSections(assignment)[sectionIndex];
    const kind = sectionReviewControl.dataset.reviewItemKind;
    const evaluation = section?.skill === 'Speaking' ? getAiSpeakingEvaluation() : section?.skill === 'Writing' ? getAiWritingEvaluation('') : null;
    const defaults = kind === 'criteria' ? evaluation?.criteria : evaluation?.corrections;
    const items = submission && Array.isArray(defaults) ? multiReviewItems(kind, submission.id, sectionIndex, defaults) : [];
    const itemIndex = Number(sectionReviewControl.dataset.itemIndex);
    const item = items[itemIndex];
    if (!submission || !item || (kind !== 'criteria' && kind !== 'corrections')) return toast('Không tìm thấy nội dung đánh giá.', true);
    if (sectionReviewControl.dataset.action === 'delete-section-review-item') {
      if (saveUI({ [multiReviewStoreKey(kind, submission.id, sectionIndex)]:items.filter((_, index) => index !== itemIndex) }, 'Đã xóa nội dung đánh giá.')) {
        renderReview();
        audit('Xóa ' + (kind === 'criteria' ? 'tiêu chí đánh giá' : 'lỗi cần sửa'));
      }
      return;
    }
    const fields = kind === 'criteria'
      ? '<label class="field">Tên tiêu chí<input name="name" required maxlength="120" value="' + esc(item.name) + '"></label><label class="field">Band<input name="score" type="number" required min="0" max="9" step="0.1" value="' + esc(item.score) + '"></label><label class="field">Điểm mạnh<textarea name="strengths" required maxlength="2000">' + esc(item.strengths) + '</textarea></label><label class="field">Cần hoàn thiện<textarea name="improvements" required maxlength="2000">' + esc(item.improvements) + '</textarea></label>'
      : '<label class="field">Loại lỗi<input name="type" required maxlength="100" value="' + esc(item.type) + '"></label><label class="field">Nội dung học sinh<textarea name="orig" required maxlength="1000">' + esc(item.orig) + '</textarea></label><label class="field">Đề xuất cải thiện<textarea name="fix" required maxlength="1000">' + esc(item.fix) + '</textarea></label><label class="field">Giải thích<textarea name="explain" required maxlength="2000">' + esc(item.explain) + '</textarea></label>';
    showDialog('Chỉnh sửa ' + (kind === 'criteria' ? 'tiêu chí đánh giá' : 'lỗi cần sửa'), '<form data-form="section-review-item-edit" data-submission="' + esc(submission.id) + '" data-section-index="' + sectionIndex + '" data-review-item-kind="' + esc(kind) + '" data-item-index="' + itemIndex + '">' + fields + '<div class="form-actions"><button class="btn outline" type="button" data-action="close-dialog">Hủy</button><button class="btn primary" type="submit">Lưu thay đổi</button></div></form>');
    return;
  }
  const correctionControl = event.target.closest('[data-action="edit-review-correction"], [data-action="delete-review-correction"]');
  if (correctionControl) {
    const submission = state.submissions.find(item => item.id === correctionControl.dataset.submission);
    const assignment = submission && state.assignments.find(item => item.id === submission.assignmentId);
    if (!submission || !assignment) return toast('Không tìm thấy lỗi cần sửa.', true);
    const aiEvaluation = assignment.skill === 'Speaking' ? getAiSpeakingEvaluation() : getAiWritingEvaluation(submission.response || '');
    const corrections = getReviewCorrections(submission, aiEvaluation);
    const correctionIndex = Number(correctionControl.dataset.correctionIndex);
    const correction = corrections[correctionIndex];
    if (!correction) return toast('Lỗi cần sửa không còn tồn tại.', true);
    if (correctionControl.dataset.action === 'delete-review-correction') {
      const nextCorrections = corrections.filter((_, index) => index !== correctionIndex);
      if (saveUI({ [`review-corrections-${submission.id}`]: nextCorrections }, 'Đã xóa lỗi cần sửa.')) {
        renderReview();
        audit('Xóa lỗi cần sửa từ AI');
      }
      return;
    }
    showDialog('Chỉnh sửa lỗi cần sửa', `<form data-form="review-correction-edit" data-submission="${esc(submission.id)}" data-correction-index="${correctionIndex}"><label class="field">Loại lỗi<input name="type" required maxlength="100" value="${esc(correction.type)}"></label><label class="field">Nội dung học sinh<textarea name="orig" required maxlength="1000">${esc(correction.orig)}</textarea></label><label class="field">Đề xuất cải thiện<textarea name="fix" required maxlength="1000">${esc(correction.fix)}</textarea></label><label class="field">Giải thích<textarea name="explain" required maxlength="2000">${esc(correction.explain)}</textarea></label><div class="form-actions"><button class="btn outline" type="button" data-action="close-dialog">Hủy</button><button class="btn primary" type="submit">Lưu thay đổi</button></div></form>`);
    return;
  }
  const publish = event.target.closest('[data-publish]');
  if (publish) {
    const subId = publish.dataset.publish;
    const feedbackField = $(`[data-submission="${subId}"] textarea[name="feedback"]`);
    if (feedbackField) {
      ui[`feedback-${subId}`] = feedbackField.value;
    }
    const scoreField = $(`input[name="teacherScore"][data-submission="${subId}"]`);
    if (scoreField) {
      ui[`teacher-score-${subId}`] = scoreField.value;
    }
    try { localStorage.setItem(UI_KEY, JSON.stringify(ui)); } catch {}
    if (update(s => publishSubmission(s, publish.dataset.publish), 'Đã công bố kết quả mẫu. Học sinh có thể xem điểm.')) audit('Công bố kết quả mẫu');
    return;
  }
  const editPublishedReview = event.target.closest('[data-action="edit-published-review"]');
  if (editPublishedReview) {
    const submissionId = editPublishedReview.dataset.submission;
    if (!saveUI({ ['editing-review-' + submissionId]:true })) return;
    renderReview();
    const reviewRoot = document.querySelector('.multi-section-review-layout') || document.querySelector('.lean-review-grid') || document;
    $$('details.multi-section-review-card', reviewRoot).forEach(section => { section.open = true; });
    const firstEditableField = $('[data-section-score]', reviewRoot) || $('textarea[name="feedback"]', reviewRoot) || $('input[name="teacherScore"]', reviewRoot);
    if (firstEditableField) {
      firstEditableField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      try { firstEditableField.focus({ preventScroll: true }); } catch { firstEditableField.focus(); }
    }
    toast('Đã mở lại bài chấm để chỉnh sửa. Nhấn Lưu khi hoàn tất.');
    return;
  }
  const savePublishedReview = event.target.closest('[data-action="save-published-review"]');
  if (savePublishedReview) {
    const submissionId = savePublishedReview.dataset.submission;
    const reviewRoot = savePublishedReview.closest('.multi-section-review-layout') || savePublishedReview.closest('.lean-review-grid') || document;
    const nextValues = { ['editing-review-' + submissionId]:false };
    const feedbackField = $(`form[data-submission="${submissionId}"] textarea[name="feedback"]`, reviewRoot);
    if (feedbackField) nextValues['feedback-' + submissionId] = feedbackField.value;
    const teacherScore = $(`input[name="teacherScore"][data-submission="${submissionId}"]`, reviewRoot);
    if (teacherScore) nextValues['teacher-score-' + submissionId] = teacherScore.value;
    for (const scoreField of $$('[data-section-score]', reviewRoot)) {
      const score = Number(scoreField.value);
      if (!Number.isFinite(score) || score < 0 || score > 9) {
        scoreField.focus();
        return toast('Điểm section phải từ 0 đến 9.', true);
      }
      nextValues['section-score-' + submissionId + '-' + scoreField.dataset.sectionIndex] = score;
    }
    if (saveUI(nextValues, 'Đã lưu kết quả đã chỉnh sửa.')) {
      audit('Lưu chỉnh sửa bài đã chấm');
      renderReview();
    }
    return;
  }
  const setScore = event.target.closest('[data-set-score]');
  if (setScore) {
    const val = setScore.dataset.setScore;
    const form = setScore.closest('.review-sidebar') || document;
    const scoreInput = $('input[name="teacherScore"]', form);
    if (scoreInput) {
      scoreInput.value = val;
      scoreInput.dispatchEvent(new Event('input', { bubbles: true }));
      $$('.btn-score-chip', form).forEach(chip => chip.classList.toggle('active', chip.dataset.setScore === val));
    }
    return;
  }
  const picker = event.target.closest('[data-open-picker]');
  if (picker && typeof picker.showPicker === 'function') { try { picker.showPicker(); } catch { /* Native picker remains available through its calendar control. */ } }
  for (const disclosure of $$('[data-class-multiselect][open]')) if (!disclosure.contains(event.target)) disclosure.open = false;
  const action = event.target.closest('[data-action]')?.dataset.action; if (!action) return;
  if (action === 'add-writing-prompts' || action === 'add-speaking-prompts') {
    const form = event.target.closest('form');
    const list = $('[data-prompt-list]', form);
    if (list.children.length >= 20) return toast('Tối đa 20 prompt cho mỗi kỹ năng.', true);
    list.insertAdjacentHTML('beforeend', promptRowMarkup(form.dataset.form, list.children.length));
    syncPromptRows(form);
    $('[data-prompt-row]:last-child select', list)?.focus();
    return;
  }
  if (action === 'remove-prompt-row') {
    const form = event.target.closest('form');
    const row = event.target.closest('[data-prompt-row]');
    if ($$('[data-prompt-row]', form).length === 1) return;
    row.remove();
    syncPromptRows(form);
    return;
  }
  if (action === 'save-student-assignment-draft') {
    const assignment = state?.assignments.find(item => item.id === event.target.closest('[data-assignment]').dataset.assignment);
    if (!assignment) return toast('Bài tập không còn tồn tại.', true);
    if (saveUI({ ['reading-' + assignment.id]:studentAssignmentDraft(assignment) }, 'Đã lưu nháp.')) audit('Lưu nháp bài tập');
    return;
  }
  if (action === 'request-student-assignment-submit') {
    const assignment = state?.assignments.find(item => item.id === event.target.closest('[data-assignment]').dataset.assignment);
    if (!assignment) return toast('Bài tập không còn tồn tại.', true);
    requestStudentAssignmentSubmit(assignment);
    return;
  }
  if (action === 'confirm-student-assignment-submit') {
    const assignment = state?.assignments.find(item => item.id === event.target.closest('[data-assignment]').dataset.assignment);
    if (!assignment) return toast('Bài tập không còn tồn tại.', true);
    $('#app-dialog').close();
    submitStudentAssignment(assignment, ui['reading-' + assignment.id] || {}, true);
    return;
  }
  if (action === 'previous-assignment-section') {
    const form = event.target.closest('form[data-section-index]');
    const assignment = state?.assignments.find(item => item.id === form?.dataset.assignment);
    const currentSection = Number(form?.dataset.sectionIndex);
    if (!assignment || !Number.isInteger(currentSection) || currentSection < 1) return;
    saveUI({ ['reading-' + assignment.id]:studentAssignmentDraft(assignment) });
    go('student-reading.html?id=' + encodeURIComponent(assignment.id) + '&classId=' + encodeURIComponent(assignment.classId) + '&section=' + (currentSection - 1));
    return;
  }
  if (action === 'seek-student-listening') {
    const player = event.target.closest('.student-listening-player');
    const audio = $('[data-student-listening-audio]', player);
    if (audio) audio.currentTime = Math.max(0, Math.min(Number.isFinite(audio.duration) ? audio.duration : Infinity, audio.currentTime + Number(event.target.closest('[data-seek-seconds]').dataset.seekSeconds)));
    return;
  }
  if (action === 'toggle-student-recording') {
    const button = event.target.closest('[data-speaking-key]');
    const form = button.closest('form[data-assignment]');
    const key = button.dataset.speakingKey;
    const recorder = studentSpeakingRecorders.get(key);
    if (recorder?.state === 'recording') {
      recorder.stop();
      button.textContent = 'Đang lưu bản ghi…';
      button.disabled = true;
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') return toast('Trình duyệt này chưa hỗ trợ ghi âm trực tiếp.', true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio:true });
      const chunks = [];
      const nextRecorder = new MediaRecorder(stream);
      nextRecorder.addEventListener('dataavailable', recordEvent => { if (recordEvent.data.size) chunks.push(recordEvent.data); });
      nextRecorder.addEventListener('stop', async () => {
        stream.getTracks().forEach(track => track.stop());
        studentSpeakingRecorders.delete(key);
        const file = new File([new Blob(chunks, { type:nextRecorder.mimeType || 'audio/webm' })], 'ghi-am-bai-noi.webm', { type:nextRecorder.mimeType || 'audio/webm' });
        try {
          const contentUrl = await fileAsDataUrl(file);
          const draftKey = 'reading-' + form.dataset.assignment;
          if (saveUI({ [draftKey]:{ ...(ui[draftKey] || {}), [key]:{ name:file.name, contentUrl } } }, 'Đã lưu bản ghi âm.')) renderAssignment();
        } catch { toast('Không thể lưu bản ghi âm.', true); }
      });
      studentSpeakingRecorders.set(key, nextRecorder);
      nextRecorder.start();
      button.textContent = 'Dừng ghi âm';
    } catch { toast('Không thể truy cập micro. Hãy cho phép quyền micro rồi thử lại.', true); }
    return;
  }
  if (action === 'toggle-demo-audio') {
    const btn = event.target.closest('[data-action="toggle-demo-audio"]');
    const isPlaying = btn.classList.toggle('playing');
    const span = $('span', btn);
    if (span) span.textContent = isPlaying ? 'Tạm dừng' : 'Nghe bài nói';
    toast(isPlaying ? 'Đang phát âm thanh bài nói mẫu...' : 'Đã tạm dừng bài nói.');
    return;
  }
  if (action === 'password') {
    const field = $('#password'), shown = field.type === 'password'; field.type = shown ? 'text' : 'password'; event.target.closest('button').setAttribute('aria-label', shown ? 'Ẩn mật khẩu' : 'Hiện mật khẩu');
  } else if (action === 'public-menu') { const open = $('#public-nav').classList.toggle('open'); $('[data-action="public-menu"]').setAttribute('aria-expanded', String(open));
  } else if (action === 'sidebar') { const open = $('#sidebar').classList.toggle('open'); $('.sidebar-overlay').classList.toggle('open', open); $('.app-header [data-action="sidebar"]').setAttribute('aria-expanded', String(open));
  } else if (action === 'close-dialog') $('#app-dialog').close();
  else if (action === 'open-student-join') openStudentJoinDialog();
  else if (action === 'open-student-assignments') openStudentAssignmentsDialog();
  else if (action === 'class-prev' || action === 'class-next') {
    const track = $('#class-summary.class-carousel-track');
    if (!track) return;
    track.scrollBy({ left: (action === 'class-next' ? 1 : -1) * track.clientWidth, behavior: 'smooth' });
    window.setTimeout(syncClassCarousel, 250);
  }
  else if (action === 'invite-class') showClassInvitation(event.target.closest('[data-class-id]').dataset.classId);
  else if (action === 'copy-class-invitation') {
    try { await navigator.clipboard.writeText(event.target.closest('[data-invitation]').dataset.invitation); toast('Đã sao chép thông tin mời vào lớp.'); }
    catch { toast('Không thể sao chép tự động. Hãy chọn và sao chép thông tin hiển thị.', true); }
  }
  else if (action === 'payment') showDialog('Thanh toán', '<p>Chức năng tạm thời chưa khả dụng.</p><div class="form-actions"><button class="btn primary" type="button" data-action="close-dialog">Quay lại</button></div>');
  else if (action === 'approve-automatic-results') {
    const assignmentId = params.get('id');
    const submissions = state?.submissions.filter(item => item.assignmentId === assignmentId) || [];
    if (!submissions.length) return toast('Chưa có bài nộp để duyệt kết quả tự động.', true);
    if (update(current => ({ ...current, submissions: current.submissions.map(item => item.assignmentId === assignmentId ? { ...item, published: true } : item) }), 'Đã duyệt kết quả tự động. Học sinh có thể xem điểm.')) audit('Duyệt kết quả tự động');
  } else if (action === 'send-results-students' || action === 'send-results-parents') {
    const assignment = state?.assignments.find(item => item.id === params.get('id'));
    if (!assignment) return toast('Không tìm thấy bài tập để gửi kết quả.', true);
    const audience = action === 'send-results-students' ? 'học sinh' : 'phụ huynh';
    showDialog(`Gửi kết quả cho ${audience}`, `<p><strong>Bài tập:</strong> ${esc(assignment.title)}</p><p>Kết quả đã duyệt sẽ được chuẩn bị để gửi cho ${audience} của lớp.</p><div class="notice">Đây là bản xem trước trong giao diện mẫu; chưa gửi email hoặc thông báo thật.</div><div class="form-actions"><button class="btn primary" type="button" data-action="close-dialog">Đã hiểu</button></div>`);
  }
  else if (action === 'calendar-prev' || action === 'calendar-next') {
    calendarMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + (action === 'calendar-next' ? 1 : -1), 1);
    renderCalendar();
  } else if (action === 'copy-class-access') {
    const classroom = state?.classes.find(item => item.id === params.get('id')) || state?.classes[0];
    if (!classroom) return toast('Không tìm thấy thông tin tham gia lớp.', true);
    const joinUrl = new URL(`student-classes.html?join=1&class=${encodeURIComponent(classroom.id)}&code=${encodeURIComponent(classroom.code)}`, location.href).href;
    const access = [`Tham gia lớp: ${classroom.name}`, `Mã lớp: ${classroom.code}`, classroom.classPassword ? `Mật khẩu lớp: ${classroom.classPassword}` : 'Lớp không có mật khẩu', `Đường link tham gia: ${joinUrl}`].join('\n');
    try { await navigator.clipboard.writeText(access); toast('Đã sao chép thông tin tham gia lớp.'); } catch { toast('Không thể sao chép tự động. Hãy chọn và sao chép thông tin hiển thị.',true); }
  } else if (action === 'edit-class-student') {
    const control = event.target.closest('[data-student-id]');
    editingClassStudent = `${control.dataset.classId}:${control.dataset.studentId}`;
    renderClassStudents(control.dataset.classId);
    window.setTimeout(() => $('[data-class-student-name]')?.focus(), 0);
  } else if (action === 'cancel-edit-class-student') {
    editingClassStudent = '';
    const classroom = state?.classes.find(item => item.id === params.get('id')) || state?.classes[0];
    if (classroom) renderClassStudents(classroom.id);
  } else if (action === 'view-class-student') {
    const control = event.target.closest('[data-student-id]');
    const student = classStudents(control.dataset.classId).find(item => item.id === control.dataset.studentId);
    if (!student) return toast('Không tìm thấy thông tin học sinh.', true);
    const profile = savedStudentProfileFor(student);
    const phone = String(profile.phone || '').trim();
    const parentName = String(profile.parentName || '').trim();
    const parentPhone = String(profile.parentPhone || '').trim();
    const parentEmail = String(profile.parentEmail || '').trim();
    const bands = student.id === 'student-lan-anh' ? studentProfileBands() : { Reading:null, Listening:null, Writing:null, Speaking:null };
    const contactLines = '<small>' + esc(student.email) + '</small>' + (phone ? '<small>' + esc(phone) + '</small>' : '');
    const parentDetails = '<dl class="student-modal-details"><div><dt>Tên phụ huynh</dt><dd>' + esc(parentName || 'Chưa cập nhật') + '</dd></div><div><dt>Số điện thoại phụ huynh</dt><dd>' + esc(parentPhone || 'Chưa cập nhật') + '</dd></div><div><dt>Email phụ huynh</dt><dd>' + esc(parentEmail || 'Chưa cập nhật') + '</dd></div></dl>';
    showDialog('Thông tin học viên', '<div class="student-info-dialog"><div class="profile-hero student-modal-identity"><div class="person"><span class="avatar">' + esc(studentInitials(student)) + '</span><div><strong>' + esc(student.name) + '</strong>' + contactLines + '</div></div></div><dl class="detail-list student-modal-overview"><div><dt>Điểm trung bình</dt><dd>' + esc(student.average || '—') + '</dd></div><div><dt>Lớp học</dt><dd>' + esc(state.classes.find(item => item.id === control.dataset.classId)?.name || 'Lớp học') + '</dd></div></dl><section class="student-modal-section"><h2>Đánh giá kĩ năng</h2>' + studentSkillSummaryMarkup(bands) + '</section><section class="student-modal-section"><h2>Thông tin phụ huynh</h2>' + parentDetails + '</section><div class="form-actions"><button class="btn primary" type="button" data-action="close-dialog">Đóng</button></div></div>');
  } else if (action === 'save-class-student') {
    const control = event.target.closest('[data-student-id]');
    const row = control.closest('tr');
    const name = $('[data-class-student-name]', row)?.value.trim();
    const email = $('[data-class-student-email]', row)?.value.trim();
    if (!name || !email) return toast('Vui lòng nhập tên và email học sinh.', true);
    if (!/^\S+@\S+\.\S+$/.test(email)) return toast('Email học sinh chưa hợp lệ.', true);
    const roster = classStudents(control.dataset.classId).map(student => student.id === control.dataset.studentId ? { ...student, name, email, initials: studentInitials({ ...student, name }) } : student);
    editingClassStudent = '';
    saveClassRoster(control.dataset.classId, roster, 'Đã cập nhật thông tin học sinh.');
  } else if (action === 'delete-class-student') {
    const control = event.target.closest('[data-student-id]');
    const student = classStudents(control.dataset.classId).find(item => item.id === control.dataset.studentId);
    if (!student) return toast('Không tìm thấy học sinh trong lớp.', true);
    showDialog('Xóa học sinh khỏi lớp?', `<p>Bạn có muốn xóa học sinh <strong>${esc(student.name)}</strong> khỏi lớp này không?</p><p class="caption">Học sinh sẽ không còn xuất hiện trong danh sách lớp của bản mẫu.</p><div class="form-actions"><button class="btn outline" type="button" data-action="close-dialog">Hủy</button><button class="btn danger" type="button" data-action="confirm-delete-class-student" data-class-id="${esc(control.dataset.classId)}" data-student-id="${esc(student.id)}">Xóa</button></div>`);
  } else if (action === 'confirm-delete-class-student') {
    const control = event.target.closest('[data-student-id]');
    const roster = classStudents(control.dataset.classId).filter(student => student.id !== control.dataset.studentId);
    editingClassStudent = '';
    if (saveClassRoster(control.dataset.classId, roster, 'Đã xóa học sinh khỏi lớp.')) $('#app-dialog').close();
  } else if (action === 'delete-class') {
    const classId = params.get('id') || params.get('classId') || state?.classes[0]?.id;
    const classroom = state?.classes.find(item => item.id === classId);
    if (!classroom) return toast('Không tìm thấy lớp học để xóa.', true);
    showDialog('Bạn chắc chắn muốn xóa lớp này?', `<p>Hành động này không thể hoàn tác.</p><p class="caption">Lớp “${esc(classroom.name)}”, các bài tập và bài nộp liên quan sẽ bị xóa.</p><div class="form-actions"><button class="btn outline" type="button" data-action="close-dialog">Hủy</button><button class="btn danger" type="button" data-action="confirm-delete-class" data-class-id="${esc(classId)}">Xóa</button></div>`);
  } else if (action === 'confirm-delete-class') {
    const classId = event.target.closest('[data-class-id]').dataset.classId;
    const deleted = update(current => {
      const assignmentIds = new Set(current.assignments.filter(assignment => assignment.classId === classId).map(assignment => assignment.id));
      return { ...current, classes: current.classes.filter(classroom => classroom.id !== classId), assignments: current.assignments.filter(assignment => assignment.classId !== classId), submissions: current.submissions.filter(submission => !assignmentIds.has(submission.assignmentId)) };
    }, 'Đã xóa lớp học.');
    if (deleted) {
      const rosters = { ...(ui.classRosters || {}) };
      delete rosters[classId];
      const documentsByClass = { ...(ui.classDocuments || {}) };
      delete documentsByClass[classId];
      saveUI({ classRosters: rosters, classDocuments: documentsByClass });
      audit('Xóa lớp học');
      $('#app-dialog').close();
      go('teacher-classes.html');
    }
  } else if (action === 'open-class-document-upload') {
    const classId = params.get('id') || params.get('classId') || state?.classes[0]?.id;
    if (!state?.classes.some(classroom => classroom.id === classId)) return toast('Không tìm thấy lớp học để tải tài liệu.', true);
    showDialog('Tải tài liệu lên', `<form data-form="class-document-upload" data-class-id="${esc(classId)}"><label class="field">Tên tài liệu<input name="documentTitle" required maxlength="140" autocomplete="off"></label><label class="field">Tệp tài liệu<input name="documentFile" type="file" required accept=".pdf,.doc,.docx" data-class-document-file></label><p class="caption">Chỉ hỗ trợ tệp PDF, DOC và DOCX.</p><p class="caption" data-class-document-file-name>Chưa chọn tệp.</p><div class="form-actions"><button class="btn outline" type="button" data-action="close-dialog">Hủy</button><button class="btn primary" type="submit">Tải tài liệu lên</button></div></form>`);
  } else if (action === 'view-class-document') {
    const control = event.target.closest('[data-document-id]');
    const document = classDocuments(control.dataset.classId).find(item => item.id === control.dataset.documentId);
    if (!document) return toast('Không tìm thấy tài liệu.', true);
    const extension = documentExtension(document);
    const details = `<div class="document-preview-meta"><strong>${esc(document.name)}</strong><span>Ngày tải lên: ${dateOnly(document.uploadedAt)}</span></div>`;
    const preview = extension === 'pdf' && document.contentUrl
      ? `<div class="document-preview-reader"><iframe class="document-preview-frame" title="Xem trước ${esc(document.name)}" src="${esc(`${document.contentUrl}#toolbar=0&navpanes=0&view=FitH`)}"></iframe></div>`
      : `<div class="document-preview-placeholder">${documentIcon}<h3>${extension === 'doc' || extension === 'docx' ? 'Tài liệu Word' : 'Chưa có bản xem trước'}</h3><p>${document.contentUrl ? 'Trình duyệt không hiển thị trực tiếp định dạng Word. Bạn có thể tải tệp về để xem đầy đủ nội dung.' : 'Tệp gốc của tài liệu này không còn trong dữ liệu mẫu nên chưa thể xem trước.'}</p>${document.contentUrl ? `<a class="btn outline" href="${esc(document.contentUrl)}" download="${esc(document.fileName || document.name)}">Tải tệp về</a>` : ''}</div>`;
    showDialog('Xem trước tài liệu', `${details}${preview}<div class="form-actions"><button class="btn primary" type="button" data-action="close-dialog">Đóng</button></div>`, 'document-preview');
  } else if (action === 'edit-class-document') {
    const control = event.target.closest('[data-document-id]');
    const document = classDocuments(control.dataset.classId).find(item => item.id === control.dataset.documentId);
    if (!document) return toast('Không tìm thấy tài liệu.', true);
    showDialog('Chỉnh sửa tài liệu', `<form data-form="class-document-edit" data-class-id="${esc(control.dataset.classId)}" data-document-id="${esc(document.id)}"><label class="field">Tên tài liệu<input name="documentTitle" required maxlength="140" value="${esc(document.name)}" autocomplete="off"></label><div class="form-actions"><button class="btn outline" type="button" data-action="close-dialog">Hủy</button><button class="btn primary" type="submit">Lưu thay đổi</button></div></form>`);
  } else if (action === 'delete-class-document') {
    const control = event.target.closest('[data-document-id]');
    const classId = control.dataset.classId;
    const documentId = control.dataset.documentId;
    const document = classDocuments(classId).find(item => item.id === documentId);
    if (!document) return toast('Không tìm thấy tài liệu.', true);
    showDialog('Bạn muốn xóa tài liệu này?', `<p>Thao tác này không thể hoàn tác.</p><p class="caption">Tài liệu “${esc(document.name)}” sẽ bị xóa khỏi lớp.</p><div class="form-actions"><button class="btn outline" type="button" data-action="close-dialog">Hủy</button><button class="btn danger" type="button" data-action="confirm-delete-class-document" data-class-id="${esc(classId)}" data-document-id="${esc(documentId)}">Xóa</button></div>`);
  } else if (action === 'confirm-delete-class-document') {
    const control = event.target.closest('[data-document-id]');
    const classId = control.dataset.classId;
    const documentsByClass = { ...(ui.classDocuments || {}) };
    documentsByClass[classId] = classDocuments(classId).filter(document => document.id !== control.dataset.documentId);
    if (saveUI({ classDocuments: documentsByClass }, 'Đã xóa tài liệu.')) {
      renderClassDocuments(classId);
      audit('Xóa tài liệu lớp học');
      $('#app-dialog').close();
    }
  } else if (action === 'delete-assignment') {
    const assignmentId = event.target.closest('[data-assignment-id]').dataset.assignmentId;
    const assignment = state?.assignments.find(item => item.id === assignmentId);
    if (!assignment) return toast('Bài tập không còn tồn tại.', true);
    showDialog('Bạn có chắc chắn muốn xóa bài tập này?', `<p>Bài “${esc(assignment.title)}” và các bài nộp liên quan sẽ bị xóa khỏi dữ liệu mẫu.</p><div class="form-actions"><button class="btn outline" type="button" data-action="close-dialog">Quay lại</button><button class="btn danger" type="button" data-action="confirm-delete-assignment" data-assignment-id="${esc(assignmentId)}">Xóa</button></div>`);
  } else if (action === 'confirm-delete-assignment') {
    const assignmentId = event.target.closest('[data-assignment-id]').dataset.assignmentId;
    if (update(current => ({ ...current, assignments: current.assignments.filter(item => item.id !== assignmentId), submissions: current.submissions.filter(item => item.assignmentId !== assignmentId) }), 'Đã xóa bài tập.')) {
      audit('Xóa bài tập');
      $('#app-dialog').close();
    }
  } else if (action === 'add-assignment-section') {
    const container = $('[data-assignment-sections]');
    container.insertAdjacentHTML('beforeend', assignmentSectionTemplate({ skill:'Reading', title:'', content:'', questions:[{}] }, $$('[data-assignment-section]', container).length));
    const section = container.lastElementChild;
    updateAssignmentSection(section); renumberAssignmentBuilder();
    $('[data-section-title]', section).focus();
  } else if (action === 'remove-assignment-section') {
    const sections = $$('[data-assignment-section]');
    if (sections.length > 1) { event.target.closest('[data-assignment-section]').remove(); renumberAssignmentBuilder(); }
  } else if (action === 'add-assignment-question') {
    const section = event.target.closest('[data-assignment-section]');
    const list = $('[data-assignment-questions]', section);
    list.insertAdjacentHTML('beforeend', assignmentQuestionTemplate({}, $$('[data-assignment-question]', section).length));
    renumberAssignmentBuilder();
    $('[data-question-text]', list.lastElementChild).focus();
  } else if (action === 'remove-assignment-question') {
    const section = event.target.closest('[data-assignment-section]');
    if ($$('[data-assignment-question]', section).length > 1) { event.target.closest('[data-assignment-question]').remove(); renumberAssignmentBuilder(); }
  } else if (action === 'add-assignment-option') {
    const question = event.target.closest('[data-assignment-question]');
    const options = $('[data-assignment-options]', question);
    options.insertAdjacentHTML('beforeend', assignmentOptionTemplate(question.dataset.questionId, '', $$('[data-assignment-option]', question).length, -1));
    renumberAssignmentBuilder();
    $('[data-option-text]', options.lastElementChild).focus();
  } else if (action === 'remove-assignment-option') {
    const question = event.target.closest('[data-assignment-question]');
    if ($$('[data-assignment-option]', question).length > 2) { event.target.closest('[data-assignment-option]').remove(); renumberAssignmentBuilder(); }
  } else if (action === 'rich-command') {
    const editor = event.target.closest('[data-rich-editor]').querySelector('[data-rich-content]');
    runRichCommand(editor, event.target.closest('[data-action="rich-command"]').dataset.command);
    closeRichDropdowns();
  } else if (action === 'save-assignment-draft' || action === 'preview-assignment') {
    const form = $('[data-form="assignment"]');
    const snapshot = { ...draftFields(form), sections: serializeAssignmentSections() };
    if (saveUI({ assignmentDraft: snapshot }, 'Đã lưu bản nháp thiết kế.')) { if (action === 'preview-assignment') go(navigationUrl('teacher-assignment-preview.html?draft=1', role)); }
  } else if (action === 'save-writing') {
    const field = $('[data-word-count]'); saveUI({ [`draft-${field.dataset.draft}`]: field.value }, 'Đã lưu bài viết nháp trong trình duyệt.');
  } else if (action === 'read-all') { if (saveUI({ notificationsRead: true }, 'Đã đánh dấu thông báo mẫu là đã đọc.')) $$('.notification-item').forEach(n => n.classList.add('read'));
  } else if (action === 'reset-demo') {
    showDialog('Đặt lại dữ liệu mẫu?', '<p>Toàn bộ lớp, bài tập, bài nộp, bản nháp và cài đặt mẫu của English Assistant trong trình duyệt này sẽ bị xóa. Không ảnh hưởng dữ liệu trang khác.</p><div class="form-actions"><button class="btn outline" data-action="close-dialog">Hủy</button><button class="btn danger" data-action="confirm-reset">Đặt lại dữ liệu</button></div>');
  } else if (action === 'confirm-reset') {
    try { localStorage.removeItem(UI_KEY); localStorage.setItem(KEY,JSON.stringify(createDemoState())); location.reload(); } catch { toast('Trình duyệt không cho phép đặt lại dữ liệu.',true); }
  } else if (action === 'email-preview') {
    showDialog('Xem trước email kết quả', '<p><strong>Tiêu đề:</strong> Kết quả bài tập của bạn đã sẵn sàng</p><p>Chào học sinh, giáo viên đã cập nhật kết quả học tập. Hãy đăng nhập để xem bài làm và phản hồi.</p><label class="check-field"><input type="checkbox">Gửi kèm phụ huynh khi có địa chỉ được phép</label><div class="notice">Đây là mẫu nội dung, chưa gửi email. Chỉ được gửi điểm đã công bố khi tích hợp backend.</div><div class="form-actions"><button class="btn primary" data-action="close-dialog">Đã xem</button></div>');
  } else if (action === 'schedule') {
    showDialog('Thêm lịch trình','<form data-form="schedule"><label class="field">Tên lịch trình<input name="title" required maxlength="100" autocomplete="off"></label><label class="field">Ngày và giờ dự kiến<input type="datetime-local" name="date" required></label><label class="field">Nội dung & ghi chú<textarea name="note" placeholder="Nhập hoặc dán trực tiếp nội dung lịch trình..."></textarea></label><fieldset class="schedule-attachments"><legend>Đính kèm tài liệu</legend><p>Chọn ảnh, file nghe hoặc tài liệu để bổ sung cho lịch trình.</p><div class="schedule-attachment-grid"><label class="schedule-attachment"><input name="scheduleImage" type="file" accept="image/*" data-schedule-attachment><span>Ảnh</span><small data-schedule-attachment-name>Chưa chọn tệp</small></label><label class="schedule-attachment"><input name="scheduleAudio" type="file" accept="audio/*" data-schedule-attachment><span>File nghe</span><small data-schedule-attachment-name>Chưa chọn tệp</small></label><label class="schedule-attachment"><input name="scheduleDocument" type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt" data-schedule-attachment><span>Tài liệu</span><small data-schedule-attachment-name>Chưa chọn tệp</small></label></div></fieldset><div class="form-actions"><button type="submit" class="btn primary">Lưu lịch trình</button></div></form>');
  } else if (action === 'add-user') {
    showDialog('Thêm người dùng','<form data-form="add-user"><label class="field">Họ và tên<input name="name" required></label><label class="field">Email<input name="email" type="email" required></label><label class="field">Vai trò<select name="role"><option>Học sinh</option><option>Giáo viên</option></select></label><div class="notice">Chưa kết nối hệ thống tài khoản. Thao tác này chỉ xem trước lời mời.</div><button type="submit" class="btn primary">Xem trước lời mời</button></form>');
  } else if (action === 'lock-user') {
    showDialog('Xem trước khóa tài khoản','<p>Thiết kế này dành cho thao tác khóa tài khoản bởi quản trị viên. Hiện không có tài khoản thật để khóa.</p><div class="form-actions"><button class="btn outline" data-action="close-dialog">Đóng</button></div>');
  } else if (action === 'delete-user') {
    showDialog('Xem trước xóa người dùng','<p>Chưa có tài khoản thật để xóa. Khi kết nối backend, thao tác này cần xác nhận trước khi xóa vĩnh viễn.</p><div class="form-actions"><button class="btn outline" data-action="close-dialog">Đóng</button></div>');
  }
});

document.addEventListener('input', event => {
  const field = event.target;
  if (field.matches('[data-rich-content]')) {
    // Typing moves the caret without reliably firing selectionchange in every browser.
    // Keep the saved range and the B/I/U buttons in sync with the newly typed position.
    saveRichEditorRange(field);
    requestAnimationFrame(() => updateRichToolbar(field));
  }
  if (field.matches('[data-search]')) applyFilter();
  if (field.matches('[data-word-count]')) updateWordCount();
  if (field.matches('[data-draft]')) {
    const saved = saveUI({ [`draft-${field.dataset.draft}`]: field.value });
    if ($('[data-autosave-status]')) $('[data-autosave-status]').textContent = saved ? 'Đã lưu nháp tại trình duyệt' : 'Chưa lưu được';
  }
  if (field.matches('[data-reading-draft]')) {
    const sectionForm = field.closest('form');
    if (sectionForm.dataset.sectionIndex !== undefined) {
      const key = 'reading-' + sectionForm.dataset.assignment;
      const saved = saveUI({ [key]: { ...(ui[key] || {}), ...draftFields(sectionForm) } });
      $('[data-autosave-status]', sectionForm).textContent = saved ? 'Đã lưu nháp tại trình duyệt' : 'Chưa lưu được';
      return;
    }
    const form = field.closest('form'); const saved = saveUI({ [`reading-${form.dataset.assignment}`]: draftFields(form) });
    $('[data-autosave-status]', form).textContent = saved ? 'Đã lưu nháp tại trình duyệt' : 'Chưa lưu được';
  }
  if (field.matches('[data-writing-assignment-draft]')) {
    const form = field.closest('form');
    const response = field.value;
    const saved = saveUI({ [`reading-${form.dataset.assignment}`]: { response } });
    const count = response.trim() ? response.trim().split(/\s+/u).length : 0;
    $('[data-writing-assignment-count]', form.closest('.panel')).textContent = `${count} từ`;
    $('[data-autosave-status]', form).textContent = saved ? 'Đã lưu nháp tại trình duyệt' : 'Chưa lưu được';
  }
  if (field.matches('textarea[name="feedback"]') && field.closest('[data-submission]')) {
    const subId = field.closest('[data-submission]').dataset.submission;
    saveUI({ [`feedback-${subId}`]: field.value });
    const indicator = $('#feedback-autosave-status');
    if (indicator) {
      indicator.textContent = '✓ Đã tự động lưu';
      indicator.classList.add('saved');
    }
  }
  if (field.matches('[data-section-score]') && field.dataset.submission) {
    const score = Number(field.value);
    if (Number.isFinite(score) && score >= 0 && score <= 9) {
      saveUI({ ['section-score-' + field.dataset.submission + '-' + field.dataset.sectionIndex]:score });
      const scores = $$('[data-section-score]').filter(input => input.dataset.submission === field.dataset.submission).map(input => Number(input.value)).filter(value => Number.isFinite(value) && value >= 0 && value <= 9);
      const averageBand = $('[data-average-band]');
      if (averageBand && scores.length) averageBand.innerHTML = (scores.reduce((sum, value) => sum + value, 0) / scores.length).toFixed(1) + '<small>/ 9.0</small>';
      const sectionBandBadge = $$('[data-section-band-badge]').find(badge => badge.dataset.submission === field.dataset.submission && badge.dataset.sectionIndex === field.dataset.sectionIndex);
      if (sectionBandBadge) sectionBandBadge.textContent = score.toFixed(1);
    }
  }
  if (field.matches('input[name="teacherScore"]') && field.dataset.submission) {
    const subId = field.dataset.submission;
    saveUI({ [`teacher-score-${subId}`]: field.value });
    const indicator = $('#score-autosave-status');
    if (indicator) {
      indicator.textContent = '✓ Đã lưu điểm';
      indicator.classList.add('saved');
    }
  }
});
document.addEventListener('change', event => {
  const field = event.target;
  if (field.matches('[data-section-score]') && field.dataset.submission) {
    const score = Number(field.value);
    if (!Number.isFinite(score) || score < 0 || score > 9) return toast('Band điểm phải từ 0 đến 9.', true);
    if (saveUI({ ['section-score-' + field.dataset.submission + '-' + field.dataset.sectionIndex]:score }, 'Đã lưu điểm section.')) renderReview();
    return;
  }
  if (field.matches('[data-speaking-file]')) {
    const file = field.files[0];
    const form = field.closest('form[data-assignment]');
    const key = field.dataset.speakingKey;
    if (!file || !form || !key) return;
    if (!file.type.startsWith('audio/') || file.size > 50 * 1024 * 1024) { toast('Chọn file audio dưới 50 MB.', true); field.value = ''; return; }
    fileAsDataUrl(file).then(contentUrl => {
      const draftKey = 'reading-' + form.dataset.assignment;
      const nextDraft = { ...(ui[draftKey] || {}), [key]:{ name:file.name, contentUrl } };
      if (saveUI({ [draftKey]:nextDraft }, 'Đã lưu file bài nói.')) renderAssignment();
    }).catch(() => toast('Không thể đọc file bài nói.', true));
    return;
  }
  if (field.matches('[data-feedback-images]')) {
    const form = field.closest('form');
    feedbackImageFiles.set(form.dataset.submission, [...field.files]);
    renderFeedbackImageList(form);
  }
  if (field.matches('[data-filter]')) applyFilter();
  if (field.matches('[data-section-skill]')) updateAssignmentSection(field.closest('[data-assignment-section]'));
  if (field.matches('[data-writing-part]')) updateWritingTypes(field.closest('[data-assignment-section]'));
  if (field.matches('[data-rich-size]')) {
    const editor = field.closest('[data-rich-editor]').querySelector('[data-rich-content]');
    runRichCommand(editor, 'fontSize', field.value);
  }
  if (field.matches('[data-rich-image]')) {
    const file = field.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/') || file.size > 1024 * 1024) { toast('Chọn ảnh PNG, JPG, GIF hoặc WebP dưới 1 MB.', true); field.value = ''; return; }
    const editor = field.closest('[data-rich-editor]').querySelector('[data-rich-content]');
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      const source = String(reader.result);
      insertRichImageAtCaret(editor, source, file.name);
      field.value = '';
    });
    reader.readAsDataURL(file);
  }
  if (field.matches('[data-section-audio]')) {
    const file = field.files[0];
    const section = field.closest('[data-assignment-section]');
    const name = $('[data-section-audio-name]', section);
    const preview = $('[data-section-audio-preview]', section);
    if (!file) { section.dataset.audioName = ''; name.hidden = true; preview.hidden = true; preview.removeAttribute('src'); return; }
    if (!file.type.startsWith('audio/') || file.size > 50 * 1024 * 1024) { toast('Chọn file MP3, WAV, M4A hoặc OGG dưới 50 MB.', true); field.value = ''; return; }
    const previousUrl = sectionAudioUrls.get(section);
    if (previousUrl) URL.revokeObjectURL(previousUrl);
    const audioUrl = URL.createObjectURL(file);
    sectionAudioUrls.set(section, audioUrl);
    section.dataset.audioName = file.name;
    fileAsDataUrl(file).then(dataUrl => { section.dataset.audioDataUrl = dataUrl; }).catch(() => { section.dataset.audioDataUrl = ''; });
    name.textContent = `Đã chọn: ${file.name}`;
    name.hidden = false;
    preview.src = audioUrl;
    preview.hidden = false;
  }
  if (field.matches('[data-extra-class]')) updateExtraClassLabel();
  if (field.matches('[data-schedule-attachment]')) {
    const file = field.files[0];
    const name = $('[data-schedule-attachment-name]', field.closest('.schedule-attachment'));
    if (name) name.textContent = file ? file.name : 'Chưa chọn tệp';
  }
  if (field.matches('[data-class-document-file]')) {
    const file = field.files[0];
    const selection = $('[data-class-document-file-name]', field.closest('form'));
    if (selection) selection.textContent = file ? `Đã chọn: ${file.name}` : 'Chưa chọn tệp.';
  }
  if (field.matches('[data-teacher-avatar-file]')) {
    const file = field.files[0];
    const form = field.closest('form[data-form="teacher-profile"]');
    const caption = $('[data-teacher-avatar-file-name]', form);
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 1024 * 1024) { toast('Chọn ảnh PNG, JPG hoặc WebP dưới 1 MB.', true); field.value = ''; return; }
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      const source = String(reader.result);
      form.dataset.avatarDataUrl = source;
      $$('[data-teacher-avatar]').forEach(node => { node.innerHTML = `<img src="${esc(source)}" alt="">`; });
      if (caption) caption.textContent = `Đã chọn ảnh: ${file.name}`;
    });
    reader.readAsDataURL(file);
  }
  if (field.matches('[data-student-avatar-file]')) {
    const file = field.files[0];
    const form = field.closest('form[data-form="profile"]');
    const caption = $('[data-student-avatar-file-name]', form);
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 1024 * 1024) { toast('Chọn ảnh PNG, JPG hoặc WebP dưới 1 MB.', true); field.value = ''; return; }
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      const source = String(reader.result);
      form.dataset.avatarDataUrl = source;
      $$('[data-student-avatar]').forEach(node => { node.innerHTML = '<img src="' + esc(source) + '" alt="Ảnh đại diện đã chọn">'; });
      if (caption) caption.textContent = 'Đã chọn ảnh: ' + file.name;
    });
    reader.readAsDataURL(file);
  }
  if (field.matches('[data-file-preview]')) { const file = field.files[0]; $('[data-file-name]').textContent = file ? `Đã chọn: ${file.name} · ${(file.size / 1024 / 1024).toFixed(1)} MB (chưa tải lên)` : ''; }
  if (field.matches('[data-audio-preview]')) {
    const file = field.files[0]; if (!file) return;
    if (!file.type.startsWith('audio/') || file.size > 50 * 1024 * 1024) { toast('Chọn file audio dưới 50 MB để phát thử.',true); field.value = ''; return; }
    if (audioURL) URL.revokeObjectURL(audioURL);
    audioURL = URL.createObjectURL(file); $('#audio-preview').src = audioURL; $('#audio-preview').hidden = false;
  }
});

document.addEventListener('submit', async event => {
  const form = event.target.closest('form[data-form]'); if (!form) return;
  event.preventDefault();
  const data = new FormData(form); const kind = form.dataset.form;
  const error = $('.form-error',form); if (error) error.hidden = true;
  const value = name => String(data.get(name) || '').trim();
  if (kind === 'class-settings') {
    const classId = form.dataset.classId;
    if (!value('name')) return toast('Vui lòng nhập tên lớp.', true);
    if (update(s => {
      if (!s.classes.some(c => c.id === classId)) throw new Error('Không tìm thấy lớp học.');
      return { ...s, classes: s.classes.map(c => c.id === classId ? { ...c, name: value('name'), description: value('description'), classPassword: value('classPassword') } : c) };
    }, 'Đã lưu thay đổi lớp học.')) audit('Sửa lớp học');
    return;
  }
  if (kind === 'teacher-profile') {
    if (!value('name') || !value('email')) return toast('Vui lòng nhập tên hiển thị và email liên hệ.', true);
    const safe = draftFields(form);
    const previous = ui[formKey(form)];
    const avatarDataUrl = form.dataset.avatarDataUrl || previous?.avatarDataUrl;
    if (avatarDataUrl) safe.avatarDataUrl = avatarDataUrl;
    if (saveUI({ [formKey(form)]: safe }, 'Đã lưu hồ sơ và tùy chọn thông báo.')) {
      renderData();
      audit('Lưu hồ sơ giáo viên');
    }
    return;
  }
  if (kind === 'profile') {
    if (!value('name') || !value('email')) return toast('Vui lòng nhập họ tên và email liên hệ.', true);
    const safe = draftFields(form);
    const previous = ui[formKey(form)];
    const avatarDataUrl = form.dataset.avatarDataUrl || previous?.avatarDataUrl;
    if (avatarDataUrl) safe.avatarDataUrl = avatarDataUrl;
    if (saveUI({ [formKey(form)]: safe }, 'Đã lưu hồ sơ học tập.')) {
      renderStudentProfile();
      audit('Lưu hồ sơ học tập');
    }
    return;
  }
  if (kind === 'class-document-upload') {
    const classId = form.dataset.classId;
    const file = form.elements.namedItem('documentFile')?.files?.[0];
    if (!classId || !state.classes.some(classroom => classroom.id === classId)) return toast('Không tìm thấy lớp học để tải tài liệu.', true);
    if (!file) return toast('Chọn một tài liệu để tải lên.', true);
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'doc', 'docx'].includes(extension)) return toast('Chỉ hỗ trợ tài liệu PDF, DOC hoặc DOCX.', true);
    if (file.size > 2 * 1024 * 1024) return toast('Tài liệu tối đa 2 MB để có thể lưu và xem trước trong bản mẫu.', true);
    let contentUrl;
    try { contentUrl = await fileAsDataUrl(file); }
    catch { return toast('Không thể đọc tệp tài liệu đã chọn.', true); }
    const documentsByClass = { ...(ui.classDocuments || {}) };
    documentsByClass[classId] = [...classDocuments(classId), { id: id(), name: value('documentTitle'), fileName: file.name, extension, size: file.size, type: file.type || 'Tài liệu', contentUrl, uploadedAt: new Date().toISOString() }];
    if (saveUI({ classDocuments: documentsByClass }, 'Đã tải tài liệu lên.')) {
      renderClassDocuments(classId);
      audit('Tải tài liệu lớp học');
      $('#app-dialog').close();
    }
    return;
  }
  if (kind === 'class-document-edit') {
    const classId = form.dataset.classId;
    const documentId = form.dataset.documentId;
    if (!value('documentTitle')) return toast('Vui lòng nhập tên tài liệu.', true);
    const documentsByClass = { ...(ui.classDocuments || {}) };
    documentsByClass[classId] = classDocuments(classId).map(document => document.id === documentId ? { ...document, name: value('documentTitle') } : document);
    if (saveUI({ classDocuments: documentsByClass }, 'Đã cập nhật tên tài liệu.')) {
      renderClassDocuments(classId);
      audit('Chỉnh sửa tài liệu lớp học');
      $('#app-dialog').close();
    }
    return;
  }
  if (['login','admin-login','register','reset'].includes(kind)) {
    if (['register','reset'].includes(kind) && String(data.get('password')) !== String(data.get('confirm'))) { error.textContent = 'Mật khẩu xác nhận chưa khớp.'; error.hidden = false; return; }
    if (kind === 'login' || kind === 'admin-login') {
      const chosen = kind === 'admin-login' ? 'admin' : value('role') === 'student' ? 'student' : 'teacher';
      try { sessionStorage.setItem('ea.preview-role',chosen); if (data.has('remember') && chosen !== 'admin') localStorage.setItem('ea.preview-role',chosen); } catch {}
      form.reset(); go(chosen === 'admin' ? 'admin.html#overview' : `${chosen}-dashboard.html`); return;
    }
    form.reset();
    showDialog(kind === 'register' ? 'Thông tin đăng ký hợp lệ' : 'Mật khẩu mới hợp lệ', `<p>${kind === 'register' ? 'Bạn đã xem trước bước tạo tài khoản. Chưa tạo tài khoản hoặc gửi email xác minh vì hệ thống xác thực chưa được kết nối.' : 'Bạn đã xem trước bước đặt lại mật khẩu. Chưa cập nhật mật khẩu hoặc tài khoản thật.'}</p><div class="form-actions">${link('login.html','Về đăng nhập','primary')}</div>`); return;
  }
  if (kind === 'forgot') { form.reset(); showDialog('Xem trước khôi phục tài khoản','<p>Email có định dạng hợp lệ. Chưa gửi email khôi phục vì hệ thống chưa kết nối dịch vụ xác thực.</p><div class="form-actions">'+link('reset-password.html','Xem form đặt lại mật khẩu','primary')+'</div>'); return; }
  if (kind === 'class') {
    if (!value('name')) return toast('Vui lòng nhập tên lớp.',true);
    const editId = params.get('edit');
    if (update(s => {
      if (editId) {
        if (!s.classes.some(c => c.id === editId)) throw new Error('Lớp cần sửa không tồn tại.');
        return { ...s, classes: s.classes.map(c => c.id === editId ? { ...c, name: value('name'), description: value('description'), classPassword: value('classPassword') } : c) };
      }
      const classId = id(); return { ...s, classes: [...s.classes, { id: classId, name: value('name'), description: value('description'), classPassword: value('classPassword'), code: generateClassCode(s.classes.map(classroom => classroom.code)) }] };
    })) { audit(editId ? 'Sửa lớp học' : 'Tạo lớp học'); go(`${role}-classes.html`); } return;
  }
  if (kind === 'join') {
    const classroom = state?.classes.find(c => c.code.toUpperCase() === value('code').toUpperCase());
    if (!classroom) return toast('Không tìm thấy mã lớp trong dữ liệu mẫu.',true);
    if (classroom.classPassword && value('classPassword') !== classroom.classPassword) return toast('Mật khẩu lớp chưa đúng.', true);
    form.reset(); showDialog('Sẵn sàng tham gia lớp',`<h3>${esc(classroom.name)}</h3><p>Thông tin lớp đã được xác nhận. Bạn có thể tiếp tục vào không gian học tập.</p><div class="form-actions">${link(`student-class-detail.html?id=${encodeURIComponent(classroom.id)}`,'Vào lớp học','primary')}</div>`); return;
  }
  if (kind === 'assignment') {
    const sections = serializeAssignmentSections();
    const snapshot = { ...draftFields(form), sections };
    if (!sections.length) return toast('Hãy thêm ít nhất một section cho bài tập.', true);
    const emptySection = sections.find(section => !section.title || (!section.contentText && !/<img\b/i.test(section.content)));
    if (emptySection) return toast('Mỗi section cần có tên bài tập và nội dung.', true);
    const scoredSections = sections.filter(section => supportsQuestions(section.skill));
    for (const section of scoredSections) {
      if (!section.questions.length) return toast(`Section “${section.title}” cần ít nhất một câu hỏi.`, true);
      for (const question of section.questions) {
        if (!question.text || question.options.length < 2 || question.options.some(option => !option) || question.correctIndex < 0 || question.correctIndex >= question.options.length) return toast('Điền đầy đủ câu hỏi, ít nhất hai đáp án và chọn một đáp án đúng.', true);
      }
    }
    const deadline = new Date(`${value('deadline')}:00+07:00`);
    if (!Number.isFinite(deadline.getTime()) || deadline.getTime() <= Date.now()) return toast('Chọn hạn cuối nộp bài trong tương lai.',true);
    const primaryClassId = value('classId');
    const classIds = [...new Set([primaryClassId, ...$$('[data-extra-class]:checked', form).map(field => field.value)])];
    const primarySection = scoredSections[0] || sections[0];
    const questions = scoredSections.flatMap(section => section.questions.map(question => ({ id:id(), text:question.text, options:question.options, accepted:[question.options[question.correctIndex]] })));
    const assignmentTemplate = { title:value('assignmentTitle') || sections[0].title, skill:primarySection.skill, passage:primarySection.contentText, passageHtml:primarySection.content, sections, deadline:deadline.toISOString(), questions };
    const editAssignmentId = form.dataset.editAssignmentId;
    if (editAssignmentId) {
      if (update(s => {
        const existing = s.assignments.find(assignment => assignment.id === editAssignmentId);
        if (!existing) throw new Error('Bài tập cần chỉnh sửa không còn tồn tại.');
        return { ...s, assignments: s.assignments.map(assignment => assignment.id === editAssignmentId ? { ...assignment, ...assignmentTemplate, id: existing.id, classId: existing.classId } : assignment) };
      }, 'Đã lưu thay đổi bài tập.')) { saveUI({ assignmentDraft:null }); audit(`Chỉnh sửa bài ${primarySection.skill}`); go(`teacher-class-detail.html?id=${encodeURIComponent(editedAssignment()?.classId || primaryClassId)}&tab=assignments`); }
      return;
    }
    if (update(s => {
      if (!classIds.length || classIds.some(classId => !s.classes.some(c => c.id === classId))) throw new Error('Một lớp được chọn không còn tồn tại.');
      const assignments = classIds.map(classId => ({ ...assignmentTemplate, id:id(), classId, questions:assignmentTemplate.questions.map(question => ({ ...question, id:id() })) }));
      return { ...s, assignments:[...s.assignments,...assignments] };
    }, `Đã giao bài cho ${classIds.length} lớp.`)) { saveUI({assignmentDraft:null}); audit(`Giao bài ${primarySection.skill} cho ${classIds.length} lớp`); go(`teacher-class-detail.html?id=${encodeURIComponent(primaryClassId)}&tab=assignments`); } return;
  }
  if (kind === 'reading' && form.dataset.sectionIndex !== undefined) {
    const a = state?.assignments.find(item => item.id === form.dataset.assignment);
    if (!a) return toast('Bài tập không còn tồn tại.', true);
    const sectionIndex = Number(form.dataset.sectionIndex);
    const sections = assignmentSections(a);
    const savedDraft = ui['reading-' + a.id] || {};
    const nextDraft = { ...savedDraft, ...draftFields(form) };
    if (sectionIndex < sections.length - 1) {
      if (saveUI({ ['reading-' + a.id]:nextDraft }, 'Đã lưu section ' + (sectionIndex + 1) + '.')) {
        const nextUrl = 'student-reading.html?id=' + encodeURIComponent(a.id) + '&classId=' + encodeURIComponent(a.classId) + '&section=' + (sectionIndex + 1);
        go(nextUrl);
      }
      return;
    }
    const answers = a.questions.map((_, index) => String(nextDraft['answer-' + index] || ''));
    const response = sections.map((_, index) => String(nextDraft['response-' + index] || '').trim()).filter(Boolean).join('\n\n');
    if (update(s => submitAssignment(s, a.id, answers, new Date(), id(), response))) {
      saveUI({ ['reading-' + a.id]:null });
      audit('Nộp bài tập nhiều section');
      go('student-class-detail.html?id=' + encodeURIComponent(a.classId) + '&tab=results');
    }
    return;
  }
  if (kind === 'reading') {
    const a = state?.assignments.find(a=>a.id===form.dataset.assignment); if(!a) return toast('Bài tập không còn tồn tại.',true);
    const answers=a.questions.map((_,index)=>value(`answer-${index}`));
    if (update(s=>submitAssignment(s,a.id,answers,new Date(),id()))) { audit('Nộp bài Reading mẫu'); go(`student-class-detail.html?id=${encodeURIComponent(a.classId)}&tab=results`); } return;
  }
  if (kind === 'writing-assignment') {
    const a = state?.assignments.find(item => item.id === form.dataset.assignment); if (!a) return toast('Bài tập không còn tồn tại.', true);
    const response = value('response').trim();
    if (!response) return toast('Vui lòng nhập bài viết trước khi nộp.', true);
    const submitButton = $('button[type="submit"]', form);
    submitButton.disabled = true;
    submitButton.textContent = 'Đang nộp…';
    if (update(s => submitAssignment(s, a.id, [], new Date(), id(), response))) {
      saveUI({ [`reading-${a.id}`]: null });
      audit('Nộp bài Writing mẫu');
      go(`student-class-detail.html?id=${encodeURIComponent(a.classId)}&tab=results`);
    } else {
      submitButton.disabled = false;
      submitButton.textContent = 'Nộp bài viết';
    }
    return;
  }
  if (kind === 'section-review-item-edit') {
    const submission = state.submissions.find(item => item.id === form.dataset.submission);
    const assignment = submission && state.assignments.find(item => item.id === submission.assignmentId);
    const sectionIndex = Number(form.dataset.sectionIndex);
    const section = assignment && assignmentSections(assignment)[sectionIndex];
    const itemKind = form.dataset.reviewItemKind;
    const evaluation = section?.skill === 'Speaking' ? getAiSpeakingEvaluation() : section?.skill === 'Writing' ? getAiWritingEvaluation('') : null;
    const defaults = itemKind === 'criteria' ? evaluation?.criteria : evaluation?.corrections;
    const items = submission && Array.isArray(defaults) ? [...multiReviewItems(itemKind, submission.id, sectionIndex, defaults)] : [];
    const itemIndex = Number(form.dataset.itemIndex);
    if (!submission || !items[itemIndex] || (itemKind !== 'criteria' && itemKind !== 'corrections')) return toast('Không tìm thấy nội dung đánh giá.', true);
    items[itemIndex] = itemKind === 'criteria'
      ? { name:value('name'), score:value('score'), strengths:value('strengths'), improvements:value('improvements') }
      : { type:value('type'), orig:value('orig'), fix:value('fix'), explain:value('explain') };
    if (saveUI({ [multiReviewStoreKey(itemKind, submission.id, sectionIndex)]:items }, 'Đã lưu thay đổi đánh giá.')) {
      $('#app-dialog').close();
      renderReview();
      audit('Chỉnh sửa ' + (itemKind === 'criteria' ? 'tiêu chí đánh giá' : 'lỗi cần sửa'));
    }
    return;
  }
  if (kind === 'section-review-item-add') {
    const submission = state.submissions.find(item => item.id === form.dataset.submission);
    const assignment = submission && state.assignments.find(item => item.id === submission.assignmentId);
    const sectionIndex = Number(form.dataset.sectionIndex);
    const section = assignment && assignmentSections(assignment)[sectionIndex];
    const evaluation = section?.skill === 'Speaking' ? getAiSpeakingEvaluation() : section?.skill === 'Writing' ? getAiWritingEvaluation('') : null;
    if (!submission || !evaluation || (submission.published && !ui['editing-review-' + submission.id])) return toast('Không thể thêm lỗi cho section này.', true);
    const corrections = [...multiReviewItems('corrections', submission.id, sectionIndex, evaluation.corrections)];
    corrections.push({ type:value('type'), orig:value('orig'), fix:value('fix'), explain:value('explain') });
    if (saveUI({ [multiReviewStoreKey('corrections', submission.id, sectionIndex)]:corrections }, 'Đã thêm lỗi cần sửa.')) {
      $('#app-dialog').close();
      renderReview();
      audit('Thêm lỗi cần sửa');
    }
    return;
  }
  if (kind === 'review-correction-edit') {
    const submission = state.submissions.find(item => item.id === form.dataset.submission);
    const assignment = submission && state.assignments.find(item => item.id === submission.assignmentId);
    if (!submission || !assignment) return toast('Không tìm thấy lỗi cần sửa.', true);
    const aiEvaluation = assignment.skill === 'Speaking' ? getAiSpeakingEvaluation() : getAiWritingEvaluation(submission.response || '');
    const corrections = [...getReviewCorrections(submission, aiEvaluation)];
    const correctionIndex = Number(form.dataset.correctionIndex);
    if (!corrections[correctionIndex]) return toast('Lỗi cần sửa không còn tồn tại.', true);
    corrections[correctionIndex] = { type: value('type'), orig: value('orig'), fix: value('fix'), explain: value('explain') };
    if (saveUI({ [`review-corrections-${submission.id}`]: corrections }, 'Đã lưu thay đổi lỗi cần sửa.')) {
      $('#app-dialog').close();
      renderReview();
      audit('Chỉnh sửa lỗi cần sửa từ AI');
    }
    return;
  }
  if(kind==='feedback'){ if(saveUI({[`feedback-${form.dataset.submission}`]:value('feedback')},'Đã lưu nhận xét mẫu.')) audit('Lưu nhận xét bài làm'); return; }
  if (kind === 'writing-prompts' || kind === 'speaking-prompts') {
    const count = $$('[data-prompt-row]', form).length;
    if (saveUI({ [`prompt-row-count-${kind}`]:count, [formKey(form)]:draftFields(form) }, 'Đã lưu prompt mẫu trong trình duyệt.')) audit('Lưu prompt mẫu');
    return;
  }
  if (kind === 'schedule') {
    const classId = params.get('id') || params.get('classId') || state?.classes[0]?.id;
    const scheduledAt = value('date');
    if (!classId || !state?.classes.some(classroom => classroom.id === classId) || !scheduleDateKey(scheduledAt)) return toast('Ngày giờ lịch trình không hợp lệ.', true);
    const schedules = Array.isArray(ui.schedules) ? ui.schedules.filter(schedule => schedule && typeof schedule.id === 'string') : [];
    const schedule = { id:id(), classId, title:value('title').trim(), date:scheduledAt, note:value('note').trim(), createdAt:new Date().toISOString() };
    if (saveUI({ schedules:[...schedules, schedule] }, 'Đã lưu lịch trình.')) {
      $('#app-dialog').close();
      renderStudentTodaySchedule();
      audit('Lưu lịch trình');
    }
    return;
  }
  if(kind==='sample-exam'){ showDialog('Xem trước thao tác nộp bài','<p>Giao diện đã ghi nhận thao tác. Chưa nộp bài, chưa chấm hoặc gửi dữ liệu cho AI. Bạn có thể tiếp tục chỉnh sửa.</p><div class="form-actions"><button class="btn primary" data-action="close-dialog">Tiếp tục</button></div>'); return; }
  if(kind==='add-user'||kind==='admin-user'){ form.reset(); showDialog('Đã xem trước thông tin','<p>Không tạo, khóa hoặc thay đổi người dùng thật. Hành động này cần backend và kiểm tra quyền quản trị.</p><button class="btn primary" data-action="close-dialog">Đóng</button>'); return; }
  const safe=draftFields(form);
  if(saveUI({[formKey(form)]:safe},kind==='schedule'?'Đã lưu lịch trình.':'Đã lưu cài đặt mẫu trong trình duyệt.')) { audit('Lưu '+kind+' mẫu'); if($('#app-dialog').open) $('#app-dialog').close(); }
});

window.addEventListener('storage',event=>{
  if(event.key===KEY){try{state=event.newValue?readDemoState(event.newValue):createDemoState();renderData();}catch{toast('Dữ liệu đã thay đổi không hợp lệ ở tab khác. Hãy đặt lại dữ liệu mẫu.',true);}}
  if(event.key===UI_KEY){try{ui=getUI();renderData();renderCalendar();}catch{toast('Cấu hình mẫu bị lỗi ở tab khác.',true);}}
});
window.addEventListener('keydown',event=>{if(event.key==='Escape'&&$('#sidebar')?.classList.contains('open')){ $('#sidebar').classList.remove('open');$('.sidebar-overlay').classList.remove('open');$('.app-header [data-action="sidebar"]').setAttribute('aria-expanded','false'); }});
window.addEventListener('pagehide',()=>{if(audioURL)URL.revokeObjectURL(audioURL);});
