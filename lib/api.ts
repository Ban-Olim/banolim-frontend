import { useAuthStore } from "./store";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

function getToken(): string | null {
  // Zustand 스토어에서 먼저 시도
  const storeToken = useAuthStore.getState().accessToken;
  if (storeToken) return storeToken;

  // Zustand hydration이 아직 안 됐을 경우 localStorage에서 직접 읽기
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("auth-storage");
      if (raw) {
        const parsed = JSON.parse(raw);
        return parsed?.state?.accessToken ?? null;
      }
    } catch {
      // ignore
    }
  }
  return null;
}

function authHeader(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

interface ApiResponse<T> {
  isSuccess: boolean;
  data: T;
  message: string;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeader(),
      ...options?.headers,
    },
    ...options,
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const text = await res.text();
  if (!text) return undefined as T;
  const json = JSON.parse(text);
  if (json && typeof json === 'object' && 'isSuccess' in json && 'data' in json) {
    return json.data !== null && json.data !== undefined ? json.data : json;
  }
  if (json && typeof json === 'object' && 'data' in json && !('isSuccess' in json)) {
    return json.data;
  }
  return json as T;
}

// ── Types ──────────────────────────────────────────────────────────────────

export interface CharacterListItem {
  characterId: number;
  name: string;
  age: number;
  personalityLabel: string;
  likeTags: string[];
  warningTag: string | null;
  cardBg?: string;
  cardImage?: string;
}

export interface CharacterDetail extends CharacterListItem {
  quest: string;
  description: string;
  speechStyle: string;
  likes: string;
  dislikes: string;
  specialNote: string;
}

export interface SentenceProblem {
  sentenceProblemId: number;
  sentenceText: string;
  sentenceAudioUrl: string;
  sentenceData: {
    slots: {
      slotOrder: number;
      slotLabel: string;
      correctAnswer: string;
      hint: string;
    }[];
    options: string[];
  };
}

export interface SubmitResult {
  correct: boolean;
  correctAnswers?: string[];
}

export interface MessageResponse {
  reply: string;
  moodPercent?: number;
}

// ── API ────────────────────────────────────────────────────────────────────

export const api = {
  /** 카카오 OAuth 리다이렉트 */
  kakaoLogin() {
    window.location.href = `${BASE_URL}/oauth2/authorization/kakao`;
  },

  /** 닉네임 및 나이 설정 */
  updateProfile(data: { nickname: string; age: number }) {
    return request<void>("/api/users/me/profile", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  /** 캐릭터 목록 조회 */
  getCharacters() {
    return request<CharacterListItem[]>("/api/chat/characters");
  },

  /** 캐릭터 특징 상세 조회 */
  getCharacter(characterId: number) {
    return request<CharacterDetail>(`/api/chat/characters/${characterId}`);
  },

  /** 대화 세션 시작 */
  createSession(characterId: number) {
    return request<{ sessionId: number }>("/api/chat/sessions", {
      method: "POST",
      body: JSON.stringify({ characterId }),
    });
  },

  /** 챗봇과 대화 */
  sendMessage(sessionId: number, message: string) {
    return request<MessageResponse>(
      `/api/chat/sessions/${sessionId}/messages`,
      { method: "POST", body: JSON.stringify({ message }) },
    );
  },

  /** 문장 분해 문제 조회 */
  getSentencePractice(difficulty: number) {
    return request<SentenceProblem>(
      `/api/sentences/practice?difficulty=${difficulty}`,
    );
  },

  /** 문장 분해 답변 제출 */
  submitSentence(data: { sentenceProblemId: number; userAnswers: Record<string, string> }) {
    return request<SubmitResult>("/api/sentences/submit", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /** 문장 분해 오답노트 조회 */
  getSentenceAttempts() {
    return request<any[]>("/api/users/me/sentences/attempts");
  },

  /** 문장 분해 오답 상세 조회 */
  getSentenceAttemptDetail(problemId: number) {
    return request<any>(`/api/users/me/sentences/attempts/${problemId}`);
  },

  /** 대화한 챗봇 목록 조회 */
  getChatSessions() {
    return request<any[]>("/api/users/me/chat");
  },

  /** 챗봇 대화 로그 조회 */
  getChatLog(sessionId: number) {
    return request<any[]>(`/api/users/me/chat/${sessionId}`);
  },

  /** 출석체크 도장 조회 */
  getAttendanceStamps(year: number, month: number) {
    return request<any[]>(`/api/users/me/stamps?year=${year}&month=${month}`);
  },

  /** 출석체크 수행 */
  checkAttendance() {
    return request<any>("/api/attendance/check", { method: "POST" });
  },

  /** 나의 등급 조회 */
  getUserLevel() {
    return request<any>("/api/users/me/level");
  },
};
