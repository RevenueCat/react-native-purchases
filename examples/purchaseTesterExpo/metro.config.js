const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add watchFolders to watch the workspace root
config.watchFolders = [
  path.resolve(__dirname, '../..'),
  path.resolve(__dirname, '../../react-native-purchases-ui'),
];

// Add resolver configuration
config.resolver = {
  ...config.resolver,
  alias: {
    'react-native-purchases': path.resolve(__dirname, '../../dist'),
    'react-native-purchases-ui': path.resolve(__dirname, '../../react-native-purchases-ui/lib/module'),
  },
  // Make sure metro can find modules in the workspace root
  nodeModulesPaths: [
    path.resolve(__dirname, 'node_modules'),
    path.resolve(__dirname, '../../node_modules'),
  ],
};

module.exports = config; 