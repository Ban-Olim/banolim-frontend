"use client";

import React, { useState } from 'react';
import Image from 'next/image';

// --- 타입 정의 ---
type WordType = 'subject' | 'time' | 'place' | 'action';

interface Word {
    id: number;
    text: string;
    type: WordType;
}

interface Slot {
    id: WordType;
    label: string;
    placeholder: string;
    color: string;
}

interface DragState {
    word: Word;
    from: 'bank' | WordType;
}

// --- 데이터 ---
const CORRECT_ANSWER = {
    subject: "나는",
    time: "어제",
    place: "공원에서",
    action: "친구를 만났어요"
};

const INITIAL_WORDS: Word[] = [
    { id: 1, text: "나는", type: "subject" },
    { id: 2, text: "어제", type: "time" },
    { id: 3, text: "공원에서", type: "place" },
    { id: 4, text: "친구를 만났어요", type: "action" },
];

const SLOTS: Slot[] = [
    { id: 'subject', label: '누가', placeholder: '주어', color: 'border-gray-300 bg-white' },
    { id: 'time', label: '언제', placeholder: '시간', color: 'border-gray-300 bg-white' },
    { id: 'place', label: '어디서', placeholder: '장소', color: 'border-gray-300 bg-white' },
    { id: 'action', label: '무엇을', placeholder: '행동', color: 'border-gray-300 bg-white' },
];

// --- 배경 컴포넌트 ---
const MeadowFooter = () => (
    <div className="fixed bottom-0 left-0 w-full h-[15vh] min-h-[120px] z-0 pointer-events-none overflow-hidden">
        <div className="absolute bottom-0 w-[120%] -left-[10%] h-full bg-[#E3F6D6] rounded-t-[50%] transform scale-x-125 translate-y-4" />
        <div className="absolute bottom-4 left-[5%] flex gap-2 sm:gap-6 items-end">
            <svg width="60" height="90" viewBox="0 0 40 60" className="text-[#B5E98C] transform -rotate-6">
                <path d="M20 60 L20 20" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
                <path d="M20 40 Q5 30 20 20 Q35 30 20 40" fill="#B5E98C" />
                <circle cx="20" cy="15" r="18" fill="#FFF5C8" />
                <circle cx="20" cy="15" r="8" fill="#FFC1CC" />
            </svg>
            <svg width="50" height="70" viewBox="0 0 40 60" className="text-[#A3D978] transform rotate-3">
                <path d="M20 60 L20 25" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
                <circle cx="20" cy="25" r="14" fill="white" />
                <circle cx="20" cy="25" r="7" fill="#FFE699" />
            </svg>
        </div>
        <div className="absolute bottom-4 right-[5%] flex gap-2 sm:gap-6 items-end">
            <svg width="55" height="85" viewBox="0 0 40 60" className="text-[#B5E98C] transform -rotate-3">
                <path d="M20 60 L20 20" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
                <circle cx="20" cy="20" r="18" fill="#B2EBF4" />
                <circle cx="20" cy="20" r="9" fill="white" />
            </svg>
            <svg width="70" height="100" viewBox="0 0 40 60" className="text-[#A3D978]">
                <path d="M20 60 L20 15" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
                <circle cx="20" cy="15" r="15" fill="#D4F1A1" />
                <circle cx="20" cy="15" r="7" fill="#FF9EAA" />
            </svg>
        </div>
    </div>
);

export default function PracticePage() {
    const [bankWords, setBankWords] = useState<Word[]>(INITIAL_WORDS);
    const [placedWords, setPlacedWords] = useState<Partial<Record<WordType, Word>>>({});
    const [modalState, setModalState] = useState<'none' | 'correct' | 'incorrect' | 'hint'>('none');
    const [isDictOpen, setIsDictOpen] = useState(false);
    const [draggedItem, setDraggedItem] = useState<DragState | null>(null);

    const handlePlayAudio = () => alert("🔊 소리 재생 기능 (추후 연결)");

    // 1. 드래그 시작
    const handleDragStart = (word: Word, from: 'bank' | WordType) => {
        setDraggedItem({ word, from });
    };

    // 2. [핵심 수정] 슬롯에 드롭 (교체 로직 포함)
    const handleDropOnSlot = (targetSlotId: WordType) => {
        if (!draggedItem) return;

        const { word: incomingWord, from: source } = draggedItem;
        const existingWord = placedWords[targetSlotId];

        // 같은 곳에 다시 놓으면 무시
        if (source === targetSlotId) {
            setDraggedItem(null);
            return;
        }

        // 상태 복사
        const newPlaced = { ...placedWords };
        let newBank = [...bankWords];

        // --- A. 출발지 처리 (일단 가져오기) ---
        if (source === 'bank') {
            newBank = newBank.filter(w => w.id !== incomingWord.id);
        } else {
            delete newPlaced[source]; // 출발 슬롯 비우기
        }

        // --- B. 도착지 처리 (넣기 & 교체) ---
        newPlaced[targetSlotId] = incomingWord; // 1. 새 단어 넣기

        if (existingWord) {
            // 2. 이미 있던 단어 처리 (교체)
            if (source === 'bank') {
                // 단어장에서 왔다면 -> 기존 단어는 단어장으로
                newBank.push(existingWord);
            } else {
                // 다른 슬롯에서 왔다면 -> 서로 교체 (Swap)
                newPlaced[source] = existingWord;
            }
        }

        // 상태 업데이트
        setPlacedWords(newPlaced);
        setBankWords(newBank);
        setDraggedItem(null);
    };

    // 3. 단어장에 드롭 (슬롯 -> 단어장 반환)
    const handleDropToBank = () => {
        if (!draggedItem) return;
        const { word, from } = draggedItem;

        if (from === 'bank') {
            setDraggedItem(null);
            return;
        }

        setPlacedWords(prev => {
            const newPlaced = { ...prev };
            delete newPlaced[from];
            return newPlaced;
        });

        setBankWords(prev => [...prev, word]);
        setDraggedItem(null);
    };

    const checkAnswer = () => {
        const isCorrect =
            placedWords.subject?.text === CORRECT_ANSWER.subject &&
            placedWords.time?.text === CORRECT_ANSWER.time &&
            placedWords.place?.text === CORRECT_ANSWER.place &&
            placedWords.action?.text === CORRECT_ANSWER.action;
        setModalState(isCorrect ? 'correct' : 'incorrect');
    };

    const resetGame = () => {
        setPlacedWords({});
        setBankWords(INITIAL_WORDS);
        setModalState('none');
    };

    const getWordColorClass = (type: WordType) => {
        switch (type) {
            case 'subject': return 'bg-[#FFF5C8] border-[#FFE699]';
            case 'time': return 'bg-[#D4F1A1] border-[#B5E98C]';
            case 'place': return 'bg-[#FFC1CC] border-[#FF9EAA]';
            case 'action': return 'bg-[#B2EBF4] border-[#8CDEE9]';
            default: return 'bg-white border-gray-200';
        }
    };

    return (
        <div className="min-h-screen bg-[#E6F4FF] flex flex-col items-center relative overflow-hidden font-sans">

            {/* 배경 */}
            <MeadowFooter />

            {/* --- 헤더 --- */}
            <header className="w-full max-w-7xl p-6 grid grid-cols-3 items-center z-10">
                <div className="justify-self-start relative w-36 h-20 sm:w-80 sm:h-40">
                    <Image
                        src="/logo.jpg"
                        alt="반올림 로고"
                        fill
                        className="object-contain"
                        style={{ mixBlendMode: 'multiply' }}
                        priority
                    />
                </div>
                <h1 className="justify-self-center text-3xl sm:text-4xl font-extrabold text-gray-700 whitespace-nowrap drop-shadow-sm">
                    문장 분해 연습
                </h1>
                <button
                    onClick={() => window.location.href = '/'}
                    className="justify-self-end w-12 h-12 flex items-center justify-center rounded-full bg-white/50 hover:bg-white text-gray-400 hover:text-gray-600 text-3xl font-light transition-all shadow-sm"
                >
                    ✖
                </button>
            </header>

            {/* --- 메인 콘텐츠 --- */}
            <main className="w-full max-w-6xl flex-1 flex flex-col items-center p-4 z-10 pb-32">

                {/* 문제 영역 */}
                <div className="w-full max-w-4xl bg-[#EAFADC] border-4 border-[#D4F1A1] rounded-[30px] px-8 py-6 shadow-md mb-12 flex flex-col sm:flex-row items-center justify-center gap-6 relative mt-8 text-center">
                    <span className="text-2xl sm:text-3xl font-bold text-gray-700 break-keep">
                        나는 어제 공원에서 친구를 만났어요
                    </span>
                    <button
                        onClick={handlePlayAudio}
                        className="group flex-shrink-0 flex items-center justify-center gap-2 bg-white px-5 py-3 rounded-2xl shadow-sm border-2 border-[#D4F1A1] hover:bg-[#B5E98C] hover:text-white hover:border-[#B5E98C] transition-all cursor-pointer"
                    >
                        <span className="text-2xl group-hover:scale-110 transition-transform">🔊</span>
                        <span className="font-bold text-gray-600 group-hover:text-white">듣기</span>
                    </button>
                </div>

                {/* 드롭 존 (슬롯) */}
                <div className="w-full max-w-5xl bg-white/60 backdrop-blur-md rounded-[50px] p-8 sm:p-12 shadow-2xl border-2 border-white/80 mb-8">

                    {/* 슬롯 영역 */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-16">
                        {SLOTS.map((slot) => (
                            <div
                                key={slot.id}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={() => handleDropOnSlot(slot.id)}
                                className={`h-32 sm:h-40 rounded-3xl border-4 flex items-center justify-center relative transition-all ${slot.color} ${placedWords[slot.id] ? 'border-solid shadow-inner' : 'border-dashed'}`}
                            >
                                {placedWords[slot.id] ? (
                                    // 슬롯에 있는 단어도 드래그 가능 (교체 위해)
                                    <div
                                        draggable
                                        onDragStart={() => handleDragStart(placedWords[slot.id]!, slot.id)}
                                        className={`w-[90%] h-[80%] rounded-2xl flex items-center justify-center shadow-lg cursor-grab active:cursor-grabbing font-bold text-xl sm:text-2xl text-gray-800 border-2 hover:scale-105 transition-transform ${getWordColorClass(placedWords[slot.id]!.type)}`}
                                    >
                                        {placedWords[slot.id]!.text}
                                    </div>
                                ) : (
                                    <span className="text-gray-300 font-bold text-2xl">{slot.placeholder}</span>
                                )}

                                <div className="absolute -top-5 sm:-top-6 left-1/2 transform -translate-x-1/2 bg-white px-5 py-2 rounded-full text-gray-600 font-bold text-sm sm:text-base shadow-sm border border-gray-100 whitespace-nowrap">
                                    {slot.label}
                                </div>
                            </div>
                        ))}
                    </div>

                    <p className="text-center text-gray-500 mb-8 font-medium text-lg">
                        아래 단어를 끌어서 빈칸을 채워보세요!
                    </p>

                    {/* 단어 뱅크 */}
                    <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDropToBank}
                        className="flex justify-center gap-4 flex-wrap min-h-[120px] items-center bg-[#f0f9ff]/50 p-6 rounded-3xl border border-blue-100/50 transition-colors hover:bg-[#f0f9ff]/80"
                    >
                        {bankWords.length === 0 && Object.keys(placedWords).length > 0 && (
                            <p className="text-gray-400 text-sm">빈칸에서 단어를 끌어와 다시 놓을 수 있어요</p>
                        )}

                        {bankWords.map((word) => (
                            <div
                                key={word.id}
                                draggable
                                onDragStart={() => handleDragStart(word, 'bank')}
                                className={`
                  px-8 py-4 rounded-2xl font-bold text-xl sm:text-2xl text-gray-700 shadow-md cursor-grab active:cursor-grabbing transform hover:-translate-y-1 hover:shadow-lg transition-all border-b-4 active:border-b-0 active:translate-y-1 active:shadow-none
                  ${getWordColorClass(word.type)}
                `}
                            >
                                {word.text}
                            </div>
                        ))}
                    </div>
                </div>

                {/* 하단 버튼 컨트롤 */}
                <div className="flex gap-4 sm:gap-6 w-full max-w-4xl justify-center">
                    <button onClick={checkAnswer} className="flex-1 max-w-[200px] bg-[#FFC1CC] text-white font-bold text-xl py-4 rounded-2xl shadow-[0_6px_0_#FF9EAA] hover:translate-y-1 hover:shadow-[0_2px_0_#FF9EAA] transition-all">
                        제출하기
                    </button>
                    <button onClick={() => setModalState('hint')} className="flex-1 max-w-[200px] bg-[#FFE699] text-gray-700 font-bold text-xl py-4 rounded-2xl shadow-[0_6px_0_#F0C040] hover:translate-y-1 hover:shadow-[0_2px_0_#F0C040] transition-all">
                        힌트보기
                    </button>
                    <button onClick={() => setIsDictOpen(true)} className="flex-1 max-w-[200px] bg-white text-gray-600 font-bold text-xl py-4 rounded-2xl shadow-[0_6px_0_#E5E7EB] border-2 border-gray-100 hover:translate-y-1 hover:shadow-[0_2px_0_#E5E7EB] transition-all">
                        단어검색
                    </button>
                </div>

            </main>

            {/* 모달 및 사이드바 (변경 없음) */}
            {modalState !== 'none' && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-[40px] p-10 max-w-md w-full shadow-2xl flex flex-col items-center animate-bounce-in relative text-center">
                        <button onClick={() => setModalState('none')} className="absolute top-6 right-6 text-gray-400 hover:text-gray-800 text-2xl">✕</button>
                        {modalState === 'correct' && (
                            <>
                                <div className="text-8xl mb-6 animate-pulse">🎉</div>
                                <h2 className="text-4xl font-extrabold text-gray-800 mb-2">정답입니다!</h2>
                                <p className="text-xl text-gray-500 mb-8">정말 대단해요!</p>
                                <button onClick={resetGame} className="w-full bg-[#D4F1A1] text-gray-800 font-bold text-xl py-4 rounded-2xl shadow-md hover:bg-[#bbf085]">다음 문제</button>
                            </>
                        )}
                        {modalState === 'incorrect' && (
                            <>
                                <div className="text-8xl mb-6 animate-shake">😵</div>
                                <h2 className="text-4xl font-extrabold text-gray-800 mb-2">아쉬워요!</h2>
                                <p className="text-xl text-gray-500 mb-8">다시 한 번 도전해볼까요?</p>
                                <button onClick={() => setModalState('none')} className="w-full bg-[#FFC1CC] text-white font-bold text-xl py-4 rounded-2xl shadow-md hover:bg-[#ff9eaa]">다시 하기</button>
                            </>
                        )}
                        {modalState === 'hint' && (
                            <>
                                <div className="text-7xl mb-4">💡</div>
                                <h2 className="text-3xl font-bold text-gray-800 mb-6">힌트 카드</h2>
                                <div className="text-gray-700 space-y-4 mb-8 text-lg bg-gray-50 p-6 rounded-3xl w-full border border-gray-100 text-left">
                                    <div className="flex items-center gap-3"><span className="w-3 h-3 rounded-full bg-yellow-400 shrink-0"></span> <strong>주어:</strong> 누가 했나요?</div>
                                    <div className="flex items-center gap-3"><span className="w-3 h-3 rounded-full bg-green-400 shrink-0"></span> <strong>시간:</strong> 언제 했나요?</div>
                                    <div className="flex items-center gap-3"><span className="w-3 h-3 rounded-full bg-pink-400 shrink-0"></span> <strong>장소:</strong> 어디서 했나요?</div>
                                    <div className="flex items-center gap-3"><span className="w-3 h-3 rounded-full bg-blue-400 shrink-0"></span> <strong>행동:</strong> 무엇을 했나요?</div>
                                </div>
                                <button onClick={() => setModalState('none')} className="w-full bg-[#FFE699] text-gray-800 font-bold text-xl py-4 rounded-2xl shadow-md hover:bg-[#fddb76]">닫기</button>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* 단어장 사이드바 */}
            <div className={`fixed top-0 right-0 h-full w-[400px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ${isDictOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="p-8 h-full flex flex-col">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-800">단어장</h2>
                        <button onClick={() => setIsDictOpen(false)} className="text-gray-400 hover:text-gray-600 text-3xl">✖</button>
                    </div>
                    <div className="relative mb-8">
                        <input type="text" placeholder="단어 검색..." className="w-full bg-gray-100 rounded-2xl px-5 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-[#B5E98C]" />
                        <button className="absolute right-2 top-2 bottom-2 bg-[#D4F1A1] px-4 rounded-xl font-bold text-gray-700 hover:bg-[#c3e895]">검색</button>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-4">
                        <div className="bg-white p-5 rounded-2xl border-2 border-gray-100 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xl font-bold text-gray-800">공원</span>
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-md font-bold">장소</span>
                            </div>
                            <p className="text-gray-600">사람들이 쉴 수 있도록 만든 곳.</p>
                        </div>
                    </div>
                </div>
            </div>
            {isDictOpen && <div onClick={() => setIsDictOpen(false)} className="fixed inset-0 bg-black/20 z-40" />}

            <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.3s ease-in-out; }
        .animate-bounce-in { animation: bounce-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        @keyframes bounce-in { 0% { transform: scale(0.8); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
      `}</style>
        </div>
    );
}