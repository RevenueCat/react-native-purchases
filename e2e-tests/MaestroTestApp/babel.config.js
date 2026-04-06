const path = require('path');
const pak = require('../../package.json');
const pak_ui = require('../../react-native-purchases-ui/package.json');

// react-native-purchases and react-native-purchases-ui are not listed in
// package.json dependencies. They are resolved from the repo source via this
// Babel alias + Metro watchFolders (metro.config.js) + native autolinking
// (react-native.config.js). Same mechanism as examples/purchaseTesterTypescript.
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        extensions: ['.tsx', '.ts', '.js', '.json'],
        alias: {
          [pak.name]: path.join(__dirname, '../..', pak.source),
          [pak_ui.name]: path.join(
            __dirname,
            '../../react-native-purchases-ui',
            pak_ui.source,
          ),
        },
      },
    ],
  ],
};
