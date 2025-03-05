import { Tool } from '../types/index.js';

/**
 * 도구 레지스트리 클래스
 * 모든 도구를 등록하고 관리하는 클래스입니다.
 */
export class ToolRegistry {
  private tools: Map<string, Tool>;

  constructor() {
    this.tools = new Map<string, Tool>();
  }

  /**
   * 도구를 등록합니다.
   * @param tool 등록할 도구
   */
  registerTool(tool: Tool): void {
    this.tools.set(tool.name, tool);
  }

  /**
   * 도구를 실행합니다.
   * @param name 실행할 도구의 이름
   * @param input 도구에 전달할 입력 데이터
   * @returns 도구 실행 결과
   */
  async executeTool(name: string, input: any): Promise<any> {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`도구를 찾을 수 없습니다: ${name}`);
    }

    try {
      // 입력 데이터 검증
      tool.schema.parse(input);
      return await tool.execute(input);
    } catch (error: any) {
      // 검증 또는 실행 오류 처리
      throw new Error(`도구 실행 오류 ${name}: ${error.message}`);
    }
  }

  /**
   * 등록된 모든 도구를 반환합니다.
   * @returns 등록된 모든 도구 배열
   */
  getTools(): Tool[] {
    return Array.from(this.tools.values());
  }

  /**
   * 특정 도구를 이름으로 가져옵니다.
   * @param name 가져올 도구의 이름
   * @returns 도구 또는 undefined
   */
  getTool(name: string): Tool | undefined {
    return this.tools.get(name);
  }
}