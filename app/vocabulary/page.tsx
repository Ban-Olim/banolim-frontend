"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, GraphWord, GraphLink } from "../../lib/api";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });

type FGNode = { [k: string]: unknown; id?: string | number; x?: number; y?: number; };

const POS_FILL: Record<string, { fill: string; border: string; text: string }> = {
  명사:   { fill: "#E5F5D8", border: "#b8f08a", text: "#15803d" },
  동사:   { fill: "#FFD0D5", border: "#fdaeae", text: "#dc2626" },
  형용사: { fill: "#E1FCFF", border: "#93e8f1", text: "#0e7490" },
  부사:   { fill: "#FFF8D6", border: "#f6eaa8", text: "#a16207" },
};

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
  const graphContainerRef = useRef<HTMLDivElement>(null);
  const [graphSize, setGraphSize] = useState({ width: 800, height: 500 });

  const { data, isLoading } = useQuery({ queryKey: ["graph"], queryFn: api.getGraph });

  const words: GraphWord[] = useMemo(() => data?.words ?? [], [data]);
  const links: GraphLink[] = useMemo(() => data?.links ?? [], [data]);

  useEffect(() => {
    const el = graphContainerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setGraphSize({ width, height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const graphData = useMemo(() => ({
    nodes: words.map((w) => ({ ...w, id: w.senseId })),
    links: links.map((l) => ({ source: l.source, target: l.target, type: l.type })),
  }), [words, links]);

  const selectedWord = useMemo(() => words.find((w) => w.senseId === selectedId) ?? null, [words, selectedId]);

  const nodeCanvasObject = useCallback((raw: FGNode, ctx: CanvasRenderingContext2D) => {
    const nx = raw.x ?? 0;
    const ny = raw.y ?? 0;
    const label = String(raw.word ?? "");
    const pos = String(raw.pos ?? "");
    const isSelected = raw.id === selectedId;
    const fontSize = isSelected ? 13 : 12;
    ctx.font = `${isSelected ? "bold" : "600"} ${fontSize}px -apple-system, BlinkMacSystemFont, sans-serif`;
    const textWidth = ctx.measureText(label).width;
    const px = 10, py = 7, r = 8;
    const w = textWidth + px * 2;
    const h = fontSize + py * 2;
    const x = nx - w / 2;
    const y = ny - h / 2;
    const colors = POS_FILL[pos] ?? { fill: "#f3f4f6", border: "#d1d5db", text: "#374151" };

    if (isSelected) { ctx.shadowColor = "rgba(59,130,246,0.5)"; ctx.shadowBlur = 16; }
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fillStyle = colors.fill; ctx.fill();
    ctx.strokeStyle = isSelected ? "#3b82f6" : colors.border;
    ctx.lineWidth = isSelected ? 2.5 : 1.5; ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = colors.text; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(label, nx, ny);
  }, [selectedId]);

  const nodePointerAreaPaint = useCallback((raw: FGNode, color: string, ctx: CanvasRenderingContext2D) => {
    const nx = raw.x ?? 0; const ny = raw.y ?? 0;
    ctx.font = "12px sans-serif";
    const tw = ctx.measureText(String(raw.word ?? "")).width;
    ctx.fillStyle = color;
    ctx.fillRect(nx - tw / 2 - 10, ny - 13, tw + 20, 26);
  }, []);

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
        <div className="w-36 h-14 relative scale-125 origin-left">
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
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* 포스 그래프 */}
            <div ref={graphContainerRef} className="flex-1 min-h-0 cursor-grab active:cursor-grabbing">
              <ForceGraph2D
                graphData={graphData}
                width={graphSize.width}
                height={graphSize.height}
                nodeLabel=""
                nodeCanvasObject={nodeCanvasObject}
                nodeCanvasObjectMode={() => "replace"}
                nodePointerAreaPaint={nodePointerAreaPaint}
                linkColor={(link) => LINK_COLOR[String((link as FGNode).type ?? "")] ?? "#D1D5DB"}
                linkWidth={2}
                linkCurvature={0.1}
                linkCanvasObjectMode={() => "after"}
                linkCanvasObject={(link, ctx) => {
                  const l = link as FGNode & { source?: FGNode; target?: FGNode };
                  const sx = l.source?.x ?? 0; const sy = l.source?.y ?? 0;
                  const tx = l.target?.x ?? 0; const ty = l.target?.y ?? 0;
                  if (!sx && !tx) return;
                  const mx = (sx + tx) / 2; const my = (sy + ty) / 2;
                  const label = LINK_LABEL[String(l.type ?? "")] ?? String(l.type ?? "");
                  ctx.font = "9px sans-serif";
                  const tw = ctx.measureText(label).width; const pad = 4;
                  ctx.fillStyle = "rgba(255,255,255,0.88)";
                  ctx.fillRect(mx - tw / 2 - pad, my - 7, tw + pad * 2, 13);
                  ctx.fillStyle = "#9ca3af"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
                  ctx.fillText(label, mx, my);
                }}
                onNodeClick={(node) => setSelectedId(String((node as FGNode).id ?? ""))}
                backgroundColor="transparent"
                d3AlphaDecay={0.015}
                d3VelocityDecay={0.25}
                cooldownTicks={150}
              />
            </div>

            {/* 선택 단어 정의 */}
            {selectedWord && (
              <div className="flex-shrink-0 bg-[#F9FFF4] border-t border-[#D1FAC0] px-5 py-3 flex items-start justify-between gap-3">
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
            <div className="flex-shrink-0 flex gap-3 flex-wrap items-center px-5 py-2.5 border-t border-gray-100">
              {Object.entries(POS_FILL).map(([pos, c]) => (
                <div key={pos} className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.fill, border: `1.5px solid ${c.border}` }} />
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
