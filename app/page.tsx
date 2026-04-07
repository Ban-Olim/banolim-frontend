"use client";

import { api } from "../lib/api";

export default function LoginPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-[#D9D9D9]">
      {/* 로고 */}
      <h1 className="font-pretendard text-[80px] font-medium text-[#FFFFFF] mb-24 ">
        #반올림
      </h1>

      {/* 카카오 로그인 버튼 */}
      <div className="w-full max-w-[490px] px-4">
        <button
          onClick={() => api.kakaoLogin()}
          className="w-full h-[45px] bg-white rounded-full
                   border-1 border-gray-300 flex items-center justify-center
                   hover:bg-gray-50 transition-all shadow-sm"
        >
          <span className="text-b-16sb text-gray-500">카카오 로그인</span>
        </button>
      </div>
    </main>
  );
}
