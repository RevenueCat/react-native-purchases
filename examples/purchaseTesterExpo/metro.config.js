const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

// Path to this Expo project
const projectRoot = __dirname;
// Path to the root of the monorepo (two levels up)
const workspaceRoot = path.resolve(projectRoot, '../..');

// Load default Expo Metro config
const config = getDefaultConfig(projectRoot);

// Watch the monorepo root for changes
config.watchFolders = [
  workspaceRoot,
];

// Resolve modules from both project and workspace node_modules
const projectNodeModules = path.resolve(projectRoot, 'node_modules');
const workspaceNodeModules = path.resolve(workspaceRoot, 'node_modules');

config.resolver = {
  ...config.resolver,
  // Map react-native-purchases to the source in the monorepo
  extraNodeModules: {
    ...(config.resolver.extraNodeModules || {}),
    'react-native': require.resolve('react-native'),
    'react-native-purchases': path.resolve(workspaceRoot, 'react-native-purchases'),
  },
  // Ensure Metro knows where to look for node_modules
  nodeModulesPaths: [
    projectNodeModules,
    workspaceNodeModules,
  ],
  sourceExts: [
    ...(config.resolver.sourceExts || []),
    'cjs','ts','tsx','mjs'
  ]
};

module.exports = config;
