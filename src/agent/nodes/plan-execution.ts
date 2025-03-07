import { ChatPromptTemplate } from '@langchain/core/prompts';
import { RunnableConfig } from '@langchain/core/runnables';
import { AIMessage } from '@langchain/core/messages';
import { State, Update } from '../state.js';
import { ExecutionPlan } from '../../types/index.js';
import { PLANNING_PROMPT } from '../../prompts/index.js';
import { Logger } from '../../utils/logger.js';

/**
 * Plan execution node
 * 계획 실행 노드
 * Generates execution plan based on task analysis
 * 태스크 분석을 기반으로 실행 계획을 생성합니다
 * @param state Current state (현재 상태)
 * @returns State update (상태 업데이트)
 *
 * Generated by Copilot
 */
export async function nodePlanExecution(state: State): Promise<Update> {
  Logger.nodeEntry('planExecution');

  // Get task analysis
  // 태스크 분석 가져오기
  const taskAnalysis = state.context.currentTask;

  if (!taskAnalysis) {
    Logger.error('No task analysis result available');
    Logger.nodeExit('planExecution', 'error');

    return {
      context: {
        ...state.context,
        lastError: {
          message: 'No task analysis result available.',
          timestamp: new Date().toISOString(),
          type: 'MissingTaskAnalysis',
          stack: undefined
        },
        executionStatus: 'error'
      } as any
    };
  }

  // Check if task is a simple response that doesn't require tool execution
  // 도구 실행이 필요 없는 단순 응답인지 확인
  if (taskAnalysis.task_type === 'simple_response' ||
      (taskAnalysis.subtasks && taskAnalysis.subtasks.length === 0)) {
    Logger.nodeAction('planExecution', 'Task requires only direct response without tool execution');

    // Mark this as a direct response case
    // 직접 응답 케이스로 표시
    return {
      context: {
        ...state.context,
        executionPlan: null,
        requiresToolExecution: false,
        directResponse: true,
        executionStatus: 'completed'
      } as any
    };
  }

  // Create planning prompt
  // 계획 실행 프롬프트 생성
  Logger.nodeAction('planExecution', 'Creating planning prompt');
  const planningPrompt = ChatPromptTemplate.fromTemplate(PLANNING_PROMPT);

  // Render prompt
  // 프롬프트 렌더링
  const promptValue = await planningPrompt.formatMessages({
    task_analysis: JSON.stringify(taskAnalysis, null, 2)
  });

  // Model call configuration
  // 모델 호출 설정
  const config: RunnableConfig = {
    configurable: {
      model: state.context.model
    }
  };

  try {
    // Call model with streaming
    // 스트리밍으로 모델 호출
    Logger.nodeAction('planExecution', 'Calling model for execution planning');
    Logger.nodeModelStart('planExecution', 'Starting model streaming for execution planning');

    // Stream response using the model's streaming capability
    // 모델의 스트리밍 기능을 사용하여 응답 스트리밍
    const stream = await state.context.model.stream(promptValue, config);

    // Collect the full response while streaming individual tokens
    // 개별 토큰을 스트리밍하면서 전체 응답 수집
    let resultContent = '';
    for await (const chunk of stream) {
      const content = chunk.content;
      if (content) {
        // 모델 스트리밍 이벤트 발생
        Logger.nodeModelStreaming('planExecution', content);
        resultContent += content;
      }
    }

    // 모델 응답 완료 이벤트 발생
    Logger.nodeModelEnd('planExecution');

    // Parse JSON response
    // JSON 응답 파싱
    Logger.nodeAction('planExecution', 'Parsing execution plan');
    let executionPlan: ExecutionPlan;
    try {
      const jsonMatch = resultContent.match(/```json\n([\s\S]*?)\n```/) || resultContent.match(/({[\s\S]*})/);
      if (jsonMatch) {
        executionPlan = JSON.parse(jsonMatch[1]);
      } else {
        executionPlan = JSON.parse(resultContent);
      }
      Logger.nodeAction('planExecution', `Execution plan created with ${executionPlan.plan.length} steps`);
      Logger.graphState('Execution Plan', executionPlan);
    } catch (error) {
      Logger.error('Failed to parse execution plan', error);
      Logger.nodeExit('planExecution', 'error');
      return {
        context: {
          ...state.context,
          lastError: {
            message: 'Unable to parse execution plan.',
            timestamp: new Date().toISOString(),
            type: 'ParseError',
            stack: error instanceof Error ? error.stack : undefined
          },
          executionStatus: 'error'
        } as any
      };
    }

    // Check if plan is empty or contains only direct response steps
    // 계획이 비어 있거나 직접 응답 단계만 포함하는지 확인
    if (executionPlan.plan.length === 0 ||
        (executionPlan.plan.length === 1 && executionPlan.plan[0].tool === 'direct_response')) {
      Logger.nodeAction('planExecution', 'Plan indicates direct response without tool execution');
      return {
        messages: [new AIMessage(resultContent)],
        context: {
          ...state.context,
          executionPlan,
          requiresToolExecution: false,
          directResponse: true,
          executionStatus: 'completed'
        } as any
      };
    }

    // Save execution plan
    // 실행 계획 저장
    Logger.nodeExit('planExecution');
    return {
      messages: [new AIMessage(resultContent)],
      context: {
        ...state.context,
        executionPlan,
        totalSteps: executionPlan.plan.length,
        currentStepIndex: 0,
        executionResults: [],
        requiresToolExecution: true,
        directResponse: false,
        executionStatus: 'running'
      } as any
    };
  } catch (error) {
    Logger.error('Error in plan execution', error);
    Logger.nodeExit('planExecution', 'error');
    throw error;
  }
}