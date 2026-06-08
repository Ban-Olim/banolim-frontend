# 반올림 (BanOlim)

> **2026 캡스톤 디자인** — 초등학생을 위한 AI 기반 한국어 학습 플랫폼

---

## 프로젝트 소개

반올림은 7~13세 어린이를 대상으로 한 한국어 어휘·문법 학습 서비스입니다.  
AI 캐릭터와의 대화, 문장 분해 드래그앤드롭, 시각적 지식 그래프를 통해 재미있게 언어를 익힐 수 있습니다.

---

## 주요 기능

| 기능 | 설명 |
|------|------|
| **눈치코치** | AI 캐릭터와 대화하며 어휘·문법을 학습. 감정 퍼센트 실시간 반영 |
| **문장분해 연습** | 주어진 단어 카드를 드래그앤드롭으로 올바른 문장 순서에 배치 |
| **나만의 단어장** | 저장한 단어를 목록/그래프 뷰로 확인. 단어별 상·하위어·유의어·반의어 시각화 |
| **지식 그래프** | react-force-graph-2d 기반 Force-Directed Graph로 단어 간 관계 탐색 |
| **단어 검색** | 학습 중 모르는 단어를 사이드바에서 바로 검색 |
| **회원가입/로그인** | 카카오 OAuth 연동, 닉네임·나이 프로필 설정 |

---

## 기술 스택

### Frontend

| 분류 | 기술 |
|------|------|
| 프레임워크 | Next.js 16.1.6 (App Router) |
| 언어 | TypeScript 5 |
| UI 라이브러리 | React 19 |
| 스타일링 | Tailwind CSS v4 |
| 상태 관리 | Zustand v5 |
| 서버 상태 | TanStack Query (React Query) v5 |
| 애니메이션 | Framer Motion v12 |
| 그래프 시각화 | react-force-graph-2d v1.29 (d3-force 기반) |
| 토스트 알림 | Sonner v2 |
| 아이콘 | Lucide React |
| 패키지 매니저 | npm |

### 그래프 시각화 구현

- `react-force-graph-2d` + Canvas 2D API로 커스텀 노드 렌더링
- `d3-force` 물리 시뮬레이션 (`charge`, `link.distance`, `link.strength`) 파라미터 튜닝
- `React.memo` + 커스텀 comparator로 불필요한 캔버스 재초기화 방지
- `useRef` 기반 selectedIdRef 패턴으로 노드 클릭 콜백 안정화

---

## 폴더 구조

```
app/
├── page.tsx          # 로그인
├── signup/           # 프로필 설정 (닉네임, 나이)
├── main/             # 메인 허브
├── dashboard/        # 대시보드 (설정, 프로필)
├── nunchikochi/      # 눈치코치 AI 대화
├── sentence/         # 문장 분해 연습
├── vocabulary/       # 나만의 단어장 (목록 + 지식 그래프)
└── oauth/            # 카카오 OAuth 콜백
components/
├── dictionary/       # 단어 검색 사이드바
├── sentence/         # 피드백 모달
└── ...
lib/
└── api.ts            # 백엔드 API 클라이언트
```

---

## 시작하기

### 설치

```bash
npm install
```

### 환경 변수 설정 (`.env.local`)

```env
NEXT_PUBLIC_API_URL=백엔드_주소
```

### 개발 서버 실행

```bash
npm run dev
```

### 빌드

```bash
npm run build
npm start
```

---

## 협업 규칙

### 브랜치 전략

- `main` — 최종 배포
- `develop` — 개발 통합
- `feature/#이슈번호-기능명` — 개별 기능 (예: `feature/#1-login-ui`)

### 커밋 컨벤션

| 태그 | 설명 |
|------|------|
| `feat` | 새로운 기능 추가 |
| `fix` | 버그 수정 |
| `docs` | 문서 수정 |
| `style` | 코드 포맷팅 (동작 변경 없음) |
| `refactor` | 코드 리팩토링 |
| `chore` | 설정 변경 및 기타 |

### 네이밍 규칙

- 컴포넌트: `PascalCase` (예: `LoginButton.tsx`)
- 함수/변수: `camelCase` (예: `getUserData`)
- 타입/인터페이스: `PascalCase` (예: `UserDetail`)
- 상수: `UPPER_SNAKE_CASE` (예: `API_BASE_URL`)
