"use client";

interface SlotHint {
  slotLabel: string;
  hint: string;
}

interface FeedbackModalProps {
  isOpen: boolean;
  type: "correct" | "incorrect" | "hint" | "none";
  onClose: () => void;
  onNext?: () => void;
  hintSlots?: SlotHint[];
}

export default function FeedbackModal({ isOpen, type, onClose, onNext, hintSlots }: FeedbackModalProps) {
  if (!isOpen || type === "none") return null;

  const config = {
    correct: {
      title: "정답입니다!",
      desc: "계속해서 문제를 풀어보세요!",
      btnText: "다음 문장 연습하기",
      btnColor: "bg-[#F2FEE6] text-green-700 border-[#C6FA98]",
      faceBg: "bg-[#E5F5D8]",
      faceEmoji: "😊",
      statusIcon: { icon: "✓", bg: "bg-green-400" },
    },
    incorrect: {
      title: "오답입니다!",
      desc: "다시 한 번 풀어보세요!",
      btnText: "다시 풀어보기",
      btnColor: "bg-[#FFECF0] text-[#F97878] border-[#FFD0D5]",
      faceBg: "bg-[#FFECF0]",
      faceEmoji: "😟",
      statusIcon: { icon: "✕", bg: "bg-red-400" },
    },
    hint: {
      title: "힌트",
      desc: null,
      btnText: "계속하기",
      btnColor: "bg-[#FFFFE5] text-[#F3B112] border-[#FCEC90]",
      faceBg: "bg-[#FFF8D6]",
      faceEmoji: "😏",
      statusIcon: null,
    },
  };

  const current = config[type];

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[32px] w-full max-w-[420px] p-10 flex flex-col items-center shadow-2xl">
        {/* Face */}
        <div className="relative mb-6">
          <div className={`w-[120px] h-[120px] ${current.faceBg} rounded-full flex items-center justify-center text-6xl`}>
            {current.faceEmoji}
          </div>
          {current.statusIcon && (
            <div className={`absolute -right-1 -bottom-1 w-9 h-9 ${current.statusIcon.bg} rounded-full flex items-center justify-center text-white font-bold text-lg`}>
              {current.statusIcon.icon}
            </div>
          )}
        </div>

        <h3 className="text-t-24b text-gray-800 mb-3">{current.title}</h3>

        {type === "hint" && hintSlots ? (
          <div className="w-full flex flex-col gap-3 mb-8">
            {hintSlots.map((s, i) => (
              <div key={i} className="flex items-center gap-3 bg-[#FFFDF0] border border-[#FCEC90] rounded-2xl px-4 py-3">
                <span className="shrink-0 bg-[#FCEC90] text-yellow-800 text-xs font-bold px-2 py-1 rounded-full">
                  {s.slotLabel}
                </span>
                <span className="text-b-16r text-gray-700">{s.hint}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-b-16r text-gray-600 text-center leading-relaxed mb-8">{current.desc}</p>
        )}

        <button
          onClick={type === "correct" ? onNext : onClose}
          className={`w-[240px] h-[56px] border rounded-xl text-s-16sb hover:brightness-95 transition-all ${current.btnColor}`}
        >
          {current.btnText}
        </button>
      </div>
    </div>
  );
}