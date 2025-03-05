import { promises as fs } from 'fs';
import { z } from 'zod';
import { Tool } from '../../types/index.js';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

/**
 * 파일 검색 도구 입력 스키마
 */
export const searchFilesSchema = z.object({
  path: z.string().min(1, { message: '검색 경로는 필수입니다.' }),
  pattern: z.string().min(1, { message: '검색 패턴은 필수입니다.' })
});

/**
 * 검색 결과 인터페이스
 */
interface SearchMatch {
  file: string;
  line: number;
  content: string;
}

/**
 * 파일 검색 도구
 * 정규식으로 파일을 검색하는 도구입니다.
 */
export class SearchFilesTool implements Tool {
  name = 'search_files';
  description = '정규식으로 파일을 검색합니다.';
  schema = searchFilesSchema;

  /**
   * 정규식으로 파일을 검색합니다.
   * @param input 도구 입력 데이터
   * @returns 검색 결과
   */
  async execute(input: z.infer<typeof searchFilesSchema>): Promise<any> {
    try {
      const searchPath = path.resolve(input.path);

      // 디렉토리가 존재하는지 확인
      await fs.access(searchPath);

      // grep 명령어 실행 (macOS, Linux)
      // Windows의 경우 findstr 명령어를 사용해야 함
      const isWindows = process.platform === 'win32';
      const command = isWindows
        ? `findstr /s /n /i /r "${input.pattern}" "${searchPath}\\*.*"`
        : `grep -r -n "${input.pattern}" "${searchPath}"`;

      const { stdout, stderr } = await execPromise(command);

      if (stderr) {
        return {
          success: false,
          error: stderr,
          path: searchPath
        };
      }

      // 결과 파싱
      const matches: SearchMatch[] = [];

      if (stdout) {
        const lines = stdout.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          try {
            // 파일 경로, 라인 번호, 내용 추출
            const match = isWindows
              ? line.match(/^(.+?):(\d+):(.*)$/)
              : line.match(/^(.+?):(\d+):(.*)$/);

            if (match) {
              matches.push({
                file: match[1],
                line: parseInt(match[2], 10),
                content: match[3]
              });
            }
          } catch (error) {
            console.error('결과 파싱 오류:', error);
          }
        }
      }

      return {
        success: true,
        matches,
        path: searchPath,
        pattern: input.pattern
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