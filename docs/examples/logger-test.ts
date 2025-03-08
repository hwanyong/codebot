// filepath: /Users/uhd/Documents/Projects/1.PERSONAL/03.Projects/codebot/docs/examples/logger-test.ts
import { Logger } from '../../src/utils/logger.js';
import { logDebug, logError, logInfo, logWarn, logTime } from '../../src/utils/console-utils.js';
import { ConfigManager } from '../../src/config/manager.js';

/**
 * Logger 설정 및 테스트 예제
 * Logger configuration and test example
 *
 * 이 스크립트는 다양한 로깅 설정을 테스트하고 검증합니다.
 * This script tests and validates various logging configurations.
 *
 * Generated by Copilot
 */
async function testLogging(): Promise<void> {
  try {
    // 1. 설정 파일에서 로깅 설정 로드
    console.log('1. 설정 파일에서 로깅 설정 로드 테스트');
    const configManager = new ConfigManager();
    configManager.loadConfig();
    const loggingConfig = configManager.getLoggingConfig();
    console.log('기본 로깅 설정:', loggingConfig);

    // 2. 로거 설정 변경 테스트
    console.log('\n2. 로거 설정 변경 테스트');

    // 초기 설정 적용
    Logger.configure({
      verbose: false,
      debug: false,
      aiStream: false
    });

    // 현재 설정 출력
    console.log('초기 설정:', Logger.getConfig());

    // 기본 로깅 - verbose, debug 모드 꺼진 상태
    console.log('\n2.1 기본 로깅 (모든 로그 모드 비활성화)');
    logInfo('기본 정보 메시지');
    logWarn('경고 메시지');
    logError('오류 메시지');
    logDebug('디버그 메시지 - 보이지 않아야 함');

    // verbose 모드 활성화
    console.log('\n2.2 Verbose 모드 테스트');
    Logger.configure({ verbose: true });
    console.log('현재 설정 (verbose):', Logger.getConfig());
    logInfo('Verbose 모드 정보 메시지', { detail: '상세 정보' });
    Logger.nodeEntry('TestNode');
    Logger.nodeAction('TestNode', '작업 수행 중');
    Logger.nodeExit('TestNode');

    // debug 모드 활성화
    console.log('\n2.3 Debug 모드 테스트');
    Logger.configure({ debug: true, verbose: false });
    console.log('현재 설정 (debug):', Logger.getConfig());
    logDebug('디버그 메시지', { data: '디버그 데이터' });
    Logger.debug('직접 Logger.debug 호출', { moreData: 'test' });

    // 3. 스트리밍 테스트
    console.log('\n3. 스트리밍 설정 테스트');

    // 기본 스트리밍 설정
    Logger.configure({
      verbose: true,
      debug: true,
      aiStream: false,
      nodeStreamConfig: {},
      alwaysVisibleNodes: ['TestNode']
    });

    console.log('스트림 설정:', {
      'TestNode 표시 여부': Logger.isStreamEnabled('TestNode'),
      'OtherNode 표시 여부': Logger.isStreamEnabled('OtherNode')
    });

    // 노드별 스트림 설정
    Logger.setNodeStreamVisibility('OtherNode', true);
    Logger.setNodeStreamVisibility('HiddenNode', false);

    console.log('노드별 설정 후:', {
      'TestNode 표시 여부': Logger.isStreamEnabled('TestNode'),
      'OtherNode 표시 여부': Logger.isStreamEnabled('OtherNode'),
      'HiddenNode 표시 여부': Logger.isStreamEnabled('HiddenNode'),
      'UnknownNode 표시 여부': Logger.isStreamEnabled('UnknownNode')
    });

    // 전역 AI 스트림 활성화
    Logger.configure({ aiStream: true });
    console.log('전역 AI 스트림 활성화 후:', {
      'TestNode 표시 여부': Logger.isStreamEnabled('TestNode'),
      'OtherNode 표시 여부': Logger.isStreamEnabled('OtherNode'),
      'HiddenNode 표시 여부': Logger.isStreamEnabled('HiddenNode'),
      'UnknownNode 표시 여부': Logger.isStreamEnabled('UnknownNode')
    });

    // 4. 성능 측정 유틸리티 테스트
    console.log('\n4. 성능 측정 테스트');

    const result = await logTime('asyncOperation', async () => {
      // 비동기 작업 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true, data: 'result' };
    });

    console.log('비동기 작업 결과:', result);

    // 5. 오류 처리 테스트
    console.log('\n5. 오류 처리 테스트');

    try {
      await logTime('failingOperation', async () => {
        // 실패하는 작업 시뮬레이션
        await new Promise(resolve => setTimeout(resolve, 200));
        throw new Error('의도적인 테스트 오류');
      });
    } catch (error) {
      console.log('예상된 오류가 발생했습니다. 로그 출력을 확인하세요.');
    }

    console.log('\n테스트 완료!');
  } catch (error) {
    console.error('테스트 실행 중 예상치 못한 오류 발생:', error);
  }
}

// 테스트 실행
testLogging().then(() => {
  console.log('로거 테스트 스크립트가 성공적으로 완료되었습니다.');
}).catch(error => {
  console.error('로거 테스트 중 오류:', error);
});