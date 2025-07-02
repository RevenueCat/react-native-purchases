const path = require('path');

module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          extensions: ['.tsx', '.ts', '.js', '.json'],
          alias: {
            'react-native-purchases': path.resolve(__dirname, '../../dist'),
            'react-native-purchases-ui': path.resolve(__dirname, '../../react-native-purchases-ui/lib/module'),
          },
        },
      ],
    ],
  };
}; 