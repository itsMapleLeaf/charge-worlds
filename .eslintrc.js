/** @type {import('eslint').Linter.Config} */
module.exports = {
  plugins: ["tailwindcss"],
  extends: [
    "@remix-run/eslint-config",
    "@remix-run/eslint-config/node",
    "plugin:tailwindcss/recommended",
  ],
  rules: {
    "@typescript-eslint/consistent-type-imports": [
      "warn",
      { fixStyle: "inline-type-imports" },
    ],
    "tailwindcss/migration-from-tailwind-2": "off",
  },
}
