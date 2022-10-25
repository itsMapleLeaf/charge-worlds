import "dotenv/config"

import * as serverBuild from "@remix-run/dev/server-build"
import { createRequestHandler } from "@remix-run/express"
import compression from "compression"
import express from "express"
import morgan from "morgan"
import { createSocketServer } from "./dashboard/socket-server"

const port = process.env.PORT || 3000

const app = express()
// http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
app.disable("x-powered-by")

app.get("/up", (req, res) => res.send("ok"))

app.use(compression())

app.use(
  "/build",
  express.static("public/build", { immutable: true, maxAge: "1y" }),
)
app.use(express.static("public", { maxAge: "1h" }))

app.use(morgan("tiny"))
app.use(
  createRequestHandler({ build: serverBuild, mode: process.env.NODE_ENV }),
)

const httpServer = app.listen(port, () => {
  console.info(`listening on http://localhost:${port}`)
})
createSocketServer(httpServer)
