const path = require('path');

// CI installs the freshly packed SDKs without saving them in package.json.
module.exports = {
  project: {
    ios: {
      automaticPodsInstallation: false,
    },
  },
  dependencies: {
    'react-native-purchases': {
      root: path.dirname(require.resolve('react-native-purchases/package.json')),
    },
    'react-native-purchases-ui': {
      root: path.dirname(require.resolve('react-native-purchases-ui/package.json')),
    },
  },
};
