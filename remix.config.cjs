/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  serverDependenciesToBundle: ["@formkit/auto-animate/react", "pretty-bytes"],
  serverModuleFormat: "cjs",
  postcss: true,
  future: {
    v2_errorBoundary: true,
    v2_meta: true,
    v2_normalizeFormMethod: true,
    v2_routeConvention: true,
    v2_dev: true,
    v2_headers: true,
  },
  watchPaths: ["styled-system"],
}
