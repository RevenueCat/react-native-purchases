/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

 const packagePath = require('path').resolve('../../');
 
 module.exports = {
   resolver: {
     nodeModulesPaths: [packagePath], // replace 'react-native-purchases` in the package.json
     resolverMainFields: ['source', 'react-native', 'main'], // will first look the source then main
     // source is needed for 'react-native-purchases`
     // main is needed for node_module deps
     // BUT we also need to make sure `npm install` is run in the `react-native-purchases` directory
   },

   watchFolders: [
     packagePath // metro will update when something is changed
   ],
 
   transformer: {
     getTransformOptions: async () => ({
       transform: {
         experimentalImportSupport: false,
         inlineRequires: true,
       },
     }),
   },
 };
 