#!/usr/bin/env node

/**
 * This script checks if the package is installed globally,
 * and displays a warning message if it's installed locally.
 */

// Check if globally installed using npm_config_global environment variable
const isGlobal = process.env.npm_config_global === 'true';

// Display warning message if installed locally
if (!isGlobal) {
  console.log('\x1b[33m%s\x1b[0m', '⚠️  Warning: @uhd_kr/codebot should be installed globally!');
  console.log('\x1b[33m%s\x1b[0m', 'This package is designed as a CLI tool and should be installed with:');
  console.log('\x1b[36m%s\x1b[0m', 'npm uninstall @uhd_kr/codebot && npm install -g @uhd_kr/codebot');
  console.log('\x1b[36m%s\x1b[0m', 'or');
  console.log('\x1b[36m%s\x1b[0m', 'pnpm uninstall @uhd_kr/codebot && pnpm add -g @uhd_kr/codebot');
  console.log('\x1b[33m%s\x1b[0m', 'After global installation, you can use the "codebot" command from anywhere.');
  console.log();
}

// Ignore if installed as devDependencies (development environment)
if (process.env.npm_config_save_dev === 'true') {
  // Don't show warning if installed as a development dependency
  process.exit(0);
}

// Exit normally
process.exit(0);