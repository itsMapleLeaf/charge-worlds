/* eslint-disable unicorn/prefer-module */
/** @type {import('@remix-run/dev').AppConfig} */
const config = {
  serverDependenciesToBundle: ["@formkit/auto-animate/react", "pretty-bytes"],
  future: {
    unstable_tailwind: true,
    unstable_cssSideEffectImports: true,
    unstable_dev: true,
  },
}

module.exports = config
