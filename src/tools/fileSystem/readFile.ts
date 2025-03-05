import { promises as fs } from 'fs';
import { z } from 'zod';
import { Tool } from '../../types/index.js';
import path from 'path';

/**
 * 파일 읽기 도구 입력 스키마
 */
export const readFileSchema = z.object({
  path: z.string().min(1, { message: '파일 경로는 필수입니다.' })
});

/**
 * 파일 읽기 도구
 * 파일 내용을 읽는 도구입니다.
 */
export class ReadFileTool implements Tool {
  name = 'read_file';
  description = '파일 내용을 읽습니다.';
  schema = readFileSchema;

  /**
   * 파일 내용을 읽습니다.
   * @param input 도구 입력 데이터
   * @returns 파일 내용
   */
  async execute(input: z.infer<typeof readFileSchema>): Promise<any> {
    try {
      const filePath = path.resolve(input.path);
      const content = await fs.readFile(filePath, 'utf-8');

      return {
        success: true,
        content,
        path: filePath
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        path: input.path
      };
    }
  }
}