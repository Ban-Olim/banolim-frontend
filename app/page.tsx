"use client";

import React from 'react';
import Image from 'next/image';

// 메뉴 카드 데이터
interface NavCard {
  title: string;
  bgColor: string;
  emoji: string;
  link: string;
}

const navCards: NavCard[] = [
  { title: "문장 분해 연습", bgColor: "bg-[#D4F1A1]", emoji: "😊", link: "/practice" },
  { title: "눈치코치", bgColor: "bg-[#B2EBF4]", emoji: "😁", link: "/coach" },
  { title: "나만의 단어장", bgColor: "bg-[#FFC1CC]", emoji: "😍", link: "/vocabulary" },
  { title: "대시보드", bgColor: "bg-[#FFE699]", emoji: "😎", link: "/dashboard" },
];

// 구름 컴포넌트
const Cloud = ({ className, style }: { className: string; style?: React.CSSProperties }) => (
  <svg
    className={className}
    style={style}
    viewBox="0 0 100 60"
    fill="white"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="20" cy="35" r="15" />
    <circle cx="40" cy="25" r="20" />
    <circle cx="65" cy="25" r="22" />
    <circle cx="85" cy="35" r="15" />
    <rect x="20" y="30" width="65" height="20" />
  </svg>
);

export default function Home() {
  return (
    <main className="min-h-screen bg-[#E6F4FF] flex flex-col items-center py-12 px-6 relative overflow-hidden">

      {/* --- 구름 배경 애니메이션 --- */}
      <div className="absolute inset-0 pointer-events-none">
        <Cloud className="absolute top-[5%] w-40 opacity-60 animate-cloud-fly" style={{ animationDuration: '20s', animationDelay: '-2s' }} />
        <Cloud className="absolute top-[15%] w-64 opacity-40 animate-cloud-fly" style={{ animationDuration: '35s', animationDelay: '-15s' }} />
        <Cloud className="absolute top-[8%] right-[10%] w-56 opacity-50 animate-cloud-fly" style={{ animationDuration: '28s', animationDelay: '-7s' }} />
        <Cloud className="absolute top-[35%] w-80 opacity-30 animate-cloud-fly" style={{ animationDuration: '45s', animationDelay: '-25s' }} />
        <Cloud className="absolute top-[45%] w-48 opacity-55 animate-cloud-fly" style={{ animationDuration: '22s', animationDelay: '-10s' }} />
        <Cloud className="absolute top-[55%] left-[20%] w-72 opacity-45 animate-cloud-fly" style={{ animationDuration: '32s', animationDelay: '-18s' }} />
        <Cloud className="absolute top-[70%] w-[350px] opacity-25 animate-cloud-fly" style={{ animationDuration: '55s', animationDelay: '-5s' }} />
        <Cloud className="absolute top-[85%] w-60 opacity-60 animate-cloud-fly" style={{ animationDuration: '26s', animationDelay: '-12s' }} />
        <Cloud className="absolute bottom-[5%] left-[10%] w-96 opacity-40 animate-cloud-fly" style={{ animationDuration: '40s', animationDelay: '-30s' }} />
        <Cloud className="absolute top-[20%] left-[50%] w-52 opacity-35 animate-cloud-fly" style={{ animationDuration: '38s', animationDelay: '-22s' }} />
      </div>

      {/* --- 메인 콘텐츠 --- */}
      <div className="z-20 w-full max-w-7xl flex flex-col items-center">

        {/* 뒤로가기 버튼 */}
        <div className="w-full flex justify-start mb-8">
          <button className="text-gray-500 font-pretandard hover:text-gray-800 transition-colors flex items-center gap-1 font-medium">
            <span className="text-xl">‹</span> 뒤로가기
          </button>
        </div>

        {/* 로고 영역 */}
        <div className="mb-16 mt-4">
          {/* [핵심 수정 사항]
            mixBlendMode: 'multiply' -> 이 속성이 흰색 배경을 투명하게 만듭니다.
            JPG 파일이라도 흰색 부분은 사라지고 로고 색상만 남게 됩니다.
          */}
          <Image
            src="/logo.jpg"
            alt="반올림 로고"
            width={320}
            height={150}
            className="object-contain"
            style={{ mixBlendMode: 'multiply' }}
            priority
          />
        </div>

        {/* 메뉴 카드 그리드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 w-full">
          {navCards.map((card, index) => (
            <div
              key={index}
              onClick={() => window.location.href = card.link}
              className={`${card.bgColor} rounded-[50px] p-10 flex flex-col items-center justify-center shadow-xl transform transition-all hover:scale-105 active:scale-95 cursor-pointer aspect-[3/4.2] border-4 border-white/60`}
            >
              <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center text-6xl shadow-inner mb-10">
                {card.emoji}
              </div>
              <span className="text-2xl font-[900] text-gray-700 break-keep text-center leading-tight">
                {card.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 애니메이션 스타일 */}
      <style jsx global>{`
        @keyframes slide {
          from { transform: translateX(-200%); }
          to { transform: translateX(800%); }
        }
        .animate-cloud-fly {
          animation: slide linear infinite;
          will-change: transform;
        }
      `}</style>
    </main>
  );
}