# Danh sách màn hình

**Cập nhật giao diện 23/09/2026:** bộ 50 trang HTML đã được tạo theo yêu cầu bổ sung, bao gồm login giáo viên/học sinh và admin riêng. Danh sách file/URL thực tế ở [07-ui-pages.md](07-ui-pages.md), có thể duyệt từ `public/pages.html`. Login hiện chỉ chuyển sang bản mẫu; API key bị vô hiệu hóa đến khi có backend.

Bảng dưới giữ lại quy ước đường dẫn và mốc chức năng ban đầu cho backend. Nhãn M2–M6 không còn có nghĩa là chưa có giao diện; chúng chỉ là mốc triển khai chức năng thật. Khi dùng bộ giao diện hiện tại, mở đường dẫn `.html` trong danh mục mới.

| Khu vực | Đường dẫn | Nội dung | Trạng thái |
| --- | --- | --- | --- |
| Chung | / | Giới thiệu, chọn vai trò mẫu | Đã có prototype |
| Chung | /login | Đăng nhập | M2 |
| Chung | /signup/teacher, /signup/student | Đăng ký theo vai trò | M2 |
| Chung | /forgot-password, /reset-password | Khôi phục tài khoản | M2 |
| Chung | /settings | Hồ sơ, mật khẩu, thông báo | M2–M5 |
| Chung | /notifications | Thông báo | M5–M6 |
| Chung | 404 | Đường dẫn không tồn tại | Đã có |
| Giáo viên | /teacher/dashboard | Số lớp, bài, chờ công bố | Đã có prototype |
| Giáo viên | /teacher/classes | Danh sách và tạo lớp | Đã có prototype |
| Giáo viên | /teacher/classes/:id | Thành viên, bài, lịch, tiến độ | M3 |
| Giáo viên | /teacher/assignments | Danh sách và tạo bài Reading mẫu | Đã có prototype |
| Giáo viên | /teacher/assignments/new | Trình tạo bốn kỹ năng | M4–M6 |
| Giáo viên | /teacher/assignments/:id/preview | Xem trước và kiểm tra đề | M4 |
| Giáo viên | /teacher/submissions | Danh sách và công bố điểm mẫu | Đã có prototype |
| Giáo viên | /teacher/submissions/:id | Duyệt chi tiết, sửa điểm, phiên bản | M5 |
| Giáo viên | /teacher/students, /teacher/students/:id | Học sinh và kỹ năng | M3–M6 |
| Giáo viên | /teacher/calendar | Lịch tuần/tháng | M3 |
| Giáo viên | Gửi kết quả trong trang duyệt | Chọn người nhận, xem trước email | M6 |
| Học sinh | /student/dashboard | Bài chưa nộp, đã nộp, kết quả | Đã có prototype |
| Học sinh | /student/classes/join | Mã và mật khẩu | M3 |
| Học sinh | /student/classes, /student/classes/:id | Lớp, lịch và bài | M3 |
| Học sinh | /student/assignments | Danh sách và làm bài Reading mẫu | Đã có prototype |
| Học sinh | /student/tasks/:id, /student/tasks/:id/attempt | Chi tiết và làm bài đầy đủ | M4 |
| Học sinh | /student/submissions | Lịch sử bài nộp | M4–M5 |
| Học sinh | /student/results | Điểm công bố và trạng thái chờ | Đã có prototype |
| Học sinh | /student/results/:id | Phản hồi chi tiết | M5–M6 |
| Học sinh | /student/calendar, /student/profile | Lịch, thông tin, kỹ năng | M3–M6 |
| Admin | /admin/dashboard | Số liệu demo | Đã có prototype |
| Admin | /admin/roadmap | Các mốc triển khai | Đã có prototype |
| Admin | /admin/users, /admin/users/:id | Tài khoản | M2–M5 |
| Admin | /admin/classes, /admin/classes/:id, /admin/classes/new | Tất cả lớp và tạo lớp | M3–M5 |
| Admin | /admin/integrations/ai | Cấu hình nhà cung cấp và secret write-only | M6 |
| Admin | /admin/usage-limits | Hạn mức | M6 |
| Admin | /admin/audit-logs | Nhật ký | M5–M6 |

## Bố cục chung

Desktop dùng thanh điều hướng bên trái, vai trò ở header, nội dung chính có số liệu và danh sách tác vụ. Mobile dùng nút mở sidebar và xếp các panel theo chiều dọc. Form có nhãn, lỗi hiển thị, trạng thái đã lưu. Màn hình trống hướng dẫn bước kế tiếp. Các workspace có nhãn dữ liệu mẫu, trang tài khoản giải thích rõ chưa có xác thực.
