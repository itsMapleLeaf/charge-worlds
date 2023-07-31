import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useEffectEvent } from "~/helpers/useEffectEvent"
import { setSessionId } from "~/session"

export function AuthCallback() {
  const navigate = useNavigate()

  const storeSessionId = useEffectEvent(() => {
    const url = new URL(window.location.href)
    const sessionId = url.searchParams.get("sessionId")
    if (sessionId) {
      setSessionId(sessionId)
    } else {
      console.error("No sessionId found in callback URL")
    }
    navigate("/")
  })
  useEffect(storeSessionId, [storeSessionId])

  return null
}
