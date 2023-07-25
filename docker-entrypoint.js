#!/usr/bin/env node

const { spawn } = require("node:child_process")

const env = { ...process.env }

;(async () => {
  const command = process.argv.slice(2).join(" ")

  // If running the web server then migrate existing database
  if (
    command === "node /app/node_modules/@remix-run/serve/dist/cli.js /app/build"
  ) {
    await exec("npx prisma migrate deploy")
  }

  // launch application
  await exec(command)
})()

function exec(command) {
  const child = spawn(command, { shell: true, stdio: "inherit", env })
  return new Promise((resolve, reject) => {
    child.on("exit", (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`${command} failed rc=${code}`))
      }
    })
  })
}
