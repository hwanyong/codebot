import { Command } from 'commander';
import { AgentManager, AgentOptions, ModelOptions } from '../agent/manager.js';
import readline from 'readline';
import chalk from 'chalk';
import dotenv from 'dotenv';
import { ConfigManager, ConfigWizard } from '../config/index.js';
import { I18n } from '../config/i18n.js';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import os from 'os';
import { SpinnerManager } from './spinner-manager.js';
import { Logger } from '../utils/logger.js';

// exec를 Promise로 변환
const execPromise = promisify(exec);

// 환경 변수 로드
dotenv.config();

// 설정 관리자 인스턴스 생성
const configManager = new ConfigManager();

// i18n 인스턴스 생성
const i18n = I18n.getInstance();

/**
 * 대화형 세션을 시작합니다.
 * @param options 에이전트 옵션
 */
async function startInteractiveSession(options: AgentOptions): Promise<void> {
  // 설정 로드
  configManager.loadConfig();
  configManager.loadEnv();

  // 언어 설정 로드
  i18n.setLanguage(configManager.getLanguage());

  // 에이전트 관리자 생성
  const agentManager = new AgentManager(options);

  // 스피너 관리자 생성
  const spinnerManager = new SpinnerManager();

  // Promise를 반환하여 readline 인터페이스가 닫힐 때까지 완료되지 않도록 함
  return new Promise<void>((resolve) => {
    // 읽기/쓰기 인터페이스 생성 함수
    const createReadlineInterface = () => {
      return readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: chalk.green('> ')
      });
    };

    // 초기 readline 인터페이스 생성
    let rl = createReadlineInterface();

    console.log(chalk.magenta(i18n.t('welcome')));
    console.log(chalk.gray(i18n.t('current_directory', process.cwd())));

    // 스피너 관리자에 readline 인터페이스 설정
    spinnerManager.setReadlineInterface(rl);

    rl.prompt();

    // 이벤트 핸들러를 설정하는 함수
    const setupEventHandlers = (rlInterface: readline.Interface) => {
      rlInterface.on('line', async (line) => {
        // 슬래시 명령어 처리
        if (line.startsWith('/')) {
          await handleSlashCommand(line, rlInterface);
          return;
        }

        // 빈 입력 처리
        if (line.trim() === '') {
          rlInterface.prompt();
          return;
        }

        try {
          // 에이전트 실행 전 현재 readline 인터페이스 비활성화
          rlInterface.pause();

          // 에이전트 실행 - 스피너는 이벤트에 따라 자동으로 관리됨
          const response = await agentManager.run(line);

          // 응답 표시 - 스피너는 자동으로 닫힘

          // 에이전트 실행 후 readline 인터페이스 완전 재생성
          rlInterface.close();

          // TTY 상태가 완전히 초기화될 수 있도록 약간의 지연 추가
          setTimeout(() => {
            // 새 readline 인터페이스 생성
            rl = createReadlineInterface();

            // 새 인터페이스에 이벤트 핸들러 설정
            setupEventHandlers(rl);

            // 스피너 관리자에 새 readline 인터페이스 설정
            spinnerManager.setReadlineInterface(rl);

            // 프롬프트 표시
            rl.prompt();
          }, 100);
        } catch (error: any) {
          // 오류 처리는 이벤트 시스템에서 자동으로 처리
          // 추가적인 오류 정보가 필요한 경우에만 표시
          if (process.env.DEBUG) {
            console.error(error);
          }

          // 오류 발생 후에도 세션 유지
          console.log(chalk.yellow(i18n.t('session_continued')));

          // 에이전트 실행 오류 후에도 readline 인터페이스 완전 재생성
          rlInterface.close();

          setTimeout(() => {
            // 새 readline 인터페이스 생성
            rl = createReadlineInterface();

            // 새 인터페이스에 이벤트 핸들러 설정
            setupEventHandlers(rl);

            // 스피너 관리자에 새 readline 인터페이스 설정
            spinnerManager.setReadlineInterface(rl);

            // 프롬프트 표시
            rl.prompt();
          }, 100);
        }
      });

      // readline 인터페이스가 닫힐 때 이벤트 처리
      rlInterface.on('close', () => {
        // 스피너 관리자 정리
        spinnerManager.cleanup();

        // console.log(chalk.green(i18n.t('goodbye')));

        // Promise 해결
        resolve();
      });
    };

    // 초기 인터페이스에 이벤트 핸들러 설정
    setupEventHandlers(rl);

    // SIGINT(Ctrl+C) 이벤트를 처리하여 정상적으로 종료
    process.on('SIGINT', () => {
      // 스피너 관리자 정리
      spinnerManager.cleanup();
      rl.close();
    });
  });
}

/**
 * 슬래시 명령어를 처리합니다.
 * @param line 명령어 라인
 * @param rl 읽기/쓰기 인터페이스
 */
async function handleSlashCommand(line: string, rl: readline.Interface): Promise<void> {
  const commandLine = line.slice(1).trim();
  const parts = commandLine.split(' ');
  const command = parts[0];
  const args = parts.slice(1).join(' ');

  switch (command) {
    case 'help':
      console.log(chalk.yellow(i18n.t('available_commands')));
      console.log(i18n.t('help_command'));
      console.log(i18n.t('clear_command'));
      console.log(i18n.t('config_command'));
      console.log(i18n.t('info_command'));
      console.log(i18n.t('exec_command'));
      console.log(i18n.t('exit_command'));
      break;

    case 'clear':
      console.clear();
      console.log(chalk.green(i18n.t('history_cleared')));
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

      // 언어 설정 다시 로드
      configManager.loadConfig();
      i18n.setLanguage(configManager.getLanguage());

      console.log(chalk.magenta(i18n.t('welcome')));
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

    case 'info':
      try {
        // 스피너 관리자 생성 - 일회성 사용
        const spinnerManager = new SpinnerManager();
        const info = await getProjectInfo();
        // 스피너는 자동으로 닫힘

        console.log(chalk.bold(i18n.t('project_info')));
        console.log(chalk.cyan(`${i18n.t('working_directory')}:`), info.workingDirectory);

        if (info.project) {
          console.log(chalk.cyan(`${i18n.t('project_name')}:`), info.project.name || '이름 없음');
          if (info.project.version) console.log(chalk.cyan(`${i18n.t('project_version')}:`), info.project.version);
          if (info.project.description) console.log(chalk.cyan(`${i18n.t('project_description')}:`), info.project.description);
          if (info.projectType) console.log(chalk.cyan(`${i18n.t('project_type')}:`), info.projectType);
          console.log(
            chalk.cyan(`${i18n.t('dependencies')}:`),
            i18n.t('dependencies_count', info.project.dependencies || 0, info.project.devDependencies || 0)
          );
        } else {
          console.log(chalk.yellow(i18n.t('no_package_json')));
        }

        if (info.typescript) {
          console.log(chalk.cyan(`${i18n.t('typescript')}:`), i18n.t('typescript_in_use'));
          if (info.typescriptConfig) {
            const tsConfig = info.typescriptConfig;
            console.log(
              chalk.cyan(`   ${i18n.t('typescript_target')}:`),
              tsConfig.target || i18n.t('default_value')
            );
            console.log(
              chalk.cyan(`   ${i18n.t('typescript_module')}:`),
              tsConfig.module || i18n.t('default_value')
            );
            console.log(
              chalk.cyan(`   ${i18n.t('typescript_strict')}:`),
              tsConfig.strict !== undefined ? tsConfig.strict : i18n.t('default_value')
            );
          }
        }

        if (info.git) {
          console.log(chalk.cyan(`${i18n.t('git_branch')}:`), info.git.branch);
          console.log(chalk.cyan(`${i18n.t('git_commit')}:`), info.git.commit.substring(0, 7));
        }

        console.log(chalk.cyan(`${i18n.t('os_info')}:`), `${info.os.platform} ${info.os.release} (${info.os.arch})`);
        console.log(chalk.cyan(`${i18n.t('nodejs_version')}:`), info.node.version);
        console.log(chalk.cyan(`${i18n.t('environment')}:`), info.node.env);

        // 명령어 처리 완료 후 프롬프트 표시
        rl.prompt();
      } catch (error) {
        console.error(chalk.red(`${i18n.t('info_error')}:`), error);
        // 오류 발생 시에도 프롬프트 표시
        rl.prompt();
      }
      return;

    case 'exec':
      if (!args) {
        console.log(chalk.yellow(i18n.t('exec_usage')));
        rl.prompt();
        return;
      }

      console.log(chalk.cyan(`${i18n.t('executing_command')}:`), args);

      // 스피너 관리자 생성 - 일회성 사용
      const execSpinnerManager = new SpinnerManager();

      // 명령어 실행 - await를 사용하여 Promise가 완료될 때까지 기다림
      await new Promise<void>((resolve) => {
        execPromise(args)
          .then(({ stdout, stderr }) => {
            // 성공적으로 실행 완료 - 스피너 자동 닫힘

            if (stdout) console.log(stdout);
            if (stderr) console.error(chalk.yellow(stderr));
            console.log(chalk.green(i18n.t('command_completed')));
          })
          .catch((error) => {
            // 명령어 실행 중 오류 발생 - 스피너 자동 닫힘

            console.error(chalk.red(`${i18n.t('command_error')}:`));
            if (error.stdout) console.log(error.stdout);
            if (error.stderr) console.error(chalk.red(error.stderr));
          })
          .finally(() => {
            // 성공이든 실패든 항상 실행
            execSpinnerManager.cleanup();

            // 프롬프트 표시
            rl.prompt();

            // Promise 해결
            resolve();
          });
      });

      return;

    case 'exit':
      console.log(chalk.green(i18n.t('goodbye')));
      rl.close();
      break;

    default:
      console.log(chalk.red(i18n.t('unknown_command', command)));
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
      console.error(chalk.red(i18n.t('error_message', error.message)));
      if (process.env.DEBUG) {
        console.error(error);
      }
    }

    // chat 명령어에서는 프로세스를 종료하지 않음
    // 명령어 타입을 확인하기 위해 process.argv를 검사
    const isRunCommand = process.argv.includes('run');

    if (isRunCommand) {
      // run 명령어에서만 오류 발생 시 종료
      process.exit(1);
    }
    // chat 명령어에서는 오류 메시지만 표시하고 계속 실행
  }
}

/**
 * 설정이 존재하는지 확인하고, 없으면 설정 마법사를 실행합니다.
 */
async function ensureConfig(): Promise<void> {
  configManager.loadConfig();

  // 언어 설정 로드
  i18n.setLanguage(configManager.getLanguage());

  if (!configManager.configExists() || configManager.getAllProviders().length === 0) {
    console.log(chalk.yellow(i18n.t('settings_required')));
    const wizard = new ConfigWizard();
    await wizard.start();
  }

  // 환경 변수 로드
  configManager.loadEnv();
}

/**
 * 프로젝트 정보를 가져옵니다.
 */
async function getProjectInfo(): Promise<Record<string, any>> {
  const cwd = process.cwd();
  const info: Record<string, any> = {
    workingDirectory: cwd,
    os: {
      platform: process.platform,
      release: os.release(),
      arch: process.arch
    },
    node: {
      version: process.version,
      env: process.env.NODE_ENV || 'development'
    }
  };

  // package.json 확인
  const packageJsonPath = path.join(cwd, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      info.project = {
        name: packageJson.name,
        version: packageJson.version,
        description: packageJson.description,
        type: packageJson.type,
        dependencies: Object.keys(packageJson.dependencies || {}).length,
        devDependencies: Object.keys(packageJson.devDependencies || {}).length
      };

      // 프로젝트 타입 감지
      if (packageJson.dependencies) {
        if (packageJson.dependencies.react) info.projectType = 'React';
        if (packageJson.dependencies.vue) info.projectType = 'Vue';
        if (packageJson.dependencies.angular) info.projectType = 'Angular';
        if (packageJson.dependencies.next) info.projectType = 'Next.js';
        if (packageJson.dependencies.nuxt) info.projectType = 'Nuxt.js';
        if (packageJson.dependencies.express) info.projectType = 'Express';
        if (packageJson.dependencies.koa) info.projectType = 'Koa';
        if (packageJson.dependencies.fastify) info.projectType = 'Fastify';
      }
    } catch (error) {
      info.packageJsonError = 'package.json을 파싱할 수 없습니다.';
    }
  }

  // tsconfig.json 확인
  const tsconfigPath = path.join(cwd, 'tsconfig.json');
  if (fs.existsSync(tsconfigPath)) {
    info.typescript = true;
    try {
      const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
      info.typescriptConfig = {
        target: tsconfig.compilerOptions?.target,
        module: tsconfig.compilerOptions?.module,
        strict: tsconfig.compilerOptions?.strict
      };
    } catch (error) {
      info.tsconfigError = 'tsconfig.json을 파싱할 수 없습니다.';
    }
  }

  // Git 정보 확인
  try {
    const { stdout: gitBranch } = await execPromise('git rev-parse --abbrev-ref HEAD');
    const { stdout: gitCommit } = await execPromise('git rev-parse HEAD');
    info.git = {
      branch: gitBranch.trim(),
      commit: gitCommit.trim()
    };
  } catch (error) {
    // Git 정보를 가져올 수 없는 경우 무시
  }

  return info;
}

/**
 * 터미널 상태를 재설정합니다.
 * @param rl Readline 인터페이스
 */
function resetTerminalState(rl: readline.Interface): void {
  try {
    if (process.stdin.isTTY) {
      // raw 모드가 활성화되어 있다면 비활성화
      if (process.stdin.isRaw) {
        process.stdin.setRawMode(false);
      }

      // 그리고 다시 raw 모드를 활성화했다가 비활성화하여 상태를 완전히 리셋
      process.stdin.setRawMode(true);
      process.stdin.setRawMode(false);
    }

    // readline 인터페이스 내부 상태를 재설정하기 위한 시도
    // 아래 코드는 readline 내부 구현에 의존하므로 주의가 필요함
    try {
      // @ts-ignore - _refreshLine은 내부 메서드지만 여기서는 필요함
      if (typeof rl._refreshLine === 'function') {
        // @ts-ignore
        rl._refreshLine();
      }

      // cursor 위치 재조정
      rl.write('');
    } catch (e) {
      // 내부 메서드 호출 실패는 무시
    }
  } catch (error) {
    // 터미널 상태 재설정 실패 시 조용히 무시
    // 에러를 출력하면 보안이나 UX에 영향을 줄 수 있음
  }
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

  // chat 명령어에 노드별 AI 스트림 제어 옵션 추가
  program
    .command('chat')
    .description('Codebot과 대화 세션을 시작합니다.')
    .option('-m, --model <n>', '사용할 AI 모델을 지정합니다.')
    .option('-p, --provider <n>', '사용할 모델 제공자를 지정합니다.')
    .option('-t, --temperature <number>', '모델 온도를 지정합니다.', '0.7')
    .option('-v, --verbose', '상세 로깅을 활성화합니다.')
    .option('-d, --debug', '디버그 모드를 활성화합니다.')
    .option('-a, --ai-stream', '모든 노드에 대한 AI 스트림 출력을 활성화합니다.')
    .option('--stream-nodes <nodes>', '쉼표로 구분된 AI 스트림을 표시할 노드 목록 (예: translateInput,executeStep)')
    .option('--hide-stream-nodes <nodes>', '쉼표로 구분된 AI 스트림을 숨길 노드 목록')
    .action(async (options) => {
      // 설정 확인
      await ensureConfig();

      // 노드별 스트림 설정 구성
      const nodeStreamConfig: Record<string, boolean> = {};

      if (options.streamNodes) {
        const streamNodes = options.streamNodes.split(',').map((n: string) => n.trim());
        streamNodes.forEach((node: string) => {
          nodeStreamConfig[node] = true;
        });
      }

      if (options.hideStreamNodes) {
        const hideStreamNodes = options.hideStreamNodes.split(',').map((n: string) => n.trim());
        hideStreamNodes.forEach((node: string) => {
          nodeStreamConfig[node] = false;
        });
      }

      // Logger 설정
      Logger.configure({
        verbose: !!options.verbose,
        debug: !!options.debug,
        aiStream: !!options.aiStream,
        graphState: !!options.debug,
        tools: true,
        nodeStreamConfig
      });

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

      try {
        // 대화형 세션 시작
        await startInteractiveSession(agentOptions);
        // 이 코드는 startInteractiveSession이 완료된 후에만 실행됨
        // 하지만 startInteractiveSession은 readline 인터페이스가 닫힐 때까지 완료되지 않음
        // 따라서 이 코드는 실행되지 않을 것임
      } catch (error: any) {
        if (error.code === 'ECONNREFUSED') {
          console.error(chalk.red('AI 서비스에 연결할 수 없습니다. 네트워크 연결을 확인하세요.'));
        } else if (error.code === 'EAUTHORIZATION') {
          console.error(chalk.red('인증에 실패했습니다. API 키를 확인하세요.'));
        } else {
          console.error(chalk.red(i18n.t('error_message', error.message)));
          if (options.debug) {
            console.error(error);
          }
        }
      }

      // 프로세스가 종료되지 않도록 무한 대기
      // 이 코드는 실행되지 않을 것이지만, 혹시 startInteractiveSession이 완료된 경우를 대비
      await new Promise<void>(() => {
        // 이 Promise는 의도적으로 해결되지 않음
      });
    });

  // run 명령어에도 노드별 AI 스트림 제어 옵션 추가
  program
    .command('run')
    .description('특정 작업으로 Codebot을 실행합니다.')
    .argument('<task>', '수행할 작업')
    .option('-m, --model <n>', '사용할 AI 모델을 지정합니다.')
    .option('-p, --provider <n>', '사용할 모델 제공자를 지정합니다.')
    .option('-t, --temperature <number>', '모델 온도를 지정합니다.', '0.7')
    .option('-v, --verbose', '상세 로깅을 활성화합니다.')
    .option('-d, --debug', '디버그 모드를 활성화합니다.')
    .option('-a, --ai-stream', '모든 노드에 대한 AI 스트림 출력을 활성화합니다.')
    .option('--stream-nodes <nodes>', '쉼표로 구분된 AI 스트림을 표시할 노드 목록 (예: translateInput,executeStep)')
    .option('--hide-stream-nodes <nodes>', '쉼표로 구분된 AI 스트림을 숨길 노드 목록')
    .action(async (task, options) => {
      // 설정 확인
      await ensureConfig();

      // 노드별 스트림 설정 구성
      const nodeStreamConfig: Record<string, boolean> = {};

      if (options.streamNodes) {
        const streamNodes = options.streamNodes.split(',').map((n: string) => n.trim());
        streamNodes.forEach((node: string) => {
          nodeStreamConfig[node] = true;
        });
      }

      if (options.hideStreamNodes) {
        const hideStreamNodes = options.hideStreamNodes.split(',').map((n: string) => n.trim());
        hideStreamNodes.forEach((node: string) => {
          nodeStreamConfig[node] = false;
        });
      }

      // Logger 설정
      Logger.configure({
        verbose: !!options.verbose,
        debug: !!options.debug,
        aiStream: !!options.aiStream,
        graphState: !!options.debug,
        tools: true,
        nodeStreamConfig
      });

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
      const spinnerManager = new SpinnerManager();

      try {
        const response = await agentManager.run(task);
        console.log(response);
      } catch (error: any) {
        if (error.code === 'ECONNREFUSED') {
          console.error(chalk.red('AI 서비스에 연결할 수 없습니다. 네트워크 연결을 확인하세요.'));
        } else if (error.code === 'EAUTHORIZATION') {
          console.error(chalk.red('인증에 실패했습니다. API 키를 확인하세요.'));
        } else {
          console.error(chalk.red(i18n.t('error_message', error.message)));
          if (options.debug) {
            console.error(error);
          }
        }
        // run 명령어에서는 오류 발생 시 종료
        process.exit(1);
      } finally {
        spinnerManager.cleanup();
      }
    });

  program
    .command('config')
    .description('Codebot 설정을 관리합니다.')
    .action(async () => {
      const wizard = new ConfigWizard();
      await wizard.start();
    });

  program
    .command('info')
    .description(i18n.t('cmd_info_desc'))
    .action(async () => {
      try {
        const spinnerManager = new SpinnerManager();
        const info = await getProjectInfo();

        console.log(chalk.bold(i18n.t('project_info')));
        console.log(chalk.cyan(`${i18n.t('working_directory')}:`), info.workingDirectory);

        if (info.project) {
          console.log(chalk.cyan(`${i18n.t('project_name')}:`), info.project.name || '이름 없음');
          if (info.project.version) console.log(chalk.cyan(`${i18n.t('project_version')}:`), info.project.version);
          if (info.project.description) console.log(chalk.cyan(`${i18n.t('project_description')}:`), info.project.description);
          if (info.projectType) console.log(chalk.cyan(`${i18n.t('project_type')}:`), info.projectType);
          console.log(
            chalk.cyan(`${i18n.t('dependencies')}:`),
            i18n.t('dependencies_count', info.project.dependencies || 0, info.project.devDependencies || 0)
          );
        } else {
          console.log(chalk.yellow(i18n.t('no_package_json')));
        }

        if (info.typescript) {
          console.log(chalk.cyan(`${i18n.t('typescript')}:`), i18n.t('typescript_in_use'));
          if (info.typescriptConfig) {
            const tsConfig = info.typescriptConfig;
            console.log(
              chalk.cyan(`   ${i18n.t('typescript_target')}:`),
              tsConfig.target || i18n.t('default_value')
            );
            console.log(
              chalk.cyan(`   ${i18n.t('typescript_module')}:`),
              tsConfig.module || i18n.t('default_value')
            );
            console.log(
              chalk.cyan(`   ${i18n.t('typescript_strict')}:`),
              tsConfig.strict !== undefined ? tsConfig.strict : i18n.t('default_value')
            );
          }
        }

        if (info.git) {
          console.log(chalk.cyan(`${i18n.t('git_branch')}:`), info.git.branch);
          console.log(chalk.cyan(`${i18n.t('git_commit')}:`), info.git.commit.substring(0, 7));
        }

        console.log(chalk.cyan(`${i18n.t('os_info')}:`), `${info.os.platform} ${info.os.release} (${info.os.arch})`);
        console.log(chalk.cyan(`${i18n.t('nodejs_version')}:`), info.node.version);
        console.log(chalk.cyan(`${i18n.t('environment')}:`), info.node.env);
      } catch (error) {
        console.error(chalk.red(`${i18n.t('info_error')}:`), error);
      }
    });

  program
    .command('exec')
    .description(i18n.t('cmd_exec_desc'))
    .argument('<command>', i18n.t('cmd_exec_arg'))
    .option('-s, --silent', i18n.t('cmd_exec_silent'))
    .action(async (command, options) => {
      try {
        if (!options.silent) {
          console.log(chalk.cyan(`${i18n.t('executing_command')}:`), command);
        }

        const spinnerManager = new SpinnerManager();

        const { stdout, stderr } = await execPromise(command);

        if (!options.silent) {
          if (stdout) console.log(stdout);
          if (stderr) console.error(chalk.yellow(stderr));
          console.log(chalk.green(i18n.t('command_completed')));
        }
      } catch (error: any) {
        console.error(chalk.red(`${i18n.t('command_error')}:`));
        if (error.stdout) console.log(error.stdout);
        if (error.stderr) console.error(chalk.red(error.stderr));
      }
    });

  // 전역 오류 처리기
  process.on('uncaughtException', (error) => {
    console.error(chalk.red('처리되지 않은 예외:'));
    console.error(error);
    process.exit(1);
  });

  return program;
}