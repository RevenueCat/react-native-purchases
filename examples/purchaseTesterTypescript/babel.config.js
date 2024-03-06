const path = require('path');
const pak = require('../../package.json');
const pak_ui = require('../../react-native-purchases-ui/package.json');

module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        extensions: ['.tsx', '.ts', '.js', '.json'],
        alias: {
          [pak.name]: path.join(__dirname, '../..', pak.source),
          [pak_ui.name]: path.join(__dirname, '../../react-native-purchases-ui', pak_ui.source),
        },
      },
    ],
  ],
};
