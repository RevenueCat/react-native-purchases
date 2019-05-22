module.exports = {
  parser: "babel-eslint",
  env: {
    browser: true,
    jest: true
  },
  rules: {
    "react/jsx-filename-extension": ["warn", { extensions: [".js"] }],
    "prettier/prettier": "error",
    "react/destructuring-assignment": "off",
    "trailing commas": "all",
    "no-console": "error"
  },
  extends: ["airbnb", "prettier", "prettier/react"],
  plugins: ["jest", "prettier", "emotion"]
};
