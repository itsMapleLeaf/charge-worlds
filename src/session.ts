import { Id } from "convex/_generated/dataModel"
import { raise } from "~/errors/helpers"
import { AppError } from "./errors/AppError"

const sessionKey = "sessionId"

export function setSessionId(sessionId: Id<"sessions">) {
	localStorage.setItem(sessionKey, sessionId)
}

export function clearSessionId() {
	localStorage.removeItem(sessionKey)
}

export function getSessionId() {
	return localStorage.getItem(sessionKey) as Id<"sessions"> | null
}

export function getRequiredSessionId() {
	return getSessionId() ?? raise(new AppError("Not logged in"))
}
