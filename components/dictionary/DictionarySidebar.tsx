"use client";

import { useState } from "react";
import Image from "next/image";

interface DictionarySidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DictResult {
  word: string;
  pos: string;
  definition: string;
}

interface DictExample {
  context: string;
  sentences: string[];
}

const MOCK_RESULTS: DictResult[] = [
  { word: "공원", pos: "명사", definition: "사람들이 쉬거나 놀 수 있도록 꾸며 놓은 곳." },
  { word: "공원하다", pos: "동사", definition: "어떤 목적을 달성하고자 사람을 모으거나 물건, 수단, 방법 따위를 집중하다." },
];

const MOCK_EXAMPLE: DictExample = {
  context: "이 문장에서는 '공원에서'처럼 '어디에서?'를 말할 때 쓰여요.",
  sentences: [
    "우리는 공원에서 산책했어요.",
    "친구들이 공원에서 놀고 있어요.",
    "주말에 공원에서 자전거를 탔어요.",
  ],
};

export default function DictionarySidebar({ isOpen, onClose }: DictionarySidebarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<DictResult[]>([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = () => {
    if (!query.trim()) return;
    setResults(MOCK_RESULTS);
    setSearched(true);
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
            className="w-full h-[48px] bg-[#DEFCC2] text-green-700 rounded-2xl text-b-16sb hover:brightness-95 transition-all font-semibold"
          >
            검색하기
          </button>
        </div>

        {/* 결과 + 예문 */}
        <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4">
          {searched && (
            <>
              <p className="text-b-14r text-gray-400">검색 결과</p>

              {results.map((r, i) => (
                <div key={i} className="bg-gray-50 rounded-2xl p-4 flex flex-col gap-2 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                      <span className="text-s-18b text-gray-800">{r.word}</span>
                      <span className="text-b-13r text-gray-400">[{r.pos}]</span>
                    </div>
                    <button className="px-3 py-1.5 border border-gray-300 rounded-xl text-b-13r text-gray-600 hover:bg-gray-100 transition-colors whitespace-nowrap">
                      단어장에 추가
                    </button>
                  </div>
                  <p className="text-b-14r text-gray-600 leading-relaxed">{r.definition}</p>
                </div>
              ))}

              {/* 예문 */}
              <div className="mt-2">
                <p className="text-b-14r text-gray-400 mb-3">예문</p>
                <div className="bg-[#F9FFF4] rounded-2xl p-4 border border-[#E5F5D8] flex flex-col gap-3">
                  <p className="text-b-14r text-gray-600 leading-relaxed">{MOCK_EXAMPLE.context}</p>
                  <div className="flex flex-col gap-1 mt-1">
                    <p className="text-b-13r text-gray-400">예시문장</p>
                    {MOCK_EXAMPLE.sentences.map((s, i) => (
                      <p key={i} className="text-b-14r text-gray-700">• {s}</p>
                    ))}
                  </div>
                </div>
              </div>
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
