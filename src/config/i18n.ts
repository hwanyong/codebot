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
  },

  // 번역 도구 관련 메시지
  'translation_completed': {
    ko: '번역이 완료되었습니다.',
    en: 'Translation completed.'
  },
  'already_target_language': {
    ko: '텍스트가 이미 대상 언어로 되어 있습니다.',
    en: 'Text is already in the target language.'
  },
  'source_language_detected': {
    ko: '감지된 원본 언어: {0}',
    en: 'Source language detected: {0}'
  },
  'translation_failed': {
    ko: '번역에 실패했습니다: {0}',
    en: 'Translation failed: {0}'
  },
  'unsupported_language': {
    ko: '지원되지 않는 언어: {0}. 현재는 영어와 한국어만 지원합니다.',
    en: 'Unsupported language: {0}. Currently only English and Korean are supported.'
  },

  // 디버깅 로깅 관련 메시지
  'debug_mode_enabled': {
    ko: '🐞 디버그 모드가 활성화되었습니다.',
    en: '🐞 Debug mode is enabled.'
  },
  'debug_mode_description': {
    ko: '상세한 로그와 오류 정보가 표시됩니다.',
    en: 'Detailed logs and error information will be shown.'
  },
  'log_enter_node': {
    ko: '노드 진입',
    en: 'ENTER NODE'
  },
  'log_exit_node': {
    ko: '노드 종료',
    en: 'EXIT NODE'
  },
  'log_status_error': {
    ko: '오류',
    en: 'error'
  },
  'log_status_completed': {
    ko: '완료',
    en: 'completed'
  },
  'log_status_success': {
    ko: '성공',
    en: 'success'
  },
  'log_status_fail': {
    ko: '실패',
    en: 'fail'
  },
  'log_graph_state': {
    ko: '그래프 상태',
    en: 'GRAPH'
  },
  'log_error': {
    ko: '오류',
    en: 'ERROR'
  },
  'log_tool_execution': {
    ko: '도구 실행',
    en: 'TOOL EXECUTION'
  },
  'log_tool_result': {
    ko: '도구 결과',
    en: 'TOOL RESULT'
  },

  // 테스트 명령어
  'cmd_test_desc': {
    ko: '도구 테스트를 실행합니다.',
    en: 'Run tests for Codebot tools.'
  },
  'cmd_tool_desc': {
    ko: '도구를 직접 실행합니다.',
    en: 'Run tools directly.'
  },
  'test_error': {
    ko: '테스트 실행 중 오류가 발생했습니다: {0}',
    en: 'Error occurred while running tests: {0}'
  },
  'tool_execution_error': {
    ko: '도구 실행 중 오류가 발생했습니다: {0}',
    en: 'Error occurred while executing tool: {0}'
  },
  'tool_not_found': {
    ko: '도구를 찾을 수 없습니다: {0} (카테고리: {1})',
    en: 'Tool not found: {0} (category: {1})'
  },
  'invalid_json_params': {
    ko: '잘못된 JSON 파라미터: {0}',
    en: 'Invalid JSON parameters: {0}'
  },

  // 테스트 실행 관련 메시지
  'test_invalid_category': {
    ko: '유효하지 않은 테스트 카테고리입니다.',
    en: 'Invalid test category.'
  },
  'test_duplicate_category': {
    ko: '중복된 테스트 카테고리: {0}',
    en: 'Duplicate test category: {0}'
  },
  'test_category_not_found': {
    ko: '테스트 카테고리를 찾을 수 없습니다: {0}',
    en: 'Test category not found: {0}'
  },
  'test_not_found': {
    ko: '테스트를 찾을 수 없습니다: {0} (카테고리: {1})',
    en: 'Test not found: {0} (category: {1})'
  },
  'test_running_category': {
    ko: '테스트 카테고리 실행 중: {0}',
    en: 'Running test category: {0}'
  },
  'test_running': {
    ko: '테스트 실행 중',
    en: 'Running test'
  },
  'test_passed': {
    ko: '통과',
    en: 'passed'
  },
  'test_failed': {
    ko: '실패',
    en: 'failed'
  },
  'test_summary': {
    ko: '테스트 요약: {0}개 중 {1}개 통과, {2}개 실패',
    en: 'Test summary: {0} tests, {1} passed, {2} failed'
  },
  'test_running_all': {
    ko: '모든 테스트 실행 중',
    en: 'Running all tests'
  },
  'test_category': {
    ko: '카테고리',
    en: 'Category'
  },
  'test_results': {
    ko: '테스트 결과',
    en: 'Test results'
  },
  'test_summary_all': {
    ko: '전체 테스트 요약: {0}개 중 {1}개 통과, {2}개 실패',
    en: 'Overall test summary: {0} tests, {1} passed, {2} failed'
  },
  'test_log_header': {
    ko: '테스트 실행 결과 - {0}',
    en: 'Test Run Results - {0}'
  },
  'test_log_written': {
    ko: '테스트 결과가 파일에 저장되었습니다: {0}',
    en: 'Test results written to file: {0}'
  },
  'test_log_error': {
    ko: '테스트 결과 로깅 오류: {0}',
    en: 'Error logging test results: {0}'
  },
  'test_overall_summary': {
    ko: '전체 테스트 요약',
    en: 'Overall Test Summary'
  },
  'test_complete_summary': {
    ko: '종합 요약',
    en: 'Complete Summary'
  },
  'test_total': {
    ko: '테스트',
    en: 'tests'
  },
  'test_categories': {
    ko: '테스트 카테고리',
    en: 'Test Categories'
  },
  'select_test_category': {
    ko: '테스트 카테고리를 선택하세요',
    en: 'Select a test category'
  },
  'run_all_tests': {
    ko: '모든 테스트 실행',
    en: 'Run all tests'
  },
  'exit': {
    ko: '종료',
    en: 'Exit'
  },
  'test_exit': {
    ko: '테스트 메뉴를 종료합니다.',
    en: 'Exiting test menu.'
  },

  // 파일 시스템 테스트
  'test_file_count_mismatch': {
    ko: '파일 개수가 일치하지 않습니다. 예상: {0}, 실제: {1}',
    en: 'File count mismatch. Expected: {0}, Actual: {1}'
  },
  'test_recursive_file_count_mismatch': {
    ko: '재귀적 파일 개수가 일치하지 않습니다. 예상: {0}, 실제: {1}',
    en: 'Recursive file count mismatch. Expected: {0}, Actual: {1}'
  },
  'test_list_files_success': {
    ko: '파일 목록 조회 테스트 성공',
    en: 'List files test successful'
  },
  'test_content_mismatch': {
    ko: '파일 내용이 일치하지 않습니다.',
    en: 'File content mismatch.'
  },
  'test_read_file_success': {
    ko: '파일 읽기 테스트 성공',
    en: 'Read file test successful'
  },
  'test_write_content_mismatch': {
    ko: '작성된 파일 내용이 일치하지 않습니다.',
    en: 'Written file content mismatch.'
  },
  'test_write_file_success': {
    ko: '파일 쓰기 테스트 성공',
    en: 'Write file test successful'
  },
  'test_error_handling_failed': {
    ko: '{0}의 오류 처리가 실패했습니다.',
    en: 'Error handling failed for {0}.'
  },
  'test_error_handling_success': {
    ko: '오류 처리 테스트 성공',
    en: 'Error handling test successful'
  },

  // 터미널 테스트
  'test_command_output_mismatch': {
    ko: '명령어 출력이 예상과 일치하지 않습니다.',
    en: 'Command output does not match expected.'
  },
  'test_basic_command_success': {
    ko: '기본 명령어 테스트 성공',
    en: 'Basic command test successful'
  },
  'test_env_var_not_found': {
    ko: '환경 변수 {0}을(를) 출력에서 찾을 수 없습니다.',
    en: 'Environment variable {0} not found in output.'
  },
  'test_env_var_success': {
    ko: '환경 변수 테스트 성공',
    en: 'Environment variable test successful'
  },
  'test_working_dir_mismatch': {
    ko: '작업 디렉토리가 일치하지 않습니다. 예상: {0}, 실제: {1}',
    en: 'Working directory mismatch. Expected: {0}, Actual: {1}'
  },
  'test_working_dir_success': {
    ko: '작업 디렉토리 테스트 성공',
    en: 'Working directory test successful'
  },

  // 컨텍스트 테스트
  'test_context_invalid': {
    ko: '유효하지 않은 컨텍스트 객체입니다.',
    en: 'Invalid context object.'
  },
  'test_get_context_success': {
    ko: '컨텍스트 조회 테스트 성공',
    en: 'Get context test successful'
  },
  'test_context_data_not_found': {
    ko: '컨텍스트에서 데이터를 찾을 수 없습니다: {0}',
    en: 'Data not found in context: {0}'
  },
  'test_add_context_success': {
    ko: '컨텍스트 추가 테스트 성공',
    en: 'Add to context test successful'
  },
  'test_complex_data_integrity_failed': {
    ko: '복잡한 데이터 무결성 검증 실패',
    en: 'Complex data integrity verification failed'
  },
  'test_complex_data_success': {
    ko: '복잡한 데이터 테스트 성공',
    en: 'Complex data test successful'
  },

  // 번역 테스트
  'test_translation_empty': {
    ko: '번역 결과가 비어 있습니다.',
    en: 'Translation result is empty.'
  },
  'test_translation_not_english': {
    ko: '번역 결과가 영어가 아닙니다.',
    en: 'Translation result is not English.'
  },
  'test_translate_ko_en_success': {
    ko: '한국어-영어 번역 테스트 성공',
    en: 'Korean to English translation test successful'
  },
  'test_translation_not_korean': {
    ko: '번역 결과가 한국어가 아닙니다.',
    en: 'Translation result is not Korean.'
  },
  'test_translate_en_ko_success': {
    ko: '영어-한국어 번역 테스트 성공',
    en: 'English to Korean translation test successful'
  },

  // 도구 실행 시스템
  'no_categories_available': {
    ko: '사용 가능한 카테고리가 없습니다.',
    en: 'No categories available.'
  },
  'select_category': {
    ko: '카테고리를 선택하세요:',
    en: 'Select a category:'
  },
  'enter_number': {
    ko: '번호를 입력하세요',
    en: 'Enter number'
  },
  'no_tools_available': {
    ko: '사용 가능한 도구가 없습니다.',
    en: 'No tools available.'
  },
  'select_tool': {
    ko: '도구를 선택하세요:',
    en: 'Select a tool:'
  },
  'enter_parameters': {
    ko: '{0} 도구를 위한 파라미터를 입력하세요',
    en: 'Enter parameters for {0} tool'
  },
  'parameters_info': {
    ko: '도구 실행에 필요한 파라미터를 제공하세요.',
    en: 'Please provide parameters needed to run the tool.'
  },
  'select_input_method': {
    ko: '파라미터 입력 방식을 선택하세요:',
    en: 'Select input method:'
  },
  'interactive_input': {
    ko: '대화형 입력 (각 파라미터 개별 입력)',
    en: 'Interactive input (enter each parameter separately)'
  },
  'json_input': {
    ko: 'JSON 형식 입력 (모든 파라미터를 JSON으로)',
    en: 'JSON format input (all parameters as JSON)'
  },
  'enter_json_parameters': {
    ko: 'JSON 형식으로 파라미터를 입력하세요:',
    en: 'Enter parameters in JSON format:'
  },
  'json_prompt': {
    ko: 'JSON 입력 (빈 줄로 완료):',
    en: 'JSON input (empty line to finish):'
  },
  'invalid_json_object': {
    ko: '유효하지 않은 JSON 객체입니다.',
    en: 'Invalid JSON object.'
  },
  'json_parse_error': {
    ko: 'JSON 파싱 오류: {0}',
    en: 'JSON parsing error: {0}'
  },
  'try_again': {
    ko: '다시 시도하시겠습니까?',
    en: 'Would you like to try again?'
  },
  'interactive_parameters': {
    ko: '각 파라미터를 개별적으로 입력하세요:',
    en: 'Enter each parameter individually:'
  },
  'required': {
    ko: '필수',
    en: 'required'
  },
  'optional': {
    ko: '선택사항',
    en: 'optional'
  },
  'parameter_required': {
    ko: '{0} 파라미터는 필수입니다.',
    en: 'Parameter {0} is required.'
  },
  'invalid_number': {
    ko: '유효한 숫자가 아닙니다.',
    en: 'Not a valid number.'
  },
  'invalid_integer': {
    ko: '유효한 정수가 아닙니다.',
    en: 'Not a valid integer.'
  },
  'invalid_boolean': {
    ko: '유효한 불리언 값이 아닙니다.',
    en: 'Not a valid boolean value.'
  },
  'not_array': {
    ko: '배열이 아닙니다.',
    en: 'Not an array.'
  },
  'invalid_object': {
    ko: '유효한 객체가 아닙니다.',
    en: 'Not a valid object.'
  },
  'invalid_json': {
    ko: '유효한 JSON이 아닙니다.',
    en: 'Not a valid JSON.'
  },
  'invalid_input': {
    ko: '유효하지 않은 입력: {0}',
    en: 'Invalid input: {0}'
  },
  'parameters_summary': {
    ko: '입력한 파라미터 요약:',
    en: 'Parameter summary:'
  },
  'confirm_parameters': {
    ko: '이 파라미터로 도구를 실행하시겠습니까?',
    en: 'Run tool with these parameters?'
  },
  'invalid_yes_no': {
    ko: '유효한 응답이 아닙니다. y 또는 n을 입력하세요.',
    en: 'Invalid response. Please enter y or n.'
  },
  'run_again': {
    ko: '다시 실행하시겠습니까?',
    en: 'Would you like to run again?'
  },
  'use_same_tool': {
    ko: '같은 도구를 사용하시겠습니까?',
    en: 'Would you like to use the same tool?'
  },
  'tool_execution_result': {
    ko: '도구 실행 결과',
    en: 'Tool Execution Result'
  },
  'tool_info': {
    ko: '도구 정보',
    en: 'Tool Information'
  },
  'name': {
    ko: '이름',
    en: 'Name'
  },
  'description': {
    ko: '설명',
    en: 'Description'
  },
  'category': {
    ko: '카테고리',
    en: 'Category'
  },
  'parameters': {
    ko: '파라미터',
    en: 'Parameters'
  },
  'result': {
    ko: '결과',
    en: 'Result'
  },
  'status': {
    ko: '상태',
    en: 'Status'
  },
  'success': {
    ko: '성공',
    en: 'Success'
  },
  'failure': {
    ko: '실패',
    en: 'Failure'
  },
  'execution_time': {
    ko: '실행 시간',
    en: 'Execution Time'
  },
  'output_data': {
    ko: '출력 데이터',
    en: 'Output Data'
  },
  'error': {
    ko: '오류',
    en: 'Error'
  },
  'unknown_error': {
    ko: '알 수 없는 오류',
    en: 'Unknown error'
  },
  'empty_object': {
    ko: '빈 객체',
    en: 'Empty object'
  },
  'json_render_error': {
    ko: 'JSON 렌더링 오류',
    en: 'JSON rendering error'
  },
  'no_output': {
    ko: '출력 없음',
    en: 'No output'
  }
};

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 현재 스크립트의 디렉토리 경로
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 다국어 지원 클래스
 * 다양한 언어로된 메시지를 제공합니다.
 *
 * Generated by Copilot
 */
export class I18n {
  private static _instance: I18n;
  private _language: string = 'en';
  private _translations: Record<string, Record<string, string>> = {
    en: {
      welcome: 'Welcome to Codebot CLI! Type your question or command below.',
      goodbye: 'Thank you for using Codebot CLI. Goodbye!',
      current_directory: 'Working in: %s',
      thinking: 'Codebot is thinking...',
      error_occurred: 'An error occurred',
      error_message: 'Error: %s',
      session_continued: 'You can continue your session.',
      settings_required: 'Initial settings are required. Starting configuration wizard...',
      available_commands: 'Available commands:',
      help_command: '/help - Display this help message',
      clear_command: '/clear - Clear the console',
      config_command: '/config - Open configuration wizard',
      info_command: '/info - Show project information',
      exec_command: '/exec <command> - Execute a shell command',
      exit_command: '/exit - Exit the CLI',
      history_cleared: 'Console history cleared.',
      exec_usage: 'Usage: /exec <command>',
      executing_command: 'Executing',
      executing: 'Executing...',
      command_completed: 'Command execution completed.',
      command_error: 'Command execution failed',
      loading: 'Loading...',
      project_info: 'Project Information',
      working_directory: 'Working directory',
      project_name: 'Project name',
      project_version: 'Version',
      project_description: 'Description',
      project_type: 'Project type',
      dependencies: 'Dependencies',
      dependencies_count: '%d dependencies, %d dev dependencies',
      no_package_json: 'No package.json found',
      typescript: 'TypeScript',
      typescript_in_use: 'In use',
      typescript_target: 'Target',
      typescript_module: 'Module type',
      typescript_strict: 'Strict mode',
      default_value: 'default',
      git_branch: 'Git branch',
      git_commit: 'Git commit',
      os_info: 'OS',
      nodejs_version: 'Node.js',
      environment: 'Environment',
      info_error: 'Error getting project info',
      cmd_info_desc: 'Display information about the current project.',
      cmd_exec_desc: 'Execute a shell command.',
      cmd_exec_arg: 'Command to execute',
      cmd_exec_silent: 'Silent mode, suppress output',
      // 스피너 관리자를 위한 새로운 메시지 추가
      node_processing: 'Processing node: %s',
      node_completed: 'Completed node: %s',
      node_failed: 'Failed node: %s',
      model_processing: 'Running AI model in %s',
      model_streaming_start: 'AI Response Stream Started',
      model_streaming_end: 'AI Response Stream Completed',
      model_streaming_error: 'AI Response Stream Error'
    },
    ko: {
      welcome: 'Codebot CLI에 오신 것을 환영합니다! 아래에 질문이나 명령을 입력하세요.',
      goodbye: 'Codebot CLI를 사용해 주셔서 감사합니다. 안녕히 가세요!',
      current_directory: '작업 디렉토리: %s',
      thinking: 'Codebot이 생각 중입니다...',
      error_occurred: '오류가 발생했습니다',
      error_message: '오류: %s',
      session_continued: '세션을 계속 진행할 수 있습니다.',
      settings_required: '초기 설정이 필요합니다. 설정 마법사를 시작합니다...',
      available_commands: '사용 가능한 명령어:',
      help_command: '/help - 이 도움말 표시',
      clear_command: '/clear - 콘솔 내역 지우기',
      config_command: '/config - 설정 마법사 열기',
      info_command: '/info - 프로젝트 정보 표시',
      exec_command: '/exec <명령어> - 쉘 명령어 실행',
      exit_command: '/exit - CLI 종료',
      history_cleared: '콘솔 내역이 지워졌습니다.',
      exec_usage: '사용법: /exec <명령어>',
      executing_command: '실행 중',
      executing: '실행 중...',
      command_completed: '명령어 실행이 완료되었습니다.',
      command_error: '명령어 실행 실패',
      loading: '로딩 중...',
      project_info: '프로젝트 정보',
      working_directory: '작업 디렉토리',
      project_name: '프로젝트 이름',
      project_version: '버전',
      project_description: '설명',
      project_type: '프로젝트 유형',
      dependencies: '의존성',
      dependencies_count: '의존성 %d개, 개발 의존성 %d개',
      no_package_json: 'package.json을 찾을 수 없습니다',
      typescript: '타입스크립트',
      typescript_in_use: '사용 중',
      typescript_target: '대상',
      typescript_module: '모듈 타입',
      typescript_strict: '엄격 모드',
      default_value: '기본값',
      git_branch: 'Git 브랜치',
      git_commit: 'Git 커밋',
      os_info: '운영체제',
      nodejs_version: 'Node.js',
      environment: '환경',
      info_error: '프로젝트 정보 가져오기 오류',
      cmd_info_desc: '현재 프로젝트에 대한 정보를 표시합니다.',
      cmd_exec_desc: '쉘 명령어를 실행합니다.',
      cmd_exec_arg: '실행할 명령어',
      cmd_exec_silent: '무음 모드, 출력 억제',
      // 스피너 관리자를 위한 새로운 메시지 추가
      node_processing: '노드 처리 중: %s',
      node_completed: '노드 완료: %s',
      node_failed: '노드 실패: %s',
      model_processing: '%s에서 AI 모델 실행 중',
      model_streaming_start: 'AI 응답 스트림 시작됨',
      model_streaming_end: 'AI 응답 스트림 완료됨',
      model_streaming_error: 'AI 응답 스트림 오류'
    }
  };

  private constructor() {}

  /**
   * I18n 싱글톤 인스턴스를 반환합니다.
   * @returns I18n 인스턴스
   */
  public static getInstance(): I18n {
    if (!I18n._instance) {
      I18n._instance = new I18n();
      I18n._instance._loadTranslations();
    }
    return I18n._instance;
  }

  /**
   * 사용할 언어를 설정합니다.
   * @param language 언어 코드 ('en' 또는 'ko')
   */
  public setLanguage(language: string): void {
    if (language && this._translations[language]) {
      this._language = language;
    }
  }

  /**
   * 현재 설정된 언어를 반환합니다.
   * @returns 현재 언어 코드
   */
  public getLanguage(): string {
    return this._language;
  }

  /**
   * 지정된 키에 해당하는 번역된 문자열을 반환합니다.
   * @param key 번역 키
   * @param args 포맷 인자
   * @returns 번역된 문자열
   */
  public t(key: string, ...args: any[]): string {
    const translation = this._translations[this._language]?.[key] || this._translations.en[key] || key;

    if (args.length > 0) {
      return this._format(translation, args);
    }

    return translation;
  }

  /**
   * 포맷 문자열에 인자를 적용합니다.
   * @param format 포맷 문자열
   * @param args 포맷 인자
   * @returns 포맷된 문자열
   */
  private _format(format: string, args: any[]): string {
    if (args.length === 1 && typeof args[0] === 'object') {
      const obj = args[0];
      return format.replace(/{([^}]+)}/g, (_, key) => obj[key] !== undefined ? obj[key] : `{${key}}`);
    }

    return format.replace(/%([sd])/g, (_, type) => {
      if (args.length === 0) return `%${type}`;
      const arg = args.shift();
      return String(arg);
    });
  }

  /**
   * 번역 파일에서 번역을 로드합니다.
   */
  private _loadTranslations(): void {
    const translationsPath = path.join(__dirname, '../../locales');

    if (fs.existsSync(translationsPath)) {
      try {
        // 디렉토리 내의 모든 파일 읽기
        const files = fs.readdirSync(translationsPath);

        // 각 JSON 파일 처리
        for (const file of files) {
          if (file.endsWith('.json')) {
            const langCode = file.replace('.json', '');
            const filePath = path.join(translationsPath, file);
            const content = fs.readFileSync(filePath, 'utf8');

            try {
              const translations = JSON.parse(content);
              this._translations[langCode] = {
                ...this._translations[langCode], // 기존 번역 유지
                ...translations // 파일에서 로드한 번역으로 덮어쓰기
              };
            } catch (error) {
              console.error(`Error parsing translations file ${filePath}:`, error);
            }
          }
        }
      } catch (error) {
        console.error('Error reading translations directory:', error);
      }
    }
  }
}