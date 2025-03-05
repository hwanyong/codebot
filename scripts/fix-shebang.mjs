#!/usr/bin/env node

/**
 * 이 스크립트는 빌드 후 실행되어 CLI 진입점 파일의 shebang 라인을 수정합니다.
 * 경고 메시지를 숨기기 위해 --no-warnings 플래그를 추가합니다.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 현재 파일의 디렉토리 경로 가져오기
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// 수정할 파일 목록
const filesToFix = [
  path.join(rootDir, 'dist', 'cli', 'cli.js'),
  path.join(rootDir, 'scripts', 'check-global.mjs')
];

// shebang 라인 수정 함수
function fixShebang(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`파일이 존재하지 않습니다: ${filePath}`);
      return;
    }

    // 파일 내용 읽기
    let content = fs.readFileSync(filePath, 'utf8');

    // shebang 라인 수정
    if (content.startsWith('#!/usr/bin/env node\n')) {
      content = content.replace('#!/usr/bin/env node\n', '#!/usr/bin/env node --no-warnings\n');
      fs.writeFileSync(filePath, content);
      console.log(`수정 완료: ${filePath}`);
    } else if (content.startsWith('#!/usr/bin/env node --no-warnings\n')) {
      console.log(`이미 수정됨: ${filePath}`);
    } else {
      console.log(`shebang 라인을 찾을 수 없습니다: ${filePath}`);
    }
  } catch (error) {
    console.error(`오류 발생: ${filePath}`, error);
  }
}

// 모든 파일 수정
console.log('shebang 라인 수정 중...');
filesToFix.forEach(fixShebang);
console.log('완료!');