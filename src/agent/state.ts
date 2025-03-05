import { Annotation } from '@langchain/langgraph';
import { BaseMessage } from '@langchain/core/messages';
import { ContextState, Tool } from '../types/index.js';

/**
 * 메시지 상태 리듀서
 * @param left 기존 메시지 배열
 * @param right 새 메시지 배열
 * @returns 병합된 메시지 배열
 */
function messagesStateReducer(left: BaseMessage[], right: BaseMessage[]): BaseMessage[] {
  return [...left, ...right];
}

/**
 * 상태 어노테이션
 * LangGraph의 상태 관리를 위한 어노테이션 정의
 */
export const StateAnnotation = Annotation.Root({
  // 메시지는 대화 기록을 추적합니다
  messages: Annotation<BaseMessage[], BaseMessage[]>({
    reducer: messagesStateReducer,
    default: () => [],
    value: (left, right) => [...left, ...right]
  }),

  // 에이전트가 사용할 수 있는 도구들
  tools: Annotation<Tool[]>({
    default: () => [],
    value: (left, right) => [...left, ...right]
  }),

  // 컨텍스트 정보
  context: Annotation<ContextState>({
    default: () => ({
      currentTask: null,
      memory: {},
      currentTool: null,
      lastError: null,
      executionStatus: 'idle',
      extractedCode: null,
      requiresFollowUp: false,
      environmentDetails: {
        cwd: process.cwd(),
        platform: process.platform,
        nodeVersion: process.version
      },
      model: null
    }),
    value: (left, right) => ({ ...left, ...right })
  })
});

// 상태 및 업데이트 타입 내보내기
export type State = typeof StateAnnotation.State;
export type Update = typeof StateAnnotation.Update;