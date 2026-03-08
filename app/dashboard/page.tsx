"use client";

import React, { useState } from 'react';

// --- 타입 정의 ---
type WordType = 'subject' | 'time' | 'place' | 'action';

interface Word {
    text: string;
    type: WordType;
}

interface IncorrectNote {
    id: number;
    question: string;
    correctAnswer: string;
    attempts: Word[][];
}

interface ChatMessage {
    id: number;
    sender: 'bot' | 'user';
    text: string;
}

interface ChatLog {
    id: number;
    name: string;
    messages: ChatMessage[];
    age: string;
    trait: string;
    tags: string[];
}

// --- 더미 데이터 ---
const INCORRECT_NOTES: IncorrectNote[] = [
    {
        id: 1, question: "나는 어제 공원에서 친구를 만났어요", correctAnswer: "나는 어제 공원에서 친구를 만났어요", attempts: [
            [{ text: "나는", type: "subject" }, { text: "공원에서", type: "place" }, { text: "친구를 만났어요", type: "action" }, { text: "어제", type: "time" }],
        ]
    },
    { id: 2, question: "내일까지 학교에 딱풀을 가져가야 해요", correctAnswer: "내일까지 학교에 딱풀을 가져가야 해요", attempts: [] },
    { id: 3, question: "오늘은 날씨가 매우 맑고 따뜻해요", correctAnswer: "오늘은 날씨가 매우 맑고 따뜻해요", attempts: [] },
    { id: 4, question: "저녁에 가족들과 맛있는 피자를 먹었어요", correctAnswer: "저녁에 가족들과 맛있는 피자를 먹었어요", attempts: [] },
    { id: 5, question: "주말에는 도서관에서 책을 빌릴 거예요", correctAnswer: "주말에는 도서관에서 책을 빌릴 거예요", attempts: [] },
    { id: 6, question: "동생이랑 같이 자전거를 탔어요", correctAnswer: "동생이랑 같이 자전거를 탔어요", attempts: [] },
    { id: 7, question: "어제 본 영화는 정말 재미있었어요", correctAnswer: "어제 본 영화는 정말 재미있었어요", attempts: [] },
];

const CHAT_LOGS: ChatLog[] = [
    {
        id: 1, name: "김철수", age: "10세", trait: "소심", tags: ["공룡", "로봇", "큰소리 주의"], messages: [
            { id: 1, sender: 'bot', text: "가나다라가나다라가나다라" }, { id: 2, sender: 'user', text: "무슨 일 있었어?" }
        ]
    },
    { id: 2, name: "박하린", age: "11세", trait: "활발", tags: ["친구 사귀기", "게임"], messages: [] },
    { id: 3, name: "이준호", age: "10세", trait: "꼼꼼", tags: ["레고", "퍼즐"], messages: [] },
    { id: 4, name: "최민지", age: "9세", trait: "호기심 많음", tags: ["우주", "그림 그리기"], messages: [] },
];

const getWordColorClass = (type: WordType) => {
    switch (type) {
        case 'subject': return 'border-[#FFE699] bg-[#FFFDE8] text-gray-800';
        case 'time': return 'border-[#CEFA93] bg-[#F2FEE5] text-gray-800';
        case 'place': return 'border-[#FFC1CC] bg-[#FFECEB] text-gray-800';
        case 'action': return 'border-[#7DF3FF] bg-[#E0F7FA] text-gray-800';
        default: return 'border-gray-200 bg-white';
    }
};

// [수정] 뚜렷하고 선명한 구름 모양을 만들기 위한 컴포넌트 추가
const Cloud = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 100 60" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="35" r="15" />
        <circle cx="40" cy="25" r="20" />
        <circle cx="65" cy="25" r="22" />
        <circle cx="85" cy="35" r="15" />
        <rect x="20" y="30" width="65" height="20" />
    </svg>
);

export default function DashboardPage() {
    const [selectedNote, setSelectedNote] = useState<IncorrectNote | null>(null);
    const [selectedChat, setSelectedChat] = useState<ChatLog | null>(null);

    const [selectedYear, setSelectedYear] = useState(2026);
    const [selectedMonth, setSelectedMonth] = useState(3);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const attendanceDays = [2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 16, 17, 18, 19, 20, 23, 24, 25, 26, 27, 30, 31];

    const getCalendarDays = (year: number, month: number) => {
        const firstDay = new Date(year, month - 1, 1).getDay();
        const daysInMonth = new Date(year, month, 0).getDate();
        const days = [];
        for (let i = 0; i < firstDay; i++) days.push(null);
        for (let i = 1; i <= daysInMonth; i++) days.push(i);
        while (days.length < 35) days.push(null);
        return days.slice(0, 35);
    };

    const calendarDays = getCalendarDays(selectedYear, selectedMonth);

    return (
        // 배경: 화사한 연노랑
        <div className="h-screen bg-[#FFFBEB] flex flex-col items-center py-5 px-8 relative font-sans overflow-hidden">

            {/* [수정] 뿌연 효과(blur)를 완전히 지우고, 뚜렷한 갈색(베이지) 구름들을 뒷배경으로 배치 */}
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                <Cloud className="absolute top-[5%] left-[5%] w-[300px] text-[#E8D29C] opacity-80" />
                <Cloud className="absolute -top-[5%] right-[20%] w-[450px] text-[#E8D29C] opacity-80" />
                <Cloud className="absolute top-[40%] -right-[5%] w-[350px] text-[#E8D29C] opacity-80" />
                <Cloud className="absolute bottom-[5%] left-[25%] w-[400px] text-[#E8D29C] opacity-80" />
                <Cloud className="absolute -bottom-[10%] right-[30%] w-[550px] text-[#E8D29C] opacity-80" />
                <Cloud className="absolute top-[60%] -left-[10%] w-[350px] text-[#E8D29C] opacity-80" />
            </div>

            {/* --- 상단 헤더 --- */}
            <header className="w-full max-w-[1500px] bg-white rounded-full py-3 px-6 flex justify-between items-center shadow-sm z-10 mb-5 shrink-0 border border-gray-100">
                <div className="bg-[#CEFA93] text-green-900 font-extrabold px-8 py-2.5 rounded-full text-sm">
                    로고
                </div>
                <div className="font-extrabold text-xl text-gray-700 tracking-wide">
                    대시보드
                </div>
                <button onClick={() => window.location.href = '/'} className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:bg-gray-50 transition-colors">
                    ✕
                </button>
            </header>

            {/* --- 메인 보드 (순백색 바탕) --- */}
            <main className="w-full max-w-[1500px] bg-white rounded-[36px] p-6 lg:p-8 shadow-[0_4px_30px_rgba(0,0,0,0.04)] flex flex-col lg:flex-row gap-8 z-10 flex-1 min-h-0 relative border border-gray-100">

                {/* ========================================= */}
                {/* 1. 왼쪽 영역 (학습 달력) - flex-[1.2] */}
                {/* ========================================= */}
                <section className="w-full lg:flex-[1.2] flex flex-col h-full min-h-0 relative z-10 bg-white">

                    <div className="flex justify-between items-end mb-6 shrink-0 px-2 mt-2">
                        <div className="flex items-center gap-2">
                            <span className="text-[#FBBF24] text-xl">📅</span>
                            <h2 className="text-[17px] font-extrabold text-gray-800">학습 달력</h2>
                            {/* 연속 5일 배지 */}
                            <span className="ml-2 bg-[#FFFBEB] border border-[#FDE047] text-[#D97706] text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm flex items-center">
                                연속 5일 🔥
                            </span>
                        </div>

                        {/* 드롭다운 메뉴 */}
                        <div className="flex items-center gap-2 text-gray-700">
                            <span className="font-extrabold text-[15px]">{selectedYear}년</span>
                            <div className="relative">
                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className={`flex items-center gap-1.5 bg-[#F8F9FA] px-3.5 py-1.5 rounded-[10px] text-gray-600 transition-colors ${isDropdownOpen ? 'border border-gray-200 shadow-sm' : 'border border-transparent'}`}
                                >
                                    <span className="text-[14px] font-extrabold">{selectedMonth}월</span>
                                    <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path>
                                    </svg>
                                </button>

                                {isDropdownOpen && (
                                    <>
                                        <div className="fixed inset-0 z-30" onClick={() => setIsDropdownOpen(false)}></div>
                                        <div className="absolute top-[110%] right-0 w-[80px] bg-white border border-gray-100 rounded-[12px] shadow-lg z-40 py-2 flex flex-col max-h-[250px] overflow-y-auto custom-scrollbar">
                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (
                                                <button key={m} onClick={() => { setSelectedMonth(m); setIsDropdownOpen(false); }} className={`w-full text-center py-2 text-[13px] font-bold transition-colors ${selectedMonth === m ? 'text-gray-900 bg-gray-50' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
                                                    {m}월
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-3 text-center mb-3 shrink-0">
                        {['일', '월', '화', '수', '목', '금', '토'].map((day, idx) => (
                            <div key={day} className="flex justify-center items-center font-bold text-sm">
                                {idx === 1 ? (
                                    <div className="bg-[#FDE047] w-8 h-8 rounded-full flex items-center justify-center text-yellow-900 shadow-sm">
                                        {day}
                                    </div>
                                ) : (
                                    <span className="text-gray-400">{day}</span>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* 달력 그리드 */}
                    <div className="grid grid-cols-7 grid-rows-5 gap-3 flex-1 min-h-0">
                        {calendarDays.map((date, i) => {
                            const isAttended = date && attendanceDays.includes(date);
                            return (
                                <div key={i} className={`relative w-full aspect-square rounded-[14px] flex items-center justify-center bg-white
                   ${date ? 'border-[2px] border-[#EAF5D4]' : 'border-2 border-transparent'}
                 `}>

                                    {date && (
                                        <span className="absolute top-1.5 left-2 sm:top-2 sm:left-2.5 text-[11px] sm:text-[13px] font-extrabold text-gray-300 z-10">
                                            {date}
                                        </span>
                                    )}

                                    {isAttended && (
                                        <div className="absolute inset-0 m-auto w-[82%] h-[82%] rounded-full bg-[#F2FEE5] border-[3px] border-[#CEFA93] flex flex-col items-center justify-center shadow-sm z-20">
                                            <span className="text-[#65A30D] font-extrabold text-[10px] sm:text-[11px] xl:text-[12px] leading-tight mt-0.5">출석</span>
                                            <span className="text-[#65A30D] font-extrabold text-[10px] sm:text-[11px] xl:text-[12px] leading-tight">체크</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* ========================================= */}
                {/* 2. 중앙 영역 (오답노트 & 챗봇 로그) - flex-[1] */}
                {/* ========================================= */}
                <section className="w-full lg:flex-[1] flex flex-col gap-6 h-full min-h-0 px-2 lg:px-0 z-10">

                    {/* 오답노트 */}
                    <div className="flex flex-col flex-1 min-h-0">
                        <div className="shrink-0 mb-2">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[#FBBF24] text-[22px]">📝</span>
                                <h2 className="text-[17px] font-extrabold text-gray-800">오답노트</h2>
                            </div>
                            <p className="text-[11px] text-gray-400 mb-4 ml-8 font-medium">내가 틀렸던 문제를 보여줘요!</p>
                            <div className="text-[12px] font-bold text-gray-400 mb-3 ml-2 border-b border-gray-50 pb-2">문장 분해 문제</div>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 flex flex-col gap-2.5">
                            {INCORRECT_NOTES.map((note, idx) => (
                                <button key={note.id} onClick={() => setSelectedNote(note)} className="flex items-center gap-3 w-full group shrink-0">
                                    <div className="w-[26px] h-[26px] rounded-full bg-[#FFE4E6] text-[#EF4444] text-[11px] font-extrabold flex items-center justify-center shrink-0">
                                        {idx + 1}
                                    </div>
                                    <div className="bg-[#F8F9FA] text-gray-600 font-bold text-[12px] px-4 py-3 rounded-[14px] flex-1 text-left truncate group-hover:bg-[#F1F3F5] transition-colors border border-transparent">
                                        {note.question}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="border-b border-gray-100 w-full shrink-0"></div>

                    {/* 챗봇 로그내역 */}
                    <div className="flex flex-col flex-[0.8] min-h-0">
                        <div className="shrink-0 flex items-center gap-2 mb-4">
                            <span className="text-[#FBBF24] text-[22px]">💬</span>
                            <h2 className="text-[17px] font-extrabold text-gray-800">챗봇 로그내역</h2>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 flex flex-col gap-3 pb-1">
                            {CHAT_LOGS.map((log) => (
                                <div key={log.id} className="border border-gray-100 rounded-[20px] p-4.5 shrink-0 bg-white shadow-sm">
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="flex items-center gap-2.5">
                                            <span className="font-extrabold text-[14px] text-gray-800">{log.name}</span>
                                            <span className="text-[11px] text-gray-400 font-medium bg-[#F8F9FA] px-2.5 py-0.5 rounded-full">{log.age} · {log.trait}</span>
                                        </div>
                                        <button onClick={() => setSelectedChat(log)} className="border border-[#D4F1A1] bg-[#F7FEE7] hover:bg-[#ECFCCB] text-[#65A30D] font-bold text-[10px] px-3.5 py-1.5 rounded-[10px] transition-colors shrink-0">
                                            대화 내역 보기
                                        </button>
                                    </div>
                                    <div className="flex gap-1.5 flex-wrap">
                                        {log.tags.map(tag => (
                                            <span key={tag} className={`border bg-white text-[10px] font-extrabold px-3 py-1 rounded-full ${tag === '큰소리 주의' ? 'border-[#FECDD3] text-[#E11D48]' : 'border-[#CEFA93] text-[#65A30D]'
                                                }`}>
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ========================================= */}
                {/* 3. 오른쪽 영역 (나의 등급 & 캐릭터) - flex-[0.9] */}
                {/* ========================================= */}
                <section className="w-full lg:flex-[0.9] flex flex-col gap-6 h-full min-h-0 relative z-10">

                    {/* 노란색 마스킹 테이프 장식 */}
                    <div className="absolute -top-3 right-6 w-3.5 h-12 bg-[#FDE047] rounded-sm transform rotate-6 z-20 shadow-sm opacity-90"></div>
                    <div className="absolute -top-3 left-[40%] w-3.5 h-12 bg-[#FDE047] rounded-sm transform -rotate-3 z-20 shadow-sm opacity-90"></div>

                    {/* 나의 등급 */}
                    <div className="bg-white border border-gray-100 rounded-[28px] p-6 shadow-sm flex flex-col shrink-0 relative z-10">
                        <h2 className="text-[16px] font-extrabold text-gray-800 mb-5">나의 등급</h2>
                        <div className="flex gap-2 mb-6">
                            <span className="bg-[#FFE4E6] text-[#EF4444] text-[10px] font-bold px-3 py-1.5 rounded-full border border-[#FECDD3]">연속 5일 🔥</span>
                            <span className="bg-[#FEF9C3] border border-[#FDE047] text-[#D97706] text-[10px] font-bold px-3 py-1.5 rounded-full">오늘 출석 완료!</span>
                        </div>

                        <div className="text-[12px] text-gray-400 mb-1.5 font-bold">현재 등급 &nbsp;&nbsp;&nbsp;&nbsp;<strong className="text-gray-800 text-[13px] font-extrabold">7등급 · 실전 대화러</strong></div>
                        <div className="text-[12px] text-gray-400 mb-6 font-bold">다음 등급까지 &nbsp;<strong className="text-gray-800 text-[13px] font-extrabold">320 XP</strong></div>

                        <div className="flex justify-between items-center text-[11px] text-gray-400 font-bold mb-2.5 border-t border-gray-50 pt-5">
                            <span>등급 진행률</span>
                            <span>누적 점수 (XP) &nbsp;&nbsp;<strong className="text-gray-800 text-[12px] font-extrabold">1,680 XP</strong></span>
                        </div>

                        <div className="w-full bg-[#F3F4F6] rounded-full h-[12px] mb-5 flex p-[1px]">
                            <div className="bg-[#A3E635] h-full w-[70%] rounded-full shadow-sm"></div>
                        </div>

                        <div className="flex items-center gap-3 text-[11px] font-bold text-gray-500">
                            <span>오늘 획득</span>
                            <span className="text-gray-800">+40 XP (학습 1회)</span>
                            <span className="text-gray-800">+10 XP (출석)</span>
                        </div>
                    </div>

                    {/* 나의 캐릭터 */}
                    <div className="bg-white border border-gray-100 rounded-[28px] p-6 shadow-sm flex-1 flex flex-col min-h-0 relative z-10">
                        <h2 className="text-[16px] font-extrabold text-gray-800 mb-6 shrink-0">나의 캐릭터</h2>
                        <div className="flex justify-between flex-1 min-h-0 gap-4">

                            <div className="flex flex-col gap-3 flex-1 overflow-y-auto custom-scrollbar pr-2 pb-2">
                                <div className="flex items-center gap-3 shrink-0 opacity-60">
                                    <div className="bg-[#F3F4F6] text-gray-400 text-[10px] font-bold px-3 py-1.5 rounded-xl border border-gray-200">Lv. 6</div>
                                    <span className="text-gray-500 text-[12px] font-bold">가나다라</span>
                                </div>
                                {/* 현재 레벨 */}
                                <div className="flex items-center gap-3 relative shrink-0">
                                    <div className="bg-[#FDE047] text-[#854D0E] text-[10px] font-extrabold px-3 py-1.5 rounded-xl shadow-sm border border-[#FACC15]">Lv. 7</div>
                                    <span className="text-gray-800 text-[12px] font-extrabold">실전 대화러</span>
                                    <div className="absolute right-0 bg-[#FDE047] text-[#854D0E] text-[9px] font-bold px-2 py-0.5 rounded-md shadow-sm">현재</div>
                                </div>
                                {/* 다음 목표 */}
                                <div className="flex items-center gap-3 relative shrink-0">
                                    <div className="bg-white border-2 border-dashed border-[#FDE047] text-gray-400 text-[10px] font-bold px-3 py-1.5 rounded-xl">Lv. 8</div>
                                    <span className="text-gray-400 text-[12px] font-bold">상황 마스터</span>
                                    <div className="absolute right-0 bg-[#FFFBEB] border border-[#FDE047] text-[#D97706] text-[9px] font-bold px-2 py-0.5 rounded-md shadow-sm hidden xl:block">다음 목표</div>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <div className="bg-white border border-gray-200 text-gray-400 text-[10px] font-bold px-3 py-1.5 rounded-xl">Lv. 9</div>
                                    <span className="text-gray-400 text-[12px] font-bold">대화 리더</span>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <div className="bg-white border border-gray-200 text-gray-400 text-[10px] font-bold px-3 py-1.5 rounded-xl">Lv. 10</div>
                                    <span className="text-gray-400 text-[12px] font-bold">눈치코치 MVP</span>
                                </div>
                            </div>

                            {/* 회색 캐릭터 박스 */}
                            <div className="w-[45%] h-full min-h-[160px] bg-[#E5E7EB] rounded-[20px] flex items-center justify-center shrink-0 border-2 border-white shadow-inner">
                                <span className="text-gray-400 font-extrabold text-sm">캐릭터</span>
                            </div>
                        </div>
                    </div>
                </section>

            </main>

            {/* 모달 1: 오답노트 */}
            {selectedNote && (
                <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-[40px] p-8 max-w-4xl w-full shadow-2xl relative flex flex-col items-center h-[75vh]">
                        <button onClick={() => setSelectedNote(null)} className="absolute top-6 right-8 w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 text-xl hover:bg-gray-100 transition-colors">✕</button>
                        <div className="bg-[#F2FEE5] border-2 border-[#CEFA93] rounded-full py-5 px-12 text-center mb-10 w-[85%] shrink-0 shadow-sm mt-4">
                            <span className="text-xl font-extrabold text-gray-800">{selectedNote.correctAnswer}</span>
                        </div>
                        <div className="w-[90%] flex flex-col flex-1 min-h-0">
                            <div className="text-gray-400 text-sm font-extrabold mb-5 shrink-0 px-2">시도 내역</div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 space-y-8 pb-4">
                                {selectedNote.attempts.map((attempt, index) => (
                                    <div key={index} className="flex flex-col">
                                        <div className="text-[#3B82F6] font-extrabold text-[15px] mb-3 px-2">{index + 1}번 시도</div>
                                        <div className="flex gap-3 flex-wrap px-2">
                                            {attempt.map((word, wIdx) => (
                                                <div key={wIdx} className={`px-6 py-2.5 rounded-full font-bold text-[16px] border-2 shadow-sm ${getWordColorClass(word.type)}`}>
                                                    {word.text}
                                                </div>
                                            ))}
                                        </div>
                                        {index !== selectedNote.attempts.length - 1 && <div className="border-b border-gray-100 mt-8 w-full"></div>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 모달 2: 챗봇 대화내역 */}
            {selectedChat && (
                <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-[40px] max-w-4xl w-full shadow-2xl relative flex flex-col h-[75vh] overflow-hidden">
                        <div className="absolute top-6 right-6 z-20">
                            <button onClick={() => setSelectedChat(null)} className="w-10 h-10 bg-white border border-gray-100 rounded-full flex items-center justify-center text-gray-400 text-xl shadow-sm hover:bg-gray-50 transition-colors">✕</button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-12 bg-[#F8F9FA] m-0 flex flex-col gap-8 custom-scrollbar pt-16">
                            {selectedChat.messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {msg.sender === 'bot' && (
                                        <div className="flex gap-4 items-end">
                                            <div className="flex flex-col items-center gap-2 shrink-0">
                                                <div className="w-14 h-14 bg-[#CEFA93] rounded-full flex items-center justify-center text-3xl border-4 border-white shadow-sm">🦖</div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="bg-white border-2 border-[#CEFA93] text-gray-800 text-[15px] font-medium px-6 py-4 rounded-[24px] rounded-bl-md whitespace-pre-wrap max-w-lg leading-relaxed shadow-sm">
                                                    {msg.text}
                                                </div>
                                                <span className="text-[#84CC16] text-2xl cursor-pointer hover:scale-110 transition-transform">🔊</span>
                                            </div>
                                        </div>
                                    )}
                                    {msg.sender === 'user' && (
                                        <div className="bg-[#D4F1A1] text-[#4D7C0F] text-[15px] font-bold px-6 py-4 rounded-[24px] rounded-br-md max-w-lg shadow-sm">
                                            {msg.text}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #D1D5DB; border-radius: 10px; border: 1px solid #F3F4F6; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #9CA3AF; }
      `}</style>
        </div>
    );
}