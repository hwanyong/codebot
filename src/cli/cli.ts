#!/usr/bin/env node

import { createCLI } from './index.js';

// CLI 프로그램 생성 및 실행
const program = createCLI();
program.parse(process.argv);