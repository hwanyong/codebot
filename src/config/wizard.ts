import readline from 'readline';
import chalk from 'chalk';
import { ConfigManager, Provider } from './manager.js';

/**
 * 설정 마법사 클래스
 */
export class ConfigWizard {
  private rl: readline.Interface;
  private configManager: ConfigManager;

  /**
   * 설정 마법사 생성자
   */
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    this.configManager = new ConfigManager();
  }

  /**
   * 사용자에게 질문하고 응답을 받습니다.
   */
  private async question(query: string): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question(query, (answer) => {
        resolve(answer);
      });
    });
  }

  /**
   * 설정 마법사를 시작합니다.
   */
  public async start(): Promise<void> {
    console.log(chalk.cyan('=== Codebot 설정 마법사 ==='));
    console.log(chalk.gray('Codebot을 사용하기 위한 설정을 진행합니다.'));
    console.log();

    // 설정 파일 로드
    this.configManager.loadConfig();

    // 설정 파일이 이미 존재하는 경우
    if (this.configManager.configExists() && this.configManager.getAllProviders().length > 0) {
      await this.showMainMenu();
    } else {
      // 설정 파일이 없는 경우 초기 설정 진행
      console.log(chalk.yellow('초기 설정을 진행합니다.'));
      await this.addProviderWizard();
      console.log(chalk.green('초기 설정이 완료되었습니다!'));
      this.rl.close();
    }
  }

  /**
   * 메인 메뉴를 표시합니다.
   */
  private async showMainMenu(): Promise<void> {
    console.log(chalk.cyan('=== Codebot 설정 메뉴 ==='));
    console.log('1. Provider 목록 보기');
    console.log('2. Provider 추가하기');
    console.log('3. Provider 제거하기');
    console.log('4. 기본 Provider 변경하기');
    console.log('5. 종료하기');
    console.log();

    const answer = await this.question(chalk.green('원하는 작업을 선택하세요 (1-5): '));

    switch (answer.trim()) {
      case '1':
        await this.listProviders();
        await this.showMainMenu();
        break;
      case '2':
        await this.addProviderWizard();
        await this.showMainMenu();
        break;
      case '3':
        await this.removeProviderWizard();
        await this.showMainMenu();
        break;
      case '4':
        await this.changeDefaultProviderWizard();
        await this.showMainMenu();
        break;
      case '5':
        console.log(chalk.green('설정을 종료합니다.'));
        this.rl.close();
        break;
      default:
        console.log(chalk.red('잘못된 선택입니다. 다시 시도하세요.'));
        await this.showMainMenu();
        break;
    }
  }

  /**
   * Provider 목록을 표시합니다.
   */
  private async listProviders(): Promise<void> {
    const providers = this.configManager.getAllProviders();
    const defaultProvider = this.configManager.getDefaultProvider();

    console.log(chalk.cyan('=== Provider 목록 ==='));

    if (providers.length === 0) {
      console.log(chalk.yellow('등록된 Provider가 없습니다.'));
    } else {
      providers.forEach((provider, index) => {
        const isDefault = provider.name === defaultProvider?.name;
        const defaultMark = isDefault ? chalk.green(' (기본값)') : '';

        console.log(`${index + 1}. ${provider.name} - ${provider.type}${defaultMark}`);

        if (provider.baseUrl) {
          console.log(`   Base URL: ${provider.baseUrl}`);
        }

        if (provider.models && provider.models.length > 0) {
          console.log(`   Models: ${provider.models.join(', ')}`);
        }

        console.log();
      });
    }

    await this.question(chalk.gray('계속하려면 Enter 키를 누르세요...'));
  }

  /**
   * Provider 추가 마법사를 실행합니다.
   */
  private async addProviderWizard(): Promise<void> {
    console.log(chalk.cyan('=== Provider 추가 ==='));
    console.log('지원되는 Provider 유형:');
    console.log('1. OpenAI');
    console.log('2. Ollama');
    console.log('3. Anthropic');
    console.log('4. 사용자 정의');
    console.log();

    const typeAnswer = await this.question(chalk.green('Provider 유형을 선택하세요 (1-4): '));
    let providerType: 'openai' | 'ollama' | 'anthropic' | 'custom';

    switch (typeAnswer.trim()) {
      case '1':
        providerType = 'openai';
        break;
      case '2':
        providerType = 'ollama';
        break;
      case '3':
        providerType = 'anthropic';
        break;
      case '4':
        providerType = 'custom';
        break;
      default:
        console.log(chalk.red('잘못된 선택입니다. 기본값으로 OpenAI를 사용합니다.'));
        providerType = 'openai';
        break;
    }

    // Provider 이름 입력
    let providerName = '';
    if (providerType === 'custom') {
      providerName = await this.question(chalk.green('Provider 이름을 입력하세요: '));
    } else {
      providerName = providerType.charAt(0).toUpperCase() + providerType.slice(1);
    }

    // API 키 입력 (Ollama 제외)
    let apiKey = '';
    if (providerType !== 'ollama') {
      apiKey = await this.question(chalk.green(`${providerName}의 API 키를 입력하세요: `));
    }

    // Base URL 입력 (Ollama 또는 사용자 정의)
    let baseUrl = '';
    if (providerType === 'ollama') {
      baseUrl = await this.question(chalk.green('Ollama Base URL을 입력하세요 (기본값: http://localhost:11434): '));
      if (!baseUrl) {
        baseUrl = 'http://localhost:11434';
      }
    } else if (providerType === 'custom') {
      baseUrl = await this.question(chalk.green('Base URL을 입력하세요 (선택 사항): '));
    }

    // 모델 입력
    let modelsInput = '';
    let models: string[] = [];

    if (providerType === 'openai') {
      modelsInput = await this.question(chalk.green('사용 가능한 모델을 입력하세요 (쉼표로 구분, 기본값: gpt-4,gpt-3.5-turbo): '));
      models = modelsInput ? modelsInput.split(',').map(m => m.trim()) : ['gpt-4', 'gpt-3.5-turbo'];
    } else if (providerType === 'anthropic') {
      modelsInput = await this.question(chalk.green('사용 가능한 모델을 입력하세요 (쉼표로 구분, 기본값: claude-3-opus-20240229,claude-3-sonnet-20240229): '));
      models = modelsInput ? modelsInput.split(',').map(m => m.trim()) : ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'];
    } else if (providerType === 'ollama') {
      modelsInput = await this.question(chalk.green('사용 가능한 모델을 입력하세요 (쉼표로 구분, 예: llama3,mistral): '));
      models = modelsInput ? modelsInput.split(',').map(m => m.trim()) : [];
    } else {
      modelsInput = await this.question(chalk.green('사용 가능한 모델을 입력하세요 (쉼표로 구분): '));
      models = modelsInput ? modelsInput.split(',').map(m => m.trim()) : [];
    }

    // 기본값으로 설정할지 여부
    const isDefaultAnswer = await this.question(chalk.green('이 Provider를 기본값으로 설정하시겠습니까? (y/n): '));
    const isDefault = isDefaultAnswer.toLowerCase() === 'y';

    // Provider 객체 생성
    const provider: Provider = {
      name: providerName,
      type: providerType,
      isDefault
    };

    if (apiKey) {
      provider.apiKey = apiKey;
    }

    if (baseUrl) {
      provider.baseUrl = baseUrl;
    }

    if (models.length > 0) {
      provider.models = models;
    }

    // Provider 추가
    this.configManager.addProvider(provider);
    console.log(chalk.green(`${providerName} Provider가 추가되었습니다.`));
  }

  /**
   * Provider 제거 마법사를 실행합니다.
   */
  private async removeProviderWizard(): Promise<void> {
    const providers = this.configManager.getAllProviders();

    if (providers.length === 0) {
      console.log(chalk.yellow('제거할 Provider가 없습니다.'));
      return;
    }

    console.log(chalk.cyan('=== Provider 제거 ==='));
    providers.forEach((provider, index) => {
      console.log(`${index + 1}. ${provider.name} - ${provider.type}`);
    });
    console.log();

    const answer = await this.question(chalk.green(`제거할 Provider 번호를 선택하세요 (1-${providers.length}): `));
    const index = parseInt(answer.trim()) - 1;

    if (isNaN(index) || index < 0 || index >= providers.length) {
      console.log(chalk.red('잘못된 선택입니다.'));
      return;
    }

    const providerName = providers[index].name;
    const confirmAnswer = await this.question(chalk.yellow(`정말로 ${providerName}을(를) 제거하시겠습니까? (y/n): `));

    if (confirmAnswer.toLowerCase() === 'y') {
      this.configManager.removeProvider(providerName);
      console.log(chalk.green(`${providerName} Provider가 제거되었습니다.`));
    } else {
      console.log(chalk.gray('제거가 취소되었습니다.'));
    }
  }

  /**
   * 기본 Provider 변경 마법사를 실행합니다.
   */
  private async changeDefaultProviderWizard(): Promise<void> {
    const providers = this.configManager.getAllProviders();
    const defaultProvider = this.configManager.getDefaultProvider();

    if (providers.length === 0) {
      console.log(chalk.yellow('등록된 Provider가 없습니다.'));
      return;
    }

    console.log(chalk.cyan('=== 기본 Provider 변경 ==='));
    providers.forEach((provider, index) => {
      const isDefault = provider.name === defaultProvider?.name;
      const defaultMark = isDefault ? chalk.green(' (현재 기본값)') : '';
      console.log(`${index + 1}. ${provider.name} - ${provider.type}${defaultMark}`);
    });
    console.log();

    const answer = await this.question(chalk.green(`기본값으로 설정할 Provider 번호를 선택하세요 (1-${providers.length}): `));
    const index = parseInt(answer.trim()) - 1;

    if (isNaN(index) || index < 0 || index >= providers.length) {
      console.log(chalk.red('잘못된 선택입니다.'));
      return;
    }

    const providerName = providers[index].name;
    this.configManager.setDefaultProvider(providerName);
    console.log(chalk.green(`${providerName}이(가) 기본 Provider로 설정되었습니다.`));
  }
}