# Codebot 프로젝트 분석

## 개요
Codebot은 AI 기반 코딩 어시스턴트 CLI 도구로, LangGraph를 활용하여 다단계 추론 에이전트를 구현하고 있습니다. 이 도구는 자연어로 코딩 작업을 요청하고, 파일 시스템 작업, 쉘 명령어 실행, 번역 기능 등 다양한 기능을 제공합니다.

## 프로젝트 구조

```
codebot/
├── src/
│   ├── agent/           # 에이전트 관련 코드
│   │   ├── graph.ts     # LangGraph 그래프 정의
│   │   ├── manager.ts   # 에이전트 관리자
│   │   ├── nodes/       # 그래프 노드 구현
│   │   │   ├── analyze-task.ts     # 작업 분석 노드
│   │   │   ├── execute-step.ts     # 단계 실행 노드
│   │   │   ├── generate-response.ts # 응답 생성 노드
│   │   │   ├── handle-error.ts     # 오류 처리 노드
│   │   │   ├── plan-execution.ts   # 실행 계획 노드
│   │   │   ├── translate-input.ts  # 입력 번역 노드
│   │   │   ├── verify-result.ts    # 결과 검증 노드
│   │   │   └── index.ts            # 노드 내보내기
│   │   └── state.ts     # 상태 관리
│   ├── cli/             # CLI 인터페이스
│   │   ├── cli.ts       # CLI 진입점
│   │   ├── index.ts     # CLI 구현
│   │   └── spinner-manager.ts # 로딩 스피너 관리
│   ├── config/          # 설정 관련 코드
│   ├── prompts/         # 프롬프트 템플릿
│   ├── tools/           # 도구 구현
│   │   ├── context/     # 컨텍스트 도구
│   │   ├── fileSystem/  # 파일 시스템 도구
│   │   ├── terminal/    # 터미널 도구
│   │   ├── translate/   # 번역 도구
│   │   ├── index.ts     # 도구 내보내기
│   │   └── toolRegistry.ts # 도구 레지스트리
│   ├── types/           # 타입 정의
│   ├── utils/           # 유틸리티 함수
│   └── index.ts         # 메인 내보내기
├── package.json         # 프로젝트 메타데이터
└── README.md            # 프로젝트 설명
```

## 핵심 컴포넌트

### 1. 에이전트 시스템

#### LangGraph 상태 그래프 (graph.ts)
- LangGraph의 `StateGraph`를 사용하여 워크플로우 구성
- 노드 간 전환을 위한 라우팅 함수 구현
- 다양한 노드로 구성된 그래프 정의

##### LangGraph 워크플로우 다이어그램

```
┼┌─┐                           ┌─────────────┐
┤│ │                           │  __start__  │
├└─┘                           └─────────────┘
┴┬                                    │
                                      ▼
                            ┌──────────────────┐
                            │  translateInput  │
                            └──────────────────┘
                                      │
                                      ▼
                              ┌───────────────┐
                              │  analyzeTask  │
                              └───────────────┘
                                      │
                                      ▼
                             ┌─────────────────┐
                             │  planExecution  │
                             └─────────────────┘
                                      │
  ┌───────────────────────────────────┼──────────────────────────┐
  │                                   │                          │
  │                                   │                          │
  │                            ┌──────▼──────┐                   │
  │                         ┌──┤  routeNode  │                   │
  │                         │  └─────────────┘                   │
  │                         │         │                          │
  │            ┌──────────────────────┼─────────────┐            │
  │            │            │         │             │            │
  │   ┌────────▼────────┐   │         │   ┌─────────▼────────┐   │
  │   │   executeStep   │   │         │   │   verifyResult   │   │
  │   └─────────────────┘   │         │   └──────────────────┘   │
  │            │            │         │             │            │
  └────────────┘            │         │             └────────────┘
                            │         │
                    ┌───────▼──────┐  │
                    │ handlerError │  │
                    └──────────────┘  │
                            │         │
                            └─────────┤
                                      ▼
                           ┌────────────────────┐
                           │  generateResponse  │
                           └────────────────────┘
                                      │
                                      ▼
                               ┌─────────────┐
                               │   __end__   │
                               └─────────────┘
```
이 다이어그램에서:
- `__start__`에서 시작하여 변환, 분석, 계획 수립 단계를 순차적으로 진행합니다.
- `planExecution` 노드 이후에는 조건부 라우팅(routeNode 함수)에 따라 경로가 결정됩니다:
  - 실행 단계가 남아있는 경우 `executeStep`으로 이동
  - 검증이 필요한 경우 `verifyResult`로 이동
  - 그 외의 경우 `generateResponse`로 이동
- `handleError` 노드는 오류 발생 시 호출되며, 처리 후 `generateResponse`로 이동합니다.
- 최종적으로 `__end__` 노드에서 워크플로우가 종료됩니다.

#### 상태 관리 (state.ts)
- `StateAnnotation`을 통한 LangGraph 상태 관리 시스템 구현
- 세 가지 주요 상태 요소:
  - `messages`: 대화 기록 관리
  - `tools`: 에이전트가 사용할 수 있는 도구들
  - `context`: 작업 실행 관련 정보(현재 작업, 메모리, 실행 상태 등)

#### 에이전트 노드 (nodes/ 디렉토리)
다음과 같은 주요 노드들로 구성된 워크플로우 구현:
1. `nodeTranslateInput` (translate-input.ts): 사용자 입력이 영어가 아닐 경우 영어로 번역
2. `nodeAnalyzeTask` (analyze-task.ts): 사용자 요청을 분석하고 하위 작업으로 분류
3. `nodePlanExecution` (plan-execution.ts): 작업 분석을 바탕으로 실행 계획 생성
4. `nodeExecuteStep` (execute-step.ts): 계획의 각 단계를 실행하고 필요한 도구 호출
5. `nodeVerifyResult` (verify-result.ts): 실행 결과 검증 및 오류 처리
6. `nodeGenerateResponse` (generate-response.ts): 사용자에게 최종 응답 생성
7. `nodeHandleError` (handle-error.ts): 발생한 오류 처리 및 사용자에게 알림

각 노드는 독립적인 파일로 구현되어 있으며, 모듈화된 구조를 통해 유지보수성을 높였습니다.

#### 에이전트 관리자 (manager.ts)
- 다양한 모델 제공자(OpenAI, Ollama, Anthropic) 지원
- 에이전트 초기화 및 실행 관리
- 도구 레지스트리를 통한 도구 접근 제공

### 2. CLI 인터페이스

#### CLI 명령어 (cli/index.ts)
다음과 같은 주요 명령어 지원:
- `chat`: 대화형 세션 시작
- `run`: 단일 작업 실행
- `config`: 설정 관리
- `info`: 프로젝트 정보 표시
- `exec`: 쉘 명령어 실행

#### 대화형 세션 기능
- readline 인터페이스를 사용한 대화형 입력 처리
- 슬래시 명령어(`/help`, `/clear`, `/config`, `/info`, `/exec`, `/exit`) 지원
- 명령 실행 중 로딩 표시를 위한 spinner 구현 (spinner-manager.ts)
- 다국어 지원(i18n 모듈)

### 3. 도구 시스템

#### 도구 레지스트리 (toolRegistry.ts)
- 도구 등록 및 접근을 위한 중앙 관리 시스템
- 도구 실행 및 오류 처리 기능 제공

#### 주요 도구 구현
- **파일 시스템 도구**:
  - ReadFileTool: 파일 읽기
  - WriteToFileTool: 파일 쓰기
  - ListFilesTool: 디렉토리 내 파일 목록 조회
  - SearchFilesTool: 파일 검색
- **터미널 도구**:
  - ExecuteCommandTool: 쉘 명령어 실행
- **컨텍스트 도구**:
  - StoreMemoryTool: 메모리에 정보 저장
  - RetrieveMemoryTool: 메모리에서 정보 검색
- **번역 도구**:
  - TranslateTextTool: 텍스트 번역

### 4. 유틸리티 및 설정

- **로깅 시스템**: 디버깅 및 모니터링을 위한 로깅 기능
- **설정 관리**: 환경 변수 및 사용자 설정 관리
- **스피너 관리**: CLI 인터페이스에서 로딩 상태 표시

## 주요 기능

1. **자연어 코딩 요청 처리**: 사용자가 자연어로 코딩 작업을 요청할 수 있음
2. **파일 시스템 작업**: 파일 읽기, 쓰기, 목록 조회, 검색 기능
3. **쉘 명령어 실행**: 터미널 명령어 실행 및 결과 처리
4. **다단계 추론 계획**: 복잡한 작업을 여러 단계로 분할하여 처리
5. **다국어 지원**: 다양한 언어로 사용자 인터페이스 제공 및 입력 번역 기능
6. **다양한 AI 모델 지원**: OpenAI, Anthropic, Ollama 등 다양한 모델 지원
7. **오류 처리 및 복구**: 작업 실행 중 발생하는 오류 처리 및 복구 메커니즘

## 동작 흐름

1. 사용자가 자연어로 작업 요청
2. 필요시 입력 번역 (영어가 아닌 경우)
3. 작업 분석 및 하위 작업으로 분류
4. 실행 계획 수립
5. 계획의 각 단계 순차적 실행
6. 결과 검증 및 필요시 추가 단계 실행
7. 최종 응답 생성 및 사용자에게 전달

## 설치 및 사용 방법

### 설치
```bash
# npm 사용
npm install -g @uhd_kr/codebot

# pnpm 사용
pnpm add -g @uhd_kr/codebot
```

### 사용 방법
```bash
# 대화형 모드
codebot chat

# 특정 모델과 제공자 지정
codebot chat --model gpt-4 --provider openai

# 모델 온도 조정
codebot chat --temperature 0.5

# 단일 작업 실행
codebot run "작업 설명"

# 설정 관리
codebot config

# 프로젝트 정보 표시
codebot info
```

### 환경 설정
`.env` 파일을 생성하고 다음 환경 변수를 설정합니다:

```
# OpenAI API 키
OPENAI_API_KEY=your_openai_api_key

# Ollama 기본 URL (선택 사항)
OLLAMA_BASE_URL=http://localhost:11434

# 디버그 모드 (선택 사항)
DEBUG=true
```

## 결론

Codebot은 LangGraph와 LangChain을 기반으로 한 AI 코딩 도우미로, 복잡한 코딩 작업을 자연어로 요청하고 처리할 수 있는 강력한 CLI 도구입니다. 다단계 추론 시스템을 통해 복잡한 작업을 단계별로 분석하고 실행하며, 다양한 도구를 통해 파일 시스템 작업, 쉘 명령어 실행, 번역 기능 등을 제공합니다. 모듈화된 구조와 확장 가능한 설계로 새로운 기능을 쉽게 추가할 수 있으며, 다양한 AI 모델을 지원하여 사용자의 선호도에 맞게 구성할 수 있습니다.