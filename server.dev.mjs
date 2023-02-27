// @ts-check
import { createRequestHandler } from "@remix-run/express"
import express from "express"
import build from "./build/index.js"

const app = express()
app.use(express.static("public"))
app.use(createRequestHandler({ build, mode: process.env.NODE_ENV }))

const port = Number(process.env.PORT) || 3000
app.listen(port, () => {
  console.info(`Listening at http://localhost:${port}`)
})
