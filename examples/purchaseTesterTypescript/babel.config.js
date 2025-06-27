const path = require('path');

module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        extensions: ['.tsx', '.ts', '.js', '.json'],
        alias: {
          'react-native$': 'react-native-web',
          'react-native-purchases': path.resolve(__dirname, '../../dist'),
          'react-native-purchases-ui': path.resolve(__dirname, '../../react-native-purchases-ui/lib/module'),
        },
        modules: [
          'node_modules',
          path.resolve(__dirname, '../../node_modules'),
          path.resolve(__dirname, '../../'),
        ],
      },
    ],
  ],
};
