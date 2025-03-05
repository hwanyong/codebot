/**
 * 지원하는 언어 타입
 */
export type Language = 'ko' | 'en';

/**
 * 다국어 메시지 인터페이스
 */
export interface I18nMessages {
  [key: string]: {
    ko: string;
    en: string;
  };
}

/**
 * CLI 메시지
 */
export const cliMessages: I18nMessages = {
  // 공통 메시지
  'welcome': {
    ko: 'Codebot이 준비되었습니다! 도움말을 보려면 /help를 입력하세요.',
    en: 'Codebot is ready! Type /help for assistance.'
  },
  'current_directory': {
    ko: '작업 디렉토리: {0}',
    en: 'Working directory: {0}'
  },
  'thinking': {
    ko: 'Codebot이 생각 중입니다...',
    en: 'Codebot is thinking...'
  },
  'loading': {
    ko: '정보를 불러오는 중입니다...',
    en: 'Loading information...'
  },
  'executing': {
    ko: '명령어를 실행 중입니다...',
    en: 'Executing command...'
  },
  'project_info': {
    ko: '📊 프로젝트 정보',
    en: '📊 Project Information'
  },
  'working_directory': {
    ko: '📂 작업 디렉토리',
    en: '📂 Working Directory'
  },
  'project_name': {
    ko: '📦 프로젝트',
    en: '📦 Project'
  },
  'project_version': {
    ko: '🔖 버전',
    en: '🔖 Version'
  },
  'project_description': {
    ko: '📝 설명',
    en: '📝 Description'
  },
  'project_type': {
    ko: '🧩 프로젝트 타입',
    en: '🧩 Project Type'
  },
  'dependencies': {
    ko: '📚 의존성',
    en: '📚 Dependencies'
  },
  'dependencies_count': {
    ko: '{0} 개의 의존성, {1} 개의 개발 의존성',
    en: '{0} dependencies, {1} dev dependencies'
  },
  'no_package_json': {
    ko: '⚠️ package.json을 찾을 수 없습니다.',
    en: '⚠️ No package.json found.'
  },
  'typescript': {
    ko: '🔷 TypeScript',
    en: '🔷 TypeScript'
  },
  'typescript_in_use': {
    ko: '사용 중',
    en: 'in use'
  },
  'typescript_target': {
    ko: 'Target',
    en: 'Target'
  },
  'typescript_module': {
    ko: 'Module',
    en: 'Module'
  },
  'typescript_strict': {
    ko: 'Strict',
    en: 'Strict'
  },
  'default_value': {
    ko: '기본값',
    en: 'default'
  },
  'git_branch': {
    ko: '🔀 Git 브랜치',
    en: '🔀 Git Branch'
  },
  'git_commit': {
    ko: '🔒 Git 커밋',
    en: '🔒 Git Commit'
  },
  'os_info': {
    ko: '🖥️ OS',
    en: '🖥️ OS'
  },
  'nodejs_version': {
    ko: '⚙️ Node.js',
    en: '⚙️ Node.js'
  },
  'environment': {
    ko: '🌐 환경',
    en: '🌐 Environment'
  },
  'info_error': {
    ko: '정보를 가져오는 중 오류가 발생했습니다',
    en: 'Error occurred while fetching information'
  },
  'executing_command': {
    ko: '🔄 실행 중',
    en: '🔄 Executing'
  },
  'command_completed': {
    ko: '✅ 명령어 실행 완료',
    en: '✅ Command execution completed'
  },
  'command_error': {
    ko: '명령어 실행 중 오류가 발생했습니다',
    en: 'Error occurred while executing command'
  },
  'error_occurred': {
    ko: '오류가 발생했습니다.',
    en: 'An error occurred.'
  },
  'error_message': {
    ko: '오류: {0}',
    en: 'Error: {0}'
  },
  'unexpected_error': {
    ko: '예상치 못한 오류가 발생했습니다',
    en: 'An unexpected error occurred'
  },
  'session_continued': {
    ko: '세션이 계속됩니다. 새 명령을 입력하세요.',
    en: 'Session continues. Enter a new command.'
  },
  'goodbye': {
    ko: '안녕히 가세요! Codebot을 종료합니다.',
    en: 'Goodbye! Exiting Codebot.'
  },
  'cmd_info_desc': {
    ko: '현재 프로젝트 및 작업 환경 정보를 표시합니다.',
    en: 'Display current project and environment information.'
  },
  'cmd_exec_desc': {
    ko: '터미널 명령어를 실행합니다.',
    en: 'Execute a terminal command.'
  },
  'cmd_exec_arg': {
    ko: '실행할 명령어',
    en: 'Command to execute'
  },
  'cmd_exec_silent': {
    ko: '출력을 표시하지 않습니다.',
    en: 'Do not display output.'
  },

  // 슬래시 명령어
  'available_commands': {
    ko: '사용 가능한 명령어:',
    en: 'Available commands:'
  },
  'help_command': {
    ko: '/help     - 이 도움말 메시지를 표시합니다.',
    en: '/help     - Display this help message.'
  },
  'clear_command': {
    ko: '/clear    - 대화 기록을 지웁니다.',
    en: '/clear    - Clear conversation history.'
  },
  'config_command': {
    ko: '/config   - 설정 메뉴를 엽니다.',
    en: '/config   - Open settings menu.'
  },
  'exit_command': {
    ko: '/exit     - 대화 세션을 종료합니다.',
    en: '/exit     - Exit the conversation session.'
  },
  'info_command': {
    ko: '/info     - 현재 프로젝트 및 작업 환경 정보를 표시합니다.',
    en: '/info     - Display current project and environment information.'
  },
  'exec_command': {
    ko: '/exec     - 터미널 명령어를 실행합니다. 예: /exec ls -la',
    en: '/exec     - Execute a terminal command. Example: /exec ls -la'
  },
  'exec_usage': {
    ko: '사용법: /exec <명령어>',
    en: 'Usage: /exec <command>'
  },
  'unknown_command': {
    ko: '알 수 없는 명령어: {0}',
    en: 'Unknown command: {0}'
  },
  'history_cleared': {
    ko: '대화 기록이 지워졌습니다.',
    en: 'Conversation history cleared.'
  },

  // 설정 마법사
  'settings_wizard_title': {
    ko: '=== Codebot 설정 마법사 ===',
    en: '=== Codebot Settings Wizard ==='
  },
  'settings_wizard_intro': {
    ko: 'Codebot을 사용하기 위한 설정을 진행합니다.',
    en: 'Setting up Codebot for use.'
  },
  'initial_setup': {
    ko: '초기 설정을 진행합니다.',
    en: 'Proceeding with initial setup.'
  },
  'setup_complete': {
    ko: '초기 설정이 완료되었습니다!',
    en: 'Initial setup complete!'
  },

  // 설정 메뉴
  'settings_menu_title': {
    ko: '=== Codebot 설정 메뉴 ===',
    en: '=== Codebot Settings Menu ==='
  },
  'menu_list_providers': {
    ko: '1. Provider 목록 보기',
    en: '1. View Providers'
  },
  'menu_add_provider': {
    ko: '2. Provider 추가하기',
    en: '2. Add Provider'
  },
  'menu_remove_provider': {
    ko: '3. Provider 제거하기',
    en: '3. Remove Provider'
  },
  'menu_change_default': {
    ko: '4. 기본 Provider 변경하기',
    en: '4. Change Default Provider'
  },
  'menu_language': {
    ko: '5. 언어 설정',
    en: '5. Language Settings'
  },
  'menu_exit': {
    ko: '6. 종료하기',
    en: '6. Exit'
  },
  'select_option': {
    ko: '원하는 작업을 선택하세요 (1-6): ',
    en: 'Select an option (1-6): '
  },
  'invalid_selection': {
    ko: '잘못된 선택입니다. 다시 시도하세요.',
    en: 'Invalid selection. Please try again.'
  },
  'exit_settings': {
    ko: '설정을 종료합니다.',
    en: 'Exiting settings.'
  },

  // Provider 목록
  'provider_list_title': {
    ko: '=== Provider 목록 ===',
    en: '=== Provider List ==='
  },
  'no_providers': {
    ko: '등록된 Provider가 없습니다.',
    en: 'No providers registered.'
  },
  'default_mark': {
    ko: ' (기본값)',
    en: ' (Default)'
  },
  'base_url': {
    ko: '   Base URL: {0}',
    en: '   Base URL: {0}'
  },
  'models': {
    ko: '   Models: {0}',
    en: '   Models: {0}'
  },
  'press_enter': {
    ko: '계속하려면 Enter 키를 누르세요...',
    en: 'Press Enter to continue...'
  },

  // Provider 추가
  'add_provider_title': {
    ko: '=== Provider 추가 ===',
    en: '=== Add Provider ==='
  },
  'supported_providers': {
    ko: '지원되는 Provider 유형:',
    en: 'Supported Provider types:'
  },
  'provider_openai': {
    ko: '1. OpenAI',
    en: '1. OpenAI'
  },
  'provider_ollama': {
    ko: '2. Ollama',
    en: '2. Ollama'
  },
  'provider_anthropic': {
    ko: '3. Anthropic',
    en: '3. Anthropic'
  },
  'provider_custom': {
    ko: '4. 사용자 정의',
    en: '4. Custom'
  },
  'select_provider_type': {
    ko: 'Provider 유형을 선택하세요 (1-4): ',
    en: 'Select Provider type (1-4): '
  },
  'invalid_provider_default': {
    ko: '잘못된 선택입니다. 기본값으로 OpenAI를 사용합니다.',
    en: 'Invalid selection. Using OpenAI as default.'
  },
  'enter_provider_name': {
    ko: 'Provider 이름을 입력하세요: ',
    en: 'Enter Provider name: '
  },
  'enter_api_key': {
    ko: '{0}의 API 키를 입력하세요: ',
    en: 'Enter API key for {0}: '
  },
  'enter_ollama_url': {
    ko: 'Ollama Base URL을 입력하세요 (기본값: http://localhost:11434): ',
    en: 'Enter Ollama Base URL (default: http://localhost:11434): '
  },
  'enter_base_url': {
    ko: 'Base URL을 입력하세요 (선택 사항): ',
    en: 'Enter Base URL (optional): '
  },
  'enter_openai_models': {
    ko: '사용 가능한 모델을 입력하세요 (쉼표로 구분, 기본값: gpt-4,gpt-3.5-turbo): ',
    en: 'Enter available models (comma separated, default: gpt-4,gpt-3.5-turbo): '
  },
  'enter_anthropic_models': {
    ko: '사용 가능한 모델을 입력하세요 (쉼표로 구분, 기본값: claude-3-opus-20240229,claude-3-sonnet-20240229): ',
    en: 'Enter available models (comma separated, default: claude-3-opus-20240229,claude-3-sonnet-20240229): '
  },
  'enter_ollama_models': {
    ko: '사용 가능한 모델을 입력하세요 (쉼표로 구분, 예: llama3,mistral): ',
    en: 'Enter available models (comma separated, e.g.: llama3,mistral): '
  },
  'enter_custom_models': {
    ko: '사용 가능한 모델을 입력하세요 (쉼표로 구분): ',
    en: 'Enter available models (comma separated): '
  },
  'set_as_default': {
    ko: '이 Provider를 기본값으로 설정하시겠습니까? (y/n): ',
    en: 'Set this Provider as default? (y/n): '
  },
  'provider_added': {
    ko: '{0} Provider가 추가되었습니다.',
    en: 'Provider {0} has been added.'
  },

  // Provider 제거
  'remove_provider_title': {
    ko: '=== Provider 제거 ===',
    en: '=== Remove Provider ==='
  },
  'no_providers_to_remove': {
    ko: '제거할 Provider가 없습니다.',
    en: 'No providers to remove.'
  },
  'select_provider_to_remove': {
    ko: '제거할 Provider 번호를 선택하세요 (1-{0}): ',
    en: 'Select Provider number to remove (1-{0}): '
  },
  'confirm_remove': {
    ko: '정말로 {0}을(를) 제거하시겠습니까? (y/n): ',
    en: 'Are you sure you want to remove {0}? (y/n): '
  },
  'provider_removed': {
    ko: '{0} Provider가 제거되었습니다.',
    en: 'Provider {0} has been removed.'
  },
  'removal_cancelled': {
    ko: '제거가 취소되었습니다.',
    en: 'Removal cancelled.'
  },

  // 기본 Provider 변경
  'change_default_title': {
    ko: '=== 기본 Provider 변경 ===',
    en: '=== Change Default Provider ==='
  },
  'current_default': {
    ko: ' (현재 기본값)',
    en: ' (Current default)'
  },
  'select_default_provider': {
    ko: '기본값으로 설정할 Provider 번호를 선택하세요 (1-{0}): ',
    en: 'Select Provider number to set as default (1-{0}): '
  },
  'default_provider_changed': {
    ko: '{0}이(가) 기본 Provider로 설정되었습니다.',
    en: '{0} has been set as the default Provider.'
  },

  // 언어 설정
  'language_settings_title': {
    ko: '=== 언어 설정 ===',
    en: '=== Language Settings ==='
  },
  'current_language': {
    ko: '현재 언어: {0}',
    en: 'Current language: {0}'
  },
  'select_language': {
    ko: '언어를 선택하세요:',
    en: 'Select language:'
  },
  'language_korean': {
    ko: '1. 한국어',
    en: '1. Korean'
  },
  'language_english': {
    ko: '2. English (영어)',
    en: '2. English'
  },
  'select_language_option': {
    ko: '언어를 선택하세요 (1-2): ',
    en: 'Select language (1-2): '
  },
  'language_changed': {
    ko: '언어가 {0}(으)로 변경되었습니다.',
    en: 'Language changed to {0}.'
  },
  'korean': {
    ko: '한국어',
    en: 'Korean'
  },
  'english': {
    ko: '영어',
    en: 'English'
  },

  // 설정 필요
  'settings_required': {
    ko: 'Codebot 설정이 필요합니다.',
    en: 'Codebot settings required.'
  },
  'first_time_user': {
    ko: '🔧 Codebot을 처음 사용하시는군요!',
    en: '🔧 First time using Codebot!'
  },
  'run_config_command': {
    ko: '설정을 완료하려면 다음 명령을 실행하세요:',
    en: 'To complete setup, run the following command:'
  },
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
  }
};

/**
 * 다국어 지원 클래스
 */
export class I18n {
  private static instance: I18n;
  private language: Language;

  /**
   * 생성자
   */
  private constructor() {
    this.language = 'ko'; // 기본 언어는 한국어
  }

  /**
   * 싱글톤 인스턴스 가져오기
   */
  public static getInstance(): I18n {
    if (!I18n.instance) {
      I18n.instance = new I18n();
    }
    return I18n.instance;
  }

  /**
   * 현재 언어 가져오기
   */
  public getLanguage(): Language {
    return this.language;
  }

  /**
   * 언어 설정하기
   */
  public setLanguage(language: Language): void {
    this.language = language;
  }

  /**
   * 메시지 가져오기
   */
  public t(key: string, ...args: any[]): string {
    const message = cliMessages[key];
    if (!message) {
      return key;
    }

    let text = message[this.language];
    if (!text) {
      text = message['en']; // 번역이 없으면 영어로 대체
    }

    // 인자 치환
    if (args.length > 0) {
      args.forEach((arg, index) => {
        text = text.replace(`{${index}}`, arg);
      });
    }

    return text;
  }
}