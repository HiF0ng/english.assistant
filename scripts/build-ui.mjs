import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pages } from './ui-pages.mjs';
import { shell, publicHeader, footer } from './ui-kit.mjs';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = resolve(root,'public');
mkdirSync(resolve(out,'assets'),{recursive:true});
for (const file of ['teacher-assignments.html','teacher-students.html','teacher-calendar.html','student-assignments.html','student-calendar.html','student-results.html','student-join.html','admin-dashboard.html','admin-users.html','admin-user-detail.html','admin-ai.html','admin-limits.html','admin-audit.html','admin-settings.html','admin-classes.html','admin-class-detail.html','admin-class-new.html']) {
  const target = resolve(out, file);
  if (existsSync(target)) unlinkSync(target);
}
const allPages=[...pages];
for(const page of allPages){
  const content=page.role?shell(page):page.layout==='auth'?page.content:`${publicHeader()}<main>${page.content}</main>${footer()}`;
const html=`<!doctype html>\n<html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><meta name="description" content="${page.title} — giao diện English Assistant"><title>${page.title} | English Assistant</title><link rel="icon" href="assets/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="assets/site.css?v=20261006-1"><script type="module" src="assets/site.js?v=20261006-1"></script>${page.file==='index.html'?'<link rel="stylesheet" href="assets/home.css?v=20260924-5"><script type="module" src="assets/home.js?v=20260924-5"></script>':''}</head><body data-page="${page.file}" data-role="${page.role||''}"><a class="skip-link" href="#main">Đến nội dung chính</a>${page.role?content:`<div id="main">${content}</div>`}<div id="toast" class="toast" role="status" aria-live="polite" hidden></div><dialog id="app-dialog" aria-labelledby="dialog-title"><div class="dialog-head"><h2 id="dialog-title">Thông tin</h2><button class="icon-btn" data-action="close-dialog" aria-label="Đóng hộp thoại">×</button></div><div id="dialog-content"></div></dialog><noscript><p class="no-script">Bật JavaScript để dùng form và dữ liệu mẫu. Bạn vẫn có thể xem bố cục và đi đến các trang bằng liên kết.</p></noscript></body></html>\n`;
  writeFileSync(resolve(out,page.file),html);
}
writeFileSync(resolve(out,'assets/domain.js'),stripTypeScriptTypes(readFileSync(resolve(root,'src/lib/domain.ts'),'utf8')));
const retiredStyles = [
  /\.skill-filter\{display:flex;gap:10px;margin:5px 0 25px;overflow-x:auto;padding-bottom:2px\}\.filter-chip\{padding:9px 18px;border-radius:8px;border:1px solid #e3eaf4;font-size:\.875rem;color:#7c8ca4;background:white\}\.filter-chip\.active\{background:var\(--blue\);border-color:var\(--blue\);color:white\}\.practice-heading\{margin:32px 0 23px\}\.practice-heading h2\{font-size:20px\}\.practice-heading p\{font-size:1rem;margin-top:8px\}/g,
  /\.skill-filter\{gap:8px\}\.filter-chip\{padding:8px 14px;font-size:\.875rem\}/g,
  /\.filter-chip\{font-size:1rem;min-height:40px\}/g,
  /\.filter-chip\{font-size:1rem;min-height:44px\}/g,
];
const siteCss = retiredStyles.reduce((css, pattern) => css.replace(pattern, ''), readFileSync(resolve(out,'assets/site.css'),'utf8'));
writeFileSync(resolve(out,'assets/site.css'), siteCss);
writeFileSync(resolve(out,'ui-manifest.json'),JSON.stringify(allPages.map(({file,title,role,layout})=>({file,title,role:role||layout})),null,2)+'\n');
console.log(`Generated ${allPages.length} HTML pages in public/`);
