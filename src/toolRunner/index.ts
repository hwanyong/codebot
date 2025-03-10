/**
 * 도구 실행 시스템 초기화 모듈
 * Tool Runner System Initialization Module
 *
 * 도구 실행 시스템을 초기화하는 기능을 제공합니다.
 * Provides functionality to initialize the tool execution system.
 *
 * Generated by Copilot
 */

import { ToolExecutor } from './executor.js';
import { ToolPrompter } from './prompter.js';
import { ResultRenderer } from './renderer.js';

/**
 * 테스트 시스템을 초기화합니다.
 * @returns 초기화된 ToolExecutor 인스턴스
 */
export function initializeToolRunner(): ToolExecutor {
  // 도구 프롬프터 생성
  const prompter = new ToolPrompter();

  // 결과 렌더러 생성
  const renderer = new ResultRenderer();

  // 도구 실행기 생성 및 반환
  return new ToolExecutor(prompter, renderer);
}

// 모듈 내보내기
export { ToolExecutor } from './executor.js';
export { ToolPrompter } from './prompter.js';
export { ResultRenderer } from './renderer.js';
export { ExecutionHistoryItem } from './executor.js';
export type { ToolExecutionResult } from './executor.js';