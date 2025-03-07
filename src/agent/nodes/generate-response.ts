import { ChatPromptTemplate } from '@langchain/core/prompts';
import { RunnableConfig } from '@langchain/core/runnables';
import { AIMessage } from '@langchain/core/messages';
import { State, Update } from '../state.js';
import {
  GENERATE_RESPONSE_PROMPT,
  DIRECT_RESPONSE_PROMPT
} from '../../prompts/index.js';
import { Logger } from '../../utils/logger.js';

/**
 * Response generation node
 * 응답 생성 노드
 * Generates final response for the user
 * 사용자에게 최종 응답을 생성합니다
 * @param state Current state (현재 상태)
 * @returns State update (상태 업데이트)
 *
 * Generated by Copilot
 */
export async function nodeGenerateResponse(state: State): Promise<Update> {
  Logger.nodeEntry('generateResponse');

  // Input validation
  if (!state || !state.context || !state.messages || state.messages.length === 0) {
    Logger.error('Invalid state for response generation');
    Logger.nodeExit('generateResponse', 'error');

    return {
      context: {
        ...state.context,
        lastError: {
          message: 'Invalid state for response generation.',
          timestamp: new Date().toISOString(),
          type: 'InvalidState',
          stack: undefined
        },
        executionStatus: 'error'
      } as any
    };
  }

  // Get original request and task analysis
  // 원래 요청 및 작업 분석 가져오기
  const { executionResults, verificationReport, directResponse, currentTask } = state.context;
  const originalRequest = state.messages[0].content;

  try {
    // Determine prompt template and parameters based on response type
    let promptTemplate: string;
    let promptParams: Record<string, any>;
    let logMessage: string;

    // Check if this is a direct response case (early return pattern for branching logic)
    // 직접 응답 케이스인지 확인 (분기 로직에 대한 조기 반환 패턴)
    if (directResponse === true) {
      // Use direct response prompt for simple responses
      Logger.nodeAction('generateResponse', 'Creating direct response prompt for simple response');

      promptTemplate = DIRECT_RESPONSE_PROMPT;
      promptParams = {
        original_request: originalRequest,
        task_analysis: JSON.stringify(currentTask, null, 2)
      };
      logMessage = 'Direct response generated successfully';
    } else {
      // Use standard response generation prompt for tool-based responses
      Logger.nodeAction('generateResponse', 'Creating standard response generation prompt');

      promptTemplate = GENERATE_RESPONSE_PROMPT;
      promptParams = {
        original_request: originalRequest,
        execution_results: JSON.stringify(executionResults || [], null, 2),
        verification_report: JSON.stringify(verificationReport || {}, null, 2)
      };
      logMessage = 'Standard response generated successfully';
    }

    // Create prompt template
    const responsePrompt = ChatPromptTemplate.fromTemplate(promptTemplate);

    // Render prompt
    const promptValue = await responsePrompt.formatMessages(promptParams);

    // Model call configuration
    const config: RunnableConfig = {
      configurable: {
        model: state.context.model
      }
    };

    // Call model
    Logger.nodeAction('generateResponse', `Calling model for ${directResponse ? 'direct' : 'standard'} response generation`);
    Logger.nodeModelStart('translateInput', 'Starting model streaming for translation');
    // const result = await state.context.model.invoke(promptValue, config);
    const stream = await state.context.model.stream(promptValue, config);
    // Logger.nodeAction('generateResponse', logMessage);

    let generatedResponse = '';
    for await (const chunk of stream) {
      const content = chunk.content;
      if (content) {
        generatedResponse += content;
      }
      // Log model streaming events
      Logger.nodeModelStreaming('generateResponse', content);
    }
    // Log model end event
    Logger.nodeModelEnd('generateResponse');

    // Return final response
    Logger.nodeExit('generateResponse');

    return {
      messages: [new AIMessage(generatedResponse)],
      context: {
        ...state.context,
        executionStatus: 'completed'
      } as any
    }

    // return {
    //   messages: [new AIMessage(result.content as string)],
    //   context: {
    //     ...state.context,
    //     executionStatus: 'completed'
    //   } as any
    // };
  } catch (error) {
    // Provide contextual error information
    const errorType = directResponse ? 'direct' : 'standard';
    Logger.error(`Error generating ${errorType} response`, error);
    Logger.nodeExit('generateResponse', 'error');

    return {
      context: {
        ...state.context,
        lastError: {
          message: `Unable to generate ${errorType} response.`,
          timestamp: new Date().toISOString(),
          type: 'ResponseGenerationError',
          stack: error instanceof Error ? error.stack : undefined
        },
        executionStatus: 'error'
      } as any
    };
  }
}