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

export interface CharacterDetail {
  characterId: number;
  name: string;
  age: number;
  personalityLabel: string;
  likeTags: string[];
  dislikeTags: string[];
  warningTags: string[];
  personality: string;
  speechStyle: string;
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
  isCorrect: boolean;
  xpGranted: boolean;
  results?: Record<string, { isCorrect: boolean; correctAnswer: string }>;
}



export interface GraphWord {
  senseId: string;
  word: string;
  pos: string;
  definition: string;
}

export interface GraphLink {
  source: string;
  target: string;
  type: string;
}

export interface GraphData {
  words: GraphWord[];
  links: GraphLink[];
}

export interface WordSearchResult {
  senseId: string;
  word: string;
  pos: string;
  definition: string;
}

interface WordSearchRaw {
  word: string;
  senses: { id: number; definition: string; partOfSpeech: string }[];
}

export interface WordExample {
  example_sentence: string;
  translation: string;
}

export interface ChatMessage {
  chatId: number;
  speaker: "BOT" | "USER";
  message: string;
  audioUrl: string | null;
  createdAt: string;
}

export interface SessionResponse {
  sessionId: number;
  messages: ChatMessage[];
  temperature: number;
}

export interface MessageSendResponse {
  message: string;
  temperature: number;
  audioUrl: string | null;
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

  /** 프로필 조회 */
  async getProfile() {
    let res: any;
    
    // 1. GET /api/users/me/info 시도 (원래 엔드포인트)
    try {
      res = await request<{ nickname: string; age: number }>("/api/users/me/info", { method: "GET" });
    } catch (e) {
      console.warn("Failed GET /api/users/me/info", e);
    }

    // 2. GET /api/users/me/profile 시도 (Swagger에 PATCH가 있어서 혹시 몰라 추가된 엔드포인트)
    if (!res || (!res.nickname && !res.name && !res.data?.nickname && !res.data?.name)) {
      try {
        res = await request<{ nickname: string; age: number }>("/api/users/me/profile", { method: "GET" });
      } catch (e) {
        console.warn("Failed GET /api/users/me/profile", e);
      }
    }

    // 결과 확인
    let nickname = res?.nickname ?? res?.name ?? res?.data?.nickname ?? res?.data?.name;
    let age = res?.age ?? res?.userAge ?? res?.data?.age ?? res?.data?.userAge;
    
    if (nickname || age) {
      return { nickname: nickname || "", age: age || 0 };
    }

    // Fallback: 카카오 로그인 초기 정보가 JWT에 있다면 JWT에서 읽어옴
    const token = getToken();
    if (token && typeof window !== "undefined") {
      try {
        const base64Url = token.split('.')[1];
        let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const pad = base64.length % 4;
        if(pad) {
          base64 += new Array(5 - pad).join('=');
        }
        const jsonPayload = decodeURIComponent(
          window.atob(base64)
            .split('')
            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        const payload = JSON.parse(jsonPayload);
        console.log("[Profile Fallback] JWT Payload:", payload);
        nickname = payload.nickname ?? payload.name ?? "";
        age = payload.age ?? payload.userAge ?? 0;
        return { nickname, age };
      } catch (e) {
        console.warn("Failed to parse JWT", e);
      }
    }
    return { nickname: "", age: 0 };
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
    return request<SessionResponse>("/api/chat/sessions", {
      method: "POST",
      body: JSON.stringify({ characterId }),
    });
  },

  /** 챗봇과 대화 */
  sendMessage(sessionId: number, message: string) {
    return request<MessageSendResponse>(
      `/api/chat/sessions/${sessionId}/messages`,
      { method: "POST", body: JSON.stringify({ message }) },
    );
  },

  /** 지식그래프 조회 */
  async getGraph(): Promise<GraphData> {
    const res = await request<{
      nodes: { id: string; label: string; group: string; definition: string }[];
      links: { source: string; target: string; type: string }[];
    } | null>("/api/graph");
    return {
      words: (res?.nodes ?? []).map((n) => ({
        senseId: n.id,
        word: n.label,
        pos: n.group,
        definition: n.definition,
      })),
      links: res?.links ?? [],
    };
  },

  /** 지식그래프 단어 삭제 */
  deleteGraphWord(senseId: string) {
    return request<void>(`/api/graph/${senseId}`, { method: "DELETE" });
  },

  /** 단어 검색 */
  async searchWords(keyword: string) {
    const res = await request<{ items: WordSearchRaw[]; totalCount: number }>(
      `/api/words/search?keyword=${encodeURIComponent(keyword)}`,
    );
    return (res?.items ?? []).flatMap((item) =>
      item.senses.map((s) => ({
        senseId: String(s.id),
        word: item.word,
        pos: s.partOfSpeech,
        definition: s.definition,
      })),
    );
  },

  /** 단어 추가 */
  addWord(senseId: string) {
    return request<void>(`/api/words/${senseId}`, { method: "PUT" });
  },

  /** 예문 생성 */
  async getExample(senseId: string) {
    const res = await request<WordExample>("/api/words/example", {
      method: "POST",
      body: JSON.stringify({ senseId }),
    });
    return res;
  },

  /** 문장 분해 문제 조회 */
  getSentencePractice() {
    return request<SentenceProblem[]>("/api/sentences/practice");
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
