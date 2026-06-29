#!/usr/bin/env node

const { spawn } = require('child_process');
const chalk = require('chalk');
const { needsProxy } = require('../proxy_server/check-config');

console.clear();
console.log(chalk.cyan('🚀 启动 Next.js 开发环境...'));

// 检查是否需要代理服务器
const shouldStartProxy = needsProxy();

if (shouldStartProxy) {
  console.log(chalk.green('✓ 检测到代理配置，同时启动代理服务器和 Next.js'));

  // 使用 concurrently 同时启动代理服务器和 Next.js
  const concurrently = spawn('concurrently', [
    '"pnpm dev:proxy"',
    '"pnpm dev:next"',
    '--names', '"PROXY,NEXT"',
    '--prefix', 'name',
    '--prefix-colors', 'cyan,green'
  ], {
    stdio: 'inherit',
    shell: true
  });

  concurrently.on('close', (code) => {
    process.exit(code);
  });

} else {
  console.log(chalk.yellow('ℹ️  代理配置为空，仅启动 Next.js 开发服务器'));
  console.log(chalk.gray('   如需启动代理，请在 proxy_server/config.js 中配置 PROXY_ROUTES'));
  console.log('');

  // 仅启动 Next.js 开发服务器
  const nextDev = spawn('pnpm', ['dev:next'], {
    stdio: 'inherit',
    shell: true
  });

  nextDev.on('close', (code) => {
    process.exit(code);
  });
}

// 处理 Ctrl+C
process.on('SIGINT', () => {
  console.log(chalk.yellow('\n👋 正在关闭开发服务器...'));
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log(chalk.yellow('\n👋 正在关闭开发服务器...'));
  process.exit(0);
});