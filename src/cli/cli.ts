#!/usr/bin/env node --no-warnings

// Detect production environment
// 배포 환경 감지
const isProduction = process.env.NODE_ENV === 'production' ||
                     // Check environment variables set by npm during deployment
                     // npm이 배포 과정에서 설정하는 환경 변수 확인
                     process.env.npm_lifecycle_event === 'postinstall' ||
                     // Estimate production environment from global installation status
                     // 전역 설치 여부로 배포 환경 추정
                     !process.argv[1].includes('node_modules/.bin');

// Ignore warning messages only in production environment
// 배포 환경에서만 경고 메시지 무시
if (isProduction) {
  process.on('warning', (warning) => {
    // Ignore only punycode related warnings
    // punycode 관련 경고만 무시
    if (warning.name === 'DeprecationWarning' && warning.message.includes('punycode')) {
      return;
    }
    // Output other warnings normally
    // 다른 경고는 정상적으로 출력
    console.warn(warning.name);
    console.warn(warning.message);
    console.warn(warning.stack);
  });
}

// Note: warnings are displayed in development, but hidden in production
// 참고: 개발 환경에서는 경고가 표시되고, 배포 환경에서만 경고가 숨겨집니다

import { createCLI } from './index.js';
import path from 'path';
import fs from 'fs';

// Function to check if globally installed
// 전역으로 설치되었는지 확인하는 함수
function isGloballyInstalled() {
  try {
    // Path of the current executable
    // 현재 실행 파일의 경로
    const execPath = process.argv[1];

    // Check if the executable is in the node_modules/.bin directory
    // Local installations typically have executables in node_modules/.bin
    // 실행 파일이 node_modules/.bin 디렉토리에 있는지 확인
    // 로컬 설치의 경우 일반적으로 실행 파일이 node_modules/.bin에 있음
    return !execPath.includes('node_modules/.bin');
  } catch (error) {
    // Return true by default if unable to determine
    // 확인할 수 없는 경우 기본적으로 true 반환
    return true;
  }
}

// Display warning if installed locally
// 로컬로 설치된 경우 경고 표시
if (!isGloballyInstalled()) {
  console.log('\x1b[33m%s\x1b[0m', '⚠️  Warning: @uhd_kr/codebot should be installed globally!');
  console.log('\x1b[33m%s\x1b[0m', 'This package is designed as a CLI tool and should be installed with:');
  console.log('\x1b[36m%s\x1b[0m', 'npm install -g @uhd_kr/codebot');
  console.log('\x1b[33m%s\x1b[0m', 'After global installation, you can use the "codebot" command from anywhere.');
  console.log();
}

// Create and run the CLI program
// CLI 프로그램 생성 및 실행
const program = createCLI();
program.parse(process.argv);

// Keep the event loop running to prevent the process from exiting
// Only apply to the chat command
// 프로세스가 종료되지 않도록 이벤트 루프를 유지
// chat 명령어가 실행된 경우에만 적용
if (process.argv.includes('chat')) {
  // Simple timer to keep the event loop alive
  // This timer doesn't actually do anything, but it keeps the event loop running
  // 이벤트 루프를 유지하기 위한 간단한 타이머
  // 이 타이머는 실제로 아무 작업도 수행하지 않지만, 이벤트 루프를 계속 유지함
  const keepAliveTimer = setInterval(() => {
    // Do nothing
    // 아무 작업도 하지 않음
  }, 60000); // Run every 60 seconds (60초마다 실행)

  // Keep the timer reference to prevent garbage collection
  // 타이머 참조를 유지하여 가비지 컬렉션되지 않도록 함
  // keepAliveTimer.unref(); // Remove this line - let the timer prevent process exit
  // keepAliveTimer.unref(); // 이 줄을 제거 - 타이머가 프로세스 종료를 방해하도록 함

  // Handle SIGINT (Ctrl+C) event for graceful exit
  // SIGINT(Ctrl+C) 이벤트를 처리하여 정상적으로 종료
  process.on('SIGINT', () => {
    clearInterval(keepAliveTimer);
    process.exit(0);
  });
}