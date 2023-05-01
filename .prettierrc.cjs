/** @type {import('prettier').Config} */
module.exports = {
  ...require("@itsmapleleaf/configs/prettier"),

  // the base prettier config includes tailwindcss,
  // which errors when there's no tailwind config
  plugins: [],
  pluginSearchDirs: false,
}
