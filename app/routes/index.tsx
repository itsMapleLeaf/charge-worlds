import { redirect } from "@remix-run/node"
import { route } from "routes-gen"

export const loader = () => redirect(route("/dashboard"))
