module.exports = {
  root: true,
  env: { browser: true, node: true, es2021: true },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:prettier/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: { jsx: true },
    ecmaVersion: 2021,
    sourceType: "module",
  },
  plugins: ["@typescript-eslint", "react"],
  rules: {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "react/react-in-jsx-scope": "off",
    "prettier/prettier": [
      "error",
      {
        endOfLine: "auto",
      },
    ],
  },
  ignorePatterns: [
    "dist/**",
    "node_modules/**",
    "tests/**",
    "**/*.test.ts",
    "webpack.config.js",
    "jest.config.js",
  ],
};
