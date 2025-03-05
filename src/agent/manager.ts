import { HumanMessage } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';
import { ChatOllama } from '@langchain/ollama';
import { codebotGraph } from './graph.js';
import { ToolRegistry, registerTools } from '../tools/index.js';
import { State } from './state.js';
import dotenv from 'dotenv';

// 환경 변수 로드
dotenv.config();

/**
 * 모델 제공자 타입
 */
export type ModelProvider = 'openai' | 'ollama';

/**
 * 모델 옵션 인터페이스
 */
export interface ModelOptions {
  provider: ModelProvider;
  model: string;
  temperature?: number;
}

/**
 * 에이전트 옵션 인터페이스
 */
export interface AgentOptions {
  model: ModelOptions;
  verbose?: boolean;
}

/**
 * 에이전트 관리자 클래스
 * 에이전트 생성 및 실행을 관리합니다.
 */
export class AgentManager {
  private toolRegistry: ToolRegistry;
  private memoryStore: Map<string, any>;
  private options: AgentOptions;

  /**
   * 에이전트 관리자 생성자
   * @param options 에이전트 옵션
   */
  constructor(options: AgentOptions) {
    this.toolRegistry = new ToolRegistry();
    this.memoryStore = new Map<string, any>();
    this.options = options;

    // 도구 등록
    registerTools(this.toolRegistry, this.memoryStore);
  }

  /**
   * 모델 인스턴스를 가져옵니다.
   * @returns 모델 인스턴스
   */
  private getModel() {
    const { provider, model, temperature = 0.7 } = this.options.model;

    switch (provider) {
      case 'openai':
        return new ChatOpenAI({
          modelName: model,
          temperature,
          openAIApiKey: process.env.OPENAI_API_KEY
        });
      case 'ollama':
        return new ChatOllama({
          model,
          temperature,
          baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
        });
      default:
        throw new Error(`지원되지 않는 모델 제공자: ${provider}`);
    }
  }

  /**
   * 에이전트를 실행합니다.
   * @param input 사용자 입력
   * @returns 에이전트 응답
   */
  async run(input: string): Promise<string> {
    try {
      // 모델 인스턴스 가져오기
      const model = this.getModel();

      // 초기 상태 생성
      const initialState: State = {
        messages: [new HumanMessage(input)],
        tools: this.toolRegistry.getTools(),
        context: {
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
          model
        }
      };

      // 그래프 실행
      const result = await codebotGraph.invoke(initialState);

      // 마지막 메시지 반환
      const lastMessage = result.messages[result.messages.length - 1];
      return lastMessage.content as string;
    } catch (error: any) {
      console.error('에이전트 실행 오류:', error);
      return `오류가 발생했습니다: ${error.message}`;
    }
  }
}