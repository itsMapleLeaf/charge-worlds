/* eslint-disable unicorn/prefer-module */
/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  devServerPort: 8002,
  future: {
    v2_routeConvention: true,
    unstable_tailwind: true,
    unstable_cssSideEffectImports: true,
  },
  serverDependenciesToBundle: ["@formkit/auto-animate/react"]
}
