# Codebot

[![npm version](https://badge.fury.io/js/@uhd_kr%2Fcodebot.svg?v=1.6.1)](https://www.npmjs.com/package/@uhd_kr%2Fcodebot)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Status: BETA](https://img.shields.io/badge/Status-BETA-orange.svg)](https://github.com/hwanyong/codebot)

> **⚠️ BETA VERSION**: This package is currently under active development. Features may change, and bugs may exist. Use in production environments at your own risk.

AI-based coding assistant CLI tool. Implements a multi-step reasoning agent using LangGraph to perform complex coding tasks.

## Features

- Request coding tasks in natural language
- File system operations (read, write, list, search files)
- Execute shell commands
- Perform complex tasks through multi-step reasoning
- Interactive CLI interface
- Tool testing and direct execution capabilities

## Installation

### Requirements

- Node.js 18 or higher
- npm or pnpm

### Installation Method

> ⚠️ **Important**: Codebot is a CLI tool and must be installed globally!

```bash
# Using npm
npm install -g @uhd_kr/codebot

# Using pnpm
pnpm add -g @uhd_kr/codebot
```

After installation, you can use the `codebot` command in your terminal.

### Install from Source

```bash
# Clone repository
git clone https://github.com/hwanyong/codebot.git
cd codebot

# Install dependencies
pnpm install

# Build
pnpm build

# Global installation
pnpm link --global
```

## Environment Setup

Create a `.env` file and set the following environment variables:

```
# OpenAI API Key
OPENAI_API_KEY=your_openai_api_key

# Ollama Base URL (optional)
OLLAMA_BASE_URL=http://localhost:11434

# Debug mode (optional)
DEBUG=true
```

## Usage

### Interactive Mode

```bash
# Run with default settings
codebot chat

# Specify model and provider
codebot chat --model gpt-4 --provider openai

# Adjust model temperature
codebot chat --temperature 0.5
```

### Single Task Execution

```bash
# Execute a single task
codebot run "Create React component: display user profile"

# Specify model and provider
codebot run "Search files and analyze content" --model gpt-4 --provider openai
```

### Interactive Mode Commands

In interactive mode, you can use the following slash commands:

- `/help` - Display help
- `/clear` - Clear conversation history
- `/exit` - End the conversation session

### Tool Testing
You can test various tools provided by Codebot:

```bash
# Run all tests
codebot test --all

# Run tests for a specific category
codebot test --category fileSystem

# Run test for a specific tool
codebot test --category fileSystem --tool ListFilesTool

# Log test results to a file
codebot test --all --log --output test-results.log

# Run interactive test menu
codebot test
```

### Direct Tool Execution
You can directly execute Codebot's internal tools and see their results:

```bash
# Start interactive tool execution mode
codebot tool

# Run a specific tool directly
codebot tool --category fileSystem --name ListFilesTool --params '{"path": "./src"}'
```

## Development

### Run in Development Mode

```bash
pnpm dev
```

### Build

```bash
pnpm build
```

### Test Tools

```bash
pnpm test:tools
```

### Run Tools Directly (Development Mode)

```bash
pnpm tool
```

## Project Structure

```
src/
├── agent/           # Agent-related code
│   ├── graph.ts     # LangGraph graph definition
│   ├── manager.ts   # Agent manager
│   ├── nodes.ts     # Graph node implementation
│   └── state.ts     # State management
├── cli/             # CLI interface
│   ├── cli.ts       # CLI entry point
│   └── index.ts     # CLI implementation
├── prompts/         # Prompt templates
│   └── index.ts     # Prompt definitions
├── test/            # Testing system
│   ├── cases/       # Tool-specific test cases
│   ├── runner.ts    # Test runner
│   └── reporter.ts  # Test result reporter
├── toolRunner/      # Direct tool execution system
│   ├── executor.ts  # Tool executor
│   ├── prompter.ts  # User input handler
│   └── renderer.ts  # Result visualization
├── tools/           # Tool implementations
│   ├── context/     # Context tools
│   ├── fileSystem/  # File system tools
│   ├── terminal/    # Terminal tools
│   ├── index.ts     # Tool exports
│   └── toolRegistry.ts # Tool registry
├── types/           # Type definitions
│   └── index.ts     # Common types
└── index.ts         # Main exports
```

## License

MIT

## Other Languages

- [한국어 (Korean)](./README.ko.md)