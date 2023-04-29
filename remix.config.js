/* eslint-disable unicorn/prefer-module */
/** @type {import('@remix-run/dev').AppConfig} */
const config = {
  serverDependenciesToBundle: ["@formkit/auto-animate/react", "pretty-bytes"],
  future: {
    v2_errorBoundary: true,
    v2_meta: true,
    unstable_tailwind: true,
    unstable_cssSideEffectImports: true,
    unstable_dev: true,
  },
}

module.exports = config
