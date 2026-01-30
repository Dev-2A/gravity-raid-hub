# 🌀 과중력 공대 포털

FF14 아르카디아: 헤비급 레이드를 함께 하는 **과중력 공대**를 위한 웹 포털입니다.

## ✨ 기능

### 🎰 무기 토토

- 4층 무기 드랍 예측 베팅
- 적중률 랭킹 및 역대 기록
- 연속 적중 스트릭

### 🏆 공대 시상식

- **🪦 전멸의 주범** - 오늘 와이프 원인 1등
- **🤡 공대의 광대** - 제일 웃긴 행동/발언
- **👻 생전 고인** - 죽기 직전 개쩌는 플레이
- **🛡️ 진짜 MVP** - 오늘 캐리한 사람
- **💀 바닥 감정사** - 바닥 제일 많이 본 사람
- **🎭 명연기상** - "아 나 버프 눌렀는데?"

## 🛠️ 기술 스택

- **Frontend**: React + Vite
- **Styling**: Tailwind CSS
- **Backend/DB**: Supabase
- **Deployment**: Vercel

## 🚀 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경변수 설정

`.env.example`을 복사하여 `.env.local` 파일을 만들고 Supabase 키를 설정하세요.

```bash
cp .env.example .env.local
```

### 3. 개발 서버 실행

```bash
npm run dev
```

## 📁 프로젝트 구조

```text
src/
├── components/     # 공통 컴포넌트
├── pages/          # 페이지 컴포넌트
├── hooks/          # 커스텀 훅
├── lib/            # Supabase 클라이언트 등
└── index.css       # 글로벌 스타일
```

## 📝 라이선스

MIT License
