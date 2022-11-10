import { charactersModule } from "../characters/characters-module"
import { counterModule } from "./counter-module"
import type { DashboardModule } from "./dashboard-module"

export const dashboardModuleLibrary: Record<
  string,
  DashboardModule<any, any>
> = {
  characters: charactersModule,
  counter: counterModule,
}
