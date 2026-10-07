# Thiết kế dữ liệu và API dự kiến

Mốc thiết kế M0. Chưa tạo cơ sở dữ liệu thật hoặc triển khai các endpoint trong tài liệu này. Prototype M1 chỉ dùng các kiểu TypeScript và localStorage.

## Kiến trúc

Next.js App Router và TypeScript cho UI cùng API server trong một ứng dụng. PostgreSQL cho dữ liệu quan hệ. Auth dùng thư viện/dịch vụ duy trì chuyên biệt; không tự viết thuật toán lưu mật khẩu. File trên object storage private. Lớp `repository` tách truy vấn dữ liệu khỏi nghiệp vụ. Thêm worker bền vững khi đến AI/email; chưa bắt buộc vận hành Redis ở mốc đầu.

Frontend → phiên đăng nhập → kiểm tra vai trò và quyền đối tượng → nghiệp vụ → repository → PostgreSQL/private storage. Tác vụ dài tạo job có trạng thái và idempotency key, worker ghi kết quả và audit.

Nhà cung cấp DB/Auth còn mở. Có thể dùng managed PostgreSQL + Auth/Storage để giảm việc vận hành cho một người. Chốt dự án/vùng lưu/ngân sách trước khi tạo hạ tầng có chi phí.

## Schema logic

ID là UUID, thời gian `timestamptz`; mọi bảng nghiệp vụ có `created_at`, `updated_at` khi phù hợp.

| Bảng | Trường chính | Quan hệ và ràng buộc |
| --- | --- | --- |
| profiles | user_id, display_name, role, status | FK vào auth.users hoặc users; role student/teacher/admin; không cho client tự nâng role |
| parent_contacts | id, student_id, name, email, notification_consent_at | student_id → profiles; tùy chọn; chỉ gửi khi có điều kiện cho phép |
| classes | id, owner_id, name, description, join_code, password_hash, status | owner → teacher/admin; join_code unique; không trả password_hash về UI |
| class_members | class_id, user_id, member_role, joined_at, status | UNIQUE(class_id,user_id); member_role student/teacher |
| class_sessions | id, class_id, starts_at, ends_at, location, status | ends_at > starts_at; lịch UTC |
| assignments | id, author_id, skill, title, status, current_version_id | author → teacher/admin; skill reading/listening/writing/speaking |
| assignment_versions | id, assignment_id, version, content_json, rubric_version_id | UNIQUE(assignment_id,version); immutable sau khi có bài nộp |
| assignment_targets | id, assignment_id, class_id, opens_at, due_at | Một bài giao nhiều lớp; UNIQUE(assignment_id,class_id); due_at > opens_at |
| questions | id, assignment_version_id, type, prompt, options_json, position, max_score | Nội dung dành học sinh; điểm không âm |
| answer_keys | question_id, accepted_answers_json, comparison_policy | Server-only; tách khỏi payload đề |
| drafts | id, target_id, student_id, answers_json, revision | UNIQUE(target_id,student_id); revision chống ghi đè bản mới |
| submissions | id, target_id, student_id, assignment_version_id, attempt, submitted_at, status | UNIQUE(target_id,student_id,attempt); FK/kiểm tra thành viên; transaction khi nộp |
| submission_answers | submission_id, question_id, answer_json | UNIQUE(submission_id,question_id); câu hỏi thuộc đúng phiên bản |
| media_files | id, owner_id, storage_key, mime_type, byte_size, purpose, status | Storage key riêng tư; signed URL được cấp sau kiểm tra quyền |
| submission_media | submission_id, media_id | Audio/file gắn bài nộp; kiểm tra chủ sở hữu |
| grades | id, submission_id, revision, raw_score, max_score, band, status, reviewer_id, published_at | raw_score ≤ max_score; UNIQUE(submission_id,revision); chỉ công bố sau review |
| grade_details | grade_id, criterion, score, feedback | Điểm/nhận xét mỗi tiêu chí |
| prompt_versions | id, skill, version, template, model_config | Bản dùng để chấm giữ bất biến; chỉ admin chỉnh bản mới |
| rubric_versions | id, skill, version, criteria_json | Liên kết kết quả và phiên bản đề |
| ai_jobs | id, submission_id, model, rubric_id, prompt_id, status, attempts, idempotency_key, error_code | idempotency_key unique; không retry vô hạn |
| ai_assessments | id, job_id, output_json, tokens, audio_seconds, estimated_cost | job_id unique; validate schema; điểm AI riêng với điểm cuối |
| notifications | id, user_id, type, subject_id, read_at | Chỉ chủ sở hữu đọc |
| email_deliveries | id, grade_id, recipient_id, status, provider_id, dedupe_key | dedupe_key unique; chỉ dùng điểm đã công bố |
| usage_limits | id, scope_type, scope_id, metric, period, limit_value | Mức global/role/user; quy tắc override rõ |
| usage_events | id, user_id, job_id, metric, reserved, consumed | Chống ghi trùng; reserve trước gọi nhà cung cấp; release khi lỗi phù hợp |
| audit_logs | id, actor_id, action, entity_type, entity_id, metadata, created_at | Append-only; metadata không chứa khóa hoặc bài làm toàn văn |
| integration_settings | id, provider, secret_ref, model, enabled | Chỉ tham chiếu secret; không lưu plaintext khóa trong DB công khai |

Trước migration: chốt single-tenant/multi-tenant. Nếu multi-tenant, thêm organizations và organization_id vào mọi bảng thuộc tổ chức; FK kép/kiểm tra ngăn liên kết chéo. Không thêm migration production trước quyết định này.

## Hợp đồng API

Tiền tố `/api/v1`. Auth thực tế theo provider đã chọn; API đọc session phía server. Lỗi có `{ error: { code, message, requestId } }`, không trả stack/secret. Phân trang `{ items, nextCursor }`; validate cả query, body và ID. Tất cả dòng dưới là thiết kế, chưa được triển khai.

| Method và đường dẫn | Quyền | Input chính | Output và kiểm tra |
| --- | --- | --- | --- |
| GET /me | Đã đăng nhập | Session | Hồ sơ và quyền; không dùng role từ client |
| PATCH /me | Chủ hồ sơ | display_name, contact | Trường allowlist; role không sửa |
| GET /classes | teacher/student/admin | cursor, status | Chỉ lớp có quyền |
| POST /classes | teacher/admin | name, description, password | 201 lớp + mã; hash mật khẩu |
| PATCH /classes/:id | Chủ lớp/admin | name, status | 200; audit |
| POST /classes/join | student | code, password | Membership; rate limit; không báo lộ dữ liệu lớp riêng tư |
| GET /classes/:id/members | Giáo viên lớp/admin | cursor | Danh sách theo quyền; học sinh không có danh bạ phụ huynh |
| GET /classes/:id/sessions | Thành viên/admin | from, to | Lịch trong khoảng |
| POST /classes/:id/sessions | Giáo viên lớp/admin | startsAt, endsAt, location | Kiểm tra thời gian, tạo nhắc lịch |
| POST /assignments | teacher/admin | skill, title, versionContent | Bài nháp |
| POST /assignments/:id/publish | Chủ bài/admin | classIds, deadline | Snapshot; chủ bài có quyền trên các lớp nhận |
| GET /assignments/:id | Có quyền trên bài | Session | Học sinh nhận câu hỏi, không nhận đáp án |
| GET /tasks | student | classId, status, cursor | Bài được giao cho chính mình |
| PUT /tasks/:targetId/draft | student thành viên | revision, answers | Optimistic concurrency; 409 nếu bản cũ |
| POST /tasks/:targetId/submissions | student thành viên | answers, mediaIds; Idempotency-Key | 201 hoặc kết quả cũ; server kiểm tra hạn và số lần nộp |
| GET /submissions/:id | Chủ bài/giáo viên lớp/admin | ID | Tách payload giáo viên và học sinh |
| POST /submissions/:id/grade | Giáo viên lớp/admin | rubricVersionId | Tạo grading job hoặc chấm đáp án; idempotent |
| PATCH /grades/:id | Giáo viên lớp/admin | scores, feedback, reason | Bản sửa mới, audit và validation điểm |
| POST /grades/:id/publish | Giáo viên lớp/admin | revision | Khóa phiên bản được công bố; cập nhật báo cáo |
| GET /results | student | cursor | Chỉ điểm của mình đã công bố |
| POST /grades/:id/notify | Giáo viên lớp/admin | recipients | Xem lại quyền, consent, phiên bản điểm; dedupe |
| POST /media/upload-intent | Người có quyền nghiệp vụ | type, size, purpose | URL tải lên hạn ngắn, allowlist; xác nhận sau upload |
| GET /media/:id/access | Có quyền file | ID | Signed URL TTL ngắn; không dùng URL công khai |
| GET /admin/users | admin | role, status, cursor | Danh sách tài khoản |
| PATCH /admin/users/:id | admin | status, role | Audit, chống tự khóa admin duy nhất |
| PUT /admin/integrations/:provider | admin | apiKey, model | Write-only secret; output configured/masked |
| PUT /admin/usage-limits/:id | admin | metric, period, limit | Kiểm tra mức không âm; audit |

## Giao dịch và kiểm tra quan trọng

- Nộp bài: kiểm tra membership, thời gian server, version và attempt trong transaction; unique constraint là lớp bảo vệ nộp trùng.
- Chấm job: idempotency gồm submission + rubric + prompt/model version; hai worker không xử lý cùng lease.
- Học sinh không được đọc điểm nháp qua endpoint khác hoặc download dữ liệu toàn lớp.
- Thu hồi membership/khóa tài khoản phải có hiệu lực cả API và cấp URL file.
- Xóa/lưu trữ dữ liệu thực hiện theo chính sách đã chốt, không mặc định xóa cascade bài nộp và audit.

## Kiểm thử trước M2 hoàn thành

Hai giáo viên tạo hai lớp; hai học sinh vào riêng từng lớp. Thử GET/PATCH lớp, bài, file, điểm bằng tài khoản khác và ID đoán được. Kỳ vọng 403/404 phù hợp; admin có quyền được audit. Kiểm thử không đăng nhập, session hết hạn, tài khoản khóa, đáp án bị rò trong JSON, nộp đồng thời và khôi phục DB.
