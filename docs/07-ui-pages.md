# Danh mục và hướng dẫn bộ giao diện HTML

Cập nhật 23/09/2026. Có 50 file HTML trong `public/`. Đây là bộ giao diện tương tác cho một người triển khai với AI, không phải hệ thống đã có backend.

## Mở nhanh

| Màn hình | Đường dẫn local |
| --- | --- |
| Trang chủ | http://127.0.0.1:3000/ |
| Trang dành cho giáo viên/học sinh | http://127.0.0.1:3000/pages.html |
| Login giáo viên/học sinh | http://127.0.0.1:3000/login.html |
| Login quản trị riêng | http://127.0.0.1:3000/admin-login.html |

Trong login mẫu, nhập email giả đúng định dạng và mật khẩu bất kỳ để chuyển đến dashboard tương ứng. Không có tài khoản thật được xác thực. Admin không xuất hiện trên homepage, footer, trợ giúp, login chung hoặc danh mục công khai. Khu vực admin vẫn có URL riêng để duyệt nội bộ. Tất cả các trang vẫn có thể truy cập trực tiếp để duyệt thiết kế; đây không phải phân quyền bảo mật.

## Bảng checklist trang

Các file trong bảng nằm ở `public/`. `[x]` xác nhận có giao diện, không xác nhận chức năng production.

| Có UI | File HTML | Nội dung |
| --- | --- | --- |
| [x] | index.html | Homepage, 4 kỹ năng, giới thiệu luồng học |
| [x] | login.html | Đăng nhập với lựa chọn Giáo viên/Học sinh |
| [x] | register.html | Đăng ký theo vai trò, xác nhận mật khẩu |
| [x] | forgot-password.html | Khôi phục tài khoản mẫu |
| [x] | reset-password.html | Đặt mật khẩu mới mẫu |
| [x] | admin-login.html | Đăng nhập quản trị riêng |
| [x] | help.html | Hướng dẫn và FAQ, giới hạn/privacy bản mẫu |
| [x] | teacher-dashboard.html | Tổng quan giáo viên |
| [x] | teacher-classes.html | Tìm và xem lớp |
| [x] | teacher-class-new.html | Tạo/sửa lớp mẫu (`?edit=id`) |
| [x] | teacher-class-detail.html | Chi tiết lớp (`?id=id`) |
| [x] | teacher-assignments.html | Tìm/lọc bài tập |
| [x] | teacher-assignment-new.html | Soạn 4 kỹ năng; giao Reading mẫu |
| [x] | teacher-assignment-preview.html | Xem trước bài hoặc nháp |
| [x] | teacher-submissions.html | Bài nộp chờ duyệt/đã công bố |
| [x] | teacher-review.html | Đáp án, điểm, nhận xét và công bố mẫu |
| [x] | teacher-students.html | Danh sách học sinh minh họa |
| [x] | teacher-student-detail.html | Hồ sơ và kỹ năng minh họa |
| [x] | teacher-calendar.html | Lịch tháng, bản nháp buổi học |
| [x] | teacher-reports.html | Biểu đồ và báo cáo minh họa |
| [x] | settings.html | Hồ sơ giáo viên và tùy chọn thông báo |
| [x] | student-dashboard.html | Tổng quan học sinh |
| [x] | student-classes.html | Lớp của học sinh mẫu |
| [x] | student-class-detail.html | Thông tin lớp và bài tập |
| [x] | student-join.html | Xem lớp theo mã, chưa kiểm tra mật khẩu |
| [x] | student-assignments.html | Danh sách bài và lối vào 4 kỹ năng |
| [x] | student-assignment-detail.html | Yêu cầu bài, deadline, nút bắt đầu |
| [x] | student-reading.html | Đọc, nhập đáp án, lưu nháp và nộp mẫu |
| [x] | student-listening.html | Chọn audio cục bộ, trình phát, câu hỏi mẫu |
| [x] | student-writing.html | Đề bài, vùng viết, đếm từ, lưu nháp |
| [x] | student-speaking.html | Cue card, chọn/phát file ghi âm |
| [x] | student-submissions.html | Lịch sử bài nộp mẫu |
| [x] | student-results.html | Điểm sau công bố và trạng thái chờ |
| [x] | student-result-detail.html | Câu trả lời, đáp án, nhận xét |
| [x] | student-calendar.html | Lịch học tháng minh họa |
| [x] | student-profile.html | Hồ sơ và liên hệ phụ huynh mẫu |
| [x] | notifications.html | Thông báo dùng chung (`?role=teacher/student/admin`) |
| [x] | admin-dashboard.html | Tổng quan hệ thống và trạng thái dịch vụ |
| [x] | admin-users.html | Tìm/lọc người dùng, xem trước lời mời |
| [x] | admin-user-detail.html | Thông tin và xem trước quản lý tài khoản |
| [x] | admin-classes.html | Danh sách lớp mẫu toàn hệ thống |
| [x] | admin-class-detail.html | Chi tiết lớp phía admin |
| [x] | admin-class-new.html | Tạo/sửa lớp phía admin |
| [x] | admin-ai.html | Lựa chọn provider mẫu, khóa API bị vô hiệu hóa |
| [x] | admin-limits.html | Cấu hình quota/ngân sách mẫu |
| [x] | admin-audit.html | Nhật ký thao tác cục bộ |
| [x] | admin-settings.html | Cài đặt và đặt lại dữ liệu mẫu |
| [x] | 403.html | Thiết kế màn hình không có quyền |
| [x] | 404.html | Thiết kế màn hình không tìm thấy |
| [x] | pages.html | Danh mục liên kết tới các trang trên |

## Phân biệt tương tác thật trong bản mẫu và phần minh họa

| Khu vực | Hoạt động cục bộ | Còn cần backend/dịch vụ |
| --- | --- | --- |
| Tài khoản | Chọn vai trò, hiện/ẩn mật khẩu, validation | Auth, xác minh email, session, phân quyền |
| Lớp | Tạo/sửa/tìm lớp mẫu, sao chép mã | Membership, mật khẩu lớp, quyền sở hữu |
| Reading | Tạo 1 câu ngắn, nháp, nộp/chấm, nhận xét/công bố | Nhiều dạng câu, giao dịch, đáp án riêng server |
| Writing | Soạn nháp đề/bài, đếm từ, khôi phục nháp | Giao/nộp thực tế, rubric, chấm AI |
| Listening/Speaking | Chọn/phát audio trên máy, nháp ghi chú | Upload private, ghi âm, STT, chấm AI |
| Lịch/báo cáo | Chuyển tháng, số liệu minh họa, lưu nháp buổi học | Lịch thật, nhắc lịch, tổng hợp tiến độ |
| Admin | Tìm/lọc mẫu, lưu cấu hình không chứa secrets, nhật ký local | Quản lý người dùng thật, quota thực thi, audit server |
| Email | Xem trước nội dung | Provider, gửi thật, retry, chống gửi trùng |

## Chỉnh sửa ở đâu?

| File nguồn | Vai trò | Có thể sửa trực tiếp? |
| --- | --- | --- |
| `scripts/home-content.mjs` | Nội dung trang chủ, chỉ giáo viên và học sinh | Có |
| `scripts/ui-pages.mjs` | Nội dung/layout từng trang | Có |
| `scripts/ui-kit.mjs` | Header/footer/sidebar, icon, form và thành phần dùng chung | Có |
| `public/assets/home.css`, `home.js` | Bố cục trang chủ và bốn mục xem trước tính năng trong hero | Có |
| `public/assets/site.css` | Màu sắc, typography, responsive, trạng thái | Có |
| `public/assets/site.js` | Điều hướng, form, nháp, danh sách và tương tác demo | Có |
| `src/lib/domain.ts` | Quy tắc chấm/nộp/công bố và kiểm tra dữ liệu | Có; chạy lại unit tests |
| `scripts/build-ui.mjs` | Sinh HTML, manifest và module domain | Có |
| `public/*.html`, `assets/domain.js`, `ui-manifest.json` | Kết quả sinh tự động | Không nên sửa trực tiếp; bị ghi lại khi build |
| `tests/browser/workflow.spec.ts` | Kiểm thử trình duyệt desktop/mobile | Có |

Sau khi sửa template/domain chạy `pnpm build:ui`. `pnpm dev` và `pnpm build` đã gọi bước này tự động khi khởi động. Khi đang chạy dev và tiếp tục sửa template `.mjs`, cần chạy lại `pnpm build:ui` rồi tải lại trang; không có watcher template riêng. Sau khi sửa CSS/JS, tải lại trang để thấy thay đổi.

Luôn phục vụ qua HTTP. Toàn bộ asset dùng đường dẫn tương đối trong `public/`, không tải font, ảnh hay thư viện từ CDN. Không cần mua hình ảnh hoặc gọi AI để xem UI. CSS sử dụng font hệ thống và icon SVG trong mã nguồn.

## Quy trình duyệt một người

1. Duyệt homepage, login và 3 dashboard trước để chốt màu, chữ, cách điều hướng.
2. Duyệt luồng giáo viên giao bài → học sinh nộp → giáo viên công bố → học sinh xem kết quả.
3. Duyệt layout các kỹ năng và admin, không nhập thông tin thật/API key.
4. Ghi những thay đổi mong muốn; sửa template/CSS chung trước, tránh sửa 50 HTML lặp lại.
5. Chạy unit/typecheck/build/browser tests rồi mới bắt đầu nối backend theo M2 trong CHECKLIST.md.

Chưa triển khai lên production, không có dữ liệu thật được nhập hoặc gửi cho nhà cung cấp AI trong bước giao diện này.
