export const icons = {
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
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',
  eye: '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  trash: '<path d="M4 7h16M10 11v6m4-6v6M9 7l1-3h4l1 3m-9 0 1 13h10l1-13"/>',
};
export const icon = (name, cls='') => `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.book}</svg>`;
export const link = (href, text, style='primary', name='arrow') => `<a class="btn ${style}" href="${href}">${text}${name ? icon(name) : ''}</a>`;
export const button = (text, action='', style='primary', name='') => `<button class="btn ${style}" type="button" ${action ? `data-action="${action}"` : ''}>${name ? icon(name) : ''}${text}</button>`;
export const badge = (text, tone='blue') => `<span class="badge ${tone}">${text}</span>`;
export const input = (label, name, type='text', placeholder='', extra='') => `<label class="field">${label}<input name="${name}" type="${type}" placeholder="${placeholder}" ${extra}></label>`;
export const area = (label, name, placeholder='', extra='') => `<label class="field">${label}<textarea name="${name}" rows="4" placeholder="${placeholder}" ${extra}></textarea></label>`;
export const select = (label, name, options, extra='') => `<label class="field">${label}<select name="${name}" aria-label="${label}" ${extra}>${options.map(o=>`<option value="${Array.isArray(o)?o[0]:o}">${Array.isArray(o)?o[1]:o}</option>`).join('')}</select></label>`;
export const panel = (title, content, action='', cls='') => `<section class="panel ${cls}"><div class="panel-head"><h2>${title}</h2>${action}</div>${content}</section>`;
export const table = (headers, rows, extra='') => `<div class="table-scroll"><table ${extra}><thead><tr>${headers.map(h=>`<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr>${row.map(cell=>`<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
export const stat = (label, value, note, name='chart', tone='blue', attr='') => `<article class="stat"><span class="stat-icon ${tone}">${icon(name)}</span><p>${label}</p><strong ${attr}>${value}</strong><small>${note}</small></article>`;
export const empty = (title, text, action='') => `<div class="empty">${icon('file')}<h3>${title}</h3><p>${text}</p>${action}</div>`;
export const skill = name => `<span class="skill-icon ${name.toLowerCase()}">${icon({Reading:'book',Listening:'audio',Writing:'pen',Speaking:'mic'}[name])}</span>`;
export const demo = '<p class="caption">Số liệu minh họa để xem thiết kế, không phải kết quả học tập thực tế.</p>';
export const pageHead = (title, description, action='') => `<div class="page-head"><div><h1>${title}</h1><p>${description}</p></div>${action}</div>`;
export const people = [ ['LA','Nguyễn Lan Anh','lananh@example.test','IELTS Foundation','Đang học'],['MH','Trần Minh Hải','minhhai@example.test','IELTS Foundation','Đang học'],['TN','Lê Thảo Nguyên','thaonguyen@example.test','IELTS Intensive','Đang học'],['ĐK','Phạm Đăng Khoa','dangkhoa@example.test','IELTS Intensive','Tạm nghỉ'] ];
export const person = (initials, name, sub='') => `<div class="person"><span class="avatar">${initials}</span><div><strong>${name}</strong>${sub?`<small>${sub}</small>`:''}</div></div>`;
export function bars(){return `<div class="skill-bars">${[['Reading',75,'3/4'],['Listening',60,'3/5'],['Writing',65,'6.5 mẫu'],['Speaking',60,'6.0 mẫu']].map(([n,v,s])=>`<div><span>${n}</span><strong>${s}</strong><div class="track"><i style="width:${v}%"></i></div></div>`).join('')}</div>${demo}`;}
export function calendar(role){return `<div class="calendar-toolbar"><div class="calendar-month-controls"><button class="btn outline calendar-month-button" type="button" data-action="calendar-prev" aria-label="Tháng trước">←</button><h2 id="calendar-title">Tháng 9, 2026</h2><button class="btn outline calendar-month-button" type="button" data-action="calendar-next" aria-label="Tháng sau">→</button></div><div class="calendar-toolbar-actions">${role==='student'?badge('Lịch của bạn'):button('Thêm lịch trình','schedule','primary','plus')}</div></div><div id="calendar" class="calendar" aria-label="Lịch hạn nộp bài tập"></div>`;}
export const navs = {
 teacher:[['teacher-dashboard.html','Tổng quan','grid'],['teacher-classes.html','Lớp học','book']],
 student:[['student-dashboard.html','Tổng quan','grid'],['student-classes.html','Lớp của tôi','book'],['student-profile.html','Hồ sơ học tập','users']],
 admin:[['admin.html#overview','Tổng quan','grid'],['admin.html#users','Người dùng','users'],['admin.html#prompt','Cấu hình AI','shield'],['admin.html#audit','Nhật ký hoạt động','file']],
};
export const brand = `<a class="brand" href="index.html"><span class="brand-mark">${icon('book')}</span><span>english<span class="brand-light">assistant</span></span></a>`;
export function publicHeader(){return `<header class="public-header"><div class="container header-inner">${brand}<nav aria-label="Tài khoản" id="public-nav"><a href="login.html">Đăng nhập</a>${link('register.html','Đăng ký','primary','')}</nav></div></header>`;}
export function footer(){return `<footer class="public-footer container"><div>${brand}<p>Lớp học, bài tập và phản hồi<br>dành cho giáo viên và học sinh.</p></div><div><strong>Khám phá</strong><a href="index.html#features">Tính năng</a></div><div><strong>Tài khoản</strong><a href="login.html">Giáo viên & học sinh</a><a href="register.html">Tạo tài khoản</a></div><div class="footer-bottom"><span>© 2026 English Assistant</span></div></footer>`;}
import { navigationParent } from '../public/assets/navigation.js';
const pageBack = page => {
 const topLevelPages = new Set(['teacher-classes.html','teacher-submissions.html','settings.html','student-classes.html']);
 if (topLevelPages.has(page.file)) return '';
 const href = navigationParent(page.file, page.role);
 return href ? `<div class="page-back-row"><a class="btn outline page-back" href="${href}" data-page-back><span aria-hidden="true">←</span>Quay lại</a></div>` : '';
};
const teacherNavigation = page => {
 const isReview = ['teacher-submissions.html','teacher-review.html'].includes(page.file);
 const isClassSpace = page.file.startsWith('teacher-class') || page.file.startsWith('teacher-assignment') || isReview;
 const isClasses = isClassSpace && !isReview;
 return `<a href="teacher-dashboard.html" class="nav-link ${page.file==='teacher-dashboard.html'?'active':''}" ${page.file==='teacher-dashboard.html'?'aria-current="page"':''}>${icon('grid')}<span>Tổng quan</span></a><div class="nav-group teacher-class-nav ${isClassSpace?'is-open group-active':''}" data-class-navigation><a href="teacher-classes.html" class="nav-link nav-group-trigger ${isClasses?'active':''}" ${isClasses?'aria-current="page"':''}>${icon('book')}<span>Lớp học</span></a><div id="teacher-class-submenu" class="nav-submenu" ${isClassSpace?'':'hidden'}><a href="teacher-classes.html" class="nav-submenu-link ${isClasses?'active':''}" ${isClasses?'aria-current="page"':''}><span>Lớp học</span></a><a href="teacher-submissions.html" class="nav-submenu-link ${isReview?'active':''}" ${isReview?'aria-current="page"':''}><span>Bài tập chờ nhận xét</span></a></div></div><button class="nav-link nav-payment" type="button" data-action="payment" aria-label="Thanh toán"><span class="nav-payment-symbol" aria-hidden="true">₫</span><span>Thanh toán</span></button>`;
};
const adminNavigation = () => `<a href="admin.html#overview" class="nav-link" data-admin-route="overview">${icon('grid')}<span>Tổng quan</span></a><a href="admin.html#users" class="nav-link" data-admin-route="users">${icon('users')}<span>Người dùng</span></a><div class="nav-group admin-ai-nav"><a href="admin.html#prompt" class="nav-link nav-group-trigger" data-admin-ai-trigger>${icon('shield')}<span>Cấu hình AI</span></a><div id="admin-ai-submenu" class="nav-submenu"><a href="admin.html#prompt" class="nav-submenu-link" data-admin-route="prompt"><span>Prompt</span></a><a href="admin.html#quota" class="nav-submenu-link" data-admin-route="quota"><span>Quota</span></a><a href="admin.html#settings" class="nav-submenu-link" data-admin-route="settings"><span>Cài đặt</span></a></div></div><a href="admin.html#audit" class="nav-link" data-admin-route="audit">${icon('file')}<span>Nhật ký hoạt động</span></a>`;
export function shell(page){const role=page.role; const name={teacher:'Giáo viên',student:'Học sinh',admin:'Quản trị viên'}[role]; const navigation=role==='teacher'?teacherNavigation(page):role==='admin'?adminNavigation():navs[role].map(([href,title,i])=>`<a href="${href}" class="nav-link ${page.nav===href?'active':''}" ${page.nav===href?'aria-current="page"':''}>${icon(i)}<span>${title}</span></a>`).join(''); const profile=role==='teacher'?`<div class="person"><span class="avatar" data-teacher-avatar>GV</span><div><strong data-teacher-name>Giáo viên mẫu</strong><small>Giáo viên</small></div></div>`:person(role==='student'?'LA':'AD',role==='student'?'Lan Anh':'Admin mẫu',name); const breadcrumb=role==='admin'?`<span data-admin-breadcrumb>${page.title}</span>`:`Không gian ${name.toLowerCase()} <span>/ ${page.title}</span>`; const profileHref=role==='admin'?'admin.html#settings':`${role==='student'?'student-profile':'settings'}.html`; return `<div class="app-layout"><aside class="sidebar" id="sidebar">${brand}${role==='admin'?'':`<p class="nav-section">KHÔNG GIAN ${name.toUpperCase()}</p>`}<nav aria-label="Điều hướng chính">${navigation}</nav><div class="sidebar-bottom"><a class="nav-link" href="${role==='admin'?'admin-login':'login'}.html" data-logout>${icon('logout')}Đăng xuất</a></div></aside><div class="main-layout"><header class="app-header"><button class="icon-btn mobile-toggle" aria-label="Mở điều hướng" aria-expanded="false" data-action="sidebar">${icon('menu')}</button><span class="breadcrumb">${breadcrumb}</span><div class="header-actions"><a class="icon-btn" href="${role==='admin'?'admin.html#audit':`notifications.html?role=${role}`}" aria-label="Thông báo">${icon('bell')}<i class="notification-dot"></i></a><a class="profile-link" href="${profileHref}">${profile}</a></div></header><main class="workspace" id="main">${pageBack(page)}${page.content}<footer class="app-footer"><span>English Assistant · Không gian học tập của bạn</span></footer></main></div><button class="sidebar-overlay" aria-label="Đóng điều hướng" data-action="sidebar"></button></div>`;}
