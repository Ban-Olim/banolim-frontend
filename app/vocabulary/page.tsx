"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, GraphWord } from "../../lib/api";


// ── 레이아웃 상수 ────────────────────────────────────────────────────────────
const W = 700;
const H = 400;

const SLOTS: [number, number][] = [
  [W * 0.5, H * 0.5], // 0: center
  [W * 0.5, H * 0.1], // 1: top
  [W * 0.85, H * 0.28], // 2: top-right
  [W * 0.85, H * 0.72], // 3: bottom-right
  [W * 0.5, H * 0.9], // 4: bottom
  [W * 0.15, H * 0.72], // 5: bottom-left
  [W * 0.15, H * 0.28], // 6: top-left
];

// ── 품사별 색상 ──────────────────────────────────────────────────────────────
const POS_COLOR: Record<string, { bg: string; border: string; text: string }> =
  {
    명사: {
      bg: "bg-[#E5F5D8]",
      border: "border-[#b8f08a]",
      text: "text-green-700",
    },
    동사: {
      bg: "bg-[#FFD0D5]",
      border: "border-[#fdaeae]",
      text: "text-red-600",
    },
    형용사: {
      bg: "bg-[#E1FCFF]",
      border: "border-[#93e8f1]",
      text: "text-cyan-700",
    },
    부사: {
      bg: "bg-[#FFF8D6]",
      border: "border-[#f6eaa8]",
      text: "text-yellow-700",
    },
  };

function posColor(pos: string) {
  return (
    POS_COLOR[pos] ?? {
      bg: "bg-gray-100",
      border: "border-gray-300",
      text: "text-gray-600",
    }
  );
}

// ── 빈 상태 ──────────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center py-16">
      <div className="w-20 h-20 rounded-full bg-[#F0FDE4] flex items-center justify-center text-4xl">
        📖
      </div>
      <p className="text-gray-500 font-semibold text-base">
        아직 저장된 단어가 없어요
      </p>
      <p className="text-gray-400 text-sm leading-relaxed">
        단어장에 단어를 추가하면
        <br />
        여기서 한눈에 볼 수 있어요!
      </p>
    </div>
  );
}

// ── 메인 ─────────────────────────────────────────────────────────────────────
export default function VocabularyPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [centerIdx, setCenterIdx] = useState(0);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [view, setView] = useState<"graph" | "list">("graph");

  const { data: apiWords = [], isLoading } = useQuery({
    queryKey: ["graph"],
    queryFn: api.getGraph,
  });

  const words = Array.isArray(apiWords) ? apiWords : [];

  // 단어 수가 줄어들면 인덱스 보정
  useEffect(() => {
    if (words.length > 0 && centerIdx >= words.length) {
      setCenterIdx(words.length - 1);
    }
  }, [words.length, centerIdx]);

  const centerWord: GraphWord | undefined = words[centerIdx];
  const surroundingWords = [
    ...words.slice(0, centerIdx),
    ...words.slice(centerIdx + 1),
  ].slice(0, 6);

  const handleNodeClick = (word: GraphWord) => {
    const idx = words.findIndex((w) => w.senseId === word.senseId);
    if (idx !== -1) setCenterIdx(idx);
  };

  const handleDelete = async (senseId: string) => {
    setDeletingId(senseId);
    try {
      await api.deleteGraphWord(senseId);
      queryClient.setQueryData<GraphWord[]>(["graph"], (prev = []) =>
        prev.filter((w) => w.senseId !== senseId),
      );
    } catch (e) {
      console.error("[deleteGraphWord error]", e);
    } finally {
      setDeletingId(null);
    }
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
        <div className="flex items-center gap-3">
          <h1 className="font-display text-lg font-bold text-gray-700">
            나만의 지식 그래프
          </h1>
          {words.length > 0 && (
            <span className="px-2.5 py-0.5 bg-[#DEFCC2] text-green-700 rounded-full text-xs font-semibold">
              {words.length}개
            </span>
          )}
        </div>
        <button className="flex-shrink-0" onClick={() => router.push("/main")}>
          <Image src="/images/close.png" alt="닫기" width={32} height={32} />
        </button>
      </header>

      {/* 뷰 전환 탭 */}
      <div className="flex justify-center gap-2 mb-2">
        <button
          onClick={() => setView("graph")}
          className={`px-5 py-1.5 rounded-full text-sm font-semibold transition-all ${
            view === "graph"
              ? "bg-white/90 text-gray-800 shadow-sm"
              : "text-white/80 hover:text-white"
          }`}
        >
          그래프
        </button>
        <button
          onClick={() => setView("list")}
          className={`px-5 py-1.5 rounded-full text-sm font-semibold transition-all ${
            view === "list"
              ? "bg-white/90 text-gray-800 shadow-sm"
              : "text-white/80 hover:text-white"
          }`}
        >
          목록
        </button>
      </div>

      {/* 콘텐츠 */}
      <div className="flex-1 mx-3 mb-3 bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm flex flex-col overflow-hidden">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
            불러오는 중...
          </div>
        ) : words.length === 0 ? (
          <EmptyState />
        ) : view === "graph" ? (
          // ── 그래프 뷰 ────────────────────────────────────────────────────
          <div className="flex-1 flex flex-col p-5 gap-4 overflow-hidden">
            {/* 그래프 영역 */}
            <div className="flex-1 flex items-center justify-center min-h-0">
              <div
                className="relative w-full"
                style={{ maxWidth: W, aspectRatio: `${W} / ${H}` }}
              >
                {/* SVG 연결선 */}
                <svg
                  className="absolute inset-0 w-full h-full"
                  viewBox={`0 0 ${W} ${H}`}
                >
                  {surroundingWords.map((word, i) => {
                    const [cx, cy] = SLOTS[0];
                    const [nx, ny] = SLOTS[i + 1];
                    return (
                      <line
                        key={word.senseId}
                        x1={cx}
                        y1={cy}
                        x2={nx}
                        y2={ny}
                        stroke="#D1D5DB"
                        strokeWidth="1.5"
                        strokeDasharray="6 4"
                      />
                    );
                  })}
                </svg>

                {/* 중심 노드 */}
                {centerWord &&
                  (() => {
                    const c = posColor(centerWord.pos);
                    return (
                      <div
                        className={`absolute flex flex-col items-center gap-1 ${c.bg} border-2 ${c.border} rounded-2xl px-5 py-2.5 shadow-md`}
                        style={{
                          left: `${(SLOTS[0][0] / W) * 100}%`,
                          top: `${(SLOTS[0][1] / H) * 100}%`,
                          transform: "translate(-50%, -50%)",
                          zIndex: 10,
                          minWidth: 90,
                        }}
                      >
                        <span
                          className={`text-sm font-bold ${c.text} whitespace-nowrap`}
                        >
                          {centerWord.word}
                        </span>
                        <span className="text-xs text-gray-400">
                          [{centerWord.pos}]
                        </span>
                        <button
                          onClick={() => handleDelete(centerWord.senseId)}
                          disabled={deletingId === centerWord.senseId}
                          className="mt-0.5 text-xs text-red-400 hover:text-red-600 disabled:opacity-40 transition-colors"
                        >
                          {deletingId === centerWord.senseId
                            ? "삭제 중..."
                            : "삭제"}
                        </button>
                      </div>
                    );
                  })()}

                {/* 주변 노드 */}
                {surroundingWords.map((word, i) => {
                  const c = posColor(word.pos);
                  return (
                    <button
                      key={word.senseId}
                      onClick={() => handleNodeClick(word)}
                      className={`absolute flex flex-col items-center gap-0.5 ${c.bg} border-2 ${c.border} rounded-2xl px-4 py-2 shadow-sm hover:scale-105 active:scale-95 transition-transform`}
                      style={{
                        left: `${(SLOTS[i + 1][0] / W) * 100}%`,
                        top: `${(SLOTS[i + 1][1] / H) * 100}%`,
                        transform: "translate(-50%, -50%)",
                        zIndex: 10,
                        minWidth: 72,
                      }}
                    >
                      <span
                        className={`text-xs font-semibold ${c.text} whitespace-nowrap`}
                      >
                        {word.word}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        [{word.pos}]
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 선택된 단어 정의 */}
            {centerWord && (
              <div className="flex-shrink-0 bg-[#F9FFF4] border border-[#D1FAC0] rounded-2xl px-5 py-3">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-bold text-gray-800 text-base">
                    {centerWord.word}
                  </span>
                  <span className="text-xs text-gray-400">
                    [{centerWord.pos}]
                  </span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {centerWord.definition}
                </p>
              </div>
            )}

            {/* 품사 범례 */}
            <div className="flex-shrink-0 flex gap-3 flex-wrap">
              {Object.entries(POS_COLOR).map(([pos, c]) => (
                <div key={pos} className="flex items-center gap-1.5">
                  <div
                    className={`w-3 h-3 rounded-full ${c.bg} border ${c.border}`}
                  />
                  <span className="text-xs text-gray-500">{pos}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          // ── 목록 뷰 ──────────────────────────────────────────────────────
          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3">
            {words.map((word) => {
              const c = posColor(word.pos);
              return (
                <div
                  key={word.senseId}
                  className="flex items-start gap-3 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm"
                >
                  <div
                    className={`flex-shrink-0 px-2.5 py-0.5 rounded-full text-xs font-semibold ${c.bg} ${c.text} border ${c.border}`}
                  >
                    {word.pos}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm">
                      {word.word}
                    </p>
                    <p className="text-xs text-gray-500 leading-relaxed mt-0.5 line-clamp-2">
                      {word.definition}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(word.senseId)}
                    disabled={deletingId === word.senseId}
                    className="flex-shrink-0 w-8 h-8 rounded-full hover:bg-red-50 flex items-center justify-center text-gray-300 hover:text-red-400 transition-colors disabled:opacity-40"
                    aria-label="삭제"
                  >
                    {deletingId === word.senseId ? (
                      <div className="w-3 h-3 border border-gray-300 border-t-gray-500 rounded-full animate-spin" />
                    ) : (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                      >
                        <path
                          d="M1 1l12 12M13 1L1 13"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
