const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

const path = require('path');

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    moduleName === 'expo-status-bar' &&
    platform === 'web'
  ) {
    return {
      type: 'sourceFile',
      filePath: path.join(__dirname, 'expo-status-bar-web.js'),
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
