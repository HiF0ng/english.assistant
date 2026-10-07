# Quyết định và giả định

| ID | Vấn đề | Mặc định đang dùng | Trạng thái và thời điểm chốt |
| --- | --- | --- | --- |
| D01 | Người thực hiện | Một người kiêm nhiệm, AI hỗ trợ viết mã và kiểm tra | Đã xác nhận từ người dùng |
| D02 | Thời gian | 15–20 giờ/tuần | Tạm tính, đang hỏi người dùng |
| D03 | Nền tảng | Next.js + TypeScript, server cùng ứng dụng | Đã dùng cho bản local; có thể điều chỉnh |
| D04 | Phạm vi tổ chức | Một không gian học tập trong MVP | Tạm dùng cho prototype; cần xác nhận trước migration production |
| D05 | Nhà cung cấp | PostgreSQL, Auth chuyên dụng, object storage private | Chưa chọn nhà cung cấp/tài khoản/vùng |
| D06 | Phụ huynh | Liên hệ tùy chọn, không có portal riêng | Đề xuất từ yêu cầu; chốt trước lưu dữ liệu thật |
| D07 | Quyền lớp | Giáo viên sở hữu hoặc được phân công; admin toàn hệ thống | Quyền admin từ Info.docx; cơ chế nhiều giáo viên cần chốt |
| D08 | Số lần làm | Prototype một lần nộp, không nộp muộn | Mặc định thử; cần chốt trước M4 |
| D09 | Thang điểm | Số câu đúng/tổng câu, chưa chuyển band | Chốt bảng quy đổi trước báo cáo IELTS |
| D10 | Công bố | Giáo viên công bố sau khi xem kết quả | Đề xuất; dùng trong prototype |
| D11 | Writing | Chờ prompt của chủ dự án; AI tạo đề xuất | Nguồn đã nói sẽ gửi prompt sau |
| D12 | Speaking | Speech to Text + đánh giá phát âm + đánh giá transcript | PoC chưa chạy; chưa chọn provider/model/locale cuối cùng |
| D13 | Lưu dữ liệu | Không thu dữ liệu thật ở prototype | Cần chốt thời gian lưu audio/bài viết/liên hệ trước tích hợp |
| D14 | Hạn mức | Dự kiến lượt/token/phút audio và ngân sách | Cần chốt con số trước gọi API trả phí |
| D15 | Email | Giáo viên chủ động gửi điểm đã công bố | Chưa có domain gửi và nhà cung cấp |
| D16 | Giao diện | Trắng, xanh biển, responsive | Theo yêu cầu gốc; bản UI đầu cần trải nghiệm thực tế |
| D17 | Trang HTML/CSS | 50 trang tĩnh trong public, template sinh trang và CSS/JS dùng chung | Theo yêu cầu bổ sung 23/09/2026; Next.js giữ vai trò server local, không bỏ mã domain cũ |
| D18 | Login theo vai trò | Giáo viên/Học sinh ở login chung, quản trị có trang login và workspace riêng | Giao diện đã có; xác thực và cấp quyền admin trên server vẫn thuộc M2 |

## Nguyên tắc cập nhật

Giả định chưa được duyệt không được đổi trạng thái thành đã xác nhận. Chỉ đánh dấu hoàn thành hạng mục khi có đầu ra và kiểm tra tương ứng. Hạ tầng trả phí, chuyển dữ liệu thật hoặc phát hành công khai cần thông tin tài khoản và lựa chọn cụ thể từ chủ dự án; bản local không phụ thuộc các điều kiện đó.

## Tài liệu kỹ thuật tham khảo

- Next.js cài đặt và App Router: https://nextjs.org/docs/app/getting-started/installation
- Server Functions và kiểm tra quyền: https://nextjs.org/docs/app/api-reference/directives/use-server
- Tham khảo từ phân tích ban đầu, cần kiểm tra lại khi tích hợp: Azure Pronunciation Assessment https://learn.microsoft.com/en-us/azure/ai-services/speech-service/how-to-pronunciation-assessment
- Tham khảo từ phân tích ban đầu: Azure Speech to Text https://learn.microsoft.com/en-us/azure/ai-services/speech-service/index-speech-to-text

Text to Speech dùng để đọc câu hỏi. Phân tích bài nói cần xử lý audio/transcript; không mặc định một điểm dịch vụ giọng nói là điểm IELTS được kiểm chứng.
