// 检查代理配置的独立脚本
const { PROXY_ROUTES } = require('./config');

// 检查是否需要启动代理服务器
const needsProxy = () => {
  return PROXY_ROUTES.length > 0;
};

// 如果从命令行直接调用此脚本
if (require.main === module) {
  if (needsProxy()) {
    console.log('PROXY_NEEDED');
    process.exit(0);
  } else {
    console.log('PROXY_NOT_NEEDED');
    process.exit(1);
  }
}

module.exports = { needsProxy };