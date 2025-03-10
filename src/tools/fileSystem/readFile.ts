import { BaseTool } from '../base.js';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';

/**
 * 파일 읽기 도구 결과 인터페이스
 */
interface ReadFileResult {
  success: boolean;
  content?: string;
  path: string;
  error?: string;
}

/**
 * 파일 읽기 도구
 */
export class ReadFileTool extends BaseTool<{ path: string; encoding?: string }, ReadFileResult> {
  constructor() {
    super(
      'ReadFile',
      '파일 내용을 읽어 반환합니다.',
      'fileSystem',
      z.object({
        path: z.string().min(1, { message: '파일 경로는 필수입니다.' }),
        encoding: z.string().optional().default('utf-8')
      })
    );
  }

  /**
   * 파일 내용을 읽습니다.
   * @param params.path 파일 경로
   * @param params.encoding 파일 인코딩 (기본값: utf-8)
   * @returns 파일 내용
   */
  protected async _execute(params: { path: string; encoding?: string }): Promise<ReadFileResult> {
    try {
      const filePath = path.resolve(params.path);
      const encoding = params.encoding || 'utf-8';

      // 파일이 존재하는지 확인
      await fs.access(filePath);

      // 파일이 디렉토리인지 확인
      const stats = await fs.stat(filePath);
      if (stats.isDirectory()) {
        throw new Error(`지정한 경로는 디렉토리입니다: ${filePath}`);
      }

      // 파일 내용 읽기
      const content = await fs.readFile(filePath, encoding as BufferEncoding);

      return {
        success: true,
        content,
        path: filePath
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        path: params.path
      };
    }
  }
}