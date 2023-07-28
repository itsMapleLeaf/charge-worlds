/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: ["@remix-run/eslint-config"],
  env: {
    browser: true,
    node: true,
  },
  ignorePatterns: ["node_modules/**", "build/**", "public/build/**", "convex"],
  parserOptions: {
    project: require.resolve("./tsconfig.json"),
  },
  overrides: [
    {
      files: ["convex/**"],
      excludedFiles: ["convex/_generated/**"],
      parserOptions: {
        project: require.resolve("./convex/tsconfig.json"),
      },
    },
  ],
}
