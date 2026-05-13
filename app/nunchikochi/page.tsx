"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import DictionarySidebar from "../../components/dictionary/DictionarySidebar";
import { api, CharacterListItem, CharacterDetail } from "../../lib/api";

// 카드 배경/이미지 기본값 (API에서 미제공 시)
const CARD_BG = [
  "bg-[#E5F5D8]",
  "bg-[#FFD0D5]",
  "bg-[#E1FCFF]",
  "bg-[#FFF8D6]",
];
const CARD_IMAGES = [
  "/images/charactercard1.png",
  "/images/charactercard2.png",
  "/images/charactercard3.png",
  "/images/charactercard4.png",
];

function withDefaults(
  item: CharacterListItem,
  index: number,
): CharacterListItem {
  return {
    cardBg: CARD_BG[index % CARD_BG.length],
    cardImage: CARD_IMAGES[index % CARD_IMAGES.length],
    ...item,
  };
}

interface Message {
  id: string;
  sender: "character" | "user";
  text: string;
  isTyping?: boolean;
  audioUrl?: string | null;
}

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
      <div className="w-36 h-14 relative scale-125 origin-left">
        <Image
          src="/logo.jpg"
          alt="로고"
          fill
          className="object-contain"
          style={{ mixBlendMode: "multiply" }}
        />
      </div>
      <h1 className="font-display text-xl font-bold text-gray-700">{title}</h1>
      <button onClick={onClose} className="flex-shrink-0">
        <Image src="/images/close.png" alt="닫기" width={32} height={32} />
      </button>
    </header>
  );
}

export default function NunchikochePage() {
  const router = useRouter();
  const [view, setView] = useState<"selection" | "chat">("selection");
  const [openCardId, setOpenCardId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isListOpen, setIsListOpen] = useState(true);
  const [isDictOpen, setIsDictOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [moodPercent, setMoodPercent] = useState(30);
  const [inputText, setInputText] = useState("");
  const [chatChar, setChatChar] = useState<CharacterListItem | null>(null);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [characterDetails, setCharacterDetails] = useState<
    Record<number, CharacterDetail>
  >({});
  const [scoreDiff, setScoreDiff] = useState<number | null>(null);
  const prevMoodRef = useRef<number>(30);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // 캐릭터 목록 조회
  const { data: rawCharacters = [], isLoading: isLoadingChars } = useQuery({
    queryKey: ["characters"],
    queryFn: api.getCharacters,
  });

  const characters = rawCharacters.map(withDefaults);

  // 메시지 추가 시 자동 스크롤 (레이아웃 이동 없이 즉시)
  useEffect(() => {
    const el = messagesContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  // 점수 변화 감지 (메시지 응답 후에만)
  useEffect(() => {
    const diff = moodPercent - prevMoodRef.current;
    prevMoodRef.current = moodPercent;
    if (diff > 0) {
      setScoreDiff(diff);
      const t = setTimeout(() => setScoreDiff(null), 1500);
      return () => clearTimeout(t);
    }
  }, [moodPercent]);

  // 카드 열릴 때 캐릭터 상세 조회
  useEffect(() => {
    if (openCardId === null) return;
    if (characterDetails[openCardId]) return;
    api
      .getCharacter(openCardId)
      .then((detail) =>
        setCharacterDetails((prev) => ({ ...prev, [openCardId]: detail })),
      )
      .catch(console.error);
  }, [openCardId, characterDetails]);

  const filteredChars = characters.filter(
    (c) =>
      !searchQuery ||
      c.name.includes(searchQuery) ||
      c.personalityLabel.includes(searchQuery) ||
      [...(c.likeTags ?? []), ...(c.warningTag ? [c.warningTag] : [])].some(
        (t) => t.includes(searchQuery),
      ),
  );

  const handleSend = async () => {
    if (!inputText.trim() || sessionId === null || isSending) return;
    const userText = inputText;
    setInputText("");
    setIsSending(true);

    setMessages((prev) => [
      ...prev,
      { id: `u${Date.now()}`, sender: "user", text: userText },
      { id: `c${Date.now()}`, sender: "character", text: "", isTyping: true },
    ]);

    try {
      const res = await api.sendMessage(sessionId, userText);
      const newMood = res.temperature;
      setMoodPercent(newMood);
      setMessages((prev) =>
        prev.map((m) =>
          m.isTyping
            ? {
                ...m,
                text: res.message,
                isTyping: false,
                audioUrl: res.audioUrl,
              }
            : m,
        ),
      );
      if (newMood >= 100) setTimeout(() => setShowSuccess(true), 300);
    } catch (e) {
      console.error("[sendMessage error]", e);
      setMessages((prev) =>
        prev.map((m) =>
          m.isTyping
            ? { ...m, text: "응답에 실패했습니다.", isTyping: false }
            : m,
        ),
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleStartChat = async (char: CharacterListItem) => {
    console.log("[handleStartChat] called", char.characterId);
    setChatChar(char);
    setMoodPercent(30);
    setSessionId(null);
    setMessages([
      { id: "loading", sender: "character", text: "", isTyping: true },
    ]);
    setOpenCardId(null);
    setView("chat");

    try {
      const res = await api.createSession(char.characterId);
      console.log("[createSession] raw response", res);
      const { sessionId: sid, messages: initMessages, temperature } = res;
      console.log(
        "[createSession] sid:",
        sid,
        "msgs:",
        initMessages,
        "temp:",
        temperature,
      );
      setSessionId(sid);
      const initTemp = temperature ?? 30;
      prevMoodRef.current = initTemp;
      setMoodPercent(initTemp);
      setMessages(
        (initMessages ?? []).map((m) => ({
          id: `chat-${m.chatId}`,
          sender:
            m.speaker === "BOT" ? ("character" as const) : ("user" as const),
          text: m.message,
          audioUrl: m.audioUrl,
        })),
      );
    } catch (e) {
      console.error("[createSession error]", e);
      setMessages([
        { id: "err", sender: "character", text: "세션을 시작하지 못했습니다." },
      ]);
    }
  };

  const handleCardClick = (char: CharacterListItem) => {
    setOpenCardId((prev) =>
      prev === char.characterId ? null : char.characterId,
    );
  };

  // ─── 채팅 ─────────────────────────────────────────────────────────────────
  if (view === "chat" && chatChar) {
    return (
      <main
        className="h-screen flex flex-col relative overflow-hidden"
        style={{
          backgroundImage: "url('/nunchikochi_bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <BackgroundDecorations />

        {/* 점수 표시: 뷰포트 고정 → 스크롤해도 항상 상단에 */}
        <AnimatePresence>
          {scoreDiff !== null && (
            <motion.div
              key={String(moodPercent)}
              initial={{ opacity: 0, y: -8, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.85 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="fixed top-5 left-0 right-0 z-50 flex justify-center pointer-events-none"
            >
              <span className="bg-[#18181b] text-white text-xs font-semibold tracking-wide px-4 py-1.5 rounded-full shadow-lg">
                +{scoreDiff}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <PageHeader title="눈치코치" onClose={() => setView("selection")} />

        <div className="flex-1 mx-3 mb-3 bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm flex flex-col overflow-hidden z-10 min-h-0">
          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "items-start gap-3"}`}
                >
                  {msg.sender === "character" && (
                    <div className="flex flex-col items-center gap-1 flex-shrink-0">
                      <div className="w-12 h-12 rounded-full overflow-hidden">
                        <Image
                          src={chatChar.cardImage ?? CARD_IMAGES[0]}
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
                        <button
                          className="flex-shrink-0"
                          onClick={() => {
                            if (msg.audioUrl) new Audio(msg.audioUrl).play();
                          }}
                        >
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
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="border-t border-gray-100 p-4 flex flex-col gap-3">
            <div className="flex gap-2">
              <input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  !e.nativeEvent.isComposing &&
                  handleSend()
                }
                placeholder="입력해주세요"
                disabled={isSending || sessionId === null}
                className="flex-1 h-16 px-5 rounded-full bg-[#FAFAFA] border border-[#BABABA] shadow-[8px_8px_8px_rgba(94,94,94,0.04)] focus:outline-none focus:border-[#C6FA98] text-sm disabled:opacity-60"
              />
              <button
                onClick={handleSend}
                disabled={isSending || sessionId === null}
                className="h-16 px-5 border border-gray-300 rounded-full text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap disabled:opacity-60"
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
      <PageHeader title="눈치코치" onClose={() => router.push("/main")} />

      <div className="flex gap-3 mx-3 mb-3 z-10 flex-1 min-h-0">
        {/* 왼쪽 – 성격 목록 */}
        <div
          className={`bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm flex flex-col gap-3 overflow-hidden flex-shrink-0 transition-all duration-300
            ${isListOpen ? "w-64 md:w-80 p-5" : "w-12 p-3"}`}
        >
          <div className="flex items-center justify-between min-w-0">
            {isListOpen && (
              <h2 className="font-bold text-gray-800">성격 목록</h2>
            )}
            <button
              onClick={() => setIsListOpen((v) => !v)}
              className={`w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 text-sm transition-colors flex-shrink-0
                ${isListOpen ? "ml-auto" : "mx-auto"}`}
              aria-label={isListOpen ? "목록 닫기" : "목록 열기"}
            >
              {isListOpen ? "✕" : "☰"}
            </button>
          </div>

          {isListOpen && (
            <>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/search.png"
                    alt="search"
                    className="w-4 h-4"
                    style={{ mixBlendMode: "multiply" }}
                  />
                </span>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="검색 (예: 소심, 공룡)"
                  className="w-full h-11 pl-8 pr-3 bg-white border border-[#ECECEC] rounded-xl text-sm focus:outline-none focus:border-[#C6FA98]"
                />
              </div>

              <div className="flex flex-col gap-2 overflow-y-auto flex-1">
                {isLoadingChars ? (
                  <p className="text-sm text-gray-400 text-center py-4">
                    불러오는 중...
                  </p>
                ) : (
                  filteredChars.map((char) => (
                    <button
                      key={char.characterId}
                      onClick={() => handleCardClick(char)}
                      className={`w-full text-left p-3 rounded-2xl border-2 transition-all ${
                        openCardId === char.characterId
                          ? "border-[#C6FA98] bg-[#F2FEE6]"
                          : "border-gray-200 bg-white hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="font-semibold text-sm text-gray-800">
                          {char.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {char.age}세 · {char.personalityLabel}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {(char.likeTags ?? []).map((t) => (
                          <span
                            key={t}
                            className="px-2 py-0.5 bg-[#E5F5D8] text-green-700 rounded-full text-xs"
                          >
                            {t}
                          </span>
                        ))}
                        {char.warningTag && (
                          <span className="px-2 py-0.5 bg-[#FFF8D6] text-yellow-700 rounded-full text-xs">
                            {char.warningTag}
                          </span>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        {/* 오른쪽 – 성격 카드 */}
        <div className="flex-1 flex flex-col min-w-0">
          <h2 className="font-bold text-gray-800 mb-3">성격 카드</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 items-start">
            {characters.map((char, index) => {
              const isOpen = openCardId === char.characterId;
              const detail = characterDetails[char.characterId];
              return (
                <div
                  key={char.characterId}
                  className={`flex-shrink-0 w-[240px] md:w-[280px] h-[560px] flex flex-col rounded-[30px] overflow-hidden cursor-pointer transition-all shadow-sm ${
                    isOpen
                      ? "ring-2 ring-[#C6FA98] ring-offset-2 shadow-md"
                      : "hover:shadow-md"
                  }`}
                  onClick={() => handleCardClick(char)}
                >
                  {/* 퀘스트 */}
                  <div className="flex-shrink-0 bg-white/95 px-4 pt-3 pb-2 text-center">
                    <p className="text-xs text-gray-400">퀘스트</p>
                    <p className="text-xs font-semibold text-gray-600">
                      마음 온도계 100%로 채우기
                    </p>
                  </div>

                  {/* 이미지 */}
                  <div className="flex-1 relative min-h-0">
                    <Image
                      src={
                        char.cardImage ??
                        CARD_IMAGES[index % CARD_IMAGES.length]
                      }
                      alt={char.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* 정보 섹션 */}
                  <div
                    className={`flex-shrink-0 bg-white overflow-hidden transition-all duration-500 ease-in-out ${
                      isOpen ? "max-h-[420px]" : "max-h-[96px]"
                    }`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* 항상 보이는 이름/태그 */}
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
                          {char.age}세 · {char.personalityLabel}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {(char.likeTags ?? []).map((t) => (
                          <span
                            key={t}
                            className="px-2.5 py-0.5 bg-[#E5F5D8] text-green-700 rounded-full text-xs"
                          >
                            {t}
                          </span>
                        ))}
                        {char.warningTag && (
                          <span className="px-2.5 py-0.5 bg-[#FFF8D6] text-yellow-700 rounded-full text-xs">
                            {char.warningTag}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 상세 정보 */}
                    <div className="px-4 pb-4 flex flex-col gap-2.5">
                      {!detail && isOpen ? (
                        <p className="text-xs text-gray-400">불러오는 중...</p>
                      ) : detail ? (
                        <>
                          <div>
                            <p className="text-xs text-gray-400 mb-0.5">성격</p>
                            <p className="text-xs text-gray-700 leading-relaxed">
                              {detail.personality}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 mb-0.5">말투</p>
                            <p className="text-xs text-gray-700 leading-relaxed">
                              {detail.speechStyle}
                            </p>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <p className="text-xs text-gray-400 mb-0.5">
                                좋아하는 것
                              </p>
                              <p className="text-xs text-gray-700">
                                {detail.likeTags.join(", ")}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400 mb-0.5">
                                특이사항
                              </p>
                              <p className="text-xs text-gray-700">
                                {detail.specialNote}
                              </p>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 mb-0.5">
                              싫어하는 것
                            </p>
                            <p className="text-xs text-gray-700">
                              {detail.dislikeTags.join(", ")}
                            </p>
                          </div>
                        </>
                      ) : null}
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
