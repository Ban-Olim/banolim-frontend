"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import DictionarySidebar from "../../components/dictionary/DictionarySidebar";
import FeedbackModal from "../../components/sentence/FeedbackModal";
import { api } from "../../lib/api";

interface WordChip {
  id: string;
  text: string;
  colorClass: string;
}

type SlotState = {
  slotOrder: number;
  slotLabel: string;
  correctAnswer: string;
  hint: string;
  currentWord: WordChip | null;
};

const OPTION_COLORS = [
  "bg-[#FFF8D6] border-[#FCEC90]",
  "bg-[#F2FEE6] border-[#C6FA98]",
  "bg-[#FFECF0] border-[#F97878]",
  "bg-[#E1FCFF] border-[#7DF2FF]",
];

export default function SentencePage() {
  const router = useRouter();
  const [isDictOpen, setIsDictOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<
    "none" | "correct" | "incorrect" | "hint"
  >("none");
  const [draggedWord, setDraggedWord] = useState<WordChip | null>(null);
  const [availableWords, setAvailableWords] = useState<WordChip[]>([]);
  const [slots, setSlots] = useState<SlotState[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [problemIndex, setProblemIndex] = useState(0);
  const [allDone, setAllDone] = useState(false);

  const {
    data: problems,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["sentencePractice"],
    queryFn: () => api.getSentencePractice(),
  });

  const problem =
    problems && problems.length > 0 ? problems[problemIndex] : null;

  // 문제 로드 시 슬롯/단어 초기화
  useEffect(() => {
    if (!problem || !problem.sentenceData) return;
    const words: WordChip[] = problem.sentenceData.options.map(
      (text: string, i: number) => ({
        id: `w${i}`,
        text,
        colorClass: OPTION_COLORS[i % OPTION_COLORS.length],
      }),
    );
    setAvailableWords(words);
    setSlots(
      problem.sentenceData.slots.map((slot: any) => ({
        ...slot,
        currentWord: null,
      })),
    );
  }, [problem]);

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

  const handleSubmit = async () => {
    if (!problem) return;
    setIsSubmitting(true);
    try {
      const userAnswers: Record<string, string> = {};
      slots.forEach((s) => {
        userAnswers[String(s.slotOrder)] = s.currentWord?.text ?? "";
      });
      console.log(
        "[제출] sentenceProblemId:",
        problem.sentenceProblemId,
        "userAnswers:",
        userAnswers,
      );
      const result = await api.submitSentence({
        sentenceProblemId: problem.sentenceProblemId,
        userAnswers,
      });
      console.log("[제출] 성공 result:", JSON.stringify(result));
      setActiveModal(result.isCorrect ? "correct" : "incorrect");
    } catch (err) {
      // 제출 실패 시 클라이언트 검증으로 폴백
      console.error("[제출] submitSentence 실패 → 클라이언트 폴백:", err);
      const allCorrect = slots.every(
        (s) => s.currentWord?.text === s.correctAnswer,
      );
      setActiveModal(allCorrect ? "correct" : "incorrect");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (!problems) return;
    if (problemIndex + 1 >= problems.length) {
      setAllDone(true);
    } else {
      setProblemIndex((i) => i + 1);
    }
    setActiveModal("none");
  };

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">문제를 불러오는 중...</p>
      </main>
    );
  }

  if (isError || !problems || problems.length === 0) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">문제를 불러오지 못했습니다.</p>
      </main>
    );
  }

  if (allDone) {
    return (
      <main
        className="min-h-screen flex flex-col items-center justify-center gap-6"
        style={{
          backgroundImage: "url('/sentence_bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="bg-white/90 rounded-[32px] p-12 flex flex-col items-center shadow-lg max-w-sm w-full mx-4">
          <div className="text-7xl mb-4">🎉</div>
          <h2 className="font-display text-2xl font-bold text-gray-800 mb-2">
            모두 완료!
          </h2>
          <p className="text-sm text-gray-500 text-center mb-8">
            {problems.length}개 문제를 모두 풀었어요!
          </p>
          <button
            onClick={() => {
              setProblemIndex(0);
              setAllDone(false);
            }}
            className="w-48 h-12 bg-[#C6FA98] text-green-800 rounded-xl text-sm font-semibold hover:brightness-95 transition-all"
          >
            다시 풀기
          </button>
        </div>
      </main>
    );
  }

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
        <div className="w-36 h-14 relative scale-125 origin-left">
          <Image
            src="/logo.jpg"
            alt="로고"
            fill
            className="object-contain"
            style={{ mixBlendMode: "multiply" }}
          />
        </div>
        <h1 className="font-display text-xl font-bold text-gray-700">
          문장 분해 연습
        </h1>
        <button className="flex-shrink-0" onClick={() => router.push("/main")}>
          <Image src="/images/close.png" alt="닫기" width={32} height={32} />
        </button>
      </header>

      {/* 진행률 */}
      <div className="mx-8 mb-2 z-10">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
          <span>
            {problemIndex + 1} / {problems.length}
          </span>
          <span>
            {Math.round(((problemIndex + 1) / problems.length) * 100)}%
          </span>
        </div>
        <div className="w-full h-2 bg-white/60 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#C6FA98] rounded-full transition-all duration-500"
            style={{
              width: `${((problemIndex + 1) / problems.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* 메인 */}
      <div className="flex-1 flex flex-col items-center pt-4 px-4 z-10 w-full max-w-[860px] mx-auto">
        {/* 문장 바 */}
        <div className="bg-[#F2FEE6]/90 border border-[#cff3af] rounded-2xl px-8 py-4 mb-8 flex items-center shadow-sm w-full max-h-15 max-w-[600px]">
          <span className="flex-1 text-center text-s-18b font-bold text-gray-800">
            {problem!.sentenceText}
          </span>
          <button
            className="hover:scale-110 transition-transform flex-shrink-0"
            onClick={() => { if (problem!.sentenceAudioUrl) new Audio(problem!.sentenceAudioUrl).play(); }}
          >
            <Image src="/images/sound.png" alt="소리" width={28} height={28} />
          </button>
        </div>

        {/* 워크스페이스 */}
        <div className="bg-[#E4F0F6] w-full rounded-[40px] p-10 flex flex-col items-center border border-[#CCCCCC] shadow-sm">
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
            disabled={isSubmitting}
            className="flex-1 h-14 bg-[#FFF0F0] text-gray-700 border border-[#FFD0D5] rounded-[20px] text-sm font-semibold hover:bg-[#FFE5E5] transition-colors disabled:opacity-60"
          >
            {isSubmitting ? "제출 중..." : "제출하기"}
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
        onNext={handleNext}
        hintSlots={problem!.sentenceData.slots.filter(
          (s) => s.slotLabel !== "",
        )}
      />
    </main>
  );
}
