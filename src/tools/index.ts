import { ToolRegistry } from './toolRegistry.js';
import { ReadFileTool } from './fileSystem/readFile.js';
import { WriteToFileTool } from './fileSystem/writeToFile.js';
import { ListFilesTool } from './fileSystem/listFiles.js';
import { SearchFilesTool } from './fileSystem/searchFiles.js';
import { ExecuteCommandTool } from './terminal/executeCommand.js';
import { StoreMemoryTool, RetrieveMemoryTool } from './context/memory.js';

/**
 * 도구 레지스트리에 모든 도구를 등록합니다.
 * @param registry 도구 레지스트리
 * @param memoryStore 메모리 저장소
 */
export function registerTools(registry: ToolRegistry, memoryStore: Map<string, any>): void {
  // 파일 시스템 도구 등록
  registry.registerTool(new ReadFileTool());
  registry.registerTool(new WriteToFileTool());
  registry.registerTool(new ListFilesTool());
  registry.registerTool(new SearchFilesTool());

  // 터미널 도구 등록
  registry.registerTool(new ExecuteCommandTool());

  // 컨텍스트 도구 등록
  registry.registerTool(new StoreMemoryTool(memoryStore));
  registry.registerTool(new RetrieveMemoryTool(memoryStore));
}

// 도구 내보내기
export { ToolRegistry } from './toolRegistry.js';
export { ReadFileTool } from './fileSystem/readFile.js';
export { WriteToFileTool } from './fileSystem/writeToFile.js';
export { ListFilesTool } from './fileSystem/listFiles.js';
export { SearchFilesTool } from './fileSystem/searchFiles.js';
export { ExecuteCommandTool } from './terminal/executeCommand.js';
export { StoreMemoryTool, RetrieveMemoryTool } from './context/memory.js';