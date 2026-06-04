"use client";

import React, { useState, useEffect } from 'react';
import Image from "next/image";
import { api } from "@/lib/api";
import { toast } from "sonner";

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
    audioUrl?: string | null;
}

interface ChatLog {
    id: number;
    name: string;
    messages: ChatMessage[];
    age: string;
    trait: string;
    tags: string[];
}

// --- 챗봇 데이터 설정 ---

// 레벨 1~10 데이터
const LEVELS = [
    { lv: 0, name: "단어 옹알이" },
    { lv: 1, name: "단어 걸음마" },
    { lv: 2, name: "단어 수집가" },
    { lv: 3, name: "문장 퍼즐러" },
    { lv: 4, name: "문장 조립꾼" },
    { lv: 5, name: "표현 탐험가" },
    { lv: 6, name: "대화 샛별" },
    { lv: 7, name: "실전 대화러" },
    { lv: 8, name: "맥락 마스터" },
    { lv: 9, name: "언어 연금술사" },
    { lv: 10, name: "반올리 마스터" },
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

// 흐릿한(blur) 효과가 없는 뚜렷한 단색 구름 SVG 컴포넌트
const Cloud = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 100 60" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <circle cx="25" cy="35" r="15" />
        <circle cx="45" cy="25" r="20" />
        <circle cx="70" cy="25" r="22" />
        <circle cx="85" cy="38" r="12" />
        <rect x="25" y="30" width="60" height="20" />
    </svg>
);

export default function DashboardPage() {
    const [incorrectNotes, setIncorrectNotes] = useState<IncorrectNote[]>([]);
    const [chatSessions, setChatSessions] = useState<ChatLog[]>([]);
    const [attendanceDates, setAttendanceDates] = useState<string[]>([]);
    const [isCheckedInToday, setIsCheckedInToday] = useState(false);
    const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth() + 1);
    const [todayDayIndex, setTodayDayIndex] = useState(() => new Date().getDay());
    const [selectedNote, setSelectedNote] = useState<IncorrectNote | null>(null);
    const [selectedChat, setSelectedChat] = useState<ChatLog | null>(null);
    const [userLevelData, setUserLevelData] = useState<any>(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [settingsNickname, setSettingsNickname] = useState("");
    const [settingsAge, setSettingsAge] = useState("");
    const [bgmVolume, setBgmVolume] = useState(50);
    const [sfxVolume, setSfxVolume] = useState(50);
    const [isSettingsSaving, setIsSettingsSaving] = useState(false);
    const [settingsError, setSettingsError] = useState("");
    const [myProfile, setMyProfile] = useState<{ nickname: string; age: number } | null>(null);

    // 컴포넌트 마운트 시 사용자 프로필(닉네임, 나이) 정보 로드 및 상태 저장.
    useEffect(() => {
        api.getProfile()
            .then(data => {
                const res: any = data;
                if (res) {
                    const nickname = res.nickname ?? res.name ?? res.data?.nickname ?? res.data?.name ?? res.user?.nickname ?? res.userInfo?.nickname;
                    const age = res.age ?? res.userAge ?? res.data?.age ?? res.data?.userAge ?? res.user?.age ?? res.userInfo?.age;
                    if (nickname || age) {
                        setMyProfile({ nickname: nickname || "", age: age || 0 });
                    }
                }
            })
            .catch(error => console.error("Failed to fetch profile on mount:", error));
    }, []);

    // 설정 모달창 열기 및 프로필 정보 셋팅.
    const openSettings = async () => {
        setIsSettingsOpen(true);
        setSettingsError("");
        if (myProfile && (myProfile.nickname || myProfile.age)) {
            setSettingsNickname(myProfile.nickname || "");
            setSettingsAge(myProfile.age ? String(myProfile.age) : "");
        } else {
            try {
                const profile: any = await api.getProfile();
                if (profile) {
                    const nickname = profile.nickname ?? profile.name ?? profile.data?.nickname ?? profile.data?.name ?? profile.user?.nickname ?? profile.userInfo?.nickname;
                    const age = profile.age ?? profile.userAge ?? profile.data?.age ?? profile.data?.userAge ?? profile.user?.age ?? profile.userInfo?.age;
                    if (nickname || age) {
                        setMyProfile({ nickname: nickname || "", age: age || 0 });
                    }
                    setSettingsNickname(nickname || "");
                    setSettingsAge(age ? String(age) : "");
                }
            } catch (error) {
                console.error("Failed to fetch profile:", error);
            }
        }
    };

    // 닉네임/나이 유효성 검사 후 프로필 업데이트 및 볼륨 설정 로컬스토리지 저장.
    const saveSettings = async () => {
        const trimmedNickname = settingsNickname.trim();
        const isNicknameValid = trimmedNickname.length >= 1 && trimmedNickname.length <= 10;
        const ageNumber = parseInt(settingsAge);
        const isAgeValid = !isNaN(ageNumber) && ageNumber >= 7 && ageNumber <= 13;

        if (!isNicknameValid || !isAgeValid) {
            setSettingsError("닉네임(1~10자)과 나이(7~13세)를 확인해주세요.");
            return;
        }

        setIsSettingsSaving(true);
        setSettingsError("");
        try {
            await api.updateProfile({ nickname: trimmedNickname, age: ageNumber });
            setMyProfile({ nickname: trimmedNickname, age: ageNumber });
            setIsSettingsOpen(false);
            localStorage.setItem("bgmVolume", String(bgmVolume));
            window.dispatchEvent(new CustomEvent('bgmVolumeChange', { detail: bgmVolume }));
            localStorage.setItem("sfxVolume", String(sfxVolume));
            window.dispatchEvent(new CustomEvent('sfxVolumeChange', { detail: sfxVolume }));
            toast.success("설정이 저장되었습니다.");
        } catch (error) {
            console.error("Failed to save profile:", error);
            setSettingsError("저장에 실패했습니다. 다시 시도해주세요.");
        } finally {
            setIsSettingsSaving(false);
        }
    };

    // 컴포넌트 마운트 시 로컬스토리지의 볼륨 설정 로드.
    useEffect(() => {
        const bgmVol = localStorage.getItem("bgmVolume");
        if (bgmVol) setBgmVolume(Number(bgmVol));
        const sfxVol = localStorage.getItem("sfxVolume");
        if (sfxVol) setSfxVolume(Number(sfxVol));
    }, []);

    // 컴포넌트 마운트 시 대시보드 메인 데이터(등급, 오답 노트, 채팅 세션) 로드.
    useEffect(() => {
        api.getUserLevel()
            .then(data => {
                console.log("Raw user level data:", data);
                if (data) {
                    const unwrapped = data.data || data.content || data;
                    setUserLevelData(unwrapped);
                }
            })
            .catch(error => {
                console.error("Failed to fetch user level:", error);
            });

        api.getSentenceAttempts()
            .then(data => {
                const res: any = data;
                console.log("[오답노트] 1. raw data:", JSON.stringify(res));

                let attemptsArray: any[] = [];
                if (res) {
                    if (Array.isArray(res)) {
                        attemptsArray = res;
                    } else if (res.attempts && Array.isArray(res.attempts)) {
                        attemptsArray = res.attempts;
                    } else if (res.data && Array.isArray(res.data)) {
                        attemptsArray = res.data;
                    } else if (res.content && Array.isArray(res.content)) {
                        attemptsArray = res.content;
                    } else {
                        const arrayVal = Object.values(res).find(val => Array.isArray(val));
                        if (arrayVal) attemptsArray = arrayVal as any[];
                        else console.warn("[오답노트] 배열을 찾을 수 없음. keys:", Object.keys(res));
                    }
                }
                console.log("[오답노트] attemptsArray:", attemptsArray.length, "items", attemptsArray[0]);


                const seen = new Set<number>();
                const normalized = attemptsArray
                    .filter((item: any) => item.isCorrect === false || item.correct === false) // 오답만 필터링
                    .map((item: any, idx: number) => {
                        // sentenceAttemptId는 시도 ID, problemId는 문제 ID (상세 조회 시 사용)
                        const id = item.sentenceProblemId ?? item.problemId ?? item.sentenceAttemptId ?? item.id ?? idx;
                        return {
                            id,
                            question: item.sentenceText || item.question || item.text || "문제 내용 없음",
                            correctAnswer: item.sentenceText || item.correctAnswer || item.answer || "정답 정보 없음",
                            attempts: []
                        };
                    })
                    .filter((note: any) => {
                        // 같은 문제 중복 제거
                        if (seen.has(note.id)) return false;
                        seen.add(note.id);
                        return true;
                    });
                console.log("[오답노트] normalized:", normalized.length, "items");
                setIncorrectNotes(normalized);
            })
            .catch(error => {
                console.error("[오답노트] FETCH ERROR:", error);
            });

        api.getChatSessions()
            .then(data => {
                if (data && Array.isArray(data)) {
                    const sessions = data.map((item: any) => ({
                        id: item.sessionId,
                        name: item.characterName,
                        age: `${item.characterAge}세`,
                        trait: item.characterTrait,
                        tags: [
                            ...(item.likeTags || []),
                            ...(item.warningTag ? [item.warningTag] : [])
                        ],
                        messages: []
                    }));
                    setChatSessions(sessions);
                }
            })
            .catch(error => {
                console.error("Failed to fetch chat sessions:", error);
            });

    }, []);

    // 선택된 연/월 변경 시 출석 기록 로드 및 당일 자동 출석 체크.
    useEffect(() => {
        api.getAttendanceStamps(selectedYear, selectedMonth)
            .then(data => {
                const res: any = data;
                let stampsArray: any[] = [];
                if (res) {
                    if (Array.isArray(res)) {
                        stampsArray = res;
                    } else if (res.stamps && Array.isArray(res.stamps)) {
                        stampsArray = res.stamps;
                    } else if (res.data && Array.isArray(res.data)) {
                        stampsArray = res.data;
                    } else if (res.content && Array.isArray(res.content)) {
                        stampsArray = res.content;
                    } else if (res.attendanceList && Array.isArray(res.attendanceList)) {
                        stampsArray = res.attendanceList;
                    } else if (typeof res === 'object') {
                        const arrayVal = Object.values(res).find(val => Array.isArray(val));
                        if (arrayVal) stampsArray = arrayVal as any[];
                        else console.warn("[출석도장] 배열을 찾을 수 없음. keys:", Object.keys(res));
                    }
                }

                let parsedDates: string[] = [];
                if (stampsArray.length > 0) {
                    parsedDates = stampsArray.map(d => {
                        if (typeof d === 'string' || typeof d === 'number') return String(d);
                        if (typeof d === 'object' && d !== null) {
                            if (d.date) return String(d.date);
                            if (d.stampDate) return String(d.stampDate);
                            if (d.createdAt) return String(d.createdAt);
                            if (d.attendanceDate) return String(d.attendanceDate);
                            if (d.day !== undefined) return String(d.day);
                            // fallback: find any string that looks like a date or a valid day number
                            for (const val of Object.values(d)) {
                                if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}/.test(val)) return val;
                                if (typeof val === 'number' && val >= 1 && val <= 31) return String(val);
                            }
                        }
                        return null;
                    }).filter(Boolean) as string[];
                }

                parsedDates = Array.from(new Set(parsedDates));
                setAttendanceDates(parsedDates);

                const today = new Date();
                const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                const currentY = today.getFullYear();
                const currentM = today.getMonth() + 1;

                if (selectedYear === currentY && selectedMonth === currentM) {
                    const isTodayChecked = parsedDates.some(d => {
                        if (!d) return false;
                        if (d.startsWith(todayStr)) return true;
                        if (!isNaN(Number(d)) && Number(d) === today.getDate()) return true;
                        const dt = new Date(d);
                        if (!isNaN(dt.getTime()) && dt.getFullYear() === currentY && (dt.getMonth() + 1) === currentM && dt.getDate() === today.getDate()) {
                            return true;
                        }
                        return false;
                    });

                    if (isTodayChecked) {
                        setIsCheckedInToday(true);
                    } else {
                        api.checkAttendance()
                            .then(() => {
                                setIsCheckedInToday(true);
                                setAttendanceDates(prev => Array.from(new Set([...prev, todayStr])));
                            })
                            .catch(err => console.error("자동 출석 실패:", err));
                    }
                }
            })
            .catch(error => {
                console.error("Failed to fetch attendance stamps:", error);

                const currentY = new Date().getFullYear();
                const currentM = new Date().getMonth() + 1;
                if (selectedYear === currentY && selectedMonth === currentM) {
                    api.checkAttendance()
                        .then(() => {
                            setIsCheckedInToday(true);

                            const today = new Date();
                            const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                            setAttendanceDates(prev => [...prev, todayStr]);
                        })
                        .catch(e => console.error("2차 자동 출석 실패:", e));
                }
            });
    }, [selectedYear, selectedMonth]);

    // 채팅 세션 클릭 시 전체 대화 내역 로드 및 채팅 모달 오픈.
    const handleChatClick = async (session: ChatLog) => {
        try {
            const logData = await api.getChatLog(session.id);
            let rawMessages: any[] = [];
            const dataObj: any = logData;

            if (dataObj && Array.isArray(dataObj)) {
                rawMessages = dataObj;
            } else if (dataObj && Array.isArray(dataObj.data)) {
                rawMessages = dataObj.data;
            } else if (dataObj && Array.isArray(dataObj.content)) {
                rawMessages = dataObj.content;
            } else if (dataObj && Array.isArray(dataObj.messages)) {
                rawMessages = dataObj.messages;
            } else if (dataObj && Array.isArray(dataObj.chatLogs)) {
                rawMessages = dataObj.chatLogs;
            }

            const messages: ChatMessage[] = rawMessages.map((msg: any, idx: number) => ({
                id: msg.chatId || msg.id || idx,
                sender: (msg.speaker === 'USER' || msg.speaker === 'user' || msg.role === 'user') ? 'user' : 'bot',
                text: msg.message || msg.text || msg.content || "불러오기 에러 (내용을 찾을 수 없음)",
                audioUrl: msg.audioUrl || msg.audio || null
            }));

            setSelectedChat({ ...session, messages });
        } catch (error) {
            console.error("Failed to fetch chat logs:", error);
            setSelectedChat(session);
        }
    };

    // 오답 노트 클릭 시 단어 조합 시도 내역 로드 및 모달 오픈.
    const handleNoteClick = async (note: IncorrectNote) => {
        try {
            const detail = await api.getSentenceAttemptDetail(note.id);
            let attemptsArray: Word[][] = [];

            const attemptsList = detail?.details || detail?.attempts || [];
            if (Array.isArray(attemptsList) && attemptsList.length > 0) {
                attemptsArray = attemptsList.map((att: any) => {
                    const answersMap = att.userAnswers || {};
                    return Object.keys(answersMap).sort((a, b) => parseInt(a) - parseInt(b)).map(key => {
                        const types: WordType[] = ['time', 'subject', 'action', 'place'];
                        const type: WordType = types[(parseInt(key) - 1) % types.length] || 'subject';
                        return { text: answersMap[key], type };
                    });
                });
            } else {
                attemptsArray = note.attempts || [];
            }
            setSelectedNote({
                ...note,
                question: detail?.sentenceText || note.question,
                attempts: attemptsArray
            });
        } catch (error) {
            console.error("Failed to fetch sentence attempt details:", error);
            setSelectedNote(note);
        }
    };

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const userData = userLevelData || {};
    const myLevel = userData.level ?? userData.currentLevel ?? userData.lvl ?? 7;
    const myLevelName = userData.levelName || LEVELS.find(l => l.lv === myLevel)?.name || "실전 대화러";
    const myProgressRate = userData.progressRate ?? userData.progress ?? userData.percent ?? userData.xpPercent ?? 0;
    const myConsecutiveDays = userData.consecutiveDays ?? userData.consecutiveAttendanceDays ?? userData.streak ?? userData.attendanceStreak ?? 0;
    const myNextLevelRemainingXp = userData.nextLevelRemainingXp ?? userData.remainingXp ?? userData.requiredXp ?? userData.nextExp ?? 0;
    const myTotalXp = userData.totalXp ?? userData.totalExp ?? userData.xp ?? userData.exp ?? userData.experience ?? 0;
    let myTodayXpList = userData.todayXpList ?? userData.todayExpList ?? userData.todayXp ?? userData.recentXp ?? userData.histories ?? userData.todayHistories ?? [];
    if (!Array.isArray(myTodayXpList)) myTodayXpList = [];

    const [clickedLevel, setClickedLevel] = useState<number | null>(null);
    const currentLevel = myLevel;
    const displayLevel = clickedLevel !== null ? clickedLevel : currentLevel;


    const attendanceDays = attendanceDates
        .filter(d => d !== null && d !== undefined)
        .map(d => {
            if (!isNaN(Number(d)) && Number(d) > 0 && Number(d) <= 31) {
                return Number(d);
            }

            const str = String(d);
            const match = str.match(/(\\d{4})[-/.](\\d{1,2})[-/.](\\d{1,2})/);
            if (match) {
                const y = parseInt(match[1]);
                const m = parseInt(match[2]);
                const day = parseInt(match[3]);
                if (y === selectedYear && m === selectedMonth) {
                    return day;
                }
            }

            const dt = new Date(str);
            if (!isNaN(dt.getTime()) && dt.getFullYear() === selectedYear && (dt.getMonth() + 1) === selectedMonth) {
                return dt.getDate();
            }
            return -1;
        })
        .filter(d => d !== -1);

    // 수동 '오늘 출석하기' 클릭 시 출석 체크 API 호출.
    const handleCheckIn = async () => {
        if (isCheckedInToday) return;
        try {
            await api.checkAttendance();
            const today = new Date();
            const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            setAttendanceDates(prev => [...prev, todayStr]);
            setIsCheckedInToday(true);
        } catch (error) {
            console.error("Failed to check in:", error);
            alert("출석 체크에 실패했습니다.");
        }
    };

    // 선택된 연/월 기준 달력 UI용 35칸 배열(5주) 생성 및 반환.
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
        <div className="min-h-screen xl:h-screen bg-[#FFFBEB] flex flex-col items-center py-4 px-4 sm:px-6 xl:py-5 xl:px-8 relative font-display xl:overflow-hidden overflow-x-hidden">

            {/* 뚜렷하고 귀여운 베이지/갈색 구름 배경 */}
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                <Cloud className="absolute top-[5%] left-[5%] w-[350px] text-[#FDE68A] opacity-50" />
                <Cloud className="absolute top-[20%] right-[10%] w-[450px] text-[#FDE68A] opacity-50" />
                <Cloud className="absolute bottom-[10%] left-[20%] w-[400px] text-[#FDE68A] opacity-50" />
                <Cloud className="absolute -bottom-[5%] right-[5%] w-[500px] text-[#FDE68A] opacity-50" />
            </div>

            {/* --- 상단 헤더 --- */}
            <header className="w-full max-w-[1500px] bg-white rounded-full py-3 px-4 xl:px-6 flex justify-between items-center shadow-sm z-10 mb-4 xl:mb-5 shrink-0 border border-gray-100">
                {/* 레이아웃 공간 유지를 위한 부모 (기존 크기 유지로 배치 무너짐 방지) */}
                <div className="relative w-32 h-10 shrink-0">
                    {/* 독단적으로 로고 크기만 키우기 위해 absolute 적용 */}
                    <div className="absolute top-1/2 -translate-y-1/2 left-[-10px] w-52 h-20 z-20 pointer-events-none">
                        <Image
                            src="/logo.jpg"
                            alt="로고"
                            fill
                            className="object-contain object-left"
                            priority
                        />
                    </div>
                </div>
                <h1 className="font-display text-xl font-bold text-gray-700 tracking-wide">
                    대시보드
                </h1>
                <div className="flex items-center gap-2">
                    <button onClick={openSettings} className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50 transition-colors">
                        <Image src="/setting-icon.png" alt="설정" width={20} height={20} />
                    </button>
                    <button onClick={() => window.location.href = '/main'} className="flex-shrink-0">
                        <Image src="/images/close.png" alt="닫기" width={32} height={32} />
                    </button>
                </div>
            </header>

            {/* --- 메인 보드 --- */}
            <main className="w-full max-w-[1500px] bg-white rounded-[24px] xl:rounded-[36px] p-5 lg:p-6 xl:p-8 shadow-[0_4px_30px_rgba(0,0,0,0.04)] flex flex-col lg:flex-row lg:flex-wrap xl:flex-nowrap gap-6 xl:gap-8 z-10 flex-1 xl:min-h-0 relative border border-gray-100 mb-6 xl:mb-0">

                {/* ========================================= */}
                {/* 1. 왼쪽 영역 (학습 달력) */}
                {/* ========================================= */}
                <section className="w-full lg:w-[calc(50%-12px)] xl:w-auto xl:flex-[1.0] flex flex-col xl:h-full xl:min-h-0 relative z-10 bg-white">

                    <div className="flex justify-between items-end mb-6 shrink-0 px-2 mt-2">
                        <div className="flex items-center gap-2">
                            <span className="text-[#FBBF24] text-xl">📅</span>
                            <h2 className="text-[17px] font-extrabold text-gray-800">학습 달력</h2>

                        </div>

                        {/* 드롭다운 메뉴 */}
                        <div className="flex items-center gap-2 text-gray-700 relative">
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
                                {idx === todayDayIndex ? (
                                    <div className="bg-[#FDE047] w-8 h-8 rounded-full flex items-center justify-center text-yellow-900 shadow-sm">
                                        {day}
                                    </div>
                                ) : (
                                    <span className="text-gray-400">{day}</span>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 grid-rows-5 gap-2 xl:gap-3 flex-1 xl:min-h-0">
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
                {/* 2. 중앙 영역 (오답노트 & 챗봇 로그) */}
                {/* ========================================= */}
                <section className="w-full lg:w-[calc(50%-12px)] xl:w-auto xl:flex-[1] flex flex-col gap-6 xl:h-full xl:min-h-0 px-1 xl:px-0 z-10">
                    <div className="flex flex-col flex-1 xl:min-h-0">
                        <div className="shrink-0 mb-2">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[#FBBF24] text-[22px]">📝</span>
                                <h2 className="text-[17px] font-extrabold text-gray-800">오답노트</h2>
                            </div>
                            <p className="text-[11px] text-gray-400 mb-4 ml-8 font-medium">내가 틀렸던 문제를 보여줘요!</p>
                            <div className="text-[12px] font-bold text-gray-400 mb-3 ml-2 border-b border-gray-50 pb-2">문장 분해 문제</div>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 flex flex-col gap-2.5 min-h-[200px] max-h-[300px] xl:max-h-none xl:min-h-0">
                            {incorrectNotes.length === 0 ? (
                                <div className="text-[12px] text-gray-400 text-center py-8 font-bold">오답노트가 없습니다.</div>
                            ) : (
                                incorrectNotes.map((note, idx) => (
                                    <button key={note.id} onClick={() => handleNoteClick(note)} className="flex items-center gap-3 w-full group shrink-0">
                                        <div className="w-[26px] h-[26px] rounded-full bg-[#FFE4E6] text-[#EF4444] text-[11px] font-extrabold flex items-center justify-center shrink-0">
                                            {idx + 1}
                                        </div>
                                        <div className="bg-[#F8F9FA] text-gray-600 font-bold text-[12px] px-4 py-3 rounded-[14px] flex-1 text-left truncate group-hover:bg-[#F1F3F5] transition-colors border border-transparent">
                                            {note.question}
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="border-b border-gray-100 w-full shrink-0"></div>

                    <div className="flex flex-col flex-[0.8] xl:min-h-0">
                        <div className="shrink-0 flex items-center gap-2 mb-4">
                            <span className="text-[#FBBF24] text-[22px]">💬</span>
                            <h2 className="text-[17px] font-extrabold text-gray-800">챗봇 로그내역</h2>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 flex flex-col gap-3 pb-1 min-h-[200px] max-h-[300px] xl:max-h-none xl:min-h-0">
                            {chatSessions.length === 0 ? (
                                <div className="text-[12px] text-gray-400 text-center py-8 font-bold">진행 중인 채팅이 없습니다.</div>
                            ) : (
                                chatSessions.map((log) => (
                                    <div key={log.id} className="border border-gray-100 rounded-[20px] p-4.5 shrink-0 bg-white shadow-sm">
                                        <div className="flex justify-between items-center mb-3">
                                            <div className="flex items-center gap-2.5">
                                                <span className="font-extrabold text-[14px] text-gray-800">{log.name}</span>
                                                <span className="text-[11px] text-gray-400 font-medium bg-[#F8F9FA] px-2.5 py-0.5 rounded-full">{log.age} · {log.trait}</span>
                                            </div>
                                            <button onClick={() => handleChatClick(log)} className="border border-[#D4F1A1] bg-[#F7FEE7] hover:bg-[#ECFCCB] text-[#65A30D] font-bold text-[10px] px-3.5 py-1.5 rounded-[10px] transition-colors shrink-0">
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
                                )))}
                        </div>
                    </div>
                </section>

                {/* ========================================= */}
                {/* 3. 오른쪽 영역 (나의 등급 & 캐릭터) */}
                {/* ========================================= */}
                <section className="w-full lg:w-full xl:w-auto xl:flex-[1.4] flex flex-col gap-6 xl:h-full xl:min-h-0 relative z-10">

                    {/* 노란색 고리 장식 */}
                    <div className="absolute -top-4 left-6 w-3.5 h-10 bg-[#FDE047] rounded-full z-20 shadow-sm"></div>
                    <div className="absolute -top-4 right-6 w-3.5 h-10 bg-[#FDE047] rounded-full z-20 shadow-sm"></div>

                    <div className="bg-white border border-gray-100 rounded-[28px] p-6 shadow-sm flex flex-col shrink-0 relative z-10 pt-8">
                        <div className="flex justify-between items-center mb-5">
                            <h2 className="text-[16px] font-extrabold text-gray-800">나의 등급</h2>
                            {myProfile && (
                                <span className="text-[12px] font-bold text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
                                    {myProfile.nickname} <span className="text-gray-400 font-medium ml-0.5">({myProfile.age}세)</span>
                                </span>
                            )}
                        </div>
                        <div className="flex gap-2 mb-6">

                            {isCheckedInToday ? (
                                <span className="bg-[#FEF9C3] border border-[#FDE047] text-[#D97706] text-[10px] font-bold px-3 py-1.5 rounded-full">
                                    오늘 출석 완료!
                                </span>
                            ) : (
                                <button onClick={handleCheckIn} className="bg-white border-2 border-[#A3E635] text-[#4D7C0F] text-[10px] font-extrabold px-3 py-1.5 rounded-full hover:bg-[#F7FEE7] transition-colors shadow-sm">
                                    오늘 출석하기
                                </button>
                            )}
                        </div>

                        <div className="text-[12px] text-gray-400 mb-1.5 font-bold">현재 등급 &nbsp;&nbsp;&nbsp;&nbsp;<strong className="text-gray-800 text-[13px] font-extrabold">{myLevel}등급 · {myLevelName}</strong></div>
                        <div className="text-[12px] text-gray-400 mb-6 font-bold">
                            {myLevel >= 10 ? (
                                <strong className="text-[#65A30D] text-[13px] font-extrabold">최고 등급입니다! 🎉</strong>
                            ) : (
                                <>다음 등급까지 &nbsp;<strong className="text-gray-800 text-[13px] font-extrabold">{myNextLevelRemainingXp} XP</strong></>
                            )}
                        </div>

                        <div className="flex justify-between items-center text-[11px] text-gray-400 font-bold mb-2.5 border-t border-gray-50 pt-5">
                            <span>등급 진행률</span>
                            <span>누적 점수 (XP) &nbsp;&nbsp;<strong className="text-gray-800 text-[12px] font-extrabold">{myTotalXp.toLocaleString()} XP</strong></span>
                        </div>

                        <div className="w-full bg-[#F3F4F6] rounded-full h-[12px] mb-5 flex p-[1px]">
                            <div className="bg-[#A3E635] h-full rounded-full shadow-sm" style={{ width: `${myProgressRate}%` }}></div>
                        </div>

                        <div className="flex items-center gap-3 text-[11px] font-bold text-gray-500">
                            <span>오늘 획득</span>
                            {myTodayXpList.length === 0 ? (
                                <span className="text-gray-800">오늘의 학습을 시작해보세요!</span>
                            ) : (
                                myTodayXpList.map((xpObj: any, idx: number) => {
                                    let label = "";
                                    if (typeof xpObj === 'string') label = xpObj;
                                    else if (xpObj) {
                                        // 명시적인 키 먼저 확인 (point, value, reward 추가)
                                        let rawAmount = xpObj.amount ?? xpObj.xp ?? xpObj.exp ?? xpObj.points ?? xpObj.point ?? xpObj.score ?? xpObj.gained ?? xpObj.value ?? xpObj.reward;
                                        let amount = 0;
                                        let src = xpObj.reason || xpObj.source || xpObj.title || xpObj.description || xpObj.type || xpObj.name;

                                        if (rawAmount !== undefined && rawAmount !== null) {
                                            amount = Number(rawAmount);
                                        } else {
                                            // 못 찾았을 경우, id나 date가 아닌 숫자 값 찾기
                                            const possibleNum = Object.entries(xpObj).find(([k, v]) => {
                                                if (k.toLowerCase().includes('id') || k.toLowerCase().includes('date') || k.toLowerCase().includes('time')) return false;
                                                return typeof v === 'number' || (typeof v === 'string' && !isNaN(Number(v)) && v.trim() !== '');
                                            });
                                            if (possibleNum) amount = Number(possibleNum[1]);
                                        }

                                        if (!src) {
                                            const strVal = Object.values(xpObj).find(v => typeof v === 'string' && isNaN(Number(v)) && !String(v).includes('-'));
                                            src = strVal ? String(strVal) : "지급";
                                        }

                                        label = `+${amount} XP (${src})`;
                                    }
                                    return <span key={idx} className="text-gray-800">{label}</span>;
                                })
                            )}
                        </div>
                    </div>

                    <div className="bg-white border border-gray-100 rounded-[28px] p-5 xl:p-6 shadow-sm flex-1 flex flex-col xl:min-h-[200px] relative z-10">
                        <h2 className="text-[16px] font-extrabold text-gray-800 mb-4 xl:mb-6 shrink-0">나의 캐릭터</h2>
                        <div className="flex justify-between flex-1 gap-3 xl:gap-4 min-h-[250px] lg:min-h-[350px] xl:min-h-[100px]">

                            {/* 레벨 1~10 스크롤 리스트 */}
                            <div className="flex flex-col gap-2 flex-[0.7] overflow-y-auto custom-scrollbar pr-1 pb-2">
                                {LEVELS.map((item) => {
                                    const isCurrent = item.lv === myLevel;
                                    const isNext = item.lv === (myLevel + 1);

                                    let bgClass = "bg-[#F3F4F6] text-gray-400";
                                    let textClass = "text-gray-500 font-bold";
                                    let lvTextClass = "text-gray-400";

                                    if (isCurrent) {
                                        bgClass = "bg-[#FDE047] border border-[#FACC15] shadow-sm";
                                        textClass = "text-gray-800 font-extrabold";
                                        lvTextClass = "text-[#854D0E]";
                                    } else if (isNext) {
                                        bgClass = "bg-white border border-[#FDE047]";
                                        textClass = "text-gray-400 font-bold";
                                    } else if (item.lv > myLevel + 1) {
                                        bgClass = "bg-white border border-gray-200";
                                    }

                                    return (
                                        <div
                                            key={item.lv}
                                            className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl shrink-0 gap-1.5 cursor-pointer hover:scale-[1.02] transition-all ${bgClass}`}
                                            onClick={() => setClickedLevel(clickedLevel === item.lv ? null : item.lv)}
                                        >
                                            <div className="flex items-center gap-1.5 min-w-0">
                                                <span className={`font-extrabold text-[10px] ${lvTextClass} shrink-0 whitespace-nowrap`}>Lv. {item.lv}</span>
                                                <span className={`text-[11px] ${textClass} truncate`}>{item.name}</span>
                                            </div>

                                            {isCurrent && (
                                                <span className="bg-[#FDE047] text-[#854D0E] text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-sm shrink-0">현재</span>
                                            )}
                                            {isNext && (
                                                <span className="bg-[#FFFBEB] border border-[#FDE047] text-[#D97706] text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-sm shrink-0 hidden sm:block">다음 목표</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* 레벨별 캐릭터 이미지 중심축 표시 박스 */}
                            <div className="flex-[1.3] h-full min-h-[160px] xl:min-h-[100px] bg-white rounded-[24px] flex items-center justify-center shrink-0 border-[3px] border-gray-50 shadow-sm relative overflow-hidden transition-all duration-300">
                                <Image
                                    key={displayLevel}
                                    src={`/character/LV ${displayLevel}.png`}
                                    alt={`레벨 ${displayLevel} 캐릭터`}
                                    fill
                                    className="object-contain p-6 animate-[fadeIn_0.2s_ease-in-out]"
                                    style={{
                                        transform: `scale(${0.65 + (displayLevel * 0.055)})`,
                                        transformOrigin: 'center center'
                                    }}
                                    unoptimized
                                />
                            </div>
                        </div>
                    </div>
                </section>

            </main>

            {/* 모달 1: 오답노트 */}
            {selectedNote && (
                <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-[32px] lg:rounded-[40px] p-6 lg:p-8 max-w-4xl w-full shadow-2xl relative flex flex-col items-center h-[85vh] lg:h-[75vh]">
                        <button onClick={() => setSelectedNote(null)} className="absolute top-4 right-4 lg:top-6 lg:right-8 w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 text-xl hover:bg-gray-100 transition-colors">✕</button>
                        <div className="bg-[#F2FEE5] border-2 border-[#CEFA93] rounded-full py-4 lg:py-5 px-6 lg:px-12 text-center mb-6 lg:mb-10 w-full lg:w-[85%] shrink-0 shadow-sm mt-8 lg:mt-4">
                            <span className="text-lg lg:text-xl font-extrabold text-gray-800">{selectedNote.correctAnswer}</span>
                        </div>
                        <div className="w-full lg:w-[90%] flex flex-col flex-1 min-h-0">
                            <div className="text-gray-400 text-sm font-extrabold mb-5 shrink-0 px-2">시도 내역</div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 lg:pr-4 space-y-8 pb-4">
                                {selectedNote.attempts.map((attempt, index) => (
                                    <div key={index} className="flex flex-col">
                                        <div className="text-[#3B82F6] font-extrabold text-[14px] lg:text-[15px] mb-3 px-2">{index + 1}번 시도</div>
                                        <div className="flex gap-2 lg:gap-3 flex-wrap px-2">
                                            {attempt.map((word, wIdx) => (
                                                <div key={wIdx} className={`px-4 lg:px-6 py-2 lg:py-2.5 rounded-full font-bold text-[14px] lg:text-[16px] border-2 shadow-sm ${getWordColorClass(word.type)}`}>
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
                    <div className="bg-white rounded-[32px] lg:rounded-[40px] max-w-4xl w-full shadow-2xl relative flex flex-col h-[85vh] lg:h-[75vh] overflow-hidden">
                        <div className="absolute top-4 right-4 lg:top-6 lg:right-6 z-20">
                            <button onClick={() => setSelectedChat(null)} className="w-10 h-10 bg-white border border-gray-100 rounded-full flex items-center justify-center text-gray-400 text-xl shadow-sm hover:bg-gray-50 transition-colors">✕</button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-12 bg-[#F8F9FA] m-0 flex flex-col gap-6 lg:gap-8 custom-scrollbar pt-16 lg:pt-16">
                            {selectedChat.messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {msg.sender === 'bot' && (
                                        <div className="flex gap-2 lg:gap-4 items-end">
                                            <div className="flex flex-col items-center gap-2 shrink-0">
                                                <div className="w-10 h-10 lg:w-14 lg:h-14 bg-[#CEFA93] rounded-full flex items-center justify-center text-xl lg:text-3xl border-2 lg:border-4 border-white shadow-sm">🦖</div>
                                            </div>
                                            <div className="flex items-center gap-2 lg:gap-3">
                                                <div className="bg-white border-2 border-[#CEFA93] text-gray-800 text-[14px] lg:text-[15px] font-medium px-4 lg:px-6 py-3 lg:py-4 rounded-[20px] lg:rounded-[24px] rounded-bl-md whitespace-pre-wrap max-w-[220px] sm:max-w-xs lg:max-w-lg leading-relaxed shadow-sm">
                                                    {msg.text}
                                                </div>
                                                {msg.audioUrl && (
                                                    <span onClick={() => new Audio(msg.audioUrl!).play()} className="text-[#84CC16] text-xl cursor-pointer hover:scale-110 transition-transform opacity-80 hover:opacity-100">🔊</span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    {msg.sender === 'user' && (
                                        <div className="bg-[#D4F1A1] text-[#4D7C0F] text-[14px] lg:text-[15px] font-bold px-4 lg:px-6 py-3 lg:py-4 rounded-[20px] lg:rounded-[24px] rounded-br-md max-w-[220px] sm:max-w-xs lg:max-w-lg shadow-sm">
                                            {msg.text}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* 모달 3: 설정 모달 */}
            {isSettingsOpen && (
                <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4 backdrop-blur-sm font-sans">
                    <div className="bg-white rounded-[32px] w-full max-w-sm p-8 shadow-2xl relative flex flex-col">
                        <button onClick={() => setIsSettingsOpen(false)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:bg-gray-100 transition-colors">✕</button>
                        <h2 className="text-xl font-display font-extrabold text-gray-800 mb-6 text-center">설정</h2>



                        <div className="flex flex-col gap-4 mb-6">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[13px] font-bold text-gray-600 px-1">닉네임</label>
                                <input
                                    type="text"
                                    value={settingsNickname}
                                    onChange={(e) => setSettingsNickname(e.target.value)}
                                    placeholder="영어 소문자 또는 한글 1~8자"
                                    className="w-full bg-[#F8F9FA] border border-gray-200 rounded-[12px] px-4 py-3 text-[14px] font-bold text-gray-800 focus:outline-none focus:border-[#C6FA98] transition-colors"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[13px] font-bold text-gray-600 px-1">나이</label>
                                <input
                                    type="number"
                                    value={settingsAge}
                                    onChange={(e) => setSettingsAge(e.target.value)}
                                    placeholder="7세 이상 13세 이하"
                                    className="w-full bg-[#F8F9FA] border border-gray-200 rounded-[12px] px-4 py-3 text-[14px] font-bold text-gray-800 focus:outline-none focus:border-[#C6FA98] transition-colors"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-[13px] font-bold text-gray-600">배경음악 소리</label>
                                    <span className="text-[12px] font-bold text-[#65A30D]">{bgmVolume}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={bgmVolume}
                                    onChange={(e) => {
                                        const newVol = Number(e.target.value);
                                        setBgmVolume(newVol);
                                        localStorage.setItem("bgmVolume", String(newVol));
                                        window.dispatchEvent(new CustomEvent('bgmVolumeChange', { detail: newVol }));
                                    }}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#C6FA98]"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-[13px] font-bold text-gray-600">효과음 소리</label>
                                    <span className="text-[12px] font-bold text-[#65A30D]">{sfxVolume}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={sfxVolume}
                                    onChange={(e) => {
                                        const newVol = Number(e.target.value);
                                        setSfxVolume(newVol);
                                        localStorage.setItem("sfxVolume", String(newVol));
                                        window.dispatchEvent(new CustomEvent('sfxVolumeChange', { detail: newVol }));
                                    }}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#C6FA98]"
                                />
                            </div>
                        </div>

                        {settingsError && (
                            <p className="text-[#EF4444] text-[12px] font-bold text-center mb-4">{settingsError}</p>
                        )}

                        <button
                            onClick={saveSettings}
                            disabled={isSettingsSaving}
                            className="w-full bg-[#C6FA98] hover:bg-[#b8f08a] text-green-900 font-extrabold py-3.5 rounded-[16px] transition-colors disabled:opacity-50"
                        >
                            {isSettingsSaving ? "저장 중..." : "저장하기"}
                        </button>
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