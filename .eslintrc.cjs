/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: ["@remix-run/eslint-config"],
  env: {
    browser: true,
    node: true,
  },
  ignorePatterns: ["node_modules/**", "build/**", "public/build/**"],
  parserOptions: {
    project: require.resolve("./tsconfig.json"),
  },
}
