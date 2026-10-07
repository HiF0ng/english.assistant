import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "English Assistant · Không gian học tập", description: "Quản lý lớp và bài tập tiếng Anh. Bản thử nghiệm quy trình dành cho giáo viên và học sinh.", robots: { index: false, follow: false } };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="vi"><body>{children}</body></html>;
}
