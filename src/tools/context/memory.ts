import { z } from 'zod';
import { Tool } from '../../types/index.js';

/**
 * 메모리 저장 도구 입력 스키마
 */
export const storeMemorySchema = z.object({
  key: z.string().min(1, { message: '키는 필수입니다.' }),
  value: z.any()
});

/**
 * 메모리 검색 도구 입력 스키마
 */
export const retrieveMemorySchema = z.object({
  key: z.string().min(1, { message: '키는 필수입니다.' })
});

/**
 * 메모리 저장 도구
 * 메모리에 정보를 저장하는 도구입니다.
 */
export class StoreMemoryTool implements Tool {
  name = 'store_memory';
  description = '메모리에 정보를 저장합니다.';
  schema = storeMemorySchema;
  private memoryStore: Map<string, any>;

  constructor(memoryStore: Map<string, any>) {
    this.memoryStore = memoryStore;
  }

  /**
   * 메모리에 정보를 저장합니다.
   * @param input 도구 입력 데이터
   * @returns 성공 여부
   */
  async execute(input: z.infer<typeof storeMemorySchema>): Promise<any> {
    try {
      const { key, value } = input;

      this.memoryStore.set(key, value);

      return {
        success: true,
        key
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        key: input.key
      };
    }
  }
}

/**
 * 메모리 검색 도구
 * 메모리에서 정보를 검색하는 도구입니다.
 */
export class RetrieveMemoryTool implements Tool {
  name = 'retrieve_memory';
  description = '메모리에서 정보를 검색합니다.';
  schema = retrieveMemorySchema;
  private memoryStore: Map<string, any>;

  constructor(memoryStore: Map<string, any>) {
    this.memoryStore = memoryStore;
  }

  /**
   * 메모리에서 정보를 검색합니다.
   * @param input 도구 입력 데이터
   * @returns 저장된 값
   */
  async execute(input: z.infer<typeof retrieveMemorySchema>): Promise<any> {
    try {
      const { key } = input;

      if (!this.memoryStore.has(key)) {
        return {
          success: false,
          error: `키를 찾을 수 없습니다: ${key}`,
          key
        };
      }

      const value = this.memoryStore.get(key);

      return {
        success: true,
        value,
        key
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        key: input.key
      };
    }
  }
}