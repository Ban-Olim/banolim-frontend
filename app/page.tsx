"use client";

import Image from "next/image";
import { api } from "../lib/api";

export default function LoginPage() {
  return (
    <main
      className="flex flex-col items-center justify-start pt-0 min-h-screen relative overflow-hidden"
      style={{
        backgroundImage: "url('/nunchikochi_bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* 로고 */}
      <div className="relative w-[900px] h-[700px] mb-[-100px] pointer-events-none">
        <Image
          src="/main_logo.png"
          alt="반올림 로고"
          fill
          className="object-contain"
          priority
        />
      </div>

      {/* 카카오 로그인 버튼 */}
      <div className="relative z-10 w-full max-w-[480px] px-4">
        <button
          onClick={() => api.kakaoLogin()}
          className="w-full h-[55px] bg-white rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-all shadow-sm cursor-pointer"
        >
          <span className="text-sm font-semibold text-gray-500">
            카카오 로그인
          </span>
        </button>
      </div>
    </main>
  );
}
