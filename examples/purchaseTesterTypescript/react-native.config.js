const path = require('path');
const pak = require('../../package.json');
const pak_ui = require('../../react-native-purchases-ui/package.json');

module.exports = {
  dependencies: {
    [pak.name]: {
      root: path.join(__dirname, '../..'),
    },
    [pak_ui.name]: {
      root: path.join(__dirname, '../../react-native-purchases-ui'),
    },
  },
  assets: ['./assets/fonts'],
};
