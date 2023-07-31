/** @type {import('eslint').Linter.Config} */
module.exports = {
	root: true,
	extends: [
		"eslint:recommended",
		"plugin:react/recommended",
		"plugin:react/jsx-runtime",
		"plugin:react-hooks/recommended",
		"plugin:@typescript-eslint/recommended",
	],
	env: {
		browser: true,
		node: true,
	},
	ignorePatterns: [
		"node_modules",
		"dist",
		"styled-system",
		"convex/_generated",
	],
	parser: "@typescript-eslint/parser",
	parserOptions: {
		ecmaVersion: "latest",
	},
	settings: {
		react: {
			version: "detect",
		},
	},
	rules: {
		"@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
	},
	overrides: [
		{
			env: {
				node: true,
			},
			files: [".eslintrc.{js,cjs}"],
			parserOptions: {
				sourceType: "script",
			},
		},
		{
			files: ["**/*.{ts,tsx}"],
			extends: [
				"plugin:@typescript-eslint/recommended-requiring-type-checking",
			],
			rules: {
				"@typescript-eslint/await-thenable": "off",
				"@typescript-eslint/require-await": "off",
			},
			parserOptions: {
				project: require.resolve("./tsconfig.json"),
			},
		},
		{
			files: ["convex/**"],
			excludedFiles: ["convex/_generated/**"],
			parserOptions: {
				project: require.resolve("./convex/tsconfig.json"),
			},
		},
	],
}
