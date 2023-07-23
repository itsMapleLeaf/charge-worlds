/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: ["@remix-run/eslint-config"],
  ignorePatterns: ["node_modules/**", "build/**", "public/build/**"],
  parserOptions: {
    project: require.resolve("./tsconfig.json"),
  },
};
