import { z } from 'zod';
import { BaseMessage } from '@langchain/core/messages';

// 도구 인터페이스 정의
export interface Tool {
  name: string;
  description: string;
  schema: z.ZodType<any>; // 도구 입력 스키마
  execute(input: any): Promise<any>;
}

// 컨텍스트 상태 인터페이스
export interface ContextState {
  currentTask: any;
  memory: Record<string, any>;
  currentTool: string | null;
  lastError: {
    message: string;
    timestamp: string;
    type: string;
    stack?: string;
  } | null;
  executionStatus: 'idle' | 'running' | 'completed' | 'error';
  extractedCode: string | null;
  requiresFollowUp: boolean;
  environmentDetails: {
    cwd: string;
    platform: string;
    nodeVersion: string;
  };
  model: any;
  executionPlan?: ExecutionPlan;
  currentStepIndex?: number;
  totalSteps?: number;
  executionResults?: any[];
  verificationReport?: any;
  verified?: boolean;
  errorHandling?: any;
  // 직접 응답 요청 여부
  directResponse?: boolean;
  // 도구 실행 필요 여부
  requiresToolExecution?: boolean;
}

// 상태 인터페이스
export interface State {
  messages: BaseMessage[];
  tools: Tool[];
  context: ContextState;
}

// 업데이트 인터페이스
export interface Update {
  messages?: BaseMessage[];
  tools?: Tool[];
  context?: Partial<ContextState>;
}

// 태스크 분석 결과 인터페이스
export interface TaskAnalysis {
  task_type: 'simple_response' | 'code_creation' | 'code_modification' | 'code_analysis' | 'environment_setup';
  subtasks: {
    id: string;
    description: string;
    potential_tools: string[];
    dependencies: string[];
  }[];
}

// 실행 계획 인터페이스
export interface ExecutionPlan {
  plan: {
    step_id: string;
    action: string;
    tool: string;
    tool_inputs: Record<string, any>;
    validation: string;
  }[];
}

// 도구 실행 결과 인터페이스
export interface ToolExecutionResult {
  success: boolean;
  result: any;
  error?: string;
}