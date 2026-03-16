"use client";

import React from "react";
import Image from "next/image";
import MenuCard from "../../components/MenuCard";

export default function Main() {
  return (
    <main className="min-h-screen bg-[#E6F4FF] flex flex-col items-center py-12 px-4 relative overflow-hidden font-sans">
      {/* 배경 이미지 레이어 */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image
          src="/background.jpg"
          alt="배경 이미지"
          fill
          priority
          className=" object-cover opacity-100" // opacity로 배경의 밝기를 조절하세요 (0~100)
        />
        {/* 하단 그라데이션 (선택 사항: 하단을 부드럽게 처리하고 싶을 때 유지) */}
        <div className="absolute bottom-0 w-full h-40 bg-gradient-to-t from-[#E6F4FF] to-transparent" />
      </div>

      <div className="z-20 w-full max-w-6xl flex flex-col items-center">
        {/* 로고 */}
        <div className="mb-16 mt-8 relative w-64 h-32 sm:w-80 sm:h-40 animate-float">
          <Image
            src="/logo.jpg"
            alt="반올림 로고"
            fill
            className="object-contain"
            style={{ mixBlendMode: "multiply" }}
            priority
          />
        </div>

        {/* 메뉴 카드 그리드 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-8 w-full px-4">
          <MenuCard
            title="문장 분해 연습"
            bgColor="bg-green-main"
            borderColor="border-green-dark"
            icon={
              <Image
                src="/imoge1.png" // 다운로드한 이미지 경로
                alt="연습 아이콘"
                width={100}
                height={80}
                className="object-contain"
              />
            }
            href="/practice"
          />

          <MenuCard
            title="눈치코치"
            bgColor="bg-blue-main"
            borderColor="border-blue-dark"
            icon={
              <Image
                src="/imoge2.png" // 다운로드한 이미지 경로
                alt="연습 아이콘"
                width={120}
                height={80}
                className="object-contain"
              />
            }
            href="/coach"
          />

          <MenuCard
            title="나만의 단어장"
            bgColor="bg-[#FFD1D9]"
            borderColor="border-pink-dark"
            icon={
              <Image
                src="/imoge3.png" // 다운로드한 이미지 경로
                alt="연습 아이콘"
                width={120}
                height={80}
                className="object-contain"
              />
            }
            href="/vocabulary"
          />

          <MenuCard
            title="대시보드"
            bgColor="bg-yellow-main"
            borderColor="border-yellow-dark"
            icon={
              <Image
                src="/imoge4.png" // 다운로드한 이미지 경로
                alt="연습 아이콘"
                width={120}
                height={80}
                className="object-contain"
              />
            }
            href="/dashboard"
          />
        </div>
      </div>
    </main>
  );
}