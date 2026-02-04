# BanOlim

> **2026 캡스톤 디자인**

---

## 🛠 사용 기술 (Tech Stack)

- **프레임워크**: Next.js 14+ (App Router)
- **개발 언어**: TypeScript
- **스타일링**: Tailwind CSS
- **상태 관리**: Zustand, TanStack Query
- **UI 컴포넌트**: shadcn/ui, Lucide React
- **패키지 매니저**: npm

---

## 📁 폴더 구조 (Folder Structure)

---

## 협업 규칙 (Collaboration Rules)

### 1. 브랜치 전략 (Branch Strategy)

- main: 최종 배포 브랜치
- develop: 개발 통합 브랜치
- feature/#이슈번호-기능명: 개별 기능 구현 (예: feature/#1-login-ui)

### 2. 커밋 메시지 규칙 (Commit Convention)

- feat: 새로운 기능 추가
- fix: 버그 수정
- docs: 문서 수정 (README 등)
- style: 코드 포맷팅 (코드 변경 없는 경우)
- refactor: 코드 리팩토링
- chore: 설정 변경 및 기타 작업

### 3. 네이밍 규칙 (Naming Convention)

- 컴포넌트: PascalCase (예: LoginButton.tsx)
- 함수/변수: camelCase (예: getUserData)
- 타입/인터페이스: PascalCase (예: UserDetail)
- 상수: UPPER_SNAKE_CASE (예: API_BASE_URL)

---

## 시작하기 (Getting Started)

### 필수 설치

npm install

### 환경 변수 설정 (.env.local)

NEXT*PUBLIC_API_URL=백엔드*주소

### 개발 서버 실행

npm run dev
