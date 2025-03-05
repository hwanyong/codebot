import readline from 'readline';
import chalk from 'chalk';
import { ConfigManager, Provider } from './manager.js';
import { I18n, Language } from './i18n.js';

/**
 * 설정 마법사 클래스
 */
export class ConfigWizard {
  private rl: readline.Interface;
  private configManager: ConfigManager;
  private i18n: I18n;

  /**
   * 설정 마법사 생성자
   */
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    this.configManager = new ConfigManager();
    this.i18n = I18n.getInstance();

    // 설정에서 언어 로드
    this.configManager.loadConfig();
    this.i18n.setLanguage(this.configManager.getLanguage());
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
    console.log(chalk.cyan(this.i18n.t('settings_wizard_title')));
    console.log(chalk.gray(this.i18n.t('settings_wizard_intro')));
    console.log();

    // 설정 파일 로드
    this.configManager.loadConfig();

    // 설정 파일이 이미 존재하는 경우
    if (this.configManager.configExists() && this.configManager.getAllProviders().length > 0) {
      await this.showMainMenu();
    } else {
      // 설정 파일이 없는 경우 초기 설정 진행
      console.log(chalk.yellow(this.i18n.t('initial_setup')));

      // 언어 설정 먼저 진행
      await this.changeLanguageWizard();

      // Provider 추가
      await this.addProviderWizard();

      console.log(chalk.green(this.i18n.t('setup_complete')));
      this.rl.close();
    }
  }

  /**
   * 메인 메뉴를 표시합니다.
   */
  private async showMainMenu(): Promise<void> {
    console.log(chalk.cyan(this.i18n.t('settings_menu_title')));
    console.log(this.i18n.t('menu_list_providers'));
    console.log(this.i18n.t('menu_add_provider'));
    console.log(this.i18n.t('menu_remove_provider'));
    console.log(this.i18n.t('menu_change_default'));
    console.log(this.i18n.t('menu_language'));
    console.log(this.i18n.t('menu_exit'));
    console.log();

    const answer = await this.question(chalk.green(this.i18n.t('select_option')));

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
        await this.changeLanguageWizard();
        await this.showMainMenu();
        break;
      case '6':
        console.log(chalk.green(this.i18n.t('exit_settings')));
        this.rl.close();
        break;
      default:
        console.log(chalk.red(this.i18n.t('invalid_selection')));
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

    console.log(chalk.cyan(this.i18n.t('provider_list_title')));

    if (providers.length === 0) {
      console.log(chalk.yellow(this.i18n.t('no_providers')));
    } else {
      providers.forEach((provider, index) => {
        const isDefault = provider.name === defaultProvider?.name;
        const defaultMark = isDefault ? chalk.green(this.i18n.t('default_mark')) : '';

        console.log(`${index + 1}. ${provider.name} - ${provider.type}${defaultMark}`);

        if (provider.baseUrl) {
          console.log(this.i18n.t('base_url', provider.baseUrl));
        }

        if (provider.models && provider.models.length > 0) {
          console.log(this.i18n.t('models', provider.models.join(', ')));
        }

        console.log();
      });
    }

    await this.question(chalk.gray(this.i18n.t('press_enter')));
  }

  /**
   * Provider 추가 마법사를 실행합니다.
   */
  private async addProviderWizard(): Promise<void> {
    console.log(chalk.cyan(this.i18n.t('add_provider_title')));
    console.log(this.i18n.t('supported_providers'));
    console.log(this.i18n.t('provider_openai'));
    console.log(this.i18n.t('provider_ollama'));
    console.log(this.i18n.t('provider_anthropic'));
    console.log(this.i18n.t('provider_custom'));
    console.log();

    const typeAnswer = await this.question(chalk.green(this.i18n.t('select_provider_type')));
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
        console.log(chalk.red(this.i18n.t('invalid_provider_default')));
        providerType = 'openai';
        break;
    }

    // Provider 이름 입력
    let providerName = '';
    if (providerType === 'custom') {
      providerName = await this.question(chalk.green(this.i18n.t('enter_provider_name')));
    } else {
      providerName = providerType.charAt(0).toUpperCase() + providerType.slice(1);
    }

    // API 키 입력 (Ollama 제외)
    let apiKey = '';
    if (providerType !== 'ollama') {
      apiKey = await this.question(chalk.green(this.i18n.t('enter_api_key', providerName)));
    }

    // Base URL 입력 (Ollama 또는 사용자 정의)
    let baseUrl = '';
    if (providerType === 'ollama') {
      baseUrl = await this.question(chalk.green(this.i18n.t('enter_ollama_url')));
      if (!baseUrl) {
        baseUrl = 'http://localhost:11434';
      }
    } else if (providerType === 'custom') {
      baseUrl = await this.question(chalk.green(this.i18n.t('enter_base_url')));
    }

    // 모델 입력
    let modelsInput = '';
    let models: string[] = [];

    if (providerType === 'openai') {
      modelsInput = await this.question(chalk.green(this.i18n.t('enter_openai_models')));
      models = modelsInput ? modelsInput.split(',').map(m => m.trim()) : ['gpt-4', 'gpt-3.5-turbo'];
    } else if (providerType === 'anthropic') {
      modelsInput = await this.question(chalk.green(this.i18n.t('enter_anthropic_models')));
      models = modelsInput ? modelsInput.split(',').map(m => m.trim()) : ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'];
    } else if (providerType === 'ollama') {
      modelsInput = await this.question(chalk.green(this.i18n.t('enter_ollama_models')));
      models = modelsInput ? modelsInput.split(',').map(m => m.trim()) : [];
    } else {
      modelsInput = await this.question(chalk.green(this.i18n.t('enter_custom_models')));
      models = modelsInput ? modelsInput.split(',').map(m => m.trim()) : [];
    }

    // 기본값으로 설정할지 여부
    const isDefaultAnswer = await this.question(chalk.green(this.i18n.t('set_as_default')));
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
    console.log(chalk.green(this.i18n.t('provider_added', providerName)));
  }

  /**
   * Provider 제거 마법사를 실행합니다.
   */
  private async removeProviderWizard(): Promise<void> {
    const providers = this.configManager.getAllProviders();

    if (providers.length === 0) {
      console.log(chalk.yellow(this.i18n.t('no_providers_to_remove')));
      return;
    }

    console.log(chalk.cyan(this.i18n.t('remove_provider_title')));
    providers.forEach((provider, index) => {
      console.log(`${index + 1}. ${provider.name} - ${provider.type}`);
    });
    console.log();

    const answer = await this.question(chalk.green(this.i18n.t('select_provider_to_remove', providers.length)));
    const index = parseInt(answer.trim()) - 1;

    if (isNaN(index) || index < 0 || index >= providers.length) {
      console.log(chalk.red(this.i18n.t('invalid_selection')));
      return;
    }

    const providerName = providers[index].name;
    const confirmAnswer = await this.question(chalk.yellow(this.i18n.t('confirm_remove', providerName)));

    if (confirmAnswer.toLowerCase() === 'y') {
      this.configManager.removeProvider(providerName);
      console.log(chalk.green(this.i18n.t('provider_removed', providerName)));
    } else {
      console.log(chalk.gray(this.i18n.t('removal_cancelled')));
    }
  }

  /**
   * 기본 Provider 변경 마법사를 실행합니다.
   */
  private async changeDefaultProviderWizard(): Promise<void> {
    const providers = this.configManager.getAllProviders();
    const defaultProvider = this.configManager.getDefaultProvider();

    if (providers.length === 0) {
      console.log(chalk.yellow(this.i18n.t('no_providers')));
      return;
    }

    console.log(chalk.cyan(this.i18n.t('change_default_title')));
    providers.forEach((provider, index) => {
      const isDefault = provider.name === defaultProvider?.name;
      const defaultMark = isDefault ? chalk.green(this.i18n.t('current_default')) : '';
      console.log(`${index + 1}. ${provider.name} - ${provider.type}${defaultMark}`);
    });
    console.log();

    const answer = await this.question(chalk.green(this.i18n.t('select_default_provider', providers.length)));
    const index = parseInt(answer.trim()) - 1;

    if (isNaN(index) || index < 0 || index >= providers.length) {
      console.log(chalk.red(this.i18n.t('invalid_selection')));
      return;
    }

    const providerName = providers[index].name;
    this.configManager.setDefaultProvider(providerName);
    console.log(chalk.green(this.i18n.t('default_provider_changed', providerName)));
  }

  /**
   * 언어 설정 마법사를 실행합니다.
   */
  private async changeLanguageWizard(): Promise<void> {
    const currentLanguage = this.configManager.getLanguage();
    const languageName = currentLanguage === 'ko' ? this.i18n.t('korean') : this.i18n.t('english');

    console.log(chalk.cyan(this.i18n.t('language_settings_title')));
    console.log(this.i18n.t('current_language', languageName));
    console.log();
    console.log(this.i18n.t('select_language'));
    console.log(this.i18n.t('language_korean'));
    console.log(this.i18n.t('language_english'));
    console.log();

    const answer = await this.question(chalk.green(this.i18n.t('select_language_option')));
    let newLanguage: Language = currentLanguage;

    switch (answer.trim()) {
      case '1':
        newLanguage = 'ko';
        break;
      case '2':
        newLanguage = 'en';
        break;
      default:
        console.log(chalk.red(this.i18n.t('invalid_selection')));
        return;
    }

    // 언어 변경
    this.configManager.setLanguage(newLanguage);
    this.i18n.setLanguage(newLanguage);

    // 변경된 언어로 메시지 표시
    const newLanguageName = newLanguage === 'ko' ? this.i18n.t('korean') : this.i18n.t('english');
    console.log(chalk.green(this.i18n.t('language_changed', newLanguageName)));
  }
}