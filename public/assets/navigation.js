// Shared by the HTML generator and browser so direct links have a useful fallback.
const parents = {
  'classes': 'dashboard', 'class-detail': 'classes', 'class-new': 'classes',
  'assignment-new': 'classes', 'assignment-preview': 'classes', 'assignment-results': 'assignment-preview',
  'assignment-detail': 'class-detail', 'submissions': 'dashboard',
  'review': 'submissions', 'student-detail': 'class-detail', 'reports': 'dashboard',
  'reading': 'assignment-detail', 'listening': 'class-detail',
  'writing': 'class-detail', 'speaking': 'class-detail', 'result-detail': 'class-detail',
  'profile': 'dashboard',
};

export function navigationParent(page, role, params = new URLSearchParams()) {
  if (!['teacher', 'student'].includes(role) || page === `${role}-dashboard.html`) return '';
  const slug = page.replace(`${role}-`, '').replace('.html', '');
  const classId = params.get('classId');
  if (slug === 'class-new' && params.get('edit')) return `${role}-class-detail.html?id=${encodeURIComponent(params.get('edit'))}&tab=settings`;
  if (slug === 'reading' && params.get('id')) return `student-assignment-detail.html?id=${encodeURIComponent(params.get('id'))}${classId ? `&classId=${encodeURIComponent(classId)}` : ''}`;
  if (slug === 'assignment-preview' && params.get('draft') === '1') return 'teacher-assignment-new.html';
  if (classId && ['assignment-new', 'assignment-preview', 'assignment-results', 'assignment-detail', 'student-detail', 'listening', 'writing', 'speaking', 'result-detail'].includes(slug)) {
    const tab = slug === 'result-detail' ? 'results' : slug === 'student-detail' ? 'students' : 'assignments';
    return `${role}-class-detail.html?id=${encodeURIComponent(classId)}&tab=${tab}`;
  }
  return `${role}-${parents[slug] || 'dashboard'}.html`;
}

function allowed(url, role, origin) {
  if (url.origin !== origin || url.username || url.password) return false;
  const file = url.pathname.slice(1);
  if (file === 'notifications.html') return (url.searchParams.get('role') || role) === role;
  if (file === 'settings.html') return role === 'teacher';
  if (!file.startsWith(`${role}-`) || !file.endsWith('.html')) return false;
  const slug = file.slice(role.length + 1, -5);
  return slug === 'dashboard' || Object.hasOwn(parents, slug);
}

export function safeReturnTo(value, role, current) {
  if (!value || value.length > 6000) return '';
  try {
    const url = new URL(value, current);
    if (!allowed(url, role, current.origin) || url.pathname === current.pathname) return '';
    // Validate the whole trail; a nested return must never send users outside the app.
    const nested = url.searchParams.get('returnTo');
    if (nested && !safeReturnTo(nested, role, url)) url.searchParams.delete('returnTo');
    return url.pathname + url.search + url.hash;
  } catch { return ''; }
}

export function navigationUrl(value, role, current = new URL(location.href)) {
  const target = new URL(value, current);
  if (!allowed(target, role, current.origin) || target.pathname === current.pathname || target.pathname === `/${role}-dashboard.html`) return value;
  const back = safeReturnTo(current.searchParams.get('returnTo'), role, current);
  if (back && target.pathname === new URL(back, current).pathname) return back;
  const source = new URL(current);
  const previous = safeReturnTo(source.searchParams.get('returnTo'), role, source);
  if (previous) source.searchParams.set('returnTo', previous);
  else source.searchParams.delete('returnTo');
  const returnTo = source.pathname + source.search + source.hash;
  if (returnTo.length <= 6000) target.searchParams.set('returnTo', returnTo);
  const classId = current.pathname.endsWith('-class-detail.html') ? current.searchParams.get('id') : current.searchParams.get('classId');
  if (classId && !target.searchParams.has('classId') && !target.pathname.endsWith('-class-detail.html')) target.searchParams.set('classId', classId);
  return target.pathname + target.search + target.hash;
}

export function setupNavigation(role) {
  if (!['teacher', 'student'].includes(role)) return;
  const current = new URL(location.href);
  const page = document.body.dataset.page;
  const back = document.querySelector('[data-page-back]');
  if (back) {
    back.href = safeReturnTo(current.searchParams.get('returnTo'), role, current) || navigationParent(page, role, current.searchParams);
    // Existing form cancellation links should return to the same context.
    document.querySelectorAll('.form-actions a').forEach(anchor => {
      if (['Hủy', 'Quay lại'].includes(anchor.textContent.trim())) {
        anchor.href = back.href;
        anchor.dataset.navigationBack = '';
      }
    });
  }
  const follow = event => {
    const anchor = event.target.closest('a[href]');
    if (!anchor || anchor.matches('[data-page-back], [data-navigation-back], [data-logout], [data-class-tab]') || anchor.closest('.sidebar, .app-footer') || anchor.hasAttribute('download')) return;
    if (anchor.getAttribute('href').startsWith('#')) return;
    anchor.href = navigationUrl(anchor.href, role, new URL(location.href));
  };
  document.addEventListener('click', follow, true);
  document.addEventListener('auxclick', follow, true);
}
