import type { Metadata } from "next";
import localFont from "next/font/local";
import { Providers } from "../lib/providers";
import "./globals.css";

const pretendard = localFont({
  src: "../public/fonts/PretendardVariable.woff2",
  variable: "--font-pretendard",
  display: "swap",
});

const cafe24 = localFont({
  src: "../public/fonts/Cafe24Ssurround.woff2",
  variable: "--font-cafe24",
  display: "swap",
});

export const metadata: Metadata = {
  title: "#BanOlim",
  description: "",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${pretendard.variable} ${cafe24.variable}`}>
      <body className="font-sans antialiased text-gray-900">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}