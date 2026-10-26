const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const path = require('path');
const escape = require('escape-string-regexp');
const exclusionList = require('metro-config/private/defaults/exclusionList').default;
const pak = require('../../package.json');

const root = path.resolve(__dirname, '../..');

// react-native-purchases-admob is aliased to its source (babel.config.js) and
// lists react-native-google-mobile-ads as a dev dependency, so force every
// import of it onto this app's single copy (the one with the native module).
const modules = [
  ...Object.keys({...pak.peerDependencies}),
  'react-native-google-mobile-ads',
];

const config = {
  watchFolders: [root],

  resolver: {
    blockList: exclusionList([
      ...modules.map(
        m =>
          new RegExp(`^${escape(path.join(root, 'node_modules', m))}\\/.*$`),
      ),
      // The adapter workspace keeps its own dev dependencies (react-native,
      // react-native-google-mobile-ads, ...); never let Metro pick those up.
      new RegExp(
        `^${escape(path.join(root, 'react-native-purchases-admob', 'node_modules'))}\\/.*$`,
      ),
    ]),

    extraNodeModules: modules.reduce((acc, name) => {
      acc[name] = path.join(__dirname, 'node_modules', name);
      return acc;
    }, {}),
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
