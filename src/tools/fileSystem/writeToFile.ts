import { promises as fs } from 'fs';
import { z } from 'zod';
import { Tool } from '../../types/index.js';
import path from 'path';

/**
 * 파일 쓰기 도구 입력 스키마
 */
export const writeToFileSchema = z.object({
  path: z.string().min(1, { message: '파일 경로는 필수입니다.' }),
  content: z.string({ required_error: '파일 내용은 필수입니다.' })
});

/**
 * 파일 쓰기 도구
 * 파일을 생성하거나 업데이트하는 도구입니다.
 */
export class WriteToFileTool implements Tool {
  name = 'write_to_file';
  description = '파일을 생성하거나 업데이트합니다.';
  schema = writeToFileSchema;

  /**
   * 파일을 생성하거나 업데이트합니다.
   * @param input 도구 입력 데이터
   * @returns 성공 여부 및 파일 경로
   */
  async execute(input: z.infer<typeof writeToFileSchema>): Promise<any> {
    try {
      const filePath = path.resolve(input.path);

      // 디렉토리가 존재하는지 확인하고 없으면 생성
      const directory = path.dirname(filePath);
      await fs.mkdir(directory, { recursive: true });

      // 파일 쓰기
      await fs.writeFile(filePath, input.content, 'utf-8');

      return {
        success: true,
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