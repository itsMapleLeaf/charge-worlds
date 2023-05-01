/* eslint-disable unicorn/prefer-module */
/** @type {import('@remix-run/dev').AppConfig} */
const config = {
  serverDependenciesToBundle: ["@formkit/auto-animate/react", "pretty-bytes"],
  future: {
    v2_errorBoundary: true,
    v2_meta: true,
    v2_normalizeFormMethod: true,
    v2_routeConvention: true,
    unstable_cssSideEffectImports: true,
    unstable_dev: true,
    unstable_postcss: true,
  },
  watchPaths: ["./uno.config.ts"],
}

module.exports = config
