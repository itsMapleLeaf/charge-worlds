/* eslint-disable unicorn/prefer-module */
/** @type {import('@remix-run/dev').AppConfig} */
const config = {
  serverDependenciesToBundle: ["@formkit/auto-animate/react"],
  future: {
    v2_routeConvention: true,
    unstable_tailwind: true,
    unstable_cssSideEffectImports: true,
  },
}

if (process.env.VERCEL) {
  config.server = "./server.vercel.ts"
  config.serverBuildPath = "api/index.js"
}

module.exports = config
