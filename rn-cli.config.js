module.exports = {
  getTransformModulePath() {
    return require.resolve("react-native-typescript-transformer");
  },
  getSourceExts() {
    return ["ts", "tsx"];
  },
  transformer: {
    babelTransformerPath: require.resolve("react-native-typescript-transformer"),
  },
};
