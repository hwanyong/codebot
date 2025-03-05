import { Command } from 'commander';
import { AgentManager, AgentOptions, ModelOptions } from '../agent/manager.js';
import readline from 'readline';
import chalk from 'chalk';
import ora from 'ora';
import dotenv from 'dotenv';
import { ConfigManager, ConfigWizard } from '../config/index.js';
import { I18n } from '../config/i18n.js';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import os from 'os';

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

  // 읽기/쓰기 인터페이스 생성
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: chalk.green('> ')
  });

  console.log(chalk.magenta(i18n.t('welcome')));
  console.log(chalk.gray(i18n.t('current_directory', process.cwd())));

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
    const spinner = ora(i18n.t('thinking')).start();

    try {
      // 에이전트 실행
      const response = await agentManager.run(line);

      // 스피너 중지 및 응답 표시
      spinner.stop();
      console.log(chalk.blue('Codebot: ') + response);
    } catch (error: any) {
      // 오류 처리
      spinner.fail(i18n.t('error_occurred'));
      console.error(chalk.red(i18n.t('error_message', error.message)));
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
        const spinner = ora(i18n.t('loading')).start();
        const info = await getProjectInfo();
        spinner.stop();

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
      break;

    case 'exec':
      if (!args) {
        console.log(chalk.yellow(i18n.t('exec_usage')));
        break;
      }

      try {
        console.log(chalk.cyan(`${i18n.t('executing_command')}:`), args);

        const spinner = ora(i18n.t('executing')).start();

        const { stdout, stderr } = await execPromise(args);

        spinner.stop();

        if (stdout) console.log(stdout);
        if (stderr) console.error(chalk.yellow(stderr));
        console.log(chalk.green(i18n.t('command_completed')));
      } catch (error: any) {
        console.error(chalk.red(`${i18n.t('command_error')}:`));
        if (error.stdout) console.log(error.stdout);
        if (error.stderr) console.error(chalk.red(error.stderr));
      }
      break;

    case 'exit':
      rl.close();
      process.exit(0);
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
    process.exit(1);
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
      const spinner = ora(i18n.t('thinking')).start();

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

  program
    .command('info')
    .description(i18n.t('cmd_info_desc'))
    .action(async () => {
      try {
        const spinner = ora(i18n.t('loading')).start();
        const info = await getProjectInfo();
        spinner.stop();

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

        const spinner = options.silent ? ora().start() : ora(i18n.t('executing')).start();

        const { stdout, stderr } = await execPromise(command);

        spinner.stop();

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