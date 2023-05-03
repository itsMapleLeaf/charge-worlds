/* eslint-disable unicorn/prefer-module */
/** @type {import('@remix-run/dev').AppConfig} */
const config = {
  serverDependenciesToBundle: ["@formkit/auto-animate/react", "pretty-bytes"],
  // serverModuleFormat: "cjs",
  postcss: true,
  future: {
    v2_errorBoundary: true,
    v2_meta: true,
    v2_normalizeFormMethod: true,
    v2_routeConvention: true,
    // unstable_dev: true,
  },
  watchPaths: ["./uno.config.ts"],
}

module.exports = config
