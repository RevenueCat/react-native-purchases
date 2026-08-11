const path = require('path');
const pak = require('../../package.json');

// react-native-purchases is not listed in package.json dependencies. It is
// resolved from the repo source via this Babel alias + Metro watchFolders
// (metro.config.js) + native autolinking (react-native.config.js). Same
// mechanism as examples/purchaseTesterTypescript.
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        extensions: ['.tsx', '.ts', '.js', '.json'],
        alias: {
          [pak.name]: path.join(__dirname, '../..', pak.source),
        },
      },
    ],
  ],
};
