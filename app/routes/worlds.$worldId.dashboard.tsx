import { useParams } from "@remix-run/react"
import { DashboardMosaic } from "../dashboard/dashboard"

export default function DashboardPage() {
  const params = useParams()
  return <DashboardMosaic worldId={params.worldId!} />
}
