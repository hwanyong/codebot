import { Command } from 'commander';
import { AgentManager, AgentOptions, ModelOptions } from '../agent/manager.js';
import readline from 'readline';
import chalk from 'chalk';
import ora from 'ora';
import dotenv from 'dotenv';
import { ConfigManager, ConfigWizard } from '../config/index.js';
import fs from 'fs';
import path from 'path';

// 환경 변수 로드
dotenv.config();

// 설정 관리자 인스턴스 생성
const configManager = new ConfigManager();

/**
 * 대화형 세션을 시작합니다.
 * @param options 에이전트 옵션
 */
async function startInteractiveSession(options: AgentOptions): Promise<void> {
  // 설정 로드
  configManager.loadConfig();
  configManager.loadEnv();

  // 에이전트 관리자 생성
  const agentManager = new AgentManager(options);

  // 읽기/쓰기 인터페이스 생성
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: chalk.green('> ')
  });

  console.log(chalk.magenta('Codebot이 준비되었습니다! 도움말을 보려면 /help를 입력하세요.'));
  console.log(chalk.gray(`작업 디렉토리: ${process.cwd()}`));

  rl.prompt();

  rl.on('line', async (line) => {
    // 슬래시 명령어 처리
    if (line.startsWith('/')) {
      await handleSlashCommand(line, rl);
      return;
    }

    // 빈 입력 처리
    if (line.trim() === '') {
      rl.prompt();
      return;
    }

    // 로딩 스피너 표시
    const spinner = ora('Codebot이 생각 중입니다...').start();

    try {
      // 에이전트 실행
      const response = await agentManager.run(line);

      // 스피너 중지 및 응답 표시
      spinner.stop();
      console.log(chalk.blue('Codebot: ') + response);
    } catch (error: any) {
      // 오류 처리
      spinner.fail('오류가 발생했습니다.');
      console.error(chalk.red(`오류: ${error.message}`));
    }

    rl.prompt();
  });
}

/**
 * 슬래시 명령어를 처리합니다.
 * @param line 명령어 라인
 * @param rl 읽기/쓰기 인터페이스
 */
async function handleSlashCommand(line: string, rl: readline.Interface): Promise<void> {
  const command = line.slice(1).trim();

  switch (command) {
    case 'help':
      console.log(chalk.yellow('사용 가능한 명령어:'));
      console.log('/help     - 이 도움말 메시지를 표시합니다.');
      console.log('/clear    - 대화 기록을 지웁니다.');
      console.log('/config   - 설정 메뉴를 엽니다.');
      console.log('/exit     - 대화 세션을 종료합니다.');
      break;

    case 'clear':
      console.clear();
      console.log(chalk.green('대화 기록이 지워졌습니다.'));
      break;

    case 'config':
      // 현재 readline 인터페이스 닫기
      rl.close();

      // 설정 마법사 실행
      const wizard = new ConfigWizard();
      await wizard.start();

      // 설정 마법사가 완료된 후 새 readline 인터페이스 생성
      const newRl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: chalk.green('> ')
      });

      console.log(chalk.magenta('Codebot이 준비되었습니다! 도움말을 보려면 /help를 입력하세요.'));
      newRl.prompt();

      // 이벤트 리스너 다시 설정
      newRl.on('line', async (newLine) => {
        if (newLine.startsWith('/')) {
          await handleSlashCommand(newLine, newRl);
        } else {
          // 기존 로직 실행
          // 여기서는 간단히 프롬프트만 표시
          newRl.prompt();
        }
      });
      return;

    case 'exit':
      rl.close();
      process.exit(0);
      break;

    default:
      console.log(chalk.red(`알 수 없는 명령어: ${command}`));
      break;
  }

  rl.prompt();
}

/**
 * 명령어를 안전하게 실행합니다.
 * @param callback 실행할 콜백 함수
 */
async function safeExecute(callback: () => Promise<void>): Promise<void> {
  try {
    await callback();
  } catch (error: any) {
    if (error.code === 'ECONNREFUSED') {
      console.error(chalk.red('AI 서비스에 연결할 수 없습니다. 네트워크 연결을 확인하세요.'));
    } else if (error.code === 'EAUTHORIZATION') {
      console.error(chalk.red('인증에 실패했습니다. API 키를 확인하세요.'));
    } else {
      console.error(chalk.red(`오류: ${error.message}`));
      if (process.env.DEBUG) {
        console.error(error);
      }
    }
    process.exit(1);
  }
}

/**
 * 설정이 존재하는지 확인하고, 없으면 설정 마법사를 실행합니다.
 */
async function ensureConfig(): Promise<void> {
  configManager.loadConfig();

  if (!configManager.configExists() || configManager.getAllProviders().length === 0) {
    console.log(chalk.yellow('Codebot 설정이 필요합니다.'));
    const wizard = new ConfigWizard();
    await wizard.start();
  }

  // 환경 변수 로드
  configManager.loadEnv();
}

/**
 * CLI 프로그램을 생성합니다.
 */
export function createCLI(): Command {
  const program = new Command();

  program
    .name('codebot')
    .description('AI 기반 코딩 어시스턴트 CLI')
    .version('1.0.0');

  program
    .command('chat')
    .description('Codebot과 대화 세션을 시작합니다.')
    .option('-m, --model <n>', '사용할 AI 모델을 지정합니다.')
    .option('-p, --provider <n>', '사용할 모델 제공자를 지정합니다.')
    .option('-t, --temperature <number>', '모델 온도를 지정합니다.', '0.7')
    .option('-v, --verbose', '상세 로깅을 활성화합니다.')
    .action(async (options) => {
      // 설정 확인
      await ensureConfig();

      // 기본 Provider 가져오기
      const defaultProvider = configManager.getDefaultProvider();
      const lastUsed = configManager.getLastUsed();

      // Provider 및 모델 설정
      const provider = options.provider || defaultProvider?.type || 'openai';
      const model = options.model || lastUsed?.model || defaultProvider?.models?.[0] || 'gpt-4';

      const modelOptions: ModelOptions = {
        provider: provider as any,
        model: model,
        temperature: parseFloat(options.temperature)
      };

      const agentOptions: AgentOptions = {
        model: modelOptions,
        verbose: options.verbose
      };

      // 마지막 사용 정보 저장
      configManager.setLastUsed(provider, model);

      await safeExecute(() => startInteractiveSession(agentOptions));
    });

  program
    .command('run')
    .description('특정 작업으로 Codebot을 실행합니다.')
    .argument('<task>', '수행할 작업')
    .option('-m, --model <n>', '사용할 AI 모델을 지정합니다.')
    .option('-p, --provider <n>', '사용할 모델 제공자를 지정합니다.')
    .option('-t, --temperature <number>', '모델 온도를 지정합니다.', '0.7')
    .option('-v, --verbose', '상세 로깅을 활성화합니다.')
    .action(async (task, options) => {
      // 설정 확인
      await ensureConfig();

      // 기본 Provider 가져오기
      const defaultProvider = configManager.getDefaultProvider();
      const lastUsed = configManager.getLastUsed();

      // Provider 및 모델 설정
      const provider = options.provider || defaultProvider?.type || 'openai';
      const model = options.model || lastUsed?.model || defaultProvider?.models?.[0] || 'gpt-4';

      const modelOptions: ModelOptions = {
        provider: provider as any,
        model: model,
        temperature: parseFloat(options.temperature)
      };

      const agentOptions: AgentOptions = {
        model: modelOptions,
        verbose: options.verbose
      };

      // 마지막 사용 정보 저장
      configManager.setLastUsed(provider, model);

      const agentManager = new AgentManager(agentOptions);

      // 로딩 스피너 표시
      const spinner = ora('Codebot이 작업을 처리 중입니다...').start();

      await safeExecute(async () => {
        const response = await agentManager.run(task);
        spinner.stop();
        console.log(response);
      });
    });

  program
    .command('config')
    .description('Codebot 설정을 관리합니다.')
    .action(async () => {
      const wizard = new ConfigWizard();
      await wizard.start();
    });

  // 전역 오류 처리기
  process.on('uncaughtException', (error) => {
    console.error(chalk.red('처리되지 않은 예외:'));
    console.error(error);
    process.exit(1);
  });

  return program;
}