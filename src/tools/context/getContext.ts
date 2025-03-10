/**
 * 컨텍스트 조회 도구
 * Context Retrieval Tool
 *
 * 저장된 컨텍스트 데이터를 조회합니다.
 * Retrieves stored context data.
 *
 * Generated by Copilot
 */

import { BaseTool } from '../base.js';
import { z } from 'zod';

// 전역 컨텍스트 저장소
// Global context store
const globalContext: Record<string, any> = {};

/**
 * 컨텍스트 조회 도구
 */
export class GetContextTool extends BaseTool<{}, Record<string, any>> {
  constructor() {
    super(
      'GetContext',
      '컨텍스트에 저장된 데이터를 조회합니다.',
      'context',
      z.object({}) // 빈 객체 스키마 사용
    );
  }

  /**
   * 컨텍스트 데이터를 조회합니다.
   * @param _ 매개변수 없음
   * @returns 컨텍스트 객체 사본
   */
  protected async _execute(_: {}): Promise<Record<string, any>> {
    // 컨텍스트 객체의 복사본을 반환하여 원본이 직접 수정되지 않도록 함
    return { ...globalContext };
  }

  /**
   * 내부적으로 컨텍스트에 데이터를 설정합니다.
   * 테스트 목적으로만 사용됩니다.
   *
   * @param key 키
   * @param value 값
   */
  public static setContextValue(key: string, value: any): void {
    globalContext[key] = value;
  }

  /**
   * 내부적으로 컨텍스트를 초기화합니다.
   * 테스트 목적으로만 사용됩니다.
   */
  public static clearContext(): void {
    Object.keys(globalContext).forEach(key => {
      delete globalContext[key];
    });
  }
}