import { StateGraph } from '@langchain/langgraph';
import { StateAnnotation, State } from './state.js';
import {
  nodeTranslateInput,
  nodeAnalyzeTask,
  nodePlanExecution,
  nodeExecuteStep,
  nodeVerifyResult,
  nodeGenerateResponse,
  nodeHandleError
} from './nodes.js';

/**
 * 라우팅 함수
 * 현재 상태에 따라 다음 노드를 결정합니다.
 * @param state 현재 상태
 * @returns 다음 노드 이름
 */
function routeNode(state: State): string {
  // 오류 상태인 경우 오류 처리 노드로 이동
  if (state.context.executionStatus === 'error') {
    return 'handleError';
  }

  // 실행 계획이 있고 현재 단계가 남아있는 경우 단계 실행 노드로 이동
  if (
    state.context.executionPlan &&
    state.context.currentStepIndex !== undefined &&
    state.context.totalSteps !== undefined &&
    state.context.currentStepIndex < state.context.totalSteps
  ) {
    return 'executeStep';
  }

  // 실행이 완료되었지만 검증이 필요한 경우 검증 노드로 이동
  if (
    state.context.executionStatus === 'completed' &&
    state.context.verified === undefined
  ) {
    return 'verifyResult';
  }

  // 검증이 완료된 경우 응답 생성 노드로 이동
  if (state.context.verified !== undefined) {
    return 'generateResponse';
  }

  // 기본적으로 응답 생성 노드로 이동
  return 'generateResponse';
}

/**
 * 그래프 빌더
 * LangGraph 상태 그래프를 구성합니다.
 */
const builder = new StateGraph(StateAnnotation);

// 노드 추가
builder
  .addNode('translateInput', nodeTranslateInput)
  .addNode('analyzeTask', nodeAnalyzeTask)
  .addNode('planExecution', nodePlanExecution)
  .addNode('executeStep', nodeExecuteStep)
  .addNode('verifyResult', nodeVerifyResult)
  .addNode('generateResponse', nodeGenerateResponse)
  .addNode('handleError', nodeHandleError);

// 엣지 추가 - 타입 단언 사용하되 메서드 체이닝 유지
builder
  .addEdge("__start__" as any, "translateInput" as any)
  .addEdge("translateInput" as any, "analyzeTask" as any)
  .addEdge("analyzeTask" as any, "planExecution" as any)
  .addConditionalEdges("planExecution" as any, routeNode)
  .addConditionalEdges("executeStep" as any, routeNode)
  .addConditionalEdges("verifyResult" as any, routeNode)
  .addEdge("handleError" as any, "generateResponse" as any)
  .addEdge("generateResponse" as any, "__end__" as any);

// 그래프 컴파일
export const codebotGraph = builder.compile();