import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from './components/Navbar';  // ← 추가!

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "요가 구인구직",  // ← 타이틀도 변경
  description: "요가 강사 구인구직 플랫폼",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">  {/* ← en → ko */}
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navbar />  {/* ← 추가! */}
        {children}
      </body>
    </html>
  );
}