# Codebot

[![npm version](https://badge.fury.io/js/@uhd_kr%2Fcodebot.svg?v=1.4.5)](https://www.npmjs.com/package/@uhd_kr%2Fcodebot)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

AI-based coding assistant CLI tool. Implements a multi-step reasoning agent using LangGraph to perform complex coding tasks.

## Features

- Request coding tasks in natural language
- File system operations (read, write, list, search files)
- Execute shell commands
- Perform complex tasks through multi-step reasoning
- Interactive CLI interface

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

## Development

### Run in Development Mode

```bash
pnpm dev
```

### Build

```bash
pnpm build
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