# English Assistant

Website hỗ trợ giáo viên giao bài và theo dõi học tập tiếng Anh. Chủ dự án là người duy nhất phụ trách sản phẩm, kiểm thử và vận hành, với AI hỗ trợ viết mã.

## Trạng thái hiện tại

M0 có đặc tả và lịch thực hiện bản đầu. M1 có **50 trang HTML/CSS responsive**, gồm homepage, login chọn giáo viên/học sinh, login quản trị riêng, dashboard và các màn hình cho ba vai trò. Luồng Reading mẫu hoạt động cục bộ: tạo lớp → giao bài → học sinh làm/nộp → giáo viên nhận xét/công bố → học sinh xem điểm. Dữ liệu và bản nháp lưu bằng localStorage.

**Đây là prototype nội bộ, chưa phải hệ thống vận hành.** Login chỉ chuyển sang giao diện mẫu; mật khẩu không được lưu, đáp án và dữ liệu mẫu đều có thể xem ở client. Không nhập dữ liệu cá nhân, khóa API hoặc dùng để tổ chức thi thật. Backend, PostgreSQL, tài khoản thật, phân quyền, lịch thực tế, Writing/Speaking AI và email chưa được kết nối. Listening/Speaking chỉ phát thử file audio cục bộ.

## Tra cứu dự án

| File | Dùng để |
| --- | --- |
| [CHECKLIST.md](CHECKLIST.md) | Theo dõi mốc hiện tại, việc hoàn thành, việc tiếp theo và bằng chứng |
| [docs/01-prd.md](docs/01-prd.md) | Phạm vi, user stories, quy tắc nghiệp vụ và nghiệm thu |
| [docs/02-data-api.md](docs/02-data-api.md) | Mô hình dữ liệu, quyền truy cập và hợp đồng API dự kiến |
| [docs/03-solo-roadmap.md](docs/03-solo-roadmap.md) | Lịch một người, ước lượng công sức, quan hệ phụ thuộc |
| [docs/04-decisions.md](docs/04-decisions.md) | Giả định, lựa chọn có thể đổi và những quyết định đang mở |
| [docs/05-sitemap.md](docs/05-sitemap.md) | Màn hình hiện có và các trang sẽ xây |
| [docs/06-verification.md](docs/06-verification.md) | Kiểm tra đã chạy và giới hạn của bản hiện tại |
| [docs/07-ui-pages.md](docs/07-ui-pages.md) | Danh mục 50 trang HTML, phạm vi tương tác và cách sửa giao diện |
| [public/pages.html](public/pages.html) | Danh mục trang có thể bấm để xem trực tiếp |

Hai tài liệu Word trong thư mục là đầu vào và checklist tổng quan ban đầu. Các file Markdown là tài liệu theo dõi đang được cập nhật; lịch nhiều người trong Word được thay bằng lịch một người ở `docs/03-solo-roadmap.md`.

## Chạy trên máy

Yêu cầu Node.js 22.18 trở lên và pnpm. Các phiên bản thư viện đã được khóa trong `pnpm-lock.yaml`.

```powershell
pnpm install --frozen-lockfile
pnpm dev
```

Mở [trang chủ](http://127.0.0.1:3000/), [login giáo viên/học sinh](http://127.0.0.1:3000/login.html), [login admin](http://127.0.0.1:3000/admin-login.html) hoặc [danh mục trang giáo viên/học sinh](http://127.0.0.1:3000/pages.html). Trên máy hiện tại pnpm có sẵn qua runtime của ứng dụng:

```powershell
& 'C:\Users\dungk\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback\pnpm.cmd' dev
```

## Kiểm tra

```powershell
pnpm test
pnpm typecheck
pnpm build
pnpm exec playwright test
```

Playwright dùng Edge tại `C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe` khi file đó tồn tại; nếu không, dùng Chromium đã cài cho Playwright (`pnpm exec playwright install chromium`). Không dùng tài khoản hoặc hồ sơ trình duyệt cá nhân.

## Thử một vòng nghiệp vụ

1. Mở `login.html`, chọn Giáo viên, nhập email giả và mật khẩu bất kỳ để xem dashboard mẫu. Vào Lớp học → Tạo lớp mới.
2. Vào Bài tập → Tạo bài tập, tạo bài Reading; chọn deadline tương lai theo giờ Việt Nam.
3. Mở lại `login.html`, chọn Học sinh; vào Bài tập → Làm bài → Bắt đầu làm bài, trả lời và nộp.
4. Vào Kết quả: chỉ hiện trạng thái chờ công bố.
5. Chuyển Giáo viên, vào Bài nộp, công bố kết quả.
6. Quay lại Học sinh, xem số câu đúng/tổng câu. Tải lại trang để kiểm tra dữ liệu đã lưu.

Điểm mẫu không quy đổi sang band IELTS. Reading và Writing có lưu nháp cục bộ khi nhập. Chức năng Đặt lại dữ liệu trong `admin.html#settings` chỉ xóa dữ liệu mẫu của English Assistant sau khi xác nhận; không xóa toàn bộ localStorage của website.

## Kiến trúc ban đầu

`public/*.html` là các trang thực tế được sinh từ `scripts/home-content.mjs`, `scripts/ui-pages.mjs` và `scripts/ui-kit.mjs`. `public/assets/site.css` và `site.js` chứa CSS/tương tác dùng chung. `public/assets/home.css` và `home.js` phục vụ riêng trang chủ với hero mô phỏng màn hình ứng dụng, chuyển giữa Lớp học, Bài tập, Lịch học và Kết quả. Sau khi sửa template, chạy `pnpm build:ui`; lệnh này ghi lại HTML và `assets/domain.js`. Không sửa trực tiếp những file sinh tự động nếu muốn giữ thay đổi qua lần build tiếp theo.

`src/lib/domain.ts` là nguồn quy tắc chấm/nộp/công bố dùng chung; build UI chuyển TypeScript này thành module trình duyệt. `src/app` và `src/components/workspace.tsx` giữ prototype React trước đó; trang `/` hiện được rewrite đến `public/index.html`. Next.js vẫn là server xem trước/build hiện tại. M2 cần chuyển dữ liệu và phân quyền sang server, không dùng kiểm tra vai trò của prototype làm bảo mật.

Có thể phục vụ riêng thư mục `public/` bằng static HTTP server. Cần HTTP để các module JavaScript hoạt động; không mở bằng `file://` nếu muốn thử đầy đủ tương tác. Các đường dẫn sạch `/teacher/dashboard`, `/student/results`, `/admin/login` tương thích thông qua cấu hình Next; khi host tĩnh, dùng link `.html`.

Hướng dẫn Next.js đã tham khảo: https://nextjs.org/docs/app/getting-started/installation và https://nextjs.org/docs/app/api-reference/directives/use-server.
