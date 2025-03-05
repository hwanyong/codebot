#!/usr/bin/env node --no-warnings

// 배포 환경 감지
const isProduction = process.env.NODE_ENV === 'production' ||
                     // npm이 배포 과정에서 설정하는 환경 변수 확인
                     process.env.npm_lifecycle_event === 'postinstall' ||
                     // 전역 설치 여부로 배포 환경 추정
                     !process.argv[1].includes('node_modules/.bin');

// 배포 환경에서만 경고 메시지 무시
if (isProduction) {
  process.on('warning', (warning) => {
    // punycode 관련 경고만 무시
    if (warning.name === 'DeprecationWarning' && warning.message.includes('punycode')) {
      return;
    }
    // 다른 경고는 정상적으로 출력
    console.warn(warning.name);
    console.warn(warning.message);
    console.warn(warning.stack);
  });
}

// 참고: 개발 환경에서는 경고가 표시되고, 배포 환경에서만 경고가 숨겨집니다.

import { createCLI } from './index.js';
import path from 'path';
import fs from 'fs';

// Function to check if globally installed
function isGloballyInstalled() {
  try {
    // Path of the current executable
    const execPath = process.argv[1];

    // Check if the executable is in the node_modules/.bin directory
    // Local installations typically have executables in node_modules/.bin
    return !execPath.includes('node_modules/.bin');
  } catch (error) {
    // Return true by default if unable to determine
    return true;
  }
}

// Display warning if installed locally
if (!isGloballyInstalled()) {
  console.log('\x1b[33m%s\x1b[0m', '⚠️  Warning: @uhd_kr/codebot should be installed globally!');
  console.log('\x1b[33m%s\x1b[0m', 'This package is designed as a CLI tool and should be installed with:');
  console.log('\x1b[36m%s\x1b[0m', 'npm install -g @uhd_kr/codebot');
  console.log('\x1b[33m%s\x1b[0m', 'After global installation, you can use the "codebot" command from anywhere.');
  console.log();
}

// Create and run the CLI program
const program = createCLI();
program.parse(process.argv);

// 프로세스가 종료되지 않도록 이벤트 루프를 유지
// chat 명령어가 실행된 경우에만 적용
if (process.argv.includes('chat')) {
  // 이벤트 루프를 유지하기 위한 간단한 타이머
  // 이 타이머는 실제로 아무 작업도 수행하지 않지만, 이벤트 루프를 계속 유지함
  const keepAliveTimer = setInterval(() => {
    // 아무 작업도 하지 않음
  }, 60000); // 60초마다 실행

  // 타이머 참조를 유지하여 가비지 컬렉션되지 않도록 함
  // keepAliveTimer.unref(); // 이 줄을 제거 - 타이머가 프로세스 종료를 방해하도록 함

  // SIGINT(Ctrl+C) 이벤트를 처리하여 정상적으로 종료
  process.on('SIGINT', () => {
    clearInterval(keepAliveTimer);
    process.exit(0);
  });
}