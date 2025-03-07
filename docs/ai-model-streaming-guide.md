# AI Model Streaming Guide
# AI 모델 스트리밍 가이드

## Introduction
## 소개

This document explains how to efficiently stream AI model outputs with proper logging and tracking in the Codebot application. The pattern described here follows the implementation found in the `translate-input.ts` file and can be used as a reference for creating new model streaming functions.

이 문서는 Codebot 애플리케이션에서 적절한 로깅과 추적을 통해 AI 모델 출력을 효율적으로 스트리밍하는 방법을 설명합니다. 여기서 설명하는 패턴은 `translate-input.ts` 파일에서 발견된 구현을 따르며 새로운 모델 스트리밍 함수를 만들기 위한 참조로 사용할 수 있습니다.

## Pattern Overview
## 패턴 개요

The standard pattern for AI model streaming consists of the following steps:

AI 모델 스트리밍의 표준 패턴은 다음 단계로 구성됩니다:

1. Initialize node entry with `Logger.nodeEntry`
2. Configure model call with appropriate parameters 
3. Signal streaming start with `Logger.nodeModelStart`
4. Stream model output using the model's streaming capability
5. Process each chunk and log with `Logger.nodeModelStreaming`
6. Signal streaming end with `Logger.nodeModelEnd`
7. Process final output and exit node with `Logger.nodeExit`

## Implementation Example
## 구현 예시

Below is a reference implementation based on the `translate-input.ts` file:

아래는 `translate-input.ts` 파일을 기반으로 한 참조 구현입니다:

```typescript
import { Logger } from '../../utils/logger.js';

async function processWithModelStreaming(input: string, model: any, config: any): Promise<string> {
  // 1. Log node entry
  Logger.nodeEntry('nodeName');
  
  try {
    // 2. Prepare prompt and configuration
    const promptValue = [/* your prompt structure */];
    
    // 3. Signal model streaming start
    Logger.nodeModelStart('nodeName', 'Starting model streaming');
    
    // 4. Stream model response
    const stream = await model.stream(promptValue, config);
    
    // 5. Process and log each chunk
    let accumulatedText = '';
    for await (const chunk of stream) {
      const content = chunk.content;
      if (content) {
        accumulatedText += content;
      }
      // Log each chunk for streaming visualization
      Logger.nodeModelStreaming('nodeName', content);
    }
    
    // 6. Signal model streaming end
    Logger.nodeModelEnd('nodeName');
    
    // 7. Process final output and exit node
    const processedOutput = postProcessOutput(accumulatedText);
    Logger.nodeAction('nodeName', 'Processing completed');
    Logger.nodeExit('nodeName');
    
    return processedOutput;
  } catch (error) {
    // Handle errors properly
    Logger.error('Error in model processing', error);
    Logger.nodeExit('nodeName', 'error');
    throw error;
  }
}

function postProcessOutput(text: string): string {
  // Apply any necessary post-processing to the accumulated text
  return text
    .replace(/* your replacements here */)
    .trim();
}
```

## Streaming Visualization Configuration
## 스트리밍 시각화 구성

The `Logger` class provides several ways to control streaming visibility:

`Logger` 클래스는 스트리밍 가시성을 제어하는 여러 방법을 제공합니다:

1. **Global Configuration**: 
   ```typescript
   Logger.configure({ 
     debug: true,     // Enable all debug logs
     aiStream: true,  // Enable all AI streaming logs
   });
   ```

2. **Node-specific Configuration**:
   ```typescript
   // Set a specific node to always show streaming
   Logger.setNodeStreamVisibility('nodeName', true);
   
   // Set multiple nodes at once
   Logger.setNodeStreamConfig({
     'nodeName1': true,
     'nodeName2': false
   });
   ```

3. **Always Visible Nodes**:
   ```typescript
   // Set which nodes should always show streaming regardless of debug mode
   Logger.setAlwaysVisibleNodes(['translateInput', 'executeStep']);
   ```

## Prompt Reference
## 프롬프트 참조

When using this pattern in a prompt for generating code that involves AI model streaming, you can refer to this structure:

AI 모델 스트리밍과 관련된 코드를 생성하기 위한 프롬프트에서 이 패턴을 사용할 때는 다음 구조를 참조할 수 있습니다:

```
Please implement a function that handles AI model streaming using the standard pattern:
1. Signal node entry with Logger.nodeEntry
2. Prepare prompt and configuration
3. Signal streaming start with Logger.nodeModelStart
4. Stream the model's output
5. Process each chunk and use Logger.nodeModelStreaming
6. Signal streaming end with Logger.nodeModelEnd
7. Process the final output
8. Handle errors appropriately

The function should follow the error handling best practices, including early returns and proper error context.
```

## Best Practices
## 모범 사례

1. **Error Handling**:
   - Use early returns where appropriate
   - Provide contextual error messages
   - Always log errors with `Logger.error`
   - Signal node exit with error status using `Logger.nodeExit('nodeName', 'error')`

2. **Performance**:
   - Accumulate text efficiently during streaming
   - Process output after streaming is complete
   - Avoid unnecessary string operations during streaming

3. **User Experience**:
   - Ensure streaming is visible when useful (configure the Logger accordingly)
   - Clean up output to remove any unwanted artifacts
   - Provide clear logging of node actions for debugging

## Conclusion
## 결론

This document provides a standardized approach for implementing AI model streaming with proper logging in the Codebot application. By following this pattern, you can ensure consistent behavior and effective debugging across different components that interact with AI models.

이 문서는 Codebot 애플리케이션에서 적절한 로깅과 함께 AI 모델 스트리밍을 구현하기 위한 표준화된 접근 방식을 제공합니다. 이 패턴을 따르면 AI 모델과 상호 작용하는 다양한 컴포넌트에서 일관된 동작과 효과적인 디버깅을 보장할 수 있습니다.

Generated by Copilot