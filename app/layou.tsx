import type { Metadata } from "next";
import localFont from "next/font/local"; // google 폰트 대신 localFont 사용
import "./globals.css";

// 1. 본문용 폰트 (Pretendard Variable)
const pretendard = localFont({
    src: "./fonts/PretendardVariable.woff2", // app/fonts 폴더 기준 경로
    display: "swap",
    variable: "--font-pretendard",
    weight: "45 920", // Variable 폰트의 웨이트 범위
});

// 2. 제목용 폰트 (Cafe24 Ssurround)
const cafe24 = localFont({
    src: "./fonts/Cafe24Ssurround.woff2",
    display: "swap",
    variable: "--font-cafe24",
    weight: "700", // 보통 Bold로 사용
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