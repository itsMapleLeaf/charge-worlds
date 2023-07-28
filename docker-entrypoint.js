#!/usr/bin/env node

const { spawn } = require("node:child_process")

const env = { ...process.env }

;(async () => {
  try {
    await exec(process.argv.slice(2).join(" "))
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
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
