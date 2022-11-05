// the default remix live reload reloads before the server is actually up,
// and this custom one pings the server to make sure it's up before reloading

/**
 * @param {RequestInfo | URL} url
 * @param {RequestInit=} options
 * @param {number=} timeout
 * @returns {Promise<Response>}
 */
async function fetchWithTimeout(url, options, timeout = 1000) {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)
  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } finally {
    clearTimeout(id)
  }
}

/**
 * @param {number | undefined} ms
 * @returns {Promise<void>}
 */
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function tryReload() {
  while (true) {
    await delay(500)
    try {
      const response = await fetchWithTimeout("/up", {}, 500)
      if (response.ok) break
    } catch (error) {}
  }
  window.location.reload()
}

let protocol = location.protocol === "https:" ? "wss:" : "ws:"
let host = location.hostname
let socketPath = `${protocol}//${host}:8002/socket`

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
