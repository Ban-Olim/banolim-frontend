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
  submitSentence(data: { sentenceProblemId: number; answers: string[] }) {
    return request<SubmitResult>("/api/sentenses/submit", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
