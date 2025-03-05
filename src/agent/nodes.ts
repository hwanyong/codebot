import { ChatPromptTemplate } from '@langchain/core/prompts';
import { RunnableConfig } from '@langchain/core/runnables';
import { HumanMessage, AIMessage } from '@langchain/core/messages';
import { State, Update } from './state.js';
import { TaskAnalysis, ExecutionPlan, ToolExecutionResult, ContextState } from '../types/index.js';
import {
  TRANSLATE_INPUT_PROMPT,
  TASK_ANALYSIS_PROMPT,
  PLANNING_PROMPT,
  EXECUTE_STEP_PROMPT,
  VERIFY_RESULT_PROMPT,
  GENERATE_RESPONSE_PROMPT,
  HANDLE_ERROR_PROMPT
} from '../prompts/index.js';

/**
 * Input translation node
 * 입력 번역 노드
 * Translates non-English input to English
 * 비영어 입력을 영어로 번역합니다
 * @param state Current state (현재 상태)
 * @returns State update (상태 업데이트)
 */
export async function nodeTranslateInput(state: State): Promise<Update> {
  // Get the last user message
  // 마지막 사용자 메시지 가져오기
  const lastMessage = state.messages[state.messages.length - 1];

  // Check if the message is already in English
  // 메시지가 이미 영어인지 확인
  const isEnglish = /^[a-zA-Z\s.,!?;:()\[\]{}'"0-9-_]+$/.test(lastMessage.content as string);

  // If already in English, don't translate
  // 이미 영어인 경우 번역하지 않음
  if (isEnglish) {
    // Type assertion is needed due to limitations in LangGraph's type system
    // LangGraph의 타입 시스템 제한으로 인해 타입 단언이 필요합니다
    // context is defined as Partial<ContextState>,
    // but in reality it will be merged with the existing state inside LangGraph
    // context는 Partial<ContextState>로 정의되어 있지만,
    // 실제로는 LangGraph 내부에서 기존 상태와 병합됩니다
    return {
      context: {
        ...state.context,
        executionStatus: 'running'
      } as any // Type assertion needed (타입 단언 필요)
    };
  }

  // Create translation prompt
  // 번역 프롬프트 생성
  const translatePrompt = ChatPromptTemplate.fromTemplate(TRANSLATE_INPUT_PROMPT);

  // Render prompt
  // 프롬프트 렌더링
  const promptValue = await translatePrompt.formatMessages({
    user_request: lastMessage.content
  });

  // Model call configuration
  // 모델 호출 설정
  const config: RunnableConfig = {
    configurable: {
      model: state.context.model
    }
  };

  // Call model
  // 모델 호출
  const result = await state.context.model.invoke(promptValue, config);

  // Add translated message
  // 번역된 메시지 추가
  const aiMessage = new AIMessage(result.content as string);
  const contextUpdate: Partial<ContextState> = {
    ...state.context,
    executionStatus: 'running'
  };

  return {
    messages: [aiMessage],
    context: {
      ...state.context,
      executionStatus: 'running'
    } as any
  };
}

/**
 * Task analysis node
 * 태스크 분석 노드
 * Analyzes user request and classifies it into subtasks
 * 사용자 요청을 분석하고 하위 작업으로 분류합니다
 * @param state Current state (현재 상태)
 * @returns State update (상태 업데이트)
 */
export async function nodeAnalyzeTask(state: State): Promise<Update> {
  // Get the last user message
  // 마지막 사용자 메시지 가져오기
  const lastMessage = state.messages[state.messages.length - 1];

  // Create task analysis prompt
  // 태스크 분석 프롬프트 생성
  const taskAnalysisPrompt = ChatPromptTemplate.fromTemplate(TASK_ANALYSIS_PROMPT);

  // Render prompt
  // 프롬프트 렌더링
  const promptValue = await taskAnalysisPrompt.formatMessages({
    user_request: lastMessage.content
  });

  // Model call configuration
  // 모델 호출 설정
  const config: RunnableConfig = {
    configurable: {
      model: state.context.model
    }
  };

  // Call model
  // 모델 호출
  const result = await state.context.model.invoke(promptValue, config);

  // Parse JSON response
  // JSON 응답 파싱
  let taskAnalysis: TaskAnalysis;
  try {
    const content = result.content as string;
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/({[\s\S]*})/);

    if (jsonMatch) {
      taskAnalysis = JSON.parse(jsonMatch[1]);
    } else {
      taskAnalysis = JSON.parse(content);
    }
  } catch (error) {
    return {
      context: {
        ...state.context,
        lastError: {
          message: 'Unable to parse task analysis result.',
          timestamp: new Date().toISOString(),
          type: 'ParseError',
          stack: error instanceof Error ? error.stack : undefined
        },
        executionStatus: 'error'
      } as any
    };
  }

  // Save analysis result
  // 분석 결과 저장
  const aiMessage = new AIMessage(result.content as string);
  return {
    messages: [aiMessage],
    context: {
      currentTask: taskAnalysis,
      executionStatus: 'running'
    } as any
  };
}

/**
 * Plan execution node
 * 계획 실행 노드
 * Generates execution plan based on task analysis
 * 태스크 분석을 기반으로 실행 계획을 생성합니다
 * @param state Current state (현재 상태)
 * @returns State update (상태 업데이트)
 */
export async function nodePlanExecution(state: State): Promise<Update> {
  // Get task analysis
  // 태스크 분석 가져오기
  const taskAnalysis = state.context.currentTask;

  if (!taskAnalysis) {
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

  // Create planning prompt
  // 계획 실행 프롬프트 생성
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

  // Call model
  // 모델 호출
  const result = await state.context.model.invoke(promptValue, config);

  // Parse JSON response
  // JSON 응답 파싱
  let executionPlan: ExecutionPlan;
  try {
    const content = result.content as string;
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/({[\s\S]*})/);

    if (jsonMatch) {
      executionPlan = JSON.parse(jsonMatch[1]);
    } else {
      executionPlan = JSON.parse(content);
    }
  } catch (error) {
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

  // Save execution plan
  // 실행 계획 저장
  return {
    messages: [new AIMessage(result.content as string)],
    context: {
      ...state.context,
      executionPlan,
      totalSteps: executionPlan.plan.length,
      currentStepIndex: 0,
      executionResults: [],
      executionStatus: 'running'
    } as any
  };
}

/**
 * Step execution node
 * 단계 실행 노드
 * Executes the current step of the plan
 * 계획의 현재 단계를 실행합니다
 * @param state Current state (현재 상태)
 * @returns State update (상태 업데이트)
 */
export async function nodeExecuteStep(state: State): Promise<Update> {
  // Get execution plan and current step
  // 실행 계획 및 현재 단계 가져오기
  const { executionPlan, currentStepIndex, totalSteps } = state.context;

  if (!executionPlan || currentStepIndex === undefined || currentStepIndex >= (totalSteps ?? 0)) {
    return {
      context: {
        ...state.context,
        lastError: {
          message: 'No step to execute.',
          timestamp: new Date().toISOString(),
          type: 'MissingStep',
          stack: undefined
        },
        executionStatus: 'error'
      } as any
    };
  }

  // Get current step
  // 현재 단계 가져오기
  const currentStep = executionPlan.plan[currentStepIndex];

  // Create list of available tools
  // 사용 가능한 도구 목록 생성
  const availableTools = state.tools.map(tool => ({
    name: tool.name,
    description: tool.description
  }));

  // Create step execution prompt
  // 단계 실행 프롬프트 생성
  const executeStepPrompt = ChatPromptTemplate.fromTemplate(EXECUTE_STEP_PROMPT);

  // Render prompt
  // 프롬프트 렌더링
  const promptValue = await executeStepPrompt.formatMessages({
    current_step: JSON.stringify(currentStep, null, 2),
    available_tools: JSON.stringify(availableTools, null, 2)
  });

  // Model call configuration
  // 모델 호출 설정
  const config: RunnableConfig = {
    configurable: {
      model: state.context.model
    }
  };

  // Call model
  // 모델 호출
  const result = await state.context.model.invoke(promptValue, config);

  // Extract tool call
  // 도구 호출 추출
  let toolCall: { tool: string; input: any } | null = null;
  try {
    const content = result.content as string;
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/({[\s\S]*})/);

    if (jsonMatch) {
      toolCall = JSON.parse(jsonMatch[1]);
    } else if (content.includes('"tool":') && content.includes('"input":')) {
      toolCall = JSON.parse(content);
    }
  } catch (error) {
    // Tool call parsing error
    // 도구 호출 파싱 오류
    return {
      context: {
        ...state.context,
        lastError: {
          message: 'Unable to parse tool call.',
          timestamp: new Date().toISOString(),
          type: 'ParseError',
          stack: error instanceof Error ? error.stack : undefined
        },
        executionStatus: 'error'
      } as any
    };
  }

  // If no tool call
  // 도구 호출이 없는 경우
  if (!toolCall) {
    // Move to next step
    // 다음 단계로 이동
    const executionResults = [...(state.context.executionResults || []), {
      step_id: currentStep.step_id,
      result: {
        success: true,
        message: 'Step completed without tool call'
      }
    }];

    return {
      messages: [new AIMessage(result.content as string)],
      context: {
        ...state.context,
        currentStepIndex: currentStepIndex + 1,
        executionResults,
        executionStatus: currentStepIndex + 1 >= (totalSteps ?? 0) ? 'completed' : 'running'
      } as any
    };
  }

  // Execute tool
  // 도구 실행
  let toolResult: ToolExecutionResult;
  try {
    // Find tool
    // 도구 찾기
    const tool = state.tools.find(t => t.name === toolCall!.tool);

    if (!tool) {
      throw new Error(`Tool not found: ${toolCall!.tool}`);
    }

    // Execute tool
    // 도구 실행
    const result = await tool.execute(toolCall!.input);

    toolResult = {
      success: result.success !== false,
      result,
      error: result.success === false ? result.error : undefined
    };
  } catch (error: any) {
    // Tool execution error
    // 도구 실행 오류
    toolResult = {
      success: false,
      result: null,
      error: error.message
    };
  }

  // Save execution result
  // 실행 결과 저장
  const executionResults = [...(state.context.executionResults || []), {
    step_id: currentStep.step_id,
    tool: toolCall.tool,
    input: toolCall.input,
    result: toolResult
  }];

  // Move to next step
  // 다음 단계로 이동
  return {
    context: {
      ...state.context,
      currentStepIndex: currentStepIndex + 1,
      executionResults,
      executionStatus: currentStepIndex + 1 >= (totalSteps ?? 0) ? 'completed' : 'running',
      currentTool: null
    } as any
  };
}

/**
 * Result verification node
 * 결과 검증 노드
 * Verifies execution results and handles errors
 * 실행 결과를 검증하고 오류를 처리합니다
 * @param state Current state (현재 상태)
 * @returns State update (상태 업데이트)
 */
export async function nodeVerifyResult(state: State): Promise<Update> {
  // Get execution results and plan
  // 실행 결과 및 계획 가져오기
  const { executionResults, executionPlan } = state.context;

  if (!executionResults || !executionPlan) {
    return {
      context: {
        ...state.context,
        lastError: {
          message: 'No execution results to verify.',
          timestamp: new Date().toISOString(),
          type: 'MissingResults',
          stack: undefined
        },
        executionStatus: 'error'
      } as any
    };
  }

  // Create result verification prompt
  // 결과 검증 프롬프트 생성
  const verifyResultPrompt = ChatPromptTemplate.fromTemplate(VERIFY_RESULT_PROMPT);

  // Render prompt
  // 프롬프트 렌더링
  const promptValue = await verifyResultPrompt.formatMessages({
    execution_results: JSON.stringify(executionResults, null, 2),
    original_plan: JSON.stringify(executionPlan, null, 2)
  });

  // Model call configuration
  // 모델 호출 설정
  const config: RunnableConfig = {
    configurable: {
      model: state.context.model
    }
  };

  // Call model
  // 모델 호출
  const result = await state.context.model.invoke(promptValue, config);

  // Parse verification result
  // 검증 결과 파싱
  let verificationReport;
  try {
    const content = result.content as string;
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/({[\s\S]*})/);

    if (jsonMatch) {
      verificationReport = JSON.parse(jsonMatch[1]);
    } else {
      verificationReport = JSON.parse(content);
    }
  } catch (error) {
    return {
      context: {
        ...state.context,
        lastError: {
          message: 'Unable to parse verification result.',
          timestamp: new Date().toISOString(),
          type: 'ParseError',
          stack: error instanceof Error ? error.stack : undefined
        },
        executionStatus: 'error'
      } as any
    };
  }

  // If additional steps are needed
  // 추가 단계가 필요한 경우
  if (verificationReport.additional_steps && verificationReport.additional_steps.length > 0) {
    // Add additional steps to execution plan
    // 실행 계획에 추가 단계 추가
    const updatedPlan = {
      ...executionPlan,
      plan: [...executionPlan.plan, ...verificationReport.additional_steps]
    };

    return {
      messages: [new AIMessage(result.content as string)],
      context: {
        ...state.context,
        executionPlan: updatedPlan,
        totalSteps: updatedPlan.plan.length,
        verificationReport,
        requiresFollowUp: true,
        executionStatus: 'running'
      } as any
    };
  }

  // Verification complete
  // 검증 완료
  return {
    messages: [new AIMessage(result.content as string)],
    context: {
      ...state.context,
      verificationReport,
      verified: verificationReport.success,
      executionStatus: verificationReport.success ? 'completed' : 'error'
    } as any
  };
}

/**
 * Response generation node
 * 응답 생성 노드
 * Generates final response for the user
 * 사용자에게 최종 응답을 생성합니다
 * @param state Current state (현재 상태)
 * @returns State update (상태 업데이트)
 */
export async function nodeGenerateResponse(state: State): Promise<Update> {
  // Get original request, execution results, and verification report
  // 원래 요청, 실행 결과, 검증 보고서 가져오기
  const { executionResults, verificationReport } = state.context;
  const originalRequest = state.messages[0].content;

  // Create response generation prompt
  // 응답 생성 프롬프트 생성
  const generateResponsePrompt = ChatPromptTemplate.fromTemplate(GENERATE_RESPONSE_PROMPT);

  // Render prompt
  // 프롬프트 렌더링
  const promptValue = await generateResponsePrompt.formatMessages({
    original_request: originalRequest,
    execution_results: JSON.stringify(executionResults, null, 2),
    verification_report: JSON.stringify(verificationReport, null, 2)
  });

  // Model call configuration
  // 모델 호출 설정
  const config: RunnableConfig = {
    configurable: {
      model: state.context.model
    }
  };

  // Call model
  // 모델 호출
  const result = await state.context.model.invoke(promptValue, config);

  // Return final response
  // 최종 응답 반환
  return {
    messages: [new AIMessage(result.content as string)],
    context: {
      ...state.context,
      executionStatus: 'completed'
    } as any
  };
}

/**
 * Error handling node
 * 오류 처리 노드
 * Processes occurred errors
 * 발생한 오류를 처리합니다
 * @param state Current state (현재 상태)
 * @returns State update (상태 업데이트)
 */
export async function nodeHandleError(state: State): Promise<Update> {
  // Get error information
  // 오류 정보 가져오기
  const { lastError } = state.context;

  if (!lastError) {
    return {
      context: {
        ...state.context,
        executionStatus: 'error'
      } as any
    };
  }

  // Create error handling prompt
  // 오류 처리 프롬프트 생성
  const handleErrorPrompt = ChatPromptTemplate.fromTemplate(HANDLE_ERROR_PROMPT);

  // Render prompt
  // 프롬프트 렌더링
  const promptValue = await handleErrorPrompt.formatMessages({
    error_info: JSON.stringify(lastError, null, 2),
    context: JSON.stringify({
      currentTask: state.context.currentTask,
      currentStepIndex: state.context.currentStepIndex,
      totalSteps: state.context.totalSteps
    }, null, 2)
  });

  // Model call configuration
  // 모델 호출 설정
  const config: RunnableConfig = {
    configurable: {
      model: state.context.model
    }
  };

  // Call model
  // 모델 호출
  const result = await state.context.model.invoke(promptValue, config);

  // Parse error handling result
  // 오류 처리 결과 파싱
  let errorHandling;
  try {
    const content = result.content as string;
    const jsonMatch = content.match(/```json\n([\\s\S]*?)\n```/) || content.match(/({[\s\S]*})/);

    if (jsonMatch) {
      errorHandling = JSON.parse(jsonMatch[1]);
    } else {
      errorHandling = JSON.parse(content);
    }
  } catch (error) {
    // Use original response if parsing fails
    // 파싱 오류 시 원본 응답 사용
    errorHandling = {
      error_type: lastError.type,
      cause: lastError.message,
      resolution: 'Unable to resolve error.',
      user_message: result.content
    };
  }

  // Return error handling result
  // 오류 처리 결과 반환
  return {
    messages: [new AIMessage(errorHandling.user_message)],
    context: {
      ...state.context,
      errorHandling,
      executionStatus: 'error'
    } as any
  };
}