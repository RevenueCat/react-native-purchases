const path = require('path');
const exclusionList = require('metro-config/src/defaults/exclusionList');
const escape = require('escape-string-regexp');
const pak = require('../../package.json');

const root = path.resolve(__dirname, '../..');

const modules = Object.keys({
  ...pak.peerDependencies,
});

module.exports = {
  projectRoot: __dirname,
  watchFolders: [root],

  // We need to make sure that only one version is loaded for peerDependencies
  // So we blacklist them at the root, and alias them to the versions in example's node_modules
  resolver: {
    blacklistRE: exclusionList(
      modules.map(
        (m) =>
          new RegExp(`^${escape(path.join(root, 'node_modules', m))}\\/.*$`)
      )
    ),

    extraNodeModules: modules.reduce((acc, name) => {
      acc[name] = path.join(__dirname, 'node_modules', name);
      return acc;
    }, {}),

    resolveRequest: (context, realModuleName, platform, moduleName) => {
      let module = realModuleName;
        if(realModuleName.includes('@babel/runtime') || moduleName.includes('@babel/runtime')) {
          // module = module.replace('bla', 'blamos');
          // if (context.projectRoot === '/Users/joshholtz/Developer/react-native-purchases') {
          // if (!context.originModulePath) {
          // console.log("we got a babel", realModuleName, moduleName)
          if (context.originModulePath.includes('/Users/joshholtz/Developer/react-native-purchases/src')) {
            
            // console.log("context", context.originModulePath)

            const delay = 100;
            var start = new Date().getTime();
            while (new Date().getTime() < start + delay);

            var extension = '.js'
            if (realModuleName.includes('regenerator')) {
              extension = '/index.js'
            }

            let res = {
              type: 'sourceFile',
              filePath: context.projectRoot + '/node_modules/' + realModuleName + extension
            };
            // console.log(res)
            return res
          }
        }
        const { resolveRequest: removed, ...restContext } = context;
        // console.log('restContext', restContext)
        let res = require("metro-resolver").resolve(restContext, module, platform);
        // console.log(res)
        return res
    },
  },

  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};
