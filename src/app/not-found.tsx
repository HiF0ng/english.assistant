import Link from "next/link";
export default function NotFound() {
  return <main className="empty-page"><p className="eyebrow">404</p><h1>Không tìm thấy trang</h1><p>Màn hình này chưa tồn tại trong bản chạy thử.</p><Link className="button" href="/">Về trang bắt đầu</Link></main>;
}
