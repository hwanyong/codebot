#!/usr/bin/env node

// 경고 메시지 숨기기
// @ts-ignore: Node.js 런타임 속성이지만 TypeScript 타입에 정의되지 않음
process.noDeprecation = true;

import { createCLI } from './index.js';
import path from 'path';
import fs from 'fs';

// Function to check if globally installed
function isGloballyInstalled() {
  try {
    // Path of the current executable
    const execPath = process.argv[1];

    // Check if the executable is in the node_modules/.bin directory
    // Local installations typically have executables in node_modules/.bin
    return !execPath.includes('node_modules/.bin');
  } catch (error) {
    // Return true by default if unable to determine
    return true;
  }
}

// Display warning if installed locally
if (!isGloballyInstalled()) {
  console.log('\x1b[33m%s\x1b[0m', '⚠️  Warning: @uhd_kr/codebot should be installed globally!');
  console.log('\x1b[33m%s\x1b[0m', 'This package is designed as a CLI tool and should be installed with:');
  console.log('\x1b[36m%s\x1b[0m', 'npm install -g @uhd_kr/codebot');
  console.log('\x1b[33m%s\x1b[0m', 'After global installation, you can use the "codebot" command from anywhere.');
  console.log();
}

// Create and run the CLI program
const program = createCLI();
program.parse(process.argv);