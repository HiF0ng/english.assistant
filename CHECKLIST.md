# Checklist triển khai English Assistant

Cập nhật 23/09/2026. Chủ dự án là người duy nhất kiêm nhiệm, AI hỗ trợ triển khai. Lịch chi tiết ở `docs/03-solo-roadmap.md`; đặc tả ở `docs/01-prd.md`. File này là điểm bắt đầu cho các phiên làm việc tiếp theo.

Ký hiệu: `[x]` đã có đầu ra phù hợp phạm vi, `[ ]` chưa hoàn thành. Prototype không tính là chức năng production. Không suy ra hoàn thành Auth/DB/AI từ giao diện mẫu.

## M0 Phạm vi và đặc tả

- [x] Đọc yêu cầu trong Info.docx và kế thừa phân tích/checklist Word.
- [x] Điều chỉnh kế hoạch theo một người với AI hỗ trợ.
- [x] Lập PRD, user stories, quy tắc và tiêu chí nghiệm thu bản đầu.
- [x] Lập sitemap và phân loại trang mẫu/trang sẽ triển khai.
- [x] Thiết kế dữ liệu và API ở mức hợp đồng, chưa tạo DB thật.
- [x] Ghi quyết định mở và giả định có thể thay đổi.
- [ ] Chốt số giờ mỗi tuần và cập nhật lịch theo năng lực thực tế.
- [ ] Chốt mô hình một trung tâm/nhiều tổ chức trước database production.
- [ ] Chọn DB/Auth/Storage, khu vực, tài khoản và ngân sách.

## M1 Nền tảng và bản mẫu local

- [x] Khởi tạo Next.js + TypeScript, dependency lockfile, cấu hình bỏ qua secrets/build.
- [x] Tạo trang bắt đầu, khung responsive trắng/xanh và điều hướng ba vai trò.
- [x] Tạo lớp mẫu và giao bài Reading một câu, lưu trình duyệt.
- [x] Luồng học sinh làm/nộp, chấm đáp án, chặn trùng và kiểm tra deadline.
- [x] Giáo viên công bố, học sinh xem điểm sau công bố.
- [x] Ghi rõ dữ liệu mẫu và chưa có xác thực/AI/email thật.
- [x] Hoàn tất kiểm tra unit, TypeScript và production build. Bằng chứng: `docs/06-verification.md`.
- [x] Kiểm tra quy trình mẫu qua trình duyệt desktop/mobile, lưu sau reload, phục hồi dữ liệu lỗi và trang 404.
- [ ] Chủ dự án xem và duyệt hướng giao diện.

## M2 Tài khoản và dữ liệu thật

Phần giao diện đã được làm trước theo yêu cầu bổ sung; các mục dưới vẫn là chức năng backend chưa hoàn thành.

- [ ] Chốt adapter Auth/DB; tạo môi trường development riêng.
- [ ] Migration schema và seed thử; chỉ tạo admin bằng cơ chế server.
- [ ] Đăng ký giáo viên/học sinh, xác minh email, đăng nhập/logout/reset.
- [ ] Phân quyền đối tượng trên server, không dùng role do client gửi.
- [ ] Thay repository localStorage bằng backend; không chuyển dữ liệu demo thành dữ liệu người thật.
- [ ] Kiểm thử truy cập chéo hai giáo viên, hai học sinh, tài khoản bị khóa.

## M3 Lớp và lịch

- [ ] CRUD lớp, mã duy nhất, hash mật khẩu, giới hạn thử sai.
- [ ] Membership, tham gia lớp, danh sách thành viên đúng quyền.
- [ ] Hồ sơ học sinh, liên hệ phụ huynh tùy chọn theo chính sách đã chốt.
- [ ] Lịch buổi học, chỉnh/hủy, UTC và giờ Việt Nam, nhắc lịch.

## M4 Bài tập và nộp bài

- [ ] Reading có các loại câu hỏi đã chọn, đáp án riêng server.
- [ ] Listening có audio private, player, quy tắc nghe.
- [ ] Nháp/xem trước/giao/đóng bài, giao nhiều lớp, phiên bản đề.
- [ ] Autosave, khôi phục sau reload/mất mạng, báo trạng thái lưu.
- [ ] Nộp transaction và idempotency, deadline server, chính sách nộp lại.
- [ ] Chấm đáp án test chuẩn; bảng quy đổi band nếu được duyệt.

## M5 Điểm và pilot MVP

- [ ] Review, chỉnh điểm kèm lý do, công bố và audit.
- [ ] Dashboard từ dữ liệu thật, kết quả/tiến bộ không trộn thang điểm.
- [ ] Admin quản lý tài khoản và truy cập lớp đúng chính sách.
- [ ] Log không chứa secrets, backup và thực hành khôi phục.
- [ ] UAT desktop/mobile, permission tests, thử dữ liệu thật trong phạm vi pilot đã chọn.
- [ ] Chủ dự án duyệt phát hành khi các điều kiện nghiệm thu đạt.

## M6 AI và hoàn thiện V1

- [ ] Chủ dự án cung cấp prompt/rubric Writing, bài mẫu và điểm chuẩn.
- [ ] PoC Writing/Speaking, đo sai lệch, lỗi, thời gian và chi phí.
- [ ] Ghi âm, private upload, STT, pronunciation và phân tích transcript.
- [ ] AI adapter, job queue, retry, versioning, giáo viên duyệt.
- [ ] Quản lý khóa write-only, quota nguyên tử, theo dõi chi phí.
- [ ] Email điểm cho học sinh/phụ huynh được chọn, log và dedupe.
- [ ] Biểu đồ kỹ năng và tiến bộ có nguồn dữ liệu rõ.
- [ ] Nghiệm thu bằng bộ bài chuẩn trước phát hành V1.

## Bước kế tiếp

Duyệt bộ giao diện tại `public/pages.html`, sau đó bắt đầu M2 với nhà cung cấp dữ liệu/xác thực được chọn. Những phần thiếu tài khoản bên ngoài vẫn để trạng thái chưa hoàn thành, không thay bằng giả lập rồi đánh dấu xong.

## M1.1 Bộ giao diện hoàn chỉnh theo vai trò — 23/09/2026

| Checklist | Đầu ra | Phạm vi |
| --- | --- | --- |
| [x] Homepage, trợ giúp, 403/404 và danh mục trang | `public/index.html`, `help.html`, `403.html`, `404.html`, `pages.html` | Giao diện tĩnh; 403/404 là mẫu thiết kế |
| [x] Login chọn Giáo viên/Học sinh | `public/login.html` | Chuyển vai trò xem thử, chưa xác thực |
| [x] Đăng ký/quên/đặt lại mật khẩu | 3 trang tài khoản | Validation form, không tạo tài khoản/gửi email thật |
| [x] Login quản trị riêng | `public/admin-login.html` | Không cho chọn/cấp admin từ form đăng ký chung |
| [x] Không gian giáo viên | 14 trang, gồm cài đặt tài khoản | Lớp, bài tập, học sinh, review, lịch, báo cáo |
| [x] Không gian học sinh | 16 trang, gồm thông báo dùng chung | Lớp, 4 kỹ năng, bài nộp, kết quả, lịch, hồ sơ |
| [x] Không gian admin | 10 trang | Người dùng, lớp, cấu hình AI, hạn mức, nhật ký, hệ thống |
| [x] CSS và tương tác dùng chung | `public/assets/site.css`, `site.js` | Responsive, sidebar mobile, lọc/tìm kiếm, dialog, thông báo |
| [x] Nháp Reading/Writing và phản hồi | Bộ lưu demo cục bộ | Không thay thế autosave/backend M4–M5 |
| [x] Hướng dẫn sửa và danh sách HTML | `docs/07-ui-pages.md` | Giúp một người tra cứu và bảo trì |
| [x] Kiểm thử UI desktop/mobile và độ rộng bổ sung | `tests/browser/workflow.spec.ts`, `scripts/check-ui-layout.mjs` | 10 ca tương tác/crawl; bổ sung 320px và 768px |
| [ ] Chủ dự án duyệt giao diện trước khi nối backend | Xem `http://127.0.0.1:3000/pages.html` | Chờ chủ dự án |

Bằng chứng kiểm thử giao diện: `docs/06-verification.md`. Tổng số HTML tính theo `public/ui-manifest.json`: 50 trang, bao gồm các trang công khai/tài khoản/danh mục dùng chung.
