"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, GraphWord, GraphLink } from "../../lib/api";

const W = 700;
const H = 420;
const CX = W / 2;
const CY = H / 2;

const POS_COLOR: Record<string, { bg: string; border: string; text: string }> = {
  명사:   { bg: "bg-[#E5F5D8]", border: "border-[#b8f08a]", text: "text-green-700"  },
  동사:   { bg: "bg-[#FFD0D5]", border: "border-[#fdaeae]", text: "text-red-600"    },
  형용사: { bg: "bg-[#E1FCFF]", border: "border-[#93e8f1]", text: "text-cyan-700"   },
  부사:   { bg: "bg-[#FFF8D6]", border: "border-[#f6eaa8]", text: "text-yellow-700" },
};

const LINK_COLOR: Record<string, string> = {
  SYNONYM_OF:  "#86efac",
  HYPERNYM_OF: "#93c5fd",
  HYPONYM_OF:  "#fca5a5",
  ANTONYM_OF:  "#fcd34d",
};

const LINK_LABEL: Record<string, string> = {
  HYPERNYM_OF: "상위어",
  HYPONYM_OF:  "하위어",
  SYNONYM_OF:  "유의어",
  ANTONYM_OF:  "반의어",
};

function posColor(pos: string) {
  return POS_COLOR[pos] ?? { bg: "bg-gray-100", border: "border-gray-300", text: "text-gray-600" };
}

// 모든 노드를 원형으로 배치 (선택 노드는 중심)
function computePositions(words: GraphWord[], selectedId: string) {
  const others = words.filter((w) => w.senseId !== selectedId);
  const n = others.length;
  const r = Math.min(CX, CY) * (n <= 4 ? 0.6 : n <= 8 ? 0.72 : 0.82);

  const pos: Record<string, { x: number; y: number }> = {};
  pos[selectedId] = { x: CX, y: CY };
  others.forEach((w, i) => {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2;
    pos[w.senseId] = { x: CX + r * Math.cos(angle), y: CY + r * Math.sin(angle) };
  });
  return pos;
}

function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center py-16">
      <div className="w-20 h-20 rounded-full bg-[#F0FDE4] flex items-center justify-center text-4xl">📖</div>
      <p className="text-gray-500 font-semibold text-base">아직 저장된 단어가 없어요</p>
      <p className="text-gray-400 text-sm leading-relaxed">단어장에 단어를 추가하면<br />여기서 한눈에 볼 수 있어요!</p>
    </div>
  );
}

export default function VocabularyPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [view, setView] = useState<"graph" | "list">("graph");

  const { data, isLoading } = useQuery({ queryKey: ["graph"], queryFn: api.getGraph });

  const words: GraphWord[] = useMemo(() => data?.words ?? [], [data]);
  const links: GraphLink[] = useMemo(() => data?.links ?? [], [data]);

  // 초기 선택: 연결 수 가장 많은 노드
  const effectiveSelected = useMemo(() => {
    if (selectedId && words.find((w) => w.senseId === selectedId)) return selectedId;
    if (words.length === 0) return null;
    const cnt: Record<string, number> = {};
    links.forEach((l) => {
      cnt[l.source] = (cnt[l.source] ?? 0) + 1;
      cnt[l.target] = (cnt[l.target] ?? 0) + 1;
    });
    return words.reduce((a, b) => ((cnt[b.senseId] ?? 0) > (cnt[a.senseId] ?? 0) ? b : a)).senseId;
  }, [words, links, selectedId]);

  const positions = useMemo(
    () => (effectiveSelected ? computePositions(words, effectiveSelected) : {}),
    [words, effectiveSelected],
  );

  const selectedWord = words.find((w) => w.senseId === effectiveSelected);

  const handleDelete = async (senseId: string) => {
    setDeletingId(senseId);
    try {
      await api.deleteGraphWord(senseId);
      queryClient.setQueryData<{ words: GraphWord[]; links: GraphLink[] }>(["graph"], (prev) =>
        prev
          ? {
              words: prev.words.filter((w) => w.senseId !== senseId),
              links: prev.links.filter((l) => l.source !== senseId && l.target !== senseId),
            }
          : prev,
      );
      if (selectedId === senseId) setSelectedId(null);
    } catch (e) {
      console.error(e);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main
      className="min-h-screen flex flex-col overflow-hidden"
      style={{ backgroundImage: "url('/vocabulary_bg.png')", backgroundSize: "cover", backgroundPosition: "center" }}
    >
      {/* 헤더 */}
      <header className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md m-3 rounded-3xl shadow-sm">
        <div className="w-24 h-9 relative">
          <Image src="/logo.jpg" alt="로고" fill className="object-contain" style={{ mixBlendMode: "multiply" }} />
        </div>
        <div className="flex items-center gap-3">
          <h1 className="font-display text-lg font-bold text-gray-700">나만의 지식 그래프</h1>
          {words.length > 0 && (
            <span className="px-2.5 py-0.5 bg-[#DEFCC2] text-green-700 rounded-full text-xs font-semibold">{words.length}개</span>
          )}
        </div>
        <button className="flex-shrink-0" onClick={() => router.push("/main")}>
          <Image src="/images/close.png" alt="닫기" width={32} height={32} />
        </button>
      </header>

      {/* 탭 */}
      <div className="flex justify-center gap-2 mb-2">
        {(["graph", "list"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`px-5 py-1.5 rounded-full text-sm font-semibold transition-all ${
              view === v ? "bg-white/90 text-gray-800 shadow-sm" : "text-white/80 hover:text-white"
            }`}
          >
            {v === "graph" ? "그래프" : "목록"}
          </button>
        ))}
      </div>

      {/* 콘텐츠 */}
      <div className="flex-1 mx-3 mb-3 bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm flex flex-col overflow-hidden">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">불러오는 중...</div>
        ) : words.length === 0 ? (
          <EmptyState />
        ) : view === "graph" ? (
          <div className="flex-1 flex flex-col p-5 gap-4 overflow-hidden">
            {/* 그래프 */}
            <div className="flex-1 flex items-center justify-center min-h-0">
              <div className="relative w-full" style={{ maxWidth: W, aspectRatio: `${W} / ${H}` }}>

                {/* SVG 엣지 */}
                <svg className="absolute inset-0 w-full h-full" viewBox={`0 0 ${W} ${H}`}>
                  {links.map((link, i) => {
                    const sp = positions[link.source];
                    const tp = positions[link.target];
                    if (!sp || !tp) return null;
                    const mx = (sp.x + tp.x) / 2;
                    const my = (sp.y + tp.y) / 2;
                    const color = LINK_COLOR[link.type] ?? "#D1D5DB";
                    return (
                      <g key={i}>
                        <line x1={sp.x} y1={sp.y} x2={tp.x} y2={tp.y} stroke={color} strokeWidth="2" />
                        <rect
                          x={mx - 18} y={my - 10} width={36} height={14}
                          rx={6} fill="white" fillOpacity={0.85}
                        />
                        <text x={mx} y={my} textAnchor="middle" dominantBaseline="middle" fontSize="9" fill="#6b7280">
                          {LINK_LABEL[link.type] ?? link.type}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* 노드 */}
                {words.map((word) => {
                  const pos = positions[word.senseId];
                  if (!pos) return null;
                  const c = posColor(word.pos);
                  const isSelected = word.senseId === effectiveSelected;
                  return (
                    <button
                      key={word.senseId}
                      onClick={() => setSelectedId(word.senseId)}
                      className={`absolute flex flex-col items-center gap-0.5 rounded-2xl border-2 transition-all
                        ${c.bg} ${c.border}
                        ${isSelected ? "px-5 py-2.5 shadow-lg ring-2 ring-offset-1 ring-blue-400 z-20" : "px-3 py-1.5 shadow-sm hover:shadow-md z-10"}`}
                      style={{
                        left: `${(pos.x / W) * 100}%`,
                        top: `${(pos.y / H) * 100}%`,
                        transform: "translate(-50%, -50%)",
                        minWidth: isSelected ? 80 : 60,
                      }}
                    >
                      <span className={`font-bold whitespace-nowrap ${c.text} ${isSelected ? "text-sm" : "text-xs"}`}>
                        {word.word}
                      </span>
                      <span className="text-[9px] text-gray-400">{word.pos}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 선택 단어 정의 */}
            {selectedWord && (
              <div className="flex-shrink-0 bg-[#F9FFF4] border border-[#D1FAC0] rounded-2xl px-5 py-3 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-bold text-gray-800 text-base">{selectedWord.word}</span>
                    <span className="text-xs text-gray-400">[{selectedWord.pos}]</span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{selectedWord.definition}</p>
                  {links.filter((l) => l.source === selectedWord.senseId || l.target === selectedWord.senseId).length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {links
                        .filter((l) => l.source === selectedWord.senseId || l.target === selectedWord.senseId)
                        .map((l, i) => {
                          const otherId = l.source === selectedWord.senseId ? l.target : l.source;
                          const other = words.find((w) => w.senseId === otherId);
                          if (!other) return null;
                          return (
                            <button
                              key={i}
                              onClick={() => setSelectedId(otherId)}
                              className="px-2.5 py-0.5 bg-white border border-gray-200 rounded-full text-xs text-gray-600 hover:border-green-300 transition-colors"
                            >
                              {LINK_LABEL[l.type] ?? l.type}: <span className="font-semibold">{other.word}</span>
                            </button>
                          );
                        })}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(selectedWord.senseId)}
                  disabled={deletingId === selectedWord.senseId}
                  className="flex-shrink-0 text-xs text-red-400 hover:text-red-600 disabled:opacity-40 transition-colors"
                >
                  {deletingId === selectedWord.senseId ? "삭제 중..." : "삭제"}
                </button>
              </div>
            )}

            {/* 범례 */}
            <div className="flex-shrink-0 flex gap-3 flex-wrap items-center">
              {Object.entries(POS_COLOR).map(([pos, c]) => (
                <div key={pos} className="flex items-center gap-1">
                  <div className={`w-2.5 h-2.5 rounded-full ${c.bg} border ${c.border}`} />
                  <span className="text-xs text-gray-500">{pos}</span>
                </div>
              ))}
              <div className="w-px h-3 bg-gray-200 mx-1" />
              {Object.entries(LINK_COLOR).map(([type, color]) => (
                <div key={type} className="flex items-center gap-1">
                  <div className="w-5 h-0.5 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-xs text-gray-400">{LINK_LABEL[type]}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3">
            {words.map((word) => {
              const c = posColor(word.pos);
              const wordLinks = links.filter((l) => l.source === word.senseId || l.target === word.senseId);
              return (
                <div key={word.senseId} className="flex items-start gap-3 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                  <div className={`flex-shrink-0 px-2.5 py-0.5 rounded-full text-xs font-semibold ${c.bg} ${c.text} border ${c.border}`}>
                    {word.pos}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm">{word.word}</p>
                    <p className="text-xs text-gray-500 leading-relaxed mt-0.5 line-clamp-2">{word.definition}</p>
                    {wordLinks.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {wordLinks.map((l, i) => {
                          const otherId = l.source === word.senseId ? l.target : l.source;
                          const other = words.find((w) => w.senseId === otherId);
                          if (!other) return null;
                          return (
                            <span key={i} className="text-[10px] px-2 py-0.5 bg-[#F0FDE4] text-green-700 rounded-full">
                              {LINK_LABEL[l.type] ?? l.type}: {other.word}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(word.senseId)}
                    disabled={deletingId === word.senseId}
                    className="flex-shrink-0 w-8 h-8 rounded-full hover:bg-red-50 flex items-center justify-center text-gray-300 hover:text-red-400 transition-colors disabled:opacity-40"
                  >
                    {deletingId === word.senseId ? (
                      <div className="w-3 h-3 border border-gray-300 border-t-gray-500 rounded-full animate-spin" />
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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
