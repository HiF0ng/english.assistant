# Lịch thực hiện cho một người với AI hỗ trợ

Ngày bắt đầu: 23/09/2026. Bản lịch thay thế phương án đội nhiều người trong Word. Ước lượng dưới đây là giờ tập trung của chủ dự án gồm trao đổi yêu cầu, duyệt sản phẩm, kiểm tra và cấu hình. Tốc độ AI viết mã không thay thế thời gian kiểm chứng.

Tạm tính 15–20 giờ/tuần, chờ cập nhật theo thời gian thực tế. Không cam kết ngày phát hành trước khi có tốc độ sau hai mốc. Mỗi tuần chỉ nhận một luồng chính, dành khoảng 20% thời gian cho sửa lỗi và tài liệu. Không làm nhiều luồng tính năng cùng lúc.

## Các mốc

| Mốc | Cửa sổ tuần dự kiến | Giờ dự kiến | Phụ thuộc | Đầu ra và điều kiện kết thúc |
| --- | --- | --- | --- | --- |
| M0 | Tuần 1 | 12–18 | Yêu cầu gốc | PRD, quyền, sitemap, dữ liệu/API, quyết định và checklist; các quyết định quan trọng được chủ dự án xác nhận trước hạ tầng thật |
| M1 | Tuần 2 | 12–20 | M0 bản đầu | Ứng dụng local, UI trắng/xanh, luồng Reading mẫu, test nghiệp vụ và kiểm tra trình duyệt |
| M2 | Tuần 3–5 | 35–50 | Chốt nhà cung cấp, mô hình tổ chức | DB/Auth, đăng ký/đăng nhập/reset, role và quyền đối tượng; kiểm thử truy cập chéo |
| M3 | Tuần 6–7 | 25–35 | M2 | Lớp, membership, mã/mật khẩu, lịch theo giờ Việt Nam |
| M4 | Tuần 8–11 | 45–65 | M3 | Tạo đề Reading/Listening, file riêng tư, autosave, nộp và chấm thật |
| M5 | Tuần 12–15 | 40–60 | M4 | Duyệt điểm, dashboard, admin cơ bản, backup, UAT và pilot MVP |
| M6 | Sau MVP, thêm 6–10 tuần | 80–140 | Prompt, bộ chấm chuẩn, ngân sách, provider keys | PoC rồi tích hợp Writing/Speaking, quota, email và phân tích kỹ năng |

MVP ước lượng 169–248 giờ trước dự phòng. Với 15–20 giờ/tuần, cửa sổ khoảng 11–20 tuần khi cộng dự phòng; bảng 15 tuần là phương án trung tâm để sắp xếp, không phải cam kết. V1 có AI cần cộng thời gian M6 và đánh giá thực tế.

Nếu 5–10 giờ/tuần, giữ nguyên phạm vi từng mốc và giãn lịch; nếu 30–40 giờ/tuần, có thể rút lịch nhưng vẫn giữ thời gian pilot và xác nhận chất lượng. Không quy đổi máy móc số giờ AI sang năng lực cả đội.

## Thực hiện trong phiên đầu

Bổ sung 23/09/2026: theo yêu cầu thiết kế đầy đủ website, đã mở rộng M1 thành bộ 50 trang HTML/CSS (M1.1). Chi tiết tại `docs/07-ui-pages.md`. Các màn hình M2–M6 được thiết kế trước, nhưng thời gian và điều kiện kết thúc phần backend/dịch vụ trong bảng trên không thay đổi vì chưa triển khai chức năng thật.

| Việc | Trạng thái |
| --- | --- |
| Chuyển lịch sang một người | Đã lập bản đầu |
| PRD, dữ liệu/API, quyết định và sitemap | Đã lập bản đầu, còn điểm cần chủ dự án chốt |
| Next.js/TypeScript và ba vai trò mẫu | Đã xây bản mẫu |
| Tạo lớp, giao Reading, nộp, công bố điểm | Đã xây local; bằng chứng kiểm tra tại docs/06-verification.md |
| Kết nối Auth/DB/AI thật | Chưa bắt đầu |

## Nhịp làm việc mỗi phiên

1. Đọc CHECKLIST.md, chọn một mục chưa hoàn thành và tiêu chí nghiệm thu.
2. AI triển khai trong phạm vi đã chọn; cập nhật file liên quan, giữ lại thay đổi của chủ dự án.
3. Chạy test phù hợp và thử một luồng UI. Sửa lỗi trước khi chọn mục mới.
4. Ghi bằng chứng, trạng thái, việc còn thiếu. Chủ dự án duyệt trải nghiệm khi có kết quả xem được.

Không cần chia việc thành vai trò nhân sự giả. Chủ dự án quyết định sản phẩm/ngân sách và duyệt; AI hỗ trợ BA, thiết kế, mã và kiểm thử. Bên ngoài phiên làm việc không mặc định có công việc tự chạy hay lịch hẹn tự động.

## Việc tiếp theo sau bản local

1. Chốt thời gian mỗi tuần; đơn vị sản phẩm là một trung tâm hay nhiều tổ chức.
2. Chọn DB/Auth/Storage theo nguồn lực và tài khoản hiện có, lấy thông tin kết nối qua biến môi trường local.
3. Xây schema migration cùng test quyền. Thay repository demo bằng server, bắt đầu với lớp và Reading.
4. Hoàn thiện email auth/reset trên staging trước khi nhận dữ liệu người dùng thật.
