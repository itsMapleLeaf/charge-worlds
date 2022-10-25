import { charactersModule } from "../characters/characters-module"
import { clocksModule } from "../clocks/clocks-module"
import { counterModule } from "./counter-module"
import type { DashboardModule } from "./dashboard-module"

export const dashboardModuleLibrary: Record<string, DashboardModule<any, any>> = {
  characters: charactersModule,
  clocks: clocksModule,
  counter: counterModule,
}
