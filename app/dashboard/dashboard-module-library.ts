import { counterModule } from "./counter-module"
import type { DashboardModule } from "./dashboard-module"

export const dashboardModuleLibrary: Record<
  string,
  DashboardModule<any, any>
> = {
  counterModule,
}
