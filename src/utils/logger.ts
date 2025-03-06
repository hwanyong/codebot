import chalk from 'chalk';

/**
 * Logger utility for debugging
 * 디버깅을 위한 로거 유틸리티
 */
export class Logger {
  /**
   * Check if debug mode is enabled
   * 디버그 모드가 활성화되었는지 확인
   * @returns True if debug mode is enabled
   */
  private static isDebugEnabled(): boolean {
    return process.env.DEBUG === 'true';
  }

  /**
   * Log node entry
   * 노드 진입 로그
   * @param nodeName Node name (노드 이름)
   */
  public static nodeEntry(nodeName: string): void {
    if (!Logger.isDebugEnabled()) return;

    console.log(chalk.cyan(`[DEBUG] ${new Date().toISOString()} 🔄 ENTER NODE: ${nodeName}`));
  }

  /**
   * Log node exit
   * 노드 종료 로그
   * @param nodeName Node name (노드 이름)
   * @param status Exit status (종료 상태)
   */
  public static nodeExit(nodeName: string, status: string = 'completed'): void {
    if (!Logger.isDebugEnabled()) return;

    const emoji = status === 'error' ? '❌' : '✅';
    const color = status === 'error' ? chalk.red : chalk.green;

    console.log(color(`[DEBUG] ${new Date().toISOString()} ${emoji} EXIT NODE: ${nodeName} (${status})`));
  }

  /**
   * Log node action
   * 노드 액션 로그
   * @param nodeName Node name (노드 이름)
   * @param action Action description (액션 설명)
   */
  public static nodeAction(nodeName: string, action: string): void {
    if (!Logger.isDebugEnabled()) return;

    console.log(chalk.yellow(`[DEBUG] ${new Date().toISOString()} 🔹 ${nodeName}: ${action}`));
  }

  /**
   * Log graph state
   * 그래프 상태 로그
   * @param message State message (상태 메시지)
   * @param data Optional data to log (선택적 로그 데이터)
   */
  public static graphState(message: string, data?: any): void {
    if (!Logger.isDebugEnabled()) return;

    console.log(chalk.magenta(`[DEBUG] ${new Date().toISOString()} 📊 GRAPH: ${message}`));
    if (data !== undefined) {
      console.log(chalk.gray('─'.repeat(50)));
      console.log(chalk.gray(typeof data === 'string' ? data : JSON.stringify(data, null, 2)));
      console.log(chalk.gray('─'.repeat(50)));
    }
  }

  /**
   * Log error
   * 에러 로그
   * @param message Error message (에러 메시지)
   * @param error Error object (에러 객체)
   */
  public static error(message: string, error?: any): void {
    if (!Logger.isDebugEnabled()) return;

    console.log(chalk.red(`[DEBUG] ${new Date().toISOString()} ❌ ERROR: ${message}`));
    if (error) {
      console.log(chalk.red(error.stack || error.toString()));
    }
  }

  /**
   * Log tool execution
   * 도구 실행 로그
   * @param toolName Tool name (도구 이름)
   * @param input Tool input (도구 입력)
   */
  public static toolExecution(toolName: string, input: any): void {
    if (!Logger.isDebugEnabled()) return;

    console.log(chalk.blue(`[DEBUG] ${new Date().toISOString()} 🔧 TOOL EXECUTION: ${toolName}`));
    console.log(chalk.gray('─'.repeat(50)));
    console.log(chalk.gray(typeof input === 'string' ? input : JSON.stringify(input, null, 2)));
    console.log(chalk.gray('─'.repeat(50)));
  }

  /**
   * Log tool result
   * 도구 결과 로그
   * @param toolName Tool name (도구 이름)
   * @param result Tool result (도구 결과)
   * @param success Whether execution was successful (실행 성공 여부)
   */
  public static toolResult(toolName: string, result: any, success: boolean = true): void {
    if (!Logger.isDebugEnabled()) return;

    const emoji = success ? '✅' : '❌';
    const color = success ? chalk.green : chalk.red;
    const statusText = success ? 'SUCCESS' : 'FAIL';

    console.log(color(`[DEBUG] ${new Date().toISOString()} ${emoji} TOOL RESULT: ${toolName} (${statusText})`));
    console.log(chalk.gray('─'.repeat(50)));
    console.log(chalk.gray(typeof result === 'string' ? result : JSON.stringify(result, null, 2)));
    console.log(chalk.gray('─'.repeat(50)));
  }
}