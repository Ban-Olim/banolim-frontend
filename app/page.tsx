"use client";

import Image from "next/image";
import { api } from "../lib/api";

export default function LoginPage() {
  return (
    <main
      className="flex flex-col items-center justify-start pt-0 min-h-screen relative overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, #c8e6f5 0%, #dff0f8 60%, #eef7fb 100%)",
      }}
    >
      {/* 구름 - 이미지가 없어 CSS로 구현 */}
      <div className="absolute top-[8%] left-[5%] w-40 h-16 bg-white/80 rounded-full blur-xl" />
      <div className="absolute top-[6%] left-[10%] w-24 h-10 bg-white/60 rounded-full blur-lg" />
      <div className="absolute top-[12%] right-[8%] w-52 h-16 bg-white/70 rounded-full blur-xl" />
      <div className="absolute top-[10%] right-[14%] w-32 h-10 bg-white/50 rounded-full blur-lg" />
      <div className="absolute bottom-[18%] left-[3%] w-36 h-12 bg-white/60 rounded-full blur-xl" />
      <div className="absolute bottom-[22%] right-[5%] w-44 h-14 bg-white/70 rounded-full blur-xl" />

      {/* 로고 */}
      <div className="relative w-[900px] h-[700px] mb-[-100px]">
        <Image
          src="/main_logo.png"
          alt="반올림 로고"
          fill
          className="object-contain"
          priority
        />
      </div>

      {/* 카카오 로그인 버튼 */}
      <div className="w-full max-w-[480px] px-4">
        <button
          onClick={() => api.kakaoLogin()}
          className="w-full h-[55px] bg-white rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-all shadow-sm"
        >
          <span className="text-sm font-semibold text-gray-500">
            카카오 로그인
          </span>
        </button>
      </div>
    </main>
  );
}
