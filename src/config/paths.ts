import os from 'os';
import path from 'path';

/**
 * 운영 체제별 설정 디렉토리 경로를 반환합니다.
 * - Windows: %APPDATA%\codebot
 * - macOS: ~/Library/Application Support/codebot
 * - Linux: ~/.config/codebot
 */
export function getConfigDir(): string {
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

/**
 * 설정 파일 경로를 반환합니다.
 */
export function getConfigFilePath(): string {
  return path.join(getConfigDir(), 'config.json');
}

/**
 * 환경 변수 파일 경로를 반환합니다.
 */
export function getEnvFilePath(): string {
  return path.join(getConfigDir(), '.env');
}