import { promises as fs } from 'fs';
import { z } from 'zod';
import { BaseTool } from '../base.js';
import path from 'path';
import { glob } from 'glob';

/**
 * 파일 항목 인터페이스
 */
interface FileEntry {
  name: string;
  path: string;
  isDirectory: boolean;
}

/**
 * 파일 목록 조회 도구 결과 인터페이스
 */
interface ListFilesResult {
  success: boolean;
  files: FileEntry[];
  path: string;
  error?: string;
}

/**
 * 파일 목록 조회 도구
 * 디렉토리 내용을 나열하는 도구입니다.
 */
export class ListFilesTool extends BaseTool<{
  path: string;
  patterns: string[];
  recursive?: boolean;
}, ListFilesResult> {
  constructor() {
    super(
      'ListFiles',
      '디렉토리 내용을 나열합니다.',
      'fileSystem',
      z.object({
        path: z.string().min(1, { message: '디렉토리 경로는 필수입니다.' }),
        patterns: z.array(z.string()).optional().default([]),
        recursive: z.boolean().optional().default(false)
      })
    );
  }

  /**
   * 디렉토리 내용을 나열합니다.
   * @param params.path 디렉토리 경로
   * @param params.patterns 파일 패턴 목록 (선택적)
   * @param params.recursive 하위 디렉토리도 포함할지 여부 (선택적)
   * @returns 파일 목록
   */
  protected async _execute(params: {
    path: string;
    patterns: string[];
    recursive?: boolean;
  }): Promise<ListFilesResult> {
    try {
      const dirPath = path.resolve(params.path);

      // 디렉토리가 존재하는지 확인
      await fs.access(dirPath);

      let files: string[] = [];
      let fileEntries: FileEntry[] = [];

      // 패턴이 지정된 경우 glob을 사용하여 파일 검색
      if (params.patterns && params.patterns.length > 0) {
        for (const pattern of params.patterns) {
          // glob 설정에서 'deep' 대신 'follow'와 'absolute' 옵션 사용
          // 최신 glob 버전에서는 'deep' 대신 다른 옵션을 사용
          const matches = await glob(pattern, {
            cwd: dirPath,
            dot: true,
            follow: params.recursive, // 심볼릭 링크 따라가기
            absolute: true // 절대 경로 반환
          });

          files = [...files, ...matches.map((file: string) => path.join(dirPath, file))];
        }

        // 파일 정보로 변환
        fileEntries = await Promise.all(files.map(async (filePath) => {
          const stats = await fs.stat(filePath);
          return {
            name: path.basename(filePath),
            path: filePath,
            isDirectory: stats.isDirectory()
          };
        }));
      } else {
        // 패턴이 없는 경우 모든 파일 및 디렉토리 나열
        const entries = await fs.readdir(dirPath, { withFileTypes: true });

        // 기본 파일 목록 얻기
        fileEntries = entries.map(entry => {
          const entryPath = path.join(dirPath, entry.name);
          return {
            name: entry.name,
            path: entryPath,
            isDirectory: entry.isDirectory()
          };
        });

        // 재귀 옵션이 활성화된 경우 하위 디렉토리도 처리
        if (params.recursive) {
          const subDirs = fileEntries.filter(entry => entry.isDirectory);

          // 각 하위 디렉토리를 재귀적으로 처리
          for (const dir of subDirs) {
            try {
              const subResult = await this._execute({
                path: dir.path,
                patterns: params.patterns,
                recursive: true
              });

              if (subResult.success) {
                fileEntries = [...fileEntries, ...subResult.files];
              }
            } catch (error) {
              // 하위 디렉토리 처리 중 오류 발생 시 계속 진행
              console.error(`하위 디렉토리 처리 오류: ${dir.path}`, error);
            }
          }
        }
      }

      return {
        success: true,
        files: fileEntries,
        path: dirPath
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        path: params.path,
        files: []
      };
    }
  }
}