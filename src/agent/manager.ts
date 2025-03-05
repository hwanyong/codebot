import { HumanMessage } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';
import { ChatOllama } from '@langchain/ollama';
import { ChatAnthropic } from '@langchain/anthropic';
import { codebotGraph } from './graph.js';
import { ToolRegistry, registerTools } from '../tools/index.js';
import { State } from './state.js';
import dotenv from 'dotenv';
import { ConfigManager } from '../config/index.js';

// Load environment variables
// 환경 변수 로드
dotenv.config();

// Create config manager instance
// 설정 관리자 인스턴스 생성
const configManager = new ConfigManager();

/**
 * Model provider type
 * 모델 제공자 타입
 */
export type ModelProvider = 'openai' | 'ollama' | 'anthropic' | 'custom';

/**
 * Model options interface
 * 모델 옵션 인터페이스
 */
export interface ModelOptions {
  provider: ModelProvider;
  model: string;
  temperature?: number;
}

/**
 * Agent options interface
 * 에이전트 옵션 인터페이스
 */
export interface AgentOptions {
  model: ModelOptions;
  verbose?: boolean;
}

/**
 * Agent manager class
 * 에이전트 관리자 클래스
 * Manages agent creation and execution
 * 에이전트 생성 및 실행을 관리합니다
 */
export class AgentManager {
  private toolRegistry: ToolRegistry;
  private memoryStore: Map<string, any>;
  private options: AgentOptions;

  /**
   * Agent manager constructor
   * 에이전트 관리자 생성자
   * @param options Agent options (에이전트 옵션)
   */
  constructor(options: AgentOptions) {
    this.toolRegistry = new ToolRegistry();
    this.memoryStore = new Map<string, any>();
    this.options = options;

    // Register tools
    // 도구 등록
    registerTools(this.toolRegistry, this.memoryStore);
  }

  /**
   * Get model instance
   * 모델 인스턴스를 가져옵니다
   * @returns Model instance (모델 인스턴스)
   */
  private getModel() {
    const { provider, model, temperature = 0.7 } = this.options.model;

    // Load configuration
    // 설정 로드
    configManager.loadConfig();
    configManager.loadEnv();

    // Get provider information
    // Provider 정보 가져오기
    const providerConfig = configManager.getProviderByName(provider) ||
                          configManager.getAllProviders().find(p => p.type === provider);

    switch (provider) {
      case 'openai':
        return new ChatOpenAI({
          modelName: model,
          temperature,
          openAIApiKey: process.env.OPENAI_API_KEY || providerConfig?.apiKey
        });
      case 'ollama':
        return new ChatOllama({
          model,
          temperature,
          baseUrl: process.env.OLLAMA_BASE_URL || providerConfig?.baseUrl || 'http://localhost:11434'
        });
      case 'anthropic':
        return new ChatAnthropic({
          modelName: model,
          temperature,
          anthropicApiKey: process.env.ANTHROPIC_API_KEY || providerConfig?.apiKey
        });
      case 'custom':
        // Add support for custom models
        // 사용자 정의 모델 지원 추가
        throw new Error('Custom models are not supported yet.');
      default:
        throw new Error(`Unsupported model provider: ${provider}`);
    }
  }

  /**
   * Run agent
   * 에이전트를 실행합니다
   * @param input User input (사용자 입력)
   * @returns Agent response (에이전트 응답)
   */
  async run(input: string): Promise<string> {
    try {
      // Get model instance
      // 모델 인스턴스 가져오기
      const model = this.getModel();

      // Create initial state
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

      // Execute graph
      // 그래프 실행
      const result = await codebotGraph.invoke(initialState);

      // Return last message
      // 마지막 메시지 반환
      const lastMessage = result.messages[result.messages.length - 1];
      return lastMessage.content as string;
    } catch (error: any) {
      console.error('Agent execution error:', error);
      return `An error occurred: ${error.message}`;
    }
  }
}