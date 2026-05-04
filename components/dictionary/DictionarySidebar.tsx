"use client";

import { useState } from "react";
import Image from "next/image";
import { useQueryClient } from "@tanstack/react-query";
import { api, WordSearchResult, WordExample } from "../../lib/api";

interface DictionarySidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DictionarySidebar({
  isOpen,
  onClose,
}: DictionarySidebarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<WordSearchResult[]>([]);
  const [searched, setSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // 예문: senseId → WordExample
  const [examples, setExamples] = useState<Record<string, WordExample>>({});
  const [loadingEx, setLoadingEx] = useState<Record<string, boolean>>({});

  // 추가 완료된 senseId 목록
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [addingIds, setAddingIds] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

  const handleSearch = async () => {
    if (!query.trim() || isSearching) return;
    setIsSearching(true);
    setSearched(false);
    setSearchError(null);
    setResults([]);
    setExamples({});
    try {
      const data = await api.searchWords(query.trim());
      setResults(data ?? []);
      setSearched(true);
    } catch (e) {
      console.error("[searchWords error]", e);
      setSearchError(
        "검색 중 서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
      );
      setSearched(true);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddWord = async (senseId: string) => {
    if (addingIds.has(senseId) || addedIds.has(senseId)) return;
    setAddingIds((prev) => new Set(prev).add(senseId));
    try {
      await api.addWord(senseId);
      setAddedIds((prev) => new Set(prev).add(senseId));
      queryClient.invalidateQueries({ queryKey: ["graph"] });
    } catch (e) {
      console.error("[addWord error]", e);
    } finally {
      setAddingIds((prev) => {
        const next = new Set(prev);
        next.delete(senseId);
        return next;
      });
    }
  };

  const handleGetExample = async (senseId: string) => {
    if (examples[senseId] || loadingEx[senseId]) return;
    setLoadingEx((prev) => ({ ...prev, [senseId]: true }));
    try {
      const ex = await api.getExample(senseId);
      setExamples((prev) => ({ ...prev, [senseId]: ex }));
    } catch (e) {
      console.error("[getExample error]", e);
    } finally {
      setLoadingEx((prev) => ({ ...prev, [senseId]: false }));
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-[420px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-s-20b text-gray-800">단어장 검색</h2>
          <button onClick={onClose} className="flex-shrink-0">
            <Image src="/images/close.png" alt="닫기" width={32} height={32} />
          </button>
        </div>

        {/* 검색 */}
        <div className="px-6 pt-5 pb-3 flex flex-col gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="단어를 검색해보세요"
            className="w-full h-[48px] px-4 rounded-2xl border border-gray-200 focus:outline-none focus:border-[#C6FA98] text-b-16r bg-gray-50"
          />
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="w-full h-[48px] bg-[#DEFCC2] text-green-700 rounded-2xl text-b-16sb hover:brightness-95 transition-all font-semibold disabled:opacity-60"
          >
            {isSearching ? "검색 중..." : "검색하기"}
          </button>
        </div>

        {/* 결과 */}
        <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4">
          {searched && searchError && (
            <div className="flex-1 flex items-center justify-center text-red-400 text-b-14r text-center mt-20 px-4">
              {searchError}
            </div>
          )}

          {searched && !searchError && results.length === 0 && (
            <div className="flex-1 flex items-center justify-center text-gray-300 text-b-16r mt-20">
              검색 결과가 없습니다
            </div>
          )}

          {searched && results.length > 0 && (
            <>
              <p className="text-b-14r text-gray-400">검색 결과</p>

              {results.map((r) => (
                <div key={r.senseId} className="flex flex-col gap-2">
                  {/* 단어 카드 */}
                  <div className="bg-gray-50 rounded-2xl p-4 flex flex-col gap-2 border border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-baseline gap-2">
                        <span className="text-s-18b text-gray-800">
                          {r.word}
                        </span>
                        <span className="text-b-13r text-gray-400">
                          [{r.pos}]
                        </span>
                      </div>
                      <button
                        onClick={() => handleAddWord(r.senseId)}
                        disabled={
                          addingIds.has(r.senseId) || addedIds.has(r.senseId)
                        }
                        className="px-3 py-1.5 border border-gray-300 rounded-xl text-b-13r text-gray-600 hover:bg-gray-100 transition-colors whitespace-nowrap disabled:opacity-60"
                      >
                        {addedIds.has(r.senseId)
                          ? "추가됨 ✓"
                          : addingIds.has(r.senseId)
                            ? "추가 중..."
                            : "단어장에 추가"}
                      </button>
                    </div>
                    <p className="text-b-14r text-gray-600 leading-relaxed">
                      {r.definition}
                    </p>

                    {/* 예문 보기 버튼 */}
                    {!examples[r.senseId] && (
                      <button
                        onClick={() => handleGetExample(r.senseId)}
                        disabled={loadingEx[r.senseId]}
                        className="self-start text-b-13r text-cyan-600 hover:underline disabled:opacity-60"
                      >
                        {loadingEx[r.senseId] ? "예문 생성 중..." : "예문 보기"}
                      </button>
                    )}
                  </div>

                  {/* 예문 영역 */}
                  {examples[r.senseId] && (
                    <div className="bg-[#F9FFF4] rounded-2xl p-4 border border-[#E5F5D8] flex flex-col gap-2">
                      <p className="text-b-14r text-gray-700 leading-relaxed">
                        {examples[r.senseId].example_sentence}
                      </p>
                      <p className="text-b-13r text-gray-400 leading-relaxed">
                        {examples[r.senseId].translation}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </>
          )}

          {!searched && (
            <div className="flex-1 flex items-center justify-center text-gray-300 text-b-16r mt-20">
              검색어를 입력해보세요
            </div>
          )}
        </div>
      </div>
    </>
  );
}
