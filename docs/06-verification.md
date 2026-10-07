# Bằng chứng kiểm tra M1 / bộ giao diện HTML M1.1

Ngày kiểm tra: 23/09/2026. Phạm vi: 50 trang HTML/CSS và tương tác local dùng dữ liệu mẫu, không có người dùng hay dịch vụ AI thật. Bản kiểm chứng mới thay các test của prototype React trước đó.

## Kết quả

| Kiểm tra | Kết quả | Bằng chứng |
| --- | --- | --- |
| Unit tests nghiệp vụ | 5/5 đạt | `node --experimental-strip-types --test tests/*.test.ts` |
| TypeScript | Đạt, không lỗi | `node_modules/.bin/tsc --noEmit` |
| Build production | Đạt | Next.js 16.3.5, React 19.3.0; root rewrite tới HTML homepage, giữ route mẫu cũ |
| Sinh trang | 50 HTML và manifest | `node scripts/build-ui.mjs`; file thực tế và danh mục tài liệu khớp nhau |
| Cú pháp JavaScript | Đạt | `node --check` trên build script, template và site.js |
| Browser E2E desktop | 5/5 đạt | Edge, viewport 1440×1000 |
| Browser E2E mobile | 5/5 đạt | Edge mô phỏng viewport 390×844, không phải Safari/iPhone vật lý |
| Crawl toàn bộ UI | 50/50 trang ở mỗi viewport chính | HTTP 200, một h1 hiển thị, link nội bộ hợp lệ, không pageerror/lỗi tải asset |
| Viewport bổ sung | 100 lượt tải đạt | 50 trang × 320px/768px; HTTP 200, không tràn ngang document; script layout exit 0 |
| Xem ảnh chụp | Đã rà homepage, login, dashboard giáo viên/admin, trình tạo bài, lịch, hồ sơ và Speaking | `.qa/ui-*.png` |

Lượt E2E cuối: **10 passed (3.5m), exit code 0** — 5 nhóm kiểm tra × 2 viewport. Server thử nghiệm bind `127.0.0.1:3000`. Cấu hình không dùng hồ sơ Edge cá nhân; mỗi ca có dữ liệu trình duyệt riêng.

## Nội dung đã kiểm tra

- Chuẩn hóa đáp án theo hoa/thường, khoảng trắng và unicode; không nhận câu trả lời khác nghĩa hoặc rỗng.
- Số câu trả lời phải khớp đề; chặn bài không tồn tại, nộp trùng, sau deadline và thiếu câu trả lời.
- Điểm mới ở trạng thái chờ; công bố lặp lại không tạo thêm điểm.
- Login có đúng hai lựa chọn giáo viên/học sinh, dẫn tới dashboard đúng vai trò; admin có login riêng và không có role radio; kiểm tra hiện/ẩn mật khẩu, không lưu chuỗi mật khẩu vào localStorage/sessionStorage.
- Tạo lớp, reload vẫn còn; tạo Reading, trả lời, reload khôi phục nháp, nộp, giáo viên nhận xét/công bố, học sinh thấy điểm và nhận xét sau reload.
- Trước công bố, giao diện học sinh không hiển thị điểm. Đây là kiểm tra UI mẫu, không phải bảo mật dữ liệu: đáp án và điểm vẫn ở localStorage.
- Dữ liệu JSON hỏng hiển thị lỗi có thể hiểu; đặt lại sau xác nhận khôi phục dữ liệu mẫu; hủy xác nhận giữ dữ liệu cũ.
- Form đăng ký báo mật khẩu xác nhận không khớp; trình tạo đề chuyển theo kỹ năng và xem trước nháp Writing.
- Writing đếm từ và khôi phục nội dung sau reload. Lịch chuyển tháng và quay về tháng hiện tại.
- Tìm lớp cho kết quả rỗng đúng và khôi phục khi đổi từ khóa; lưu checkbox bỏ chọn và checkbox chọn đúng sau reload.
- Hai form cấu hình Writing/Speaking lưu riêng, không ghi đè. Ô API key không cho nhập.
- Thông báo chung chuyển sidebar/liên kết cho giáo viên hoặc học sinh; tham số role=admin không đưa thông tin quản trị vào trang chung. File WAV mẫu được gán blob URL vào audio player cục bộ; không kiểm chứng chất lượng nghe hay upload.
- Route không tồn tại trả HTTP 404. File `403.html` và `404.html` riêng là mẫu thiết kế được phục vụ HTTP 200; chúng không thực thi phân quyền hoặc thay status của server.
- Không tràn ngang **document** trên 50 trang ở 1440px và 390px. Bảng có thể cuộn ngang bên trong panel trên điện thoại. Kiểm tra so sánh scrollWidth với clientWidth, không dùng innerWidth vốn có thể bị nới rộng do overflow trên mobile.

## Giới hạn còn lại

- Có giao diện đăng nhập, nhưng chưa có xác thực, phân quyền backend, DB, người dùng đa tài khoản hoặc dữ liệu production.
- Một học sinh mô phỏng dùng chung toàn bộ lớp; lựa chọn login chỉ chuyển giao diện demo.
- Chưa kiểm tra Safari/Firefox hay thiết bị vật lý; chưa có tải nhiều người dùng.
- Có autosave Reading/Writing cục bộ và phát thử audio từ máy; chưa có autosave server, audio private, Listening chấm thật, lịch thực tế, Writing/Speaking AI và email.
- Lưu trình duyệt không thay thế lưu trữ server; thay đổi đồng thời có thể tranh chấp. Chưa dùng cho thi thật.
- AI PoC, chất lượng chấm theo rubric, chi phí và email delivery đều chưa kiểm chứng.
- Các hạng mục này vẫn chưa đánh dấu xong trong CHECKLIST.md.

## Chạy lại

`pnpm build`, sau đó `pnpm exec playwright test`. Cấu hình sẽ khởi động server khi port 3000 chưa dùng. Nếu đang chạy server production cũ, dừng server trước khi build mới để tránh đọc lẫn asset giữa hai bản. Test không dùng profile Edge cá nhân và dữ liệu được tạo trong context kiểm thử riêng.

Kiểm tra bổ sung viewport 320px/768px: khi server đang chạy, dùng `node scripts/check-ui-layout.mjs`. Script này chỉ kiểm tra HTTP và tràn ngang, không thay thế kiểm thử luồng tương tác.

Khi bàn giao có thể chạy `pnpm start` để giữ bản đã build phục vụ xem thử; `pnpm dev` dùng khi chỉnh sửa mã.


## Lần chỉnh giao diện tiếp theo — 23/09/2026

- Giữ palette xanh/trắng; homepage chuyển sang ví dụ bài học và nhận xét, bỏ mock dashboard nghiêng, vòng trang trí và thẻ nổi. Login và dashboard dùng bố cục gọn hơn.
- Chữ nội dung/menu/form khoảng 16–18px; chữ phụ tối thiểu 14px. Mobile không thu nhỏ chữ để ép nội dung vừa màn hình; thống kê chuyển thành hàng và lịch cuộn trong khung.
- Gỡ thông tin và liên kết admin khỏi 39 trang công khai/giáo viên/học sinh, kể cả footer, login, trợ giúp, danh mục và thông báo. 11 trang admin riêng vẫn tồn tại; thay đổi này không tạo phân quyền backend.
- Thêm regression trong crawl Playwright: 39 trang không có chữ admin/quản trị hoặc liên kết admin, không có text node hiển thị dưới 14px ở desktop/mobile.
- Unit tests 5/5, TypeScript và production build đạt. E2E desktop/mobile: 10/10 đạt (3.4 phút), exit code 0; luồng tạo lớp → giao Reading → lưu nháp → nộp → nhận xét → công bố → xem kết quả vẫn hoạt động.
- Kiểm tra 50 trang tại 320px/768px: không tràn ngang document. Kiểm tra thêm homepage, login, dashboard giáo viên/học sinh và lịch ở 375px/844px với reduced motion: không tràn ngang document.
- Đã xem ảnh desktop/mobile homepage, dashboard giáo viên; desktop login và dashboard học sinh. Ảnh tại `.qa/redesign-*.png`. Kiểm tra chỉ trên trình duyệt local với dữ liệu mẫu, chưa triển khai production.


## Hero màn hình ứng dụng và bố cục thẻ — 23/09/2026

- Theo phản hồi tiếp theo, thay homepage phẳng bằng màn hình ứng dụng có thẻ nổi, nền chuyển sắc nhẹ, bố cục thẻ lớn/nhỏ và minh họa tiến độ, lịch, phản hồi. Giữ palette xanh cùng các màu kỹ năng có sẵn, chữ phụ từ 14px và nội dung dành cho giáo viên/học sinh.
- Hero có bốn nút xem trước: Lớp học, Bài tập, Lịch học, Kết quả. Mỗi lần chỉ hiện một panel; hoạt động bằng bàn phím và không thay đổi dữ liệu học tập. Các số liệu được ghi rõ là minh họa.
- Dashboard và login dùng thẻ bo góc, bóng nhẹ và các khối màu đồng bộ. Không thay đổi nghiệp vụ, lưu trữ hoặc đăng nhập mẫu.
- Đã xem ảnh desktop 1440px, mobile 390px và kiểm tra layout 320px. Snapshot tắt animation để chụp trạng thái hoàn chỉnh. CSS tôn trọng prefers-reduced-motion.
- Đã kiểm tra trực tiếp tab preview trong Codex: chuyển Kết quả hiển thị phản hồi tương ứng. Server local đã được khởi động lại để nhận hai asset mới home.css/home.js; các asset có cache version mới.
- Kết quả cuối: Playwright 10/10 đạt (3.5 phút), exit code 0; bao gồm chuyển tính năng hero bằng bàn phím, luồng Reading, kiểm tra chữ tối thiểu và không có nội dung admin trên trang chung. Crawl 50 trang ở 320px/768px không tràn ngang document, exit code 0. TypeScript và production build đạt. Chưa triển khai production.
