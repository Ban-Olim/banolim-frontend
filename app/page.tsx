"use client";

import React from 'react';
import Image from 'next/image';
import MenuCard from '../components/MenuCard';

const Cloud = ({ className, style }: { className: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} viewBox="0 0 100 60" fill="white" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="35" r="15" />
    <circle cx="40" cy="25" r="20" />
    <circle cx="65" cy="25" r="22" />
    <circle cx="85" cy="35" r="15" />
    <rect x="20" y="30" width="65" height="20" />
  </svg>
);

export default function Main() {
  return (
    <main className="min-h-screen bg-[#E6F4FF] flex flex-col items-center py-12 px-4 relative overflow-hidden font-sans">

      {/* 배경 요소 */}
      <div className="absolute inset-0 pointer-events-none">
        <Cloud className="absolute top-[5%] w-40 opacity-60 animate-cloud-fly" style={{ animationDuration: '35s', animationDelay: '-2s' }} />
        <Cloud className="absolute top-[15%] w-64 opacity-40 animate-cloud-fly" style={{ animationDuration: '50s', animationDelay: '-15s' }} />
        <Cloud className="absolute top-[8%] right-[10%] w-56 opacity-50 animate-cloud-fly" style={{ animationDuration: '40s', animationDelay: '-7s' }} />
        <Cloud className="absolute top-[35%] w-80 opacity-30 animate-cloud-fly" style={{ animationDuration: '60s', animationDelay: '-25s' }} />

        {/* 하단 그라데이션 */}
        <div className="absolute bottom-0 w-full h-40 bg-gradient-to-t from-green-main/30 to-transparent" />
      </div>

      <div className="z-20 w-full max-w-6xl flex flex-col items-center">

        {/* 로고 */}
        <div className="mb-16 mt-8 relative w-64 h-32 sm:w-80 sm:h-40 animate-float">
          <Image
            src="/logo.jpg"
            alt="반올림 로고"
            fill
            className="object-contain"
            style={{ mixBlendMode: 'multiply' }}
            priority
          />
        </div>

        {/* 메뉴 카드 (디자인 시스템 컬러 적용) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-8 w-full px-4">

          <MenuCard
            title="문장 분해 연습"
            bgColor="bg-green-main"
            borderColor="border-green-dark"
            icon="😊"
            href="/practice"
          />

          <MenuCard
            title="눈치코치"
            bgColor="bg-blue-main"
            borderColor="border-blue-dark"
            icon="😁"
            href="/coach"
          />

          <MenuCard
            title="나만의 단어장"
            bgColor="bg-pink-main"
            borderColor="border-pink-dark"
            icon="😍"
            href="/vocabulary"
          />

          <MenuCard
            title="대시보드"
            bgColor="bg-yellow-main"
            borderColor="border-yellow-dark"
            icon="😎"
            href="/dashboard"
          />

        </div>
      </div>
    </main>
  );
}