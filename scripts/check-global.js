#!/usr/bin/env node

/**
 * 이 스크립트는 패키지가 전역으로 설치되었는지 확인하고,
 * 설정 파일이 없는 경우 설정 마법사를 실행하도록 안내합니다.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// 지원하는 언어 목록
const LANGUAGES = ['ko', 'en'];

// 메시지 정의
const messages = {
  'global_warning': {
    ko: '⚠️  경고: @uhd_kr/codebot은 전역으로 설치해야 합니다!',
    en: '⚠️  Warning: @uhd_kr/codebot should be installed globally!'
  },
  'cli_tool_info': {
    ko: '이 패키지는 CLI 도구로 설계되었으며 다음과 같이 설치해야 합니다:',
    en: 'This package is designed as a CLI tool and should be installed with:'
  },
  'global_install_command': {
    ko: 'npm install -g @uhd_kr/codebot',
    en: 'npm install -g @uhd_kr/codebot'
  },
  'global_usage_info': {
    ko: '전역 설치 후 "codebot" 명령을 어디서나 사용할 수 있습니다.',
    en: 'After global installation, you can use the "codebot" command from anywhere.'
  },
  'first_time_user': {
    ko: '🔧 Codebot을 처음 사용하시는군요!',
    en: '🔧 First time using Codebot!'
  },
  'run_config_command': {
    ko: '설정을 완료하려면 다음 명령을 실행하세요:',
    en: 'To complete setup, run the following command:'
  },
  'config_command': {
    ko: 'codebot config',
    en: 'codebot config'
  }
};

// 설정 디렉토리 경로 가져오기
function getConfigDir() {
  const homedir = os.homedir();

  switch (process.platform) {
    case 'win32':
      // Windows
      return path.join(process.env.APPDATA || path.join(homedir, 'AppData', 'Roaming'), 'codebot');
    case 'darwin':
      // macOS
      return path.join(homedir, 'Library', 'Application Support', 'codebot');
    default:
      // Linux 및 기타 Unix 계열
      return path.join(homedir, '.config', 'codebot');
  }
}

// 설정 파일 경로 가져오기
function getConfigFilePath() {
  return path.join(getConfigDir(), 'config.json');
}

// 전역 설치 여부 확인
function isGloballyInstalled() {
  try {
    // 현재 실행 파일 경로
    const execPath = process.argv[1];

    // 실행 파일이 node_modules/.bin 디렉토리에 있는지 확인
    // 로컬 설치의 경우 일반적으로 node_modules/.bin에 실행 파일이 있음
    return !execPath.includes('node_modules/.bin');
  } catch (error) {
    // 확인할 수 없는 경우 기본적으로 true 반환
    return true;
  }
}

// 설정 파일 존재 여부 확인
function configExists() {
  return fs.existsSync(getConfigFilePath());
}

// 시스템 언어 감지
function detectLanguage() {
  try {
    // 환경 변수에서 언어 설정 확인
    const envLang = process.env.LANG || process.env.LANGUAGE || process.env.LC_ALL || process.env.LC_MESSAGES;

    if (envLang) {
      const langCode = envLang.split('_')[0].toLowerCase();
      if (LANGUAGES.includes(langCode)) {
        return langCode;
      }
    }

    // 설정 파일에서 언어 설정 확인
    if (configExists()) {
      try {
        const configData = fs.readFileSync(getConfigFilePath(), 'utf-8');
        const config = JSON.parse(configData);
        if (config.language && LANGUAGES.includes(config.language)) {
          return config.language;
        }
      } catch (e) {
        // 설정 파일 읽기 실패 시 무시
      }
    }

    // 기본값은 한국어
    return 'ko';
  } catch (error) {
    return 'ko';
  }
}

// 메시지 가져오기
function getMessage(key, lang) {
  const message = messages[key];
  if (!message) {
    return key;
  }

  return message[lang] || message['en'];
}

// 메인 함수
function main() {
  // 언어 감지
  const lang = detectLanguage();

  // 전역 설치 여부 확인
  if (!isGloballyInstalled()) {
    console.log('\x1b[33m%s\x1b[0m', getMessage('global_warning', lang));
    console.log('\x1b[33m%s\x1b[0m', getMessage('cli_tool_info', lang));
    console.log('\x1b[36m%s\x1b[0m', getMessage('global_install_command', lang));
    console.log('\x1b[33m%s\x1b[0m', getMessage('global_usage_info', lang));
    console.log();
  }

  // 설정 파일 존재 여부 확인
  if (!configExists()) {
    console.log('\x1b[32m%s\x1b[0m', getMessage('first_time_user', lang));
    console.log('\x1b[32m%s\x1b[0m', getMessage('run_config_command', lang));
    console.log('\x1b[36m%s\x1b[0m', getMessage('config_command', lang));
    console.log();
  }
}

// 스크립트 실행
main();