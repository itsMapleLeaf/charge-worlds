import {
  CardDashboard,
  CardDashboardControls,
  CardDashboardLayout,
  CreateCardButton,
} from "~/components/card-dashboard"

export default function LibraryPage() {
  return (
    <section aria-label="Library">
      <CardDashboardLayout>
        <CardDashboardControls>
          <CreateCardButton />
        </CardDashboardControls>
        <CardDashboard />
      </CardDashboardLayout>
    </section>
  )
}
