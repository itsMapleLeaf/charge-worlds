const sessionKey = "sessionId"

export function getSessionId() {
	return localStorage.getItem(sessionKey)
}

export function setSessionId(sessionId: string) {
	localStorage.setItem(sessionKey, sessionId)
}

export function clearSessionId() {
	localStorage.removeItem(sessionKey)
}
