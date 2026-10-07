import Link from "next/link";
export default function Home() {
  return <main className="welcome">
    <div className="brand"><span className="logo">ea</span><span>English Assistant</span></div>
    <div className="welcome-content"><p className="eyebrow">KHÔNG GIAN HỌC TIẾNG ANH</p><h1>Dạy học có tổ chức.<br /><span>Tiến bộ từng ngày.</span></h1>
    <p className="intro">Một nơi để quản lý lớp, giao bài và theo dõi hành trình học tập. Bắt đầu khám phá quy trình bằng dữ liệu mẫu.</p>
    <div className="role-grid">{[
      ["teacher", "01", "Giáo viên", "Tạo lớp, giao bài và công bố kết quả."],
      ["student", "02", "Học sinh", "Xem bài tập, làm bài và nhận phản hồi."],
    ].map(([role, number, title, description]) => <Link className="role-card" href={`/${role}/dashboard`} key={role}><span className="number">{number}</span><h2>{title}</h2><p>{description}</p><span className="text-link">Khám phá bản mẫu →</span></Link>)}</div>
    <p className="demo-note">Bản chạy thử nội bộ · Dữ liệu chỉ lưu trong trình duyệt này · Chưa có đăng nhập hoặc AI thật. Không nhập dữ liệu cá nhân hay khóa API.</p></div>
    <footer>English Assistant <span>Mốc M1 · Nền tảng và trải nghiệm mẫu</span></footer>
  </main>;
}
