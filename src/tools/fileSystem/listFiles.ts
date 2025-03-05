import { promises as fs } from 'fs';
import { z } from 'zod';
import { Tool } from '../../types/index.js';
import path from 'path';
import { glob } from 'glob';

/**
 * 파일 목록 조회 도구 입력 스키마
 */
export const listFilesSchema = z.object({
  path: z.string().min(1, { message: '디렉토리 경로는 필수입니다.' }),
  patterns: z.array(z.string()).optional().default([])
});

/**
 * 파일 항목 인터페이스
 */
interface FileEntry {
  name: string;
  path: string;
  isDirectory: boolean;
}

/**
 * 파일 목록 조회 도구
 * 디렉토리 내용을 나열하는 도구입니다.
 */
export class ListFilesTool implements Tool {
  name = 'list_files';
  description = '디렉토리 내용을 나열합니다.';
  schema = listFilesSchema;

  /**
   * 디렉토리 내용을 나열합니다.
   * @param input 도구 입력 데이터
   * @returns 파일 목록
   */
  async execute(input: z.infer<typeof listFilesSchema>): Promise<any> {
    try {
      const dirPath = path.resolve(input.path);

      // 디렉토리가 존재하는지 확인
      await fs.access(dirPath);

      let files: string[] = [];
      let fileEntries: FileEntry[] = [];

      // 패턴이 지정된 경우 glob을 사용하여 파일 검색
      if (input.patterns && input.patterns.length > 0) {
        for (const pattern of input.patterns) {
          const matches = await glob(pattern, { cwd: dirPath });
          files = [...files, ...matches.map((file: string) => path.join(dirPath, file))];
        }
      } else {
        // 패턴이 없는 경우 모든 파일 및 디렉토리 나열
        const entries = await fs.readdir(dirPath, { withFileTypes: true });
        fileEntries = entries.map(entry => {
          const entryPath = path.join(dirPath, entry.name);
          return {
            name: entry.name,
            path: entryPath,
            isDirectory: entry.isDirectory()
          };
        });
      }

      return {
        success: true,
        files: input.patterns && input.patterns.length > 0 ? files : fileEntries,
        path: dirPath
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