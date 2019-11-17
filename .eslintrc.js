module.exports = {
  root: true,
  env: {
    node: true
  },
  plugins: ["prettier"],
  rules: {
    "prettier/prettier": "error",
    "no-prototype-builtins": "off",
    "no-useless-escape": "off"
  },
  parserOptions: {
    parser: "babel-eslint"
  },
  env: {
    es6: true
  }
};
