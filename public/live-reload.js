// the default remix live reload reloads before the server is actually up,
// and this custom one pings the server to make sure it's up before reloading

function tryReload() {
  /** @type {AbortController | undefined} */
  let controller
  let interval = setInterval(() => {
    controller?.abort()
    controller = new AbortController()
    fetch("/", { signal: controller.signal })
      .then((response) => {
        if (response.ok) {
          clearInterval(interval)
          window.location.reload()
        }
      })
      .catch(() => {})
  }, 500)
}

let protocol = location.protocol === "https:" ? "wss:" : "ws:"
let host = location.hostname
let socketPath = protocol + "//" + host + ":" + 8002 + "/socket"

let ws = new WebSocket(socketPath)
ws.addEventListener("message", (message) => {
  let event = JSON.parse(message.data)
  if (event.type === "LOG") {
    console.log(event.message)
  }
  if (event.type === "RELOAD") {
    console.log("💿 Reloading window ...")
    tryReload()
  }
})
ws.addEventListener("close", () => {
  console.log("Remix dev asset server web socket closed. Reconnecting...")
  tryReload()
})
ws.addEventListener("error", (error) => {
  console.log("Remix dev asset server web socket error:")
  console.error(error)
})
