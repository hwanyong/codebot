import { z } from 'zod';
import { Tool } from '../../types/index.js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

/**
 * 명령어 실행 도구 입력 스키마
 */
export const executeCommandSchema = z.object({
  command: z.string().min(1, { message: '명령어는 필수입니다.' }),
  cwd: z.string().optional(),
  timeout: z.number().optional().default(30000)
});

/**
 * 명령어 실행 도구
 * 쉘 명령어를 실행하고 결과를 반환하는 도구입니다.
 */
export class ExecuteCommandTool implements Tool {
  name = 'execute_command';
  description = '쉘 명령어를 실행하고 결과를 반환합니다.';
  schema = executeCommandSchema;

  /**
   * 쉘 명령어를 실행합니다.
   * @param input 도구 입력 데이터
   * @returns 명령어 실행 결과
   */
  async execute(input: z.infer<typeof executeCommandSchema>): Promise<any> {
    try {
      const { command, cwd, timeout } = input;

      const result = await execPromise(command, {
        cwd: cwd || process.cwd(),
        timeout: timeout || 30000
      });

      return {
        success: true,
        stdout: result.stdout,
        stderr: result.stderr,
        exitCode: 0
      };
    } catch (error: any) {
      // 명령어 실행 오류
      return {
        success: false,
        stdout: error.stdout || '',
        stderr: error.stderr || error.message,
        exitCode: error.code || 1,
        error: error.message
      };
    }
  }
}