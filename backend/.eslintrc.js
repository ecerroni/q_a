// http://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  parser: "babel-eslint",
  parserOptions: {
    sourceType: "module",
    allowImportExportEverywhere: false,
    codeFrame: false
  },
  rules: {
    "comma-dangle": [
      1,
      {
        arrays: "always-multiline",
        objects: "always-multiline",
        imports: "always-multiline",
        exports: "always-multiline",
        functions: "ignore"
      }
    ],
    semi: [1, "always"],
    quotes: [2, "double", { avoidEscape: true }],
    "max-len": ["error", { code: 150 }],
    "prefer-promise-reject-errors": ["off"],
    "import/prefer-default-export": "off",
    "no-return-assign": ["off"],
    "no-underscore-dangle": "off",
    // TODO: find out why "import/resolver": "babel-plugin-root-import" is not working
    // then dismiss the following 2 rules
    "import/no-unresolved": "off",
    "import/extensions": "off",
    "prettier/prettier": [
      "error",
      {
        semi: true,
        doubleQuote: true,
        tabwidth: 2,
        trailingComma: "all"
      }
    ]
  },
  settings: {
    "import/resolver": "babel-plugin-root-import"
  },
  plugins: ["import", "prettier"]
};
