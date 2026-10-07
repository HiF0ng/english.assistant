# Đặc tả sản phẩm English Assistant

Phiên bản 0.1 · 23/09/2026 · Chủ sản phẩm, người duyệt và vận hành: chủ dự án. AI hỗ trợ thiết kế, viết mã, kiểm thử và ghi chép. Đây là đặc tả đề xuất để triển khai, các quyết định mở được ghi trong `04-decisions.md`.

## Mục tiêu

Giáo viên tạo lớp, giao bài theo kỹ năng IELTS, theo dõi tiến độ và công bố điểm. Học sinh biết cần làm gì, làm và nộp bài, xem phản hồi. Quản trị viên quản lý người dùng, lớp, dịch vụ AI và hạn mức.

Yêu cầu gốc nằm trong `Info.docx`. Nội dung bổ sung về autosave, duyệt điểm, bảo mật, hàng đợi và kiểm thử là đề xuất triển khai, không phải những quyết định đã được chủ dự án xác nhận trước đó.

## Phạm vi theo phiên bản

| Phiên bản | Chức năng | Điều kiện kết thúc |
| --- | --- | --- |
| Prototype M1 | Vai trò mẫu, tạo lớp/bài Reading, làm/nộp, công bố điểm | Luồng chạy được trên trình duyệt với dữ liệu mẫu |
| MVP M2–M5 | Tài khoản, quyền backend, lớp/mã/mật khẩu, lịch, Reading/Listening, lưu bài, điểm, dashboard, admin cơ bản | Kiểm thử quyền, dữ liệu, khôi phục và pilot đạt |
| V1 M6 | Writing/Speaking AI, email, phân tích kỹ năng, hạn mức đầy đủ | PoC và bộ bài chuẩn đạt tiêu chí đã duyệt |
| Sau V1 | Tài khoản phụ huynh, thanh toán, nhiều tổ chức, thi thử đầy đủ, ứng dụng di động | Có nhu cầu và quyết định riêng |

Luồng nộp Writing/Speaking thủ công có thể bổ sung vào MVP sau khi định dạng và chính sách file được chốt; chưa tự động tính là đã triển khai khi chỉ có giao diện.

## Người dùng và dữ liệu

| Vai trò | Được xem | Được thay đổi |
| --- | --- | --- |
| Giáo viên | Lớp được phân công, học sinh thuộc lớp, bài nộp của lớp | Lớp, bài giao, điểm và nhận xét trong phạm vi đó |
| Học sinh | Hồ sơ mình, lớp đang tham gia, bài giao, điểm đã công bố | Hồ sơ cho phép chỉnh, câu trả lời, bài nộp của mình |
| Admin | Toàn hệ thống theo yêu cầu gốc | Người dùng, lớp, cấu hình, hạn mức; hành động nhạy cảm có audit |
| Phụ huynh | Chỉ nội dung thông báo được phép gửi | Chưa có tài khoản trong phương án ban đầu |

Tên và thông tin liên hệ học sinh, liên hệ phụ huynh tùy chọn. Không giả định ai cũng có phụ huynh hoặc cần gửi email phụ huynh. Chưa thu thập dữ liệu thật khi chính sách lưu trữ chưa chốt.

## User stories và nghiệm thu

| ID | Mong muốn | Tiêu chí nghiệm thu |
| --- | --- | --- |
| AUTH01 | Đăng ký giáo viên/học sinh | Xác minh email; không tự cấp quyền admin qua dữ liệu client |
| AUTH02 | Đăng nhập và lấy lại mật khẩu | Phiên có hạn; logout mất quyền; token reset dùng một lần và hết hạn |
| CLASS01 | Giáo viên tạo lớp | Chỉ chủ lớp/admin sửa được; có mã duy nhất và mật khẩu đã hash |
| CLASS02 | Học sinh tham gia lớp | Mã/mật khẩu đúng; lớp mở; không trùng thành viên; giới hạn thử sai |
| CAL01 | Tạo lịch và nhắc giờ | Lưu UTC, hiển thị giờ Việt Nam; sửa/hủy buổi cập nhật thông báo |
| TASK01 | Tạo bài nháp và giao | Chọn lớp, kỹ năng, hướng dẫn, nội dung, đáp án/rubric và deadline; xem trước được |
| TASK02 | Reading/Listening | Loại câu hỏi được hỗ trợ có quy tắc chấm rõ; audio private; không gửi đáp án qua API trước khi được phép |
| SUB01 | Học sinh làm bài | Lưu nháp, trạng thái lưu rõ, tải lại không mất bản đã lưu |
| SUB02 | Nộp bài | Deadline do server kiểm tra; chống nộp trùng; lưu ảnh chụp phiên bản đề và thời gian server |
| GRADE01 | Chấm đáp án | Chuẩn hóa hoa/thường, khoảng trắng, unicode; danh sách đáp án tương đương do giáo viên nhập |
| GRADE02 | Duyệt/công bố | Điểm nháp khác điểm công bố; sửa có lý do/audit; học sinh không lấy được điểm chưa công bố từ API |
| AI01 | Writing theo prompt | Phiên bản prompt/rubric/model, schema kết quả, lỗi có thể retry, không tự công bố |
| AI02 | Speaking | Ghi âm phát lại được; transcript và chỉ số phát âm; giáo viên kiểm tra chất lượng; không lấy điểm phát âm thay band IELTS trực tiếp |
| NOTIFY01 | Gửi email điểm | Xem trước; chỉ gửi điểm đã công bố; phụ huynh có chọn; chống gửi trùng; log trạng thái |
| ADMIN01 | Quản lý người dùng | Khóa/mở đúng quyền; không đọc mật khẩu; hành động có audit |
| ADMIN02 | Cấu hình AI/hạn mức | Khóa phía server, chỉ trả trạng thái đã cấu hình; quota nguyên tử; lỗi không thu phí trùng |
| REPORT01 | Xem tiến bộ | Điểm đã công bố; tách thang điểm; thời gian/kỹ năng/số bài rõ; biểu đồ có bảng số liệu |

## Quy tắc tạm dùng để phát triển

- Một không gian học tập cho MVP. Khả năng nhiều tổ chức cần chốt trước migration production.
- Reading/Listening theo đáp án có cấu trúc; upload Word/PDF hiện chỉ dự kiến làm file đính kèm, không tự hứa trích xuất/OCR toàn bộ đề.
- Prototype một học sinh mẫu chung, một lần nộp, không nộp muộn. Đây là giới hạn demo; không dùng làm mô hình nhiều học sinh thật.
- Chấm ra số câu đúng và tổng câu. Bảng đổi band riêng theo loại bài thi sẽ được chủ dự án duyệt trước khi sử dụng.
- Giáo viên công bố điểm. Writing/Speaking AI chỉ tạo bản đề xuất; chưa có prompt Writing từ chủ dự án.
- Sau khi giao bài, thay đổi đề tạo phiên bản mới; bài đã nộp giữ phiên bản cũ. Sửa deadline có nhật ký, không làm mất bài.
- Bài làm và file riêng tư; đáp án không nằm trong payload học sinh. Mọi kiểm tra quyền ở server.

## Trạng thái nghiệp vụ dự kiến

| Đối tượng | Trạng thái | Chuyển đổi |
| --- | --- | --- |
| Lớp | active, archived | Giáo viên/admin lưu trữ; dữ liệu cũ vẫn đọc theo quyền |
| Bài giao | draft, published, closed | Cần đủ nội dung/đáp án trước published; không xóa cứng bài có bài nộp |
| Bài làm | draft, submitted | Học sinh nộp một lần theo chính sách; timestamp phía server |
| Chấm | queued, processing, reviewed, failed | Worker retry có giới hạn; lỗi chuyển người xử lý |
| Điểm | draft, published | Giáo viên duyệt; công bố lại tạo phiên bản, giữ lịch sử |
| Email | queued, sent, failed | Không đồng nhất sent với delivered; lưu callback nhà cung cấp nếu có |

## Yêu cầu chất lượng

Thử các luồng quan trọng ở desktop và mobile. Kiểm tra bằng bàn phím, nhãn input và trạng thái lỗi. Kiểm thử truy cập chéo với ít nhất hai giáo viên và hai học sinh. Giới hạn file, lưu trữ riêng tư, backup và khôi phục trước pilot. Tải thử quy mô lớp pilot thực tế sau khi chủ dự án cho biết số học sinh. Không coi build thành công là xác nhận email tới hộp thư, AI chấm đúng hoặc quyền production đã an toàn.

## Điều kiện trước khi tích hợp AI

Có prompt/rubric Writing; 20–30 bài mẫu có điểm giáo viên; một bộ ghi âm nhiều điều kiện; ngân sách thử giới hạn; chính sách gửi dữ liệu cho nhà cung cấp. Ngưỡng sai lệch điểm chấp nhận được do chủ dự án duyệt, ghi thành số trước thử nghiệm. AI PoC hiện chưa chạy.
