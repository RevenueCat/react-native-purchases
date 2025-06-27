const path = require('path');
const blacklist = require('metro-config/src/defaults/exclusionList');

module.exports = {
  projectRoot: __dirname,
  watchFolders: [
    // make sure Metro watches your library folder
    path.resolve(__dirname, '../..'),
    path.resolve(__dirname, '../../react-native-purchases-ui'),
  ],
  resolver: {
    // avoid duplicate RN copies
    blacklistRE: blacklist([
      /node_modules\/.*\/node_modules\/react-native\/.*/,
    ]),
    // resolve all modules through the app’s node_modules
    extraNodeModules: new Proxy({}, {
      get: (_, name) {
        return path.join(__dirname, 'node_modules', name);
      }
    }),
    sourceExts: ['js','jsx','ts','tsx','json']
  },
  transformer: {
    // if your library is TS/ESM, keep inlineRequires etc.
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};