import { useAuthStore } from "./store";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

function authHeader(): HeadersInit {
  const token = useAuthStore.getState().accessToken;
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
  const json = JSON.parse(text) as ApiResponse<T>;
  return json.data;
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

export interface SlotResult {
  isCorrect: boolean;
  correctAnswer: string;
}

export interface SubmitResult {
  xpGranted: boolean;
  isCorrect: boolean;
  results: Record<string, SlotResult>;
}

export interface GraphWord {
  senseId: string;
  word: string;
  pos: string;
  definition: string;
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
  async getGraph() {
    const res = await request<{ nodes: { id: string; label: string; group: string; definition: string }[] } | null>("/api/graph");
    return (res?.nodes ?? []).map((n) => ({
      senseId: n.id,
      word: n.label,
      pos: n.group,
      definition: n.definition,
    }));
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
  submitSentence(data: {
    sentenceProblemId: number;
    userAnswers: Record<string, string>;
  }) {
    return request<SubmitResult>("/api/sentenses/submit", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
