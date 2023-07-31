import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useEffectEvent } from "~/helpers/useEffectEvent"

export function AuthCallback() {
  const navigate = useNavigate()

  const storeSessionId = useEffectEvent(() => {
    const url = new URL(window.location.href)
    const sessionId = url.searchParams.get("sessionId")
    if (sessionId) {
      localStorage.setItem("sessionId", sessionId)
    } else {
      console.error("No sessionId found in callback URL")
    }
    navigate("/")
  })
  useEffect(storeSessionId, [storeSessionId])

  return null
}
