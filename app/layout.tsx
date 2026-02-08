import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// 변수명이 --font-cafe24 인지 꼭 확인하세요!
const cafe24 = localFont({
  src: "./fonts/Cafe24Ssurround.woff2",
  display: "swap",
  variable: "--font-cafe24", // << 이 이름이 중요합니다
  weight: "700",
});

const pretendard = localFont({
  src: "./fonts/PretendardVariable.woff2",
  display: "swap",
  variable: "--font-pretendard",
  weight: "45 920",
});

export const metadata: Metadata = {
  title: "반올림",
  description: "문장 분해 연습 서비스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${pretendard.variable} ${cafe24.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}