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
import { Logger } from '../utils/logger.js';

/**
 * Input translation node
 * 입력 번역 노드
 * Translates non-English input to English for further processing
 * 비영어 입력을 영어로 번역하여 추가 처리를 준비합니다
 * @param state Current state (현재 상태)
 * @returns State update (상태 업데이트)
 *
 * Generated by Copilot
 */
export async function nodeTranslateInput(state: State): Promise<Update> {
  Logger.nodeEntry('translateInput');

  // Get the last user message
  // 마지막 사용자 메시지 가져오기
  const lastMessage = state.messages[state.messages.length - 1];

  // Check if the message is already in English
  // 메시지가 이미 영어인지 확인
  const isEnglish = /^[a-zA-Z\s.,!?;:()\[\]{}'"0-9-_]+$/.test(lastMessage.content as string);

  // If already in English, don't translate
  // 이미 영어인 경우 번역하지 않음
  if (isEnglish) {
    Logger.nodeAction('translateInput', 'Message is already in English, skipping translation');

    Logger.nodeExit('translateInput');
    return {
      context: {
        ...state.context,
        executionStatus: 'running'
      } as any
    };
  }

  // Create translation prompt
  // 번역 프롬프트 생성
  Logger.nodeAction('translateInput', 'Creating translation prompt');
  const translatePrompt = ChatPromptTemplate.fromTemplate(TRANSLATE_INPUT_PROMPT);

  // Model call configuration
  // 모델 호출 설정
  const config: RunnableConfig = {
    configurable: {
      model: state.context.model
    }
  };

  try {
    // Use a simplified approach to avoid the formatMessages issue
    // ChatPromptTemplate 문제를 피하기 위해 간소화된 접근 방식 사용
    Logger.nodeAction('translateInput', 'Creating direct prompt');

    // Create a formatted prompt directly
    // 직접 형식화된 프롬프트 생성
    const formattedPrompt = TRANSLATE_INPUT_PROMPT.replace('{user_request}', lastMessage.content as string)
                                             .replace('{translated_message}', '[translated content will be here]');

    const promptValue = [new HumanMessage(formattedPrompt)];

    // Call model
    // 모델 호출
    Logger.nodeAction('translateInput', 'Calling model for translation');
    const result = await state.context.model.invoke(promptValue, config);

    // Extract only the translated content without any explanations or metadata
    // 설명이나 메타데이터 없이 번역된 내용만 추출
    let translatedText = result.content as string;

    // Clean the translated text by removing any explanations or formatting
    // 번역된 텍스트에서 설명이나 형식을 제거하여 정리
    translatedText = translatedText
      // Remove "Translation:" prefix if present
      .replace(/^(Translation:|Translated text:|Here is the translation:|English translation:)/i, '')
      // Remove quotes if present
      .replace(/^['"](.*)['"]$/s, '$1')
      // Extract content between message start/end markers if present
      .replace(/.*?---message start---\s*([\s\S]*?)\s*---message end---.*/s, '$1')
      // Cleanup any trailing explanations
      .replace(/\n\n(Note:|I've translated|This is a translation|explanation:).*/is, '')
      .trim();

    Logger.nodeAction('translateInput', 'Translation completed and cleaned');

    // Create a clean message with just the translated content
    // 번역된 내용만으로 깨끗한 메시지 생성
    const aiMessage = new AIMessage(translatedText);

    const contextUpdate: Partial<ContextState> = {
      ...state.context,
      executionStatus: 'running'
    };

    Logger.nodeExit('translateInput');
    return {
      messages: [aiMessage],
      context: contextUpdate as any
    };
  } catch (error) {
    Logger.error('Error in translation', error);
    Logger.nodeExit('translateInput', 'error');
    throw error;
  }
}

/**
 * Task analysis node
 * 태스크 분석 노드
 * Analyzes user request and classifies it into subtasks
 * 사용자 요청을 분석하고 하위 작업으로 분류합니다
 * @param state Current state (현재 상태)
 * @returns State update (상태 업데이트)
 *
 * Generated by Copilot
 */
export async function nodeAnalyzeTask(state: State): Promise<Update> {
  Logger.nodeEntry('analyzeTask');

  // Get the last user message
  // 마지막 사용자 메시지 가져오기
  const lastMessage = state.messages[state.messages.length - 1];

  // Create task analysis prompt using direct approach to avoid template issues
  // 템플릿 문제를 피하기 위해 직접 접근 방식을 사용하여 작업 분석 프롬프트 생성
  Logger.nodeAction('analyzeTask', 'Creating task analysis prompt');

  // Format the prompt directly to avoid template parsing issues with JSON braces
  // JSON 중괄호로 인한 템플릿 파싱 문제를 피하기 위해 프롬프트를 직접 포맷팅
  const formattedPrompt = TASK_ANALYSIS_PROMPT.replace('{user_request}', lastMessage.content as string);
  const promptValue = [new HumanMessage(formattedPrompt)];

  // Model call configuration
  // 모델 호출 설정
  const config: RunnableConfig = {
    configurable: {
      model: state.context.model
    }
  };

  try {
    // Call model
    // 모델 호출
    Logger.nodeAction('analyzeTask', 'Calling model for task analysis');
    const result = await state.context.model.invoke(promptValue, config);

    // Parse JSON response
    // JSON 응답 파싱
    Logger.nodeAction('analyzeTask', 'Parsing task analysis result');
    let taskAnalysis: TaskAnalysis;
    try {
      const content = result.content as string;
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/({[\s\S]*})/);

      if (jsonMatch) {
        taskAnalysis = JSON.parse(jsonMatch[1]);
      } else {
        taskAnalysis = JSON.parse(content);
      }

      Logger.nodeAction('analyzeTask', `Task analysis complete with ${taskAnalysis.subtasks?.length || 0} subtasks`);
      Logger.graphState('Task Analysis', taskAnalysis);
    } catch (error) {
      Logger.error('Failed to parse task analysis', error);
      Logger.nodeExit('analyzeTask', 'error');

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

    Logger.nodeExit('analyzeTask');
    return {
      messages: [aiMessage],
      context: {
        currentTask: taskAnalysis,
        executionStatus: 'running'
      } as any
    };
  } catch (error) {
    Logger.error('Error in task analysis', error);
    Logger.nodeExit('analyzeTask', 'error');
    throw error;
  }
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
    // Call model
    // 모델 호출
    Logger.nodeAction('planExecution', 'Calling model for execution planning');
    const result = await state.context.model.invoke(promptValue, config);

    // Parse JSON response
    // JSON 응답 파싱
    Logger.nodeAction('planExecution', 'Parsing execution plan');
    let executionPlan: ExecutionPlan;
    try {
      const content = result.content as string;
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/({[\s\S]*})/);
      if (jsonMatch) {
        executionPlan = JSON.parse(jsonMatch[1]);
      } else {
        executionPlan = JSON.parse(content);
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

    // Save execution plan
    // 실행 계획 저장
    Logger.nodeExit('planExecution');
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
  } catch (error) {
    Logger.error('Error in plan execution', error);
    Logger.nodeExit('planExecution', 'error');
    throw error;
  }
}

/**
 * Step execution node
 * 단계 실행 노드
 * Executes the current step of the plan
 * 계획의 현재 단계를 실행합니다
 * @param state Current state (현재 상태)
 * @returns State update (상태 업데이트)
 *
 * Generated by Copilot
 */
export async function nodeExecuteStep(state: State): Promise<Update> {
  Logger.nodeEntry('executeStep');

  // Get execution plan and current step
  // 실행 계획 및 현재 단계 가져오기
  const { executionPlan, currentStepIndex, totalSteps } = state.context;

  if (!executionPlan || currentStepIndex === undefined || currentStepIndex >= (totalSteps ?? 0)) {
    Logger.error(`Invalid execution state: plan=${!!executionPlan}, currentStepIndex=${currentStepIndex}, totalSteps=${totalSteps}`);
    Logger.nodeExit('executeStep', 'error');

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
  Logger.nodeAction('executeStep', `Executing step ${currentStepIndex + 1}/${totalSteps}: ${currentStep.step_id}`);
  Logger.graphState(`Current Step (${currentStep.step_id})`, currentStep);

  // Create list of available tools
  // 사용 가능한 도구 목록 생성
  const availableTools = state.tools.map(tool => ({
    name: tool.name,
    description: tool.description
  }));

  // Create step execution prompt
  // 단계 실행 프롬프트 생성
  Logger.nodeAction('executeStep', 'Creating step execution prompt');
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

  try {
    // Call model
    // 모델 호출
    Logger.nodeAction('executeStep', 'Calling model for tool selection');
    const result = await state.context.model.invoke(promptValue, config);

    // Extract tool call
    // 도구 호출 추출
    Logger.nodeAction('executeStep', 'Parsing tool call from model response');
    let toolCall: { tool: string; input: any } | null = null;
    try {
      const content = result.content as string;
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/({[\s\S]*})/);

      if (jsonMatch) {
        toolCall = JSON.parse(jsonMatch[1]);
      } else if (content.includes('"tool":') && content.includes('"input":')) {
        toolCall = JSON.parse(content);
      }

      // Additional validation for toolCall
      // 도구 호출에 대한 추가 검증
      if (toolCall && (!toolCall.tool || toolCall.tool === null)) {
        throw new Error('Invalid tool call: Tool name cannot be null or empty');
      }

    } catch (error) {
      // Tool call parsing error
      // 도구 호출 파싱 오류
      Logger.error('Failed to parse tool call', error);
      Logger.nodeExit('executeStep', 'error');

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
      Logger.nodeAction('executeStep', 'No tool call detected, moving to next step');

      // Move to next step
      // 다음 단계로 이동
      const executionResults = [...(state.context.executionResults || []), {
        step_id: currentStep.step_id,
        result: {
          success: true,
          message: 'Step completed without tool call'
        }
      }];

      const isLastStep = currentStepIndex + 1 >= (totalSteps ?? 0);
      Logger.nodeAction('executeStep', `Moving to next step (${currentStepIndex + 1}/${totalSteps})`);

      if (isLastStep) {
        Logger.nodeAction('executeStep', 'All steps completed');
      }

      Logger.nodeExit('executeStep');
      return {
        messages: [new AIMessage(result.content as string)],
        context: {
          ...state.context,
          currentStepIndex: currentStepIndex + 1,
          executionResults,
          executionStatus: isLastStep ? 'completed' : 'running'
        } as any
      };
    }

    // Execute tool
    // 도구 실행
    Logger.nodeAction('executeStep', `Executing tool: ${toolCall.tool}`);

    // 도구 입력값 정규화
    // Normalize tool input
    if (toolCall.tool === 'translate_text') {
      // 특별히 번역 도구를 위한 입력 파라미터 표준화
      // Standardize input parameters specifically for translation tool
      const normalizedInput = { ...toolCall.input };

      // input_text를 text로 변환 (번역 도구가 기대하는 형식으로)
      // Convert input_text to text (format expected by translation tool)
      if (normalizedInput.input_text !== undefined && normalizedInput.text === undefined) {
        normalizedInput.text = normalizedInput.input_text;
        delete normalizedInput.input_text;
      }

      // target_language 매핑 (필요한 경우)
      // Map target_language (if necessary)
      if (normalizedInput.target_language) {
        normalizedInput.targetLanguage = normalizedInput.target_language;
        delete normalizedInput.target_language;
      }

      // 텍스트에서 불필요한 따옴표 제거
      // Remove unnecessary quotes from text
      if (normalizedInput.text && typeof normalizedInput.text === 'string') {
        normalizedInput.text = normalizedInput.text.replace(/^(['"])(.*)\1$/, '$2');
      }

      Logger.nodeAction('executeStep', 'Normalized translation tool input');
      toolCall.input = normalizedInput;
    }

    Logger.toolExecution(toolCall.tool, toolCall.input);

    let toolResult: ToolExecutionResult;
    try {
      // Find tool
      // 도구 찾기
      const tool = state.tools.find(t => t.name === toolCall.tool);

      if (!tool) {
        // Provide available tool names in the error message
        // 오류 메시지에 사용 가능한 도구 이름 제공
        const availableToolNames = state.tools.map(t => t.name).join(', ');
        throw new Error(`Tool not found: ${toolCall.tool}. Available tools: ${availableToolNames}`);
      }

      // Execute tool
      // 도구 실행
      const result = await tool.execute(toolCall.input);
      Logger.toolResult(toolCall.tool, result, result.success !== false);

      toolResult = {
        success: result.success !== false,
        result,
        error: result.success === false ? result.error : undefined
      };
    } catch (error: any) {
      // Tool execution error
      // 도구 실행 오류
      Logger.error(`Tool execution error: ${toolCall.tool}`, error);
      Logger.toolResult(toolCall.tool, { error: error.message }, false);

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
    const isLastStep = currentStepIndex + 1 >= (totalSteps ?? 0);
    Logger.nodeAction('executeStep', `Moving to next step (${currentStepIndex + 1}/${totalSteps})`);

    if (isLastStep) {
      Logger.nodeAction('executeStep', 'All steps completed');
    }

    Logger.nodeExit('executeStep');
    return {
      context: {
        ...state.context,
        currentStepIndex: currentStepIndex + 1,
        executionResults,
        executionStatus: isLastStep ? 'completed' : 'running',
        currentTool: null
      } as any
    };
  } catch (error) {
    Logger.error('Error in execute step', error);
    Logger.nodeExit('executeStep', 'error');
    throw error;
  }
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
  Logger.nodeEntry('verifyResult');

  // Get execution results and plan
  // 실행 결과 및 계획 가져오기
  const { executionResults, executionPlan } = state.context;

  if (!executionResults || !executionPlan) {
    Logger.error('Missing execution results or plan for verification');
    Logger.nodeExit('verifyResult', 'error');

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
  Logger.nodeAction('verifyResult', 'Creating verification prompt');
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

  try {
    // Call model
    // 모델 호출
    Logger.nodeAction('verifyResult', 'Calling model for verification');
    const result = await state.context.model.invoke(promptValue, config);

    // Parse verification result
    // 검증 결과 파싱
    Logger.nodeAction('verifyResult', 'Parsing verification response');
    let verificationReport;
    try {
      const content = result.content as string;
      const jsonMatch = content.match(/```json\n([\\s\S]*?)\n```/) || content.match(/({[\s\S]*})/);

      if (jsonMatch) {
        verificationReport = JSON.parse(jsonMatch[1]);
      } else {
        verificationReport = JSON.parse(content);
      }

      Logger.graphState('Verification Report', verificationReport);
    } catch (error) {
      Logger.error('Failed to parse verification result', error);
      Logger.nodeExit('verifyResult', 'error');

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
      Logger.nodeAction('verifyResult',
        `Verification detected need for additional steps: ${verificationReport.additional_steps.length}`);

      // Add additional steps to execution plan
      // 실행 계획에 추가 단계 추가
      const updatedPlan = {
        ...executionPlan,
        plan: [...executionPlan.plan, ...verificationReport.additional_steps]
      };

      Logger.nodeAction('verifyResult', `Updated plan with ${updatedPlan.plan.length} total steps`);
      Logger.nodeExit('verifyResult');

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
    Logger.nodeAction('verifyResult',
      `Verification complete: ${verificationReport.success ? 'Success' : 'Failed'}`);
    Logger.nodeExit('verifyResult');

    return {
      messages: [new AIMessage(result.content as string)],
      context: {
        ...state.context,
        verificationReport,
        verified: verificationReport.success,
        executionStatus: verificationReport.success ? 'completed' : 'error'
      } as any
    };
  } catch (error) {
    Logger.error('Error in result verification', error);
    Logger.nodeExit('verifyResult', 'error');
    throw error;
  }
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
  Logger.nodeEntry('generateResponse');

  // Get original request, execution results, and verification report
  // 원래 요청, 실행 결과, 검증 보고서 가져오기
  const { executionResults, verificationReport } = state.context;
  const originalRequest = state.messages[0].content;

  // Create response generation prompt
  // 응답 생성 프롬프트 생성
  Logger.nodeAction('generateResponse', 'Creating response generation prompt');
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

  try {
    // Call model
    // 모델 호출
    Logger.nodeAction('generateResponse', 'Calling model for final response generation');
    const result = await state.context.model.invoke(promptValue, config);
    Logger.nodeAction('generateResponse', 'Response generated successfully');

    // Return final response
    // 최종 응답 반환
    Logger.nodeExit('generateResponse');
    return {
      messages: [new AIMessage(result.content as string)],
      context: {
        ...state.context,
        executionStatus: 'completed'
      } as any
    };
  } catch (error) {
    Logger.error('Error generating response', error);
    Logger.nodeExit('generateResponse', 'error');
    throw error;
  }
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
  Logger.nodeEntry('handleError');

  // Get error information
  // 오류 정보 가져오기
  const { lastError } = state.context;

  if (!lastError) {
    Logger.error('No error information available');
    Logger.nodeExit('handleError');

    return {
      context: {
        ...state.context,
        executionStatus: 'error'
      } as any
    };
  }

  Logger.graphState('Error Information', lastError);

  // Create error handling prompt
  // 오류 처리 프롬프트 생성
  Logger.nodeAction('handleError', 'Creating error handling prompt');
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

  try {
    // Call model
    // 모델 호출
    Logger.nodeAction('handleError', 'Calling model for error handling');
    const result = await state.context.model.invoke(promptValue, config);

    // Parse error handling result
    // 오류 처리 결과 파싱
    Logger.nodeAction('handleError', 'Parsing error handling response');
    let errorHandling;
    try {
      const content = result.content as string;
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/({[\s\S]*})/);

      if (jsonMatch) {
        errorHandling = JSON.parse(jsonMatch[1]);
      } else {
        errorHandling = JSON.parse(content);
      }

      Logger.graphState('Error Handling Result', errorHandling);
    } catch (error) {
      // Use original response if parsing fails
      // 파싱 오류 시 원본 응답 사용
      Logger.error('Failed to parse error handling result', error);
      errorHandling = {
        error_type: lastError.type,
        cause: lastError.message,
        resolution: 'Unable to resolve error.',
        user_message: result.content
      };

      Logger.graphState('Error Handling Fallback', errorHandling);
    }

    // Return error handling result
    // 오류 처리 결과 반환
    Logger.nodeAction('handleError', 'Error handling complete');
    Logger.nodeExit('handleError');

    return {
      messages: [new AIMessage(errorHandling.user_message)],
      context: {
        ...state.context,
        errorHandling,
        executionStatus: 'error'
      } as any
    };
  } catch (error) {
    Logger.error('Error in error handling', error);
    Logger.nodeExit('handleError', 'error');
    throw error;
  }
}