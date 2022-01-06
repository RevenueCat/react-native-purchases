/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

// IMPORTANT
// Make sure `npm install` is run in this refernced package's directory
// This package will be looking for node_modules in its own directory
const packagePath = require('path').resolve('../../');
 
 module.exports = {
   resolver: {
     // Tells metro to look at for `react-native-purchases`
     // This fixes issues with referencing file in package.json which 
     // creates a symlink and metro can't handle symlinks
     nodeModulesPaths: [packagePath], 

     // Tells metro to first look in the package.json's source,then react-native then main
     // This is needed so that metro uses the 'source' for `react-native-purchases` and
     // not the 'dist'
     resolverMainFields: ['source', 'react-native', 'main'], // will first look the source then main
   },

   // Metro will automatically update when something is changed in this path
   watchFolders: [
     packagePath
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
 