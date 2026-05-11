"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { api, GraphWord, GraphLink } from "../../lib/api";
import DictionarySidebar from "../../components/dictionary/DictionarySidebar";

const POS_COLOR: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  명사: { bg: "bg-[#E5F5D8]", border: "border-[#b8f08a]", text: "text-green-700", dot: "#86efac" },
  동사: { bg: "bg-[#FFD0D5]", border: "border-[#fdaeae]", text: "text-red-500",   dot: "#fca5a5" },
  형용사: { bg: "bg-[#E1FCFF]", border: "border-[#93e8f1]", text: "text-cyan-700", dot: "#67e8f9" },
  부사: { bg: "bg-[#FFF8D6]", border: "border-[#f6eaa8]",  text: "text-yellow-700", dot: "#fde68a" },
};

const LINK_LABEL: Record<string, string> = {
  HYPERNYM_OF: "상위어",
  HYPONYM_OF:  "하위어",
  SYNONYM_OF:  "유의어",
  ANTONYM_OF:  "반의어",
};

function posColor(pos: string) {
  return POS_COLOR[pos] ?? { bg: "bg-gray-100", border: "border-gray-300", text: "text-gray-600", dot: "#d1d5db" };
}

// 노드 연결 수 기준으로 반지름 위치 계산
function layoutNodes(words: GraphWord[], links: GraphLink[], selectedId: string) {
  const W = 680, H = 380;
  const cx = W / 2, cy = H / 2;

  const connCount: Record<string, number> = {};
  words.forEach((w) => { connCount[w.senseId] = 0; });
  links.forEach((l) => {
    connCount[l.source] = (connCount[l.source] ?? 0) + 1;
    connCount[l.target] = (connCount[l.target] ?? 0) + 1;
  });

  const others = words.filter((w) => w.senseId !== selectedId);
  const positions: Record<string, { x: number; y: number }> = {};
  positions[selectedId] = { x: cx, y: cy };

  const rx = W * 0.38, ry = H * 0.38;
  others.forEach((w, i) => {
    const angle = (2 * Math.PI * i) / others.length - Math.PI / 2;
    positions[w.senseId] = {
      x: cx + rx * Math.cos(angle),
      y: cy + ry * Math.sin(angle),
    };
  });

  return { positions, W, H };
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center py-16">
      <div className="w-20 h-20 rounded-full bg-[#F0FDE4] flex items-center justify-center text-4xl">📖</div>
      <p className="text-gray-600 font-semibold text-base">아직 저장된 단어가 없어요</p>
      <p className="text-gray-400 text-sm leading-relaxed">단어를 추가하면 관계 그래프로 확인할 수 있어요</p>
      <button
        onClick={onAdd}
        className="mt-2 px-5 py-2 bg-[#C6FA98] text-green-800 rounded-full text-sm font-semibold hover:brightness-95 transition-all"
      >
        + 단어 추가
      </button>
    </div>
  );
}

export default function VocabularyPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [view, setView] = useState<"graph" | "list">("graph");
  const [isDictOpen, setIsDictOpen] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["graph"],
    queryFn: api.getGraph,
  });

  const words: GraphWord[] = useMemo(() => data?.words ?? [], [data]);
  const links: GraphLink[] = useMemo(() => data?.links ?? [], [data]);

  useEffect(() => {
    if (words.length > 0 && !selectedId) {
      // 연결 수 가장 많은 노드를 기본 선택
      const connCount: Record<string, number> = {};
      links.forEach((l) => {
        connCount[l.source] = (connCount[l.source] ?? 0) + 1;
        connCount[l.target] = (connCount[l.target] ?? 0) + 1;
      });
      const top = words.reduce((a, b) =>
        (connCount[b.senseId] ?? 0) > (connCount[a.senseId] ?? 0) ? b : a
      );
      setSelectedId(top.senseId);
    }
  }, [words, links, selectedId]);

  const selectedWord = words.find((w) => w.senseId === selectedId) ?? words[0];

  const handleDelete = async (senseId: string) => {
    setDeletingId(senseId);
    try {
      await api.deleteGraphWord(senseId);
      queryClient.invalidateQueries({ queryKey: ["graph"] });
      if (selectedId === senseId) setSelectedId(null);
    } catch (e) {
      console.error(e);
    } finally {
      setDeletingId(null);
    }
  };

  const { positions, W, H } = selectedWord
    ? layoutNodes(words, links, selectedWord.senseId)
    : { positions: {}, W: 680, H: 380 };

  // 실제 링크만 렌더 (연결된 노드만)
  const connectedIds = new Set<string>();
  links.forEach((l) => { connectedIds.add(l.source); connectedIds.add(l.target); });

  return (
    <main
      className="min-h-screen flex flex-col overflow-hidden"
      style={{ backgroundImage: "url('/vocabulary_bg.png')", backgroundSize: "cover", backgroundPosition: "center" }}
    >
      {/* 헤더 */}
      <header className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md m-3 rounded-3xl shadow-sm">
        <div className="w-32 h-12 relative">
          <Image src="/logo.jpg" alt="로고" fill className="object-contain" style={{ mixBlendMode: "multiply" }} />
        </div>
        <div className="flex items-center gap-3">
          <h1 className="font-display text-lg font-bold text-gray-700">나만의 지식 그래프</h1>
          {words.length > 0 && (
            <span className="px-2.5 py-0.5 bg-[#DEFCC2] text-green-700 rounded-full text-xs font-semibold">
              {words.length}개
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDictOpen(true)}
            className="px-4 py-2 bg-[#E1FCFF] border border-[#B3F7FE] rounded-full text-xs font-semibold text-cyan-800 hover:brightness-95 transition-all"
          >
            + 단어 추가
          </button>
          <button className="flex-shrink-0" onClick={() => router.push("/main")}>
            <Image src="/images/close.png" alt="닫기" width={32} height={32} />
          </button>
        </div>
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
          <EmptyState onAdd={() => setIsDictOpen(true)} />
        ) : view === "graph" ? (
          <div className="flex-1 flex flex-col p-5 gap-4 overflow-hidden">
            {/* 그래프 */}
            <div className="flex-1 flex items-center justify-center min-h-0">
              <div className="relative w-full" style={{ maxWidth: W, aspectRatio: `${W} / ${H}` }}>
                <svg ref={svgRef} className="absolute inset-0 w-full h-full" viewBox={`0 0 ${W} ${H}`}>
                  {/* 실제 관계 엣지 */}
                  {links.map((link, i) => {
                    const sp = positions[link.source];
                    const tp = positions[link.target];
                    if (!sp || !tp) return null;
                    const mx = (sp.x + tp.x) / 2;
                    const my = (sp.y + tp.y) / 2;
                    return (
                      <g key={i}>
                        <line
                          x1={sp.x} y1={sp.y} x2={tp.x} y2={tp.y}
                          stroke="#C6FA98" strokeWidth="2"
                        />
                        <text
                          x={mx} y={my - 5}
                          textAnchor="middle"
                          fontSize="10"
                          fill="#6b7280"
                        >
                          {LINK_LABEL[link.type] ?? link.type}
                        </text>
                      </g>
                    );
                  })}
                  {/* 연결 없는 노드 → 점선으로 중심과 연결 */}
                  {words.filter((w) => !connectedIds.has(w.senseId) && w.senseId !== selectedWord?.senseId).map((w) => {
                    const sp = positions[selectedWord?.senseId ?? ""];
                    const tp = positions[w.senseId];
                    if (!sp || !tp) return null;
                    return (
                      <line key={w.senseId}
                        x1={sp.x} y1={sp.y} x2={tp.x} y2={tp.y}
                        stroke="#e5e7eb" strokeWidth="1.5" strokeDasharray="5 4"
                      />
                    );
                  })}
                </svg>

                {/* 노드 */}
                <AnimatePresence>
                  {words.map((word) => {
                    const pos = positions[word.senseId];
                    if (!pos) return null;
                    const c = posColor(word.pos);
                    const isSelected = word.senseId === selectedWord?.senseId;
                    return (
                      <motion.button
                        key={word.senseId}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => setSelectedId(word.senseId)}
                        className={`absolute flex flex-col items-center gap-0.5 rounded-2xl px-4 py-2 border-2 transition-shadow
                          ${c.bg} ${c.border}
                          ${isSelected ? "shadow-lg ring-2 ring-offset-1 ring-green-300 z-20" : "shadow-sm hover:shadow-md z-10"}`}
                        style={{
                          left: `${(pos.x / W) * 100}%`,
                          top: `${(pos.y / H) * 100}%`,
                          transform: "translate(-50%, -50%)",
                          minWidth: isSelected ? 96 : 72,
                        }}
                      >
                        <span className={`text-xs font-bold ${c.text} whitespace-nowrap`}>{word.word}</span>
                        <span className="text-[10px] text-gray-400">{word.pos}</span>
                      </motion.button>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>

            {/* 선택 단어 상세 */}
            <AnimatePresence mode="wait">
              {selectedWord && (
                <motion.div
                  key={selectedWord.senseId}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.18 }}
                  className="flex-shrink-0 bg-[#F9FFF4] border border-[#D1FAC0] rounded-2xl px-5 py-3 flex items-start justify-between gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-bold text-gray-800 text-base">{selectedWord.word}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${posColor(selectedWord.pos).bg} ${posColor(selectedWord.pos).text}`}>
                        {selectedWord.pos}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{selectedWord.definition}</p>
                    {/* 관계 태그 */}
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
                </motion.div>
              )}
            </AnimatePresence>

            {/* 품사 범례 */}
            <div className="flex-shrink-0 flex gap-3 flex-wrap">
              {Object.entries(POS_COLOR).map(([pos, c]) => (
                <div key={pos} className="flex items-center gap-1.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${c.bg} border ${c.border}`} />
                  <span className="text-xs text-gray-500">{pos}</span>
                </div>
              ))}
              <div className="flex items-center gap-1.5 ml-2">
                <div className="w-6 border-t-2 border-[#C6FA98]" />
                <span className="text-xs text-gray-400">의미 관계</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-6 border-t border-dashed border-gray-300" />
                <span className="text-xs text-gray-400">무관계</span>
              </div>
            </div>
          </div>
        ) : (
          // 목록 뷰
          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3">
            {words.map((word) => {
              const c = posColor(word.pos);
              const wordLinks = links.filter((l) => l.source === word.senseId || l.target === word.senseId);
              return (
                <motion.div
                  key={word.senseId}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-3 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm"
                >
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
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <DictionarySidebar isOpen={isDictOpen} onClose={() => setIsDictOpen(false)} />
    </main>
  );
}
