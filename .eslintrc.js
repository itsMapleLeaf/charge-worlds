/** @type {import('eslint').Linter.Config} */
module.exports = {
  plugins: ["tailwindcss", "prettier"],
  extends: [
    "@remix-run/eslint-config",
    "@remix-run/eslint-config/node",
    "plugin:tailwindcss/recommended",
  ],
  rules: {
    "prettier/prettier": "warn",
    "@typescript-eslint/consistent-type-imports": [
      "warn",
      { fixStyle: "inline-type-imports" },
    ],
    "tailwindcss/migration-from-tailwind-2": "off",
  },
}
