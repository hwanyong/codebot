import fs from 'fs';
import path from 'path';
import { getConfigDir, getConfigFilePath, getEnvFilePath } from './paths.js';
import readline from 'readline';
import chalk from 'chalk';
import dotenv from 'dotenv';
import { Language } from './i18n.js';

/**
 * Provider 타입
 */
export type Provider = {
  name: string;
  type: 'openai' | 'ollama' | 'anthropic' | 'custom';
  apiKey?: string;
  baseUrl?: string;
  models?: string[];
  isDefault?: boolean;
};

/**
 * 설정 인터페이스
 */
export interface Config {
  providers: Provider[];
  defaultProvider?: string;
  language: Language;
  lastUsed?: {
    provider: string;
    model: string;
  };
}

/**
 * 기본 설정
 */
const DEFAULT_CONFIG: Config = {
  providers: [],
  defaultProvider: undefined,
  language: 'ko' // 기본 언어는 한국어
};

/**
 * 설정 관리자 클래스
 */
export class ConfigManager {
  private config: Config;
  private configDir: string;
  private configFilePath: string;
  private envFilePath: string;

  /**
   * 설정 관리자 생성자
   */
  constructor() {
    this.configDir = getConfigDir();
    this.configFilePath = getConfigFilePath();
    this.envFilePath = getEnvFilePath();
    this.config = DEFAULT_CONFIG;
    this.ensureConfigDir();
  }

  /**
   * 설정 디렉토리가 존재하는지 확인하고, 없으면 생성합니다.
   */
  private ensureConfigDir(): void {
    if (!fs.existsSync(this.configDir)) {
      fs.mkdirSync(this.configDir, { recursive: true });
    }
  }

  /**
   * 설정 파일이 존재하는지 확인합니다.
   */
  public configExists(): boolean {
    return fs.existsSync(this.configFilePath);
  }

  /**
   * 설정 파일을 로드합니다.
   */
  public loadConfig(): Config {
    try {
      if (this.configExists()) {
        const configData = fs.readFileSync(this.configFilePath, 'utf-8');
        this.config = JSON.parse(configData);

        // 이전 버전 호환성을 위해 language 필드가 없으면 추가
        if (!this.config.language) {
          this.config.language = 'ko';
        }
      }
      return this.config;
    } catch (error) {
      console.error('설정 파일을 로드하는 중 오류가 발생했습니다:', error);
      return DEFAULT_CONFIG;
    }
  }

  /**
   * 설정 파일을 저장합니다.
   */
  public saveConfig(): void {
    try {
      fs.writeFileSync(this.configFilePath, JSON.stringify(this.config, null, 2));
    } catch (error) {
      console.error('설정 파일을 저장하는 중 오류가 발생했습니다:', error);
    }
  }

  /**
   * 환경 변수 파일을 생성합니다.
   */
  public saveEnvFile(): void {
    try {
      let envContent = '';

      // 모든 provider의 API 키를 환경 변수로 저장
      for (const provider of this.config.providers) {
        if (provider.apiKey) {
          switch (provider.type) {
            case 'openai':
              envContent += `OPENAI_API_KEY=${provider.apiKey}\n`;
              break;
            case 'anthropic':
              envContent += `ANTHROPIC_API_KEY=${provider.apiKey}\n`;
              break;
            case 'ollama':
              if (provider.baseUrl) {
                envContent += `OLLAMA_BASE_URL=${provider.baseUrl}\n`;
              }
              break;
            case 'custom':
              if (provider.name && provider.apiKey) {
                const envName = `${provider.name.toUpperCase()}_API_KEY`;
                envContent += `${envName}=${provider.apiKey}\n`;
              }
              if (provider.baseUrl) {
                const envName = `${provider.name.toUpperCase()}_BASE_URL`;
                envContent += `${envName}=${provider.baseUrl}\n`;
              }
              break;
          }
        }
      }

      fs.writeFileSync(this.envFilePath, envContent);
    } catch (error) {
      console.error('환경 변수 파일을 저장하는 중 오류가 발생했습니다:', error);
    }
  }

  /**
   * 환경 변수를 로드합니다.
   */
  public loadEnv(): void {
    if (fs.existsSync(this.envFilePath)) {
      dotenv.config({ path: this.envFilePath });
    }
  }

  /**
   * Provider를 추가합니다.
   */
  public addProvider(provider: Provider): void {
    // 이미 존재하는 provider인지 확인
    const existingIndex = this.config.providers.findIndex(p => p.name === provider.name);

    if (existingIndex !== -1) {
      // 기존 provider 업데이트
      this.config.providers[existingIndex] = provider;
    } else {
      // 새 provider 추가
      this.config.providers.push(provider);
    }

    // 첫 번째 provider이거나 isDefault가 true인 경우 기본값으로 설정
    if (this.config.providers.length === 1 || provider.isDefault) {
      this.config.defaultProvider = provider.name;

      // 다른 provider의 isDefault를 false로 설정
      if (provider.isDefault) {
        this.config.providers.forEach(p => {
          if (p.name !== provider.name) {
            p.isDefault = false;
          }
        });
      }
    }

    this.saveConfig();
    this.saveEnvFile();
  }

  /**
   * Provider를 제거합니다.
   */
  public removeProvider(providerName: string): void {
    const index = this.config.providers.findIndex(p => p.name === providerName);

    if (index !== -1) {
      const removedProvider = this.config.providers.splice(index, 1)[0];

      // 제거된 provider가 기본값이었다면 다른 provider를 기본값으로 설정
      if (this.config.defaultProvider === removedProvider.name && this.config.providers.length > 0) {
        this.config.defaultProvider = this.config.providers[0].name;
        this.config.providers[0].isDefault = true;
      } else if (this.config.providers.length === 0) {
        this.config.defaultProvider = undefined;
      }

      this.saveConfig();
      this.saveEnvFile();
    }
  }

  /**
   * 기본 Provider를 설정합니다.
   */
  public setDefaultProvider(providerName: string): void {
    const provider = this.config.providers.find(p => p.name === providerName);

    if (provider) {
      this.config.defaultProvider = providerName;

      // 모든 provider의 isDefault를 false로 설정
      this.config.providers.forEach(p => {
        p.isDefault = p.name === providerName;
      });

      this.saveConfig();
    }
  }

  /**
   * 기본 Provider를 가져옵니다.
   */
  public getDefaultProvider(): Provider | undefined {
    if (!this.config.defaultProvider) {
      return undefined;
    }

    return this.config.providers.find(p => p.name === this.config.defaultProvider);
  }

  /**
   * 마지막으로 사용한 Provider와 모델을 설정합니다.
   */
  public setLastUsed(provider: string, model: string): void {
    this.config.lastUsed = { provider, model };
    this.saveConfig();
  }

  /**
   * 마지막으로 사용한 Provider와 모델을 가져옵니다.
   */
  public getLastUsed(): { provider: string; model: string } | undefined {
    return this.config.lastUsed;
  }

  /**
   * 모든 Provider를 가져옵니다.
   */
  public getAllProviders(): Provider[] {
    return this.config.providers;
  }

  /**
   * Provider를 이름으로 가져옵니다.
   */
  public getProviderByName(name: string): Provider | undefined {
    return this.config.providers.find(p => p.name === name);
  }

  /**
   * 언어를 설정합니다.
   */
  public setLanguage(language: Language): void {
    this.config.language = language;
    this.saveConfig();
  }

  /**
   * 현재 언어를 가져옵니다.
   */
  public getLanguage(): Language {
    return this.config.language || 'ko';
  }
}