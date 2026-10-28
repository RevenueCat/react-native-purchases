const path = require('path');
const pak = require('../../package.json');
const pak_ui = require('../../react-native-purchases-ui/package.json');

// SwiftPM autolinking symlinks each library into ios/build. Linking the
// repository root would put a link to the repository inside itself, so the
// SwiftPM job autolinks packed copies of the SDKs extracted outside of it.
const spmSdksDir = process.env.MAESTRO_SPM_SDKS_DIR;

module.exports = {
  dependencies: {
    [pak.name]: {
      root: spmSdksDir
        ? path.join(spmSdksDir, pak.name)
        : path.join(__dirname, '../..'),
    },
    [pak_ui.name]: {
      root: spmSdksDir
        ? path.join(spmSdksDir, pak_ui.name)
        : path.join(__dirname, '../../react-native-purchases-ui'),
    },
    // SwiftPM cannot build react-native-pager-view: it mixes Swift and
    // Objective-C sources in one target.
    ...(spmSdksDir && {
      'react-native-pager-view': {platforms: {ios: null}},
    }),
  },
};
