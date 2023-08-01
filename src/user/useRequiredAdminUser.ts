import { api } from "convex/_generated/api"
import { useQuerySuspense } from "~/convex"
import { AppError } from "~/errors/AppError"
import { getSessionId } from "~/session"

export function useRequiredAdminUser() {
	const sessionId = getSessionId()
	const me = useQuerySuspense(api.auth.me, { sessionId })
	if (sessionId && me.user?.isAdmin) {
		return { user: me.user, sessionId }
	}
	throw new AppError("You must be an admin to access this page.")
}
