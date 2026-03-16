"use client";

import { useState } from "react";
import Image from "next/image";
import DictionarySidebar from "../../components/dictionary/DictionarySidebar";
import FeedbackModal from "../../components/sentence/FeedbackModal";

interface Slot {
  slotOrder: number;
  slotLabel: string;
  correctAnswer: string;
  hint: string;
}

interface WordChip {
  id: string;
  text: string;
  colorClass: string;
}

type SlotState = Slot & { currentWord: WordChip | null };

const OPTION_COLORS = [
  "bg-[#FFF8D6] border-[#FCEC90]",
  "bg-[#F2FEE6] border-[#C6FA98]",
  "bg-[#FFECF0] border-[#F97878]",
  "bg-[#E1FCFF] border-[#7DF2FF]",
];

const MOCK_PROBLEM = {
  sentenceProblemId: 15,
  sentenceText: "어제 동생이 사탕을 받았다.",
  sentenceAudioUrl: "https://example.com/dummy-audio.mp3",
  sentenceData: {
    slots: [
      {
        slotOrder: 1,
        slotLabel: "어떤/언제",
        correctAnswer: "어제",
        hint: "어떤/언제",
      },
      {
        slotOrder: 2,
        slotLabel: "누가",
        correctAnswer: "동생이",
        hint: "누가",
      },
      {
        slotOrder: 3,
        slotLabel: "무엇을",
        correctAnswer: "사탕을",
        hint: "무엇을",
      },
      {
        slotOrder: 4,
        slotLabel: "했나요",
        correctAnswer: "받았다",
        hint: "했나요",
      },
    ],
    options: ["사탕을", "동생이", "어제", "받았다"],
  },
};

export default function SentencePage() {
  const [isDictOpen, setIsDictOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<
    "none" | "correct" | "incorrect" | "hint"
  >("none");
  const [draggedWord, setDraggedWord] = useState<WordChip | null>(null);

  const problem = MOCK_PROBLEM;

  const initialWords: WordChip[] = problem.sentenceData.options.map(
    (text, i) => ({
      id: `w${i}`,
      text,
      colorClass: OPTION_COLORS[i % OPTION_COLORS.length],
    }),
  );

  const [availableWords, setAvailableWords] =
    useState<WordChip[]>(initialWords);
  const [slots, setSlots] = useState<SlotState[]>(
    problem.sentenceData.slots.map((slot) => ({ ...slot, currentWord: null })),
  );

  const handleDragStart = (word: WordChip) => setDraggedWord(word);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleDrop = (slotOrder: number) => {
    if (!draggedWord) return;
    const targetSlot = slots.find((s) => s.slotOrder === slotOrder);
    const displaced = targetSlot?.currentWord;
    setSlots(
      slots.map((s) =>
        s.slotOrder === slotOrder ? { ...s, currentWord: draggedWord } : s,
      ),
    );
    setAvailableWords((prev) => {
      const filtered = prev.filter((w) => w.id !== draggedWord.id);
      return displaced ? [...filtered, displaced] : filtered;
    });
    setDraggedWord(null);
  };

  const handleSlotClick = (slotOrder: number) => {
    const slot = slots.find((s) => s.slotOrder === slotOrder);
    if (!slot?.currentWord) return;
    setAvailableWords((prev) => [...prev, slot.currentWord!]);
    setSlots(
      slots.map((s) =>
        s.slotOrder === slotOrder ? { ...s, currentWord: null } : s,
      ),
    );
  };

  const handleSubmit = () => {
    const allFilled = slots.every((s) => s.currentWord !== null);
    if (!allFilled) {
      alert("모든 빈칸을 채워주세요!");
      return;
    }
    const allCorrect = slots.every(
      (s) => s.currentWord?.text === s.correctAnswer,
    );
    setActiveModal(allCorrect ? "correct" : "incorrect");
  };

  return (
    <main
      className="min-h-screen relative flex flex-col overflow-hidden"
      style={{
        backgroundImage: "url('/sentence_bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* 헤더 */}
      <header className="flex items-center justify-between px-8 py-5 bg-white/80 backdrop-blur-md m-4 rounded-3xl shadow-sm z-10">
        <div className="w-[100px] h-[40px] bg-[#DEFCC2] rounded-full flex items-center justify-center text-green-700 text-s-16sb">
          로고
        </div>
        <h1 className="font-display text-xl font-bold text-gray-700">문장 분해 연습</h1>
        <button className="flex-shrink-0">
          <Image src="/images/close.png" alt="닫기" width={32} height={32} />
        </button>
      </header>

      {/* 메인 */}
      <div className="flex-1 flex flex-col items-center pt-6 px-4 z-10 w-full max-w-[860px] mx-auto">
        {/* 문장 바 */}
        <div className="bg-[#F2FEE6]/90 border border-[#C6FA98] rounded-2xl px-8 py-4 mb-8 flex items-center justify-center gap-4 shadow-sm w-full max-w-[600px]">
          <span className="text-s-18b text-gray-800">
            {problem.sentenceText}
          </span>
          <button className="hover:scale-110 transition-transform flex-shrink-0">
            <Image src="/images/sound.png" alt="소리" width={28} height={28} />
          </button>
        </div>

        {/* 워크스페이스 */}
        <div className="bg-white/70 backdrop-blur-sm w-full rounded-[40px] p-10 flex flex-col items-center border border-[#CCCCCC] shadow-sm">
          {/* 슬롯 */}
          <div className="flex gap-4 w-full justify-center mb-8 flex-wrap">
            {slots.map((slot) => (
              <div
                key={slot.slotOrder}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(slot.slotOrder)}
                onClick={() => handleSlotClick(slot.slotOrder)}
                className={`flex-1 min-w-[100px] max-w-[200px] h-16 rounded-2xl flex items-center justify-center text-sm font-semibold transition-all border-2 cursor-pointer select-none
                  ${
                    slot.currentWord
                      ? `${slot.currentWord.colorClass} shadow-sm`
                      : "bg-white border-gray-300 text-gray-500 shadow-inner"
                  }`}
              >
                {slot.currentWord ? slot.currentWord.text : slot.slotLabel}
              </div>
            ))}
          </div>

          <div className="w-full h-px bg-gray-200 my-2" />
          <p className="text-b-16sb text-gray-500 my-6">
            각 단어를 알맞은 칸에 넣어보세요!
          </p>

          {/* 단어 보기 */}
          <div className="flex gap-4 w-full justify-center items-center min-h-[72px] flex-wrap">
            {availableWords.map((word) => (
              <div
                key={word.id}
                draggable
                onDragStart={() => handleDragStart(word)}
                className={`px-7 py-3 rounded-full border-2 text-s-18sb text-gray-800 shadow-sm cursor-grab active:cursor-grabbing hover:scale-105 transition-transform ${word.colorClass}`}
              >
                {word.text}
              </div>
            ))}
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="flex gap-3 mt-8 mb-8 w-full max-w-[600px]">
          <button
            onClick={handleSubmit}
            className="flex-1 h-14 bg-[#FFF0F0] text-gray-700 border border-[#FFD0D5] rounded-[20px] text-sm font-semibold hover:bg-[#FFE5E5] transition-colors"
          >
            제출하기
          </button>
          <button
            onClick={() => setActiveModal("hint")}
            className="flex-1 h-14 bg-[#FFFFE5] text-gray-700 border border-[#FEF4BA] rounded-[20px] text-sm font-semibold hover:bg-[#FFF8CC] transition-colors"
          >
            힌트보기
          </button>
          <button
            onClick={() => setIsDictOpen(true)}
            className="flex-1 h-14 bg-[#E1FCFF] text-cyan-800 border-2 border-[#B3F7FE] rounded-[20px] text-sm font-semibold hover:brightness-95 transition-all"
          >
            단어검색
          </button>
        </div>
      </div>

      <DictionarySidebar
        isOpen={isDictOpen}
        onClose={() => setIsDictOpen(false)}
      />

      <FeedbackModal
        isOpen={activeModal !== "none"}
        type={activeModal}
        onClose={() => setActiveModal("none")}
        onNext={() => setActiveModal("none")}
        hintSlots={problem.sentenceData.slots}
      />
    </main>
  );
}
