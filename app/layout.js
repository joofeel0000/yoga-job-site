import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BetaBanner from './components/BetaBanner';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "요가잡 | 요가 강사·스튜디오 채용 플랫폼",
  description: "요가 강사와 스튜디오를 연결하는 채용 플랫폼",
  icons: {
    icon: [
      { url: '/logo/favicon.ico' },
      { url: '/logo/icon-32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: { url: '/logo/icon-180.png', sizes: '180x180', type: 'image/png' },
  },
  openGraph: {
    title: "요가잡 | 요가 강사·스튜디오 채용 플랫폼",
    description: "요가 강사와 스튜디오를 연결하는 채용 플랫폼",
    images: [{ url: '/logo/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: "요가잡 | 요가 강사·스튜디오 채용 플랫폼",
    description: "요가 강사와 스튜디오를 연결하는 채용 플랫폼",
    images: ['/logo/og-image.png'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <BetaBanner />
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}