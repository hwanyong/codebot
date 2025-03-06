import { z } from 'zod';
import { Tool } from '../../types/index.js';
import { I18n } from '../../config/i18n.js';
import { ConfigManager } from '../../config/manager.js';

/**
 * Translate text tool input schema
 * 텍스트 번역 도구 입력 스키마
 */
export const translateTextSchema = z.object({
  text: z.string().min(1, { message: 'Text is required. (텍스트는 필수입니다.)' }),
  targetLanguage: z.enum(['en', 'ko']).default('en'),
  sourceLanguage: z.enum(['en', 'ko', 'auto']).default('auto'),
  provider: z.string().optional(),
  model: z.string().optional()
});

/**
 * Translate text tool
 * 텍스트 번역 도구
 * Translates text between supported languages using AI providers
 * AI 제공자를 사용하여 지원되는 언어 간에 텍스트를 번역합니다
 */
export class TranslateTextTool implements Tool {
  name = 'translate_text';
  description = 'Translates text between supported languages (English and Korean) using AI providers. (AI 제공자를 사용하여 지원되는 언어(영어 및 한국어) 간에 텍스트를 번역합니다.)';
  schema = translateTextSchema;

  // Fallback translation mapping for basic words when AI provider is not available
  // AI 제공자를 사용할 수 없을 때 기본 단어에 대한 대체 번역 매핑
  private fallbackTranslationMap: {
    [key: string]: { en: string, ko: string }
  } = {
    'hello': { en: 'hello', ko: '안녕하세요' },
    'world': { en: 'world', ko: '세계' },
    'file': { en: 'file', ko: '파일' },
    'folder': { en: 'folder', ko: '폴더' },
    'directory': { en: 'directory', ko: '디렉토리' },
    'create': { en: 'create', ko: '생성' },
    'read': { en: 'read', ko: '읽기' },
    'write': { en: 'write', ko: '쓰기' },
    'update': { en: 'update', ko: '업데이트' },
    'delete': { en: 'delete', ko: '삭제' },
    'search': { en: 'search', ko: '검색' },
    'error': { en: 'error', ko: '오류' },
    'success': { en: 'success', ko: '성공' },
    'command': { en: 'command', ko: '명령어' },
    'language': { en: 'language', ko: '언어' },
    'code': { en: 'code', ko: '코드' },
    'analysis': { en: 'analysis', ko: '분석' },
    'translation': { en: 'translation', ko: '번역' }
  };

  /**
   * Get language name for logging
   * 로깅을 위한 언어 이름 가져오기
   * @param langCode Language code (언어 코드)
   * @returns Language name (언어 이름)
   */
  private getLanguageName(langCode: string): string {
    const i18n = I18n.getInstance();
    return langCode === 'ko' ? i18n.t('korean') : i18n.t('english');
  }

  /**
   * Creates a translation prompt for AI provider
   * AI 제공자를 위한 번역 프롬프트 생성
   * @param text Text to translate (번역할 텍스트)
   * @param sourceLang Source language (원본 언어)
   * @param targetLang Target language (대상 언어)
   * @returns Prompt for AI provider (AI 제공자를 위한 프롬프트)
   */
  private createTranslationPrompt(text: string, sourceLang: string, targetLang: string): string {
    const sourceLangName = this.getLanguageName(sourceLang);
    const targetLangName = this.getLanguageName(targetLang);

    return `You are a professional translator specializing in ${sourceLangName} to ${targetLangName} translation.
Translate the following text from ${sourceLangName} to ${targetLangName}.
Provide only the translation without explanations or comments.

Text to translate: "${text}"

Translation:`;
  }

  /**
   * Detects language of the text
   * 텍스트의 언어를 감지합니다
   * @param text Text to detect language (언어를 감지할 텍스트)
   * @returns Detected language code (감지된 언어 코드)
   */
  private detectLanguage(text: string): 'ko' | 'en' {
    // Simple detection based on Korean characters
    // 한글 문자 기반의 간단한 감지
    const isKorean = /[ㄱ-ㅎㅏ-ㅣ가-힣]/g.test(text);
    return isKorean ? 'ko' : 'en';
  }

  /**
   * Translate using fallback mechanism when AI provider is not available
   * AI 제공자를 사용할 수 없을 때 대체 메커니즘을 사용하여 번역
   * @param text Text to translate (번역할 텍스트)
   * @param sourceLanguage Source language (원본 언어)
   * @param targetLanguage Target language (대상 언어)
   * @returns Translated text (번역된 텍스트)
   */
  private fallbackTranslate(text: string, sourceLanguage: 'en' | 'ko', targetLanguage: 'en' | 'ko'): string {
    // Simple word replacement translation
    // 간단한 단어 교체 번역
    const words = text.split(' ');
    const translatedWords = words.map(word => {
      // Remove punctuation for lookup
      const cleanWord = word.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");

      if (this.fallbackTranslationMap[cleanWord]) {
        const translation = this.fallbackTranslationMap[cleanWord][targetLanguage];
        // Replace the clean word with translation but keep the punctuation
        return word.replace(cleanWord, translation);
      }
      return word;
    });

    return translatedWords.join(' ');
  }

  /**
   * Translates text between supported languages
   * 지원되는 언어 간에 텍스트를 번역합니다
   * @param input Tool input data (도구 입력 데이터)
   * @returns Translation result (번역 결과)
   */
  async execute(input: z.infer<typeof translateTextSchema>): Promise<any> {
    try {
      const i18n = I18n.getInstance();
      const { text, targetLanguage, sourceLanguage } = input;

      // Determine the actual source language
      // 실제 원본 언어 결정
      const actualSource = sourceLanguage === 'auto'
        ? this.detectLanguage(text)
        : sourceLanguage;

      // Check if text is already in target language
      // 텍스트가 이미 대상 언어인지 확인
      if (actualSource === targetLanguage) {
        return {
          success: true,
          sourceLanguage: actualSource,
          targetLanguage,
          originalText: text,
          translatedText: text,
          message: i18n.t('already_target_language')
        };
      }

      // Get configuration manager and try to get the default provider
      // 설정 관리자를 가져오고 기본 제공자를 가져오기 시도
      const configManager = new ConfigManager();
      let translatedText: string;
      let providerUsed: string | null = null;
      let modelUsed: string | null = null;

      // Try to use the specified provider or default provider
      // 지정된 제공자 또는 기본 제공자를 사용하려고 시도
      try {
        // Get provider from input or use the default
        // 입력에서 제공자를 가져오거나 기본값을 사용
        let providerName = input.provider;

        // If provider is not specified, try to get the default provider
        // 제공자가 지정되지 않은 경우 기본 제공자를 가져오려고 시도
        if (!providerName) {
          const defaultProvider = configManager.getDefaultProvider();
          providerName = defaultProvider?.name;
        }

        // Only proceed if we have a valid provider name
        // 유효한 제공자 이름이 있는 경우에만 진행
        if (providerName) {
          const provider = configManager.getProviderByName(providerName);

          if (provider && provider.apiKey) {
            // Use a model appropriate for translation
            // 번역에 적합한 모델 사용
            let model = input.model;
            if (!model && provider.models && provider.models.length > 0) {
              // Use the first model as default if none specified
              // 지정된 모델이 없으면 첫 번째 모델을 기본값으로 사용
              model = provider.models[0];
            }

            // Create API client based on the provider type
            // 제공자 유형에 따라 API 클라이언트 생성
            let apiClient;
            let response;

            // Create a translation prompt
            // 번역 프롬프트 생성
            const translationPrompt = this.createTranslationPrompt(text, actualSource, targetLanguage);

            // Make API call appropriate for the chosen provider
            // 선택한 제공자에 적합한 API 호출 수행
            switch (provider.type) {
              case 'openai':
                // OpenAI API call
                const { OpenAI } = await import('openai');
                apiClient = new OpenAI({ apiKey: provider.apiKey, baseURL: provider.baseUrl });
                response = await apiClient.chat.completions.create({
                  model: model || 'gpt-3.5-turbo',
                  messages: [{ role: 'user', content: translationPrompt }],
                  temperature: 0.3,
                });
                translatedText = response.choices[0]?.message?.content?.trim() || text;
                break;

              case 'anthropic':
                // Anthropic API call
                const { Anthropic } = await import('@anthropic-ai/sdk');
                apiClient = new Anthropic({ apiKey: provider.apiKey, baseURL: provider.baseUrl });
                response = await apiClient.messages.create({
                  model: model || 'claude-3-sonnet-20240229',
                  messages: [{ role: 'user', content: translationPrompt }],
                  temperature: 0.3,
                  max_tokens: 1000
                });

                // Correctly access content based on Anthropic's API response structure
                // Anthropic API 응답 구조에 따라 올바르게 콘텐츠에 접근
                if (response.content && response.content[0]?.type === 'text') {
                  translatedText = response.content[0].text?.trim() || text;
                } else {
                  translatedText = text; // Fallback if no valid content
                }
                break;

              case 'ollama':
                // Ollama API call
                const baseUrl = provider.baseUrl || 'http://localhost:11434';
                response = await fetch(`${baseUrl}/api/generate`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    model: model || 'llama3',
                    prompt: translationPrompt,
                    temperature: 0.3,
                    stop: ['\n', '.', '?', '!'],
                  }),
                });
                const data = await response.json();
                translatedText = data.response?.trim() || text;
                break;

              default:
                // Custom provider or unknown - use fetch for generic API call
                const params: any = {
                  messages: [{ role: 'user', content: translationPrompt }],
                  model: model,
                };

                response = await fetch(provider.baseUrl || '', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${provider.apiKey}`
                  },
                  body: JSON.stringify(params),
                });

                const customData = await response.json();
                translatedText = customData?.choices?.[0]?.message?.content?.trim() || text;
                break;
            }

            // Record which provider and model were used
            // 어떤 제공자와 모델이 사용되었는지 기록
            providerUsed = provider.name;
            modelUsed = model || 'default';
          } else {
            // Fallback to basic translation if provider doesn't have API key
            // API 키가 없는 경우 기본 번역으로 대체
            translatedText = this.fallbackTranslate(text, actualSource, targetLanguage);
          }
        } else {
          // No provider available, fallback to basic translation
          // 사용 가능한 제공자가 없으면 기본 번역으로 대체
          translatedText = this.fallbackTranslate(text, actualSource, targetLanguage);
        }
      } catch (error) {
        console.error('Error using AI provider for translation:', error);
        // Fallback to basic translation on error
        // 오류 발생 시 기본 번역으로 대체
        translatedText = this.fallbackTranslate(text, actualSource, targetLanguage);
      }

      return {
        success: true,
        sourceLanguage: actualSource,
        targetLanguage,
        originalText: text,
        translatedText,
        message: i18n.t('translation_completed'),
        provider: providerUsed,
        model: modelUsed
      };
    } catch (error: any) {
      const i18n = I18n.getInstance();
      return {
        success: false,
        error: error.message,
        message: i18n.t('translation_failed', error.message)
      };
    }
  }
}