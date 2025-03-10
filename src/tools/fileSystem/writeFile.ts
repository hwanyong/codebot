/**
 * 파일 쓰기 도구
 * Write File Tool
 *
 * 지정된 경로에 파일을 생성하거나 덮어씁니다.
 * Creates or overwrites a file at the specified path.
 *
 * Generated by Copilot
 */

import { BaseTool } from '../base.js';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';

/**
 * 파일 쓰기 도구
 */
export class WriteFileTool extends BaseTool<{ path: string; content: string }, { success: boolean; path: string }> {
  constructor() {
    super(
      'WriteFile',
      '파일을 생성하거나 덮어씁니다.',
      'fileSystem',
      z.object({
        path: z.string().describe('파일 경로'),
        content: z.string().describe('파일 내용')
      })
    );
  }

  /**
   * 파일을 작성합니다.
   * @param params.path 파일 경로
   * @param params.content 파일 내용
   * @returns 성공 여부와 파일 경로
   */
  protected async _execute(params: { path: string; content: string }): Promise<{ success: boolean; path: string }> {
    try {
      const { path: filePath, content } = params;

      // 디렉토리 경로 추출
      const dirPath = path.dirname(filePath);

      // 디렉토리가 존재하는지 확인하고, 없다면 생성
      try {
        await fs.access(dirPath);
      } catch (error) {
        // 디렉토리가 없는 경우 재귀적으로 생성
        await fs.mkdir(dirPath, { recursive: true });
      }

      // 파일 작성
      await fs.writeFile(filePath, content, 'utf-8');

      return {
        success: true,
        path: filePath
      };
    } catch (error) {
      throw new Error(`파일 쓰기 실패: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}