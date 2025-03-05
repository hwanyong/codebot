# Codebot

[![npm version](https://badge.fury.io/js/@uhd_kr%2Fcodebot.svg?v=1.6.0)](https://www.npmjs.com/package/@uhd_kr%2Fcodebot)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

AI 기반 코딩 어시스턴트 CLI 도구입니다. LangGraph를 사용하여 복잡한 코딩 작업을 수행할 수 있는 다단계 추론 에이전트를 구현했습니다.

## 기능

- 자연어로 코딩 작업 요청
- 파일 시스템 조작 (파일 읽기, 쓰기, 목록 조회, 검색)
- 쉘 명령어 실행
- 다단계 추론을 통한 복잡한 작업 수행
- 대화형 CLI 인터페이스

## 설치

### 요구 사항

- Node.js 18 이상
- npm 또는 pnpm

### 설치 방법

> ⚠️ **중요**: Codebot은 CLI 도구이므로 반드시 글로벌로 설치해야 합니다!

```bash
# npm을 사용하는 경우
npm install -g @uhd_kr/codebot

# pnpm을 사용하는 경우
pnpm add -g @uhd_kr/codebot
```

설치 후 터미널에서 `codebot` 명령어를 사용할 수 있습니다.

### 소스에서 설치

```bash
# 저장소 클론
git clone https://github.com/hwanyong/codebot.git
cd codebot

# 의존성 설치
pnpm install

# 빌드
pnpm build

# 전역 설치
pnpm link --global
```

## 환경 설정

`.env` 파일을 생성하고 다음 환경 변수를 설정하세요:

```
# OpenAI API 키
OPENAI_API_KEY=your_openai_api_key

# Ollama 기본 URL (선택 사항)
OLLAMA_BASE_URL=http://localhost:11434

# 디버그 모드 (선택 사항)
DEBUG=true
```

## 사용 방법

### 대화형 모드

```bash
# 기본 설정으로 실행
codebot chat

# 특정 모델 및 제공자 지정
codebot chat --model gpt-4 --provider openai

# 모델 온도 조정
codebot chat --temperature 0.5
```

### 단일 작업 실행

```bash
# 단일 작업 실행
codebot run "React 컴포넌트 생성: 사용자 프로필 표시"

# 특정 모델 및 제공자 지정
codebot run "파일 검색 및 내용 분석" --model gpt-4 --provider openai
```

### 대화형 모드 명령어

대화형 모드에서는 다음 슬래시 명령어를 사용할 수 있습니다:

- `/help` - 도움말 표시
- `/clear` - 대화 기록 지우기
- `/exit` - 대화 세션 종료

## 개발

### 개발 모드 실행

```bash
pnpm dev
```

### 빌드

```bash
pnpm build
```

## 프로젝트 구조

```
src/
├── agent/           # 에이전트 관련 코드
│   ├── graph.ts     # LangGraph 그래프 정의
│   ├── manager.ts   # 에이전트 관리자
│   ├── nodes.ts     # 그래프 노드 구현
│   └── state.ts     # 상태 관리
├── cli/             # CLI 인터페이스
│   ├── cli.ts       # CLI 진입점
│   └── index.ts     # CLI 구현
├── prompts/         # 프롬프트 템플릿
│   └── index.ts     # 프롬프트 정의
├── tools/           # 도구 구현
│   ├── context/     # 컨텍스트 도구
│   ├── fileSystem/  # 파일 시스템 도구
│   ├── terminal/    # 터미널 도구
│   ├── index.ts     # 도구 내보내기
│   └── toolRegistry.ts # 도구 레지스트리
├── types/           # 타입 정의
│   └── index.ts     # 공통 타입
└── index.ts         # 메인 내보내기
```

## 라이선스

MIT