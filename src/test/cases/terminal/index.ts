/**
 * 터미널 명령어 도구 테스트 케이스
 * Terminal Command Tool Test Cases
 *
 * 터미널 명령어 실행 도구의 기능을 테스트합니다.
 * Tests functionality of terminal command execution tools.
 *
 * Generated by Copilot
 */

import { TestSuite } from '../../runner.js';
import assert from 'assert';
import path from 'path';
import fs from 'fs/promises';
import os from 'os';

// 테스트에 필요한 도구 가져오기
import { RunCommandTool } from '../../../tools/terminal/runCommand.js';

// 도구 인스턴스 생성
const runCommandTool = new RunCommandTool();

/**
 * 터미널 명령어 도구 테스트 스위트
 */
export const terminalTests: TestSuite = {
  /**
   * RunCommandTool 기본 기능 테스트
   */
  async 'RunCommandTool - 기본 명령어 실행'() {
    // echo 명령어 실행
    const result = await runCommandTool.execute({
      command: 'echo "Hello, Codebot!"'
    });

    // 검증
    assert.strictEqual(result.success, true, '명령어 실행이 성공해야 합니다.');
    assert.strictEqual(result.exitCode, 0, '종료 코드가 0이어야 합니다.');
    assert.strictEqual(result.stdout.trim(), 'Hello, Codebot!', '표준 출력이 예상과 일치해야 합니다.');
    assert.strictEqual(result.stderr, '', '표준 오류는 비어 있어야 합니다.');
  },

  /**
   * 환경 변수 테스트
   */
  async 'RunCommandTool - 환경 변수 설정'() {
    // 환경 변수를 설정하고 명령어 실행
    const result = await runCommandTool.execute({
      command: process.platform === 'win32' ? 'echo %TEST_ENV%' : 'echo $TEST_ENV',
      env: {
        'TEST_ENV': 'Codebot Testing'
      }
    });

    // 검증
    assert.strictEqual(result.success, true, '명령어 실행이 성공해야 합니다.');
    assert.strictEqual(result.stdout.trim(), 'Codebot Testing', '환경 변수가 올바르게 설정되어야 합니다.');
  },

  /**
   * 작업 디렉토리 테스트
   */
  async 'RunCommandTool - 작업 디렉토리 지정'() {
    // 임시 디렉토리 생성
    const tempDir = path.join(os.tmpdir(), `codebot-terminal-test-${Date.now()}`);
    await fs.mkdir(tempDir, { recursive: true });

    try {
      // 현재 디렉토리 확인 명령어 실행
      const result = await runCommandTool.execute({
        command: process.platform === 'win32' ? 'cd' : 'pwd',
        workingDir: tempDir
      });

      // 검증
      assert.strictEqual(result.success, true, '명령어 실행이 성공해야 합니다.');

      // 경로 비교는 대소문자 구분 없이, 끝에 있는 공백 제거 후 수행
      // Windows에서는 경로 형식이 다를 수 있음을 고려
      const normalizedOutput = result.stdout.trim().toLowerCase();
      const normalizedTempDir = tempDir.toLowerCase();

      // Windows에서 cd는 현재 드라이브와 경로를 출력
      // Unix/Linux에서 pwd는 전체 절대 경로를 출력
      assert.ok(
        normalizedOutput.includes(normalizedTempDir) ||
        normalizedTempDir.includes(normalizedOutput),
        '작업 디렉토리가 올바르게 설정되어야 합니다.'
      );

    } finally {
      // 정리
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  },

  /**
   * 오류 처리 테스트
   */
  async 'RunCommandTool - 오류 처리'() {
    // 존재하지 않는 명령어 실행
    const result = await runCommandTool.execute({
      command: 'non_existent_command_123456'
    });

    // 검증
    // 명령어가 실패하더라도 도구는 오류를 던지지 않고 결과를 반환해야 함
    assert.strictEqual(result.success, false, '존재하지 않는 명령어는 실패해야 합니다.');
    assert.notStrictEqual(result.exitCode, 0, '종료 코드가 0이 아니어야 합니다.');
    assert.notStrictEqual(result.stderr, '', '표준 오류가 비어 있지 않아야 합니다.');
  }
};