const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const path = require('path');
const escape = require('escape-string-regexp');
const exclusionList = require('metro-config/src/defaults/exclusionList');
const pak = require('../../package.json');
const pak_ui = require('../../react-native-purchases-ui/package.json');

const root = path.resolve(__dirname, '../..');
const root_ui = path.resolve(__dirname, '../../react-native-purchases-ui');

const modules = Object.keys({
  ...pak.peerDependencies,
  ...pak_ui.peerDependencies,
});

const config = {
  watchFolders: [root, root_ui],

  resolver: {
    blacklistRE: exclusionList([
      ...modules.map(
        m =>
          new RegExp(`^${escape(path.join(root, 'node_modules', m))}\\/.*$`),
      ),
      ...modules.map(
        m =>
          new RegExp(
            `^${escape(path.join(root_ui, 'node_modules', m))}\\/.*$`,
          ),
      ),
    ]),

    extraNodeModules: modules.reduce((acc, name) => {
      acc[name] = path.join(__dirname, 'node_modules', name);
      return acc;
    }, {}),
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
