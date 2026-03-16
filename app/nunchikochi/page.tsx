"use client";

import { useState } from "react";
import Image from "next/image";
import DictionarySidebar from "../../components/dictionary/DictionarySidebar";

interface Character {
  id: string;
  name: string;
  age: string;
  personality: string;
  quest: string;
  likeTags: string[];
  warnTags: string[];
  description: string;
  speechStyle: string;
  likes: string;
  dislikes: string;
  specialNote: string;
  cardBg: string;
  cardImage: string;
}

interface Message {
  id: string;
  sender: "character" | "user";
  text: string;
  isTyping?: boolean;
}

const CHARACTERS: Character[] = [
  {
    id: "1",
    name: "김철수",
    age: "10세",
    personality: "소심",
    quest: "마음 온도계 100%로 채우기",
    likeTags: ["공룡", "로봇"],
    warnTags: ["큰소리 주의"],
    description: "소심하고 낯을 많이 가림. 친구가 큰 소리를 내면 깜짝 놀람",
    speechStyle: '"~했어..."처럼 말끝을 흐리는 편. 점을 많이 씀.',
    likes: "공룡, 로봇",
    dislikes: "매운 음식, 큰 소리",
    specialNote: "긴장하면 귀를 만지작거림.",
    cardBg: "bg-[#E5F5D8]",
    cardImage: "/images/charactercard1.png",
  },
  {
    id: "2",
    name: "박하린",
    age: "11세",
    personality: "활발",
    quest: "마음 온도계 100%로 채우기",
    likeTags: ["친구 사귀기", "게임"],
    warnTags: [],
    description: "활발하고 에너지 넘침. 새로운 친구를 사귀는 것을 좋아함.",
    speechStyle: "빠르게 말하고 감탄사를 많이 씀.",
    likes: "친구 사귀기, 게임",
    dislikes: "혼자 있기, 조용한 것",
    specialNote: "흥분하면 목소리가 커짐.",
    cardBg: "bg-[#FFD0D5]",
    cardImage: "/images/charactercard2.png",
  },
  {
    id: "3",
    name: "이준호",
    age: "10세",
    personality: "꼼꼼",
    quest: "마음 온도계 100%로 채우기",
    likeTags: ["레고", "퍼즐"],
    warnTags: [],
    description: "꼼꼼하고 계획적임. 정해진 규칙을 잘 지킴.",
    speechStyle: "정확하게 말하는 편. 숫자나 이름을 정확히 씀.",
    likes: "레고, 퍼즐",
    dislikes: "무계획, 어지러운 것",
    specialNote: "물건을 제자리에 놓는 것을 중요하게 생각함.",
    cardBg: "bg-[#E1FCFF]",
    cardImage: "/images/charactercard3.png",
  },
  {
    id: "4",
    name: "최민지",
    age: "9세",
    personality: "수줍",
    quest: "마음 온도계 100%로 채우기",
    likeTags: ["그림", "동물"],
    warnTags: [],
    description: "수줍음이 많고 말이 적음. 그림 그리기를 좋아함.",
    speechStyle: '"..."으로 끝내는 경우가 많음. 목소리가 작음.',
    likes: "그림, 동물",
    dislikes: "큰 소리, 많은 사람",
    specialNote: "긴장하면 고개를 숙이는 버릇이 있음.",
    cardBg: "bg-[#FFF8D6]",
    cardImage: "/images/charactercard4.png",
  },
];

function BackgroundDecorations() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <div className="absolute top-[12%] left-[8%] w-28 h-12 bg-white/60 rounded-full blur-sm animate-cloud-fly-slow" />
      <div className="absolute top-[20%] right-[15%] w-40 h-14 bg-white/50 rounded-full blur-sm animate-cloud-fly" />
      <div className="absolute bottom-[25%] left-[20%] w-24 h-10 bg-white/40 rounded-full blur-sm animate-cloud-fly-fast" />
    </div>
  );
}

function PageHeader({
  title,
  onClose,
}: {
  title: string;
  onClose?: () => void;
}) {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md m-3 rounded-3xl shadow-sm z-10">
      <div className="w-24 h-9 bg-[#DEFCC2] rounded-full flex items-center justify-center text-green-700 text-sm font-semibold">
        로고
      </div>
      <h1 className="font-display text-xl font-bold text-gray-700">{title}</h1>
      <button onClick={onClose} className="flex-shrink-0">
        <Image src="/images/close.png" alt="닫기" width={32} height={32} />
      </button>
    </header>
  );
}

export default function NunchikochePage() {
  const [view, setView] = useState<"selection" | "chat">("selection");
  const [openCardId, setOpenCardId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDictOpen, setIsDictOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [moodPercent, setMoodPercent] = useState(30);
  const [inputText, setInputText] = useState("");
  const [chatChar, setChatChar] = useState<Character>(CHARACTERS[0]);
  const [messages, setMessages] = useState<Message[]>([
    { id: "m1", sender: "character", text: "", isTyping: true },
  ]);

  const filteredChars = CHARACTERS.filter(
    (c) =>
      !searchQuery ||
      c.name.includes(searchQuery) ||
      c.personality.includes(searchQuery) ||
      [...c.likeTags, ...c.warnTags].some((t) => t.includes(searchQuery)),
  );

  const handleSend = () => {
    if (!inputText.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: `m${Date.now()}`, sender: "user", text: inputText },
    ]);
    setInputText("");
    const newMood = Math.min(moodPercent + 35, 100);
    setMoodPercent(newMood);
    if (newMood >= 100) setTimeout(() => setShowSuccess(true), 300);
  };

  const handleStartChat = (char: Character) => {
    setChatChar(char);
    setMoodPercent(30);
    setMessages([{ id: "m1", sender: "character", text: "", isTyping: true }]);
    setOpenCardId(null);
    setView("chat");
  };

  const handleCardClick = (char: Character) => {
    setOpenCardId((prev) => (prev === char.id ? null : char.id));
  };

  // ─── 채팅 ─────────────────────────────────────────────────────────────────
  if (view === "chat") {
    return (
      <main
        className="min-h-screen flex flex-col relative overflow-hidden"
        style={{
          backgroundImage: "url('/nunchikochi_bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <BackgroundDecorations />
        <PageHeader title="눈치코치" onClose={() => setView("selection")} />

        <div className="flex-1 mx-3 mb-3 bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm flex flex-col overflow-hidden z-10">
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "user" ? "justify-end" : "items-start gap-3"}`}
              >
                {msg.sender === "character" && (
                  <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    <div className="w-12 h-12 rounded-full overflow-hidden">
                      <Image
                        src={chatChar.cardImage}
                        alt={chatChar.name}
                        width={48}
                        height={48}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <span className="text-xs text-gray-500">
                      {chatChar.name}
                    </span>
                    <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-400 rounded-full transition-all duration-500"
                        style={{ width: `${moodPercent}%` }}
                      />
                    </div>
                  </div>
                )}
                {msg.sender === "character" ? (
                  <div className="flex items-center gap-2">
                    <div className="bg-[#E5F5D8] px-4 py-3 rounded-2xl rounded-tl-none text-sm text-gray-800 max-w-xs">
                      {msg.isTyping ? (
                        <span className="text-gray-400">입력중...</span>
                      ) : (
                        msg.text
                      )}
                    </div>
                    {msg.isTyping ? (
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin flex-shrink-0" />
                    ) : (
                      <button className="flex-shrink-0">
                        <Image
                          src="/images/sound.png"
                          alt="소리"
                          width={20}
                          height={20}
                        />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-tr-none text-sm text-gray-800 max-w-xs shadow-sm">
                    {msg.text}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 p-4 flex flex-col gap-3">
            <div className="flex gap-2">
              <input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="입력해주세요"
                className="flex-1 h-16 px-5 rounded-full bg-[#FAFAFA] border border-[#BABABA] shadow-[8px_8px_8px_rgba(94,94,94,0.04)] focus:outline-none focus:border-[#C6FA98] text-sm"
              />
              <button
                onClick={handleSend}
                className="h-16 px-5 border border-gray-300 rounded-full text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap"
              >
                보내기 ↑
              </button>
            </div>
            <button
              onClick={() => setIsDictOpen(true)}
              className="w-full h-14 bg-[#E1FCFF] border-2 border-[#B3F7FE] rounded-[20px] text-sm font-semibold text-cyan-800 hover:brightness-95 transition-all"
            >
              단어검색
            </button>
          </div>
        </div>

        <DictionarySidebar
          isOpen={isDictOpen}
          onClose={() => setIsDictOpen(false)}
        />

        {showSuccess && (
          <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[32px] w-full max-w-sm p-10 flex flex-col items-center shadow-2xl">
              <div className="text-7xl mb-4">😍</div>
              <h3 className="font-display text-xl font-bold text-gray-800 mb-2">
                성공!
              </h3>
              <p className="text-sm text-gray-600 text-center leading-relaxed mb-8">
                마음 온도계를 잘 채우셨어요!
                <br />
                다른 친구들도 채워주세요!
              </p>
              <button
                onClick={() => {
                  setShowSuccess(false);
                  setView("selection");
                }}
                className="w-48 h-12 bg-[#BFF0F5] text-cyan-800 rounded-xl text-sm font-semibold hover:brightness-95 transition-all"
              >
                계속하기
              </button>
            </div>
          </div>
        )}
      </main>
    );
  }

  // ─── 선택 ─────────────────────────────────────────────────────────────────
  return (
    <main
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{
        backgroundImage: "url('/nunchikochi_bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <BackgroundDecorations />
      <PageHeader title="눈치코치" />

      <div className="flex gap-3 mx-3 mb-3 z-10 flex-1 min-h-0">
        {/* 왼쪽 – 성격 목록 */}
        <div className="w-64 md:w-80 bg-white/80 backdrop-blur-sm rounded-3xl p-5 shadow-sm flex flex-col gap-3 overflow-hidden flex-shrink-0">
          <h2 className="font-bold text-gray-800">성격 목록</h2>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
              🔍
            </span>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="검색 (예: 소심, 공룡)"
              className="w-full h-11 pl-8 pr-3 bg-white border border-[#ECECEC] rounded-xl text-sm focus:outline-none focus:border-[#C6FA98]"
            />
          </div>

          <div className="flex flex-col gap-2 overflow-y-auto flex-1">
            {filteredChars.map((char) => (
              <button
                key={char.id}
                onClick={() => handleCardClick(char)}
                className={`w-full text-left p-3 rounded-2xl border-2 transition-all ${
                  openCardId === char.id
                    ? "border-[#C6FA98] bg-[#F2FEE6]"
                    : "border-gray-200 bg-white hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-semibold text-sm text-gray-800">
                    {char.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {char.age} · {char.personality}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {char.likeTags.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 bg-[#E5F5D8] text-green-700 rounded-full text-xs"
                    >
                      {t}
                    </span>
                  ))}
                  {char.warnTags.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 bg-[#FFF8D6] text-yellow-700 rounded-full text-xs"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 오른쪽 – 성격 카드 */}
        <div className="flex-1 flex flex-col min-w-0">
          <h2 className="font-bold text-gray-800 mb-3">성격 카드</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 items-start">
            {CHARACTERS.map((char) => {
              const isOpen = openCardId === char.id;
              return (
                /* 카드: 고정 높이, flex column — 이미지가 줄어들고 정보가 위로 확장 */
                <div
                  key={char.id}
                  className={`flex-shrink-0 w-[240px] md:w-[280px] h-[560px] flex flex-col rounded-[30px] overflow-hidden cursor-pointer transition-all shadow-sm ${
                    isOpen
                      ? "ring-2 ring-[#C6FA98] ring-offset-2 shadow-md"
                      : "hover:shadow-md"
                  }`}
                  onClick={() => handleCardClick(char)}
                >
                  {/* 퀘스트 — 고정 */}
                  <div className="flex-shrink-0 bg-white/95 px-4 pt-3 pb-2 text-center">
                    <p className="text-xs text-gray-400">퀘스트</p>
                    <p className="text-xs font-semibold text-gray-600">
                      {char.quest}
                    </p>
                  </div>

                  {/* 이미지 — flex-1: 정보 섹션이 커지면 이미지가 줄어듦 */}
                  <div className="flex-1 relative min-h-0">
                    <Image
                      src={char.cardImage}
                      alt={char.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* 정보 섹션 — 클릭하면 max-height 확장 → 위로 자라나는 효과 */}
                  <div
                    className={`flex-shrink-0 bg-white overflow-hidden transition-all duration-500 ease-in-out ${
                      isOpen ? "max-h-[420px]" : "max-h-[96px]"
                    }`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* 항상 보이는 이름/태그 — 클릭 토글 */}
                    <div
                      className="px-4 pt-2 pb-2 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCardClick(char);
                      }}
                    >
                      <div className="flex items-baseline gap-2 mt-3.5 mb-3.5">
                        <span className="font-semibold text-sm text-gray-800">
                          {char.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {char.age} · {char.personality}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {char.likeTags.map((t) => (
                          <span
                            key={t}
                            className="px-2.5 py-0.5 bg-[#E5F5D8] text-green-700 rounded-full text-xs"
                          >
                            {t}
                          </span>
                        ))}
                        {char.warnTags.map((t) => (
                          <span
                            key={t}
                            className="px-2.5 py-0.5 bg-[#FFF8D6] text-yellow-700 rounded-full text-xs"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* 상세 정보 — 열렸을 때 */}
                    <div className="px-4 pb-4 flex flex-col gap-2.5">
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">성격</p>
                        <p className="text-xs text-gray-700 leading-relaxed">
                          {char.description}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">말투</p>
                        <p className="text-xs text-gray-700 leading-relaxed">
                          {char.speechStyle}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-xs text-gray-400 mb-0.5">
                            좋아하는 것
                          </p>
                          <p className="text-xs text-gray-700">{char.likes}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-0.5">
                            특이사항
                          </p>
                          <p className="text-xs text-gray-700">
                            {char.specialNote}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">
                          싫어하는 것
                        </p>
                        <p className="text-xs text-gray-700">{char.dislikes}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartChat(char);
                        }}
                        className="w-full h-10 bg-[#E5F5D8] text-green-700 rounded-xl text-xs font-semibold hover:brightness-95 transition-all mt-1"
                      >
                        대화 시작하기
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
