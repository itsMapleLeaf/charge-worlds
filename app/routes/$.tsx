import { notFound } from "~/helpers/responses"
import { getAppMeta } from "~/meta"
import { NotFoundMessage } from "~/ui/not-found-message"

export const meta = () => getAppMeta({ title: "Not Found" })
export const loader = () => notFound()
export default NotFoundMessage
