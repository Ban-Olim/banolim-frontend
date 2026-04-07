"use client";

import { useState } from "react";
import Image from "next/image";

interface WordNode {
  category: "emotion" | "situation" | "reaction";
  connections: string[];
}

const WORD_MAP: Record<string, WordNode> = {
  힘들다: {
    category: "emotion",
    connections: ["피곤하다", "슬프다", "시험", "숙제", "위로하기", "공감하기"],
  },
  피곤하다: {
    category: "emotion",
    connections: ["지치다", "힘들다", "눈물", "졸리다", "쉬고싶다", "몸살"],
  },
  슬프다: {
    category: "emotion",
    connections: ["눈물", "외롭다", "힘들다", "그립다", "울다", "우울하다"],
  },
  시험: {
    category: "situation",
    connections: ["긴장", "공부", "힘들다", "걱정", "숙제", "점수"],
  },
  숙제: {
    category: "situation",
    connections: ["공부", "힘들다", "마감", "시험", "집중", "귀찮다"],
  },
  위로하기: {
    category: "reaction",
    connections: ["공감하기", "힘들다", "응원해", "괜찮아", "들어줘", "함께해"],
  },
  공감하기: {
    category: "reaction",
    connections: ["위로하기", "이해해", "힘들다", "들어줘", "마음", "같이있어"],
  },
  지치다: {
    category: "emotion",
    connections: ["피곤하다", "힘들다", "쉬고싶다", "무기력", "눈물", "포기"],
  },
  눈물: {
    category: "emotion",
    connections: ["슬프다", "피곤하다", "힘들다", "외롭다", "울다", "그립다"],
  },
  외롭다: {
    category: "emotion",
    connections: ["슬프다", "힘들다", "혼자", "친구", "그립다", "보고싶다"],
  },
  긴장: {
    category: "emotion",
    connections: ["시험", "힘들다", "걱정", "두렵다", "공부", "떨려"],
  },
  공부: {
    category: "situation",
    connections: ["시험", "숙제", "힘들다", "집중", "피곤하다", "도서관"],
  },
  괜찮아: {
    category: "reaction",
    connections: [
      "위로하기",
      "응원해",
      "힘들다",
      "함께해",
      "들어줘",
      "공감하기",
    ],
  },
  응원해: {
    category: "reaction",
    connections: ["위로하기", "괜찮아", "힘내", "공감하기", "함께해", "도와줘"],
  },
  걱정: {
    category: "emotion",
    connections: ["긴장", "시험", "힘들다", "불안", "두렵다", "떨려"],
  },
  마감: {
    category: "situation",
    connections: ["숙제", "공부", "힘들다", "시간", "집중", "귀찮다"],
  },
};

const CATEGORY_STYLES: Record<string, string> = {
  center: "bg-[#FFD0D5] border-[#fdaeae] text-gray-700",
  emotion: "bg-[#D6F5FF] border-[#93e8f1] text-gray-700",
  situation: "bg-[#DEFCC2] border-[#caf4a6] text-gray-700",
  reaction: "bg-[#FEF8D0] border-[#f6eaa8] text-gray-700",
};

// Canvas virtual size
const W = 640;
const H = 340;

// Position slots [x, y] — index 0 = center, 1-6 = surrounding
const SLOTS: [number, number][] = [
  [W * 0.5, H * 0.5], // center
  [W * 0.25, H * 0.17], // top-left
  [W * 0.75, H * 0.17], // top-right
  [W * 0.05, H * 0.5], // left
  [W * 0.95, H * 0.5], // right
  [W * 0.25, H * 0.83], // bottom-left
  [W * 0.75, H * 0.83], // bottom-right
];

export default function VocabularyPage() {
  const [centerWord, setCenterWord] = useState("힘들다");

  const centerData = WORD_MAP[centerWord];
  const visible = (centerData?.connections ?? []).slice(0, 6);

  const getCategoryStyle = (word: string) => {
    const data = WORD_MAP[word];
    if (!data) return CATEGORY_STYLES.emotion;
    return CATEGORY_STYLES[data.category];
  };

  return (
    <main
      className="min-h-screen flex flex-col overflow-hidden"
      style={{
        backgroundImage: "url('/vocabulary_bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* 헤더 */}
      <header className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md m-3 rounded-3xl shadow-sm">
        <div className="w-24 h-9 bg-[#DEFCC2] rounded-full flex items-center justify-center text-green-700 text-sm font-semibold">
          로고
        </div>
        <h1 className="font-display text-lg font-bold text-gray-700">
          나만의 단어장 (지식 그래프)
        </h1>
        <button className="flex-shrink-0">
          <Image src="/images/close.png" alt="닫기" width={32} height={32} />
        </button>
      </header>

      {/* 그래프 컨테이너 */}
      <div className="flex-1 mx-3 mb-3">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-sm h-full flex flex-col">
          <p className="text-sm text-gray-700 mb-5">
            단어와 관련된 개념을 연결해서 배워요
          </p>

          {/* 그래프 영역 */}
          <div className="flex-1 flex items-center justify-center">
            <div
              className="relative w-full"
              style={{ maxWidth: W, aspectRatio: `${W} / ${H}` }}
            >
              {/* SVG 점선 */}
              <svg
                className="absolute inset-0 w-full h-full"
                viewBox={`0 0 ${W} ${H}`}
              >
                {visible.map((word, i) => {
                  const [cx, cy] = SLOTS[0];
                  const [nx, ny] = SLOTS[i + 1];
                  return (
                    <line
                      key={word}
                      x1={cx}
                      y1={cy}
                      x2={nx}
                      y2={ny}
                      stroke="#CCCCCC"
                      strokeWidth="1.5"
                      strokeDasharray="8 5"
                    />
                  );
                })}
              </svg>

              {/* 중심 노드 */}
              <div
                className={`absolute px-10 py-3 rounded-full border-2 text-sm font-semibold select-none shadow-sm ${CATEGORY_STYLES.center}`}
                style={{
                  left: `${(SLOTS[0][0] / W) * 100}%`,
                  top: `${(SLOTS[0][1] / H) * 100}%`,
                  transform: "translate(-50%, -50%)",
                  whiteSpace: "nowrap",
                  zIndex: 10,
                }}
              >
                {centerWord}
              </div>

              {/* 주변 노드 */}
              {visible.map((word, i) => (
                <button
                  key={word}
                  onClick={() => WORD_MAP[word] && setCenterWord(word)}
                  className={`absolute px-10 py-3 rounded-full border-2 text-sm font-medium shadow-sm transition-all hover:scale-105 active:scale-95 ${getCategoryStyle(word)} ${!WORD_MAP[word] ? "opacity-60 cursor-default" : "cursor-pointer"}`}
                  style={{
                    left: `${(SLOTS[i + 1][0] / W) * 100}%`,
                    top: `${(SLOTS[i + 1][1] / H) * 100}%`,
                    transform: "translate(-50%, -50%)",
                    whiteSpace: "nowrap",
                    zIndex: 10,
                  }}
                >
                  {word}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
