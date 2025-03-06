import { StateGraph } from '@langchain/langgraph';
import { RunnableConfig } from '@langchain/core/runnables';
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
import { Logger } from '../utils/logger.js';

/**
 * Routing function
 * 라우팅 함수
 * Determines the next node based on the current state
 * 현재 상태에 따라 다음 노드를 결정합니다.
 * @param state Current state (현재 상태)
 * @returns Next node name (다음 노드 이름)
 */
function routeNode(state: State): string {
  // If in error state, go to error handling node
  // 오류 상태인 경우 오류 처리 노드로 이동
  if (state.context.executionStatus === 'error') {
    Logger.graphState('Router Decision', 'Route to handleError due to error state');
    return 'handleError';
  }

  // If execution plan exists and current step remains, go to step execution node
  // 실행 계획이 있고 현재 단계가 남아있는 경우 단계 실행 노드로 이동
  if (
    state.context.executionPlan &&
    state.context.currentStepIndex !== undefined &&
    state.context.totalSteps !== undefined &&
    state.context.currentStepIndex < state.context.totalSteps
  ) {
    Logger.graphState('Router Decision', `Route to executeStep (${state.context.currentStepIndex}/${state.context.totalSteps})`);
    return 'executeStep';
  }

  // If execution is completed but verification is needed, go to verification node
  // 실행이 완료되었지만 검증이 필요한 경우 검증 노드로 이동
  if (
    state.context.executionStatus === 'completed' &&
    state.context.verified === undefined
  ) {
    Logger.graphState('Router Decision', 'Route to verifyResult for verification');
    return 'verifyResult';
  }

  // If verification is completed, go to response generation node
  // 검증이 완료된 경우 응답 생성 노드로 이동
  if (state.context.verified !== undefined) {
    Logger.graphState('Router Decision', 'Route to generateResponse after verification');
    return 'generateResponse';
  }

  // Default to response generation node
  // 기본적으로 응답 생성 노드로 이동
  Logger.graphState('Router Decision', 'Default route to generateResponse');
  return 'generateResponse';
}

/**
 * Graph builder
 * 그래프 빌더
 * Configures the LangGraph state graph
 * LangGraph 상태 그래프를 구성합니다.
 */
const builder = new StateGraph(StateAnnotation);

// Add nodes
// 노드 추가
builder
  .addNode('translateInput', nodeTranslateInput)
  .addNode('analyzeTask', nodeAnalyzeTask)
  .addNode('planExecution', nodePlanExecution)
  .addNode('executeStep', nodeExecuteStep)
  .addNode('verifyResult', nodeVerifyResult)
  .addNode('generateResponse', nodeGenerateResponse)
  .addNode('handleError', nodeHandleError);

// Add edges - using type assertion while maintaining method chaining
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

// Compile graph
// 그래프 컴파일
export const codebotGraph = builder.compile();

// Wrap the original invoke method to add logging
// 원본 invoke 메소드를 래핑하여 로깅을 추가합니다
const originalInvoke = codebotGraph.invoke;

// 화살표 함수로 변경하여 this 컨텍스트 문제 해결
codebotGraph.invoke = async (state: State, config?: any) => {
  Logger.graphState('Graph Execution Started', {
    executionStatus: state.context.executionStatus,
    messageCount: state.messages.length
  });

  try {
    // 명시적으로 codebotGraph에 바인딩하여 this 문제 해결
    const result = await originalInvoke.call(codebotGraph, state, config);

    Logger.graphState('Graph Execution Completed', {
      executionStatus: result.context.executionStatus,
      messageCount: result.messages.length,
      currentStepIndex: result.context.currentStepIndex,
      totalSteps: result.context.totalSteps
    });

    return result;
  } catch (error) {
    Logger.error('Error during graph execution', error);
    throw error;
  }
};