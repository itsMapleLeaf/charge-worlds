/* eslint-disable unicorn/prefer-module */
// @ts-expect-error
const { flatRoutes } = require("remix-flat-routes")

/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  devServerPort: 8002,
  ignoredRouteFiles: ["**/*"],
  routes: async (defineRoutes) => flatRoutes("routes", defineRoutes),
}
