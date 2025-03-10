/**
 * 번역 도구 테스트 케이스
 * Translation Tool Test Cases
 *
 * 번역 도구의 기능을 테스트합니다.
 * Tests functionality of translation tools.
 *
 * Generated by Copilot
 */

import { TestSuite } from '../../runner.js';
import assert from 'assert';

// 테스트에 필요한 도구 가져오기
import { TranslateTool } from '../../../tools/translate/translate.js';

// 도구 인스턴스 생성
const translateTool = new TranslateTool();

/**
 * 번역 도구 테스트 스위트
 */
export const translateTests: TestSuite = {
  /**
   * 한국어에서 영어로 번역 테스트
   */
  async 'TranslateTool - 한국어에서 영어로 번역'() {
    const koreanText = '안녕하세요';

    // 한국어에서 영어로 번역
    const result = await translateTool.execute({
      text: koreanText,
      targetLanguage: 'en'
    });

    // 검증
    assert.strictEqual(result.originalText, koreanText, '원본 텍스트가 보존되어야 합니다.');
    assert.strictEqual(result.sourceLanguage, 'ko', '원본 언어가 한국어로 감지되어야 합니다.');
    assert.strictEqual(result.targetLanguage, 'en', '대상 언어가 영어여야 합니다.');
    assert.ok(result.translatedText.length > 0, '번역 결과가 비어 있지 않아야 합니다.');
    assert.notStrictEqual(result.translatedText, koreanText, '번역 결과가 원본과 달라야 합니다.');

    // 영어 문자만 포함하는지 확인 (간단한 검증)
    const containsKorean = /[가-힣]/.test(result.translatedText);
    assert.strictEqual(containsKorean, false, '번역 결과에 한글이 포함되지 않아야 합니다.');
  },

  /**
   * 영어에서 한국어로 번역 테스트
   */
  async 'TranslateTool - 영어에서 한국어로 번역'() {
    const englishText = 'Hello';

    // 영어에서 한국어로 번역
    const result = await translateTool.execute({
      text: englishText,
      targetLanguage: 'ko'
    });

    // 검증
    assert.strictEqual(result.originalText, englishText, '원본 텍스트가 보존되어야 합니다.');
    assert.strictEqual(result.sourceLanguage, 'en', '원본 언어가 영어로 감지되어야 합니다.');
    assert.strictEqual(result.targetLanguage, 'ko', '대상 언어가 한국어여야 합니다.');
    assert.ok(result.translatedText.length > 0, '번역 결과가 비어 있지 않아야 합니다.');
    assert.notStrictEqual(result.translatedText, englishText, '번역 결과가 원본과 달라야 합니다.');

    // 한글 문자가 포함되어 있는지 확인 (간단한 검증)
    const containsKorean = /[가-힣]/.test(result.translatedText);
    assert.strictEqual(containsKorean, true, '번역 결과에 한글이 포함되어야 합니다.');
  },

  /**
   * 이미 대상 언어인 경우 테스트
   */
  async 'TranslateTool - 이미 대상 언어인 경우'() {
    const koreanText = '안녕하세요';

    // 한국어 텍스트를 한국어로 "번역"
    const result = await translateTool.execute({
      text: koreanText,
      targetLanguage: 'ko'
    });

    // 검증
    assert.strictEqual(result.originalText, koreanText, '원본 텍스트가 보존되어야 합니다.');
    assert.strictEqual(result.sourceLanguage, 'ko', '원본 언어가 한국어로 감지되어야 합니다.');
    assert.strictEqual(result.targetLanguage, 'ko', '대상 언어가 한국어여야 합니다.');
    assert.strictEqual(result.translatedText, koreanText, '이미 대상 언어인 경우 원본 텍스트가 반환되어야 합니다.');
  },

  /**
   * 혼합 언어 텍스트 처리 테스트
   */
  async 'TranslateTool - 혼합 언어 텍스트 처리'() {
    const mixedText = '안녕하세요, Hello!';

    // 혼합 텍스트를 영어로 번역
    const resultToEn = await translateTool.execute({
      text: mixedText,
      targetLanguage: 'en'
    });

    // 검증
    assert.strictEqual(resultToEn.sourceLanguage, 'ko', '한글이 포함된 경우 한국어로 감지되어야 합니다.');
    assert.ok(resultToEn.translatedText.length > 0, '번역 결과가 비어 있지 않아야 합니다.');

    // 혼합 텍스트를 한국어로 번역
    const resultToKo = await translateTool.execute({
      text: 'Hello, 안녕하세요!',
      targetLanguage: 'ko'
    });

    // 검증
    assert.strictEqual(resultToKo.sourceLanguage, 'ko', '한글이 포함된 경우 한국어로 감지되어야 합니다.');
    assert.ok(resultToKo.translatedText.length > 0, '번역 결과가 비어 있지 않아야 합니다.');
  },

  /**
   * 오류 처리 테스트
   */
  async 'TranslateTool - 오류 처리'() {
    try {
      // @ts-ignore - 의도적으로 잘못된 매개변수 전달
      await translateTool.execute({ text: 'Hello', targetLanguage: 'fr' });
      assert.fail('지원하지 않는 언어에 대해 오류가 발생해야 합니다.');
    } catch (error) {
      // 오류가 발생하면 정상
      assert.ok(error instanceof Error, '오류가 Error 인스턴스여야 합니다.');
    }

    try {
      // @ts-ignore - 의도적으로 잘못된 매개변수 전달
      await translateTool.execute({ targetLanguage: 'en' });
      assert.fail('필수 매개변수가 누락된 경우 오류가 발생해야 합니다.');
    } catch (error) {
      // 오류가 발생하면 정상
      assert.ok(error instanceof Error, '오류가 Error 인스턴스여야 합니다.');
    }
  }
};